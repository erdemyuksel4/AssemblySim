import { describe, it, expect, beforeEach } from 'vitest';
import { ConsoleView } from '../src/ui/console.js';
import { Memory } from '../src/cpu/memory.js';

describe('ConsoleView Memory Integration', () => {
  let container: HTMLElement;
  let memory: Memory;

  beforeEach(() => {
    // Provide minimal mock DOM if running in Node environment
    if (typeof document === 'undefined') {
      const mockEl = {
        innerHTML: '',
        querySelector: () => null,
        querySelectorAll: () => [],
        appendChild: () => {},
        addEventListener: () => {},
      } as unknown as HTMLElement;
      container = mockEl;
    } else {
      container = document.createElement('div');
    }
    memory = new Memory();
  });

  it('binds directly to 1 MB physical RAM', () => {
    const consoleView = new ConsoleView(container, { memory });

    // Verify memory buffer is exactly the same reference
    expect(consoleView.getMemoryData()).toBe(memory.data);

    // Verify BIOS Banner was read directly from memory (0xB8000)
    const charCode0 = memory.data[0xB8000];
    expect(String.fromCharCode(charCode0)).toBe('I'); // "IBM PC 5150..."

    // Cursor position in BDA (0040:0050h)
    expect(memory.data[0x0450]).toBe(0); // col 0
    expect(memory.data[0x0451]).toBe(4); // row 4

    // Video Mode in BDA (0040:0049h)
    expect(memory.data[0x0449]).toBe(0x03); // 80x25 text mode

    consoleView.destroy();
  });

  it('writing to physical memory immediately updates console display data', () => {
    const consoleView = new ConsoleView(container, { memory });

    // Write 'HELLO' at row 10, col 5 in physical VRAM (0xB8000)
    const text = 'HELLO';
    const row = 10;
    const col = 5;
    for (let i = 0; i < text.length; i++) {
      const off = 0xB8000 + (row * 80 + col + i) * 2;
      memory.writeByte(0, off, text.charCodeAt(i), false);
      memory.writeByte(0, off + 1, 0x1F, false); // White on Blue
    }

    consoleView.updateVram();

    // Verify consoleView's data is directly the memory's data
    for (let i = 0; i < text.length; i++) {
      const off = 0xB8000 + (row * 80 + col + i) * 2;
      expect(consoleView.getMemoryData()[off]).toBe(text.charCodeAt(i));
      expect(consoleView.getMemoryData()[off + 1]).toBe(0x1F);
    }

    consoleView.destroy();
  });

  it('writeStringToVram writes directly into physical RAM at 0xB8000', () => {
    const consoleView = new ConsoleView(container, { memory });

    consoleView.writeStringToVram(5, 10, '8086 CPU', 0x2E);

    // Check directly in physical memory.data
    const startOff = 0xB8000 + (5 * 80 + 10) * 2;
    expect(memory.data[startOff]).toBe('8'.charCodeAt(0));
    expect(memory.data[startOff + 1]).toBe(0x2E);

    consoleView.destroy();
  });

  it('clear() wipes physical text VRAM at 0xB8000 and graphics VRAM at 0xA0000 in memory', () => {
    const consoleView = new ConsoleView(container, { memory });

    // Put some dirty data in 0xB8000 and 0xA0000
    memory.data[0xB8000] = 0x55;
    memory.data[0xA0000 + 500] = 0xFF;
    memory.data[0x0450] = 15;
    memory.data[0x0451] = 12;

    consoleView.clear();

    // Verify text VRAM is reset to space (0x20) and 0x07 in memory
    expect(memory.data[0xB8000]).toBe(0x20);
    expect(memory.data[0xB8000 + 1]).toBe(0x07);

    // Verify graphics VRAM is zeroed in memory
    expect(memory.data[0xA0000 + 500]).toBe(0);

    // Verify BDA cursor and mode are reset in memory
    expect(memory.data[0x0450]).toBe(0);
    expect(memory.data[0x0451]).toBe(0);
    expect(memory.data[0x0449]).toBe(0x03);

    consoleView.destroy();
  });

  it('setVideoMode updates video mode in BDA at 0x0449', () => {
    const consoleView = new ConsoleView(container, { memory });

    consoleView.setVideoMode(0x13);
    expect(memory.data[0x0449]).toBe(0x13);

    consoleView.setVideoMode(0x03);
    expect(memory.data[0x0449]).toBe(0x03);

    consoleView.destroy();
  });
});

