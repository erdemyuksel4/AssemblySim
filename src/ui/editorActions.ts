export interface HistoryEntry {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export class EditorHistory {
  private stack: HistoryEntry[] = [];
  private pointer: number = -1;
  private maxStackSize: number = 200;
  private debounceTimer: any = null;

  constructor(initialValue: string = '', initialPos: number = 0) {
    this.reset(initialValue, initialPos);
  }

  reset(value: string, pos: number = 0): void {
    this.clearDebounce();
    this.stack = [{ value, selectionStart: pos, selectionEnd: pos }];
    this.pointer = 0;
  }

  private clearDebounce(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  getCurrent(): HistoryEntry | undefined {
    return this.stack[this.pointer];
  }

  push(entry: HistoryEntry): void {
    this.clearDebounce();
    if (this.pointer >= 0 && this.stack[this.pointer].value === entry.value) {
      this.stack[this.pointer].selectionStart = entry.selectionStart;
      this.stack[this.pointer].selectionEnd = entry.selectionEnd;
      return;
    }
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push({ ...entry });
    if (this.stack.length > this.maxStackSize) {
      this.stack.shift();
    } else {
      this.pointer++;
    }
  }

  recordTyping(entry: HistoryEntry, isBoundary: boolean = false): void {
    if (this.pointer >= 0 && this.stack[this.pointer].value === entry.value) {
      this.stack[this.pointer].selectionStart = entry.selectionStart;
      this.stack[this.pointer].selectionEnd = entry.selectionEnd;
      return;
    }

    if (isBoundary) {
      this.push(entry);
      return;
    }

    this.clearDebounce();
    this.debounceTimer = setTimeout(() => {
      this.push(entry);
      this.debounceTimer = null;
    }, 300);
  }

  canUndo(): boolean {
    return this.pointer > 0;
  }

  canRedo(): boolean {
    return this.pointer < this.stack.length - 1;
  }

  undo(currentEntry?: HistoryEntry): HistoryEntry | null {
    this.clearDebounce();
    if (currentEntry && this.pointer >= 0 && currentEntry.value !== this.stack[this.pointer].value) {
      this.push(currentEntry);
    }
    if (this.pointer > 0) {
      this.pointer--;
      return this.stack[this.pointer];
    }
    return null;
  }

  redo(): HistoryEntry | null {
    this.clearDebounce();
    if (this.pointer < this.stack.length - 1) {
      this.pointer++;
      return this.stack[this.pointer];
    }
    return null;
  }
}

/**
 * Indents selected lines (or inserts 4 spaces if no selection).
 */
export function indentSelection(
  val: string,
  start: number,
  end: number,
  indentStr = '    '
): { text: string; newStart: number; newEnd: number } {
  // If no selection: insert 4 spaces at cursor
  if (start === end) {
    const text = val.substring(0, start) + indentStr + val.substring(end);
    return {
      text,
      newStart: start + indentStr.length,
      newEnd: start + indentStr.length
    };
  }

  // Multi-line / selection indent
  const firstLineStart = val.lastIndexOf('\n', start - 1) + 1;
  const effectiveEnd = (end > start && val[end - 1] === '\n') ? end - 1 : end;
  let nextNewline = val.indexOf('\n', effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;

  const before = val.substring(0, firstLineStart);
  const block = val.substring(firstLineStart, nextNewline);
  const after = val.substring(nextNewline);

  const lines = block.split('\n');
  const indentedLines = lines.map(line => indentStr + line);
  const newBlock = indentedLines.join('\n');
  const text = before + newBlock + after;

  const addedPerLine = indentStr.length;
  const totalAdded = lines.length * addedPerLine;
  const newStart = (start === firstLineStart) ? start : start + addedPerLine;
  const newEnd = end + totalAdded;

  return { text, newStart, newEnd };
}

/**
 * Dedents (unindents) selected lines or current line by up to 4 spaces (or 1 tab).
 */
export function dedentSelection(
  val: string,
  start: number,
  end: number,
  maxIndent = 4
): { text: string; newStart: number; newEnd: number } {
  const firstLineStart = val.lastIndexOf('\n', start - 1) + 1;
  const effectiveEnd = (end > start && val[end - 1] === '\n') ? end - 1 : end;
  let nextNewline = val.indexOf('\n', effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;

  const before = val.substring(0, firstLineStart);
  const block = val.substring(firstLineStart, nextNewline);
  const after = val.substring(nextNewline);

  const lines = block.split('\n');
  let totalRemoved = 0;
  let removedOnFirstLine = 0;

  const dedentedLines = lines.map((line, idx) => {
    let removeCount = 0;
    if (line.startsWith('\t')) {
      removeCount = 1;
    } else {
      while (removeCount < maxIndent && line[removeCount] === ' ') {
        removeCount++;
      }
    }
    if (idx === 0) removedOnFirstLine = removeCount;
    totalRemoved += removeCount;
    return line.substring(removeCount);
  });

  const newBlock = dedentedLines.join('\n');
  const text = before + newBlock + after;

  let newStart = start - removedOnFirstLine;
  if (newStart < firstLineStart) newStart = firstLineStart;
  const newEnd = Math.max(newStart, end - totalRemoved);

  return { text, newStart, newEnd };
}

/**
 * Handles Enter key with auto-indentation and label recognition.
 */
export function autoIndentOnEnter(
  val: string,
  start: number,
  end: number
): { text: string; newPos: number } {
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  const lineBeforeCursor = val.substring(lineStart, start);

  const indentMatch = lineBeforeCursor.match(/^[ \t]*/);
  let indent = indentMatch ? indentMatch[0] : '';

  // If line ends with ':' (label, e.g. START:), indent subsequent code by 4 spaces
  const codePart = lineBeforeCursor.replace(/;.*$/, '').trim();
  if (codePart.endsWith(':')) {
    if (indent === '') {
      indent = '    ';
    } else {
      indent = indent + '    ';
    }
  }

  const insertion = '\n' + indent;
  const text = val.substring(0, start) + insertion + val.substring(end);
  const newPos = start + insertion.length;

  return { text, newPos };
}

/**
 * Toggles assembly comments ';' on selected lines or current line.
 */
export function toggleComment(
  val: string,
  start: number,
  end: number
): { text: string; newStart: number; newEnd: number } {
  const firstLineStart = val.lastIndexOf('\n', start - 1) + 1;
  const effectiveEnd = (end > start && val[end - 1] === '\n') ? end - 1 : end;
  let nextNewline = val.indexOf('\n', effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;

  const before = val.substring(0, firstLineStart);
  const block = val.substring(firstLineStart, nextNewline);
  const after = val.substring(nextNewline);

  const lines = block.split('\n');
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  const allCommented = nonEmptyLines.length > 0 && nonEmptyLines.every(l => /^\s*;/.test(l));

  let totalDelta = 0;
  let firstLineDelta = 0;

  const processedLines = lines.map((line, idx) => {
    let delta = 0;
    let newLine = line;
    if (allCommented) {
      // Uncomment
      const match = line.match(/^(\s*); ?(.*)$/);
      if (match) {
        newLine = match[1] + match[2];
        delta = newLine.length - line.length;
      }
    } else {
      // Comment
      if (line.trim().length > 0 || lines.length === 1) {
        const match = line.match(/^(\s*)(.*)$/);
        if (match) {
          newLine = match[1] + '; ' + match[2];
          delta = newLine.length - line.length;
        }
      }
    }
    if (idx === 0) firstLineDelta = delta;
    totalDelta += delta;
    return newLine;
  });

  const newBlock = processedLines.join('\n');
  const text = before + newBlock + after;

  let newStart = start + firstLineDelta;
  if (newStart < firstLineStart) newStart = firstLineStart;
  let newEnd = end + totalDelta;
  if (newEnd < newStart) newEnd = newStart;

  return { text, newStart, newEnd };
}

/**
 * Duplicates current line or selected text.
 */
export function duplicateLineOrSelection(
  val: string,
  start: number,
  end: number
): { text: string; newStart: number; newEnd: number } {
  if (start !== end) {
    const selectedText = val.substring(start, end);
    const text = val.substring(0, end) + selectedText + val.substring(end);
    return {
      text,
      newStart: end,
      newEnd: end + selectedText.length
    };
  }

  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = val.indexOf('\n', start);
  if (lineEnd === -1) lineEnd = val.length;

  const line = val.substring(lineStart, lineEnd);
  const text = val.substring(0, lineEnd) + '\n' + line + val.substring(lineEnd);
  const offset = start - lineStart;
  const newPos = lineEnd + 1 + offset;

  return {
    text,
    newStart: newPos,
    newEnd: newPos
  };
}

/**
 * Moves line(s) up or down.
 */
export function moveLines(
  val: string,
  start: number,
  end: number,
  direction: 'up' | 'down'
): { text: string; newStart: number; newEnd: number } | null {
  const firstLineStart = val.lastIndexOf('\n', start - 1) + 1;
  const effectiveEnd = (end > start && val[end - 1] === '\n') ? end - 1 : end;
  let nextNewline = val.indexOf('\n', effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;

  if (direction === 'up') {
    if (firstLineStart === 0) return null;
    const prevLineStart = val.lastIndexOf('\n', firstLineStart - 2) + 1;
    const prevLine = val.substring(prevLineStart, firstLineStart - 1);

    const block = val.substring(firstLineStart, nextNewline);
    const before = val.substring(0, prevLineStart);
    const after = val.substring(nextNewline);

    const text = before + block + '\n' + prevLine + after;
    const shift = prevLine.length + 1;
    return {
      text,
      newStart: start - shift,
      newEnd: end - shift
    };
  } else {
    if (nextNewline >= val.length) return null;
    let lineAfterEnd = val.indexOf('\n', nextNewline + 1);
    if (lineAfterEnd === -1) lineAfterEnd = val.length;

    const block = val.substring(firstLineStart, nextNewline);
    const nextLine = val.substring(nextNewline + 1, lineAfterEnd);
    const before = val.substring(0, firstLineStart);
    const after = val.substring(lineAfterEnd);

    const text = before + nextLine + '\n' + block + after;
    const shift = nextLine.length + 1;
    return {
      text,
      newStart: start + shift,
      newEnd: end + shift
    };
  }
}

/**
 * Smart Backspace: removes up to 4 spaces when cursor is at leading indentation.
 */
export function smartBackspace(
  val: string,
  start: number,
  end: number,
  tabSize = 4
): { text: string; newPos: number } | null {
  if (start !== end) return null;

  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  const textBefore = val.substring(lineStart, start);

  if (textBefore.length > 0 && /^ +$/.test(textBefore)) {
    const col = textBefore.length;
    const count = (col % tabSize === 0) ? tabSize : (col % tabSize);
    const text = val.substring(0, start - count) + val.substring(start);
    const newPos = start - count;
    return { text, newPos };
  }

  return null;
}

/**
 * Deletes current line or lines.
 */
export function deleteLine(
  val: string,
  start: number,
  end: number
): { text: string; newPos: number } {
  const firstLineStart = val.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = val.indexOf('\n', end);

  if (lineEnd === -1) {
    if (firstLineStart > 0) {
      const text = val.substring(0, firstLineStart - 1);
      return { text, newPos: firstLineStart - 1 };
    } else {
      return { text: '', newPos: 0 };
    }
  } else {
    const text = val.substring(0, firstLineStart) + val.substring(lineEnd + 1);
    const newPos = Math.min(firstLineStart, text.length);
    return { text, newPos };
  }
}
