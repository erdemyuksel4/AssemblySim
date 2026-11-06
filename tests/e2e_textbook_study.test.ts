/**
 * tests/e2e_textbook_study.test.ts
 *
 * Master End-to-End Test Suite for AssemblySim's 15-Chapter Academic Curriculum
 * and Intel 8086 Execution Engine.
 *
 * Verification Architecture:
 * - Tier 1: Feature Coverage & Pedagogical Invariants (Topics 1-15, 45 Sublessons, Rich HTML, Quizzes, Tasks)
 * - Tier 2: Boundary & Corner Cases (Assembler parsing, illegal opcodes, 16-bit limits, flag overflow, testSetup)
 * - Tier 3: Cross-Feature Combinations (Stack frames + CALL/RET, Shift-and-Add + ADC, String primitives + XLAT, I/O + IVT/IRET)
 * - Tier 4: Real-World Student Algorithms (Array search, In-place string reversal, Factorial recursion, Packed BCD addition)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { STUDY_TOPICS } from '../src/study/studyData.js';
import { StudyRunner } from '../src/study/studyRunner.js';
import { StudyStorage } from '../src/study/studyStorage.js';
import { Assembler } from '../src/assembler/assembler.js';
import { CPU } from '../src/cpu/cpu.js';

// ============================================================================
// TIER 1: FEATURE COVERAGE & PEDAGOGICAL DATA INVARIANTS
// ============================================================================
describe('Tier 1: Feature Coverage & Pedagogical Data Invariants', () => {
  it('should contain all 15 primary curriculum topics in strictly monotonic order', () => {
    expect(STUDY_TOPICS.length).toBe(15);

    STUDY_TOPICS.forEach((topic, idx) => {
      const expectedNum = idx + 1;
      expect(topic.number, `Topic at index ${idx} must have number ${expectedNum}`).toBe(expectedNum);
      expect(topic.id).toBeDefined();
      expect(topic.id.length).toBeGreaterThan(5);
      expect(topic.title, `Topic ${expectedNum} must have non-empty title`).toBeTruthy();
      expect(topic.shortTitle, `Topic ${expectedNum} must have shortTitle`).toBeTruthy();
      expect(topic.badge, `Topic ${expectedNum} must have badge`).toBeTruthy();
      expect(topic.icon, `Topic ${expectedNum} must have icon`).toBeTruthy();
      expect(topic.summary, `Topic ${expectedNum} must have summary`).toBeTruthy();
      expect(topic.opcodes.length, `Topic ${expectedNum} must specify at least 1 opcode`).toBeGreaterThanOrEqual(1);

      // Mind map coordinate boundary invariants
      expect(topic.mindMap).toBeDefined();
      expect(topic.mindMap.x).toBeGreaterThanOrEqual(10);
      expect(topic.mindMap.x).toBeLessThanOrEqual(90);
      expect(topic.mindMap.y).toBeGreaterThanOrEqual(5);
      expect(topic.mindMap.y).toBeLessThanOrEqual(95);
      expect(Array.isArray(topic.mindMap.connections)).toBe(true);
    });
  });

  it('should have exactly 3 sublessons per topic, totaling exactly 45 comprehensive sublessons', () => {
    let totalSubLessons = 0;

    STUDY_TOPICS.forEach((topic) => {
      expect(
        topic.subLessons.length,
        `Topic ${topic.number} (${topic.title}) must contain exactly 3 sublessons`
      ).toBe(3);

      topic.subLessons.forEach((sub, subIdx) => {
        totalSubLessons++;
        expect(sub.id).toBeDefined();
        expect(sub.id).toContain(`sub-${topic.number}-`);
        expect(sub.number).toBe(`${topic.number}.${subIdx + 1}`);
        expect(sub.title.length).toBeGreaterThan(5);
        expect(sub.summary.length).toBeGreaterThan(15);
      });
    });

    expect(totalSubLessons).toBe(45);
  });

  it('should enforce rich HTML formatting and structural CSS styling across all 45 theory sections', () => {
    let sublessonsWithSection = 0;
    let sublessonsWithCards = 0;
    let sublessonsWithFormulas = 0;
    let sublessonsWithCodeSamples = 0;
    let sublessonsWithTables = 0;

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        expect(sub.theoryHtml.length, `Theory HTML in ${sub.id} must be substantive`).toBeGreaterThan(200);

        // Every sublesson must have the semantic section wrapper
        expect(sub.theoryHtml, `Sublesson ${sub.id} must use .nb-section container`).toContain('nb-section');
        sublessonsWithSection++;

        // Track curriculum-wide pedagogical element distributions
        if (sub.theoryHtml.includes('nb-card')) sublessonsWithCards++;
        if (sub.theoryHtml.includes('nb-formula-box')) sublessonsWithFormulas++;
        if (sub.theoryHtml.includes('nb-code-box') || sub.theoryHtml.includes('nb-code-sample') || sub.theoryHtml.includes('<pre>')) {
          sublessonsWithCodeSamples++;
        }
        if (sub.theoryHtml.includes('nb-table') || sub.theoryHtml.includes('<table')) sublessonsWithTables++;
      }
    }

    // Invariants across the 45 sublessons
    expect(sublessonsWithSection).toBe(45);
    expect(sublessonsWithCards).toBeGreaterThanOrEqual(25);
    expect(sublessonsWithFormulas).toBeGreaterThanOrEqual(3);
    expect(sublessonsWithCodeSamples).toBeGreaterThanOrEqual(4);
    expect(sublessonsWithTables).toBeGreaterThanOrEqual(10);
  });

  it('should enforce Concept Quiz integrity with exactly 4 distinct options, valid index, and detailed explanation', () => {
    let totalQuizzes = 0;

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        expect(sub.quiz, `Sublesson ${sub.id} must include a concept quiz`).toBeDefined();
        if (sub.quiz) {
          totalQuizzes++;
          expect(sub.quiz.id).toBeDefined();
          expect(sub.quiz.question.length, `Quiz question in ${sub.id} must be non-trivial`).toBeGreaterThanOrEqual(15);

          // Exactly 4 options required
          expect(
            sub.quiz.options.length,
            `Quiz ${sub.quiz.id} in ${sub.id} must have exactly 4 options`
          ).toBe(4);

          // All 4 options must be mutually distinct (no duplicate choices)
          const uniqueOptions = new Set(sub.quiz.options);
          expect(
            uniqueOptions.size,
            `Quiz ${sub.quiz.id} in ${sub.id} contains duplicate options`
          ).toBe(4);

          // correctIndex must be strictly within [0..3]
          expect(sub.quiz.correctIndex).toBeGreaterThanOrEqual(0);
          expect(sub.quiz.correctIndex).toBeLessThan(4);

          // Explanation must be academically informative
          expect(
            sub.quiz.explanation.length,
            `Quiz ${sub.quiz.id} must provide detailed explanation (>= 15 chars)`
          ).toBeGreaterThanOrEqual(15);
        }
      }
    }

    expect(totalQuizzes).toBe(45);
  });

  it('should enforce Study Task pedagogical contract (difficulty, prompt, hints, exam tips)', () => {
    let totalTasks = 0;

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        expect(sub.task, `Sublesson ${sub.id} must include a coding task`).toBeDefined();
        if (sub.task) {
          totalTasks++;
          expect(sub.task.id).toBeDefined();
          expect(sub.task.title.length).toBeGreaterThanOrEqual(5);

          // Difficulty must be strictly defined
          expect(['Kolay', 'Orta', 'Zor']).toContain(sub.task.difficulty);

          // Pedagogical text requirements
          expect(sub.task.scenario.trim().length, `Task ${sub.task.id} scenario`).toBeGreaterThanOrEqual(20);
          expect(sub.task.taskPrompt.trim().length, `Task ${sub.task.id} prompt`).toBeGreaterThanOrEqual(15);

          // Hints must be present
          expect(Array.isArray(sub.task.hints)).toBe(true);
          expect(sub.task.hints.length, `Task ${sub.task.id} must provide hints`).toBeGreaterThanOrEqual(1);

          // Assertions must test at least one state property
          const hasStateAssertion =
            Boolean(sub.task.assertions.registers && Object.keys(sub.task.assertions.registers).length > 0) ||
            Boolean(sub.task.assertions.flags && Object.keys(sub.task.assertions.flags).length > 0) ||
            Boolean(sub.task.assertions.memory && sub.task.assertions.memory.length > 0);
          expect(hasStateAssertion, `Task ${sub.task.id} must have assertions`).toBe(true);
        }
      }
    }

    expect(totalTasks).toBe(45);
  });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ============================================================================
describe('Tier 2: Boundary & Corner Cases', () => {
  it('should assemble all 45 starter and 45 solution codes cleanly with zero errors', () => {
    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          // 1. Starter code assembly verification
          const starterRes = Assembler.assemble(sub.task.starterCode);
          expect(
            starterRes.errors,
            `Starter assembly error in task ${sub.task.id}: ${starterRes.errors.map(e => e.message).join('; ')}`
          ).toEqual([]);

          // 2. Solution code assembly verification
          const solRes = Assembler.assemble(sub.task.solutionCode);
          expect(
            solRes.errors,
            `Solution assembly error in task ${sub.task.id}: ${solRes.errors.map(e => e.message).join('; ')}`
          ).toEqual([]);
          expect(solRes.bytes.length, `Solution code in ${sub.task.id} generated 0 bytes`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should reject invalid opcodes, illegal syntax, and prohibited 8086 addressing combinations', () => {
    // 1. Unknown mnemonic
    const badMnemonic = 'ORG 100H\nUNKNOWN_INSTRUCTION_ABC AX, BX\nHLT';
    const resMnemonic = Assembler.assemble(badMnemonic);
    expect(resMnemonic.errors.length).toBeGreaterThan(0);

    // 2. Prohibited memory-to-memory move
    const memToMem = 'ORG 100H\nMOV [1000H], [2000H]\nHLT';
    const resMemToMem = Assembler.assemble(memToMem);
    expect(resMemToMem.errors.length).toBeGreaterThan(0);

    // 3. Prohibited segment-to-segment move
    const segToSeg = 'ORG 100H\nMOV DS, ES\nHLT';
    const resSegToSeg = Assembler.assemble(segToSeg);
    expect(resSegToSeg.errors.length).toBeGreaterThan(0);

    // 4. Prohibited immediate to segment register move
    const immToSeg = 'ORG 100H\nMOV DS, 1000H\nHLT';
    const resImmToSeg = Assembler.assemble(immToSeg);
    expect(resImmToSeg.errors.length).toBeGreaterThan(0);

    // 5. Prohibited CS as destination
    const csDst = 'ORG 100H\nMOV CS, AX\nHLT';
    const resCsDst = Assembler.assemble(csDst);
    expect(resCsDst.errors.length).toBeGreaterThan(0);

    // 6. Strict 8086 ISA: PUSH immediate is illegal in 8086
    const pushImm = 'ORG 100H\nPUSH 1234H\nHLT';
    const resPushImm = Assembler.assemble(pushImm);
    expect(resPushImm.errors.length).toBeGreaterThan(0);
  });

  it('should handle 16-bit boundaries and arithmetic flag overflows accurately in CPU', () => {
    // Test 1: Unsigned 16-bit overflow (0xFFFF + 1 -> 0x0000, CF=1, ZF=1)
    const code1 = 'ORG 100H\nMOV AX, 0FFFFH\nADD AX, 1\nHLT';
    const res1 = Assembler.assemble(code1);
    const cpu1 = new CPU();
    cpu1.loadCOM(res1.bytes, res1.origin);
    cpu1.runChunk(100);
    expect(cpu1.halted).toBe(true);
    expect(cpu1.regs.ax).toBe(0x0000);
    expect(cpu1.flags.cf).toBe(true);
    expect(cpu1.flags.zf).toBe(true);

    // Test 2: Signed 16-bit overflow (0x7FFF + 1 -> 0x8000, OF=1, SF=1, CF=0)
    const code2 = 'ORG 100H\nMOV AX, 7FFFH\nADD AX, 1\nHLT';
    const res2 = Assembler.assemble(code2);
    const cpu2 = new CPU();
    cpu2.loadCOM(res2.bytes, res2.origin);
    cpu2.runChunk(100);
    expect(cpu2.halted).toBe(true);
    expect(cpu2.regs.ax).toBe(0x8000);
    expect(cpu2.flags.of).toBe(true);
    expect(cpu2.flags.sf).toBe(true);
    expect(cpu2.flags.cf).toBe(false);

    // Test 3: NEG 80H boundary in 8-bit signed math (-128 negated remains -128, OF=1)
    const code3 = 'ORG 100H\nMOV AL, 80H\nNEG AL\nHLT';
    const res3 = Assembler.assemble(code3);
    const cpu3 = new CPU();
    cpu3.loadCOM(res3.bytes, res3.origin);
    cpu3.runChunk(100);
    expect(cpu3.halted).toBe(true);
    expect(cpu3.regs.al).toBe(0x80);
    expect(cpu3.flags.of).toBe(true);

    // Test 4: Unsigned underflow (0x0000 - 1 -> 0xFFFF, CF=1, SF=1)
    const code4 = 'ORG 100H\nMOV AX, 0000H\nSUB AX, 1\nHLT';
    const res4 = Assembler.assemble(code4);
    const cpu4 = new CPU();
    cpu4.loadCOM(res4.bytes, res4.origin);
    cpu4.runChunk(100);
    expect(cpu4.halted).toBe(true);
    expect(cpu4.regs.ax).toBe(0xFFFF);
    expect(cpu4.flags.cf).toBe(true);
    expect(cpu4.flags.sf).toBe(true);
  });

  it('should initialize testSetup memory and registers without cross-contamination', () => {
    let testSetupCount = 0;

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.task && sub.task.testSetup) {
          testSetupCount++;
          const task = sub.task;

          // Grade with solution
          const res = StudyRunner.grade(task, task.solutionCode);
          expect(res.success, `Task with testSetup ${task.id} failed grading`).toBe(true);
          expect(res.status).toBe('PASSED');
        }
      }
    }

    // Verify tasks with pre-configured setups exist and pass cleanly
    expect(testSetupCount).toBeGreaterThanOrEqual(1);
  });

  it('should reject dummy program (ORG 100h / HLT) across all 45 tasks', () => {
    const dummyCode = 'ORG 100H\nHLT';
    let failedCount = 0;

    for (const topic of STUDY_TOPICS) {
      for (const sub of topic.subLessons) {
        if (sub.task) {
          const res = StudyRunner.grade(sub.task, dummyCode);
          expect(
            res.success,
            `Task ${sub.task.id} should NOT pass with a dummy program`
          ).toBe(false);
          failedCount++;
        }
      }
    }

    expect(failedCount).toBe(45);
  });
});

// ============================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS
// ============================================================================
describe('Tier 3: Cross-Feature Combinations', () => {
  it('combines Stack Mechanics and Subroutine Frames (PUSH, CALL, BP frame, local vars, RET n)', () => {
    const code = `
      ORG 100H
      MOV SP, 0FFFEH
      MOV AX, 12H
      PUSH AX            ; Argument 1 = 18 (0x12)
      MOV AX, 22H
      PUSH AX            ; Argument 2 = 34 (0x22)
      CALL compute_frame
      HLT

      compute_frame:
      PUSH BP
      MOV BP, SP
      SUB SP, 4          ; Allocate 2 words of local storage: [BP-2] and [BP-4]
      MOV AX, [BP+6]     ; Load Argument 1 (18)
      MOV BX, [BP+4]     ; Load Argument 2 (34)
      ADD AX, BX         ; Sum = 52 (0x34)
      MOV [BP-2], AX     ; Store into local variable 1
      SHL AX, 1          ; Double sum = 104 (0x68)
      MOV [BP-4], AX     ; Store into local variable 2
      MOV SP, BP         ; Release local stack storage
      POP BP             ; Restore caller BP
      RET 4              ; Return and pop 4 bytes of caller arguments
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toEqual([]);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(500);

    expect(cpu.halted).toBe(true);
    expect(cpu.regs.ax).toBe(0x0068);   // Returned double value: 104
    expect(cpu.regs.sp).toBe(0xFFFE);   // Stack pointer restored by RET 4
  });

  it('combines Fast Shift Multiplication with 32-bit Multi-Word ADC Addition', () => {
    const code = `
      ORG 100H
      ; Part 1: Fast multiply AX by 10 using shift-and-add (AX * 10 = (AX * 8) + (AX * 2))
      ; Input AX = 45 -> Expected: 450 (0x01C2)
      MOV AX, 45
      MOV BX, AX
      SHL AX, 1          ; AX = 90
      SHL BX, 1
      SHL BX, 1
      SHL BX, 1          ; BX = 360
      ADD AX, BX         ; AX = 450 (0x01C2)
      MOV SI, AX         ; Save 450 in SI

      ; Part 2: 32-bit Multi-Word Addition with Carry:
      ; High:Low word 1 = 0x0001:0xFFFF
      ; High:Low word 2 = 0x0002:0x0002
      ; Expected sum = 0x0004:0x0001
      MOV DX, 0001H
      MOV AX, 0FFFFH
      MOV CX, 0002H
      MOV BX, 0002H
      ADD AX, BX         ; 0xFFFF + 0x0002 = 0x0001, CF = 1
      ADC DX, CX         ; 0x0001 + 0x0002 + 1 = 0x0004
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toEqual([]);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(500);

    expect(cpu.halted).toBe(true);
    expect(cpu.regs.si).toBe(450);      // Shift-and-add multiplication result
    expect(cpu.regs.ax).toBe(0x0001);   // Low word of 32-bit addition
    expect(cpu.regs.dx).toBe(0x0004);   // High word with carry added
    expect(cpu.flags.cf).toBe(false);
  });

  it('combines String Primitives (CLD, REP MOVSB, REPNE SCASB) with XLAT Table Translation', () => {
    const code = `
      ORG 100H
      MOV AX, CS
      MOV DS, AX
      MOV ES, AX

      ; 1. Block Copy 5 bytes from DS:200h to ES:300h
      MOV SI, 200H
      MOV DI, 300H
      MOV CX, 5
      CLD
      REP MOVSB

      ; 2. Scan Destination buffer at 300h for target character 'C' (0x43)
      MOV DI, 300H
      MOV CX, 5
      MOV AL, 43H
      REPNE SCASB        ; Sets ZF = 1 upon finding 'C'

      ; 3. Table Lookup via XLAT
      MOV BX, 400H       ; Base of translation table
      MOV AL, 03H        ; Lookup index 3
      XLAT               ; AL <- [DS:BX + AL]
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toEqual([]);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);

    // Source characters at 200h: 'A', 'B', 'C', 'D', 'E'
    const srcData = [0x41, 0x42, 0x43, 0x44, 0x45];
    for (let i = 0; i < srcData.length; i++) {
      cpu.mem.writeByte(cpu.regs.ds, 0x200 + i, srcData[i]);
    }

    // Translation table at 400h: index 3 holds 0x88
    cpu.mem.writeByte(cpu.regs.ds, 0x403, 0x88);

    cpu.runChunk(500);
    expect(cpu.halted).toBe(true);

    // Verify block copy
    for (let i = 0; i < srcData.length; i++) {
      expect(cpu.mem.readByte(cpu.regs.es, 0x300 + i)).toBe(srcData[i]);
    }

    // Verify SCASB found target
    expect(cpu.flags.zf).toBe(true);

    // Verify XLAT result
    expect(cpu.regs.al).toBe(0x88);
  });

  it('combines Hardware Port I/O with Custom IVT Interrupt Vectoring and IRET', () => {
    // Main program writes to port 60h, installs vector 80h, invokes INT 80h, and halts
    const mainCode = `
      ORG 100H
      MOV SP, 0FFFEH
      MOV AL, 55H
      OUT 60H, AL        ; Write 55h to port 60h
      IN AL, 60H         ; Read back port 60h -> AL = 55h
      MOV DX, 100H
      INT 80H            ; Invoke custom software interrupt 80h
      ADD DX, 10H        ; Post-interrupt resume check: DX = 100h + 5 + 10h = 115h
      HLT
    `;

    // Custom Interrupt Service Routine (ISR) at offset 0x300
    const isrCode = `
      ORG 300H
      ADD DX, 5          ; Increment DX inside ISR
      IRET               ; Return from interrupt (POPF, POP CS, POP IP)
    `;

    const mainRes = Assembler.assemble(mainCode);
    const isrRes = Assembler.assemble(isrCode);
    expect(mainRes.errors).toEqual([]);
    expect(isrRes.errors).toEqual([]);

    const cpu = new CPU();
    cpu.mem.loadBytes(cpu.regs.cs, mainRes.origin, mainRes.bytes, 'code');
    cpu.mem.loadBytes(cpu.regs.cs, isrRes.origin, isrRes.bytes, 'code');
    cpu.regs.ip = 0x100;

    // Vector 80h entry in IVT (0000:0200h because 0x80 * 4 = 0x0200)
    cpu.mem.writeWord(0, 0x80 * 4, 0x300);
    cpu.mem.writeWord(0, 0x80 * 4 + 2, cpu.regs.cs);

    cpu.runChunk(500);

    expect(cpu.halted).toBe(true);
    expect(cpu.regs.al).toBe(0x55);     // Port I/O confirmed
    expect(cpu.regs.dx).toBe(0x0115);   // DX modified in ISR (+5) and resumed in caller (+10h)
  });
});

// ============================================================================
// TIER 4: REAL-WORLD STUDENT ALGORITHMS
// ============================================================================
describe('Tier 4: Real-World Student Algorithms', () => {
  it('Algorithm 1: Array Linear Search & Maximum Value Extraction', () => {
    const code = `
      ORG 100H
      MOV SI, 200H       ; Array base pointer
      MOV CX, 6          ; 6 elements
      MOV DX, [SI]       ; Initial max value = element[0]
      MOV BX, 0          ; Initial max index = 0
      MOV DI, 0          ; Current index tracker
      ADD SI, 2
      DEC CX             ; 5 remaining elements

    search_loop:
      INC DI
      MOV AX, [SI]
      CMP AX, DX
      JLE skip_update
      MOV DX, AX         ; Found new maximum
      MOV BX, DI         ; Record index of maximum

    skip_update:
      ADD SI, 2
      LOOP search_loop
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toEqual([]);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);

    // Initial 6 elements: [0x0012, 0x007A, 0x01E4, 0x002B, 0x0150, 0x0005]
    // 0x01E4 = 484 (at index 2)
    const arrayElements = [
      0x12, 0x00,
      0x7A, 0x00,
      0xE4, 0x01,
      0x2B, 0x00,
      0x50, 0x01,
      0x05, 0x00
    ];
    for (let i = 0; i < arrayElements.length; i++) {
      cpu.mem.writeByte(cpu.regs.ds, 0x200 + i, arrayElements[i]);
    }

    cpu.runChunk(500);
    expect(cpu.halted).toBe(true);
    expect(cpu.regs.dx).toBe(0x01E4);   // Correct maximum value found
    expect(cpu.regs.bx).toBe(2);        // Correct index found
  });

  it('Algorithm 2: In-Place ASCII String Reversal with Double Pointers (SI and DI)', () => {
    const code = `
      ORG 100H
      MOV SI, 200H       ; SI points to start of string
      MOV DI, 20EH       ; DI points to end of 15-char string (200h .. 20Eh)

    reverse_loop:
      CMP SI, DI
      JAE done_reverse
      MOV AL, [SI]
      MOV AH, [DI]
      MOV [SI], AH       ; Swap characters
      MOV [DI], AL
      INC SI
      DEC DI
      JMP reverse_loop

    done_reverse:
      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toEqual([]);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);

    // Initial string at 200h: "MICROPROCESSORS" (15 characters)
    const originalText = "MICROPROCESSORS";
    for (let i = 0; i < originalText.length; i++) {
      cpu.mem.writeByte(cpu.regs.ds, 0x200 + i, originalText.charCodeAt(i));
    }

    cpu.runChunk(500);
    expect(cpu.halted).toBe(true);

    let resultText = "";
    for (let i = 0; i < originalText.length; i++) {
      resultText += String.fromCharCode(cpu.mem.readByte(cpu.regs.ds, 0x200 + i));
    }

    // Expected reversed string: "SROSSECORPORCIM"
    expect(resultText).toBe("SROSSECORPORCIM");
  });

  it('Algorithm 3: Recursive Factorial Computation (N!) with Call Stack Frames', () => {
    const code = `
      ORG 100H
      MOV SP, 0FFFEH
      MOV AX, 5          ; Compute 5!
      PUSH AX
      CALL factorial
      ADD SP, 2          ; Clean up argument
      HLT

      factorial:
      PUSH BP
      MOV BP, SP
      MOV BX, [BP+4]     ; N
      CMP BX, 1
      JLE base_case
      DEC BX             ; N - 1
      PUSH BX
      CALL factorial     ; Recursive call
      ADD SP, 2          ; AX holds factorial(N-1)
      MOV BX, [BP+4]     ; Restore original N
      MUL BX             ; AX = factorial(N-1) * N
      JMP exit_factorial

      base_case:
      MOV AX, 1          ; 1! = 1

      exit_factorial:
      POP BP
      RET
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toEqual([]);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(1000);

    expect(cpu.halted).toBe(true);
    // 5! = 120 (0x0078)
    expect(cpu.regs.ax).toBe(120);
    expect(cpu.regs.dx).toBe(0);
  });

  it('Algorithm 4: Packed BCD Multi-Byte Addition with DAA and ASCII Conversion', () => {
    const code = `
      ORG 100H
      ; Add two 4-digit packed BCD numbers:
      ; Number 1: 2975h (BCD 2975)
      ; Number 2: 4386h (BCD 4386)
      ; Expected Sum: 7361h (BCD 7361)

      ; Step 1: Low byte addition with DAA decimal correction
      MOV AL, 75H
      ADD AL, 86H
      DAA                ; 75h + 86h = FBh -> DAA -> 61h, CF = 1
      MOV DL, AL         ; Store low BCD result in DL

      ; Step 2: High byte addition with carry and DAA
      MOV AL, 29H
      ADC AL, 43H
      DAA                ; 29h + 43h + 1 = 6Dh -> DAA -> 73h, CF = 0
      MOV DH, AL         ; Store high BCD result in DH

      ; Step 3: Unpack 4 BCD nibbles into 4 ASCII characters at memory offset 200h
      MOV DI, 200H

      ; Digit 1 (Thousands): High nibble of DH (7)
      MOV AL, DH
      SHR AL, 1
      SHR AL, 1
      SHR AL, 1
      SHR AL, 1
      OR AL, 30H         ; '7'
      MOV [DI], AL
      INC DI

      ; Digit 2 (Hundreds): Low nibble of DH (3)
      MOV AL, DH
      AND AL, 0FH
      OR AL, 30H         ; '3'
      MOV [DI], AL
      INC DI

      ; Digit 3 (Tens): High nibble of DL (6)
      MOV AL, DL
      SHR AL, 1
      SHR AL, 1
      SHR AL, 1
      SHR AL, 1
      OR AL, 30H         ; '6'
      MOV [DI], AL
      INC DI

      ; Digit 4 (Units): Low nibble of DL (1)
      MOV AL, DL
      AND AL, 0FH
      OR AL, 30H         ; '1'
      MOV [DI], AL

      HLT
    `;
    const res = Assembler.assemble(code);
    expect(res.errors).toEqual([]);

    const cpu = new CPU();
    cpu.loadCOM(res.bytes, res.origin);
    cpu.runChunk(500);

    expect(cpu.halted).toBe(true);
    expect(cpu.regs.dx).toBe(0x7361);   // Packed BCD sum: 7361h

    // Verify ASCII characters unpacked at 200h
    const asciiChars = String.fromCharCode(
      cpu.mem.readByte(cpu.regs.ds, 0x200),
      cpu.mem.readByte(cpu.regs.ds, 0x201),
      cpu.mem.readByte(cpu.regs.ds, 0x202),
      cpu.mem.readByte(cpu.regs.ds, 0x203)
    );
    expect(asciiChars).toBe("7361");
  });
});
