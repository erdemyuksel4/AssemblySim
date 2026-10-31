import { WorkspaceFile, WorkspaceProject } from './types.js';

const STORAGE_PROJECT_KEY = 'assemblysim_project_v4';
const LEGACY_PROJECT_V3 = 'assemblysim_project_v3';
const LEGACY_DOCS_KEY = 'assemblysim_docs_v2';
const LEGACY_V1_KEY = 'assemblysim_workspace_docs_v1';

export const DEFAULT_MAIN_CODE = `; ==========================================================
; 8086 Bare-Metal Bootloader (boot.asm)
; BIOS POST sonrasi 0000:7C00h adresinde calisir.
; 1 MB RAM: 00000h (IVT) | 00400h (BDA) | 07C00h (Boot) | B8000h (VRAM)
; ==========================================================
ORG 7C00H

START:
    CLI                 ; Kesmeleri gecici olarak kapat
    XOR AX, AX
    MOV DS, AX          ; DS = 0000h
    MOV ES, AX          ; ES = 0000h
    MOV SS, AX          ; SS = 0000h
    MOV SP, 7C00H       ; Stack: 0000:7C00h altina buyur
    STI                 ; Kesmeleri tekrar ac

    ; Ekrana (B800h CGA/VGA Renkli Metin VRAM) dogrudan 'BOOT OK' yaz
    MOV AX, 0B800H
    MOV ES, AX

    ; 'B' (42h) - Sari yazi (0Eh)
    MOV BYTE PTR ES:[0000H], 42H
    MOV BYTE PTR ES:[0001H], 0EH

    ; 'O' (4Fh)
    MOV BYTE PTR ES:[0002H], 4FH
    MOV BYTE PTR ES:[0003H], 0EH

    ; 'O' (4Fh)
    MOV BYTE PTR ES:[0004H], 4FH
    MOV BYTE PTR ES:[0005H], 0EH

    ; 'T' (54h)
    MOV BYTE PTR ES:[0006H], 54H
    MOV BYTE PTR ES:[0007H], 0EH

    ; ' ' (20h)
    MOV BYTE PTR ES:[0008H], 20H
    MOV BYTE PTR ES:[0009H], 0EH

    ; 'O' (4Fh) - Acik yesil yazi (0Ah)
    MOV BYTE PTR ES:[000AH], 4FH
    MOV BYTE PTR ES:[000BH], 0AH

    ; 'K' (4Bh)
    MOV BYTE PTR ES:[000CH], 4BH
    MOV BYTE PTR ES:[000DH], 0AH

HANG:
    HLT                 ; Islemciyi durdur
    JMP HANG            ; Bekleme dongusu
`;

export interface WorkspaceEvents {
  onProjectChange?: (project: WorkspaceProject) => void;
  onActiveFileChange?: (file: WorkspaceFile) => void;
  onDocumentChange?: (doc: WorkspaceFile) => void;
  onDocumentListChange?: (docs: WorkspaceFile[]) => void;
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
  private project!: WorkspaceProject;
  private events: WorkspaceEvents;

  constructor(events: WorkspaceEvents = {}) {
    this.events = events;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storage = getSafeStorage();
    if (!storage) {
      this.initDefaultProject();
      return;
    }

    try {
      const saved = storage.getItem(STORAGE_PROJECT_KEY);
      if (saved) {
        const parsed: WorkspaceProject = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.files) && parsed.files.length > 0) {
          this.project = parsed;
          this.ensureIntegrity();
          return;
        }
      }

