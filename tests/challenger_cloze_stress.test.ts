/**
 * tests/challenger_cloze_stress.test.ts
 * 
 * Final Milestone Gate: Adversarial Stress Test Suite
 * Executed by challenger_gate_1 (EMPIRICAL CHALLENGER).
 * 
 * Covers:
 * 1. Cloze Answer Normalization Stress (Extreme & malformed inputs, unicode quotes, dashes, trailing punctuation clusters, whitespace)
 * 2. Flexible & Adversarial Blank Evaluation (checkBlankAnswer against exact, alternatives, alphanumeric, misspellings, permutations)
 * 3. 100% Verification of CLOZE_QUESTIONS Data Bank (168 questions, all blanks accept targets, all reject dummies)
 * 4. Batch Evaluation at Exact Boundary Conditions (0%, 45%, 50%, 65%, 70%, 75%, 100%, non-standard batch sizes, getBatches boundaries)
 * 5. ClozeStorage Persistence, Concurrency & Corrupted JSON Recovery
 * 6. Rapid Language Switching Stress & Bilingual State Integrity in StudyStorage & StudyView
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeAnswer,
  checkBlankAnswer,
  evaluateQuestion,
  evaluateBatch,
  filterAndSortQuestions,
  getBatches
} from '../src/cloze/clozeEvaluator.js';
import { ClozeStorage } from '../src/cloze/clozeStorage.js';
import { CLOZE_QUESTIONS } from '../src/cloze/clozeData.js';
import { ClozeQuestion, ClozeBlank } from '../src/cloze/clozeTypes.js';
import { StudyStorage } from '../src/study/studyStorage.js';
import { StudyView } from '../src/study/studyView.js';
import { STUDY_TOPICS } from '../src/study/studyData.js';

// =========================================================================
// SELF-CONTAINED ROBUST MOCK DOM IMPLEMENTATION FOR NODE ENVIRONMENT
// =========================================================================

class MockClassList {
  private classes: Set<string> = new Set();
  constructor(initial: string = '') {
    initial.split(/\s+/).filter(Boolean).forEach(c => this.classes.add(c));
  }
  add(...names: string[]): void {
    names.forEach(n => {
      n.split(/\s+/).filter(Boolean).forEach(c => this.classes.add(c));
    });
  }
  remove(...names: string[]): void {
    names.forEach(n => this.classes.delete(n));
  }
  contains(name: string): boolean {
    return this.classes.has(name);
  }
  toString(): string {
    return Array.from(this.classes).join(' ');
  }
}

class MockElement {
  public tagName: string;
  public id: string = '';
  public attributes: Map<string, string> = new Map();
  public classList: MockClassList;
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentNode: MockElement | null = null;
  public _textContent: string = '';
  get textContent(): string {
    if (this.children.length === 0) return this._textContent;
    return (this._textContent ? this._textContent + ' ' : '') + this.children.map(c => c.textContent).join(' ').trim();
  }
  set textContent(val: string) {
    this._textContent = val;
  }
  public value: string = '';
  public placeholder: string = '';
  private listeners: Map<string, Array<(e: any) => void>> = new Map();
  private _innerHTML: string = '';

  constructor(tagName: string = 'div') {
    this.tagName = tagName.toUpperCase();
    this.classList = new MockClassList();
  }

  get className(): string {
    return this.classList.toString();
  }

  set className(val: string) {
    this.classList = new MockClassList(val);
  }

  get innerHTML(): string {
    return this._innerHTML;
  }

  set innerHTML(html: string) {
    this._innerHTML = html;
    this.children = [];
    this.parseHtmlTree(html);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
    if (name === 'id') this.id = value;
    if (name === 'class') this.className = value;
    if (name === 'value') this.value = value;
    if (name === 'placeholder') this.placeholder = value;
  }

  getAttribute(name: string): string | null {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    if (name === 'value') return this.value;
    if (name === 'placeholder') return this.placeholder;
    return this.attributes.get(name) ?? null;
  }

  appendChild(child: MockElement): MockElement {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertBefore(newNode: MockElement, referenceNode: MockElement | null): MockElement {
    newNode.parentNode = this;
    if (!referenceNode) {
      this.children.push(newNode);
    } else {
      const idx = this.children.indexOf(referenceNode);
      if (idx !== -1) {
        this.children.splice(idx, 0, newNode);
      } else {
        this.children.push(newNode);
      }
    }
    return newNode;
  }

  removeChild(child: MockElement): MockElement {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  addEventListener(event: string, callback: (e: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  dispatchEvent(event: { type: string; [key: string]: any }): boolean {
    const handlers = this.listeners.get(event.type) || [];
    for (const h of handlers) {
      h({
        ...event,
        target: this,
        currentTarget: this,
        stopPropagation: () => {},
        preventDefault: () => {}
      });
    }
    return true;
  }

  click(): void {
    this.dispatchEvent({ type: 'click' });
  }

  focus(): void {}
  select(): void {}
  scrollIntoView(): void {}

  matches(selector: string): boolean {
    selector = selector.trim();
    if (!selector) return false;

    const attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
    if (attrMatch) {
      const attrName = attrMatch[1];
      const attrVal = attrMatch[2];
      const baseSelector = selector.replace(attrMatch[0], '');
      const hasAttr = this.attributes.has(attrName);
      if (!hasAttr) return false;
      if (attrVal !== undefined && this.getAttribute(attrName) !== attrVal) {
        return false;
      }
      if (baseSelector) {
        return this.matches(baseSelector);
      }
      return true;
    }

    if (selector.startsWith('#')) {
      return this.id === selector.slice(1);
    }
    if (selector.startsWith('.')) {
      return this.classList.contains(selector.slice(1));
    }
    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  closest(selector: string): MockElement | null {
    let curr: MockElement | null = this;
    while (curr) {
      if (curr.matches(selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  querySelector(selector: string): MockElement | null {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector: string): MockElement[] {
    selector = selector.trim();
    if (selector.includes(' ')) {
      const parts = selector.split(/\s+/).filter(Boolean);
      let currentMatches: MockElement[] = [this];
      for (const part of parts) {
        const nextMatches: MockElement[] = [];
        for (const parent of currentMatches) {
          nextMatches.push(...parent.querySubtree(part));
        }
        currentMatches = nextMatches;
      }
      return currentMatches;
    }
    return this.querySubtree(selector);
  }

  private querySubtree(singleSelector: string): MockElement[] {
    const results: MockElement[] = [];
    const search = (node: MockElement) => {
      for (const child of node.children) {
        if (child.matches(singleSelector)) {
          results.push(child);
        }
        search(child);
      }
    };
    search(this);
    return results;
  }

  private parseHtmlTree(html: string): void {
    const tokenRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9_-]+)([^>]*)>|([^<]+)/g;
    let match: RegExpExecArray | null;
    const stack: MockElement[] = [this];

    while ((match = tokenRegex.exec(html)) !== null) {
      if (match[0].startsWith('<!--')) {
        continue;
      }

      const isClosing = Boolean(match[1]);
      const tagName = match[2];
      const attrStr = match[3] || '';
      const text = match[4];

      if (text) {
        const current = stack[stack.length - 1];
        current._textContent = (current._textContent || '') + text;
        continue;
      }

      if (tagName) {
        const lowerTag = tagName.toLowerCase();
        const isSelfClosing = ['input', 'img', 'br', 'hr', 'source', 'path', 'stop', 'defs', 'line', 'link', 'meta'].includes(lowerTag) || attrStr.trim().endsWith('/');

        if (isClosing) {
          for (let i = stack.length - 1; i > 0; i--) {
            if (stack[i].tagName.toLowerCase() === lowerTag) {
              stack.splice(i);
              break;
            }
          }
        } else {
          const current = stack[stack.length - 1];
          const el = new MockElement(lowerTag);
          el.parentNode = current;

          const attrRegex = /([a-zA-Z0-9_-]+)(?:=["']([^"']*)["'])?/g;
          let aMatch: RegExpExecArray | null;
          while ((aMatch = attrRegex.exec(attrStr)) !== null) {
            const k = aMatch[1];
            const v = aMatch[2] !== undefined ? aMatch[2] : '';
            el.setAttribute(k, v);
          }

          current.children.push(el);

          if (!isSelfClosing) {
            stack.push(el);
          }
        }
      }
    }
  }
}

// Ensure global mocks exist for Node
if (typeof document === 'undefined') {
  (globalThis as any).document = {
    createElement: (tag: string) => new MockElement(tag),
    querySelector: () => null,
    querySelectorAll: () => [],
    body: new MockElement('body'),
    execCommand: () => true
  };
}

if (typeof window === 'undefined') {
  (globalThis as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

// =========================================================================
// ADVERSARIAL STRESS TEST SUITE
// =========================================================================

describe('Empirical Adversarial Challenge 1: Extreme Cloze Answer Normalization', () => {
  it('1.1 Handles empty, null, undefined, and pure whitespace inputs gracefully', () => {
    expect(normalizeAnswer(null)).toBe('');
    expect(normalizeAnswer(undefined)).toBe('');
    expect(normalizeAnswer('')).toBe('');
    expect(normalizeAnswer('   ')).toBe('');
    expect(normalizeAnswer('\t\n\r\f\v')).toBe('');
    expect(normalizeAnswer('   \n\t  \r  ')).toBe('');
  });

  it('1.2 Normalizes all smart/curly single and double quotes and grave accents', () => {
    // Unicode left/right single quotes, low quotes, grave accent -> ASCII '
    expect(normalizeAnswer("two\u2018s complement")).toBe("two's complement");
    expect(normalizeAnswer("two\u2019s complement")).toBe("two's complement");
    expect(normalizeAnswer("two\u201As complement")).toBe("two's complement");
    expect(normalizeAnswer("two\u201Bs complement")).toBe("two's complement");
    expect(normalizeAnswer("two`s complement")).toBe("two's complement");

    // Unicode double quotes -> ASCII "
    expect(normalizeAnswer("\u201Caccumulator\u201D")).toBe('"accumulator"');
    expect(normalizeAnswer("\u201Eaccumulator\u201F")).toBe('"accumulator"');
  });

  it('1.3 Normalizes unicode dashes (en-dash, em-dash, minus sign) to standard hyphens', () => {
    expect(normalizeAnswer("read\u2013write")).toBe("read-write"); // en-dash
    expect(normalizeAnswer("memory\u2014mapped")).toBe("memory-mapped"); // em-dash
    expect(normalizeAnswer("bit\u2212level")).toBe("bit-level"); // minus sign
  });

  it('1.4 Strips clusters of trailing punctuation without removing internal punctuation', () => {
    expect(normalizeAnswer("microprocessor.")).toBe("microprocessor");
    expect(normalizeAnswer("microprocessor....")).toBe("microprocessor");
    expect(normalizeAnswer("accumulator!??,.;;")).toBe("accumulator");
    expect(normalizeAnswer("  bus.  ")).toBe("bus");
    expect(normalizeAnswer("bus . ")).toBe("bus");
    
    // Internal punctuation must NOT be stripped
    expect(normalizeAnswer("I/O.")).toBe("i/o");
    expect(normalizeAnswer("two's complement!")).toBe("two's complement");
    expect(normalizeAnswer("1.5 MB...")).toBe("1.5 mb");
  });

  it('1.5 Compresses multiple consecutive spaces, tabs, and newlines', () => {
    expect(normalizeAnswer("transient    program     area")).toBe("transient program area");
    expect(normalizeAnswer("direct \n\t memory \t\n access")).toBe("direct memory access");
  });

  it('1.6 Handles mixed casing and capitalization stress', () => {
    expect(normalizeAnswer("mIcRoPrOcEsSoR")).toBe("microprocessor");
    expect(normalizeAnswer("DATA BUS")).toBe("data bus");
    expect(normalizeAnswer("InTeL 8086")).toBe("intel 8086");
  });

  it('1.7 Survives very large string inputs (10,000 chars) without ReDoS or stack overflow', () => {
    const longString = "a".repeat(10000) + "....";
    const start = performance.now();
    const result = normalizeAnswer(longString);
    const duration = performance.now() - start;
    
    expect(result.length).toBe(10000);
    expect(duration).toBeLessThan(100); // Must complete in < 100ms
  });

  it('1.8 Injected HTML tags, script tags, and SQL injection strings normalize safely', () => {
    expect(normalizeAnswer("<script>alert(1)</script>")).toBe("<script>alert(1)</script>");
    expect(normalizeAnswer("' OR '1'='1")).toBe("' or '1'='1");
    expect(normalizeAnswer("{{b1}}")).toBe("{{b1}}");
  });
});

describe('Empirical Adversarial Challenge 2: Flexible Blank Answer Evaluation', () => {
  const sampleBlank: ClozeBlank = {
    id: 'b1',
    targetAnswer: 'microprocessor',
    acceptedAnswers: ['microprocessor', 'mp', 'cpu', 'central processing unit'],
    hint: 'Central component'
  };

  it('2.1 Accepts exact match, mixed casing, and whitespace variants', () => {
    expect(checkBlankAnswer('microprocessor', sampleBlank)).toBe(true);
    expect(checkBlankAnswer('MICROPROCESSOR', sampleBlank)).toBe(true);
    expect(checkBlankAnswer('  Microprocessor  ', sampleBlank)).toBe(true);
    expect(checkBlankAnswer('mIcRoPrOcEsSoR.', sampleBlank)).toBe(true);
  });

  it('2.2 Accepts all accepted alternatives with punctuation tolerance', () => {
    expect(checkBlankAnswer('mp', sampleBlank)).toBe(true);
    expect(checkBlankAnswer('MP', sampleBlank)).toBe(true);
    expect(checkBlankAnswer('cpu', sampleBlank)).toBe(true);
    expect(checkBlankAnswer('CPU.', sampleBlank)).toBe(true);
    expect(checkBlankAnswer('Central Processing Unit', sampleBlank)).toBe(true);
  });

  it('2.3 Tolerates punctuation-free alphanumeric matches (e.g. 1MB vs 1 MB, I/O vs IO)', () => {
    const memBlank: ClozeBlank = {
      id: 'b_mem',
      targetAnswer: '1 MB',
      acceptedAnswers: ['1MB', '1 megabyte']
    };
    expect(checkBlankAnswer('1MB', memBlank)).toBe(true);
    expect(checkBlankAnswer('1 MB', memBlank)).toBe(true);
    expect(checkBlankAnswer('1-mb', memBlank)).toBe(true);
    expect(checkBlankAnswer('1_MB', memBlank)).toBe(true);

    const ioBlank: ClozeBlank = {
      id: 'b_io',
      targetAnswer: 'I/O',
      acceptedAnswers: ['input/output', 'io']
    };
    expect(checkBlankAnswer('IO', ioBlank)).toBe(true);
    expect(checkBlankAnswer('I/O', ioBlank)).toBe(true);
    expect(checkBlankAnswer('i-o', ioBlank)).toBe(true);
  });

  it('2.4 Strictly REJECTS partial prefixes and substrings', () => {
    expect(checkBlankAnswer('micro', sampleBlank)).toBe(false);
    expect(checkBlankAnswer('processor', sampleBlank)).toBe(false);
    expect(checkBlankAnswer('microprocessors', sampleBlank)).toBe(false);
  });

  it('2.5 Strictly REJECTS inverted word order', () => {
    const busBlank: ClozeBlank = {
      id: 'b_bus',
      targetAnswer: 'address bus',
      acceptedAnswers: ['address bus']
    };
    expect(checkBlankAnswer('address bus', busBlank)).toBe(true);
    expect(checkBlankAnswer('bus address', busBlank)).toBe(false);
  });

  it('2.6 Strictly REJECTS empty strings, null, undefined, or punctuation-only entries', () => {
    expect(checkBlankAnswer('', sampleBlank)).toBe(false);
    expect(checkBlankAnswer(null, sampleBlank)).toBe(false);
    expect(checkBlankAnswer(undefined, sampleBlank)).toBe(false);
    expect(checkBlankAnswer('   ', sampleBlank)).toBe(false);
    expect(checkBlankAnswer('...', sampleBlank)).toBe(false);
    expect(checkBlankAnswer('!??', sampleBlank)).toBe(false);
  });

  it('2.7 Empirically verifies 100% of the 180 Questions in CLOZE_QUESTIONS Data Bank', () => {
    expect(CLOZE_QUESTIONS.length).toBe(180);

    let totalBlanksVerified = 0;
    const failingBlanks: string[] = [];
    const falseAccepts: string[] = [];

    for (const q of CLOZE_QUESTIONS) {
      expect(q.blanks.length).toBeGreaterThan(0);
      for (const b of q.blanks) {
        totalBlanksVerified++;

        // 1. Target answer MUST match
        if (!checkBlankAnswer(b.targetAnswer, b)) {
          failingBlanks.push(`Q: ${q.id}, Blank: ${b.id}, Target: "${b.targetAnswer}"`);
        }

        // 2. Each accepted answer MUST match
        for (const alt of b.acceptedAnswers) {
          if (!checkBlankAnswer(alt, b)) {
            failingBlanks.push(`Q: ${q.id}, Blank: ${b.id}, Alt: "${alt}"`);
          }
        }

        // 3. Dummy incorrect answer MUST NOT match
        if (checkBlankAnswer('__completely_invalid_dummy_answer__', b)) {
          falseAccepts.push(`Q: ${q.id}, Blank: ${b.id}`);
        }

        // 4. Empty input MUST NOT match
        if (checkBlankAnswer('', b)) {
          falseAccepts.push(`Q: ${q.id}, Blank: ${b.id} passed with empty input`);
        }
      }
    }

    expect(totalBlanksVerified).toBeGreaterThanOrEqual(168);
    expect(failingBlanks, `Blanks failing self-validation: ${failingBlanks.join('; ')}`).toEqual([]);
    expect(falseAccepts, `Blanks accepting dummy input: ${falseAccepts.join('; ')}`).toEqual([]);
  });
});

describe('Empirical Adversarial Challenge 3: Batch Evaluation & Exact Boundary Conditions', () => {
  // Generate 20 test questions
  const batch20Questions: ClozeQuestion[] = Array.from({ length: 20 }, (_, idx) => ({
    id: `cloze_boundary_${idx + 1}`,
    week: 1,
    weekTitle: 'Week 1',
    topic: 'Boundary Topic',
    slideNumber: idx + 1,
    sourceSentence: `Sentence ${idx + 1} with answer bus.`,
    template: `Sentence ${idx + 1} with answer {{b1}}.`,
    blanks: [
      {
        id: 'b1',
        targetAnswer: 'bus',
        acceptedAnswers: ['bus']
      }
    ],
    explanation: `Explanation ${idx + 1}`
  }));

  function generateAnswers(correctCount: number): Record<string, string> {
    const answers: Record<string, string> = {};
    for (let i = 0; i < 20; i++) {
      answers[`cloze_boundary_${i + 1}_b1`] = i < correctCount ? 'bus' : 'incorrect_val';
    }
    return answers;
  }

  it('3.1 0% Boundary: 0/20 correct -> percent=0, isPassing=false', () => {
    const res = evaluateBatch(batch20Questions, generateAnswers(0), 0);
    expect(res.totalQuestions).toBe(20);
    expect(res.correctQuestions).toBe(0);
    expect(res.percent).toBe(0);
    expect(res.isPassing).toBe(false);
  });

  it('3.2 45% Boundary: 9/20 correct -> percent=45, isPassing=false', () => {
    const res = evaluateBatch(batch20Questions, generateAnswers(9), 0);
    expect(res.correctQuestions).toBe(9);
    expect(res.percent).toBe(45);
    expect(res.isPassing).toBe(false);
  });

  it('3.3 50% Boundary: 10/20 correct -> percent=50, isPassing=false', () => {
    const res = evaluateBatch(batch20Questions, generateAnswers(10), 0);
    expect(res.correctQuestions).toBe(10);
    expect(res.percent).toBe(50);
    expect(res.isPassing).toBe(false);
  });

  it('3.4 65% Boundary: 13/20 correct -> percent=65, isPassing=false', () => {
    const res = evaluateBatch(batch20Questions, generateAnswers(13), 0);
    expect(res.correctQuestions).toBe(13);
    expect(res.percent).toBe(65);
    expect(res.isPassing).toBe(false);
  });

  it('3.5 Exact 70% Boundary: 14/20 correct -> percent=70, isPassing=true', () => {
    const res = evaluateBatch(batch20Questions, generateAnswers(14), 0);
    expect(res.correctQuestions).toBe(14);
    expect(res.percent).toBe(70);
    expect(res.isPassing).toBe(true); // Must PASS at >= 70%
  });

  it('3.6 75% Boundary: 15/20 correct -> percent=75, isPassing=true', () => {
    const res = evaluateBatch(batch20Questions, generateAnswers(15), 0);
    expect(res.correctQuestions).toBe(15);
    expect(res.percent).toBe(75);
    expect(res.isPassing).toBe(true);
  });

  it('3.7 100% Boundary: 20/20 correct -> percent=100, isPassing=true', () => {
    const res = evaluateBatch(batch20Questions, generateAnswers(20), 0);
    expect(res.correctQuestions).toBe(20);
    expect(res.percent).toBe(100);
    expect(res.isPassing).toBe(true);
  });

  it('3.8 Empty batch boundary (0 questions) handles safely without dividing by zero', () => {
    const res = evaluateBatch([], {}, 0);
    expect(res.totalQuestions).toBe(0);
    expect(res.correctQuestions).toBe(0);
    expect(res.percent).toBe(0);
    expect(res.isPassing).toBe(false);
  });

  it('3.9 Boundary test with arbitrary question batch sizes', () => {
    // 1-question batch: 0% or 100%
    const singleQ = batch20Questions.slice(0, 1);
    expect(evaluateBatch(singleQ, { cloze_boundary_1_b1: 'wrong' }).percent).toBe(0);
    expect(evaluateBatch(singleQ, { cloze_boundary_1_b1: 'wrong' }).isPassing).toBe(false);
    expect(evaluateBatch(singleQ, { cloze_boundary_1_b1: 'bus' }).percent).toBe(100);
    expect(evaluateBatch(singleQ, { cloze_boundary_1_b1: 'bus' }).isPassing).toBe(true);

    // 7-question batch: 4/7 = 57% (fail), 5/7 = 71% (pass)
    const sevenQ = batch20Questions.slice(0, 7);
    const answers4: Record<string, string> = {};
    for (let i = 0; i < 7; i++) answers4[`cloze_boundary_${i + 1}_b1`] = i < 4 ? 'bus' : 'bad';
    const eval4 = evaluateBatch(sevenQ, answers4);
    expect(eval4.percent).toBe(57);
    expect(eval4.isPassing).toBe(false);

    const answers5: Record<string, string> = {};
    for (let i = 0; i < 7; i++) answers5[`cloze_boundary_${i + 1}_b1`] = i < 5 ? 'bus' : 'bad';
    const eval5 = evaluateBatch(sevenQ, answers5);
    expect(eval5.percent).toBe(71);
    expect(eval5.isPassing).toBe(true);
  });

  it('3.10 Multi-blank question evaluation: passes ONLY if all blanks are correct', () => {
    const multiBlankQ: ClozeQuestion = {
      id: 'cloze_multi_test',
      week: 1,
      weekTitle: 'Week 1',
      topic: 'Multi Blank',
      slideNumber: 1,
      sourceSentence: 'AL is low and AH is high.',
      template: '{{b1}} is low and {{b2}} is high.',
      blanks: [
        { id: 'b1', targetAnswer: 'AL', acceptedAnswers: ['al'] },
        { id: 'b2', targetAnswer: 'AH', acceptedAnswers: ['ah'] }
      ],
      explanation: 'Registers'
    };

    // Both correct -> Pass
    const bothOk = evaluateQuestion(multiBlankQ, { b1: 'AL', b2: 'AH' });
    expect(bothOk.isCorrect).toBe(true);

    // One correct, one wrong -> Fail
    const oneWrong = evaluateQuestion(multiBlankQ, { b1: 'AL', b2: 'BL' });
    expect(oneWrong.isCorrect).toBe(false);
    expect(oneWrong.blanks[0].isCorrect).toBe(true);
    expect(oneWrong.blanks[1].isCorrect).toBe(false);

    // Both wrong -> Fail
    const bothWrong = evaluateQuestion(multiBlankQ, { b1: 'DL', b2: 'DH' });
    expect(bothWrong.isCorrect).toBe(false);
  });

  it('3.11 getBatches() handles all boundary array lengths and edge cases', () => {
    expect(getBatches([])).toEqual([]);
    expect(getBatches(batch20Questions.slice(0, 1), 20).length).toBe(1);
    expect(getBatches(batch20Questions, 20).length).toBe(1);

    // 21 items -> 2 batches (20, 1)
    const items21 = [...batch20Questions, batch20Questions[0]];
    const b21 = getBatches(items21, 20);
    expect(b21.length).toBe(2);
    expect(b21[0].questions.length).toBe(20);
    expect(b21[1].questions.length).toBe(1);

    // 180 items from CLOZE_QUESTIONS -> 9 batches (9 of 20)
    const b180 = getBatches(CLOZE_QUESTIONS, 20);
    expect(b180.length).toBe(9);
    for (let i = 0; i < 9; i++) {
      expect(b180[i].questions.length).toBe(20);
    }

    // Non-positive batchSize defaults to 20 without hanging
    const safeBatches = getBatches(batch20Questions, 0);
    expect(safeBatches.length).toBe(1);
    expect(safeBatches[0].questions.length).toBe(20);
  });
});

describe('Empirical Adversarial Challenge 4: ClozeStorage Persistence & Recovery Stress', () => {
  beforeEach(() => {
    ClozeStorage.clear();
  });

  it('4.1 Sustains 1,000 rapid sequential read/write cycles without corruption', () => {
    for (let i = 0; i < 1000; i++) {
      ClozeStorage.saveAnswer(`q_${i % 20}`, `b_${i % 3}`, `ans_${i}`);
    }

    const answers = ClozeStorage.getAnswers();
    expect(Object.keys(answers).length).toBe(20);
    // Spot check last written answers
    expect(ClozeStorage.getAnswer('q_19', 'b_0')).toBe('ans_999');
  });

  it('4.2 Recovers gracefully from malformed JSON in storage without throwing', () => {
    // Inject corrupt JSON into memoryStore via mock or setItem
    (ClozeStorage as any).memoryStore['8086_cloze_answers_v1'] = 'CORRUPTED_{{{[[[';
    (ClozeStorage as any).memoryStore['8086_cloze_batch_scores_v1'] = 'INVALID_JSON_2';
    (ClozeStorage as any).memoryStore['8086_cloze_filter_pref_v1'] = 'NOT_JSON';

    // Must return safe fallbacks
    expect(ClozeStorage.getAnswers()).toEqual({});
    expect(ClozeStorage.getBatchScores()).toEqual({});
    expect(ClozeStorage.getFilterPreference()).toBeNull();
    expect(ClozeStorage.getAnswer('q1', 'b1')).toBe('');
  });

  it('4.3 Preserves batch score records and calculates accurate percentiles', () => {
    ClozeStorage.saveBatchScore(0, 0, 20);
    ClozeStorage.saveBatchScore(1, 10, 20);
    ClozeStorage.saveBatchScore(2, 14, 20);
    ClozeStorage.saveBatchScore(3, 20, 20);

    expect(ClozeStorage.getBatchScore(0)?.percent).toBe(0);
    expect(ClozeStorage.getBatchScore(1)?.percent).toBe(50);
    expect(ClozeStorage.getBatchScore(2)?.percent).toBe(70);
    expect(ClozeStorage.getBatchScore(3)?.percent).toBe(100);

    const scores = ClozeStorage.getBatchScores();
    expect(Object.keys(scores).length).toBe(4);
  });

  it('4.4 Clears completely when resetProgress / clear is invoked', () => {
    ClozeStorage.saveAnswer('q1', 'b1', 'test');
    ClozeStorage.saveBatchScore(0, 20, 20);
    ClozeStorage.saveFilterPreference(3, 'random');

    ClozeStorage.resetProgress();

    expect(ClozeStorage.getAnswers()).toEqual({});
    expect(ClozeStorage.getBatchScores()).toEqual({});
    expect(ClozeStorage.getFilterPreference()).toBeNull();
  });
});

describe('Empirical Adversarial Challenge 5: Rapid Language Switching Stress', () => {
  beforeEach(() => {
    StudyStorage.clearForTests();
  });

  it('5.1 Rapidly toggles language 1,000 times in StudyStorage without desync or memory leaks', () => {
    for (let i = 0; i < 1000; i++) {
      const targetLang = i % 2 === 0 ? 'en' : 'tr';
      StudyStorage.setLanguage(targetLang);
      expect(StudyStorage.getLanguage()).toBe(targetLang);
    }
  });

  it('5.2 Constrains invalid language inputs strictly to "tr"', () => {
    StudyStorage.setLanguage('invalid_lang' as any);
    expect(StudyStorage.getLanguage()).toBe('tr');

    StudyStorage.setLanguage('de' as any);
    expect(StudyStorage.getLanguage()).toBe('tr');
  });

  it('5.3 Rapidly toggles language in StudyView with an open drawer without duplication or state loss', () => {
    const container = new MockElement('div');
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    // Open Topic 1 drawer
    const topic1 = STUDY_TOPICS[0];
    studyView.openTopicDrawer(topic1);

    // Rapidly toggle language 50 times
    for (let i = 0; i < 50; i++) {
      const lang = i % 2 === 0 ? 'en' : 'tr';
      studyView.setLanguage(lang);

      expect(studyView.getLanguage()).toBe(lang);
      expect(StudyStorage.getLanguage()).toBe(lang);

      const drawerHtml = container.querySelector('#study-notebook-drawer')?.innerHTML || '';
      
      // Ensure drawer is still open and contains valid content
      expect(drawerHtml.length).toBeGreaterThan(100);

      if (lang === 'en') {
        expect(drawerHtml).toContain(topic1.titleEn || topic1.title);
        expect(drawerHtml).toContain('Official Course Lecture Slide Text (Verbatim Professor Content)');
        // Ensure banner is not duplicated
        const bannerCount = (drawerHtml.match(/Official Course Lecture Slide Text/g) || []).length;
        expect(bannerCount).toBe(1);
      } else {
        expect(drawerHtml).toContain(topic1.title);
        expect(drawerHtml).not.toContain('Official Course Lecture Slide Text');
      }
    }
  });

  it('5.4 Interleaves rapid language switching with topic navigation and spine filtering', () => {
    const container = new MockElement('div');
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    for (let i = 0; i < 15; i++) {
      const topic = STUDY_TOPICS[i];
      studyView.setLanguage(i % 2 === 0 ? 'en' : 'tr');
      studyView.openTopicDrawer(topic);
      studyView.setSpineFilter(i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'all');

      expect(studyView.getSelectedTopic()?.id).toBe(topic.id);
      expect(studyView.getSpineFilter()).toBe(i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'all');
    }
  });
});
