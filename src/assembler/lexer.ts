export type TokenType =
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'COMMA'
  | 'COLON'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'PLUS'
  | 'MINUS'
  | 'MULTIPLY'
  | 'LPAREN'
  | 'RPAREN';

export interface Token {
  type: TokenType;
  text: string;
  value?: number;
  line: number;
  col: number;
}

export function parseNumber(text: string): number | null {
  const t = text.trim().toUpperCase();

  // Character literal: 'A' or "A"
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    if (t.length === 3) return t.charCodeAt(1);
  }

  // Binary: e.g. 101B, 11010110B
  if (/^[01]+B$/.test(t)) {
    return parseInt(t.slice(0, -1), 2);
  }

  // Hexadecimal: e.g. 100H, 0FFH, 0F0FH, 0x100
  if (/^[0-9][0-9A-F]*H$/.test(t)) {
    return parseInt(t.slice(0, -1), 16);
  }
  if (/^0X[0-9A-F]+$/.test(t)) {
    return parseInt(t.slice(2), 16);
  }

  // Decimal: e.g. 123, -5, +10
  if (/^[+-]?[0-9]+$/.test(t)) {
    return parseInt(t, 10);
  }

  return null;
}

export class Lexer {
  static tokenizeLine(lineText: string, lineNum: number): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = lineText.length;

    while (i < len) {
      const ch = lineText[i];

      // Whitespace
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        i++;
        continue;
      }

      // Comment
      if (ch === ';') {
        break; // Ignore rest of line
      }

      // Single-character tokens
      if (ch === ',') { tokens.push({ type: 'COMMA', text: ',', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === ':') { tokens.push({ type: 'COLON', text: ':', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === '[') { tokens.push({ type: 'LBRACKET', text: '[', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === ']') { tokens.push({ type: 'RBRACKET', text: ']', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === '+') { tokens.push({ type: 'PLUS', text: '+', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === '-') { tokens.push({ type: 'MINUS', text: '-', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === '*') { tokens.push({ type: 'MULTIPLY', text: '*', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === '(') { tokens.push({ type: 'LPAREN', text: '(', line: lineNum, col: i + 1 }); i++; continue; }
      if (ch === ')') { tokens.push({ type: 'RPAREN', text: ')', line: lineNum, col: i + 1 }); i++; continue; }

      // String literal: '...' or "..."
      if (ch === "'" || ch === '"') {
        const quote = ch;
        const startCol = i + 1;
        let str = '';
        i++; // skip open quote
        while (i < len && lineText[i] !== quote) {
          str += lineText[i];
          i++;
        }
        if (i < len && lineText[i] === quote) {
          i++; // skip close quote
        }
        // If length is 1, it can also be treated as a number
        if (str.length === 1) {
          tokens.push({ type: 'NUMBER', text: `'${str}'`, value: str.charCodeAt(0), line: lineNum, col: startCol });
        } else {
          tokens.push({ type: 'STRING', text: str, line: lineNum, col: startCol });
        }
        continue;
      }

      // Identifier or number
      const startCol = i + 1;
      let word = '';
      while (i < len && /[a-zA-Z0-9_$.?]/.test(lineText[i])) {
        word += lineText[i];
        i++;
      }

      const numVal = parseNumber(word);
      if (numVal !== null) {
        tokens.push({ type: 'NUMBER', text: word, value: numVal, line: lineNum, col: startCol });
      } else {
        tokens.push({ type: 'IDENTIFIER', text: word, line: lineNum, col: startCol });
      }
    }

    return tokens;
  }
}
