import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceDocument, OSProject } from '../workspace/types.js';
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
  onOpenOSSandbox?: (projectId?: string) => void;
}

export class WorkspaceSidebar {
  private container: HTMLElement;
  private workspace: WorkspaceManager;
  private cpuManager: CpuInstanceManager;
  private callbacks: SidebarCallbacks;
  private isCollapsed: boolean = true;
  private contextMenuEl: HTMLElement | null = null;

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

    this.createContextMenu();
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

    // Separate OS files and standalone documents
    const osProjects = this.workspace.getOSProjects();
    const osDocIds = new Set<string>();
    osProjects.forEach(p => p.fileDocIds.forEach(id => osDocIds.add(id)));

    const standaloneDocs = docs.filter(d => !pairedDocIds.has(d.id) && !osDocIds.has(d.id));

    this.container.innerHTML = `
      <div class="sidebar-header">
        <button class="btn-sidebar-toggle" title="${this.isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}">
          ${this.isCollapsed ? '❯' : '❮'}
        </button>
        <div class="sidebar-title-area">
          <span class="sidebar-title-icon">🗂️</span>
          <h3 class="sidebar-title">Çalışma Alanı</h3>
        </div>
        <div class="sidebar-header-btns">
          <button class="btn-sidebar-new-os" title="Yeni 8086 OS Projesi Oluştur">＋ OS</button>
          <button class="btn-sidebar-new" title="Yeni Assembly Dosyası Oluştur">＋</button>
        </div>
      </div>

      <div class="sidebar-content">
        <!-- 1. OS PROJELERİ BÖLÜMÜ (Tree View) -->
        <div class="sidebar-section-header os-section-title">
          <span>💻 OS Projeleri</span>
          <span class="sidebar-doc-count">${osProjects.length}</span>
        </div>

        <ul class="workspace-os-proj-list">
          ${osProjects.length === 0 ? `
            <li class="sidebar-empty-prompt">
              <button class="btn-sidebar-empty-os" title="Yeni bir 8086 işletim sistemi projesi başlatın">
                ＋ Yeni OS Projesi Başlat
              </button>
            </li>
          ` : osProjects.map(proj => this.renderOSProjectNode(proj, docs, openDocIds)).join('')}
        </ul>

        <!-- 2. AÇIK BELGELER & GÖREVLER -->
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

  private renderOSProjectNode(
    proj: OSProject, 
    allDocs: WorkspaceDocument[], 
    openDocIds: string[]
  ): string {
    const isCollapsed = proj.isCollapsed || false;
    const projFiles = proj.fileDocIds
      .map(id => allDocs.find(d => d.id === id))
      .filter((d): d is WorkspaceDocument => !!d);

    return `
      <li class="os-project-node" data-proj-id="${proj.id}">
        <!-- Project Folder Row -->
        <div class="os-project-row" data-proj-id="${proj.id}" title="Sağ Tık: Yeniden Adlandır, Yeni Modül, Sil">
          <button class="btn-os-caret" data-proj-id="${proj.id}" title="${isCollapsed ? 'Genişlet' : 'Daralt'}">
            ${isCollapsed ? '▶' : '▼'}
          </button>
          <span class="os-project-folder-icon">💻</span>
          <span class="os-project-title" data-proj-id="${proj.id}">${this.escapeHtml(proj.name)}</span>
          <span class="os-project-badge">${projFiles.length}</span>
          <button class="btn-os-open-sandbox" data-proj-id="${proj.id}" title="OS Sandbox'ta Aç & Başlat">🚀</button>
        </div>

