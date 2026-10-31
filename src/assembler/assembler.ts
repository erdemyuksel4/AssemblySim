import { Parser, ParsedLine, ParsedDirective } from './parser.js';
import { Encoder, EncodeContext } from './encoder.js';

export interface ListingItem {
  line: number;
  addr: number;
  bytes: number[];
}

export interface AsmError {
  line: number;
  message: string;
}

export interface AsmResult {
  origin: number; // 0x100
  bytes: Uint8Array;
  symbols: Map<string, number>;
  listing: ListingItem[];
  errors: AsmError[];
}

export class Assembler {
  static assemble(source: string): AsmResult {
    const lines = source.split(/\r?\n/);
    const symbols = new Map<string, number>();
    // Pre-populate standard 8086 built-in segment symbols (MASM/TASM compatibility)
    symbols.set('@DATA', 0x0000);
    symbols.set('@CODE', 0x0000);
    symbols.set('@STACK', 0x0000);
    const errors: AsmError[] = [];
    const listing: ListingItem[] = [];

    let origin = 0x0000;
    const parsedLines: (ParsedLine | null)[] = [];

    // --- PASS 1: Parse, collect labels, calculate addresses ---
    let currentAddr = origin;

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const rawLine = lines[i];

      try {
        const parsed = Parser.parseLine(rawLine, lineNum);
        parsedLines.push(parsed);

        // Handle ORG directive
        if (parsed.directive && parsed.directive.type === 'ORG') {
          if (parsed.directive.orgValue !== undefined) {
            origin = parsed.directive.orgValue;
            currentAddr = origin;
          }
        }

        // Register label or EQU value
        if (parsed.label) {
          const lblName = parsed.label.toUpperCase();
          if (parsed.directive && parsed.directive.type === 'EQU') {
            symbols.set(lblName, parsed.directive.equValue ?? 0);
          } else {
            if (symbols.has(lblName)) {
              errors.push({ line: lineNum, message: `Mükerrer etiket: '${parsed.label}'` });
            } else {
              symbols.set(lblName, currentAddr);
            }
          }
        }

        // Calculate size of directive or instruction
        if (parsed.directive) {
          const size = this.getDirectiveSize(parsed.directive, currentAddr, origin, symbols);
          currentAddr += size;
        } else if (parsed.instruction) {
          const ctx: EncodeContext = {
            currentAddr,
            symbols,
            isPass2: false
          };
          const enc = Encoder.encode(parsed.instruction, ctx, lineNum);
          currentAddr += enc.length;
        }
      } catch (err: any) {
        errors.push({ line: lineNum, message: err.message || String(err) });
        parsedLines.push(null);
      }
    }

    if (errors.length > 0) {
      return {
        origin,
        bytes: new Uint8Array(0),
        symbols,
        listing: [],
        errors
      };
    }

    // --- PASS 2: Generate machine code bytes & listing ---
    currentAddr = origin;
    const emittedBytes: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const parsed = parsedLines[i];
      if (!parsed) continue;

      const lineStartAddr = currentAddr;
      const lineBytes: number[] = [];

