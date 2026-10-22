export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'stdout' | 'port';

export interface ConsoleOptions {
  onInput?: (input: string) => void;
}

export class ConsoleView {
  private container: HTMLElement;
  private logs: { text: string; level: LogLevel; timestamp: string }[] = [];
  private onInput?: (input: string) => void;
  private isWaiting: boolean = false;

  constructor(container: HTMLElement, options?: ConsoleOptions) {
    this.container = container;
    this.onInput = options?.onInput;
    this.render();
  }

  setOnInput(callback: (input: string) => void): void {
    this.onInput = callback;
  }

  log(text: string, level: LogLevel = 'info'): void {
    const time = new Date().toLocaleTimeString();
    this.logs.push({ text, level, timestamp: time });
    this.appendLog(text, level, time);
  }

  /**
   * Append raw stdout characters (e.g. from INT 10h Teletype or INT 21h)
   */
  appendStdout(charOrStr: string): void {
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
    const output = this.container.querySelector('#console-output');
    if (output) output.innerHTML = '';
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="console-wrapper">
        <div class="console-header">
          <div class="console-header-left">
            <span class="console-terminal-icon">📟</span>
            <span class="console-title">TERMINAL & I/O KONSOLU</span>
            <span class="console-status-badge ready" id="console-status-badge">HAZIR</span>
          </div>
          <div class="console-header-right">
            <button id="btn-console-clear" class="btn-console-clear" title="Konsolu Temizle">Temizle</button>
          </div>
        </div>
        <div class="console-body" id="console-output"></div>
        <div class="console-input-wrap" id="console-input-wrap">
          <span class="console-prompt-sym">❯</span>
          <input type="text" id="console-input-field" class="console-input-field" placeholder="Girdi yazın ve Enter'a basın (Klavye / IN / INT 21h)..." autocomplete="off" />
          <button id="btn-console-send" class="btn-console-send" title="Gönder">Gönder</button>
        </div>
      </div>
    `;

    const clearBtn = this.container.querySelector('#btn-console-clear');
    const sendBtn = this.container.querySelector('#btn-console-send');
    const inputField = this.container.querySelector('#console-input-field') as HTMLInputElement;

    clearBtn?.addEventListener('click', () => this.clear());

    const submitInput = () => {
      const val = inputField.value;
      if (val.length === 0) return;
      // Echo user input
      this.log(`> ${val}`, 'info');
      inputField.value = '';
      this.setWaitingForInput(false);
      this.onInput?.(val);
    };

    sendBtn?.addEventListener('click', submitInput);

    inputField?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitInput();
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
}
