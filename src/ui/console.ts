import { Memory } from '../cpu/memory.js';

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'stdout' | 'port';

export interface ConsoleOptions {
  memory?: Memory;
  onInput?: (input: string) => void;
  onVideoModeChange?: (mode: number) => void;
}

export interface CanvasPixelChange {
  time: string;
  x: number;
  y: number;
  colorIdx: number;
  hexColor: string;
  rgbStr: string;
  physHex: string;
  offset: number;
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
 * 100% Gerçek Canvas CRT Monitör (HTML Spans Yok, crt-row Yok)
 * Ekran daima DOM'da var olan <canvas id="myCanvas" width="800" height="600"> tuvalidir.
 * - Metin Modu (03h): 0xB8000 VRAM alanını ve donanımsal imleci doğrudan tuvale rasterize eder.
 * - Grafik Modu (13h): 0xA0000 VRAM alanını (320x200) doğrudan 800x600 tuvale keskin pikselleştirir.
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

  // Çizim tamponları (320x200 VRAM -> 800x600 Keskin Canvas)
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private offscreenImgData: ImageData | null = null;

  // Render optimizasyonu (requestAnimationFrame)
  private vramDirty: boolean = false;
  private animFrameId: number | null = null;

  // Canvas Tanılama ve Değişiklik Takip Sistemi
  private canvasHistory: CanvasPixelChange[] = [];
  private lastPixelChange: CanvasPixelChange | null = null;
  private recentChangeCount: number = 0;
  private bulkTimer: ReturnType<typeof setTimeout> | null = null;
  private activePixelCount: number = 0;
  private isHistoryOpen: boolean = false;
  private currentMonitorSize: 'normal' | 'large' | 'huge' = 'large';

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
   * Video modunu BDA (0x0449) üzerinde günceller ve konsola raporlar.
   */
  setVideoMode(mode: number): void {
    const cleanMode = mode & 0xFF;
    this.memory.data[0x0449] = cleanMode;
    this.onVideoModeChange?.(cleanMode);

    if (typeof console !== 'undefined' && console.log) {
      console.log(
        `%c[CANVAS VİDEO MODU]%c Mod değişti -> 0x${cleanMode.toString(16).toUpperCase().padStart(2, '0')} (${cleanMode === 0x13 ? 'Mode 13h (320x200 256 Renk Grafik)' : 'Mode 03h (80x25 Metin)'})`,
        'background: #8b5cf6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
        'color: #c084fc; font-family: monospace; font-size: 11px;'
      );
    }

    this.vramDirty = true;
    this.refreshCrtScreen();
  }

  /**
   * VRAM'e yazılan her baytı yakalayıp analiz eder ve raporlar.
   */
  recordVramChange(phys: number, val: number): void {
    // 0xA0000 - 0xAFA00 Mode 13h Grafik VRAM Alanı (64,000 bayt)
    if (phys >= 0xA0000 && phys < 0xA0000 + 64000) {
      const offset = phys - 0xA0000;
      const x = offset % 320;
      const y = Math.floor(offset / 320);
      const colorIdx = val & 0xFF;
      const [r, g, b] = VGA_256_RGB[colorIdx] || [0, 0, 0];
      const hexColor = colorIdx.toString(16).toUpperCase().padStart(2, '0');
      const rgbStr = `rgb(${r}, ${g}, ${b})`;
      const physHex = phys.toString(16).toUpperCase().padStart(5, '0');

      const changeRecord: CanvasPixelChange = {
        time: new Date().toLocaleTimeString(),
        x,
        y,
        colorIdx,
        hexColor,
        rgbStr,
        physHex,
        offset
      };

      this.lastPixelChange = changeRecord;
      this.canvasHistory.unshift(changeRecord);
      if (this.canvasHistory.length > 50) {
        this.canvasHistory.pop();
      }

      // 1. Tarayıcı Konsolu (DevTools Console) Raporlaması
      if (typeof console !== 'undefined' && console.log) {
        if (this.recentChangeCount < 30) {
          console.log(
            `%c[CANVAS DEĞİŞİKLİĞİ]%c (X: ${x}, Y: ${y}) pikseline 0x${hexColor} (${rgbStr}) yazıldı | Adres: 0x${physHex} | Ofset: ${offset}`,
            'background: #0284c7; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
            'color: #38bdf8; font-family: monospace; font-size: 11px;'
          );
        }
      }

      // Çok hızlı döngülerde toplu özet log
      this.recentChangeCount++;
      if (!this.bulkTimer && typeof setTimeout !== 'undefined') {
        this.bulkTimer = setTimeout(() => {
          if (this.recentChangeCount > 30 && typeof console !== 'undefined' && console.log) {
            console.log(
              `%c[CANVAS TOPLU ÇİZİM]%c Toplam ${this.recentChangeCount} piksel değişikliği yapıldı. Son piksel: (X: ${this.lastPixelChange?.x}, Y: ${this.lastPixelChange?.y}) Renk: 0x${this.lastPixelChange?.hexColor}`,
              'background: #10b981; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
              'color: #34d399; font-family: monospace; font-size: 11px;'
            );
          }
          this.recentChangeCount = 0;
          this.bulkTimer = null;
        }, 80);
      }

      this.updateDiagBar();
    }
  }

