import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceDocument } from '../workspace/types.js';
import { CpuInstanceManager } from '../cpu/instanceManager.js';

export interface SplitPairInfo {
  id: string;
  primaryDocId: string;
  secondaryDocId: string;
}

export interface SplitPaneInfo {
  isSplit: boolean;
  primaryDoc: WorkspaceDocument | null;
  secondaryDoc: WorkspaceDocument | null;
  activePane: 'primary' | 'secondary';
}

export interface SidebarCallbacks {
  onDocumentSelect: (doc: WorkspaceDocument) => void;
  onNewDocument: () => void;
  onOpenCpuModal: () => void;
  onOpenLearningDoc?: (tab: 'manual' | 'lectures' | 'leetcode' | 'roadmap' | 'studynotes') => void;
  onDocumentClosed?: (docId: string) => void;
  onSelectPane?: (pane: 'primary' | 'secondary') => void;
  onCloseSplit?: () => void;
  onSelectPair?: (pairId: string, pane?: 'primary' | 'secondary') => void;
  onClosePair?: (pairId: string) => void;
  onDropOnPane?: (pane: 'primary' | 'secondary', rawData: string) => void;
  getActiveDocId?: () => string | null;
  getOpenDocIds?: () => string[];
  getSplitInfo?: () => SplitPaneInfo;
  getSplitPairs?: () => SplitPairInfo[];
  getActivePairId?: () => string | null;
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

    const splitInfo = this.callbacks.getSplitInfo?.() || {
      isSplit: false,
      primaryDoc: null,
      secondaryDoc: null,
      activePane: 'primary'
    };

    const splitPairs = this.callbacks.getSplitPairs ? this.callbacks.getSplitPairs() : [];
    const activePairId = this.callbacks.getActivePairId ? this.callbacks.getActivePairId() : null;

    // Collect IDs of docs that belong to saved split pairs
    const pairedDocIds = new Set<string>();
    splitPairs.forEach(p => {
      pairedDocIds.add(p.primaryDocId);
      pairedDocIds.add(p.secondaryDocId);
    });

    const standaloneDocs = docs.filter(d => !pairedDocIds.has(d.id));

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
          <span class="sidebar-doc-count">${splitPairs.length + standaloneDocs.length}</span>
        </div>

