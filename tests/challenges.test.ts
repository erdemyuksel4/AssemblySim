import { describe, it, expect, beforeEach } from 'vitest';
import { CpuInstanceManager } from '../src/cpu/instanceManager.js';
import { WorkspaceManager } from '../src/workspace/workspaceManager.js';
import { ChallengeRunner } from '../src/challenges/runner.js';
import { Challenge } from '../src/challenges/types.js';

describe('CpuInstanceManager', () => {
  let manager: CpuInstanceManager;

  beforeEach(() => {
    manager = new CpuInstanceManager();
  });

  it('should initialize with a default CPU instance', () => {
    const def = manager.getDefaultInstance();
    expect(def).toBeDefined();
    expect(def.isDefault).toBe(true);
    expect(def.id).toBe('cpu-default');
    expect(manager.getAllInstances().length).toBe(1);
  });

  it('should create unlimited isolated CPU instances with unique colors', () => {
    const cpu1 = manager.createInstance('Görev: XCHG');
    const cpu2 = manager.createInstance('Görev: ADD');

    expect(cpu1.id).not.toBe(cpu2.id);
    expect(cpu1.cpu).not.toBe(cpu2.cpu);
    expect(manager.getAllInstances().length).toBe(3);

    // Modifying cpu1 should NOT affect cpu2
    cpu1.cpu.regs.ax = 0x1234;
    expect(cpu2.cpu.regs.ax).toBe(0x0000);
  });

  it('should prevent deleting the default CPU instance', () => {
    const success = manager.removeInstance('cpu-default');
    expect(success).toBe(false);
    expect(manager.getDefaultInstance()).toBeDefined();
  });

  it('should reset a specific instance without affecting others', () => {
    const cpu1 = manager.createInstance('Test CPU');
    cpu1.cpu.regs.bx = 0xABCD;
    manager.resetInstance(cpu1.id);
    expect(cpu1.cpu.regs.bx).toBe(0x0000);
  });

  it('should rename an instance', () => {
    const cpu1 = manager.createInstance('Eski Ad');
    manager.renameInstance(cpu1.id, 'Yeni İsim');
    expect(manager.getInstance(cpu1.id)?.name).toBe('Yeni İsim');
  });
});

describe('WorkspaceManager', () => {
  let cpuManager: CpuInstanceManager;
  let workspace: WorkspaceManager;

  beforeEach(() => {
    // Clear localStorage mock if present
    try {
      localStorage.clear();
    } catch (e) {}

    cpuManager = new CpuInstanceManager();
    workspace = new WorkspaceManager(cpuManager);
  });

  it('should initialize with default main.asm', () => {
    const active = workspace.getActiveDocument();
    expect(active).toBeDefined();
    expect(active.id).toBe('doc-main');
    expect(active.title).toBe('main.asm');
  });

  it('should open a new challenge document with its own dedicated CPU instance', () => {
    const doc = workspace.openDocument({
      title: 'Görev 1: XCHG',
      type: 'challenge',
      code: 'XCHG AX, BX\nHLT',
      challengeId: 'xchg-swap'
    });

    expect(doc).toBeDefined();
    expect(doc.challengeId).toBe('xchg-swap');
    expect(doc.cpuInstanceId).not.toBe('cpu-default');

    // That CPU instance must exist in cpuManager
    const assignedCpu = cpuManager.getInstance(doc.cpuInstanceId);
    expect(assignedCpu).toBeDefined();
    expect(workspace.getActiveDocument().id).toBe(doc.id);
  });

  it('should switch back to existing document if opened again', () => {
    const doc1 = workspace.openDocument({
      title: 'Görev 1',
      type: 'challenge',
      code: 'MOV AX, 1',
      challengeId: 'task-1'
    });

    workspace.openDocument({
      title: 'Görev 2',
      type: 'challenge',
      code: 'MOV BX, 2',
      challengeId: 'task-2'
    });

    expect(workspace.getActiveDocument().challengeId).toBe('task-2');

    // Re-opening doc1 should activate it without creating duplicates
    workspace.openDocument({
      title: 'Görev 1',
      type: 'challenge',
      code: 'MOV AX, 1',
      challengeId: 'task-1'
    });

    expect(workspace.getActiveDocument().id).toBe(doc1.id);
  });
});

