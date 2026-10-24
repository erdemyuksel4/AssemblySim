import { CPU } from '../cpu/cpu.js';
import { Assembler, AsmResult } from '../assembler/assembler.js';
import { Editor } from './editor.js';
import { RegisterPanel } from './registerPanel.js';
import { MemoryView } from './memoryView.js';
import { TooltipManager } from './tooltip.js';
import { InstructionDoc, ManualTab } from './instructionDoc.js';
import { ConsoleView } from './console.js';
import { CpuInstanceManager } from '../cpu/instanceManager.js';
import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceDocument } from '../workspace/types.js';
import { WorkspaceSidebar } from './sidebar.js';
import { CpuModal } from './cpuModal.js';
import { CHALLENGES } from '../challenges/challengesData.js';
import { ChallengeRunner } from '../challenges/runner.js';
import { ChallengePanel } from './challengePanel.js';
import { LectureDocumentView } from '../lectures/lectureDocumentView.js';
import { MILESTONE_LECTURES } from '../lectures/lectureData.js';

export type ExecutionSpeed = '0.5' | '1' | '2';

const DEFAULT_CODE = `ORG 100H

START:
  MOV AX, 5
  MOV BX, 10
  ADD AX, BX
  HLT
`;

export class App {
  private cpu: CPU;
  private cpuManager: CpuInstanceManager;
  private workspace: WorkspaceManager;
  private sidebar!: WorkspaceSidebar;
  private cpuModal!: CpuModal;
  private instructionDoc!: InstructionDoc;
  private challengePanel!: ChallengePanel;
  private lectureDocView!: LectureDocumentView;

  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;
  private consoleView!: ConsoleView;

  private currentAsmResult: AsmResult | null = null;
  private ipToLineMap: Map<number, number> = new Map();
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private currentSpeed: ExecutionSpeed = '1';
  private wasRunningBeforeInput: boolean = false;
  private isSplitMode: boolean = false;
  private secondaryDocType: 'lecture' | 'reference' = 'reference';
  private secondaryRefTab: ManualTab = 'manual';
  private secondaryMilestoneId: string = 'milestone-1';

  constructor() {
    this.cpuManager = new CpuInstanceManager();
    this.workspace = new WorkspaceManager(this.cpuManager);
    const activeDoc = this.workspace.getActiveDocument();
    const activeCpu = this.cpuManager.getOrDefaultInstance(activeDoc?.cpuInstanceId);
    this.cpu = activeCpu.cpu;

    TooltipManager.init();
    this.initLayout();
    this.initModules();
    this.editor.setCode(activeDoc?.code || DEFAULT_CODE);
    this.compile();
  }

