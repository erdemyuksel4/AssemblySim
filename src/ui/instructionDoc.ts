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
  LECTURE_TERMINOLOGY
} from './instructionData.js';

export type ManualTab = 'instructions' | 'addressing' | 'architecture' | 'flags' | 'glossary';

export class InstructionDoc {
  private container: HTMLElement;
  private isOpen: boolean = false;
  private activeTab: ManualTab = 'instructions';
  private activeCategory: string = 'all';
  private searchQuery: string = '';
  private selectedOpcode: string = 'MOV';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <section class="docs-section">
        <!-- Collapsible Toggle Header (Default: Closed) -->
        <div class="docs-toggle-bar" id="docs-toggle-bar" title="8086 Komut Rehberini Aç / Kapat">
          <div class="docs-toggle-left">
            <span class="docs-book-icon">📖</span>
            <div class="docs-title-wrap">
              <span class="docs-main-title">8086 Komut Seti ve Referans Rehberi (Instruction Set Manual)</span>
              <span class="docs-subtitle">Slaytlarla tam uyumlu komutlar, 7 adresleme modu, segment:ofset hesabı ve bayraklar</span>
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
          <!-- Main Subject Tabs (BMI3121 Course Modules) -->
          <div class="docs-main-tabs" id="docs-main-tabs">
            <button class="docs-main-tab active" data-tab="instructions">
              📖 Komut Seti Referansı
            </button>
            <button class="docs-main-tab" data-tab="addressing">
              🎯 7 Veri Adresleme Modu (Week 3)
            </button>
            <button class="docs-main-tab" data-tab="architecture">
              📐 Mimari & Segment:Offset Hesabı (Week 1–2)
            </button>
            <button class="docs-main-tab" data-tab="flags">
              🏳️ FLAGS Kaydı & Atlama Matrisi (Week 2 & 5)
            </button>
            <button class="docs-main-tab" data-tab="glossary">
              📚 Ders Terminolojisi & Kavramlar (Weeks 1–5)
            </button>
          </div>

          <!-- TAB 1: Instructions Master-Detail View -->
          <div class="docs-tab-pane active" id="pane-instructions">
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

          <!-- TAB 2: Addressing Modes View -->
          <div class="docs-tab-pane" id="pane-addressing">
            <div class="docs-theory-container" id="docs-addressing-container"></div>
          </div>

          <!-- TAB 3: Architecture & Physical Address Calculation View -->
          <div class="docs-tab-pane" id="pane-architecture">
            <div class="docs-theory-container" id="docs-architecture-container"></div>
          </div>

          <!-- TAB 4: FLAGS Register & Jump Decision Matrix View -->
          <div class="docs-tab-pane" id="pane-flags">
            <div class="docs-theory-container" id="docs-flags-container"></div>
          </div>

          <!-- TAB 5: Lecture Terminology & Concepts -->
          <div class="docs-tab-pane" id="pane-glossary">
            <div class="docs-theory-container" id="docs-glossary-container"></div>
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
    this.renderGlossary();
  }

  private attachEvents(): void {
    const toggleBar = this.container.querySelector('#docs-toggle-bar') as HTMLElement;
    const searchInput = this.container.querySelector('#docs-search-input') as HTMLInputElement;
    const clearBtn = this.container.querySelector('#docs-search-clear') as HTMLButtonElement;
    const catWrap = this.container.querySelector('#docs-categories-wrap') as HTMLElement;
    const tabsWrap = this.container.querySelector('#docs-main-tabs') as HTMLElement;

    // Toggle expand/collapse
    toggleBar.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.updateOpenState();
    });

    // Main Tabs Switcher
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

}
