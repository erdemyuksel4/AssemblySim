import { CPU } from '../cpu/cpu.js';
import { Assembler } from '../assembler/assembler.js';
import { LectureExample } from './lectureData.js';

export interface ExampleWidgetCallbacks {
  onOpenInMainEditor?: (title: string, code: string) => void;
}

export class InteractiveExampleWidget {
  private container: HTMLElement;
  private example: LectureExample;
  private callbacks: ExampleWidgetCallbacks;
  private cpu: CPU;
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private showSolution: boolean = false;
  private previousRegs: Record<string, number> = {};

  constructor(container: HTMLElement, example: LectureExample, callbacks: ExampleWidgetCallbacks = {}) {
    this.container = container;
    this.example = example;
    this.callbacks = callbacks;
    this.cpu = new CPU();
    this.render();
    this.resetSimulation();
  }

  private resetSimulation(): void {
    if (this.runTimer !== null) {
      window.clearInterval(this.runTimer);
      this.runTimer = null;
      this.isRunning = false;
    }

    const textarea = this.container.querySelector('.widget-code-input') as HTMLTextAreaElement;
    const code = textarea ? textarea.value : this.example.code;

    const asm = Assembler.assemble(code);
    this.cpu = new CPU();

    if (asm.errors.length === 0 && asm.bytes.length > 0) {
      this.cpu.loadCOM(asm.bytes, asm.origin);
    }

    // Apply pre-conditions
    if (this.example.initialMemory) {
      for (const m of this.example.initialMemory) {
        this.cpu.mem.loadBytes(m.segment, m.offset, m.bytes, 'data');
      }
    }

    if (this.example.initialRegisters) {
      for (const [k, v] of Object.entries(this.example.initialRegisters)) {
        if (k in this.cpu.regs) {
          (this.cpu.regs as any)[k] = v;
        }
      }
    }

    this.previousRegs = this.captureRegs();
    this.updateStatus('Hazır', 'normal');
    this.updateRegistersView();
  }

  private captureRegs(): Record<string, number> {
    return {
      ax: this.cpu.regs.ax,
      bx: this.cpu.regs.bx,
      cx: this.cpu.regs.cx,
      dx: this.cpu.regs.dx,
      si: this.cpu.regs.si,
      di: this.cpu.regs.di,
      sp: this.cpu.regs.sp,
      bp: this.cpu.regs.bp,
      cf: this.cpu.flags.cf ? 1 : 0,
      zf: this.cpu.flags.zf ? 1 : 0,
      sf: this.cpu.flags.sf ? 1 : 0,
      of: this.cpu.flags.of ? 1 : 0
    };
  }

  private step(): void {
    if (this.cpu.halted) {
      this.updateStatus('HLT: Program Durdu', 'halted');
      return;
    }

    this.previousRegs = this.captureRegs();
    const info = this.cpu.step();

    if (info.error) {
      this.updateStatus(`Hata: ${info.error}`, 'error');
    } else if (this.cpu.halted) {
      this.updateStatus('HLT: Program Başarıyla Tamamlandı', 'halted');
    } else {
      this.updateStatus(`Adım İlerledi: IP = 0x${info.ipAfter.toString(16).toUpperCase().padStart(4, '0')}`, 'running');
    }

    this.updateRegistersView();
  }

  private run(): void {
    if (this.isRunning) {
      this.stop();
      return;
    }

    if (this.cpu.halted) {
      this.resetSimulation();
    }

    this.isRunning = true;
    const btnRun = this.container.querySelector('.btn-widget-run') as HTMLButtonElement;
    if (btnRun) btnRun.innerHTML = '⏸️ Durdur';

    this.runTimer = window.setInterval(() => {
      if (this.cpu.halted) {
        this.stop();
        this.updateStatus('HLT: Program Tamamlandı', 'halted');
        return;
      }
      this.step();
    }, 150);
  }

