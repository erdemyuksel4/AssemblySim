import { MILESTONE_LECTURES, MilestoneLecture } from './lectureData.js';
import { InteractiveExampleWidget } from './interactiveExampleWidget.js';

export interface LectureDocCallbacks {
  onOpenInMainEditor: (title: string, code: string) => void;
  onNavigateToMilestoneLecture: (milestoneId: string) => void;
  onNavigateToLeetCodeMilestone: (milestoneId: string) => void;
}

export class LectureDocumentView {
  private container: HTMLElement;
  private currentMilestoneId: string = 'milestone-1';
  private callbacks: LectureDocCallbacks;
  private exampleWidgets: InteractiveExampleWidget[] = [];

  constructor(container: HTMLElement, callbacks: LectureDocCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  setMilestone(milestoneId: string): void {
    this.currentMilestoneId = milestoneId;
    this.render();
  }

  getMilestoneId(): string {
    return this.currentMilestoneId;
  }

  render(): void {
    const lecture = MILESTONE_LECTURES[this.currentMilestoneId] || MILESTONE_LECTURES['milestone-1'];
    this.exampleWidgets = [];

    const keys = Object.keys(MILESTONE_LECTURES);
    const currIdx = keys.indexOf(this.currentMilestoneId);
    const prevKey = currIdx > 0 ? keys[currIdx - 1] : null;
    const nextKey = currIdx < keys.length - 1 ? keys[currIdx + 1] : null;

    this.container.innerHTML = `
      <div class="lecture-doc-container">
        <!-- Top Navigation Breadcrumbs -->
        <div class="lecture-doc-breadcrumb">
          <span class="bc-item">🗺️ Yol Haritası</span>
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

        <!-- Overview Hero Card -->
        <div class="lecture-overview-mount">
          ${lecture.overviewHtml}
        </div>

        <!-- Sections & Interactive Examples -->
        <div class="lecture-sections-list">
          ${lecture.sections.map((sec, secIdx) => `
            <div class="lecture-section-card">
              <h3 class="lecture-sec-title">${this.escapeHtml(sec.title)}</h3>
              <div class="lecture-sec-content">
                ${sec.contentHtml}
              </div>

              ${sec.examples && sec.examples.length > 0 ? `
                <div class="lecture-examples-wrapper">
                  ${sec.examples.map((ex, exIdx) => `
                    <div id="example-mount-${secIdx}-${exIdx}" class="example-widget-mount"></div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Navigation Footer -->
        <div class="lecture-doc-footer">
          <div class="footer-btn-group">
            ${prevKey ? `
              <button id="btn-lecture-prev" class="btn-lecture-nav prev" data-prev="${prevKey}">
                ⬅️ Önceki Aşama
              </button>
            ` : '<div style="flex:1;"></div>'}

            <button id="btn-lecture-jump-leetcode" class="btn-lecture-leetcode">
              ⚡ Bu Aşamanın LeetCode Görevlerini Çöz →
            </button>

            ${nextKey ? `
              <button id="btn-lecture-next" class="btn-lecture-nav next" data-next="${nextKey}">
                Sonraki Aşama ➡️
              </button>
            ` : '<div style="flex:1;"></div>'}
          </div>
        </div>
      </div>
    `;

    // Mount Interactive Example Widgets
    lecture.sections.forEach((sec, secIdx) => {
      if (sec.examples) {
        sec.examples.forEach((ex, exIdx) => {
          const mountEl = this.container.querySelector(`#example-mount-${secIdx}-${exIdx}`) as HTMLElement;
          if (mountEl) {
            const widget = new InteractiveExampleWidget(mountEl, ex, {
              onOpenInMainEditor: (title, code) => {
                this.callbacks.onOpenInMainEditor(title, code);
              }
            });
            this.exampleWidgets.push(widget);
          }
        });
      }
    });

    this.attachEvents(prevKey, nextKey);
  }

  private attachEvents(prevKey: string | null, nextKey: string | null): void {
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

    this.container.querySelector('#btn-lecture-jump-leetcode')?.addEventListener('click', () => {
      this.callbacks.onNavigateToLeetCodeMilestone(this.currentMilestoneId);
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