      try {
        if (parsed.directive) {
          if (parsed.directive.type === 'ORG') {
            if (parsed.directive.orgValue !== undefined) {
              currentAddr = parsed.directive.orgValue;
            }
          } else if (
            parsed.directive.type === 'EQU' ||
            parsed.directive.type === 'PROC' ||
            parsed.directive.type === 'ENDP' ||
            parsed.directive.type === 'MODEL' ||
            parsed.directive.type === 'STACK' ||
            parsed.directive.type === 'DATA' ||
            parsed.directive.type === 'CODE' ||
            parsed.directive.type === 'ASSUME' ||
            parsed.directive.type === 'END'
          ) {
            // Emits no machine code bytes
          } else {
            const dataBytes = this.generateDirectiveBytes(parsed.directive, symbols, lineNum, currentAddr, origin);
            lineBytes.push(...dataBytes);
            emittedBytes.push(...dataBytes);
            currentAddr += dataBytes.length;
          }
        } else if (parsed.instruction) {
          const ctx: EncodeContext = {
            currentAddr,
            symbols,
            isPass2: true
          };
          const enc = Encoder.encode(parsed.instruction, ctx, lineNum);
          lineBytes.push(...enc.bytes);
          emittedBytes.push(...enc.bytes);
          currentAddr += enc.length;
        }

        if (lineBytes.length > 0) {
          listing.push({
            line: lineNum,
            addr: lineStartAddr,
            bytes: lineBytes
          });
        }
      } catch (err: any) {
        errors.push({ line: lineNum, message: err.message || String(err) });
      }
    }

    return {
      origin,
      bytes: new Uint8Array(emittedBytes),
      symbols,
      listing,
      errors
    };
  }

  // Evaluates TIMES expression (e.g. 510 - ($ - $$), 64, etc.)
  private static evaluateTimesCount(
    directive: ParsedDirective,
    currentAddr: number,
    origin: number,
    symbols: Map<string, number>
  ): number {
    const tokens = directive.timesTokens || [];
    if (tokens.length === 0) return 0;

    let pos = 0;

    const parsePrimary = (): number => {
      if (pos >= tokens.length) return 0;
      const tok = tokens[pos];

      if (tok.type === 'LPAREN') {
        pos++; // skip '('
        const val = parseAddSub();
        if (pos < tokens.length && tokens[pos].type === 'RPAREN') {
          pos++; // skip ')'
        }
        return val;
      }

      if (tok.type === 'NUMBER' && tok.value !== undefined) {
        pos++;
        return tok.value;
      }

      if (tok.type === 'IDENTIFIER') {
        const text = tok.text.toUpperCase();
        pos++;
        if (text === '$') return currentAddr;
        if (text === '$$') return origin;
        if (symbols.has(text)) return symbols.get(text)!;
        return 0;
      }

      pos++;
      return 0;
    };

    const parseMul = (): number => {
      let val = parsePrimary();
      while (pos < tokens.length && tokens[pos].type === 'MULTIPLY') {
        pos++;
        val = val * parsePrimary();
      }
      return val;
    };

    const parseAddSub = (): number => {
      let val = parseMul();
      while (pos < tokens.length && (tokens[pos].type === 'PLUS' || tokens[pos].type === 'MINUS')) {
        const op = tokens[pos].type;
        pos++;
        const nextVal = parseMul();
        if (op === 'PLUS') val += nextVal;
        else val -= nextVal;
      }
      return val;
    };

    const result = parseAddSub();
    return Math.max(0, result);
  }

  // Calculate size in bytes for DB, DW, and TIMES directives
  private static getDirectiveSize(
    directive: ParsedDirective,
    currentAddr: number = 0,
    origin: number = 0,
    symbols: Map<string, number> = new Map()
  ): number {
    if (
      directive.type === 'ORG' ||
      directive.type === 'EQU' ||
      directive.type === 'PROC' ||
      directive.type === 'ENDP' ||
      directive.type === 'MODEL' ||
      directive.type === 'STACK' ||
      directive.type === 'DATA' ||
      directive.type === 'CODE' ||
      directive.type === 'ASSUME' ||
      directive.type === 'END'
    ) return 0;

    if (directive.type === 'TIMES') {
      const count = this.evaluateTimesCount(directive, currentAddr, origin, symbols);
      const mult = directive.innerType === 'DW' ? 2 : 1;
      let singleLen = 0;
      for (const item of directive.items) {
        if (typeof item === 'number') {
          singleLen += mult;
        } else if (typeof item === 'string') {
          singleLen += item.length * mult;
        } else if (typeof item === 'object') {
          if ('count' in item && item.count !== undefined) {
            singleLen += item.count * mult;
          } else if ('label' in item) {
            singleLen += mult;
          }
        }
      }
      return count * (singleLen || mult);
    }

    const mult = directive.type === 'DW' ? 2 : 1;
    let size = 0;

    for (const item of directive.items) {
      if (typeof item === 'number') {
        size += mult;
      } else if (typeof item === 'string') {
        // String in DB emits each character as 1 byte
        size += item.length * mult;
      } else if (typeof item === 'object') {
        if ('count' in item && item.count !== undefined) {
          let singleLen = 0;
          for (const v of item.values) {
            singleLen += typeof v === 'string' ? v.length * mult : mult;
          }
          size += item.count * singleLen;
        } else if ('label' in item) {
          size += mult;
        }
      }
    }
    return size;
  }

  // Generate actual bytes for DB, DW, and TIMES directives
  private static generateDirectiveBytes(
    directive: ParsedDirective,
    symbols: Map<string, number>,
    lineNum: number,
    currentAddr: number = 0,
    origin: number = 0
  ): number[] {
    const bytes: number[] = [];

    if (directive.type === 'TIMES') {
      const count = this.evaluateTimesCount(directive, currentAddr, origin, symbols);
      const isDW = directive.innerType === 'DW';

      const emitVal = (val: number) => {
        if (isDW) {
          bytes.push(val & 0xFF, (val >> 8) & 0xFF);
        } else {
          bytes.push(val & 0xFF);
        }
      };

      const emitStr = (str: string) => {
        for (let i = 0; i < str.length; i++) {
          emitVal(str.charCodeAt(i));
        }
      };

      for (let c = 0; c < count; c++) {
        for (const item of directive.items) {
          if (typeof item === 'number') {
            emitVal(item);
          } else if (typeof item === 'string') {
            emitStr(item);
          } else if (typeof item === 'object') {
            if ('count' in item && item.count !== undefined) {
              for (let ic = 0; ic < item.count; ic++) {
                for (const v of item.values) {
                  if (typeof v === 'string') emitStr(v);
                  else emitVal(v);
                }
              }
            } else if ('label' in item) {
              const lblUpper = item.label.toUpperCase();
              if (symbols.has(lblUpper)) {
                emitVal(symbols.get(lblUpper)!);
              } else {
                throw new Error(`Tanımsız etiket '${item.label}' satır: ${lineNum}`);
              }
            }
          }
        }
      }
      return bytes;
    }

    const isDW = directive.type === 'DW';

    const emitVal = (val: number) => {
      if (isDW) {
        bytes.push(val & 0xFF, (val >> 8) & 0xFF);
      } else {
        bytes.push(val & 0xFF);
      }
    };

    const emitStr = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        emitVal(str.charCodeAt(i));
      }
    };

    for (const item of directive.items) {
      if (typeof item === 'number') {
        emitVal(item);
      } else if (typeof item === 'string') {
        emitStr(item);
      } else if (typeof item === 'object') {
        if ('count' in item && item.count !== undefined) {
          for (let c = 0; c < item.count; c++) {
            for (const v of item.values) {
              if (typeof v === 'string') emitStr(v);
              else emitVal(v);
            }
          }
        } else if ('label' in item) {
          const lblUpper = item.label.toUpperCase();
          if (symbols.has(lblUpper)) {
            emitVal(symbols.get(lblUpper)!);
          } else {
            throw new Error(`Tanımsız etiket '${item.label}' satır: ${lineNum}`);
          }
        }
      }
    }

    return bytes;
  }
}