  private stop(): void {
    if (this.runTimer !== null) {
      window.clearInterval(this.runTimer);
      this.runTimer = null;
    }
    this.isRunning = false;
    const btnRun = this.container.querySelector('.btn-widget-run') as HTMLButtonElement;
    if (btnRun) btnRun.innerHTML = '▶️ Çalıştır';
  }

  private updateStatus(text: string, type: 'normal' | 'running' | 'halted' | 'error'): void {
    const statusEl = this.container.querySelector('.widget-status-badge') as HTMLElement;
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = `widget-status-badge ${type}`;
  }

  private updateRegistersView(): void {
    const current = this.captureRegs();
    const regs = ['ax', 'bx', 'cx', 'dx', 'si', 'di', 'sp', 'bp'];
    const fmtHex = (n: number) => n.toString(16).toUpperCase().padStart(4, '0') + 'h';

    regs.forEach(r => {
      const el = this.container.querySelector(`.widget-reg-val[data-reg="${r}"]`) as HTMLElement;
      if (el) {
        el.textContent = fmtHex(current[r]);
        if (current[r] !== this.previousRegs[r]) {
          el.classList.add('reg-changed');
          setTimeout(() => el.classList.remove('reg-changed'), 600);
        }
      }
    });

    const flags = ['cf', 'zf', 'sf', 'of'];
    flags.forEach(f => {
      const el = this.container.querySelector(`.widget-flag-pill[data-flag="${f}"]`) as HTMLElement;
      if (el) {
        const isSet = current[f] === 1;
        el.classList.toggle('active', isSet);
      }
    });

    // Console output snippet
    const consoleSnippet = this.container.querySelector('.widget-console-output') as HTMLElement;
    if (consoleSnippet) {
      if (this.cpu.consoleBuffer) {
        consoleSnippet.style.display = 'block';
        consoleSnippet.textContent = `Konsol: ${this.cpu.consoleBuffer}`;
      } else {
        consoleSnippet.style.display = 'none';
      }
    }
  }

