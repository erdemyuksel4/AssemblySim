export type PortWriteCallback = (port: number, val: number, isWord: boolean) => void;
export type PortReadCallback = (port: number, val: number, isWord: boolean) => void;

/**
 * 1981 IBM PC (Model 5150) / 8086 Hardware I/O Port Manager (0000h - FFFFh)
 * Authentically models:
 * - Intel 8259A PIC (0x20, 0x21): EOI, IMR
 * - Intel 8253 PIT (0x40 - 0x43): Timer counter, PC speaker, mode
 * - Intel 8255A PPI (0x60 - 0x63): Keyboard scancode, Speaker gate, DIP switches
 * - Motorola 6845 CRTC (0x3D4, 0x3D5): CGA Cursor registers 14/15
 * - CGA Video Status (0x3DA): Vertical retrace (VSync) toggle
 * - National 8250 UART (0x3F8 - 0x3FD): COM1 serial status
 */
export class IOPortManager {
  private ports: Uint8Array = new Uint8Array(65536);
  private inputQueue: number[] = [];

  // Hardware emulation internal states
  private pitCounter: number = 0xFFFF;
  private crtcIndex: number = 0;
  private crtcRegisters: Uint8Array = new Uint8Array(32);
  private cgaStatus: number = 0x08;

  public onPortWrite?: PortWriteCallback;
  public onPortRead?: PortReadCallback;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.ports.fill(0);
    this.inputQueue = [];
    this.pitCounter = 0xFFFF;
    this.crtcIndex = 0;
    this.crtcRegisters.fill(0);
    this.cgaStatus = 0x08;

    // Authentic 1981 IBM PC default port states:
    // 8259A PIC: Port 21h (IMR - Interrupt Mask Register)
    this.ports[0x21] = 0xFC; // IRQ0 (Timer) & IRQ1 (Keyboard) unmasked

    // 8255 PPI:
    this.ports[0x60] = 0x00; // Keyboard data scancode
    this.ports[0x61] = 0x00; // Speaker gate off
    this.ports[0x62] = 0x2D; // Motherboard DIP switch (640K RAM, 80x25 color CGA, 1 floppy)
    this.ports[0x64] = 0x00;

    // 6845 CRTC default cursor at (0,0)
    this.crtcRegisters[0x0E] = 0x00; // Cursor High
    this.crtcRegisters[0x0F] = 0x00; // Cursor Low

    // 8250 UART COM1:
    this.ports[0x3FD] = 0x60; // Line status: Transmitter ready / empty
  }

  /**
   * Feed characters or bytes from user/terminal into the input queue
   */
  feedInput(data: string | number | number[]): void {
    if (typeof data === 'string') {
      for (let i = 0; i < data.length; i++) {
        this.inputQueue.push(data.charCodeAt(i) & 0xFF);
      }
    } else if (Array.isArray(data)) {
      for (const b of data) {
        this.inputQueue.push(b & 0xFF);
      }
    } else {
      this.inputQueue.push(data & 0xFF);
    }
  }

  /**
   * Check if keyboard / input buffer has pending data
   */
  hasInput(): boolean {
    return this.inputQueue.length > 0;
  }

  /**
   * Consume next byte from input queue
   */
  popInput(): number | undefined {
    return this.inputQueue.shift();
  }

  /**
   * Peek next byte without consuming
   */
  peekInput(): number | undefined {
    return this.inputQueue[0];
  }

  /**
   * Read 8-bit byte from I/O port
   */
  readByte(port: number): number {
    port = port & 0xFFFF;
    let val: number;

    switch (port) {
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
          val = this.inputQueue.shift()!;
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

      // 6845 CRTC Data Register (Port 3D5h)
      case 0x3D5:
        val = this.crtcRegisters[this.crtcIndex & 0x1F] || 0;
        break;

      // CGA Status Register (Port 3DAh)
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
      // 8259A PIC (Port 20h): Writing 0x20 acknowledges EOI (End Of Interrupt)
      case 0x20:
        if (val === 0x20) {
          // EOI acknowledged
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
