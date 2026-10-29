export type CellType = 'none' | 'code' | 'data';

export interface MemoryDiffEntry {
  physAddr: number;
  oldVal: number;
  newVal: number;
}

export class Memory {
  readonly size: number = 1 << 20; // 1 MB (0x100000)
  readonly data: Uint8Array;

  // Metadata for UI visualization
  readonly cellTypes: Uint8Array; // 0=none, 1=code, 2=data

  // Trackers for current step visualization and step-back restoration
  lastReads: Set<number> = new Set();
  lastWrites: Set<number> = new Set();
  lastWriteOldValues: Map<number, number> = new Map();

  constructor() {
    this.data = new Uint8Array(this.size);
    this.cellTypes = new Uint8Array(this.size);
    this.initHardwareRomAndVectors();
  }

  reset(): void {
    this.data.fill(0);
    this.cellTypes.fill(0);
    this.lastReads.clear();
    this.lastWrites.clear();
    this.lastWriteOldValues.clear();
    this.initHardwareRomAndVectors();
  }

  /**
   * Initializes standard 8086 IBM PC compatible hardware ROM BIOS,
   * Interrupt Vector Table (IVT), and BIOS Data Area (BDA).
   */
  private initHardwareRomAndVectors(): void {
    // 1. IVT (Interrupt Vector Table) at 0x00000 - 0x003FF
    // INT 10h (Video Service): Vector 0x10 -> Offset 0x0040 (F000:1000)
    this.data[0x0040] = 0x00; // IP low
    this.data[0x0041] = 0x10; // IP high (0x1000)
    this.data[0x0042] = 0x00; // CS low
    this.data[0x0043] = 0xF0; // CS high (0xF000)

    // INT 16h (Keyboard Service): Vector 0x16 -> Offset 0x0058 (F000:1600)
    this.data[0x0058] = 0x00;
    this.data[0x0059] = 0x16;
    this.data[0x005A] = 0x00;
    this.data[0x005B] = 0xF0;

    // INT 19h (Bootstrap loader): Vector 0x19 -> Offset 0x0064 (F000:E6F2)
    this.data[0x0064] = 0xF2;
    this.data[0x0065] = 0xE6;
    this.data[0x0066] = 0x00;
    this.data[0x0067] = 0xF0;

    // 2. BDA (BIOS Data Area) at 0x00400 - 0x004FF
    this.data[0x0410] = 0x41; // Equipment list
    this.data[0x0449] = 0x03; // Video mode 03h (80x25 16-color text)
    this.data[0x044A] = 80;   // Columns
    this.data[0x044B] = 0;

    // 3. ROM BIOS (0xF0000 - 0xFFFFF, 64 KB)
    const banner = "IBM COMPATIBLE 8086 ROM BIOS (C) 1981-2026 ASSEMBLY SIMULATOR";
    for (let i = 0; i < banner.length; i++) {
      this.data[0xF0000 + i] = banner.charCodeAt(i);
      this.cellTypes[0xF0000 + i] = 2; // data
    }

    // INT 10h Handler stub: CF (IRET)
    this.data[0xF1000] = 0xCF;
    this.cellTypes[0xF1000] = 1;

    // INT 16h Handler stub: CF (IRET)
    this.data[0xF1600] = 0xCF;
    this.cellTypes[0xF1600] = 1;

    // Standard BIOS Release Date at 0xFFFF5 (8 chars MM/DD/YY)
    const releaseDate = "01/01/81";
    for (let i = 0; i < releaseDate.length; i++) {
      this.data[0xFFFF5 + i] = releaseDate.charCodeAt(i);
      this.cellTypes[0xFFFF5 + i] = 2;
    }

    // 8086 Power-On Reset Vector at 0xFFFF0: JMP FAR F000:E05B (EA 5B E0 00 F0)
    this.data[0xFFFF0] = 0xEA;
    this.data[0xFFFF1] = 0x5B;
    this.data[0xFFFF2] = 0xE0;
    this.data[0xFFFF3] = 0x00;
    this.data[0xFFFF4] = 0xF0;
    for (let i = 0; i < 5; i++) {
      this.cellTypes[0xFFFF0 + i] = 1; // code
    }

    // System Model Byte at 0xFFFFE: 0xFF (Original IBM PC)
    this.data[0xFFFFE] = 0xFF;
  }

  clearAccessLogs(): void {
    this.lastReads.clear();
    this.lastWrites.clear();
    this.lastWriteOldValues.clear();
  }

  // 20-bit physical address calculation with wrap-around
  toPhys(seg: number, off: number): number {
    return (((seg & 0xFFFF) << 4) + (off & 0xFFFF)) & 0xFFFFF;
  }

  readByte(seg: number, off: number, track: boolean = true): number {
    const phys = this.toPhys(seg, off);
    if (track) this.lastReads.add(phys);
    return this.data[phys];
  }

  writeByte(seg: number, off: number, val: number, track: boolean = true): number {
    const phys = this.toPhys(seg, off);
    const oldVal = this.data[phys];
    const newVal = val & 0xFF;
    if (track && !this.lastWriteOldValues.has(phys)) {
      this.lastWriteOldValues.set(phys, oldVal);
    }
    this.data[phys] = newVal;
    if (track) this.lastWrites.add(phys);
    return oldVal;
  }

  // Word read in little-endian. Note: offset wraps at 0xFFFF within segment!
  readWord(seg: number, off: number, track: boolean = true): number {
    const lowOff = off & 0xFFFF;
    const highOff = (off + 1) & 0xFFFF;
    const low = this.readByte(seg, lowOff, track);
    const high = this.readByte(seg, highOff, track);
    return (high << 8) | low;
  }

  // Word write in little-endian. Offset wraps at 0xFFFF within segment.
  writeWord(seg: number, off: number, val: number, track: boolean = true): [number, number] {
    const lowOff = off & 0xFFFF;
    const highOff = (off + 1) & 0xFFFF;
    const oldLow = this.writeByte(seg, lowOff, val & 0xFF, track);
    const oldHigh = this.writeByte(seg, highOff, (val >> 8) & 0xFF, track);
    return [oldLow, oldHigh];
  }

  // Direct physical address access (used by UI memory inspector)
  readPhys(phys: number): number {
    return this.data[phys & 0xFFFFF];
  }

  writePhys(phys: number, val: number): void {
    this.data[phys & 0xFFFFF] = val & 0xFF;
  }

  setCellType(phys: number, type: CellType): void {
    const code = type === 'code' ? 1 : type === 'data' ? 2 : 0;
    this.cellTypes[phys & 0xFFFFF] = code;
  }

  getCellType(phys: number): CellType {
    const code = this.cellTypes[phys & 0xFFFFF];
    return code === 1 ? 'code' : code === 2 ? 'data' : 'none';
  }

  loadBytes(seg: number, off: number, bytes: Uint8Array | number[], type: CellType = 'code'): void {
    let currOff = off & 0xFFFF;
    for (let i = 0; i < bytes.length; i++) {
      const phys = this.toPhys(seg, currOff);
      this.data[phys] = bytes[i];
      this.setCellType(phys, type);
      currOff = (currOff + 1) & 0xFFFF;
    }
  }
}
