/**
 * topics_m4.ts
 * 
 * Module 4 Study Topics Facade:
 * - Topic 8: Aritmetik İşlemler: Toplama, Çıkarma, Çarpma, Bölme ve Bayraklar
 * - Topic 9: BCD ve ASCII Aritmetiği: DAA, DAS, AAA, AAS, AAM, AAD
 * - Topic 10: Mantıksal İşlemler, Maskeleme ve Bit Kaydırma/Döndürme
 */

import type { MainTopic } from './studyData.js';
import { TOPIC_8 } from './topics/topic_08.js';
import { TOPIC_9 } from './topics/topic_09.js';
import { TOPIC_10 } from './topics/topic_10.js';

export { TOPIC_8, TOPIC_9, TOPIC_10 };
export const TOPICS_M4: MainTopic[] = [TOPIC_8, TOPIC_9, TOPIC_10];
