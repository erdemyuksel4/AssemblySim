export interface InstructionVariation {
  syntax: string;
  description: string;
  example: string;
  addressingMode?: string;
  note?: string;
}

export interface InstructionDetail {
  opcode: string;
  name: string;
  category: 'data' | 'arithmetic' | 'bcd' | 'logical' | 'control' | 'string' | 'flags' | 'directives';
  summary: string;
  flags: string;
  rules?: string;
  variations: InstructionVariation[];
}


export interface ProgramAddressingMode {
  name: string;
  reach: string;
  description: string;
  example: string;
  formula?: string;
  notes: string;
}

export interface StackAddressingGuide {
  title: string;
  discipline: string;
  formula: string;
  pushStep: string;
  popStep: string;
  swapExample: {
    code: string;
    explanation: string;
  };
  rule: string;
}

export interface CommonPitfallsGuide {
  title: string;
  rules: string[];
  selectionTable: Array<{
    need: string;
    reachFor: string;
  }>;
}

export interface AddressingModeInfo {
  modeName: string;
  category: string;
  summary: string;
  formula?: string;
  registersAllowed: string;
  defaultSegment: string;
  example: string;
  notes: string;
}

export interface ArchitectureGuide {
  title: string;
  busSystem: {
    addressBus: string;
    dataBus: string;
    controlBus: string;
  };
  memoryOrganization: {
    title: string;
    tpa: string;
    systemArea: string;
  };
  realModeFormula: {
    formula: string;
    explanation: string;
    example: string;
  };
  defaultPairs: Array<{
    purpose: string;
    segment: string;
    offset: string;
  }>;
  entryPointGuide: {
    title: string;
    meaning: string;
    defaultOrigin: string;
    org100h: string;
    resetVector: string;
  };

  nestedRegisters: {
    title: string;
    diagram: string;
    rule: string;
  };
}


export interface TerminologyItem {
  term: string;
  category: 'core' | 'memory' | 'architecture' | 'arithmetic' | 'strings' | 'modes';
  tag: string;
  definition: string;
  details: string;
  slideRef: string;
  example?: string;
}

export interface ArchitectureComparison {
  feature: string;
  cisc: string;
  risc: string;
}

export interface AddressingModeComparison {
  mode: string;
  syntax: string;
  effectiveAddress: string;
  advantages: string;
  disadvantages: string;
  typicalUse: string;
}

export interface LectureTerminology {
  title: string;
  fdeCycle: {
    title: string;
    description: string;
    steps: Array<{ step: string; name: string; desc: string }>;
  };
  ciscVsRisc: {
    title: string;
    description: string;
    table: ArchitectureComparison[];
  };
  addressingComparison: {
    title: string;
    description: string;
    table: AddressingModeComparison[];
  };
  terms: TerminologyItem[];
}

export interface FlagsGuide {
  title: string;
  statusFlags: Array<{
    flag: string;
    bit: number;
    desc: string;
  }>;
  controlFlags: Array<{
    flag: string;
    bit: number;
    desc: string;
  }>;
  goldenRules: string[];
}

export const CATEGORIES = [
  { id: 'all', label: 'Tümü' },
  { id: 'data', label: 'Veri Transferi' },
  { id: 'arithmetic', label: 'Aritmetik' },
  { id: 'bcd', label: 'BCD Aritmetiği' },
  { id: 'logical', label: 'Mantık & Kaydırma' },
  { id: 'control', label: 'Atlama & Döngü' },
  { id: 'string', label: 'Dizi (String)' },
  { id: 'flags', label: 'Bayrak & Kontrol' },
  { id: 'directives', label: 'Yönergeler' }
] as const;

