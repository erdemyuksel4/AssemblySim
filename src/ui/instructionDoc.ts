import { INSTRUCTIONS, CATEGORIES, InstructionDetail } from './instructionData.js';

export class InstructionDoc {
  private container: HTMLElement;
  private isOpen: boolean = false;
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
              <span class="docs-subtitle">Simülatörün desteklediği tüm komutlar, varyasyonlar, sözdizimleri ve örnekler</span>
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
          <!-- Filter & Search Toolbar -->
          <div class="docs-toolbar">
            <div class="docs-search-wrap">
              <span class="docs-search-icon">🔍</span>
              <input type="text" id="docs-search-input" class="docs-search-input" placeholder="Komut veya açıklama ara... (örn: MOV, JMP, ADD, BCD, DUP)" />
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
      </section>
    `;

    this.attachEvents();
    this.renderList();
    this.renderDetail();
  }

  private attachEvents(): void {
    const toggleBar = this.container.querySelector('#docs-toggle-bar') as HTMLElement;
    const searchInput = this.container.querySelector('#docs-search-input') as HTMLInputElement;
    const clearBtn = this.container.querySelector('#docs-search-clear') as HTMLButtonElement;
    const catWrap = this.container.querySelector('#docs-categories-wrap') as HTMLElement;

    // Toggle expand/collapse
    toggleBar.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.updateOpenState();
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
      // Smooth scroll into view if bottom was off-screen
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
      // Category filter
      if (this.activeCategory !== 'all' && inst.category !== this.activeCategory) {
        return false;
      }
      // Search filter
      if (this.searchQuery) {
        const inOpcode = inst.opcode.toLowerCase().includes(this.searchQuery);
        const inName = inst.name.toLowerCase().includes(this.searchQuery);
        const inSummary = inst.summary.toLowerCase().includes(this.searchQuery);
        const inVariations = inst.variations.some(v => 
          v.syntax.toLowerCase().includes(this.searchQuery) ||
          v.description.toLowerCase().includes(this.searchQuery) ||
          v.example.toLowerCase().includes(this.searchQuery)
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

    // Ensure selectedOpcode is valid, or select first item
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

    // Attach click events on list items
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
            <div class="docs-rules-text"><strong>8086 Donanım Kuralı:</strong> ${inst.rules}</div>
          </div>
        ` : ''}

        <!-- Variations Section -->
        <div class="docs-variations-section">
          <h4 class="docs-variations-title">Kullanım Varyasyonları (${inst.variations.length})</h4>
          <div class="docs-variations-grid">
            ${inst.variations.map((v, idx) => `
              <div class="docs-var-card">
                <div class="docs-var-header">
                  <span class="docs-var-syntax">${this.escapeHtml(v.syntax)}</span>
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

    // Attach copy code buttons
    detailPanel.querySelectorAll<HTMLButtonElement>('.btn-copy-code').forEach(btn => {
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
}
