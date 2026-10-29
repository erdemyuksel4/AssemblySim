/**
 * statePredictionWidget.ts
 * 
 * Her aşama için "Koda Bakarak Durum Tahmini (Register / Flag / Memory Analizi)"
 * bileşenini yöneten interaktif kontrolcü.
 */

import { StatePredictionExercise, MILESTONE_STATE_PREDICTIONS, PredictionStore } from './statePredictionData.js';

export interface StatePredictionWidgetCallbacks {
  onOpenInMainEditor?: (title: string, code: string) => void;
}

export class StatePredictionWidget {
  private container: HTMLElement;
  private exercises: StatePredictionExercise[];
  private callbacks?: StatePredictionWidgetCallbacks;

  constructor(container: HTMLElement, milestoneId: string, callbacks?: StatePredictionWidgetCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.exercises = MILESTONE_STATE_PREDICTIONS[milestoneId] || [];
    this.render();
  }

  render(): void {
    if (!this.exercises || this.exercises.length === 0) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="state-pred-widget-container">
        <div class="state-pred-header">
          <div class="pred-header-badge">DURUM TAHMİNİ</div>
          <h3 class="pred-header-title">Koda Bakarak Register, Flag ve Memory Durumunu Belirleme</h3>
          <p class="pred-header-desc">
            Aşağıdaki kod parçalarını inceleyerek işlem sonrasında yazmaçların, bayrakların ve bellek hücrelerinin alacağı değerleri giriniz.
          </p>
        </div>

        <div class="state-pred-cards-list">
          ${this.exercises.map((ex, exIdx) => this.renderExerciseCard(ex, exIdx)).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private renderExerciseCard(ex: StatePredictionExercise, idx: number): string {
    const graded = PredictionStore.getGradedResult(ex.id);
    const isGraded = !!graded;
    const isPassed = graded && graded.score === graded.total;

    return `
      <div class="state-pred-card ${isGraded ? (isPassed ? 'status-passed' : 'status-failed') : ''}" data-ex-id="${ex.id}">
        <div class="pred-card-topbar">
          <span class="pred-diff-tag ${ex.difficulty}">${ex.difficultyLabel}</span>
          ${isGraded ? `
            <span class="pred-score-badge ${isPassed ? 'passed' : 'failed'}">
              ${isPassed ? '✓ ' : ''}${graded.score} / ${graded.total} Doğru
            </span>
          ` : `
            <span class="pred-pending-badge">Yanıt Bekleniyor</span>
          `}
        </div>

        <h4 class="pred-card-title">${ex.title}</h4>
        <p class="pred-card-scenario">${ex.scenario}</p>

        <!-- Code Block Preview -->
        <div class="pred-code-block-wrap">
          <div class="pred-code-header">
            <span>8086 Assembly Kodu</span>
            <button class="btn-pred-try-sim" data-ex-id="${ex.id}" title="Bu kodu simülatörde çalıştır">
              Simülatörde Canlı Dene
            </button>
          </div>
          <pre class="pred-code-snippet"><code>${this.escapeHtml(ex.codeSnippet)}</code></pre>
        </div>

        <!-- Initial State Info (if any) -->
        ${ex.initialState && (ex.initialState.registers || ex.initialState.flags || ex.initialState.memory) ? `
          <div class="pred-initial-state-bar">
            <span class="initial-label">Başlangıç:</span>
            ${ex.initialState.registers ? Object.entries(ex.initialState.registers).map(([r, v]) => `
              <span class="initial-pill"><code>${r} = ${v}</code></span>
            `).join('') : ''}
            ${ex.initialState.flags ? Object.entries(ex.initialState.flags).map(([f, v]) => `
              <span class="initial-pill flag"><code>${f} = ${v}</code></span>
            `).join('') : ''}
            ${ex.initialState.memory ? Object.entries(ex.initialState.memory).map(([m, v]) => `
              <span class="initial-pill mem"><code>${m} = ${v}</code></span>
            `).join('') : ''}
          </div>
        ` : ''}

        <!-- Interactive Prediction Inputs Area -->
        <div class="pred-interactive-grid">
          <!-- 1. Registers Prediction -->
          ${ex.registersToPredict.length > 0 ? `
            <div class="pred-input-section">
              <h5 class="pred-section-title">1. Yazmaç Değerleri (Hex):</h5>
              <div class="pred-inputs-row">
                ${ex.registersToPredict.map(r => {
                  const val = this.getUserInput(ex.id, `reg_${r.name}`);
                  const feedback = graded?.fieldFeedback[`reg_${r.name}`];
                  return `
                    <div class="pred-field-group ${feedback ? (feedback.passed ? 'is-valid' : 'is-invalid') : ''}">
                      <label class="pred-field-label"><code>${r.name}</code> =</label>
                      <input type="text" class="pred-text-input" 
                        data-ex-id="${ex.id}" 
                        data-field="reg_${r.name}" 
                        placeholder="${r.expected}" 
                        value="${this.escapeHtml(val)}"
                        autocomplete="off" spellcheck="false" />
                      ${feedback ? `
                        <span class="field-feedback-icon">${feedback.passed ? '✓' : '✗'}</span>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 2. Flags Prediction -->
          ${ex.flagsToPredict.length > 0 ? `
            <div class="pred-input-section">
              <h5 class="pred-section-title">2. Durum Bayrakları (0 / 1):</h5>
              <div class="pred-flags-row">
                ${ex.flagsToPredict.map(f => {
                  const val = this.getUserInput(ex.id, `flag_${f.name}`);
                  const feedback = graded?.fieldFeedback[`flag_${f.name}`];
                  return `
                    <div class="pred-flag-group ${feedback ? (feedback.passed ? 'is-valid' : 'is-invalid') : ''}">
                      <span class="pred-flag-name"><code>${f.name}</code>:</span>
                      <div class="pred-flag-toggles" data-ex-id="${ex.id}" data-field="flag_${f.name}">
                        <button type="button" class="btn-flag-toggle ${val === '0' ? 'selected' : ''}" data-val="0">0</button>
                        <button type="button" class="btn-flag-toggle ${val === '1' ? 'selected' : ''}" data-val="1">1</button>
                      </div>
                      ${feedback ? `
                        <span class="field-feedback-icon">${feedback.passed ? '✓' : '✗'}</span>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 3. Memory / Stack Prediction -->
          ${ex.memoryToPredict && ex.memoryToPredict.length > 0 ? `
            <div class="pred-input-section">
              <h5 class="pred-section-title">3. Bellek / Yığın Baytları:</h5>
              <div class="pred-inputs-row">
                ${ex.memoryToPredict.map(m => {
                  const val = this.getUserInput(ex.id, `mem_${m.address}`);
                  const feedback = graded?.fieldFeedback[`mem_${m.address}`];
                  return `
                    <div class="pred-field-group ${feedback ? (feedback.passed ? 'is-valid' : 'is-invalid') : ''}">
                      <label class="pred-field-label"><code>${m.address}</code> =</label>
                      <input type="text" class="pred-text-input" 
                        data-ex-id="${ex.id}" 
                        data-field="mem_${m.address}" 
                        placeholder="${m.expected}" 
                        value="${this.escapeHtml(val)}"
                        autocomplete="off" spellcheck="false" />
                      ${feedback ? `
                        <span class="field-feedback-icon">${feedback.passed ? '✓' : '✗'}</span>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="pred-actions-bar">
          <button class="btn-pred-grade primary" data-ex-id="${ex.id}">
            Kontrol Et
          </button>
          ${isGraded ? `
            <button class="btn-pred-toggle-solution secondary" data-ex-id="${ex.id}">
              ${graded.revealed ? 'Çözümü Gizle' : 'Çözümü Göster'}
            </button>
          ` : ''}
        </div>

        <!-- Walkthrough & Explanation -->
        ${isGraded && graded.revealed ? `
          <div class="pred-solution-box">
            <h5 class="sol-box-title">Adım Adım Çözüm & Bayrak Mantığı:</h5>
            <div class="sol-breakdown-list">
              ${ex.registersToPredict.map(r => `
                <div class="sol-item">
                  <strong>• ${r.name}:</strong> Beklenen <code>${r.expected}</code> — ${r.description}
                </div>
              `).join('')}

              ${ex.flagsToPredict.map(f => `
                <div class="sol-item">
                  <strong>• ${f.name} Bayrağı:</strong> Beklenen <code>${f.expected}</code> — ${f.bitDerivation}
                </div>
              `).join('')}

              ${ex.memoryToPredict ? ex.memoryToPredict.map(m => `
                <div class="sol-item">
                  <strong>• ${m.address}:</strong> Beklenen <code>${m.expected}</code> — ${m.explanation}
                </div>
              `).join('') : ''}
            </div>

            <div class="hoca-strict-warning">
              📌 <strong>Kural & Not:</strong> ${ex.hocaGradingNotes}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private getUserInput(exId: string, field: string): string {
    return PredictionStore.getUserInput(exId, field);
  }

  private setUserInput(exId: string, field: string, val: string): void {
    PredictionStore.setUserInput(exId, field, val);
  }

  private gradeExercise(exId: string): void {
    const ex = this.exercises.find(e => e.id === exId);
    if (!ex) return;

    let score = 0;
    let total = 0;
    const fieldFeedback: Record<string, { passed: boolean; message: string }> = {};

    // 1. Check Registers
    ex.registersToPredict.forEach(r => {
      total++;
      const userVal = this.getUserInput(exId, `reg_${r.name}`).trim();
      const passed = this.compareValues(userVal, r.expected, r.acceptedValues);
      if (passed) score++;
      fieldFeedback[`reg_${r.name}`] = {
        passed,
        message: passed ? 'Doğru' : `Beklenen: ${r.expected}, Girilen: ${userVal || 'Boş'}`
      };
    });

    // 2. Check Flags
    ex.flagsToPredict.forEach(f => {
      total++;
      const userVal = this.getUserInput(exId, `flag_${f.name}`).trim();
      const passed = userVal === f.expected;
      if (passed) score++;
      fieldFeedback[`flag_${f.name}`] = {
        passed,
        message: passed ? 'Doğru' : `Beklenen: ${f.expected}, Girilen: ${userVal || 'Seçilmedi'}`
      };
    });

    // 3. Check Memory
    if (ex.memoryToPredict) {
      ex.memoryToPredict.forEach(m => {
        total++;
        const userVal = this.getUserInput(exId, `mem_${m.address}`).trim();
        const passed = this.compareValues(userVal, m.expected, m.acceptedValues);
        if (passed) score++;
        fieldFeedback[`mem_${m.address}`] = {
          passed,
          message: passed ? 'Doğru' : `Beklenen: ${m.expected}, Girilen: ${userVal || 'Boş'}`
        };
      });
    }

    PredictionStore.setGradedResult(exId, {
      score,
      total,
      fieldFeedback,
      revealed: true
    });

    this.render();
  }

  private compareValues(input: string, expected: string, acceptedList?: string[]): boolean {
    if (!input) return false;
    const cleanIn = input.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
    const cleanExp = expected.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');

    // Direct match or integer numerical match
    if (cleanIn === cleanExp) return true;

    try {
      const numIn = parseInt(cleanIn, 16);
      const numExp = parseInt(cleanExp, 16);
      if (!isNaN(numIn) && !isNaN(numExp) && numIn === numExp) {
        return true;
      }
    } catch (_) {}

    // Check accepted variants list
    if (acceptedList) {
      for (const acc of acceptedList) {
        const cleanAcc = acc.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
        if (cleanIn === cleanAcc) return true;
      }
    }

    return false;
  }

  private attachEvents(): void {
    // Text inputs
    this.container.querySelectorAll<HTMLInputElement>('.pred-text-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const exId = input.dataset.exId;
        const field = input.dataset.field;
        if (exId && field) {
          this.setUserInput(exId, field, input.value);
        }
      });
    });

    // Flag toggle buttons (0 or 1)
    this.container.querySelectorAll<HTMLElement>('.pred-flag-toggles').forEach(wrap => {
      const exId = wrap.dataset.exId;
      const field = wrap.dataset.field;
      wrap.querySelectorAll<HTMLButtonElement>('.btn-flag-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.val || '0';
          if (exId && field) {
            this.setUserInput(exId, field, val);
            wrap.querySelectorAll('.btn-flag-toggle').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          }
        });
      });
    });

    // Grade button
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pred-grade').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.exId;
        if (exId) {
          this.gradeExercise(exId);
        }
      });
    });

    // Toggle solution breakdown button
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pred-toggle-solution').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.exId;
        if (exId) {
          const graded = PredictionStore.getGradedResult(exId);
          if (graded) {
            PredictionStore.setGradedResult(exId, {
              ...graded,
              revealed: !graded.revealed
            });
            this.render();
          }
        }
      });
    });

    // Try in simulator live
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pred-try-sim').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.exId;
        const ex = this.exercises.find(e => e.id === exId);
        if (ex && this.callbacks?.onOpenInMainEditor) {
          const runnableCode = `ORG 100H\n; 🧠 Durum Tahmin Denemesi: ${ex.title}\n\n${ex.codeSnippet}\n\nHLT\n`;
          this.callbacks.onOpenInMainEditor(`tahmin-${ex.id}.asm`, runnableCode);
        }
      });
    });
  }

  private escapeHtml(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
