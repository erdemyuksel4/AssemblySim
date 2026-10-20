import { describe, it, expect } from 'vitest';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';

describe('Project Specification Acceptance Test', () => {
  it('assembles and executes the sample program correctly, reaching AL=19h, CX=0 and HLT', () => {
    const source = `
      ORG 100H ; DOS COM dosyası başlangıç direktifi
      START: LEA SI, DIZI ; Dizinin offset adresini SI'ya yükle
      MOV CX, 3 ; Eleman sayısı
      MOV AL, 0 ; Toplamı tutacak yazmaç
      TOPLA: ADD AL, [SI] ; SI adresindeki elemanı ekle
      INC SI ; Sonraki bayta geç
      LOOP TOPLA ; CX sıfır olana kadar dön
      HLT ; İşlemciyi durdur
      DIZI DB 5, 12, 8 ; Veri dizisi
    `;

    const asmResult = Assembler.assemble(source);

    // Ensure compilation succeeded without errors
    expect(asmResult.errors).toEqual([]);
    expect(asmResult.bytes.length).toBeGreaterThan(0);
    expect(asmResult.symbols.has('START')).toBe(true);
    expect(asmResult.symbols.has('TOPLA')).toBe(true);
    expect(asmResult.symbols.has('DIZI')).toBe(true);

    // Load into CPU at CS:0100h
    const cpu = new CPU();
    cpu.loadCOM(asmResult.bytes, asmResult.origin);

    // Run until HLT (max 1000 steps to protect against infinite loops)
    let steps = 0;
    while (!cpu.halted && steps < 1000) {
      const stepInfo = cpu.step();
      if (stepInfo.error) {
        throw new Error(`Execution error at step ${steps}: ${stepInfo.error}`);
      }
      steps++;
    }

    // Acceptance assertions:
    // AL = 19h (decimal 25: 5 + 12 + 8 = 25)
    expect(cpu.regs.al).toBe(0x19);
    // CX = 0
    expect(cpu.regs.cx).toBe(0);
    // CPU halted
    expect(cpu.halted).toBe(true);
  });
});
