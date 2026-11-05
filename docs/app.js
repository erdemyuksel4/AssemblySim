// src/assembler/lexer.ts
function parseNumber(text) {
  const t = text.trim().toUpperCase();
  if (t.startsWith("'") && t.endsWith("'") || t.startsWith('"') && t.endsWith('"')) {
    if (t.length === 3) return t.charCodeAt(1);
  }
  if (/^[01]+B$/.test(t)) {
    return parseInt(t.slice(0, -1), 2);
  }
  if (/^[0-9][0-9A-F]*H$/.test(t)) {
    return parseInt(t.slice(0, -1), 16);
  }
  if (/^0X[0-9A-F]+$/.test(t)) {
    return parseInt(t.slice(2), 16);
  }
  if (/^[+-]?[0-9]+$/.test(t)) {
    return parseInt(t, 10);
  }
  return null;
}
var Lexer = class {
  static tokenizeLine(lineText, lineNum) {
    const tokens = [];
    let i = 0;
    const len = lineText.length;
    while (i < len) {
      const ch = lineText[i];
      if (ch === " " || ch === "	" || ch === "\r") {
        i++;
        continue;
      }
      if (ch === ";") {
        break;
      }
      if (ch === ",") {
        tokens.push({ type: "COMMA", text: ",", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === ":") {
        tokens.push({ type: "COLON", text: ":", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === "[") {
        tokens.push({ type: "LBRACKET", text: "[", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === "]") {
        tokens.push({ type: "RBRACKET", text: "]", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === "+") {
        tokens.push({ type: "PLUS", text: "+", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === "-") {
        tokens.push({ type: "MINUS", text: "-", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === "*") {
        tokens.push({ type: "MULTIPLY", text: "*", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === "(") {
        tokens.push({ type: "LPAREN", text: "(", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === ")") {
        tokens.push({ type: "RPAREN", text: ")", line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === "'" || ch === '"') {
        const quote = ch;
        const startCol2 = i + 1;
        let str = "";
        i++;
        while (i < len && lineText[i] !== quote) {
          str += lineText[i];
          i++;
        }
        if (i < len && lineText[i] === quote) {
          i++;
        }
        if (str.length === 1) {
          tokens.push({ type: "NUMBER", text: `'${str}'`, value: str.charCodeAt(0), line: lineNum, col: startCol2 });
        } else {
          tokens.push({ type: "STRING", text: str, line: lineNum, col: startCol2 });
        }
        continue;
      }
      const startCol = i + 1;
      let word = "";
      while (i < len && /[a-zA-Z0-9_$.?@\u00C0-\u017F]/.test(lineText[i])) {
        word += lineText[i];
        i++;
      }
      if (word.length > 0) {
        const numVal = parseNumber(word);
        if (numVal !== null) {
          tokens.push({ type: "NUMBER", text: word, value: numVal, line: lineNum, col: startCol });
        } else {
          tokens.push({ type: "IDENTIFIER", text: word, line: lineNum, col: startCol });
        }
        continue;
      }
      const unhandled = lineText[i];
      i++;
      throw new Error(`Ge\xE7ersiz karakter '${unhandled}', sat\u0131r: ${lineNum}, s\xFCtun: ${startCol}`);
    }
    return tokens;
  }
};

// src/assembler/operands.ts
var REG8_NAMES = {
  AL: 0,
  CL: 1,
  DL: 2,
  BL: 3,
  AH: 4,
  CH: 5,
  DH: 6,
  BH: 7
};
var REG16_NAMES = {
  AX: 0,
  CX: 1,
  DX: 2,
  BX: 3,
  SP: 4,
  BP: 5,
  SI: 6,
  DI: 7
};
var SEG_NAMES = {
  ES: 0,
  CS: 1,
  SS: 2,
  DS: 3
};
var OperandParser = class {
  static parse(tokens) {
    if (tokens.length === 0) {
      throw new Error("Empty operand");
    }
    let tokenIdx = 0;
    let sizeOverride;
    let segOverride;
    const firstWord = tokens[0].text.toUpperCase();
    if (firstWord === "BYTE" || firstWord === "WORD") {
      if (tokens.length > 1 && tokens[1].text.toUpperCase() === "PTR") {
        sizeOverride = firstWord;
        tokenIdx = 2;
      } else if (tokens.length > 1 && (tokens[1].type === "LBRACKET" || tokens[1].text.toUpperCase() in SEG_NAMES)) {
        sizeOverride = firstWord;
        tokenIdx = 1;
      }
    }
    if (tokenIdx < tokens.length - 1 && tokens[tokenIdx + 1].type === "COLON") {
      const segName = tokens[tokenIdx].text.toUpperCase();
      if (segName in SEG_NAMES) {
        segOverride = segName;
        tokenIdx += 2;
      }
    }
    const remaining = tokens.slice(tokenIdx);
    if (remaining.length === 0) {
      throw new Error("Missing operand after size/segment specifier");
    }
    if (remaining.length === 1 && remaining[0].type === "IDENTIFIER") {
      const name = remaining[0].text.toUpperCase();
      if (name in REG8_NAMES) {
        return {
          kind: "REGISTER",
          name,
          size: "BYTE",
          regIndex: REG8_NAMES[name],
          isSegment: false
        };
      }
      if (name in REG16_NAMES) {
        return {
          kind: "REGISTER",
          name,
          size: "WORD",
          regIndex: REG16_NAMES[name],
          isSegment: false
        };
      }
      if (name in SEG_NAMES) {
        return {
          kind: "REGISTER",
          name,
          size: "WORD",
          regIndex: SEG_NAMES[name],
          isSegment: true
        };
      }
    }
    if (remaining[0].type === "LBRACKET") {
      return this.parseMemory(remaining, sizeOverride, segOverride);
    }
    if (remaining[0].text.toUpperCase() === "OFFSET") {
      if (remaining.length < 2) {
        throw new Error("OFFSET expects a label or expression");
      }
      const expr = this.parseImmediateExpression(remaining.slice(1));
      expr.isOffset = true;
      expr.size = sizeOverride || "WORD";
      return expr;
    }
    const imm = this.parseImmediateExpression(remaining);
    if (sizeOverride) imm.size = sizeOverride;
    return imm;
  }
  // Parses expressions inside [...] or memory operands
  static parseMemory(tokens, size, segOverride) {
    if (tokens[0].type !== "LBRACKET" || tokens[tokens.length - 1].type !== "RBRACKET") {
      throw new Error("Memory operand must be enclosed in brackets [...]");
    }
    let inner = tokens.slice(1, -1);
    if (inner.length === 0) {
      throw new Error("Empty memory brackets []");
    }
    if (inner.length >= 2 && inner[1].type === "COLON") {
      const segName = inner[0].text.toUpperCase();
      if (segName in SEG_NAMES) {
        segOverride = segName;
        inner = inner.slice(2);
      }
    }
    let baseReg;
    let indexReg;
    let disp = 0;
    let label;
    let sign = 1;
    let i = 0;
    while (i < inner.length) {
      const tok = inner[i];
      if (tok.type === "PLUS") {
        sign = 1;
        i++;
        continue;
      }
      if (tok.type === "MINUS") {
        sign = -1;
        i++;
        continue;
      }
      if (tok.type === "IDENTIFIER") {
        const u = tok.text.toUpperCase();
        if (u === "BX" || u === "BP") {
          if (baseReg) throw new Error(`Multiple base registers in memory operand: ${baseReg} and ${u}`);
          baseReg = u;
        } else if (u === "SI" || u === "DI") {
          if (indexReg) throw new Error(`Multiple index registers in memory operand: ${indexReg} and ${u}`);
          indexReg = u;
        } else if (["AX", "CX", "DX", "SP", "IP", "AL", "AH", "BL", "BH", "CL", "CH", "DL", "DH", "CS", "DS", "ES", "SS"].includes(u)) {
          throw new Error(`8086 mimarisinde [${u}] ile bellek adresleme yap\u0131lamaz! Yaln\u0131zca [BX], [BP], [SI], [DI] ve bunlar\u0131n kombinasyonlar\u0131 ge\xE7erlidir.`);
        } else {
          if (label) throw new Error(`Multiple labels in memory operand: ${label} and ${u}`);
          label = tok.text;
        }
      } else if (tok.type === "NUMBER") {
        disp += sign * (tok.value ?? 0);
      }
      i++;
    }
    const modrm = this.computeModRM(baseReg, indexReg, disp, label !== void 0);
    return {
      kind: "MEMORY",
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
  static computeModRM(baseReg, indexReg, disp = 0, hasLabel = false) {
    if (!baseReg && !indexReg) {
      return { mod: 0, rm: 6, dispBytes: 2 };
    }
    let rm = 0;
    if (baseReg === "BX" && indexReg === "SI") rm = 0;
    else if (baseReg === "BX" && indexReg === "DI") rm = 1;
    else if (baseReg === "BP" && indexReg === "SI") rm = 2;
    else if (baseReg === "BP" && indexReg === "DI") rm = 3;
    else if (!baseReg && indexReg === "SI") rm = 4;
    else if (!baseReg && indexReg === "DI") rm = 5;
    else if (baseReg === "BP" && !indexReg) {
      if (disp === 0 && !hasLabel) {
        return { mod: 1, rm: 6, dispBytes: 1 };
      }
      rm = 6;
    } else if (baseReg === "BX" && !indexReg) {
      rm = 7;
    } else {
      throw new Error(`Invalid addressing mode combination: base=${baseReg}, index=${indexReg}`);
    }
    if (hasLabel) {
      return { mod: 2, rm, dispBytes: 2 };
    }
    if (disp === 0 && !(baseReg === "BP" && !indexReg)) {
      return { mod: 0, rm, dispBytes: 0 };
    }
    if (disp >= -128 && disp <= 127) {
      return { mod: 1, rm, dispBytes: 1 };
    }
    return { mod: 2, rm, dispBytes: 2 };
  }
  // Parses immediate expressions: e.g. 100H, 'A', DIZI, DIZI + 4
  static parseImmediateExpression(tokens) {
    let value;
    let label;
    let disp = 0;
    let sign = 1;
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === "PLUS") {
        sign = 1;
        continue;
      }
      if (tok.type === "MINUS") {
        sign = -1;
        continue;
      }
      if (tok.type === "NUMBER") {
        disp += sign * (tok.value ?? 0);
      } else if (tok.type === "IDENTIFIER") {
        if (label) throw new Error(`Multiple labels in expression: ${label} and ${tok.text}`);
        label = tok.text;
      }
    }
    if (label === void 0) {
      value = disp;
      disp = 0;
    }
    return {
      kind: "IMMEDIATE",
      value,
      label,
      disp,
      isOffset: false
    };
  }
};

// src/assembler/parser.ts
var Parser = class {
  static parseLine(lineText, lineNumber) {
    const tokens = Lexer.tokenizeLine(lineText, lineNumber);
    if (tokens.length === 0) {
      return { lineNumber };
    }
    let tokenIdx = 0;
    let label;
    if (tokens.length >= 2 && tokens[0].type === "IDENTIFIER" && tokens[1].type === "COLON") {
      label = tokens[0].text;
      tokenIdx = 2;
    } else if (tokens.length >= 2 && tokens[0].type === "IDENTIFIER" && ["DB", "DW", "EQU", "PROC", "ENDP"].includes(tokens[1].text.toUpperCase())) {
      label = tokens[0].text;
      tokenIdx = 1;
    }
    if (tokenIdx >= tokens.length) {
      return { lineNumber, label };
    }
    const keyword = tokens[tokenIdx].text.toUpperCase();
    tokenIdx++;
    if (keyword === "ORG") {
      if (tokenIdx >= tokens.length) {
        throw new Error(`ORG directive missing address at line ${lineNumber}`);
      }
      const numTok = tokens[tokenIdx];
      if (numTok.type !== "NUMBER" || numTok.value === void 0) {
        throw new Error(`Invalid address for ORG at line ${lineNumber}`);
      }
      return {
        lineNumber,
        label,
        directive: {
          type: "ORG",
          items: [],
          orgValue: numTok.value
        }
      };
    }
    if (keyword === "EQU") {
      if (!label) {
        throw new Error(`EQU direktifi bir etiket ad\u0131 gerektirir, sat\u0131r: ${lineNumber}`);
      }
      const remaining = tokens.slice(tokenIdx);
      if (remaining.length === 0) {
        throw new Error(`EQU de\u011Feri eksik, sat\u0131r: ${lineNumber}`);
      }
      const numTok = remaining[0];
      if (numTok.type !== "NUMBER" || numTok.value === void 0) {
        throw new Error(`EQU sabit bir say\u0131 de\u011Feri bekler, sat\u0131r: ${lineNumber}`);
      }
      return {
        lineNumber,
        label,
        directive: {
          type: "EQU",
          items: [numTok.value],
          equValue: numTok.value
        }
      };
    }
    if (keyword === "PROC") {
      return {
        lineNumber,
        label,
        directive: {
          type: "PROC",
          items: []
        }
      };
    }
    if (keyword === "ENDP") {
      return {
        lineNumber,
        directive: {
          type: "ENDP",
          items: []
        }
      };
    }
    if ([".MODEL", ".STACK", ".DATA", ".CODE", "ASSUME", "END"].includes(keyword)) {
      const dirType = keyword.startsWith(".") ? keyword.slice(1) : keyword;
      return {
        lineNumber,
        label,
        directive: {
          type: dirType,
          items: []
        }
      };
    }
    if (keyword === "DB" || keyword === "DW") {
      const items = this.parseDataItems(tokens.slice(tokenIdx), lineNumber);
      return {
        lineNumber,
        label,
        directive: {
          type: keyword,
          items
        }
      };
    }
    if (keyword === "TIMES") {
      const remaining = tokens.slice(tokenIdx);
      const dbIdx = remaining.findIndex((t) => ["DB", "DW"].includes(t.text.toUpperCase()));
      if (dbIdx === -1) {
        throw new Error(`TIMES sonras\u0131nda DB veya DW direktifi bekleniyor, sat\u0131r: ${lineNumber}`);
      }
      const timesTokens = remaining.slice(0, dbIdx);
      const innerKeyword = remaining[dbIdx].text.toUpperCase();
      const items = this.parseDataItems(remaining.slice(dbIdx + 1), lineNumber);
      return {
        lineNumber,
        label,
        directive: {
          type: "TIMES",
          items,
          timesTokens,
          innerType: innerKeyword
        }
      };
    }
    let prefixBytes;
    let mnemonic = keyword;
    if (["REP", "REPE", "REPZ", "REPNE", "REPNZ"].includes(keyword)) {
      prefixBytes = keyword === "REPNE" || keyword === "REPNZ" ? [242] : [243];
      if (tokenIdx >= tokens.length) {
        throw new Error(`Prefix '${keyword}' sonras\u0131nda komut bekleniyor, sat\u0131r: ${lineNumber}`);
      }
      mnemonic = tokens[tokenIdx].text.toUpperCase();
      tokenIdx++;
    }
    const operandTokensList = [];
    let currentOpTokens = [];
    for (let i = tokenIdx; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === "COMMA") {
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
    const operands = [];
    for (const opTokens of operandTokensList) {
      operands.push(OperandParser.parse(opTokens));
    }
    return {
      lineNumber,
      label,
      instruction: {
        mnemonic,
        operands,
        prefixBytes
      }
    };
  }
  // Parses comma-separated data items for DB / DW, including DUP(...)
  static parseDataItems(tokens, lineNumber) {
    const items = [];
    let i = 0;
    while (i < tokens.length) {
      const tok = tokens[i];
      if (tok.type === "STRING") {
        items.push(tok.text);
        i++;
      } else if (tok.type === "NUMBER" && tok.value !== void 0) {
        if (i + 1 < tokens.length && tokens[i + 1].text.toUpperCase() === "DUP") {
          const count = tok.value;
          i += 2;
          if (i >= tokens.length || tokens[i].type !== "LPAREN") {
            throw new Error(`Expected '(' after DUP at line ${lineNumber}`);
          }
          i++;
          const dupValues = [];
          while (i < tokens.length && tokens[i].type !== "RPAREN") {
            const innerTok = tokens[i];
            if (innerTok.type === "NUMBER" && innerTok.value !== void 0) {
              dupValues.push(innerTok.value);
            } else if (innerTok.type === "STRING") {
              dupValues.push(innerTok.text);
            } else if (innerTok.text === "?") {
              dupValues.push(0);
            } else if (innerTok.type !== "COMMA") {
              throw new Error(`Invalid token in DUP: ${innerTok.text} at line ${lineNumber}`);
            }
            i++;
          }
          if (i >= tokens.length || tokens[i].type !== "RPAREN") {
            throw new Error(`Missing ')' in DUP at line ${lineNumber}`);
          }
          i++;
          items.push({ count, values: dupValues });
        } else {
          items.push(tok.value);
          i++;
        }
      } else if (tok.type === "IDENTIFIER") {
        items.push({ label: tok.text });
        i++;
      } else if (tok.text === "?") {
        items.push(0);
        i++;
      } else {
        throw new Error(`Unexpected token in data directive: ${tok.text} at line ${lineNumber}`);
      }
      if (i < tokens.length) {
        if (tokens[i].type === "COMMA") {
          i++;
        } else {
          throw new Error(`Expected ',' between data items at line ${lineNumber}`);
        }
      }
    }
    return items;
  }
};

// src/assembler/encoder.ts
var Encoder = class {
  static encode(inst, ctx, lineNum) {
    const raw = this.encodeInstruction(inst, ctx, lineNum);
    const prefixes = [];
    if (inst.prefixBytes && inst.prefixBytes.length > 0) {
      prefixes.push(...inst.prefixBytes);
    }
    for (const op of inst.operands) {
      if (op.kind === "MEMORY" && op.segmentOverride) {
        const segCodes = {
          ES: 38,
          CS: 46,
          SS: 54,
          DS: 62
        };
        const code = segCodes[op.segmentOverride];
        if (code !== void 0) {
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
  static encodeInstruction(inst, ctx, lineNum) {
    const mnemonic = inst.mnemonic.toUpperCase();
    const ops = inst.operands;
    switch (mnemonic) {
      case "NOP":
        return { bytes: [144], length: 1 };
      case "HLT":
        return { bytes: [244], length: 1 };
      case "PUSHA":
        return { bytes: [96], length: 1 };
      case "POPA":
        return { bytes: [97], length: 1 };
      case "PUSHF":
        return { bytes: [156], length: 1 };
      case "POPF":
        return { bytes: [157], length: 1 };
      case "MOVSB":
        return { bytes: [164], length: 1 };
      case "MOVSW":
        return { bytes: [165], length: 1 };
      case "STOSB":
        return { bytes: [170], length: 1 };
      case "STOSW":
        return { bytes: [171], length: 1 };
      case "LODSB":
        return { bytes: [172], length: 1 };
      case "LODSW":
        return { bytes: [173], length: 1 };
      case "CMPSB":
        return { bytes: [166], length: 1 };
      case "CMPSW":
        return { bytes: [167], length: 1 };
      case "SCASB":
        return { bytes: [174], length: 1 };
      case "SCASW":
        return { bytes: [175], length: 1 };
      case "CLC":
        return { bytes: [248], length: 1 };
      case "STC":
        return { bytes: [249], length: 1 };
      case "CMC":
        return { bytes: [245], length: 1 };
      case "CLD":
        return { bytes: [252], length: 1 };
      case "STD":
        return { bytes: [253], length: 1 };
      case "CLI":
        return { bytes: [250], length: 1 };
      case "STI":
        return { bytes: [251], length: 1 };
      case "IRET":
        return { bytes: [207], length: 1 };
      case "CBW":
        return { bytes: [152], length: 1 };
      case "CWD":
        return { bytes: [153], length: 1 };
      case "LAHF":
        return { bytes: [159], length: 1 };
      case "SAHF":
        return { bytes: [158], length: 1 };
      case "XLAT":
      case "XLATB":
        return { bytes: [215], length: 1 };
      case "WAIT":
        return { bytes: [155], length: 1 };
      case "DAA":
        return { bytes: [39], length: 1 };
      case "DAS":
        return { bytes: [47], length: 1 };
      case "AAA":
        return { bytes: [55], length: 1 };
      case "AAS":
        return { bytes: [63], length: 1 };
      case "AAM": {
        const base = ops.length === 1 && ops[0].kind === "IMMEDIATE" ? ops[0].value ?? 10 : 10;
        return { bytes: [212, base & 255], length: 2 };
      }
      case "AAD": {
        const base = ops.length === 1 && ops[0].kind === "IMMEDIATE" ? ops[0].value ?? 10 : 10;
        return { bytes: [213, base & 255], length: 2 };
      }
      case "LDS":
        return this.encodePointerLoad(197, ops, ctx, lineNum);
      case "LES":
        return this.encodePointerLoad(196, ops, ctx, lineNum);
      case "IN":
        return this.encodeIN(ops, ctx, lineNum);
      case "OUT":
        return this.encodeOUT(ops, ctx, lineNum);
      case "MOV":
        return this.encodeMOV(ops, ctx, lineNum);
      case "LEA":
        return this.encodeLEA(ops, ctx, lineNum);
      case "ADD":
        return this.encodeALU(0, 0, ops, ctx, lineNum);
      case "OR":
        return this.encodeALU(1, 8, ops, ctx, lineNum);
      case "ADC":
        return this.encodeALU(2, 16, ops, ctx, lineNum);
      case "SBB":
        return this.encodeALU(3, 24, ops, ctx, lineNum);
      case "AND":
        return this.encodeALU(4, 32, ops, ctx, lineNum);
      case "SUB":
        return this.encodeALU(5, 40, ops, ctx, lineNum);
      case "XOR":
        return this.encodeALU(6, 48, ops, ctx, lineNum);
      case "CMP":
        return this.encodeALU(7, 56, ops, ctx, lineNum);
      case "INC":
        return this.encodeIncDec(0, 64, ops, ctx, lineNum);
      case "DEC":
        return this.encodeIncDec(1, 72, ops, ctx, lineNum);
      case "NOT":
        return this.encodeUnary(2, ops, ctx, lineNum);
      case "NEG":
        return this.encodeUnary(3, ops, ctx, lineNum);
      case "MUL":
        return this.encodeUnary(4, ops, ctx, lineNum);
      case "IMUL":
        return this.encodeUnary(5, ops, ctx, lineNum);
      case "DIV":
        return this.encodeUnary(6, ops, ctx, lineNum);
      case "IDIV":
        return this.encodeUnary(7, ops, ctx, lineNum);
      case "TEST":
        return this.encodeTEST(ops, ctx, lineNum);
      case "XCHG":
        return this.encodeXCHG(ops, ctx, lineNum);
      case "SHL":
      case "SAL":
        return this.encodeShift(4, ops, ctx, lineNum);
      case "SHR":
        return this.encodeShift(5, ops, ctx, lineNum);
      case "SAR":
        return this.encodeShift(7, ops, ctx, lineNum);
      case "ROL":
        return this.encodeShift(0, ops, ctx, lineNum);
      case "ROR":
        return this.encodeShift(1, ops, ctx, lineNum);
      case "RCL":
        return this.encodeShift(2, ops, ctx, lineNum);
      case "RCR":
        return this.encodeShift(3, ops, ctx, lineNum);
      case "PUSH":
        return this.encodePush(ops, ctx, lineNum);
      case "POP":
        return this.encodePop(ops, ctx, lineNum);
      case "CALL":
        return this.encodeCall(ops, ctx, lineNum);
      case "RET":
      case "RETN":
        return this.encodeRet(ops, ctx, lineNum);
      case "JMP":
        return this.encodeJMP(ops, ctx, lineNum);
      case "JE":
      case "JZ":
        return this.encodeJcc(116, ops, ctx, lineNum);
      case "JNE":
      case "JNZ":
        return this.encodeJcc(117, ops, ctx, lineNum);
      case "JB":
      case "JC":
      case "JNAE":
        return this.encodeJcc(114, ops, ctx, lineNum);
      case "JNB":
      case "JNC":
      case "JAE":
        return this.encodeJcc(115, ops, ctx, lineNum);
      case "JA":
      case "JNBE":
        return this.encodeJcc(119, ops, ctx, lineNum);
      case "JBE":
      case "JNA":
        return this.encodeJcc(118, ops, ctx, lineNum);
      case "JL":
      case "JNGE":
        return this.encodeJcc(124, ops, ctx, lineNum);
      case "JGE":
      case "JNL":
        return this.encodeJcc(125, ops, ctx, lineNum);
      case "JLE":
      case "JNG":
        return this.encodeJcc(126, ops, ctx, lineNum);
      case "JG":
      case "JNLE":
        return this.encodeJcc(127, ops, ctx, lineNum);
      case "JS":
        return this.encodeJcc(120, ops, ctx, lineNum);
      case "JNS":
        return this.encodeJcc(121, ops, ctx, lineNum);
      case "JO":
        return this.encodeJcc(112, ops, ctx, lineNum);
      case "JNO":
        return this.encodeJcc(113, ops, ctx, lineNum);
      case "JP":
      case "JPE":
        return this.encodeJcc(122, ops, ctx, lineNum);
      case "JNP":
      case "JPO":
        return this.encodeJcc(123, ops, ctx, lineNum);
      case "JCXZ":
        return this.encodeJcc(227, ops, ctx, lineNum);
      case "LOOP":
        return this.encodeJcc(226, ops, ctx, lineNum);
      case "LOOPE":
      case "LOOPZ":
        return this.encodeJcc(225, ops, ctx, lineNum);
      case "LOOPNE":
      case "LOOPNZ":
        return this.encodeJcc(224, ops, ctx, lineNum);
      case "INT":
        return this.encodeINT(ops, ctx, lineNum);
      default:
        throw new Error(`Bilinmeyen komut '${mnemonic}' sat\u0131r: ${lineNum}`);
    }
  }
  // Resolves an immediate value or label
  static resolveImm(op, ctx, lineNum) {
    let val = op.disp;
    if (op.value !== void 0) {
      val += op.value;
    }
    if (op.label) {
      const lblUpper = op.label.toUpperCase();
      if (ctx.symbols.has(lblUpper)) {
        val += ctx.symbols.get(lblUpper);
      } else if (ctx.isPass2) {
        throw new Error(`Tan\u0131ms\u0131z etiket '${op.label}' sat\u0131r: ${lineNum}`);
      }
    }
    return val;
  }
  // --- LEA reg16, mem ---
  static encodeLEA(ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`LEA 2 operand bekler, sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (dest.kind !== "REGISTER" || dest.size !== "WORD" || dest.isSegment) {
      throw new Error(`LEA hedefi 16-bit genel yazma\xE7 olmal\u0131d\u0131r, sat\u0131r: ${lineNum}`);
    }
    let memOp;
    if (src.kind === "IMMEDIATE") {
      if (!src.label) {
        throw new Error(`LEA komutunda say\u0131 sabiti kullan\u0131lamaz, bellek referans\u0131 veya etiket beklenir (\xF6rn: LEA AX, [1234H]), sat\u0131r: ${lineNum}`);
      }
      memOp = {
        kind: "MEMORY",
        disp: src.disp,
        label: src.label,
        modrm: { mod: 0, rm: 6, dispBytes: 2 }
      };
    } else if (src.kind === "MEMORY") {
      memOp = src;
    } else {
      throw new Error(`LEA ge\xE7ersiz kaynak operand, sat\u0131r: ${lineNum}`);
    }
    const { modrmBytes, length } = this.buildModRM(dest.regIndex, memOp, ctx, lineNum);
    return {
      bytes: [141, ...modrmBytes],
      length: 1 + length
    };
  }
  // --- MOV ---
  static encodeMOV(ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`MOV 2 operand bekler, sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (dest.kind === "REGISTER" && src.kind === "IMMEDIATE") {
      if (dest.isSegment) {
        throw new Error(`8086 mimarisinde segment yazma\xE7lar\u0131na do\u011Frudan say\u0131 (immediate) y\xFCklenemez! \xD6nce genel ama\xE7l\u0131 bir yazmaca (\xF6rn: MOV AX, ${src.value ?? "de\u011Fer"}) y\xFCkleyip ard\u0131ndan MOV ${dest.name}, AX yapmal\u0131s\u0131n\u0131z, sat\u0131r: ${lineNum}`);
      }
      const val = this.resolveImm(src, ctx, lineNum);
      if (dest.size === "BYTE") {
        if (ctx.isPass2 && (val < -128 || val > 255)) {
          throw new Error(`De\u011Fer 8-bit s\u0131n\u0131r\u0131n\u0131 a\u015F\u0131yor (${val}), sat\u0131r: ${lineNum}`);
        }
        return {
          bytes: [176 + dest.regIndex, val & 255],
          length: 2
        };
      } else {
        if (ctx.isPass2 && (val < -32768 || val > 65535)) {
          throw new Error(`De\u011Fer 16-bit s\u0131n\u0131r\u0131n\u0131 a\u015F\u0131yor (${val}), sat\u0131r: ${lineNum}`);
        }
        return {
          bytes: [184 + dest.regIndex, val & 255, val >> 8 & 255],
          length: 3
        };
      }
    }
    if (dest.kind === "REGISTER" && src.kind === "REGISTER") {
      if (dest.isSegment || src.isSegment) {
        if (dest.isSegment && src.isSegment) throw new Error(`Segmentten segmente MOV desteklenmez, sat\u0131r: ${lineNum}`);
        if (dest.isSegment) {
          if (dest.name === "CS") throw new Error(`8086 mimarisinde CS (Code Segment) yazmac\u0131na do\u011Frudan MOV ile de\u011Fer atanamaz, sat\u0131r: ${lineNum}`);
          const modrm2 = 192 | dest.regIndex << 3 | src.regIndex;
          return { bytes: [142, modrm2], length: 2 };
        } else {
          const modrm2 = 192 | src.regIndex << 3 | dest.regIndex;
          return { bytes: [140, modrm2], length: 2 };
        }
      }
      if (dest.size !== src.size) throw new Error(`Operand boyutlar\u0131 uyu\u015Fmuyor, sat\u0131r: ${lineNum}`);
      const is16 = dest.size === "WORD";
      const opcode = is16 ? 137 : 136;
      const modrm = 192 | src.regIndex << 3 | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }
    if (dest.kind === "REGISTER" && src.kind === "MEMORY") {
      if (dest.isSegment) {
        if (dest.name === "CS") throw new Error(`8086 mimarisinde CS (Code Segment) yazmac\u0131na do\u011Frudan MOV ile de\u011Fer atanamaz, sat\u0131r: ${lineNum}`);
        const { modrmBytes: modrmBytes2, length: length2 } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
        return { bytes: [142, ...modrmBytes2], length: 1 + length2 };
      }
      const is16 = dest.size === "WORD";
      const opcode = is16 ? 139 : 138;
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    if (dest.kind === "MEMORY" && src.kind === "REGISTER") {
      if (src.isSegment) {
        const { modrmBytes: modrmBytes2, length: length2 } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
        return { bytes: [140, ...modrmBytes2], length: 1 + length2 };
      }
      const is16 = src.size === "WORD";
      const opcode = is16 ? 137 : 136;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    if (dest.kind === "MEMORY" && src.kind === "IMMEDIATE") {
      if (!dest.size) {
        throw new Error(`Operand size belirtilmedi (BYTE PTR veya WORD PTR kullan\u0131n), sat\u0131r: ${lineNum}`);
      }
      const is16 = dest.size === "WORD";
      const opcode = is16 ? 199 : 198;
      const val = this.resolveImm(src, ctx, lineNum);
      const { modrmBytes, length } = this.buildModRM(0, dest, ctx, lineNum);
      const immBytes = is16 ? [val & 255, val >> 8 & 255] : [val & 255];
      return {
        bytes: [opcode, ...modrmBytes, ...immBytes],
        length: 1 + length + immBytes.length
      };
    }
    throw new Error(`Desteklenmeyen MOV operand kombinasyonu, sat\u0131r: ${lineNum}`);
  }
  // --- ALU (ADD, OR, AND, SUB, XOR, CMP) ---
  static encodeALU(ext, baseOpcode, ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`Komut 2 operand bekler, sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "REGISTER" && !src.isSegment) {
      if (dest.size !== src.size) throw new Error(`Operand boyutlar\u0131 uyu\u015Fmuyor, sat\u0131r: ${lineNum}`);
      const is16 = dest.size === "WORD";
      const opcode = is16 ? baseOpcode + 1 : baseOpcode;
      const modrm = 192 | src.regIndex << 3 | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "MEMORY") {
      const is16 = dest.size === "WORD";
      const opcode = is16 ? baseOpcode + 3 : baseOpcode + 2;
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    if (dest.kind === "MEMORY" && src.kind === "REGISTER" && !src.isSegment) {
      const is16 = src.size === "WORD";
      const opcode = is16 ? baseOpcode + 1 : baseOpcode;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "IMMEDIATE") {
      const val = this.resolveImm(src, ctx, lineNum);
      if (dest.name === "AL") {
        return { bytes: [baseOpcode + 4, val & 255], length: 2 };
      }
      if (dest.name === "AX") {
        return { bytes: [baseOpcode + 5, val & 255, val >> 8 & 255], length: 3 };
      }
      const is16 = dest.size === "WORD";
      if (!is16) {
        const modrm = 192 | ext << 3 | dest.regIndex;
        return { bytes: [128, modrm, val & 255], length: 3 };
      } else {
        const modrm = 192 | ext << 3 | dest.regIndex;
        return { bytes: [129, modrm, val & 255, val >> 8 & 255], length: 4 };
      }
    }
    if (dest.kind === "MEMORY" && src.kind === "IMMEDIATE") {
      if (!dest.size) {
        throw new Error(`Operand size belirtilmedi (BYTE PTR veya WORD PTR kullan\u0131n), sat\u0131r: ${lineNum}`);
      }
      const is16 = dest.size === "WORD";
      const val = this.resolveImm(src, ctx, lineNum);
      const opcode = is16 ? 129 : 128;
      const { modrmBytes, length } = this.buildModRM(ext, dest, ctx, lineNum);
      const immBytes = is16 ? [val & 255, val >> 8 & 255] : [val & 255];
      return {
        bytes: [opcode, ...modrmBytes, ...immBytes],
        length: 1 + length + immBytes.length
      };
    }
    throw new Error(`Desteklenmeyen operand kombinasyonu, sat\u0131r: ${lineNum}`);
  }
  // --- INC / DEC ---
  static encodeIncDec(ext, baseReg16Opcode, ops, ctx, lineNum) {
    if (ops.length !== 1) throw new Error(`INC/DEC 1 operand bekler, sat\u0131r: ${lineNum}`);
    const op = ops[0];
    if (op.kind === "REGISTER" && !op.isSegment) {
      if (op.size === "WORD") {
        return { bytes: [baseReg16Opcode + op.regIndex], length: 1 };
      } else {
        const modrm = 192 | ext << 3 | op.regIndex;
        return { bytes: [254, modrm], length: 2 };
      }
    }
    if (op.kind === "MEMORY") {
      if (!op.size) {
        throw new Error(`Operand size belirtilmedi, sat\u0131r: ${lineNum}`);
      }
      const is16 = op.size === "WORD";
      const opcode = is16 ? 255 : 254;
      const { modrmBytes, length } = this.buildModRM(ext, op, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Ge\xE7ersiz INC/DEC operand\u0131, sat\u0131r: ${lineNum}`);
  }
  // --- Unary (NOT, NEG, MUL, IMUL, DIV, IDIV) ---
  static encodeUnary(ext, ops, ctx, lineNum) {
    if (ops.length !== 1) throw new Error(`Komut 1 operand bekler, sat\u0131r: ${lineNum}`);
    const op = ops[0];
    if (op.kind === "REGISTER" && !op.isSegment) {
      const is16 = op.size === "WORD";
      const opcode = is16 ? 247 : 246;
      const modrm = 192 | ext << 3 | op.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }
    if (op.kind === "MEMORY") {
      if (!op.size) throw new Error(`Operand size belirtilmedi, sat\u0131r: ${lineNum}`);
      const is16 = op.size === "WORD";
      const opcode = is16 ? 247 : 246;
      const { modrmBytes, length } = this.buildModRM(ext, op, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Ge\xE7ersiz operand, sat\u0131r: ${lineNum}`);
  }
  // --- TEST ---
  static encodeTEST(ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`TEST 2 operand bekler, sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "REGISTER" && !src.isSegment) {
      if (dest.size !== src.size) throw new Error(`Operand boyutlar\u0131 uyu\u015Fmuyor, sat\u0131r: ${lineNum}`);
      const opcode = dest.size === "WORD" ? 133 : 132;
      const modrm = 192 | src.regIndex << 3 | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "MEMORY") {
      const is16 = dest.size === "WORD";
      const opcode = is16 ? 133 : 132;
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    if (dest.kind === "MEMORY" && src.kind === "REGISTER" && !src.isSegment) {
      const is16 = src.size === "WORD";
      const opcode = is16 ? 133 : 132;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "IMMEDIATE") {
      const val = this.resolveImm(src, ctx, lineNum);
      if (dest.name === "AL") return { bytes: [168, val & 255], length: 2 };
      if (dest.name === "AX") return { bytes: [169, val & 255, val >> 8 & 255], length: 3 };
      const is16 = dest.size === "WORD";
      const opcode = is16 ? 247 : 246;
      const modrm = 192 | 0 << 3 | dest.regIndex;
      const immBytes = is16 ? [val & 255, val >> 8 & 255] : [val & 255];
      return { bytes: [opcode, modrm, ...immBytes], length: 2 + immBytes.length };
    }
    if (dest.kind === "MEMORY" && src.kind === "IMMEDIATE") {
      if (!dest.size) throw new Error(`Operand size belirtilmedi (BYTE PTR veya WORD PTR kullan\u0131n), sat\u0131r: ${lineNum}`);
      const is16 = dest.size === "WORD";
      const val = this.resolveImm(src, ctx, lineNum);
      const opcode = is16 ? 247 : 246;
      const { modrmBytes, length } = this.buildModRM(0, dest, ctx, lineNum);
      const immBytes = is16 ? [val & 255, val >> 8 & 255] : [val & 255];
      return { bytes: [opcode, ...modrmBytes, ...immBytes], length: 1 + length + immBytes.length };
    }
    throw new Error(`Desteklenmeyen TEST operasyonu, sat\u0131r: ${lineNum}`);
  }
  // --- XCHG ---
  static encodeXCHG(ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`XCHG 2 operand bekler, sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "REGISTER" && !src.isSegment) {
      if (dest.size === "WORD" && dest.name === "AX") {
        return { bytes: [144 + src.regIndex], length: 1 };
      }
      if (src.size === "WORD" && src.name === "AX") {
        return { bytes: [144 + dest.regIndex], length: 1 };
      }
      const opcode = dest.size === "WORD" ? 135 : 134;
      const modrm = 192 | src.regIndex << 3 | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }
    if (dest.kind === "REGISTER" && !dest.isSegment && src.kind === "MEMORY") {
      const is16 = dest.size === "WORD";
      const opcode = is16 ? 135 : 134;
      const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    if (dest.kind === "MEMORY" && src.kind === "REGISTER" && !src.isSegment) {
      const is16 = src.size === "WORD";
      const opcode = is16 ? 135 : 134;
      const { modrmBytes, length } = this.buildModRM(src.regIndex, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Desteklenmeyen XCHG operasyonu, sat\u0131r: ${lineNum}`);
  }
  // --- Shifts & Rotates ---
  static encodeShift(ext, ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`Shift komutu 2 operand bekler, sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const countOp = ops[1];
    let isByCL = false;
    if (countOp.kind === "REGISTER" && countOp.name === "CL") {
      isByCL = true;
    } else if (countOp.kind === "IMMEDIATE" && countOp.value === 1) {
      isByCL = false;
    } else {
      throw new Error(`Shift say\u0131s\u0131 1 veya CL olmal\u0131d\u0131r, sat\u0131r: ${lineNum}`);
    }
    if (dest.kind === "REGISTER" && !dest.isSegment) {
      const is16 = dest.size === "WORD";
      let opcode = is16 ? isByCL ? 211 : 209 : isByCL ? 210 : 208;
      const modrm = 192 | ext << 3 | dest.regIndex;
      return { bytes: [opcode, modrm], length: 2 };
    }
    if (dest.kind === "MEMORY") {
      if (!dest.size) throw new Error(`Operand size belirtilmedi, sat\u0131r: ${lineNum}`);
      const is16 = dest.size === "WORD";
      let opcode = is16 ? isByCL ? 211 : 209 : isByCL ? 210 : 208;
      const { modrmBytes, length } = this.buildModRM(ext, dest, ctx, lineNum);
      return { bytes: [opcode, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Ge\xE7ersiz shift hedefi, sat\u0131r: ${lineNum}`);
  }
  // --- PUSH / POP ---
  static encodePush(ops, ctx, lineNum) {
    if (ops.length !== 1) throw new Error(`PUSH 1 operand bekler, sat\u0131r: ${lineNum}`);
    const op = ops[0];
    if (op.kind === "REGISTER") {
      if (op.isSegment) {
        const segCodes = [6, 14, 22, 30];
        return { bytes: [segCodes[op.regIndex]], length: 1 };
      }
      if (op.size !== "WORD") {
        throw new Error(`8086 mimarisinde 8-bit yazma\xE7lar (${op.name}) y\u0131\u011F\u0131na PUSH edilemez! Yaln\u0131zca 16-bit yazma\xE7lar ve segment yazma\xE7lar\u0131 kullan\u0131labilir, sat\u0131r: ${lineNum}`);
      }
      return { bytes: [80 + op.regIndex], length: 1 };
    }
    if (op.kind === "MEMORY") {
      if (op.size === "BYTE") {
        throw new Error(`8086 mimarisinde byte boyutu y\u0131\u011F\u0131na PUSH edilemez! Yaln\u0131zca 16-bit WORD kullan\u0131labilir, sat\u0131r: ${lineNum}`);
      }
      const { modrmBytes, length } = this.buildModRM(6, op, ctx, lineNum);
      return { bytes: [255, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Ge\xE7ersiz PUSH operand\u0131, sat\u0131r: ${lineNum}`);
  }
  static encodePop(ops, ctx, lineNum) {
    if (ops.length !== 1) throw new Error(`POP 1 operand bekler, sat\u0131r: ${lineNum}`);
    const op = ops[0];
    if (op.kind === "REGISTER") {
      if (op.isSegment) {
        if (op.name === "CS") throw new Error(`8086 mimarisinde POP CS ge\xE7ersizdir! CS y\u0131\u011F\u0131ndan do\u011Frudan POP edilemez, sat\u0131r: ${lineNum}`);
        const segCodes = [7, 0, 23, 31];
        return { bytes: [segCodes[op.regIndex]], length: 1 };
      }
      if (op.size !== "WORD") {
        throw new Error(`8086 mimarisinde 8-bit yazma\xE7lar (${op.name}) y\u0131\u011F\u0131ndan POP edilemez! Yaln\u0131zca 16-bit yazma\xE7lar kullan\u0131labilir, sat\u0131r: ${lineNum}`);
      }
      return { bytes: [88 + op.regIndex], length: 1 };
    }
    if (op.kind === "MEMORY") {
      if (op.size === "BYTE") {
        throw new Error(`8086 mimarisinde byte boyutu y\u0131\u011F\u0131ndan POP edilemez! Yaln\u0131zca 16-bit WORD kullan\u0131labilir, sat\u0131r: ${lineNum}`);
      }
      const { modrmBytes, length } = this.buildModRM(0, op, ctx, lineNum);
      return { bytes: [143, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Ge\xE7ersiz POP operand\u0131, sat\u0131r: ${lineNum}`);
  }
  // --- CALL / RET ---
  static encodeCall(ops, ctx, lineNum) {
    if (ops.length !== 1) throw new Error(`CALL 1 operand bekler, sat\u0131r: ${lineNum}`);
    const op = ops[0];
    if (op.kind === "IMMEDIATE") {
      const target = this.resolveImm(op, ctx, lineNum);
      const rel16 = target - (ctx.currentAddr + 3) & 65535;
      return {
        bytes: [232, rel16 & 255, rel16 >> 8 & 255],
        length: 3
      };
    }
    if (op.kind === "REGISTER" && !op.isSegment && op.size === "WORD") {
      const modrm = 192 | 2 << 3 | op.regIndex;
      return { bytes: [255, modrm], length: 2 };
    }
    if (op.kind === "MEMORY") {
      const { modrmBytes, length } = this.buildModRM(2, op, ctx, lineNum);
      return { bytes: [255, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Ge\xE7ersiz CALL hedefi, sat\u0131r: ${lineNum}`);
  }
  static encodeRet(ops, ctx, lineNum) {
    if (ops.length === 0) {
      return { bytes: [195], length: 1 };
    }
    if (ops.length === 1 && ops[0].kind === "IMMEDIATE") {
      const imm = this.resolveImm(ops[0], ctx, lineNum);
      return { bytes: [194, imm & 255, imm >> 8 & 255], length: 3 };
    }
    throw new Error(`Ge\xE7ersiz RET operand\u0131, sat\u0131r: ${lineNum}`);
  }
  // --- LDS / LES reg16, mem ---
  static encodePointerLoad(opcode, ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`LDS/LES 2 operand bekler, sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (dest.kind !== "REGISTER" || dest.size !== "WORD" || dest.isSegment) {
      throw new Error(`LDS/LES hedefi 16-bit genel yazma\xE7 olmal\u0131d\u0131r, sat\u0131r: ${lineNum}`);
    }
    if (src.kind !== "MEMORY") {
      throw new Error(`LDS/LES kayna\u011F\u0131 bellek g\xF6stericisi olmal\u0131d\u0131r, sat\u0131r: ${lineNum}`);
    }
    const { modrmBytes, length } = this.buildModRM(dest.regIndex, src, ctx, lineNum);
    return { bytes: [opcode, ...modrmBytes], length: 1 + length };
  }
  // --- IN / OUT ---
  static encodeIN(ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`IN 2 operand bekler (\xF6rn: IN AL, 20h veya IN AX, DX), sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (dest.kind !== "REGISTER" || dest.name !== "AL" && dest.name !== "AX") {
      throw new Error(`IN komutunda hedef sadece AL veya AX olabilir, sat\u0131r: ${lineNum}`);
    }
    const is16 = dest.name === "AX";
    if (src.kind === "REGISTER" && src.name === "DX") {
      return { bytes: [is16 ? 237 : 236], length: 1 };
    }
    if (src.kind === "IMMEDIATE") {
      const port = this.resolveImm(src, ctx, lineNum);
      return { bytes: [is16 ? 229 : 228, port & 255], length: 2 };
    }
    throw new Error(`Ge\xE7ersiz IN port operand\u0131, sat\u0131r: ${lineNum}`);
  }
  static encodeOUT(ops, ctx, lineNum) {
    if (ops.length !== 2) throw new Error(`OUT 2 operand bekler (\xF6rn: OUT 20h, AL veya OUT DX, AX), sat\u0131r: ${lineNum}`);
    const dest = ops[0];
    const src = ops[1];
    if (src.kind !== "REGISTER" || src.name !== "AL" && src.name !== "AX") {
      throw new Error(`OUT komutunda kaynak sadece AL veya AX olabilir, sat\u0131r: ${lineNum}`);
    }
    const is16 = src.name === "AX";
    if (dest.kind === "REGISTER" && dest.name === "DX") {
      return { bytes: [is16 ? 239 : 238], length: 1 };
    }
    if (dest.kind === "IMMEDIATE") {
      const port = this.resolveImm(dest, ctx, lineNum);
      return { bytes: [is16 ? 231 : 230, port & 255], length: 2 };
    }
    throw new Error(`Ge\xE7ersiz OUT port operand\u0131, sat\u0131r: ${lineNum}`);
  }
  // --- JMP ---
  static encodeJMP(ops, ctx, lineNum) {
    if (ops.length !== 1) throw new Error(`JMP 1 operand bekler, sat\u0131r: ${lineNum}`);
    const op = ops[0];
    if (op.kind === "IMMEDIATE") {
      const target = this.resolveImm(op, ctx, lineNum);
      const rel16 = target - (ctx.currentAddr + 3) & 65535;
      return {
        bytes: [233, rel16 & 255, rel16 >> 8 & 255],
        length: 3
      };
    }
    if (op.kind === "REGISTER" && !op.isSegment && op.size === "WORD") {
      const modrm = 192 | 4 << 3 | op.regIndex;
      return { bytes: [255, modrm], length: 2 };
    }
    if (op.kind === "MEMORY") {
      const { modrmBytes, length } = this.buildModRM(4, op, ctx, lineNum);
      return { bytes: [255, ...modrmBytes], length: 1 + length };
    }
    throw new Error(`Ge\xE7ersiz JMP operand\u0131, sat\u0131r: ${lineNum}`);
  }
  // --- Jcc and LOOP (rel8) ---
  static encodeJcc(opcode, ops, ctx, lineNum) {
    if (ops.length !== 1) throw new Error(`Jump komutu 1 operand bekler, sat\u0131r: ${lineNum}`);
    const op = ops[0];
    if (op.kind === "IMMEDIATE") {
      const target = this.resolveImm(op, ctx, lineNum);
      const rel = target - (ctx.currentAddr + 2);
      if (ctx.isPass2 && (rel < -128 || rel > 127)) {
        throw new Error(`Jump out of range (rel=${rel}, -128..127 s\u0131n\u0131r\u0131n\u0131 a\u015F\u0131yor) sat\u0131r: ${lineNum}`);
      }
      return {
        bytes: [opcode, rel & 255],
        length: 2
      };
    }
    throw new Error(`Ge\xE7ersiz jump hedefi, sat\u0131r: ${lineNum}`);
  }
  // --- INT ---
  static encodeINT(ops, ctx, lineNum) {
    if (ops.length !== 1 || ops[0].kind !== "IMMEDIATE") {
      throw new Error(`INT kesme numaras\u0131 bekler, sat\u0131r: ${lineNum}`);
    }
    const num = this.resolveImm(ops[0], ctx, lineNum);
    if (num === 3) {
      return { bytes: [204], length: 1 };
    }
    return { bytes: [205, num & 255], length: 2 };
  }
  // Helper to build ModRM byte and displacement bytes
  static buildModRM(regField, mem, ctx, lineNum) {
    let disp = mem.disp;
    if (mem.label) {
      const lblUpper = mem.label.toUpperCase();
      if (ctx.symbols.has(lblUpper)) {
        disp += ctx.symbols.get(lblUpper);
      } else if (ctx.isPass2) {
        throw new Error(`Tan\u0131ms\u0131z etiket '${mem.label}' sat\u0131r: ${lineNum}`);
      }
    }
    const modrmInfo = OperandParser.computeModRM(
      mem.baseReg,
      mem.indexReg,
      disp,
      mem.label !== void 0
    );
    const modrmByte = modrmInfo.mod << 6 | (regField & 7) << 3 | modrmInfo.rm & 7;
    const bytes = [modrmByte];
    if (modrmInfo.dispBytes === 1) {
      bytes.push(disp & 255);
    } else if (modrmInfo.dispBytes === 2) {
      bytes.push(disp & 255, disp >> 8 & 255);
    }
    return {
      modrmBytes: bytes,
      length: bytes.length
    };
  }
};

// src/assembler/assembler.ts
var Assembler = class {
  static assemble(source) {
    const lines = source.split(/\r?\n/);
    const symbols = /* @__PURE__ */ new Map();
    symbols.set("@DATA", 0);
    symbols.set("@CODE", 0);
    symbols.set("@STACK", 0);
    const errors = [];
    const listing = [];
    let origin = 0;
    const parsedLines = [];
    let currentAddr = origin;
    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const rawLine = lines[i];
      try {
        const parsed = Parser.parseLine(rawLine, lineNum);
        parsedLines.push(parsed);
        if (parsed.directive && parsed.directive.type === "ORG") {
          if (parsed.directive.orgValue !== void 0) {
            origin = parsed.directive.orgValue;
            currentAddr = origin;
          }
        }
        if (parsed.label) {
          const lblName = parsed.label.toUpperCase();
          if (parsed.directive && parsed.directive.type === "EQU") {
            symbols.set(lblName, parsed.directive.equValue ?? 0);
          } else {
            if (symbols.has(lblName)) {
              errors.push({ line: lineNum, message: `M\xFCkerrer etiket: '${parsed.label}'` });
            } else {
              symbols.set(lblName, currentAddr);
            }
          }
        }
        if (parsed.directive) {
          const size = this.getDirectiveSize(parsed.directive, currentAddr, origin, symbols);
          currentAddr += size;
        } else if (parsed.instruction) {
          const ctx = {
            currentAddr,
            symbols,
            isPass2: false
          };
          const enc = Encoder.encode(parsed.instruction, ctx, lineNum);
          currentAddr += enc.length;
        }
      } catch (err) {
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
    currentAddr = origin;
    const emittedBytes = [];
    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const parsed = parsedLines[i];
      if (!parsed) continue;
      const lineStartAddr = currentAddr;
      const lineBytes = [];
      try {
        if (parsed.directive) {
          if (parsed.directive.type === "ORG") {
            if (parsed.directive.orgValue !== void 0) {
              currentAddr = parsed.directive.orgValue;
            }
          } else if (parsed.directive.type === "EQU" || parsed.directive.type === "PROC" || parsed.directive.type === "ENDP" || parsed.directive.type === "MODEL" || parsed.directive.type === "STACK" || parsed.directive.type === "DATA" || parsed.directive.type === "CODE" || parsed.directive.type === "ASSUME" || parsed.directive.type === "END") {
          } else {
            const dataBytes = this.generateDirectiveBytes(parsed.directive, symbols, lineNum, currentAddr, origin);
            lineBytes.push(...dataBytes);
            emittedBytes.push(...dataBytes);
            currentAddr += dataBytes.length;
          }
        } else if (parsed.instruction) {
          const ctx = {
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
      } catch (err) {
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
  static evaluateTimesCount(directive, currentAddr, origin, symbols) {
    const tokens = directive.timesTokens || [];
    if (tokens.length === 0) return 0;
    let pos = 0;
    const parsePrimary = () => {
      if (pos >= tokens.length) return 0;
      const tok = tokens[pos];
      if (tok.type === "LPAREN") {
        pos++;
        const val = parseAddSub();
        if (pos < tokens.length && tokens[pos].type === "RPAREN") {
          pos++;
        }
        return val;
      }
      if (tok.type === "NUMBER" && tok.value !== void 0) {
        pos++;
        return tok.value;
      }
      if (tok.type === "IDENTIFIER") {
        const text = tok.text.toUpperCase();
        pos++;
        if (text === "$") return currentAddr;
        if (text === "$$") return origin;
        if (symbols.has(text)) return symbols.get(text);
        return 0;
      }
      pos++;
      return 0;
    };
    const parseMul = () => {
      let val = parsePrimary();
      while (pos < tokens.length && tokens[pos].type === "MULTIPLY") {
        pos++;
        val = val * parsePrimary();
      }
      return val;
    };
    const parseAddSub = () => {
      let val = parseMul();
      while (pos < tokens.length && (tokens[pos].type === "PLUS" || tokens[pos].type === "MINUS")) {
        const op = tokens[pos].type;
        pos++;
        const nextVal = parseMul();
        if (op === "PLUS") val += nextVal;
        else val -= nextVal;
      }
      return val;
    };
    const result = parseAddSub();
    return Math.max(0, result);
  }
  // Calculate size in bytes for DB, DW, and TIMES directives
  static getDirectiveSize(directive, currentAddr = 0, origin = 0, symbols = /* @__PURE__ */ new Map()) {
    if (directive.type === "ORG" || directive.type === "EQU" || directive.type === "PROC" || directive.type === "ENDP" || directive.type === "MODEL" || directive.type === "STACK" || directive.type === "DATA" || directive.type === "CODE" || directive.type === "ASSUME" || directive.type === "END") return 0;
    if (directive.type === "TIMES") {
      const count = this.evaluateTimesCount(directive, currentAddr, origin, symbols);
      const mult2 = directive.innerType === "DW" ? 2 : 1;
      let singleLen = 0;
      for (const item of directive.items) {
        if (typeof item === "number") {
          singleLen += mult2;
        } else if (typeof item === "string") {
          singleLen += item.length * mult2;
        } else if (typeof item === "object") {
          if ("count" in item && item.count !== void 0) {
            singleLen += item.count * mult2;
          } else if ("label" in item) {
            singleLen += mult2;
          }
        }
      }
      return count * (singleLen || mult2);
    }
    const mult = directive.type === "DW" ? 2 : 1;
    let size = 0;
    for (const item of directive.items) {
      if (typeof item === "number") {
        size += mult;
      } else if (typeof item === "string") {
        size += item.length * mult;
      } else if (typeof item === "object") {
        if ("count" in item && item.count !== void 0) {
          let singleLen = 0;
          for (const v of item.values) {
            singleLen += typeof v === "string" ? v.length * mult : mult;
          }
          size += item.count * singleLen;
        } else if ("label" in item) {
          size += mult;
        }
      }
    }
    return size;
  }
  // Generate actual bytes for DB, DW, and TIMES directives
  static generateDirectiveBytes(directive, symbols, lineNum, currentAddr = 0, origin = 0) {
    const bytes = [];
    if (directive.type === "TIMES") {
      const count = this.evaluateTimesCount(directive, currentAddr, origin, symbols);
      const isDW2 = directive.innerType === "DW";
      const emitVal2 = (val) => {
        if (isDW2) {
          bytes.push(val & 255, val >> 8 & 255);
        } else {
          bytes.push(val & 255);
        }
      };
      const emitStr2 = (str) => {
        for (let i = 0; i < str.length; i++) {
          emitVal2(str.charCodeAt(i));
        }
      };
      for (let c = 0; c < count; c++) {
        for (const item of directive.items) {
          if (typeof item === "number") {
            emitVal2(item);
          } else if (typeof item === "string") {
            emitStr2(item);
          } else if (typeof item === "object") {
            if ("count" in item && item.count !== void 0) {
              for (let ic = 0; ic < item.count; ic++) {
                for (const v of item.values) {
                  if (typeof v === "string") emitStr2(v);
                  else emitVal2(v);
                }
              }
            } else if ("label" in item) {
              const lblUpper = item.label.toUpperCase();
              if (symbols.has(lblUpper)) {
                emitVal2(symbols.get(lblUpper));
              } else {
                throw new Error(`Tan\u0131ms\u0131z etiket '${item.label}' sat\u0131r: ${lineNum}`);
              }
            }
          }
        }
      }
      return bytes;
    }
    const isDW = directive.type === "DW";
    const emitVal = (val) => {
      if (isDW) {
        bytes.push(val & 255, val >> 8 & 255);
      } else {
        bytes.push(val & 255);
      }
    };
    const emitStr = (str) => {
      for (let i = 0; i < str.length; i++) {
        emitVal(str.charCodeAt(i));
      }
    };
    for (const item of directive.items) {
      if (typeof item === "number") {
        emitVal(item);
      } else if (typeof item === "string") {
        emitStr(item);
      } else if (typeof item === "object") {
        if ("count" in item && item.count !== void 0) {
          for (let c = 0; c < item.count; c++) {
            for (const v of item.values) {
              if (typeof v === "string") emitStr(v);
              else emitVal(v);
            }
          }
        } else if ("label" in item) {
          const lblUpper = item.label.toUpperCase();
          if (symbols.has(lblUpper)) {
            emitVal(symbols.get(lblUpper));
          } else {
            throw new Error(`Tan\u0131ms\u0131z etiket '${item.label}' sat\u0131r: ${lineNum}`);
          }
        }
      }
    }
    return bytes;
  }
};

// src/cpu/memory.ts
var Memory = class {
  size = 1024 * 1024;
  // 1 MB (00000h - FFFFFh)
  data;
  cellTypes;
  // Trackers for current step visualization and step-back restoration
  lastReads = /* @__PURE__ */ new Set();
  lastWrites = /* @__PURE__ */ new Set();
  lastWriteOldValues = /* @__PURE__ */ new Map();
  onVramWrite;
  constructor() {
    this.data = new Uint8Array(this.size);
    this.cellTypes = new Uint8Array(this.size);
    this.initHardwareRomAndVectors();
  }
  reset() {
    this.data.fill(0);
    this.cellTypes.fill(0);
    this.lastReads.clear();
    this.lastWrites.clear();
    this.lastWriteOldValues.clear();
    this.initHardwareRomAndVectors();
  }
  /**
   * Initializes authentic 1981 IBM PC compatible 8086 post-BIOS hardware state:
   * 1. IVT (Interrupt Vector Table): 0x00000 - 0x003FF (256 vectors)
   * 2. BDA (BIOS Data Area): 0x00400 - 0x004FF (Equipment, RAM size, Video mode)
   * 3. VRAM (CGA/VGA Text Mode): 0x0B8000 - 0x0B8FA0 (80x25 blank cells)
   * 4. ROM BIOS: 0x0F0000 - 0x0FFFFF (Handlers, Reset Vector at 0xFFFF0, Model Byte)
   */
  initHardwareRomAndVectors() {
    for (let i = 0; i < 256; i++) {
      const vecOffset = i * 4;
      this.data[vecOffset] = 242;
      this.data[vecOffset + 1] = 230;
      this.data[vecOffset + 2] = 0;
      this.data[vecOffset + 3] = 240;
    }
    const setVector = (intNum, cs, ip) => {
      const off = intNum * 4;
      this.data[off] = ip & 255;
      this.data[off + 1] = ip >> 8 & 255;
      this.data[off + 2] = cs & 255;
      this.data[off + 3] = cs >> 8 & 255;
    };
    setVector(0, 61440, 4192);
    setVector(1, 61440, 4208);
    setVector(2, 61440, 4213);
    setVector(3, 61440, 4218);
    setVector(4, 61440, 4222);
    setVector(8, 61440, 4224);
    setVector(9, 61440, 4240);
    setVector(16, 61440, 4096);
    setVector(17, 61440, 4352);
    setVector(18, 61440, 4608);
    setVector(19, 61440, 4864);
    setVector(20, 61440, 5120);
    setVector(21, 61440, 5376);
    setVector(22, 61440, 5632);
    setVector(23, 61440, 5888);
    setVector(24, 62976, 0);
    setVector(25, 61440, 59122);
    setVector(26, 61440, 6656);
    for (let i = 0; i < 1024; i++) {
      this.cellTypes[i] = 2;
    }
    this.data[1024] = 248;
    this.data[1025] = 3;
    this.data[1026] = 248;
    this.data[1027] = 2;
    this.data[1032] = 120;
    this.data[1033] = 3;
    this.data[1040] = 33;
    this.data[1041] = 0;
    this.data[1043] = 128;
    this.data[1044] = 2;
    this.data[1047] = 0;
    this.data[1050] = 30;
    this.data[1051] = 0;
    this.data[1052] = 30;
    this.data[1053] = 0;
    this.data[1097] = 3;
    this.data[1098] = 80;
    this.data[1099] = 0;
    this.data[1100] = 0;
    this.data[1101] = 16;
    this.data[1123] = 212;
    this.data[1124] = 3;
    for (let i = 1024; i < 1280; i++) {
      this.cellTypes[i] = 2;
    }
    for (let i = 0; i < 2e3; i++) {
      const vramPhys = 753664 + i * 2;
      this.data[vramPhys] = 32;
      this.data[vramPhys + 1] = 7;
      this.cellTypes[vramPhys] = 2;
      this.cellTypes[vramPhys + 1] = 2;
    }
    const vramBanner = [
      { text: "IBM PC 5150 / 8086 CPU 4.77 MHz - BIOS v1.0", attr: 15, row: 0 },
      { text: "640 KB Base Memory OK  |  BDA 0040h  |  VRAM 0xB800h (80x25 Metin)", attr: 7, row: 1 },
      { text: "----------------------------------------------------------------", attr: 8, row: 2 }
    ];
    for (const line of vramBanner) {
      for (let c = 0; c < line.text.length; c++) {
        const offset = 753664 + (line.row * 80 + c) * 2;
        this.data[offset] = line.text.charCodeAt(c);
        this.data[offset + 1] = line.attr;
      }
    }
    this.data[1104] = 0;
    this.data[1105] = 4;
    const banner = "IBM COMPATIBLE 8086 ROM BIOS (C) 1981 INTEL / IBM CORPORATION";
    for (let i = 0; i < banner.length; i++) {
      this.data[983040 + i] = banner.charCodeAt(i);
      this.cellTypes[983040 + i] = 2;
    }
    const handlerOffsets = [
      987136,
      987232,
      987248,
      987253,
      987258,
      987262,
      987264,
      987280,
      987392,
      987648,
      987904,
      988160,
      988416,
      988672,
      988928,
      1042162
    ];
    for (const h of handlerOffsets) {
      this.data[h] = 207;
      this.cellTypes[h] = 1;
    }
    const releaseDate = "01/01/81";
    for (let i = 0; i < releaseDate.length; i++) {
      this.data[1048565 + i] = releaseDate.charCodeAt(i);
      this.cellTypes[1048565 + i] = 2;
    }
    this.data[1048560] = 234;
    this.data[1048561] = 91;
    this.data[1048562] = 224;
    this.data[1048563] = 0;
    this.data[1048564] = 240;
    for (let i = 0; i < 5; i++) {
      this.cellTypes[1048560 + i] = 1;
    }
    this.data[1048574] = 255;
    this.cellTypes[1048574] = 2;
  }
  clearAccessLogs() {
    this.lastReads.clear();
    this.lastWrites.clear();
    this.lastWriteOldValues.clear();
  }
  // 20-bit physical address calculation with wrap-around
  toPhys(seg, off) {
    if (seg === 0 && off >= 65536) {
      return off & 1048575;
    }
    return ((seg & 65535) << 4) + (off & 65535) & 1048575;
  }
  readByte(seg, off, track = true) {
    const phys = this.toPhys(seg, off);
    if (track) this.lastReads.add(phys);
    return this.data[phys];
  }
  writeByte(seg, off, val, track = true) {
    const phys = this.toPhys(seg, off);
    const oldVal = this.data[phys];
    const newVal = val & 255;
    if (track && !this.lastWriteOldValues.has(phys)) {
      this.lastWriteOldValues.set(phys, oldVal);
    }
    this.data[phys] = newVal;
    if (track) this.lastWrites.add(phys);
    if (phys >= 753664 && phys < 761856) {
      this.onVramWrite?.(phys - 753664, newVal);
    } else if (phys >= 655360 && phys < 720896) {
      this.data[1097] = 19;
      this.onVramWrite?.(phys, newVal);
    }
    return oldVal;
  }
  // Direct physical byte write (used by stepBack and low-level subsystem)
  writePhys(phys, val) {
    const p = phys & 1048575;
    this.data[p] = val & 255;
    if (p >= 753664 && p < 761856) {
      this.onVramWrite?.(p - 753664, val & 255);
    } else if (p >= 655360 && p < 720896) {
      this.data[1097] = 19;
      this.onVramWrite?.(p, val & 255);
    }
  }
  // Word read in little-endian. Note: offset wraps at 0xFFFF within segment!
  readWord(seg, off, track = true) {
    const lowOff = off & 65535;
    const highOff = off + 1 & 65535;
    const low = this.readByte(seg, lowOff, track);
    const high = this.readByte(seg, highOff, track);
    return high << 8 | low;
  }
  // Word write in little-endian. Offset wraps at 0xFFFF within segment.
  writeWord(seg, off, val, track = true) {
    const lowOff = off & 65535;
    const highOff = off + 1 & 65535;
    this.writeByte(seg, lowOff, val & 255, track);
    this.writeByte(seg, highOff, val >> 8 & 255, track);
  }
  getCellType(phys) {
    const t = this.cellTypes[phys & 1048575];
    if (t === 1) return "code";
    if (t === 2) return "data";
    if (t === 3) return "stack";
    return "uninit";
  }
  setCellType(phys, type) {
    const p = phys & 1048575;
    let code = 0;
    if (type === "code") code = 1;
    else if (type === "data") code = 2;
    else if (type === "stack") code = 3;
    this.cellTypes[p] = code;
  }
  loadBytes(seg, off, bytes, type = "code") {
    let currOff = off & 65535;
    for (let i = 0; i < bytes.length; i++) {
      const phys = this.toPhys(seg, currOff);
      this.data[phys] = bytes[i];
      this.setCellType(phys, type);
      currOff = currOff + 1 & 65535;
    }
  }
};

// src/cpu/registers.ts
var Registers = class {
  // 16-bit registers (all initialized to 0000h)
  ax = 0;
  bx = 0;
  cx = 0;
  dx = 0;
  si = 0;
  di = 0;
  bp = 0;
  sp = 0;
  ip = 0;
  cs = 0;
  ds = 0;
  es = 0;
  ss = 0;
  // 8-bit getters & setters
  get al() {
    return this.ax & 255;
  }
  set al(val) {
    this.ax = this.ax & 65280 | val & 255;
  }
  get ah() {
    return this.ax >> 8 & 255;
  }
  set ah(val) {
    this.ax = (val & 255) << 8 | this.ax & 255;
  }
  get bl() {
    return this.bx & 255;
  }
  set bl(val) {
    this.bx = this.bx & 65280 | val & 255;
  }
  get bh() {
    return this.bx >> 8 & 255;
  }
  set bh(val) {
    this.bx = (val & 255) << 8 | this.bx & 255;
  }
  get cl() {
    return this.cx & 255;
  }
  set cl(val) {
    this.cx = this.cx & 65280 | val & 255;
  }
  get ch() {
    return this.cx >> 8 & 255;
  }
  set ch(val) {
    this.cx = (val & 255) << 8 | this.cx & 255;
  }
  get dl() {
    return this.dx & 255;
  }
  set dl(val) {
    this.dx = this.dx & 65280 | val & 255;
  }
  get dh() {
    return this.dx >> 8 & 255;
  }
  set dh(val) {
    this.dx = (val & 255) << 8 | this.dx & 255;
  }
  resetCOM() {
    this.ax = 0;
    this.bx = 0;
    this.cx = 0;
    this.dx = 0;
    this.si = 0;
    this.di = 0;
    this.bp = 0;
    this.sp = 0;
    this.ip = 0;
    this.cs = 0;
    this.ds = 0;
    this.es = 0;
    this.ss = 0;
  }
  // 8086 standard reg index (0..7) for w=1 (16-bit)
  getReg16ByIndex(index) {
    switch (index & 7) {
      case 0:
        return this.ax;
      case 1:
        return this.cx;
      case 2:
        return this.dx;
      case 3:
        return this.bx;
      case 4:
        return this.sp;
      case 5:
        return this.bp;
      case 6:
        return this.si;
      case 7:
        return this.di;
      default:
        return 0;
    }
  }
  setReg16ByIndex(index, val) {
    const v = val & 65535;
    switch (index & 7) {
      case 0:
        this.ax = v;
        break;
      case 1:
        this.cx = v;
        break;
      case 2:
        this.dx = v;
        break;
      case 3:
        this.bx = v;
        break;
      case 4:
        this.sp = v;
        break;
      case 5:
        this.bp = v;
        break;
      case 6:
        this.si = v;
        break;
      case 7:
        this.di = v;
        break;
    }
  }
  // 8086 standard reg index (0..7) for w=0 (8-bit)
  getReg8ByIndex(index) {
    switch (index & 7) {
      case 0:
        return this.al;
      case 1:
        return this.cl;
      case 2:
        return this.dl;
      case 3:
        return this.bl;
      case 4:
        return this.ah;
      case 5:
        return this.ch;
      case 6:
        return this.dh;
      case 7:
        return this.bh;
      default:
        return 0;
    }
  }
  setReg8ByIndex(index, val) {
    const v = val & 255;
    switch (index & 7) {
      case 0:
        this.al = v;
        break;
      case 1:
        this.cl = v;
        break;
      case 2:
        this.dl = v;
        break;
      case 3:
        this.bl = v;
        break;
      case 4:
        this.ah = v;
        break;
      case 5:
        this.ch = v;
        break;
      case 6:
        this.dh = v;
        break;
      case 7:
        this.bh = v;
        break;
    }
  }
  // Segment register index: 00=ES, 01=CS, 10=SS, 11=DS
  getSegRegByIndex(index) {
    switch (index & 3) {
      case 0:
        return this.es;
      case 1:
        return this.cs;
      case 2:
        return this.ss;
      case 3:
        return this.ds;
      default:
        return 0;
    }
  }
  setSegRegByIndex(index, val) {
    const v = val & 65535;
    switch (index & 3) {
      case 0:
        this.es = v;
        break;
      case 1:
        this.cs = v;
        break;
      case 2:
        this.ss = v;
        break;
      case 3:
        this.ds = v;
        break;
    }
  }
  getByName(name) {
    const u = name.toUpperCase();
    switch (u) {
      case "AX":
        return this.ax;
      case "BX":
        return this.bx;
      case "CX":
        return this.cx;
      case "DX":
        return this.dx;
      case "SI":
        return this.si;
      case "DI":
        return this.di;
      case "BP":
        return this.bp;
      case "SP":
        return this.sp;
      case "IP":
        return this.ip;
      case "CS":
        return this.cs;
      case "DS":
        return this.ds;
      case "ES":
        return this.es;
      case "SS":
        return this.ss;
      case "AL":
        return this.al;
      case "AH":
        return this.ah;
      case "BL":
        return this.bl;
      case "BH":
        return this.bh;
      case "CL":
        return this.cl;
      case "CH":
        return this.ch;
      case "DL":
        return this.dl;
      case "DH":
        return this.dh;
      default:
        throw new Error(`Unknown register: ${name}`);
    }
  }
  setByName(name, val) {
    const u = name.toUpperCase();
    switch (u) {
      case "AX":
        this.ax = val & 65535;
        break;
      case "BX":
        this.bx = val & 65535;
        break;
      case "CX":
        this.cx = val & 65535;
        break;
      case "DX":
        this.dx = val & 65535;
        break;
      case "SI":
        this.si = val & 65535;
        break;
      case "DI":
        this.di = val & 65535;
        break;
      case "BP":
        this.bp = val & 65535;
        break;
      case "SP":
        this.sp = val & 65535;
        break;
      case "IP":
        this.ip = val & 65535;
        break;
      case "CS":
        this.cs = val & 65535;
        break;
      case "DS":
        this.ds = val & 65535;
        break;
      case "ES":
        this.es = val & 65535;
        break;
      case "SS":
        this.ss = val & 65535;
        break;
      case "AL":
        this.al = val & 255;
        break;
      case "AH":
        this.ah = val & 255;
        break;
      case "BL":
        this.bl = val & 255;
        break;
      case "BH":
        this.bh = val & 255;
        break;
      case "CL":
        this.cl = val & 255;
        break;
      case "CH":
        this.ch = val & 255;
        break;
      case "DL":
        this.dl = val & 255;
        break;
      case "DH":
        this.dh = val & 255;
        break;
      default:
        throw new Error(`Unknown register: ${name}`);
    }
  }
  clone() {
    return {
      ax: this.ax,
      bx: this.bx,
      cx: this.cx,
      dx: this.dx,
      si: this.si,
      di: this.di,
      bp: this.bp,
      sp: this.sp,
      ip: this.ip,
      cs: this.cs,
      ds: this.ds,
      es: this.es,
      ss: this.ss
    };
  }
  restore(state) {
    this.ax = state.ax;
    this.bx = state.bx;
    this.cx = state.cx;
    this.dx = state.dx;
    this.si = state.si;
    this.di = state.di;
    this.bp = state.bp;
    this.sp = state.sp;
    this.ip = state.ip;
    this.cs = state.cs;
    this.ds = state.ds;
    this.es = state.es;
    this.ss = state.ss;
  }
};

// src/cpu/flags.ts
var PARITY_TABLE = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let count = 0;
  for (let bit = 0; bit < 8; bit++) {
    if (i >> bit & 1) count++;
  }
  PARITY_TABLE[i] = count % 2 === 0 ? 1 : 0;
}
function computeParity(val) {
  return PARITY_TABLE[val & 255] === 1;
}
var Flags = class {
  cf = false;
  pf = false;
  af = false;
  zf = false;
  sf = false;
  tf = false;
  if = true;
  // By default interrupts enabled
  df = false;
  // 0 = forward (UP), 1 = backward (DOWN)
  of = false;
  reset() {
    this.cf = false;
    this.pf = false;
    this.af = false;
    this.zf = false;
    this.sf = false;
    this.tf = false;
    this.if = true;
    this.df = false;
    this.of = false;
  }
  clone() {
    return {
      cf: this.cf,
      pf: this.pf,
      af: this.af,
      zf: this.zf,
      sf: this.sf,
      tf: this.tf,
      if: this.if,
      df: this.df,
      of: this.of
    };
  }
  restore(state) {
    this.cf = state.cf;
    this.pf = state.pf;
    this.af = state.af;
    this.zf = state.zf;
    this.sf = state.sf;
    this.tf = state.tf;
    this.if = state.if;
    this.df = state.df;
    this.of = state.of;
  }
  // Packs lower 8 bits of flags for LAHF: SF:ZF:0:AF:0:PF:1:CF
  toLowByte() {
    let b = 2;
    if (this.cf) b |= 1 << 0;
    if (this.pf) b |= 1 << 2;
    if (this.af) b |= 1 << 4;
    if (this.zf) b |= 1 << 6;
    if (this.sf) b |= 1 << 7;
    return b;
  }
  // Unpacks lower 8 bits of flags from AH for SAHF
  fromLowByte(b) {
    this.cf = (b & 1 << 0) !== 0;
    this.pf = (b & 1 << 2) !== 0;
    this.af = (b & 1 << 4) !== 0;
    this.zf = (b & 1 << 6) !== 0;
    this.sf = (b & 1 << 7) !== 0;
  }
  // Packs flags into a 16-bit word (for PUSHF / IRET)
  toWord() {
    let w = 61442;
    if (this.cf) w |= 1 << 0;
    if (this.pf) w |= 1 << 2;
    if (this.af) w |= 1 << 4;
    if (this.zf) w |= 1 << 6;
    if (this.sf) w |= 1 << 7;
    if (this.tf) w |= 1 << 8;
    if (this.if) w |= 1 << 9;
    if (this.df) w |= 1 << 10;
    if (this.of) w |= 1 << 11;
    return w;
  }
  // Unpacks flags from a 16-bit word (for POPF)
  fromWord(w) {
    this.cf = (w & 1 << 0) !== 0;
    this.pf = (w & 1 << 2) !== 0;
    this.af = (w & 1 << 4) !== 0;
    this.zf = (w & 1 << 6) !== 0;
    this.sf = (w & 1 << 7) !== 0;
    this.tf = (w & 1 << 8) !== 0;
    this.if = (w & 1 << 9) !== 0;
    this.df = (w & 1 << 10) !== 0;
    this.of = (w & 1 << 11) !== 0;
  }
  // Updates flags for ADD / ADC: dest = a + b (+ carry)
  updateAdd(a, b, res, is16bit, cIn = 0) {
    const mask = is16bit ? 65535 : 255;
    const signBit = is16bit ? 32768 : 128;
    const fullRes = a + b + cIn;
    this.cf = fullRes > mask;
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 255] === 1;
    this.af = (a & 15) + (b & 15) + cIn > 15;
    const signA = (a & signBit) !== 0;
    const signB = (b & signBit) !== 0;
    const signRes = (res & signBit) !== 0;
    this.of = signA === signB && signA !== signRes;
  }
  // Updates flags for SUB / SBB / CMP: dest = a - b (- borrow)
  updateSub(a, b, res, is16bit, bIn = 0) {
    const mask = is16bit ? 65535 : 255;
    const signBit = is16bit ? 32768 : 128;
    const fullDiff = a - b - bIn;
    this.cf = fullDiff < 0;
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 255] === 1;
    this.af = (a & 15) - (b & 15) - bIn < 0;
    const signA = (a & signBit) !== 0;
    const signB = (b & signBit) !== 0;
    const signRes = (res & signBit) !== 0;
    this.of = signA !== signB && signA !== signRes;
  }
  // INC updates all flags except CF!
  updateInc(a, res, is16bit) {
    const mask = is16bit ? 65535 : 255;
    const signBit = is16bit ? 32768 : 128;
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 255] === 1;
    this.af = (a & 15) === 15;
    this.of = is16bit ? a === 32767 : a === 127;
  }
  // DEC updates all flags except CF!
  updateDec(a, res, is16bit) {
    const mask = is16bit ? 65535 : 255;
    const signBit = is16bit ? 32768 : 128;
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 255] === 1;
    this.af = (a & 15) === 0;
    this.of = is16bit ? a === 32768 : a === 128;
  }
  // Updates flags for AND, OR, XOR, TEST: CF=0, OF=0, AF=0/undefined, SF, ZF, PF updated
  updateLogic(res, is16bit) {
    const mask = is16bit ? 65535 : 255;
    const signBit = is16bit ? 32768 : 128;
    this.cf = false;
    this.of = false;
    this.af = false;
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 255] === 1;
  }
  // Updates flags for NEG: dest = 0 - a
  updateNeg(a, res, is16bit) {
    const mask = is16bit ? 65535 : 255;
    this.cf = (a & mask) !== 0;
    this.updateSub(0, a, res, is16bit, 0);
  }
};

// src/cpu/decoder.ts
var Decoder = class {
  static decodeModRM(mem, regs, seg, ip, segmentOverride) {
    const modrmByte = mem.readByte(seg, ip, true);
    const mod = modrmByte >> 6 & 3;
    const reg = modrmByte >> 3 & 7;
    const rm = modrmByte & 7;
    let bytesRead = 1;
    let isReg = mod === 3;
    let baseSegment = "DS";
    let offset = 0;
    if (isReg) {
      return { mod, reg, rm, isReg: true, baseSegment: "DS", offset: 0, bytesRead: 1 };
    }
    let disp = 0;
    if (mod === 0) {
      if (rm === 6) {
        const low = mem.readByte(seg, ip + bytesRead & 65535, true);
        const high = mem.readByte(seg, ip + bytesRead + 1 & 65535, true);
        disp = high << 8 | low;
        bytesRead += 2;
        baseSegment = "DS";
        offset = disp;
        return {
          mod,
          reg,
          rm,
          isReg: false,
          baseSegment: segmentOverride || baseSegment,
          offset: offset & 65535,
          bytesRead
        };
      }
    } else if (mod === 1) {
      const raw = mem.readByte(seg, ip + bytesRead & 65535, true);
      disp = raw & 128 ? raw - 256 : raw;
      bytesRead += 1;
    } else if (mod === 2) {
      const low = mem.readByte(seg, ip + bytesRead & 65535, true);
      const high = mem.readByte(seg, ip + bytesRead + 1 & 65535, true);
      disp = high << 8 | low;
      bytesRead += 2;
    }
    let base = 0;
    switch (rm) {
      case 0:
        base = regs.bx + regs.si & 65535;
        baseSegment = "DS";
        break;
      case 1:
        base = regs.bx + regs.di & 65535;
        baseSegment = "DS";
        break;
      case 2:
        base = regs.bp + regs.si & 65535;
        baseSegment = "SS";
        break;
      case 3:
        base = regs.bp + regs.di & 65535;
        baseSegment = "SS";
        break;
      case 4:
        base = regs.si;
        baseSegment = "DS";
        break;
      case 5:
        base = regs.di;
        baseSegment = "DS";
        break;
      case 6:
        base = regs.bp;
        baseSegment = "SS";
        break;
      case 7:
        base = regs.bx;
        baseSegment = "DS";
        break;
    }
    offset = base + disp & 65535;
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
};

// src/cpu/io.ts
var IOPortManager = class {
  ports = new Uint8Array(65536);
  inputQueue = [];
  // Hardware emulation internal states
  pitCounter = 65535;
  crtcIndex = 0;
  crtcRegisters = new Uint8Array(32);
  cgaStatus = 8;
  onPortWrite;
  onPortRead;
  constructor() {
    this.reset();
  }
  reset() {
    this.ports.fill(0);
    this.inputQueue = [];
    this.pitCounter = 65535;
    this.crtcIndex = 0;
    this.crtcRegisters.fill(0);
    this.cgaStatus = 8;
    this.ports[33] = 252;
    this.ports[96] = 0;
    this.ports[97] = 0;
    this.ports[98] = 45;
    this.ports[100] = 0;
    this.crtcRegisters[14] = 0;
    this.crtcRegisters[15] = 0;
    this.ports[1021] = 96;
  }
  /**
   * Feed characters or bytes from user/terminal into the input queue
   */
  feedInput(data) {
    if (typeof data === "string") {
      for (let i = 0; i < data.length; i++) {
        this.inputQueue.push(data.charCodeAt(i) & 255);
      }
    } else if (Array.isArray(data)) {
      for (const b of data) {
        this.inputQueue.push(b & 255);
      }
    } else {
      this.inputQueue.push(data & 255);
    }
  }
  /**
   * Check if keyboard / input buffer has pending data
   */
  hasInput() {
    return this.inputQueue.length > 0;
  }
  /**
   * Consume next byte from input queue
   */
  popInput() {
    return this.inputQueue.shift();
  }
  /**
   * Peek next byte without consuming
   */
  peekInput() {
    return this.inputQueue[0];
  }
  /**
   * Read 8-bit byte from I/O port
   */
  readByte(port) {
    port = port & 65535;
    let val;
    switch (port) {
      case 32:
        val = this.ports[32];
        break;
      case 33:
        val = this.ports[33];
        break;
      case 64:
        this.pitCounter = this.pitCounter - 1 & 65535;
        val = this.pitCounter & 255;
        break;
      case 66:
        val = this.ports[66];
        break;
      case 96:
        if (this.inputQueue.length > 0) {
          val = this.inputQueue.shift();
        } else {
          val = this.ports[96];
        }
        break;
      case 97:
        val = this.ports[97];
        break;
      case 98:
        val = this.ports[98] || 45;
        break;
      case 981:
        val = this.crtcRegisters[this.crtcIndex & 31] || 0;
        break;
      case 986:
        this.cgaStatus ^= 8;
        val = this.cgaStatus;
        break;
      case 1021:
        val = 96;
        break;
      default:
        val = this.ports[port];
        break;
    }
    this.onPortRead?.(port, val, false);
    return val;
  }
  /**
   * Read 16-bit word from I/O port
   */
  readWord(port) {
    const lo = this.readByte(port);
    const hi = this.readByte(port + 1 & 65535);
    const val = lo | hi << 8;
    this.onPortRead?.(port, val, true);
    return val;
  }
  /**
   * Write 8-bit byte to I/O port
   */
  writeByte(port, val) {
    port = port & 65535;
    val = val & 255;
    this.ports[port] = val;
    switch (port) {
      case 32:
        if (val === 32) {
        }
        break;
      case 980:
        this.crtcIndex = val & 31;
        break;
      case 981:
        this.crtcRegisters[this.crtcIndex & 31] = val;
        break;
    }
    this.onPortWrite?.(port, val, false);
  }
  /**
   * Write 16-bit word to I/O port
   */
  writeWord(port, val) {
    port = port & 65535;
    val = val & 65535;
    this.writeByte(port, val & 255);
    this.writeByte(port + 1 & 65535, val >> 8 & 255);
    this.onPortWrite?.(port, val, true);
  }
  /**
   * Gets current hardware cursor position from CRTC registers 14 and 15
   */
  getCrtcCursorOffset() {
    return this.crtcRegisters[14] << 8 | this.crtcRegisters[15];
  }
  /**
   * Sets CRTC cursor registers 14 and 15
   */
  setCrtcCursorOffset(offset) {
    this.crtcRegisters[14] = offset >> 8 & 255;
    this.crtcRegisters[15] = offset & 255;
  }
};

// src/cpu/executor.ts
var Executor = class {
  mem;
  regs;
  flags;
  io;
  callDepth = 0;
  constructor(mem, regs, flags, io) {
    this.mem = mem;
    this.regs = regs;
    this.flags = flags;
    this.io = io || new IOPortManager();
  }
  reset() {
    this.callDepth = 0;
  }
  // Helper to read operand value from ModRM (8-bit)
  readRM8(modrm) {
    if (modrm.isReg) {
      return this.regs.getReg8ByIndex(modrm.rm);
    }
    const segVal = this.regs.getByName(modrm.baseSegment);
    return this.mem.readByte(segVal, modrm.offset, true);
  }
  // Helper to write operand value to ModRM (8-bit)
  writeRM8(modrm, val) {
    if (modrm.isReg) {
      this.regs.setReg8ByIndex(modrm.rm, val);
    } else {
      const segVal = this.regs.getByName(modrm.baseSegment);
      this.mem.writeByte(segVal, modrm.offset, val, true);
    }
  }
  // Helper to read operand value from ModRM (16-bit)
  readRM16(modrm) {
    if (modrm.isReg) {
      return this.regs.getReg16ByIndex(modrm.rm);
    }
    const segVal = this.regs.getByName(modrm.baseSegment);
    return this.mem.readWord(segVal, modrm.offset, true);
  }
  // Helper to write operand value to ModRM (16-bit)
  writeRM16(modrm, val) {
    if (modrm.isReg) {
      this.regs.setReg16ByIndex(modrm.rm, val);
    } else {
      const segVal = this.regs.getByName(modrm.baseSegment);
      this.mem.writeWord(segVal, modrm.offset, val, true);
    }
  }
  // Stack push helper
  push(val16) {
    this.regs.sp = this.regs.sp - 2 & 65535;
    this.mem.writeWord(this.regs.ss, this.regs.sp, val16, true);
  }
  // Stack pop helper
  pop() {
    const val = this.mem.readWord(this.regs.ss, this.regs.sp, true);
    this.regs.sp = this.regs.sp + 2 & 65535;
    return val;
  }
  // Executes one instruction at CS:IP
  executeStep() {
    const cs = this.regs.cs;
    const initialIp = this.regs.ip;
    let currIp = initialIp;
    let segOverride;
    let repPrefix;
    let opcode = this.mem.readByte(cs, currIp, true);
    currIp = currIp + 1 & 65535;
    while (true) {
      if (opcode === 38) {
        segOverride = "ES";
      } else if (opcode === 46) {
        segOverride = "CS";
      } else if (opcode === 54) {
        segOverride = "SS";
      } else if (opcode === 62) {
        segOverride = "DS";
      } else if (opcode === 243) {
        repPrefix = "REP";
      } else if (opcode === 242) {
        repPrefix = "REPNZ";
      } else {
        break;
      }
      opcode = this.mem.readByte(cs, currIp, true);
      currIp = currIp + 1 & 65535;
    }
    const fetchByte = () => {
      const b = this.mem.readByte(cs, currIp, true);
      currIp = currIp + 1 & 65535;
      return b;
    };
    const fetchWord = () => {
      const low = fetchByte();
      const high = fetchByte();
      return high << 8 | low;
    };
    const fetchRel8 = () => {
      const b = fetchByte();
      return b & 128 ? b - 256 : b;
    };
    const getModRM = () => {
      const modrm = Decoder.decodeModRM(this.mem, this.regs, cs, currIp, segOverride);
      currIp = currIp + modrm.bytesRead & 65535;
      return modrm;
    };
    let halted = false;
    let waitingForInput = false;
    let consoleText;
    switch (opcode) {
      case 144:
        break;
      case 244:
        halted = true;
        break;
      case 136: {
        const m = getModRM();
        const src = this.regs.getReg8ByIndex(m.reg);
        this.writeRM8(m, src);
        break;
      }
      case 137: {
        const m = getModRM();
        const src = this.regs.getReg16ByIndex(m.reg);
        this.writeRM16(m, src);
        break;
      }
      case 138: {
        const m = getModRM();
        const src = this.readRM8(m);
        this.regs.setReg8ByIndex(m.reg, src);
        break;
      }
      case 139: {
        const m = getModRM();
        const src = this.readRM16(m);
        this.regs.setReg16ByIndex(m.reg, src);
        break;
      }
      case 140: {
        const m = getModRM();
        const sregVal = this.regs.getSegRegByIndex(m.reg & 3);
        this.writeRM16(m, sregVal);
        break;
      }
      case 142: {
        const m = getModRM();
        const val = this.readRM16(m);
        this.regs.setSegRegByIndex(m.reg & 3, val);
        break;
      }
      case 160: {
        const off = fetchWord();
        const s = segOverride || "DS";
        this.regs.al = this.mem.readByte(this.regs.getByName(s), off, true);
        break;
      }
      case 161: {
        const off = fetchWord();
        const s = segOverride || "DS";
        this.regs.ax = this.mem.readWord(this.regs.getByName(s), off, true);
        break;
      }
      case 162: {
        const off = fetchWord();
        const s = segOverride || "DS";
        this.mem.writeByte(this.regs.getByName(s), off, this.regs.al, true);
        break;
      }
      case 163: {
        const off = fetchWord();
        const s = segOverride || "DS";
        this.mem.writeWord(this.regs.getByName(s), off, this.regs.ax, true);
        break;
      }
      case 176:
      case 177:
      case 178:
      case 179:
      case 180:
      case 181:
      case 182:
      case 183: {
        const regIdx = opcode & 7;
        const imm = fetchByte();
        this.regs.setReg8ByIndex(regIdx, imm);
        break;
      }
      case 184:
      case 185:
      case 186:
      case 187:
      case 188:
      case 189:
      case 190:
      case 191: {
        const regIdx = opcode & 7;
        const imm = fetchWord();
        this.regs.setReg16ByIndex(regIdx, imm);
        break;
      }
      case 198: {
        const m = getModRM();
        const imm = fetchByte();
        if (m.reg === 0) {
          this.writeRM8(m, imm);
        } else {
          return { halted: true, error: `Invalid opcode extension C6 /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 199: {
        const m = getModRM();
        const imm = fetchWord();
        if (m.reg === 0) {
          this.writeRM16(m, imm);
        } else {
          return { halted: true, error: `Invalid opcode extension C7 /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 141: {
        const m = getModRM();
        if (m.isReg) {
          return { halted: true, error: `LEA with register operand is invalid @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        this.regs.setReg16ByIndex(m.reg, m.offset);
        break;
      }
      case 0: {
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const res = a + b & 255;
        this.flags.updateAdd(a, b, res, false);
        this.writeRM8(m, res);
        break;
      }
      case 1: {
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const res = a + b & 65535;
        this.flags.updateAdd(a, b, res, true);
        this.writeRM16(m, res);
        break;
      }
      case 2: {
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const res = a + b & 255;
        this.flags.updateAdd(a, b, res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 3: {
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const res = a + b & 65535;
        this.flags.updateAdd(a, b, res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 4: {
        const a = this.regs.al;
        const b = fetchByte();
        const res = a + b & 255;
        this.flags.updateAdd(a, b, res, false);
        this.regs.al = res;
        break;
      }
      case 5: {
        const a = this.regs.ax;
        const b = fetchWord();
        const res = a + b & 65535;
        this.flags.updateAdd(a, b, res, true);
        this.regs.ax = res;
        break;
      }
      case 16: {
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const cIn = this.flags.cf ? 1 : 0;
        const res = a + b + cIn & 255;
        this.flags.updateAdd(a, b, res, false, cIn);
        this.writeRM8(m, res);
        break;
      }
      case 17: {
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const cIn = this.flags.cf ? 1 : 0;
        const res = a + b + cIn & 65535;
        this.flags.updateAdd(a, b, res, true, cIn);
        this.writeRM16(m, res);
        break;
      }
      case 18: {
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const cIn = this.flags.cf ? 1 : 0;
        const res = a + b + cIn & 255;
        this.flags.updateAdd(a, b, res, false, cIn);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 19: {
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const cIn = this.flags.cf ? 1 : 0;
        const res = a + b + cIn & 65535;
        this.flags.updateAdd(a, b, res, true, cIn);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 20: {
        const a = this.regs.al;
        const b = fetchByte();
        const cIn = this.flags.cf ? 1 : 0;
        const res = a + b + cIn & 255;
        this.flags.updateAdd(a, b, res, false, cIn);
        this.regs.al = res;
        break;
      }
      case 21: {
        const a = this.regs.ax;
        const b = fetchWord();
        const cIn = this.flags.cf ? 1 : 0;
        const res = a + b + cIn & 65535;
        this.flags.updateAdd(a, b, res, true, cIn);
        this.regs.ax = res;
        break;
      }
      case 40: {
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const res = a - b & 255;
        this.flags.updateSub(a, b, res, false);
        this.writeRM8(m, res);
        break;
      }
      case 41: {
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const res = a - b & 65535;
        this.flags.updateSub(a, b, res, true);
        this.writeRM16(m, res);
        break;
      }
      case 42: {
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const res = a - b & 255;
        this.flags.updateSub(a, b, res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 43: {
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const res = a - b & 65535;
        this.flags.updateSub(a, b, res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 44: {
        const a = this.regs.al;
        const b = fetchByte();
        const res = a - b & 255;
        this.flags.updateSub(a, b, res, false);
        this.regs.al = res;
        break;
      }
      case 45: {
        const a = this.regs.ax;
        const b = fetchWord();
        const res = a - b & 65535;
        this.flags.updateSub(a, b, res, true);
        this.regs.ax = res;
        break;
      }
      case 24: {
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const bIn = this.flags.cf ? 1 : 0;
        const res = a - b - bIn & 255;
        this.flags.updateSub(a, b, res, false, bIn);
        this.writeRM8(m, res);
        break;
      }
      case 25: {
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const bIn = this.flags.cf ? 1 : 0;
        const res = a - b - bIn & 65535;
        this.flags.updateSub(a, b, res, true, bIn);
        this.writeRM16(m, res);
        break;
      }
      case 26: {
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const bIn = this.flags.cf ? 1 : 0;
        const res = a - b - bIn & 255;
        this.flags.updateSub(a, b, res, false, bIn);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 27: {
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const bIn = this.flags.cf ? 1 : 0;
        const res = a - b - bIn & 65535;
        this.flags.updateSub(a, b, res, true, bIn);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 28: {
        const a = this.regs.al;
        const b = fetchByte();
        const bIn = this.flags.cf ? 1 : 0;
        const res = a - b - bIn & 255;
        this.flags.updateSub(a, b, res, false, bIn);
        this.regs.al = res;
        break;
      }
      case 29: {
        const a = this.regs.ax;
        const b = fetchWord();
        const bIn = this.flags.cf ? 1 : 0;
        const res = a - b - bIn & 65535;
        this.flags.updateSub(a, b, res, true, bIn);
        this.regs.ax = res;
        break;
      }
      case 56: {
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        const res = a - b & 255;
        this.flags.updateSub(a, b, res, false);
        break;
      }
      case 57: {
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        const res = a - b & 65535;
        this.flags.updateSub(a, b, res, true);
        break;
      }
      case 58: {
        const m = getModRM();
        const a = this.regs.getReg8ByIndex(m.reg);
        const b = this.readRM8(m);
        const res = a - b & 255;
        this.flags.updateSub(a, b, res, false);
        break;
      }
      case 59: {
        const m = getModRM();
        const a = this.regs.getReg16ByIndex(m.reg);
        const b = this.readRM16(m);
        const res = a - b & 65535;
        this.flags.updateSub(a, b, res, true);
        break;
      }
      case 60: {
        const a = this.regs.al;
        const b = fetchByte();
        const res = a - b & 255;
        this.flags.updateSub(a, b, res, false);
        break;
      }
      case 61: {
        const a = this.regs.ax;
        const b = fetchWord();
        const res = a - b & 65535;
        this.flags.updateSub(a, b, res, true);
        break;
      }
      case 128:
      case 129:
      case 130:
      case 131: {
        const m = getModRM();
        const is16 = opcode === 129 || opcode === 131;
        let imm = 0;
        if (opcode === 128 || opcode === 130) {
          imm = fetchByte();
        } else if (opcode === 129) {
          imm = fetchWord();
        } else {
          const b = fetchByte();
          imm = b & 128 ? b | 65280 : b;
        }
        const a = is16 ? this.readRM16(m) : this.readRM8(m);
        let res = 0;
        switch (m.reg) {
          case 0:
            res = is16 ? a + imm & 65535 : a + imm & 255;
            this.flags.updateAdd(a, imm, res, is16);
            if (is16) this.writeRM16(m, res);
            else this.writeRM8(m, res);
            break;
          case 1:
            res = a | imm;
            this.flags.updateLogic(res, is16);
            if (is16) this.writeRM16(m, res);
            else this.writeRM8(m, res);
            break;
          case 2: {
            const cIn = this.flags.cf ? 1 : 0;
            res = is16 ? a + imm + cIn & 65535 : a + imm + cIn & 255;
            this.flags.updateAdd(a, imm, res, is16, cIn);
            if (is16) this.writeRM16(m, res);
            else this.writeRM8(m, res);
            break;
          }
          case 3: {
            const bIn = this.flags.cf ? 1 : 0;
            res = is16 ? a - imm - bIn & 65535 : a - imm - bIn & 255;
            this.flags.updateSub(a, imm, res, is16, bIn);
            if (is16) this.writeRM16(m, res);
            else this.writeRM8(m, res);
            break;
          }
          case 4:
            res = a & imm;
            this.flags.updateLogic(res, is16);
            if (is16) this.writeRM16(m, res);
            else this.writeRM8(m, res);
            break;
          case 5:
            res = is16 ? a - imm & 65535 : a - imm & 255;
            this.flags.updateSub(a, imm, res, is16);
            if (is16) this.writeRM16(m, res);
            else this.writeRM8(m, res);
            break;
          case 6:
            res = a ^ imm;
            this.flags.updateLogic(res, is16);
            if (is16) this.writeRM16(m, res);
            else this.writeRM8(m, res);
            break;
          case 7:
            res = is16 ? a - imm & 65535 : a - imm & 255;
            this.flags.updateSub(a, imm, res, is16);
            break;
          default:
            return { halted: true, error: `Unsupported Group 1 op /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 64:
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
      case 70:
      case 71: {
        const regIdx = opcode & 7;
        const a = this.regs.getReg16ByIndex(regIdx);
        const res = a + 1 & 65535;
        this.flags.updateInc(a, res, true);
        this.regs.setReg16ByIndex(regIdx, res);
        break;
      }
      case 72:
      case 73:
      case 74:
      case 75:
      case 76:
      case 77:
      case 78:
      case 79: {
        const regIdx = opcode & 7;
        const a = this.regs.getReg16ByIndex(regIdx);
        const res = a - 1 & 65535;
        this.flags.updateDec(a, res, true);
        this.regs.setReg16ByIndex(regIdx, res);
        break;
      }
      case 254: {
        const m = getModRM();
        const a = this.readRM8(m);
        if (m.reg === 0) {
          const res = a + 1 & 255;
          this.flags.updateInc(a, res, false);
          this.writeRM8(m, res);
        } else if (m.reg === 1) {
          const res = a - 1 & 255;
          this.flags.updateDec(a, res, false);
          this.writeRM8(m, res);
        } else {
          return { halted: true, error: `Unsupported FE /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 255: {
        const m = getModRM();
        if (m.reg === 0) {
          const a = this.readRM16(m);
          const res = a + 1 & 65535;
          this.flags.updateInc(a, res, true);
          this.writeRM16(m, res);
        } else if (m.reg === 1) {
          const a = this.readRM16(m);
          const res = a - 1 & 65535;
          this.flags.updateDec(a, res, true);
          this.writeRM16(m, res);
        } else if (m.reg === 2) {
          const target = this.readRM16(m);
          this.callDepth++;
          this.push(currIp);
          currIp = target;
        } else if (m.reg === 4) {
          const target = this.readRM16(m);
          currIp = target;
        } else if (m.reg === 6) {
          const val = this.readRM16(m);
          this.push(val);
        } else {
          return { halted: true, error: `Unsupported FF /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 235: {
        const rel = fetchRel8();
        currIp = currIp + rel & 65535;
        break;
      }
      case 233: {
        const rel = fetchWord();
        const signedRel = rel & 32768 ? rel - 65536 : rel;
        currIp = currIp + signedRel & 65535;
        break;
      }
      case 112: {
        const rel = fetchRel8();
        if (this.flags.of) currIp = currIp + rel & 65535;
        break;
      }
      case 113: {
        const rel = fetchRel8();
        if (!this.flags.of) currIp = currIp + rel & 65535;
        break;
      }
      case 114: {
        const rel = fetchRel8();
        if (this.flags.cf) currIp = currIp + rel & 65535;
        break;
      }
      case 115: {
        const rel = fetchRel8();
        if (!this.flags.cf) currIp = currIp + rel & 65535;
        break;
      }
      case 116: {
        const rel = fetchRel8();
        if (this.flags.zf) currIp = currIp + rel & 65535;
        break;
      }
      case 117: {
        const rel = fetchRel8();
        if (!this.flags.zf) currIp = currIp + rel & 65535;
        break;
      }
      case 118: {
        const rel = fetchRel8();
        if (this.flags.cf || this.flags.zf) currIp = currIp + rel & 65535;
        break;
      }
      case 119: {
        const rel = fetchRel8();
        if (!this.flags.cf && !this.flags.zf) currIp = currIp + rel & 65535;
        break;
      }
      case 120: {
        const rel = fetchRel8();
        if (this.flags.sf) currIp = currIp + rel & 65535;
        break;
      }
      case 121: {
        const rel = fetchRel8();
        if (!this.flags.sf) currIp = currIp + rel & 65535;
        break;
      }
      case 122: {
        const rel = fetchRel8();
        if (this.flags.pf) currIp = currIp + rel & 65535;
        break;
      }
      case 123: {
        const rel = fetchRel8();
        if (!this.flags.pf) currIp = currIp + rel & 65535;
        break;
      }
      case 124: {
        const rel = fetchRel8();
        if (this.flags.sf !== this.flags.of) currIp = currIp + rel & 65535;
        break;
      }
      case 125: {
        const rel = fetchRel8();
        if (this.flags.sf === this.flags.of) currIp = currIp + rel & 65535;
        break;
      }
      case 126: {
        const rel = fetchRel8();
        if (this.flags.zf || this.flags.sf !== this.flags.of) currIp = currIp + rel & 65535;
        break;
      }
      case 127: {
        const rel = fetchRel8();
        if (!this.flags.zf && this.flags.sf === this.flags.of) currIp = currIp + rel & 65535;
        break;
      }
      case 227: {
        const rel = fetchRel8();
        if (this.regs.cx === 0) currIp = currIp + rel & 65535;
        break;
      }
      case 224: {
        const rel = fetchRel8();
        this.regs.cx = this.regs.cx - 1 & 65535;
        if (this.regs.cx !== 0 && !this.flags.zf) {
          currIp = currIp + rel & 65535;
        }
        break;
      }
      case 225: {
        const rel = fetchRel8();
        this.regs.cx = this.regs.cx - 1 & 65535;
        if (this.regs.cx !== 0 && this.flags.zf) {
          currIp = currIp + rel & 65535;
        }
        break;
      }
      case 226: {
        const rel = fetchRel8();
        this.regs.cx = this.regs.cx - 1 & 65535;
        if (this.regs.cx !== 0) {
          currIp = currIp + rel & 65535;
        }
        break;
      }
      case 32: {
        const m = getModRM();
        const res = this.readRM8(m) & this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        this.writeRM8(m, res);
        break;
      }
      case 33: {
        const m = getModRM();
        const res = this.readRM16(m) & this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        this.writeRM16(m, res);
        break;
      }
      case 34: {
        const m = getModRM();
        const res = this.regs.getReg8ByIndex(m.reg) & this.readRM8(m);
        this.flags.updateLogic(res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 35: {
        const m = getModRM();
        const res = this.regs.getReg16ByIndex(m.reg) & this.readRM16(m);
        this.flags.updateLogic(res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 36: {
        const res = this.regs.al & fetchByte();
        this.flags.updateLogic(res, false);
        this.regs.al = res;
        break;
      }
      case 37: {
        const res = this.regs.ax & fetchWord();
        this.flags.updateLogic(res, true);
        this.regs.ax = res;
        break;
      }
      case 8: {
        const m = getModRM();
        const res = this.readRM8(m) | this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        this.writeRM8(m, res);
        break;
      }
      case 9: {
        const m = getModRM();
        const res = this.readRM16(m) | this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        this.writeRM16(m, res);
        break;
      }
      case 10: {
        const m = getModRM();
        const res = this.regs.getReg8ByIndex(m.reg) | this.readRM8(m);
        this.flags.updateLogic(res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 11: {
        const m = getModRM();
        const res = this.regs.getReg16ByIndex(m.reg) | this.readRM16(m);
        this.flags.updateLogic(res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 12: {
        const res = this.regs.al | fetchByte();
        this.flags.updateLogic(res, false);
        this.regs.al = res;
        break;
      }
      case 13: {
        const res = this.regs.ax | fetchWord();
        this.flags.updateLogic(res, true);
        this.regs.ax = res;
        break;
      }
      case 48: {
        const m = getModRM();
        const res = this.readRM8(m) ^ this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        this.writeRM8(m, res);
        break;
      }
      case 49: {
        const m = getModRM();
        const res = this.readRM16(m) ^ this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        this.writeRM16(m, res);
        break;
      }
      case 50: {
        const m = getModRM();
        const res = this.regs.getReg8ByIndex(m.reg) ^ this.readRM8(m);
        this.flags.updateLogic(res, false);
        this.regs.setReg8ByIndex(m.reg, res);
        break;
      }
      case 51: {
        const m = getModRM();
        const res = this.regs.getReg16ByIndex(m.reg) ^ this.readRM16(m);
        this.flags.updateLogic(res, true);
        this.regs.setReg16ByIndex(m.reg, res);
        break;
      }
      case 52: {
        const res = this.regs.al ^ fetchByte();
        this.flags.updateLogic(res, false);
        this.regs.al = res;
        break;
      }
      case 53: {
        const res = this.regs.ax ^ fetchWord();
        this.flags.updateLogic(res, true);
        this.regs.ax = res;
        break;
      }
      case 132: {
        const m = getModRM();
        const res = this.readRM8(m) & this.regs.getReg8ByIndex(m.reg);
        this.flags.updateLogic(res, false);
        break;
      }
      case 133: {
        const m = getModRM();
        const res = this.readRM16(m) & this.regs.getReg16ByIndex(m.reg);
        this.flags.updateLogic(res, true);
        break;
      }
      case 168: {
        const res = this.regs.al & fetchByte();
        this.flags.updateLogic(res, false);
        break;
      }
      case 169: {
        const res = this.regs.ax & fetchWord();
        this.flags.updateLogic(res, true);
        break;
      }
      case 246: {
        const m = getModRM();
        const a = this.readRM8(m);
        if (m.reg === 0) {
          const imm = fetchByte();
          this.flags.updateLogic(a & imm, false);
        } else if (m.reg === 2) {
          this.writeRM8(m, ~a & 255);
        } else if (m.reg === 3) {
          const res = -a & 255;
          this.flags.updateNeg(a, res, false);
          this.writeRM8(m, res);
        } else if (m.reg === 4) {
          const prod = this.regs.al * a;
          this.regs.ax = prod & 65535;
          const carry = (this.regs.ax & 65280) !== 0;
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 5) {
          const s1 = this.regs.al & 128 ? this.regs.al - 256 : this.regs.al;
          const s2 = a & 128 ? a - 256 : a;
          const prod = s1 * s2;
          this.regs.ax = prod & 65535;
          const carry = prod < -128 || prod > 127;
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 6) {
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          const quot = Math.floor(this.regs.ax / a);
          const rem = this.regs.ax % a;
          if (quot > 255) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.al = quot & 255;
          this.regs.ah = rem & 255;
        } else if (m.reg === 7) {
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          const num = this.regs.ax & 32768 ? this.regs.ax - 65536 : this.regs.ax;
          const den = a & 128 ? a - 256 : a;
          const quot = Math.trunc(num / den);
          const rem = num % den;
          if (quot < -128 || quot > 127) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.al = quot & 255;
          this.regs.ah = rem & 255;
        } else {
          return { halted: true, error: `Unsupported F6 /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 247: {
        const m = getModRM();
        const a = this.readRM16(m);
        if (m.reg === 0) {
          const imm = fetchWord();
          this.flags.updateLogic(a & imm, true);
        } else if (m.reg === 2) {
          this.writeRM16(m, ~a & 65535);
        } else if (m.reg === 3) {
          const res = -a & 65535;
          this.flags.updateNeg(a, res, true);
          this.writeRM16(m, res);
        } else if (m.reg === 4) {
          const prod = this.regs.ax * a;
          this.regs.ax = prod & 65535;
          this.regs.dx = Math.floor(prod / 65536) & 65535;
          const carry = this.regs.dx !== 0;
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 5) {
          const s1 = this.regs.ax & 32768 ? this.regs.ax - 65536 : this.regs.ax;
          const s2 = a & 32768 ? a - 65536 : a;
          const prod = s1 * s2;
          this.regs.ax = prod & 65535;
          this.regs.dx = Math.floor(prod / 65536) & 65535;
          const carry = prod < -32768 || prod > 32767;
          this.flags.cf = carry;
          this.flags.of = carry;
        } else if (m.reg === 6) {
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          const num = this.regs.dx * 65536 + this.regs.ax;
          const quot = Math.floor(num / a);
          const rem = num % a;
          if (quot > 65535) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.ax = quot & 65535;
          this.regs.dx = rem & 65535;
        } else if (m.reg === 7) {
          if (a === 0) {
            return { halted: true, error: `Divide by zero @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          let num = this.regs.dx * 65536 + this.regs.ax;
          if (this.regs.dx & 32768) num -= 4294967296;
          const den = a & 32768 ? a - 65536 : a;
          const quot = Math.trunc(num / den);
          const rem = num % den;
          if (quot < -32768 || quot > 32767) {
            return { halted: true, error: `Divide overflow @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
          }
          this.regs.ax = quot & 65535;
          this.regs.dx = rem & 65535;
        } else {
          return { halted: true, error: `Unsupported F7 /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 208:
      case 209:
      case 210:
      case 211: {
        const m = getModRM();
        const is16 = opcode === 209 || opcode === 211;
        const count = opcode === 208 || opcode === 209 ? 1 : this.regs.cl & 31;
        if (count > 0) {
          let val = is16 ? this.readRM16(m) : this.readRM8(m);
          const mask = is16 ? 65535 : 255;
          const signBit = is16 ? 32768 : 128;
          const bitCount = is16 ? 16 : 8;
          for (let i = 0; i < count; i++) {
            switch (m.reg) {
              case 0: {
                const high = val & signBit ? 1 : 0;
                val = (val << 1 | high) & mask;
                this.flags.cf = high === 1;
                if (count === 1) this.flags.of = (val & signBit ? 1 : 0) !== high;
                break;
              }
              case 1: {
                const low = val & 1;
                val = val >> 1 | (low ? signBit : 0);
                this.flags.cf = low === 1;
                if (count === 1) {
                  const high = val & signBit ? 1 : 0;
                  const nextHigh = val & signBit >> 1 ? 1 : 0;
                  this.flags.of = high !== nextHigh;
                }
                break;
              }
              case 2: {
                const high = val & signBit ? 1 : 0;
                val = (val << 1 | (this.flags.cf ? 1 : 0)) & mask;
                this.flags.cf = high === 1;
                if (count === 1) this.flags.of = (val & signBit ? 1 : 0) !== high;
                break;
              }
              case 3: {
                const low = val & 1;
                val = val >> 1 | (this.flags.cf ? signBit : 0);
                this.flags.cf = low === 1;
                if (count === 1) {
                  const high = val & signBit ? 1 : 0;
                  const nextHigh = val & signBit >> 1 ? 1 : 0;
                  this.flags.of = high !== nextHigh;
                }
                break;
              }
              case 4: {
                const high = val & signBit ? 1 : 0;
                val = val << 1 & mask;
                this.flags.cf = high === 1;
                if (count === 1) this.flags.of = (val & signBit ? 1 : 0) !== high;
                break;
              }
              case 5: {
                const low = val & 1;
                const origMsb = (val & signBit) !== 0;
                val = val >> 1;
                this.flags.cf = low === 1;
                if (count === 1) this.flags.of = origMsb;
                break;
              }
              case 7: {
                const low = val & 1;
                const high = val & signBit;
                val = val >> 1 | high;
                this.flags.cf = low === 1;
                if (count === 1) this.flags.of = false;
                break;
              }
              default:
                return { halted: true, error: `Unsupported shift op /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
            }
          }
          if (m.reg === 4 || m.reg === 5 || m.reg === 7) {
            this.flags.zf = val === 0;
            this.flags.sf = (val & signBit) !== 0;
            this.flags.pf = computeParity(val);
          }
          if (is16) this.writeRM16(m, val);
          else this.writeRM8(m, val);
        }
        break;
      }
      case 134: {
        const m = getModRM();
        const a = this.readRM8(m);
        const b = this.regs.getReg8ByIndex(m.reg);
        this.writeRM8(m, b);
        this.regs.setReg8ByIndex(m.reg, a);
        break;
      }
      case 135: {
        const m = getModRM();
        const a = this.readRM16(m);
        const b = this.regs.getReg16ByIndex(m.reg);
        this.writeRM16(m, b);
        this.regs.setReg16ByIndex(m.reg, a);
        break;
      }
      case 145:
      case 146:
      case 147:
      case 148:
      case 149:
      case 150:
      case 151: {
        const regIdx = opcode & 7;
        const tmp = this.regs.ax;
        this.regs.ax = this.regs.getReg16ByIndex(regIdx);
        this.regs.setReg16ByIndex(regIdx, tmp);
        break;
      }
      case 80:
      case 81:
      case 82:
      case 83:
      case 84:
      case 85:
      case 86:
      case 87: {
        const regIdx = opcode & 7;
        this.push(this.regs.getReg16ByIndex(regIdx));
        break;
      }
      case 88:
      case 89:
      case 90:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95: {
        const regIdx = opcode & 7;
        this.regs.setReg16ByIndex(regIdx, this.pop());
        break;
      }
      case 143: {
        const m = getModRM();
        if (m.reg === 0) {
          const val = this.pop();
          this.writeRM16(m, val);
        } else {
          return { halted: true, error: `Unsupported 8F /${m.reg} @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 6:
        this.push(this.regs.es);
        break;
      case 7:
        this.regs.es = this.pop();
        break;
      case 14:
        this.push(this.regs.cs);
        break;
      case 22:
        this.push(this.regs.ss);
        break;
      case 23:
        this.regs.ss = this.pop();
        break;
      case 30:
        this.push(this.regs.ds);
        break;
      case 31:
        this.regs.ds = this.pop();
        break;
      case 96: {
        const oldSp = this.regs.sp;
        this.push(this.regs.ax);
        this.push(this.regs.cx);
        this.push(this.regs.dx);
        this.push(this.regs.bx);
        this.push(oldSp);
        this.push(this.regs.bp);
        this.push(this.regs.si);
        this.push(this.regs.di);
        break;
      }
      case 97: {
        this.regs.di = this.pop();
        this.regs.si = this.pop();
        this.regs.bp = this.pop();
        this.pop();
        this.regs.bx = this.pop();
        this.regs.dx = this.pop();
        this.regs.cx = this.pop();
        this.regs.ax = this.pop();
        break;
      }
      case 156:
        this.push(this.flags.toWord());
        break;
      case 157:
        this.flags.fromWord(this.pop());
        break;
      case 232: {
        const rel = fetchWord();
        const signedRel = rel & 32768 ? rel - 65536 : rel;
        this.callDepth++;
        this.push(currIp);
        currIp = currIp + signedRel & 65535;
        break;
      }
      case 195: {
        if (this.callDepth > 0) {
          this.callDepth--;
          currIp = this.pop();
        } else {
          halted = true;
          currIp = initialIp;
          consoleText = "[Program RET komutuyla ba\u015Far\u0131yla sonland\u0131]";
        }
        break;
      }
      case 194: {
        const imm = fetchWord();
        if (this.callDepth > 0) {
          this.callDepth--;
          currIp = this.pop();
          this.regs.sp = this.regs.sp + imm & 65535;
        } else {
          halted = true;
          currIp = initialIp;
          consoleText = "[Program RET komutuyla ba\u015Far\u0131yla sonland\u0131]";
        }
        break;
      }
      case 207: {
        currIp = this.pop();
        this.regs.cs = this.pop();
        this.flags.fromWord(this.pop());
        break;
      }
      case 248:
        this.flags.cf = false;
        break;
      case 249:
        this.flags.cf = true;
        break;
      case 245:
        this.flags.cf = !this.flags.cf;
        break;
      case 252:
        this.flags.df = false;
        break;
      case 253:
        this.flags.df = true;
        break;
      case 250:
        this.flags.if = false;
        break;
      case 251:
        this.flags.if = true;
        break;
      case 152: {
        this.regs.ah = this.regs.al & 128 ? 255 : 0;
        break;
      }
      case 153: {
        this.regs.dx = this.regs.ax & 32768 ? 65535 : 0;
        break;
      }
      case 159: {
        this.regs.ah = this.flags.toLowByte();
        break;
      }
      case 158: {
        this.flags.fromLowByte(this.regs.ah);
        break;
      }
      case 215: {
        const s = segOverride || "DS";
        const targetOff = this.regs.bx + this.regs.al & 65535;
        this.regs.al = this.mem.readByte(this.regs.getByName(s), targetOff, true);
        break;
      }
      case 155: {
        break;
      }
      case 39: {
        let al = this.regs.al;
        const oldAl = al;
        const oldCf = this.flags.cf;
        if ((al & 15) > 9 || this.flags.af) {
          al = al + 6 & 255;
          this.flags.af = true;
        } else {
          this.flags.af = false;
        }
        if (oldAl > 153 || oldCf) {
          al = al + 96 & 255;
          this.flags.cf = true;
        } else {
          this.flags.cf = false;
        }
        this.regs.al = al;
        this.flags.zf = al === 0;
        this.flags.sf = (al & 128) !== 0;
        this.flags.pf = computeParity(al);
        break;
      }
      case 47: {
        let al = this.regs.al;
        const oldAl = al;
        const oldCf = this.flags.cf;
        if ((al & 15) > 9 || this.flags.af) {
          al = al - 6 & 255;
          this.flags.af = true;
        } else {
          this.flags.af = false;
        }
        if (oldAl > 153 || oldCf) {
          al = al - 96 & 255;
          this.flags.cf = true;
        } else {
          this.flags.cf = false;
        }
        this.regs.al = al;
        this.flags.zf = al === 0;
        this.flags.sf = (al & 128) !== 0;
        this.flags.pf = computeParity(al);
        break;
      }
      case 55: {
        if ((this.regs.al & 15) > 9 || this.flags.af) {
          this.regs.al = this.regs.al + 6 & 15;
          this.regs.ah = this.regs.ah + 1 & 255;
          this.flags.af = true;
          this.flags.cf = true;
        } else {
          this.regs.al = this.regs.al & 15;
          this.flags.af = false;
          this.flags.cf = false;
        }
        break;
      }
      case 63: {
        if ((this.regs.al & 15) > 9 || this.flags.af) {
          this.regs.al = this.regs.al - 6 & 15;
          this.regs.ah = this.regs.ah - 1 & 255;
          this.flags.af = true;
          this.flags.cf = true;
        } else {
          this.regs.al = this.regs.al & 15;
          this.flags.af = false;
          this.flags.cf = false;
        }
        break;
      }
      case 212: {
        const base = fetchByte();
        if (base === 0) {
          return { halted: true, error: `Divide by zero in AAM @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        this.regs.ah = Math.floor(this.regs.al / base) & 255;
        this.regs.al = this.regs.al % base & 255;
        this.flags.zf = this.regs.al === 0;
        this.flags.sf = (this.regs.al & 128) !== 0;
        this.flags.pf = computeParity(this.regs.al);
        break;
      }
      case 213: {
        const base = fetchByte();
        this.regs.al = this.regs.ah * base + this.regs.al & 255;
        this.regs.ah = 0;
        this.flags.zf = this.regs.al === 0;
        this.flags.sf = (this.regs.al & 128) !== 0;
        this.flags.pf = computeParity(this.regs.al);
        break;
      }
      case 197: {
        const m = getModRM();
        if (m.isReg) {
          return { halted: true, error: `Invalid LDS operand @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        const segVal = this.regs.getByName(m.baseSegment);
        const off = this.mem.readWord(segVal, m.offset, true);
        const seg = this.mem.readWord(segVal, m.offset + 2 & 65535, true);
        this.regs.setReg16ByIndex(m.reg, off);
        this.regs.ds = seg;
        break;
      }
      case 196: {
        const m = getModRM();
        if (m.isReg) {
          return { halted: true, error: `Invalid LES operand @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        const segVal = this.regs.getByName(m.baseSegment);
        const off = this.mem.readWord(segVal, m.offset, true);
        const seg = this.mem.readWord(segVal, m.offset + 2 & 65535, true);
        this.regs.setReg16ByIndex(m.reg, off);
        this.regs.es = seg;
        break;
      }
      case 166: {
        const doCmpsb = () => {
          const s = segOverride || "DS";
          const srcVal = this.mem.readByte(this.regs.getByName(s), this.regs.si, true);
          const destVal = this.mem.readByte(this.regs.es, this.regs.di, true);
          const res = srcVal - destVal & 255;
          this.flags.updateSub(srcVal, destVal, res, false);
          const delta = this.flags.df ? -1 : 1;
          this.regs.si = this.regs.si + delta & 65535;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doCmpsb();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === "REPNZ") {
          while (this.regs.cx > 0) {
            doCmpsb();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (this.flags.zf) break;
          }
        } else {
          doCmpsb();
        }
        break;
      }
      case 174: {
        const doScasb = () => {
          const destVal = this.mem.readByte(this.regs.es, this.regs.di, true);
          const res = this.regs.al - destVal & 255;
          this.flags.updateSub(this.regs.al, destVal, res, false);
          const delta = this.flags.df ? -1 : 1;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doScasb();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === "REPNZ") {
          while (this.regs.cx > 0) {
            doScasb();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (this.flags.zf) break;
          }
        } else {
          doScasb();
        }
        break;
      }
      case 167: {
        const doCmpsw = () => {
          const s = segOverride || "DS";
          const srcVal = this.mem.readWord(this.regs.getByName(s), this.regs.si, true);
          const destVal = this.mem.readWord(this.regs.es, this.regs.di, true);
          const res = srcVal - destVal & 65535;
          this.flags.updateSub(srcVal, destVal, res, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.si = this.regs.si + delta & 65535;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doCmpsw();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === "REPNZ") {
          while (this.regs.cx > 0) {
            doCmpsw();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (this.flags.zf) break;
          }
        } else {
          doCmpsw();
        }
        break;
      }
      case 175: {
        const doScasw = () => {
          const destVal = this.mem.readWord(this.regs.es, this.regs.di, true);
          const res = this.regs.ax - destVal & 65535;
          this.flags.updateSub(this.regs.ax, destVal, res, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doScasw();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (!this.flags.zf) break;
          }
        } else if (repPrefix === "REPNZ") {
          while (this.regs.cx > 0) {
            doScasw();
            this.regs.cx = this.regs.cx - 1 & 65535;
            if (this.flags.zf) break;
          }
        } else {
          doScasw();
        }
        break;
      }
      case 228: {
        const port = fetchByte();
        const val = this.io.readByte(port);
        this.regs.al = val;
        consoleText = `[IN Port 0x${port.toString(16).toUpperCase().padStart(2, "0")}] -> 0x${val.toString(16).toUpperCase().padStart(2, "0")}`;
        break;
      }
      case 229: {
        const port = fetchByte();
        const val = this.io.readWord(port);
        this.regs.ax = val;
        consoleText = `[IN Port 0x${port.toString(16).toUpperCase().padStart(2, "0")}] -> 0x${val.toString(16).toUpperCase().padStart(4, "0")}`;
        break;
      }
      case 230: {
        const port = fetchByte();
        const val = this.regs.al;
        this.io.writeByte(port, val);
        const charDesc = val >= 32 && val <= 126 ? ` ('${String.fromCharCode(val)}')` : "";
        consoleText = `[OUT Port 0x${port.toString(16).toUpperCase().padStart(2, "0")}] <- 0x${val.toString(16).toUpperCase().padStart(2, "0")}${charDesc}`;
        break;
      }
      case 231: {
        const port = fetchByte();
        const val = this.regs.ax;
        this.io.writeWord(port, val);
        consoleText = `[OUT Port 0x${port.toString(16).toUpperCase().padStart(2, "0")}] <- 0x${val.toString(16).toUpperCase().padStart(4, "0")}`;
        break;
      }
      case 236: {
        const port = this.regs.dx;
        const val = this.io.readByte(port);
        this.regs.al = val;
        consoleText = `[IN Port DX (0x${port.toString(16).toUpperCase().padStart(4, "0")})] -> 0x${val.toString(16).toUpperCase().padStart(2, "0")}`;
        break;
      }
      case 237: {
        const port = this.regs.dx;
        const val = this.io.readWord(port);
        this.regs.ax = val;
        consoleText = `[IN Port DX (0x${port.toString(16).toUpperCase().padStart(4, "0")})] -> 0x${val.toString(16).toUpperCase().padStart(4, "0")}`;
        break;
      }
      case 238: {
        const port = this.regs.dx;
        const val = this.regs.al;
        this.io.writeByte(port, val);
        const charDesc = val >= 32 && val <= 126 ? ` ('${String.fromCharCode(val)}')` : "";
        consoleText = `[OUT Port DX (0x${port.toString(16).toUpperCase().padStart(4, "0")})] <- 0x${val.toString(16).toUpperCase().padStart(2, "0")}${charDesc}`;
        break;
      }
      case 239: {
        const port = this.regs.dx;
        const val = this.regs.ax;
        this.io.writeWord(port, val);
        consoleText = `[OUT Port DX (0x${port.toString(16).toUpperCase().padStart(4, "0")})] <- 0x${val.toString(16).toUpperCase().padStart(4, "0")}`;
        break;
      }
      case 164: {
        const doMove = () => {
          const s = segOverride || "DS";
          const byteVal = this.mem.readByte(this.regs.getByName(s), this.regs.si, true);
          this.mem.writeByte(this.regs.es, this.regs.di, byteVal, true);
          const delta = this.flags.df ? -1 : 1;
          this.regs.si = this.regs.si + delta & 65535;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doMove();
            this.regs.cx = this.regs.cx - 1 & 65535;
          }
        } else {
          doMove();
        }
        break;
      }
      case 170: {
        const doStore = () => {
          this.mem.writeByte(this.regs.es, this.regs.di, this.regs.al, true);
          const delta = this.flags.df ? -1 : 1;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doStore();
            this.regs.cx = this.regs.cx - 1 & 65535;
          }
        } else {
          doStore();
        }
        break;
      }
      case 172: {
        const s = segOverride || "DS";
        this.regs.al = this.mem.readByte(this.regs.getByName(s), this.regs.si, true);
        const delta = this.flags.df ? -1 : 1;
        this.regs.si = this.regs.si + delta & 65535;
        break;
      }
      case 165: {
        const doMoveW = () => {
          const s = segOverride || "DS";
          const wordVal = this.mem.readWord(this.regs.getByName(s), this.regs.si, true);
          this.mem.writeWord(this.regs.es, this.regs.di, wordVal, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.si = this.regs.si + delta & 65535;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doMoveW();
            this.regs.cx = this.regs.cx - 1 & 65535;
          }
        } else {
          doMoveW();
        }
        break;
      }
      case 171: {
        const doStoreW = () => {
          this.mem.writeWord(this.regs.es, this.regs.di, this.regs.ax, true);
          const delta = this.flags.df ? -2 : 2;
          this.regs.di = this.regs.di + delta & 65535;
        };
        if (repPrefix === "REP") {
          while (this.regs.cx > 0) {
            doStoreW();
            this.regs.cx = this.regs.cx - 1 & 65535;
          }
        } else {
          doStoreW();
        }
        break;
      }
      case 173: {
        const s = segOverride || "DS";
        this.regs.ax = this.mem.readWord(this.regs.getByName(s), this.regs.si, true);
        const delta = this.flags.df ? -2 : 2;
        this.regs.si = this.regs.si + delta & 65535;
        break;
      }
      case 205: {
        const intNum = fetchByte();
        const ivtIp = this.mem.readWord(0, intNum * 4, false);
        const ivtCs = this.mem.readWord(0, intNum * 4 + 2, false);
        if (ivtCs !== 61440 && (ivtCs !== 0 || ivtIp !== 0)) {
          this.push(this.flags.toWord());
          this.flags.if = false;
          this.flags.tf = false;
          this.push(this.regs.cs);
          this.push(currIp);
          this.regs.cs = ivtCs;
          currIp = ivtIp;
          consoleText = `[INT ${intNum.toString(16).toUpperCase()}h -> ${ivtCs.toString(16).padStart(4, "0")}:${ivtIp.toString(16).padStart(4, "0")}]`;
          break;
        }
        if (intNum === 16) {
          const ah = this.regs.ah;
          if (ah === 0) {
            const rawMode = this.regs.al;
            const noClear = (rawMode & 128) !== 0;
            const mode = rawMode & 127;
            this.mem.writeByte(0, 1097, mode, false);
            if (mode === 19) {
              this.mem.writeWord(0, 1098, 40, false);
              if (!noClear) {
                for (let i = 0; i < 64e3; i++) {
                  this.mem.writeByte(40960, i, 0, false);
                }
              }
              this.io.setCrtcCursorOffset(0);
              this.mem.onVramWrite?.(655360, 0);
              consoleText = `[INT 10h: Video Modu 13h (320x200 256 Renk Grafik) ayarland\u0131]`;
            } else {
              this.mem.writeWord(0, 1098, 80, false);
              if (!noClear && mode !== 3) {
                for (let i = 0; i < 2e3; i++) {
                  const vramPhys = 753664 + i * 2;
                  this.mem.writeByte(0, vramPhys, 32, false);
                  this.mem.writeByte(0, vramPhys + 1, 7, false);
                }
              }
              for (let p = 0; p < 8; p++) {
                this.mem.writeWord(0, 1104 + p * 2, 0, false);
              }
              this.io.setCrtcCursorOffset(0);
              this.mem.onVramWrite?.(753664, 32);
              consoleText = `[INT 10h: Video Modu 0x${mode.toString(16).padStart(2, "0").toUpperCase()} ayarland\u0131]`;
            }
          } else if (ah === 1) {
            this.mem.writeWord(0, 1120, this.regs.cx, false);
            consoleText = `[INT 10h AH=01h: \u0130mle\xE7 \u015Eekli ${this.regs.ch}:${this.regs.cl}]`;
          } else if (ah === 2) {
            const page = this.regs.bh & 7;
            const row = Math.min(24, Math.max(0, this.regs.dh));
            const col = Math.min(79, Math.max(0, this.regs.dl));
            this.mem.writeByte(0, 1104 + page * 2, col, false);
            this.mem.writeByte(0, 1105 + page * 2, row, false);
            this.io.setCrtcCursorOffset(row * 80 + col);
          } else if (ah === 3) {
            const page = this.regs.bh & 7;
            const col = this.mem.readByte(0, 1104 + page * 2, false);
            const row = this.mem.readByte(0, 1105 + page * 2, false);
            this.regs.dl = col;
            this.regs.dh = row;
            this.regs.cx = this.mem.readWord(0, 1120, false) || 1543;
          } else if (ah === 6 || ah === 7) {
            const lines = this.regs.al;
            const attr = this.regs.bh;
            const r1 = Math.min(24, this.regs.ch);
            const c1 = Math.min(79, this.regs.cl);
            const r2 = Math.min(24, this.regs.dh);
            const c2 = Math.min(79, this.regs.dl);
            if (lines === 0 || lines >= r2 - r1 + 1) {
              for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                  const off = 753664 + (r * 80 + c) * 2;
                  this.mem.writeByte(0, off, 32, false);
                  this.mem.writeByte(0, off + 1, attr, false);
                }
              }
            } else {
              if (ah === 6) {
                for (let r = r1; r <= r2 - lines; r++) {
                  for (let c = c1; c <= c2; c++) {
                    const srcOff = 753664 + ((r + lines) * 80 + c) * 2;
                    const destOff = 753664 + (r * 80 + c) * 2;
                    this.mem.writeByte(0, destOff, this.mem.readByte(0, srcOff, false), false);
                    this.mem.writeByte(0, destOff + 1, this.mem.readByte(0, srcOff + 1, false), false);
                  }
                }
                for (let r = r2 - lines + 1; r <= r2; r++) {
                  for (let c = c1; c <= c2; c++) {
                    const off = 753664 + (r * 80 + c) * 2;
                    this.mem.writeByte(0, off, 32, false);
                    this.mem.writeByte(0, off + 1, attr, false);
                  }
                }
              } else {
                for (let r = r2; r >= r1 + lines; r--) {
                  for (let c = c1; c <= c2; c++) {
                    const srcOff = 753664 + ((r - lines) * 80 + c) * 2;
                    const destOff = 753664 + (r * 80 + c) * 2;
                    this.mem.writeByte(0, destOff, this.mem.readByte(0, srcOff, false), false);
                    this.mem.writeByte(0, destOff + 1, this.mem.readByte(0, srcOff + 1, false), false);
                  }
                }
                for (let r = r1; r < r1 + lines; r++) {
                  for (let c = c1; c <= c2; c++) {
                    const off = 753664 + (r * 80 + c) * 2;
                    this.mem.writeByte(0, off, 32, false);
                    this.mem.writeByte(0, off + 1, attr, false);
                  }
                }
              }
            }
          } else if (ah === 8) {
            const page = this.regs.bh & 7;
            const col = this.mem.readByte(0, 1104 + page * 2, false);
            const row = this.mem.readByte(0, 1105 + page * 2, false);
            const off = 753664 + (row * 80 + col) * 2;
            this.regs.al = this.mem.readByte(0, off, false);
            this.regs.ah = this.mem.readByte(0, off + 1, false);
          } else if (ah === 9 || ah === 10) {
            const page = this.regs.bh & 7;
            let col = this.mem.readByte(0, 1104 + page * 2, false);
            let row = this.mem.readByte(0, 1105 + page * 2, false);
            const count = this.regs.cx;
            for (let i = 0; i < count; i++) {
              const curPos = row * 80 + col + i;
              if (curPos >= 2e3) break;
              const off = 753664 + curPos * 2;
              this.mem.writeByte(0, off, this.regs.al, false);
              if (ah === 9) {
                this.mem.writeByte(0, off + 1, this.regs.bl, false);
              }
            }
          } else if (ah === 14) {
            this.writeTeletype(this.regs.al);
            consoleText = String.fromCharCode(this.regs.al);
          } else if (ah === 12) {
            let x = this.regs.cx;
            let y = this.regs.dx;
            if (x >= 320) x = x % 320;
            if (y >= 200) y = y % 200;
            if (x >= 0 && x < 320 && y >= 0 && y < 200) {
              const offset = y * 320 + x;
              const isXor = (this.regs.al & 128) !== 0;
              let color = this.regs.al & 255;
              if (isXor) {
                const oldColor = this.mem.readByte(40960, offset, false);
                color = oldColor ^ this.regs.al & 127;
              }
              this.mem.writeByte(40960, offset, color, true);
            }
          } else if (ah === 13) {
            const x = this.regs.cx;
            const y = this.regs.dx;
            if (x >= 0 && x < 320 && y >= 0 && y < 200) {
              const offset = y * 320 + x;
              this.regs.al = this.mem.readByte(40960, offset, false);
            } else {
              this.regs.al = 0;
            }
          } else {
            consoleText = `[INT 10h AH=${ah.toString(16).padStart(2, "0")}h]`;
          }
        } else if (intNum === 17) {
          this.regs.ax = this.mem.readWord(0, 1040, false) || 33;
          consoleText = `[INT 11h: Donan\u0131m Listesi AX=0x${this.regs.ax.toString(16).toUpperCase().padStart(4, "0")}]`;
        } else if (intNum === 18) {
          this.regs.ax = this.mem.readWord(0, 1043, false) || 640;
          consoleText = `[INT 12h: Bellek Boyutu AX=${this.regs.ax} KB (0x${this.regs.ax.toString(16).toUpperCase()})]`;
        } else if (intNum === 19) {
          const ah = this.regs.ah;
          if (ah === 0) {
            this.flags.cf = false;
            this.regs.ah = 0;
            consoleText = `[INT 13h AH=00h: Disk S\xFCr\xFCc\xFCs\xFC S\u0131f\u0131rland\u0131]`;
          } else if (ah === 1) {
            this.flags.cf = false;
            this.regs.al = 0;
          } else if (ah === 2) {
            const count = this.regs.al;
            const destSeg = this.regs.es;
            const destOff = this.regs.bx;
            for (let s = 0; s < count; s++) {
              const bufferBase = destOff + s * 512 & 65535;
              if (this.regs.ch === 0 && (this.regs.cl & 63) === 1 && this.regs.dh === 0) {
                for (let b = 0; b < 512; b++) {
                  const val = this.mem.readByte(0, 31744 + b, false);
                  this.mem.writeByte(destSeg, bufferBase + b & 65535, val, true);
                }
              }
            }
            this.flags.cf = false;
            this.regs.ah = 0;
            consoleText = `[INT 13h AH=02h: ${count} Sekt\xF6r Okundu -> ${destSeg.toString(16).padStart(4, "0")}:${destOff.toString(16).padStart(4, "0")}]`;
          } else if (ah === 3) {
            this.flags.cf = false;
            this.regs.ah = 0;
          } else if (ah === 8) {
            this.regs.dl = 1;
            this.regs.dh = 1;
            this.regs.ch = 79;
            this.regs.cl = 18;
            this.regs.bl = 4;
            this.regs.ah = 0;
            this.flags.cf = false;
          } else if (ah === 21) {
            this.regs.ah = 1;
            this.flags.cf = false;
          } else {
            this.flags.cf = false;
            this.regs.ah = 0;
          }
        } else if (intNum === 20) {
          const ah = this.regs.ah;
          if (ah === 0) {
            this.regs.ah = 96;
            this.regs.al = 0;
          } else if (ah === 1) {
            this.regs.ah = 96;
            consoleText = `[COM TX: '${String.fromCharCode(this.regs.al)}']`;
          } else if (ah === 2) {
            this.regs.ah = 0;
            this.regs.al = 0;
          } else if (ah === 3) {
            this.regs.ah = 96;
            this.regs.al = 0;
          }
        } else if (intNum === 21) {
          const ah = this.regs.ah;
          if (ah === 134) {
            this.flags.cf = false;
          } else if (ah === 192) {
            this.flags.cf = false;
            this.regs.ah = 0;
          } else {
            this.flags.cf = false;
          }
        } else if (intNum === 22) {
          const ah = this.regs.ah;
          if (ah === 0 || ah === 16) {
            if (this.io.hasInput()) {
              const ch = this.io.popInput();
              this.regs.al = ch;
              this.regs.ah = 0;
              consoleText = `[INT 16h Tu\u015F: '${String.fromCharCode(ch)}' (0x${ch.toString(16).toUpperCase()})]`;
            } else {
              currIp = initialIp;
              waitingForInput = true;
              consoleText = "[INT 16h: Tu\u015F girdisi bekleniyor...]";
            }
          } else if (ah === 1 || ah === 17) {
            if (this.io.hasInput()) {
              this.flags.zf = false;
              this.regs.al = this.io.peekInput();
              this.regs.ah = 0;
            } else {
              this.flags.zf = true;
            }
          } else {
            consoleText = `[Unhandled INT 16h AH=${ah.toString(16).padStart(2, "0")}h]`;
          }
        } else if (intNum === 23) {
          const ah = this.regs.ah;
          if (ah === 0) {
            this.regs.ah = 144;
            consoleText = `[LPT PRN: '${String.fromCharCode(this.regs.al)}']`;
          } else {
            this.regs.ah = 144;
          }
        } else if (intNum === 24) {
          halted = true;
          consoleText = "[IBM PC 5150: ROM CASSETTE BASIC C1.10 (C) 1981 IBM CORP]";
        } else if (intNum === 25) {
          this.regs.cs = 0;
          currIp = 31744;
          this.regs.dl = 0;
          consoleText = "[INT 19h: Bootstrap Loader -> Yeniden Ba\u015Flat\u0131ld\u0131 (0000:7C00h)]";
        } else if (intNum === 26) {
          const ah = this.regs.ah;
          if (ah === 0) {
            const ticksLo = this.mem.readWord(0, 1132, false);
            const ticksHi = this.mem.readWord(0, 1134, false);
            this.regs.cx = ticksHi;
            this.regs.dx = ticksLo;
            this.regs.al = this.mem.readByte(0, 1136, false);
            this.mem.writeByte(0, 1136, 0, false);
            consoleText = `[INT 1Ah AH=00h: Saat Ticks CX:DX=${ticksHi}:${ticksLo}]`;
          } else if (ah === 1) {
            this.mem.writeWord(0, 1134, this.regs.cx, false);
            this.mem.writeWord(0, 1132, this.regs.dx, false);
            this.mem.writeByte(0, 1136, 0, false);
          } else if (ah === 2) {
            this.regs.ch = 18;
            this.regs.cl = 0;
            this.regs.dh = 0;
            this.regs.dl = 0;
            this.flags.cf = false;
          } else if (ah === 4) {
            this.regs.ch = 25;
            this.regs.cl = 129;
            this.regs.dh = 1;
            this.regs.dl = 1;
            this.flags.cf = false;
          }
        } else if (intNum === 32) {
          halted = true;
          consoleText = "[Program terminated via INT 20h]";
        } else if (intNum === 33) {
          const ah = this.regs.ah;
          if (ah === 1 || ah === 8) {
            if (this.io.hasInput()) {
              const ch = this.io.popInput();
              this.regs.al = ch;
              if (ah === 1) {
                this.writeTeletype(ch);
                consoleText = String.fromCharCode(ch);
              }
            } else {
              currIp = initialIp;
              waitingForInput = true;
              consoleText = "[INT 21h: Karakter girdisi bekleniyor...]";
            }
          } else if (ah === 2) {
            this.writeTeletype(this.regs.dl);
            const charStr = String.fromCharCode(this.regs.dl);
            consoleText = charStr;
          } else if (ah === 9) {
            let str = "";
            let ptr = this.regs.dx;
            while (true) {
              const b = this.mem.readByte(this.regs.ds, ptr, true);
              if (b === 36) break;
              this.writeTeletype(b);
              str += String.fromCharCode(b);
              ptr = ptr + 1 & 65535;
              if (str.length > 2e3) break;
            }
            consoleText = str;
          } else if (ah === 10) {
            if (this.io.hasInput()) {
              const maxLen = this.mem.readByte(this.regs.ds, this.regs.dx, true);
              let count = 0;
              while (this.io.hasInput() && count < maxLen) {
                const ch = this.io.popInput();
                if (ch === 13 || ch === 10) {
                  break;
                }
                this.mem.writeByte(this.regs.ds, this.regs.dx + 2 + count & 65535, ch, true);
                count++;
              }
              this.mem.writeByte(this.regs.ds, this.regs.dx + 1 & 65535, count, true);
              this.mem.writeByte(this.regs.ds, this.regs.dx + 2 + count & 65535, 13, true);
              consoleText = `[INT 21h Buffer: ${count} karakter okundu]`;
            } else {
              currIp = initialIp;
              waitingForInput = true;
              consoleText = "[INT 21h AH=0Ah: Metin girdisi bekleniyor...]";
            }
          } else if (ah === 76) {
            halted = true;
            consoleText = `[Program terminated with return code: ${this.regs.al}]`;
          } else {
            consoleText = `[Unhandled INT 21h AH=${ah.toString(16).padStart(2, "0")}h]`;
          }
        } else {
          return { halted: true, error: `Unhandled interrupt INT ${intNum.toString(16)}h @ ${cs.toString(16).padStart(4, "0")}:${initialIp.toString(16).padStart(4, "0")}`, ipBefore: initialIp, ipAfter: initialIp };
        }
        break;
      }
      case 204: {
        halted = true;
        consoleText = "[Breakpoint hit]";
        break;
      }
      default:
        return {
          halted: true,
          error: `Ge\xE7ersiz opcode 0x${opcode.toString(16).toUpperCase().padStart(2, "0")} @ ${cs.toString(16).toUpperCase().padStart(4, "0")}:${initialIp.toString(16).toUpperCase().padStart(4, "0")}`,
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
  /**
   * Authentic 1981 IBM PC BIOS Teletype writer.
   * Outputs character directly to CGA Text Mode VRAM (0xB8000),
   * handling CR, LF, BS, and hardware scrolling at line 24.
   */
  writeTeletype(ch, attr = 7) {
    let col = this.mem.readByte(0, 1104, false);
    let row = this.mem.readByte(0, 1105, false);
    if (ch === 13) {
      col = 0;
    } else if (ch === 10) {
      row++;
    } else if (ch === 8) {
      if (col > 0) col--;
    } else if (ch === 7) {
    } else {
      const off = 753664 + (row * 80 + col) * 2;
      this.mem.writeByte(0, off, ch, true);
      this.mem.writeByte(0, off + 1, attr, true);
      col++;
      if (col >= 80) {
        col = 0;
        row++;
      }
    }
    if (row >= 25) {
      for (let r = 0; r < 24; r++) {
        for (let c = 0; c < 80; c++) {
          const srcOff = 753664 + ((r + 1) * 80 + c) * 2;
          const destOff = 753664 + (r * 80 + c) * 2;
          this.mem.writeByte(0, destOff, this.mem.readByte(0, srcOff, false), false);
          this.mem.writeByte(0, destOff + 1, this.mem.readByte(0, srcOff + 1, false), false);
        }
      }
      for (let c = 0; c < 80; c++) {
        const off = 753664 + (24 * 80 + c) * 2;
        this.mem.writeByte(0, off, 32, false);
        this.mem.writeByte(0, off + 1, 7, false);
      }
      row = 24;
    }
    this.mem.writeByte(0, 1104, col, false);
    this.mem.writeByte(0, 1105, row, false);
    this.io.setCrtcCursorOffset(row * 80 + col);
  }
};

// src/cpu/cpu.ts
var CPU = class {
  mem;
  regs;
  flags;
  io;
  executor;
  halted = false;
  lastError;
  consoleBuffer = "";
  history = [];
  maxHistory = 2e3;
  constructor() {
    this.mem = new Memory();
    this.regs = new Registers();
    this.flags = new Flags();
    this.io = new IOPortManager();
    this.executor = new Executor(this.mem, this.regs, this.flags, this.io);
    this.reset();
  }
  feedInput(data) {
    this.io.feedInput(data);
  }
  reset() {
    this.mem.reset();
    this.regs.resetCOM();
    this.flags.reset();
    this.io.reset();
    this.executor.reset();
    this.halted = false;
    this.lastError = void 0;
    this.consoleBuffer = "";
    this.history = [];
  }
  // Load binary at CS:origin (default origin 0x0000)
  loadCOM(bytes, origin = 0) {
    this.reset();
    this.mem.loadBytes(this.regs.cs, origin, bytes, "code");
    this.regs.ip = origin;
  }
  // Single step execution
  step() {
    if (this.halted || this.lastError) {
      return {
        halted: this.halted,
        error: this.lastError,
        ipBefore: this.regs.ip,
        ipAfter: this.regs.ip,
        changedRegs: [],
        changedFlags: [],
        memReads: [],
        memWrites: []
      };
    }
    const oldRegs = this.regs.clone();
    const oldFlags = this.flags.clone();
    this.mem.clearAccessLogs();
    const writesBefore = /* @__PURE__ */ new Map();
    const ipBefore = this.regs.ip;
    const result = this.executor.executeStep();
    if (result.halted) this.halted = true;
    if (result.error) this.lastError = result.error;
    if (result.consoleText) {
      this.consoleBuffer += result.consoleText;
    }
    const changedRegs = [];
    if (this.regs.ax !== oldRegs.ax) {
      changedRegs.push("AX");
      if (this.regs.al !== (oldRegs.ax & 255)) changedRegs.push("AL");
      if (this.regs.ah !== (oldRegs.ax >> 8 & 255)) changedRegs.push("AH");
    }
    if (this.regs.bx !== oldRegs.bx) {
      changedRegs.push("BX");
      if (this.regs.bl !== (oldRegs.bx & 255)) changedRegs.push("BL");
      if (this.regs.bh !== (oldRegs.bx >> 8 & 255)) changedRegs.push("BH");
    }
    if (this.regs.cx !== oldRegs.cx) {
      changedRegs.push("CX");
      if (this.regs.cl !== (oldRegs.cx & 255)) changedRegs.push("CL");
      if (this.regs.ch !== (oldRegs.cx >> 8 & 255)) changedRegs.push("CH");
    }
    if (this.regs.dx !== oldRegs.dx) {
      changedRegs.push("DX");
      if (this.regs.dl !== (oldRegs.dx & 255)) changedRegs.push("DL");
      if (this.regs.dh !== (oldRegs.dx >> 8 & 255)) changedRegs.push("DH");
    }
    if (this.regs.si !== oldRegs.si) changedRegs.push("SI");
    if (this.regs.di !== oldRegs.di) changedRegs.push("DI");
    if (this.regs.bp !== oldRegs.bp) changedRegs.push("BP");
    if (this.regs.sp !== oldRegs.sp) changedRegs.push("SP");
    if (this.regs.ip !== oldRegs.ip) changedRegs.push("IP");
    if (this.regs.cs !== oldRegs.cs) changedRegs.push("CS");
    if (this.regs.ds !== oldRegs.ds) changedRegs.push("DS");
    if (this.regs.es !== oldRegs.es) changedRegs.push("ES");
    if (this.regs.ss !== oldRegs.ss) changedRegs.push("SS");
    const changedFlags = [];
    if (this.flags.cf !== oldFlags.cf) changedFlags.push("CF");
    if (this.flags.pf !== oldFlags.pf) changedFlags.push("PF");
    if (this.flags.af !== oldFlags.af) changedFlags.push("AF");
    if (this.flags.zf !== oldFlags.zf) changedFlags.push("ZF");
    if (this.flags.sf !== oldFlags.sf) changedFlags.push("SF");
    if (this.flags.of !== oldFlags.of) changedFlags.push("OF");
    if (this.flags.df !== oldFlags.df) changedFlags.push("DF");
    if (this.flags.if !== oldFlags.if) changedFlags.push("IF");
    const memWritesList = Array.from(this.mem.lastWrites);
    const memReadsList = Array.from(this.mem.lastReads);
    const memChanges = [];
    for (const phys of memWritesList) {
      const oldVal = this.mem.lastWriteOldValues.get(phys) ?? 0;
      memChanges.push({
        physAddr: phys,
        oldVal,
        newVal: this.mem.data[phys]
      });
    }
    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    this.history.push({
      regs: oldRegs,
      flags: oldFlags,
      memChanges,
      consoleLength: this.consoleBuffer.length
    });
    return {
      halted: this.halted,
      error: this.lastError,
      ipBefore,
      ipAfter: this.regs.ip,
      changedRegs,
      changedFlags,
      memReads: memReadsList,
      memWrites: memWritesList,
      consoleText: result.consoleText,
      waitingForInput: result.waitingForInput
    };
  }
  // Step back to previous state
  stepBack() {
    if (this.history.length === 0) return false;
    const entry = this.history.pop();
    this.regs.restore(entry.regs);
    this.flags.restore(entry.flags);
    for (const change of entry.memChanges) {
      this.mem.writePhys(change.physAddr, change.oldVal);
    }
    this.consoleBuffer = this.consoleBuffer.slice(0, entry.consoleLength);
    this.halted = false;
    this.lastError = void 0;
    this.mem.clearAccessLogs();
    return true;
  }
  canStepBack() {
    return this.history.length > 0;
  }
  // Run for a given chunk of steps (for non-blocking UI run)
  runChunk(maxSteps) {
    let steps = 0;
    while (steps < maxSteps && !this.halted && !this.lastError) {
      this.step();
      steps++;
    }
    return {
      stepsExecuted: steps,
      halted: this.halted,
      error: this.lastError
    };
  }
};

// src/ui/tooltip.ts
var TooltipManager = class {
  static tooltipEl = null;
  static activeTarget = null;
  static init() {
    if (this.tooltipEl) return;
    const el = document.createElement("div");
    el.className = "global-info-tooltip";
    el.innerHTML = `
      <div class="tooltip-title"></div>
      <div class="tooltip-desc"></div>
      <div class="tooltip-arrow"></div>
    `;
    document.body.appendChild(el);
    this.tooltipEl = el;
    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest(".info-btn");
      if (target) {
        this.show(target);
      }
    });
    document.addEventListener("mouseout", (e) => {
      const target = e.target.closest(".info-btn");
      if (target && target === this.activeTarget) {
        this.hide();
      }
    });
    document.addEventListener("click", (e) => {
      const target = e.target.closest(".info-btn");
      if (target) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }
  static show(target) {
    if (!this.tooltipEl) return;
    const title = target.getAttribute("data-info-title") || "";
    const desc = target.getAttribute("data-info-desc") || "";
    if (!title && !desc) return;
    this.activeTarget = target;
    const titleEl = this.tooltipEl.querySelector(".tooltip-title");
    const descEl = this.tooltipEl.querySelector(".tooltip-desc");
    const arrowEl = this.tooltipEl.querySelector(".tooltip-arrow");
    titleEl.textContent = title;
    titleEl.style.display = title ? "block" : "none";
    descEl.textContent = desc;
    this.tooltipEl.classList.add("visible");
    const rect = target.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();
    let top = rect.top - tooltipRect.height - 8;
    let arrowOnTop = false;
    if (top < 10) {
      top = rect.bottom + 8;
      arrowOnTop = true;
    }
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    const padding = 10;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
    const arrowX = rect.left + rect.width / 2 - left;
    arrowEl.style.left = `${arrowX}px`;
    if (arrowOnTop) {
      this.tooltipEl.classList.add("arrow-top");
    } else {
      this.tooltipEl.classList.remove("arrow-top");
    }
  }
  static hide() {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.remove("visible");
    this.activeTarget = null;
  }
};

// src/workspace/workspaceManager.ts
var STORAGE_PROJECT_KEY = "assemblysim_project_v8";
var STORAGE_PROJECTS_LIST_KEY = "assemblysim_projects_list_v6";
var STORAGE_PROJECT_PREFIX = "assemblysim_project_data_";
var DEFAULT_MAIN_CODE = `; ==========================================================
; 8086 Assembly Programi
; Sag paneldeki Register (Yazmac) ve Bellek (RAM) degisimlerini izleyin.
; ==========================================================
ORG 100H

START:
    ; 1. Yazmaclara baslangic degerleri yukle
    MOV AX, 1000H
    MOV BX, 0020H
    MOV CX, 0005H       ; Dongu sayaci (5 tekrar)

TOPLAMA_DONGUSU:
    ADD AX, BX          ; AX = AX + BX
    DEC CX              ; Sayaci azalt
    JNZ TOPLAMA_DONGUSU ; CX != 0 ise donguye devam et

    ; 2. Hesaplanan degeri RAM'e yaz (DS:[0200h])
    MOV [0200H], AX

    ; 3. Programi sonlandir
    HLT
`;
function getSafeStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== "undefined") {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
}
var WorkspaceManager = class {
  project;
  inMemoryProjects = /* @__PURE__ */ new Map();
  events;
  constructor(events = {}) {
    this.events = events;
    this.loadFromStorage();
  }
  loadFromStorage() {
    const storage = getSafeStorage();
    if (!storage) {
      this.initDefaultProject();
      return;
    }
    try {
      const saved = storage.getItem(STORAGE_PROJECT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.files) && parsed.files.length > 0) {
          this.project = parsed;
          this.ensureIntegrity();
          this.syncProjectInList();
          return;
        }
      }
    } catch {
    }
    this.initDefaultProject();
  }
  initDefaultProject() {
    const mainFile = {
      id: "file-main",
      name: "main.asm",
      code: DEFAULT_MAIN_CODE,
      isEntry: true,
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    this.project = {
      id: "project-default",
      name: "8086 Projesi",
      entryFileId: mainFile.id,
      activeFileId: mainFile.id,
      openFileIds: [mainFile.id],
      files: [mainFile],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    this.saveToStorage();
  }
  ensureIntegrity() {
    if (!this.project.files || this.project.files.length === 0) {
      this.initDefaultProject();
      return;
    }
    const mainFile = this.project.files.find((f) => f.name === "main.asm" || f.isEntry);
    if (mainFile && mainFile.code.includes("MOV AX, 0") && mainFile.code.includes("Kodlarinizi buraya yazin")) {
      mainFile.code = DEFAULT_MAIN_CODE;
    }
    this.project.files = this.project.files.filter(
      (f) => f.name !== "console.asm" && !f.code.includes("MSG_BANNER") && !f.code.includes("8086 INTERAKTIF KOMUT KONSOLU")
    );
    const legacyBoot = this.project.files.find(
      (f) => f.name === "boot.asm" && f.code.includes("8086 Bare-Metal Bootloader")
    );
    if (legacyBoot) {
      legacyBoot.name = "main.asm";
      legacyBoot.code = DEFAULT_MAIN_CODE;
    }
    if (this.project.files.length === 0) {
      this.initDefaultProject();
      return;
    }
    if (!this.project.files.some((f) => f.id === this.project.entryFileId)) {
      this.project.entryFileId = this.project.files[0].id;
      this.project.files[0].isEntry = true;
    }
    if (!this.project.files.some((f) => f.id === this.project.activeFileId)) {
      this.project.activeFileId = this.project.files[0].id;
    }
    this.project.openFileIds = this.project.openFileIds.filter(
      (id) => this.project.files.some((f) => f.id === id)
    );
    if (this.project.openFileIds.length === 0) {
      this.project.openFileIds = [this.project.activeFileId];
    }
  }
  saveToStorage() {
    if (this.project) {
      this.inMemoryProjects.set(this.project.id, JSON.parse(JSON.stringify(this.project)));
    }
    const storage = getSafeStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(this.project));
      storage.setItem(STORAGE_PROJECT_PREFIX + this.project.id, JSON.stringify(this.project));
      this.syncProjectInList();
    } catch {
    }
  }
  syncProjectInList() {
    const storage = getSafeStorage();
    if (!storage) return;
    try {
      let list = [];
      const savedList = storage.getItem(STORAGE_PROJECTS_LIST_KEY);
      if (savedList) {
        list = JSON.parse(savedList);
      }
      if (!Array.isArray(list)) list = [];
      const existingIdx = list.findIndex((p) => p.id === this.project.id);
      const summary = {
        id: this.project.id,
        name: this.project.name,
        fileCount: this.project.files.length,
        lastModified: this.project.lastModified || Date.now()
      };
      if (existingIdx !== -1) {
        list[existingIdx] = summary;
      } else {
        list.push(summary);
      }
      storage.setItem(STORAGE_PROJECTS_LIST_KEY, JSON.stringify(list));
    } catch {
    }
  }
  getProjectsList() {
    const map = /* @__PURE__ */ new Map();
    for (const p of this.inMemoryProjects.values()) {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        fileCount: p.files.length,
        lastModified: p.lastModified || Date.now()
      });
    }
    const storage = getSafeStorage();
    if (storage) {
      try {
        const savedList = storage.getItem(STORAGE_PROJECTS_LIST_KEY);
        if (savedList) {
          const list = JSON.parse(savedList);
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item && item.id && !map.has(item.id)) {
                map.set(item.id, item);
              }
            }
          }
        }
      } catch {
      }
    }
    if (map.size === 0 && this.project) {
      map.set(this.project.id, {
        id: this.project.id,
        name: this.project.name,
        fileCount: this.project.files.length,
        lastModified: this.project.lastModified || Date.now()
      });
    }
    return Array.from(map.values()).map((item) => ({
      ...item,
      isCurrent: item.id === this.project?.id
    }));
  }
  createProject(name) {
    this.saveToStorage();
    const count = this.getProjectsList().length + 1;
    const projName = name && name.trim() ? name.trim() : `Proje ${count}`;
    const mainFile = {
      id: `file-main-${Date.now()}`,
      name: "main.asm",
      code: DEFAULT_MAIN_CODE,
      isEntry: true,
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    const newProject = {
      id: `project-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      name: projName,
      entryFileId: mainFile.id,
      activeFileId: mainFile.id,
      openFileIds: [mainFile.id],
      files: [mainFile],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    this.project = newProject;
    this.saveToStorage();
    this.events.onActiveFileChange?.(mainFile);
    this.events.onProjectChange?.(this.project);
    return this.project;
  }
  openProject(projectId) {
    if (this.project && projectId === this.project.id) {
      return true;
    }
    this.saveToStorage();
    let targetProject = this.inMemoryProjects.get(projectId);
    if (!targetProject) {
      const storage = getSafeStorage();
      if (storage) {
        try {
          const saved = storage.getItem(STORAGE_PROJECT_PREFIX + projectId);
          if (saved) {
            targetProject = JSON.parse(saved);
          }
        } catch {
        }
      }
    }
    if (targetProject && Array.isArray(targetProject.files) && targetProject.files.length > 0) {
      this.project = JSON.parse(JSON.stringify(targetProject));
      this.ensureIntegrity();
      this.saveToStorage();
      this.events.onActiveFileChange?.(this.getActiveFile());
      this.events.onProjectChange?.(this.project);
      return true;
    }
    return false;
  }
  deleteProject(projectId) {
    if (this.project && projectId === this.project.id) {
      return false;
    }
    this.inMemoryProjects.delete(projectId);
    const storage = getSafeStorage();
    if (storage) {
      try {
        storage.removeItem(STORAGE_PROJECT_PREFIX + projectId);
        let list = this.getProjectsList().filter((p) => p.id !== projectId);
        storage.setItem(STORAGE_PROJECTS_LIST_KEY, JSON.stringify(list));
      } catch {
      }
    }
    return true;
  }
  renameCurrentProject(newName) {
    const clean = newName.trim();
    if (!clean) return;
    this.project.name = clean;
    this.project.lastModified = Date.now();
    this.saveToStorage();
    this.events.onProjectChange?.(this.project);
  }
  exportProjectJson() {
    return JSON.stringify(this.project, null, 2);
  }
  importProjectJson(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.files) || parsed.files.length === 0) {
        return false;
      }
      this.saveToStorage();
      const newId = `project-${Date.now()}`;
      const projectName = typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : "\u0130\xE7e Aktar\u0131lan Proje";
      const files = parsed.files.map((f, idx) => ({
        id: f.id || `file-${Date.now()}-${idx}`,
        name: f.name || `file${idx + 1}.asm`,
        code: typeof f.code === "string" ? f.code : "",
        isEntry: idx === 0 || f.isEntry === true,
        createdAt: f.createdAt || Date.now(),
        lastModified: f.lastModified || Date.now()
      }));
      const importedProject = {
        id: newId,
        name: projectName,
        entryFileId: files[0].id,
        activeFileId: files[0].id,
        openFileIds: files.map((f) => f.id),
        files,
        createdAt: Date.now(),
        lastModified: Date.now()
      };
      this.project = importedProject;
      this.ensureIntegrity();
      this.saveToStorage();
      this.events.onActiveFileChange?.(this.getActiveFile());
      this.events.onProjectChange?.(this.project);
      return true;
    } catch {
      return false;
    }
  }
  getProject() {
    return this.project;
  }
  getAllFiles() {
    return this.project.files.map((f) => ({ ...f, title: f.title || f.name }));
  }
  getAllDocuments() {
    return this.getAllFiles();
  }
  getFile(id) {
    const f = this.project.files.find((item) => item.id === id);
    if (!f) return void 0;
    return { ...f, title: f.title || f.name };
  }
  getDocument(id) {
    return this.getFile(id);
  }
  getActiveFile() {
    const file = this.getFile(this.project.activeFileId);
    if (file) return file;
    const first = this.project.files[0];
    return { ...first, title: first.title || first.name };
  }
  getActiveDocument() {
    return this.getActiveFile();
  }
  setActiveDocument(id) {
    this.setActiveFile(id);
  }
  createDocument(name, initialCode) {
    return this.createFile(name, initialCode);
  }
  updateDocumentCode(id, code) {
    this.updateFileCode(id, code);
  }
  setActiveFile(id) {
    if (this.project.files.some((f) => f.id === id)) {
      this.project.activeFileId = id;
      this.openTab(id);
      this.saveToStorage();
      this.events.onActiveFileChange?.(this.getActiveFile());
      this.events.onProjectChange?.(this.project);
    }
  }
  getEntryFile() {
    const file = this.getFile(this.project.entryFileId);
    if (file) return file;
    return this.project.files[0];
  }
  setEntryFile(id) {
    if (this.project.files.some((f) => f.id === id)) {
      this.project.entryFileId = id;
      this.project.files.forEach((f) => {
        f.isEntry = f.id === id;
      });
      this.saveToStorage();
      this.events.onProjectChange?.(this.project);
    }
  }
  createFile(name, initialCode) {
    const count = this.project.files.length + 1;
    let fileName = name ? name.trim() : `file${count}.asm`;
    if (!fileName.endsWith(".asm")) fileName += ".asm";
    const newFile = {
      id: `file-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      name: fileName,
      code: initialCode !== void 0 ? initialCode : `; ${fileName}
ORG 100H

START:
    ; Kodlarinizi buraya yazin...

    HLT
`,
      isEntry: false,
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    this.project.files.push(newFile);
    this.project.activeFileId = newFile.id;
    this.openTab(newFile.id);
    this.saveToStorage();
    this.events.onActiveFileChange?.(newFile);
    this.events.onProjectChange?.(this.project);
    return newFile;
  }
  deleteFile(id) {
    const index = this.project.files.findIndex((f) => f.id === id);
    if (index === -1) return false;
    if (this.project.files.length === 1) {
      const file = this.project.files[0];
      file.name = "main.asm";
      file.code = DEFAULT_MAIN_CODE;
      file.lastModified = Date.now();
      this.saveToStorage();
      this.events.onActiveFileChange?.(file);
      this.events.onProjectChange?.(this.project);
      return true;
    }
    this.project.files.splice(index, 1);
    this.closeTab(id);
    if (this.project.activeFileId === id) {
      const nextActive = this.project.files[Math.max(0, index - 1)];
      this.project.activeFileId = nextActive.id;
      this.openTab(nextActive.id);
      this.events.onActiveFileChange?.(nextActive);
    }
    if (this.project.entryFileId === id) {
      this.setEntryFile(this.project.files[0].id);
    }
    this.saveToStorage();
    this.events.onProjectChange?.(this.project);
    return true;
  }
  getInternalFile(id) {
    return this.project.files.find((item) => item.id === id);
  }
  renameFile(id, newName) {
    const file = this.getInternalFile(id);
    if (!file) return;
    let clean = newName.trim();
    if (!clean) return;
    if (!clean.endsWith(".asm")) clean += ".asm";
    file.name = clean;
    file.lastModified = Date.now();
    this.saveToStorage();
    this.events.onProjectChange?.(this.project);
  }
  updateFileCode(id, code, editorScroll, editorCursor) {
    const file = this.getInternalFile(id);
    if (!file) return;
    file.code = code;
    file.lastModified = Date.now();
    if (editorScroll) {
      file.editorScroll = editorScroll;
    }
    if (editorCursor) {
      file.editorCursor = editorCursor;
    }
    this.saveToStorage();
  }
  openTab(fileId) {
    if (!this.project.openFileIds.includes(fileId)) {
      this.project.openFileIds.push(fileId);
      this.saveToStorage();
      this.events.onProjectChange?.(this.project);
    }
  }
  closeTab(fileId) {
    const idx = this.project.openFileIds.indexOf(fileId);
    if (idx !== -1) {
      this.project.openFileIds.splice(idx, 1);
      if (this.project.openFileIds.length === 0) {
        this.project.openFileIds = [this.project.files[0].id];
      }
      if (this.project.activeFileId === fileId) {
        const nextId = this.project.openFileIds[Math.max(0, idx - 1)] || this.project.openFileIds[0];
        this.setActiveFile(nextId);
      } else {
        this.saveToStorage();
        this.events.onProjectChange?.(this.project);
      }
    }
  }
};

// src/ui/sidebar.ts
var WorkspaceSidebar = class {
  container;
  workspace;
  callbacks;
  isCollapsed = false;
  constructor(parentEl, workspace, callbacks) {
    this.workspace = workspace;
    this.callbacks = callbacks;
    this.container = document.createElement("aside");
    this.container.id = "workspace-sidebar";
    this.container.className = "workspace-sidebar";
    parentEl.appendChild(this.container);
    this.render();
  }
  toggleCollapse(force) {
    if (force !== void 0) {
      this.isCollapsed = force;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
    if (this.isCollapsed) {
      this.container.classList.add("collapsed");
    } else {
      this.container.classList.remove("collapsed");
    }
    this.updateToggleIcon();
  }
  updateToggleIcon() {
    const btn = this.container.querySelector(".btn-sidebar-toggle");
    if (btn) {
      btn.innerHTML = this.isCollapsed ? "\u276F" : "\u276E";
      btn.title = this.isCollapsed ? "Men\xFCy\xFC Geni\u015Flet" : "Men\xFCy\xFC Daralt";
    }
  }
  render() {
    const project = this.workspace.getProject();
    const files = project.files;
    const isManualActive = this.callbacks.isManualOpen ? this.callbacks.isManualOpen() : false;
    const isGraphActive = this.callbacks.isGraphOpen ? this.callbacks.isGraphOpen() : false;
    const isStudyActive = this.callbacks.isStudyOpen ? this.callbacks.isStudyOpen() : false;
    const isOtherActive = isManualActive || isGraphActive || isStudyActive;
    const activeFileId = isOtherActive ? null : this.callbacks.getActiveFileId ? this.callbacks.getActiveFileId() : project.activeFileId;
    this.container.innerHTML = `
      <div class="sidebar-header">
        <button class="btn-sidebar-toggle" title="${this.isCollapsed ? "Men\xFCy\xFC Geni\u015Flet" : "Men\xFCy\xFC Daralt"}">
          ${this.isCollapsed ? "\u276F" : "\u276E"}
        </button>
        <div class="sidebar-title-area">
          <span class="sidebar-title-icon">\u{1F5C2}\uFE0F</span>
          <h3 class="sidebar-title" title="8086 Workspace Projesi">${this.escapeHtml(project.name)}</h3>
          <span class="sidebar-doc-count">${files.length}</span>
        </div>
        <div class="sidebar-header-btns">
          <button class="btn-sidebar-new" id="btn-sidebar-new-file" title="Yeni Assembly Dosyas\u0131 Ekle (.asm)">\uFF0B</button>
        </div>
      </div>

      <div class="sidebar-content">
        <div class="sidebar-section-header" style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
          <span>Proje Dosyalar\u0131</span>
        </div>
        <ul class="workspace-doc-list">
          ${files.map((file) => this.renderFileItem(file, file.id === activeFileId, true)).join("")}
        </ul>
      </div>

      <div class="sidebar-footer" style="padding: 10px; border-top: 1px solid var(--border-color); background: #f8fafc; display: flex; flex-direction: column; gap: 6px;">
        <!-- 8086 Assembly Dersleri & Zihin Haritas\u0131 Butonu -->
        <button class="btn-sidebar-study-action ${isStudyActive ? "active" : ""}" id="btn-sidebar-open-study" title="8086 Assembly Dersleri, Zihin Haritas\u0131 ve Not Defteri" style="width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 8px 10px; background: ${isStudyActive ? "#fef3c7" : "#ffffff"}; border: 1px solid ${isStudyActive ? "#fde68a" : "var(--border-dark)"}; border-radius: 6px; cursor: pointer; color: ${isStudyActive ? "#92400e" : "var(--text-primary)"}; font-weight: 700; font-size: 12px; transition: all 0.15s ease;">
          <span class="footer-btn-icon" style="font-size: 15px;">\u{1F393}</span>
          <span class="footer-btn-text">Dersler & Not Defteri</span>
        </button>

        <!-- 8086 Sinir A\u011F\u0131 & Bilgi Graf\u0131 Butonu -->
        <button class="btn-sidebar-graph-action ${isGraphActive ? "active" : ""}" id="btn-sidebar-open-graph" title="8086 Sinir A\u011F\u0131 ve Ortak \xD6zellik Bilgi Haritas\u0131" style="width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 8px 10px; background: ${isGraphActive ? "#f0fdf4" : "#ffffff"}; border: 1px solid ${isGraphActive ? "#86efac" : "var(--border-dark)"}; border-radius: 6px; cursor: pointer; color: ${isGraphActive ? "#15803d" : "var(--text-primary)"}; font-weight: 700; font-size: 12px; transition: all 0.15s ease;">
          <span class="footer-btn-icon" style="font-size: 15px;">\u{1F9E0}</span>
          <span class="footer-btn-text">Bilgi Haritas\u0131</span>
        </button>

        <!-- 8086 Komut Manueli Butonu (Orijinal IBM PC 8086 Ba\u015Fvuru K\u0131lavuzu) -->
        <button class="btn-sidebar-manual-action ${isManualActive ? "active" : ""}" id="btn-sidebar-open-manual" title="8086 Komut Seti ve Referans Manueli" style="width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 8px 10px; background: ${isManualActive ? "#eff6ff" : "#ffffff"}; border: 1px solid ${isManualActive ? "#93c5fd" : "var(--border-dark)"}; border-radius: 6px; cursor: pointer; color: ${isManualActive ? "#1d4ed8" : "var(--text-primary)"}; font-weight: 600; font-size: 12px; transition: all 0.15s ease;">
          <span class="footer-btn-icon" style="font-size: 15px;">\u{1F4D6}</span>
          <span class="footer-btn-text">Komut Manueli</span>
        </button>
      </div>
    `;
    this.bindEvents();
  }
  renderFileItem(file, isActive, canDelete) {
    return `
      <li class="workspace-doc-item ${isActive ? "active" : ""}" data-file-id="${file.id}">
        <div class="doc-item-main" title="${this.escapeHtml(file.name)} (Yeniden adland\u0131rmak i\xE7in \xE7ift t\u0131klay\u0131n)">
          <span class="doc-icon">\u{1F4C4}</span>
          <span class="doc-title">${this.escapeHtml(file.name)}</span>
        </div>
        <div class="doc-item-actions" style="display: flex; gap: 2px;">
          ${canDelete ? `
            <button class="btn-doc-delete" data-file-id="${file.id}" title="Dosyay\u0131 Sil">\xD7</button>
          ` : ""}
        </div>
      </li>
    `;
  }
  bindEvents() {
    const toggleBtn = this.container.querySelector(".btn-sidebar-toggle");
    toggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleCollapse();
    });
    const newBtn = this.container.querySelector("#btn-sidebar-new-file");
    newBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.callbacks.onNewFile();
    });
    const docItems = this.container.querySelectorAll(".workspace-doc-item");
    docItems.forEach((item) => {
      const fileId = item.getAttribute("data-file-id");
      if (!fileId) return;
      item.addEventListener("click", (e) => {
        if (e.target.closest(".btn-doc-delete") || e.target.closest(".btn-set-entry")) return;
        const file = this.workspace.getFile(fileId);
        if (file) {
          this.callbacks.onFileSelect(file);
          this.render();
        }
      });
      item.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const file = this.workspace.getFile(fileId);
        if (!file) return;
        const newName = window.prompt("Dosya ad\u0131n\u0131 girin:", file.name);
        if (newName && newName.trim()) {
          this.workspace.renameFile(fileId, newName.trim());
          this.callbacks.onRenameFile?.(fileId, newName.trim());
          this.render();
        }
      });
    });
    const entryBtns = this.container.querySelectorAll(".btn-set-entry");
    entryBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const fileId = btn.getAttribute("data-file-id");
        if (!fileId) return;
        this.workspace.setEntryFile(fileId);
        this.callbacks.onSetEntryFile?.(fileId);
        this.render();
      });
    });
    const deleteBtns = this.container.querySelectorAll(".btn-doc-delete");
    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const fileId = btn.getAttribute("data-file-id");
        if (!fileId) return;
        const file = this.workspace.getFile(fileId);
        if (!file) return;
        if (window.confirm(`"${file.name}" dosyas\u0131n\u0131 silmek istedi\u011Finize emin misiniz?`)) {
          this.workspace.deleteFile(fileId);
          this.callbacks.onDeleteFile?.(fileId);
          this.render();
        }
      });
    });
    const studyBtn = this.container.querySelector("#btn-sidebar-open-study");
    studyBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.callbacks.onOpenStudy?.();
    });
    const graphBtn = this.container.querySelector("#btn-sidebar-open-graph");
    graphBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.callbacks.onOpenGraph?.();
    });
    const manualBtn = this.container.querySelector("#btn-sidebar-open-manual");
    manualBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.callbacks.onOpenManual?.();
    });
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
};

// src/ui/editorActions.ts
var EditorHistory = class {
  stack = [];
  pointer = -1;
  maxStackSize = 200;
  debounceTimer = null;
  constructor(initialValue = "", initialPos = 0) {
    this.reset(initialValue, initialPos);
  }
  reset(value, pos = 0) {
    this.clearDebounce();
    this.stack = [{ value, selectionStart: pos, selectionEnd: pos }];
    this.pointer = 0;
  }
  clearDebounce() {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
  getCurrent() {
    return this.stack[this.pointer];
  }
  push(entry) {
    this.clearDebounce();
    if (this.pointer >= 0 && this.stack[this.pointer].value === entry.value) {
      this.stack[this.pointer].selectionStart = entry.selectionStart;
      this.stack[this.pointer].selectionEnd = entry.selectionEnd;
      return;
    }
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push({ ...entry });
    if (this.stack.length > this.maxStackSize) {
      this.stack.shift();
    } else {
      this.pointer++;
    }
  }
  recordTyping(entry, isBoundary = false) {
    if (this.pointer >= 0 && this.stack[this.pointer].value === entry.value) {
      this.stack[this.pointer].selectionStart = entry.selectionStart;
      this.stack[this.pointer].selectionEnd = entry.selectionEnd;
      return;
    }
    if (isBoundary) {
      this.push(entry);
      return;
    }
    this.clearDebounce();
    this.debounceTimer = setTimeout(() => {
      this.push(entry);
      this.debounceTimer = null;
    }, 300);
  }
  canUndo() {
    return this.pointer > 0;
  }
  canRedo() {
    return this.pointer < this.stack.length - 1;
  }
  undo(currentEntry) {
    this.clearDebounce();
    if (currentEntry && this.pointer >= 0 && currentEntry.value !== this.stack[this.pointer].value) {
      this.push(currentEntry);
    }
    if (this.pointer > 0) {
      this.pointer--;
      return this.stack[this.pointer];
    }
    return null;
  }
  redo() {
    this.clearDebounce();
    if (this.pointer < this.stack.length - 1) {
      this.pointer++;
      return this.stack[this.pointer];
    }
    return null;
  }
};
function indentSelection(val, start, end, indentOrTabSize = 4) {
  const tabSize = typeof indentOrTabSize === "number" ? indentOrTabSize : 4;
  const defaultIndentStr = typeof indentOrTabSize === "string" ? indentOrTabSize : " ".repeat(tabSize);
  if (start === end) {
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const col = start - lineStart;
    const spacesToAdd = col % tabSize === 0 ? tabSize : tabSize - col % tabSize;
    const insertStr = " ".repeat(spacesToAdd);
    const text2 = val.substring(0, start) + insertStr + val.substring(end);
    return {
      text: text2,
      newStart: start + spacesToAdd,
      newEnd: start + spacesToAdd
    };
  }
  const firstLineStart = val.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd = end > start && val[end - 1] === "\n" ? end - 1 : end;
  let nextNewline = val.indexOf("\n", effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;
  const before = val.substring(0, firstLineStart);
  const block = val.substring(firstLineStart, nextNewline);
  const after = val.substring(nextNewline);
  const lines = block.split("\n");
  const indentedLines = lines.map((line) => defaultIndentStr + line);
  const newBlock = indentedLines.join("\n");
  const text = before + newBlock + after;
  const addedPerLine = defaultIndentStr.length;
  const totalAdded = lines.length * addedPerLine;
  const newStart = start === firstLineStart ? start : start + addedPerLine;
  const newEnd = end + totalAdded;
  return { text, newStart, newEnd };
}
function dedentSelection(val, start, end, maxIndent = 4) {
  const firstLineStart = val.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd = end > start && val[end - 1] === "\n" ? end - 1 : end;
  let nextNewline = val.indexOf("\n", effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;
  const before = val.substring(0, firstLineStart);
  const block = val.substring(firstLineStart, nextNewline);
  const after = val.substring(nextNewline);
  const lines = block.split("\n");
  let totalRemoved = 0;
  let removedOnFirstLine = 0;
  const dedentedLines = lines.map((line, idx) => {
    let removeCount = 0;
    if (line.startsWith("	")) {
      removeCount = 1;
    } else {
      while (removeCount < maxIndent && line[removeCount] === " ") {
        removeCount++;
      }
    }
    if (idx === 0) removedOnFirstLine = removeCount;
    totalRemoved += removeCount;
    return line.substring(removeCount);
  });
  const newBlock = dedentedLines.join("\n");
  const text = before + newBlock + after;
  let newStart = start - removedOnFirstLine;
  if (newStart < firstLineStart) newStart = firstLineStart;
  const newEnd = Math.max(newStart, end - totalRemoved);
  return { text, newStart, newEnd };
}
function autoIndentOnEnter(val, start, end) {
  const lineStart = val.lastIndexOf("\n", start - 1) + 1;
  const lineBeforeCursor = val.substring(lineStart, start);
  const indentMatch = lineBeforeCursor.match(/^[ \t]*/);
  let indent = indentMatch ? indentMatch[0] : "";
  const codePart = lineBeforeCursor.replace(/;.*$/, "").trim();
  if (codePart.endsWith(":")) {
    if (indent === "") {
      indent = "    ";
    } else {
      indent = indent + "    ";
    }
  }
  const insertion = "\n" + indent;
  const text = val.substring(0, start) + insertion + val.substring(end);
  const newPos = start + insertion.length;
  return { text, newPos };
}
function toggleComment(val, start, end) {
  const firstLineStart = val.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd = end > start && val[end - 1] === "\n" ? end - 1 : end;
  let nextNewline = val.indexOf("\n", effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;
  const before = val.substring(0, firstLineStart);
  const block = val.substring(firstLineStart, nextNewline);
  const after = val.substring(nextNewline);
  const lines = block.split("\n");
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  const allCommented = nonEmptyLines.length > 0 && nonEmptyLines.every((l) => /^\s*;/.test(l));
  let totalDelta = 0;
  let firstLineDelta = 0;
  const processedLines = lines.map((line, idx) => {
    let delta = 0;
    let newLine = line;
    if (allCommented) {
      const match = line.match(/^(\s*); ?(.*)$/);
      if (match) {
        newLine = match[1] + match[2];
        delta = newLine.length - line.length;
      }
    } else {
      if (line.trim().length > 0 || lines.length === 1) {
        const match = line.match(/^(\s*)(.*)$/);
        if (match) {
          newLine = match[1] + "; " + match[2];
          delta = newLine.length - line.length;
        }
      }
    }
    if (idx === 0) firstLineDelta = delta;
    totalDelta += delta;
    return newLine;
  });
  const newBlock = processedLines.join("\n");
  const text = before + newBlock + after;
  let newStart = start + firstLineDelta;
  if (newStart < firstLineStart) newStart = firstLineStart;
  let newEnd = end + totalDelta;
  if (newEnd < newStart) newEnd = newStart;
  return { text, newStart, newEnd };
}
function duplicateLineOrSelection(val, start, end) {
  if (start !== end) {
    const selectedText = val.substring(start, end);
    const text2 = val.substring(0, end) + selectedText + val.substring(end);
    return {
      text: text2,
      newStart: end,
      newEnd: end + selectedText.length
    };
  }
  const lineStart = val.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = val.indexOf("\n", start);
  if (lineEnd === -1) lineEnd = val.length;
  const line = val.substring(lineStart, lineEnd);
  const text = val.substring(0, lineEnd) + "\n" + line + val.substring(lineEnd);
  const offset = start - lineStart;
  const newPos = lineEnd + 1 + offset;
  return {
    text,
    newStart: newPos,
    newEnd: newPos
  };
}
function moveLines(val, start, end, direction) {
  const firstLineStart = val.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd = end > start && val[end - 1] === "\n" ? end - 1 : end;
  let nextNewline = val.indexOf("\n", effectiveEnd);
  if (nextNewline === -1) nextNewline = val.length;
  if (direction === "up") {
    if (firstLineStart === 0) return null;
    const prevLineStart = val.lastIndexOf("\n", firstLineStart - 2) + 1;
    const prevLine = val.substring(prevLineStart, firstLineStart - 1);
    const block = val.substring(firstLineStart, nextNewline);
    const before = val.substring(0, prevLineStart);
    const after = val.substring(nextNewline);
    const text = before + block + "\n" + prevLine + after;
    const shift = prevLine.length + 1;
    return {
      text,
      newStart: start - shift,
      newEnd: end - shift
    };
  } else {
    if (nextNewline >= val.length) return null;
    let lineAfterEnd = val.indexOf("\n", nextNewline + 1);
    if (lineAfterEnd === -1) lineAfterEnd = val.length;
    const block = val.substring(firstLineStart, nextNewline);
    const nextLine = val.substring(nextNewline + 1, lineAfterEnd);
    const before = val.substring(0, firstLineStart);
    const after = val.substring(lineAfterEnd);
    const text = before + nextLine + "\n" + block + after;
    const shift = nextLine.length + 1;
    return {
      text,
      newStart: start + shift,
      newEnd: end + shift
    };
  }
}
function smartBackspace(val, start, end, tabSize = 4) {
  if (start !== end) return null;
  const lineStart = val.lastIndexOf("\n", start - 1) + 1;
  const textBefore = val.substring(lineStart, start);
  if (textBefore.length > 0) {
    if (/^ +$/.test(textBefore)) {
      const col = textBefore.length;
      const count = col % tabSize === 0 ? tabSize : col % tabSize;
      const text = val.substring(0, start - count) + val.substring(start);
      const newPos = start - count;
      return { text, newPos };
    }
  }
  return null;
}
function deleteLine(val, start, end) {
  const firstLineStart = val.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = val.indexOf("\n", end);
  if (lineEnd === -1) {
    if (firstLineStart > 0) {
      const text = val.substring(0, firstLineStart - 1);
      return { text, newPos: firstLineStart - 1 };
    } else {
      return { text: "", newPos: 0 };
    }
  } else {
    const text = val.substring(0, firstLineStart) + val.substring(lineEnd + 1);
    const newPos = Math.min(firstLineStart, text.length);
    return { text, newPos };
  }
}

// src/ui/editor.ts
var Editor = class {
  container;
  textarea;
  highlightLayer;
  gutterLayer;
  errorsBox;
  activeLine = null;
  breakpoints = /* @__PURE__ */ new Set();
  errors = /* @__PURE__ */ new Map();
  history = new EditorHistory();
  fileHistories = /* @__PURE__ */ new Map();
  currentFileId = null;
  onCodeChange;
  onSave;
  onBreakpointToggle;
  constructor(options) {
    this.container = options.container;
    this.onCodeChange = options.onCodeChange;
    this.onSave = options.onSave;
    this.onBreakpointToggle = options.onBreakpointToggle;
    this.render();
    this.setCode(options.initialCode);
  }
  render() {
    this.container.innerHTML = `
      <div class="editor-card">
        <div class="editor-gutter" id="editor-gutter"></div>
        <div class="editor-body">
          <pre class="editor-highlight" id="editor-highlight" aria-hidden="true"></pre>
          <textarea class="editor-textarea" id="editor-textarea" wrap="off" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
        </div>
      </div>
      <div class="errors-box" id="editor-errors-box">
        <div class="errors-header">Errors:</div>
        <div class="errors-content" id="errors-content">No errors.</div>
      </div>
    `;
    this.gutterLayer = this.container.querySelector("#editor-gutter");
    this.highlightLayer = this.container.querySelector("#editor-highlight");
    this.textarea = this.container.querySelector("#editor-textarea");
    this.errorsBox = this.container.querySelector("#editor-errors-box");
    this.attachEvents();
  }
  syncScroll() {
    const top = this.textarea.scrollTop;
    const left = this.textarea.scrollLeft;
    this.gutterLayer.scrollTop = top;
    this.highlightLayer.scrollTop = top;
    this.highlightLayer.scrollLeft = left;
  }
  applyEdit(newVal, newStart, newEnd) {
    const curVal = this.textarea.value;
    const curStart = this.textarea.selectionStart;
    const curEnd = this.textarea.selectionEnd;
    const currentTop = this.history.getCurrent();
    if (!currentTop || currentTop.value !== curVal) {
      this.history.push({ value: curVal, selectionStart: curStart, selectionEnd: curEnd });
    }
    const prevScrollTop = this.textarea.scrollTop;
    const prevScrollLeft = this.textarea.scrollLeft;
    this.textarea.value = newVal;
    this.updateHighlighting();
    this.updateGutter();
    this.textarea.selectionStart = newStart;
    this.textarea.selectionEnd = newEnd;
    this.textarea.scrollTop = prevScrollTop;
    this.textarea.scrollLeft = prevScrollLeft;
    this.history.push({ value: newVal, selectionStart: newStart, selectionEnd: newEnd });
    this.syncScroll();
    this.onCodeChange?.(newVal);
  }
  undo() {
    const curVal = this.textarea.value;
    const curStart = this.textarea.selectionStart;
    const curEnd = this.textarea.selectionEnd;
    const prevState = this.history.undo({
      value: curVal,
      selectionStart: curStart,
      selectionEnd: curEnd
    });
    if (prevState) {
      const prevScrollTop = this.textarea.scrollTop;
      const prevScrollLeft = this.textarea.scrollLeft;
      this.textarea.value = prevState.value;
      this.updateHighlighting();
      this.updateGutter();
      this.textarea.selectionStart = prevState.selectionStart;
      this.textarea.selectionEnd = prevState.selectionEnd;
      this.textarea.scrollTop = prevScrollTop;
      this.textarea.scrollLeft = prevScrollLeft;
      this.syncScroll();
      this.onCodeChange?.(prevState.value);
    }
  }
  redo() {
    const nextState = this.history.redo();
    if (nextState) {
      const prevScrollTop = this.textarea.scrollTop;
      const prevScrollLeft = this.textarea.scrollLeft;
      this.textarea.value = nextState.value;
      this.updateHighlighting();
      this.updateGutter();
      this.textarea.selectionStart = nextState.selectionStart;
      this.textarea.selectionEnd = nextState.selectionEnd;
      this.textarea.scrollTop = prevScrollTop;
      this.textarea.scrollLeft = prevScrollLeft;
      this.syncScroll();
      this.onCodeChange?.(nextState.value);
    }
  }
  attachEvents() {
    this.textarea.addEventListener("scroll", () => this.syncScroll());
    this.gutterLayer.addEventListener("wheel", (e) => {
      this.textarea.scrollTop += e.deltaY;
      this.syncScroll();
      e.preventDefault();
    }, { passive: false });
    this.textarea.addEventListener("input", (e) => {
      const inputEvent = e;
      const val = this.textarea.value;
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      const isPaste = inputEvent.inputType === "insertFromPaste" || inputEvent.inputType === "insertFromDrop";
      const isCut = inputEvent.inputType === "deleteByCut";
      const isBoundary = isPaste || isCut || inputEvent.data === " " || inputEvent.data === "\n";
      this.history.recordTyping(
        { value: val, selectionStart: start, selectionEnd: end },
        isBoundary
      );
      this.updateHighlighting();
      this.updateGutter();
      this.syncScroll();
      this.onCodeChange?.(val);
    });
    this.textarea.addEventListener("keydown", (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const val = this.textarea.value;
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      if (isCtrl && !e.altKey && key === "s") {
        e.preventDefault();
        this.onSave?.();
        return;
      }
      if (isCtrl && !e.altKey && key === "z" && !e.shiftKey) {
        e.preventDefault();
        this.undo();
        return;
      }
      if (isCtrl && !e.altKey && (key === "y" || key === "z" && e.shiftKey)) {
        e.preventDefault();
        this.redo();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          const res = dedentSelection(val, start, end, 4);
          this.applyEdit(res.text, res.newStart, res.newEnd);
        } else {
          const res = indentSelection(val, start, end, 4);
          this.applyEdit(res.text, res.newStart, res.newEnd);
        }
        return;
      }
      if (e.key === "Enter" && !e.shiftKey && !isCtrl && !e.altKey) {
        e.preventDefault();
        const res = autoIndentOnEnter(val, start, end);
        this.applyEdit(res.text, res.newPos, res.newPos);
        return;
      }
      if (isCtrl && !e.altKey && (e.key === "/" || e.key === ";")) {
        e.preventDefault();
        const res = toggleComment(val, start, end);
        this.applyEdit(res.text, res.newStart, res.newEnd);
        return;
      }
      if (isCtrl && !e.altKey && !e.shiftKey && key === "d" || e.altKey && e.shiftKey && e.key === "ArrowDown") {
        e.preventDefault();
        const res = duplicateLineOrSelection(val, start, end);
        this.applyEdit(res.text, res.newStart, res.newEnd);
        return;
      }
      if (e.altKey && !e.shiftKey && !isCtrl && e.key === "ArrowUp") {
        e.preventDefault();
        const res = moveLines(val, start, end, "up");
        if (res) {
          this.applyEdit(res.text, res.newStart, res.newEnd);
        }
        return;
      }
      if (e.altKey && !e.shiftKey && !isCtrl && e.key === "ArrowDown") {
        e.preventDefault();
        const res = moveLines(val, start, end, "down");
        if (res) {
          this.applyEdit(res.text, res.newStart, res.newEnd);
        }
        return;
      }
      if (isCtrl && e.shiftKey && key === "k") {
        e.preventDefault();
        const res = deleteLine(val, start, end);
        this.applyEdit(res.text, res.newPos, res.newPos);
        return;
      }
      if (e.key === "Backspace" && !isCtrl && !e.altKey && !e.shiftKey && start === end) {
        const res = smartBackspace(val, start, end, 4);
        if (res) {
          e.preventDefault();
          this.applyEdit(res.text, res.newPos, res.newPos);
          return;
        }
      }
    });
    this.gutterLayer.addEventListener("click", (e) => {
      const target = e.target.closest(".gutter-row");
      if (target) {
        const line = parseInt(target.getAttribute("data-line") || "0", 10);
        if (line > 0) this.toggleBreakpoint(line);
      }
    });
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => this.syncScroll());
      ro.observe(this.textarea);
    }
    window.addEventListener("resize", () => this.syncScroll());
  }
  getCode() {
    return this.textarea.value.replace(/\r\n/g, "\n");
  }
  setCode(code) {
    const cleanCode = code.replace(/\r\n/g, "\n");
    this.textarea.value = cleanCode;
    this.history.reset(cleanCode, 0);
    if (this.currentFileId) {
      this.fileHistories.set(this.currentFileId, this.history);
    }
    this.updateHighlighting();
    this.updateGutter();
    this.syncScroll();
  }
  openFile(fileId, code, scroll, cursor) {
    const cleanCode = code.replace(/\r\n/g, "\n");
    if (this.currentFileId && this.currentFileId !== fileId) {
      const curVal = this.textarea.value;
      const curStart = this.textarea.selectionStart;
      const curEnd = this.textarea.selectionEnd;
      const curHist = this.fileHistories.get(this.currentFileId);
      if (curHist) {
        const top = curHist.getCurrent();
        if (!top || top.value !== curVal) {
          curHist.push({ value: curVal, selectionStart: curStart, selectionEnd: curEnd });
        }
      }
    }
    this.currentFileId = fileId;
    let hist = this.fileHistories.get(fileId);
    if (!hist) {
      const initialPos = cursor ? cursor.start : 0;
      hist = new EditorHistory(cleanCode, initialPos);
      this.fileHistories.set(fileId, hist);
    } else {
      const top = hist.getCurrent();
      if (!top || top.value !== cleanCode) {
        hist.push({
          value: cleanCode,
          selectionStart: cursor?.start ?? 0,
          selectionEnd: cursor?.end ?? 0
        });
      }
    }
    this.history = hist;
    this.textarea.value = cleanCode;
    if (cursor) {
      this.textarea.selectionStart = Math.min(cursor.start, cleanCode.length);
      this.textarea.selectionEnd = Math.min(cursor.end, cleanCode.length);
    } else {
      const top = hist.getCurrent();
      if (top) {
        this.textarea.selectionStart = Math.min(top.selectionStart, cleanCode.length);
        this.textarea.selectionEnd = Math.min(top.selectionEnd, cleanCode.length);
      }
    }
    this.updateHighlighting();
    this.updateGutter();
    if (scroll) {
      this.setScroll(scroll);
    } else {
      this.syncScroll();
    }
  }
  getCursor() {
    return {
      start: this.textarea.selectionStart,
      end: this.textarea.selectionEnd
    };
  }
  setCursor(cursor) {
    this.textarea.selectionStart = Math.min(cursor.start, this.textarea.value.length);
    this.textarea.selectionEnd = Math.min(cursor.end, this.textarea.value.length);
  }
  removeFileHistory(fileId) {
    this.fileHistories.delete(fileId);
    if (this.currentFileId === fileId) {
      this.currentFileId = null;
    }
  }
  setActiveLine(line) {
    this.activeLine = line;
    this.updateGutter();
    this.updateHighlighting();
    if (line !== null) {
      this.scrollToLine(line);
    }
  }
  toggleBreakpoint(line) {
    let active = false;
    if (this.breakpoints.has(line)) {
      this.breakpoints.delete(line);
    } else {
      this.breakpoints.add(line);
      active = true;
    }
    this.updateGutter();
    this.onBreakpointToggle?.(line, active);
  }
  isBreakpoint(line) {
    return this.breakpoints.has(line);
  }
  setErrors(errors) {
    this.errors.clear();
    const content = this.container.querySelector("#errors-content");
    if (errors.length === 0) {
      this.clearErrors();
      return;
    }
    let text = "";
    for (const err of errors) {
      this.errors.set(err.line, err.message);
      text += `Syntax Error at line ${err.line} : ${err.message}
`;
    }
    if (content) {
      content.className = "errors-content";
      content.textContent = text;
    }
    this.updateGutter();
    this.updateHighlighting();
  }
  clearErrors() {
    const hadErrors = this.errors.size > 0;
    this.errors.clear();
    const content = this.container.querySelector("#errors-content");
    if (content) {
      content.className = "errors-content status-ok";
      content.textContent = "Compiled successfully with zero errors.";
    }
    if (hadErrors) {
      this.updateGutter();
      this.updateHighlighting();
    }
  }
  getScroll() {
    return {
      top: this.textarea.scrollTop,
      left: this.textarea.scrollLeft
    };
  }
  setScroll(scroll) {
    if (scroll.top !== void 0) this.textarea.scrollTop = scroll.top;
    if (scroll.left !== void 0) this.textarea.scrollLeft = scroll.left;
    this.syncScroll();
  }
  scrollToLine(line) {
    const lineHeight = 22;
    const targetScroll = Math.max(0, (line - 1) * lineHeight - 60);
    this.textarea.scrollTop = targetScroll;
    this.syncScroll();
  }
  updateGutter() {
    const lines = this.getCode().split("\n");
    let html = "";
    for (let i = 1; i <= lines.length; i++) {
      const isBP = this.breakpoints.has(i);
      const isActive = this.activeLine === i;
      const errorMsg = this.errors.get(i);
      let classes = "gutter-row";
      if (isActive) classes += " active-ip-row";
      if (isBP) classes += " has-bp";
      if (errorMsg) classes += " has-error";
      html += `
        <div class="${classes}" data-line="${i}" title="${errorMsg || ""}">
          <span class="gutter-bp-dot"></span>
          <span class="gutter-arrow">\u25B6</span>
          ${errorMsg ? '<span class="gutter-err-icon">\u2297</span>' : ""}
          <span class="gutter-num">${i}</span>
        </div>
      `;
    }
    this.gutterLayer.innerHTML = html;
  }
  updateHighlighting() {
    const lines = this.getCode().split("\n");
    let highlightedHtml = "";
    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const lineText = lines[i];
      const isActive = this.activeLine === lineNum;
      const hasError = this.errors.has(lineNum);
      let rowClass = "editor-line-row";
      if (isActive) rowClass += " active-code-line";
      if (hasError) rowClass += " error-code-line";
      const colored = this.highlightSyntax(lineText);
      highlightedHtml += `<div class="${rowClass}">${colored || "&nbsp;"}</div>`;
    }
    this.highlightLayer.innerHTML = highlightedHtml;
  }
  highlightSyntax(line) {
    let result = "";
    let i = 0;
    const len = line.length;
    const opcodes = /* @__PURE__ */ new Set([
      "MOV",
      "LEA",
      "ADD",
      "ADC",
      "SUB",
      "SBB",
      "INC",
      "DEC",
      "CMP",
      "JMP",
      "JE",
      "JNE",
      "JZ",
      "JNZ",
      "JC",
      "JNC",
      "JA",
      "JB",
      "JAE",
      "JBE",
      "JG",
      "JL",
      "JGE",
      "JLE",
      "JS",
      "JNS",
      "JO",
      "JNO",
      "JP",
      "JNP",
      "JCXZ",
      "LOOP",
      "LOOPE",
      "LOOPNE",
      "LOOPZ",
      "LOOPNZ",
      "NOP",
      "HLT",
      "AND",
      "OR",
      "XOR",
      "NOT",
      "NEG",
      "TEST",
      "SHL",
      "SHR",
      "SAL",
      "SAR",
      "ROL",
      "ROR",
      "RCL",
      "RCR",
      "XCHG",
      "PUSH",
      "POP",
      "PUSHF",
      "POPF",
      "CALL",
      "RET",
      "RETN",
      "MUL",
      "DIV",
      "IMUL",
      "IDIV",
      "INT",
      "MOVSB",
      "MOVSW",
      "STOSB",
      "STOSW",
      "LODSB",
      "LODSW",
      "REP",
      "REPNZ",
      "REPZ",
      "CLC",
      "STC",
      "CMC",
      "CLD",
      "STD",
      "CLI",
      "STI",
      "CBW",
      "CWD",
      "LAHF",
      "SAHF",
      "XLAT",
      "XLATB",
      "DAA",
      "DAS",
      "AAA",
      "AAS",
      "AAM",
      "AAD",
      "LDS",
      "LES",
      "IN",
      "OUT"
    ]);
    const directives = /* @__PURE__ */ new Set([
      "ORG",
      "DB",
      "DW",
      "DUP",
      "OFFSET",
      "BYTE",
      "WORD",
      "PTR",
      "EQU",
      "PROC",
      "ENDP",
      ".MODEL",
      ".STACK",
      ".DATA",
      ".CODE",
      "ASSUME",
      "END",
      "@DATA",
      "@CODE",
      "@STACK"
    ]);
    const registers = /* @__PURE__ */ new Set([
      "AX",
      "BX",
      "CX",
      "DX",
      "SI",
      "DI",
      "BP",
      "SP",
      "IP",
      "CS",
      "DS",
      "ES",
      "SS",
      "AL",
      "AH",
      "BL",
      "BH",
      "CL",
      "CH",
      "DL",
      "DH"
    ]);
    while (i < len) {
      const ch = line[i];
      if (ch === ";") {
        result += `<span class="hl-comment">${this.escapeHtml(line.substring(i))}</span>`;
        break;
      }
      if (ch === "'" || ch === '"') {
        const quote = ch;
        let str = quote;
        i++;
        while (i < len && line[i] !== quote) {
          str += line[i];
          i++;
        }
        if (i < len) {
          str += line[i];
          i++;
        }
        result += `<span class="hl-string">${this.escapeHtml(str)}</span>`;
        continue;
      }
      if (/[a-zA-Z0-9_$.?@]/.test(ch)) {
        let word = "";
        while (i < len && /[a-zA-Z0-9_$.?@]/.test(line[i])) {
          word += line[i];
          i++;
        }
        const upper = word.toUpperCase();
        if (i < len && line[i] === ":") {
          result += `<span class="hl-label">${this.escapeHtml(word)}:</span>`;
          i++;
        } else if (opcodes.has(upper)) {
          result += `<span class="hl-opcode">${this.escapeHtml(word)}</span>`;
        } else if (directives.has(upper)) {
          result += `<span class="hl-directive">${this.escapeHtml(word)}</span>`;
        } else if (registers.has(upper)) {
          result += `<span class="hl-reg">${this.escapeHtml(word)}</span>`;
        } else if (/^[0-9][0-9A-Fa-f]*[Hh]?$/.test(word) || /^[+-]?[0-9]+$/.test(word) || /^[01]+[Bb]$/.test(word)) {
          result += `<span class="hl-number">${this.escapeHtml(word)}</span>`;
        } else {
          result += this.escapeHtml(word);
        }
        continue;
      }
      result += this.escapeHtml(ch);
      i++;
    }
    return result;
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};

// src/ui/registerPanel.ts
var REG_INFO = {
  // General Purpose Registers
  "A": {
    title: "AX - Accumulator Register (Biriktirici)",
    desc: "Birincil aritmetik, mant\u0131k ve G/\xC7 (I/O) yazmac\u0131. \xC7arpma/b\xF6lme ve sistem \xE7a\u011Fr\u0131lar\u0131nda temeldir. AH (y\xFCksek 8-bit) ve AL (d\xFC\u015F\xFCk 8-bit) olarak ayr\u0131l\u0131r."
  },
  "B": {
    title: "BX - Base Register (Taban Yazmac\u0131)",
    desc: "Taban adresleme yazmac\u0131. Bellek eri\u015Fimlerinde dolayl\u0131 adresleme [BX] i\xE7in kullan\u0131labilen tek genel ama\xE7l\u0131 veri yazmac\u0131d\u0131r. (BH ve BL)."
  },
  "C": {
    title: "CX - Count Register (Saya\xE7 Yazmac\u0131)",
    desc: "Saya\xE7 yazmac\u0131. LOOP d\xF6ng\xFClerinde, REP dizi tekrarlar\u0131nda ve bit kayd\u0131rma/d\xF6nd\xFCrme (SHL, ROL vb.) i\u015Flemlerinde otomatik saya\xE7t\u0131r. (CH ve CL)."
  },
  "D": {
    title: "DX - Data Register (Veri Yazmac\u0131)",
    desc: "Veri yazmac\u0131. 32-bit \xE7arpma ve b\xF6lmelerde AX ile e\u015Fle\u015Fir (DX:AX). Ayr\u0131ca IN/OUT port adreslemesinde DX kullan\u0131l\u0131r. (DH ve DL)."
  },
  // Segment Registers
  "SS": {
    title: "SS - Stack Segment (Y\u0131\u011F\u0131n Segmenti)",
    desc: "Y\u0131\u011F\u0131n b\xF6lgesinin ba\u015Flang\u0131\xE7 segment adresini tutar. SP ve BP i\u015Faret\xE7ileri varsay\u0131lan olarak SS segmentini referans al\u0131r."
  },
  "DS": {
    title: "DS - Data Segment (Veri Segmenti)",
    desc: "Program\u0131n verilerinin ve de\u011Fi\u015Fkenlerinin sakland\u0131\u011F\u0131 varsay\u0131lan veri segmentidir. [offset] adreslemeleri DS tabanl\u0131d\u0131r."
  },
  "ES": {
    title: "ES - Extra Segment (Ek Segment)",
    desc: "Ek veri segmenti. \xD6zellikle dizi ve metin komutlar\u0131nda (MOVSB, STOSB vb.) hedef bellek alan\u0131n\u0131 (ES:DI) belirler."
  },
  "CS": {
    title: "CS - Code Segment (Kod Segmenti)",
    desc: "Y\xFCr\xFCt\xFClen makine kodlar\u0131n\u0131n bulundu\u011Fu kod segmenti. IP (Instruction Pointer) ile birlikte fiziksel y\xFCr\xFCtme adresini (CS*16 + IP) olu\u015Fturur."
  },
  // Pointer & Index Registers
  "SP": {
    title: "SP - Stack Pointer (Y\u0131\u011F\u0131n \u0130\u015Faret\xE7isi)",
    desc: "Y\u0131\u011F\u0131n\u0131n (Stack) en \xFCst noktas\u0131n\u0131n ofset adresini tutar. PUSH ile 2 bayt azal\u0131r, POP ile 2 bayt artar."
  },
  "BP": {
    title: "BP - Base Pointer (Taban \u0130\u015Faret\xE7isi)",
    desc: "Y\u0131\u011F\u0131ndaki altprogram parametrelerine ve yerel de\u011Fi\u015Fkenlere eri\u015Fmek i\xE7in kullan\u0131lan taban ofset i\u015Faret\xE7isidir ([BP+offset])."
  },
  "SI": {
    title: "SI - Source Index (Kaynak \u0130ndeksi)",
    desc: "Kaynak bellek indeks i\u015Faret\xE7isi. Dizi komutlar\u0131nda (MOVSB, LODSB vb.) kaynak adresi (DS:SI) olarak kullan\u0131l\u0131r."
  },
  "DI": {
    title: "DI - Destination Index (Hedef \u0130ndeksi)",
    desc: "Hedef bellek indeks i\u015Faret\xE7isi. Dizi komutlar\u0131nda (MOVSB, STOSB vb.) hedef adresi (ES:DI) olarak kullan\u0131l\u0131r."
  },
  "IP": {
    title: "IP - Instruction Pointer (Komut \u0130\u015Faret\xE7isi)",
    desc: "Y\xFCr\xFCt\xFClecek bir sonraki komutun ofset adresini g\xF6sterir. Do\u011Frudan MOV ile de\u011Fi\u015Ftirilemez; atlama (JMP), \xE7a\u011Fr\u0131 (CALL) veya RET ile de\u011Fi\u015Fir."
  },
  // Status & Control Flags
  "OF": {
    title: "OF - Overflow Flag (Ta\u015Fma Bayra\u011F\u0131)",
    desc: "\u0130\u015Faretli (signed) aritmetik i\u015Flemlerde sonu\xE7 hedefin kapasitesini a\u015Ft\u0131\u011F\u0131nda 1 olur."
  },
  "DF": {
    title: "DF - Direction Flag (Y\xF6n Bayra\u011F\u0131)",
    desc: "Dizi/string komutlar\u0131nda y\xF6n\xFC belirler. 0 ise ileri/artan adresler (CLD), 1 ise geri/azalan adresler (STD)."
  },
  "IF": {
    title: "IF - Interrupt Flag (Kesme Bayra\u011F\u0131)",
    desc: "D\u0131\u015F donan\u0131m kesmelerini etkinle\u015Ftirir (STI: 1) veya devre d\u0131\u015F\u0131 b\u0131rak\u0131r/maskeler (CLI: 0)."
  },
  "TF": {
    title: "TF - Trap Flag (Ad\u0131m Bayra\u011F\u0131)",
    desc: "Tek ad\u0131mda hata ay\u0131klama (single-step debug) modunu etkinle\u015Ftirir. Her komuttan sonra INT 1 \xFCretir."
  },
  "SF": {
    title: "SF - Sign Flag (\u0130\u015Faret Bayra\u011F\u0131)",
    desc: "Yap\u0131lan i\u015Flemin en y\xFCksek biti 1 ise (negatifse) 1, pozitifse 0 olur."
  },
  "ZF": {
    title: "ZF - Zero Flag (S\u0131f\u0131r Bayra\u011F\u0131)",
    desc: "\u0130\u015Flem sonucu 0 oldu\u011Funda 1 olur. CMP veya SUB sonras\u0131 e\u015Fitlik kontrollerinde (JE, JZ) kullan\u0131l\u0131r."
  },
  "AF": {
    title: "AF - Auxiliary Carry Flag (Yard\u0131mc\u0131 Elde)",
    desc: "D\xFC\u015F\xFCk 4-bitlik par\xE7adan (nibble) 4. bite ta\u015Fma oldu\u011Funda 1 olur. BCD (DAA, AAA vb.) aritmeti\u011Finde kullan\u0131l\u0131r."
  },
  "PF": {
    title: "PF - Parity Flag (E\u015Flik Bayra\u011F\u0131)",
    desc: "Sonucun en d\xFC\u015F\xFCk bayt\u0131ndaki 1 bitlerinin say\u0131s\u0131 \xE7ift ise 1, tek ise 0 olur."
  },
  "CF": {
    title: "CF - Carry Flag (Elde Bayra\u011F\u0131)",
    desc: "\u0130\u015Faretsiz (unsigned) aritmetikte ta\u015Fma veya \xE7\u0131karmada bor\xE7 olu\u015Ftu\u011Funda 1 olur."
  }
};
var RegisterPanel = class {
  container;
  currentFormat = "hex";
  constructor(container) {
    this.container = container;
  }
  setFormat(fmt) {
    this.currentFormat = fmt;
  }
  getFormat() {
    return this.currentFormat;
  }
  update(regs, flags, changedRegs = [], _changedFlags = []) {
    const format8 = (v) => {
      if (this.currentFormat === "dec") return v.toString(10);
      if (this.currentFormat === "bin") return v.toString(2).padStart(8, "0");
      return v.toString(16).toUpperCase().padStart(2, "0");
    };
    const format16 = (v) => {
      if (this.currentFormat === "dec") return v.toString(10);
      if (this.currentFormat === "bin") return v.toString(2).padStart(16, "0");
      return v.toString(16).toUpperCase().padStart(4, "0");
    };
    const isChanged = (name) => changedRegs.includes(name.toUpperCase());
    const regRow = (label, hVal, lVal, hName, lName) => {
      const flashH = isChanged(hName) ? "cell-flash" : "";
      const flashL = isChanged(lName) ? "cell-flash" : "";
      const info = REG_INFO[label] || { title: label, desc: "" };
      return `
        <div class="table-row-split ${this.currentFormat === "bin" ? "bin-font" : ""}">
          <span class="reg-label-cell">
            ${label}
            <span class="info-btn" data-info-title="${info.title}" data-info-desc="${info.desc}" tabindex="-1">i</span>
          </span>
          <span class="${flashH}">${format8(hVal)}</span>
          <span class="${flashL}">${format8(lVal)}</span>
        </div>
      `;
    };
    const singleRow = (label, val, name) => {
      const flash = isChanged(name) ? "cell-flash" : "";
      const info = REG_INFO[label] || { title: label, desc: "" };
      return `
        <div class="table-row-item ${this.currentFormat === "bin" ? "bin-font" : ""}">
          <span class="reg-label-cell">
            ${label}
            <span class="info-btn" data-info-title="${info.title}" data-info-desc="${info.desc}" tabindex="-1">i</span>
          </span>
          <span class="${flash}">${format16(val)}</span>
        </div>
      `;
    };
    const flagCell = (name, val) => {
      const activeClass = val ? "flag-val-active" : "";
      const info = REG_INFO[name] || { title: name, desc: "" };
      return `
        <div class="flag-item-wrap">
          <div class="flag-col-header">
            <span>${name}</span>
            <span class="info-btn" data-info-title="${info.title}" data-info-desc="${info.desc}" tabindex="-1">i</span>
          </div>
          <div class="flag-col-val ${activeClass}">${val ? "1" : "0"}</div>
        </div>
      `;
    };
    this.container.innerHTML = `
      <div class="cpu-top-block">
        <!-- 3 Columns: Reg | Segments | Pointers -->
        <div class="top-tables-grid">
          <!-- Reg (A, B, C, D with H, L) -->
          <div class="black-card">
            <div class="black-card-header reg-header-split">
              <span class="header-with-info">
                Reg
                <span class="info-btn" data-info-title="Genel Ama\xE7l\u0131 Yazma\xE7lar (16-bit)" data-info-desc="AX, BX, CX, DX genel ama\xE7l\u0131 veri yazma\xE7lar\u0131d\u0131r. Her biri 8-bitlik High (H) ve Low (L) par\xE7alara b\xF6l\xFCnerek de kullan\u0131labilir." tabindex="-1">i</span>
              </span>
              <span>H</span>
              <span>L</span>
            </div>
            <div class="black-card-body">
              ${regRow("A", regs.ah, regs.al, "AH", "AL")}
              ${regRow("B", regs.bh, regs.bl, "BH", "BL")}
              ${regRow("C", regs.ch, regs.cl, "CH", "CL")}
              ${regRow("D", regs.dh, regs.dl, "DH", "DL")}
            </div>
          </div>

          <!-- Segments (SS, DS, ES, CS) -->
          <div class="black-card">
            <div class="black-card-header flex-header">
              <span>Segments</span>
              <span class="info-btn" data-info-title="Segment Yazma\xE7lar\u0131 (16-bit)" data-info-desc="8086'n\u0131n 1 MB belle\u011Fi 64 KB'l\u0131k segmentlere ayr\u0131lm\u0131\u015Ft\u0131r. Fiziksel Adres = (Segment \xD7 16) + Ofset form\xFCl\xFC ile 20-bit adres olu\u015Fturulur." tabindex="-1">i</span>
            </div>
            <div class="black-card-body">
              ${singleRow("SS", regs.ss, "SS")}
              ${singleRow("DS", regs.ds, "DS")}
              ${singleRow("ES", regs.es, "ES")}
              ${singleRow("CS", regs.cs, "CS")}
            </div>
          </div>

          <!-- Pointers (SP, BP, SI, DI, IP) -->
          <div class="black-card">
            <div class="black-card-header flex-header">
              <span>Pointers</span>
              <span class="info-btn" data-info-title="G\xF6sterici ve \u0130ndeks Yazma\xE7lar\u0131" data-info-desc="Y\u0131\u011F\u0131n i\u015Faret\xE7ileri (SP, BP), dizi indeksleri (SI, DI) ve komut i\u015Faret\xE7isini (IP) bar\u0131nd\u0131r\u0131r." tabindex="-1">i</span>
            </div>
            <div class="black-card-body">
              ${singleRow("SP", regs.sp, "SP")}
              ${singleRow("BP", regs.bp, "BP")}
              ${singleRow("SI", regs.si, "SI")}
              ${singleRow("DI", regs.di, "DI")}
              ${singleRow("IP", regs.ip, "IP")}
            </div>
          </div>
        </div>

        <!-- Flags Table -->
        <div class="flags-card" style="margin-top: 12px;">
          <div class="black-card-header flex-header">
            <span>Flags:</span>
            <span class="info-btn" data-info-title="Bayraklar Yazmac\u0131 (FLAGS Register)" data-info-desc="Son yap\u0131lan aritmetik ve mant\u0131ksal i\u015Flemlerin sonu\xE7lar\u0131n\u0131 (ZF, CF, SF vb.) ve i\u015Flemci kontrol modlar\u0131n\u0131 (DF, IF vb.) tutar." tabindex="-1">i</span>
          </div>
          <div class="flags-grid-table">
            ${flagCell("OF", flags.of)}
            ${flagCell("DF", flags.df)}
            ${flagCell("IF", flags.if)}
            ${flagCell("TF", flags.tf)}
            ${flagCell("SF", flags.sf)}
            ${flagCell("ZF", flags.zf)}
            ${flagCell("AF", flags.af)}
            ${flagCell("PF", flags.pf)}
            ${flagCell("CF", flags.cf)}
          </div>
        </div>
      </div>
    `;
  }
};

// src/ui/memoryView.ts
function getMemoryRegionLabel(phys) {
  if (phys < 0 || phys >= 1048576) return "1 MB S\u0131n\u0131r\u0131 D\u0131\u015F\u0131nda (Bellek Yok)";
  const p = phys & 1048575;
  if (p < 1024) return "IVT (Kesme Vekt\xF6r Tablosu - 0x00000)";
  if (p < 1280) return "BDA (BIOS Veri Alan\u0131 - 0x00400)";
  if (p >= 1280 && p < 655360) return "640 KB Ki\u015Fisel Alan (Konvansiyonel RAM - 0x00500 - 0x9FFFF)";
  if (p >= 655360 && p < 753664) return "EGA/VGA Grafik Video Belle\u011Fi";
  if (p >= 753664 && p < 786432) return "VRAM (80x25 Renkli Metin CRT Modu)";
  if (p >= 786432 && p < 983040) return "Video BIOS & Kart Geni\u015Fleme ROM";
  if (p >= 983040 && p < 1048560) return "ROM BIOS (Anakart Salt Okunur Belle\u011Fi)";
  if (p >= 1048560) return "CPU Power-On Reset Vekt\xF6r\xFC (0xFFFF0)";
  return "640 KB Ki\u015Fisel Alan (RAM)";
}
var MemoryView = class {
  container;
  currentBasePhys = 1280;
  defaultOriginPhys = 1280;
  userPinned = false;
  rowCount = 8;
  // 8 rows * 16 bytes = 128 bytes visible at a time
  onManualAddressChange;
  constructor(container, onManualAddressChange) {
    this.container = container;
    this.onManualAddressChange = onManualAddressChange;
  }
  jumpTo(seg, off) {
    const phys = ((seg & 65535) << 4) + (off & 65535) & 1048575;
    this.jumpToPhys(phys);
  }
  jumpToPhys(phys) {
    this.currentBasePhys = Math.max(0, phys & ~15);
  }
  syncOrigin(originPhys) {
    const alignedOrigin = Math.max(0, originPhys & ~15);
    if (!this.userPinned || alignedOrigin !== this.defaultOriginPhys) {
      this.defaultOriginPhys = alignedOrigin;
      this.userPinned = false;
      this.currentBasePhys = alignedOrigin;
    }
  }
  restoreViewState(originPhys, customPhys, userPinned = false) {
    const alignedOrigin = Math.max(0, originPhys & ~15);
    this.defaultOriginPhys = alignedOrigin;
    this.userPinned = userPinned;
    if (userPinned && customPhys !== void 0) {
      this.currentBasePhys = Math.max(0, customPhys & ~15);
    } else {
      this.currentBasePhys = alignedOrigin;
    }
  }
  getBasePhys() {
    return this.currentBasePhys;
  }
  isUserPinned() {
    return this.userPinned;
  }
  render(mem, regs) {
    const ipPhys = mem.toPhys(regs.cs, regs.ip);
    const regionName = getMemoryRegionLabel(this.currentBasePhys);
    let rowsHtml = "";
    for (let r = 0; r < this.rowCount; r++) {
      const rowPhys = this.currentBasePhys + r * 16;
      const rowHex = rowPhys.toString(16).toUpperCase().padStart(5, "0");
      let cellsHtml = "";
      let asciiHtml = "";
      for (let c = 0; c < 16; c++) {
        const cellPhys = rowPhys + c;
        if (cellPhys < 0 || cellPhys >= 1048576) {
          cellsHtml += `<span class="mem-byte-cell is-empty" title="0x${cellPhys.toString(16).toUpperCase()} (1 MB RAM D\u0131\u015F\u0131 - Veri Yok)" style="color: var(--text-muted); opacity: 0.35;">--</span>`;
          asciiHtml += ".";
          continue;
        }
        const val = mem.data[cellPhys];
        const hexVal = val.toString(16).toUpperCase().padStart(2, "0");
        const charStr = val >= 32 && val <= 126 ? String.fromCharCode(val) : ".";
        let cellClass = "mem-byte-cell";
        if (cellPhys === ipPhys) {
          cellClass += " is-ip";
        } else if (mem.lastWrites.has(cellPhys)) {
          cellClass += " is-written";
        } else {
          const type = mem.getCellType(cellPhys);
          if (type === "code") cellClass += " is-code";
          else if (type === "data") cellClass += " is-data";
        }
        const safeChar = charStr === "<" ? "&lt;" : charStr === ">" ? "&gt;" : charStr === "&" ? "&amp;" : charStr;
        cellsHtml += `<span class="${cellClass}" title="0x${cellPhys.toString(16).toUpperCase()} = 0x${hexVal} ('${safeChar}')">${hexVal}</span>`;
        asciiHtml += safeChar;
      }
      rowsHtml += `
        <div class="mem-row-wrapper">
          <span class="mem-row-addr">${rowHex}:</span>
          <div class="mem-row">${cellsHtml}</div>
          <span class="mem-row-ascii">${asciiHtml}</span>
        </div>
      `;
    }
    const addrHex = this.currentBasePhys.toString(16).toUpperCase().padStart(5, "0");
    this.container.innerHTML = `
      <div class="memory-card">
        <div class="memory-header-row">
          <div class="memory-title">
            <span>Memory (1 MB)</span>
            <span class="info-btn" data-info-title="1 MB Ger\xE7ek Mod Belle\u011Fi" data-info-desc="00000h - FFFFFh aras\u0131 20-bitlik fiziksel bellek alan\u0131n\u0131 g\xF6r\xFCnt\xFCler. 1 MB s\u0131n\u0131r\u0131n\u0131n \xF6tesinde bellek bulunmaz. Ye\u015Fil: Kod b\xF6lgesi, Mavi: Veri b\xF6lgesi, Turuncu: CS:IP, K\u0131rm\u0131z\u0131: Son yaz\u0131lan adres." tabindex="-1">i</span>
          </div>
          <div class="memory-address-control">
            <div class="start-addr-col">
              <span class="start-addr-label">
                Start Address
                <span class="info-btn" data-info-title="Bellek Ba\u015Flang\u0131\xE7 Adresi" data-info-desc="G\xF6r\xFCnt\xFClenecek 20-bitlik fiziksel ba\u015Flang\u0131\xE7 adresini (00000h - FFFFFh) belirler. De\u011Feri yaz\u0131p SET butonuna basarak atlayabilirsiniz." tabindex="-1">i</span>
              </span>
              <input type="text" id="mem-start-addr-input" class="start-addr-input" value="${addrHex}" />
            </div>
            <button id="btn-mem-set" class="btn-set">SET</button>
          </div>
        </div>

        <!-- H\u0131zl\u0131 Konum Atlama Butonlar\u0131 -->
        <div class="memory-quick-jumps">
          <button class="mem-jump-btn ${this.currentBasePhys === 0 ? "active" : ""}" data-addr="00000" title="Kesme Vekt\xF6r Tablosu (0x00000)">IVT</button>
          <button class="mem-jump-btn ${this.currentBasePhys === 1024 ? "active" : ""}" data-addr="00400" title="BIOS Veri Alan\u0131 (0x00400)">BDA</button>
          <button class="mem-jump-btn ${this.currentBasePhys >= 1280 && this.currentBasePhys < 655360 ? "active" : ""}" data-addr="00500" title="640 KB Ki\u015Fisel Alan / Kullan\u0131c\u0131 RAM (0x00500 - 0x9FFFF)">640 KB RAM</button>
          <button class="mem-jump-btn ${this.currentBasePhys >= 655360 && this.currentBasePhys < 753664 ? "active" : ""}" data-addr="A0000" title="VGA Mode 13h Grafik Belle\u011Fi (0xA0000)">VGA (A0000)</button>
          <button class="mem-jump-btn ${this.currentBasePhys >= 753664 && this.currentBasePhys < 786432 ? "active" : ""}" data-addr="B8000" title="CGA/VGA Renkli Metin Belle\u011Fi (0xB8000)">VRAM</button>
          <button class="mem-jump-btn ${this.currentBasePhys === 983040 ? "active" : ""}" data-addr="F0000" title="ROM BIOS Alan\u0131 (0xF0000)">ROM BIOS</button>
          <button class="mem-jump-btn ${this.currentBasePhys === 1048560 ? "active" : ""}" data-addr="FFFF0" title="CPU Power-On Reset Vekt\xF6r\xFC (0xFFFF0)">Reset</button>
        </div>

        <!-- B\xF6lge Bilgi Rozeti -->
        <div class="memory-region-badge">
          <span class="region-pin">\u{1F4CD} B\xF6lge:</span> <span class="region-name">${regionName}</span>
        </div>

        <div class="memory-grid-box">
          ${rowsHtml}
        </div>
      </div>
    `;
    this.attachEvents(mem, regs);
  }
  attachEvents(mem, regs) {
    const input = this.container.querySelector("#mem-start-addr-input");
    const btnSet = this.container.querySelector("#btn-mem-set");
    const applyAddr = (rawVal) => {
      const val = (rawVal !== void 0 ? rawVal : input.value).trim().toUpperCase().replace(/H$/, "");
      let targetPhys = 0;
      if (val.includes(":")) {
        const parts = val.split(":");
        const seg = parseInt(parts[0].replace(/H$/, ""), 16) || 0;
        const off = parseInt(parts[1].replace(/H$/, ""), 16) || 0;
        targetPhys = mem.toPhys(seg, off);
      } else {
        targetPhys = parseInt(val, 16) || 0;
      }
      this.userPinned = true;
      this.jumpToPhys(targetPhys);
      this.onManualAddressChange?.(this.currentBasePhys);
      this.render(mem, regs);
    };
    btnSet?.addEventListener("click", () => applyAddr());
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyAddr();
    });
    if (typeof this.container.querySelectorAll === "function") {
      const jumpBtns = this.container.querySelectorAll(".mem-jump-btn");
      jumpBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const addrStr = btn.getAttribute("data-addr");
          if (addrStr) {
            applyAddr(addrStr);
          }
        });
      });
    }
  }
};

// src/ui/console.ts
var CGA_PALETTE = [
  "#000000",
  "#0000aa",
  "#00aa00",
  "#00aaaa",
  "#aa0000",
  "#aa00aa",
  "#aa5500",
  "#aaaaaa",
  "#555555",
  "#5555ff",
  "#55ff55",
  "#55ffff",
  "#ff5555",
  "#ff55ff",
  "#ffff55",
  "#ffffff"
];
var VGA_256_RGB = (() => {
  const palette = [];
  const cgaHex = [
    0,
    170,
    43520,
    43690,
    11141120,
    11141290,
    11162880,
    11184810,
    5592405,
    5592575,
    5635925,
    5636095,
    16733525,
    16733695,
    16777045,
    16777215
  ];
  for (const h of cgaHex) {
    palette.push([h >> 16 & 255, h >> 8 & 255, h & 255]);
  }
  for (let i = 0; i < 16; i++) {
    const val = Math.round(i / 15 * 255);
    palette.push([val, val, val]);
  }
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        palette.push([Math.round(r / 5 * 255), Math.round(g / 5 * 255), Math.round(b / 5 * 255)]);
      }
    }
  }
  while (palette.length < 256) {
    palette.push([0, 0, 0]);
  }
  return palette;
})();
var ConsoleView = class {
  container;
  memory;
  onInput;
  onVideoModeChange;
  isWaiting = false;
  // Donanımsal imleç yanıp sönme (blink) durumu
  cursorBlink = true;
  blinkTimer = null;
  // Çizim tamponları (320x200 VRAM -> 800x600 Keskin Canvas)
  canvasCtx = null;
  offscreenCanvas = null;
  offscreenCtx = null;
  offscreenImgData = null;
  // Render optimizasyonu (requestAnimationFrame)
  vramDirty = false;
  animFrameId = null;
  // Canvas Tanılama ve Değişiklik Takip Sistemi
  canvasHistory = [];
  lastPixelChange = null;
  recentChangeCount = 0;
  bulkTimer = null;
  activePixelCount = 0;
  isHistoryOpen = false;
  currentMonitorSize = "large";
  constructor(container, options) {
    this.container = container;
    this.memory = options?.memory ?? new Memory();
    this.onInput = options?.onInput;
    this.onVideoModeChange = options?.onVideoModeChange;
    this.render();
    this.startBlinkTimer();
  }
  /**
   * Doğrudan bağlı olduğu 1 MB fiziksel RAM tamponunu döner.
   */
  getMemoryData() {
    return this.memory.data;
  }
  /**
   * BDA (0040:0049h) adresindeki donanımsal video modunu döner.
   */
  get videoMode() {
    return this.memory.data[1097] || 3;
  }
  /**
   * Video modunu BDA (0x0449) üzerinde günceller ve konsola raporlar.
   */
  setVideoMode(mode) {
    const cleanMode = mode & 255;
    this.memory.data[1097] = cleanMode;
    this.onVideoModeChange?.(cleanMode);
    if (typeof console !== "undefined" && console.log) {
      console.log(
        `%c[CANVAS V\u0130DEO MODU]%c Mod de\u011Fi\u015Fti -> 0x${cleanMode.toString(16).toUpperCase().padStart(2, "0")} (${cleanMode === 19 ? "Mode 13h (320x200 256 Renk Grafik)" : "Mode 03h (80x25 Metin)"})`,
        "background: #8b5cf6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;",
        "color: #c084fc; font-family: monospace; font-size: 11px;"
      );
    }
    this.vramDirty = true;
    this.refreshCrtScreen();
  }
  /**
   * VRAM'e yazılan her baytı yakalayıp analiz eder ve raporlar.
   */
  recordVramChange(phys, val) {
    if (phys >= 655360 && phys < 655360 + 64e3) {
      const offset = phys - 655360;
      const x = offset % 320;
      const y = Math.floor(offset / 320);
      const colorIdx = val & 255;
      const [r, g, b] = VGA_256_RGB[colorIdx] || [0, 0, 0];
      const hexColor = colorIdx.toString(16).toUpperCase().padStart(2, "0");
      const rgbStr = `rgb(${r}, ${g}, ${b})`;
      const physHex = phys.toString(16).toUpperCase().padStart(5, "0");
      const changeRecord = {
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        x,
        y,
        colorIdx,
        hexColor,
        rgbStr,
        physHex,
        offset
      };
      this.lastPixelChange = changeRecord;
      this.canvasHistory.unshift(changeRecord);
      if (this.canvasHistory.length > 50) {
        this.canvasHistory.pop();
      }
      if (typeof console !== "undefined" && console.log) {
        if (this.recentChangeCount < 30) {
          console.log(
            `%c[CANVAS DE\u011E\u0130\u015E\u0130KL\u0130\u011E\u0130]%c (X: ${x}, Y: ${y}) pikseline 0x${hexColor} (${rgbStr}) yaz\u0131ld\u0131 | Adres: 0x${physHex} | Ofset: ${offset}`,
            "background: #0284c7; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;",
            "color: #38bdf8; font-family: monospace; font-size: 11px;"
          );
        }
      }
      this.recentChangeCount++;
      if (!this.bulkTimer && typeof setTimeout !== "undefined") {
        this.bulkTimer = setTimeout(() => {
          if (this.recentChangeCount > 30 && typeof console !== "undefined" && console.log) {
            console.log(
              `%c[CANVAS TOPLU \xC7\u0130Z\u0130M]%c Toplam ${this.recentChangeCount} piksel de\u011Fi\u015Fikli\u011Fi yap\u0131ld\u0131. Son piksel: (X: ${this.lastPixelChange?.x}, Y: ${this.lastPixelChange?.y}) Renk: 0x${this.lastPixelChange?.hexColor}`,
              "background: #10b981; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;",
              "color: #34d399; font-family: monospace; font-size: 11px;"
            );
          }
          this.recentChangeCount = 0;
          this.bulkTimer = null;
        }, 80);
      }
      this.updateDiagBar();
    }
  }
  /**
   * UI üzerindeki canlı Canvas Tanılama Çubuğunu günceller.
   */
  updateDiagBar() {
    if (!this.container) return;
    const lastChangeEl = this.container.querySelector("#crt-diag-last-change");
    if (lastChangeEl) {
      if (this.lastPixelChange) {
        lastChangeEl.innerHTML = `<span style="color: #38bdf8;">(X: ${this.lastPixelChange.x}, Y: ${this.lastPixelChange.y})</span> &rarr; Renk: <span style="display:inline-block;width:9px;height:9px;background:${this.lastPixelChange.rgbStr};border:1px solid #475569;border-radius:2px;vertical-align:middle;margin:0 3px;"></span>0x${this.lastPixelChange.hexColor} <span style="color:#64748b;">@ 0x${this.lastPixelChange.physHex}</span>`;
      } else {
        lastChangeEl.textContent = "Hen\xFCz \xE7izim yap\u0131lmad\u0131";
      }
    }
    const pixelCountEl = this.container.querySelector("#crt-diag-pixel-count");
    if (pixelCountEl) {
      pixelCountEl.textContent = `Aktif Piksel: ${this.activePixelCount} / 64,000`;
    }
    const btnHistory = this.container.querySelector("#btn-toggle-canvas-history");
    if (btnHistory) {
      btnHistory.textContent = `Ge\xE7mi\u015F (${this.canvasHistory.length})`;
    }
    if (this.isHistoryOpen) {
      this.renderHistoryList();
    }
  }
  renderHistoryList() {
    const listEl = this.container.querySelector("#crt-canvas-history-list");
    if (!listEl) return;
    if (this.canvasHistory.length === 0) {
      listEl.innerHTML = '<span style="color: #64748b; font-style: italic;">Kay\u0131tl\u0131 \xE7izim i\u015Flemi bulunmuyor.</span>';
      return;
    }
    let html = "";
    for (let i = 0; i < Math.min(25, this.canvasHistory.length); i++) {
      const item = this.canvasHistory[i];
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #1e293b; color: #94a3b8;">
          <span>
            <span style="color: #38bdf8; font-weight: 600;">[${item.time}]</span>
            (X: ${item.x}, Y: ${item.y}) &rarr; Renk:
            <span style="display: inline-block; width: 9px; height: 9px; background: ${item.rgbStr}; border: 1px solid #475569; border-radius: 2px; vertical-align: middle; margin: 0 3px;"></span>
            <span style="color: #f8fafc; font-weight: 600;">0x${item.hexColor}</span>
          </span>
          <span style="color: #64748b;">0x${item.physHex} (Ofset: ${item.offset})</span>
        </div>
      `;
    }
    listEl.innerHTML = html;
  }
  /**
   * Doğrudan fiziksel VRAM'e (0xB8000) karakter ve öznitelik yazar.
   */
  writeStringToVram(row, col, text, attr = 7) {
    for (let i = 0; i < text.length; i++) {
      if (col + i >= 80) break;
      const offset = 753664 + (row * 80 + col + i) * 2;
      this.memory.data[offset] = text.charCodeAt(i);
      this.memory.data[offset + 1] = attr & 255;
    }
    this.vramDirty = true;
    this.scheduleRender();
  }
  destroy() {
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.animFrameId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.bulkTimer !== null) {
      clearTimeout(this.bulkTimer);
      this.bulkTimer = null;
    }
  }
  setOnInput(callback) {
    this.onInput = callback;
  }
  startBlinkTimer() {
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (typeof setInterval === "function") {
      this.blinkTimer = setInterval(() => {
        this.cursorBlink = !this.cursorBlink;
        if (this.videoMode !== 19) {
          this.refreshCrtScreen();
        }
      }, 500);
    }
  }
  log(text, level = "info") {
    if (typeof console !== "undefined") {
      if (level === "error") {
        console.error(`[AssemblySim] ${text}`);
      } else if (level === "warn") {
        console.warn(`[AssemblySim] ${text}`);
      } else {
        console.log(`[AssemblySim] ${text}`);
      }
    }
  }
  appendStdout(charOrStr) {
    if (typeof console !== "undefined" && console.log) {
      console.log(`[AssemblySim STDOUT] ${charOrStr}`);
    }
  }
  isWaitingForInput() {
    return this.isWaiting;
  }
  setRunningState(running) {
    if (this.isWaiting) return;
    const badge = this.container.querySelector?.("#crt-status-text");
    if (badge) {
      badge.textContent = running ? "\xC7ALI\u015EIYOR" : "HAZIR";
    }
  }
  setWaitingForInput(waiting, hint) {
    this.isWaiting = waiting;
    const badge = this.container.querySelector?.("#crt-status-text");
    const input = this.container.querySelector?.("#console-input-field");
    if (badge) {
      badge.textContent = waiting ? hint || "G\u0130RD\u0130 BEKLEN\u0130YOR" : "HAZIR";
    }
    if (waiting) {
      this.refreshCrtScreen();
      if (input) {
        input.placeholder = hint || "Klavyeden tu\u015Fa bas\u0131n...";
        input.focus();
      }
    } else {
      if (input) {
        input.placeholder = "Klavye girdisi (Port 60h / INT 16h / INT 21h)...";
      }
    }
  }
  /**
   * Monitör ekranını ve donanımsal VRAM alanlarını (0xB8000 ve 0xA0000) temizler.
   */
  clear() {
    for (let i = 0; i < 2e3; i++) {
      const off = 753664 + i * 2;
      this.memory.data[off] = 32;
      this.memory.data[off + 1] = 7;
    }
    this.memory.data.fill(0, 655360, 655360 + 64e3);
    this.memory.data[1104] = 0;
    this.memory.data[1105] = 0;
    this.memory.data[1097] = 3;
    this.activePixelCount = 0;
    this.lastPixelChange = null;
    this.canvasHistory = [];
    if (typeof console !== "undefined" && console.log) {
      console.log(
        "%c[CANVAS TEM\u0130ZLEND\u0130]%c 0xA0000 Grafik VRAM ve 0xB8000 Metin VRAM s\u0131f\u0131rland\u0131.",
        "background: #ef4444; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;",
        "color: #f87171; font-family: monospace; font-size: 11px;"
      );
    }
    this.refreshCrtScreen();
  }
  /**
   * Bellek içeriği değiştiğinde CRT ekranını günceller.
   */
  updateVram(memoryAll) {
    if (memoryAll && memoryAll !== this.memory.data) {
      const copyLen = Math.min(memoryAll.length, this.memory.data.length);
      this.memory.data.set(memoryAll.subarray(0, copyLen));
    }
    if (this.videoMode !== 19) {
      const u32 = new Uint32Array(this.memory.data.buffer, 655360, 16e3);
      for (let i = 0; i < 16e3; i++) {
        if (u32[i] !== 0) {
          this.memory.data[1097] = 19;
          if (typeof console !== "undefined" && console.log) {
            console.log("%c[CANVAS OTO-MOD]%c 0xA0000 VRAM alan\u0131nda veri alg\u0131land\u0131, Mode 13h otomatik aktifle\u015Fti.", "background: #3b82f6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;", "color: #60a5fa;");
          }
          break;
        }
      }
    }
    this.vramDirty = true;
    this.scheduleRender();
  }
  scheduleRender() {
    if (typeof window === "undefined" || typeof requestAnimationFrame === "undefined") {
      this.refreshCrtScreen();
      return;
    }
    if (this.animFrameId !== null) return;
    this.animFrameId = window.requestAnimationFrame(() => {
      this.animFrameId = null;
      if (this.vramDirty) {
        this.vramDirty = false;
        this.refreshCrtScreen();
      }
    });
  }
  render() {
    if (!this.container) return;
    const isGraphics = this.videoMode === 19;
    const modeLabel = isGraphics ? "13h GRAF\u0130K (320x200)" : "03h MET\u0130N (80x25)";
    this.container.innerHTML = `
      <div class="console-box" style="display: flex; flex-direction: column; height: 100%; min-height: 520px; background: #0c1017; border-radius: 8px; overflow: hidden; border: 1px solid #1e293b; box-sizing: border-box;">
        <!-- Monit\xF6r Donan\u0131m Ba\u015Fl\u0131\u011F\u0131 ve Boyut Kontrolleri -->
        <div class="console-header-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; height: 34px; min-height: 34px; flex-shrink: 0; background: #111827; border-bottom: 1px solid #1f2937; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e;"></span>
            <span style="font-size: 11px; font-weight: 700; color: #e2e8f0; letter-spacing: 0.5px;">MON\u0130T\xD6R</span>
            <span id="crt-monitor-title" style="font-size: 9.5px; font-weight: 600; padding: 1px 7px; border-radius: 4px; background: #1e293b; color: #38bdf8; user-select: none; border: 1px solid #334155;">${modeLabel}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- Monit\xF6r Boyut Se\xE7ici -->
            <div class="crt-size-selector" style="display: flex; align-items: center; gap: 2px; background: #0b0f19; padding: 2px; border-radius: 4px; border: 1px solid #1e293b;">
              <span style="font-size: 9px; color: #64748b; padding: 0 4px; font-weight: 600;">Boyut:</span>
              <button id="btn-size-normal" class="btn-crt-size" title="Standart Boyut (640x480)" style="padding: 2px 7px; font-size: 9.5px; font-weight: 600; background: transparent; border: none; color: #94a3b8; border-radius: 3px; cursor: pointer;">Standart</button>
              <button id="btn-size-large" class="btn-crt-size" title="B\xFCy\xFCk Boyut (840x630)" style="padding: 2px 7px; font-size: 9.5px; font-weight: 700; background: #2563eb; border: none; color: #ffffff; border-radius: 3px; cursor: pointer;">B\xFCy\xFCk</button>
              <button id="btn-size-huge" class="btn-crt-size" title="Geni\u015F Boyut (1060x795)" style="padding: 2px 7px; font-size: 9.5px; font-weight: 600; background: transparent; border: none; color: #94a3b8; border-radius: 3px; cursor: pointer;">Geni\u015F</button>
              <button id="btn-size-fullscreen" class="btn-crt-size" title="Monit\xF6r\xFC Tam Ekran Yap" style="padding: 2px 7px; font-size: 9.5px; font-weight: 600; background: transparent; border: none; color: #38bdf8; border-radius: 3px; cursor: pointer;">\u26F6 Tam Ekran</button>
            </div>

            <span id="crt-status-text" style="font-size: 9.5px; font-weight: 600; color: #94a3b8;">HAZIR</span>
            <button id="btn-console-clear" title="Ekran\u0131 Temizle" style="padding: 2px 7px; font-size: 9.5px; background: #1f2937; border: 1px solid #374151; color: #cbd5e1; border-radius: 3px; cursor: pointer;">Temizle</button>
          </div>
        </div>

        <!-- Canl\u0131 Canvas Tan\u0131lama ve De\u011Fi\u015Fiklik Raporu \xC7ubu\u011Fu -->
        <div id="crt-canvas-diag-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 12px; height: 28px; min-height: 28px; flex-shrink: 0; background: #0f172a; border-bottom: 1px solid #1e293b; font-size: 10.5px; font-family: 'JetBrains Mono', Consolas, monospace; color: #94a3b8; user-select: none; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 6px #38bdf8;"></span>
            <span style="color: #38bdf8; font-weight: 700; letter-spacing: 0.3px;">CANVAS RAPORU:</span>
            <span id="crt-diag-last-change" style="color: #f1f5f9; font-weight: 500;">Hen\xFCz \xE7izim yap\u0131lmad\u0131</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <span id="crt-diag-pixel-count" style="color: #cbd5e1; font-weight: 600;">Aktif Piksel: 0 / 64,000</span>
            <button id="btn-toggle-canvas-history" style="padding: 2px 8px; font-size: 9.5px; font-weight: 700; background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; cursor: pointer;">Ge\xE7mi\u015F (0)</button>
          </div>
        </div>

        <!-- A\xE7\u0131l\u0131r De\u011Fi\u015Fiklik Ge\xE7mi\u015Fi Listesi -->
        <div id="crt-canvas-history-panel" style="display: none; max-height: 120px; overflow-y: auto; background: #030712; border-bottom: 1px solid #1e293b; padding: 6px 12px; font-size: 9.5px; font-family: 'JetBrains Mono', monospace; box-sizing: border-box;">
          <div id="crt-canvas-history-list" style="display: flex; flex-direction: column; gap: 3px;"></div>
        </div>

        <!-- CRT Ekran\u0131: DA\u0130MA VE B\u0130ZZAT <canvas id="myCanvas"> ELEMANIDIR -->
        <div class="crt-screen-wrapper" style="flex: 1 1 auto; min-height: 520px; position: relative; background: radial-gradient(circle at center, #0b1120 0%, #020617 100%); padding: 14px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
          <canvas id="myCanvas" class="crt-graphics-canvas" width="800" height="600" style="width: 100%; max-width: 840px; height: auto; aspect-ratio: 4/3; object-fit: contain; image-rendering: pixelated; display: block; background: #000000; border: 3px solid #38bdf8; border-radius: 8px; box-shadow: 0 0 30px rgba(56, 189, 248, 0.35);"></canvas>
        </div>

        <!-- Alt Klavye Girdi \xC7ubu\u011Fu -->
        <div class="console-input-wrap" style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; height: 34px; min-height: 34px; flex-shrink: 0; background: #0b0f17; border-top: 1px solid #1e293b; box-sizing: border-box;">
          <span style="color: #38bdf8; font-weight: 700; font-size: 11px;">\u276F</span>
          <input type="text" id="console-input-field" placeholder="Klavye girdisi (Port 60h / INT 16h / INT 21h)..." autocomplete="off" style="flex: 1; background: #020617; border: 1px solid #1e293b; border-radius: 4px; padding: 3px 8px; color: #f8fafc; font-size: 11px; font-family: 'JetBrains Mono', monospace; outline: none;" />
          <button id="btn-console-send" style="padding: 3px 10px; font-size: 10.5px; font-weight: 600; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; cursor: pointer;">G\xF6nder</button>
        </div>
      </div>
    `;
    this.bindEvents();
    this.refreshCrtScreen();
  }
  refreshCrtScreen() {
    const titleEl = this.container.querySelector?.("#crt-monitor-title");
    if (titleEl) {
      titleEl.textContent = this.videoMode === 19 ? "13h GRAF\u0130K (320x200)" : "03h MET\u0130N (80x25)";
    }
    const canvas = this.container.querySelector?.("#myCanvas") || this.container.querySelector?.("#crt-graphics-canvas");
    if (!canvas) return;
    if (!this.canvasCtx || this.canvasCtx.canvas !== canvas) {
      this.canvasCtx = canvas.getContext?.("2d") ?? null;
    }
    if (!this.canvasCtx) return;
    if (this.videoMode === 19) {
      this.paintGraphicsCanvas(canvas);
    } else {
      this.paintTextCanvas(canvas);
    }
    this.updateDiagBar();
  }
  /**
   * 80x25 Metin Modunu doğrudan 800x600 tuval üzerine çizer.
   * (HTML spans yok, DOM çöplüğü yok!)
   */
  paintTextCanvas(canvas) {
    const ctx = this.canvasCtx;
    if (!ctx) return;
    const cellW = 10;
    const cellH = 24;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px "JetBrains Mono", Consolas, monospace';
    ctx.textBaseline = "top";
    const cursorCol = Math.min(79, this.memory.data[1104] || 0);
    const cursorRow = Math.min(24, this.memory.data[1105] || 0);
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 80; col++) {
        const offset = 753664 + (row * 80 + col) * 2;
        const charCode = this.memory.data[offset] ?? 32;
        const attr = this.memory.data[offset + 1] ?? 7;
        const fg = attr & 15;
        const bgAttr = attr >> 4 & 7;
        const fgColor = CGA_PALETTE[fg] || "#ffffff";
        const bgColor = bgAttr === 0 ? null : CGA_PALETTE[bgAttr] || null;
        const x = col * cellW;
        const y = row * cellH;
        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(x, y, cellW, cellH);
        }
        if (charCode !== 0 && charCode !== 32) {
          const char = charCode < 32 || charCode > 126 ? "\u2022" : String.fromCharCode(charCode);
          ctx.fillStyle = fgColor;
          ctx.fillText(char, x + 1, y + 4);
        }
        if (row === cursorRow && col === cursorCol && this.cursorBlink) {
          ctx.fillStyle = fgColor;
          ctx.fillRect(x, y + cellH - 3, cellW, 3);
        }
      }
    }
  }
  /**
   * Mode 13h Grafik Modunu doğrudan 800x600 tuval üzerine rasterize eder.
   */
  paintGraphicsCanvas(canvas) {
    const ctx = this.canvasCtx;
    if (!ctx) return;
    if (!this.offscreenCanvas && typeof document !== "undefined") {
      this.offscreenCanvas = document.createElement("canvas");
      this.offscreenCanvas.width = 320;
      this.offscreenCanvas.height = 200;
      this.offscreenCtx = this.offscreenCanvas.getContext("2d");
    }
    if (this.offscreenCtx && !this.offscreenImgData && typeof this.offscreenCtx.createImageData === "function") {
      this.offscreenImgData = this.offscreenCtx.createImageData(320, 200);
    }
    let activeCount = 0;
    if (this.offscreenCtx && this.offscreenImgData) {
      const data = this.offscreenImgData.data;
      for (let i = 0; i < 64e3; i++) {
        const colorIdx = this.memory.data[655360 + i];
        if (colorIdx !== 0) {
          activeCount++;
        }
        const [r, g, b] = VGA_256_RGB[colorIdx] || [0, 0, 0];
        const pixelOffset = i * 4;
        data[pixelOffset] = r;
        data[pixelOffset + 1] = g;
        data[pixelOffset + 2] = b;
        data[pixelOffset + 3] = 255;
      }
      this.offscreenCtx.putImageData(this.offscreenImgData, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.offscreenCanvas, 0, 0, canvas.width, canvas.height);
    } else {
      if (typeof ctx.createImageData === "function") {
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        ctx.putImageData?.(imgData, 0, 0);
      }
    }
    this.activePixelCount = activeCount;
    if (typeof console !== "undefined" && console.log) {
      console.log(
        `%c[CANVAS RENDER]%c #myCanvas (800x600) g\xFCncellendi. Aktif piksel: ${activeCount} / 64,000`,
        "background: #f59e0b; color: #000000; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;",
        "color: #fbbf24; font-family: monospace; font-size: 11px;"
      );
      if (activeCount === 0) {
        console.warn("[CANVAS UYARI] VRAM (0xA0000) tamamen 00 (bo\u015F/siyah). #myCanvas \xFCzerinde hi\xE7bir piksel g\xF6r\xFCnmez.");
      }
    }
  }
  bindEvents() {
    const clearBtn = this.container.querySelector?.("#btn-console-clear");
    clearBtn?.addEventListener?.("click", () => this.clear());
    const historyBtn = this.container.querySelector?.("#btn-toggle-canvas-history");
    const historyPanel = this.container.querySelector?.("#crt-canvas-history-panel");
    historyBtn?.addEventListener?.("click", () => {
      this.isHistoryOpen = !this.isHistoryOpen;
      if (historyPanel) {
        historyPanel.style.display = this.isHistoryOpen ? "block" : "none";
      }
      if (this.isHistoryOpen) {
        this.renderHistoryList();
      }
    });
    const sendBtn = this.container.querySelector?.("#btn-console-send");
    const inputField = this.container.querySelector?.("#console-input-field");
    const handleSend = () => {
      if (!inputField) return;
      const val = inputField.value;
      this.onInput?.(val + "\r");
      inputField.value = "";
    };
    sendBtn?.addEventListener?.("click", handleSend);
    inputField?.addEventListener?.("keydown", (e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    });
    const setSize = (size) => {
      this.currentMonitorSize = size;
      const canvas = this.container.querySelector?.("#myCanvas");
      const screenWrapper = this.container.querySelector?.(".crt-screen-wrapper");
      if (!canvas || !screenWrapper) return;
      const btnNormal = this.container.querySelector?.("#btn-size-normal");
      const btnLarge = this.container.querySelector?.("#btn-size-large");
      const btnHuge = this.container.querySelector?.("#btn-size-huge");
      [btnNormal, btnLarge, btnHuge].forEach((b) => {
        if (b) {
          b.style.background = "transparent";
          b.style.color = "#94a3b8";
          b.style.fontWeight = "600";
        }
      });
      if (size === "normal") {
        canvas.style.maxWidth = "640px";
        screenWrapper.style.minHeight = "420px";
        if (btnNormal) {
          btnNormal.style.background = "#2563eb";
          btnNormal.style.color = "#ffffff";
          btnNormal.style.fontWeight = "700";
        }
      } else if (size === "large") {
        canvas.style.maxWidth = "840px";
        screenWrapper.style.minHeight = "520px";
        if (btnLarge) {
          btnLarge.style.background = "#2563eb";
          btnLarge.style.color = "#ffffff";
          btnLarge.style.fontWeight = "700";
        }
      } else if (size === "huge") {
        canvas.style.maxWidth = "1060px";
        screenWrapper.style.minHeight = "640px";
        if (btnHuge) {
          btnHuge.style.background = "#2563eb";
          btnHuge.style.color = "#ffffff";
          btnHuge.style.fontWeight = "700";
        }
      }
    };
    this.container.querySelector?.("#btn-size-normal")?.addEventListener?.("click", () => setSize("normal"));
    this.container.querySelector?.("#btn-size-large")?.addEventListener?.("click", () => setSize("large"));
    this.container.querySelector?.("#btn-size-huge")?.addEventListener?.("click", () => setSize("huge"));
    this.container.querySelector?.("#btn-size-fullscreen")?.addEventListener?.("click", () => {
      const consoleBox = this.container.querySelector?.(".console-box");
      if (!consoleBox) return;
      if (!document.fullscreenElement) {
        consoleBox.requestFullscreen?.().catch(() => {
        });
      } else {
        document.exitFullscreen?.().catch(() => {
        });
      }
    });
  }
};

// src/ui/instructionData.ts
var CATEGORIES = [
  { id: "all", label: "T\xFCm\xFC" },
  { id: "data", label: "Veri Transferi" },
  { id: "arithmetic", label: "Aritmetik" },
  { id: "bcd", label: "BCD Aritmeti\u011Fi" },
  { id: "logical", label: "Mant\u0131k & Kayd\u0131rma" },
  { id: "control", label: "Atlama & D\xF6ng\xFC" },
  { id: "string", label: "Dizi (String)" },
  { id: "flags", label: "Bayrak & Kontrol" },
  { id: "directives", label: "Y\xF6nergeler" }
];
var INSTRUCTIONS = [
  // --- VERİ TRANSFERİ ---
  {
    opcode: "MOV",
    name: "Move (Veri Transferi)",
    category: "data",
    summary: "Kaynaktaki veriyi hedefe kopyalar. Kaynak de\u011Fi\u015Fmez, hedef yeni de\u011Feri al\u0131r.",
    flags: "Hi\xE7bir bayra\u011F\u0131 etkilemez.",
    rules: "8086 kurallar\u0131: Bellekten belle\u011Fe do\u011Frudan MOV yap\u0131lamaz. Segmente do\u011Frudan sabit (immediate) say\u0131 y\xFCklenemez. CS segmentine hedef olarak MOV yap\u0131lamaz.",
    variations: [
      {
        syntax: "MOV reg, reg",
        description: "Bir yazma\xE7taki de\u011Feri di\u011Ferine kopyalar (8-bit veya 16-bit).",
        example: "MOV AX, 1234H\nMOV BX, AX       ; BX = 1234H olur",
        note: "Her iki yazma\xE7 ayn\u0131 boyutta olmal\u0131d\u0131r (AX ve BX 16-bit, AL ve BL 8-bit)."
      },
      {
        syntax: "MOV reg, imm",
        description: "Bir yazmaca do\u011Frudan sabit say\u0131sal de\u011Fer y\xFCkler.",
        example: "MOV AX, 0FFFFH   ; AX = FFFFh\nMOV CL, 10       ; CL = 10 (0Ah)",
        note: "Sabit say\u0131 hedef yazmac\u0131n boyutuna uygun olmal\u0131d\u0131r."
      },
      {
        syntax: "MOV reg, [mem]",
        description: "Belirtilen bellek adresindeki veriyi yazmaca okur.",
        example: "MOV SI, 200H\nMOV AX, [SI]     ; DS:0200h adresindeki 16-bit kelimeyi AX'e okur",
        note: "Adresleme [BX], [BP], [SI], [DI] veya bunlar\u0131n toplam\u0131 ile yap\u0131labilir."
      },
      {
        syntax: "MOV [mem], reg",
        description: "Yazma\xE7taki de\u011Feri belirtilen bellek adresine yazar.",
        example: "MOV AL, 55H\nMOV [DI], AL     ; DS:DI adresine 55h yazar",
        note: "Yazmac\u0131n boyutu bellek yazma geni\u015Fli\u011Fini (8 veya 16 bit) otomatik belirler."
      },
      {
        syntax: "MOV [mem], imm",
        description: "Do\u011Frudan sabit bir de\u011Feri bellek h\xFCcresine yazar.",
        example: "MOV BYTE PTR [BX], 0AAH  ; 1 bayt yazar\nMOV WORD PTR [BX], 1234H ; 2 bayt yazar",
        note: "Boyut belirsizli\u011Fini \xF6nlemek i\xE7in BYTE PTR veya WORD PTR zorunludur!"
      },
      {
        syntax: "MOV seg, reg16",
        description: "Bir segment yazmac\u0131na 16-bit genel yazma\xE7tan de\u011Fer atar.",
        example: "MOV AX, 0700H\nMOV DS, AX       ; DS = 0700h olarak ayarlan\u0131r",
        note: "Segment yazma\xE7lar\u0131na do\u011Frudan sabit y\xFCklenemez (MOV DS, 1000h ge\xE7ersizdir!)."
      },
      {
        syntax: "MOV reg16, seg",
        description: "Segment yazmac\u0131n\u0131n mevcut de\u011Ferini genel yazmaca kopyalar.",
        example: "MOV AX, CS       ; AX = Kod segmenti adresi",
        note: "CS, DS, SS, ES okunabilir."
      }
    ]
  },
  {
    opcode: "LEA",
    name: "Load Effective Address (Efektif Adres Y\xFCkleme)",
    category: "data",
    summary: "Kaynak bellek operand\u0131n\u0131n ofset adresini hesaplayarak 16-bit yazmaca y\xFCkler.",
    flags: "Bayraklar\u0131 etkilemez.",
    rules: "Kaynak operand mutlaka bir bellek adresi veya etiket olmal\u0131d\u0131r. Do\u011Frudan sabit say\u0131 kabul edilmez.",
    variations: [
      {
        syntax: "LEA reg16, label",
        description: "Bir veri etiketinin 16-bit ofset adresini g\xF6stericiye y\xFCkler.",
        example: "LEA SI, DIZI     ; DIZI etiketinin ofsetini SI'ya y\xFCkler\n...\nDIZI DB 1, 2, 3",
        note: "Dizilerin ve stringlerin ba\u015Flang\u0131\xE7 adresini almak i\xE7in en yayg\u0131n yoldur."
      },
      {
        syntax: "LEA reg16, [mem]",
        description: "Karma\u015F\u0131k adresleme modunun hesaplanan ofset adresini yazmaca y\xFCkler.",
        example: "MOV BX, 100H\nMOV SI, 20H\nLEA DX, [BX+SI+4] ; DX = 124h olur (Bellek okunmaz, sadece adres hesaplan\u0131r!)",
        note: "Adres hesaplama aritmeti\u011Fi i\xE7in de s\u0131k\xE7a kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "XCHG",
    name: "Exchange (De\u011Fer Takas\u0131)",
    category: "data",
    summary: "\u0130ki operand\u0131n i\xE7eri\u011Fini kar\u015F\u0131l\u0131kl\u0131 olarak yer de\u011Fi\u015Ftirir.",
    flags: "Bayraklar\u0131 etkilemez.",
    rules: "\u0130ki bellek adresi aras\u0131nda do\u011Frudan takas yap\u0131lamaz. Segment yazma\xE7lar\u0131 kullan\u0131lamaz.",
    variations: [
      {
        syntax: "XCHG reg, reg",
        description: "\u0130ki yazmac\u0131n i\xE7eri\u011Fini takas eder.",
        example: "MOV AX, 1111H\nMOV BX, 2222H\nXCHG AX, BX     ; AX = 2222H, BX = 1111H olur",
        note: "Ge\xE7ici \xFC\xE7\xFCnc\xFC bir yazmaca ihtiya\xE7 duymadan takas sa\u011Flar."
      },
      {
        syntax: "XCHG reg, [mem]",
        description: "Yazma\xE7 ile bellek adresindeki veriyi takas eder.",
        example: "MOV AX, 50H\nXCHG AX, [DI]   ; AX bellekteki eski de\u011Feri al\u0131r, [DI]'ye 50h yaz\u0131l\u0131r",
        note: "Atomik veri de\u011Fi\u015Fimi sa\u011Flar."
      }
    ]
  },
  {
    opcode: "PUSH",
    name: "Push onto Stack (Y\u0131\u011F\u0131na Ekle)",
    category: "data",
    summary: "16-bitlik operand\u0131 y\u0131\u011F\u0131na (Stack) koyar. SP i\u015Faret\xE7isi 2 azal\u0131r (SP = SP - 2).",
    flags: "Bayraklar\u0131 etkilemez.",
    rules: "8086 mimarisinde yaln\u0131zca 16-bit de\u011Ferler y\u0131\u011F\u0131na at\u0131labilir (PUSH AL veya sabit say\u0131 ge\xE7ersizdir!).",
    variations: [
      {
        syntax: "PUSH reg16",
        description: "16-bit genel veya indeks yazmac\u0131n\u0131 y\u0131\u011F\u0131na atar.",
        example: "MOV AX, 1234H\nPUSH AX         ; Y\u0131\u011F\u0131na 1234H kaydedilir, SP 2 azal\u0131r",
        note: "Altprogram \xE7a\u011Fr\u0131lar\u0131nda yazma\xE7 de\u011Ferlerini korumak i\xE7in kullan\u0131l\u0131r."
      },
      {
        syntax: "PUSH seg",
        description: "Segment yazmac\u0131n\u0131 y\u0131\u011F\u0131na kaydeder.",
        example: "PUSH DS\nPUSH ES",
        note: "Segmentleri ge\xE7ici de\u011Fi\u015Ftirip geri y\xFCklemek i\xE7in standartt\u0131r."
      },
      {
        syntax: "PUSH [mem16]",
        description: "Bellekteki 16-bit kelimeyi y\u0131\u011F\u0131na atar.",
        example: "PUSH WORD PTR [BX] ; [BX] adresindeki 2 bayt y\u0131\u011F\u0131na at\u0131l\u0131r",
        note: "Boyut belirtici WORD PTR kullan\u0131lmal\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "POP",
    name: "Pop from Stack (Y\u0131\u011F\u0131ndan \xC7ek)",
    category: "data",
    summary: "Y\u0131\u011F\u0131n\u0131n tepesindeki 16-bit kelimeyi hedefe \xE7eker. SP i\u015Faret\xE7isi 2 artar (SP = SP + 2).",
    flags: "Bayraklar\u0131 etkilemez.",
    rules: "POP CS komutu ge\xE7ersizdir (CS do\u011Frudan POP ile de\u011Fi\u015Ftirilemez).",
    variations: [
      {
        syntax: "POP reg16",
        description: "Y\u0131\u011F\u0131ndan \xE7ekilen de\u011Feri 16-bit yazmaca atar.",
        example: "POP BX          ; En son at\u0131lan 16-bit de\u011Fer BX'e yaz\u0131l\u0131r",
        note: "PUSH s\u0131ras\u0131n\u0131n tam tersi s\u0131rada POP yap\u0131lmal\u0131d\u0131r (LIFO)."
      },
      {
        syntax: "POP seg",
        description: "Y\u0131\u011F\u0131ndan segment yazmac\u0131na \xE7eker.",
        example: "POP ES\nPOP DS",
        note: "POP CS desteklenmez."
      }
    ]
  },
  {
    opcode: "PUSHF",
    name: "Push Flags (Bayraklar\u0131 Y\u0131\u011F\u0131na At)",
    category: "data",
    summary: "T\xFCm FLAGS (bayraklar) yazmac\u0131n\u0131 16-bit kelime olarak y\u0131\u011F\u0131na atar.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "PUSHF",
        description: "Mevcut bayrak durumunu y\u0131\u011F\u0131na kaydeder.",
        example: "PUSHF           ; Bayraklar saklan\u0131r\nCMP AX, BX\nPOPF            ; Orijinal bayraklar geri y\xFCklenir",
        note: "Bayraklar\u0131 altprogram boyunca korumak i\xE7in kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "POPF",
    name: "Pop Flags (Bayraklar\u0131 Y\u0131\u011F\u0131ndan Geri Y\xFCkle)",
    category: "data",
    summary: "Y\u0131\u011F\u0131ndan 16-bit kelime \xE7ekerek FLAGS yazmac\u0131na y\xFCkler.",
    flags: "T\xFCm bayraklar (CF, PF, AF, ZF, SF, TF, IF, DF, OF) y\u0131\u011F\u0131ndaki de\u011Fere g\xF6re g\xFCncellenir.",
    variations: [
      {
        syntax: "POPF",
        description: "Y\u0131\u011F\u0131ndan bayraklar\u0131 \xE7eker.",
        example: "POPF            ; SP 2 artar, bayraklar g\xFCncellenir",
        note: "PUSHF ile e\u015Fle\u015Fmelidir."
      }
    ]
  },
  {
    opcode: "XLAT",
    name: "Table Lookup Translation (Tablo \xC7evirisi)",
    category: "data",
    summary: "DS:BX ba\u015Flang\u0131\xE7l\u0131 tablodan AL ofsetindeki bayt\u0131 okuyup tekrar AL'ye yazar: AL = [DS:BX + AL].",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "XLAT / XLATB",
        description: "256 elemanl\u0131 bayt tablosundan indeksli \xE7eviri yapar.",
        example: "LEA BX, TABLO\nMOV AL, 3\nXLAT            ; AL = TABLO[3] olur\n...\nTABLO DB 10, 20, 30, 40",
        note: "Karakter kodlama d\xF6n\xFC\u015F\xFCmlerinde (ASCII-7 segment vb.) \xE7ok h\u0131zl\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "LDS",
    name: "Load Pointer using DS",
    category: "data",
    summary: "Bellekten 4 bayt okur: \u0130lk 2 bayt\u0131 hedef yazmaca (ofset), sonraki 2 bayt\u0131 DS'ye y\xFCkler.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "LDS reg16, [mem]",
        description: "32-bit uzak g\xF6stericiyi (Offset + Segment) y\xFCkler.",
        example: "LDS SI, [BX]    ; SI = [BX], DS = [BX+2]",
        note: "Veri segmentini ve g\xF6stericiyi tek komutla kurar."
      }
    ]
  },
  {
    opcode: "LES",
    name: "Load Pointer using ES",
    category: "data",
    summary: "Bellekten 4 bayt okur: \u0130lk 2 bayt\u0131 hedef yazmaca, sonraki 2 bayt\u0131 ES'ye y\xFCkler.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "LES reg16, [mem]",
        description: "32-bit uzak g\xF6stericiyi ES ve hedef yazmaca y\xFCkler.",
        example: "LES DI, [BX]    ; DI = [BX], ES = [BX+2]",
        note: "Dizi i\u015Flemlerinde ES:DI hedef g\xF6stericisini kurmak i\xE7in kullan\u0131l\u0131r."
      }
    ]
  },
  // --- ARİTMETİK ---
  {
    opcode: "ADD",
    name: "Addition (Eldesiz Toplama)",
    category: "arithmetic",
    summary: "Hedef ile kaynak operand\u0131 toplar, sonucu hedefe yazar: Dest = Dest + Src.",
    flags: "CF, ZF, SF, OF, AF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "ADD reg, reg",
        addressingMode: "Register Addressing",
        description: "\u0130ki yazma\xE7taki say\u0131y\u0131 toplar, bellek eri\u015Fimi yoktur.",
        example: "MOV AX, 5\nADD AX, 10      ; AX = 15 (0Fh)\nADD AX, BX      ; AX = AX + BX",
        note: "Sonu\xE7 0 olursa ZF=1, elde ta\u015Farsa CF=1 olur."
      },
      {
        syntax: "ADD [mem], reg / imm",
        description: "Bellek h\xFCcresine de\u011Fer ekler.",
        example: "ADD BYTE PTR [DI], 1\nADD WORD PTR [BX], 500",
        note: "Bellek operasyonlar\u0131nda boyut belirteci verilmelidir."
      }
    ]
  },
  {
    opcode: "ADC",
    name: "Add with Carry (Eldeli Toplama)",
    category: "arithmetic",
    summary: "Hedef, kaynak ve Carry Bayra\u011F\u0131n\u0131 toplar: Dest = Dest + Src + CF.",
    flags: "CF, ZF, SF, OF, AF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "ADC reg, reg / imm / [mem]",
        addressingMode: "Multi-Precision Addition (Dest + Src + CF)",
        description: "32-bit veya daha geni\u015F \xE7ok kelimeli toplamalarda ta\u015Fan eldeyi sonraki basama\u011Fa ekler.",
        example: "; 32-bit Toplama: (DX:AX) + (CX:BX)\nADD AX, BX      ; D\xFC\u015F\xFCk 16-bit toplan\u0131r (elde CF'ye gider)\nADC DX, CX      ; Y\xFCksek 16-bit + CF toplan\u0131r",
        note: "B\xFCy\xFCk say\u0131lar\u0131n ard\u0131\u015F\u0131k toplanmas\u0131nda temeldir."
      }
    ]
  },
  {
    opcode: "SUB",
    name: "Subtract (Eldesiz \xC7\u0131karma)",
    category: "arithmetic",
    summary: "Hedeften kayna\u011F\u0131 \xE7\u0131kar\u0131r, sonucu hedefe yazar: Dest = Dest - Src.",
    flags: "CF, ZF, SF, OF, AF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "SUB reg, reg",
        addressingMode: "Register Addressing",
        description: "\u0130ki yazma\xE7 aras\u0131nda \xE7\u0131karma yapar.",
        example: "MOV AX, 20\nSUB AX, 5       ; AX = 15",
        note: "Kaynak hedeften b\xFCy\xFCkse bor\xE7 olu\u015Fur ve CF=1 olur."
      }
    ]
  },
  {
    opcode: "SBB",
    name: "Subtract with Borrow (Bor\xE7lu \xC7\u0131karma)",
    category: "arithmetic",
    summary: "Hedeften kayna\u011F\u0131 ve Carry Bayra\u011F\u0131n\u0131 \xE7\u0131kar\u0131r: Dest = Dest - Src - CF.",
    flags: "CF, ZF, SF, OF, AF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "SBB reg, reg / imm / [mem]",
        description: "32-bit \xE7ok basamakl\u0131 \xE7\u0131karma i\u015Fleminde d\xFC\u015F\xFCk basamaktan gelen borcu d\xFC\u015Fer.",
        example: "; 32-bit \xC7\u0131karma: (DX:AX) - (CX:BX)\nSUB AX, BX      ; D\xFC\u015F\xFCk basamak \xE7\u0131kar\u0131l\u0131r\nSBB DX, CX      ; Y\xFCksek basamaktan CX ve varsa CF borcu d\xFC\u015F\xFCl\xFCr",
        note: "\xC7ok kelimeli hassas \xE7\u0131karma i\xE7in kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "INC",
    name: "Increment (1 Art\u0131r)",
    category: "arithmetic",
    summary: "Operanda 1 ekler: Dest = Dest + 1.",
    flags: "ZF, SF, OF, AF, PF g\xFCncellenir. D\u0130KKAT: Carry Bayra\u011F\u0131 (CF) ETK\u0130LENMEZ!",
    variations: [
      {
        syntax: "INC reg / [mem]",
        description: "Yazma\xE7 veya bellek i\xE7eri\u011Fini 1 art\u0131r\u0131r.",
        example: "INC SI          ; SI = SI + 1\nINC BYTE PTR [BX]",
        note: "D\xF6ng\xFC saya\xE7lar\u0131nda CF'yi bozmad\u0131\u011F\u0131 i\xE7in \xF6zellikle tercih edilir."
      }
    ]
  },
  {
    opcode: "DEC",
    name: "Decrement (1 Azalt)",
    category: "arithmetic",
    summary: "Operanttan 1 \xE7\u0131kar\u0131r: Dest = Dest - 1.",
    flags: "ZF, SF, OF, AF, PF g\xFCncellenir. Carry Bayra\u011F\u0131 (CF) ETK\u0130LENMEZ!",
    variations: [
      {
        syntax: "DEC reg / [mem]",
        description: "Yazma\xE7 veya bellek i\xE7eri\u011Fini 1 azalt\u0131r.",
        example: "DEC CX          ; CX 1 azal\u0131r\nJNZ TEKRAR      ; S\u0131f\u0131r de\u011Filse d\xF6ng\xFCye devam",
        note: "Saya\xE7 s\u0131f\u0131ra ula\u015Ft\u0131\u011F\u0131nda ZF=1 olur."
      }
    ]
  },
  {
    opcode: "CMP",
    name: "Compare (Kar\u015F\u0131la\u015Ft\u0131r)",
    category: "arithmetic",
    summary: "Hedeften kayna\u011F\u0131 sanal olarak \xE7\u0131kar\u0131r (Dest - Src). Sonucu kaydetmez, yaln\u0131zca bayraklar\u0131 g\xFCnceller.",
    flags: "CF, ZF, SF, OF, AF, PF tam g\xFCncellenir.",
    variations: [
      {
        syntax: "CMP reg, reg / imm / [mem]",
        description: "\u0130ki de\u011Feri kar\u015F\u0131la\u015Ft\u0131rarak ko\u015Fullu atlama komutlar\u0131n\u0131 (JE, JL, JAE vb.) haz\u0131rlar.",
        example: "CMP AX, 10\nJE ESIT         ; AX == 10 ise atlar (ZF=1)\nJL KUCUK        ; AX < 10 ise atlar (SF!=OF)",
        note: "Operandlar\u0131n de\u011Ferleri kesinlikle de\u011Fi\u015Fmez."
      }
    ]
  },
  {
    opcode: "NEG",
    name: "Two's Complement Negation (\u0130\u015Faret Tersleme)",
    category: "arithmetic",
    summary: "Operand\u0131n ikiye t\xFCmleyenini al\u0131r (0 - Dest), i\u015Faretini tersine \xE7evirir (+ ise -, - ise +).",
    flags: "CF (sonu\xE7 0 de\u011Filse 1 olur), ZF, SF, OF, AF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "NEG reg / [mem]",
        description: "Pozitif say\u0131y\u0131 negatife, negatifi pozitife \xE7evirir.",
        example: "MOV AL, 5\nNEG AL          ; AL = -5 (FBh)",
        note: "\u0130\u015Faretli say\u0131larla i\u015Flem yaparken kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "MUL",
    name: "Unsigned Multiplication (\u0130\u015Faretsiz \xC7arpma)",
    category: "arithmetic",
    summary: "\u0130\u015Faretsiz \xE7arpma yapar. 8-bit ise AL * Src -> AX. 16-bit ise AX * Src -> DX:AX.",
    flags: "CF ve OF: Sonucun y\xFCksek yar\u0131s\u0131 s\u0131f\u0131rdan farkl\u0131ysa 1, aksi halde 0 olur.",
    variations: [
      {
        syntax: "MUL reg8 / [mem8]",
        description: "AL ile operand\u0131 \xE7arpar, 16-bit sonucu AX'e yazar.",
        example: "MOV AL, 20\nMOV BL, 10\nMUL BL          ; AX = 200 (00C8h)",
        note: "Birinci \xE7arpan her zaman \xF6rt\xFCk olarak AL'dir."
      },
      {
        syntax: "MUL reg16 / [mem16]",
        description: "AX ile operand\u0131 \xE7arpar, 32-bit sonucu DX (y\xFCksek) ve AX (d\xFC\u015F\xFCk) i\xE7ine yazar.",
        example: "MOV AX, 1000H\nMOV BX, 20H\nMUL BX          ; DX:AX = 0002:0000h",
        note: "Birinci \xE7arpan \xF6rt\xFCk olarak AX'tir."
      }
    ]
  },
  {
    opcode: "IMUL",
    name: "Signed Multiplication (\u0130\u015Faretli \xC7arpma)",
    category: "arithmetic",
    summary: "\u0130\u015Faretli tam say\u0131 \xE7arp\u0131m\u0131 yapar. 8-bit: AL * Src -> AX. 16-bit: AX * Src -> DX:AX.",
    flags: "CF ve OF: Y\xFCksek basamaklarda anlaml\u0131 i\u015Faret biti varsa 1 olur.",
    variations: [
      {
        syntax: "IMUL reg / [mem]",
        description: "Negatif say\u0131lar\u0131 g\xF6z \xF6n\xFCnde bulundurarak \xE7arpar.",
        example: "MOV AL, -5\nMOV BL, 4\nIMUL BL         ; AX = -20 (FFECH)",
        note: "\u0130\u015Faret bitleri otomatik olarak do\u011Fru geni\u015Fletilir."
      }
    ]
  },
  {
    opcode: "DIV",
    name: "Unsigned Division (\u0130\u015Faretsiz B\xF6lme)",
    category: "arithmetic",
    summary: "\u0130\u015Faretsiz b\xF6lme. 8-bit b\xF6lende: AX / Src -> AL:B\xF6l\xFCm, AH:Kalan. 16-bit b\xF6lende: DX:AX / Src -> AX:B\xF6l\xFCm, DX:Kalan.",
    flags: "Bayraklar tan\u0131ms\u0131z kal\u0131r.",
    rules: "B\xF6len s\u0131f\u0131r ise veya b\xF6l\xFCm hedefin kapasitesine s\u0131\u011Fmazsa Division by Zero hatas\u0131 (INT 0) olu\u015Fur!",
    variations: [
      {
        syntax: "DIV reg8 / [mem8]",
        description: "AX i\xE7indeki say\u0131y\u0131 8-bitlik b\xF6lene b\xF6ler.",
        example: "MOV AX, 25\nMOV BL, 4\nDIV BL          ; AL = 6 (b\xF6l\xFCm), AH = 1 (kalan)",
        note: "Sonu\xE7 8-bit s\u0131n\u0131r\u0131n\u0131 (255) a\u015Fmamal\u0131d\u0131r."
      },
      {
        syntax: "DIV reg16 / [mem16]",
        description: "DX:AX i\xE7indeki 32-bit say\u0131y\u0131 16-bitlik b\xF6lene b\xF6ler.",
        example: "MOV DX, 0\nMOV AX, 1000\nMOV BX, 3\nDIV BX          ; AX = 333 (b\xF6l\xFCm), DX = 1 (kalan)",
        note: "B\xF6lme \xF6ncesi DX genellikle 0 ile temizlenmelidir."
      }
    ]
  },
  {
    opcode: "IDIV",
    name: "Signed Division (\u0130\u015Faretli B\xF6lme)",
    category: "arithmetic",
    summary: "\u0130\u015Faretli tam say\u0131 b\xF6lmesi yapar. 8-bit: AX / Src -> AL:B\xF6l\xFCm, AH:Kalan. 16-bit: DX:AX / Src -> AX:B\xF6l\xFCm, DX:Kalan.",
    flags: "Bayraklar tan\u0131ms\u0131zd\u0131r.",
    variations: [
      {
        syntax: "IDIV reg / [mem]",
        description: "\u0130\u015Faretli say\u0131lar\u0131 b\xF6ler. Kalan\u0131n i\u015Fareti b\xF6l\xFCnenin i\u015Faretiyle ayn\u0131 olur.",
        example: "MOV AX, -25\nCBW             ; veya i\u015Faret geni\u015Fletme\nMOV BL, 4\nIDIV BL         ; AL = -6, AH = -1",
        note: "\u0130\u015Flem \xF6ncesi CBW veya CWD ile i\u015Faret geni\u015Fletmesi yap\u0131lmal\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "CBW",
    name: "Convert Byte to Word (Bayttan Kelimeye \u0130\u015Faret Geni\u015Flet)",
    category: "arithmetic",
    summary: "AL i\xE7indeki i\u015Faretli say\u0131n\u0131n i\u015Faret bitini AH i\xE7ine kopyalar (AL pozitifse AH=00h, negatifse AH=FFh).",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "CBW",
        description: "8-bit AL de\u011Ferini 16-bit AX format\u0131na i\u015Faretli geni\u015Fletir.",
        example: "MOV AL, -5      ; AL = FBh\nCBW             ; AX = FFFBh (-5)",
        note: "8-bit IDIV \xF6ncesi zorunludur."
      }
    ]
  },
  {
    opcode: "CWD",
    name: "Convert Word to Doubleword (Kelimeden \xC7ift Kelimeye)",
    category: "arithmetic",
    summary: "AX i\xE7indeki i\u015Faretli say\u0131n\u0131n i\u015Faretini DX i\xE7ine kopyalar (AX pozitifse DX=0000h, negatifse DX=FFFFh).",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "CWD",
        description: "16-bit AX de\u011Ferini 32-bit DX:AX format\u0131na i\u015Faretli geni\u015Fletir.",
        example: "MOV AX, -100\nCWD             ; DX:AX = FFFF:FF9Ch\nMOV BX, 5\nIDIV BX         ; G\xFCvenli i\u015Faretli b\xF6lme",
        note: "16-bit IDIV \xF6ncesi zorunludur."
      }
    ]
  },
  // --- BCD ARİTMETİĞİ ---
  {
    opcode: "DAA",
    name: "Decimal Adjust for Addition (Toplama Sonras\u0131 BCD D\xFCzelt)",
    category: "bcd",
    summary: "Paketli BCD (her nibble bir rakam, \xF6rn 25h = 25) toplama i\u015Fleminden sonra AL yazmac\u0131n\u0131 ge\xE7erli BCD format\u0131na d\xFCzeltir.",
    flags: "CF (onluk ta\u015Fma), ZF, SF, AF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "DAA",
        description: "ADD veya ADC komutunun hemen ard\u0131ndan AL'yi BCD yapar.",
        example: "MOV AL, 35H     ; BCD 35\nADD AL, 48H     ; AL = 7Dh (ge\xE7ersiz BCD)\nDAA             ; AL = 83H (35 + 48 = 83)",
        note: "Finans ve saya\xE7 uygulamalar\u0131nda ondal\u0131k aritmetik i\xE7in kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "DAS",
    name: "Decimal Adjust for Subtraction (\xC7\u0131karma Sonras\u0131 BCD D\xFCzelt)",
    category: "bcd",
    summary: "Paketli BCD \xE7\u0131karma i\u015Fleminden sonra AL'yi onluk BCD format\u0131na d\xFCzeltir.",
    flags: "CF (onluk bor\xE7), ZF, SF, AF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "DAS",
        description: "SUB veya SBB ard\u0131ndan AL'yi d\xFCzeltir.",
        example: "MOV AL, 83H     ; BCD 83\nSUB AL, 48H     ; AL = 3Bh\nDAS             ; AL = 35H (83 - 48 = 35)",
        note: "Paketli BCD \xE7\u0131karma i\xE7in zorunludur."
      }
    ]
  },
  {
    opcode: "AAA",
    name: "ASCII Adjust for Addition (Paketsiz BCD Toplama D\xFCzelt)",
    category: "bcd",
    summary: "Paketsiz BCD (her baytta 1 rakam, \xF6rn: 09h) toplama sonras\u0131 AL ve AH'yi onluk tabana g\xF6re ayarlar.",
    flags: "AF ve CF g\xFCncellenir.",
    variations: [
      {
        syntax: "AAA",
        description: "ADD ard\u0131ndan AL ve AH'yi d\xFCzenler.",
        example: "MOV AX, 0\nMOV AL, 7\nADD AL, 8       ; AL = 0Fh\nAAA             ; AH = 1, AL = 5 (15)",
        note: "Rakam karakterlerini (ASCII) do\u011Frudan toplarken kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "AAS",
    name: "ASCII Adjust for Subtraction",
    category: "bcd",
    summary: "Paketsiz BCD \xE7\u0131karma sonras\u0131 AL ve AH'yi d\xFCzenler.",
    flags: "AF ve CF g\xFCncellenir.",
    variations: [
      {
        syntax: "AAS",
        description: "SUB ard\u0131ndan paketsiz BCD borcunu AH'ye yans\u0131t\u0131r.",
        example: "MOV AX, 0103H   ; 13\nSUB AL, 8       ; AL = FBh\nAAS             ; AH = 0, AL = 5",
        note: "ASCII/Unpacked \xE7\u0131karma d\xFCzelticisidir."
      }
    ]
  },
  {
    opcode: "AAM",
    name: "ASCII Adjust for Multiplication",
    category: "bcd",
    summary: "Paketsiz iki rakam\u0131n \xE7arp\u0131m\u0131ndan sonra AL de\u011Ferini onluk basamaklara ay\u0131r\u0131r: AH = AL / 10, AL = AL % 10.",
    flags: "ZF, SF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "AAM",
        description: "MUL sonras\u0131nda AL'yi iki haneli BCD (AH: onlar, AL: birler) yapar.",
        example: "MOV AL, 7\nMOV BL, 9\nMUL BL          ; AL = 63 (3Fh)\nAAM             ; AH = 6, AL = 3",
        note: "Herhangi bir bayt\u0131 onlar ve birler basama\u011F\u0131na ay\u0131rmak i\xE7in de m\xFCkemmeldir."
      }
    ]
  },
  {
    opcode: "AAD",
    name: "ASCII Adjust before Division",
    category: "bcd",
    summary: "B\xF6lme \xF6ncesinde AH ve AL i\xE7indeki iki BCD basama\u011F\u0131n\u0131 tek ikilik say\u0131ya birle\u015Ftirir: AL = (AH * 10) + AL, AH = 0.",
    flags: "ZF, SF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "AAD",
        description: "DIV \xF6ncesinde iki basamakl\u0131 say\u0131y\u0131 b\xF6lmeye haz\u0131rlar.",
        example: "MOV AX, 0605H   ; 65\nAAD             ; AL = 65 (41h), AH = 0\nMOV BL, 5\nDIV BL          ; AL = 13",
        note: "AAM'nin tam tersi i\u015Flemdir."
      }
    ]
  },
  // --- MANTIK VE BİT KAYDIRMA ---
  {
    opcode: "AND",
    name: "Logical AND (Mant\u0131ksal VE)",
    category: "logical",
    summary: "\u0130ki operand\u0131n bitlerini kar\u015F\u0131l\u0131kl\u0131 VE i\u015Flemine tabi tutar. Belirli bitleri maskelemek (s\u0131f\u0131rlamak) i\xE7in kullan\u0131l\u0131r.",
    flags: "CF=0, OF=0 yap\u0131l\u0131r. ZF, SF, PF sonuca g\xF6re g\xFCncellenir.",
    variations: [
      {
        syntax: "AND reg, reg / imm / [mem]",
        description: "Hedefin bitlerini kaynakla VE i\u015Flemine sokar.",
        example: "MOV AL, 11010110B\nAND AL, 00001111B ; AL = 00000110B (\xFCst 4-bit s\u0131f\u0131rland\u0131)",
        note: "Maskeleme i\u015Flemlerinde en temel komuttur."
      }
    ]
  },
  {
    opcode: "OR",
    name: "Logical OR (Mant\u0131ksal VEYA)",
    category: "logical",
    summary: "\u0130ki operand\u0131n bitlerini VEYA i\u015Flemine sokar. Belirli bitleri 1 yapmak i\xE7in kullan\u0131l\u0131r.",
    flags: "CF=0, OF=0 yap\u0131l\u0131r. ZF, SF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "OR reg, reg / imm / [mem]",
        description: "Bitleri 1 olarak set eder.",
        example: "MOV AL, 00100000B\nOR AL, 00000001B  ; AL = 00100001B (0. bit 1 yap\u0131ld\u0131)",
        note: "Donan\u0131m portlar\u0131nda bayraklar\u0131 a\xE7mak i\xE7in kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "XOR",
    name: "Logical Exclusive OR (Mant\u0131ksal \xD6ZEL VEYA)",
    category: "logical",
    summary: "Bitler farkl\u0131ysa 1, ayn\u0131ysa 0 \xFCretir. Bir yazmac\u0131 kendi kendisiyle XOR'lamak onu 0 yapar.",
    flags: "CF=0, OF=0 yap\u0131l\u0131r. ZF, SF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "XOR reg, reg",
        description: "Yazmac\u0131 en h\u0131zl\u0131 ve az yer kaplayan \u015Fekilde s\u0131f\u0131rlar (MOV reg, 0 yerine tercih edilir).",
        example: "XOR AX, AX      ; AX = 0000h olur, ZF = 1 olur (2 bayt!)",
        note: "\u015Eifreleme ve bit tersleme i\xE7in de kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "NOT",
    name: "Logical NOT (Bire T\xFCmleyen / Bitleri Tersle)",
    category: "logical",
    summary: "Operand\u0131n t\xFCm bitlerini tersine \xE7evirir (0 -> 1, 1 -> 0).",
    flags: "H\u0130\xC7B\u0130R bayra\u011F\u0131 etkilemez.",
    variations: [
      {
        syntax: "NOT reg / [mem]",
        description: "T\xFCm bitleri tersler.",
        example: "MOV AL, 11110000B\nNOT AL          ; AL = 00001111B",
        note: "Bayraklar\u0131 de\u011Fi\u015Ftirmedi\u011Fine dikkat ediniz."
      }
    ]
  },
  {
    opcode: "TEST",
    name: "Logical Compare (Bit Testi)",
    category: "logical",
    summary: "\u0130ki operand\u0131 mant\u0131ksal VE (AND) ile test eder. Sonucu kaydetmez, sadece bayraklar\u0131 g\xFCnceller.",
    flags: "CF=0, OF=0. ZF, SF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "TEST reg, reg / imm",
        description: "Belirli bir bitin 0 m\u0131 1 mi oldu\u011Funu kontrol eder.",
        example: "TEST AL, 00000001B ; AL tek mi \xE7ift mi?\nJNZ TEK_SAYI    ; 0. bit 1 ise ZF=0 olur",
        note: "Yazmac\u0131n de\u011Ferini bozmadan bayrak test eder."
      }
    ]
  },
  {
    opcode: "SHL",
    name: "Shift Logical Left (Sola Kayd\u0131r)",
    category: "logical",
    summary: "Bitleri sola kayd\u0131r\u0131r. En sa\u011Fdan 0 girer, en soldan \xE7\u0131kan bit Carry Flag (CF)'ye gider. Say\u0131y\u0131 2 ile \xE7arpar.",
    flags: "CF (\xE7\u0131kan bit), ZF, SF, PF g\xFCncellenir. 1 bit kayd\u0131rmada OF g\xFCncellenir.",
    rules: "Kayd\u0131rma miktar\u0131 ya do\u011Frudan 1 sabiti ya da CL yazmac\u0131 olmal\u0131d\u0131r (8086 kural\u0131).",
    variations: [
      {
        syntax: "SHL reg, 1",
        description: "1 bit sola kayd\u0131r\u0131r (2 ile \xE7arpar).",
        example: "MOV AL, 5\nSHL AL, 1       ; AL = 10",
        note: "SAL (Shift Arithmetic Left) ile tamamen ayn\u0131d\u0131r."
      },
      {
        syntax: "SHL reg, CL",
        description: "CL yazmac\u0131ndaki de\u011Fer kadar sola kayd\u0131r\u0131r.",
        example: "MOV AL, 3\nMOV CL, 2\nSHL AL, CL      ; AL = 12 (3 * 4)",
        note: "Birden fazla kayd\u0131rma i\xE7in CL yazmac\u0131 zorunludur."
      }
    ]
  },
  {
    opcode: "SHR",
    name: "Shift Logical Right (Mant\u0131ksal Sa\u011Fa Kayd\u0131r)",
    category: "logical",
    summary: "\u0130\u015Faretsiz say\u0131lar i\xE7in sa\u011Fa kayd\u0131r\u0131r. En soldan 0 girer, en sa\u011Fdan \xE7\u0131kan bit CF'ye gider. Say\u0131y\u0131 2'ye b\xF6ler.",
    flags: "CF, ZF, SF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "SHR reg, 1 / CL",
        description: "Sa\u011Fa kayd\u0131r\u0131r.",
        example: "MOV AL, 20\nSHR AL, 1       ; AL = 10",
        note: "\u0130\u015Faretsiz say\u0131lar\u0131n 2'ye b\xF6l\xFCnmesinde kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "SAR",
    name: "Shift Arithmetic Right (Aritmetik Sa\u011Fa Kayd\u0131r)",
    category: "logical",
    summary: "\u0130\u015Faretli say\u0131lar i\xE7in sa\u011Fa kayd\u0131r\u0131r. En soldaki i\u015Faret biti (0 veya 1) KORUNUR! Negatif say\u0131lar\u0131n i\u015Faretini bozmadan 2'ye b\xF6ler.",
    flags: "CF, ZF, SF, PF g\xFCncellenir.",
    variations: [
      {
        syntax: "SAR reg, 1 / CL",
        description: "\u0130\u015Fareti koruyarak sa\u011Fa kayd\u0131r\u0131r.",
        example: "MOV AL, -8      ; AL = F8h\nSAR AL, 1       ; AL = -4 (FCh)",
        note: "\u0130\u015Faretli b\xF6lme i\xE7in SHR yerine SAR kullan\u0131lmal\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "ROL",
    name: "Rotate Left (Sola D\xF6nd\xFCr)",
    category: "logical",
    summary: "Bitleri dairesel olarak sola d\xF6nd\xFCr\xFCr. En soldan \xE7\u0131kan bit hem en sa\u011Fa d\xF6ner hem CF'ye yaz\u0131l\u0131r.",
    flags: "CF g\xFCncellenir.",
    variations: [
      {
        syntax: "ROL reg, 1 / CL",
        description: "Dairesel sola d\xF6nd\xFCrme.",
        example: "MOV AL, 10000000B\nROL AL, 1       ; AL = 00000001B, CF = 1",
        note: "Hi\xE7bir bit kaybolmaz."
      }
    ]
  },
  {
    opcode: "ROR",
    name: "Rotate Right (Sa\u011Fa D\xF6nd\xFCr)",
    category: "logical",
    summary: "Bitleri dairesel olarak sa\u011Fa d\xF6nd\xFCr\xFCr. En sa\u011Fdan \xE7\u0131kan bit hem en ba\u015Fa d\xF6ner hem CF'ye yaz\u0131l\u0131r.",
    flags: "CF g\xFCncellenir.",
    variations: [
      {
        syntax: "ROR reg, 1 / CL",
        description: "Dairesel sa\u011Fa d\xF6nd\xFCrme.",
        example: "MOV AL, 00000001B\nROR AL, 1       ; AL = 10000000B, CF = 1",
        note: "Bit rotasyonlar\u0131nda kullan\u0131l\u0131r."
      }
    ]
  },
  // --- ATLAMA VE DÖNGÜLER ---
  {
    opcode: "JMP",
    name: "Jump (Ko\u015Fulsuz Atlama)",
    category: "control",
    summary: "Program y\xFCr\xFCtmesini ko\u015Fulsuz olarak belirtilen etikete/adrese y\xF6nlendirir.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "JMP label",
        description: "Etikete do\u011Frudan atlar.",
        example: "JMP BASLA\n...\nBASLA:\n  MOV AX, 1",
        note: "K\u0131sa (-128..+127) veya yak\u0131n (\xB132KB) atlama yapar."
      }
    ]
  },
  {
    opcode: "JE / JZ",
    name: "Jump if Equal / Jump if Zero",
    category: "control",
    summary: "Son i\u015Flem sonucu s\u0131f\u0131r ise veya kar\u015F\u0131la\u015Ft\u0131r\u0131lan iki de\u011Fer e\u015Fitse atlar (ZF = 1).",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "JE label / JZ label",
        description: "ZF=1 durumunda atlar.",
        example: "CMP AX, BX\nJE ESITLER      ; AX == BX ise atlar",
        note: "JE ile JZ ayn\u0131 makine koduna (74h) sahiptir."
      }
    ]
  },
  {
    opcode: "JNE / JNZ",
    name: "Jump if Not Equal / Jump if Not Zero",
    category: "control",
    summary: "Son i\u015Flem sonucu s\u0131f\u0131r de\u011Filse veya de\u011Ferler e\u015Fit de\u011Filse atlar (ZF = 0).",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "JNE label / JNZ label",
        description: "ZF=0 durumunda atlar.",
        example: "DEC CX\nJNZ TEKRAR      ; CX s\u0131f\u0131r olana kadar d\xF6ner",
        note: "D\xF6ng\xFC kurarken en s\u0131k kullan\u0131lan komuttur."
      }
    ]
  },
  {
    opcode: "JA / JB / JAE / JBE",
    name: "Unsigned Conditional Jumps (\u0130\u015Faretsiz Ko\u015Fullu Atlamalar)",
    category: "control",
    summary: "\u0130\u015Faretsiz say\u0131lar i\xE7in kar\u015F\u0131la\u015Ft\u0131rma atlamalar\u0131: JA (B\xFCy\xFCkse), JB (K\xFC\xE7\xFCkse), JAE (B\xFCy\xFCk-E\u015Fit), JBE (K\xFC\xE7\xFCk-E\u015Fit).",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "JA label  ; B\xFCy\xFCkseniz (CF=0 ve ZF=0)\nJB label  ; K\xFC\xE7\xFCkse (CF=1)\nJAE label ; B\xFCy\xFCk veya e\u015Fitse (CF=0)\nJBE label ; K\xFC\xE7\xFCk veya e\u015Fitse (CF=1 veya ZF=1)",
        description: "\u0130\u015Faretsiz kar\u015F\u0131la\u015Ft\u0131rmalarda kullan\u0131l\u0131r.",
        example: "CMP AL, 50\nJA ELLI_USTU    ; AL > 50 ise atlar",
        note: "Pozitif tam say\u0131larda daima JA/JB ailesi kullan\u0131lmal\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "JG / JL / JGE / JLE",
    name: "Signed Conditional Jumps (\u0130\u015Faretli Ko\u015Fullu Atlamalar)",
    category: "control",
    summary: "\u0130\u015Faretli (+ / -) say\u0131lar i\xE7in atlamalar: JG (B\xFCy\xFCkse), JL (K\xFC\xE7\xFCkse), JGE (B\xFCy\xFCk-E\u015Fit), JLE (K\xFC\xE7\xFCk-E\u015Fit).",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "JG label  ; B\xFCy\xFCkse (ZF=0 ve SF=OF)\nJL label  ; K\xFC\xE7\xFCkse (SF!=OF)\nJGE label ; B\xFCy\xFCk veya e\u015Fitse (SF=OF)\nJLE label ; K\xFC\xE7\xFCk veya e\u015Fitse (ZF=1 veya SF!=OF)",
        description: "\u0130\u015Faretli say\u0131larda negatif/pozitif durumlar\u0131 do\u011Fru hesaplar.",
        example: "CMP AX, -10\nJL DAHA_KUCUK   ; AX < -10 ise atlar",
        note: "Negatif say\u0131larda JA/JB yerine mutlaka JG/JL ailesi kullan\u0131lmal\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "JCXZ",
    name: "Jump if CX is Zero",
    category: "control",
    summary: "CX yazmac\u0131 s\u0131f\u0131r ise etikete atlar. CX bayraklar\u0131 etkilemeden test edilmi\u015F olur.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "JCXZ label",
        description: "D\xF6ng\xFC \xF6ncesi saya\xE7 s\u0131f\u0131r m\u0131 kontrol\xFC.",
        example: "JCXZ ATLA       ; CX=0 ise d\xF6ng\xFCye hi\xE7 girme\nDONGU:\n  LOOP DONGU\nATLA:",
        note: "LOOP komutunun 0 iken 65535 kez d\xF6nmesini engellemek i\xE7in d\xF6ng\xFC ba\u015F\u0131nda kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "LOOP",
    name: "Loop (D\xF6ng\xFC Ad\u0131m\u0131)",
    category: "control",
    summary: "CX yazmac\u0131n\u0131 1 azalt\u0131r. CX s\u0131f\u0131r de\u011Filse (CX != 0) belirtilen etikete geri atlar. CX=0 oldu\u011Funda d\xF6ng\xFC sonlan\u0131r.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "LOOP label",
        description: "Otomatik CX saya\xE7l\u0131 d\xF6ng\xFC.",
        example: "MOV CX, 5\nDONGU:\n  ; Buradaki kod 5 kez \xE7al\u0131\u015F\u0131r\n  LOOP DONGU",
        note: "LOOP komutu en fazla -128..+127 bayt aral\u0131\u011F\u0131na k\u0131sa atlama yapabilir."
      }
    ]
  },
  {
    opcode: "LOOPE / LOOPNE",
    name: "Loop while Equal / Not Equal",
    category: "control",
    summary: "LOOPE/LOOPZ: CX 1 azal\u0131r; CX!=0 VE ZF==1 ise d\xF6ner. LOOPNE/LOOPNZ: CX 1 azal\u0131r; CX!=0 VE ZF==0 ise d\xF6ner.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "LOOPE label / LOOPNE label",
        description: "Hem saya\xE7 hem bayrak ko\u015Fullu d\xF6ng\xFC.",
        example: "MOV CX, 10\nARA:\n  CMP [SI], AL\n  LOOPE ARA     ; E\u015Fit oldu\u011Fu s\xFCrece devam et",
        note: "Dizilerde arama yaparken erken \xE7\u0131k\u0131\u015F sa\u011Flar."
      }
    ]
  },
  {
    opcode: "CALL",
    name: "Call Procedure (Altprogram \xC7a\u011F\u0131r)",
    category: "control",
    summary: "D\xF6n\xFC\u015F adresini (bir sonraki komutun ofsetini) y\u0131\u011F\u0131na PUSH eder ve altprogram etiketine atlar.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "CALL label",
        description: "Altprogram \xE7a\u011Fr\u0131s\u0131.",
        example: "CALL TOPLA\n...\nTOPLA:\n  ADD AX, BX\n  RET",
        note: "Altprogram mutlaka RET ile sonlanmal\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "RET / RETN",
    name: "Return from Procedure (Altprogramdan D\xF6n)",
    category: "control",
    summary: "Y\u0131\u011F\u0131ndan d\xF6n\xFC\u015F adresini POP ederek IP'ye y\xFCkler ve \xE7a\u011Fr\u0131ld\u0131\u011F\u0131 sat\u0131r\u0131n hemen sonras\u0131ndan devam eder.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "RET",
        description: "Standart altprogram d\xF6n\xFC\u015F\xFC.",
        example: "TOPLA:\n  ADD AX, BX\n  RET",
        note: "CALL ile y\u0131\u011F\u0131na at\u0131lan IP adresini \xE7eker."
      },
      {
        syntax: "RET imm16",
        description: "D\xF6nd\xFCkten sonra y\u0131\u011F\u0131ndan belirtilen bayt kadar parametre temizler (SP = SP + imm16).",
        example: "RET 4           ; D\xF6n\xFC\u015Ften sonra y\u0131\u011F\u0131ndaki 4 bayt\u0131 (2 kelime) d\xFC\u015Fer",
        note: "Pascal/C \xE7a\u011Fr\u0131 standartlar\u0131nda y\u0131\u011F\u0131ndaki parametreleri temizler."
      }
    ]
  },
  // --- DİZİ (STRING) İŞLEMLERİ ---
  {
    opcode: "MOVSB / MOVSW",
    name: "Move String Byte/Word (Dizi Eleman\u0131 Ta\u015F\u0131)",
    category: "string",
    summary: "DS:SI adresindeki bayt/kelimeyi ES:DI adresine kopyalar. DF=0 ise SI ve DI artar, DF=1 ise azal\u0131r.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "MOVSB / MOVSW",
        description: "Bellekten belle\u011Fe blok veri kopyalama.",
        example: "LEA SI, KAYNAK\nLEA DI, HEDEF\nMOV CX, 10\nCLD             ; \u0130leri y\xF6n\nREP MOVSB       ; 10 bayt\u0131 pe\u015F pe\u015Fe kopyalar",
        note: "REP \xF6neki ile birlikte tam bellek kopyalama fonksiyonu g\xF6r\xFCr."
      }
    ]
  },
  {
    opcode: "LODSB / LODSW",
    name: "Load String Byte/Word",
    category: "string",
    summary: "DS:SI adresindeki bayt\u0131 AL'ye (veya kelimeyi AX'e) okur, SI'yi DF'ye g\xF6re 1 veya 2 art\u0131r\u0131r/azalt\u0131r.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "LODSB / LODSW",
        description: "Diziden s\u0131radaki eleman\u0131 \xE7eker.",
        example: "LEA SI, METIN\nCLD\nLODSB           ; AL = s\u0131radaki karakter, SI artar",
        note: "Dizi okuma d\xF6ng\xFClerinde \xE7ok pratiktir."
      }
    ]
  },
  {
    opcode: "STOSB / STOSW",
    name: "Store String Byte/Word",
    category: "string",
    summary: "AL (veya AX) i\xE7indeki de\u011Feri ES:DI adresine yazar, DI'yi DF'ye g\xF6re art\u0131r\u0131r/azalt\u0131r.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "STOSB / STOSW",
        description: "Bellek b\xF6lgesini belirli bir de\u011Ferle doldurur (memset).",
        example: "LEA DI, ALAN\nMOV AL, 0\nMOV CX, 100\nCLD\nREP STOSB       ; 100 bayt\u0131 0 ile s\u0131f\u0131rlar",
        note: "Bellek temizleme i\u015Flemlerinde y\xFCksek h\u0131z sa\u011Flar."
      }
    ]
  },
  {
    opcode: "CMPSB / CMPSW",
    name: "Compare String Byte/Word",
    category: "string",
    summary: "DS:SI ile ES:DI adreslerindeki verileri kar\u015F\u0131la\u015Ft\u0131r\u0131r, bayraklar\u0131 g\xFCnceller ve SI/DI'yi ilerletir.",
    flags: "T\xFCm bayraklar g\xFCncellenir.",
    variations: [
      {
        syntax: "REPE CMPSB",
        description: "\u0130ki metin veya bellek blo\u011Funu e\u015Fit oldu\u011Fu s\xFCrece kar\u015F\u0131la\u015Ft\u0131r\u0131r.",
        example: "REPE CMPSB      ; Karakterler e\u015Fit oldu\u011Fu s\xFCrece ilerle",
        note: "strcmp fonksiyonunun donan\u0131msal kar\u015F\u0131l\u0131\u011F\u0131d\u0131r."
      }
    ]
  },
  {
    opcode: "SCASB / SCASW",
    name: "Scan String Byte/Word",
    category: "string",
    summary: "AL veya AX i\xE7indeki de\u011Feri ES:DI adresindeki de\u011Ferle kar\u015F\u0131la\u015Ft\u0131r\u0131r, bayraklar\u0131 g\xFCnceller ve DI'yi ilerletir.",
    flags: "T\xFCm bayraklar g\xFCncellenir.",
    variations: [
      {
        syntax: "REPNE SCASB",
        description: "Dizi i\xE7inde belirli bir karakteri arar (strchr).",
        example: "MOV AL, '$'\nREPNE SCASB     ; $ karakterini bulana kadar tara",
        note: "Metin sonu veya \xF6zel ay\u0131r\u0131c\u0131 aramada kullan\u0131l\u0131r."
      }
    ]
  },
  // --- BAYRAK VE SİSTEM KONTROL ---
  {
    opcode: "CLC / STC / CMC",
    name: "Carry Flag Controls (Elde Bayra\u011F\u0131 Kontrolleri)",
    category: "flags",
    summary: "CLC: CF = 0 yapar. STC: CF = 1 yapar. CMC: CF bayra\u011F\u0131n\u0131 tersler (CF = !CF).",
    flags: "Yaln\u0131zca CF g\xFCncellenir.",
    variations: [
      {
        syntax: "CLC ; Clear Carry\nSTC ; Set Carry\nCMC ; Complement Carry",
        description: "Elde bayra\u011F\u0131n\u0131 do\u011Frudan y\xF6netir.",
        example: "CLC             ; Toplama \xF6ncesi eldeyi s\u0131f\u0131rla\nADC AX, BX",
        note: "\xC7ok basamakl\u0131 aritmetik ve d\xF6n\xFC\u015F kodlar\u0131nda kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "CLD / STD",
    name: "Direction Flag Controls (Y\xF6n Bayra\u011F\u0131 Kontrolleri)",
    category: "flags",
    summary: "CLD: DF = 0 (Dizi komutlar\u0131 ileri/artan adreslere gider). STD: DF = 1 (Dizi komutlar\u0131 geri/azalan adreslere gider).",
    flags: "Yaln\u0131zca DF g\xFCncellenir.",
    variations: [
      {
        syntax: "CLD ; \u0130leri y\xF6n (SI/DI artar)\nSTD ; Geri y\xF6n (SI/DI azal\u0131r)",
        description: "Dizi operasyonlar\u0131n\u0131n y\xF6n\xFCn\xFC tayin eder.",
        example: "CLD             ; G\xFCvenlik i\xE7in dizi komutundan \xF6nce verilir\nREP MOVSB",
        note: "MOVSB, STOSB vb. komutlardan \xF6nce mutlaka y\xF6n belirlenmelidir."
      }
    ]
  },
  {
    opcode: "CLI / STI",
    name: "Interrupt Flag Controls (Kesme \u0130zinleri)",
    category: "flags",
    summary: "CLI: D\u0131\u015F donan\u0131m kesmelerini devre d\u0131\u015F\u0131 b\u0131rak\u0131r (IF=0). STI: D\u0131\u015F kesmeleri a\xE7ar (IF=1).",
    flags: "Yaln\u0131zca IF g\xFCncellenir.",
    variations: [
      {
        syntax: "CLI ; Kesmeleri kapat\nSTI ; Kesmeleri a\xE7",
        description: "Kritik kod b\xF6l\xFCmlerinde i\u015Flemcinin b\xF6l\xFCnmesini \xF6nler.",
        example: "CLI             ; Kritik b\xF6l\xFCm ba\u015Flad\u0131\n...\nSTI             ; Kritik b\xF6l\xFCm bitti",
        note: "Ger\xE7ek mod sistem programlamas\u0131nda kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "LAHF / SAHF",
    name: "Load/Store AH from/to Flags",
    category: "flags",
    summary: "LAHF: D\xFC\u015F\xFCk bayraklar\u0131 (SF, ZF, AF, PF, CF) AH yazmac\u0131na kopyalar. SAHF: AH'deki de\u011Ferleri bayraklara y\xFCkler.",
    flags: "LAHF bayraklar\u0131 etkilemez; SAHF SF, ZF, AF, PF, CF bayraklar\u0131n\u0131 g\xFCnceller.",
    variations: [
      {
        syntax: "LAHF / SAHF",
        description: "Bayrak durumunu kaydetmek ve geri y\xFCklemek i\xE7in h\u0131zl\u0131 yol.",
        example: "LAHF            ; Bayraklar\u0131 AH'ye al\n...\nSAHF            ; Bayraklar\u0131 geri y\xFCkle",
        note: "8080 i\u015Flemcisi ile uyumluluk i\xE7in tasarlanm\u0131\u015Ft\u0131r."
      }
    ]
  },
  {
    opcode: "NOP",
    name: "No Operation (Bo\u015F Komut)",
    category: "flags",
    summary: "\u0130\u015Flemciye hi\xE7bir i\u015Flem yapt\u0131rmaz (XCHG AX, AX olarak kodlan\u0131r). 1 makine d\xF6ng\xFCs\xFC harcar.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "NOP",
        description: "1 baytl\u0131k yer tutar veya k\xFC\xE7\xFCk gecikme sa\u011Flar.",
        example: "NOP             ; 1 bayt 90h opkodu",
        note: "Hizalama veya kod yamalar\u0131nda kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "HLT",
    name: "Halt Processor (\u0130\u015Flemciyi Durdur)",
    category: "flags",
    summary: "\u0130\u015Flemciyi harici bir kesme (interrupt) veya reset gelene kadar duraklat\u0131r.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "HLT",
        description: "Program y\xFCr\xFCtmesini sonland\u0131r\u0131r.",
        example: "MOV AX, 1\nHLT             ; Sim\xFClat\xF6r burada durur",
        note: "Sim\xFClat\xF6rde program\u0131n bitti\u011Fini bildiren standart komuttur."
      }
    ]
  },
  {
    opcode: "INT",
    name: "Software Interrupt (Yaz\u0131l\u0131msal Kesme)",
    category: "flags",
    summary: "Belirtilen kesme vekt\xF6r\xFCn\xFC (0-255) \xE7a\u011F\u0131r\u0131r. DOS ve BIOS servislerine eri\u015Fim sa\u011Flar.",
    flags: "IF ve TF s\u0131f\u0131rlan\u0131r, bayraklar ve CS:IP y\u0131\u011F\u0131na at\u0131l\u0131r.",
    variations: [
      {
        syntax: "INT 21H",
        description: "DOS Sistem \xC7a\u011Fr\u0131s\u0131 (AH fonksiyon koduna g\xF6re \xE7al\u0131\u015F\u0131r).",
        example: "MOV AH, 09H     ; String yazd\u0131rma servisi\nMOV DX, OFFSET MESAJ\nINT 21H\n\nMOV AH, 4CH     ; Programdan \xE7\u0131k\u0131\u015F servisi\nINT 21H",
        note: "Sim\xFClat\xF6r\xFCm\xFCzde AH=09h (ekrana metin yazma) ve AH=4Ch (\xE7\u0131k\u0131\u015F) desteklenir."
      },
      {
        syntax: "INT 3",
        description: "Hata ay\u0131klay\u0131c\u0131 kesme noktas\u0131 (Breakpoint).",
        example: "INT 3",
        note: "1 baytl\u0131k \xF6zel CC opkoduna sahiptir."
      }
    ]
  },
  // --- YÖNERGELER (DIRECTIVES) ---
  {
    opcode: "ORG",
    name: "Origin Directive (Ba\u015Flang\u0131\xE7 Adresi)",
    category: "directives",
    summary: "Program\u0131n bellekteki yerle\u015Fim ofsetini belirler. DOS COM dosyalar\u0131 i\xE7in zorunlu ba\u015Flang\u0131\xE7 100h'dir.",
    flags: "Bayraklar\u0131 etkilemez (Assembler y\xF6nergesidir).",
    variations: [
      {
        syntax: "ORG 100H",
        description: "Program\u0131 CS:0100h ofsetine yerle\u015Ftirir.",
        example: "ORG 100H\nSTART:\n  MOV AX, 5",
        note: "\u0130lk 256 bayt (00h-FFh) DOS PSP (Program Segment Prefix) i\xE7in ayr\u0131lm\u0131\u015Ft\u0131r."
      }
    ]
  },
  {
    opcode: "DB / DW",
    name: "Define Byte / Define Word (Veri Tan\u0131mlama)",
    category: "directives",
    summary: "DB: 8-bitlik bayt verileri veya stringleri tan\u0131mlar. DW: 16-bitlik kelime verilerini tan\u0131mlar.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "label DB val1, val2, ... / 'string'",
        description: "Bayt dizisi veya metin tan\u0131mlar.",
        example: "SAYILAR DB 5, 12, 8, 25\nMESAJ DB 'Merhaba D\xFCnya$'",
        note: "Stringler tek veya \xE7ift t\u0131rnak ile tan\u0131mlan\u0131r."
      },
      {
        syntax: "label DW val1, val2, ...",
        description: "16-bitlik kelime dizisi tan\u0131mlar.",
        example: "TABLO DW 1000H, 2000H, 3000H",
        note: "Intel 8086 Little-Endian format\u0131nda (d\xFC\u015F\xFCk bayt \xF6nce) saklan\u0131r."
      }
    ]
  },
  {
    opcode: "DUP",
    name: "Duplicate Directive (Tekrarl\u0131 Veri)",
    category: "directives",
    summary: "DB veya DW ile birlikte belirli say\u0131da ard\u0131\u015F\u0131k alan\u0131 ba\u015Flatmak veya bo\u015F b\u0131rakmak i\xE7in kullan\u0131l\u0131r.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "count DUP(val)",
        description: "Belirtilen say\u0131da ayn\u0131 de\u011Ferden \xFCretir.",
        example: "DIZI DB 10 DUP(0)    ; 10 baytl\u0131k s\u0131f\u0131r dizisi\nYIGIN DW 32 DUP(?)   ; 32 kelimelik y\u0131\u011F\u0131n alan\u0131",
        note: "Dizi tamponlar\u0131 ve y\u0131\u011F\u0131n alanlar\u0131 tan\u0131mlarken kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "OFFSET",
    name: "Offset Operator (Ofset Operat\xF6r\xFC)",
    category: "directives",
    summary: "Bir etiketin veri segmenti i\xE7indeki 16-bit ofset adresini d\xF6ner.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "OFFSET label",
        description: "Etiketin say\u0131sal ofset adresini d\xF6nd\xFCr\xFCr.",
        example: "MOV DX, OFFSET METIN ; LEA DX, METIN ile e\u015Fde\u011Ferdir",
        note: "INT 21H \xE7a\u011Fr\u0131lar\u0131nda string adresini DX'e y\xFCklemek i\xE7in \xE7ok s\u0131k kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "BYTE / WORD PTR",
    name: "Type Override Operators (Boyut Belirleyiciler)",
    category: "directives",
    summary: "Bellek operasyonlar\u0131nda hedefin boyutunun belirsiz oldu\u011Fu durumlarda bayt m\u0131 (8-bit) kelime mi (16-bit) oldu\u011Funu a\xE7\u0131k\xE7a belirtir.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "BYTE PTR [mem] / WORD PTR [mem]",
        description: "Bellek boyutunu belirler.",
        example: "MOV BYTE PTR [BX], 0FFH   ; 1 bayt yazar\nMOV WORD PTR [BX], 0FFH   ; 2 bayt yazar (00FFh)",
        note: "Derleyicinin operand boyutu hatas\u0131 (ambiguous operand size) vermesini engeller."
      }
    ]
  },
  {
    opcode: ".MODEL",
    name: "Memory Model Directive (Bellek Modeli)",
    category: "directives",
    summary: "Program\u0131n bellek organizasyonunu tan\u0131mlar (TINY, SMALL, MEDIUM, COMPACT, LARGE, FLAT). Kod ve veri segmenti say\u0131lar\u0131n\u0131 ve i\u015Faret\xE7i tiplerini belirler.",
    flags: "Bayraklar\u0131 etkilemez (Assembler y\xF6nergesidir).",
    rules: '8086 mimarisinde standart DOS EXE programlar\u0131 i\xE7in ".MODEL SMALL", tek segmentli COM programlar\u0131 i\xE7in ".MODEL TINY" kullan\u0131l\u0131r.',
    variations: [
      {
        syntax: ".MODEL SMALL",
        description: "Standart EXE modelidir: 1 adet 64KB kod segmenti ve 1 adet 64KB veri segmenti tan\u0131mlar. T\xFCm i\u015Faret\xE7iler 16-bit NEAR'd\u0131r.",
        example: ".MODEL SMALL\n.STACK 100H\n.DATA\n.CODE",
        note: "Barry B. Brey kitab\u0131nda ve \xFCniversite m\xFCfredat\u0131nda en \xE7ok kullan\u0131lan temel modeldir."
      },
      {
        syntax: ".MODEL TINY",
        description: "DOS .COM format\u0131 i\xE7in kullan\u0131l\u0131r. Kod, veri ve y\u0131\u011F\u0131n tek bir 64KB segmenti payla\u015F\u0131r. ORG 100H ile birlikte \xE7al\u0131\u015F\u0131r.",
        example: ".MODEL TINY\nORG 100H\nSTART: MOV AX, 5",
        note: "Tek segmentli oldu\u011Fu i\xE7in @DATA y\xFCklemesine gerek yoktur."
      }
    ]
  },
  {
    opcode: ".DATA",
    name: "Data Segment Directive (Basitle\u015Ftirilmi\u015F Veri Segmenti)",
    category: "directives",
    summary: 'Program de\u011Fi\u015Fkenlerinin tan\u0131mland\u0131\u011F\u0131 veri segmentini (Data Segment) ba\u015Flat\u0131r. Geleneksel "DATA SEGMENT ... DATA ENDS" blo\u011Funun modern MASM kar\u015F\u0131l\u0131\u011F\u0131d\u0131r.',
    flags: "Bayraklar\u0131 etkilemez.",
    rules: '.DATA i\xE7inde tan\u0131mlanan de\u011Fi\u015Fkenlere eri\u015Fmek i\xE7in kod segmenti ba\u015F\u0131nda "MOV AX, @DATA" ve "MOV DS, AX" ile DS yazmac\u0131 kurulmal\u0131d\u0131r.',
    variations: [
      {
        syntax: ".DATA",
        description: "Veri segmentini a\xE7ar; ard\u0131ndan DB, DW ve DUP ile de\u011Fi\u015Fkenler bildirilir.",
        example: ".DATA\nSAYI DW 1234H\nMETIN DB '8086 Assembly$'",
        note: "De\u011Fi\u015Fkenler bellekte bildirim s\u0131ras\u0131na g\xF6re ard\u0131\u015F\u0131k yerle\u015Ftirilir."
      }
    ]
  },
  {
    opcode: ".CODE",
    name: "Code Segment Directive (Basitle\u015Ftirilmi\u015F Kod Segmenti)",
    category: "directives",
    summary: "\u0130\u015Flemcinin \xE7al\u0131\u015Ft\u0131raca\u011F\u0131 makine komutlar\u0131n\u0131n yer ald\u0131\u011F\u0131 kod segmentini (Code Segment) ba\u015Flat\u0131r.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: ".CODE",
        description: "Kod segmentini a\xE7ar. Y\xFCr\xFCt\xFClecek prosed\xFCrler ve komutlar bu y\xF6nergeden sonra yaz\u0131l\u0131r.",
        example: ".CODE\nMAIN PROC\n  MOV AX, @DATA\n  MOV DS, AX\n  HLT\nMAIN ENDP",
        note: 'Geleneksel "CODE SEGMENT ... CODE ENDS" ve "ASSUME CS:CODE" tan\u0131mlar\u0131n\u0131 otomatikle\u015Ftirir.'
      }
    ]
  },
  {
    opcode: ".STACK",
    name: "Stack Segment Directive (Y\u0131\u011F\u0131n Segmenti ve Boyutu)",
    category: "directives",
    summary: "Program\u0131n y\u0131\u011F\u0131n (Stack) bellek alan\u0131n\u0131 ve boyutunu belirler.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: ".STACK [boyut]",
        description: "Y\u0131\u011F\u0131n i\xE7in bayt cinsinden alan tahsis eder. Genellikle 100H (256 bayt) kullan\u0131l\u0131r.",
        example: ".STACK 100H",
        note: "Program belle\u011Fe y\xFCklenirken SS (Stack Segment) ve SP (Stack Pointer) yazma\xE7lar\u0131 bu boyuta g\xF6re otomatik kurulur."
      }
    ]
  },
  {
    opcode: "@DATA / @CODE",
    name: "Predefined Segment Symbols (\xD6n Tan\u0131ml\u0131 Segment Sabitleri)",
    category: "directives",
    summary: ".DATA ve .CODE segmentlerinin 16-bitlik ba\u015Flang\u0131\xE7 segment adreslerini temsil eden derleyici sembolleridir.",
    flags: "Bayraklar\u0131 etkilemez.",
    rules: "\u26A1 8086 ALTIN KURALI: Segment yazma\xE7lar\u0131na (DS, ES, SS) do\u011Frudan sabit/immediate say\u0131 y\xFCklenemez (MOV DS, @DATA donan\u0131msal olarak YASAKTIR)! Adres \xF6nce AX'e al\u0131n\u0131p ard\u0131ndan DS'ye aktar\u0131l\u0131r: MOV AX, @DATA -> MOV DS, AX.",
    variations: [
      {
        syntax: "MOV AX, @DATA\nMOV DS, AX",
        description: "Veri segmentinin fiziksel ba\u015Flang\u0131\xE7 segment adresini DS yazmac\u0131na y\xFCklemenin tek ge\xE7erli yoludur.",
        example: "MOV AX, @DATA   ; 1. Veri segment adresini AX'e al\nMOV DS, AX      ; 2. AX'i DS segment yazmac\u0131na aktar",
        note: `S\u0131navlar\u0131n en klasik sorusu: 8086 ISA's\u0131nda "MOV segreg, imm" komutu bulunmad\u0131\u011F\u0131 i\xE7in AX gibi genel yazma\xE7 k\xF6pr\xFC olarak kullan\u0131l\u0131r.`
      },
      {
        syntax: "MOV AX, @CODE",
        description: "Kod segmentinin ba\u015Flang\u0131\xE7 segment adresini temsil eder.",
        example: "MOV AX, @CODE",
        note: "\xC7al\u0131\u015Fan kod segmentinin (CS) taban adresini okumak i\xE7in kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "SEGMENT / ENDS",
    name: "Traditional Segment Definition (Klasik Tam Segment Blo\u011Fu)",
    category: "directives",
    summary: "Barry B. Brey kitab\u0131nda ve klasik 8086 yap\u0131s\u0131nda kullan\u0131lan tam segment bildirim blo\u011Fudur.",
    flags: "Bayraklar\u0131 etkilemez.",
    rules: "Her SEGMENT y\xF6nergesi ayn\u0131 isimli bir ENDS y\xF6nergesiyle kapat\u0131lmal\u0131d\u0131r. ASSUME direktifi ile CS ve DS e\u015Fle\u015Ftirmesi yap\u0131l\u0131r.",
    variations: [
      {
        syntax: "seg_adi SEGMENT ... seg_adi ENDS",
        description: "Ba\u011F\u0131ms\u0131z bir mant\u0131ksal segment alan\u0131 tan\u0131mlar.",
        example: "DATA SEGMENT\n  X DW 5\nDATA ENDS\n\nCODE SEGMENT\n  ASSUME CS:CODE, DS:DATA\nSTART:\n  MOV AX, DATA\n  MOV DS, AX\n  HLT\nCODE ENDS\nEND START",
        note: "Klasik s\xF6zdiziminde segment ad\u0131 do\u011Frudan kullan\u0131l\u0131r (MOV AX, DATA); basitle\u015Ftirilmi\u015F s\xF6zdiziminde ise @DATA kullan\u0131l\u0131r."
      }
    ]
  },
  {
    opcode: "ASSUME",
    name: "Segment Register Association (Segment Yazmac\u0131 E\u015Fleme Y\xF6nergesi)",
    category: "directives",
    summary: "Derleyiciye hangi segment yazmac\u0131n\u0131n (CS, DS, SS, ES) hangi mant\u0131ksal segment blo\u011Funa i\u015Faret etti\u011Fini bildirir.",
    flags: "Bayraklar\u0131 etkilemez (Makine kodu \xFCretmez).",
    variations: [
      {
        syntax: "ASSUME CS:code_seg, DS:data_seg",
        description: "Segment yazma\xE7lar\u0131n\u0131 mant\u0131ksal segment etiketleriyle e\u015Fle\u015Ftirir.",
        example: "ASSUME CS:CODE, DS:DATA, SS:STACK",
        note: "ASSUME i\u015Flemciye de\u011Fer y\xFCklemez; sadece derleyicinin segment prefix'lerini (CS:, DS: vb.) do\u011Fru se\xE7mesini sa\u011Flar."
      }
    ]
  },
  {
    opcode: "PROC / ENDP",
    name: "Procedure Definition (Alt Program / Prosed\xFCr Tan\u0131m\u0131)",
    category: "directives",
    summary: "CALL komutu ile \xE7a\u011Fr\u0131labilen ve RET ile d\xF6n\xFClen alt program (fonksiyon) bloklar\u0131n\u0131 tan\u0131mlar.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "ad PROC [NEAR/FAR] ... ad ENDP",
        description: "Prosed\xFCr g\xF6vdesini a\xE7ar ve kapat\u0131r.",
        example: "TOPLA PROC\n  ADD AX, BX\n  RET\nTOPLA ENDP",
        note: "Prosed\xFCr sonunda RET komutu unutulursa i\u015Flemci sonraki komutlar\u0131 kontrols\xFCzce \xE7al\u0131\u015Ft\u0131rmaya devam eder!"
      }
    ]
  },
  {
    opcode: "END",
    name: "End of Program Directive (Program Biti\u015Fi ve Giri\u015F Noktas\u0131)",
    category: "directives",
    summary: "Kaynak dosyan\u0131n bitti\u011Fini derleyiciye bildirir. \u0130ste\u011Fe ba\u011Fl\u0131 olarak ilk \xE7al\u0131\u015Facak komutun etiketini (Entry Point) belirler.",
    flags: "Bayraklar\u0131 etkilemez.",
    variations: [
      {
        syntax: "END [etiket]",
        description: "Derlemeyi sonland\u0131r\u0131r ve ba\u015Flang\u0131\xE7 etiketini ba\u011Flay\u0131c\u0131ya (linker) CS:IP ba\u015Flang\u0131c\u0131 olarak aktar\u0131r.",
        example: "MAIN PROC\n  MOV AX, @DATA\n  MOV DS, AX\n  HLT\nMAIN ENDP\nEND MAIN",
        note: "Belirtilen etiket (\xF6rne\u011Fin MAIN veya START), i\u015Flemcinin program ba\u015Flad\u0131\u011F\u0131nda atlayaca\u011F\u0131 ilk adrestir."
      }
    ]
  }
];
var ADDRESSING_MODES = [
  {
    modeName: "1. Register Addressing (Yazma\xE7 Adresleme)",
    category: "data",
    summary: "Veri do\u011Frudan bir yazma\xE7tan di\u011Ferine veya yazma\xE7 i\xE7inde aktar\u0131l\u0131r. Bellek eri\u015Fimi gerektirmedi\u011Fi i\xE7in en h\u0131zl\u0131 \xE7al\u0131\u015Fan adresleme modudur.",
    registersAllowed: "AX, BX, CX, DX, SI, DI, BP, SP ve 8-bit yar\u0131lar\u0131 (AH, AL, BH...)",
    defaultSegment: "Yok (Yazma\xE7 i\xE7i)",
    example: "MOV AX, BX\nADD AL, BH\nMOV SI, DI",
    notes: "Her iki yazma\xE7 ayn\u0131 boyutta olmal\u0131d\u0131r (8-bit ile 16-bit kar\u0131\u015Ft\u0131r\u0131lamaz: MOV AL, BX ge\xE7ersizdir!)."
  },
  {
    modeName: "2. Immediate Addressing (Sabit / Do\u011Frudan De\u011Fer Adresleme)",
    category: "data",
    summary: "Operand\u0131n kendisi sabit bir say\u0131sal de\u011Ferdir ve do\u011Frudan komut baytlar\u0131n\u0131n i\xE7inde saklan\u0131r.",
    registersAllowed: "Hedef herhangi bir genel yazma\xE7 veya bellek h\xFCcresi olabilir.",
    defaultSegment: "Yok (Kod segmenti i\xE7inde komutla gelir)",
    example: "MOV AX, 1234H\nMOV BL, 50\nMOV WORD PTR [BX], 0FFFFH",
    notes: "Segment yazma\xE7lar\u0131na do\u011Frudan sabit de\u011Fer y\xFCklenemez! (MOV DS, 1000H yasakt\u0131r; \xF6nce AX'e, sonra DS'ye aktar\u0131l\u0131r)."
  },
  {
    modeName: "3. Direct Addressing (Do\u011Frudan Bellek Adresleme)",
    category: "data",
    summary: "Bellek ofset adresi komutun i\xE7inde do\u011Frudan sabit bir adres veya etiket olarak verilir.",
    formula: "Fiziksel Adres = DS * 16 + Disp16",
    registersAllowed: "Kaynak veya hedef bellek ofsetidir.",
    defaultSegment: "DS (Data Segment)",
    example: "MOV AX, [1234H]   ; DS:1234h adresindeki kelimeyi AX'e okur\nMOV [500H], BL    ; BL de\u011Ferini DS:0500h adresine yazar",
    notes: "Do\u011Frudan adresleme ile program de\u011Fi\u015Fkenlerinin ofsetleri okunur veya yaz\u0131l\u0131r."
  },
  {
    modeName: "4. Register Indirect Addressing (Yazma\xE7 Dolayl\u0131 Adresleme)",
    category: "data",
    summary: "Bellek ofset adresi k\xF6\u015Feli parantez i\xE7inde bir i\u015Faret\xE7i veya indeks yazmac\u0131nda tutulur.",
    formula: "Fiziksel Adres = Segment * 16 + [Yazma\xE7]",
    registersAllowed: "Yaln\u0131zca 4 yazma\xE7 kullan\u0131labilir: BX, BP, SI, DI",
    defaultSegment: "BX, SI, DI i\xE7in DS; BP i\xE7in varsay\u0131lan olarak SS (Stack Segment)",
    example: "MOV AX, [BX]      ; DS:BX adresindeki veriyi okur\nMOV [DI], CL      ; CL de\u011Ferini DS:DI adresine yazar\nMOV AX, [BP]      ; SS:BP (Y\u0131\u011F\u0131n) adresindeki veriyi okur",
    notes: "8086 Kural\u0131: AX, CX, DX veya SP k\xF6\u015Feli parantez i\xE7inde dolayl\u0131 adresleme i\xE7in KULLANILAMAZ! (MOV AX, [CX] ge\xE7ersizdir)."
  },
  {
    modeName: "5. Base-Plus-Index Addressing (Taban + \u0130ndeks Adresleme)",
    category: "data",
    summary: "Bir taban yazmac\u0131 (BX veya BP) ile bir indeks yazmac\u0131 (SI veya DI) toplanarak efektif adres olu\u015Fturulur.",
    formula: "Efektif Adres (EA) = Taban (BX/BP) + \u0130ndeks (SI/DI)",
    registersAllowed: "Bir Taban (BX veya BP) + Bir \u0130ndeks (SI veya DI)",
    defaultSegment: "BX ile DS; BP ile SS",
    example: "MOV AX, [BX+SI]   ; DS:[BX+SI] adresinden okur\nMOV [BP+DI], DX   ; SS:[BP+DI] adresine yazar\nMOV CL, [BX][DI]   ; [BX+DI] ile ayn\u0131 s\xF6zdizimidir",
    notes: "\u0130ki taban ([BX+BP]) veya iki indeks ([SI+DI]) birlikte KULLANILAMAZ!"
  },
  {
    modeName: "6. Register Relative Addressing (Yazma\xE7 Ba\u011F\u0131l Adresleme)",
    category: "data",
    summary: "Bir baz veya indeks yazmac\u0131na 8-bit veya 16-bit sabit bir yer de\u011Fi\u015Ftirme (displacement / ofset) eklenir.",
    formula: "EA = (BX/BP/SI/DI) + Displacement",
    registersAllowed: "BX, BP, SI, DI + Sabit De\u011Fer / Etiket",
    defaultSegment: "BX, SI, DI i\xE7in DS; BP i\xE7in SS",
    example: "MOV AX, [BX+4]      ; BX ofsetinden 4 bayt ileriyi okur\nMOV ARRAY[SI], AL  ; ARRAY dizisinin SI'\u0131nc\u0131 eleman\u0131n\u0131 yazar\nMOV [BP-2], CX     ; Y\u0131\u011F\u0131ndaki yerel de\u011Fi\u015Fkeni okur/yazar",
    notes: "Dizilerde ve y\u0131\u011F\u0131n \xE7er\xE7evelerindeki (Stack Frame) yerel de\u011Fi\u015Fkenlerde \xE7ok s\u0131k kullan\u0131l\u0131r."
  },
  {
    modeName: "7. Base Relative-Plus-Index Addressing (Taban Ba\u011F\u0131l + \u0130ndeks Adresleme)",
    category: "data",
    summary: "En geli\u015Fmi\u015F 8086 adresleme modu: Bir taban yazmac\u0131, bir indeks yazmac\u0131 ve sabit bir yer de\u011Fi\u015Ftirme toplan\u0131r.",
    formula: "EA = Taban (BX/BP) + \u0130ndeks (SI/DI) + Displacement",
    registersAllowed: "(BX veya BP) + (SI veya DI) + Sabit / Dizi \u0130smi",
    defaultSegment: "BX ile DS; BP ile SS",
    example: "MOV AX, [BX+SI+4]    ; \xC7ok boyutlu matris veya yap\u0131 eleman\u0131 okuma\nMOV TABLO[BP+DI], AX\nMOV CX, [BX][SI+10H]",
    notes: "\u0130ki boyutlu diziler (matrisler) ve struct/record veri yap\u0131lar\u0131na eri\u015Fim i\xE7in idealdir."
  }
];
var ARCHITECTURE_GUIDE = {
  title: "8086 Mikroi\u015Flemci Mimarisi & Fiziksel Adresleme (Week 1\u20132)",
  busSystem: {
    addressBus: "20-bit Geni\u015Flik (1 MB = 1,048,576 bayt do\u011Frudan adreslenebilir bellek)",
    dataBus: "16-bit Geni\u015Flik (Her saat vuru\u015Funda 1 bayt veya 1 kelime aktar\u0131l\u0131r)",
    controlBus: "Bellek ve I/O okuma/yazma denetim sinyalleri (MEMR, MEMW, IOR, IOW)"
  },
  memoryOrganization: {
    title: "Ger\xE7ek Mod (Real Mode) Bellek Haritas\u0131",
    tpa: "TPA (Transient Program Area): 00000H - 9FFFFH (640 KB) - DOS, kullan\u0131c\u0131 programlar\u0131 ve veriler burada \xE7al\u0131\u015F\u0131r.",
    systemArea: "System Area: A0000H - FFFFFH (384 KB) - Video RAM (A0000H-BFFFFH) ve ROM-BIOS (C0000H-FFFFFH) alan\u0131d\u0131r."
  },
  realModeFormula: {
    formula: "Fiziksel Adres (20-bit) = (Segment Yazmac\u0131 * 10H) + Ofset Yazmac\u0131",
    explanation: "Segment yazmac\u0131n\u0131n de\u011Feri 16 ile \xE7arp\u0131l\u0131r (ikilikte 4 bit sola kayd\u0131r\u0131l\u0131r, sonuna bir Hex 0 eklenir) ve 16-bitlik ofset ile toplan\u0131r.",
    example: "\xD6rnek: CS = 348AH ve IP = 4214H ise:\n  Segment * 10H : 348A0H\n  Ofset         : +4214H\n  -----------------------\n  Fiziksel Adres:  38AB4H (Bellekteki ger\xE7ek 20-bit adres)"
  },
  defaultPairs: [
    { purpose: "Komut Getirme (Instruction Fetch)", segment: "CS (Code Segment)", offset: "IP (Instruction Pointer)" },
    { purpose: "Y\u0131\u011F\u0131n \u0130\u015Flemleri (Stack Push/Pop)", segment: "SS (Stack Segment)", offset: "SP (Stack Pointer)" },
    { purpose: "Y\u0131\u011F\u0131n Tabanl\u0131 Adresleme (Stack Frame)", segment: "SS (Stack Segment)", offset: "BP (Base Pointer)" },
    { purpose: "Genel Veri Eri\u015Fimi (Data Access)", segment: "DS (Data Segment)", offset: "BX, SI, DI veya Do\u011Frudan Adres" },
    { purpose: "Hedef Dizi \u0130\u015Flemleri (String Dest)", segment: "ES (Extra Segment)", offset: "DI (Destination Index)" }
  ],
  entryPointGuide: {
    title: "Giri\u015F Noktas\u0131 (Entry Point: CS:IP) & Reset Vekt\xF6r\xFC",
    meaning: "Giri\u015F noktas\u0131, derlenen program belle\u011Fe y\xFCklendi\u011Finde i\u015Flemcinin \xE7al\u0131\u015Ft\u0131rmaya ba\u015Flayaca\u011F\u0131 \u0130LK komutun adresidir. 8086 mimarisinde her komut adresi Kod Segmenti (CS) ve Komut G\xF6stericisi (IP) \xE7iftiyle (CS:IP) belirlenir.",
    defaultOrigin: "Sim\xFClat\xF6rde varsay\u0131lan ba\u015Flang\u0131\xE7 ofseti 0000h'dir (Giri\u015F noktas\u0131: CS:0000h). Program\u0131n ilk bayt\u0131 bellek segmentinin 0000h ofsetine yaz\u0131l\u0131r ve IP = 0000h yap\u0131l\u0131r.",
    org100h: "DOS .COM Programlar\u0131nda ORG 100H Kural\u0131: DOS i\u015Fletim sistemi program\u0131n \xF6n\xFCne 256 baytl\u0131k (100h) PSP (Program Segment Prefix) koydu\u011Fu i\xE7in slaytlardaki kodlar genellikle ORG 100H y\xF6nergesiyle ba\u015Flar ve giri\u015F noktas\u0131 CS:0100h olur.",
    resetVector: "Donan\u0131msal Reset Vekt\xF6r\xFC (FFFF:0000h): 8086 mikroi\u015Flemcisine elektrik ilk verildi\u011Finde veya RESET pinine sinyal geldi\u011Finde, donan\u0131msal olarak CS=FFFFh ve IP=0000h kurulur. Bu adres (FFFF0h) ROM-BIOS ba\u015Flang\u0131\xE7 komutudur (Week 2, Slayt 36)."
  },
  segmentDirectivesGuide: {
    title: "Segment Direktifleri, Bellek Modelleri (.MODEL) ve @DATA Kural\u0131 (Barry Brey & Week 2-3)",
    description: "8086 mimarisinde program kodlar\u0131, veri alanlar\u0131 ve y\u0131\u011F\u0131n segmentler halinde d\xFCzenlenir. Standart MASM/TASM s\xF6zdiziminde basitle\u015Ftirilmi\u015F segment direktifleri (.MODEL) veya klasik tam segment bloklar\u0131 (SEGMENT/ENDS) kullan\u0131l\u0131r.",
    models: [
      { name: "TINY", desc: "Kod + Veri + Y\u0131\u011F\u0131n tek bir 64KB segmenti payla\u015F\u0131r. DOS .COM dosyalar\u0131n\u0131n format\u0131d\u0131r (ORG 100H).", usage: ".MODEL TINY" },
      { name: "SMALL", desc: "1 Kod Segmenti (maks 64KB) + 1 Veri Segmenti (maks 64KB). T\xFCm i\u015Faret\xE7iler 16-bit NEAR'd\u0131r. Standart \xFCniversite/DOS EXE format\u0131d\u0131r.", usage: ".MODEL SMALL" },
      { name: "MEDIUM", desc: "Birden fazla Kod Segmenti (FAR call) + 1 Veri Segmenti (64KB NEAR).", usage: ".MODEL MEDIUM" },
      { name: "COMPACT", desc: "1 Kod Segmenti (64KB NEAR) + Birden fazla Veri Segmenti (FAR pointer).", usage: ".MODEL COMPACT" },
      { name: "LARGE", desc: "\xC7oklu Kod ve \xE7oklu Veri segmentleri. Hem kod hem veri FAR i\u015Faret\xE7ilerle eri\u015Filir.", usage: ".MODEL LARGE" }
    ],
    dataLoadingRule: {
      rule: "Segment Yazma\xE7lar\u0131na (DS, ES, SS) Do\u011Frudan Sabit/Immediate De\u011Fer Y\xFCklenemez!",
      reason: `Intel 8086 mikroi\u015Flemcisinin komut seti mimarisinde (ISA) segment yazmac\u0131na do\u011Frudan sabit say\u0131 y\xFCkleyen ("MOV segreg, imm") bir makine i\u015Flem kodu (opcode) donan\u0131msal olarak YOKTUR. Bu y\xFCzden "MOV DS, @DATA" veya "MOV DS, 1000H" ge\xE7ersizdir; segment adresi \xF6nce AX gibi genel ama\xE7l\u0131 bir yazmaca, ard\u0131ndan DS'ye aktar\u0131l\u0131r.`,
      codeExample: "; 8086 Standart Veri Segmenti Ba\u015Flatma Kal\u0131b\u0131:\nMOV AX, @DATA   ; 1. Veri segmentinin 16-bit adresini AX'e al\nMOV DS, AX      ; 2. AX i\xE7eri\u011Fini Veri Segment Yazmac\u0131na (DS) aktar"
    }
  },
  nestedRegisters: {
    title: "Yazma\xE7 Evrimi ve \u0130\xE7i\xE7e Ge\xE7mi\u015F Geni\u015Flikler (Nested Widths - Week 2)",
    diagram: `+---------------------------------------------------------------+
|                         RAX (64-bit)                          |
+-------------------------------+-------------------------------+
|                               |          EAX (32-bit)         |
|                               +---------------+---------------+
|       (\xDCst 32 bit)            |               |  AX (16-bit)  |
|                               | (\xDCst 16 bit)  +-------+-------+
|                               |               |AH(8b) |AL(8b) |
+-------------------------------+---------------+-------+-------+`,
    rule: "Daha k\xFC\xE7\xFCk bir yazmaca (\xF6rn. AL) yazmak, sadece o 8-bitlik k\u0131sm\u0131 de\u011Fi\u015Ftirir. AH ve \xFCst k\u0131s\u0131mlar korunur."
  }
};
var FLAGS_GUIDE = {
  title: "FLAGS (Bayraklar) Kayd\u0131 ve Ko\u015Fullu Dallanma Rehberi",
  statusFlags: [
    { flag: "CF (Carry)", bit: 0, desc: "Elde Bayra\u011F\u0131: \u0130\u015Faretsiz aritmetik i\u015Flemlerinde en y\xFCksek bitten ta\u015Fma (elde) veya bor\xE7 olu\u015Fursa 1 olur." },
    { flag: "PF (Parity)", bit: 2, desc: "Parite Bayra\u011F\u0131: Sonucun en d\xFC\u015F\xFCk 8 bitindeki 1 bitlerinin say\u0131s\u0131 \xE7ift ise 1, tek ise 0 olur." },
    { flag: "AF (Auxiliary)", bit: 4, desc: "Yard\u0131mc\u0131 Elde: Bit 3'ten Bit 4'e (d\xFC\u015F\xFCk nibble'dan y\xFCksek nibble'a) elde ge\xE7erse 1 olur (BCD i\xE7in kullan\u0131l\u0131r)." },
    { flag: "ZF (Zero)", bit: 6, desc: "S\u0131f\u0131r Bayra\u011F\u0131: Aritmetik veya mant\u0131k i\u015Fleminin sonucu 0 \xE7\u0131karsa 1, s\u0131f\u0131rdan farkl\u0131 \xE7\u0131karsa 0 olur." },
    { flag: "SF (Sign)", bit: 7, desc: "\u0130\u015Faret Bayra\u011F\u0131: Sonucun en y\xFCksek biti (MSB / i\u015Faret biti) 1 ise (negatifse) 1, pozitifse 0 olur." },
    { flag: "OF (Overflow)", bit: 11, desc: "Ta\u015Fma Bayra\u011F\u0131: \u0130\u015Faretli (Signed) say\u0131 i\u015Flemlerinde sonu\xE7 hedef yazmac\u0131n s\u0131n\u0131rlar\u0131n\u0131 a\u015Farsa 1 olur." }
  ],
  controlFlags: [
    { flag: "DF (Direction)", bit: 10, desc: "Y\xF6n Bayra\u011F\u0131: Dizi komutlar\u0131nda SI/DI otomatik art\u0131\u015F (CLD: DF=0, ileri) veya azal\u0131\u015F\u0131n\u0131 (STD: DF=1, geri) belirler." },
    { flag: "IF (Interrupt)", bit: 9, desc: "Kesme Yetkilendirme: Maskelenebilir donan\u0131m kesmelerini a\xE7ar (STI: IF=1) veya kapat\u0131r (CLI: IF=0)." },
    { flag: "TF (Trap)", bit: 8, desc: "Tuzak / Ad\u0131m Bayra\u011F\u0131: 1 yap\u0131ld\u0131\u011F\u0131nda i\u015Flemci her komuttan sonra INT 1 kesmesi \xFCreterek hata ay\u0131klama (single step) sa\u011Flar." }
  ],
  goldenRules: [
    "INC ve DEC komutlar\u0131 Carry Flag (CF) bayra\u011F\u0131n\u0131 ASLA etkilemez! (D\xF6ng\xFC saya\xE7lar\u0131nda elde zincirini korur).",
    "CMP ve TEST komutlar\u0131 veriyi DE\u011E\u0130\u015ET\u0130RMEZ, sadece bayraklar\u0131 g\xFCnceller.",
    "B\xF6lme (DIV / IDIV) i\u015Fleminden sonra hi\xE7bir bayrak g\xFCvenilir de\u011Fildir (hepsi tan\u0131ms\u0131zd\u0131r)."
  ]
};

// src/ui/instructionDoc.ts
var InstructionDoc = class {
  container;
  callbacks;
  activeSection = "instructions";
  activeCategory = "all";
  searchQuery = "";
  selectedOpcode = "MOV";
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }
  openInstruction(opcode) {
    this.selectedOpcode = opcode.toUpperCase();
    this.activeSection = "instructions";
    this.searchQuery = "";
    this.render();
  }
  render() {
    this.container.innerHTML = `
      <div class="reference-doc-container">
        <!-- Top Navigation Bar -->
        <div class="reference-doc-topbar" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #ffffff; border-bottom: 1px solid var(--border-color);">
          <div class="reference-doc-breadcrumb" style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;">
            <button class="btn-back-editor" id="btn-back-editor" style="display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.15s ease;">
              <span>\u2190</span> Edit\xF6re D\xF6n
            </button>
            <span class="bc-sep" style="color: #94a3b8;">/</span>
            <span class="bc-item highlight" id="ref-bc-active" style="color: #0f172a;">\u{1F4D6} 8086 Komut Manueli</span>
          </div>

          <div class="manual-section-nav" style="display: flex; gap: 6px;">
            <button class="btn-sec-nav-pill ${this.activeSection === "instructions" ? "active" : ""}" data-section="instructions">\u{1F4D6} Komut Seti (${INSTRUCTIONS.length})</button>
            <button class="btn-sec-nav-pill ${this.activeSection === "addressing" ? "active" : ""}" data-section="addressing">\u{1F3AF} 7 Adresleme Modu</button>
            <button class="btn-sec-nav-pill ${this.activeSection === "architecture" ? "active" : ""}" data-section="architecture">\u{1F4D0} 8086 Mimarisi</button>
            <button class="btn-sec-nav-pill ${this.activeSection === "flags" ? "active" : ""}" data-section="flags">\u{1F3F3}\uFE0F FLAGS & Atlama</button>
          </div>
        </div>

        <!-- Section 1: Instructions Master-Detail -->
        <div class="manual-section-content" id="section-instructions" style="${this.activeSection === "instructions" ? "display: block;" : "display: none;"}">
          <!-- Search & Category Filter Toolbar -->
          <div class="docs-toolbar" style="padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px;">
            <div class="docs-search-wrap" style="position: relative; max-width: 600px;">
              <span class="docs-search-icon" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.6;">\u{1F50D}</span>
              <input type="text" id="manual-search-input" class="docs-search-input" placeholder="Komut veya a\xE7\u0131klama ara... (\xF6rn: MOV, ADD, CMP, LOOP, PUSH, INT, DUP)" style="width: 100%; padding: 8px 36px 8px 34px; border: 1px solid var(--border-dark); border-radius: 6px; font-size: 13px;" />
              <button id="manual-search-clear" class="docs-search-clear" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 14px; cursor: pointer; display: none;" title="Temizle">\u2715</button>
            </div>
            <div class="docs-categories-wrap" id="manual-categories-wrap" style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${CATEGORIES.map((cat) => `
                <button class="docs-cat-btn ${cat.id === this.activeCategory ? "active" : ""}" data-cat="${cat.id}">
                  ${cat.label}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Master-Detail Grid -->
          <div class="docs-master-detail">
            <!-- Left List Panel -->
            <div class="docs-list-panel" id="manual-list-panel"></div>

            <!-- Right Detail Panel -->
            <div class="docs-detail-panel" id="manual-detail-panel"></div>
          </div>
        </div>

        <!-- Section 2: Addressing Modes -->
        <div class="manual-section-content" id="section-addressing" style="${this.activeSection === "addressing" ? "display: block;" : "display: none;"} padding: 24px; max-width: 1200px; margin: 0 auto;">
          <div id="manual-addressing-container"></div>
        </div>

        <!-- Section 3: Architecture -->
        <div class="manual-section-content" id="section-architecture" style="${this.activeSection === "architecture" ? "display: block;" : "display: none;"} padding: 24px; max-width: 1200px; margin: 0 auto;">
          <div id="manual-architecture-container"></div>
        </div>

        <!-- Section 4: Flags & Jump Matrix -->
        <div class="manual-section-content" id="section-flags" style="${this.activeSection === "flags" ? "display: block;" : "display: none;"} padding: 24px; max-width: 1200px; margin: 0 auto;">
          <div id="manual-flags-container"></div>
        </div>
      </div>
    `;
    this.bindEvents();
    this.renderList();
    this.renderDetail();
    this.renderAddressingModes();
    this.renderArchitecture();
    this.renderFlags();
  }
  bindEvents() {
    const backBtn = this.container.querySelector("#btn-back-editor");
    backBtn?.addEventListener("click", () => {
      this.callbacks.onReturnToEditor();
    });
    const sectionBtns = this.container.querySelectorAll(".btn-sec-nav-pill");
    sectionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const sec = btn.getAttribute("data-section");
        if (sec) {
          this.activeSection = sec;
          sectionBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const allSecs = this.container.querySelectorAll(".manual-section-content");
          allSecs.forEach((s) => s.style.display = "none");
          const target = this.container.querySelector(`#section-${sec}`);
          if (target) target.style.display = "block";
          const bc = this.container.querySelector("#ref-bc-active");
          if (bc) {
            bc.textContent = sec === "instructions" ? "\u{1F4D6} 8086 Komut Manueli" : sec === "addressing" ? "\u{1F3AF} 7 Adresleme Modu" : sec === "architecture" ? "\u{1F4D0} 8086 Mimarisi" : "\u{1F3F3}\uFE0F FLAGS & Atlama";
          }
        }
      });
    });
    const catWrap = this.container.querySelector("#manual-categories-wrap");
    catWrap?.addEventListener("click", (e) => {
      const btn = e.target.closest(".docs-cat-btn");
      if (!btn) return;
      this.container.querySelectorAll(".docs-cat-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      this.activeCategory = btn.getAttribute("data-cat") || "all";
      this.renderList();
    });
    const searchInput = this.container.querySelector("#manual-search-input");
    const clearBtn = this.container.querySelector("#manual-search-clear");
    if (searchInput && clearBtn) {
      searchInput.addEventListener("input", () => {
        this.searchQuery = searchInput.value.trim().toLowerCase();
        clearBtn.style.display = this.searchQuery ? "block" : "none";
        this.renderList();
      });
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.searchQuery = "";
        clearBtn.style.display = "none";
        this.renderList();
        searchInput.focus();
      });
    }
  }
  getFilteredInstructions() {
    return INSTRUCTIONS.filter((inst) => {
      if (this.activeCategory !== "all" && inst.category !== this.activeCategory) {
        return false;
      }
      if (this.searchQuery) {
        const inOpcode = inst.opcode.toLowerCase().includes(this.searchQuery);
        const inName = inst.name.toLowerCase().includes(this.searchQuery);
        const inSummary = inst.summary.toLowerCase().includes(this.searchQuery);
        const inVariations = inst.variations.some(
          (v) => v.syntax.toLowerCase().includes(this.searchQuery) || v.description.toLowerCase().includes(this.searchQuery) || v.example.toLowerCase().includes(this.searchQuery) || v.addressingMode && v.addressingMode.toLowerCase().includes(this.searchQuery)
        );
        return inOpcode || inName || inSummary || inVariations;
      }
      return true;
    });
  }
  renderList() {
    const listPanel = this.container.querySelector("#manual-list-panel");
    if (!listPanel) return;
    const items = this.getFilteredInstructions();
    if (items.length === 0) {
      listPanel.innerHTML = `
        <div class="docs-empty-list" style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
          <span style="font-size: 28px;">\u{1F50D}</span>
          <p style="margin-top: 8px;">E\u015Fle\u015Fen komut bulunamad\u0131.</p>
        </div>
      `;
      return;
    }
    if (!items.some((i) => i.opcode === this.selectedOpcode)) {
      this.selectedOpcode = items[0].opcode;
      this.renderDetail();
    }
    listPanel.innerHTML = items.map((inst) => {
      const isSelected = inst.opcode === this.selectedOpcode;
      return `
        <div class="docs-list-item ${isSelected ? "active" : ""}" data-opcode="${inst.opcode}">
          <div class="docs-item-header">
            <span class="docs-item-opcode">${inst.opcode}</span>
            <span class="docs-item-cat-badge">${this.getCategoryLabel(inst.category)}</span>
          </div>
          <div class="docs-item-name">${inst.name}</div>
          <div class="docs-item-summary">${inst.summary}</div>
        </div>
      `;
    }).join("");
    listPanel.querySelectorAll(".docs-list-item").forEach((el) => {
      el.addEventListener("click", () => {
        const opcode = el.getAttribute("data-opcode");
        if (opcode) {
          this.selectedOpcode = opcode;
          listPanel.querySelectorAll(".docs-list-item").forEach((i) => i.classList.remove("active"));
          el.classList.add("active");
          this.renderDetail();
        }
      });
    });
  }
  renderDetail() {
    const detailPanel = this.container.querySelector("#manual-detail-panel");
    if (!detailPanel) return;
    const inst = INSTRUCTIONS.find((i) => i.opcode === this.selectedOpcode);
    if (!inst) {
      detailPanel.innerHTML = `<div class="docs-no-selection" style="padding: 40px; text-align: center; color: var(--text-muted);">L\xFCtfen soldaki listeden bir komut se\xE7in.</div>`;
      return;
    }
    detailPanel.innerHTML = `
      <div class="docs-detail-content">
        <!-- Main Header -->
        <div class="docs-detail-header">
          <div class="docs-detail-title-group">
            <h3 class="docs-detail-opcode">${inst.opcode}</h3>
            <span class="docs-detail-fullname">${inst.name}</span>
          </div>
          <span class="docs-cat-badge-large">${this.getCategoryLabel(inst.category)}</span>
        </div>

        <!-- Description Box -->
        <div class="docs-info-box">
          <div class="docs-info-label">A\xE7\u0131klama:</div>
          <div class="docs-info-val">${inst.summary}</div>
        </div>

        <!-- Flags Box -->
        <div class="docs-flags-box">
          <span class="docs-flags-label">\u{1F3F3}\uFE0F Etkilenen Bayraklar:</span>
          <span class="docs-flags-val">${inst.flags}</span>
        </div>

        <!-- Special 8086 Rules Box if present -->
        ${inst.rules ? `
          <div class="docs-rules-box">
            <span class="docs-rules-icon">\u26A0\uFE0F</span>
            <div class="docs-rules-text"><strong>8086 Donan\u0131m Kural\u0131 & Not:</strong><br/>${this.escapeHtml(inst.rules).replace(/\n/g, "<br/>")}</div>
          </div>
        ` : ""}

        <!-- Variations Section -->
        <div class="docs-variations-section">
          <h4 class="docs-variations-title">Kullan\u0131m Varyasyonlar\u0131 (${inst.variations.length})</h4>
          <div class="docs-variations-grid">
            ${inst.variations.map((v, idx) => `
              <div class="docs-var-card">
                <div class="docs-var-header">
                  <div class="docs-var-syntax-wrap">
                    <span class="docs-var-syntax">${this.escapeHtml(v.syntax)}</span>
                    ${v.addressingMode ? `<span class="docs-addressing-mode-badge" title="Adresleme Modu">\u{1F3AF} ${this.escapeHtml(v.addressingMode)}</span>` : ""}
                  </div>
                  <span class="docs-var-badge">Varyasyon #${idx + 1}</span>
                </div>
                <p class="docs-var-desc">${v.description}</p>
                <div class="docs-example-box">
                  <div class="docs-example-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>\xD6rnek Kullan\u0131m:</span>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-copy-code" data-code="${this.escapeHtml(v.example)}" title="Kodu Kopyala" style="font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-dark); background: #ffffff; cursor: pointer;">\u{1F4CB} Kopyala</button>
                      ${this.callbacks.onInsertCodeToEditor ? `
                        <button class="btn-use-in-editor" data-opcode="${inst.opcode}" data-code="${this.escapeHtml(v.example)}" title="Edit\xF6re G\xF6nder ve \xC7al\u0131\u015Ft\u0131r" style="font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid #93c5fd; background: #eff6ff; color: #1d4ed8; font-weight: 600; cursor: pointer;">\u{1F4DD} Edit\xF6re Aktar</button>
                      ` : ""}
                    </div>
                  </div>
                  <pre class="docs-example-code"><code>${this.escapeHtml(v.example)}</code></pre>
                </div>
                ${v.note ? `<div class="docs-var-note">\u{1F4A1} <em>${this.escapeHtml(v.note)}</em></div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
    detailPanel.querySelectorAll(".btn-copy-code").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const code = btn.getAttribute("data-code");
        if (code) {
          navigator.clipboard.writeText(code);
          const orig = btn.textContent;
          btn.textContent = "\u2713 Kopyaland\u0131!";
          setTimeout(() => {
            btn.textContent = orig;
          }, 1500);
        }
      });
    });
    detailPanel.querySelectorAll(".btn-use-in-editor").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const opcode = btn.getAttribute("data-opcode") || "example";
        const code = btn.getAttribute("data-code");
        if (code && this.callbacks.onInsertCodeToEditor) {
          const formattedCode = `ORG 100H

; \xD6rnek: ${opcode} Komutu Kullan\u0131m\u0131
${code}

HLT
`;
          this.callbacks.onInsertCodeToEditor(`${opcode.toLowerCase()}_example.asm`, formattedCode);
        }
      });
    });
  }
  renderAddressingModes() {
    const container = this.container.querySelector("#manual-addressing-container");
    if (!container) return;
    container.innerHTML = `
      <div class="theory-article">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">\u{1F3AF} 8086 Mikroi\u015Flemcisinde 7 Temel Veri Adresleme Modu</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          8086 mimarisinde bir komutun kaynak veya hedef veriye nas\u0131l ula\u015Faca\u011F\u0131n\u0131 belirleyen 7 standart mod:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
          ${ADDRESSING_MODES.map((m, idx) => `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 15px; color: #1e293b;">${idx + 1}. ${this.escapeHtml(m.modeName)}</span>
                <span style="font-size: 11px; background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${this.escapeHtml(m.category)}</span>
              </div>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">${this.escapeHtml(m.summary)}</p>
              ${m.formula ? `<div style="font-family: monospace; font-size: 12px; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px;"><strong>Form\xFCl:</strong> ${this.escapeHtml(m.formula)}</div>` : ""}
              <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 4px;"><strong>\u0130zin Verilen Yazma\xE7lar:</strong> ${this.escapeHtml(m.registersAllowed)}</div>
              <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 8px;"><strong>Varsay\u0131lan Segment:</strong> ${this.escapeHtml(m.defaultSegment)}</div>
              <div style="background: #1e293b; color: #f8fafc; font-family: monospace; font-size: 12px; padding: 8px 10px; border-radius: 4px; margin-bottom: 6px;">${this.escapeHtml(m.example)}</div>
              <small style="color: var(--text-muted); font-size: 11px;">\u{1F4A1} ${this.escapeHtml(m.notes)}</small>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  renderArchitecture() {
    const container = this.container.querySelector("#manual-architecture-container");
    if (!container) return;
    container.innerHTML = `
      <div class="theory-article">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">\u{1F4D0} ${this.escapeHtml(ARCHITECTURE_GUIDE.title)}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px;">
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
            <h4 style="font-weight: 700; color: #2563eb; margin-bottom: 8px;">\u{1F68C} Veri Yolu Mimarisi</h4>
            <ul style="font-size: 13px; list-style: disc; padding-left: 20px; line-height: 1.6;">
              <li><strong>Adres Yolu (Address Bus):</strong> ${ARCHITECTURE_GUIDE.busSystem.addressBus}</li>
              <li><strong>Veri Yolu (Data Bus):</strong> ${ARCHITECTURE_GUIDE.busSystem.dataBus}</li>
              <li><strong>Kontrol Yolu (Control Bus):</strong> ${ARCHITECTURE_GUIDE.busSystem.controlBus}</li>
            </ul>
          </div>

          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
            <h4 style="font-weight: 700; color: #16a34a; margin-bottom: 8px;">\u{1F9E0} 20-Bit Fiziksel Adresleme</h4>
            <p style="font-size: 13px; line-height: 1.6;">
              8086, 16-bit i\u015Flemci olmas\u0131na kar\u015F\u0131n 1 MB RAM'e ula\u015Fabilmek i\xE7in <strong>Segment:Offset</strong> mimarisini kullan\u0131r:
            </p>
            <div style="background: #f8fafc; border: 1px solid var(--border-dark); padding: 8px 12px; font-family: monospace; font-size: 13px; border-radius: 4px; margin-top: 8px; font-weight: 700;">
              Fiziksel Adres = (Segment \xD7 16) + Offset<br/>
              \xD6rn: CS:IP = 1000h:0100h \u2192 (1000h \xD7 10h) + 0100h = 10100h
            </div>
          </div>
        </div>
      </div>
    `;
  }
  renderFlags() {
    const container = this.container.querySelector("#manual-flags-container");
    if (!container) return;
    container.innerHTML = `
      <div class="theory-article">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">\u{1F3F3}\uFE0F ${this.escapeHtml(FLAGS_GUIDE.title)}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">
          8086 Bayrak Yazmac\u0131 (FLAGS Register) 16-bit geni\u015Fli\u011Findedir ve 9 aktif bayrak biti i\xE7erir (6 Durum Bayra\u011F\u0131, 3 Kontrol Bayra\u011F\u0131):
        </p>

        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 16px 0 8px 0;">\u{1F4CA} Durum Bayraklar\u0131 (Status Flags - Aritmetik/Mant\u0131k Sonu\xE7lar\u0131)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 20px;">
          ${FLAGS_GUIDE.statusFlags.map((f) => `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 15px; color: #1e293b;">${this.escapeHtml(f.flag)}</strong>
                <span style="font-size: 11px; font-weight: 600; background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 4px;">Bit ${f.bit}</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">${this.escapeHtml(f.desc)}</p>
            </div>
          `).join("")}
        </div>

        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 16px 0 8px 0;">\u2699\uFE0F Kontrol Bayraklar\u0131 (Control Flags - \u0130\u015Flemci Davran\u0131\u015F\u0131)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 20px;">
          ${FLAGS_GUIDE.controlFlags.map((f) => `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 15px; color: #1e293b;">${this.escapeHtml(f.flag)}</strong>
                <span style="font-size: 11px; font-weight: 600; background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px;">Bit ${f.bit}</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">${this.escapeHtml(f.desc)}</p>
            </div>
          `).join("")}
        </div>

        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 16px 0 8px 0;">\u{1F4A1} 8086 Bayrak Alt\u0131n Kurallar\u0131</h3>
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 14px;">
          <ul style="font-size: 13px; list-style: disc; padding-left: 20px; line-height: 1.6; color: #92400e;">
            ${FLAGS_GUIDE.goldenRules.map((rule) => `<li>${this.escapeHtml(rule)}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }
  getCategoryLabel(catId) {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? cat.label : catId;
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
};

// src/ui/graph/knowledgeData.ts
var SUB_TRAITS = [
  // 1. Stack Operations
  {
    id: "sub-stack-ops",
    label: "\u{1F4DA} Y\u0131\u011F\u0131n \u0130\u015Flemleri",
    shortDesc: "SS ve SP ile y\u0131\u011F\u0131na veri iten/\xE7eken ve alt yordam y\xF6neten LIFO komutlar\u0131.",
    flagImpact: "none",
    mechanism: "stack_op",
    hardwareLayer: "memory_stack",
    category: "data",
    color: "#f59e0b",
    anchorOffset: { x: -320, y: -260 },
    instructions: ["PUSH", "POP", "PUSHF", "POPF", "CALL", "RET", "RETN", "RETF"]
  },
  // 2. Effective Address Loaders
  {
    id: "sub-addr-loaders",
    label: "\u{1F3AF} Adres Y\xFCkleyiciler",
    shortDesc: "Bellek de\u011Ferini de\u011Fil, do\u011Frudan efektif ofset adresini veya segment pointer\u0131n\u0131 y\xFCkleyen komutlar.",
    flagImpact: "none",
    mechanism: "memory_addressing",
    hardwareLayer: "biu",
    category: "data",
    color: "#10b981",
    anchorOffset: { x: -360, y: -120 },
    instructions: ["LEA", "LDS", "LES", "XLAT", "XLATB"]
  },
  // 3. Raw Data Movement & Exchange
  {
    id: "sub-raw-data",
    label: "\u{1F4E6} Veri Ta\u015F\u0131ma & Takas",
    shortDesc: "Yazma\xE7, bellek ve sabitler aras\u0131 bayraklar\u0131 bozmadan de\u011Fer kopyalayan ve takas eden \xE7ekirdek komutlar.",
    flagImpact: "none",
    mechanism: "data_transfer",
    hardwareLayer: "eu",
    category: "data",
    color: "#3b82f6",
    anchorOffset: { x: -220, y: -220 },
    instructions: ["MOV", "XCHG"]
  },
  // 4. Additive Arithmetic
  {
    id: "sub-arith-add",
    label: "\u2795 Toplama & Art\u0131rma",
    shortDesc: "\u0130ki say\u0131y\u0131 toplayan, eldeyi (CF) ekleyen veya sayac\u0131 1 art\u0131ran komutlar.",
    flagImpact: "all_arithmetic",
    mechanism: "arithmetic",
    hardwareLayer: "alu",
    category: "arithmetic",
    color: "#ef4444",
    anchorOffset: { x: 240, y: -260 },
    instructions: ["ADD", "ADC", "INC"]
  },
  // 5. Subtractive & Compare
  {
    id: "sub-arith-sub",
    label: "\u2796 \xC7\u0131karma & Kar\u015F\u0131la\u015Ft\u0131rma",
    shortDesc: "Fark hesaplayan, bor\xE7 (CF) alan veya sonucu kaydetmeden sadece bayrak kuran (CMP) komutlar.",
    flagImpact: "all_arithmetic",
    mechanism: "arithmetic",
    hardwareLayer: "alu",
    category: "arithmetic",
    color: "#f43f5e",
    anchorOffset: { x: 340, y: -160 },
    instructions: ["SUB", "SBB", "DEC", "NEG", "CMP"]
  },
  // 6. Multiplication & Division
  {
    id: "sub-arith-muldiv",
    label: "\u2716\uFE0F \xC7arpma & B\xF6lme",
    shortDesc: "AX/DX yazma\xE7lar\u0131n\u0131 kullanan, i\u015Faretli ve i\u015Faretsiz \xE7arpma ve b\xF6lme komutlar\u0131.",
    flagImpact: "undefined_flags",
    mechanism: "arithmetic",
    hardwareLayer: "alu",
    category: "arithmetic",
    color: "#e11d48",
    anchorOffset: { x: 300, y: -60 },
    instructions: ["MUL", "IMUL", "DIV", "IDIV"]
  },
  // 7. Zero Flag Branching
  {
    id: "sub-branch-zero",
    label: "\u{1F3AF} ZF E\u015Fitlik Atlama",
    shortDesc: "Sonu\xE7 s\u0131f\u0131rsa veya kar\u015F\u0131la\u015Ft\u0131rma e\u015Fitse (ZF=1/0) dallanan ko\u015Fullu s\u0131\xE7ramalar.",
    flagImpact: "none",
    mechanism: "control_jump",
    hardwareLayer: "eu",
    category: "control",
    color: "#06b6d4",
    anchorOffset: { x: -140, y: 180 },
    instructions: ["JZ", "JE", "JNZ", "JNE"]
  },
  // 8. Carry Flag Branching
  {
    id: "sub-branch-carry",
    label: "\u{1F6A9} CF Elde Atlama",
    shortDesc: "\u0130\u015Faretsiz say\u0131larda elde veya bor\xE7 durumuna (CF=1/0) g\xF6re dallanan s\u0131\xE7ramalar.",
    flagImpact: "none",
    mechanism: "control_jump",
    hardwareLayer: "eu",
    category: "control",
    color: "#0ea5e9",
    anchorOffset: { x: -40, y: 220 },
    instructions: ["JC", "JB", "JNC", "JAE", "JA", "JBE"]
  },
  // 9. Signed Branching
  {
    id: "sub-branch-signed",
    label: "\u2696\uFE0F \u0130\u015Faretli Atlama",
    shortDesc: "\u0130\u015Faretli kar\u015F\u0131la\u015Ft\u0131rma sonu\xE7lar\u0131na (SF ve OF bayraklar\u0131n\u0131n ili\u015Fkisine) g\xF6re dallanmalar.",
    flagImpact: "none",
    mechanism: "control_jump",
    hardwareLayer: "eu",
    category: "control",
    color: "#38bdf8",
    anchorOffset: { x: 60, y: 220 },
    instructions: ["JG", "JL", "JGE", "JLE"]
  },
  // 10. Loop & Counter Branching
  {
    id: "sub-branch-loop",
    label: "\u{1F501} D\xF6ng\xFC Saya\xE7lar\u0131",
    shortDesc: "CX yazmac\u0131n\u0131 otomatik azaltarak s\u0131f\u0131r olana kadar geri d\xF6nen donan\u0131msal d\xF6ng\xFCler.",
    flagImpact: "none",
    mechanism: "control_jump",
    hardwareLayer: "eu",
    category: "control",
    color: "#67e8f9",
    anchorOffset: { x: -180, y: 260 },
    instructions: ["LOOP", "LOOPE", "LOOPNE", "JCXZ"]
  },
  // 11. Unconditional Branching
  {
    id: "sub-branch-uncond",
    label: "\u{1F500} Ko\u015Fulsuz Dallanma",
    shortDesc: "Bayrak durumuna bak\u0131lmaks\u0131z\u0131n IP g\xF6stergesini do\u011Frudan yeni adrese y\xF6nlendiren komutlar.",
    flagImpact: "none",
    mechanism: "control_jump",
    hardwareLayer: "eu",
    category: "control",
    color: "#22d3ee",
    anchorOffset: { x: -280, y: 160 },
    instructions: ["JMP", "CALL", "RET", "RETN", "RETF"]
  },
  // 12. Bitwise Logic Masks
  {
    id: "sub-logic-masks",
    label: "\u{1F532} Bit Maskeleme",
    shortDesc: "AND, OR, XOR, TEST ve NOT ile bitleri maskeleyen veya tersleyen mant\u0131k komutlar\u0131.",
    flagImpact: "logic",
    mechanism: "logic_bitwise",
    hardwareLayer: "alu",
    category: "logical",
    color: "#8b5cf6",
    anchorOffset: { x: 180, y: 160 },
    instructions: ["AND", "OR", "XOR", "NOT", "TEST"]
  },
  // 13. Linear Bit Shifts
  {
    id: "sub-shift-linear",
    label: "\u{1F504} Do\u011Frusal Kayd\u0131rma",
    shortDesc: "Bitleri sa\u011Fa/sola \xF6teleyen ve at\u0131lan biti CF bayra\u011F\u0131na aktaran h\u0131zl\u0131 \xE7arpma/b\xF6lme komutlar\u0131.",
    flagImpact: "shift_rotate",
    mechanism: "logic_bitwise",
    hardwareLayer: "alu",
    category: "logical",
    color: "#a855f7",
    anchorOffset: { x: 260, y: 240 },
    instructions: ["SHL", "SAL", "SHR", "SAR"]
  },
  // 14. Circular Bit Rotations
  {
    id: "sub-shift-rotate",
    label: "\u{1F501} Dairesel D\xF6nd\xFCrme",
    shortDesc: "Bitleri u\xE7tan uca veya CF bayra\u011F\u0131n\u0131 da halkaya dahil ederek d\xF6nd\xFCren komutlar.",
    flagImpact: "shift_rotate",
    mechanism: "logic_bitwise",
    hardwareLayer: "alu",
    category: "logical",
    color: "#c084fc",
    anchorOffset: { x: 340, y: 180 },
    instructions: ["ROL", "ROR", "RCL", "RCR"]
  },
  // 15. Flag Modifiers & Flippers
  {
    id: "sub-flag-control",
    label: "\u{1F6A9} Bayrak Kurucular",
    shortDesc: "Do\u011Frudan elde (CF), y\xF6n (DF) veya kesme (IF) bayra\u011F\u0131n\u0131 1 veya 0 yapan 1 baytl\u0131k komutlar.",
    flagImpact: "flag_control",
    mechanism: "processor_control",
    hardwareLayer: "eu",
    category: "flags",
    color: "#ec4899",
    anchorOffset: { x: 0, y: -340 },
    instructions: ["CLC", "STC", "CMC", "CLD", "STD", "CLI", "STI"]
  },
  // 16. Flag Stack & Transfer
  {
    id: "sub-flag-transfer",
    label: "\u{1F4E5} Bayrak Aktar\u0131m\u0131",
    shortDesc: "T\xFCm bayrak yazmac\u0131n\u0131 y\u0131\u011F\u0131na kaydeden veya AH yazmac\u0131yla transfer eden k\xF6pr\xFC komutlar.",
    flagImpact: "flag_transfer",
    mechanism: "stack_op",
    hardwareLayer: "memory_stack",
    category: "flags",
    color: "#6366f1",
    anchorOffset: { x: -140, y: -340 },
    instructions: ["LAHF", "SAHF", "PUSHF", "POPF"]
  },
  // 17. Block String Operations
  {
    id: "sub-string-ops",
    label: "\u{1F9F5} Dizi (String) Bloklar\u0131",
    shortDesc: "SI/DI ve DF bayra\u011F\u0131n\u0131 kullanarak ard\u0131\u015F\u0131k bellek bloklar\u0131n\u0131 otomatik kopyalayan/tarayan komutlar.",
    flagImpact: "none",
    mechanism: "string_op",
    hardwareLayer: "biu",
    category: "string",
    color: "#14b8a6",
    anchorOffset: { x: -40, y: 60 },
    instructions: ["MOVSB", "MOVSW", "LODSB", "LODSW", "STOSB", "STOSW", "CMPSB", "CMPSW", "SCASB", "SCASW", "REP", "REPE", "REPNE"]
  },
  // 18. Hardware Port I/O
  {
    id: "sub-port-io",
    label: "\u{1F50C} I/O Portlar\u0131 & Kesmeler",
    shortDesc: "Harici donan\u0131m portlar\u0131na (IN/OUT) eri\u015Fen ve yaz\u0131l\u0131msal kesmeler (INT) tetikleyen komutlar.",
    flagImpact: "none",
    mechanism: "io_port",
    hardwareLayer: "io_interrupt",
    category: "data",
    color: "#f43f5e",
    anchorOffset: { x: 120, y: -60 },
    instructions: ["IN", "OUT", "INT", "INTO", "IRET"]
  },
  // 19. BCD & Decimal Adjusters
  {
    id: "sub-bcd-adjust",
    label: "\u{1F522} BCD / Onluk D\xFCzeltme",
    shortDesc: "\u0130kili aritmetik sonu\xE7lar\u0131n\u0131 paketli veya paketsiz onluk basamaklara (BCD) d\xF6n\xFC\u015Ft\xFCren d\xFCzelticiler.",
    flagImpact: "all_arithmetic",
    mechanism: "bcd_ascii",
    hardwareLayer: "alu",
    category: "bcd",
    color: "#fbbf24",
    anchorOffset: { x: 380, y: -20 },
    instructions: ["DAA", "DAS", "AAA", "AAS", "AAM", "AAD"]
  },
  // 20. CPU State & Synchronization
  {
    id: "sub-cpu-state",
    label: "\u2699\uFE0F \u0130\u015Flemci Kontrol & Kilit",
    shortDesc: "\u0130\u015Flemciyi durduran (HLT), bus kilitleyen (LOCK) veya bo\u015F d\xF6ng\xFC atan (NOP) sistem komutlar\u0131.",
    flagImpact: "none",
    mechanism: "processor_control",
    hardwareLayer: "eu",
    category: "control",
    color: "#64748b",
    anchorOffset: { x: 0, y: 0 },
    instructions: ["HLT", "NOP", "WAIT", "LOCK", "ESC"]
  }
];
function determineFlagImpact(opcode, flagsStr) {
  const op = opcode.toUpperCase().trim();
  const f = flagsStr.toLowerCase();
  if (["CLC", "STC", "CMC", "CLD", "STD", "CLI", "STI"].includes(op)) {
    return "flag_control";
  }
  if (["LAHF", "SAHF", "PUSHF", "POPF"].includes(op)) {
    return "flag_transfer";
  }
  if (["INC", "DEC"].includes(op)) {
    return "no_cf";
  }
  if (["AND", "OR", "XOR", "TEST", "NOT"].includes(op)) {
    return op === "NOT" ? "none" : "logic";
  }
  if (["SHL", "SHR", "SAL", "SAR", "ROL", "ROR", "RCL", "RCR"].includes(op)) {
    return "shift_rotate";
  }
  if (["MUL", "IMUL", "DIV", "IDIV", "AAM", "AAD"].includes(op)) {
    return "undefined_flags";
  }
  if (f.includes("etkilemez") || f.includes("hi\xE7bir")) {
    return "none";
  }
  if (f.includes("cf") && f.includes("zf") && f.includes("sf") && f.includes("of")) {
    return "all_arithmetic";
  }
  return "none";
}
function determineMechanism(opcode, category) {
  const op = opcode.toUpperCase().trim();
  if (["PUSH", "POP", "PUSHF", "POPF", "CALL", "RET", "RETN", "RETF"].includes(op)) {
    return "stack_op";
  }
  if (["LEA", "LDS", "LES", "XLAT", "XLATB"].includes(op)) {
    return "memory_addressing";
  }
  if (["IN", "OUT"].includes(op)) {
    return "io_port";
  }
  if (["INT", "INTO", "IRET"].includes(op)) {
    return "io_port";
  }
  if (["MOVS", "MOVSB", "MOVSW", "CMPS", "CMPSB", "CMPSW", "LODS", "LODSB", "LODSW", "STOS", "STOSB", "STOSW", "SCAS", "SCASB", "SCASW", "REP", "REPE", "REPNE", "REPZ", "REPNZ"].includes(op)) {
    return "string_op";
  }
  if (["DAA", "DAS", "AAA", "AAS", "AAM", "AAD", "CBW", "CWD"].includes(op)) {
    return "bcd_ascii";
  }
  if (["HLT", "WAIT", "ESC", "LOCK", "NOP", "CLC", "STC", "CMC", "CLD", "STD", "CLI", "STI"].includes(op)) {
    return "processor_control";
  }
  if (category === "control" || op.startsWith("J") || op.startsWith("LOOP")) {
    return "control_jump";
  }
  if (category === "arithmetic") {
    return "arithmetic";
  }
  if (category === "logical") {
    return "logic_bitwise";
  }
  return "data_transfer";
}
function determineHardwareLayer(opcode, category) {
  const mech = determineMechanism(opcode, category);
  if (mech === "stack_op" || mech === "memory_addressing") return "memory_stack";
  if (mech === "io_port") return "io_interrupt";
  if (mech === "arithmetic" || mech === "logic_bitwise" || mech === "bcd_ascii") return "alu";
  if (category === "data" || mech === "string_op") return "biu";
  return "eu";
}
var GRAPH_COLORS = {
  flagNone: "#10b981",
  // Emerald Green
  flagAll: "#ef4444",
  // Red
  flagNoCf: "#f59e0b",
  // Amber
  flagLogic: "#8b5cf6",
  // Violet
  flagShift: "#06b6d4",
  // Cyan
  flagControl: "#ec4899",
  // Pink
  flagTransfer: "#6366f1",
  // Indigo
  flagUndefined: "#64748b",
  // Slate
  hubNode: "#3b82f6",
  subHubNode: "#f59e0b",
  registerNode: "#f97316",
  hardwareNode: "#14b8a6",
  linkDefault: "rgba(148, 163, 184, 0.22)",
  linkHighlight: "#38bdf8"
};
function build8086KnowledgeGraph() {
  const nodes = [];
  const edges = [];
  const instructionNodeMap = /* @__PURE__ */ new Map();
  const flagHubs = [
    {
      id: "hub-flag-none",
      label: "\u{1F6AB} Bayraklar\u0131 Etkilemez",
      flagType: "none",
      desc: "\u0130\u015Flemci durum bayraklar\u0131n\u0131 (CF, ZF, SF, OF, AF, PF) de\u011Fi\u015Ftirmeyen, g\xFCvenle veri aktaran veya atlayan komutlar.",
      color: GRAPH_COLORS.flagNone,
      x: -280,
      y: -180
    },
    {
      id: "hub-flag-all",
      label: "\u26A1 T\xFCm Aritmetik Bayraklar",
      flagType: "all_arithmetic",
      desc: "\u0130\u015Flem sonucuna g\xF6re t\xFCm durum bayraklar\u0131n\u0131 (CF, ZF, SF, OF, AF, PF) eksiksiz g\xFCncelleyen temel matematiksel komutlar.",
      color: GRAPH_COLORS.flagAll,
      x: 280,
      y: -180
    },
    {
      id: "hub-flag-no-cf",
      label: "\u26A0\uFE0F CF Hari\xE7 G\xFCncellenenler",
      flagType: "no_cf",
      desc: "D\xF6ng\xFC indekslerini bozmamak i\xE7in Carry (CF) bayra\u011F\u0131na dokunmayan, di\u011Fer bayraklar\u0131 g\xFCncelleyen komutlar (INC, DEC).",
      color: GRAPH_COLORS.flagNoCf,
      x: 260,
      y: 120
    },
    {
      id: "hub-flag-logic",
      label: "\u{1F9E9} Mant\u0131ksal \u0130\u015Flemler (CF=0, OF=0)",
      flagType: "logic",
      desc: "Mant\u0131ksal bit i\u015Flemleri. CF ve OF bayraklar\u0131n\u0131 daima s\u0131f\u0131rlar; ZF, SF, PF bayraklar\u0131n\u0131 sonuca g\xF6re ayarlar.",
      color: GRAPH_COLORS.flagLogic,
      x: 0,
      y: 280
    },
    {
      id: "hub-flag-shift",
      label: "\u{1F504} Kayd\u0131rma & D\xF6nd\xFCrme",
      flagType: "shift_rotate",
      desc: "Bitleri sa\u011Fa/sola kayd\u0131ran ve son at\u0131lan biti Carry (CF) bayra\u011F\u0131nda saklayan kayd\u0131rma ve rotasyon komutlar\u0131.",
      color: GRAPH_COLORS.flagShift,
      x: -280,
      y: 160
    },
    {
      id: "hub-flag-control",
      label: "\u{1F6A9} Bayrak Kurma / Temizleme",
      flagType: "flag_control",
      desc: "Do\u011Frudan i\u015Flemci bayraklar\u0131n\u0131 de\u011Fi\u015Ftiren kontrol komutlar\u0131 (CLC, STC, CMC, CLD, STD, CLI, STI).",
      color: GRAPH_COLORS.flagControl,
      x: -80,
      y: -320
    },
    {
      id: "hub-flag-transfer",
      label: "\u{1F4E5} Bayrak Aktar\u0131m\u0131 & Y\u0131\u011F\u0131n",
      flagType: "flag_transfer",
      desc: "T\xFCm bayrak yazmac\u0131n\u0131 y\u0131\u011F\u0131na atan veya AH yazmac\u0131yla bayrak transferi yapan komutlar (LAHF, SAHF, PUSHF, POPF).",
      color: GRAPH_COLORS.flagTransfer,
      x: 100,
      y: -320
    }
  ];
  flagHubs.forEach((hub) => {
    nodes.push({
      id: hub.id,
      label: hub.label,
      kind: "flag_hub",
      category: "flags",
      flagImpact: hub.flagType,
      mechanism: "processor_control",
      hardwareLayer: "eu",
      summary: hub.desc,
      flagsText: hub.label,
      variationsCount: 0,
      color: hub.color,
      radius: 22,
      x: hub.x,
      y: hub.y,
      vx: 0,
      vy: 0
    });
  });
  SUB_TRAITS.forEach((st) => {
    nodes.push({
      id: st.id,
      label: st.label,
      kind: "sub_hub",
      category: st.category,
      flagImpact: st.flagImpact,
      mechanism: st.mechanism,
      hardwareLayer: st.hardwareLayer,
      summary: `${st.shortDesc} \u2014 ${st.instructions.length} ortak komut bu kav\u015Fakta toplan\u0131r.`,
      flagsText: `Alt K\xFCme: ${st.label}`,
      variationsCount: st.instructions.length,
      memberCount: st.instructions.length,
      color: st.color,
      radius: 17,
      x: st.anchorOffset.x,
      y: st.anchorOffset.y,
      vx: 0,
      vy: 0
    });
    let parentHubId = null;
    if (st.flagImpact === "none") parentHubId = "hub-flag-none";
    else if (st.flagImpact === "all_arithmetic") parentHubId = "hub-flag-all";
    else if (st.flagImpact === "no_cf") parentHubId = "hub-flag-no-cf";
    else if (st.flagImpact === "logic") parentHubId = "hub-flag-logic";
    else if (st.flagImpact === "shift_rotate") parentHubId = "hub-flag-shift";
    else if (st.flagImpact === "flag_control") parentHubId = "hub-flag-control";
    else if (st.flagImpact === "flag_transfer") parentHubId = "hub-flag-transfer";
    if (parentHubId) {
      edges.push({
        id: `tree-${st.id}-${parentHubId}`,
        source: st.id,
        target: parentHubId,
        relation: "has_flag_impact",
        label: "Alt Grup",
        strength: 0.5
      });
    }
  });
  let nodeIndex = 0;
  INSTRUCTIONS.forEach((inst) => {
    const subOpcodes = inst.opcode.includes("/") ? inst.opcode.split("/").map((s) => s.trim()).filter(Boolean) : [inst.opcode.trim()];
    const createdNodeIds = [];
    subOpcodes.forEach((op) => {
      const flagImpact = determineFlagImpact(op, inst.flags);
      const mech = determineMechanism(op, inst.category);
      const hw = determineHardwareLayer(op, inst.category);
      let color = GRAPH_COLORS.flagNone;
      if (flagImpact === "all_arithmetic") color = GRAPH_COLORS.flagAll;
      else if (flagImpact === "no_cf") color = GRAPH_COLORS.flagNoCf;
      else if (flagImpact === "logic") color = GRAPH_COLORS.flagLogic;
      else if (flagImpact === "shift_rotate") color = GRAPH_COLORS.flagShift;
      else if (flagImpact === "flag_control") color = GRAPH_COLORS.flagControl;
      else if (flagImpact === "flag_transfer") color = GRAPH_COLORS.flagTransfer;
      else if (flagImpact === "undefined_flags") color = GRAPH_COLORS.flagUndefined;
      const matchingSubTrait = SUB_TRAITS.find((st) => st.instructions.includes(op));
      let initX = (Math.random() - 0.5) * 600;
      let initY = (Math.random() - 0.5) * 500;
      if (matchingSubTrait) {
        initX = matchingSubTrait.anchorOffset.x + (Math.random() - 0.5) * 90;
        initY = matchingSubTrait.anchorOffset.y + (Math.random() - 0.5) * 90;
      }
      const radius = Math.min(15, Math.max(9, 8 + Math.round(inst.variations.length * 0.7)));
      nodeIndex++;
      const sample = inst.variations[0]?.example || (inst.variations[0] ? `${inst.variations[0].syntax}` : `${op} AX, BX`);
      const nodeId = `inst-${op.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      createdNodeIds.push(nodeId);
      const instructionNode = {
        id: nodeId,
        label: op,
        kind: "instruction",
        category: inst.category,
        flagImpact,
        mechanism: mech,
        hardwareLayer: hw,
        subTraitId: matchingSubTrait?.id,
        summary: `${inst.name} \u2014 ${inst.summary}`,
        flagsText: inst.flags,
        rules: inst.rules,
        variationsCount: inst.variations.length,
        sampleCode: sample,
        color,
        radius,
        x: initX,
        y: initY,
        vx: 0,
        vy: 0
      };
      nodes.push(instructionNode);
      instructionNodeMap.set(op, instructionNode);
      SUB_TRAITS.forEach((st) => {
        if (st.instructions.includes(op)) {
          edges.push({
            id: `edge-${nodeId}-${st.id}`,
            source: nodeId,
            target: st.id,
            relation: "shares_trait",
            label: st.label,
            strength: 0.55
          });
        }
      });
    });
    if (createdNodeIds.length > 1) {
      for (let i = 0; i < createdNodeIds.length - 1; i++) {
        edges.push({
          id: `sibling-${createdNodeIds[i]}-${createdNodeIds[i + 1]}`,
          source: createdNodeIds[i],
          target: createdNodeIds[i + 1],
          relation: "related_to",
          label: "E\u015Fde\u011Fer Varyant",
          strength: 0.75
        });
      }
    }
  });
  const bridgePairs = [
    ["CMP", "JZ", "Kar\u015F\u0131la\u015Ft\u0131r ve E\u015Fitse"],
    ["CMP", "JNZ", "Kar\u015F\u0131la\u015Ft\u0131r ve Farkl\u0131ysa"],
    ["CMP", "JC", "Kar\u015F\u0131la\u015Ft\u0131r ve Elde Varsa"],
    ["TEST", "JZ", "Bit Testi ve S\u0131f\u0131rsa"],
    ["MOV", "LEA", "De\u011Fer vs Efektif Adres"],
    ["PUSH", "POP", "LIFO Y\u0131\u011F\u0131n \u0130kilisi"],
    ["CALL", "RET", "Yordam \xC7a\u011F\u0131r/D\xF6n"],
    ["IN", "OUT", "I/O Port Giri\u015F/\xC7\u0131k\u0131\u015F"],
    ["MOVSB", "REP", "Tekrarl\u0131 Blok Ta\u015F\u0131ma"],
    ["ADD", "ADC", "Eldeli Toplama"],
    ["SUB", "SBB", "Bor\xE7lu \xC7\u0131karma"]
  ];
  bridgePairs.forEach(([op1, op2, label]) => {
    const n1 = instructionNodeMap.get(op1);
    const n2 = instructionNodeMap.get(op2);
    if (n1 && n2) {
      edges.push({
        id: `bridge-${n1.id}-${n2.id}`,
        source: n1.id,
        target: n2.id,
        relation: "related_to",
        label,
        strength: 0.65
      });
    }
  });
  return { nodes, edges };
}
function getClusterDefinitions(mode) {
  switch (mode) {
    case "subclusters":
      return SUB_TRAITS.map((st) => ({
        id: st.id,
        label: st.label,
        color: st.color,
        description: st.shortDesc,
        anchorX: st.anchorOffset.x,
        anchorY: st.anchorOffset.y
      }));
    case "flags":
      return [
        {
          id: "none",
          label: "\u{1F6AB} Bayraklar\u0131 Etkilemeyenler",
          color: GRAPH_COLORS.flagNone,
          description: "MOV, PUSH, POP, LEA, JMP, IN, OUT vb. \u0130\u015Flemci durumunu bozmaz.",
          anchorX: -260,
          anchorY: -180
        },
        {
          id: "all_arithmetic",
          label: "\u26A1 T\xFCm Aritmetik Bayraklar",
          color: GRAPH_COLORS.flagAll,
          description: "ADD, SUB, CMP, NEG vb. CF, ZF, SF, OF, AF, PF g\xFCnceller.",
          anchorX: 260,
          anchorY: -180
        },
        {
          id: "no_cf",
          label: "\u26A0\uFE0F CF Hari\xE7 G\xFCncellenenler",
          color: GRAPH_COLORS.flagNoCf,
          description: "INC, DEC. D\xF6ng\xFC sayac\u0131n\u0131 g\xFCncellerken Carry bayra\u011F\u0131n\u0131 korur.",
          anchorX: 280,
          anchorY: 140
        },
        {
          id: "logic",
          label: "\u{1F9E9} Mant\u0131ksal \u0130\u015Flemler (CF=0, OF=0)",
          color: GRAPH_COLORS.flagLogic,
          description: "AND, OR, XOR, TEST. Bit maskeleme yapar, CF ve OF s\u0131f\u0131rlar.",
          anchorX: 0,
          anchorY: 260
        },
        {
          id: "shift_rotate",
          label: "\u{1F504} Kayd\u0131rma & D\xF6nd\xFCrme",
          color: GRAPH_COLORS.flagShift,
          description: "SHL, SHR, SAR, ROL, ROR. Bitleri \xF6teler, CF ve OF bayraklar\u0131n\u0131 etkiler.",
          anchorX: -280,
          anchorY: 140
        },
        {
          id: "flag_control",
          label: "\u{1F6A9} Bayrak Kurma/Temizleme",
          color: GRAPH_COLORS.flagControl,
          description: "CLC, STC, CLI, STI, CLD, STD. Do\u011Frudan kontrol bayraklar\u0131n\u0131 y\xF6netir.",
          anchorX: -100,
          anchorY: -300
        },
        {
          id: "flag_transfer",
          label: "\u{1F4E5} Bayrak Aktar\u0131m\u0131",
          color: GRAPH_COLORS.flagTransfer,
          description: "LAHF, SAHF, PUSHF, POPF. Bayraklar\u0131 y\u0131\u011F\u0131nla veya AH ile ta\u015F\u0131r.",
          anchorX: 100,
          anchorY: -300
        },
        {
          id: "undefined_flags",
          label: "\u2699\uFE0F \xD6zel / Tan\u0131ms\u0131z",
          color: GRAPH_COLORS.flagUndefined,
          description: "MUL, DIV vb. Bayraklar\u0131 \xF6zel ve tan\u0131ms\u0131z b\u0131rakan i\u015Flemler.",
          anchorX: 0,
          anchorY: 0
        }
      ];
    case "mechanism":
      return [
        { id: "data_transfer", label: "\u{1F4E6} Veri Aktar\u0131m\u0131", color: "#3b82f6", description: "Yazma\xE7, bellek ve sabitler aras\u0131 veri kopyalama.", anchorX: -280, anchorY: -200 },
        { id: "arithmetic", label: "\u2795 Aritmetik", color: "#ef4444", description: "Toplama, \xE7\u0131karma, \xE7arpma, b\xF6lme.", anchorX: 280, anchorY: -200 },
        { id: "logic_bitwise", label: "\u{1F532} Mant\u0131ksal & Bit", color: "#8b5cf6", description: "VE, VEYA, \xD6ZEL VEYA, DE\u011E\u0130L bit operasyonlar\u0131.", anchorX: 280, anchorY: 160 },
        { id: "stack_op", label: "\u{1F4DA} Y\u0131\u011F\u0131n (Stack)", color: "#f59e0b", description: "LIFO prensibiyle PUSH/POP ve alt yordam \xE7a\u011Fr\u0131lar\u0131.", anchorX: -280, anchorY: 160 },
        { id: "control_jump", label: "\u{1F500} Atlama & D\xF6ng\xFC", color: "#06b6d4", description: "\u015Eartl\u0131/\u015Farts\u0131z dallanmalar ve d\xF6ng\xFCler.", anchorX: 0, anchorY: -280 },
        { id: "memory_addressing", label: "\u{1F4BE} Bellek & Pointer", color: "#10b981", description: "Adres hesaplama (LEA, LDS, LES, XLAT).", anchorX: -160, anchorY: 280 },
        { id: "io_port", label: "\u{1F50C} I/O & Kesmeler", color: "#ec4899", description: "Port eri\u015Fimi (IN/OUT) ve yaz\u0131l\u0131msal kesmeler (INT).", anchorX: 160, anchorY: 280 },
        { id: "string_op", label: "\u{1F9F5} Dizi (String)", color: "#14b8a6", description: "Ard\u0131\u015F\u0131k bellek bloklar\u0131 \xFCzerinde otomatik artan i\u015Flemler.", anchorX: 0, anchorY: 0 }
      ];
    case "category":
      return [
        { id: "data", label: "Veri Transferi", color: "#3b82f6", description: "Veri hareketi", anchorX: -280, anchorY: -160 },
        { id: "arithmetic", label: "Aritmetik", color: "#ef4444", description: "Matematiksel komutlar", anchorX: 280, anchorY: -160 },
        { id: "logical", label: "Mant\u0131ksal", color: "#8b5cf6", description: "Mant\u0131k ve bit i\u015Flemleri", anchorX: 280, anchorY: 160 },
        { id: "control", label: "Kontrol & Atlama", color: "#06b6d4", description: "Dallanma komutlar\u0131", anchorX: -280, anchorY: 160 },
        { id: "string", label: "Dizgiler", color: "#10b981", description: "String komutlar\u0131", anchorX: 0, anchorY: -280 },
        { id: "bcd", label: "BCD / ASCII", color: "#f59e0b", description: "Onluk d\xFCzeltmeler", anchorX: 0, anchorY: 280 },
        { id: "flags", label: "Bayraklar", color: "#ec4899", description: "Bayrak y\xF6netimi", anchorX: 0, anchorY: 0 }
      ];
    case "hardware":
      return [
        { id: "alu", label: "\u2699\uFE0F Aritmetik Mant\u0131k Birimi (ALU)", color: "#ef4444", description: "T\xFCm hesaplamalar\u0131n ve bayrak g\xFCncellemelerinin kalbi.", anchorX: 260, anchorY: -160 },
        { id: "biu", label: "\u{1F68C} Veri Yolu Aray\xFCz\xFC (BIU)", color: "#3b82f6", description: "Bellekten komut getirme, segmentasyon ve adres \xFCretimi.", anchorX: -260, anchorY: -160 },
        { id: "memory_stack", label: "\u{1F4BE} Bellek & Y\u0131\u011F\u0131n Segmenti", color: "#10b981", description: "Y\u0131\u011F\u0131n i\u015Faret\xE7isi (SP) ve i\u015Faret\xE7i bazl\u0131 bellek eri\u015Fimi.", anchorX: -260, anchorY: 180 },
        { id: "io_interrupt", label: "\u{1F50C} I/O ve Kesme Birimi", color: "#ec4899", description: "Harici \xE7evre birimleri ve IVT kesme vekt\xF6r tablosu.", anchorX: 260, anchorY: 180 },
        { id: "eu", label: "\u{1F9E0} Y\xFCr\xFCtme Birimi (EU Kontrol)", color: "#8b5cf6", description: "Komut \xE7\xF6z\xFCc\xFC ve genel ama\xE7l\u0131 yazma\xE7lar.", anchorX: 0, anchorY: 0 }
      ];
  }
}

// src/ui/graph/graphPhysics.ts
var DEFAULT_PHYSICS_CONFIG = {
  repulsion: 420,
  linkDistance: 85,
  linkStrength: 0.18,
  clusterStrength: 0.035,
  centerGravity: 0.012,
  damping: 0.92,
  // Fluid glide
  maxSpeed: 22
};
var GraphPhysics = class {
  config;
  nodes = [];
  edges = [];
  clusters = [];
  groupingMode = "flags";
  alpha = 1;
  // Simulation energy / heat
  nodeMap = /* @__PURE__ */ new Map();
  clusterMap = /* @__PURE__ */ new Map();
  time = 0;
  constructor(nodes, edges, groupingMode = "flags", config = {}) {
    this.nodes = nodes;
    this.edges = edges;
    this.groupingMode = groupingMode;
    this.config = { ...DEFAULT_PHYSICS_CONFIG, ...config };
    this.initNodeMap();
    this.setGroupingMode(groupingMode);
  }
  initNodeMap() {
    this.nodeMap.clear();
    this.nodes.forEach((n) => this.nodeMap.set(n.id, n));
  }
  setGroupingMode(mode) {
    this.groupingMode = mode;
    this.clusters = getClusterDefinitions(mode);
    this.clusterMap.clear();
    this.clusters.forEach((c) => this.clusterMap.set(c.id, c));
    this.wakeUp(1);
    this.nodes.forEach((node) => {
      let clusterKey = "";
      if (mode === "subclusters") {
        clusterKey = node.kind === "sub_hub" ? node.id : node.subTraitId || node.flagImpact;
      } else if (mode === "flags") {
        clusterKey = node.flagImpact;
      } else if (mode === "mechanism") {
        clusterKey = node.mechanism;
      } else if (mode === "category") {
        clusterKey = node.category;
      } else if (mode === "hardware") {
        clusterKey = node.hardwareLayer;
      }
      node.clusterId = clusterKey;
      const targetCluster = this.clusterMap.get(clusterKey);
      if (targetCluster) {
        node.vx += (targetCluster.anchorX - node.x) * 0.04;
        node.vy += (targetCluster.anchorY - node.y) * 0.04;
      }
    });
  }
  wakeUp(heat = 0.8) {
    this.alpha = Math.max(this.alpha, heat);
  }
  tick() {
    this.time += 0.02;
    const { repulsion, linkDistance, linkStrength, clusterStrength, centerGravity, damping, maxSpeed } = this.config;
    const nodeCount = this.nodes.length;
    const energy = Math.max(0.15, this.alpha);
    for (let i = 0; i < nodeCount; i++) {
      const node = this.nodes[i];
      if (node.fx !== void 0 && node.fx !== null) continue;
      node.vx -= node.x * centerGravity * energy;
      node.vy -= node.y * centerGravity * energy;
      if (node.clusterId) {
        const cluster = this.clusterMap.get(node.clusterId);
        if (cluster) {
          const dx = cluster.anchorX - node.x;
          const dy = cluster.anchorY - node.y;
          node.vx += dx * clusterStrength * energy;
          node.vy += dy * clusterStrength * energy;
        }
      }
      const phase = i * 0.35 + this.time;
      node.vx += Math.sin(phase) * 0.08;
      node.vy += Math.cos(phase * 0.8) * 0.08;
    }
    for (let i = 0; i < nodeCount; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < nodeCount; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        let distSq = dx * dx + dy * dy;
        const minDist = n1.radius + n2.radius + 16;
        const minDistSq = minDist * minDist;
        if (distSq < 1) distSq = 1;
        const dist = Math.sqrt(distSq);
        let force = repulsion * energy / distSq;
        if (distSq < minDistSq) {
          force += (minDist - dist) * 0.5;
        }
        const fx = dx / dist * force;
        const fy = dy / dist * force;
        if (n1.fx === void 0 || n1.fx === null) {
          n1.vx -= fx;
          n1.vy -= fy;
        }
        if (n2.fx === void 0 || n2.fx === null) {
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }
    const edgeCount = this.edges.length;
    for (let i = 0; i < edgeCount; i++) {
      const edge = this.edges[i];
      const source = this.nodeMap.get(edge.source);
      const target = this.nodeMap.get(edge.target);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const displacement = dist - linkDistance;
      const k = (edge.strength || 1) * linkStrength * energy;
      const force = displacement * k;
      const fx = dx / dist * force;
      const fy = dy / dist * force;
      const isSourceDragged = source.fx !== void 0 && source.fx !== null;
      const isTargetDragged = target.fx !== void 0 && target.fx !== null;
      if (!isSourceDragged) {
        source.vx += fx * (isTargetDragged ? 1.6 : 1);
        source.vy += fy * (isTargetDragged ? 1.6 : 1);
      }
      if (!isTargetDragged) {
        target.vx -= fx * (isSourceDragged ? 1.6 : 1);
        target.vy -= fy * (isSourceDragged ? 1.6 : 1);
      }
    }
    for (let i = 0; i < nodeCount; i++) {
      const node = this.nodes[i];
      if (node.fx !== void 0 && node.fx !== null) {
        node.x = node.fx;
        node.y = node.fy;
        node.vx = 0;
        node.vy = 0;
        continue;
      }
      node.vx *= damping;
      node.vy *= damping;
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > maxSpeed) {
        node.vx = node.vx / speed * maxSpeed;
        node.vy = node.vy / speed * maxSpeed;
      }
      node.x += node.vx;
      node.y += node.vy;
    }
    if (this.alpha > 0.2) {
      this.alpha *= 0.994;
    }
  }
  setNodeDrag(nodeId, x, y, releaseVx, releaseVy) {
    const node = this.nodeMap.get(nodeId);
    if (!node) return;
    this.wakeUp(1);
    if (x !== null && y !== null) {
      node.fx = x;
      node.fy = y;
      node.x = x;
      node.y = y;
    } else {
      node.fx = null;
      node.fy = null;
      if (releaseVx !== void 0 && releaseVy !== void 0) {
        node.vx = Math.min(25, Math.max(-25, releaseVx * 0.7));
        node.vy = Math.min(25, Math.max(-25, releaseVy * 0.7));
      }
    }
  }
  getNodeAt(x, y, padding = 12) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const hitRadius = node.radius + padding;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return node;
      }
    }
    return null;
  }
};

// src/ui/graph/graphRenderer.ts
var GraphRenderer = class {
  canvas;
  ctx;
  physics;
  viewport = { x: 0, y: 0, zoom: 0.9 };
  hoveredNode = null;
  selectedNode = null;
  draggedNode = null;
  searchQuery = "";
  animFrameId = null;
  pulsePhase = 0;
  isDestroyed = false;
  dust = [];
  resizeObserver = null;
  time = 0;
  constructor(canvas, physics) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context not available");
    this.ctx = context;
    this.physics = physics;
    this.initDust();
    this.setupResizeObserver();
    this.resize();
    this.centerViewport();
  }
  initDust() {
    this.dust = [];
    for (let i = 0; i < 45; i++) {
      this.dust.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.35 + 0.1,
        speed: Math.random() * 0.2 + 0.05
      });
    }
  }
  setupResizeObserver() {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        this.render();
      });
      this.resizeObserver.observe(this.canvas);
    }
  }
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
    }
  }
  centerViewport() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.viewport.x = rect.width / 2;
      this.viewport.y = rect.height / 2;
      this.viewport.zoom = 0.88;
    }
  }
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewport.x) / this.viewport.zoom,
      y: (sy - this.viewport.y) / this.viewport.zoom
    };
  }
  worldToScreen(wx, wy) {
    return {
      x: wx * this.viewport.zoom + this.viewport.x,
      y: wy * this.viewport.zoom + this.viewport.y
    };
  }
  startAnimation() {
    if (this.animFrameId !== null) return;
    this.isDestroyed = false;
    const renderLoop = () => {
      if (this.isDestroyed) return;
      this.time += 0.025;
      this.pulsePhase = (this.pulsePhase + 0.018) % 1;
      this.physics.tick();
      this.render();
      this.animFrameId = requestAnimationFrame(renderLoop);
    };
    this.animFrameId = requestAnimationFrame(renderLoop);
  }
  stopAnimation() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
  destroy() {
    this.isDestroyed = true;
    this.stopAnimation();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
  render() {
    const { ctx, canvas } = this;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#080d1a";
    ctx.fillRect(0, 0, width, height);
    const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.7);
    bgGlow.addColorStop(0, "#0f172a");
    bgGlow.addColorStop(1, "#050811");
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(this.viewport.x, this.viewport.y);
    ctx.scale(this.viewport.zoom, this.viewport.zoom);
    this.drawFloatingDust();
    const activeNodes = this.computeActiveNeighborhood();
    this.drawClusterNebulae();
    this.drawEdges(activeNodes);
    this.drawNodes(activeNodes);
    ctx.restore();
  }
  drawFloatingDust() {
    const { ctx } = this;
    ctx.save();
    this.dust.forEach((p) => {
      p.y -= p.speed;
      if (p.y < -800) p.y = 800;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
      ctx.fill();
    });
    ctx.restore();
  }
  computeActiveNeighborhood() {
    const target = this.draggedNode || this.hoveredNode || this.selectedNode;
    if (!target && !this.searchQuery) return null;
    const set = /* @__PURE__ */ new Set();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      this.physics.nodes.forEach((n) => {
        if (n.label.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
          set.add(n.id);
        }
      });
      return set;
    }
    if (target) {
      set.add(target.id);
      if (target.kind === "flag_hub") {
        this.physics.nodes.forEach((n) => {
          if (n.flagImpact === target.flagImpact) {
            set.add(n.id);
          }
        });
      }
      this.physics.edges.forEach((e) => {
        if (e.source === target.id) set.add(e.target);
        if (e.target === target.id) set.add(e.source);
      });
    }
    return set;
  }
  drawClusterNebulae() {
    const { ctx, time } = this;
    const clusters = this.physics.clusters;
    clusters.forEach((cluster) => {
      const clusterNodes = this.physics.nodes.filter((n) => n.clusterId === cluster.id);
      if (clusterNodes.length === 0) return;
      let maxDist = 80;
      clusterNodes.forEach((n) => {
        const dx = n.x - cluster.anchorX;
        const dy = n.y - cluster.anchorY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > maxDist && d < 450) maxDist = d;
      });
      const breathe = Math.sin(time * 1.5 + cluster.anchorX) * 10;
      const radius = maxDist + 50 + breathe;
      const grad = ctx.createRadialGradient(
        cluster.anchorX,
        cluster.anchorY,
        15,
        cluster.anchorX,
        cluster.anchorY,
        radius
      );
      grad.addColorStop(0, `${cluster.color}1c`);
      grad.addColorStop(0.6, `${cluster.color}08`);
      grad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cluster.anchorX, cluster.anchorY, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cluster.anchorX, cluster.anchorY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${cluster.color}33`;
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '700 13px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = `${cluster.color}dd`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(cluster.label, cluster.anchorX, cluster.anchorY - radius + 18);
    });
  }
  drawEdges(activeNodes) {
    const { ctx, pulsePhase } = this;
    const nodeMap = new Map(this.physics.nodes.map((n) => [n.id, n]));
    const target = this.draggedNode || this.hoveredNode || this.selectedNode;
    this.physics.edges.forEach((edge) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;
      const isDirectActive = target && (src.id === target.id || tgt.id === target.id);
      const isBothActive = activeNodes && activeNodes.has(src.id) && activeNodes.has(tgt.id);
      let strokeStyle = "rgba(100, 116, 139, 0.18)";
      let lineWidth = 1;
      let alpha = 0.25;
      if (activeNodes) {
        if (isDirectActive) {
          strokeStyle = tgt.color || "#38bdf8";
          lineWidth = 2.6;
          alpha = 0.95;
        } else if (isBothActive) {
          strokeStyle = tgt.color || "#38bdf8";
          lineWidth = 1.6;
          alpha = 0.65;
        } else {
          alpha = 0.05;
        }
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();
      if (isDirectActive) {
        const px = src.x + (tgt.x - src.x) * pulsePhase;
        const py = src.y + (tgt.y - src.y) * pulsePhase;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = strokeStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      ctx.restore();
    });
  }
  drawNodes(activeNodes) {
    const { ctx, time } = this;
    const zoom = this.viewport.zoom;
    this.physics.nodes.forEach((node) => {
      const isDragged = this.draggedNode?.id === node.id;
      const isHovered = this.hoveredNode?.id === node.id;
      const isSelected = this.selectedNode?.id === node.id;
      const isHighlighted = isDragged || isHovered || isSelected;
      const isActive = !activeNodes || activeNodes.has(node.id);
      ctx.save();
      if (activeNodes && !isActive) {
        ctx.globalAlpha = 0.12;
      } else {
        ctx.globalAlpha = 1;
      }
      const radius = node.radius * (isDragged ? 1.4 : isHovered || isSelected ? 1.25 : 1);
      const isHub = node.kind === "flag_hub" || node.kind === "sub_hub";
      if (isHighlighted || isHub) {
        const pulse = Math.sin(time * 3 + node.x) * 4;
        const multiplier = node.kind === "flag_hub" ? 2.6 : node.kind === "sub_hub" ? 2.1 : 1.9;
        const auraRadius = radius * multiplier + pulse;
        const aura = ctx.createRadialGradient(node.x, node.y, radius * 0.4, node.x, node.y, auraRadius);
        aura.addColorStop(0, `${node.color}66`);
        aura.addColorStop(0.6, `${node.color}22`);
        aura.addColorStop(1, "transparent");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      const coreGrad = ctx.createRadialGradient(
        node.x - radius * 0.3,
        node.y - radius * 0.3,
        radius * 0.1,
        node.x,
        node.y,
        radius
      );
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.35, node.color);
      coreGrad.addColorStop(1, "#0f172a");
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.lineWidth = isHighlighted ? 2.8 : isHub ? 2 : 1.5;
      ctx.strokeStyle = isHighlighted ? "#ffffff" : isHub ? "#ffffffaa" : `${node.color}cc`;
      ctx.stroke();
      if (node.kind === "sub_hub") {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (isDragged) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      const shouldDrawLabel = isHub || isHighlighted || activeNodes && activeNodes.has(node.id) || zoom > 0.55;
      if (shouldDrawLabel) {
        const fontSize = node.kind === "flag_hub" ? 12.5 : node.kind === "sub_hub" ? 11.5 : isHighlighted ? 11 : 9.5;
        ctx.font = `${isHub || isHighlighted ? "700" : "600"} ${fontSize}px "JetBrains Mono", Consolas, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labelY = node.y + radius + 5;
        const text = node.kind === "sub_hub" && node.memberCount ? `${node.label} (${node.memberCount})` : node.label;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        ctx.fillStyle = isHub ? "rgba(15, 23, 42, 0.95)" : "rgba(8, 13, 26, 0.88)";
        ctx.fillRect(node.x - textWidth / 2 - 5, labelY - 2, textWidth + 10, fontSize + 4);
        if (isHighlighted || isHub) {
          ctx.strokeStyle = `${node.color}cc`;
          ctx.lineWidth = 1;
          ctx.strokeRect(node.x - textWidth / 2 - 5, labelY - 2, textWidth + 10, fontSize + 4);
        }
        ctx.fillStyle = isHighlighted ? "#ffffff" : isHub ? node.color : "#f1f5f9";
        ctx.fillText(text, node.x, labelY);
      }
      ctx.restore();
    });
  }
};

// src/ui/graph/graphView.ts
var GraphView = class {
  container;
  callbacks;
  canvas;
  physics;
  renderer;
  draggedNode = null;
  isPanning = false;
  lastMousePos = { x: 0, y: 0 };
  mouseVelocity = { vx: 0, vy: 0 };
  dragStartPos = { x: 0, y: 0 };
  isActualDrag = false;
  activeGroupingMode = "subclusters";
  detailPanelEl;
  searchInputEl;
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }
  init() {
    const { nodes, edges } = build8086KnowledgeGraph();
    this.physics = new GraphPhysics(nodes, edges, this.activeGroupingMode);
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.renderer.startAnimation();
  }
  onShow() {
    requestAnimationFrame(() => {
      if (this.renderer) {
        this.renderer.resize();
        this.renderer.centerViewport();
        this.physics.wakeUp(1);
        this.renderer.render();
      }
    });
  }
  renderDOM() {
    this.container.innerHTML = `
      <div class="graph-root-container">
        <!-- Top Navigation & Controls Toolbar -->
        <header class="graph-toolbar">
          <div class="graph-toolbar-left">
            <button class="btn-graph-back" id="btn-graph-back" title="Edit\xF6re D\xF6n (Esc)">
              <span class="btn-arrow">\u2190</span> Edit\xF6re D\xF6n
            </button>
            <div class="graph-brand">
              <span class="graph-brand-icon">\u{1F9E0}</span>
              <span class="graph-brand-title">8086 Sinir A\u011F\u0131 & Bilgi Haritas\u0131</span>
              <span class="graph-node-count-badge" id="graph-node-count">${this.physics.nodes.length} D\xFC\u011F\xFCm</span>
            </div>
          </div>

          <!-- Middle Filter & Grouping Controls -->
          <div class="graph-toolbar-center">
            <!-- Search Input -->
            <div class="graph-search-wrap">
              <span class="graph-search-icon">\u{1F50D}</span>
              <input type="text" id="graph-search-input" class="graph-search-input" placeholder="Komut ara (\xF6rn: MOV, flag, stack)..." />
              <button id="graph-search-clear" class="graph-search-clear" style="display:none;" title="Temizle">\u2715</button>
            </div>

            <!-- Grouping Mode Selector -->
            <div class="graph-group-selector-wrap">
              <label for="graph-group-mode" class="graph-group-label">Gruplama:</label>
              <select id="graph-group-mode" class="graph-group-select" title="Farkl\u0131 \xF6zelliklere g\xF6re k\xFCmeleme">
                <option value="subclusters" selected>\u{1F50D} Alt K\xFCmeler & Ortak \xD6zellikler (\xD6nerilen)</option>
                <option value="flags">\u{1F6A9} Bayrak Etkisine G\xF6re (Ana Gruplar)</option>
                <option value="mechanism">\u2699\uFE0F \u0130\u015Flem & Operand Tipine G\xF6re</option>
                <option value="category">\u{1F4D6} Manuel Kategorisine G\xF6re</option>
                <option value="hardware">\u{1F4BB} 8086 Donan\u0131m Katman\u0131na G\xF6re</option>
              </select>
            </div>
          </div>

          <!-- Right Quick Filter Buttons & View Controls -->
          <div class="graph-toolbar-right">
            <div class="graph-quick-pills">
              <button class="graph-pill-btn active" data-pill="all">T\xFCm\xFC</button>
              <button class="graph-pill-btn" data-pill="flag-none" title="Hi\xE7bir bayra\u011F\u0131 etkilemeyen komutlar">\u{1F6AB} No Flags</button>
              <button class="graph-pill-btn" data-pill="flag-all" title="T\xFCm aritmetik bayraklar\u0131 de\u011Fi\u015Ftirenler">\u26A1 Aritmetik</button>
              <button class="graph-pill-btn" data-pill="stack" title="Y\u0131\u011F\u0131n komutlar\u0131">\u{1F4DA} Y\u0131\u011F\u0131n</button>
              <button class="graph-pill-btn" data-pill="jump" title="Dallanma komutlar\u0131">\u{1F500} Atlama</button>
            </div>

            <button class="btn-graph-action" id="btn-graph-recenter" title="Haritay\u0131 Ortala">\u27F2 Ortala</button>
          </div>
        </header>

        <!-- Main Body: Canvas + Inspector Drawer -->
        <div class="graph-main-viewport">
          <canvas id="graph-canvas" class="graph-canvas"></canvas>

          <!-- Right Inspector Card (Obsidian Detail Panel) -->
          <aside class="graph-inspector-drawer" id="graph-inspector" style="display: none;">
            <div class="inspector-header">
              <div class="inspector-title-wrap">
                <h3 class="inspector-title" id="insp-title">MOV</h3>
                <span class="inspector-kind-badge" id="insp-kind">Komut</span>
              </div>
              <button class="btn-close-inspector" id="btn-close-insp" title="Kapat">\u2715</button>
            </div>

            <div class="inspector-content">
              <!-- Flag Impact Badge Box -->
              <div class="insp-flag-impact-box" id="insp-flag-box">
                <div class="insp-flag-label">\u{1F6A9} Bayrak Etkisi:</div>
                <div class="insp-flag-value" id="insp-flag-val">Hi\xE7bir bayra\u011F\u0131 etkilemez.</div>
              </div>

              <!-- Summary & Description -->
              <div class="insp-section">
                <div class="insp-section-label">A\xE7\u0131klama:</div>
                <p class="insp-text" id="insp-desc"></p>
              </div>

              <!-- Hardware Rule Note if present -->
              <div class="insp-rules-box" id="insp-rules-box" style="display: none;">
                <span class="insp-rules-icon">\u26A0\uFE0F</span>
                <div class="insp-rules-text" id="insp-rules-text"></div>
              </div>

              <!-- Sample Code Box -->
              <div class="insp-section" id="insp-sample-section">
                <div class="insp-section-header">
                  <span class="insp-section-label">\xD6rnek Kullan\u0131m:</span>
                  <div class="insp-code-actions">
                    <button class="btn-insp-copy" id="btn-insp-copy" title="Kodu Kopyala">\u{1F4CB} Kopyala</button>
                    <button class="btn-insp-insert" id="btn-insp-insert" title="Kodu Edit\xF6re Aktar">\u26A1 Edit\xF6re Ekle</button>
                  </div>
                </div>
                <pre class="insp-code-block"><code id="insp-code">MOV AX, 1234H</code></pre>
              </div>

              <!-- Connected Sister Instructions / Concepts -->
              <div class="insp-section">
                <div class="insp-section-label">Ayn\u0131 \xD6zelli\u011Fi Payla\u015Fan Karde\u015F Komutlar:</div>
                <div class="insp-related-tags" id="insp-related-tags"></div>
              </div>

              <!-- Action Link -->
              <div class="insp-footer-actions">
                <button class="btn-insp-open-manual" id="btn-insp-open-manual">
                  \u{1F4D6} Manuelde Tam Detay\u0131 G\xF6r
                </button>
              </div>
            </div>
          </aside>
        </div>

        <!-- Bottom Physics & Legend Bar -->
        <footer class="graph-footer-bar">
          <div class="graph-legend-items">
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagNone};"></span> Bayrak Etkilemeyenler</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagAll};"></span> T\xFCm Aritmetik Bayraklar</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagNoCf};"></span> CF Korumal\u0131 (INC/DEC)</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagLogic};"></span> Mant\u0131ksal (CF=0, OF=0)</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagShift};"></span> Kayd\u0131rma / D\xF6nd\xFCrme</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagControl};"></span> Bayrak Kontrol (CLC...)</span>
          </div>

          <div class="graph-physics-controls">
            <label class="phys-label">Kuvvetler:</label>
            <span class="phys-slider-wrap" title="D\xFC\u011F\xFCmlerin k\xFCme merkezine \xE7ekim g\xFCc\xFC">
              \xC7ekim: <input type="range" id="slider-attraction" min="10" max="100" value="35" />
            </span>
            <span class="phys-slider-wrap" title="D\xFC\u011F\xFCmler aras\u0131 itme mesafesi">
              \u0130tme: <input type="range" id="slider-repulsion" min="150" max="900" value="420" />
            </span>
            <span class="phys-slider-wrap" title="Yay ba\u011Flant\u0131 mesafesi">
              Mesafe: <input type="range" id="slider-distance" min="40" max="200" value="85" />
            </span>
          </div>
        </footer>
      </div>
    `;
    this.detailPanelEl = this.container.querySelector("#graph-inspector");
    this.searchInputEl = this.container.querySelector("#graph-search-input");
  }
  setupCanvas() {
    this.canvas = this.container.querySelector("#graph-canvas");
    this.renderer = new GraphRenderer(this.canvas, this.physics);
  }
  bindEvents() {
    const backBtn = this.container.querySelector("#btn-graph-back");
    backBtn?.addEventListener("click", () => {
      this.callbacks.onReturnToEditor();
    });
    const recenterBtn = this.container.querySelector("#btn-graph-recenter");
    recenterBtn?.addEventListener("click", () => {
      this.renderer.centerViewport();
      this.physics.wakeUp(1);
      this.renderer.render();
    });
    const groupSelect = this.container.querySelector("#graph-group-mode");
    groupSelect?.addEventListener("change", () => {
      const mode = groupSelect.value;
      this.activeGroupingMode = mode;
      this.physics.setGroupingMode(mode);
    });
    const clearBtn = this.container.querySelector("#graph-search-clear");
    this.searchInputEl?.addEventListener("input", () => {
      const q = this.searchInputEl.value.trim();
      this.renderer.searchQuery = q;
      this.physics.wakeUp(0.6);
      clearBtn.style.display = q ? "block" : "none";
    });
    clearBtn?.addEventListener("click", () => {
      this.searchInputEl.value = "";
      this.renderer.searchQuery = "";
      clearBtn.style.display = "none";
      this.physics.wakeUp(0.6);
      this.searchInputEl.focus();
    });
    const pills = this.container.querySelectorAll(".graph-pill-btn");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const pillId = pill.getAttribute("data-pill");
        this.handlePillFilter(pillId);
      });
    });
    const sliderAttract = this.container.querySelector("#slider-attraction");
    sliderAttract?.addEventListener("input", () => {
      this.physics.config.clusterStrength = Number(sliderAttract.value) / 1e3;
      this.physics.wakeUp(0.7);
    });
    const sliderRepulsion = this.container.querySelector("#slider-repulsion");
    sliderRepulsion?.addEventListener("input", () => {
      this.physics.config.repulsion = Number(sliderRepulsion.value);
      this.physics.wakeUp(0.7);
    });
    const sliderDist = this.container.querySelector("#slider-distance");
    sliderDist?.addEventListener("input", () => {
      this.physics.config.linkDistance = Number(sliderDist.value);
      this.physics.wakeUp(0.7);
    });
    const closeInspBtn = this.container.querySelector("#btn-close-insp");
    closeInspBtn?.addEventListener("click", () => {
      this.renderer.selectedNode = null;
      this.detailPanelEl.style.display = "none";
    });
    const copyBtn = this.container.querySelector("#btn-insp-copy");
    copyBtn?.addEventListener("click", () => {
      const codeEl = this.container.querySelector("#insp-code");
      if (codeEl?.textContent) {
        navigator.clipboard.writeText(codeEl.textContent);
        copyBtn.textContent = "\u2713 Kopyaland\u0131";
        setTimeout(() => {
          copyBtn.textContent = "\u{1F4CB} Kopyala";
        }, 1500);
      }
    });
    const insertBtn = this.container.querySelector("#btn-insp-insert");
    insertBtn?.addEventListener("click", () => {
      const codeEl = this.container.querySelector("#insp-code");
      if (codeEl?.textContent && this.callbacks.onInsertCodeToEditor) {
        this.callbacks.onInsertCodeToEditor(codeEl.textContent);
      }
    });
    const openManualBtn = this.container.querySelector("#btn-insp-open-manual");
    openManualBtn?.addEventListener("click", () => {
      if (this.renderer.selectedNode && this.callbacks.onOpenInManual) {
        const opcode = this.renderer.selectedNode.label;
        this.callbacks.onOpenInManual(opcode);
      }
    });
    this.bindCanvasMouseEvents();
  }
  handlePillFilter(pillId) {
    if (!pillId || pillId === "all") {
      this.renderer.searchQuery = "";
      this.renderer.hoveredNode = null;
      this.physics.wakeUp(0.6);
      return;
    }
    if (pillId === "flag-none") {
      const hub = this.physics.nodes.find((n) => n.id === "hub-flag-none");
      if (hub) this.selectNode(hub);
    } else if (pillId === "flag-all") {
      const hub = this.physics.nodes.find((n) => n.id === "hub-flag-all");
      if (hub) this.selectNode(hub);
    } else if (pillId === "stack") {
      const stackNode = this.physics.nodes.find((n) => n.label === "PUSH") || this.physics.nodes.find((n) => n.mechanism === "stack_op");
      if (stackNode) this.selectNode(stackNode);
    } else if (pillId === "jump") {
      const jmpNode = this.physics.nodes.find((n) => n.label === "JMP") || this.physics.nodes.find((n) => n.mechanism === "control_jump");
      if (jmpNode) this.selectNode(jmpNode);
    }
  }
  bindCanvasMouseEvents() {
    const canvas = this.canvas;
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newZoom = Math.min(3.8, Math.max(0.2, this.renderer.viewport.zoom * zoomFactor));
      this.renderer.viewport.x = mouseX - (mouseX - this.renderer.viewport.x) * (newZoom / this.renderer.viewport.zoom);
      this.renderer.viewport.y = mouseY - (mouseY - this.renderer.viewport.y) * (newZoom / this.renderer.viewport.zoom);
      this.renderer.viewport.zoom = newZoom;
    }, { passive: false });
    canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const worldPos = this.renderer.screenToWorld(sx, sy);
      const hitNode = this.physics.getNodeAt(worldPos.x, worldPos.y, 14);
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      this.dragStartPos = { x: e.clientX, y: e.clientY };
      this.mouseVelocity = { vx: 0, vy: 0 };
      this.isActualDrag = false;
      if (hitNode) {
        this.draggedNode = hitNode;
        this.renderer.draggedNode = hitNode;
        this.physics.setNodeDrag(hitNode.id, worldPos.x, worldPos.y);
        canvas.style.cursor = "grabbing";
      } else {
        this.isPanning = true;
        canvas.style.cursor = "move";
      }
    });
    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.mouseVelocity = { vx: dx, vy: dy };
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      const totalDist = Math.hypot(e.clientX - this.dragStartPos.x, e.clientY - this.dragStartPos.y);
      if (totalDist > 4) {
        this.isActualDrag = true;
      }
      if (this.draggedNode) {
        const worldPos = this.renderer.screenToWorld(sx, sy);
        this.physics.setNodeDrag(this.draggedNode.id, worldPos.x, worldPos.y);
        return;
      }
      if (this.isPanning) {
        this.renderer.viewport.x += dx;
        this.renderer.viewport.y += dy;
        return;
      }
      if (sx >= 0 && sx <= rect.width && sy >= 0 && sy <= rect.height) {
        const worldPos = this.renderer.screenToWorld(sx, sy);
        const hit = this.physics.getNodeAt(worldPos.x, worldPos.y, 10);
        if (hit !== this.renderer.hoveredNode) {
          this.renderer.hoveredNode = hit;
          canvas.style.cursor = hit ? "grab" : "default";
        }
      }
    });
    window.addEventListener("mouseup", () => {
      if (this.draggedNode) {
        const node = this.draggedNode;
        if (!this.isActualDrag) {
          this.selectNode(node);
        }
        this.physics.setNodeDrag(
          node.id,
          null,
          null,
          this.mouseVelocity.vx,
          this.mouseVelocity.vy
        );
        this.draggedNode = null;
        this.renderer.draggedNode = null;
        canvas.style.cursor = this.renderer.hoveredNode ? "grab" : "default";
      } else if (this.isPanning && !this.isActualDrag) {
        this.renderer.selectedNode = null;
        this.detailPanelEl.style.display = "none";
        canvas.style.cursor = "default";
      }
      this.isPanning = false;
    });
  }
  selectNode(node) {
    this.renderer.selectedNode = node;
    this.physics.wakeUp(0.8);
    this.showInspector(node);
  }
  showInspector(node) {
    const insp = this.detailPanelEl;
    insp.style.display = "flex";
    const titleEl = insp.querySelector("#insp-title");
    const kindEl = insp.querySelector("#insp-kind");
    const flagValEl = insp.querySelector("#insp-flag-val");
    const descEl = insp.querySelector("#insp-desc");
    const rulesBox = insp.querySelector("#insp-rules-box");
    const rulesText = insp.querySelector("#insp-rules-text");
    const codeEl = insp.querySelector("#insp-code");
    const sampleSec = insp.querySelector("#insp-sample-section");
    const tagsContainer = insp.querySelector("#insp-related-tags");
    const openManualBtn = insp.querySelector("#btn-insp-open-manual");
    titleEl.textContent = node.label;
    titleEl.style.color = node.color;
    kindEl.textContent = node.kind === "flag_hub" ? "Ana \xD6zellik Havuzu" : node.kind === "sub_hub" ? "Ortak Alt K\xFCme Kav\u015Fa\u011F\u0131" : "8086 Komutu";
    flagValEl.textContent = node.flagsText || "Belirtilmedi";
    descEl.textContent = node.summary;
    if (node.rules) {
      rulesBox.style.display = "flex";
      rulesText.innerHTML = node.rules.replace(/\n/g, "<br/>");
    } else {
      rulesBox.style.display = "none";
    }
    if (node.sampleCode) {
      sampleSec.style.display = "block";
      codeEl.textContent = node.sampleCode;
    } else {
      sampleSec.style.display = "none";
    }
    if (node.kind === "instruction") {
      openManualBtn.style.display = "block";
    } else {
      openManualBtn.style.display = "none";
    }
    let sisters = [];
    if (node.kind === "sub_hub") {
      const memberIds = new Set(
        this.physics.edges.filter((e) => e.target === node.id || e.source === node.id).map((e) => e.target === node.id ? e.source : e.target)
      );
      sisters = this.physics.nodes.filter((n) => memberIds.has(n.id) && n.kind === "instruction");
    } else if (node.subTraitId) {
      sisters = this.physics.nodes.filter(
        (n) => n.id !== node.id && n.kind === "instruction" && n.subTraitId === node.subTraitId
      ).slice(0, 18);
    } else {
      sisters = this.physics.nodes.filter(
        (n) => n.id !== node.id && n.kind === "instruction" && n.flagImpact === node.flagImpact
      ).slice(0, 16);
    }
    if (sisters.length > 0) {
      tagsContainer.innerHTML = sisters.map((s) => `
        <button class="insp-tag-pill" data-node-id="${s.id}" style="border-color: ${s.color}66; color: ${s.color};">
          ${s.label}
        </button>
      `).join("");
      tagsContainer.querySelectorAll(".insp-tag-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetId = btn.getAttribute("data-node-id");
          const targetNode = this.physics.nodes.find((n) => n.id === targetId);
          if (targetNode) {
            this.selectNode(targetNode);
          }
        });
      });
    } else {
      tagsContainer.innerHTML = `<span style="font-size: 11px; color: #64748b;">Do\u011Frudan e\u015Fle\u015Fen karde\u015F komut yok.</span>`;
    }
  }
  destroy() {
    this.renderer.destroy();
  }
};

// src/study/studyData.ts
var STUDY_TOPICS = [
  // =========================================================================
  // 1. 8086 MİMARİSİ VE 20-BİT BELLEK SEGMENTASYONU
  // =========================================================================
  {
    id: "topic-1-architecture",
    number: 1,
    title: "8086 \u0130\u015Flemci Mimarisi & 20-Bit Bellek Segmentasyonu",
    shortTitle: "1. Mimari & 20-Bit Bellek",
    badge: "M\u0130MAR\u0130 TEMEL",
    icon: "\u{1F3DB}\uFE0F",
    summary: "BIU & EU birimleri i\u015Fb\xF6l\xFCm\xFC, 14 adet 16-bit yazma\xE7, 20-bit Fiziksel Adres Form\xFCl\xFC (PA = Segment \xD7 16 + Offset) ve Little-Endian prensibi.",
    opcodes: ["CS", "DS", "SS", "ES", "IP", "AX", "BX", "CX", "DX", "SP", "BP", "SI", "DI", "FLAGS"],
    mindMap: {
      x: 15,
      y: 20,
      connections: ["topic-2-addressing"]
    },
    subLessons: [
      {
        id: "sub-1-biu-eu",
        number: "1.1",
        title: "BIU ve EU Donan\u0131m Birimleri \u0130\u015Fb\xF6l\xFCm\xFC",
        summary: "Komut \xD6n Getirme Kuyru\u011Fu (Prefetch Queue) ve Pipelining mimarisinin temelleri.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">BIU (Bus Interface Unit) vs. EU (Execution Unit)</h4>
            <p>8086 mikroi\u015Flemcisi, iki ba\u011F\u0131ms\u0131z donan\u0131m birimine ayr\u0131larak ilk modern boru hatt\u0131 (pipelining) mimarisini kurmu\u015Ftur:</p>
            <div class="nb-grid-2">
              <div class="nb-card biu-card">
                <h5>\u{1F68C} BIU (Veriyolu Aray\xFCz Birimi)</h5>
                <ul>
                  <li>D\u0131\u015F d\xFCnya ve sistem veriyollar\u0131 ile konu\u015Fan <strong>tek</strong> birimdir.</li>
                  <li>Bellekten komutlar\u0131 getirip <strong>6-baytl\u0131k Prefetch Queue (FIFO)</strong> kuyru\u011Funa koyar.</li>
                  <li>Segment yazma\xE7lar\u0131n\u0131 (<code>CS, DS, SS, ES</code>) ve <code>IP</code> yazmac\u0131n\u0131 bar\u0131nd\u0131r\u0131r.</li>
                  <li>20-bitlik fiziksel adresi hesaplay\u0131p adres veriyoluna s\xFCrer.</li>
                </ul>
              </div>
              <div class="nb-card eu-card">
                <h5>\u2699\uFE0F EU (Y\xFCr\xFCtme Birimi)</h5>
                <ul>
                  <li>D\u0131\u015F veriyollar\u0131na do\u011Frudan dokunmaz; kuyruktan gelen komutlar\u0131 y\xFCr\xFCt\xFCr.</li>
                  <li><strong>ALU (16-bit):</strong> T\xFCm aritmetik ve mant\u0131ksal hesaplamalar\u0131 yapar.</li>
                  <li>Genel yazma\xE7lar\u0131 (<code>AX, BX, CX, DX</code>) ve i\u015Faret\xE7ileri (<code>SP, BP, SI, DI</code>) y\xF6netir.</li>
                  <li>Durum ve kontrol bayraklar\u0131n\u0131 (<code>FLAGS</code>) g\xFCnceller.</li>
                </ul>
              </div>
            </div>
            <div class="nb-callout tip">
              \u{1F4A1} <strong>Pipelining:</strong> EU bir komutu \xE7\xF6zer veya \xE7al\u0131\u015Ft\u0131r\u0131rken, BIU bo\u015F beklemez; s\u0131radaki komutlar\u0131 bellekten getirip 6-baytl\u0131k kuyru\u011Fa doldurur.
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">EU Genel Ama\xE7l\u0131 Yazma\xE7lar\u0131 (AX, BX, CX, DX)</h4>
            <p>EU birimi i\xE7inde verileri ge\xE7ici olarak saklamak i\xE7in 14 adet 16-bitlik yazma\xE7 bulunur. En s\u0131k kullan\u0131lan 4 genel ama\xE7l\u0131 yazma\xE7 \u015Funlard\u0131r:</p>
            <ul>
              <li><strong>AX (Accumulator - Ak\xFCm\xFClat\xF6r):</strong> Aritmetik, \xE7arpma ve giri\u015F/\xE7\u0131k\u0131\u015F i\u015Flemlerinin ana yazmac\u0131d\u0131r.</li>
              <li><strong>BX (Base - Taban Yazmac\u0131):</strong> Bellek adreslemede taban i\u015Faret\xE7isi olarak kullan\u0131l\u0131r.</li>
              <li><strong>CX (Count - Saya\xE7 Yazmac\u0131):</strong> D\xF6ng\xFC ve bit kayd\u0131rma i\u015Flemlerinde donan\u0131msal saya\xE7t\u0131r.</li>
              <li><strong>DX (Data - Veri Yazmac\u0131):</strong> \xC7arpma/b\xF6lme sonu\xE7lar\u0131 ve G/\xC7 port adresleri i\xE7in kullan\u0131l\u0131r.</li>
            </ul>
            <div class="nb-callout tip">
              \u{1F4A1} <strong>Y\xFCksek / D\xFC\u015F\xFCk Bayt Par\xE7alanmas\u0131:</strong> Bu 4 yazmac\u0131n her biri iki ba\u011F\u0131ms\u0131z 8-bitlik yazmaca ayr\u0131labilir:
              \xD6rne\u011Fin <code>AX</code> yazmac\u0131n\u0131n \xFCst 8 biti <code>AH</code> (High), alt 8 biti ise <code>AL</code> (Low) olarak adland\u0131r\u0131l\u0131r.
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">\u0130lk Komutumuz: MOV (Veri Kopyalama / Y\xFCkleme)</h4>
            <p>Assembly dilinde yazma\xE7lara de\u011Fer atamak ve veri aktarmak i\xE7in <code>MOV</code> komutu kullan\u0131l\u0131r:</p>
            <div class="nb-formula-box">
              <code>MOV hedef, kaynak   ; kaynak verisini hedefe kopyalar</code>
            </div>
            <pre class="nb-code-sample">MOV AX, 1234h   ; AX yazmac\u0131na 16-bit onalt\u0131l\u0131k 1234h say\u0131s\u0131n\u0131 y\xFCkler
MOV BX, 5678h   ; BX yazmac\u0131na 5678h y\xFCkler
MOV CX, 0010h   ; CX yazmac\u0131na 0010h (ondal\u0131k 16) y\xFCkler</pre>

            <h4 class="nb-title" style="margin-top: 16px;">Program \u0130skeleti: ORG 100h ve HLT</h4>
            <p>Yazd\u0131\u011F\u0131m\u0131z Assembly programlar\u0131n\u0131n i\u015Fletim sisteminde d\xFCzg\xFCn \xE7al\u0131\u015Fmas\u0131 ve durmas\u0131 i\xE7in iki temel direktif kullan\u0131l\u0131r:</p>
            <ul>
              <li><code>ORG 100h</code>: DOS COM dosyalar\u0131 i\xE7in kodun bellek ofsetinin 100h adresinden ba\u015Flayaca\u011F\u0131n\u0131 derleyiciye bildirir.</li>
              <li><code>HLT (Halt)</code>: \u0130\u015Flemciye "art\u0131k \xE7al\u0131\u015Fmay\u0131 durdur" emri verir. Program\u0131m\u0131z\u0131n sonuna mutlaka konmal\u0131d\u0131r.</li>
            </ul>
          </div>
        `,
        quiz: {
          id: "quiz-1-1",
          question: "8086 mimarisinde 20-bit fiziksel adres hesaplama ve bellekten komut getirme i\u015Flemlerini hangi donan\u0131m birimi y\xFCr\xFCt\xFCr?",
          options: [
            "EU (Execution Unit)",
            "BIU (Bus Interface Unit)",
            "ALU (Aritmetik Mant\u0131k Birimi)",
            "Flags Register"
          ],
          correctIndex: 1,
          explanation: "BIU (Bus Interface Unit), segment yazma\xE7lar\u0131n\u0131 kullanarak fiziksel adresi hesaplayan ve sistem veriyollar\u0131ndan komut getiren birimdir."
        },
        task: {
          id: "task-1-regs-init",
          title: "Genel Ama\xE7l\u0131 Yazma\xE7lar\u0131 Haz\u0131rlama",
          difficulty: "Kolay",
          scenario: "\u0130\u015Flemcinin veri yazma\xE7lar\u0131n\u0131 (AX, BX, CX, DX) ba\u015Flang\u0131\xE7 de\u011Ferleriyle doldurmam\u0131z isteniyor.",
          taskPrompt: "AX yazmac\u0131na 1234H, BX yazmac\u0131na 5678H, CX yazmac\u0131na 0010H y\xFCkleyin ve program\u0131 HLT ile sonland\u0131r\u0131n.",
          starterCode: `; 1.1 Genel Yazma\xE7lar\u0131 Ba\u015Flatma
ORG 100h

; AX'e 1234h, BX'e 5678h, CX'e 10h y\xFCkleyin:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 1234h
MOV BX, 5678h
MOV CX, 0010h
HLT
`,
          hints: ["MOV hedef, kaynak komutunu kullan\u0131n.", 'Hex de\u011Ferlerin sonuna "h" harfi koymay\u0131 unutmay\u0131n.'],
          assertions: {
            registers: { ax: 4660, bx: 22136, cx: 16 },
            maxSteps: 50
          },
          examTip: "AX, BX, CX, DX 16-bittir ve y\xFCksek/d\xFC\u015F\xFCk 8-bitlik par\xE7alar\u0131na (AH/AL, BH/BL vb.) ba\u011F\u0131ms\u0131z eri\u015Filebilir."
        }
      },
      {
        id: "sub-1-physical-addr",
        number: "1.2",
        title: "20-Bit Fiziksel Adres Form\xFCl\xFC & Little-Endian",
        summary: "Segment \xD7 16 + Offset form\xFCl\xFC, 1 MB bellek haritas\u0131 ve d\xFC\u015F\xFCk bayt\u0131n \xF6nce saklanmas\u0131.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">20-Bit Fiziksel Adres Form\xFCl\xFC</h4>
            <p>8086 yazma\xE7lar\u0131 16-bit olmas\u0131na ra\u011Fmen adres veriyolu 20-bit (1 MB) geni\u015Fli\u011Findedir. Bu adres \u015Fu form\xFClle \xFCretilir:</p>
            <div class="nb-formula-box">
              <code>Fiziksel Adres (PA) = (Segment \xD7 10H) + Offset = (Segment \xD7 16) + Offset</code>
            </div>
            <p>\xD6rne\u011Fin: <code>DS = 1230H</code> ve <code>SI = 0045H</code> ise:</p>
            <pre class="nb-code-sample">Segment:  12300H   (Segment 1 hex basama\u011F\u0131 sola kayd\u0131r\u0131ld\u0131, yani x16)
Offset:  + 0045H
PA:        12345H   (20-Bit Fiziksel Bellek Adresi)</pre>

            <h4 class="nb-title" style="margin-top: 16px;">K\xF6\u015Feli Parantez [...] ile Belle\u011Fe Yazma</h4>
            <p>Bir yazma\xE7taki veriyi belle\u011Fin (RAM) belirli bir ofset adresine kaydetmek i\xE7in k\xF6\u015Feli parantez <code>[ofset]</code> s\xF6zdizimi kullan\u0131l\u0131r:</p>
            <div class="nb-formula-box">
              <code>MOV [ofset_adresi], yazmac   ; Yazma\xE7taki veriyi o bellek adresine yazar</code>
            </div>
            <p>\xD6rne\u011Fin <code>MOV [0200h], AX</code> komutu, AX yazmac\u0131ndaki 16-bitlik veriyi belle\u011Fin <code>0200h</code> adresine depolar.</p>

            <h4 class="nb-title" style="margin-top: 16px;">Little-Endian Prensibi (D\xFC\u015F\xFCk Bayt \xD6nce)</h4>
            <p>8086 mimarisinde \xE7ok baytl\u0131 (16-bit Word) bir veri belle\u011Fe yaz\u0131l\u0131rken baytlar \u015Fu s\u0131rayla yerle\u015Ftirilir:</p>
            <ul>
              <li><strong>D\xFC\u015F\xFCk Anlaml\u0131 Bayt (Low Byte):</strong> D\xFC\u015F\xFCk adrese (taban adres) yaz\u0131l\u0131r.</li>
              <li><strong>Y\xFCksek Anlaml\u0131 Bayt (High Byte):</strong> Y\xFCksek adrese (taban + 1) yaz\u0131l\u0131r.</li>
            </ul>
            <div class="nb-callout warning">
              \u{1F6A8} <strong>\xD6nemli \xD6rnek:</strong> <code>AX = 4A8Fh</code> iken <code>MOV [0200h], AX</code> komutu \xE7al\u0131\u015Ft\u0131r\u0131ld\u0131\u011F\u0131nda belle\u011Fin durumu:
              <br>\u2022 <code>[0200h]</code> adresinde: <strong>8Fh</strong> (D\xFC\u015F\xFCk bayt)
              <br>\u2022 <code>[0201h]</code> adresinde: <strong>4Ah</strong> (Y\xFCksek bayt) saklan\u0131r!
            </div>
          </div>
        `,
        quiz: {
          id: "quiz-1-2",
          question: "DS = 2000H ve BX = 0150H oldu\u011Funda i\u015Flemcinin okuyaca\u011F\u0131 20-bitlik fiziksel adres nedir?",
          options: [
            "20150H",
            "21500H",
            "20050H",
            "02150H"
          ],
          correctIndex: 0,
          explanation: "Fiziksel Adres = (2000H \xD7 10H) + 0150H = 20000H + 0150H = 20150H."
        },
        task: {
          id: "task-1-little-endian",
          title: "Little-Endian Prensibi ile Belle\u011Fe Yazma",
          difficulty: "Kolay",
          scenario: "Belle\u011Fin [0200h] adresine 16-bitlik 4A8Fh de\u011Ferini yazarak Little-Endian s\u0131ralamas\u0131n\u0131 test edin.",
          taskPrompt: "AX yazmac\u0131na 4A8Fh y\xFCkleyin ve bu 16-bitlik veriyi [0200h] adresine aktar\u0131n. HLT ile bitirin.",
          starterCode: `; 1.2 Little-Endian Bellek Yaz\u0131m\u0131
ORG 100h

; AX'e 4A8Fh y\xFCkleyin, ard\u0131ndan [0200h]'e yaz\u0131n:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 4A8Fh
MOV [0200h], AX
HLT
`,
          hints: ["MOV [0200h], AX komutunu kullan\u0131n."],
          assertions: {
            registers: { ax: 19087 },
            memory: [
              { segment: 0, offset: 512, expectedBytes: [143, 74] }
            ],
            maxSteps: 50
          },
          examTip: "S\u0131navlarda 0200h adresindeki bayt soruldu\u011Funda 8Fh, 0201h adresindeki bayt soruldu\u011Funda 4Ah cevab\u0131 verilmelidir."
        }
      }
    ]
  },
  // =========================================================================
  // 2. VERİ AKTARIMI VE 7 ADRESLEME MODU
  // =========================================================================
  {
    id: "topic-2-addressing",
    number: 2,
    title: "Veri Aktar\u0131m\u0131 & 7 Adresleme Modu (MOV, XCHG, LEA)",
    shortTitle: "2. Adresleme Modlar\u0131 & MOV",
    badge: "TEMEL KOMUTLAR",
    icon: "\u{1F4E6}",
    summary: "MOV ve XCHG komut kurallar\u0131, bellek-bellek k\u0131s\u0131tlamas\u0131, LEA ile ofset y\xFCkleme ve 7 bellek adresleme modu.",
    opcodes: ["MOV", "XCHG", "LEA", "OFFSET"],
    mindMap: {
      x: 35,
      y: 20,
      connections: ["topic-3-arithmetic"]
    },
    subLessons: [
      {
        id: "sub-2-mov-rules",
        number: "2.1",
        title: "MOV ve XCHG Komutlar\u0131n\u0131n Kesin Kurallar\u0131",
        summary: "Hedef/kaynak boyut uyumu, CS yazmac\u0131na yazma yasa\u011F\u0131 ve bayrak etkile\u015Fimi.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">MOV Komutunun 4 Alt\u0131n Kural\u0131</h4>
            <ul>
              <li><strong>1. Boyut Uyumu:</strong> Her iki operand ayn\u0131 boyutta olmal\u0131d\u0131r (8-bit ile 8-bit, 16-bit ile 16-bit). <code>MOV AL, BX ; HATA!</code></li>
              <li><strong>2. Bellekten Belle\u011Fe Yasakt\u0131r:</strong> Tek bir MOV komutu ile do\u011Frudan RAM'den RAM'e kopyalama yap\u0131lamaz. <code>MOV [0100h], [0200h] ; HATA!</code> (Araya yazma\xE7 girmelidir).</li>
              <li><strong>3. Segment Yazma\xE7lar\u0131na Do\u011Frudan Sabit Atanamaz:</strong> <code>MOV DS, 1000h ; HATA!</code> (\xD6nce AX'e, oradan DS'ye aktar\u0131l\u0131r).</li>
              <li><strong>4. CS De\u011Fi\u015Ftirilemez & Bayraklar Etkilenmez:</strong> MOV ve XCHG komutlar\u0131 bayraklar\u0131 (CF, ZF vb.) <strong>ASLA DE\u011E\u0130\u015ET\u0130RMEZ!</strong></li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">Bellek Boyut Belirte\xE7leri: WORD PTR ve BYTE PTR</h4>
            <p>Sabit bir say\u0131y\u0131 do\u011Frudan bir bellek adresine yazarken derleyici belle\u011Fe 1 bayt m\u0131 yoksa 2 bayt (Word) m\u0131 yaz\u0131laca\u011F\u0131n\u0131 bilemez:</p>
            <pre class="nb-code-sample">MOV [0200h], 9999h            ; HATA! Boyut belirsiz (Ambiguous size)
MOV WORD PTR [0200h], 9999h   ; DO\u011ERU: 16-bit (2 bayt) kelime yazar
MOV BYTE PTR [0200h], 77h     ; DO\u011ERU: 8-bit (1 bayt) yazar</pre>

            <h4 class="nb-title" style="margin-top: 16px;">XCHG (Exchange - Kar\u015F\u0131l\u0131kl\u0131 De\u011Fer Takas\u0131)</h4>
            <p>\u0130ki operand\u0131n de\u011Ferini atomik olarak birbirleriyle yer de\u011Fi\u015Ftirir. \xDC\xE7\xFCnc\xFC bir ge\xE7ici yazma\xE7 kullanma ihtiyac\u0131n\u0131 ortadan kald\u0131r\u0131r:</p>
            <div class="nb-formula-box">
              <code>XCHG operand1, operand2   ; operand1 <-> operand2 de\u011Ferlerini takas eder</code>
            </div>
            <pre class="nb-code-sample">MOV AX, 1111h
MOV WORD PTR [0200h], 9999h
XCHG AX, [0200h]   ; AX art\u0131k 9999h, belle\u011Fin [0200h] adresi ise 1111h olur!</pre>
            <div class="nb-callout tip">
              \u{1F4A1} <strong>K\u0131s\u0131tlama:</strong> XCHG komutu iki bellek adresi aras\u0131nda veya segment yazma\xE7lar\u0131yla kullan\u0131lamaz.
            </div>
          </div>
        `,
        quiz: {
          id: "quiz-2-1",
          question: "A\u015Fa\u011F\u0131daki 8086 Assembly komutlar\u0131ndan hangisi sentaktik olarak GE\xC7ERL\u0130D\u0130R?",
          options: [
            "MOV [0100h], [0200h]",
            "MOV DS, 2000h",
            "MOV AX, [0100h]",
            "MOV CS, AX"
          ],
          correctIndex: 2,
          explanation: "Bellekten yazmaca (MOV AX, [0100h]) ge\xE7erlidir. RAM-RAM aktar\u0131m\u0131, DS'ye do\u011Frudan sabit y\xFCkleme ve CS'ye do\u011Frudan yazma donan\u0131msal olarak yasakt\u0131r."
        },
        task: {
          id: "task-2-xchg-swap",
          title: "XCHG ile Bellek ve Yazma\xE7 Takas\u0131",
          difficulty: "Kolay",
          scenario: "AX yazmac\u0131ndaki de\u011Feri [0200h] adresindeki veri ile takas etmeniz gerekiyor.",
          taskPrompt: "AX'e 1111h y\xFCkleyin, [0200h] adresine 9999h yaz\u0131n. Ard\u0131ndan XCHG ile AX ile [0200h]'\u0131 takas edin. HLT ile bitirin.",
          starterCode: `; 2.1 XCHG ile Takas
ORG 100h

; AX'e 1111h y\xFCkleyin:
; [0200h] adresine 9999h yaz\u0131n:
; XCHG ile takas edin:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 1111h
MOV WORD PTR [0200h], 9999h
XCHG AX, [0200h]
HLT
`,
          hints: ["XCHG AX, [0200h] komutu iki taraf\u0131 yer de\u011Fi\u015Ftirir."],
          assertions: {
            registers: { ax: 39321 },
            memory: [
              { segment: 0, offset: 512, expectedBytes: [17, 17] }
            ],
            maxSteps: 50
          },
          examTip: "XCHG komutu ge\xE7ici bir yazmaca ihtiya\xE7 duymadan atomik takas sa\u011Flar."
        }
      },
      {
        id: "sub-2-addressing-modes",
        number: "2.2",
        title: "7 Adresleme Modu & LEA Komutu",
        summary: "Do\u011Frudan, yazma\xE7, taban, indeksli, taban-indeksli adresleme ve LEA ofset hesaplama.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">8086'n\u0131n 7 Bellek Adresleme Modu</h4>
            <div class="nb-table-wrap">
              <table class="nb-table">
                <thead>
                  <tr><th>Adresleme Modu</th><th>\xD6rnek Komut</th><th>A\xE7\u0131klama</th></tr>
                </thead>
                <tbody>
                  <tr><td>1. \u0130vedi (Immediate)</td><td><code>MOV AX, 1234H</code></td><td>Sabit de\u011Fer do\u011Frudan komuttad\u0131r.</td></tr>
                  <tr><td>2. Yazma\xE7 (Register)</td><td><code>MOV AX, BX</code></td><td>Yazma\xE7tan yazmaca kopyalama.</td></tr>
                  <tr><td>3. Do\u011Frudan (Direct)</td><td><code>MOV AX, [0100H]</code></td><td>Sabit bellek adresinden okuma.</td></tr>
                  <tr><td>4. Tabanl\u0131 (Based)</td><td><code>MOV AX, [BX]</code> veya <code>[BP]</code></td><td>BX veya BP i\xE7indeki adresi ofset al\u0131r.</td></tr>
                  <tr><td>5. \u0130ndeksli (Indexed)</td><td><code>MOV AX, [SI]</code> veya <code>[DI]</code></td><td>SI veya DI i\xE7indeki ofseti kullan\u0131r.</td></tr>
                  <tr><td>6. Taban-\u0130ndeksli</td><td><code>MOV AX, [BX+SI]</code></td><td>BX ve SI toplanarak nihai ofset bulunur.</td></tr>
                  <tr><td>7. Deplasmanl\u0131</td><td><code>MOV AX, [BX+DI+4]</code></td><td>Taban, indeks ve sabit ofset toplan\u0131r.</td></tr>
                </tbody>
              </table>
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">Taban-\u0130ndeksli Adresleme [BX+SI] Uygulamas\u0131</h4>
            <p>Dizilerde gezinirken taban yazmac\u0131 (<code>BX</code>) dizinin ba\u015Flang\u0131\xE7 adresini, indeks yazmac\u0131 (<code>SI</code>) ise aranacak eleman\u0131n s\u0131ras\u0131n\u0131 tutar:</p>
            <pre class="nb-code-sample">MOV BX, 0200h               ; Taban adresi: 0200h
MOV SI, 0004h               ; \u0130ndeks ofseti: +4 bayt
MOV BYTE PTR [0204h], 77h   ; 0204h adresine 77h bayt\u0131n\u0131 yazal\u0131m
MOV AL, [BX+SI]             ; AL = [0200h + 0004h] = [0204h] adresindeki 77h de\u011Ferini okur!</pre>

            <h4 class="nb-title" style="margin-top: 16px;">LEA (Load Effective Address) Komutu</h4>
            <p><code>LEA</code> komutu k\xF6\u015Feli parantez i\xE7indeki adres matematiksel form\xFCl\xFCn\xFC hesaplar fakat <strong>asla RAM'e gidip okuma yapmaz</strong>; sadece hesaplanan ofset de\u011Ferini yazmaca y\xFCkler:</p>
            <div class="nb-formula-box">
              <code>LEA yazmac, [adres_ifadesi]   ; Sadece ofset adresini hesaplar</code>
            </div>
            <pre class="nb-code-sample">; BX = 0100H ve SI = 0020H iken:
LEA AX, [BX+SI+5]   ; AX = 0100H + 0020H + 5 = 0125H olur! (RAM okunmaz)
MOV AX, [BX+SI+5]   ; RAM'deki 0125H adresinde saklanan veriyi AX'e okur!</pre>
          </div>
        `,
        quiz: {
          id: "quiz-2-2",
          question: 'BX = 0100H ve SI = 0020H iken "LEA AX, [BX+SI+5]" komutu \xE7al\u0131\u015F\u0131rsa AX ne olur?',
          options: [
            "0125H",
            "0120H",
            "Bellekteki 0125H adresinin i\xE7eri\u011Fi",
            "Hata verir"
          ],
          correctIndex: 0,
          explanation: "LEA belle\u011Fi okumaz; sadece adresi (0100H + 0020H + 5 = 0125H) hesaplay\u0131p do\u011Frudan AX'e yazar."
        },
        task: {
          id: "task-2-lea-pointer",
          title: "LEA ile Ofset Hesaplama ve Bellek Okuma",
          difficulty: "Kolay",
          scenario: "Dizi eleman\u0131na taban ve indeks adresleme ile eri\u015Fip de\u011Feri AX yazmac\u0131na okuyun.",
          taskPrompt: "BX = 0200h, SI = 0004h yap\u0131n. [0204h] adresine 77h yaz\u0131n. [BX+SI] adresleme modu ile bu bayt\u0131 AL yazmac\u0131na okuyun. HLT ile bitirin.",
          starterCode: `; 2.2 Taban + \u0130ndeks Adresleme
ORG 100h

; BX = 0200h, SI = 0004h yap\u0131n:
; [0204h] adresine 77h bayt\u0131n\u0131 yaz\u0131n:
; MOV AL, [BX+SI] ile okuyun:


HLT
`,
          solutionCode: `ORG 100h
MOV BX, 0200h
MOV SI, 0004h
MOV BYTE PTR [0204h], 77h
MOV AL, [BX+SI]
HLT
`,
          hints: ["MOV AL, [BX+SI] komutu do\u011Frudan BX+SI adresindeki bayt\u0131 okur."],
          assertions: {
            registers: { al: 119, bx: 512, si: 4 },
            maxSteps: 50
          },
          examTip: "K\xF6\u015Feli parantez i\xE7inde sadece BX, BP, SI ve DI yazma\xE7lar\u0131 kullan\u0131labilir. [AX] veya [CX] kesinlikle YASAKTIR!"
        }
      }
    ]
  },
  // =========================================================================
  // 3. ARİTMETİK İŞLEMLER VE BAYRAK MEKANİĞİ
  // =========================================================================
  {
    id: "topic-3-arithmetic",
    number: 3,
    title: "Aritmetik \u0130\u015Flemler & Bayrak Mekani\u011Fi (ADD, SUB, CMP, MUL, DIV)",
    shortTitle: "3. Aritmetik & Bayraklar",
    badge: "HESAPLAMA & MANTIK",
    icon: "\u2795",
    summary: "CF, ZF, SF, OF, AF, PF bayraklar\u0131n\u0131n davran\u0131\u015Flar\u0131, INC/DEC istisnas\u0131, CMP mant\u0131\u011F\u0131, \xE7arpma ve b\xF6lme mekanizmas\u0131.",
    opcodes: ["ADD", "ADC", "SUB", "SBB", "INC", "DEC", "CMP", "MUL", "DIV"],
    mindMap: {
      x: 55,
      y: 20,
      connections: ["topic-4-logic"]
    },
    subLessons: [
      {
        id: "sub-3-flags-rules",
        number: "3.1",
        title: "Durum Bayraklar\u0131 ve INC/DEC \u0130stisnas\u0131",
        summary: "Elde (CF), S\u0131f\u0131r (ZF), \u0130\u015Faret (SF), Ta\u015Fma (OF) bayraklar\u0131 ve INC/DEC kural\u0131.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Durum Bayraklar\u0131 Tablosu (FLAGS Register)</h4>
            <p>Aritmetik ve mant\u0131ksal i\u015Flemlerin sonucuna g\xF6re EU i\xE7indeki FLAGS yazmac\u0131nda \u015Fu bayraklar otomatik g\xFCncellenir:</p>
            <ul>
              <li><strong>CF (Carry Flag - Elde/Bor\xE7 Bayra\u011F\u0131):</strong> \u0130\u015Faretsiz toplamada ta\u015Fma veya \xE7\u0131karmada bor\xE7 olu\u015Ftu\u011Funda 1 olur.</li>
              <li><strong>ZF (Zero Flag - S\u0131f\u0131r Bayra\u011F\u0131):</strong> \u0130\u015Flem sonucu tam olarak 0 oldu\u011Funda 1 olur.</li>
              <li><strong>SF (Sign Flag - \u0130\u015Faret Bayra\u011F\u0131):</strong> Sonucun en y\xFCksek biti 1 (negatif) ise 1 olur.</li>
              <li><strong>OF (Overflow Flag - Ta\u015Fma Bayra\u011F\u0131):</strong> \u0130\u015Faretli say\u0131larda kapasite ta\u015Fmas\u0131 (\xF6rn. pozitif + pozitif = negatif) oldu\u011Funda 1 olur.</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">Temel Aritmetik: ADD ve SUB Komutlar\u0131</h4>
            <p>8086'da iki say\u0131y\u0131 toplamak veya \xE7\u0131karmak i\xE7in <code>ADD</code> ve <code>SUB</code> kullan\u0131l\u0131r. Bu komutlar CF, ZF, SF, OF bayraklar\u0131n\u0131n hepsini g\xFCnceller:</p>
            <div class="nb-formula-box">
              <code>ADD hedef, kaynak   ; hedef = hedef + kaynak<br>SUB hedef, kaynak   ; hedef = hedef - kaynak</code>
            </div>
            <pre class="nb-code-sample">MOV AX, 10
ADD AX, 5    ; AX = 15 olur.
SUB AX, 15   ; AX = 0 olur &rarr; ZF = 1 kurulur!</pre>

            <div class="nb-callout warning">
              \u{1F6A8} <strong>\xC7ok \xD6nemli S\u0131nav Kural\u0131 (INC & DEC \u0130stisnas\u0131):</strong><br>
              <code>INC</code> (+1) ve <code>DEC</code> (-1) komutlar\u0131 ZF, SF, OF bayraklar\u0131n\u0131 g\xFCnceller; fakat <strong>CF (Elde Bayra\u011F\u0131) ASLA DE\u011E\u0130\u015EMEZ!</strong><br>
              \xD6rne\u011Fin <code>AL = 0FFH</code> iken <code>INC AL</code> yap\u0131l\u0131rsa <code>AL = 00H</code> olur ve <code>ZF = 1</code> kurulur ama <strong>CF = 0</strong> kal\u0131r!
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">CMP (Compare - Kar\u015F\u0131la\u015Ft\u0131rma) Komutu</h4>
            <p><code>CMP hedef, kaynak</code> komutu arka planda sanal bir <code>hedef - kaynak</code> \xE7\u0131karmas\u0131 yapar. En \xF6nemli \xF6zelli\u011Fi: <strong>hedef operand\u0131n de\u011Ferini ASLA DE\u011E\u0130\u015ET\u0130RMEZ</strong>, sadece bayraklar\u0131 kurar!</p>
            <ul>
              <li><strong>E\u011Fer hedef == kaynak ise:</strong> \xC7\u0131karma sonucu 0 olaca\u011F\u0131ndan <strong><code>ZF = 1</code></strong> ve <code>CF = 0</code> olur.</li>
              <li><strong>E\u011Fer hedef &lt; kaynak ise:</strong> \u0130\u015Faretsiz \xE7\u0131karmada bor\xE7 gerekti\u011Finden <strong><code>CF = 1</code></strong> olur.</li>
              <li><strong>E\u011Fer hedef &gt; kaynak ise:</strong> <code>ZF = 0</code> ve <code>CF = 0</code> kal\u0131r.</li>
            </ul>
            <pre class="nb-code-sample">MOV AL, 50h
MOV BL, 50h
CMP AL, BL   ; AL ve BL e\u015Fittir. De\u011Ferler bozulmaz, ZF = 1 kurulur!</pre>
          </div>
        `,
        quiz: {
          id: "quiz-3-1",
          question: 'AL = 0FFH iken "INC AL" komutu y\xFCr\xFCt\xFCl\xFCrse CF ve ZF bayraklar\u0131n\u0131n durumu ne olur?',
          options: [
            "CF = 1, ZF = 1",
            "CF = 0, ZF = 1 (INC elde bayra\u011F\u0131n\u0131 etkilemez)",
            "CF = 1, ZF = 0",
            "CF = 0, ZF = 0"
          ],
          correctIndex: 1,
          explanation: "INC komutu hi\xE7bir zaman CF bayra\u011F\u0131n\u0131 de\u011Fi\u015Ftirmez (CF eski de\u011Ferini korur). Sonu\xE7 00H oldu\u011Fu i\xE7in ZF = 1 olur."
        },
        task: {
          id: "task-3-cmp-flags",
          title: "CMP ile Bayrak Kurulumu",
          difficulty: "Kolay",
          scenario: "\u0130ki de\u011Feri CMP ile kar\u015F\u0131la\u015Ft\u0131rarak ZF ve CF bayraklar\u0131n\u0131 g\xF6zlemleyin.",
          taskPrompt: "AL = 50h yap\u0131n, ard\u0131ndan BL = 50h yap\u0131n. CMP AL, BL \xE7al\u0131\u015Ft\u0131r\u0131n. B\xF6ylece ZF=1 olsun. HLT ile bitirin.",
          starterCode: `; 3.1 CMP ile Kar\u015F\u0131la\u015Ft\u0131rma
ORG 100h

; AL = 50h ve BL = 50h y\xFCkleyin:
; CMP AL, BL \xE7al\u0131\u015Ft\u0131r\u0131n:


HLT
`,
          solutionCode: `ORG 100h
MOV AL, 50h
MOV BL, 50h
CMP AL, BL
HLT
`,
          hints: ["CMP AL, BL komutunu yaz\u0131n."],
          assertions: {
            registers: { al: 80, bl: 80 },
            flags: { zf: 1, cf: 0 },
            maxSteps: 50
          },
          examTip: "E\u011Fer hedef = kaynak ise CMP sonucu ZF=1 ve CF=0 olur. Hedef < kaynak ise i\u015Faretsiz kar\u015F\u0131la\u015Ft\u0131rmada CF=1 olur."
        }
      },
      {
        id: "sub-3-mul-div",
        number: "3.2",
        title: "\xC7arpma (MUL) ve B\xF6lme (DIV) Mekanizmas\u0131",
        summary: "Gizli yazma\xE7lar AX ve DX kullan\u0131m\u0131, b\xF6l\xFCm ve kalan sonu\xE7lar\u0131.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">MUL ve DIV Gizli Yazma\xE7 Donan\u0131m\u0131</h4>
            <p>8086 mimarisinde \xE7arpma ve b\xF6lme komutlar\u0131nda birinci operand komut sat\u0131r\u0131nda yaz\u0131lmaz; donan\u0131msal olarak ak\xFCm\xFClat\xF6r (<code>AX</code>) ve veri (<code>DX</code>) yazma\xE7lar\u0131na kilitlidir:</p>
            <div class="nb-grid-2">
              <div class="nb-card">
                <h5>\u2716\uFE0F MUL (\u0130\u015Faretsiz \xC7arpma)</h5>
                <ul>
                  <li><strong>8-bit:</strong> <code>MUL BL</code> &rarr; <code>AX = AL \xD7 BL</code> (\xC7arpan AL'dedir, sonu\xE7 16-bit AX'e yaz\u0131l\u0131r).</li>
                  <li><strong>16-bit:</strong> <code>MUL BX</code> &rarr; <code>DX:AX = AX \xD7 BX</code> (Y\xFCksek 16 bit DX'e, d\xFC\u015F\xFCk 16 bit AX'e yaz\u0131l\u0131r).</li>
                </ul>
              </div>
              <div class="nb-card">
                <h5>\u2797 DIV (\u0130\u015Faretsiz B\xF6lme)</h5>
                <ul>
                  <li><strong>8-bit:</strong> <code>DIV BL</code> &rarr; <code>AX / BL</code> &rarr; B\xF6l\xFCm <code>AL</code>, Kalan <code>AH</code></li>
                  <li><strong>16-bit:</strong> <code>DIV BX</code> &rarr; <code>DX:AX / BX</code> &rarr; B\xF6l\xFCm <code>AX</code>, Kalan <code>DX</code></li>
                </ul>
              </div>
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">8-Bit DIV \u0130\u015Fleminin Ad\u0131m Ad\u0131m Kurulumu</h4>
            <p>8-bit bir say\u0131ya b\xF6lme yaparken b\xF6l\xFCnen say\u0131y\u0131 mutlaka 16-bitlik <code>AX</code> yazmac\u0131na, b\xF6leni ise 8-bitlik bir yazmaca (\xF6rn. <code>BL</code>) koymal\u0131s\u0131n\u0131z:</p>
            <pre class="nb-code-sample">MOV AX, 100   ; B\xF6l\xFCnen (100) AX yazmac\u0131na konur
MOV BL, 7     ; B\xF6len (7) BL yazmac\u0131na konur
DIV BL        ; 100 / 7 i\u015Flemi yap\u0131l\u0131r:
              ; Sonu\xE7: B\xF6l\xFCm AL = 14 (0Eh), Kalan AH = 2 (02h) olur!</pre>
            <div class="nb-callout tip">
              \u{1F4A1} <strong>S\u0131nav Sorusu \xD6rne\u011Fi:</strong> 25 say\u0131s\u0131n\u0131 4'e b\xF6lersek (<code>AX = 25, BL = 4, DIV BL</code>); b\xF6l\xFCm <code>AL = 6</code>, kalan <code>AH = 1</code> olur.
            </div>
          </div>
        `,
        quiz: {
          id: "quiz-3-2",
          question: 'AX = 0019H (ondal\u0131k 25) iken BL = 04H atan\u0131p "DIV BL" \xE7al\u0131\u015Ft\u0131r\u0131l\u0131rsa AL (b\xF6l\xFCm) ve AH (kalan) ne olur?',
          options: [
            "AL = 06H, AH = 01H",
            "AL = 01H, AH = 06H",
            "AL = 04H, AH = 01H",
            "AL = 25H, AH = 00H"
          ],
          correctIndex: 0,
          explanation: "25 / 4 = 6 b\xF6l\xFCm (AL = 06H), 1 kalan (AH = 01H)."
        },
        task: {
          id: "task-3-div-operation",
          title: "DIV ile B\xF6l\xFCm ve Kalan\u0131 Hesaplama",
          difficulty: "Orta",
          scenario: "100 say\u0131s\u0131n\u0131 7'ye b\xF6l\xFCp b\xF6l\xFCm\xFC AL'de, kalan\u0131 AH'de elde edin.",
          taskPrompt: "AX'e 100 (ondal\u0131k 100 veya 64h), BL'ye 7 y\xFCkleyin. DIV BL \xE7al\u0131\u015Ft\u0131r\u0131n ve HLT ile sonland\u0131r\u0131n.",
          starterCode: `; 3.2 8-Bit DIV \u0130\u015Flemi
ORG 100h

; AX = 100 ve BL = 7 y\xFCkleyin:
; DIV BL \xE7al\u0131\u015Ft\u0131r\u0131n:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 100
MOV BL, 7
DIV BL
HLT
`,
          hints: ["MOV AX, 100 ve MOV BL, 7 ard\u0131ndan DIV BL yaz\u0131n."],
          assertions: {
            registers: { al: 14, ah: 2 },
            maxSteps: 50
          },
          examTip: "100 / 7 = 14 (AL = 0Eh), Kalan = 2 (AH = 02h)."
        }
      }
    ]
  },
  // =========================================================================
  // 4. MANTIKSAL İŞLEMLER VE BİT KAYDIRMA
  // =========================================================================
  {
    id: "topic-4-logic",
    number: 4,
    title: "Mant\u0131ksal \u0130\u015Flemler, Maskeleme & Bit Kayd\u0131rma",
    shortTitle: "4. Mant\u0131k & Bit Kayd\u0131rma",
    badge: "B\u0130T MAN\u0130P\xDCLASYONU",
    icon: "\u{1F500}",
    summary: "AND ile maskeleme, OR ile bit kurma, XOR ile s\u0131f\u0131rlama, TEST komutu ve SHL/SHR/ROL/ROR kayd\u0131rmalar\u0131.",
    opcodes: ["AND", "OR", "XOR", "NOT", "TEST", "SHL", "SHR", "SAR", "ROL", "ROR"],
    mindMap: {
      x: 75,
      y: 20,
      connections: ["topic-5-control-flow"]
    },
    subLessons: [
      {
        id: "sub-4-bitwise-mask",
        number: "4.1",
        title: "Mant\u0131ksal Kap\u0131lar & Maskeleme (AND, OR, XOR, TEST)",
        summary: "AND ile bit temizleme, OR ile bit 1 yapma, XOR AX, AX optimizasyonu ve TEST komutu.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Bit D\xFCzeyinde Mant\u0131k \u0130\u015Flemleri</h4>
            <ul>
              <li><code>AND</code>: Belirli bitleri s\u0131f\u0131rlamak (maskelemek) i\xE7in kullan\u0131l\u0131r. <code>AND AL, 0FH</code> alt 4 biti korur, \xFCst 4 biti 0 yapar.</li>
              <li><code>OR</code>: Belirli bitleri 1 yapmak i\xE7in kullan\u0131l\u0131r. <code>OR AL, 20H</code> 5. biti 1 yapar.</li>
              <li><code>XOR</code>: Farkl\u0131 bitleri 1, ayn\u0131 bitleri 0 yapar. Bir yazma\xE7 kendisiyle XOR'lan\u0131rsa (<code>XOR AX, AX</code>) yazma\xE7 0 olur ve <code>ZF = 1</code> kurulur.</li>
              <li><code>TEST</code>: Mant\u0131ksal AND i\u015Flemi yapar fakat <strong>hedefin de\u011Ferini ASLA DE\u011E\u0130\u015ET\u0130RMEZ</strong>; sadece bayraklar\u0131 (\xF6zellikle ZF) g\xFCnceller.</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">S\u0131nav Klasi\u011Fi: TEST ile Tek/\xC7ift Say\u0131 Tespiti</h4>
            <p>Bir say\u0131n\u0131n ikili (binary) tabanda tek veya \xE7ift oldu\u011Funu belirleyen tek \u015Fey <strong>en d\xFC\u015F\xFCk bitidir (Bit 0)</strong>:</p>
            <ul>
              <li>Bit 0 = 0 ise say\u0131 <strong>\xC7\u0130FT</strong>'tir.</li>
              <li>Bit 0 = 1 ise say\u0131 <strong>TEK</strong>'tir.</li>
            </ul>
            <div class="nb-formula-box">
              <code>TEST reg, 1   ; En d\xFC\u015F\xFCk biti test eder, reg de\u011Ferini bozmaz!</code>
            </div>
            <p>Bu komut y\xFCr\xFCt\xFCld\xFC\u011F\xFCnde:</p>
            <ul>
              <li>E\u011Fer say\u0131 <strong>\xC7\u0130FT</strong> ise: <code>0 AND 1 = 0</code> olaca\u011F\u0131ndan sonu\xE7 s\u0131f\u0131rd\u0131r &rarr; <strong><code>ZF = 1</code></strong> kurulur!</li>
              <li>E\u011Fer say\u0131 <strong>TEK</strong> ise: <code>1 AND 1 = 1</code> olaca\u011F\u0131ndan sonu\xE7 s\u0131f\u0131r de\u011Fildir &rarr; <strong><code>ZF = 0</code></strong> kal\u0131r!</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">XOR ile S\u0131f\u0131rlama Optimizasyonu</h4>
            <p><code>XOR AX, AX</code> komutu, <code>MOV AX, 0</code> yerine tercih edilir \xE7\xFCnk\xFC hem daha az bayt makine kodu \xFCretir hem de i\u015Flemcide daha h\u0131zl\u0131 \xE7al\u0131\u015F\u0131r.</p>
          </div>
        `,
        quiz: {
          id: "quiz-4-1",
          question: "Bir yazma\xE7taki say\u0131n\u0131n tek mi \xE7ift mi oldu\u011Funu say\u0131n\u0131n de\u011Ferini bozmadan anlamak i\xE7in hangi komut kullan\u0131lmal\u0131d\u0131r?",
          options: [
            "TEST reg, 1",
            "AND reg, 0",
            "OR reg, 1",
            "XOR reg, reg"
          ],
          correctIndex: 0,
          explanation: "TEST reg, 1 komutu en d\xFC\u015F\xFCk biti test eder; say\u0131 \xE7iftse sonu\xE7 0 olup ZF=1 kurulur ve yazma\xE7 de\u011Feri korunur."
        },
        task: {
          id: "task-4-xor-zero",
          title: "XOR ile Yazma\xE7 S\u0131f\u0131rlama ve ZF Bayra\u011F\u0131",
          difficulty: "Kolay",
          scenario: "AX yazmac\u0131n\u0131 en verimli \u015Fekilde s\u0131f\u0131rlay\u0131n ve ZF bayra\u011F\u0131n\u0131n 1 oldu\u011Funu do\u011Frulay\u0131n.",
          taskPrompt: "AX'e FFFFh y\xFCkleyin, ard\u0131ndan XOR AX, AX ile s\u0131f\u0131rlay\u0131n. HLT ile bitirin.",
          starterCode: `; 4.1 XOR ile S\u0131f\u0131rlama
ORG 100h

MOV AX, 0FFFFh
; AX'i XOR ile s\u0131f\u0131rlay\u0131n:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 0FFFFh
XOR AX, AX
HLT
`,
          hints: ["XOR AX, AX komutu AX'i 0000h yapar ve ZF=1 kurar."],
          assertions: {
            registers: { ax: 0 },
            flags: { zf: 1 },
            maxSteps: 50
          },
          examTip: `S\u0131navlarda "Yazmac\u0131 s\u0131f\u0131rlayan ve bayraklar\u0131 etkileyen komut" soruldu\u011Funda cevap XOR reg, reg'dir (MOV bayraklar\u0131 etkilemez).`
        }
      },
      {
        id: "sub-4-shifts-rotates",
        number: "4.2",
        title: "Bit Kayd\u0131rma ve D\xF6nd\xFCrme (SHL, SHR, SAR, ROL)",
        summary: "2 ile \xE7arpma/b\xF6lme, CL sayac\u0131 kural\u0131 ve Carry bayra\u011F\u0131na d\xFC\u015Fen bit.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Bit Kayd\u0131rma ve CL Sayac\u0131 Kural\u0131</h4>
            <p>8086 mimarisinde 1 bitten fazla kayd\u0131rma yap\u0131lacaksa kayd\u0131rma miktar\u0131 do\u011Frudan komut i\xE7ine sabit say\u0131 olarak yaz\u0131lamaz; <strong>mutlaka CL yazmac\u0131nda</strong> verilmelidir:</p>
            <pre class="nb-code-sample">MOV CL, 3
SHL AX, CL   ; DO\u011ERU: AX'i 3 bit sola kayd\u0131r
; SHL AX, 3  ; HATA! 8086'da 1'den b\xFCy\xFCk sabitler desteklenmez, CL \u015Fartt\u0131r.</pre>

            <h4 class="nb-title" style="margin-top: 16px;">Kayd\u0131rma Komutlar\u0131n\u0131n Y\xF6n\xFC ve Davran\u0131\u015F\u0131</h4>
            <ul>
              <li><code>SHL / SAL (Shift Left)</code>: B\xFCt\xFCn bitleri sola kayd\u0131r\u0131r. Sa\u011Fdan 0 girer, en soldan \xE7\u0131kan bit <strong>CF (Carry Flag)</strong> bayra\u011F\u0131na d\xFC\u015Fer.</li>
              <li><code>SHR (Shift Right)</code>: B\xFCt\xFCn bitleri sa\u011Fa kayd\u0131r\u0131r. Soldan 0 girer (i\u015Faretsiz say\u0131larda 2'ye b\xF6lme).</li>
              <li><code>SAR (Shift Arithmetic Right)</code>: Sa\u011Fa kayd\u0131r\u0131rken soldan en y\xFCksek <strong>i\u015Faret bitini (Sign bit) koruyarak</strong> girer (negatif i\u015Faretli b\xF6lme).</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">H\u0131zl\u0131 Matematik: SHL ile 2'nin Kuvvetleriyle \xC7arpma</h4>
            <p>\u0130kili tabanda sola kayd\u0131rma i\u015Flemi i\u015Flemcideki en h\u0131zl\u0131 \xE7arpma y\xF6ntemidir:</p>
            <ul>
              <li>1 bit sola kayd\u0131r &rarr; <strong>&times; 2</strong> ile \xE7arpar.</li>
              <li>2 bit sola kayd\u0131r (<code>CL = 2</code>) &rarr; <strong>&times; 4</strong> ile \xE7arpar. (\xD6rn: <code>5 &times; 4 = 20</code>)</li>
              <li>n bit sola kayd\u0131r &rarr; <strong>&times; 2<sup>n</sup></strong> ile \xE7arpar.</li>
            </ul>
            <pre class="nb-code-sample">MOV AL, 5
MOV CL, 2
SHL AL, CL   ; 5 say\u0131s\u0131n\u0131 2 bit sola kayd\u0131r\u0131r: AL = 20 (14h) olur!</pre>
          </div>
        `,
        quiz: {
          id: "quiz-4-2",
          question: "8086 mimarisinde bir yazmac\u0131 4 bit sa\u011Fa kayd\u0131rmak i\xE7in kayd\u0131rma adedi nerede belirtilmelidir?",
          options: [
            "CL yazmac\u0131nda",
            "CH yazmac\u0131nda",
            "BL yazmac\u0131nda",
            "Do\u011Frudan komutta 4 yaz\u0131lamaz, sadece CL kullan\u0131l\u0131r"
          ],
          correctIndex: 0,
          explanation: "8086 standart ISA kural\u0131na g\xF6re 1'den b\xFCy\xFCk kayd\u0131rma adedi mutlaka CL yazmac\u0131nda verilmelidir."
        },
        task: {
          id: "task-4-shl-multiply",
          title: "SHL ile 4 ile \xC7arpma (2 Bit Sola Kayd\u0131r)",
          difficulty: "Kolay",
          scenario: "AL yazmac\u0131ndaki 5 de\u011Ferini SHL kullanarak 4 ile \xE7arp\u0131n (sonu\xE7 20 olmal\u0131d\u0131r).",
          taskPrompt: "AL = 5 yap\u0131n. CL = 2 yap\u0131n. SHL AL, CL \xE7al\u0131\u015Ft\u0131r\u0131n. HLT ile bitirin.",
          starterCode: `; 4.2 SHL ile H\u0131zl\u0131 \xC7arpma
ORG 100h

; AL = 5 ve CL = 2 y\xFCkleyin:
; SHL AL, CL \xE7al\u0131\u015Ft\u0131r\u0131n:


HLT
`,
          solutionCode: `ORG 100h
MOV AL, 5
MOV CL, 2
SHL AL, CL
HLT
`,
          hints: ["MOV CL, 2 ard\u0131ndan SHL AL, CL yaz\u0131n."],
          assertions: {
            registers: { al: 20 },
            maxSteps: 50
          },
          examTip: "SHL n bit kayd\u0131rma = 2^n ile \xE7arpma. SHR n bit kayd\u0131rma = 2^n ile b\xF6lme anlam\u0131na gelir."
        }
      }
    ]
  },
  // =========================================================================
  // 5. PROGRAM AKIŞ KONTROLÜ, ATLAMA VE DÖNGÜLER
  // =========================================================================
  {
    id: "topic-5-control-flow",
    number: 5,
    title: "Program Ak\u0131\u015F Kontrol\xFC, Ko\u015Fullu Atlamalar & D\xF6ng\xFCler",
    shortTitle: "5. Ak\u0131\u015F & D\xF6ng\xFCler",
    badge: "KONTROL AKI\u015EI",
    icon: "\u{1F504}",
    summary: "Ko\u015Fulsuz JMP, JZ/JNZ, JC/JNC, JA/JB, JG/JL ko\u015Fullu atlamalar\u0131 ve LOOP sayac\u0131 (CX).",
    opcodes: ["JMP", "JZ", "JNZ", "JC", "JNC", "JA", "JB", "JG", "JL", "LOOP", "LOOPZ", "LOOPNZ"],
    mindMap: {
      x: 75,
      y: 50,
      connections: ["topic-6-stack-procedures"]
    },
    subLessons: [
      {
        id: "sub-5-conditional-jumps",
        number: "5.1",
        title: "Ko\u015Fullu Atlamalar (JZ, JNZ, JC, JA/JB, JG/JL)",
        summary: "\u0130\u015Faretsiz (Above/Below) ve i\u015Faretli (Greater/Less) atlama ayr\u0131mlar\u0131.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">S\u0131nav Klasi\u011Fi: \u0130\u015Faretli vs. \u0130\u015Faretsiz Atlamalar</h4>
            <p>8086'da kar\u015F\u0131la\u015Ft\u0131rmadan sonra atlama yap\u0131l\u0131rken say\u0131lar\u0131n t\xFCr\xFCne g\xF6re farkl\u0131 komutlar kullan\u0131l\u0131r:</p>
            <div class="nb-grid-2">
              <div class="nb-card">
                <h5>\u0130\u015Faretsiz Say\u0131lar (Unsigned)</h5>
                <ul>
                  <li><code>JA (Jump if Above)</code>: B\xFCy\xFCkse atla (CF=0 ve ZF=0)</li>
                  <li><code>JB (Jump if Below)</code>: K\xFC\xE7\xFCkse atla (CF=1)</li>
                  <li><code>JAE (Jump if Above or Equal)</code>: B\xFCy\xFCk veya e\u015Fitse atla (CF=0)</li>
                  <li><code>JBE (Jump if Below or Equal)</code>: K\xFC\xE7\xFCk veya e\u015Fitse atla</li>
                </ul>
              </div>
              <div class="nb-card">
                <h5>\u0130\u015Faretli Say\u0131lar (Signed)</h5>
                <ul>
                  <li><code>JG (Jump if Greater)</code>: B\xFCy\xFCkse atla (ZF=0 ve SF=OF)</li>
                  <li><code>JL (Jump if Less)</code>: K\xFC\xE7\xFCkse atla (SF \u2260 OF)</li>
                  <li><code>JGE / JLE</code>: B\xFCy\xFCk-e\u015Fit / K\xFC\xE7\xFCk-e\u015Fit</li>
                </ul>
              </div>
            </div>
            <div class="nb-callout tip">
              \u{1F4A1} <strong>E\u015Fitlik Komutlar\u0131:</strong> Hem i\u015Faretli hem i\u015Faretsiz say\u0131larda ortakt\u0131r:<br>
              <code>JZ / JE</code>: Sonu\xE7 s\u0131f\u0131rsa / E\u015Fitse (ZF=1) atla.<br>
              <code>JNZ / JNE</code>: Sonu\xE7 s\u0131f\u0131r de\u011Filse / E\u015Fit de\u011Filse (ZF=0) atla.
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">Assembly'de IF-ELSE Karar Yap\u0131s\u0131 \u015Eablonu</h4>
            <p>\u0130ki say\u0131dan b\xFCy\xFCk olan\u0131n\u0131 bulmak i\xE7in <code>CMP</code> komutunun ard\u0131ndan ko\u015Fullu atlama ve bir <strong>etiket (label)</strong> kullan\u0131l\u0131r:</p>
            <pre class="nb-code-sample">CMP AL, BL       ; AL ile BL'yi kar\u015F\u0131la\u015Ft\u0131r
JAE AL_ZATEN_BUYUK ; AL &gt;= BL ise atla (ZF=1 veya CF=0)
MOV AL, BL       ; De\u011Filse BL daha b\xFCy\xFCkt\xFCr, BL'yi AL'ye kopyala

AL_ZATEN_BUYUK:
HLT              ; AL i\xE7inde daima b\xFCy\xFCk olan de\u011Fer kal\u0131r!</pre>
          </div>
        `,
        quiz: {
          id: "quiz-5-1",
          question: '\u0130\u015Faretsiz iki say\u0131y\u0131 kar\u015F\u0131la\u015Ft\u0131rd\u0131ktan sonra "say\u0131 k\xFC\xE7\xFCkse" atlamak i\xE7in hangi komut tercih edilmelidir?',
          options: [
            "JB (Jump if Below)",
            "JL (Jump if Less)",
            "JS (Jump if Sign)",
            "JPO (Jump if Parity Odd)"
          ],
          correctIndex: 0,
          explanation: "\u0130\u015Faretsiz say\u0131larda Above/Below (JA/JB), i\u015Faretli say\u0131larda Greater/Less (JG/JL) kullan\u0131l\u0131r."
        },
        task: {
          id: "task-5-max-two",
          title: "Ko\u015Fullu Atlama ile \u0130ki Say\u0131n\u0131n B\xFCy\xFC\u011F\xFCn\xFC Bulma",
          difficulty: "Orta",
          scenario: "AL ve BL i\xE7indeki de\u011Ferlerden b\xFCy\xFCk olan\u0131n\u0131 se\xE7ip AX'e aktar\u0131n.",
          taskPrompt: "AL = 40h, BL = 75h veriliyor. Kar\u015F\u0131la\u015Ft\u0131r\u0131p b\xFCy\xFCk olan\u0131 AL'de b\u0131rak\u0131n ve HLT ile bitirin.",
          starterCode: `; 5.1 \u0130ki Say\u0131n\u0131n B\xFCy\xFC\u011F\xFCn\xFC Bulma
ORG 100h

MOV AL, 40h
MOV BL, 75h

CMP AL, BL
JAE AL_BUYUK
MOV AL, BL

AL_BUYUK:
HLT
`,
          solutionCode: `ORG 100h
MOV AL, 40h
MOV BL, 75h
CMP AL, BL
JAE AL_BUYUK
MOV AL, BL
AL_BUYUK:
HLT
`,
          hints: ["JAE AL_BUYUK ile AL b\xFCy\xFCk-e\u015Fitse atlama yap\u0131n."],
          assertions: {
            registers: { al: 117 },
            maxSteps: 50
          },
          examTip: "CMP komutunun ard\u0131ndan ko\u015Fullu atlama yaparak if-else yap\u0131s\u0131 kurulur."
        }
      },
      {
        id: "sub-5-loop-instruction",
        number: "5.2",
        title: "LOOP Komutu ve Saya\xE7 Mant\u0131\u011F\u0131 (CX)",
        summary: "CX yazmac\u0131n\u0131n otomatik bir azalt\u0131lmas\u0131 ve s\u0131f\u0131r olana kadar geriye atlama.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">LOOP Komutu Nas\u0131l \xC7al\u0131\u015F\u0131r?</h4>
            <p><code>LOOP etiket</code> komutu donan\u0131msal olarak \u015Fu iki ad\u0131m\u0131 tek komutta otomatik icra eder:</p>
            <ol>
              <li><code>CX = CX - 1</code> yapar (Dikkat: <strong>Bayraklar\u0131 ASLA DE\u011E\u0130\u015ET\u0130RMEZ!</strong> ZF dahil hi\xE7bir bayrak etkilenmez).</li>
              <li>E\u011Fer <code>CX \u2260 0</code> ise belirtilen etikete geri atlar. <code>CX == 0</code> oldu\u011Funda ise d\xF6ng\xFCden \xE7\u0131kar ve alt sat\u0131ra ge\xE7er.</li>
            </ol>

            <h4 class="nb-title" style="margin-top: 16px;">D\xF6ng\xFC ile Toplam Hesaplama \u015Eablonu</h4>
            <p>1'den 5'e kadar say\u0131lar\u0131 toplamak i\xE7in ak\xFCm\xFClat\xF6r (<code>AX</code>) s\u0131f\u0131rlan\u0131r, saya\xE7 (<code>CX</code>) 5 yap\u0131l\u0131r ve d\xF6ng\xFC i\xE7inde <code>ADD AX, CX</code> \xE7al\u0131\u015Ft\u0131r\u0131l\u0131r:</p>
            <pre class="nb-code-sample">XOR AX, AX          ; Toplam sonucunu tutacak AX'i s\u0131f\u0131rla (AX = 0)
MOV CX, 5           ; D\xF6ng\xFC sayac\u0131n\u0131 5 yap

TOPLA_DONGU:
  ADD AX, CX        ; AX = AX + CX (s\u0131ras\u0131yla +5, +4, +3, +2, +1)
  LOOP TOPLA_DONGU  ; CX'i 1 azalt, CX s\u0131f\u0131r de\u011Filse d\xF6ng\xFCye devam et!

HLT                 ; D\xF6ng\xFC bitti: AX = 15 (0Fh), CX = 0 olur!</pre>

            <div class="nb-callout warning">
              \u{1F6A8} <strong>S\u0131nav Tuza\u011F\u0131:</strong> E\u011Fer d\xF6ng\xFCye girmeden \xF6nce <code>CX = 0</code> ise, LOOP komutu CX'i bir azalt\u0131p <code>FFFFH (65535)</code> yapar ve d\xF6ng\xFC tam 65.535 kez d\xF6ner! Bu y\xFCzden gerekiyorsa d\xF6ng\xFC \xF6ncesinde <code>JCXZ</code> ile CX=0 durumu kontrol edilmelidir.
            </div>
          </div>
        `,
        quiz: {
          id: "quiz-5-2",
          question: "LOOP komutu \xE7al\u0131\u015Ft\u0131r\u0131ld\u0131\u011F\u0131nda hangi yazma\xE7 otomatik olarak 1 azalt\u0131l\u0131r ve bayraklar nas\u0131l etkilenir?",
          options: [
            "CX azalt\u0131l\u0131r, bayraklar ETK\u0130LENMEZ",
            "CX azalt\u0131l\u0131r, ZF g\xFCncellenir",
            "AX azalt\u0131l\u0131r, CF g\xFCncellenir",
            "SI azalt\u0131l\u0131r, bayraklar etkilenmez"
          ],
          correctIndex: 0,
          explanation: "LOOP donan\u0131msal olarak CX = CX - 1 yapar fakat hi\xE7bir bayra\u011F\u0131 (ZF dahil) g\xFCncellemez."
        },
        task: {
          id: "task-5-loop-sum",
          title: "LOOP ile 1'den 5'e Kadar Say\u0131lar\u0131 Toplama",
          difficulty: "Orta",
          scenario: "CX sayac\u0131n\u0131 kullanarak 1 + 2 + 3 + 4 + 5 toplam\u0131n\u0131 AX yazmac\u0131nda hesaplay\u0131n (Sonu\xE7: 15 / 0Fh).",
          taskPrompt: "AX = 0, CX = 5 yap\u0131n. D\xF6ng\xFCde her ad\u0131mda AX'e CX'i ekleyin ve LOOP ile d\xF6n\xFCn. HLT ile bitirin.",
          starterCode: `; 5.2 LOOP ile Toplam
ORG 100h

XOR AX, AX
MOV CX, 5

TOPLA_DONGU:
  ; AX'e CX'i ekleyin:
  
  LOOP TOPLA_DONGU

HLT
`,
          solutionCode: `ORG 100h
XOR AX, AX
MOV CX, 5

TOPLA_DONGU:
  ADD AX, CX
  LOOP TOPLA_DONGU

HLT
`,
          hints: ["D\xF6ng\xFC i\xE7inde ADD AX, CX yaz\u0131n."],
          assertions: {
            registers: { ax: 15, cx: 0 },
            maxSteps: 50
          },
          examTip: "LOOP komutunun hedef etiketi g\xF6reli (relative -128..+127 bayt) uzakl\u0131kta olmal\u0131d\u0131r."
        }
      }
    ]
  },
  // =========================================================================
  // 6. YIĞIN (STACK) MİMARİSİ VE PROSEDÜRLER
  // =========================================================================
  {
    id: "topic-6-stack-procedures",
    number: 6,
    title: "Y\u0131\u011F\u0131n Mimarisi (Stack) & Prosed\xFCrler (CALL, RET, BP)",
    shortTitle: "6. Y\u0131\u011F\u0131n & Prosed\xFCrler",
    badge: "ALT YORDAMLAR",
    icon: "\u{1F95E}",
    summary: "LIFO prensibi, SP i\u015Faret\xE7isinin a\u015Fa\u011F\u0131 b\xFCy\xFCmesi (-2), PUSH/POP kurallar\u0131, CALL/RET ve yerel \xE7er\xE7eve (BP).",
    opcodes: ["PUSH", "POP", "PUSHF", "POPF", "CALL", "RET"],
    mindMap: {
      x: 55,
      y: 50,
      connections: ["topic-7-strings"]
    },
    subLessons: [
      {
        id: "sub-6-stack-lifo",
        number: "6.1",
        title: "Y\u0131\u011F\u0131n (Stack) Mimarisi ve PUSH / POP Mekanizmas\u0131",
        summary: "SP yazmac\u0131n\u0131n -2 azalmas\u0131, 8-bit PUSH yasa\u011F\u0131 ve LIFO kural\u0131.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Y\u0131\u011F\u0131n (Stack) Nas\u0131l \xC7al\u0131\u015F\u0131r? (LIFO Prensibi)</h4>
            <p>8086 mimarisinde y\u0131\u011F\u0131n <strong>a\u015Fa\u011F\u0131ya do\u011Fru (y\xFCksek bellek adresinden d\xFC\u015F\xFCk bellek adresine)</strong> b\xFCy\xFCr. Y\u0131\u011F\u0131n g\xF6stericisi (<code>SP</code>) her zaman y\u0131\u011F\u0131n\u0131n en \xFCst\xFCndeki eleman\u0131n ofsetini tutar:</p>
            <ul>
              <li><code>PUSH kaynak</code>: \xD6nce <strong><code>SP = SP - 2</code></strong> yap\u0131l\u0131r (y\u0131\u011F\u0131n 2 bayt a\u015Fa\u011F\u0131 iner), ard\u0131ndan 16-bitlik veri <code>SS:SP</code> adresine yaz\u0131l\u0131r.</li>
              <li><code>POP hedef</code>: <code>SS:SP</code> adresindeki 16-bitlik veri hedefe okunur, ard\u0131ndan <strong><code>SP = SP + 2</code></strong> yap\u0131l\u0131r (y\u0131\u011F\u0131n 2 bayt yukar\u0131 \xE7ekilir).</li>
            </ul>

            <div class="nb-callout warning">
              \u{1F6A8} <strong>8-Bit Yasa\u011F\u0131:</strong> 8086'da 8-bitlik yazma\xE7lar y\u0131\u011F\u0131na itilemez! <code>PUSH AL ; HATA!</code>. Y\u0131\u011F\u0131na sadece 16-bit Word (yazma\xE7 veya bellek) at\u0131labilir.
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">LIFO (Son Giren \u0130lk \xC7\u0131kar) ile Yazma\xE7 De\u011Ferlerini Takas Etme</h4>
            <p>Y\u0131\u011F\u0131na at\u0131lan veriler at\u0131l\u0131\u015F s\u0131ras\u0131n\u0131n <strong>tam tersi</strong> s\u0131rayla geri \xE7\u0131kar:</p>
            <pre class="nb-code-sample">MOV AX, 1234h
MOV BX, 5678h

PUSH AX    ; 1. S\u0131rada AX (1234h) y\u0131\u011F\u0131na girdi
PUSH BX    ; 2. S\u0131rada BX (5678h) y\u0131\u011F\u0131n\u0131n EN \xDCST\xDCNE yerle\u015Fti

POP AX     ; En \xFCstteki eleman \xE7ekilir &rarr; AX = 5678h oldu!
POP BX     ; Kalan eleman \xE7ekilir &rarr; BX = 1234h oldu!
           ; Sonu\xE7: AX ve BX yazma\xE7lar\u0131 birbiriyle takas edildi!</pre>
          </div>
        `,
        quiz: {
          id: "quiz-6-1",
          question: 'SP = 0100H iken "PUSH AX" komutu y\xFCr\xFCt\xFCl\xFCrse SP yazmac\u0131n\u0131n yeni de\u011Feri ne olur?',
          options: [
            "00FEH (SP 2 azal\u0131r)",
            "0102H (SP 2 artar)",
            "00FFH (SP 1 azal\u0131r)",
            "0100H (De\u011Fi\u015Fmez)"
          ],
          correctIndex: 0,
          explanation: "Y\u0131\u011F\u0131n a\u015Fa\u011F\u0131ya do\u011Fru b\xFCy\xFCd\xFC\u011F\xFC i\xE7in her PUSH i\u015Fleminde SP de\u011Feri 2 azal\u0131r (0100H - 2 = 00FEH)."
        },
        task: {
          id: "task-6-reverse-stack",
          title: "Y\u0131\u011F\u0131n ile De\u011Ferleri Tersine \xC7evirme",
          difficulty: "Kolay",
          scenario: "AX = 1234h ve BX = 5678h de\u011Ferlerini y\u0131\u011F\u0131na at\u0131p s\u0131ras\u0131yla \xE7ekerek de\u011Ferleri takas edin.",
          taskPrompt: "AX'e 1234h, BX'e 5678h y\xFCkleyin. PUSH AX, PUSH BX yap\u0131n. Ard\u0131ndan POP AX, POP BX yap\u0131n. Sonu\xE7ta AX=5678h, BX=1234h olmal\u0131d\u0131r.",
          starterCode: `; 6.1 Y\u0131\u011F\u0131n ile Takas
ORG 100h

MOV AX, 1234h
MOV BX, 5678h

; Y\u0131\u011F\u0131na itin:
; Geri \xE7ekin:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 1234h
MOV BX, 5678h
PUSH AX
PUSH BX
POP AX
POP BX
HLT
`,
          hints: ["\u0130lk at\u0131lan son \xE7\u0131kar (LIFO). PUSH AX, PUSH BX ard\u0131ndan POP AX, POP BX yap\u0131n."],
          assertions: {
            registers: { ax: 22136, bx: 4660 },
            maxSteps: 50
          },
          examTip: "Y\u0131\u011F\u0131na at\u0131lan s\u0131ran\u0131n tam tersi s\u0131rada POP yap\u0131lmazsa veriler birbirine kar\u0131\u015F\u0131r."
        }
      },
      {
        id: "sub-6-call-ret",
        number: "6.2",
        title: "Alt Yordamlar: CALL ve RET Mekanizmas\u0131",
        summary: "D\xF6n\xFC\u015F adresinin y\u0131\u011F\u0131na saklanmas\u0131 ve yordamdan d\xF6n\xFC\u015F.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">CALL ve RET Nas\u0131l \u0130leti\u015Fim Kurar?</h4>
            <p>Assembly dilinde fonksiyonlar (alt yordamlar) <code>CALL</code> ve <code>RET</code> komutlar\u0131yla i\u015Fletilir:</p>
            <ol>
              <li><code>CALL alt_program</code>: Bir sonraki komutun adresi olan <strong>IP (Instruction Pointer)</strong> donan\u0131msal olarak y\u0131\u011F\u0131na at\u0131l\u0131r (<code>PUSH IP</code>) ve alt programa z\u0131plan\u0131r.</li>
              <li>Alt program kendi g\xF6revini icra eder.</li>
              <li><code>RET</code>: Y\u0131\u011F\u0131ndan saklanan d\xF6n\xFC\u015F adresi \xE7ekilir (<code>POP IP</code>) ve ana programda CALL'un hemen alt\u0131ndaki komuttan \xE7al\u0131\u015Fmaya devam edilir.</li>
            </ol>

            <h4 class="nb-title" style="margin-top: 16px;">Alt Yordam (Fonksiyon) Yaz\u0131m \u015Eablonu</h4>
            <p>Ana program ak\u0131\u015F\u0131n\u0131n alt programa kendili\u011Finden ta\u015Fmas\u0131n\u0131 engellemek i\xE7in ana program\u0131n bitti\u011Fi yere mutlaka <code>HLT</code> konmal\u0131d\u0131r:</p>
            <pre class="nb-code-sample">ORG 100h

MOV AL, 4         ; Parametreyi haz\u0131rla
CALL KARE_AL      ; KARE_AL alt yordam\u0131na git (D\xF6n\xFC\u015F adresi y\u0131\u011F\u0131na yaz\u0131ld\u0131)
HLT               ; Ana program bitti, dur! (Alt yordama d\xFC\u015Fmeyi engeller)

; --- ALT YORDAM TANIMI ---
KARE_AL:
  MUL AL          ; AL = AL * AL = 4 * 4 = 16 (10h)
  RET             ; Y\u0131\u011F\u0131ndan adresi \xE7ekip HLT sat\u0131r\u0131na geri d\xF6n!</pre>

            <div class="nb-callout tip">
              \u{1F4A1} <strong>Y\u0131\u011F\u0131n Dengesi (Stack Balance):</strong> Alt program i\xE7inde <code>PUSH</code> yapt\u0131ysan\u0131z, <code>RET</code> komutuna gelmeden \xF6nce mutlaka ayn\u0131 say\u0131da <code>POP</code> yaparak y\u0131\u011F\u0131n dengesini korumal\u0131s\u0131n\u0131z; aksi halde RET yanl\u0131\u015F adrese z\u0131plar ve program \xE7\xF6ker!
            </div>
          </div>
        `,
        quiz: {
          id: "quiz-6-2",
          question: "CALL komutu i\u015Fletildi\u011Finde i\u015Flemci hangi de\u011Feri y\u0131\u011F\u0131na otomatik olarak kaydeder?",
          options: [
            "Bir sonraki komutun d\xF6n\xFC\u015F adresi (IP)",
            "AX yazmac\u0131n\u0131n i\xE7eri\u011Fi",
            "FLAGS bayrak yazmac\u0131",
            "CS segmentinin son adresi"
          ],
          correctIndex: 0,
          explanation: "CALL komutu ana programa geri d\xF6nebilmek i\xE7in s\u0131radaki komutun adresini (IP) y\u0131\u011F\u0131na PUSH eder."
        },
        task: {
          id: "task-6-call-subroutine",
          title: "CALL ve RET ile Kare Alma Yordam\u0131",
          difficulty: "Orta",
          scenario: "Ana programda AL=4 verip alt program\u0131 \xE7a\u011F\u0131r\u0131n. Alt program AL'yi kendisiyle \xE7arparak kare als\u0131n.",
          taskPrompt: "AL=4 yap\u0131n. CALL KARE_AL ile alt programa gidin. Alt programda MUL AL yap\u0131n, RET ile d\xF6n\xFCn. Ana programda HLT ile bitirin.",
          starterCode: `; 6.2 CALL ve RET
ORG 100h

MOV AL, 4
CALL KARE_AL
HLT

KARE_AL:
  ; AL'nin karesini al\u0131n (MUL AL):
  ; RET ile d\xF6n\xFCn:
`,
          solutionCode: `ORG 100h
MOV AL, 4
CALL KARE_AL
HLT

KARE_AL:
  MUL AL
  RET
`,
          hints: ["KARE_AL etiketinin alt\u0131nda MUL AL ve RET yaz\u0131n."],
          assertions: {
            registers: { ax: 16 },
            maxSteps: 50
          },
          examTip: "Ana program ak\u0131\u015F\u0131 alt programa girmesin diye CALL komutunun hemen ard\u0131na HLT konur."
        }
      }
    ]
  },
  // =========================================================================
  // 7. STRİNG VE DİZİ İŞLEMLERİ
  // =========================================================================
  {
    id: "topic-7-strings",
    number: 7,
    title: "String ve Dizi \u0130\u015Flemleri, Blok Bellek Transferi (MOVS, REP, DF)",
    shortTitle: "7. String & Dizi \u0130\u015Flemleri",
    badge: "BLOK VER\u0130 TRANSFER\u0130",
    icon: "\u{1F524}",
    summary: "DS:SI ve ES:DI \xE7iftleri, DF bayra\u011F\u0131 (CLD / STD), MOVS, LODS, STOS, SCAS ve REP \xF6n ekleri.",
    opcodes: ["MOVSB", "MOVSW", "LODSB", "STOSB", "SCASB", "CMPSB", "REP", "REPE", "REPNE", "CLD", "STD"],
    mindMap: {
      x: 35,
      y: 50,
      connections: ["topic-8-io-interrupts"]
    },
    subLessons: [
      {
        id: "sub-7-string-ops",
        number: "7.1",
        title: "String Komutlar\u0131, Y\xF6n Bayra\u011F\u0131 (DF) ve REP \xD6n Eki",
        summary: "CLD ile ileri (+1/+2), STD ile geri (-1/-2) y\xF6n\xFC, CX sayac\u0131 ile blok kopyalama.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">String Komutlar\u0131n\u0131n Donan\u0131m Kurallar\u0131</h4>
            <p>8086'da bellek bloklar\u0131 \xFCzerinde h\u0131zl\u0131 i\u015Flem yapmak i\xE7in donan\u0131msal string komutlar\u0131 bulunur:</p>
            <ul>
              <li><strong>Kaynak G\xF6sterici:</strong> Her zaman <code>DS:SI</code> segment-ofset \xE7iftidir.</li>
              <li><strong>Hedef G\xF6sterici:</strong> Her zaman <code>ES:DI</code> segment-ofset \xE7iftidir.</li>
              <li><strong>DF (Direction Flag - Y\xF6n Bayra\u011F\u0131):</strong>
                <ul>
                  <li><code>CLD (Clear Direction)</code>: DF = 0 yapar &rarr; \u0130ndeksler (SI, DI) her i\u015Flemde otomatik <strong>ARTAR</strong> (+1 bayt, +2 word).</li>
                  <li><code>STD (Set Direction)</code>: DF = 1 yapar &rarr; \u0130ndeksler her i\u015Flemde otomatik <strong>AZALIR</strong>.</li>
                </ul>
              </li>
              <li><strong>REP \xD6n Eki:</strong> Komutu <code>CX</code> defa tekrarlar; her ad\u0131mda i\u015Flemi yapar ve CX'i 1 azaltarak s\u0131f\u0131r olana kadar s\xFCrd\xFCr\xFCr.</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">String Komutlar\u0131 Ailesi (MOVSB, STOSB, LODSB)</h4>
            <ul>
              <li><code>MOVSB / MOVSW</code>: Bellekten belle\u011Fe transfer yapar (<code>[DS:SI] &rarr; [ES:DI]</code>).</li>
              <li><code>STOSB / STOSW (Store String)</code>: <strong><code>AL</code> (veya AX)</strong> yazmac\u0131ndaki veriyi hedef <strong><code>ES:DI</code></strong> bellek adresine kaydeder ve DI'y\u0131 art\u0131r\u0131r.</li>
              <li><code>LODSB / LODSW (Load String)</code>: <code>[DS:SI]</code> adresindeki veriyi <code>AL</code> veya <code>AX</code>'e okur ve SI'y\u0131 art\u0131r\u0131r.</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">REP STOSB ile Bellek Blo\u011Fu Doldurma \u015Eablonu</h4>
            <p>Bir bellek b\xF6lgesini sabit bir de\u011Ferle doldurmak (C dilindeki <code>memset</code> i\u015Flevi) i\xE7in \u015Fu kal\u0131p kullan\u0131l\u0131r:</p>
            <pre class="nb-code-sample">CLD             ; Y\xF6n\xFC ileri yap (DF = 0, DI her ad\u0131mda +1 artacak)
MOV AL, 0AAh    ; Belle\u011Fe bas\u0131lacak bayt de\u011Feri
MOV DI, 0200h   ; Doldurulacak bellek b\xF6lgesinin ba\u015Flang\u0131\xE7 ofseti
MOV CX, 4       ; Toplam 4 bayt yaz\u0131lacak (saya\xE7)
REP STOSB       ; 4 defa tekrarlar: [0200h]..[0203h] aras\u0131n\u0131 0AAh ile doldurur!
HLT</pre>
          </div>
        `,
        quiz: {
          id: "quiz-7-1",
          question: "MOVSB komutu \xE7al\u0131\u015Ft\u0131r\u0131ld\u0131\u011F\u0131nda SI ve DI yazma\xE7lar\u0131n\u0131n otomatik artmas\u0131 i\xE7in hangi komut \xF6nceden \xE7al\u0131\u015Ft\u0131r\u0131lmal\u0131d\u0131r?",
          options: [
            "CLD (DF = 0)",
            "STD (DF = 1)",
            "CLC (CF = 0)",
            "CLI (IF = 0)"
          ],
          correctIndex: 0,
          explanation: "CLD (Clear Direction Flag), DF bayra\u011F\u0131n\u0131 0 yaparak string komutlar\u0131n\u0131n adresleri ileriye do\u011Fru (+1/+2) art\u0131rmas\u0131n\u0131 sa\u011Flar."
        },
        task: {
          id: "task-7-stosb-fill",
          title: "STOSB ve REP ile Bellek Blo\u011Funu Doldurma",
          difficulty: "Orta",
          scenario: "Bellekteki [0200h] adresinden ba\u015Flayan 4 baytl\u0131k alan\u0131 0AAh de\u011Feriyle doldurun.",
          taskPrompt: "CLD yap\u0131n. AL = 0AAh, DI = 0200h, CX = 4 yap\u0131n. REP STOSB komutunu \xE7al\u0131\u015Ft\u0131r\u0131n. HLT ile bitirin.",
          starterCode: `; 7.1 STOSB ile Blok Doldurma
ORG 100h

; CLD, AL=0AAh, DI=0200h, CX=4 ayarlay\u0131n:
; REP STOSB \xE7al\u0131\u015Ft\u0131r\u0131n:


HLT
`,
          solutionCode: `ORG 100h
CLD
MOV AL, 0AAh
MOV DI, 0200h
MOV CX, 4
REP STOSB
HLT
`,
          hints: ["CLD, MOV AL, 0AAh, MOV DI, 0200h, MOV CX, 4 ve REP STOSB yaz\u0131n."],
          assertions: {
            memory: [
              { segment: 0, offset: 512, expectedBytes: [170, 170, 170, 170] }
            ],
            registers: { cx: 0 },
            maxSteps: 50
          },
          examTip: "STOSB AL'deki de\u011Feri ES:DI'ye yazar ve DI'yi DF'ye g\xF6re g\xFCnceller."
        }
      }
    ]
  },
  // =========================================================================
  // 8. G/Ç PORTLARI VE KESMELER
  // =========================================================================
  {
    id: "topic-8-io-interrupts",
    number: 8,
    title: "G/\xC7 Portlar\u0131, BIOS Kesmeleri & Donan\u0131m (IN, OUT, INT, IVT)",
    shortTitle: "8. G/\xC7 & Kesmeler",
    badge: "DONANIM ETK\u0130LE\u015E\u0130M\u0130",
    icon: "\u26A1",
    summary: "IN ve OUT komutlar\u0131, DX port kural\u0131, Kesme Vekt\xF6r Tablosu (IVT), INT 10h ekran ve INT 21h DOS servisleri.",
    opcodes: ["IN", "OUT", "INT", "IRET", "CLI", "STI"],
    mindMap: {
      x: 15,
      y: 50,
      connections: ["topic-9-algorithms"]
    },
    subLessons: [
      {
        id: "sub-8-io-ivt",
        number: "8.1",
        title: "G/\xC7 Portlar\u0131 ve Kesme Vekt\xF6r Tablosu (IVT)",
        summary: "Port adresleme kurallar\u0131, DX yazmac\u0131 zorunlulu\u011Fu ve 00000h adresindeki IVT yap\u0131s\u0131.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Giri\u015F / \xC7\u0131k\u0131\u015F (IN / OUT) Portlar\u0131</h4>
            <p>8086 i\u015Flemcisi harici \xE7evre birimleriyle (klavye denetleyicisi, zamanlay\u0131c\u0131, seri/paralel portlar) \xF6zel 64 KB'l\u0131k G/\xC7 port uzay\u0131 \xFCzerinden haberle\u015Fir:</p>
            <ul>
              <li><strong>Sabit Port Adresi (0 - 255):</strong> Port numaras\u0131 do\u011Frudan komuta yaz\u0131labilir: <code>IN AL, 60h</code> veya <code>OUT 20h, AL</code></li>
              <li><strong>Geni\u015F Port Adresi (256 - 65535):</strong> Port numaras\u0131 255'ten b\xFCy\xFCkse port adresi <strong>mutlaka DX yazmac\u0131nda</strong> tutulmal\u0131d\u0131r: <code>MOV DX, 0378h &rarr; OUT DX, AL</code></li>
            </ul>
            <div class="nb-callout tip">
              \u{1F4A1} <strong>Yazma\xE7 K\u0131s\u0131tlamas\u0131:</strong> G/\xC7 portlar\u0131ndan okuma yaparken hedef yazma\xE7 8-bit i\xE7in daima <strong><code>AL</code></strong>, 16-bit i\xE7in daima <strong><code>AX</code></strong> olmak zorundad\u0131r!
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">Porttan Okuma ve Veriyi Saklama \xD6rne\u011Fi</h4>
            <p>PC mimarisinde <code>60h</code> portu klavye denetleyicisidir. Bu porttan bas\u0131lan tu\u015Fu okuyup saklamak i\xE7in:</p>
            <pre class="nb-code-sample">IN AL, 60h   ; 60h portundaki veriyi AL yazmac\u0131na oku
MOV BL, AL   ; Okunan veriyi kaybetmemek i\xE7in BL yazmac\u0131na yedekle
HLT</pre>

            <h4 class="nb-title" style="margin-top: 16px;">Kesme Vekt\xF6r Tablosu (IVT - Interrupt Vector Table)</h4>
            <p>Belle\u011Fin ilk 1 KB'l\u0131k alan\u0131nda (<code>00000H \u2013 003FFH</code>) 256 adet donan\u0131m ve yaz\u0131l\u0131m kesmesinin her biri i\xE7in 4 baytl\u0131k (2 bayt IP ofseti, 2 bayt CS segmenti) servis yordam\u0131 (ISR) adresi saklan\u0131r.</p>
          </div>
        `,
        quiz: {
          id: "quiz-8-1",
          question: "0378H (LPT1 Paralel Port) adresine bir bayt veri g\xF6ndermek i\xE7in port adresi hangi yazmaca y\xFCklenmelidir?",
          options: [
            "DX yazmac\u0131na",
            "BX yazmac\u0131na",
            "AX yazmac\u0131na",
            "SI yazmac\u0131na"
          ],
          correctIndex: 0,
          explanation: "8086 mimarisinde 255'ten b\xFCy\xFCk G/\xC7 port adresleri mutlaka DX yazmac\u0131 \xFCzerinden verilmelidir (OUT DX, AL)."
        },
        task: {
          id: "task-8-port-io",
          title: "IN ve OUT ile Port Haberle\u015Fmesi",
          difficulty: "Kolay",
          scenario: "60h klavye portundan veriyi AL yazmac\u0131na okuyun ve BL yazmac\u0131na saklay\u0131n.",
          taskPrompt: "IN AL, 60h ile porttan okuyun. Okunan de\u011Feri MOV BL, AL ile saklay\u0131n. HLT ile bitirin.",
          starterCode: `; 8.1 Porttan Okuma
ORG 100h

; 60h portundan AL'ye okuyun:
; BL'ye kopyalay\u0131n:


HLT
`,
          solutionCode: `ORG 100h
IN AL, 60h
MOV BL, AL
HLT
`,
          hints: ["IN AL, 60h ard\u0131ndan MOV BL, AL yaz\u0131n."],
          assertions: {
            maxSteps: 50
          },
          examTip: "IN komutunun hedefi her zaman AL (8-bit) veya AX (16-bit) olmak zorundad\u0131r."
        }
      }
    ]
  },
  // =========================================================================
  // 9. İLERİ ALGORİTMALAR VE SINAV SORULARI
  // =========================================================================
  {
    id: "topic-9-algorithms",
    number: 9,
    title: "\u0130leri Algoritmalar, XLAT & Vize S\u0131nav Soru \xC7\xF6z\xFCmleri",
    shortTitle: "9. Algoritmalar & S\u0131nav",
    badge: "SINAV & ALGOR\u0130TMA",
    icon: "\u{1F3AF}",
    summary: "XLAT tablo arama, dizi s\u0131ralama, palindrom kontrol\xFC, matris toplam\u0131 ve klasik vize s\u0131nav sorular\u0131.",
    opcodes: ["XLAT", "XLATB"],
    mindMap: {
      x: 45,
      y: 80,
      connections: []
    },
    subLessons: [
      {
        id: "sub-9-xlat-exam",
        number: "9.1",
        title: "XLAT (Translate) Komutu ve Tablo \xC7evrimi",
        summary: "DS:BX tablosundan AL indisindeki eleman\u0131 okuma mekanizmas\u0131.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">XLAT (Translate) Komutunun \xC7al\u0131\u015Fma Mant\u0131\u011F\u0131</h4>
            <p><code>XLAT</code> komutu hi\xE7bir parametre almaz ve donan\u0131msal olarak \u015Fu i\u015Flemi tek hamlede icra eder:</p>
            <div class="nb-formula-box">
              <code>AL = [BX + AL]   ; DS:[BX + AL] adresindeki bayt\u0131 okuyup AL'ye yazar</code>
            </div>
            <ul>
              <li><strong>Tablo Ba\u015Flang\u0131\xE7 Ofseti:</strong> Mutlaka <strong><code>BX</code></strong> yazmac\u0131nda olmal\u0131d\u0131r.</li>
              <li><strong>Eleman \u0130ndisi (0..255):</strong> Mutlaka <strong><code>AL</code></strong> yazmac\u0131nda olmal\u0131d\u0131r.</li>
              <li>Komut \xE7al\u0131\u015Ft\u0131ktan sonra tablonun AL. indisindeki bayt do\u011Frudan <strong><code>AL</code></strong> yazmac\u0131na y\xFCklenir.</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">Ad\u0131m Ad\u0131m Tablo Okuma \xD6rne\u011Fi</h4>
            <pre class="nb-code-sample">; 0200h adresinde 4 elemanl\u0131 bir tablo oldu\u011Funu varsayal\u0131m:
; [0200h]=11h, [0201h]=22h, [0202h]=33h, [0203h]=44h

MOV BX, 0200h   ; Tablonun ba\u015Flang\u0131\xE7 ofseti
MOV AL, 3       ; Okunacak eleman\u0131n indisi (0'dan ba\u015Flar, 3. eleman)
XLAT            ; AL = [0200h + 3] = [0203h] adresindeki 44h de\u011Ferini al\u0131r!
HLT</pre>

            <div class="nb-callout tip">
              \u{1F4A1} <strong>S\u0131nav Klasikleri:</strong> 7-segment g\xF6sterge \xE7evrimleri (say\u0131y\u0131 display \xE7izgilerine d\xF6n\xFC\u015Ft\xFCrme), ASCII-\u015Fifreleme tablolar\u0131 ve matris lookup i\u015Flemlerinde soru olarak kar\u015F\u0131n\u0131za \xE7\u0131kar.
            </div>
          </div>
        `,
        quiz: {
          id: "quiz-9-1",
          question: "XLAT komutu \xE7al\u0131\u015Ft\u0131r\u0131ld\u0131\u011F\u0131nda tablo ba\u015Flang\u0131\xE7 adresi ve eleman indisi s\u0131ras\u0131yla hangi yazma\xE7larda bulunmal\u0131d\u0131r?",
          options: [
            "Tablo ba\u015Flang\u0131c\u0131 BX, indis AL",
            "Tablo ba\u015Flang\u0131c\u0131 SI, indis AX",
            "Tablo ba\u015Flang\u0131c\u0131 DS, indis BX",
            "Tablo ba\u015Flang\u0131c\u0131 BP, indis CX"
          ],
          correctIndex: 0,
          explanation: "XLAT donan\u0131msal olarak DS:BX tablosundan AL ofsetindeki bayt\u0131 okuyup tekrar AL'ye yazar (AL = [BX + AL])."
        },
        task: {
          id: "task-9-xlat-lookup",
          title: "XLAT ile Tablodan Eleman \xC7ekme",
          difficulty: "Orta",
          scenario: "Bellekte tan\u0131ml\u0131 tablonun 3. indisindeki eleman\u0131 XLAT ile AL yazmac\u0131na \xE7ekin.",
          taskPrompt: "BX = 0200h yap\u0131n. Belle\u011Fe tabloyu yaz\u0131n. AL = 3 yap\u0131n ve XLAT \xE7al\u0131\u015Ft\u0131r\u0131n (Sonu\xE7: AL = 44h olmal\u0131d\u0131r).",
          starterCode: `; 9.1 XLAT ile Tablo Okuma
ORG 100h

; Belle\u011Fe tablo de\u011Ferlerini haz\u0131rl\u0131yoruz:
MOV BYTE PTR [0200h], 11h
MOV BYTE PTR [0201h], 22h
MOV BYTE PTR [0202h], 33h
MOV BYTE PTR [0203h], 44h

MOV BX, 0200h   ; Tablo ba\u015Flang\u0131\xE7 ofseti
; AL'ye 3 indisini y\xFCkleyin:
; XLAT komutunu \xE7al\u0131\u015Ft\u0131r\u0131n:


HLT
`,
          solutionCode: `ORG 100h
MOV BYTE PTR [0200h], 11h
MOV BYTE PTR [0201h], 22h
MOV BYTE PTR [0202h], 33h
MOV BYTE PTR [0203h], 44h

MOV BX, 0200h
MOV AL, 3
XLAT
HLT
`,
          hints: ["MOV AL, 3 ard\u0131ndan XLAT yaz\u0131n."],
          assertions: {
            registers: { al: 68 },
            maxSteps: 50
          },
          examTip: "XLAT komutu hi\xE7bir operand almaz; BX ve AL operandlar\u0131 donan\u0131msal olarak sabittir."
        }
      }
    ]
  },
  {
    id: "topic-10-graphics",
    number: 10,
    title: "CRT Monit\xF6r, VGA Mode 13h & Grafik \xC7izimi (VRAM, BIOS INT 10h)",
    shortTitle: "10. CRT & Grafik \xC7izimi",
    badge: "GRAF\u0130K & VRAM",
    icon: "\u{1F3A8}",
    summary: "VGA Mode 13h (320x200, 256 Renk) ba\u015Flatma, BIOS INT 10h ile piksel \xE7izme, 0xA000 segmenti ile do\u011Frudan VRAM eri\u015Fimi ve retro geometrik \u015Fekil algoritmalar\u0131.",
    opcodes: ["INT", "STOSB", "REP"],
    mindMap: {
      x: 65,
      y: 85,
      connections: ["topic-8-io-int"]
    },
    subLessons: [
      {
        id: "sub-10-mode13h-pixel",
        number: "10.1",
        title: "VGA Mode 13h & BIOS INT 10h ile Piksel \xC7izme",
        summary: "320x200 256 renk grafik moduna ge\xE7i\u015F ve AH=0Ch piksel \xE7izme kesmesi.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">VGA Mode 13h Grafik Modu ve INT 10h</h4>
            <p>IBM PC ve uyumlu sistemlerde ekrana piksel piksel \xE7izim yapabilmek i\xE7in \xF6nce grafik moduna ge\xE7ilmelidir. En pop\xFCler retro grafik modu <strong>VGA Mode 13h</strong>'t\u0131r:</p>
            <ul>
              <li><strong>\xC7\xF6z\xFCn\xFCrl\xFCk:</strong> 320 yatay piksel &times; 200 dikey piksel</li>
              <li><strong>Renk Derinli\u011Fi:</strong> 256 renk (her piksel bellekte tam 1 bayt yer kaplar)</li>
              <li><strong>VRAM Segmenti:</strong> <code>0xA000:0000</code></li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">BIOS Piksel \xC7izme Servisi (INT 10h, AH=0Ch)</h4>
            <p>BIOS Video Kesmesi (<code>INT 10h</code>) \xFCzerinden ekrana piksel koymak i\xE7in \u015Fu yazma\xE7lar haz\u0131rlan\u0131r:</p>
            <ul>
              <li><code>AH = 0Ch</code> (Piksel \xE7izme fonksiyon numaras\u0131)</li>
              <li><code>AL = Renk Kodu</code> (0..255 palet indeksi; \xF6rn: <code>0Fh</code> = Parlak Beyaz, <code>04h</code> = K\u0131rm\u0131z\u0131)</li>
              <li><code>CX = S\xFCtun (X Koordinat\u0131)</code> (0..319 aras\u0131)</li>
              <li><code>DX = Sat\u0131r (Y Koordinat\u0131)</code> (0..199 aras\u0131)</li>
              <li><code>BH = 0</code> (Video sayfas\u0131)</li>
            </ul>

            <h4 class="nb-title" style="margin-top: 16px;">Tam \xC7al\u0131\u015Fan Kod \u015Eablonu</h4>
            <pre class="nb-code-sample">; 1. VGA Mode 13h (320x200, 256 renk) ba\u015Flat:
MOV AX, 0013h
INT 10h

; 2. (X=100, Y=50) koordinat\u0131na 0Fh (Beyaz) piksel \xE7iz:
MOV CX, 100    ; X = 100
MOV DX, 50     ; Y = 50
MOV AL, 0Fh    ; Renk = Beyaz
MOV AH, 0Ch    ; BIOS Piksel \xC7iz Fonksiyonu
MOV BH, 0      ; Sayfa = 0
INT 10h        ; Pikseli ekrana bas!
HLT</pre>
          </div>
        `,
        quiz: {
          id: "quiz-10-1",
          question: "VGA Mode 13h (320x200 256 Renk) moduna ge\xE7mek ve ekrana piksel \xE7izmek i\xE7in kullan\u0131lan BIOS kesmesi ve fonksiyon numaralar\u0131 hangisidir?",
          options: [
            "INT 10h: Mod i\xE7in AX=0013h, Piksel i\xE7in AH=0Ch",
            "INT 21h: Mod i\xE7in AH=09h, Piksel i\xE7in AH=02h",
            "INT 16h: Mod i\xE7in AH=00h, Piksel i\xE7in AL=0Ch",
            "INT 13h: Mod i\xE7in AX=0200h, Piksel i\xE7in AH=01h"
          ],
          correctIndex: 0,
          explanation: "Grafik ve ekran i\u015Flemleri BIOS Video Servisi olan INT 10h ile y\xF6netilir. AX=0013h grafik modunu a\xE7ar, AH=0Ch ise AL rengindeki pikseli CX, DX koordinat\u0131na \xE7izer."
        },
        task: {
          id: "task-10-draw-pixel",
          title: "Mode 13h ile Ekrana Parlak Beyaz Piksel Koyma",
          difficulty: "Kolay",
          scenario: "Sistemi VGA Mode 13h moduna al\u0131n ve ekran\u0131n (X=100, Y=50) koordinat\u0131na parlak beyaz (0Fh) bir piksel \xE7izin.",
          taskPrompt: "AX=0013h ile INT 10h \xE7a\u011F\u0131rarak Mode 13h ba\u015Flat\u0131n. Ard\u0131ndan CX=100, DX=50, AL=0Fh, AH=0Ch ve BH=0 ayarlay\u0131p INT 10h ile pikseli \xE7izin. En sonda HLT ile durdurun.",
          starterCode: `; 10.1 BIOS ile Piksel \xC7izme
ORG 100h

; 1. Mode 13h'a ge\xE7:


; 2. (X=100, Y=50) konumuna 0Fh (Beyaz) piksel \xE7iz:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 0013h
INT 10h

MOV CX, 100
MOV DX, 50
MOV AL, 0Fh
MOV AH, 0Ch
MOV BH, 0
INT 10h

HLT
`,
          hints: ["MOV AX, 0013h ard\u0131ndan INT 10h yaz\u0131n.", "CX=100, DX=50, AL=0Fh, AH=0Ch, BH=0 yap\u0131p tekrar INT 10h \xE7a\u011F\u0131r\u0131n."],
          assertions: {
            registers: { al: 15 },
            memory: [
              { segment: 64, offset: 73, expectedBytes: [19] },
              { segment: 40960, offset: 50 * 320 + 100, expectedBytes: [15] }
            ],
            maxSteps: 100
          },
          examTip: "INT 10h AH=0Ch \xE7a\u011Fr\u0131s\u0131 arka planda fiziksel olarak 0xA0000 + (Y * 320) + X VRAM adresine AL bayt\u0131n\u0131 yazar."
        }
      },
      {
        id: "sub-10-direct-vram",
        number: "10.2",
        title: "Do\u011Frudan Grafik VRAM (0xA000:0000) Eri\u015Fimi",
        summary: "BIOS gecikmelerini atlayarak do\u011Frudan 0xA000 segmentine yazma ve ofset form\xFCl\xFC: (Y * 320) + X.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Neden Do\u011Frudan VRAM? (Demoscene & Oyun H\u0131z\u0131)</h4>
            <p>BIOS <code>INT 10h AH=0Ch</code> \xE7a\u011Fr\u0131s\u0131 g\xFCvenlidir ancak her pikselde onlarca kontrol komutu \xE7al\u0131\u015Ft\u0131r\u0131r. 64.000 pikseli tek tek BIOS ile \xE7izmek saniyeler alabilir!</p>
            <p>Bu y\xFCzden retro oyun geli\u015Ftiricileri ve demoscener'lar do\u011Frudan grafik kart\u0131n\u0131n video belle\u011Fine (<strong>0xA000 segmenti</strong>) yazar:</p>
            <div class="nb-formula-box">
              <code>VRAM Ofset Form\xFCl\xFC = (Y &times; 320) + X</code>
            </div>
            <p>Her sat\u0131rda 320 piksel bulunur. \xD6rne\u011Fin <code>(X=20, Y=10)</code> koordinat\u0131ndaki pikselin ofset adresi: <code>(10 &times; 320) + 20 = 3200 + 20 = 3220</code> olur.</p>

            <h4 class="nb-title" style="margin-top: 16px;">ES Segmenti ile Do\u011Frudan VRAM'e Yazma Kal\u0131b\u0131</h4>
            <p>Segment yazma\xE7lar\u0131na (<code>ES</code>) do\u011Frudan sabit de\u011Fer y\xFCklenemedi\u011Fi i\xE7in \xF6nce <code>AX</code>'e al\u0131n\u0131p aktar\u0131l\u0131r:</p>
            <pre class="nb-code-sample">; 1. Mode 13h'a ge\xE7:
MOV AX, 0013h
INT 10h

; 2. Grafik video segmentini (0A000h) ES'ye y\xFCkle:
MOV AX, 0A000h
MOV ES, AX

; 3. DI ofsetine do\u011Frudan renk bayt\u0131n\u0131 yaz:
MOV DI, 3200                  ; Y=10 sat\u0131r ba\u015F\u0131 ofseti (10 * 320)
MOV BYTE PTR ES:[DI], 0Ah     ; 0Ah (A\xE7\u0131k Ye\u015Fil) rengindeki pikseli tek d\xF6ng\xFCde RAM'e bas!
HLT</pre>
          </div>
        `,
        quiz: {
          id: "quiz-10-2",
          question: "VGA Mode 13h (320x200) modunda ekran\u0131n (X=20, Y=10) koordinat\u0131ndaki pikselin 0xA000 segmenti i\xE7indeki ofseti ka\xE7t\u0131r?",
          options: [
            "3220 (Ofset = 10 * 320 + 20)",
            "2010 (Ofset = 20 * 100 + 10)",
            "6400 (Ofset = 20 * 320)",
            "200 (Ofset = 10 * 20)"
          ],
          correctIndex: 0,
          explanation: "Her sat\u0131rda 320 piksel oldu\u011Fu i\xE7in Y. sat\u0131ra kadar Y * 320 bayt atlan\u0131r. \xDCzerine X s\xFCtunu eklenir: 10 * 320 + 20 = 3200 + 20 = 3220."
        },
        task: {
          id: "task-10-direct-vram-write",
          title: "Do\u011Frudan VRAM Segmentine (0xA000) Bayt Yazma",
          difficulty: "Orta",
          scenario: "VGA grafik moduna ge\xE7in, ES yazmac\u0131n\u0131 0A000h yap\u0131n ve DI=3200 (Y=10 sat\u0131r ba\u015F\u0131) ofsetine do\u011Frudan 0Ah (A\xE7\u0131k Ye\u015Fil) rengini yaz\u0131n.",
          taskPrompt: "Mode 13h'a ge\xE7in (AX=0013h, INT 10h). MOV AX, 0A000h ve MOV ES, AX ile grafik segmentini y\xFCkleyin. DI=3200 yap\u0131p BYTE PTR ES:[DI]'ye 0Ah yaz\u0131n.",
          starterCode: `; 10.2 Do\u011Frudan VRAM Eri\u015Fimi
ORG 100h

; 1. Mode 13h ba\u015Flat:
MOV AX, 0013h
INT 10h

; 2. ES = 0A000h grafik segmentini haz\u0131rla:


; 3. DI = 3200 ofsetine 0Ah rengini yaz:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 0013h
INT 10h

MOV AX, 0A000h
MOV ES, AX

MOV DI, 3200
MOV BYTE PTR ES:[DI], 0Ah

HLT
`,
          hints: ["MOV AX, 0A000h ard\u0131ndan MOV ES, AX yaz\u0131n.", "MOV DI, 3200 ve MOV BYTE PTR ES:[DI], 0Ah yaz\u0131n."],
          assertions: {
            registers: { di: 3200 },
            memory: [
              { segment: 40960, offset: 3200, expectedBytes: [10] }
            ],
            maxSteps: 50
          },
          examTip: "Segment yazma\xE7lar\u0131na (DS, ES, SS) do\u011Frudan sabit say\u0131 (immediate value) y\xFCklenemez; \xF6nce genel ama\xE7l\u0131 AX gibi bir yazmaca al\u0131n\u0131p sonra ES'ye aktar\u0131l\u0131r."
        }
      },
      {
        id: "sub-10-box-loop",
        number: "10.3",
        title: "D\xF6ng\xFC ile Yatay \xC7izgi ve Geometrik Kutu \xC7izimi",
        summary: "CMP ve JNE ile d\xF6ng\xFC kurarak ekranda s\xFCrekli \xE7izgiler ve dolu kutular olu\u015Fturma.",
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">D\xF6ng\xFC ile \xC7izgi ve Kutu \xC7izimi Algoritmalar\u0131</h4>
            <p>Ekranda yatay bir \xE7izgi \xE7izmek, belirli bir <code>Y</code> sat\u0131r\u0131nda <code>X</code> koordinat\u0131n\u0131 birer birer art\u0131rarak (<code>INC CX</code>) her ad\u0131ma piksel koymaktan ibarettir:</p>
            <div class="nb-formula-box">
              <code>Piksel Adedi = X_Biti\u015F - X_Ba\u015Flang\u0131\xE7   ; \xD6rne\u011Fin 90 - 50 = 40 piksel \xE7izilir</code>
            </div>

            <h4 class="nb-title" style="margin-top: 16px;">Assembly Yatay \xC7izgi D\xF6ng\xFCs\xFC \u015Eablonu</h4>
            <pre class="nb-code-sample">MOV DX, 30          ; Y sat\u0131r\u0131 (30. sat\u0131rda sabit kal\u0131r)
MOV CX, 40          ; X s\xFCtunu (40. s\xFCtundan ba\u015Flar)

Cizgi_Loop:
    MOV AH, 0Ch     ; BIOS Piksel \xC7izme fonksiyon kodu
    MOV AL, 0Eh     ; 0Eh (Parlak Sar\u0131) rengi
    MOV BH, 0       ; Sayfa 0
    INT 10h         ; Pikseli \xE7iz!

    INC CX          ; Bir sonraki X koordinat\u0131na ge\xE7
    CMP CX, 45      ; Hedef biti\u015F s\u0131n\u0131r\u0131na (X=45) ula\u015F\u0131ld\u0131 m\u0131?
    JNE Cizgi_Loop  ; Ula\u015F\u0131lmad\u0131ysa d\xF6ng\xFCye devam et!

HLT</pre>

            <h4 class="nb-title" style="margin-top: 16px;">\u0130\xE7i Dolu Kutu (\u0130\xE7 \u0130\xE7e \xC7ift D\xF6ng\xFC)</h4>
            <p>\u0130\xE7i dolu bir dikd\xF6rtgen \xE7izmek i\xE7in bu yatay \xE7izgi d\xF6ng\xFCs\xFC bir <code>Y</code> d\xF6ng\xFCs\xFC i\xE7ine al\u0131n\u0131r: her sat\u0131r tamamland\u0131\u011F\u0131nda <code>INC DX</code> yap\u0131l\u0131r ve Y hedef y\xFCksekli\u011Fe ula\u015Fana kadar t\xFCm sat\u0131rlar s\u0131rayla taran\u0131r.</p>
            <div class="nb-callout tip">
              \u{1F4A1} Bu \xE7ift d\xF6ng\xFC mant\u0131\u011F\u0131 retro oyunlardaki sprite ve pencere \xE7iziminin temelidir!
            </div>
          </div>
        `,
        quiz: {
          id: "quiz-10-3",
          question: "X=50'den ba\u015Flay\u0131p X=90'a kadar yatay bir \xE7izgi \xE7izen d\xF6ng\xFCde toplam ka\xE7 adet piksel \xE7izilir?",
          options: [
            "40 piksel",
            "50 piksel",
            "90 piksel",
            "140 piksel"
          ],
          correctIndex: 0,
          explanation: "90 - 50 = 40 piksel \xE7izilir."
        },
        task: {
          id: "task-10-draw-line-loop",
          title: "D\xF6ng\xFC ile Ekrana Yatay Sar\u0131 \xC7izgi \xC7izme",
          difficulty: "Orta",
          scenario: "Mode 13h'ta Y=30 sat\u0131r\u0131nda, X=40'tan X=45'e kadar parlak sar\u0131 (0Eh) yatay bir \xE7izgi \xE7izin.",
          taskPrompt: "Mode 13h'a ge\xE7in. DX=30, CX=40 yap\u0131n. D\xF6ng\xFC i\xE7inde INT 10h AH=0Ch ile 0Eh rengini bas\u0131n, INC CX yap\u0131n ve CMP CX, 45 olunca d\xF6ng\xFCden \xE7\u0131k\u0131p HLT yap\u0131n.",
          starterCode: `; 10.3 D\xF6ng\xFC ile \xC7izgi \xC7izme
ORG 100h

MOV AX, 0013h
INT 10h

MOV DX, 30          ; Y = 30
MOV CX, 40          ; X = 40

Cizgi_Loop:
    ; Piksel \xE7iz (AL=0Eh, AH=0Ch, BH=0, INT 10h):


    ; CX'i art\u0131r ve 45 olana kadar d\xF6ng\xFCye devam et:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 0013h
INT 10h

MOV DX, 30
MOV CX, 40

Cizgi_Loop:
    MOV AH, 0Ch
    MOV AL, 0Eh
    MOV BH, 0
    INT 10h
    INC CX
    CMP CX, 45
    JNE Cizgi_Loop

HLT
`,
          hints: ["MOV AH, 0Ch; MOV AL, 0Eh; MOV BH, 0; INT 10h yaz\u0131n.", "INC CX ard\u0131ndan CMP CX, 45 ve JNE Cizgi_Loop yaz\u0131n."],
          assertions: {
            memory: [
              { segment: 40960, offset: 30 * 320 + 40, expectedBytes: [14, 14, 14, 14, 14] }
            ],
            maxSteps: 300
          },
          examTip: "D\xF6ng\xFC ko\u015Fullu atlamas\u0131nda JNE kullan\u0131rken d\xF6ng\xFC sayac\u0131n\u0131n hedef de\u011Fere ula\u015Faca\u011F\u0131n\u0131 garanti etmelisiniz."
        }
      }
    ]
  }
];

// src/study/studyStorage.ts
var StudyStorage = class {
  static KEY_QUIZZES = "8086_study_quizzes_v1";
  static KEY_TASKS = "8086_study_tasks_v1";
  static KEY_CODES = "8086_study_user_codes_v1";
  static memoryStore = {};
  static getItem(key) {
    try {
      if (typeof localStorage !== "undefined" && localStorage) {
        return localStorage.getItem(key);
      }
    } catch {
    }
    return this.memoryStore[key] || null;
  }
  static setItem(key, value) {
    try {
      if (typeof localStorage !== "undefined" && localStorage) {
        localStorage.setItem(key, value);
      }
    } catch {
    }
    this.memoryStore[key] = value;
  }
  static removeItem(key) {
    try {
      if (typeof localStorage !== "undefined" && localStorage) {
        localStorage.removeItem(key);
      }
    } catch {
    }
    delete this.memoryStore[key];
  }
  static getSet(key) {
    const raw = this.getItem(key);
    if (!raw) return /* @__PURE__ */ new Set();
    try {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return /* @__PURE__ */ new Set();
    }
  }
  static saveSet(key, set) {
    this.setItem(key, JSON.stringify(Array.from(set)));
  }
  static isQuizPassed(quizId) {
    return this.getSet(this.KEY_QUIZZES).has(quizId);
  }
  static markQuizPassed(quizId) {
    const s = this.getSet(this.KEY_QUIZZES);
    s.add(quizId);
    this.saveSet(this.KEY_QUIZZES, s);
  }
  static isTaskPassed(taskId) {
    return this.getSet(this.KEY_TASKS).has(taskId);
  }
  static markTaskPassed(taskId) {
    const s = this.getSet(this.KEY_TASKS);
    s.add(taskId);
    this.saveSet(this.KEY_TASKS, s);
  }
  static getUserTaskCode(taskId, fallback) {
    const raw = this.getItem(this.KEY_CODES);
    if (!raw) return fallback;
    try {
      const dict = JSON.parse(raw);
      return dict[taskId] || fallback;
    } catch {
      return fallback;
    }
  }
  static saveUserTaskCode(taskId, code) {
    const raw = this.getItem(this.KEY_CODES);
    let dict = {};
    if (raw) {
      try {
        dict = JSON.parse(raw);
      } catch {
        dict = {};
      }
    }
    dict[taskId] = code;
    this.setItem(this.KEY_CODES, JSON.stringify(dict));
  }
  static resetProgress() {
    this.removeItem(this.KEY_QUIZZES);
    this.removeItem(this.KEY_TASKS);
  }
};

// src/study/studyRunner.ts
var StudyRunner = class {
  static grade(task, userCode) {
    const asmResult = Assembler.assemble(userCode);
    if (asmResult.errors && asmResult.errors.length > 0) {
      const err = asmResult.errors[0];
      return {
        success: false,
        status: "COMPILE_ERROR",
        message: `Derleme Hatas\u0131 (Sat\u0131r ${err.line}): ${err.message}`,
        steps: 0,
        diffs: []
      };
    }
    if (!asmResult.bytes || asmResult.bytes.length === 0) {
      return {
        success: false,
        status: "COMPILE_ERROR",
        message: "Derleyici herhangi bir makine kodu bayt\u0131 \xFCretemedi.",
        steps: 0,
        diffs: []
      };
    }
    const cpu = new CPU();
    cpu.loadCOM(asmResult.bytes, asmResult.origin);
    if (task.testSetup?.initialRegisters) {
      for (const [reg, val] of Object.entries(task.testSetup.initialRegisters)) {
        const lower = reg.toLowerCase();
        if (lower in cpu.regs) {
          cpu.regs[lower] = val & 65535;
        } else if (lower === "al") {
          cpu.regs.ax = cpu.regs.ax & 65280 | val & 255;
        } else if (lower === "ah") {
          cpu.regs.ax = cpu.regs.ax & 255 | (val & 255) << 8;
        } else if (lower === "bl") {
          cpu.regs.bx = cpu.regs.bx & 65280 | val & 255;
        } else if (lower === "bh") {
          cpu.regs.bx = cpu.regs.bx & 255 | (val & 255) << 8;
        } else if (lower === "cl") {
          cpu.regs.cx = cpu.regs.cx & 65280 | val & 255;
        } else if (lower === "ch") {
          cpu.regs.cx = cpu.regs.cx & 255 | (val & 255) << 8;
        } else if (lower === "dl") {
          cpu.regs.dx = cpu.regs.dx & 65280 | val & 255;
        } else if (lower === "dh") {
          cpu.regs.dx = cpu.regs.dx & 255 | (val & 255) << 8;
        }
      }
    }
    if (task.testSetup?.initialMemory) {
      for (const block of task.testSetup.initialMemory) {
        for (let i = 0; i < block.bytes.length; i++) {
          cpu.mem.writeByte(block.segment, block.offset + i, block.bytes[i]);
        }
      }
    }
    const maxSteps = task.assertions.maxSteps || 3e3;
    let steps = 0;
    let runtimeError = null;
    while (!cpu.halted && steps < maxSteps) {
      const info = cpu.step();
      steps++;
      if (info.error) {
        runtimeError = info.error;
        break;
      }
    }
    if (runtimeError) {
      return {
        success: false,
        status: "RUNTIME_ERROR",
        message: `\xC7al\u0131\u015Fma Zaman\u0131 Hatas\u0131: ${runtimeError}`,
        steps,
        diffs: []
      };
    }
    if (!cpu.halted && steps >= maxSteps) {
      return {
        success: false,
        status: "TIMEOUT",
        message: `Zaman A\u015F\u0131m\u0131: Program ${maxSteps} ad\u0131mda sonlanmad\u0131 (HLT eksik olabilir veya sonsuz d\xF6ng\xFC var).`,
        steps,
        diffs: []
      };
    }
    const diffs = [];
    let allMatched = true;
    if (task.assertions.registers) {
      for (const [reg, expectedVal] of Object.entries(task.assertions.registers)) {
        const lower = reg.toLowerCase();
        let actualVal = 0;
        let is8Bit = false;
        if (lower === "al") {
          actualVal = cpu.regs.ax & 255;
          is8Bit = true;
        } else if (lower === "ah") {
          actualVal = cpu.regs.ax >> 8 & 255;
          is8Bit = true;
        } else if (lower === "bl") {
          actualVal = cpu.regs.bx & 255;
          is8Bit = true;
        } else if (lower === "bh") {
          actualVal = cpu.regs.bx >> 8 & 255;
          is8Bit = true;
        } else if (lower === "cl") {
          actualVal = cpu.regs.cx & 255;
          is8Bit = true;
        } else if (lower === "ch") {
          actualVal = cpu.regs.cx >> 8 & 255;
          is8Bit = true;
        } else if (lower === "dl") {
          actualVal = cpu.regs.dx & 255;
          is8Bit = true;
        } else if (lower === "dh") {
          actualVal = cpu.regs.dx >> 8 & 255;
          is8Bit = true;
        } else if (lower in cpu.regs) {
          actualVal = cpu.regs[lower];
        }
        const matched = actualVal === expectedVal;
        if (!matched) allMatched = false;
        const pad = is8Bit ? 2 : 4;
        diffs.push({
          target: reg.toUpperCase(),
          expected: expectedVal.toString(16).toUpperCase().padStart(pad, "0") + "h",
          actual: actualVal.toString(16).toUpperCase().padStart(pad, "0") + "h",
          matched
        });
      }
    }
    if (task.assertions.flags) {
      for (const [flag, expectedVal] of Object.entries(task.assertions.flags)) {
        const lower = flag.toLowerCase();
        const actualVal = cpu.flags[lower] ? 1 : 0;
        const matched = actualVal === expectedVal;
        if (!matched) allMatched = false;
        diffs.push({
          target: `FLAG ${flag.toUpperCase()}`,
          expected: expectedVal.toString(),
          actual: actualVal.toString(),
          matched
        });
      }
    }
    if (task.assertions.memory) {
      for (const memCheck of task.assertions.memory) {
        for (let i = 0; i < memCheck.expectedBytes.length; i++) {
          const off = memCheck.offset + i;
          const expByte = memCheck.expectedBytes[i];
          const actByte = cpu.mem.readByte(memCheck.segment, off);
          const matched = actByte === expByte;
          if (!matched) allMatched = false;
          diffs.push({
            target: `[${memCheck.segment.toString(16).toUpperCase()}:${off.toString(16).toUpperCase().padStart(4, "0")}h]`,
            expected: expByte.toString(16).toUpperCase().padStart(2, "0") + "h",
            actual: actByte.toString(16).toUpperCase().padStart(2, "0") + "h",
            matched
          });
        }
      }
    }
    if (!allMatched) {
      return {
        success: false,
        status: "FAILED",
        message: "Beklenen de\u011Ferler uyu\u015Fmad\u0131. L\xFCtfen a\u015Fa\u011F\u0131daki fark tablosunu inceleyin.",
        steps,
        diffs
      };
    }
    return {
      success: true,
      status: "PASSED",
      message: `Tebrikler! G\xF6rev ${steps} ad\u0131mda ba\u015Far\u0131yla tamamland\u0131.`,
      steps,
      diffs
    };
  }
};

// src/study/studyView.ts
var StudyView = class {
  container;
  callbacks;
  selectedTopic = null;
  selectedSubLesson = null;
  isDrawerOpen = false;
  searchQuery = "";
  // Elements
  mapContainer;
  drawerEl;
  searchInputEl;
  statsPillEl;
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }
  render() {
    this.container.innerHTML = `
      <div class="study-root">
        <!-- Top Toolbar -->
        <header class="study-topbar">
          <div class="study-topbar-left">
            <button class="btn-study-back" id="btn-study-return" title="Edit\xF6re Geri D\xF6n">
              <span class="icon">\u276E</span>
              <span>Edit\xF6r</span>
            </button>
            <div class="study-brand">
              <span class="study-brand-icon">\u{1F393}</span>
              <div>
                <h3 class="study-brand-title">8086 Assembly Dersleri & Zihin Haritas\u0131</h3>
                <p class="study-brand-subtitle">Ad\u0131m Ad\u0131m M\xFCfredat, \u0130nteraktif Not Defteri ve Pratik G\xF6revler</p>
              </div>
            </div>
          </div>

          <div class="study-topbar-right">
            <div class="study-search-box">
              <span class="search-icon">\u{1F50D}</span>
              <input type="text" id="study-search-input" placeholder="Konu, komut (MOV, JMP...) veya kavram ara..." value="${this.escapeHtml(this.searchQuery)}" />
            </div>

            <div class="study-stats-pill" id="study-stats-pill">
              <!-- Rendered dynamically -->
            </div>

            <button class="btn-study-reset" id="btn-study-reset" title="\xC7\xF6z\xFClen test ve g\xF6rev ilerlemesini s\u0131f\u0131rla">
              \u21BA S\u0131f\u0131rla
            </button>
          </div>
        </header>

        <!-- Main Workspace: Mind Map Area & Slide-in Drawer -->
        <div class="study-main-area">
          <div class="study-map-container" id="study-map-container">
            <!-- Mind Map SVG and Nodes -->
          </div>

          <!-- Slide-in Study Notebook Drawer -->
          <aside class="study-notebook-drawer ${this.isDrawerOpen ? "open" : ""}" id="study-notebook-drawer">
            <!-- Rendered by renderDrawer() -->
          </aside>
        </div>
      </div>
    `;
    this.mapContainer = this.container.querySelector("#study-map-container");
    this.drawerEl = this.container.querySelector("#study-notebook-drawer");
    this.searchInputEl = this.container.querySelector("#study-search-input");
    this.statsPillEl = this.container.querySelector("#study-stats-pill");
    this.updateStats();
    this.renderMindMap();
    this.renderDrawer();
    this.bindEvents();
  }
  updateStats() {
    let totalQuizzes = 0;
    let completedQuizzes = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.quiz) {
          totalQuizzes++;
          if (StudyStorage.isQuizPassed(sub.quiz.id)) completedQuizzes++;
        }
        if (sub.task) {
          totalTasks++;
          if (StudyStorage.isTaskPassed(sub.task.id)) completedTasks++;
        }
      }
    }
    const total = totalQuizzes + totalTasks;
    const completed = completedQuizzes + completedTasks;
    const percent = total > 0 ? Math.round(completed / total * 100) : 0;
    this.statsPillEl.innerHTML = `
      <div class="stats-progress-ring-wrap" title="${completed}/${total} Ad\u0131m Tamamland\u0131">
        <span class="stats-label">\u0130lerleme:</span>
        <strong class="stats-percent">%${percent}</strong>
        <div class="stats-mini-bar">
          <div class="stats-mini-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }
  renderMindMap() {
    const q = this.searchQuery.trim().toLowerCase();
    const filteredTopics = STUDY_TOPICS.filter((t) => {
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) || t.opcodes.some((op) => op.toLowerCase().includes(q)) || t.subLessons.some((s) => s.title.toLowerCase().includes(q));
    });
    let svgLines = "";
    const width = 1200;
    const height = 750;
    for (const topic of STUDY_TOPICS) {
      const fromX = topic.mindMap.x / 100 * width;
      const fromY = topic.mindMap.y / 100 * height;
      for (const targetId of topic.mindMap.connections) {
        const target = STUDY_TOPICS.find((t) => t.id === targetId);
        if (target) {
          const toX = target.mindMap.x / 100 * width;
          const toY = target.mindMap.y / 100 * height;
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;
          svgLines += `
            <path d="M ${fromX} ${fromY} Q ${midX} ${fromY} ${toX} ${toY}" 
                  class="mindmap-line" />
          `;
        }
      }
    }
    const nodesHtml = filteredTopics.map((topic) => {
      const isSelected = this.selectedTopic?.id === topic.id;
      const subCount = topic.subLessons.length;
      let topicTasks = 0;
      let topicPassed = 0;
      for (const s of topic.subLessons) {
        if (s.quiz) {
          topicTasks++;
          if (StudyStorage.isQuizPassed(s.quiz.id)) topicPassed++;
        }
        if (s.task) {
          topicTasks++;
          if (StudyStorage.isTaskPassed(s.task.id)) topicPassed++;
        }
      }
      const isCompleted = topicTasks > 0 && topicPassed === topicTasks;
      return `
        <div class="mindmap-node-card ${isSelected ? "selected" : ""} ${isCompleted ? "completed" : ""}" 
             data-topic-id="${topic.id}"
             style="left: ${topic.mindMap.x}%; top: ${topic.mindMap.y}%;">
          <div class="node-badge-row">
            <span class="node-badge">${topic.badge}</span>
            ${isCompleted ? '<span class="node-check-badge">\u2713 Tamamland\u0131</span>' : `<span class="node-progress-badge">${topicPassed}/${topicTasks}</span>`}
          </div>

          <div class="node-main-content">
            <div class="node-icon">${topic.icon}</div>
            <div class="node-info">
              <h4 class="node-title">${topic.shortTitle}</h4>
              <p class="node-summary">${topic.summary}</p>
            </div>
          </div>

          <div class="node-opcodes-strip">
            ${topic.opcodes.slice(0, 5).map((op) => `<span class="opcode-tag">${op}</span>`).join("")}
            ${topic.opcodes.length > 5 ? `<span class="opcode-more">+${topic.opcodes.length - 5}</span>` : ""}
          </div>

          <div class="node-footer-action">
            <span class="sublesson-count">\u{1F4D6} ${subCount} Alt Ders</span>
            <button class="btn-node-open" title="Not Defterinde A\xE7">Not Defterini A\xE7 \u276F</button>
          </div>
        </div>
      `;
    }).join("");
    this.mapContainer.innerHTML = `
      <div class="mindmap-canvas-inner" style="min-width: ${width}px; min-height: ${height}px;">
        <svg class="mindmap-svg-layer" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#94a3b8" />
              <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>
          </defs>
          ${svgLines}
        </svg>
        ${nodesHtml}
      </div>
    `;
    this.mapContainer.querySelectorAll(".mindmap-node-card").forEach((el) => {
      el.addEventListener("click", (e) => {
        const topicId = el.getAttribute("data-topic-id");
        if (topicId) {
          const topic = STUDY_TOPICS.find((t) => t.id === topicId);
          if (topic) {
            this.openTopicDrawer(topic);
          }
        }
      });
    });
  }
  openTopicDrawer(topic, subLessonId) {
    this.selectedTopic = topic;
    if (subLessonId) {
      this.selectedSubLesson = topic.subLessons.find((s) => s.id === subLessonId) || topic.subLessons[0];
    } else {
      this.selectedSubLesson = topic.subLessons[0];
    }
    this.isDrawerOpen = true;
    this.renderDrawer();
    this.drawerEl.classList.add("open");
    this.renderMindMap();
  }
  closeDrawer() {
    this.isDrawerOpen = false;
    this.drawerEl.classList.remove("open");
    this.renderMindMap();
  }
  renderDrawer() {
    if (!this.selectedTopic || !this.selectedSubLesson) {
      this.drawerEl.innerHTML = "";
      return;
    }
    const topic = this.selectedTopic;
    const sub = this.selectedSubLesson;
    const isQuizPassed = sub.quiz ? StudyStorage.isQuizPassed(sub.quiz.id) : true;
    const isTaskPassed = sub.task ? StudyStorage.isTaskPassed(sub.task.id) : true;
    const isSubCompleted = isQuizPassed && isTaskPassed;
    this.drawerEl.innerHTML = `
      <div class="notebook-wrapper">
        <!-- Notebook Header -->
        <div class="notebook-header">
          <div class="notebook-header-top">
            <span class="notebook-badge">${topic.badge} \u2022 B\xD6L\xDCM ${topic.number}</span>
            <button class="btn-notebook-close" id="btn-notebook-close" title="Not Defterini Kapat (ESC)">\u2715</button>
          </div>
          <div class="notebook-title-row">
            <span class="notebook-icon">${topic.icon}</span>
            <div>
              <h2 class="notebook-title">${topic.title}</h2>
              <p class="notebook-subtitle">${topic.summary}</p>
            </div>
          </div>

          <!-- Sub-Lesson Tabs -->
          <div class="notebook-tabs-bar">
            ${topic.subLessons.map((sl) => {
      const active = sl.id === sub.id;
      const qOk = sl.quiz ? StudyStorage.isQuizPassed(sl.quiz.id) : true;
      const tOk = sl.task ? StudyStorage.isTaskPassed(sl.task.id) : true;
      const done = qOk && tOk;
      return `
                <button class="notebook-tab-item ${active ? "active" : ""} ${done ? "done" : ""}" 
                        data-sub-id="${sl.id}">
                  <span class="tab-dot">${done ? "\u2713" : sl.number}</span>
                  <span class="tab-text">${sl.title}</span>
                </button>
              `;
    }).join("")}
          </div>
        </div>

        <!-- Notebook Body (3-Step Guided Study Flow) -->
        <div class="notebook-body">
          <div class="notebook-paper-sheet">
            <div class="notebook-sheet-header">
              <span class="sheet-subnum">${sub.number}</span>
              <h3 class="sheet-title">${sub.title}</h3>
              ${isSubCompleted ? '<span class="sheet-completed-pill">\u2713 Tamamland\u0131</span>' : ""}
            </div>

            <!-- ADIM 1: DERS ANLATIMI -->
            <section class="notebook-step-section">
              <div class="step-header">
                <span class="step-circle">1</span>
                <div>
                  <h4 class="step-title">Ders Anlat\u0131m\u0131 & Alt\u0131n Kurallar</h4>
                  <p class="step-desc">Konunun teorik temelleri, form\xFClleri ve \xE7al\u0131\u015Fan \xF6rnek kodlar\u0131</p>
                </div>
              </div>
              <div class="step-content">
                ${sub.theoryHtml}
              </div>
            </section>

            <!-- ADIM 2: M\u0130N\u0130 KAVRAM TEST\u0130 -->
            ${sub.quiz ? this.renderQuizSection(sub.quiz) : ""}

            <!-- ADIM 3: PRAT\u0130K KODLAMA G\xD6REV\u0130 -->
            ${sub.task ? this.renderTaskSection(sub.task) : ""}
          </div>
        </div>
      </div>
    `;
    this.bindDrawerEvents();
  }
  renderQuizSection(quiz) {
    const isPassed = StudyStorage.isQuizPassed(quiz.id);
    return `
      <section class="notebook-step-section quiz-section">
        <div class="step-header">
          <span class="step-circle">2</span>
          <div>
            <h4 class="step-title">Mini Kavram & Durum Tahmin Testi</h4>
            <p class="step-desc">Tek t\u0131kla konuyu anlama testi (S\u0131nav tarz\u0131 soru)</p>
          </div>
          ${isPassed ? '<span class="quiz-status-badge success">\u2713 Do\u011Fru Cevapland\u0131</span>' : ""}
        </div>
        <div class="step-content">
          <div class="quiz-card" data-quiz-id="${quiz.id}">
            <p class="quiz-question">${quiz.question}</p>
            ${quiz.codeSnippet ? `<pre class="quiz-code-snippet"><code>${this.escapeHtml(quiz.codeSnippet)}</code></pre>` : ""}
            
            <div class="quiz-options-list">
              ${quiz.options.map((opt, idx) => {
      return `
                  <button class="quiz-option-btn ${isPassed && idx === quiz.correctIndex ? "correct" : ""}" 
                          data-idx="${idx}">
                    <span class="opt-label">${String.fromCharCode(65 + idx)}</span>
                    <span class="opt-text">${this.escapeHtml(opt)}</span>
                  </button>
                `;
    }).join("")}
            </div>

            <div class="quiz-feedback-box" style="${isPassed ? "display: block;" : "display: none;"}">
              <div class="feedback-text">
                \u{1F4A1} <strong>A\xE7\u0131klama:</strong> ${quiz.explanation}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
  renderTaskSection(task) {
    const isPassed = StudyStorage.isTaskPassed(task.id);
    const initialCode = StudyStorage.getUserTaskCode(task.id, task.starterCode);
    return `
      <section class="notebook-step-section task-section">
        <div class="step-header">
          <span class="step-circle">3</span>
          <div>
            <h4 class="step-title">Pratik Kodlama G\xF6revi</h4>
            <p class="step-desc">${this.escapeHtml(task.title)} (${task.difficulty})</p>
          </div>
          ${isPassed ? '<span class="task-status-badge success">\u2713 G\xF6rev Ge\xE7ildi</span>' : ""}
        </div>

        <div class="step-content">
          <div class="task-card" data-task-id="${task.id}">
            <div class="task-prompt-box">
              <p><strong>\u{1F3AF} G\xF6rev:</strong> ${this.escapeHtml(task.taskPrompt)}</p>
              ${task.scenario ? `<p class="task-scenario-note"><strong>Senaryo:</strong> ${this.escapeHtml(task.scenario)}</p>` : ""}
            </div>

            <!-- In-place Mini Code Editor -->
            <div class="task-editor-wrap">
              <div class="task-editor-toolbar">
                <span class="task-editor-label">Assembly Kodu:</span>
                <div class="task-toolbar-actions">
                  <button class="btn-task-tool btn-show-hint" title="\u0130pucu G\xF6ster">\u{1F4A1} \u0130pucu</button>
                  <button class="btn-task-tool btn-show-solution" title="\xD6rnek \xC7\xF6z\xFCm\xFC \u0130ncele">\u{1F441}\uFE0F \xC7\xF6z\xFCm\xFC G\xF6ster</button>
                  <button class="btn-task-tool btn-open-ide" title="Bu Kodu Ana IDE Sim\xFClat\xF6r\xFCne G\xF6nder">\u{1F680} Ana Edit\xF6rde A\xE7</button>
                </div>
              </div>
              <textarea class="task-code-textarea" spellcheck="false" placeholder="Assembly kodunuzu buraya yaz\u0131n...">${this.escapeHtml(initialCode)}</textarea>
            </div>

            <div class="task-hints-box" style="display: none;">
              <ul>
                ${task.hints.map((h) => `<li>${this.escapeHtml(h)}</li>`).join("")}
              </ul>
            </div>

            <div class="task-solution-box" style="display: none;">
              <div class="solution-header">
                <span>Model \xC7\xF6z\xFCm Kodu:</span>
                <button class="btn-copy-solution">Kodu Kopyala</button>
              </div>
              <pre class="solution-code"><code>${this.escapeHtml(task.solutionCode)}</code></pre>
              ${task.examTip ? `<p class="solution-tip">\u{1F4A1} <strong>S\u0131nav \u0130pucu:</strong> ${this.escapeHtml(task.examTip)}</p>` : ""}
            </div>

            <!-- Test Execution Actions & Feedback -->
            <div class="task-exec-row">
              <button class="btn-task-grade" id="btn-grade-${task.id}">
                <span>\u25B6\uFE0F</span> Kodu Test Et & Notland\u0131r
              </button>
            </div>

            <div class="task-result-box" style="display: none;"></div>
          </div>
        </div>
      </section>
    `;
  }
  bindEvents() {
    const returnBtn = this.container.querySelector("#btn-study-return");
    returnBtn?.addEventListener("click", () => {
      this.callbacks.onReturnToEditor();
    });
    this.searchInputEl?.addEventListener("input", () => {
      this.searchQuery = this.searchInputEl.value;
      this.renderMindMap();
    });
    const resetBtn = this.container.querySelector("#btn-study-reset");
    resetBtn?.addEventListener("click", () => {
      if (confirm("T\xFCm ders test ve g\xF6rev ilerlemenizi s\u0131f\u0131rlamak istedi\u011Finize emin misiniz?")) {
        StudyStorage.resetProgress();
        this.updateStats();
        this.renderMindMap();
        if (this.selectedTopic) {
          this.renderDrawer();
        }
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isDrawerOpen) {
        this.closeDrawer();
      }
    });
  }
  bindDrawerEvents() {
    const closeBtn = this.drawerEl.querySelector("#btn-notebook-close");
    closeBtn?.addEventListener("click", () => {
      this.closeDrawer();
    });
    this.drawerEl.querySelectorAll(".notebook-tab-item").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        const subId = tabBtn.getAttribute("data-sub-id");
        if (subId && this.selectedTopic) {
          const sub = this.selectedTopic.subLessons.find((s) => s.id === subId);
          if (sub) {
            this.selectedSubLesson = sub;
            this.renderDrawer();
          }
        }
      });
    });
    const quizCard = this.drawerEl.querySelector(".quiz-card");
    if (quizCard && this.selectedSubLesson?.quiz) {
      const quiz = this.selectedSubLesson.quiz;
      const optionBtns = quizCard.querySelectorAll(".quiz-option-btn");
      const feedbackBox = quizCard.querySelector(".quiz-feedback-box");
      optionBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-idx") || "0", 10);
          if (idx === quiz.correctIndex) {
            btn.classList.add("correct");
            feedbackBox.style.display = "block";
            StudyStorage.markQuizPassed(quiz.id);
            this.updateStats();
            this.renderMindMap();
          } else {
            btn.classList.add("incorrect");
            setTimeout(() => btn.classList.remove("incorrect"), 1e3);
          }
        });
      });
    }
    const taskCard = this.drawerEl.querySelector(".task-card");
    if (taskCard && this.selectedSubLesson?.task) {
      const task = this.selectedSubLesson.task;
      const textarea = taskCard.querySelector(".task-code-textarea");
      const gradeBtn = taskCard.querySelector(`#btn-grade-${task.id}`);
      const resultBox = taskCard.querySelector(".task-result-box");
      const hintBtn = taskCard.querySelector(".btn-show-hint");
      const hintsBox = taskCard.querySelector(".task-hints-box");
      const solBtn = taskCard.querySelector(".btn-show-solution");
      const solBox = taskCard.querySelector(".task-solution-box");
      const openIdeBtn = taskCard.querySelector(".btn-open-ide");
      const copySolBtn = taskCard.querySelector(".btn-copy-solution");
      textarea?.addEventListener("input", () => {
        StudyStorage.saveUserTaskCode(task.id, textarea.value);
      });
      hintBtn?.addEventListener("click", () => {
        hintsBox.style.display = hintsBox.style.display === "none" ? "block" : "none";
      });
      solBtn?.addEventListener("click", () => {
        solBox.style.display = solBox.style.display === "none" ? "block" : "none";
      });
      copySolBtn?.addEventListener("click", () => {
        navigator.clipboard.writeText(task.solutionCode);
        copySolBtn.textContent = "Kopyaland\u0131! \u2713";
        setTimeout(() => copySolBtn.textContent = "Kodu Kopyala", 2e3);
      });
      openIdeBtn?.addEventListener("click", () => {
        const code = textarea.value;
        this.callbacks.onInsertCodeToEditor(code);
      });
      gradeBtn?.addEventListener("click", () => {
        const code = textarea.value;
        gradeBtn.disabled = true;
        gradeBtn.innerHTML = "<span>\u23F3</span> Test Ediliyor...";
        setTimeout(() => {
          const res = StudyRunner.grade(task, code);
          gradeBtn.disabled = false;
          gradeBtn.innerHTML = "<span>\u25B6\uFE0F</span> Kodu Test Et & Notland\u0131r";
          resultBox.style.display = "block";
          if (res.success) {
            StudyStorage.markTaskPassed(task.id);
            this.updateStats();
            this.renderMindMap();
            resultBox.className = "task-result-box success";
            resultBox.innerHTML = `
              <div class="res-badge success">\u2713 BA\u015EARILI (${res.steps} Ad\u0131m)</div>
              <p class="res-msg">${res.message}</p>
              ${this.renderDiffTable(res.diffs)}
            `;
          } else {
            resultBox.className = "task-result-box error";
            resultBox.innerHTML = `
              <div class="res-badge error">\u2715 ${res.status}</div>
              <p class="res-msg">${res.message}</p>
              ${this.renderDiffTable(res.diffs)}
            `;
          }
        }, 80);
      });
    }
  }
  renderDiffTable(diffs) {
    if (!diffs || diffs.length === 0) return "";
    return `
      <div class="diff-table-wrap">
        <table class="diff-table">
          <thead>
            <tr>
              <th>Hedef</th>
              <th>Beklenen</th>
              <th>Ger\xE7ekle\u015Fen</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            ${diffs.map((d) => `
              <tr class="${d.matched ? "diff-match" : "diff-mismatch"}">
                <td><code>${d.target}</code></td>
                <td><code>${d.expected}</code></td>
                <td><code>${d.actual}</code></td>
                <td>${d.matched ? "\u2713 Uyumlu" : "\u2715 Hata"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
};

// src/ui/topbar.ts
var TopBar = class {
  parentEl;
  workspace;
  callbacks;
  container;
  isDropdownOpen = false;
  fileInputEl;
  constructor(parentEl, workspace, callbacks = {}) {
    this.parentEl = parentEl;
    this.workspace = workspace;
    this.callbacks = callbacks;
    this.init();
    this.bindGlobalEvents();
  }
  init() {
    this.container = document.createElement("header");
    this.container.className = "vscode-topbar";
    this.container.id = "vscode-topbar";
    this.parentEl.appendChild(this.container);
    this.fileInputEl = document.createElement("input");
    this.fileInputEl.type = "file";
    this.fileInputEl.accept = ".json";
    this.fileInputEl.style.display = "none";
    this.fileInputEl.addEventListener("change", (e) => this.handleFileSelected(e));
    document.body.appendChild(this.fileInputEl);
    this.render();
  }
  render() {
    const project = this.workspace.getProject();
    const isManualActive = this.callbacks.isManualOpen ? this.callbacks.isManualOpen() : false;
    const isGraphActive = this.callbacks.isGraphOpen ? this.callbacks.isGraphOpen() : false;
    const isStudyActive = this.callbacks.isStudyOpen ? this.callbacks.isStudyOpen() : false;
    this.container.innerHTML = `
      <!-- Sol Taraf: Logo ve VS Code Men\xFC Bar\u0131 -->
      <div class="topbar-left">
        <div class="topbar-brand" title="8086 AssemblySim Web IDE">
          <svg class="topbar-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
          </svg>
          <span class="topbar-brand-name">8086 IDE</span>
        </div>

        <nav class="topbar-menubar">
          <!-- PROJECT MEN\xDCS\xDC -->
          <div class="menubar-item ${this.isDropdownOpen ? "active" : ""}" id="menu-project-btn">
            <button class="menubar-btn" id="btn-menu-project" title="Proje Men\xFCs\xFC">
              Project
            </button>

            <!-- A\xC7ILIR MEN\xDC (DROPDOWN) -->
            <div class="menubar-dropdown ${this.isDropdownOpen ? "open" : ""}" id="project-dropdown-menu">
              <button class="dropdown-item" id="menu-opt-new-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">\u{1F4C4}</span>
                  <span class="dropdown-label">New Project...</span>
                </span>
                <span class="dropdown-shortcut">Ctrl+Alt+N</span>
              </button>

              <button class="dropdown-item" id="menu-opt-open-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">\u{1F4C2}</span>
                  <span class="dropdown-label">Open Project...</span>
                </span>
                <span class="dropdown-shortcut">Ctrl+O</span>
              </button>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item" id="menu-opt-export-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">\u{1F4BE}</span>
                  <span class="dropdown-label">Save / Export Project (.json)</span>
                </span>
              </button>

              <button class="dropdown-item" id="menu-opt-import-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">\u{1F4E5}</span>
                  <span class="dropdown-label">Import Project (.json)...</span>
                </span>
              </button>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item" id="menu-opt-rename-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">\u270F\uFE0F</span>
                  <span class="dropdown-label">Rename Project...</span>
                </span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      <!-- Orta Taraf: Proje Ba\u015Fl\u0131\u011F\u0131 -->
      <div class="topbar-center">
        <div class="topbar-window-title" title="Mevcut Proje: ${this.escapeHtml(project.name)}">
          <span class="topbar-title-project" id="topbar-project-name">${this.escapeHtml(project.name)}</span>
          <span class="topbar-title-separator">\u2014</span>
          <span class="topbar-title-app">AssemblySim</span>
        </div>
      </div>

      <!-- Sa\u011F Taraf: H\u0131zl\u0131 Eri\u015Fim ve Durum -->
      <div class="topbar-right">
        <div class="topbar-quick-links">
          <button class="topbar-quick-btn ${isStudyActive ? "active" : ""}" id="topbar-btn-study" title="8086 Assembly Dersleri ve Zihin Haritas\u0131">
            <span>\u{1F393}</span> Dersler
          </button>
          <button class="topbar-quick-btn ${isGraphActive ? "active" : ""}" id="topbar-btn-graph" title="8086 Sinir A\u011F\u0131 & Bilgi Graf\u0131">
            <span>\u{1F9E0}</span> Bilgi Graf\u0131
          </button>
          <button class="topbar-quick-btn ${isManualActive ? "active" : ""}" id="topbar-btn-manual" title="8086 Komut Seti ve Referans Manueli">
            <span>\u{1F4D6}</span> Manuel
          </button>
        </div>

        <div class="topbar-status-badge" title="Intel 8086 Ger\xE7ek Mod \u0130\u015Flemci (1 MB Bellek)">
          <span class="badge-dot"></span>
          <span class="badge-text">8086 CPU</span>
        </div>
      </div>
    `;
    this.bindDomEvents();
  }
  bindDomEvents() {
    const projectBtn = this.container.querySelector("#btn-menu-project");
    const dropdownMenu = this.container.querySelector("#project-dropdown-menu");
    projectBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    dropdownMenu?.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    this.container.querySelector("#menu-opt-new-project")?.addEventListener("click", () => {
      this.closeDropdown();
      this.showNewProjectModal();
    });
    this.container.querySelector("#menu-opt-open-project")?.addEventListener("click", () => {
      this.closeDropdown();
      this.showOpenProjectModal();
    });
    this.container.querySelector("#menu-opt-export-project")?.addEventListener("click", () => {
      this.closeDropdown();
      this.exportProject();
    });
    this.container.querySelector("#menu-opt-import-project")?.addEventListener("click", () => {
      this.closeDropdown();
      this.triggerImportFile();
    });
    this.container.querySelector("#menu-opt-rename-project")?.addEventListener("click", () => {
      this.closeDropdown();
      this.showRenameProjectModal();
    });
    this.container.querySelector("#topbar-btn-study")?.addEventListener("click", () => {
      this.callbacks.onOpenStudy?.();
    });
    this.container.querySelector("#topbar-btn-graph")?.addEventListener("click", () => {
      this.callbacks.onOpenGraph?.();
    });
    this.container.querySelector("#topbar-btn-manual")?.addEventListener("click", () => {
      this.callbacks.onOpenManual?.();
    });
  }
  bindGlobalEvents() {
    window.addEventListener("click", () => {
      if (this.isDropdownOpen) {
        this.closeDropdown();
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.isDropdownOpen) {
          this.closeDropdown();
        }
        this.closeAllModals();
      }
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        this.showNewProjectModal();
      }
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        this.showOpenProjectModal();
      }
    });
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    const menu = this.container.querySelector("#project-dropdown-menu");
    const item = this.container.querySelector("#menu-project-btn");
    if (this.isDropdownOpen) {
      menu?.classList.add("open");
      item?.classList.add("active");
    } else {
      menu?.classList.remove("open");
      item?.classList.remove("active");
    }
  }
  closeDropdown() {
    this.isDropdownOpen = false;
    const menu = this.container.querySelector("#project-dropdown-menu");
    const item = this.container.querySelector("#menu-project-btn");
    menu?.classList.remove("open");
    item?.classList.remove("active");
  }
  // =========================================================================
  // MODALS: New Project, Open Project, Rename Project
  // =========================================================================
  showNewProjectModal() {
    this.closeAllModals();
    const count = this.workspace.getProjectsList().length + 1;
    const defaultName = `Proje ${count}`;
    const overlay = document.createElement("div");
    overlay.className = "topbar-modal-overlay";
    overlay.id = "topbar-modal-new-project";
    overlay.innerHTML = `
      <div class="topbar-modal-card">
        <div class="topbar-modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">\u{1F4C4}</span>
            <div>
              <h3 class="modal-title">Yeni Proje Olu\u015Ftur (New Project)</h3>
              <p class="modal-subtitle">Yeni bir 8086 Assembly \xE7al\u0131\u015Fma alan\u0131 ba\u015Flat\u0131n</p>
            </div>
          </div>
          <button class="btn-modal-close" id="btn-close-new-modal">&times;</button>
        </div>

        <div class="topbar-modal-body">
          <div class="topbar-form-group">
            <label class="topbar-form-label" for="new-project-name-input">Proje Ad\u0131:</label>
            <input type="text" id="new-project-name-input" class="topbar-form-input" value="${defaultName}" placeholder="\xD6rn: Hesap Makinesi" autocomplete="off" />
          </div>
          <p class="topbar-form-hint">
            \u{1F4A1} Yeni bir proje olu\u015Fturuldu\u011Funda mevcut projeniz otomatik kaydedilir ve temiz bir <code>main.asm</code> dosyas\u0131 haz\u0131rlan\u0131r.
          </p>
        </div>

        <div class="topbar-modal-footer">
          <button class="topbar-btn topbar-btn-secondary" id="btn-cancel-new-modal">\u0130ptal</button>
          <button class="topbar-btn topbar-btn-primary" id="btn-confirm-new-modal">Projeyi Olu\u015Ftur</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("#new-project-name-input");
    input?.focus();
    input?.select();
    const handleCreate = () => {
      const name = input?.value.trim() || defaultName;
      this.workspace.createProject(name);
      this.closeAllModals();
      this.render();
      this.callbacks.onNewProject?.();
    };
    overlay.querySelector("#btn-confirm-new-modal")?.addEventListener("click", handleCreate);
    overlay.querySelector("#btn-cancel-new-modal")?.addEventListener("click", () => this.closeAllModals());
    overlay.querySelector("#btn-close-new-modal")?.addEventListener("click", () => this.closeAllModals());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeAllModals();
    });
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCreate();
      }
    });
  }
  showOpenProjectModal() {
    this.closeAllModals();
    const overlay = document.createElement("div");
    overlay.className = "topbar-modal-overlay";
    overlay.id = "topbar-modal-open-project";
    const renderModalContent = () => {
      const projects = this.workspace.getProjectsList();
      const currentProject = this.workspace.getProject();
      overlay.innerHTML = `
        <div class="topbar-modal-card open-project-card">
          <div class="topbar-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">\u{1F4C2}</span>
              <div>
                <h3 class="modal-title">Proje A\xE7 (Open Project)</h3>
                <p class="modal-subtitle">Kay\u0131tl\u0131 projelerinizden birini se\xE7in veya bilgisayar\u0131n\u0131zdan i\xE7e aktar\u0131n</p>
              </div>
            </div>
            <button class="btn-modal-close" id="btn-close-open-modal">&times;</button>
          </div>

          <div class="topbar-modal-body">
            <!-- Dosyadan \u0130\xE7e Aktar Butonu -->
            <div class="open-project-import-banner">
              <div class="import-banner-info">
                <span class="import-icon">\u{1F4E5}</span>
                <div>
                  <strong>Bilgisayardan .json Projesi A\xE7</strong>
                  <p>Daha \xF6nce d\u0131\u015Fa aktard\u0131\u011F\u0131n\u0131z bir AssemblySim projesini y\xFCkleyin.</p>
                </div>
              </div>
              <button class="topbar-btn topbar-btn-secondary" id="btn-import-from-disk">Dosya Se\xE7...</button>
            </div>

            <!-- Kay\u0131tl\u0131 Projeler Listesi -->
            <div class="projects-list-header">
              <span>Kay\u0131tl\u0131 \xC7al\u0131\u015Fma Alanlar\u0131 (${projects.length})</span>
            </div>

            <div class="projects-list-container">
              ${projects.length === 0 ? `
                <div class="projects-empty-state">Hen\xFCz kay\u0131tl\u0131 ba\u015Fka bir proje bulunamad\u0131.</div>
              ` : projects.map((p) => {
        const isCurrent = p.id === currentProject.id;
        const formattedDate = new Date(p.lastModified).toLocaleString("tr-TR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        return `
                  <div class="project-list-row ${isCurrent ? "current-project" : ""}" data-project-id="${p.id}">
                    <div class="project-row-left">
                      <span class="project-row-icon">\u{1F5C2}\uFE0F</span>
                      <div class="project-row-info">
                        <div class="project-row-name-wrap">
                          <strong class="project-row-name">${this.escapeHtml(p.name)}</strong>
                          ${isCurrent ? '<span class="project-current-badge">\u25CF Aktif</span>' : ""}
                        </div>
                        <div class="project-row-meta">
                          <span>${p.fileCount} dosya</span>
                          <span>\u2022</span>
                          <span>Son d\xFCzenleme: ${formattedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div class="project-row-actions">
                      ${isCurrent ? `
                        <button class="topbar-btn topbar-btn-small topbar-btn-disabled" disabled>A\xE7\u0131k</button>
                      ` : `
                        <button class="topbar-btn topbar-btn-small topbar-btn-primary btn-action-open" data-project-id="${p.id}">A\xE7</button>
                        <button class="topbar-btn topbar-btn-small topbar-btn-danger btn-action-delete" data-project-id="${p.id}" title="Projeyi Sil">\u{1F5D1}\uFE0F</button>
                      `}
                    </div>
                  </div>
                `;
      }).join("")}
            </div>
          </div>

          <div class="topbar-modal-footer">
            <button class="topbar-btn topbar-btn-secondary" id="btn-cancel-open-modal">Kapat</button>
            <button class="topbar-btn topbar-btn-primary" id="btn-modal-quick-new">\uFF0B Yeni Proje</button>
          </div>
        </div>
      `;
      overlay.querySelector("#btn-close-open-modal")?.addEventListener("click", () => this.closeAllModals());
      overlay.querySelector("#btn-cancel-open-modal")?.addEventListener("click", () => this.closeAllModals());
      overlay.querySelector("#btn-modal-quick-new")?.addEventListener("click", () => {
        this.closeAllModals();
        this.showNewProjectModal();
      });
      overlay.querySelector("#btn-import-from-disk")?.addEventListener("click", () => {
        this.triggerImportFile();
      });
      overlay.querySelectorAll(".btn-action-open").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const pId = btn.getAttribute("data-project-id");
          if (pId) {
            this.workspace.openProject(pId);
            this.closeAllModals();
            this.render();
            this.callbacks.onOpenProject?.();
          }
        });
      });
      overlay.querySelectorAll(".btn-action-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const pId = btn.getAttribute("data-project-id");
          if (pId) {
            const projectItem = projects.find((p) => p.id === pId);
            const confirmed = window.confirm(`"${projectItem?.name || "Bu projeyi"}" silmek istedi\u011Finize emin misiniz?`);
            if (confirmed) {
              this.workspace.deleteProject(pId);
              renderModalContent();
            }
          }
        });
      });
      overlay.querySelectorAll(".project-list-row:not(.current-project)").forEach((row) => {
        row.addEventListener("click", () => {
          const pId = row.getAttribute("data-project-id");
          if (pId) {
            this.workspace.openProject(pId);
            this.closeAllModals();
            this.render();
            this.callbacks.onOpenProject?.();
          }
        });
      });
    };
    renderModalContent();
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeAllModals();
    });
  }
  showRenameProjectModal() {
    this.closeAllModals();
    const currentProject = this.workspace.getProject();
    const overlay = document.createElement("div");
    overlay.className = "topbar-modal-overlay";
    overlay.id = "topbar-modal-rename-project";
    overlay.innerHTML = `
      <div class="topbar-modal-card">
        <div class="topbar-modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">\u270F\uFE0F</span>
            <div>
              <h3 class="modal-title">Proje Ad\u0131n\u0131 De\u011Fi\u015Ftir</h3>
              <p class="modal-subtitle">Mevcut projenize yeni bir isim verin</p>
            </div>
          </div>
          <button class="btn-modal-close" id="btn-close-rename-modal">&times;</button>
        </div>

        <div class="topbar-modal-body">
          <div class="topbar-form-group">
            <label class="topbar-form-label" for="rename-project-input">Yeni Proje Ad\u0131:</label>
            <input type="text" id="rename-project-input" class="topbar-form-input" value="${this.escapeHtml(currentProject.name)}" autocomplete="off" />
          </div>
        </div>

        <div class="topbar-modal-footer">
          <button class="topbar-btn topbar-btn-secondary" id="btn-cancel-rename-modal">\u0130ptal</button>
          <button class="topbar-btn topbar-btn-primary" id="btn-confirm-rename-modal">Kaydet</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("#rename-project-input");
    input?.focus();
    input?.select();
    const handleRename = () => {
      const newName = input?.value.trim();
      if (newName) {
        this.workspace.renameCurrentProject(newName);
        this.closeAllModals();
        this.render();
        this.callbacks.onRenameProject?.(newName);
      }
    };
    overlay.querySelector("#btn-confirm-rename-modal")?.addEventListener("click", handleRename);
    overlay.querySelector("#btn-cancel-rename-modal")?.addEventListener("click", () => this.closeAllModals());
    overlay.querySelector("#btn-close-rename-modal")?.addEventListener("click", () => this.closeAllModals());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeAllModals();
    });
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRename();
      }
    });
  }
  exportProject() {
    const jsonStr = this.workspace.exportProjectJson();
    const project = this.workspace.getProject();
    const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "project";
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}.8086.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.callbacks.onExportProject?.();
  }
  triggerImportFile() {
    this.fileInputEl.value = "";
    this.fileInputEl.click();
  }
  handleFileSelected(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        const ok = this.workspace.importProjectJson(content);
        if (ok) {
          this.closeAllModals();
          this.render();
          this.callbacks.onImportProject?.(content);
        } else {
          alert("Ge\xE7ersiz 8086 proje dosyas\u0131. JSON format\u0131 do\u011Frulanamad\u0131.");
        }
      }
    };
    reader.readAsText(file);
  }
  closeAllModals() {
    document.querySelectorAll(".topbar-modal-overlay").forEach((el) => el.remove());
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
};

// src/ui/main.ts
function getSpeedDelayMs(speed) {
  switch (speed) {
    case "0.5":
      return 600;
    case "2":
      return 100;
    case "max":
      return 10;
    case "1":
    default:
      return 300;
  }
}
function getSpeedBatchSize(speed) {
  switch (speed) {
    case "0.5":
      return 10;
    case "2":
      return 3e3;
    case "max":
      return 15e3;
    case "1":
    default:
      return 1e3;
  }
}
var App = class {
  cpu;
  workspace;
  sidebar;
  editor;
  registerPanel;
  memoryView;
  consoleView;
  instructionDoc;
  graphView;
  studyView;
  topbar;
  // Computer Execution State
  isCompiled = false;
  addrToSourceMap = /* @__PURE__ */ new Map();
  isRunning = false;
  runTimer = null;
  speed = "1";
  isDirty = false;
  isManualOpen = false;
  isGraphOpen = false;
  isStudyOpen = false;
  // UI Element References
  appMainContent;
  mainIdeLayout;
  manualViewMount;
  graphViewMount;
  studyViewMount;
  tabsBarEl;
  btnCompile;
  btnRun;
  btnNext;
  btnStop;
  btnReset;
  btnStepBack;
  btnHeaderManual;
  btnHeaderGraph;
  btnHeaderStudy;
  constructor() {
    this.cpu = new CPU();
    this.workspace = new WorkspaceManager({
      onProjectChange: () => {
        this.renderTabs();
        this.sidebar?.render();
        this.topbar?.render();
      },
      onActiveFileChange: (file) => {
        this.loadFileToEditor(file);
      }
    });
    TooltipManager.init();
    this.initLayout();
    this.initModules();
    this.bindEvents();
    this.cpu.mem.onVramWrite = (phys, val) => {
      this.consoleView.recordVramChange(phys, val);
      this.consoleView.updateVram(this.cpu.mem.data);
    };
    this.consoleView.updateVram(this.cpu.mem.data);
    this.cpu.regs.ip = 31744;
    this.cpu.regs.sp = 31744;
    this.cpu.flags.if = true;
    this.updateCpuViews();
    const activeFile = this.workspace.getActiveFile();
    this.loadFileToEditor(activeFile);
  }
  initLayout() {
    const appEl = document.getElementById("app");
    if (!appEl) throw new Error("#app element not found");
    appEl.innerHTML = `
      <div class="app-window-wrapper">
        <!-- VS Code Tarz\u0131 \xDCst \xC7ubuk (Title & Menubar) -->
        <div id="topbar-mount"></div>

        <div class="app-layout-root">
        <!-- Sol Kenar \xC7ubu\u011Fu (Workspace / Proje Gezgini) -->
        <div id="sidebar-mount"></div>

        <!-- Ana \xC7al\u0131\u015Fma Alan\u0131 -->
        <div class="app-main-content">
          <!-- IDE D\xFCzeni -->
          <main class="main-layout" id="main-ide-layout">
            <!-- Sol B\xF6l\xFCm: Edit\xF6r ve Konsol -->
            <section class="editor-section">
              <!-- Edit\xF6r \xDCst Bar\u0131 -->
              <div class="editor-header-bar">
                <div class="editor-header-left">
                  <!-- 8086 Assembly Dersleri & Zihin Haritas\u0131 Butonu -->
                  <button id="btn-header-open-study" class="btn-ctrl" style="background: #fef3c7; color: #92400e; border-color: #fde68a; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;" title="8086 Assembly Dersleri, Zihin Haritas\u0131 ve Not Defteri">
                    <span>\u{1F393}</span> Dersler
                  </button>

                  <!-- 8086 Sinir A\u011F\u0131 & Bilgi Graf\u0131 Butonu -->
                  <button id="btn-header-open-graph" class="btn-ctrl" style="background: #f0fdf4; color: #15803d; border-color: #86efac; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;" title="8086 Sinir A\u011F\u0131 ve Bilgi Haritas\u0131">
                    <span>\u{1F9E0}</span> Bilgi Graf\u0131
                  </button>

                  <button id="btn-header-open-manual" class="btn-ctrl" style="background: #eff6ff; color: #1d4ed8; border-color: #93c5fd; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;" title="8086 Komut Seti ve Referans Manueli">
                    <span>\u{1F4D6}</span> Manuel
                  </button>
                </div>

                <div class="editor-toolbar-right">
                  <!-- Format Se\xE7ici (HEX / DEC / BIN) -->
                  <div class="format-switch-group">
                    <button class="btn-fmt active" data-fmt="hex">HEX</button>
                    <button class="btn-fmt" data-fmt="dec">DEC</button>
                    <button class="btn-fmt" data-fmt="bin">BIN</button>
                  </div>

                  <!-- \xC7al\u0131\u015Fma H\u0131z\u0131 (0.5x / 1x / 2x / MAX) -->
                  <div class="speed-switch-group">
                    <button class="btn-speed" data-speed="0.5" title="0.5x Yava\u015F (600ms)">0.5x</button>
                    <button class="btn-speed active" data-speed="1" title="1x Normal H\u0131z (300ms)">1x</button>
                    <button class="btn-speed" data-speed="2" title="2x H\u0131zl\u0131 (100ms)">2x</button>
                    <button class="btn-speed" data-speed="max" title="MAX H\u0131z (100 sat\u0131r/sn - 10ms)">MAX</button>
                  </div>

                  <div class="toolbar-group-divider"></div>

                  <!-- Aksiyon Butonlar\u0131 (Bilgisayar\u0131 \xC7al\u0131\u015Ft\u0131r) -->
                  <div class="action-buttons-group">
                    <button id="btn-compile" class="btn-compile" title="T\xFCm projeyi belle\u011Fe y\xFCkle">
                      COMPILE
                      <span class="compile-dirty-dot" style="display: none;" title="Derlenmemi\u015F de\u011Fi\u015Fiklikler var"></span>
                    </button>
                    <button id="btn-run" class="btn-ctrl" title="Bilgisayar\u0131 \xE7al\u0131\u015Ft\u0131r (F5)">RUN</button>
                    <button id="btn-next" class="btn-ctrl" title="Bir ad\u0131m ilerlet (F10)">NEXT</button>
                    <button id="btn-stop" class="btn-ctrl" disabled title="\xC7al\u0131\u015Fmay\u0131 duraklat">STOP</button>
                    <button id="btn-reset" class="btn-ctrl" title="\u0130\u015Flemciyi ve belle\u011Fi s\u0131f\u0131rla">RESET</button>
                    <button id="btn-step-back" class="btn-ctrl btn-step-back" title="Geri Ad\u0131m Al (Step Back)" disabled>\u21B6</button>
                  </div>
                </div>
              </div>

              <!-- \xC7oklu Dosya Sekmeleri (Tabs Bar) -->
              <div class="editor-tabs-bar" id="editor-tabs-bar"></div>

              <!-- Kod Edit\xF6r\xFC Alan\u0131 -->
              <div id="editor-container"></div>

              <!-- Konsol & VRAM Ekran\u0131 -->
              <div id="console-container" class="console-section-wrapper"></div>
            </section>

            <!-- Sa\u011F B\xF6l\xFCm: 8086 Registerlar\u0131 & 1 MB RAM -->
            <section class="cpu-section">
              <div id="registers-container"></div>
              <div id="memory-container"></div>
            </section>
          </main>

          <!-- Komut Manueli G\xF6r\xFCn\xFCm\xFC -->
          <div id="manual-view-mount" class="reference-doc-mount" style="display: none; width: 100%;"></div>

          <!-- 8086 Sinir A\u011F\u0131 & Bilgi Graf\u0131 Mount -->
          <div id="graph-view-mount" class="graph-view-mount" style="display: none; width: 100%; height: 100%;"></div>

          <!-- 8086 Dersler & Zihin Haritas\u0131 Mount -->
          <div id="study-view-mount" class="study-view-mount" style="display: none; width: 100%; height: 100%;"></div>
      </div>
        </div>
      </div>
    `;
    this.appMainContent = document.querySelector(".app-main-content");
    this.mainIdeLayout = document.getElementById("main-ide-layout");
    this.manualViewMount = document.getElementById("manual-view-mount");
    this.graphViewMount = document.getElementById("graph-view-mount");
    this.studyViewMount = document.getElementById("study-view-mount");
    this.tabsBarEl = document.getElementById("editor-tabs-bar");
    this.btnCompile = document.getElementById("btn-compile");
    this.btnRun = document.getElementById("btn-run");
    this.btnNext = document.getElementById("btn-next");
    this.btnStop = document.getElementById("btn-stop");
    this.btnReset = document.getElementById("btn-reset");
    this.btnStepBack = document.getElementById("btn-step-back");
    this.btnHeaderManual = document.getElementById("btn-header-open-manual");
    this.btnHeaderGraph = document.getElementById("btn-header-open-graph");
    this.btnHeaderStudy = document.getElementById("btn-header-open-study");
  }
  initModules() {
    const sidebarMount = document.getElementById("sidebar-mount");
    const editorContainer = document.getElementById("editor-container");
    const consoleContainer = document.getElementById("console-container");
    const registersContainer = document.getElementById("registers-container");
    const memoryContainer = document.getElementById("memory-container");
    const topbarMount = document.getElementById("topbar-mount");
    this.topbar = new TopBar(topbarMount, this.workspace, {
      onNewProject: () => {
        this.resetExecutionAndCpu();
        this.sidebar.render();
        this.renderTabs();
        this.showEditor();
        this.consoleView.log(`\u{1F680} Yeni proje olu\u015Fturuldu: [${this.workspace.getProject().name}]`, "info");
      },
      onOpenProject: () => {
        this.resetExecutionAndCpu();
        this.sidebar.render();
        this.renderTabs();
        this.showEditor();
        this.consoleView.log(`\u{1F4C2} Proje a\xE7\u0131ld\u0131: [${this.workspace.getProject().name}]`, "info");
      },
      onExportProject: () => {
        this.consoleView.log(`\u{1F4BE} Proje d\u0131\u015Fa aktar\u0131ld\u0131: [${this.workspace.getProject().name}.8086.json]`, "info");
      },
      onImportProject: () => {
        this.resetExecutionAndCpu();
        this.sidebar.render();
        this.renderTabs();
        this.showEditor();
        this.consoleView.log(`\u{1F4E5} Proje i\xE7e aktar\u0131ld\u0131: [${this.workspace.getProject().name}]`, "info");
      },
      onRenameProject: (newName) => {
        this.sidebar.render();
        this.consoleView.log(`\u270F\uFE0F Proje ad\u0131 g\xFCncellendi: [${newName}]`, "info");
      },
      onOpenManual: () => this.showManual(),
      onOpenGraph: () => this.showGraph(),
      onOpenStudy: () => this.showStudy(),
      isManualOpen: () => this.isManualOpen,
      isGraphOpen: () => this.isGraphOpen,
      isStudyOpen: () => this.isStudyOpen
    });
    this.sidebar = new WorkspaceSidebar(sidebarMount, this.workspace, {
      onFileSelect: (file) => {
        this.showEditor();
        this.switchToFile(file.id);
      },
      onNewFile: () => {
        this.showEditor();
        this.flushCurrentEditorState();
        const newFile = this.workspace.createFile();
        this.switchToFile(newFile.id);
      },
      onSetEntryFile: (fileId) => {
        this.setDirty(true);
      },
      onDeleteFile: () => {
        const active = this.workspace.getActiveFile();
        this.loadFileToEditor(active);
      },
      onOpenManual: () => {
        this.showManual();
      },
      onOpenGraph: () => {
        this.showGraph();
      },
      onOpenStudy: () => {
        this.showStudy();
      },
      getActiveFileId: () => this.workspace.getActiveFile()?.id,
      isManualOpen: () => this.isManualOpen,
      isGraphOpen: () => this.isGraphOpen,
      isStudyOpen: () => this.isStudyOpen
    });
    this.editor = new Editor({
      container: editorContainer,
      initialCode: "",
      onSave: () => {
        this.flushCurrentEditorState();
        this.setDirty(false);
        const active = this.workspace.getActiveFile();
        this.consoleView.log(`\u{1F4BE} [${active?.name || "Belge"}] De\u011Fi\u015Fiklikler kaydedildi.`, "info");
      },
      onCodeChange: (code) => {
        const activeFile = this.workspace.getActiveFile();
        if (activeFile) {
          this.workspace.updateFileCode(
            activeFile.id,
            code,
            this.editor.getScroll(),
            this.editor.getCursor()
          );
          this.setDirty(true);
        }
      }
    });
    this.consoleView = new ConsoleView(consoleContainer, {
      memory: this.cpu.mem,
      onInput: (input) => {
        this.cpu.feedInput(input);
        this.consoleView.setWaitingForInput(false);
        if (!this.isRunning && !this.cpu.halted) {
          this.handleRun();
        }
      },
      onVideoModeChange: (mode) => {
        this.cpu.mem.writeByte(0, 1097, mode, false);
      }
    });
    this.registerPanel = new RegisterPanel(registersContainer);
    this.memoryView = new MemoryView(memoryContainer);
    this.instructionDoc = new InstructionDoc(this.manualViewMount, {
      onReturnToEditor: () => this.showEditor(),
      onInsertCodeToEditor: (name, code) => {
        this.flushCurrentEditorState();
        const file = this.workspace.createFile(name, code);
        this.showEditor();
        this.switchToFile(file.id);
      }
    });
    this.graphView = new GraphView(this.graphViewMount, {
      onReturnToEditor: () => this.showEditor(),
      onInsertCodeToEditor: (code) => {
        this.showEditor();
        const activeFile = this.workspace.getActiveFile();
        const current = this.editor.getCode();
        const updated = current.trimEnd() + "\n\n" + code + "\n";
        this.editor.setCode(updated);
        this.workspace.updateFileCode(activeFile.id, updated);
        this.setDirty(true);
        this.consoleView.log("\u2713 Bilgi graf\u0131ndan \xF6rnek kod edit\xF6re aktar\u0131ld\u0131.", "info");
      },
      onOpenInManual: (opcode) => {
        this.showManual();
        this.instructionDoc.openInstruction(opcode);
      }
    });
    this.studyView = new StudyView(this.studyViewMount, {
      onReturnToEditor: () => this.showEditor(),
      onInsertCodeToEditor: (code) => {
        this.showEditor();
        const activeFile = this.workspace.getActiveFile();
        if (activeFile) {
          const current = this.editor.getCode();
          const updated = current.trimEnd() + "\n\n" + code + "\n";
          this.editor.setCode(updated);
          this.workspace.updateFileCode(activeFile.id, updated);
          this.setDirty(true);
          this.consoleView.log("\u2713 Ders g\xF6revinden kod edit\xF6re aktar\u0131ld\u0131.", "info");
        }
      }
    });
    this.renderTabs();
    this.updateCpuViews();
  }
  renderTabs() {
    const project = this.workspace.getProject();
    const openFiles = project.openFileIds.map((id) => this.workspace.getFile(id)).filter(Boolean);
    this.tabsBarEl.innerHTML = openFiles.map((file) => {
      const isActive = file.id === project.activeFileId;
      return `
        <div class="editor-tab-item ${isActive ? "active" : ""}" data-file-id="${file.id}">
          <span class="tab-icon">\u{1F4C4}</span>
          <span class="tab-name">${this.escapeHtml(file.name)}</span>
          ${openFiles.length > 1 ? `
            <button class="btn-tab-close" data-close-id="${file.id}" title="Sekmeyi Kapat">\xD7</button>
          ` : ""}
        </div>
      `;
    }).join("") + `
      <button id="btn-tab-new-file" title="Yeni Dosya Ekle">\uFF0B</button>
    `;
    this.tabsBarEl.querySelectorAll(".editor-tab-item").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        if (e.target.closest(".btn-tab-close")) return;
        const fileId = tab.getAttribute("data-file-id");
        if (fileId) {
          this.switchToFile(fileId);
        }
      });
    });
    this.tabsBarEl.querySelectorAll(".btn-tab-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const closeId = btn.getAttribute("data-close-id");
        if (closeId) {
          this.flushCurrentEditorState();
          this.editor.removeFileHistory(closeId);
          this.workspace.closeTab(closeId);
        }
      });
    });
    const newBtn = this.tabsBarEl.querySelector("#btn-tab-new-file");
    newBtn?.addEventListener("click", () => {
      this.flushCurrentEditorState();
      const file = this.workspace.createFile();
      this.switchToFile(file.id);
    });
  }
  flushCurrentEditorState() {
    if (!this.workspace || !this.editor) return;
    const current = this.workspace.getActiveFile();
    if (current) {
      const code = this.editor.getCode();
      const scroll = this.editor.getScroll();
      const cursor = this.editor.getCursor();
      this.workspace.updateFileCode(current.id, code, scroll, cursor);
    }
  }
  switchToFile(fileId) {
    if (!fileId) return;
    const current = this.workspace.getActiveFile();
    if (current && current.id === fileId) return;
    this.flushCurrentEditorState();
    this.workspace.setActiveFile(fileId);
  }
  loadFileToEditor(file) {
    if (!file) return;
    this.editor.openFile(file.id, file.code, file.editorScroll, file.editorCursor);
    this.editor.clearErrors();
    this.renderTabs();
    this.sidebar?.render();
  }
  bindEvents() {
    this.btnCompile.addEventListener("click", () => this.handleCompileWorkspace());
    this.btnRun.addEventListener("click", () => this.handleRun());
    this.btnNext.addEventListener("click", () => this.handleNext());
    this.btnStop.addEventListener("click", () => this.handleStop());
    this.btnReset.addEventListener("click", () => this.handleReset());
    this.btnStepBack.addEventListener("click", () => this.handleStepBack());
    this.btnHeaderManual.addEventListener("click", () => this.toggleManual());
    this.btnHeaderGraph?.addEventListener("click", () => this.toggleGraph());
    this.btnHeaderStudy?.addEventListener("click", () => this.toggleStudy());
    const fmtButtons = document.querySelectorAll(".btn-fmt");
    fmtButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const fmt = btn.getAttribute("data-fmt");
        if (fmt) {
          fmtButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.registerPanel.setFormat(fmt);
        }
      });
    });
    const speedButtons = document.querySelectorAll(".btn-speed");
    speedButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const spd = btn.getAttribute("data-speed");
        if (spd) {
          this.speed = spd;
          speedButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          if (this.isRunning) {
            this.handleStop();
            this.handleRun();
          }
        }
      });
    });
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        this.flushCurrentEditorState();
        this.setDirty(false);
        const active = this.workspace.getActiveFile();
        this.consoleView.log(`\u{1F4BE} [${active?.name || "Belge"}] De\u011Fi\u015Fiklikler kaydedildi.`, "info");
        return;
      }
      if (e.key === "F5") {
        e.preventDefault();
        if (this.isManualOpen || this.isGraphOpen || this.isStudyOpen) this.showEditor();
        if (this.isRunning) {
          this.handleStop();
        } else {
          this.handleRun();
        }
      } else if (e.key === "F10") {
        e.preventDefault();
        if (this.isManualOpen || this.isGraphOpen || this.isStudyOpen) this.showEditor();
        if (!this.isRunning) {
          this.handleNext();
        }
      } else if (e.key === "Escape") {
        if (this.isRunning) {
          this.handleStop();
        } else if (this.isManualOpen || this.isGraphOpen || this.isStudyOpen) {
          this.showEditor();
        }
        return;
      }
      if (this.consoleView.isWaitingForInput()) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key !== "F5" && e.key !== "F10" && e.key !== "F12") {
          e.preventDefault();
          const charToSend = e.key === "Enter" ? "\r" : e.key.length === 1 ? e.key : " ";
          this.cpu.feedInput(charToSend);
          this.consoleView.setWaitingForInput(false);
          if (!this.isRunning && !this.cpu.halted) {
            this.handleRun();
          }
        }
      }
    });
    window.addEventListener("beforeunload", () => {
      this.flushCurrentEditorState();
    });
  }
  showStudy() {
    this.flushCurrentEditorState();
    this.isStudyOpen = true;
    this.isGraphOpen = false;
    this.isManualOpen = false;
    this.appMainContent?.classList.remove("graph-active");
    this.mainIdeLayout.style.display = "none";
    this.manualViewMount.style.display = "none";
    this.graphViewMount.style.display = "none";
    this.studyViewMount.style.display = "flex";
    this.studyView?.render();
    this.topbar?.render();
    this.sidebar?.render();
  }
  showGraph() {
    this.flushCurrentEditorState();
    this.isGraphOpen = true;
    this.isManualOpen = false;
    this.isStudyOpen = false;
    this.appMainContent?.classList.add("graph-active");
    this.mainIdeLayout.style.display = "none";
    this.manualViewMount.style.display = "none";
    this.studyViewMount.style.display = "none";
    this.graphViewMount.style.display = "flex";
    this.graphView?.onShow();
    this.topbar?.render();
    this.sidebar?.render();
  }
  showManual() {
    this.flushCurrentEditorState();
    this.isManualOpen = true;
    this.isGraphOpen = false;
    this.isStudyOpen = false;
    this.appMainContent?.classList.remove("graph-active");
    this.mainIdeLayout.style.display = "none";
    this.graphViewMount.style.display = "none";
    this.studyViewMount.style.display = "none";
    this.manualViewMount.style.display = "block";
    this.topbar?.render();
    this.sidebar?.render();
  }
  showEditor() {
    this.isManualOpen = false;
    this.isGraphOpen = false;
    this.isStudyOpen = false;
    this.appMainContent?.classList.remove("graph-active");
    this.manualViewMount.style.display = "none";
    this.graphViewMount.style.display = "none";
    this.studyViewMount.style.display = "none";
    this.mainIdeLayout.style.display = "grid";
    this.topbar?.render();
    this.sidebar?.render();
  }
  toggleStudy() {
    if (this.isStudyOpen) {
      this.showEditor();
    } else {
      this.showStudy();
    }
  }
  toggleManual() {
    if (this.isManualOpen) {
      this.showEditor();
    } else {
      this.showManual();
    }
  }
  toggleGraph() {
    if (this.isGraphOpen) {
      this.showEditor();
    } else {
      this.showGraph();
    }
  }
  setDirty(dirty) {
    this.isDirty = dirty;
    const dot = this.btnCompile?.querySelector(".compile-dirty-dot");
    if (dot) {
      dot.style.display = dirty ? "inline-block" : "none";
    }
  }
  /**
   * 1981 IBM PC BIOS POST & Bellek Derlemesi:
   * Projedeki tüm dosyalar kendi ORG adreslerine göre doğrudan 1 MB RAM'e yazılır.
   * BIOS önyüklemesi gerçekleştirilir (0000:7C00h bootloader landing).
   */
  handleCompileWorkspace() {
    const currentActiveFile = this.workspace.getActiveFile();
    if (currentActiveFile) {
      const editorCode = this.editor.getCode();
      this.workspace.updateFileCode(currentActiveFile.id, editorCode);
    }
    const project = this.workspace.getProject();
    const files = project.files;
    this.addrToSourceMap.clear();
    this.cpu.reset();
    let bootFileWith7C00 = null;
    let activeFileOrigin = 256;
    for (const file of files) {
      const codeToAssemble = currentActiveFile && file.id === currentActiveFile.id ? this.editor.getCode() : file.code;
      const res = Assembler.assemble(codeToAssemble);
      if (res.errors.length > 0) {
        this.flushCurrentEditorState();
        if (this.workspace.getActiveFile().id !== file.id) {
          this.switchToFile(file.id);
        }
        this.editor.setErrors(res.errors);
        this.consoleView.log(`\u274C [${file.name}] Derleme Hatas\u0131: ${res.errors.length} hata bulundu.`, "error");
        res.errors.forEach((err) => {
          this.consoleView.log(`  \u2022 [${file.name}] Sat\u0131r ${err.line}: ${err.message}`, "error");
        });
        this.isCompiled = false;
        return false;
      }
      let origin = res.origin;
      if (origin === 0) {
        const hasExplicitOrg0 = /^\s*ORG\s+0+H?\b/im.test(codeToAssemble);
        if (!hasExplicitOrg0) {
          origin = file.name.toLowerCase().includes("boot") || codeToAssemble.includes("7C00") ? 31744 : 256;
        }
      }
      if (origin === 31744) {
        bootFileWith7C00 = { file, origin };
      }
      if (currentActiveFile && file.id === currentActiveFile.id) {
        activeFileOrigin = origin;
      }
      if (currentActiveFile && file.id !== currentActiveFile.id && origin === activeFileOrigin) {
        continue;
      }
      this.cpu.mem.loadBytes(this.cpu.regs.cs, origin, res.bytes, "code");
      for (const item of res.listing) {
        const phys = this.cpu.mem.toPhys(this.cpu.regs.cs, item.addr);
        this.addrToSourceMap.set(phys, { fileId: file.id, line: item.line });
      }
    }
    let bootOrigin = activeFileOrigin;
    this.cpu.regs.ip = bootOrigin;
    this.cpu.regs.sp = bootOrigin === 31744 ? 31744 : 65534;
    if (bootOrigin === 31744) {
      this.cpu.regs.ds = 0;
      this.cpu.regs.es = 0;
      this.cpu.regs.ss = 0;
    }
    this.cpu.flags.if = true;
    this.editor.clearErrors();
    this.setDirty(false);
    this.isCompiled = true;
    const startPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, bootOrigin);
    this.memoryView.syncOrigin(startPhys);
    this.memoryView.jumpToPhys(startPhys);
    this.syncEditorToCurrentIp();
    this.updateStepBackState();
    this.updateCpuViews();
    this.consoleView.updateVram(this.cpu.mem.data);
    this.consoleView.log(`\u2713 [BIOS POST] 1 MB RAM haz\u0131rland\u0131. Sistem \xF6ny\xFCklendi: CS:${this.cpu.regs.ip.toString(16).toUpperCase().padStart(4, "0")}h (${files.length} dosya belle\u011Fe y\xFCklendi)`, "success");
    return true;
  }
  handleNext() {
    if (!this.isCompiled || this.isDirty) {
      const ok = this.handleCompileWorkspace();
      if (!ok) return;
    }
    if (this.cpu.halted) {
      this.consoleView.log("\u0130\u015Flemci durduruldu (HLT). Ba\u015Ftan ba\u015Flatmak i\xE7in RESET yap\u0131n.", "warn");
      return;
    }
    let info;
    try {
      info = this.cpu.step();
    } catch (err) {
      this.consoleView.log(`\u274C \xC7al\u0131\u015Fma zaman\u0131 hatas\u0131: ${err.message || err}`, "error");
      this.handleStop();
      return;
    }
    if (info.error) {
      this.consoleView.log(`\u274C [Donan\u0131m Hatas\u0131] ${info.error}`, "error");
      this.handleStop();
      return;
    }
    if (info.consoleText) {
      if (info.consoleText.startsWith("[")) {
        const isPort = info.consoleText.includes("Port");
        this.consoleView.log(info.consoleText, isPort ? "port" : "info");
      } else {
        this.consoleView.appendStdout(info.consoleText);
      }
    }
    if (info.waitingForInput) {
      this.handleStop();
      this.consoleView.setWaitingForInput(true);
      this.updateCpuViews();
      this.consoleView.updateVram(this.cpu.mem.data);
      return;
    }
    this.syncEditorToCurrentIp();
    this.updateCpuViews();
    this.updateStepBackState();
    this.consoleView.updateVram(this.cpu.mem.data);
    if (this.cpu.halted) {
      this.consoleView.log("\u0130\u015Flemci durduruldu.", "info");
      this.handleStop();
    }
  }
  syncEditorToCurrentIp() {
    const currentPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, this.cpu.regs.ip);
    const srcInfo = this.addrToSourceMap.get(currentPhys);
    if (srcInfo) {
      if (this.workspace.getActiveFile().id !== srcInfo.fileId) {
        this.switchToFile(srcInfo.fileId);
      }
      this.editor.setActiveLine(srcInfo.line);
    } else {
      this.editor.setActiveLine(null);
    }
  }
  handleRun() {
    if (!this.isCompiled || this.isDirty) {
      const ok = this.handleCompileWorkspace();
      if (!ok) return;
    }
    if (this.cpu.halted) {
      this.consoleView.log("\u0130\u015Flemci zaten durduruldu. RESET ile ba\u015Ftan ba\u015Flat\u0131n.", "warn");
      return;
    }
    document.getElementById("console-container")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    this.isRunning = true;
    this.btnRun.disabled = true;
    this.btnNext.disabled = true;
    this.btnStop.disabled = false;
    this.btnCompile.disabled = true;
    this.consoleView.setRunningState(true);
    const stepLoop = () => {
      if (!this.isRunning) return;
      const batch = getSpeedBatchSize(this.speed);
      for (let i = 0; i < batch; i++) {
        const currentPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, this.cpu.regs.ip);
        const srcInfo = this.addrToSourceMap.get(currentPhys);
        if (i > 0 && srcInfo && srcInfo.fileId === this.workspace.getActiveFile().id && this.editor.isBreakpoint(srcInfo.line)) {
          this.consoleView.log(`Kesme noktas\u0131na (Breakpoint) ula\u015F\u0131ld\u0131: [${this.workspace.getActiveFile().name}] Sat\u0131r ${srcInfo.line}`, "info");
          this.syncEditorToCurrentIp();
          this.updateCpuViews();
          this.updateStepBackState();
          this.consoleView.updateVram(this.cpu.mem.data);
          this.handleStop();
          return;
        }
        let info;
        try {
          info = this.cpu.step();
        } catch (err) {
          this.consoleView.log(`\u274C \xC7al\u0131\u015Fma zaman\u0131 hatas\u0131: ${err.message || err}`, "error");
          this.handleStop();
          return;
        }
        if (info.error) {
          this.consoleView.log(`\u274C [Donan\u0131m Hatas\u0131] ${info.error}`, "error");
          this.handleStop();
          return;
        }
        if (info.consoleText && batch === 1) {
          if (info.consoleText.startsWith("[")) {
            const isPort = info.consoleText.includes("Port");
            this.consoleView.log(info.consoleText, isPort ? "port" : "info");
          } else {
            this.consoleView.appendStdout(info.consoleText);
          }
        }
        if (info.waitingForInput) {
          this.handleStop();
          this.consoleView.setWaitingForInput(true, "TU\u015E BEKLEN\u0130YOR (Bir tu\u015Fa bas\u0131n)");
          document.activeElement?.blur?.();
          this.updateCpuViews();
          this.consoleView.updateVram(this.cpu.mem.data);
          return;
        }
        if (this.cpu.halted) break;
      }
      this.syncEditorToCurrentIp();
      this.updateCpuViews();
      this.updateStepBackState();
      this.consoleView.updateVram(this.cpu.mem.data);
      if (this.cpu.halted) {
        this.consoleView.updateVram(this.cpu.mem.data);
        this.consoleView.log("\u0130\u015Flemci durduruldu.", "info");
        this.handleStop();
        return;
      }
      this.runTimer = window.setTimeout(stepLoop, getSpeedDelayMs(this.speed));
    };
    this.runTimer = window.setTimeout(stepLoop, getSpeedDelayMs(this.speed));
  }
  handleStop() {
    this.isRunning = false;
    this.consoleView.setRunningState(false);
    if (this.runTimer !== null) {
      clearTimeout(this.runTimer);
      this.runTimer = null;
    }
    if (this.btnRun) this.btnRun.disabled = false;
    if (this.btnNext) this.btnNext.disabled = false;
    if (this.btnStop) this.btnStop.disabled = true;
    if (this.btnCompile) this.btnCompile.disabled = false;
    this.updateStepBackState();
  }
  resetExecutionAndCpu() {
    this.handleStop();
    this.cpu.reset();
    this.cpu.regs.ip = 31744;
    this.cpu.regs.sp = 31744;
    this.cpu.flags.if = true;
    this.editor.setActiveLine(null);
    this.isCompiled = false;
    this.setDirty(false);
    this.addrToSourceMap.clear();
    this.updateStepBackState();
    this.updateCpuViews();
    this.consoleView.clear();
    this.consoleView.updateVram(this.cpu.mem.data);
  }
  handleReset() {
    this.handleStop();
    if (this.isCompiled) {
      this.handleCompileWorkspace();
    } else {
      this.cpu.reset();
      this.cpu.regs.ip = 31744;
      this.cpu.regs.sp = 31744;
      this.cpu.flags.if = true;
      this.editor.setActiveLine(null);
    }
    this.updateStepBackState();
    this.updateCpuViews();
    this.consoleView.clear();
    this.consoleView.updateVram(this.cpu.mem.data);
    this.consoleView.log("Bilgisayar (\u0130\u015Flemci ve RAM) s\u0131f\u0131rland\u0131.", "info");
  }
  handleStepBack() {
    if (!this.cpu.canStepBack() || this.isRunning) return;
    const ok = this.cpu.stepBack();
    if (ok) {
      this.syncEditorToCurrentIp();
      this.updateCpuViews();
      this.updateStepBackState();
      this.consoleView.updateVram(this.cpu.mem.data);
      this.consoleView.log("Bir ad\u0131m geri al\u0131nd\u0131 (Step Back).", "info");
    }
  }
  updateStepBackState() {
    if (this.btnStepBack) {
      this.btnStepBack.disabled = !this.cpu.canStepBack() || this.isRunning;
    }
  }
  updateCpuViews() {
    this.registerPanel?.update(this.cpu.regs, this.cpu.flags);
    this.memoryView?.render(this.cpu.mem, this.cpu.regs);
    this.consoleView?.updateVram(this.cpu.mem.data);
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
};
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    new App();
  });
}
export {
  App,
  getSpeedBatchSize,
  getSpeedDelayMs
};
//# sourceMappingURL=app.js.map
