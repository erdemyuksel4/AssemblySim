/**
 * lectureDocumentView.ts
 * 
 * 8086 Assembly Kapsamlı ve Adım Adım Konu Odaklı Ders ve Pratik Çalışma Merkezi.
 * Her aşama yerine doğrudan konu başlığı seçilir.
 * Seçilen her konuda:
 *   1. Adım adım teorik ve donanım mekanizması bilgisi
 *   2. Her türlü kullanımı, varyasyonu ve yasakları gösteren zengin kod örnekleri ("Simülatörde Çalıştır" butonlu)
 *   3. Sınav çıkmışları, durum tahminleri ve adım adım çözümlü sorular
 *   4. Uygulamalı kodlama alıştırmaları
 */

import { TOPIC_CURRICULUM, TopicItem, getTopicById } from './topicStudyData.js';
import { MILESTONE_LECTURES, MilestoneLecture } from './lectureData.js';
import { CHALLENGES } from '../challenges/challengesData.js';

export interface LectureDocCallbacks {
  onOpenInMainEditor: (title: string, code: string) => void;
  onNavigateToMilestoneLecture: (milestoneId: string, stepId?: string) => void;
  onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => void;
  onNavigateToRoadmap?: () => void;
}

export type TopicSubTab = 'theory' | 'usage' | 'questions' | 'challenges';

export class LectureDocumentView {
  private container: HTMLElement;
  private currentTopic: TopicItem;
  private activeSubTab: TopicSubTab = 'theory';
  private searchQuery: string = '';
  private callbacks: LectureDocCallbacks;
  private openSolutions: Set<string> = new Set();

  constructor(container: HTMLElement, callbacks: LectureDocCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentTopic = TOPIC_CURRICULUM[0];
  }

  setMilestone(milestoneIdOrTopicId: string, targetSubTab?: string): void {
    this.currentTopic = getTopicById(milestoneIdOrTopicId);
    if (targetSubTab && ['theory', 'usage', 'questions', 'challenges'].includes(targetSubTab)) {
      this.activeSubTab = targetSubTab as TopicSubTab;
    } else {
      this.activeSubTab = 'theory';
    }
    this.render();
  }

  setTopic(topicId: string, subTab?: TopicSubTab): void {
    this.setMilestone(topicId, subTab);
  }

  getMilestoneId(): string {
    return this.currentTopic.legacyMilestoneId;
  }

  getCurrentStepId(): string {
    return this.activeSubTab;
  }

