export interface WorkspaceFile {
  id: string;
  name: string;        // örn: 'main.asm', 'ekran.asm'
  title?: string;      // alias for name
  code: string;
  isEntry?: boolean;   // CS:IP başlangıç/giriş dosyası mı?
  createdAt: number;
  lastModified: number;
  editorScroll?: { top: number; left: number };
}

export type WorkspaceDocument = WorkspaceFile;

export interface WorkspaceProject {
  id: string;
  name: string;
  entryFileId: string;
  activeFileId: string;
  openFileIds: string[];
  files: WorkspaceFile[];
  createdAt: number;
  lastModified: number;
}
