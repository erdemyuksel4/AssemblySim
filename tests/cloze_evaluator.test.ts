import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeAnswer,
  checkBlankAnswer,
  evaluateQuestion,
  evaluateBatch,
  filterAndSortQuestions,
  getBatches
} from '../src/cloze/clozeEvaluator.js';
import { ClozeStorage } from '../src/cloze/clozeStorage.js';
import { ClozeQuestion, ClozeBlank } from '../src/cloze/clozeTypes.js';

describe('Cloze Evaluator Engine', () => {
  describe('normalizeAnswer()', () => {
    it('should trim leading and trailing spaces', () => {
      expect(normalizeAnswer('   microprocessor   ')).toBe('microprocessor');
    });

    it('should convert strings to lowercase', () => {
      expect(normalizeAnswer('MicroProcessor')).toBe('microprocessor');
      expect(normalizeAnswer('DATA BUS')).toBe('data bus');
    });

    it('should compress multiple inner spaces into a single space', () => {
      expect(normalizeAnswer('Transient    Program     Area')).toBe('transient program area');
    });

    it('should normalize curly quotes and special dashes', () => {
      expect(normalizeAnswer("two’s complement")).toBe("two's complement");
      expect(normalizeAnswer('“quoted”')).toBe('"quoted"');
      expect(normalizeAnswer('one–directional')).toBe('one-directional');
    });

    it('should strip trailing periods and commas', () => {
      expect(normalizeAnswer('accumulator.')).toBe('accumulator');
      expect(normalizeAnswer('stack pointer,')).toBe('stack pointer');
    });

    it('should handle empty, null, or undefined inputs gracefully', () => {
      expect(normalizeAnswer('')).toBe('');
      expect(normalizeAnswer(null)).toBe('');
      expect(normalizeAnswer(undefined)).toBe('');
    });
  });

  describe('checkBlankAnswer()', () => {
    const sampleBlank: ClozeBlank = {
      id: 'b1',
      targetAnswer: 'microprocessor',
      acceptedAnswers: ['microprocessor', 'mp', 'cpu', 'central processing unit'],
      hint: 'The single integrated circuit controlling the system'
    };

    it('should accept exact target answer', () => {
      expect(checkBlankAnswer('microprocessor', sampleBlank)).toBe(true);
    });

    it('should accept target answer with different casing and whitespace', () => {
      expect(checkBlankAnswer('  Microprocessor  ', sampleBlank)).toBe(true);
      expect(checkBlankAnswer('MICROPROCESSOR', sampleBlank)).toBe(true);
    });

    it('should accept accepted alternatives', () => {
      expect(checkBlankAnswer('mp', sampleBlank)).toBe(true);
      expect(checkBlankAnswer('MP', sampleBlank)).toBe(true);
      expect(checkBlankAnswer('CPU', sampleBlank)).toBe(true);
      expect(checkBlankAnswer('central processing unit', sampleBlank)).toBe(true);
    });

    it('should handle punctuation-tolerant matches like 1MB vs 1 MB', () => {
      const memBlank: ClozeBlank = {
        id: 'b1',
        targetAnswer: '1MB',
        acceptedAnswers: ['1 mb', '1 megabyte']
      };
      expect(checkBlankAnswer('1MB', memBlank)).toBe(true);
      expect(checkBlankAnswer('1 MB', memBlank)).toBe(true);
      expect(checkBlankAnswer('1-mb', memBlank)).toBe(true);
    });

    it('should reject wrong answers', () => {
      expect(checkBlankAnswer('ram', sampleBlank)).toBe(false);
      expect(checkBlankAnswer('hard drive', sampleBlank)).toBe(false);
      expect(checkBlankAnswer('', sampleBlank)).toBe(false);
    });
  });

  describe('evaluateQuestion()', () => {
    const singleBlankQ: ClozeQuestion = {
      id: 'cloze_test_001',
      week: 1,
      weekTitle: 'Week 1',
      topic: 'Buses',
      slideNumber: 6,
      sourceSentence: 'A bus connects components.',
      template: 'A {{b1}} connects components.',
      blanks: [
        {
          id: 'b1',
          targetAnswer: 'bus',
          acceptedAnswers: ['bus', 'system bus']
        }
      ],
      explanation: 'Bus explanation'
    };

    const multiBlankQ: ClozeQuestion = {
      id: 'cloze_test_002',
      week: 5,
      weekTitle: 'Week 5',
      topic: 'Division',
      slideNumber: 23,
      sourceSentence: 'AL receives the quotient and AH receives the remainder.',
      template: '{{b1}} receives the quotient and {{b2}} receives the remainder.',
      blanks: [
        {
          id: 'b1',
          targetAnswer: 'AL',
          acceptedAnswers: ['al', 'al register']
        },
        {
          id: 'b2',
          targetAnswer: 'AH',
          acceptedAnswers: ['ah', 'ah register']
        }
      ],
      explanation: '8-bit division puts quotient in AL, remainder in AH'
    };

    it('should correctly evaluate single blank question with direct key', () => {
      const res = evaluateQuestion(singleBlankQ, { b1: 'bus' });
      expect(res.isCorrect).toBe(true);
      expect(res.blanks[0].isCorrect).toBe(true);
      expect(res.blanks[0].userInput).toBe('bus');
    });

    it('should support composite keys like questionId_blankId', () => {
      const res = evaluateQuestion(singleBlankQ, { cloze_test_001_b1: 'system bus' });
      expect(res.isCorrect).toBe(true);
      expect(res.blanks[0].isCorrect).toBe(true);
    });

    it('should evaluate multi-blank question as correct only if all blanks are correct', () => {
      // Both correct
      const bothCorrect = evaluateQuestion(multiBlankQ, { b1: 'AL', b2: 'AH' });
      expect(bothCorrect.isCorrect).toBe(true);
      expect(bothCorrect.blanks.length).toBe(2);
      expect(bothCorrect.blanks[0].isCorrect).toBe(true);
      expect(bothCorrect.blanks[1].isCorrect).toBe(true);

      // One wrong, one correct
      const oneWrong = evaluateQuestion(multiBlankQ, { b1: 'AL', b2: 'DX' });
      expect(oneWrong.isCorrect).toBe(false);
      expect(oneWrong.blanks[0].isCorrect).toBe(true);
      expect(oneWrong.blanks[1].isCorrect).toBe(false);
    });
  });

  describe('evaluateBatch()', () => {
    const mockQuestions: ClozeQuestion[] = Array.from({ length: 20 }, (_, idx) => ({
      id: `cloze_mock_${idx + 1}`,
      week: 1,
      weekTitle: 'Week 1',
      topic: 'Mock Topic',
      slideNumber: idx + 1,
      sourceSentence: `Mock question ${idx + 1} with answer bus.`,
      template: `Mock question ${idx + 1} with answer {{b1}}.`,
      blanks: [
        {
          id: 'b1',
          targetAnswer: 'bus',
          acceptedAnswers: ['bus']
        }
      ],
      explanation: `Explanation ${idx + 1}`
    }));

    it('should evaluate a full 20-question batch and compute correct percentages', () => {
      // 15 correct, 5 wrong
      const answers: Record<string, string> = {};
      for (let i = 0; i < 20; i++) {
        answers[`cloze_mock_${i + 1}_b1`] = i < 15 ? 'bus' : 'wrong';
      }

      const res = evaluateBatch(mockQuestions, answers, 0);
      expect(res.totalCount).toBe(20);
      expect(res.correctCount).toBe(15);
      expect(res.totalQuestions).toBe(20);
      expect(res.correctQuestions).toBe(15);
      expect(res.percent).toBe(75);
      expect(res.isPassing).toBe(true);
      expect(Object.keys(res.details).length).toBe(20);
    });

    it('should report failing score below 70%', () => {
      const answers: Record<string, string> = {};
      for (let i = 0; i < 20; i++) {
        answers[`cloze_mock_${i + 1}_b1`] = i < 10 ? 'bus' : 'wrong';
      }

      const res = evaluateBatch(mockQuestions, answers, 0);
      expect(res.correctCount).toBe(10);
      expect(res.percent).toBe(50);
      expect(res.isPassing).toBe(false);
    });

    it('should handle nested answers structure', () => {
      const nested: Record<string, Record<string, string>> = {};
      for (let i = 0; i < 20; i++) {
        nested[`cloze_mock_${i + 1}`] = { b1: 'bus' };
      }

      const res = evaluateBatch(mockQuestions, nested, 0);
      expect(res.correctCount).toBe(20);
      expect(res.percent).toBe(100);
      expect(res.isPassing).toBe(true);
    });
  });

  describe('filterAndSortQuestions()', () => {
    const sampleSet: ClozeQuestion[] = [
      {
        id: 'q_w2_010',
        week: 2,
        weekTitle: 'Week 2',
        topic: 'Arch',
        slideNumber: 10,
        sourceSentence: 'S2',
        template: 'T2',
        blanks: [],
        explanation: 'E2'
      },
      {
        id: 'q_w1_005',
        week: 1,
        weekTitle: 'Week 1',
        topic: 'Intro',
        slideNumber: 5,
        sourceSentence: 'S1',
        template: 'T1',
        blanks: [],
        explanation: 'E1'
      },
      {
        id: 'q_w1_020',
        week: 1,
        weekTitle: 'Week 1',
        topic: 'Data',
        slideNumber: 20,
        sourceSentence: 'S3',
        template: 'T3',
        blanks: [],
        explanation: 'E3'
      }
    ];

    it('should filter by week when specified', () => {
      const w1 = filterAndSortQuestions(sampleSet, { week: 1, sortOrder: 'sequential' });
      expect(w1.length).toBe(2);
      expect(w1.every((q) => q.week === 1)).toBe(true);

      const w2 = filterAndSortQuestions(sampleSet, { week: 2, sortOrder: 'sequential' });
      expect(w2.length).toBe(1);
      expect(w2[0].id).toBe('q_w2_010');
    });

    it('should sort sequentially by week and slideNumber', () => {
      const sorted = filterAndSortQuestions(sampleSet, { week: 'all', sortOrder: 'sequential' });
      expect(sorted[0].id).toBe('q_w1_005');
      expect(sorted[1].id).toBe('q_w1_020');
      expect(sorted[2].id).toBe('q_w2_010');
    });

    it('should shuffle deterministically with a random seed', () => {
      const shuffled1 = filterAndSortQuestions(sampleSet, {
        week: 'all',
        sortOrder: 'random',
        shuffleSeed: 42
      });
      const shuffled2 = filterAndSortQuestions(sampleSet, {
        week: 'all',
        sortOrder: 'random',
        shuffleSeed: 42
      });
      expect(shuffled1.map((q) => q.id)).toEqual(shuffled2.map((q) => q.id));
      expect(shuffled1.length).toBe(sampleSet.length);
    });
  });

  describe('getBatches()', () => {
    it('should chunk 45 questions into batches of 20', () => {
      const mockList = Array.from({ length: 45 }, (_, idx) => ({
        id: `q_${idx}`,
        week: 1,
        weekTitle: 'Week 1',
        topic: 'Topic',
        slideNumber: 1,
        sourceSentence: 'S',
        template: 'T',
        blanks: [],
        explanation: 'E'
      }));

      const batches = getBatches(mockList, 20);
      expect(batches.length).toBe(3);

      expect(batches[0].batchIndex).toBe(0);
      expect(batches[0].startIndex).toBe(0);
      expect(batches[0].endIndex).toBe(20);
      expect(batches[0].questions.length).toBe(20);

      expect(batches[1].batchIndex).toBe(1);
      expect(batches[1].startIndex).toBe(20);
      expect(batches[1].endIndex).toBe(40);
      expect(batches[1].questions.length).toBe(20);

      expect(batches[2].batchIndex).toBe(2);
      expect(batches[2].startIndex).toBe(40);
      expect(batches[2].endIndex).toBe(45);
      expect(batches[2].questions.length).toBe(5);
    });
  });

  describe('ClozeStorage', () => {
    beforeEach(() => {
      ClozeStorage.clear();
    });

    it('should save and retrieve blank answers', () => {
      ClozeStorage.saveAnswer('q1', 'b1', 'microprocessor');
      expect(ClozeStorage.getAnswer('q1', 'b1')).toBe('microprocessor');
      expect(ClozeStorage.getAnswer('q1', 'b2')).toBe('');

      const all = ClozeStorage.getAnswers();
      expect(all['q1']['b1']).toBe('microprocessor');
    });

    it('should save and retrieve question answers in bulk', () => {
      ClozeStorage.saveQuestionAnswers('q2', { b1: 'AL', b2: 'AH' });
      const qAnswers = ClozeStorage.getQuestionAnswers('q2');
      expect(qAnswers).toEqual({ b1: 'AL', b2: 'AH' });
    });

    it('should save and retrieve batch score records', () => {
      ClozeStorage.saveBatchScore(0, 18, 20);
      const score = ClozeStorage.getBatchScore(0);
      expect(score).not.toBeNull();
      expect(score?.score).toBe(18);
      expect(score?.total).toBe(20);
      expect(score?.percent).toBe(90);
      expect(score?.timestamp).toBeGreaterThan(0);
    });

    it('should clear stored state when reset', () => {
      ClozeStorage.saveAnswer('q1', 'b1', 'val');
      ClozeStorage.saveBatchScore(0, 15, 20);
      ClozeStorage.clear();

      expect(ClozeStorage.getAnswer('q1', 'b1')).toBe('');
      expect(ClozeStorage.getBatchScore(0)).toBeNull();
      expect(ClozeStorage.getAnswers()).toEqual({});
    });
  });
});
