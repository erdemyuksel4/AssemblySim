import { 
  INSTRUCTIONS, 
  CATEGORIES, 
  InstructionDetail,
  ADDRESSING_MODES,
  PROGRAM_ADDRESSING_MODES,
  STACK_ADDRESSING_GUIDE,
  COMMON_PITFALLS_GUIDE,
  ARCHITECTURE_GUIDE,
  FLAGS_GUIDE,
  LECTURE_TERMINOLOGY,
  DMA_AND_IO_GUIDE,
  INTERRUPTS_AND_IVT_GUIDE,
  ADVANCED_ARCH_GUIDE
} from './instructionData.js';
import { LeetCodeView, LeetCodeCallbacks } from '../challenges/leetcodeView.js';
import { RoadmapCurriculumView } from '../challenges/roadmapCurriculumView.js';
import { Challenge } from '../challenges/types.js';

export type ManualTab = 'manual' | 'lectures' | 'leetcode' | 'roadmap';
export type LectureSubTab = 'addressing' | 'architecture' | 'flags' | 'dma_io' | 'interrupts' | 'pipelining' | 'glossary';

export interface InstructionDocCallbacks extends LeetCodeCallbacks {
  onOpenLectureDocument?: (milestoneId: string) => void;
}

export class InstructionDoc {
  private container: HTMLElement;
  private isOpen: boolean = false;
  private activeTab: ManualTab = 'manual';
  private activeLectureSubTab: LectureSubTab = 'addressing';
  private activeCategory: string = 'all';
  private searchQuery: string = '';
  private selectedOpcode: string = 'MOV';
  private leetcodeView?: LeetCodeView;
  private roadmapCurriculumView?: RoadmapCurriculumView;
  private callbacks?: InstructionDocCallbacks;

  constructor(container: HTMLElement, callbacks?: InstructionDocCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <section class="docs-section">
        <!-- Collapsible Toggle Header (Default: Closed) -->
        <div class="docs-toggle-bar" id="docs-toggle-bar" title="8086 Referans, Ders ve Görev Merkezini Aç / Kapat">
          <div class="docs-toggle-left">
            <span class="docs-book-icon">📖</span>
            <div class="docs-title-wrap">
              <span class="docs-main-title">8086 Öğrenme ve Referans Merkezi</span>
              <span class="docs-subtitle">1. Manuel | 2. Dersler & Teori | 3. LeetCode Görevleri | 4. Yol Haritası</span>
            </div>
            <span class="docs-count-badge">${INSTRUCTIONS.length} Komut</span>
          </div>
          <div class="docs-toggle-right">
            <span class="docs-toggle-status" id="docs-toggle-status">Rehberi Aç</span>
            <span class="docs-arrow-icon" id="docs-arrow-icon">▼</span>
          </div>
        </div>

        <!-- Collapsible Body Drawer -->
        <div class="docs-body-drawer" id="docs-body-drawer">
          <!-- 4 Main Navigation Tabs -->
          <div class="docs-main-tabs" id="docs-main-tabs">
            <button class="docs-main-tab active" data-tab="manual">
              📖 1. Manuel (Komut Seti)
            </button>
            <button class="docs-main-tab" data-tab="lectures">
              🎓 2. Dersler & Teori
            </button>
            <button class="docs-main-tab" data-tab="leetcode">
              ⚡ 3. 8086 LeetCode
            </button>
            <button class="docs-main-tab" data-tab="roadmap">
              🗺️ 4. Yol Haritası
            </button>
          </div>

          <!-- TAB 1: 📖 1. Manuel (Komut Seti Referansı) -->
          <div class="docs-tab-pane active" id="pane-manual">
            <!-- Filter & Search Toolbar -->
            <div class="docs-toolbar">
              <div class="docs-search-wrap">
                <span class="docs-search-icon">🔍</span>
                <input type="text" id="docs-search-input" class="docs-search-input" placeholder="Komut veya açıklama ara... (örn: MOV, IN, OUT, RCL, BCD, DUP)" />
                <button id="docs-search-clear" class="docs-search-clear" style="display: none;" title="Temizle">✕</button>
              </div>
              <div class="docs-categories-wrap" id="docs-categories-wrap">
                ${CATEGORIES.map(cat => `
                  <button class="docs-cat-btn ${cat.id === 'all' ? 'active' : ''}" data-cat="${cat.id}">
                    ${cat.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Master-Detail Content Layout -->
            <div class="docs-master-detail">
              <!-- Left Panel: Instruction List -->
              <div class="docs-list-panel" id="docs-list-panel"></div>

              <!-- Right Panel: Instruction Details & Variations -->
              <div class="docs-detail-panel" id="docs-detail-panel"></div>
            </div>
          </div>

          <!-- TAB 2: 🎓 2. Dersler & Teori (Lectures & Course Modules) -->
          <div class="docs-tab-pane" id="pane-lectures">
            <!-- Full Interactive Curriculum Direct Launch Grid -->
            <div class="theory-curriculum-banner">
              <div class="banner-top-row">
                <span class="theory-badge">🎓 10 AŞAMALI TAM DERS MÜFREDATI</span>
                <span class="theory-sources">Kaynak Sıralaması: 1. Doç. Dr. Mehmet Akif Çifci Slaytları | 2. Barry B. Brey Kitabı</span>
              </div>
              <h3 class="curriculum-main-title">8086 İnteraktif Ders Dokümanları ve Konu Anlatımları</h3>
              <p class="curriculum-desc">
                Her aşamanın zengin konu anlatımını, hoca slaytlarındaki formülleri, sınav tuzaklarını ve 
                <strong>20-Bit Adres Hesaplayıcı</strong>, <strong>Little-Endian Simülatörü</strong> gibi interaktif keşif araçlarını açmak için bir aşamaya tıklayın:
              </p>
              <div class="curriculum-pills-grid">
                <button class="btn-lecture-pill" data-milestone="milestone-1">📖 Aşama 1: Mimari, Bus & 20-Bit Adresleme</button>
                <button class="btn-lecture-pill" data-milestone="milestone-2">📖 Aşama 2: MOV, XCHG, LEA & 7 Mod</button>
                <button class="btn-lecture-pill" data-milestone="milestone-3">📖 Aşama 3: Aritmetik & Bayraklar</button>
                <button class="btn-lecture-pill" data-milestone="milestone-4">📖 Aşama 4: Mantıksal & Bit Kaydırma</button>
                <button class="btn-lecture-pill" data-milestone="milestone-5">📖 Aşama 5: Akış & Döngüler</button>
                <button class="btn-lecture-pill" data-milestone="milestone-6">📖 Aşama 6: Yığın & Prosedürler</button>
                <button class="btn-lecture-pill" data-milestone="milestone-7">📖 Aşama 7: Dizi & String</button>
                <button class="btn-lecture-pill" data-milestone="milestone-8">📖 Aşama 8: BCD & ASCII</button>
                <button class="btn-lecture-pill" data-milestone="milestone-9">📖 Aşama 9: I/O & Kesmeler (IVT)</button>
                <button class="btn-lecture-pill" data-milestone="milestone-10">📖 Aşama 10: Pipelining & LeetCode</button>
                <button class="btn-lecture-pill" data-milestone="milestone-11">📖 Aşama 11: Sistem & Tablo Komutları (XLAT, LDS, Flags)</button>
              </div>
            </div>

            <div class="lecture-sub-tabs" id="lecture-sub-tabs">
              <button class="lecture-sub-tab active" data-subtab="addressing">
                🎯 7 Adresleme Modu (Week 3)
              </button>
              <button class="lecture-sub-tab" data-subtab="architecture">
                📐 Mimari & Segment:Offset (Week 1–2)
              </button>
              <button class="lecture-sub-tab" data-subtab="flags">
                🏳️ FLAGS & Atlama Matrisi (Week 2 & 5)
              </button>
              <button class="lecture-sub-tab" data-subtab="dma_io">
                ⚡ G/Ç Sistemleri & DMA (Week 7)
              </button>
              <button class="lecture-sub-tab" data-subtab="interrupts">
                🔌 Kesmeler & IVT Tablosu (Week 6)
              </button>
              <button class="lecture-sub-tab" data-subtab="pipelining">
                🚀 Pipelining, Hazards, CISC/RISC & 8085 (Week 12–15)
              </button>
              <button class="lecture-sub-tab" data-subtab="glossary">
                📚 Ders Terminolojisi & Kavramlar
              </button>
            </div>

            <div class="lecture-sub-pane active" id="subpane-addressing">
              <div class="docs-theory-container" id="docs-addressing-container"></div>
            </div>
            <div class="lecture-sub-pane" id="subpane-architecture">
              <div class="docs-theory-container" id="docs-architecture-container"></div>
            </div>
            <div class="lecture-sub-pane" id="subpane-flags">
              <div class="docs-theory-container" id="docs-flags-container"></div>
            </div>
            <div class="lecture-sub-pane" id="subpane-dma_io">
              <div class="docs-theory-container" id="docs-dma-io-container"></div>
            </div>
            <div class="lecture-sub-pane" id="subpane-interrupts">
              <div class="docs-theory-container" id="docs-interrupts-container"></div>
            </div>
            <div class="lecture-sub-pane" id="subpane-pipelining">
              <div class="docs-theory-container" id="docs-pipelining-container"></div>
            </div>
            <div class="lecture-sub-pane" id="subpane-glossary">
              <div class="docs-theory-container" id="docs-glossary-container"></div>
            </div>
          </div>

          <!-- TAB 3: ⚡ 3. 8086 LeetCode (Görevler & Sınavlar) -->
          <div class="docs-tab-pane" id="pane-leetcode">
            <div id="docs-leetcode-container"></div>
          </div>

          <!-- TAB 4: 🗺️ 4. Yol Haritası (Müfredat & Gelişim Ağacı) -->
          <div class="docs-tab-pane" id="pane-roadmap">
            <div id="docs-roadmap-container"></div>
          </div>
        </div>
      </section>
    `;

    this.attachEvents();
    this.renderList();
    this.renderDetail();
    this.renderAddressingModes();
    this.renderArchitecture();
    this.renderFlags();
    this.renderDmaAndIo();
    this.renderInterrupts();
    this.renderAdvancedArch();
    this.renderGlossary();
    this.renderLeetCode();
    this.renderRoadmap();
  }

  private renderLeetCode(): void {
    const container = this.container.querySelector('#docs-leetcode-container') as HTMLElement;
    if (container && this.callbacks) {
      this.leetcodeView = new LeetCodeView(container, this.callbacks);
    }
  }

  private renderRoadmap(): void {
    const container = this.container.querySelector('#docs-roadmap-container') as HTMLElement;
    if (container) {
      this.roadmapCurriculumView = new RoadmapCurriculumView(container, {
        onOpenLecture: (milestoneId) => {
          if (this.callbacks?.onOpenLectureDocument) {
            this.callbacks.onOpenLectureDocument(milestoneId);
          }
        },
        onNavigateToLeetCode: (milestoneId) => {
          this.openTab('leetcode');
          if (milestoneId && this.leetcodeView) {
            this.leetcodeView.filterByMilestone(milestoneId);
          }
        }
      });
    }
  }

  openTab(tab: ManualTab): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.updateOpenState();
    }
    const btn = this.container.querySelector(`.docs-main-tab[data-tab="${tab}"]`) as HTMLButtonElement;
    if (btn) {
      btn.click();
    }
  }

