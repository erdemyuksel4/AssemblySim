export interface EditorOptions {
  container: HTMLElement;
  initialCode: string;
  onCodeChange?: (code: string) => void;
  onBreakpointToggle?: (line: number, active: boolean) => void;
}

export class Editor {
  private container: HTMLElement;
  private textarea!: HTMLTextAreaElement;
  private highlightLayer!: HTMLElement;
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
          <pre class="editor-highlight" id="editor-highlight" aria-hidden="true"></pre>
          <textarea class="editor-textarea" id="editor-textarea" spellcheck="false" autocomplete="off"></textarea>
        </div>
        <div class="editor-side-tools">
          <button class="tool-icon-btn" id="btn-copy-code" title="Kodu Kopyala">📋</button>
          <button class="tool-icon-btn" id="btn-clear-code" title="Temizle">🗑️</button>
        </div>
      </div>
      <div class="errors-box" id="editor-errors-box">
        <div class="errors-header">Errors:</div>
        <div class="errors-content" id="errors-content">No errors.</div>
      </div>
    `;

    this.gutterLayer = this.container.querySelector('#editor-gutter') as HTMLElement;
    this.highlightLayer = this.container.querySelector('#editor-highlight') as HTMLElement;
    this.textarea = this.container.querySelector('#editor-textarea') as HTMLTextAreaElement;
    this.errorsBox = this.container.querySelector('#editor-errors-box') as HTMLElement;

    this.attachEvents();
  }

  private attachEvents(): void {
    const syncScroll = () => {
      this.highlightLayer.scrollTop = this.textarea.scrollTop;
      this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
      this.gutterLayer.scrollTop = this.textarea.scrollTop;
    };

    this.textarea.addEventListener('scroll', syncScroll);

    this.textarea.addEventListener('input', () => {
      this.updateHighlighting();
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
        this.updateHighlighting();
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

    this.container.querySelector('#btn-copy-code')?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.textarea.value);
    });

    this.container.querySelector('#btn-clear-code')?.addEventListener('click', () => {
      this.setCode('');
    });
  }

  getCode(): string {
    return this.textarea.value;
  }

  setCode(code: string): void {
    this.textarea.value = code;
    this.updateHighlighting();
    this.updateGutter();
  }

  setActiveLine(line: number | null): void {
    this.activeLine = line;
    this.updateGutter();
    this.updateHighlighting();
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
    this.updateHighlighting();
  }

  clearErrors(): void {
    this.errors.clear();
    const content = this.container.querySelector('#errors-content') as HTMLElement;
    if (content) {
      content.className = 'errors-content status-ok';
      content.textContent = 'Compiled successfully with zero errors.';
    }
    this.updateGutter();
    this.updateHighlighting();
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

  private updateHighlighting(): void {
    const lines = this.textarea.value.split('\n');
    let highlightedHtml = '';

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const lineText = lines[i];
      const isActive = this.activeLine === lineNum;
      const hasError = this.errors.has(lineNum);

      let rowClass = 'editor-line-row';
      if (isActive) rowClass += ' active-code-line';
      if (hasError) rowClass += ' error-code-line';

      const colored = this.highlightSyntax(lineText);
      highlightedHtml += `<div class="${rowClass}">${colored || ' '}</div>`;
    }

    this.highlightLayer.innerHTML = highlightedHtml + '\n';
  }

  private highlightSyntax(line: string): string {
    let result = '';
    let i = 0;
    const len = line.length;

    const opcodes = new Set([
      'MOV', 'LEA', 'ADD', 'SUB', 'INC', 'DEC', 'CMP', 'JMP', 'JE', 'JNE', 'JZ', 'JNZ',
      'JC', 'JNC', 'JA', 'JB', 'JAE', 'JBE', 'JG', 'JL', 'JGE', 'JLE', 'JS', 'JNS',
      'JO', 'JNO', 'JP', 'JNP', 'JCXZ', 'LOOP', 'LOOPE', 'LOOPNE', 'LOOPZ', 'LOOPNZ',
      'NOP', 'HLT', 'AND', 'OR', 'XOR', 'NOT', 'NEG', 'TEST', 'SHL', 'SHR', 'SAL',
      'SAR', 'ROL', 'ROR', 'RCL', 'RCR', 'XCHG', 'PUSH', 'POP', 'PUSHF', 'POPF',
      'CALL', 'RET', 'RETN', 'MUL', 'DIV', 'IMUL', 'IDIV', 'INT', 'MOVSB', 'MOVSW',
      'STOSB', 'STOSW', 'LODSB', 'LODSW', 'REP', 'REPNZ', 'REPZ', 'CLC', 'STC',
      'CMC', 'CLD', 'STD', 'CLI', 'STI', 'CBW', 'CWD', 'LAHF', 'SAHF', 'XLAT', 'XLATB',
      'DAA', 'DAS', 'AAA', 'AAS', 'AAM', 'AAD', 'LDS', 'LES', 'IN', 'OUT'
    ]);

    const directives = new Set(['ORG', 'DB', 'DW', 'DUP', 'OFFSET', 'BYTE', 'WORD', 'PTR']);
    const registers = new Set([
      'AX', 'BX', 'CX', 'DX', 'SI', 'DI', 'BP', 'SP', 'IP',
      'CS', 'DS', 'ES', 'SS',
      'AL', 'AH', 'BL', 'BH', 'CL', 'CH', 'DL', 'DH'
    ]);

    while (i < len) {
      const ch = line[i];

      if (ch === ';') {
        result += `<span class="hl-comment">${this.escapeHtml(line.substring(i))}</span>`;
        break;
      }

      if (ch === "'" || ch === '"') {
        const quote = ch;
        let str = quote;
        i++;
        while (i < len && line[i] !== quote) {
          str += line[i];
          i++;
        }
        if (i < len) {
          str += line[i];
          i++;
        }
        result += `<span class="hl-string">${this.escapeHtml(str)}</span>`;
        continue;
      }

      if (/[a-zA-Z0-9_$.?]/.test(ch)) {
        let word = '';
        while (i < len && /[a-zA-Z0-9_$.?]/.test(line[i])) {
          word += line[i];
          i++;
        }

        const upper = word.toUpperCase();

        if (i < len && line[i] === ':') {
          result += `<span class="hl-label">${this.escapeHtml(word)}:</span>`;
          i++;
        } else if (opcodes.has(upper)) {
          result += `<span class="hl-opcode">${this.escapeHtml(word)}</span>`;
        } else if (directives.has(upper)) {
          result += `<span class="hl-directive">${this.escapeHtml(word)}</span>`;
        } else if (registers.has(upper)) {
          result += `<span class="hl-reg">${this.escapeHtml(word)}</span>`;
        } else if (/^[0-9][0-9A-Fa-f]*[Hh]?$/.test(word) || /^[+-]?[0-9]+$/.test(word) || /^[01]+[Bb]$/.test(word)) {
          result += `<span class="hl-number">${this.escapeHtml(word)}</span>`;
        } else {
          result += this.escapeHtml(word);
        }
        continue;
      }

      result += this.escapeHtml(ch);
      i++;
    }

    return result;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
