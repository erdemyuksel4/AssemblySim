import { CPU } from '../cpu/cpu.js';
import { Assembler, AsmResult } from '../assembler/assembler.js';
import { Editor } from './editor.js';
import { RegisterPanel } from './registerPanel.js';
import { MemoryView } from './memoryView.js';
import { TooltipManager } from './tooltip.js';
import { InstructionDoc } from './instructionDoc.js';

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
  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;

  private currentAsmResult: AsmResult | null = null;
  private ipToLineMap: Map<number, number> = new Map();
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private currentSpeed: ExecutionSpeed = '1';

  constructor() {
    this.cpu = new CPU();
    TooltipManager.init();
    this.initLayout();
    this.initModules();
    this.editor.setCode(DEFAULT_CODE);
    this.compile();
  }

  private initLayout(): void {
    const appEl = document.getElementById('app');
    if (!appEl) throw new Error('#app root missing');

    appEl.innerHTML = `
      <main class="main-layout">
        <!-- Left Section: Code Editor -->
        <section class="editor-section">
          <div class="editor-header-bar">
            <h2 class="editor-title">
              Code Editor
              <span class="info-btn" data-info-title="8086 Assembly Editörü" data-info-desc="DOS COM / EMU8086 sözdizimine uygun assembly kodu yazın. Satır numaralarına tıklayarak kesme noktaları (Breakpoint) koyabilirsiniz." tabindex="-1">i</span>
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
            </div>
          </div>

          <div id="editor-container"></div>
        </section>

        <!-- Right Section: Registers, Segments, Pointers, Flags, Memory -->
        <section class="cpu-section">
          <div id="registers-container"></div>
          <div id="memory-container"></div>
        </section>
      </main>

      <!-- Bottom Collapsible Instruction Manual -->
      <div id="instruction-docs-container" class="instruction-docs-wrapper"></div>
    `;
  }

  private initModules(): void {
    const editorContainer = document.getElementById('editor-container')!;
    const registersContainer = document.getElementById('registers-container')!;
    const memoryContainer = document.getElementById('memory-container')!;
    const docsContainer = document.getElementById('instruction-docs-container')!;

    this.registerPanel = new RegisterPanel(registersContainer);
    this.memoryView = new MemoryView(memoryContainer);
    new InstructionDoc(docsContainer);

    this.editor = new Editor({
      container: editorContainer,
      initialCode: '',
      onCodeChange: () => {
        this.editor.clearErrors();
        // Enable COMPILE button when code changes
        const btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
        if (btnCompile) btnCompile.disabled = false;
      }
    });

    this.attachButtonEvents();
    this.updateViews();
  }

  private attachButtonEvents(): void {
    const btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
    const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
    const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
    const btnStepBack = document.getElementById('btn-step-back') as HTMLButtonElement;

    btnCompile.addEventListener('click', () => this.compile());
    btnNext.addEventListener('click', () => this.step());
    btnRun.addEventListener('click', () => this.run());
    btnStop.addEventListener('click', () => this.stop());
    btnReset.addEventListener('click', () => this.reset());
    btnStepBack.addEventListener('click', () => this.stepBack());

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

    if (result.errors.length > 0) {
      this.editor.setErrors(result.errors);
      if (btnCompile) btnCompile.disabled = false;
      return false;
    }

    this.editor.clearErrors();

    // Disable COMPILE button until user edits code
    if (btnCompile) btnCompile.disabled = true;

    // Load COM at CS:origin
    this.cpu.loadCOM(result.bytes, result.origin);

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

  private reset(): void {
    this.stop();
    if (this.currentAsmResult && this.currentAsmResult.errors.length === 0) {
      // Reload compiled binary at origin and restore initial program state
      this.cpu.loadCOM(this.currentAsmResult.bytes, this.currentAsmResult.origin);
      this.syncActiveLine();
    } else {
      this.cpu.reset();
      this.editor.setActiveLine(null);
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

    if (info.error) {
      this.stop();
      this.editor.setErrors([{ line: this.ipToLineMap.get(this.cpu.regs.ip) || 1, message: info.error }]);
      return;
    }

    if (info.halted) {
      this.stop();
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
        this.syncActiveLine();
        this.updateViews();
        return;
      }

      const info = this.cpu.step();
      if (info.halted || info.error) {
        this.stop();
        if (info.error) {
          this.editor.setErrors([{ line: currentLine || 1, message: info.error }]);
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
