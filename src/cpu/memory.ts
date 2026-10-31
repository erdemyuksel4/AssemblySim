export type CellType = 'uninit' | 'code' | 'data' | 'stack';

export interface MemoryDiffEntry {
  physAddr: number;
  oldVal: number;
  newVal?: number;
}

export class Memory {
  readonly size: number = 1024 * 1024; // 1 MB (00000h - FFFFFh)
  readonly data: Uint8Array;
  readonly cellTypes: Uint8Array;

  // Trackers for current step visualization and step-back restoration
  lastReads: Set<number> = new Set();
  lastWrites: Set<number> = new Set();
  lastWriteOldValues: Map<number, number> = new Map();
  onVramWrite?: (vramOffset: number, val: number) => void;

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
   * Initializes authentic 1981 IBM PC compatible 8086 post-BIOS hardware state:
   * 1. IVT (Interrupt Vector Table): 0x00000 - 0x003FF (256 vectors)
   * 2. BDA (BIOS Data Area): 0x00400 - 0x004FF (Equipment, RAM size, Video mode)
   * 3. VRAM (CGA/VGA Text Mode): 0x0B8000 - 0x0B8FA0 (80x25 blank cells)
   * 4. ROM BIOS: 0x0F0000 - 0x0FFFFF (Handlers, Reset Vector at 0xFFFF0, Model Byte)
   */
  private initHardwareRomAndVectors(): void {
    // -------------------------------------------------------------
    // 1. IVT (Interrupt Vector Table) at 0x00000 - 0x003FF (1 KB)
    // -------------------------------------------------------------
    // All 256 interrupt vectors default to standard ROM BIOS default stub (F000:E6F2)
    for (let i = 0; i < 256; i++) {
      const vecOffset = i * 4;
      this.data[vecOffset] = 0xF2;     // IP low
      this.data[vecOffset + 1] = 0xE6; // IP high (0xE6F2)
      this.data[vecOffset + 2] = 0x00; // CS low
      this.data[vecOffset + 3] = 0xF0; // CS high (0xF000)
    }

    // Specific Standard BIOS Vectors:
    const setVector = (intNum: number, cs: number, ip: number) => {
      const off = intNum * 4;
      this.data[off] = ip & 0xFF;
      this.data[off + 1] = (ip >> 8) & 0xFF;
      this.data[off + 2] = cs & 0xFF;
      this.data[off + 3] = (cs >> 8) & 0xFF;
    };

    setVector(0x00, 0xF000, 0x1060); // INT 00h: Divide By Zero
    setVector(0x01, 0xF000, 0x1070); // INT 01h: Single Step / Trap
    setVector(0x02, 0xF000, 0x1075); // INT 02h: NMI
    setVector(0x03, 0xF000, 0x107A); // INT 03h: Breakpoint
    setVector(0x04, 0xF000, 0x107E); // INT 04h: Overflow (INTO)
    setVector(0x08, 0xF000, 0x1080); // INT 08h: IRQ0 Timer Tick (8253 PIT)
    setVector(0x09, 0xF000, 0x1090); // INT 09h: IRQ1 Keyboard Scan (Port 60h)
    setVector(0x10, 0xF000, 0x1000); // INT 10h: Video Services
    setVector(0x11, 0xF000, 0x1100); // INT 11h: Equipment Check
    setVector(0x12, 0xF000, 0x1200); // INT 12h: Conventional Memory Size
    setVector(0x13, 0xF000, 0x1300); // INT 13h: Diskette / Disk Services
    setVector(0x14, 0xF000, 0x1400); // INT 14h: Serial Communications
    setVector(0x15, 0xF000, 0x1500); // INT 15h: System Services
    setVector(0x16, 0xF000, 0x1600); // INT 16h: Keyboard BIOS Services
    setVector(0x17, 0xF000, 0x1700); // INT 17h: Printer Services
    setVector(0x18, 0xF600, 0x0000); // INT 18h: ROM Cassette BASIC
    setVector(0x19, 0xF000, 0xE6F2); // INT 19h: Bootstrap Loader
    setVector(0x1A, 0xF000, 0x1A00); // INT 1Ah: Real-Time Clock Services

    // Mark IVT as data
    for (let i = 0; i < 0x400; i++) {
      this.cellTypes[i] = 2; // data
    }

    // -------------------------------------------------------------
    // 2. BDA (BIOS Data Area) at 0x00400 - 0x004FF (256 bytes)
    // -------------------------------------------------------------
    this.data[0x0400] = 0xF8; this.data[0x0401] = 0x03; // COM1: 03F8h
    this.data[0x0402] = 0xF8; this.data[0x0403] = 0x02; // COM2: 02F8h
    this.data[0x0408] = 0x78; this.data[0x0409] = 0x03; // LPT1: 0378h
    this.data[0x0410] = 0x21; this.data[0x0411] = 0x00; // Equipment: 1 Floppy, 80x25 Color
    this.data[0x0413] = 0x80; this.data[0x0414] = 0x02; // Base Memory: 640 KB (0x0280)
    this.data[0x0417] = 0x00;                           // Keyboard status flags
    this.data[0x041A] = 0x1E; this.data[0x041B] = 0x00; // Key buffer head (001Eh)
    this.data[0x041C] = 0x1E; this.data[0x041D] = 0x00; // Key buffer tail (001Eh)
    this.data[0x0449] = 0x03;                           // Current video mode: 03h (80x25 color text)
    this.data[0x044A] = 80;   this.data[0x044B] = 0;    // Screen Columns: 80 (50h)
    this.data[0x044C] = 0x00; this.data[0x044D] = 0x10; // Video page size: 4096 bytes (1000h)
    this.data[0x0463] = 0xD4; this.data[0x0464] = 0x03; // CRTC base port: 03D4h (CGA/VGA color)

    for (let i = 0x400; i < 0x500; i++) {
      this.cellTypes[i] = 2; // data
    }

    // -------------------------------------------------------------
    // 3. CGA/VGA Text Mode VRAM at 0xB8000 - 0xBA000 (80x25 = 4000 bytes)
    // -------------------------------------------------------------
    // Initialize with blank spaces (ASCII 20h, Attribute 07h = light gray on black)
    for (let i = 0; i < 2000; i++) {
      const vramPhys = 0xB8000 + i * 2;
      this.data[vramPhys] = 0x20;     // ' '
      this.data[vramPhys + 1] = 0x07; // Attribute: light gray on black
      this.cellTypes[vramPhys] = 2;
      this.cellTypes[vramPhys + 1] = 2;
    }

    // -------------------------------------------------------------
    // 4. ROM BIOS at 0xF0000 - 0xFFFFF (64 KB)
    // -------------------------------------------------------------
    const banner = "IBM COMPATIBLE 8086 ROM BIOS (C) 1981 INTEL / IBM CORPORATION";
    for (let i = 0; i < banner.length; i++) {
      this.data[0xF0000 + i] = banner.charCodeAt(i);
      this.cellTypes[0xF0000 + i] = 2;
    }

    // Handlers stubs: CF (IRET)
    const handlerOffsets = [
      0xF1000, 0xF1060, 0xF1070, 0xF1075, 0xF107A, 0xF107E,
      0xF1080, 0xF1090, 0xF1100, 0xF1200, 0xF1300, 0xF1400,
      0xF1500, 0xF1600, 0xF1700, 0xFE6F2
    ];
    for (const h of handlerOffsets) {
      this.data[h] = 0xCF; // IRET
      this.cellTypes[h] = 1; // code
    }

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

    // System Model Byte at 0xFFFFE: 0xFF (Original IBM PC 8086/8088)
    this.data[0xFFFFE] = 0xFF;
    this.cellTypes[0xFFFFE] = 2;
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
    if (phys >= 0xB8000 && phys < 0xBA000) {
      this.onVramWrite?.(phys - 0xB8000, newVal);
    } else if (phys >= 0xA0000 && phys < 0xB0000) {
      this.onVramWrite?.(phys, newVal);
    }
    return oldVal;
  }