  filterLeetCodeByMilestone(milestoneId: string, challengeId?: string): void {
    this.openTab('leetcode');
    if (this.leetcodeView) {
      this.leetcodeView.filterByMilestone(milestoneId, challengeId);
    }
  }

  private attachEvents(): void {
    const toggleBar = this.container.querySelector('#docs-toggle-bar') as HTMLElement;
    const searchInput = this.container.querySelector('#docs-search-input') as HTMLInputElement;
    const clearBtn = this.container.querySelector('#docs-search-clear') as HTMLButtonElement;
    const catWrap = this.container.querySelector('#docs-categories-wrap') as HTMLElement;
    const tabsWrap = this.container.querySelector('#docs-main-tabs') as HTMLElement;
    const subtabsWrap = this.container.querySelector('#lecture-sub-tabs') as HTMLElement;

    // Toggle expand/collapse
    toggleBar.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.updateOpenState();
    });

    // Main 4 Tabs Switcher
    tabsWrap.addEventListener('click', (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.docs-main-tab') as HTMLButtonElement;
      if (!btn) return;
      const tab = btn.getAttribute('data-tab') as ManualTab;
      if (!tab || tab === this.activeTab) return;

      tabsWrap.querySelectorAll('.docs-main-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.activeTab = tab;
      this.container.querySelectorAll('.docs-tab-pane').forEach(p => p.classList.remove('active'));
      this.container.querySelector(`#pane-${tab}`)?.classList.add('active');
    });

    // Lecture Sub-tabs Switcher
    subtabsWrap?.addEventListener('click', (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.lecture-sub-tab') as HTMLButtonElement;
      if (!btn) return;
      const subtab = btn.getAttribute('data-subtab') as LectureSubTab;
      if (!subtab || subtab === this.activeLectureSubTab) return;

      subtabsWrap.querySelectorAll('.lecture-sub-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.activeLectureSubTab = subtab;
      this.container.querySelectorAll('.lecture-sub-pane').forEach(p => p.classList.remove('active'));
      this.container.querySelector(`#subpane-${subtab}`)?.classList.add('active');
    });

    // Direct milestone lecture buttons in Theory tab
    this.container.querySelectorAll<HTMLButtonElement>('.btn-lecture-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const milestoneId = btn.getAttribute('data-milestone');
        if (milestoneId && this.callbacks?.onOpenLectureDocument) {
          this.callbacks.onOpenLectureDocument(milestoneId);
        }
      });
    });

    // Category button selection
    catWrap.addEventListener('click', (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.docs-cat-btn') as HTMLButtonElement;
      if (!btn) return;
      this.container.querySelectorAll('.docs-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.activeCategory = btn.getAttribute('data-cat') || 'all';
      this.renderList();
    });

    // Search input
    searchInput.addEventListener('input', () => {
      this.searchQuery = searchInput.value.trim().toLowerCase();
      clearBtn.style.display = this.searchQuery ? 'block' : 'none';
      this.renderList();
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      clearBtn.style.display = 'none';
      this.renderList();
      searchInput.focus();
    });
  }

  private updateOpenState(): void {
    const drawer = this.container.querySelector('#docs-body-drawer') as HTMLElement;
    const arrow = this.container.querySelector('#docs-arrow-icon') as HTMLElement;
    const statusText = this.container.querySelector('#docs-toggle-status') as HTMLElement;

    if (this.isOpen) {
      drawer.classList.add('open');
      arrow.classList.add('open');
      statusText.textContent = 'Kapat';
      setTimeout(() => {
        this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      drawer.classList.remove('open');
      arrow.classList.remove('open');
      statusText.textContent = 'Rehberi Aç';
    }
  }

  private getFilteredInstructions(): InstructionDetail[] {
    return INSTRUCTIONS.filter(inst => {
      if (this.activeCategory !== 'all' && inst.category !== this.activeCategory) {
        return false;
      }
      if (this.searchQuery) {
        const inOpcode = inst.opcode.toLowerCase().includes(this.searchQuery);
        const inName = inst.name.toLowerCase().includes(this.searchQuery);
        const inSummary = inst.summary.toLowerCase().includes(this.searchQuery);
        const inVariations = inst.variations.some(v => 
          v.syntax.toLowerCase().includes(this.searchQuery) ||
          v.description.toLowerCase().includes(this.searchQuery) ||
          v.example.toLowerCase().includes(this.searchQuery) ||
          (v.addressingMode && v.addressingMode.toLowerCase().includes(this.searchQuery))
        );
        return inOpcode || inName || inSummary || inVariations;
      }
      return true;
    });
  }

  private renderList(): void {
    const listPanel = this.container.querySelector('#docs-list-panel') as HTMLElement;
    const items = this.getFilteredInstructions();

    if (items.length === 0) {
      listPanel.innerHTML = `
        <div class="docs-empty-list">
          <span>🔍</span>
          <p>Eşleşen komut bulunamadı.</p>
        </div>
      `;
      return;
    }

    if (!items.some(i => i.opcode === this.selectedOpcode)) {
      this.selectedOpcode = items[0].opcode;
      this.renderDetail();
    }

    listPanel.innerHTML = items.map(inst => {
      const isSelected = inst.opcode === this.selectedOpcode;
      return `
        <div class="docs-list-item ${isSelected ? 'active' : ''}" data-opcode="${inst.opcode}">
          <div class="docs-item-header">
            <span class="docs-item-opcode">${inst.opcode}</span>
            <span class="docs-item-cat-badge">${this.getCategoryLabel(inst.category)}</span>
          </div>
          <div class="docs-item-name">${inst.name}</div>
          <div class="docs-item-summary">${inst.summary}</div>
        </div>
      `;
    }).join('');

    listPanel.querySelectorAll('.docs-list-item').forEach(el => {
      el.addEventListener('click', () => {
        const opcode = el.getAttribute('data-opcode');
        if (opcode) {
          this.selectedOpcode = opcode;
          listPanel.querySelectorAll('.docs-list-item').forEach(i => i.classList.remove('active'));
          el.classList.add('active');
          this.renderDetail();
        }
      });
    });
  }

  private renderDetail(): void {
    const detailPanel = this.container.querySelector('#docs-detail-panel') as HTMLElement;
    const inst = INSTRUCTIONS.find(i => i.opcode === this.selectedOpcode);

    if (!inst) {
      detailPanel.innerHTML = `<div class="docs-no-selection">Lütfen soldaki listeden bir komut seçin.</div>`;
      return;
    }

    detailPanel.innerHTML = `
      <div class="docs-detail-content">
        <!-- Main Header -->
        <div class="docs-detail-header">
          <div class="docs-detail-title-group">
            <h3 class="docs-detail-opcode">${inst.opcode}</h3>
            <span class="docs-detail-fullname">${inst.name}</span>
          </div>
          <span class="docs-cat-badge-large">${this.getCategoryLabel(inst.category)}</span>
        </div>

        <!-- Description Box -->
        <div class="docs-info-box">
          <div class="docs-info-label">Açıklama:</div>
          <div class="docs-info-val">${inst.summary}</div>
        </div>

        <!-- Flags Box -->
        <div class="docs-flags-box">
          <span class="docs-flags-label">🏳️ Etkilenen Bayraklar:</span>
          <span class="docs-flags-val">${inst.flags}</span>
        </div>

        <!-- Special 8086 Rules Box if present -->
        ${inst.rules ? `
          <div class="docs-rules-box">
            <span class="docs-rules-icon">⚠️</span>
            <div class="docs-rules-text"><strong>8086 Donanım Kuralı & Slayt Notu:</strong>\n${this.escapeHtml(inst.rules).replace(/\\n/g, '<br/>')}</div>
          </div>
        ` : ''}

        <!-- Variations Section -->
        <div class="docs-variations-section">
          <h4 class="docs-variations-title">Kullanım Varyasyonları (${inst.variations.length})</h4>
          <div class="docs-variations-grid">
            ${inst.variations.map((v, idx) => `
              <div class="docs-var-card">
                <div class="docs-var-header">
                  <div class="docs-var-syntax-wrap">
                    <span class="docs-var-syntax">${this.escapeHtml(v.syntax)}</span>
                    ${v.addressingMode ? `<span class="docs-addressing-mode-badge" title="Ders Slaytındaki Adresleme Modu">🎯 ${this.escapeHtml(v.addressingMode)}</span>` : ''}
                  </div>
                  <span class="docs-var-badge">Varyasyon #${idx + 1}</span>
                </div>
                <p class="docs-var-desc">${v.description}</p>
                <div class="docs-example-box">
                  <div class="docs-example-header">
                    <span>Örnek Kullanım:</span>
                    <button class="btn-copy-code" data-code="${this.escapeHtml(v.example)}" title="Kodu Kopyala">Kopyala</button>
                  </div>
                  <pre class="docs-code-pre"><code>${this.escapeHtml(v.example)}</code></pre>
                </div>
                ${v.note ? `<div class="docs-var-note">💡 <strong>İpucu:</strong> ${v.note}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.attachCopyButtons(detailPanel);
  }

  /**
   * Render TAB 2: Addressing Modes
   */
  private renderAddressingModes(): void {
    const container = this.container.querySelector('#docs-addressing-container') as HTMLElement;
    if (!container) return;

    container.innerHTML = `
      <!-- Section 1: The 7 Data-Addressing Modes -->
      <div class="theory-header">
        <h3 class="theory-title">1. Veri Adresleme Modları (The 7 Data-Addressing Modes - Week 3, Section 2)</h3>
        <p class="theory-subtitle">
          BMI3121 ders slaytlarına göre MOV komutunun kaynak ve hedef veriye ulaşma yöntemleri.
          <strong>Altın Kural:</strong> Veri akışı daima sağdan sola (Hedef ← Kaynak) gerçekleşir. MOV veriyi taşımaz, KOPYALAR!
        </p>
      </div>

      <div class="theory-cards-grid">
        ${ADDRESSING_MODES.map(mode => `
          <div class="theory-card">
            <div class="theory-card-header">
              <span class="theory-card-badge">${mode.category.toUpperCase()}</span>
              <h4 class="theory-card-title">${mode.modeName}</h4>
            </div>
            <p class="theory-card-desc">${mode.summary}</p>
            
            <div class="theory-meta-row">
              <span class="theory-meta-label">İzin Verilen Yazmaçlar:</span>
              <span class="theory-meta-val">${mode.registersAllowed}</span>
            </div>

            <div class="theory-meta-row">
              <span class="theory-meta-label">Varsayılan Segment:</span>
              <span class="theory-meta-val segment-val">${mode.defaultSegment}</span>
            </div>

            ${mode.formula ? `
              <div class="theory-formula-box">
                <span class="formula-label">Formül:</span>
                <code>${mode.formula}</code>
              </div>
            ` : ''}

            <div class="docs-example-box" style="margin-top: 10px;">
              <div class="docs-example-header">
                <span>Slayt Örneği:</span>
                <button class="btn-copy-code" data-code="${this.escapeHtml(mode.example)}" title="Kodu Kopyala">Kopyala</button>
              </div>
              <pre class="docs-code-pre"><code>${this.escapeHtml(mode.example)}</code></pre>
            </div>

            <div class="docs-var-note" style="margin-top: 8px;">
              ⚠️ <strong>Dikkat:</strong> ${mode.notes}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Section 2: Program Memory Addressing Modes (JMP & CALL) -->
      <div class="theory-header" style="margin-top: 24px;">
        <h3 class="theory-title">2. Program Bellek Adresleme Modları (Program Memory Addressing Modes - Section 3)</h3>
        <p class="theory-subtitle">
          JMP (atlama) ve CALL (altprogram çağırma) komutlarının sonraki komut adresini bulma biçimleri: Direct, Relative ve Indirect.
        </p>
      </div>

      <div class="theory-cards-grid">
        ${PROGRAM_ADDRESSING_MODES.map(pm => `
          <div class="theory-card">
            <div class="theory-card-header">
              <span class="theory-card-badge control">${pm.reach}</span>
              <h4 class="theory-card-title">${pm.name}</h4>
            </div>
            <p class="theory-card-desc">${pm.description}</p>
            ${pm.formula ? `
              <div class="theory-formula-box">
                <span class="formula-label">Adres Hesabı:</span>
                <code>${pm.formula}</code>
              </div>
            ` : ''}
            <div class="docs-example-box" style="margin-top: 10px;">
              <div class="docs-example-header">
                <span>Slayt Örneği:</span>
                <button class="btn-copy-code" data-code="${this.escapeHtml(pm.example)}" title="Kodu Kopyala">Kopyala</button>
              </div>
              <pre class="docs-code-pre"><code>${this.escapeHtml(pm.example)}</code></pre>
            </div>
            <div class="docs-var-note" style="margin-top: 8px;">
              💡 <strong>Not:</strong> ${pm.notes}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Section 3: Stack Memory Addressing Modes -->
      <div class="theory-header" style="margin-top: 24px;">
        <h3 class="theory-title">${STACK_ADDRESSING_GUIDE.title}</h3>
        <p class="theory-subtitle">
          Geçici verilerin ve altprogram dönüş adreslerinin saklandığı <strong>${STACK_ADDRESSING_GUIDE.discipline}</strong> bellek yapısı.
        </p>
      </div>

      <div class="theory-grid-2col">
        <div class="theory-card">
          <h4 class="theory-card-title">Yığın Donanım Mekanizması (SP İşaretçisi)</h4>
          <div class="theory-formula-box highlighted">
            <span class="formula-label">Fiziksel Yığın Adresi:</span>
            <code class="formula-code">${STACK_ADDRESSING_GUIDE.formula}</code>
          </div>
          <ul class="theory-list" style="margin-top: 10px;">
            <li><strong>${STACK_ADDRESSING_GUIDE.pushStep}</strong></li>
            <li><strong>${STACK_ADDRESSING_GUIDE.popStep}</strong></li>
            <li>Yığın işlemleri 8086'da daima <strong>16-bit Kelime (Word)</strong> bazında yapılır.</li>
          </ul>
          <div class="docs-var-note" style="margin-top: 10px;">
            🛑 <strong>Kritik Kural:</strong> ${STACK_ADDRESSING_GUIDE.rule}
          </div>
        </div>

        <div class="theory-card">
          <h4 class="theory-card-title">Slayt Örneği: Yığın ile İki Yazmacın Takası (Swap)</h4>
          <p class="theory-card-desc">${STACK_ADDRESSING_GUIDE.swapExample.explanation}</p>
          <div class="docs-example-box" style="margin-top: 8px;">
            <div class="docs-example-header">
              <span>Slayt 34–35 Kodu:</span>
              <button class="btn-copy-code" data-code="${this.escapeHtml(STACK_ADDRESSING_GUIDE.swapExample.code)}" title="Kodu Kopyala">Kopyala</button>
            </div>
            <pre class="docs-code-pre"><code>${this.escapeHtml(STACK_ADDRESSING_GUIDE.swapExample.code)}</code></pre>
          </div>
        </div>
      </div>

      <!-- Section 4: Common Pitfalls & Selection Table -->
      <div class="theory-card" style="margin-top: 24px;">
        <h4 class="theory-card-title">${COMMON_PITFALLS_GUIDE.title}</h4>
        <ul class="theory-list golden">
          ${COMMON_PITFALLS_GUIDE.rules.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <hr class="theory-divider" />
        <h5 class="theory-subheading">Hangi Durumda Hangi Mod Seçilir? (Slayt 37 Rehberi)</h5>
        <div class="table-responsive">
          <table class="theory-table">
            <thead>
              <tr>
                <th>İhtiyaç / Amaç</th>
                <th>Kullanılacak Adresleme Modu</th>
              </tr>
            </thead>
            <tbody>
              ${COMMON_PITFALLS_GUIDE.selectionTable.map(row => `
                <tr>
                  <td><strong>${row.need}</strong></td>
                  <td><code>${row.reachFor}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachCopyButtons(container);
  }

  /**
   * Render TAB 3: Architecture & Real-Mode Addressing
   */
  private renderArchitecture(): void {
    const container = this.container.querySelector('#docs-architecture-container') as HTMLElement;
    if (!container) return;

    const arch = ARCHITECTURE_GUIDE;

    container.innerHTML = `
      <div class="theory-header">
        <h3 class="theory-title">${arch.title}</h3>
        <p class="theory-subtitle">
          8086 mikroişlemcisinin veri yolları, gerçek mod (Real Mode) segment:ofset bellek hesaplama kuralları ve yazmaç hiyerarşisi.
        </p>
      </div>

      <!-- Bus Architecture & Real Mode Formula Grid -->
      <div class="theory-grid-2col">
        <!-- Card 1: Veri Yolu & Bellek Haritası -->
        <div class="theory-card">
          <h4 class="theory-card-title">Veri Yolu (Bus) & Bellek Bölütleri</h4>
          <ul class="theory-list">
            <li><strong>Adres Yolu (Address Bus):</strong> ${arch.busSystem.addressBus}</li>
            <li><strong>Veri Yolu (Data Bus):</strong> ${arch.busSystem.dataBus}</li>
            <li><strong>Denetim Yolu (Control Bus):</strong> ${arch.busSystem.controlBus}</li>
          </ul>
          <hr class="theory-divider" />
          <h5 class="theory-subheading">${arch.memoryOrganization.title}</h5>
          <div class="memory-region-item">
            <span class="region-badge tpa">TPA (640 KB)</span>
            <span class="region-desc">${arch.memoryOrganization.tpa}</span>
          </div>
          <div class="memory-region-item">
            <span class="region-badge sys">System Area (384 KB)</span>
            <span class="region-desc">${arch.memoryOrganization.systemArea}</span>
          </div>
        </div>

        <!-- Card 2: Fiziksel Adres Hesabı -->
        <div class="theory-card">
          <h4 class="theory-card-title">Fiziksel Adres Hesaplama (Worked Example - Slayt 34–38)</h4>
          <div class="theory-formula-box highlighted">
            <span class="formula-label">Temel Formül:</span>
            <code class="formula-code">${arch.realModeFormula.formula}</code>
          </div>
          <p class="theory-card-desc" style="margin-top: 8px;">
            ${arch.realModeFormula.explanation}
          </p>
          <div class="example-calculation-box">
            <pre class="calculation-pre"><code>${arch.realModeFormula.example}</code></pre>
          </div>
        </div>
      </div>


      <!-- Entry Point (Giriş Noktası) & Reset Vector Card -->
      <div class="theory-card" style="margin-top: 14px; border-left: 4px solid #0284c7;">
        <h4 class="theory-card-title">🚀 ${arch.entryPointGuide.title}</h4>
        <p class="theory-card-desc">
          ${arch.entryPointGuide.meaning}
        </p>
        <div class="theory-grid-2col" style="margin-top: 10px;">
          <div class="memory-region-item">
            <span class="region-badge tpa">Giriş Noktası: CS:0000h</span>
            <span class="region-desc">${arch.entryPointGuide.defaultOrigin}</span>
          </div>
          <div class="memory-region-item">
            <span class="region-badge" style="background:#0284c7;color:#fff;">ORG 100H & DOS .COM</span>
            <span class="region-desc">${arch.entryPointGuide.org100h}</span>
          </div>
        </div>
        <div class="docs-var-note" style="margin-top: 10px;">
          ⚡ <strong>Donanımsal Reset Vektörü:</strong> ${arch.entryPointGuide.resetVector}
        </div>
      </div>

      <!-- Default Segment Pairs Table -->
      <div class="theory-card" style="margin-top: 14px;">
        <h4 class="theory-card-title">Varsayılan Segment ve Ofset Eşleşmeleri (Default Segment:Offset Pairs - Slayt 37)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead>
              <tr>
                <th>İşlem / Görev</th>
                <th>Segment Yazmacı</th>
                <th>Ofset Yazmacı</th>
                <th>Örnek Adres Gösterimi</th>
              </tr>
            </thead>
            <tbody>
              ${arch.defaultPairs.map(pair => `
                <tr>
                  <td><strong>${pair.purpose}</strong></td>
                  <td><code>${pair.segment}</code></td>
                  <td><code>${pair.offset}</code></td>
                  <td><code>${pair.segment.split(' ')[0]}:${pair.offset.split(' ')[0]}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Nested Register Widths Evolution Diagram -->
      <div class="theory-card" style="margin-top: 14px;">
        <h4 class="theory-card-title">${arch.nestedRegisters.title}</h4>
        <p class="theory-card-desc">
          8086'dan modern 64-bit mimariye yazmaçların içiçe geçme (nested widths) şeması.
        </p>
        <pre class="nested-regs-pre"><code>${arch.nestedRegisters.diagram}</code></pre>
        <div class="docs-var-note" style="margin-top: 8px;">
          💡 <strong>Altın Kural:</strong> ${arch.nestedRegisters.rule}
        </div>
      </div>
    `;

    this.attachCopyButtons(container);
  }

  /**
   * Render TAB 4: Flags & Jump Decision Matrix
   */
  private renderFlags(): void {
    const container = this.container.querySelector('#docs-flags-container') as HTMLElement;
    if (!container) return;

    const fg = FLAGS_GUIDE;

    container.innerHTML = `
      <div class="theory-header">
        <h3 class="theory-title">${fg.title}</h3>
        <p class="theory-subtitle">
          Aritmetik, mantık ve karşılaştırma komutlarının etkilediği durum bayrakları ve koşullu dallanma (Conditional Jumps) kuralları.
        </p>
      </div>

      <!-- Status Flags & Control Flags -->
      <div class="theory-grid-2col">
        <!-- Status Flags -->
        <div class="theory-card">
          <h4 class="theory-card-title">Durum Bayrakları (6 Status Flags - Donanım Sonucu)</h4>
          <div class="flags-list">
            ${fg.statusFlags.map(sf => `
              <div class="flag-item">
                <span class="flag-badge status">Bit ${sf.bit}: ${sf.flag}</span>
                <span class="flag-desc">${sf.desc}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Control Flags & Golden Rules -->
        <div class="theory-card">
          <h4 class="theory-card-title">Kontrol Bayrakları (3 Control Flags - İşlemci Davranışı)</h4>
          <div class="flags-list">
            ${fg.controlFlags.map(cf => `
              <div class="flag-item">
                <span class="flag-badge control">Bit ${cf.bit}: ${cf.flag}</span>
                <span class="flag-desc">${cf.desc}</span>
              </div>
            `).join('')}
          </div>
          <hr class="theory-divider" />
          <h5 class="theory-subheading">⚠️ Slaytlardaki Kritik Bayrak Kuralları:</h5>
          <ul class="theory-list golden">
            ${fg.goldenRules.map(rule => `<li>${rule}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Conditional Jump Reference Matrix -->
      <div class="theory-card" style="margin-top: 14px;">
        <h4 class="theory-card-title">Koşullu Atlama Karar Matrisi (Conditional Jump Decision Matrix)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead>
              <tr>
                <th>Komut</th>
                <th>Anlamı</th>
                <th>Test Edilen Bayrak Koşulu</th>
                <th>Kullanım Alanı</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>JE / JZ</code></td>
                <td>Jump if Equal / Zero</td>
                <td><code>ZF = 1</code></td>
                <td>Eşitlik / Sıfır kontrolü</td>
              </tr>
              <tr>
                <td><code>JNE / JNZ</code></td>
                <td>Jump if Not Equal / Not Zero</td>
                <td><code>ZF = 0</code></td>
                <td>Eşitsizlik kontrolü</td>
              </tr>
              <tr>
                <td><code>JA / JNBE</code></td>
                <td>Jump if Above (Büyükse)</td>
                <td><code>CF = 0 and ZF = 0</code></td>
                <td><strong>İşaretsiz (Unsigned)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JB / JC / JNAE</code></td>
                <td>Jump if Below / Carry (Küçükse)</td>
                <td><code>CF = 1</code></td>
                <td><strong>İşaretsiz (Unsigned)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JAE / JNC / JNB</code></td>
                <td>Jump if Above or Equal</td>
                <td><code>CF = 0</code></td>
                <td><strong>İşaretsiz (Unsigned)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JBE / JNA</code></td>
                <td>Jump if Below or Equal</td>
                <td><code>CF = 1 or ZF = 1</code></td>
                <td><strong>İşaretsiz (Unsigned)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JG / JNLE</code></td>
                <td>Jump if Greater (Büyükse)</td>
                <td><code>ZF = 0 and SF = OF</code></td>
                <td><strong>İşaretli (Signed)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JL / JNGE</code></td>
                <td>Jump if Less (Küçükse)</td>
                <td><code>SF != OF</code></td>
                <td><strong>İşaretli (Signed)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JGE / JNL</code></td>
                <td>Jump if Greater or Equal</td>
                <td><code>SF = OF</code></td>
                <td><strong>İşaretli (Signed)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JLE / JNG</code></td>
                <td>Jump if Less or Equal</td>
                <td><code>ZF = 1 or SF != OF</code></td>
                <td><strong>İşaretli (Signed)</strong> sayılarda</td>
              </tr>
              <tr>
                <td><code>JO / JNO</code></td>
                <td>Jump if Overflow / No Overflow</td>
                <td><code>OF = 1 / OF = 0</code></td>
                <td>İşaretli taşma kontrolü</td>
              </tr>
              <tr>
                <td><code>JS / JNS</code></td>
                <td>Jump if Sign / No Sign</td>
                <td><code>SF = 1 / SF = 0</code></td>
                <td>Negatif / Pozitif kontrolü</td>
              </tr>
              <tr>
                <td><code>JCXZ</code></td>
                <td>Jump if CX Register is Zero</td>
                <td><code>CX = 0</code></td>
                <td>Döngü öncesi sıfır kontrolü</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachCopyButtons(container);
  }

  private attachCopyButtons(parent: HTMLElement): void {
    parent.querySelectorAll<HTMLButtonElement>('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code') || '';
        navigator.clipboard.writeText(code).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Kopyalandı! ✓';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
          }, 1500);
        });
      });
    });
  }

  private getCategoryLabel(catId: string): string {
    const found = CATEGORIES.find(c => c.id === catId);
    return found ? found.label : catId;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Render TAB 5: Lecture Terminology, FDE Cycle, CISC vs RISC, and Concepts
   */
  private renderGlossary(): void {
    const container = this.container.querySelector('#docs-glossary-container') as HTMLElement;
    if (!container) return;

    const term = LECTURE_TERMINOLOGY;

    container.innerHTML = `
      <div class="theory-header">
        <h3 class="theory-title">${term.title}</h3>
        <p class="theory-subtitle">
          BMI3121 ders slaytlarında geçen tüm teknik terimler, mimari karşılaştırmaları ve sınavda sorulan kavramların açıklamaları.
        </p>
      </div>

      <!-- FDE Cycle Card -->
      <div class="theory-card" style="border-left: 4px solid #8b5cf6;">
        <h4 class="theory-card-title">🔄 ${term.fdeCycle.title}</h4>
        <p class="theory-card-desc">${term.fdeCycle.description}</p>
        <div class="theory-cards-grid" style="margin-top: 12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
          ${term.fdeCycle.steps.map(s => `
            <div class="theory-card" style="background: #f8fafc; border: 1px solid #e2e8f0;">
              <span class="theory-card-badge" style="background:#8b5cf6;color:#fff;">${s.step}</span>
              <h5 style="margin: 8px 0 4px; font-size: 13px; font-weight: 700; color: #1e293b;">${s.name}</h5>
              <p style="font-size: 12px; color: #475569; line-height: 1.5; margin: 0;">${s.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CISC vs RISC Comparison Table -->
      <div class="theory-card" style="margin-top: 16px;">
        <h4 class="theory-card-title">⚖️ ${term.ciscVsRisc.title}</h4>
        <p class="theory-card-desc">${term.ciscVsRisc.description}</p>
        <div class="table-responsive" style="margin-top: 10px;">
          <table class="theory-table">
            <thead>
              <tr>
                <th style="width: 20%;">Karşılaştırma Alanı</th>
                <th style="width: 40%; background: rgba(59, 130, 246, 0.08);">CISC (Intel 8086 / x86)</th>
                <th style="width: 40%; background: rgba(16, 185, 129, 0.08);">RISC (ARM Architecture)</th>
              </tr>
            </thead>
            <tbody>
              ${term.ciscVsRisc.table.map(row => `
                <tr>
                  <td><strong>${row.feature}</strong></td>
                  <td style="font-size: 12px;">${row.cisc}</td>
                  <td style="font-size: 12px;">${row.risc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Addressing Modes Advantage & Disadvantage Comparison -->
      <div class="theory-card" style="margin-top: 16px;">
        <h4 class="theory-card-title">🎯 ${term.addressingComparison.title}</h4>
        <p class="theory-card-desc">${term.addressingComparison.description}</p>
        <div class="table-responsive" style="margin-top: 10px;">
          <table class="theory-table">
            <thead>
              <tr>
                <th>Adresleme Modu</th>
                <th>Sözdizimi</th>
                <th>Efektif Adres (EA)</th>
                <th>Avantajları</th>
                <th>Dezavantajları</th>
                <th>Tipik Kullanım</th>
              </tr>
            </thead>
            <tbody>
              ${term.addressingComparison.table.map(row => `
                <tr>
                  <td><strong>${row.mode}</strong></td>
                  <td><code>${row.syntax}</code></td>
                  <td><code>${row.effectiveAddress}</code></td>
                  <td style="color: #15803d; font-size: 11.5px;">✓ ${row.advantages}</td>
                  <td style="color: #b91c1c; font-size: 11.5px;">✗ ${row.disadvantages}</td>
                  <td style="font-size: 11.5px; color: #475569;">${row.typicalUse}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Key Concepts & Definitions Grid -->
      <div class="theory-header" style="margin-top: 24px;">
        <h3 class="theory-title">📖 Slaytlarda Geçen Tüm Kavramlar & Altın Kurallar</h3>
        <p class="theory-subtitle">Slayt referansları ve ders notlarıyla tanımlanan temel terimler.</p>
      </div>

      <div class="theory-cards-grid" style="margin-top: 12px;">
        ${term.terms.map(t => `
          <div class="theory-card">
            <div class="theory-card-header">
              <span class="theory-card-badge" style="background: #0284c7; color:#fff;">${t.tag}</span>
              <h4 class="theory-card-title">${t.term}</h4>
            </div>
            <p class="theory-card-desc" style="font-weight: 600; color: #0f172a;">${t.definition}</p>
            <p style="font-size: 12px; color: #334155; line-height: 1.5; margin: 6px 0 10px;">${t.details}</p>
            <div class="docs-var-note" style="margin-top: auto; font-size: 11px;">
              📍 <strong>Slayt Referansı:</strong> ${t.slideRef}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.attachCopyButtons(container);
  }

  /**
   * Render TAB 2 Subtab 4: DMA & I/O Systems (Week 7)
   */
  private renderDmaAndIo(): void {
    const container = this.container.querySelector('#docs-dma-io-container') as HTMLElement;
    if (!container) return;

    const dma = DMA_AND_IO_GUIDE;

    container.innerHTML = `
      <div class="theory-header">
        <h3 class="theory-title">⚡ ${dma.title}</h3>
        <p class="theory-subtitle">${dma.subtitle} — <strong>📍 Müfredat: ${dma.syllabusRef}</strong></p>
      </div>

      <!-- Section 1: 3 I/O Techniques Comparison -->
      <div class="theory-header" style="margin-top: 16px;">
        <h4 class="theory-title" style="font-size: 14px;">1. Giriş/Çıkış Yöntemleri Karşılaştırması</h4>
      </div>
      <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        ${dma.ioTechniques.map(tech => `
          <div class="theory-card" style="border-top: 3px solid #6366f1;">
            <div class="theory-card-header">
              <span class="theory-card-badge" style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;">${tech.badge}</span>
              <h4 class="theory-card-title">${tech.name}</h4>
            </div>
            <p class="theory-card-desc" style="font-size: 11.5px; color: #334155; line-height: 1.45;">${tech.mechanism}</p>
            <div class="theory-meta-row" style="margin-top: 8px;">
              <span class="theory-meta-label">CPU Yükü:</span>
              <span class="theory-meta-val" style="color: #b91c1c; font-weight: 700;">${tech.cpuOverhead}</span>
            </div>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Donanım Maliyeti:</span>
              <span class="theory-meta-val">${tech.hardwareCost}</span>
            </div>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Tipik Kullanım:</span>
              <span class="theory-meta-val">${tech.useCase}</span>
            </div>
            <div style="margin-top: 10px; font-size: 11px;">
              <strong style="color: #166534;">✅ Avantajlar:</strong>
              <ul style="margin: 4px 0 6px 16px; padding: 0; color: #166534;">
                ${tech.pros.map(p => `<li>${p}</li>`).join('')}
              </ul>
              <strong style="color: #991b1b;">❌ Dezavantajlar:</strong>
              <ul style="margin: 4px 0 0 16px; padding: 0; color: #991b1b;">
                ${tech.cons.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Section 2: 8237 DMA Controller Architecture & Channels -->
      <div class="theory-card" style="margin-top: 20px; border-left: 4px solid #10b981;">
        <h4 class="theory-card-title">🎛️ ${dma.dmaArchitecture.controllerName} Mimarisi & Kanalları</h4>
        <p class="theory-card-desc">${dma.dmaArchitecture.definition}</p>

        <div class="table-responsive" style="margin-top: 12px;">
          <table class="theory-table">
            <thead>
              <tr>
                <th style="width: 20%;">DMA Kanalı</th>
                <th style="width: 30%;">Tipik Görev</th>
                <th style="width: 50%;">Donanımsal İşlev ve Açıklama</th>
              </tr>
            </thead>
            <tbody>
              ${dma.dmaArchitecture.channels.map(ch => `
                <tr>
                  <td><code>${ch.channel}</code></td>
                  <td><strong>${ch.typicalUse}</strong></td>
                  <td style="font-size: 11.5px;">${ch.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: DMA Handshake Signals (Timeline) -->
      <div class="theory-card" style="margin-top: 20px;">
        <h4 class="theory-card-title">🤝 DMA El Sıkışma Protokolü (Handshaking Signals)</h4>
        <p class="theory-card-desc">Bir çevre birimi bellek ile doğrudan veri transferi yaparken oluşan 5 adımlı sinyalleşme döngüsü:</p>

        <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 12px;">
          ${dma.dmaArchitecture.handshakeSignals.map(sig => `
            <div class="theory-card" style="background: #f8fafc; border: 1px solid #e2e8f0;">
              <span class="theory-card-badge" style="background: #10b981; color: #fff;">Adım ${sig.step}</span>
              <h5 style="margin: 6px 0; font-size: 13px; font-weight: 800; color: #0f172a;">${sig.signal}</h5>
              <div style="font-size: 10px; font-weight: 700; color: #6366f1; margin-bottom: 4px;">${sig.direction}</div>
              <p style="font-size: 11.5px; color: #334155; margin: 0; line-height: 1.45;">${sig.role}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 4: DMA Transfer Modes -->
      <div class="theory-header" style="margin-top: 20px;">
        <h4 class="theory-title" style="font-size: 14px;">3. DMA Veri Transfer Modları</h4>
      </div>
      <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        ${dma.dmaArchitecture.transferModes.map(m => `
          <div class="theory-card">
            <h4 class="theory-card-title">🔄 ${m.title}</h4>
            <span class="theory-card-badge" style="background: #e0f2fe; color: #0369a1; margin: 4px 0 8px;">${m.mode}</span>
            <p class="theory-card-desc" style="font-size: 11.5px; color: #1e293b; line-height: 1.45;">${m.description}</p>
            <div class="theory-meta-row" style="margin-top: 8px;">
              <span class="theory-meta-label">Veri Yolu Davranışı:</span>
              <span class="theory-meta-val">${m.busBehavior}</span>
            </div>
            <div class="docs-var-note" style="margin-top: 8px; font-size: 11px;">
              ⭐ <strong>Avantaj:</strong> ${m.advantage}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Section 5: Isolated I/O vs Memory-Mapped I/O -->
      <div class="theory-header" style="margin-top: 20px;">
        <h4 class="theory-title" style="font-size: 14px;">4. Port Tabanlı (Isolated) vs Bellekle Eşlenmiş (Memory-Mapped) I/O</h4>
      </div>
      <div class="theory-cards-grid" style="grid-template-columns: 1fr 1fr;">
        ${dma.ioAddressingTypes.map(io => `
          <div class="theory-card" style="border-top: 3px solid #8b5cf6;">
            <h4 class="theory-card-title">${io.title}</h4>
            <span class="theory-card-badge" style="background: #f5f3ff; color: #6d28d9; margin: 4px 0 8px;">${io.type}</span>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Kullanılan Komutlar:</span>
              <span class="theory-meta-val"><code>${io.instructions}</code></span>
            </div>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Adres Uzayı:</span>
              <span class="theory-meta-val">${io.addressSpace}</span>
            </div>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Kontrol Sinyalleri:</span>
              <span class="theory-meta-val"><code>${io.controlSignal}</code></span>
            </div>
            <p style="font-size: 11.5px; color: #334155; margin-top: 8px; line-height: 1.45;">${io.prosAndCons}</p>
          </div>
        `).join('')}
      </div>
    `;

    this.attachCopyButtons(container);
  }

  /**
   * Render TAB 2 Subtab 5: Interrupts & IVT (Week 6)
   */
  private renderInterrupts(): void {
    const container = this.container.querySelector('#docs-interrupts-container') as HTMLElement;
    if (!container) return;

    const intr = INTERRUPTS_AND_IVT_GUIDE;

    container.innerHTML = `
      <div class="theory-header">
        <h3 class="theory-title">🔌 ${intr.title}</h3>
        <p class="theory-subtitle">${intr.subtitle} — <strong>📍 Müfredat: ${intr.syllabusRef}</strong></p>
      </div>

      <!-- IVT Architecture Card -->
      <div class="theory-card" style="border-left: 4px solid #ef4444;">
        <h4 class="theory-card-title">🗺️ Kesme Vektör Tablosu (IVT - Interrupt Vector Table) Mimarisi</h4>
        <p class="theory-card-desc">${intr.ivtStructure.description}</p>
        <div class="theory-grid-2col" style="margin-top: 10px;">
          <div>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Adres Aralığı:</span>
              <span class="theory-meta-val"><code>${intr.ivtStructure.addressRange}</code></span>
            </div>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Toplam Vektör Sayısı:</span>
              <span class="theory-meta-val"><b>${intr.ivtStructure.totalVectors} adet</b> (Tip 0 – Tip 255)</span>
            </div>
            <div class="theory-meta-row">
              <span class="theory-meta-label">Vektör Boyutu:</span>
              <span class="theory-meta-val">${intr.ivtStructure.vectorSizeBytes} Bayt (Far Pointer: 2 bayt IP + 2 bayt CS)</span>
            </div>
          </div>
          <div>
            <div class="theory-formula-box" style="margin: 0;">
              <span class="formula-label">Vektör Adres Formülü:</span>
              <code>${intr.ivtStructure.formula}</code>
            </div>
            <div class="docs-var-note" style="margin-top: 8px; font-size: 11px;">
              💡 <strong>Little-Endian Sıralaması:</strong> İlk 2 bayt IP (Düşük adres), sonraki 2 bayt CS (Yüksek adres).
            </div>
          </div>
        </div>
      </div>

      <!-- Dedicated Interrupts Table -->
      <div class="theory-card" style="margin-top: 16px;">
        <h4 class="theory-card-title">📋 Ön Tanımlı ve Özel Kesmeler Tablosu (Dedicated Interrupts)</h4>
        <div class="table-responsive" style="margin-top: 10px;">
          <table class="theory-table">
            <thead>
              <tr>
                <th style="width: 15%;">Kesme Tipi</th>
                <th style="width: 18%;">IVT Adresi</th>
                <th style="width: 25%;">Kesme Adı</th>
                <th style="width: 42%;">Tetiklenme Koşulu & Açıklama</th>
              </tr>
            </thead>
            <tbody>
              ${intr.dedicatedInterrupts.map(row => `
                <tr>
                  <td><code>${row.typeNumber}</code></td>
                  <td><code>${row.vectorAddr}</code></td>
                  <td>
                    <strong>${row.name}</strong><br>
                    <span style="font-size: 10px; color: #64748b;">${row.category}</span>
                  </td>
                  <td style="font-size: 11.5px; line-height: 1.4;">${row.trigger} ${row.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Interrupt Execution Lifecycle -->
      <div class="theory-card" style="margin-top: 16px;">
        <h4 class="theory-card-title">🔄 Bir Kesme Geldiğinde Donanımın Yürüttüğü Adımlar (Lifecycle)</h4>
        <p class="theory-card-desc">Donanımsal (INTR/NMI) veya yazılımsal (INT n) kesme sinyali alındığında işlemcinin otomatik olarak sırasıyla gerçekleştirdiği 5 adım:</p>

        <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 12px;">
          ${intr.executionSteps.map(step => `
            <div class="theory-card" style="background: #f8fafc; border: 1px solid #e2e8f0;">
              <span class="theory-card-badge" style="background: #dc2626; color: #fff;">Adım ${step.step}</span>
              <h5 style="margin: 6px 0; font-size: 12px; font-weight: 800; color: #0f172a;">${step.title}</h5>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #4338ca; margin-bottom: 4px;"><code>${step.action}</code></div>
              <p style="font-size: 11px; color: #475569; margin: 0; line-height: 1.4;">${step.hardwareDetails}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachCopyButtons(container);
  }

  /**
   * Render TAB 2 Subtab 6: Advanced Architecture (Pipelining, Hazards, CISC/RISC, 8085)
   */
  private renderAdvancedArch(): void {
    const container = this.container.querySelector('#docs-pipelining-container') as HTMLElement;
    if (!container) return;

    const arch = ADVANCED_ARCH_GUIDE;

    container.innerHTML = `
      <div class="theory-header">
        <h3 class="theory-title">🚀 ${arch.title}</h3>
        <p class="theory-subtitle">${arch.subtitle} — <strong>📍 Müfredat: ${arch.syllabusRef}</strong></p>
      </div>

      <!-- Pipelining Stages Card -->
      <div class="theory-card" style="border-left: 4px solid #3b82f6;">
        <h4 class="theory-card-title">🏭 Komut Boru Hattı (Instruction Pipelining) ve Aşamaları</h4>
        <p class="theory-card-desc">${arch.pipelining.description}</p>

        <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top: 12px;">
          ${arch.pipelining.stages.map(st => `
            <div class="theory-card" style="background: #f8fafc; border: 1px solid #e2e8f0;">
              <span class="theory-card-badge" style="background: #2563eb; color: #fff;">${st.stage}</span>
              <h5 style="margin: 6px 0; font-size: 12.5px; font-weight: 700; color: #0f172a;">${st.name}</h5>
              <p style="font-size: 11px; color: #475569; margin: 0; line-height: 1.4;">${st.description}</p>
            </div>
          `).join('')}
        </div>

        <div class="docs-var-note" style="margin-top: 12px; font-size: 11.5px;">
          ⚡ <strong>Hızlanma Formülü:</strong> ${arch.pipelining.speedupFormula}
        </div>
      </div>

      <!-- Pipeline Hazards (Tehlikeler) -->
      <div class="theory-header" style="margin-top: 20px;">
        <h4 class="theory-title" style="font-size: 14px;">2. Boru Hattı Tıkanmaları ve Tehlikeleri (Pipeline Hazards)</h4>
      </div>
      <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        ${arch.hazards.map(haz => `
          <div class="theory-card" style="border-top: 3px solid #f59e0b;">
            <div class="theory-card-header">
              <span class="theory-card-badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">TEHLİKE</span>
              <h4 class="theory-card-title">${haz.title}</h4>
            </div>
            <span style="font-size: 10px; font-weight: 700; color: #d97706;">${haz.type}</span>
            <div style="margin-top: 8px; font-size: 11.5px;">
              <strong style="color: #991b1b;">Neden Oluşur?</strong>
              <p style="margin: 3px 0 8px; color: #334155; line-height: 1.45;">${haz.cause}</p>
              <strong style="color: #166534;">Donanımsal Çözüm:</strong>
              <p style="margin: 3px 0 0; color: #166534; line-height: 1.45;">${haz.solution}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- CISC vs RISC Comparison Table -->
      <div class="theory-card" style="margin-top: 20px;">
        <h4 class="theory-card-title">⚖️ CISC (Intel x86) vs RISC (ARM / MIPS) Karşılaştırma Matrisi</h4>
        <div class="table-responsive" style="margin-top: 10px;">
          <table class="theory-table">
            <thead>
              <tr>
                <th style="width: 20%;">Karşılaştırma Kriteri</th>
                <th style="width: 40%; background: rgba(59, 130, 246, 0.08);">CISC (Intel 8086 / x86 / AMD64)</th>
                <th style="width: 40%; background: rgba(16, 185, 129, 0.08);">RISC (ARM / MIPS / RISC-V)</th>
              </tr>
            </thead>
            <tbody>
              ${arch.ciscVsRisc.map(row => `
                <tr>
                  <td><strong>${row.feature}</strong></td>
                  <td style="font-size: 11.5px;">${row.cisc}</td>
                  <td style="font-size: 11.5px;">${row.risc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Intel 8085 Overview -->
      <div class="theory-card" style="margin-top: 20px; border-left: 4px solid #6366f1;">
        <h4 class="theory-card-title">🏛️ ${arch.intel8085Overview.title}</h4>
        <p class="theory-card-desc">${arch.intel8085Overview.description}</p>

        <div class="theory-grid-2col" style="margin-top: 10px;">
          <div>
            <strong style="font-size: 11.5px; color: #1e293b;">Yazmaç Yapısı:</strong>
            <ul style="margin: 4px 0 10px 18px; padding: 0; font-size: 11px; color: #334155; line-height: 1.5;">
              ${arch.intel8085Overview.registers.map(r => `<li>${r}</li>`).join('')}
            </ul>
            <strong style="font-size: 11.5px; color: #1e293b;">16-bit Yazmaç Çiftleri (Pairs):</strong>
            <ul style="margin: 4px 0 0 18px; padding: 0; font-size: 11px; color: #334155; line-height: 1.5;">
              ${arch.intel8085Overview.registerPairs.map(rp => `<li>${rp}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong style="font-size: 11.5px; color: #4338ca;">8085'ten 8086'ya Yazmaç Eşleşmeleri:</strong>
            <div class="table-responsive" style="margin-top: 4px;">
              <table class="theory-table" style="font-size: 11px;">
                <thead>
                  <tr>
                    <th>8085 Yazmacı</th>
                    <th>8086 Eşdeğeri</th>
                    <th>Not</th>
                  </tr>
                </thead>
                <tbody>
                  ${arch.intel8085Overview.mappingTo8086.map(m => `
                    <tr>
                      <td><code>${m.reg8085}</code></td>
                      <td><code>${m.reg8086}</code></td>
                      <td style="font-size: 10.5px;">${m.note}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachCopyButtons(container);
  }

}

