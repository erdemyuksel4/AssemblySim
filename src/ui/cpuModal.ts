import { CpuInstanceManager } from '../cpu/instanceManager.js';
import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceDocument } from '../workspace/types.js';

export interface CpuModalCallbacks {
  onCpuChanged?: () => void;
  onDocumentCpuRemapped?: (doc: WorkspaceDocument) => void;
}

export class CpuModal {
  private overlay: HTMLElement;
  private cpuManager: CpuInstanceManager;
  private workspace: WorkspaceManager;
  private callbacks: CpuModalCallbacks;
  private isOpen: boolean = false;

  constructor(
    cpuManager: CpuInstanceManager,
    workspace: WorkspaceManager,
    callbacks: CpuModalCallbacks = {}
  ) {
    this.cpuManager = cpuManager;
    this.workspace = workspace;
    this.callbacks = callbacks;

    this.overlay = document.createElement('div');
    this.overlay.id = 'cpu-modal-overlay';
    this.overlay.className = 'cpu-modal-overlay hidden';
    document.body.appendChild(this.overlay);

    this.bindGlobalKeyboard();
  }

  open(): void {
    this.isOpen = true;
    this.overlay.classList.remove('hidden');
    this.render();
  }

  close(): void {
    this.isOpen = false;
    this.overlay.classList.add('hidden');
  }

