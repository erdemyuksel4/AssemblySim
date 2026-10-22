import { CHALLENGES, ROADMAP_MILESTONES } from '../challenges/challengesData.js';
import { Challenge, GradingResult } from '../challenges/types.js';
import { STORAGE_SOLVED_KEY } from '../challenges/leetcodeView.js';

export interface ChallengePanelCallbacks {
  onTestChallenge: (challenge: Challenge, code: string) => GradingResult;
  onResetEnvironment: (challenge: Challenge) => void;
  onNavigateToLeetCode: () => void;
  onLoadNextChallenge: (nextChallenge: Challenge) => void;
  getCurrentCode: () => string;
}

export class ChallengePanel {
  private container: HTMLElement;
  private callbacks: ChallengePanelCallbacks;
  private activeChallenge: Challenge | null = null;
  private lastResult: GradingResult | null = null;
  private showHints: boolean = false;
  private solvedIds: Set<string> = new Set();

  constructor(container: HTMLElement, callbacks: ChallengePanelCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.loadSolvedFromStorage();
    this.render();
  }

  loadSolvedFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_SOLVED_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            this.solvedIds = new Set(arr);
          }
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  private saveSolved(challengeId: string): void {
    try {
      this.solvedIds.add(challengeId);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_SOLVED_KEY, JSON.stringify(Array.from(this.solvedIds)));
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  setChallenge(challenge: Challenge | null): void {
    this.activeChallenge = challenge;
    this.lastResult = null;
    this.showHints = false;
    this.loadSolvedFromStorage();
    this.render();
  }

  getActiveChallenge(): Challenge | null {
    return this.activeChallenge;
  }

  executeTest(): GradingResult | null {
    if (!this.activeChallenge) return null;
    const code = this.callbacks.getCurrentCode();
    const result = this.callbacks.onTestChallenge(this.activeChallenge, code);
    this.lastResult = result;

    if (result.success && result.status === 'PASSED') {
      this.saveSolved(this.activeChallenge.id);
    }

    this.render();

    // Auto-scroll panel into view so results are immediately visible
    this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return result;
  }

  render(): void {
    if (!this.activeChallenge) {
      this.renderEmptyState();
      return;
    }
    this.renderChallengeDock();
  }

  private renderEmptyState(): void {
    this.container.innerHTML = `
      <div class="challenge-box-card challenge-box-empty">
        <div class="challenge-box-empty-header">
          <span class="challenge-box-empty-icon">🎯</span>
          <span class="challenge-box-empty-title">LeetCode Görev & Test Paneli</span>
        </div>
        <p class="challenge-box-empty-desc">
          Şu anda serbest çalışma dosyasındasınız. 8086 Assembly sınav görevlerini ve algoritmik meydan okumaları çözmek için görev kütüphanesini açabilirsiniz.
        </p>
        <button id="btn-dock-goto-leetcode" class="btn-dock-goto-leetcode">
          ⚡ LeetCode Görevlerini Keşfet
        </button>
      </div>
    `;

    this.container.querySelector('#btn-dock-goto-leetcode')?.addEventListener('click', () => {
      this.callbacks.onNavigateToLeetCode();
    });
  }

  private renderChallengeDock(): void {
    const ch = this.activeChallenge!;
    const isSolved = this.solvedIds.has(ch.id);
    const milestone = ROADMAP_MILESTONES.find(m => m.id === ch.milestoneId);
    const milestoneTitle = milestone ? `Aşama ${milestone.number}: ${milestone.title}` : ch.milestoneId;

    const diffBadge = ch.difficulty === 'Kolay' ? '🟢 Kolay' : ch.difficulty === 'Orta' ? '🟡 Orta' : '🔴 Zor';

    // Format Initial Memory Preconditions
    let initialMemHtml = '';
    if (ch.testSetup?.initialMemory && ch.testSetup.initialMemory.length > 0) {
      initialMemHtml = ch.testSetup.initialMemory.map(m => {
        const seg = m.segment.toString(16).toUpperCase().padStart(4, '0');
        const off = m.offset.toString(16).toUpperCase().padStart(4, '0');
        const bytesHex = m.bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0') + 'h').join(', ');
        return `<code>[${seg}:${off}h] = [${bytesHex}]</code>`;
      }).join('<br>');
    }

    // Format Initial Registers
    let initialRegsHtml = '';
    if (ch.testSetup?.initialRegisters) {
      const parts: string[] = [];
      for (const [k, v] of Object.entries(ch.testSetup.initialRegisters)) {
        if (v !== undefined) {
          parts.push(`<code>${k.toUpperCase()} = ${v.toString(16).toUpperCase().padStart(4, '0')}h (${v})</code>`);
        }
      }
      if (parts.length > 0) initialRegsHtml = parts.join(' ');
    }

    // Format Expected Target Outcome
    const expectedParts: string[] = [];
    if (ch.assertions?.expectedRegisters) {
      for (const [k, v] of Object.entries(ch.assertions.expectedRegisters)) {
        if (v !== undefined) {
          expectedParts.push(`<code>${k.toUpperCase()} = ${v.toString(16).toUpperCase().padStart(4, '0')}h</code>`);
        }
      }
    }
    if (ch.assertions?.expectedMemory && ch.assertions.expectedMemory.length > 0) {
      for (const m of ch.assertions.expectedMemory) {
        const seg = m.segment.toString(16).toUpperCase().padStart(4, '0');
        const off = m.offset.toString(16).toUpperCase().padStart(4, '0');
        const bytesHex = m.expectedBytes.map(b => b.toString(16).toUpperCase().padStart(2, '0') + 'h').join(', ');
        expectedParts.push(`<code>[${seg}:${off}h] = [${bytesHex}]</code>`);
      }
    }
    if (ch.assertions?.expectedFlags) {
      for (const [k, v] of Object.entries(ch.assertions.expectedFlags)) {
        if (v !== undefined) {
          expectedParts.push(`<code>FLAGS.${k.toUpperCase()} = ${v}</code>`);
        }
      }
    }
    if (ch.assertions?.expectedConsole) {
      if (ch.assertions.expectedConsole.contains) {
        expectedParts.push(`<code>Konsol: "${ch.assertions.expectedConsole.contains}"</code>`);
      }
    }

    // Result section HTML
    let resultSectionHtml = '';
    if (this.lastResult) {
      resultSectionHtml = this.generateResultHtml(this.lastResult, ch);
    } else {
      resultSectionHtml = `
        <div class="challenge-dock-result-idle">
          <span>💡 Kodu yazdıktan sonra <b>"Tamamla ve Test Et"</b> butonuna basarak sonucu test edebilirsiniz.</span>
        </div>
      `;
    }

    // Next challenge resolver
    const allKeys = Object.keys(CHALLENGES);
    const currIndex = allKeys.indexOf(ch.id);
    const nextKey = currIndex >= 0 && currIndex < allKeys.length - 1 ? allKeys[currIndex + 1] : null;
    const nextChallenge = nextKey ? CHALLENGES[nextKey] : null;

    this.container.innerHTML = `
      <div class="challenge-box-card challenge-dock-active">
        <!-- Header -->
        <div class="challenge-dock-header">
          <div class="challenge-dock-tags">
            <span class="challenge-dock-badge-milestone">${milestoneTitle}</span>
            <span class="challenge-dock-badge-diff ${ch.difficulty.toLowerCase()}">${diffBadge}</span>
            ${isSolved 
              ? '<span class="challenge-dock-badge-status solved">✅ Çözüldü</span>' 
              : '<span class="challenge-dock-badge-status pending">⏳ Çözülüyor</span>'}
          </div>
          <button id="btn-dock-close-to-manual" class="btn-dock-subtle" title="LeetCode Listesine Dön">
            📋 Liste
          </button>
        </div>

        <!-- Title -->
        <h3 class="challenge-dock-title">${ch.title}</h3>

        <!-- Goal Callout -->
        <div class="challenge-dock-goal-box">
          <div class="challenge-dock-goal-label">🎯 GÖREV HEDEFİ:</div>
          <div class="challenge-dock-goal-text">${ch.task}</div>
        </div>

        <!-- Context & Pre-conditions Matrix -->
        <div class="challenge-dock-matrix">
          <div class="challenge-dock-matrix-col">
            <span class="matrix-col-title">📦 Hazır Ön Ortam:</span>
            <div class="matrix-col-content">
              ${initialMemHtml ? `<div><b>Bellek:</b> ${initialMemHtml}</div>` : ''}
              ${initialRegsHtml ? `<div><b>Yazmaç:</b> ${initialRegsHtml}</div>` : ''}
              ${!initialMemHtml && !initialRegsHtml ? '<span>Standart Temiz CPU</span>' : ''}
            </div>
          </div>
          <div class="challenge-dock-matrix-col">
            <span class="matrix-col-title">🎯 Beklenen Çıktı:</span>
            <div class="matrix-col-content">
              ${expectedParts.length > 0 ? expectedParts.join(' ') : '<span>HLT ile Durma</span>'}
            </div>
          </div>
        </div>

        <!-- Main Action Buttons -->
        <div class="challenge-dock-actions-row">
          <button id="btn-dock-complete-test" class="btn-dock-primary-test">
            <span class="btn-icon">⚡</span> Tamamla ve Test Et
          </button>
          <button id="btn-dock-reset-env" class="btn-dock-secondary" title="Bellek ve yazmaçları başlangıç testSetup durumuna sıfırlar">
            🔄 Ortamı Sıfırla
          </button>
          <button id="btn-dock-toggle-hints" class="btn-dock-secondary">
            💡 İpuçları (${ch.hints.length})
          </button>
        </div>

        <!-- Collapsible Hints -->
        <div id="challenge-dock-hints-panel" class="challenge-dock-hints-panel" style="display: ${this.showHints ? 'block' : 'none'};">
          <div class="hints-panel-header">💡 İpuçları ve Yönergeler:</div>
          <ul class="hints-list">
            ${ch.hints.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <!-- Results / Live Diffs Area -->
        <div class="challenge-dock-results-mount">
          ${resultSectionHtml}
        </div>

        <!-- Next Challenge Banner if passed -->
        ${this.lastResult?.success && nextChallenge ? `
          <div class="challenge-dock-next-card">
            <div class="next-card-info">
              <span class="next-label">Sıradaki Görev:</span>
              <span class="next-title">${nextChallenge.title}</span>
            </div>
            <button id="btn-dock-next-challenge" class="btn-dock-next">
              Sonraki Göreve Geç ➡️
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this.attachDockEvents(ch, nextChallenge);
  }

  private generateResultHtml(result: GradingResult, ch: Challenge): string {
    if (result.status === 'COMPILE_ERROR') {
      return `
        <div class="dock-result-card compile-error">
          <div class="dock-result-header">
            <span class="dock-result-icon">❌</span>
            <span class="dock-result-title">Derleme Hatası (Satır ${result.compileError?.line || '?'})</span>
          </div>
          <div class="dock-result-desc">${result.compileError?.message || 'Sözdizimi hatası oluştu.'}</div>
        </div>
      `;
    }

    if (result.status === 'RUNTIME_ERROR') {
      return `
        <div class="dock-result-card runtime-error">
          <div class="dock-result-header">
            <span class="dock-result-icon">⚠️</span>
            <span class="dock-result-title">Çalışma Zamanı Hatası</span>
          </div>
          <div class="dock-result-desc">${result.runtimeError || 'İşlemci çalışma hatası.'}</div>
        </div>
      `;
    }

    if (result.status === 'TIMEOUT') {
      return `
        <div class="dock-result-card timeout-error">
          <div class="dock-result-header">
            <span class="dock-result-icon">⏱️</span>
            <span class="dock-result-title">Zaman Aşımı / Döngü Sınırı (${ch.assertions.maxSteps || 5000} Adım)</span>
          </div>
          <div class="dock-result-desc">Kod izin verilen maksimum adım sayısında HLT komutuna ulaşamadı. Sonsuz döngüleri kontrol edin.</div>
        </div>
      `;
    }

    if (result.success && result.status === 'PASSED') {
      return `
        <div class="dock-result-card success">
          <div class="dock-result-header">
            <span class="dock-result-icon">🎉</span>
            <div class="dock-result-title-group">
              <span class="dock-result-title">Tebrikler! Tüm Testler Başarıyla Geçti!</span>
              <span class="dock-result-meta">⚡ ${result.stepCount} Adım | ⏱️ ${result.executionTimeMs} ms</span>
            </div>
          </div>
          <div class="dock-diff-table-wrapper">
            <table class="dock-diff-table">
              <thead>
                <tr>
                  <th>Kriter</th>
                  <th>Beklenen</th>
                  <th>Gerçek</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                ${result.diffs.map(d => `
                  <tr class="pass">
                    <td><b>${d.target}</b></td>
                    <td><code>${d.expected}</code></td>
                    <td><code>${d.actual}</code></td>
                    <td><span class="tag-pass">✅ GEÇTİ</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // FAILED with diffs
    const passedCount = result.diffs.filter(d => d.passed).length;
    const totalCount = result.diffs.length;

    return `
      <div class="dock-result-card failed">
        <div class="dock-result-header">
          <span class="dock-result-icon">❌</span>
          <div class="dock-result-title-group">
            <span class="dock-result-title">Test Başarısız Oldu (${passedCount}/${totalCount} Sağlandı)</span>
            <span class="dock-result-meta">⚡ ${result.stepCount} Adım Çalıştırıldı | ⏱️ ${result.executionTimeMs} ms</span>
          </div>
        </div>
        <div class="dock-diff-table-wrapper">
          <table class="dock-diff-table">
            <thead>
              <tr>
                <th>Hedef</th>
                <th>Beklenen</th>
                <th>Gerçekleşen</th>
                <th>Sonuç</th>
              </tr>
            </thead>
            <tbody>
              ${result.diffs.map(d => `
                <tr class="${d.passed ? 'pass' : 'fail'}">
                  <td><b>${d.target}</b></td>
                  <td><code>${d.expected}</code></td>
                  <td><code>${d.actual}</code></td>
                  <td>
                    ${d.passed 
                      ? '<span class="tag-pass">✅ Doğru</span>' 
                      : `<span class="tag-fail">❌ Uyuşmuyor</span>`}
                  </td>
                </tr>
                ${!d.passed && d.message ? `
                  <tr class="fail-msg-row">
                    <td colspan="4" class="fail-msg">↳ <i>${d.message}</i></td>
                  </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private attachDockEvents(ch: Challenge, nextChallenge: Challenge | null): void {
    // Complete and test button
    this.container.querySelector('#btn-dock-complete-test')?.addEventListener('click', () => {
      this.executeTest();
    });

    // Reset env button
    this.container.querySelector('#btn-dock-reset-env')?.addEventListener('click', () => {
      this.callbacks.onResetEnvironment(ch);
      this.lastResult = null;
      this.render();
    });

    // Toggle hints
    this.container.querySelector('#btn-dock-toggle-hints')?.addEventListener('click', () => {
      this.showHints = !this.showHints;
      const hintsPanel = this.container.querySelector('#challenge-dock-hints-panel') as HTMLElement;
      if (hintsPanel) {
        hintsPanel.style.display = this.showHints ? 'block' : 'none';
      }
    });

    // Navigate to LeetCode list
    this.container.querySelector('#btn-dock-close-to-manual')?.addEventListener('click', () => {
      this.callbacks.onNavigateToLeetCode();
    });

    // Next challenge
    if (nextChallenge) {
      this.container.querySelector('#btn-dock-next-challenge')?.addEventListener('click', () => {
        this.callbacks.onLoadNextChallenge(nextChallenge);
      });
    }
  }
}
