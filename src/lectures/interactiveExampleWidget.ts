import { CPU } from '../cpu/cpu.js';
import { Assembler, AsmResult } from '../assembler/assembler.js';
import { Editor } from '../ui/editor.js';
import { RegisterPanel, NumberFormat } from '../ui/registerPanel.js';
import { MemoryView } from '../ui/memoryView.js';
import { ConsoleView } from '../ui/console.js';
import { LectureExample } from './lectureData.js';

export interface ExampleWidgetCallbacks {
  onOpenInMainEditor?: (title: string, code: string) => void;
}

export type WidgetSpeed = '0.5' | '1' | '2';

export class InteractiveExampleWidget {
  private container: HTMLElement;
  private example: LectureExample;
  private callbacks: ExampleWidgetCallbacks;
  private cpu: CPU;

  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;
  private consoleView!: ConsoleView;

  private currentAsmResult: AsmResult | null = null;
  private ipToLineMap: Map<number, number> = new Map();
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private currentSpeed: WidgetSpeed = '1';
  private wasRunningBeforeInput: boolean = false;
  private showSolution: boolean = false;

  constructor(container: HTMLElement, example: LectureExample, callbacks: ExampleWidgetCallbacks = {}) {
    this.container = container;
    this.example = example;
    this.callbacks = callbacks;
    this.cpu = new CPU();

    this.render();
    this.initSubModules();
    this.compile();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="embedded-ide-card">
        <!-- Top Toolbar Header Bar -->
        <div class="embedded-ide-header">
          <div class="embedded-header-left">
            <span class="embedded-status-badge">⚡ Canlı 8086 IDE & Editör</span>
            <h3 class="embedded-title">${this.escapeHtml(this.example.title)}</h3>
          </div>
          <div class="embedded-header-actions">
            <button class="btn-reveal-solution-toggle">
              ${this.showSolution ? '🙈 Çözümü Gizle' : '💡 Çözümü & Açıklamayı Göster'}
            </button>
            <button class="btn-export-to-main" title="Bu örneği tam ekran ana çalışma alanına aktar">
              🚀 Ana Editörde Aç
            </button>
          </div>
        </div>

        ${this.example.scenario ? `
          <div class="embedded-scenario-bar">
            <strong>📋 Senaryo:</strong> ${this.escapeHtml(this.example.scenario)}
          </div>
        ` : ''}

        ${this.example.task ? `
          <div class="embedded-desc-bar">
            <strong>🎯 Görev:</strong> ${this.escapeHtml(this.example.task)}
          </div>
        ` : ''}

        <!-- Solution Drawer (collapsible) -->
        <div class="embedded-solution-drawer" style="display: ${this.showSolution ? 'block' : 'none'};">
          <div class="solution-drawer-header">
            <div class="solution-header-title">
              <span class="sol-icon">💡</span>
              <span class="sol-text">Öğretmen Referans Çözümü & Sınav Analizi</span>
            </div>
            <button class="btn-load-solution-into-editor" title="Bu kodu doğrudan editöre aktar ve derle">
              📥 Bu Çözümü Editöre Yükle ve Derle
            </button>
          </div>

          <div class="solution-code-container">
            <div class="solution-code-label">Assembly Kaynak Kodu:</div>
            <pre class="solution-code-block"><code>${this.escapeHtml(this.example.solutionCode || this.example.code)}</code></pre>
          </div>

          ${this.example.solutionBreakdown && this.example.solutionBreakdown.length > 0 ? `
            <div class="solution-breakdown-box">
              <div class="sol-sub-title">Satır Satır Çözüm Mantığı:</div>
              <ul class="solution-breakdown-list">
                ${this.example.solutionBreakdown.map(b => `<li>${this.escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${this.example.examTips ? `
            <div class="solution-exam-tip-box">
              <div class="exam-tip-title">⚠️ Vize / Final Sınav İpucu:</div>
              <div class="exam-tip-text">${this.escapeHtml(this.example.examTips)}</div>
            </div>
          ` : ''}
        </div>

        <!-- The EXACT Main IDE Layout Grid -->
        <div class="embedded-ide-grid main-layout">
          <!-- Left Section: Code Editor + Console -->
          <section class="editor-section">
            <div class="editor-header-bar">
              <h4 class="editor-title">
                Code Editor
                <span class="info-btn" data-info-title="Gömülü 8086 Editörü" data-info-desc="Bu derse özel tam işlevli 8086 editörü. Kodu dilediğiniz gibi düzenleyip derleyebilirsiniz." tabindex="-1">i</span>
              </h4>
              <div class="editor-toolbar-right">
                <!-- Format Switch (HEX / DEC / BIN) -->
                <div class="format-switch-group">
                  <button class="btn-fmt active" data-fmt="hex">HEX</button>
                  <button class="btn-fmt" data-fmt="dec">DEC</button>
                  <button class="btn-fmt" data-fmt="bin">BIN</button>
                  <span class="info-btn" data-info-title="Sayı Formatı" data-info-desc="Yazmaç değerlerini HEX, DEC veya BIN tabanda görüntüler." tabindex="-1">i</span>
                </div>

                <!-- Speed Switch (0.5x / 1x / 2x) -->
                <div class="speed-switch-group">
                  <button class="btn-speed" data-speed="0.5" title="0.5x Yavaş (600ms)">0.5x</button>
                  <button class="btn-speed active" data-speed="1" title="1x Normal (300ms)">1x</button>
                  <button class="btn-speed" data-speed="2" title="2x Hızlı (100ms)">2x</button>
                  <span class="info-btn" data-info-title="Çalışma Hızı" data-info-desc="RUN ile çalıştırma hızını ayarlar." tabindex="-1">i</span>
                </div>

                <button class="btn-compile">COMPILE</button>
                <button class="btn-run btn-ctrl">RUN</button>
                <button class="btn-next btn-ctrl">NEXT</button>
                <button class="btn-stop btn-ctrl" disabled>STOP</button>
                <button class="btn-reset btn-ctrl">RESET</button>
                <button class="btn-step-back btn-ctrl" title="Geri Adım Al (Step Back)" disabled>↶</button>
              </div>
            </div>

            <div class="embedded-editor-container"></div>
            <div class="embedded-console-container console-section-wrapper"></div>
          </section>

          <!-- Right Section: Registers & Memory -->
          <section class="cpu-section">
            <div class="embedded-registers-container"></div>
            <div class="embedded-memory-container"></div>
          </section>
        </div>
      </div>
    `;
  }

  private initSubModules(): void {
    const editorContainer = this.container.querySelector('.embedded-editor-container') as HTMLElement;
    const consoleContainer = this.container.querySelector('.embedded-console-container') as HTMLElement;
    const registersContainer = this.container.querySelector('.embedded-registers-container') as HTMLElement;
    const memoryContainer = this.container.querySelector('.embedded-memory-container') as HTMLElement;

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
      initialCode: this.example.code,
      onCodeChange: () => {
        this.editor.clearErrors();
        const btnCompile = this.container.querySelector('.btn-compile') as HTMLButtonElement;
        if (btnCompile) btnCompile.disabled = false;
      }
    });

    this.attachButtonEvents();
  }

  private attachButtonEvents(): void {
    const btnCompile = this.container.querySelector('.btn-compile') as HTMLButtonElement;
    const btnRun = this.container.querySelector('.btn-run') as HTMLButtonElement;
    const btnNext = this.container.querySelector('.btn-next') as HTMLButtonElement;
    const btnStop = this.container.querySelector('.btn-stop') as HTMLButtonElement;
    const btnReset = this.container.querySelector('.btn-reset') as HTMLButtonElement;
    const btnStepBack = this.container.querySelector('.btn-step-back') as HTMLButtonElement;

    btnCompile?.addEventListener('click', () => this.compile());
    btnRun?.addEventListener('click', () => this.run());
    btnNext?.addEventListener('click', () => this.step());
    btnStop?.addEventListener('click', () => this.stop());
    btnReset?.addEventListener('click', () => this.reset());
    btnStepBack?.addEventListener('click', () => this.stepBack());

    // Format switches
    this.container.querySelectorAll('.btn-fmt').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.btn-fmt').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const fmt = btn.getAttribute('data-fmt') as NumberFormat;
        this.registerPanel.setFormat(fmt);
        this.updateViews();
      });
    });

    // Speed switches
    this.container.querySelectorAll('.btn-speed').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.btn-speed').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSpeed = (btn.getAttribute('data-speed') as WidgetSpeed) || '1';
      });
    });

    // Solution drawer toggle
    const btnSolutionToggle = this.container.querySelector('.btn-reveal-solution-toggle') as HTMLButtonElement;
    const drawer = this.container.querySelector('.embedded-solution-drawer') as HTMLElement;
    btnSolutionToggle?.addEventListener('click', () => {
      this.showSolution = !this.showSolution;
      if (drawer) {
        drawer.style.display = this.showSolution ? 'block' : 'none';
      }
      btnSolutionToggle.innerHTML = this.showSolution ? '🙈 Çözümü Gizle' : '💡 Çözümü & Açıklamayı Göster';
    });

    // Load solution into editor button
    const btnLoadSol = this.container.querySelector('.btn-load-solution-into-editor') as HTMLButtonElement;
    btnLoadSol?.addEventListener('click', () => {
      const codeToLoad = this.example.solutionCode || this.example.code;
      this.editor.setCode(codeToLoad);
      this.compile();
      this.consoleView.log('💡 Referans çözüm kodu editöre aktarıldı ve derlendi.', 'success');
      this.container.querySelector('.editor-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Export to main IDE
    const btnExport = this.container.querySelector('.btn-export-to-main') as HTMLButtonElement;
    btnExport?.addEventListener('click', () => {
      this.callbacks.onOpenInMainEditor?.(this.example.title, this.editor.getCode());
    });
  }

  private compile(): boolean {
    this.stop();
    const code = this.editor.getCode();
    const result = Assembler.assemble(code);
    this.currentAsmResult = result;

    const btnCompile = this.container.querySelector('.btn-compile') as HTMLButtonElement;
    this.consoleView.clear();

    if (result.errors.length > 0) {
      this.editor.setErrors(result.errors);
      result.errors.forEach(err => this.consoleView.log(`Hata (Satır ${err.line}): ${err.message}`, 'error'));
      if (btnCompile) btnCompile.disabled = false;
      return false;
    }

    this.editor.clearErrors();
    this.consoleView.log(`Program başarıyla derlendi (${result.bytes.length} bayt). Giriş noktası: CS:${result.origin.toString(16).toUpperCase().padStart(4, '0')}h`, 'success');

    if (btnCompile) btnCompile.disabled = true;

    // Load COM bytes
    this.cpu.loadCOM(result.bytes, result.origin);

    // Apply example initial preconditions
    if (this.example.initialMemory) {
      for (const m of this.example.initialMemory) {
        this.cpu.mem.loadBytes(m.segment, m.offset, m.bytes, 'data');
      }
      this.consoleView.log(`📦 Ön tanımlı bellek verisi izole ortama aktarıldı.`, 'info');
    }

    if (this.example.initialRegisters) {
      for (const [k, v] of Object.entries(this.example.initialRegisters)) {
        if (k in this.cpu.regs) {
          (this.cpu.regs as any)[k] = v;
        }
      }
    }

    // Map IP to line numbers
    this.ipToLineMap.clear();
    for (const item of result.listing) {
      this.ipToLineMap.set(item.addr, item.line);
    }

    // Set memory view to origin
    const viewAddr = result.origin === 0x0100 ? 0x0000 : result.origin;
    this.memoryView.jumpToPhys(viewAddr);

    this.syncActiveLine();
    this.updateViews();

    const btnRun = this.container.querySelector('.btn-run') as HTMLButtonElement;
    const btnNext = this.container.querySelector('.btn-next') as HTMLButtonElement;
    if (btnRun) btnRun.disabled = false;
    if (btnNext) btnNext.disabled = false;

    return true;
  }

  private step(): void {
    if (this.cpu.halted) {
      this.stop();
      this.consoleView.log('Program sonlandı (HLT). Yeniden çalıştırmak için RESET butonuna basın.', 'info');
      return;
    }

    const info = this.cpu.step();

    if (info.error) {
      this.stop();
      this.consoleView.log(`Çalışma Hatası: ${info.error}`, 'error');
    }

    if (info.waitingForInput) {
      this.wasRunningBeforeInput = this.isRunning;
      this.stop();
      this.consoleView.setWaitingForInput(true);
      return;
    }

    if (info.consoleText) {
      this.consoleView.appendStdout(info.consoleText);
    }

    this.syncActiveLine();
    this.updateViews(info.changedRegs, info.changedFlags);

    if (this.cpu.halted) {
      this.stop();
      this.consoleView.log('Program HLT komutu ile başarıyla tamamlandı.', 'success');
    }
  }

  private run(): void {
    if (this.isRunning) return;
    if (this.cpu.halted) {
      this.reset();
    }

    this.isRunning = true;
    this.updateRunningButtons(true);

    const speedMs = this.currentSpeed === '0.5' ? 600 : this.currentSpeed === '2' ? 100 : 300;
    this.runTimer = window.setInterval(() => {
      if (!this.isRunning || this.cpu.halted) {
        this.stop();
        return;
      }
      this.step();
    }, speedMs);
  }

  private stop(): void {
    this.isRunning = false;
    if (this.runTimer !== null) {
      window.clearInterval(this.runTimer);
      this.runTimer = null;
    }
    this.updateRunningButtons(false);
  }

  private reset(): void {
    this.stop();
    this.compile();
    this.consoleView.clear();
    this.consoleView.log('İşlemci ve bellek durumu sıfırlandı.', 'info');
  }

  private stepBack(): void {
    if (!this.cpu.canStepBack()) return;
    this.stop();
    const success = this.cpu.stepBack();
    if (success) {
      this.consoleView.log(`Geri adım alındı: IP ➔ ${this.cpu.regs.ip.toString(16).toUpperCase().padStart(4, '0')}h`, 'info');
      this.syncActiveLine();
      this.updateViews();
    }
  }

  private updateRunningButtons(running: boolean): void {
    const btnRun = this.container.querySelector('.btn-run') as HTMLButtonElement;
    const btnStop = this.container.querySelector('.btn-stop') as HTMLButtonElement;
    const btnNext = this.container.querySelector('.btn-next') as HTMLButtonElement;
    const btnCompile = this.container.querySelector('.btn-compile') as HTMLButtonElement;

    if (btnRun) btnRun.disabled = running;
    if (btnStop) btnStop.disabled = !running;
    if (btnNext) btnNext.disabled = running;
    if (btnCompile) btnCompile.disabled = running;
  }

  private updateViews(changedRegs: string[] = [], changedFlags: string[] = []): void {
    this.registerPanel.update(this.cpu.regs, this.cpu.flags, changedRegs, changedFlags);
    this.memoryView.render(this.cpu.mem, this.cpu.regs);

    const btnStepBack = this.container.querySelector('.btn-step-back') as HTMLButtonElement;
    if (btnStepBack) {
      btnStepBack.disabled = !this.cpu.canStepBack() || this.isRunning;
    }
  }

  private syncActiveLine(): void {
    const line = this.ipToLineMap.get(this.cpu.regs.ip);
    this.editor.setActiveLine(line !== undefined ? line : null);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
