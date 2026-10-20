import { CPU, CpuStepInfo } from '../cpu/cpu.js';
import { Assembler, AsmResult, ListingItem } from '../assembler/assembler.js';
import { Editor } from './editor.js';
import { RegisterPanel } from './registerPanel.js';
import { MemoryView } from './memoryView.js';
import { ListingView } from './listingView.js';
import { StackView } from './stackView.js';
import { ConsoleView } from './console.js';
import { Toolbar } from './toolbar.js';
import { SAMPLES, CodeSample } from './samples.js';

export class App {
  private cpu: CPU;
  private editor!: Editor;
  private registerPanel!: RegisterPanel;
  private memoryView!: MemoryView;
  private listingView!: ListingView;
  private stackView!: StackView;
  private consoleView!: ConsoleView;
  private toolbar!: Toolbar;

  private currentAsmResult: AsmResult | null = null;
  private ipToLineMap: Map<number, number> = new Map();
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private speedHz: number = 30;

  private activeTab: 'memory' | 'listing' | 'stack' = 'memory';

  constructor() {
    this.cpu = new CPU();
    this.initLayout();
    this.initModules();
    this.attachShortcuts();
    this.loadSample(SAMPLES[0]); // Load acceptance test by default
  }

  private initLayout(): void {
    const appEl = document.getElementById('app');
    if (!appEl) throw new Error('#app root container missing');

    appEl.innerHTML = `
      <div class="ide-root">
        <!-- Top Toolbar -->
        <header id="toolbar-container" class="ide-toolbar-pane"></header>

        <!-- Main Workspace (2 columns) -->
        <main class="ide-workspace">
          <!-- Left Column: Code Editor & Console -->
          <section class="ide-left-pane">
            <div class="pane-header">
              <span class="pane-title">KOD EDİTÖRÜ (16-BIT REAL MODE COM)</span>
              <span class="pane-meta">EMU8086 / MASM Sentaksı</span>
            </div>
            <div id="editor-container" class="editor-pane-inner"></div>

            <div id="console-container" class="console-pane-inner"></div>
          </section>

          <!-- Right Column: Registers, Flags & Tabs (Memory, Listing, Stack) -->
          <section class="ide-right-pane">
            <!-- Top Right: Registers & Flags -->
            <div class="registers-card-pane">
              <div class="pane-header flex-between">
                <span class="pane-title">CPU DURUMU & YAZMAÇLAR</span>
                <div class="reg-format-selector">
                  <button class="btn-fmt active" data-fmt="hex">HEX</button>
                  <button class="btn-fmt" data-fmt="dec">DEC</button>
                  <button class="btn-fmt" data-fmt="bin">BIN</button>
                </div>
              </div>
              <div id="registers-container" class="registers-pane-inner"></div>
            </div>

            <!-- Bottom Right: Tabbed Panel (Memory, Listing, Stack) -->
            <div class="tabs-card-pane">
              <div class="tabs-header">
                <button class="tab-btn active" data-tab="memory">Bellek Grid'i (1MB RAM)</button>
                <button class="tab-btn" data-tab="listing">Disassembly / Listing</button>
                <button class="tab-btn" data-tab="stack">Yığın (Stack SS:SP)</button>
              </div>
              <div class="tabs-content">
                <div id="tab-memory" class="tab-pane active"></div>
                <div id="tab-listing" class="tab-pane"></div>
                <div id="tab-stack" class="tab-pane"></div>
              </div>
            </div>
          </section>
        </main>
      </div>
    `;

    // Tab buttons handling
    appEl.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab') as 'memory' | 'listing' | 'stack';
        this.switchTab(targetTab);
      });
    });

    // Register format selector (HEX, DEC, BIN)
    appEl.querySelectorAll('.btn-fmt').forEach((btn) => {
      btn.addEventListener('click', () => {
        appEl.querySelectorAll('.btn-fmt').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const fmt = btn.getAttribute('data-fmt') as 'hex' | 'dec' | 'bin';
        this.registerPanel.setFormat(fmt);
        this.updateViews();
      });
    });
  }

  private initModules(): void {
    const toolbarContainer = document.getElementById('toolbar-container')!;
    const editorContainer = document.getElementById('editor-container')!;
    const consoleContainer = document.getElementById('console-container')!;
    const registersContainer = document.getElementById('registers-container')!;
    const tabMemory = document.getElementById('tab-memory')!;
    const tabListing = document.getElementById('tab-listing')!;
    const tabStack = document.getElementById('tab-stack')!;

    this.consoleView = new ConsoleView(consoleContainer);
    this.registerPanel = new RegisterPanel(registersContainer);
    this.memoryView = new MemoryView(tabMemory);
    this.stackView = new StackView(tabStack);

    this.listingView = new ListingView(tabListing, (addr) => {
      this.switchTab('memory');
      this.memoryView.jumpTo(this.cpu.regs.cs, addr);
      this.memoryView.render(this.cpu.mem, this.cpu.regs);
    });

    this.editor = new Editor({
      container: editorContainer,
      initialCode: '',
      onCodeChange: () => {
        // Clear active errors on edit
        this.editor.clearErrors();
      }
    });

    this.toolbar = new Toolbar(toolbarContainer, {
      onAssemble: () => this.assemble(),
      onStep: () => this.step(),
      onRun: () => this.run(),
      onPause: () => this.pause(),
      onReset: () => this.reset(),
      onStepBack: () => this.stepBack(),
      onSpeedChange: (hz) => { this.speedHz = hz; },
      onSampleSelect: (sample) => this.loadSample(sample)
    });

    this.updateViews();
  }

  private switchTab(tab: 'memory' | 'listing' | 'stack'): void {
    this.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.id === `tab-${tab}`);
    });
    this.updateViews();
  }

  private loadSample(sample: CodeSample): void {
    this.pause();
    this.editor.setCode(sample.code);
    this.consoleView.log(`Örnek yüklendi: "${sample.name}" - ${sample.description}`, 'info');
    this.assemble();
  }

  private assemble(): boolean {
    this.pause();
    const code = this.editor.getCode();
    const result = Assembler.assemble(code);
    this.currentAsmResult = result;

    if (result.errors.length > 0) {
      this.editor.setErrors(result.errors);
      for (const err of result.errors) {
        this.consoleView.log(`Hata (Satır ${err.line}): ${err.message}`, 'error');
      }
      this.toolbar.setStatus('error', `Derleme Hatası (${result.errors.length})`);
      return false;
    }

    // Success
    this.editor.clearErrors();
    this.consoleView.log(
      `Derleme başarılı! Üretilen makine kodu: ${result.bytes.length} bayt, ${result.symbols.size} etiket.`,
      'success'
    );

    // Load into CPU
    this.cpu.loadCOM(result.bytes, result.origin);

    // Map IP to source line
    this.ipToLineMap.clear();
    for (const item of result.listing) {
      this.ipToLineMap.set(item.addr, item.line);
    }

    // Tag data section bytes in memory
    // For symbols that are defined at or after code
    for (const [name, addr] of result.symbols.entries()) {
      const phys = this.cpu.mem.toPhys(this.cpu.regs.cs, addr);
      if (this.cpu.mem.getCellType(phys) !== 'code') {
        this.cpu.mem.setCellType(phys, 'data');
      }
    }

    this.toolbar.setStatus('ready', 'Hazır');
    this.syncActiveLine();
    this.updateViews();
    return true;
  }

  private step(): void {
    if (this.cpu.halted) {
      this.consoleView.log("İşlemci HLT durumunda. Yeniden çalıştırmak için 'Reset' veya 'Assemble' yapın.", 'warn');
      return;
    }

    const info = this.cpu.step();

    if (info.consoleText) {
      this.consoleView.log(info.consoleText, 'stdout');
    }

    if (info.error) {
      this.pause();
      this.consoleView.log(`Çalışma Zamanı Hatası: ${info.error}`, 'error');
      this.toolbar.setStatus('error', 'Hata');
      return;
    }

    if (info.halted) {
      this.pause();
      this.consoleView.log('Program sonlandı (HLT komutuna ulaşıldı).', 'info');
      this.toolbar.setStatus('halted');
    }

    this.syncActiveLine();
    this.updateViews(info.changedRegs, info.changedFlags);
  }

  private run(): void {
    if (this.cpu.halted) {
      this.consoleView.log("İşlemci durduruldu (HLT). Tekrar çalıştırmak için 'Reset' yapın.", 'warn');
      return;
    }
    if (this.isRunning) return;

    this.isRunning = true;
    this.toolbar.setStatus('running');

    const cycle = () => {
      if (!this.isRunning) return;

      // Execute a small batch of instructions based on speed
      const batchSize = this.speedHz >= 1000 ? 50 : Math.max(1, Math.floor(this.speedHz / 20));

      for (let i = 0; i < batchSize; i++) {
        // Breakpoint check
        const currentLine = this.ipToLineMap.get(this.cpu.regs.ip);
        if (currentLine !== undefined && this.editor.isBreakpoint(currentLine)) {
          this.pause();
          this.consoleView.log(`Breakpoint tetiklendi (Satır ${currentLine}, IP=${this.cpu.regs.ip.toString(16).toUpperCase()}h)`, 'warn');
          this.syncActiveLine();
          this.updateViews();
          return;
        }

        const info = this.cpu.step();

        if (info.consoleText) {
          this.consoleView.log(info.consoleText, 'stdout');
        }

        if (info.error) {
          this.pause();
          this.consoleView.log(`Hata: ${info.error}`, 'error');
          this.toolbar.setStatus('error');
          this.syncActiveLine();
          this.updateViews();
          return;
        }

        if (info.halted) {
          this.pause();
          this.consoleView.log('Program sonlandı (HLT).', 'info');
          this.toolbar.setStatus('halted');
          this.syncActiveLine();
          this.updateViews();
          return;
        }
      }

      this.syncActiveLine();
      this.updateViews();

      // Schedule next cycle
      const delay = this.speedHz >= 1000 ? 0 : Math.max(10, Math.floor(1000 / this.speedHz));
      this.runTimer = window.setTimeout(cycle, delay);
    };

    cycle();
  }

  private pause(): void {
    this.isRunning = false;
    if (this.runTimer !== null) {
      clearTimeout(this.runTimer);
      this.runTimer = null;
    }
    if (!this.cpu.halted) {
      this.toolbar.setStatus('paused');
    }
  }

  private reset(): void {
    this.pause();
    if (this.currentAsmResult && this.currentAsmResult.bytes.length > 0) {
      this.cpu.loadCOM(this.currentAsmResult.bytes, this.currentAsmResult.origin);
    } else {
      this.cpu.reset();
    }
    this.toolbar.setStatus('ready');
    this.consoleView.log('CPU ve bellek sıfırlandı.', 'info');
    this.syncActiveLine();
    this.updateViews();
  }

  private stepBack(): void {
    this.pause();
    if (this.cpu.stepBack()) {
      this.consoleView.log('Bir adım geri alındı.', 'info');
      this.toolbar.setStatus('paused');
      this.syncActiveLine();
      this.updateViews();
    } else {
      this.consoleView.log('Geri alınacak geçmiş adım bulunamadı.', 'warn');
    }
  }

  private syncActiveLine(): void {
    const line = this.ipToLineMap.get(this.cpu.regs.ip);
    this.editor.setActiveLine(line !== undefined ? line : null);
  }

  private updateViews(changedRegs: string[] = [], changedFlags: string[] = []): void {
    this.registerPanel.update(this.cpu.regs, this.cpu.flags, changedRegs, changedFlags);
    this.toolbar.setStepBackEnabled(this.cpu.canStepBack());

    if (this.activeTab === 'memory') {
      this.memoryView.render(this.cpu.mem, this.cpu.regs);
    } else if (this.activeTab === 'listing') {
      this.listingView.render(this.currentAsmResult?.listing || [], this.cpu.regs.ip);
    } else if (this.activeTab === 'stack') {
      this.stackView.render(this.cpu.mem, this.cpu.regs);
    }
  }

  private attachShortcuts(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // F10 -> Step
      if (e.key === 'F10') {
        e.preventDefault();
        this.step();
      }
      // F5 -> Run / Pause toggle
      else if (e.key === 'F5') {
        e.preventDefault();
        if (this.isRunning) this.pause();
        else this.run();
      }
      // Ctrl+Enter -> Assemble
      else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.assemble();
      }
    });
  }
}

// Bootstrap application on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
