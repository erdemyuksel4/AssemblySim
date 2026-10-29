import { CPU } from '../cpu/cpu.js';
import { Assembler, AsmResult } from '../assembler/assembler.js';
import { Editor } from './editor.js';
import { RegisterPanel } from './registerPanel.js';
import { MemoryView } from './memoryView.js';
import { ConsoleView } from './console.js';
import { ChallengePanel } from './challengePanel.js';
import { LectureDocumentView } from '../lectures/lectureDocumentView.js';
import { InstructionDoc, ManualTab } from './instructionDoc.js';
import { CHALLENGES } from '../challenges/challengesData.js';
import { ChallengeRunner } from '../challenges/runner.js';
import { WorkspaceDocument } from '../workspace/types.js';
import { CpuInstance } from '../cpu/instanceManager.js';
import { getTopicById } from '../lectures/topicStudyData.js';
import { Challenge } from '../challenges/types.js';

export type ExecutionSpeed = '0.5' | '1' | '2';

export interface DocExecCacheEntry {
  code: string;
  asmResult: AsmResult | null;
  ipToLineMap: Map<number, number>;
  memBasePhys?: number;
  memUserPinned?: boolean;
}

export interface PaneSessionElements {
  container: HTMLElement;
  ideLayout: HTMLElement | null;
  editorContainer: HTMLElement;
  consoleContainer: HTMLElement;
  registersContainer: HTMLElement;
  memoryContainer: HTMLElement;
  challengeBoxContainer: HTMLElement;
  lectureDocMount: HTMLElement;
  referenceDocMount: HTMLElement;
  editorTitleText?: HTMLElement | null;
  cpuBadge?: HTMLElement | null;
  statusBadge?: HTMLElement | null;
  btnCompile?: HTMLButtonElement | null;
  btnRun?: HTMLButtonElement | null;
  btnNext?: HTMLButtonElement | null;
  btnStop?: HTMLButtonElement | null;
  btnReset?: HTMLButtonElement | null;
  btnStepBack?: HTMLButtonElement | null;
  btnCompleteAndTest?: HTMLButtonElement | null;
  formatButtonsSelector: string;
  speedButtonsSelector: string;
  formatAttr: string;
  speedAttr: string;
  secHeader?: HTMLElement | null;
  secHeaderIcon?: HTMLElement | null;
  secHeaderTitle?: HTMLElement | null;
  secNavSelector?: string;
}

export interface PaneSessionCallbacks {
  onCodeChange: (docId: string, code: string, scroll?: { top: number; left: number }) => void;
  onDirtyChange: (paneId: 'primary' | 'secondary', dirty: boolean) => void;
  onOpenLearningDoc: (tab: ManualTab) => void;
  onOpenMilestoneLecture: (milestoneId: string) => void;
  onReturnToEditor: () => void;
  onTabChange: (tab: ManualTab) => void;
  onOpenInMainEditor: (title: string, code: string) => void;
  onLoadChallengeToEditor: (challenge: Challenge) => void;
  onLoadNextChallenge: (nextCh: Challenge) => void;
  getDocument: (docId: string) => WorkspaceDocument | undefined;
  getAllDocuments: () => WorkspaceDocument[];
  getWorkspace?: () => any;
}

export class PaneSession {
  readonly paneId: 'primary' | 'secondary';
  readonly elements: PaneSessionElements;
  readonly callbacks: PaneSessionCallbacks;

  // Components
  private cpu: CPU;
  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;
  private consoleView!: ConsoleView;
  private challengePanel!: ChallengePanel;
  private lectureDocView!: LectureDocumentView;
  private instructionDoc!: InstructionDoc;

  // Execution State
  private currentDocId: string | null = null;
  private currentAsmResult: AsmResult | null = null;
  private ipToLineMap: Map<number, number> = new Map();
  private isRunningState: boolean = false;
  private runTimer: number | null = null;
  private currentSpeed: ExecutionSpeed = '1';
  private wasRunningBeforeInput: boolean = false;
  private isDirtyState: boolean = false;

  private docExecCache: Map<string, DocExecCacheEntry> = new Map();

