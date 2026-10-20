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

  it('correctly executes multi-precision ADC and SBB math', () => {
    const code = `
      ORG 100H
      MOV AX, 0FFFFH
      ADD AX, 1       ; AX = 0, CF = 1
      MOV DX, 0
      ADC DX, 0       ; DX = 0 + 0 + CF(1) = 1, CF = 0
      SBB DX, 1       ; DX = 1 - 1 - CF(0) = 0, CF = 0
      STC             ; CF = 1
      SBB DX, 0       ; DX = 0 - 0 - CF(1) = 0xFFFF, CF = 1
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(100);

    expect(cpu.halted).toBe(true);
    expect(cpu.regs.ax).toBe(0);
    expect(cpu.regs.dx).toBe(0xFFFF);
    expect(cpu.flags.cf).toBe(true);
  });

  it('strictly rejects 8-bit register PUSH and POP', () => {
    const codePush = `
      ORG 100H
      PUSH AL
    `;
    const resPush = Assembler.assemble(codePush);
    expect(resPush.errors.length).toBeGreaterThan(0);
    expect(resPush.errors[0].message).toContain('8-bit yazmaçlar');

    const codePop = `
      ORG 100H
      POP BL
    `;
    const resPop = Assembler.assemble(codePop);
    expect(resPop.errors.length).toBeGreaterThan(0);
    expect(resPop.errors[0].message).toContain('8-bit yazmaçlar');
  });

  it('strictly rejects invalid memory addressing registers like [AX] and [SP]', () => {
    const codeAX = `
      ORG 100H
      MOV BX, [AX]
    `;
    const resAX = Assembler.assemble(codeAX);
    expect(resAX.errors.length).toBeGreaterThan(0);
    expect(resAX.errors[0].message).toContain('ile bellek adresleme yapılamaz');

    const codeSP = `
      ORG 100H
      MOV BX, [SP]
    `;
    const resSP = Assembler.assemble(codeSP);
    expect(resSP.errors.length).toBeGreaterThan(0);
    expect(resSP.errors[0].message).toContain('ile bellek adresleme yapılamaz');
  });

  it('strictly rejects direct assignment to CS register and immediate to segment', () => {
    const codeCS = `
      ORG 100H
      MOV CS, AX
    `;
    const resCS = Assembler.assemble(codeCS);
    expect(resCS.errors.length).toBeGreaterThan(0);
    expect(resCS.errors[0].message).toContain('CS (Code Segment) yazmacına doğrudan MOV');

    const codeImmSeg = `
      ORG 100H
      MOV DS, 1000H
    `;
    const resImmSeg = Assembler.assemble(codeImmSeg);
    expect(resImmSeg.errors.length).toBeGreaterThan(0);
    expect(resImmSeg.errors[0].message).toContain('segment yazmaçlarına doğrudan sayı');
  });
});
