/**
 * clozeView.ts
 * Interactive Lined Notebook Page UI for the AssemblySim Cloze Testing Module.
 *
 * Implements:
 * - Authentic lined notebook paper layout with red margin line and spiral punch holes
 * - Week 1..7 pills filter & Sort order toggle (Sequential vs Randomized Exam)
 * - Concept search input
 * - Sequential 20-question batching with prominent "Kontrol Et" action buttons
 * - Instant green/red visual feedback on blanks with check/cross icons
 * - Slide citations and detailed correct answer cards
 * - Batch score badges (% and pass/fail indicator)
 * - Persistent progress via ClozeStorage
 */

import { CLOZE_QUESTIONS } from './clozeData.js';
import {
  ClozeQuestion,
  ClozeBlank,
  ClozeFilter,
  ClozeBatch,
  BatchResult,
  QuestionEvaluation
} from './clozeTypes.js';
import { ClozeStorage } from './clozeStorage.js';
import {
  evaluateBatch,
  filterAndSortQuestions,
  getBatches
} from './clozeEvaluator.js';

export interface ClozeViewCallbacks {
  onReturnToEditor?: () => void;
}

export class ClozeView {
  private container: HTMLElement;
  private callbacks: ClozeViewCallbacks;

  // Filter & Search State
  private currentFilter: ClozeFilter = {
    week: 'all',
    sortOrder: 'sequential'
  };
  private searchQuery: string = '';

  // Data & Batching
  private allQuestions: ClozeQuestion[] = [];
  private filteredQuestions: ClozeQuestion[] = [];
  private batches: ClozeBatch[] = [];

  // User State
  private userAnswers: Record<string, Record<string, string>> = {};
  private batchEvaluations: Map<number, BatchResult> = new Map();

  constructor(container: HTMLElement, callbacks: ClozeViewCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.allQuestions = [...CLOZE_QUESTIONS];

    // Restore user preferences
    const savedFilter = ClozeStorage.getFilterPreference();
    if (savedFilter) {
      this.currentFilter.week = savedFilter.week;
      this.currentFilter.sortOrder = savedFilter.sortOrder;
    }

    // Restore saved answers
    this.userAnswers = ClozeStorage.getAnswers();

    this.render();
  }

  // =========================================================================
  // PUBLIC CONTROLS
  // =========================================================================

