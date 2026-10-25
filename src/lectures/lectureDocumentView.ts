import { MILESTONE_LECTURES, MilestoneLecture, LectureSection } from './lectureData.js';
import { InteractiveExampleWidget } from './interactiveExampleWidget.js';
import { CHALLENGES } from '../challenges/challengesData.js';
import { LectureStorage } from './lectureStorage.js';

export interface LectureDocCallbacks {
  onOpenInMainEditor: (title: string, code: string) => void;
  onNavigateToMilestoneLecture: (milestoneId: string, stepId?: string) => void;
  onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => void;
  onNavigateToRoadmap?: () => void;
}

export interface StepItem {
  id: string; // 'overview' | 'sec-0' | 'sec-1' ... | 'capstone'
  tabLabel: string;
  fullTitle: string;
  badge: string;
  isCapstone?: boolean;
}

export class LectureDocumentView {
  private container: HTMLElement;
  private currentMilestoneId: string = 'milestone-1';
  private currentStepId: string = 'overview';
  private stepList: StepItem[] = [];
  private callbacks: LectureDocCallbacks;
  private exampleWidgets: InteractiveExampleWidget[] = [];

  constructor(container: HTMLElement, callbacks: LectureDocCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  setMilestone(milestoneId: string, targetStepId?: string): void {
    this.currentMilestoneId = milestoneId;
    const lecture = MILESTONE_LECTURES[this.currentMilestoneId] || MILESTONE_LECTURES['milestone-1'];

    this.buildStepList(lecture);

    if (targetStepId && this.stepList.some(s => s.id === targetStepId)) {
      this.currentStepId = targetStepId;
    } else {
      const savedStep = LectureStorage.getLastActiveStep(milestoneId);
      if (savedStep && this.stepList.some(s => s.id === savedStep)) {
        this.currentStepId = savedStep;
      } else {
        this.currentStepId = this.stepList[0]?.id || 'overview';
      }
    }

    LectureStorage.setLastActiveStep(this.currentMilestoneId, this.currentStepId);
    this.render();
  }

  getMilestoneId(): string {
    return this.currentMilestoneId;
  }

  getCurrentStepId(): string {
    return this.currentStepId;
  }

  private buildStepList(lecture: MilestoneLecture): void {
    this.stepList = [];

    // Step 0: Overview
    this.stepList.push({
      id: 'overview',
      tabLabel: 'Genel Bakış',
      fullTitle: `${lecture.title} - Giriş & Genel Bakış`,
      badge: '📖'
    });

    // Sections / Modules
    lecture.sections.forEach((sec, idx) => {
      this.stepList.push({
        id: `sec-${idx}`,
        tabLabel: this.formatStepTitle(sec.title, idx),
        fullTitle: sec.title,
        badge: `${idx + 1}`
      });
    });

    // Final Step: Capstone or Hardware Wrap-up
    const capstone = Object.values(CHALLENGES).find(ch => ch.milestoneId === this.currentMilestoneId && ch.isCapstone);
    if (this.currentMilestoneId === 'milestone-1') {
      this.stepList.push({
        id: 'capstone',
        tabLabel: 'Mimari Bitiş',
        fullTitle: 'Aşama 1 Tamamlandı: Donanım & Mimari Temeli',
        badge: '🏛️',
        isCapstone: true
      });
    } else if (capstone) {
      this.stepList.push({
        id: 'capstone',
        tabLabel: 'Aşama Sınavı',
        fullTitle: `Aşama ${lecture.milestoneNumber} Sonu Sentez Görevi: ${capstone.title}`,
        badge: '🏆',
        isCapstone: true
      });
    }
  }

  private formatStepTitle(title: string, index: number): string {
    // Strip parenthetical notes for compact tab display
    const cleaned = title.replace(/\([^)]*\)/g, '').trim();

    // Match "X. Modül: Title"
    const modMatch = cleaned.match(/^(\d+)\.\s*Modül:\s*(.+)$/i);
    if (modMatch) {
      const name = modMatch[2].split(':')[0].trim();
      return `Modül ${modMatch[1]}: ${name}`;
    }

    // Match "X. Title"
    const numMatch = cleaned.match(/^(\d+)\.\s*(.+)$/);
    if (numMatch) {
      const name = numMatch[2].split(':')[0].trim();
      return `${numMatch[1]}. ${name}`;
    }

    return `Modül ${index + 1}: ${cleaned}`;
  }

