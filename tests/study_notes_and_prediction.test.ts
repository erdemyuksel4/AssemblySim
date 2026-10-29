import { describe, it, expect } from 'vitest';
import { MILESTONE_STATE_PREDICTIONS, PredictionStore } from '../src/lectures/statePredictionData.js';
import { ALL_WEEKS_STUDY_NOTES, INSTRUCTION_FLAG_MATRIX } from '../src/ui/studyNotesData.js';
import { MIDTERM_EXAM_QUESTIONS } from '../src/ui/midtermExamData.js';
import { StudyNotesStore } from '../src/ui/studyNotesStore.js';

describe('Study Notes & Vize Hazırlık Veritabanı Testleri', () => {
  it('Her aşama için (milestone-1 ile milestone-11 arası) en az bir durum tahmin alıştırması tanımlı olmalıdır', () => {
    const requiredMilestones = [
      'milestone-1', 'milestone-2', 'milestone-3', 'milestone-4',
      'milestone-5', 'milestone-6', 'milestone-7', 'milestone-8',
      'milestone-9', 'milestone-10', 'milestone-11'
    ];

    requiredMilestones.forEach(mId => {
      const preds = MILESTONE_STATE_PREDICTIONS[mId];
      expect(preds, `${mId} için tahmin alıştırması bulunmalıdır`).toBeDefined();
      expect(preds.length, `${mId} en az 1 alıştırma içermelidir`).toBeGreaterThanOrEqual(1);

      preds.forEach(ex => {
        expect(ex.id).toBeTruthy();
        expect(ex.title).toBeTruthy();
        expect(ex.scenario).toBeTruthy();
        expect(ex.codeSnippet).toBeTruthy();
        expect(ex.hocaGradingNotes).toBeTruthy();

        // Her alıştırmanın tahmin edilecek alanı olmalı
        const totalFields = ex.registersToPredict.length + ex.flagsToPredict.length + (ex.memoryToPredict?.length || 0);
        expect(totalFields, `${ex.id} tahmin edilecek alan içermelidir`).toBeGreaterThan(0);

        // Bayrak kontrolleri
        ex.flagsToPredict.forEach(f => {
          expect(['CF', 'ZF', 'SF', 'OF', 'PF', 'AF', 'DF']).toContain(f.name);
          expect(['0', '1']).toContain(f.expected);
          expect(f.bitDerivation.length).toBeGreaterThan(10);
        });

        // Register kontrolleri
        ex.registersToPredict.forEach(r => {
          expect(r.name).toBeTruthy();
          expect(r.expected).toBeTruthy();
          expect(r.description.length).toBeGreaterThan(5);
        });
      });
    });
  });

  it('Hafta hafta ders notları (1-15) eksiksiz olmalı ve tüm kritik konuları içermelidir', () => {
    expect(ALL_WEEKS_STUDY_NOTES.length).toBeGreaterThanOrEqual(6);

    const week1 = ALL_WEEKS_STUDY_NOTES.find(w => w.weekNumber === 1);
    expect(week1).toBeDefined();
    expect(week1?.summaryHtml).toContain('TPA');
    expect(week1?.summaryHtml).toContain('System Area');
    expect(week1?.summaryHtml).toContain('Multiply-Radix');

    const week2 = ALL_WEEKS_STUDY_NOTES.find(w => w.weekNumber === 2);
    expect(week2).toBeDefined();
    expect(week2?.summaryHtml).toContain('FLAGS');
    expect(week2?.summaryHtml).toContain('Fiziksel Adres');

    const week5 = ALL_WEEKS_STUDY_NOTES.find(w => w.weekNumber === 5);
    expect(week5).toBeDefined();
    expect(week5?.summaryHtml).toContain('w11.pdf');
    expect(week5?.summaryHtml).toContain('Divide Error');

    const week6 = ALL_WEEKS_STUDY_NOTES.find(w => w.weekNumber === 6);
    expect(week6).toBeDefined();
    expect(week6?.summaryHtml).toContain('Excalidraw');
    expect(week6?.summaryHtml).toContain('DMA');
  });

  it('Komut-Bayrak etki matrisi tüm temel komutları ve altın kuralları içermelidir', () => {
    expect(INSTRUCTION_FLAG_MATRIX.length).toBeGreaterThanOrEqual(10);

    const movRule = INSTRUCTION_FLAG_MATRIX.find(m => m.instruction.includes('MOV'));
    expect(movRule?.cf).toBe('—');
    expect(movRule?.zf).toBe('—');

    const incRule = INSTRUCTION_FLAG_MATRIX.find(m => m.instruction.includes('INC'));
    expect(incRule?.cf).toContain('KORUNUR');

    const logicRule = INSTRUCTION_FLAG_MATRIX.find(m => m.instruction.includes('AND'));
    expect(logicRule?.cf).toContain('0');
    expect(logicRule?.of).toContain('0');

    const loopRule = INSTRUCTION_FLAG_MATRIX.find(m => m.instruction.includes('LOOP'));
    expect(loopRule?.zf).toBe('—');
  });

  it('Vize çalışma soruları zor hoca standartlarında puanlama anahtarı ve tuzakları barındırmalıdır', () => {
    expect(MIDTERM_EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(8);

    const totalExamPoints = MIDTERM_EXAM_QUESTIONS.reduce((s, q) => s + q.points, 0);
    expect(totalExamPoints).toBeGreaterThanOrEqual(100);

    MIDTERM_EXAM_QUESTIONS.forEach(q => {
      expect(q.id).toBeTruthy();
      expect(q.title).toBeTruthy();
      expect(q.scenario).toBeTruthy();
      expect(q.codeSnippet).toBeTruthy();
      expect(q.hocaRubric.length).toBeGreaterThan(20);
      expect(q.points).toBeGreaterThan(0);
    });

    // Klasik F5H + 0BH sorusunun varlığını doğrula
    const qF5 = MIDTERM_EXAM_QUESTIONS.find(q => q.id === 'vize-q1-f5-add');
    expect(qF5).toBeDefined();
    const flagCF = qF5?.expectedFlags.find(f => f.name === 'CF');
    const flagZF = qF5?.expectedFlags.find(f => f.name === 'ZF');
    expect(flagCF?.expected).toBe('1');
    expect(flagZF?.expected).toBe('1');
  });

  it('StudyNotesStore ve PredictionStore verileri saklamalı ve yan pencereye geçildiğinde sıfırlanmamalıdır', () => {
    // 1. StudyNotesStore Tab & User Input persistence
    StudyNotesStore.setSubTab('trace');
    expect(StudyNotesStore.getState().activeSubTab).toBe('trace');

    StudyNotesStore.setUserInput('vize-q1-f5-add', 'reg_AL', '00');
    expect(StudyNotesStore.getUserInput('vize-q1-f5-add', 'reg_AL')).toBe('00');

    StudyNotesStore.setTraceInput('r1_ax', '2');
    expect(StudyNotesStore.getTraceInput('r1_ax')).toBe('2');

    StudyNotesStore.setAluState('7F', '01', 'ADD', '8bit');
    expect(StudyNotesStore.getState().aluCalculator.num1).toBe('7F');
    expect(StudyNotesStore.getState().aluCalculator.num2).toBe('01');

    // 2. PredictionStore persistence
    PredictionStore.setUserInput('m1-ex1', 'reg_AX', '1234');
    expect(PredictionStore.getUserInput('m1-ex1', 'reg_AX')).toBe('1234');

    PredictionStore.setGradedResult('m1-ex1', {
      score: 1,
      total: 1,
      fieldFeedback: { reg_AX: { passed: true, message: 'Doğru' } },
      revealed: true
    });
    const graded = PredictionStore.getGradedResult('m1-ex1');
    expect(graded?.score).toBe(1);
    expect(graded?.revealed).toBe(true);
  });
});
