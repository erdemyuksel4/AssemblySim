export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'stdout' | 'port';

export interface ConsoleOptions {
  onInput?: (input: string) => void;
  onVideoModeChange?: (mode: number) => void;
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
  private onVideoModeChange?: (mode: number) => void;
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
    this.onVideoModeChange = options?.onVideoModeChange;

    this.initBiosBanner();
    this.render();
    this.startBlinkTimer();
  }

  private writeStringToVram(row: number, col: number, text: string, attr: number = 0x07): void {
    for (let i = 0; i < text.length; i++) {
      if (col + i >= 80) break;
      const offset = (row * 80 + col + i) * 2;
      this.vramData[offset] = text.charCodeAt(i);
      this.vramData[offset + 1] = attr;
    }
  }

  private initBiosBanner(): void {
    this.videoMode = 0x03;
    for (let i = 0; i < 2000; i++) {
      this.vramData[i * 2] = 0x20;     // ' '
      this.vramData[i * 2 + 1] = 0x07; // Light gray on black
    }
    this.writeStringToVram(0, 0, 'IBM PC 5150 / 8086 CPU 4.77 MHz - BIOS v1.0', 0x0F);
    this.writeStringToVram(1, 0, '640 KB Base Memory OK  |  BDA 0040h  |  VRAM 0xB800h (80x25 Metin)', 0x07);
    this.writeStringToVram(2, 0, '----------------------------------------------------------------', 0x08);
    this.cursorRow = 4;
    this.cursorCol = 0;
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
          cursorEl.classList.toggle('cursor-hidden', !this.cursorBlink);
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

  isWaitingForInput(): boolean {
    return this.isWaiting;
  }

  setRunningState(running: boolean): void {
    if (this.isWaiting) return;
    const badge = this.container.querySelector('#console-status-badge');
    if (badge) {
      if (running) {
        badge.textContent = 'ÇALIŞIYOR';
        badge.className = 'console-status-badge running';
      } else {
        badge.textContent = 'HAZIR';
        badge.className = 'console-status-badge ready';
      }
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

    if (waiting) {
      this.refreshCrtScreen();
      if (input) {
        input.placeholder = hint || 'Klavyeden bir tuşa basın...';
        input.focus();
      }
    } else {
      if (input) {
        input.placeholder = 'Klavye girdisi (Port 60h / INT 16h / INT 21h)...';
      }
    }
  }

  clear(): void {
    this.videoMode = 0x03;
    this.initBiosBanner();
    this.graphicsData.fill(0);
    this.canvasCtx = null;
    this.canvasImgData = null;
    this.logs = [];
    const output = this.container.querySelector('#console-output');
    if (output) output.innerHTML = '';
    this.refreshCrtScreen();
  }

  setVideoMode(mode: number): void {
    this.videoMode = mode;
    this.refreshCrtScreen();
  }

  /**
   * Syncs entire 1 MB RAM snapshot with the CRT Monitor.
   * Checks BDA 0040:0049h for Video Mode (03h text vs 13h graphics).
   */
  updateVram(memoryAll: Uint8Array): void {
    if (memoryAll.length >= 0x0450) {
      const mode = memoryAll[0x0449];
      if (mode === 0x13) {
        this.videoMode = 0x13;
      }
      this.cursorCol = Math.min(79, memoryAll[0x0450] || 0);
      this.cursorRow = Math.min(24, memoryAll[0x0451] || 0);
    }

    // Text VRAM (0xB8000 - 0xB8FA0)
    if (memoryAll.length >= 0xB8000 + 4000) {
      this.vramData.set(memoryAll.subarray(0xB8000, 0xB8000 + 4000));
    }

    // Graphics VRAM for Mode 13h (0xA0000 - 0xAFA00, 64000 bytes)
    if (memoryAll.length >= 0xA0000 + 64000) {
      const newGfx = memoryAll.subarray(0xA0000, 0xA0000 + 64000);
      this.graphicsData.set(newGfx);

      // Otomatik grafik tespiti: 0xA0000 alanına piksel yazılmışsa ekranı grafiğe al
      if (this.videoMode !== 0x13) {
        for (let i = 0; i < 64000; i += 32) {
          if (newGfx[i] !== 0) {
            this.videoMode = 0x13;
            break;
          }
        }
      }
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
    const modeBadge = isGraphics ? '13h GRAFİK (320x200)' : '03h METİN (80x25)';

    this.container.innerHTML = `
      <div class="console-box" style="display: flex; flex-direction: column; height: 100%; min-height: 320px; background: #151a24; border-radius: 8px; overflow: hidden; border: 2px solid #2a3548; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5); box-sizing: border-box;">
        <!-- IBM 5153 Monitor Bezel Header -->
        <div class="console-header-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; height: 36px; min-height: 36px; flex-shrink: 0; background: #161f2e; border-bottom: 2px solid #243044; box-sizing: border-box;">
          <div class="console-header-left" style="display: flex; align-items: center; gap: 8px;">
            <span class="crt-power-led" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e;"></span>
            <span class="console-title" style="font-size: 11px; font-weight: 800; color: #f1f5f9; letter-spacing: 0.8px;">IBM 5153 CRT MONİTÖR</span>
            <span class="crt-mode-badge" id="crt-monitor-title" style="font-size: 9.5px; font-weight: 700; padding: 1px 6px; border-radius: 3px; background: #1e293b; color: #38bdf8; border: 1px solid #334155;">${modeBadge}</span>
            <span class="console-status-badge ready" id="console-status-badge" style="font-size: 9.5px; padding: 1px 6px; border-radius: 3px; background: #059669; color: #ffffff; font-weight: 700;">HAZIR</span>

            <!-- View Switcher (Monitör vs Sistem Logları) -->
            <div class="monitor-tab-group" style="display: inline-flex; background: #090d14; padding: 2px; border-radius: 5px; gap: 2px; border: 1px solid #334155; margin-left: 6px;">
              <button class="btn-mon-tab ${this.activeViewMode === 'monitor' ? 'active' : ''}" data-mode="monitor" title="Orijinal CRT Monitörü">
                🖥️ Monitör
              </button>
              <button class="btn-mon-tab ${this.activeViewMode === 'logs' ? 'active' : ''}" data-mode="logs" title="Sistem ve Derleyici Logları">
                📋 Sistem Logları
              </button>
            </div>

            <!-- Video Modu Seçici (80x25 Metin vs 320x200 Grafik) -->
            <div class="video-mode-group" style="display: inline-flex; background: #090d14; padding: 2px; border-radius: 5px; gap: 2px; border: 1px solid #334155; margin-left: 4px;">
              <button class="btn-vmode ${this.videoMode !== 0x13 ? 'active' : ''}" id="btn-vmode-text" data-vmode="03" title="80x25 Standart Metin Modu (0xB800)">
                📟 Metin (80x25)
              </button>
              <button class="btn-vmode ${this.videoMode === 0x13 ? 'active' : ''}" id="btn-vmode-gfx" data-vmode="13" title="320x200 256-Renk VGA Mod 13h Grafik Modu (0xA000)">
                🎨 Grafik (320x200)
              </button>
              <button class="btn-vmode" id="btn-vmode-testdraw" title="Ekrana doğrudan retro test deseni çizerek grafiği doğrula">
                ⚡ Çizim Testi
              </button>
            </div>
          </div>

          <div class="console-header-right" style="display: flex; align-items: center; gap: 6px;">
            <!-- Phosphor Palette Selector -->
            <div class="crt-mini-palettes" style="display: inline-flex; gap: 3px;">
              <button class="btn-mini-pal ${this.colorMode === 'vga' ? 'active' : ''}" data-pal="vga" title="CGA / RGB Renkli Monitör">CGA</button>
              <button class="btn-mini-pal ${this.colorMode === 'green' ? 'active' : ''}" data-pal="green" title="IBM 5151 Yeşil Fosfor Monitör">GRN</button>
              <button class="btn-mini-pal ${this.colorMode === 'amber' ? 'active' : ''}" data-pal="amber" title="Kehribar Fosfor Monitör">AMB</button>
            </div>
            <button id="btn-console-clear" class="btn-console-clear" title="Ekranı ve Logları Temizle" style="padding: 2px 7px; font-size: 10px; background: #243044; border: 1px solid #3b4d66; color: #e2e8f0; border-radius: 4px; cursor: pointer;">Temizle</button>
          </div>
        </div>

        <!-- Body 1: Authentic Physical CRT Screen (80x25 Text or Mode 13h Canvas) -->
        <div class="crt-screen-wrapper" id="crt-view-wrapper" style="flex: 1 1 268px; min-height: 260px; height: 268px; position: relative; background: #1e293b; padding: 6px 10px; overflow: hidden; display: ${this.activeViewMode === 'monitor' ? 'flex' : 'none'}; flex-direction: column; box-sizing: border-box; border-top: 1px solid #334155; border-bottom: 1px solid #0f172a;">
          <div class="crt-screen-box ${this.colorMode}" id="crt-screen-box" tabindex="0" style="flex: 1 1 100%; height: 100%; min-height: 248px; padding: 4px 8px; overflow: hidden; position: relative; background: #000000; border: 2px solid #0f172a; border-radius: 10px; font-family: 'JetBrains Mono', Consolas, monospace; cursor: text; box-shadow: inset 0 0 35px rgba(0,0,0,0.98), inset 0 0 10px rgba(56, 189, 248, 0.05); box-sizing: border-box;">
            <div class="crt-scanlines"></div>
            <div class="crt-glow"></div>
            <div class="crt-content" id="crt-screen-content" style="position: relative; z-index: 2; font-size: 10px; line-height: 10.5px; letter-spacing: 0.3px; width: 100%; height: 100%; user-select: none;">
              ${this.renderCrtContent()}
            </div>
          </div>
        </div>

        <!-- Body 2: Standard System & Compiler Diagnostics Log -->
        <div class="console-body" id="console-output" style="flex: 1 1 268px; min-height: 260px; height: 268px; padding: 8px 12px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; background: #020617; color: #cbd5e1; display: ${this.activeViewMode === 'logs' ? 'block' : 'none'}; box-sizing: border-box;"></div>

        <!-- Bottom Hardware Keyboard Input Bar -->
        <div class="console-input-wrap" id="console-input-wrap" style="display: flex; align-items: center; gap: 8px; padding: 3px 10px; height: 36px; min-height: 36px; flex-shrink: 0; margin-top: auto; background: #0c1017; border-top: 1px solid #1e293b; box-sizing: border-box;">
          <span class="console-prompt-sym" style="color: #38bdf8; font-weight: 700; font-size: 12px;">❯</span>
          <input type="text" id="console-input-field" class="console-input-field" placeholder="Klavye girdisi (Port 60h / INT 16h / INT 21h)..." autocomplete="off" style="flex: 1; background: #020617; border: 1px solid #243044; border-radius: 4px; padding: 3px 8px; color: #f8fafc; font-size: 11px; font-family: 'JetBrains Mono', monospace; outline: none;" />
          <button id="btn-console-send" class="btn-console-send" title="Gönder" style="padding: 2px 10px; font-size: 11px; font-weight: 600; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; cursor: pointer;">Gönder</button>
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
        <div class="crt-graphics-wrapper" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; box-sizing: border-box; padding: 2px;">
          <canvas id="crt-graphics-canvas" width="320" height="200" style="width: 420px; height: 260px; max-width: 100%; max-height: 100%; aspect-ratio: 16/10; image-rendering: pixelated; display: block; background: #000000; border: 2px solid #38bdf8; border-radius: 6px; box-shadow: 0 0 25px rgba(56, 189, 248, 0.25);"></canvas>
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

        let color = '';
        let bg = 'transparent';

        if (isMonoGreen) {
          const isBright = (attr & 0x08) !== 0;
          color = isBright ? '#4ade80' : '#22c55e';
          bg = (attr & 0x70) !== 0 ? '#14532d' : 'transparent';
        } else if (isMonoAmber) {
          const isBright = (attr & 0x08) !== 0;
          color = isBright ? '#fbbf24' : '#f59e0b';
          bg = (attr & 0x70) !== 0 ? '#78350f' : 'transparent';
        } else {
          const fg = attr & 0x0F;
          const bgAttr = (attr >> 4) & 0x07;
          color = CGA_PALETTE[fg] || '#ffffff';
          bg = bgAttr === 0 ? 'transparent' : (CGA_PALETTE[bgAttr] || 'transparent');
        }

        const cursorClass = isCursor ? ' crt-hardware-cursor' : '';
        rowHtml += `<span class="${cursorClass.trim()}" style="color: ${color}; background-color: ${bg};">${this.escapeHtml(char)}</span>`;
      }
      output += `<div class="crt-row" style="height: 10.5px; line-height: 10.5px; white-space: pre;">${rowHtml}</div>`;
    }
    return output;
  }

  private paintGraphicsCanvas(): void {
    const canvas = this.container.querySelector('#crt-graphics-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (!this.canvasCtx || this.canvasCtx.canvas !== canvas) {
      this.canvasCtx = canvas.getContext('2d');
      this.canvasImgData = null;
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
        ? '13h GRAFİK (320x200)'
        : '03h METİN (80x25)';
    }

    const crtBox = this.container.querySelector('#crt-screen-box');
    if (crtBox) {
      crtBox.classList.toggle('graphics-mode', this.videoMode === 0x13);
    }

    const content = this.container.querySelector('#crt-screen-content');
    if (this.videoMode === 0x13) {
      if (content && !content.querySelector('#crt-graphics-canvas')) {
        content.innerHTML = this.renderCrtContent();
        this.canvasCtx = null;
        this.canvasImgData = null;
      }
      this.paintGraphicsCanvas();
    } else {
      if (content) {
        content.innerHTML = this.renderCrtContent();
      }
    }

    this.updateVmodeButtons();
  }

  private updateVmodeButtons(): void {
    const btnText = this.container.querySelector('#btn-vmode-text');
    const btnGfx = this.container.querySelector('#btn-vmode-gfx');
    if (btnText && btnGfx) {
      btnText.classList.toggle('active', this.videoMode !== 0x13);
      btnGfx.classList.toggle('active', this.videoMode === 0x13);
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

          if (crtWrap) {
            crtWrap.style.display = mode === 'monitor' ? 'flex' : 'none';
            crtWrap.classList.toggle('hidden', mode !== 'monitor');
            crtWrap.classList.toggle('active', mode === 'monitor');
          }
          if (logsOutput) {
            logsOutput.style.display = mode === 'logs' ? 'block' : 'none';
            logsOutput.classList.toggle('hidden', mode !== 'logs');
            logsOutput.classList.toggle('active', mode === 'logs');
          }

          if (mode === 'monitor') {
            this.refreshCrtScreen();
          }
        }
      });
    });

    // Video mode switcher buttons (80x25 Metin vs 320x200 Grafik)
    this.container.querySelectorAll<HTMLButtonElement>('.btn-vmode').forEach(btn => {
      btn.addEventListener('click', () => {
        const vmode = btn.dataset.vmode;
        if (vmode === '03') {
          this.videoMode = 0x03;
          this.refreshCrtScreen();
          this.onVideoModeChange?.(0x03);
        } else if (vmode === '13') {
          this.videoMode = 0x13;
          this.refreshCrtScreen();
          this.onVideoModeChange?.(0x13);
        }
      });
    });

    // One-click Graphics Canvas Verification
    const testDrawBtn = this.container.querySelector('#btn-vmode-testdraw');
    testDrawBtn?.addEventListener('click', () => {
      this.videoMode = 0x13;
      for (let y = 0; y < 200; y++) {
        for (let x = 0; x < 320; x++) {
          const idx = y * 320 + x;
          if (y < 40) {
            this.graphicsData[idx] = Math.floor(x / 20) % 16;
          } else if (y >= 60 && y < 140 && x >= 80 && x < 240) {
            const border = (x === 80 || x === 239 || y === 60 || y === 139);
            this.graphicsData[idx] = border ? 0x0F : (0x20 + (Math.floor(x / 4) ^ Math.floor(y / 4)) % 216);
          } else {
            this.graphicsData[idx] = ((x % 20 === 0) || (y % 20 === 0)) ? 0x08 : 0x00;
          }
        }
      }
      this.refreshCrtScreen();
      this.onVideoModeChange?.(0x13);
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
      this.appendStdout(val + '\n');
      this.onInput?.(val + '\r');
      inputField.value = '';
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
