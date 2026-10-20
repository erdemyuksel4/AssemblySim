import { CPU } from '../cpu/cpu.js';
import { Assembler, AsmResult } from '../assembler/assembler.js';
import { Editor } from './editor.js';
import { RegisterPanel } from './registerPanel.js';
import { MemoryView } from './memoryView.js';
import { SAMPLES } from './samples.js';

export class App {
  private cpu: CPU;
  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;

  private currentAsmResult: AsmResult | null = null;
  private ipToLineMap: Map<number, number> = new Map();
  private isRunning: boolean = false;
  private runTimer: number | null = null;

  constructor() {
    this.cpu = new CPU();
    this.initLayout();
    this.initModules();
    this.loadSample(SAMPLES[0]); // Load acceptance test by default
  }

  private initLayout(): void {
    const appEl = document.getElementById('app');
    if (!appEl) throw new Error('#app root missing');

    appEl.innerHTML = `
      <!-- Top Navbar -->
      <nav class="app-navbar">
        <div class="brand-title">8086 Compiler</div>
        <div class="nav-actions">
          <button class="nav-icon-btn" id="btn-nav-help" title="Yardım">❔</button>
          <button class="nav-icon-btn" id="btn-nav-console" title="Konsol / Çıktı">💻</button>
          <button class="nav-icon-btn" id="btn-nav-info" title="Hakkında">ℹ️</button>
          <button class="nav-icon-btn" id="btn-nav-theme" title="Açık / Koyu Tema">☀️</button>
        </div>
      </nav>

      <!-- Main Layout -->
      <main class="main-layout">
        <!-- Left Section: Code Editor -->
        <section class="editor-section">
          <div class="editor-header-bar">
            <h2 class="editor-title">Code Editor</h2>
            <div class="editor-toolbar-right">
              <select id="sample-select" class="sample-select" title="Hazır Örnek Kodlar">
                ${SAMPLES.map((s, idx) => `<option value="${idx}">${s.name}</option>`).join('')}
              </select>
              <button id="btn-compile" class="btn-compile">COMPILE</button>
              <button id="btn-run" class="btn-ctrl">RUN</button>
              <button id="btn-next" class="btn-ctrl">NEXT</button>
              <button id="btn-stop" class="btn-ctrl" disabled>STOP</button>
              <button id="btn-step-back" class="btn-ctrl btn-step-back" title="Bir adım geri al" disabled>↶</button>
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

      <!-- Floating Greeting Bubble -->
      <div class="floating-greeting" id="greeting-bubble">
        <div>
          <strong>Hello pal... Greetings!</strong><br />
          8086 Assembly Simülatörüne hoş geldiniz. Kodunuzu yazıp <strong>COMPILE</strong> ve <strong>NEXT</strong> ile adım adım çalıştırabilirsiniz.
        </div>
        <button class="btn-close-bubble" id="btn-close-bubble" title="Kapat">✕</button>
      </div>
    `;

    // Greeting bubble close
    appEl.querySelector('#btn-close-bubble')?.addEventListener('click', () => {
      const bubble = document.getElementById('greeting-bubble');
      if (bubble) bubble.style.display = 'none';
    });

    // Theme toggle
    appEl.querySelector('#btn-nav-theme')?.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      document.body.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    });

    // Info modal alert
    appEl.querySelector('#btn-nav-info')?.addEventListener('click', () => {
      alert("8086 Web Assembly IDE & Simulator\nReal Mode 16-bit Intel 8086 Emulator\n%100 saf istemci taraflı gerçek makine kodu üretimi.");
    });

    // Help modal alert
    appEl.querySelector('#btn-nav-help')?.addEventListener('click', () => {
      alert("Kullanım İpuçları:\n- COMPILE: Kodu derler ve CS:0100h'a yükler.\n- NEXT: Tek bir komut işletir (F10).\n- RUN / STOP: Sürekli çalıştırır veya durdurur.\n- Bellekte satıra tıklayarak adrese gidebilirsiniz.");
    });
  }

  private initModules(): void {
    const editorContainer = document.getElementById('editor-container')!;
    const registersContainer = document.getElementById('registers-container')!;
    const memoryContainer = document.getElementById('memory-container')!;

    this.registerPanel = new RegisterPanel(registersContainer);
    this.memoryView = new MemoryView(memoryContainer);

    this.editor = new Editor({
      container: editorContainer,
      initialCode: '',
      onCodeChange: () => {
        this.editor.clearErrors();
      }
    });

    this.attachButtonEvents();
    this.updateViews();
  }

  private attachButtonEvents(): void {
    const btnCompile = document.getElementById('btn-compile')!;
    const btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
    const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    const btnStepBack = document.getElementById('btn-step-back') as HTMLButtonElement;
    const sampleSelect = document.getElementById('sample-select') as HTMLSelectElement;

    btnCompile.addEventListener('click', () => this.compile());
    btnNext.addEventListener('click', () => this.step());
    btnRun.addEventListener('click', () => this.run());
    btnStop.addEventListener('click', () => this.stop());
    btnStepBack.addEventListener('click', () => this.stepBack());

    sampleSelect.addEventListener('change', () => {
      const idx = parseInt(sampleSelect.value, 10);
      if (SAMPLES[idx]) this.loadSample(SAMPLES[idx]);
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

  private loadSample(sample: { code: string }): void {
    this.stop();
    this.editor.setCode(sample.code);
    this.compile();
  }

  private compile(): boolean {
    this.stop();
    const code = this.editor.getCode();
    const result = Assembler.assemble(code);
    this.currentAsmResult = result;

    if (result.errors.length > 0) {
      this.editor.setErrors(result.errors);
      return false;
    }

    this.editor.clearErrors();

    // Load COM at CS:0100h
    this.cpu.loadCOM(result.bytes, result.origin);

    // Map IP to line
    this.ipToLineMap.clear();
    for (const item of result.listing) {
      this.ipToLineMap.set(item.addr, item.line);
    }

    // Set memory view to CS:0100h
    this.memoryView.jumpTo(this.cpu.regs.cs, 0x0100);

    this.syncActiveLine();
    this.updateViews();
    return true;
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

      this.runTimer = window.setTimeout(loop, 40); // ~25 Hz
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
