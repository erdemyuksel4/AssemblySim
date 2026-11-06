import { describe, it, expect } from 'vitest';
import { STUDY_TOPICS } from '../src/study/studyData.js';
import { StudyRunner } from '../src/study/studyRunner.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('Weeks 1–7 Step-by-Step Micro-Lessons & Zero-Prerequisite Tasks Audit', () => {
  const primaryTopics = STUDY_TOPICS.filter(t => t.number >= 1 && t.number <= 7);

  it('Verifies all 21 sublessons of Weeks 1–7 have step-by-step microSteps with tasks', () => {
    expect(primaryTopics.length).toBe(7);
    let totalMicroSteps = 0;

    for (const topic of primaryTopics) {
      expect(topic.subLessons.length).toBe(3);
      for (const sub of topic.subLessons) {
        expect(sub.microSteps, `SubLesson ${sub.id} missing microSteps`).toBeDefined();
        expect(sub.microSteps!.length, `SubLesson ${sub.id} should have >= 2 microSteps`).toBeGreaterThanOrEqual(2);
        totalMicroSteps += sub.microSteps!.length;

        for (const step of sub.microSteps!) {
          expect(step.id).toBeTruthy();
          expect(step.title.length).toBeGreaterThan(5);
          expect(step.explanationHtml.length).toBeGreaterThan(20);
          expect(step.task).toBeDefined();
        }
      }
    }

    // Verify Stack sublessons specifically have comprehensive step-by-step coverage
    const sub33 = primaryTopics[2].subLessons[2];
    expect(sub33.microSteps!.length).toBeGreaterThanOrEqual(6);
    const sub42 = primaryTopics[3].subLessons[1];
    expect(sub42.microSteps!.length).toBeGreaterThanOrEqual(7);

    console.log(`[MICRO-STEPS AUDIT] Total micro-steps across Weeks 1–7: ${totalMicroSteps}`);
    expect(totalMicroSteps).toBeGreaterThanOrEqual(60);
  });

  it('Verifies every microStep starterCode compiles cleanly and is NOT pre-solved', () => {
    const errors: string[] = [];
    const preSolved: string[] = [];

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (!sub.microSteps) continue;
        for (const step of sub.microSteps) {
          const asmRes = Assembler.assemble(step.task.starterCode);
          if (asmRes.errors.length > 0) {
            errors.push(`${sub.id} -> ${step.id} (${step.task.id}) starterCode error: ${asmRes.errors.map(e => e.message).join('; ')}`);
          }
          const gradeRes = StudyRunner.grade(step.task, step.task.starterCode);
          if (gradeRes.success) {
            preSolved.push(`${sub.id} -> ${step.id} (${step.task.id})`);
          }
        }
      }
    }

    expect(errors).toEqual([]);
    expect(preSolved).toEqual([]);
  });

  it('Verifies every microStep solutionCode compiles cleanly and PASSES StudyRunner.grade', () => {
    const errors: string[] = [];
    const failures: string[] = [];

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (!sub.microSteps) continue;
        for (const step of sub.microSteps) {
          const asmRes = Assembler.assemble(step.task.solutionCode);
          if (asmRes.errors.length > 0) {
            errors.push(`${sub.id} -> ${step.id} (${step.task.id}) solutionCode error: ${asmRes.errors.map(e => e.message).join('; ')}`);
          }
          const gradeRes = StudyRunner.grade(step.task, step.task.solutionCode);
          if (!gradeRes.success) {
            failures.push(`${sub.id} -> ${step.id} (${step.task.id}) failed: ${gradeRes.message} | diffs: ${JSON.stringify(gradeRes.diffs)}`);
          }
        }
      }
    }

    expect(errors).toEqual([]);
    expect(failures).toEqual([]);
  });

  it('Verifies dummy code (ORG 100h / HLT) is rejected by 100% of microStep tasks', () => {
    const dummy = 'ORG 100h\nHLT';
    const falsePasses: string[] = [];

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (!sub.microSteps) continue;
        for (const step of sub.microSteps) {
          const gradeRes = StudyRunner.grade(step.task, dummy);
          if (gradeRes.success) {
            falsePasses.push(`${sub.id} -> ${step.id} (${step.task.id})`);
          }
        }
      }
    }

    expect(falsePasses).toEqual([]);
  });

  it('Verifies Stack sublessons (3.3, 4.2, 10.1) have 100% Stack-aligned microSteps and capstone tasks', () => {
    const sub33 = STUDY_TOPICS[2].subLessons[2];
    expect(sub33.microSteps!.length).toBe(6);
    for (const step of sub33.microSteps!) {
      expect(step.task.solutionCode).toMatch(/PUSH|POP|SP|SS/i);
    }
    expect(sub33.task!.solutionCode).toMatch(/PUSH\s+AX[\s\S]*POP\s+BX/i);

    const sub42 = STUDY_TOPICS[3].subLessons[1];
    expect(sub42.microSteps!.length).toBe(7);
    // First 6 microSteps are Stack in-depth (PUSH DS/POP ES, PUSH WORD PTR [BX], Save/Restore, PUSHA, POPA, PUSHF/POPF)
    for (const step of sub42.microSteps!.slice(0, 6)) {
      expect(step.task.solutionCode).toMatch(/PUSH|POP/i);
    }
    expect(sub42.task!.solutionCode).toMatch(/PUSHA[\s\S]*POPA/i);

    const sub101 = STUDY_TOPICS[9].subLessons[0];
    expect(sub101.microSteps!.length).toBe(12);
  });
});
