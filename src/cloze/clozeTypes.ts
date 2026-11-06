/**
 * clozeTypes.ts
 * Type definitions for the AssemblySim Cloze (Fill-in-the-Blank) Testing Engine.
 * Supports Week 1-7 course spine, flexible multi-blank templates, evaluation, and batching.
 */

export interface ClozeBlank {
  /** Unique blank identifier within the question (e.g., 'b1', 'b2') */
  id: string;
  /** Canonical correct answer displayed in feedback and answer cards */
  targetAnswer: string;
  /** Accepted alternative spellings, acronyms, or variations (case-insensitive) */
  acceptedAnswers: string[];
  /** Optional hint displayed to the user */
  hint?: string;
}

export interface ClozeQuestion {
  /** Unique question identifier (e.g., 'cloze_w1_001') */
  id: string;
  /** Primary week number: 1 | 2 | 3 | 4 | 5 | 6 | 7 */
  week: number;
  /** Full title of the week's lecture */
  weekTitle: string;
  /** Specific subtopic within the week (e.g., 'Buses & System Architecture') */
  topic: string;
  /** Slide or page number reference in the course slides (1..40) */
  slideNumber: number;
  /** Verbatim original sentence from the slide */
  sourceSentence: string;
  /** Template string containing blank placeholders like {{b1}}, {{b2}} */
  template: string;
  /** List of blank specifications corresponding to template placeholders */
  blanks: ClozeBlank[];
  /** Detailed explanation and academic context shown after evaluation */
  explanation: string;
}

export interface ClozeFilter {
  /** Filter by specific week (1..7) or 'all' */
  week: number | 'all';
  /** Presentation order: sequential by week/slide or randomized exam mode */
  sortOrder: 'sequential' | 'random';
  /** Optional numeric seed for deterministic shuffling in testing */
  shuffleSeed?: number;
}

export interface BlankEvaluation {
  blankId: string;
  userInput: string;
  isCorrect: boolean;
  targetAnswer: string;
}

export interface QuestionEvaluation {
  questionId: string;
  isCorrect: boolean;
  blanks: BlankEvaluation[];
  blankEvaluations: Record<string, BlankEvaluation>;
}

export interface ClozeBatch {
  batchIndex: number;
  startIndex: number;
  endIndex: number;
  questions: ClozeQuestion[];
}

export interface BatchScoreRecord {
  score: number;
  total: number;
  percent: number;
  timestamp: number;
}

export interface BatchResult {
  batchIndex?: number;
  totalCount: number;
  correctCount: number;
  totalQuestions: number;
  correctQuestions: number;
  totalBlanks: number;
  correctBlanks: number;
  percent: number;
  isPassing: boolean;
  details: Record<string, QuestionEvaluation>;
}
