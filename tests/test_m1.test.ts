import { describe, it, expect } from 'vitest';
import { TOPICS_M1 } from '../src/study/topics_m1.js';
import { Assembler } from '../src/assembler/assembler.js';
import { StudyRunner } from '../src/study/studyRunner.js';

describe('Module 1 Curriculum Integrity', () => {
  it('should have exactly 2 main topics with 3 sublessons each', () => {
    expect(TOPICS_M1.length).toBe(2);
    expect(TOPICS_M1[0].subLessons.length).toBe(3);
    expect(TOPICS_M1[1].subLessons.length).toBe(3);
  });

  it('should assemble all starter and solution codes with zero errors', () => {
    for (const topic of TOPICS_M1) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const starterRes = Assembler.assemble(sub.task.starterCode);
          expect(starterRes.errors, `Starter error in ${sub.task.id}`).toEqual([]);

          const solRes = Assembler.assemble(sub.task.solutionCode);
          expect(solRes.errors, `Solution error in ${sub.task.id}`).toEqual([]);
          expect(solRes.bytes.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should grade all solution codes as PASSED', () => {
    for (const topic of TOPICS_M1) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, sub.task.solutionCode);
          expect(res.success, `Task ${sub.task.id} failed: ${res.message}`).toBe(true);
          expect(res.status).toBe('PASSED');
        }
      }
    }
  });

  it('should have valid quiz fields', () => {
    for (const topic of TOPICS_M1) {
      for (const sub of topic.subLessons) {
        if (sub.quiz) {
          expect(sub.quiz.question.length).toBeGreaterThan(5);
          expect(sub.quiz.options.length).toBeGreaterThanOrEqual(2);
          expect(sub.quiz.correctIndex).toBeGreaterThanOrEqual(0);
          expect(sub.quiz.correctIndex).toBeLessThan(sub.quiz.options.length);
          expect(sub.quiz.explanation.length).toBeGreaterThan(5);
        }
      }
    }
  });
});
