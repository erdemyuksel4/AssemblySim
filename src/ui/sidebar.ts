import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceDocument } from '../workspace/types.js';
import { CpuInstanceManager } from '../cpu/instanceManager.js';

export interface SidebarCallbacks {
  onDocumentSelect: (doc: WorkspaceDocument) => void;
  onNewDocument: () => void;
  onOpenCpuModal: () => void;
  onOpenLearningDoc?: (tab: 'manual' | 'lectures' | 'leetcode' | 'roadmap') => void;
}

export class WorkspaceSidebar {
  private container: HTMLElement;
  private workspace: WorkspaceManager;
  private cpuManager: CpuInstanceManager;
  private callbacks: SidebarCallbacks;
  private isCollapsed: boolean = true; // Collapsed by default as requested

  constructor(
    parentEl: HTMLElement,
    workspace: WorkspaceManager,
    cpuManager: CpuInstanceManager,
    callbacks: SidebarCallbacks
  ) {
    this.workspace = workspace;
    this.cpuManager = cpuManager;
    this.callbacks = callbacks;

    this.container = document.createElement('aside');
    this.container.id = 'workspace-sidebar';
    this.container.className = 'workspace-sidebar collapsed';
    parentEl.appendChild(this.container);

    this.render();
    this.setupGlobalEvents();
  }

  toggleCollapse(force?: boolean): void {
    if (force !== undefined) {
      this.isCollapsed = force;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }

    if (this.isCollapsed) {
      this.container.classList.add('collapsed');
    } else {
      this.container.classList.remove('collapsed');
    }
    this.updateToggleIcon();
  }

  private updateToggleIcon(): void {
    const btn = this.container.querySelector<HTMLButtonElement>('.btn-sidebar-toggle');
    if (btn) {
      btn.innerHTML = this.isCollapsed ? '❯' : '❮';
      btn.title = this.isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt';
    }
  }

