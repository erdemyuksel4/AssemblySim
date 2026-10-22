import { Registers, Reg16, Reg8 } from './registers.js';
import { Flags, FlagsState, computeParity } from './flags.js';
import { Memory } from './memory.js';
import { Decoder, DecodedModRM } from './decoder.js';
import { IOPortManager } from './io.js';

export interface StepResult {
  halted: boolean;
  error?: string;
  ipBefore: number;
  ipAfter: number;
  consoleText?: string;
  waitingForInput?: boolean;
}

export class Executor {
  private mem: Memory;
  private regs: Registers;
  private flags: Flags;
  readonly io: IOPortManager;

  constructor(mem: Memory, regs: Registers, flags: Flags, io?: IOPortManager) {
    this.mem = mem;
    this.regs = regs;
    this.flags = flags;
    this.io = io || new IOPortManager();
  }

  // Helper to read operand value from ModRM (8-bit)
  readRM8(modrm: DecodedModRM): number {
    if (modrm.isReg) {
      return this.regs.getReg8ByIndex(modrm.rm);
    }
    const segVal = this.regs.getByName(modrm.baseSegment);
    return this.mem.readByte(segVal, modrm.offset, true);
  }

  // Helper to write operand value to ModRM (8-bit)
  writeRM8(modrm: DecodedModRM, val: number): void {
    if (modrm.isReg) {
      this.regs.setReg8ByIndex(modrm.rm, val);
    } else {
      const segVal = this.regs.getByName(modrm.baseSegment);
      this.mem.writeByte(segVal, modrm.offset, val, true);
    }
  }

  // Helper to read operand value from ModRM (16-bit)
  readRM16(modrm: DecodedModRM): number {
    if (modrm.isReg) {
      return this.regs.getReg16ByIndex(modrm.rm);
    }
    const segVal = this.regs.getByName(modrm.baseSegment);
    return this.mem.readWord(segVal, modrm.offset, true);
  }

  // Helper to write operand value to ModRM (16-bit)
  writeRM16(modrm: DecodedModRM, val: number): void {
    if (modrm.isReg) {
      this.regs.setReg16ByIndex(modrm.rm, val);
    } else {
      const segVal = this.regs.getByName(modrm.baseSegment);
      this.mem.writeWord(segVal, modrm.offset, val, true);
    }
  }

  // Stack push helper
  push(val16: number): void {
    this.regs.sp = (this.regs.sp - 2) & 0xFFFF;
    this.mem.writeWord(this.regs.ss, this.regs.sp, val16, true);
  }

  // Stack pop helper
  pop(): number {
    const val = this.mem.readWord(this.regs.ss, this.regs.sp, true);
    this.regs.sp = (this.regs.sp + 2) & 0xFFFF;
    return val;
  }