export const INSTRUCTIONS: InstructionDetail[] = [
  // --- VERİ TRANSFERİ ---
  {
    opcode: 'MOV',
    name: 'Move (Veri Transferi)',
    category: 'data',
    summary: 'Kaynaktaki veriyi hedefe kopyalar. Kaynak değişmez, hedef yeni değeri alır.',
    flags: 'Hiçbir bayrağı etkilemez.',
    rules: '8086 kuralları: Bellekten belleğe doğrudan MOV yapılamaz. Segmente doğrudan sabit (immediate) sayı yüklenemez. CS segmentine hedef olarak MOV yapılamaz.',
    variations: [
      {
        syntax: 'MOV reg, reg',
        description: 'Bir yazmaçtaki değeri diğerine kopyalar (8-bit veya 16-bit).',
        example: 'MOV AX, 1234H\nMOV BX, AX       ; BX = 1234H olur',
        note: 'Her iki yazmaç aynı boyutta olmalıdır (AX ve BX 16-bit, AL ve BL 8-bit).'
      },
      {
        syntax: 'MOV reg, imm',
        description: 'Bir yazmaca doğrudan sabit sayısal değer yükler.',
        example: 'MOV AX, 0FFFFH   ; AX = FFFFh\nMOV CL, 10       ; CL = 10 (0Ah)',
        note: 'Sabit sayı hedef yazmacın boyutuna uygun olmalıdır.'
      },
      {
        syntax: 'MOV reg, [mem]',
        description: 'Belirtilen bellek adresindeki veriyi yazmaca okur.',
        example: 'MOV SI, 200H\nMOV AX, [SI]     ; DS:0200h adresindeki 16-bit kelimeyi AX\'e okur',
        note: 'Adresleme [BX], [BP], [SI], [DI] veya bunların toplamı ile yapılabilir.'
      },
      {
        syntax: 'MOV [mem], reg',
        description: 'Yazmaçtaki değeri belirtilen bellek adresine yazar.',
        example: 'MOV AL, 55H\nMOV [DI], AL     ; DS:DI adresine 55h yazar',
        note: 'Yazmacın boyutu bellek yazma genişliğini (8 veya 16 bit) otomatik belirler.'
      },
      {
        syntax: 'MOV [mem], imm',
        description: 'Doğrudan sabit bir değeri bellek hücresine yazar.',
        example: 'MOV BYTE PTR [BX], 0AAH  ; 1 bayt yazar\nMOV WORD PTR [BX], 1234H ; 2 bayt yazar',
        note: 'Boyut belirsizliğini önlemek için BYTE PTR veya WORD PTR zorunludur!'
      },
      {
        syntax: 'MOV seg, reg16',
        description: 'Bir segment yazmacına 16-bit genel yazmaçtan değer atar.',
        example: 'MOV AX, 0700H\nMOV DS, AX       ; DS = 0700h olarak ayarlanır',
        note: 'Segment yazmaçlarına doğrudan sabit yüklenemez (MOV DS, 1000h geçersizdir!).'
      },
      {
        syntax: 'MOV reg16, seg',
        description: 'Segment yazmacının mevcut değerini genel yazmaca kopyalar.',
        example: 'MOV AX, CS       ; AX = Kod segmenti adresi',
        note: 'CS, DS, SS, ES okunabilir.'
      }
    ]
  },
  {
    opcode: 'LEA',
    name: 'Load Effective Address (Efektif Adres Yükleme)',
    category: 'data',
    summary: 'Kaynak bellek operandının ofset adresini hesaplayarak 16-bit yazmaca yükler.',
    flags: 'Bayrakları etkilemez.',
    rules: 'Kaynak operand mutlaka bir bellek adresi veya etiket olmalıdır. Doğrudan sabit sayı kabul edilmez.',
    variations: [
      {
        syntax: 'LEA reg16, label',
        description: 'Bir veri etiketinin 16-bit ofset adresini göstericiye yükler.',
        example: 'LEA SI, DIZI     ; DIZI etiketinin ofsetini SI\'ya yükler\n...\nDIZI DB 1, 2, 3',
        note: 'Dizilerin ve stringlerin başlangıç adresini almak için en yaygın yoldur.'
      },
      {
        syntax: 'LEA reg16, [mem]',
        description: 'Karmaşık adresleme modunun hesaplanan ofset adresini yazmaca yükler.',
        example: 'MOV BX, 100H\nMOV SI, 20H\nLEA DX, [BX+SI+4] ; DX = 124h olur (Bellek okunmaz, sadece adres hesaplanır!)',
        note: 'Adres hesaplama aritmetiği için de sıkça kullanılır.'
      }
    ]
  },
  {
    opcode: 'XCHG',
    name: 'Exchange (Değer Takası)',
    category: 'data',
    summary: 'İki operandın içeriğini karşılıklı olarak yer değiştirir.',
    flags: 'Bayrakları etkilemez.',
    rules: 'İki bellek adresi arasında doğrudan takas yapılamaz. Segment yazmaçları kullanılamaz.',
    variations: [
      {
        syntax: 'XCHG reg, reg',
        description: 'İki yazmacın içeriğini takas eder.',
        example: 'MOV AX, 1111H\nMOV BX, 2222H\nXCHG AX, BX     ; AX = 2222H, BX = 1111H olur',
        note: 'Geçici üçüncü bir yazmaca ihtiyaç duymadan takas sağlar.'
      },
      {
        syntax: 'XCHG reg, [mem]',
        description: 'Yazmaç ile bellek adresindeki veriyi takas eder.',
        example: 'MOV AX, 50H\nXCHG AX, [DI]   ; AX bellekteki eski değeri alır, [DI]\'ye 50h yazılır',
        note: 'Atomik veri değişimi sağlar.'
      }
    ]
  },
  {
    opcode: 'PUSH',
    name: 'Push onto Stack (Yığına Ekle)',
    category: 'data',
    summary: '16-bitlik operandı yığına (Stack) koyar. SP işaretçisi 2 azalır (SP = SP - 2).',
    flags: 'Bayrakları etkilemez.',
    rules: '8086 mimarisinde yalnızca 16-bit değerler yığına atılabilir (PUSH AL veya sabit sayı geçersizdir!).',
    variations: [
      {
        syntax: 'PUSH reg16',
        description: '16-bit genel veya indeks yazmacını yığına atar.',
        example: 'MOV AX, 1234H\nPUSH AX         ; Yığına 1234H kaydedilir, SP 2 azalır',
        note: 'Altprogram çağrılarında yazmaç değerlerini korumak için kullanılır.'
      },
      {
        syntax: 'PUSH seg',
        description: 'Segment yazmacını yığına kaydeder.',
        example: 'PUSH DS\nPUSH ES',
        note: 'Segmentleri geçici değiştirip geri yüklemek için standarttır.'
      },
      {
        syntax: 'PUSH [mem16]',
        description: 'Bellekteki 16-bit kelimeyi yığına atar.',
        example: 'PUSH WORD PTR [BX] ; [BX] adresindeki 2 bayt yığına atılır',
        note: 'Boyut belirtici WORD PTR kullanılmalıdır.'
      }
    ]
  },
  {
    opcode: 'POP',
    name: 'Pop from Stack (Yığından Çek)',
    category: 'data',
    summary: 'Yığının tepesindeki 16-bit kelimeyi hedefe çeker. SP işaretçisi 2 artar (SP = SP + 2).',
    flags: 'Bayrakları etkilemez.',
    rules: 'POP CS komutu geçersizdir (CS doğrudan POP ile değiştirilemez).',
    variations: [
      {
        syntax: 'POP reg16',
        description: 'Yığından çekilen değeri 16-bit yazmaca atar.',
        example: 'POP BX          ; En son atılan 16-bit değer BX\'e yazılır',
        note: 'PUSH sırasının tam tersi sırada POP yapılmalıdır (LIFO).'
      },
      {
        syntax: 'POP seg',
        description: 'Yığından segment yazmacına çeker.',
        example: 'POP ES\nPOP DS',
        note: 'POP CS desteklenmez.'
      }
    ]
  },
  {
    opcode: 'PUSHF',
    name: 'Push Flags (Bayrakları Yığına At)',
    category: 'data',
    summary: 'Tüm FLAGS (bayraklar) yazmacını 16-bit kelime olarak yığına atar.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'PUSHF',
        description: 'Mevcut bayrak durumunu yığına kaydeder.',
        example: 'PUSHF           ; Bayraklar saklanır\nCMP AX, BX\nPOPF            ; Orijinal bayraklar geri yüklenir',
        note: 'Bayrakları altprogram boyunca korumak için kullanılır.'
      }
    ]
  },
  {
    opcode: 'POPF',
    name: 'Pop Flags (Bayrakları Yığından Geri Yükle)',
    category: 'data',
    summary: 'Yığından 16-bit kelime çekerek FLAGS yazmacına yükler.',
    flags: 'Tüm bayraklar (CF, PF, AF, ZF, SF, TF, IF, DF, OF) yığındaki değere göre güncellenir.',
    variations: [
      {
        syntax: 'POPF',
        description: 'Yığından bayrakları çeker.',
        example: 'POPF            ; SP 2 artar, bayraklar güncellenir',
        note: 'PUSHF ile eşleşmelidir.'
      }
    ]
  },
  {
    opcode: 'XLAT',
    name: 'Table Lookup Translation (Tablo Çevirisi)',
    category: 'data',
    summary: 'DS:BX başlangıçlı tablodan AL ofsetindeki baytı okuyup tekrar AL\'ye yazar: AL = [DS:BX + AL].',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'XLAT / XLATB',
        description: '256 elemanlı bayt tablosundan indeksli çeviri yapar.',
        example: 'LEA BX, TABLO\nMOV AL, 3\nXLAT            ; AL = TABLO[3] olur\n...\nTABLO DB 10, 20, 30, 40',
        note: 'Karakter kodlama dönüşümlerinde (ASCII-7 segment vb.) çok hızlıdır.'
      }
    ]
  },
  {
    opcode: 'LDS',
    name: 'Load Pointer using DS',
    category: 'data',
    summary: 'Bellekten 4 bayt okur: İlk 2 baytı hedef yazmaca (ofset), sonraki 2 baytı DS\'ye yükler.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'LDS reg16, [mem]',
        description: '32-bit uzak göstericiyi (Offset + Segment) yükler.',
        example: 'LDS SI, [BX]    ; SI = [BX], DS = [BX+2]',
        note: 'Veri segmentini ve göstericiyi tek komutla kurar.'
      }
    ]
  },
  {
    opcode: 'LES',
    name: 'Load Pointer using ES',
    category: 'data',
    summary: 'Bellekten 4 bayt okur: İlk 2 baytı hedef yazmaca, sonraki 2 baytı ES\'ye yükler.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'LES reg16, [mem]',
        description: '32-bit uzak göstericiyi ES ve hedef yazmaca yükler.',
        example: 'LES DI, [BX]    ; DI = [BX], ES = [BX+2]',
        note: 'Dizi işlemlerinde ES:DI hedef göstericisini kurmak için kullanılır.'
      }
    ]
  },

  // --- ARİTMETİK ---
  {
    opcode: 'ADD',
    name: 'Addition (Eldesiz Toplama)',
    category: 'arithmetic',
    summary: 'Hedef ile kaynak operandı toplar, sonucu hedefe yazar: Dest = Dest + Src.',
    flags: 'CF, ZF, SF, OF, AF, PF güncellenir.',
    variations: [
      {
        syntax: 'ADD reg, reg',
        addressingMode: 'Register Addressing',
        description: 'İki yazmaçtaki sayıyı toplar, bellek erişimi yoktur.',
        example: 'MOV AX, 5\nADD AX, 10      ; AX = 15 (0Fh)\nADD AX, BX      ; AX = AX + BX',
        note: 'Sonuç 0 olursa ZF=1, elde taşarsa CF=1 olur.'
      },
      {
        syntax: 'ADD [mem], reg / imm',
        description: 'Bellek hücresine değer ekler.',
        example: 'ADD BYTE PTR [DI], 1\nADD WORD PTR [BX], 500',
        note: 'Bellek operasyonlarında boyut belirteci verilmelidir.'
      }
    ]
  },
  {
    opcode: 'ADC',
    name: 'Add with Carry (Eldeli Toplama)',
    category: 'arithmetic',
    summary: 'Hedef, kaynak ve Carry Bayrağını toplar: Dest = Dest + Src + CF.',
    flags: 'CF, ZF, SF, OF, AF, PF güncellenir.',
    variations: [
      {
        syntax: 'ADC reg, reg / imm / [mem]',
        addressingMode: 'Multi-Precision Addition (Dest + Src + CF)',
        description: '32-bit veya daha geniş çok kelimeli toplamalarda taşan eldeyi sonraki basamağa ekler.',
        example: '; 32-bit Toplama: (DX:AX) + (CX:BX)\nADD AX, BX      ; Düşük 16-bit toplanır (elde CF\'ye gider)\nADC DX, CX      ; Yüksek 16-bit + CF toplanır',
        note: 'Büyük sayıların ardışık toplanmasında temeldir.'
      }
    ]
  },
  {
    opcode: 'SUB',
    name: 'Subtract (Eldesiz Çıkarma)',
    category: 'arithmetic',
    summary: 'Hedeften kaynağı çıkarır, sonucu hedefe yazar: Dest = Dest - Src.',
    flags: 'CF, ZF, SF, OF, AF, PF güncellenir.',
    variations: [
      {
        syntax: 'SUB reg, reg',
        addressingMode: 'Register Addressing',
        description: 'İki yazmaç arasında çıkarma yapar.',
        example: 'MOV AX, 20\nSUB AX, 5       ; AX = 15',
        note: 'Kaynak hedeften büyükse borç oluşur ve CF=1 olur.'
      }
    ]
  },
  {
    opcode: 'SBB',
    name: 'Subtract with Borrow (Borçlu Çıkarma)',
    category: 'arithmetic',
    summary: 'Hedeften kaynağı ve Carry Bayrağını çıkarır: Dest = Dest - Src - CF.',
    flags: 'CF, ZF, SF, OF, AF, PF güncellenir.',
    variations: [
      {
        syntax: 'SBB reg, reg / imm / [mem]',
        description: '32-bit çok basamaklı çıkarma işleminde düşük basamaktan gelen borcu düşer.',
        example: '; 32-bit Çıkarma: (DX:AX) - (CX:BX)\nSUB AX, BX      ; Düşük basamak çıkarılır\nSBB DX, CX      ; Yüksek basamaktan CX ve varsa CF borcu düşülür',
        note: 'Çok kelimeli hassas çıkarma için kullanılır.'
      }
    ]
  },
  {
    opcode: 'INC',
    name: 'Increment (1 Artır)',
    category: 'arithmetic',
    summary: 'Operanda 1 ekler: Dest = Dest + 1.',
    flags: 'ZF, SF, OF, AF, PF güncellenir. DİKKAT: Carry Bayrağı (CF) ETKİLENMEZ!',
    variations: [
      {
        syntax: 'INC reg / [mem]',
        description: 'Yazmaç veya bellek içeriğini 1 artırır.',
        example: 'INC SI          ; SI = SI + 1\nINC BYTE PTR [BX]',
        note: 'Döngü sayaçlarında CF\'yi bozmadığı için özellikle tercih edilir.'
      }
    ]
  },
  {
    opcode: 'DEC',
    name: 'Decrement (1 Azalt)',
    category: 'arithmetic',
    summary: 'Operanttan 1 çıkarır: Dest = Dest - 1.',
    flags: 'ZF, SF, OF, AF, PF güncellenir. Carry Bayrağı (CF) ETKİLENMEZ!',
    variations: [
      {
        syntax: 'DEC reg / [mem]',
        description: 'Yazmaç veya bellek içeriğini 1 azaltır.',
        example: 'DEC CX          ; CX 1 azalır\nJNZ TEKRAR      ; Sıfır değilse döngüye devam',
        note: 'Sayaç sıfıra ulaştığında ZF=1 olur.'
      }
    ]
  },
  {
    opcode: 'CMP',
    name: 'Compare (Karşılaştır)',
    category: 'arithmetic',
    summary: 'Hedeften kaynağı sanal olarak çıkarır (Dest - Src). Sonucu kaydetmez, yalnızca bayrakları günceller.',
    flags: 'CF, ZF, SF, OF, AF, PF tam güncellenir.',
    variations: [
      {
        syntax: 'CMP reg, reg / imm / [mem]',
        description: 'İki değeri karşılaştırarak koşullu atlama komutlarını (JE, JL, JAE vb.) hazırlar.',
        example: 'CMP AX, 10\nJE ESIT         ; AX == 10 ise atlar (ZF=1)\nJL KUCUK        ; AX < 10 ise atlar (SF!=OF)',
        note: 'Operandların değerleri kesinlikle değişmez.'
      }
    ]
  },
  {
    opcode: 'NEG',
    name: 'Two\'s Complement Negation (İşaret Tersleme)',
    category: 'arithmetic',
    summary: 'Operandın ikiye tümleyenini alır (0 - Dest), işaretini tersine çevirir (+ ise -, - ise +).',
    flags: 'CF (sonuç 0 değilse 1 olur), ZF, SF, OF, AF, PF güncellenir.',
    variations: [
      {
        syntax: 'NEG reg / [mem]',
        description: 'Pozitif sayıyı negatife, negatifi pozitife çevirir.',
        example: 'MOV AL, 5\nNEG AL          ; AL = -5 (FBh)',
        note: 'İşaretli sayılarla işlem yaparken kullanılır.'
      }
    ]
  },
  {
    opcode: 'MUL',
    name: 'Unsigned Multiplication (İşaretsiz Çarpma)',
    category: 'arithmetic',
    summary: 'İşaretsiz çarpma yapar. 8-bit ise AL * Src -> AX. 16-bit ise AX * Src -> DX:AX.',
    flags: 'CF ve OF: Sonucun yüksek yarısı sıfırdan farklıysa 1, aksi halde 0 olur.',
    variations: [
      {
        syntax: 'MUL reg8 / [mem8]',
        description: 'AL ile operandı çarpar, 16-bit sonucu AX\'e yazar.',
        example: 'MOV AL, 20\nMOV BL, 10\nMUL BL          ; AX = 200 (00C8h)',
        note: 'Birinci çarpan her zaman örtük olarak AL\'dir.'
      },
      {
        syntax: 'MUL reg16 / [mem16]',
        description: 'AX ile operandı çarpar, 32-bit sonucu DX (yüksek) ve AX (düşük) içine yazar.',
        example: 'MOV AX, 1000H\nMOV BX, 20H\nMUL BX          ; DX:AX = 0002:0000h',
        note: 'Birinci çarpan örtük olarak AX\'tir.'
      }
    ]
  },
  {
    opcode: 'IMUL',
    name: 'Signed Multiplication (İşaretli Çarpma)',
    category: 'arithmetic',
    summary: 'İşaretli tam sayı çarpımı yapar. 8-bit: AL * Src -> AX. 16-bit: AX * Src -> DX:AX.',
    flags: 'CF ve OF: Yüksek basamaklarda anlamlı işaret biti varsa 1 olur.',
    variations: [
      {
        syntax: 'IMUL reg / [mem]',
        description: 'Negatif sayıları göz önünde bulundurarak çarpar.',
        example: 'MOV AL, -5\nMOV BL, 4\nIMUL BL         ; AX = -20 (FFECH)',
        note: 'İşaret bitleri otomatik olarak doğru genişletilir.'
      }
    ]
  },
  {
    opcode: 'DIV',
    name: 'Unsigned Division (İşaretsiz Bölme)',
    category: 'arithmetic',
    summary: 'İşaretsiz bölme. 8-bit bölende: AX / Src -> AL:Bölüm, AH:Kalan. 16-bit bölende: DX:AX / Src -> AX:Bölüm, DX:Kalan.',
    flags: 'Bayraklar tanımsız kalır.',
    rules: 'Bölen sıfır ise veya bölüm hedefin kapasitesine sığmazsa Division by Zero hatası (INT 0) oluşur!',
    variations: [
      {
        syntax: 'DIV reg8 / [mem8]',
        description: 'AX içindeki sayıyı 8-bitlik bölene böler.',
        example: 'MOV AX, 25\nMOV BL, 4\nDIV BL          ; AL = 6 (bölüm), AH = 1 (kalan)',
        note: 'Sonuç 8-bit sınırını (255) aşmamalıdır.'
      },
      {
        syntax: 'DIV reg16 / [mem16]',
        description: 'DX:AX içindeki 32-bit sayıyı 16-bitlik bölene böler.',
        example: 'MOV DX, 0\nMOV AX, 1000\nMOV BX, 3\nDIV BX          ; AX = 333 (bölüm), DX = 1 (kalan)',
        note: 'Bölme öncesi DX genellikle 0 ile temizlenmelidir.'
      }
    ]
  },
  {
    opcode: 'IDIV',
    name: 'Signed Division (İşaretli Bölme)',
    category: 'arithmetic',
    summary: 'İşaretli tam sayı bölmesi yapar. 8-bit: AX / Src -> AL:Bölüm, AH:Kalan. 16-bit: DX:AX / Src -> AX:Bölüm, DX:Kalan.',
    flags: 'Bayraklar tanımsızdır.',
    variations: [
      {
        syntax: 'IDIV reg / [mem]',
        description: 'İşaretli sayıları böler. Kalanın işareti bölünenin işaretiyle aynı olur.',
        example: 'MOV AX, -25\nCBW             ; veya işaret genişletme\nMOV BL, 4\nIDIV BL         ; AL = -6, AH = -1',
        note: 'İşlem öncesi CBW veya CWD ile işaret genişletmesi yapılmalıdır.'
      }
    ]
  },
  {
    opcode: 'CBW',
    name: 'Convert Byte to Word (Bayttan Kelimeye İşaret Genişlet)',
    category: 'arithmetic',
    summary: 'AL içindeki işaretli sayının işaret bitini AH içine kopyalar (AL pozitifse AH=00h, negatifse AH=FFh).',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'CBW',
        description: '8-bit AL değerini 16-bit AX formatına işaretli genişletir.',
        example: 'MOV AL, -5      ; AL = FBh\nCBW             ; AX = FFFBh (-5)',
        note: '8-bit IDIV öncesi zorunludur.'
      }
    ]
  },
  {
    opcode: 'CWD',
    name: 'Convert Word to Doubleword (Kelimeden Çift Kelimeye)',
    category: 'arithmetic',
    summary: 'AX içindeki işaretli sayının işaretini DX içine kopyalar (AX pozitifse DX=0000h, negatifse DX=FFFFh).',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'CWD',
        description: '16-bit AX değerini 32-bit DX:AX formatına işaretli genişletir.',
        example: 'MOV AX, -100\nCWD             ; DX:AX = FFFF:FF9Ch\nMOV BX, 5\nIDIV BX         ; Güvenli işaretli bölme',
        note: '16-bit IDIV öncesi zorunludur.'
      }
    ]
  },

  // --- BCD ARİTMETİĞİ ---
  {
    opcode: 'DAA',
    name: 'Decimal Adjust for Addition (Toplama Sonrası BCD Düzelt)',
    category: 'bcd',
    summary: 'Paketli BCD (her nibble bir rakam, örn 25h = 25) toplama işleminden sonra AL yazmacını geçerli BCD formatına düzeltir.',
    flags: 'CF (onluk taşma), ZF, SF, AF, PF güncellenir.',
    variations: [
      {
        syntax: 'DAA',
        description: 'ADD veya ADC komutunun hemen ardından AL\'yi BCD yapar.',
        example: 'MOV AL, 35H     ; BCD 35\nADD AL, 48H     ; AL = 7Dh (geçersiz BCD)\nDAA             ; AL = 83H (35 + 48 = 83)',
        note: 'Finans ve sayaç uygulamalarında ondalık aritmetik için kullanılır.'
      }
    ]
  },
  {
    opcode: 'DAS',
    name: 'Decimal Adjust for Subtraction (Çıkarma Sonrası BCD Düzelt)',
    category: 'bcd',
    summary: 'Paketli BCD çıkarma işleminden sonra AL\'yi onluk BCD formatına düzeltir.',
    flags: 'CF (onluk borç), ZF, SF, AF, PF güncellenir.',
    variations: [
      {
        syntax: 'DAS',
        description: 'SUB veya SBB ardından AL\'yi düzeltir.',
        example: 'MOV AL, 83H     ; BCD 83\nSUB AL, 48H     ; AL = 3Bh\nDAS             ; AL = 35H (83 - 48 = 35)',
        note: 'Paketli BCD çıkarma için zorunludur.'
      }
    ]
  },
  {
    opcode: 'AAA',
    name: 'ASCII Adjust for Addition (Paketsiz BCD Toplama Düzelt)',
    category: 'bcd',
    summary: 'Paketsiz BCD (her baytta 1 rakam, örn: 09h) toplama sonrası AL ve AH\'yi onluk tabana göre ayarlar.',
    flags: 'AF ve CF güncellenir.',
    variations: [
      {
        syntax: 'AAA',
        description: 'ADD ardından AL ve AH\'yi düzenler.',
        example: 'MOV AX, 0\nMOV AL, 7\nADD AL, 8       ; AL = 0Fh\nAAA             ; AH = 1, AL = 5 (15)',
        note: 'Rakam karakterlerini (ASCII) doğrudan toplarken kullanılır.'
      }
    ]
  },
  {
    opcode: 'AAS',
    name: 'ASCII Adjust for Subtraction',
    category: 'bcd',
    summary: 'Paketsiz BCD çıkarma sonrası AL ve AH\'yi düzenler.',
    flags: 'AF ve CF güncellenir.',
    variations: [
      {
        syntax: 'AAS',
        description: 'SUB ardından paketsiz BCD borcunu AH\'ye yansıtır.',
        example: 'MOV AX, 0103H   ; 13\nSUB AL, 8       ; AL = FBh\nAAS             ; AH = 0, AL = 5',
        note: 'ASCII/Unpacked çıkarma düzelticisidir.'
      }
    ]
  },
  {
    opcode: 'AAM',
    name: 'ASCII Adjust for Multiplication',
    category: 'bcd',
    summary: 'Paketsiz iki rakamın çarpımından sonra AL değerini onluk basamaklara ayırır: AH = AL / 10, AL = AL % 10.',
    flags: 'ZF, SF, PF güncellenir.',
    variations: [
      {
        syntax: 'AAM',
        description: 'MUL sonrasında AL\'yi iki haneli BCD (AH: onlar, AL: birler) yapar.',
        example: 'MOV AL, 7\nMOV BL, 9\nMUL BL          ; AL = 63 (3Fh)\nAAM             ; AH = 6, AL = 3',
        note: 'Herhangi bir baytı onlar ve birler basamağına ayırmak için de mükemmeldir.'
      }
    ]
  },
  {
    opcode: 'AAD',
    name: 'ASCII Adjust before Division',
    category: 'bcd',
    summary: 'Bölme öncesinde AH ve AL içindeki iki BCD basamağını tek ikilik sayıya birleştirir: AL = (AH * 10) + AL, AH = 0.',
    flags: 'ZF, SF, PF güncellenir.',
    variations: [
      {
        syntax: 'AAD',
        description: 'DIV öncesinde iki basamaklı sayıyı bölmeye hazırlar.',
        example: 'MOV AX, 0605H   ; 65\nAAD             ; AL = 65 (41h), AH = 0\nMOV BL, 5\nDIV BL          ; AL = 13',
        note: 'AAM\'nin tam tersi işlemdir.'
      }
    ]
  },

  // --- MANTIK VE BİT KAYDIRMA ---
  {
    opcode: 'AND',
    name: 'Logical AND (Mantıksal VE)',
    category: 'logical',
    summary: 'İki operandın bitlerini karşılıklı VE işlemine tabi tutar. Belirli bitleri maskelemek (sıfırlamak) için kullanılır.',
    flags: 'CF=0, OF=0 yapılır. ZF, SF, PF sonuca göre güncellenir.',
    variations: [
      {
        syntax: 'AND reg, reg / imm / [mem]',
        description: 'Hedefin bitlerini kaynakla VE işlemine sokar.',
        example: 'MOV AL, 11010110B\nAND AL, 00001111B ; AL = 00000110B (üst 4-bit sıfırlandı)',
        note: 'Maskeleme işlemlerinde en temel komuttur.'
      }
    ]
  },
  {
    opcode: 'OR',
    name: 'Logical OR (Mantıksal VEYA)',
    category: 'logical',
    summary: 'İki operandın bitlerini VEYA işlemine sokar. Belirli bitleri 1 yapmak için kullanılır.',
    flags: 'CF=0, OF=0 yapılır. ZF, SF, PF güncellenir.',
    variations: [
      {
        syntax: 'OR reg, reg / imm / [mem]',
        description: 'Bitleri 1 olarak set eder.',
        example: 'MOV AL, 00100000B\nOR AL, 00000001B  ; AL = 00100001B (0. bit 1 yapıldı)',
        note: 'Donanım portlarında bayrakları açmak için kullanılır.'
      }
    ]
  },
  {
    opcode: 'XOR',
    name: 'Logical Exclusive OR (Mantıksal ÖZEL VEYA)',
    category: 'logical',
    summary: 'Bitler farklıysa 1, aynıysa 0 üretir. Bir yazmacı kendi kendisiyle XOR\'lamak onu 0 yapar.',
    flags: 'CF=0, OF=0 yapılır. ZF, SF, PF güncellenir.',
    variations: [
      {
        syntax: 'XOR reg, reg',
        description: 'Yazmacı en hızlı ve az yer kaplayan şekilde sıfırlar (MOV reg, 0 yerine tercih edilir).',
        example: 'XOR AX, AX      ; AX = 0000h olur, ZF = 1 olur (2 bayt!)',
        note: 'Şifreleme ve bit tersleme için de kullanılır.'
      }
    ]
  },
  {
    opcode: 'NOT',
    name: 'Logical NOT (Bire Tümleyen / Bitleri Tersle)',
    category: 'logical',
    summary: 'Operandın tüm bitlerini tersine çevirir (0 -> 1, 1 -> 0).',
    flags: 'HİÇBİR bayrağı etkilemez.',
    variations: [
      {
        syntax: 'NOT reg / [mem]',
        description: 'Tüm bitleri tersler.',
        example: 'MOV AL, 11110000B\nNOT AL          ; AL = 00001111B',
        note: 'Bayrakları değiştirmediğine dikkat ediniz.'
      }
    ]
  },
  {
    opcode: 'TEST',
    name: 'Logical Compare (Bit Testi)',
    category: 'logical',
    summary: 'İki operandı mantıksal VE (AND) ile test eder. Sonucu kaydetmez, sadece bayrakları günceller.',
    flags: 'CF=0, OF=0. ZF, SF, PF güncellenir.',
    variations: [
      {
        syntax: 'TEST reg, reg / imm',
        description: 'Belirli bir bitin 0 mı 1 mi olduğunu kontrol eder.',
        example: 'TEST AL, 00000001B ; AL tek mi çift mi?\nJNZ TEK_SAYI    ; 0. bit 1 ise ZF=0 olur',
        note: 'Yazmacın değerini bozmadan bayrak test eder.'
      }
    ]
  },
  {
    opcode: 'SHL',
    name: 'Shift Logical Left (Sola Kaydır)',
    category: 'logical',
    summary: 'Bitleri sola kaydırır. En sağdan 0 girer, en soldan çıkan bit Carry Flag (CF)\'ye gider. Sayıyı 2 ile çarpar.',
    flags: 'CF (çıkan bit), ZF, SF, PF güncellenir. 1 bit kaydırmada OF güncellenir.',
    rules: 'Kaydırma miktarı ya doğrudan 1 sabiti ya da CL yazmacı olmalıdır (8086 kuralı).',
    variations: [
      {
        syntax: 'SHL reg, 1',
        description: '1 bit sola kaydırır (2 ile çarpar).',
        example: 'MOV AL, 5\nSHL AL, 1       ; AL = 10',
        note: 'SAL (Shift Arithmetic Left) ile tamamen aynıdır.'
      },
      {
        syntax: 'SHL reg, CL',
        description: 'CL yazmacındaki değer kadar sola kaydırır.',
        example: 'MOV AL, 3\nMOV CL, 2\nSHL AL, CL      ; AL = 12 (3 * 4)',
        note: 'Birden fazla kaydırma için CL yazmacı zorunludur.'
      }
    ]
  },
  {
    opcode: 'SHR',
    name: 'Shift Logical Right (Mantıksal Sağa Kaydır)',
    category: 'logical',
    summary: 'İşaretsiz sayılar için sağa kaydırır. En soldan 0 girer, en sağdan çıkan bit CF\'ye gider. Sayıyı 2\'ye böler.',
    flags: 'CF, ZF, SF, PF güncellenir.',
    variations: [
      {
        syntax: 'SHR reg, 1 / CL',
        description: 'Sağa kaydırır.',
        example: 'MOV AL, 20\nSHR AL, 1       ; AL = 10',
        note: 'İşaretsiz sayıların 2\'ye bölünmesinde kullanılır.'
      }
    ]
  },
  {
    opcode: 'SAR',
    name: 'Shift Arithmetic Right (Aritmetik Sağa Kaydır)',
    category: 'logical',
    summary: 'İşaretli sayılar için sağa kaydırır. En soldaki işaret biti (0 veya 1) KORUNUR! Negatif sayıların işaretini bozmadan 2\'ye böler.',
    flags: 'CF, ZF, SF, PF güncellenir.',
    variations: [
      {
        syntax: 'SAR reg, 1 / CL',
        description: 'İşareti koruyarak sağa kaydırır.',
        example: 'MOV AL, -8      ; AL = F8h\nSAR AL, 1       ; AL = -4 (FCh)',
        note: 'İşaretli bölme için SHR yerine SAR kullanılmalıdır.'
      }
    ]
  },
  {
    opcode: 'ROL',
    name: 'Rotate Left (Sola Döndür)',
    category: 'logical',
    summary: 'Bitleri dairesel olarak sola döndürür. En soldan çıkan bit hem en sağa döner hem CF\'ye yazılır.',
    flags: 'CF güncellenir.',
    variations: [
      {
        syntax: 'ROL reg, 1 / CL',
        description: 'Dairesel sola döndürme.',
        example: 'MOV AL, 10000000B\nROL AL, 1       ; AL = 00000001B, CF = 1',
        note: 'Hiçbir bit kaybolmaz.'
      }
    ]
  },
  {
    opcode: 'ROR',
    name: 'Rotate Right (Sağa Döndür)',
    category: 'logical',
    summary: 'Bitleri dairesel olarak sağa döndürür. En sağdan çıkan bit hem en başa döner hem CF\'ye yazılır.',
    flags: 'CF güncellenir.',
    variations: [
      {
        syntax: 'ROR reg, 1 / CL',
        description: 'Dairesel sağa döndürme.',
        example: 'MOV AL, 00000001B\nROR AL, 1       ; AL = 10000000B, CF = 1',
        note: 'Bit rotasyonlarında kullanılır.'
      }
    ]
  },

  // --- ATLAMA VE DÖNGÜLER ---
  {
    opcode: 'JMP',
    name: 'Jump (Koşulsuz Atlama)',
    category: 'control',
    summary: 'Program yürütmesini koşulsuz olarak belirtilen etikete/adrese yönlendirir.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'JMP label',
        description: 'Etikete doğrudan atlar.',
        example: 'JMP BASLA\n...\nBASLA:\n  MOV AX, 1',
        note: 'Kısa (-128..+127) veya yakın (±32KB) atlama yapar.'
      }
    ]
  },
  {
    opcode: 'JE / JZ',
    name: 'Jump if Equal / Jump if Zero',
    category: 'control',
    summary: 'Son işlem sonucu sıfır ise veya karşılaştırılan iki değer eşitse atlar (ZF = 1).',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'JE label / JZ label',
        description: 'ZF=1 durumunda atlar.',
        example: 'CMP AX, BX\nJE ESITLER      ; AX == BX ise atlar',
        note: 'JE ile JZ aynı makine koduna (74h) sahiptir.'
      }
    ]
  },
  {
    opcode: 'JNE / JNZ',
    name: 'Jump if Not Equal / Jump if Not Zero',
    category: 'control',
    summary: 'Son işlem sonucu sıfır değilse veya değerler eşit değilse atlar (ZF = 0).',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'JNE label / JNZ label',
        description: 'ZF=0 durumunda atlar.',
        example: 'DEC CX\nJNZ TEKRAR      ; CX sıfır olana kadar döner',
        note: 'Döngü kurarken en sık kullanılan komuttur.'
      }
    ]
  },
  {
    opcode: 'JA / JB / JAE / JBE',
    name: 'Unsigned Conditional Jumps (İşaretsiz Koşullu Atlamalar)',
    category: 'control',
    summary: 'İşaretsiz sayılar için karşılaştırma atlamaları: JA (Büyükse), JB (Küçükse), JAE (Büyük-Eşit), JBE (Küçük-Eşit).',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'JA label  ; Büyükseniz (CF=0 ve ZF=0)\nJB label  ; Küçükse (CF=1)\nJAE label ; Büyük veya eşitse (CF=0)\nJBE label ; Küçük veya eşitse (CF=1 veya ZF=1)',
        description: 'İşaretsiz karşılaştırmalarda kullanılır.',
        example: 'CMP AL, 50\nJA ELLI_USTU    ; AL > 50 ise atlar',
        note: 'Pozitif tam sayılarda daima JA/JB ailesi kullanılmalıdır.'
      }
    ]
  },
  {
    opcode: 'JG / JL / JGE / JLE',
    name: 'Signed Conditional Jumps (İşaretli Koşullu Atlamalar)',
    category: 'control',
    summary: 'İşaretli (+ / -) sayılar için atlamalar: JG (Büyükse), JL (Küçükse), JGE (Büyük-Eşit), JLE (Küçük-Eşit).',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'JG label  ; Büyükse (ZF=0 ve SF=OF)\nJL label  ; Küçükse (SF!=OF)\nJGE label ; Büyük veya eşitse (SF=OF)\nJLE label ; Küçük veya eşitse (ZF=1 veya SF!=OF)',
        description: 'İşaretli sayılarda negatif/pozitif durumları doğru hesaplar.',
        example: 'CMP AX, -10\nJL DAHA_KUCUK   ; AX < -10 ise atlar',
        note: 'Negatif sayılarda JA/JB yerine mutlaka JG/JL ailesi kullanılmalıdır.'
      }
    ]
  },
  {
    opcode: 'JCXZ',
    name: 'Jump if CX is Zero',
    category: 'control',
    summary: 'CX yazmacı sıfır ise etikete atlar. CX bayrakları etkilemeden test edilmiş olur.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'JCXZ label',
        description: 'Döngü öncesi sayaç sıfır mı kontrolü.',
        example: 'JCXZ ATLA       ; CX=0 ise döngüye hiç girme\nDONGU:\n  LOOP DONGU\nATLA:',
        note: 'LOOP komutunun 0 iken 65535 kez dönmesini engellemek için döngü başında kullanılır.'
      }
    ]
  },
  {
    opcode: 'LOOP',
    name: 'Loop (Döngü Adımı)',
    category: 'control',
    summary: 'CX yazmacını 1 azaltır. CX sıfır değilse (CX != 0) belirtilen etikete geri atlar. CX=0 olduğunda döngü sonlanır.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'LOOP label',
        description: 'Otomatik CX sayaçlı döngü.',
        example: 'MOV CX, 5\nDONGU:\n  ; Buradaki kod 5 kez çalışır\n  LOOP DONGU',
        note: 'LOOP komutu en fazla -128..+127 bayt aralığına kısa atlama yapabilir.'
      }
    ]
  },
  {
    opcode: 'LOOPE / LOOPNE',
    name: 'Loop while Equal / Not Equal',
    category: 'control',
    summary: 'LOOPE/LOOPZ: CX 1 azalır; CX!=0 VE ZF==1 ise döner. LOOPNE/LOOPNZ: CX 1 azalır; CX!=0 VE ZF==0 ise döner.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'LOOPE label / LOOPNE label',
        description: 'Hem sayaç hem bayrak koşullu döngü.',
        example: 'MOV CX, 10\nARA:\n  CMP [SI], AL\n  LOOPE ARA     ; Eşit olduğu sürece devam et',
        note: 'Dizilerde arama yaparken erken çıkış sağlar.'
      }
    ]
  },
  {
    opcode: 'CALL',
    name: 'Call Procedure (Altprogram Çağır)',
    category: 'control',
    summary: 'Dönüş adresini (bir sonraki komutun ofsetini) yığına PUSH eder ve altprogram etiketine atlar.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'CALL label',
        description: 'Altprogram çağrısı.',
        example: 'CALL TOPLA\n...\nTOPLA:\n  ADD AX, BX\n  RET',
        note: 'Altprogram mutlaka RET ile sonlanmalıdır.'
      }
    ]
  },
  {
    opcode: 'RET / RETN',
    name: 'Return from Procedure (Altprogramdan Dön)',
    category: 'control',
    summary: 'Yığından dönüş adresini POP ederek IP\'ye yükler ve çağrıldığı satırın hemen sonrasından devam eder.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'RET',
        description: 'Standart altprogram dönüşü.',
        example: 'TOPLA:\n  ADD AX, BX\n  RET',
        note: 'CALL ile yığına atılan IP adresini çeker.'
      },
      {
        syntax: 'RET imm16',
        description: 'Döndükten sonra yığından belirtilen bayt kadar parametre temizler (SP = SP + imm16).',
        example: 'RET 4           ; Dönüşten sonra yığındaki 4 baytı (2 kelime) düşer',
        note: 'Pascal/C çağrı standartlarında yığındaki parametreleri temizler.'
      }
    ]
  },

  // --- DİZİ (STRING) İŞLEMLERİ ---
  {
    opcode: 'MOVSB / MOVSW',
    name: 'Move String Byte/Word (Dizi Elemanı Taşı)',
    category: 'string',
    summary: 'DS:SI adresindeki bayt/kelimeyi ES:DI adresine kopyalar. DF=0 ise SI ve DI artar, DF=1 ise azalır.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'MOVSB / MOVSW',
        description: 'Bellekten belleğe blok veri kopyalama.',
        example: 'LEA SI, KAYNAK\nLEA DI, HEDEF\nMOV CX, 10\nCLD             ; İleri yön\nREP MOVSB       ; 10 baytı peş peşe kopyalar',
        note: 'REP öneki ile birlikte tam bellek kopyalama fonksiyonu görür.'
      }
    ]
  },
  {
    opcode: 'LODSB / LODSW',
    name: 'Load String Byte/Word',
    category: 'string',
    summary: 'DS:SI adresindeki baytı AL\'ye (veya kelimeyi AX\'e) okur, SI\'yi DF\'ye göre 1 veya 2 artırır/azaltır.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'LODSB / LODSW',
        description: 'Diziden sıradaki elemanı çeker.',
        example: 'LEA SI, METIN\nCLD\nLODSB           ; AL = sıradaki karakter, SI artar',
        note: 'Dizi okuma döngülerinde çok pratiktir.'
      }
    ]
  },
  {
    opcode: 'STOSB / STOSW',
    name: 'Store String Byte/Word',
    category: 'string',
    summary: 'AL (veya AX) içindeki değeri ES:DI adresine yazar, DI\'yi DF\'ye göre artırır/azaltır.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'STOSB / STOSW',
        description: 'Bellek bölgesini belirli bir değerle doldurur (memset).',
        example: 'LEA DI, ALAN\nMOV AL, 0\nMOV CX, 100\nCLD\nREP STOSB       ; 100 baytı 0 ile sıfırlar',
        note: 'Bellek temizleme işlemlerinde yüksek hız sağlar.'
      }
    ]
  },
  {
    opcode: 'CMPSB / CMPSW',
    name: 'Compare String Byte/Word',
    category: 'string',
    summary: 'DS:SI ile ES:DI adreslerindeki verileri karşılaştırır, bayrakları günceller ve SI/DI\'yi ilerletir.',
    flags: 'Tüm bayraklar güncellenir.',
    variations: [
      {
        syntax: 'REPE CMPSB',
        description: 'İki metin veya bellek bloğunu eşit olduğu sürece karşılaştırır.',
        example: 'REPE CMPSB      ; Karakterler eşit olduğu sürece ilerle',
        note: 'strcmp fonksiyonunun donanımsal karşılığıdır.'
      }
    ]
  },
  {
    opcode: 'SCASB / SCASW',
    name: 'Scan String Byte/Word',
    category: 'string',
    summary: 'AL veya AX içindeki değeri ES:DI adresindeki değerle karşılaştırır, bayrakları günceller ve DI\'yi ilerletir.',
    flags: 'Tüm bayraklar güncellenir.',
    variations: [
      {
        syntax: 'REPNE SCASB',
        description: 'Dizi içinde belirli bir karakteri arar (strchr).',
        example: 'MOV AL, \'$\'\nREPNE SCASB     ; $ karakterini bulana kadar tara',
        note: 'Metin sonu veya özel ayırıcı aramada kullanılır.'
      }
    ]
  },

  // --- BAYRAK VE SİSTEM KONTROL ---
  {
    opcode: 'CLC / STC / CMC',
    name: 'Carry Flag Controls (Elde Bayrağı Kontrolleri)',
    category: 'flags',
    summary: 'CLC: CF = 0 yapar. STC: CF = 1 yapar. CMC: CF bayrağını tersler (CF = !CF).',
    flags: 'Yalnızca CF güncellenir.',
    variations: [
      {
        syntax: 'CLC ; Clear Carry\nSTC ; Set Carry\nCMC ; Complement Carry',
        description: 'Elde bayrağını doğrudan yönetir.',
        example: 'CLC             ; Toplama öncesi eldeyi sıfırla\nADC AX, BX',
        note: 'Çok basamaklı aritmetik ve dönüş kodlarında kullanılır.'
      }
    ]
  },
  {
    opcode: 'CLD / STD',
    name: 'Direction Flag Controls (Yön Bayrağı Kontrolleri)',
    category: 'flags',
    summary: 'CLD: DF = 0 (Dizi komutları ileri/artan adreslere gider). STD: DF = 1 (Dizi komutları geri/azalan adreslere gider).',
    flags: 'Yalnızca DF güncellenir.',
    variations: [
      {
        syntax: 'CLD ; İleri yön (SI/DI artar)\nSTD ; Geri yön (SI/DI azalır)',
        description: 'Dizi operasyonlarının yönünü tayin eder.',
        example: 'CLD             ; Güvenlik için dizi komutundan önce verilir\nREP MOVSB',
        note: 'MOVSB, STOSB vb. komutlardan önce mutlaka yön belirlenmelidir.'
      }
    ]
  },
  {
    opcode: 'CLI / STI',
    name: 'Interrupt Flag Controls (Kesme İzinleri)',
    category: 'flags',
    summary: 'CLI: Dış donanım kesmelerini devre dışı bırakır (IF=0). STI: Dış kesmeleri açar (IF=1).',
    flags: 'Yalnızca IF güncellenir.',
    variations: [
      {
        syntax: 'CLI ; Kesmeleri kapat\nSTI ; Kesmeleri aç',
        description: 'Kritik kod bölümlerinde işlemcinin bölünmesini önler.',
        example: 'CLI             ; Kritik bölüm başladı\n...\nSTI             ; Kritik bölüm bitti',
        note: 'Gerçek mod sistem programlamasında kullanılır.'
      }
    ]
  },
  {
    opcode: 'LAHF / SAHF',
    name: 'Load/Store AH from/to Flags',
    category: 'flags',
    summary: 'LAHF: Düşük bayrakları (SF, ZF, AF, PF, CF) AH yazmacına kopyalar. SAHF: AH\'deki değerleri bayraklara yükler.',
    flags: 'LAHF bayrakları etkilemez; SAHF SF, ZF, AF, PF, CF bayraklarını günceller.',
    variations: [
      {
        syntax: 'LAHF / SAHF',
        description: 'Bayrak durumunu kaydetmek ve geri yüklemek için hızlı yol.',
        example: 'LAHF            ; Bayrakları AH\'ye al\n...\nSAHF            ; Bayrakları geri yükle',
        note: '8080 işlemcisi ile uyumluluk için tasarlanmıştır.'
      }
    ]
  },
  {
    opcode: 'NOP',
    name: 'No Operation (Boş Komut)',
    category: 'flags',
    summary: 'İşlemciye hiçbir işlem yaptırmaz (XCHG AX, AX olarak kodlanır). 1 makine döngüsü harcar.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'NOP',
        description: '1 baytlık yer tutar veya küçük gecikme sağlar.',
        example: 'NOP             ; 1 bayt 90h opkodu',
        note: 'Hizalama veya kod yamalarında kullanılır.'
      }
    ]
  },
  {
    opcode: 'HLT',
    name: 'Halt Processor (İşlemciyi Durdur)',
    category: 'flags',
    summary: 'İşlemciyi harici bir kesme (interrupt) veya reset gelene kadar duraklatır.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'HLT',
        description: 'Program yürütmesini sonlandırır.',
        example: 'MOV AX, 1\nHLT             ; Simülatör burada durur',
        note: 'Simülatörde programın bittiğini bildiren standart komuttur.'
      }
    ]
  },
  {
    opcode: 'INT',
    name: 'Software Interrupt (Yazılımsal Kesme)',
    category: 'flags',
    summary: 'Belirtilen kesme vektörünü (0-255) çağırır. DOS ve BIOS servislerine erişim sağlar.',
    flags: 'IF ve TF sıfırlanır, bayraklar ve CS:IP yığına atılır.',
    variations: [
      {
        syntax: 'INT 21H',
        description: 'DOS Sistem Çağrısı (AH fonksiyon koduna göre çalışır).',
        example: 'MOV AH, 09H     ; String yazdırma servisi\nMOV DX, OFFSET MESAJ\nINT 21H\n\nMOV AH, 4CH     ; Programdan çıkış servisi\nINT 21H',
        note: 'Simülatörümüzde AH=09h (ekrana metin yazma) ve AH=4Ch (çıkış) desteklenir.'
      },
      {
        syntax: 'INT 3',
        description: 'Hata ayıklayıcı kesme noktası (Breakpoint).',
        example: 'INT 3',
        note: '1 baytlık özel CC opkoduna sahiptir.'
      }
    ]
  },

  // --- YÖNERGELER (DIRECTIVES) ---
  {
    opcode: 'ORG',
    name: 'Origin Directive (Başlangıç Adresi)',
    category: 'directives',
    summary: 'Programın bellekteki yerleşim ofsetini belirler. DOS COM dosyaları için zorunlu başlangıç 100h\'dir.',
    flags: 'Bayrakları etkilemez (Assembler yönergesidir).',
    variations: [
      {
        syntax: 'ORG 100H',
        description: 'Programı CS:0100h ofsetine yerleştirir.',
        example: 'ORG 100H\nSTART:\n  MOV AX, 5',
        note: 'İlk 256 bayt (00h-FFh) DOS PSP (Program Segment Prefix) için ayrılmıştır.'
      }
    ]
  },
  {
    opcode: 'DB / DW',
    name: 'Define Byte / Define Word (Veri Tanımlama)',
    category: 'directives',
    summary: 'DB: 8-bitlik bayt verileri veya stringleri tanımlar. DW: 16-bitlik kelime verilerini tanımlar.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'label DB val1, val2, ... / \'string\'',
        description: 'Bayt dizisi veya metin tanımlar.',
        example: 'SAYILAR DB 5, 12, 8, 25\nMESAJ DB \'Merhaba Dünya$\'',
        note: 'Stringler tek veya çift tırnak ile tanımlanır.'
      },
      {
        syntax: 'label DW val1, val2, ...',
        description: '16-bitlik kelime dizisi tanımlar.',
        example: 'TABLO DW 1000H, 2000H, 3000H',
        note: 'Intel 8086 Little-Endian formatında (düşük bayt önce) saklanır.'
      }
    ]
  },
  {
    opcode: 'DUP',
    name: 'Duplicate Directive (Tekrarlı Veri)',
    category: 'directives',
    summary: 'DB veya DW ile birlikte belirli sayıda ardışık alanı başlatmak veya boş bırakmak için kullanılır.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'count DUP(val)',
        description: 'Belirtilen sayıda aynı değerden üretir.',
        example: 'DIZI DB 10 DUP(0)    ; 10 baytlık sıfır dizisi\nYIGIN DW 32 DUP(?)   ; 32 kelimelik yığın alanı',
        note: 'Dizi tamponları ve yığın alanları tanımlarken kullanılır.'
      }
    ]
  },
  {
    opcode: 'OFFSET',
    name: 'Offset Operator (Ofset Operatörü)',
    category: 'directives',
    summary: 'Bir etiketin veri segmenti içindeki 16-bit ofset adresini döner.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'OFFSET label',
        description: 'Etiketin sayısal ofset adresini döndürür.',
        example: 'MOV DX, OFFSET METIN ; LEA DX, METIN ile eşdeğerdir',
        note: 'INT 21H çağrılarında string adresini DX\'e yüklemek için çok sık kullanılır.'
      }
    ]
  },
  {
    opcode: 'BYTE / WORD PTR',
    name: 'Type Override Operators (Boyut Belirleyiciler)',
    category: 'directives',
    summary: 'Bellek operasyonlarında hedefin boyutunun belirsiz olduğu durumlarda bayt mı (8-bit) kelime mi (16-bit) olduğunu açıkça belirtir.',
    flags: 'Bayrakları etkilemez.',
    variations: [
      {
        syntax: 'BYTE PTR [mem] / WORD PTR [mem]',
        description: 'Bellek boyutunu belirler.',
        example: 'MOV BYTE PTR [BX], 0FFH   ; 1 bayt yazar\nMOV WORD PTR [BX], 0FFH   ; 2 bayt yazar (00FFh)',
        note: 'Derleyicinin operand boyutu hatası (ambiguous operand size) vermesini engeller.'
      }
    ]
  }
];

