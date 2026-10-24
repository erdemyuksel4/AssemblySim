import { RoadmapMilestone, Challenge } from './types.js';

export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: 'milestone-1',
    number: 1,
    title: '8086 Mimarisi, Bus Yapısı ve Bellek Segmentasyonu',
    description: '8086 donanım blokları (BIU & EU), 14 adet yazmaç kümesi, 1 MB bellek haritası (TPA / Video / BIOS), 20-bit adresleme ve Little-Endian prensibi. Bu aşamada kodlama görevi yoktur; interaktif hesaplayıcı ve görselleştirici keşif araçları yer alır.',
    topics: [
      {
        id: 'topic-biu-eu',
        title: 'BIU ve EU Donanım Birimleri',
        opcodes: [],
        description: 'Komut ön getirme kuyruğu (Prefetch Queue) ve ALU yürütme birimi işbölümü.',
        challengeIds: []
      },
      {
        id: 'topic-regs',
        title: '14 Adet Yazmaç Kümesi & Durum Bayrakları',
        opcodes: [],
        description: 'Genel amaçlı veri yazmaçları (AX, BX, CX, DX), işaretçiler/indeksler (SP, BP, SI, DI) ve segment yazmaçları (CS, DS, SS, ES).',
        challengeIds: []
      },
      {
        id: 'topic-addr-endian',
        title: '20-Bit Fiziksel Adresleme & Little-Endian Prensibi',
        opcodes: [],
        description: 'Segment:Offset hesaplama formülü (PA = Segment × 16 + Offset) ve bellekte düşük baytın önce saklanması.',
        challengeIds: []
      }
    ]
  },
  {
    id: 'milestone-2',
    number: 2,
    title: 'Temel Veri Aktarımı ve Adresleme Modları',
    description: '8086 mimarisinin temel taşı olan veri transfer komutları (MOV, XCHG, LEA) ve işlemcinin belleğe erişim sağlayan 7 adresleme modu.',
    topics: [
      {
        id: 'topic-mov',
        title: 'MOV Komutu ve 7 Adresleme Modu',
        opcodes: ['MOV'],
        description: 'Immediate (ivedi), Register ve Direct/Indirect bellek adresleme modları ile veri taşıma kuralları.',
        challengeIds: ['ch-mov-basic', 'ch-mov-memory']
      },
      {
        id: 'topic-xchg',
        title: 'XCHG Komutu ile Atomik Değer Takası',
        opcodes: ['XCHG'],
        description: 'İki register veya bir register ile bellek arasındaki verileri üçüncü bir değişkene gerek duymadan takas etme.',
        challengeIds: ['ch-xchg-swap']
      },
      {
        id: 'topic-lea',
        title: 'LEA ve Efektif Adres Hesaplama',
        opcodes: ['LEA'],
        description: 'Bellek içeriğini değil, o belleğin ofset adresini hesaplayıp register içine yükleme.',
        challengeIds: ['ch-lea-offset']
      },
      {
        id: 'topic-capstone-m2',
        title: '🎯 Aşama 1-2 Kapsayıcı Sentez Görevi',
        opcodes: ['MOV', 'XCHG', 'LEA'],
        description: 'Aşama 1 (14 Yazmaç, 20-Bit Adres Hesabı, Little-Endian) ve Aşama 2 (MOV, XCHG, LEA, 7 Adresleme Modu) konularını harmanlayan pratik LeetCode sınavı.',
        challengeIds: ['ch-capstone-stage2']
      }
    ]
  },
  {
    id: 'milestone-3',
    number: 3,
    title: 'Aritmetik İşlemler ve Bayrak Dinamikleri',
    description: 'Toplama, çıkarma, çarpma, bölme ve işlem sonucunun Status Register (Bayraklar: CF, ZF, SF, OF, AF, PF) üzerindeki etkileri.',
    topics: [
      {
        id: 'topic-add-sub',
        title: 'Toplama, Çıkarma ve İki\'nin Tümleyeni',
        opcodes: ['ADD', 'SUB', 'INC', 'DEC', 'NEG'],
        description: 'Temel tam sayı aritmetiği ve NEG ile işaret değiştirme (INC/DEC kuralı: CF asla değişmez!).',
        challengeIds: ['ch-add-sub-sum', 'ch-neg-twos']
      },
      {
        id: 'topic-adc-sbb',
        title: 'Eldeli İşlemler ve Genişletilmiş Aritmetik',
        opcodes: ['ADC', 'SBB'],
        description: 'Carry Flag kullanarak 16-bit işlemcide 32-bit sayılarla toplama ve çıkarma.',
        challengeIds: ['ch-adc-32bit']
      },
      {
        id: 'topic-mul-div',
        title: 'Çarpma ve Bölme İşlemleri',
        opcodes: ['MUL', 'IMUL', 'DIV', 'IDIV'],
        description: 'İşaretsiz ve işaretli çarpma/bölme, DX:AX register çiftinin kullanımı, CBW/CWD ve bölme taşması (INT 0).',
        challengeIds: ['ch-mul-square', 'ch-div-mod']
      },
      {
        id: 'topic-capstone-m3',
        title: '🎯 Aşama 1-3 Kapsayıcı Sentez Görevi',
        opcodes: ['MOV', 'ADD', 'DIV', 'LEA'],
        description: 'Aşama 1-2 (Bellek Tabanlı İndeksleme) ile Aşama 3 (Aritmetik, Bölme/Kalan, Bayraklar) konularını birleştiren sensör kalibrasyon sınavı.',
        challengeIds: ['ch-capstone-stage3']
      }
    ]
  },
  {
    id: 'milestone-4',
    number: 4,
    title: 'Mantıksal ve Bit Düzeyi İşlemler',
    description: 'Bit maskeleme, tersleme, bit testi ve donanım kontrolünde kullanılan kaydırma/döndürme işlemleri.',
    topics: [
      {
        id: 'topic-logic-mask',
        title: 'Bit Düzeyi Mantık ve Maskeleme',
        opcodes: ['AND', 'OR', 'XOR', 'NOT', 'TEST'],
        description: 'Belirli bitleri sıfırlama, birleme veya durumlarını bayraklar üzerinden test etme.',
        challengeIds: ['ch-logic-masking', 'ch-xor-zero']
      },
      {
        id: 'topic-shifts',
        title: 'Bit Kaydırma ve Döndürme',
        opcodes: ['SHL', 'SHR', 'SAR', 'ROL', 'ROR'],
        description: '2\'nin katlarıyla hızlı çarpma/bölme ve döngüsel bit rotasyonları.',
        challengeIds: ['ch-shl-multiply', 'ch-sar-signed']
      },
      {
        id: 'topic-capstone-m4',
        title: '🎯 Aşama 1-4 Kapsayıcı Sentez Görevi',
        opcodes: ['MOV', 'AND', 'SHR', 'MUL'],
        description: 'Aşama 1-2 (Bellek Erişimi) + Aşama 3 (Aritmetik Çarpma) + Aşama 4 (Bit Maskeleme AND, Bit Kaydırma SHR) telemetri ayrıştırma sınavı.',
        challengeIds: ['ch-capstone-stage4']
      }
    ]
  },
  {
    id: 'milestone-5',
    number: 5,
    title: 'Program Akışı, Koşullar ve Döngüler',
    description: 'Şartlı/şartsız dallanmalar, döngü komutları ve karar mekanizmaları.',
    topics: [
      {
        id: 'topic-cmp-jumps',
        title: 'Karşılaştırma ve Şartlı Sıçramalar',
        opcodes: ['CMP', 'JMP', 'JE', 'JNE', 'JG', 'JL', 'JA', 'JB'],
        description: 'CMP ile bayrakları etkileyip koşula göre farklı kod bloklarına atlama.',
        challengeIds: ['ch-cmp-max']
      },
      {
        id: 'topic-loop',
        title: 'LOOP ve Sayaç Tabanlı Döngüler',
        opcodes: ['LOOP', 'LOOPE', 'LOOPNE'],
        description: 'CX register\'ını otomatik olarak azaltan donanımsal döngü yönergeleri.',
        challengeIds: ['ch-loop-sum-n', 'ch-loopne-find']
      },
      {
        id: 'topic-capstone-m5',
        title: '🎯 Aşama 1-5 Kapsayıcı Sentez Görevi',
        opcodes: ['MOV', 'CMP', 'LOOP', 'ADD'],
        description: 'Aşama 1-4 konularını Aşama 5 döngüleri (LOOP, CMP, JLE) ile birleştiren dinamik dizi filtreleme ve istatistik sınavı.',
        challengeIds: ['ch-capstone-stage5']
      }
    ]
  },
  {
    id: 'milestone-6',
    number: 6,
    title: 'Yığın (Stack) ve Alt Programlar (Prosedürler)',
    description: 'LIFO bellek yapısı, fonksiyon çağırma mekanizması ve yerel değişken yönetimi.',
    topics: [
      {
        id: 'topic-stack',
        title: 'Yığın İşlemleri (LIFO)',
        opcodes: ['PUSH', 'POP', 'PUSHF', 'POPF'],
        description: 'Register ve bayrak değerlerini yığında saklama ve geri yükleme.',
        challengeIds: ['ch-stack-reverse']
      },
      {
        id: 'topic-proc',
        title: 'Alt Yordamlar ve Prosedür Çağrımı',
        opcodes: ['CALL', 'RET'],
        description: 'Modüler programlama, alt yordam çağırma ve SP/IP dönüş yönetimi.',
        challengeIds: ['ch-proc-abs']
      },
      {
        id: 'topic-capstone-m6',
        title: '🎯 Aşama 1-6 Kapsayıcı Sentez Görevi',
        opcodes: ['PUSH', 'POP', 'CALL', 'RET', 'MUL', 'ADD'],
        description: 'Aşama 1-5 algoritmalarını Aşama 6 modüler prosedür (CALL/RET) ve yığın yazmaç korumasıyla paketleyen sınav.',
        challengeIds: ['ch-capstone-stage6']
      }
    ]
  },
  {
    id: 'milestone-7',
    number: 7,
    title: 'Dizi ve String İşlemleri',
    description: 'Donanımsal hızlandırıcılı blok bellek kopyalama, doldurma ve tarama komutları.',
    topics: [
      {
        id: 'topic-string-moves',
        title: 'Blok Bellek Kopyalama ve Doldurma',
        opcodes: ['MOVSB', 'LODSB', 'STOSB', 'REP', 'CLD'],
        description: 'SI ve DI indeks register\'ları ve REP ön eki ile bellek blok transferi.',
        challengeIds: ['ch-string-copy', 'ch-string-fill']
      },
      {
        id: 'topic-string-scan',
        title: 'Dizi Tarama ve Karakter Arama',
        opcodes: ['SCASB', 'CMPSB', 'REPNE'],
        description: 'Karakter dizisi sonu bulma (strlen) ve iki string\'i bayt bayt karşılaştırma.',
        challengeIds: ['ch-string-len']
      },
      {
        id: 'topic-capstone-m7',
        title: '🎯 Aşama 1-7 Kapsayıcı Sentez Görevi',
        opcodes: ['CLD', 'LODSB', 'STOSB', 'XOR', 'LOOP'],
        description: 'Aşama 1-6 mantığını donanımsal string akış komutları (LODSB, STOSB) ve XOR şifreleme ile harmanlayan blok dönüştürme sınavı.',
        challengeIds: ['ch-capstone-stage7']
      }
    ]
  },
  {
    id: 'milestone-8',
    number: 8,
    title: 'BCD ve ASCII Aritmetiği',
    description: 'Muhasebe sistemleri ve eski ekran/klavye formatlarında kullanılan onluk tabanlı düzeltmeler.',
    topics: [
      {
        id: 'topic-bcd',
        title: 'Paketlenmiş ve Paketlenmemiş BCD',
        opcodes: ['DAA', 'DAS', 'AAA', 'AAS', 'AAM', 'AAD'],
        description: 'İkili toplama/çarpma sonuçlarını BCD/ASCII formatına dönüştürme.',
        challengeIds: ['ch-bcd-daa', 'ch-aam-unpack']
      },
      {
        id: 'topic-capstone-m8',
        title: '🎯 Aşama 1-8 Kapsayıcı Sentez Görevi',
        opcodes: ['MOV', 'ADC', 'DAA', 'LOOP', 'INC'],
        description: 'Aşama 1-7 bellek dizisi ve döngülerini Aşama 8 paketlenmiş BCD aritmetiği (DAA, ADC) ile birleştiren çok baytlı muhasebe toplayıcısı.',
        challengeIds: ['ch-capstone-stage8']
      }
    ]
  },
  {
    id: 'milestone-9',
    number: 9,
    title: 'Giriş / Çıkış (I/O) ve Sistem Kesmeleri',
    description: 'Port tabanlı haberleşme ve MS-DOS / BIOS kesme (interrupt) fonksiyonları.',
    topics: [
      {
        id: 'topic-io-ports',
        title: 'I/O Port Erişimi',
        opcodes: ['IN', 'OUT'],
        description: 'Donanım portlarına bayt ve kelime seviyesinde veri gönderme/okuma.',
        challengeIds: ['ch-io-port']
      },
      {
        id: 'topic-interrupts',
        title: 'DOS Servis Kesmeleri (INT 21h)',
        opcodes: ['INT'],
        description: 'İşletim sistemi çağrıları ile konsola yazı yazdırma ve kullanıcı etkileşimi.',
        challengeIds: ['ch-int21h-hello']
      },
      {
        id: 'topic-capstone-m9',
        title: '🎯 Aşama 1-9 Kapsayıcı Sentez Görevi',
        opcodes: ['IN', 'OUT', 'AND', 'ADD', 'INT'],
        description: 'Donanım portundan (IN) telemetri baytını alıp, bit maskesiyle ayrıştırıp, ASCII\'ye çevirip INT 21H ile konsola raporlayan entegre sınav.',
        challengeIds: ['ch-capstone-stage9']
      }
    ]
  },
  {
    id: 'milestone-10',
    number: 10,
    title: 'İleri Seviye Algoritmalar & 8086 LeetCode',
    description: 'Klasik bilgisayar bilimi algoritmalarını saf 8086 assembly ile optimize bir şekilde yazma.',
    topics: [
      {
        id: 'topic-algos',
        title: 'Veri Yapıları ve Algoritmik Zorluklar',
        opcodes: ['CMP', 'JMP', 'LOOP', 'MOV', 'XCHG'],
        description: 'Dizi sıralama, Fibonacci serisi ve palindrom tespiti gibi ileri düzey algoritmalar.',
        challengeIds: ['ch-algo-bubble-sort', 'ch-algo-fibonacci', 'ch-algo-palindrome']
      },
      {
        id: 'topic-capstone-m10',
        title: '🎯 Aşama 1-10 Kapsayıcı Sentez Görevi',
        opcodes: ['MOV', 'ADD', 'CMP', 'LOOP'],
        description: 'Aşama 1-9 birikimini 2x döngü açma (Loop Unrolling) ve mimari optimizasyon teknikleriyle harmanlayan çift elemanlı arama sınavı.',
        challengeIds: ['ch-capstone-stage10']
      }
    ]
  }
