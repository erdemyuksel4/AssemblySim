/**
 * topics_m2.ts
 * 
 * Module 2 Study Topics Facade:
 * - Topic 3: 8086 Donanım İç Mimarisi, BIU/EU İşbölümü ve Prefetch Kuyruğu
 * - Topic 4: Programlama Modeli, Yazmaçlar, FLAGS ve 20-Bit Segmentasyon
 */

import type { MainTopic } from './studyData.js';
import { TOPIC_3 } from './topics/topic_03.js';
import { TOPIC_4 } from './topics/topic_04.js';

export { TOPIC_3, TOPIC_4 };
export const TOPICS_M2: MainTopic[] = [TOPIC_3, TOPIC_4];
