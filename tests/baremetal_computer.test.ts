import { describe, it, expect } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';

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
});
