import { Registers } from './registers.js';
import { Memory } from './memory.js';

export interface DecodedModRM {
  mod: number;
  reg: number; // bit 5..3 (reg or opcode extension)
  rm: number;  // bit 2..0
  isReg: boolean;
  baseSegment: 'CS' | 'DS' | 'ES' | 'SS';
  offset: number; // effective offset in segment (when !isReg)
  bytesRead: number;
}

export class Decoder {
  static decodeModRM(
    mem: Memory,
    regs: Registers,
    seg: number,
    ip: number,
    segmentOverride?: 'CS' | 'DS' | 'ES' | 'SS'
  ): DecodedModRM {
    const modrmByte = mem.readByte(seg, ip, true);
    const mod = (modrmByte >> 6) & 3;
    const reg = (modrmByte >> 3) & 7;
    const rm = modrmByte & 7;

    let bytesRead = 1;
    let isReg = mod === 3;
    let baseSegment: 'DS' | 'SS' = 'DS';
    let offset = 0;

    if (isReg) {
      return { mod, reg, rm, isReg: true, baseSegment: 'DS', offset: 0, bytesRead: 1 };
    }

    // Displacement resolution
    let disp = 0;
    if (mod === 0) {
      if (rm === 6) {
        // Direct 16-bit address [disp16], default DS
        const low = mem.readByte(seg, (ip + bytesRead) & 0xFFFF, true);
        const high = mem.readByte(seg, (ip + bytesRead + 1) & 0xFFFF, true);
        disp = (high << 8) | low;
        bytesRead += 2;
        baseSegment = 'DS';
        offset = disp;
        return {
          mod,
          reg,
          rm,
          isReg: false,
          baseSegment: segmentOverride || baseSegment,
          offset: offset & 0xFFFF,
          bytesRead
        };
      }
    } else if (mod === 1) {
      // 8-bit signed displacement
      const raw = mem.readByte(seg, (ip + bytesRead) & 0xFFFF, true);
      disp = (raw & 0x80) ? (raw - 256) : raw;
      bytesRead += 1;
    } else if (mod === 2) {
      // 16-bit displacement
      const low = mem.readByte(seg, (ip + bytesRead) & 0xFFFF, true);
      const high = mem.readByte(seg, (ip + bytesRead + 1) & 0xFFFF, true);
      disp = (high << 8) | low;
      bytesRead += 2;
    }

    // Determine base register & default segment
    let base = 0;
    switch (rm) {
      case 0: // [BX + SI]
        base = (regs.bx + regs.si) & 0xFFFF;
        baseSegment = 'DS';
        break;
      case 1: // [BX + DI]
        base = (regs.bx + regs.di) & 0xFFFF;
        baseSegment = 'DS';
        break;
      case 2: // [BP + SI]
        base = (regs.bp + regs.si) & 0xFFFF;
        baseSegment = 'SS';
        break;
      case 3: // [BP + DI]
        base = (regs.bp + regs.di) & 0xFFFF;
        baseSegment = 'SS';
        break;
      case 4: // [SI]
        base = regs.si;
        baseSegment = 'DS';
        break;
      case 5: // [DI]
        base = regs.di;
        baseSegment = 'DS';
        break;
      case 6: // [BP] (mod 1 or 2)
        base = regs.bp;
        baseSegment = 'SS';
        break;
      case 7: // [BX]
        base = regs.bx;
        baseSegment = 'DS';
        break;
    }

    offset = (base + disp) & 0xFFFF;

    return {
      mod,
      reg,
      rm,
      isReg: false,
      baseSegment: segmentOverride || baseSegment,
      offset,
      bytesRead
    };
  }
}
