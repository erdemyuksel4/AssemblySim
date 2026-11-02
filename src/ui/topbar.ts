import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceProject, ProjectSummary } from '../workspace/types.js';

export interface TopBarCallbacks {
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onExportProject?: () => void;
  onImportProject?: (content: string) => void;
  onRenameProject?: (newName: string) => void;
  onOpenManual?: () => void;
  onOpenGraph?: () => void;
  onOpenStudy?: () => void;
  isManualOpen?: () => boolean;
  isGraphOpen?: () => boolean;
  isStudyOpen?: () => boolean;
}

export class TopBar {
  private parentEl: HTMLElement;
  private workspace: WorkspaceManager;
  private callbacks: TopBarCallbacks;
  private container!: HTMLElement;
  private isDropdownOpen: boolean = false;
  private fileInputEl!: HTMLInputElement;

  constructor(
    parentEl: HTMLElement,
    workspace: WorkspaceManager,
    callbacks: TopBarCallbacks = {}
  ) {
    this.parentEl = parentEl;
    this.workspace = workspace;
    this.callbacks = callbacks;

    this.init();
    this.bindGlobalEvents();
  }

  private init(): void {
    this.container = document.createElement('header');
    this.container.className = 'vscode-topbar';
    this.container.id = 'vscode-topbar';
    this.parentEl.appendChild(this.container);

    // Hidden input for project import
    this.fileInputEl = document.createElement('input');
    this.fileInputEl.type = 'file';
    this.fileInputEl.accept = '.json';
    this.fileInputEl.style.display = 'none';
    this.fileInputEl.addEventListener('change', (e) => this.handleFileSelected(e));
    document.body.appendChild(this.fileInputEl);

    this.render();
  }

  render(): void {
    const project = this.workspace.getProject();
    const isManualActive = this.callbacks.isManualOpen ? this.callbacks.isManualOpen() : false;
    const isGraphActive = this.callbacks.isGraphOpen ? this.callbacks.isGraphOpen() : false;
    const isStudyActive = this.callbacks.isStudyOpen ? this.callbacks.isStudyOpen() : false;

    this.container.innerHTML = `
      <!-- Sol Taraf: Logo ve VS Code Menü Barı -->
      <div class="topbar-left">
        <div class="topbar-brand" title="8086 AssemblySim Web IDE">
          <svg class="topbar-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
          </svg>
          <span class="topbar-brand-name">8086 IDE</span>
        </div>

        <nav class="topbar-menubar">
          <!-- PROJECT MENÜSÜ -->
          <div class="menubar-item ${this.isDropdownOpen ? 'active' : ''}" id="menu-project-btn">
            <button class="menubar-btn" id="btn-menu-project" title="Proje Menüsü">
              Project
            </button>

            <!-- AÇILIR MENÜ (DROPDOWN) -->
            <div class="menubar-dropdown ${this.isDropdownOpen ? 'open' : ''}" id="project-dropdown-menu">
              <button class="dropdown-item" id="menu-opt-new-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">📄</span>
                  <span class="dropdown-label">New Project...</span>
                </span>
                <span class="dropdown-shortcut">Ctrl+Alt+N</span>
              </button>

              <button class="dropdown-item" id="menu-opt-open-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">📂</span>
                  <span class="dropdown-label">Open Project...</span>
                </span>
                <span class="dropdown-shortcut">Ctrl+O</span>
              </button>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item" id="menu-opt-export-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">💾</span>
                  <span class="dropdown-label">Save / Export Project (.json)</span>
                </span>
              </button>

              <button class="dropdown-item" id="menu-opt-import-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">📥</span>
                  <span class="dropdown-label">Import Project (.json)...</span>
                </span>
              </button>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item" id="menu-opt-rename-project">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon">✏️</span>
                  <span class="dropdown-label">Rename Project...</span>
                </span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      <!-- Orta Taraf: Proje Başlığı -->
      <div class="topbar-center">
        <div class="topbar-window-title" title="Mevcut Proje: ${this.escapeHtml(project.name)}">
          <span class="topbar-title-project" id="topbar-project-name">${this.escapeHtml(project.name)}</span>
          <span class="topbar-title-separator">—</span>
          <span class="topbar-title-app">AssemblySim</span>
        </div>
      </div>

      <!-- Sağ Taraf: Hızlı Erişim ve Durum -->
      <div class="topbar-right">
        <div class="topbar-quick-links">
          <button class="topbar-quick-btn ${isStudyActive ? 'active' : ''}" id="topbar-btn-study" title="8086 Assembly Dersleri ve Zihin Haritası">
            <span>🎓</span> Dersler
          </button>
          <button class="topbar-quick-btn ${isGraphActive ? 'active' : ''}" id="topbar-btn-graph" title="8086 Sinir Ağı & Bilgi Grafı">
            <span>🧠</span> Bilgi Grafı
          </button>
          <button class="topbar-quick-btn ${isManualActive ? 'active' : ''}" id="topbar-btn-manual" title="8086 Komut Seti ve Referans Manueli">
            <span>📖</span> Manuel
          </button>
        </div>

        <div class="topbar-status-badge" title="Intel 8086 Gerçek Mod İşlemci (1 MB Bellek)">
          <span class="badge-dot"></span>
          <span class="badge-text">8086 CPU</span>
        </div>
      </div>
    `;

    this.bindDomEvents();
  }

