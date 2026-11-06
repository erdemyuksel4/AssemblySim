import { describe, it, expect } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';
import { DEFAULT_CONSOLE_CODE } from '../src/workspace/workspaceManager.js';

describe('Bare-Metal 8086 Computer & Multi-File Memory Tests', () => {
  it('runs multiple files loaded into different addresses of unified 1 MB RAM', () => {
    // File 1: main.asm at 0x100
    const code1 = `
      ORG 100H
      MOV AX, 10H
      JMP 2000H
    `;

    // File 2: sub.asm at 0x2000
    const code2 = `
      ORG 2000H
      ADD AX, 25H
      HLT
    `;

    const res1 = Assembler.assemble(code1);
    const res2 = Assembler.assemble(code2);

    expect(res1.errors).toHaveLength(0);
    expect(res2.errors).toHaveLength(0);
    expect(res1.origin).toBe(0x100);
    expect(res2.origin).toBe(0x2000);

    const cpu = new CPU();
    cpu.reset();

    // Flash both files into the computer's unified RAM
    cpu.mem.loadBytes(cpu.regs.cs, res1.origin, res1.bytes, 'code');
    cpu.mem.loadBytes(cpu.regs.cs, res2.origin, res2.bytes, 'code');

    // Start execution from entry origin (0x100)
    cpu.regs.ip = res1.origin;

    // Step 1: MOV AX, 10h
    cpu.step();
    expect(cpu.regs.ax).toBe(0x10);

    // Step 2: JMP 2000h (jumps to the address where sub.asm is loaded!)
    cpu.step();
    expect(cpu.regs.ip).toBe(0x2000);

    // Step 3: ADD AX, 25h (executes code from sub.asm in RAM!)
    cpu.step();
    expect(cpu.regs.ax).toBe(0x35);

    // Step 4: HLT
    cpu.step();
    expect(cpu.halted).toBe(true);
  });

  it('triggers VRAM write notification when writing to 0B800h video memory', () => {
    const cpu = new CPU();
    cpu.reset();

    const writes: { offset: number; val: number }[] = [];
    cpu.mem.onVramWrite = (offset, val) => {
      writes.push({ offset, val });
    };

    // Write character 'H' (0x48) and attribute 0x0F (white on black) to B800:0000h
    cpu.mem.writeByte(0xB800, 0x0000, 0x48);
    cpu.mem.writeByte(0xB800, 0x0001, 0x0F);

    expect(writes).toHaveLength(2);
    expect(writes[0]).toEqual({ offset: 0, val: 0x48 });
    expect(writes[1]).toEqual({ offset: 1, val: 0x0F });
  });

  it('handles custom user interrupts via IVT (0000:0000h) and returns with IRET', () => {
    const cpu = new CPU();
    cpu.reset();

    // Initialize stack at 7000h
    cpu.regs.ss = 0x0000;
    cpu.regs.sp = 0x7000;

    // Define ISR at address 0x3000:
    // MOV BX, 42H
    // IRET (0xCF)
    const isrBytes = [
      0xBB, 0x42, 0x00, // MOV BX, 0042h
      0xCF              // IRET
    ];
    cpu.mem.loadBytes(0x0000, 0x3000, isrBytes, 'code');

    // Register ISR in IVT for interrupt 80h:
    // IVT entry for INT 80h is at physical address (0x80 * 4) = 0x0200
    // Vector format: IP (2 bytes), CS (2 bytes)
    cpu.mem.writeWord(0x0000, 0x80 * 4, 0x3000); // IP = 3000h
    cpu.mem.writeWord(0x0000, 0x80 * 4 + 2, 0x0000); // CS = 0000h

    // Main program at 0x100:
    // MOV AX, 11H
    // INT 80H
    // ADD AX, 1
    // HLT
    const mainCode = `
      ORG 100H
      MOV AX, 11H
      INT 80H
      ADD AX, 1
      HLT
    `;
    const res = Assembler.assemble(mainCode);
    expect(res.errors).toHaveLength(0);
    cpu.mem.loadBytes(cpu.regs.cs, res.origin, res.bytes, 'code');
    cpu.regs.ip = res.origin;

    // Step 1: MOV AX, 11h
    cpu.step();
    expect(cpu.regs.ax).toBe(0x11);

    // Step 2: INT 80h -> Pushes FLAGS, CS, IP and jumps to 0000:3000h (our custom ISR!)
    cpu.step();
    expect(cpu.regs.ip).toBe(0x3000);

    // Step 3: Inside ISR: MOV BX, 42h
    cpu.step();
    expect(cpu.regs.bx).toBe(0x42);

    // Step 4: IRET -> Pops IP, CS, FLAGS and returns to 0x100+instruction length!
    cpu.step();
    // Next instruction in main is ADD AX, 1
    cpu.step();
    expect(cpu.regs.ax).toBe(0x12);

    // Step 6: HLT
    cpu.step();
    expect(cpu.halted).toBe(true);
  });

  it('runs authentic bare-metal bootloader at 0000:7C00h writing directly to CGA VRAM', () => {
    const cpu = new CPU();
    cpu.reset();

    // Verify 1 MB memory has post-BIOS structures
    // IVT (INT 10h points to F000:1000)
    expect(cpu.mem.readWord(0x0000, 0x10 * 4)).toBe(0x1000);
    expect(cpu.mem.readWord(0x0000, 0x10 * 4 + 2)).toBe(0xF000);

    // BDA (Base memory 640 KB = 0x0280 at 0040:0013h)
    expect(cpu.mem.readWord(0x0040, 0x0013)).toBe(0x0280);

    // Reset Vector at FFFF:0000h (physical 0xFFFF0)
    expect(cpu.mem.data[0xFFFF0]).toBe(0xEA); // JMP FAR

    // BIOS Model Byte at 0xFFFFE (IBM PC 8086/8088 = 0xFF)
    expect(cpu.mem.data[0xFFFFE]).toBe(0xFF);

    // Default bootloader code at ORG 7C00H
    const bootloaderAsm = `
      ORG 7C00H
      CLI
      XOR AX, AX
      MOV DS, AX
      MOV ES, AX
      MOV SS, AX
      MOV SP, 7C00H
      STI

      MOV AX, 0B800H
      MOV ES, AX
      MOV BYTE PTR ES:[0000H], 42H   ; 'B'
      MOV BYTE PTR ES:[0001H], 0EH   ; Yellow attribute
      MOV BYTE PTR ES:[0002H], 4FH   ; 'O'
      MOV BYTE PTR ES:[0003H], 0EH
      HLT
    `;

    const res = Assembler.assemble(bootloaderAsm);
    expect(res.errors).toHaveLength(0);
    expect(res.origin).toBe(0x7C00);

    // Load into 1 MB computer RAM at 7C00h
    cpu.mem.loadBytes(0x0000, res.origin, res.bytes, 'code');
    cpu.regs.ip = 0x7C00;
    cpu.regs.sp = 0x7C00;

    // Run until HLT
    let steps = 0;
    while (!cpu.halted && steps < 50) {
      cpu.step();
      steps++;
    }

    expect(cpu.halted).toBe(true);

    // Check VRAM at 0xB8000
    // First char: 'B' (0x42) with attribute 0x0E
    expect(cpu.mem.readByte(0xB800, 0x0000)).toBe(0x42);
    expect(cpu.mem.readByte(0xB800, 0x0001)).toBe(0x0E);
    // Second char: 'O' (0x4F) with attribute 0x0E
    expect(cpu.mem.readByte(0xB800, 0x0002)).toBe(0x4F);
    expect(cpu.mem.readByte(0xB800, 0x0003)).toBe(0x0E);
  });

  it('correctly identifies 640 KB personal RAM area and forbids showing data beyond 1 MB', async () => {
    const { getMemoryRegionLabel, MemoryView } = await import('../src/ui/memoryView.js');

    // 00500h - 9FFFFh is unified 640 KB Personal / Conventional RAM
    expect(getMemoryRegionLabel(0x00500)).toContain('640 KB Kişisel Alan');
    expect(getMemoryRegionLabel(0x07C00)).toContain('640 KB Kişisel Alan');
    expect(getMemoryRegionLabel(0x50000)).toContain('640 KB Kişisel Alan');
    expect(getMemoryRegionLabel(0x9FFFE)).toContain('640 KB Kişisel Alan');

    // Outside 1 MB (>= 0x100000)
    expect(getMemoryRegionLabel(0x100000)).toContain('1 MB Sınırı Dışında');
    expect(getMemoryRegionLabel(0x200000)).toContain('1 MB Sınırı Dışında');

    // Check MemoryView does not show data when viewing outside 1 MB
    const div = {
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => []
    } as any;
    const mv = new MemoryView(div);
    const cpu = new CPU();
    cpu.reset();

    // Jump to 0xFFFA0 (near end of 1 MB)
    mv.jumpToPhys(0xFFFA0);
    mv.render(cpu.mem, cpu.regs);

    // Cells beyond 0xFFFFF must display '--' rather than wrapped 00000h IVT data
    expect(div.innerHTML).toContain('--');
    expect(div.innerHTML).toContain('1 MB RAM Dışı - Veri Yok');

    // VGA (A0000) and VRAM buttons must be unified as 'VGA VRAM (A0000)'
    expect(div.innerHTML).toContain('VGA VRAM (A0000)');
    expect(div.innerHTML).not.toContain('data-addr="B8000"');
    expect(getMemoryRegionLabel(0xA0000)).toContain('VGA VRAM');
  });

  it('executes authentic IBM PC ROM BIOS interrupts (INT 10h, 11h, 12h, 13h, 1Ah)', () => {
    const cpu = new CPU();
    cpu.reset();

    // 1. INT 11h (Equipment Check): returns 0x0021 in AX
    cpu.regs.cs = 0;
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x11, 0xF4], 'code'); // INT 11h; HLT
    cpu.step(); // INT 11h
    expect(cpu.regs.ax).toBe(0x0021);

    // 2. INT 12h (Conventional Memory): returns 640 KB in AX
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x12, 0xF4], 'code'); // INT 12h; HLT
    cpu.step(); // INT 12h
    expect(cpu.regs.ax).toBe(640);

    // 3. INT 10h AH=02h (Set Cursor Position to Row 5, Col 12)
    cpu.regs.ah = 0x02;
    cpu.regs.bh = 0x00;
    cpu.regs.dh = 5;
    cpu.regs.dl = 12;
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x10, 0xF4], 'code');
    cpu.step();
    // Verify BDA 0040:0050 has col 12, row 5
    expect(cpu.mem.readByte(0, 0x0450)).toBe(12);
    expect(cpu.mem.readByte(0, 0x0451)).toBe(5);
    // Verify CRTC cursor offset is 5 * 80 + 12 = 412
    expect(cpu.io.getCrtcCursorOffset()).toBe(412);

    // 4. INT 10h AH=03h (Get Cursor Position)
    cpu.regs.ah = 0x03;
    cpu.regs.bh = 0x00;
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x10, 0xF4], 'code');
    cpu.step();
    expect(cpu.regs.dh).toBe(5);
    expect(cpu.regs.dl).toBe(12);

    // 5. INT 10h AH=09h (Write character 'X' and attribute 0x1F at cursor)
    cpu.regs.ah = 0x09;
    cpu.regs.al = 0x58; // 'X'
    cpu.regs.bl = 0x1F; // White on blue
    cpu.regs.cx = 3;    // 3 times
    cpu.regs.bh = 0;
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x10, 0xF4], 'code');
    cpu.step();
    // Check VRAM at cursor (offset 412 * 2 = 824)
    const vramPhys = 0xB8000 + 412 * 2;
    expect(cpu.mem.readByte(0, vramPhys)).toBe(0x58);
    expect(cpu.mem.readByte(0, vramPhys + 1)).toBe(0x1F);
    expect(cpu.mem.readByte(0, vramPhys + 2)).toBe(0x58);
    expect(cpu.mem.readByte(0, vramPhys + 3)).toBe(0x1F);

    // 6. INT 10h AH=0Eh (Teletype print 'A')
    // Set cursor to (0, 0)
    cpu.mem.writeByte(0, 0x0450, 0);
    cpu.mem.writeByte(0, 0x0451, 0);
    cpu.regs.ah = 0x0E;
    cpu.regs.al = 0x41; // 'A'
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x10, 0xF4], 'code');
    cpu.step();
    expect(cpu.mem.readByte(0, 0xB8000)).toBe(0x41);
    expect(cpu.mem.readByte(0, 0x0450)).toBe(1); // Cursor advanced to col 1

    // 7. INT 13h (Floppy Diskette Services)
    // AH=00h: Reset diskette
    cpu.regs.ah = 0x00;
    cpu.regs.dl = 0x00;
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x13, 0xF4], 'code');
    cpu.step();
    expect(cpu.flags.cf).toBe(false);
    expect(cpu.regs.ah).toBe(0x00);

    // 8. INT 1Ah (System Time)
    // Set ticks to 0x1234:0x5678
    cpu.regs.ah = 0x01;
    cpu.regs.cx = 0x1234;
    cpu.regs.dx = 0x5678;
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x1A, 0xF4], 'code');
    cpu.step();
    // Get ticks back
    cpu.regs.ah = 0x00;
    cpu.regs.ip = 0x100;
    cpu.mem.loadBytes(0, 0x100, [0xCD, 0x1A, 0xF4], 'code');
    cpu.step();
    expect(cpu.regs.cx).toBe(0x1234);
    expect(cpu.regs.dx).toBe(0x5678);
  });

  it('interacts with 1981 IBM PC hardware I/O ports (8259 PIC, 8253 PIT, 8255 PPI, 6845 CRTC, CGA Status)', () => {
    const cpu = new CPU();
    cpu.reset();

    // 1. Port 20h: 8259A PIC EOI write
    cpu.io.writeByte(0x20, 0x20); // EOI

    // 2. Port 40h: 8253 PIT Timer channel 0 counter read cycles
    const tick1 = cpu.io.readByte(0x40);
    const tick2 = cpu.io.readByte(0x40);
    expect(tick1).not.toBe(tick2);

    // 3. Port 62h: 8255A PPI DIP Switches (Motherboard RAM 640KB, 80x25 Color)
    const dip = cpu.io.readByte(0x62);
    expect(dip).toBe(0x2D);

    // 4. Port 61h: 8255A PPI Port B Speaker Gate
    cpu.io.writeByte(0x61, 0x03); // Enable timer 2 and speaker
    expect(cpu.io.readByte(0x61)).toBe(0x03);

    // 5. Port 3D4h / 3D5h: 6845 CRTC Cursor registers
    // Select register 14 (0x0E - Cursor High)
    cpu.io.writeByte(0x3D4, 0x0E);
    cpu.io.writeByte(0x3D5, 0x02);
    // Select register 15 (0x0F - Cursor Low)
    cpu.io.writeByte(0x3D4, 0x0F);
    cpu.io.writeByte(0x3D5, 0x50);
    expect(cpu.io.getCrtcCursorOffset()).toBe(0x0250);

    // 6. Port 3DAh: CGA Status Register (bit 3 Vertical Retrace / VSync toggles)
    const status1 = cpu.io.readByte(0x3DA);
    const status2 = cpu.io.readByte(0x3DA);
    expect((status1 & 0x08) !== (status2 & 0x08)).toBe(true);
  });

  it('assembles TIMES directive with bootloader padding: times 510-($-$$) db 0 and dw 0AA55h', () => {
    const bootCode = `
      ORG 7C00H
      CLI
      XOR AX, AX
      MOV DS, AX
      TIMES 510 - ( $ - $$ ) DB 0
      DW 0AA55H
    `;

    const res = Assembler.assemble(bootCode);
    expect(res.errors).toHaveLength(0);
    expect(res.origin).toBe(0x7C00);

    // Total size of a valid IBM PC boot sector must be exactly 512 bytes!
    expect(res.bytes.length).toBe(512);

    // Last 2 bytes must be the authentic 0x55, 0xAA boot signature
    expect(res.bytes[510]).toBe(0x55);
    expect(res.bytes[511]).toBe(0xAA);
  });

  it('runs Mode 13h (320x200 graphics) drawing lines and filled boxes via INT 10h AH=0Ch', () => {
    const code = `
      ORG 7C00H
      XOR AX, AX
      MOV DS, AX
      MOV ES, AX
      MOV SS, AX
      MOV SP, 7C00H

      ; Mode 13h (320x200 256 colors)
      MOV AX, 0013H
      INT 10H

      ; Draw horizontal white line (color 0Fh) at Y=40 from X=50 to X=70
      MOV CX, 50
      MOV DX, 40
      MOV AL, 0FH
    Cizgi_Loop:
      MOV AH, 0CH
      MOV BH, 0
      INT 10H
      INC CX
      CMP CX, 70
      JNE Cizgi_Loop

      ; Draw small filled red box (color 04h) from X=120..130, Y=80..85
      MOV DX, 80
    Box_Y:
      MOV CX, 120
    Box_X:
      MOV AH, 0CH
      MOV AL, 04H
      MOV BH, 0
      INT 10H
      INC CX
      CMP CX, 130
      JNE Box_X
      INC DX
      CMP DX, 85
      JNE Box_Y

      HLT
    `;

    const res = Assembler.assemble(code);
    expect(res.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.reset();
    cpu.mem.loadBytes(0x0000, 0x7C00, res.bytes, 'code');
    cpu.regs.ip = 0x7C00;
    cpu.regs.sp = 0x7C00;

    let steps = 0;
    while (!cpu.halted && steps < 5000) {
      cpu.step();
      steps++;
    }

    expect(cpu.halted).toBe(true);

    // Verify video mode in BDA (0040:0049h) is 0x13
    expect(cpu.mem.readByte(0x0040, 0x0049)).toBe(0x13);

    // Verify white line in Mode 13h graphics VRAM (0xA0000)
    // Physical address: 0xA0000 + 40 * 320 + X
    const lineStartPhys = 0xA0000 + 40 * 320 + 50;
    const lineEndPhys = 0xA0000 + 40 * 320 + 69;
    expect(cpu.mem.data[lineStartPhys]).toBe(0x0F); // White pixel
    expect(cpu.mem.data[lineEndPhys]).toBe(0x0F);   // White pixel

    // Verify red box in Mode 13h graphics VRAM
    const boxPixelPhys = 0xA0000 + 80 * 320 + 120;
    expect(cpu.mem.data[boxPixelPhys]).toBe(0x04);  // Red pixel
  });

  it('assembles and runs interactive project file console.asm', () => {
    const res = Assembler.assemble(DEFAULT_CONSOLE_CODE);
    expect(res.errors).toHaveLength(0);
    expect(res.bytes.length).toBeGreaterThan(100);

    const cpu = new CPU();
    cpu.reset();
    cpu.loadCOM(res.bytes, 0x100);

    // Run until it prompts for input
    let steps = 0;
    while (!cpu.halted && steps < 1000) {
      const info = cpu.step();
      steps++;
      if (info.waitingForInput) break;
    }

    // Should be waiting for input at INT 21h AH=01h
    expect(cpu.regs.ah).toBe(0x01);

    // Verify characters were written to VRAM 0xB8000 (Row 1 starts at offset 160 due to leading CRLF)
    expect(cpu.mem.data[0xB8000 + 160]).toBe(0x3D); // '=' from "========================================"

    // Feed 'V' (version command)
    cpu.feedInput('V\r');

    // Run next cycle
    steps = 0;
    while (!cpu.halted && steps < 1000) {
      const info = cpu.step();
      steps++;
      if (info.waitingForInput) break;
    }

    // Feed 'Q' (quit command) to halt
    cpu.feedInput('Q\r');

    steps = 0;
    while (!cpu.halted && steps < 1000) {
      cpu.step();
      steps++;
    }

    expect(cpu.halted).toBe(true);
  });

  it('runs user program with Mode 13h line drawing, INT 16h input wait, and clean top-level RET', () => {
    const userCode = `
      org 500h

      mov ah, 00h
      mov al, 13h
      int 10h

      mov cx, 50
      mov dx, 100
      mov al, 0Eh

      cizim_dongusu:
      mov ah, 0Ch
      mov bh, 00h
      int 10h

      inc cx
      cmp cx, 250
      jne cizim_dongusu

      mov ah, 00h
      int 16h

      mov ah, 00h
      mov al, 03h
      int 10h

      ret
    `;

    const res = Assembler.assemble(userCode);
    expect(res.errors).toHaveLength(0);
    expect(res.origin).toBe(0x500);

    const cpu = new CPU();
    cpu.reset();
    cpu.loadCOM(res.bytes, res.origin);

    // Step until INT 16h waits for key input
    let steps = 0;
    let waiting = false;
    while (!cpu.halted && steps < 2000) {
      const info = cpu.step();
      steps++;
      if (info.waitingForInput) {
        waiting = true;
        break;
      }
    }

    expect(waiting).toBe(true);
    // Verify Mode 13h is set in BDA
    expect(cpu.mem.data[0x0449]).toBe(0x13);

    // Verify yellow pixels drawn in Mode 13h VRAM (0xA0000 + 100 * 320 + X)
    for (let x = 50; x < 250; x++) {
      const pixelOffset = 0xA0000 + (100 * 320 + x);
      expect(cpu.mem.data[pixelOffset]).toBe(0x0E); // Yellow color
    }

    // Now user presses a key (e.g. Enter or Space)
    cpu.feedInput('\r');

    // Run remaining steps to switch back to mode 3 and hit RET
    while (!cpu.halted && steps < 2500) {
      cpu.step();
      steps++;
    }

    expect(cpu.halted).toBe(true);
    // Mode should be back to 03h
    expect(cpu.mem.data[0x0449]).toBe(0x03);
  });

  it('executes full Power-On Reset from FFFF0h Reset Vector through ROM BIOS POST (F000:E05B) and C0000h/E0000h ROMs to 0000:7C00h', () => {
    const cpu = new CPU();
    cpu.powerOnReset();

    // 1. Verify initial CPU state at FFFF:0000h -> Physical 0xFFFF0
    expect(cpu.regs.cs).toBe(0xFFFF);
    expect(cpu.regs.ip).toBe(0x0000);
    expect(cpu.mem.toPhys(cpu.regs.cs, cpu.regs.ip)).toBe(0xFFFF0);

    // 2. Verify C0000h VGA Option ROM (55h AAh signature) & E0000h Expansion ROM exist
    expect(cpu.mem.data[0xC0000]).toBe(0x55);
    expect(cpu.mem.data[0xC0001]).toBe(0xAA);
    expect(String.fromCharCode(cpu.mem.data[0xE0000], cpu.mem.data[0xE0001], cpu.mem.data[0xE0002])).toBe('IBM');

    // Load a tiny bootloader at 0000:7C00h in 640 KB RAM: MOV AX, 1981h; HLT
    const bootRes = Assembler.assemble(`
      ORG 7C00H
      MOV AX, 1981H
      HLT
    `);
    cpu.mem.loadBytes(0x0000, 0x7C00, bootRes.bytes, 'code');

    // 3. Step 1: Execute Reset Vector at FFFF0h (JMP FAR F000:E05B)
    cpu.step();
    expect(cpu.regs.cs).toBe(0xF000);
    expect(cpu.regs.ip).toBe(0xE05B);

    // 4. Run remaining ROM BIOS POST instructions until bootloader at 0000:7C00h halts
    let steps = 0;
    while (!cpu.halted && steps < 30) {
      cpu.step();
      steps++;
    }

    expect(cpu.halted).toBe(true);
    expect(cpu.regs.cs).toBe(0x0000);
    expect(cpu.regs.ax).toBe(0x1981);
  });

  it('verifies Keyboard, Disk, and Sound Card modules communicate with programs by reading/writing 640 KB RAM (00500h-9FFFFh) and BDA (00400h)', async () => {
    const cpu = new CPU();
    cpu.reset();

    // --- 1. KEYBOARD MODULE (BDA 00400h circular buffer + 640 KB RAM 00500h) ---
    // Initially BDA head (041Ah) == tail (041Ch) == 0x001E
    expect(cpu.mem.readWord(0, 0x041A)).toBe(0x001E);
    expect(cpu.mem.readWord(0, 0x041C)).toBe(0x001E);

    cpu.feedInput('A');
    // Tail advances to 0x0020 and ASCII 'A' (0x41) is stored at 0x041E in BDA
    expect(cpu.mem.readWord(0, 0x041C)).toBe(0x0020);
    expect(cpu.mem.data[0x041E]).toBe(0x41);

    // Reading via Port 60h consumes key and advances head to 0x0020
    expect(cpu.io.readByte(0x60)).toBe(0x41);
    expect(cpu.mem.readWord(0, 0x041A)).toBe(0x0020);

    // --- 2. DISK MODULE (INT 13h AH=03h Write & AH=02h Read via 640 KB RAM) ---
    // Write signature bytes into 640 KB RAM at 0000:0500h
    cpu.mem.writeByte(0x0000, 0x0500, 0xDE);
    cpu.mem.writeByte(0x0000, 0x0501, 0xAD);
    cpu.mem.writeByte(0x0000, 0x0502, 0xBE);
    cpu.mem.writeByte(0x0000, 0x0503, 0xEF);

    const diskCode = `
      ORG 100H
      ; Write 1 sector from 0000:0500h to Track 0, Head 0, Sector 2
      XOR AX, AX
      MOV ES, AX
      MOV BX, 0500H
      MOV AH, 03H
      MOV AL, 01H
      MOV CH, 00H
      MOV CL, 02H
      MOV DH, 00H
      MOV DL, 00H
      INT 13H

      ; Read 1 sector from Track 0, Head 0, Sector 2 into 0000:0800h in 640 KB RAM
      MOV BX, 0800H
      MOV AH, 02H
      MOV AL, 01H
      INT 13H
      HLT
    `;
    const diskRes = Assembler.assemble(diskCode);
    expect(diskRes.errors).toHaveLength(0);
    cpu.mem.loadBytes(0, 0x0100, diskRes.bytes, 'code');
    cpu.regs.ip = 0x0100;
    while (!cpu.halted) cpu.step();

    // Verify Disk Controller copied sector into 0000:0800h in 640 KB RAM
    expect(cpu.mem.data[0x0800]).toBe(0xDE);
    expect(cpu.mem.data[0x0801]).toBe(0xAD);
    expect(cpu.mem.data[0x0802]).toBe(0xBE);
    expect(cpu.mem.data[0x0803]).toBe(0xEF);

    // --- 3. SOUND CARD MODULE (8237 DMA + Sound Blaster DSP reading PCM from 640 KB RAM at 00600h) ---
    const soundCode = `
      ORG 100H
      ; 1. Reset Sound Blaster DSP (Port 226h <- 1, then 0)
      MOV DX, 0226H
      MOV AL, 1
      OUT DX, AL
      MOV AL, 0
      OUT DX, AL

      ; 2. Program 8237 DMA Channel 1 to point to 0x00600 in 640 KB RAM
      OUT 0CH, AL       ; Clear flip-flop
      MOV AL, 00H
      OUT 02H, AL       ; Base Addr Low = 00h
      MOV AL, 06H
      OUT 02H, AL       ; Base Addr High = 06h (0600h)
      MOV AL, 00H
      OUT 83H, AL       ; Page 00h (physical 00600h)

      ; 3. Enable DSP Speaker (0xD1) and start 8-bit DMA Playback (0x14, len=3 -> 4 bytes)
      MOV DX, 022CH
      MOV AL, 0D1H
      OUT DX, AL
      MOV AL, 14H
      OUT DX, AL
      MOV AL, 03H       ; Low byte of (length - 1)
      OUT DX, AL
      MOV AL, 00H       ; High byte of (length - 1)
      OUT DX, AL
      HLT
    `;
    const soundRes = Assembler.assemble(soundCode);
    expect(soundRes.errors).toHaveLength(0);
    cpu.loadCOM(soundRes.bytes, 0x0100);

    // Place 4 audio PCM samples in 640 KB RAM at physical 0x00600
    const pcmSamples = [0x80, 0xC0, 0xFF, 0x40];
    for (let i = 0; i < pcmSamples.length; i++) {
      cpu.mem.writeByte(0x0000, 0x0600 + i, pcmSamples[i]);
    }

    while (!cpu.halted) cpu.step();

    expect(cpu.io.speakerEnabled).toBe(true);
    expect(Array.from(cpu.io.lastAudioSamples)).toEqual([0x80, 0xC0, 0xFF, 0x40]);

    // --- 4. VGA MODULE (Periodic scanVramFrame reading A0000h VRAM) ---
    const { ConsoleView } = await import('../src/ui/console.js');
    const mockContainer = {
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    } as any;
    const consoleView = new ConsoleView(mockContainer, { memory: cpu.mem });
    cpu.mem.data[0xA0000 + 320 * 10 + 20] = 0x28; // Write color byte into A0000h VRAM
    const updated = consoleView.scanVramFrame();
    expect(updated).toBe(true);
    expect(consoleView.videoMode).toBe(0x13);
    consoleView.destroy();
  });
});