  private initLayout(): void {
    const appEl = document.getElementById('app');
    if (!appEl) throw new Error('#app root missing');

    appEl.innerHTML = `
      <div class="app-layout-root">
        <!-- Collapsible Full-Height Left Sidebar Mount -->
        <div id="sidebar-mount"></div>

        <!-- Main Workspace Area -->
        <div class="app-main-content" id="app-main-content">
          <!-- Primary Pane (Left in Split View, or Full in Single View) -->
          <div class="workspace-pane pane-primary" id="pane-primary">
            <main class="main-layout" id="main-ide-layout">
              <!-- Left Section: Code Editor -->
              <section class="editor-section">
                <div class="editor-header-bar">
                  <h2 class="editor-title">
                    Code Editor
                    <span class="info-btn" data-info-title="8086 Assembly Editörü" data-info-desc="DOS COM / EMU8086 sözdizimine uygun assembly kodu yazın. Satır numaralarına tıklayarak kesme noktası (Breakpoint) koyabilirsiniz. Kısayollar: Ctrl+Z (Geri Al), Ctrl+Y / Ctrl+Shift+Z (Yinele), Tab / Shift+Tab (4 boşluk girintile / geri çek), Enter (Oto-girinti), Ctrl+/ veya Ctrl+; (Yorum aç/kapa), Ctrl+D (Satır çoğalt), Alt+Yukarı/Aşağı (Satır taşı), Ctrl+Shift+K (Satır sil), F10 (Adım), F5 (Çalıştır)." tabindex="-1">i</span>
                  </h2>
                  <div class="editor-toolbar-right">
                    <!-- Format Switch (HEX / DEC / BIN) -->
                    <div class="format-switch-group">
                      <button class="btn-fmt active" data-fmt="hex">HEX</button>
                      <button class="btn-fmt" data-fmt="dec">DEC</button>
                      <button class="btn-fmt" data-fmt="bin">BIN</button>
                      <span class="info-btn" data-info-title="Sayı Formatı Seçici" data-info-desc="Yazmaç değerlerini Onaltılık (HEX), Onluk (DEC) veya İkilik (BIN) tabanda görüntüler." tabindex="-1">i</span>
                    </div>

                    <!-- Speed Switch (0.5x / 1x / 2x) -->
                    <div class="speed-switch-group">
                      <button class="btn-speed" data-speed="0.5" title="0.5x Yavaş (600ms)">0.5x</button>
                      <button class="btn-speed active" data-speed="1" title="1x Normal Hız (300ms)">1x</button>
                      <button class="btn-speed" data-speed="2" title="2x Hızlı (100ms)">2x</button>
                      <span class="info-btn" data-info-title="Çalışma Hızı" data-info-desc="RUN ile çalıştırma hızını ayarlar. 0.5x: Yavaş adım (600ms), 1x: Normal hız (300ms), 2x: Hızlı adım (100ms)." tabindex="-1">i</span>
                    </div>

                    <!-- Split View Toggle Button (Tek / Çift Pencere Modu) -->
                    <button id="btn-split-toggle" class="btn-ctrl btn-split-toggle" title="Çift Pencere Moduna Geç (Yan Yana Çalış)">
                      <span class="split-icon">◫</span>
                      <span class="split-text">Çift Pencere</span>
                    </button>

                    <button id="btn-compile" class="btn-compile">COMPILE</button>
                    <button id="btn-run" class="btn-ctrl">RUN</button>
                    <button id="btn-next" class="btn-ctrl">NEXT</button>
                    <button id="btn-stop" class="btn-ctrl" disabled>STOP</button>
                    <button id="btn-reset" class="btn-ctrl">RESET</button>
                    <button id="btn-step-back" class="btn-ctrl btn-step-back" title="Geri Adım Al (Step Back)" disabled>↶</button>
                    <button id="btn-complete-and-test" class="btn-complete-and-test" style="display: none;" title="Görevi Doğrula ve Tamamla">
                      <span class="btn-icon">⚡</span> Tamamla ve Test Et
                    </button>
                  </div>
                </div>

                <div id="editor-container"></div>
                <div id="console-container" class="console-section-wrapper"></div>
              </section>

              <!-- Right Section: Registers, Segments, Pointers, Flags, Memory, and Challenge Box -->
              <section class="cpu-section">
                <div id="registers-container"></div>
                <div id="memory-container"></div>
                <div id="challenge-box-container" class="challenge-box-container"></div>
              </section>
            </main>

            <!-- Full Lecture Document View Mount (shown when active doc is a lecture) -->
            <div id="lecture-doc-mount" class="lecture-doc-mount" style="display: none;"></div>

            <!-- Full Reference & Learning Document View Mount (shown when active doc is a reference doc) -->
            <div id="reference-doc-mount" class="reference-doc-mount" style="display: none;"></div>
          </div>

          <!-- Draggable Split Resizer Divider -->
          <div class="split-resizer" id="split-resizer" style="display: none;" title="Genişliği Ayarla (Sürükleyin)">
            <div class="resizer-handle"></div>
          </div>

          <!-- Secondary Pane (Right in Split View) -->
          <div class="workspace-pane pane-secondary" id="pane-secondary" style="display: none;">
            <div class="secondary-pane-header" id="secondary-pane-header">
              <div class="secondary-pane-title-wrap">
                <span class="secondary-pane-icon" id="secondary-pane-icon">📖</span>
                <span class="secondary-pane-title" id="secondary-pane-title">8086 Komut Manueli</span>
              </div>
              <div class="secondary-pane-quick-nav">
                <button class="btn-sec-nav active" data-sec-nav="manual" title="8086 Komut Seti Manueli">📖 Manuel</button>
                <button class="btn-sec-nav" data-sec-nav="lectures" title="Dersler & Teori Kataloğu">🎓 Dersler</button>
                <button class="btn-sec-nav" data-sec-nav="leetcode" title="8086 LeetCode Arenası">⚡ LeetCode</button>
                <button class="btn-sec-nav" data-sec-nav="roadmap" title="Müfredat Yol Haritası">🗺️ Yol Haritası</button>
              </div>
              <div class="secondary-pane-actions">
                <button id="btn-secondary-fullscreen" class="btn-pane-action" title="Tam Ekrana Genişlet">⤢</button>
                <button id="btn-secondary-close" class="btn-pane-action btn-close-pane" title="Bölünmüş Ekranı Kapat (Tek Ekrana Dön)">✕</button>
              </div>
            </div>

            <div class="secondary-pane-content" id="secondary-pane-content"></div>
          </div>
        </div>
      </div>
    `;
  }

