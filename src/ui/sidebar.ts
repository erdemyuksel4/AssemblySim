import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { WorkspaceFile, WorkspaceProject } from '../workspace/types.js';

export interface SidebarCallbacks {
  onFileSelect: (file: WorkspaceFile) => void;
  onNewFile: () => void;
  onSetEntryFile?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameFile?: (fileId: string, newName: string) => void;
  onOpenManual?: () => void;
  onOpenGraph?: () => void;
  onOpenStudy?: () => void;
  getActiveFileId?: () => string | null;
  isManualOpen?: () => boolean;
  isGraphOpen?: () => boolean;
  isStudyOpen?: () => boolean;
}

export class WorkspaceSidebar {
  private container: HTMLElement;
  private workspace: WorkspaceManager;
  private callbacks: SidebarCallbacks;
  private isCollapsed: boolean = false;

  constructor(
    parentEl: HTMLElement,
    workspace: WorkspaceManager,
    callbacks: SidebarCallbacks
  ) {
    this.workspace = workspace;
    this.callbacks = callbacks;

    this.container = document.createElement('aside');
    this.container.id = 'workspace-sidebar';
    this.container.className = 'workspace-sidebar';
    parentEl.appendChild(this.container);

    this.render();
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
    const project = this.workspace.getProject();
    const files = project.files;
    const isManualActive = this.callbacks.isManualOpen ? this.callbacks.isManualOpen() : false;
    const isGraphActive = this.callbacks.isGraphOpen ? this.callbacks.isGraphOpen() : false;
    const isStudyActive = this.callbacks.isStudyOpen ? this.callbacks.isStudyOpen() : false;
    const isOtherActive = isManualActive || isGraphActive || isStudyActive;
    const activeFileId = isOtherActive ? null : (this.callbacks.getActiveFileId ? this.callbacks.getActiveFileId() : project.activeFileId);

    this.container.innerHTML = `
      <div class="sidebar-header">
        <button class="btn-sidebar-toggle" title="${this.isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}">
          ${this.isCollapsed ? '❯' : '❮'}
        </button>
        <div class="sidebar-title-area">
          <span class="sidebar-title-icon">🗂️</span>
          <h3 class="sidebar-title" title="8086 Workspace Projesi">${this.escapeHtml(project.name)}</h3>
          <span class="sidebar-doc-count">${files.length}</span>
        </div>
        <div class="sidebar-header-btns">
          <button class="btn-sidebar-new" id="btn-sidebar-new-file" title="Yeni Assembly Dosyası Ekle (.asm)">＋</button>
        </div>
      </div>

      <div class="sidebar-content">
        <div class="sidebar-section-header" style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
          <span>Proje Dosyaları</span>
        </div>
        <ul class="workspace-doc-list">
          ${files.map(file => this.renderFileItem(file, file.id === activeFileId, file.id === project.entryFileId, files.length > 1)).join('')}
        </ul>
      </div>

      <div class="sidebar-footer" style="padding: 10px; border-top: 1px solid var(--border-color); background: #f8fafc; display: flex; flex-direction: column; gap: 6px;">
        <!-- 8086 Assembly Dersleri & Zihin Haritası Butonu -->
        <button class="btn-sidebar-study-action ${isStudyActive ? 'active' : ''}" id="btn-sidebar-open-study" title="8086 Assembly Dersleri, Zihin Haritası ve Not Defteri" style="width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 8px 10px; background: ${isStudyActive ? '#fef3c7' : '#ffffff'}; border: 1px solid ${isStudyActive ? '#fde68a' : 'var(--border-dark)'}; border-radius: 6px; cursor: pointer; color: ${isStudyActive ? '#92400e' : 'var(--text-primary)'}; font-weight: 700; font-size: 12px; transition: all 0.15s ease;">
          <span class="footer-btn-icon" style="font-size: 15px;">🎓</span>
          <span class="footer-btn-text">Dersler & Not Defteri</span>
        </button>

        <!-- 8086 Sinir Ağı & Bilgi Grafı Butonu -->
        <button class="btn-sidebar-graph-action ${isGraphActive ? 'active' : ''}" id="btn-sidebar-open-graph" title="8086 Sinir Ağı ve Ortak Özellik Bilgi Haritası" style="width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 8px 10px; background: ${isGraphActive ? '#f0fdf4' : '#ffffff'}; border: 1px solid ${isGraphActive ? '#86efac' : 'var(--border-dark)'}; border-radius: 6px; cursor: pointer; color: ${isGraphActive ? '#15803d' : 'var(--text-primary)'}; font-weight: 700; font-size: 12px; transition: all 0.15s ease;">
          <span class="footer-btn-icon" style="font-size: 15px;">🧠</span>
          <span class="footer-btn-text">Bilgi Haritası</span>
        </button>

        <!-- 8086 Komut Manueli Butonu (Orijinal IBM PC 8086 Başvuru Kılavuzu) -->
        <button class="btn-sidebar-manual-action ${isManualActive ? 'active' : ''}" id="btn-sidebar-open-manual" title="8086 Komut Seti ve Referans Manueli" style="width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 8px 10px; background: ${isManualActive ? '#eff6ff' : '#ffffff'}; border: 1px solid ${isManualActive ? '#93c5fd' : 'var(--border-dark)'}; border-radius: 6px; cursor: pointer; color: ${isManualActive ? '#1d4ed8' : 'var(--text-primary)'}; font-weight: 600; font-size: 12px; transition: all 0.15s ease;">
          <span class="footer-btn-icon" style="font-size: 15px;">📖</span>
          <span class="footer-btn-text">Komut Manueli</span>
        </button>
      </div>
    `;

    this.bindEvents();
  }

