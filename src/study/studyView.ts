import { STUDY_TOPICS, MainTopic, SubLesson, StudyTask } from './studyData.js';
import { StudyStorage } from './studyStorage.js';
import { StudyRunner, StudyGradeResult } from './studyRunner.js';

export interface StudyViewCallbacks {
  onReturnToEditor: () => void;
  onInsertCodeToEditor: (code: string) => void;
}

export class StudyView {
  private container: HTMLElement;
  private callbacks: StudyViewCallbacks;

  private selectedTopic: MainTopic | null = null;
  private selectedSubLesson: SubLesson | null = null;
  private isDrawerOpen: boolean = false;
  private searchQuery: string = '';

  // Elements
  private mapContainer!: HTMLElement;
  private drawerEl!: HTMLElement;
  private searchInputEl!: HTMLInputElement;
  private statsPillEl!: HTMLElement;

  constructor(container: HTMLElement, callbacks: StudyViewCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.render();
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="study-root">
        <!-- Top Toolbar -->
        <header class="study-topbar">
          <div class="study-topbar-left">
            <button class="btn-study-back" id="btn-study-return" title="Editöre Geri Dön">
              <span class="icon">❮</span>
              <span>Editör</span>
            </button>
            <div class="study-brand">
              <span class="study-brand-icon">🎓</span>
              <div>
                <h3 class="study-brand-title">8086 Assembly Dersleri & Zihin Haritası</h3>
                <p class="study-brand-subtitle">Adım Adım Müfredat, İnteraktif Not Defteri ve Pratik Görevler</p>
              </div>
            </div>
          </div>

          <div class="study-topbar-right">
            <div class="study-search-box">
              <span class="search-icon">🔍</span>
              <input type="text" id="study-search-input" placeholder="Konu, komut (MOV, JMP...) veya kavram ara..." value="${this.escapeHtml(this.searchQuery)}" />
            </div>

            <div class="study-stats-pill" id="study-stats-pill">
              <!-- Rendered dynamically -->
            </div>

            <button class="btn-study-reset" id="btn-study-reset" title="Çözülen test ve görev ilerlemesini sıfırla">
              ↺ Sıfırla
            </button>
          </div>
        </header>

        <!-- Main Workspace: Mind Map Area & Slide-in Drawer -->
        <div class="study-main-area">
          <div class="study-map-container" id="study-map-container">
            <!-- Mind Map SVG and Nodes -->
          </div>

          <!-- Slide-in Study Notebook Drawer -->
          <aside class="study-notebook-drawer ${this.isDrawerOpen ? 'open' : ''}" id="study-notebook-drawer">
            <!-- Rendered by renderDrawer() -->
          </aside>
        </div>
      </div>
    `;

    this.mapContainer = this.container.querySelector('#study-map-container') as HTMLElement;
    this.drawerEl = this.container.querySelector('#study-notebook-drawer') as HTMLElement;
    this.searchInputEl = this.container.querySelector('#study-search-input') as HTMLInputElement;
    this.statsPillEl = this.container.querySelector('#study-stats-pill') as HTMLElement;

    this.updateStats();
    this.renderMindMap();
    this.renderDrawer();
    this.bindEvents();
  }

  private updateStats(): void {
    let totalQuizzes = 0;
    let completedQuizzes = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.quiz) {
          totalQuizzes++;
          if (StudyStorage.isQuizPassed(sub.quiz.id)) completedQuizzes++;
        }
        if (sub.task) {
          totalTasks++;
          if (StudyStorage.isTaskPassed(sub.task.id)) completedTasks++;
        }
      }
    }

    const total = totalQuizzes + totalTasks;
    const completed = completedQuizzes + completedTasks;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.statsPillEl.innerHTML = `
      <div class="stats-progress-ring-wrap" title="${completed}/${total} Adım Tamamlandı">
        <span class="stats-label">İlerleme:</span>
        <strong class="stats-percent">%${percent}</strong>
        <div class="stats-mini-bar">
          <div class="stats-mini-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }

  private renderMindMap(): void {
    const q = this.searchQuery.trim().toLowerCase();
    const filteredTopics = STUDY_TOPICS.filter(t => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.opcodes.some(op => op.toLowerCase().includes(q)) ||
        t.subLessons.some(s => s.title.toLowerCase().includes(q))
      );
    });

    // Draw Mind Map as interactive nodes connected by svg paths
    let svgLines = '';
    // SVG dimensions
    const width = 1200;
    const height = 750;

