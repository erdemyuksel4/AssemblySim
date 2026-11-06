import { describe, it, expect } from 'vitest';
import { TOPICS_M5 } from '../src/study/topics_m5.js';
import { Assembler } from '../src/assembler/assembler.js';
import { StudyRunner } from '../src/study/studyRunner.js';

describe('Module 5 Curriculum Integrity (Topics 11 to 15)', () => {
  it('should have exactly 5 main topics with 3 sublessons each (15 sublessons total)', () => {
    expect(TOPICS_M5.length).toBe(5);
    expect(TOPICS_M5[0].number).toBe(11);
    expect(TOPICS_M5[1].number).toBe(12);
    expect(TOPICS_M5[2].number).toBe(13);
    expect(TOPICS_M5[3].number).toBe(14);
    expect(TOPICS_M5[4].number).toBe(15);

    let totalSubLessons = 0;
    for (const topic of TOPICS_M5) {
      expect(topic.subLessons.length).toBe(3);
      totalSubLessons += topic.subLessons.length;
      expect(topic.title).toBeDefined();
      expect(topic.shortTitle).toBeDefined();
      expect(topic.summary).toBeDefined();
      expect(topic.mindMap).toBeDefined();
      expect(topic.opcodes.length).toBeGreaterThan(0);
    }
    expect(totalSubLessons).toBe(15);
  });

  it('should assemble all 15 starter and solution codes with zero errors', () => {
    for (const topic of TOPICS_M5) {
      for (const sub of topic.subLessons) {
        expect(sub.task, `SubLesson ${sub.id} must have a task`).toBeDefined();
        if (sub.task) {
          // Verify starter code
          const starterRes = Assembler.assemble(sub.task.starterCode);
          expect(starterRes.errors, `Starter error in task ${sub.task.id}: ${starterRes.errors.join(', ')}`).toEqual([]);

          // Verify solution code
          const solRes = Assembler.assemble(sub.task.solutionCode);
          expect(solRes.errors, `Solution error in task ${sub.task.id}: ${solRes.errors.join(', ')}`).toEqual([]);
          expect(solRes.bytes.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should grade and PASS all 15 task solutions with StudyRunner within 3000 steps', () => {
    for (const topic of TOPICS_M5) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, sub.task.solutionCode);
          expect(
            res.success,
            `Task ${sub.task.id} (${sub.title}) failed: ${res.message} - diffs: ${JSON.stringify(res.diffs)}`
          ).toBe(true);
          expect(res.status).toBe('PASSED');
          expect(res.steps).toBeLessThanOrEqual(3000);
        }
      }
    }
  });

  it('should verify all 15 quizzes have valid questions, 4 options, and correctIndex in range', () => {
    for (const topic of TOPICS_M5) {
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

  it('should verify all 15 sublessons have rich theoryHtml content', () => {
    for (const topic of TOPICS_M5) {
      for (const sub of topic.subLessons) {
        expect(sub.theoryHtml).toBeDefined();
        expect(sub.theoryHtml.length).toBeGreaterThan(200);
        expect(sub.theoryHtml).toContain('nb-section');
      }
    }
  });
});
