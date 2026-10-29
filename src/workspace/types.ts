export type DocumentType = 'custom' | 'challenge' | 'example' | 'lecture' | 'reference' | 'os_file' | 'os_sandbox';

export type OSFileRole = 'boot' | 'kernel' | 'screen' | 'keyboard' | 'shell' | 'interrupts' | 'custom';

export interface OSProject {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  isCollapsed?: boolean;
  activeFileId?: string;
  fileDocIds: string[];
}

export interface WorkspaceDocument {
  id: string;
  title: string;
  type: DocumentType;
  code: string;
  cpuInstanceId: string;
  challengeId?: string;
  milestoneId?: string;
  referenceTab?: 'manual' | 'lectures' | 'leetcode' | 'roadmap' | 'studynotes';
  osProjectId?: string;
  osRole?: OSFileRole;
  createdAt: number;
  lastModified: number;
  scrollTop?: number;
  editorScroll?: { top: number; left: number };
}
