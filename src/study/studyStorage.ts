export interface StudyProgressSummary {
  completedQuizzes: number;
  totalQuizzes: number;
  completedTasks: number;
  totalTasks: number;
  overallPercent: number;
}

export class StudyStorage {
  private static readonly KEY_QUIZZES = '8086_study_quizzes_v1';
  private static readonly KEY_TASKS = '8086_study_tasks_v1';
  private static readonly KEY_CODES = '8086_study_user_codes_v1';

  private static memoryStore: Record<string, string> = {};

  private static getItem(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        return localStorage.getItem(key);
      }
    } catch {
      // ignore
    }
    return this.memoryStore[key] || null;
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

  private static getSet(key: string): Set<string> {
    const raw = this.getItem(key);
    if (!raw) return new Set();
    try {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  private static saveSet(key: string, set: Set<string>): void {
    this.setItem(key, JSON.stringify(Array.from(set)));
  }

  static isQuizPassed(quizId: string): boolean {
    return this.getSet(this.KEY_QUIZZES).has(quizId);
  }

  static markQuizPassed(quizId: string): void {
    const s = this.getSet(this.KEY_QUIZZES);
    s.add(quizId);
    this.saveSet(this.KEY_QUIZZES, s);
  }

  static isTaskPassed(taskId: string): boolean {
    return this.getSet(this.KEY_TASKS).has(taskId);
  }

  static markTaskPassed(taskId: string): void {
    const s = this.getSet(this.KEY_TASKS);
    s.add(taskId);
    this.saveSet(this.KEY_TASKS, s);
  }

  static getUserTaskCode(taskId: string, fallback: string): string {
    const raw = this.getItem(this.KEY_CODES);
    if (!raw) return fallback;
    try {
      const dict = JSON.parse(raw);
      return dict[taskId] || fallback;
    } catch {
      return fallback;
    }
  }

  static saveUserTaskCode(taskId: string, code: string): void {
    const raw = this.getItem(this.KEY_CODES);
    let dict: Record<string, string> = {};
    if (raw) {
      try {
        dict = JSON.parse(raw);
      } catch {
        dict = {};
      }
    }
    dict[taskId] = code;
    this.setItem(this.KEY_CODES, JSON.stringify(dict));
  }

  static resetProgress(): void {
    this.removeItem(this.KEY_QUIZZES);
    this.removeItem(this.KEY_TASKS);
  }
}