  render(): void {
    const topic = this.currentTopic;

    this.container.innerHTML = `
      <div class="lecture-doc-container topic-study-hub">
        <!-- Top Breadcrumbs -->
        <div class="lecture-doc-breadcrumb">
          <span class="bc-item bc-roadmap-link" style="cursor: pointer;" title="Konu Kataloğuna Git">🗺️ Konu Kataloğu</span>
          <span class="bc-sep">/</span>
          <span class="bc-item">Konu ${topic.number}</span>
          <span class="bc-sep">/</span>
          <span class="bc-item highlight">${this.escapeHtml(topic.shortTitle)}</span>
        </div>

        <!-- Master Topic Selection Bar (Her Aşama Yerine Konu Başlığı Seç) -->
        <div class="topic-master-nav-card">
          <div class="topic-nav-top-row">
            <div class="topic-nav-label-wrap">
              <span class="topic-nav-icon">📚</span>
              <span class="topic-nav-heading">Konu Başlığı Seçimi:</span>
            </div>
            <div class="topic-select-wrap">
              <select id="select-active-topic" class="topic-select-dropdown">
                ${TOPIC_CURRICULUM.map(t => `
                  <option value="${t.id}" ${t.id === topic.id ? 'selected' : ''}>
                    ${t.icon} ${t.number}. ${this.escapeHtml(t.title)}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="topic-search-box-wrap">
              <span class="search-box-icon">🔍</span>
              <input 
                type="text" 
                id="topic-search-input" 
                class="topic-search-input" 
                placeholder="Konu veya komut ara (MOV, Stack, CMP, Döngü...)" 
                value="${this.escapeHtml(this.searchQuery)}"
              />
              ${this.searchQuery ? '<button id="btn-clear-topic-search" class="btn-clear-search">✕</button>' : ''}
            </div>
          </div>

          <!-- Quick Topic Pills (Hızlı Konu Butonları) -->
          <div class="topic-pills-row">
            ${TOPIC_CURRICULUM.map(t => `
              <button 
                type="button" 
                class="btn-topic-pill ${t.id === topic.id ? 'active' : ''}" 
                data-topic-id="${t.id}"
                title="${this.escapeHtml(t.title)}"
              >
                <span class="pill-icon">${t.icon}</span>
                <span class="pill-num">${t.number}</span>
                <span class="pill-title">${this.escapeHtml(t.shortTitle)}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Selected Topic Header Banner -->
        <div class="lecture-doc-header topic-hero-banner">
          <div class="lecture-header-top">
            <span class="lecture-pill">${topic.badge}</span>
            <span class="lecture-slide-ref">📌 Konu ${topic.number} / 10</span>
          </div>
          <h1 class="lecture-main-title">${topic.icon} ${this.escapeHtml(topic.title)}</h1>
          <p class="lecture-subtitle-text">${this.escapeHtml(topic.summary)}</p>

          <!-- Included Opcodes Chips -->
          <div class="topic-opcodes-bar">
            <span class="opcodes-label">İçerilen Komut & Yazmaçlar:</span>
            <div class="opcodes-chips">
              ${topic.opcodes.map(op => `<span class="opcode-chip">${this.escapeHtml(op)}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- 4 Sub-Navigation Tabs Inside Selected Topic -->
        <div class="topic-subtabs-nav">
          <button class="btn-topic-subtab ${this.activeSubTab === 'theory' ? 'active' : ''}" data-subtab="theory">
            <span class="tab-icon">📖</span>
            <span class="tab-text">1. Adım Adım Konu Anlatımı</span>
            <span class="tab-count-badge">${topic.theorySteps.length} Adım</span>
          </button>
          <button class="btn-topic-subtab ${this.activeSubTab === 'usage' ? 'active' : ''}" data-subtab="usage">
            <span class="tab-icon">⚡</span>
            <span class="tab-text">2. Her Kullanım Şekli & Örnekler</span>
            <span class="tab-count-badge">${topic.usageGroups.reduce((acc, g) => acc + g.items.length, 0)} Örnek</span>
          </button>
          <button class="btn-topic-subtab ${this.activeSubTab === 'questions' ? 'active' : ''}" data-subtab="questions">
            <span class="tab-icon">❓</span>
            <span class="tab-text">3. Soru Bankası & Sınav Çıkmışları</span>
            <span class="tab-count-badge">${topic.questions.length} Soru</span>
          </button>
          <button class="btn-topic-subtab ${this.activeSubTab === 'challenges' ? 'active' : ''}" data-subtab="challenges">
            <span class="tab-icon">🚀</span>
            <span class="tab-text">4. Uygulamalı Kodlama Görevleri</span>
            <span class="tab-count-badge">${topic.challenges.length} Görev</span>
          </button>
        </div>

        <!-- Subtab Content Area -->
        <div class="topic-content-body">
          ${this.renderActiveSubTabContent(topic)}
        </div>

        <!-- Footer Navigation Between Topics -->
        <div class="topic-footer-nav">
          <div class="footer-nav-left">
            ${this.getPrevTopic() ? `
              <button class="btn-topic-nav-prev" data-target-topic="${this.getPrevTopic()!.id}">
                ⬅️ Önceki Konu: ${this.escapeHtml(this.getPrevTopic()!.shortTitle)}
              </button>
            ` : '<span></span>'}
          </div>
          <div class="footer-nav-center">
            <button class="btn-open-in-roadmap">🗺️ Tüm Konuları Gör (Müfredat Kataloğu)</button>
          </div>
          <div class="footer-nav-right">
            ${this.getNextTopic() ? `
              <button class="btn-topic-nav-next" data-target-topic="${this.getNextTopic()!.id}">
                Sonraki Konu: ${this.escapeHtml(this.getNextTopic()!.shortTitle)} ➡️
              </button>
            ` : '<span></span>'}
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    this.attachInteractiveDemos();
  }

  private renderActiveSubTabContent(topic: TopicItem): string {
    switch (this.activeSubTab) {
      case 'theory':
        return this.renderTheoryContent(topic);
      case 'usage':
        return this.renderUsageContent(topic);
      case 'questions':
        return this.renderQuestionsContent(topic);
      case 'challenges':
        return this.renderChallengesContent(topic);
      default:
        return this.renderTheoryContent(topic);
    }
  }

  // -------------------------------------------------------------------------
  // 1. ADIM ADIM TEORİ İÇERİĞİ
  // -------------------------------------------------------------------------
  private renderTheoryContent(topic: TopicItem): string {
    return `
      <div class="theory-steps-stream">
        <div class="section-intro-banner">
          <span class="intro-badge">📘 TAM REHBER</span>
          <h3>${this.escapeHtml(topic.title)} — Adım Adım Mimari & Kavram Anlatımı</h3>
          <p>Aşağıdaki adımları sırayla takip ederek konunun donanım mekanizmasını, adresleme kurallarını ve sınav tuzaklarını kavrayın.</p>
        </div>

        ${topic.theorySteps.map(step => `
          <div class="theory-step-card" id="step-${step.stepNumber}">
            <div class="step-card-header">
              <span class="step-card-num">${step.stepNumber}</span>
              <h3 class="step-card-title">${this.escapeHtml(step.stepTitle)}</h3>
            </div>
            <div class="step-card-body">
              ${step.htmlContent}
            </div>
          </div>
        `).join('')}

        ${topic.id === 'arch-20bit' ? `
          <!-- Interaktif 20-Bit Adres Hesaplayıcı -->
          <div class="interactive-calc-card">
            <div class="calc-card-header">
              <span class="calc-card-badge">⚡ Canlı İnteraktif Araç</span>
              <h4 class="calc-card-title">20-Bit Fiziksel Adres ve Bellek Konumu Hesaplayıcı</h4>
            </div>
            <p style="font-size: 13.5px; color: #475569; margin-bottom: 12px;">
              Segment ve Ofset değerlerini Hex (16'lık taban) olarak girin; formülün canlı olarak adım adım nasıl çalıştığını ve adresin 1 MB haritada nereye düştüğünü görün:
            </p>
            <div class="calc-input-row">
              <div class="calc-input-group">
                <label>Segment Yazmacı (Hex):</label>
                <input type="text" id="input-calc-segment" class="calc-input" value="1234" maxlength="4" placeholder="örn: 1234">
              </div>
              <div class="calc-input-group">
                <label>Ofset Yazmacı (Hex):</label>
                <input type="text" id="input-calc-offset" class="calc-input" value="0100" maxlength="4" placeholder="örn: 0100">
              </div>
              <button type="button" id="btn-calc-address" class="btn-calc-action">Adresi Hesapla</button>
            </div>
            <div id="calc-address-result"></div>
          </div>

          <!-- Interaktif Little-Endian Simülatörü -->
          <div class="interactive-calc-card" style="margin-top: 24px;">
            <div class="calc-card-header">
              <span class="calc-card-badge">⚡ Canlı İnteraktif Araç</span>
              <h4 class="calc-card-title">Little-Endian Bellek Yerleşim Simülatörü</h4>
            </div>
            <p style="font-size: 13.5px; color: #475569; margin-bottom: 12px;">
              16-bit bir kelime ve başlangıç adresini girin; düşük baytın düşük adrese, yüksek baytın bir sonraki adrese nasıl dağıldığını canlı izleyin:
            </p>
            <div class="calc-input-row">
              <div class="calc-input-group">
                <label>16-Bit Kelime (Hex):</label>
                <input type="text" id="input-endian-word" class="calc-input" value="5A34" maxlength="4" placeholder="örn: 5A34">
              </div>
              <div class="calc-input-group">
                <label>Başlangıç Bellek Adresi:</label>
                <input type="text" id="input-endian-addr" class="calc-input" value="0200" maxlength="4" placeholder="örn: 0200">
              </div>
              <button type="button" id="btn-calc-endian" class="btn-calc-action">Belleğe Yerleştir</button>
            </div>
            <div id="endian-result-container"></div>
          </div>
        ` : ''}

        <div class="next-subtab-prompt">
          <p>Tebrikler! Konunun teorik adımlarını incelediniz. Şimdi bu komutların ve kuralların her kullanım şeklini örneklerle görmek için sonraki bölüme geçin:</p>
          <button class="btn-prompt-subtab-jump primary" data-target-subtab="usage">
            ⚡ 2. Bölüm: Her Kullanım Şekli & Örnekler ➡️
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 2. HER KULLANIM ŞEKLİ & ÖRNEKLER
  // -------------------------------------------------------------------------
  private renderUsageContent(topic: TopicItem): string {
    return `
      <div class="usage-variations-stream">
        <div class="section-intro-banner">
          <span class="intro-badge">⚡ KAPSAMLI KOD BANKASI</span>
          <h3>Her Kullanım Şekli, Varyasyonlar & Simülatör Entegrasyonu</h3>
          <p>
            Bu konuda yer alan komutların alabildiği <strong>tüm operant varyasyonları</strong>, bellek adresleme modları ve sık yapılan <strong>sözdizimi yasakları</strong> aşağıda listelenmiştir.
            Her örneğin yanındaki <strong>"⚡ Simülatörde Çalıştır"</strong> butonuna tıklayarak kodu ana editöre alabilir ve adım adım çalıştırabilirsiniz.
          </p>
        </div>

        ${topic.usageGroups.map(group => `
          <div class="usage-group-card">
            <div class="usage-group-header">
              <span class="group-folder-icon">📁</span>
              <div class="group-header-text">
                <h3 class="group-title">${this.escapeHtml(group.groupTitle)}</h3>
                ${group.groupDescription ? `<p class="group-desc">${this.escapeHtml(group.groupDescription)}</p>` : ''}
              </div>
            </div>

            <div class="usage-items-list">
              ${group.items.map((item, idx) => `
                <div class="usage-item-card ${item.isInvalid ? 'is-invalid-syntax' : ''}">
                  <div class="usage-item-top">
                    <div class="usage-item-title-wrap">
                      <span class="usage-item-badge">${item.isInvalid ? '❌ YASAK KULLANIM' : `Varyasyon ${idx + 1}`}</span>
                      <h4 class="usage-item-title">${this.escapeHtml(item.title)}</h4>
                    </div>
                    <button 
                      class="btn-run-snippet" 
                      data-code="${this.escapeHtml(item.code)}" 
                      data-title="${this.escapeHtml(item.title)}"
                      title="Bu kodu doğrudan ana editöre yükle ve simülatörde adım adım çalıştır"
                    >
                      ⚡ Simülatörde / Editörde Çalıştır
                    </button>
                  </div>

                  <p class="usage-item-desc">${this.escapeHtml(item.description)}</p>

                  <div class="usage-code-wrapper">
                    <pre class="usage-code-block"><code>${this.escapeHtml(item.code)}</code></pre>
                  </div>

                  ${item.syntaxRule ? `
                    <div class="usage-rule-callout">
                      📌 <strong>Sözdizimi Kuralı:</strong> ${this.escapeHtml(item.syntaxRule)}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <div class="next-subtab-prompt">
          <p>Örnekleri incelediniz! Şimdi bu konudaki çıkmış sınav soruları ve durum tahmin alıştırmalarıyla kendinizi test edin:</p>
          <button class="btn-prompt-subtab-jump primary" data-target-subtab="questions">
            ❓ 3. Bölüm: Soru Bankası & Sınav Çıkmışları ➡️
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 3. SORU BANKASI & SINAV ÇIKMIŞLARI
  // -------------------------------------------------------------------------
  private renderQuestionsContent(topic: TopicItem): string {
    if (topic.questions.length === 0) {
      return `
        <div class="empty-questions-card">
          <span class="empty-icon">📝</span>
          <h3>Bu konu için hazırlanan sorular güncellenmektedir.</h3>
          <p>Uygulamalı kodlama görevlerine göz atabilirsiniz.</p>
        </div>
      `;
    }

    return `
      <div class="questions-stream">
        <div class="section-intro-banner">
          <span class="intro-badge">❓ SINAV HAZIRLIĞI</span>
          <h3>Üniversite Vize Standartlarında Çıkmış Sorular & Kod Analizleri</h3>
          <p>
            Her soruda verilen kodu inceleyin, beklenen değerleri kendiniz hesaplayın ve ardından 
            <strong>"💡 Çözümü & Açıklamayı Göster"</strong> butonuna basarak adım adım analizi ve hocanın sınav puanlama kriterlerini görün.
          </p>
        </div>

        ${topic.questions.map(q => {
          const isOpen = this.openSolutions.has(q.id);
          return `
            <div class="topic-question-card" id="question-${q.id}">
              <div class="question-header">
                <div class="question-meta-tags">
                  <span class="q-difficulty-badge ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                  ${q.points ? `<span class="q-points-badge">${q.points} Puan</span>` : ''}
                </div>
                <h3 class="question-title">${this.escapeHtml(q.title)}</h3>
              </div>

              <div class="question-scenario">
                <p>${this.escapeHtml(q.scenario)}</p>
              </div>

              ${q.codeSnippet ? `
                <div class="question-code-block-wrap">
                  <div class="code-block-header">
                    <span>Soru Kodu:</span>
                    <button 
                      class="btn-run-snippet small" 
                      data-code="${this.escapeHtml(q.codeSnippet)}" 
                      data-title="${this.escapeHtml(q.title)}"
                    >
                      ⚡ Editörde Dene
                    </button>
                  </div>
                  <pre class="question-code-snippet"><code>${this.escapeHtml(q.codeSnippet)}</code></pre>
                </div>
              ` : ''}

              <!-- Solution Accordion Button -->
              <div class="solution-toggle-wrap">
                <button class="btn-toggle-solution" data-qid="${q.id}">
                  <span class="toggle-icon">${isOpen ? '▲' : '💡'}</span>
                  <span class="toggle-text">${isOpen ? 'Çözümü ve Analizi Gizle' : 'Adım Adım Çözümü & Analizi Göster'}</span>
                </button>
              </div>

              <!-- Solution Details Drawer -->
              <div class="question-solution-drawer" style="display: ${isOpen ? 'block' : 'none'};">
                <div class="solution-steps-box">
                  <h4 class="solution-steps-title">✅ Adım Adım Doğru Çözüm:</h4>
                  <ul class="solution-steps-list">
                    ${q.solutionSteps.map(s => `<li>${this.escapeHtml(s)}</li>`).join('')}
                  </ul>
                  ${q.expectedResult ? `
                    <div class="solution-final-result">
                      <strong>Beklenen Sonuç:</strong> <code>${this.escapeHtml(q.expectedResult)}</code>
                    </div>
                  ` : ''}
                </div>

                <div class="hoca-exam-tips-box">
                  <span class="tips-icon">🎓</span>
                  <div class="tips-body">
                    <strong>Hocanın Puan Kırma Kriteri & Sınav Uyarısı:</strong><br>
                    ${this.escapeHtml(q.examTips)}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}

        <div class="next-subtab-prompt">
          <p>Soruları tamamladınız! Şimdi bu konudaki uygulamalı kodlama görevlerine geçin:</p>
          <button class="btn-prompt-subtab-jump primary" data-target-subtab="challenges">
            🚀 4. Bölüm: Uygulamalı Kodlama Görevleri ➡️
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 4. UYGULAMALI KODLAMA GÖREVLERİ
  // -------------------------------------------------------------------------
  private renderChallengesContent(topic: TopicItem): string {
    if (topic.challenges.length === 0) {
      return `
        <div class="empty-questions-card">
          <span class="empty-icon">💻</span>
          <h3>Bu konu için kodlama alıştırmaları hazırlanmaktadır.</h3>
        </div>
      `;
    }

    return `
      <div class="challenges-stream">
        <div class="section-intro-banner">
          <span class="intro-badge">🚀 PRATİK KODLAMA</span>
          <h3>Uygulamalı 8086 Assembly Görevleri</h3>
          <p>Aşağıdaki görevleri ana editöre yükleyin, kodu tamamlayın ve simülatörde test edin.</p>
        </div>

        ${topic.challenges.map(ch => `
          <div class="topic-challenge-card" id="challenge-${ch.id}">
            <div class="challenge-card-header">
              <span class="ch-badge ${ch.difficulty.toLowerCase()}">${ch.difficulty}</span>
              <h3 class="ch-title">${this.escapeHtml(ch.title)}</h3>
            </div>
            <p class="ch-task-desc">${this.escapeHtml(ch.task)}</p>

            <div class="ch-action-buttons">
              <button 
                class="btn-load-challenge primary" 
                data-code="${this.escapeHtml(ch.starterCode)}" 
                data-title="${this.escapeHtml(ch.title)}"
              >
                🚀 Kodu Editöre Yükle ve Çöz
              </button>
              <button 
                class="btn-view-challenge-solution secondary" 
                data-code="${this.escapeHtml(ch.solutionCode)}" 
                data-title="${this.escapeHtml(ch.title)} (Örnek Çözüm)"
              >
                💡 Örnek Çözümü Editörde Aç
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private getPrevTopic(): TopicItem | null {
    const idx = TOPIC_CURRICULUM.findIndex(t => t.id === this.currentTopic.id);
    return idx > 0 ? TOPIC_CURRICULUM[idx - 1] : null;
  }

  private getNextTopic(): TopicItem | null {
    const idx = TOPIC_CURRICULUM.findIndex(t => t.id === this.currentTopic.id);
    return idx < TOPIC_CURRICULUM.length - 1 ? TOPIC_CURRICULUM[idx + 1] : null;
  }

  private attachEvents(): void {
    // Topic dropdown selection
    const selectDropdown = this.container.querySelector('#select-active-topic') as HTMLSelectElement | null;
    selectDropdown?.addEventListener('change', () => {
      const targetId = selectDropdown.value;
      if (targetId) {
        this.setMilestone(targetId, this.activeSubTab);
      }
    });

    // Topic pill buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-topic-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const topicId = btn.getAttribute('data-topic-id');
        if (topicId) {
          this.setMilestone(topicId, this.activeSubTab);
        }
      });
    });

    // Subtab navigation buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-topic-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        const subtab = btn.getAttribute('data-subtab') as TopicSubTab;
        if (subtab) {
          this.activeSubTab = subtab;
          this.render();
        }
      });
    });

    // Subtab jump prompts (bottom of pages)
    this.container.querySelectorAll<HTMLButtonElement>('.btn-prompt-subtab-jump').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSubtab = btn.getAttribute('data-target-subtab') as TopicSubTab;
        if (targetSubtab) {
          this.activeSubTab = targetSubtab;
          this.render();
          this.container.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Prev / Next topic footer buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-topic-nav-prev, .btn-topic-nav-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTopic = btn.getAttribute('data-target-topic');
        if (targetTopic) {
          this.setMilestone(targetTopic, 'theory');
          this.container.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Open in Roadmap catalog button
    this.container.querySelector('.btn-open-in-roadmap')?.addEventListener('click', () => {
      this.callbacks.onNavigateToRoadmap?.();
    });

    // Breadcrumb roadmap link
    this.container.querySelector('.bc-roadmap-link')?.addEventListener('click', () => {
      this.callbacks.onNavigateToRoadmap?.();
    });

    // "⚡ Simülatörde Çalıştır" buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-run-snippet, .btn-load-challenge, .btn-view-challenge-solution').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = btn.getAttribute('data-code') || '';
        const title = btn.getAttribute('data-title') || 'Ornek Kod';
        this.callbacks.onOpenInMainEditor(title, code);
      });
    });

    // Toggle solution buttons in question cards
    this.container.querySelectorAll<HTMLButtonElement>('.btn-toggle-solution').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.getAttribute('data-qid');
        if (!qid) return;
        if (this.openSolutions.has(qid)) {
          this.openSolutions.delete(qid);
        } else {
          this.openSolutions.add(qid);
        }
        this.render();
        const el = this.container.querySelector(`#question-${qid}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    // Search input
    const searchInput = this.container.querySelector('#topic-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value.toLowerCase().trim();
      this.filterBySearch();
    });

    // Clear search button
    this.container.querySelector('#btn-clear-topic-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render();
    });
  }

  private filterBySearch(): void {
    if (!this.searchQuery) {
      this.render();
      return;
    }

    // Match topic titles, opcodes or usage items
    const matchingTopics = TOPIC_CURRICULUM.filter(t => 
      t.title.toLowerCase().includes(this.searchQuery) ||
      t.summary.toLowerCase().includes(this.searchQuery) ||
      t.opcodes.some(op => op.toLowerCase().includes(this.searchQuery))
    );

    if (matchingTopics.length > 0 && !matchingTopics.some(t => t.id === this.currentTopic.id)) {
      this.currentTopic = matchingTopics[0];
      this.render();
    }
  }

  private attachInteractiveDemos(): void {
    // 20-Bit Physical Address Calculator
    const btnCalc = this.container.querySelector('#btn-calc-address') as HTMLButtonElement | null;
    const segInput = this.container.querySelector('#input-calc-segment') as HTMLInputElement | null;
    const offInput = this.container.querySelector('#input-calc-offset') as HTMLInputElement | null;
    const resBox = this.container.querySelector('#calc-address-result') as HTMLElement | null;

    if (btnCalc && segInput && offInput && resBox) {
      const doCalc = () => {
        const segStr = (segInput.value || '0').trim().replace(/h$/i, '');
        const offStr = (offInput.value || '0').trim().replace(/h$/i, '');
        const seg = parseInt(segStr, 16) || 0;
        const off = parseInt(offStr, 16) || 0;
        const shifted = (seg * 16) & 0xFFFFF;
        const phys = (shifted + off) & 0xFFFFF;

        const segHex = seg.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const offHex = off.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const shiftedHex = shifted.toString(16).toUpperCase().padStart(5, '0') + 'H';
        const physHex = phys.toString(16).toUpperCase().padStart(5, '0') + 'H';

        let region = '';
        let regionColor = '#10b981';
        if (phys <= 0x9FFFF) {
          region = 'TPA (Transient Program Area - 640 KB: DOS Çekirdeği, Sürücüler & Kullanıcı Programları)';
          regionColor = '#10b981';
        } else if (phys <= 0xBFFFF) {
          region = 'System Area: Video RAM (128 KB - Ekran Kartı Görüntü Belleği)';
          regionColor = '#f59e0b';
        } else if (phys <= 0xDFFFF) {
          region = 'System Area: Genişleme Kartı ROM Bellekleri & Donanım BIOS';
          regionColor = '#8b5cf6';
        } else {
          region = 'System Area: Sistem BIOS ROM (F0000H – FFFFFH - Reset Vektörü FFFF0H)';
          regionColor = '#ef4444';
        }

        resBox.innerHTML = `
          <div class="calc-res-grid">
            <div class="calc-res-item">
              <span class="calc-res-label">1. Segment 10H (16) ile Çarpılır (4-bit Sola Kaydırılır):</span>
              <span class="calc-res-val">${segHex} × 10H = <strong>${shiftedHex}</strong></span>
            </div>
            <div class="calc-res-item">
              <span class="calc-res-label">2. Ofset Değeri Eklenir:</span>
              <span class="calc-res-val">+ ${offHex}</span>
            </div>
            <div class="calc-res-item highlight">
              <span class="calc-res-label">🎯 20-Bit Fiziksel Adres:</span>
              <span class="calc-res-val big"><strong>${physHex}</strong> (${phys.toLocaleString('tr-TR')} desimal bayt)</span>
            </div>
            <div class="calc-res-item region" style="border-left: 4px solid ${regionColor};">
              <span class="calc-res-label">📍 1 MB Bellek Haritasındaki Konumu:</span>
              <span class="calc-res-val" style="color: ${regionColor};"><strong>${region}</strong></span>
            </div>
          </div>
        `;
      };

      btnCalc.addEventListener('click', doCalc);
      segInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doCalc(); });
      offInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doCalc(); });
      doCalc();
    }

    // Little-Endian Visualizer
    const btnEndian = this.container.querySelector('#btn-calc-endian') as HTMLButtonElement | null;
    const wordInput = this.container.querySelector('#input-endian-word') as HTMLInputElement | null;
    const addrInput = this.container.querySelector('#input-endian-addr') as HTMLInputElement | null;
    const endianRes = this.container.querySelector('#endian-result-container') as HTMLElement | null;

    if (btnEndian && wordInput && addrInput && endianRes) {
      const doEndian = () => {
        const wordStr = (wordInput.value || '1234').trim().replace(/h$/i, '');
        const addrStr = (addrInput.value || '0200').trim().replace(/h$/i, '');
        const wordVal = (parseInt(wordStr, 16) || 0) & 0xFFFF;
        const addrVal = (parseInt(addrStr, 16) || 0) & 0xFFFF;

        const lowByte = wordVal & 0xFF;
        const highByte = (wordVal >> 8) & 0xFF;

        const lowAddr = addrVal;
        const highAddr = (addrVal + 1) & 0xFFFF;

        const lowAddrHex = lowAddr.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const highAddrHex = highAddr.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const lowByteHex = lowByte.toString(16).toUpperCase().padStart(2, '0') + 'H';
        const highByteHex = highByte.toString(16).toUpperCase().padStart(2, '0') + 'H';
        const wordHex = wordVal.toString(16).toUpperCase().padStart(4, '0') + 'H';

        endianRes.innerHTML = `
          <div class="endian-boxes-wrap">
            <div class="endian-slot-card low">
              <div class="slot-badge">DÜŞÜK ADRES (Low Address)</div>
              <div class="slot-addr">[${lowAddrHex}]</div>
              <div class="slot-byte">${lowByteHex}</div>
              <div class="slot-role">Düşük Anlamlı Bayt (LSB)</div>
            </div>
            <div class="endian-arrow-card">
              <span class="endian-arrow-icon">⇄</span>
              <span class="endian-arrow-text">16-Bit Kelime:<br><strong>${wordHex}</strong></span>
            </div>
            <div class="endian-slot-card high">
              <div class="slot-badge">YÜKSEK ADRES (High Address)</div>
              <div class="slot-addr">[${highAddrHex}]</div>
              <div class="slot-byte">${highByteHex}</div>
              <div class="slot-role">Yüksek Anlamlı Bayt (MSB)</div>
            </div>
          </div>
          <div class="endian-rule-note">
            💡 <strong>Altın Kural:</strong> Intel 8086 mimarisinde düşük anlamlı bayt (<strong>${lowByteHex}</strong>) daima küçük adrese <code>[${lowAddrHex}]</code>, yüksek anlamlı bayt (<strong>${highByteHex}</strong>) ise bir sonraki adrese <code>[${highAddrHex}]</code> yazılır!
          </div>
        `;
      };

      btnEndian.addEventListener('click', doEndian);
      wordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doEndian(); });
      addrInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doEndian(); });
      doEndian();
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

// Export alias for semantic clarity
export { LectureDocumentView as TopicStudyView };
