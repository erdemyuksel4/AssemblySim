import { describe, it, expect } from 'vitest';
import { TOPICS_M4 } from '../src/study/topics_m4.js';
import { Assembler } from '../src/assembler/assembler.js';
import { StudyRunner } from '../src/study/studyRunner.js';

describe('Module 4 Curriculum Integrity (Topics 8, 9, 10)', () => {
  it('should have exactly 3 main topics with 3 sublessons each (9 sublessons total)', () => {
    expect(TOPICS_M4.length).toBe(3);
    expect(TOPICS_M4[0].number).toBe(8);
    expect(TOPICS_M4[1].number).toBe(9);
    expect(TOPICS_M4[2].number).toBe(10);

    for (const topic of TOPICS_M4) {
      expect(topic.subLessons.length).toBe(3);
      expect(topic.title).toBeDefined();
      expect(topic.summary).toBeDefined();
      expect(topic.mindMap).toBeDefined();
      expect(topic.opcodes.length).toBeGreaterThan(0);
    }
  });

  it('should assemble all starter and solution codes with zero errors', () => {
    for (const topic of TOPICS_M4) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          // Verify starter code
          const starterRes = Assembler.assemble(sub.task.starterCode);
          expect(starterRes.errors, `Starter error in task ${sub.task.id}`).toEqual([]);

          // Verify solution code
          const solRes = Assembler.assemble(sub.task.solutionCode);
          expect(solRes.errors, `Solution error in task ${sub.task.id}`).toEqual([]);
          expect(solRes.bytes.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should grade all solution codes as PASSED within 3000 steps', () => {
    for (const topic of TOPICS_M4) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, sub.task.solutionCode);
          expect(res.success, `Task ${sub.task.id} failed: ${res.message}`).toBe(true);
          expect(res.status).toBe('PASSED');
          expect(res.steps).toBeLessThanOrEqual(3000);
        }
      }
    }
  });

  it('should verify all quizzes have valid questions, options and correctIndex', () => {
    for (const topic of TOPICS_M4) {
      for (const sub of topic.subLessons) {
        if (sub.quiz) {
          expect(sub.quiz.question.length).toBeGreaterThan(5);
          expect(sub.quiz.options.length).toBeGreaterThanOrEqual(4);
          expect(sub.quiz.correctIndex).toBeGreaterThanOrEqual(0);
          expect(sub.quiz.correctIndex).toBeLessThan(sub.quiz.options.length);
          expect(sub.quiz.explanation.length).toBeGreaterThan(5);
        }
      }
    }
  });
});
