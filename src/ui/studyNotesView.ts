/**
 * studyNotesView.ts
 * 
 * Öğrenme & Referans Merkezi bünyesinde 5. Ana Bölüm:
 * "📝 5. Çalışma Notları & Vize Hazırlık"
 * 
 * Doç. Dr. Mehmet Akif Çifci'nin ders slaytları, PDF'leri, tahta notları
 * ve geçmiş yıl sınav sorularına dayalı, hiçbir ayrıntı atlanmadan hazırlanan
 * interaktif çalışma ve sınav simülatörü görünümü.
 */

import { ALL_WEEKS_STUDY_NOTES, INSTRUCTION_FLAG_MATRIX, WeekStudyNote } from './studyNotesData.js';
import { MIDTERM_EXAM_QUESTIONS, MidtermQuestion } from './midtermExamData.js';

export interface StudyNotesCallbacks {
  onOpenInMainEditor?: (title: string, code: string) => void;
  onNavigateToLecture?: (milestoneId: string) => void;
}

export type StudyNotesSubTab = 'notes' | 'flags' | 'exam' | 'cheatsheet';

export class StudyNotesView {
  private container: HTMLElement;
  private callbacks?: StudyNotesCallbacks;
  private activeSubTab: StudyNotesSubTab = 'exam';
  private selectedWeek: number = 0; // 0 = all
  private selectedCategory: string = 'all'; // for exam questions
  private userInputs: Record<string, Record<string, string>> = {}; // qId -> field -> value
  private gradedQuestions: Record<string, {
    score: number;
    total: number;
    fieldFeedback: Record<string, { passed: boolean; message: string }>;
    revealed: boolean;
  }> = {};

  constructor(container: HTMLElement, callbacks?: StudyNotesCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }

