import { describe, it, expect } from 'vitest';
import { TOPICS_M2 } from '../src/study/topics_m2.js';
import { Assembler } from '../src/assembler/assembler.js';
import { StudyRunner } from '../src/study/studyRunner.js';

describe('Module 2 Curriculum Integrity (TOPICS_M2)', () => {
  it('should export exactly 2 topics with numbers 3 and 4', () => {
    expect(TOPICS_M2.length).toBe(2);
    expect(TOPICS_M2[0].id).toBe('topic-3-addressing-modes');
    expect(TOPICS_M2[0].number).toBe(3);
    expect(TOPICS_M2[1].id).toBe('topic-4-data-movement-instructions');
    expect(TOPICS_M2[1].number).toBe(4);
  });

  it('should have exactly 3 sublessons per topic (total 6 sublessons)', () => {
    let subLessonCount = 0;
    for (const topic of TOPICS_M2) {
      expect(topic.subLessons.length).toBe(3);
      subLessonCount += topic.subLessons.length;
    }
    expect(subLessonCount).toBe(6);
  });

  it('should have valid quizzes with proper options and explanation for all sublessons', () => {
    for (const topic of TOPICS_M2) {
      for (const sub of topic.subLessons) {
        expect(sub.quiz, `Quiz missing in ${sub.id}`).toBeDefined();
        if (sub.quiz) {
          expect(sub.quiz.question.length).toBeGreaterThan(10);
          expect(sub.quiz.options.length).toBeGreaterThanOrEqual(2);
          expect(sub.quiz.correctIndex).toBeGreaterThanOrEqual(0);
          expect(sub.quiz.correctIndex).toBeLessThan(sub.quiz.options.length);
          expect(sub.quiz.explanation.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('should assemble all starter codes without errors', () => {
    for (const topic of TOPICS_M2) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = Assembler.assemble(sub.task.starterCode);
          expect(res.errors, `Starter code error in task ${sub.task.id}`).toEqual([]);
        }
      }
    }
  });

  it('should assemble all solution codes without errors and produce machine code', () => {
    for (const topic of TOPICS_M2) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = Assembler.assemble(sub.task.solutionCode);
          expect(res.errors, `Solution code error in task ${sub.task.id}`).toEqual([]);
          expect(res.bytes.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should pass all task solutions when graded by StudyRunner', () => {
    for (const topic of TOPICS_M2) {
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
