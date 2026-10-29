import { ParsedInstruction } from './parser.js';
import { Operand, OperandSize, RegisterOperand, ImmediateOperand, MemoryOperand, OperandParser } from './operands.js';

export interface EncodeContext {
  currentAddr: number;
  symbols: Map<string, number>;
  isPass2: boolean;
}

export interface EncodedInstruction {
  bytes: number[];
  length: number;
}

export class Encoder {
  static encode(
    inst: ParsedInstruction,
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    const raw = this.encodeInstruction(inst, ctx, lineNum);
    const prefixes: number[] = [];

    // Instruction prefixes (e.g. REP / REPE / REPNE)
    if (inst.prefixBytes && inst.prefixBytes.length > 0) {
      prefixes.push(...inst.prefixBytes);
    }

    // Segment override prefix from memory operands
    for (const op of inst.operands) {
      if (op.kind === 'MEMORY' && op.segmentOverride) {
        const segCodes: Record<string, number> = {
          ES: 0x26,
          CS: 0x2E,
          SS: 0x36,
          DS: 0x3E
        };
        const code = segCodes[op.segmentOverride];
        if (code !== undefined) {
          prefixes.push(code);
        }
        break;
      }
    }

    if (prefixes.length > 0) {
      return {
        bytes: [...prefixes, ...raw.bytes],
        length: prefixes.length + raw.length
      };
    }
    return raw;
  }

