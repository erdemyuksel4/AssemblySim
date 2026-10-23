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
        ax: 15,
        cx: 0
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
      expectedRegisters: {
        cx: 0,
        si: 0x0204,
        di: 0x0304
      },
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
      expectedRegisters: {
        cx: 0,
        di: 0x0255
      },
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
        ax: 0x0000,
        cx: 0x0000
      },
      maxSteps: 15
    }
  }
};
