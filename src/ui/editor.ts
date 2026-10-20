export interface EditorOptions {
  container: HTMLElement;
  initialCode: string;
  onCodeChange?: (code: string) => void;
  onBreakpointToggle?: (line: number, active: boolean) => void;
}

export class Editor {
  private container: HTMLElement;
  private textarea!: HTMLTextAreaElement;
  private gutterLayer!: HTMLElement;
  private errorsBox!: HTMLElement;

  private activeLine: number | null = null;
  private breakpoints: Set<number> = new Set();
  private errors: Map<number, string> = new Map();

  private onCodeChange?: (code: string) => void;
  private onBreakpointToggle?: (line: number, active: boolean) => void;

  constructor(options: EditorOptions) {
    this.container = options.container;
    this.onCodeChange = options.onCodeChange;
    this.onBreakpointToggle = options.onBreakpointToggle;

    this.render();
    this.setCode(options.initialCode);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="editor-card">
        <div class="editor-gutter" id="editor-gutter"></div>
        <div class="editor-body">
          <textarea class="editor-textarea" id="editor-textarea" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
        </div>
      </div>
      <div class="errors-box" id="editor-errors-box">
        <div class="errors-header">Errors:</div>
        <div class="errors-content" id="errors-content">No errors.</div>
      </div>
    `;

    this.gutterLayer = this.container.querySelector('#editor-gutter') as HTMLElement;
    this.textarea = this.container.querySelector('#editor-textarea') as HTMLTextAreaElement;
    this.errorsBox = this.container.querySelector('#editor-errors-box') as HTMLElement;

    this.attachEvents();
  }

  private attachEvents(): void {
    const syncScroll = () => {
      this.gutterLayer.scrollTop = this.textarea.scrollTop;
    };

    this.textarea.addEventListener('scroll', syncScroll);

    this.textarea.addEventListener('input', () => {
      this.updateGutter();
      this.onCodeChange?.(this.textarea.value);
    });

    this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const val = this.textarea.value;
        this.textarea.value = val.substring(0, start) + '  ' + val.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this.updateGutter();
        this.onCodeChange?.(this.textarea.value);
      }
    });

    this.gutterLayer.addEventListener('click', (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.gutter-row');
      if (target) {
        const line = parseInt(target.getAttribute('data-line') || '0', 10);
        if (line > 0) this.toggleBreakpoint(line);
      }
    });
  }

  getCode(): string {
    return this.textarea.value;
  }

  setCode(code: string): void {
    this.textarea.value = code;
    this.updateGutter();
  }

  setActiveLine(line: number | null): void {
    this.activeLine = line;
    this.updateGutter();
    if (line !== null) {
      this.scrollToLine(line);
    }
  }

  toggleBreakpoint(line: number): void {
    let active = false;
    if (this.breakpoints.has(line)) {
      this.breakpoints.delete(line);
    } else {
      this.breakpoints.add(line);
      active = true;
    }
    this.updateGutter();
    this.onBreakpointToggle?.(line, active);
  }

  isBreakpoint(line: number): boolean {
    return this.breakpoints.has(line);
  }

  setErrors(errors: { line: number; message: string }[]): void {
    this.errors.clear();
    const content = this.container.querySelector('#errors-content') as HTMLElement;
    if (errors.length === 0) {
      this.clearErrors();
      return;
    }

    let text = '';
    for (const err of errors) {
      this.errors.set(err.line, err.message);
      text += `Syntax Error at line ${err.line} : ${err.message}\n`;
    }

    if (content) {
      content.className = 'errors-content';
      content.textContent = text;
    }

    this.updateGutter();
  }

  clearErrors(): void {
    this.errors.clear();
    const content = this.container.querySelector('#errors-content') as HTMLElement;
    if (content) {
      content.className = 'errors-content status-ok';
      content.textContent = 'Compiled successfully with zero errors.';
    }
    this.updateGutter();
  }

  private scrollToLine(line: number): void {
    const lineHeight = 22;
    const targetScroll = (line - 1) * lineHeight - 60;
    this.textarea.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }

  private updateGutter(): void {
    const lines = this.textarea.value.split('\n');
    let html = '';

    for (let i = 1; i <= lines.length; i++) {
      const isBP = this.breakpoints.has(i);
      const isActive = this.activeLine === i;
      const errorMsg = this.errors.get(i);

      let classes = 'gutter-row';
      if (isActive) classes += ' active-ip-row';
      if (isBP) classes += ' has-bp';
      if (errorMsg) classes += ' has-error';

      html += `
        <div class="${classes}" data-line="${i}" title="${errorMsg || ''}">
          <span class="gutter-bp-dot"></span>
          <span class="gutter-arrow">▶</span>
          ${errorMsg ? '<span class="gutter-err-icon">⊗</span>' : ''}
          <span class="gutter-num">${i}</span>
        </div>
      `;
    }

    this.gutterLayer.innerHTML = html;
  }
}
