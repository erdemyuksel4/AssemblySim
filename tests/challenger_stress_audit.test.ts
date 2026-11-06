import { describe, it, expect } from 'vitest';
import { STUDY_TOPICS } from '../src/study/studyData.js';
import { StudyRunner } from '../src/study/studyRunner.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('Empirical Challenger Audit: 45 StudyTasks Stress Harness', () => {
  // Extract all 45 tasks
  const allTasks: {
    topicNumber: number;
    topicTitle: string;
    subLessonId: string;
    task: NonNullable<(typeof STUDY_TOPICS)[0]['subLessons'][0]['task']>;
  }[] = [];

  for (const topic of STUDY_TOPICS) {
    for (const sub of topic.subLessons) {
      if (sub.task) {
        allTasks.push({
          topicNumber: topic.number,
          topicTitle: topic.title,
          subLessonId: sub.id,
          task: sub.task,
        });
      }
    }
  }

  it('Verifies inventory: exactly 45 tasks across 15 topics', () => {
    expect(STUDY_TOPICS.length).toBe(15);
    expect(allTasks.length).toBe(45);
    const taskIds = new Set(allTasks.map(t => t.task.id));
    expect(taskIds.size).toBe(45);
  });

  it('Empirical Check 1: Zero Starter Codes are Pre-Solved', () => {
    const preSolved: string[] = [];

    for (const { task, topicNumber } of allTasks) {
      const res = StudyRunner.grade(task, task.starterCode);
      if (res.success) {
        preSolved.push(`Topic ${topicNumber}: Task ${task.id}`);
      }
    }

    expect(preSolved, `Pre-solved tasks found: ${preSolved.join(', ')}`).toEqual([]);
  });

  it('Empirical Check 2: 100% Rejection of Dummy Code (ORG 100h / HLT)', () => {
    const dummyCode = 'ORG 100h\nHLT';
    const falsePasses: string[] = [];

    for (const { task, topicNumber } of allTasks) {
      const res = StudyRunner.grade(task, dummyCode);
      if (res.success) {
        falsePasses.push(`Topic ${topicNumber}: Task ${task.id}`);
      }
    }

    expect(falsePasses, `Dummy code false passes: ${falsePasses.join(', ')}`).toEqual([]);
  });

  it('Empirical Check 3: 100% Rejection of Alternate Dummies (NOP/HLT, RET, Empty)', () => {
    const dummyNOP = 'ORG 100h\nNOP\nHLT';
    const dummyRET = 'ORG 100h\nRET';
    const dummyEmpty = '   ';

    const falsePassNOP: string[] = [];
    const falsePassRET: string[] = [];
    const falsePassEmpty: string[] = [];

    for (const { task, topicNumber } of allTasks) {
      const resNop = StudyRunner.grade(task, dummyNOP);
      if (resNop.success) falsePassNOP.push(`Topic ${topicNumber}: Task ${task.id}`);

      const resRet = StudyRunner.grade(task, dummyRET);
      if (resRet.success) falsePassRET.push(`Topic ${topicNumber}: Task ${task.id}`);

      const resEmpty = StudyRunner.grade(task, dummyEmpty);
      if (resEmpty.success) falsePassEmpty.push(`Topic ${topicNumber}: Task ${task.id}`);
    }

    expect(falsePassNOP, `NOP dummy false passes: ${falsePassNOP.join(', ')}`).toEqual([]);
    expect(falsePassRET, `RET dummy false passes: ${falsePassRET.join(', ')}`).toEqual([]);
    expect(falsePassEmpty, `Empty code false passes: ${falsePassEmpty.join(', ')}`).toEqual([]);
  });

  it('Empirical Check 4: 100% of Solutions Pass Grading in < 3000 Steps', () => {
    const failedSolutions: string[] = [];
    const stepOutliers: string[] = [];
    const taskReport: {
      topic: number;
      taskId: string;
      title: string;
      difficulty: string;
      steps: number;
      maxAllowed: number;
      assertions: string;
    }[] = [];

    for (const { task, topicNumber } of allTasks) {
      const maxAllowed = task.assertions.maxSteps || 3000;
      const res = StudyRunner.grade(task, task.solutionCode);

      const assertionKeys: string[] = [];
      if (task.assertions.registers) {
        assertionKeys.push(`regs:[${Object.keys(task.assertions.registers).join(',')}]`);
      }
      if (task.assertions.flags) {
        assertionKeys.push(`flags:[${Object.keys(task.assertions.flags).join(',')}]`);
      }
      if (task.assertions.memory) {
        assertionKeys.push(`mem:[${task.assertions.memory.map(m => `${m.segment}:${m.offset}`).join(',')}]`);
      }

      if (!res.success) {
        failedSolutions.push(`Topic ${topicNumber}: Task ${task.id} -> ${res.message} (status: ${res.status})`);
      } else {
        taskReport.push({
          topic: topicNumber,
          taskId: task.id,
          title: task.title,
          difficulty: task.difficulty,
          steps: res.steps,
          maxAllowed,
          assertions: assertionKeys.join(' '),
        });

        if (res.steps >= 3000 || res.steps > maxAllowed) {
          stepOutliers.push(`Topic ${topicNumber}: Task ${task.id} took ${res.steps} steps (limit: ${maxAllowed})`);
        }
      }
    }

    console.log(`\n=== 45 STUDY TASKS EMPIRICAL AUDIT REPORT ===`);
    console.log(`Total Tasks: ${taskReport.length} / 45`);
    for (const item of taskReport) {
      console.log(
        `[T${item.topic.toString().padStart(2, '0')}] ${item.taskId.padEnd(32)} | Steps: ${item.steps
          .toString()
          .padStart(4)} / ${item.maxAllowed} | Diff: ${item.difficulty.padEnd(5)} | ${item.assertions}`
      );
    }

    const sortedBySteps = [...taskReport].sort((a, b) => b.steps - a.steps);
    console.log(`\nStep Summary:`);
    console.log(`  - Max steps taken: ${sortedBySteps[0]?.taskId} = ${sortedBySteps[0]?.steps} steps`);
    console.log(`  - Median steps: ${sortedBySteps[Math.floor(sortedBySteps.length / 2)]?.steps} steps`);
    console.log(`  - Min steps taken: ${sortedBySteps[sortedBySteps.length - 1]?.taskId} = ${sortedBySteps[sortedBySteps.length - 1]?.steps} steps`);

    expect(failedSolutions, `Failing solutions: ${failedSolutions.join('\n')}`).toEqual([]);
    expect(stepOutliers, `Step budget exceeded: ${stepOutliers.join('\n')}`).toEqual([]);
    expect(taskReport.length).toBe(45);
  });

  it('Empirical Check 5: Timeout Trap on Infinite Loop across all 45 tasks', () => {
    const infiniteCode = 'ORG 100h\nhang:\nJMP hang';
    const notTimedOut: string[] = [];

    for (const { task, topicNumber } of allTasks) {
      const res = StudyRunner.grade(task, infiniteCode);
      if (res.success || res.status !== 'TIMEOUT') {
        notTimedOut.push(`Topic ${topicNumber}: Task ${task.id} (got status: ${res.status}, success: ${res.success})`);
      }
    }

    expect(notTimedOut, `Tasks failing timeout trap: ${notTimedOut.join(', ')}`).toEqual([]);
  });

  it('Empirical Check 6: Assertion Non-Triviality (No Vacuous Assertions)', () => {
    const vacuousTasks: string[] = [];

    for (const { task, topicNumber } of allTasks) {
      const a = task.assertions;
      const hasRegs = a.registers && Object.keys(a.registers).length > 0;
      const hasFlags = a.flags && Object.keys(a.flags).length > 0;
      const hasMemory = a.memory && a.memory.length > 0;

      if (!hasRegs && !hasFlags && !hasMemory) {
        vacuousTasks.push(`Topic ${topicNumber}: Task ${task.id} has NO state assertions!`);
      }
    }

    expect(vacuousTasks, `Vacuous tasks found: ${vacuousTasks.join(', ')}`).toEqual([]);
  });

  it('Empirical Check 7: Fault Injection / Targeted Decisive Mutation Rejection', () => {
    // For every task, introduce a deliberate semantic/algorithmic fault into the solution
    // and verify that the grading engine 100% detects and rejects the corrupt implementation.
    const undetectedMutations: string[] = [];

    for (const { task, topicNumber } of allTasks) {
      let mutatedCode = '';

      // Specific known edge cases:
      if (task.id === 'task-3-1-reg-init') {
        mutatedCode = task.solutionCode.replace('2222h', '2223h');
      } else if (task.id === 'task-3-2-flush-pipeline') {
        mutatedCode = task.solutionCode.replace('1234h', '1235h');
      } else if (task.id === 'task-5-1-base-plus-index') {
        mutatedCode = task.solutionCode.replace('77h', '78h');
      } else if (task.id === 'task-5-2-indirect-jump') {
        mutatedCode = task.solutionCode.replace('0001h', '0002h');
      } else if (task.id === 'task-8-2-cmp-flags') {
        mutatedCode = task.solutionCode.replace('CMP AX, BX', 'CMP BX, AX');
      } else if (task.id === 'task-10-1-xor-zero') {
        mutatedCode = task.solutionCode.replace('XOR AX, AX', 'OR AX, AX');
      } else if (task.id === 'task-11-1-jump-max') {
        mutatedCode = task.solutionCode.replace('MOV AX, BX', 'MOV AX, 0');
      } else {
        // General mutation strategy: modify the last instruction before HLT
        const lines = task.solutionCode.split('\n');
        const hltIdx = lines.findIndex(l => l.trim().toUpperCase() === 'HLT');
        if (hltIdx > 0) {
          // Mutate the line right before HLT
          const targetLine = lines[hltIdx - 1];
          if (/\b([0-9A-Fa-f]+h|\d+)\b/.test(targetLine)) {
            lines[hltIdx - 1] = targetLine.replace(/\b([0-9A-Fa-f]+h|\d+)\b/, (m) => {
              if (m.endsWith('h') || m.endsWith('H')) {
                const n = parseInt(m.slice(0, -1), 16);
                return ((n + 1) & 0xFFFF).toString(16).toUpperCase() + 'h';
              }
              const n = parseInt(m, 10);
              return ((n + 1) & 0xFFFF).toString();
            });
          } else {
            lines[hltIdx - 1] = '; ' + targetLine; // Comment out
          }
          mutatedCode = lines.join('\n');
        } else {
          mutatedCode = task.solutionCode.replace(/HLT/i, 'MOV AX, 0FFFFh\nHLT');
        }
      }

      const res = StudyRunner.grade(task, mutatedCode);
      if (res.success) {
        undetectedMutations.push(
          `Topic ${topicNumber}: Task ${task.id} accepted mutated solution!\nOriginal:\n${task.solutionCode}\nMutated:\n${mutatedCode}`
        );
      }
    }

    console.log(`\nUndetected Targeted Mutation Faults: ${undetectedMutations.length} / 45`);
    expect(
      undetectedMutations,
      `Undetected mutations found in tasks:\n${undetectedMutations.join('\n---\n')}`
    ).toEqual([]);
  });
});
