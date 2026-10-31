import {
  INSTRUCTIONS,
  CATEGORIES,
  InstructionDetail,
  ADDRESSING_MODES,
  PROGRAM_ADDRESSING_MODES,
  STACK_ADDRESSING_GUIDE,
  COMMON_PITFALLS_GUIDE,
  ARCHITECTURE_GUIDE,
  FLAGS_GUIDE
} from './instructionData.js';

export type ManualSection = 'instructions' | 'addressing' | 'architecture' | 'flags';

export interface InstructionDocCallbacks {
  onReturnToEditor: () => void;
  onInsertCodeToEditor?: (title: string, code: string) => void;
}

export class InstructionDoc {
  private container: HTMLElement;
  private callbacks: InstructionDocCallbacks;
  private activeSection: ManualSection = 'instructions';
  private activeCategory: string = 'all';
  private searchQuery: string = '';
  private selectedOpcode: string = 'MOV';

  constructor(container: HTMLElement, callbacks: InstructionDocCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }

  public openInstruction(opcode: string): void {
    this.selectedOpcode = opcode.toUpperCase();
    this.activeSection = 'instructions';
    this.searchQuery = '';
    this.render();
  }

  render(): void {
    this.container.innerHTML = `
      <div class="reference-doc-container">
        <!-- Top Navigation Bar -->
        <div class="reference-doc-topbar" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #ffffff; border-bottom: 1px solid var(--border-color);">
          <div class="reference-doc-breadcrumb" style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;">
            <button class="btn-back-editor" id="btn-back-editor" style="display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.15s ease;">
              <span>←</span> Editöre Dön
            </button>
            <span class="bc-sep" style="color: #94a3b8;">/</span>
            <span class="bc-item highlight" id="ref-bc-active" style="color: #0f172a;">📖 8086 Komut Manueli</span>
          </div>

          <div class="manual-section-nav" style="display: flex; gap: 6px;">
            <button class="btn-sec-nav-pill ${this.activeSection === 'instructions' ? 'active' : ''}" data-section="instructions">📖 Komut Seti (${INSTRUCTIONS.length})</button>
            <button class="btn-sec-nav-pill ${this.activeSection === 'addressing' ? 'active' : ''}" data-section="addressing">🎯 7 Adresleme Modu</button>
            <button class="btn-sec-nav-pill ${this.activeSection === 'architecture' ? 'active' : ''}" data-section="architecture">📐 8086 Mimarisi</button>
            <button class="btn-sec-nav-pill ${this.activeSection === 'flags' ? 'active' : ''}" data-section="flags">🏳️ FLAGS & Atlama</button>
          </div>
        </div>

        <!-- Section 1: Instructions Master-Detail -->
        <div class="manual-section-content" id="section-instructions" style="${this.activeSection === 'instructions' ? 'display: block;' : 'display: none;'}">
          <!-- Search & Category Filter Toolbar -->
          <div class="docs-toolbar" style="padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px;">
            <div class="docs-search-wrap" style="position: relative; max-width: 600px;">
              <span class="docs-search-icon" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.6;">🔍</span>
              <input type="text" id="manual-search-input" class="docs-search-input" placeholder="Komut veya açıklama ara... (örn: MOV, ADD, CMP, LOOP, PUSH, INT, DUP)" style="width: 100%; padding: 8px 36px 8px 34px; border: 1px solid var(--border-dark); border-radius: 6px; font-size: 13px;" />
              <button id="manual-search-clear" class="docs-search-clear" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 14px; cursor: pointer; display: none;" title="Temizle">✕</button>
            </div>
            <div class="docs-categories-wrap" id="manual-categories-wrap" style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${CATEGORIES.map(cat => `
                <button class="docs-cat-btn ${cat.id === this.activeCategory ? 'active' : ''}" data-cat="${cat.id}">
                  ${cat.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Master-Detail Grid -->
          <div class="docs-master-detail">
            <!-- Left List Panel -->
            <div class="docs-list-panel" id="manual-list-panel"></div>

            <!-- Right Detail Panel -->
            <div class="docs-detail-panel" id="manual-detail-panel"></div>
          </div>
        </div>

        <!-- Section 2: Addressing Modes -->
        <div class="manual-section-content" id="section-addressing" style="${this.activeSection === 'addressing' ? 'display: block;' : 'display: none;'} padding: 24px; max-width: 1200px; margin: 0 auto;">
          <div id="manual-addressing-container"></div>
        </div>

        <!-- Section 3: Architecture -->
        <div class="manual-section-content" id="section-architecture" style="${this.activeSection === 'architecture' ? 'display: block;' : 'display: none;'} padding: 24px; max-width: 1200px; margin: 0 auto;">
          <div id="manual-architecture-container"></div>
        </div>

        <!-- Section 4: Flags & Jump Matrix -->
        <div class="manual-section-content" id="section-flags" style="${this.activeSection === 'flags' ? 'display: block;' : 'display: none;'} padding: 24px; max-width: 1200px; margin: 0 auto;">
          <div id="manual-flags-container"></div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderList();
    this.renderDetail();
    this.renderAddressingModes();
    this.renderArchitecture();
    this.renderFlags();
  }

  private bindEvents(): void {
    // Return to Editor
    const backBtn = this.container.querySelector('#btn-back-editor');
    backBtn?.addEventListener('click', () => {
      this.callbacks.onReturnToEditor();
    });

    // Section Pill Navigation
    const sectionBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-sec-nav-pill');
    sectionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.getAttribute('data-section') as ManualSection;
        if (sec) {
          this.activeSection = sec;
          sectionBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const allSecs = this.container.querySelectorAll<HTMLElement>('.manual-section-content');
          allSecs.forEach(s => s.style.display = 'none');
          const target = this.container.querySelector<HTMLElement>(`#section-${sec}`);
          if (target) target.style.display = 'block';

          const bc = this.container.querySelector('#ref-bc-active');
          if (bc) {
            bc.textContent = sec === 'instructions' ? '📖 8086 Komut Manueli' :
                             sec === 'addressing' ? '🎯 7 Adresleme Modu' :
                             sec === 'architecture' ? '📐 8086 Mimarisi' : '🏳️ FLAGS & Atlama';
          }
        }
      });
    });

    // Category Filter Selection
    const catWrap = this.container.querySelector('#manual-categories-wrap');
    catWrap?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.docs-cat-btn') as HTMLButtonElement;
      if (!btn) return;
      this.container.querySelectorAll('.docs-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.activeCategory = btn.getAttribute('data-cat') || 'all';
      this.renderList();
    });

    // Search Input
    const searchInput = this.container.querySelector('#manual-search-input') as HTMLInputElement;
    const clearBtn = this.container.querySelector('#manual-search-clear') as HTMLButtonElement;
    if (searchInput && clearBtn) {
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
    const listPanel = this.container.querySelector('#manual-list-panel') as HTMLElement;
    if (!listPanel) return;

    const items = this.getFilteredInstructions();

    if (items.length === 0) {
      listPanel.innerHTML = `
        <div class="docs-empty-list" style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
          <span style="font-size: 28px;">🔍</span>
          <p style="margin-top: 8px;">Eşleşen komut bulunamadı.</p>
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
    const detailPanel = this.container.querySelector('#manual-detail-panel') as HTMLElement;
    if (!detailPanel) return;

    const inst = INSTRUCTIONS.find(i => i.opcode === this.selectedOpcode);
    if (!inst) {
      detailPanel.innerHTML = `<div class="docs-no-selection" style="padding: 40px; text-align: center; color: var(--text-muted);">Lütfen soldaki listeden bir komut seçin.</div>`;
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
            <div class="docs-rules-text"><strong>8086 Donanım Kuralı & Not:</strong><br/>${this.escapeHtml(inst.rules).replace(/\n/g, '<br/>')}</div>
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
                    ${v.addressingMode ? `<span class="docs-addressing-mode-badge" title="Adresleme Modu">🎯 ${this.escapeHtml(v.addressingMode)}</span>` : ''}
                  </div>
                  <span class="docs-var-badge">Varyasyon #${idx + 1}</span>
                </div>
                <p class="docs-var-desc">${v.description}</p>
                <div class="docs-example-box">
                  <div class="docs-example-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Örnek Kullanım:</span>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-copy-code" data-code="${this.escapeHtml(v.example)}" title="Kodu Kopyala" style="font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-dark); background: #ffffff; cursor: pointer;">📋 Kopyala</button>
                      ${this.callbacks.onInsertCodeToEditor ? `
                        <button class="btn-use-in-editor" data-opcode="${inst.opcode}" data-code="${this.escapeHtml(v.example)}" title="Editöre Gönder ve Çalıştır" style="font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid #93c5fd; background: #eff6ff; color: #1d4ed8; font-weight: 600; cursor: pointer;">📝 Editöre Aktar</button>
                      ` : ''}
                    </div>
                  </div>
                  <pre class="docs-example-code"><code>${this.escapeHtml(v.example)}</code></pre>
                </div>
                ${v.note ? `<div class="docs-var-note">💡 <em>${this.escapeHtml(v.note)}</em></div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Copy button events
    detailPanel.querySelectorAll<HTMLButtonElement>('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = btn.getAttribute('data-code');
        if (code) {
          navigator.clipboard.writeText(code);
          const orig = btn.textContent;
          btn.textContent = '✓ Kopyalandı!';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        }
      });
    });

    // Use in editor button events
    detailPanel.querySelectorAll<HTMLButtonElement>('.btn-use-in-editor').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const opcode = btn.getAttribute('data-opcode') || 'example';
        const code = btn.getAttribute('data-code');
        if (code && this.callbacks.onInsertCodeToEditor) {
          const formattedCode = `ORG 100H\n\n; Örnek: ${opcode} Komutu Kullanımı\n${code}\n\nHLT\n`;
          this.callbacks.onInsertCodeToEditor(`${opcode.toLowerCase()}_example.asm`, formattedCode);
        }
      });
    });
  }

  private renderAddressingModes(): void {
    const container = this.container.querySelector('#manual-addressing-container');
    if (!container) return;

    container.innerHTML = `
      <div class="theory-article">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">🎯 8086 Mikroişlemcisinde 7 Temel Veri Adresleme Modu</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          8086 mimarisinde bir komutun kaynak veya hedef veriye nasıl ulaşacağını belirleyen 7 standart mod:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
          ${ADDRESSING_MODES.map((m, idx) => `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 15px; color: #1e293b;">${idx + 1}. ${this.escapeHtml(m.modeName)}</span>
                <span style="font-size: 11px; background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${this.escapeHtml(m.category)}</span>
              </div>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">${this.escapeHtml(m.summary)}</p>
              ${m.formula ? `<div style="font-family: monospace; font-size: 12px; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px;"><strong>Formül:</strong> ${this.escapeHtml(m.formula)}</div>` : ''}
              <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 4px;"><strong>İzin Verilen Yazmaçlar:</strong> ${this.escapeHtml(m.registersAllowed)}</div>
              <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 8px;"><strong>Varsayılan Segment:</strong> ${this.escapeHtml(m.defaultSegment)}</div>
              <div style="background: #1e293b; color: #f8fafc; font-family: monospace; font-size: 12px; padding: 8px 10px; border-radius: 4px; margin-bottom: 6px;">${this.escapeHtml(m.example)}</div>
              <small style="color: var(--text-muted); font-size: 11px;">💡 ${this.escapeHtml(m.notes)}</small>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderArchitecture(): void {
    const container = this.container.querySelector('#manual-architecture-container');
    if (!container) return;

    container.innerHTML = `
      <div class="theory-article">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">📐 ${this.escapeHtml(ARCHITECTURE_GUIDE.title)}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px;">
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
            <h4 style="font-weight: 700; color: #2563eb; margin-bottom: 8px;">🚌 Veri Yolu Mimarisi</h4>
            <ul style="font-size: 13px; list-style: disc; padding-left: 20px; line-height: 1.6;">
              <li><strong>Adres Yolu (Address Bus):</strong> ${ARCHITECTURE_GUIDE.busSystem.addressBus}</li>
              <li><strong>Veri Yolu (Data Bus):</strong> ${ARCHITECTURE_GUIDE.busSystem.dataBus}</li>
              <li><strong>Kontrol Yolu (Control Bus):</strong> ${ARCHITECTURE_GUIDE.busSystem.controlBus}</li>
            </ul>
          </div>

          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
            <h4 style="font-weight: 700; color: #16a34a; margin-bottom: 8px;">🧠 20-Bit Fiziksel Adresleme</h4>
            <p style="font-size: 13px; line-height: 1.6;">
              8086, 16-bit işlemci olmasına karşın 1 MB RAM'e ulaşabilmek için <strong>Segment:Offset</strong> mimarisini kullanır:
            </p>
            <div style="background: #f8fafc; border: 1px solid var(--border-dark); padding: 8px 12px; font-family: monospace; font-size: 13px; border-radius: 4px; margin-top: 8px; font-weight: 700;">
              Fiziksel Adres = (Segment × 16) + Offset<br/>
              Örn: CS:IP = 1000h:0100h → (1000h × 10h) + 0100h = 10100h
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderFlags(): void {
    const container = this.container.querySelector('#manual-flags-container');
    if (!container) return;

    container.innerHTML = `
      <div class="theory-article">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">🏳️ ${this.escapeHtml(FLAGS_GUIDE.title)}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">
          8086 Bayrak Yazmacı (FLAGS Register) 16-bit genişliğindedir ve 9 aktif bayrak biti içerir (6 Durum Bayrağı, 3 Kontrol Bayrağı):
        </p>

        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 16px 0 8px 0;">📊 Durum Bayrakları (Status Flags - Aritmetik/Mantık Sonuçları)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 20px;">
          ${FLAGS_GUIDE.statusFlags.map(f => `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 15px; color: #1e293b;">${this.escapeHtml(f.flag)}</strong>
                <span style="font-size: 11px; font-weight: 600; background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 4px;">Bit ${f.bit}</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">${this.escapeHtml(f.desc)}</p>
            </div>
          `).join('')}
        </div>

        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 16px 0 8px 0;">⚙️ Kontrol Bayrakları (Control Flags - İşlemci Davranışı)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 20px;">
          ${FLAGS_GUIDE.controlFlags.map(f => `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 15px; color: #1e293b;">${this.escapeHtml(f.flag)}</strong>
                <span style="font-size: 11px; font-weight: 600; background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px;">Bit ${f.bit}</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">${this.escapeHtml(f.desc)}</p>
            </div>
          `).join('')}
        </div>

        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 16px 0 8px 0;">💡 8086 Bayrak Altın Kuralları</h3>
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 14px;">
          <ul style="font-size: 13px; list-style: disc; padding-left: 20px; line-height: 1.6; color: #92400e;">
            ${FLAGS_GUIDE.goldenRules.map(rule => `<li>${this.escapeHtml(rule)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  private getCategoryLabel(catId: string): string {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.label : catId;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
