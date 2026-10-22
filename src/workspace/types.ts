export type DocumentType = 'custom' | 'challenge' | 'example' | 'lecture';

export interface WorkspaceDocument {
  id: string;
  title: string;
  type: DocumentType;
  code: string;
  cpuInstanceId: string;
  challengeId?: string;
  milestoneId?: string;
  createdAt: number;
  lastModified: number;
}