  render(): void {
    const lecture = MILESTONE_LECTURES[this.currentMilestoneId] || MILESTONE_LECTURES['milestone-1'];
    this.exampleWidgets = [];

    this.buildStepList(lecture);

    // Validate current step
    if (!this.stepList.some(s => s.id === this.currentStepId)) {
      this.currentStepId = this.stepList[0]?.id || 'overview';
    }

    const keys = Object.keys(MILESTONE_LECTURES);
    const currIdx = keys.indexOf(this.currentMilestoneId);
    const prevKey = currIdx > 0 ? keys[currIdx - 1] : null;
    const nextKey = currIdx < keys.length - 1 ? keys[currIdx + 1] : null;
    const nextMilestoneNumber = nextKey ? (MILESTONE_LECTURES[nextKey]?.milestoneNumber || currIdx + 2) : null;
    const capstone = Object.values(CHALLENGES).find(ch => ch.milestoneId === this.currentMilestoneId && ch.isCapstone);

    const currentStepIdx = this.stepList.findIndex(s => s.id === this.currentStepId);
    const completedSteps = LectureStorage.getCompletedSteps(this.currentMilestoneId);
    const completedCount = this.stepList.filter(s => completedSteps.includes(s.id)).length;
    const totalSteps = this.stepList.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    const currentStepObj = this.stepList[currentStepIdx] || this.stepList[0];

    this.container.innerHTML = `
      <div class="lecture-doc-container">
        <!-- Top Navigation Breadcrumbs -->
        <div class="lecture-doc-breadcrumb">
          <span class="bc-item bc-roadmap-link" style="cursor: pointer;" title="Yol Haritasına Git">🗺️ Yol Haritası</span>
          <span class="bc-sep">/</span>
          <span class="bc-item highlight">Aşama ${lecture.milestoneNumber}: ${this.escapeHtml(lecture.title)}</span>
        </div>

        <!-- Lecture Header Banner -->
        <div class="lecture-doc-header">
          <div class="lecture-header-top">
            <span class="lecture-pill">DERS ANLATIMI & TEORİ REHBERİ</span>
            <span class="lecture-slide-ref">📍 Slayt: ${this.escapeHtml(lecture.slideRef)}</span>
          </div>
          <h1 class="lecture-main-title">${this.escapeHtml(lecture.title)}</h1>
          <p class="lecture-subtitle-text">${this.escapeHtml(lecture.subtitle)}</p>
        </div>

        <!-- Stepper & Tab Progress Component (Sekme Mantığı & İlerleme Görünümü) -->
        <div class="lecture-stepper-container">
          <!-- Stepper Meta Summary Bar -->
          <div class="stepper-summary-bar">
            <div class="stepper-meta-left">
              <span class="stepper-step-indicator">Adım ${currentStepIdx + 1} / ${totalSteps}</span>
              <span class="stepper-active-title">${this.escapeHtml(currentStepObj?.fullTitle || '')}</span>
            </div>
            <div class="stepper-meta-right">
              <span class="stepper-percent-badge">%${progressPercent} Tamamlandı (${completedCount}/${totalSteps} Adım)</span>
              <div class="stepper-quick-nav">
                <button class="btn-step-quick prev" ${currentStepIdx <= 0 ? 'disabled' : ''} title="Önceki Adım">⬅️ Önceki</button>
                <button class="btn-step-quick next" ${currentStepIdx >= totalSteps - 1 ? 'disabled' : ''} title="Sonraki Adım">Sonraki ➡️</button>
              </div>
            </div>
          </div>

          <!-- Progress Bar Track -->
          <div class="stepper-progress-track">
            <div class="stepper-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>

          <!-- Stepper Tabs Scroll Row -->
          <div class="stepper-tabs-scroll-wrap">
            <div class="stepper-tabs-row">
              ${this.stepList.map((step, idx) => {
                const isCompleted = completedSteps.includes(step.id);
                const isActive = step.id === this.currentStepId;
                return `
                  <button type="button" class="stepper-tab-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${step.isCapstone ? 'capstone-pill' : ''}" data-step-id="${step.id}" title="${this.escapeHtml(step.fullTitle)}">
                    <span class="tab-pill-badge">${isCompleted ? '✓' : step.badge}</span>
                    <span class="tab-pill-label">${this.escapeHtml(step.tabLabel)}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Step Panes Content Area (Sadece Aktif Modül Gösterilir) -->
        <div class="lecture-step-content-area">

          <!-- Pane 0: Overview (Genel Bakış) -->
          <div class="lecture-step-pane" data-pane-id="overview" style="display: ${this.currentStepId === 'overview' ? 'block' : 'none'};">
            <div class="lecture-overview-mount">
              ${lecture.overviewHtml}
            </div>
            <div class="module-nav-footer">
              <div style="flex: 1;"></div>
              <button class="btn-step-nav-action primary" data-target-step="${this.stepList[1]?.id || 'sec-0'}">
                🚀 1. Modüle Başla ➡️
              </button>
            </div>
          </div>

          <!-- Panes 1..N: Lecture Sections / Modules -->
          ${lecture.sections.map((sec, secIdx) => {
            const stepId = `sec-${secIdx}`;
            const isSecCompleted = completedSteps.includes(stepId);
            const prevStep = this.stepList[secIdx]?.id || 'overview'; // idx 0 in sections corresponds to idx 1 in stepList
            const nextStep = this.stepList[secIdx + 2]?.id || 'capstone';
            const prevLabel = this.stepList[secIdx]?.tabLabel || 'Genel Bakış';
            const nextLabel = this.stepList[secIdx + 2]?.tabLabel || 'Aşama Sınavı 🏆';

            return `
              <div class="lecture-step-pane" data-pane-id="${stepId}" style="display: ${this.currentStepId === stepId ? 'block' : 'none'};">
                <div class="lecture-section-card">
                  <div class="lecture-sec-header">
                    <div class="sec-badge-row">
                      <span class="sec-number-badge">MODÜL ${secIdx + 1} / ${lecture.sections.length}</span>
                      ${isSecCompleted ? '<span class="sec-done-badge">✓ Tamamlandı</span>' : ''}
                    </div>
                    <h2 class="lecture-sec-title">${this.escapeHtml(sec.title)}</h2>
                  </div>

                  <div class="lecture-sec-content">
                    ${sec.contentHtml}
                  </div>

                  ${sec.examples && sec.examples.length > 0 ? `
                    <div class="lecture-examples-wrapper">
                      <div id="example-mount-${secIdx}" class="example-widget-mount"></div>
                    </div>
                  ` : ''}
                </div>

                <!-- Intra-module Navigation Bar -->
                <div class="module-nav-footer">
                  <button class="btn-step-nav-action prev" data-target-step="${prevStep}">
                    ⬅️ Önceki: ${this.escapeHtml(prevLabel)}
                  </button>

                  <button class="btn-step-toggle-complete ${isSecCompleted ? 'is-completed' : ''}" data-step-id="${stepId}">
                    ${isSecCompleted ? '✓ Bu Adım Tamamlandı' : '⭕ Tamamlandı Olarak İşaretle'}
                  </button>

                  <button class="btn-step-nav-action next primary" data-target-step="${nextStep}">
                    Sonraki: ${this.escapeHtml(nextLabel)} ➡️
                  </button>
                </div>
              </div>
            `;
          }).join('')}

          <!-- Final Pane: Capstone Challenge / Hardware Wrap-up -->
          <div class="lecture-step-pane" data-pane-id="capstone" style="display: ${this.currentStepId === 'capstone' ? 'block' : 'none'};">
            <div class="lecture-capstone-container">
              ${this.currentMilestoneId === 'milestone-1' ? `
                <div class="lecture-capstone-card milestone-1-notice">
                  <div class="capstone-card-badge-row">
                    <span class="capstone-badge arch">🏛️ MİMARİ VE BELLEK TEMELİ TAMAMLANDI</span>
                    <span class="capstone-scope-tag">1. Aşama: Donanım & Mimari</span>
                  </div>
                  <h3 class="capstone-title">Aşama 1 Tamamlandı: Kodlama Öncesi Mimari Donanım</h3>
                  <p class="capstone-desc">
                    Bu aşamada 8086'nın iç mimarisini (BIU & EU), 14 adet yazmaç kümesini, 20-bit adresleme formülünü ve Little-Endian prensibini öğrendiniz.
                    Henüz assembly komutu (MOV, ADD vb.) anlatılmadığı için bu aşamada kodlama görevi bulunmamaktadır.
                    <strong>Aşama 2'ye geçerek ilk komutları öğrendiğinizde, hem Aşama 1'i hem Aşama 2'yi harmanlayan ilk Kapsayıcı LeetCode Göreviniz açılacaktır!</strong>
                  </p>
                  <div class="capstone-card-actions">
                    <button id="btn-capstone-m1-next" class="btn-capstone-action primary">
                      🚀 Aşama 2'ye Geç ve İlk Kapsayıcı Göreve Hazırlan ➡️
                    </button>
                  </div>
                </div>
              ` : capstone ? `
                <div class="lecture-capstone-card">
                  <div class="capstone-card-badge-row">
                    <span class="capstone-badge">🏆 AŞAMA ${lecture.milestoneNumber} SONU KAPSAYICI SENTEZ GÖREVİ</span>
                    <span class="capstone-diff-tag ${capstone.difficulty.toLowerCase()}">${capstone.difficulty}</span>
                    <span class="capstone-scope-tag">${this.escapeHtml(capstone.cumulativeStages || '')}</span>
                  </div>

                  <h3 class="capstone-title">${this.escapeHtml(capstone.title)}</h3>
                  <p class="capstone-desc">${this.escapeHtml(capstone.scenario).replace(/\n/g, '<br/>')}</p>

                  <div class="capstone-task-box">
                    <div class="capstone-task-title">🎯 Sınav Görevi:</div>
                    <div class="capstone-task-content">${this.escapeHtml(capstone.task).replace(/\n/g, '<br/>')}</div>
                  </div>

                  <div class="capstone-meta-row">
                    <span class="capstone-opcodes-label">Kullanılacak Komutlar:</span>
                    <div class="capstone-opcodes-list">
                      ${capstone.opcodes.map(op => `<span class="capstone-op-pill">${op}</span>`).join('')}
                    </div>
                  </div>

                  <div class="capstone-card-actions">
                    <button id="btn-capstone-open-leetcode" class="btn-capstone-action primary" data-ch-id="${capstone.id}">
                      ⚡ Bu Kapsayıcı Görevi LeetCode Panelinde Çöz →
                    </button>
                    <button id="btn-capstone-load-editor" class="btn-capstone-action secondary" data-ch-id="${capstone.id}">
                      📝 Görev Şablonunu Editöre Aktar
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Capstone Navigation Footer -->
            <div class="module-nav-footer">
              <button class="btn-step-nav-action prev" data-target-step="sec-${lecture.sections.length - 1}">
                ⬅️ Son Modüle Dön (${lecture.sections.length}. Modül)
              </button>

              <button class="btn-step-toggle-complete ${completedSteps.includes('capstone') ? 'is-completed' : ''}" data-step-id="capstone">
                ${completedSteps.includes('capstone') ? '✓ Sınav Tamamlandı' : '⭕ Sınavı Tamamlandı Olarak İşaretle'}
              </button>

              ${nextKey ? `
                <button class="btn-jump-next-milestone primary" data-next-key="${nextKey}">
                  🚀 Sonraki Aşamaya Geç (${nextMilestoneNumber}. Aşama) ➡️
                </button>
              ` : '<div style="flex: 1;"></div>'}
            </div>
          </div>
        </div>

        <!-- Stage Navigation Footer -->
        <div class="lecture-doc-footer">
          <div class="footer-btn-group">
            ${prevKey ? `
              <button id="btn-lecture-prev" class="btn-lecture-nav prev" data-prev="${prevKey}">
                ⬅️ Önceki Aşama
              </button>
            ` : '<div style="flex:1;"></div>'}

            ${this.currentMilestoneId === 'milestone-1' ? `
              <button id="btn-lecture-jump-leetcode" class="btn-lecture-leetcode btn-lecture-start-ch" title="Aşama 2'ye geçerek ilk komutları öğrenin ve kodlama görevlerine başlayın">
                🚀 Aşama 2: İlk Komutlar ve Görevlere Başla ➡️
              </button>
            ` : `
              <button id="btn-lecture-jump-leetcode" class="btn-lecture-leetcode">
                ⚡ Bu Aşamanın LeetCode Görevlerini Çöz →
              </button>
            `}

            ${nextKey ? `
              <button id="btn-lecture-next" class="btn-lecture-nav next" data-next="${nextKey}">
                Sonraki Aşama ➡️
              </button>
            ` : '<div style="flex:1;"></div>'}
          </div>
        </div>
      </div>
    `;

    // Mount Interactive Example Workstations with code persistence & completion triggers
    lecture.sections.forEach((sec, secIdx) => {
      if (sec.examples && sec.examples.length > 0) {
        const mountEl = this.container.querySelector(`#example-mount-${secIdx}`) as HTMLElement;
        if (mountEl) {
          const widget = new InteractiveExampleWidget(
            mountEl,
            sec.examples[0],
            {
              onOpenInMainEditor: (title, code) => {
                this.callbacks.onOpenInMainEditor(title, code);
              },
              onStepCompleted: () => {
                LectureStorage.setStepCompleted(this.currentMilestoneId, `sec-${secIdx}`, true);
                this.updateProgressUI();
              }
            },
            sec.examples
          );
          this.exampleWidgets.push(widget);
        }
      }
    });

    this.attachEvents(prevKey, nextKey);
    this.attachInteractiveDemos();
  }

  private goToStep(stepId: string, autoMarkCurrentDone: boolean = false): void {
    const targetStep = this.stepList.find(s => s.id === stepId);
    if (!targetStep) return;

    if (autoMarkCurrentDone && this.currentStepId !== stepId) {
      LectureStorage.setStepCompleted(this.currentMilestoneId, this.currentStepId, true);
    }

    this.currentStepId = stepId;
    LectureStorage.setLastActiveStep(this.currentMilestoneId, stepId);

    // Update Tab Pills Active State
    this.container.querySelectorAll<HTMLButtonElement>('.stepper-tab-pill').forEach(btn => {
      const id = btn.getAttribute('data-step-id');
      if (id === stepId) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Panes Display
    this.container.querySelectorAll<HTMLElement>('.lecture-step-pane').forEach(pane => {
      const pId = pane.getAttribute('data-pane-id');
      pane.style.display = pId === stepId ? 'block' : 'none';
    });

    this.updateProgressUI();

    // Scroll to the top of the stepper area
    const stepper = this.container.querySelector('.lecture-stepper-container');
    if (stepper) {
      stepper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private toggleStepComplete(stepId: string): void {
    const isDone = LectureStorage.isStepCompleted(this.currentMilestoneId, stepId);
    LectureStorage.setStepCompleted(this.currentMilestoneId, stepId, !isDone);
    this.updateProgressUI();
  }

  private updateProgressUI(): void {
    const currentStepIdx = this.stepList.findIndex(s => s.id === this.currentStepId);
    const totalSteps = this.stepList.length;
    const currentStepObj = this.stepList[currentStepIdx] || this.stepList[0];

    const completedSteps = LectureStorage.getCompletedSteps(this.currentMilestoneId);
    const completedCount = this.stepList.filter(s => completedSteps.includes(s.id)).length;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    // Update Progress Fill and Percent Text
    const progressFill = this.container.querySelector('.stepper-progress-fill') as HTMLElement | null;
    if (progressFill) {
      progressFill.style.width = `${progressPercent}%`;
    }

    const percentBadge = this.container.querySelector('.stepper-percent-badge') as HTMLElement | null;
    if (percentBadge) {
      percentBadge.textContent = `%${progressPercent} Tamamlandı (${completedCount}/${totalSteps} Adım)`;
    }

    const stepIndicator = this.container.querySelector('.stepper-step-indicator') as HTMLElement | null;
    if (stepIndicator) {
      stepIndicator.textContent = `Adım ${currentStepIdx + 1} / ${totalSteps}`;
    }

    const activeTitle = this.container.querySelector('.stepper-active-title') as HTMLElement | null;
    if (activeTitle && currentStepObj) {
      activeTitle.textContent = currentStepObj.fullTitle;
    }

    // Quick nav buttons
    const btnQuickPrev = this.container.querySelector('.btn-step-quick.prev') as HTMLButtonElement | null;
    const btnQuickNext = this.container.querySelector('.btn-step-quick.next') as HTMLButtonElement | null;
    if (btnQuickPrev) btnQuickPrev.disabled = currentStepIdx <= 0;
    if (btnQuickNext) btnQuickNext.disabled = currentStepIdx >= totalSteps - 1;

    // Update tab pills checkmarks
    this.stepList.forEach(step => {
      const isDone = completedSteps.includes(step.id);
      const pill = this.container.querySelector(`.stepper-tab-pill[data-step-id="${step.id}"]`) as HTMLElement | null;
      if (pill) {
        if (isDone) {
          pill.classList.add('completed');
        } else {
          pill.classList.remove('completed');
        }
        const badgeEl = pill.querySelector('.tab-pill-badge');
        if (badgeEl) {
          badgeEl.textContent = isDone ? '✓' : step.badge;
        }
      }
    });

    // Update current active pane's toggle button
    const toggleBtn = this.container.querySelector(`.btn-step-toggle-complete[data-step-id="${this.currentStepId}"]`) as HTMLButtonElement | null;
    if (toggleBtn) {
      const isDone = completedSteps.includes(this.currentStepId);
      if (isDone) {
        toggleBtn.classList.add('is-completed');
        toggleBtn.innerHTML = '✓ Bu Adım Tamamlandı';
      } else {
        toggleBtn.classList.remove('is-completed');
        toggleBtn.innerHTML = '⭕ Tamamlandı Olarak İşaretle';
      }
    }
  }

  private attachEvents(prevKey: string | null, nextKey: string | null): void {
    // Breadcrumb roadmap link
    this.container.querySelector('.bc-roadmap-link')?.addEventListener('click', () => {
      this.callbacks.onNavigateToRoadmap?.();
    });

    // Tab pills click
    this.container.querySelectorAll<HTMLButtonElement>('.stepper-tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const stepId = btn.getAttribute('data-step-id');
        if (stepId) {
          this.goToStep(stepId);
        }
      });
    });

    // Quick prev / next buttons at top
    const btnQuickPrev = this.container.querySelector('.btn-step-quick.prev') as HTMLButtonElement | null;
    const btnQuickNext = this.container.querySelector('.btn-step-quick.next') as HTMLButtonElement | null;

    btnQuickPrev?.addEventListener('click', () => {
      const currentIdx = this.stepList.findIndex(s => s.id === this.currentStepId);
      if (currentIdx > 0) {
        this.goToStep(this.stepList[currentIdx - 1].id);
      }
    });

    btnQuickNext?.addEventListener('click', () => {
      const currentIdx = this.stepList.findIndex(s => s.id === this.currentStepId);
      if (currentIdx < this.stepList.length - 1) {
        this.goToStep(this.stepList[currentIdx + 1].id, true);
      }
    });

    // In-module nav actions (Next / Prev buttons)
    this.container.querySelectorAll<HTMLButtonElement>('.btn-step-nav-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStep = btn.getAttribute('data-target-step');
        const isNext = btn.classList.contains('next') || btn.classList.contains('primary');
        if (targetStep) {
          this.goToStep(targetStep, isNext);
        }
      });
    });

