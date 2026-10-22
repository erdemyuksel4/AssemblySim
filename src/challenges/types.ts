export type DifficultyLevel = 'Kolay' | 'Orta' | 'Zor';

export type ChallengeStatus = 
  | 'PASSED'
  | 'FAILED'
  | 'COMPILE_ERROR'
  | 'TIMEOUT'
  | 'RUNTIME_ERROR';

export interface RegisterExpectations {
  ax?: number;
  bx?: number;
  cx?: number;
  dx?: number;
  si?: number;
  di?: number;
  bp?: number;
  sp?: number;
  cs?: number;
  ds?: number;
  ss?: number;
  es?: number;
  al?: number;
  ah?: number;
  bl?: number;
  bh?: number;
  cl?: number;
  ch?: number;
  dl?: number;
  dh?: number;
}

export interface FlagExpectations {
  cf?: number;
  zf?: number;
  sf?: number;
  of?: number;
  pf?: number;
  af?: number;
  df?: number;
}

export interface MemoryExpectation {
  segment: number;
  offset: number;
  expectedBytes: number[];
  label?: string;
}

export interface ConsoleExpectation {
  exactMatch?: string;
  contains?: string;
}

export interface ChallengeTestSetup {
  initialRegisters?: RegisterExpectations;
  initialMemory?: Array<{ segment: number; offset: number; bytes: number[] }>;
  initialFlags?: FlagExpectations;
  inputQueue?: string;
}

export interface ChallengeAssertion {
  expectedRegisters?: RegisterExpectations;
  expectedFlags?: FlagExpectations;
  expectedMemory?: MemoryExpectation[];
  expectedConsole?: ConsoleExpectation;
  maxSteps?: number;
}

export interface AssertionDiff {
  target: string;
  expected: string;
  actual: string;
  passed: boolean;
  message?: string;
}

export interface GradingResult {
  status: ChallengeStatus;
  success: boolean;
  stepCount: number;
  diffs: AssertionDiff[];
  compileError?: {
    line: number;
    message: string;
  };
  runtimeError?: string;
  executionTimeMs: number;
}

export interface Challenge {
  id: string;
  title: string;
  milestoneId: string;
  difficulty: DifficultyLevel;
  opcodes: string[];
  scenario: string;
  task: string;
  starterCode: string;
  hints: string[];
  solutionCode?: string;
  testSetup: ChallengeTestSetup;
  assertions: ChallengeAssertion;
}

export interface RoadmapMilestone {
  id: string;
  number: number;
  title: string;
  description: string;
  topics: Array<{
    id: string;
    title: string;
    opcodes: string[];
    description: string;
    challengeIds: string[];
  }>;
}
