import { describe, it, expect } from 'vitest';
import { CPU } from '../src/cpu/cpu.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('Interactive I/O and Port Instructions (IN / OUT / INT)', () => {
  it('should write and read ports via IN and OUT', () => {
    const code = `
      ORG 100H
      MOV AL, 42H
      OUT 60H, AL       ; write 42h to port 60h
      IN AL, 60H        ; read back from port 60h
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, 0x100);

    while (!cpu.halted) {
      cpu.step();
    }

    expect(cpu.regs.al).toBe(0x42);
    expect(cpu.io.readByte(0x60)).toBe(0x42);
  });

  it('should support variable port addressing via DX', () => {
    const code = `
      ORG 100H
      MOV DX, 378H      ; parallel port address
      MOV AL, 55H
      OUT DX, AL        ; write to port DX
      MOV AL, 0
      IN AL, DX         ; read back from port DX
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, 0x100);

    while (!cpu.halted) {
      cpu.step();
    }

    expect(cpu.regs.al).toBe(0x55);
    expect(cpu.io.readByte(0x378)).toBe(0x55);
  });

  it('should assemble and execute CMPSW and SCASW', () => {
    const code = `
      ORG 100H
      CMPSW
      SCASW
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);
    // CMPSW opcode is 0xA7, SCASW opcode is 0xAF
    expect(res.bytes[0]).toBe(0xA7);
    expect(res.bytes[1]).toBe(0xAF);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, 0x100);
    cpu.step(); // CMPSW
    cpu.step(); // SCASW
    cpu.step(); // HLT
    expect(cpu.halted).toBe(true);
  });

  it('should handle INT 21h AH=01h interactive keyboard input', () => {
    const code = `
      ORG 100H
      MOV AH, 01H
      INT 21H           ; wait for char
      MOV BL, AL        ; save input in BL
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, 0x100);

    // 1. Step: MOV AH, 01h
    cpu.step();
    expect(cpu.regs.ah).toBe(1);

    // 2. Step: INT 21h with empty buffer -> should wait for input
    const infoWait = cpu.step();
    expect(infoWait.waitingForInput).toBe(true);
    expect(cpu.regs.ip).toBe(0x102); // IP did not advance!

    // 3. User types 'K' (0x4B)
    cpu.feedInput('K');

    // 4. Step again: now input is available, consumes 'K' and advances
    const infoConsume = cpu.step();
    expect(infoConsume.waitingForInput).toBeFalsy();
    expect(cpu.regs.al).toBe('K'.charCodeAt(0));
    expect(infoConsume.consoleText).toBe('K');

    // 5. MOV BL, AL and HLT
    cpu.step();
    cpu.step();
    expect(cpu.halted).toBe(true);
    expect(cpu.regs.bl).toBe('K'.charCodeAt(0));
  });

  it('should handle INT 16h keyboard waiting', () => {
    const code = `
      ORG 100H
      MOV AH, 00H
      INT 16H           ; BIOS wait for key
      HLT
    `;
    const res = Assembler.assemble(code);
    const cpu = new CPU();
    cpu.loadCOM(res.bytes, 0x100);

    cpu.step(); // MOV AH, 00h
    const wait = cpu.step();
    expect(wait.waitingForInput).toBe(true);

    cpu.feedInput('Z');
    const read = cpu.step();
    expect(read.waitingForInput).toBeFalsy();
    expect(cpu.regs.al).toBe('Z'.charCodeAt(0));
    cpu.step(); // HLT
    expect(cpu.halted).toBe(true);
  });
});
