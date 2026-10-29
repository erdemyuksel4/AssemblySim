export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'stdout' | 'port';

export interface ConsoleOptions {
  onInput?: (input: string) => void;
}

/**
 * 8086 Retro CRT Monitör & I/O Terminali
 * Kod editörünün hemen altında yer alır.
 * BIOS INT 10h, INT 21h, port I/O ve klavye girişlerini
 * gerçek bir CRT monitör deneyimiyle (VGA, Yeşil Fosfor, Kehribar) sunar.
 */
export class ConsoleView {
  private container: HTMLElement;
  private logs: { text: string; level: LogLevel; timestamp: string }[] = [];
  private onInput?: (input: string) => void;
  private isWaiting: boolean = false;

  // Monitor Display State
  private activeViewMode: 'monitor' | 'logs' = 'monitor';
  private colorMode: 'vga' | 'green' | 'amber' = 'vga';
  private crtLines: string[] = [];
  private currentCrtLine: string = '';
  private cursorBlink: boolean = true;
  private blinkTimer: number | null = null;

  constructor(container: HTMLElement, options?: ConsoleOptions) {
    this.container = container;
    this.onInput = options?.onInput;
    this.render();
    this.startBlinkTimer();
  }

  destroy(): void {
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
  }

  setOnInput(callback: (input: string) => void): void {
    this.onInput = callback;
  }

  private startBlinkTimer(): void {
    if (this.blinkTimer) clearInterval(this.blinkTimer);
    this.blinkTimer = window.setInterval(() => {
      this.cursorBlink = !this.cursorBlink;
      const cursorEl = this.container.querySelector('.crt-cursor') as HTMLElement | null;
      if (cursorEl) {
        cursorEl.style.opacity = this.cursorBlink ? '1' : '0';
      }
    }, 500);
  }

  log(text: string, level: LogLevel = 'info'): void {
    const time = new Date().toLocaleTimeString();
    this.logs.push({ text, level, timestamp: time });
    this.appendLog(text, level, time);
  }

  /**
   * Ekrana raw karakter/string basar (BIOS INT 10h Teletype, INT 21h, OS Boot mesajları)
   */
  appendStdout(charOrStr: string): void {
    // 1. Monitör Ekranına Ekle
    for (let i = 0; i < charOrStr.length; i++) {
      const ch = charOrStr[i];
      if (ch === '\n') {
        this.crtLines.push(this.currentCrtLine);
        this.currentCrtLine = '';
      } else if (ch === '\r') {
        // \n ile satır sonu halledilir
      } else {
        this.currentCrtLine += ch;
      }
    }

    if (this.crtLines.length > 30) {
      this.crtLines = this.crtLines.slice(-30);
    }
    this.updateCrtDisplay();

    // 2. Sistem Logları Akışına da Ekle
    const output = this.container.querySelector('#console-output');
    if (!output) return;

    let lastLine = output.lastElementChild as HTMLElement;
    if (!lastLine || !lastLine.classList.contains('console-stdout-stream')) {
      lastLine = document.createElement('div');
      lastLine.className = 'console-line console-stdout console-stdout-stream';
      const time = new Date().toLocaleTimeString();
      const timeSpan = document.createElement('span');
      timeSpan.className = 'console-time';
      timeSpan.textContent = `[${time}] `;
      lastLine.appendChild(timeSpan);

      const contentSpan = document.createElement('span');
      contentSpan.className = 'console-stream-text';
      lastLine.appendChild(contentSpan);
      output.appendChild(lastLine);
    }

    const textSpan = lastLine.querySelector('.console-stream-text') as HTMLElement;
    if (textSpan) {
      textSpan.textContent += charOrStr;
    }
    output.scrollTop = output.scrollHeight;
  }

  /**
   * Set waiting-for-input visual state
   */
  setWaitingForInput(waiting: boolean, hint?: string): void {
    this.isWaiting = waiting;
    const inputField = this.container.querySelector('#console-input-field') as HTMLInputElement;
    const statusBadge = this.container.querySelector('#console-status-badge') as HTMLElement;
    const inputWrap = this.container.querySelector('.console-input-wrap') as HTMLElement;

    if (!inputField || !statusBadge) return;

    if (waiting) {
      statusBadge.textContent = 'GİRDİ BEKLENİYOR';
      statusBadge.className = 'console-status-badge waiting';
      inputWrap?.classList.add('waiting-active');
      inputField.placeholder = hint || "Klavye / IN / INT için bir değer girin ve Enter'a basın...";
      inputField.focus();
    } else {
      statusBadge.textContent = 'HAZIR';
      statusBadge.className = 'console-status-badge ready';
      inputWrap?.classList.remove('waiting-active');
      inputField.placeholder = "Girdi yazın ve Enter'a basın (Klavye / IN / INT 21h)...";
    }
  }

