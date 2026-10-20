import { describe, it, expect } from 'vitest';
import { CPU } from '../src/cpu/cpu.js';

describe('CPU Core Tests', () => {
  it('initializes in 16-bit real mode with 0000h registers correctly', () => {
    const cpu = new CPU();
    expect(cpu.regs.cs).toBe(0x0000);
    expect(cpu.regs.ds).toBe(0x0000);
    expect(cpu.regs.es).toBe(0x0000);
    expect(cpu.regs.ss).toBe(0x0000);
    expect(cpu.regs.ip).toBe(0x0000);
    expect(cpu.regs.sp).toBe(0x0000);
  });

  it('executes MOV AL, 5 and ADD AL, 12', () => {
    const cpu = new CPU();
    // B0 05 (MOV AL, 5)
    // 04 0C (ADD AL, 12)
    // F4 (HLT)
    cpu.loadCOM([0xB0, 0x05, 0x04, 0x0C, 0xF4]);

    cpu.step(); // MOV AL, 5
    expect(cpu.regs.al).toBe(5);
    expect(cpu.regs.ip).toBe(0x0002);

    cpu.step(); // ADD AL, 12
    expect(cpu.regs.al).toBe(17);
    expect(cpu.regs.ip).toBe(0x0004);

    cpu.step(); // HLT
    expect(cpu.halted).toBe(true);
  });

  it('verifies ADD flags: 0FFH + 1 -> CF=1, ZF=1, AL=0', () => {
    const cpu = new CPU();
    // B0 FF (MOV AL, 0FFh)
    // 04 01 (ADD AL, 1)
    // F4
    cpu.loadCOM([0xB0, 0xFF, 0x04, 0x01, 0xF4]);
    cpu.step(); // MOV
    cpu.step(); // ADD
    expect(cpu.regs.al).toBe(0);
    expect(cpu.flags.cf).toBe(true);
    expect(cpu.flags.zf).toBe(true);
  });

  it('verifies INC does not touch CF', () => {
    const cpu = new CPU();
    cpu.loadCOM([0xB0, 0xFF, 0x04, 0x01, 0xFE, 0xC0, 0xF4]);
    cpu.step(); // MOV AL, 0xFF
    cpu.step(); // ADD AL, 1 -> CF=1
    expect(cpu.flags.cf).toBe(true);
    cpu.step(); // INC AL
    expect(cpu.regs.al).toBe(1);
    expect(cpu.flags.cf).toBe(true); // CF preserved!
  });

  it('supports Step Back functionality', () => {
    const cpu = new CPU();
    cpu.loadCOM([0xB0, 0x42, 0x04, 0x08, 0xF4]);
    cpu.step(); // MOV AL, 0x42
    expect(cpu.regs.al).toBe(0x42);
    cpu.step(); // ADD AL, 8 -> AL = 0x4A
    expect(cpu.regs.al).toBe(0x4A);

    const backSuccess = cpu.stepBack();
    expect(backSuccess).toBe(true);
    expect(cpu.regs.al).toBe(0x42);
    expect(cpu.regs.ip).toBe(0x0002);
  });
});
