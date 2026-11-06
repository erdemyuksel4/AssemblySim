/**
 * topics_m1.ts
 *
 * AssemblySim Çalışma ve Müfredat Modülü 1 Facade:
 * - Topic 1: Bilgisayar Mimarisi Temelleri, Veriyolları ve Bellek Haritası (topic-1-fundamentals)
 * - Topic 2: Sayı Sistemleri, Dönüşümler, Tümleyenler, BCD ve ASCII (topic-2-numbers-and-codes)
 */

import type { MainTopic } from './studyData.js';
import { TOPIC_1 } from './topics/topic_01.js';
import { TOPIC_2 } from './topics/topic_02.js';

export { TOPIC_1, TOPIC_2 };
export const TOPICS_M1: MainTopic[] = [TOPIC_1, TOPIC_2];