  private bindDomEvents(): void {
    const projectBtn = this.container.querySelector('#btn-menu-project');
    const dropdownMenu = this.container.querySelector('#project-dropdown-menu');

    // Menu toggle
    projectBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Prevent clicks inside dropdown from immediately closing it
    dropdownMenu?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Menu Actions
    this.container.querySelector('#menu-opt-new-project')?.addEventListener('click', () => {
      this.closeDropdown();
      this.showNewProjectModal();
    });

    this.container.querySelector('#menu-opt-open-project')?.addEventListener('click', () => {
      this.closeDropdown();
      this.showOpenProjectModal();
    });

    this.container.querySelector('#menu-opt-export-project')?.addEventListener('click', () => {
      this.closeDropdown();
      this.exportProject();
    });

    this.container.querySelector('#menu-opt-import-project')?.addEventListener('click', () => {
      this.closeDropdown();
      this.triggerImportFile();
    });

    this.container.querySelector('#menu-opt-rename-project')?.addEventListener('click', () => {
      this.closeDropdown();
      this.showRenameProjectModal();
    });

    // Right quick buttons
    this.container.querySelector('#topbar-btn-study')?.addEventListener('click', () => {
      this.callbacks.onOpenStudy?.();
    });
    this.container.querySelector('#topbar-btn-graph')?.addEventListener('click', () => {
      this.callbacks.onOpenGraph?.();
    });
    this.container.querySelector('#topbar-btn-manual')?.addEventListener('click', () => {
      this.callbacks.onOpenManual?.();
    });
  }

