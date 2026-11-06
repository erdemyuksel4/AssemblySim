import { describe, it, expect } from 'vitest';
import { STUDY_TOPICS } from '../src/study/studyData.js';
import { StudyRunner } from '../src/study/studyRunner.js';
import { Assembler } from '../src/assembler/assembler.js';

describe('Adversarial Challenge 1: Starter Codes Are Not Pre-Solved', () => {
  it('empirically verifies that starter codes are NOT already passing solutions', () => {
    const preSolvedTasks: { id: string; topic: string; sub: string }[] = [];

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, sub.task.starterCode);
          if (res.success) {
            preSolvedTasks.push({
              id: sub.task.id,
              topic: `${topic.number}. ${topic.title}`,
              sub: sub.title
            });
          }
        }
      }
    }

    console.log(`[CHALLENGE 1] Pre-solved starter codes count: ${preSolvedTasks.length}`);
    for (const item of preSolvedTasks) {
      console.log(`  - ${item.id} (${item.topic} -> ${item.sub})`);
    }

    expect(
      preSolvedTasks,
      `Starter codes must NOT already pass the task assertions! Found ${preSolvedTasks.length} pre-solved tasks:\n` +
      preSolvedTasks.map(t => `  * ${t.id} in ${t.topic}`).join('\n')
    ).toEqual([]);
  });
});

describe('Adversarial Challenge 2: Timeout and Infinite Loop Guard', () => {
  it('an infinite loop must be trapped and rejected with TIMEOUT status within maxSteps', () => {
    const infiniteLoopCode = `
      ORG 100h
      hang:
      JMP hang
    `;

    let checkedTasks = 0;
    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          checkedTasks++;
          const res = StudyRunner.grade(sub.task, infiniteLoopCode);
          expect(
            res.success,
            `Task ${sub.task.id} unexpectedly succeeded with an infinite loop!`
          ).toBe(false);

          expect(
            res.status,
            `Task ${sub.task.id} did not report TIMEOUT on infinite loop, got: ${res.status}`
          ).toBe('TIMEOUT');

          const expectedSteps = sub.task.assertions.maxSteps || 3000;
          expect(res.steps).toBe(expectedSteps);
        }
      }
    }

    expect(checkedTasks).toBeGreaterThanOrEqual(45);
  });
});

describe('Adversarial Challenge 3: False Pass Resistance on Minimal Dummy Program', () => {
  it('minimal dummy program (ORG 100h / HLT) must fail every single task', () => {
    const dummyCode = `
      ORG 100h
      HLT
    `;

    const dummyPassed: string[] = [];

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, dummyCode);
          if (res.success) {
            dummyPassed.push(sub.task.id);
          }
        }
      }
    }

    console.log(`[CHALLENGE 3] Dummy program false passes count: ${dummyPassed.length}`);
    for (const id of dummyPassed) {
      console.log(`  - ${id}`);
    }

    expect(
      dummyPassed,
      `Dummy (do-nothing) program must not pass any task! False passes found in: ${dummyPassed.join(', ')}`
    ).toEqual([]);
  });
});

