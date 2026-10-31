import { describe, it, expect } from 'vitest';
import { TOPIC_CURRICULUM, getTopicById } from '../src/lectures/topicStudyData.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('Topic Study Hub Data and Code Assembly Verification', () => {
  it('contains exactly 10 comprehensive topics covering 8086 ISA', () => {
    expect(TOPIC_CURRICULUM.length).toBe(10);
    const expectedIds = [
      'arch-20bit',
      'addressing-mov',
      'arithmetic-flags',
      'logic-shifts',
      'control-loops',
      'stack-procedures',
      'strings',
      'io-interrupts',
      'xlat-special',
      'algorithms-exam'
    ];
    expect(TOPIC_CURRICULUM.map(t => t.id)).toEqual(expectedIds);
  });

  it('verifies getTopicById resolves semantic IDs and legacy milestone IDs', () => {
    expect(getTopicById('addressing-mov').id).toBe('addressing-mov');
    expect(getTopicById('milestone-2').id).toBe('addressing-mov');
    expect(getTopicById('milestone-3').id).toBe('arithmetic-flags');
    expect(getTopicById('milestone-5').id).toBe('control-loops');
    expect(getTopicById('milestone-6').id).toBe('stack-procedures');
    expect(getTopicById('non-existent').id).toBe('arch-20bit'); // fallback to first
  });

  it('ensures each topic has theory steps, usage variations, and questions', () => {
    for (const topic of TOPIC_CURRICULUM) {
      expect(topic.theorySteps.length).toBeGreaterThan(0);
      expect(topic.usageGroups.length).toBeGreaterThan(0);
      expect(topic.opcodes.length).toBeGreaterThan(0);
      expect(topic.title).toBeTruthy();
      expect(topic.summary).toBeTruthy();
    }
  });

  it('assembles all usage variation codes that are marked valid', () => {
    for (const topic of TOPIC_CURRICULUM) {
      for (const group of topic.usageGroups) {
        for (const item of group.items) {
          if (item.isInvalid) continue; // skip intentional invalid syntax demos
          const asm = Assembler.assemble(item.code);
          if (asm.errors.length > 0) {
            console.error(`Assembly error in topic ${topic.id} item "${item.title}":`, asm.errors);
          }
          expect(asm.errors).toEqual([]);
        }
      }
    }
  });

  it('assembles all challenge starter and solution codes', () => {
    for (const topic of TOPIC_CURRICULUM) {
      for (const ch of topic.challenges) {
        if (ch.starterCode) {
          const asmStarter = Assembler.assemble(ch.starterCode);
          expect(asmStarter.errors).toEqual([]);
        }
        if (ch.solutionCode) {
          const asmSol = Assembler.assemble(ch.solutionCode);
          expect(asmSol.errors).toEqual([]);
        }
      }
    }
  });
});
