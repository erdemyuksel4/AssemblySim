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
import { WorkspaceSidebar, SplitPairInfo } from './sidebar.js';
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

  // Primary Pane Components
  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;
  private consoleView!: ConsoleView;
  private challengePanel!: ChallengePanel;
  private lectureDocView!: LectureDocumentView;
  private instructionDoc!: InstructionDoc;

  // Primary Execution State
  private currentAsmResult: AsmResult | null = null;
  private ipToLineMap: Map<number, number> = new Map();
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private currentSpeed: ExecutionSpeed = '1';
  private wasRunningBeforeInput: boolean = false;

  // Multi-Pane & Split State
  private isSplitMode: boolean = false;
  private activePane: 'primary' | 'secondary' = 'primary';
  private primaryDocId: string = 'doc-main';
  private secondaryDocId: string | null = null;
  private splitPairs: SplitPairInfo[] = [];
  private activePairId: string | null = null;

  // Secondary Pane Components
  private secCpu: CPU | null = null;
  private secEditor!: Editor;
  private secRegisterPanel!: RegisterPanel;
  private secMemoryView!: MemoryView;
  private secConsoleView!: ConsoleView;
  private secChallengePanel!: ChallengePanel;
  private secLectureDocView!: LectureDocumentView;
  private secInstructionDoc!: InstructionDoc;

  // Secondary Execution State
  private secCurrentAsmResult: AsmResult | null = null;
  private secIpToLineMap: Map<number, number> = new Map();
  private secIsRunning: boolean = false;
  private secRunTimer: number | null = null;
  private secSpeed: ExecutionSpeed = '1';
  private secWasRunningBeforeInput: boolean = false;

  private isPrimaryDirty: boolean = false;
  private isSecondaryDirty: boolean = false;

  // Per-document execution caches to preserve CPU state (registers, memory, flags, IP) on document switch
  private docExecCache: Map<string, {
    code: string;
    asmResult: AsmResult | null;
    ipToLineMap: Map<number, number>;
  }> = new Map();

  private secDocExecCache: Map<string, {
    code: string;
    asmResult: AsmResult | null;
    ipToLineMap: Map<number, number>;
  }> = new Map();

  private setPrimaryDirty(dirty: boolean): void {
    this.isPrimaryDirty = dirty;
    const btn = document.getElementById('btn-compile');
    const dot = btn?.querySelector('.compile-dirty-dot') as HTMLElement | null;
    if (dot) {
      dot.style.display = dirty ? 'inline-block' : 'none';
    }
    if (btn) {
      btn.title = dirty ? 'Derlenmemiş değişiklikler var. Yeniden derlemek için tıklayın.' : 'Kodu derle';
    }
    if (dirty && !this.isRunning) {
      const btnRun = document.getElementById('btn-run') as HTMLButtonElement | null;
      const btnNext = document.getElementById('btn-next') as HTMLButtonElement | null;
      if (btnRun) btnRun.disabled = false;
      if (btnNext) btnNext.disabled = false;
    }
  }

  private setSecondaryDirty(dirty: boolean): void {
    this.isSecondaryDirty = dirty;
    const btn = document.getElementById('btn-sec-compile');
    const dot = btn?.querySelector('.compile-dirty-dot') as HTMLElement | null;
    if (dot) {
      dot.style.display = dirty ? 'inline-block' : 'none';
    }
    if (btn) {
      btn.title = dirty ? 'Derlenmemiş değişiklikler var. Yeniden derlemek için tıklayın.' : 'Kodu derle';
    }
    if (dirty && !this.secIsRunning) {
      const btnRun = document.getElementById('btn-sec-run') as HTMLButtonElement | null;
      const btnNext = document.getElementById('btn-sec-next') as HTMLButtonElement | null;
      if (btnRun) btnRun.disabled = false;
      if (btnNext) btnNext.disabled = false;
    }
  }

  constructor() {
    this.cpuManager = new CpuInstanceManager();
    this.workspace = new WorkspaceManager(this.cpuManager);
    const activeDoc = this.workspace.getActiveDocument();
    this.primaryDocId = activeDoc ? activeDoc.id : 'doc-main';
    const activeCpu = this.cpuManager.getOrDefaultInstance(activeDoc?.cpuInstanceId);
    this.cpu = activeCpu.cpu;

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

              <!-- Right Section: Registers, Segments, Pointers, Flags, Memory, and Challenge Box -->
              <section class="cpu-section">
                <div id="registers-container"></div>
                <div id="memory-container"></div>
                <div id="challenge-box-container" class="challenge-box-container"></div>
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
                <span class="secondary-pane-title" id="secondary-pane-title">8086 Komut Manueli</span>
              </div>
              <div class="secondary-pane-quick-nav">
                <button class="btn-sec-nav active" data-sec-nav="manual" title="8086 Komut Seti Manueli">📖 Manuel</button>
                <button class="btn-sec-nav" data-sec-nav="lectures" title="Dersler & Teori Kataloğu">🎓 Dersler</button>
                <button class="btn-sec-nav" data-sec-nav="leetcode" title="8086 LeetCode Arenası">⚡ LeetCode</button>
                <button class="btn-sec-nav" data-sec-nav="roadmap" title="Müfredat Yol Haritası">🗺️ Yol Haritası</button>
              </div>
              <div class="secondary-pane-actions">
                <button id="btn-secondary-close" class="btn-pane-action btn-close-pane" title="Bölünmüş Ekranı Kapat (Tek Ekrana Dön)">✕</button>
              </div>
            </div>

            <!-- Secondary IDE Layout (Shown when secondary pane has a code doc) -->
            <main class="main-layout sec-main-layout" id="sec-ide-layout" style="display: none;">
              <!-- Left Section: Code Editor -->
              <section class="editor-section">
                <div class="editor-header-bar">
                  <h2 class="editor-title" id="sec-editor-title-wrap" draggable="true" title="Sürükleyip sol panele bırakabilirsiniz">
                    <span id="sec-editor-title-text">Code Editor 2</span>
                    <span class="cpu-badge" id="sec-ide-cpu-badge" style="margin-left: 6px;">CPU-2</span>
                  </h2>
                  <div class="editor-toolbar-right">
                    <!-- Format Switch (HEX / DEC / BIN) -->
                    <div class="format-switch-group">
                      <button class="btn-fmt active" data-sec-fmt="hex">HEX</button>
                      <button class="btn-fmt" data-sec-fmt="dec">DEC</button>
                      <button class="btn-fmt" data-sec-fmt="bin">BIN</button>
                    </div>

                    <!-- Speed Switch (0.5x / 1x / 2x) -->
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
                      <span class="btn-icon">⚡</span> Test Et
                    </button>
                    <button id="btn-sec-ide-close" class="btn-pane-action btn-close-pane" title="Pencereyi Kapat">✕</button>
                  </div>
                </div>

                <div id="sec-editor-container"></div>
                <div id="sec-console-container" class="console-section-wrapper"></div>
              </section>

              <!-- Right Section: Registers & Memory -->
              <section class="cpu-section" id="sec-cpu-section">
                <div id="sec-registers-container"></div>
                <div id="sec-memory-container"></div>
                <div id="sec-challenge-box-container" class="challenge-box-container"></div>
              </section>
            </main>

            <!-- Secondary Lecture Doc Mount -->
            <div id="sec-lecture-doc-mount" class="lecture-doc-mount" style="display: none;"></div>

            <!-- Secondary Reference Doc Mount -->
            <div id="sec-reference-doc-mount" class="reference-doc-mount" style="display: none;"></div>
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
    const lectureMount = document.getElementById('lecture-doc-mount')!;
    const challengeContainer = document.getElementById('challenge-box-container')!;

    // 1. Primary Components
    this.registerPanel = new RegisterPanel(registersContainer);
    this.memoryView = new MemoryView(memoryContainer);

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
        this.workspace.updateDocumentCode(this.primaryDocId, this.editor.getCode());
        const doc = this.workspace.getDocument(this.primaryDocId);
        if (doc) doc.editorScroll = this.editor.getScroll();
        this.setPrimaryDirty(true);
      }
    });

    this.challengePanel = new ChallengePanel(challengeContainer, {
      onTestChallenge: (ch, code) => {
        this.workspace.updateDocumentCode(this.primaryDocId, code);
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
          this.consoleView.log(`⏱️ [Zaman Aşımı]: Program ${result.stepCount} adımda durmadı.`, 'warn');
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
        this.openLearningDocInPane('primary', 'leetcode');
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
      getCurrentCode: () => this.editor.getCode()
    });

    this.instructionDoc = new InstructionDoc(docsContainer, {
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
      onOpenLectureDocument: (milestoneId) => {
        this.openMilestoneLectureInPane('primary', milestoneId);
      },
      onReturnToEditor: () => {
        this.returnToEditorInPane('primary');
      },
      onTabChange: (tab) => {
        this.syncReferenceDocTab('primary', tab);
      },
      getCurrentEditorCode: () => this.editor.getCode()
    });

    this.lectureDocView = new LectureDocumentView(lectureMount, {
      onNavigateToMilestoneLecture: (milestoneId: string) => {
        if (this.isSplitMode) this.toggleSplitView(false);
        this.openMilestoneLectureInPane('primary', milestoneId);
        this.setActivePane('primary');
      },
      onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => {
        if (this.isSplitMode) this.toggleSplitView(false);
        this.openLearningDocInPane('primary', 'leetcode');
        this.instructionDoc.filterLeetCodeByMilestone(milestoneId, challengeId);
        this.setActivePane('primary');
      },
      onNavigateToRoadmap: () => {
        if (this.isSplitMode) this.toggleSplitView(false);
        this.openLearningDocInPane('primary', 'roadmap');
        this.setActivePane('primary');
      },
      onOpenInMainEditor: (title: string, code: string) => {
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
      }
    });

    // 2. Secondary Components
    const secEditorContainer = document.getElementById('sec-editor-container')!;
    const secConsoleContainer = document.getElementById('sec-console-container')!;
    const secRegistersContainer = document.getElementById('sec-registers-container')!;
    const secMemoryContainer = document.getElementById('sec-memory-container')!;
    const secChallengeContainer = document.getElementById('sec-challenge-box-container')!;
    const secRefMount = document.getElementById('sec-reference-doc-mount')!;
    const secLectureMount = document.getElementById('sec-lecture-doc-mount')!;

    this.secRegisterPanel = new RegisterPanel(secRegistersContainer);
    this.secMemoryView = new MemoryView(secMemoryContainer);

    this.secConsoleView = new ConsoleView(secConsoleContainer, {
      onInput: (input) => {
        if (!this.secCpu) return;
        this.secCpu.feedInput(input);
        this.secConsoleView.setWaitingForInput(false);
        if (this.secWasRunningBeforeInput) {
          this.secWasRunningBeforeInput = false;
          this.secRun();
        } else {
          this.secStep();
        }
      }
    });

    this.secEditor = new Editor({
      container: secEditorContainer,
      initialCode: '',
      onCodeChange: () => {
        this.secEditor.clearErrors();
        if (this.secondaryDocId) {
          this.workspace.updateDocumentCode(this.secondaryDocId, this.secEditor.getCode());
          const doc = this.workspace.getDocument(this.secondaryDocId);
          if (doc) doc.editorScroll = this.secEditor.getScroll();
        }
        this.setSecondaryDirty(true);
      }
    });

    this.secChallengePanel = new ChallengePanel(secChallengeContainer, {
      onTestChallenge: (ch, code) => {
        if (this.secondaryDocId) {
          this.workspace.updateDocumentCode(this.secondaryDocId, code);
        }
        this.secConsoleView.clear();
        this.secConsoleView.log(`🧪 '${ch.title}' görevi test ediliyor...`, 'info');

        const result = ChallengeRunner.grade(ch, code);

        if (result.status === 'COMPILE_ERROR' && result.compileError) {
          this.secEditor.setErrors([result.compileError]);
          this.secConsoleView.log(`❌ [Derleme Hatası] Satır ${result.compileError.line}: ${result.compileError.message}`, 'error');
        } else if (result.status === 'RUNTIME_ERROR') {
          this.secConsoleView.log(`❌ [Çalışma Hatası]: ${result.runtimeError || 'Hata'}`, 'error');
        } else if (result.status === 'TIMEOUT') {
          this.secConsoleView.log(`⏱️ [Zaman Aşımı]: Program ${result.stepCount} adımda durmadı.`, 'warn');
        } else if (result.status === 'FAILED') {
          this.secConsoleView.log(`❌ [Test Başarısız]: Bazı beklenen değerler karşılanamadı:`, 'error');
          result.diffs.filter(d => !d.passed).forEach(d => {
            this.secConsoleView.log(`  • ${d.target}: Beklenen ${d.expected}, Gerçek ${d.actual}${d.message ? ` (${d.message})` : ''}`, 'warn');
          });
        } else if (result.status === 'PASSED') {
          this.secEditor.clearErrors();
          this.secConsoleView.log(`✅ [Tebrikler] '${ch.title}' tüm testleri başarıyla geçti! (${result.stepCount} adım, ${result.executionTimeMs} ms)`, 'success');
        }

        return result;
      },
      onResetEnvironment: () => {
        this.secReset();
      },
      onNavigateToLeetCode: () => {
        this.openLearningDocInPane('secondary', 'leetcode');
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
      getCurrentCode: () => this.secEditor.getCode()
    });

    this.secInstructionDoc = new InstructionDoc(secRefMount, {
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
      onOpenLectureDocument: (milestoneId) => {
        this.openMilestoneLectureInPane('secondary', milestoneId);
      },
      onReturnToEditor: () => {
        this.returnToEditorInPane('secondary');
      },
      onTabChange: (tab) => {
        this.syncReferenceDocTab('secondary', tab);
      },
      getCurrentEditorCode: () => this.secEditor.getCode()
    });

    this.secLectureDocView = new LectureDocumentView(secLectureMount, {
      onNavigateToMilestoneLecture: (milestoneId: string) => {
        this.openMilestoneLectureInPane('secondary', milestoneId);
      },
      onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => {
        this.openLearningDocInPane('secondary', 'leetcode');
        this.secInstructionDoc.filterLeetCodeByMilestone(milestoneId, challengeId);
      },
      onNavigateToRoadmap: () => {
        this.openLearningDocInPane('secondary', 'roadmap');
      },
      onOpenInMainEditor: (title: string, code: string) => {
        const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newDoc = this.workspace.openDocument({
          title: `ornek-${cleanTitle}.asm`,
          type: 'custom',
          code
        });
        this.openDocumentInPane('primary', newDoc);
        this.setActivePane('primary');
        this.sidebar.render();
      }
    });

    // 3. Workspace Sidebar & CPU Modal
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

    this.cpuModal = new CpuModal(this.cpuManager, this.workspace, {
      onCpuChanged: () => {
        const activeDocId = this.activePane === 'primary' ? this.primaryDocId : (this.secondaryDocId || this.primaryDocId);
        const doc = this.workspace.getAllDocuments().find(d => d.id === activeDocId);
        const cpuInst = this.cpuManager.getOrDefaultInstance(doc?.cpuInstanceId);
        if (this.activePane === 'primary') {
          this.cpu = cpuInst.cpu;
          this.updateViews();
        } else if (this.secCpu) {
          this.secCpu = cpuInst.cpu;
          this.secUpdateViews();
        }
        this.sidebar.render();
      },
      onDocumentCpuRemapped: (doc) => {
        if (this.primaryDocId === doc.id) {
          const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
          this.cpu = cpuInst.cpu;
          this.compile();
          this.updateViews();
        }
        if (this.secondaryDocId === doc.id) {
          const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
          this.secCpu = cpuInst.cpu;
          this.secCompile();
          this.secUpdateViews();
        }
        this.sidebar.render();
      }
    });

    this.attachButtonEvents();
    this.initSplitResizer();
    this.initDragAndDrop();
    this.initScrollTracking();
  }

  private initScrollTracking(): void {
    const panePrimary = document.getElementById('pane-primary');
    const paneSecondary = document.getElementById('pane-secondary');
    const lectureMount = document.getElementById('lecture-doc-mount');
    const refMount = document.getElementById('reference-doc-mount');
    const secLectureMount = document.getElementById('sec-lecture-doc-mount');
    const secRefMount = document.getElementById('sec-reference-doc-mount');

    const updatePrimaryScroll = () => {
      const doc = this.workspace.getDocument(this.primaryDocId);
      if (doc) {
        if (doc.type === 'lecture') {
          doc.scrollTop = lectureMount?.scrollTop || panePrimary?.scrollTop || 0;
        } else if (doc.type === 'reference') {
          doc.scrollTop = refMount?.scrollTop || panePrimary?.scrollTop || 0;
        } else {
          doc.scrollTop = panePrimary?.scrollTop || 0;
        }
      }
    };

    const updateSecondaryScroll = () => {
      if (!this.secondaryDocId) return;
      const doc = this.workspace.getDocument(this.secondaryDocId);
      if (doc) {
        if (doc.type === 'lecture') {
          doc.scrollTop = secLectureMount?.scrollTop || paneSecondary?.scrollTop || 0;
        } else if (doc.type === 'reference') {
          doc.scrollTop = secRefMount?.scrollTop || paneSecondary?.scrollTop || 0;
        } else {
          doc.scrollTop = paneSecondary?.scrollTop || 0;
        }
      }
    };

    panePrimary?.addEventListener('scroll', updatePrimaryScroll, { passive: true });
    lectureMount?.addEventListener('scroll', updatePrimaryScroll, { passive: true });
    refMount?.addEventListener('scroll', updatePrimaryScroll, { passive: true });

    paneSecondary?.addEventListener('scroll', updateSecondaryScroll, { passive: true });
    secLectureMount?.addEventListener('scroll', updateSecondaryScroll, { passive: true });
    secRefMount?.addEventListener('scroll', updateSecondaryScroll, { passive: true });
  }

  // =========================================================================
  // MULTI-PANE DOCUMENT OPENING & PANE MANAGEMENT
  // =========================================================================

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

  private savePaneScrollAndState(pane: 'primary' | 'secondary', doc: WorkspaceDocument): void {
    const paneEl = document.getElementById(pane === 'primary' ? 'pane-primary' : 'pane-secondary');
    const lectureMount = document.getElementById(pane === 'primary' ? 'lecture-doc-mount' : 'sec-lecture-doc-mount');
    const refMount = document.getElementById(pane === 'primary' ? 'reference-doc-mount' : 'sec-reference-doc-mount');

    let scroll = 0;
    if (doc.type === 'lecture') {
      scroll = lectureMount?.scrollTop || paneEl?.scrollTop || 0;
    } else if (doc.type === 'reference') {
      scroll = refMount?.scrollTop || paneEl?.scrollTop || 0;
    } else {
      scroll = paneEl?.scrollTop || 0;
      const ed = pane === 'primary' ? this.editor : this.secEditor;
      doc.editorScroll = ed.getScroll();
      doc.code = ed.getCode();
    }
    doc.scrollTop = scroll;
  }

  private restorePaneScroll(pane: 'primary' | 'secondary', doc: WorkspaceDocument): void {
    const paneEl = document.getElementById(pane === 'primary' ? 'pane-primary' : 'pane-secondary');
    const lectureMount = document.getElementById(pane === 'primary' ? 'lecture-doc-mount' : 'sec-lecture-doc-mount');
    const refMount = document.getElementById(pane === 'primary' ? 'reference-doc-mount' : 'sec-reference-doc-mount');
    const targetScroll = doc.scrollTop || 0;

    const applyScroll = () => {
      if (doc.type === 'lecture') {
        if (lectureMount) lectureMount.scrollTop = targetScroll;
      } else if (doc.type === 'reference') {
        if (refMount) refMount.scrollTop = targetScroll;
      }
      if (paneEl) paneEl.scrollTop = targetScroll;

      if (doc.editorScroll) {
        const ed = pane === 'primary' ? this.editor : this.secEditor;
        ed.setScroll(doc.editorScroll);
      }
    };

    requestAnimationFrame(applyScroll);
    setTimeout(applyScroll, 40);
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
        this.savePaneScrollAndState(pane, prevDoc);
      }
    }

    if (pane === 'primary') {
      this.primaryDocId = doc.id;
      this.workspace.setActiveDocument(doc.id);
      const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
      this.cpu = cpuInst.cpu;

      const mainIdeLayout = document.getElementById('main-ide-layout');
      const lectureDocMount = document.getElementById('lecture-doc-mount');
      const refDocMount = document.getElementById('reference-doc-mount');
      const primaryTitle = document.getElementById('primary-editor-title-text');
      const primaryBadge = document.getElementById('primary-ide-cpu-badge');

      if (doc.type === 'lecture' && doc.milestoneId) {
        if (mainIdeLayout) mainIdeLayout.style.display = 'none';
        if (refDocMount) refDocMount.style.display = 'none';
        if (lectureDocMount) lectureDocMount.style.display = 'block';
        this.lectureDocView.setMilestone(doc.milestoneId);
      } else if (doc.type === 'reference' && doc.referenceTab) {
        if (mainIdeLayout) mainIdeLayout.style.display = 'none';
        if (lectureDocMount) lectureDocMount.style.display = 'none';
        if (refDocMount) refDocMount.style.display = 'block';
        this.instructionDoc.openTab(doc.referenceTab);
      } else {
        if (mainIdeLayout) mainIdeLayout.style.display = 'grid';
        if (lectureDocMount) lectureDocMount.style.display = 'none';
        if (refDocMount) refDocMount.style.display = 'none';

        if (primaryTitle) primaryTitle.textContent = doc.title;
        if (primaryBadge) {
          primaryBadge.textContent = cpuInst.name;
          primaryBadge.style.borderLeftColor = cpuInst.color;
        }

        this.stop();
        this.editor.setCode(doc.code);
        this.consoleView.clear();
        if (this.cpu.consoleBuffer) {
          this.consoleView.appendStdout(this.cpu.consoleBuffer);
        }

        // Reuse compiled state if code hasn't changed; avoid resetting CPU registers and memory!
        const cached = this.docExecCache.get(doc.id);
        const canReuse = cached && cached.code === doc.code && cached.asmResult && cached.asmResult.errors.length === 0;

        if (canReuse) {
          this.currentAsmResult = cached.asmResult;
          this.ipToLineMap = cached.ipToLineMap;
          this.editor.clearErrors();
          this.setPrimaryDirty(false);
          const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
          const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
          if (btnRun) btnRun.disabled = false;
          if (btnNext) btnNext.disabled = false;
          this.syncActiveLine();
          this.updateViews();
        } else {
          this.compile();
          this.updateViews();
        }

        // Sync challenge panel if challenge doc
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

      this.restorePaneScroll('primary', doc);

      if (this.isSplitMode && this.secondaryDocId) {
        this.syncSplitPair(this.primaryDocId, this.secondaryDocId);
      }
    } else {
      // Secondary Pane
      this.secondaryDocId = doc.id;
      const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
      this.secCpu = cpuInst.cpu;

      const secIdeLayout = document.getElementById('sec-ide-layout');
      const secHeader = document.getElementById('secondary-pane-header');
      const secLectureDocMount = document.getElementById('sec-lecture-doc-mount');
      const secRefDocMount = document.getElementById('sec-reference-doc-mount');
      const secTitle = document.getElementById('sec-editor-title-text');
      const secBadge = document.getElementById('sec-ide-cpu-badge');
      const secHeaderIcon = document.getElementById('secondary-pane-icon');
      const secHeaderTitle = document.getElementById('secondary-pane-title');

      if (doc.type === 'lecture' && doc.milestoneId) {
        if (secIdeLayout) secIdeLayout.style.display = 'none';
        if (secRefDocMount) secRefDocMount.style.display = 'none';
        if (secHeader) secHeader.style.display = 'flex';
        if (secLectureDocMount) secLectureDocMount.style.display = 'block';

        this.secLectureDocView.setMilestone(doc.milestoneId);
        const lecture = MILESTONE_LECTURES[doc.milestoneId];
        if (secHeaderIcon) secHeaderIcon.textContent = '🎓';
        if (secHeaderTitle) secHeaderTitle.textContent = lecture ? `Aşama ${lecture.milestoneNumber}: ${lecture.title}` : 'Ders Anlatımı';
        document.querySelectorAll('.btn-sec-nav').forEach(b => b.classList.remove('active'));
        document.querySelector('.btn-sec-nav[data-sec-nav="lectures"]')?.classList.add('active');
      } else if (doc.type === 'reference' && doc.referenceTab) {
        if (secIdeLayout) secIdeLayout.style.display = 'none';
        if (secLectureDocMount) secLectureDocMount.style.display = 'none';
        if (secHeader) secHeader.style.display = 'flex';
        if (secRefDocMount) secRefDocMount.style.display = 'block';

        this.secInstructionDoc.openTab(doc.referenceTab);
        const tabTitles: Record<ManualTab, { icon: string; title: string }> = {
          manual: { icon: '📖', title: '8086 Komut Manueli' },
          lectures: { icon: '🎓', title: 'Dersler & Teori Kataloğu' },
          leetcode: { icon: '⚡', title: '8086 LeetCode Arenası' },
          roadmap: { icon: '🗺️', title: 'Müfredat Yol Haritası' }
        };
        const info = tabTitles[doc.referenceTab] || { icon: '📚', title: 'Öğrenme Merkezi' };
        if (secHeaderIcon) secHeaderIcon.textContent = info.icon;
        if (secHeaderTitle) secHeaderTitle.textContent = info.title;
        document.querySelectorAll('.btn-sec-nav').forEach(b => b.classList.remove('active'));
        document.querySelector(`.btn-sec-nav[data-sec-nav="${doc.referenceTab}"]`)?.classList.add('active');
      } else {
        // Code document in secondary pane
        if (secHeader) secHeader.style.display = 'none';
        if (secLectureDocMount) secLectureDocMount.style.display = 'none';
        if (secRefDocMount) secRefDocMount.style.display = 'none';
        if (secIdeLayout) secIdeLayout.style.display = 'grid';

        if (secTitle) secTitle.textContent = doc.title;
        if (secBadge) {
          secBadge.textContent = cpuInst.name;
          secBadge.style.borderLeftColor = cpuInst.color;
        }

        this.secStop();
        this.secEditor.setCode(doc.code);
        this.secConsoleView.clear();
        if (this.secCpu.consoleBuffer) {
          this.secConsoleView.appendStdout(this.secCpu.consoleBuffer);
        }

        const secCached = this.secDocExecCache.get(doc.id);
        const canReuse = secCached && secCached.code === doc.code && secCached.asmResult && secCached.asmResult.errors.length === 0;

        if (canReuse) {
          this.secCurrentAsmResult = secCached.asmResult;
          this.secIpToLineMap = secCached.ipToLineMap;
          this.secEditor.clearErrors();
          this.setSecondaryDirty(false);
          const btnRun = document.getElementById('btn-sec-run') as HTMLButtonElement;
          const btnNext = document.getElementById('btn-sec-next') as HTMLButtonElement;
          if (btnRun) btnRun.disabled = false;
          if (btnNext) btnNext.disabled = false;
          this.secSyncActiveLine();
          this.secUpdateViews();
        } else {
          this.secCompile();
          this.secUpdateViews();
        }

        // Sync secondary challenge panel if challenge doc
        const btnSecTest = document.getElementById('btn-sec-complete-and-test') as HTMLButtonElement;
        if (doc.type === 'challenge' && doc.challengeId) {
          const ch = CHALLENGES[doc.challengeId] || null;
          this.secChallengePanel.setChallenge(ch);
          if (btnSecTest) btnSecTest.style.display = 'inline-flex';
        } else {
          this.secChallengePanel.setChallenge(null);
          if (btnSecTest) btnSecTest.style.display = 'none';
        }
      }

      this.restorePaneScroll('secondary', doc);

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
      roadmap: '🗺️ Yol Haritası'
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

    const lecture = MILESTONE_LECTURES[milestoneId];
    const title = lecture ? `Ders: ${lecture.title}` : `Aşama ${milestoneId} Dersi`;
    const newDoc = this.workspace.openDocument({
      title,
      type: 'lecture',
      milestoneId,
      code: `; 🎓 ${title}\n; Bu ders için interaktif örnekler dokümanın içinde yer almaktadır.\n`
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
        roadmap: '🗺️ Yol Haritası'
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

      this.secStop();
      this.secondaryDocId = null;
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
      const dragInfo = (window as any).__assemblySimDraggedDoc;
      const isRight = rightZone.classList.contains('active');
      const targetPane: 'primary' | 'secondary' = isRight ? 'secondary' : 'primary';
      const isBlocked = this.isDocAlreadyOpenInPane(targetPane, dragInfo);
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = isBlocked ? 'none' : 'copy';
      }
      showOverlay();
      updateZoneHover(e.clientX);
    });

    dropOverlay.addEventListener('dragover', (e) => {
      if (!isOurDrag(e)) return;
      e.preventDefault();
      const dragInfo = (window as any).__assemblySimDraggedDoc;
      const isRight = rightZone.classList.contains('active');
      const targetPane: 'primary' | 'secondary' = isRight ? 'secondary' : 'primary';
      const isBlocked = this.isDocAlreadyOpenInPane(targetPane, dragInfo);
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = isBlocked ? 'none' : 'copy';
      }
      updateZoneHover(e.clientX);
    });

    dropOverlay.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      const rawData = e.dataTransfer?.getData('application/x-assemblysim-doc') || e.dataTransfer?.getData('text/plain');
      const isRight = rightZone.classList.contains('active');
      const targetPane: 'primary' | 'secondary' = isRight ? 'secondary' : 'primary';

      hideOverlay();
      document.body.classList.remove('is-dragging-doc');
      (window as any).__assemblySimDraggedDoc = null;

      if (!rawData) return;

      try {
        const parsed = JSON.parse(rawData);

        // Do not drop onto itself!
        if (this.isDocAlreadyOpenInPane(targetPane, parsed)) {
          return;
        }

        if (parsed.kind === 'workspace-doc' && parsed.docId) {
          const doc = this.workspace.getAllDocuments().find(d => d.id === parsed.docId);
          if (doc) {
            this.openDocumentInPane(targetPane, doc);
            this.setActivePane(targetPane);
          }
        } else if (parsed.kind === 'learning-doc' && parsed.tab) {
          this.openLearningDocInPane(targetPane, parsed.tab as ManualTab);
          this.setActivePane(targetPane);
        }
      } catch (err) {
        console.warn('Drop payload parse error', err);
      }
    });

    // Make editor title bars draggable between panes
    const primTitle = document.getElementById('primary-editor-title-wrap');
    if (primTitle) {
      primTitle.setAttribute('draggable', 'true');
      primTitle.addEventListener('dragstart', (e) => {
        const payload = JSON.stringify({ kind: 'workspace-doc', docId: this.primaryDocId });
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
        document.body.classList.add('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = { kind: 'workspace-doc', docId: this.primaryDocId };
      });
      primTitle.addEventListener('dragend', () => {
        document.body.classList.remove('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = null;
        hideOverlay();
      });
    }

    const secTitle = document.getElementById('sec-editor-title-wrap');
    if (secTitle) {
      secTitle.setAttribute('draggable', 'true');
      secTitle.addEventListener('dragstart', (e) => {
        if (!this.secondaryDocId) return;
        const payload = JSON.stringify({ kind: 'workspace-doc', docId: this.secondaryDocId });
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
        document.body.classList.add('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = { kind: 'workspace-doc', docId: this.secondaryDocId };
      });
      secTitle.addEventListener('dragend', () => {
        document.body.classList.remove('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = null;
        hideOverlay();
      });
    }

    const secHeaderTitle = document.getElementById('secondary-pane-title-wrap');
    if (secHeaderTitle) {
      secHeaderTitle.setAttribute('draggable', 'true');
      secHeaderTitle.addEventListener('dragstart', (e) => {
        if (!this.secondaryDocId) return;
        const payload = JSON.stringify({ kind: 'workspace-doc', docId: this.secondaryDocId });
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
        document.body.classList.add('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = { kind: 'workspace-doc', docId: this.secondaryDocId };
      });
      secHeaderTitle.addEventListener('dragend', () => {
        document.body.classList.remove('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = null;
        hideOverlay();
      });
    }
  }

  // =========================================================================
  // BUTTON EVENTS & SHORTCUTS
  // =========================================================================

  private attachButtonEvents(): void {
    // Primary Controls
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

    // Primary Format Switch
    document.querySelectorAll('.btn-fmt:not([data-sec-fmt])').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-fmt:not([data-sec-fmt])').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const fmt = btn.getAttribute('data-fmt') as 'hex' | 'dec' | 'bin';
        this.registerPanel.setFormat(fmt);
        this.updateViews();
      });
    });

    // Primary Speed Switch
    document.querySelectorAll('.btn-speed:not([data-sec-speed])').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-speed:not([data-sec-speed])').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSpeed = (btn.getAttribute('data-speed') as ExecutionSpeed) || '1';
      });
    });

    // Secondary Controls
    const btnSecCompile = document.getElementById('btn-sec-compile') as HTMLButtonElement;
    const btnSecRun = document.getElementById('btn-sec-run') as HTMLButtonElement;
    const btnSecNext = document.getElementById('btn-sec-next') as HTMLButtonElement;
    const btnSecStop = document.getElementById('btn-sec-stop') as HTMLButtonElement;
    const btnSecReset = document.getElementById('btn-sec-reset') as HTMLButtonElement;
    const btnSecStepBack = document.getElementById('btn-sec-step-back') as HTMLButtonElement;
    const btnSecCompleteAndTest = document.getElementById('btn-sec-complete-and-test') as HTMLButtonElement;

    btnSecCompile?.addEventListener('click', () => this.secCompile());
    btnSecNext?.addEventListener('click', () => this.secStep());
    btnSecRun?.addEventListener('click', () => this.secRun());
    btnSecStop?.addEventListener('click', () => this.secStop());
    btnSecReset?.addEventListener('click', () => this.secReset());
    btnSecStepBack?.addEventListener('click', () => this.secStepBack());
    btnSecCompleteAndTest?.addEventListener('click', () => {
      this.secChallengePanel.executeTest();
    });

    // Secondary Format Switch
    document.querySelectorAll('[data-sec-fmt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-sec-fmt]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const fmt = btn.getAttribute('data-sec-fmt') as 'hex' | 'dec' | 'bin';
        this.secRegisterPanel.setFormat(fmt);
        this.secUpdateViews();
      });
    });

    // Secondary Speed Switch
    document.querySelectorAll('[data-sec-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-sec-speed]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.secSpeed = (btn.getAttribute('data-sec-speed') as ExecutionSpeed) || '1';
      });
    });

    // Keyboard shortcuts: F10 = NEXT, F5 = RUN/STOP (targets active pane!)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        if (this.activePane === 'secondary' && this.isSplitMode) {
          this.secStep();
        } else {
          this.step();
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (this.activePane === 'secondary' && this.isSplitMode) {
          if (this.secIsRunning) this.secStop();
          else this.secRun();
        } else {
          if (this.isRunning) this.stop();
          else this.run();
        }
      }
    });
  }

  // =========================================================================
  // PRIMARY CPU & EDITOR EXECUTION LOGIC
  // =========================================================================

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
      this.setPrimaryDirty(true);
      return false;
    }

    if (statusBadge) {
      statusBadge.textContent = 'HAZIR';
      statusBadge.className = 'console-status-badge ready';
    }

    this.editor.clearErrors();
    this.consoleView.log(`✓ Program başarıyla derlendi (${result.bytes.length} bayt). Giriş noktası: CS:${result.origin.toString(16).toUpperCase().padStart(4, '0')}h`, 'success');

    this.setPrimaryDirty(false);

    this.cpu.loadCOM(result.bytes, result.origin);
    this.applyChallengeEnvironmentIfAny();

    this.ipToLineMap.clear();
    for (const item of result.listing) {
      this.ipToLineMap.set(item.addr, item.line);
    }

    this.docExecCache.set(this.primaryDocId, {
      code,
      asmResult: result,
      ipToLineMap: new Map(this.ipToLineMap)
    });

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
    const activeDoc = this.workspace.getAllDocuments().find(d => d.id === this.primaryDocId);
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
    if (this.isPrimaryDirty) {
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

    if (this.isPrimaryDirty) {
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
      return 300;
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

    if (btnRun) btnRun.disabled = false;
    if (btnStop) btnStop.disabled = true;
    if (btnNext) btnNext.disabled = this.cpu.halted && !this.isPrimaryDirty;
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

  // =========================================================================
  // SECONDARY CPU & EDITOR EXECUTION LOGIC
  // =========================================================================

  private secCompile(): boolean {
    this.secStop();
    if (!this.secCpu) return false;
    const code = this.secEditor.getCode();
    const result = Assembler.assemble(code);
    this.secCurrentAsmResult = result;

    const btnCompile = document.getElementById('btn-sec-compile') as HTMLButtonElement;
    this.secConsoleView.clear();

    if (result.errors.length > 0) {
      this.secEditor.setErrors(result.errors);
      result.errors.forEach(err => this.secConsoleView.log(`❌ [Derleme Hatası] Satır ${err.line}: ${err.message}`, 'error'));
      this.setSecondaryDirty(true);
      return false;
    }

    this.secEditor.clearErrors();
    this.secConsoleView.log(`✓ Program başarıyla derlendi (${result.bytes.length} bayt). Giriş noktası: CS:${result.origin.toString(16).toUpperCase().padStart(4, '0')}h`, 'success');
    this.setSecondaryDirty(false);

    this.secCpu.loadCOM(result.bytes, result.origin);
    this.applySecChallengeEnvironmentIfAny();

    this.secIpToLineMap.clear();
    for (const item of result.listing) {
      this.secIpToLineMap.set(item.addr, item.line);
    }

    if (this.secondaryDocId) {
      this.secDocExecCache.set(this.secondaryDocId, {
        code,
        asmResult: result,
        ipToLineMap: new Map(this.secIpToLineMap)
      });
    }

    const viewAddr = result.origin === 0x0100 ? 0x0000 : result.origin;
    this.secMemoryView.jumpToPhys(viewAddr);

    this.secSyncActiveLine();
    this.secUpdateViews();

    const btnRun = document.getElementById('btn-sec-run') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-sec-next') as HTMLButtonElement;
    if (btnRun) btnRun.disabled = false;
    if (btnNext) btnNext.disabled = false;

    return true;
  }

  private applySecChallengeEnvironmentIfAny(): void {
    if (!this.secCpu) return;
    const secDoc = this.secondaryDocId ? this.workspace.getAllDocuments().find(d => d.id === this.secondaryDocId) : null;
    if (secDoc && secDoc.type === 'challenge' && secDoc.challengeId) {
      const challenge = CHALLENGES[secDoc.challengeId];
      if (challenge && challenge.testSetup) {
        ChallengeRunner.applySetup(this.secCpu, challenge.testSetup);
        const memCount = challenge.testSetup.initialMemory?.length || 0;
        const hasRegs = challenge.testSetup.initialRegisters !== undefined;
        if (memCount > 0 || hasRegs) {
          this.secConsoleView.log(`💡 Görev Ortamı Hazırlandı: ${hasRegs ? 'Yazmaçlar ' : ''}${memCount > 0 ? 've Ön Tanımlı Bellek Blokları' : ''} izole CPU ortamına yüklendi.`, 'info');
        }
        if (challenge.testSetup.initialMemory && challenge.testSetup.initialMemory.length > 0) {
          const first = challenge.testSetup.initialMemory[0];
          const phys = (first.segment << 4) + first.offset;
          this.secMemoryView.jumpToPhys(phys);
        }
      }
    }
  }

  private secReset(): void {
    this.secStop();
    if (!this.secCpu) return;
    this.secConsoleView.setWaitingForInput(false);
    if (this.secCurrentAsmResult && this.secCurrentAsmResult.errors.length === 0) {
      this.secCpu.loadCOM(this.secCurrentAsmResult.bytes, this.secCurrentAsmResult.origin);
      this.applySecChallengeEnvironmentIfAny();
      this.secSyncActiveLine();
      this.secConsoleView.log('Program başlangıç durumuna sıfırlandı.', 'info');
    } else {
      this.secCpu.reset();
      this.applySecChallengeEnvironmentIfAny();
      this.secEditor.setActiveLine(null);
      this.secConsoleView.log('Simülatör sıfırlandı.', 'info');
    }

    const btnRun = document.getElementById('btn-sec-run') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-sec-next') as HTMLButtonElement;
    if (btnRun) btnRun.disabled = false;
    if (btnNext) btnNext.disabled = false;

    this.secUpdateViews();
  }

  private secStep(): void {
    if (!this.secCpu) return;
    if (this.isSecondaryDirty) {
      if (!this.secCompile()) return;
    }
    if (this.secCurrentAsmResult && this.secCurrentAsmResult.errors.length > 0) {
      return;
    }

    if (this.secCpu.halted) {
      this.secConsoleView.log('Program sonlandı (HLT). Yeniden çalıştırmak için RESET butonuna basın.', 'info');
      return;
    }

    const info = this.secCpu.step();

    if (info.error) {
      this.secStop();
      const line = this.secIpToLineMap.get(this.secCpu.regs.ip) || 1;
      this.secEditor.setErrors([{ line, message: info.error }]);
      this.secConsoleView.log(`❌ [Çalışma Hatası] Satır ${line}: ${info.error}`, 'error');
      return;
    }

    if (info.consoleText) {
      if (info.consoleText.startsWith('[')) {
        const isPort = info.consoleText.includes('Port');
        this.secConsoleView.log(info.consoleText, isPort ? 'port' : 'info');
      } else {
        this.secConsoleView.appendStdout(info.consoleText);
      }
    }

    if (info.waitingForInput) {
      this.secWasRunningBeforeInput = false;
      this.secStop();
      this.secConsoleView.setWaitingForInput(true);
      this.secSyncActiveLine();
      this.secUpdateViews();
      return;
    }

    if (info.halted) {
      this.secStop();
      this.secConsoleView.log('Program sonlandı (HLT).', 'warn');
    }

    this.secSyncActiveLine();
    this.secUpdateViews(info.changedRegs, info.changedFlags);
  }

  private secRun(): void {
    if (this.secIsRunning || !this.secCpu) return;

    if (this.isSecondaryDirty) {
      if (!this.secCompile()) return;
    }
    if (this.secCurrentAsmResult && this.secCurrentAsmResult.errors.length > 0) {
      return;
    }

    if (this.secCpu.halted) {
      this.secReset();
    }

    this.secIsRunning = true;
    const btnRun = document.getElementById('btn-sec-run') as HTMLButtonElement;
    const btnStop = document.getElementById('btn-sec-stop') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-sec-next') as HTMLButtonElement;

    if (btnRun) btnRun.disabled = true;
    if (btnStop) btnStop.disabled = false;
    if (btnNext) btnNext.disabled = true;

    const getDelay = (): number => {
      if (this.secSpeed === '0.5') return 600;
      if (this.secSpeed === '2') return 100;
      return 300;
    };

    const loop = () => {
      if (!this.secIsRunning || !this.secCpu) return;

      const currentLine = this.secIpToLineMap.get(this.secCpu.regs.ip);
      if (currentLine !== undefined && this.secEditor.isBreakpoint(currentLine)) {
        this.secStop();
        this.secConsoleView.log(`Kesme noktasına ulaşıldı (Satır ${currentLine}).`, 'warn');
        this.secSyncActiveLine();
        this.secUpdateViews();
        return;
      }

      const info = this.secCpu.step();

      if (info.consoleText) {
        if (info.consoleText.startsWith('[')) {
          const isPort = info.consoleText.includes('Port');
          this.secConsoleView.log(info.consoleText, isPort ? 'port' : 'info');
        } else {
          this.secConsoleView.appendStdout(info.consoleText);
        }
      }

      if (info.waitingForInput) {
        this.secWasRunningBeforeInput = true;
        this.secStop();
        this.secConsoleView.setWaitingForInput(true);
        this.secSyncActiveLine();
        this.secUpdateViews();
        return;
      }

      if (info.halted || info.error) {
        this.secStop();
        if (info.error) {
          this.secEditor.setErrors([{ line: currentLine || 1, message: info.error }]);
          this.secConsoleView.log(`Çalışma Hatası: ${info.error}`, 'error');
        } else {
          this.secConsoleView.log('Program sonlandı (HLT).', 'warn');
        }
        this.secSyncActiveLine();
        this.secUpdateViews();
        return;
      }

      this.secSyncActiveLine();
      this.secUpdateViews();

      this.secRunTimer = window.setTimeout(loop, getDelay());
    };

    loop();
  }

  private secStop(): void {
    this.secIsRunning = false;
    if (this.secRunTimer !== null) {
      clearTimeout(this.secRunTimer);
      this.secRunTimer = null;
    }

    const btnRun = document.getElementById('btn-sec-run') as HTMLButtonElement;
    const btnStop = document.getElementById('btn-sec-stop') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-sec-next') as HTMLButtonElement;

    if (btnRun) btnRun.disabled = !this.secCpu;
    if (btnStop) btnStop.disabled = true;
    if (btnNext) btnNext.disabled = this.secCpu ? (this.secCpu.halted && !this.isSecondaryDirty) : true;
  }

  private secStepBack(): void {
    this.secStop();
    if (this.secCpu && this.secCpu.stepBack()) {
      this.secSyncActiveLine();
      this.secUpdateViews();
    }
  }

  private secSyncActiveLine(): void {
    if (!this.secCpu) return;
    const line = this.secIpToLineMap.get(this.secCpu.regs.ip);
    this.secEditor.setActiveLine(line !== undefined ? line : null);
  }

  private secUpdateViews(changedRegs: string[] = [], changedFlags: string[] = []): void {
    if (!this.secCpu) return;
    this.secRegisterPanel.update(this.secCpu.regs, this.secCpu.flags, changedRegs, changedFlags);
    this.secMemoryView.render(this.secCpu.mem, this.secCpu.regs);

    const btnStepBack = document.getElementById('btn-sec-step-back') as HTMLButtonElement;
    if (btnStepBack) {
      btnStepBack.disabled = !this.secCpu.canStepBack();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