  private renderFileItem(file: WorkspaceFile, isActive: boolean, isEntry: boolean, canDelete: boolean): string {
    return `
      <li class="workspace-doc-item ${isActive ? 'active' : ''}" data-file-id="${file.id}">
        <div class="doc-item-main" title="${this.escapeHtml(file.name)} (Yeniden adlandırmak için çift tıklayın)">
          <span class="doc-icon">${isEntry ? '🚀' : '📄'}</span>
          <span class="doc-title">${this.escapeHtml(file.name)}</span>
          ${isEntry ? `<span class="entry-badge" title="Bilgisayar bu dosyadan başlar (CS:IP)" style="font-size: 9px; background: #dcfce7; color: #15803d; padding: 1px 4px; border-radius: 3px; font-weight: 700; margin-left: 4px;">BAŞLANGIÇ</span>` : ''}
        </div>
        <div class="doc-item-actions" style="display: flex; gap: 2px;">
          ${!isEntry ? `
            <button class="btn-set-entry" data-file-id="${file.id}" title="Başlangıç Dosyası Yap (Entry Point)" style="background: none; border: none; font-size: 11px; cursor: pointer; opacity: 0.5; padding: 2px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">🚀</button>
          ` : ''}
          ${canDelete ? `
            <button class="btn-doc-delete" data-file-id="${file.id}" title="Dosyayı Sil">×</button>
          ` : ''}
        </div>
      </li>
    `;
  }

  private bindEvents(): void {
    // 1. Toggle Collapse
    const toggleBtn = this.container.querySelector('.btn-sidebar-toggle');
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCollapse();
    });

    // 2. New File
    const newBtn = this.container.querySelector('#btn-sidebar-new-file');
    newBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onNewFile();
    });

    // 3. File Select & Rename
    const docItems = this.container.querySelectorAll('.workspace-doc-item');
    docItems.forEach(item => {
      const fileId = item.getAttribute('data-file-id');
      if (!fileId) return;

      item.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-doc-delete') || (e.target as HTMLElement).closest('.btn-set-entry')) return;
        const file = this.workspace.getFile(fileId);
        if (file) {
          this.callbacks.onFileSelect(file);
          this.render();
        }
      });

      // Double click to rename
      item.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const file = this.workspace.getFile(fileId);
        if (!file) return;
        const newName = window.prompt('Dosya adını girin:', file.name);
        if (newName && newName.trim()) {
          this.workspace.renameFile(fileId, newName.trim());
          this.callbacks.onRenameFile?.(fileId, newName.trim());
          this.render();
        }
      });
    });

    // 4. Set as Entry Point
    const entryBtns = this.container.querySelectorAll('.btn-set-entry');
    entryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileId = btn.getAttribute('data-file-id');
        if (!fileId) return;
        this.workspace.setEntryFile(fileId);
        this.callbacks.onSetEntryFile?.(fileId);
        this.render();
      });
    });

    // 5. Delete File
    const deleteBtns = this.container.querySelectorAll('.btn-doc-delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileId = btn.getAttribute('data-file-id');
        if (!fileId) return;
        const file = this.workspace.getFile(fileId);
        if (!file) return;

        if (window.confirm(`"${file.name}" dosyasını silmek istediğinize emin misiniz?`)) {
          this.workspace.deleteFile(fileId);
          this.callbacks.onDeleteFile?.(fileId);
          this.render();
        }
      });
    });

    // 5.5 Open Study Button
    const studyBtn = this.container.querySelector('#btn-sidebar-open-study');
    studyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onOpenStudy?.();
    });

    // 6. Open Graph Button
    const graphBtn = this.container.querySelector('#btn-sidebar-open-graph');
    graphBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onOpenGraph?.();
    });

    // 7. Open Manual Button
    const manualBtn = this.container.querySelector('#btn-sidebar-open-manual');
    manualBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onOpenManual?.();
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
