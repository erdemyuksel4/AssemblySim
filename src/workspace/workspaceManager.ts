import { WorkspaceDocument, DocumentType, OSProject, OSFileRole } from './types.js';
import { CpuInstanceManager } from '../cpu/instanceManager.js';
import { 
  OS_GUIDE_TEMPLATE,
  BOOT_ASM_TEMPLATE, 
  KERNEL_ASM_TEMPLATE, 
  SCREEN_ASM_TEMPLATE, 
  KEYBOARD_ASM_TEMPLATE, 
  SHELL_ASM_TEMPLATE 
} from '../os/starterTemplates.js';
import {
  REF_BIOS_ROM_TEMPLATE,
  REF_IVT_TABLE_TEMPLATE,
  REF_BDA_MAP_TEMPLATE
} from '../os/hardwareRefTemplates.js';

const STORAGE_DOCS_KEY = 'assemblysim_workspace_docs_v1';
const STORAGE_ACTIVE_ID_KEY = 'assemblysim_active_doc_id_v1';
const STORAGE_OS_PROJECTS_KEY = 'assemblysim_os_projects_v1';

export const DEFAULT_USER_CODE = `; 8086 Assembly Program
; Ornek: 1'den 5'e kadar sayilari topla (1+2+3+4+5 = 15 / 0Fh)
ORG 100H

MOV AX, 0000H     ; Toplam = 0
MOV CX, 0005H     ; Sayac = 5

DONGU:
    ADD AX, CX    ; AX = AX + CX
    LOOP DONGU    ; CX 1 azalt, CX != 0 ise DONGU'ye don

HLT               ; Programi sonlandir
`;