    for (const topic of STUDY_TOPICS) {
      const fromX = (topic.mindMap.x / 100) * width;
      const fromY = (topic.mindMap.y / 100) * height;

      for (const targetId of topic.mindMap.connections) {
        const target = STUDY_TOPICS.find(t => t.id === targetId);
        if (target) {
          const toX = (target.mindMap.x / 100) * width;
          const toY = (target.mindMap.y / 100) * height;

          // Smooth bezier curve
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;
          svgLines += `
            <path d="M ${fromX} ${fromY} Q ${midX} ${fromY} ${toX} ${toY}" 
                  class="mindmap-line" />
          `;
        }
      }
    }

    const nodesHtml = filteredTopics.map(topic => {
      const isSelected = this.selectedTopic?.id === topic.id;
      const subCount = topic.subLessons.length;
      
      // Calculate topic completion
      let topicTasks = 0;
      let topicPassed = 0;
      for (const s of topic.subLessons) {
        if (s.quiz) {
          topicTasks++;
          if (StudyStorage.isQuizPassed(s.quiz.id)) topicPassed++;
        }
        if (s.task) {
          topicTasks++;
          if (StudyStorage.isTaskPassed(s.task.id)) topicPassed++;
        }
      }
      const isCompleted = topicTasks > 0 && topicPassed === topicTasks;

      return `
        <div class="mindmap-node-card ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}" 
             data-topic-id="${topic.id}"
             style="left: ${topic.mindMap.x}%; top: ${topic.mindMap.y}%;">
          <div class="node-badge-row">
            <span class="node-badge">${topic.badge}</span>
            ${isCompleted ? '<span class="node-check-badge">✓ Tamamlandı</span>' : `<span class="node-progress-badge">${topicPassed}/${topicTasks}</span>`}
          </div>

          <div class="node-main-content">
            <div class="node-icon">${topic.icon}</div>
            <div class="node-info">
              <h4 class="node-title">${topic.shortTitle}</h4>
              <p class="node-summary">${topic.summary}</p>
            </div>
          </div>

          <div class="node-opcodes-strip">
            ${topic.opcodes.slice(0, 5).map(op => `<span class="opcode-tag">${op}</span>`).join('')}
            ${topic.opcodes.length > 5 ? `<span class="opcode-more">+${topic.opcodes.length - 5}</span>` : ''}
          </div>

          <div class="node-footer-action">
            <span class="sublesson-count">📖 ${subCount} Alt Ders</span>
            <button class="btn-node-open" title="Not Defterinde Aç">Not Defterini Aç ❯</button>
          </div>
        </div>
      `;
    }).join('');

    this.mapContainer.innerHTML = `
      <div class="mindmap-canvas-inner" style="min-width: ${width}px; min-height: ${height}px;">
        <svg class="mindmap-svg-layer" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#94a3b8" />
              <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>
          </defs>
          ${svgLines}
        </svg>
        ${nodesHtml}
      </div>
    `;

