import { Assembler, AsmResult } from '../assembler/assembler.js';
import { CPU, CpuStepInfo } from '../cpu/cpu.js';
import { TooltipManager } from './tooltip.js';
import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceFile, WorkspaceProject } from '../workspace/types.js';
import { WorkspaceSidebar } from './sidebar.js';
import { Editor } from './editor.js';
import { RegisterPanel, NumberFormat } from './registerPanel.js';
import { MemoryView } from './memoryView.js';
import { ConsoleView } from './console.js';
import { InstructionDoc } from './instructionDoc.js';
import { GraphView } from './graph/graphView.js';
import { StudyView } from '../study/studyView.js';
import { TopBar } from './topbar.js';

export type ExecutionSpeed = '0.5' | '1' | '2' | 'max';

export function getSpeedDelayMs(speed: ExecutionSpeed): number {
  switch (speed) {
    case '0.5':
      return 600;
    case '2':
      return 100;
    case 'max':
      return 10;
    case '1':
    default:
      return 300;
  }
}

export function getSpeedBatchSize(speed: ExecutionSpeed): number {
  switch (speed) {
    case '0.5':
      return 10;
    case '2':
      return 3000;
    case 'max':
      return 15000;
    case '1':
    default:
      return 1000;
  }
}

interface AddressSourceInfo {
  fileId: string;
  line: number;
}

export class App {
  private cpu: CPU;
  private workspace: WorkspaceManager;
  private sidebar!: WorkspaceSidebar;
  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;
  private consoleView!: ConsoleView;
  private instructionDoc!: InstructionDoc;
  private graphView!: GraphView;
  private studyView!: StudyView;
  private topbar!: TopBar;

  // Computer Execution State
  private isCompiled: boolean = false;
  private addrToSourceMap: Map<number, AddressSourceInfo> = new Map();
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private speed: ExecutionSpeed = '1';
  private isDirty: boolean = false;
  private isManualOpen: boolean = false;
  private isGraphOpen: boolean = false;
  private isStudyOpen: boolean = false;

  // UI Element References
  private appMainContent!: HTMLElement;
  private mainIdeLayout!: HTMLElement;
  private manualViewMount!: HTMLElement;
  private graphViewMount!: HTMLElement;
  private studyViewMount!: HTMLElement;
  private tabsBarEl!: HTMLElement;
  private btnCompile!: HTMLButtonElement;
  private btnRun!: HTMLButtonElement;
  private btnNext!: HTMLButtonElement;
  private btnStop!: HTMLButtonElement;
  private btnReset!: HTMLButtonElement;
  private btnStepBack!: HTMLButtonElement;
  private btnHeaderManual!: HTMLButtonElement;
  private btnHeaderGraph?: HTMLButtonElement | null;
  private btnHeaderStudy?: HTMLButtonElement | null;

  constructor() {
    this.cpu = new CPU();
    this.workspace = new WorkspaceManager({
      onProjectChange: () => {
        this.renderTabs();
        this.sidebar?.render();
        this.topbar?.render();
      },
      onActiveFileChange: (file) => {
        this.loadFileToEditor(file);
      }
    });

    TooltipManager.init();
    this.initLayout();
    this.initModules();
    this.bindEvents();

    // Wire VRAM writes
    this.cpu.mem.onVramWrite = () => {
      this.consoleView.updateVram(this.cpu.mem.data);
    };
    this.consoleView.updateVram(this.cpu.mem.data);

    // Post-BIOS initial state (0000:7C00h bootloader landing)
    this.cpu.regs.ip = 0x7C00;
    this.cpu.regs.sp = 0x7C00;
    this.cpu.flags.if = true;
    this.updateCpuViews();

    const activeFile = this.workspace.getActiveFile();
    this.loadFileToEditor(activeFile);
  }

