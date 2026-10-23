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
          const size = this.getDirectiveSize(parsed.directive);
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
          } else if (parsed.directive.type === 'EQU' || parsed.directive.type === 'PROC' || parsed.directive.type === 'ENDP') {
            // EQU emits no machine code bytes
          } else {
            const dataBytes = this.generateDirectiveBytes(parsed.directive, symbols, lineNum);
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

  // Calculate size in bytes for DB and DW directives
  private static getDirectiveSize(directive: ParsedDirective): number {
    if (directive.type === 'ORG' || directive.type === 'EQU' || directive.type === 'PROC' || directive.type === 'ENDP') return 0;
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

  // Generate actual bytes for DB and DW directives
  private static generateDirectiveBytes(
    directive: ParsedDirective,
    symbols: Map<string, number>,
    lineNum: number
  ): number[] {
    const bytes: number[] = [];
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
