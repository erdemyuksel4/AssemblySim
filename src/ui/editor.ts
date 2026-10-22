import {
  EditorHistory,
  indentSelection,
  dedentSelection,
  autoIndentOnEnter,
  toggleComment,
  duplicateLineOrSelection,
  moveLines,
  smartBackspace,
  deleteLine
} from './editorActions.js';

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
  private history: EditorHistory = new EditorHistory();

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
          <textarea class="editor-textarea" id="editor-textarea" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
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

  private syncScroll(): void {
    this.highlightLayer.scrollTop = this.textarea.scrollTop;
    this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
    this.gutterLayer.scrollTop = this.textarea.scrollTop;
  }

  private applyEdit(newVal: string, newStart: number, newEnd: number): void {
    const curVal = this.textarea.value;
    const curStart = this.textarea.selectionStart;
    const curEnd = this.textarea.selectionEnd;

    // Snapshot state before applying discrete edit if uncommitted
    const currentTop = this.history.getCurrent();
    if (!currentTop || currentTop.value !== curVal) {
      this.history.push({ value: curVal, selectionStart: curStart, selectionEnd: curEnd });
    }

    const prevScrollTop = this.textarea.scrollTop;
    const prevScrollLeft = this.textarea.scrollLeft;

    this.textarea.value = newVal;
    this.textarea.selectionStart = newStart;
    this.textarea.selectionEnd = newEnd;

    this.textarea.scrollTop = prevScrollTop;
    this.textarea.scrollLeft = prevScrollLeft;

    this.history.push({ value: newVal, selectionStart: newStart, selectionEnd: newEnd });

    this.updateHighlighting();
    this.updateGutter();
    this.syncScroll();
    this.onCodeChange?.(newVal);
  }

  undo(): void {
    const curVal = this.textarea.value;
    const curStart = this.textarea.selectionStart;
    const curEnd = this.textarea.selectionEnd;

    const prevState = this.history.undo({
      value: curVal,
      selectionStart: curStart,
      selectionEnd: curEnd
    });

    if (prevState) {
      const prevScrollTop = this.textarea.scrollTop;
      const prevScrollLeft = this.textarea.scrollLeft;

      this.textarea.value = prevState.value;
      this.textarea.selectionStart = prevState.selectionStart;
      this.textarea.selectionEnd = prevState.selectionEnd;

      this.textarea.scrollTop = prevScrollTop;
      this.textarea.scrollLeft = prevScrollLeft;

      this.updateHighlighting();
      this.updateGutter();
      this.syncScroll();
      this.onCodeChange?.(prevState.value);
    }
  }

  redo(): void {
    const nextState = this.history.redo();
    if (nextState) {
      const prevScrollTop = this.textarea.scrollTop;
      const prevScrollLeft = this.textarea.scrollLeft;

      this.textarea.value = nextState.value;
      this.textarea.selectionStart = nextState.selectionStart;
      this.textarea.selectionEnd = nextState.selectionEnd;

      this.textarea.scrollTop = prevScrollTop;
      this.textarea.scrollLeft = prevScrollLeft;

      this.updateHighlighting();
      this.updateGutter();
      this.syncScroll();
      this.onCodeChange?.(nextState.value);
    }
  }

  private attachEvents(): void {
    this.textarea.addEventListener('scroll', () => this.syncScroll());

    this.textarea.addEventListener('input', (e: Event) => {
      const inputEvent = e as InputEvent;
      const val = this.textarea.value;
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;

      const isPaste = inputEvent.inputType === 'insertFromPaste' || inputEvent.inputType === 'insertFromDrop';
      const isCut = inputEvent.inputType === 'deleteByCut';
      const isBoundary = isPaste || isCut || inputEvent.data === ' ' || inputEvent.data === '\n';

      this.history.recordTyping(
        { value: val, selectionStart: start, selectionEnd: end },
        isBoundary
      );

      this.updateHighlighting();
      this.updateGutter();
      this.syncScroll();
      this.onCodeChange?.(val);
    });

    this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const val = this.textarea.value;
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;

      // 1. Undo: Ctrl+Z (without Shift)
      if (isCtrl && !e.altKey && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
        return;
      }

      // 2. Redo: Ctrl+Y OR Ctrl+Shift+Z
      if (isCtrl && !e.altKey && (key === 'y' || (key === 'z' && e.shiftKey))) {
        e.preventDefault();
        this.redo();
        return;
      }

      // 3. Tab & Shift+Tab (Indentation & Dedentation with 4 spaces)
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          const res = dedentSelection(val, start, end, 4);
          this.applyEdit(res.text, res.newStart, res.newEnd);
        } else {
          const res = indentSelection(val, start, end, '    ');
          this.applyEdit(res.text, res.newStart, res.newEnd);
        }
        return;
      }

      // 4. Enter: Auto-indentation
      if (e.key === 'Enter' && !e.shiftKey && !isCtrl && !e.altKey) {
        e.preventDefault();
        const res = autoIndentOnEnter(val, start, end);
        this.applyEdit(res.text, res.newPos, res.newPos);
        return;
      }

      // 5. Comment Toggle: Ctrl + / OR Ctrl + ;
      if (isCtrl && !e.altKey && (e.key === '/' || e.key === ';')) {
        e.preventDefault();
        const res = toggleComment(val, start, end);
        this.applyEdit(res.text, res.newStart, res.newEnd);
        return;
      }

      // 6. Duplicate Line or Selection: Ctrl + D OR Alt + Shift + ArrowDown
      if ((isCtrl && !e.altKey && !e.shiftKey && key === 'd') ||
          (e.altKey && e.shiftKey && e.key === 'ArrowDown')) {
        e.preventDefault();
        const res = duplicateLineOrSelection(val, start, end);
        this.applyEdit(res.text, res.newStart, res.newEnd);
        return;
      }

      // 7. Move Line Up: Alt + ArrowUp
      if (e.altKey && !e.shiftKey && !isCtrl && e.key === 'ArrowUp') {
        e.preventDefault();
        const res = moveLines(val, start, end, 'up');
        if (res) {
          this.applyEdit(res.text, res.newStart, res.newEnd);
        }
        return;
      }

      // 8. Move Line Down: Alt + ArrowDown
      if (e.altKey && !e.shiftKey && !isCtrl && e.key === 'ArrowDown') {
        e.preventDefault();
        const res = moveLines(val, start, end, 'down');
        if (res) {
          this.applyEdit(res.text, res.newStart, res.newEnd);
        }
        return;
      }

      // 9. Delete Line: Ctrl + Shift + K
      if (isCtrl && e.shiftKey && key === 'k') {
        e.preventDefault();
        const res = deleteLine(val, start, end);
        this.applyEdit(res.text, res.newPos, res.newPos);
        return;
      }

      // 10. Smart Backspace: deletes up to 4 spaces of indentation
      if (e.key === 'Backspace' && !isCtrl && !e.altKey && !e.shiftKey && start === end) {
        const res = smartBackspace(val, start, end, 4);
        if (res) {
          e.preventDefault();
          this.applyEdit(res.text, res.newPos, res.newPos);
          return;
        }
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
    return this.textarea.value.replace(/\r\n/g, '\n');
  }

  setCode(code: string): void {
    this.textarea.value = code;
    this.history.reset(code, 0);
    this.updateHighlighting();
    this.updateGutter();
    this.syncScroll();
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
      highlightedHtml += `<div class="${rowClass}">${colored || '&nbsp;'}</div>`;
    }

    this.highlightLayer.innerHTML = highlightedHtml;
  }

  private highlightSyntax(line: string): string {
    let result = '';
    let i = 0;
    const len = line.length;

    const opcodes = new Set([
      'MOV', 'LEA', 'ADD', 'ADC', 'SUB', 'SBB', 'INC', 'DEC', 'CMP', 'JMP', 'JE', 'JNE', 'JZ', 'JNZ',
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

      // Comment: semicolon to end of line
      if (ch === ';') {
        result += `<span class="hl-comment">${this.escapeHtml(line.substring(i))}</span>`;
        break;
      }

      // Strings: single or double quotes
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

      // Words / Identifiers / Numbers
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
