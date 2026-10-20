import { Token, Lexer } from './lexer.js';
import { Operand, OperandParser } from './operands.js';

export type DirectiveType = 'ORG' | 'DB' | 'DW';

export interface DupItem {
  count: number;
  values: (number | string)[];
}

export type DataItem = number | string | DupItem;

export interface ParsedInstruction {
  mnemonic: string;
  operands: Operand[];
}

export interface ParsedDirective {
  type: DirectiveType;
  items: DataItem[];
  orgValue?: number;
}

export interface ParsedLine {
  lineNumber: number;
  label?: string;
  directive?: ParsedDirective;
  instruction?: ParsedInstruction;
}

export class Parser {
  static parseLine(lineText: string, lineNumber: number): ParsedLine {
    const tokens = Lexer.tokenizeLine(lineText, lineNumber);
    if (tokens.length === 0) {
      return { lineNumber };
    }

    let tokenIdx = 0;
    let label: string | undefined;

    // Check for label at start of line
    // Pattern 1: IDENTIFIER :
    if (tokens.length >= 2 && tokens[0].type === 'IDENTIFIER' && tokens[1].type === 'COLON') {
      label = tokens[0].text;
      tokenIdx = 2;
    }
    // Pattern 2: IDENTIFIER followed by directive (e.g. DIZI DB ...)
    else if (
      tokens.length >= 2 &&
      tokens[0].type === 'IDENTIFIER' &&
      ['DB', 'DW', 'EQU'].includes(tokens[1].text.toUpperCase())
    ) {
      label = tokens[0].text;
      tokenIdx = 1;
    }

    if (tokenIdx >= tokens.length) {
      return { lineNumber, label };
    }

    const keyword = tokens[tokenIdx].text.toUpperCase();
    tokenIdx++;

    // Check for ORG directive
    if (keyword === 'ORG') {
      if (tokenIdx >= tokens.length) {
        throw new Error(`ORG directive missing address at line ${lineNumber}`);
      }
      const numTok = tokens[tokenIdx];
      if (numTok.type !== 'NUMBER' || numTok.value === undefined) {
        throw new Error(`Invalid address for ORG at line ${lineNumber}`);
      }
      return {
        lineNumber,
        label,
        directive: {
          type: 'ORG',
          items: [],
          orgValue: numTok.value
        }
      };
    }

    // Check for DB or DW directives
    if (keyword === 'DB' || keyword === 'DW') {
      const items = this.parseDataItems(tokens.slice(tokenIdx), lineNumber);
      return {
        lineNumber,
        label,
        directive: {
          type: keyword as DirectiveType,
          items
        }
      };
    }

    // Otherwise, treat as Instruction
    const mnemonic = keyword;
    const operandTokensList: Token[][] = [];
    let currentOpTokens: Token[] = [];

    for (let i = tokenIdx; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === 'COMMA') {
        if (currentOpTokens.length > 0) {
          operandTokensList.push(currentOpTokens);
          currentOpTokens = [];
        } else {
          throw new Error(`Unexpected comma at line ${lineNumber}`);
        }
      } else {
        currentOpTokens.push(tok);
      }
    }
    if (currentOpTokens.length > 0) {
      operandTokensList.push(currentOpTokens);
    }

    const operands: Operand[] = [];
    for (const opTokens of operandTokensList) {
      operands.push(OperandParser.parse(opTokens));
    }

    return {
      lineNumber,
      label,
      instruction: {
        mnemonic,
        operands
      }
    };
  }

  // Parses comma-separated data items for DB / DW, including DUP(...)
  private static parseDataItems(tokens: Token[], lineNumber: number): DataItem[] {
    const items: DataItem[] = [];
    let i = 0;

    while (i < tokens.length) {
      const tok = tokens[i];

      // String literal: DB 'Hello$'
      if (tok.type === 'STRING') {
        items.push(tok.text);
        i++;
      }
      // Number literal
      else if (tok.type === 'NUMBER' && tok.value !== undefined) {
        // Check if followed by DUP(...)
        if (i + 1 < tokens.length && tokens[i + 1].text.toUpperCase() === 'DUP') {
          const count = tok.value;
          i += 2; // skip number and DUP
          if (i >= tokens.length || tokens[i].type !== 'LPAREN') {
            throw new Error(`Expected '(' after DUP at line ${lineNumber}`);
          }
          i++; // skip '('

          // Read inside parentheses until ')'
          const dupValues: (number | string)[] = [];
          while (i < tokens.length && tokens[i].type !== 'RPAREN') {
            const innerTok = tokens[i];
            if (innerTok.type === 'NUMBER' && innerTok.value !== undefined) {
              dupValues.push(innerTok.value);
            } else if (innerTok.type === 'STRING') {
              dupValues.push(innerTok.text);
            } else if (innerTok.text === '?') {
              dupValues.push(0);
            } else if (innerTok.type !== 'COMMA') {
              throw new Error(`Invalid token in DUP: ${innerTok.text} at line ${lineNumber}`);
            }
            i++;
          }
          if (i >= tokens.length || tokens[i].type !== 'RPAREN') {
            throw new Error(`Missing ')' in DUP at line ${lineNumber}`);
          }
          i++; // skip ')'
          items.push({ count, values: dupValues });
        } else {
          items.push(tok.value);
          i++;
        }
      } else if (tok.text === '?') {
        items.push(0);
        i++;
      } else {
        throw new Error(`Unexpected token in data directive: ${tok.text} at line ${lineNumber}`);
      }

      // Check for comma separating items
      if (i < tokens.length) {
        if (tokens[i].type === 'COMMA') {
          i++;
        } else {
          throw new Error(`Expected ',' between data items at line ${lineNumber}`);
        }
      }
    }

    return items;
  }
}
