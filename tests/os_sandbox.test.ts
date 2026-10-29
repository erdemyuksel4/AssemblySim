import { describe, it, expect } from 'vitest';
import { WorkspaceManager } from '../src/workspace/workspaceManager.js';
import { CpuInstanceManager } from '../src/cpu/instanceManager.js';
import { CPU } from '../src/cpu/cpu.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('OS Sandbox Altyapısı ve Proje Yönetimi', () => {
  it('yeni bir OS projesi oluşturulduğunda 5 temel modül dosyası otomatik oluşturulur', () => {
    const cpuManager = new CpuInstanceManager();
    const ws = new WorkspaceManager(cpuManager);

    const proj = ws.createOSProject('ErdemOS');
    expect(proj.name).toBe('ErdemOS');
    expect(proj.fileDocIds.length).toBe(5);

    const docs = ws.getAllDocuments();
    const projDocs = docs.filter(d => proj.fileDocIds.includes(d.id));
    expect(projDocs.length).toBe(5);

    const titles = projDocs.map(d => d.title);
    expect(titles).toContain('boot.asm');
    expect(titles).toContain('kernel.asm');
    expect(titles).toContain('screen.asm');
    expect(titles).toContain('keyboard.asm');
    expect(titles).toContain('shell.asm');
  });

  it('OS projesi ve modül dosyaları yeniden adlandırılabilir', () => {
    const cpuManager = new CpuInstanceManager();
    const ws = new WorkspaceManager(cpuManager);

    const proj = ws.createOSProject('BenimOS');
    const renamed = ws.renameOSProject(proj.id, 'RetroNova86');
    expect(renamed).toBe(true);
    expect(ws.getOSProject(proj.id)?.name).toBe('RetroNova86');

    const fileDocId = proj.fileDocIds[0];
    const fileRenamed = ws.renameDocument(fileDocId, 'my_bootloader.asm');
    expect(fileRenamed).toBe(true);
    expect(ws.getDocument(fileDocId)?.title).toBe('my_bootloader.asm');
  });

  it('OS projesine yeni özel modül eklenebilir ve silinebilir', () => {
    const cpuManager = new CpuInstanceManager();
    const ws = new WorkspaceManager(cpuManager);

    const proj = ws.createOSProject('TestOS');
    const newDoc = ws.addFileToOSProject(proj.id, 'timer.asm', 'custom', '; Timer surucusu\nHLT\n');
    expect(newDoc).not.toBeNull();
    expect(newDoc?.title).toBe('timer.asm');
    expect(proj.fileDocIds).toContain(newDoc!.id);

    // Modülü sil
    const deleted = ws.deleteOSFile(newDoc!.id);
    expect(deleted).toBe(true);
    expect(proj.fileDocIds).not.toContain(newDoc!.id);
  });

  it('IRET komutu hem assembler tarafindan kodlanir hem CPU tarafindan POP IP, CS, FLAGS olarak yurutulur', () => {
    const code = `
      ORG 100H
      IRET
    `;
    const res = Assembler.assemble(code);
    expect(res.errors.length).toBe(0);
    expect(res.bytes[0]).toBe(0xCF); // 0xCF = IRET opcode

    const cpu = new CPU();
    cpu.regs.cs = 0x0700;
    cpu.regs.ss = 0x0700;
    cpu.regs.sp = 0xFFF0;
    cpu.regs.ip = 0x0100;

    // Stack'e sırasıyla IP, CS, FLAGS yazalım
    // IRET çalıştığında: pop IP, pop CS, pop FLAGS yapacak
    cpu.mem.writeWord(0x0700, 0xFFF0, 0x0200, true); // new IP
    cpu.mem.writeWord(0x0700, 0xFFF2, 0x0800, true); // new CS
    cpu.mem.writeWord(0x0700, 0xFFF4, 0x0046, true); // new FLAGS (ZF=1, PF=1)

    // Opcode'u CS:IP'ye yazalım
    cpu.mem.writeByte(0x0700, 0x0100, 0xCF, true); // IRET

    const stepRes = cpu.step();
    expect(stepRes.error).toBeUndefined();
    expect(cpu.regs.ip).toBe(0x0200);
    expect(cpu.regs.cs).toBe(0x0800);
    expect(cpu.regs.sp).toBe(0xFFF6);
  });
});