      // Check legacy v2 docs
      const legacyDocs = storage.getItem(LEGACY_DOCS_KEY) || storage.getItem(LEGACY_V1_KEY);
      if (legacyDocs) {
        const parsedLegacy = JSON.parse(legacyDocs);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const files: WorkspaceFile[] = parsedLegacy
            .filter((d: any) => d && typeof d.code === 'string')
            .map((d: any, idx: number) => ({
              id: String(d.id || `file-${idx}`),
              name: String(d.title || `file${idx + 1}.asm`),
              code: String(d.code),
              isEntry: idx === 0,
              createdAt: Number(d.createdAt || Date.now()),
              lastModified: Number(d.lastModified || Date.now()),
              editorScroll: d.editorScroll
            }));

          if (files.length > 0) {
            this.project = {
              id: 'project-default',
              name: '8086 Projesi',
              entryFileId: files[0].id,
              activeFileId: files[0].id,
              openFileIds: files.map(f => f.id),
              files,
              createdAt: Date.now(),
              lastModified: Date.now()
            };
            this.saveToStorage();
            return;
          }
        }
      }
    } catch {
      // Fallback
    }

    this.initDefaultProject();
  }

  private initDefaultProject(): void {
    const bootFile: WorkspaceFile = {
      id: 'file-boot',
      name: 'boot.asm',
      code: DEFAULT_MAIN_CODE,
      isEntry: true,
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    this.project = {
      id: 'project-default',
      name: '8086 Bare-Metal Sistem',
      entryFileId: bootFile.id,
      activeFileId: bootFile.id,
      openFileIds: [bootFile.id],
      files: [bootFile],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    this.saveToStorage();
  }

  private ensureIntegrity(): void {
    if (!this.project.files || this.project.files.length === 0) {
      this.initDefaultProject();
      return;
    }

    // Ensure entry file exists
    if (!this.project.files.some(f => f.id === this.project.entryFileId)) {
      this.project.entryFileId = this.project.files[0].id;
      this.project.files[0].isEntry = true;
    }

    // Ensure active file exists
    if (!this.project.files.some(f => f.id === this.project.activeFileId)) {
      this.project.activeFileId = this.project.entryFileId;
    }

    // Ensure open file IDs are valid
    this.project.openFileIds = this.project.openFileIds.filter(id =>
      this.project.files.some(f => f.id === id)
    );
    if (this.project.openFileIds.length === 0) {
      this.project.openFileIds = [this.project.activeFileId];
    }
  }

  saveToStorage(): void {
    const storage = getSafeStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(this.project));
    } catch {
      // storage full or disabled
    }
  }

  getProject(): WorkspaceProject {
    return this.project;
  }

  getAllFiles(): WorkspaceFile[] {
    return this.project.files.map(f => ({ ...f, title: f.title || f.name }));
  }

  getAllDocuments(): WorkspaceFile[] {
    return this.getAllFiles();
  }

  getFile(id: string): WorkspaceFile | undefined {
    const f = this.project.files.find(item => item.id === id);
    if (!f) return undefined;
    return { ...f, title: f.title || f.name };
  }

  getDocument(id: string): WorkspaceFile | undefined {
    return this.getFile(id);
  }

  getActiveFile(): WorkspaceFile {
    const file = this.getFile(this.project.activeFileId);
    if (file) return file;
    const first = this.project.files[0];
    return { ...first, title: first.title || first.name };
  }

  getActiveDocument(): WorkspaceFile {
    return this.getActiveFile();
  }

  setActiveDocument(id: string): void {
    this.setActiveFile(id);
  }

  createDocument(name?: string, initialCode?: string): WorkspaceFile {
    return this.createFile(name, initialCode);
  }

  updateDocumentCode(id: string, code: string): void {
    this.updateFileCode(id, code);
  }

  setActiveFile(id: string): void {
    if (this.project.files.some(f => f.id === id)) {
      this.project.activeFileId = id;
      this.openTab(id);
      this.saveToStorage();
      this.events.onActiveFileChange?.(this.getActiveFile());
      this.events.onProjectChange?.(this.project);
    }
  }

  getEntryFile(): WorkspaceFile {
    const file = this.getFile(this.project.entryFileId);
    if (file) return file;
    return this.project.files[0];
  }

  setEntryFile(id: string): void {
    if (this.project.files.some(f => f.id === id)) {
      this.project.entryFileId = id;
      this.project.files.forEach(f => {
        f.isEntry = f.id === id;
      });
      this.saveToStorage();
      this.events.onProjectChange?.(this.project);
    }
  }

  createFile(name?: string, initialCode?: string): WorkspaceFile {
    const count = this.project.files.length + 1;
    let fileName = name ? name.trim() : `file${count}.asm`;
    if (!fileName.endsWith('.asm')) fileName += '.asm';

    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: fileName,
      code: initialCode !== undefined ? initialCode : `; ${fileName}\nORG 2000H\n\n; Kodlarinizi buraya yazin...\n\nRET\n`,
      isEntry: false,
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    this.project.files.push(newFile);
    this.project.activeFileId = newFile.id;
    this.openTab(newFile.id);
    this.saveToStorage();

    this.events.onActiveFileChange?.(newFile);
    this.events.onProjectChange?.(this.project);
    return newFile;
  }

  deleteFile(id: string): boolean {
    if (this.project.files.length <= 1) {
      return false; // Don't delete the last file
    }

    const index = this.project.files.findIndex(f => f.id === id);
    if (index === -1) return false;

    this.project.files.splice(index, 1);
    this.closeTab(id);

    // If deleted file was active, switch active file
    if (this.project.activeFileId === id) {
      const nextActive = this.project.files[Math.max(0, index - 1)];
      this.project.activeFileId = nextActive.id;
      this.openTab(nextActive.id);
      this.events.onActiveFileChange?.(nextActive);
    }

    // If deleted file was entry, update entry
    if (this.project.entryFileId === id) {
      this.setEntryFile(this.project.files[0].id);
    }

    this.saveToStorage();
    this.events.onProjectChange?.(this.project);
    return true;
  }

  renameFile(id: string, newName: string): void {
    const file = this.getFile(id);
    if (!file) return;
    let clean = newName.trim();
    if (!clean) return;
    if (!clean.endsWith('.asm')) clean += '.asm';
    file.name = clean;
    file.lastModified = Date.now();
    this.saveToStorage();
    this.events.onProjectChange?.(this.project);
  }

  updateFileCode(id: string, code: string, editorScroll?: { top: number; left: number }): void {
    const file = this.getFile(id);
    if (!file) return;
    file.code = code;
    file.lastModified = Date.now();
    if (editorScroll) {
      file.editorScroll = editorScroll;
    }
    this.saveToStorage();
  }

  openTab(fileId: string): void {
    if (!this.project.openFileIds.includes(fileId)) {
      this.project.openFileIds.push(fileId);
      this.saveToStorage();
      this.events.onProjectChange?.(this.project);
    }
  }

  closeTab(fileId: string): void {
    const idx = this.project.openFileIds.indexOf(fileId);
    if (idx !== -1) {
      this.project.openFileIds.splice(idx, 1);
      if (this.project.openFileIds.length === 0) {
        this.project.openFileIds = [this.project.files[0].id];
      }
      if (this.project.activeFileId === fileId) {
        const nextId = this.project.openFileIds[Math.max(0, idx - 1)] || this.project.openFileIds[0];
        this.setActiveFile(nextId);
      } else {
        this.saveToStorage();
        this.events.onProjectChange?.(this.project);
      }
    }
  }
}