  private static encodeInstruction(
    inst: ParsedInstruction,
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    const mnemonic = inst.mnemonic.toUpperCase();
    const ops = inst.operands;

    switch (mnemonic) {
      case 'NOP': return { bytes: [0x90], length: 1 };
      case 'HLT': return { bytes: [0xF4], length: 1 };
      case 'PUSHA': return { bytes: [0x60], length: 1 };
      case 'POPA': return { bytes: [0x61], length: 1 };
      case 'PUSHF': return { bytes: [0x9C], length: 1 };
      case 'POPF': return { bytes: [0x9D], length: 1 };
      case 'MOVSB': return { bytes: [0xA4], length: 1 };
      case 'MOVSW': return { bytes: [0xA5], length: 1 };
      case 'STOSB': return { bytes: [0xAA], length: 1 };
      case 'STOSW': return { bytes: [0xAB], length: 1 };
      case 'LODSB': return { bytes: [0xAC], length: 1 };
      case 'LODSW': return { bytes: [0xAD], length: 1 };
      case 'CMPSB': return { bytes: [0xA6], length: 1 };
      case 'CMPSW': return { bytes: [0xA7], length: 1 };
      case 'SCASB': return { bytes: [0xAE], length: 1 };
      case 'SCASW': return { bytes: [0xAF], length: 1 };

      case 'CLC': return { bytes: [0xF8], length: 1 };
      case 'STC': return { bytes: [0xF9], length: 1 };
      case 'CMC': return { bytes: [0xF5], length: 1 };
      case 'CLD': return { bytes: [0xFC], length: 1 };
      case 'STD': return { bytes: [0xFD], length: 1 };
      case 'CLI': return { bytes: [0xFA], length: 1 };
      case 'STI': return { bytes: [0xFB], length: 1 };
      case 'IRET': return { bytes: [0xCF], length: 1 };

      case 'CBW': return { bytes: [0x98], length: 1 };
      case 'CWD': return { bytes: [0x99], length: 1 };
      case 'LAHF': return { bytes: [0x9F], length: 1 };
      case 'SAHF': return { bytes: [0x9E], length: 1 };
      case 'XLAT': case 'XLATB': return { bytes: [0xD7], length: 1 };
      case 'WAIT': return { bytes: [0x9B], length: 1 };

      case 'DAA': return { bytes: [0x27], length: 1 };
      case 'DAS': return { bytes: [0x2F], length: 1 };
      case 'AAA': return { bytes: [0x37], length: 1 };
      case 'AAS': return { bytes: [0x3F], length: 1 };
      case 'AAM': {
        const base = ops.length === 1 && ops[0].kind === 'IMMEDIATE' ? (ops[0].value ?? 10) : 10;
        return { bytes: [0xD4, base & 0xFF], length: 2 };
      }
      case 'AAD': {
        const base = ops.length === 1 && ops[0].kind === 'IMMEDIATE' ? (ops[0].value ?? 10) : 10;
        return { bytes: [0xD5, base & 0xFF], length: 2 };
      }

      case 'LDS': return this.encodePointerLoad(0xC5, ops, ctx, lineNum);
      case 'LES': return this.encodePointerLoad(0xC4, ops, ctx, lineNum);

      case 'IN': return this.encodeIN(ops, ctx, lineNum);
      case 'OUT': return this.encodeOUT(ops, ctx, lineNum);

      case 'MOV': return this.encodeMOV(ops, ctx, lineNum);
      case 'LEA': return this.encodeLEA(ops, ctx, lineNum);
      case 'ADD': return this.encodeALU(0, 0x00, ops, ctx, lineNum);
      case 'OR':  return this.encodeALU(1, 0x08, ops, ctx, lineNum);
      case 'ADC': return this.encodeALU(2, 0x10, ops, ctx, lineNum);
      case 'SBB': return this.encodeALU(3, 0x18, ops, ctx, lineNum);
      case 'AND': return this.encodeALU(4, 0x20, ops, ctx, lineNum);
      case 'SUB': return this.encodeALU(5, 0x28, ops, ctx, lineNum);
      case 'XOR': return this.encodeALU(6, 0x30, ops, ctx, lineNum);
      case 'CMP': return this.encodeALU(7, 0x38, ops, ctx, lineNum);

      case 'INC': return this.encodeIncDec(0, 0x40, ops, ctx, lineNum);
      case 'DEC': return this.encodeIncDec(1, 0x48, ops, ctx, lineNum);

      case 'NOT': return this.encodeUnary(2, ops, ctx, lineNum);
      case 'NEG': return this.encodeUnary(3, ops, ctx, lineNum);
      case 'MUL': return this.encodeUnary(4, ops, ctx, lineNum);
      case 'IMUL': return this.encodeUnary(5, ops, ctx, lineNum);
      case 'DIV': return this.encodeUnary(6, ops, ctx, lineNum);
      case 'IDIV': return this.encodeUnary(7, ops, ctx, lineNum);

      case 'TEST': return this.encodeTEST(ops, ctx, lineNum);
      case 'XCHG': return this.encodeXCHG(ops, ctx, lineNum);

      case 'SHL': case 'SAL': return this.encodeShift(4, ops, ctx, lineNum);
      case 'SHR': return this.encodeShift(5, ops, ctx, lineNum);
      case 'SAR': return this.encodeShift(7, ops, ctx, lineNum);
      case 'ROL': return this.encodeShift(0, ops, ctx, lineNum);
      case 'ROR': return this.encodeShift(1, ops, ctx, lineNum);
      case 'RCL': return this.encodeShift(2, ops, ctx, lineNum);
      case 'RCR': return this.encodeShift(3, ops, ctx, lineNum);

      case 'PUSH': return this.encodePush(ops, ctx, lineNum);
      case 'POP': return this.encodePop(ops, ctx, lineNum);

      case 'CALL': return this.encodeCall(ops, ctx, lineNum);
      case 'RET': case 'RETN': return this.encodeRet(ops, ctx, lineNum);

      case 'JMP': return this.encodeJMP(ops, ctx, lineNum);

      case 'JE': case 'JZ': return this.encodeJcc(0x74, ops, ctx, lineNum);
      case 'JNE': case 'JNZ': return this.encodeJcc(0x75, ops, ctx, lineNum);
      case 'JB': case 'JC': case 'JNAE': return this.encodeJcc(0x72, ops, ctx, lineNum);
      case 'JNB': case 'JNC': case 'JAE': return this.encodeJcc(0x73, ops, ctx, lineNum);
      case 'JA': case 'JNBE': return this.encodeJcc(0x77, ops, ctx, lineNum);
      case 'JBE': case 'JNA': return this.encodeJcc(0x76, ops, ctx, lineNum);
      case 'JL': case 'JNGE': return this.encodeJcc(0x7C, ops, ctx, lineNum);
      case 'JGE': case 'JNL': return this.encodeJcc(0x7D, ops, ctx, lineNum);
      case 'JLE': case 'JNG': return this.encodeJcc(0x7E, ops, ctx, lineNum);
      case 'JG': case 'JNLE': return this.encodeJcc(0x7F, ops, ctx, lineNum);
      case 'JS': return this.encodeJcc(0x78, ops, ctx, lineNum);
      case 'JNS': return this.encodeJcc(0x79, ops, ctx, lineNum);
      case 'JO': return this.encodeJcc(0x70, ops, ctx, lineNum);
      case 'JNO': return this.encodeJcc(0x71, ops, ctx, lineNum);
      case 'JP': case 'JPE': return this.encodeJcc(0x7A, ops, ctx, lineNum);
      case 'JNP': case 'JPO': return this.encodeJcc(0x7B, ops, ctx, lineNum);
      case 'JCXZ': return this.encodeJcc(0xE3, ops, ctx, lineNum);

      case 'LOOP': return this.encodeJcc(0xE2, ops, ctx, lineNum);
      case 'LOOPE': case 'LOOPZ': return this.encodeJcc(0xE1, ops, ctx, lineNum);
      case 'LOOPNE': case 'LOOPNZ': return this.encodeJcc(0xE0, ops, ctx, lineNum);

      case 'INT': return this.encodeINT(ops, ctx, lineNum);

      default:
        throw new Error(`Bilinmeyen komut '${mnemonic}' satır: ${lineNum}`);
    }
  }

