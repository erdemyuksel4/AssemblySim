import { describe, it, expect } from 'vitest';
import { TOPICS_M3 } from '../src/study/topics_m3.js';
import { StudyRunner } from '../src/study/studyRunner.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('Module 3 Study Data & Curriculum Integrity', () => {
  it('should have all 3 primary topics (Topics 5, 6, 7) in correct order', () => {
    expect(TOPICS_M3.length).toBe(3);
    expect(TOPICS_M3[0].number).toBe(5);
    expect(TOPICS_M3[1].number).toBe(6);
    expect(TOPICS_M3[2].number).toBe(7);

    TOPICS_M3.forEach((topic) => {
      expect(topic.title).toBeDefined();
      expect(topic.shortTitle).toBeDefined();
      expect(topic.subLessons.length).toBe(3);
      expect(topic.mindMap).toBeDefined();
      expect(topic.opcodes.length).toBeGreaterThan(0);
    });
  });

  it('should ensure all 9 task starter and solution codes assemble with zero errors', () => {
    for (const topic of TOPICS_M3) {
      for (const sub of topic.subLessons) {
        expect(sub.task, `SubLesson ${sub.id} must have a task`).toBeDefined();
        if (sub.task) {
          // 1. Check starter code assembly
          const starterRes = Assembler.assemble(sub.task.starterCode);
          expect(starterRes.errors, `Starter code error in task: ${sub.task.id}`).toEqual([]);

          // 2. Check solution code assembly
          const solRes = Assembler.assemble(sub.task.solutionCode);
          expect(solRes.errors, `Solution code error in task: ${sub.task.id}`).toEqual([]);
          expect(solRes.bytes.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should verify all 9 quizzes have valid questions, 4 options, and correctIndex in range', () => {
    for (const topic of TOPICS_M3) {
      for (const sub of topic.subLessons) {
        expect(sub.quiz, `SubLesson ${sub.id} must have a quiz`).toBeDefined();
        if (sub.quiz) {
          expect(sub.quiz.question.length).toBeGreaterThan(10);
          expect(sub.quiz.options.length).toBe(4);
          expect(sub.quiz.correctIndex).toBeGreaterThanOrEqual(0);
          expect(sub.quiz.correctIndex).toBeLessThan(sub.quiz.options.length);
          expect(sub.quiz.explanation.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('should grade and PASS all 9 task solutions with StudyRunner', () => {
    for (const topic of TOPICS_M3) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, sub.task.solutionCode);
          expect(res.success, `Task ${sub.task.id} failed: ${res.message} - diffs: ${JSON.stringify(res.diffs)}`).toBe(true);
          expect(res.status).toBe('PASSED');
        }
      }
    }
  });
});
