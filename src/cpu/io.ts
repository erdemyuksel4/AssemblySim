import { Memory } from './memory.js';

export type PortWriteCallback = (port: number, val: number, isWord: boolean) => void;
export type PortReadCallback = (port: number, val: number, isWord: boolean) => void;

/**
 * 1981 IBM PC (Model 5150) / 8086 Hardware I/O & Peripheral Modules Manager (0000h - FFFFh)
 * Authentically models:
 * - Intel 8259A PIC (0x20, 0x21): EOI, IMR
 * - Intel 8237A DMA Controller (0x02, 0x03, 0x0C, 0x83): 640 KB RAM DMA transfers for Sound & Disk
 * - Intel 8253 PIT (0x40 - 0x43): Timer counter, PC speaker, mode
 * - Intel 8255A PPI (0x60 - 0x63): Keyboard scancode, Speaker gate, DIP switches
 * - Sound Blaster DSP (0x220 - 0x22E): Audio module reading PCM samples from 640 KB RAM via DMA
 * - Diskette Controller / INT 13h Sector Storage: Reads/writes 512-byte sectors to/from 640 KB RAM
 * - Motorola 6845 CRTC (0x3D4, 0x3D5): CGA/VGA Cursor registers 14/15
 * - CGA/VGA Video Status (0x3DA): Vertical retrace (VSync) toggle
 * - National 8250 UART (0x3F8 - 0x3FD): COM1 serial status
 */
export class IOPortManager {
  private ports: Uint8Array = new Uint8Array(65536);
  private inputQueue: number[] = [];
  private mem?: Memory;

  // Hardware emulation internal states
  private pitCounter: number = 0xFFFF;
  private crtcIndex: number = 0;
  private crtcRegisters: Uint8Array = new Uint8Array(32);
  private cgaStatus: number = 0x08;

  // 8237A DMA Channel 1 (Sound Card 640 KB RAM DMA)
  private dmaFlipFlop: boolean = false;
  private dmaCh1Addr: number = 0x0500;
  private dmaCh1Count: number = 0x0000;
  private dmaCh1Page: number = 0x00;

  // Sound Blaster DSP (Ports 220h - 22Eh)
  private dspResetState: number = 0;
  private dspReadBuffer: number[] = [];
  private dspPendingCmd: number | null = null;
  private dspCmdBytes: number[] = [];
  public speakerEnabled: boolean = false;
  public lastAudioSamples: Uint8Array = new Uint8Array(0);

  // Disk Sector Storage (LBA -> 512-byte Uint8Array)
  private diskSectors: Map<number, Uint8Array> = new Map();

  public onPortWrite?: PortWriteCallback;
  public onPortRead?: PortReadCallback;

  constructor(mem?: Memory) {
    this.mem = mem;
    this.reset();
  }

  attachMemory(mem: Memory): void {
    this.mem = mem;
  }

  reset(): void {
    this.ports.fill(0);
    this.inputQueue = [];
    this.pitCounter = 0xFFFF;
    this.crtcIndex = 0;
    this.crtcRegisters.fill(0);
    this.cgaStatus = 0x08;

    this.dmaFlipFlop = false;
    this.dmaCh1Addr = 0x0500;
    this.dmaCh1Count = 0x0000;
    this.dmaCh1Page = 0x00;

    this.dspResetState = 0;
    this.dspReadBuffer = [];
    this.dspPendingCmd = null;
    this.dspCmdBytes = [];
    this.speakerEnabled = false;
    this.lastAudioSamples = new Uint8Array(0);
    this.diskSectors.clear();

    // Authentic 1981 IBM PC default port states:
    // 8259A PIC: Port 21h (IMR - Interrupt Mask Register)
    this.ports[0x21] = 0xFC; // IRQ0 (Timer) & IRQ1 (Keyboard) unmasked

    // 8255 PPI:
    this.ports[0x60] = 0x00; // Keyboard data scancode
    this.ports[0x61] = 0x00; // Speaker gate off
    this.ports[0x62] = 0x2D; // Motherboard DIP switch (640K RAM, 80x25 color CGA, 1 floppy)
    this.ports[0x64] = 0x00;

    // Sound Blaster DSP status: Ready to receive commands
    this.ports[0x22C] = 0x00; // Bit 7 = 0 (Ready for write)
    this.ports[0x22E] = 0x00; // Bit 7 = 0 (No read data pending)

    // 6845 CRTC default cursor at (0,0)
    this.crtcRegisters[0x0E] = 0x00; // Cursor High
    this.crtcRegisters[0x0F] = 0x00; // Cursor Low

    // 8250 UART COM1:
    this.ports[0x3FD] = 0x60; // Line status: Transmitter ready / empty
  }

