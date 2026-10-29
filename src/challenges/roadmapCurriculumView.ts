/**
 * roadmapCurriculumView.ts
 * 
 * 8086 Assembly Temiz ve Modern Konu Kataloğu & Müfredat Haritası.
 * Karmaşık aşamalar ve engeller yerine doğrudan konu başlıklarına hızlı erişim sağlar.
 */

import { TOPIC_CURRICULUM, TopicItem } from '../lectures/topicStudyData.js';

export interface RoadmapCurriculumCallbacks {
  onOpenLecture: (milestoneIdOrTopicId: string, subTab?: string) => void;
  onNavigateToLeetCode?: (milestoneId?: string) => void;
}

export class RoadmapCurriculumView {
  private container: HTMLElement;
  private callbacks: RoadmapCurriculumCallbacks;
  private searchQuery: string = '';

  constructor(container: HTMLElement, callbacks: RoadmapCurriculumCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }

  render(): void {
    const filteredTopics = TOPIC_CURRICULUM.filter(t => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.opcodes.some(op => op.toLowerCase().includes(q))
      );
    });

    this.container.innerHTML = `
      <div class="roadmap-tree-root topic-catalog-root">
        <!-- Header Banner -->
        <div class="roadmap-tree-header topic-catalog-header">
          <div class="tree-header-info">
            <span class="tree-badge">🗺️ 8086 KONU MÜFREDAT KATALOĞU</span>
            <h2 class="tree-main-title">8086 Assembly Tam Konu Haritası</h2>
            <p class="tree-lead-text">
              Karmaşık aşamalar veya kilitler olmadan doğrudan dilediğiniz konuyu seçin. Her konuda adım adım teoriyi, 
              her kullanım varyasyonunu gösteren örnekleri ve sınav sorularını eksiksiz çalışın.
            </p>
          </div>

          <div class="catalog-summary-metrics">
            <div class="catalog-metric-pill">
              <span class="metric-big">10</span>
              <span class="metric-label">Ana Konu Başlığı</span>
            </div>
            <div class="catalog-metric-pill">
              <span class="metric-big">100+</span>
              <span class="metric-label">Kullanım Örneği</span>
            </div>
            <div class="catalog-metric-pill">
              <span class="metric-big">30+</span>
              <span class="metric-label">Sınav Sorusu & Görev</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="catalog-toolbar">
          <div class="catalog-search-wrap">
            <span class="catalog-search-icon">🔍</span>
            <input 
              type="text" 
              id="catalog-search-input" 
              class="catalog-search-input" 
              placeholder="Konu, opcode veya kavram ara (MOV, XCHG, Stack, CMP, Döngü, String, IVT...)" 
              value="${this.escapeHtml(this.searchQuery)}"
            />
            ${this.searchQuery ? '<button id="btn-catalog-clear-search" class="btn-clear-search">✕</button>' : ''}
          </div>
          <span class="catalog-results-count">${filteredTopics.length} Konu Listeleniyor</span>
        </div>

        <!-- Topics Grid -->
        <div class="topic-cards-grid">
          ${filteredTopics.map(topic => {
            const usageCount = topic.usageGroups.reduce((acc, g) => acc + g.items.length, 0);
            return `
              <div class="topic-catalog-card" data-topic-id="${topic.id}">
                <div class="topic-card-top">
                  <div class="topic-card-icon-num">
                    <span class="card-icon">${topic.icon}</span>
                    <span class="card-num-badge">Konu ${topic.number}</span>
                  </div>
                  <span class="card-badge">${topic.badge}</span>
                </div>

                <h3 class="topic-card-title">${this.escapeHtml(topic.title)}</h3>
                <p class="topic-card-summary">${this.escapeHtml(topic.summary)}</p>

                <!-- Opcodes Tag Cloud -->
                <div class="topic-card-opcodes">
                  ${topic.opcodes.slice(0, 7).map(op => `<span class="card-opcode-tag">${this.escapeHtml(op)}</span>`).join('')}
                  ${topic.opcodes.length > 7 ? `<span class="card-opcode-more">+${topic.opcodes.length - 7}</span>` : ''}
                </div>

                <div class="topic-card-metrics">
                  <span>📖 ${topic.theorySteps.length} Adım Anlatım</span>
                  <span>⚡ ${usageCount} Kullanım Şekli</span>
                  <span>❓ ${topic.questions.length} Soru</span>
                </div>

                <!-- Action Buttons -->
                <div class="topic-card-actions">
                  <button class="btn-card-action primary btn-open-topic" data-topic-id="${topic.id}" data-subtab="theory">
                    📖 Konuyu Çalış (Adım Adım)
                  </button>
                  <button class="btn-card-action secondary btn-open-topic" data-topic-id="${topic.id}" data-subtab="usage">
                    ⚡ Kullanım Örnekleri
                  </button>
                  <button class="btn-card-action tertiary btn-open-topic" data-topic-id="${topic.id}" data-subtab="questions">
                    ❓ Sorular
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    // Open topic buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-open-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const topicId = btn.getAttribute('data-topic-id');
        const subtab = btn.getAttribute('data-subtab') || 'theory';
        if (topicId) {
          this.callbacks.onOpenLecture(topicId, subtab);
        }
      });
    });

    // Whole card click
    this.container.querySelectorAll<HTMLElement>('.topic-catalog-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return; // ignore if button clicked
        const topicId = card.getAttribute('data-topic-id');
        if (topicId) {
          this.callbacks.onOpenLecture(topicId, 'theory');
        }
      });
    });

    // Search input
    const searchInput = this.container.querySelector('#catalog-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value.trim();
      this.render();
      const newSearchInput = this.container.querySelector('#catalog-search-input') as HTMLInputElement | null;
      if (newSearchInput) {
        newSearchInput.focus();
        newSearchInput.selectionStart = newSearchInput.selectionEnd = newSearchInput.value.length;
      }
    });

    // Clear search
    this.container.querySelector('#btn-catalog-clear-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render();
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