  private bindGlobalEvents(): void {
    // Click outside to close dropdown
    window.addEventListener('click', () => {
      if (this.isDropdownOpen) {
        this.closeDropdown();
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Escape closes dropdown and modals
      if (e.key === 'Escape') {
        if (this.isDropdownOpen) {
          this.closeDropdown();
        }
        this.closeAllModals();
      }

      // Ctrl + Alt + N => New Project
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        this.showNewProjectModal();
      }

      // Ctrl + O => Open Project (override browser default open file)
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        this.showOpenProjectModal();
      }
    });
  }

  private toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    const menu = this.container.querySelector('#project-dropdown-menu');
    const item = this.container.querySelector('#menu-project-btn');
    if (this.isDropdownOpen) {
      menu?.classList.add('open');
      item?.classList.add('active');
    } else {
      menu?.classList.remove('open');
      item?.classList.remove('active');
    }
  }

  private closeDropdown(): void {
    this.isDropdownOpen = false;
    const menu = this.container.querySelector('#project-dropdown-menu');
    const item = this.container.querySelector('#menu-project-btn');
    menu?.classList.remove('open');
    item?.classList.remove('active');
  }

  // =========================================================================
  // MODALS: New Project, Open Project, Rename Project
  // =========================================================================

  showNewProjectModal(): void {
    this.closeAllModals();

    const count = this.workspace.getProjectsList().length + 1;
    const defaultName = `Proje ${count}`;

    const overlay = document.createElement('div');
    overlay.className = 'topbar-modal-overlay';
    overlay.id = 'topbar-modal-new-project';

    overlay.innerHTML = `
      <div class="topbar-modal-card">
        <div class="topbar-modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">📄</span>
            <div>
              <h3 class="modal-title">Yeni Proje Oluştur (New Project)</h3>
              <p class="modal-subtitle">Yeni bir 8086 Assembly çalışma alanı başlatın</p>
            </div>
          </div>
          <button class="btn-modal-close" id="btn-close-new-modal">&times;</button>
        </div>

        <div class="topbar-modal-body">
          <div class="topbar-form-group">
            <label class="topbar-form-label" for="new-project-name-input">Proje Adı:</label>
            <input type="text" id="new-project-name-input" class="topbar-form-input" value="${defaultName}" placeholder="Örn: Hesap Makinesi" autocomplete="off" />
          </div>
          <p class="topbar-form-hint">
            💡 Yeni bir proje oluşturulduğunda mevcut projeniz otomatik kaydedilir ve temiz bir <code>main.asm</code> dosyası hazırlanır.
          </p>
        </div>

        <div class="topbar-modal-footer">
          <button class="topbar-btn topbar-btn-secondary" id="btn-cancel-new-modal">İptal</button>
          <button class="topbar-btn topbar-btn-primary" id="btn-confirm-new-modal">Projeyi Oluştur</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector<HTMLInputElement>('#new-project-name-input');
    input?.focus();
    input?.select();

    const handleCreate = () => {
      const name = input?.value.trim() || defaultName;
      this.workspace.createProject(name);
      this.closeAllModals();
      this.render();
      this.callbacks.onNewProject?.();
    };

    overlay.querySelector('#btn-confirm-new-modal')?.addEventListener('click', handleCreate);
    overlay.querySelector('#btn-cancel-new-modal')?.addEventListener('click', () => this.closeAllModals());
    overlay.querySelector('#btn-close-new-modal')?.addEventListener('click', () => this.closeAllModals());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeAllModals();
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreate();
      }
    });
  }

  showOpenProjectModal(): void {
    this.closeAllModals();

    const overlay = document.createElement('div');
    overlay.className = 'topbar-modal-overlay';
    overlay.id = 'topbar-modal-open-project';

    const renderModalContent = () => {
      const projects = this.workspace.getProjectsList();
      const currentProject = this.workspace.getProject();

      overlay.innerHTML = `
        <div class="topbar-modal-card open-project-card">
          <div class="topbar-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">📂</span>
              <div>
                <h3 class="modal-title">Proje Aç (Open Project)</h3>
                <p class="modal-subtitle">Kayıtlı projelerinizden birini seçin veya bilgisayarınızdan içe aktarın</p>
              </div>
            </div>
            <button class="btn-modal-close" id="btn-close-open-modal">&times;</button>
          </div>

          <div class="topbar-modal-body">
            <!-- Dosyadan İçe Aktar Butonu -->
            <div class="open-project-import-banner">
              <div class="import-banner-info">
                <span class="import-icon">📥</span>
                <div>
                  <strong>Bilgisayardan .json Projesi Aç</strong>
                  <p>Daha önce dışa aktardığınız bir AssemblySim projesini yükleyin.</p>
                </div>
              </div>
              <button class="topbar-btn topbar-btn-secondary" id="btn-import-from-disk">Dosya Seç...</button>
            </div>

            <!-- Kayıtlı Projeler Listesi -->
            <div class="projects-list-header">
              <span>Kayıtlı Çalışma Alanları (${projects.length})</span>
            </div>

            <div class="projects-list-container">
              ${projects.length === 0 ? `
                <div class="projects-empty-state">Henüz kayıtlı başka bir proje bulunamadı.</div>
              ` : projects.map(p => {
                const isCurrent = p.id === currentProject.id;
                const formattedDate = new Date(p.lastModified).toLocaleString('tr-TR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return `
                  <div class="project-list-row ${isCurrent ? 'current-project' : ''}" data-project-id="${p.id}">
                    <div class="project-row-left">
                      <span class="project-row-icon">🗂️</span>
                      <div class="project-row-info">
                        <div class="project-row-name-wrap">
                          <strong class="project-row-name">${this.escapeHtml(p.name)}</strong>
                          ${isCurrent ? '<span class="project-current-badge">● Aktif</span>' : ''}
                        </div>
                        <div class="project-row-meta">
                          <span>${p.fileCount} dosya</span>
                          <span>•</span>
                          <span>Son düzenleme: ${formattedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div class="project-row-actions">
                      ${isCurrent ? `
                        <button class="topbar-btn topbar-btn-small topbar-btn-disabled" disabled>Açık</button>
                      ` : `
                        <button class="topbar-btn topbar-btn-small topbar-btn-primary btn-action-open" data-project-id="${p.id}">Aç</button>
                        <button class="topbar-btn topbar-btn-small topbar-btn-danger btn-action-delete" data-project-id="${p.id}" title="Projeyi Sil">🗑️</button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="topbar-modal-footer">
            <button class="topbar-btn topbar-btn-secondary" id="btn-cancel-open-modal">Kapat</button>
            <button class="topbar-btn topbar-btn-primary" id="btn-modal-quick-new">＋ Yeni Proje</button>
          </div>
        </div>
      `;

      // Event handlers inside modal
      overlay.querySelector('#btn-close-open-modal')?.addEventListener('click', () => this.closeAllModals());
      overlay.querySelector('#btn-cancel-open-modal')?.addEventListener('click', () => this.closeAllModals());
      overlay.querySelector('#btn-modal-quick-new')?.addEventListener('click', () => {
        this.closeAllModals();
        this.showNewProjectModal();
      });

      overlay.querySelector('#btn-import-from-disk')?.addEventListener('click', () => {
        this.triggerImportFile();
      });

      // Open buttons
      overlay.querySelectorAll('.btn-action-open').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = (btn as HTMLElement).getAttribute('data-project-id');
          if (pId) {
            this.workspace.openProject(pId);
            this.closeAllModals();
            this.render();
            this.callbacks.onOpenProject?.();
          }
        });
      });

      // Delete buttons
      overlay.querySelectorAll('.btn-action-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = (btn as HTMLElement).getAttribute('data-project-id');
          if (pId) {
            const projectItem = projects.find(p => p.id === pId);
            const confirmed = window.confirm(`"${projectItem?.name || 'Bu projeyi'}" silmek istediğinize emin misiniz?`);
            if (confirmed) {
              this.workspace.deleteProject(pId);
              renderModalContent(); // Refresh list
            }
          }
        });
      });

      // Clicking anywhere on a non-current row opens it
      overlay.querySelectorAll('.project-list-row:not(.current-project)').forEach(row => {
        row.addEventListener('click', () => {
          const pId = (row as HTMLElement).getAttribute('data-project-id');
          if (pId) {
            this.workspace.openProject(pId);
            this.closeAllModals();
            this.render();
            this.callbacks.onOpenProject?.();
          }
        });
      });
    };

    renderModalContent();
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeAllModals();
    });
  }

  showRenameProjectModal(): void {
    this.closeAllModals();

    const currentProject = this.workspace.getProject();
    const overlay = document.createElement('div');
    overlay.className = 'topbar-modal-overlay';
    overlay.id = 'topbar-modal-rename-project';

    overlay.innerHTML = `
      <div class="topbar-modal-card">
        <div class="topbar-modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">✏️</span>
            <div>
              <h3 class="modal-title">Proje Adını Değiştir</h3>
              <p class="modal-subtitle">Mevcut projenize yeni bir isim verin</p>
            </div>
          </div>
          <button class="btn-modal-close" id="btn-close-rename-modal">&times;</button>
        </div>

        <div class="topbar-modal-body">
          <div class="topbar-form-group">
            <label class="topbar-form-label" for="rename-project-input">Yeni Proje Adı:</label>
            <input type="text" id="rename-project-input" class="topbar-form-input" value="${this.escapeHtml(currentProject.name)}" autocomplete="off" />
          </div>
        </div>

        <div class="topbar-modal-footer">
          <button class="topbar-btn topbar-btn-secondary" id="btn-cancel-rename-modal">İptal</button>
          <button class="topbar-btn topbar-btn-primary" id="btn-confirm-rename-modal">Kaydet</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector<HTMLInputElement>('#rename-project-input');
    input?.focus();
    input?.select();

    const handleRename = () => {
      const newName = input?.value.trim();
      if (newName) {
        this.workspace.renameCurrentProject(newName);
        this.closeAllModals();
        this.render();
        this.callbacks.onRenameProject?.(newName);
      }
    };

    overlay.querySelector('#btn-confirm-rename-modal')?.addEventListener('click', handleRename);
    overlay.querySelector('#btn-cancel-rename-modal')?.addEventListener('click', () => this.closeAllModals());
    overlay.querySelector('#btn-close-rename-modal')?.addEventListener('click', () => this.closeAllModals());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeAllModals();
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRename();
      }
    });
  }

  private exportProject(): void {
    const jsonStr = this.workspace.exportProjectJson();
    const project = this.workspace.getProject();
    const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'project';
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.8086.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.callbacks.onExportProject?.();
  }

  private triggerImportFile(): void {
    this.fileInputEl.value = '';
    this.fileInputEl.click();
  }

  private handleFileSelected(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = this.workspace.importProjectJson(content);
        if (ok) {
          this.closeAllModals();
          this.render();
          this.callbacks.onImportProject?.(content);
        } else {
          alert('Geçersiz 8086 proje dosyası. JSON formatı doğrulanamadı.');
        }
      }
    };
    reader.readAsText(file);
  }

  private closeAllModals(): void {
    document.querySelectorAll('.topbar-modal-overlay').forEach(el => el.remove());
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