export const ADDRESSING_MODES: AddressingModeInfo[] = [
  {
    modeName: '1. Register Addressing (Yazmaç Adresleme)',
    category: 'data',
    summary: 'Veri doğrudan bir yazmaçtan diğerine veya yazmaç içinde aktarılır. Bellek erişimi gerektirmediği için en hızlı çalışan adresleme modudur.',
    registersAllowed: 'AX, BX, CX, DX, SI, DI, BP, SP ve 8-bit yarıları (AH, AL, BH...)',
    defaultSegment: 'Yok (Yazmaç içi)',
    example: 'MOV AX, BX\nADD AL, BH\nMOV SI, DI',
    notes: 'Her iki yazmaç aynı boyutta olmalıdır (8-bit ile 16-bit karıştırılamaz: MOV AL, BX geçersizdir!).'
  },
  {
    modeName: '2. Immediate Addressing (Sabit / Doğrudan Değer Adresleme)',
    category: 'data',
    summary: 'Operandın kendisi sabit bir sayısal değerdir ve doğrudan komut baytlarının içinde saklanır.',
    registersAllowed: 'Hedef herhangi bir genel yazmaç veya bellek hücresi olabilir.',
    defaultSegment: 'Yok (Kod segmenti içinde komutla gelir)',
    example: 'MOV AX, 1234H\nMOV BL, 50\nMOV WORD PTR [BX], 0FFFFH',
    notes: 'Segment yazmaçlarına doğrudan sabit değer yüklenemez! (MOV DS, 1000H yasaktır; önce AX\'e, sonra DS\'ye aktarılır).'
  },
  {
    modeName: '3. Direct Addressing (Doğrudan Bellek Adresleme)',
    category: 'data',
    summary: 'Bellek ofset adresi komutun içinde doğrudan sabit bir adres veya etiket olarak verilir.',
    formula: 'Fiziksel Adres = DS * 16 + Disp16',
    registersAllowed: 'Kaynak veya hedef bellek ofsetidir.',
    defaultSegment: 'DS (Data Segment)',
    example: 'MOV AX, [1234H]   ; DS:1234h adresindeki kelimeyi AX\'e okur\nMOV [500H], BL    ; BL değerini DS:0500h adresine yazar',
    notes: 'Doğrudan adresleme ile program değişkenlerinin ofsetleri okunur veya yazılır.'
  },
  {
    modeName: '4. Register Indirect Addressing (Yazmaç Dolaylı Adresleme)',
    category: 'data',
    summary: 'Bellek ofset adresi köşeli parantez içinde bir işaretçi veya indeks yazmacında tutulur.',
    formula: 'Fiziksel Adres = Segment * 16 + [Yazmaç]',
    registersAllowed: 'Yalnızca 4 yazmaç kullanılabilir: BX, BP, SI, DI',
    defaultSegment: 'BX, SI, DI için DS; BP için varsayılan olarak SS (Stack Segment)',
    example: 'MOV AX, [BX]      ; DS:BX adresindeki veriyi okur\nMOV [DI], CL      ; CL değerini DS:DI adresine yazar\nMOV AX, [BP]      ; SS:BP (Yığın) adresindeki veriyi okur',
    notes: '8086 Kuralı: AX, CX, DX veya SP köşeli parantez içinde dolaylı adresleme için KULLANILAMAZ! (MOV AX, [CX] geçersizdir).'
  },
  {
    modeName: '5. Base-Plus-Index Addressing (Taban + İndeks Adresleme)',
    category: 'data',
    summary: 'Bir taban yazmacı (BX veya BP) ile bir indeks yazmacı (SI veya DI) toplanarak efektif adres oluşturulur.',
    formula: 'Efektif Adres (EA) = Taban (BX/BP) + İndeks (SI/DI)',
    registersAllowed: 'Bir Taban (BX veya BP) + Bir İndeks (SI veya DI)',
    defaultSegment: 'BX ile DS; BP ile SS',
    example: 'MOV AX, [BX+SI]   ; DS:[BX+SI] adresinden okur\nMOV [BP+DI], DX   ; SS:[BP+DI] adresine yazar\nMOV CL, [BX][DI]   ; [BX+DI] ile aynı sözdizimidir',
    notes: 'İki taban ([BX+BP]) veya iki indeks ([SI+DI]) birlikte KULLANILAMAZ!'
  },
  {
    modeName: '6. Register Relative Addressing (Yazmaç Bağıl Adresleme)',
    category: 'data',
    summary: 'Bir baz veya indeks yazmacına 8-bit veya 16-bit sabit bir yer değiştirme (displacement / ofset) eklenir.',
    formula: 'EA = (BX/BP/SI/DI) + Displacement',
    registersAllowed: 'BX, BP, SI, DI + Sabit Değer / Etiket',
    defaultSegment: 'BX, SI, DI için DS; BP için SS',
    example: 'MOV AX, [BX+4]      ; BX ofsetinden 4 bayt ileriyi okur\nMOV ARRAY[SI], AL  ; ARRAY dizisinin SI\'ıncı elemanını yazar\nMOV [BP-2], CX     ; Yığındaki yerel değişkeni okur/yazar',
    notes: 'Dizilerde ve yığın çerçevelerindeki (Stack Frame) yerel değişkenlerde çok sık kullanılır.'
  },
  {
    modeName: '7. Base Relative-Plus-Index Addressing (Taban Bağıl + İndeks Adresleme)',
    category: 'data',
    summary: 'En gelişmiş 8086 adresleme modu: Bir taban yazmacı, bir indeks yazmacı ve sabit bir yer değiştirme toplanır.',
    formula: 'EA = Taban (BX/BP) + İndeks (SI/DI) + Displacement',
    registersAllowed: '(BX veya BP) + (SI veya DI) + Sabit / Dizi İsmi',
    defaultSegment: 'BX ile DS; BP ile SS',
    example: 'MOV AX, [BX+SI+4]    ; Çok boyutlu matris veya yapı elemanı okuma\nMOV TABLO[BP+DI], AX\nMOV CX, [BX][SI+10H]',
    notes: 'İki boyutlu diziler (matrisler) ve struct/record veri yapılarına erişim için idealdir.'
  }
];

