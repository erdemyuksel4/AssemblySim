export type DocumentType = 'custom' | 'challenge' | 'example';

export interface WorkspaceDocument {
  id: string;
  title: string;
  type: DocumentType;
  code: string;
  cpuInstanceId: string;
  challengeId?: string;
  createdAt: number;
  lastModified: number;
}