  // Direct physical byte write (used by stepBack and low-level subsystem)
  writePhys(phys: number, val: number): void {
    const p = phys & 0xFFFFF;
    this.data[p] = val & 0xFF;
    if (p >= 0xB8000 && p < 0xBA000) {
      this.onVramWrite?.(p - 0xB8000, val & 0xFF);
    } else if (p >= 0xA0000 && p < 0xB0000) {
      this.onVramWrite?.(p, val & 0xFF);
    }
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
  writeWord(seg: number, off: number, val: number, track: boolean = true): void {
    const lowOff = off & 0xFFFF;
    const highOff = (off + 1) & 0xFFFF;
    this.writeByte(seg, lowOff, val & 0xFF, track);
    this.writeByte(seg, highOff, (val >> 8) & 0xFF, track);
  }

  getCellType(phys: number): CellType {
    const t = this.cellTypes[phys & 0xFFFFF];
    if (t === 1) return 'code';
    if (t === 2) return 'data';
    if (t === 3) return 'stack';
    return 'uninit';
  }

  setCellType(phys: number, type: CellType): void {
    const p = phys & 0xFFFFF;
    let code: number = 0;
    if (type === 'code') code = 1;
    else if (type === 'data') code = 2;
    else if (type === 'stack') code = 3;
    this.cellTypes[p] = code;
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
