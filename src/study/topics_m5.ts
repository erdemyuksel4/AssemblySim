/**
 * topics_m5.ts
 * 
 * Module 5 Study Topics Facade:
 * - Topic 11: Program Akış Kontrolü, Koşullu Sıçramalar, Döngüler ve Prosedürler
 * - Topic 12: Giriş/Çıkış (G/Ç) Portları, Donanım Arayüzleri ve 8255 PPI
 * - Topic 13: Kesmeler, Kesme Vektör Tablosu (IVT) ve İstisna Mimarisi
 * - Topic 14: Doğrudan Bellek Erişimi (DMA 8237) ve İşletim Sistemi Desteği
 * - Topic 15: İleri Mimariler: Pipelining, Cache, Makrolar, 8085 ve Paralel İşleme
 */

import type { MainTopic } from './studyData.js';
import { TOPIC_11 } from './topics/topic_11.js';
import { TOPIC_12 } from './topics/topic_12.js';
import { TOPIC_13 } from './topics/topic_13.js';
import { TOPIC_14 } from './topics/topic_14.js';
import { TOPIC_15 } from './topics/topic_15.js';

export { TOPIC_11, TOPIC_12, TOPIC_13, TOPIC_14, TOPIC_15 };
export const TOPICS_M5: MainTopic[] = [TOPIC_11, TOPIC_12, TOPIC_13, TOPIC_14, TOPIC_15];
