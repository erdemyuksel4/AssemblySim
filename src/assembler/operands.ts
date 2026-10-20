import { Token } from './lexer.js';

export type OperandSize = 'BYTE' | 'WORD';

export interface RegisterOperand {
  kind: 'REGISTER';
  name: string;
  size: OperandSize;
  regIndex: number;
  isSegment: boolean;
}

export interface ImmediateOperand {
  kind: 'IMMEDIATE';
  value?: number;
  label?: string;
  disp: number; // e.g. LABEL + 2
  isOffset: boolean;
  size?: OperandSize;
}

export interface MemoryOperand {
  kind: 'MEMORY';
  size?: OperandSize;
  baseReg?: 'BX' | 'BP';
  indexReg?: 'SI' | 'DI';
  disp: number;
  label?: string; // e.g. [DIZI] or [DIZI+2]
  segmentOverride?: 'CS' | 'DS' | 'ES' | 'SS';
  modrm?: {
    mod: number;
    rm: number;
    dispBytes: number; // 0, 1, or 2
  };
}

export type Operand = RegisterOperand | ImmediateOperand | MemoryOperand;

const REG8_NAMES: Record<string, number> = {
  AL: 0, CL: 1, DL: 2, BL: 3, AH: 4, CH: 5, DH: 6, BH: 7
};

const REG16_NAMES: Record<string, number> = {
  AX: 0, CX: 1, DX: 2, BX: 3, SP: 4, BP: 5, SI: 6, DI: 7
};

const SEG_NAMES: Record<string, number> = {
  ES: 0, CS: 1, SS: 2, DS: 3
};

export class OperandParser {
  static parse(tokens: Token[]): Operand {
    if (tokens.length === 0) {
      throw new Error('Empty operand');
    }

    let tokenIdx = 0;
    let sizeOverride: OperandSize | undefined;
    let segOverride: 'CS' | 'DS' | 'ES' | 'SS' | undefined;

    // Check for size directive: BYTE PTR or WORD PTR
    const firstWord = tokens[0].text.toUpperCase();
    if (firstWord === 'BYTE' || firstWord === 'WORD') {
      if (tokens.length > 1 && tokens[1].text.toUpperCase() === 'PTR') {
        sizeOverride = firstWord as OperandSize;
        tokenIdx = 2;
      }
    }

    // Check for segment override: CS:, DS:, ES:, SS:
    if (tokenIdx < tokens.length - 1 && tokens[tokenIdx + 1].type === 'COLON') {
      const segName = tokens[tokenIdx].text.toUpperCase();
      if (segName in SEG_NAMES) {
        segOverride = segName as any;
        tokenIdx += 2;
      }
    }

    const remaining = tokens.slice(tokenIdx);
    if (remaining.length === 0) {
      throw new Error('Missing operand after size/segment specifier');
    }

    // Single register check (when not bracketed)
    if (remaining.length === 1 && remaining[0].type === 'IDENTIFIER') {
      const name = remaining[0].text.toUpperCase();
      if (name in REG8_NAMES) {
        return {
          kind: 'REGISTER',
          name,
          size: 'BYTE',
          regIndex: REG8_NAMES[name],
          isSegment: false
        };
      }
      if (name in REG16_NAMES) {
        return {
          kind: 'REGISTER',
          name,
          size: 'WORD',
          regIndex: REG16_NAMES[name],
          isSegment: false
        };
      }
      if (name in SEG_NAMES) {
        return {
          kind: 'REGISTER',
          name,
          size: 'WORD',
          regIndex: SEG_NAMES[name],
          isSegment: true
        };
      }
    }

    // Memory operand: enclosed in [...] or starts with [
    if (remaining[0].type === 'LBRACKET') {
      return this.parseMemory(remaining, sizeOverride, segOverride);
    }

    // Check for OFFSET keyword
    if (remaining[0].text.toUpperCase() === 'OFFSET') {
      if (remaining.length < 2) {
        throw new Error('OFFSET expects a label or expression');
      }
      const expr = this.parseImmediateExpression(remaining.slice(1));
      expr.isOffset = true;
      expr.size = sizeOverride || 'WORD';
      return expr;
    }

    // Immediate expression or label
    const imm = this.parseImmediateExpression(remaining);
    if (sizeOverride) imm.size = sizeOverride;
    return imm;
  }