,
  {
    id: 'milestone-11',
    number: 11,
    title: 'İleri Sistem Komutları, Bayrak Manipülasyonu & Donanım Tabloları',
    description: 'Manualda yer alan özel sistem ve bayrak komutları (CLC/STC/CMC, CLI/STI, LAHF/SAHF, XLAT, LDS/LES, JCXZ, CBW/CWD) ve veri tanımlama direktifleri (DB, DW, DUP, OFFSET, PTR).',
    topics: [
      {
        id: 'topic-flags-ctrl',
        title: 'Bayrak Denetim ve Manipülasyon Komutları',
        opcodes: ['CLC', 'STC', 'CMC', 'CLI', 'STI', 'LAHF', 'SAHF'],
        description: 'Carry ve Interrupt bayraklarını doğrudan değiştirme, durum bayraklarını AH yazmacına yükleyip geri yazma.',
        challengeIds: ['ch-flags-manipulation']
      },
      {
        id: 'topic-xlat-lookup',
        title: 'Donanımsal Tablo Çevirisi (XLAT) ve Gösterici Yükleme (LDS/LES)',
        opcodes: ['XLAT', 'LDS', 'LES'],
        description: 'AL yazmacını indeks olarak kullanıp tablodan hızlı veri çekme ve tek komutta 32-bit segment:ofset göstericisi yükleme.',
        challengeIds: ['ch-xlat-table']
      },
      {
        id: 'topic-jcxz-guard',
        title: 'Sıfır Sayaç Koruması (JCXZ) ve İşaret Genişletme (CBW/CWD)',
        opcodes: ['JCXZ', 'CBW', 'CWD'],
        description: 'CX=0 olduğunda döngünün 65535 kez dönmesini önleyen güvenlik atlaması ve IDIV öncesi işaret genişletme.',
        challengeIds: ['ch-jcxz-guard']
      },
      {
        id: 'topic-capstone-m11',
        title: '🏆 Aşama 1-11 Büyük Usta Sentezi (Grand Capstone)',
        opcodes: ['XLAT', 'JCXZ', 'LAHF', 'STC', 'LOOP', 'MOV'],
        description: '8086 mimarisinin tüm 11 aşamasını (Donanımsal tablo çevirisi, sayaç taşma koruması, bayrak manipülasyonu ve bellek döngüleri) birleştiren nihai bitirme sınavı.',
        challengeIds: ['ch-capstone-stage11']
      }
    ]
  }
];