  constructor(
    paneId: 'primary' | 'secondary',
    initialCpu: CPU,
    elements: PaneSessionElements,
    callbacks: PaneSessionCallbacks
  ) {
    this.paneId = paneId;
    this.cpu = initialCpu;
    this.elements = elements;
    this.callbacks = callbacks;

    this.initComponents();
    this.attachButtonEvents();
  }

  private initComponents(): void {
    const { elements } = this;

    this.registerPanel = new RegisterPanel(elements.registersContainer);

    this.memoryView = new MemoryView(elements.memoryContainer, (phys) => {
      if (this.currentDocId) {
        const cached = this.docExecCache.get(this.currentDocId);
        if (cached) {
          cached.memBasePhys = phys;
          cached.memUserPinned = true;
        }
      }
    });

    this.consoleView = new ConsoleView(elements.consoleContainer, {
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
      container: elements.editorContainer,
      initialCode: '',
      onCodeChange: () => {
        this.editor.clearErrors();
        if (this.currentDocId) {
          this.callbacks.onCodeChange(this.currentDocId, this.editor.getCode(), this.editor.getScroll());
        }
        this.setDirty(true);
      }
    });

    this.challengePanel = new ChallengePanel(elements.challengeBoxContainer, {
      onTestChallenge: (ch, code) => {
        if (this.currentDocId) {
          this.callbacks.onCodeChange(this.currentDocId, code, this.editor.getScroll());
        }
        this.consoleView.clear();
        this.consoleView.log(`🧪 '${ch.title}' görevi test ediliyor...`, 'info');

        const result = ChallengeRunner.grade(ch, code);

        if (result.status === 'COMPILE_ERROR' && result.compileError) {
          this.editor.setErrors([result.compileError]);
          this.consoleView.log(`❌ [Derleme Hatası] Satır ${result.compileError.line}: ${result.compileError.message}`, 'error');
          if (this.elements.statusBadge) {
            this.elements.statusBadge.textContent = 'DERLEME HATASI';
            this.elements.statusBadge.className = 'console-status-badge error';
          }
        } else if (result.status === 'RUNTIME_ERROR') {
          this.consoleView.log(`❌ [Çalışma Hatası]: ${result.runtimeError || 'Hata'}`, 'error');
          if (this.elements.statusBadge) {
            this.elements.statusBadge.textContent = 'ÇALIŞMA HATASI';
            this.elements.statusBadge.className = 'console-status-badge error';
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
          if (this.elements.statusBadge) {
            this.elements.statusBadge.textContent = 'BAŞARILI';
            this.elements.statusBadge.className = 'console-status-badge ready';
          }
        }

        return result;
      },
      onResetEnvironment: () => {
        this.reset();
      },
      onNavigateToLeetCode: () => {
        this.callbacks.onOpenLearningDoc('leetcode');
      },
      onLoadNextChallenge: (nextCh) => {
        this.callbacks.onLoadNextChallenge(nextCh);
      },
      getCurrentCode: () => this.editor.getCode()
    });

    this.instructionDoc = new InstructionDoc(elements.referenceDocMount, {
      onLoadChallengeToEditor: (ch) => {
        this.callbacks.onLoadChallengeToEditor(ch);
      },
      onOpenLectureDocument: (milestoneId) => {
        this.callbacks.onOpenMilestoneLecture(milestoneId);
      },
      onReturnToEditor: () => {
        this.callbacks.onReturnToEditor();
      },
      onTabChange: (tab) => {
        this.callbacks.onTabChange(tab);
      },
      onOpenInMainEditor: (title: string, code: string) => {
        this.callbacks.onOpenInMainEditor(title, code);
      },
      getCurrentEditorCode: () => this.editor.getCode()
    });

    this.lectureDocView = new LectureDocumentView(elements.lectureDocMount, {
      onNavigateToMilestoneLecture: (milestoneId: string) => {
        this.callbacks.onOpenMilestoneLecture(milestoneId);
      },
      onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => {
        this.callbacks.onOpenLearningDoc('leetcode');
        this.instructionDoc.filterLeetCodeByMilestone(milestoneId, challengeId);
      },
      onNavigateToRoadmap: () => {
        this.callbacks.onOpenLearningDoc('roadmap');
      },
      onOpenInMainEditor: (title: string, code: string) => {
        this.callbacks.onOpenInMainEditor(title, code);
      }
    });
  }

  private attachButtonEvents(): void {
    const { elements } = this;

    elements.btnCompile?.addEventListener('click', () => this.compile());
    elements.btnNext?.addEventListener('click', () => this.step());
    elements.btnRun?.addEventListener('click', () => this.run());
    elements.btnStop?.addEventListener('click', () => this.stop());
    elements.btnReset?.addEventListener('click', () => this.reset());
    elements.btnStepBack?.addEventListener('click', () => this.stepBack());
    elements.btnCompleteAndTest?.addEventListener('click', () => {
      this.challengePanel.executeTest();
    });

    // Format switches
    document.querySelectorAll(elements.formatButtonsSelector).forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(elements.formatButtonsSelector).forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const fmt = btn.getAttribute(elements.formatAttr) as 'hex' | 'dec' | 'bin';
        if (fmt) {
          this.registerPanel.setFormat(fmt);
          this.updateViews();
        }
      });
    });

    // Speed switches
    document.querySelectorAll(elements.speedButtonsSelector).forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(elements.speedButtonsSelector).forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = btn.getAttribute(elements.speedAttr) as ExecutionSpeed;
        if (speed) {
          this.currentSpeed = speed;
        }
      });
    });
  }

  // =========================================================================
  // EXECUTION ACTIONS
  // =========================================================================

  setDirty(dirty: boolean): void {
    this.isDirtyState = dirty;
    const btn = this.elements.btnCompile;
    const dot = btn?.querySelector('.compile-dirty-dot') as HTMLElement | null;
    if (dot) {
      dot.style.display = dirty ? 'inline-block' : 'none';
    }
    if (btn) {
      btn.title = dirty ? 'Derlenmemiş değişiklikler var. Yeniden derlemek için tıklayın.' : 'Kodu derle';
    }
    if (dirty && !this.isRunningState) {
      if (this.elements.btnRun) this.elements.btnRun.disabled = false;
      if (this.elements.btnNext) this.elements.btnNext.disabled = false;
    }
    this.callbacks.onDirtyChange(this.paneId, dirty);
  }

  compile(): boolean {
    this.stop();
    const code = this.editor.getCode();
    const result = Assembler.assemble(code);
    this.currentAsmResult = result;

    const statusBadge = this.elements.statusBadge;
    this.consoleView.clear();

    if (result.errors.length > 0) {
      this.editor.setErrors(result.errors);
      if (statusBadge) {
        statusBadge.textContent = `${result.errors.length} DERLEME HATASI`;
        statusBadge.className = 'console-status-badge error';
      }
      result.errors.forEach(err => this.consoleView.log(`❌ [Derleme Hatası] Satır ${err.line}: ${err.message}`, 'error'));
      this.setDirty(true);
      return false;
    }

    if (statusBadge) {
      statusBadge.textContent = 'HAZIR';
      statusBadge.className = 'console-status-badge ready';
    }

    this.editor.clearErrors();
    this.consoleView.log(`✓ Program başarıyla derlendi (${result.bytes.length} bayt). Giriş noktası: CS:${result.origin.toString(16).toUpperCase().padStart(4, '0')}h`, 'success');

    this.setDirty(false);

    this.cpu.loadCOM(result.bytes, result.origin);
    this.applyChallengeEnvironmentIfAny();

    this.ipToLineMap.clear();
    for (const item of result.listing) {
      this.ipToLineMap.set(item.addr, item.line);
    }

    const prevCached = this.currentDocId ? this.docExecCache.get(this.currentDocId) : undefined;
    const prevOriginPhys = prevCached?.asmResult
      ? this.cpu.mem.toPhys(this.cpu.regs.cs, prevCached.asmResult.origin)
      : undefined;
    const originPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, result.origin);

    let memUserPinned = prevCached?.memUserPinned ?? false;
    let memBasePhys = prevCached?.memBasePhys;
    if (!memUserPinned || (prevOriginPhys !== undefined && prevOriginPhys !== originPhys)) {
      memUserPinned = false;
      memBasePhys = originPhys;
    }

    this.memoryView.restoreViewState(originPhys, memBasePhys, memUserPinned);

    if (this.currentDocId) {
      this.docExecCache.set(this.currentDocId, {
        code,
        asmResult: result,
        ipToLineMap: new Map(this.ipToLineMap),
        memBasePhys: this.memoryView.getBasePhys(),
        memUserPinned: this.memoryView.isUserPinned()
      });
    }

    this.syncActiveLine();
    this.updateViews();

    if (this.elements.btnRun) this.elements.btnRun.disabled = false;
    if (this.elements.btnNext) this.elements.btnNext.disabled = false;

    return true;
  }

  applyChallengeEnvironmentIfAny(): void {
    if (!this.currentDocId) return;
    const doc = this.callbacks.getDocument(this.currentDocId);
    if (doc && doc.type === 'challenge' && doc.challengeId) {
      const challenge = CHALLENGES[doc.challengeId];
      if (challenge && challenge.testSetup) {
        ChallengeRunner.applySetup(this.cpu, challenge.testSetup);
        const memCount = challenge.testSetup.initialMemory?.length || 0;
        const hasRegs = challenge.testSetup.initialRegisters !== undefined;
        if (memCount > 0 || hasRegs) {
          this.consoleView.log(`💡 Görev Ortamı Hazırlandı: ${hasRegs ? 'Yazmaçlar ' : ''}${memCount > 0 ? 've Ön Tanımlı Bellek Blokları' : ''} izole CPU ortamına yüklendi.`, 'info');
        }
      }
    }
  }

  reset(): void {
    this.stop();
    this.consoleView.setWaitingForInput(false);
    if (this.currentAsmResult && this.currentAsmResult.errors.length === 0) {
      this.cpu.loadCOM(this.currentAsmResult.bytes, this.currentAsmResult.origin);
      this.applyChallengeEnvironmentIfAny();
      const originPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, this.currentAsmResult.origin);
      this.memoryView.syncOrigin(originPhys);
      this.syncActiveLine();
      this.consoleView.log('Program başlangıç durumuna sıfırlandı.', 'info');
    } else {
      this.cpu.reset();
      this.applyChallengeEnvironmentIfAny();
      this.editor.setActiveLine(null);
      this.consoleView.log('Simülatör sıfırlandı.', 'info');
    }

    if (this.elements.btnRun) this.elements.btnRun.disabled = false;
    if (this.elements.btnNext) this.elements.btnNext.disabled = false;
    if (this.elements.btnStop) this.elements.btnStop.disabled = true;

    this.updateViews();
  }

  step(): void {
    if (this.isDirtyState) {
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
      if (this.elements.statusBadge) {
        this.elements.statusBadge.textContent = 'ÇALIŞMA HATASI';
        this.elements.statusBadge.className = 'console-status-badge error';
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

  run(): void {
    if (this.isRunningState) return;

    if (this.isDirtyState) {
      if (!this.compile()) return;
    }
    if (this.currentAsmResult && this.currentAsmResult.errors.length > 0) {
      return;
    }

    if (this.cpu.halted) {
      this.reset();
    }

    this.isRunningState = true;
    if (this.elements.btnRun) this.elements.btnRun.disabled = true;
    if (this.elements.btnStop) this.elements.btnStop.disabled = false;
    if (this.elements.btnNext) this.elements.btnNext.disabled = true;

    const getDelay = (): number => {
      if (this.currentSpeed === '0.5') return 600;
      if (this.currentSpeed === '2') return 100;
      return 300;
    };

    const loop = () => {
      if (!this.isRunningState) return;

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

  stop(): void {
    this.isRunningState = false;
    if (this.runTimer !== null) {
      clearTimeout(this.runTimer);
      this.runTimer = null;
    }

    if (this.elements.btnRun) this.elements.btnRun.disabled = false;
    if (this.elements.btnStop) this.elements.btnStop.disabled = true;
    if (this.elements.btnNext) this.elements.btnNext.disabled = this.cpu.halted && !this.isDirtyState;
  }

  stepBack(): void {
    this.stop();
    if (this.cpu.stepBack()) {
      this.syncActiveLine();
      this.updateViews();
    }
  }

  syncActiveLine(): void {
    const line = this.ipToLineMap.get(this.cpu.regs.ip);
    this.editor.setActiveLine(line !== undefined ? line : null);
  }

  updateViews(changedRegs: string[] = [], changedFlags: string[] = []): void {
    this.registerPanel.update(this.cpu.regs, this.cpu.flags, changedRegs, changedFlags);
    this.memoryView.render(this.cpu.mem, this.cpu.regs);

    if (this.elements.btnStepBack) {
      this.elements.btnStepBack.disabled = !this.cpu.canStepBack();
    }
  }

  // =========================================================================
  // DOCUMENT VIEW STATE & SWITCHING
  // =========================================================================

  openDocument(doc: WorkspaceDocument, cpuInst: CpuInstance): void {
    this.currentDocId = doc.id;
    this.cpu = cpuInst.cpu;

    const {
      ideLayout,
      lectureDocMount,
      referenceDocMount,
      editorTitleText,
      cpuBadge,
      secHeader,
      secHeaderIcon,
      secHeaderTitle,
      secNavSelector
    } = this.elements;

    if (doc.type === 'lecture' && doc.milestoneId) {
      if (ideLayout) ideLayout.style.display = 'none';
      if (referenceDocMount) referenceDocMount.style.display = 'none';
      if (secHeader) secHeader.style.display = 'flex';
      if (lectureDocMount) lectureDocMount.style.display = 'block';

      this.lectureDocView.setMilestone(doc.milestoneId);
      if (secHeader) {
        const topic = getTopicById(doc.milestoneId);
        if (secHeaderIcon) secHeaderIcon.textContent = topic ? topic.icon : '🎓';
        if (secHeaderTitle) secHeaderTitle.textContent = topic ? `Konu ${topic.number}: ${topic.shortTitle}` : 'Konu Anlatımı';
        if (secNavSelector) {
          document.querySelectorAll(secNavSelector).forEach(b => b.classList.remove('active'));
          document.querySelector(`${secNavSelector}[data-sec-nav="lectures"]`)?.classList.add('active');
        }
      }
    } else if (doc.type === 'reference' && doc.referenceTab) {
      if (ideLayout) ideLayout.style.display = 'none';
      if (lectureDocMount) lectureDocMount.style.display = 'none';
      if (secHeader) secHeader.style.display = 'flex';
      if (referenceDocMount) referenceDocMount.style.display = 'block';

      this.instructionDoc.openTab(doc.referenceTab);
      if (secHeader) {
        const tabTitles: Record<ManualTab, { icon: string; title: string }> = {
          manual: { icon: '📖', title: '8086 Komut Manueli' },
          lectures: { icon: '🎓', title: 'Dersler & Teori Kataloğu' },
          leetcode: { icon: '⚡', title: '8086 LeetCode Arenası' },
          roadmap: { icon: '🗺️', title: 'Müfredat Yol Haritası' },
          studynotes: { icon: '📝', title: 'Çalışma Notları & Vize Hazırlık' }
        };
        const info = tabTitles[doc.referenceTab] || { icon: '📚', title: 'Öğrenme Merkezi' };
        if (secHeaderIcon) secHeaderIcon.textContent = info.icon;
        if (secHeaderTitle) secHeaderTitle.textContent = info.title;
        if (secNavSelector) {
          document.querySelectorAll(secNavSelector).forEach(b => b.classList.remove('active'));
          document.querySelector(`${secNavSelector}[data-sec-nav="${doc.referenceTab}"]`)?.classList.add('active');
        }
      }
    } else {
      // Code / Challenge document
      if (secHeader) secHeader.style.display = 'none';
      if (lectureDocMount) lectureDocMount.style.display = 'none';
      if (referenceDocMount) referenceDocMount.style.display = 'none';
      if (ideLayout) ideLayout.style.display = 'grid';

      if (editorTitleText) editorTitleText.textContent = doc.title;
      if (cpuBadge) {
        cpuBadge.textContent = cpuInst.name;
        cpuBadge.style.borderLeftColor = cpuInst.color;
      }

      this.stop();
      this.editor.setCode(doc.code);
      this.consoleView.clear();
      if (this.cpu.consoleBuffer) {
        this.consoleView.appendStdout(this.cpu.consoleBuffer);
      }

      const cached = this.docExecCache.get(doc.id);
      const canReuse = cached && cached.code === doc.code && cached.asmResult && cached.asmResult.errors.length === 0;

      if (canReuse) {
        this.currentAsmResult = cached.asmResult;
        this.ipToLineMap = cached.ipToLineMap;
        this.editor.clearErrors();
        this.setDirty(false);
        const originPhys = this.cpu.mem.toPhys(this.cpu.regs.cs, cached.asmResult!.origin);
        this.memoryView.restoreViewState(originPhys, cached.memBasePhys, cached.memUserPinned);
        if (this.elements.btnRun) this.elements.btnRun.disabled = false;
        if (this.elements.btnNext) this.elements.btnNext.disabled = false;
        this.syncActiveLine();
        this.updateViews();
      } else {
        const originPhys = cached?.asmResult ? this.cpu.mem.toPhys(this.cpu.regs.cs, cached.asmResult.origin) : 0x00100;
        this.memoryView.restoreViewState(originPhys, cached?.memBasePhys, cached?.memUserPinned);
        this.compile();
        this.updateViews();
      }

      // Sync challenge panel
      const btnTest = this.elements.btnCompleteAndTest;
      if (doc.type === 'challenge' && doc.challengeId) {
        const ch = CHALLENGES[doc.challengeId] || null;
        this.challengePanel.setChallenge(ch);
        if (btnTest) btnTest.style.display = 'inline-flex';
      } else {
        this.challengePanel.setChallenge(null);
        if (btnTest) btnTest.style.display = 'none';
      }
    }
  }

  saveScrollAndState(doc: WorkspaceDocument): void {
    let scroll = 0;
    if (doc.type === 'lecture') {
      scroll = this.elements.lectureDocMount?.scrollTop || this.elements.container?.scrollTop || 0;
    } else if (doc.type === 'reference') {
      scroll = this.elements.referenceDocMount?.scrollTop || this.elements.container?.scrollTop || 0;
    } else {
      scroll = this.elements.container?.scrollTop || 0;
      doc.editorScroll = this.editor.getScroll();
      doc.code = this.editor.getCode();
    }
    doc.scrollTop = scroll;
  }

  restoreScroll(doc: WorkspaceDocument): void {
    const targetScroll = doc.scrollTop || 0;
    const applyScroll = () => {
      if (doc.type === 'lecture') {
        if (this.elements.lectureDocMount) this.elements.lectureDocMount.scrollTop = targetScroll;
      } else if (doc.type === 'reference') {
        if (this.elements.referenceDocMount) this.elements.referenceDocMount.scrollTop = targetScroll;
      }
      if (this.elements.container) this.elements.container.scrollTop = targetScroll;

      if (doc.editorScroll) {
        this.editor.setScroll(doc.editorScroll);
      }
    };

    requestAnimationFrame(applyScroll);
    setTimeout(applyScroll, 40);
  }

  // =========================================================================
  // GETTERS & SETTERS
  // =========================================================================

  getCpu(): CPU {
    return this.cpu;
  }

  setCpu(cpu: CPU): void {
    this.cpu = cpu;
  }

  getEditor(): Editor {
    return this.editor;
  }

  getRegisterPanel(): RegisterPanel {
    return this.registerPanel;
  }

  getMemoryView(): MemoryView {
    return this.memoryView;
  }

  getConsoleView(): ConsoleView {
    return this.consoleView;
  }

  getChallengePanel(): ChallengePanel {
    return this.challengePanel;
  }

  getLectureDocView(): LectureDocumentView {
    return this.lectureDocView;
  }

  getInstructionDoc(): InstructionDoc {
    return this.instructionDoc;
  }

  getCurrentDocId(): string | null {
    return this.currentDocId;
  }

  setCurrentDocId(id: string | null): void {
    this.currentDocId = id;
  }

  getAsmResult(): AsmResult | null {
    return this.currentAsmResult;
  }

  get isRunning(): boolean {
    return this.isRunningState;
  }

  get isDirty(): boolean {
    return this.isDirtyState;
  }

  getDocExecCache(): Map<string, DocExecCacheEntry> {
    return this.docExecCache;
  }
}