export const ARCHITECTURE_GUIDE: ArchitectureGuide = {
  title: '8086 Mikroişlemci Mimarisi & Fiziksel Adresleme (Week 1–2)',
  busSystem: {
    addressBus: '20-bit Genişlik (1 MB = 1,048,576 bayt doğrudan adreslenebilir bellek)',
    dataBus: '16-bit Genişlik (Her saat vuruşunda 1 bayt veya 1 kelime aktarılır)',
    controlBus: 'Bellek ve I/O okuma/yazma denetim sinyalleri (MEMR, MEMW, IOR, IOW)'
  },
  memoryOrganization: {
    title: 'Gerçek Mod (Real Mode) Bellek Haritası',
    tpa: 'TPA (Transient Program Area): 00000H - 9FFFFH (640 KB) - DOS, kullanıcı programları ve veriler burada çalışır.',
    systemArea: 'System Area: A0000H - FFFFFH (384 KB) - Video RAM (A0000H-BFFFFH) ve ROM-BIOS (C0000H-FFFFFH) alanıdır.'
  },
  realModeFormula: {
    formula: 'Fiziksel Adres (20-bit) = (Segment Yazmacı * 10H) + Ofset Yazmacı',
    explanation: 'Segment yazmacının değeri 16 ile çarpılır (ikilikte 4 bit sola kaydırılır, sonuna bir Hex 0 eklenir) ve 16-bitlik ofset ile toplanır.',
    example: 'Örnek: CS = 348AH ve IP = 4214H ise:\n  Segment * 10H : 348A0H\n  Ofset         : +4214H\n  -----------------------\n  Fiziksel Adres:  38AB4H (Bellekteki gerçek 20-bit adres)'
  },
  defaultPairs: [
    { purpose: 'Komut Getirme (Instruction Fetch)', segment: 'CS (Code Segment)', offset: 'IP (Instruction Pointer)' },
    { purpose: 'Yığın İşlemleri (Stack Push/Pop)', segment: 'SS (Stack Segment)', offset: 'SP (Stack Pointer)' },
    { purpose: 'Yığın Tabanlı Adresleme (Stack Frame)', segment: 'SS (Stack Segment)', offset: 'BP (Base Pointer)' },
    { purpose: 'Genel Veri Erişimi (Data Access)', segment: 'DS (Data Segment)', offset: 'BX, SI, DI veya Doğrudan Adres' },
    { purpose: 'Hedef Dizi İşlemleri (String Dest)', segment: 'ES (Extra Segment)', offset: 'DI (Destination Index)' }
  ],
  entryPointGuide: {
    title: 'Giriş Noktası (Entry Point: CS:IP) & Reset Vektörü',
    meaning: 'Giriş noktası, derlenen program belleğe yüklendiğinde işlemcinin çalıştırmaya başlayacağı İLK komutun adresidir. 8086 mimarisinde her komut adresi Kod Segmenti (CS) ve Komut Göstericisi (IP) çiftiyle (CS:IP) belirlenir.',
    defaultOrigin: 'Simülatörde varsayılan başlangıç ofseti 0000h\'dir (Giriş noktası: CS:0000h). Programın ilk baytı bellek segmentinin 0000h ofsetine yazılır ve IP = 0000h yapılır.',
    org100h: 'DOS .COM Programlarında ORG 100H Kuralı: DOS işletim sistemi programın önüne 256 baytlık (100h) PSP (Program Segment Prefix) koyduğu için slaytlardaki kodlar genellikle ORG 100H yönergesiyle başlar ve giriş noktası CS:0100h olur.',
    resetVector: 'Donanımsal Reset Vektörü (FFFF:0000h): 8086 mikroişlemcisine elektrik ilk verildiğinde veya RESET pinine sinyal geldiğinde, donanımsal olarak CS=FFFFh ve IP=0000h kurulur. Bu adres (FFFF0h) ROM-BIOS başlangıç komutudur (Week 2, Slayt 36).'
  },
  nestedRegisters: {
    title: 'Yazmaç Evrimi ve İçiçe Geçmiş Genişlikler (Nested Widths - Week 2)',
    diagram: `+---------------------------------------------------------------+
|                         RAX (64-bit)                          |
+-------------------------------+-------------------------------+
|                               |          EAX (32-bit)         |
|                               +---------------+---------------+
|       (Üst 32 bit)            |               |  AX (16-bit)  |
|                               | (Üst 16 bit)  +-------+-------+
|                               |               |AH(8b) |AL(8b) |
+-------------------------------+---------------+-------+-------+`,
    rule: 'Daha küçük bir yazmaca (örn. AL) yazmak, sadece o 8-bitlik kısmı değiştirir. AH ve üst kısımlar korunur.'
  }
};