  /**
   * Feed characters or bytes from user/terminal into the input queue
   * and synchronize with BDA (0x00400) keyboard ring buffer in RAM.
   */
  feedInput(data: string | number | number[]): void {
    const pushByte = (b: number) => {
      const clean = b & 0xFF;
      this.inputQueue.push(clean);
      this.ports[0x60] = clean;
      this.mem?.pushKeyboardBuffer(clean, 0x00);
    };

    if (typeof data === 'string') {
      for (let i = 0; i < data.length; i++) {
        pushByte(data.charCodeAt(i));
      }
    } else if (Array.isArray(data)) {
      for (const b of data) {
        pushByte(b);
      }
    } else {
      pushByte(data);
    }
  }

  /**
   * Check if keyboard / input buffer has pending data
   */
  hasInput(): boolean {
    return this.inputQueue.length > 0;
  }

  /**
   * Consume next byte from input queue and advance BDA keyboard buffer head
   */
  popInput(): number | undefined {
    const val = this.inputQueue.shift();
    if (val !== undefined) {
      this.mem?.consumeKeyboardBuffer();
    }
    return val;
  }

  /**
   * Peek next byte without consuming
   */
  peekInput(): number | undefined {
    return this.inputQueue[0];
  }

  /**
   * Writes 512-byte sector from 640 KB Conventional RAM (seg:off) to Disk storage
   */
  writeSectorFromRam(mem: Memory, lba: number, seg: number, off: number): void {
    const sector = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      sector[i] = mem.readByte(seg, (off + i) & 0xFFFF, true);
    }
    this.diskSectors.set(lba, sector);
  }

  /**
   * Reads 512-byte sector from Disk storage into 640 KB Conventional RAM (seg:off)
   */
  readSectorToRam(mem: Memory, lba: number, seg: number, off: number): void {
    const saved = this.diskSectors.get(lba);
    if (saved) {
      for (let i = 0; i < 512; i++) {
        mem.writeByte(seg, (off + i) & 0xFFFF, saved[i], true);
      }
    } else if (lba === 0) {
      // Default boot sector mirrors 0000:7C00h
      for (let i = 0; i < 512; i++) {
        const val = mem.readByte(0, 0x7C00 + i, false);
        mem.writeByte(seg, (off + i) & 0xFFFF, val, true);
      }
    } else {
      for (let i = 0; i < 512; i++) {
        mem.writeByte(seg, (off + i) & 0xFFFF, 0, true);
      }
    }
  }

  /**
   * Executes Sound Card 8237 DMA transfer from 640 KB Conventional RAM
   */
  triggerSoundDma(lengthOverride?: number): Uint8Array {
    if (!this.mem) return new Uint8Array(0);
    const totalBytes = lengthOverride !== undefined ? lengthOverride : (this.dmaCh1Count + 1);
    const physBase = ((this.dmaCh1Page & 0x0F) << 16) | (this.dmaCh1Addr & 0xFFFF);
    const count = Math.max(0, Math.min(totalBytes, 65536));
    const samples = new Uint8Array(count);

    for (let i = 0; i < count; i++) {
      const phys = (physBase + i) & 0xFFFFF;
      const seg = (phys >> 4) & 0xF000;
      const off = phys & 0xFFFF;
      samples[i] = this.mem.readByte(seg, off, true);
    }

    this.lastAudioSamples = samples;
    return samples;
  }

  /**
   * Gets current DMA Channel 1 physical address in 1 MB space
   */
  getDmaCh1PhysicalAddress(): number {
    return (((this.dmaCh1Page & 0x0F) << 16) | (this.dmaCh1Addr & 0xFFFF)) & 0xFFFFF;
  }

  /**
   * Read 8-bit byte from I/O port
   */
  readByte(port: number): number {
    port = port & 0xFFFF;
    let val: number;

    switch (port) {
      // 8237A DMA Channel 1 Address & Count
      case 0x02:
        val = !this.dmaFlipFlop ? (this.dmaCh1Addr & 0xFF) : ((this.dmaCh1Addr >> 8) & 0xFF);
        this.dmaFlipFlop = !this.dmaFlipFlop;
        break;
      case 0x03:
        val = !this.dmaFlipFlop ? (this.dmaCh1Count & 0xFF) : ((this.dmaCh1Count >> 8) & 0xFF);
        this.dmaFlipFlop = !this.dmaFlipFlop;
        break;
      case 0x83:
        val = this.dmaCh1Page;
        break;

      // 8259A PIC Command/Status (Port 20h)
      case 0x20:
        val = this.ports[0x20];
        break;

      // 8259A PIC Mask Register (Port 21h)
      case 0x21:
        val = this.ports[0x21];
        break;

      // 8253 PIT Channel 0 Counter (Port 40h) - cycles continuously at 1.19318 MHz
      case 0x40:
        this.pitCounter = (this.pitCounter - 1) & 0xFFFF;
        val = this.pitCounter & 0xFF;
        break;

      // 8253 PIT Channel 2 Counter (Port 42h) - PC Speaker
      case 0x42:
        val = this.ports[0x42];
        break;

      // 8255A PPI Port A: Keyboard Data Scancode (Port 60h)
      case 0x60:
        if (this.inputQueue.length > 0) {
          val = this.popInput()!;
        } else {
          val = this.ports[0x60];
        }
        break;

      // 8255A PPI Port B: System Control & Speaker Gate (Port 61h)
      case 0x61:
        val = this.ports[0x61];
        break;

      // 8255A PPI Port C: Motherboard Configuration DIP Switches (Port 62h)
      case 0x62:
        val = this.ports[0x62] || 0x2D; // 640KB RAM, 80x25 Color CGA, 1 Floppy
        break;

      // Sound Blaster DSP Read Data (Port 22Ah)
      case 0x22A:
        if (this.dspReadBuffer.length > 0) {
          val = this.dspReadBuffer.shift()!;
          if (this.dspReadBuffer.length === 0) {
            this.ports[0x22E] = 0x00;
          }
        } else {
          val = this.ports[0x22A] || 0xAA;
        }
        break;

      // Sound Blaster DSP Write Buffer Status (Port 22Ch)
      case 0x22C:
        val = 0x00; // Bit 7 = 0 means DSP is ready to accept commands/data
        break;

      // Sound Blaster DSP Read Buffer Status / IRQ Ack (Port 22Eh)
      case 0x22E:
        val = this.dspReadBuffer.length > 0 ? 0x80 : 0x00;
        break;

      // 6845 CRTC Data Register (Port 3D5h)
      case 0x3D5:
        val = this.crtcRegisters[this.crtcIndex & 0x1F] || 0;
        break;

      // CGA/VGA Status Register (Port 3DAh)
      case 0x3DA:
        // Toggle bit 3 (Vertical Retrace / VSync) on read so raster waits don't deadlock
        this.cgaStatus ^= 0x08;
        val = this.cgaStatus;
        break;

      // 8250 UART COM1 Line Status (Port 3FDh)
      case 0x3FD:
        val = 0x60; // Transmitter empty, ready for next byte
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
  readWord(port: number): number {
    const lo = this.readByte(port);
    const hi = this.readByte((port + 1) & 0xFFFF);
    const val = lo | (hi << 8);
    this.onPortRead?.(port, val, true);
    return val;
  }

  /**
   * Write 8-bit byte to I/O port
   */
  writeByte(port: number, val: number): void {
    port = port & 0xFFFF;
    val = val & 0xFF;
    this.ports[port] = val;

    switch (port) {
      // 8237A DMA Channel 1 Base Address (Port 02h)
      case 0x02:
        if (!this.dmaFlipFlop) {
          this.dmaCh1Addr = (this.dmaCh1Addr & 0xFF00) | val;
        } else {
          this.dmaCh1Addr = (this.dmaCh1Addr & 0x00FF) | (val << 8);
        }
        this.dmaFlipFlop = !this.dmaFlipFlop;
        break;

      // 8237A DMA Channel 1 Count (Port 03h)
      case 0x03:
        if (!this.dmaFlipFlop) {
          this.dmaCh1Count = (this.dmaCh1Count & 0xFF00) | val;
        } else {
          this.dmaCh1Count = (this.dmaCh1Count & 0x00FF) | (val << 8);
        }
        this.dmaFlipFlop = !this.dmaFlipFlop;
        break;

      // 8237A DMA Clear Byte Pointer Flip-Flop (Port 0Ch)
      case 0x0C:
        this.dmaFlipFlop = false;
        break;

      // 8237A DMA Channel 1 Page Register (Port 83h)
      case 0x83:
        this.dmaCh1Page = val & 0x0F;
        break;

      // 8259A PIC (Port 20h): Writing 0x20 acknowledges EOI (End Of Interrupt)
      case 0x20:
        if (val === 0x20) {
          // EOI acknowledged
        }
        break;

      // Sound Blaster DSP Reset (Port 226h)
      case 0x226:
        if (val === 1) {
          this.dspResetState = 1;
        } else if (val === 0 && this.dspResetState === 1) {
          this.dspResetState = 0;
          this.dspReadBuffer = [0xAA]; // DSP Ready byte
          this.ports[0x22A] = 0xAA;
          this.ports[0x22E] = 0x80; // Data available
        }
        break;

      // Sound Blaster DSP Write Command / Data (Port 22Ch)
      case 0x22C:
        if (this.dspPendingCmd === null) {
          if (val === 0xD1) {
            this.speakerEnabled = true;
          } else if (val === 0xD3) {
            this.speakerEnabled = false;
          } else if (val === 0xE1) {
            // DSP Version 2.01
            this.dspReadBuffer.push(0x02, 0x01);
            this.ports[0x22E] = 0x80;
          } else if (val === 0x10 || val === 0x40 || val === 0x14 || val === 0x24) {
            this.dspPendingCmd = val;
            this.dspCmdBytes = [];
          }
        } else {
          this.dspCmdBytes.push(val);
          if (this.dspPendingCmd === 0x10 && this.dspCmdBytes.length === 1) {
            // Direct 8-bit DAC sample
            this.lastAudioSamples = new Uint8Array([this.dspCmdBytes[0]]);
            this.dspPendingCmd = null;
          } else if (this.dspPendingCmd === 0x40 && this.dspCmdBytes.length === 1) {
            // Set Time Constant (sample rate)
            this.dspPendingCmd = null;
          } else if ((this.dspPendingCmd === 0x14 || this.dspPendingCmd === 0x24) && this.dspCmdBytes.length === 2) {
            // 8-bit DMA PCM Playback: length = (lo | (hi << 8)) + 1
            const blockLen = (this.dspCmdBytes[0] | (this.dspCmdBytes[1] << 8)) + 1;
            this.triggerSoundDma(blockLen);
            this.dspPendingCmd = null;
          }
        }
        break;

      // 6845 CRTC Index Register (Port 3D4h)
      case 0x3D4:
        this.crtcIndex = val & 0x1F;
        break;

      // 6845 CRTC Data Register (Port 3D5h)
      case 0x3D5:
        this.crtcRegisters[this.crtcIndex & 0x1F] = val;
        break;
    }

    this.onPortWrite?.(port, val, false);
  }

  /**
   * Write 16-bit word to I/O port
   */
  writeWord(port: number, val: number): void {
    port = port & 0xFFFF;
    val = val & 0xFFFF;
    this.writeByte(port, val & 0xFF);
    this.writeByte((port + 1) & 0xFFFF, (val >> 8) & 0xFF);
    this.onPortWrite?.(port, val, true);
  }

  /**
   * Gets current hardware cursor position from CRTC registers 14 and 15
   */
  getCrtcCursorOffset(): number {
    return (this.crtcRegisters[0x0E] << 8) | this.crtcRegisters[0x0F];
  }

  /**
   * Sets CRTC cursor registers 14 and 15
   */
  setCrtcCursorOffset(offset: number): void {
    this.crtcRegisters[0x0E] = (offset >> 8) & 0xFF;
    this.crtcRegisters[0x0F] = offset & 0xFF;
  }
}
