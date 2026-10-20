export interface FlagsState {
  cf: boolean;
  pf: boolean;
  af: boolean;
  zf: boolean;
  sf: boolean;
  tf: boolean;
  if: boolean;
  df: boolean;
  of: boolean;
}

// Precomputed parity table for low 8 bits (1 if even number of 1s, 0 if odd)
const PARITY_TABLE = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let count = 0;
  for (let bit = 0; bit < 8; bit++) {
    if ((i >> bit) & 1) count++;
  }
  PARITY_TABLE[i] = (count % 2 === 0) ? 1 : 0;
}

export class Flags {
  cf: boolean = false;
  pf: boolean = false;
  af: boolean = false;
  zf: boolean = false;
  sf: boolean = false;
  tf: boolean = false;
  if: boolean = true;  // By default interrupts enabled
  df: boolean = false; // 0 = forward (UP), 1 = backward (DOWN)
  of: boolean = false;

  reset(): void {
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

  clone(): FlagsState {
    return {
      cf: this.cf,
      pf: this.pf,
      af: this.af,
      zf: this.zf,
      sf: this.sf,
      tf: this.tf,
      if: this.if,
      df: this.df,
      of: this.of,
    };
  }

  restore(state: FlagsState): void {
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
  toLowByte(): number {
    let b = 0x02; // Bit 1 is always 1
    if (this.cf) b |= (1 << 0);
    if (this.pf) b |= (1 << 2);
    if (this.af) b |= (1 << 4);
    if (this.zf) b |= (1 << 6);
    if (this.sf) b |= (1 << 7);
    return b;
  }

  // Unpacks lower 8 bits of flags from AH for SAHF
  fromLowByte(b: number): void {
    this.cf = (b & (1 << 0)) !== 0;
    this.pf = (b & (1 << 2)) !== 0;
    this.af = (b & (1 << 4)) !== 0;
    this.zf = (b & (1 << 6)) !== 0;
    this.sf = (b & (1 << 7)) !== 0;
  }

  // Packs flags into a 16-bit word (for PUSHF / IRET)
  toWord(): number {
    let w = 0xF002; // 8086 reserved bits: bits 1, 12, 13, 14, 15 are typically 1
    if (this.cf) w |= (1 << 0);
    if (this.pf) w |= (1 << 2);
    if (this.af) w |= (1 << 4);
    if (this.zf) w |= (1 << 6);
    if (this.sf) w |= (1 << 7);
    if (this.tf) w |= (1 << 8);
    if (this.if) w |= (1 << 9);
    if (this.df) w |= (1 << 10);
    if (this.of) w |= (1 << 11);
    return w;
  }

  // Unpacks flags from a 16-bit word (for POPF)
  fromWord(w: number): void {
    this.cf = (w & (1 << 0)) !== 0;
    this.pf = (w & (1 << 2)) !== 0;
    this.af = (w & (1 << 4)) !== 0;
    this.zf = (w & (1 << 6)) !== 0;
    this.sf = (w & (1 << 7)) !== 0;
    this.tf = (w & (1 << 8)) !== 0;
    this.if = (w & (1 << 9)) !== 0;
    this.df = (w & (1 << 10)) !== 0;
    this.of = (w & (1 << 11)) !== 0;
  }

  // Updates flags for ADD / ADC: dest = a + b (+ carry)
  updateAdd(a: number, b: number, res: number, is16bit: boolean, cIn: number = 0): void {
    const mask = is16bit ? 0xFFFF : 0xFF;
    const signBit = is16bit ? 0x8000 : 0x80;
    const fullRes = a + b + cIn;

    this.cf = fullRes > mask;
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 0xFF] === 1;
    this.af = ((a & 0x0F) + (b & 0x0F) + cIn) > 0x0F;

    // Overflow occurs if both operands had same sign and result has different sign
    const signA = (a & signBit) !== 0;
    const signB = (b & signBit) !== 0;
    const signRes = (res & signBit) !== 0;
    this.of = (signA === signB) && (signA !== signRes);
  }

  // Updates flags for SUB / SBB / CMP: dest = a - b (- borrow)
  updateSub(a: number, b: number, res: number, is16bit: boolean, bIn: number = 0): void {
    const mask = is16bit ? 0xFFFF : 0xFF;
    const signBit = is16bit ? 0x8000 : 0x80;

    this.cf = a < (b + bIn);
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 0xFF] === 1;
    this.af = (a & 0x0F) < ((b & 0x0F) + bIn);

    // Overflow for subtraction: sign(a) != sign(b) && sign(res) != sign(a)
    const signA = (a & signBit) !== 0;
    const signB = (b & signBit) !== 0;
    const signRes = (res & signBit) !== 0;
    this.of = (signA !== signB) && (signA !== signRes);
  }

  // INC updates all flags except CF!
  updateInc(a: number, res: number, is16bit: boolean): void {
    const mask = is16bit ? 0xFFFF : 0xFF;
    const signBit = is16bit ? 0x8000 : 0x80;

    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 0xFF] === 1;
    this.af = (a & 0x0F) === 0x0F;
    // OF: 0x7FFF -> 0x8000 or 0x7F -> 0x80
    this.of = is16bit ? (a === 0x7FFF) : (a === 0x7F);
  }

  // DEC updates all flags except CF!
  updateDec(a: number, res: number, is16bit: boolean): void {
    const mask = is16bit ? 0xFFFF : 0xFF;
    const signBit = is16bit ? 0x8000 : 0x80;

    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 0xFF] === 1;
    this.af = (a & 0x0F) === 0;
    // OF: 0x8000 -> 0x7FFF or 0x80 -> 0x7F
    this.of = is16bit ? (a === 0x8000) : (a === 0x80);
  }

  // Updates flags for AND, OR, XOR, TEST: CF=0, OF=0, AF=0/undefined, SF, ZF, PF updated
  updateLogic(res: number, is16bit: boolean): void {
    const mask = is16bit ? 0xFFFF : 0xFF;
    const signBit = is16bit ? 0x8000 : 0x80;

    this.cf = false;
    this.of = false;
    this.af = false;
    this.zf = (res & mask) === 0;
    this.sf = (res & signBit) !== 0;
    this.pf = PARITY_TABLE[res & 0xFF] === 1;
  }

  // Updates flags for NEG: dest = 0 - a
  updateNeg(a: number, res: number, is16bit: boolean): void {
    const mask = is16bit ? 0xFFFF : 0xFF;
    this.cf = (a & mask) !== 0; // CF is 1 unless operand is 0
    this.updateSub(0, a, res, is16bit, 0);
  }
}
