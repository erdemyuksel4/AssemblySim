/**
 * studyData.ts
 * 
 * 8086 Assembly Kapsamlı ve Damıtılmış Müfredat & Zihin Haritası Veri Modeli.
 * 15 Ana Konu ve Adım Adım Mikro-Dersler + Anında Kodlama Görevleri içeren modüler müfredat mimarisi.
 */

export interface ConceptQuiz {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyTask {
  id: string;
  title: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  scenario: string;
  taskPrompt: string;
  starterCode: string;
  solutionCode: string;
  hints: string[];
  testSetup?: {
    initialRegisters?: Record<string, number>;
    initialMemory?: Array<{ segment: number; offset: number; bytes: number[] }>;
  };
  assertions: {
    registers?: Record<string, number>;
    flags?: Record<string, number>;
    memory?: Array<{ segment: number; offset: number; expectedBytes: number[] }>;
    maxSteps?: number;
  };
  examTip?: string;
}

export interface MicroLessonStep {
  id: string;
  stepNumber: string;
  title: string;
  titleEn?: string;
  explanationHtml: string;
  explanationHtmlEn?: string;
  task: StudyTask;
}

export type CurriculumCategory = 'primary' | 'secondary';

export interface SubLesson {
  id: string;
  number: string;
  title: string;
  titleEn?: string;
  summary: string;
  summaryEn?: string;
  microSteps?: MicroLessonStep[];
  theoryHtml: string;
  theoryHtmlEn?: string;
  quiz?: ConceptQuiz;
  task?: StudyTask;
}

export interface MainTopic {
  id: string;
  number: number;
  category: CurriculumCategory;
  weekNumber?: number;
  weekLabel: string;
  title: string;
  titleEn?: string;
  shortTitle: string;
  shortTitleEn?: string;
  badge: string;
  badgeEn?: string;
  icon: string;
  summary: string;
  summaryEn?: string;
  opcodes: string[];
  mindMap: {
    x: number;
    y: number;
    connections: string[];
  };
  subLessons: SubLesson[];
}

import { TOPICS_M1 } from './topics_m1.js';
import { TOPICS_M2 } from './topics_m2.js';
import { TOPICS_M3 } from './topics_m3.js';
import { TOPICS_M4 } from './topics_m4.js';
import { TOPICS_M5 } from './topics_m5.js';

/**
 * 5-Row x 3-Column Serpentine Mind Map Layout:
 * Row 1 (y: 10%): T1 (18%) -> T2 (50%) -> T3 (82%)
 * Row 2 (y: 28%): T6 (18%) <- T5 (50%) <- T4 (82%)
 * Row 3 (y: 46%): T7 (18%) -> T8 (50%) -> T9 (82%)
 * Row 4 (y: 64%): T12 (18%) <- T11 (50%) <- T10 (82%)
 * Row 5 (y: 82%): T13 (18%) -> T14 (50%) -> T15 (82%)
 */
const SERPENTINE_LAYOUT: Record<number, { x: number; y: number; connections: string[] }> = {
  1: { x: 18, y: 10, connections: ['topic-2-architecture-and-segmentation'] },
  2: { x: 50, y: 10, connections: ['topic-3-addressing-modes'] },
  3: { x: 82, y: 10, connections: ['topic-4-data-movement-instructions'] },
  4: { x: 82, y: 28, connections: ['topic-5-arithmetic-and-logic'] },
  5: { x: 50, y: 28, connections: ['topic-6-program-control-instructions'] },
  6: { x: 18, y: 28, connections: ['topic-7-input-output-and-dma'] },
  7: { x: 18, y: 46, connections: ['topic-8-gecen-yil-pipeline-and-bus-cycles'] },
  8: { x: 50, y: 46, connections: ['topic-9-gecen-yil-endian-and-flags-lab'] },
  9: { x: 82, y: 46, connections: ['topic-10-gecen-yil-stack-and-arrays-lab'] },
  10: { x: 82, y: 64, connections: ['topic-11-gecen-yil-arithmetic-and-scas-lab'] },
  11: { x: 50, y: 64, connections: ['topic-12-gecen-yil-bcd-and-ascii-math'] },
  12: { x: 18, y: 64, connections: ['topic-13-interrupts-and-ivt'] },
  13: { x: 18, y: 82, connections: ['topic-14-dma-and-os-support'] },
  14: { x: 50, y: 82, connections: ['topic-15-advanced-architectures'] },
  15: { x: 82, y: 82, connections: [] },
};

const ALL_TOPICS: MainTopic[] = [
  ...TOPICS_M1,
  ...TOPICS_M2,
  ...TOPICS_M3,
  ...TOPICS_M4,
  ...TOPICS_M5,
];

export const STUDY_TOPICS: MainTopic[] = ALL_TOPICS.map((topic, index) => {
  const num = topic.number || (index + 1);
  const layout = SERPENTINE_LAYOUT[num] || topic.mindMap;
  return {
    ...topic,
    number: num,
    mindMap: {
      x: layout.x,
      y: layout.y,
      connections: layout.connections,
    },
  };
});