  render(): void {
    const ex = this.example;

    this.container.innerHTML = `
      <div class="interactive-example-card">
        <!-- Card Header -->
        <div class="widget-header">
          <div class="widget-title-area">
            <span class="widget-badge">CANLI ÖRNEK SİMÜLATÖRÜ</span>
            <h4 class="widget-title">${this.escapeHtml(ex.title)}</h4>
          </div>
          <div class="widget-status-badge normal">Hazır</div>
        </div>

        <p class="widget-desc">${this.escapeHtml(ex.scenario)}</p>

        <div class="widget-task-callout">
          <strong>Hedef:</strong> ${this.escapeHtml(ex.task)}
        </div>

        <!-- Mini Code Editor & Controls -->
        <div class="widget-editor-box">
          <div class="widget-toolbar">
            <div class="widget-btn-group">
              <button class="btn-widget-step" title="Bir komut ilerlet (Adım Adım)">⏭️ Adım</button>
              <button class="btn-widget-run" title="Sürekli çalıştır">▶️ Çalıştır</button>
              <button class="btn-widget-reset" title="Başlangıç durumuna sıfırla">🔄 Sıfırla</button>
            </div>
            <div class="widget-btn-group-right">
              <button class="btn-widget-toggle-sol" title="Hoca çözümünü ve adım adım anlatımı göster">
                💡 Çözümü & Açıklamayı Ver
              </button>
              <button class="btn-widget-open-main" title="Bu örneği tam ekran IDE'ye taşı">
                🚀 Ana Editörde Aç
              </button>
            </div>
          </div>

          <textarea class="widget-code-input" spellcheck="false">${ex.code}</textarea>
        </div>

        <!-- Live Mini Register & Flags Bar -->
        <div class="widget-reg-strip">
          <div class="reg-strip-group">
            <div class="widget-reg-cell">
              <span class="reg-label">AX</span>
              <span class="widget-reg-val" data-reg="ax">0000h</span>
            </div>
            <div class="widget-reg-cell">
              <span class="reg-label">BX</span>
              <span class="widget-reg-val" data-reg="bx">0000h</span>
            </div>
            <div class="widget-reg-cell">
              <span class="reg-label">CX</span>
              <span class="widget-reg-val" data-reg="cx">0000h</span>
            </div>
            <div class="widget-reg-cell">
              <span class="reg-label">DX</span>
              <span class="widget-reg-val" data-reg="dx">0000h</span>
            </div>
          </div>

          <div class="reg-strip-group">
            <div class="widget-reg-cell">
              <span class="reg-label">SI</span>
              <span class="widget-reg-val" data-reg="si">0000h</span>
            </div>
            <div class="widget-reg-cell">
              <span class="reg-label">DI</span>
              <span class="widget-reg-val" data-reg="di">0000h</span>
            </div>
            <div class="widget-reg-cell">
              <span class="reg-label">SP</span>
              <span class="widget-reg-val" data-reg="sp">FFFEh</span>
            </div>
            <div class="widget-reg-cell">
              <span class="reg-label">BP</span>
              <span class="widget-reg-val" data-reg="bp">0000h</span>
            </div>
          </div>

          <div class="flags-strip-group">
            <span class="widget-flag-pill" data-flag="cf">CF</span>
            <span class="widget-flag-pill" data-flag="zf">ZF</span>
            <span class="widget-flag-pill" data-flag="sf">SF</span>
            <span class="widget-flag-pill" data-flag="of">OF</span>
          </div>
        </div>

        <div class="widget-console-output" style="display: none;"></div>

        <!-- "Çözümü Ver" Accordion Drawer -->
        <div class="widget-solution-drawer" style="display: ${this.showSolution ? 'block' : 'none'};">
          <div class="solution-drawer-header">
            <span class="solution-header-title">💡 Hocanın Referans Çözümü & Satır Satır Analizi</span>
            <button class="btn-copy-sol" title="Çözümü Kopyala">Kopyala</button>
          </div>

          <pre class="solution-code-pre"><code>${this.escapeHtml(ex.solutionCode)}</code></pre>

          <div class="solution-breakdown-list">
            <strong>Komut Komut Ne Yapılıyor?</strong>
            <ul>
              ${ex.solutionBreakdown.map(step => `<li>${this.escapeHtml(step)}</li>`).join('')}
            </ul>
          </div>

          <div class="solution-exam-tip">
            🎓 <strong>Sınav İpucu & Tuzak:</strong> ${this.escapeHtml(ex.examTips)}
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const btnStep = this.container.querySelector('.btn-widget-step') as HTMLButtonElement;
    const btnRun = this.container.querySelector('.btn-widget-run') as HTMLButtonElement;
    const btnReset = this.container.querySelector('.btn-widget-reset') as HTMLButtonElement;
    const btnToggleSol = this.container.querySelector('.btn-widget-toggle-sol') as HTMLButtonElement;
    const btnOpenMain = this.container.querySelector('.btn-widget-open-main') as HTMLButtonElement;
    const btnCopySol = this.container.querySelector('.btn-copy-sol') as HTMLButtonElement;
    const textarea = this.container.querySelector('.widget-code-input') as HTMLTextAreaElement;

    btnStep?.addEventListener('click', () => this.step());
    btnRun?.addEventListener('click', () => this.run());
    btnReset?.addEventListener('click', () => this.resetSimulation());

    btnToggleSol?.addEventListener('click', () => {
      this.showSolution = !this.showSolution;
      const drawer = this.container.querySelector('.widget-solution-drawer') as HTMLElement;
      if (drawer) {
        drawer.style.display = this.showSolution ? 'block' : 'none';
      }
    });

    btnOpenMain?.addEventListener('click', () => {
      if (this.callbacks.onOpenInMainEditor) {
        const code = textarea ? textarea.value : this.example.code;
        this.callbacks.onOpenInMainEditor(`Örnek: ${this.example.title}`, code);
      }
    });

    btnCopySol?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.example.solutionCode).then(() => {
        btnCopySol.textContent = 'Kopyalandı! ✓';
        setTimeout(() => btnCopySol.textContent = 'Kopyala', 1500);
      });
    });

    textarea?.addEventListener('change', () => {
      this.resetSimulation();
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
