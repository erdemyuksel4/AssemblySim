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

    it('advances cursor to next tab stop (multiple of 4) when pressing Tab within code', () => {
      // "MOV" is 3 chars, pressing Tab at index 3 advances 1 space to column 4
      const initial = 'MOV AX, 1';
      const result = indentSelection(initial, 3, 3);
      expect(result.text).toBe('MOV  AX, 1');
      expect(result.newStart).toBe(4);
      expect(result.newEnd).toBe(4);

      // "    CLI" is 7 chars, pressing Tab at index 7 advances 1 space to column 8
      const cli = '    CLI';
      const resultCli = indentSelection(cli, 7, 7);
      expect(resultCli.text).toBe('    CLI ');
      expect(resultCli.newStart).toBe(8);
      expect(resultCli.newEnd).toBe(8);

      // Column 8 (multiple of 4) advances 4 spaces to column 12
      const res8 = indentSelection('        ', 8, 8);
      expect(res8.text).toBe('            ');
      expect(res8.newStart).toBe(12);
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

    it('does not destructively delete spaces after code within a line', () => {
      // Spaces within a line should not be bulk-deleted, allowing normal 1-char deletion
      const code = 'MOV     AX';
      const result = smartBackspace(code, 8, 8);
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

  describe('Workspace File Retention & Multi-file Editor State', () => {
    it('preserves custom code in console.asm without destructive resets', async () => {
      const { WorkspaceManager } = await import('../src/workspace/workspaceManager');
      const ws = new WorkspaceManager();

      const customCode = 'ORG 100H\nMOV AX, 0B800H\nMOV ES, AX\nJMP $';
      // Find or create console.asm
      let consoleFile = ws.getAllFiles().find(f => f.name === 'console.asm');
      if (!consoleFile) {
        consoleFile = ws.createFile('console.asm', customCode);
      } else {
        ws.updateFileCode(consoleFile.id, customCode);
      }

      // Verify it was updated
      expect(ws.getFile(consoleFile.id)?.code).toBe(customCode);

      // Trigger setActiveFile / tab switches
      const otherFile = ws.getAllFiles().find(f => f.id !== consoleFile!.id)!;
      ws.setActiveFile(otherFile.id);
      expect(ws.getActiveFile().id).toBe(otherFile.id);

      // Switch back
      ws.setActiveFile(consoleFile.id);
      expect(ws.getActiveFile().code).toBe(customCode);
      expect(ws.getActiveFile().code).not.toContain('MSG_BANNER');
    });

    it('persists editor scroll and cursor metadata across file updates', async () => {
      const { WorkspaceManager } = await import('../src/workspace/workspaceManager');
      const ws = new WorkspaceManager();
      const file = ws.getActiveFile();

      ws.updateFileCode(
        file.id,
        'MOV AX, 1234H\nHLT',
        { top: 120, left: 0 },
        { start: 8, end: 12 }
      );

      const updated = ws.getFile(file.id);
      expect(updated?.editorScroll).toEqual({ top: 120, left: 0 });
      expect(updated?.editorCursor).toEqual({ start: 8, end: 12 });
    });

    it('initializes with a single clean main.asm without console.asm or bootloader boilerplate', async () => {
      // Clear localStorage simulation if any
      const { WorkspaceManager } = await import('../src/workspace/workspaceManager');
      const ws = new WorkspaceManager();
      const files = ws.getAllFiles();

      expect(files.some(f => f.name === 'console.asm')).toBe(false);
      expect(files[0].name).toBe('main.asm');
      expect(files[0].code).toContain('ORG 100H');
      expect(files[0].code).not.toContain('8086 Bare-Metal Bootloader');
      expect(files[0].code).not.toContain('MSG_BANNER');
    });

    it('reliably preserves document changes when switching between multiple files', async () => {
      const { WorkspaceManager } = await import('../src/workspace/workspaceManager');
      const ws = new WorkspaceManager();

      const doc1 = ws.getActiveFile();
      ws.updateFileCode(doc1.id, 'MOV AX, 1111H\nHLT\n');

      const doc2 = ws.createFile('test2.asm', 'MOV BX, 2222H\nHLT\n');
      expect(ws.getActiveFile().id).toBe(doc2.id);

      // Switch back to doc1
      ws.setActiveFile(doc1.id);
      expect(ws.getActiveFile().code).toBe('MOV AX, 1111H\nHLT\n');

      // Edit doc1 again
      ws.updateFileCode(doc1.id, 'MOV AX, 3333H\nHLT\n');

      // Switch to doc2
      ws.setActiveFile(doc2.id);
      expect(ws.getActiveFile().code).toBe('MOV BX, 2222H\nHLT\n');

      // Switch back to doc1
      ws.setActiveFile(doc1.id);
      expect(ws.getActiveFile().code).toBe('MOV AX, 3333H\nHLT\n');
    });

    it('allows deleting any file and resets to clean main.asm when deleting the last file', async () => {
      const { WorkspaceManager } = await import('../src/workspace/workspaceManager');
      const ws = new WorkspaceManager();

      const doc2 = ws.createFile('temp.asm', 'NOP\n');
      expect(ws.getAllFiles().length).toBeGreaterThanOrEqual(2);

      // Delete the created file
      const deleted = ws.deleteFile(doc2.id);
      expect(deleted).toBe(true);
      expect(ws.getAllFiles().some(f => f.id === doc2.id)).toBe(false);

      // When only 1 file remains, deleting it resets to clean main.asm
      const remainingId = ws.getAllFiles()[0].id;
      const reset = ws.deleteFile(remainingId);
      expect(reset).toBe(true);
      expect(ws.getAllFiles()).toHaveLength(1);
      expect(ws.getActiveFile().name).toBe('main.asm');
      expect(ws.getActiveFile().code).toContain('ORG 100H');
    });
  });
});