  /**
   * UI üzerindeki canlı Canvas Tanılama Çubuğunu günceller.
   */
  private updateDiagBar(): void {
    if (!this.container) return;

    const lastChangeEl = this.container.querySelector('#crt-diag-last-change');
    if (lastChangeEl) {
      if (this.lastPixelChange) {
        lastChangeEl.innerHTML = `<span style="color: #38bdf8;">(X: ${this.lastPixelChange.x}, Y: ${this.lastPixelChange.y})</span> &rarr; Renk: <span style="display:inline-block;width:9px;height:9px;background:${this.lastPixelChange.rgbStr};border:1px solid #475569;border-radius:2px;vertical-align:middle;margin:0 3px;"></span>0x${this.lastPixelChange.hexColor} <span style="color:#64748b;">@ 0x${this.lastPixelChange.physHex}</span>`;
      } else {
        lastChangeEl.textContent = 'Henüz çizim yapılmadı';
      }
    }

    const pixelCountEl = this.container.querySelector('#crt-diag-pixel-count');
    if (pixelCountEl) {
      pixelCountEl.textContent = `Aktif Piksel: ${this.activePixelCount} / 64,000`;
    }

    const btnHistory = this.container.querySelector('#btn-toggle-canvas-history');
    if (btnHistory) {
      btnHistory.textContent = `Geçmiş (${this.canvasHistory.length})`;
    }

    if (this.isHistoryOpen) {
      this.renderHistoryList();
    }
  }

