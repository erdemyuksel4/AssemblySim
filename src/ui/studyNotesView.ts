/**
 * studyNotesView.ts
 * 
 * Doç. Dr. Mehmet Akif Çifci'nin ders slaytları, laboratuvar föyleri ve tahta notlarına dayalı;
 * sade, net ve PDF formatında tasarlanmış interaktif Vize Çalışma & Sınav Merkezi.
 * 
 * Durumlar StudyNotesStore üzerinde tutulur; yan sayfaya taşındığında sıfırlanmaz.
 */

import { ALL_WEEKS_STUDY_NOTES, INSTRUCTION_FLAG_MATRIX } from './studyNotesData.js';
import { MIDTERM_EXAM_QUESTIONS, MidtermQuestion } from './midtermExamData.js';
import { StudyNotesStore, StudyNotesState } from './studyNotesStore.js';

export interface StudyNotesCallbacks {
  onOpenInMainEditor?: (title: string, code: string) => void;
  onNavigateToLecture?: (milestoneId: string) => void;
}

export class StudyNotesView {
  private container: HTMLElement;
  private callbacks?: StudyNotesCallbacks;
  private unsubscribe?: () => void;

  constructor(container: HTMLElement, callbacks?: StudyNotesCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();

    // Re-render when store updates (keeps primary and secondary panes strictly in sync)
    this.unsubscribe = StudyNotesStore.subscribe(() => {
      this.updateView();
    });
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render(): void {
    const state = StudyNotesStore.getState();

    this.container.innerHTML = `
      <div class="pdf-study-container">
        <!-- PDF Document Header -->
        <header class="pdf-doc-header">
          <div class="pdf-header-top">
            <span class="pdf-course-code">BMI3121 MİKROİŞLEMCİLER</span>
            <span class="pdf-doc-type">DERS ÇALIŞMA VE SINAV FÖYÜ</span>
          </div>
          <h1 class="pdf-main-title">8086 Assembly Vize Hazırlık & Konu Notları</h1>
          <p class="pdf-subtitle">
            Doç. Dr. Mehmet Akif Çifci ders slaytları, sınıf tahtası döngü izleme çizimleri ve laboratuvar kodları referans alınarak hazırlanmıştır.
          </p>

          <!-- PDF Navigation Tabs -->
          <nav class="pdf-tabs-nav">
            <button class="btn-pdf-tab ${state.activeSubTab === 'exam' ? 'active' : ''}" data-subtab="exam">
              [FÖY 1] Vize Çalışma Soruları
            </button>
            <button class="btn-pdf-tab ${state.activeSubTab === 'trace' ? 'active' : ''}" data-subtab="trace">
              [FÖY 2] Döngü İzleme Tablosu
            </button>
            <button class="btn-pdf-tab ${state.activeSubTab === 'alu' ? 'active' : ''}" data-subtab="alu">
              [FÖY 3] Canlı Bit ALU & Bayrak Aracı
            </button>
            <button class="btn-pdf-tab ${state.activeSubTab === 'flags' ? 'active' : ''}" data-subtab="flags">
              [FÖY 4] Bayraklar & Komut Etki Matrisi
            </button>
            <button class="btn-pdf-tab ${state.activeSubTab === 'notes' ? 'active' : ''}" data-subtab="notes">
              [FÖY 5] Hafta Hafta Konu Notları
            </button>
          </nav>
        </header>

        <!-- PDF Page Content Area -->
        <main class="pdf-page-sheet" id="pdf-page-sheet">
          ${this.renderActiveSheet(state)}
        </main>
      </div>
    `;

    this.attachEvents();
  }

  private updateView(): void {
    const state = StudyNotesStore.getState();
    const sheet = this.container.querySelector('#pdf-page-sheet');
    if (sheet) {
      sheet.innerHTML = this.renderActiveSheet(state);
      this.attachEvents();
    }
  }

  private renderActiveSheet(state: StudyNotesState): string {
    switch (state.activeSubTab) {
      case 'exam':
        return this.renderExamSheet(state);
      case 'trace':
        return this.renderTraceTableSheet(state);
      case 'alu':
        return this.renderAluCalculatorSheet(state);
      case 'flags':
        return this.renderFlagsSheet();
      case 'notes':
        return this.renderNotesSheet(state);
      default:
        return this.renderExamSheet(state);
    }
  }

  // =========================================================================
  // FÖY 1: Vize Çalışma Soruları (Temiz PDF Soru Kağıdı)
  // =========================================================================
  private renderExamSheet(state: StudyNotesState): string {
    const totalPoints = MIDTERM_EXAM_QUESTIONS.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = Object.values(state.gradedQuestions).reduce((sum, g) => sum + g.score, 0);
    const gradedCount = Object.keys(state.gradedQuestions).length;

    const filteredQuestions = state.selectedCategory === 'all'
      ? MIDTERM_EXAM_QUESTIONS
      : MIDTERM_EXAM_QUESTIONS.filter(q => q.category === state.selectedCategory);

    return `
      <div class="pdf-section">
        <div class="pdf-section-header">
          <div>
            <h2 class="pdf-section-title">BÖLÜM 1: VİZE SINAV ÇALIŞMA SORULARI</h2>
            <p class="pdf-section-desc">Kodu inceleyiniz; oluşan yazmaç, bayrak ve bellek değerlerini ilgili kutucuklara yazıp kontrol ediniz.</p>
          </div>
          <div class="pdf-score-box">
            <span>Çözülen: <b>${gradedCount} / ${MIDTERM_EXAM_QUESTIONS.length}</b></span>
            <span>Toplam Puan: <b>${earnedPoints} / ${totalPoints}</b></span>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="pdf-filter-bar">
          <span class="pdf-filter-label">Soru Tipi:</span>
          <button class="btn-pdf-filter ${state.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">Tümü (${MIDTERM_EXAM_QUESTIONS.length})</button>
          <button class="btn-pdf-filter ${state.selectedCategory === 'flags' ? 'active' : ''}" data-cat="flags">Bayrak Hesaplama</button>
          <button class="btn-pdf-filter ${state.selectedCategory === 'trace' ? 'active' : ''}" data-cat="trace">Kod / Yığın İzleme</button>
          <button class="btn-pdf-filter ${state.selectedCategory === 'traps' ? 'active' : ''}" data-cat="traps">Önemli Kurallar & Hatalar</button>
          <button class="btn-pdf-filter ${state.selectedCategory === 'coding' ? 'active' : ''}" data-cat="coding">Klasik Kodlama</button>
        </div>

        <!-- Question Items -->
        <div class="pdf-questions-list">
          ${filteredQuestions.map((q, qIdx) => this.renderSingleQuestion(q, qIdx + 1, state)).join('')}
        </div>
      </div>
    `;
  }

  private renderSingleQuestion(q: MidtermQuestion, num: number, state: StudyNotesState): string {
    const graded = state.gradedQuestions[q.id];
    const isGraded = !!graded;
    const isPassed = graded && graded.score === q.points;

    return `
      <article class="pdf-question-card ${isGraded ? (isPassed ? 'is-correct' : 'is-wrong') : ''}">
        <div class="pdf-q-topbar">
          <span class="pdf-q-number">SORU ${num}</span>
          <span class="pdf-q-points">[${q.points} PUAN]</span>
          <span class="pdf-q-category">${q.categoryLabel}</span>
          ${isGraded ? `
            <span class="pdf-q-status ${isPassed ? 'status-ok' : 'status-err'}">
              ${isPassed ? '✓ Doğru' : `Puan: ${graded.score} / ${q.points}`}
            </span>
          ` : ''}
        </div>

        <h3 class="pdf-q-title">${q.title}</h3>
        <p class="pdf-q-scenario">${q.scenario}</p>

        <!-- Code Block -->
        <div class="pdf-code-block">
          <div class="pdf-code-header">
            <span>Assembly Kaynak Kodu:</span>
            <button class="btn-pdf-try-code" data-q-id="${q.id}">Simülatörde Canlı Çalıştır ↗</button>
          </div>
          <pre><code>${this.escapeHtml(q.codeSnippet)}</code></pre>
        </div>

        <!-- Inputs Grid -->
        <div class="pdf-inputs-grid">
          ${q.expectedRegisters.length > 0 ? `
            <div class="pdf-input-subgroup">
              <span class="pdf-subgroup-label">Yazmaç Değerleri (Hex):</span>
              <div class="pdf-fields-row">
                ${q.expectedRegisters.map(r => {
                  const val = StudyNotesStore.getUserInput(q.id, `reg_${r.name}`);
                  const feedback = graded?.fieldFeedback[`reg_${r.name}`];
                  return `
                    <div class="pdf-field-cell ${feedback ? (feedback.passed ? 'field-ok' : 'field-err') : ''}">
                      <label><code>${r.name}</code> =</label>
                      <input type="text" class="pdf-text-input" 
                        data-q-id="${q.id}" data-field="reg_${r.name}" 
                        value="${this.escapeHtml(val)}" placeholder="örn: 00H" 
                        autocomplete="off" spellcheck="false" />
                      ${feedback ? `<span class="feedback-mark">${feedback.passed ? '✓' : '✗'}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          ${q.expectedFlags.length > 0 ? `
            <div class="pdf-input-subgroup">
              <span class="pdf-subgroup-label">Durum Bayrakları (0 / 1):</span>
              <div class="pdf-flags-row">
                ${q.expectedFlags.map(f => {
                  const val = StudyNotesStore.getUserInput(q.id, `flag_${f.name}`);
                  const feedback = graded?.fieldFeedback[`flag_${f.name}`];
                  return `
                    <div class="pdf-flag-cell ${feedback ? (feedback.passed ? 'field-ok' : 'field-err') : ''}">
                      <span class="pdf-flag-tag"><code>${f.name}</code>:</span>
                      <div class="pdf-flag-btn-group" data-q-id="${q.id}" data-field="flag_${f.name}">
                        <button type="button" class="btn-flag-num ${val === '0' ? 'selected' : ''}" data-val="0">0</button>
                        <button type="button" class="btn-flag-num ${val === '1' ? 'selected' : ''}" data-val="1">1</button>
                      </div>
                      ${feedback ? `<span class="feedback-mark">${feedback.passed ? '✓' : '✗'}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          ${q.expectedMemory && q.expectedMemory.length > 0 ? `
            <div class="pdf-input-subgroup">
              <span class="pdf-subgroup-label">Bellek / Yığın Baytları:</span>
              <div class="pdf-fields-row">
                ${q.expectedMemory.map(m => {
                  const val = StudyNotesStore.getUserInput(q.id, `mem_${m.address}`);
                  const feedback = graded?.fieldFeedback[`mem_${m.address}`];
                  return `
                    <div class="pdf-field-cell ${feedback ? (feedback.passed ? 'field-ok' : 'field-err') : ''}">
                      <label><code>${m.address}</code> =</label>
                      <input type="text" class="pdf-text-input" 
                        data-q-id="${q.id}" data-field="mem_${m.address}" 
                        value="${this.escapeHtml(val)}" placeholder="örn: 00H" 
                        autocomplete="off" spellcheck="false" />
                      ${feedback ? `<span class="feedback-mark">${feedback.passed ? '✓' : '✗'}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Action Bar -->
        <div class="pdf-actions-row">
          <button class="btn-pdf-submit" data-q-id="${q.id}">Kontrol Et</button>
          ${isGraded ? `
            <button class="btn-pdf-solution-toggle" data-q-id="${q.id}">
              ${graded.revealed ? 'Çözümü Gizle' : 'Çözümü Göster'}
            </button>
          ` : ''}
        </div>

        <!-- Clean Solution Sheet -->
        ${isGraded && graded.revealed ? `
          <div class="pdf-solution-sheet">
            <h4 class="pdf-sol-title">Adım Adım Çözüm & Bayrak Mantığı:</h4>
            <ul class="pdf-sol-list">
              ${q.expectedRegisters.map(r => `
                <li><b>${r.name}:</b> Beklenen <code>${r.expected}</code> — ${r.note}</li>
              `).join('')}
              ${q.expectedFlags.map(f => `
                <li><b>${f.name} Bayrağı:</b> Beklenen <code>${f.expected}</code> — ${f.reason}</li>
              `).join('')}
              ${q.expectedMemory ? q.expectedMemory.map(m => `
                <li><b>${m.address}:</b> Beklenen <code>${m.expected}</code> — ${m.note}</li>
              `).join('') : ''}
            </ul>

            <div class="pdf-rule-note">
              <strong>Önemli Kural / Değerlendirme Ölçütü:</strong><br>
              ${q.hocaRubric}
            </div>
          </div>
        ` : ''}
      </article>
    `;
  }

  // =========================================================================
  // FÖY 2: İnteraktif Döngü İzleme Tablosu (Trace Table)
  // =========================================================================
  private renderTraceTableSheet(state: StudyNotesState): string {
    const traceGraded = state.traceTableGraded;

    return `
      <div class="pdf-section">
        <div class="pdf-section-header">
          <div>
            <h2 class="pdf-section-title">BÖLÜM 2: DÖNGÜ İZLEME TABLOSU (TRACE TABLE)</h2>
            <p class="pdf-section-desc">Hocanın Week 6 tahtaya çizdiği döngü adımlarını tablo üzerinde doldurunuz ve sonucu kontrol ediniz.</p>
          </div>
        </div>

        <!-- Assembly Code Preview -->
        <div class="pdf-code-block" style="margin-bottom: 16px;">
          <div class="pdf-code-header"><span>Tahtadaki Döngü Kodu (Excalidraw Week 6):</span></div>
          <pre><code>MOV CX, 4\nMOV AX, 0\nMOV BX, 2\n\nDONGU:\n  ADD AX, BX\n  ADD BX, 2\n  LOOP DONGU\nHLT</code></pre>
        </div>

        <!-- Interactive Fillable Table -->
        <div class="pdf-table-responsive">
          <table class="pdf-trace-table">
            <thead>
              <tr>
                <th style="width: 12%;">Çevrim</th>
                <th style="width: 18%;">Tur Başı CX</th>
                <th style="width: 22%;">AX Değeri (Hex / Onluk)</th>
                <th style="width: 22%;">BX Değeri (Hex / Onluk)</th>
                <th style="width: 14%;">Tur Sonu CX</th>
                <th style="width: 12%;">Çıkış?</th>
              </tr>
            </thead>
            <tbody>
              <!-- Row 1 -->
              <tr>
                <td><b>1. Tur</b></td>
                <td><code>4</code></td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r1_ax" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r1_ax'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r1_ax ? '✓' : '✗ (2)'}</span>` : ''}
                </td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r1_bx" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r1_bx'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r1_bx ? '✓' : '✗ (4)'}</span>` : ''}
                </td>
                <td><code>3</code></td>
                <td>Hayır</td>
              </tr>

              <!-- Row 2 -->
              <tr>
                <td><b>2. Tur</b></td>
                <td><code>3</code></td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r2_ax" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r2_ax'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r2_ax ? '✓' : '✗ (6)'}</span>` : ''}
                </td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r2_bx" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r2_bx'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r2_bx ? '✓' : '✗ (6)'}</span>` : ''}
                </td>
                <td><code>2</code></td>
                <td>Hayır</td>
              </tr>

              <!-- Row 3 -->
              <tr>
                <td><b>3. Tur</b></td>
                <td><code>2</code></td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r3_ax" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r3_ax'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r3_ax ? '✓' : '✗ (12)'}</span>` : ''}
                </td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r3_bx" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r3_bx'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r3_bx ? '✓' : '✗ (8)'}</span>` : ''}
                </td>
                <td><code>1</code></td>
                <td>Hayır</td>
              </tr>

              <!-- Row 4 -->
              <tr>
                <td><b>4. Tur</b></td>
                <td><code>1</code></td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r4_ax" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r4_ax'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r4_ax ? '✓' : '✗ (20 / 14H)'}</span>` : ''}
                </td>
                <td>
                  <input type="text" class="pdf-table-input" data-trace-key="r4_bx" 
                    value="${this.escapeHtml(StudyNotesStore.getTraceInput('r4_bx'))}" placeholder="?" />
                  ${traceGraded ? `<span class="feedback-mark">${traceGraded.feedback.r4_bx ? '✓' : '✗ (10 / 0AH)'}</span>` : ''}
                </td>
                <td><code>0</code></td>
                <td><b>EVET</b></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Critical Flag Question -->
        <div class="pdf-trace-flag-box">
          <label class="pdf-trace-flag-label">
            Kritik Soru: <b>Döngü tamamlandığında Sıfır Bayrağı (Zero Flag - ZF) değeri ne olur?</b>
          </label>
          <div class="pdf-fields-row" style="margin-top: 6px;">
            <div class="pdf-flag-btn-group" data-trace-key="zf_val">
              <button type="button" class="btn-flag-num ${StudyNotesStore.getTraceInput('zf_val') === '0' ? 'selected' : ''}" data-val="0">0</button>
              <button type="button" class="btn-flag-num ${StudyNotesStore.getTraceInput('zf_val') === '1' ? 'selected' : ''}" data-val="1">1</button>
            </div>
            ${traceGraded ? `
              <span class="pdf-trace-zf-result ${traceGraded.feedback.zf_val ? 'field-ok' : 'field-err'}">
                ${traceGraded.feedback.zf_val ? '✓ Doğru: ZF = 0 kalır.' : '✗ Yanlış: Beklenen ZF = 0.'}
              </span>
            ` : ''}
          </div>
        </div>

        <div class="pdf-actions-row" style="margin-top: 14px;">
          <button class="btn-pdf-submit" id="btn-trace-grade">Tabloyu Kontrol Et</button>
          ${traceGraded ? `
            <button class="btn-pdf-solution-toggle" id="btn-trace-toggle-sol">
              ${traceGraded.revealed ? 'Açıklamayı Gizle' : 'Açıklamayı Göster'}
            </button>
          ` : ''}
        </div>

        ${traceGraded && traceGraded.revealed ? `
          <div class="pdf-solution-sheet" style="margin-top: 14px;">
            <h4 class="pdf-sol-title">Döngü İzleme Açıklaması:</h4>
            <p>1. Tur: AX = 0 + 2 = 2, BX = 2 + 2 = 4, CX = 3 (Döngü devam eder).</p>
            <p>2. Tur: AX = 2 + 4 = 6, BX = 4 + 2 = 6, CX = 2 (Döngü devam eder).</p>
            <p>3. Tur: AX = 6 + 6 = 12, BX = 6 + 2 = 8, CX = 1 (Döngü devam eder).</p>
            <p>4. Tur: AX = 12 + 8 = 20 (14H), BX = 8 + 2 = 10 (0AH), CX = 0 (Döngü sonlanır).</p>
            <div class="pdf-rule-note">
              <strong>Sıfır Bayrağı (ZF) Neden 0 Kalır?</strong><br>
              8086 donanımında <code>LOOP</code> komutu bayrakları <b>asla değiştirmez</b>. CX sayacı 0 olsa bile ZF kurulmaz.
              En son çalışan aritmetik komut <code>ADD BX, 2</code> olup BX = 10 sonucunu ürettiği için ZF = 0 kalmıştır.
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // =========================================================================
  // FÖY 3: Canlı Bit Seviyesi ALU & Bayrak Hesaplayıcı (Visual Bit Adder/Subtractor)
  // =========================================================================
  private renderAluCalculatorSheet(state: StudyNotesState): string {
    const calc = state.aluCalculator;
    const n1 = parseInt(calc.num1 || '0', 16) || 0;
    const n2 = parseInt(calc.num2 || '0', 16) || 0;
    const is8bit = calc.mode === '8bit';
    const mask = is8bit ? 0xFF : 0xFFFF;
    const bitWidth = is8bit ? 8 : 16;

    // Bit calculations
    const op = calc.op;
    const rawResult = op === 'ADD' ? (n1 + n2) : (n1 - n2);
    const maskedResult = (rawResult & mask);

    // Carry bits array
    const carries: number[] = new Array(bitWidth + 1).fill(0);
    let carry = 0;
    for (let i = 0; i < bitWidth; i++) {
      const b1 = (n1 >> i) & 1;
      const b2 = op === 'ADD' ? ((n2 >> i) & 1) : (((~n2 & mask) >> i) & 1);
      const sum = b1 + b2 + (op === 'SUB' && i === 0 ? 1 : carry);
      carry = sum >= 2 ? 1 : 0;
      carries[i + 1] = carry;
    }

    // Flags
    const cf = op === 'ADD' 
      ? (rawResult > mask ? 1 : 0)
      : (n1 < n2 ? 1 : 0);
    const zf = maskedResult === 0 ? 1 : 0;
    const msb = (maskedResult >> (bitWidth - 1)) & 1;
    const sf = msb;

    // Auxiliary Carry (AF): carry from bit 3 to bit 4
    let af = 0;
    if (op === 'ADD') {
      af = ((n1 & 0x0F) + (n2 & 0x0F)) > 0x0F ? 1 : 0;
    } else {
      af = (n1 & 0x0F) < (n2 & 0x0F) ? 1 : 0;
    }

    // Parity Flag (PF): low 8 bits 1s count is even
    const low8 = maskedResult & 0xFF;
    let onesCount = 0;
    for (let i = 0; i < 8; i++) {
      if ((low8 >> i) & 1) onesCount++;
    }
    const pf = (onesCount % 2 === 0) ? 1 : 0;

    // Overflow Flag (OF)
    let of = 0;
    const s1 = (n1 >> (bitWidth - 1)) & 1;
    const s2 = (n2 >> (bitWidth - 1)) & 1;
    if (op === 'ADD') {
      of = (s1 === s2 && s1 !== sf) ? 1 : 0;
    } else {
      of = (s1 !== s2 && s1 !== sf) ? 1 : 0;
    }

    return `
      <div class="pdf-section">
        <div class="pdf-section-header">
          <div>
            <h2 class="pdf-section-title">BÖLÜM 3: CANLI BİT SEVİYESİ ALU & BAYRAK HESAPLAYICI</h2>
            <p class="pdf-section-desc">
              İki onaltılık (hex) sayı girerek 8086 ALU'sunun bitleri nasıl topladığını/çıkardığını ve her bayrağın (CF, ZF, AF, PF, SF, OF) matematiksel olarak neden 0 veya 1 olduğunu canlı izleyiniz.
            </p>
          </div>
        </div>

        <!-- Inputs Row -->
        <div class="pdf-alu-controls">
          <div class="pdf-alu-field">
            <label>Sayı 1 (Hex):</label>
            <input type="text" id="alu-in-num1" class="pdf-text-input" value="${this.escapeHtml(calc.num1)}" maxlength="4" />
          </div>

          <div class="pdf-alu-field">
            <label>İşlem:</label>
            <select id="alu-select-op" class="pdf-select">
              <option value="ADD" ${calc.op === 'ADD' ? 'selected' : ''}>ADD (+)</option>
              <option value="SUB" ${calc.op === 'SUB' ? 'selected' : ''}>SUB (-)</option>
            </select>
          </div>

          <div class="pdf-alu-field">
            <label>Sayı 2 (Hex):</label>
            <input type="text" id="alu-in-num2" class="pdf-text-input" value="${this.escapeHtml(calc.num2)}" maxlength="4" />
          </div>

          <div class="pdf-alu-field">
            <label>Genişlik:</label>
            <select id="alu-select-mode" class="pdf-select">
              <option value="8bit" ${calc.mode === '8bit' ? 'selected' : ''}>8-Bit (Bayt)</option>
              <option value="16bit" ${calc.mode === '16bit' ? 'selected' : ''}>16-Bit (Kelime)</option>
            </select>
          </div>

          <!-- Quick presets -->
          <div class="pdf-alu-presets">
            <span style="font-size: 11px; font-weight:700;">Hızlı Örnekler:</span>
            <button class="btn-pdf-preset" data-p1="F5" data-p2="0B" data-op="ADD">F5H + 0BH</button>
            <button class="btn-pdf-preset" data-p1="22" data-p2="44" data-op="SUB">22H - 44H</button>
            <button class="btn-pdf-preset" data-p1="7F" data-p2="01" data-op="ADD">7FH + 01H (OF)</button>
            <button class="btn-pdf-preset" data-p1="3F" data-p2="23" data-op="SUB">3FH - 23H</button>
          </div>
        </div>

        <!-- Visual Bit Matrix -->
        <div class="pdf-bit-display-card">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800;">Bit Seviyesinde Donanım Akışı:</h4>
          
          <div class="pdf-bit-grid-wrap">
            <table class="pdf-bit-grid-table">
              <tbody>
                <!-- Carries Row -->
                <tr class="row-carries">
                  <td class="col-label">Elde (Carry Akışı):</td>
                  ${Array.from({ length: bitWidth }).map((_, i) => {
                    const bitIdx = bitWidth - 1 - i;
                    const c = carries[bitIdx + 1];
                    const isAfBit = (bitIdx === 4);
                    const isCfBit = (bitIdx === bitWidth - 1);
                    return `<td class="bit-cell carry ${c ? 'has-carry' : ''} ${isAfBit ? 'af-col' : ''} ${isCfBit ? 'cf-col' : ''}">
                      ${c ? '1' : '0'}
                      ${isAfBit && c ? '<small class="af-tag">AF</small>' : ''}
                      ${isCfBit && c ? '<small class="cf-tag">CF</small>' : ''}
                    </td>`;
                  }).join('')}
                </tr>

                <!-- Number 1 Row -->
                <tr class="row-num1">
                  <td class="col-label">Sayı 1 (${calc.num1.toUpperCase()}H):</td>
                  ${Array.from({ length: bitWidth }).map((_, i) => {
                    const bitIdx = bitWidth - 1 - i;
                    const b = (n1 >> bitIdx) & 1;
                    return `<td class="bit-cell">${b}</td>`;
                  }).join('')}
                </tr>

                <!-- Number 2 Row -->
                <tr class="row-num2">
                  <td class="col-label">Sayı 2 (${calc.num2.toUpperCase()}H):</td>
                  ${Array.from({ length: bitWidth }).map((_, i) => {
                    const bitIdx = bitWidth - 1 - i;
                    const b = (n2 >> bitIdx) & 1;
                    return `<td class="bit-cell">${b}</td>`;
                  }).join('')}
                </tr>

                <!-- Result Row -->
                <tr class="row-result">
                  <td class="col-label">Sonuç (${maskedResult.toString(16).toUpperCase().padStart(is8bit ? 2 : 4, '0')}H):</td>
                  ${Array.from({ length: bitWidth }).map((_, i) => {
                    const bitIdx = bitWidth - 1 - i;
                    const b = (maskedResult >> bitIdx) & 1;
                    return `<td class="bit-cell res ${b ? 'is-one' : 'is-zero'}">${b}</td>`;
                  }).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Flags Result Summary Cards -->
        <div class="pdf-flags-summary-grid">
          <div class="pdf-flag-summary-card ${cf ? 'active' : ''}">
            <div class="pfs-head"><span class="pfs-name">CF (Carry)</span><span class="pfs-val">${cf}</span></div>
            <p class="pfs-desc">${cf ? 'Bit 7 / 15 dışına elde taştı (veya borç alındı).' : 'Taşma veya borç oluşmadı.'}</p>
          </div>

          <div class="pdf-flag-summary-card ${zf ? 'active' : ''}">
            <div class="pfs-head"><span class="pfs-name">ZF (Zero)</span><span class="pfs-val">${zf}</span></div>
            <p class="pfs-desc">${zf ? 'Sonuç tam olarak 0 çıktı.' : 'Sonuç sıfırdan farklı.'}</p>
          </div>

          <div class="pdf-flag-summary-card ${sf ? 'active' : ''}">
            <div class="pfs-head"><span class="pfs-name">SF (Sign)</span><span class="pfs-val">${sf}</span></div>
            <p class="pfs-desc">${sf ? 'En yüksek anlamlı bit (MSB) 1 (Sonuç negatif).' : 'MSB 0 (Sonuç pozitif).'}</p>
          </div>

          <div class="pdf-flag-summary-card ${of ? 'active' : ''}">
            <div class="pfs-head"><span class="pfs-name">OF (Overflow)</span><span class="pfs-val">${of}</span></div>
            <p class="pfs-desc">${of ? 'İşaretli sınır aşıldı (+127 / -128 dışına çıkıldı).' : 'İşaretli taşma yok.'}</p>
          </div>

          <div class="pdf-flag-summary-card ${pf ? 'active' : ''}">
            <div class="pfs-head"><span class="pfs-name">PF (Parity)</span><span class="pfs-val">${pf}</span></div>
            <p class="pfs-desc">${pf ? `Düşük 8 bit içinde ${onesCount} adet '1' var (${onesCount} çifttir).` : `Düşük 8 bit içinde ${onesCount} adet '1' var (${onesCount} tektir).`}</p>
          </div>

          <div class="pdf-flag-summary-card ${af ? 'active' : ''}">
            <div class="pfs-head"><span class="pfs-name">AF (Auxiliary)</span><span class="pfs-val">${af}</span></div>
            <p class="pfs-desc">${af ? 'Bit 3 ten Bit 4 e alt nibble eldesi geçti.' : 'Alt nibble eldesi yok.'}</p>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // FÖY 4: Bayraklar & Komut Etki Matrisi (PDF Tablosu)
  // =========================================================================
  private renderFlagsSheet(): string {
    return `
      <div class="pdf-section">
        <div class="pdf-section-header">
          <div>
            <h2 class="pdf-section-title">BÖLÜM 4: BAYRAKLAR & KOMUT ETKİ MATRİSİ</h2>
            <p class="pdf-section-desc">8086 mikroişlemcisinde her komutun durum bayrakları üzerindeki kesin donanımsal etkisi.</p>
          </div>
        </div>

        <div class="pdf-table-responsive">
          <table class="pdf-trace-table" style="font-size: 11.5px;">
            <thead>
              <tr>
                <th style="width: 18%;">Komut(lar)</th>
                <th style="width: 12%;">Kategori</th>
                <th>CF</th><th>ZF</th><th>SF</th><th>OF</th><th>PF</th><th>AF</th>
                <th style="width: 35%;">Donanımsal Kural & Açıklama</th>
              </tr>
            </thead>
            <tbody>
              ${INSTRUCTION_FLAG_MATRIX.map(row => `
                <tr>
                  <td><code>${row.instruction}</code></td>
                  <td>${row.category}</td>
                  <td><b>${row.cf}</b></td>
                  <td>${row.zf}</td>
                  <td>${row.sf}</td>
                  <td>${row.of}</td>
                  <td>${row.pf}</td>
                  <td>${row.af}</td>
                  <td style="font-size: 11px; line-height: 1.4;">${row.ruleExplanation}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pdf-rule-note" style="margin-top: 16px;">
          <strong>Temel Sınav Kuralları Özeti:</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.5;">
            <li><code>MOV, XCHG, LEA, PUSH, POP, NOT, LOOP, JCXZ</code> bayrakları <b>asla değiştirmez</b>.</li>
            <li><code>INC ve DEC</code> sayaç döngülerinde eldeyi korumak için <b>CF bayrağını değiştirmez</b>.</li>
            <li><code>AND, OR, XOR, TEST</code> mantıksal komutları <b>CF=0 ve OF=0</b> yapar.</li>
            <li><code>MUL ve IMUL</code> komutlarında yalnızca <b>CF ve OF</b> tanımlıdır; diğerleri belirsizdir.</li>
            <li><code>DIV ve IDIV</code> komutlarında <b>tüm durum bayrakları belirsizdir</b>.</li>
          </ul>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // FÖY 5: Hafta Hafta Konu Notları (Temiz PDF Kitapçığı)
  // =========================================================================
  private renderNotesSheet(state: StudyNotesState): string {
    const notesToShow = state.selectedWeek === 0
      ? ALL_WEEKS_STUDY_NOTES
      : ALL_WEEKS_STUDY_NOTES.filter(w => w.weekNumber === state.selectedWeek);

    return `
      <div class="pdf-section">
        <div class="pdf-section-header">
          <div>
            <h2 class="pdf-section-title">BÖLÜM 5: HAFTA HAFTA DERS NOTLARI</h2>
            <p class="pdf-section-desc">Hafta 1'den Hafta 15'e kadar ders slaytları ve sınav konularının tam özeti.</p>
          </div>
        </div>

        <!-- Week tabs -->
        <div class="pdf-filter-bar">
          <button class="btn-pdf-week ${state.selectedWeek === 0 ? 'active' : ''}" data-week="0">Tümü (1–15)</button>
          ${ALL_WEEKS_STUDY_NOTES.map(w => `
            <button class="btn-pdf-week ${state.selectedWeek === w.weekNumber ? 'active' : ''}" data-week="${w.weekNumber}">
              Hafta ${w.weekNumber}
            </button>
          `).join('')}
        </div>

        <div class="pdf-notes-container">
          ${notesToShow.map(note => `
            <article class="pdf-week-block">
              <div class="pwb-header">
                <span class="pwb-week-tag">HAFTA ${note.weekNumber}</span>
                <span class="pwb-period-tag">${note.period}</span>
                <h3 class="pwb-title">${note.title}</h3>
                <p class="pwb-sub">${note.subtitle}</p>
              </div>

              <div class="pwb-content">
                ${note.summaryHtml}
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  private attachEvents(): void {
    // 1. Subtab navigation
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pdf-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.dataset.subtab as StudyNotesState['activeSubTab'];
        if (sub) {
          StudyNotesStore.setSubTab(sub);
        }
      });
    });

    // 2. Category filter
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pdf-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        if (cat) {
          StudyNotesStore.setSelectedCategory(cat);
        }
      });
    });

    // 3. Week filter
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pdf-week').forEach(btn => {
      btn.addEventListener('click', () => {
        const week = parseInt(btn.dataset.week || '0', 10);
        StudyNotesStore.setSelectedWeek(week);
      });
    });

    // 4. Question Text Inputs
    this.container.querySelectorAll<HTMLInputElement>('.pdf-text-input').forEach(input => {
      input.addEventListener('input', () => {
        const qId = input.dataset.qId;
        const field = input.dataset.field;
        if (qId && field) {
          StudyNotesStore.setUserInput(qId, field, input.value);
        }
      });
    });

    // 5. Question Flag Toggle Buttons
    this.container.querySelectorAll<HTMLElement>('.pdf-flag-btn-group').forEach(group => {
      const qId = group.dataset.qId;
      const field = group.dataset.field;
      const traceKey = group.dataset.traceKey;

      group.querySelectorAll<HTMLButtonElement>('.btn-flag-num').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.val || '0';
          if (qId && field) {
            StudyNotesStore.setUserInput(qId, field, val);
            group.querySelectorAll('.btn-flag-num').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          } else if (traceKey) {
            StudyNotesStore.setTraceInput(traceKey, val);
            group.querySelectorAll('.btn-flag-num').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          }
        });
      });
    });

    // 6. Grade Question Button
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pdf-submit').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qId;
        if (qId) {
          this.gradeQuestion(qId);
        }
      });
    });

    // 7. Toggle Solution
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pdf-solution-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qId;
        if (qId) {
          StudyNotesStore.toggleQuestionSolution(qId);
        }
      });
    });

    // 8. Open Code in Simulator
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pdf-try-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qId;
        const q = MIDTERM_EXAM_QUESTIONS.find(item => item.id === qId);
        if (q && this.callbacks?.onOpenInMainEditor) {
          this.callbacks.onOpenInMainEditor(`vize-${q.id}.asm`, q.codeSnippet);
        }
      });
    });

    // 9. Trace Table inputs
    this.container.querySelectorAll<HTMLInputElement>('.pdf-table-input').forEach(input => {
      input.addEventListener('input', () => {
        const traceKey = input.dataset.traceKey;
        if (traceKey) {
          StudyNotesStore.setTraceInput(traceKey, input.value);
        }
      });
    });

    // 10. Grade Trace Table
    const btnTraceGrade = this.container.querySelector<HTMLButtonElement>('#btn-trace-grade');
    btnTraceGrade?.addEventListener('click', () => {
      this.gradeTraceTable();
    });

    const btnTraceToggle = this.container.querySelector<HTMLButtonElement>('#btn-trace-toggle-sol');
    btnTraceToggle?.addEventListener('click', () => {
      const current = StudyNotesStore.getState().traceTableGraded;
      if (current) {
        StudyNotesStore.setTraceGraded({
          ...current,
          revealed: !current.revealed
        });
      }
    });

    // 11. ALU Calculator Inputs
    const num1In = this.container.querySelector<HTMLInputElement>('#alu-in-num1');
    const num2In = this.container.querySelector<HTMLInputElement>('#alu-in-num2');
    const opSelect = this.container.querySelector<HTMLSelectElement>('#alu-select-op');
    const modeSelect = this.container.querySelector<HTMLSelectElement>('#alu-select-mode');

    const updateAlu = () => {
      if (num1In && num2In && opSelect && modeSelect) {
        StudyNotesStore.setAluState(
          num1In.value.trim().toUpperCase(),
          num2In.value.trim().toUpperCase(),
          opSelect.value as 'ADD' | 'SUB',
          modeSelect.value as '8bit' | '16bit'
        );
      }
    };

    num1In?.addEventListener('input', updateAlu);
    num2In?.addEventListener('input', updateAlu);
    opSelect?.addEventListener('change', updateAlu);
    modeSelect?.addEventListener('change', updateAlu);

    // ALU presets
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pdf-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const p1 = btn.dataset.p1 || 'F5';
        const p2 = btn.dataset.p2 || '0B';
        const op = (btn.dataset.op || 'ADD') as 'ADD' | 'SUB';
        StudyNotesStore.setAluState(p1, p2, op, '8bit');
      });
    });
  }

  private gradeQuestion(qId: string): void {
    const q = MIDTERM_EXAM_QUESTIONS.find(item => item.id === qId);
    if (!q) return;

    let score = 0;
    const totalItems = q.expectedRegisters.length + q.expectedFlags.length + (q.expectedMemory?.length || 0);
    const pointPerItem = totalItems > 0 ? q.points / totalItems : q.points;
    const fieldFeedback: Record<string, { passed: boolean; message: string }> = {};

    // 1. Check Registers
    q.expectedRegisters.forEach(r => {
      const userVal = StudyNotesStore.getUserInput(qId, `reg_${r.name}`).trim();
      const passed = this.compareValues(userVal, r.expected, r.accepted);
      if (passed) score += pointPerItem;
      fieldFeedback[`reg_${r.name}`] = {
        passed,
        message: passed ? 'Doğru' : `Beklenen: ${r.expected}, Girilen: ${userVal || 'Boş'}`
      };
    });

    // 2. Check Flags
    q.expectedFlags.forEach(f => {
      const userVal = StudyNotesStore.getUserInput(qId, `flag_${f.name}`).trim();
      const passed = userVal === f.expected;
      if (passed) score += pointPerItem;
      fieldFeedback[`flag_${f.name}`] = {
        passed,
        message: passed ? 'Doğru' : `Beklenen: ${f.expected}, Girilen: ${userVal || 'Seçilmedi'}`
      };
    });

    // 3. Check Memory
    if (q.expectedMemory) {
      q.expectedMemory.forEach(m => {
        const userVal = StudyNotesStore.getUserInput(qId, `mem_${m.address}`).trim();
        const passed = this.compareValues(userVal, m.expected);
        if (passed) score += pointPerItem;
        fieldFeedback[`mem_${m.address}`] = {
          passed,
          message: passed ? 'Doğru' : `Beklenen: ${m.expected}, Girilen: ${userVal || 'Boş'}`
        };
      });
    }

    const finalScore = Math.min(q.points, Math.round(score));
    StudyNotesStore.setGradedQuestion(qId, {
      score: finalScore,
      total: q.points,
      fieldFeedback,
      revealed: true
    });
  }

  private gradeTraceTable(): void {
    const answers: Record<string, string[]> = {
      r1_ax: ['2', '02', '0002', '2H', '02H'],
      r1_bx: ['4', '04', '0004', '4H', '04H'],
      r2_ax: ['6', '06', '0006', '6H', '06H'],
      r2_bx: ['6', '06', '0006', '6H', '06H'],
      r3_ax: ['12', '0C', '000C', '0CH', 'CH'],
      r3_bx: ['8', '08', '0008', '8H', '08H'],
      r4_ax: ['20', '14', '0014', '14H'],
      r4_bx: ['10', '0A', '000A', '0AH', 'AH']
    };

    const feedback: Record<string, boolean> = {};
    let allPassed = true;

    for (const [key, accepted] of Object.entries(answers)) {
      const userVal = StudyNotesStore.getTraceInput(key).trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
      const passed = accepted.some(a => a.toUpperCase().replace(/^0X/, '').replace(/H$/, '') === userVal);
      feedback[key] = passed;
      if (!passed) allPassed = false;
    }

    const zfVal = StudyNotesStore.getTraceInput('zf_val').trim();
    const zfPassed = zfVal === '0';
    feedback['zf_val'] = zfPassed;
    if (!zfPassed) allPassed = false;

    StudyNotesStore.setTraceGraded({
      passed: allPassed,
      feedback,
      revealed: true
    });
  }

  private compareValues(input: string, expected: string, acceptedList?: string[]): boolean {
    if (!input) return false;
    const cleanIn = input.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
    const cleanExp = expected.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');

    if (cleanIn === cleanExp) return true;

    try {
      const numIn = parseInt(cleanIn, 16);
      const numExp = parseInt(cleanExp, 16);
      if (!isNaN(numIn) && !isNaN(numExp) && numIn === numExp) {
        return true;
      }
    } catch (_) {}

    if (acceptedList) {
      for (const acc of acceptedList) {
        const cleanAcc = acc.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
        if (cleanIn === cleanAcc) return true;
      }
    }

    return false;
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
