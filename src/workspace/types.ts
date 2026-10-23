export type DocumentType = 'custom' | 'challenge' | 'example' | 'lecture' | 'reference';

export interface WorkspaceDocument {
  id: string;
  title: string;
  type: DocumentType;
  code: string;
  cpuInstanceId: string;
  challengeId?: string;
  milestoneId?: string;
  referenceTab?: 'manual' | 'lectures' | 'leetcode' | 'roadmap';
  createdAt: number;
  lastModified: number;
}
