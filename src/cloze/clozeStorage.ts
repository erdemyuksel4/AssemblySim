/**
 * clozeStorage.ts
 * Manages persistent state for Cloze (Fill-in-the-Blank) tests.
 * Safely falls back to an in-memory dictionary when localStorage is unavailable
 * (e.g., in Node.js, Vitest runner, or sandboxed iframes).
 */

import { BatchScoreRecord } from './clozeTypes.js';

export class ClozeStorage {
  private static readonly KEY_ANSWERS = '8086_cloze_answers_v1';
  private static readonly KEY_BATCH_SCORES = '8086_cloze_batch_scores_v1';
  private static readonly KEY_FILTER_PREF = '8086_cloze_filter_pref_v1';

  // In-memory fallback dictionary for non-browser or test environments
  private static memoryStore: Record<string, string> = {};

  private static getItem(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        return localStorage.getItem(key);
      }
    } catch {
      // ignore security / quota errors
    }
    return this.memoryStore[key] ?? null;
  }

  private static setItem(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
    this.memoryStore[key] = value;
  }

  private static removeItem(key: string): void {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    delete this.memoryStore[key];
  }

  /**
   * Save a single blank's answer for a question.
   */
  static saveAnswer(questionId: string, blankId: string, value: string): void {
    const all = this.getAnswers();
    if (!all[questionId]) {
      all[questionId] = {};
    }
    all[questionId][blankId] = value;
    this.setItem(this.KEY_ANSWERS, JSON.stringify(all));
  }

  /**
   * Retrieve a single blank's saved answer.
   */
  static getAnswer(questionId: string, blankId: string): string {
    const all = this.getAnswers();
    return all[questionId]?.[blankId] ?? '';
  }

  /**
   * Retrieve all saved answers grouped by questionId -> blankId -> answer string.
   */
  static getAnswers(): Record<string, Record<string, string>> {
    const raw = this.getItem(this.KEY_ANSWERS);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }

  /**
   * Save all blank answers for a specific question at once.
   */
  static saveQuestionAnswers(questionId: string, answers: Record<string, string>): void {
    const all = this.getAnswers();
    all[questionId] = { ...(all[questionId] || {}), ...answers };
    this.setItem(this.KEY_ANSWERS, JSON.stringify(all));
  }

  /**
   * Retrieve answers for a specific question.
   */
  static getQuestionAnswers(questionId: string): Record<string, string> {
    const all = this.getAnswers();
    return all[questionId] || {};
  }

  /**
   * Save the score obtained for a 20-question batch.
   */
  static saveBatchScore(batchIndex: number, score: number, total: number): void {
    const all = this.getBatchScores();
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    all[batchIndex] = {
      score,
      total,
      percent,
      timestamp: Date.now()
    };
    this.setItem(this.KEY_BATCH_SCORES, JSON.stringify(all));
  }

  /**
   * Retrieve all saved batch scores.
   */
  static getBatchScores(): Record<number, BatchScoreRecord> {
    const raw = this.getItem(this.KEY_BATCH_SCORES);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }

  /**
   * Retrieve a specific batch's score, or null if unattempted.
   */
  static getBatchScore(batchIndex: number): BatchScoreRecord | null {
    const all = this.getBatchScores();
    return all[batchIndex] ?? null;
  }

  /**
   * Save filter preferences (e.g. week number and sort order).
   */
  static saveFilterPreference(week: number | 'all', sortOrder: 'sequential' | 'random'): void {
    this.setItem(this.KEY_FILTER_PREF, JSON.stringify({ week, sortOrder }));
  }

  /**
   * Get filter preferences.
   */
  static getFilterPreference(): { week: number | 'all'; sortOrder: 'sequential' | 'random' } | null {
    const raw = this.getItem(this.KEY_FILTER_PREF);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Clear all cloze progress and saved answers.
   */
  static clear(): void {
    this.removeItem(this.KEY_ANSWERS);
    this.removeItem(this.KEY_BATCH_SCORES);
    this.removeItem(this.KEY_FILTER_PREF);
    this.memoryStore = {};
  }

  /**
   * Alias for clear() to match curriculum storage convention.
   */
  static resetProgress(): void {
    this.clear();
  }
}
