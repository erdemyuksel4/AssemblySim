export interface EditorOptions {
  container: HTMLElement;
  initialCode: string;
  onCodeChange?: (code: string) => void;
  onBreakpointToggle?: (line: number, active: boolean) => void;
}

export class Editor {
  private container: HTMLElement;
  private editorEl!: HTMLElement;
  private gutterLayer!: HTMLElement;
  private errorsBox!: HTMLElement;

  private activeLine: number | null = null;
  private breakpoints: Set<number> = new Set();
  private errors: Map<number, string> = new Map();

  private onCodeChange?: (code: string) => void;
  private onBreakpointToggle?: (line: number, active: boolean) => void;

  private isComposing: boolean = false;

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
          <pre class="code-editor-editable" id="code-editor-editable" contenteditable="plaintext-only" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></pre>
        </div>
      </div>
      <div class="errors-box" id="editor-errors-box">
        <div class="errors-header">Errors:</div>
        <div class="errors-content" id="errors-content">No errors.</div>
      </div>
    `;

    this.gutterLayer = this.container.querySelector('#editor-gutter') as HTMLElement;
    this.editorEl = this.container.querySelector('#code-editor-editable') as HTMLElement;
    this.errorsBox = this.container.querySelector('#editor-errors-box') as HTMLElement;

    // Fallback for browsers that don't support plaintext-only
    if (this.editorEl.contentEditable !== 'plaintext-only') {
      this.editorEl.contentEditable = 'true';
    }

    this.attachEvents();
  }

  private attachEvents(): void {
    const syncScroll = () => {
      this.gutterLayer.scrollTop = this.editorEl.scrollTop;
    };

    this.editorEl.addEventListener('scroll', syncScroll);

    this.editorEl.addEventListener('input', () => {
      if (this.isComposing) return;
      this.applyHighlightingPreservingCaret();
      this.updateGutter();
      this.onCodeChange?.(this.getCode());
    });

    this.editorEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertText', false, '  ');
      } else if (e.key === 'Enter') {
        // Native plaintext-only enter inserts newline cleanly
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
    return this.editorEl.innerText.replace(/\r\n/g, '\n');
  }

  setCode(code: string): void {
    this.editorEl.innerText = code;
    this.highlightCode();
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
    this.editorEl.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }

  private updateGutter(): void {
    const lines = this.getCode().split('\n');
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

  private applyHighlightingPreservingCaret(): void {
    const caretOffset = this.getCaretOffset(this.editorEl);
    this.highlightCode();
    this.setCaretOffset(this.editorEl, caretOffset);
  }

  private highlightCode(): void {
    const raw = this.getCode();
    const highlighted = this.syntaxHighlight(raw);
    this.editorEl.innerHTML = highlighted + (raw.endsWith('\n') ? '<br>' : '');
  }

  private getCaretOffset(element: HTMLElement): number {
    let caretOffset = 0;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  private setCaretOffset(element: HTMLElement, offset: number): void {
    const sel = window.getSelection();
    if (!sel) return;

    let charCount = 0;
    const nodeStack: Node[] = [element];
    let node: Node | undefined;
    let found = false;

    while (!found && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + (node.textContent?.length || 0);
        if (offset <= nextCharCount) {
          const range = document.createRange();
          range.setStart(node, Math.max(0, offset - charCount));
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          found = true;
        }
        charCount = nextCharCount;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
  }

  private syntaxHighlight(code: string): string {
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

    const lines = code.split('\n');
    const highlightedLines = lines.map(line => {
      let result = '';
      let i = 0;
      const len = line.length;

      while (i < len) {
        const ch = line[i];

        // Comment: from ';' to end of line
        if (ch === ';') {
          result += `<span class="hl-comment">${this.escapeHtml(line.substring(i))}</span>`;
          break;
        }

        // Strings
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

        // Words / Numbers
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
    });

    return highlightedLines.join('\n');
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
