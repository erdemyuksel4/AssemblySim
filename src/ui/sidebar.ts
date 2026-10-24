import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceDocument } from '../workspace/types.js';
import { CpuInstanceManager } from '../cpu/instanceManager.js';

export interface SidebarCallbacks {
  onDocumentSelect: (doc: WorkspaceDocument) => void;
  onNewDocument: () => void;
  onOpenCpuModal: () => void;
  onOpenLearningDoc?: (tab: 'manual' | 'lectures' | 'leetcode' | 'roadmap') => void;
  onDocumentClosed?: (docId: string) => void;
  getActiveDocId?: () => string | null;
  getOpenDocIds?: () => string[];
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
    const activeDocId = this.callbacks.getActiveDocId ? this.callbacks.getActiveDocId() : this.workspace.getActiveDocument()?.id;
    const activeDoc = (activeDocId ? docs.find(d => d.id === activeDocId) : null) || this.workspace.getActiveDocument();
    const activeCpu = this.cpuManager.getOrDefaultInstance(activeDoc?.cpuInstanceId);
    const openDocIds = this.callbacks.getOpenDocIds ? this.callbacks.getOpenDocIds() : (activeDocId ? [activeDocId] : []);

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
            const isActive = openDocIds.includes(doc.id);
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
              <li class="workspace-doc-item ${isActive ? 'active' : ''}" data-doc-id="${doc.id}" draggable="true" title="${doc.title} (Sürükleyip istediğiniz panele bırakabilirsiniz)">
                <div class="doc-item-main">
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
          <div class="sidebar-learning-row" draggable="true" data-nav="manual" title="📖 Manuel (Sürükleyip istediğiniz panele bırakabilirsiniz)">
            <button class="sidebar-learning-btn ${docs.some(d => openDocIds.includes(d.id) && d.type === 'reference' && d.referenceTab === 'manual') ? 'active' : ''}" data-nav="manual">
              <span class="learning-btn-icon">📖</span>
              <span class="learning-btn-text">Manuel</span>
            </button>
          </div>
          <div class="sidebar-learning-row" draggable="true" data-nav="lectures" title="🎓 Dersler (Sürükleyip istediğiniz panele bırakabilirsiniz)">
            <button class="sidebar-learning-btn ${docs.some(d => openDocIds.includes(d.id) && (d.type === 'reference' && d.referenceTab === 'lectures' || d.type === 'lecture')) ? 'active' : ''}" data-nav="lectures">
              <span class="learning-btn-icon">🎓</span>
              <span class="learning-btn-text">Dersler</span>
            </button>
          </div>
          <div class="sidebar-learning-row" draggable="true" data-nav="leetcode" title="⚡ LeetCode (Sürükleyip istediğiniz panele bırakabilirsiniz)">
            <button class="sidebar-learning-btn ${docs.some(d => openDocIds.includes(d.id) && d.type === 'reference' && d.referenceTab === 'leetcode') ? 'active' : ''}" data-nav="leetcode">
              <span class="learning-btn-icon">⚡</span>
              <span class="learning-btn-text">LeetCode</span>
            </button>
          </div>
          <div class="sidebar-learning-row" draggable="true" data-nav="roadmap" title="🗺️ Yol Haritası (Sürükleyip istediğiniz panele bırakabilirsiniz)">
            <button class="sidebar-learning-btn ${docs.some(d => openDocIds.includes(d.id) && d.type === 'reference' && d.referenceTab === 'roadmap') ? 'active' : ''}" data-nav="roadmap">
              <span class="learning-btn-icon">🗺️</span>
              <span class="learning-btn-text">Yol Haritası</span>
            </button>
          </div>
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

    // Drag and Drop from Sidebar Document Items
    this.container.querySelectorAll<HTMLElement>('.workspace-doc-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const docId = item.dataset.docId;
        if (!docId) return;
        const payload = JSON.stringify({ kind: 'workspace-doc', docId });
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
        item.classList.add('is-dragging');
        document.body.classList.add('is-dragging-doc');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('is-dragging');
        document.body.classList.remove('is-dragging-doc');
      });
    });

    // Drag and Drop from Sidebar Learning Rows
    this.container.querySelectorAll<HTMLElement>('.sidebar-learning-row').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        const nav = row.dataset.nav || row.querySelector('.sidebar-learning-btn')?.getAttribute('data-nav') || '';
        if (!nav) return;
        const payload = JSON.stringify({ kind: 'learning-doc', tab: nav });
        e.dataTransfer?.setData('application/x-assemblysim-doc', payload);
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyMove';
        row.classList.add('is-dragging');
        document.body.classList.add('is-dragging-doc');
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('is-dragging');
        document.body.classList.remove('is-dragging-doc');
      });
    });

    // Document item selection
    this.container.querySelectorAll<HTMLElement>('.workspace-doc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const docId = item.dataset.docId;
        if (!docId) return;
        
        // Don't switch if close button was clicked
        if ((e.target as HTMLElement).classList.contains('btn-doc-close')) return;

        const doc = this.workspace.getAllDocuments().find(d => d.id === docId);
        if (doc) {
          this.callbacks.onDocumentSelect(doc);
          this.render();
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
        if (this.callbacks.onDocumentClosed) {
          this.callbacks.onDocumentClosed(docId);
        }
        this.render();
        if (newActive && !this.callbacks.onDocumentClosed) {
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
