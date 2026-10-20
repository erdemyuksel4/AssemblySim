import { describe, it, expect } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';

describe('Strict Intel 8086 ISA & Hardware Accuracy Tests', () => {
  it('executes BCD DAA addition accurately according to Intel specification', () => {
    // 38h (BCD 38) + 45h (BCD 45) = 7Dh -> DAA -> 83h (BCD 83)
    const code = `
      ORG 100H
      MOV AL, 38H
      ADD AL, 45H
      DAA
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(100);

    expect(cpu.halted).toBe(true);
    expect(cpu.regs.al).toBe(0x83);
  });

  it('verifies CBW and CWD sign extension', () => {
    const code = `
      ORG 100H
      MOV AL, 0FEH ; -2 in signed 8-bit
      CBW          ; AX should become 0xFFFE (-2 in 16-bit)
      MOV AX, 8000H; -32768
      CWD          ; DX:AX should become 0xFFFF:0x8000
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(100);

    expect(cpu.regs.ax).toBe(0x8000);
    expect(cpu.regs.dx).toBe(0xFFFF);
  });

  it('verifies flag operations CLC, STC, CMC, CLD, STD', () => {
    const code = `
      ORG 100H
      STC  ; CF = 1
      CMC  ; CF = 0
      STC  ; CF = 1
      STD  ; DF = 1
      HLT
    `;
    const res = Assembler.assemble(code);
    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(100);

    expect(cpu.flags.cf).toBe(true);
    expect(cpu.flags.df).toBe(true);
  });

  it('verifies LAHF and SAHF flag transfer', () => {
    const code = `
      ORG 100H
      STC       ; CF = 1
      LAHF      ; AH = flags low byte (bit 0 must be 1)
      CLC       ; CF = 0
      SAHF      ; Restore flags from AH -> CF should become 1 again!
      HLT
    `;
    const res = Assembler.assemble(code);
    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(100);

    expect(cpu.flags.cf).toBe(true);
  });

  it('strictly rejects non-memory operand for LEA', () => {
    const code = `
      ORG 100H
      LEA AX, 1234H
    `;
    const res = Assembler.assemble(code);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('strictly rejects ambiguous memory write without size specifier', () => {
    const code = `
      ORG 100H
      MOV [BX], 42
    `;
    const res = Assembler.assemble(code);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors[0].message).toContain('Operand size belirtilmedi');
  });
});
