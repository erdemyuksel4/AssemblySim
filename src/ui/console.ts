export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'stdout';

export class ConsoleView {
  private container: HTMLElement;
  private logs: { text: string; level: LogLevel; timestamp: string }[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  log(text: string, level: LogLevel = 'info'): void {
    const time = new Date().toLocaleTimeString();
    this.logs.push({ text, level, timestamp: time });
    this.appendLog(text, level, time);
  }

  clear(): void {
    this.logs = [];
    const output = this.container.querySelector('.console-body');
    if (output) output.innerHTML = '';
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="console-wrapper">
        <div class="console-header">
          <span class="console-title">TERMINAL & KONSOL ÇIKTISI</span>
          <button id="btn-console-clear" class="btn-console-clear" title="Konsolu Temizle">Temizle</button>
        </div>
        <div class="console-body" id="console-output"></div>
      </div>
    `;

    this.container.querySelector('#btn-console-clear')?.addEventListener('click', () => {
      this.clear();
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
