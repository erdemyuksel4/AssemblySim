import { SAMPLES, CodeSample } from './samples.js';

export interface ToolbarEvents {
  onAssemble: () => void;
  onStep: () => void;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepBack: () => void;
  onSpeedChange: (speedHz: number) => void;
  onSampleSelect: (sample: CodeSample) => void;
}

export class Toolbar {
  private container: HTMLElement;
  private events: ToolbarEvents;

  constructor(container: HTMLElement, events: ToolbarEvents) {
    this.container = container;
    this.events = events;
    this.render();
  }

  private render(): void {
    const sampleOptions = SAMPLES.map((s, idx) => `<option value="${idx}">${s.name}</option>`).join('');

    this.container.innerHTML = `
      <div class="toolbar-wrapper">
        <!-- Brand & Logo -->
        <div class="toolbar-brand">
          <div class="brand-icon">8086</div>
          <div class="brand-text">
            <span class="brand-title">Web Assembly IDE</span>
            <span class="brand-sub">Real Mode 16-Bit Simulator</span>
          </div>
        </div>

        <!-- Sample Selector -->
        <div class="toolbar-group sample-picker-group">
          <label for="sample-select" class="toolbar-label">Örnek:</label>
          <select id="sample-select" class="toolbar-select">
            ${sampleOptions}
          </select>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Action Buttons -->
        <div class="toolbar-group action-buttons">
          <button id="btn-assemble" class="btn btn-primary" title="Derle ve RAM'e yükle (Pass 1 & Pass 2)">
            <span class="btn-icon">⚡</span> Assemble
          </button>
          <button id="btn-step" class="btn btn-secondary" title="Tek komut çalıştır (F10)">
            <span class="btn-icon">↷</span> Step
          </button>
          <button id="btn-run" class="btn btn-success" title="Programı sürekli çalıştır (F5)">
            <span class="btn-icon">▶</span> Run
          </button>
          <button id="btn-pause" class="btn btn-warning" title="Çalışmayı duraklat" disabled>
            <span class="btn-icon">⏸</span> Pause
          </button>
          <button id="btn-step-back" class="btn btn-secondary" title="Bir adım geri al (Diff restore)" disabled>
            <span class="btn-icon">↶</span> Step Back
          </button>
          <button id="btn-reset" class="btn btn-danger" title="CPU ve Belleği sıfırla">
            <span class="btn-icon">↺</span> Reset
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Speed Slider -->
        <div class="toolbar-group speed-group">
          <span class="toolbar-label">Hız:</span>
          <input type="range" id="speed-slider" class="speed-slider" min="1" max="100" value="30" />
          <span id="speed-display" class="speed-value">30 Hz</span>
        </div>

        <!-- CPU Status Badge -->
        <div class="toolbar-status">
          <span id="cpu-status-indicator" class="status-indicator status-ready"></span>
          <span id="cpu-status-text" class="status-text">Hazır</span>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const btnAssemble = this.container.querySelector('#btn-assemble') as HTMLButtonElement;
    const btnStep = this.container.querySelector('#btn-step') as HTMLButtonElement;
    const btnRun = this.container.querySelector('#btn-run') as HTMLButtonElement;
    const btnPause = this.container.querySelector('#btn-pause') as HTMLButtonElement;
    const btnStepBack = this.container.querySelector('#btn-step-back') as HTMLButtonElement;
    const btnReset = this.container.querySelector('#btn-reset') as HTMLButtonElement;
    const sampleSelect = this.container.querySelector('#sample-select') as HTMLSelectElement;
    const speedSlider = this.container.querySelector('#speed-slider') as HTMLInputElement;
    const speedDisplay = this.container.querySelector('#speed-display') as HTMLElement;

    btnAssemble?.addEventListener('click', () => this.events.onAssemble());
    btnStep?.addEventListener('click', () => this.events.onStep());
    btnRun?.addEventListener('click', () => this.events.onRun());
    btnPause?.addEventListener('click', () => this.events.onPause());
    btnStepBack?.addEventListener('click', () => this.events.onStepBack());
    btnReset?.addEventListener('click', () => this.events.onReset());

    sampleSelect?.addEventListener('change', () => {
      const idx = parseInt(sampleSelect.value, 10);
      if (SAMPLES[idx]) {
        this.events.onSampleSelect(SAMPLES[idx]);
      }
    });

    speedSlider?.addEventListener('input', () => {
      const val = parseInt(speedSlider.value, 10);
      let hz = val;
      if (val === 100) {
        speedDisplay.textContent = 'Maksimum';
        hz = 10000;
      } else {
        speedDisplay.textContent = `${val} Hz`;
      }
      this.events.onSpeedChange(hz);
    });
  }

  setStatus(status: 'ready' | 'running' | 'paused' | 'halted' | 'error', text?: string): void {
    const indicator = this.container.querySelector('#cpu-status-indicator') as HTMLElement;
    const statusText = this.container.querySelector('#cpu-status-text') as HTMLElement;
    const btnRun = this.container.querySelector('#btn-run') as HTMLButtonElement;
    const btnPause = this.container.querySelector('#btn-pause') as HTMLButtonElement;
    const btnStep = this.container.querySelector('#btn-step') as HTMLButtonElement;

    if (!indicator || !statusText) return;

    indicator.className = `status-indicator status-${status}`;

    switch (status) {
      case 'ready':
        statusText.textContent = text || 'Hazır';
        btnRun.disabled = false;
        btnPause.disabled = true;
        btnStep.disabled = false;
        break;
      case 'running':
        statusText.textContent = text || 'Çalışıyor';
        btnRun.disabled = true;
        btnPause.disabled = false;
        btnStep.disabled = true;
        break;
      case 'paused':
        statusText.textContent = text || 'Duraklatıldı';
        btnRun.disabled = false;
        btnPause.disabled = true;
        btnStep.disabled = false;
        break;
      case 'halted':
        statusText.textContent = text || 'Durduruldu (HLT)';
        btnRun.disabled = true;
        btnPause.disabled = true;
        btnStep.disabled = true;
        break;
      case 'error':
        statusText.textContent = text || 'Hata';
        btnRun.disabled = true;
        btnPause.disabled = true;
        btnStep.disabled = true;
        break;
    }
  }

  setStepBackEnabled(enabled: boolean): void {
    const btnStepBack = this.container.querySelector('#btn-step-back') as HTMLButtonElement;
    if (btnStepBack) {
      btnStepBack.disabled = !enabled;
    }
  }
}
