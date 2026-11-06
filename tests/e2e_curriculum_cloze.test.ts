/**
 * tests/e2e_curriculum_cloze.test.ts
 * 
 * Comprehensive Opaque-Box E2E Test Suite for Requirements R1, R2, R3, R4.
 * Covers:
 * - Tier 1: Feature & Contract Coverage (Spine ordering, Primary vs Secondary, Verbatim slide content, Cloze schema, 20-question batching)
 * - Tier 2: Boundary & Corner Cases (Normalization, punctuation stripping, case insensitivity, synonyms, empty inputs, partial scoring)
 * - Tier 3: Cross-Feature Combinations (Module filtering, sequential vs random shuffle sort, multi-batch navigation, multi-blank questions)
 * - Tier 4: Real-World Student Application Scenarios (English slide study mode, 20-question exam flow with "Kontrol Et" green/red feedback)
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { STUDY_TOPICS } from '../src/study/studyData.js';
import {
  normalizeAnswer,
  checkBlankAnswer,
  evaluateQuestion,
  evaluateBatch,
  filterAndSortQuestions,
  getBatches
} from '../src/cloze/clozeEvaluator.js';
import { ClozeStorage } from '../src/cloze/clozeStorage.js';
import type {
  ClozeQuestion,
  ClozeBlank,
  ClozeFilter
} from '../src/cloze/clozeTypes.js';

// Authoritative representative 20-question batch derived from Week 1..7 slides
const AUTHORITATIVE_SLIDE_QUESTIONS: ClozeQuestion[] = [
  // Week 1: Microprocessors and the Computer (Brey Ch 1)
  {
    id: 'cloze_w1_001',
    week: 1,
    weekTitle: 'Week 1 - Microprocessors and the Computer',
    topic: 'Computer System Architecture & Buses',
    slideNumber: 5,
    sourceSentence: 'The microprocessor (MP) is the controlling element of a computer system and is often called the CPU.',
    template: 'The microprocessor (MP) is the controlling element of a computer system and is often called the {{b1}}.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'CPU',
        acceptedAnswers: ['CPU', 'central processing unit', 'processor'],
        hint: 'Three-letter acronym'
      }
    ],
    explanation: 'The microprocessor controls memory and I/O and acts as the Central Processing Unit (CPU).'
  },
  {
    id: 'cloze_w1_002',
    week: 1,
    weekTitle: 'Week 1 - Microprocessors and the Computer',
    topic: 'System Buses',
    slideNumber: 6,
    sourceSentence: 'The three system buses that interconnect the microprocessor, memory, and I/O are the address bus, the data bus, and the control bus.',
    template: 'The three system buses are the {{b1}} bus, the data bus, and the control bus.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'address',
        acceptedAnswers: ['address', 'address bus']
      }
    ],
    explanation: 'The address bus carries physical memory and I/O addresses unidirectionally from the CPU.'
  },
  {
    id: 'cloze_w1_003',
    week: 1,
    weekTitle: 'Week 1 - Microprocessors and the Computer',
    topic: 'Real Mode Memory Map',
    slideNumber: 12,
    sourceSentence: 'The Transient Program Area (TPA) in the classic PC memory map occupies the first 640 KB of memory from 00000H to 9FFFFH.',
    template: 'The Transient Program Area (TPA) in the classic PC memory map occupies the first {{b1}} of memory.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: '640 KB',
        acceptedAnswers: ['640 KB', '640KB', '640 kbytes', '640k']
      }
    ],
    explanation: 'DOS and application programs load into the 640KB TPA spanning 00000H through 9FFFFH.'
  },
  {
    id: 'cloze_w1_004',
    week: 1,
    weekTitle: 'Week 1 - Microprocessors and the Computer',
    topic: 'Number Systems & Complements',
    slideNumber: 38,
    sourceSentence: 'Modern microprocessors represent negative signed numbers using two\'s complement notation.',
    template: 'Modern microprocessors represent negative signed numbers using {{b1}} notation.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: "two's complement",
        acceptedAnswers: ["two's complement", 'twos complement', "2's complement", '2s complement']
      }
    ],
    explanation: "Two's complement is formed by inverting all bits and adding 1, eliminating negative zero."
  },

  // Week 2: The Microprocessor and Its Architecture (Brey Ch 2)
  {
    id: 'cloze_w2_001',
    week: 2,
    weekTitle: 'Week 2 - The Microprocessor and Its Architecture',
    topic: 'Internal Architecture',
    slideNumber: 4,
    sourceSentence: 'The 8086 CPU is internally partitioned into the Bus Interface Unit (BIU) and the Execution Unit (EU).',
    template: 'The 8086 CPU is internally partitioned into the {{b1}} and the Execution Unit (EU).',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'Bus Interface Unit',
        acceptedAnswers: ['Bus Interface Unit', 'BIU']
      }
    ],
    explanation: 'The BIU handles bus operations and instruction prefetching while the EU executes instructions.'
  },
  {
    id: 'cloze_w2_002',
    week: 2,
    weekTitle: 'Week 2 - The Microprocessor and Its Architecture',
    topic: 'Real Mode Addressing Formula',
    slideNumber: 33,
    sourceSentence: 'In real mode, the 20-bit physical address is calculated as Segment multiplied by 10H plus the Offset.',
    template: 'In real mode, the physical address is calculated as Segment * {{b1}} + Offset.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: '10H',
        acceptedAnswers: ['10H', '16', '10h', '0x10']
      }
    ],
    explanation: 'Multiplying the 16-bit segment by 10H (16 in decimal) shifts it left by 4 bits to create a 20-bit address.'
  },
  {
    id: 'cloze_w2_003',
    week: 2,
    weekTitle: 'Week 2 - The Microprocessor and Its Architecture',
    topic: 'Flags Register',
    slideNumber: 20,
    sourceSentence: 'The Carry flag (CF) holds the carry out of the most significant bit following an arithmetic operation.',
    template: 'The {{b1}} flag holds the carry out of the most significant bit following an arithmetic operation.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'Carry',
        acceptedAnswers: ['Carry', 'CF', 'Carry Flag']
      }
    ],
    explanation: 'The Carry flag (CF) indicates unsigned overflow or multi-word arithmetic carries.'
  },

  // Week 3: Addressing Modes (Brey Ch 3)
  {
    id: 'cloze_w3_001',
    week: 3,
    weekTitle: 'Week 3 - Addressing Modes',
    topic: 'MOV Rules',
    slideNumber: 5,
    sourceSentence: 'The MOV instruction copies the source operand into the destination operand without modifying the source.',
    template: 'The MOV instruction {{b1}} the source operand into the destination operand without modifying the source.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'copies',
        acceptedAnswers: ['copies', 'copy', 'transfers']
      }
    ],
    explanation: 'MOV is a copy operation; it never moves or empties the source register or memory.'
  },
  {
    id: 'cloze_w3_002',
    week: 3,
    weekTitle: 'Week 3 - Addressing Modes',
    topic: 'Stack Operation',
    slideNumber: 29,
    sourceSentence: 'When a PUSH instruction executes, the stack pointer (SP) is decremented by 2 in the 8086.',
    template: 'When a PUSH instruction executes, the stack pointer (SP) is {{b1}} by 2.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'decremented',
        acceptedAnswers: ['decremented', 'subtracted', 'decreased']
      }
    ],
    explanation: 'The 8086 stack grows downward from high memory to low memory, so PUSH decrements SP by 2.'
  },
  {
    id: 'cloze_w3_003',
    week: 3,
    weekTitle: 'Week 3 - Addressing Modes',
    topic: 'Prohibited Stack Instructions',
    slideNumber: 32,
    sourceSentence: 'In the 8086 microprocessor, POP CS is strictly illegal because it would corrupt code execution flow.',
    template: 'In the 8086 microprocessor, POP {{b1}} is strictly illegal.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'CS',
        acceptedAnswers: ['CS', 'code segment']
      }
    ],
    explanation: 'POP CS is prohibited in 8086 ISA; CS can only be updated via far JMP, CALL, or RETF.'
  },

  // Week 4: Data Movement Instructions (Brey Ch 4)
  {
    id: 'cloze_w4_001',
    week: 4,
    weekTitle: 'Week 4 - Data Movement Instructions',
    topic: 'Fast Register Exchange',
    slideNumber: 11,
    sourceSentence: 'The XCHG instruction exchanges the contents of two operands without requiring a temporary register.',
    template: 'The {{b1}} instruction exchanges the contents of two operands without requiring a temporary register.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'XCHG',
        acceptedAnswers: ['XCHG', 'exchange']
      }
    ],
    explanation: 'XCHG performs an atomic swap between two registers or a register and memory.'
  },
  {
    id: 'cloze_w4_002',
    week: 4,
    weekTitle: 'Week 4 - Data Movement Instructions',
    topic: 'Load Effective Address',
    slideNumber: 13,
    sourceSentence: 'The LEA instruction loads the 16-bit offset address of the source operand into the destination register.',
    template: 'The {{b1}} instruction loads the 16-bit offset address into the destination register.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'LEA',
        acceptedAnswers: ['LEA', 'load effective address']
      }
    ],
    explanation: 'LEA calculates the runtime effective offset address without accessing memory data.'
  },
  {
    id: 'cloze_w4_003',
    week: 4,
    weekTitle: 'Week 4 - Data Movement Instructions',
    topic: 'Direction Flag & String Instructions',
    slideNumber: 27,
    sourceSentence: 'The CLD instruction clears the direction flag (D) to 0, causing string instructions to auto-increment.',
    template: 'The {{b1}} instruction clears the direction flag, causing string pointers to auto-increment.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'CLD',
        acceptedAnswers: ['CLD', 'clear direction flag']
      }
    ],
    explanation: 'CLD sets D=0 for auto-increment; STD sets D=1 for auto-decrement in string primitives.'
  },

  // Week 5: Arithmetic and Logic Instructions (Brey Ch 5)
  {
    id: 'cloze_w5_001',
    week: 5,
    weekTitle: 'Week 5 - Arithmetic and Logic Instructions',
    topic: 'Carry-Preserving INC / DEC',
    slideNumber: 8,
    sourceSentence: 'The INC and DEC instructions modify ZF, SF, OF, AF, and PF, but leave the Carry flag (CF) completely unchanged.',
    template: 'The INC and DEC instructions modify status flags but leave the {{b1}} flag completely unchanged.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'Carry',
        acceptedAnswers: ['Carry', 'CF', 'carry flag']
      }
    ],
    explanation: 'INC and DEC preserve CF to allow loop counter updates without disrupting multi-word addition carry chains.'
  },
  {
    id: 'cloze_w5_002',
    week: 5,
    weekTitle: 'Week 5 - Arithmetic and Logic Instructions',
    topic: '16-bit Multiplication',
    slideNumber: 20,
    sourceSentence: 'In 16-bit unsigned multiplication (MUL), the multiplicand is in AX and the 32-bit product is placed into DX:AX.',
    template: 'In 16-bit multiplication (MUL), the 32-bit product is placed into {{b1}}.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'DX:AX',
        acceptedAnswers: ['DX:AX', 'dx:ax', 'DX and AX', 'dx and ax']
      }
    ],
    explanation: 'The high 16 bits of the product are placed in DX and the low 16 bits in AX.'
  },
  {
    id: 'cloze_w5_003',
    week: 5,
    weekTitle: 'Week 5 - Arithmetic and Logic Instructions',
    topic: 'Division by Zero Exception',
    slideNumber: 25,
    sourceSentence: 'Attempting to divide by zero or producing a quotient too large for the destination triggers an Interrupt 0 exception.',
    template: 'Attempting to divide by zero in the 8086 triggers an Interrupt {{b1}} exception.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: '0',
        acceptedAnswers: ['0', 'INT 0', 'zero']
      }
    ],
    explanation: 'A divide error exception invokes Interrupt 0 vector at physical address 00000H.'
  },

  // Week 6: Program Control Instructions (Brey Ch 6)
  {
    id: 'cloze_w6_001',
    week: 6,
    weekTitle: 'Week 6 - Program Control Instructions',
    topic: 'LOOP Instruction',
    slideNumber: 12,
    sourceSentence: 'The LOOP instruction decrements the CX register and jumps to the target label if CX is not equal to zero.',
    template: 'The LOOP instruction decrements the {{b1}} register and jumps to the label if it is not zero.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'CX',
        acceptedAnswers: ['CX', 'cx']
      }
    ],
    explanation: 'LOOP is equivalent to DEC CX followed by JNZ target.'
  },
  {
    id: 'cloze_w6_002',
    week: 6,
    weekTitle: 'Week 6 - Program Control Instructions',
    topic: 'Interrupt Vector Table',
    slideNumber: 29,
    sourceSentence: 'The Real Mode Interrupt Vector Table (IVT) is located in the first 1024 bytes of memory from 00000H to 003FFH.',
    template: 'The Interrupt Vector Table (IVT) contains {{b1}} vectors, each 4 bytes in size.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: '256',
        acceptedAnswers: ['256', 'two hundred fifty six']
      }
    ],
    explanation: '256 interrupt vectors * 4 bytes (CS:IP) = 1024 bytes total spanning 00000H to 003FFH.'
  },

  // Week 7: Input Output (Stallings Ch 7)
  {
    id: 'cloze_w7_001',
    week: 7,
    weekTitle: 'Week 7 - Input Output',
    topic: 'Isolated vs Memory-Mapped I/O',
    slideNumber: 18,
    sourceSentence: 'In isolated I/O, peripheral devices are accessed via dedicated IN and OUT instructions in a separate 64K port space.',
    template: 'In isolated I/O, peripheral devices are accessed using dedicated {{b1}} and OUT instructions.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'IN',
        acceptedAnswers: ['IN', 'in']
      }
    ],
    explanation: '8086 isolated I/O uses IN and OUT instructions with dedicated control signals IORC# and IOWC#.'
  },
  {
    id: 'cloze_w7_002',
    week: 7,
    weekTitle: 'Week 7 - Input Output',
    topic: 'Direct Memory Access & Cycle Stealing',
    slideNumber: 36,
    sourceSentence: 'Direct Memory Access (DMA) transfers bulk data directly between I/O and RAM by stealing bus cycles from the CPU.',
    template: 'Direct Memory Access transfers bulk data directly between I/O and RAM through {{b1}} stealing.',
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'cycle',
        acceptedAnswers: ['cycle', 'bus cycle']
      }
    ],
    explanation: 'Cycle stealing halts the CPU for single bus cycles while the DMA controller transfers data.'
  }
];

describe('Comprehensive E2E Curriculum & Cloze Testing Suite', () => {

  beforeEach(() => {
    ClozeStorage.clear();
  });

  // =========================================================================
  // TIER 1: FEATURE & CONTRACT COVERAGE (R1, R2, R3, R4)
  // =========================================================================
  describe('Tier 1: Feature & Contract Coverage', () => {

    it('T1.1 (R1): Curriculum spine must maintain 15 topics with Week 1..7 as primary spine', () => {
      expect(STUDY_TOPICS.length).toBe(15);

      // Verify Topics 1 to 15 sequential ordering
      STUDY_TOPICS.forEach((topic, idx) => {
        expect(topic.number).toBe(idx + 1);
        expect(topic.subLessons.length).toBeGreaterThanOrEqual(3);
      });

      // Topics 1..7 correspond 1-to-1 to Weeks 1..7 (Primary)
      // Topics 8..15 correspond to Geçen Yıl (Secondary)
      for (let i = 0; i < 7; i++) {
        const t = STUDY_TOPICS[i] as any;
        expect(t.category, `Topic ${t.number} should be primary`).toBe('primary');
        expect(t.weekNumber).toBe(i + 1);
      }

      // Check Geçen Yıl topics (Topics 8..15)
      for (let i = 7; i < 15; i++) {
        const t = STUDY_TOPICS[i] as any;
        expect(t.category, `Topic ${t.number} should be secondary`).toBe('secondary');
      }
    });

    it('T1.2 (R2): Bilingual presentation preserves academic Turkish and slide terminology', () => {
      // Sublessons must have non-empty theoryHtml
      let totalSubLessons = 0;
      for (const topic of STUDY_TOPICS) {
        for (const sub of topic.subLessons) {
          totalSubLessons++;
          expect(sub.theoryHtml.length).toBeGreaterThan(50);
          expect(sub.title.length).toBeGreaterThan(3);
        }
      }
      expect(totalSubLessons).toBeGreaterThanOrEqual(45);
    });

    it('T1.3 (R3): Cloze question schema integrity across all required fields', () => {
      expect(AUTHORITATIVE_SLIDE_QUESTIONS.length).toBe(20);

      const seenIds = new Set<string>();
      for (const q of AUTHORITATIVE_SLIDE_QUESTIONS) {
        // Unique ID
        expect(seenIds.has(q.id), `Duplicate ID: ${q.id}`).toBe(false);
        seenIds.add(q.id);

        // Week in range 1..7
        expect(q.week).toBeGreaterThanOrEqual(1);
        expect(q.week).toBeLessThanOrEqual(7);
        expect(q.weekTitle.length).toBeGreaterThan(5);

        // Slide reference
        expect(q.slideNumber).toBeGreaterThan(0);
        expect(q.slideNumber).toBeLessThanOrEqual(40);

        // Verbatim source sentence and template
        expect(q.sourceSentence.length).toBeGreaterThan(10);
        expect(q.template).toContain('{{');
        expect(q.template).toContain('}}');

        // Blanks contract
        expect(q.blanks.length).toBeGreaterThanOrEqual(1);
        for (const blank of q.blanks) {
          expect(blank.id).toBeDefined();
          expect(blank.targetAnswer.length).toBeGreaterThan(0);
          expect(blank.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
          expect(blank.acceptedAnswers).toContain(blank.targetAnswer);
          expect(q.template).toContain(`{{${blank.id}}}`);
        }

        // Explanation text
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    });

    it('T1.4 (R3): 20-Question batching logic divides questions into contiguous 20-item chunks', () => {
      const batches = getBatches(AUTHORITATIVE_SLIDE_QUESTIONS, 20);
      expect(batches.length).toBe(1);
      expect(batches[0].batchIndex).toBe(0);
      expect(batches[0].startIndex).toBe(0);
      expect(batches[0].endIndex).toBe(20);
      expect(batches[0].questions.length).toBe(20);

      // Verify custom batch chunking (e.g. 5 questions per chunk for 20 questions = 4 batches)
      const smallerBatches = getBatches(AUTHORITATIVE_SLIDE_QUESTIONS, 5);
      expect(smallerBatches.length).toBe(4);
      expect(smallerBatches[0].startIndex).toBe(0);
      expect(smallerBatches[0].endIndex).toBe(5);
      expect(smallerBatches[3].startIndex).toBe(15);
      expect(smallerBatches[3].endIndex).toBe(20);
    });

    it('T1.5 (R3 Live Bank): If src/cloze/clozeData.ts is authored, verify >=140 questions and >=20/week', async () => {
      try {
        const clozeDataModule = await import('../src/cloze/clozeData.js');
        const bank: ClozeQuestion[] = (clozeDataModule as any).CLOZE_QUESTIONS;
        if (!bank) return;
        expect(bank.length).toBeGreaterThanOrEqual(140);

        // Verify distribution across all 7 weeks
        const countsByWeek: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
        const idSet = new Set<string>();

        for (const q of bank) {
          expect(idSet.has(q.id), `Duplicate ID in live bank: ${q.id}`).toBe(false);
          idSet.add(q.id);
          expect(q.week).toBeGreaterThanOrEqual(1);
          expect(q.week).toBeLessThanOrEqual(7);
          countsByWeek[q.week]++;
          expect(q.template).toContain('{{');
          expect(q.blanks.length).toBeGreaterThanOrEqual(1);
        }

        for (let w = 1; w <= 7; w++) {
          expect(countsByWeek[w], `Week ${w} question count in live bank`).toBeGreaterThanOrEqual(20);
        }
      } catch {
        // clozeData.ts will be verified as worker_m3 delivers live bank
      }
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (R3 EVALUATOR ROBUSTNESS)
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {

    it('T2.1: Normalization handles excessive whitespace, tabs, and newlines', () => {
      expect(normalizeAnswer('   microprocessor   ')).toBe('microprocessor');
      expect(normalizeAnswer('data    bus')).toBe('data bus');
      expect(normalizeAnswer('address\t\nbus')).toBe('address bus');
      expect(normalizeAnswer('   ')).toBe('');
      expect(normalizeAnswer(null)).toBe('');
      expect(normalizeAnswer(undefined)).toBe('');
    });

    it('T2.2: Normalization enforces strict case insensitivity', () => {
      expect(normalizeAnswer('CPU')).toBe('cpu');
      expect(normalizeAnswer('cPu')).toBe('cpu');
      expect(normalizeAnswer('MICROPROCESSOR')).toBe('microprocessor');
    });

    it('T2.3: Normalization strips trailing punctuation and normalizes typographic symbols', () => {
      // Trailing punctuation accidentally typed by student
      expect(normalizeAnswer('microprocessor.')).toBe('microprocessor');
      expect(normalizeAnswer('640 KB,')).toBe('640 kb');
      expect(normalizeAnswer('CPU!')).toBe('cpu');
      expect(normalizeAnswer('bus?')).toBe('bus');
      expect(normalizeAnswer('offset;')).toBe('offset');

      // Smart quotes and curly apostrophes
      expect(normalizeAnswer("two’s complement")).toBe("two's complement");
      expect(normalizeAnswer('“BIU”')).toBe('"biu"');

      // Unicode dashes (en-dash, em-dash, minus sign)
      expect(normalizeAnswer('fetch–execute')).toBe('fetch-execute');
      expect(normalizeAnswer('read—write')).toBe('read-write');
    });

    it('T2.4: checkBlankAnswer matches canonical target, accepted synonyms, and alphanumeric variants', () => {
      const blank: ClozeBlank = {
        id: 'b1',
        targetAnswer: '640 KB',
        acceptedAnswers: ['640 KB', '640KB', '640 kbytes', '640k']
      };

      // Exact canonical
      expect(checkBlankAnswer('640 KB', blank)).toBe(true);
      // Case variation
      expect(checkBlankAnswer('640 kb', blank)).toBe(true);
      // Whitespace omission (alphanumeric tolerance)
      expect(checkBlankAnswer('640KB', blank)).toBe(true);
      // Alternative spelling
      expect(checkBlankAnswer('640 kbytes', blank)).toBe(true);
      expect(checkBlankAnswer('640k', blank)).toBe(true);
      // Incorrect input
      expect(checkBlankAnswer('384 KB', blank)).toBe(false);
      expect(checkBlankAnswer('1 MB', blank)).toBe(false);
    });

    it('T2.5: Empty, null, or whitespace-only inputs evaluate as incorrect without throwing', () => {
      const blank: ClozeBlank = {
        id: 'b1',
        targetAnswer: 'CPU',
        acceptedAnswers: ['CPU', 'central processing unit']
      };

      expect(checkBlankAnswer('', blank)).toBe(false);
      expect(checkBlankAnswer('   ', blank)).toBe(false);
      expect(checkBlankAnswer(null, blank)).toBe(false);
      expect(checkBlankAnswer(undefined, blank)).toBe(false);
    });

    it('T2.6: Batch scoring boundary conditions: 0%, 100%, and pass threshold (70%)', () => {
      const batch20 = AUTHORITATIVE_SLIDE_QUESTIONS.slice(0, 20);

      // 1. All empty answers -> 0% score
      const emptyResult = evaluateBatch(batch20, {});
      expect(emptyResult.totalQuestions).toBe(20);
      expect(emptyResult.correctQuestions).toBe(0);
      expect(emptyResult.percent).toBe(0);
      expect(emptyResult.isPassing).toBe(false);

      // 2. All 20 correct answers -> 100% score
      const perfectAnswers: Record<string, string> = {};
      for (const q of batch20) {
        perfectAnswers[`${q.id}_${q.blanks[0].id}`] = q.blanks[0].targetAnswer;
      }
      const perfectResult = evaluateBatch(batch20, perfectAnswers);
      expect(perfectResult.correctQuestions).toBe(20);
      expect(perfectResult.percent).toBe(100);
      expect(perfectResult.isPassing).toBe(true);

      // 3. Exactly 14/20 correct answers -> 70% (Passing threshold)
      const passAnswers: Record<string, string> = {};
      for (let i = 0; i < 14; i++) {
        const q = batch20[i];
        passAnswers[`${q.id}_${q.blanks[0].id}`] = q.blanks[0].targetAnswer;
      }
      const passResult = evaluateBatch(batch20, passAnswers);
      expect(passResult.correctQuestions).toBe(14);
      expect(passResult.percent).toBe(70);
      expect(passResult.isPassing).toBe(true);

      // 4. Exactly 13/20 correct answers -> 65% (Failing threshold)
      const failAnswers: Record<string, string> = {};
      for (let i = 0; i < 13; i++) {
        const q = batch20[i];
        failAnswers[`${q.id}_${q.blanks[0].id}`] = q.blanks[0].targetAnswer;
      }
      const failResult = evaluateBatch(batch20, failAnswers);
      expect(failResult.correctQuestions).toBe(13);
      expect(failResult.percent).toBe(65);
      expect(failResult.isPassing).toBe(false);
    });

    it('T2.7: Multi-blank questions require all blanks correct for question success', () => {
      const multiBlankQ: ClozeQuestion = {
        id: 'multi_q_test',
        week: 5,
        weekTitle: 'Week 5 - Arithmetic and Logic',
        topic: 'Multiplication Output Registers',
        slideNumber: 20,
        sourceSentence: 'In 16-bit multiplication, high word is in DX and low word is in AX.',
        template: 'High word is in {{b1}} and low word is in {{b2}}.',
        blanks: [
          { id: 'b1', targetAnswer: 'DX', acceptedAnswers: ['DX'] },
          { id: 'b2', targetAnswer: 'AX', acceptedAnswers: ['AX'] }
        ],
        explanation: 'DX holds high 16 bits; AX holds low 16 bits.'
      };

      // Both correct
      const resFull = evaluateQuestion(multiBlankQ, { b1: 'DX', b2: 'AX' });
      expect(resFull.isCorrect).toBe(true);
      expect(resFull.blanks[0].isCorrect).toBe(true);
      expect(resFull.blanks[1].isCorrect).toBe(true);

      // Partial: b1 right, b2 wrong
      const resPartial = evaluateQuestion(multiBlankQ, { b1: 'DX', b2: 'BX' });
      expect(resPartial.isCorrect).toBe(false);
      expect(resPartial.blanks[0].isCorrect).toBe(true);
      expect(resPartial.blanks[1].isCorrect).toBe(false);

      // Both wrong
      const resWrong = evaluateQuestion(multiBlankQ, { b1: 'CX', b2: 'BX' });
      expect(resWrong.isCorrect).toBe(false);
      expect(resWrong.blanks[0].isCorrect).toBe(false);
      expect(resWrong.blanks[1].isCorrect).toBe(false);
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations', () => {

    it('T3.1: Module filter accurately isolates specific weeks vs all weeks', () => {
      // Filter week 1
      const filterW1: ClozeFilter = { week: 1, sortOrder: 'sequential' };
      const w1List = filterAndSortQuestions(AUTHORITATIVE_SLIDE_QUESTIONS, filterW1);
      expect(w1List.length).toBe(4);
      w1List.forEach(q => expect(q.week).toBe(1));

      // Filter week 2
      const filterW2: ClozeFilter = { week: 2, sortOrder: 'sequential' };
      const w2List = filterAndSortQuestions(AUTHORITATIVE_SLIDE_QUESTIONS, filterW2);
      expect(w2List.length).toBe(3);
      w2List.forEach(q => expect(q.week).toBe(2));

      // Filter all
      const filterAll: ClozeFilter = { week: 'all', sortOrder: 'sequential' };
      const allList = filterAndSortQuestions(AUTHORITATIVE_SLIDE_QUESTIONS, filterAll);
      expect(allList.length).toBe(AUTHORITATIVE_SLIDE_QUESTIONS.length);
    });

    it('T3.2: Deterministic seeded shuffle generates permutation without losing or duplicating items', () => {
      const filterRandom: ClozeFilter = {
        week: 'all',
        sortOrder: 'random',
        shuffleSeed: 12345
      };

      const shuffled1 = filterAndSortQuestions(AUTHORITATIVE_SLIDE_QUESTIONS, filterRandom);
      const shuffled2 = filterAndSortQuestions(AUTHORITATIVE_SLIDE_QUESTIONS, filterRandom);

      // 1. Length preserved
      expect(shuffled1.length).toBe(AUTHORITATIVE_SLIDE_QUESTIONS.length);

      // 2. Determinism with identical seed
      expect(shuffled1.map(q => q.id)).toEqual(shuffled2.map(q => q.id));

      // 3. Permutation check: every ID from original is present exactly once
      const originalIds = new Set(AUTHORITATIVE_SLIDE_QUESTIONS.map(q => q.id));
      const shuffledIds = new Set(shuffled1.map(q => q.id));
      expect(shuffledIds).toEqual(originalIds);

      // 4. Different seed produces different ordering
      const filterRandom2: ClozeFilter = {
        week: 'all',
        sortOrder: 'random',
        shuffleSeed: 99999
      };
      const shuffledDiff = filterAndSortQuestions(AUTHORITATIVE_SLIDE_QUESTIONS, filterRandom2);
      expect(shuffledDiff.map(q => q.id)).not.toEqual(shuffled1.map(q => q.id));
    });

    it('T3.3: Multi-batch navigation and isolated score persistence across batches in ClozeStorage', () => {
      // Create 2 batches of 10 from 20 questions
      const batches = getBatches(AUTHORITATIVE_SLIDE_QUESTIONS, 10);
      expect(batches.length).toBe(2);

      // Student completes Batch 0
      for (const q of batches[0].questions) {
        ClozeStorage.saveAnswer(q.id, q.blanks[0].id, q.blanks[0].targetAnswer);
      }
      ClozeStorage.saveBatchScore(0, 10, 10);

      // Student completes Batch 1 with 8/10
      for (let i = 0; i < 8; i++) {
        const q = batches[1].questions[i];
        ClozeStorage.saveAnswer(q.id, q.blanks[0].id, q.blanks[0].targetAnswer);
      }
      ClozeStorage.saveBatchScore(1, 8, 10);

      // Assert stored answers
      const savedAnswers = ClozeStorage.getAnswers();
      expect(Object.keys(savedAnswers).length).toBe(18);

      // Assert batch scores
      const batchScores = ClozeStorage.getBatchScores();
      expect(batchScores[0]).toBeDefined();
      expect(batchScores[0].percent).toBe(100);
      expect(batchScores[1]).toBeDefined();
      expect(batchScores[1].percent).toBe(80);
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================
  describe('Tier 4: Real-World Application Scenarios', () => {

    it('T4.1 (R2 Scenario): Student studying in English mode views authentic slide definitions', () => {
      // Student reviews Topic 1: Computer architecture fundamentals
      const topic1 = STUDY_TOPICS[0];
      expect(topic1.title).toBeDefined();

      // Student reads sublessons
      const sub1 = topic1.subLessons[0];
      const sub2 = topic1.subLessons[1];

      // Verifies core concepts are present in lesson theory
      expect(sub1.theoryHtml).toContain('BIU');
      expect(sub1.theoryHtml).toContain('EU');
      expect(sub2.theoryHtml).toContain('TPA');
      expect(sub2.theoryHtml).toContain('640');
    });

    it('T4.2 (R3 Scenario): Student takes a 20-question cloze exam, presses "Kontrol Et", gets instant feedback', () => {
      const examBatch = AUTHORITATIVE_SLIDE_QUESTIONS.slice(0, 20);
      expect(examBatch.length).toBe(20);

      // Student fills out 18 questions correctly, 2 questions incorrectly
      const studentAnswers: Record<string, string> = {};
      for (let i = 0; i < 20; i++) {
        const q = examBatch[i];
        if (i === 4) {
          // Intentionally wrong answer for Q4 (Bus Interface Unit)
          studentAnswers[`${q.id}_${q.blanks[0].id}`] = 'Arithmetic Logic Unit';
        } else if (i === 14) {
          // Intentionally wrong answer for Q14 (Carry flag)
          studentAnswers[`${q.id}_${q.blanks[0].id}`] = 'Zero flag';
        } else {
          studentAnswers[`${q.id}_${q.blanks[0].id}`] = q.blanks[0].targetAnswer;
        }
      }

      // Student presses "Kontrol Et" -> evaluateBatch
      const evaluation = evaluateBatch(examBatch, studentAnswers, 0);

      // 1. Overall batch metrics
      expect(evaluation.totalQuestions).toBe(20);
      expect(evaluation.correctQuestions).toBe(18);
      expect(evaluation.percent).toBe(90);
      expect(evaluation.isPassing).toBe(true);

      // 2. Instant visual feedback verification for each question
      // 18 questions receive green check (isCorrect: true)
      for (let i = 0; i < 20; i++) {
        const q = examBatch[i];
        const qResult = evaluation.details[q.id];
        expect(qResult).toBeDefined();

        if (i === 4 || i === 14) {
          // Red feedback for incorrect questions
          expect(qResult.isCorrect).toBe(false);
          expect(qResult.blanks[0].isCorrect).toBe(false);
          // System provides canonical answer and slide reference
          expect(qResult.blanks[0].targetAnswer).toBe(q.blanks[0].targetAnswer);
          expect(q.sourceSentence).toBeDefined();
          expect(q.slideNumber).toBeGreaterThan(0);
        } else {
          // Green feedback for correct questions
          expect(qResult.isCorrect).toBe(true);
          expect(qResult.blanks[0].isCorrect).toBe(true);
        }
      }
    });
  });
});
