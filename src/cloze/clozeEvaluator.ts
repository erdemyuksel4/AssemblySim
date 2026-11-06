/**
 * clozeEvaluator.ts
 * Pure evaluation engine for Cloze (Fill-in-the-Blank) tests.
 * Provides answer normalization, multi-blank evaluation, batch scoring,
 * filtering by week, and deterministic/random sorting.
 */

import {
  ClozeBlank,
  ClozeQuestion,
  ClozeFilter,
  ClozeBatch,
  BlankEvaluation,
  QuestionEvaluation,
  BatchResult
} from './clozeTypes.js';

/**
 * Normalizes user answer strings for robust, fair grading.
 * - Trims leading and trailing whitespace.
 * - Lowercases all characters.
 * - Compresses multiple consecutive spaces to a single space.
 * - Normalizes curly/smart quotes and special dashes.
 * - Strips trailing punctuation (periods, commas, exclamation/question marks).
 */
export function normalizeAnswer(str: string | null | undefined): string {
  if (!str) return '';

  return str
    .trim()
    .toLowerCase()
    // Standardize unicode quotation marks
    .replace(/[\u2018\u2019\u201A\u201B`]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Standardize unicode dashes/hyphens
    .replace(/[\u2013\u2014\u2212]/g, '-')
    // Replace multiple spaces/newlines/tabs with single space
    .replace(/\s+/g, ' ')
    // Strip trailing punctuation if accidentally typed
    .replace(/[.,;!?]+$/, '')
    .trim();
}

/**
 * Compact alphanumeric representation used for punctuation-tolerant comparisons
 * (e.g., comparing "1 MB" vs "1MB", "I/O" vs "IO").
 */
function toAlphanumeric(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a user's answer matches the target or accepted alternatives for a blank.
 */
export function checkBlankAnswer(input: string | null | undefined, blank: ClozeBlank): boolean {
  const normInput = normalizeAnswer(input);
  if (!normInput) return false;

  const targetNorm = normalizeAnswer(blank.targetAnswer);
  if (normInput === targetNorm) return true;

  // Check exact normalized match against accepted alternatives
  for (const alt of blank.acceptedAnswers) {
    if (normInput === normalizeAnswer(alt)) {
      return true;
    }
  }

  // Check punctuation-tolerant alphanumeric match
  const alphaInput = toAlphanumeric(normInput);
  if (alphaInput.length > 0) {
    if (alphaInput === toAlphanumeric(targetNorm)) return true;
    for (const alt of blank.acceptedAnswers) {
      if (alphaInput === toAlphanumeric(alt)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Evaluates all blanks in a question against provided answers.
 * Answers can be keyed by blankId (e.g. 'b1') or composite '${questionId}_${blankId}'.
 */
export function evaluateQuestion(
  q: ClozeQuestion,
  answers: Record<string, string>
): QuestionEvaluation {
  const blanks: BlankEvaluation[] = [];
  const blankEvaluations: Record<string, BlankEvaluation> = {};
  let allCorrect = true;

  for (const blank of q.blanks) {
    const rawVal =
      answers[blank.id] ??
      answers[`${q.id}_${blank.id}`] ??
      answers[`${q.id}.${blank.id}`] ??
      '';

    const isCorrect = checkBlankAnswer(rawVal, blank);
    if (!isCorrect) {
      allCorrect = false;
    }

    const evalResult: BlankEvaluation = {
      blankId: blank.id,
      userInput: rawVal,
      isCorrect,
      targetAnswer: blank.targetAnswer
    };

    blanks.push(evalResult);
    blankEvaluations[blank.id] = evalResult;
  }

  return {
    questionId: q.id,
    isCorrect: allCorrect,
    blanks,
    blankEvaluations
  };
}

/**
 * Evaluates a batch of questions (e.g., 20 questions) and computes aggregate score metrics.
 * Accepts answers either flat `Record<string, string>` or nested `Record<string, Record<string, string>>`.
 */
export function evaluateBatch(
  batchQuestions: ClozeQuestion[],
  answers: Record<string, string> | Record<string, Record<string, string>>,
  batchIndex?: number
): BatchResult {
  let correctQuestions = 0;
  let totalBlanks = 0;
  let correctBlanks = 0;
  const details: Record<string, QuestionEvaluation> = {};

  for (const q of batchQuestions) {
    // Extract question-specific answers whether nested or flat
    let qAnswers: Record<string, string> = {};
    const nested = (answers as Record<string, Record<string, string>>)[q.id];
    if (nested && typeof nested === 'object') {
      qAnswers = nested;
    } else {
      qAnswers = answers as Record<string, string>;
    }

    const qEval = evaluateQuestion(q, qAnswers);
    details[q.id] = qEval;

    if (qEval.isCorrect) {
      correctQuestions++;
    }

    for (const b of qEval.blanks) {
      totalBlanks++;
      if (b.isCorrect) {
        correctBlanks++;
      }
    }
  }

  const totalQuestions = batchQuestions.length;
  const percent = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

  return {
    batchIndex,
    totalCount: totalQuestions,
    correctCount: correctQuestions,
    totalQuestions,
    correctQuestions,
    totalBlanks,
    correctBlanks,
    percent,
    isPassing: percent >= 70,
    details
  };
}

/**
 * Park-Miller pseudo-random number generator for deterministic seeding.
 */
function createPrng(seed: number): () => number {
  let s = (seed % 2147483647) >>> 0;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Filters questions by week and sorts them sequentially or in randomized exam mode.
 */
export function filterAndSortQuestions(
  questions: ClozeQuestion[],
  filter: ClozeFilter
): ClozeQuestion[] {
  let filtered = [...questions];

  if (filter.week !== 'all') {
    filtered = filtered.filter((q) => q.week === filter.week);
  }

  if (filter.sortOrder === 'sequential') {
    filtered.sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      if (a.slideNumber !== b.slideNumber) return a.slideNumber - b.slideNumber;
      return a.id.localeCompare(b.id);
    });
  } else if (filter.sortOrder === 'random') {
    const randomFn = filter.shuffleSeed !== undefined ? createPrng(filter.shuffleSeed) : Math.random;
    // Fisher-Yates shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
  }

  return filtered;
}

/**
 * Splits an array of questions into fixed-size batches (default 20 questions per batch).
 */
export function getBatches(questions: ClozeQuestion[], batchSize: number = 20): ClozeBatch[] {
  if (batchSize <= 0) {
    batchSize = 20;
  }

  const batches: ClozeBatch[] = [];
  const total = questions.length;

  for (let i = 0; i < total; i += batchSize) {
    const endIndex = Math.min(i + batchSize, total);
    batches.push({
      batchIndex: batches.length,
      startIndex: i,
      endIndex,
      questions: questions.slice(i, endIndex)
    });
  }

  return batches;
}
