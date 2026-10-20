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
  }

  reset(): void {
    this.data.fill(0);
    this.cellTypes.fill(0);
    this.lastReads.clear();
    this.lastWrites.clear();
    this.lastWriteOldValues.clear();
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