        <!-- Project Nested Files List -->
        ${!isCollapsed ? `
          <ul class="os-project-file-list">
            ${projFiles.map(fdoc => this.renderOSFileItem(fdoc, openDocIds, proj.id)).join('')}
          </ul>
        ` : ''}
      </li>
    `;
  }

  private renderOSFileItem(
    doc: WorkspaceDocument, 
    openDocIds: string[], 
    projId: string
  ): string {
    const isActive = openDocIds.includes(doc.id);
    const icon = this.getDocIcon(doc);
    const isRef = doc.osRole === 'hardware_ref' || doc.osRole === 'guide';
    const badgeLabel = doc.osRole === 'hardware_ref' ? 'donanım' : doc.osRole === 'guide' ? 'rehber' : (doc.osRole || 'asm');

    return `
      <li class="workspace-doc-item os-file-item ${isActive ? 'active' : ''} ${isRef ? 'is-ref-doc' : ''}" 
          data-doc-id="${doc.id}" 
          data-proj-id="${projId}" 
          draggable="true" 
          title="${doc.title} ${isRef ? '(Donanım & Mimari Referans Belgesi)' : '(Sağ tık: Yeniden Adlandır, Sil)'}">
        <div class="doc-item-main">
          <span class="doc-icon">${icon}</span>
          <span class="doc-title" data-doc-id="${doc.id}">${this.escapeHtml(doc.title)}</span>
        </div>
        <div class="doc-item-meta">
          <span class="os-role-badge ${isRef ? 'role-ref' : ''}">${badgeLabel}</span>
          ${!isRef ? `<button class="btn-doc-close btn-os-file-close" data-doc-id="${doc.id}" title="Modülü Sil">×</button>` : ''}
        </div>
      </li>
    `;
  }

  private renderDocItem(doc: WorkspaceDocument, openDocIds: string[]): string {
    const cpu = this.cpuManager.getOrDefaultInstance(doc.cpuInstanceId);
    const isActive = openDocIds.includes(doc.id);
    const icon = this.getDocIcon(doc);
    return `
      <li class="workspace-doc-item ${isActive ? 'active' : ''}" data-doc-id="${doc.id}" draggable="true" title="${doc.title} (Sağ Tık: Yeniden Adlandır, Kapat)">
        <div class="doc-item-main">
          <span class="doc-icon">${icon}</span>
          <span class="doc-title" data-doc-id="${doc.id}">${this.escapeHtml(doc.title)}</span>
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
    if (doc.type === 'os_file') {
      switch (doc.osRole) {
        case 'guide': return '📘';
        case 'hardware_ref': return '🏛️';
        case 'boot': return '🚀';
        case 'kernel': return '⚙️';
        case 'screen': return '🖥️';
        case 'keyboard': return '⌨️';
        case 'shell': return '🐚';
        case 'interrupts': return '⚡';
        default: return '📄';
      }
    }
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

