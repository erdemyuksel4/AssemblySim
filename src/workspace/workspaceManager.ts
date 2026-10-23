import { WorkspaceDocument, DocumentType } from './types.js';
import { CpuInstanceManager } from '../cpu/instanceManager.js';

const STORAGE_DOCS_KEY = 'assemblysim_workspace_docs_v1';
const STORAGE_ACTIVE_ID_KEY = 'assemblysim_active_doc_id_v1';

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
    } catch (e) {
      console.warn('Could not save workspace to localStorage', e);
    }
  }

  getAllDocuments(): WorkspaceDocument[] {
    return Array.from(this.docs.values());
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
    referenceTab?: 'manual' | 'lectures' | 'leetcode' | 'roadmap';
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
}
