import { describe, it, expect, beforeEach } from 'vitest';
import { LectureStorage } from '../src/lectures/lectureStorage.js';
import { MILESTONE_LECTURES } from '../src/lectures/lectureData.js';

describe('LectureStorage and Module Progress Persistence', () => {
  beforeEach(() => {
    // Clear localStorage simulation if any
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('saves and restores active step per milestone', () => {
    LectureStorage.setLastActiveStep('milestone-2', 'sec-3');
    expect(LectureStorage.getLastActiveStep('milestone-2')).toBe('sec-3');

    LectureStorage.setLastActiveStep('milestone-3', 'sec-1');
    expect(LectureStorage.getLastActiveStep('milestone-3')).toBe('sec-1');
    // Ensure milestone-2 is preserved
    expect(LectureStorage.getLastActiveStep('milestone-2')).toBe('sec-3');
  });

  it('saves and restores last viewed milestone', () => {
    LectureStorage.setLastMilestoneId('milestone-4');
    expect(LectureStorage.getLastMilestoneId()).toBe('milestone-4');
  });

  it('marks steps as completed and toggles properly', () => {
    expect(LectureStorage.isStepCompleted('milestone-2', 'sec-0')).toBe(false);

    LectureStorage.setStepCompleted('milestone-2', 'sec-0', true);
    expect(LectureStorage.isStepCompleted('milestone-2', 'sec-0')).toBe(true);

    LectureStorage.setStepCompleted('milestone-2', 'sec-1', true);
    const completed = LectureStorage.getCompletedSteps('milestone-2');
    expect(completed).toContain('sec-0');
    expect(completed).toContain('sec-1');
    expect(completed.length).toBe(2);

    // Toggle off
    LectureStorage.setStepCompleted('milestone-2', 'sec-0', false);
    expect(LectureStorage.isStepCompleted('milestone-2', 'sec-0')).toBe(false);
    expect(LectureStorage.getCompletedSteps('milestone-2').length).toBe(1);
  });

  it('persists and restores user code per example', () => {
    const exampleId = 'ex-m2-reg-reg';
    const testCode = 'MOV AX, 1234H\nMOV BX, AX\nHLT';

    LectureStorage.saveExampleCode(exampleId, testCode);
    expect(LectureStorage.hasSavedExampleCode(exampleId)).toBe(true);
    expect(LectureStorage.loadExampleCode(exampleId)).toBe(testCode);

    // Reset code
    LectureStorage.resetExampleCode(exampleId);
    expect(LectureStorage.hasSavedExampleCode(exampleId)).toBe(false);
    expect(LectureStorage.loadExampleCode(exampleId)).toBeNull();
  });

  it('verifies all milestones have valid sections for stepper tabs', () => {
    for (const [key, lecture] of Object.entries(MILESTONE_LECTURES)) {
      expect(lecture.sections.length).toBeGreaterThan(0);
      expect(lecture.title).toBeTruthy();
      expect(lecture.milestoneNumber).toBeGreaterThan(0);
    }
  });
});