  private initModules(): void {
    const sidebarMount = document.getElementById('sidebar-mount')!;
    const editorContainer = document.getElementById('editor-container')!;
    const consoleContainer = document.getElementById('console-container')!;
    const registersContainer = document.getElementById('registers-container')!;
    const memoryContainer = document.getElementById('memory-container')!;
    const docsContainer = document.getElementById('reference-doc-mount')!;

    this.registerPanel = new RegisterPanel(registersContainer);
    this.memoryView = new MemoryView(memoryContainer);

    this.sidebar = new WorkspaceSidebar(
      sidebarMount,
      this.workspace,
      this.cpuManager,
      {
        onDocumentSelect: (doc) => this.switchToDocument(doc),
        onNewDocument: () => {
          const count = this.workspace.getAllDocuments().length + 1;
          const newDoc = this.workspace.openDocument({
            title: `program${count}.asm`,
            type: 'custom',
            code: DEFAULT_CODE
          });
          this.switchToDocument(newDoc);
        },
        onOpenCpuModal: () => this.cpuModal.open(),
        onOpenLearningDoc: (tab) => this.openLearningDocument(tab),
        onSplitDocument: (doc) => this.splitWithDocument(doc),
        onSplitLearningDoc: (tab) => this.openInSecondaryPane('reference', tab)
      }
    );

    this.cpuModal = new CpuModal(this.cpuManager, this.workspace, {
      onCpuChanged: () => {
        const doc = this.workspace.getActiveDocument();
        const cpuInst = this.cpuManager.getOrDefaultInstance(doc?.cpuInstanceId);
        this.cpu = cpuInst.cpu;
        this.updateViews();
        this.sidebar.render();
      },
      onDocumentCpuRemapped: (doc) => {
        const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
        this.cpu = cpuInst.cpu;
        this.compile();
        this.updateViews();
        this.sidebar.render();
      }
    });

    this.instructionDoc = new InstructionDoc(docsContainer, {
      onLoadChallengeToEditor: (ch) => {
        const doc = this.workspace.openDocument({
          title: `Görev: ${ch.title}`,
          type: 'challenge',
          challengeId: ch.id,
          code: ch.starterCode
        });
        this.switchToDocument(doc);
        this.sidebar.render();
        // Smooth scroll to editor
        document.querySelector('.editor-section')?.scrollIntoView({ behavior: 'smooth' });
      },
      onOpenLectureDocument: (milestoneId) => {
        if (this.isSplitMode) {
          this.openInSecondaryPane('lecture', milestoneId);
        } else {
          this.openMilestoneLecture(milestoneId);
        }
      },
      onReturnToEditor: () => {
        this.returnToEditor();
      },
      onTabChange: (tab) => {
        this.syncReferenceDocumentTab(tab);
      },
      getCurrentEditorCode: () => this.editor.getCode()
    });

    const lectureMount = document.getElementById('lecture-doc-mount')!;
    this.lectureDocView = new LectureDocumentView(lectureMount, {
      onNavigateToMilestoneLecture: (milestoneId: string) => {
        if (this.isSplitMode) {
          this.openInSecondaryPane('lecture', milestoneId);
        } else {
          this.openMilestoneLecture(milestoneId);
        }
      },
      onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => {
        if (this.isSplitMode) {
          this.openInSecondaryPane('reference', 'leetcode');
          this.instructionDoc.filterLeetCodeByMilestone(milestoneId, challengeId);
        } else {
          this.openLearningDocument('leetcode');
          this.instructionDoc.filterLeetCodeByMilestone(milestoneId, challengeId);
        }
      },
      onNavigateToRoadmap: () => {
        if (this.isSplitMode) {
          this.openInSecondaryPane('reference', 'roadmap');
        } else {
          this.openLearningDocument('roadmap');
        }
      },
      onOpenInMainEditor: (title: string, code: string) => {
        const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newDoc = this.workspace.openDocument({
          title: `ornek-${cleanTitle}.asm`,
          type: 'custom',
          code
        });
        this.switchToDocument(newDoc);
        this.sidebar.render();
      }
    });

    this.consoleView = new ConsoleView(consoleContainer, {
      onInput: (input) => {
        this.cpu.feedInput(input);
        this.consoleView.setWaitingForInput(false);
        if (this.wasRunningBeforeInput) {
          this.wasRunningBeforeInput = false;
          this.run();
        } else {
          this.step();
        }
      }
    });

    this.editor = new Editor({
      container: editorContainer,
      initialCode: '',
      onCodeChange: () => {
        this.editor.clearErrors();
        this.workspace.updateActiveCode(this.editor.getCode());
        // Enable COMPILE button when code changes
        const btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
        if (btnCompile) btnCompile.disabled = false;
      }
    });

    const challengeContainer = document.getElementById('challenge-box-container')!;
    this.challengePanel = new ChallengePanel(challengeContainer, {
      onTestChallenge: (ch, code) => {
        this.workspace.updateActiveCode(code);
        this.consoleView.clear();
        this.consoleView.log(`🧪 '${ch.title}' görevi test ediliyor...`, 'info');

        const result = ChallengeRunner.grade(ch, code);

        if (result.status === 'COMPILE_ERROR' && result.compileError) {
          this.editor.setErrors([result.compileError]);
          this.consoleView.log(`❌ [Derleme Hatası] Satır ${result.compileError.line}: ${result.compileError.message}`, 'error');
          const statusBadge = document.getElementById('console-status-badge') as HTMLElement;
          if (statusBadge) {
            statusBadge.textContent = 'DERLEME HATASI';
            statusBadge.className = 'console-status-badge error';
          }
        } else if (result.status === 'RUNTIME_ERROR') {
          this.consoleView.log(`❌ [Çalışma Hatası]: ${result.runtimeError || 'Hata'}`, 'error');
          const statusBadge = document.getElementById('console-status-badge') as HTMLElement;
          if (statusBadge) {
            statusBadge.textContent = 'ÇALIŞMA HATASI';
            statusBadge.className = 'console-status-badge error';
          }
        } else if (result.status === 'TIMEOUT') {
          this.consoleView.log(`⏱️ [Zaman Aşımı]: Program ${result.stepCount} adımda durmadı (Sonsuz döngü kontrolü yapın).`, 'warn');
        } else if (result.status === 'FAILED') {
          this.consoleView.log(`❌ [Test Başarısız]: Bazı beklenen değerler karşılanamadı:`, 'error');
          result.diffs.filter(d => !d.passed).forEach(d => {
            this.consoleView.log(`  • ${d.target}: Beklenen ${d.expected}, Gerçek ${d.actual}${d.message ? ` (${d.message})` : ''}`, 'warn');
          });
        } else if (result.status === 'PASSED') {
          this.editor.clearErrors();
          this.consoleView.log(`✅ [Tebrikler] '${ch.title}' tüm testleri başarıyla geçti! (${result.stepCount} adım, ${result.executionTimeMs} ms)`, 'success');
          const statusBadge = document.getElementById('console-status-badge') as HTMLElement;
          if (statusBadge) {
            statusBadge.textContent = 'BAŞARILI';
            statusBadge.className = 'console-status-badge ready';
          }
        }

        return result;
      },
      onResetEnvironment: () => {
        this.reset();
      },
      onNavigateToLeetCode: () => {
        this.openLearningDocument('leetcode');
      },
      onLoadNextChallenge: (nextCh) => {
        const doc = this.workspace.openDocument({
          title: `Görev: ${nextCh.title}`,
          type: 'challenge',
          challengeId: nextCh.id,
          code: nextCh.starterCode
        });
        this.switchToDocument(doc);
        this.sidebar.render();
      },
      getCurrentCode: () => this.editor.getCode()
    });

    this.attachButtonEvents();
    this.initSplitResizer();
    this.updateViews();

    // Initial check for active document challenge status
    const initialDoc = this.workspace.getActiveDocument();
    if (initialDoc && initialDoc.type === 'challenge' && initialDoc.challengeId) {
      this.challengePanel.setChallenge(CHALLENGES[initialDoc.challengeId] || null);
      const btn = document.getElementById('btn-complete-and-test');
      if (btn) btn.style.display = 'inline-flex';
    }
  }