    // Re-bind node clicks
    this.mapContainer.querySelectorAll('.mindmap-node-card').forEach(el => {
      el.addEventListener('click', (e) => {
        const topicId = el.getAttribute('data-topic-id');
        if (topicId) {
          const topic = STUDY_TOPICS.find(t => t.id === topicId);
          if (topic) {
            this.openTopicDrawer(topic);
          }
        }
      });
    });
  }

  public openTopicDrawer(topic: MainTopic, subLessonId?: string): void {
    this.selectedTopic = topic;
    if (subLessonId) {
      this.selectedSubLesson = topic.subLessons.find(s => s.id === subLessonId) || topic.subLessons[0];
    } else {
      this.selectedSubLesson = topic.subLessons[0];
    }
    this.isDrawerOpen = true;

    this.renderDrawer();
    this.drawerEl.classList.add('open');
    this.renderMindMap(); // refresh selected state
  }

  public closeDrawer(): void {
    this.isDrawerOpen = false;
    this.drawerEl.classList.remove('open');
    this.renderMindMap();
  }

  private renderDrawer(): void {
    if (!this.selectedTopic || !this.selectedSubLesson) {
      this.drawerEl.innerHTML = '';
      return;
    }

    const topic = this.selectedTopic;
    const sub = this.selectedSubLesson;

    // Check completion of sublesson
    const isQuizPassed = sub.quiz ? StudyStorage.isQuizPassed(sub.quiz.id) : true;
    const isTaskPassed = sub.task ? StudyStorage.isTaskPassed(sub.task.id) : true;
    const isSubCompleted = isQuizPassed && isTaskPassed;

    this.drawerEl.innerHTML = `
      <div class="notebook-wrapper">
        <!-- Notebook Header -->
        <div class="notebook-header">
          <div class="notebook-header-top">
            <span class="notebook-badge">${topic.badge} • BÖLÜM ${topic.number}</span>
            <button class="btn-notebook-close" id="btn-notebook-close" title="Not Defterini Kapat (ESC)">✕</button>
          </div>
          <div class="notebook-title-row">
            <span class="notebook-icon">${topic.icon}</span>
            <div>
              <h2 class="notebook-title">${topic.title}</h2>
              <p class="notebook-subtitle">${topic.summary}</p>
            </div>
          </div>

          <!-- Sub-Lesson Tabs -->
          <div class="notebook-tabs-bar">
            ${topic.subLessons.map(sl => {
              const active = sl.id === sub.id;
              const qOk = sl.quiz ? StudyStorage.isQuizPassed(sl.quiz.id) : true;
              const tOk = sl.task ? StudyStorage.isTaskPassed(sl.task.id) : true;
              const done = qOk && tOk;

              return `
                <button class="notebook-tab-item ${active ? 'active' : ''} ${done ? 'done' : ''}" 
                        data-sub-id="${sl.id}">
                  <span class="tab-dot">${done ? '✓' : sl.number}</span>
                  <span class="tab-text">${sl.title}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Notebook Body (3-Step Guided Study Flow) -->
        <div class="notebook-body">
          <div class="notebook-paper-sheet">
            <div class="notebook-sheet-header">
              <span class="sheet-subnum">${sub.number}</span>
              <h3 class="sheet-title">${sub.title}</h3>
              ${isSubCompleted ? '<span class="sheet-completed-pill">✓ Tamamlandı</span>' : ''}
            </div>

            <!-- ADIM 1: DERS ANLATIMI -->
            <section class="notebook-step-section">
              <div class="step-header">
                <span class="step-circle">1</span>
                <div>
                  <h4 class="step-title">Ders Anlatımı & Altın Kurallar</h4>
                  <p class="step-desc">Konunun teorik temelleri, formülleri ve çalışan örnek kodları</p>
                </div>
              </div>
              <div class="step-content">
                ${sub.theoryHtml}
              </div>
            </section>

            <!-- ADIM 2: MİNİ KAVRAM TESTİ -->
            ${sub.quiz ? this.renderQuizSection(sub.quiz) : ''}

            <!-- ADIM 3: PRATİK KODLAMA GÖREVİ -->
            ${sub.task ? this.renderTaskSection(sub.task) : ''}
          </div>
        </div>
      </div>
    `;

    this.bindDrawerEvents();
  }

  private renderQuizSection(quiz: any): string {
    const isPassed = StudyStorage.isQuizPassed(quiz.id);

    return `
      <section class="notebook-step-section quiz-section">
        <div class="step-header">
          <span class="step-circle">2</span>
          <div>
            <h4 class="step-title">Mini Kavram & Durum Tahmin Testi</h4>
            <p class="step-desc">Tek tıkla konuyu anlama testi (Sınav tarzı soru)</p>
          </div>
          ${isPassed ? '<span class="quiz-status-badge success">✓ Doğru Cevaplandı</span>' : ''}
        </div>
        <div class="step-content">
          <div class="quiz-card" data-quiz-id="${quiz.id}">
            <p class="quiz-question">${quiz.question}</p>
            ${quiz.codeSnippet ? `<pre class="quiz-code-snippet"><code>${this.escapeHtml(quiz.codeSnippet)}</code></pre>` : ''}
            
            <div class="quiz-options-list">
              ${quiz.options.map((opt: string, idx: number) => {
                return `
                  <button class="quiz-option-btn ${isPassed && idx === quiz.correctIndex ? 'correct' : ''}" 
                          data-idx="${idx}">
                    <span class="opt-label">${String.fromCharCode(65 + idx)}</span>
                    <span class="opt-text">${this.escapeHtml(opt)}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="quiz-feedback-box" style="${isPassed ? 'display: block;' : 'display: none;'}">
              <div class="feedback-text">
                💡 <strong>Açıklama:</strong> ${quiz.explanation}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private renderTaskSection(task: StudyTask): string {
    const isPassed = StudyStorage.isTaskPassed(task.id);
    const initialCode = StudyStorage.getUserTaskCode(task.id, task.starterCode);

    return `
      <section class="notebook-step-section task-section">
        <div class="step-header">
          <span class="step-circle">3</span>
          <div>
            <h4 class="step-title">Pratik Kodlama Görevi</h4>
            <p class="step-desc">${this.escapeHtml(task.title)} (${task.difficulty})</p>
          </div>
          ${isPassed ? '<span class="task-status-badge success">✓ Görev Geçildi</span>' : ''}
        </div>

        <div class="step-content">
          <div class="task-card" data-task-id="${task.id}">
            <div class="task-prompt-box">
              <p><strong>🎯 Görev:</strong> ${this.escapeHtml(task.taskPrompt)}</p>
              ${task.scenario ? `<p class="task-scenario-note"><strong>Senaryo:</strong> ${this.escapeHtml(task.scenario)}</p>` : ''}
            </div>

            <!-- In-place Mini Code Editor -->
            <div class="task-editor-wrap">
              <div class="task-editor-toolbar">
                <span class="task-editor-label">Assembly Kodu:</span>
                <div class="task-toolbar-actions">
                  <button class="btn-task-tool btn-show-hint" title="İpucu Göster">💡 İpucu</button>
                  <button class="btn-task-tool btn-show-solution" title="Örnek Çözümü İncele">👁️ Çözümü Göster</button>
                  <button class="btn-task-tool btn-open-ide" title="Bu Kodu Ana IDE Simülatörüne Gönder">🚀 Ana Editörde Aç</button>
                </div>
              </div>
              <textarea class="task-code-textarea" spellcheck="false" placeholder="Assembly kodunuzu buraya yazın...">${this.escapeHtml(initialCode)}</textarea>
            </div>

            <div class="task-hints-box" style="display: none;">
              <ul>
                ${task.hints.map(h => `<li>${this.escapeHtml(h)}</li>`).join('')}
              </ul>
            </div>

            <div class="task-solution-box" style="display: none;">
              <div class="solution-header">
                <span>Model Çözüm Kodu:</span>
                <button class="btn-copy-solution">Kodu Kopyala</button>
              </div>
              <pre class="solution-code"><code>${this.escapeHtml(task.solutionCode)}</code></pre>
              ${task.examTip ? `<p class="solution-tip">💡 <strong>Sınav İpucu:</strong> ${this.escapeHtml(task.examTip)}</p>` : ''}
            </div>

            <!-- Test Execution Actions & Feedback -->
            <div class="task-exec-row">
              <button class="btn-task-grade" id="btn-grade-${task.id}">
                <span>▶️</span> Kodu Test Et & Notlandır
              </button>
            </div>

            <div class="task-result-box" style="display: none;"></div>
          </div>
        </div>
      </section>
    `;
  }

  private bindEvents(): void {
    // Return to editor
    const returnBtn = this.container.querySelector('#btn-study-return');
    returnBtn?.addEventListener('click', () => {
      this.callbacks.onReturnToEditor();
    });

    // Search input
    this.searchInputEl?.addEventListener('input', () => {
      this.searchQuery = this.searchInputEl.value;
      this.renderMindMap();
    });

    // Reset Progress
    const resetBtn = this.container.querySelector('#btn-study-reset');
    resetBtn?.addEventListener('click', () => {
      if (confirm('Tüm ders test ve görev ilerlemenizi sıfırlamak istediğinize emin misiniz?')) {
        StudyStorage.resetProgress();
        this.updateStats();
        this.renderMindMap();
        if (this.selectedTopic) {
          this.renderDrawer();
        }
      }
    });

    // ESC to close drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isDrawerOpen) {
        this.closeDrawer();
      }
    });
  }

  private bindDrawerEvents(): void {
    // Close Drawer
    const closeBtn = this.drawerEl.querySelector('#btn-notebook-close');
    closeBtn?.addEventListener('click', () => {
      this.closeDrawer();
    });

    // Sub-lesson Tabs
    this.drawerEl.querySelectorAll('.notebook-tab-item').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const subId = tabBtn.getAttribute('data-sub-id');
        if (subId && this.selectedTopic) {
          const sub = this.selectedTopic.subLessons.find(s => s.id === subId);
          if (sub) {
            this.selectedSubLesson = sub;
            this.renderDrawer();
          }
        }
      });
    });

    // Quiz Options
    const quizCard = this.drawerEl.querySelector('.quiz-card');
    if (quizCard && this.selectedSubLesson?.quiz) {
      const quiz = this.selectedSubLesson.quiz;
      const optionBtns = quizCard.querySelectorAll<HTMLButtonElement>('.quiz-option-btn');
      const feedbackBox = quizCard.querySelector('.quiz-feedback-box') as HTMLElement;

      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
          if (idx === quiz.correctIndex) {
            btn.classList.add('correct');
            feedbackBox.style.display = 'block';
            StudyStorage.markQuizPassed(quiz.id);
            this.updateStats();
            this.renderMindMap();
          } else {
            btn.classList.add('incorrect');
            setTimeout(() => btn.classList.remove('incorrect'), 1000);
          }
        });
      });
    }

    // Task Execution
    const taskCard = this.drawerEl.querySelector('.task-card');
    if (taskCard && this.selectedSubLesson?.task) {
      const task = this.selectedSubLesson.task;
      const textarea = taskCard.querySelector('.task-code-textarea') as HTMLTextAreaElement;
      const gradeBtn = taskCard.querySelector(`#btn-grade-${task.id}`) as HTMLButtonElement;
      const resultBox = taskCard.querySelector('.task-result-box') as HTMLElement;
      const hintBtn = taskCard.querySelector('.btn-show-hint');
      const hintsBox = taskCard.querySelector('.task-hints-box') as HTMLElement;
      const solBtn = taskCard.querySelector('.btn-show-solution');
      const solBox = taskCard.querySelector('.task-solution-box') as HTMLElement;
      const openIdeBtn = taskCard.querySelector('.btn-open-ide');
      const copySolBtn = taskCard.querySelector('.btn-copy-solution');

      // Auto save draft code on input
      textarea?.addEventListener('input', () => {
        StudyStorage.saveUserTaskCode(task.id, textarea.value);
      });

      // Toggle hint
      hintBtn?.addEventListener('click', () => {
        hintsBox.style.display = hintsBox.style.display === 'none' ? 'block' : 'none';
      });

      // Toggle solution
      solBtn?.addEventListener('click', () => {
        solBox.style.display = solBox.style.display === 'none' ? 'block' : 'none';
      });

      // Copy solution
      copySolBtn?.addEventListener('click', () => {
        navigator.clipboard.writeText(task.solutionCode);
        copySolBtn.textContent = 'Kopyalandı! ✓';
        setTimeout(() => copySolBtn.textContent = 'Kodu Kopyala', 2000);
      });

      // Open in main IDE
      openIdeBtn?.addEventListener('click', () => {
        const code = textarea.value;
        this.callbacks.onInsertCodeToEditor(code);
      });

      // Grade Task
      gradeBtn?.addEventListener('click', () => {
        const code = textarea.value;
        gradeBtn.disabled = true;
        gradeBtn.innerHTML = '<span>⏳</span> Test Ediliyor...';

        setTimeout(() => {
          const res: StudyGradeResult = StudyRunner.grade(task, code);
          gradeBtn.disabled = false;
          gradeBtn.innerHTML = '<span>▶️</span> Kodu Test Et & Notlandır';

          resultBox.style.display = 'block';

          if (res.success) {
            StudyStorage.markTaskPassed(task.id);
            this.updateStats();
            this.renderMindMap();

            resultBox.className = 'task-result-box success';
            resultBox.innerHTML = `
              <div class="res-badge success">✓ BAŞARILI (${res.steps} Adım)</div>
              <p class="res-msg">${res.message}</p>
              ${this.renderDiffTable(res.diffs)}
            `;
          } else {
            resultBox.className = 'task-result-box error';
            resultBox.innerHTML = `
              <div class="res-badge error">✕ ${res.status}</div>
              <p class="res-msg">${res.message}</p>
              ${this.renderDiffTable(res.diffs)}
            `;
          }
        }, 80);
      });
    }
  }

  private renderDiffTable(diffs: any[]): string {
    if (!diffs || diffs.length === 0) return '';
    return `
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
            ${diffs.map(d => `
              <tr class="${d.matched ? 'diff-match' : 'diff-mismatch'}">
                <td><code>${d.target}</code></td>
                <td><code>${d.expected}</code></td>
                <td><code>${d.actual}</code></td>
                <td>${d.matched ? '✓ Uyumlu' : '✕ Hata'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
