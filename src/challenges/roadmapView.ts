import { ROADMAP_MILESTONES, CHALLENGES } from './challengesData.js';
import { Challenge, GradingResult, DifficultyLevel } from './types.js';
import { ChallengeRunner } from './runner.js';

const STORAGE_SOLVED_KEY = 'assemblysim_solved_challenges_v1';

export interface RoadmapCallbacks {
  onLoadChallengeToEditor: (challenge: Challenge) => void;
  getCurrentEditorCode?: () => string;
}

export class RoadmapView {
  private container: HTMLElement;
  private callbacks: RoadmapCallbacks;
  private solvedIds: Set<string> = new Set();
  private selectedFilter: 'all' | DifficultyLevel = 'all';
  private searchQuery: string = '';

  constructor(container: HTMLElement, callbacks: RoadmapCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.loadSolvedFromStorage();
    this.render();
  }

  private loadSolvedFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_SOLVED_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            this.solvedIds = new Set(arr);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load solved challenges', e);
    }
  }

  private markSolved(id: string): void {
    this.solvedIds.add(id);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_SOLVED_KEY, JSON.stringify(Array.from(this.solvedIds)));
      }
    } catch (e) {
      console.warn('Could not save solved challenges', e);
    }
    this.render();
  }

  render(): void {
    const totalChallenges = Object.keys(CHALLENGES).length;
    const solvedCount = this.solvedIds.size;
    const percent = totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0;

    this.container.innerHTML = `
      <div class="roadmap-root">
        <!-- Header & Progress -->
        <div class="roadmap-header">
          <div class="roadmap-headline">
            <h2 class="roadmap-main-title">🗺️ 8086 Assembly Yol Haritası & LeetCode</h2>
            <p class="roadmap-lead">Her komut ailesi ve mimari kavram için özel olarak tasarlanmış, izole işlemcili görevleri tamamlayarak 8086 uzmanı olun.</p>
          </div>

          <div class="roadmap-stats-card">
            <div class="stats-metric">
              <span class="stats-num">${solvedCount} / ${totalChallenges}</span>
              <span class="stats-label">Tamamlanan Görevler</span>
            </div>
            <div class="stats-progress-wrap">
              <div class="stats-progress-bar" style="width: ${percent}%;"></div>
            </div>
            <span class="stats-percent">%${percent} Başarı</span>
          </div>
        </div>

        <!-- Toolbar / Filters -->
        <div class="roadmap-toolbar">
          <div class="filter-buttons">
            <button class="btn-filter ${this.selectedFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü (${totalChallenges})</button>
            <button class="btn-filter ${this.selectedFilter === 'Kolay' ? 'active' : ''}" data-filter="Kolay">🟢 Kolay</button>
            <button class="btn-filter ${this.selectedFilter === 'Orta' ? 'active' : ''}" data-filter="Orta">🟡 Orta</button>
            <button class="btn-filter ${this.selectedFilter === 'Zor' ? 'active' : ''}" data-filter="Zor">🔴 Zor</button>
          </div>

          <div class="roadmap-search">
            <input 
              type="text" 
              id="roadmap-search-input" 
              class="roadmap-search-field" 
              placeholder="Opcode veya görev ara (MOV, XCHG, Bubble Sort...)" 
              value="${this.escapeHtml(this.searchQuery)}"
            />
          </div>
        </div>

        <!-- Milestones Accordion / Tree -->
        <div class="roadmap-milestones-list">
          ${ROADMAP_MILESTONES.map(milestone => {
            const milestoneChallenges = milestone.topics.flatMap(t => t.challengeIds.map(id => CHALLENGES[id]).filter(Boolean));
            const filteredMilestoneChallenges = milestoneChallenges.filter(ch => {
              if (this.selectedFilter !== 'all' && ch.difficulty !== this.selectedFilter) return false;
              if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                const matchOp = ch.opcodes.some(o => o.toLowerCase().includes(q));
                const matchTitle = ch.title.toLowerCase().includes(q);
                const matchTask = ch.task.toLowerCase().includes(q);
                return matchOp || matchTitle || matchTask;
              }
              return true;
            });

            if (filteredMilestoneChallenges.length === 0) return '';

            const milestoneSolved = milestoneChallenges.filter(ch => this.solvedIds.has(ch.id)).length;

            return `
              <div class="milestone-card">
                <div class="milestone-header">
                  <div class="milestone-badge-num">${milestone.number}</div>
                  <div class="milestone-info">
                    <h3 class="milestone-title">${this.escapeHtml(milestone.title)}</h3>
                    <p class="milestone-desc">${this.escapeHtml(milestone.description)}</p>
                  </div>
                  <div class="milestone-progress-pill">
                    ${milestoneSolved} / ${milestoneChallenges.length} Bitti
                  </div>
                </div>

                <div class="milestone-topics">
                  ${milestone.topics.map(topic => {
                    const topicChallenges = topic.challengeIds
                      .map(id => CHALLENGES[id])
                      .filter(Boolean)
                      .filter(ch => {
                        if (this.selectedFilter !== 'all' && ch.difficulty !== this.selectedFilter) return false;
                        if (this.searchQuery) {
                          const q = this.searchQuery.toLowerCase();
                          const matchOp = ch.opcodes.some(o => o.toLowerCase().includes(q));
                          const matchTitle = ch.title.toLowerCase().includes(q);
                          const matchTask = ch.task.toLowerCase().includes(q);
                          return matchOp || matchTitle || matchTask;
                        }
                        return true;
                      });

                    if (topicChallenges.length === 0) return '';

                    return `
                      <div class="topic-block">
                        <div class="topic-header">
                          <span class="topic-title">📚 ${this.escapeHtml(topic.title)}</span>
                          <div class="topic-opcodes">
                            ${topic.opcodes.map(op => `<span class="opcode-pill">${op}</span>`).join('')}
                          </div>
                        </div>
                        <p class="topic-desc">${this.escapeHtml(topic.description)}</p>

                        <div class="challenge-cards-list">
                          ${topicChallenges.map(ch => {
                            const isSolved = this.solvedIds.has(ch.id);
                            const diffColor = ch.difficulty === 'Kolay' ? 'diff-easy' : (ch.difficulty === 'Orta' ? 'diff-medium' : 'diff-hard');

                            return `
                              <div class="challenge-item ${isSolved ? 'solved' : ''}" data-ch-id="${ch.id}">
                                <div class="challenge-item-header">
                                  <div class="challenge-title-group">
                                    <span class="ch-status-icon">${isSolved ? '✅' : '⚪'}</span>
                                    <strong class="ch-title">${this.escapeHtml(ch.title)}</strong>
                                    <span class="diff-badge ${diffColor}">${ch.difficulty}</span>
                                  </div>
                                  <div class="challenge-opcodes-group">
                                    ${ch.opcodes.map(op => `<span class="op-mini">${op}</span>`).join('')}
                                  </div>
                                </div>

                                <div class="challenge-scenario">
                                  <strong>Senaryo:</strong> ${this.escapeHtml(ch.scenario)}
                                </div>

                                <div class="challenge-task">
                                  <strong>Görev:</strong> ${this.escapeHtml(ch.task)}
                                </div>

                                <div class="challenge-actions">
                                  <button class="btn-ch-load" data-ch-id="${ch.id}" title="Bu görevi yeni bir izole CPU örneği ile editöre yükle">
                                    📝 Editöre Yükle (İzole CPU)
                                  </button>
                                </div>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Grade Result Modal Overlay Container -->
        <div id="grade-result-modal-container"></div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Filter buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter as any;
        if (filter) {
          this.selectedFilter = filter;
          this.render();
        }
      });
    });

    // Search input
    const searchInput = this.container.querySelector<HTMLInputElement>('#roadmap-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.render();
      // Keep search focused
      const newSearchInput = this.container.querySelector<HTMLInputElement>('#roadmap-search-input');
      if (newSearchInput) {
        newSearchInput.focus();
        newSearchInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
      }
    });

    // Load to editor buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-ch-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const chId = btn.dataset.chId;
        if (!chId) return;
        const challenge = CHALLENGES[chId];
        if (challenge) {
          this.callbacks.onLoadChallengeToEditor(challenge);
        }
      });
    });
  }

  private showGradingModal(challenge: Challenge, result: GradingResult): void {
    const modalHost = this.container.querySelector('#grade-result-modal-container');
    if (!modalHost) return;

    const isPassed = result.status === 'PASSED';
    const statusClass = isPassed ? 'grade-passed' : 'grade-failed';
    const statusText = isPassed ? '✅ TEBRİKLER! GÖREV TAMAMLANDI' : `❌ ${result.status}`;

    modalHost.innerHTML = `
      <div class="grade-modal-overlay">
        <div class="grade-modal-card">
          <div class="grade-modal-header ${statusClass}">
            <div class="grade-modal-title">
              <h3>${statusText}</h3>
              <p>${this.escapeHtml(challenge.title)}</p>
            </div>
            <button class="btn-grade-close">×</button>
          </div>

          <div class="grade-modal-body">
            <div class="grade-metrics-bar">
              <div class="metric-item">
                <span class="metric-val">${result.stepCount}</span>
                <span class="metric-label">İşlenen Adım</span>
              </div>
              <div class="metric-item">
                <span class="metric-val">${result.executionTimeMs} ms</span>
                <span class="metric-label">Çalışma Süresi</span>
              </div>
              <div class="metric-item">
                <span class="metric-val">${result.diffs.filter(d => d.passed).length} / ${result.diffs.length}</span>
                <span class="metric-label">Sağlanan Doğrulama</span>
              </div>
            </div>

            ${result.compileError ? `
              <div class="grade-error-box">
                <strong>Derleme Hatası (Satır ${result.compileError.line}):</strong> ${this.escapeHtml(result.compileError.message)}
              </div>
            ` : ''}

            ${result.runtimeError ? `
              <div class="grade-error-box">
                <strong>Çalışma Zamanı Hatası:</strong> ${this.escapeHtml(result.runtimeError)}
              </div>
            ` : ''}

            <h4 class="diff-title">Varlık ve Durum Doğrulamaları:</h4>
            <div class="diff-table-wrap">
              <table class="diff-table">
                <thead>
                  <tr>
                    <th>Hedef</th>
                    <th>Beklenen</th>
                    <th>Gerçekleşen</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  ${result.diffs.map(d => `
                    <tr class="${d.passed ? 'row-pass' : 'row-fail'}">
                      <td><strong>${this.escapeHtml(d.target)}</strong></td>
                      <td class="font-mono">${this.escapeHtml(d.expected)}</td>
                      <td class="font-mono">${this.escapeHtml(d.actual)}</td>
                      <td>
                        <span class="diff-status-pill ${d.passed ? 'pill-pass' : 'pill-fail'}">
                          ${d.passed ? '✓ BAŞARILI' : '✗ UYUMSUZ'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            ${challenge.hints && challenge.hints.length > 0 && !isPassed ? `
              <div class="challenge-hints-box">
                <strong>💡 İpuçları:</strong>
                <ul>
                  ${challenge.hints.map(h => `<li>${this.escapeHtml(h)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <div class="grade-modal-footer">
            <button class="btn-primary btn-grade-done">Kapat</button>
          </div>
        </div>
      </div>
    `;

    // Bind close events
    const closeModal = () => {
      modalHost.innerHTML = '';
    };
    modalHost.querySelector('.btn-grade-close')?.addEventListener('click', closeModal);
    modalHost.querySelector('.btn-grade-done')?.addEventListener('click', closeModal);
    modalHost.querySelector('.grade-modal-overlay')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('grade-modal-overlay')) {
        closeModal();
      }
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
