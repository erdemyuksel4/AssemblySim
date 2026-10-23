import { ROADMAP_MILESTONES, CHALLENGES } from './challengesData.js';

const STORAGE_SOLVED_KEY = 'assemblysim_solved_challenges_v1';

export interface RoadmapCurriculumCallbacks {
  onOpenLecture: (milestoneId: string) => void;
  onNavigateToLeetCode?: (milestoneId?: string) => void;
}

export class RoadmapCurriculumView {
  private container: HTMLElement;
  private callbacks: RoadmapCurriculumCallbacks;
  private solvedIds: Set<string> = new Set();

  constructor(container: HTMLElement, callbacks: RoadmapCurriculumCallbacks) {
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
      console.warn('Could not load solved challenges in roadmap', e);
    }
  }

  render(): void {
    const totalMilestones = ROADMAP_MILESTONES.length;
    let completedMilestonesCount = 0;

    const milestonesData = ROADMAP_MILESTONES.map(m => {
      const allChallengeIds = m.topics.flatMap(t => t.challengeIds);
      const totalInMilestone = allChallengeIds.length;
      const solvedInMilestone = allChallengeIds.filter(id => this.solvedIds.has(id)).length;
      const isCompleted = totalInMilestone > 0 && solvedInMilestone === totalInMilestone;
      if (isCompleted) completedMilestonesCount++;

      const percent = totalInMilestone > 0 ? Math.round((solvedInMilestone / totalInMilestone) * 100) : 0;
      return {
        milestone: m,
        totalInMilestone,
        solvedInMilestone,
        isCompleted,
        percent
      };
    });

    const globalPercent = totalMilestones > 0 ? Math.round((completedMilestonesCount / totalMilestones) * 100) : 0;

    this.container.innerHTML = `
      <div class="roadmap-tree-root">
        <!-- Header Banner -->
        <div class="roadmap-tree-header">
          <div class="tree-header-info">
            <span class="tree-badge">🗺️ MÜFREDAT GELİŞİM AĞACI</span>
            <h2 class="tree-main-title">8086 Assembly Tam Yol Haritası</h2>
            <p class="tree-lead-text">9 Temel aşamadan oluşan müfredatı adım adım takip edin. Her aşamada hedeflenen donanım ve yazılım kavramlarını kavrayıp pratik görevlerle pekiştirin.</p>
          </div>

          <div class="tree-progress-summary">
            <div class="summary-metric">
              <span class="metric-big">${completedMilestonesCount} / ${totalMilestones}</span>
              <span class="metric-label">Aşama Tamamlandı</span>
            </div>
            <div class="tree-progress-track">
              <div class="tree-progress-fill" style="width: ${globalPercent}%;"></div>
            </div>
            <span class="tree-percent-text">%${globalPercent} Müfredat Bitti</span>
          </div>
        </div>

        <!-- Milestones Timeline Grid -->
        <div class="timeline-container">
          ${milestonesData.map(({ milestone, totalInMilestone, solvedInMilestone, isCompleted, percent }, idx) => {
            return `
              <div class="timeline-step ${isCompleted ? 'step-completed' : ''}">
                <div class="timeline-step-indicator">
                  <div class="step-circle ${isCompleted ? 'circle-done' : ''}">
                    ${isCompleted ? '✓' : milestone.number}
                  </div>
                  ${idx < totalMilestones - 1 ? '<div class="step-connector"></div>' : ''}
                </div>

                <div class="timeline-step-content">
                  <div class="step-card-header">
                    <div class="step-title-group">
                      <span class="step-num-pill">AŞAMA ${milestone.number}</span>
                      <h3 class="step-title">${this.escapeHtml(milestone.title)}</h3>
                    </div>

                    <div class="step-progress-badge ${isCompleted || totalInMilestone === 0 ? 'badge-completed' : ''}">
                      ${totalInMilestone === 0 ? '🎓 Teori & İnteraktif Keşif' : `${solvedInMilestone} / ${totalInMilestone} Görev (%${percent})`}
                    </div>
                  </div>

                  <p class="step-description">${this.escapeHtml(milestone.description)}</p>

                  <div class="step-topics-list">
                    ${milestone.topics.map(topic => `
                      <div class="step-topic-item">
                        <div class="topic-row-title">
                          <span class="bullet-dot">▪</span>
                          <strong>${this.escapeHtml(topic.title)}:</strong>
                          <span class="topic-brief">${this.escapeHtml(topic.description)}</span>
                        </div>
                        <div class="topic-opcodes-strip">
                          ${topic.opcodes.length > 0 ? topic.opcodes.map(op => `<span class="opcode-pill">${op}</span>`).join('') : '<span class="opcode-pill pill-concept">Kavram & Mimari</span>'}
                        </div>
                      </div>
                    `).join('')}
                  </div>

                  <div class="step-footer">
                    <div class="step-card-progress-bar">
                      <div class="step-card-progress-fill" style="width: ${totalInMilestone === 0 ? 100 : percent}%;"></div>
                    </div>
                    <div class="step-actions-group">
                      <button class="btn-open-lecture-doc" data-milestone-id="${milestone.id}" title="Bu aşamanın zengin konu anlatımı ve interaktif ders dokümanını aç">
                        📖 Aşama ${milestone.number} Konu Anlatımını Aç (Ders)
                      </button>
                      ${totalInMilestone === 0 ? `
                        <button class="btn-open-lecture-doc btn-theory-explore" data-milestone-id="${milestone.id}" title="İnteraktif 20-bit adres hesaplayıcı ve mimari keşif araçlarını aç">
                          ⚡ İnteraktif Araçları Aç →
                        </button>
                      ` : `
                        <button class="btn-jump-to-leetcode" data-milestone-id="${milestone.id}" title="Bu aşamadaki tüm görevleri LeetCode sekmesinde listele">
                          ⚡ LeetCode (${totalInMilestone}) →
                        </button>
                      `}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Open lecture document
    this.container.querySelectorAll<HTMLButtonElement>('.btn-open-lecture-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const milestoneId = btn.dataset.milestoneId;
        if (milestoneId) {
          this.callbacks.onOpenLecture(milestoneId);
        }
      });
    });

    // Jump to LeetCode tasks
    this.container.querySelectorAll<HTMLButtonElement>('.btn-jump-to-leetcode').forEach(btn => {
      btn.addEventListener('click', () => {
        const milestoneId = btn.dataset.milestoneId;
        if (this.callbacks.onNavigateToLeetCode) {
          this.callbacks.onNavigateToLeetCode(milestoneId);
        }
      });
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
