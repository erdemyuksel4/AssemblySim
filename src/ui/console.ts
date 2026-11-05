import { Memory } from '../cpu/memory.js';

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'stdout' | 'port';

export interface ConsoleOptions {
  memory?: Memory;
  onInput?: (input: string) => void;
  onVideoModeChange?: (mode: number) => void;
}

// Standart 16-Renk CGA / RGB Paleti
const CGA_PALETTE = [
  '#000000', '#0000aa', '#00aa00', '#00aaaa',
  '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa',
  '#555555', '#5555ff', '#55ff55', '#55ffff',
  '#ff5555', '#ff55ff', '#ffff55', '#ffffff'
];

// Standart 256-Renk VGA/DAC Paleti (Mode 13h - 320x200)
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
  for (let i = 0; i < 16; i++) {
    const val = Math.round((i / 15) * 255);
    palette.push([val, val, val]);
  }
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
 * Sade, Gerçekçi CRT Monitör
 * Tamamen sistem belleğine (Memory / 1 MB RAM) bağlıdır.
 * - Ekran modu doğrudan BDA 0040:0049h (0x0449) adresinden okunur. Elle mod seçimi yoktur.
 * - Metin Modu (03h): 0xB8000 VRAM alanını ve 0x0450/0x0451 imleç koordinatlarını yansıtır.
 * - Grafik Modu (13h): 0xA0000 VRAM alanını 320x200 piksel olarak canvas'a çizer.
 */
export class ConsoleView {
  private container: HTMLElement;
  private memory: Memory;
  private onInput?: (input: string) => void;
  private onVideoModeChange?: (mode: number) => void;
  private isWaiting: boolean = false;

  // Donanımsal imleç yanıp sönme (blink) durumu
  private cursorBlink: boolean = true;
  private blinkTimer: ReturnType<typeof setInterval> | null = null;

  // Mode 13h Canvas tamponu
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private canvasImgData: ImageData | null = null;

  // Render optimizasyonu (requestAnimationFrame)
  private vramDirty: boolean = false;
  private animFrameId: number | null = null;

  constructor(container: HTMLElement, options?: ConsoleOptions) {
    this.container = container;
    this.memory = options?.memory ?? new Memory();
    this.onInput = options?.onInput;
    this.onVideoModeChange = options?.onVideoModeChange;

    this.render();
    this.startBlinkTimer();
  }

  /**
   * Doğrudan bağlı olduğu 1 MB fiziksel RAM tamponunu döner.
   */
  getMemoryData(): Uint8Array {
    return this.memory.data;
  }

  /**
   * BDA (0040:0049h) adresindeki donanımsal video modunu döner.
   */
  get videoMode(): number {
    return this.memory.data[0x0449] || 0x03;
  }

  /**
   * Video modunu BDA (0x0449) üzerinde günceller.
   */
  setVideoMode(mode: number): void {
    const cleanMode = mode & 0xFF;
    this.memory.data[0x0449] = cleanMode;
    this.onVideoModeChange?.(cleanMode);
    this.vramDirty = true;
    this.refreshCrtScreen();
  }

  /**
   * Doğrudan fiziksel VRAM'e (0xB8000) karakter ve öznitelik yazar.
   */
  writeStringToVram(row: number, col: number, text: string, attr: number = 0x07): void {
    for (let i = 0; i < text.length; i++) {
      if (col + i >= 80) break;
      const offset = 0xB8000 + (row * 80 + col + i) * 2;
      this.memory.data[offset] = text.charCodeAt(i);
      this.memory.data[offset + 1] = attr & 0xFF;
    }
    this.vramDirty = true;
    this.scheduleRender();
  }

