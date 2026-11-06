import { describe, it, expect } from 'vitest';
import { CLOZE_QUESTIONS, TOTAL_CLOZE_QUESTIONS, getQuestionsByWeek } from '../src/cloze/clozeData.js';

describe('Cloze Question Bank Integrity', () => {
  it('should contain at least 140 authentic questions (meets/exceeds requirement)', () => {
    expect(TOTAL_CLOZE_QUESTIONS).toBeGreaterThanOrEqual(140);
    expect(CLOZE_QUESTIONS.length).toBe(TOTAL_CLOZE_QUESTIONS);
  });

  it('should contain at least 20 questions for each of the 7 primary weeks', () => {
    for (let w = 1; w <= 7; w++) {
      const weekQuestions = getQuestionsByWeek(w);
      expect(
        weekQuestions.length,
        `Week ${w} question count is ${weekQuestions.length}, expected >= 20`
      ).toBeGreaterThanOrEqual(20);

      // Verify week numbers are consistent
      expect(weekQuestions.every((q) => q.week === w)).toBe(true);
    }
  });

  it('should have strictly unique question IDs', () => {
    const ids = new Set<string>();
    for (const q of CLOZE_QUESTIONS) {
      expect(ids.has(q.id), `Duplicate question ID found: ${q.id}`).toBe(false);
      ids.add(q.id);
    }
    expect(ids.size).toBe(CLOZE_QUESTIONS.length);
  });

  it('should have valid template placeholders matching defined blanks', () => {
    const placeholderRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;

    for (const q of CLOZE_QUESTIONS) {
      expect(q.template).toBeDefined();
      expect(q.template.length).toBeGreaterThan(10);
      expect(q.blanks.length).toBeGreaterThanOrEqual(1);

      // Extract all placeholders from template
      const placeholders: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = placeholderRegex.exec(q.template)) !== null) {
        placeholders.push(match[1]);
      }

      expect(
        placeholders.length,
        `Question ${q.id} template has no {{blankId}} placeholders`
      ).toBeGreaterThanOrEqual(1);

      const blankIds = q.blanks.map((b) => b.id);

      // Every blank must exist in template
      for (const bId of blankIds) {
        expect(
          placeholders,
          `Blank ID '${bId}' in question ${q.id} not found in template '${q.template}'`
        ).toContain(bId);
      }

      // Every placeholder in template must exist in blanks
      for (const p of placeholders) {
        expect(
          blankIds,
          `Template placeholder '{{${p}}}' in question ${q.id} has no matching blank definition`
        ).toContain(p);
      }
    }
  });

  it('should have non-empty targets, accepted answers, and explanations', () => {
    for (const q of CLOZE_QUESTIONS) {
      expect(q.sourceSentence.trim().length, `Question ${q.id} missing sourceSentence`).toBeGreaterThan(10);
      expect(q.explanation.trim().length, `Question ${q.id} missing explanation`).toBeGreaterThan(10);
      expect(q.topic.trim().length, `Question ${q.id} missing topic`).toBeGreaterThan(2);
      expect(q.weekTitle.trim().length, `Question ${q.id} missing weekTitle`).toBeGreaterThan(5);
      expect(q.slideNumber, `Question ${q.id} slideNumber out of range`).toBeGreaterThanOrEqual(1);
      expect(q.slideNumber, `Question ${q.id} slideNumber out of range`).toBeLessThanOrEqual(40);

      for (const blank of q.blanks) {
        expect(blank.targetAnswer.trim().length, `Blank ${blank.id} in ${q.id} has empty targetAnswer`).toBeGreaterThan(0);
        expect(blank.acceptedAnswers.length, `Blank ${blank.id} in ${q.id} has empty acceptedAnswers`).toBeGreaterThan(0);
      }
    }
  });

  it('should correctly filter questions using getQuestionsByWeek()', () => {
    const w1 = getQuestionsByWeek(1);
    const w7 = getQuestionsByWeek(7);
    expect(w1.length).toBeGreaterThanOrEqual(20);
    expect(w7.length).toBeGreaterThanOrEqual(20);
    expect(w1.every((q) => q.week === 1)).toBe(true);
    expect(w7.every((q) => q.week === 7)).toBe(true);
  });
});
