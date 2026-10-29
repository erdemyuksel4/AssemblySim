import { Assembler } from '../assembler/assembler.js';
import { TooltipManager } from './tooltip.js';
import { ManualTab } from './instructionDoc.js';
import { CpuInstanceManager } from '../cpu/instanceManager.js';
import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceDocument } from '../workspace/types.js';
import { WorkspaceSidebar, SplitPairInfo } from './sidebar.js';
import { CpuModal } from './cpuModal.js';
import { MILESTONE_LECTURES } from '../lectures/lectureData.js';
import { getTopicById } from '../lectures/topicStudyData.js';
import { PaneSession, ExecutionSpeed } from './paneSession.js';

export type { ExecutionSpeed };

const DEFAULT_CODE = `ORG 100H

START:
  MOV AX, 5
  MOV BX, 10
  ADD AX, BX
  HLT
`;

export class App {
  private cpuManager: CpuInstanceManager;
  private workspace: WorkspaceManager;
  private sidebar!: WorkspaceSidebar;
  private cpuModal!: CpuModal;

  // Pane Sessions
  private primaryPane!: PaneSession;
  private secondaryPane!: PaneSession;

  // Multi-Pane & Split State
  private isSplitMode: boolean = false;
  private activePane: 'primary' | 'secondary' = 'primary';
  private primaryDocId: string = 'doc-main';
  private secondaryDocId: string | null = null;
  private splitPairs: SplitPairInfo[] = [];
  private activePairId: string | null = null;

