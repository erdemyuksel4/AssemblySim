/**
 * tests/study_bilingual.test.ts
 * 
 * Milestone M2 Unit Test Suite:
 * 1. Language persistence in StudyStorage (getLanguage, setLanguage, defaults, memory fallback).
 * 2. StudyView language switcher (topbar and drawer) rendering and reactive toggle.
 * 3. Bilingual content presentation (EN mode with theoryHtmlEn & official lecture banner, TR mode with theoryHtml).
 * 4. Primary Spine (Weeks 1-7) vs Geçen Yıl visual badges and week labels.
 * 5. Curriculum Spine Filtering (All Topics, Primary Spine 1-7, Geçen Yıl / Advanced).
 * 6. Edge cases and fallbacks (missing theoryHtmlEn fallback, bilingual search).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StudyStorage } from '../src/study/studyStorage.js';
import { StudyView } from '../src/study/studyView.js';
import { STUDY_TOPICS, MainTopic, SubLesson } from '../src/study/studyData.js';

// =========================================================================
// LIGHTWEIGHT, ROBUST IN-MEMORY DOM IMPLEMENTATION FOR NODE / VITEST
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
    return (this._textContent + ' ' + this.children.map(c => c.textContent).join(' ')).trim();
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

    // Compound selector, e.g. button.btn-lang[data-lang="en"]
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
    // Descendant selector (e.g. "#study-lang-switch-top .btn-lang")
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

// Setup global document mock if running under pure Node
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
// TEST SUITE: BILINGUAL STUDY VIEW & STORAGE INTEGRITY
// =========================================================================

describe('Milestone M2: StudyStorage Language Persistence', () => {
  beforeEach(() => {
    StudyStorage.clearForTests();
  });

  it('1. Defaults to Turkish ("tr") on fresh launch', () => {
    expect(StudyStorage.getLanguage()).toBe('tr');
  });

  it('2. Persists English ("en") language selection and retrieves it accurately', () => {
    StudyStorage.setLanguage('en');
    expect(StudyStorage.getLanguage()).toBe('en');
  });

  it('3. Persists Turkish ("tr") language selection and retrieves it accurately', () => {
    StudyStorage.setLanguage('en');
    expect(StudyStorage.getLanguage()).toBe('en');
    StudyStorage.setLanguage('tr');
    expect(StudyStorage.getLanguage()).toBe('tr');
  });

  it('4. Resets to default ("tr") when clearForTests is invoked', () => {
    StudyStorage.setLanguage('en');
    expect(StudyStorage.getLanguage()).toBe('en');
    StudyStorage.clearForTests();
    expect(StudyStorage.getLanguage()).toBe('tr');
  });
});

describe('Milestone M2: StudyView Language Switcher UI', () => {
  let container: MockElement;

  beforeEach(() => {
    StudyStorage.clearForTests();
    container = new MockElement('div');
  });

  it('5. Renders TR/EN language switcher buttons in the StudyView topbar', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    const langSwitchTop = container.querySelector('#study-lang-switch-top');
    expect(langSwitchTop).not.toBeNull();

    const trBtn = container.querySelector('#study-lang-switch-top .btn-lang[data-lang="tr"]');
    const enBtn = container.querySelector('#study-lang-switch-top .btn-lang[data-lang="en"]');

    expect(trBtn).not.toBeNull();
    expect(enBtn).not.toBeNull();
    expect(trBtn?.textContent).toContain('TR');
    expect(enBtn?.textContent).toContain('EN');

    // Default active button is TR
    expect(trBtn?.classList.contains('active')).toBe(true);
    expect(enBtn?.classList.contains('active')).toBe(false);
  });

  it('6. Clicking EN button in topbar switches view and storage to English', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    const enBtn = container.querySelector('#study-lang-switch-top .btn-lang[data-lang="en"]');
    const trBtn = container.querySelector('#study-lang-switch-top .btn-lang[data-lang="tr"]');

    enBtn?.click();

    expect(studyView.getLanguage()).toBe('en');
    expect(StudyStorage.getLanguage()).toBe('en');
    expect(enBtn?.classList.contains('active')).toBe(true);
    expect(trBtn?.classList.contains('active')).toBe(false);
  });

  it('7. Renders language switcher inside the Notebook Drawer and allows toggling while reading', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    // Open Topic 1 in drawer
    studyView.openTopicDrawer(STUDY_TOPICS[0]);

    const drawerSwitch = container.querySelector('.drawer-lang-switch');
    expect(drawerSwitch).not.toBeNull();

    const drawerEnBtn = container.querySelector('.drawer-lang-switch .btn-lang[data-lang="en"]');
    const drawerTrBtn = container.querySelector('.drawer-lang-switch .btn-lang[data-lang="tr"]');
    expect(drawerEnBtn).not.toBeNull();
    expect(drawerTrBtn).not.toBeNull();

    // Toggle to EN inside drawer
    drawerEnBtn?.click();

    expect(studyView.getLanguage()).toBe('en');
    expect(StudyStorage.getLanguage()).toBe('en');

    // Both topbar and updated drawer reflect active EN state
    const activeDrawerEnBtn = container.querySelector('.drawer-lang-switch .btn-lang[data-lang="en"]');
    expect(activeDrawerEnBtn?.classList.contains('active')).toBe(true);
    const topEnBtn = container.querySelector('#study-lang-switch-top .btn-lang[data-lang="en"]');
    expect(topEnBtn?.classList.contains('active')).toBe(true);
  });
});

describe('Milestone M2: Bilingual Content & Official Slide Banner Rendering', () => {
  let container: MockElement;

  beforeEach(() => {
    StudyStorage.clearForTests();
    container = new MockElement('div');
  });

  it('8. In EN mode, renders English titles and verbatim theoryHtmlEn with official slide banner', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    // Switch to English
    studyView.setLanguage('en');

    // Open Topic 1 (Week 1)
    const topic1 = STUDY_TOPICS[0];
    studyView.openTopicDrawer(topic1);

    const drawerHtml = container.querySelector('#study-notebook-drawer')?.innerHTML || '';

    // Title should be English
    expect(drawerHtml).toContain(topic1.titleEn || topic1.title);
    expect(drawerHtml).toContain(topic1.subLessons[0].titleEn || topic1.subLessons[0].title);

    // Official lecture slide banner must be displayed
    expect(drawerHtml).toContain('Official Course Lecture Slide Text (Verbatim Professor Content)');
    expect(drawerHtml).toContain('nb-callout info');

    // Verbatim English content from slide 4/5 must be present
    expect(drawerHtml).toContain('Microprocessor (MP)');
  });

  it('9. In TR mode, renders Turkish titles and academic theoryHtml without English banner', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    studyView.setLanguage('tr');

    const topic1 = STUDY_TOPICS[0];
    studyView.openTopicDrawer(topic1);

    const drawerHtml = container.querySelector('#study-notebook-drawer')?.innerHTML || '';

    // Title should be Turkish
    expect(drawerHtml).toContain(topic1.title);
    expect(drawerHtml).toContain(topic1.subLessons[0].title);

    // Theory step content should contain Turkish explanation and no EN banner
    const theoryContent = container.querySelector('#theory-step-content');
    expect(drawerHtml).toContain('Mikroişlemci Tanımı');
    expect(drawerHtml).not.toContain('Official Course Lecture Slide Text');
    expect(theoryContent?.textContent).toContain('Mikroişlemci');
  });

  it('10. Dynamically toggling language updates drawer content in place without closing', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    const topic1 = STUDY_TOPICS[0];
    studyView.openTopicDrawer(topic1);

    // Initially in TR
    expect(studyView.getLanguage()).toBe('tr');
    let drawerHtml = container.querySelector('#study-notebook-drawer')?.innerHTML || '';
    expect(drawerHtml).toContain(topic1.title);

    // Toggle to EN
    studyView.setLanguage('en');
    drawerHtml = container.querySelector('#study-notebook-drawer')?.innerHTML || '';
    expect(drawerHtml).toContain(topic1.titleEn!);
    expect(drawerHtml).toContain('Official Course Lecture Slide Text');

    // Toggle back to TR
    studyView.setLanguage('tr');
    drawerHtml = container.querySelector('#study-notebook-drawer')?.innerHTML || '';
    expect(drawerHtml).toContain(topic1.title);
  });
});

describe('Milestone M2: Primary Spine vs Geçen Yıl Badges & Spine Filtering', () => {
  let container: MockElement;

  beforeEach(() => {
    StudyStorage.clearForTests();
    container = new MockElement('div');
  });

  it('11. Verifies that Topics 1..7 are Primary Spine (1-to-1 Week 1..7) and Topics 8..15 are Geçen Yıl', () => {
    for (let i = 0; i < 7; i++) {
      const topic = STUDY_TOPICS[i];
      expect(topic.category).toBe('primary');
      expect(topic.weekNumber).toBe(i + 1);
      expect(topic.weekLabel).toBe(`Week ${i + 1}`);
    }

    for (let i = 7; i < 15; i++) {
      const topic = STUDY_TOPICS[i];
      expect(topic.category).toBe('secondary');
      expect(topic.weekLabel).toBe('Geçen Yıl');
    }
  });

  it('12. Renders "BİRİNCİL OMURGA" badge for Primary topics and "GEÇEN YIL / İLERİ KONULAR" for Secondary topics', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    const mapHtml = container.querySelector('#study-map-container')?.innerHTML || '';

    // Primary badge
    expect(mapHtml).toContain('BİRİNCİL OMURGA');
    expect(mapHtml).toContain('primary-spine');

    // Secondary badge
    expect(mapHtml).toContain('GEÇEN YIL / İLERİ KONULAR');
    expect(mapHtml).toContain('secondary-spine');
  });

  it('13. Renders 3 curriculum spine filter pills in StudyView: [Tüm Konular], [Hafta 1-7], [Geçen Yıl]', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    const filterBar = container.querySelector('.study-spine-filter-bar');
    expect(filterBar).not.toBeNull();

    const pillAll = container.querySelector('.btn-spine-filter[data-filter="all"]');
    const pillPrimary = container.querySelector('.btn-spine-filter[data-filter="primary"]');
    const pillSecondary = container.querySelector('.btn-spine-filter[data-filter="secondary"]');

    expect(pillAll).not.toBeNull();
    expect(pillPrimary).not.toBeNull();
    expect(pillSecondary).not.toBeNull();

    expect(pillAll?.textContent).toContain('Tüm Konular');
    expect(pillPrimary?.textContent).toContain('Hafta 1-7 (Birincil Omurga)');
    expect(pillSecondary?.textContent).toContain('Geçen Yıl (İleri Konular)');
  });

  it('14. Filtering by Primary Spine displays only Weeks 1-7 (7 topics) and hides Geçen Yıl (Topics 8-15)', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    // Default 'all' has 15 topic nodes
    let nodeCards = container.querySelectorAll('.mindmap-node-card');
    expect(nodeCards.length).toBe(15);

    // Filter to primary
    studyView.setSpineFilter('primary');

    nodeCards = container.querySelectorAll('.mindmap-node-card');
    expect(nodeCards.length).toBe(7);

    // Topics 14 and 15 must not be rendered
    const t14Node = container.querySelector('.mindmap-node-card[data-topic-id="topic-14-dma-and-os-support"]');
    const t15Node = container.querySelector('.mindmap-node-card[data-topic-id="topic-15-advanced-architectures"]');
    expect(t14Node).toBeNull();
    expect(t15Node).toBeNull();
  });

  it('15. Filtering by Secondary Spine displays only Geçen Yıl (8 topics) and hides Primary Spine', () => {
    const studyView = new StudyView(container as unknown as HTMLElement, {
      onReturnToEditor: () => {},
      onInsertCodeToEditor: () => {}
    });

    studyView.setSpineFilter('secondary');

    const nodeCards = container.querySelectorAll('.mindmap-node-card');
    expect(nodeCards.length).toBe(8);

    // Topics 14 and 15 must be rendered
    const t14Node = container.querySelector('.mindmap-node-card[data-topic-id="topic-14-dma-and-os-support"]');
    const t15Node = container.querySelector('.mindmap-node-card[data-topic-id="topic-15-advanced-architectures"]');
    expect(t14Node).not.toBeNull();
    expect(t15Node).not.toBeNull();

    // Topic 1 must not be rendered
    const t1Node = container.querySelector('.mindmap-node-card[data-topic-id="topic-1-fundamentals"]');
    expect(t1Node).toBeNull();
  });
});