  destroy(): void {
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.animFrameId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  setOnInput(callback: (input: string) => void): void {
    this.onInput = callback;
  }

  private startBlinkTimer(): void {
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (typeof setInterval === 'function') {
      this.blinkTimer = setInterval(() => {
        this.cursorBlink = !this.cursorBlink;
        if (this.videoMode !== 0x13) {
          const cursorEl = this.container.querySelector?.('.crt-hardware-cursor') as HTMLElement | null;
          if (cursorEl) {
            cursorEl.classList.toggle('cursor-hidden', !this.cursorBlink);
          }
        }
      }, 500);
    }
  }

  log(_text: string, _level: LogLevel = 'info'): void {
    // Monitör saf ekran olduğu için log kalabalığı ekrana basılmaz, donanım durumunu korur
  }

  appendStdout(_charOrStr: string): void {
    // Donanım düzeyinde çıktı VRAM veya I/O portları üzerinden yapılır
  }

  isWaitingForInput(): boolean {
    return this.isWaiting;
  }

  setRunningState(running: boolean): void {
    if (this.isWaiting) return;
    const badge = this.container.querySelector?.('#crt-status-text');
    if (badge) {
      badge.textContent = running ? 'ÇALIŞIYOR' : 'HAZIR';
    }
  }

  setWaitingForInput(waiting: boolean, hint?: string): void {
    this.isWaiting = waiting;
    const badge = this.container.querySelector?.('#crt-status-text');
    const input = this.container.querySelector?.('#console-input-field') as HTMLInputElement | null;

    if (badge) {
      badge.textContent = waiting ? (hint || 'GİRDİ BEKLENİYOR') : 'HAZIR';
    }

    if (waiting) {
      this.refreshCrtScreen();
      if (input) {
        input.placeholder = hint || 'Klavyeden tuşa basın...';
        input.focus();
      }
    } else {
      if (input) {
        input.placeholder = 'Klavye girdisi (Port 60h / INT 16h / INT 21h)...';
      }
    }
  }

  /**
   * Monitör ekranını ve donanımsal VRAM alanlarını (0xB8000 ve 0xA0000) temizler.
   */
  clear(): void {
    // 1. Text VRAM temizle (0xB8000 - 0xB8FA0, 2000 karakter hücresi)
    for (let i = 0; i < 2000; i++) {
      const off = 0xB8000 + i * 2;
      this.memory.data[off] = 0x20;     // ' ' boşluk
      this.memory.data[off + 1] = 0x07; // 0x07 açık gri / siyah
    }

    // 2. Grafik VRAM temizle (0xA0000 - 0xAFA00, 64000 bayt)
    this.memory.data.fill(0, 0xA0000, 0xA0000 + 64000);

    // 3. BDA imleç ve video modunu sıfırla
    this.memory.data[0x0450] = 0; // col 0
    this.memory.data[0x0451] = 0; // row 0
    this.memory.data[0x0449] = 0x03; // 80x25 metin modu

    this.canvasCtx = null;
    this.canvasImgData = null;

    this.refreshCrtScreen();
  }

  /**
   * Bellek içeriği değiştiğinde CRT ekranını günceller.
   */
  updateVram(memoryAll?: Uint8Array): void {
    if (memoryAll && memoryAll !== this.memory.data) {
      const copyLen = Math.min(memoryAll.length, this.memory.data.length);
      this.memory.data.set(memoryAll.subarray(0, copyLen));
    }

    this.vramDirty = true;
    this.scheduleRender();
  }

  private scheduleRender(): void {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      this.refreshCrtScreen();
      return;
    }

    if (this.animFrameId !== null) return;
    this.animFrameId = window.requestAnimationFrame(() => {
      this.animFrameId = null;
      if (this.vramDirty) {
        this.vramDirty = false;
        this.refreshCrtScreen();
      }
    });
  }

  private render(): void {
    if (!this.container) return;

    const isGraphics = this.videoMode === 0x13;
    const modeLabel = isGraphics ? '13h GRAFİK (320x200)' : '03h METİN (80x25)';

    this.container.innerHTML = `
      <div class="console-box" style="display: flex; flex-direction: column; height: 100%; min-height: 280px; background: #0c1017; border-radius: 8px; overflow: hidden; border: 1px solid #1e293b; box-sizing: border-box;">
        <!-- Monitör Sade Üst Bilgi Başlığı -->
        <div class="console-header-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; height: 32px; min-height: 32px; flex-shrink: 0; background: #111827; border-bottom: 1px solid #1f2937; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e;"></span>
            <span style="font-size: 11px; font-weight: 700; color: #e2e8f0; letter-spacing: 0.5px;">MONİTÖR</span>
            <span id="crt-monitor-title" style="font-size: 9.5px; font-weight: 600; padding: 1px 6px; border-radius: 3px; background: #1e293b; color: #38bdf8;">${modeLabel}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="crt-status-text" style="font-size: 9.5px; font-weight: 600; color: #94a3b8;">HAZIR</span>
            <button id="btn-console-clear" title="Ekranı Temizle" style="padding: 1px 6px; font-size: 9.5px; background: #1f2937; border: 1px solid #374151; color: #cbd5e1; border-radius: 3px; cursor: pointer;">Temizle</button>
          </div>
        </div>

        <!-- CRT Ekranı (Doğrudan VRAM'i yansıtır) -->
        <div class="crt-screen-wrapper" style="flex: 1 1 auto; min-height: 220px; position: relative; background: #000000; padding: 4px; overflow: hidden; display: flex; flex-direction: column; box-sizing: border-box;">
          <div class="crt-screen-box vga" id="crt-screen-box" tabindex="0" style="flex: 1 1 100%; height: 100%; min-height: 210px; padding: 4px 6px; overflow: hidden; position: relative; background: #000000; border-radius: 4px; font-family: 'JetBrains Mono', Consolas, monospace; cursor: text; box-sizing: border-box;">
            <div class="crt-scanlines"></div>
            <div class="crt-glow"></div>
            <div class="crt-content" id="crt-screen-content" style="position: relative; z-index: 2; font-size: 10px; line-height: 10.5px; letter-spacing: 0.3px; width: 100%; height: 100%; user-select: none;">
              ${this.renderCrtContent()}
            </div>
          </div>
        </div>

        <!-- Alt Klavye Girdi Çubuğu -->
        <div class="console-input-wrap" style="display: flex; align-items: center; gap: 6px; padding: 3px 8px; height: 32px; min-height: 32px; flex-shrink: 0; background: #0b0f17; border-top: 1px solid #1e293b; box-sizing: border-box;">
          <span style="color: #38bdf8; font-weight: 700; font-size: 11px;">❯</span>
          <input type="text" id="console-input-field" placeholder="Klavye girdisi (Port 60h / INT 16h / INT 21h)..." autocomplete="off" style="flex: 1; background: #020617; border: 1px solid #1e293b; border-radius: 4px; padding: 2px 6px; color: #f8fafc; font-size: 11px; font-family: 'JetBrains Mono', monospace; outline: none;" />
          <button id="btn-console-send" style="padding: 2px 8px; font-size: 10px; font-weight: 600; background: #2563eb; color: #ffffff; border: none; border-radius: 3px; cursor: pointer;">Gönder</button>
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
        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; box-sizing: border-box;">
          <canvas id="crt-graphics-canvas" width="320" height="200" style="max-width: 100%; max-height: 100%; aspect-ratio: 16/10; image-rendering: pixelated; display: block; background: #000000; border: 1px solid #1e293b; border-radius: 4px;"></canvas>
        </div>
      `;
    }

