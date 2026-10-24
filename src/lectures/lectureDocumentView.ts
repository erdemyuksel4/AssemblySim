import { MILESTONE_LECTURES, MilestoneLecture } from './lectureData.js';
import { InteractiveExampleWidget } from './interactiveExampleWidget.js';
import { CHALLENGES } from '../challenges/challengesData.js';

export interface LectureDocCallbacks {
  onOpenInMainEditor: (title: string, code: string) => void;
  onNavigateToMilestoneLecture: (milestoneId: string) => void;
  onNavigateToLeetCodeMilestone: (milestoneId: string, challengeId?: string) => void;
  onNavigateToRoadmap?: () => void;
  onSplitWithEditor?: () => void;
}

export class LectureDocumentView {
  private container: HTMLElement;
  private currentMilestoneId: string = 'milestone-1';
  private callbacks: LectureDocCallbacks;
  private exampleWidgets: InteractiveExampleWidget[] = [];

  constructor(container: HTMLElement, callbacks: LectureDocCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  setMilestone(milestoneId: string): void {
    this.currentMilestoneId = milestoneId;
    this.render();
  }

  getMilestoneId(): string {
    return this.currentMilestoneId;
  }

  render(): void {
    const lecture = MILESTONE_LECTURES[this.currentMilestoneId] || MILESTONE_LECTURES['milestone-1'];
    this.exampleWidgets = [];

    const keys = Object.keys(MILESTONE_LECTURES);
    const currIdx = keys.indexOf(this.currentMilestoneId);
    const prevKey = currIdx > 0 ? keys[currIdx - 1] : null;
    const nextKey = currIdx < keys.length - 1 ? keys[currIdx + 1] : null;
    const capstone = Object.values(CHALLENGES).find(ch => ch.milestoneId === this.currentMilestoneId && ch.isCapstone);

    this.container.innerHTML = `
      <div class="lecture-doc-container">
        <!-- Top Navigation Breadcrumbs & Actions -->
        <div class="lecture-doc-breadcrumb">
          <div class="lecture-bc-left">
            <span class="bc-item bc-roadmap-link" style="cursor: pointer;" title="Yol Haritasına Git">🗺️ Yol Haritası</span>
            <span class="bc-sep">/</span>
            <span class="bc-item highlight">Aşama ${lecture.milestoneNumber}: ${this.escapeHtml(lecture.title)}</span>
          </div>
          <button class="btn-split-editor" id="btn-lecture-split-editor" title="Kod Editörüyle Yan Yana Aç (Bölünmüş Ekran)">
            <span class="btn-icon">◫</span>
            <span class="btn-text">Editörle Yan Yana Çalış</span>
          </button>
        </div>

        <!-- Lecture Header Banner -->
        <div class="lecture-doc-header">
          <div class="lecture-header-top">
            <span class="lecture-pill">DERS ANLATIMI & TEORİ REHBERİ</span>
            <span class="lecture-slide-ref">📍 Slayt: ${this.escapeHtml(lecture.slideRef)}</span>
          </div>
          <h1 class="lecture-main-title">${this.escapeHtml(lecture.title)}</h1>
          <p class="lecture-subtitle-text">${this.escapeHtml(lecture.subtitle)}</p>
        </div>

        <!-- Overview Hero Card -->
        <div class="lecture-overview-mount">
          ${lecture.overviewHtml}
        </div>

        <!-- Sections & Interactive Examples -->
        <div class="lecture-sections-list">
          ${lecture.sections.map((sec, secIdx) => `
            <div class="lecture-section-card">
              <h3 class="lecture-sec-title">${this.escapeHtml(sec.title)}</h3>
              <div class="lecture-sec-content">
                ${sec.contentHtml}
              </div>

              ${sec.examples && sec.examples.length > 0 ? `
                <div class="lecture-examples-wrapper">
                  <div id="example-mount-${secIdx}" class="example-widget-mount"></div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Stage Capstone Challenge Card (Aşama Sonu Kapsayıcı Sentez Görevi) -->
        <div class="lecture-capstone-container">
          ${this.currentMilestoneId === 'milestone-1' ? `
            <div class="lecture-capstone-card milestone-1-notice">
              <div class="capstone-card-badge-row">
                <span class="capstone-badge arch">🏛️ MİMARİ VE BELLEK TEMELİ TAMAMLANDI</span>
                <span class="capstone-scope-tag">1. Aşama: Donanım & Mimari</span>
              </div>
              <h3 class="capstone-title">Aşama 1 Tamamlandı: Kodlama Öncesi Mimari Donanım</h3>
              <p class="capstone-desc">
                Bu aşamada 8086'nın iç mimarisini (BIU & EU), 14 adet yazmaç kümesini, 20-bit adresleme formülünü ve Little-Endian prensibini öğrendiniz.
                Henüz assembly komutu (MOV, ADD vb.) anlatılmadığı için bu aşamada kodlama görevi bulunmamaktadır.
                <strong>Aşama 2'ye geçerek ilk komutları öğrendiğinizde, hem Aşama 1'i hem Aşama 2'yi harmanlayan ilk Kapsayıcı LeetCode Göreviniz açılacaktır!</strong>
              </p>
              <div class="capstone-card-actions">
                <button id="btn-capstone-m1-next" class="btn-capstone-action primary">
                  🚀 Aşama 2'ye Geç ve İlk Kapsayıcı Göreve Hazırlan ➡️
                </button>
              </div>
            </div>
          ` : capstone ? `
            <div class="lecture-capstone-card">
              <div class="capstone-card-badge-row">
                <span class="capstone-badge">🏆 AŞAMA ${lecture.milestoneNumber} SONU KAPSAYICI SENTEZ GÖREVİ</span>
                <span class="capstone-diff-tag ${capstone.difficulty.toLowerCase()}">${capstone.difficulty}</span>
                <span class="capstone-scope-tag">${this.escapeHtml(capstone.cumulativeStages || '')}</span>
              </div>

              <h3 class="capstone-title">${this.escapeHtml(capstone.title)}</h3>
              <p class="capstone-desc">${this.escapeHtml(capstone.scenario)}</p>

              <div class="capstone-task-box">
                <div class="capstone-task-title">🎯 Sınav Görevi:</div>
                <div class="capstone-task-content">${this.escapeHtml(capstone.task).replace(/\n/g, '<br/>')}</div>
              </div>

              <div class="capstone-meta-row">
                <span class="capstone-opcodes-label">Kullanılacak Komutlar:</span>
                <div class="capstone-opcodes-list">
                  ${capstone.opcodes.map(op => `<span class="capstone-op-pill">${op}</span>`).join('')}
                </div>
              </div>

              <div class="capstone-card-actions">
                <button id="btn-capstone-open-leetcode" class="btn-capstone-action primary" data-ch-id="${capstone.id}">
                  ⚡ Bu Kapsayıcı Görevi LeetCode Panelinde Çöz →
                </button>
                <button id="btn-capstone-load-editor" class="btn-capstone-action secondary" data-ch-id="${capstone.id}">
                  📝 Görev Şablonunu Editöre Aktar
                </button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Navigation Footer -->
        <div class="lecture-doc-footer">
          <div class="footer-btn-group">
            ${prevKey ? `
              <button id="btn-lecture-prev" class="btn-lecture-nav prev" data-prev="${prevKey}">
                ⬅️ Önceki Aşama
              </button>
            ` : '<div style="flex:1;"></div>'}

            ${this.currentMilestoneId === 'milestone-1' ? `
              <button id="btn-lecture-jump-leetcode" class="btn-lecture-leetcode btn-lecture-start-ch" title="Aşama 2'ye geçerek ilk komutları öğrenin ve kodlama görevlerine başlayın">
                🚀 Aşama 2: İlk Komutlar ve Görevlere Başla ➡️
              </button>
            ` : `
              <button id="btn-lecture-jump-leetcode" class="btn-lecture-leetcode">
                ⚡ Bu Aşamanın LeetCode Görevlerini Çöz →
              </button>
            `}

            ${nextKey ? `
              <button id="btn-lecture-next" class="btn-lecture-nav next" data-next="${nextKey}">
                Sonraki Aşama ➡️
              </button>
            ` : '<div style="flex:1;"></div>'}
          </div>
        </div>
      </div>
    `;

    // Mount Interactive Example Workstations with 3 difficulty options
    lecture.sections.forEach((sec, secIdx) => {
      if (sec.examples && sec.examples.length > 0) {
        const mountEl = this.container.querySelector(`#example-mount-${secIdx}`) as HTMLElement;
        if (mountEl) {
          const widget = new InteractiveExampleWidget(
            mountEl,
            sec.examples[0],
            {
              onOpenInMainEditor: (title, code) => {
                this.callbacks.onOpenInMainEditor(title, code);
              }
            },
            sec.examples
          );
          this.exampleWidgets.push(widget);
        }
      }
    });

