/**
 * tests/cloze_view.test.ts
 * Comprehensive unit tests for ClozeView UI component (Milestone M4).
 * Tests notebook layout, filtering, sorting, answering, 20-question batch evaluation,
 * instant green/red feedback, slide citations, and persistence.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClozeView } from '../src/cloze/clozeView.js';
import { ClozeStorage } from '../src/cloze/clozeStorage.js';
import { CLOZE_QUESTIONS } from '../src/cloze/clozeData.js';

// =========================================================================
// MINIMAL ROBUST MOCK DOM IMPLEMENTATION FOR NODE ENVIRONMENT
// =========================================================================

class MockClassList {
  private classes: Set<string> = new Set();
  constructor(initial: string = '') {
    initial.split(/\s+/).filter(Boolean).forEach(c => this.classes.add(c));
  }
  add(...names: string[]): void {
    names.forEach(n => this.classes.add(n));
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
  public textContent: string = '';
  public value: string = '';
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
    this.parseSimpleHtml(html);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
    if (name === 'id') this.id = value;
    if (name === 'class') this.className = value;
    if (name === 'value') this.value = value;
  }

  getAttribute(name: string): string | null {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    if (name === 'value') return this.value;
    return this.attributes.get(name) ?? null;
  }

  appendChild(child: MockElement): MockElement {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  remove(): void {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) {
        this.parentNode.children.splice(idx, 1);
      }
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
      h({ ...event, target: this, currentTarget: this, stopPropagation: () => {}, preventDefault: () => {} });
    }
    return true;
  }

  click(): void {
    this.dispatchEvent({ type: 'click' });
  }

  focus(): void {}
  select(): void {}

  closest(selector: string): MockElement | null {
    let curr: MockElement | null = this;
    while (curr) {
      if (curr.matches(selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  matches(selector: string): boolean {
    selector = selector.trim();
    if (selector.startsWith('#')) {
      return this.id === selector.slice(1);
    }
    if (selector.startsWith('.')) {
      return this.classList.contains(selector.slice(1));
    }
    if (selector.startsWith('[') && selector.endsWith(']')) {
      const inside = selector.slice(1, -1);
      const [attr, val] = inside.split('=');
      if (val) {
        const cleanVal = val.replace(/^["']|["']$/g, '');
        return this.getAttribute(attr) === cleanVal;
      }
      return this.attributes.has(attr);
    }
    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  querySelector(selector: string): MockElement | null {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector: string): MockElement[] {
    const results: MockElement[] = [];

    const search = (node: MockElement) => {
      for (const child of node.children) {
        if (child.matches(selector)) {
          results.push(child);
        }
        search(child);
      }
    };

    search(this);
    return results;
  }

  private parseSimpleHtml(html: string): void {
    // Basic regex parser to turn common tags into MockElements
    const tagRegex = /<([a-zA-Z0-9]+)([^>]*)>(?:([\s\S]*?)<\/\1>)?/g;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
      const tagName = match[1];
      const attrStr = match[2];
      const innerContent = match[3] || '';

      const el = new MockElement(tagName);
      el.parentNode = this;

      // Extract attributes
      const attrRegex = /([a-zA-Z0-9_-]+)(?:=["']([^"']*)["'])?/g;
      let aMatch: RegExpExecArray | null;
      while ((aMatch = attrRegex.exec(attrStr)) !== null) {
        const k = aMatch[1];
        const v = aMatch[2] !== undefined ? aMatch[2] : '';
        el.setAttribute(k, v);
      }

      if (innerContent) {
        el.textContent = innerContent.replace(/<[^>]*>/g, '').trim();
        el.innerHTML = innerContent;
      }

      this.children.push(el);
    }
  }
}

// Setup global document mock if running under Node
if (typeof document === 'undefined') {
  (globalThis as any).document = {
    createElement: (tag: string) => new MockElement(tag),
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

describe('ClozeView (Milestone M4 Interactive Notebook UI)', () => {
  let container: MockElement;

  beforeEach(() => {
    ClozeStorage.clear();
    container = new MockElement('div');
  });

  it('1. Initializes and renders notebook paper structure and 20-question batches', () => {
    const clozeView = new ClozeView(container as unknown as HTMLElement);

    expect(clozeView).toBeDefined();
    expect(clozeView.getFilteredQuestions().length).toBe(CLOZE_QUESTIONS.length);
    expect(clozeView.getFilteredQuestions().length).toBe(180);

    // 180 questions split into 20-question batches = 9 batches (9 x 20)
    const batches = clozeView.getBatches();
    expect(batches.length).toBe(9);
    expect(batches[0].questions.length).toBe(20);
    expect(batches[8].questions.length).toBe(20);

    // Verify key UI classes exist in rendered markup
    expect(container.innerHTML).toContain('cloze-root');
    expect(container.innerHTML).toContain('cloze-notebook-container');
    expect(container.innerHTML).toContain('cloze-notebook-page');
    expect(container.innerHTML).toContain('cloze-spiral-binding');
    expect(container.innerHTML).toContain('cloze-margin-line');
    expect(container.innerHTML).toContain('cloze-batch-section');
    expect(container.innerHTML).toContain('btn-cloze-check-batch');
  });

  it('2. Filters questions by specific week and updates batch count and persistence', () => {
    const clozeView = new ClozeView(container as unknown as HTMLElement);

    // Filter to Week 1
    clozeView.setWeekFilter(1);

    const w1Questions = clozeView.getFilteredQuestions();
    expect(w1Questions.length).toBe(24);
    for (const q of w1Questions) {
      expect(q.week).toBe(1);
    }

    // 24 questions = 2 batches (20 + 4)
    const batches = clozeView.getBatches();
    expect(batches.length).toBe(2);
    expect(batches[0].questions.length).toBe(20);
    expect(batches[1].questions.length).toBe(4);

    // Check persistence
    const pref = ClozeStorage.getFilterPreference();
    expect(pref).toBeDefined();
    expect(pref?.week).toBe(1);
  });

  it('3. Toggles sort order between sequential and random mode with persistence', () => {
    const clozeView = new ClozeView(container as unknown as HTMLElement);

    clozeView.setSortOrder('random');
    let pref = ClozeStorage.getFilterPreference();
    expect(pref?.sortOrder).toBe('random');

    clozeView.setSortOrder('sequential');
    pref = ClozeStorage.getFilterPreference();
    expect(pref?.sortOrder).toBe('sequential');

    // Sequential ensures week 1 questions precede week 2
    const questions = clozeView.getFilteredQuestions();
    expect(questions[0].week).toBe(1);
    expect(questions[questions.length - 1].week).toBe(7);
  });

  it('4. Concept search filters questions matching keyword', () => {
    const clozeView = new ClozeView(container as unknown as HTMLElement);

    clozeView.setSearchQuery('microprocessor');
    const matched = clozeView.getFilteredQuestions();
    expect(matched.length).toBeGreaterThan(0);
    for (const q of matched) {
      const fullText = (q.sourceSentence + q.topic + q.weekTitle + q.explanation + q.blanks.map(b => b.targetAnswer).join(' ')).toLowerCase();
      expect(fullText).toContain('microprocessor');
    }
  });

  it('5. Evaluates a 20-question batch on "Kontrol Et" and yields instant feedback and citations', () => {
    const clozeView = new ClozeView(container as unknown as HTMLElement);
    clozeView.setWeekFilter(1);

    const batch0 = clozeView.getBatches()[0];
    expect(batch0.questions.length).toBe(20);

    // Provide answers for all 20 questions in Batch 0
    for (let i = 0; i < 20; i++) {
      const q = batch0.questions[i];
      for (const blank of q.blanks) {
        if (i === 0) {
          // Intentionally answer first question correctly
          ClozeStorage.saveAnswer(q.id, blank.id, blank.targetAnswer);
        } else if (i === 1) {
          // Intentionally answer second question with a wrong value
          ClozeStorage.saveAnswer(q.id, blank.id, 'completely_incorrect_dummy_string');
        } else {
          // Rest correct
          ClozeStorage.saveAnswer(q.id, blank.id, blank.targetAnswer);
        }
      }
    }

    // Trigger batch evaluation
    const result = clozeView.checkBatch(0);
    expect(result).not.toBeNull();
    expect(result!.totalQuestions).toBe(20);
    expect(result!.correctQuestions).toBe(19);
    expect(result!.percent).toBe(95);
    expect(result!.isPassing).toBe(true);

    // Q0 must be correct
    const q0Eval = result!.details[batch0.questions[0].id];
    expect(q0Eval.isCorrect).toBe(true);
    expect(q0Eval.blanks[0].isCorrect).toBe(true);

    // Q1 must be incorrect
    const q1Eval = result!.details[batch0.questions[1].id];
    expect(q1Eval.isCorrect).toBe(false);
    expect(q1Eval.blanks[0].isCorrect).toBe(false);
    expect(q1Eval.blanks[0].targetAnswer).toBe(batch0.questions[1].blanks[0].targetAnswer);

    // Stored batch score check
    const storedScore = ClozeStorage.getBatchScore(0);
    expect(storedScore).toBeDefined();
    expect(storedScore?.score).toBe(19);
    expect(storedScore?.percent).toBe(95);
  });

  it('6. ResetAll clears stored answers and batch scores', () => {
    const clozeView = new ClozeView(container as unknown as HTMLElement);

    ClozeStorage.saveAnswer('cloze_w1_001', 'b1', 'microprocessor');
    ClozeStorage.saveBatchScore(0, 20, 20);

    expect(ClozeStorage.getAnswer('cloze_w1_001', 'b1')).toBe('microprocessor');
    expect(ClozeStorage.getBatchScore(0)).not.toBeNull();

    clozeView.resetAll();

    expect(ClozeStorage.getAnswer('cloze_w1_001', 'b1')).toBe('');
    expect(ClozeStorage.getBatchScore(0)).toBeNull();
  });

  it('7. Invokes onReturnToEditor callback when return button is clicked', () => {
    let returnFired = false;
    const clozeView = new ClozeView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {
        returnFired = true;
      }
    });

    const returnBtn = container.querySelector('#btn-cloze-return');
    expect(returnBtn).not.toBeNull();
    returnBtn?.click();

    expect(returnFired).toBe(true);
  });
});