describe('Adversarial Challenge 4: Critical Opcode Bypass Vulnerability Test', () => {
  it('tasks must not pass if the core instruction being taught is omitted', () => {
    const bypassVulnerabilities: { taskId: string; omittedInstruction: string; reason: string }[] = [];

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (!sub.task) continue;

        // Test 1: task-12-1-io-out omitting OUT 0E9h, AL
        if (sub.task.id === 'task-12-1-io-out') {
          const codeWithoutOut = 'ORG 100h\nMOV AL, 0\nHLT';
          const res = StudyRunner.grade(sub.task, codeWithoutOut);
          if (res.success) {
            bypassVulnerabilities.push({
              taskId: sub.task.id,
              omittedInstruction: 'OUT 0E9h, AL',
              reason: 'Task passed without executing OUT instruction'
            });
          }
        }

        // Test 2: task-13-3-bios-int-char omitting INT 10h
        if (sub.task.id === 'task-13-3-bios-int-char') {
          const codeWithoutInt = 'ORG 100h\nMOV AL, \'M\'\nHLT';
          const res = StudyRunner.grade(sub.task, codeWithoutInt);
          if (res.success) {
            bypassVulnerabilities.push({
              taskId: sub.task.id,
              omittedInstruction: 'INT 10h & MOV AH, 0Eh',
              reason: 'Task passed without calling INT 10h or setting AH=0Eh'
            });
          }
        }

        // Test 3: task-14-3-context-save omitting PUSH instructions
        if (sub.task.id === 'task-14-3-context-save') {
          const codeWithoutPush = 'ORG 100h\nMOV AX, 0\nMOV BX, 0\nMOV DX, 0\nHLT';
          const res = StudyRunner.grade(sub.task, codeWithoutPush);
          if (res.success) {
            bypassVulnerabilities.push({
              taskId: sub.task.id,
              omittedInstruction: 'PUSH AX / PUSH BX / PUSH DX',
              reason: 'Task passed without saving context onto stack'
            });
          }
        }

        // Test 4: task-3-2-flush-pipeline omitting JMP target
        if (sub.task.id === 'task-3-2-flush-pipeline') {
          const codeWithoutJmp = 'ORG 100h\ntrap:\nJMP trap\nMOV AX, 9999h\ntarget:\nMOV AX, 1234h\nHLT';
          const res = StudyRunner.grade(sub.task, codeWithoutJmp);
          if (res.success) {
            bypassVulnerabilities.push({
              taskId: sub.task.id,
              omittedInstruction: 'JMP target',
              reason: 'Execution fell through without jumping'
            });
          }
        }

        // Test 5: task-5-2-indirect-jump omitting JMP BX
        if (sub.task.id === 'task-5-2-indirect-jump') {
          const codeWithoutJmp = 'ORG 100h\nMOV BX, target\ntrap:\nJMP trap\nMOV AX, 9999h\ntarget:\nMOV AX, 0001h\nHLT';
          const res = StudyRunner.grade(sub.task, codeWithoutJmp);
          if (res.success) {
            bypassVulnerabilities.push({
              taskId: sub.task.id,
              omittedInstruction: 'JMP BX',
              reason: 'Execution fell through without indirect jump'
            });
          }
        }
      }
    }

    console.log(`[CHALLENGE 4] Critical opcode bypass vulnerabilities count: ${bypassVulnerabilities.length}`);
    for (const v of bypassVulnerabilities) {
      console.log(`  - Task ${v.taskId}: omitted "${v.omittedInstruction}" -> ${v.reason}`);
    }

    expect(
      bypassVulnerabilities,
      `Core instruction bypasses detected! Found ${bypassVulnerabilities.length} bypasses:\n` +
      bypassVulnerabilities.map(v => `  * ${v.taskId}: omitted "${v.omittedInstruction}"`).join('\n')
    ).toEqual([]);
  });
});

describe('Adversarial Challenge 5: Concept Quiz Integrity and Bound Checks', () => {
  it('every sublesson quiz must have valid options, distinct answers, and in-bounds correctIndex', () => {
    let quizCount = 0;
    const invalidQuizzes: string[] = [];

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (!sub.quiz) continue;
        quizCount++;

        const q = sub.quiz;

        // 1. Question non-empty and substantial
        if (q.question.trim().length < 15 || q.question.includes('TODO') || q.question.includes('TBD')) {
          invalidQuizzes.push(`${q.id}: Question invalid or placeholder`);
        }

        // 2. Exactly 4 options for consistency
        if (q.options.length !== 4) {
          invalidQuizzes.push(`${q.id}: Has ${q.options.length} options, expected 4`);
        }

        // 3. Every option must be non-empty and unique
        const trimmedOptions = q.options.map(o => o.trim());
        if (trimmedOptions.some(o => o.length === 0)) {
          invalidQuizzes.push(`${q.id}: Contains empty option`);
        }
        const uniqueOptions = new Set(trimmedOptions);
        if (uniqueOptions.size !== q.options.length) {
          invalidQuizzes.push(`${q.id}: Contains duplicate options: ${JSON.stringify(q.options)}`);
        }

        // 4. correctIndex must be an integer within [0, options.length - 1]
        if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
          invalidQuizzes.push(`${q.id}: correctIndex out of bounds (${q.correctIndex})`);
        }

        // 5. Correct answer option must not be placeholder
        if (q.correctIndex >= 0 && q.correctIndex < q.options.length) {
          const correctText = q.options[q.correctIndex];
          if (correctText.trim().length === 0 || correctText.includes('TODO') || correctText.includes('TBD')) {
            invalidQuizzes.push(`${q.id}: Correct option text is placeholder`);
          }
        }

        // 6. Explanation non-empty and substantial
        if (q.explanation.trim().length < 15) {
          invalidQuizzes.push(`${q.id}: Explanation too short`);
        }
      }
    }

    expect(invalidQuizzes, `Invalid quizzes found:\n${invalidQuizzes.join('\n')}`).toEqual([]);
    expect(quizCount).toBeGreaterThanOrEqual(45);
  });
});