  private render(): void {
    const instances = this.cpuManager.getAllInstances();
    const activeDoc = this.workspace.getActiveDocument();
    const allDocs = this.workspace.getAllDocuments();

    this.overlay.innerHTML = `
      <div class="cpu-modal-card">
        <div class="cpu-modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">⚙️</span>
            <div>
              <h2 class="modal-title">8086 İşlemci (CPU) Örnek Yöneticisi</h2>
              <p class="modal-subtitle">Çoklu İşlemci Havuzu ve İzolasyon Yönetimi (${instances.length} Aktif CPU)</p>
            </div>
          </div>
          <button class="btn-modal-close" title="Kapat (ESC)">×</button>
        </div>

        <div class="cpu-modal-body">
          <div class="cpu-modal-alert">
            <strong>ℹ️ İzolasyon İlkesi:</strong> Varsayılan olarak açtığınız her dosya, yol haritası görevi ve örnek, kendi bağımsız 8086 CPU örneğinde çalışır. Bu sayede bir görevdeki yazmaçlar, bayraklar veya bellek diğer dosyalarınızla karışmaz. Aşağıdan sınırsız sayıda yeni CPU açabilir, istediğiniz dosyayı istediğiniz CPU'ya bağlayabilirsiniz.
          </div>

          <!-- Document CPU Remapping Section -->
          ${activeDoc ? `
            <div class="cpu-modal-section doc-mapping-section">
              <h4 class="section-title">📄 Aktif Belge CPU Ataması</h4>
              <div class="doc-mapping-row">
                <span class="doc-name"><strong>${this.escapeHtml(activeDoc.title)}</strong> için CPU:</span>
                <select id="select-active-doc-cpu" class="modal-select">
                  ${instances.map(inst => `
                    <option value="${inst.id}" ${inst.id === activeDoc.cpuInstanceId ? 'selected' : ''}>
                      ${this.escapeHtml(inst.name)} (${inst.id})
                    </option>
                  `).join('')}
                </select>
                <button id="btn-apply-doc-cpu" class="btn-primary-small">Ata & Bağla</button>
              </div>
            </div>
          ` : ''}

          <!-- New CPU Creation Form -->
          <div class="cpu-modal-section">
            <h4 class="section-title">＋ Yeni İşlemci Örneği Oluştur</h4>
            <div class="new-cpu-form">
              <input 
                type="text" 
                id="input-new-cpu-name" 
                class="modal-input" 
                placeholder="Örn: CPU 2, Test İşlemcisi, Aritmetik Modülü..." 
                maxlength="30"
              />
              <button id="btn-create-cpu" class="btn-primary-small">CPU Oluştur</button>
            </div>
          </div>

          <!-- CPU Instances Table / Cards -->
          <div class="cpu-modal-section">
            <h4 class="section-title">Mevcut İşlemciler (${instances.length})</h4>
            <div class="cpu-cards-grid">
              ${instances.map(inst => {
                const assignedDocs = allDocs.filter(d => d.cpuInstanceId === inst.id);
                const isDefault = inst.id === 'cpu-default';
                const cpu = inst.cpu;
                const regs = cpu.regs;
                const statusText = cpu.halted ? 'Durduruldu (HLT)' : (cpu.lastError ? 'Hata' : 'Hazır / Boşta');
                const statusClass = cpu.halted ? 'status-halted' : (cpu.lastError ? 'status-error' : 'status-ready');

                return `
                  <div class="cpu-card" style="border-top: 3px solid ${inst.color};">
                    <div class="cpu-card-header">
                      <div class="cpu-name-group">
                        <span class="cpu-color-pill" style="background-color: ${inst.color};"></span>
                        <strong class="cpu-name">${this.escapeHtml(inst.name)}</strong>
                        ${isDefault ? '<span class="badge-default">Varsayılan</span>' : ''}
                      </div>
                      <span class="cpu-status-badge ${statusClass}">${statusText}</span>
                    </div>

                    <div class="cpu-card-regs">
                      <div class="reg-chip">AX: <span>${this.toHex4(regs.ax)}</span></div>
                      <div class="reg-chip">BX: <span>${this.toHex4(regs.bx)}</span></div>
                      <div class="reg-chip">CX: <span>${this.toHex4(regs.cx)}</span></div>
                      <div class="reg-chip">DX: <span>${this.toHex4(regs.dx)}</span></div>
                      <div class="reg-chip">IP: <span>${this.toHex4(regs.ip)}</span></div>
                      <div class="reg-chip">SP: <span>${this.toHex4(regs.sp)}</span></div>
                    </div>

                    <div class="cpu-card-docs">
                      <span class="docs-label">Bağlı Belgeler:</span>
                      ${assignedDocs.length > 0 
                        ? assignedDocs.map(d => `<span class="doc-tag">${this.escapeHtml(d.title)}</span>`).join('') 
                        : '<span class="doc-tag-empty">(Bağlı belge yok)</span>'}
                    </div>

                    <div class="cpu-card-actions">
                      <button class="btn-action btn-cpu-reset" data-cpu-id="${inst.id}" title="Yazmaçları ve belleği sıfırla">
                        🔄 Sıfırla
                      </button>
                      <button class="btn-action btn-cpu-rename" data-cpu-id="${inst.id}" title="İsmini değiştir">
                        ✏️ Yeniden Adlandır
                      </button>
                      ${!isDefault ? `
                        <button class="btn-action btn-cpu-delete danger" data-cpu-id="${inst.id}" title="Bu işlemciyi kaldır">
                          🗑️ Sil
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="cpu-modal-footer">
          <button class="btn-secondary btn-modal-done">Tamam</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Close button & done button
    this.overlay.querySelector('.btn-modal-close')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('.btn-modal-done')?.addEventListener('click', () => this.close());

    // Backdrop click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Create CPU
    const createBtn = this.overlay.querySelector<HTMLButtonElement>('#btn-create-cpu');
    const nameInput = this.overlay.querySelector<HTMLInputElement>('#input-new-cpu-name');
    const handleCreate = () => {
      const name = nameInput?.value.trim();
      if (!name) return;
      this.cpuManager.createInstance(name);
      if (nameInput) nameInput.value = '';
      this.render();
      this.callbacks.onCpuChanged?.();
    };
    createBtn?.addEventListener('click', handleCreate);
    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCreate();
    });

    // Remap active doc CPU
    const applyBtn = this.overlay.querySelector<HTMLButtonElement>('#btn-apply-doc-cpu');
    const selectEl = this.overlay.querySelector<HTMLSelectElement>('#select-active-doc-cpu');
    applyBtn?.addEventListener('click', () => {
      const activeDoc = this.workspace.getActiveDocument();
      if (!activeDoc || !selectEl) return;
      const targetCpuId = selectEl.value;
      const updated = this.workspace.setDocumentCpu(activeDoc.id, targetCpuId);
      if (updated) {
        this.render();
        this.callbacks.onDocumentCpuRemapped?.(updated);
      }
    });

    // Reset CPU buttons
    this.overlay.querySelectorAll<HTMLButtonElement>('.btn-cpu-reset').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.cpuId;
        if (!id) return;
        this.cpuManager.resetInstance(id);
        this.render();
        this.callbacks.onCpuChanged?.();
      });
    });

    // Rename CPU buttons
    this.overlay.querySelectorAll<HTMLButtonElement>('.btn-cpu-rename').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.cpuId;
        if (!id) return;
        const current = this.cpuManager.getInstance(id);
        const newName = prompt('Yeni CPU İsmi:', current?.name);
        if (newName && newName.trim()) {
          this.cpuManager.renameInstance(id, newName.trim());
          this.render();
          this.callbacks.onCpuChanged?.();
        }
      });
    });

    // Delete CPU buttons
    this.overlay.querySelectorAll<HTMLButtonElement>('.btn-cpu-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.cpuId;
        if (!id) return;
        
        // Reassign any documents connected to this CPU to default
        const defaultCpu = this.cpuManager.getDefaultInstance();
        for (const doc of this.workspace.getAllDocuments()) {
          if (doc.cpuInstanceId === id) {
            this.workspace.setDocumentCpu(doc.id, defaultCpu.id);
          }
        }

        this.cpuManager.removeInstance(id);
        this.render();
        this.callbacks.onCpuChanged?.();
      });
    });
  }

  private bindGlobalKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  private toHex4(val: number): string {
    return (val & 0xFFFF).toString(16).toUpperCase().padStart(4, '0') + 'h';
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
