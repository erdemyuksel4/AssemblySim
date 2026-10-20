export interface RegisterState {
  ax: number;
  bx: number;
  cx: number;
  dx: number;
  si: number;
  di: number;
  bp: number;
  sp: number;
  ip: number;
  cs: number;
  ds: number;
  es: number;
  ss: number;
}

export type Reg16 = 'AX' | 'BX' | 'CX' | 'DX' | 'SI' | 'DI' | 'BP' | 'SP' | 'IP' | 'CS' | 'DS' | 'ES' | 'SS';
export type Reg8 = 'AL' | 'AH' | 'BL' | 'BH' | 'CL' | 'CH' | 'DL' | 'DH';
export type SegmentReg = 'CS' | 'DS' | 'ES' | 'SS';

export class Registers {
  // 16-bit registers (all initialized to 0000h)
  ax: number = 0;
  bx: number = 0;
  cx: number = 0;
  dx: number = 0;
  si: number = 0;
  di: number = 0;
  bp: number = 0;
  sp: number = 0x0000;
  ip: number = 0x0000;
  cs: number = 0x0000;
  ds: number = 0x0000;
  es: number = 0x0000;
  ss: number = 0x0000;

  // 8-bit getters & setters
  get al(): number { return this.ax & 0xFF; }
  set al(val: number) { this.ax = (this.ax & 0xFF00) | (val & 0xFF); }

  get ah(): number { return (this.ax >> 8) & 0xFF; }
  set ah(val: number) { this.ax = ((val & 0xFF) << 8) | (this.ax & 0x00FF); }

  get bl(): number { return this.bx & 0xFF; }
  set bl(val: number) { this.bx = (this.bx & 0xFF00) | (val & 0xFF); }

  get bh(): number { return (this.bx >> 8) & 0xFF; }
  set bh(val: number) { this.bx = ((val & 0xFF) << 8) | (this.bx & 0x00FF); }

  get cl(): number { return this.cx & 0xFF; }
  set cl(val: number) { this.cx = (this.cx & 0xFF00) | (val & 0xFF); }

  get ch(): number { return (this.cx >> 8) & 0xFF; }
  set ch(val: number) { this.cx = ((val & 0xFF) << 8) | (this.cx & 0x00FF); }

  get dl(): number { return this.dx & 0xFF; }
  set dl(val: number) { this.dx = (this.dx & 0xFF00) | (val & 0xFF); }

  get dh(): number { return (this.dx >> 8) & 0xFF; }
  set dh(val: number) { this.dx = ((val & 0xFF) << 8) | (this.dx & 0x00FF); }

  resetCOM(): void {
    this.ax = 0;
    this.bx = 0;
    this.cx = 0;
    this.dx = 0;
    this.si = 0;
    this.di = 0;
    this.bp = 0;
    this.sp = 0x0000;
    this.ip = 0x0000;
    this.cs = 0x0000;
    this.ds = 0x0000;
    this.es = 0x0000;
    this.ss = 0x0000;
  }

  // 8086 standard reg index (0..7) for w=1 (16-bit)
  getReg16ByIndex(index: number): number {
    switch (index & 7) {
      case 0: return this.ax;
      case 1: return this.cx;
      case 2: return this.dx;
      case 3: return this.bx;
      case 4: return this.sp;
      case 5: return this.bp;
      case 6: return this.si;
      case 7: return this.di;
      default: return 0;
    }
  }

  setReg16ByIndex(index: number, val: number): void {
    const v = val & 0xFFFF;
    switch (index & 7) {
      case 0: this.ax = v; break;
      case 1: this.cx = v; break;
      case 2: this.dx = v; break;
      case 3: this.bx = v; break;
      case 4: this.sp = v; break;
      case 5: this.bp = v; break;
      case 6: this.si = v; break;
      case 7: this.di = v; break;
    }
  }

  // 8086 standard reg index (0..7) for w=0 (8-bit)
  getReg8ByIndex(index: number): number {
    switch (index & 7) {
      case 0: return this.al;
      case 1: return this.cl;
      case 2: return this.dl;
      case 3: return this.bl;
      case 4: return this.ah;
      case 5: return this.ch;
      case 6: return this.dh;
      case 7: return this.bh;
      default: return 0;
    }
  }

  setReg8ByIndex(index: number, val: number): void {
    const v = val & 0xFF;
    switch (index & 7) {
      case 0: this.al = v; break;
      case 1: this.cl = v; break;
      case 2: this.dl = v; break;
      case 3: this.bl = v; break;
      case 4: this.ah = v; break;
      case 5: this.ch = v; break;
      case 6: this.dh = v; break;
      case 7: this.bh = v; break;
    }
  }

  // Segment register index: 00=ES, 01=CS, 10=SS, 11=DS
  getSegRegByIndex(index: number): number {
    switch (index & 3) {
      case 0: return this.es;
      case 1: return this.cs;
      case 2: return this.ss;
      case 3: return this.ds;
      default: return 0;
    }
  }

  setSegRegByIndex(index: number, val: number): void {
    const v = val & 0xFFFF;
    switch (index & 3) {
      case 0: this.es = v; break;
      case 1: this.cs = v; break;
      case 2: this.ss = v; break;
      case 3: this.ds = v; break;
    }
  }

  getByName(name: string): number {
    const u = name.toUpperCase();
    switch (u) {
      case 'AX': return this.ax;
      case 'BX': return this.bx;
      case 'CX': return this.cx;
      case 'DX': return this.dx;
      case 'SI': return this.si;
      case 'DI': return this.di;
      case 'BP': return this.bp;
      case 'SP': return this.sp;
      case 'IP': return this.ip;
      case 'CS': return this.cs;
      case 'DS': return this.ds;
      case 'ES': return this.es;
      case 'SS': return this.ss;
      case 'AL': return this.al;
      case 'AH': return this.ah;
      case 'BL': return this.bl;
      case 'BH': return this.bh;
      case 'CL': return this.cl;
      case 'CH': return this.ch;
      case 'DL': return this.dl;
      case 'DH': return this.dh;
      default: throw new Error(`Unknown register: ${name}`);
    }
  }

  setByName(name: string, val: number): void {
    const u = name.toUpperCase();
    switch (u) {
      case 'AX': this.ax = val & 0xFFFF; break;
      case 'BX': this.bx = val & 0xFFFF; break;
      case 'CX': this.cx = val & 0xFFFF; break;
      case 'DX': this.dx = val & 0xFFFF; break;
      case 'SI': this.si = val & 0xFFFF; break;
      case 'DI': this.di = val & 0xFFFF; break;
      case 'BP': this.bp = val & 0xFFFF; break;
      case 'SP': this.sp = val & 0xFFFF; break;
      case 'IP': this.ip = val & 0xFFFF; break;
      case 'CS': this.cs = val & 0xFFFF; break;
      case 'DS': this.ds = val & 0xFFFF; break;
      case 'ES': this.es = val & 0xFFFF; break;
      case 'SS': this.ss = val & 0xFFFF; break;
      case 'AL': this.al = val & 0xFF; break;
      case 'AH': this.ah = val & 0xFF; break;
      case 'BL': this.bl = val & 0xFF; break;
      case 'BH': this.bh = val & 0xFF; break;
      case 'CL': this.cl = val & 0xFF; break;
      case 'CH': this.ch = val & 0xFF; break;
      case 'DL': this.dl = val & 0xFF; break;
      case 'DH': this.dh = val & 0xFF; break;
      default: throw new Error(`Unknown register: ${name}`);
    }
  }

  clone(): RegisterState {
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

  restore(state: RegisterState): void {
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
}