export const FLAGS_GUIDE: FlagsGuide = {
  title: 'FLAGS (Bayraklar) Kaydı ve Koşullu Dallanma Rehberi',
  statusFlags: [
    { flag: 'CF (Carry)', bit: 0, desc: 'Elde Bayrağı: İşaretsiz aritmetik işlemlerinde en yüksek bitten taşma (elde) veya borç oluşursa 1 olur.' },
    { flag: 'PF (Parity)', bit: 2, desc: 'Parite Bayrağı: Sonucun en düşük 8 bitindeki 1 bitlerinin sayısı çift ise 1, tek ise 0 olur.' },
    { flag: 'AF (Auxiliary)', bit: 4, desc: 'Yardımcı Elde: Bit 3\'ten Bit 4\'e (düşük nibble\'dan yüksek nibble\'a) elde geçerse 1 olur (BCD için kullanılır).' },
    { flag: 'ZF (Zero)', bit: 6, desc: 'Sıfır Bayrağı: Aritmetik veya mantık işleminin sonucu 0 çıkarsa 1, sıfırdan farklı çıkarsa 0 olur.' },
    { flag: 'SF (Sign)', bit: 7, desc: 'İşaret Bayrağı: Sonucun en yüksek biti (MSB / işaret biti) 1 ise (negatifse) 1, pozitifse 0 olur.' },
    { flag: 'OF (Overflow)', bit: 11, desc: 'Taşma Bayrağı: İşaretli (Signed) sayı işlemlerinde sonuç hedef yazmacın sınırlarını aşarsa 1 olur.' }
  ],
  controlFlags: [
    { flag: 'DF (Direction)', bit: 10, desc: 'Yön Bayrağı: Dizi komutlarında SI/DI otomatik artış (CLD: DF=0, ileri) veya azalışını (STD: DF=1, geri) belirler.' },
    { flag: 'IF (Interrupt)', bit: 9, desc: 'Kesme Yetkilendirme: Maskelenebilir donanım kesmelerini açar (STI: IF=1) veya kapatır (CLI: IF=0).' },
    { flag: 'TF (Trap)', bit: 8, desc: 'Tuzak / Adım Bayrağı: 1 yapıldığında işlemci her komuttan sonra INT 1 kesmesi üreterek hata ayıklama (single step) sağlar.' }
  ],
  goldenRules: [
    'INC ve DEC komutları Carry Flag (CF) bayrağını ASLA etkilemez! (Döngü sayaçlarında elde zincirini korur).',
    'CMP ve TEST komutları veriyi DEĞİŞTİRMEZ, sadece bayrakları günceller.',
    'Bölme (DIV / IDIV) işleminden sonra hiçbir bayrak güvenilir değildir (hepsi tanımsızdır).'
  ]
};

