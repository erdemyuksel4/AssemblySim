import { WorkspaceFile, WorkspaceProject } from './types.js';

const STORAGE_PROJECT_KEY = 'assemblysim_project_v6';
const LEGACY_PROJECT_V5 = 'assemblysim_project_v5';
const LEGACY_PROJECT_V4 = 'assemblysim_project_v4';
const LEGACY_PROJECT_V3 = 'assemblysim_project_v3';
const LEGACY_DOCS_KEY = 'assemblysim_docs_v2';
const LEGACY_V1_KEY = 'assemblysim_workspace_docs_v1';

export const DEFAULT_MAIN_CODE = `; 8086 Assembly Program
ORG 100H

START:
    MOV AX, 0
    ; Kodlarinizi buraya yazin...

    HLT
`;

export const DEFAULT_CONSOLE_CODE = `; ==========================================================
; 8086 Etkilesimli Komut Konsolu (console.asm)
; Basit Mini-Shell / Komut Satiri Yorumlayicisi
; Calistirmak icin: Sag ustten 'Calistir' (F5) butonuna basin.
; Klavyeden komut yazip Enter'a basin!
; ==========================================================
ORG 100H

START:
    ; Segmentleri ayarla
    MOV AX, CS
    MOV DS, AX
    MOV ES, AX

    ; Ekrani temizle (80x25 Renkli Standart Metin Modu)
    MOV AX, 0003H
    INT 10H

    ; Karsilama Basligini Ekrana Bas
    LEA DX, MSG_BANNER
    MOV AH, 09H
    INT 21H

PROMPT_LOOP:
    ; Komut Istemi Yaz: "8086> "
    LEA DX, MSG_PROMPT
    MOV AH, 09H
    INT 21H

    ; Klavyeden tek karakter oku ve ekrana bas (INT 21h, AH=01h)
    MOV AH, 01H
    INT 21H

    ; Enter tusu kontrolu (ASCII 13 / 0Dh veya 10 / 0Ah)
    CMP AL, 0DH
    JE NEW_LINE
    CMP AL, 0AH
    JE NEW_LINE

    ; Komut Karakterlerini Denetle:
    ; 'H' veya 'h' -> HELP
    CMP AL, 'H'
    JE DO_HELP
    CMP AL, 'h'
    JE DO_HELP

    ; 'C' veya 'c' -> CLS (Ekrani Temizle)
    CMP AL, 'C'
    JE DO_CLS
    CMP AL, 'c'
    JE DO_CLS

    ; 'D' veya 'd' -> DRAW (VGA Mode 13h Grafik Cizimi)
    CMP AL, 'D'
    JE DO_DRAW
    CMP AL, 'd'
    JE DO_DRAW

    ; 'V' veya 'v' -> VER (Surum Bilgisi)
    CMP AL, 'V'
    JE DO_VER
    CMP AL, 'v'
    JE DO_VER

    ; 'Q' veya 'q' -> QUIT (HLT ile durdur)
    CMP AL, 'Q'
    JE DO_QUIT
    CMP AL, 'q'
    JE DO_QUIT

    ; Tanimlanmayan bir tusa basildi:
    LEA DX, MSG_UNKNOWN
    MOV AH, 09H
    INT 21H
    JMP PROMPT_LOOP

NEW_LINE:
    LEA DX, MSG_CRLF
    MOV AH, 09H
    INT 21H
    JMP PROMPT_LOOP

DO_HELP:
    LEA DX, MSG_HELP
    MOV AH, 09H
    INT 21H
    JMP PROMPT_LOOP

DO_VER:
    LEA DX, MSG_VER
    MOV AH, 09H
    INT 21H
    JMP PROMPT_LOOP

DO_CLS:
    MOV AX, 0003H
    INT 10H
    LEA DX, MSG_BANNER
    MOV AH, 09H
    INT 21H
    JMP PROMPT_LOOP

DO_DRAW:
    ; VGA 320x200 256 Renk Moduna Gec
    MOV AX, 0013H
    INT 10H

    ; Ekrana Parlak Sari Kutu Ciz (X: 120..200, Y: 80..120)
    MOV DX, 80
DRAW_Y:
    MOV CX, 120
DRAW_X:
    MOV AH, 0CH
    MOV AL, 0EH         ; Sari Renk
    MOV BH, 0
    INT 10H
    INC CX
    CMP CX, 200
    JNE DRAW_X
    INC DX
    CMP DX, 120
    JNE DRAW_Y

    ; Konsol durum mesaji
    LEA DX, MSG_DRAW_OK
    MOV AH, 09H
    INT 21H
    JMP PROMPT_LOOP

DO_QUIT:
    LEA DX, MSG_BYE
    MOV AH, 09H
    INT 21H
QUIT_HANG:
    HLT
    JMP QUIT_HANG

; ==========================================================
; METIN SABITLERI (DOS $-Sonlandirmali Dizgiler)
; ==========================================================
MSG_BANNER  DB 0DH, 0AH, "========================================", 0DH, 0AH
            DB " 8086 INTERAKTIF KOMUT KONSOLU (v1.0)", 0DH, 0AH
            DB " Komutlar: [H]elp, [C]ls, [D]raw, [V]er, [Q]uit", 0DH, 0AH
            DB "========================================", 0DH, 0AH, "$"

MSG_PROMPT  DB 0DH, 0AH, "8086> $"
MSG_CRLF    DB 0DH, 0AH, "$"
MSG_UNKNOWN DB 0DH, 0AH, " ? Bilinmeyen komut! 'H' basarak yardim alin.", 0DH, 0AH, "$"

MSG_HELP    DB 0DH, 0AH, " --- YARDIM MENUSU ---", 0DH, 0AH
            DB " H - Bu yardim menusunu listeler", 0DH, 0AH
            DB " C - Ekrani temizler (CLS)", 0DH, 0AH
            DB " D - VGA Mode 13h grafik cizimi yapar", 0DH, 0AH
            DB " V - Isletim sistemi surumunu gosterir", 0DH, 0AH
            DB " Q - Konsolu kapatir ve CPU'yu durdurur", 0DH, 0AH, "$"

MSG_VER     DB 0DH, 0AH, " AssemblySim 8086 Bare-Metal Shell v1.0 [1981-2026]", 0DH, 0AH, "$"
MSG_DRAW_OK DB 0DH, 0AH, " [VGA Mode 13h Kutu Cizildi! C basarak metne donebilirsiniz]", 0DH, 0AH, "$"
MSG_BYE     DB 0DH, 0AH, " Konsol kapatildi. Islemci durduruldu (HLT).", 0DH, 0AH, "$"
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
      let saved = storage.getItem(STORAGE_PROJECT_KEY);
      if (!saved) {
        saved = storage.getItem(LEGACY_PROJECT_V5);
      }
      if (!saved) {
        saved = storage.getItem(LEGACY_PROJECT_V4);
      }
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
    const mainFile: WorkspaceFile = {
      id: 'file-main',
      name: 'main.asm',
      code: DEFAULT_MAIN_CODE,
      isEntry: true,
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    this.project = {
      id: 'project-default',
      name: '8086 Projesi',
      entryFileId: mainFile.id,
      activeFileId: mainFile.id,
      openFileIds: [mainFile.id],
      files: [mainFile],
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

    // Clean up legacy console.asm if it contains default mini-shell code
    const legacyConsoleIdx = this.project.files.findIndex(
      f => f.name === 'console.asm' && f.code.includes('MSG_BANNER')
    );
    if (legacyConsoleIdx !== -1) {
      const consoleFile = this.project.files[legacyConsoleIdx];
      this.project.files.splice(legacyConsoleIdx, 1);
      this.project.openFileIds = this.project.openFileIds.filter(id => id !== consoleFile.id);
    }

    // Clean up legacy bootloader if it's the default baremetal template
    const legacyBoot = this.project.files.find(
      f => f.name === 'boot.asm' && f.code.includes('8086 Bare-Metal Bootloader')
    );
    if (legacyBoot) {
      legacyBoot.name = 'main.asm';
      legacyBoot.code = DEFAULT_MAIN_CODE;
    }

    if (this.project.files.length === 0) {
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
      this.project.activeFileId = this.project.files[0].id;
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
      code: initialCode !== undefined ? initialCode : `; ${fileName}\nORG 100H\n\nSTART:\n    ; Kodlarinizi buraya yazin...\n\n    HLT\n`,
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
    const index = this.project.files.findIndex(f => f.id === id);
    if (index === -1) return false;

    if (this.project.files.length === 1) {
      // If deleting the only remaining file, reset it to clean main.asm
      const file = this.project.files[0];
      file.name = 'main.asm';
      file.code = DEFAULT_MAIN_CODE;
      file.lastModified = Date.now();
      this.saveToStorage();
      this.events.onActiveFileChange?.(file);
      this.events.onProjectChange?.(this.project);
      return true;
    }

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

  private getInternalFile(id: string): WorkspaceFile | undefined {
    return this.project.files.find(item => item.id === id);
  }

  renameFile(id: string, newName: string): void {
    const file = this.getInternalFile(id);
    if (!file) return;
    let clean = newName.trim();
    if (!clean) return;
    if (!clean.endsWith('.asm')) clean += '.asm';
    file.name = clean;
    file.lastModified = Date.now();
    this.saveToStorage();
    this.events.onProjectChange?.(this.project);
  }

  updateFileCode(
    id: string,
    code: string,
    editorScroll?: { top: number; left: number },
    editorCursor?: { start: number; end: number }
  ): void {
    const file = this.getInternalFile(id);
    if (!file) return;
    file.code = code;
    file.lastModified = Date.now();
    if (editorScroll) {
      file.editorScroll = editorScroll;
    }
    if (editorCursor) {
      file.editorCursor = editorCursor;
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