  private initLayout(): void {
    const appEl = document.getElementById('app');
    if (!appEl) throw new Error('#app element not found');

    appEl.innerHTML = `
      <div class="app-window-wrapper">
        <!-- VS Code Tarzı Üst Çubuk (Title & Menubar) -->
        <div id="topbar-mount"></div>

        <div class="app-layout-root">
        <!-- Sol Kenar Çubuğu (Workspace / Proje Gezgini) -->
        <div id="sidebar-mount"></div>

        <!-- Ana Çalışma Alanı -->
        <div class="app-main-content">
          <!-- IDE Düzeni -->
          <main class="main-layout" id="main-ide-layout">
            <!-- Sol Bölüm: Editör ve Konsol -->
            <section class="editor-section">
              <!-- Editör Üst Barı -->
              <div class="editor-header-bar">
                <div class="editor-header-left">
                  <!-- 8086 Assembly Dersleri & Zihin Haritası Butonu -->
                  <button id="btn-header-open-study" class="btn-ctrl" style="background: #fef3c7; color: #92400e; border-color: #fde68a; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;" title="8086 Assembly Dersleri, Zihin Haritası ve Not Defteri">
                    <span>🎓</span> Dersler
                  </button>

                  <!-- 8086 Sinir Ağı & Bilgi Grafı Butonu -->
                  <button id="btn-header-open-graph" class="btn-ctrl" style="background: #f0fdf4; color: #15803d; border-color: #86efac; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;" title="8086 Sinir Ağı ve Bilgi Haritası">
                    <span>🧠</span> Bilgi Grafı
                  </button>

                  <button id="btn-header-open-manual" class="btn-ctrl" style="background: #eff6ff; color: #1d4ed8; border-color: #93c5fd; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;" title="8086 Komut Seti ve Referans Manueli">
                    <span>📖</span> Manuel
                  </button>
                </div>

                <div class="editor-toolbar-right">
                  <!-- Format Seçici (HEX / DEC / BIN) -->
                  <div class="format-switch-group">
                    <button class="btn-fmt active" data-fmt="hex">HEX</button>
                    <button class="btn-fmt" data-fmt="dec">DEC</button>
                    <button class="btn-fmt" data-fmt="bin">BIN</button>
                  </div>

                  <!-- Çalışma Hızı (0.5x / 1x / 2x / MAX) -->
                  <div class="speed-switch-group">
                    <button class="btn-speed" data-speed="0.5" title="0.5x Yavaş (600ms)">0.5x</button>
                    <button class="btn-speed active" data-speed="1" title="1x Normal Hız (300ms)">1x</button>
                    <button class="btn-speed" data-speed="2" title="2x Hızlı (100ms)">2x</button>
                    <button class="btn-speed" data-speed="max" title="MAX Hız (100 satır/sn - 10ms)">MAX</button>
                  </div>

                  <div class="toolbar-group-divider"></div>

                  <!-- Aksiyon Butonları (Bilgisayarı Çalıştır) -->
                  <div class="action-buttons-group">
                    <button id="btn-compile" class="btn-compile" title="Tüm projeyi belleğe yükle">
                      COMPILE
                      <span class="compile-dirty-dot" style="display: none;" title="Derlenmemiş değişiklikler var"></span>
                    </button>
                    <button id="btn-run" class="btn-ctrl" title="Bilgisayarı çalıştır (F5)">RUN</button>
                    <button id="btn-next" class="btn-ctrl" title="Bir adım ilerlet (F10)">NEXT</button>
                    <button id="btn-stop" class="btn-ctrl" disabled title="Çalışmayı duraklat">STOP</button>
                    <button id="btn-reset" class="btn-ctrl" title="İşlemciyi ve belleği sıfırla">RESET</button>
                    <button id="btn-step-back" class="btn-ctrl btn-step-back" title="Geri Adım Al (Step Back)" disabled>↶</button>
                  </div>
                </div>
              </div>

              <!-- Çoklu Dosya Sekmeleri (Tabs Bar) -->
              <div class="editor-tabs-bar" id="editor-tabs-bar"></div>

              <!-- Kod Editörü Alanı -->
              <div id="editor-container"></div>

              <!-- Konsol & VRAM Ekranı -->
              <div id="console-container" class="console-section-wrapper"></div>
            </section>

            <!-- Sağ Bölüm: 8086 Registerları & 1 MB RAM -->
            <section class="cpu-section">
              <div id="registers-container"></div>
              <div id="memory-container"></div>
            </section>
          </main>

          <!-- Komut Manueli Görünümü -->
          <div id="manual-view-mount" class="reference-doc-mount" style="display: none; width: 100%;"></div>

          <!-- 8086 Sinir Ağı & Bilgi Grafı Mount -->
          <div id="graph-view-mount" class="graph-view-mount" style="display: none; width: 100%; height: 100%;"></div>

          <!-- 8086 Dersler & Zihin Haritası Mount -->
          <div id="study-view-mount" class="study-view-mount" style="display: none; width: 100%; height: 100%;"></div>
      </div>
        </div>
      </div>
    `;

    // Cache elements
    this.appMainContent = document.querySelector('.app-main-content') as HTMLElement;
    this.mainIdeLayout = document.getElementById('main-ide-layout')!;
    this.manualViewMount = document.getElementById('manual-view-mount')!;
    this.graphViewMount = document.getElementById('graph-view-mount')!;
    this.studyViewMount = document.getElementById('study-view-mount')!;
    this.tabsBarEl = document.getElementById('editor-tabs-bar')!;
    this.btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
    this.btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    this.btnNext = document.getElementById('btn-next') as HTMLButtonElement;
    this.btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    this.btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
    this.btnStepBack = document.getElementById('btn-step-back') as HTMLButtonElement;
    this.btnHeaderManual = document.getElementById('btn-header-open-manual') as HTMLButtonElement;
    this.btnHeaderGraph = document.getElementById('btn-header-open-graph') as HTMLButtonElement | null;
    this.btnHeaderStudy = document.getElementById('btn-header-open-study') as HTMLButtonElement | null;
  }

