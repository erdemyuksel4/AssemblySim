/**
 * midtermExamData.ts
 * 
 * 7. Hafta Sonrası Vize Sınavı Çalışma Soruları & Kod Tahmin Simülatörü
 * (Zor Puanlayan Hoca Standardında Hazırlanmıştır)
 * 
 * Doç. Dr. Mehmet Akif Çifci'nin slaytları, laboratuvar kodları, tahta notları
 * ve geçmiş yıl sınav soruları baz alınarak hazırlanmış; gerçekçi tuzaklar,
 * bayrak hesaplama matrisleri ve izleme tabloları (Trace Tables) içerir.
 */

export interface MidtermQuestion {
  id: string;
  category: 'trace' | 'flags' | 'traps' | 'coding';
  categoryLabel: string;
  points: number;
  title: string;
  difficulty: 'orta' | 'zor' | 'uzman';
  scenario: string;
  codeSnippet: string;
  initialState?: Record<string, string>;
  expectedRegisters: Array<{ name: string; expected: string; accepted?: string[]; note: string }>;
  expectedFlags: Array<{ name: 'CF' | 'ZF' | 'SF' | 'OF' | 'PF' | 'AF'; expected: '0' | '1'; reason: string }>;
  expectedMemory?: Array<{ address: string; expected: string; note: string }>;
  hocaRubric: string; // Puan kırma kriterleri ve hocanın çözüm anahtarı
}