export const PROGRAM_ADDRESSING_MODES: ProgramAddressingMode[] = [
  {
    name: '1. Direct Program Memory Addressing (Doğrudan Program Bellek Adresleme)',
    reach: 'Intersegment (Far Jump / Call)',
    description: 'Hedef adres komut opkodunun hemen ardında tam 32-bit (CS:IP) olarak saklanır. Tüm 1 MB bellek alanında herhangi bir segmentteki herhangi bir adrese atlayabilir.',
    example: 'JMP 1000:0000   ; CS = 1000H ve IP = 0000H yükler (Slayt 19)',
    notes: 'Erken mikroişlemcilerin ve yüksek seviyeli dillerdeki GOTO ifadesinin temel çalışma modelidir.'
  },
  {
    name: '2. Relative Program Memory Addressing (Bağıl Program Bellek Adresleme)',
    reach: 'Intrasegment (Near veya Short Jump)',
    description: 'Hedef adres doğrudan saklanmaz; mevcut Komut Göstericisine (IP) eklenecek bir yer değiştirme (displacement / ofset) olarak saklanır.',
    formula: 'Hedef Adres = IP + Displacement',
    example: 'JMP SHORT DONGU ; IP\'ye 1 baytlık (-128..+127) ofset ekler (Slayt 21-24)',
    notes: 'Short jump 1 bayt, Near jump 2 bayt displacement kullanır. Kodun bellekte herhangi bir yere taşınabilir (relocatable) olmasını sağlar.'
  },
  {
    name: '3. Indirect Program Memory Addressing (Dolaylı Program Bellek Adresleme)',
    reach: 'Intrasegment veya Intersegment',
    description: 'Atlanacak hedef adres doğrudan komut içinde değil; bir yazmaçta veya bellek işaretçisinde tutulur. Çalışma anında (run-time) okunur.',
    example: 'JMP AX          ; AX içindeki ofset adresine atlar\nJMP [BX]        ; DS:BX adresinde yazılı olan ofsete atlar (Slayt 24-25)',
    notes: 'Dinamik atlamalar, fonksiyon göstericileri (function pointers) ve Jump Table yapıları bu mod ile gerçekleştirilir.'
  }
];

