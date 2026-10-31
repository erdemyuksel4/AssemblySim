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
        description: 'İndeksli bellek adresleme ([BX] ve [BX + SI]) kullanarak bellekteki iki 16-bitlik sayının (1234h ve 5678h) yerlerini birbiriyle değiştirme (Swap) görevi.',
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
        opcodes: ['MOV', 'ADD', 'DIV'],
        description: 'Bellekteki iki 16-bitlik puanı (250 + 50 = 300) toplayıp 8\'e bölerek bölüm (37) ve kalan (4) değerlerini belleğe kaydetme görevi.',
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
        description: 'Tek bir bayt (0C5h) içine sıkıştırılmış iki adet 4-bitlik veriyi (Üst 4 bit: Fiyat = 12, Alt 4 bit: Adet = 5) SHR ve AND ile ayıklayıp toplam tutarı (12 × 5 = 60) hesaplama görevi.',
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
        description: '4 elemanlı bir sayı dizisini ([5, 20, 8, 15]) döngü ile tarayarak yalnızca 10\'dan büyük olan sayıların toplamını (35) ve adedini (2) hesaplama görevi.',
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
        description: 'Ana programdaki CX sayacını yığında (PUSH/POP) koruyarak AX² + BX² (3² + 4² = 25) hesabını yapan modüler bir alt program (CALL/RET) görevi.',
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
        challengeIds: ['ch-string-copy', 'ch-string-fill', 'ch-string-load']
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
        description: 'Bellekteki 5 harfli "METIN" kelimesini LODSB ile okuyup, XOR 20h ile küçük harfe ("metin") dönüştürerek STOSB ile hedef belleğe yazma görevi.',
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
        opcodes: ['MOV', 'ADD', 'DAA', 'LOOP', 'INC'],
        description: 'Yazar kasa sepetindeki 3 ürünün Paketlenmiş BCD fiyatlarını (25 TL + 38 TL + 19 TL = 82 TL) döngü ve DAA onluk düzeltmesi ile toplama görevi.',
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
        description: '20h giriş portundaki sensör verisini (85h) okuyup alt 4 bitini (5) ayıklayarak 21h çıkış portuna gönderme ve ASCII rakama çevirip INT 21h ile ekrana "DURUM: 5" yazdırma görevi.',
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
        opcodes: ['MOV', 'CMP', 'SUB', 'LOOP'],
        description: '6 elemanlı bir sayı dizisindeki En Küçük (Min = 8) ve En Büyük (Max = 60) değerleri bulup aralarındaki açıklığı (Max - Min = 52) hesaplama algoritması.',
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
        opcodes: ['CLC', 'JCXZ', 'XLAT', 'LOOP', 'STC', 'MOV'],
        description: 'JCXZ sıfır sayaç koruması, XLAT donanımsal tablo çevirisi ([2, 0, 1] → [CCh, AAh, BBh]) ve STC işlem başarı bayrağını birleştiren bitirme görevi.',
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

  'ch-string-load': {
    id: 'ch-string-load',
    title: 'LODSB ile Bellekten Karakter Okuma ve İndeks İlerletme',
    milestoneId: 'milestone-7',
    difficulty: 'Kolay',
    opcodes: ['LODSB', 'CLD', 'MOV'],
    scenario: 'Bellekte [0200h] adresinde 3 baytlık \'ABC\' metni (ASCII 41h, 42h, 43h) saklanmaktadır. LODSB komutu kullanarak ilk iki karakteri sırayla okuyup ilkini AH\'ye, ikincisini AL\'ye yerleştirmeniz isteniyor.',
    task: '1. CLD ile artan yönü ayarlayın ve SI = 0200h yapın.\n2. İlk LODSB komutunu çalıştırarak \'A\' (41h) baytını AL\'ye okuyun (SI = 0201h olur).\n3. Bu değeri AH\'ye saklayın (MOV AH, AL).\n4. İkinci LODSB komutunu çalıştırarak \'B\' (42h) baytını AL\'ye okuyun (SI = 0202h olur).\n5. Program bittiğinde AX = 4142h ve SI = 0202h olmalıdır.',
    starterCode: `; Görev: LODSB ile Karakter Okuma
; Bellek [0200H]: 'A' (41H), 'B' (42H), 'C' (43H)
; Beklenen: AX = 4142H ('AB'), SI = 0202H
ORG 100H

; 1. CLD ile yonu secin, SI = 0200H yapin
; 2. Ilk bayti AL'ye okuyup AH'ye kopyalayin
; 3. Ikinci bayti AL'ye okuyun
; TODO:


HLT
`,
    hints: [
      'LODSB komutu operand almaz; daima DS:SI adresinden okuyup AL\'ye yazar ve SI\'yi (DF=0 iken) 1 artırır.',
      'İlk LODSB sonrası MOV AH, AL yaparak ilk okunan değeri güvenceye alın, ardından ikinci LODSB\'yi çalıştırın.'
    ],
    solutionCode: `ORG 100H
CLD
MOV SI, 0200H
LODSB
MOV AH, AL
LODSB
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0200, bytes: [0x41, 0x42, 0x43] } // "ABC"
      ]
    },
    assertions: {
      expectedRegisters: {
        ax: 0x4142,
        si: 0x0202
      },
      maxSteps: 20
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
    title: 'Aşama 1-2 Kapsayıcı: İndeksli Bellek Adresleme ile İki 16-Bit Sayıyı Takas Etme (Swap)',
    milestoneId: 'milestone-2',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-2 Kapsayıcı Sentez',
    opcodes: ['MOV', 'XCHG', 'LEA'],
    scenario: `Bellekte iki farklı adreste 16-bitlik (2 baytlık word) iki sayı saklanmaktadır:
• 1. Sayı: [0200h] adresinde 1234h (Little-Endian olarak bellekte: [0200h]=34h, [0201h]=12h)
• 2. Sayı: [0210h] adresinde 5678h (Little-Endian olarak bellekte: [0210h]=78h, [0211h]=56h)
Başlangıçta BX = 0200h (taban adres) ve SI = 0010h (indis) olarak hazır verilmiştir. Dolayısıyla [BX] ifadesi [0200h] adresini, [BX + SI] ifadesi ise [0210h] adresini işaret eder.`,
    task: `Bellekteki bu iki 16-bitlik sayının yerlerini birbiriyle değiştirin (swap):
1. [0200h] ([BX]) adresindeki 1234h değerini ve [0210h] ([BX + SI]) adresindeki 5678h değerini yazmaçlara okuyun.
2. Değerlerin yerini değiştirerek [0200h] adresine 5678h, [0210h] adresine ise 1234h değerini geri yazın.
3. İşlem sonunda [0200h] adresinde [78h, 56h] (5678h), [0210h] adresinde ise [34h, 12h] (1234h) bulunmalıdır. Programı HLT ile bitirin.`,
    starterCode: `; Görev: Aşama 1-2 Kapsayıcı Sentez (Bellekteki İki 16-Bit Sayıyı Takas Etme)
; Başlangıç: BX = 0200H, SI = 0010H
; [0200H] ([BX])      = 1234H
; [0210H] ([BX + SI]) = 5678H
ORG 100H

; 1. [BX] ve [BX + SI] adreslerindeki 16-bit sayıları yazmaçlara okuyun
; 2. Değerleri takas ederek [BX] adresine 5678H, [BX + SI] adresine 1234H yazın
; TODO:


HLT
`,
    hints: [
      '8086\'da bellekten belleğe doğrudan MOV veya XCHG yapılamaz (Örn: MOV [0200H], [0210H] geçersizdir). Önce değerleri AX, CX veya DX gibi yazmaçlara okumalısınız.',
      'İkinci sayının adresini doğrudan [BX + SI] ile okuyabileceğiniz gibi, LEA DI, [BX + SI] komutuyla DI yazmacına yükleyip [DI] üzerinden de erişebilirsiniz.',
      'Adım Adım Çözüm Örneği:\n1. MOV AX, [BX]        ; AX = 1234h\n2. MOV CX, [BX + SI]   ; CX = 5678h\n3. XCHG AX, CX         ; AX = 5678h, CX = 1234h\n4. MOV [BX], AX        ; [0200h] = 5678h\n5. MOV [BX + SI], CX   ; [0210h] = 1234h\n6. HLT'
    ],
    solutionCode: `ORG 100H
LEA DI, [BX + SI]
MOV AX, [BX]
MOV CX, [DI]
XCHG AX, CX
MOV [BX], AX
MOV [DI], CX
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
        { segment: 0x0000, offset: 0x0200, expectedBytes: [0x78, 0x56], label: 'Bellek [0200H] (Yeni Değer: 5678h)' },
        { segment: 0x0000, offset: 0x0210, expectedBytes: [0x34, 0x12], label: 'Bellek [0210H] (Yeni Değer: 1234h)' }
      ],
      maxSteps: 20
    }
  },

  'ch-capstone-stage3': {
    id: 'ch-capstone-stage3',
    title: 'Aşama 1-3 Kapsayıcı: Toplam Puan Hesaplama ve Bölüm/Kalan Analizi',
    milestoneId: 'milestone-3',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-3 Kapsayıcı Sentez',
    opcodes: ['MOV', 'ADD', 'DIV'],
    scenario: `Bir öğrencinin ana sınav puanı ve ek ödev puanı bellekte 16-bit (2 baytlık word) olarak saklanmaktadır:
• [0300h] adresinde Ana Puan = 250 (00FAh -> bellekte [FAh, 00h])
• [0302h] adresinde Ek Puan  = 50  (0032h -> bellekte [32h, 00h])
Başlangıçta BX = 0300h olarak hazır verilmiştir. Bu iki puanı toplayıp (250 + 50 = 300), toplam puanı 8 değerlendirme dilimine bölmeniz (300 ÷ 8 = Bölüm: 37, Kalan: 4) istenmektedir.`,
    task: `1. [0300h] ([BX]) adresindeki 16-bit ana puan (250) ile [0302h] ([BX + 2]) adresindeki 16-bit ek puanı (50) AX yazmacında toplayın (Toplam = 300 / 012Ch).
2. Toplam değeri (300), 16-bit bölme işlemi (DIV) kullanarak 8 sayısına bölün. (Not: 16-bit DIV komutu DX:AX çiftini böldüğü için bölmeden önce DX = 0 yapmayı unutmayın!)
3. Bölme sonucunda AX'te oluşan Bölüm değerini (37 / 0025h) 16-bit word olarak [0304h] adresine, DX'te oluşan Kalan değerini (4 / 0004h) ise 16-bit word olarak [0306h] adresine kaydedin.`,
    starterCode: `; Görev: Aşama 1-3 Kapsayıcı Sentez (Toplama ve 16-Bit Bölme/Kalan)
; Başlangıç: BX = 0300H
; [0300H] = 250 (Ana Puan), [0302H] = 50 (Ek Puan)
; Beklenen: [0304H] = 37 (Bölüm), [0306H] = 4 (Kalan)
ORG 100H

; 1. [0300H] ve [0302H] adreslerindeki 16-bit sayıları AX'te toplayın (250 + 50 = 300)
; 2. DX = 0 yapıp toplamı 16-bitlik bir yazmaçla 8'e bölün (DIV)
; 3. Bölümü (AX) [0304H] adresine, Kalanı (DX) [0306H] adresine yazın
; TODO:


HLT
`,
    hints: [
      'Taban adres BX = 0300h olarak verildiği için [BX] ile [0300h] adresine, [BX + 2] ile [0302h] adresine erişebilirsiniz.',
      '16-bit bölme (Örn: MOV CX, 8 ardından DIV CX) işlemi DX:AX 32-bit çiftini CX\'e böler; Bölüm AX yazmacına, Kalan ise DX yazmacına yazılır.',
      'Adım Adım Çözüm Örneği:\n1. MOV AX, [BX]        ; AX = 250\n2. ADD AX, [BX + 2]    ; AX = 250 + 50 = 300\n3. MOV DX, 0           ; 16-bit bölme öncesi DX sıfırlanır\n4. MOV CX, 8           ; Bölen = 8\n5. DIV CX              ; AX = 37 (Bölüm), DX = 4 (Kalan)\n6. MOV [BX + 4], AX    ; [0304h] = 37\n7. MOV [BX + 6], DX    ; [0306h] = 4\n8. HLT'
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
        { segment: 0x0000, offset: 0x0304, expectedBytes: [37, 0], label: 'Bölüm [0304H] (37)' },
        { segment: 0x0000, offset: 0x0306, expectedBytes: [4, 0], label: 'Kalan [0306H] (4)' }
      ],
      maxSteps: 25
    }
  },

  'ch-capstone-stage4': {
    id: 'ch-capstone-stage4',
    title: 'Aşama 1-4 Kapsayıcı: Sıkıştırılmış Bayt (Nibble) Çözümleme ve Tutar Hesaplama',
    milestoneId: 'milestone-4',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-4 Kapsayıcı Sentez',
    opcodes: ['MOV', 'AND', 'SHR', 'MUL'],
    scenario: `Bellek tasarrufu sağlamak amacıyla bir ürünün Birim Fiyatı ve Sipariş Adedi tek bir baytın (8-bit) içine iki adet 4-bitlik parça (Nibble) halinde sıkıştırılarak [0400h] adresine kaydedilmiştir:
• [0400h] adresindeki bayt: C5h (İkili tabanda: 1100 0101b)
  - Üst 4 Bit (Bit 4..7): Birim Fiyat = 1100b = 12 (0Ch)
  - Alt 4 Bit (Bit 0..3): Sipariş Adedi = 0101b = 5 (05h)
Bu iki 4-bitlik değeri bit kaydırma (SHR) ve bit maskeleme (AND) komutlarıyla birbirinden ayırıp toplam tutarı (12 × 5 = 60) hesaplamanız istenmektedir.`,
    task: `1. [0400h] adresindeki sıkıştırılmış baytı (C5h) okuyun.
2. Alt 4 bitteki Sipariş Adedini (5) elde etmek için 0Fh (0000 1111b) maskesiyle AND işlemi uygulayın.
3. Üst 4 bitteki Birim Fiyatı (12) elde etmek için baytı 4 bit sağa kaydırın (SHR).
4. Ayıkladığınız Birim Fiyat (12) ile Sipariş Adedini (5) MUL komutuyla çarpın (12 × 5 = 60 / 003Ch) ve 16-bitlik sonucu [0402h] adresine kaydedin.`,
    starterCode: `; Görev: Aşama 1-4 Kapsayıcı Sentez (Sıkıştırılmış Bayt Çözümleme)
; [0400H] = 0C5H (Üst 4 bit: 0CH = 12 Fiyat, Alt 4 bit: 05H = 5 Adet)
; Beklenen: [0402H] = 12 * 5 = 60 (003CH)
ORG 100H

; 1. [0400H] adresindeki baytı AL ve BL yazmaçlarına okuyun
; 2. BL'nin alt 4 bitini maskeleyin (AND BL, 0FH -> BL = 5)
; 3. AL'yi 4 bit sağa kaydırın (CL = 4, SHR AL, CL -> AL = 12)
; 4. MUL BL ile çarpıp AX'teki 16-bit sonucu [0402H] adresine yazın
; TODO:


HLT
`,
    hints: [
      'Bir baytın sadece alt 4 bitini (Bit 0..3) bırakıp üst 4 bitini sıfırlamak için AND reg, 0FH kullanılır (0C5h AND 0Fh = 05h).',
      'Bir baytın üst 4 bitini (Bit 4..7) sağa çekerek 0..15 arası bir sayıya dönüştürmek için 4 bit sağa kaydırılır: MOV CL, 4 ardından SHR AL, CL (0C5h >> 4 = 0Ch = 12).',
      'MUL BL komutu AL ile BL\'yi çarpar (12 × 5 = 60) ve 16-bit sonucu AX yazmacına yazar.',
      'Adım Adım Çözüm Örneği:\n1. MOV AL, [0400H]     ; AL = C5h\n2. MOV BL, AL          ; BL = C5h\n3. AND BL, 0FH         ; BL = 05h (Adet = 5)\n4. MOV CL, 4\n5. SHR AL, CL          ; AL = 0Ch (Fiyat = 12)\n6. MUL BL              ; AX = 12 * 5 = 60 (003Ch)\n7. MOV [0402H], AX     ; [0402h] = 60\n8. HLT'
    ],
    solutionCode: `ORG 100H
MOV AL, [0400H]
MOV BL, AL
AND BL, 0FH
MOV CL, 4
SHR AL, CL
MUL BL
MOV [0402H], AX
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0400, bytes: [0xC5] } // High nibble: 12 (0xC), Low nibble: 5 (0x5)
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0402, expectedBytes: [60, 0], label: 'Toplam Tutar [0402H] (60)' }
      ],
      maxSteps: 25
    }
  },

  'ch-capstone-stage5': {
    id: 'ch-capstone-stage5',
    title: 'Aşama 1-5 Kapsayıcı: Dizideki Eşik Değerini Aşan Sayıların Toplamı ve Adedi',
    milestoneId: 'milestone-5',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-5 Kapsayıcı Sentez',
    opcodes: ['MOV', 'CMP', 'JLE', 'LOOP', 'ADD', 'INC'],
    scenario: `Bellekte [0500h] adresinden başlayarak 4 adet 16-bitlik (2 baytlık word) tam sayıdan oluşan bir dizi bulunmaktadır:
• [0500h] = 5   (0005h)
• [0502h] = 20  (0014h)  --> 10'dan büyük!
• [0504h] = 8   (0008h)
• [0506h] = 15  (000Fh)  --> 10'dan büyük!
Bu diziyi döngü ile tarayarak sadece eşik değeri olan 10'dan büyük (> 10) sayıları seçmeniz, bu sayıların toplamını (20 + 15 = 35) ve kaç adet olduklarını (2 adet) belleğe kaydetmeniz istenmektedir.`,
    task: `1. [0500h] adresinden başlayan 4 elemanlı 16-bit (word) diziyi LOOP komutuyla tarayın (her eleman 2 bayt olduğu için dizi indisini her adımda 2 artırın).
2. Her elemanı 10 sayısıyla karşılaştırın (CMP):
   • Eğer sayı 10 veya daha küçükse (<= 10) JLE (Jump if Less or Equal) veya JBE ile toplama işlemini atlayıp sonraki elemana geçin.
   • Eğer sayı 10'dan büyükse (> 10) ADD ile toplam yazmacına ekleyin ve INC ile adet sayacını 1 artırın.
3. Döngü bittiğinde:
   • 10'dan büyük sayıların Toplamını (35 / 0023h) 16-bit word olarak [0510h] adresine yazın.
   • 10'dan büyük sayıların Adedini (2 / 0002h) 16-bit word olarak [0512h] adresine yazın.`,
    starterCode: `; Görev: Aşama 1-5 Kapsayıcı Sentez (Koşullu Dizi Filtreleme)
; Dizi ([0500H]..[0506H]): 5, 20, 8, 15 (4 adet 16-bit word)
; Filtre Şartı: Sayı > 10
; Beklenen: [0510H] = 35 (20 + 15), [0512H] = 2 (Adet)
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      '4 elemanlı dizi için CX = 4 ayarlayıp LOOP komutunu kullanabilirsiniz.',
      'Her eleman 16-bit (2 bayt) olduğu için SI indisini her turda ADD SI, 2 ile ilerletin.',
      'Aşama 5 Modül 4\'te öğrendiğiniz JLE (Jump if Less or Equal) veya JBE komutu ile CMP sonrası 10 ve altındaki sayıları atlayabilirsiniz: CMP BX, 10 ardından JLE ATLA.',
      'Adet sayısını artırmak için Aşama 3\'te öğrendiğiniz INC komutunu (INC DX) kullanabilirsiniz.',
      'Adım Adım Çözüm Örneği:\n1. MOV SI, 0 / MOV AX, 0 (Toplam) / MOV DX, 0 (Adet) / MOV CX, 4\n2. DONGU: MOV BX, [0500H + SI]\n3. CMP BX, 10 -> JLE ATLA\n4. ADD AX, BX -> INC DX\n5. ATLA: ADD SI, 2 -> LOOP DONGU\n6. MOV [0510H], AX ve MOV [0512H], DX\n7. HLT'
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
        { segment: 0x0000, offset: 0x0510, expectedBytes: [35, 0], label: 'Filtrelenen Toplam [0510H] (35)' },
        { segment: 0x0000, offset: 0x0512, expectedBytes: [2, 0], label: 'Filtrelenen Adet [0512H] (2)' }
      ],
      maxSteps: 50
    }
  },

  'ch-capstone-stage6': {
    id: 'ch-capstone-stage6',
    title: 'Aşama 1-6 Kapsayıcı: Alt Program (CALL/RET) ve Yığın Koruması ile Kareler Toplamı (a² + b²)',
    milestoneId: 'milestone-6',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-6 Kapsayıcı Sentez',
    opcodes: ['PUSH', 'POP', 'CALL', 'RET', 'MUL', 'ADD'],
    scenario: `Bir dik üçgen hesaplamasında kullanılan a² + b² (kareler toplamı) işlemini yerine getiren HESAPLA isimli bir alt program (prosedür) yazmanız istenmektedir:
• Başlangıçta AX = 3 (a kenarı), BX = 4 (b kenarı) ve CX = 0099h (ana programa ait korunması gereken veri) olarak verilmiştir.
• HESAPLA alt programı AX² + BX² = 3² + 4² = 9 + 16 = 25 (0019h) değerini hesaplamalı, içeride CX yazmacını geçici olarak kullanırsa yığında (PUSH CX / POP CX) koruyarak CX = 0099h değerinin bozulmamasını sağlamalıdır.`,
    task: `1. Ana programda CALL HESAPLA komutu ile alt programı çağırın.
2. HESAPLA alt programı içinde:
   • Eğer CX (veya diğer yazmaçları) geçici olarak kullanacaksanız PUSH ile yığına kaydedip RET öncesinde POP ile geri yükleyin (CX = 0099h kalmalıdır).
   • AX (3) ve BX (4) değerlerinin karelerini alıp toplayarak (3² + 4² = 25) sonucu AX yazmacında ana programa döndürün (RET).
3. Alt programdan döndükten sonra AX içindeki sonucu (25 / 0019h) 16-bit word olarak [0600h] bellek adresine yazın ve HLT ile durun.`,
    starterCode: `; Görev: Aşama 1-6 Kapsayıcı Sentez (Prosedür ve Yığın Koruması)
; Başlangıç: AX = 3, BX = 4, CX = 0099H (CX değeri bozulmamalıdır!)
; Beklenen: [0600H] = 25 (3^2 + 4^2 = 9 + 16), CX = 0099H
ORG 100H

; Ana Program: HESAPLA alt programını çağırın ve dönen AX sonucunu [0600H] adresine yazın
; TODO:


HLT

HESAPLA:
; Alt Program Gövdesi:
; CX'i yığında koruyarak AX^2 + BX^2 hesaplayın ve sonucu AX'te bırakıp RET ile dönün
; TODO:


RET
`,
    hints: [
      'Alt program içinde CX yazmacını ara toplam için kullanmadan önce PUSH CX yapıp, RET komutundan hemen önce POP CX yaparsanız ana programın CX = 0099h değeri korunmuş olur.',
      'AL = 3 iken MUL AL komutu AX = 3 * 3 = 9 yapar. Benzer şekilde AL = 4 iken MUL AL komutu AX = 4 * 4 = 16 yapar.',
      'Adım Adım Çözüm Örneği:\nAna Program:\n  CALL HESAPLA\n  MOV [0600H], AX\n  HLT\nHESAPLA:\n  PUSH CX          ; Ana programın CX değerini koru\n  MUL AL           ; AX = 3 * 3 = 9\n  MOV CX, AX       ; CX = 9 (ara toplam)\n  MOV AX, BX       ; AX = 4\n  MUL AL           ; AX = 4 * 4 = 16\n  ADD AX, CX       ; AX = 16 + 9 = 25\n  POP CX           ; CX = 0099h geri yükle\n  RET'
    ],
    solutionCode: `ORG 100H
CALL HESAPLA
MOV [0600H], AX
HLT

HESAPLA:
PUSH CX
MUL AL
MOV CX, AX
MOV AX, BX
MUL AL
ADD AX, CX
POP CX
RET`,
    testSetup: {
      initialRegisters: {
        ax: 3,
        bx: 4,
        cx: 0x0099
      }
    },
    assertions: {
      expectedRegisters: {
        cx: 0x0099
      },
      expectedMemory: [
        { segment: 0x0000, offset: 0x0600, expectedBytes: [25, 0], label: 'Kareler Toplamı [0600H] (25)' }
      ],
      maxSteps: 35
    }
  },

  'ch-capstone-stage7': {
    id: 'ch-capstone-stage7',
    title: 'Aşama 1-7 Kapsayıcı: String Komutları (LODSB / STOSB) ile Büyük Harfi Küçük Harfe Dönüştürme',
    milestoneId: 'milestone-7',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-7 Kapsayıcı Sentez',
    opcodes: ['CLD', 'LODSB', 'STOSB', 'XOR', 'LOOP'],
    scenario: `Bellekte [0700h] adresinde 5 karakterlik büyük harfli "METIN" kelimesi (ASCII baytları: 4Dh, 45h, 54h, 49h, 4Eh) bulunmaktadır.
ASCII tablosunda büyük harfler ile küçük harfler arasında yalnızca 5. bit (20h = 32) farkı vardır (Örn: 'M' = 4Dh, 'm' = 6Dh).
Donanımsal string okuma (LODSB) ve yazma (STOSB) komutlarını kullanarak [0700h] adresindeki "METIN" kelimesini karakter karakter okuyup, her karakteri 20h ile XOR'layarak küçük harfli "metin" (6Dh, 65h, 74h, 69h, 6Eh) haline getirmeniz ve [0710h] adresine yazmanız istenmektedir.`,
    task: `1. String komutlarının adresleri ileri yönde (+1) artırması için CLD komutunu çalıştırın.
2. Kaynak indeks yazmacına SI = 0700h, hedef indeks yazmacına DI = 0710h ve döngü sayacına CX = 5 yükleyin.
3. 5 adımlık bir döngü (LOOP) içinde:
   • LODSB komutu ile [SI] adresindeki ASCII karakteri AL'ye okuyun (SI otomatik 1 artar).
   • XOR AL, 20h (veya OR AL, 20h) komutu ile karakteri küçük harfe dönüştürün.
   • STOSB komutu ile dönüştürülen karakteri [DI] hedef adresine yazın (DI otomatik 1 artar).
4. İşlem sonunda [0710h..0714h] adreslerinde "metin" (6Dh, 65h, 74h, 69h, 6Eh) yer almalıdır.`,
    starterCode: `; Görev: Aşama 1-7 Kapsayıcı Sentez (LODSB / STOSB ile "METIN" -> "metin")
; Kaynak [0700H]: "METIN" (4DH, 45H, 54H, 49H, 4EH)
; Hedef  [0710H]: "metin" (6DH, 65H, 74H, 69H, 6EH)
ORG 100H

; 1. CLD ile yön bayrağını temizleyin, SI=0700H, DI=0710H, CX=5 ayarlayın
; 2. Döngü içinde: LODSB -> XOR AL, 20H -> STOSB -> LOOP
; TODO:


HLT
`,
    hints: [
      'CLD komutu Direction Flag (DF) bayrağını 0 yapar; böylece her LODSB ve STOSB sonrasında SI ve DI otomatik olarak 1 artar (INC SI / INC DI yazmanıza gerek kalmaz!).',
      'LODSB komutu (Aşama 7 Modül 4\'te öğrendiğiniz) AL = [DS:SI] yaparak baytı okur ve SI\'yi 1 artırır; STOSB komutu (Aşama 7 Modül 3\'te öğrendiğiniz) [ES:DI] = AL yaparak baytı yazar ve DI\'yi 1 artırır.',
      'Aşama 4\'te öğrendiğiniz XOR komutu (XOR AL, 20h) 5. biti tersleyerek büyük harfi küçük harfe dönüştürür (örn: 4Dh ^ 20h = 6Dh).',
      'Adım Adım Çözüm Örneği:\n1. CLD\n2. MOV SI, 0700H\n3. MOV DI, 0710H\n4. MOV CX, 5\n5. DONUSTUR:\n     LODSB\n     XOR AL, 20H\n     STOSB\n     LOOP DONUSTUR\n6. HLT'
    ],
    solutionCode: `ORG 100H
CLD
MOV SI, 0700H
MOV DI, 0710H
MOV CX, 5

DONUSTUR:
LODSB
XOR AL, 20H
STOSB
LOOP DONUSTUR

HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0700, bytes: [0x4D, 0x45, 0x54, 0x49, 0x4E] } // "METIN"
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0710, expectedBytes: [0x6D, 0x65, 0x74, 0x69, 0x6E], label: 'Hedef Metin [0710H] ("metin")' }
      ],
      maxSteps: 40
    }
  },

  'ch-capstone-stage8': {
    id: 'ch-capstone-stage8',
    title: 'Aşama 1-8 Kapsayıcı: Yazar Kasa Sepetindeki 3 BCD Fiyatı Toplama (DAA)',
    milestoneId: 'milestone-8',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-8 Kapsayıcı Sentez',
    opcodes: ['MOV', 'ADD', 'DAA', 'LOOP', 'INC'],
    scenario: `Bir market yazar kasasında sepetteki 3 ürünün fiyatları Paketlenmiş BCD (Binary Coded Decimal) formatında bellekte [0800h], [0801h] ve [0802h] adreslerinde tutulmaktadır:
• 1. Ürün ([0800h]): 25 TL  (BCD olarak: 25h)
• 2. Ürün ([0801h]): 38 TL  (BCD olarak: 38h)
• 3. Ürün ([0802h]): 19 TL  (BCD olarak: 19h)
Normal onaltılık (ikili) toplamada 25h + 38h + 19h = 76h çıkar (yanlış!). Ancak her ADD işleminden hemen sonra DAA (Decimal Adjust after Addition) komutu kullanıldığında:
• 25h + 38h = 5Dh --(DAA)--> 63h (63 TL)
• 63h + 19h = 7Ch --(DAA)--> 82h (82 TL)
elde edilir. Sepet toplamını BCD formatında (82h) hesaplayıp [0810h] adresine yazmanız istenmektedir.`,
    task: `1. Toplamı tutacak olan AL yazmacını sıfırlayın (MOV AL, 0), dizi indisi için SI = 0800h ve ürün sayısı için CX = 3 ayarlayın.
2. 3 adımlık bir döngü (LOOP) içinde:
   • [SI] adresindeki BCD ürün fiyatını AL ile toplayın (ADD AL, [SI]).
   • Toplamadan hemen sonra DAA komutunu çalıştırarak sonucu geçerli BCD (onluk) formatına düzeltin.
   • SI adresini bir sonraki ürüne ilerletin (INC SI).
3. Döngü sonunda AL yazmacında oluşan 82h (82 TL) BCD toplamını [0810h] bellek adresine kaydedin.`,
    starterCode: `; Görev: Aşama 1-8 Kapsayıcı Sentez (3 Ürünlük BCD Sepet Toplamı)
; Ürün Fiyatları: [0800H] = 25H (25 TL), [0801H] = 38H (38 TL), [0802H] = 19H (19 TL)
; Beklenen BCD Toplam: [0810H] = 82H (25 + 38 + 19 = 82 TL)
ORG 100H

; 1. AL = 0, SI = 0800H, CX = 3 ayarlayın
; 2. Döngüde her ürünü AL'ye ekleyip (ADD) hemen ardından DAA çalıştırın
; 3. Sonucu [0810H] adresine kaydedin
; TODO:


HLT
`,
    hints: [
      'DAA komutu yalnızca AL yazmacı üzerinde çalışır ve kendisinden hemen önce yapılan ADD/ADC işleminin sonucunu onluk (BCD) tabana göre düzeltir.',
      'Döngünün her adımında ADD AL, [SI] yaptıktan hemen sonra DAA komutunu çağırmalısınız (tüm sayıları toplayıp en sonda tek bir DAA yapmak yanlış sonuç verir).',
      'Adım Adım Çözüm Örneği:\n1. MOV AL, 0\n2. MOV SI, 0800H\n3. MOV CX, 3\n4. SEPET_TOPLA:\n     ADD AL, [SI]\n     DAA\n     INC SI\n     LOOP SEPET_TOPLA\n5. MOV [0810H], AL\n6. HLT'
    ],
    solutionCode: `ORG 100H
MOV AL, 0
MOV SI, 0800H
MOV CX, 3

SEPET_TOPLA:
ADD AL, [SI]
DAA
INC SI
LOOP SEPET_TOPLA

MOV [0810H], AL
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x0800, bytes: [0x25, 0x38, 0x19] } // 25 TL + 38 TL + 19 TL = 82 TL (0x82)
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x0810, expectedBytes: [0x82], label: 'BCD Sepet Toplamı [0810H] (82h = 82 TL)' }
      ],
      maxSteps: 35
    }
  },

  'ch-capstone-stage9': {
    id: 'ch-capstone-stage9',
    title: 'Aşama 1-9 Kapsayıcı: Donanım Portundan Sensör Okuma ve INT 21h ile Ekrana Yazdırma',
    milestoneId: 'milestone-9',
    difficulty: 'Orta',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-9 Kapsayıcı Sentez',
    opcodes: ['IN', 'OUT', 'AND', 'ADD', 'INT'],
    scenario: `Harici bir sensör, 20h numaralı giriş portuna (Input Port) 85h (1000 0101b) durum baytını göndermiştir:
• Bit 7 (1): Sensör aktif bayrağı (kontrol biti)
• Alt 4 Bit (Bit 0..3 = 0101b = 5): Sensör kademe değeri (0..9 arası rakam)
Bellekte [0900h] adresinde ise ekrana yazdırılacak olan "DURUM: ?$" metin şablonu hazır bulunmaktadır:
• [0900h..0906h] = "DURUM: " (7 karakter)
• [0907h]        = '?' (3Fh -> Buraya sensörün ASCII rakam karşılığı olan '5' = 35h yazılacaktır!)
• [0908h]        = '$' (24h -> INT 21h metin sonlandırıcı karakter)
Port 20h'tan veriyi okuyup alt 4 bitini ayıklamanız, temiz değeri (05h) 21h numaralı çıkış portuna (Output Port) göndermeniz ve ASCII rakama ('5' = 35h) çevirip [0907h] adresine yazarak INT 21h ile konsola "DURUM: 5" yazdırmanız istenmektedir.`,
    task: `1. IN AL, 20h komutu ile 20h numaralı giriş portundaki ham sensör verisini (85h) AL yazmacına okuyun.
2. AND AL, 0Fh komutu ile üst bitleri sıfırlayarak yalnızca alt 4 bitteki kademe sayısını (05h) bırakın.
3. Bu ayıklanmış sayısal değeri (05h) OUT 21h, AL komutu ile 21h numaralı çıkış portuna gönderin.
4. ADD AL, 30h komutu ile 05h sayısını ASCII '5' (35h) karakterine dönüştürün ve [0907h] adresindeki '?' karakterinin üzerine yazın (MOV [0907h], AL).
5. DX = 0900h (metin başlangıç adresi) ve AH = 09h ayarlayıp INT 21h kesmesini çağırarak konsola "DURUM: 5" metnini yazdırın.`,
    starterCode: `; Görev: Aşama 1-9 Kapsayıcı Sentez (Port G/Ç ve INT 21h Konsol Raporlama)
; Başlangıç: Port [20H] = 85H (Alt 4 bit = 5)
; Bellek [0900H..0908H] = "DURUM: ?$" ('?' karakteri [0907H] adresindedir)
ORG 100H

; 1. Port 20H'tan AL'ye okuyun (IN AL, 20H)
; 2. Alt 4 biti maskeleyin (AND AL, 0FH -> AL = 05H)
; 3. Temiz değeri Port 21H'a gönderin (OUT 21H, AL)
; 4. ASCII rakama çevirin (ADD AL, 30H -> '5') ve [0907H] adresine yazın
; 5. DX = 0900H, AH = 09H ile INT 21H çağırarak konsola yazdırın
; TODO:


HLT
`,
    hints: [
      'Giriş portundan okumak için IN AL, 20H; çıkış portuna yazmak için OUT 21H, AL kullanılır.',
      '0..9 arasındaki bir sayıyı ASCII rakam karakterine (\'0\'..\'9\') dönüştürmek için 30h (\'0\' karakterinin ASCII kodu) eklenir: 05h + 30h = 35h (\'5\').',
      'INT 21h (AH = 09h) fonksiyonu, DS:DX adresinden başlayarak \'$\' (24h) karakterini görene kadar tüm karakterleri konsola basar.',
      'Adım Adım Çözüm Örneği:\n1. IN AL, 20H\n2. AND AL, 0FH\n3. OUT 21H, AL\n4. ADD AL, 30H\n5. MOV [0907H], AL\n6. MOV DX, 0900H\n7. MOV AH, 09H\n8. INT 21H\n9. HLT'
    ],
    solutionCode: `ORG 100H
IN AL, 20H
AND AL, 0FH
OUT 21H, AL
ADD AL, 30H
MOV [0907H], AL
MOV DX, 0900H
MOV AH, 09H
INT 21H
HLT`,
    testSetup: {
      initialPorts: {
        0x20: 0x85
      },
      initialMemory: [
        { segment: 0x0000, offset: 0x0900, bytes: [0x44, 0x55, 0x52, 0x55, 0x4D, 0x3A, 0x20, 0x3F, 0x24] } // "DURUM: ?$"
      ]
    },
    assertions: {
      expectedPorts: {
        0x21: 0x05
      },
      expectedMemory: [
        { segment: 0x0000, offset: 0x0907, expectedBytes: [0x35], label: 'Mesaj İçi ASCII Rakam [0907H] (\'5\' = 35h)' }
      ],
      expectedConsole: {
        contains: 'DURUM: 5'
      },
      maxSteps: 25
    }
  },

  'ch-capstone-stage10': {
    id: 'ch-capstone-stage10',
    title: 'Aşama 1-10 Kapsayıcı: Dizideki En Küçük (Min), En Büyük (Max) ve Açıklık (Max - Min) Hesabı',
    milestoneId: 'milestone-10',
    difficulty: 'Zor',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-10 Kapsayıcı Sentez',
    opcodes: ['MOV', 'CMP', 'JAE', 'JBE', 'ADD', 'SUB', 'LOOP'],
    scenario: `Bellekte [1000h] adresinden başlayarak 6 elemanlı bir 16-bit (2 baytlık word) tam sayı dizisi bulunmaktadır:
• Dizi Elemanları: [15, 42, 8, 60, 23, 12]
  ([1000h]=15, [1002h]=42, [1004h]=8, [1006h]=60, [1008h]=23, [100Ah]=12)
Veri analizi algoritması kapsamında bu diziyi tarayarak:
• Dizideki En Küçük Sayıyı (Min = 8)
• Dizideki En Büyük Sayıyı (Max = 60)
• En büyük ile en küçük sayı arasındaki farkı / açıklığı (Range = Max - Min = 60 - 8 = 52)
bulup bellekteki hedef adreslere kaydetmeniz istenmektedir.`,
    task: `1. [1000h] adresinden başlayan 6 elemanlı 16-bit (word) diziyi döngü ile tarayın. (İpucu: İlk eleman olan [1000h] = 15 değerini başlangıçta hem Min hem de Max kabul edip kalan 5 elemanı döngüyle karşılaştırabilirsiniz.)
2. Tarama sonucunda bulduğunuz:
   • En Küçük (Min) değeri (8 / 0008h) 16-bit word olarak [1020h] adresine yazın.
   • En Büyük (Max) değeri (60 / 003Ch) 16-bit word olarak [1022h] adresine yazın.
   • Açıklık (Max - Min) değerini (60 - 8 = 52 / 0034h) 16-bit word olarak [1024h] adresine yazın.`,
    starterCode: `; Görev: Aşama 1-10 Kapsayıcı Sentez (Min, Max ve Max-Min Açıklık Algoritması)
; Dizi ([1000H]..[100AH]): 15, 42, 8, 60, 23, 12 (6 adet 16-bit word)
; Beklenen:
;   [1020H] = 8  (Min)
;   [1022H] = 60 (Max)
;   [1024H] = 52 (Max - Min = 60 - 8)
ORG 100H

; Kodunuzu buraya yazın:
; TODO:


HLT
`,
    hints: [
      'Dizinin ilk elemanını ([1000h] = 15) başlangıçta hem Min (AX) hem de Max (DX) yazmacına yükleyebilirsiniz. Böylece kalan 5 eleman için CX = 5 ve SI = 2 ile döngüyü başlatabilirsiniz.',
      'Aşama 5 Modül 3\'te öğrendiğiniz JAE (Jump if Above or Equal) ve JBE (Jump if Below or Equal) komutlarını kullanabilirsiniz: Okunan elemanı (BX) önce AX (Min) ile karşılaştırın; eğer BX < AX ise AX = BX yapın (JAE ile atlayın). Ardından DX (Max) ile karşılaştırın; eğer BX > DX ise DX = BX yapın (JBE ile atlayın).',
      'Adım Adım Çözüm Örneği:\n1. MOV AX, [1000H] (Min) / MOV DX, AX (Max)\n2. MOV SI, 2 / MOV CX, 5\n3. DONGU:\n     MOV BX, [1000H + SI]\n     CMP BX, AX -> JAE KONTROL_MAX -> MOV AX, BX\n   KONTROL_MAX:\n     CMP BX, DX -> JBE SONRAKI -> MOV DX, BX\n   SONRAKI:\n     ADD SI, 2 -> LOOP DONGU\n4. MOV [1020H], AX (Min) ve MOV [1022H], DX (Max)\n5. SUB DX, AX -> MOV [1024H], DX (Max - Min)\n6. HLT'
    ],
    solutionCode: `ORG 100H
MOV AX, [1000H]
MOV DX, AX
MOV SI, 2
MOV CX, 5

DONGU:
MOV BX, [1000H + SI]
CMP BX, AX
JAE KONTROL_MAX
MOV AX, BX

KONTROL_MAX:
CMP BX, DX
JBE SONRAKI
MOV DX, BX

SONRAKI:
ADD SI, 2
LOOP DONGU

MOV [1020H], AX
MOV [1022H], DX
SUB DX, AX
MOV [1024H], DX
HLT`,
    testSetup: {
      initialMemory: [
        { segment: 0x0000, offset: 0x1000, bytes: [15, 0, 42, 0, 8, 0, 60, 0, 23, 0, 12, 0] } // 15, 42, 8, 60, 23, 12
      ]
    },
    assertions: {
      expectedMemory: [
        { segment: 0x0000, offset: 0x1020, expectedBytes: [8, 0], label: 'En Küçük (Min) [1020H] (8)' },
        { segment: 0x0000, offset: 0x1022, expectedBytes: [60, 0], label: 'En Büyük (Max) [1022H] (60)' },
        { segment: 0x0000, offset: 0x1024, expectedBytes: [52, 0], label: 'Açıklık (Max - Min) [1024H] (52)' }
      ],
      maxSteps: 60
    }
  },

  'ch-capstone-stage11': {
    id: 'ch-capstone-stage11',
    title: 'Aşama 1-11 Büyük Usta Sentezi (Grand Capstone): Güvenli XLAT Tablo Çevirici ve Durum Bayrağı',
    milestoneId: 'milestone-11',
    difficulty: 'Zor',
    isCapstone: true,
    cumulativeStages: 'Aşama 1-11 Tüm Müfredat Grand Capstone',
    opcodes: ['CLC', 'JCXZ', 'XLAT', 'INC', 'LOOP', 'STC', 'MOV'],
    scenario: `Bir donanım sürücüsü, [1100h] adresindeki ham indeks dizisini [1150h] adresindeki donanımsal arama tablosunu (Lookup Table / XLAT) kullanarak dönüştürmekte ve sonuçları [1120h] adresine yazmaktadır:
• Kaynak İndeks Dizisi ([1100h..1102h], 3 bayt): [2, 0, 1]
• XLAT Dönüşüm Tablosu ([1150h..1152h], 3 bayt):
  - Tablo[0] ([1150h]) = 0AAh
  - Tablo[1] ([1151h]) = 0BBh
  - Tablo[2] ([1152h]) = 0CCh
• Dolayısıyla [2, 0, 1] indeksleri XLAT ile çevrildiğinde hedef dizi [1120h..1122h] içinde sırasıyla [0CCh, 0AAh, 0BBh] oluşmalıdır.
• Ayrıca sürücü; başlangıçta Carry bayrağını sıfırlamalı (CLC), eğer eleman sayısı CX = 0 ise döngü taşmasını önlemek için JCXZ ile doğrudan çıkışa atlamalı, çevrim başarıyla tamamlandığında ise STC ile Carry bayrağını 1 (CF = 1) yapmalıdır.`,
    task: `1. Önce CLC ile Carry bayrağını temizleyin (CF = 0) ve JCXZ BITIR komutu ile CX = 0 olma durumuna karşı güvenlik kontrolü koyun (Başlangıçta CX = 3 verilmiştir).
2. XLAT komutunun kullanacağı tablo başlangıç adresini BX = 1150h olarak, dizi indisini ise SI = 0 olarak yükleyin.
3. CX (3) kez dönen bir döngü (LOOP) içinde:
   • [1100h + SI] adresindeki indeks baytını AL yazmacına okuyun.
   • XLAT komutunu çalıştırarak AL'deki indeksi tablodaki karşılığına (AL = [BX + AL]) dönüştürün.
   • Dönüştürülmüş AL baytını [1120h + SI] hedef adresine yazın ve SI'yi 1 artırın (INC SI).
4. Döngü bittikten sonra işlemin başarıyla tamamlandığını belirtmek için STC komutu ile Carry bayrağını 1 yapın (CF = 1) ve BITIR: HLT ile programı sonlandırın.`,
    starterCode: `; Görev: Aşama 1-11 Büyük Usta Sentezi (Grand Capstone)
; Kaynak İndeksler [1100H]: 2, 0, 1 (Uzunluk: CX = 3)
; XLAT Tablosu     [1150H]: 0AAH (indis 0), 0BBH (indis 1), 0CCH (indis 2)
; Beklenen Hedef   [1120H]: 0CCH, 0AAH, 0BBH ve CF = 1
ORG 100H

; 1. CLC ve JCXZ BITIR ile sıfır sayaç güvenliğini kurun
; 2. BX = 1150H (tablo adresi) ve SI = 0 ayarlayın
; 3. Döngüde [1100H + SI] baytını AL'ye okuyup XLAT ile çevirin ve [1120H + SI] adresine yazın
; 4. Döngü sonunda STC ile CF = 1 yapın
; TODO:


BITIR:
HLT
`,
    hints: [
      'JCXZ BITIR komutu, eğer CX == 0 ise döngüye hiç girmeden BITIR etiketine atlar; böylece LOOP komutunun CX\'i 1 azaltıp FFFFh (65535) kez dönmesi engellenir.',
      'XLAT komutu tek başına yazılır (operand almaz): BX tablo başlangıç adresini (1150h), AL ise tablodaki sıra numarasını (indisi) tutarken XLAT çalıştırıldığında AL = [BX + AL] olur.',
      'Adım Adım Çözüm Örneği:\n1. CLC\n2. JCXZ BITIR\n3. MOV BX, 1150H\n4. MOV SI, 0\n5. CEVIR:\n     MOV AL, [1100H + SI]\n     XLAT\n     MOV [1120H + SI], AL\n     INC SI\n     LOOP CEVIR\n6. STC\n7. BITIR: HLT'
    ],
    solutionCode: `ORG 100H
CLC
JCXZ BITIR
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
        { segment: 0x0000, offset: 0x1100, bytes: [2, 0, 1] }, // İndeksler: 2, 0, 1
        { segment: 0x0000, offset: 0x1150, bytes: [0xAA, 0xBB, 0xCC] } // Tablo: 0->AAh, 1->BBh, 2->CCh
      ]
    },
    assertions: {
      expectedFlags: {
        cf: 1
      },
      expectedMemory: [
        { segment: 0x0000, offset: 0x1120, expectedBytes: [0xCC, 0xAA, 0xBB], label: 'Dönüştürülmüş Hedef Dizi [1120H] (CCh, AAh, BBh)' }
      ],
      maxSteps: 40
    }
  }
};