  render(): void {
    this.container.innerHTML = `
      <div class="studynotes-view-container">
        <!-- Sub-navigation Bar -->
        <div class="studynotes-subnav-bar">
          <button class="btn-sn-subnav ${this.activeSubTab === 'exam' ? 'active' : ''}" data-subtab="exam">
            🎯 1. Vize Sınavı Çalışma Soruları & Kod Tahmin Simülatörü
          </button>
          <button class="btn-sn-subnav ${this.activeSubTab === 'flags' ? 'active' : ''}" data-subtab="flags">
            🚩 2. Bayraklar (Flags) & Komut Etkisi Başucu Rehberi
          </button>
          <button class="btn-sn-subnav ${this.activeSubTab === 'notes' ? 'active' : ''}" data-subtab="notes">
            📚 3. Hafta Hafta Eksiksiz Ders Notları (1–15)
          </button>
          <button class="btn-sn-subnav ${this.activeSubTab === 'cheatsheet' ? 'active' : ''}" data-subtab="cheatsheet">
            📋 4. Sınav Öncesi Formül & Altın Kurallar (Cheat Sheet)
          </button>
        </div>

        <!-- Content Mount according to active subtab -->
        <div class="studynotes-content-area">
          ${this.renderSubTabContent()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private renderSubTabContent(): string {
    switch (this.activeSubTab) {
      case 'exam':
        return this.renderExamWorkbench();
      case 'flags':
        return this.renderFlagsGuide();
      case 'notes':
        return this.renderWeekNotes();
      case 'cheatsheet':
        return this.renderCheatSheet();
      default:
        return '';
    }
  }

  // =========================================================================
  // SUBTAB 1: Vize Sınavı Çalışma Soruları & Kod Tahmin Simülatörü
  // =========================================================================
  private renderExamWorkbench(): string {
    const totalPoints = MIDTERM_EXAM_QUESTIONS.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = Object.values(this.gradedQuestions).reduce((sum, g) => sum + g.score, 0);
    const gradedCount = Object.keys(this.gradedQuestions).length;

    const filteredQuestions = this.selectedCategory === 'all'
      ? MIDTERM_EXAM_QUESTIONS
      : MIDTERM_EXAM_QUESTIONS.filter(q => q.category === this.selectedCategory);

    return `
      <div class="exam-workbench-wrapper">
        <!-- Strict Professor Warning Banner -->
        <div class="exam-hero-card">
          <div class="exam-badge-row">
            <span class="exam-hero-pill">⚠️ DOÇ. DR. MEHMET AKİF ÇİFCİ VİZE STANDARDI</span>
            <span class="exam-strict-tag">Sıkı Puanlama Modu Açık</span>
          </div>
          <h2 class="exam-hero-title">7. Hafta Sonrası Vize Çalışma Soruları & Kod Tahmin Simülatörü</h2>
          <p class="exam-hero-desc">
            Bu bölüm; hocanın ders slaytları, laboratuvar kodları (<code>MicroProcessor code examples week.pdf</code>),
            tahta notları (Week 6 Excalidraw) ve klasik sınav tuzakları taranarak hazırlanmıştır.
            Koda bakarak register, flag ve bellek durumlarını tahmin ediniz.
          </p>

          <div class="exam-score-tracker-bar">
            <div class="tracker-item">
              <span class="tracker-label">Çözülen Soru:</span>
              <span class="tracker-val">${gradedCount} / ${MIDTERM_EXAM_QUESTIONS.length}</span>
            </div>
            <div class="tracker-item">
              <span class="tracker-label">Kazanılan Puan:</span>
              <span class="tracker-val score-highlight">${earnedPoints} / ${totalPoints} Puan</span>
            </div>
            <div class="tracker-item">
              <span class="tracker-label">Başarı Oranı:</span>
              <span class="tracker-val">${totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        <!-- Filter Categories -->
        <div class="exam-categories-toolbar">
          <span class="toolbar-label">Filtrele:</span>
          <button class="btn-exam-filter ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">Tüm Sorular (${MIDTERM_EXAM_QUESTIONS.length})</button>
          <button class="btn-exam-filter ${this.selectedCategory === 'flags' ? 'active' : ''}" data-cat="flags">🚩 Bayrak Türetimi</button>
          <button class="btn-exam-filter ${this.selectedCategory === 'trace' ? 'active' : ''}" data-cat="trace">🔄 Döngü & Yığın İzleme</button>
          <button class="btn-exam-filter ${this.selectedCategory === 'traps' ? 'active' : ''}" data-cat="traps">⚡ Sınav Tuzakları</button>
          <button class="btn-exam-filter ${this.selectedCategory === 'coding' ? 'active' : ''}" data-cat="coding">💻 Klasik Kodlama</button>
        </div>

        <!-- Questions List -->
        <div class="exam-questions-list">
          ${filteredQuestions.map(q => this.renderExamQuestionCard(q)).join('')}
        </div>
      </div>
    `;
  }

  private renderExamQuestionCard(q: MidtermQuestion): string {
    const graded = this.gradedQuestions[q.id];
    const isGraded = !!graded;
    const isPassed = graded && graded.score === q.points;

    return `
      <div class="exam-question-card ${isGraded ? (isPassed ? 'status-passed' : 'status-failed') : ''}" data-q-id="${q.id}">
        <div class="eq-header">
          <div class="eq-meta-row">
            <span class="eq-cat-badge">${q.categoryLabel}</span>
            <span class="eq-diff-badge ${q.difficulty}">${q.difficulty.toUpperCase()}</span>
            <span class="eq-points-badge">${q.points} Puan</span>
          </div>
          ${isGraded ? `
            <div class="eq-result-badge ${isPassed ? 'passed' : 'failed'}">
              ${isPassed ? '✅ TAM PUAN:' : '⚠️ PUAN:'} ${graded.score} / ${q.points}
            </div>
          ` : `
            <span class="eq-status-pending">Henüz Puanlanmadı</span>
          `}
        </div>

        <h3 class="eq-title">${q.title}</h3>
        <p class="eq-scenario">${q.scenario}</p>

        <!-- Code Snippet -->
        <div class="eq-code-box">
          <div class="eq-code-topbar">
            <span>8086 Assembly Kodu</span>
            <button class="btn-eq-run-sim" data-q-id="${q.id}">🚀 Simülatörde Canlı Çalıştır</button>
          </div>
          <pre class="eq-code-content"><code>${this.escapeHtml(q.codeSnippet)}</code></pre>
        </div>

        <!-- Inputs Area -->
        <div class="eq-inputs-area">
          ${q.expectedRegisters.length > 0 ? `
            <div class="eq-input-group">
              <label class="eq-group-title">📊 Yazmaç (Register) Tahmini (Hex):</label>
              <div class="eq-fields-row">
                ${q.expectedRegisters.map(r => {
                  const val = this.getUserInput(q.id, `reg_${r.name}`);
                  const feedback = graded?.fieldFeedback[`reg_${r.name}`];
                  return `
                    <div class="eq-field-box ${feedback ? (feedback.passed ? 'valid' : 'invalid') : ''}">
                      <span class="field-name"><code>${r.name}</code> =</span>
                      <input type="text" class="eq-text-in" data-q-id="${q.id}" data-field="reg_${r.name}" value="${this.escapeHtml(val)}" placeholder="${r.expected}" autocomplete="off" spellcheck="false" />
                      ${feedback ? `<span class="feedback-icon">${feedback.passed ? '✓' : '✗'}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          ${q.expectedFlags.length > 0 ? `
            <div class="eq-input-group">
              <label class="eq-group-title">🚩 Durum Bayrakları (Flags: 0 veya 1):</label>
              <div class="eq-flags-row">
                ${q.expectedFlags.map(f => {
                  const val = this.getUserInput(q.id, `flag_${f.name}`);
                  const feedback = graded?.fieldFeedback[`flag_${f.name}`];
                  return `
                    <div class="eq-flag-box ${feedback ? (feedback.passed ? 'valid' : 'invalid') : ''}">
                      <span class="flag-name"><code>${f.name}</code>:</span>
                      <div class="eq-flag-toggle-wrap" data-q-id="${q.id}" data-field="flag_${f.name}">
                        <button type="button" class="btn-eq-flag ${val === '0' ? 'selected' : ''}" data-val="0">0</button>
                        <button type="button" class="btn-eq-flag ${val === '1' ? 'selected' : ''}" data-val="1">1</button>
                      </div>
                      ${feedback ? `<span class="feedback-icon">${feedback.passed ? '✓' : '✗'}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          ${q.expectedMemory && q.expectedMemory.length > 0 ? `
            <div class="eq-input-group">
              <label class="eq-group-title">💾 Bellek / Yığın Bayt Tahmini:</label>
              <div class="eq-fields-row">
                ${q.expectedMemory.map(m => {
                  const val = this.getUserInput(q.id, `mem_${m.address}`);
                  const feedback = graded?.fieldFeedback[`mem_${m.address}`];
                  return `
                    <div class="eq-field-box ${feedback ? (feedback.passed ? 'valid' : 'invalid') : ''}">
                      <span class="field-name"><code>${m.address}</code> =</span>
                      <input type="text" class="eq-text-in" data-q-id="${q.id}" data-field="mem_${m.address}" value="${this.escapeHtml(val)}" placeholder="${m.expected}" autocomplete="off" spellcheck="false" />
                      ${feedback ? `<span class="feedback-icon">${feedback.passed ? '✓' : '✗'}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Action Bar -->
        <div class="eq-actions-bar">
          <button class="btn-eq-submit primary" data-q-id="${q.id}">
            ✅ Sınav Cevabını Doğrula & Puanla
          </button>
          ${isGraded ? `
            <button class="btn-eq-toggle-rubric secondary" data-q-id="${q.id}">
              ${graded.revealed ? '🔼 Çözüm Anahtarını Gizle' : '👨‍🏫 Hocanın Puanlama Kriterlerini ve Çözümünü Göster'}
            </button>
          ` : ''}
        </div>

        <!-- Strict Grading Rubric (Teacher's Solution) -->
        ${isGraded && graded.revealed ? `
          <div class="eq-rubric-box">
            <h5 class="rubric-title">👨‍🏫 Hocanın Sınav Çözüm Anahtarı ve Puan Kırma Kriterleri:</h5>
            <div class="rubric-content">
              ${q.expectedRegisters.map(r => `
                <div class="rubric-item">
                  <strong>• ${r.name}:</strong> Doğru Değer <code>${r.expected}</code> — ${r.note}
                </div>
              `).join('')}

              ${q.expectedFlags.map(f => `
                <div class="rubric-item">
                  <strong>• ${f.name} Bayrağı:</strong> Doğru Değer <code>${f.expected}</code> — ${f.reason}
                </div>
              `).join('')}

              ${q.expectedMemory ? q.expectedMemory.map(m => `
                <div class="rubric-item">
                  <strong>• ${m.address}:</strong> Doğru Değer <code>${m.expected}</code> — ${m.note}
                </div>
              `).join('') : ''}
            </div>

            <div class="rubric-strict-note">
              📋 <strong>Hocanın Puan Dağılımı ve Uyarıları:</strong><br>
              ${q.hocaRubric}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // =========================================================================
  // SUBTAB 2: Bayraklar (Flags) & Komut Etkisi Başucu Rehberi
  // =========================================================================
  private renderFlagsGuide(): string {
    return `
      <div class="flags-guide-wrapper">
        <div class="flags-hero-card">
          <span class="exam-hero-pill">7. HAFTA ÖNCESİ ÖZEL BAŞUCU REHBERİ</span>
          <h2 class="exam-hero-title">8086 Bayraklar (Flags) & Komut Etkisi Tam Kılavuzu</h2>
          <p class="exam-hero-desc">
            Vize sınavında puan kayıplarının %70'i bayrakların donanımsal olarak nasıl kurulduğunu
            ve hangi komutun hangi bayrağı değiştirdiğini bilmemekten kaynaklanır.
            Aşağıdaki tablolar ve formüllerle bayrak matematiğini eksiksiz öğrenin.
          </p>
        </div>

        <!-- FLAGS Register Bit Layout -->
        <div class="theory-card" style="border-left: 4px solid #6366f1;">
          <h4 class="theory-card-title">🗺️ 16-Bit FLAGS Yazmacı Bit Yerleşimi (Hardware Layout)</h4>
          <p class="theory-card-desc">8086 mikroişlemcisinde 16-bitlik FLAGS yazmacının bit dağılımı:</p>
          <div class="table-responsive" style="margin-top: 10px;">
            <table class="theory-table" style="text-align: center; font-size: 11px;">
              <thead>
                <tr>
                  <th>Bit 15</th><th>14</th><th>13</th><th>12</th>
                  <th>11</th><th>10</th><th>9</th><th>8</th>
                  <th>7</th><th>6</th><th>5</th><th>4</th>
                  <th>3</th><th>2</th><th>1</th><th>0</th>
                </tr>
              </thead>
              <tbody>
                <tr style="font-weight: 700;">
                  <td style="color:#94a3b8;">X</td>
                  <td style="background:#fef3c7; color:#b45309;">NT</td>
                  <td style="background:#fef3c7; color:#b45309;">IOPL</td>
                  <td style="background:#fef3c7; color:#b45309;">IOPL</td>
                  <td style="background:#fee2e2; color:#b91c1c;">OF</td>
                  <td style="background:#e0e7ff; color:#4338ca;">DF</td>
                  <td style="background:#e0e7ff; color:#4338ca;">IF</td>
                  <td style="background:#e0e7ff; color:#4338ca;">TF</td>
                  <td style="background:#fee2e2; color:#b91c1c;">SF</td>
                  <td style="background:#fee2e2; color:#b91c1c;">ZF</td>
                  <td style="color:#94a3b8;">X</td>
                  <td style="background:#fee2e2; color:#b91c1c;">AF</td>
                  <td style="color:#94a3b8;">X</td>
                  <td style="background:#fee2e2; color:#b91c1c;">PF</td>
                  <td style="color:#94a3b8;">1</td>
                  <td style="background:#fee2e2; color:#b91c1c;">CF</td>
                </tr>
                <tr style="font-size: 10px; color: #475569;">
                  <td>Ayrılmış</td><td>İç İçe Görev</td><td colspan="2">I/O Yetki</td><td>Taşma</td><td>Yön</td><td>Kesme</td><td>Adım</td><td>İşaret</td><td>Sıfır</td><td>Ayrılmış</td><td>Yardımcı</td><td>Ayrılmış</td><td>Eşlik</td><td>Sabit</td><td>Elde</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="docs-var-note" style="margin-top: 8px; font-size: 11px;">
            🔴 Kırmızı: <b>6 Durum Bayrağı</b> (ALU kurar: CF, PF, AF, ZF, SF, OF) • 🔵 Mavi: <b>3 Kontrol Bayrağı</b> (DF, IF, TF) • 🟡 Sarı: <b>Sistem Bayrakları</b> (IOPL, NT, 286+).
          </div>
        </div>

        <!-- Master Instruction-to-Flags Matrix Table -->
        <div class="theory-card" style="margin-top: 20px;">
          <h4 class="theory-card-title">📊 8086 Komutlarının Bayraklar Üzerindeki Etki Matrisi</h4>
          <p class="theory-card-desc">Sınavda ezbere bilmeniz gereken tam bayrak değişim tablosu:</p>
          <div class="table-responsive" style="margin-top: 10px;">
            <table class="theory-table">
              <thead>
                <tr>
                  <th style="width: 20%;">Komut(lar)</th>
                  <th style="width: 12%;">Kategori</th>
                  <th>CF</th><th>ZF</th><th>SF</th><th>OF</th><th>PF</th><th>AF</th>
                  <th style="width: 32%;">Hocanın Altın Açıklaması</th>
                </tr>
              </thead>
              <tbody>
                ${INSTRUCTION_FLAG_MATRIX.map(row => `
                  <tr>
                    <td><code>${row.instruction}</code></td>
                    <td><small>${row.category}</small></td>
                    <td><b>${row.cf}</b></td>
                    <td>${row.zf}</td>
                    <td>${row.sf}</td>
                    <td>${row.of}</td>
                    <td>${row.pf}</td>
                    <td>${row.af}</td>
                    <td style="font-size: 11.5px; line-height: 1.4;">${row.ruleExplanation}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mathematical Flag Derivations (Carry vs Overflow, SUB 3-step) -->
        <div class="theory-grid-2col" style="margin-top: 20px;">
          <div class="theory-card">
            <h4 class="theory-card-title">⚖️ İşaretsiz (CF/ZF) vs İşaretli (OF/SF) Karşılaştırması</h4>
            <div class="table-responsive">
              <table class="theory-table" style="font-size: 11.5px;">
                <thead>
                  <tr><th>Kriter</th><th>İşaretsiz (Unsigned)</th><th>İşaretli (Signed)</th></tr>
                </thead>
                <tbody>
                  <tr><td><b>Sayı Aralığı (8-bit)</b></td><td>0 .. 255</td><td>-128 .. +127</td></tr>
                  <tr><td><b>Hangi Bayrak Taşmayı Gösterir?</b></td><td><b>Carry Flag (CF)</b></td><td><b>Overflow Flag (OF)</b></td></tr>
                  <tr><td><b>Büyükse Atlama (>)</b></td><td><code>JA</code> (Jump if Above)<br><small>CF=0 ve ZF=0</small></td><td><code>JG</code> (Jump if Greater)<br><small>SF = OF ve ZF=0</small></td></tr>
                  <tr><td><b>Küçükse Atlama (<)</b></td><td><code>JB</code> (Jump if Below)<br><small>CF=1</small></td><td><code>JL</code> (Jump if Less)<br><small>SF ≠ OF</small></td></tr>
                </tbody>
              </table>
            </div>
            <p style="font-size: 11px; color: #b91c1c; margin-top: 6px;">
              🚨 <b>Önemli:</b> Negatif sayı karşılaştırmasında <code>JA</code> kullanılırsa <code>-10 (FFF6H)</code> pozitif <code>+5</code>'ten büyük sanılır ve kod çöker!
            </p>
          </div>

          <div class="theory-card">
            <h4 class="theory-card-title">⚙️ Donanımsal 3 Adımlı Çıkarma Algoritması (w11.pdf)</h4>
            <p style="font-size: 11.5px; color: #334155;">8086 donanımı <code>SUB Hedef, Kaynak</code> yaparken:</p>
            <ol style="font-size: 11px; line-height: 1.5; margin: 4px 0 8px 18px; padding: 0;">
              <li>Kaynağın 2'nin tümleyenini alır (Negatifini hesaplar).</li>
              <li>Hedef ile 2'nin tümleyenini <b>toplar</b>.</li>
              <li>Oluşan donanım eldesini (Carry) <b>TERSLEYEREK</b> CF'ye yazar (Invert Carry)!</li>
            </ol>
            <div class="code-preview-box" style="font-size: 11px;">
              <code>Örnek: 22H - 44H\n1. 44H'ın 2'nin tümleyeni = BCH\n2. 22H + BCH = DEH (Elde çıkmadı, C=0)\n3. CF = NOT(0) = 1 (Borç alındı!)</code>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SUBTAB 3: Hafta Hafta Eksiksiz Ders Notları (Hafta 1 - 15)
  // =========================================================================
  private renderWeekNotes(): string {
    const notesToShow = this.selectedWeek === 0
      ? ALL_WEEKS_STUDY_NOTES
      : ALL_WEEKS_STUDY_NOTES.filter(w => w.weekNumber === this.selectedWeek);

    return `
      <div class="week-notes-wrapper">
        <!-- Week Selector Filter -->
        <div class="week-selector-bar">
          <button class="btn-week-pill ${this.selectedWeek === 0 ? 'active' : ''}" data-week="0">Tüm Haftalar (1–15)</button>
          ${ALL_WEEKS_STUDY_NOTES.map(w => `
            <button class="btn-week-pill ${this.selectedWeek === w.weekNumber ? 'active' : ''}" data-week="${w.weekNumber}">
              Hafta ${w.weekNumber} (${w.period.startsWith('Vize Öncesi') ? 'Vize' : 'Final'})
            </button>
          `).join('')}
        </div>

        <!-- Notes Cards List -->
        <div class="week-notes-list">
          ${notesToShow.map(note => `
            <div class="week-note-card">
              <div class="wn-card-header">
                <div class="wn-badge-group">
                  <span class="wn-week-badge">HAFTA ${note.weekNumber}</span>
                  <span class="wn-period-badge ${note.period.startsWith('Vize Öncesi') ? 'pre-mid' : 'post-mid'}">${note.period}</span>
                  <span class="wn-slide-badge">${note.slideCount}</span>
                </div>
                <h3 class="wn-title">${note.title}</h3>
                <p class="wn-subtitle">${note.subtitle}</p>
                <div class="wn-source-files">
                  📁 <strong>Kaynak Dosyalar:</strong> ${note.sourceFiles.map(f => `<code>${f}</code>`).join(', ')}
                </div>
              </div>

              <!-- Key Topics Grid -->
              <div class="wn-key-topics">
                <strong>📌 Bu Haftanın İşlenen Temel Konuları:</strong>
                <ul class="wn-topics-list">
                  ${note.keyTopics.map(t => `<li>${t}</li>`).join('')}
                </ul>
              </div>

              <!-- Full HTML Content (All Slides & Notes) -->
              <div class="wn-full-content">
                ${note.summaryHtml}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SUBTAB 4: Sınav Öncesi Hızlı Özet & Formül Tablosu (Cheat Sheet)
  // =========================================================================
  private renderCheatSheet(): string {
    return `
      <div class="cheatsheet-wrapper">
        <div class="flags-hero-card">
          <span class="exam-hero-pill">SINAV ÖNCESİ 10 DAKİKALIK TEKRAR</span>
          <h2 class="exam-hero-title">8086 Mikroişlemciler Altın Formül & Kural Tablosu</h2>
          <p class="exam-hero-desc">
            Sınava girmeden önce mutlaka gözden geçirmeniz gereken adresleme formülleri,
            yazmaç eşleşmeleri, donanım limitleri ve pipeline denklemleri.
          </p>
        </div>

        <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          <!-- Card 1: Adresleme ve Segmentler -->
          <div class="theory-card" style="border-left: 4px solid #3b82f6;">
            <h4 class="theory-card-title">📐 Fiziksel Adres Formülleri</h4>
            <div class="theory-formula-box">
              <code>Fiziksel Adres = (Segment × 10H) + Offset</code>
            </div>
            <ul style="font-size: 11.5px; line-height: 1.5; margin: 8px 0 0 16px; padding: 0;">
              <li><code>CS : IP</code> ➔ Yürütülecek komut adresi (Fetch)</li>
              <li><code>SS : SP</code> ➔ Yığın tepesi (TOS)</li>
              <li><code>SS : BP</code> ➔ Yığın çerçevesi / Yerel değişkenler</li>
              <li><code>DS : BX / SI / DI</code> ➔ Veri segmenti erişimi</li>
              <li><code>ES : DI</code> ➔ String işlemleri hedefi</li>
              <li><b>Maksimum Segment Boyutu:</b> Tam 64 KB (0000H – FFFFH).</li>
              <li><b>Segment Bitiş Adresi:</b> <code>Başlangıç + FFFFH</code>.</li>
            </ul>
          </div>

          <!-- Card 2: Yığın Dinamikleri -->
          <div class="theory-card" style="border-left: 4px solid #ef4444;">
            <h4 class="theory-card-title">🥞 Yığın (Stack) LIFO Kuralları</h4>
            <ul style="font-size: 11.5px; line-height: 1.5; margin: 4px 0 0 16px; padding: 0;">
              <li><b>Yığın Aşağı Büyür:</b> PUSH komutunda <strong>SP 2 AZALIR</strong> (<code>SP = SP - 2</code>).</li>
              <li><b>POP Komutunda:</b> SP 2 ARTAR (<code>SP = SP + 2</code>).</li>
              <li><b>Little-Endian:</b> Düşük bayt düşük adrese, yüksek bayt yüksek adrese yazılır.</li>
              <li><b>Sadece Kelime (16-bit):</b> 8-bitlik <code>PUSH AL</code> yapılamaz!</li>
              <li><b>POP CS Yasaktır!</b> Kod akışı tutarlılığı için CS yığından doğrudan çekilemez.</li>
            </ul>
          </div>

          <!-- Card 3: Port I/O Kuralları -->
          <div class="theory-card" style="border-left: 4px solid #10b981;">
            <h4 class="theory-card-title">🔌 Giriş/Çıkış (IN / OUT) Port Kuralları</h4>
            <ul style="font-size: 11.5px; line-height: 1.5; margin: 4px 0 0 16px; padding: 0;">
              <li><b>Akümülatör Şartı:</b> Transfer <strong>YALNIZCA AL (8-bit) veya AX (16-bit)</strong> ile yapılabilir!</li>
              <li><b>00H – FFH (0–255):</b> Sabit port numarası doğrudan komuta yazılabilir: <code>IN AL, 60H</code>.</li>
              <li><b>255'ten büyükse:</b> Port adresi <strong>MUTLAKA DX YAZMACINA</strong> alınmalıdır: <code>MOV DX, 03F8H; OUT DX, AL</code>.</li>
              <li><b>I/O Uzayı:</b> 64 KB (0000H – FFFFH).</li>
            </ul>
          </div>

          <!-- Card 4: IVT Formülü -->
          <div class="theory-card" style="border-left: 4px solid #f59e0b;">
            <h4 class="theory-card-title">🗺️ Kesme Vektör Tablosu (IVT)</h4>
            <div class="theory-formula-box">
              <code>Vektör Adresi = Tip N × 4</code>
            </div>
            <ul style="font-size: 11.5px; line-height: 1.5; margin: 8px 0 0 16px; padding: 0;">
              <li><b>Konum:</b> Belleğin ilk 1024 baytı (<code>00000H – 003FFH</code>).</li>
              <li><b>Toplam Vektör:</b> 256 adet (0 – 255).</li>
              <li><b>Her Vektör 4 Bayt:</b> İlk 2 bayt IP (ofset), sonraki 2 bayt CS (segment).</li>
              <li><b>INT 0:</b> Sıfıra bölme / Bölme taşması hatası.</li>
              <li><b>INT 1:</b> Single Step (TF=1).</li>
              <li><b>INT 2:</b> NMI (Maskelenemez Kesme).</li>
              <li><b>INT 3:</b> Breakpoint (CC opcode'u).</li>
            </ul>
          </div>

          <!-- Card 5: Pipeline & Amdahl -->
          <div class="theory-card" style="border-left: 4px solid #8b5cf6;">
            <h4 class="theory-card-title">🚀 Boru Hattı & Paralellik Yasaları</h4>
            <ul style="font-size: 11.5px; line-height: 1.5; margin: 4px 0 0 16px; padding: 0;">
              <li><b>Toplam Süre:</b> <code>T_{k,n} = [k + (n - 1)] × τ</code></li>
              <li><b>Maksimum Hızlanma:</b> $S_k \to k$ (Kademe sayısı kadar).</li>
              <li><b>Amdahl Yasası (Sabit Yük):</b> <code>Speedup = 1 / [(1 - P) + (P / N)]</code>.</li>
              <li><b>Gustafson Yasası (Ölçekli):</b> <code>Speedup = N - P(N - 1)</code>.</li>
            </ul>
          </div>

          <!-- Card 6: Segment Başlatma (@DATA) -->
          <div class="theory-card" style="border-left: 4px solid #ec4899;">
            <h4 class="theory-card-title">🏛️ Segment Kurulum Kuralı (@DATA)</h4>
            <ul style="font-size: 11.5px; line-height: 1.5; margin: 4px 0 0 16px; padding: 0;">
              <li>🚨 <b>Neden MOV DS, 1000H Yasaktır?</b> 8086 mimarisinde Immediate-to-Segment opcode'u yoktur!</li>
              <li><b>Doğru Kurulum:</b>
                <pre style="margin:4px 0; font-size:11px;"><code>MOV AX, @DATA\nMOV DS, AX</code></pre>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // LOGIC & GRADING HELPERS
  // =========================================================================
  private getUserInput(qId: string, field: string): string {
    return this.userInputs[qId]?.[field] || '';
  }

  private setUserInput(qId: string, field: string, val: string): void {
    if (!this.userInputs[qId]) {
      this.userInputs[qId] = {};
    }
    this.userInputs[qId][field] = val;
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
      const userVal = this.getUserInput(qId, `reg_${r.name}`).trim();
      const passed = this.compareValues(userVal, r.expected, r.accepted);
      if (passed) score += pointPerItem;
      fieldFeedback[`reg_${r.name}`] = {
        passed,
        message: passed ? 'Doğru!' : `Beklenen: ${r.expected}, Girilen: ${userVal || 'Boş'}`
      };
    });

    // 2. Check Flags
    q.expectedFlags.forEach(f => {
      const userVal = this.getUserInput(qId, `flag_${f.name}`).trim();
      const passed = userVal === f.expected;
      if (passed) score += pointPerItem;
      fieldFeedback[`flag_${f.name}`] = {
        passed,
        message: passed ? 'Doğru!' : `Beklenen: ${f.expected}, Girilen: ${userVal || 'Seçilmedi'}`
      };
    });

    // 3. Check Memory
    if (q.expectedMemory) {
      q.expectedMemory.forEach(m => {
        const userVal = this.getUserInput(qId, `mem_${m.address}`).trim();
        const passed = this.compareValues(userVal, m.expected);
        if (passed) score += pointPerItem;
        fieldFeedback[`mem_${m.address}`] = {
          passed,
          message: passed ? 'Doğru!' : `Beklenen: ${m.expected}, Girilen: ${userVal || 'Boş'}`
        };
      });
    }

    // Round score to nearest integer
    const finalScore = Math.min(q.points, Math.round(score));

    this.gradedQuestions[qId] = {
      score: finalScore,
      total: q.points,
      fieldFeedback,
      revealed: true
    };

    this.render();
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

  private attachEvents(): void {
    // Sub-nav tab switcher
    this.container.querySelectorAll<HTMLButtonElement>('.btn-sn-subnav').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.dataset.subtab as StudyNotesSubTab;
        if (sub && sub !== this.activeSubTab) {
          this.activeSubTab = sub;
          this.render();
        }
      });
    });

    // Exam category filters
    this.container.querySelectorAll<HTMLButtonElement>('.btn-exam-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        if (cat) {
          this.selectedCategory = cat;
          this.render();
        }
      });
    });

    // Week pills filter
    this.container.querySelectorAll<HTMLButtonElement>('.btn-week-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const week = parseInt(btn.dataset.week || '0', 10);
        this.selectedWeek = week;
        this.render();
      });
    });

    // Exam Text Inputs
    this.container.querySelectorAll<HTMLInputElement>('.eq-text-in').forEach(input => {
      input.addEventListener('input', () => {
        const qId = input.dataset.qId;
        const field = input.dataset.field;
        if (qId && field) {
          this.setUserInput(qId, field, input.value);
        }
      });
    });

    // Exam Flag Toggle Buttons (0 or 1)
    this.container.querySelectorAll<HTMLElement>('.eq-flag-toggle-wrap').forEach(wrap => {
      const qId = wrap.dataset.qId;
      const field = wrap.dataset.field;
      wrap.querySelectorAll<HTMLButtonElement>('.btn-eq-flag').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.val || '0';
          if (qId && field) {
            this.setUserInput(qId, field, val);
            wrap.querySelectorAll('.btn-eq-flag').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          }
        });
      });
    });

    // Grade Exam Question Button
    this.container.querySelectorAll<HTMLButtonElement>('.btn-eq-submit').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qId;
        if (qId) {
          this.gradeQuestion(qId);
        }
      });
    });

    // Toggle Rubric Breakdown
    this.container.querySelectorAll<HTMLButtonElement>('.btn-eq-toggle-rubric').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qId;
        if (qId && this.gradedQuestions[qId]) {
          this.gradedQuestions[qId].revealed = !this.gradedQuestions[qId].revealed;
          this.render();
        }
      });
    });

    // Try in simulator live
    this.container.querySelectorAll<HTMLButtonElement>('.btn-eq-run-sim').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qId;
        const q = MIDTERM_EXAM_QUESTIONS.find(item => item.id === qId);
        if (q && this.callbacks?.onOpenInMainEditor) {
          this.callbacks.onOpenInMainEditor(`vize-${q.id}.asm`, q.codeSnippet);
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