export const STACK_ADDRESSING_GUIDE: StackAddressingGuide = {
  title: 'Yığın Bellek Adresleme Modları (Stack Memory Addressing - Week 3, Section 4)',
  discipline: 'LIFO (Last-In, First-Out - Son Giren İlk Çıkar)',
  formula: 'Fiziksel Yığın Adresi = SS × 10H + SP',
  pushStep: 'PUSH Komutu (SP ← SP - 2): Önce SP 2 azaltılır. Yüksek bayt SP-1\'e, düşük bayt SP-2\'ye yazılır.',
  popStep: 'POP Komutu (SP ← SP + 2): Düşük bayt SP\'den, yüksek bayt SP+1\'den çekilir, ardından SP 2 artırılır.',
  swapExample: {
    code: 'MOV AX, 1000H\nMOV BX, 2000H\nPUSH AX         ; Yığına 1000H atılır\nPUSH BX         ; Yığına 2000H atılır\nPOP AX          ; Yığının tepesindeki 2000H AX\'e döner\nPOP BX          ; Yığında kalan 1000H BX\'e döner',
    explanation: 'Üçüncü bir geçici yazmaç kullanmadan AX ve BX değerleri yığın yardımıyla takas edilir (Slayt 34-35).'
  },
  rule: 'POP CS YASAKTIR! CS yazmacı tek başına POP edilemez; IP ile koordineli değişmesi gerektiği için ancak RET (Far Return) ile geri yüklenebilir.'
};

export const COMMON_PITFALLS_GUIDE: CommonPitfallsGuide = {
  title: 'Hocanın Altın Kuralları ve Sık Yapılan Hatalar (Common Pitfalls - Slayt 38-39)',
  rules: [
    'Veri akışı sağdan sola (Kaynak → Hedef) okunur. MOV AX, BX ifadesinde BX kaynak, AX hedeftir.',
    'MOV Asla Taşımak Değildir, KOPYALAMAKTIR! Kaynak operandın içeriği ASLA değişmez, işlemden sonra da aynen kalır.',
    'Bellekten belleğe doğrudan transfer YASAKTIR! MOV [DI], [SI] geçersizdir (Tek istisna MOVS dizi komutudur).',
    'Segment yazmaçlarına doğrudan sabit (immediate) sayı yüklenemez (MOV DS, 1000H geçersizdir; önce genel yazmaca yüklenir).',
    'PUSH ve POP sayıları birebir eşleşmelidir! Eşleşmeyen her PUSH yığın işaretçisini (SP) kaydırır ve sonraki RET komutunun saçma bir adrese dönmesine yol açar.',
    'CS yazmacı asla POP veya MOV hedefi yapılamaz.'
  ],
  selectionTable: [
    { need: 'İki yazmaç arasında en hızlı kopyalama', reachFor: 'Register Addressing (Mode 1)' },
    { need: 'Sabit sayısal değer veya sabit katsayı yükleme', reachFor: 'Immediate Addressing (Mode 2)' },
    { need: 'Tek bir sabit program değişkenini okuma/yazma', reachFor: 'Direct Addressing (Mode 3)' },
    { need: 'Bir işaretçi (pointer) ile dizi elemanlarını gezme', reachFor: 'Register Indirect (Mode 4) veya Register Relative (Mode 6)' },
    { need: '2 boyutlu matris veya struct/tablo kayıtlarına erişim', reachFor: 'Base-Plus-Index (Mode 5) veya Base Relative-Plus-Index (Mode 7)' },
    { need: 'Aynı kod segmenti içinde döngü ve koşullu dallanma', reachFor: 'Relative Program Memory Addressing (JMP Short/Near)' },
    { need: 'Fonksiyon göstericisi (function pointer) veya switch/case tablosu', reachFor: 'Indirect Program Memory Addressing (JMP [BX] / JMP AX)' }
  ]
};