describe('ChallengeRunner', () => {
  const swapChallenge: Challenge = {
    id: 'test-swap',
    title: 'Register Swap Test',
    milestoneId: 'm1',
    difficulty: 'Kolay',
    opcodes: ['XCHG'],
    scenario: 'Takas testi',
    task: 'AX ve BX değerlerini takas edin',
    starterCode: '; Kodu yazin\nHLT',
    hints: ['XCHG komutunu kullanin'],
    testSetup: {
      initialRegisters: {
        ax: 0x1111,
        bx: 0x2222
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 0x2222,
        bx: 0x1111
      }
    }
  };

  it('should evaluate a correct solution as PASSED', () => {
    const code = `
      XCHG AX, BX
      HLT
    `;

    const result = ChallengeRunner.grade(swapChallenge, code);
    expect(result.status).toBe('PASSED');
    expect(result.success).toBe(true);
    expect(result.diffs.every(d => d.passed)).toBe(true);
  });

  it('should detect wrong register values and generate precise diff', () => {
    const wrongCode = `
      MOV AX, 03333H
      HLT
    `;

    const result = ChallengeRunner.grade(swapChallenge, wrongCode);
    expect(result.status).toBe('FAILED');
    expect(result.success).toBe(false);

    const axDiff = result.diffs.find(d => d.target === 'Yazmaç AX');
    expect(axDiff).toBeDefined();
    expect(axDiff?.passed).toBe(false);
    expect(axDiff?.actual).toContain('3333h');
  });

  it('should catch compilation syntax errors with line number', () => {
    const syntaxErrorCode = `
      MOV AX,
      HLT
    `;

    const result = ChallengeRunner.grade(swapChallenge, syntaxErrorCode);
    expect(result.status).toBe('COMPILE_ERROR');
    expect(result.success).toBe(false);
    expect(result.compileError).toBeDefined();
  });

  it('should catch infinite loops with TIMEOUT guard', () => {
    const loopCode = `
      DONGU:
        JMP DONGU
    `;

    const loopChallenge: Challenge = {
      ...swapChallenge,
      assertions: {
        ...swapChallenge.assertions,
        maxSteps: 100 // low limit for quick test
      }
    };

    const result = ChallengeRunner.grade(loopChallenge, loopCode);
    expect(result.status).toBe('TIMEOUT');
    expect(result.success).toBe(false);
    expect(result.stepCount).toBe(100);
  });

  it('should verify 8-bit registers and FLAGS correctly', () => {
    const flagChallenge: Challenge = {
      id: 'test-flags',
      title: 'Flags Test',
      milestoneId: 'm1',
      difficulty: 'Kolay',
      opcodes: ['CMP'],
      scenario: 'Test',
      task: 'Test',
      starterCode: '',
      hints: [],
      testSetup: {},
      assertions: {
        expectedRegisters: {
          al: 0x55,
          ah: 0x00
        },
        expectedFlags: {
          zf: 1,
          cf: 0
        }
      }
    };

    const code = `
      MOV AL, 55H
      MOV AH, 00H
      CMP AL, 55H      ; ZF=1, CF=0
      HLT
    `;

    const result = ChallengeRunner.grade(flagChallenge, code);
    expect(result.status).toBe('PASSED');
    expect(result.success).toBe(true);
  });

  describe('Comprehensive Built-in Challenges Verification', () => {
    it('should have consistent milestones and challenge references', async () => {
      const { ROADMAP_MILESTONES, CHALLENGES } = await import('../src/challenges/challengesData.js');
      expect(ROADMAP_MILESTONES.length).toBeGreaterThan(0);
      
      for (const m of ROADMAP_MILESTONES) {
        expect(m.topics.length).toBeGreaterThan(0);
        for (const topic of m.topics) {
          expect(topic.challengeIds.length).toBeGreaterThan(0);
          for (const chId of topic.challengeIds) {
            expect(CHALLENGES[chId]).toBeDefined();
            expect(CHALLENGES[chId].milestoneId).toBe(m.id);
          }
        }
      }
    });

    it('every built-in challenge should pass when its solutionCode is evaluated', async () => {
      const { CHALLENGES } = await import('../src/challenges/challengesData.js');
      const challengeList = Object.values(CHALLENGES);
      expect(challengeList.length).toBeGreaterThanOrEqual(15);

      for (const ch of challengeList) {
        expect(ch.solutionCode).toBeDefined();
        const res = ChallengeRunner.grade(ch, ch.solutionCode!);
        if (!res.success) {
          console.error(`Challenge ${ch.id} failed:`, res);
        }
        expect(res.status).toBe('PASSED');
        expect(res.success).toBe(true);
      }
    });
  });
});