  render(): void {
    const docs = this.workspace.getAllDocuments();
    const activeDoc = this.workspace.getActiveDocument();
    const activeCpu = this.cpuManager.getOrDefaultInstance(activeDoc?.cpuInstanceId);

    this.container.innerHTML = `
      <div class="sidebar-header">
        <button class="btn-sidebar-toggle" title="${this.isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}">
          ${this.isCollapsed ? '❯' : '❮'}
        </button>
        <div class="sidebar-title-area">
          <span class="sidebar-title-icon">🗂️</span>
          <h3 class="sidebar-title">Çalışma Alanı</h3>
        </div>
        <button class="btn-sidebar-new" title="Yeni Assembly Dosyası Oluştur">＋</button>
      </div>

      <div class="sidebar-content">
        <div class="sidebar-section-header">
          <span>Açık Belgeler & Görevler</span>
          <span class="sidebar-doc-count">${docs.length}</span>
        </div>

        <ul class="workspace-doc-list">
          ${docs.map(doc => {
            const cpu = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
            const isActive = doc.id === activeDoc?.id;
            const icon = doc.type === 'challenge' ? '🎯' : 
              (doc.type === 'lecture' ? '🎓' : 
              (doc.type === 'example' ? '💡' : 
              (doc.type === 'reference' ? (
                doc.referenceTab === 'manual' ? '📖' :
                doc.referenceTab === 'lectures' ? '🎓' :
                doc.referenceTab === 'leetcode' ? '⚡' :
                doc.referenceTab === 'roadmap' ? '🗺️' : '📚'
              ) : '📄')));
            return `
              <li class="workspace-doc-item ${isActive ? 'active' : ''}" data-doc-id="${doc.id}">
                <div class="doc-item-main" title="${doc.title}">
                  <span class="doc-icon">${icon}</span>
                  <span class="doc-title">${this.escapeHtml(doc.title)}</span>
                </div>
                <div class="doc-item-meta">
                  <span class="cpu-badge" style="border-left-color: ${cpu.color};" title="Bağlı CPU: ${cpu.name}">
                    ${this.escapeHtml(cpu.name)}
                  </span>
                  ${doc.id !== 'doc-main' ? `<button class="btn-doc-close" data-doc-id="${doc.id}" title="Belgeyi Kapat">×</button>` : ''}
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </div>

      <!-- Öğrenme & Referans Merkezi Bölümü (En Altta, Alt Alta) -->
      <div class="sidebar-learning-section">
        <div class="sidebar-section-header">
          <span>Öğrenme & Referans</span>
        </div>
        <div class="sidebar-learning-list">
          <button class="sidebar-learning-btn ${activeDoc?.type === 'reference' && activeDoc?.referenceTab === 'manual' ? 'active' : ''}" data-nav="manual" title="📖 Manuel (8086 Komut Seti Referansı)">
            <span class="learning-btn-icon">📖</span>
            <span class="learning-btn-text">Manuel</span>
          </button>
          <button class="sidebar-learning-btn ${activeDoc?.type === 'reference' && activeDoc?.referenceTab === 'lectures' ? 'active' : ''}" data-nav="lectures" title="🎓 Dersler & Teori Kataloğu">
            <span class="learning-btn-icon">🎓</span>
            <span class="learning-btn-text">Dersler</span>
          </button>
          <button class="sidebar-learning-btn ${activeDoc?.type === 'reference' && activeDoc?.referenceTab === 'leetcode' ? 'active' : ''}" data-nav="leetcode" title="⚡ 8086 LeetCode Görev Arenası">
            <span class="learning-btn-icon">⚡</span>
            <span class="learning-btn-text">LeetCode</span>
          </button>
          <button class="sidebar-learning-btn ${activeDoc?.type === 'reference' && activeDoc?.referenceTab === 'roadmap' ? 'active' : ''}" data-nav="roadmap" title="🗺️ Yol Haritası & Müfredat Ağacı">
            <span class="learning-btn-icon">🗺️</span>
            <span class="learning-btn-text">Yol Haritası</span>
          </button>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="btn-cpu-modal-open" title="CPU Örnek Yöneticisini Aç">
          <span class="footer-btn-icon">⚙️</span>
          <span class="footer-btn-text">CPU Örnekleri</span>
        </button>
        <div class="sidebar-status-pill" style="border-color: ${activeCpu.color};">
          <span class="status-dot" style="background-color: ${activeCpu.color};"></span>
          <span class="status-cpu-name" title="Aktif İşlemci: ${activeCpu.name}">${this.escapeHtml(activeCpu.name)}</span>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Collapse toggle button
    const toggleBtn = this.container.querySelector<HTMLButtonElement>('.btn-sidebar-toggle');
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCollapse();
    });

    // New doc button
    const newBtn = this.container.querySelector<HTMLButtonElement>('.btn-sidebar-new');
    newBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onNewDocument();
    });

    // CPU modal open button
    const cpuBtn = this.container.querySelector<HTMLButtonElement>('.btn-cpu-modal-open');
    cpuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onOpenCpuModal();
    });

    // Learning & Reference buttons at bottom
    this.container.querySelectorAll<HTMLButtonElement>('.sidebar-learning-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nav = btn.dataset.nav as 'manual' | 'lectures' | 'leetcode' | 'roadmap';
        if (nav && this.callbacks.onOpenLearningDoc) {
          this.callbacks.onOpenLearningDoc(nav);
        }
      });
    });

    // Document item selection
    this.container.querySelectorAll<HTMLElement>('.workspace-doc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const docId = item.dataset.docId;
        if (!docId) return;
        
        // Don't switch if close button was clicked
        if ((e.target as HTMLElement).classList.contains('btn-doc-close')) return;

        const doc = this.workspace.setActiveDocument(docId);
        if (doc) {
          this.render();
          this.callbacks.onDocumentSelect(doc);
        }
      });
    });

    // Document close buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-doc-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const docId = btn.dataset.docId;
        if (!docId) return;

        const newActive = this.workspace.closeDocument(docId);
        this.render();
        if (newActive) {
          this.callbacks.onDocumentSelect(newActive);
        }
      });
    });
  }

  private setupGlobalEvents(): void {
    // Allow clicking sidebar when collapsed to expand it
    this.container.addEventListener('click', (e) => {
      if (this.isCollapsed) {
        this.toggleCollapse(false);
      }
    });
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
