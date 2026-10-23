import { CPU } from '../cpu/cpu.js';
import { Assembler, AsmResult } from '../assembler/assembler.js';
import { Editor } from './editor.js';
import { RegisterPanel } from './registerPanel.js';
import { MemoryView } from './memoryView.js';
import { TooltipManager } from './tooltip.js';
import { InstructionDoc } from './instructionDoc.js';
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
        <div class="app-main-content">
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

          <!-- Bottom Collapsible Instruction Manual & Roadmap -->
          <div id="instruction-docs-container" class="instruction-docs-wrapper"></div>
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
    const docsContainer = document.getElementById('instruction-docs-container')!;

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
        onOpenCpuModal: () => this.cpuModal.open()
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
        this.openMilestoneLecture(milestoneId);
      },
      getCurrentEditorCode: () => this.editor.getCode()
    });

    const lectureMount = document.getElementById('lecture-doc-mount')!;
    this.lectureDocView = new LectureDocumentView(lectureMount, {
      onNavigateToMilestoneLecture: (milestoneId: string) => {
        this.openMilestoneLecture(milestoneId);
      },
      onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => {
        this.instructionDoc.filterLeetCodeByMilestone(milestoneId, challengeId);
        document.getElementById('instruction-docs-container')?.scrollIntoView({ behavior: 'smooth' });
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
        this.compile();
        const result = ChallengeRunner.grade(ch, code);
        if (result.status === 'COMPILE_ERROR' && result.compileError) {
          this.editor.setErrors([result.compileError]);
        }
        return result;
      },
      onResetEnvironment: () => {
        this.reset();
      },
      onNavigateToLeetCode: () => {
        this.instructionDoc.openTab('leetcode');
        document.getElementById('instruction-docs-container')?.scrollIntoView({ behavior: 'smooth' });
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
    this.updateViews();

    // Initial check for active document challenge status
    const initialDoc = this.workspace.getActiveDocument();
    if (initialDoc && initialDoc.type === 'challenge' && initialDoc.challengeId) {
      this.challengePanel.setChallenge(CHALLENGES[initialDoc.challengeId] || null);
      const btn = document.getElementById('btn-complete-and-test');
      if (btn) btn.style.display = 'inline-flex';
    }
  }

  openMilestoneLecture(milestoneId: string): void {
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
    this.stop();
    const currentActive = this.workspace.getActiveDocument();
    if (currentActive && currentActive.id !== doc.id) {
      if (currentActive.type !== 'lecture') {
        this.workspace.updateActiveCode(this.editor.getCode());
      }
    }

    this.workspace.setActiveDocument(doc.id);
    const cpuInst = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
    this.cpu = cpuInst.cpu;

    const mainIdeLayout = document.getElementById('main-ide-layout');
    const lectureDocMount = document.getElementById('lecture-doc-mount');

    if (doc.type === 'lecture' && doc.milestoneId) {
      if (mainIdeLayout) mainIdeLayout.style.display = 'none';
      if (lectureDocMount) lectureDocMount.style.display = 'block';

      this.lectureDocView.setMilestone(doc.milestoneId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (mainIdeLayout) mainIdeLayout.style.display = 'grid';
      if (lectureDocMount) lectureDocMount.style.display = 'none';

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

    this.consoleView.clear();
    if (result.errors.length > 0) {
      this.editor.setErrors(result.errors);
      result.errors.forEach(err => this.consoleView.log(`Hata (Satır ${err.line}): ${err.message}`, 'error'));
      if (btnCompile) btnCompile.disabled = false;
      return false;
    }

    this.editor.clearErrors();
    this.consoleView.log(`Program başarıyla derlendi (${result.bytes.length} bayt). Giriş noktası: CS:${result.origin.toString(16).toUpperCase().padStart(4, '0')}h`, 'success');

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
    if (this.cpu.halted) return;

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
      this.wasRunningBeforeInput = false;
      this.stop();
      this.consoleView.setWaitingForInput(true);
      this.syncActiveLine();
      this.updateViews();
      return;
    }

    if (info.error) {
      this.stop();
      this.editor.setErrors([{ line: this.ipToLineMap.get(this.cpu.regs.ip) || 1, message: info.error }]);
      this.consoleView.log(`Çalışma Hatası: ${info.error}`, 'error');
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
    if (this.cpu.halted || this.isRunning) return;

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