  toggleSplitView(forceState?: boolean, targetDoc?: { type: 'lecture' | 'reference'; milestoneId?: string; referenceTab?: ManualTab }): void {
    const newState = forceState !== undefined ? forceState : !this.isSplitMode;
    this.isSplitMode = newState;

    const mainContent = document.getElementById('app-main-content');
    const panePrimary = document.getElementById('pane-primary');
    const paneSecondary = document.getElementById('pane-secondary');
    const splitResizer = document.getElementById('split-resizer');
    const btnSplit = document.getElementById('btn-split-toggle');
    const refDocMount = document.getElementById('reference-doc-mount');
    const lectureDocMount = document.getElementById('lecture-doc-mount');
    const secContent = document.getElementById('secondary-pane-content');

    if (!mainContent || !panePrimary || !paneSecondary || !splitResizer || !refDocMount || !lectureDocMount || !secContent) return;

    if (this.isSplitMode) {
      mainContent.classList.add('split-active');
      paneSecondary.style.display = 'flex';
      splitResizer.style.display = 'flex';
      btnSplit?.classList.add('active');
      if (btnSplit) {
        btnSplit.innerHTML = `
          <span class="split-icon">🗖</span>
          <span class="split-text">Tek Pencere</span>
        `;
        btnSplit.title = 'Tek Pencere Moduna Geç (Ortala)';
      }

      // Move doc mounts to secondary pane content
      secContent.appendChild(refDocMount);
      secContent.appendChild(lectureDocMount);

      // Ensure code editor is active on primary left pane
      const allDocs = this.workspace.getAllDocuments();
      const currentActive = this.workspace.getActiveDocument();
      if (!currentActive || currentActive.type === 'lecture' || currentActive.type === 'reference') {
        const codeDoc = allDocs.find(d => d.type === 'custom' || d.type === 'challenge' || d.type === 'example') || allDocs[0];
        if (codeDoc) {
          this.switchToDocument(codeDoc);
        }
      } else {
        const mainIdeLayout = document.getElementById('main-ide-layout');
        if (mainIdeLayout) mainIdeLayout.style.display = 'grid';
      }

      // Configure secondary right pane
      if (targetDoc) {
        if (targetDoc.type === 'lecture' && targetDoc.milestoneId) {
          this.openInSecondaryPane('lecture', targetDoc.milestoneId);
        } else if (targetDoc.type === 'reference' && targetDoc.referenceTab) {
          this.openInSecondaryPane('reference', targetDoc.referenceTab);
        }
      } else {
        this.openInSecondaryPane(this.secondaryDocType, this.secondaryDocType === 'lecture' ? this.secondaryMilestoneId : this.secondaryRefTab);
      }
    } else {
      mainContent.classList.remove('split-active');
      paneSecondary.style.display = 'none';
      splitResizer.style.display = 'none';
      panePrimary.style.width = '100%';
      paneSecondary.style.width = '50%';
      btnSplit?.classList.remove('active');
      if (btnSplit) {
        btnSplit.innerHTML = `
          <span class="split-icon">◫</span>
          <span class="split-text">Çift Pencere</span>
        `;
        btnSplit.title = 'Çift Pencere Moduna Geç (Yan Yana Çalış)';
      }

      // Move doc mounts back to primary pane
      panePrimary.appendChild(lectureDocMount);
      panePrimary.appendChild(refDocMount);

      // Re-sync current active document view
      const active = this.workspace.getActiveDocument();
      if (active) {
        this.switchToDocument(active);
      }
    }
    this.sidebar.render();
  }