    // New OS Project button in header
    const newOsBtn = this.container.querySelector<HTMLButtonElement>('.btn-sidebar-new-os');
    newOsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.promptCreateOSProject();
    });

    // Empty state OS button
    const emptyOsBtn = this.container.querySelector<HTMLButtonElement>('.btn-sidebar-empty-os');
    emptyOsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.promptCreateOSProject();
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

    // OS Project Folder Toggle Caret
    this.container.querySelectorAll<HTMLButtonElement>('.btn-os-caret').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const projId = btn.dataset.projId;
        if (projId) {
          this.workspace.toggleOSProjectCollapse(projId);
          this.render();
        }
      });
    });

    // OS Project Open / Focus Button
    this.container.querySelectorAll<HTMLButtonElement>('.btn-os-open-sandbox').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const projId = btn.dataset.projId;
        if (projId) {
          const proj = this.workspace.getOSProject(projId);
          if (proj && proj.fileDocIds.length > 0) {
            const firstDoc = this.workspace.getDocument(proj.fileDocIds[0]);
            if (firstDoc) {
              this.callbacks.onDocumentSelect(firstDoc);
              this.render();
            }
          }
        }
      });
    });

    // OS Project Folder Row Click
    this.container.querySelectorAll<HTMLElement>('.os-project-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-os-caret') || (e.target as HTMLElement).closest('.btn-os-open-sandbox')) {
          return;
        }
        const projId = row.dataset.projId;
        if (projId) {
          this.workspace.toggleOSProjectCollapse(projId);
          this.render();
        }
      });
    });

    // Drag and Drop from Workspace Document Items
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

    // Document item selection
    this.container.querySelectorAll<HTMLElement>('.workspace-doc-item:not(.split-half)').forEach(item => {
      item.addEventListener('click', (e) => {
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

    // OS File delete close buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-os-file-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const docId = btn.dataset.docId;
        if (!docId) return;
        if (confirm('Bu OS modülünü silmek istediğinize emin misiniz?')) {
          this.workspace.deleteOSFile(docId);
          this.callbacks.onDocumentClosed?.(docId);
          this.render();
        }
      });
    });

    // Standard Document close buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-doc-close:not(.btn-pair-close):not(.btn-os-file-close)').forEach(btn => {
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

    // Context Menu Listener (Sağ Tık)
    this.container.addEventListener('contextmenu', (e: MouseEvent) => {
      this.handleContextMenu(e);
    });
  }

  private promptCreateOSProject(): void {
    const name = prompt('Yeni İşletim Sistemi Projesinin Adı:', 'ErdemOS');
    if (name && name.trim()) {
      const proj = this.workspace.createOSProject(name.trim());
      if (proj && proj.fileDocIds.length > 0) {
        const firstDoc = this.workspace.getDocument(proj.fileDocIds[0]);
        if (firstDoc) {
          this.callbacks.onDocumentSelect(firstDoc);
        }
      }
      this.render();
    }
  }

  // ==========================================================
  // SAĞ TIK BAĞLAM MENÜSÜ & YENİDEN ADLANDIRMA (Context Menu)
  // ==========================================================
  private createContextMenu(): void {
    this.contextMenuEl = document.createElement('div');
    this.contextMenuEl.id = 'sidebar-context-menu';
    this.contextMenuEl.className = 'sidebar-context-menu';
    this.contextMenuEl.style.display = 'none';
    document.body.appendChild(this.contextMenuEl);

    // Click outside to dismiss context menu
    document.addEventListener('click', () => {
      this.hideContextMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideContextMenu();
    });
  }

  private hideContextMenu(): void {
    if (this.contextMenuEl) {
      this.contextMenuEl.style.display = 'none';
    }
  }

  private handleContextMenu(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const projRow = target.closest<HTMLElement>('.os-project-row');
    const docItem = target.closest<HTMLElement>('.workspace-doc-item');

    let menuItemsHtml = '';

    if (projRow) {
      // 1. Right click on OS Project Row
      const projId = projRow.dataset.projId;
      const proj = projId ? this.workspace.getOSProject(projId) : undefined;
      if (!proj) return;

      menuItemsHtml = `
        <div class="ctx-item" data-action="rename-proj" data-proj-id="${proj.id}">
          <span class="ctx-icon">✏️</span>
          <span>Yeniden Adlandır...</span>
          <span class="ctx-shortcut">F2</span>
        </div>
        <div class="ctx-item" data-action="add-file" data-proj-id="${proj.id}">
          <span class="ctx-icon">➕</span>
          <span>Yeni Modül Ekle (.asm)...</span>
        </div>
        <div class="ctx-item" data-action="open-sandbox" data-proj-id="${proj.id}">
          <span class="ctx-icon">🚀</span>
          <span>OS Sandbox'ta Başlat</span>
        </div>
        <div class="ctx-sep"></div>
        <div class="ctx-item danger" data-action="delete-proj" data-proj-id="${proj.id}">
          <span class="ctx-icon">🗑️</span>
          <span>Projeyi Sil</span>
        </div>
      `;
    } else if (docItem) {
      // 2. Right click on File / Document Item
      const docId = docItem.dataset.docId;
      const doc = docId ? this.workspace.getDocument(docId) : undefined;
      if (!doc) return;

      menuItemsHtml = `
        <div class="ctx-item" data-action="rename-doc" data-doc-id="${doc.id}">
          <span class="ctx-icon">✏️</span>
          <span>Yeniden Adlandır...</span>
          <span class="ctx-shortcut">F2</span>
        </div>
        <div class="ctx-item" data-action="copy-code" data-doc-id="${doc.id}">
          <span class="ctx-icon">📋</span>
          <span>Kodu Kopyala</span>
        </div>
        <div class="ctx-sep"></div>
        <div class="ctx-item danger" data-action="delete-doc" data-doc-id="${doc.id}">
          <span class="ctx-icon">🗑️</span>
          <span>${doc.type === 'os_file' ? 'Modülü Sil' : 'Belgeyi Kapat'}</span>
        </div>
      `;
    } else {
      // 3. Right click on Empty Sidebar Space
      menuItemsHtml = `
        <div class="ctx-item" data-action="new-doc">
          <span class="ctx-icon">📄</span>
          <span>Yeni Assembly Belgesi</span>
        </div>
        <div class="ctx-item" data-action="new-os">
          <span class="ctx-icon">💻</span>
          <span>Yeni OS Projesi Oluştur...</span>
        </div>
      `;
    }

    if (!this.contextMenuEl) return;
    this.contextMenuEl.innerHTML = menuItemsHtml;
    this.contextMenuEl.style.display = 'block';

    // Position menu within viewport
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 200);
    this.contextMenuEl.style.left = `${x}px`;
    this.contextMenuEl.style.top = `${y}px`;

    // Bind menu action clicks
    this.contextMenuEl.querySelectorAll<HTMLElement>('.ctx-item').forEach(item => {
      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.hideContextMenu();
        const action = item.dataset.action;
        this.executeContextAction(action, item);
      });
    });
  }

  private executeContextAction(action: string | undefined, item: HTMLElement): void {
    if (!action) return;

    switch (action) {
      case 'rename-proj': {
        const projId = item.dataset.projId;
        if (!projId) break;
        const proj = this.workspace.getOSProject(projId);
        if (!proj) break;
        const newName = prompt('İşletim Sisteminin Yeni Adı:', proj.name);
        if (newName && newName.trim()) {
          this.workspace.renameOSProject(projId, newName.trim());
          this.render();
        }
        break;
      }
      case 'add-file': {
        const projId = item.dataset.projId;
        if (!projId) break;
        const fileName = prompt('Yeni Modül Dosya Adı (örn: driver.asm):', 'module.asm');
        if (fileName && fileName.trim()) {
          const doc = this.workspace.addFileToOSProject(projId, fileName.trim());
          if (doc) {
            this.callbacks.onDocumentSelect(doc);
          }
          this.render();
        }
        break;
      }
      case 'open-sandbox': {
        const projId = item.dataset.projId;
        if (projId) {
          const proj = this.workspace.getOSProject(projId);
          if (proj && proj.fileDocIds.length > 0) {
            const firstDoc = this.workspace.getDocument(proj.fileDocIds[0]);
            if (firstDoc) {
              this.callbacks.onDocumentSelect(firstDoc);
              this.render();
            }
          }
        }
        break;
      }
      case 'delete-proj': {
        const projId = item.dataset.projId;
        if (!projId) break;
        const proj = this.workspace.getOSProject(projId);
        if (confirm(`'${proj?.name}' işletim sistemi projesini ve tüm dosyalarını silmek istediğinize emin misiniz?`)) {
          this.workspace.deleteOSProject(projId);
          this.render();
        }
        break;
      }
      case 'rename-doc': {
        const docId = item.dataset.docId;
        if (!docId) break;
        const doc = this.workspace.getDocument(docId);
        if (!doc) break;
        const newTitle = prompt('Dosyanın Yeni Adı:', doc.title);
        if (newTitle && newTitle.trim()) {
          this.workspace.renameDocument(docId, newTitle.trim());
          this.render();
        }
        break;
      }
      case 'copy-code': {
        const docId = item.dataset.docId;
        if (!docId) break;
        const doc = this.workspace.getDocument(docId);
        if (doc && navigator.clipboard) {
          navigator.clipboard.writeText(doc.code);
        }
        break;
      }
      case 'delete-doc': {
        const docId = item.dataset.docId;
        if (!docId) break;
        const doc = this.workspace.getDocument(docId);
        if (!doc) break;
        if (doc.type === 'os_file') {
          if (confirm(`'${doc.title}' modülünü silmek istediğinize emin misiniz?`)) {
            this.workspace.deleteOSFile(docId);
            this.callbacks.onDocumentClosed?.(docId);
            this.render();
          }
        } else {
          this.workspace.closeDocument(docId);
          this.callbacks.onDocumentClosed?.(docId);
          this.render();
        }
        break;
      }
      case 'new-doc': {
        this.callbacks.onNewDocument();
        break;
      }
      case 'new-os': {
        this.promptCreateOSProject();
        break;
      }
    }
  }

  private setupGlobalEvents(): void {
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