    let output = '';
    const cursorCol = Math.min(79, this.memory.data[0x0450] || 0);
    const cursorRow = Math.min(24, this.memory.data[0x0451] || 0);

    // 80x25 Standart Metin Modu (0xB8000)
    for (let row = 0; row < 25; row++) {
      let rowHtml = '';
      for (let col = 0; col < 80; col++) {
        const offset = 0xB8000 + (row * 80 + col) * 2;
        const charCode = this.memory.data[offset] ?? 32;
        const attr = this.memory.data[offset + 1] ?? 0x07;
        const char = (charCode < 32 || charCode > 126) ? (charCode === 0 ? ' ' : '•') : String.fromCharCode(charCode);

        const isCursor = (row === cursorRow && col === cursorCol);
        const fg = attr & 0x0F;
        const bgAttr = (attr >> 4) & 0x07;
        const color = CGA_PALETTE[fg] || '#ffffff';
        const bg = bgAttr === 0 ? 'transparent' : (CGA_PALETTE[bgAttr] || 'transparent');

        const cursorClass = isCursor ? ' crt-hardware-cursor' : '';
        rowHtml += `<span class="${cursorClass.trim()}" style="color: ${color}; background-color: ${bg};">${this.escapeHtml(char)}</span>`;
      }
      output += `<div class="crt-row" style="height: 10.5px; line-height: 10.5px; white-space: pre;">${rowHtml}</div>`;
    }
    return output;
  }

  private paintGraphicsCanvas(): void {
    const canvas = this.container.querySelector?.('#crt-graphics-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    if (!this.canvasCtx || this.canvasCtx.canvas !== canvas) {
      this.canvasCtx = canvas.getContext?.('2d') ?? null;
      this.canvasImgData = null;
    }
    if (!this.canvasCtx) return;

    if (!this.canvasImgData && typeof this.canvasCtx.createImageData === 'function') {
      this.canvasImgData = this.canvasCtx.createImageData(320, 200);
    }
    if (!this.canvasImgData) return;

    const data = this.canvasImgData.data;

    // 0xA0000 fiziksel grafik VRAM'inden oku
    for (let i = 0; i < 64000; i++) {
      const colorIdx = this.memory.data[0xA0000 + i];
      const [r, g, b] = VGA_256_RGB[colorIdx] || [0, 0, 0];

      const pixelOffset = i * 4;
      data[pixelOffset] = r;
      data[pixelOffset + 1] = g;
      data[pixelOffset + 2] = b;
      data[pixelOffset + 3] = 255;
    }

    if (typeof this.canvasCtx.putImageData === 'function') {
      this.canvasCtx.putImageData(this.canvasImgData, 0, 0);
    }
  }

  private refreshCrtScreen(): void {
    const titleEl = this.container.querySelector?.('#crt-monitor-title');
    if (titleEl) {
      titleEl.textContent = this.videoMode === 0x13
        ? '13h GRAFİK (320x200)'
        : '03h METİN (80x25)';
    }

    const crtBox = this.container.querySelector?.('#crt-screen-box');
    if (crtBox) {
      crtBox.classList.toggle('graphics-mode', this.videoMode === 0x13);
    }

    const content = this.container.querySelector?.('#crt-screen-content');
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
  }

  private bindEvents(): void {
    // Temizle Butonu
    const clearBtn = this.container.querySelector?.('#btn-console-clear');
    clearBtn?.addEventListener?.('click', () => this.clear());

    // Klavye Girişi
    const sendBtn = this.container.querySelector?.('#btn-console-send');
    const inputField = this.container.querySelector?.('#console-input-field') as HTMLInputElement | null;

    const handleSend = () => {
      if (!inputField) return;
      const val = inputField.value;
      this.onInput?.(val + '\r');
      inputField.value = '';
    };

    sendBtn?.addEventListener?.('click', handleSend);
    inputField?.addEventListener?.('keydown', (e) => {
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