  constructor() {
    this.cpuManager = new CpuInstanceManager();
    this.workspace = new WorkspaceManager(this.cpuManager);
    const activeDoc = this.workspace.getActiveDocument();
    this.primaryDocId = activeDoc ? activeDoc.id : 'doc-main';

    TooltipManager.init();
    this.initLayout();
    this.initModules();
    this.openDocumentInPane('primary', activeDoc || this.workspace.getAllDocuments()[0]);
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
          <!-- Drop Overlay for Drag & Drop Window Placement & Splitting -->
          <div class="workspace-drop-overlay" id="workspace-drop-overlay" style="display: none;">
            <div class="drop-zone-box left-zone" id="drop-zone-left">
              <div class="drop-zone-indicator">
                <span class="drop-zone-icon">📄</span>
                <span class="drop-zone-text" id="drop-zone-left-text">Sol Panele Aç</span>
              </div>
            </div>
            <div class="drop-zone-box right-zone" id="drop-zone-right">
              <div class="drop-zone-indicator">
                <span class="drop-zone-icon">◫</span>
                <span class="drop-zone-text" id="drop-zone-right-text">Sağa Böl (Yeni Pencere)</span>
              </div>
            </div>
          </div>

          <!-- Primary Pane (Left in Split View, or Full in Single View) -->
          <div class="workspace-pane pane-primary pane-focused" id="pane-primary" tabindex="0">
            <main class="main-layout" id="main-ide-layout">
              <!-- Top Full-Width Row: Challenge Goal & Test Bar -->
              <div id="challenge-box-container" class="challenge-box-container" style="display: none;"></div>

              <!-- Left Section: Code Editor -->
              <section class="editor-section">
                <div class="editor-header-bar">
                  <h2 class="editor-title" id="primary-editor-title-wrap" title="Sürükleyip sağ panele bırakabilirsiniz">
                    <span id="primary-editor-title-text">Code Editor</span>
                    <span class="cpu-badge" id="primary-ide-cpu-badge" style="margin-left: 6px;">CPU-1</span>
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

                    <button id="btn-compile" class="btn-compile" title="Kodu derle">COMPILE<span class="compile-dirty-dot" style="display: none;" title="Derlenmemiş değişiklikler var"></span></button>
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

              <!-- Right Section: Registers, Segments, Pointers, Flags, Memory -->
              <section class="cpu-section">
                <div id="registers-container"></div>
                <div id="memory-container"></div>
              </section>
            </main>

            <!-- Full Lecture Document View Mount (shown when active doc in primary pane is a lecture) -->
            <div id="lecture-doc-mount" class="lecture-doc-mount" style="display: none;"></div>

            <!-- Full Reference & Learning Document View Mount (shown when active doc in primary pane is a reference doc) -->
            <div id="reference-doc-mount" class="reference-doc-mount" style="display: none;"></div>
          </div>

          <!-- Draggable Split Resizer Divider -->
          <div class="split-resizer" id="split-resizer" style="display: none;" title="Genişliği Ayarla (Sürükleyin)">
            <div class="resizer-handle"></div>
          </div>

          <!-- Secondary Pane (Right in Split View) -->
          <div class="workspace-pane pane-secondary" id="pane-secondary" style="display: none;" tabindex="0">
            <!-- Secondary Header (Used when showing reference or lecture documents) -->
            <div class="secondary-pane-header" id="secondary-pane-header" style="display: none;">
              <div class="secondary-pane-title-wrap" id="secondary-pane-title-wrap" draggable="true" title="Sürükleyip sol panele bırakabilirsiniz">
                <span class="secondary-pane-icon" id="secondary-pane-icon">📖</span>
                <span class="secondary-pane-title" id="secondary-pane-title">Referans & Kaynak</span>
              </div>
              <div class="secondary-pane-actions">
                <button class="btn-sec-nav" data-sec-nav="manual" title="Komut Manueli">Komutlar</button>
                <button class="btn-sec-nav" data-sec-nav="lectures" title="Dersler & Teori">Dersler</button>
                <button class="btn-sec-nav" data-sec-nav="leetcode" title="LeetCode Arenası">LeetCode</button>
                <button class="btn-sec-nav" data-sec-nav="studynotes" title="Çalışma Notları">Çalışma Notları</button>
                <button class="btn-sec-close" id="btn-secondary-close" title="Pencereyi Kapat">✕</button>
              </div>
            </div>

            <!-- Secondary IDE Layout (Used when opening an assembly or challenge code doc in secondary pane) -->
            <main class="main-layout sec-ide-layout" id="sec-ide-layout" style="display: none;">
              <div id="sec-challenge-box-container" class="challenge-box-container" style="display: none;"></div>
              
              <section class="editor-section">
                <div class="editor-header-bar">
                  <h2 class="editor-title" id="sec-editor-title-wrap" draggable="true" title="Sürükleyip sol panele bırakabilirsiniz">
                    <span id="sec-editor-title-text">Secondary Editor</span>
                    <span class="cpu-badge" id="sec-ide-cpu-badge" style="margin-left: 6px;">CPU-2</span>
                    <button class="btn-sec-ide-close" id="btn-sec-ide-close" title="Pencereyi Kapat">✕</button>
                  </h2>
                  <div class="editor-toolbar-right">
                    <!-- Format Switch for Secondary -->
                    <div class="format-switch-group">
                      <button class="btn-fmt active" data-sec-fmt="hex">HEX</button>
                      <button class="btn-fmt" data-sec-fmt="dec">DEC</button>
                      <button class="btn-fmt" data-sec-fmt="bin">BIN</button>
                    </div>

                    <!-- Speed Switch for Secondary -->
                    <div class="speed-switch-group">
                      <button class="btn-speed" data-sec-speed="0.5" title="0.5x Yavaş (600ms)">0.5x</button>
                      <button class="btn-speed active" data-sec-speed="1" title="1x Normal Hız (300ms)">1x</button>
                      <button class="btn-speed" data-sec-speed="2" title="2x Hızlı (100ms)">2x</button>
                    </div>

                    <button id="btn-sec-compile" class="btn-compile" title="Kodu derle">COMPILE<span class="compile-dirty-dot" style="display: none;" title="Derlenmemiş değişiklikler var"></span></button>
                    <button id="btn-sec-run" class="btn-ctrl">RUN</button>
                    <button id="btn-sec-next" class="btn-ctrl">NEXT</button>
                    <button id="btn-sec-stop" class="btn-ctrl" disabled>STOP</button>
                    <button id="btn-sec-reset" class="btn-ctrl">RESET</button>
                    <button id="btn-sec-step-back" class="btn-ctrl btn-step-back" title="Geri Adım Al (Step Back)" disabled>↶</button>
                    <button id="btn-sec-complete-and-test" class="btn-complete-and-test" style="display: none;" title="Görevi Doğrula ve Tamamla">
                      <span class="btn-icon">⚡</span> Tamamla ve Test Et
                    </button>
                  </div>
                </div>

                <div id="sec-editor-container"></div>
                <div id="sec-console-container" class="console-section-wrapper"></div>
              </section>

              <section class="cpu-section">
                <div id="sec-registers-container"></div>
                <div id="sec-memory-container"></div>
              </section>
            </main>

            <div id="sec-lecture-doc-mount" class="lecture-doc-mount" style="display: none;"></div>
            <div id="sec-reference-doc-mount" class="reference-doc-mount" style="display: none;"></div>
          </div>
        </div>
      </div>
    `;
  }

  private initModules(): void {
    const sidebarMount = document.getElementById('sidebar-mount')!;

    // 1. Primary Pane Session
    this.primaryPane = new PaneSession(
      'primary',
      this.cpuManager.getOrDefaultInstance().cpu,
      {
        container: document.getElementById('pane-primary')!,
        ideLayout: document.getElementById('main-ide-layout'),
        editorContainer: document.getElementById('editor-container')!,
        consoleContainer: document.getElementById('console-container')!,
        registersContainer: document.getElementById('registers-container')!,
        memoryContainer: document.getElementById('memory-container')!,
        challengeBoxContainer: document.getElementById('challenge-box-container')!,
        lectureDocMount: document.getElementById('lecture-doc-mount')!,
        referenceDocMount: document.getElementById('reference-doc-mount')!,
        editorTitleText: document.getElementById('primary-editor-title-text'),
        cpuBadge: document.getElementById('primary-ide-cpu-badge'),
        statusBadge: document.getElementById('console-status-badge'),
        btnCompile: document.getElementById('btn-compile') as HTMLButtonElement,
        btnRun: document.getElementById('btn-run') as HTMLButtonElement,
        btnNext: document.getElementById('btn-next') as HTMLButtonElement,
        btnStop: document.getElementById('btn-stop') as HTMLButtonElement,
        btnReset: document.getElementById('btn-reset') as HTMLButtonElement,
        btnStepBack: document.getElementById('btn-step-back') as HTMLButtonElement,
        btnCompleteAndTest: document.getElementById('btn-complete-and-test') as HTMLButtonElement,
        formatButtonsSelector: '.btn-fmt:not([data-sec-fmt])',
        speedButtonsSelector: '.btn-speed:not([data-sec-speed])',
        formatAttr: 'data-fmt',
        speedAttr: 'data-speed'
      },
      {
        onCodeChange: (docId, code, scroll) => {
          this.workspace.updateDocumentCode(docId, code);
          const doc = this.workspace.getDocument(docId);
          if (doc) doc.editorScroll = scroll;
        },
        onDirtyChange: () => {},
        onOpenLearningDoc: (tab) => {
          this.openLearningDocInPane('primary', tab);
        },
        onOpenMilestoneLecture: (milestoneId) => {
          if (this.isSplitMode) this.toggleSplitView(false);
          this.openMilestoneLectureInPane('primary', milestoneId);
          this.setActivePane('primary');
        },
        onReturnToEditor: () => {
          this.returnToEditorInPane('primary');
        },
        onTabChange: (tab) => {
          this.syncReferenceDocTab('primary', tab);
        },
        onOpenInMainEditor: (title, code) => {
          if (this.isSplitMode) this.toggleSplitView(false);
          const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const newDoc = this.workspace.openDocument({
            title: `ornek-${cleanTitle}.asm`,
            type: 'custom',
            code
          });
          this.openDocumentInPane('primary', newDoc);
          this.setActivePane('primary');
          this.sidebar.render();
        },
        onLoadChallengeToEditor: (ch) => {
          const doc = this.workspace.openDocument({
            title: `Görev: ${ch.title}`,
            type: 'challenge',
            challengeId: ch.id,
            code: ch.starterCode
          });
          this.openDocumentInPane(this.isSplitMode ? 'secondary' : 'primary', doc);
          if (this.isSplitMode) this.setActivePane('secondary');
          this.sidebar.render();
          document.querySelector('.editor-section')?.scrollIntoView({ behavior: 'smooth' });
        },
        onLoadNextChallenge: (nextCh) => {
          const doc = this.workspace.openDocument({
            title: `Görev: ${nextCh.title}`,
            type: 'challenge',
            challengeId: nextCh.id,
            code: nextCh.starterCode
          });
          this.openDocumentInPane('primary', doc);
          this.sidebar.render();
        },
        getDocument: (id) => this.workspace.getDocument(id),
        getAllDocuments: () => this.workspace.getAllDocuments(),
        getWorkspace: () => this.workspace
      }
    );

    // 2. Secondary Pane Session
    this.secondaryPane = new PaneSession(
      'secondary',
      this.cpuManager.getOrDefaultInstance().cpu,
      {
        container: document.getElementById('pane-secondary')!,
        ideLayout: document.getElementById('sec-ide-layout'),
        editorContainer: document.getElementById('sec-editor-container')!,
        consoleContainer: document.getElementById('sec-console-container')!,
        registersContainer: document.getElementById('sec-registers-container')!,
        memoryContainer: document.getElementById('sec-memory-container')!,
        challengeBoxContainer: document.getElementById('sec-challenge-box-container')!,
        lectureDocMount: document.getElementById('sec-lecture-doc-mount')!,
        referenceDocMount: document.getElementById('sec-reference-doc-mount')!,
        editorTitleText: document.getElementById('sec-editor-title-text'),
        cpuBadge: document.getElementById('sec-ide-cpu-badge'),
        statusBadge: null,
        btnCompile: document.getElementById('btn-sec-compile') as HTMLButtonElement,
        btnRun: document.getElementById('btn-sec-run') as HTMLButtonElement,
        btnNext: document.getElementById('btn-sec-next') as HTMLButtonElement,
        btnStop: document.getElementById('btn-sec-stop') as HTMLButtonElement,
        btnReset: document.getElementById('btn-sec-reset') as HTMLButtonElement,
        btnStepBack: document.getElementById('btn-sec-step-back') as HTMLButtonElement,
        btnCompleteAndTest: document.getElementById('btn-sec-complete-and-test') as HTMLButtonElement,
        formatButtonsSelector: '[data-sec-fmt]',
        speedButtonsSelector: '[data-sec-speed]',
        formatAttr: 'data-sec-fmt',
        speedAttr: 'data-sec-speed',
        secHeader: document.getElementById('secondary-pane-header'),
        secHeaderIcon: document.getElementById('secondary-pane-icon'),
        secHeaderTitle: document.getElementById('secondary-pane-title'),
        secNavSelector: '.btn-sec-nav'
      },
      {
        onCodeChange: (docId, code, scroll) => {
          this.workspace.updateDocumentCode(docId, code);
          const doc = this.workspace.getDocument(docId);
          if (doc) doc.editorScroll = scroll;
        },
        onDirtyChange: () => {},
        onOpenLearningDoc: (tab) => {
          this.openLearningDocInPane('secondary', tab);
        },
        onOpenMilestoneLecture: (milestoneId) => {
          this.openMilestoneLectureInPane('secondary', milestoneId);
        },
        onReturnToEditor: () => {
          this.returnToEditorInPane('secondary');
        },
        onTabChange: (tab) => {
          this.syncReferenceDocTab('secondary', tab);
        },
        onOpenInMainEditor: (title, code) => {
          const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const newDoc = this.workspace.openDocument({
            title: `ornek-${cleanTitle}.asm`,
            type: 'custom',
            code
          });
          this.openDocumentInPane('primary', newDoc);
          this.setActivePane('primary');
          this.sidebar.render();
        },
        onLoadChallengeToEditor: (ch) => {
          const doc = this.workspace.openDocument({
            title: `Görev: ${ch.title}`,
            type: 'challenge',
            challengeId: ch.id,
            code: ch.starterCode
          });
          this.openDocumentInPane('primary', doc);
          this.setActivePane('primary');
          this.sidebar.render();
        },
        onLoadNextChallenge: (nextCh) => {
          const doc = this.workspace.openDocument({
            title: `Görev: ${nextCh.title}`,
            type: 'challenge',
            challengeId: nextCh.id,
            code: nextCh.starterCode
          });
          this.openDocumentInPane('secondary', doc);
          this.sidebar.render();
        },
        getDocument: (id) => this.workspace.getDocument(id),
        getAllDocuments: () => this.workspace.getAllDocuments(),
        getWorkspace: () => this.workspace
      }
    );

    // 3. Workspace Sidebar
    this.sidebar = new WorkspaceSidebar(
      sidebarMount,
      this.workspace,
      this.cpuManager,
      {
        onDocumentSelect: (doc) => {
          if (this.isSplitMode) {
            this.toggleSplitView(false, undefined, false);
          }
          this.openDocumentInPane('primary', doc);
          this.setActivePane('primary');
        },
        onNewDocument: () => {
          if (this.isSplitMode) {
            this.toggleSplitView(false, undefined, false);
          }
          const count = this.workspace.getAllDocuments().length + 1;
          const newDoc = this.workspace.openDocument({
            title: `program${count}.asm`,
            type: 'custom',
            code: DEFAULT_CODE
          });
          this.openDocumentInPane('primary', newDoc);
          this.setActivePane('primary');
        },
        onOpenCpuModal: () => this.cpuModal.open(),
        onOpenLearningDoc: (tab) => {
          if (this.isSplitMode) {
            this.toggleSplitView(false, undefined, false);
          }
          this.openLearningDocInPane('primary', tab);
          this.setActivePane('primary');
        },
        onOpenOSSandbox: (projectId) => {
          if (this.isSplitMode) {
            this.toggleSplitView(false, undefined, false);
          }
          this.openLearningDocInPane('primary', 'ossandbox');
          this.setActivePane('primary');
        },
        onDocumentClosed: (docId) => {
          this.handleDocumentClosed(docId);
        },
        onSelectPane: (pane) => {
          this.setActivePane(pane);
        },
        onCloseSplit: () => {
          this.toggleSplitView(false, undefined, true);
        },
        onSelectPair: (pairId, pane) => {
          this.openSplitPair(pairId, pane);
        },
        onClosePair: (pairId) => {
          this.closeSplitPair(pairId);
        },
        onDropOnPane: (pane, rawData) => {
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.kind === 'workspace-doc' && parsed.docId) {
              const doc = this.workspace.getAllDocuments().find(d => d.id === parsed.docId);
              if (doc) {
                this.openDocumentInPane(pane, doc);
                this.setActivePane(pane);
              }
            } else if (parsed.kind === 'learning-doc' && parsed.tab) {
              this.openLearningDocInPane(pane, parsed.tab as ManualTab);
              this.setActivePane(pane);
            }
          } catch (err) {
            console.warn('Sidebar card drop error', err);
          }
        },
        getActiveDocId: () => {
          return this.activePane === 'primary' ? this.primaryDocId : (this.secondaryDocId || this.primaryDocId);
        },
        getOpenDocIds: () => {
          if (this.isSplitMode && this.secondaryDocId) {
            return [this.primaryDocId, this.secondaryDocId];
          }
          return [this.primaryDocId];
        },
        getSplitInfo: () => {
          const primDoc = this.workspace.getAllDocuments().find(d => d.id === this.primaryDocId) || null;
          const secDoc = (this.isSplitMode && this.secondaryDocId) ? 
            (this.workspace.getAllDocuments().find(d => d.id === this.secondaryDocId) || null) : null;
          return {
            isSplit: this.isSplitMode,
            primaryDoc: primDoc,
            secondaryDoc: secDoc,
            activePane: this.activePane
          };
        },
        getSplitPairs: () => this.splitPairs,
        getActivePairId: () => this.activePairId
      }
    );

    // 4. CPU Manager Modal
    this.cpuModal = new CpuModal(this.cpuManager, this.workspace, {
      onCpuChanged: () => {
        const activeDocId = this.activePane === 'primary' ? this.primaryDocId : (this.secondaryDocId || this.primaryDocId);
        const doc = this.workspace.getAllDocuments().find(d => d.id === activeDocId);
        const cpuInst = this.cpuManager.getOrDefaultInstance(doc?.cpuInstanceId);
        if (this.activePane === 'primary') {
          this.primaryPane.setCpu(cpuInst.cpu);
          this.primaryPane.updateViews();
        } else {
          this.secondaryPane.setCpu(cpuInst.cpu);
          this.secondaryPane.updateViews();
        }
        this.sidebar.render();
      },
      onDocumentCpuRemapped: (doc) => {
        if (this.primaryDocId === doc.id) {
          const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
          this.primaryPane.setCpu(cpuInst.cpu);
          this.primaryPane.compile();
          this.primaryPane.updateViews();
        }
        if (this.secondaryDocId === doc.id) {
          const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
          this.secondaryPane.setCpu(cpuInst.cpu);
          this.secondaryPane.compile();
          this.secondaryPane.updateViews();
        }
        this.sidebar.render();
      }
    });

    this.initSplitResizer();
    this.initDragAndDrop();
    this.initScrollTracking();
    this.attachGlobalKeyboardEvents();
  }

  private attachGlobalKeyboardEvents(): void {
    // Keyboard shortcuts: F10 = NEXT, F5 = RUN/STOP (targets active pane!)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        this.getActivePane().step();
      } else if (e.key === 'F5') {
        e.preventDefault();
        const pane = this.getActivePane();
        if (pane.isRunning) pane.stop();
        else pane.run();
      }
    });
  }

  private initScrollTracking(): void {
    const panePrimary = document.getElementById('pane-primary');
    const paneSecondary = document.getElementById('pane-secondary');
    const lectureMount = document.getElementById('lecture-doc-mount');
    const refMount = document.getElementById('reference-doc-mount');
    const secLectureMount = document.getElementById('sec-lecture-doc-mount');
    const secRefMount = document.getElementById('sec-reference-doc-mount');

    const updatePaneScroll = (paneId: 'primary' | 'secondary') => {
      const docId = paneId === 'primary' ? this.primaryDocId : this.secondaryDocId;
      if (!docId) return;
      const doc = this.workspace.getDocument(docId);
      if (doc) {
        this.getPane(paneId).saveScrollAndState(doc);
      }
    };

    panePrimary?.addEventListener('scroll', () => updatePaneScroll('primary'), { passive: true });
    lectureMount?.addEventListener('scroll', () => updatePaneScroll('primary'), { passive: true });
    refMount?.addEventListener('scroll', () => updatePaneScroll('primary'), { passive: true });

    paneSecondary?.addEventListener('scroll', () => updatePaneScroll('secondary'), { passive: true });
    secLectureMount?.addEventListener('scroll', () => updatePaneScroll('secondary'), { passive: true });
    secRefMount?.addEventListener('scroll', () => updatePaneScroll('secondary'), { passive: true });
  }

  // =========================================================================
  // MULTI-PANE DOCUMENT OPENING & PANE MANAGEMENT
  // =========================================================================

  getPane(pane: 'primary' | 'secondary'): PaneSession {
    return pane === 'primary' ? this.primaryPane : this.secondaryPane;
  }

  getActivePane(): PaneSession {
    return this.activePane === 'primary' || !this.isSplitMode ? this.primaryPane : this.secondaryPane;
  }

  setActivePane(pane: 'primary' | 'secondary'): void {
    this.activePane = pane;
    const panePrimary = document.getElementById('pane-primary');
    const paneSecondary = document.getElementById('pane-secondary');

    if (pane === 'primary') {
      panePrimary?.classList.add('pane-focused');
      paneSecondary?.classList.remove('pane-focused');
      if (this.primaryDocId) {
        this.workspace.setActiveDocument(this.primaryDocId);
      }
    } else {
      paneSecondary?.classList.add('pane-focused');
      panePrimary?.classList.remove('pane-focused');
      if (this.secondaryDocId) {
        this.workspace.setActiveDocument(this.secondaryDocId);
      }
    }
    this.sidebar.render();
  }

  openDocumentInPane(pane: 'primary' | 'secondary', doc: WorkspaceDocument): void {
    if (pane === 'secondary' && !this.isSplitMode) {
      this.toggleSplitView(true, doc);
      return;
    }

    // 1. Save previous document in this pane before switching!
    const prevDocId = pane === 'primary' ? this.primaryDocId : this.secondaryDocId;
    if (prevDocId && prevDocId !== doc.id) {
      const prevDoc = this.workspace.getDocument(prevDocId);
      if (prevDoc) {
        this.getPane(pane).saveScrollAndState(prevDoc);
      }
    }

    const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);

    if (pane === 'primary') {
      this.primaryDocId = doc.id;
      this.workspace.setActiveDocument(doc.id);
      this.primaryPane.openDocument(doc, cpuInst);
      this.primaryPane.restoreScroll(doc);

      if (this.isSplitMode && this.secondaryDocId) {
        this.syncSplitPair(this.primaryDocId, this.secondaryDocId);
      }
    } else {
      this.secondaryDocId = doc.id;
      this.secondaryPane.openDocument(doc, cpuInst);
      this.secondaryPane.restoreScroll(doc);

      if (this.isSplitMode) {
        this.syncSplitPair(this.primaryDocId, this.secondaryDocId);
      }
    }

    this.sidebar.render();
  }

  openLearningDocInPane(pane: 'primary' | 'secondary', tab: ManualTab): void {
    const existingDoc = this.workspace.getAllDocuments().find(
      (d) => d.type === 'reference' && d.referenceTab === tab
    );
    if (existingDoc) {
      this.openDocumentInPane(pane, existingDoc);
      return;
    }

    const titles: Record<ManualTab, string> = {
      manual: '📖 Komut Manueli',
      lectures: '🎓 Dersler & Teori',
      leetcode: '⚡ LeetCode Arenası',
      roadmap: '🗺️ Yol Haritası',
      studynotes: '📝 Çalışma Notları',
      ossandbox: '💻 OS Sandbox'
    };

    const newDoc = this.workspace.openDocument({
      title: titles[tab] || '📚 Öğrenme Merkezi',
      type: 'reference',
      referenceTab: tab,
      code: `; 📚 ${titles[tab]}\n; 8086 Öğrenme ve Referans dokümanı.\n`
    });
    this.openDocumentInPane(pane, newDoc);
  }

  openMilestoneLectureInPane(pane: 'primary' | 'secondary', milestoneId: string): void {
    const existingDoc = this.workspace.getAllDocuments().find(
      (d) => d.type === 'lecture' && d.milestoneId === milestoneId
    );
    if (existingDoc) {
      this.openDocumentInPane(pane, existingDoc);
      return;
    }

    const topic = getTopicById(milestoneId);
    const title = topic ? `Konu ${topic.number}: ${topic.shortTitle}` : (MILESTONE_LECTURES[milestoneId]?.title || `Konu: ${milestoneId}`);
    const newDoc = this.workspace.openDocument({
      title,
      type: 'lecture',
      milestoneId,
      code: `; 🎓 ${title}\n; Bu konu için adım adım anlatım ve her kullanım örneği dokümanın içinde yer almaktadır.\n`
    });
    this.openDocumentInPane(pane, newDoc);
  }

  returnToEditorInPane(pane: 'primary' | 'secondary'): void {
    const allDocs = this.workspace.getAllDocuments();
    const editorDoc = allDocs.find((d) => d.type === 'custom' || d.type === 'challenge' || d.type === 'example') || allDocs[0];
    if (editorDoc) {
      this.openDocumentInPane(pane, editorDoc);
    }
  }

  syncReferenceDocTab(pane: 'primary' | 'secondary', tab: ManualTab): void {
    const docId = pane === 'primary' ? this.primaryDocId : this.secondaryDocId;
    const doc = docId ? this.workspace.getAllDocuments().find(d => d.id === docId) : null;
    if (doc && doc.type === 'reference') {
      doc.referenceTab = tab;
      const titles: Record<ManualTab, string> = {
        manual: '📖 Komut Manueli',
        lectures: '🎓 Dersler & Teori',
        leetcode: '⚡ LeetCode Arenası',
        roadmap: '🗺️ Yol Haritası',
        studynotes: '📝 Çalışma Notları',
        ossandbox: '💻 OS Sandbox'
      };
      doc.title = titles[tab] || doc.title;
      this.sidebar.render();
    }
  }

  private handleDocumentClosed(docId: string): void {
    const affectedPairs = this.splitPairs.filter(p => p.primaryDocId === docId || p.secondaryDocId === docId);
    if (affectedPairs.length > 0) {
      const affectedIds = new Set(affectedPairs.map(p => p.id));
      this.splitPairs = this.splitPairs.filter(p => !affectedIds.has(p.id));
      if (this.activePairId && affectedIds.has(this.activePairId)) {
        this.activePairId = null;
      }
    }

    const docs = this.workspace.getAllDocuments();
    const fallbackDoc = docs[0];
    if (this.primaryDocId === docId && fallbackDoc) {
      this.openDocumentInPane('primary', fallbackDoc);
    }
    if (this.secondaryDocId === docId) {
      if (this.isSplitMode) {
        const otherDoc = docs.find(d => d.id !== this.primaryDocId);
        if (otherDoc) {
          this.openDocumentInPane('secondary', otherDoc);
        } else {
          this.toggleSplitView(false, undefined, true);
        }
      }
    }
  }

  // Legacy compatibility helpers
  switchToDocument(doc: WorkspaceDocument): void {
    if (this.isSplitMode) {
      this.toggleSplitView(false, undefined, false);
    }
    this.openDocumentInPane('primary', doc);
    this.setActivePane('primary');
  }

  openLearningDocument(tab: ManualTab): void {
    if (this.isSplitMode) {
      this.toggleSplitView(false, undefined, false);
    }
    this.openLearningDocInPane('primary', tab);
    this.setActivePane('primary');
  }

  openMilestoneLecture(milestoneId: string): void {
    if (this.isSplitMode) {
      this.toggleSplitView(false, undefined, false);
    }
    this.openMilestoneLectureInPane('primary', milestoneId);
    this.setActivePane('primary');
  }

  returnToEditor(): void {
    if (this.isSplitMode) {
      this.toggleSplitView(false, undefined, false);
    }
    this.returnToEditorInPane('primary');
    this.setActivePane('primary');
  }

  private syncSplitPair(primaryId: string, secondaryId: string): void {
    if (this.activePairId) {
      const existing = this.splitPairs.find(p => p.id === this.activePairId);
      if (existing) {
        existing.primaryDocId = primaryId;
        existing.secondaryDocId = secondaryId;
        return;
      }
    }

    const found = this.splitPairs.find(p => p.primaryDocId === primaryId && p.secondaryDocId === secondaryId);
    if (found) {
      this.activePairId = found.id;
      return;
    }

    const newPair: SplitPairInfo = {
      id: `pair-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      primaryDocId: primaryId,
      secondaryDocId: secondaryId
    };
    this.splitPairs.push(newPair);
    this.activePairId = newPair.id;
  }

  openSplitPair(pairId: string, pane?: 'primary' | 'secondary'): void {
    const pair = this.splitPairs.find(p => p.id === pairId);
    if (!pair) return;

    const primDoc = this.workspace.getAllDocuments().find(d => d.id === pair.primaryDocId);
    const secDoc = this.workspace.getAllDocuments().find(d => d.id === pair.secondaryDocId);

    if (!primDoc || !secDoc) {
      this.closeSplitPair(pairId);
      return;
    }

    this.activePairId = pair.id;
    this.openDocumentInPane('primary', primDoc);
    this.toggleSplitView(true, secDoc);
    this.setActivePane(pane || 'primary');
    this.sidebar.render();
  }

  closeSplitPair(pairId: string): void {
    const wasActive = this.activePairId === pairId;
    this.splitPairs = this.splitPairs.filter(p => p.id !== pairId);
    if (wasActive) {
      this.activePairId = null;
      this.toggleSplitView(false, undefined, true);
    } else {
      this.sidebar.render();
    }
  }

  toggleSplitView(forceState?: boolean, targetDoc?: WorkspaceDocument, removeActivePair: boolean = false): void {
    const newState = forceState !== undefined ? forceState : !this.isSplitMode;
    this.isSplitMode = newState;

    const mainContent = document.getElementById('app-main-content');
    const panePrimary = document.getElementById('pane-primary');
    const paneSecondary = document.getElementById('pane-secondary');
    const splitResizer = document.getElementById('split-resizer');

    if (!mainContent || !panePrimary || !paneSecondary || !splitResizer) return;

    if (this.isSplitMode) {
      mainContent.classList.add('split-active');
      paneSecondary.style.display = 'flex';
      splitResizer.style.display = 'flex';
      panePrimary.style.width = '50%';
      paneSecondary.style.width = '50%';

      if (targetDoc) {
        this.openDocumentInPane('secondary', targetDoc);
      } else if (!this.secondaryDocId) {
        const allDocs = this.workspace.getAllDocuments();
        const otherDoc = allDocs.find(d => d.id !== this.primaryDocId);
        if (otherDoc) {
          this.openDocumentInPane('secondary', otherDoc);
        } else {
          const refDoc = this.workspace.openDocument({
            title: '📖 Komut Manueli',
            type: 'reference',
            referenceTab: 'manual',
            code: '; 8086 Komut Manueli\n'
          });
          this.openDocumentInPane('secondary', refDoc);
        }
      } else {
        const existingSecDoc = this.workspace.getAllDocuments().find(d => d.id === this.secondaryDocId);
        if (existingSecDoc) {
          this.openDocumentInPane('secondary', existingSecDoc);
        }
      }

      if (this.secondaryDocId) {
        this.syncSplitPair(this.primaryDocId, this.secondaryDocId);
      }
      this.setActivePane('secondary');
    } else {
      mainContent.classList.remove('split-active');
      paneSecondary.style.display = 'none';
      splitResizer.style.display = 'none';
      panePrimary.style.width = '100%';
      paneSecondary.style.width = '50%';

      this.secondaryPane.stop();
      this.secondaryDocId = null;
      this.secondaryPane.setCurrentDocId(null);
      this.setActivePane('primary');

      if (removeActivePair && this.activePairId) {
        this.splitPairs = this.splitPairs.filter(p => p.id !== this.activePairId);
      }
      this.activePairId = null;
    }
    this.sidebar.render();
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

    // Close buttons on secondary pane
    document.getElementById('btn-secondary-close')?.addEventListener('click', () => {
      this.toggleSplitView(false, undefined, true);
    });
    document.getElementById('btn-sec-ide-close')?.addEventListener('click', () => {
      this.toggleSplitView(false, undefined, true);
    });

    // Quick nav buttons in secondary pane header
    document.querySelectorAll('.btn-sec-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        const secNav = btn.getAttribute('data-sec-nav') as ManualTab;
        if (secNav) {
          this.openLearningDocInPane('secondary', secNav);
        }
      });
    });

    // Pane focus listeners
    panePrimary.addEventListener('pointerdown', () => this.setActivePane('primary'));
    paneSecondary.addEventListener('pointerdown', () => this.setActivePane('secondary'));
  }

  private isDocAlreadyOpenInPane(pane: 'primary' | 'secondary', dragInfo: any): boolean {
    if (!dragInfo) return false;

    if (pane === 'primary') {
      if (dragInfo.kind === 'workspace-doc' && dragInfo.docId) {
        return this.primaryDocId === dragInfo.docId;
      }
      if (dragInfo.kind === 'learning-doc' && dragInfo.tab) {
        const primDoc = this.workspace.getAllDocuments().find(d => d.id === this.primaryDocId);
        return primDoc?.type === 'reference' && primDoc.referenceTab === dragInfo.tab;
      }
    } else {
      // secondary pane
      if (!this.isSplitMode || !this.secondaryDocId) return false;
      if (dragInfo.kind === 'workspace-doc' && dragInfo.docId) {
        return this.secondaryDocId === dragInfo.docId;
      }
      if (dragInfo.kind === 'learning-doc' && dragInfo.tab) {
        const secDoc = this.workspace.getAllDocuments().find(d => d.id === this.secondaryDocId);
        return secDoc?.type === 'reference' && secDoc.referenceTab === dragInfo.tab;
      }
    }
    return false;
  }

  private initDragAndDrop(): void {
    const mainContent = document.getElementById('app-main-content');
    const dropOverlay = document.getElementById('workspace-drop-overlay');
    const leftZone = document.getElementById('drop-zone-left');
    const rightZone = document.getElementById('drop-zone-right');
    const leftText = document.getElementById('drop-zone-left-text');
    const rightText = document.getElementById('drop-zone-right-text');

    if (!mainContent || !dropOverlay || !leftZone || !rightZone) return;

    let dragCounter = 0;

    const showOverlay = () => {
      dropOverlay.style.display = 'flex';
      const dragInfo = (window as any).__assemblySimDraggedDoc;
      const leftBlocked = this.isDocAlreadyOpenInPane('primary', dragInfo);
      const rightBlocked = this.isDocAlreadyOpenInPane('secondary', dragInfo);

      if (leftBlocked) {
        leftZone.classList.add('drop-zone-blocked');
        if (leftText) leftText.textContent = '⛔ Zaten Bu Pencerede Açık';
      } else {
        leftZone.classList.remove('drop-zone-blocked');
        if (leftText) leftText.textContent = this.isSplitMode ? 'Sol Panele Bırak' : 'Bu Pencerede Aç';
      }

      if (rightBlocked) {
        rightZone.classList.add('drop-zone-blocked');
        if (rightText) rightText.textContent = '⛔ Zaten Bu Pencerede Açık';
      } else {
        rightZone.classList.remove('drop-zone-blocked');
        if (rightText) rightText.textContent = this.isSplitMode ? 'Sağ Panele Bırak' : 'Sağa Böl (Yan Yana Çalış)';
      }
    };

    const hideOverlay = () => {
      dropOverlay.style.display = 'none';
      dropOverlay.style.cursor = '';
      leftZone.classList.remove('active');
      rightZone.classList.remove('active');
      leftZone.classList.remove('drop-zone-blocked');
      rightZone.classList.remove('drop-zone-blocked');
    };

    const isOurDrag = (e: DragEvent): boolean => {
      if (!e.dataTransfer) return false;
      return e.dataTransfer.types.includes('application/x-assemblysim-doc') || 
             e.dataTransfer.types.includes('text/plain') ||
             document.body.classList.contains('is-dragging-doc');
    };

    const updateZoneHover = (clientX: number) => {
      const rect = mainContent.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const dragInfo = (window as any).__assemblySimDraggedDoc;

      if (this.isSplitMode) {
        const panePrimary = document.getElementById('pane-primary');
        const primWidth = panePrimary ? panePrimary.getBoundingClientRect().width : width / 2;
        if (x < primWidth) {
          leftZone.classList.add('active');
          rightZone.classList.remove('active');
        } else {
          rightZone.classList.add('active');
          leftZone.classList.remove('active');
        }
      } else {
        if (x > width * 0.65) {
          rightZone.classList.add('active');
          leftZone.classList.remove('active');
        } else {
          leftZone.classList.add('active');
          rightZone.classList.remove('active');
        }
      }

      const isRight = rightZone.classList.contains('active');
      const targetPane: 'primary' | 'secondary' = isRight ? 'secondary' : 'primary';
      const isBlocked = this.isDocAlreadyOpenInPane(targetPane, dragInfo);
      dropOverlay.style.cursor = isBlocked ? 'not-allowed' : '';
    };

    mainContent.addEventListener('dragenter', (e) => {
      if (!isOurDrag(e)) return;
      dragCounter++;
      showOverlay();
      updateZoneHover(e.clientX);
    });

    mainContent.addEventListener('dragleave', (e) => {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        hideOverlay();
      }
    });

    mainContent.addEventListener('dragover', (e) => {
      if (!isOurDrag(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      updateZoneHover(e.clientX);
    });

    dropOverlay.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      updateZoneHover(e.clientX);
    });

    const handleDropAction = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      hideOverlay();
      dragCounter = 0;

      const rect = mainContent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      let targetPane: 'primary' | 'secondary' = 'primary';
      if (this.isSplitMode) {
        const panePrimary = document.getElementById('pane-primary');
        const primWidth = panePrimary ? panePrimary.getBoundingClientRect().width : width / 2;
        targetPane = x < primWidth ? 'primary' : 'secondary';
      } else {
        targetPane = x > width * 0.65 ? 'secondary' : 'primary';
      }

      const rawData = e.dataTransfer?.getData('application/x-assemblysim-doc') || e.dataTransfer?.getData('text/plain');
      if (!rawData) return;

      try {
        const payload = JSON.parse(rawData);
        if (this.isDocAlreadyOpenInPane(targetPane, payload)) {
          return;
        }

        if (payload.kind === 'workspace-doc' && payload.docId) {
          const doc = this.workspace.getAllDocuments().find(d => d.id === payload.docId);
          if (doc) {
            this.openDocumentInPane(targetPane, doc);
            this.setActivePane(targetPane);
          }
        } else if (payload.kind === 'learning-doc' && payload.tab) {
          this.openLearningDocInPane(targetPane, payload.tab as ManualTab);
          this.setActivePane(targetPane);
        }
      } catch (err) {
        console.warn('Drop parse error:', err);
      } finally {
        (window as any).__assemblySimDraggedDoc = null;
        document.body.classList.remove('is-dragging-doc');
      }
    };

    dropOverlay.addEventListener('drop', handleDropAction);
    mainContent.addEventListener('drop', handleDropAction);

    // Draggable header bar hooks
    const primaryTitleWrap = document.getElementById('primary-editor-title-wrap');
    if (primaryTitleWrap) {
      primaryTitleWrap.setAttribute('draggable', 'true');
      primaryTitleWrap.addEventListener('dragstart', (e) => {
        const payload = JSON.stringify({ kind: 'workspace-doc', docId: this.primaryDocId });
        (window as any).__assemblySimDraggedDoc = { kind: 'workspace-doc', docId: this.primaryDocId };
        document.body.classList.add('is-dragging-doc');
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
      });
      primaryTitleWrap.addEventListener('dragend', () => {
        (window as any).__assemblySimDraggedDoc = null;
        document.body.classList.remove('is-dragging-doc');
        hideOverlay();
      });
    }

    const secTitleWrap = document.getElementById('sec-editor-title-wrap');
    if (secTitleWrap) {
      secTitleWrap.setAttribute('draggable', 'true');
      secTitleWrap.addEventListener('dragstart', (e) => {
        if (!this.secondaryDocId) return;
        const payload = JSON.stringify({ kind: 'workspace-doc', docId: this.secondaryDocId });
        (window as any).__assemblySimDraggedDoc = { kind: 'workspace-doc', docId: this.secondaryDocId };
        document.body.classList.add('is-dragging-doc');
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
      });
      secTitleWrap.addEventListener('dragend', () => {
        (window as any).__assemblySimDraggedDoc = null;
        document.body.classList.remove('is-dragging-doc');
        hideOverlay();
      });
    }

    const secPaneTitleWrap = document.getElementById('secondary-pane-title-wrap');
    if (secPaneTitleWrap) {
      secPaneTitleWrap.addEventListener('dragstart', (e) => {
        if (!this.secondaryDocId) return;
        const payload = JSON.stringify({ kind: 'workspace-doc', docId: this.secondaryDocId });
        (window as any).__assemblySimDraggedDoc = { kind: 'workspace-doc', docId: this.secondaryDocId };
        document.body.classList.add('is-dragging-doc');
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
      });
      secPaneTitleWrap.addEventListener('dragend', () => {
        (window as any).__assemblySimDraggedDoc = null;
        document.body.classList.remove('is-dragging-doc');
        hideOverlay();
      });
    }
  }
}

if (typeof window !== 'undefined') {
  new App();
}