  private initModules(): void {
    const sidebarMount = document.getElementById('sidebar-mount')!;
    const editorContainer = document.getElementById('editor-container')!;
    // Konsol ve CRT monitör ekrandan kaldırıldı (headless container)
    const consoleContainer = document.createElement('div');
    const registersContainer = document.getElementById('registers-container')!;
    const memoryContainer = document.getElementById('memory-container')!;

    // 0. TopBar (VS Code Menubar)
    const topbarMount = document.getElementById('topbar-mount')!;
    this.topbar = new TopBar(topbarMount, this.workspace, {
      onNewProject: () => {
        this.resetExecutionAndCpu();
        this.sidebar.render();
        this.renderTabs();
        this.showEditor();
        this.consoleView.log(`🚀 Yeni proje oluşturuldu: [${this.workspace.getProject().name}]`, 'info');
      },
      onOpenProject: () => {
        this.resetExecutionAndCpu();
        this.sidebar.render();
        this.renderTabs();
        this.showEditor();
        this.consoleView.log(`📂 Proje açıldı: [${this.workspace.getProject().name}]`, 'info');
      },
      onExportProject: () => {
        this.consoleView.log(`💾 Proje dışa aktarıldı: [${this.workspace.getProject().name}.8086.json]`, 'info');
      },
      onImportProject: () => {
        this.resetExecutionAndCpu();
        this.sidebar.render();
        this.renderTabs();
        this.showEditor();
        this.consoleView.log(`📥 Proje içe aktarıldı: [${this.workspace.getProject().name}]`, 'info');
      },
      onRenameProject: (newName) => {
        this.sidebar.render();
        this.consoleView.log(`✏️ Proje adı güncellendi: [${newName}]`, 'info');
      },
      onOpenManual: () => this.showManual(),
      onOpenGraph: () => this.showGraph(),
      onOpenStudy: () => this.showStudy(),
      isManualOpen: () => this.isManualOpen,
      isGraphOpen: () => this.isGraphOpen,
      isStudyOpen: () => this.isStudyOpen
    });

    // 1. Sidebar (Workspace Explorer)
    this.sidebar = new WorkspaceSidebar(sidebarMount, this.workspace, {
      onFileSelect: (file) => {
        this.showEditor();
        this.switchToFile(file.id);
      },
      onNewFile: () => {
        this.showEditor();
        this.flushCurrentEditorState();
        const newFile = this.workspace.createFile();
        this.switchToFile(newFile.id);
      },
      onSetEntryFile: (fileId) => {
        this.setDirty(true);
      },
      onDeleteFile: () => {
        const active = this.workspace.getActiveFile();
        this.loadFileToEditor(active);
      },
      onOpenManual: () => {
        this.showManual();
      },
      onOpenGraph: () => {
        this.showGraph();
      },
      onOpenStudy: () => {
        this.showStudy();
      },
      getActiveFileId: () => this.workspace.getActiveFile()?.id,
      isManualOpen: () => this.isManualOpen,
      isGraphOpen: () => this.isGraphOpen,
      isStudyOpen: () => this.isStudyOpen
    });

    // 2. Editor
    this.editor = new Editor({
      container: editorContainer,
      initialCode: '',
      onSave: () => {
        this.flushCurrentEditorState();
        this.setDirty(false);
        const active = this.workspace.getActiveFile();
        this.consoleView.log(`💾 [${active?.name || 'Belge'}] Değişiklikler kaydedildi.`, 'info');
      },
      onCodeChange: (code) => {
        const activeFile = this.workspace.getActiveFile();
        if (activeFile) {
          this.workspace.updateFileCode(
            activeFile.id,
            code,
            this.editor.getScroll(),
            this.editor.getCursor()
          );
          this.setDirty(true);
        }
      }
    });

    // 3. Console & VRAM View
    this.consoleView = new ConsoleView(consoleContainer, {
      memory: this.cpu.mem,
      onInput: (input) => {
        this.cpu.feedInput(input);
        this.consoleView.setWaitingForInput(false);
        if (!this.isRunning && !this.cpu.halted) {
          this.handleRun();
        }
      },
      onVideoModeChange: (mode) => {
        this.cpu.mem.writeByte(0, 0x0449, mode, false);
      }
    });

    // 4. Register Panel
    this.registerPanel = new RegisterPanel(registersContainer);

    // 5. Memory View
    this.memoryView = new MemoryView(memoryContainer);

    // 6. Instruction Doc (Komut Manueli)
    this.instructionDoc = new InstructionDoc(this.manualViewMount, {
      onReturnToEditor: () => this.showEditor(),
      onInsertCodeToEditor: (name, code) => {
        this.flushCurrentEditorState();
        const file = this.workspace.createFile(name, code);
        this.showEditor();
        this.switchToFile(file.id);
      }
    });

    // 7. Graph View (8086 Sinir Ağı & Bilgi Grafı)
    this.graphView = new GraphView(this.graphViewMount, {
      onReturnToEditor: () => this.showEditor(),
      onInsertCodeToEditor: (code) => {
        this.showEditor();
        const activeFile = this.workspace.getActiveFile();
        const current = this.editor.getCode();
        const updated = current.trimEnd() + '\n\n' + code + '\n';
        this.editor.setCode(updated);
        this.workspace.updateFileCode(activeFile.id, updated);
        this.setDirty(true);
        this.consoleView.log('✓ Bilgi grafından örnek kod editöre aktarıldı.', 'info');
      },
      onOpenInManual: (opcode) => {
        this.showManual();
        this.instructionDoc.openInstruction(opcode);
      }
    });

    // 8. Study View (8086 Assembly Dersleri, Zihin Haritası & Not Defteri)
    this.studyView = new StudyView(this.studyViewMount, {
      onReturnToEditor: () => this.showEditor(),
      onInsertCodeToEditor: (code) => {
        this.showEditor();
        const activeFile = this.workspace.getActiveFile();
        if (activeFile) {
          const current = this.editor.getCode();
          const updated = current.trimEnd() + '\n\n' + code + '\n';
          this.editor.setCode(updated);
          this.workspace.updateFileCode(activeFile.id, updated);
          this.setDirty(true);
          this.consoleView.log('✓ Ders görevinden kod editöre aktarıldı.', 'info');
        }
      }
    });

    this.renderTabs();
    this.updateCpuViews();
  }