        <ul class="workspace-doc-list">
          ${splitPairs.map(pair => {
            const primDoc = docs.find(d => d.id === pair.primaryDocId);
            const secDoc = docs.find(d => d.id === pair.secondaryDocId);
            if (!primDoc || !secDoc) return '';
            const isPairActive = splitInfo.isSplit && (activePairId === pair.id);
            const primIcon = this.getDocIcon(primDoc);
            const secIcon = this.getDocIcon(secDoc);

            const isPrimActive = isPairActive ? (splitInfo.activePane === 'primary') : (!splitInfo.isSplit && activeDocId === primDoc.id);
            const isSecActive = isPairActive ? (splitInfo.activePane === 'secondary') : (!splitInfo.isSplit && activeDocId === secDoc.id);

            return `
              <li class="workspace-split-pair-row ${isPairActive ? 'active-pair' : ''}" data-pair-id="${pair.id}">
                <div class="workspace-doc-item split-half ${isPrimActive ? 'active' : ''}" data-pair-id="${pair.id}" data-pane="primary" data-doc-id="${primDoc.id}" draggable="true" title="Sol Pencere: ${this.escapeHtml(primDoc.title)}">
                  <div class="doc-item-main">
                    <span class="doc-icon">${primIcon}</span>
                    <span class="doc-title">${this.escapeHtml(primDoc.title)}</span>
                  </div>
                </div>
                <div class="workspace-doc-item split-half ${isSecActive ? 'active' : ''}" data-pair-id="${pair.id}" data-pane="secondary" data-doc-id="${secDoc.id}" draggable="true" title="Sağ Pencere: ${this.escapeHtml(secDoc.title)}">
                  <div class="doc-item-main">
                    <span class="doc-icon">${secIcon}</span>
                    <span class="doc-title">${this.escapeHtml(secDoc.title)}</span>
                  </div>
                  <button class="btn-doc-close btn-split-close btn-pair-close" data-pair-id="${pair.id}" title="Çift Pencereyi Kapat">×</button>
                </div>
              </li>
            `;
          }).join('')}
          ${standaloneDocs.map(doc => this.renderDocItem(doc, openDocIds)).join('')}
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
          <div class="sidebar-learning-row" draggable="true" data-nav="studynotes" title="📝 Çalışma Notları (Sürükleyip istediğiniz panele bırakabilirsiniz)">
            <button class="sidebar-learning-btn ${docs.some(d => openDocIds.includes(d.id) && d.type === 'reference' && d.referenceTab === 'studynotes') ? 'active' : ''}" data-nav="studynotes">
              <span class="learning-btn-icon">📝</span>
              <span class="learning-btn-text">Çalışma Notları</span>
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
        const nav = btn.dataset.nav as 'manual' | 'lectures' | 'leetcode' | 'roadmap' | 'studynotes';
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
        (window as any).__assemblySimDraggedDoc = { kind: 'workspace-doc', docId };
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('is-dragging');
        document.body.classList.remove('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = null;
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
        (window as any).__assemblySimDraggedDoc = { kind: 'learning-doc', tab: nav };
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('is-dragging');
        document.body.classList.remove('is-dragging-doc');
        (window as any).__assemblySimDraggedDoc = null;
      });
    });

    // Split pair click to open or switch focus
    this.container.querySelectorAll<HTMLElement>('.workspace-split-pair-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // If close button was clicked, don't select
        if ((e.target as HTMLElement).closest('.btn-pair-close') || (e.target as HTMLElement).classList.contains('btn-doc-close')) {
          return;
        }
        const pairId = row.dataset.pairId;
        if (!pairId) return;

        const half = (e.target as HTMLElement).closest<HTMLElement>('.split-half');
        const pane = (half?.dataset.pane as 'primary' | 'secondary') || 'primary';

        if (this.callbacks.onSelectPair) {
          this.callbacks.onSelectPair(pairId, pane);
        } else if (this.callbacks.onSelectPane) {
          this.callbacks.onSelectPane(pane);
        }
      });
    });

    // Split pair close button
    this.container.querySelectorAll<HTMLButtonElement>('.btn-pair-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pairId = btn.dataset.pairId;
        if (pairId && this.callbacks.onClosePair) {
          this.callbacks.onClosePair(pairId);
        } else if (this.callbacks.onCloseSplit) {
          this.callbacks.onCloseSplit();
        }
      });
    });

    // Document item selection (standalone items only)
    this.container.querySelectorAll<HTMLElement>('.workspace-doc-item:not(.split-half)').forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't switch if close button was clicked
        if ((e.target as HTMLElement).classList.contains('btn-doc-close')) return;

        const docId = item.dataset.docId;
        if (!docId) return;

        const doc = this.workspace.getAllDocuments().find(d => d.id === docId);
        if (doc) {
          this.callbacks.onDocumentSelect(doc);
          this.render();
        }
      });
    });

    // Document close buttons (standalone items only)
    this.container.querySelectorAll<HTMLButtonElement>('.btn-doc-close:not(.btn-pair-close)').forEach(btn => {
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

  private renderDocItem(doc: WorkspaceDocument, openDocIds: string[]): string {
    const cpu = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
    const isActive = openDocIds.includes(doc.id);
    const icon = this.getDocIcon(doc);
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
  }

  private getDocIcon(doc: WorkspaceDocument | null): string {
    if (!doc) return '📄';
    if (doc.type === 'challenge') return '🎯';
    if (doc.type === 'lecture') return '🎓';
    if (doc.type === 'example') return '💡';
    if (doc.type === 'reference') {
      if (doc.referenceTab === 'manual') return '📖';
      if (doc.referenceTab === 'lectures') return '🎓';
      if (doc.referenceTab === 'leetcode') return '⚡';
      if (doc.referenceTab === 'roadmap') return '🗺️';
      if (doc.referenceTab === 'studynotes') return '📝';
      return '📚';
    }
    return '📄';
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
