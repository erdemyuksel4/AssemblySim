import { describe, it, expect } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';

describe('Assembler Tests', () => {
  it('assembles DB directives and DUP correctly', () => {
    const code = `
      ORG 100H
      DB 5, 12, 8
      DB 'Hi$'
      DB 4 DUP(0)
      DW 1234H
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);
    // 3 bytes + 3 bytes ('H','i','$') + 4 bytes + 2 bytes = 12 bytes
    expect(res.bytes.length).toBe(12);
    expect(Array.from(res.bytes.slice(0, 3))).toEqual([5, 12, 8]);
    expect(Array.from(res.bytes.slice(3, 6))).toEqual([72, 105, 36]);
    expect(Array.from(res.bytes.slice(6, 10))).toEqual([0, 0, 0, 0]);
    expect(Array.from(res.bytes.slice(10, 12))).toEqual([0x34, 0x12]);
  });

  it('correctly encodes complex ModRM addressing like [BX+DI+4]', () => {
    const code = `
      ORG 100H
      MOV AX, [BX+DI+4]
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);
    // MOV r16, m16 -> 8B /r
    // mod=01 (disp 4), reg=0 (AX), rm=1 (BX+DI) -> modrm = (1<<6) | (0<<3) | 1 = 0x41
    // disp8 = 0x04
    expect(Array.from(res.bytes)).toEqual([0x8B, 0x41, 0x04]);
  });

  it('reports error when operand size is ambiguous for memory immediate', () => {
    const code = `
      ORG 100H
      MOV [BX], 5
    `;
    const res = Assembler.assemble(code);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors[0].message).toContain('Operand size belirtilmedi');
  });

  it('correctly encodes BYTE PTR and WORD PTR memory immediates', () => {
    const code = `
      ORG 100H
      MOV BYTE PTR [BX], 5
      MOV WORD PTR [BX], 1234H
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);
    // C6 07 05 (C6 /0 [BX], 5)
    // C7 07 34 12 (C7 /0 [BX], 1234h)
    expect(Array.from(res.bytes)).toEqual([0xC6, 0x07, 0x05, 0xC7, 0x07, 0x34, 0x12]);
  });

  it('encodes jumps and loops with correct relative displacement', () => {
    const code = `
      ORG 100H
      START:
        INC AX
        LOOP START
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);
    // INC AX: 40 (1 byte, addr 100H)
    // LOOP START: E2 (currAddr 101H, len 2). target = 100H, rel = 100H - (101H+2) = -3 = 0xFD
    expect(Array.from(res.bytes)).toEqual([0x40, 0xE2, 0xFD]);
  });

  it('resolves labels case-insensitively in forward and backward jumps', () => {
    const code = `
      START:
        MOV AL, 5
        CMP AL, 20
        JB below
        JMP notbelow
      below:
        MOV DL, 1
      notbelow:
        MOV DL, 2
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    while (!cpu.halted) {
      const stepInfo = cpu.step();
      expect(stepInfo.error).toBeUndefined();
    }
    // AL = 5, CMP 5, 20 -> 5 < 20 (unsigned), so CF=1, JB taken!
    // Jumps to below -> MOV DL, 1, then falls through to notbelow: MOV DL, 2, then HLT
    expect(cpu.regs.dl).toBe(2);
  });

  it('correctly assembles and executes MOV AX, @DATA and MOV DS, AX without hanging', () => {
    const code = `
      MOV AX, @DATA   ; 1. Veri bölgesinin adresini önce AX'e al
      MOV DS, AX
      MOV BX, 1234H
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);
    expect(res.bytes.length).toBeGreaterThan(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    while (!cpu.halted) {
      cpu.step();
    }
    expect(cpu.regs.ax).toBe(0);
    expect(cpu.regs.ds).toBe(0);
    expect(cpu.regs.bx).toBe(0x1234);
  });

  it('supports standard MASM/TASM directives like .MODEL, .STACK, .DATA, .CODE, and END', () => {
    const code = `
      .MODEL SMALL
      .STACK 100H
      .DATA
        MSG DB 'OK$'
      .CODE
      MAIN PROC
        MOV AX, @DATA
        MOV DS, AX
        MOV DX, OFFSET MSG
        HLT
      MAIN ENDP
      END MAIN
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);
    expect(res.bytes.length).toBeGreaterThan(0);
  });
});
