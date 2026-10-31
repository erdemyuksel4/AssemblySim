import { describe, it, expect, beforeEach } from 'vitest';
import { STUDY_TOPICS } from '../src/study/studyData.js';
import { StudyRunner } from '../src/study/studyRunner.js';
import { StudyStorage } from '../src/study/studyStorage.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('Study Data & Curriculum Integrity', () => {
  it('should have all 9 primary topics in correct pedagogical order', () => {
    expect(STUDY_TOPICS.length).toBe(9);
    STUDY_TOPICS.forEach((topic, idx) => {
      expect(topic.number).toBe(idx + 1);
      expect(topic.title).toBeDefined();
      expect(topic.subLessons.length).toBeGreaterThan(0);
      expect(topic.mindMap).toBeDefined();
    });
  });

  it('should ensure all task starter and solution codes assemble with zero errors', () => {
    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
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

  it('should verify all quizzes have valid questions, options and correctIndex in range', () => {
    for (const topic of STUDY_TOPICS) {
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

describe('StudyRunner Task Grading Engine', () => {
  it('should pass all task solutions when evaluated against assertions', () => {
    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, sub.task.solutionCode);
          expect(res.success, `Task ${sub.task.id} failed: ${res.message}`).toBe(true);
          expect(res.status).toBe('PASSED');
        }
      }
    }
  });

  it('should report COMPILE_ERROR for invalid assembly syntax', () => {
    const firstTask = STUDY_TOPICS[0].subLessons[0].task!;
    const res = StudyRunner.grade(firstTask, 'INVALID_OPCODE_XYZ AX, BX');
    expect(res.success).toBe(false);
    expect(res.status).toBe('COMPILE_ERROR');
    expect(res.message).toContain('Derleme Hatası');
  });

  it('should report FAILED with diffs if register expectation is not met', () => {
    const firstTask = STUDY_TOPICS[0].subLessons[0].task!;
    // Wrong registers
    const badCode = `
      ORG 100h
      MOV AX, 0000h
      MOV BX, 0000h
      HLT
    `;
    const res = StudyRunner.grade(firstTask, badCode);
    expect(res.success).toBe(false);
    expect(res.status).toBe('FAILED');
    expect(res.diffs.some(d => !d.matched)).toBe(true);
  });
});

describe('StudyStorage Progress & LocalStorage Tracking', () => {
  beforeEach(() => {
    StudyStorage.resetProgress();
  });

  it('should track quiz completion state', () => {
    expect(StudyStorage.isQuizPassed('quiz-1-1')).toBe(false);
    StudyStorage.markQuizPassed('quiz-1-1');
    expect(StudyStorage.isQuizPassed('quiz-1-1')).toBe(true);
  });

  it('should track task completion state', () => {
    expect(StudyStorage.isTaskPassed('task-1-regs-init')).toBe(false);
    StudyStorage.markTaskPassed('task-1-regs-init');
    expect(StudyStorage.isTaskPassed('task-1-regs-init')).toBe(true);
  });

  it('should save and retrieve user task draft code', () => {
    const customCode = '; Custom user code';
    StudyStorage.saveUserTaskCode('task-custom', customCode);
    expect(StudyStorage.getUserTaskCode('task-custom', 'default')).toBe(customCode);
  });

  it('should reset all progress on resetProgress()', () => {
    StudyStorage.markQuizPassed('quiz-1-1');
    StudyStorage.markTaskPassed('task-1-regs-init');
    StudyStorage.resetProgress();
    expect(StudyStorage.isQuizPassed('quiz-1-1')).toBe(false);
    expect(StudyStorage.isTaskPassed('task-1-regs-init')).toBe(false);
  });
});