export const CHALLENGES: Record<string, Challenge> = {
  // --- MILESTONE 2: DATA TRANSFER & ADDRESSING MODES ---
  'ch-mov-basic': {
    id: 'ch-mov-basic',
    title: 'Temel Register ve Sabit (Immediate) Yükleme',
    milestoneId: 'milestone-2',
    difficulty: 'Kolay',
    opcodes: ['MOV'],
    scenario: 'Bir gömülü sensör kontrol ünitesi başlatılıyor. Sensörün konfigürasyon register\'larına ön tanımlı sabit değerlerin yüklenmesi gerekiyor.',
    task: 'AX register\'ına 0x1234, BX register\'ına 0x5678 değerini yükleyin. Ardından CX register\'ına AX\'in değerini kopyalayın. Programı HLT ile bitirin.',
    starterCode: `; Görev: Temel MOV Komutu
ORG 100H

; 1. AX'e 1234H yukleyin
; 2. BX'e 5678H yukleyin
; 3. CX'e AX degerini kopyalayin

HLT
`,
    hints: [
      'MOV Hedef, Kaynak biçiminde çalışır.',
      'Sayısal sabitlerin sonuna H ekleyerek onaltılık (hexadecimal) tabanda yazabilirsiniz (Örn: MOV AX, 1234H).'
    ],
    solutionCode: `ORG 100H
MOV AX, 1234H
MOV BX, 5678H
MOV CX, AX
HLT`,
    testSetup: {},
    assertions: {
      expectedRegisters: {
        ax: 0x1234,
        bx: 0x5678,
        cx: 0x1234
      },
      maxSteps: 20
    }
  },

  'ch-mov-memory': {
    id: 'ch-mov-memory',
    title: 'Doğrudan Bellek Adresleme (Direct Addressing)',
    milestoneId: 'milestone-2',
    difficulty: 'Kolay',
    opcodes: ['MOV'],
    scenario: 'Belleğin DS:0200h adresinde bir telemetri ham sıcaklık verisi saklanmaktadır. Bu 16-bit veriyi okuyup 10 katı olarak DS:0202h adresine yazmanız isteniyor (bu aşamada doğrudan okuma ve başka bir adrese aktarma testi).',
    task: 'DS:0200h adresindeki 16-bit kelimeyi AX register\'ına okuyun. Ardından AX register\'ındaki bu değeri DS:0202h adresine kopyalayın.',
    starterCode: `; Görev: Bellekten Okuma ve Yazma
ORG 100H

; [0200H] adresindeki 16-bit veriyi AX'e tasiyin
; AX'teki veriyi [0202H] adresine kaydedin

HLT
`,
    hints: [
      'Köşeli parantez [adres] doğrudan bellek erişimi sağlar.',
      'Örnek: MOV AX, [0200H] kelime (word) okur.',
      'Örnek: MOV [0202H], AX okunan kelimeyi yazar.'
    ],
    solutionCode: `ORG 100H
MOV AX, [0200H]
MOV [0202H], AX
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0xEF, 0xBE] } // 0xBEEF (little-endian)
      ]
    },
    assertions: {
      expectedRegisters: {
        ax: 0xBEEF
      },
      expectedMemory: [
        { segment: 0x0000, offset: 0x0202, expectedBytes: [0xEF, 0xBE], label: 'Hedef Bellek [0202H]' }
      ],
      maxSteps: 20
    }
  },

  'ch-xchg-swap': {
    id: 'ch-xchg-swap',
    title: 'XCHG ile Atomik Register Takası',
    milestoneId: 'milestone-2',
    difficulty: 'Kolay',
    opcodes: ['XCHG'],
    scenario: 'İki kanalın veri tamponları karıştı. Kanal A (AX) ve Kanal B (BX) verilerinin üçüncü bir yedek register harcamadan yer değiştirmesi gerekiyor.',
    task: 'AX ve BX register\'larının içeriklerini XCHG komutunu kullanarak yer değiştirin.',
    starterCode: `; Görev: XCHG ile Takas
ORG 100H

; AX ve BX degerlerini tek bir komutla degistirin

HLT
`,
    hints: [
      'XCHG iki register veya bir register ile bellek arasındaki değerleri atomik olarak takas eder.',
      'Sözdizimi: XCHG AX, BX'
    ],
    solutionCode: `ORG 100H
XCHG AX, BX
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 0xAAAA,
        bx: 0xBBBB
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 0xBBBB,
        bx: 0xAAAA
      },
      maxSteps: 10
    }
  },

  'ch-lea-offset': {
    id: 'ch-lea-offset',
    title: 'LEA ile Efektif Adres Yükleme',
    milestoneId: 'milestone-2',
    difficulty: 'Orta',
    opcodes: ['LEA', 'MOV'],
    scenario: 'Dizi indeksleme algoritmasında DI pointer\'ı BX taban adresi ve SI indisinin toplamına 4 baytlık ofset eklenerek hesaplanmalıdır.',
    task: 'BX ve SI değerlerini kullanarak efektif adresi LEA komutu ile DI register\'ına yükleyin: Formül: DI = [BX + SI + 4]. BX=0100h, SI=0020h olarak ayarlanmıştır.',
    starterCode: `; Görev: LEA ile Efektif Adres Hesaplama
ORG 100H

; LEA komutu ile [BX + SI + 4] adresini DI register'ina aktarin

HLT
`,
    hints: [
      'LEA DI, [BX + SI + 4] komutu belleğe gitmez, yalnızca hesaplanan ofset adresini DI\'ye yazar.'
    ],
    solutionCode: `ORG 100H
LEA DI, [BX + SI + 4]
HLT`,
    testSetup: {
      initialRegisters: {
        bx: 0x0100,
        si: 0x0020
      }
    },
    assertions: {
      expectedRegisters: {
        di: 0x0124
      },
      maxSteps: 10
    }
  },

  // --- MILESTONE 2: ARITHMETIC ---
  'ch-add-sub-sum': {
    id: 'ch-add-sub-sum',
    title: 'Temel Toplama, Çıkarma ve Bayrak İncelemesi',
    milestoneId: 'milestone-3',
    difficulty: 'Kolay',
    opcodes: ['ADD', 'SUB', 'INC'],
    scenario: 'Bir paket sayaç ünitesi: Gelen paket sayısını (AX) işlenen paket sayısıyla (BX) toplayın, ardından kayıp paket sayısını (CX) çıkarın ve son olarak sıra numarasını 1 artırın (INC).',
    task: 'AX = AX + BX yapın, ardından AX = AX - CX yapın, en son AX değerini INC ile 1 artırın. Programı HLT ile sonlandırın.',
    starterCode: `; Görev: ADD, SUB ve INC
ORG 100H

; 1. AX = AX + BX
; 2. AX = AX - CX
; 3. AX'i 1 artirin (INC)

HLT
`,
    hints: [
      'ADD AX, BX',
      'SUB AX, CX',
      'INC AX'
    ],
    solutionCode: `ORG 100H
ADD AX, BX
SUB AX, CX
INC AX
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 50,
        bx: 30,
        cx: 15
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 66 // 50 + 30 = 80 - 15 = 65 + 1 = 66
      },
      maxSteps: 20
    }
  },

  'ch-neg-twos': {
    id: 'ch-neg-twos',
    title: 'NEG ile İki\'nin Tümleyeni (Negatifleme)',
    milestoneId: 'milestone-3',
    difficulty: 'Kolay',
    opcodes: ['NEG'],
    scenario: 'Sensörden okunan hata payı negatif bir değer (-25 / 0xFFE7) olarak geldi. Sistemin mutlak değer veya ters işaretli kazanç olarak hesap yapabilmesi için sayının negatifini alması gerekiyor.',
    task: 'AX register\'ındaki işaretli sayıyı NEG komutunu kullanarak ters işaretlisine (iki\'nin tümleyenine) çevirin.',
    starterCode: `; Görev: NEG ile Isaret Degistirme
ORG 100H

; AX'in iki'nin tumleyenini (negatifini) alin

HLT
`,
    hints: [
      'NEG AX komutu AX = 0 - AX işlemini yaparak sayının işaretini tersine çevirir.'
    ],
    solutionCode: `ORG 100H
NEG AX
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 0xFFE7 // -25
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 25
      },
      maxSteps: 10
    }
  },

  'ch-adc-32bit': {
    id: 'ch-adc-32bit',
    title: 'ADC ile 32-bit Sayı Toplama (Genişletilmiş Hassasiyet)',
    milestoneId: 'milestone-3',
    difficulty: 'Orta',
    opcodes: ['ADD', 'ADC'],
    scenario: '8086 bir 16-bit işlemcidir. Ancak finansal hesaplamalarda 32-bit sayılar gerekir. Sayı 1: DX:AX (Yüksek: DX, Düşük: AX), Sayı 2: CX:BX (Yüksek: CX, Düşük: BX).',
    task: 'İki 32-bit sayıyı toplayın ve sonucu DX:AX içinde saklayın. Önce düşük kelimeleri (AX ve BX) ADD ile toplayın, ardından oluşan Carry bayrağını hesaba katarak yüksek kelimeleri (DX ve CX) ADC ile toplayın.',
    starterCode: `; Görev: 32-bit Toplama
ORG 100H

; Düşük 16-bit: AX = AX + BX (ADD kullanın)
; Yüksek 16-bit: DX = DX + CX + Carry (ADC kullanın)

HLT
`,
    hints: [
      'ADD düşük 16-biti toplarken taşma olursa CF=1 yapar.',
      'ADC DX, CX komutu DX = DX + CX + CF işlemini gerçekleştirir.'
    ],
    solutionCode: `ORG 100H
ADD AX, BX
ADC DX, CX
HLT`,
    testSetup: {
      initialRegisters: {
        dx: 0x0001,
        ax: 0xFFFF,
        cx: 0x0002,
        bx: 0x0001
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 0x0000,
        dx: 0x0004 // 0x0001 + 0x0002 + 1 (carry from FFFF + 1) = 0x0004
      },
      expectedFlags: {
        cf: 0 // 1 + 2 + 1 = 4 doesn't carry out of 16-bit
      },
      maxSteps: 15
    }
  },

  'ch-mul-square': {
    id: 'ch-mul-square',
    title: 'MUL ile Karesini Alma ve DX:AX Sonucu',
    milestoneId: 'milestone-3',
    difficulty: 'Orta',
    opcodes: ['MUL', 'MOV'],
    scenario: 'Bir grafik render motorunda piksel mesafesi karesi (x^2) hesaplanmalıdır. AX = 1000 (03E8h) sayısının karesi 1,000,000 (0F4240h) olup 16-biti aştığı için DX:AX ikilisine yayılır.',
    task: 'AX register\'ındaki 16-bit işaretsiz sayının karesini MUL komutu ile hesaplayın. (AX * AX).',
    starterCode: `; Görev: MUL ile 16-bit Carpma
ORG 100H

; AX'i BX'e kopyalayip MUL BX komutu ile AX * BX carpimini yapin
; Sonuc otomatik olarak DX:AX ciftine yazilacaktir.

HLT
`,
    hints: [
      'MUL operand komutunda: 16-bit için DX:AX = AX * operand olur.',
      'BX\'e AX\'i kopyalayıp MUL BX çağırabilirsiniz.'
    ],
    solutionCode: `ORG 100H
MOV BX, AX
MUL BX
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 1000 // 0x03E8
      }
    },
    assertions: {
      expectedRegisters: {
        dx: 0x000F,
        ax: 0x4240 // 1000 * 1000 = 1,000,000 = 0x000F4240
      },
      maxSteps: 15
    }
  },

  'ch-div-mod': {
    id: 'ch-div-mod',
    title: 'DIV ile Bölüm ve Kalan (Modulus) Ayrıştırma',
    milestoneId: 'milestone-3',
    difficulty: 'Orta',
    opcodes: ['DIV', 'MOV'],
    scenario: 'Zaman dönüştürücü: Toplam saniye sayısı (AX = 125) verilmiştir. Bunu dakikaya (Bölüm -> AL) ve artık saniyeye (Kalan -> AH) dönüştürmeniz gerekmektedir (60\'a bölme).',
    task: 'AX register\'ındaki değeri 8-bitlik BL=60 böleni ile bölün (DIV BL). Sonuçta AL = Bölüm, AH = Kalan olacaktır.',
    starterCode: `; Görev: 8-bit DIV Islemi
ORG 100H

; BL register'ina 60 (3CH) yukleyin
; DIV BL komutu ile AX'i BL'ye bolun
; AL = Bolum (125 / 60 = 2), AH = Kalan (125 % 60 = 5)

HLT
`,
    hints: [
      'DIV r8 komutu AX / r8 yapar. Bölüm AL\'ye, kalan AH\'ye gider.'
    ],
    solutionCode: `ORG 100H
MOV BL, 60
DIV BL
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 125
      }
    },
    assertions: {
      expectedRegisters: {
        al: 2,
        ah: 5
      },
      maxSteps: 15
    }
  },

  // --- MILESTONE 3: BITWISE & LOGIC ---
  'ch-logic-masking': {
    id: 'ch-logic-masking',
    title: 'AND ve OR ile Bit Maskeleme ve Kurma (Set)',
    milestoneId: 'milestone-4',
    difficulty: 'Kolay',
    opcodes: ['AND', 'OR'],
    scenario: 'Bir mikrodenetleyici G/Ç port durumunda: 0. ve 1. bitlerin mutlaka temizlenmesi (0 yapılması), 7. bitin ise mutlaka etkinleştirilmesi (1 yapılması) istenmektedir.',
    task: 'AL register\'ındaki verinin alt 2 bitini (bit 0 ve bit 1) AND ile sıfırlayın (maske: 11111100b / 0xFC). Ardından bit 7\'yi OR ile 1 yapın (maske: 10000000b / 0x80).',
    starterCode: `; Görev: Bit Maskeleme
ORG 100H

; 1. AL register'ini 0FCH ile AND'leyin (alt 2 biti sifirlayin)
; 2. AL register'ini 80H ile OR'layin (en yuksek biti 1 yapin)

HLT
`,
    hints: [
      'AND AL, 0FCH',
      'OR AL, 80H'
    ],
    solutionCode: `ORG 100H
AND AL, 0FCH
OR AL, 80H
HLT`,
    testSetup: {
      initialRegisters: {
        al: 0x3F // 0011 1111b
      }
    },
    assertions: {
      expectedRegisters: {
        al: 0xBC // 0011 1100b OR 1000 0000b = 1011 1100b = 0xBC
      },
      maxSteps: 15
    }
  },

  'ch-xor-zero': {
    id: 'ch-xor-zero',
    title: 'XOR ile Hızlı Sıfırlama ve Parity Testi',
    milestoneId: 'milestone-4',
    difficulty: 'Kolay',
    opcodes: ['XOR'],
    scenario: 'Assembly programcıları bir register\'ı sıfırlamak için "MOV AX, 0" (3 bayt) yerine "XOR AX, AX" (2 bayt) kullanırlar. Bu hem daha az bayt tutar hem de Zero Flag (ZF) bayrağını 1 yapar.',
    task: 'AX register\'ını XOR komutunu kendi üzerinde uygulayarak sıfırlayın. ZF bayrağının 1 olduğunu doğrulayın.',
    starterCode: `; Görev: XOR ile Sifirlama
ORG 100H

; AX'i XOR komutu ile sifirlayin

HLT
`,
    hints: [
      'XOR AX, AX komutu AX değerini 0 yapar ve ZF=1 olur.'
    ],
    solutionCode: `ORG 100H
XOR AX, AX
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 0x1234
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 0x0000
      },
      expectedFlags: {
        zf: 1
      },
      maxSteps: 10
    }
  },

  'ch-shl-multiply': {
    id: 'ch-shl-multiply',
    title: 'SHL ile Hızlı Çarpma Optimizasyonu (x * 10)',
    milestoneId: 'milestone-4',
    difficulty: 'Orta',
    opcodes: ['SHL', 'ADD', 'MOV'],
    scenario: 'Eski işlemcilerde MUL komutu onlarca çevrim (clock cycle) sürerken, SHL ve ADD komutları 1-2 çevrimde biter. Bir sayıyı 10 ile çarpmak için formül: x * 10 = (x * 8) + (x * 2) = (x << 3) + (x << 1).',
    task: 'AX register\'ındaki sayıyı MUL kullanmadan, sadece SHL, MOV ve ADD komutlarını kullanarak 10 ile çarpın. Sonucu AX\'te bırakın.',
    starterCode: `; Görev: 10 ile Hizli Carpma Optimizasyonu
ORG 100H

; Girdi: AX
; 1. AX'i BX'e yedekleyin
; 2. BX'i 1 sola kaydirin (BX = x * 2)
; 3. AX'i 3 sola kaydirin (AX = x * 8)
; 4. AX = AX + BX (AX = x * 8 + x * 2 = x * 10)

HLT
`,
    hints: [
      'SHL reg, 1 komutu sayıyı 2 ile çarpar.',
      'Sola 3 kez kaydırmak için 3 kez "SHL AX, 1" yapabilirsiniz.'
    ],
    solutionCode: `ORG 100H
MOV BX, AX
SHL BX, 1
SHL AX, 1
SHL AX, 1
SHL AX, 1
ADD AX, BX
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 15
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 150 // 15 * 10
      },
      maxSteps: 20
    }
  },

  'ch-sar-signed': {
    id: 'ch-sar-signed',
    title: 'SAR ile İşaret Korumalı Aritmetik Sağa Kaydırma',
    milestoneId: 'milestone-4',
    difficulty: 'Orta',
    opcodes: ['SAR'],
    scenario: 'Negatif bir sıcaklık değeri (-16 / 0xFFF0) 4\'e bölünmek isteniyor. Mantıksal kaydırma (SHR) yapılırsa en yüksek bite 0 geleceğinden sayı pozitife döner ve bozulur. Aritmetik kaydırma (SAR) işaret bitini korur.',
    task: 'AX register\'ındaki negatif sayıyı SAR komutunu 2 kez kullanarak 4\'e bölün. İşaretin korunduğunu (sonucun -4 / 0xFFFC olduğunu) test edin.',
    starterCode: `; Görev: SAR ile Isaret Korumali Bolme
ORG 100H

; AX'i SAR komutu ile 2 bit saga kaydirin (4'e bolun)

HLT
`,
    hints: [
      'SAR AX, 1 komutunu art arda 2 kez çalıştırabilirsiniz.'
    ],
    solutionCode: `ORG 100H
SAR AX, 1
SAR AX, 1
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 0xFFF0 // -16
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 0xFFFC // -4
      },
      maxSteps: 10
    }
  },

  // --- MILESTONE 4: CONTROL FLOW & LOOPS ---
  'ch-cmp-max': {
    id: 'ch-cmp-max',
    title: 'CMP ve Şartlı Sıçrama ile Maksimum Sayıyı Bulma',
    milestoneId: 'milestone-5',
    difficulty: 'Orta',
    opcodes: ['CMP', 'JAE', 'MOV'],
    scenario: 'İki sensör okumasından (AX ve BX) büyük olanı seçilmelidir. AX < BX ise AX\'e BX değeri yazılmalı, aksi takdirde AX korunmalıdır.',
    task: 'AX ve BX değerlerini CMP ile karşılaştırın. Eğer AX >= BX ise atlayın; eğer AX < BX ise BX değerini AX\'e aktarın. Sonuçta AX her durumda büyük olan sayıyı içermelidir.',
    starterCode: `; Görev: Maksimum Bulma (Max of AX, BX)
ORG 100H

; CMP AX, BX
; JAE BITIR (AX >= BX ise atla)
; MOV AX, BX (degilse AX = BX)
; BITIR: HLT

HLT
`,
    hints: [
      'İşaretsiz sayılarda JAE (Jump if Above or Equal) veya JNC kullanılır.',
      'Karşılaştırma sonucuna göre etiket (label) tanımlayıp sıçrayabilirsiniz.'
    ],
    solutionCode: `ORG 100H
CMP AX, BX
JAE BITIR
MOV AX, BX
BITIR:
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 42,
        bx: 99
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 99
      },
      maxSteps: 20
    }
  },

  'ch-loop-sum-n': {
    id: 'ch-loop-sum-n',
    title: 'LOOP ile 1\'den N\'e Kadar Olan Sayıların Toplamı',
    milestoneId: 'milestone-5',
    difficulty: 'Orta',
    opcodes: ['LOOP', 'ADD', 'XOR'],
    scenario: 'Matematiksel Gauss toplamı: CX register\'ında verilen N sayısına kadar olan sayıların toplamını (1 + 2 + ... + N) döngü ile hesaplayın.',
    task: 'AX register\'ını 0 yapın. CX = 5 verilmiştir. Her adımda AX\'e CX\'i ekleyip LOOP komutu ile CX=0 olana kadar dönün. Sonuçta AX = 15 (0Fh) olmalıdır.',
    starterCode: `; Görev: LOOP ile N'e Kadar Toplam
ORG 100H

XOR AX, AX ; Toplam = 0

TOPLA:
    ; AX'e CX ekleyin
    ; LOOP TOPLA komutu ile donun

HLT
`,
    hints: [
      'LOOP etiketi çalıştığında CX otomatik olarak 1 azaltılır ve CX != 0 ise etikete zıplar.'
    ],
    solutionCode: `ORG 100H
XOR AX, AX
TOPLA:
ADD AX, CX
LOOP TOPLA
HLT`,
    testSetup: {
      initialRegisters: {
        cx: 5
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 15
      },
      maxSteps: 50
    }
  },

  'ch-loopne-find': {
    id: 'ch-loopne-find',
    title: 'LOOPNE ile Dizide Bayt Arama',
    milestoneId: 'milestone-5',
    difficulty: 'Zor',
    opcodes: ['LOOPNE', 'CMP', 'INC'],
    scenario: 'Bir bellek tamponunda (DS:0200h) aranan bir bayt değeri (AL=0x42) bulunmaktadır. Dizi boyutu CX=5 olarak ayarlanmıştır. Aranan değer bulunduğunda döngü erken sonlanmalıdır.',
    task: 'SI=0200h adresinden başlayarak bellekteki elemanları AL ile karşılaştırın (CMP AL, [SI]). Eşleşme bulunana kadar (ZF=1 olana kadar) veya CX bitene kadar LOOPNE ile dönün.',
    starterCode: `; Görev: LOOPNE ile Arama
ORG 100H

MOV SI, 0200H

ARA:
    CMP AL, [SI]
    JE BULDUM
    INC SI
    LOOPNE ARA

BULDUM:
HLT
`,
    hints: [
      'LOOPNE (veya LOOPNZ), CX\'i 1 azaltır ve CX != 0 AND ZF == 0 olduğu sürece döner.',
      'Eğer CMP eşleşirse ZF=1 olur ve döngüden çıkılır.'
    ],
    solutionCode: `ORG 100H
MOV SI, 0200H
ARA:
CMP AL, [SI]
JE BULDUM
INC SI
LOOPNE ARA
BULDUM:
HLT`,
    testSetup: {
      initialRegisters: {
        al: 0x42,
        cx: 5
      },
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0x10, 0x20, 0x42, 0x30, 0x50] }
      ]
    },
    assertions: {
      expectedRegisters: {
        si: 0x0202 // 3. eleman (ofset 0200 + 2)
      },
      expectedFlags: {
        zf: 1
      },
      maxSteps: 50
    }
  },

  // --- MILESTONE 5: STACK & PROCEDURES ---
  'ch-stack-reverse': {
    id: 'ch-stack-reverse',
    title: 'Yığın (Stack) ile Üç Register Değerini Ters Çevirme',
    milestoneId: 'milestone-6',
    difficulty: 'Kolay',
    opcodes: ['PUSH', 'POP'],
    scenario: 'LIFO (Son Giren İlk Çıkar) prensibi: AX=1, BX=2, CX=3 değerlerini yığına atıp ters sırayla çekerek AX=3, BX=2, CX=1 yapmanız istenmektedir.',
    task: 'Sırasıyla AX, BX, CX register\'larını PUSH komutuyla yığına atın. Ardından yığından sırasıyla AX, BX, CX içine POP komutuyla çekin.',
    starterCode: `; Görev: Stack ile Degerleri Ters Cevir
ORG 100H

; 1. PUSH AX, PUSH BX, PUSH CX
; 2. POP AX, POP BX, POP CX

HLT
`,
    hints: [
      'İlk atılan (AX) en son çıkar, son atılan (CX) ilk çıkar!'
    ],
    solutionCode: `ORG 100H
PUSH AX
PUSH BX
PUSH CX
POP AX
POP BX
POP CX
HLT`,
    testSetup: {
      initialRegisters: {
        ax: 1,
        bx: 2,
        cx: 3
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 3,
        bx: 2,
        cx: 1
      },
      maxSteps: 30
    }
  },

  'ch-proc-abs': {
    id: 'ch-proc-abs',
    title: 'CALL ve RET ile Mutlak Değer Prosedürü (Subroutine)',
    milestoneId: 'milestone-6',
    difficulty: 'Orta',
    opcodes: ['CALL', 'RET', 'CMP', 'NEG'],
    scenario: 'Matematik kütüphanesi modülü: Program ana akışında bir alt yordam çağrılacak (CALL ABS_VAL). Alt yordam AX negatif ise NEG uygulayıp RET ile dönecektir.',
    task: 'Ana programda CALL ABS_VAL çağrısı yapın ve ardından HLT ile durun. ABS_VAL etiketinde: CMP AX, 0 yapın; eğer AX >= 0 ise direkt RET yapın; negatif ise NEG AX yapıp RET ile ana programa dönün.',
    starterCode: `; Görev: Prosedur Cagrimi (CALL / RET)
ORG 100H

CALL ABS_VAL
HLT

ABS_VAL:
    ; Eger AX >= 0 ise DON'e zıpla
    ; Eger AX < 0 ise NEG AX yap
DON:
    RET
`,
    hints: [
      'CALL komutu dönüş adresi olan IP\'yi yığına iter.',
      'RET komutu yığındaki dönüş adresini çekip IP\'ye yazar.'
    ],
    solutionCode: `ORG 100H
CALL ABS_VAL
HLT

ABS_VAL:
CMP AX, 0
JGE DON
NEG AX
DON:
RET`,
    testSetup: {
      initialRegisters: {
        ax: 0xFFF6 // -10
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 10
      },
      maxSteps: 30
    }
  },

  // --- MILESTONE 6: STRINGS & BUFFERS ---
  'ch-string-copy': {
    id: 'ch-string-copy',
    title: 'REP MOVSB ile Yüksek Hızlı Bellek Kopyalama (Memcpy)',
    milestoneId: 'milestone-7',
    difficulty: 'Orta',
    opcodes: ['MOVSB', 'REP', 'CLD'],
    scenario: 'İşletim sistemi bellek yöneticisi, DS:0200h adresindeki 4 baytlık veri bloğunu ES:0300h hedef adresine kopyalamak istiyor.',
    task: 'CLD ile Direction Flag\'i temizleyin (artan adres yönü). SI=0200h, DI=0300h ve sayaç CX=4 olarak ayarlayın. REP MOVSB komutu ile transferi gerçekleştirin.',
    starterCode: `; Görev: REP MOVSB ile Blok Transferi
ORG 100H

CLD
MOV SI, 0200H
MOV DI, 0300H
MOV CX, 4
REP MOVSB

HLT
`,
    hints: [
      'CLD DF=0 yapar (SI ve DI her adımda 1 artar).',
      'REP MOVSB, CX sıfırlanana kadar bayt kopyalar.'
    ],
    solutionCode: `ORG 100H
CLD
MOV SI, 0200H
MOV DI, 0300H
MOV CX, 4
REP MOVSB
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0xDE, 0xAD, 0xBE, 0xEF] }
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0300, expectedBytes: [0xDE, 0xAD, 0xBE, 0xEF], label: 'Hedef [0300H]' }
      ],
      maxSteps: 40
    }
  },

  'ch-string-fill': {
    id: 'ch-string-fill',
    title: 'REP STOSB ile Bellek Alanı Doldurma (Memset)',
    milestoneId: 'milestone-7',
    difficulty: 'Kolay',
    opcodes: ['STOSB', 'REP', 'CLD'],
    scenario: 'Ekran veya video belleğini temizleme / sıfırlama işlemi. ES:0250h adresindeki 5 baytlık alanı AL=0AAh deseni ile doldurmanız gerekmektedir.',
    task: 'CLD uygulayın. DI=0250h, AL=0AAh, CX=5 olarak ayarlayın ve REP STOSB komutu ile belleği doldurun.',
    starterCode: `; Görev: REP STOSB ile Bellek Doldurma
ORG 100H

CLD
MOV DI, 0250H
MOV AL, 0AAH
MOV CX, 5
REP STOSB

HLT
`,
    hints: [
      'STOSB komutu AL içeriğini ES:DI adresine yazar ve DI\'yi DF yönüne göre günceller.'
    ],
    solutionCode: `ORG 100H
CLD
MOV DI, 0250H
MOV AL, 0AAH
MOV CX, 5
REP STOSB
HLT`,
    testSetup: {},
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0250, expectedBytes: [0xAA, 0xAA, 0xAA, 0xAA, 0xAA], label: 'Doldurulan Alan [0250H]' }
      ],
      maxSteps: 30
    }
  },

  'ch-string-len': {
    id: 'ch-string-len',
    title: 'REPNE SCASB ile String Uzunluğu Bulma (Strlen)',
    milestoneId: 'milestone-7',
    difficulty: 'Zor',
    opcodes: ['SCASB', 'REPNE', 'CLD', 'NOT', 'DEC'],
    scenario: 'C dilindeki "strlen" fonksiyonunun donanımsal karşılığı. DS:0200h adresinde sonu 00h (Null terminator) ile biten bir string bulunmaktadır ("TEST\0" -> 4 karakter).',
    task: 'CLD uygulayın. DI=0200h, AL=00h (aranan sonlandırıcı), CX=0FFFFh yapın. REPNE SCASB ile 00h baytını bulun. Bulunduktan sonra CX sayacından yararlanarak string uzunluğunu hesaplayıp DX register\'ına yazın (Uzunluk = 4).',
    starterCode: `; Görev: REPNE SCASB ile Strlen
ORG 100H

CLD
MOV DI, 0200H
MOV AL, 00H
MOV CX, 0FFFFH
REPNE SCASB

; İpucu: Baslangic CX=FFFFH idi.
; Kalan CX'i NOT veya SUB ile hesaplayarak uzunlugu DX'e aktarin.
; Formul: DX = (FFFFh - CX) - 1
MOV DX, 0FFFFH
SUB DX, CX
DEC DX

HLT
`,
    hints: [
      'REPNE SCASB her eşleşmeyen baytta CX\'i 1 azaltır ve DI\'yi 1 artırır.',
      '00h bulunduğu anda durur.'
    ],
    solutionCode: `ORG 100H
CLD
MOV DI, 0200H
MOV AL, 00H
MOV CX, 0FFFFH
REPNE SCASB
MOV DX, 0FFFFH
SUB DX, CX
DEC DX
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0x54, 0x45, 0x53, 0x54, 0x00] } // 'T','E','S','T',0
      ]
    },
    assertions: {
      expectedRegisters: {
        dx: 4
      },
      maxSteps: 40
    }
  },

  // --- MILESTONE 7: BCD ARITHMETIC ---
  'ch-bcd-daa': {
    id: 'ch-bcd-daa',
    title: 'DAA ile Paketlenmiş BCD Toplama Düzeltmesi',
    milestoneId: 'milestone-8',
    difficulty: 'Orta',
    opcodes: ['DAA', 'ADD'],
    scenario: 'Yazar kasa sisteminde 38 TL (0x38 BCD) ile 45 TL (0x45 BCD) toplanmaktadır. Standart ikili toplama 0x7D verir ki bu geçersiz bir onluk sayıdır. DAA komutu bunu 0x83 (83 TL) olarak düzeltir.',
    task: 'AL=38h ve BL=45h sayılarını ADD ile toplayın. Ardından hemen DAA komutunu çalıştırarak BCD düzeltmesini yapın. Sonuçta AL = 83h olmalıdır.',
    starterCode: `; Görev: DAA ile BCD Duzeltmesi
ORG 100H

; 1. ADD AL, BL
; 2. DAA

HLT
`,
    hints: [
      'DAA komutu, ADD işleminden hemen sonra AL register\'ına onluk taban düzeltmesi uygular.'
    ],
    solutionCode: `ORG 100H
ADD AL, BL
DAA
HLT`,
    testSetup: {
      initialRegisters: {
        al: 0x38,
        bl: 0x45
      }
    },
    assertions: {
      expectedRegisters: {
        al: 0x83
      },
      maxSteps: 15
    }
  },

  'ch-aam-unpack': {
    id: 'ch-aam-unpack',
    title: 'AAM ile Çarpım Sonucunu Onlar ve Birler Basamağına Ayırma',
    milestoneId: 'milestone-8',
    difficulty: 'Orta',
    opcodes: ['AAM', 'MUL'],
    scenario: 'Bir hesap makinesinde 7 * 8 = 56 işlemi yapıldıktan sonra ekranda gösterilmek üzere 5 (onlar basamağı -> AH) ve 6 (birler basamağı -> AL) olarak ayrıştırılmalıdır.',
    task: 'AL=7, BL=8 verilmiştir. MUL BL yapın (sonuç 56 = 38h). Ardından AAM komutunu çalıştırarak AH=5 ve AL=6 olmasını sağlayın.',
    starterCode: `; Görev: AAM ile Basamak Ayirma
ORG 100H

; 1. MUL BL (AL = 7 * 8 = 38H / 56)
; 2. AAM    (AH = 5, AL = 6)

HLT
`,
    hints: [
      'AAM komutu AL içeriğini 10\'a böler: AH = AL / 10, AL = AL % 10 yapar.'
    ],
    solutionCode: `ORG 100H
MUL BL
AAM
HLT`,
    testSetup: {
      initialRegisters: {
        al: 7,
        bl: 8
      }
    },
    assertions: {
      expectedRegisters: {
        ah: 5,
        al: 6
      },
      maxSteps: 15
    }
  },

  // --- MILESTONE 8: I/O & INTERRUPTS ---
  'ch-io-port': {
    id: 'ch-io-port',
    title: 'IN ve OUT ile Port Tabanlı Donanım İletişimi',
    milestoneId: 'milestone-9',
    difficulty: 'Kolay',
    opcodes: ['IN', 'OUT'],
    scenario: 'Donanım aygıtına port 20H üzerinden bir yapılandırma baytı (7EH) gönderilmesi ve ardından geri okunarak doğrulanması istenmektedir.',
    task: 'AL register\'ına 7EH yükleyin. OUT 20H, AL komutu ile port 20H\'a gönderin. Ardından MOV AL, 0 ile AL\'yi temizleyin ve IN AL, 20H komutu ile port 20H\'daki değeri tekrar AL içine okuyun.',
    starterCode: `; Görev: IN ve OUT Port Islemleri
ORG 100H

; 1. AL'ye 7EH yukleyin
; 2. Port 20H'a OUT ile yazin
; 3. AL'yi sifirlayin (MOV AL, 0)
; 4. Port 20H'dan IN ile AL'ye geri okuyun

HLT
`,
    hints: [
      'MOV AL, 7EH',
      'OUT 20H, AL',
      'MOV AL, 0',
      'IN AL, 20H'
    ],
    solutionCode: `ORG 100H
MOV AL, 7EH
OUT 20H, AL
MOV AL, 0
IN AL, 20H
HLT`,
    testSetup: {},
    assertions: {
      expectedRegisters: {
        al: 0x7E
      },
      maxSteps: 20
    }
  },

  'ch-int21h-hello': {
    id: 'ch-int21h-hello',
    title: 'INT 21h (AH=09h) ile Ekrana String Yazdırma',
    milestoneId: 'milestone-9',
    difficulty: 'Orta',
    opcodes: ['INT', 'MOV', 'LEA'],
    scenario: 'MS-DOS işletim sisteminin en meşhur fonksiyonu: AH=09h ve DX=string ofseti ile çağrılan INT 21h, \'$\' karakterine kadar olan metni konsola basar.',
    task: 'DS:0120h adresinde "KOD$" metni hazırdır. DX register\'ına 0120h ofsetini yükleyin, AH=09h yapın ve INT 21h çağrısı ile konsola yazdırın.',
    starterCode: `; Görev: INT 21h Konsol Ciktisi
ORG 100H

; 1. DX'e 0120H ofsetini yukleyin
; 2. AH'a 09H yukleyin
; 3. INT 21H cagrisi yapin

HLT
`,
    hints: [
      'MOV DX, 0120H',
      'MOV AH, 09H',
      'INT 21H'
    ],
    solutionCode: `ORG 100H
MOV DX, 0120H
MOV AH, 09H
INT 21H
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0120, bytes: [0x4B, 0x4F, 0x44, 0x24] } // "KOD$"
      ]
    },
    assertions: {
      expectedConsole: {
        contains: 'KOD'
      },
      maxSteps: 30
    }
  },

  // --- MILESTONE 9: ADVANCED ALGORITHMS & LEETCODE ---
  'ch-algo-bubble-sort': {
    id: 'ch-algo-bubble-sort',
    title: 'LeetCode: 5 Elemanlı Diziyi Sıralama (Bubble Sort)',
    milestoneId: 'milestone-10',
    difficulty: 'Zor',
    opcodes: ['CMP', 'JBE', 'XCHG', 'LOOP'],
    scenario: 'DS:0200h adresinde 5 elemanlı sırasız bir bayt dizisi bulunmaktadır: [50, 20, 40, 10, 30]. Bu diziyi küçükten büyüğe sıralamanız istenmektedir.',
    task: 'Diziyi Bubble Sort algoritması ile sıralayın. Sıralama bittiğinde DS:0200h adresindeki dizi [10, 20, 30, 40, 50] olmalıdır.',
    starterCode: `; Görev: 5 Elemanli Diziyi Sirala (Bubble Sort)
ORG 100H

; Dizi Adresi: [0200H]..[0204H]
; Elemanlar: 50, 20, 40, 10, 30

MOV CX, 4 ; Dis dongu (N-1 adim)

DIS_DONGU:
    PUSH CX
    MOV SI, 0200H
    MOV CX, 4 ; Ic dongu

IC_DONGU:
    MOV AL, [SI]
    CMP AL, [SI+1]
    JBE PAS_GEC
    ; AL > [SI+1] ise takas et
    XCHG AL, [SI+1]
    MOV [SI], AL

PAS_GEC:
    INC SI
    LOOP IC_DONGU

    POP CX
    LOOP DIS_DONGU

HLT
`,
    hints: [
      'İki katmanlı döngüde dış CX değerini PUSH CX / POP CX ile koruyun.',
      'JBE (Jump if Below or Equal) küçük veya eşitken takas yapmadan atlar.'
    ],
    solutionCode: `ORG 100H
MOV CX, 4
DIS_DONGU:
PUSH CX
MOV SI, 0200H
MOV CX, 4
IC_DONGU:
MOV AL, [SI]
CMP AL, [SI+1]
JBE PAS_GEC
XCHG AL, [SI+1]
MOV [SI], AL
PAS_GEC:
INC SI
LOOP IC_DONGU
POP CX
LOOP DIS_DONGU
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [50, 20, 40, 10, 30] }
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0200, expectedBytes: [10, 20, 30, 40, 50], label: 'Sıralı Dizi [0200H]' }
      ],
      maxSteps: 300
    }
  },

  'ch-algo-fibonacci': {
    id: 'ch-algo-fibonacci',
    title: 'LeetCode: N. Fibonacci Sayısını Hesaplama',
    milestoneId: 'milestone-10',
    difficulty: 'Orta',
    opcodes: ['ADD', 'MOV', 'LOOP'],
    scenario: 'Klasik Fibonacci dizisi: F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8, F(7)=13, F(8)=21... CX=7 verilmiştir. 7. Fibonacci sayısını hesaplayıp AX içine yazın.',
    task: 'F(1)=1 ve F(2)=1 başlangıç değerlerini kullanarak CX-2 kez döngü işletin. Her adımda yeni terimi hesaplayıp AX register\'ında 7. Fibonacci sayısı olan 13 (0Dh) değerini elde edin.',
    starterCode: `; Görev: N. Fibonacci Sayisi
ORG 100H

; Girdi: CX = 7
; Cikti: AX = 13 (0DH)

MOV AX, 1 ; F(n-1)
MOV BX, 1 ; F(n-2)
SUB CX, 2 ; Ilk 2 terim biliniyor

FIB_LOOP:
    MOV DX, AX   ; Gecici yedek
    ADD AX, BX   ; Yeni terim = F(n-1) + F(n-2)
    MOV BX, DX   ; F(n-2) = Eski F(n-1)
    LOOP FIB_LOOP

HLT
`,
    hints: [
      'Her adımda AX = AX + BX olur ve eski AX değeri BX\'e devredilir.'
    ],
    solutionCode: `ORG 100H
MOV AX, 1
MOV BX, 1
SUB CX, 2
FIB_LOOP:
MOV DX, AX
ADD AX, BX
MOV BX, DX
LOOP FIB_LOOP
HLT`,
    testSetup: {
      initialRegisters: {
        cx: 7
      }
    },
    assertions: {
      expectedRegisters: {
        ax: 13
      },
      maxSteps: 100
    }
  },

  'ch-algo-palindrome': {
    id: 'ch-algo-palindrome',
    title: 'LeetCode: Palindrom Kontrolü (İki Uçtan Tarama)',
    milestoneId: 'milestone-10',
    difficulty: 'Zor',
    opcodes: ['CMP', 'JNE', 'INC', 'DEC'],
    scenario: 'DS:0200h adresinde 5 harfli bir kelime bulunmaktadır: "RADAR". Bir kelimenin tersten okunuşu kendisiyle aynı ise palindromdur. Eğer palindrom ise AX = 1, değilse AX = 0 olmalıdır.',
    task: 'SI=0200h (başlangıç) ve DI=0204h (bitiş) pointer\'ları tanımlayın. Karşılıklı harfleri CMP ile kıyaslayın. Eşleşmiyorsa AX=0 yapıp çıkın. SI >= DI olana kadar devam ederse AX=1 yapıp durun.',
    starterCode: `; Görev: Palindrom Kontrolu
ORG 100H

MOV SI, 0200H
MOV DI, 0204H

KONTROL:
    CMP SI, DI
    JAE PALINDROM ; Uclar karsilasti veya gecti -> Palindrom!
    MOV AL, [SI]
    CMP AL, [DI]
    JNE DEGIL     ; Harfler eslesmedi -> Palindrom degil!
    INC SI
    DEC DI
    JMP KONTROL

PALINDROM:
    MOV AX, 1
    JMP BITIR

DEGIL:
    MOV AX, 0

BITIR:
HLT
`,
    hints: [
      'SI soldan sağa (INC SI), DI sağdan sola (DEC DI) hareket eder.',
      'Herhangi bir uyuşmazlıkta AX=0, tüm harfler eşleştiğinde AX=1 olur.'
    ],
    solutionCode: `ORG 100H
MOV SI, 0200H
MOV DI, 0204H
KONTROL:
CMP SI, DI
JAE PALINDROM
MOV AL, [SI]
CMP AL, [DI]
JNE DEGIL
INC SI
DEC DI
JMP KONTROL
PALINDROM:
MOV AX, 1
JMP BITIR
DEGIL:
MOV AX, 0
BITIR:
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0x52, 0x41, 0x44, 0x41, 0x52] } // "RADAR"
      ]
    },
    assertions: {
      expectedRegisters: {
        ax: 1
      },
      maxSteps: 100
    }
  },
  // --- MILESTONE 11: ADVANCED SYSTEM & TABLE INSTRUCTIONS ---
  'ch-flags-manipulation': {
    id: 'ch-flags-manipulation',
    title: 'Bayrak Denetim Komutları (STC, CMC, LAHF)',
    milestoneId: 'milestone-11',
    difficulty: 'Kolay',
    opcodes: ['STC', 'CMC', 'LAHF', 'MOV'],
    scenario: 'Eldeli bir aritmetik zincirinden önce ve sonrasında Carry Flag (CF) durumunun doğrudan kurulması ve durum bayraklarının AH yazmacına saklanması gerekiyor.',
    task: 'STC ile CF=1 yapın. CMC ile CF bayrağını tersleyin (CF=0). Ardından tekrar STC ile CF=1 yapın ve LAHF komutu ile bayrakları AH yazmacına okuyun.',
    starterCode: `; Görev: Bayrak Manipulasyonu
ORG 100H

; 1. STC komutu ile CF bayragini 1 yapin:
; TODO:


; 2. CMC komutu ile CF bayragini tersleyin (0 yapin):
; TODO:


; 3. STC ile tekrar CF=1 yapin:
; TODO:


; 4. LAHF komutu ile bayraklari AH yazmacina yukleyin:
; TODO:


HLT
`,
    hints: [
      'STC Carry bayrağını 1 yapar (Set Carry).',
      'CMC Carry bayrağını tersler (Complement Carry).',
      'LAHF bayrakları AH içine aktarır (Load AH from Flags).'
    ],
    solutionCode: `ORG 100H
STC
CMC
STC
LAHF
HLT`,
    testSetup: {},
    assertions: {
      expectedFlags: {
        cf: 1
      },
      maxSteps: 15
    }
  },

  'ch-xlat-table': {
    id: 'ch-xlat-table',
    title: 'XLAT ile Donanımsal Lookup Tablosu Çevirisi',
    milestoneId: 'milestone-11',
    difficulty: 'Orta',
    opcodes: ['XLAT', 'MOV'],
    scenario: '7-Segment display veya şifreleme dönüşüm tablosu 0200H adresinde saklanmaktadır. AL = 3 indeksindeki dönüşüm baytını tek bir XLAT komutu ile okuyun.',
    task: 'BX = 0200H (tablo tabanı) ve AL = 3 (indis) yükleyin. XLAT komutunu çalıştırarak [BX + AL] adresindeki veriyi AL içine çekin.',
    starterCode: `; Görev: XLAT ile Tablo Donusumu
ORG 100H

; 1. BX'e tablo baslangic adresini (0200H) yukleyin:
; TODO:


; 2. AL'ye 3 indisini yukleyin:
; TODO:


; 3. XLAT komutu ile [BX + AL] verisini AL'ye donusturun:
; TODO:


HLT
`,
    hints: [
      'XLAT komutu AL = [BX + AL] işlemini tek çevrimde donanımsal olarak yapar.'
    ],
    solutionCode: `ORG 100H
MOV BX, 0200H
MOV AL, 3
XLAT
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0x10, 0x20, 0x30, 0x42, 0x50] } // index 3 is 0x42
      ]
    },
    assertions: {
      expectedRegisters: {
        al: 0x42
      },
      maxSteps: 15
    }
  },

  'ch-jcxz-guard': {
    id: 'ch-jcxz-guard',
    title: 'JCXZ ile Sıfır Döngü Taşma Koruması',
    milestoneId: 'milestone-11',
    difficulty: 'Orta',
    opcodes: ['JCXZ', 'LOOP', 'MOV', 'ADD'],
    scenario: 'Döngü sayacı CX = 0 olarak geldiğinde LOOP komutu çalıştırılırsa CX önce 0xFFFF (65535) olur ve sistem sonsuz döngüye girer. Döngü öncesinde JCXZ ile güvenlik atlaması yapın.',
    task: 'CX = 0 iken JCXZ DONGUDEN_CIK komutu ile döngüyü tamamen atlayın. Döngü gövdesinde ADD AX, 1 ve LOOP DONGU yer alacaktır. AX değerinin 0 kaldığını doğrulayın.',
    starterCode: `; Görev: JCXZ Sifir Sayac Guvenligi
ORG 100H

MOV CX, 0
MOV AX, 0

; 1. Eger CX == 0 ise DONGUDEN_CIK etiketine atlayin (JCXZ):
; TODO:


DONGU:
ADD AX, 1
LOOP DONGU

DONGUDEN_CIK:
HLT
`,
    hints: [
      'JCXZ Etiket komutu CX == 0 ise doğrudan belirtilen etikete atlar.',
      'Bu sayede LOOP komutunun FFFFh taşması önlenmiş olur.'
    ],
    solutionCode: `ORG 100H
MOV CX, 0
MOV AX, 0
JCXZ DONGUDEN_CIK
DONGU:
ADD AX, 1
LOOP DONGU
DONGUDEN_CIK:
HLT`,
    testSetup: {},
    assertions: {
      expectedRegisters: {
        ax: 0x0000
      },
      maxSteps: 15
    }
  },

  // =========================================================================
  // --- CUMULATIVE CAPSTONE CHALLENGES (AŞAMA SONU KAPSAYICI SENTEZ GÖREVLERİ) ---
  // =========================================================================

  'ch-capstone-stage2': {
    id: 'ch-capstone-stage2',
    title: 'Aşama 1-2 Kapsayıcı: Sensör Veri Takası ve Little-Endian Bellek Düzenleme',
    milestoneId: 'milestone-2',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-2 Kapsayıcı Sentez',
    opcodes: ['MOV', 'XCHG', 'LEA'],
    scenario: 'İki harici telemetri sensöründen gelen 16-bit word verileri bellekte [0200h] ve [0210h] adreslerinde Little-Endian formatında tutulmaktadır. BX=0200h, SI=0010h olarak ayarlanmıştır.',
    task: 'Bellekteki iki sensör verisinin yerlerini takas edin (swap). Sensör 1 verisi [0200h] adresinde, Sensör 2 verisi ise taban (BX=0200h) ve indis (SI=0010h) değerlerinin işaret ettiği efektif adrestedir. Takas edilen yeni değerleri belleğe geri yazın. Son olarak birinci sensörün yüksek baytını DH yazmacına, ikinci sensörün düşük baytını ise DL yazmacına kaydederek durumu güncelleyin.',
    starterCode: `; Görev: Aşama 1-2 Kapsayıcı Sentez
; Sensör 1: [0200H], Sensör 2: [BX + SI]
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'Sensör 2 ofset adresini hesaplayıp bir yazmaca almak için LEA komutunu kullanabilirsiniz (Örn: LEA DI, [BX + SI]).',
      'İki 16-bit veriyi yazmaçlara okuduktan sonra atomik takas için XCHG komutundan yararlanabilirsiniz.',
      'Aşama 1 kuralı: DH ve DL yazmaçları DX\'in 8-bit bağımsız parçalarıdır.',
      'Detaylı Adım Adım Rehber:\n1. LEA DI, [BX + SI]\n2. MOV AX, [BX] ve MOV CX, [DI]\n3. XCHG AX, CX\n4. MOV [BX], AX ve MOV [DI], CX\n5. MOV DH, AH ve MOV DL, CL'
    ],
    solutionCode: `ORG 100H
LEA DI, [BX + SI]
MOV AX, [BX]
MOV CX, [DI]
XCHG AX, CX
MOV [BX], AX
MOV [DI], CX
MOV DH, AH
MOV DL, CL
HLT`,
    testSetup: {
      initialRegisters: {
        bx: 0x0200,
        si: 0x0010
      },
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0x34, 0x12] }, // 0x1234
        { segment: 0x0000, offset: 0x0210, bytes: [0x78, 0x56] }  // 0x5678
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0200, expectedBytes: [0x78, 0x56], label: 'Bellek [0200H] (0x5678)' },
        { segment: 0x0000, offset: 0x0210, expectedBytes: [0x34, 0x12], label: 'Bellek [0210H] (0x1234)' }
      ],
      maxSteps: 20
    }
  },

  'ch-capstone-stage3': {
    id: 'ch-capstone-stage3',
    title: 'Aşama 1-3 Kapsayıcı: Bellek Sensör Kalibrasyonu ve Bölme/Kalan Analizi',
    milestoneId: 'milestone-3',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-3 Kapsayıcı Sentez',
    opcodes: ['MOV', 'ADD', 'DIV'],
    scenario: 'Kalibrasyon birimi, bellekte [0300h] adresindeki 16-bit ham sensör verisini (250) okuyup [0302h] adresindeki kalibrasyon ofsetini (50) ekleyecek, ardından 8\'e bölüp bölümü [0304h] adresine, kalanı ise [0306h] adresine yazacaktır.',
    task: 'Bellekte [0300h] adresinde bulunan 16-bit ham veriyi okuyun ve [0302h] adresindeki kalibrasyon ofsetini ekleyin. Düzeltilmiş toplam değeri 8\'e bölerek tam bölümü [0304h] adresine, kalanı ise [0306h] adresine kaydedin.',
    starterCode: `; Görev: Aşama 1-3 Kapsayıcı Sentez
; Ham Veri: [0300H], Ofset: [0302H], Bölen: 8
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'Taban adres BX=0300h olarak ayarlanmıştır; [BX] ve [BX + 2] indekslerini kullanabilirsiniz.',
      '16-bit bölme (DIV) yaparken işlemci bölünen sayıyı DX:AX çifti olarak kabul eder. Bu nedenle bölme öncesi DX yazmacı mutlaka 0 yapılmalıdır.',
      'Detaylı Adım Adım Rehber:\n1. MOV AX, [BX]\n2. ADD AX, [BX + 2]\n3. MOV DX, 0 ve MOV CX, 8\n4. DIV CX (Bölüm AX, Kalan DX)\n5. MOV [BX + 4], AX ve MOV [BX + 6], DX'
    ],
    solutionCode: `ORG 100H
MOV AX, [BX]
ADD AX, [BX + 2]
MOV DX, 0
MOV CX, 8
DIV CX
MOV [BX + 4], AX
MOV [BX + 6], DX
HLT`,
    testSetup: {
      initialRegisters: {
        bx: 0x0300
      },
      initialMemory: [
        { segment: 0x0000, offset: 0x0300, bytes: [250, 0] }, // 250
        { segment: 0x0000, offset: 0x0302, bytes: [50, 0] }   // 50 -> Toplam = 300. 300 / 8 = 37 (kalan 4)
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0304, expectedBytes: [37, 0], label: 'Bölüm [0304H]' },
        { segment: 0x0000, offset: 0x0306, expectedBytes: [4, 0], label: 'Kalan [0306H]' }
      ],
      maxSteps: 25
    }
  },

  'ch-capstone-stage4': {
    id: 'ch-capstone-stage4',
    title: 'Aşama 1-4 Kapsayıcı: Telemetri Bit Paketi Ayrıştırıcı ve Aritmetik Ölçekleyici',
    milestoneId: 'milestone-4',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-4 Kapsayıcı Sentez',
    opcodes: ['MOV', 'AND', 'SHR', 'MUL'],
    scenario: '16-bit paketlenmiş bir telemetri kelimesi [0400h] adresindedir. Bu paketin yüksek baytı (High Byte, bit 8-15) baz sensör değerini (12), düşük baytının alt 4 biti (bit 0-3) çarpan katsayısını (5) içerir.',
    task: '[0400h] adresinde saklanan 16-bit paketlenmiş telemetri kelimesini ayrıştırın: Düşük baytın alt 4 bitindeki çarpan katsayısı ile yüksek bayttaki baz sensör değerini çarpın ve nihai ölçekli değeri [0402h] adresine yazın.',
    starterCode: `; Görev: Aşama 1-4 Kapsayıcı Sentez
; Telemetri Paketi: [0400H], Hedef: [0402H]
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'Alt 4 biti izole etmek için AND BL, 0FH bit maskesi uygulayabilirsiniz.',
      '8086 mimarisinde 1 bitten fazla kaydırma yaparken adet mutlaka CL yazmacında olmalıdır (MOV CL, 8 ardından SHR AX, CL).',
      'MUL BL işlemi AL ile BL\'yi çarpar ve 16-bit sonucu AX içine yerleştirir.',
      'Detaylı Adım Adım Rehber:\n1. MOV AX, [0400H]\n2. MOV BX, AX\n3. AND BL, 0FH\n4. MOV CL, 8 ardından SHR AX, CL\n5. MUL BL\n6. MOV [0402H], AX'
    ],
    solutionCode: `ORG 100H
MOV AX, [0400H]
MOV BX, AX
AND BL, 0FH
MOV CL, 8
SHR AX, CL
MUL BL
MOV [0402H], AX
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0400, bytes: [0x05, 0x0C] } // High byte 12 (0x0C), Low byte 5 (0x05)
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0402, expectedBytes: [60, 0], label: 'Ölçekli Değer [0402H] (60)' }
      ],
      maxSteps: 20
    }
  },

  'ch-capstone-stage5': {
    id: 'ch-capstone-stage5',
    title: 'Aşama 1-5 Kapsayıcı: Dinamik Dizi Filtreleme ve Koşullu İstatistik Motoru',
    milestoneId: 'milestone-5',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-5 Kapsayıcı Sentez',
    opcodes: ['MOV', 'CMP', 'LOOP', 'ADD'],
    scenario: 'Bellekte [0500h] adresinde 4 adet 16-bit tam sayı yer almaktadır. Sadece eşik değerinden (10) büyük olan sayıları toplayıp sonucu [0510h] adresine, bu şarta uyan sayı adedini ise [0512h] adresine yazmanız gerekmektedir.',
    task: 'Bellekte [0500h] adresinden başlayan 4 elemanlı 16-bit sayı dizisini döngü ile tarayın. Eşik değerinden (10) büyük olan sayıları toplayarak sonucu [0510h] adresine, bu şarta uyan sayı adedini ise [0512h] adresine kaydedin.',
    starterCode: `; Görev: Aşama 1-5 Kapsayıcı Sentez
; Dizi: [0500H] (4 kelime), Eşik: 10
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'Döngü sayacı için CX=4 yükleyip LOOP komutunu kullanabilirsiniz.',
      '10 veya daha küçük sayıları atlamak için CMP BX, 10 ardından JLE ATLA koşullu atlamasını tercih edin.',
      'Her kelime 2 bayt yer kapladığı için dizi indisini her turda 2 artırmalısınız (ADD SI, 2).',
      'Detaylı Adım Adım Rehber:\n1. SI=0, AX=0 (toplam), DX=0 (adet), CX=4\n2. DONGU: MOV BX, [0500H + SI]\n3. CMP BX, 10 -> JLE ATLA\n4. ADD AX, BX -> INC DX\n5. ATLA: ADD SI, 2 -> LOOP DONGU\n6. MOV [0510H], AX ve MOV [0512H], DX'
    ],
    solutionCode: `ORG 100H
MOV SI, 0
MOV AX, 0
MOV DX, 0
MOV CX, 4

DONGU:
MOV BX, [0500H + SI]
CMP BX, 10
JLE ATLA
ADD AX, BX
INC DX

ATLA:
ADD SI, 2
LOOP DONGU

MOV [0510H], AX
MOV [0512H], DX
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0500, bytes: [5, 0, 20, 0, 8, 0, 15, 0] } // 5, 20, 8, 15 -> 20 + 15 = 35 (adet 2)
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0510, expectedBytes: [35, 0], label: 'Toplam [0510H] (35)' },
        { segment: 0x0000, offset: 0x0512, expectedBytes: [2, 0], label: 'Adet [0512H] (2)' }
      ],
      maxSteps: 50
    }
  },

  'ch-capstone-stage6': {
    id: 'ch-capstone-stage6',
    title: 'Aşama 1-6 Kapsayıcı: Modüler Yığın Çerçevesi ve Güvenli Prosedür Çağrımı',
    milestoneId: 'milestone-6',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-6 Kapsayıcı Sentez',
    opcodes: ['PUSH', 'POP', 'CALL', 'RET', 'MUL', 'ADD'],
    scenario: 'Profesyonel bir matematik alt yordamı (HESAPLA), çağrılmadan önce AX ve BX register\'larındaki sayıların karesini alıp toplamını hesaplamalı, içeride kullandığı yazmaçları yığında saklayıp geri yüklemelidir.',
    task: 'AX ve BX yazmaçlarındaki sayıların karelerinin toplamını (AX² + BX²) hesaplayıp sonucu [0600h] adresine kaydeden modüler bir HESAPLA altprogramı yazın ve ana programdan çağırın.',
    starterCode: `; Görev: Aşama 1-6 Kapsayıcı Sentez
ORG 100H

MOV AX, 3
MOV BX, 4

; Altprogramı çağırıp sonucu [0600H]'ye kaydedin:
; TODO:


HLT

HESAPLA:
; Prosedür gövdesi:
; TODO:


RET
`,
    hints: [
      'Altprogram çağırmak için CALL HESAPLA, altprogramdan dönmek için RET komutunu kullanın.',
      'Altprogram içinde kullanılan yazmaçları korumak veya parametre takası yapmak için PUSH ve POP yığın komutlarından yararlanın.',
      'Detaylı Adım Adım Rehber:\n- Ana Program: MOV AX, 3 -> MOV BX, 4 -> CALL HESAPLA -> MOV [0600H], AX -> HLT\n- HESAPLA Yordamı: PUSH BX -> MUL AL -> MOV CX, AX -> POP AX -> MUL AL -> ADD AX, CX -> RET'
    ],
    solutionCode: `ORG 100H
MOV AX, 3
MOV BX, 4
CALL HESAPLA
MOV [0600H], AX
HLT

HESAPLA:
PUSH BX
MUL AL
MOV CX, AX
POP AX
MUL AL
ADD AX, CX
RET`,
    testSetup: {},
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0600, expectedBytes: [25, 0], label: 'Kareler Toplamı [0600H] (25)' }
      ],
      maxSteps: 30
    }
  },

  'ch-capstone-stage7': {
    id: 'ch-capstone-stage7',
    title: 'Aşama 1-7 Kapsayıcı: Donanımsal Blok Şifreleme ve String Tarama Motoru',
    milestoneId: 'milestone-7',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-7 Kapsayıcı Sentez',
    opcodes: ['CLD', 'LODSB', 'STOSB', 'XOR', 'LOOP'],
    scenario: 'Bellekte [0700h] adresinde bulunan 5 baytlık ham veri bloğu, donanımsal string komutları (LODSB, STOSB) kullanılarak 5Ah anahtarıyla XOR şifrelemeden geçirilecek ve [0710h] adresine yazılacaktır.',
    task: '[0700h] adresinde bulunan 5 baytlık veri bloğunu donanımsal string komutlarını kullanarak 5Ah anahtarıyla XOR şifrelemeden geçirin ve [0710h] adresine yazın.',
    starterCode: `; Görev: Aşama 1-7 Kapsayıcı Sentez
; Kaynak: [0700H], Hedef: [0710H], Boyut: 5 bayt, Anahtar: 5AH
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'String komutlarının SI ve DI yazmaçlarını ileri yönde otomatik artırması için önce CLD yönergesini çalıştırın.',
      'LODSB komutu [SI] adresinden okuyup SI\'yi artırır; STOSB komutu AL\'yi [DI] adresine yazıp DI\'yi artırır.',
      'Detaylı Adım Adım Rehber:\n1. CLD\n2. MOV SI, 0700H, MOV DI, 0710H, MOV CX, 5\n3. SIFRELE: LODSB -> XOR AL, 5AH -> STOSB -> LOOP SIFRELE\n4. HLT'
    ],
    solutionCode: `ORG 100H
CLD
MOV SI, 0700H
MOV DI, 0710H
MOV CX, 5

SIFRELE:
LODSB
XOR AL, 5AH
STOSB
LOOP SIFRELE

HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0700, bytes: [0x11, 0x22, 0x33, 0x44, 0x55] }
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0710, expectedBytes: [0x11 ^ 0x5A, 0x22 ^ 0x5A, 0x33 ^ 0x5A, 0x44 ^ 0x5A, 0x55 ^ 0x5A], label: 'Şifreli Blok [0710H]' }
      ],
      maxSteps: 40
    }
  },

  'ch-capstone-stage8': {
    id: 'ch-capstone-stage8',
    title: 'Aşama 1-8 Kapsayıcı: 3-Baytlık Paketlenmiş BCD Muhasebe Toplayıcısı',
    milestoneId: 'milestone-8',
    difficulty: 'Zor',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-8 Kapsayıcı Sentez',
    opcodes: ['MOV', 'ADC', 'DAA', 'LOOP', 'INC'],
    scenario: 'Finansal bir POS terminalinde iki adet 3-baytlık (6 basamaklı) paketlenmiş BCD sayısı [0800h] ve [0810h] adreslerindedir. Sayı 1: 12 34 56 (bellekte: 56h, 34h, 12h), Sayı 2: 24 45 67 (bellekte: 67h, 45h, 24h).',
    task: 'Bellekte [0800h] ve [0810h] adreslerinde tutulan 3-baytlık (6 basamaklı) iki paketlenmiş BCD sayısını toplayarak elde edilen BCD sonucunu [0820h] adresine yazın.',
    starterCode: `; Görev: Aşama 1-8 Kapsayıcı Sentez
; BCD 1: [0800H], BCD 2: [0810H], Sonuç: [0820H] (3 bayt)
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'İkili toplama sonrasında onluk basamak düzeltmesi yapmak için DAA komutunu kullanın.',
      'Önceki basamaktan gelen eldeyi kaybetmemek için toplama işlemini ADC komutuyla yapın.',
      'INC SI komutu Carry bayrağını (CF) bozmaz, bu sayede basamaklar arası elde korunur.',
      'Detaylı Adım Adım Rehber:\n1. SI=0, CX=3, Carry\'yi temizleyin (MOV BL, 0 / ADD BL, 0)\n2. TOPLA: MOV AL, [0800H + SI] -> ADC AL, [0810H + SI] -> DAA -> MOV [0820H + SI], AL -> INC SI -> LOOP TOPLA\n3. HLT'
    ],
    solutionCode: `ORG 100H
MOV SI, 0
MOV CX, 3
MOV BL, 0
ADD BL, 0

TOPLA_BCD:
MOV AL, [0800H + SI]
ADC AL, [0810H + SI]
DAA
MOV [0820H + SI], AL
INC SI
LOOP TOPLA_BCD

HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0800, bytes: [0x56, 0x34, 0x12] },
        { segment: 0x0000, offset: 0x0810, bytes: [0x67, 0x45, 0x24] }
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0820, expectedBytes: [0x23, 0x80, 0x36], label: 'Sonuç BCD [0820H]' }
      ],
      maxSteps: 40
    }
  },

  'ch-capstone-stage9': {
    id: 'ch-capstone-stage9',
    title: 'Aşama 1-9 Kapsayıcı: G/Ç Sensör Telemetrisi ve INT 21h Konsol Raporlama',
    milestoneId: 'milestone-9',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-9 Kapsayıcı Sentez',
    opcodes: ['IN', 'OUT', 'AND', 'ADD', 'INT'],
    scenario: 'Donanım portu 20H üzerinden gönderilen telemetri durumunu okuyacak, durum kodunu ASCII rakam karakterine dönüştürüp bellekteki mesaj şablonuna yerleştirecek ve INT 21h ile konsola raporlayacaksınız.',
    task: '20H donanım portuna 05H durum baytını gönderin ve porttan geri okuyun. Okunan değerin alt 4 bitindeki durum kodunu ASCII rakamına çevirerek [0900h] adresindeki "DURUM:  $" mesaj şablonuna yerleştirin ve INT 21H (AH=09H) ile konsola yazdırın.',
    starterCode: `; Görev: Aşama 1-9 Kapsayıcı Sentez
; Port: 20H, Mesaj: [0900H]
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'Porta veri yazmak için OUT 20H, AL; okumak için IN AL, 20H komutlarını kullanın.',
      'Rakamı ASCII karaktere çevirmek için alt 4 biti izole edip (AND AL, 0FH) 30H ekleyin.',
      'INT 21H servis 09H, DS:DX ile gösterilen \'$\' sonlu metni ekrana basar.',
      'Detaylı Adım Adım Rehber:\n1. MOV AL, 05H -> OUT 20H, AL\n2. IN AL, 20H -> AND AL, 0FH -> ADD AL, 30H\n3. MOV [0907H], AL\n4. MOV DX, 0900H -> MOV AH, 09H -> INT 21H\n5. HLT'
    ],
    solutionCode: `ORG 100H
MOV AL, 05H
OUT 20H, AL
IN AL, 20H
AND AL, 0FH
ADD AL, 30H
MOV [0907H], AL
MOV DX, 0900H
MOV AH, 09H
INT 21H
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0900, bytes: [0x44, 0x55, 0x52, 0x55, 0x4D, 0x3A, 0x20, 0x20, 0x24] }
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0907, expectedBytes: [0x35], label: 'ASCII Değer [0907H] (\'5\')' }
      ],
      expectedConsole: {
        contains: 'DURUM: 5'
      },
      maxSteps: 25
    }
  },

  'ch-capstone-stage10': {
    id: 'ch-capstone-stage10',
    title: 'Aşama 1-10 Kapsayıcı: Pipeline Dostu 2x Döngü Açma ve Çift Elemanlı Dizi Arama',
    milestoneId: 'milestone-10',
    difficulty: 'Zor',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-10 Kapsayıcı Sentez',
    opcodes: ['MOV', 'ADD', 'CMP', 'LOOP'],
    scenario: 'Aşama 10\'da öğrendiğimiz döngü açma (Loop Unrolling) tekniğini uygulayarak, 6 elemanlı bir 16-bit tam sayı dizisinde çift elemanları aynı iterasyonda işleyip (2x unrolling) toplamı ve en büyük sayıyı bulun.',
    task: 'Bellekte [1000h] adresindeki 6 elemanlı 16-bit tam sayı dizisini 2x döngü açma (Loop Unrolling) yöntemiyle tarayın (her iterasyonda 2 eleman işleyin). Sayıların toplamını [1020h] adresine, en büyük sayıyı ise [1022h] adresine kaydedin.',
    starterCode: `; Görev: Aşama 1-10 Kapsayıcı Sentez
; Dizi: [1000H] (6 kelime), 2x Loop Unrolling (CX=3 iterasyon)
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      '6 eleman 2\'şerli işlendiğinde döngü 3 kez döner (CX=3) ve her turda SI indisi 4 bayt artırılır (ADD SI, 4).',
      'Aynı iterasyon içinde iki komut ile iki kelimeyi birden yükleyin: MOV BX, [1000H + SI] ve MOV BP, [1000H + SI + 2].',
      'Detaylı Adım Adım Rehber:\n1. SI=0, AX=0 (toplam), DX=0 (max), CX=3\n2. DONGU: İki sayıyı oku, AX\'e ekle, DX ile karşılaştırıp büyüğü güncelle\n3. ADD SI, 4 -> LOOP DONGU\n4. MOV [1020H], AX ve MOV [1022H], DX\n5. HLT'
    ],
    solutionCode: `ORG 100H
MOV SI, 0
MOV AX, 0
MOV DX, 0
MOV CX, 3

DONGU:
MOV BX, [1000H + SI]
MOV BP, [1000H + SI + 2]
ADD AX, BX
ADD AX, BP

CMP BX, DX
JLE S1
MOV DX, BX

S1:
CMP BP, DX
JLE S2
MOV DX, BP

S2:
ADD SI, 4
LOOP DONGU

MOV [1020H], AX
MOV [1022H], DX
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x1000, bytes: [10, 0, 25, 0, 5, 0, 40, 0, 15, 0, 30, 0] }
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x1020, expectedBytes: [125, 0], label: 'Toplam [1020H] (125)' },
        { segment: 0x0000, offset: 0x1022, expectedBytes: [40, 0], label: 'Maksimum [1022H] (40)' }
      ],
      maxSteps: 60
    }
  },

  'ch-capstone-stage11': {
    id: 'ch-capstone-stage11',
    title: 'Aşama 1-11 Büyük Usta Sentezi (Grand Capstone): Güvenli XLAT Kripto Çevirici ve Sistem Bayrak Koruyucusu',
    milestoneId: 'milestone-11',
    difficulty: 'Zor',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-11 Tüm Müfredat Grand Capstone',
    opcodes: ['XLAT', 'JCXZ', 'LAHF', 'STC', 'LOOP', 'MOV'],
    scenario: '8086 mimarisinin tüm 11 aşamasını birleştiren nihai sınav! CX ile belirtilen uzunluktaki şifreli veri dizisini JCXZ ile sıfır sayaç taşmasına karşı koruyacak, bayrak durumunu LAHF ile yedekleyecek, XLAT donanımsal arama tablosu ile dönüştürüp hedef belleğe yazacak ve işlemi başarıyla bitirince STC ile Carry bayrağını 1 yapacaksınız.',
    task: 'CX yazmacında uzunluğu verilen şifreli veri dizisini [1150h] adresindeki XLAT donanımsal arama tablosunu kullanarak dönüştürün ve [1120h] adresine kaydedin. CX=0 olduğunda döngüye girmeden güvenli çıkış yapın, işlem öncesinde bayrakları saklayın ve işlem başarıyla bittiğinde Carry bayrağını 1 yapın.',
    starterCode: `; Görev: Aşama 1-11 Büyük Usta Sentezi (Grand Capstone)
; Şifreli: [1100H], XLAT Tablosu: [1150H], Hedef: [1120H], Uzunluk: CX
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


BITIR:
HLT
`,
    hints: [
      'CX=0 iken LOOP\'un 65535 kez dönmesini engellemek için en başta JCXZ BITIR güvenlik kontrolü yapın.',
      'Bayrak durumunu AH yazmacına kopyalamak için LAHF komutunu kullanın.',
      'XLAT komutu AL = [BX + AL] donanımsal çevrimini yapar. Taban adres için BX=1150H yükleyin.',
      'Carry bayrağını 1 yapmak için STC komutundan yararlanın.',
      'Detaylı Adım Adım Rehber:\n1. JCXZ BITIR\n2. LAHF -> MOV DH, AH\n3. BX=1150H, SI=0\n4. CEVIR: MOV AL, [1100H + SI] -> XLAT -> MOV [1120H + SI], AL -> INC SI -> LOOP CEVIR\n5. STC\n6. BITIR: HLT'
    ],
    solutionCode: `ORG 100H
JCXZ BITIR
LAHF
MOV DH, AH
MOV BX, 1150H
MOV SI, 0

CEVIR:
MOV AL, [1100H + SI]
XLAT
MOV [1120H + SI], AL
INC SI
LOOP CEVIR

STC

BITIR:
HLT`,
    testSetup: {
      initialRegisters: {
        cx: 3
      },
      initialMemory: [
        { segment: 0x0000, offset: 0x1100, bytes: [2, 0, 1] }, // İndeksler
        { segment: 0x0000, offset: 0x1150, bytes: [0xAA, 0xBB, 0xCC] } // 0->AA, 1->BB, 2->CC
      ]
    },
    assertions: {
      expectedFlags: {
        cf: 1
      },
      expectedMemory: [
        { segment: 0x0000, offset: 0x1120, expectedBytes: [0xCC, 0xAA, 0xBB], label: 'Dönüştürülmüş Blok [1120H]' }
      ],
      maxSteps: 40
    }
  }
};
