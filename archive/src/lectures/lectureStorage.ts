/**
 * Lecture Progress and Code Persistence Service
 * 
 * Manages saving and restoring:
 * - Current milestone and active module/step
 * - Step completion states (checkmarks & progress)
 * - User code modifications in mini-IDE workstations
 */

const STORAGE_PROGRESS_KEY = 'assemblysim_lecture_progress_v2';
const STORAGE_CODES_KEY = 'assemblysim_lecture_codes_v1';

export interface LectureProgressState {
  lastMilestoneId: string;
  activeSteps: Record<string, string>; // milestoneId -> stepId ('overview', 'sec-0', ..., 'capstone')
  completedSteps: Record<string, string[]>; // milestoneId -> string[] of completed stepIds
}

// In-memory fallback if localStorage is unavailable
let memoryProgress: LectureProgressState = {
  lastMilestoneId: 'milestone-1',
  activeSteps: {},
  completedSteps: {}
};

let memoryCodes: Record<string, string> = {};

function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    console.warn('localStorage not accessible, using memory storage', e);
  }
  return null;
}

export class LectureStorage {
  /**
   * Load entire lecture progress state
   */
  static getProgress(): LectureProgressState {
    const storage = getLocalStorage();
    if (!storage) return memoryProgress;

    try {
      const raw = storage.getItem(STORAGE_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          lastMilestoneId: parsed.lastMilestoneId || 'milestone-1',
          activeSteps: parsed.activeSteps || {},
          completedSteps: parsed.completedSteps || {}
        };
      }
    } catch (e) {
      console.warn('Failed to parse lecture progress from localStorage', e);
    }

    return memoryProgress;
  }

  /**
   * Save entire lecture progress state
   */
  static saveProgress(state: LectureProgressState): void {
    memoryProgress = state;
    const storage = getLocalStorage();
    if (!storage) return;

    try {
      storage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save lecture progress to localStorage', e);
    }
  }

  /**
   * Get the last active step for a given milestone
   */
  static getLastActiveStep(milestoneId: string): string | null {
    const progress = this.getProgress();
    return progress.activeSteps[milestoneId] || null;
  }

  /**
   * Set and save the last active step for a given milestone
   */
  static setLastActiveStep(milestoneId: string, stepId: string): void {
    const progress = this.getProgress();
    progress.lastMilestoneId = milestoneId;
    progress.activeSteps[milestoneId] = stepId;
    this.saveProgress(progress);
  }

  /**
   * Get the last viewed milestone ID
   */
  static getLastMilestoneId(): string {
    const progress = this.getProgress();
    return progress.lastMilestoneId || 'milestone-1';
  }

  /**
   * Set the last viewed milestone ID
   */
  static setLastMilestoneId(milestoneId: string): void {
    const progress = this.getProgress();
    progress.lastMilestoneId = milestoneId;
    this.saveProgress(progress);
  }

  /**
   * Check if a specific step is completed
   */
  static isStepCompleted(milestoneId: string, stepId: string): boolean {
    const progress = this.getProgress();
    const list = progress.completedSteps[milestoneId] || [];
    return list.includes(stepId);
  }

  /**
   * Mark a step as completed (or toggle)
   */
  static setStepCompleted(milestoneId: string, stepId: string, completed: boolean): void {
    const progress = this.getProgress();
    if (!progress.completedSteps[milestoneId]) {
      progress.completedSteps[milestoneId] = [];
    }
    const list = progress.completedSteps[milestoneId];
    const idx = list.indexOf(stepId);

    if (completed && idx === -1) {
      list.push(stepId);
    } else if (!completed && idx !== -1) {
      list.splice(idx, 1);
    }

    this.saveProgress(progress);
  }

  /**
   * Get list of completed steps for a milestone
   */
  static getCompletedSteps(milestoneId: string): string[] {
    const progress = this.getProgress();
    return progress.completedSteps[milestoneId] || [];
  }

  /**
   * Load saved user code for an example ID
   */
  static loadExampleCode(exampleId: string): string | null {
    const storage = getLocalStorage();
    if (!storage) {
      return memoryCodes[exampleId] ?? null;
    }

    try {
      const raw = storage.getItem(STORAGE_CODES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed[exampleId] === 'string') {
          return parsed[exampleId];
        }
      }
    } catch (e) {
      console.warn('Failed to load example code from localStorage', e);
    }

    return memoryCodes[exampleId] ?? null;
  }

  /**
   * Save user code for an example ID
   */
  static saveExampleCode(exampleId: string, code: string): void {
    memoryCodes[exampleId] = code;
    const storage = getLocalStorage();
    if (!storage) return;

    try {
      let data: Record<string, string> = {};
      const raw = storage.getItem(STORAGE_CODES_KEY);
      if (raw) {
        data = JSON.parse(raw) || {};
      }
      data[exampleId] = code;
      storage.setItem(STORAGE_CODES_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save example code to localStorage', e);
    }
  }

  /**
   * Reset saved code for an example ID
   */
  static resetExampleCode(exampleId: string): void {
    delete memoryCodes[exampleId];
    const storage = getLocalStorage();
    if (!storage) return;

    try {
      const raw = storage.getItem(STORAGE_CODES_KEY);
      if (raw) {
        const data = JSON.parse(raw) || {};
        delete data[exampleId];
        storage.setItem(STORAGE_CODES_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Failed to reset example code in localStorage', e);
    }
  }

  /**
   * Check if user has saved code for an example ID
   */
  static hasSavedExampleCode(exampleId: string): boolean {
    return this.loadExampleCode(exampleId) !== null;
  }
}