    // Toggle complete button
    this.container.querySelectorAll<HTMLButtonElement>('.btn-step-toggle-complete').forEach(btn => {
      btn.addEventListener('click', () => {
        const stepId = btn.getAttribute('data-step-id');
        if (stepId) {
          this.toggleStepComplete(stepId);
        }
      });
    });

    // Next milestone button inside Capstone pane
    this.container.querySelector('.btn-jump-next-milestone')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const targetMilestone = btn.getAttribute('data-next-key');
      if (targetMilestone) {
        this.callbacks.onNavigateToMilestoneLecture(targetMilestone);
      }
    });

    // Stage level Previous / Next Navigation
    if (prevKey) {
      this.container.querySelector('#btn-lecture-prev')?.addEventListener('click', () => {
        this.callbacks.onNavigateToMilestoneLecture(prevKey);
      });
    }

    if (nextKey) {
      this.container.querySelector('#btn-lecture-next')?.addEventListener('click', () => {
        this.callbacks.onNavigateToMilestoneLecture(nextKey);
      });
    }

    // Leetcode arena button
    this.container.querySelector('#btn-lecture-jump-leetcode')?.addEventListener('click', () => {
      if (this.currentMilestoneId === 'milestone-1') {
        this.callbacks.onNavigateToMilestoneLecture('milestone-2');
      } else {
        this.callbacks.onNavigateToLeetCodeMilestone(this.currentMilestoneId);
      }
    });

    // Milestone 1 Capstone action
    this.container.querySelector('#btn-capstone-m1-next')?.addEventListener('click', () => {
      this.callbacks.onNavigateToMilestoneLecture('milestone-2');
    });

    // Capstone LeetCode open button
    const btnOpenLeetCode = this.container.querySelector('#btn-capstone-open-leetcode') as HTMLButtonElement | null;
    if (btnOpenLeetCode) {
      btnOpenLeetCode.addEventListener('click', () => {
        const chId = btnOpenLeetCode.getAttribute('data-ch-id') || undefined;
        this.callbacks.onNavigateToLeetCodeMilestone(this.currentMilestoneId, chId);
      });
    }

    // Capstone Load Editor button
    const btnLoadEditor = this.container.querySelector('#btn-capstone-load-editor') as HTMLButtonElement | null;
    if (btnLoadEditor) {
      btnLoadEditor.addEventListener('click', () => {
        const chId = btnLoadEditor.getAttribute('data-ch-id');
        if (chId && CHALLENGES[chId]) {
          const ch = CHALLENGES[chId];
          this.callbacks.onOpenInMainEditor(ch.title, ch.starterCode);
        }
      });
    }
  }

  private attachInteractiveDemos(): void {
    // 1. 20-Bit Physical Address Calculator
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

    // 2. Little-Endian Visualizer
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