  private renderHistoryList(): void {
    const listEl = this.container.querySelector('#crt-canvas-history-list');
    if (!listEl) return;

    if (this.canvasHistory.length === 0) {
      listEl.innerHTML = '<span style="color: #64748b; font-style: italic;">Kayıtlı çizim işlemi bulunmuyor.</span>';
      return;
    }

    let html = '';
    for (let i = 0; i < Math.min(25, this.canvasHistory.length); i++) {
      const item = this.canvasHistory[i];
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;">
          <span>
            <span style="color: #38bdf8; font-weight: 600;">[${item.time}]</span>
            (X: ${item.x}, Y: ${item.y}) &rarr; Renk:
            <span style="display: inline-block; width: 9px; height: 9px; background: ${item.rgbStr}; border: 1px solid #475569; border-radius: 2px; vertical-align: middle; margin: 0 3px;"></span>
            <span style="color: #f8fafc; font-weight: 600;">0x${item.hexColor}</span>
          </span>
          <span style="color: #64748b;">0x${item.physHex} (Ofset: ${item.offset})</span>
        </div>
      `;
    }
    listEl.innerHTML = html;
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
    if (this.bulkTimer !== null) {
      clearTimeout(this.bulkTimer);
      this.bulkTimer = null;
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
          this.refreshCrtScreen();
        }
      }, 500);
    }
  }

  log(text: string, level: LogLevel = 'info'): void {
    if (typeof console !== 'undefined') {
      if (level === 'error') {
        console.error(`[AssemblySim] ${text}`);
      } else if (level === 'warn') {
        console.warn(`[AssemblySim] ${text}`);
      } else {
        console.log(`[AssemblySim] ${text}`);
      }
    }
  }

  appendStdout(charOrStr: string): void {
    if (typeof console !== 'undefined' && console.log) {
      console.log(`[AssemblySim STDOUT] ${charOrStr}`);
    }
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

    this.activePixelCount = 0;
    this.lastPixelChange = null;
    this.canvasHistory = [];

    if (typeof console !== 'undefined' && console.log) {
      console.log(
        '%c[CANVAS TEMİZLENDİ]%c 0xA0000 Grafik VRAM ve 0xB8000 Metin VRAM sıfırlandı.',
        'background: #ef4444; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
        'color: #f87171; font-family: monospace; font-size: 11px;'
      );
    }

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

    // 0xA0000 grafik VRAM'inde çizilmiş piksel var mı tam kontrol et
    if (this.videoMode !== 0x13) {
      const u32 = new Uint32Array(this.memory.data.buffer, 0xA0000, 16000);
      for (let i = 0; i < 16000; i++) {
        if (u32[i] !== 0) {
          this.memory.data[0x0449] = 0x13;
          if (typeof console !== 'undefined' && console.log) {
            console.log('%c[CANVAS OTO-MOD]%c 0xA0000 VRAM alanında veri algılandı, Mode 13h otomatik aktifleşti.', 'background: #3b82f6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;', 'color: #60a5fa;');
          }
          break;
        }
      }
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
      <div class="console-box" style="display: flex; flex-direction: column; height: 100%; min-height: 520px; background: #0c1017; border-radius: 8px; overflow: hidden; border: 1px solid #1e293b; box-sizing: border-box;">
        <!-- Monitör Donanım Başlığı ve Boyut Kontrolleri -->
        <div class="console-header-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; height: 34px; min-height: 34px; flex-shrink: 0; background: #111827; border-bottom: 1px solid #1f2937; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e;"></span>
            <span style="font-size: 11px; font-weight: 700; color: #e2e8f0; letter-spacing: 0.5px;">MONİTÖR</span>
            <span id="crt-monitor-title" style="font-size: 9.5px; font-weight: 600; padding: 1px 7px; border-radius: 4px; background: #1e293b; color: #38bdf8; user-select: none; border: 1px solid #334155;">${modeLabel}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- Monitör Boyut Seçici -->
            <div class="crt-size-selector" style="display: flex; align-items: center; gap: 2px; background: #0b0f19; padding: 2px; border-radius: 4px; border: 1px solid #1e293b;">
              <span style="font-size: 9px; color: #64748b; padding: 0 4px; font-weight: 600;">Boyut:</span>
              <button id="btn-size-normal" class="btn-crt-size" title="Standart Boyut (640x480)" style="padding: 2px 7px; font-size: 9.5px; font-weight: 600; background: transparent; border: none; color: #94a3b8; border-radius: 3px; cursor: pointer;">Standart</button>
              <button id="btn-size-large" class="btn-crt-size" title="Büyük Boyut (840x630)" style="padding: 2px 7px; font-size: 9.5px; font-weight: 700; background: #2563eb; border: none; color: #ffffff; border-radius: 3px; cursor: pointer;">Büyük</button>
              <button id="btn-size-huge" class="btn-crt-size" title="Geniş Boyut (1060x795)" style="padding: 2px 7px; font-size: 9.5px; font-weight: 600; background: transparent; border: none; color: #94a3b8; border-radius: 3px; cursor: pointer;">Geniş</button>
              <button id="btn-size-fullscreen" class="btn-crt-size" title="Monitörü Tam Ekran Yap" style="padding: 2px 7px; font-size: 9.5px; font-weight: 600; background: transparent; border: none; color: #38bdf8; border-radius: 3px; cursor: pointer;">⛶ Tam Ekran</button>
            </div>

            <span id="crt-status-text" style="font-size: 9.5px; font-weight: 600; color: #94a3b8;">HAZIR</span>
            <button id="btn-console-clear" title="Ekranı Temizle" style="padding: 2px 7px; font-size: 9.5px; background: #1f2937; border: 1px solid #374151; color: #cbd5e1; border-radius: 3px; cursor: pointer;">Temizle</button>
          </div>
        </div>

        <!-- Canlı Canvas Tanılama ve Değişiklik Raporu Çubuğu -->
        <div id="crt-canvas-diag-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; height: 28px; min-height: 28px; flex-shrink: 0; background: #0f172a; border-bottom: 1px solid #1e293b; font-size: 10.5px; font-family: 'JetBrains Mono', Consolas, monospace; color: #94a3b8; user-select: none; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 6px #38bdf8;"></span>
            <span style="color: #38bdf8; font-weight: 700; letter-spacing: 0.3px;">CANVAS RAPORU:</span>
            <span id="crt-diag-last-change" style="color: #f1f5f9; font-weight: 500;">Henüz çizim yapılmadı</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <span id="crt-diag-pixel-count" style="color: #cbd5e1; font-weight: 600;">Aktif Piksel: 0 / 64,000</span>
            <button id="btn-toggle-canvas-history" style="padding: 2px 8px; font-size: 9.5px; font-weight: 700; background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; cursor: pointer;">Geçmiş (0)</button>
          </div>
        </div>

        <!-- Açılır Değişiklik Geçmişi Listesi -->
        <div id="crt-canvas-history-panel" style="display: none; max-height: 120px; overflow-y: auto; background: #030712; border-bottom: 1px solid #1e293b; padding: 6px 12px; font-size: 9.5px; font-family: 'JetBrains Mono', monospace; box-sizing: border-box;">
          <div id="crt-canvas-history-list" style="display: flex; flex-direction: column; gap: 3px;"></div>
        </div>

        <!-- CRT Ekranı: DAİMA VE BİZZAT <canvas id="myCanvas"> ELEMANIDIR -->
        <div class="crt-screen-wrapper" style="flex: 1 1 auto; min-height: 520px; position: relative; background: radial-gradient(circle at center, #0b1120 0%, #020617 100%); padding: 14px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
          <canvas id="myCanvas" class="crt-graphics-canvas" width="800" height="600" style="width: 100%; max-width: 840px; height: auto; aspect-ratio: 4/3; object-fit: contain; image-rendering: pixelated; display: block; background: #000000; border: 3px solid #38bdf8; border-radius: 8px; box-shadow: 0 0 30px rgba(56, 189, 248, 0.35);"></canvas>
        </div>

        <!-- Alt Klavye Girdi Çubuğu -->
        <div class="console-input-wrap" style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; height: 34px; min-height: 34px; flex-shrink: 0; background: #0b0f17; border-top: 1px solid #1e293b; box-sizing: border-box;">
          <span style="color: #38bdf8; font-weight: 700; font-size: 11px;">❯</span>
          <input type="text" id="console-input-field" placeholder="Klavye girdisi (Port 60h / INT 16h / INT 21h)..." autocomplete="off" style="flex: 1; background: #020617; border: 1px solid #1e293b; border-radius: 4px; padding: 3px 8px; color: #f8fafc; font-size: 11px; font-family: 'JetBrains Mono', monospace; outline: none;" />
          <button id="btn-console-send" style="padding: 3px 10px; font-size: 10.5px; font-weight: 600; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; cursor: pointer;">Gönder</button>
        </div>
      </div>
    `;

    this.bindEvents();
    this.refreshCrtScreen();
  }

  private refreshCrtScreen(): void {
    const titleEl = this.container.querySelector?.('#crt-monitor-title');
    if (titleEl) {
      titleEl.textContent = this.videoMode === 0x13
        ? '13h GRAFİK (320x200)'
        : '03h METİN (80x25)';
    }

    const canvas = (this.container.querySelector?.('#myCanvas') || this.container.querySelector?.('#crt-graphics-canvas')) as HTMLCanvasElement | null;
    if (!canvas) return;

    if (!this.canvasCtx || this.canvasCtx.canvas !== canvas) {
      this.canvasCtx = canvas.getContext?.('2d') ?? null;
    }
    if (!this.canvasCtx) return;

    if (this.videoMode === 0x13) {
      this.paintGraphicsCanvas(canvas);
    } else {
      this.paintTextCanvas(canvas);
    }

    this.updateDiagBar();
  }

  /**
   * 80x25 Metin Modunu doğrudan 800x600 tuval üzerine çizer.
   * (HTML spans yok, DOM çöplüğü yok!)
   */
  private paintTextCanvas(canvas: HTMLCanvasElement): void {
    const ctx = this.canvasCtx;
    if (!ctx) return;

    const cellW = 10; // 80 cols * 10 = 800px
    const cellH = 24; // 25 rows * 24 = 600px

    // Arka planı temizle
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '16px "JetBrains Mono", Consolas, monospace';
    ctx.textBaseline = 'top';

    const cursorCol = Math.min(79, this.memory.data[0x0450] || 0);
    const cursorRow = Math.min(24, this.memory.data[0x0451] || 0);

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 80; col++) {
        const offset = 0xB8000 + (row * 80 + col) * 2;
        const charCode = this.memory.data[offset] ?? 32;
        const attr = this.memory.data[offset + 1] ?? 0x07;

        const fg = attr & 0x0F;
        const bgAttr = (attr >> 4) & 0x07;
        const fgColor = CGA_PALETTE[fg] || '#ffffff';
        const bgColor = bgAttr === 0 ? null : (CGA_PALETTE[bgAttr] || null);

        const x = col * cellW;
        const y = row * cellH;

        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(x, y, cellW, cellH);
        }

        if (charCode !== 0 && charCode !== 32) {
          const char = (charCode < 32 || charCode > 126) ? '•' : String.fromCharCode(charCode);
          ctx.fillStyle = fgColor;
          ctx.fillText(char, x + 1, y + 4);
        }

        // Donanımsal imleç
        if (row === cursorRow && col === cursorCol && this.cursorBlink) {
          ctx.fillStyle = fgColor;
          ctx.fillRect(x, y + cellH - 3, cellW, 3);
        }
      }
    }
  }

  /**
   * Mode 13h Grafik Modunu doğrudan 800x600 tuval üzerine rasterize eder.
   */
  private paintGraphicsCanvas(canvas: HTMLCanvasElement): void {
    const ctx = this.canvasCtx;
    if (!ctx) return;

    // 1. Sanal 320x200 VRAM ImageData tamponunu hazırla
    if (!this.offscreenCanvas && typeof document !== 'undefined') {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = 320;
      this.offscreenCanvas.height = 200;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    if (this.offscreenCtx && !this.offscreenImgData && typeof this.offscreenCtx.createImageData === 'function') {
      this.offscreenImgData = this.offscreenCtx.createImageData(320, 200);
    }

    let activeCount = 0;
    if (this.offscreenCtx && this.offscreenImgData) {
      const data = this.offscreenImgData.data;

      // 0xA0000 fiziksel grafik VRAM'inden oku
      for (let i = 0; i < 64000; i++) {
        const colorIdx = this.memory.data[0xA0000 + i];
        if (colorIdx !== 0) {
          activeCount++;
        }
        const [r, g, b] = VGA_256_RGB[colorIdx] || [0, 0, 0];

        const pixelOffset = i * 4;
        data[pixelOffset] = r;
        data[pixelOffset + 1] = g;
        data[pixelOffset + 2] = b;
        data[pixelOffset + 3] = 255;
      }

      this.offscreenCtx.putImageData(this.offscreenImgData, 0, 0);

      // 2. 320x200 sanal VRAM'i 800x600 ana canvas'a pürüzsüz & kristal keskinlikte çiz
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.offscreenCanvas!, 0, 0, canvas.width, canvas.height);
    } else {
      // Mock fallback
      if (typeof ctx.createImageData === 'function') {
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        ctx.putImageData?.(imgData, 0, 0);
      }
    }

    this.activePixelCount = activeCount;

    // 3. Render Raporu
    if (typeof console !== 'undefined' && console.log) {
      console.log(
        `%c[CANVAS RENDER]%c #myCanvas (800x600) güncellendi. Aktif piksel: ${activeCount} / 64,000`,
        'background: #f59e0b; color: #000000; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
        'color: #fbbf24; font-family: monospace; font-size: 11px;'
      );
      if (activeCount === 0) {
        console.warn('[CANVAS UYARI] VRAM (0xA0000) tamamen 00 (boş/siyah). #myCanvas üzerinde hiçbir piksel görünmez.');
      }
    }
  }

  private bindEvents(): void {
    // Temizle Butonu
    const clearBtn = this.container.querySelector?.('#btn-console-clear');
    clearBtn?.addEventListener?.('click', () => this.clear());

    // Geçmiş Aç/Kapa Butonu
    const historyBtn = this.container.querySelector?.('#btn-toggle-canvas-history');
    const historyPanel = this.container.querySelector?.('#crt-canvas-history-panel') as HTMLElement | null;
    historyBtn?.addEventListener?.('click', () => {
      this.isHistoryOpen = !this.isHistoryOpen;
      if (historyPanel) {
        historyPanel.style.display = this.isHistoryOpen ? 'block' : 'none';
      }
      if (this.isHistoryOpen) {
        this.renderHistoryList();
      }
    });

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

    // Boyut Değiştirme Butonları (Standart / Büyük / Geniş)
    const setSize = (size: 'normal' | 'large' | 'huge') => {
      this.currentMonitorSize = size;
      const canvas = this.container.querySelector?.('#myCanvas') as HTMLCanvasElement | null;
      const screenWrapper = this.container.querySelector?.('.crt-screen-wrapper') as HTMLElement | null;
      if (!canvas || !screenWrapper) return;

      const btnNormal = this.container.querySelector?.('#btn-size-normal') as HTMLElement | null;
      const btnLarge = this.container.querySelector?.('#btn-size-large') as HTMLElement | null;
      const btnHuge = this.container.querySelector?.('#btn-size-huge') as HTMLElement | null;

      [btnNormal, btnLarge, btnHuge].forEach(b => {
        if (b) {
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.style.fontWeight = '600';
        }
      });

      if (size === 'normal') {
        canvas.style.maxWidth = '640px';
        screenWrapper.style.minHeight = '420px';
        if (btnNormal) {
          btnNormal.style.background = '#2563eb';
          btnNormal.style.color = '#ffffff';
          btnNormal.style.fontWeight = '700';
        }
      } else if (size === 'large') {
        canvas.style.maxWidth = '840px';
        screenWrapper.style.minHeight = '520px';
        if (btnLarge) {
          btnLarge.style.background = '#2563eb';
          btnLarge.style.color = '#ffffff';
          btnLarge.style.fontWeight = '700';
        }
      } else if (size === 'huge') {
        canvas.style.maxWidth = '1060px';
        screenWrapper.style.minHeight = '640px';
        if (btnHuge) {
          btnHuge.style.background = '#2563eb';
          btnHuge.style.color = '#ffffff';
          btnHuge.style.fontWeight = '700';
        }
      }
    };

    this.container.querySelector?.('#btn-size-normal')?.addEventListener?.('click', () => setSize('normal'));
    this.container.querySelector?.('#btn-size-large')?.addEventListener?.('click', () => setSize('large'));
    this.container.querySelector?.('#btn-size-huge')?.addEventListener?.('click', () => setSize('huge'));

    // Tam Ekran Butonu
    this.container.querySelector?.('#btn-size-fullscreen')?.addEventListener?.('click', () => {
      const consoleBox = this.container.querySelector?.('.console-box') as HTMLElement | null;
      if (!consoleBox) return;
      if (!document.fullscreenElement) {
        consoleBox.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });
  }
}