  clear(): void {
    this.logs = [];
    this.crtLines = [];
    this.currentCrtLine = '';
    const output = this.container.querySelector('#console-output');
    if (output) output.innerHTML = '';
    this.updateCrtDisplay();
  }

  private renderCrtContent(): string {
    if (this.crtLines.length === 0 && !this.currentCrtLine) {
      return `
        <div class="crt-idle-screen">
          <div class="crt-banner-line">8086 REAL-MODE SYSTEM MONITOR</div>
          <div class="crt-banner-line">VGA BIOS V2.0 • 80x25 TEXT DISPLAY</div>
          <div class="crt-subtext">Kodunuzu derleyip [Çalıştır] veya [Adım] ile yürüttüğünüzde ekrandaki çıktılar burada canlanır.</div>
          <div class="crt-prompt-line">
            <span class="crt-cursor">_</span>
          </div>
        </div>
      `;
    }

    const linesHtml = this.crtLines.map(line => `
      <div class="crt-line-row">${this.escapeHtml(line)}</div>
    `).join('');

    const activeLineHtml = `
      <div class="crt-line-row">
        <span>${this.escapeHtml(this.currentCrtLine)}</span>
        <span class="crt-cursor">_</span>
      </div>
    `;

    return linesHtml + activeLineHtml;
  }

