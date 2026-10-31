export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'stdout' | 'port';

export interface ConsoleOptions {
  onInput?: (input: string) => void;
}

const CGA_PALETTE = [
  '#000000', '#0000aa', '#00aa00', '#00aaaa',
  '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa',
  '#555555', '#5555ff', '#55ff55', '#55ffff',
  '#ff5555', '#ff55ff', '#ffff55', '#ffffff'
];

// Standard 256-color VGA/DAC Palette for Mode 13h (320x200 graphics)
const VGA_256_RGB: [number, number, number][] = (() => {
  const palette: [number, number, number][] = [];
  const cgaHex = [
    0x000000, 0x0000aa, 0x00aa00, 0x00aaaa,
    0xaa0000, 0xaa00aa, 0xaa5500, 0xaaaaaa,
    0x555555, 0x5555ff, 0x55ff55, 0x55ffff,
    0xff5555, 0xff55ff, 0xffff55, 0xffffff
  ];
  for (const h of cgaHex) {
    palette.push([(h >> 16) & 0xff, (h >> 8) & 0xff, h & 0xff]);
  }
  // 16-31: 16 shades of gray
  for (let i = 0; i < 16; i++) {
    const val = Math.round((i / 15) * 255);
    palette.push([val, val, val]);
  }
  // 32-255: 216 colors (6x6x6 color cube / standard VGA rainbow)
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        palette.push([Math.round((r / 5) * 255), Math.round((g / 5) * 255), Math.round((b / 5) * 255)]);
      }
    }
  }
  while (palette.length < 256) {
    palette.push([0, 0, 0]);
  }
  return palette;
})();

/**
 * 1981 IBM PC (Model 5150) / 5153 CRT Renkli Monitör
 * Donanımsal CGA/VGA Metin VRAM (0xB8000, 80x25) ve
 * VGA Mod 13h Grafik VRAM (0xA0000, 320x200) tamponunu doğrudan tarar.
 */
export class ConsoleView {
  private container: HTMLElement;
  private logs: { text: string; level: LogLevel; timestamp: string }[] = [];
  private onInput?: (input: string) => void;
  private isWaiting: boolean = false;

  // View Mode: 'monitor' (Tek CRT Monitör) | 'logs' (Sistem Logları)
  private activeViewMode: 'monitor' | 'logs' = 'monitor';
  private colorMode: 'vga' | 'green' | 'amber' = 'vga';

  // Video Mode: 0x03 (80x25 Metin) veya 0x13 (320x200 Grafik)
  private videoMode: number = 0x03;

  // Cursor state (from BDA 0040:0050h)
  private cursorRow: number = 0;
  private cursorCol: number = 0;
  private cursorBlink: boolean = true;
  private blinkTimer: number | null = null;

  // 4000-byte Text VRAM snapshot (0xB8000 - 0xB8FA0)
  private vramData: Uint8Array = new Uint8Array(4000);

  // 64000-byte Graphics VRAM snapshot for Mode 13h (0xA0000 - 0xAFA00)
  private graphicsData: Uint8Array = new Uint8Array(64000);

  // Cached canvas context for Mode 13h
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private canvasImgData: ImageData | null = null;

  // Render throttle via requestAnimationFrame to prevent main thread lockup
  private vramDirty: boolean = false;
  private animFrameId: number | null = null;

  constructor(container: HTMLElement, options?: ConsoleOptions) {
    this.container = container;
    this.onInput = options?.onInput;

    // Initialize text VRAM with blank spaces
    for (let i = 0; i < 2000; i++) {
      this.vramData[i * 2] = 0x20;     // ' '
      this.vramData[i * 2 + 1] = 0x07; // Light gray on black
    }

    this.render();
    this.startBlinkTimer();
  }