  // Executes one instruction at CS:IP
  executeStep(): StepResult {
    const cs = this.regs.cs;
    const initialIp = this.regs.ip;
    let currIp = initialIp;

    // Handle prefix bytes (segment override, rep)
    let segOverride: 'CS' | 'DS' | 'ES' | 'SS' | undefined;
    let repPrefix: 'REP' | 'REPNZ' | undefined;

    let opcode = this.mem.readByte(cs, currIp, true);
    currIp = (currIp + 1) & 0xFFFF;

    // Prefix loop
    while (true) {
      if (opcode === 0x26) { segOverride = 'ES'; }
      else if (opcode === 0x2E) { segOverride = 'CS'; }
      else if (opcode === 0x36) { segOverride = 'SS'; }
      else if (opcode === 0x3E) { segOverride = 'DS'; }
      else if (opcode === 0xF3) { repPrefix = 'REP'; }
      else if (opcode === 0xF2) { repPrefix = 'REPNZ'; }
      else { break; }

      opcode = this.mem.readByte(cs, currIp, true);
      currIp = (currIp + 1) & 0xFFFF;
    }

    // Helper to read next byte from code
    const fetchByte = (): number => {
      const b = this.mem.readByte(cs, currIp, true);
      currIp = (currIp + 1) & 0xFFFF;
      return b;
    };

    // Helper to read next 16-bit word from code
    const fetchWord = (): number => {
      const low = fetchByte();
      const high = fetchByte();
      return (high << 8) | low;
    };

    // Helper to read signed 8-bit offset
    const fetchRel8 = (): number => {
      const b = fetchByte();
      return (b & 0x80) ? (b - 256) : b;
    };

    // Helper to decode ModRM
    const getModRM = (): DecodedModRM => {
      const modrm = Decoder.decodeModRM(this.mem, this.regs, cs, currIp, segOverride);
      currIp = (currIp + modrm.bytesRead) & 0xFFFF;
      return modrm;
    };

    let halted = false;
    let waitingForInput = false;
    let consoleText: string | undefined;

    switch (opcode) {
      // NOP
      case 0x90:
        break;

      // HLT
      case 0xF4:
        halted = true;
        break;

      // --- MOV Instructions ---
      // MOV r/m8, r8
      case 0x88: {
        const m = getModRM();
        const src = this.regs.getReg8ByIndex(m.reg);
        this.writeRM8(m, src);
        break;
      }
      // MOV r/m16, r16
      case 0x89: {
        const m = getModRM();
        const src = this.regs.getReg16ByIndex(m.reg);
        this.writeRM16(m, src);
        break;
      }
      // MOV r8, r/m8
      case 0x8A: {
        const m = getModRM();
        const src = this.readRM8(m);
        this.regs.setReg8ByIndex(m.reg, src);
        break;
      }
      // MOV r16, r/m16
      case 0x8B: {
        const m = getModRM();
        const src = this.readRM16(m);
        this.regs.setReg16ByIndex(m.reg, src);
        break;
      }
      // MOV r/m16, Sreg
      case 0x8C: {
        const m = getModRM();
        const sregVal = this.regs.getSegRegByIndex(m.reg & 3);
        this.writeRM16(m, sregVal);
        break;
      }
      // MOV Sreg, r/m16
      case 0x8E: {
        const m = getModRM();
        const val = this.readRM16(m);
        this.regs.setSegRegByIndex(m.reg & 3, val);
        break;
      }
      // MOV AL, [moffs8]
      case 0xA0: {
        const off = fetchWord();
        const s = segOverride || 'DS';
        this.regs.al = this.mem.readByte(this.regs.getByName(s), off, true);
        break;
      }
      // MOV AX, [moffs16]
      case 0xA1: {
        const off = fetchWord();
        const s = segOverride || 'DS';
        this.regs.ax = this.mem.readWord(this.regs.getByName(s), off, true);
        break;
      }
      // MOV [moffs8], AL
      case 0xA2: {
        const off = fetchWord();
        const s = segOverride || 'DS';
        this.mem.writeByte(this.regs.getByName(s), off, this.regs.al, true);
        break;
      }
      // MOV [moffs16], AX
      case 0xA3: {
        const off = fetchWord();
        const s = segOverride || 'DS';
        this.mem.writeWord(this.regs.getByName(s), off, this.regs.ax, true);
        break;
      }
      // MOV r8, imm8 (B0..B7)
      case 0xB0: case 0xB1: case 0xB2: case 0xB3:
      case 0xB4: case 0xB5: case 0xB6: case 0xB7: {
        const regIdx = opcode & 7;
        const imm = fetchByte();
        this.regs.setReg8ByIndex(regIdx, imm);
        break;
      }
      // MOV r16, imm16 (B8..BF)
      case 0xB8: case 0xB9: case 0xBA: case 0xBB:
      case 0xBC: case 0xBD: case 0xBE: case 0xBF: {
        const regIdx = opcode & 7;
        const imm = fetchWord();
        this.regs.setReg16ByIndex(regIdx, imm);
        break;
      }
      // MOV r/m8, imm8 (C6 /0)
      case 0xC6: {
        const m = getModRM();
        const imm = fetchByte();
        if (m.reg === 0) {
          this.writeRM8(m, imm);
        } else {
          return { halted: true, error: `Invalid opcode extension C6 /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      // MOV r/m16, imm16 (C7 /0)
      case 0xC7: {
        const m = getModRM();
        const imm = fetchWord();
        if (m.reg === 0) {
          this.writeRM16(m, imm);
        } else {
          return { halted: true, error: `Invalid opcode extension C7 /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }

      // --- LEA reg16, mem ---
      case 0x8D: {
        const m = getModRM();
        if (m.isReg) {
          return { halted: true, error: `LEA with register operand is invalid @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        this.regs.setReg16ByIndex(m.reg, m.offset);
        break;
      }

      // --- ADD Instructions ---
      case 0x00: { // ADD r/m8, r8
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const res = (a + b) & 0xFF;
        this.flags.updateAdd(a, b, res, false);
        this.writeRM8(m, res);
        break;
      }
      case 0x01: { // ADD r/m16, r16
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const res = (a + b) & 0xFFFF;
        this.flags.updateAdd(a, b, res, true);
        this.writeRM16(m, res);
        break;
      }
      case 0x02: { // ADD r8, r/m8
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const res = (a + b) & 0xFF;
        this.flags.updateAdd(a, b, res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 0x03: { // ADD r16, r/m16
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const res = (a + b) & 0xFFFF;
        this.flags.updateAdd(a, b, res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 0x04: { // ADD AL, imm8
        const a = this.regs.al;
        const b = fetchByte();
        const res = (a + b) & 0xFF;
        this.flags.updateAdd(a, b, res, false);
        this.regs.al = res;
        break;
      }
      case 0x05: { // ADD AX, imm16
        const a = this.regs.ax;
        const b = fetchWord();
        const res = (a + b) & 0xFFFF;
        this.flags.updateAdd(a, b, res, true);
        this.regs.ax = res;
        break;
      }

      // --- ADC Instructions ---
      case 0x10: { // ADC r/m8, r8
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const cIn = this.flags.cf ? 1 : 0;
        const res = (a + b + cIn) & 0xFF;
        this.flags.updateAdd(a, b, res, false, cIn);
        this.writeRM8(m, res);
        break;
      }
      case 0x11: { // ADC r/m16, r16
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const cIn = this.flags.cf ? 1 : 0;
        const res = (a + b + cIn) & 0xFFFF;
        this.flags.updateAdd(a, b, res, true, cIn);
        this.writeRM16(m, res);
        break;
      }
      case 0x12: { // ADC r8, r/m8
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const cIn = this.flags.cf ? 1 : 0;
        const res = (a + b + cIn) & 0xFF;
        this.flags.updateAdd(a, b, res, false, cIn);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 0x13: { // ADC r16, r/m16
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const cIn = this.flags.cf ? 1 : 0;
        const res = (a + b + cIn) & 0xFFFF;
        this.flags.updateAdd(a, b, res, true, cIn);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 0x14: { // ADC AL, imm8
        const a = this.regs.al;
        const b = fetchByte();
        const cIn = this.flags.cf ? 1 : 0;
        const res = (a + b + cIn) & 0xFF;
        this.flags.updateAdd(a, b, res, false, cIn);
        this.regs.al = res;
        break;
      }
      case 0x15: { // ADC AX, imm16
        const a = this.regs.ax;
        const b = fetchWord();
        const cIn = this.flags.cf ? 1 : 0;
        const res = (a + b + cIn) & 0xFFFF;
        this.flags.updateAdd(a, b, res, true, cIn);
        this.regs.ax = res;
        break;
      }

      // --- SUB Instructions ---
      case 0x28: { // SUB r/m8, r8
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const res = (a - b) & 0xFF;
        this.flags.updateSub(a, b, res, false);
        this.writeRM8(m, res);
        break;
      }
      case 0x29: { // SUB r/m16, r16
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const res = (a - b) & 0xFFFF;
        this.flags.updateSub(a, b, res, true);
        this.writeRM16(m, res);
        break;
      }
      case 0x2A: { // SUB r8, r/m8
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const res = (a - b) & 0xFF;
        this.flags.updateSub(a, b, res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 0x2B: { // SUB r16, r/m16
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const res = (a - b) & 0xFFFF;
        this.flags.updateSub(a, b, res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 0x2C: { // SUB AL, imm8
        const a = this.regs.al;
        const b = fetchByte();
        const res = (a - b) & 0xFF;
        this.flags.updateSub(a, b, res, false);
        this.regs.al = res;
        break;
      }
      case 0x2D: { // SUB AX, imm16
        const a = this.regs.ax;
        const b = fetchWord();
        const res = (a - b) & 0xFFFF;
        this.flags.updateSub(a, b, res, true);
        this.regs.ax = res;
        break;
      }

      // --- SBB Instructions ---
      case 0x18: { // SBB r/m8, r8
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const bIn = this.flags.cf ? 1 : 0;
        const res = (a - b - bIn) & 0xFF;
        this.flags.updateSub(a, b, res, false, bIn);
        this.writeRM8(m, res);
        break;
      }
      case 0x19: { // SBB r/m16, r16
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const bIn = this.flags.cf ? 1 : 0;
        const res = (a - b - bIn) & 0xFFFF;
        this.flags.updateSub(a, b, res, true, bIn);
        this.writeRM16(m, res);
        break;
      }
      case 0x1A: { // SBB r8, r/m8
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const bIn = this.flags.cf ? 1 : 0;
        const res = (a - b - bIn) & 0xFF;
        this.flags.updateSub(a, b, res, false, bIn);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 0x1B: { // SBB r16, r/m16
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const bIn = this.flags.cf ? 1 : 0;
        const res = (a - b - bIn) & 0xFFFF;
        this.flags.updateSub(a, b, res, true, bIn);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 0x1C: { // SBB AL, imm8
        const a = this.regs.al;
        const b = fetchByte();
        const bIn = this.flags.cf ? 1 : 0;
        const res = (a - b - bIn) & 0xFF;
        this.flags.updateSub(a, b, res, false, bIn);
        this.regs.al = res;
        break;
      }
      case 0x1D: { // SBB AX, imm16
        const a = this.regs.ax;
        const b = fetchWord();
        const bIn = this.flags.cf ? 1 : 0;
        const res = (a - b - bIn) & 0xFFFF;
        this.flags.updateSub(a, b, res, true, bIn);
        this.regs.ax = res;
        break;
      }

      // --- CMP Instructions ---
      case 0x38: { // CMP r/m8, r8
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const res = (a - b) & 0xFF;
        this.flags.updateSub(a, b, res, false);
        break;
      }
      case 0x39: { // CMP r/m16, r16
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const res = (a - b) & 0xFFFF;
        this.flags.updateSub(a, b, res, true);
        break;
      }
      case 0x3A: { // CMP r8, r/m8
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const res = (a - b) & 0xFF;
        this.flags.updateSub(a, b, res, false);
        break;
      }
      case 0x3B: { // CMP r16, r/m16
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const res = (a - b) & 0xFFFF;
        this.flags.updateSub(a, b, res, true);
        break;
      }
      case 0x3C: { // CMP AL, imm8
        const a = this.regs.al;
        const b = fetchByte();
        const res = (a - b) & 0xFF;
        this.flags.updateSub(a, b, res, false);
        break;
      }
      case 0x3D: { // CMP AX, imm16
        const a = this.regs.ax;
        const b = fetchWord();
        const res = (a - b) & 0xFFFF;
        this.flags.updateSub(a, b, res, true);
        break;
      }

      // --- Group 1: 0x80, 0x81, 0x82, 0x83 (ADD, OR, ADC, SBB, AND, SUB, XOR, CMP) ---
      case 0x80:
      case 0x81:
      case 0x82:
      case 0x83: {
        const m = getModRM();
        const is16 = (opcode === 0x81 || opcode === 0x83);
        let imm = 0;
        if (opcode === 0x80 || opcode === 0x82) {
          imm = fetchByte();
        } else if (opcode === 0x81) {
          imm = fetchWord();
        } else { // 0x83 sign-extended imm8
          const b = fetchByte();
          imm = (b & 0x80) ? (b | 0xFF00) : b;
        }

        const a = is16 ? this.readRM16(m) : this.readRM8(m);
        let res = 0;

        switch (m.reg) {
          case 0: // ADD
            res = is16 ? ((a + imm) & 0xFFFF) : ((a + imm) & 0xFF);
            this.flags.updateAdd(a, imm, res, is16);
            if (is16) this.writeRM16(m, res); else this.writeRM8(m, res);
            break;
          case 1: // OR
            res = a | imm;
            this.flags.updateLogic(res, is16);
            if (is16) this.writeRM16(m, res); else this.writeRM8(m, res);
            break;
          case 2: { // ADC
            const cIn = this.flags.cf ? 1 : 0;
            res = is16 ? ((a + imm + cIn) & 0xFFFF) : ((a + imm + cIn) & 0xFF);
            this.flags.updateAdd(a, imm, res, is16, cIn);
            if (is16) this.writeRM16(m, res); else this.writeRM8(m, res);
            break;
          }
          case 3: { // SBB
            const bIn = this.flags.cf ? 1 : 0;
            res = is16 ? ((a - imm - bIn) & 0xFFFF) : ((a - imm - bIn) & 0xFF);
            this.flags.updateSub(a, imm, res, is16, bIn);
            if (is16) this.writeRM16(m, res); else this.writeRM8(m, res);
            break;
          }
          case 4: // AND
            res = a & imm;
            this.flags.updateLogic(res, is16);
            if (is16) this.writeRM16(m, res); else this.writeRM8(m, res);
            break;
          case 5: // SUB
            res = is16 ? ((a - imm) & 0xFFFF) : ((a - imm) & 0xFF);
            this.flags.updateSub(a, imm, res, is16);
            if (is16) this.writeRM16(m, res); else this.writeRM8(m, res);
            break;
          case 6: // XOR
            res = a ^ imm;
            this.flags.updateLogic(res, is16);
            if (is16) this.writeRM16(m, res); else this.writeRM8(m, res);
            break;
          case 7: // CMP
            res = is16 ? ((a - imm) & 0xFFFF) : ((a - imm) & 0xFF);
            this.flags.updateSub(a, imm, res, is16);
            break;
          default:
            return { halted: true, error: `Unsupported Group 1 op /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }

      // --- INC / DEC r16 (40..4F) ---
      case 0x40: case 0x41: case 0x42: case 0x43:
      case 0x44: case 0x45: case 0x46: case 0x47: { // INC r16
        const regIdx = opcode & 7;
        const a = this.regs.getReg16ByIndex(regIdx);
        const res = (a + 1) & 0xFFFF;
        this.flags.updateInc(a, res, true);
        this.regs.setReg16ByIndex(regIdx, res);
        break;
      }
      case 0x48: case 0x49: case 0x4A: case 0x4B:
      case 0x4C: case 0x4D: case 0x4E: case 0x4F: { // DEC r16
        const regIdx = opcode & 7;
        const a = this.regs.getReg16ByIndex(regIdx);
        const res = (a - 1) & 0xFFFF;
        this.flags.updateDec(a, res, true);
        this.regs.setReg16ByIndex(regIdx, res);
        break;
      }

      // --- Group 4/5: FE (8-bit INC/DEC), FF (16-bit INC/DEC/CALL/JMP/PUSH) ---
      case 0xFE: {
        const m = getModRM();
        const a = this.readRM8(m);
        if (m.reg === 0) { // INC r/m8
          const res = (a + 1) & 0xFF;
          this.flags.updateInc(a, res, false);
          this.writeRM8(m, res);
        } else if (m.reg === 1) { // DEC r/m8
          const res = (a - 1) & 0xFF;
          this.flags.updateDec(a, res, false);
          this.writeRM8(m, res);
        } else {
          return { halted: true, error: `Unsupported FE /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 0xFF: {
        const m = getModRM();
        if (m.reg === 0) { // INC r/m16
          const a = this.readRM16(m);
          const res = (a + 1) & 0xFFFF;
          this.flags.updateInc(a, res, true);
          this.writeRM16(m, res);
        } else if (m.reg === 1) { // DEC r/m16
          const a = this.readRM16(m);
          const res = (a - 1) & 0xFFFF;
          this.flags.updateDec(a, res, true);
          this.writeRM16(m, res);
        } else if (m.reg === 2) { // CALL near indirect r/m16
          const target = this.readRM16(m);
          this.push(currIp);
          currIp = target;
        } else if (m.reg === 4) { // JMP near indirect r/m16
          const target = this.readRM16(m);
          currIp = target;
        } else if (m.reg === 6) { // PUSH r/m16
          const val = this.readRM16(m);
          this.push(val);
        } else {
          return { halted: true, error: `Unsupported FF /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }

      // --- JMP near/short ---
      case 0xEB: { // JMP rel8
        const rel = fetchRel8();
        currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0xE9: { // JMP rel16
        const rel = fetchWord();
        const signedRel = (rel & 0x8000) ? (rel - 65536) : rel;
        currIp = (currIp + signedRel) & 0xFFFF;
        break;
      }

      // --- Jcc (70..7F) ---
      case 0x70: { // JO
        const rel = fetchRel8();
        if (this.flags.of) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x71: { // JNO
        const rel = fetchRel8();
        if (!this.flags.of) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x72: { // JB / JC / JNAE
        const rel = fetchRel8();
        if (this.flags.cf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x73: { // JNB / JNC / JAE
        const rel = fetchRel8();
        if (!this.flags.cf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x74: { // JZ / JE
        const rel = fetchRel8();
        if (this.flags.zf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x75: { // JNZ / JNE
        const rel = fetchRel8();
        if (!this.flags.zf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x76: { // JBE / JNA: CF=1 or ZF=1
        const rel = fetchRel8();
        if (this.flags.cf || this.flags.zf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x77: { // JA / JNBE: CF=0 and ZF=0
        const rel = fetchRel8();
        if (!this.flags.cf && !this.flags.zf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x78: { // JS
        const rel = fetchRel8();
        if (this.flags.sf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x79: { // JNS
        const rel = fetchRel8();
        if (!this.flags.sf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x7A: { // JP / JPE
        const rel = fetchRel8();
        if (this.flags.pf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x7B: { // JNP / JPO
        const rel = fetchRel8();
        if (!this.flags.pf) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x7C: { // JL / JNGE: SF != OF
        const rel = fetchRel8();
        if (this.flags.sf !== this.flags.of) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x7D: { // JGE / JNL: SF == OF
        const rel = fetchRel8();
        if (this.flags.sf === this.flags.of) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x7E: { // JLE / JNG: ZF=1 or SF!=OF
        const rel = fetchRel8();
        if (this.flags.zf || (this.flags.sf !== this.flags.of)) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0x7F: { // JG / JNLE: ZF=0 and SF==OF
        const rel = fetchRel8();
        if (!this.flags.zf && (this.flags.sf === this.flags.of)) currIp = (currIp + rel) & 0xFFFF;
        break;
      }
      case 0xE3: { // JCXZ rel8
        const rel = fetchRel8();
        if (this.regs.cx === 0) currIp = (currIp + rel) & 0xFFFF;
        break;
      }

      // --- LOOP instructions (do NOT alter flags!) ---
      case 0xE0: { // LOOPNE / LOOPNZ
        const rel = fetchRel8();
        this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
        if (this.regs.cx !== 0 && !this.flags.zf) {
          currIp = (currIp + rel) & 0xFFFF;
        }
        break;
      }
      case 0xE1: { // LOOPE / LOOPZ
        const rel = fetchRel8();
        this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
        if (this.regs.cx !== 0 && this.flags.zf) {
          currIp = (currIp + rel) & 0xFFFF;
        }
        break;
      }
      case 0xE2: { // LOOP rel8
        const rel = fetchRel8();
        this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
        if (this.regs.cx !== 0) {
          currIp = (currIp + rel) & 0xFFFF;
        }
        break;
      }

      // --- Phase 2: Logic (AND, OR, XOR, NOT, NEG, TEST) ---
      // AND
      case 0x20: { // AND r/m8, r8
        const m = getModRM();
        const res = this.readRM8(m) & this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        this.writeRM8(m, res);
        break;
      }
      case 0x21: { // AND r/m16, r16
        const m = getModRM();
        const res = this.readRM16(m) & this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        this.writeRM16(m, res);
        break;
      }
      case 0x22: { // AND r8, r/m8
        const m = getModRM();
        const res = this.regs.getReg8ByIndex(m.reg) & this.readRM8(m);
        this.flags.updateLogic(res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 0x23: { // AND r16, r/m16
        const m = getModRM();
        const res = this.regs.getReg16ByIndex(m.reg) & this.readRM16(m);
        this.flags.updateLogic(res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 0x24: { // AND AL, imm8
        const res = this.regs.al & fetchByte();
        this.flags.updateLogic(res, false);
        this.regs.al = res;
        break;
      }
      case 0x25: { // AND AX, imm16
        const res = this.regs.ax & fetchWord();
        this.flags.updateLogic(res, true);
        this.regs.ax = res;
        break;
      }

      // OR
      case 0x08: { // OR r/m8, r8
        const m = getModRM();
        const res = this.readRM8(m) | this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        this.writeRM8(m, res);
        break;
      }
      case 0x09: { // OR r/m16, r16
        const m = getModRM();
        const res = this.readRM16(m) | this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        this.writeRM16(m, res);
        break;
      }
      case 0x0A: { // OR r8, r/m8
        const m = getModRM();
        const res = this.regs.getReg8ByIndex(m.reg) | this.readRM8(m);
        this.flags.updateLogic(res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 0x0B: { // OR r16, r/m16
        const m = getModRM();
        const res = this.regs.getReg16ByIndex(m.reg) | this.readRM16(m);
        this.flags.updateLogic(res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 0x0C: { // OR AL, imm8
        const res = this.regs.al | fetchByte();
        this.flags.updateLogic(res, false);
        this.regs.al = res;
        break;
      }
      case 0x0D: { // OR AX, imm16
        const res = this.regs.ax | fetchWord();
        this.flags.updateLogic(res, true);
        this.regs.ax = res;
        break;
      }

      // XOR
      case 0x30: { // XOR r/m8, r8
        const m = getModRM();
        const res = this.readRM8(m) ^ this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        this.writeRM8(m, res);
        break;
      }
      case 0x31: { // XOR r/m16, r16
        const m = getModRM();
        const res = this.readRM16(m) ^ this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        this.writeRM16(m, res);
        break;
      }
      case 0x32: { // XOR r8, r/m8
        const m = getModRM();
        const res = this.regs.getReg8ByIndex(m.reg) ^ this.readRM8(m);
        this.flags.updateLogic(res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 0x33: { // XOR r16, r/m16
        const m = getModRM();
        const res = this.regs.getReg16ByIndex(m.reg) ^ this.readRM16(m);
        this.flags.updateLogic(res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 0x34: { // XOR AL, imm8
        const res = this.regs.al ^ fetchByte();
        this.flags.updateLogic(res, false);
        this.regs.al = res;
        break;
      }
      case 0x35: { // XOR AX, imm16
        const res = this.regs.ax ^ fetchWord();
        this.flags.updateLogic(res, true);
        this.regs.ax = res;
        break;
      }

      // TEST
      case 0x84: { // TEST r/m8, r8
        const m = getModRM();
        const res = this.readRM8(m) & this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        break;
      }
      case 0x85: { // TEST r/m16, r16
        const m = getModRM();
        const res = this.readRM16(m) & this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        break;
      }
      case 0xA8: { // TEST AL, imm8
        const res = this.regs.al & fetchByte();
        this.flags.updateLogic(res, false);
        break;
      }
      case 0xA9: { // TEST AX, imm16
        const res = this.regs.ax & fetchWord();
        this.flags.updateLogic(res, true);
        break;
      }

      // Group 3 (F6 / F7): TEST, NOT, NEG, MUL, IMUL, DIV, IDIV
      case 0xF6: { // 8-bit
        const m = getModRM();
        const a = this.readRM8(m);
        if (m.reg === 0) { // TEST r/m8, imm8
          const imm = fetchByte();
          this.flags.updateLogic(a & imm, false);
        } else if (m.reg === 2) { // NOT r/m8
          this.writeRM8(m, (~a) & 0xFF);
        } else if (m.reg === 3) { // NEG r/m8
          const res = (-a) & 0xFF;
          this.flags.updateNeg(a, res, false);
          this.writeRM8(m, res);
        } else if (m.reg === 4) { // MUL r/m8 (AX = AL * r/m8)
          const prod = this.regs.al * a;
          this.regs.ax = prod & 0xFFFF;
          const carry = (this.regs.ax & 0xFF00) !== 0;
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 5) { // IMUL r/m8
          const s1 = (this.regs.al & 0x80) ? (this.regs.al - 256) : this.regs.al;
          const s2 = (a & 0x80) ? (a - 256) : a;
          const prod = s1 * s2;
          this.regs.ax = prod & 0xFFFF;
          const carry = (prod < -128 || prod > 127);
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 6) { // DIV r/m8 (AL = AX / r/m8, AH = AX % r/m8)
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          const quot = Math.floor(this.regs.ax / a);
          const rem = this.regs.ax % a;
          if (quot > 0xFF) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.al = quot & 0xFF;
          this.regs.ah = rem & 0xFF;
        } else if (m.reg === 7) { // IDIV r/m8
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          const num = (this.regs.ax & 0x8000) ? (this.regs.ax - 65536) : this.regs.ax;
          const den = (a & 0x80) ? (a - 256) : a;
          const quot = Math.trunc(num / den);
          const rem = num % den;
          if (quot < -128 || quot > 127) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.al = quot & 0xFF;
          this.regs.ah = rem & 0xFF;
        } else {
          return { halted: true, error: `Unsupported F6 /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 0xF7: { // 16-bit
        const m = getModRM();
        const a = this.readRM16(m);
        if (m.reg === 0) { // TEST r/m16, imm16
          const imm = fetchWord();
          this.flags.updateLogic(a & imm, true);
        } else if (m.reg === 2) { // NOT r/m16
          this.writeRM16(m, (~a) & 0xFFFF);
        } else if (m.reg === 3) { // NEG r/m16
          const res = (-a) & 0xFFFF;
          this.flags.updateNeg(a, res, true);
          this.writeRM16(m, res);
        } else if (m.reg === 4) { // MUL r/m16 (DX:AX = AX * r/m16)
          const prod = this.regs.ax * a;
          this.regs.ax = prod & 0xFFFF;
          this.regs.dx = Math.floor(prod / 65536) & 0xFFFF;
          const carry = this.regs.dx !== 0;
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 5) { // IMUL r/m16
          const s1 = (this.regs.ax & 0x8000) ? (this.regs.ax - 65536) : this.regs.ax;
          const s2 = (a & 0x8000) ? (a - 65536) : a;
          const prod = s1 * s2;
          this.regs.ax = prod & 0xFFFF;
          this.regs.dx = Math.floor(prod / 65536) & 0xFFFF;
          const carry = (prod < -32768 || prod > 32767);
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 6) { // DIV r/m16 (AX = DX:AX / r/m16, DX = remainder)
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          const num = (this.regs.dx * 65536) + this.regs.ax;
          const quot = Math.floor(num / a);
          const rem = num % a;
          if (quot > 0xFFFF) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.ax = quot & 0xFFFF;
          this.regs.dx = rem & 0xFFFF;
        } else if (m.reg === 7) { // IDIV r/m16
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          let num = (this.regs.dx * 65536) + this.regs.ax;
          if (this.regs.dx & 0x8000) num -= 4294967296;
          const den = (a & 0x8000) ? (a - 65536) : a;
          const quot = Math.trunc(num / den);
          const rem = num % den;
          if (quot < -32768 || quot > 32767) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.ax = quot & 0xFFFF;
          this.regs.dx = rem & 0xFFFF;
        } else {
          return { halted: true, error: `Unsupported F7 /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }

      // --- Shifts & Rotates (D0, D1, D2, D3) ---
      case 0xD0: case 0xD1: case 0xD2: case 0xD3: {
        const m = getModRM();
        const is16 = (opcode === 0xD1 || opcode === 0xD3);
        const count = (opcode === 0xD0 || opcode === 0xD1) ? 1 : (this.regs.cl & 0x1F);
        if (count > 0) {
          let val = is16 ? this.readRM16(m) : this.readRM8(m);
          const mask = is16 ? 0xFFFF : 0xFF;
          const signBit = is16 ? 0x8000 : 0x80;
          const bitCount = is16 ? 16 : 8;

          for (let i = 0; i < count; i++) {
            switch (m.reg) {
              case 0: { // ROL
                const high = (val & signBit) ? 1 : 0;
                val = ((val << 1) | high) & mask;
                this.flags.cf = high === 1;
                if (count === 1) this.flags.of = ((val & signBit) ? 1 : 0) !== high;
                break;
              }
              case 1: { // ROR
                const low = val & 1;
                val = (val >> 1) | (low ? signBit : 0);
                this.flags.cf = low === 1;
                if (count === 1) {
                  const high = (val & signBit) ? 1 : 0;
                  const nextHigh = (val & (signBit >> 1)) ? 1 : 0;
                  this.flags.of = high !== nextHigh;
                }
                break;
              }
              case 2: { // RCL
                const high = (val & signBit) ? 1 : 0;
                val = ((val << 1) | (this.flags.cf ? 1 : 0)) & mask;
                this.flags.cf = high === 1;
                if (count === 1) this.flags.of = ((val & signBit) ? 1 : 0) !== high;
                break;
              }
              case 3: { // RCR
                const low = val & 1;
                val = (val >> 1) | (this.flags.cf ? signBit : 0);
                this.flags.cf = low === 1;
                if (count === 1) {
                  const high = (val & signBit) ? 1 : 0;
                  const nextHigh = (val & (signBit >> 1)) ? 1 : 0;
                  this.flags.of = high !== nextHigh;
                }
                break;
              }
              case 4: { // SHL / SAL
                const high = (val & signBit) ? 1 : 0;
                val = (val << 1) & mask;
                this.flags.cf = high === 1;
                if (count === 1) this.flags.of = ((val & signBit) ? 1 : 0) !== high;
                break;
              }
              case 5: { // SHR
                const low = val & 1;
                const origMsb = (val & signBit) !== 0;
                val = val >> 1;
                this.flags.cf = low === 1;
                if (count === 1) this.flags.of = origMsb;
                break;
              }
              case 7: { // SAR
                const low = val & 1;
                const high = val & signBit;
                val = (val >> 1) | high;
                this.flags.cf = low === 1;
                if (count === 1) this.flags.of = false;
                break;
              }
              default:
                return { halted: true, error: `Unsupported shift op /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
            }
          }

          if (m.reg === 4 || m.reg === 5 || m.reg === 7) {
            this.flags.zf = val === 0;
            this.flags.sf = (val & signBit) !== 0;
            this.flags.pf = computeParity(val);
          }

          if (is16) this.writeRM16(m, val); else this.writeRM8(m, val);
        }
        break;
      }

      // --- XCHG ---
      case 0x86: { // XCHG r/m8, r8
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        this.writeRM8(m, b);
        this.regs.setReg8ByIndex(m.reg, a);
        break;
      }
      case 0x87: { // XCHG r/m16, r16
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        this.writeRM16(m, b);
        this.regs.setReg16ByIndex(m.reg, a);
        break;
      }
      case 0x91: case 0x92: case 0x93: case 0x94:
      case 0x95: case 0x96: case 0x97: { // XCHG AX, r16 (90 is NOP)
        const regIdx = opcode & 7;
        const tmp = this.regs.ax;
        this.regs.ax = this.regs.getReg16ByIndex(regIdx);
        this.regs.setReg16ByIndex(regIdx, tmp);
        break;
      }

      // --- Phase 3: PUSH / POP / CALL / RET ---
      // PUSH r16 (50..57)
      case 0x50: case 0x51: case 0x52: case 0x53:
      case 0x54: case 0x55: case 0x56: case 0x57: {
        const regIdx = opcode & 7;
        this.push(this.regs.getReg16ByIndex(regIdx));
        break;
      }
      // POP r16 (58..5F)
      case 0x58: case 0x59: case 0x5A: case 0x5B:
      case 0x5C: case 0x5D: case 0x5E: case 0x5F: {
        const regIdx = opcode & 7;
        this.regs.setReg16ByIndex(regIdx, this.pop());
        break;
      }
      // POP r/m16 (8F /0)
      case 0x8F: {
        const m = getModRM();
        if (m.reg === 0) {
          const val = this.pop();
          this.writeRM16(m, val);
        } else {
          return { halted: true, error: `Unsupported 8F /${m.reg} @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      // PUSH seg / POP seg
      case 0x06: this.push(this.regs.es); break;
      case 0x07: this.regs.es = this.pop(); break;
      case 0x0E: this.push(this.regs.cs); break;
      case 0x16: this.push(this.regs.ss); break;
      case 0x17: this.regs.ss = this.pop(); break;
      case 0x1E: this.push(this.regs.ds); break;
      case 0x1F: this.regs.ds = this.pop(); break;

      // PUSHF / POPF
      case 0x9C: this.push(this.flags.toWord()); break;
      case 0x9D: this.flags.fromWord(this.pop()); break;

      // CALL near rel16
      case 0xE8: {
        const rel = fetchWord();
        const signedRel = (rel & 0x8000) ? (rel - 65536) : rel;
        this.push(currIp);
        currIp = (currIp + signedRel) & 0xFFFF;
        break;
      }
      // RET near
      case 0xC3: {
        currIp = this.pop();
        break;
      }
      // RET near imm16
      case 0xC2: {
        const imm = fetchWord();
        currIp = this.pop();
        this.regs.sp = (this.regs.sp + imm) & 0xFFFF;
        break;
      }

      // --- Flag Operations ---
      case 0xF8: this.flags.cf = false; break; // CLC
      case 0xF9: this.flags.cf = true; break;  // STC
      case 0xF5: this.flags.cf = !this.flags.cf; break; // CMC
      case 0xFC: this.flags.df = false; break; // CLD
      case 0xFD: this.flags.df = true; break;  // STD
      case 0xFA: this.flags.if = false; break; // CLI
      case 0xFB: this.flags.if = true; break;  // STI

      // --- Data Conversions & Specials ---
      case 0x98: { // CBW (Convert Byte to Word: sign extend AL into AX)
        this.regs.ah = (this.regs.al & 0x80) ? 0xFF : 0x00;
        break;
      }
      case 0x99: { // CWD (Convert Word to Doubleword: sign extend AX into DX:AX)
        this.regs.dx = (this.regs.ax & 0x8000) ? 0xFFFF : 0x0000;
        break;
      }
      case 0x9F: { // LAHF (Load AH from Flags)
        this.regs.ah = this.flags.toLowByte();
        break;
      }
      case 0x9E: { // SAHF (Store AH into Flags)
        this.flags.fromLowByte(this.regs.ah);
        break;
      }
      case 0xD7: { // XLAT / XLATB: AL = [DS:BX + AL]
        const s = segOverride || 'DS';
        const targetOff = (this.regs.bx + this.regs.al) & 0xFFFF;
        this.regs.al = this.mem.readByte(this.regs.getByName(s), targetOff, true);
        break;
      }
      case 0x9B: { // WAIT / FWAIT
        break; // Synchronize with coprocessor (NOP in 8086 without 8087)
      }

      // --- BCD Adjust Instructions ---
      case 0x27: { // DAA (Decimal Adjust after Addition)
        let al = this.regs.al;
        const oldAl = al;
        const oldCf = this.flags.cf;
        if ((al & 0x0F) > 9 || this.flags.af) {
          al = (al + 6) & 0xFF;
          this.flags.af = true;
        } else {
          this.flags.af = false;
        }
        if (oldAl > 0x99 || oldCf) {
          al = (al + 0x60) & 0xFF;
          this.flags.cf = true;
        } else {
          this.flags.cf = false;
        }
        this.regs.al = al;
        this.flags.zf = al === 0;
        this.flags.sf = (al & 0x80) !== 0;
        this.flags.pf = computeParity(al);
        break;
      }
      case 0x2F: { // DAS (Decimal Adjust after Subtraction)
        let al = this.regs.al;
        const oldAl = al;
        const oldCf = this.flags.cf;
        if ((al & 0x0F) > 9 || this.flags.af) {
          al = (al - 6) & 0xFF;
          this.flags.af = true;
        } else {
          this.flags.af = false;
        }
        if (oldAl > 0x99 || oldCf) {
          al = (al - 0x60) & 0xFF;
          this.flags.cf = true;
        } else {
          this.flags.cf = false;
        }
        this.regs.al = al;
        this.flags.zf = al === 0;
        this.flags.sf = (al & 0x80) !== 0;
        this.flags.pf = computeParity(al);
        break;
      }
      case 0x37: { // AAA (ASCII Adjust after Addition)
        if ((this.regs.al & 0x0F) > 9 || this.flags.af) {
          this.regs.al = (this.regs.al + 6) & 0x0F;
          this.regs.ah = (this.regs.ah + 1) & 0xFF;
          this.flags.af = true;
          this.flags.cf = true;
        } else {
          this.regs.al = this.regs.al & 0x0F;
          this.flags.af = false;
          this.flags.cf = false;
        }
        break;
      }
      case 0x3F: { // AAS (ASCII Adjust after Subtraction)
        if ((this.regs.al & 0x0F) > 9 || this.flags.af) {
          this.regs.al = (this.regs.al - 6) & 0x0F;
          this.regs.ah = (this.regs.ah - 1) & 0xFF;
          this.flags.af = true;
          this.flags.cf = true;
        } else {
          this.regs.al = this.regs.al & 0x0F;
          this.flags.af = false;
          this.flags.cf = false;
        }
        break;
      }
      case 0xD4: { // AAM (ASCII Adjust after Multiply)
        const base = fetchByte();
        if (base === 0) {
          return { halted: true, error: `Divide by zero in AAM @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        this.regs.ah = Math.floor(this.regs.al / base) & 0xFF;
        this.regs.al = (this.regs.al % base) & 0xFF;
        this.flags.zf = this.regs.al === 0;
        this.flags.sf = (this.regs.al & 0x80) !== 0;
        this.flags.pf = computeParity(this.regs.al);
        break;
      }
      case 0xD5: { // AAD (ASCII Adjust before Division)
        const base = fetchByte();
        this.regs.al = ((this.regs.ah * base) + this.regs.al) & 0xFF;
        this.regs.ah = 0;
        this.flags.zf = this.regs.al === 0;
        this.flags.sf = (this.regs.al & 0x80) !== 0;
        this.flags.pf = computeParity(this.regs.al);
        break;
      }

      // --- Pointer Loading (LDS, LES) ---
      case 0xC5: { // LDS r16, m16
        const m = getModRM();
        if (m.isReg) {
          return { halted: true, error: `Invalid LDS operand @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        const segVal = this.regs.getByName(m.baseSegment);
        const off = this.mem.readWord(segVal, m.offset, true);
        const seg = this.mem.readWord(segVal, (m.offset + 2) & 0xFFFF, true);
        this.regs.setReg16ByIndex(m.reg, off);
        this.regs.ds = seg;
        break;
      }
      case 0xC4: { // LES r16, m16
        const m = getModRM();
        if (m.isReg) {
          return { halted: true, error: `Invalid LES operand @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        const segVal = this.regs.getByName(m.baseSegment);
        const off = this.mem.readWord(segVal, m.offset, true);
        const seg = this.mem.readWord(segVal, (m.offset + 2) & 0xFFFF, true);
        this.regs.setReg16ByIndex(m.reg, off);
        this.regs.es = seg;
        break;
      }

      // --- String CMPSB / CMPSW / SCASB / SCASW ---
      case 0xA6: { // CMPSB
        const doCmpsb = () => {
          const s = segOverride || 'DS';
          const srcVal = this.mem.readByte(this.regs.getByName(s), this.regs.si, true);
          const destVal = this.mem.readByte(this.regs.es, this.regs.di, true);
          const res = (srcVal - destVal) & 0xFF;
          this.flags.updateSub(srcVal, destVal, res, false);
          const delta = this.flags.df ? -1 : 1;
          this.regs.si = (this.regs.si + delta) & 0xFFFF;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') { // REPE / REPZ
          while (this.regs.cx > 0) {
            doCmpsb();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === 'REPNZ') {
          while (this.regs.cx > 0) {
            doCmpsb();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (this.flags.zf) break;
          }
        } else {
          doCmpsb();
        }
        break;
      }
      case 0xAE: { // SCASB (Compare AL with [ES:DI])
        const doScasb = () => {
          const destVal = this.mem.readByte(this.regs.es, this.regs.di, true);
          const res = (this.regs.al - destVal) & 0xFF;
          this.flags.updateSub(this.regs.al, destVal, res, false);
          const delta = this.flags.df ? -1 : 1;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') {
          while (this.regs.cx > 0) {
            doScasb();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === 'REPNZ') {
          while (this.regs.cx > 0) {
            doScasb();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (this.flags.zf) break;
          }
        } else {
          doScasb();
        }
        break;
      }
      case 0xA7: { // CMPSW
        const doCmpsw = () => {
          const s = segOverride || 'DS';
          const srcVal = this.mem.readWord(this.regs.getByName(s), this.regs.si, true);
          const destVal = this.mem.readWord(this.regs.es, this.regs.di, true);
          const res = (srcVal - destVal) & 0xFFFF;
          this.flags.updateSub(srcVal, destVal, res, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.si = (this.regs.si + delta) & 0xFFFF;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') {
          while (this.regs.cx > 0) {
            doCmpsw();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === 'REPNZ') {
          while (this.regs.cx > 0) {
            doCmpsw();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (this.flags.zf) break;
          }
        } else {
          doCmpsw();
        }
        break;
      }
      case 0xAF: { // SCASW
        const doScasw = () => {
          const destVal = this.mem.readWord(this.regs.es, this.regs.di, true);
          const res = (this.regs.ax - destVal) & 0xFFFF;
          this.flags.updateSub(this.regs.ax, destVal, res, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') {
          while (this.regs.cx > 0) {
            doScasw();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === 'REPNZ') {
          while (this.regs.cx > 0) {
            doScasw();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
            if (this.flags.zf) break;
          }
        } else {
          doScasw();
        }
        break;
      }

      // --- Port I/O (IN / OUT) ---
      case 0xE4: { // IN AL, imm8
        const port = fetchByte();
        const val = this.io.readByte(port);
        this.regs.al = val;
        consoleText = `[IN Port 0x${port.toString(16).toUpperCase().padStart(2, '0')}] -> 0x${val.toString(16).toUpperCase().padStart(2, '0')}`;
        break;
      }
      case 0xE5: { // IN AX, imm8
        const port = fetchByte();
        const val = this.io.readWord(port);
        this.regs.ax = val;
        consoleText = `[IN Port 0x${port.toString(16).toUpperCase().padStart(2, '0')}] -> 0x${val.toString(16).toUpperCase().padStart(4, '0')}`;
        break;
      }
      case 0xE6: { // OUT imm8, AL
        const port = fetchByte();
        const val = this.regs.al;
        this.io.writeByte(port, val);
        const charDesc = (val >= 32 && val <= 126) ? ` ('${String.fromCharCode(val)}')` : '';
        consoleText = `[OUT Port 0x${port.toString(16).toUpperCase().padStart(2, '0')}] <- 0x${val.toString(16).toUpperCase().padStart(2, '0')}${charDesc}`;
        break;
      }
      case 0xE7: { // OUT imm8, AX
        const port = fetchByte();
        const val = this.regs.ax;
        this.io.writeWord(port, val);
        consoleText = `[OUT Port 0x${port.toString(16).toUpperCase().padStart(2, '0')}] <- 0x${val.toString(16).toUpperCase().padStart(4, '0')}`;
        break;
      }
      case 0xEC: { // IN AL, DX
        const port = this.regs.dx;
        const val = this.io.readByte(port);
        this.regs.al = val;
        consoleText = `[IN Port DX (0x${port.toString(16).toUpperCase().padStart(4, '0')})] -> 0x${val.toString(16).toUpperCase().padStart(2, '0')}`;
        break;
      }
      case 0xED: { // IN AX, DX
        const port = this.regs.dx;
        const val = this.io.readWord(port);
        this.regs.ax = val;
        consoleText = `[IN Port DX (0x${port.toString(16).toUpperCase().padStart(4, '0')})] -> 0x${val.toString(16).toUpperCase().padStart(4, '0')}`;
        break;
      }
      case 0xEE: { // OUT DX, AL
        const port = this.regs.dx;
        const val = this.regs.al;
        this.io.writeByte(port, val);
        const charDesc = (val >= 32 && val <= 126) ? ` ('${String.fromCharCode(val)}')` : '';
        consoleText = `[OUT Port DX (0x${port.toString(16).toUpperCase().padStart(4, '0')})] <- 0x${val.toString(16).toUpperCase().padStart(2, '0')}${charDesc}`;
        break;
      }
      case 0xEF: { // OUT DX, AX
        const port = this.regs.dx;
        const val = this.regs.ax;
        this.io.writeWord(port, val);
        consoleText = `[OUT Port DX (0x${port.toString(16).toUpperCase().padStart(4, '0')})] <- 0x${val.toString(16).toUpperCase().padStart(4, '0')}`;
        break;
      }

      // --- Phase 4: String operations & Interrupts ---
      // MOVSB (A4)
      case 0xA4: {
        const doMove = () => {
          const s = segOverride || 'DS';
          const byteVal = this.mem.readByte(this.regs.getByName(s), this.regs.si, true);
          this.mem.writeByte(this.regs.es, this.regs.di, byteVal, true);
          const delta = this.flags.df ? -1 : 1;
          this.regs.si = (this.regs.si + delta) & 0xFFFF;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') {
          while (this.regs.cx > 0) {
            doMove();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
          }
        } else {
          doMove();
        }
        break;
      }
      // STOSB (AA)
      case 0xAA: {
        const doStore = () => {
          this.mem.writeByte(this.regs.es, this.regs.di, this.regs.al, true);
          const delta = this.flags.df ? -1 : 1;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') {
          while (this.regs.cx > 0) {
            doStore();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
          }
        } else {
          doStore();
        }
        break;
      }
      // LODSB (AC)
      case 0xAC: {
        const s = segOverride || 'DS';
        this.regs.al = this.mem.readByte(this.regs.getByName(s), this.regs.si, true);
        const delta = this.flags.df ? -1 : 1;
        this.regs.si = (this.regs.si + delta) & 0xFFFF;
        break;
      }
      // MOVSW (A5)
      case 0xA5: {
        const doMoveW = () => {
          const s = segOverride || 'DS';
          const wordVal = this.mem.readWord(this.regs.getByName(s), this.regs.si, true);
          this.mem.writeWord(this.regs.es, this.regs.di, wordVal, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.si = (this.regs.si + delta) & 0xFFFF;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') {
          while (this.regs.cx > 0) {
            doMoveW();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
          }
        } else {
          doMoveW();
        }
        break;
      }
      // STOSW (AB)
      case 0xAB: {
        const doStoreW = () => {
          this.mem.writeWord(this.regs.es, this.regs.di, this.regs.ax, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.di = (this.regs.di + delta) & 0xFFFF;
        };

        if (repPrefix === 'REP') {
          while (this.regs.cx > 0) {
            doStoreW();
            this.regs.cx = (this.regs.cx - 1) & 0xFFFF;
          }
        } else {
          doStoreW();
        }
        break;
      }
      // LODSW (AD)
      case 0xAD: {
        const s = segOverride || 'DS';
        this.regs.ax = this.mem.readWord(this.regs.getByName(s), this.regs.si, true);
        const delta = this.flags.df ? -2 : 2;
        this.regs.si = (this.regs.si + delta) & 0xFFFF;
        break;
      }

      // INT 10h / INT 16h / INT 20h / INT 21h / INT 3
      case 0xCD: {
        const intNum = fetchByte();
        if (intNum === 0x10) { // BIOS video service
          const ah = this.regs.ah;
          if (ah === 0x0E) { // Teletype output (AL = character)
            consoleText = String.fromCharCode(this.regs.al);
          } else {
            consoleText = `[INT 10h AH=${ah.toString(16).padStart(2, '0')}h]`;
          }
        } else if (intNum === 0x16) { // BIOS keyboard services
          const ah = this.regs.ah;
          if (ah === 0x00 || ah === 0x10) { // Wait for keystroke
            if (this.io.hasInput()) {
              const ch = this.io.popInput()!;
              this.regs.al = ch;
              this.regs.ah = 0; // standard scan code dummy
              consoleText = `[INT 16h Tuş: '${String.fromCharCode(ch)}' (0x${ch.toString(16).toUpperCase()})]`;
            } else {
              currIp = initialIp;
              waitingForInput = true;
              consoleText = '[INT 16h: Tuş girdisi bekleniyor...]';
            }
          } else if (ah === 0x01 || ah === 0x11) { // Check keystroke status
            if (this.io.hasInput()) {
              this.flags.zf = false;
              this.regs.al = this.io.peekInput()!;
              this.regs.ah = 0;
            } else {
              this.flags.zf = true;
            }
          } else {
            consoleText = `[Unhandled INT 16h AH=${ah.toString(16).padStart(2, '0')}h]`;
          }
        } else if (intNum === 0x20) { // DOS terminate
          halted = true;
          consoleText = "[Program terminated via INT 20h]";
        } else if (intNum === 0x21) { // DOS service
          const ah = this.regs.ah;
          if (ah === 0x01 || ah === 0x08) { // Console input (01h echoes, 08h does not)
            if (this.io.hasInput()) {
              const ch = this.io.popInput()!;
              this.regs.al = ch;
              if (ah === 0x01) {
                consoleText = String.fromCharCode(ch);
              }
            } else {
              currIp = initialIp;
              waitingForInput = true;
              consoleText = '[INT 21h: Karakter girdisi bekleniyor...]';
            }
          } else if (ah === 0x02) { // Print char in DL
            const charStr = String.fromCharCode(this.regs.dl);
            consoleText = charStr;
          } else if (ah === 0x09) { // Print $-terminated string at DS:DX
            let str = '';
            let ptr = this.regs.dx;
            while (true) {
              const b = this.mem.readByte(this.regs.ds, ptr, true);
              if (b === 0x24) break; // '$'
              str += String.fromCharCode(b);
              ptr = (ptr + 1) & 0xFFFF;
              if (str.length > 2000) break; // safety guard
            }
            consoleText = str;
          } else if (ah === 0x0A) { // Buffered keyboard input at DS:DX
            if (this.io.hasInput()) {
              const maxLen = this.mem.readByte(this.regs.ds, this.regs.dx, true);
              let count = 0;
              while (this.io.hasInput() && count < maxLen) {
                const ch = this.io.popInput()!;
                if (ch === 0x0D || ch === 0x0A) { // Enter pressed
                  break;
                }
                this.mem.writeByte(this.regs.ds, (this.regs.dx + 2 + count) & 0xFFFF, ch, true);
                count++;
              }
              this.mem.writeByte(this.regs.ds, (this.regs.dx + 1) & 0xFFFF, count, true);
              this.mem.writeByte(this.regs.ds, (this.regs.dx + 2 + count) & 0xFFFF, 0x0D, true);
              consoleText = `[INT 21h Buffer: ${count} karakter okundu]`;
            } else {
              currIp = initialIp;
              waitingForInput = true;
              consoleText = '[INT 21h AH=0Ah: Metin girdisi bekleniyor...]';
            }
          } else if (ah === 0x4C) { // Exit with return code AL
            halted = true;
            consoleText = `[Program terminated with return code: ${this.regs.al}]`;
          } else {
            consoleText = `[Unhandled INT 21h AH=${ah.toString(16).padStart(2,'0')}h]`;
          }
        } else {
          return { halted: true, error: `Unhandled interrupt INT ${intNum.toString(16)}h @ ${cs.toString(16).padStart(4,'0')}:${initialIp.toString(16).padStart(4,'0')}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 0xCC: { // INT 3 breakpoint
        halted = true;
        consoleText = "[Breakpoint hit]";
        break;
      }

      default:
        return {
          halted: true,
          error: `Geçersiz opcode 0x${opcode.toString(16).toUpperCase().padStart(2, '0')} @ ${cs.toString(16).toUpperCase().padStart(4, '0')}:${initialIp.toString(16).toUpperCase().padStart(4, '0')}`,
          ipBefore: initialIp,
          ipAfter: initialIp
        };
    }

    this.regs.ip = currIp;
    return {
      halted,
      ipBefore: initialIp,
      ipAfter: currIp,
      consoleText,
      waitingForInput
    };
  }
}
