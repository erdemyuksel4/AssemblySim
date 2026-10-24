import { describe, it, expect, beforeEach } from 'vitest';
import { MiniLabRegistry } from '../src/lectures/miniLabRegistry.js';
import { CpuInstanceManager } from '../src/cpu/instanceManager.js';
import { Editor } from '../src/ui/editor.js';
import { LectureExample } from '../src/lectures/lectureData.js';

describe('State Persistence & Mini-Lab CPU Isolation Tests', () => {
  beforeEach(() => {
    MiniLabRegistry.clearAll();
  });

  it('provides an isolated CPU for each mini lab that is NOT exposed in CpuInstanceManager', () => {
    const cpuManager = new CpuInstanceManager();
    const initialCpuCount = cpuManager.getAllInstances().length;

    const ex1 = {
      id: 'ex-test-1',
      title: 'Lab 1',
      task: 'Task 1',
      code: 'MOV AX, 1000H\nHLT'
    } as unknown as LectureExample;

    const ex2 = {
      id: 'ex-test-2',
      title: 'Lab 2',
      task: 'Task 2',
      code: 'MOV BX, 2000H\nHLT'
    } as unknown as LectureExample;

    const rec1 = MiniLabRegistry.getOrCreate(ex1);
    const rec2 = MiniLabRegistry.getOrCreate(ex2);

    // 1. Each mini lab gets its own distinct CPU instance
    expect(rec1.cpu).not.toBe(rec2.cpu);

    // 2. Modifying rec1's CPU state must not affect rec2's CPU
    rec1.cpu.regs.ax = 0x1234;
    rec1.cpu.mem.writeByte(0x0000, 0x0200, 0x55);

    expect(rec2.cpu.regs.ax).toBe(0);
    expect(rec2.cpu.mem.readByte(0x0000, 0x0200)).toBe(0);

    // 3. Mini lab CPUs must NOT be added to CpuInstanceManager (must not appear in user modal)
    expect(cpuManager.getAllInstances().length).toBe(initialCpuCount);
    expect(cpuManager.getInstance(ex1.id)).toBeUndefined();
    expect(cpuManager.getInstance(ex2.id)).toBeUndefined();
  });

  it('preserves user code and CPU execution state across repeated getOrCreate calls (switching tabs/docs)', () => {
    const ex = {
      id: 'ex-test-persisted',
      title: 'Persistent Lab',
      task: 'Test persistence',
      code: 'MOV CX, 5\nHLT'
    } as unknown as LectureExample;

    const rec = MiniLabRegistry.getOrCreate(ex);
    // User modifies code and CPU registers
    rec.userCode = 'MOV CX, 99\nADD AX, CX\nHLT';
    rec.cpu.regs.cx = 99;
    rec.cpu.regs.ax = 120;
    rec.cpu.mem.writeByte(0x0000, 0x0150, 0xAA);
    rec.isInitialized = true;
    rec.consoleBuffer = 'Output line 1\n';

    // Simulate switching away to another document/lecture and coming back
    const restored = MiniLabRegistry.getOrCreate(ex);
    expect(restored).toBe(rec);
    expect(restored.userCode).toBe('MOV CX, 99\nADD AX, CX\nHLT');
    expect(restored.cpu.regs.cx).toBe(99);
    expect(restored.cpu.regs.ax).toBe(120);
    expect(restored.cpu.mem.readByte(0x0000, 0x0150)).toBe(0xAA);
    expect(restored.consoleBuffer).toBe('Output line 1\n');
  });

  it('allows resetting a mini lab back to initial state when explicitly reset', () => {
    const ex = {
      id: 'ex-test-reset',
      title: 'Reset Lab',
      task: 'Test reset',
      code: 'MOV AX, 1\nHLT',
      initialRegisters: { ax: 0x0005 }
    } as unknown as LectureExample;

    const rec = MiniLabRegistry.getOrCreate(ex);
    rec.userCode = 'MOV AX, 9999H';
    rec.cpu.regs.ax = 0x9999;

    const resetRec = MiniLabRegistry.reset(ex);
    expect(resetRec.cpu.regs.ax).toBe(0x0005);
    expect(resetRec.userCode).toBe(ex.code);
  });

  it('supports editor getScroll and setScroll for scroll position restoration', () => {
    // Mock minimal DOM elements for Editor in Node environment
    const fakeTextarea = {
      value: 'MOV AX, 1',
      scrollTop: 0,
      scrollLeft: 0,
      selectionStart: 0,
      selectionEnd: 0,
      addEventListener: () => {}
    };
    const fakeGutter = { innerHTML: '', scrollTop: 0, addEventListener: () => {} };
    const fakeHighlight = { innerHTML: '', scrollTop: 0, scrollLeft: 0, addEventListener: () => {} };
    const fakeErrorsBox = { querySelector: () => null, addEventListener: () => {} };

    const fakeContainer = {
      innerHTML: '',
      querySelector: (sel: string) => {
        if (sel === '#editor-textarea') return fakeTextarea;
        if (sel === '#editor-gutter') return fakeGutter;
        if (sel === '#editor-highlight') return fakeHighlight;
        if (sel === '#editor-errors-box') return fakeErrorsBox;
        return null;
      }
    };

    const editor = new Editor({
      container: fakeContainer as any,
      initialCode: 'MOV AX, 1'
    });

    editor.setScroll({ top: 450, left: 25 });
    const scroll = editor.getScroll();
    expect(scroll.top).toBe(450);
    expect(scroll.left).toBe(25);
  });
});