  private updateCrtDisplay(): void {
    const screenContent = this.container.querySelector('#crt-screen-content');
    if (screenContent) {
      screenContent.innerHTML = this.renderCrtContent();
      const screenEl = this.container.querySelector('#crt-screen-box');
      if (screenEl) {
        screenEl.scrollTop = screenEl.scrollHeight;
      }
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="console-wrapper monitor-console-wrapper">
        <!-- CRT Monitor / Console Header -->
        <div class="console-header monitor-header">
          <div class="console-header-left">
            <span class="console-terminal-icon">🖥️</span>
            <span class="console-title">8086 CRT MONİTÖRÜ</span>
            <span class="console-status-badge ready" id="console-status-badge">HAZIR</span>

            <!-- View Switcher (Monitör vs Sistem Logları) -->
            <div class="monitor-tab-group">
              <button class="btn-mon-tab ${this.activeViewMode === 'monitor' ? 'active' : ''}" data-mode="monitor" title="Monitör Ekranı">
                🖥️ Monitör
              </button>
              <button class="btn-mon-tab ${this.activeViewMode === 'logs' ? 'active' : ''}" data-mode="logs" title="Sistem ve Derleme Logları">
                📋 Sistem Logları
              </button>
            </div>
          </div>

          <div class="console-header-right">
            <!-- Palette Selector -->
            <div class="crt-mini-palettes">
              <button class="btn-mini-pal ${this.colorMode === 'vga' ? 'active' : ''}" data-pal="vga" title="VGA Beyaz / Renkli Mod">VGA</button>
              <button class="btn-mini-pal ${this.colorMode === 'green' ? 'active' : ''}" data-pal="green" title="Yeşil Fosfor Monitör">GRN</button>
              <button class="btn-mini-pal ${this.colorMode === 'amber' ? 'active' : ''}" data-pal="amber" title="Kehribar Monitör">AMB</button>
            </div>
            <button id="btn-console-clear" class="btn-console-clear" title="Ekranı ve Logları Temizle">Temizle</button>
          </div>
        </div>

        <!-- Body 1: CRT Monitor Screen (Default) -->
        <div class="crt-screen-wrapper ${this.activeViewMode === 'monitor' ? 'active' : ''}" id="crt-view-wrapper">
          <div class="crt-screen-box ${this.colorMode}" id="crt-screen-box" tabindex="0" title="Klavyenizle yazı yazmak için monitöre tıklayın">
            <div class="crt-scanlines"></div>
            <div class="crt-glow"></div>
            <div class="crt-content" id="crt-screen-content">
              ${this.renderCrtContent()}
            </div>
          </div>
        </div>

        <!-- Body 2: Standard Console Logs List -->
        <div class="console-body ${this.activeViewMode === 'logs' ? 'active' : ''}" id="console-output"></div>

        <!-- Bottom Input Bar (Tuş girişi / INT 16h / IN portu için) -->
        <div class="console-input-wrap" id="console-input-wrap">
          <span class="console-prompt-sym">❯</span>
          <input type="text" id="console-input-field" class="console-input-field" placeholder="Monitöre girdi yazın ve Enter'a basın (Klavye / INT 16h / IN)..." autocomplete="off" />
          <button id="btn-console-send" class="btn-console-send" title="Gönder">Gönder</button>
        </div>
      </div>
    `;

    // View Mode Toggle Buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-mon-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as 'monitor' | 'logs';
        if (mode) {
          this.activeViewMode = mode;
          this.container.querySelectorAll('.btn-mon-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const crtWrap = this.container.querySelector('#crt-view-wrapper');
          const logsOutput = this.container.querySelector('#console-output');
          if (mode === 'monitor') {
            crtWrap?.classList.add('active');
            logsOutput?.classList.remove('active');
          } else {
            crtWrap?.classList.remove('active');
            logsOutput?.classList.add('active');
          }
        }
      });
    });

    // Palette Selector Buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-mini-pal').forEach(btn => {
      btn.addEventListener('click', () => {
        const pal = btn.dataset.pal as 'vga' | 'green' | 'amber';
        if (pal) {
          this.colorMode = pal;
          this.container.querySelectorAll('.btn-mini-pal').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const screenBox = this.container.querySelector('#crt-screen-box');
          if (screenBox) {
            screenBox.className = `crt-screen-box ${pal}`;
          }
        }
      });
    });

    // Clear Button
    const clearBtn = this.container.querySelector('#btn-console-clear');
    clearBtn?.addEventListener('click', () => this.clear());

    // Submit Input Function
    const sendBtn = this.container.querySelector('#btn-console-send');
    const inputField = this.container.querySelector('#console-input-field') as HTMLInputElement;

    const submitInput = () => {
      const val = inputField.value;
      if (val.length === 0) return;
      this.log(`> ${val}`, 'info');
      
      // Monitöre de yerel echo yapalım
      this.crtLines.push(`> ${val}`);
      this.updateCrtDisplay();

      inputField.value = '';
      this.setWaitingForInput(false);

      const trimmed = val.trim();
      const hexMatch = trimmed.match(/^(?:0x([0-9a-fA-F]+)|([0-9a-fA-F]+)h)$/i);
      if (hexMatch) {
        const hexNum = parseInt(hexMatch[1] || hexMatch[2], 16);
        this.onInput?.(String.fromCharCode(hexNum & 0xFF));
      } else {
        this.onInput?.(val + '\r');
      }
    };

    sendBtn?.addEventListener('click', submitInput);

    inputField?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitInput();
      }
    });

    // Direct Typing on CRT Screen when focused
    const crtScreen = this.container.querySelector<HTMLElement>('#crt-screen-box');
    crtScreen?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'].includes(e.key)) {
        e.preventDefault();
      }

      let charCode: number | null = null;
      if (e.key === 'Enter') {
        charCode = 0x0D;
      } else if (e.key === 'Backspace') {
        charCode = 0x08;
      } else if (e.key === 'Tab') {
        charCode = 0x09;
      } else if (e.key.length === 1) {
        charCode = e.key.charCodeAt(0);
      }

      if (charCode !== null) {
        if (charCode === 0x0D) {
          this.onInput?.('\r');
          this.crtLines.push(this.currentCrtLine);
          this.currentCrtLine = '';
        } else if (charCode === 0x08) {
          this.onInput?.('\b');
          this.currentCrtLine = this.currentCrtLine.slice(0, -1);
        } else {
          this.onInput?.(String.fromCharCode(charCode));
          this.currentCrtLine += String.fromCharCode(charCode);
        }
        this.updateCrtDisplay();
      }
    });
  }

  private appendLog(text: string, level: LogLevel, timestamp: string): void {
    const output = this.container.querySelector('#console-output');
    if (!output) return;

    const row = document.createElement('div');
    row.className = `console-line console-${level}`;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'console-time';
    timeSpan.textContent = `[${timestamp}] `;

    const textSpan = document.createElement('span');
    textSpan.className = 'console-text';
    textSpan.textContent = text;

    row.appendChild(timeSpan);
    row.appendChild(textSpan);
    output.appendChild(row);

    output.scrollTop = output.scrollHeight;
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
