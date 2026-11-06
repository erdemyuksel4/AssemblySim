/**
 * topics_m3.ts
 *
 * Module 3 Study & Curriculum Topics Facade:
 * - Topic 5: 8086 Adresleme Modları ve Makine Kodu Formatı
 * - Topic 6: Veri Aktarım Komutları, Yığın (Stack) ve İşaretçiler
 * - Topic 7: Dizi/String İşlemleri, Blok Bellek Transferi ve Tablo Çevrimi (XLAT)
 */

import type { MainTopic } from './studyData.js';
import { TOPIC_5 } from './topics/topic_05.js';
import { TOPIC_6 } from './topics/topic_06.js';
import { TOPIC_7 } from './topics/topic_07.js';

export { TOPIC_5, TOPIC_6, TOPIC_7 };
export const TOPICS_M3: MainTopic[] = [TOPIC_5, TOPIC_6, TOPIC_7];
