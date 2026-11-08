import { describe, it, expect } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';

describe('8253 PIT / IRQ0 timer (18.2 Hz real time)', () => {
  it('INT 1Ah tick counter advances so a delay loop terminates', () => {
    const src = `ORG 100H
MOV AH,0
INT 1Ah
MOV BX,DX
ADD BX,2
BEKLE:
MOV AH,0
INT 1Ah
CMP DX,BX
JB BEKLE
HLT`;
    const res = Assembler.assemble(src);
    expect(res.errors).toEqual([]);
    const cpu = new CPU();
    cpu.loadCOM(res.bytes, 0x100);
    const start = Date.now();
    while (!cpu.halted && !cpu.lastError && Date.now() - start < 2000) cpu.step();
    expect(cpu.lastError).toBeUndefined();
    expect(cpu.halted).toBe(true);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(50); // ~2 ticks ≈ 55-110 ms
  });
});