describe('Adversarial Challenge 6: Mind Map Geometry & Zero Node Overlap Margin', () => {
  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 1200;
  const NODE_WIDTH = 260; // From src/style.css .mindmap-node-card width
  const ESTIMATED_MAX_HEIGHT = 175; // Theoretical max height allowed by row spacing

  it('all 15 nodes must be within canvas boundaries with padding', () => {
    expect(STUDY_TOPICS.length).toBe(15);

    for (const topic of STUDY_TOPICS) {
      const cx = (topic.mindMap.x / 100) * CANVAS_WIDTH;
      const cy = (topic.mindMap.y / 100) * CANVAS_HEIGHT;

      const left = cx - NODE_WIDTH / 2;
      const right = cx + NODE_WIDTH / 2;
      const top = cy - ESTIMATED_MAX_HEIGHT / 2;
      const bottom = cy + ESTIMATED_MAX_HEIGHT / 2;

      expect(left, `Topic ${topic.id} extends past left canvas border`).toBeGreaterThanOrEqual(0);
      expect(right, `Topic ${topic.id} extends past right canvas border`).toBeLessThanOrEqual(CANVAS_WIDTH);
      expect(top, `Topic ${topic.id} extends past top canvas border`).toBeGreaterThanOrEqual(0);
      expect(bottom, `Topic ${topic.id} extends past bottom canvas border`).toBeLessThanOrEqual(CANVAS_HEIGHT);
    }
  });

  it('every pair of nodes must have 0% overlap with positive margins', () => {
    const nodes = STUDY_TOPICS.map(t => {
      const cx = (t.mindMap.x / 100) * CANVAS_WIDTH;
      const cy = (t.mindMap.y / 100) * CANVAS_HEIGHT;
      return {
        id: t.id,
        number: t.number,
        cx,
        cy,
        left: cx - NODE_WIDTH / 2,
        right: cx + NODE_WIDTH / 2,
        top: cy - ESTIMATED_MAX_HEIGHT / 2,
        bottom: cy + ESTIMATED_MAX_HEIGHT / 2,
      };
    });

    let overlapCount = 0;
    const violations: string[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];

        const xOverlap = !(a.right <= b.left || a.left >= b.right);
        const yOverlap = !(a.bottom <= b.top || a.top >= b.bottom);

        if (xOverlap && yOverlap) {
          overlapCount++;
          violations.push(`Overlap between ${a.id} and ${b.id}`);
        }

        // On the same row (same y)
        if (Math.abs(a.cy - b.cy) < 5) {
          const hGap = Math.abs(a.cx - b.cx) - NODE_WIDTH;
          expect(
            hGap,
            `Horizontal clearance between Topic ${a.number} and Topic ${b.number} too small: ${hGap}px`
          ).toBeGreaterThanOrEqual(180);
        }

        // On the same column (same x)
        if (Math.abs(a.cx - b.cx) < 5) {
          const vGap = Math.abs(a.cy - b.cy) - ESTIMATED_MAX_HEIGHT;
          expect(
            vGap,
            `Vertical clearance between Topic ${a.number} and Topic ${b.number} too small: ${vGap}px`
          ).toBeGreaterThanOrEqual(40);
        }
      }
    }

    expect(overlapCount, `Overlapping nodes detected: ${violations.join(', ')}`).toBe(0);
  });

  it('serpentine connection topology must form an unbroken pedagogical chain from 1 to 15', () => {
    for (let num = 1; num < 15; num++) {
      const current = STUDY_TOPICS.find(t => t.number === num);
      const next = STUDY_TOPICS.find(t => t.number === num + 1);

      expect(current, `Topic ${num} missing`).toBeDefined();
      expect(next, `Topic ${num + 1} missing`).toBeDefined();

      if (current && next) {
        expect(
          current.mindMap.connections,
          `Topic ${num} does not connect to Topic ${num + 1}`
        ).toContain(next.id);
      }
    }

    // Node 15 is terminal
    const terminal = STUDY_TOPICS.find(t => t.number === 15);
    expect(terminal?.mindMap.connections).toEqual([]);
  });
});