  private renderTabs(): void {
    const project = this.workspace.getProject();
    const openFiles = project.openFileIds.map(id => this.workspace.getFile(id)).filter(Boolean) as WorkspaceFile[];

    this.tabsBarEl.innerHTML = openFiles.map(file => {
      const isActive = file.id === project.activeFileId;
      return `
        <div class="editor-tab-item ${isActive ? 'active' : ''}" data-file-id="${file.id}">
          <span class="tab-icon">📄</span>
          <span class="tab-name">${this.escapeHtml(file.name)}</span>
          ${openFiles.length > 1 ? `
            <button class="btn-tab-close" data-close-id="${file.id}" title="Sekmeyi Kapat">×</button>
          ` : ''}
        </div>
      `;
    }).join('') + `
      <button id="btn-tab-new-file" title="Yeni Dosya Ekle">＋</button>
    `;

    // Bind tab clicks
    this.tabsBarEl.querySelectorAll<HTMLElement>('.editor-tab-item').forEach(tab => {
      tab.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-tab-close')) return;
        const fileId = tab.getAttribute('data-file-id');
        if (fileId) {
          this.switchToFile(fileId);
        }
      });
    });

    // Close tab clicks
    this.tabsBarEl.querySelectorAll<HTMLButtonElement>('.btn-tab-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const closeId = btn.getAttribute('data-close-id');
        if (closeId) {
          this.flushCurrentEditorState();
          this.editor.removeFileHistory(closeId);
          this.workspace.closeTab(closeId);
        }
      });
    });

    // New file tab button
    const newBtn = this.tabsBarEl.querySelector('#btn-tab-new-file');
    newBtn?.addEventListener('click', () => {
      this.flushCurrentEditorState();
      const file = this.workspace.createFile();
      this.switchToFile(file.id);
    });
  }

  private flushCurrentEditorState(): void {
    if (!this.workspace || !this.editor) return;
    const current = this.workspace.getActiveFile();
    if (current) {
      const code = this.editor.getCode();
      const scroll = this.editor.getScroll();
      const cursor = this.editor.getCursor();
      this.workspace.updateFileCode(current.id, code, scroll, cursor);
    }
  }

  private switchToFile(fileId: string): void {
    if (!fileId) return;
    const current = this.workspace.getActiveFile();
    if (current && current.id === fileId) return;
    this.flushCurrentEditorState();
    this.workspace.setActiveFile(fileId);
  }

  private loadFileToEditor(file: WorkspaceFile): void {
    if (!file) return;
    this.editor.openFile(file.id, file.code, file.editorScroll, file.editorCursor);
    this.editor.clearErrors();
    this.renderTabs();
    this.sidebar?.render();
  }

  private bindEvents(): void {
    // Toolbar Buttons
    this.btnCompile.addEventListener('click', () => this.handleCompileWorkspace());
    this.btnRun.addEventListener('click', () => this.handleRun());
    this.btnNext.addEventListener('click', () => this.handleNext());
    this.btnStop.addEventListener('click', () => this.handleStop());
    this.btnReset.addEventListener('click', () => this.handleReset());
    this.btnStepBack.addEventListener('click', () => this.handleStepBack());
    this.btnHeaderManual.addEventListener('click', () => this.toggleManual());
    this.btnHeaderGraph?.addEventListener('click', () => this.toggleGraph());
    this.btnHeaderStudy?.addEventListener('click', () => this.toggleStudy());

    // Format switches
    const fmtButtons = document.querySelectorAll<HTMLButtonElement>('.btn-fmt');
    fmtButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const fmt = btn.getAttribute('data-fmt') as NumberFormat;
        if (fmt) {
          fmtButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.registerPanel.setFormat(fmt);
        }
      });
    });

    // Speed switches
    const speedButtons = document.querySelectorAll<HTMLButtonElement>('.btn-speed');
    speedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const spd = btn.getAttribute('data-speed') as ExecutionSpeed;
        if (spd) {
          this.speed = spd;
          speedButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (this.isRunning) {
            this.handleStop();
            this.handleRun();
          }
        }
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.flushCurrentEditorState();
        this.setDirty(false);
        const active = this.workspace.getActiveFile();
        this.consoleView.log(`💾 [${active?.name || 'Belge'}] Değişiklikler kaydedildi.`, 'info');
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();
        if (this.isManualOpen || this.isGraphOpen || this.isStudyOpen) this.showEditor();
        if (this.isRunning) {
          this.handleStop();
        } else {
          this.handleRun();
        }
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (this.isManualOpen || this.isGraphOpen || this.isStudyOpen) this.showEditor();
        if (!this.isRunning) {
          this.handleNext();
        }
      } else if (e.key === 'Escape') {
        if (this.isRunning) {
          this.handleStop();
        } else if (this.isManualOpen || this.isGraphOpen || this.isStudyOpen) {
          this.showEditor();
        }
        return;
      }

      // Direct keystroke feed when CPU is waiting for input (e.g. INT 16h / INT 21h)
      if (this.consoleView.isWaitingForInput()) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key !== 'F5' && e.key !== 'F10' && e.key !== 'F12') {
          e.preventDefault();
          const charToSend = e.key === 'Enter' ? '\r' : (e.key.length === 1 ? e.key : ' ');
          this.cpu.feedInput(charToSend);
          this.consoleView.setWaitingForInput(false);
          if (!this.isRunning && !this.cpu.halted) {
            this.handleRun();
          }
        }
      }
    });

    window.addEventListener('beforeunload', () => {
      this.flushCurrentEditorState();
    });
  }

  showStudy(): void {
    this.flushCurrentEditorState();
    this.isStudyOpen = true;
    this.isGraphOpen = false;
    this.isManualOpen = false;
    this.appMainContent?.classList.remove('graph-active');
    this.mainIdeLayout.style.display = 'none';
    this.manualViewMount.style.display = 'none';
    this.graphViewMount.style.display = 'none';
    this.studyViewMount.style.display = 'flex';
    this.studyView?.render();
    this.topbar?.render();
    this.sidebar?.render();
  }

  showGraph(): void {
    this.flushCurrentEditorState();
    this.isGraphOpen = true;
    this.isManualOpen = false;
    this.isStudyOpen = false;
    this.appMainContent?.classList.add('graph-active');
    this.mainIdeLayout.style.display = 'none';
    this.manualViewMount.style.display = 'none';
    this.studyViewMount.style.display = 'none';
    this.graphViewMount.style.display = 'flex';
    this.graphView?.onShow();
    this.topbar?.render();
    this.sidebar?.render();
  }

  showManual(): void {
    this.flushCurrentEditorState();
    this.isManualOpen = true;
    this.isGraphOpen = false;
    this.isStudyOpen = false;
    this.appMainContent?.classList.remove('graph-active');
    this.mainIdeLayout.style.display = 'none';
    this.graphViewMount.style.display = 'none';
    this.studyViewMount.style.display = 'none';
    this.manualViewMount.style.display = 'block';
    this.topbar?.render();
    this.sidebar?.render();
  }

  showEditor(): void {
    this.isManualOpen = false;
    this.isGraphOpen = false;
    this.isStudyOpen = false;
    this.appMainContent?.classList.remove('graph-active');
    this.manualViewMount.style.display = 'none';
    this.graphViewMount.style.display = 'none';
    this.studyViewMount.style.display = 'none';
    this.mainIdeLayout.style.display = 'grid';
    this.topbar?.render();
    this.sidebar?.render();
  }

  toggleStudy(): void {
    if (this.isStudyOpen) {
      this.showEditor();
    } else {
      this.showStudy();
    }
  }

  toggleManual(): void {
    if (this.isManualOpen) {
      this.showEditor();
    } else {
      this.showManual();
    }
  }

  toggleGraph(): void {
    if (this.isGraphOpen) {
      this.showEditor();
    } else {
      this.showGraph();
    }
  }

  private setDirty(dirty: boolean): void {
    this.isDirty = dirty;
    const dot = this.btnCompile?.querySelector('.compile-dirty-dot') as HTMLElement | null;
    if (dot) {
      dot.style.display = dirty ? 'inline-block' : 'none';
    }
  }

  /**
   * 1981 IBM PC BIOS POST & Bellek Derlemesi:
   * Projedeki tüm dosyalar kendi ORG adreslerine göre doğrudan 1 MB RAM'e yazılır.
   * BIOS önyüklemesi gerçekleştirilir (0000:7C00h bootloader landing).
   */
  private handleCompileWorkspace(): boolean {
    const currentActiveFile = this.workspace.getActiveFile();
    if (currentActiveFile) {
      const editorCode = this.editor.getCode();
      this.workspace.updateFileCode(currentActiveFile.id, editorCode);
    }

    const project = this.workspace.getProject();
    const files = project.files;

    this.addrToSourceMap.clear();
    this.cpu.reset();

    let bootFileWith7C00: { file: WorkspaceFile; origin: number } | null = null;
    let activeFileOrigin = 0x100;

    // 1. Projedeki tüm dosyaları derleyip doğrudan 1 MB RAM'e yaz
    for (const file of files) {
      const codeToAssemble = (currentActiveFile && file.id === currentActiveFile.id)
        ? this.editor.getCode()
        : file.code;

      const res = Assembler.assemble(codeToAssemble);

      if (res.errors.length > 0) {
        this.flushCurrentEditorState();
        if (this.workspace.getActiveFile().id !== file.id) {
          this.switchToFile(file.id);
        }
        this.editor.setErrors(res.errors);
        this.consoleView.log(`❌ [${file.name}] Derleme Hatası: ${res.errors.length} hata bulundu.`, 'error');
        res.errors.forEach(err => {
          this.consoleView.log(`  • [${file.name}] Satır ${err.line}: ${err.message}`, 'error');
        });
        this.isCompiled = false;
        return false;
      }

      // Origin hesabı: Açıkça ORG varsa o; yoksa bootloader için 7C00h, genel için 100h
      let origin = res.origin;
      if (origin === 0) {
        const hasExplicitOrg0 = /^\s*ORG\s+0+H?\b/im.test(codeToAssemble);
        if (!hasExplicitOrg0) {
          origin = (file.name.toLowerCase().includes('boot') || codeToAssemble.includes('7C00')) ? 0x7C00 : 0x100;
        }
      }

      if (origin === 0x7C00) {
        bootFileWith7C00 = { file, origin };
      }
      if (currentActiveFile && file.id === currentActiveFile.id) {
        activeFileOrigin = origin;
      }

      // Aktif olmayan dosya aktif dosyanın origin adresini ezmesin
      if (currentActiveFile && file.id !== currentActiveFile.id && origin === activeFileOrigin) {
        continue;
      }
      // 1 MB RAM'e doğrudan baytları yaz
      this.cpu.mem.loadBytes(this.cpu.regs.cs, origin, res.bytes, 'code');

      // Fiziksel adresleri kaynak koda eşle
      for (const item of res.listing) {
        const phys = this.cpu.mem.toPhys(this.cpu.regs.cs, item.addr);
        this.addrToSourceMap.set(phys, { fileId: file.id, line: item.line });
      }
    }

    // 2. BIOS POST & Önyükleme Noktası (Boot Landing)
    // Always boot to the active file's origin (unless user specifically has bootloader as active file)
    let bootOrigin = activeFileOrigin;
    this.cpu.regs.ip = bootOrigin;
    this.cpu.regs.sp = (bootOrigin === 0x7C00) ? 0x7C00 : 0xFFFE;
    if (bootOrigin === 0x7C00) {
      this.cpu.regs.ds = 0x0000;
      this.cpu.regs.es = 0x0000;
      this.cpu.regs.ss = 0x0000;
    }
    this.cpu.flags.if = true;

    this.editor.clearErrors();
    this.setDirty(false);
    this.isCompiled = true;

    // 3. Bellek Görünümünü (MemoryView) doğrudan kodun RAM'e yazıldığı adrese odakla
    const startPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, bootOrigin);
    this.memoryView.syncOrigin(startPhys);
    this.memoryView.jumpToPhys(startPhys);

    // Aktif satırı aydınlat
    this.syncEditorToCurrentIp();

    this.updateStepBackState();
    this.updateCpuViews();
    this.consoleView.updateVram(this.cpu.mem.data);

    this.consoleView.log(`✓ [BIOS POST] 1 MB RAM hazırlandı. Sistem önyüklendi: CS:${this.cpu.regs.ip.toString(16).toUpperCase().padStart(4, '0')}h (${files.length} dosya belleğe yüklendi)`, 'success');
    return true;
  }

  private handleNext(): void {
    if (!this.isCompiled || this.isDirty) {
      const ok = this.handleCompileWorkspace();
      if (!ok) return;
    }

    if (this.cpu.halted) {
      this.consoleView.log('İşlemci durduruldu (HLT). Baştan başlatmak için RESET yapın.', 'warn');
      return;
    }

    let info: CpuStepInfo;
    try {
      info = this.cpu.step();
    } catch (err: any) {
      this.consoleView.log(`❌ Çalışma zamanı hatası: ${err.message || err}`, 'error');
      this.handleStop();
      return;
    }

    if (info.error) {
      this.consoleView.log(`❌ [Donanım Hatası] ${info.error}`, 'error');
      this.handleStop();
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
      this.handleStop();
      this.consoleView.setWaitingForInput(true);
      this.updateCpuViews();
      this.consoleView.updateVram(this.cpu.mem.data);
      return;
    }

    // Follow IP in physical memory: switch tab and line if it moved to another file!
    this.syncEditorToCurrentIp();

    this.updateCpuViews();
    this.updateStepBackState();
    this.consoleView.updateVram(this.cpu.mem.data);

    if (this.cpu.halted) {
      this.consoleView.log('İşlemci durduruldu.', 'info');
      this.handleStop();
    }
  }

  private syncEditorToCurrentIp(): void {
    const currentPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, this.cpu.regs.ip);
    const srcInfo = this.addrToSourceMap.get(currentPhys);

    if (srcInfo) {
      // If IP has stepped into another file, switch editor tab!
      if (this.workspace.getActiveFile().id !== srcInfo.fileId) {
        this.switchToFile(srcInfo.fileId);
      }
      this.editor.setActiveLine(srcInfo.line);
    } else {
      this.editor.setActiveLine(null);
    }
  }

  private handleRun(): void {
    if (!this.isCompiled || this.isDirty) {
      const ok = this.handleCompileWorkspace();
      if (!ok) return;
    }

    if (this.cpu.halted) {
      this.consoleView.log('İşlemci zaten durduruldu. RESET ile baştan başlatın.', 'warn');
      return;
    }

    document.getElementById('console-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    this.isRunning = true;
    this.btnRun.disabled = true;
    this.btnNext.disabled = true;
    this.btnStop.disabled = false;
    this.btnCompile.disabled = true;
    this.consoleView.setRunningState(true);

    const stepLoop = () => {
      if (!this.isRunning) return;

      const batch = getSpeedBatchSize(this.speed);
      for (let i = 0; i < batch; i++) {
        // Check breakpoint on current line
        const currentPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, this.cpu.regs.ip);
        const srcInfo = this.addrToSourceMap.get(currentPhys);
        if (i > 0 && srcInfo && srcInfo.fileId === this.workspace.getActiveFile().id && this.editor.isBreakpoint(srcInfo.line)) {
          this.consoleView.log(`Kesme noktasına (Breakpoint) ulaşıldı: [${this.workspace.getActiveFile().name}] Satır ${srcInfo.line}`, 'info');
          this.syncEditorToCurrentIp();
          this.updateCpuViews();
          this.updateStepBackState();
          this.consoleView.updateVram(this.cpu.mem.data);
          this.handleStop();
          return;
        }

        let info: CpuStepInfo;
        try {
          info = this.cpu.step();
        } catch (err: any) {
          this.consoleView.log(`❌ Çalışma zamanı hatası: ${err.message || err}`, 'error');
          this.handleStop();
          return;
        }

        if (info.error) {
          this.consoleView.log(`❌ [Donanım Hatası] ${info.error}`, 'error');
          this.handleStop();
          return;
        }

        if (info.consoleText && batch === 1) {
          if (info.consoleText.startsWith('[')) {
            const isPort = info.consoleText.includes('Port');
            this.consoleView.log(info.consoleText, isPort ? 'port' : 'info');
          } else {
            this.consoleView.appendStdout(info.consoleText);
          }
        }

        if (info.waitingForInput) {
          this.handleStop();
          this.consoleView.setWaitingForInput(true, 'TUŞ BEKLENİYOR (Bir tuşa basın)');
          (document.activeElement as HTMLElement)?.blur?.();
          this.updateCpuViews();
          this.consoleView.updateVram(this.cpu.mem.data);
          return;
        }

        if (this.cpu.halted) break;
      }

      this.syncEditorToCurrentIp();
      this.updateCpuViews();
      this.updateStepBackState();
      this.consoleView.updateVram(this.cpu.mem.data);

      if (this.cpu.halted) {
        this.consoleView.updateVram(this.cpu.mem.data);
        this.consoleView.log('İşlemci durduruldu.', 'info');
        this.handleStop();
        return;
      }

      this.runTimer = window.setTimeout(stepLoop, getSpeedDelayMs(this.speed));
    };

    this.runTimer = window.setTimeout(stepLoop, getSpeedDelayMs(this.speed));
  }

  private handleStop(): void {
    this.isRunning = false;
    this.consoleView.setRunningState(false);
    if (this.runTimer !== null) {
      clearTimeout(this.runTimer);
      this.runTimer = null;
    }

    if (this.btnRun) this.btnRun.disabled = false;
    if (this.btnNext) this.btnNext.disabled = false;
    if (this.btnStop) this.btnStop.disabled = true;
    if (this.btnCompile) this.btnCompile.disabled = false;
    this.updateStepBackState();
  }

  private resetExecutionAndCpu(): void {
    this.handleStop();
    this.cpu.reset();
    this.cpu.regs.ip = 0x7C00;
    this.cpu.regs.sp = 0x7C00;
    this.cpu.flags.if = true;
    this.editor.setActiveLine(null);
    this.isCompiled = false;
    this.setDirty(false);
    this.addrToSourceMap.clear();
    this.updateStepBackState();
    this.updateCpuViews();
    this.consoleView.clear();
    this.consoleView.updateVram(this.cpu.mem.data);
  }

  private handleReset(): void {
    this.handleStop();
    if (this.isCompiled) {
      this.handleCompileWorkspace();
    } else {
      this.cpu.reset();
      this.cpu.regs.ip = 0x7C00;
      this.cpu.regs.sp = 0x7C00;
      this.cpu.flags.if = true;
      this.editor.setActiveLine(null);
    }

    this.updateStepBackState();
    this.updateCpuViews();
    this.consoleView.clear();
    this.consoleView.updateVram(this.cpu.mem.data);
    this.consoleView.log('Bilgisayar (İşlemci ve RAM) sıfırlandı.', 'info');
  }

  private handleStepBack(): void {
    if (!this.cpu.canStepBack() || this.isRunning) return;

    const ok = this.cpu.stepBack();
    if (ok) {
      this.syncEditorToCurrentIp();
      this.updateCpuViews();
      this.updateStepBackState();
      this.consoleView.updateVram(this.cpu.mem.data);
      this.consoleView.log('Bir adım geri alındı (Step Back).', 'info');
    }
  }

  private updateStepBackState(): void {
    if (this.btnStepBack) {
      this.btnStepBack.disabled = !this.cpu.canStepBack() || this.isRunning;
    }
  }

  private updateCpuViews(): void {
    this.registerPanel?.update(this.cpu.regs, this.cpu.flags);
    this.memoryView?.render(this.cpu.mem, this.cpu.regs);
    this.consoleView?.updateVram(this.cpu.mem.data);
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

// Bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new App();
  });
}