  // Resolves an immediate value or label
  private static resolveImm(op: ImmediateOperand, ctx: EncodeContext, lineNum: number): number {
    let val = op.disp;
    if (op.value !== undefined) {
      val += op.value;
    }
    if (op.label) {
      const lblUpper = op.label.toUpperCase();
      if (ctx.symbols.has(lblUpper)) {
        val += ctx.symbols.get(lblUpper)!;
      } else if (ctx.isPass2) {
        throw new Error(`Tanımsız etiket '${op.label}' satır: ${lineNum}`);
      }
    }
    return val;
  }

  // --- LEA reg16, mem ---
  private static encodeLEA(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`LEA 2 operand bekler, satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    if (dest.kind !== 'REGISTER' || dest.size !== 'WORD' || dest.isSegment) {
      throw new Error(`LEA hedefi 16-bit genel yazmaç olmalıdır, satır: ${lineNum}`);
    }

    // In 8086 ISA, LEA requires a memory operand (m16) or a labeled memory address.
    // Bare immediate numbers (e.g. LEA AX, 1234H) are invalid!
    let memOp: MemoryOperand;
    if (src.kind === 'IMMEDIATE') {
      if (!src.label) {
        throw new Error(`LEA komutunda sayı sabiti kullanılamaz, bellek referansı veya etiket beklenir (örn: LEA AX, [1234H]), satır: ${lineNum}`);
      }
      memOp = {
        kind: 'MEMORY',
        disp: src.disp,
        label: src.label,
        modrm: { mod: 0, rm: 6, dispBytes: 2 }
      };
    } else if (src.kind === 'MEMORY') {
      memOp = src;
    } else {
      throw new Error(`LEA geçersiz kaynak operand, satır: ${lineNum}`);
    }

    const { modrmBytes, length } = this.buildModRM(dest.regIndex, memOp, ctx, lineNum);
    return {
      bytes: [0x8D, ...modrmBytes],
      length: 1 + length
    };
  }

  // --- MOV ---
  private static encodeMOV(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`MOV 2 operand bekler, satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    // MOV reg, imm
    if (dest.kind === 'REGISTER' && src.kind === 'IMMEDIATE') {
      if (dest.isSegment) {
        throw new Error(`8086 mimarisinde segment yazmaçlarına doğrudan sayı (immediate) yüklenemez! Önce genel amaçlı bir yazmaca (örn: MOV AX, ${src.value ?? 'değer'}) yükleyip ardından MOV ${dest.name}, AX yapmalısınız, satır: ${lineNum}`);
      }
      const val = this.resolveImm(src, ctx, lineNum);
      if (dest.size === 'BYTE') {
        if (ctx.isPass2 && (val < -128 || val > 255)) {
          throw new Error(`Değer 8-bit sınırını aşıyor (${val}), satır: ${lineNum}`);
        }
        return {
          bytes: [0xB0 + dest.regIndex, val & 0xFF],
          length: 2
        };
      } else {
        if (ctx.isPass2 && (val < -32768 || val > 65535)) {
          throw new Error(`Değer 16-bit sınırını aşıyor (${val}), satır: ${lineNum}`);
        }
        return {
          bytes: [0xB8 + dest.regIndex, val & 0xFF, (val >> 8) & 0xFF],
          length: 3
        };
      }
    }

    // MOV reg, reg
    if (dest.kind === 'REGISTER' && src.kind === 'REGISTER') {
      if (dest.isSegment || src.isSegment) {
        if (dest.isSegment && src.isSegment) throw new Error(`Segmentten segmente MOV desteklenmez, satır: ${lineNum}`);
        if (dest.isSegment) {
          if (dest.name === 'CS') throw new Error(`8086 mimarisinde CS (Code Segment) yazmacına doğrudan MOV ile değer atanamaz, satır: ${lineNum}`);
          // MOV Sreg, r16 (8E /r)
          const modrm = 0xC0 | (dest.regIndex << 3) | src.regIndex;
          return { bytes: [0x8E, modrm], length: 2 };
        } else {
          // MOV r16, Sreg (8C /r)
          const modrm = 0xC0 | (src.regIndex << 3) | dest.regIndex;
          return { bytes: [0x8C, modrm], length: 2 };
        }
      }
      if (dest.size !== src.size) throw new Error(`Operand boyutları uyuşmuyor, satır: ${lineNum}`);
      const is16 = dest.size === 'WORD';
      const opcode = is16 ? 0x89 : 0x88;
      // mod=11 (register mode), reg=src, rm=dest
      const modrm = 0xC0 | (src.regIndex << 3) | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }

    // MOV reg, mem
    if (dest.kind === 'REGISTER' && src.kind === 'MEMORY') {
      if (dest.isSegment) {
        if (dest.name === 'CS') throw new Error(`8086 mimarisinde CS (Code Segment) yazmacına doğrudan MOV ile değer atanamaz, satır: ${lineNum}`);
        // MOV Sreg, m16 (8E /r)
        const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
        return { bytes: [0x8E, ...modrmBytes], length: 1 + length };
      }
      const is16 = dest.size === 'WORD';
      const opcode = is16 ? 0x8B : 0x8A;
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    // MOV mem, reg
    if (dest.kind === 'MEMORY' && src.kind === 'REGISTER') {
      if (src.isSegment) {
        // MOV m16, Sreg (8C /r)
        const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
        return { bytes: [0x8C, ...modrmBytes], length: 1 + length };
      }
      const is16 = src.size === 'WORD';
      const opcode = is16 ? 0x89 : 0x88;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    // MOV mem, imm
    if (dest.kind === 'MEMORY' && src.kind === 'IMMEDIATE') {
      if (!dest.size) {
        throw new Error(`Operand size belirtilmedi (BYTE PTR veya WORD PTR kullanın), satır: ${lineNum}`);
      }
      const is16 = dest.size === 'WORD';
      const opcode = is16 ? 0xC7 : 0xC6;
      const val = this.resolveImm(src, ctx, lineNum);
      const { modrmBytes, length } = this.buildModRM(0, dest, ctx, lineNum);
      const immBytes = is16 ? [val & 0xFF, (val >> 8) & 0xFF] : [val & 0xFF];
      return {
        bytes: [opcode, ...modrmBytes, ...immBytes],
        length: 1 + length + immBytes.length
      };
    }

    throw new Error(`Desteklenmeyen MOV operand kombinasyonu, satır: ${lineNum}`);
  }

  // --- ALU (ADD, OR, AND, SUB, XOR, CMP) ---
  private static encodeALU(
    ext: number,
    baseOpcode: number,
    ops: Operand[],
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`Komut 2 operand bekler, satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    // reg, reg
    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'REGISTER' && !src.isSegment) {
      if (dest.size !== src.size) throw new Error(`Operand boyutları uyuşmuyor, satır: ${lineNum}`);
      const is16 = dest.size === 'WORD';
      const opcode = is16 ? (baseOpcode + 1) : baseOpcode;
      const modrm = 0xC0 | (src.regIndex << 3) | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }

    // reg, mem
    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'MEMORY') {
      const is16 = dest.size === 'WORD';
      const opcode = is16 ? (baseOpcode + 3) : (baseOpcode + 2);
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    // mem, reg
    if (dest.kind === 'MEMORY' && src.kind === 'REGISTER' && !src.isSegment) {
      const is16 = src.size === 'WORD';
      const opcode = is16 ? (baseOpcode + 1) : baseOpcode;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    // reg, imm
    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'IMMEDIATE') {
      const val = this.resolveImm(src, ctx, lineNum);
      // Fast AL / AX form
      if (dest.name === 'AL') {
        return { bytes: [baseOpcode + 4, val & 0xFF], length: 2 };
      }
      if (dest.name === 'AX') {
        return { bytes: [baseOpcode + 5, val & 0xFF, (val >> 8) & 0xFF], length: 3 };
      }

      const is16 = dest.size === 'WORD';
      if (!is16) {
        // 80 /ext modrm imm8
        const modrm = 0xC0 | (ext << 3) | dest.regIndex;
        return { bytes: [0x80, modrm, val & 0xFF], length: 3 };
      } else {
        // 81 /ext modrm imm16
        const modrm = 0xC0 | (ext << 3) | dest.regIndex;
        return { bytes: [0x81, modrm, val & 0xFF, (val >> 8) & 0xFF], length: 4 };
      }
    }

    // mem, imm
    if (dest.kind === 'MEMORY' && src.kind === 'IMMEDIATE') {
      if (!dest.size) {
        throw new Error(`Operand size belirtilmedi (BYTE PTR veya WORD PTR kullanın), satır: ${lineNum}`);
      }
      const is16 = dest.size === 'WORD';
      const val = this.resolveImm(src, ctx, lineNum);
      const opcode = is16 ? 0x81 : 0x80;
      const { modrmBytes, length } = this.buildModRM(ext, dest, ctx, lineNum);
      const immBytes = is16 ? [val & 0xFF, (val >> 8) & 0xFF] : [val & 0xFF];
      return {
        bytes: [opcode, ...modrmBytes, ...immBytes],
        length: 1 + length + immBytes.length
      };
    }

    throw new Error(`Desteklenmeyen operand kombinasyonu, satır: ${lineNum}`);
  }

  // --- INC / DEC ---
  private static encodeIncDec(
    ext: number,
    baseReg16Opcode: number,
    ops: Operand[],
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    if (ops.length !== 1) throw new Error(`INC/DEC 1 operand bekler, satır: ${lineNum}`);
    const op = ops[0];

    if (op.kind === 'REGISTER' && !op.isSegment) {
      if (op.size === 'WORD') {
        // 1-byte opcode: 40..47 (INC) or 48..4F (DEC)
        return { bytes: [baseReg16Opcode + op.regIndex], length: 1 };
      } else {
        // FE /ext
        const modrm = 0xC0 | (ext << 3) | op.regIndex;
        return { bytes: [0xFE, modrm], length: 2 };
      }
    }

    if (op.kind === 'MEMORY') {
      if (!op.size) {
        throw new Error(`Operand size belirtilmedi, satır: ${lineNum}`);
      }
      const is16 = op.size === 'WORD';
      const opcode = is16 ? 0xFF : 0xFE;
      const { modrmBytes, length } = this.buildModRM(ext, op, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Geçersiz INC/DEC operandı, satır: ${lineNum}`);
  }

  // --- Unary (NOT, NEG, MUL, IMUL, DIV, IDIV) ---
  private static encodeUnary(
    ext: number,
    ops: Operand[],
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    if (ops.length !== 1) throw new Error(`Komut 1 operand bekler, satır: ${lineNum}`);
    const op = ops[0];

    if (op.kind === 'REGISTER' && !op.isSegment) {
      const is16 = op.size === 'WORD';
      const opcode = is16 ? 0xF7 : 0xF6;
      const modrm = 0xC0 | (ext << 3) | op.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }

    if (op.kind === 'MEMORY') {
      if (!op.size) throw new Error(`Operand size belirtilmedi, satır: ${lineNum}`);
      const is16 = op.size === 'WORD';
      const opcode = is16 ? 0xF7 : 0xF6;
      const { modrmBytes, length } = this.buildModRM(ext, op, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Geçersiz operand, satır: ${lineNum}`);
  }

  // --- TEST ---
  private static encodeTEST(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`TEST 2 operand bekler, satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'REGISTER' && !src.isSegment) {
      if (dest.size !== src.size) throw new Error(`Operand boyutları uyuşmuyor, satır: ${lineNum}`);
      const opcode = dest.size === 'WORD' ? 0x85 : 0x84;
      const modrm = 0xC0 | (src.regIndex << 3) | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }

    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'MEMORY') {
      const is16 = dest.size === 'WORD';
      const opcode = is16 ? 0x85 : 0x84;
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    if (dest.kind === 'MEMORY' && src.kind === 'REGISTER' && !src.isSegment) {
      const is16 = src.size === 'WORD';
      const opcode = is16 ? 0x85 : 0x84;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'IMMEDIATE') {
      const val = this.resolveImm(src, ctx, lineNum);
      if (dest.name === 'AL') return { bytes: [0xA8, val & 0xFF], length: 2 };
      if (dest.name === 'AX') return { bytes: [0xA9, val & 0xFF, (val >> 8) & 0xFF], length: 3 };

      const is16 = dest.size === 'WORD';
      const opcode = is16 ? 0xF7 : 0xF6;
      const modrm = 0xC0 | (0 << 3) | dest.regIndex;
      const immBytes = is16 ? [val & 0xFF, (val >> 8) & 0xFF] : [val & 0xFF];
      return { bytes: [opcode, modrm, ...immBytes], length: 2 + immBytes.length };
    }

    if (dest.kind === 'MEMORY' && src.kind === 'IMMEDIATE') {
      if (!dest.size) throw new Error(`Operand size belirtilmedi (BYTE PTR veya WORD PTR kullanın), satır: ${lineNum}`);
      const is16 = dest.size === 'WORD';
      const val = this.resolveImm(src, ctx, lineNum);
      const opcode = is16 ? 0xF7 : 0xF6;
      const { modrmBytes, length } = this.buildModRM(0, dest, ctx, lineNum);
      const immBytes = is16 ? [val & 0xFF, (val >> 8) & 0xFF] : [val & 0xFF];
      return { bytes: [opcode, ...modrmBytes, ...immBytes], length: 1 + length + immBytes.length };
    }

    throw new Error(`Desteklenmeyen TEST operasyonu, satır: ${lineNum}`);
  }

  // --- XCHG ---
  private static encodeXCHG(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`XCHG 2 operand bekler, satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'REGISTER' && !src.isSegment) {
      if (dest.size === 'WORD' && dest.name === 'AX') {
        return { bytes: [0x90 + src.regIndex], length: 1 };
      }
      if (src.size === 'WORD' && src.name === 'AX') {
        return { bytes: [0x90 + dest.regIndex], length: 1 };
      }
      const opcode = dest.size === 'WORD' ? 0x87 : 0x86;
      const modrm = 0xC0 | (src.regIndex << 3) | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }

    if (dest.kind === 'REGISTER' && !dest.isSegment && src.kind === 'MEMORY') {
      const is16 = dest.size === 'WORD';
      const opcode = is16 ? 0x87 : 0x86;
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    if (dest.kind === 'MEMORY' && src.kind === 'REGISTER' && !src.isSegment) {
      const is16 = src.size === 'WORD';
      const opcode = is16 ? 0x87 : 0x86;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Desteklenmeyen XCHG operasyonu, satır: ${lineNum}`);
  }

  // --- Shifts & Rotates ---
  private static encodeShift(
    ext: number,
    ops: Operand[],
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`Shift komutu 2 operand bekler, satır: ${lineNum}`);
    const dest = ops[0];
    const countOp = ops[1];

    let isByCL = false;
    if (countOp.kind === 'REGISTER' && countOp.name === 'CL') {
      isByCL = true;
    } else if (countOp.kind === 'IMMEDIATE' && countOp.value === 1) {
      isByCL = false;
    } else {
      throw new Error(`Shift sayısı 1 veya CL olmalıdır, satır: ${lineNum}`);
    }

    if (dest.kind === 'REGISTER' && !dest.isSegment) {
      const is16 = dest.size === 'WORD';
      let opcode = is16 ? (isByCL ? 0xD3 : 0xD1) : (isByCL ? 0xD2 : 0xD0);
      const modrm = 0xC0 | (ext << 3) | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }

    if (dest.kind === 'MEMORY') {
      if (!dest.size) throw new Error(`Operand size belirtilmedi, satır: ${lineNum}`);
      const is16 = dest.size === 'WORD';
      let opcode = is16 ? (isByCL ? 0xD3 : 0xD1) : (isByCL ? 0xD2 : 0xD0);
      const { modrmBytes, length } = this.buildModRM(ext, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Geçersiz shift hedefi, satır: ${lineNum}`);
  }

  // --- PUSH / POP ---
  private static encodePush(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 1) throw new Error(`PUSH 1 operand bekler, satır: ${lineNum}`);
    const op = ops[0];

    if (op.kind === 'REGISTER') {
      if (op.isSegment) {
        // ES=06, CS=0E, SS=16, DS=1E
        const segCodes = [0x06, 0x0E, 0x16, 0x1E];
        return { bytes: [segCodes[op.regIndex]], length: 1 };
      }
      if (op.size !== 'WORD') {
        throw new Error(`8086 mimarisinde 8-bit yazmaçlar (${op.name}) yığına PUSH edilemez! Yalnızca 16-bit yazmaçlar ve segment yazmaçları kullanılabilir, satır: ${lineNum}`);
      }
      return { bytes: [0x50 + op.regIndex], length: 1 };
    }

    if (op.kind === 'MEMORY') {
      if (op.size === 'BYTE') {
        throw new Error(`8086 mimarisinde byte boyutu yığına PUSH edilemez! Yalnızca 16-bit WORD kullanılabilir, satır: ${lineNum}`);
      }
      // FF /6
      const { modrmBytes, length } = this.buildModRM(6, op, ctx, lineNum);
      return { bytes: [0xFF, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Geçersiz PUSH operandı, satır: ${lineNum}`);
  }

  private static encodePop(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 1) throw new Error(`POP 1 operand bekler, satır: ${lineNum}`);
    const op = ops[0];

    if (op.kind === 'REGISTER') {
      if (op.isSegment) {
        if (op.name === 'CS') throw new Error(`8086 mimarisinde POP CS geçersizdir! CS yığından doğrudan POP edilemez, satır: ${lineNum}`);
        // ES=07, SS=17, DS=1F
        const segCodes = [0x07, 0, 0x17, 0x1F];
        return { bytes: [segCodes[op.regIndex]], length: 1 };
      }
      if (op.size !== 'WORD') {
        throw new Error(`8086 mimarisinde 8-bit yazmaçlar (${op.name}) yığından POP edilemez! Yalnızca 16-bit yazmaçlar kullanılabilir, satır: ${lineNum}`);
      }
      return { bytes: [0x58 + op.regIndex], length: 1 };
    }

    if (op.kind === 'MEMORY') {
      if (op.size === 'BYTE') {
        throw new Error(`8086 mimarisinde byte boyutu yığından POP edilemez! Yalnızca 16-bit WORD kullanılabilir, satır: ${lineNum}`);
      }
      // 8F /0
      const { modrmBytes, length } = this.buildModRM(0, op, ctx, lineNum);
      return { bytes: [0x8F, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Geçersiz POP operandı, satır: ${lineNum}`);
  }

  // --- CALL / RET ---
  private static encodeCall(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 1) throw new Error(`CALL 1 operand bekler, satır: ${lineNum}`);
    const op = ops[0];

    if (op.kind === 'IMMEDIATE') {
      const target = this.resolveImm(op, ctx, lineNum);
      const rel16 = (target - (ctx.currentAddr + 3)) & 0xFFFF;
      return {
        bytes: [0xE8, rel16 & 0xFF, (rel16 >> 8) & 0xFF],
        length: 3
      };
    }

    // Indirect CALL r16 (FF /2)
    if (op.kind === 'REGISTER' && !op.isSegment && op.size === 'WORD') {
      const modrm = 0xC0 | (2 << 3) | op.regIndex;
      return { bytes: [0xFF, modrm], length: 2 };
    }

    // Indirect CALL m16 (FF /2)
    if (op.kind === 'MEMORY') {
      const { modrmBytes, length } = this.buildModRM(2, op, ctx, lineNum);
      return { bytes: [0xFF, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Geçersiz CALL hedefi, satır: ${lineNum}`);
  }

  private static encodeRet(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length === 0) {
      return { bytes: [0xC3], length: 1 };
    }
    if (ops.length === 1 && ops[0].kind === 'IMMEDIATE') {
      const imm = this.resolveImm(ops[0], ctx, lineNum);
      return { bytes: [0xC2, imm & 0xFF, (imm >> 8) & 0xFF], length: 3 };
    }
    throw new Error(`Geçersiz RET operandı, satır: ${lineNum}`);
  }

  // --- LDS / LES reg16, mem ---
  private static encodePointerLoad(
    opcode: number,
    ops: Operand[],
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`LDS/LES 2 operand bekler, satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    if (dest.kind !== 'REGISTER' || dest.size !== 'WORD' || dest.isSegment) {
      throw new Error(`LDS/LES hedefi 16-bit genel yazmaç olmalıdır, satır: ${lineNum}`);
    }
    if (src.kind !== 'MEMORY') {
      throw new Error(`LDS/LES kaynağı bellek göstericisi olmalıdır, satır: ${lineNum}`);
    }

    const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
    return { bytes: [opcode, ...modrmBytes], length: 1 + length };
  }

  // --- IN / OUT ---
  private static encodeIN(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`IN 2 operand bekler (örn: IN AL, 20h veya IN AX, DX), satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    if (dest.kind !== 'REGISTER' || (dest.name !== 'AL' && dest.name !== 'AX')) {
      throw new Error(`IN komutunda hedef sadece AL veya AX olabilir, satır: ${lineNum}`);
    }

    const is16 = dest.name === 'AX';

    if (src.kind === 'REGISTER' && src.name === 'DX') {
      return { bytes: [is16 ? 0xED : 0xEC], length: 1 };
    }

    if (src.kind === 'IMMEDIATE') {
      const port = this.resolveImm(src, ctx, lineNum);
      return { bytes: [is16 ? 0xE5 : 0xE4, port & 0xFF], length: 2 };
    }

    throw new Error(`Geçersiz IN port operandı, satır: ${lineNum}`);
  }

  private static encodeOUT(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 2) throw new Error(`OUT 2 operand bekler (örn: OUT 20h, AL veya OUT DX, AX), satır: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];

    if (src.kind !== 'REGISTER' || (src.name !== 'AL' && src.name !== 'AX')) {
      throw new Error(`OUT komutunda kaynak sadece AL veya AX olabilir, satır: ${lineNum}`);
    }

    const is16 = src.name === 'AX';

    if (dest.kind === 'REGISTER' && dest.name === 'DX') {
      return { bytes: [is16 ? 0xEF : 0xEE], length: 1 };
    }

    if (dest.kind === 'IMMEDIATE') {
      const port = this.resolveImm(dest, ctx, lineNum);
      return { bytes: [is16 ? 0xE7 : 0xE6, port & 0xFF], length: 2 };
    }

    throw new Error(`Geçersiz OUT port operandı, satır: ${lineNum}`);
  }

  // --- JMP ---
  private static encodeJMP(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 1) throw new Error(`JMP 1 operand bekler, satır: ${lineNum}`);
    const op = ops[0];

    if (op.kind === 'IMMEDIATE') {
      // Near jump E9 rel16 (3 bytes)
      const target = this.resolveImm(op, ctx, lineNum);
      const rel16 = (target - (ctx.currentAddr + 3)) & 0xFFFF;
      return {
        bytes: [0xE9, rel16 & 0xFF, (rel16 >> 8) & 0xFF],
        length: 3
      };
    }

    // Indirect JMP r16 (FF /4)
    if (op.kind === 'REGISTER' && !op.isSegment && op.size === 'WORD') {
      const modrm = 0xC0 | (4 << 3) | op.regIndex;
      return { bytes: [0xFF, modrm], length: 2 };
    }

    // Indirect JMP m16 (FF /4)
    if (op.kind === 'MEMORY') {
      const { modrmBytes, length } = this.buildModRM(4, op, ctx, lineNum);
      return { bytes: [0xFF, ...modrmBytes], length: 1 + length };
    }

    throw new Error(`Geçersiz JMP operandı, satır: ${lineNum}`);
  }

  // --- Jcc and LOOP (rel8) ---
  private static encodeJcc(
    opcode: number,
    ops: Operand[],
    ctx: EncodeContext,
    lineNum: number
  ): EncodedInstruction {
    if (ops.length !== 1) throw new Error(`Jump komutu 1 operand bekler, satır: ${lineNum}`);
    const op = ops[0];

    if (op.kind === 'IMMEDIATE') {
      const target = this.resolveImm(op, ctx, lineNum);
      const rel = target - (ctx.currentAddr + 2);

      if (ctx.isPass2 && (rel < -128 || rel > 127)) {
        throw new Error(`Jump out of range (rel=${rel}, -128..127 sınırını aşıyor) satır: ${lineNum}`);
      }

      return {
        bytes: [opcode, rel & 0xFF],
        length: 2
      };
    }

    throw new Error(`Geçersiz jump hedefi, satır: ${lineNum}`);
  }

  // --- INT ---
  private static encodeINT(ops: Operand[], ctx: EncodeContext, lineNum: number): EncodedInstruction {
    if (ops.length !== 1 || ops[0].kind !== 'IMMEDIATE') {
      throw new Error(`INT kesme numarası bekler, satır: ${lineNum}`);
    }
    const num = this.resolveImm(ops[0], ctx, lineNum);
    if (num === 3) {
      return { bytes: [0xCC], length: 1 };
    }
    return { bytes: [0xCD, num & 0xFF], length: 2 };
  }

  // Helper to build ModRM byte and displacement bytes
  private static buildModRM(
    regField: number,
    mem: MemoryOperand,
    ctx: EncodeContext,
    lineNum: number
  ): { modrmBytes: number[]; length: number } {
    let disp = mem.disp;
    if (mem.label) {
      const lblUpper = mem.label.toUpperCase();
      if (ctx.symbols.has(lblUpper)) {
        disp += ctx.symbols.get(lblUpper)!;
      } else if (ctx.isPass2) {
        throw new Error(`Tanımsız etiket '${mem.label}' satır: ${lineNum}`);
      }
    }

    // Recompute modrm with final disp
    const modrmInfo = OperandParser.computeModRM(
      mem.baseReg,
      mem.indexReg,
      disp,
      mem.label !== undefined
    );

    const modrmByte = (modrmInfo.mod << 6) | ((regField & 7) << 3) | (modrmInfo.rm & 7);
    const bytes = [modrmByte];

    if (modrmInfo.dispBytes === 1) {
      bytes.push(disp & 0xFF);
    } else if (modrmInfo.dispBytes === 2) {
      bytes.push(disp & 0xFF, (disp >> 8) & 0xFF);
    }

    return {
      modrmBytes: bytes,
      length: bytes.length
    };
  }
}