export const LECTURE_TERMINOLOGY: LectureTerminology = {
  title: 'Mikroişlemciler Dersi Terminoloji ve Kavram Rehberi (Weeks 1–5)',
  fdeCycle: {
    title: 'İşlemci Temel Döngüsü: Fetch - Decode - Execute (FDE Cycle - Week 1 & 5)',
    description: 'İşlemcinin elektrik verildiği andan kapanana kadar kesintisiz tekrarladığı temel 3 aşamalı çalışma mekanizmasıdır.',
    steps: [
      {
        step: '1. FETCH (Komut Getirme)',
        name: 'CS:IP ➔ Instruction Register (IR)',
        desc: 'İşlemci, CS:IP çiftinin işaret ettiği bellek adresindeki komut baytlarını veri yolu (Data Bus) üzerinden okur ve Komut Kuyruğuna (Prefetch Queue) alır. IP yazmacı okunan komutun boyutu kadar otomatik artırılır.'
      },
      {
        step: '2. DECODE (Komut Çözme)',
        name: 'Komut Çözücü (Instruction Decoder)',
        desc: 'Komutun işlem kodu (Opcode) ve operandları çözümlenir. Adresleme modu (register, immediate, bellek) belirlenir, gerekiyorsa bellek efektif adresi (EA = Base + Index + Disp) hesaplanır.'
      },
      {
        step: '3. EXECUTE (Yürütme)',
        name: 'ALU / Yazmaç Yürütme',
        desc: 'Aritmetik-Mantık Birimi (ALU) veya veri transfer birimi işlemi gerçekleştirir. Sonuç hedef yazmaca/belleğe yazılır ve durum bayrakları (FLAGS) donanımsal olarak güncellenir.'
      }
    ]
  },
  ciscVsRisc: {
    title: 'CISC (Intel x86) vs RISC (ARM) Mimari Karşılaştırması (Week 4, Slayt 35–41)',
    description: 'Hocanın slaytlarında vurguladığı iki temel komut seti mimarisinin farkları:',
    table: [
      {
        feature: 'Tasarım Felsefesi',
        cisc: 'Complex Instruction Set (Karmaşık Komut Seti) - Tek bir komutla çok sayıda alt donanım işlemi yapılır.',
        risc: 'Reduced Instruction Set (İndirgenmiş Komut Seti) - Basit, tek saat vuruşunda biten temel komutlar.'
      },
      {
        feature: 'Komut Boyutları',
        cisc: 'Değişken uzunlukta (1 bayt ile 15 bayt arası komutlar; örn. CLD 1 bayt, MOV [BX+DI+4], 1234H 6 bayt).',
        risc: 'Sabit uzunlukta (genellikle her komut standart 32-bit / 4 bayttır).'
      },
      {
        feature: 'Adresleme Modları',
        cisc: 'Çok zengin ve karmaşık bellek adresleme modları (7 temel veri modu, bellek operandı üzerinde doğrudan ADD/SUB).',
        risc: 'Çok az ve basit adresleme modu (Sadece Load/Store mimarisi; bellek operasyonları yalnızca LDR/STR ile yapılır).'
      },
      {
        feature: 'Yazmaç Sayısı',
        cisc: 'Daha az sayıda, özelleşmiş genel amaçlı yazmaçlar (8086: AX, BX, CX, DX, SI, DI, BP, SP).',
        risc: 'Çok geniş ve homojen yazmaç bankası (genellikle 32 veya daha fazla eşdeğer yazmaç).'
      },
      {
        feature: 'Bellek Erişimi',
        cisc: 'Aritmetik ve mantık komutları doğrudan bellek operandı alabilir (ADD AX, [BX]).',
        risc: 'Aritmetik komutlar belleğe doğrudan dokunamaz; veri önce yazmaca yüklenmeli, sonra işlenmelidir.'
      }
    ]
  },
  addressingComparison: {
    title: 'Adresleme Modları Avantaj & Dezavantaj Matrisi (Week 4, Slayt 18–34)',
    description: 'Hocanın Week 4 slaytlarındaki karşılaştırmalı adresleme modu analizi:',
    table: [
      {
        mode: '1. Register Addressing',
        syntax: 'MOV AX, BX',
        effectiveAddress: 'Yok (Yazmaç İçi)',
        advantages: 'En yüksek çalışma hızı; harici bellek erişimi ve veri yolu bekleme vuruşu yoktur; komut baytı kısadır.',
        disadvantages: 'Kullanılabilir yazmaç sayısı sınırlıdır (yalnızca 8 genel yazmaç).',
        typicalUse: 'Döngü içi kritik hesaplamalar, geçici ara sonuçlar.'
      },
      {
        mode: '2. Immediate Addressing',
        syntax: 'MOV AL, 22H',
        effectiveAddress: 'Komut İçinde',
        advantages: 'Sabit sayı komutun içinde gelir, ek bellek araması gerekmez; sabit katsayıları kurmak çok pratiktir.',
        disadvantages: 'Değer sabittir, çalışma anında değiştirilemez; hedef yazmacın bit sınırına bağlıdır.',
        typicalUse: 'Sayaç başlatma, maskeleme sabitleri, başlangıç ayarları.'
      },
      {
        mode: '3. Direct Addressing',
        syntax: 'MOV CX, [1234H] / MOV CX, START',
        effectiveAddress: 'DS * 16 + Disp16',
        advantages: 'Sabit adlı değişkenlere ve tekil bellek alanlarına erişmek çok basittir.',
        disadvantages: 'Statik adrestir, dinamik indeksleme yapılamaz; komut 3-4 bayt yer kaplar.',
        typicalUse: 'Genel global değişkenleri okuma ve yazma.'
      },
      {
        mode: '4. Register Indirect',
        syntax: 'MOV AX, [BX] / [SI] / [DI] / [BP]',
        effectiveAddress: 'Segment * 16 + [Yazmaç]',
        advantages: 'İşaretçi (pointer) tabanlı esneklik; çalışma anında adres yazmaçta hesaplanıp dinamik değiştirilebilir.',
        disadvantages: 'Adres yazmaca önceden yüklenmelidir; ek bellek okuma döngüsü harcar.',
        typicalUse: 'Dizi ve metin bloklarında işaretçi ile ilerleme.'
      },
      {
        mode: '5. Displacement / Relative',
        syntax: 'MOV AX, [BX+4] / TABLE[SI]',
        effectiveAddress: 'Segment * 16 + Reg + Disp',
        advantages: 'Dizi tabanı + eleman indeksi mantığına mükemmel uyar; kodun yeri değişse bile çalışır (relocatable).',
        disadvantages: 'Efektif adres için donanımsal toplama yapılır; komut boyutu yer değiştirme baytları kadar uzar.',
        typicalUse: 'Dizi elemanları (ARRAY[SI]), yığın çerçevesi yerel değişkenleri ([BP-4]).'
      }
    ]
  },
  terms: [
    {
      term: 'Opcode (İşlem Kodu)',
      category: 'core',
      tag: 'Temel Kavram',
      definition: 'İşlemciye hangi donanımsal işlemi gerçekleştireceğini söyleyen ikilik (binary) makine kodu baytıdır.',
      details: 'Örneğin 8086\'da NOP komutunun opkodu 90H, PUSH AX 50H, RET C3H\'tür. İnsanların okuduğu sembolik isimlere ise Mnemonic (komut kısaltması) denir.',
      slideRef: 'Week 1 Slayt 20 & Week 4 Slayt 4'
    },
    {
      term: 'Operand (İşlenen)',
      category: 'core',
      tag: 'Temel Kavram',
      definition: 'Komutun üzerinde işlem yaptığı veriler, yazmaçlar veya bellek adresleridir.',
      details: '8086 iki operandlı bir mimaridir: MOV Hedef, Kaynak. Sağdaki Kaynak (Source), soldaki Hedef (Destination) operanttır.',
      slideRef: 'Week 3 Slayt 5-6'
    },
    {
      term: 'TPA (Transient Program Area)',
      category: 'memory',
      tag: 'Bellek Haritası',
      definition: '00000H ile 9FFFFH adresleri arasındaki 640 KB\'lık ana bellek bölgesidir.',
      details: 'DOS işletim sistemi çekirdeği, aygıt sürücüleri ve çalıştırılan tüm kullanıcı programları ve verileri bu 640 KB\'lık alanda çalışır.',
      slideRef: 'Week 1 Slayt 12 & Week 2 Slayt 24'
    },
    {
      term: 'System Area (Sistem Bellek Alanı)',
      category: 'memory',
      tag: 'Bellek Haritası',
      definition: 'A0000H ile FFFFFH arasındaki 384 KB\'lık sistem donanım alanıdır.',
      details: 'A0000H - BFFFFH arası (128 KB) Video Ekran RAM\'ine ayrılmıştır. C0000H - FFFFFH arası (256 KB) ise ROM-BIOS ve genişleme kartı yazılımlarına ayrılmıştır.',
      slideRef: 'Week 1 Slayt 14-15'
    },
    {
      term: 'I/O Port Space (Giriş/Çıkış Alanı)',
      category: 'memory',
      tag: 'Port Mimarisi',
      definition: '0000H ile FFFFH arasında toplam 64K (65,536 adet) port adresinden oluşan, ana bellekten bağımsız donanım port alanıdır.',
      details: 'Yalnızca IN ve OUT komutları ile erişilir. 00H-FFH arası sabit (fixed) port, 0000H-FFFFH arası DX ile değişken (variable) port adreslemedir.',
      slideRef: 'Week 1 Slayt 17-18 & Week 4 Slayt 24-25'
    },
    {
      term: 'Data Widths: Byte, Word, Dword, Qword',
      category: 'architecture',
      tag: 'Veri Genişlikleri',
      definition: '8086 ve modern x86 işlemcilerin desteklediği temel veri boyutları hiyerarşisidir.',
      details: 'Byte = 8-bit (AL, BL..), Word = 16-bit / 2 bayt (AX, BX..), Doubleword (Dword) = 32-bit / 4 bayt (EAX..), Quadword (Qword) = 64-bit / 8 bayt (RAX..).',
      slideRef: 'Week 1 Slayt 24 & Week 2 Slayt 6-7'
    },
    {
      term: 'PSP (Program Segment Prefix)',
      category: 'memory',
      tag: 'DOS Mimarisi',
      definition: 'DOS işletim sisteminin .COM programlarının önüne eklediği 256 baytlık (100h) program tanımlama başlığıdır.',
      details: 'Bu 256 baytlık alanda komut satırı argümanları, dosya tanıtıcıları ve çevre parametreleri bulunur. Bu nedenle programlar ORG 100H ile başlar ve giriş noktası CS:0100h olur.',
      slideRef: 'Week 1 Slayt 12 & Code Examples'
    },
    {
      term: 'Reset Vector (Donanımsal Reset Vektörü)',
      category: 'architecture',
      tag: 'Donanım Başlangıcı',
      definition: '8086 mikroişlemcisine elektrik ilk verildiğinde veya RESET pinine sinyal geldiğinde, donanımın atladığı ilk adrestir.',
      details: 'Donanımsal olarak CS = FFFFh ve IP = 0000h kurulur. Fiziksel adres FFFF0h\'dır ve doğrudan anakart üzerindeki ROM-BIOS başlangıç komutunu işaret eder.',
      slideRef: 'Week 2 Slayt 36'
    },
    {
      term: 'Carry Flag (CF) vs. Overflow Flag (OF)',
      category: 'arithmetic',
      tag: 'Bayrak Kuralları',
      definition: 'Hocanın en çok sorduğu bayrak ayrımı: CF işaretsiz taşmadır; OF ise işaretli taşmadır.',
      details: 'CF (Carry): En yüksek bitten (MSB) elde veya borç çıkarsa 1 olur (İşaretsiz sayılar için). OF (Overflow): İki pozitif sayının toplamı negatif çıkarsa veya iki negatifin toplamı pozitif çıkarsa (işaret bozulursa) 1 olur.',
      slideRef: 'Week 2 Slayt 18 & Week 5 Slayt 6'
    },
    {
      term: 'INC ve DEC Carry Kuralı',
      category: 'arithmetic',
      tag: 'Altın Kural',
      definition: 'INC ve DEC komutları Carry Flag (CF) bayrağını ASLA etkilemez!',
      details: 'Bu mimari özellik döngü sayaçlarında çok kelimeli eldeli toplama/çıkarma (ADC/SBB) zincirinin bozulmadan devam edebilmesini sağlar.',
      slideRef: 'Week 5 Slayt 8, 14'
    },
    {
      term: 'Sign Extension (İşaret Genişletme: CBW / CWD)',
      category: 'arithmetic',
      tag: 'Aritmetik Dönüşüm',
      definition: 'İşaretli bir sayının değerini bozmadan daha büyük bir yazmaca kopyalamak için işaret bitinin (MSB) tüm üst bitlere yayılmasıdır.',
      details: 'CBW: AL işaretini AH\'ye yayarak AX oluşturur. CWD: AX işaretini DX\'e yayarak DX:AX çiftini oluşturur. Özellikle 16-bit IDIV öncesinde CWD zorunludur!',
      slideRef: 'Week 4 Slayt 31 & Week 5 Slayt 26-27'
    },
    {
      term: 'Divide Error / Overflow (INT 0 Kesmesi)',
      category: 'arithmetic',
      tag: 'İşlemci Hatası',
      definition: 'Bölen sıfır olduğunda veya bölüm (quotient) hedef yazmacın sınırlarını aştığında işlemcinin ürettiği donanımsal hata kesmesidir.',
      details: 'Örneğin 8-bit bölmede (AX / BL) bölüm 255\'i (FFh) aşarsa, sonuç AL yazmacına sığmayacağı için işlemci donanımsal INT 0 üretir.',
      slideRef: 'Week 5 Slayt 23-24'
    },
    {
      term: 'Bit Maskeleme (Bit Masking - AND)',
      category: 'arithmetic',
      tag: 'Mantık Operasyonları',
      definition: 'Bir yazmaçtaki belirli bitleri sıfırlayıp (maskeleyip) sadece istenen bitleri süzme işlemidir.',
      details: 'Örneğin ASCII \'5\' karakterinin (35H = 0011 0101b) sayısal karşılığını elde etmek için 0FH ile AND yapılır: 35H AND 0FH = 05H.',
      slideRef: 'Week 5 Slayt 29-30'
    },
    {
      term: 'Bit Kurma (Bit Setting - OR)',
      category: 'arithmetic',
      tag: 'Mantık Operasyonları',
      definition: 'Diğer bitleri değiştirmeden yalnızca seçilen bitleri 1 yapma işlemidir.',
      details: 'Örneğin sayısal 5 değerini ekrana basılacak ASCII \'5\' karakterine çevirmek için: 05H OR 30H = 35H (\'5\').',
      slideRef: 'Week 5 Slayt 31'
    },
    {
      term: 'Hızlı Yazmaç Sıfırlama (XOR reg, reg)',
      category: 'arithmetic',
      tag: 'Optimizasyon',
      definition: 'Bir yazmacı MOV reg, 0 yerine XOR reg, reg ile sıfırlama tekniğidir.',
      details: 'Bir sayının kendisiyle XOR\'u daima 0 verir. XOR AX, AX sadece 2 bayt makine kodu üretir ve MOV AX, 0\'a (3 bayt) göre daha hızlıdır.',
      slideRef: 'Week 5 Slayt 32'
    },
    {
      term: 'Tahribatsız Test (Non-destructive: CMP & TEST)',
      category: 'arithmetic',
      tag: 'Bayrak Güncelleme',
      definition: 'Hedef operanttaki veriyi değiştirmeden sadece FLAGS kaydını güncelleyen komutlardır.',
      details: 'CMP çıkarma (SUB) yapar ama sonucu kaydetmez; TEST mantıksal VE (AND) yapar ama sonucu kaydetmez. Her ikisi de sadece bayrakları kurarak koşullu atlamayı (Jcc) hazırlar.',
      slideRef: 'Week 5 Slayt 16, 34'
    },
    {
      term: 'Autoincrement vs. Autodecrement (CLD / STD)',
      category: 'strings',
      tag: 'Dizi İlerleme Yönü',
      definition: 'Dizi komutlarında (MOVS, LODS, STOS, CMPS, SCAS) bellek göstericilerinin (SI ve DI) otomatik artış veya azalış yönüdür.',
      details: 'CLD (Clear Direction Flag): DF = 0 yapar, SI ve DI otomatik artar (İleri / Artan Adres). STD (Set Direction Flag): DF = 1 yapar, SI ve DI otomatik azalır (Geri / Azalan Adres).',
      slideRef: 'Week 4 Slayt 27'
    },
    {
      term: 'Tekrar Önekleri (Repeat Prefixes: REP, REPE/REPZ, REPNE/REPNZ)',
      category: 'strings',
      tag: 'Dizi Döngüleri',
      definition: 'Dizi komutlarının başına eklenerek CX sayacı 0 olana kadar komutu donanımsal olarak tekrarlayan öneklerdir.',
      details: 'REP: Koşulsuz tekrar (MOVS, STOS). REPE / REPZ: Karakterler eşit olduğu (ZF=1) sürece tekrar (CMPS, SCAS). REPNE / REPNZ: Karakterler farklı olduğu (ZF=0) sürece tekrar.',
      slideRef: 'Week 4 Slayt 28-29'
    },
    {
      term: 'Table Lookup Translation (Tablo Çevirisi - XLATB)',
      category: 'strings',
      tag: 'Karakter Dönüşümü',
      definition: '256 elemanlı bir tablodan tek vuruşta indeksli veri okuyan özel komuttur: AL ← [DS:BX + AL].',
      details: 'BX tablonun başlangıç ofsetini, AL aranacak indeksi tutar. ASCII-EBCDIC çevirisi, küçük harfi büyük harfe dönüştürme ve 7 segment LED gösterge kodlarında çok hızlıdır.',
      slideRef: 'Week 4 Slayt 33-34'
    }
  ]
};