  public render(): void {
    if (!this.container) return;

    // 1. Filter and sort questions
    this.applyFilteringAndBatching();

    // 2. Evaluate previously completed batches so feedback is restored
    this.restoreEvaluationsForSavedBatches();

    // 3. Render container DOM
    this.container.innerHTML = `
      <div class="cloze-root">
        <!-- Üst Kontrol Çubuğu (Topbar) -->
        <header class="cloze-topbar">
          <div class="cloze-topbar-left">
            <button class="btn-cloze-back" id="btn-cloze-return" title="Editöre Geri Dön">
              <span class="icon">❮</span>
              <span>Editör</span>
            </button>
            <div class="cloze-brand">
              <span class="cloze-brand-icon">📝</span>
              <div>
                <h3 class="cloze-brand-title">8086 Testler — Boşluk Doldurma Defteri</h3>
                <p class="cloze-brand-subtitle">Haftalık Slayt Cümleleri ve Sınav Soruları (20'şerli Değerlendirme)</p>
              </div>
            </div>
          </div>

          <div class="cloze-topbar-right">
            <div class="cloze-overall-stats" id="cloze-overall-stats">
              <!-- Rendered by updateOverallStats() -->
            </div>
            <button class="btn-cloze-reset" id="btn-cloze-reset" title="Tüm doldurulan cevapları ve test puanlarını sıfırla">
              ↺ Sıfırla
            </button>
          </div>
        </header>

        <!-- Filtre ve Arama Çubuğu (Filter Bar) -->
        <div class="cloze-filter-bar">
          <div class="cloze-filter-section-left">
            <div class="cloze-week-pills" role="tablist" aria-label="Hafta Seçimi">
              <button class="cloze-filter-pill ${this.currentFilter.week === 'all' ? 'active' : ''}" data-week="all">
                Tümü (${this.allQuestions.length})
              </button>
              ${[1, 2, 3, 4, 5, 6, 7].map(w => {
                const count = this.allQuestions.filter(q => q.week === w).length;
                return `
                  <button class="cloze-filter-pill ${this.currentFilter.week === w ? 'active' : ''}" data-week="${w}">
                    Week ${w} <span class="pill-count">(${count})</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="cloze-filter-section-right">
            <!-- Arama Kutusu -->
            <div class="cloze-search-box">
              <span class="search-icon">🔍</span>
              <input type="text"
                     id="cloze-search-input"
                     placeholder="Kavram, komut veya slayt ara..."
                     value="${this.escapeHtml(this.searchQuery)}"
                     autocomplete="off" />
              ${this.searchQuery ? '<button class="btn-clear-search" id="btn-clear-cloze-search">✕</button>' : ''}
            </div>

            <!-- Sıralama Seçimi (Sıralı vs Rastgele) -->
            <div class="cloze-sort-group">
              <button class="btn-sort-opt ${this.currentFilter.sortOrder === 'sequential' ? 'active' : ''}" data-sort="sequential" title="Konu ve slayt sırasına göre listele">
                Sıralı
              </button>
              <button class="btn-sort-opt ${this.currentFilter.sortOrder === 'random' ? 'active' : ''}" data-sort="random" title="Sınav modu: Karışık rastgele listele">
                Rastgele
              </button>
            </div>
          </div>
        </div>

        <!-- Defter Sayfası Görüntüleme Alanı -->
        <div class="cloze-notebook-container">
          <div class="cloze-notebook-viewport">
            <div class="cloze-notebook-page">
              <!-- Spiral Ciltleme Delikleri (Sol Kenar) -->
              <div class="cloze-spiral-binding" aria-hidden="true">
                ${Array.from({ length: 24 }).map(() => '<span class="spiral-hole"></span>').join('')}
              </div>

              <!-- Kırmızı Dikey Kenar Çizgisi (Defter Marjı) -->
              <div class="cloze-margin-line" aria-hidden="true"></div>

              <!-- Defter Sayfası İçeriği -->
              <div class="cloze-page-inner">
                <!-- Defter Başlık Kısmı -->
                <div class="cloze-notebook-header">
                  <div class="notebook-header-top">
                    <span class="notebook-course-tag">8086 MICROPROCESSORS & ASSEMBLY LANGUAGE</span>
                    <span class="notebook-date-tag">Ders Sınavı Hazırlık Defteri</span>
                  </div>
                  <h2 class="notebook-main-title">
                    ${this.getFilterHeaderTitle()}
                  </h2>
                  <div class="notebook-sub-info">
                    <span>Toplam ${this.filteredQuestions.length} soru</span>
                    <span>•</span>
                    <span>${this.batches.length} bölüm (her bölümde 20 soru)</span>
                    <span>•</span>
                    <span class="info-guide">Boşlukları doldurup her 20 soruda bir <strong>"Kontrol Et"</strong> butonuna basın.</span>
                  </div>
                </div>

                <!-- Soru Grupları (Her 20 Soruda Bir Kontrol Butonu) -->
                <div class="cloze-batches-wrapper" id="cloze-batches-wrapper">
                  ${this.renderBatchesHtml()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.updateOverallStats();
    this.bindEvents();
  }

  public setWeekFilter(week: number | 'all'): void {
    this.currentFilter.week = week;
    ClozeStorage.saveFilterPreference(this.currentFilter.week, this.currentFilter.sortOrder);
    this.render();
  }

  public setSortOrder(order: 'sequential' | 'random'): void {
    this.currentFilter.sortOrder = order;
    if (order === 'random') {
      this.currentFilter.shuffleSeed = Math.floor(Math.random() * 1000000) + 1;
    } else {
      delete this.currentFilter.shuffleSeed;
    }
    ClozeStorage.saveFilterPreference(this.currentFilter.week, this.currentFilter.sortOrder);
    this.render();
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.render();
  }

  public resetAll(): void {
    ClozeStorage.resetProgress();
    this.userAnswers = {};
    this.batchEvaluations.clear();
    this.render();
  }

  public setAnswer(questionId: string, blankId: string, value: string): void {
    if (!this.userAnswers[questionId]) {
      this.userAnswers[questionId] = {};
    }
    this.userAnswers[questionId][blankId] = value;
    ClozeStorage.saveAnswer(questionId, blankId, value);
    const inputEl = this.container.querySelector(
      `input[data-qid="${questionId}"][data-bid="${blankId}"]`
    ) as HTMLInputElement | null;
    if (inputEl) {
      inputEl.value = value;
    }
  }

  public checkBatch(batchIndex: number): BatchResult | null {
    const batch = this.batches.find(b => b.batchIndex === batchIndex);
    if (!batch) return null;

    // Refresh userAnswers from storage in case answers were updated externally
    const storedAnswers = ClozeStorage.getAnswers();
    for (const [qid, blanks] of Object.entries(storedAnswers)) {
      if (!this.userAnswers[qid]) this.userAnswers[qid] = {};
      Object.assign(this.userAnswers[qid], blanks);
    }

    // 1. Gather all current answers for this batch from the DOM or state
    this.flushBatchInputsFromDom(batch);

    // 2. Evaluate with pure evaluator
    const result = evaluateBatch(batch.questions, this.userAnswers, batchIndex);
    this.batchEvaluations.set(batchIndex, result);

    // 3. Persist score to ClozeStorage
    ClozeStorage.saveBatchScore(batchIndex, result.correctQuestions, result.totalQuestions);

    // 4. Update the batch DOM directly without losing scroll position
    this.updateBatchDom(batchIndex, result);

    // 5. Update topbar stats
    this.updateOverallStats();

    return result;
  }

  public getBatches(): ClozeBatch[] {
    return this.batches;
  }

  public getFilteredQuestions(): ClozeQuestion[] {
    return this.filteredQuestions;
  }

  public getBatchEvaluation(batchIndex: number): BatchResult | undefined {
    return this.batchEvaluations.get(batchIndex);
  }

  // =========================================================================
  // INTERNAL LOGIC & RENDERING
  // =========================================================================

  private applyFilteringAndBatching(): void {
    // 1. Apply week filter & sort order
    let list = filterAndSortQuestions(this.allQuestions, this.currentFilter);

    // 2. Apply search query if present
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(item => {
        return (
          item.sourceSentence.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q) ||
          item.weekTitle.toLowerCase().includes(q) ||
          item.explanation.toLowerCase().includes(q) ||
          item.blanks.some(b =>
            b.targetAnswer.toLowerCase().includes(q) ||
            b.acceptedAnswers.some(a => a.toLowerCase().includes(q))
          )
        );
      });
    }