  // Parses expressions inside [...] or memory operands
  private static parseMemory(
    tokens: Token[],
    size?: OperandSize,
    segOverride?: 'CS' | 'DS' | 'ES' | 'SS'
  ): MemoryOperand {
    if (tokens[0].type !== 'LBRACKET' || tokens[tokens.length - 1].type !== 'RBRACKET') {
      throw new Error('Memory operand must be enclosed in brackets [...]');
    }

    const inner = tokens.slice(1, -1);
    if (inner.length === 0) {
      throw new Error('Empty memory brackets []');
    }

    let baseReg: 'BX' | 'BP' | undefined;
    let indexReg: 'SI' | 'DI' | undefined;
    let disp = 0;
    let label: string | undefined;

    let sign = 1;
    let i = 0;

    while (i < inner.length) {
      const tok = inner[i];
      if (tok.type === 'PLUS') {
        sign = 1;
        i++;
        continue;
      }
      if (tok.type === 'MINUS') {
        sign = -1;
        i++;
        continue;
      }

      if (tok.type === 'IDENTIFIER') {
        const u = tok.text.toUpperCase();
        if (u === 'BX' || u === 'BP') {
          if (baseReg) throw new Error(`Multiple base registers in memory operand: ${baseReg} and ${u}`);
          baseReg = u as 'BX' | 'BP';
        } else if (u === 'SI' || u === 'DI') {
          if (indexReg) throw new Error(`Multiple index registers in memory operand: ${indexReg} and ${u}`);
          indexReg = u as 'SI' | 'DI';
        } else if (['AX', 'CX', 'DX', 'SP', 'IP', 'AL', 'AH', 'BL', 'BH', 'CL', 'CH', 'DL', 'DH', 'CS', 'DS', 'ES', 'SS'].includes(u)) {
          throw new Error(`8086 mimarisinde [${u}] ile bellek adresleme yapılamaz! Yalnızca [BX], [BP], [SI], [DI] ve bunların kombinasyonları geçerlidir.`);
        } else {
          // Label inside memory brackets, e.g. [DIZI] or [DIZI+2]
          if (label) throw new Error(`Multiple labels in memory operand: ${label} and ${u}`);
          label = tok.text;
        }
      } else if (tok.type === 'NUMBER') {
        disp += sign * (tok.value ?? 0);
      }
      i++;
    }

    // Compute ModRM mod and rm
    const modrm = this.computeModRM(baseReg, indexReg, disp, label !== undefined);

    return {
      kind: 'MEMORY',
      size,
      baseReg,
      indexReg,
      disp,
      label,
      segmentOverride: segOverride,
      modrm
    };
  }

  // Computes 8086 ModRM parameters
  static computeModRM(
    baseReg?: 'BX' | 'BP',
    indexReg?: 'SI' | 'DI',
    disp: number = 0,
    hasLabel: boolean = false
  ): { mod: number; rm: number; dispBytes: number } {
    // Direct addressing [disp16] / [label] (neither base nor index)
    if (!baseReg && !indexReg) {
      return { mod: 0, rm: 6, dispBytes: 2 };
    }

    let rm = 0;
    if (baseReg === 'BX' && indexReg === 'SI') rm = 0;
    else if (baseReg === 'BX' && indexReg === 'DI') rm = 1;
    else if (baseReg === 'BP' && indexReg === 'SI') rm = 2;
    else if (baseReg === 'BP' && indexReg === 'DI') rm = 3;
    else if (!baseReg && indexReg === 'SI') rm = 4;
    else if (!baseReg && indexReg === 'DI') rm = 5;
    else if (baseReg === 'BP' && !indexReg) {
      // Special 8086 rule: [BP] alone cannot be encoded with mod=00!
      // Must use mod=01 with disp8=0!
      if (disp === 0 && !hasLabel) {
        return { mod: 1, rm: 6, dispBytes: 1 };
      }
      rm = 6;
    } else if (baseReg === 'BX' && !indexReg) {
      rm = 7;
    } else {
      throw new Error(`Invalid addressing mode combination: base=${baseReg}, index=${indexReg}`);
    }

    if (hasLabel) {
      // Labels resolved in Pass 2 might require 16-bit displacement
      return { mod: 2, rm, dispBytes: 2 };
    }

    if (disp === 0 && !(baseReg === 'BP' && !indexReg)) {
      return { mod: 0, rm, dispBytes: 0 };
    }

    // Check if disp fits in signed 8 bits (-128 .. 127)
    if (disp >= -128 && disp <= 127) {
      return { mod: 1, rm, dispBytes: 1 };
    }

    return { mod: 2, rm, dispBytes: 2 };
  }

  // Parses immediate expressions: e.g. 100H, 'A', DIZI, DIZI + 4
  private static parseImmediateExpression(tokens: Token[]): ImmediateOperand {
    let value: number | undefined;
    let label: string | undefined;
    let disp = 0;

    let sign = 1;
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === 'PLUS') {
        sign = 1;
        continue;
      }
      if (tok.type === 'MINUS') {
        sign = -1;
        continue;
      }

      if (tok.type === 'NUMBER') {
        disp += sign * (tok.value ?? 0);
      } else if (tok.type === 'IDENTIFIER') {
        if (label) throw new Error(`Multiple labels in expression: ${label} and ${tok.text}`);
        label = tok.text;
      }
    }

    if (label === undefined) {
      value = disp;
      disp = 0;
    }

    return {
      kind: 'IMMEDIATE',
      value,
      label,
      disp,
      isOffset: false
    };
  }
}
