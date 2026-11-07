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
  onSave?: () => void;
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
  private fileHistories: Map<string, EditorHistory> = new Map();
  private currentFileId: string | null = null;

  /**
   * Code folding state. The textarea only contains the *visible* text; each fold
   * stores the full-code lines hidden below its header (`anchor` = 0-based visible
   * line index of the header). `getCode()` always returns the fully expanded code.
   */
  private folds: { anchor: number; hidden: string[] }[] = [];
  private lastVisible = '';

  private onCodeChange?: (code: string) => void;
  private onSave?: () => void;
  private onBreakpointToggle?: (line: number, active: boolean) => void;

  constructor(options: EditorOptions) {
    this.container = options.container;
    this.onCodeChange = options.onCodeChange;
    this.onSave = options.onSave;
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
          <textarea class="editor-textarea" id="editor-textarea" wrap="off" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
        </div>
      </div>
      <div class="editor-height-resizer" id="editor-height-resizer" title="Editör yüksekliğini ayarlamak için sürükleyin (çift tık: sıfırla)" role="separator" aria-orientation="horizontal"><div class="editor-height-resizer-handle"></div></div>
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
    this.setupHeightResizer();
  }

  private static readonly HEIGHT_KEY = 'asm-editor-height';

  private setupHeightResizer(): void {
    const card = this.container.querySelector('.editor-card') as HTMLElement | null;
    const resizer = this.container.querySelector('#editor-height-resizer') as HTMLElement | null;
    if (!card || !resizer) return;

    const MIN = 120;
    const clamp = (h: number) => Math.max(MIN, Math.min(h, Math.max(MIN, window.innerHeight * 0.9)));

    try {
      const saved = Number(localStorage.getItem(Editor.HEIGHT_KEY));
      if (saved > 0) card.style.height = `${clamp(saved)}px`;
    } catch { /* ignore storage errors */ }

    resizer.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startH = card.getBoundingClientRect().height;
      resizer.setPointerCapture(e.pointerId);
      resizer.classList.add('dragging');
      document.body.style.cursor = 'row-resize';

      const onMove = (ev: PointerEvent) => {
        card.style.height = `${clamp(startH + ev.clientY - startY)}px`;
        this.syncScroll();
      };
      const onUp = (ev: PointerEvent) => {
        if (resizer.hasPointerCapture(ev.pointerId)) resizer.releasePointerCapture(ev.pointerId);
        resizer.classList.remove('dragging');
        document.body.style.cursor = '';
        resizer.removeEventListener('pointermove', onMove);
        resizer.removeEventListener('pointerup', onUp);
        resizer.removeEventListener('pointercancel', onUp);
        try { localStorage.setItem(Editor.HEIGHT_KEY, String(Math.round(card.getBoundingClientRect().height))); } catch { /* ignore */ }
      };
      resizer.addEventListener('pointermove', onMove);
      resizer.addEventListener('pointerup', onUp);
      resizer.addEventListener('pointercancel', onUp);
    });

    resizer.addEventListener('dblclick', () => {
      card.style.height = '';
      try { localStorage.removeItem(Editor.HEIGHT_KEY); } catch { /* ignore */ }
    });
  }

  private syncScroll(): void {
    const top = this.textarea.scrollTop;
    const left = this.textarea.scrollLeft;
    this.gutterLayer.scrollTop = top;
    this.highlightLayer.scrollTop = top;
    this.highlightLayer.scrollLeft = left;
  }

  // ───────────────────────── Code folding helpers ─────────────────────────

  /** Maps each visible line index (0-based) to its real line index in the full code. */
  private realLineMap(): number[] {
    const visCount = this.textarea.value.split('\n').length;
    const fm = new Map(this.folds.map(f => [f.anchor, f.hidden.length]));
    const res: number[] = [];
    let off = 0;
    for (let v = 0; v < visCount; v++) {
      res.push(v + off);
      off += fm.get(v) ?? 0;
    }
    return res;
  }

  private expand(visible: string): string {
    if (this.folds.length === 0) return visible;
    const fm = new Map(this.folds.map(f => [f.anchor, f.hidden]));
    const out: string[] = [];
    visible.split('\n').forEach((line, v) => {
      out.push(line);
      const hidden = fm.get(v);
      if (hidden) out.push(...hidden);
    });
    return out.join('\n');
  }

  /** Converts a textarea (visible) offset into an offset in the full code. */
  private visToFull(offset: number): number {
    if (this.folds.length === 0) return offset;
    const before = this.textarea.value.slice(0, offset).split('\n');
    const v = before.length - 1;
    const col = before[v].length;
    const real = this.realLineMap()[v] ?? v;
    const full = this.getCode().split('\n');
    let pos = 0;
    for (let i = 0; i < real; i++) pos += full[i].length + 1;
    return pos + col;
  }

  /** Converts a full-code offset into a visible offset (hidden positions snap to the fold header end). */
  private fullToVis(offset: number): number {
    if (this.folds.length === 0) return Math.min(offset, this.textarea.value.length);
    const before = this.getCode().slice(0, offset).split('\n');
    const r = before.length - 1;
    let col = before[r].length;
    const map = this.realLineMap();
    const visLines = this.textarea.value.split('\n');
    let v = map.indexOf(r);
    if (v < 0) {
      v = 0;
      for (let i = 0; i < map.length; i++) if (map[i] < r) v = i;
      col = visLines[v].length;
    }
    let pos = 0;
    for (let i = 0; i < v; i++) pos += visLines[i].length + 1;
    return pos + Math.min(col, visLines[v].length);
  }

  private fullState(): { value: string; selectionStart: number; selectionEnd: number } {
    return {
      value: this.getCode(),
      selectionStart: this.visToFull(this.textarea.selectionStart),
      selectionEnd: this.visToFull(this.textarea.selectionEnd)
    };
  }

  /**
   * Foldable regions in the full code: `name PROC … ENDP`, `MACRO … ENDM`,
   * label blocks (`label:` until a blank line / next label) and `.DATA/.CODE/.STACK` sections.
   * Returns Map<startLine, endLine> (0-based, inclusive).
   */
  private computeFoldRegions(lines: string[]): Map<number, number> {
    const regions = new Map<number, number>();
    const strip = (s: string) => s.replace(/;.*$/, '').trim();
    const labelRe = /^[A-Za-z_?@$][\w.?@$]*:/;
    const sectionRe = /^\.(CODE|DATA|STACK)\b/i;
    const boundaryRe = /^(\S+\s+(PROC|ENDP|MACRO|ENDM)\b|ENDP\b|ENDM\b|END\b|\.(CODE|DATA|STACK|MODEL)\b)/i;

    // PROC/ENDP and MACRO/ENDM pairs
    const stack: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const t = strip(lines[i]);
      if (/^\S+\s+(PROC|MACRO)\b/i.test(t)) stack.push(i);
      else if (/^(\S+\s+)?(ENDP|ENDM)\b/i.test(t)) {
        const s = stack.pop();
        if (s !== undefined && i > s) regions.set(s, i);
      }
    }

    // Segment sections
    for (let i = 0; i < lines.length; i++) {
      if (!sectionRe.test(strip(lines[i]))) continue;
      let e = i;
      for (let j = i + 1; j < lines.length; j++) {
        const t = strip(lines[j]);
        if (sectionRe.test(t) || /^(\.MODEL|END)\b/i.test(t)) break;
        e = j;
      }
      while (e > i && lines[e].trim() === '') e--;
      if (e > i && !regions.has(i)) regions.set(i, e);
    }

    // Label blocks
    for (let i = 0; i < lines.length; i++) {
      if (regions.has(i)) continue;
      if (!labelRe.test(strip(lines[i]))) continue;
      let e = i;
      for (let j = i + 1; j < lines.length; j++) {
        const t = strip(lines[j]);
        if (lines[j].trim() === '' || labelRe.test(t) || boundaryRe.test(t)) break;
        e = j;
      }
      if (e > i) regions.set(i, e);
    }
    return regions;
  }

  /** Runs a fold mutation while preserving selection & scroll, then re-renders. */
  private mutateFolds(fn: () => void): void {
    const sel = this.fullState();
    const top = this.textarea.scrollTop;
    const left = this.textarea.scrollLeft;
    fn();
    this.folds.sort((a, b) => a.anchor - b.anchor);
    this.lastVisible = this.textarea.value;
    this.textarea.selectionStart = this.fullToVis(sel.selectionStart);
    this.textarea.selectionEnd = this.fullToVis(sel.selectionEnd);
    this.textarea.scrollTop = top;
    this.textarea.scrollLeft = left;
    this.updateHighlighting();
    this.updateGutter();
    this.syncScroll();
  }

  private unfoldRaw(fold: { anchor: number; hidden: string[] }): void {
    const lines = this.textarea.value.split('\n');
    lines.splice(fold.anchor + 1, 0, ...fold.hidden);
    this.folds = this.folds.filter(f => f !== fold);
    for (const f of this.folds) if (f.anchor > fold.anchor) f.anchor += fold.hidden.length;
    this.textarea.value = lines.join('\n');
  }

  private foldRaw(v: number): boolean {
    const map = this.realLineMap();
    const full = this.getCode().split('\n');
    const r = map[v];
    const e = r === undefined ? undefined : this.computeFoldRegions(full).get(r);
    if (r === undefined || e === undefined) return false;
    let w = v;
    while (w + 1 < map.length && map[w + 1] <= e) w++;
    if (w <= v) return false;
    const lastFold = this.folds.find(f => f.anchor === w);
    const realEnd = map[w] + (lastFold ? lastFold.hidden.length : 0);
    const hidden = full.slice(r + 1, realEnd + 1);
    const lines = this.textarea.value.split('\n');
    lines.splice(v + 1, w - v);
    this.folds = this.folds.filter(f => f.anchor <= v || f.anchor > w);
    for (const f of this.folds) if (f.anchor > w) f.anchor -= (w - v);
    this.folds.push({ anchor: v, hidden });
    this.textarea.value = lines.join('\n');
    return true;
  }

  /** Toggles the fold whose header is on the given visible line. */
  toggleFoldAtVisibleLine(v: number): void {
    const existing = this.folds.find(f => f.anchor === v);
    this.mutateFolds(() => {
      if (existing) this.unfoldRaw(existing);
      else this.foldRaw(v);
    });
  }

  /** Folds the innermost region containing the cursor. */
  foldAtCursor(): void {
    const v = this.textarea.value.slice(0, this.textarea.selectionStart).split('\n').length - 1;
    const map = this.realLineMap();
    const r = map[v];
    const regions = this.computeFoldRegions(this.getCode().split('\n'));
    let best: number | null = null;
    for (const [s, e] of regions) {
      if (s <= r && r <= e && (best === null || s > best)) best = s;
    }
    if (best === null) return;
    const hv = map.indexOf(best);
    if (hv >= 0 && !this.folds.some(f => f.anchor === hv)) this.mutateFolds(() => { this.foldRaw(hv); });
  }

  unfoldAtCursor(): void {
    const v = this.textarea.value.slice(0, this.textarea.selectionStart).split('\n').length - 1;
    const fold = this.folds.find(f => f.anchor === v);
    if (fold) this.mutateFolds(() => this.unfoldRaw(fold));
  }

  foldAll(): void {
    this.mutateFolds(() => {
      // Fold from bottom to top so outer regions end up containing inner ones
      for (let v = this.textarea.value.split('\n').length - 1; v >= 0; v--) {
        if (!this.folds.some(f => f.anchor === v)) this.foldRaw(v);
      }
    });
  }

  unfoldAll(): void {
    if (this.folds.length === 0) return;
    this.mutateFolds(() => {
      this.textarea.value = this.getCode();
      this.folds = [];
    });
  }

  /** Unfolds folds whose header lines are affected by a structural edit at the current selection. */
  private guardFolds(mode: 'none' | 'back' | 'fwd' | 'any' | 'move'): void {
    if (this.folds.length === 0) return;
    const val = this.textarea.value;
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const sLine = val.slice(0, start).split('\n').length - 1;
    const eLine = val.slice(0, end).split('\n').length - 1;
    let from = -1, to = -2;
    if (sLine !== eLine) { from = sLine; to = eLine; }
    else if (mode === 'back' && start === end && (start === 0 || val[start - 1] === '\n')) { from = sLine - 1; to = sLine; }
    else if (mode === 'fwd' && start === end && (start === val.length || val[start] === '\n')) { from = sLine; to = sLine; }
    else if (mode === 'any') { from = sLine; to = eLine; }
    else if (mode === 'move') { from = sLine - 1; to = eLine + 1; }
    const hit = this.folds.filter(f => f.anchor >= from && f.anchor <= to);
    if (hit.length === 0) return;
    this.mutateFolds(() => {
      for (const f of hit.sort((a, b) => b.anchor - a.anchor)) this.unfoldRaw(f);
    });
  }

  /** Shifts fold anchors after an edit changed the visible text. */
  private adjustFoldsForEdit(oldVis: string, newVis: string): void {
    if (this.folds.length === 0 || oldVis === newVis) return;
    const a = oldVis.split('\n');
    const b = newVis.split('\n');
    if (a.length === b.length) return;
    const m = Math.min(a.length, b.length);
    let p = 0;
    while (p < m && a[p] === b[p]) p++;
    let s = 0;
    while (s < m - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
    const delta = b.length - a.length;
    const oldEnd = a.length - s;
    const newEnd = b.length - s;
    for (const f of this.folds) {
      if (f.anchor >= oldEnd) f.anchor += delta;
      else if (f.anchor >= p) f.anchor = Math.max(0, Math.min(f.anchor, Math.max(p, newEnd - 1)));
    }
    // Merge any colliding anchors so no hidden code is ever lost
    this.folds.sort((x, y) => x.anchor - y.anchor);
    const merged: { anchor: number; hidden: string[] }[] = [];
    for (const f of this.folds) {
      const last = merged[merged.length - 1];
      if (last && last.anchor === f.anchor) last.hidden.push(...f.hidden);
      else merged.push(f);
    }
    this.folds = merged;
  }

  // ─────────────────────────────────────────────────────────────────────────

  private applyEdit(newVal: string, newStart: number, newEnd: number): void {
    // Snapshot state before applying discrete edit if uncommitted
    const before = this.fullState();
    const currentTop = this.history.getCurrent();
    if (!currentTop || currentTop.value !== before.value) {
      this.history.push(before);
    }

    const prevScrollTop = this.textarea.scrollTop;
    const prevScrollLeft = this.textarea.scrollLeft;

    const oldVis = this.textarea.value;
    this.textarea.value = newVal;
    this.adjustFoldsForEdit(oldVis, newVal);
    this.lastVisible = newVal;
    this.updateHighlighting();
    this.updateGutter();

    this.textarea.selectionStart = newStart;
    this.textarea.selectionEnd = newEnd;

    this.textarea.scrollTop = prevScrollTop;
    this.textarea.scrollLeft = prevScrollLeft;

    const after = this.fullState();
    this.history.push(after);

    this.syncScroll();
    this.onCodeChange?.(after.value);
  }

  /** Restores a full-code history state (folds are cleared since history stores expanded code). */
  private restoreState(state: { value: string; selectionStart: number; selectionEnd: number }): void {
    const prevScrollTop = this.textarea.scrollTop;
    const prevScrollLeft = this.textarea.scrollLeft;

    this.folds = [];
    this.textarea.value = state.value;
    this.lastVisible = state.value;
    this.updateHighlighting();
    this.updateGutter();

    this.textarea.selectionStart = state.selectionStart;
    this.textarea.selectionEnd = state.selectionEnd;

    this.textarea.scrollTop = prevScrollTop;
    this.textarea.scrollLeft = prevScrollLeft;

    this.syncScroll();
    this.onCodeChange?.(state.value);
  }

  undo(): void {
    const prevState = this.history.undo(this.fullState());
    if (prevState) this.restoreState(prevState);
  }

  redo(): void {
    const nextState = this.history.redo();
    if (nextState) this.restoreState(nextState);
  }

  private attachEvents(): void {
    this.textarea.addEventListener('scroll', () => this.syncScroll());

    // Mouse wheel over line numbers scrolls editor vertically
    this.gutterLayer.addEventListener('wheel', (e: WheelEvent) => {
      this.textarea.scrollTop += e.deltaY;
      this.syncScroll();
      e.preventDefault();
    }, { passive: false });

    // Before native edits (typing, paste, cut, drop…) unfold folds whose header would be affected
    this.textarea.addEventListener('beforeinput', (e: Event) => {
      const t = (e as InputEvent).inputType || '';
      if (t === 'historyUndo' || t === 'historyRedo') return;
      if (t.startsWith('deleteContentBackward') || t === 'deleteWordBackward' || t === 'deleteSoftLineBackward' || t === 'deleteHardLineBackward') this.guardFolds('back');
      else if (t.startsWith('deleteContentForward') || t === 'deleteWordForward' || t === 'deleteSoftLineForward' || t === 'deleteHardLineForward') this.guardFolds('fwd');
      else if (t === 'insertLineBreak' || t === 'insertParagraph' || t.startsWith('insertFrom') || t === 'deleteByCut' || t === 'deleteByDrag') this.guardFolds('any');
      else this.guardFolds('none');
    });

    this.textarea.addEventListener('input', (e: Event) => {
      const inputEvent = e as InputEvent;
      const val = this.textarea.value;

      this.adjustFoldsForEdit(this.lastVisible, val);
      this.lastVisible = val;

      const isPaste = inputEvent.inputType === 'insertFromPaste' || inputEvent.inputType === 'insertFromDrop';
      const isCut = inputEvent.inputType === 'deleteByCut';
      const isBoundary = isPaste || isCut || inputEvent.data === ' ' || inputEvent.data === '\n';

      const state = this.fullState();
      this.history.recordTyping(state, isBoundary);

      this.updateHighlighting();
      this.updateGutter();
      this.syncScroll();
      this.onCodeChange?.(state.value);
    });

    this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Folding shortcuts: Ctrl+Shift+[ fold, Ctrl+Shift+] unfold (e.code is layout independent)
      if (isCtrl && e.shiftKey && !e.altKey && (e.code === 'BracketLeft' || e.code === 'BracketRight')) {
        e.preventDefault();
        if (e.code === 'BracketLeft') this.foldAtCursor(); else this.unfoldAtCursor();
        return;
      }

      // Unfold folds touched by structural editor actions before computing the edit
      if (e.key === 'Tab' || (isCtrl && !e.altKey && (e.key === '/' || e.key === ';'))) this.guardFolds('none');
      else if (e.key === 'Enter' && !e.shiftKey && !isCtrl && !e.altKey) this.guardFolds('any');
      else if (e.key === 'Backspace' && !isCtrl && !e.altKey && !e.shiftKey) this.guardFolds('back');
      else if ((isCtrl && !e.altKey && !e.shiftKey && key === 'd') || (isCtrl && e.shiftKey && key === 'k')) this.guardFolds('any');
      else if (e.altKey && !isCtrl && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) this.guardFolds('move');

      const val = this.textarea.value;
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;

      // 0. Save: Ctrl+S
      if (isCtrl && !e.altKey && key === 's') {
        e.preventDefault();
        this.onSave?.();
        return;
      }

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
          const res = indentSelection(val, start, end, 4);
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
      const foldEl = (e.target as HTMLElement).closest('.gutter-fold');
      if (foldEl) {
        e.stopPropagation();
        const v = parseInt(foldEl.getAttribute('data-vline') || '-1', 10);
        if (v >= 0) this.toggleFoldAtVisibleLine(v);
        return;
      }
      const target = (e.target as HTMLElement).closest('.gutter-row');
      if (target) {
        const line = parseInt(target.getAttribute('data-line') || '0', 10);
        if (line > 0) this.toggleBreakpoint(line);
      }
    });

    // Clicking the "⋯ N satır" placeholder area of a folded header line unfolds it
    this.textarea.addEventListener('dblclick', () => {
      const v = this.textarea.value.slice(0, this.textarea.selectionStart).split('\n').length - 1;
      if (this.folds.some(f => f.anchor === v)) this.toggleFoldAtVisibleLine(v);
    });

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => this.syncScroll());
      ro.observe(this.textarea);
    }
    window.addEventListener('resize', () => this.syncScroll());
  }

  getCode(): string {
    return this.expand(this.textarea.value.replace(/\r\n/g, '\n'));
  }

  setCode(code: string): void {
    const cleanCode = code.replace(/\r\n/g, '\n');
    this.folds = [];
    this.textarea.value = cleanCode;
    this.lastVisible = cleanCode;
    this.history.reset(cleanCode, 0);
    if (this.currentFileId) {
      this.fileHistories.set(this.currentFileId, this.history);
    }
    this.updateHighlighting();
    this.updateGutter();
    this.syncScroll();
  }

  openFile(
    fileId: string,
    code: string,
    scroll?: { top: number; left: number },
    cursor?: { start: number; end: number }
  ): void {
    const cleanCode = code.replace(/\r\n/g, '\n');

    // If leaving a previously active file, persist its latest unsaved editor state into its history
    if (this.currentFileId && this.currentFileId !== fileId) {
      const cur = this.fullState();
      const curHist = this.fileHistories.get(this.currentFileId);
      if (curHist) {
        const top = curHist.getCurrent();
        if (!top || top.value !== cur.value) {
          curHist.push(cur);
        }
      }
    }

    this.currentFileId = fileId;

    let hist = this.fileHistories.get(fileId);
    if (!hist) {
      const initialPos = cursor ? cursor.start : 0;
      hist = new EditorHistory(cleanCode, initialPos);
      this.fileHistories.set(fileId, hist);
    } else {
      const top = hist.getCurrent();
      if (!top || top.value !== cleanCode) {
        hist.push({
          value: cleanCode,
          selectionStart: cursor?.start ?? 0,
          selectionEnd: cursor?.end ?? 0
        });
      }
    }

    this.history = hist;
    this.folds = [];
    this.textarea.value = cleanCode;
    this.lastVisible = cleanCode;

    if (cursor) {
      this.textarea.selectionStart = Math.min(cursor.start, cleanCode.length);
      this.textarea.selectionEnd = Math.min(cursor.end, cleanCode.length);
    } else {
      const top = hist.getCurrent();
      if (top) {
        this.textarea.selectionStart = Math.min(top.selectionStart, cleanCode.length);
        this.textarea.selectionEnd = Math.min(top.selectionEnd, cleanCode.length);
      }
    }

    this.updateHighlighting();
    this.updateGutter();

    if (scroll) {
      this.setScroll(scroll);
    } else {
      this.syncScroll();
    }
  }

  getCursor(): { start: number; end: number } {
    return {
      start: this.visToFull(this.textarea.selectionStart),
      end: this.visToFull(this.textarea.selectionEnd)
    };
  }

  setCursor(cursor: { start: number; end: number }): void {
    this.textarea.selectionStart = this.fullToVis(cursor.start);
    this.textarea.selectionEnd = this.fullToVis(cursor.end);
  }

  removeFileHistory(fileId: string): void {
    this.fileHistories.delete(fileId);
    if (this.currentFileId === fileId) {
      this.currentFileId = null;
    }
  }

  setActiveLine(line: number | null): void {
    this.activeLine = line;
    // Reveal the executing line if it is hidden inside a fold
    if (line !== null && this.folds.length > 0 && !this.realLineMap().includes(line - 1)) {
      this.mutateFolds(() => {
        let guard = 0;
        while (!this.realLineMap().includes(line - 1) && guard++ < 1000) {
          const map = this.realLineMap();
          const owner = this.folds.find(f => map[f.anchor] < line - 1 && line - 1 <= map[f.anchor] + f.hidden.length);
          if (!owner) break;
          this.unfoldRaw(owner);
        }
      });
    }
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
    const hadErrors = this.errors.size > 0;
    this.errors.clear();
    const content = this.container.querySelector('#errors-content') as HTMLElement;
    if (content) {
      content.className = 'errors-content status-ok';
      content.textContent = 'Compiled successfully with zero errors.';
    }
    if (hadErrors) {
      this.updateGutter();
      this.updateHighlighting();
    }
  }

  getScroll(): { top: number; left: number } {
    return {
      top: this.textarea.scrollTop,
      left: this.textarea.scrollLeft
    };
  }

  setScroll(scroll: { top?: number; left?: number }): void {
    if (scroll.top !== undefined) this.textarea.scrollTop = scroll.top;
    if (scroll.left !== undefined) this.textarea.scrollLeft = scroll.left;
    this.syncScroll();
  }

  private scrollToLine(line: number): void {
    const lineHeight = 22;
    const visIdx = Math.max(0, this.realLineMap().indexOf(line - 1));
    const targetScroll = Math.max(0, visIdx * lineHeight - 60);
    this.textarea.scrollTop = targetScroll;
    this.syncScroll();
  }

  private updateGutter(): void {
    const full = this.getCode().split('\n');
    const map = this.realLineMap();
    const regions = this.computeFoldRegions(full);
    const folded = new Set(this.folds.map(f => f.anchor));
    let html = '';

    for (let v = 0; v < map.length; v++) {
      const i = map[v] + 1;
      const isBP = this.breakpoints.has(i);
      const isActive = this.activeLine === i;
      const errorMsg = this.errors.get(i);
      const isFolded = folded.has(v);

      let classes = 'gutter-row';
      if (isActive) classes += ' active-ip-row';
      if (isBP) classes += ' has-bp';
      if (errorMsg) classes += ' has-error';
      if (isFolded) classes += ' is-folded';

      const foldIcon = isFolded
        ? `<span class="gutter-fold folded" data-vline="${v}" title="Genişlet (Ctrl+Shift+])">▸</span>`
        : regions.has(map[v])
          ? `<span class="gutter-fold" data-vline="${v}" title="Daralt (Ctrl+Shift+[)">▾</span>`
          : '';

      html += `
        <div class="${classes}" data-line="${i}" title="${errorMsg || ''}">
          <span class="gutter-bp-dot"></span>
          <span class="gutter-arrow">▶</span>
          ${errorMsg ? '<span class="gutter-err-icon">⊗</span>' : ''}
          <span class="gutter-num">${i}</span>
          ${foldIcon}
        </div>
      `;
    }

    this.gutterLayer.innerHTML = html;
  }

  private updateHighlighting(): void {
    const lines = this.textarea.value.split('\n');
    const map = this.realLineMap();
    const foldSizes = new Map(this.folds.map(f => [f.anchor, f.hidden.length]));
    let highlightedHtml = '';

    for (let i = 0; i < lines.length; i++) {
      const lineNum = map[i] + 1;
      const lineText = lines[i];
      const isActive = this.activeLine === lineNum;
      const hasError = this.errors.has(lineNum);
      const hiddenCount = foldSizes.get(i);

      let rowClass = 'editor-line-row';
      if (isActive) rowClass += ' active-code-line';
      if (hasError) rowClass += ' error-code-line';

      const colored = this.highlightSyntax(lineText);
      const placeholder = hiddenCount
        ? `<span class="fold-placeholder"> ⋯ ${hiddenCount} satır </span>`
        : '';
      highlightedHtml += `<div class="${rowClass}">${colored || (placeholder ? '' : '&nbsp;')}${placeholder}</div>`;
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

    const directives = new Set([
      'ORG', 'DB', 'DW', 'DUP', 'OFFSET', 'BYTE', 'WORD', 'PTR', 'EQU', 'PROC', 'ENDP',
      '.MODEL', '.STACK', '.DATA', '.CODE', 'ASSUME', 'END',
      '@DATA', '@CODE', '@STACK'
    ]);
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
      if (/[a-zA-Z0-9_$.?@]/.test(ch)) {
        let word = '';
        while (i < len && /[a-zA-Z0-9_$.?@]/.test(line[i])) {
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