    this.filteredQuestions = list;
    this.batches = getBatches(this.filteredQuestions, 20);
  }

  private restoreEvaluationsForSavedBatches(): void {
    const savedScores = ClozeStorage.getBatchScores();
    for (const batch of this.batches) {
      if (savedScores[batch.batchIndex] !== undefined) {
        // If batch was already scored, evaluate it with current saved answers
        const evalRes = evaluateBatch(batch.questions, this.userAnswers, batch.batchIndex);
        this.batchEvaluations.set(batch.batchIndex, evalRes);
      }
    }
  }

  private getFilterHeaderTitle(): string {
    if (this.currentFilter.week === 'all') {
      return 'Tüm Haftalar (Week 1–7) Kapsamlı Soru Bankası';
    }
    const sample = this.allQuestions.find(q => q.week === this.currentFilter.week);
    return sample ? `${sample.weekTitle}` : `Week ${this.currentFilter.week}`;
  }

  private renderBatchesHtml(): string {
    if (this.batches.length === 0) {
      return `
        <div class="cloze-empty-state">
          <span class="empty-icon">🔍</span>
          <h4>Eşleşen soru bulunamadı</h4>
          <p>Arama filtrenizi temizleyerek veya farklı bir hafta seçerek tekrar deneyin.</p>
        </div>
      `;
    }

    return this.batches.map(batch => this.renderBatchSectionHtml(batch)).join('');
  }

  private renderBatchSectionHtml(batch: ClozeBatch): string {
    const evaluation = this.batchEvaluations.get(batch.batchIndex);
    const scoreBadgeHtml = this.renderBatchScoreBadgeHtml(batch.batchIndex, evaluation);

    return `
      <section class="cloze-batch-section" id="batch-section-${batch.batchIndex}" data-batch-index="${batch.batchIndex}">
        <!-- Bölüm Başlığı -->
        <div class="cloze-batch-header">
          <div class="cloze-batch-title-wrap">
            <span class="batch-num-badge">Bölüm ${batch.batchIndex + 1}</span>
            <h3 class="batch-title">Sorular ${batch.startIndex + 1} – ${batch.endIndex}</h3>
            <span class="batch-count-tag">${batch.questions.length} Soru</span>
          </div>
          <div class="cloze-batch-header-score" id="batch-header-score-${batch.batchIndex}">
            ${scoreBadgeHtml}
          </div>
        </div>

        <!-- 20 Soru Listesi -->
        <div class="cloze-batch-questions" id="batch-questions-${batch.batchIndex}">
          ${batch.questions.map((q, idx) => {
            const globalNumber = batch.startIndex + idx + 1;
            const qEval = evaluation?.details[q.id];
            return this.renderQuestionHtml(q, globalNumber, qEval);
          }).join('')}
        </div>

        <!-- 20-Soruluk Denetim Barı ("Kontrol Et" Butonu) -->
        <div class="cloze-batch-control-bar" id="batch-control-bar-${batch.batchIndex}">
          <div class="batch-bar-left">
            <button class="btn-cloze-check-batch" id="btn-check-batch-${batch.batchIndex}" data-batch-index="${batch.batchIndex}" title="Bu gruptaki soruların cevaplarını kontrol et">
              <span class="check-icon">✓</span>
              <span>Kontrol Et (${batch.startIndex + 1} - ${batch.endIndex})</span>
            </button>
            <span class="batch-bar-hint">Öğrenci cevaplarını slayt anahtarlarıyla karşılaştırır ve doğru/yanlış geri bildirimini sunar.</span>
          </div>

          <div class="batch-bar-right" id="batch-footer-score-${batch.batchIndex}">
            ${scoreBadgeHtml}
          </div>
        </div>
      </section>
    `;
  }

  private renderQuestionHtml(
    q: ClozeQuestion,
    globalNumber: number,
    qEval?: QuestionEvaluation
  ): string {
    const qAnswers = this.userAnswers[q.id] || {};

    // Process template placeholders (e.g. {{b1}}, {{b2}})
    let sentenceHtml = this.escapeHtml(q.template);

    for (const blank of q.blanks) {
      const placeholder = `{{${blank.id}}}`;
      const userVal = qAnswers[blank.id] || '';
      const bEval = qEval?.blankEvaluations[blank.id];

      let statusClass = '';
      let badgeHtml = '';

      if (bEval) {
        if (bEval.isCorrect) {
          statusClass = 'cloze-blank-correct';
          badgeHtml = '<span class="blank-status-badge correct" title="Doğru!">✓</span>';
        } else {
          statusClass = 'cloze-blank-incorrect';
          badgeHtml = '<span class="blank-status-badge incorrect" title="Yanlış!">✗</span>';
        }
      }

      const inputWidth = Math.max(blank.targetAnswer.length + 3, 8);

      const inputHtml = `
        <span class="cloze-blank-wrapper">
          <input type="text"
                 class="cloze-blank-input ${statusClass}"
                 data-qid="${q.id}"
                 data-bid="${blank.id}"
                 value="${this.escapeHtml(userVal)}"
                 placeholder=""
                 style="width: ${inputWidth}ch;"
                 spellcheck="false"
                 autocomplete="off" />
          ${badgeHtml}
        </span>
      `;

      // Replace placeholder in template safely
      sentenceHtml = sentenceHtml.split(placeholder).join(inputHtml);
    }

    // Render slide citation & answer card if evaluated
    const answerCardHtml = qEval ? this.renderAnswerCardHtml(q, qEval) : '';

    return `
      <div class="cloze-question-item ${qEval ? (qEval.isCorrect ? 'item-correct' : 'item-incorrect') : ''}"
           id="cloze-q-${q.id}"
           data-question-id="${q.id}">
        <!-- Soru Üst Bilgisi (Meta) -->
        <div class="cloze-q-meta">
          <span class="q-num-pill">#${globalNumber}</span>
          <span class="q-week-pill">Week ${q.week} • Slayt ${q.slideNumber}</span>
          <span class="q-topic-pill" title="${this.escapeHtml(q.topic)}">${this.escapeHtml(q.topic)}</span>
        </div>

        <!-- Cümle ve Boşluk Doldurma Girişleri -->
        <div class="cloze-q-sentence">
          ${sentenceHtml}
        </div>

        <!-- Cevap ve Slayt Referans Kartı (Değerlendirme Sonrası) -->
        <div class="cloze-q-card-slot" id="card-slot-${q.id}">
          ${answerCardHtml}
        </div>
      </div>
    `;
  }

  private renderAnswerCardHtml(q: ClozeQuestion, qEval: QuestionEvaluation): string {
    const isSuccess = qEval.isCorrect;

    return `
      <div class="cloze-answer-card ${isSuccess ? 'card-success' : 'card-failure'}">
        <div class="answer-card-header">
          <span class="card-status-indicator">
            ${isSuccess ? '✓ Doğru Cevap' : '✗ Yanlış / Eksik Cevap'}
          </span>
          <span class="card-slide-citation">
            📖 <strong>Slayt Referansı:</strong> Week ${q.week} (${this.escapeHtml(q.weekTitle)}), Slayt ${q.slideNumber}
          </span>
        </div>

        <div class="answer-card-body">
          <div class="answer-card-targets">
            ${q.blanks.map(blank => {
              const bEval = qEval.blankEvaluations[blank.id];
              const isBok = bEval?.isCorrect;
              const otherAlts = blank.acceptedAnswers.filter(a => a.toLowerCase() !== blank.targetAnswer.toLowerCase());

              return `
                <div class="target-row">
                  <span class="target-label">Doğru Cevap:</span>
                  <strong class="target-val-badge ${isBok ? 'badge-ok' : 'badge-err'}">${this.escapeHtml(blank.targetAnswer)}</strong>
                  ${otherAlts.length > 0 ? `
                    <span class="target-alts">(Kabul edilen alternatifler: ${otherAlts.map(a => this.escapeHtml(a)).join(', ')})</span>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="answer-card-explanation">
            <strong>Açıklama:</strong> ${this.escapeHtml(q.explanation)}
          </div>

          <div class="answer-card-source">
            <strong>Slayttaki Orijinal Cümle:</strong> <em>"${this.escapeHtml(q.sourceSentence)}"</em>
          </div>
        </div>
      </div>
    `;
  }

  private renderBatchScoreBadgeHtml(batchIndex: number, evaluation?: BatchResult): string {
    if (!evaluation) {
      return `
        <span class="batch-score-badge badge-pending">
          Henüz denetlenmedi
        </span>
      `;
    }

    const { correctQuestions, totalQuestions, percent, isPassing } = evaluation;

    return `
      <div class="batch-score-badge ${isPassing ? 'badge-pass' : 'badge-fail'}" title="${correctQuestions}/${totalQuestions} Soru Doğru">
        <span class="score-icon">${isPassing ? '✓' : '✗'}</span>
        <strong class="score-text">${correctQuestions} / ${totalQuestions} Doğru</strong>
        <span class="score-percent">(%${percent})</span>
        <span class="score-label">${isPassing ? 'BAŞARILI' : 'TEKRAR DENEYİN'}</span>
      </div>
    `;
  }

  private updateBatchDom(batchIndex: number, result: BatchResult): void {
    const batch = this.batches.find(b => b.batchIndex === batchIndex);
    if (!batch) return;

    // 1. Update questions inside this batch
    for (const q of batch.questions) {
      const qItemEl = this.container.querySelector(`#cloze-q-${q.id}`) as HTMLElement | null;
      const qEval = result.details[q.id];
      if (!qItemEl || !qEval) continue;

      // Update item border status
      qItemEl.classList.remove('item-correct', 'item-incorrect');
      qItemEl.classList.add(qEval.isCorrect ? 'item-correct' : 'item-incorrect');

      // Update blank inputs
      for (const blank of q.blanks) {
        const inputEl = qItemEl.querySelector(`input[data-bid="${blank.id}"]`) as HTMLInputElement | null;
        const bEval = qEval.blankEvaluations[blank.id];
        if (inputEl && bEval) {
          inputEl.classList.remove('cloze-blank-correct', 'cloze-blank-incorrect');
          inputEl.classList.add(bEval.isCorrect ? 'cloze-blank-correct' : 'cloze-blank-incorrect');

          // Update badge icon
          const wrapper = inputEl.closest('.cloze-blank-wrapper');
          if (wrapper) {
            let badgeEl = wrapper.querySelector('.blank-status-badge');
            if (!badgeEl) {
              badgeEl = document.createElement('span');
              wrapper.appendChild(badgeEl);
            }
            badgeEl.className = `blank-status-badge ${bEval.isCorrect ? 'correct' : 'incorrect'}`;
            badgeEl.textContent = bEval.isCorrect ? '✓' : '✗';
            badgeEl.setAttribute('title', bEval.isCorrect ? 'Doğru!' : 'Yanlış!');
          }
        }
      }

      // Update answer card slot
      const cardSlot = qItemEl.querySelector(`#card-slot-${q.id}`);
      if (cardSlot) {
        cardSlot.innerHTML = this.renderAnswerCardHtml(q, qEval);
      }
    }

    // 2. Update batch score badges (header and footer)
    const scoreBadgeHtml = this.renderBatchScoreBadgeHtml(batchIndex, result);
    const headerScoreEl = this.container.querySelector(`#batch-header-score-${batchIndex}`);
    if (headerScoreEl) headerScoreEl.innerHTML = scoreBadgeHtml;

    const footerScoreEl = this.container.querySelector(`#batch-footer-score-${batchIndex}`);
    if (footerScoreEl) footerScoreEl.innerHTML = scoreBadgeHtml;
  }

  private updateOverallStats(): void {
    const statsEl = this.container.querySelector('#cloze-overall-stats');
    if (!statsEl) return;

    let totalQuestionsGraded = 0;
    let totalCorrectQuestions = 0;

    for (const res of this.batchEvaluations.values()) {
      totalQuestionsGraded += res.totalQuestions;
      totalCorrectQuestions += res.correctQuestions;
    }

    const totalQuestions = this.allQuestions.length;
    const overallPercent = totalQuestionsGraded > 0
      ? Math.round((totalCorrectQuestions / totalQuestionsGraded) * 100)
      : 0;

    statsEl.innerHTML = `
      <div class="overall-stats-pill" title="Tüm bölümlerdeki genel başarı puanı">
        <span class="stats-label">Sınav Puanı:</span>
        <strong class="stats-val ${overallPercent >= 70 ? 'score-good' : ''}">%${overallPercent}</strong>
        <span class="stats-detail">(${totalCorrectQuestions}/${totalQuestionsGraded} Soru)</span>
      </div>
    `;
  }

  private flushBatchInputsFromDom(batch: ClozeBatch): void {
    for (const q of batch.questions) {
      if (!this.userAnswers[q.id]) {
        this.userAnswers[q.id] = {};
      }
      for (const blank of q.blanks) {
        const inputEl = this.container.querySelector(
          `input[data-qid="${q.id}"][data-bid="${blank.id}"]`
        ) as HTMLInputElement | null;
        if (inputEl && inputEl.value !== undefined && inputEl.value !== '') {
          const val = inputEl.value;
          this.userAnswers[q.id][blank.id] = val;
          ClozeStorage.saveAnswer(q.id, blank.id, val);
        } else if (!this.userAnswers[q.id][blank.id]) {
          const stored = ClozeStorage.getAnswer(q.id, blank.id);
          if (stored) {
            this.userAnswers[q.id][blank.id] = stored;
          }
        }
      }
    }
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================

  private bindEvents(): void {
    // 1. Return to editor
    const returnBtn = this.container.querySelector('#btn-cloze-return');
    returnBtn?.addEventListener('click', () => {
      this.callbacks.onReturnToEditor?.();
    });

    // 2. Reset progress
    const resetBtn = this.container.querySelector('#btn-cloze-reset');
    resetBtn?.addEventListener('click', () => {
      const ok = typeof window !== 'undefined' && window.confirm
        ? window.confirm('Tüm test cevaplarınızı ve puanlarınızı sıfırlamak istediğinize emin misiniz?')
        : true;
      if (ok) {
        this.resetAll();
      }
    });

    // 3. Week filter pills
    const pills = this.container.querySelectorAll('.cloze-filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const rawWeek = pill.getAttribute('data-week');
        if (rawWeek === 'all') {
          this.setWeekFilter('all');
        } else if (rawWeek) {
          const w = parseInt(rawWeek, 10);
          if (!isNaN(w)) this.setWeekFilter(w);
        }
      });
    });

    // 4. Sort mode switches
    const sortBtns = this.container.querySelectorAll('.btn-sort-opt');
    sortBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-sort') as 'sequential' | 'random';
        if (mode) this.setSortOrder(mode);
      });
    });

    // 5. Search input
    const searchInput = this.container.querySelector('#cloze-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value;
      this.applyFilteringAndBatching();
      const batchesWrapper = this.container.querySelector('#cloze-batches-wrapper');
      if (batchesWrapper) {
        batchesWrapper.innerHTML = this.renderBatchesHtml();
        this.bindBatchCheckButtons();
        this.bindInputEvents();
      }
    });

    const clearSearchBtn = this.container.querySelector('#btn-clear-cloze-search');
    clearSearchBtn?.addEventListener('click', () => {
      this.setSearchQuery('');
    });

    // 6. Batch Check buttons & Blank Input events
    this.bindBatchCheckButtons();
    this.bindInputEvents();
  }

  private bindBatchCheckButtons(): void {
    const checkBtns = this.container.querySelectorAll('.btn-cloze-check-batch');
    checkBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const batchIdxStr = btn.getAttribute('data-batch-index');
        if (batchIdxStr !== null) {
          const batchIdx = parseInt(batchIdxStr, 10);
          if (!isNaN(batchIdx)) {
            this.checkBatch(batchIdx);
          }
        }
      });
    });
  }

  private bindInputEvents(): void {
    const inputs = this.container.querySelectorAll<HTMLInputElement>('.cloze-blank-input');
    inputs.forEach((input, index) => {
      // Autosave on input
      input.addEventListener('input', () => {
        const qid = input.getAttribute('data-qid');
        const bid = input.getAttribute('data-bid');
        if (qid && bid) {
          if (!this.userAnswers[qid]) {
            this.userAnswers[qid] = {};
          }
          this.userAnswers[qid][bid] = input.value;
          ClozeStorage.saveAnswer(qid, bid, input.value);
        }
      });

      // Enter key advances to next blank or batch check
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextInput = inputs[index + 1];
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          } else {
            // Find closest batch button and trigger check
            const batchSection = input.closest('.cloze-batch-section');
            const checkBtn = batchSection?.querySelector('.btn-cloze-check-batch') as HTMLButtonElement | null;
            checkBtn?.click();
          }
        }
      });
    });
  }

  private escapeHtml(str: string | null | undefined): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
