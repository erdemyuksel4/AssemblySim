import { describe, it, expect, vi } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';
import { ConsoleView } from '../src/ui/console.js';

describe('Diagnostic 32000 Offset VRAM Writing', () => {
  it('checks direct segment write MOV [ES:DI], AL at offset 32000', () => {
    const code = `
      ORG 100H
      MOV AX, 0A000H
      MOV ES, AX
      MOV DI, 32000
      MOV AL, 0FH
      MOV [ES:DI], AL
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.reset();
    cpu.loadCOM(res.bytes, 0x100);

    let steps = 0;
    while (!cpu.halted && steps < 100) {
      cpu.step();
      steps++;
    }

    // 0xA000 * 16 + 32000 = 0xA0000 + 0x7D00 = 0xA7D00
    const physAddr = 0xA7D00;
    expect(cpu.mem.data[physAddr]).toBe(0x0F);
    expect(cpu.mem.data[0x0449]).toBe(0x13);
  });

  it('checks INT 10h AH=0Ch at Y=100, X=0 (offset 32000)', () => {
    const code = `
      ORG 100H
      MOV AX, 0013H
      INT 10H
      MOV CX, 0      ; X = 0
      MOV DX, 100    ; Y = 100 -> Offset = 100 * 320 + 0 = 32000
      MOV AL, 0FH    ; White color
      MOV AH, 0CH    ; Write Pixel
      MOV BH, 0
      INT 10H
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.reset();
    cpu.loadCOM(res.bytes, 0x100);

    let steps = 0;
    while (!cpu.halted && steps < 100) {
      cpu.step();
      steps++;
    }

    const physAddr = 0xA0000 + 32000; // 0xA7D00
    expect(cpu.mem.data[physAddr]).toBe(0x0F);
    expect(cpu.mem.data[0x0449]).toBe(0x13);
  });

  it('reports canvas pixel change and logs to console', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const container = typeof document !== 'undefined'
      ? document.createElement('div')
      : ({ innerHTML: '', querySelector: () => null, addEventListener: () => {} } as any);

    const cpu = new CPU();
    const consoleView = new ConsoleView(container, { memory: cpu.mem });

    cpu.mem.onVramWrite = (phys: number, val: number) => {
      consoleView.recordVramChange(phys, val);
      consoleView.updateVram(cpu.mem.data);
    };

    // Simulate writing pixel at X=160, Y=100 (Offset 32160, Physical 0xA7D60) with Color 0x0F
    const phys = 0xA0000 + (100 * 320 + 160);
    cpu.mem.writeByte(0, phys, 0x0F, true);

    expect(consoleSpy).toHaveBeenCalled();
    const loggedCalls = consoleSpy.mock.calls.map(c => c.join(' '));
    const matched = loggedCalls.some(str => str.includes('CANVAS DEĞİŞİKLİĞİ') && str.includes('160') && str.includes('100'));
    expect(matched).toBe(true);

    consoleView.destroy();
    consoleSpy.mockRestore();
  });
});
