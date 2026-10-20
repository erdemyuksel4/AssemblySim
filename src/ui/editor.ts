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
  private lineNumbersLayer!: HTMLElement;

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
      <div class="editor-wrapper">
        <div class="editor-line-numbers" id="editor-gutter"></div>
        <div class="editor-code-container">
          <pre class="editor-highlight" id="editor-highlight" aria-hidden="true"></pre>
          <textarea class="editor-textarea" id="editor-textarea" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
        </div>
      </div>
    `;

    this.lineNumbersLayer = this.container.querySelector('#editor-gutter') as HTMLElement;
    this.highlightLayer = this.container.querySelector('#editor-highlight') as HTMLElement;
    this.textarea = this.container.querySelector('#editor-textarea') as HTMLTextAreaElement;

    this.attachEvents();
  }

  private attachEvents(): void {
    const syncScroll = () => {
      this.highlightLayer.scrollTop = this.textarea.scrollTop;
      this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
      this.lineNumbersLayer.scrollTop = this.textarea.scrollTop;
    };

    this.textarea.addEventListener('scroll', syncScroll);

    this.textarea.addEventListener('input', () => {
      this.updateHighlighting();
      this.updateLineNumbers();
      this.onCodeChange?.(this.textarea.value);
    });

    // Support Tab key in textarea
    this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const val = this.textarea.value;
        this.textarea.value = val.substring(0, start) + '  ' + val.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this.updateHighlighting();
        this.updateLineNumbers();
        this.onCodeChange?.(this.textarea.value);
      }
    });

    // Breakpoint toggling on line numbers
    this.lineNumbersLayer.addEventListener('click', (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.line-number-cell');
      if (target) {
        const line = parseInt(target.getAttribute('data-line') || '0', 10);
        if (line > 0) {
          this.toggleBreakpoint(line);
        }
      }
    });
  }

  getCode(): string {
    return this.textarea.value;
  }

  setCode(code: string): void {
    this.textarea.value = code;
    this.updateHighlighting();
    this.updateLineNumbers();
  }

  setActiveLine(line: number | null): void {
    this.activeLine = line;
    this.updateLineNumbers();
    this.updateHighlighting();
    if (line !== null) {
      this.scrollToLine(line);
    }
  }

  setBreakpoints(lines: number[]): void {
    this.breakpoints = new Set(lines);
    this.updateLineNumbers();
  }

  toggleBreakpoint(line: number): void {
    let active = false;
    if (this.breakpoints.has(line)) {
      this.breakpoints.delete(line);
    } else {
      this.breakpoints.add(line);
      active = true;
    }
    this.updateLineNumbers();
    this.onBreakpointToggle?.(line, active);
  }

  isBreakpoint(line: number): boolean {
    return this.breakpoints.has(line);
  }

  getBreakpoints(): number[] {
    return Array.from(this.breakpoints);
  }

  setErrors(errors: { line: number; message: string }[]): void {
    this.errors.clear();
    for (const err of errors) {
      this.errors.set(err.line, err.message);
    }
    this.updateLineNumbers();
    this.updateHighlighting();
  }

  clearErrors(): void {
    this.errors.clear();
    this.updateLineNumbers();
    this.updateHighlighting();
  }

  private scrollToLine(line: number): void {
    const lineHeight = 21; // approximate line height in px
    const targetScroll = (line - 1) * lineHeight - 60;
    this.textarea.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }

  private updateLineNumbers(): void {
    const lines = this.textarea.value.split('\n');
    let html = '';

    for (let i = 1; i <= lines.length; i++) {
      const isBP = this.breakpoints.has(i);
      const isActive = this.activeLine === i;
      const errorMsg = this.errors.get(i);

      let classes = 'line-number-cell';
      if (isActive) classes += ' active-line';
      if (isBP) classes += ' has-breakpoint';
      if (errorMsg) classes += ' has-error';

      const tooltip = errorMsg ? `title="${this.escapeHtml(errorMsg)}"` : '';

      html += `
        <div class="${classes}" data-line="${i}" ${tooltip}>
          <span class="bp-dot"></span>
          <span class="active-arrow">▶</span>
          <span class="num-text">${i}</span>
          ${errorMsg ? '<span class="error-badge">!</span>' : ''}
        </div>
      `;
    }

    this.lineNumbersLayer.innerHTML = html;
  }

  private updateHighlighting(): void {
    const lines = this.textarea.value.split('\n');
    let highlightedHtml = '';

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const lineText = lines[i];
      const isActive = this.activeLine === lineNum;
      const hasError = this.errors.has(lineNum);

      let rowClass = 'code-line';
      if (isActive) rowClass += ' active-code-row';
      if (hasError) rowClass += ' error-code-row';

      const colored = this.highlightSyntax(lineText);
      highlightedHtml += `<div class="${rowClass}">${colored || ' '}</div>`;
    }

    // append trailing newline dummy if empty
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
      'STOSB', 'STOSW', 'LODSB', 'LODSW', 'REP', 'REPNZ', 'REPZ'
    ]);

    const directives = new Set(['ORG', 'DB', 'DW', 'DUP', 'OFFSET', 'BYTE', 'WORD', 'PTR']);

    const registers = new Set([
      'AX', 'BX', 'CX', 'DX', 'SI', 'DI', 'BP', 'SP', 'IP',
      'CS', 'DS', 'ES', 'SS',
      'AL', 'AH', 'BL', 'BH', 'CL', 'CH', 'DL', 'DH'
    ]);

    while (i < len) {
      const ch = line[i];

      // Comment: from ';' to end of line
      if (ch === ';') {
        const comment = line.substring(i);
        result += `<span class="syntax-comment">${this.escapeHtml(comment)}</span>`;
        break;
      }

      // String literal: '...' or "..."
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
        result += `<span class="syntax-string">${this.escapeHtml(str)}</span>`;
        continue;
      }

      // Identifier / Keyword / Number
      if (/[a-zA-Z0-9_$.?]/.test(ch)) {
        let word = '';
        while (i < len && /[a-zA-Z0-9_$.?]/.test(line[i])) {
          word += line[i];
          i++;
        }

        const upper = word.toUpperCase();

        // Check if label declaration (followed by ':')
        if (i < len && line[i] === ':') {
          result += `<span class="syntax-label">${this.escapeHtml(word)}:</span>`;
          i++; // consume ':'
        } else if (opcodes.has(upper)) {
          result += `<span class="syntax-opcode">${this.escapeHtml(word)}</span>`;
        } else if (directives.has(upper)) {
          result += `<span class="syntax-directive">${this.escapeHtml(word)}</span>`;
        } else if (registers.has(upper)) {
          result += `<span class="syntax-register">${this.escapeHtml(word)}</span>`;
        } else if (/^[0-9][0-9A-Fa-f]*[Hh]?$/.test(word) || /^[+-]?[0-9]+$/.test(word) || /^[01]+[Bb]$/.test(word)) {
          result += `<span class="syntax-number">${this.escapeHtml(word)}</span>`;
        } else {
          result += `<span class="syntax-identifier">${this.escapeHtml(word)}</span>`;
        }
        continue;
      }

      // Other symbols
      result += this.escapeHtml(ch);
      i++;
    }

    return result;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
