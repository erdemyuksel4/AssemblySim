/**
 * studyNotesStore.ts
 * 
 * Çalışma Notları, Soru Föyü, Bit ALU Hesaplayıcı ve Döngü İzleme Tablosu
 * için merkezi durum (state) yöneticisi.
 * 
 * Sayfa sol veya sağ (yan) panele alındığında, sekme değiştirildiğinde
 * veya belge kapatılıp açıldığında kullanıcının girdiği verilerin
 * ASLA SIFIRLANMAMASINI sağlar.
 */

export interface StudyNotesState {
  activeSubTab: 'exam' | 'trace' | 'alu' | 'flags' | 'notes' | 'cheatsheet';
  selectedWeek: number;
  selectedCategory: string;
  userInputs: Record<string, Record<string, string>>; // qId -> fieldName -> value
  gradedQuestions: Record<string, {
    score: number;
    total: number;
    fieldFeedback: Record<string, { passed: boolean; message: string }>;
    revealed: boolean;
  }>;
  aluCalculator: {
    num1: string;
    num2: string;
    op: 'ADD' | 'SUB';
    mode: '8bit' | '16bit';
  };
  traceTableInputs: Record<string, string>; // cellKey -> value
  traceTableGraded?: {
    passed: boolean;
    feedback: Record<string, boolean>;
    revealed: boolean;
  };
}

const DEFAULT_STATE: StudyNotesState = {
  activeSubTab: 'exam',
  selectedWeek: 0,
  selectedCategory: 'all',
  userInputs: {},
  gradedQuestions: {},
  aluCalculator: {
    num1: 'F5',
    num2: '0B',
    op: 'ADD',
    mode: '8bit'
  },
  traceTableInputs: {},
  traceTableGraded: undefined
};

class StudyNotesStoreClass {
  private state: StudyNotesState = { ...DEFAULT_STATE };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('assemblysim_study_notes_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = {
          ...DEFAULT_STATE,
          ...parsed,
          aluCalculator: { ...DEFAULT_STATE.aluCalculator, ...(parsed.aluCalculator || {}) },
          userInputs: parsed.userInputs || {},
          gradedQuestions: parsed.gradedQuestions || {},
          traceTableInputs: parsed.traceTableInputs || {}
        };
      }
    } catch (_) {}
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('assemblysim_study_notes_state', JSON.stringify(this.state));
    } catch (_) {}
  }

  getState(): StudyNotesState {
    return this.state;
  }

  setSubTab(tab: StudyNotesState['activeSubTab']): void {
    this.state.activeSubTab = tab;
    this.saveToStorage();
    this.notify();
  }

  setSelectedWeek(week: number): void {
    this.state.selectedWeek = week;
    this.saveToStorage();
    this.notify();
  }

  setSelectedCategory(cat: string): void {
    this.state.selectedCategory = cat;
    this.saveToStorage();
    this.notify();
  }

  setUserInput(qId: string, field: string, value: string): void {
    if (!this.state.userInputs[qId]) {
      this.state.userInputs[qId] = {};
    }
    this.state.userInputs[qId][field] = value;
    this.saveToStorage();
  }

  getUserInput(qId: string, field: string): string {
    return this.state.userInputs[qId]?.[field] || '';
  }

  setGradedQuestion(qId: string, graded: StudyNotesState['gradedQuestions'][string]): void {
    this.state.gradedQuestions[qId] = graded;
    this.saveToStorage();
    this.notify();
  }

  toggleQuestionSolution(qId: string): void {
    if (this.state.gradedQuestions[qId]) {
      this.state.gradedQuestions[qId].revealed = !this.state.gradedQuestions[qId].revealed;
      this.saveToStorage();
      this.notify();
    }
  }

  setAluState(num1: string, num2: string, op: 'ADD' | 'SUB', mode: '8bit' | '16bit'): void {
    this.state.aluCalculator = { num1, num2, op, mode };
    this.saveToStorage();
    this.notify();
  }

  setTraceInput(cellKey: string, value: string): void {
    this.state.traceTableInputs[cellKey] = value;
    this.saveToStorage();
  }

  getTraceInput(cellKey: string): string {
    return this.state.traceTableInputs[cellKey] || '';
  }

  setTraceGraded(graded: StudyNotesState['traceTableGraded']): void {
    this.state.traceTableGraded = graded;
    this.saveToStorage();
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }
}

export const StudyNotesStore = new StudyNotesStoreClass();
