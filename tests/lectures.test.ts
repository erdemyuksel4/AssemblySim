import { describe, it, expect } from 'vitest';
import { MILESTONE_LECTURES } from '../src/lectures/lectureData.js';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';

describe('All Lecture Examples Verification', () => {
  for (const [milestoneKey, milestone] of Object.entries(MILESTONE_LECTURES)) {
    for (const section of milestone.sections) {
      if (!section.examples) continue;
      for (const ex of section.examples) {
        it(`${milestoneKey} - ${ex.title} (solutionCode)`, () => {
          if (!ex.solutionCode) return;
          const asm = Assembler.assemble(ex.solutionCode);
          if (asm.errors.length > 0) {
            console.error(`Assembly error in ${ex.title}:`, asm.errors);
          }
          expect(asm.errors).toEqual([]);
        });

        it(`${milestoneKey} - ${ex.title} (starter code)`, () => {
          if (!ex.code) return;
          const asm = Assembler.assemble(ex.code);
          if (asm.errors.length > 0) {
            console.error(`Starter assembly error in ${ex.title}:`, asm.errors);
          }
          expect(asm.errors).toEqual([]);
        });
      }
    }
  }

  it('verifies Mini-Lab 6.3 execution (CALL and RET mutlak deger)', () => {
    const section = MILESTONE_LECTURES['milestone-6']?.sections?.[2];
    const ex = section?.examples?.[0];
    expect(ex).toBeDefined();
    if (!ex) return;

    const asm = Assembler.assemble(ex.solutionCode);
    expect(asm.errors).toHaveLength(0);

    const cpu = new CPU();
    cpu.loadCOM(asm.bytes, asm.origin);

    let steps = 0;
    while (!cpu.halted && steps < 100) {
      cpu.step();
      steps++;
    }

    expect(cpu.halted).toBe(true);
    // AX was -25, after NEG AX it should be 25 (0x19)
    expect(cpu.regs.ax).toBe(25);
  });
});
