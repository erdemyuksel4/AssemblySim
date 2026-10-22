import { describe, it, expect } from 'vitest';
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
} from '../src/ui/editorActions';

describe('Editor Actions & History', () => {
  describe('Tab Indentation (4 spaces)', () => {
    it('inserts 4 spaces when no text is selected', () => {
      const initial = 'MOV AX, 1';
      const result = indentSelection(initial, 0, 0);
      expect(result.text).toBe('    MOV AX, 1');
      expect(result.newStart).toBe(4);
      expect(result.newEnd).toBe(4);
    });

    it('indents multiple selected lines by 4 spaces each', () => {
      const initial = 'MOV AX, 1\nMOV BX, 2\nHLT';
      // Select lines 1 and 2
      const result = indentSelection(initial, 0, 19);
      expect(result.text).toBe('    MOV AX, 1\n    MOV BX, 2\nHLT');
      expect(result.newStart).toBe(0);
      expect(result.newEnd).toBe(19 + 8);
    });

    it('indents single line even when selection is within the line', () => {
      const initial = 'MOV AX, 1';
      const result = indentSelection(initial, 4, 6); // "AX" selected
      expect(result.text).toBe('    MOV AX, 1');
      expect(result.newStart).toBe(8);
      expect(result.newEnd).toBe(10);
    });
  });

  describe('Shift+Tab Dedentation', () => {
    it('dedents 4 spaces when no text is selected', () => {
      const initial = '    MOV AX, 1';
      const result = dedentSelection(initial, 4, 4);
      expect(result.text).toBe('MOV AX, 1');
      expect(result.newStart).toBe(0);
      expect(result.newEnd).toBe(0);
    });

    it('dedents multiple selected lines by up to 4 spaces', () => {
      const initial = '    MOV AX, 1\n    MOV BX, 2\nHLT';
      const result = dedentSelection(initial, 0, 27);
      expect(result.text).toBe('MOV AX, 1\nMOV BX, 2\nHLT');
      expect(result.newStart).toBe(0);
      expect(result.newEnd).toBe(27 - 8);
    });

    it('handles lines with fewer than 4 leading spaces gracefully', () => {
      const initial = '  MOV AX, 1\n   MOV BX, 2';
      const result = dedentSelection(initial, 0, initial.length);
      expect(result.text).toBe('MOV AX, 1\nMOV BX, 2');
    });

    it('does nothing if lines have 0 leading spaces', () => {
      const initial = 'MOV AX, 1\nMOV BX, 2';
      const result = dedentSelection(initial, 0, initial.length);
      expect(result.text).toBe(initial);
    });
  });

  describe('Undo / Redo (EditorHistory)', () => {
    it('tracks undo and redo states properly with Ctrl+Z and Ctrl+Y flow', () => {
      const history = new EditorHistory('START', 5);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);

      // User makes an edit
      history.push({ value: 'START:\n    MOV AX, 1', selectionStart: 20, selectionEnd: 20 });
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      // Another edit
      history.push({ value: 'START:\n    MOV AX, 1\n    HLT', selectionStart: 27, selectionEnd: 27 });
      expect(history.getCurrent()?.value).toBe('START:\n    MOV AX, 1\n    HLT');

      // Undo 1
      const state1 = history.undo();
      expect(state1?.value).toBe('START:\n    MOV AX, 1');
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);

      // Undo 2
      const state2 = history.undo();
      expect(state2?.value).toBe('START');
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);

      // Redo 1 (Ctrl+Y)
      const redo1 = history.redo();
      expect(redo1?.value).toBe('START:\n    MOV AX, 1');
      expect(history.canUndo()).toBe(true);

      // Redo 2
      const redo2 = history.redo();
      expect(redo2?.value).toBe('START:\n    MOV AX, 1\n    HLT');
      expect(history.canRedo()).toBe(false);
    });

    it('truncates redo stack when new edits occur after undo', () => {
      const history = new EditorHistory('A');
      history.push({ value: 'B', selectionStart: 1, selectionEnd: 1 });
      history.push({ value: 'C', selectionStart: 1, selectionEnd: 1 });

      history.undo(); // back to B
      expect(history.getCurrent()?.value).toBe('B');

      history.push({ value: 'D', selectionStart: 1, selectionEnd: 1 }); // branch out
      expect(history.canRedo()).toBe(false);

      const undone = history.undo();
      expect(undone?.value).toBe('B');
    });
  });

  describe('Auto-Indent on Enter', () => {
    it('preserves indentation of the previous line', () => {
      const code = '    MOV AX, 1';
      const result = autoIndentOnEnter(code, code.length, code.length);
      expect(result.text).toBe('    MOV AX, 1\n    ');
      expect(result.newPos).toBe(code.length + 5);
    });

    it('adds 4 spaces indentation after a label ending with colon', () => {
      const code = 'START:';
      const result = autoIndentOnEnter(code, code.length, code.length);
      expect(result.text).toBe('START:\n    ');
      expect(result.newPos).toBe(code.length + 5);
    });
  });

  describe('Comment Toggle (Ctrl+/ or Ctrl+;)', () => {
    it('comments lines with assembly semicolon (; )', () => {
      const code = '    MOV AX, 1\n    MOV BX, 2';
      const result = toggleComment(code, 0, code.length);
      expect(result.text).toBe('    ; MOV AX, 1\n    ; MOV BX, 2');
    });

    it('uncomments already commented lines', () => {
      const code = '    ; MOV AX, 1\n    ; MOV BX, 2';
      const result = toggleComment(code, 0, code.length);
      expect(result.text).toBe('    MOV AX, 1\n    MOV BX, 2');
    });
  });

  describe('Duplicate Line / Selection (Ctrl+D)', () => {
    it('duplicates single line below cursor', () => {
      const code = 'MOV AX, 1\nHLT';
      const result = duplicateLineOrSelection(code, 4, 4);
      expect(result.text).toBe('MOV AX, 1\nMOV AX, 1\nHLT');
    });

    it('duplicates selection inline when text is selected', () => {
      const code = 'MOV AX, 1';
      const result = duplicateLineOrSelection(code, 4, 6); // "AX"
      expect(result.text).toBe('MOV AXAX, 1');
      expect(result.newStart).toBe(6);
      expect(result.newEnd).toBe(8);
    });
  });

  describe('Move Lines (Alt+Up / Alt+Down)', () => {
    it('moves line down', () => {
      const code = 'LINE 1\nLINE 2\nLINE 3';
      const result = moveLines(code, 0, 6, 'down');
      expect(result?.text).toBe('LINE 2\nLINE 1\nLINE 3');
    });

    it('moves line up', () => {
      const code = 'LINE 1\nLINE 2\nLINE 3';
      const result = moveLines(code, 7, 13, 'up');
      expect(result?.text).toBe('LINE 2\nLINE 1\nLINE 3');
    });

    it('returns null when trying to move top line up', () => {
      const code = 'LINE 1\nLINE 2';
      const result = moveLines(code, 0, 6, 'up');
      expect(result).toBeNull();
    });
  });

  describe('Smart Backspace', () => {
    it('deletes 4 spaces of indentation in one keystroke', () => {
      const code = '    MOV AX, 1';
      const result = smartBackspace(code, 4, 4);
      expect(result?.text).toBe('MOV AX, 1');
      expect(result?.newPos).toBe(0);
    });

    it('returns null if text before cursor is not spaces', () => {
      const code = 'MOV AX, 1';
      const result = smartBackspace(code, 3, 3);
      expect(result).toBeNull();
    });
  });

  describe('Delete Line (Ctrl+Shift+K)', () => {
    it('deletes current line cleanly', () => {
      const code = 'LINE 1\nLINE 2\nLINE 3';
      const result = deleteLine(code, 7, 7); // on LINE 2
      expect(result.text).toBe('LINE 1\nLINE 3');
    });
  });
});
