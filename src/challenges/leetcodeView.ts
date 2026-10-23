import { CHALLENGES, ROADMAP_MILESTONES } from './challengesData.js';
import { Challenge, GradingResult, DifficultyLevel } from './types.js';
import { ChallengeRunner } from './runner.js';

export const STORAGE_SOLVED_KEY = 'assemblysim_solved_challenges_v1';

export type LeetCodeFilter = 'all' | DifficultyLevel | 'solved' | 'unsolved';

export interface LeetCodeCallbacks {
  onLoadChallengeToEditor: (challenge: Challenge) => void;
  onOpenLectureDocument?: (milestoneId: string) => void;
  getCurrentEditorCode?: () => string;
}

export class LeetCodeView {
  private container: HTMLElement;
  private callbacks: LeetCodeCallbacks;
  private solvedIds: Set<string> = new Set();
  private selectedFilter: LeetCodeFilter = 'all';
  private selectedMilestoneId: string = 'all';
  private searchQuery: string = '';

  constructor(container: HTMLElement, callbacks: LeetCodeCallbacks) {
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

  filterByMilestone(milestoneId: string): void {
    this.selectedMilestoneId = milestoneId;
    this.render();
  }

  render(): void {
    const allChallengesList = Object.values(CHALLENGES);
    const totalChallenges = allChallengesList.length;
    const solvedCount = this.solvedIds.size;
    const percent = totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0;

    const filteredChallenges = allChallengesList.filter(ch => {
      // Milestone filter
      if (this.selectedMilestoneId !== 'all' && ch.milestoneId !== this.selectedMilestoneId) {
        return false;
      }

      // Difficulty / Solved filter
      if (this.selectedFilter === 'solved' && !this.solvedIds.has(ch.id)) return false;
      if (this.selectedFilter === 'unsolved' && this.solvedIds.has(ch.id)) return false;
      if (['Kolay', 'Orta', 'Zor'].includes(this.selectedFilter) && ch.difficulty !== this.selectedFilter) {
        return false;
      }

      // Search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchOp = ch.opcodes.some(o => o.toLowerCase().includes(q));
        const matchTitle = ch.title.toLowerCase().includes(q);
        const matchTask = ch.task.toLowerCase().includes(q);
        return matchOp || matchTitle || matchTask;
      }

      return true;
    });

    this.container.innerHTML = `
      <div class="leetcode-root">
        <!-- Top Stats Banner -->
        <div class="leetcode-header-card">
          <div class="leetcode-headline">
            <span class="leetcode-badge-tag">⚡ 8086 LEETCODE ARENASI</span>
            <h2 class="leetcode-title">Pratik Assembly Görevleri ve Algoritmik Sınavlar</h2>
            <p class="leetcode-desc">Her 8086 komut ailesi ve mimari yetenek için özel hazırlanmış problemleri çözün, otomatik sanal test motoru ile çözümlerinizi doğrulayın.</p>
          </div>

          <div class="leetcode-stats-box">
            <div class="stats-row">
              <span class="stats-val">${solvedCount} / ${totalChallenges}</span>
              <span class="stats-txt">Tamamlanan</span>
            </div>
            <div class="stats-bar-track">
              <div class="stats-bar-fill" style="width: ${percent}%;"></div>
            </div>
            <div class="stats-footer-row">
              <span class="stats-pct">%${percent} Başarı</span>
              <span class="stats-left">${totalChallenges - solvedCount} Görev Kaldı</span>
            </div>
          </div>
        </div>

        <!-- Toolbar: Filters, Milestone Dropdown, Search -->
        <div class="leetcode-toolbar">
          <div class="filter-pills-group">
            <button class="btn-lt-filter ${this.selectedFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü (${totalChallenges})</button>
            <button class="btn-lt-filter ${this.selectedFilter === 'Kolay' ? 'active' : ''}" data-filter="Kolay">🟢 Kolay</button>
            <button class="btn-lt-filter ${this.selectedFilter === 'Orta' ? 'active' : ''}" data-filter="Orta">🟡 Orta</button>
            <button class="btn-lt-filter ${this.selectedFilter === 'Zor' ? 'active' : ''}" data-filter="Zor">🔴 Zor</button>
            <button class="btn-lt-filter ${this.selectedFilter === 'solved' ? 'active' : ''}" data-filter="solved">✅ Çözülenler (${solvedCount})</button>
          </div>

          <div class="leetcode-controls-right">
            <select id="select-milestone-filter" class="leetcode-select">
              <option value="all" ${this.selectedMilestoneId === 'all' ? 'selected' : ''}>Tüm Aşamalar (1-11)</option>
              ${ROADMAP_MILESTONES.map(m => `
                <option value="${m.id}" ${this.selectedMilestoneId === m.id ? 'selected' : ''}>
                  Aşama ${m.number}: ${this.escapeHtml(m.title)}
                </option>
              `).join('')}
            </select>

            <div class="leetcode-search-wrap">
              <input 
                type="text" 
                id="leetcode-search-input" 
                class="leetcode-search-input" 
                placeholder="Komut veya görev ara (MOV, Stack, Bubble Sort...)" 
                value="${this.escapeHtml(this.searchQuery)}"
              />
            </div>
          </div>
        </div>

        <!-- Challenges Grid -->
        <div class="leetcode-grid">
          ${filteredChallenges.length > 0 ? filteredChallenges.map(ch => {
            const isSolved = this.solvedIds.has(ch.id);
            const diffClass = ch.difficulty === 'Kolay' ? 'diff-easy' : (ch.difficulty === 'Orta' ? 'diff-medium' : 'diff-hard');
            const milestone = ROADMAP_MILESTONES.find(m => m.id === ch.milestoneId);

            return `
              <div class="leetcode-card ${isSolved ? 'is-solved' : ''}" data-ch-id="${ch.id}">
                <div class="leetcode-card-top">
                  <div class="card-status-title">
                    <span class="status-indicator">${isSolved ? '✅' : '⚪'}</span>
                    <strong class="card-title">${this.escapeHtml(ch.title)}</strong>
                  </div>
                  <span class="diff-tag ${diffClass}">${ch.difficulty}</span>
                </div>

                <div class="card-milestone-tag">
                  📁 Aşama ${milestone?.number || 1}: ${this.escapeHtml(milestone?.title || '')}
                </div>

                <div class="card-opcodes-row">
                  ${ch.opcodes.map(op => `<span class="op-badge">${op}</span>`).join('')}
                </div>

                <div class="card-scenario">
                  <strong>Senaryo:</strong> ${this.escapeHtml(ch.scenario)}
                </div>

                <div class="card-task">
                  <strong>Görev:</strong> ${this.escapeHtml(ch.task)}
                </div>

                <div class="card-actions">
                  <button class="btn-card-load" data-ch-id="${ch.id}" title="Bu görevi yeni ve izole bir CPU örneği ile editöre yükle">
                    📝 Editöre Yükle (İzole CPU)
                  </button>
                  <button class="btn-card-test" data-ch-id="${ch.id}" title="Mevcut çözümü sanal sandbox ortamında test et">
                    ▶️ Görevi Test Et
                  </button>
                </div>
              </div>
            `;
          }).join('') : (this.selectedMilestoneId === 'milestone-1' ? `
            <div class="leetcode-empty-state" style="padding: 32px 16px;">
              <span style="font-size: 32px;">🎓</span>
              <h3 style="margin: 8px 0; color: #1e293b; font-size: 16px;">Aşama 1: Mimari & Kavramsal Keşif Aşaması</h3>
              <p style="color: #64748b; max-width: 540px; margin: 0 auto 16px auto; font-size: 13px; line-height: 1.5;">
                Bu aşamada mikroişlemcinin donanım blokları (BIU & EU), 14 adet yazmaç ve 20-bit adresleme formülleri öğretilmektedir. 
                Henüz komut anlatılmadığı için <strong>kodlama görevi istenmez</strong>. İlk komutlar ve kodlama görevleri <b>Aşama 2 (MOV, XCHG, LEA)</b> ile başlar.
              </p>
              <button id="btn-open-m1-from-empty" class="btn-primary-highlight" style="padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; background: #0284c7; color: #fff; border: none;">
                📖 Aşama 1 İnteraktif Ders Dokümanını Aç →
              </button>
            </div>
          ` : `
            <div class="leetcode-empty-state">
              <span>🔍 Arama veya filtreleme kriterlerine uygun görev bulunamadı.</span>
            </div>
          `)}
        </div>

        <!-- Grading Result Modal Host -->
        <div id="leetcode-grade-modal-host"></div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Open milestone 1 lecture button from empty state
    this.container.querySelector('#btn-open-m1-from-empty')?.addEventListener('click', () => {
      this.callbacks.onOpenLectureDocument?.('milestone-1');
    });

    // Filter buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-lt-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedFilter = btn.dataset.filter as LeetCodeFilter;
        this.render();
      });
    });

    // Milestone dropdown
    const milestoneSelect = this.container.querySelector<HTMLSelectElement>('#select-milestone-filter');
    milestoneSelect?.addEventListener('change', (e) => {
      this.selectedMilestoneId = (e.target as HTMLSelectElement).value;
      this.render();
    });

    // Search input
    const searchInput = this.container.querySelector<HTMLInputElement>('#leetcode-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.render();
      const newSearchInput = this.container.querySelector<HTMLInputElement>('#leetcode-search-input');
      if (newSearchInput) {
        newSearchInput.focus();
        newSearchInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
      }
    });

    // Load to editor
    this.container.querySelectorAll<HTMLButtonElement>('.btn-card-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.chId;
        if (!id) return;
        const ch = CHALLENGES[id];
        if (ch) {
          this.callbacks.onLoadChallengeToEditor(ch);
        }
      });
    });

    // Test challenge
    this.container.querySelectorAll<HTMLButtonElement>('.btn-card-test').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.chId;
        if (!id) return;
        const ch = CHALLENGES[id];
        if (!ch) return;

        let codeToGrade = ch.solutionCode || ch.starterCode;
        if (this.callbacks.getCurrentEditorCode) {
          const edCode = this.callbacks.getCurrentEditorCode().trim();
          if (edCode) {
            codeToGrade = edCode;
          }
        }

        const result = ChallengeRunner.grade(ch, codeToGrade);
        if (result.status === 'PASSED') {
          this.markSolved(id);
        }
        this.showGradingModal(ch, result);
      });
    });
  }

  private showGradingModal(challenge: Challenge, result: GradingResult): void {
    const modalHost = this.container.querySelector('#leetcode-grade-modal-host');
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