  openInSecondaryPane(type: 'lecture' | 'reference', idOrTab?: string): void {
    if (!this.isSplitMode) {
      this.toggleSplitView(true, {
        type,
        milestoneId: type === 'lecture' ? (idOrTab || 'milestone-1') : undefined,
        referenceTab: type === 'reference' ? ((idOrTab as ManualTab) || 'manual') : undefined
      });
      return;
    }

    this.secondaryDocType = type;
    const refDocMount = document.getElementById('reference-doc-mount');
    const lectureDocMount = document.getElementById('lecture-doc-mount');
    const iconEl = document.getElementById('secondary-pane-icon');
    const titleEl = document.getElementById('secondary-pane-title');
    const secNavBtns = document.querySelectorAll('.btn-sec-nav');

    secNavBtns.forEach(b => b.classList.remove('active'));

    if (type === 'lecture') {
      const milestoneId = idOrTab || this.secondaryMilestoneId || 'milestone-1';
      this.secondaryMilestoneId = milestoneId;
      if (refDocMount) refDocMount.style.display = 'none';
      if (lectureDocMount) lectureDocMount.style.display = 'block';

      this.lectureDocView.setMilestone(milestoneId);
      const lecture = MILESTONE_LECTURES[milestoneId];
      if (iconEl) iconEl.textContent = '🎓';
      if (titleEl) titleEl.textContent = lecture ? `Aşama ${lecture.milestoneNumber}: ${lecture.title}` : 'Ders Anlatımı';
      document.querySelector('.btn-sec-nav[data-sec-nav="lectures"]')?.classList.add('active');
    } else {
      const tab = (idOrTab as ManualTab) || this.secondaryRefTab || 'manual';
      this.secondaryRefTab = tab;
      if (lectureDocMount) lectureDocMount.style.display = 'none';
      if (refDocMount) refDocMount.style.display = 'block';

      this.instructionDoc.openTab(tab);
      const tabTitles: Record<ManualTab, { icon: string; title: string }> = {
        manual: { icon: '📖', title: '8086 Komut Manueli' },
        lectures: { icon: '🎓', title: 'Dersler & Teori Kataloğu' },
        leetcode: { icon: '⚡', title: '8086 LeetCode Arenası' },
        roadmap: { icon: '🗺️', title: 'Müfredat Yol Haritası' }
      };
      const info = tabTitles[tab] || { icon: '📚', title: 'Öğrenme Merkezi' };
      if (iconEl) iconEl.textContent = info.icon;
      if (titleEl) titleEl.textContent = info.title;
      document.querySelector(`.btn-sec-nav[data-sec-nav="${tab}"]`)?.classList.add('active');
    }
  }

  splitWithDocument(doc: WorkspaceDocument): void {
    if (doc.type === 'lecture' && doc.milestoneId) {
      this.openInSecondaryPane('lecture', doc.milestoneId);
    } else if (doc.type === 'reference' && doc.referenceTab) {
      this.openInSecondaryPane('reference', doc.referenceTab);
    } else {
      this.switchToDocument(doc);
      if (!this.isSplitMode) {
        this.toggleSplitView(true);
      }
    }
  }