export interface WorkspaceEvents {
  onDocumentChange?: (doc: WorkspaceDocument) => void;
  onDocumentListChange?: (docs: WorkspaceDocument[]) => void;
}

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export class WorkspaceManager {
  private docs: Map<string, WorkspaceDocument> = new Map();
  private osProjects: Map<string, OSProject> = new Map();
  private activeId: string = 'doc-main';
  private cpuManager: CpuInstanceManager;
  private events: WorkspaceEvents;

  constructor(cpuManager: CpuInstanceManager, events: WorkspaceEvents = {}) {
    this.cpuManager = cpuManager;
    this.events = events;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storage = getSafeStorage();
    if (!storage) {
      this.initDefaultDoc();
      return;
    }

    try {
      const savedDocs = storage.getItem(STORAGE_DOCS_KEY);
      const savedActiveId = storage.getItem(STORAGE_ACTIVE_ID_KEY);
      const savedProjects = storage.getItem(STORAGE_OS_PROJECTS_KEY);

      if (savedProjects) {
        const parsedProj: OSProject[] = JSON.parse(savedProjects);
        if (Array.isArray(parsedProj)) {
          for (const p of parsedProj) {
            this.osProjects.set(p.id, p);
          }
        }
      }

      if (savedDocs) {
        const parsed: WorkspaceDocument[] = JSON.parse(savedDocs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const d of parsed) {
            // Ensure a matching CPU instance exists for each document
            if (!this.cpuManager.getInstance(d.cpuInstanceId)) {
              this.cpuManager.createInstance(d.title, d.cpuInstanceId);
            }
            this.docs.set(d.id, d);
          }

          // Ensure all OS projects have the architecture guide and hardware reference files
          for (const proj of this.osProjects.values()) {
            const hasGuide = proj.fileDocIds.some(id => this.docs.get(id)?.osRole === 'guide');
            if (!hasGuide) {
              const guideDoc = this.createOSFileInternal(proj.id, '00_REHBER.asm', 'guide', OS_GUIDE_TEMPLATE);
              proj.fileDocIds.push(guideDoc.id);
            }
            const hasBios = proj.fileDocIds.some(id => this.docs.get(id)?.title === 'ref_bios_rom.asm');
            if (!hasBios) {
              const biosDoc = this.createOSFileInternal(proj.id, 'ref_bios_rom.asm', 'hardware_ref', REF_BIOS_ROM_TEMPLATE);
              proj.fileDocIds.push(biosDoc.id);
            }
            const hasIvt = proj.fileDocIds.some(id => this.docs.get(id)?.title === 'ref_ivt_tablosu.asm');
            if (!hasIvt) {
              const ivtDoc = this.createOSFileInternal(proj.id, 'ref_ivt_tablosu.asm', 'hardware_ref', REF_IVT_TABLE_TEMPLATE);
              proj.fileDocIds.push(ivtDoc.id);
            }
            const hasBda = proj.fileDocIds.some(id => this.docs.get(id)?.title === 'ref_bda_donanim.asm');
            if (!hasBda) {
              const bdaDoc = this.createOSFileInternal(proj.id, 'ref_bda_donanim.asm', 'hardware_ref', REF_BDA_MAP_TEMPLATE);
              proj.fileDocIds.push(bdaDoc.id);
            }
          }

          if (savedActiveId && this.docs.has(savedActiveId)) {
            this.activeId = savedActiveId;
          } else {
            this.activeId = parsed[0].id;
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load workspace from localStorage', e);
    }

    this.initDefaultDoc();
  }

  private initDefaultDoc(): void {
    const mainDoc: WorkspaceDocument = {
      id: 'doc-main',
      title: 'main.asm',
      type: 'custom',
      code: DEFAULT_USER_CODE,
      cpuInstanceId: this.cpuManager.getDefaultInstance().id,
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    this.docs.set(mainDoc.id, mainDoc);
    this.activeId = mainDoc.id;
    this.saveToStorage();
  }

  private saveToStorage(): void {
    const storage = getSafeStorage();
    if (!storage) return;

    try {
      const arr = Array.from(this.docs.values());
      storage.setItem(STORAGE_DOCS_KEY, JSON.stringify(arr));
      storage.setItem(STORAGE_ACTIVE_ID_KEY, this.activeId);

      const projArr = Array.from(this.osProjects.values());
      storage.setItem(STORAGE_OS_PROJECTS_KEY, JSON.stringify(projArr));
    } catch (e) {
      console.warn('Could not save workspace to localStorage', e);
    }
  }

  getAllDocuments(): WorkspaceDocument[] {
    return Array.from(this.docs.values());
  }

  getDocument(id: string): WorkspaceDocument | undefined {
    return this.docs.get(id);
  }

  getActiveDocument(): WorkspaceDocument {
    return this.docs.get(this.activeId) || this.getAllDocuments()[0];
  }

  setActiveDocument(id: string): WorkspaceDocument | undefined {
    const doc = this.docs.get(id);
    if (!doc) return undefined;
    this.activeId = id;
    this.saveToStorage();
    this.events.onDocumentChange?.(doc);
    return doc;
  }

  /**
   * Opens an existing document or creates a new one with its own isolated CPU instance
   */
  openDocument(docInput: {
    id?: string;
    title: string;
    type: DocumentType;
    code: string;
    challengeId?: string;
    milestoneId?: string;
    referenceTab?: 'manual' | 'lectures' | 'leetcode' | 'roadmap' | 'studynotes';
  }): WorkspaceDocument {
    const docId = docInput.id || (
      docInput.referenceTab ? `ref-${docInput.referenceTab}` :
      docInput.milestoneId ? `lecture-${docInput.milestoneId}` :
      docInput.challengeId ? `challenge-${docInput.challengeId}` : 
      `doc-${Date.now()}`
    );

    // If already open, switch to it and update code if starter
    if (this.docs.has(docId)) {
      this.activeId = docId;
      const existing = this.docs.get(docId)!;
      this.saveToStorage();
      this.events.onDocumentChange?.(existing);
      return existing;
    }

    // Automatically create a dedicated isolated CPU instance for this new document
    const cpuInst = this.cpuManager.createInstance(`İşlemci: ${docInput.title}`);

    const newDoc: WorkspaceDocument = {
      id: docId,
      title: docInput.title,
      type: docInput.type,
      code: docInput.code,
      cpuInstanceId: cpuInst.id,
      challengeId: docInput.challengeId,
      milestoneId: docInput.milestoneId,
      referenceTab: docInput.referenceTab,
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    this.docs.set(docId, newDoc);
    this.activeId = docId;
    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    this.events.onDocumentChange?.(newDoc);
    return newDoc;
  }

  updateActiveCode(code: string): void {
    const doc = this.getActiveDocument();
    if (doc) {
      doc.code = code;
      doc.lastModified = Date.now();
      this.saveToStorage();
    }
  }

  updateDocumentCode(id: string, code: string): void {
    const doc = this.docs.get(id);
    if (doc) {
      doc.code = code;
      doc.lastModified = Date.now();
      this.saveToStorage();
    }
  }

  closeDocument(id: string): WorkspaceDocument | null {
    if (this.docs.size <= 1) {
      // Don't close the last document; reset it instead
      return null;
    }

    const doc = this.docs.get(id);
    if (!doc) return null;

    this.docs.delete(id);

    // If active document was closed, pick another active document
    if (this.activeId === id) {
      const remaining = this.getAllDocuments();
      this.activeId = remaining[0].id;
      this.events.onDocumentChange?.(remaining[0]);
    }

    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    return this.getActiveDocument();
  }

  assignCpuToDocument(docId: string, cpuId: string): boolean {
    const doc = this.docs.get(docId);
    const cpu = this.cpuManager.getInstance(cpuId);
    if (!doc || !cpu) return false;

    doc.cpuInstanceId = cpuId;
    this.saveToStorage();
    if (this.activeId === docId) {
      this.events.onDocumentChange?.(doc);
    }
    return true;
  }

  setDocumentCpu(docId: string, cpuId: string): WorkspaceDocument | undefined {
    const success = this.assignCpuToDocument(docId, cpuId);
    return success ? this.docs.get(docId) : undefined;
  }

  renameDocument(docId: string, newTitle: string): boolean {
    const doc = this.docs.get(docId);
    if (!doc) return false;
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return false;

    doc.title = cleanTitle;
    doc.lastModified = Date.now();
    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    return true;
  }

  getOSProjects(): OSProject[] {
    return Array.from(this.osProjects.values());
  }

  getOSProject(id: string): OSProject | undefined {
    return this.osProjects.get(id);
  }

  createOSProject(name?: string): OSProject {
    const projId = `os-proj-${Date.now()}`;
    const projName = (name && name.trim()) ? name.trim() : 'BenimOS';

    // 1. Kullanıcının Yazacağı 5 Temel OS Modülü
    const bootDoc = this.createOSFileInternal(projId, 'boot.asm', 'boot', BOOT_ASM_TEMPLATE);
    const kernelDoc = this.createOSFileInternal(projId, 'kernel.asm', 'kernel', KERNEL_ASM_TEMPLATE);
    const screenDoc = this.createOSFileInternal(projId, 'screen.asm', 'screen', SCREEN_ASM_TEMPLATE);
    const keyboardDoc = this.createOSFileInternal(projId, 'keyboard.asm', 'keyboard', KEYBOARD_ASM_TEMPLATE);
    const shellDoc = this.createOSFileInternal(projId, 'shell.asm', 'shell', SHELL_ASM_TEMPLATE);

    // 2. Mimari Rehberi ve Donanım/BIOS Referans Belgeleri (İnceleme & Gözlem için Salt Okunur)
    const guideDoc = this.createOSFileInternal(projId, '00_REHBER.asm', 'guide', OS_GUIDE_TEMPLATE);
    const biosDoc = this.createOSFileInternal(projId, 'ref_bios_rom.asm', 'hardware_ref', REF_BIOS_ROM_TEMPLATE);
    const ivtDoc = this.createOSFileInternal(projId, 'ref_ivt_tablosu.asm', 'hardware_ref', REF_IVT_TABLE_TEMPLATE);
    const bdaDoc = this.createOSFileInternal(projId, 'ref_bda_donanim.asm', 'hardware_ref', REF_BDA_MAP_TEMPLATE);

    const project: OSProject = {
      id: projId,
      name: projName,
      createdAt: Date.now(),
      lastModified: Date.now(),
      isCollapsed: false,
      activeFileId: bootDoc.id,
      fileDocIds: [
        bootDoc.id, 
        kernelDoc.id, 
        screenDoc.id, 
        keyboardDoc.id, 
        shellDoc.id,
        guideDoc.id,
        biosDoc.id, 
        ivtDoc.id, 
        bdaDoc.id
      ]
    };

    this.osProjects.set(projId, project);
    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    return project;
  }

  private createOSFileInternal(
    projId: string, 
    fileName: string, 
    role: OSFileRole, 
    code: string
  ): WorkspaceDocument {
    const docId = `doc-${projId}-${role}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cpuInst = this.cpuManager.createInstance(`OS: ${fileName}`);

    const doc: WorkspaceDocument = {
      id: docId,
      title: fileName,
      type: 'os_file',
      code: code,
      cpuInstanceId: cpuInst.id,
      osProjectId: projId,
      osRole: role,
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    this.docs.set(docId, doc);
    return doc;
  }

  addFileToOSProject(
    projectId: string, 
    fileName: string, 
    role: OSFileRole = 'custom', 
    initialCode?: string
  ): WorkspaceDocument | null {
    const proj = this.osProjects.get(projectId);
    if (!proj) return null;

    const code = initialCode !== undefined ? initialCode : `; ${fileName} - ${proj.name} Modulu\nORG 1000h\n\n`;
    const doc = this.createOSFileInternal(projectId, fileName, role, code);
    proj.fileDocIds.push(doc.id);
    proj.lastModified = Date.now();

    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    return doc;
  }

  renameOSProject(id: string, newName: string): boolean {
    const proj = this.osProjects.get(id);
    if (!proj) return false;
    const cleanName = newName.trim();
    if (!cleanName) return false;

    proj.name = cleanName;
    proj.lastModified = Date.now();
    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    return true;
  }

  deleteOSProject(id: string): boolean {
    const proj = this.osProjects.get(id);
    if (!proj) return false;

    // Projeye ait tüm dosyaları sil
    for (const fileId of proj.fileDocIds) {
      this.docs.delete(fileId);
    }
    this.osProjects.delete(id);

    // Eğer silinen dosyalardan biri aktifse, ana belgeye dön
    if (!this.docs.has(this.activeId)) {
      const remaining = this.getAllDocuments();
      if (remaining.length > 0) {
        this.activeId = remaining[0].id;
        this.events.onDocumentChange?.(remaining[0]);
      }
    }

    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    return true;
  }

  toggleOSProjectCollapse(id: string): void {
    const proj = this.osProjects.get(id);
    if (proj) {
      proj.isCollapsed = !proj.isCollapsed;
      this.saveToStorage();
    }
  }

  deleteOSFile(fileDocId: string): boolean {
    const doc = this.docs.get(fileDocId);
    if (!doc || !doc.osProjectId) return false;

    const proj = this.osProjects.get(doc.osProjectId);
    if (proj) {
      proj.fileDocIds = proj.fileDocIds.filter(fid => fid !== fileDocId);
      proj.lastModified = Date.now();
    }

    this.docs.delete(fileDocId);
    if (this.activeId === fileDocId) {
      const remaining = this.getAllDocuments();
      if (remaining.length > 0) {
        this.activeId = remaining[0].id;
        this.events.onDocumentChange?.(remaining[0]);
      }
    }

    this.saveToStorage();
    this.events.onDocumentListChange?.(this.getAllDocuments());
    return true;
  }
}