export const MIDTERM_EXAM_QUESTIONS: MidtermQuestion[] = [
  // -------------------------------------------------------------------------
  // SORU 1: w11.pdf Slayt Klasiği — 0F5H + 00BH Tam Bayrak Türetimi (20 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q1-f5-add",
    category: "flags",
    categoryLabel: "🚩 Bayrak Türetimi & Aritmetik",
    points: 20,
    title: "Soru 1: 8-Bit Toplama Sonucu ve 6 Durum Bayrağının Tam Hesabı",
    difficulty: "zor",
    scenario: "AL = 0F5H ve BL = 00BH yüklenip ADD AL, BL çalıştırılıyor. Nihai AL değerini ve 6 durum bayrağını (CF, ZF, SF, OF, PF, AF) bit seviyesinde hesaplayarak giriniz.",
    codeSnippet: "ORG 100H\nMOV AL, 0F5H\nMOV BL, 00BH\nADD AL, BL\nHLT",
    initialState: { "AL": "F5H", "BL": "0BH" },
    expectedRegisters: [
      { name: "AL", expected: "00H", accepted: ["00H", "00", "0", "0x00", "0h"], note: "F5H (1111 0101b) + 0BH (0000 1011b) = 100H. 8-bit AL düşük baytı alır: 00H." }
    ],
    expectedFlags: [
      { name: "CF", expected: "1", reason: "Bit 7'den dışarı elde taştı (100H > FFH), CF = 1." },
      { name: "ZF", expected: "1", reason: "AL içindeki nihai sonuç 00H olduğu için ZF = 1." },
      { name: "AF", expected: "1", reason: "Bit 3'ten Bit 4'e alt nibble eldesi taştı (0101b + 1011b = 10000b), AF = 1." },
      { name: "PF", expected: "1", reason: "00H içinde '1' olan bitlerin sayısı 0'dır (0 çift sayıdır). Çift eşlik, PF = 1." },
      { name: "SF", expected: "0", reason: "En yüksek anlamlı bit (bit 7) 0 olduğu için SF = 0." },
      { name: "OF", expected: "0", reason: "İki zıt işaretli sayının (-11 ve +11) toplamında donanımsal taşma olamaz, OF = 0." }
    ],
    hocaRubric: "Hoca Puan Dağılımı: AL=00H (5P), CF=1 (3P), ZF=1 (3P), AF=1 (3P), PF=1 (3P, 0 çift sayıdır açıklaması aranır), SF=0 ve OF=0 (3P). PF'yi tek sayıp 0 yazan öğrenciden doğrudan 5 puan kırılır!"
  },

  // -------------------------------------------------------------------------
  // SORU 2: Donanımsal Çıkarma & 2'nin Tümleyeni (22H - 44H) (20 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q2-sub-hardware",
    category: "flags",
    categoryLabel: "🚩 Çıkarma Borcu & 2'nin Tümleyeni",
    points: 20,
    title: "Soru 2: 8086 Donanım Çıkarma Algoritması (SUB AL, BH)",
    difficulty: "zor",
    scenario: "AL = 22H ve BH = 44H verilmiştir. SUB AL, BH işlemi yürütülür. 8086'nın çıkarma için yürüttüğü 3 donanım adımını (2'nin tümleyeni + topla + eldenin terslenmesi) dikkate alarak AL ve bayrakları tahmin edin.",
    codeSnippet: "ORG 100H\nMOV AL, 22H\nMOV BH, 44H\nSUB AL, BH\nHLT",
    initialState: { "AL": "22H", "BH": "44H" },
    expectedRegisters: [
      { name: "AL", expected: "DEH", accepted: ["DEH", "DE", "0xDE", "deh"], note: "22H - 44H = -22H = DEH (1101 1110b)." }
    ],
    expectedFlags: [
      { name: "CF", expected: "1", reason: "22H + BCH = DEH (C_out=0). Donanım eldesi terslenir: NOT(0) = 1 (Borç alındı!), CF = 1." },
      { name: "ZF", expected: "0", reason: "DEH ≠ 0 olduğu için ZF = 0." },
      { name: "SF", expected: "1", reason: "DEH'in 7. biti 1'dir (negatif), SF = 1." },
      { name: "PF", expected: "1", reason: "1101 1110b içinde 6 adet 1 vardır (6 çifttir), PF = 1." },
      { name: "OF", expected: "0", reason: "+34 - (+68) = -34. 8-bit işaretli sınırlar içinde (-128..+127), OF = 0." },
      { name: "AF", expected: "1", reason: "Bit 3'ten Bit 4'e borç düşüşü olduğu için AF = 1." }
    ],
    hocaRubric: "Hoca Puan Dağılımı: AL=DEH (6P), CF=1 ve tersleme açıklaması (5P), SF=1 ve PF=1 (5P), OF=0 ve ZF=0 (4P)."
  },

  // -------------------------------------------------------------------------
  // SORU 3: Tahta Notu Döngü İzleme Tablosu (Week 6 Excalidraw) (20 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q3-loop-trace",
    category: "trace",
    categoryLabel: "🔄 Döngü İzleme Tablosu (Trace Table)",
    points: 20,
    title: "Soru 3: Tahtada Çözülen Döngünün 4 Çevrimlik Tam İzleme Tablosu",
    difficulty: "zor",
    scenario: "CX = 4, AX = 0, BX = 2 olarak başlatılan kodda: DONGU: ADD AX, BX; ADD BX, 2; LOOP DONGU. Döngü bittiğindeki nihai yazmaçları ve en kritik soru olan Sıfır Bayrağı (ZF) durumunu tahmin edin.",
    codeSnippet: "ORG 100H\nMOV CX, 4\nMOV AX, 0\nMOV BX, 2\n\nDONGU:\nADD AX, BX\nADD BX, 2\nLOOP DONGU\nHLT",
    initialState: { "CX": "4", "AX": "0", "BX": "2" },
    expectedRegisters: [
      { name: "AX", expected: "14H", accepted: ["14H", "14", "20", "0x14", "14h"], note: "Adım 1: AX=2, Adım 2: AX=6, Adım 3: AX=12, Adım 4: AX=20 (Hex 14H)." },
      { name: "BX", expected: "0AH", accepted: ["0AH", "0A", "10", "0x0A", "0ah"], note: "BX her adımda 2 artar: 2 -> 4 -> 6 -> 8 -> 10 (Hex 0AH)." },
      { name: "CX", expected: "0000H", accepted: ["0000H", "0000", "0", "0x0000", "0h"], note: "Döngü 4 çevrim sonra CX=0 olur ve çıkar." }
    ],
    expectedFlags: [
      { name: "ZF", expected: "0", reason: "🚨 HOCANIN EN BÜYÜK SINAV KURALI: LOOP komutu bayrakları ASLA DEĞİŞTİRMEZ! CX=0 olsa bile ZF 1 OLMAZ! En son ADD BX, 2 komutunda BX=10 olduğu için ZF = 0 kalır!" },
      { name: "CF", expected: "0", reason: "Toplama işlemlerinde elde taşması oluşmamıştır." }
    ],
    hocaRubric: "Hoca Puan Dağılımı: AX=14H (5P), BX=0AH (5P), CX=0000H (3P), ZF=0 (7P - Bu sorunun can damarıdır! Öğrencilerin %80'i CX=0 diye ZF=1 yazar; hoca bunu yazana acımaz 7 puanı siler!)."
  },

  // -------------------------------------------------------------------------
  // SORU 4: Sınav Tuzakları — INC ve CF Korunumu (15 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q4-inc-trap",
    category: "traps",
    categoryLabel: "⚡ Sınav Tuzakları (Traps & Gotchas)",
    points: 15,
    title: "Soru 4: Taşmaya Rağmen CF'nin Değişmemesi Tuzağı (INC AL)",
    difficulty: "orta",
    scenario: "CF = 1 kuruludur. AL = 0FFH iken INC AL çalıştırılıyor. AL, ZF ve CF bayrağını tahmin ediniz.",
    codeSnippet: "; CF = 1 baslatilmistir\nSTC\nMOV AL, 0FFH\nINC AL\nHLT",
    initialState: { "CF": "1", "AL": "FFH" },
    expectedRegisters: [
      { name: "AL", expected: "00H", accepted: ["00H", "00", "0", "0x00", "0h"], note: "0FFH + 1 = 100H -> 8-bit AL = 00H." }
    ],
    expectedFlags: [
      { name: "ZF", expected: "1", reason: "AL = 00H olduğu için ZF = 1 kurulur." },
      { name: "CF", expected: "1", reason: "INC ve DEC komutları Carry Flag'i (CF) ASLA DEĞİŞTİRMEZ! Başlangıçtaki CF=1 aynen kalır." }
    ],
    hocaRubric: "Hoca Puan Dağılımı: AL=00H (4P), ZF=1 (4P), CF=1 (7P - 'Taşma oldu CF=1 oldu' diyen değil, 'INC komutu CF'yi koruduğu için 1 kaldı' diyen tam puan alır)."
  },

  // -------------------------------------------------------------------------
  // SORU 5: Yığın & PUSH AX Little-Endian Byte Analizi (15 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q5-stack-bytes",
    category: "trace",
    categoryLabel: "🥞 Yığın Mimarisi & LIFO",
    points: 15,
    title: "Soru 5: PUSH AX Komutunda SP Değişimi ve Bellek Bayt Sırası",
    difficulty: "orta",
    scenario: "SS = 3000H, SP = 0200H iken AX = 4567H verisi yığına atılıyor (PUSH AX). Yeni SP değerini, SS:[01FEH] ve SS:[01FFH] bellek baytlarını belirleyin.",
    codeSnippet: "ORG 100H\nMOV AX, 4567H\nPUSH AX\nHLT",
    initialState: { "SS": "3000H", "SP": "0200H", "AX": "4567H" },
    expectedRegisters: [
      { name: "SP", expected: "01FEH", accepted: ["01FEH", "01FE", "1FEH", "1FE", "0x01FE"], note: "PUSH SP'yi 2 AZALTIR: 0200H - 2 = 01FEH." }
    ],
    expectedFlags: [],
    expectedMemory: [
      { address: "SS:[01FEH] (Düşük Adres / SP)", expected: "67H", note: "Little-Endian: Düşük adrese kelimenin düşük baytı (AL = 67H) yazılır." },
      { address: "SS:[01FFH] (Yüksek Adres / SP+1)", expected: "45H", note: "Yüksek adrese kelimenin yüksek baytı (AH = 45H) yazılır." }
    ],
    hocaRubric: "Hoca Puan Dağılımı: SP=01FEH (5P), SS:[01FEH]=67H (5P), SS:[01FFH]=45H (5P). Baytları ters yazan veya SP=0202H yapan doğrudan 0 puan alır."
  },

  // -------------------------------------------------------------------------
  // SORU 6: Bölme Taşması ve Tip 0 Hatası (Sınav Sorusu) (15 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q6-div-overflow",
    category: "traps",
    categoryLabel: "⚡ Hata Ayıklama & Kesmeler",
    points: 15,
    title: "Soru 6: DIV BL Komutunda Neden Divide Overflow (Tip 0) Oluşur?",
    difficulty: "zor",
    scenario: "AX = 3000 (0BB8H) ve BL = 2 yüklenip DIV BL komutu veriliyor. Bu komut neden çalışmaz ve işlemci hangi donanımsal kesmeyi üretir?",
    codeSnippet: "ORG 100H\nMOV AX, 3000\nMOV BL, 2\nDIV BL\nHLT",
    initialState: { "AX": "3000", "BL": "2" },
    expectedRegisters: [
      { name: "INTERRUPT", expected: "INT 0", accepted: ["INT 0", "INT 00H", "0", "00H", "Tip 0", "Divide Error"], note: "Bölüm sonucu (1500) 8-bitlik AL'ye (maks 255) sığmadığı için Bölme Taşması (Divide Overflow / Interrupt 0) oluşur!" }
    ],
    expectedFlags: [],
    hocaRubric: "Hoca Puan Dağılımı: 'Bölüm 1500 çıkar, AL maksimum 255 alabilir, bölme taşması oluşur' açıklaması (10P), 'Tip 0 Kesmesi / Divide Error üretilir' (5P)."
  },

  // -------------------------------------------------------------------------
  // SORU 7: Çoklu Kelime Çıkarma (SBB) — 32-Bit DD Çıkarma (w11.pdf) (20 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q7-sbb-multiword",
    category: "flags",
    categoryLabel: "🚩 SBB Borç Zinciri",
    points: 20,
    title: "Soru 7: 32-Bitlik Çıkarma İşlemi (62562FAH - 412963BH)",
    difficulty: "uzman",
    scenario: "w11.pdf'teki 32-bit çıkarma: Düşük kelimeler SUB AX, [DATA2] ile çıkarılıyor (62FAH - 963BH = CCBFH, borç CF=1 oluşur). Üst kelimeler SBB DX, [DATA2+2] ile (0625H - 0412H - CF) çıkarılıyor. DX, AX ve CF'yi tahmin edin.",
    codeSnippet: "ORG 100H\n; DATA1: 062562FAH, DATA2: 0412963BH\nMOV AX, 62FAH\nSUB AX, 963BH   ; AX = CCBFH, CF = 1\nMOV DX, 0625H\nSBB DX, 0412H   ; DX = 0625H - 0412H - 1 = ?\nHLT",
    initialState: {},
    expectedRegisters: [
      { name: "AX", expected: "CCBFH", accepted: ["CCBFH", "CCBF", "0xCCBF"], note: "62FAH - 963BH = CCBFH (CF=1 borç alındı)." },
      { name: "DX", expected: "0212H", accepted: ["0212H", "0212", "212H", "212", "0x0212"], note: "0625H - 0412H - 1 (CF) = 0212H." }
    ],
    expectedFlags: [
      { name: "CF", expected: "0", reason: "0625H > 0413H olduğu için üst kelimede borç alınmamıştır, CF = 0." },
      { name: "ZF", expected: "0", reason: "Sonuç sıfır değildir, ZF = 0." }
    ],
    hocaRubric: "Hoca Puan Dağılımı: AX=CCBFH (7P), DX=0212H (CF'nin 1 düşüldüğünü hesaplayan öğrenci 8P), CF=0 (5P)."
  },

  // -------------------------------------------------------------------------
  // SORU 8: Klasik Kodlama — 0xaa Bitişli Dizide Max Bulma (Code Examples PDF) (25 Puan)
  // -------------------------------------------------------------------------
  {
    id: "vize-q8-max-element",
    category: "coding",
    categoryLabel: "💻 Vize Kodlama Sorusu (Tam Puan)",
    points: 25,
    title: "Soru 8: 0xaa İle Sonlanan Bayt Dizisindeki En Büyük Elemanı Bulma",
    difficulty: "zor",
    scenario: "DS:SI adresinde 0AAH baytı ile sonlanan pozitif işaretsiz bir bayt dizisi bulunmaktadır. LODSB ve CMP komutlarını kullanarak dizinin en büyük elemanını BL yazmacına bulan assembly kodunu yazınız.",
    codeSnippet: "; 0AAH sonlu dizide max bulma\nORG 100H\nMOV SI, 0200H\nMOV BL, 0        ; Baslangic max\n\nKONTROL:\nLODSB\nCMP AL, 0AAH\nJZ BITTI\nCMP AL, BL\nJB KONTROL\nMOV BL, AL\nJMP KONTROL\n\nBITTI:\nHLT",
    initialState: {},
    expectedRegisters: [
      { name: "BL", expected: "MAX", accepted: ["MAX", "En Büyük Eleman"], note: "Dizi taranarak en büyük eleman BL içine aktarılır." }
    ],
    expectedFlags: [],
    hocaRubric: "Hoca Puanlama Kriterleri: LODSB ile SI ilerletme (5P), 0AAH dizi sonu kontrolü JZ (5P), CMP AL, BL ve işaretsiz JB atlaması (10P - Eğer JL kullanılırsa 5P kırılır!), Max güncelleme ve döngü akışı (5P)."
  }
];
