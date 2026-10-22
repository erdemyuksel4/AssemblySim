export type PortWriteCallback = (port: number, val: number, isWord: boolean) => void;
export type PortReadCallback = (port: number, val: number, isWord: boolean) => void;

/**
 * 8086 I/O Port Manager (0000h - FFFFh)
 * Handles hardware port I/O (IN/OUT) and interactive keyboard input queue.
 */
export class IOPortManager {
  private ports: Uint8Array = new Uint8Array(65536);
  private inputQueue: number[] = [];

  public onPortWrite?: PortWriteCallback;
  public onPortRead?: PortReadCallback;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.ports.fill(0);
    this.inputQueue = [];
    // Default standard port initial states if any
    this.ports[0x60] = 0x00; // Keyboard data port default
    this.ports[0x64] = 0x00; // Keyboard status port default
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

    // Port 60h: Keyboard Data Port (PC / 8086 standard)
    if (port === 0x60) {
      if (this.inputQueue.length > 0) {
        val = this.inputQueue.shift()!;
      } else {
        val = this.ports[0x60];
      }
    } else {
      val = this.ports[port];
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
}