    this.attachEvents(prevKey, nextKey);
    this.attachInteractiveDemos();
  }

  private attachInteractiveDemos(): void {
    // 1. 20-Bit Physical Address Calculator
    const btnCalc = this.container.querySelector('#btn-calc-address') as HTMLButtonElement | null;
    const segInput = this.container.querySelector('#input-calc-segment') as HTMLInputElement | null;
    const offInput = this.container.querySelector('#input-calc-offset') as HTMLInputElement | null;
    const resBox = this.container.querySelector('#calc-address-result') as HTMLElement | null;

    if (btnCalc && segInput && offInput && resBox) {
      const doCalc = () => {
        const segStr = (segInput.value || '0').trim().replace(/h$/i, '');
        const offStr = (offInput.value || '0').trim().replace(/h$/i, '');
        const seg = parseInt(segStr, 16) || 0;
        const off = parseInt(offStr, 16) || 0;
        const shifted = (seg * 16) & 0xFFFFF;
        const phys = (shifted + off) & 0xFFFFF;

        const segHex = seg.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const offHex = off.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const shiftedHex = shifted.toString(16).toUpperCase().padStart(5, '0') + 'H';
        const physHex = phys.toString(16).toUpperCase().padStart(5, '0') + 'H';

        let region = '';
        let regionColor = '#10b981';
        if (phys <= 0x9FFFF) {
          region = 'TPA (Transient Program Area - 640 KB: DOS Çekirdeği, Sürücüler & Kullanıcı Programları)';
          regionColor = '#10b981';
        } else if (phys <= 0xBFFFF) {
          region = 'System Area: Video RAM (128 KB - Ekran Kartı Görüntü Belleği)';
          regionColor = '#f59e0b';
        } else if (phys <= 0xDFFFF) {
          region = 'System Area: Genişleme Kartı ROM Bellekleri & Donanım BIOS';
          regionColor = '#8b5cf6';
        } else {
          region = 'System Area: Sistem BIOS ROM (F0000H – FFFFFH - Reset Vektörü FFFF0H)';
          regionColor = '#ef4444';
        }

        resBox.innerHTML = `
          <div class="calc-res-grid">
            <div class="calc-res-item">
              <span class="calc-res-label">1. Segment 10H (16) ile Çarpılır (4-bit Sola Kaydırılır):</span>
              <span class="calc-res-val">${segHex} × 10H = <strong>${shiftedHex}</strong></span>
            </div>
            <div class="calc-res-item">
              <span class="calc-res-label">2. Ofset Değeri Eklenir:</span>
              <span class="calc-res-val">+ ${offHex}</span>
            </div>
            <div class="calc-res-item highlight">
              <span class="calc-res-label">🎯 20-Bit Fiziksel Adres:</span>
              <span class="calc-res-val big"><strong>${physHex}</strong> (${phys.toLocaleString('tr-TR')} desimal bayt)</span>
            </div>
            <div class="calc-res-item region" style="border-left: 4px solid ${regionColor};">
              <span class="calc-res-label">📍 1 MB Bellek Haritasındaki Konumu:</span>
              <span class="calc-res-val" style="color: ${regionColor};"><strong>${region}</strong></span>
            </div>
          </div>
        `;
      };

      btnCalc.addEventListener('click', doCalc);
      segInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doCalc(); });
      offInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doCalc(); });
      doCalc();
    }

    // 2. Little-Endian Visualizer
    const btnEndian = this.container.querySelector('#btn-calc-endian') as HTMLButtonElement | null;
    const wordInput = this.container.querySelector('#input-endian-word') as HTMLInputElement | null;
    const addrInput = this.container.querySelector('#input-endian-addr') as HTMLInputElement | null;
    const endianRes = this.container.querySelector('#endian-result-container') as HTMLElement | null;

    if (btnEndian && wordInput && addrInput && endianRes) {
      const doEndian = () => {
        const wordStr = (wordInput.value || '1234').trim().replace(/h$/i, '');
        const addrStr = (addrInput.value || '0200').trim().replace(/h$/i, '');
        const wordVal = (parseInt(wordStr, 16) || 0) & 0xFFFF;
        const addrVal = (parseInt(addrStr, 16) || 0) & 0xFFFF;

        const lowByte = wordVal & 0xFF;
        const highByte = (wordVal >> 8) & 0xFF;

        const lowAddr = addrVal;
        const highAddr = (addrVal + 1) & 0xFFFF;

        const lowAddrHex = lowAddr.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const highAddrHex = highAddr.toString(16).toUpperCase().padStart(4, '0') + 'H';
        const lowByteHex = lowByte.toString(16).toUpperCase().padStart(2, '0') + 'H';
        const highByteHex = highByte.toString(16).toUpperCase().padStart(2, '0') + 'H';
        const wordHex = wordVal.toString(16).toUpperCase().padStart(4, '0') + 'H';

        endianRes.innerHTML = `
          <div class="endian-boxes-wrap">
            <div class="endian-slot-card low">
              <div class="slot-badge">DÜŞÜK ADRES (Low Address)</div>
              <div class="slot-addr">[${lowAddrHex}]</div>
              <div class="slot-byte">${lowByteHex}</div>
              <div class="slot-role">Düşük Anlamlı Bayt (LSB)</div>
            </div>
            <div class="endian-arrow-card">
              <span class="endian-arrow-icon">⇄</span>
              <span class="endian-arrow-text">16-Bit Kelime:<br><strong>${wordHex}</strong></span>
            </div>
            <div class="endian-slot-card high">
              <div class="slot-badge">YÜKSEK ADRES (High Address)</div>
              <div class="slot-addr">[${highAddrHex}]</div>
              <div class="slot-byte">${highByteHex}</div>
              <div class="slot-role">Yüksek Anlamlı Bayt (MSB)</div>
            </div>
          </div>
          <div class="endian-rule-note">
            💡 <strong>Altın Kural:</strong> Intel 8086 mimarisinde düşük anlamlı bayt (<strong>${lowByteHex}</strong>) daima küçük adrese <code>[${lowAddrHex}]</code>, yüksek anlamlı bayt (<strong>${highByteHex}</strong>) ise bir sonraki adrese <code>[${highAddrHex}]</code> yazılır!
          </div>
        `;
      };

      btnEndian.addEventListener('click', doEndian);
      wordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doEndian(); });
      addrInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doEndian(); });
      doEndian();
    }
  }

  private attachEvents(prevKey: string | null, nextKey: string | null): void {
    this.container.querySelector('.bc-roadmap-link')?.addEventListener('click', () => {
      this.callbacks.onNavigateToRoadmap?.();
    });

    this.container.querySelector('#btn-lecture-split-editor')?.addEventListener('click', () => {
      this.callbacks.onSplitWithEditor?.();
    });

    if (prevKey) {
      this.container.querySelector('#btn-lecture-prev')?.addEventListener('click', () => {
        this.callbacks.onNavigateToMilestoneLecture(prevKey);
      });
    }

    if (nextKey) {
      this.container.querySelector('#btn-lecture-next')?.addEventListener('click', () => {
        this.callbacks.onNavigateToMilestoneLecture(nextKey);
      });
    }

    this.container.querySelector('#btn-lecture-jump-leetcode')?.addEventListener('click', () => {
      if (this.currentMilestoneId === 'milestone-1') {
        this.callbacks.onNavigateToMilestoneLecture('milestone-2');
      } else {
        this.callbacks.onNavigateToLeetCodeMilestone(this.currentMilestoneId);
      }
    });

    // Capstone event handlers
    this.container.querySelector('#btn-capstone-m1-next')?.addEventListener('click', () => {
      this.callbacks.onNavigateToMilestoneLecture('milestone-2');
    });

    const btnOpenLeetCode = this.container.querySelector('#btn-capstone-open-leetcode') as HTMLButtonElement | null;
    if (btnOpenLeetCode) {
      btnOpenLeetCode.addEventListener('click', () => {
        const chId = btnOpenLeetCode.getAttribute('data-ch-id') || undefined;
        this.callbacks.onNavigateToLeetCodeMilestone(this.currentMilestoneId, chId);
      });
    }

    const btnLoadEditor = this.container.querySelector('#btn-capstone-load-editor') as HTMLButtonElement | null;
    if (btnLoadEditor) {
      btnLoadEditor.addEventListener('click', () => {
        const chId = btnLoadEditor.getAttribute('data-ch-id');
        if (chId && CHALLENGES[chId]) {
          const ch = CHALLENGES[chId];
          this.callbacks.onOpenInMainEditor(ch.title, ch.starterCode);
        }
      });
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