  destroy(): void {
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  setOnInput(callback: (input: string) => void): void {
    this.onInput = callback;
  }

  private startBlinkTimer(): void {
    if (this.blinkTimer) clearInterval(this.blinkTimer);
    this.blinkTimer = window.setInterval(() => {
      this.cursorBlink = !this.cursorBlink;
      if (this.activeViewMode === 'monitor' && this.videoMode !== 0x13) {
        const cursorEl = this.container.querySelector('.crt-hardware-cursor') as HTMLElement | null;
        if (cursorEl) {
          cursorEl.style.opacity = this.cursorBlink ? '1' : '0';
        }
      }
    }, 500);
  }

  log(text: string, level: LogLevel = 'info'): void {
    const time = new Date().toLocaleTimeString();
    this.logs.push({ text, level, timestamp: time });
    this.appendLog(text, level, time);
  }

  appendStdout(charOrStr: string): void {
    if (charOrStr.trim()) {
      this.log(charOrStr.trim(), 'stdout');
    }
  }

  setWaitingForInput(waiting: boolean, hint?: string): void {
    this.isWaiting = waiting;
    const badge = this.container.querySelector('#console-status-badge');
    const input = this.container.querySelector('#console-input-field') as HTMLInputElement | null;

    if (badge) {
      if (waiting) {
        badge.textContent = hint || 'GİRDİ BEKLENİYOR';
        badge.className = 'console-status-badge waiting';
      } else {
        badge.textContent = 'HAZIR';
        badge.className = 'console-status-badge ready';
      }
    }

    if (waiting && input) {
      input.focus();
    }
  }

  clear(): void {
    for (let i = 0; i < 2000; i++) {
      this.vramData[i * 2] = 0x20;
      this.vramData[i * 2 + 1] = 0x07;
    }
    this.graphicsData.fill(0);
    this.cursorCol = 0;
    this.cursorRow = 0;
    this.logs = [];
    const output = this.container.querySelector('#console-output');
    if (output) output.innerHTML = '';
    this.refreshCrtScreen();
  }

  /**
   * Syncs entire 1 MB RAM snapshot with the CRT Monitor.
   * Checks BDA 0040:0049h for Video Mode (03h text vs 13h graphics).
   */
  updateVram(memoryAll: Uint8Array): void {
    if (memoryAll.length >= 0x0450) {
      const mode = memoryAll[0x0449] || 0x03;
      this.videoMode = mode;
      this.cursorCol = Math.min(79, memoryAll[0x0450] || 0);
      this.cursorRow = Math.min(24, memoryAll[0x0451] || 0);
    }

    // Text VRAM (0xB8000 - 0xB8FA0)
    if (memoryAll.length >= 0xB8000 + 4000) {
      this.vramData.set(memoryAll.subarray(0xB8000, 0xB8000 + 4000));
    }

    // Graphics VRAM for Mode 13h (0xA0000 - 0xAFA00, 64000 bytes)
    if (memoryAll.length >= 0xA0000 + 64000) {
      this.graphicsData.set(memoryAll.subarray(0xA0000, 0xA0000 + 64000));
    }

    this.vramDirty = true;
    this.scheduleRender();
  }

  private scheduleRender(): void {
    if (this.animFrameId !== null) return;
    this.animFrameId = window.requestAnimationFrame(() => {
      this.animFrameId = null;
      if (this.vramDirty && this.activeViewMode === 'monitor') {
        this.vramDirty = false;
        this.refreshCrtScreen();
      }
    });
  }

  private render(): void {
    const isGraphics = this.videoMode === 0x13;
    const modeTitle = isGraphics ? 'IBM CRT MONİTÖR (Mod 13h: 320x200 Grafik)' : 'IBM 5153 CRT MONİTÖR (80x25 Metin)';

    this.container.innerHTML = `
      <div class="console-box" style="display: flex; flex-direction: column; height: 100%; background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-dark);">
        <!-- Top Monitor Toolbar Bar -->
        <div class="console-header-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background: #1e293b; border-bottom: 1px solid #334155;">
          <div class="console-header-left" style="display: flex; align-items: center; gap: 8px;">
            <span class="console-terminal-icon" style="font-size: 15px;">🖥️</span>
            <span class="console-title" id="crt-monitor-title" style="font-size: 12px; font-weight: 700; color: #f8fafc; letter-spacing: 0.5px;">${modeTitle}</span>
            <span class="console-status-badge ready" id="console-status-badge" style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #059669; color: #ffffff; font-weight: 700;">HAZIR</span>

            <!-- View Switcher -->
            <div class="monitor-tab-group" style="display: inline-flex; background: #0f172a; padding: 2px; border-radius: 6px; gap: 2px; border: 1px solid #334155; margin-left: 6px;">
              <button class="btn-mon-tab ${this.activeViewMode === 'monitor' ? 'active' : ''}" data-mode="monitor" title="Tek ve Orijinal CRT Monitörü">
                🖥️ CRT Monitör
              </button>
              <button class="btn-mon-tab ${this.activeViewMode === 'logs' ? 'active' : ''}" data-mode="logs" title="Sistem ve Derleyici Logları">
                📋 Sistem Logları
              </button>
            </div>
          </div>

          <div class="console-header-right" style="display: flex; align-items: center; gap: 8px;">
            <!-- Phosphor Palette Selector -->
            <div class="crt-mini-palettes" style="display: inline-flex; gap: 3px;">
              <button class="btn-mini-pal ${this.colorMode === 'vga' ? 'active' : ''}" data-pal="vga" title="CGA / RGB Renkli Monitör">CGA</button>
              <button class="btn-mini-pal ${this.colorMode === 'green' ? 'active' : ''}" data-pal="green" title="IBM 5151 Yeşil Fosfor Monitör">GRN</button>
              <button class="btn-mini-pal ${this.colorMode === 'amber' ? 'active' : ''}" data-pal="amber" title="Kehribar Fosfor Monitör">AMB</button>
            </div>
            <button id="btn-console-clear" class="btn-console-clear" title="Ekranı ve Logları Temizle" style="padding: 3px 8px; font-size: 11px; background: #334155; border: 1px solid #475569; color: #e2e8f0; border-radius: 4px; cursor: pointer;">Temizle</button>
          </div>
        </div>

        <!-- Body 1: Authentic Single CRT Screen (Text or Mode 13h Canvas) -->
        <div class="crt-screen-wrapper ${this.activeViewMode === 'monitor' ? 'active' : ''}" id="crt-view-wrapper" style="flex: 1; min-height: 0; position: relative; background: #000000; overflow: hidden; display: ${this.activeViewMode === 'monitor' ? 'flex' : 'none'}; flex-direction: column;">
          <div class="crt-screen-box ${this.colorMode}" id="crt-screen-box" tabindex="0" style="flex: 1; padding: 10px 12px; overflow: auto; position: relative; background: #010409; font-family: 'JetBrains Mono', Consolas, monospace; cursor: text; box-shadow: inset 0 0 30px rgba(0,0,0,0.95);">
            <div class="crt-scanlines"></div>
            <div class="crt-glow"></div>
            <div class="crt-content" id="crt-screen-content" style="position: relative; z-index: 2; font-size: 11.5px; line-height: 1.25; letter-spacing: 0.5px; min-width: 650px; user-select: none;">
              ${this.renderCrtContent()}
            </div>
          </div>
        </div>

        <!-- Body 2: Standard System & Compiler Diagnostics Log -->
        <div class="console-body ${this.activeViewMode === 'logs' ? 'active' : ''}" id="console-output" style="flex: 1; min-height: 0; padding: 8px 12px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; background: #020617; color: #cbd5e1; display: ${this.activeViewMode === 'logs' ? 'block' : 'none'};"></div>

        <!-- Bottom Hardware Keyboard Input Bar -->
        <div class="console-input-wrap" id="console-input-wrap" style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #0f172a; border-top: 1px solid #1e293b;">
          <span class="console-prompt-sym" style="color: #38bdf8; font-weight: 700; font-size: 13px;">❯</span>
          <input type="text" id="console-input-field" class="console-input-field" placeholder="Klavye girdisi (Port 60h / INT 16h / INT 21h)..." autocomplete="off" style="flex: 1; background: #020617; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px; color: #f8fafc; font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none;" />
          <button id="btn-console-send" class="btn-console-send" title="Gönder" style="padding: 4px 10px; font-size: 11px; font-weight: 600; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; cursor: pointer;">Gönder</button>
        </div>
      </div>
    `;

    this.bindEvents();
    if (this.videoMode === 0x13) {
      this.paintGraphicsCanvas();
    }
  }

  private renderCrtContent(): string {
    if (this.videoMode === 0x13) {
      return `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
          <canvas id="crt-graphics-canvas" width="320" height="200" style="width: 100%; max-width: 640px; aspect-ratio: 320/200; image-rendering: pixelated; display: block; border-radius: 4px; box-shadow: 0 0 25px rgba(0,0,0,0.9); background: #000000;"></canvas>
        </div>
      `;
    }

    let output = '';
    const isMonoGreen = this.colorMode === 'green';
    const isMonoAmber = this.colorMode === 'amber';

    for (let row = 0; row < 25; row++) {
      let rowHtml = '';
      for (let col = 0; col < 80; col++) {
        const offset = (row * 80 + col) * 2;
        const charCode = this.vramData[offset] ?? 32;
        const attr = this.vramData[offset + 1] ?? 0x07;
        const char = (charCode < 32 || charCode > 126) ? (charCode === 0 ? ' ' : '•') : String.fromCharCode(charCode);

        const isCursor = (row === this.cursorRow && col === this.cursorCol);

        if (isCursor) {
          const cursorOpacity = this.cursorBlink ? '1' : '0';
          if (isMonoGreen) {
            rowHtml += `<span class="crt-hardware-cursor" style="color: #4ade80; background: #14532d; font-weight: 800; opacity: ${cursorOpacity}; transition: opacity 0.1s;">_</span>`;
          } else if (isMonoAmber) {
            rowHtml += `<span class="crt-hardware-cursor" style="color: #fbbf24; background: #78350f; font-weight: 800; opacity: ${cursorOpacity}; transition: opacity 0.1s;">_</span>`;
          } else {
            rowHtml += `<span class="crt-hardware-cursor" style="color: #ffffff; background: #1e3a8a; font-weight: 800; opacity: ${cursorOpacity}; transition: opacity 0.1s;">_</span>`;
          }
        } else {
          if (isMonoGreen) {
            const isBright = (attr & 0x08) !== 0;
            const color = isBright ? '#4ade80' : '#22c55e';
            const bg = (attr & 0x70) !== 0 ? '#14532d' : 'transparent';
            rowHtml += `<span style="color: ${color}; background-color: ${bg};">${this.escapeHtml(char)}</span>`;
          } else if (isMonoAmber) {
            const isBright = (attr & 0x08) !== 0;
            const color = isBright ? '#fbbf24' : '#f59e0b';
            const bg = (attr & 0x70) !== 0 ? '#78350f' : 'transparent';
            rowHtml += `<span style="color: ${color}; background-color: ${bg};">${this.escapeHtml(char)}</span>`;
          } else {
            const fg = attr & 0x0F;
            const bg = (attr >> 4) & 0x07;
            const fgColor = CGA_PALETTE[fg];
            const bgColor = bg === 0 ? 'transparent' : CGA_PALETTE[bg];
            rowHtml += `<span style="color: ${fgColor}; background-color: ${bgColor};">${this.escapeHtml(char)}</span>`;
          }
        }
      }
      output += `<div class="crt-row" style="height: 14px; white-space: pre;">${rowHtml}</div>`;
    }
    return output;
  }

  private paintGraphicsCanvas(): void {
    const canvas = this.container.querySelector('#crt-graphics-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (!this.canvasCtx) {
      this.canvasCtx = canvas.getContext('2d');
    }
    if (!this.canvasCtx) return;

    if (!this.canvasImgData) {
      this.canvasImgData = this.canvasCtx.createImageData(320, 200);
    }

    const data = this.canvasImgData.data;
    const isMonoGreen = this.colorMode === 'green';
    const isMonoAmber = this.colorMode === 'amber';

    for (let i = 0; i < 64000; i++) {
      const colorIdx = this.graphicsData[i];
      let [r, g, b] = VGA_256_RGB[colorIdx] || [0, 0, 0];

      if (isMonoGreen) {
        const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        r = 0;
        g = lum;
        b = Math.round(lum * 0.2);
      } else if (isMonoAmber) {
        const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        r = lum;
        g = Math.round(lum * 0.65);
        b = 0;
      }

      const pixelOffset = i * 4;
      data[pixelOffset] = r;
      data[pixelOffset + 1] = g;
      data[pixelOffset + 2] = b;
      data[pixelOffset + 3] = 255;
    }

    this.canvasCtx.putImageData(this.canvasImgData, 0, 0);
  }

  private refreshCrtScreen(): void {
    const titleEl = this.container.querySelector('#crt-monitor-title');
    if (titleEl) {
      titleEl.textContent = this.videoMode === 0x13
        ? 'IBM CRT MONİTÖR (Mod 13h: 320x200 Grafik)'
        : 'IBM 5153 CRT MONİTÖR (80x25 Metin)';
    }

    if (this.videoMode === 0x13) {
      const content = this.container.querySelector('#crt-screen-content');
      if (content && !content.querySelector('#crt-graphics-canvas')) {
        content.innerHTML = this.renderCrtContent();
        this.canvasCtx = null;
        this.canvasImgData = null;
      }
      this.paintGraphicsCanvas();
    } else {
      const content = this.container.querySelector('#crt-screen-content');
      if (content) {
        content.innerHTML = this.renderCrtContent();
      }
    }
  }

  private appendLog(text: string, level: LogLevel, time: string): void {
    const output = this.container.querySelector('#console-output');
    if (!output) return;

    const row = document.createElement('div');
    row.className = `console-log-row log-${level}`;
    row.style.padding = '2px 0';
    row.innerHTML = `
      <span class="log-time" style="color: #64748b; font-size: 10.5px; margin-right: 6px;">${time}</span>
      <span class="log-level-badge" style="font-size: 9.5px; padding: 1px 4px; border-radius: 3px; font-weight: 700; margin-right: 6px; background: #334155; color: #94a3b8;">${level.toUpperCase()}</span>
      <span class="log-text">${this.escapeHtml(text)}</span>
    `;
    output.appendChild(row);
    output.scrollTop = output.scrollHeight;
  }

  private bindEvents(): void {
    // Mode switcher buttons (CRT Monitor vs System Logs)
    this.container.querySelectorAll<HTMLButtonElement>('.btn-mon-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as 'monitor' | 'logs';
        if (mode) {
          this.activeViewMode = mode;
          this.container.querySelectorAll('.btn-mon-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const crtWrap = this.container.querySelector('#crt-view-wrapper') as HTMLElement | null;
          const logsOutput = this.container.querySelector('#console-output') as HTMLElement | null;

          if (crtWrap) crtWrap.style.display = mode === 'monitor' ? 'flex' : 'none';
          if (logsOutput) logsOutput.style.display = mode === 'logs' ? 'block' : 'none';

          if (mode === 'monitor') {
            this.refreshCrtScreen();
          }
        }
      });
    });

    // Color palette switcher (CGA, Green, Amber)
    this.container.querySelectorAll<HTMLButtonElement>('.btn-mini-pal').forEach(btn => {
      btn.addEventListener('click', () => {
        const pal = btn.dataset.pal as 'vga' | 'green' | 'amber';
        if (pal) {
          this.colorMode = pal;
          this.container.querySelectorAll('.btn-mini-pal').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const crtBox = this.container.querySelector('#crt-screen-box');
          if (crtBox) {
            crtBox.className = `crt-screen-box ${pal}`;
          }
          this.refreshCrtScreen();
        }
      });
    });

    // Clear Button
    const clearBtn = this.container.querySelector('#btn-console-clear');
    clearBtn?.addEventListener('click', () => this.clear());

    // Input Sender
    const sendBtn = this.container.querySelector('#btn-console-send');
    const inputField = this.container.querySelector('#console-input-field') as HTMLInputElement | null;

    const handleSend = () => {
      if (!inputField) return;
      const val = inputField.value;
      if (val) {
        this.appendStdout(val + '\n');
        this.onInput?.(val + '\r');
        inputField.value = '';
      }
    };

    sendBtn?.addEventListener('click', handleSend);
    inputField?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
