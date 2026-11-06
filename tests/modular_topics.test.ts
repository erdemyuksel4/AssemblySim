import { describe, it, expect } from 'vitest';
import { TOPIC_1 } from '../src/study/topics/topic_01.js';
import { TOPIC_2 } from '../src/study/topics/topic_02.js';
import { TOPIC_3 } from '../src/study/topics/topic_03.js';
import { TOPIC_4 } from '../src/study/topics/topic_04.js';
import { TOPIC_5 } from '../src/study/topics/topic_05.js';
import { TOPIC_6 } from '../src/study/topics/topic_06.js';
import { TOPIC_7 } from '../src/study/topics/topic_07.js';
import { TOPIC_8 } from '../src/study/topics/topic_08.js';
import { TOPIC_9 } from '../src/study/topics/topic_09.js';
import { TOPIC_10 } from '../src/study/topics/topic_10.js';
import { TOPIC_11 } from '../src/study/topics/topic_11.js';
import { TOPIC_12 } from '../src/study/topics/topic_12.js';
import { TOPIC_13 } from '../src/study/topics/topic_13.js';
import { TOPIC_14 } from '../src/study/topics/topic_14.js';
import { TOPIC_15 } from '../src/study/topics/topic_15.js';

import { TOPICS_M1 } from '../src/study/topics_m1.js';
import { TOPICS_M2 } from '../src/study/topics_m2.js';
import { TOPICS_M3 } from '../src/study/topics_m3.js';
import { TOPICS_M4 } from '../src/study/topics_m4.js';
import { TOPICS_M5 } from '../src/study/topics_m5.js';

describe('Modular Topics Scaffolding (M0)', () => {
  const topics = [
    TOPIC_1, TOPIC_2, TOPIC_3, TOPIC_4, TOPIC_5,
    TOPIC_6, TOPIC_7, TOPIC_8, TOPIC_9, TOPIC_10,
    TOPIC_11, TOPIC_12, TOPIC_13, TOPIC_14, TOPIC_15,
  ];

  it('exports all 15 modular topics with numbers 1 to 15', () => {
    expect(topics.length).toBe(15);
    topics.forEach((t, i) => {
      expect(t.number).toBe(i + 1);
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.shortTitle).toBeTruthy();
      expect(t.badge).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(t.summary).toBeTruthy();
      expect(Array.isArray(t.opcodes)).toBe(true);
      expect(t.opcodes.length).toBeGreaterThanOrEqual(3);
      expect(t.mindMap).toBeDefined();
      expect(t.subLessons.length).toBe(3);
    });
  });

  it('preserves exact object identity across facades', () => {
    expect(TOPICS_M1).toEqual([TOPIC_1, TOPIC_2]);
    expect(TOPICS_M2).toEqual([TOPIC_3, TOPIC_4]);
    expect(TOPICS_M3).toEqual([TOPIC_5, TOPIC_6, TOPIC_7]);
    expect(TOPICS_M4).toEqual([TOPIC_8, TOPIC_9, TOPIC_10]);
    expect(TOPICS_M5).toEqual([TOPIC_11, TOPIC_12, TOPIC_13, TOPIC_14, TOPIC_15]);
  });
});