  private initSplitResizer(): void {
    const resizer = document.getElementById('split-resizer');
    const panePrimary = document.getElementById('pane-primary');
    const paneSecondary = document.getElementById('pane-secondary');
    const mainContent = document.getElementById('app-main-content');
    if (!resizer || !panePrimary || !paneSecondary || !mainContent) return;

    let isDragging = false;

    resizer.addEventListener('mousedown', () => {
      isDragging = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const rect = mainContent.getBoundingClientRect();
      const offset = e.clientX - rect.left;
      const totalWidth = rect.width;
      let percentage = (offset / totalWidth) * 100;
      if (percentage < 25) percentage = 25;
      if (percentage > 75) percentage = 75;

      panePrimary.style.width = `${percentage}%`;
      paneSecondary.style.width = `${100 - percentage}%`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });

    // Toggle button in editor toolbar
    document.getElementById('btn-split-toggle')?.addEventListener('click', () => {
      this.toggleSplitView();
    });

    // Close button on secondary pane
    document.getElementById('btn-secondary-close')?.addEventListener('click', () => {
      this.toggleSplitView(false);
    });

    // Fullscreen button on secondary pane
    document.getElementById('btn-secondary-fullscreen')?.addEventListener('click', () => {
      const docType = this.secondaryDocType;
      const milestoneId = this.secondaryMilestoneId;
      const refTab = this.secondaryRefTab;
      this.toggleSplitView(false);
      if (docType === 'lecture') {
        this.openMilestoneLecture(milestoneId);
      } else {
        this.openLearningDocument(refTab);
      }
    });

    // Quick nav buttons in secondary pane header
    document.querySelectorAll('.btn-sec-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        const secNav = btn.getAttribute('data-sec-nav') as ManualTab;
        if (secNav) {
          this.openInSecondaryPane('reference', secNav);
        }
      });
    });
  }

  openLearningDocument(tab: ManualTab): void {
    if (this.isSplitMode) {
      this.openInSecondaryPane('reference', tab);
      return;
    }

    const existingDoc = this.workspace.getAllDocuments().find(
      (d) => d.type === 'reference' && d.referenceTab === tab
    );
    if (existingDoc) {
      this.switchToDocument(existingDoc);
      this.sidebar.render();
      return;
    }

    const titles: Record<ManualTab, string> = {
      manual: '📖 Komut Manueli',
      lectures: '🎓 Dersler & Teori',
      leetcode: '⚡ LeetCode Arenası',
      roadmap: '🗺️ Yol Haritası'
    };

    const newDoc = this.workspace.openDocument({
      title: titles[tab] || '📚 Öğrenme Merkezi',
      type: 'reference',
      referenceTab: tab,
      code: `; 📚 ${titles[tab]}\n; 8086 Öğrenme ve Referans dokümanı.\n`
    });
    this.switchToDocument(newDoc);
    this.sidebar.render();
  }

  returnToEditor(): void {
    const allDocs = this.workspace.getAllDocuments();
    const editorDoc = allDocs.find((d) => d.type === 'custom' || d.type === 'challenge' || d.type === 'example') || allDocs[0];
    if (editorDoc) {
      this.switchToDocument(editorDoc);
      this.sidebar.render();
    }
  }

  syncReferenceDocumentTab(tab: ManualTab): void {
    const activeDoc = this.workspace.getActiveDocument();
    if (activeDoc && activeDoc.type === 'reference') {
      activeDoc.referenceTab = tab;
      const titles: Record<ManualTab, string> = {
        manual: '📖 Komut Manueli',
        lectures: '🎓 Dersler & Teori',
        leetcode: '⚡ LeetCode Arenası',
        roadmap: '🗺️ Yol Haritası'
      };
      activeDoc.title = titles[tab] || activeDoc.title;
      this.sidebar.render();
    }
  }

  openMilestoneLecture(milestoneId: string): void {
    if (this.isSplitMode) {
      this.openInSecondaryPane('lecture', milestoneId);
      return;
    }

    // Check if already open in workspace
    const existingDoc = this.workspace.getAllDocuments().find(
      (d) => d.type === 'lecture' && d.milestoneId === milestoneId
    );
    if (existingDoc) {
      this.switchToDocument(existingDoc);
      this.sidebar.render();
      return;
    }

    const lecture = MILESTONE_LECTURES[milestoneId];
    const title = lecture ? `Ders: ${lecture.title}` : `Aşama ${milestoneId} Dersi`;
    const newDoc = this.workspace.openDocument({
      title,
      type: 'lecture',
      milestoneId,
      code: `; 🎓 ${title}\n; Bu ders için interaktif örnekler dokümanın içinde yer almaktadır.\n`
    });
    this.switchToDocument(newDoc);
    this.sidebar.render();
  }

  switchToDocument(doc: WorkspaceDocument): void {
    if (this.isSplitMode) {
      if (doc.type === 'lecture' && doc.milestoneId) {
        this.openInSecondaryPane('lecture', doc.milestoneId);
        this.sidebar.render();
        return;
      }
      if (doc.type === 'reference' && doc.referenceTab) {
        this.openInSecondaryPane('reference', doc.referenceTab);
        this.sidebar.render();
        return;
      }
    }

    this.stop();
    const currentActive = this.workspace.getActiveDocument();
    if (currentActive && currentActive.id !== doc.id) {
      if (currentActive.type !== 'lecture' && currentActive.type !== 'reference') {
        this.workspace.updateActiveCode(this.editor.getCode());
      }
    }

    this.workspace.setActiveDocument(doc.id);
    const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
    this.cpu = cpuInst.cpu;

    const mainIdeLayout = document.getElementById('main-ide-layout');
    const lectureDocMount = document.getElementById('lecture-doc-mount');
    const refDocMount = document.getElementById('reference-doc-mount');

    if (doc.type === 'lecture' && doc.milestoneId) {
      if (mainIdeLayout) mainIdeLayout.style.display = 'none';
      if (refDocMount) refDocMount.style.display = 'none';
      if (lectureDocMount) lectureDocMount.style.display = 'block';

      this.lectureDocView.setMilestone(doc.milestoneId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (doc.type === 'reference' && doc.referenceTab) {
      if (mainIdeLayout) mainIdeLayout.style.display = 'none';
      if (lectureDocMount) lectureDocMount.style.display = 'none';
      if (refDocMount) refDocMount.style.display = 'block';

      this.instructionDoc.openTab(doc.referenceTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (mainIdeLayout) mainIdeLayout.style.display = 'grid';
      if (lectureDocMount) lectureDocMount.style.display = 'none';
      if (refDocMount) refDocMount.style.display = 'none';

      this.editor.setCode(doc.code);
      this.consoleView.clear();
      if (this.cpu.consoleBuffer) {
        this.consoleView.appendStdout(this.cpu.consoleBuffer);
      }
      this.compile();
      this.updateViews();
    }
    this.sidebar.render();

    // Sync Challenge Panel & Top Toolbar Button
    const btnCompleteAndTest = document.getElementById('btn-complete-and-test') as HTMLButtonElement;
    if (doc.type === 'challenge' && doc.challengeId) {
      const ch = CHALLENGES[doc.challengeId] || null;
      this.challengePanel.setChallenge(ch);
      if (btnCompleteAndTest) btnCompleteAndTest.style.display = 'inline-flex';
    } else {
      this.challengePanel.setChallenge(null);
      if (btnCompleteAndTest) btnCompleteAndTest.style.display = 'none';
    }
  }

  private attachButtonEvents(): void {
    const btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
    const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
    const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
    const btnStepBack = document.getElementById('btn-step-back') as HTMLButtonElement;
    const btnCompleteAndTest = document.getElementById('btn-complete-and-test') as HTMLButtonElement;

    btnCompile.addEventListener('click', () => this.compile());
    btnNext.addEventListener('click', () => this.step());
    btnRun.addEventListener('click', () => this.run());
    btnStop.addEventListener('click', () => this.stop());
    btnReset.addEventListener('click', () => this.reset());
    btnStepBack.addEventListener('click', () => this.stepBack());
    if (btnCompleteAndTest) {
      btnCompleteAndTest.addEventListener('click', () => {
        this.challengePanel.executeTest();
      });
    }

    // Format Switch buttons (HEX, DEC, BIN)
    document.querySelectorAll('.btn-fmt').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-fmt').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const fmt = btn.getAttribute('data-fmt') as 'hex' | 'dec' | 'bin';
        this.registerPanel.setFormat(fmt);
        this.updateViews();
      });
    });

    // Speed Switch buttons (0.5x, 1x, 2x)
    document.querySelectorAll('.btn-speed').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-speed').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSpeed = (btn.getAttribute('data-speed') as ExecutionSpeed) || '1';
      });
    });

    // Keyboard shortcuts: F10 = NEXT, F5 = RUN/STOP
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        this.step();
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (this.isRunning) this.stop();
        else this.run();
      }
    });
  }

  private compile(): boolean {
    this.stop();
    const code = this.editor.getCode();
    const result = Assembler.assemble(code);
    this.currentAsmResult = result;

    const btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
    const statusBadge = document.getElementById('console-status-badge') as HTMLElement;

    this.consoleView.clear();
    if (result.errors.length > 0) {
      this.editor.setErrors(result.errors);
      if (statusBadge) {
        statusBadge.textContent = `${result.errors.length} DERLEME HATASI`;
        statusBadge.className = 'console-status-badge error';
      }
      result.errors.forEach(err => this.consoleView.log(`❌ [Derleme Hatası] Satır ${err.line}: ${err.message}`, 'error'));
      if (btnCompile) btnCompile.disabled = false;
      return false;
    }

    if (statusBadge) {
      statusBadge.textContent = 'HAZIR';
      statusBadge.className = 'console-status-badge ready';
    }

    this.editor.clearErrors();
    this.consoleView.log(`✓ Program başarıyla derlendi (${result.bytes.length} bayt). Giriş noktası: CS:${result.origin.toString(16).toUpperCase().padStart(4, '0')}h`, 'success');

    // Disable COMPILE button until user edits code
    if (btnCompile) btnCompile.disabled = true;

    // Load COM at CS:origin
    this.cpu.loadCOM(result.bytes, result.origin);

    // If active document is a challenge with predefined memory/registers, inject them
    this.applyChallengeEnvironmentIfAny();

    // Map IP to line
    this.ipToLineMap.clear();
    for (const item of result.listing) {
      this.ipToLineMap.set(item.addr, item.line);
    }

    // Set memory view to 00000h (or origin)
    const viewAddr = result.origin === 0x0100 ? 0x0000 : result.origin;
    this.memoryView.jumpToPhys(viewAddr);

    this.syncActiveLine();
    this.updateViews();

    const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
    if (btnRun) btnRun.disabled = false;
    if (btnNext) btnNext.disabled = false;

    return true;
  }

  private applyChallengeEnvironmentIfAny(): void {
    const activeDoc = this.workspace.getActiveDocument();
    if (activeDoc && activeDoc.type === 'challenge' && activeDoc.challengeId) {
      const challenge = CHALLENGES[activeDoc.challengeId];
      if (challenge && challenge.testSetup) {
        ChallengeRunner.applySetup(this.cpu, challenge.testSetup);
        const memCount = challenge.testSetup.initialMemory?.length || 0;
        const hasRegs = challenge.testSetup.initialRegisters !== undefined;
        if (memCount > 0 || hasRegs) {
          this.consoleView.log(`💡 Görev Ortamı Hazırlandı: ${hasRegs ? 'Yazmaçlar ' : ''}${memCount > 0 ? 've Ön Tanımlı Bellek Blokları' : ''} izole CPU ortamına yüklendi.`, 'info');
        }
        if (challenge.testSetup.initialMemory && challenge.testSetup.initialMemory.length > 0) {
          const first = challenge.testSetup.initialMemory[0];
          const phys = (first.segment << 4) + first.offset;
          this.memoryView.jumpToPhys(phys);
        }
      }
    }
  }

  private reset(): void {
    this.stop();
    this.consoleView.setWaitingForInput(false);
    if (this.currentAsmResult && this.currentAsmResult.errors.length === 0) {
      // Reload compiled binary at origin and restore initial program state
      this.cpu.loadCOM(this.currentAsmResult.bytes, this.currentAsmResult.origin);
      this.applyChallengeEnvironmentIfAny();
      this.syncActiveLine();
      this.consoleView.log('Program başlangıç durumuna sıfırlandı.', 'info');
    } else {
      this.cpu.reset();
      this.applyChallengeEnvironmentIfAny();
      this.editor.setActiveLine(null);
      this.consoleView.log('Simülatör sıfırlandı.', 'info');
    }

    const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
    if (btnRun) btnRun.disabled = false;
    if (btnNext) btnNext.disabled = false;

    this.updateViews();
  }

  private step(): void {
    const btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
    if (btnCompile && !btnCompile.disabled) {
      if (!this.compile()) return;
    }
    if (this.currentAsmResult && this.currentAsmResult.errors.length > 0) {
      return;
    }

    if (this.cpu.halted) {
      this.consoleView.log('Program sonlandı (HLT). Yeniden çalıştırmak için RESET butonuna basın.', 'info');
      return;
    }

    const info = this.cpu.step();

    if (info.error) {
      this.stop();
      const line = this.ipToLineMap.get(this.cpu.regs.ip) || 1;
      this.editor.setErrors([{ line, message: info.error }]);
      this.consoleView.log(`❌ [Çalışma Hatası] Satır ${line}: ${info.error}`, 'error');
      const statusBadge = document.getElementById('console-status-badge') as HTMLElement;
      if (statusBadge) {
        statusBadge.textContent = 'ÇALIŞMA HATASI';
        statusBadge.className = 'console-status-badge error';
      }
      return;
    }

    if (info.consoleText) {
      if (info.consoleText.startsWith('[')) {
        const isPort = info.consoleText.includes('Port');
        this.consoleView.log(info.consoleText, isPort ? 'port' : 'info');
      } else {
        this.consoleView.appendStdout(info.consoleText);
      }
    }

    if (info.waitingForInput) {
      this.wasRunningBeforeInput = false;
      this.stop();
      this.consoleView.setWaitingForInput(true);
      this.syncActiveLine();
      this.updateViews();
      return;
    }

    if (info.halted) {
      this.stop();
      this.consoleView.log('Program sonlandı (HLT).', 'warn');
    }

    this.syncActiveLine();
    this.updateViews(info.changedRegs, info.changedFlags);
  }

  private run(): void {
    if (this.isRunning) return;

    const btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
    if (btnCompile && !btnCompile.disabled) {
      if (!this.compile()) return;
    }
    if (this.currentAsmResult && this.currentAsmResult.errors.length > 0) {
      return;
    }

    if (this.cpu.halted) {
      this.reset();
    }

    this.isRunning = true;
    const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next') as HTMLButtonElement;

    if (btnRun) btnRun.disabled = true;
    if (btnStop) btnStop.disabled = false;
    if (btnNext) btnNext.disabled = true;

    const getDelay = (): number => {
      if (this.currentSpeed === '0.5') return 600;
      if (this.currentSpeed === '2') return 100;
      return 300; // '1' (default 1x)
    };

    const loop = () => {
      if (!this.isRunning) return;

      const currentLine = this.ipToLineMap.get(this.cpu.regs.ip);
      if (currentLine !== undefined && this.editor.isBreakpoint(currentLine)) {
        this.stop();
        this.consoleView.log(`Kesme noktasına ulaşıldı (Satır ${currentLine}).`, 'warn');
        this.syncActiveLine();
        this.updateViews();
        return;
      }

      const info = this.cpu.step();

      if (info.consoleText) {
        if (info.consoleText.startsWith('[')) {
          const isPort = info.consoleText.includes('Port');
          this.consoleView.log(info.consoleText, isPort ? 'port' : 'info');
        } else {
          this.consoleView.appendStdout(info.consoleText);
        }
      }

      if (info.waitingForInput) {
        this.wasRunningBeforeInput = true;
        this.stop();
        this.consoleView.setWaitingForInput(true);
        this.syncActiveLine();
        this.updateViews();
        return;
      }

      if (info.halted || info.error) {
        this.stop();
        if (info.error) {
          this.editor.setErrors([{ line: currentLine || 1, message: info.error }]);
          this.consoleView.log(`Çalışma Hatası: ${info.error}`, 'error');
        } else {
          this.consoleView.log('Program sonlandı (HLT).', 'warn');
        }
        this.syncActiveLine();
        this.updateViews();
        return;
      }

      this.syncActiveLine();
      this.updateViews();

      this.runTimer = window.setTimeout(loop, getDelay());
    };

    loop();
  }

  private stop(): void {
    this.isRunning = false;
    if (this.runTimer !== null) {
      clearTimeout(this.runTimer);
      this.runTimer = null;
    }

    const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next') as HTMLButtonElement;

    if (btnRun) btnRun.disabled = this.cpu.halted;
    if (btnStop) btnStop.disabled = true;
    if (btnNext) btnNext.disabled = this.cpu.halted;
  }

  private stepBack(): void {
    this.stop();
    if (this.cpu.stepBack()) {
      this.syncActiveLine();
      this.updateViews();
    }
  }

  private syncActiveLine(): void {
    const line = this.ipToLineMap.get(this.cpu.regs.ip);
    this.editor.setActiveLine(line !== undefined ? line : null);
  }

  private updateViews(changedRegs: string[] = [], changedFlags: string[] = []): void {
    this.registerPanel.update(this.cpu.regs, this.cpu.flags, changedRegs, changedFlags);
    this.memoryView.render(this.cpu.mem, this.cpu.regs);

    const btnStepBack = document.getElementById('btn-step-back') as HTMLButtonElement;
    if (btnStepBack) {
      btnStepBack.disabled = !this.cpu.canStepBack();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
