/**
 * statePredictionData.ts
 * 
 * Doç. Dr. Mehmet Akif Çifci'nin ders slaytları, laboratuvar notları ve tahta çizimlerine (Excalidraw)
 * dayalı, 8086 AssemblySim'in HER BİR AŞAMASI (Milestone 1 - 11) için interaktif
 * Durum Tahmin (State-Prediction) Alıştırmaları.
 * 
 * Öğrenciler koda bakarak yazmaçların (Registers), bayrakların (Flags: CF, ZF, SF, OF, PF, AF)
 * ve belleğin (Memory / Stack) işlem sonrasındaki kesin değerlerini tahmin edip girerler.
 */

export interface PredictedRegister {
  name: string; // e.g. "AX", "BX", "CX", "DX", "SP", "SI", "DI", "PA"
  expected: string; // e.g. "0045H", "15200H"
  acceptedValues?: string[]; // e.g. ["0045H", "0045", "45H", "45", "0x0045", "0x45"]
  description: string; // Adım adım hoca açıklaması
}

export interface PredictedFlag {
  name: 'CF' | 'ZF' | 'SF' | 'OF' | 'PF' | 'AF' | 'DF';
  expected: '0' | '1';
  bitDerivation: string; // Bit seviyesinde neden 0 veya 1 olduğunun matematiksel ispatı
}

export interface PredictedMemory {
  address: string; // e.g. "[0200H]", "[SP]", "Top of Stack"
  expected: string; // e.g. "34H", "1234H"
  acceptedValues?: string[];
  explanation: string;
}

export interface StatePredictionExercise {
  id: string;
  milestoneId: string;
  stageNumber: number;
  title: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  difficultyLabel: string;
  scenario: string;
  codeSnippet: string;
  initialState: {
    registers?: Record<string, string>;
    flags?: Record<string, string>;
    memory?: Record<string, string>;
  };
  registersToPredict: PredictedRegister[];
  flagsToPredict: PredictedFlag[];
  memoryToPredict?: PredictedMemory[];
  hocaGradingNotes: string; // Hocanın sınavda dikkat ettiği püf noktası ve puan kırma kriteri
}

export class PredictionStoreClass {
  private userInputs: Record<string, Record<string, string>> = {};
  private gradedResults: Record<string, any> = {};

  constructor() {
    try {
      const saved = localStorage.getItem('assemblysim_prediction_store');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.userInputs = parsed.userInputs || {};
        this.gradedResults = parsed.gradedResults || {};
      }
    } catch (_) {}
  }

  private save(): void {
    try {
      localStorage.setItem('assemblysim_prediction_store', JSON.stringify({
        userInputs: this.userInputs,
        gradedResults: this.gradedResults
      }));
    } catch (_) {}
  }

  getUserInput(exId: string, field: string): string {
    return this.userInputs[exId]?.[field] || '';
  }

  setUserInput(exId: string, field: string, val: string): void {
    if (!this.userInputs[exId]) this.userInputs[exId] = {};
    this.userInputs[exId][field] = val;
    this.save();
  }

  getGradedResult(exId: string): any {
    return this.gradedResults[exId];
  }

  setGradedResult(exId: string, res: any): void {
    this.gradedResults[exId] = res;
    this.save();
  }
}

export const PredictionStore = new PredictionStoreClass();

export const MILESTONE_STATE_PREDICTIONS: Record<string, StatePredictionExercise[]> = {
  // =========================================================================
  // AŞAMA 1: CPU Mimarisi, 20-Bit Adresleme, Little-Endian & Bayrak Temelleri
  // =========================================================================
  "milestone-1": [
    {
      id: "pred-m1-addressing",
      milestoneId: "milestone-1",
      stageNumber: 1,
      title: "Alıştırma 1.1: 20-Bit Fiziksel Adres & Little-Endian Bellek Tahmini",
      difficulty: "kolay",
      difficultyLabel: "🟢 Aşama 1 Tahmini: Fiziksel Adres ve Bellek",
      scenario: "İşlemci DS = 1200H ve SI = 0340H değerlerine sahiptir. Belleğin bu adresine 16-bitlik 5678H kelimesi Little-Endian kuralıyla yazılacaktır. Fiziksel adresi ve bellek baytlarını tahmin edin.",
      codeSnippet: "; DS = 1200H, SI = 0340H\n; Yazılacak 16-bit veri: 5678H\n; DS:SI adresinin 20-bit Fiziksel Adresini (PA)\n; ve bellekteki bayt sırasını hesaplayınız.",
      initialState: {
        registers: { "DS": "1200H", "SI": "0340H" }
      },
      registersToPredict: [
        {
          name: "PA",
          expected: "12340H",
          acceptedValues: ["12340H", "12340", "0x12340", "12340h"],
          description: "PA = (DS × 10H) + SI = (1200H × 10H) + 0340H = 12000H + 0340H = 12340H."
        }
      ],
      flagsToPredict: [
        {
          name: "ZF",
          expected: "0",
          bitDerivation: "Adres hesaplama (BIU birimi) bayrakları etkilemez; bayraklar ALU işlemlerinde kurulur."
        },
        {
          name: "CF",
          expected: "0",
          bitDerivation: "Fiziksel adres üretiminde elde bayrağı etkilenmez."
        }
      ],
      memoryToPredict: [
        {
          address: "[12340H] (Düşük Bayt)",
          expected: "78H",
          acceptedValues: ["78H", "78", "0x78", "78h"],
          explanation: "Little-Endian kuralı: 16-bit 5678H kelimesinin Düşük Baytı (Low Byte = 78H) düşük adrese yazılır."
        },
        {
          address: "[12341H] (Yüksek Bayt)",
          expected: "56H",
          acceptedValues: ["56H", "56", "0x56", "56h"],
          explanation: "Little-Endian kuralı: Yüksek Bayt (High Byte = 56H) bir sonraki yüksek adrese yazılır."
        }
      ],
      hocaGradingNotes: "Hoca uyarısı: Segment 10H ile çarpıldığında bir sıfır eklenir. Little-Endian kuralında 56H ile 78H'ın yerini ters yazan öğrenci tam sıfır alır!"
    },
    {
      id: "pred-m1-overlap",
      milestoneId: "milestone-1",
      stageNumber: 1,
      title: "Alıştırma 1.2: Çakışan (Overlapping) Segmentler ve Fiziksel Eşitlik",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 1 Sınav Sorusu: Segment Çakışması",
      scenario: "Segment 1: CS = 2000H, IP = 0020H. Segment 2: CS = 2001H, IP = 0010H. Her iki işaretçinin gösterdiği 20-bit fiziksel adresi hesaplayın.",
      codeSnippet: "; Durum A: CS = 2000H, IP = 0020H\n; Durum B: CS = 2001H, IP = 0010H\n; Her iki durum aynı bellek hücresine mi işaret eder?",
      initialState: {
        registers: { "CS_A": "2000H", "IP_A": "0020H", "CS_B": "2001H", "IP_B": "0010H" }
      },
      registersToPredict: [
        {
          name: "PA_A",
          expected: "20020H",
          acceptedValues: ["20020H", "20020", "0x20020", "20020h"],
          description: "PA_A = 20000H + 0020H = 20020H."
        },
        {
          name: "PA_B",
          expected: "20020H",
          acceptedValues: ["20020H", "20020", "0x20020", "20020h"],
          description: "PA_B = 20010H + 0010H = 20020H. Segment 1 arttığında adres 16 bayt kayar; böylece iki farklı çift aynı fiziksel baytı adresler!"
        }
      ],
      flagsToPredict: [],
      hocaGradingNotes: "Hocanın Week 2 slayt sorusu: 8086 segmentleri 16 baytta bir başlayabildiği için ardışık segmentler iç içe geçer (overlap). Sonuçlar özdeştir."
    }
  ],

  // =========================================================================
  // AŞAMA 2: Veri Transferi (MOV, XCHG, LEA) — Bayrak Değişmezliği Kuralı!
  // =========================================================================
  "milestone-2": [
    {
      id: "pred-m2-mov-noflags",
      milestoneId: "milestone-2",
      stageNumber: 2,
      title: "Alıştırma 2.1: MOV ve XCHG'nin Bayraklar Üzerindeki Etkisi (Altın Kural)",
      difficulty: "kolay",
      difficultyLabel: "🟢 Aşama 2 Tahmini: Veri Hareketi ve Bayraklar",
      scenario: "Önceden sıfır bayrağı ZF = 1 ve elde bayrağı CF = 1 iken aşağıdaki MOV ve XCHG komutları yürütülüyor. Sonuç yazmaçlarını ve bayrak durumlarını tahmin edin.",
      codeSnippet: "; Baslangic: ZF = 1, CF = 1, AX = 0000H, BX = 1234H\nMOV AX, 0000H\nXCHG AX, BX\nMOV CX, 5678H",
      initialState: {
        registers: { "AX": "0000H", "BX": "1234H", "CX": "0000H" },
        flags: { "ZF": "1", "CF": "1" }
      },
      registersToPredict: [
        {
          name: "AX",
          expected: "1234H",
          acceptedValues: ["1234H", "1234", "0x1234", "1234h"],
          description: "XCHG AX, BX sonrası AX, BX'in eski değeri olan 1234H'ı alır."
        },
        {
          name: "BX",
          expected: "0000H",
          acceptedValues: ["0000H", "0000", "0", "0x0000", "0h"],
          description: "XCHG sonrası BX, AX'in eski değeri olan 0000H'ı alır."
        },
        {
          name: "CX",
          expected: "5678H",
          acceptedValues: ["5678H", "5678", "0x5678", "5678h"],
          description: "MOV CX, 5678H CX yazmacına 5678H yükler."
        }
      ],
      flagsToPredict: [
        {
          name: "ZF",
          expected: "1",
          bitDerivation: "🚨 HOCANIN ALTIN KURALI: MOV ve XCHG komutları bayrakları ASLA DEĞİŞTİRMEZ! BX sıfır olsa bile ZF=1 başlangıç değerini korur."
        },
        {
          name: "CF",
          expected: "1",
          bitDerivation: "MOV ve XCHG komutları elde bayrağını (CF) etkilemez; CF=1 kalır."
        }
      ],
      hocaGradingNotes: "En klasik sınav tuzağı! Öğrenci 'BX sıfır oldu o halde ZF=1 oldu' veya 'yeni veri geldi ZF=0 oldu' derse doğrudan puan kırılır. MOV ve XCHG donanım gereği ALU bayraklarını tetiklemez."
    },
    {
      id: "pred-m2-lea-offset",
      milestoneId: "milestone-2",
      stageNumber: 2,
      title: "Alıştırma 2.2: LEA vs MOV ile Efektif Adres (EA) Hesabı",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 2 Tahmini: LEA Adres Yükleme",
      scenario: "BX = 0100H, DI = 0020H ve [0124H] bellek hücresinde 9999H kelimesi saklıdır. Aşağıdaki LEA ve MOV komutları sonrasında SI ve AX değerlerini tahmin ediniz.",
      codeSnippet: "MOV BX, 0100H\nMOV DI, 0020H\nLEA SI, [BX + DI + 4]\nMOV AX, [BX + DI + 4]   ; [0124H] hücresinde 9999H vardır",
      initialState: {
        registers: { "BX": "0100H", "DI": "0020H" },
        memory: { "[0124H]": "9999H" }
      },
      registersToPredict: [
        {
          name: "SI",
          expected: "0124H",
          acceptedValues: ["0124H", "0124", "0x0124", "124H", "124"],
          description: "LEA (Load Effective Address) parantez içindeki adresin kendisini hesaplar: 0100H + 0020H + 4 = 0124H. Belleğe erişmez!"
        },
        {
          name: "AX",
          expected: "9999H",
          acceptedValues: ["9999H", "9999", "0x9999", "9999h"],
          description: "MOV AX, [...] parantez içindeki adresin İÇERİĞİNİ (9999H) okur."
        }
      ],
      flagsToPredict: [
        {
          name: "ZF",
          expected: "0",
          bitDerivation: "LEA ve MOV bayrakları değiştirmez."
        }
      ],
      hocaGradingNotes: "Hoca ayrımı: LEA adresi yükler (pointer), MOV ise o adresteki veriyi çeker. Sınavda bu ikisi sıkça sorulur."
    }
  ],

  // =========================================================================
  // AŞAMA 3: Aritmetik (ADD, ADC, SUB, SBB, INC, DEC, CMP, NEG) — Bayrak Matematiği!
  // =========================================================================
  "milestone-3": [
    {
      id: "pred-m3-add-f5-0b",
      milestoneId: "milestone-3",
      stageNumber: 3,
      title: "Alıştırma 3.1: Hocanın Slayt Sorusu (w11.pdf) — F5H + 0BH Bayrak Türetimi",
      difficulty: "orta",
      difficultyLabel: "🟡 Hafta 5 / w11.pdf Slayt Sorusu: Tam Bayrak Analizi",
      scenario: "Hocanın ders notlarında birebir yer alan soru: AL = F5H ve BL = 0BH sayıları toplanıyor (ADD AL, BL). 8-bitlik ikili toplama sonucunu ve 6 durum bayrağının (CF, ZF, AF, PF, SF, OF) tamamını bit seviyesinde türetin.",
      codeSnippet: "MOV AL, 0F5H\nMOV BL, 00BH\nADD AL, BL",
      initialState: {
        registers: { "AL": "F5H", "BL": "0BH" }
      },
      registersToPredict: [
        {
          name: "AL",
          expected: "00H",
          acceptedValues: ["00H", "00", "0", "0x00", "0h"],
          description: "F5H (1111 0101b) + 0BH (0000 1011b) = 100H. 8-bit AL akümülatöründe yalnızca düşük 8 bit kalır: AL = 00H."
        }
      ],
      flagsToPredict: [
        {
          name: "CF",
          expected: "1",
          bitDerivation: "Bit 7'den dışarı elde (carry) taştığı için (100H > FFH), CF = 1."
        },
        {
          name: "ZF",
          expected: "1",
          bitDerivation: "AL'deki 8-bitlik nihai sonuç 00H olduğu için Sıfır Bayrağı ZF = 1."
        },
        {
          name: "AF",
          expected: "1",
          bitDerivation: "Bit 3'ten Bit 4'e alt nibble eldesi geçti: 0101b + 1011b = 10000b (elde=1), dolayısıyla AF = 1."
        },
        {
          name: "PF",
          expected: "1",
          bitDerivation: "AL = 00H (0000 0000b). 1 olan bitlerin sayısı 0'dır (0 çift sayıdır!). Çift sayıda 1 biti olduğu için PF = 1."
        },
        {
          name: "SF",
          expected: "0",
          bitDerivation: "En yüksek anlamlı bit (MSB, bit 7) 0 olduğu için İşaret Bayrağı SF = 0."
        },
        {
          name: "OF",
          expected: "0",
          bitDerivation: "İşaretli taşma formülü: Negatif (-11) + Pozitif (+11) = 0. İki zıt işaretli sayının toplamında donanımsal taşma ASLA oluşamaz (OF = 0)."
        }
      ],
      hocaGradingNotes: "Hoca bu soruda özellikle PF=1 ve AF=1 açıklamasını arar! '0 sıfır tane 1 içerir, 0 çifttir bu yüzden PF=1' yazmayan öğrencilerden puan kırar."
    },
    {
      id: "pred-m3-sub-hardware",
      milestoneId: "milestone-3",
      stageNumber: 3,
      title: "Alıştırma 3.2: Donanımsal 3 Adımlı Çıkarma (SUB AL, BH) ve Borç Analizi",
      difficulty: "zor",
      difficultyLabel: "🔴 w11.pdf Çıkarma Algoritması: 22H - 44H",
      scenario: "AL = 22H ve BH = 44H verilmiştir. SUB AL, BH işlemi yürütülür. 8086 donanımının 3 adımlı çıkarma algoritmasını uygulayarak AL ve bayrakları tahmin edin.",
      codeSnippet: "MOV AL, 22H\nMOV BH, 44H\nSUB AL, BH",
      initialState: {
        registers: { "AL": "22H", "BH": "44H" }
      },
      registersToPredict: [
        {
          name: "AL",
          expected: "DEH",
          acceptedValues: ["DEH", "DE", "0xDE", "deh"],
          description: "22H - 44H = -22H = 1101 1110b = DEH (İki'nin tümleyeni)."
        }
      ],
      flagsToPredict: [
        {
          name: "CF",
          expected: "1",
          bitDerivation: "Donanım 3 adımı: 1) 44H'ın 2'nin tümleyeni = BCH. 2) Topla: 22H + BCH = DEH (elde çıkmadı, C_out=0). 3) Eldeyi TERSLE: CF = NOT(0) = 1 (Borç alındı!)."
        },
        {
          name: "ZF",
          expected: "0",
          bitDerivation: "Sonuç DEH ≠ 0 olduğu için ZF = 0."
        },
        {
          name: "SF",
          expected: "1",
          bitDerivation: "DEH'in 7. biti (MSB) 1'dir. Negatif sayı, SF = 1."
        },
        {
          name: "PF",
          expected: "1",
          bitDerivation: "DEH = 1101 1110b. İçinde 6 adet '1' biti vardır. 6 çifttir, PF = 1."
        },
        {
          name: "OF",
          expected: "0",
          bitDerivation: "+34 - (+68) = -34. Sonuç -128 ile +127 aralığında temsil edilebildiği için taşma yoktur (OF = 0)."
        }
      ],
      hocaGradingNotes: "Hoca notu: '8086 çıkarma yaparken donanımsal olarak çıkarıcı devre kullanmaz; 2'nin tümleyenini alıp toplar ve carry bitini tersler (NOT Carry)!' Bunu bilen öğrenci tam puan alır."
    },
    {
      id: "pred-m3-inc-cf-trap",
      milestoneId: "milestone-3",
      stageNumber: 3,
      title: "Alıştırma 3.3: INC ve DEC Komutunun Elde Bayrağı (CF) Tuzağı",
      difficulty: "orta",
      difficultyLabel: "🟡 Sınav Klasiği: INC Komutu ve CF Korunumu",
      scenario: "CF = 1 iken AL = 0FFH değeri INC AL komutu ile artırılıyor. AL yazmacını, ZF ve CF bayraklarını tahmin edin.",
      codeSnippet: "; Baslangic: CF = 1\nMOV AL, 0FFH\nINC AL",
      initialState: {
        registers: { "AL": "FFH" },
        flags: { "CF": "1" }
      },
      registersToPredict: [
        {
          name: "AL",
          expected: "00H",
          acceptedValues: ["00H", "00", "0", "0x00", "0h"],
          description: "0FFH + 1 = 100H -> 8-bit taşma ile AL = 00H olur."
        }
      ],
      flagsToPredict: [
        {
          name: "ZF",
          expected: "1",
          bitDerivation: "Sonuç 00H olduğu için ZF = 1 kurulur."
        },
        {
          name: "CF",
          expected: "1",
          bitDerivation: "🚨 HOCANIN EN BÜYÜK SINAV TUZAĞI: INC ve DEC komutları CARRY BAYRAĞINI (CF) ASLA DEĞİŞTİRMEZ! 0FFH'den 00H'a taşma olsa bile CF başlangıçtaki 1 değerini korur!"
        }
      ],
      hocaGradingNotes: "Vize sınavında öğrencilerin en az yarısı burada 'taşma oldu CF=1 oldu' veya 'sıfırlandı CF=0 oldu' der. Doğru cevap: INC komutu çoklu kelime döngülerinde eldeyi (ADC zincirini) bozmamak için donanımsal olarak CF'yi DEĞİŞTİRMEZ!"
    }
  ],

  // =========================================================================
  // AŞAMA 4: Mantık & Bit Kaydırma (AND, OR, XOR, TEST, NOT, SHL, SHR, SAR, RCL)
  // =========================================================================
  "milestone-4": [
    {
      id: "pred-m4-logic-flags",
      milestoneId: "milestone-4",
      stageNumber: 4,
      title: "Alıştırma 4.1: Mantıksal Komutlarda CF ve OF Sıfırlanma Kuralı",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 4 Tahmini: Mantık ve Bayraklar",
      scenario: "Önceden CF = 1 ve OF = 1 kurulmuşken BL = 35H verisine AND BL, 0FH maskelemesi uygulanıyor. BL ve bayrakları tahmin edin.",
      codeSnippet: "; Baslangic: CF = 1, OF = 1\nMOV BL, 35H\nAND BL, 0FH",
      initialState: {
        registers: { "BL": "35H" },
        flags: { "CF": "1", "OF": "1" }
      },
      registersToPredict: [
        {
          name: "BL",
          expected: "05H",
          acceptedValues: ["05H", "05", "5", "0x05", "5H"],
          description: "35H (0011 0101b) AND 0FH (0000 1111b) = 0000 0101b = 05H."
        }
      ],
      flagsToPredict: [
        {
          name: "CF",
          expected: "0",
          bitDerivation: "🚨 DONANIMSAL KURAL: AND, OR, XOR ve TEST komutları Carry Flag (CF) ve Overflow Flag (OF) bayraklarını DAİMA SIFIRLAR (CF=0, OF=0)."
        },
        {
          name: "OF",
          expected: "0",
          bitDerivation: "Mantıksal işlemlerde taşma kavramı olmadığı için donanım OF'yi daima 0 yapar."
        },
        {
          name: "ZF",
          expected: "0",
          bitDerivation: "Sonuç 05H ≠ 0 olduğu için ZF = 0."
        },
        {
          name: "PF",
          expected: "1",
          bitDerivation: "05H = 0000 0101b. İki adet 1 biti vardır (2 çifttir), PF = 1."
        }
      ],
      hocaGradingNotes: "Hoca sorusu: 'Hangi komutlar CF ve OF'yi otomatik olarak temizler?' Cevap: AND, OR, XOR, TEST."
    },
    {
      id: "pred-m4-shift-sar-cf",
      milestoneId: "milestone-4",
      stageNumber: 4,
      title: "Alıştırma 4.2: Aritmetik Sağa Kaydırma (SAR) ve İşaret Koruması",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 4 Tahmini: SAR vs SHR ve CF",
      scenario: "AL = 0F0H (-16) negatif sayısı 1 bit sağa aritmetik kaydırılıyor (SAR AL, 1). AL yazmacını ve CF bayrağını tahmin edin.",
      codeSnippet: "MOV AL, 0F0H\nSAR AL, 1",
      initialState: {
        registers: { "AL": "F0H" }
      },
      registersToPredict: [
        {
          name: "AL",
          expected: "F8H",
          acceptedValues: ["F8H", "F8", "0xF8", "f8h"],
          description: "SAR (Shift Arithmetic Right) en sol biti (MSB=1) kopyalayarak korur: 1111 0000b -> 1111 1000b = F8H (-8)."
        }
      ],
      flagsToPredict: [
        {
          name: "CF",
          expected: "0",
          bitDerivation: "Sağdan dışarı düşen en düşük bit (bit 0 = 0) Carry Flag içine girer: CF = 0."
        },
        {
          name: "SF",
          expected: "1",
          bitDerivation: "Yeni MSB biti 1 kaldığı için sayı negatiftir, SF = 1."
        }
      ],
      hocaGradingNotes: "Eğer SHR kullanılsaydı AL = 78H olurdu ve negatiflik bozulurdu. SAR işaret bitini çoğaltır."
    }
  ],

  // =========================================================================
  // AŞAMA 5: Karar & Döngüler (CMP, JE, JA, JB, JG, JL, LOOP, JCXZ)
  // =========================================================================
  "milestone-5": [
    {
      id: "pred-m5-loop-trace",
      milestoneId: "milestone-5",
      stageNumber: 5,
      title: "Alıştırma 5.1: Tahta Örneği (Week 6 Excalidraw) — Loop Trace Tablosu",
      difficulty: "zor",
      difficultyLabel: "🔴 Hocanın Derste Tahtaya Çizdiği Döngü İzleme Tablosu",
      scenario: "Hocanın Week 6 tahta çizimindeki kod: CX = 4, AX = 0, BX = 2. DÖNGÜ: ADD AX, BX; ADD BX, 2; LOOP DONGU. Döngü bittiğinde AX, BX, CX ve ZF değerlerini tahmin edin.",
      codeSnippet: "MOV CX, 4\nMOV AX, 0\nMOV BX, 2\n\nDONGU:\nADD AX, BX\nADD BX, 2\nLOOP DONGU",
      initialState: {
        registers: { "CX": "4", "AX": "0", "BX": "2" }
      },
      registersToPredict: [
        {
          name: "AX",
          expected: "14H",
          acceptedValues: ["14H", "14", "20", "0x14", "14h"],
          description: "Adım 1: AX=0+2=2. Adım 2: AX=2+4=6. Adım 3: AX=6+6=12. Adım 4: AX=12+8=20 (Onluk 20 = Hex 14H)."
        },
        {
          name: "BX",
          expected: "0AH",
          acceptedValues: ["0AH", "0A", "10", "0x0A", "0ah"],
          description: "BX her adımda 2 artar: 2 -> 4 -> 6 -> 8 -> 10 (Onluk 10 = Hex 0AH)."
        },
        {
          name: "CX",
          expected: "0000H",
          acceptedValues: ["0000H", "0000", "0", "0x0000", "0h"],
          description: "Döngü 4 kez döndükten sonra CX sıfırlanır ve döngüden çıkılır."
        }
      ],
      flagsToPredict: [
        {
          name: "ZF",
          expected: "0",
          bitDerivation: "🚨 HOCANIN EN BÜYÜK KURALI: LOOP komutu bayrakları ASLA DEĞİŞTİRMEZ! En son çalışan ADD BX, 2 komutunda BX=10 olduğu için ZF = 0 kalmıştır. CX=0 olsa bile LOOP bayrağı 1 yapmaz!"
        }
      ],
      hocaGradingNotes: "Hoca Excalidraw çiziminde vurgulamıştır: 'Döngü çıkışında ZF=0'dır çünkü LOOP komutu bayrakları etkilemez!' Bu kuralı bilmeyen herkes sınavda ZF=1 yazar."
    },
    {
      id: "pred-m5-cmp-signed-unsigned",
      milestoneId: "milestone-5",
      stageNumber: 5,
      title: "Alıştırma 5.2: CMP ile JA vs JG Atlama Tahmini (İşaretsiz vs İşaretli)",
      difficulty: "orta",
      difficultyLabel: "🟡 Sınav Tuzağı: JA mı JG mi Atlar?",
      scenario: "AX = 0005H (+5) ve BX = 0FFF6H (-10 veya 65526). CMP AX, BX komutundan sonra JA ve JG komutlarının atlayıp atlamayacağını (1=Atlar, 0=Atlamaz) belirleyin.",
      codeSnippet: "MOV AX, 0005H\nMOV BX, 0FFF6H   ; Isaretli: -10, Isaretsiz: 65526\nCMP AX, BX",
      initialState: {
        registers: { "AX": "0005H", "BX": "FFF6H" }
      },
      registersToPredict: [
        {
          name: "AX",
          expected: "0005H",
          acceptedValues: ["0005H", "0005", "5", "0x0005", "5h"],
          description: "CMP çıkarma yapar ama hedefi değiştirmez; AX aynen 5 kalır."
        }
      ],
      flagsToPredict: [
        {
          name: "CF",
          expected: "1",
          bitDerivation: "İşaretsiz olarak 5 < 65526 olduğu için küçükten büyük çıktı, borç alındı: CF = 1."
        },
        {
          name: "SF",
          expected: "0",
          bitDerivation: "5 - (-10) = +15. Sonuç pozitif, SF = 0."
        },
        {
          name: "OF",
          expected: "0",
          bitDerivation: "Pozitif - Negatif = Pozitif. +15 16-bit sınırları içindedir, taşma yok (OF = 0)."
        }
      ],
      hocaGradingNotes: "Sonuç: JG POZITIF (Atlar, çünkü +5 > -10). JA AX_BUYUK (ATLAMAZ! Çünkü işaretsiz olarak 5 < 65526, CF=1). İşaretsiz/işaretli ayrımını soran hoca klasiğidir."
    }
  ],

  // =========================================================================
  // AŞAMA 6: Yığın & Prosedürler (PUSH, POP, CALL, RET, Stack Frame)
  // =========================================================================
  "milestone-6": [
    {
      id: "pred-m6-stack-sp-bytes",
      milestoneId: "milestone-6",
      stageNumber: 6,
      title: "Alıştırma 6.1: PUSH ile SP'nin 2 Azalması ve Yığın Bellek Düzeni",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 6 Tahmini: SP Değişimi ve Stack Baytları",
      scenario: "SS = 2000H, SP = 0100H başlangıç değerlerindedir. AX = 1234H iken PUSH AX komutu yürütülüyor. Yeni SP değerini ve yığının [00FFH] ve [00FEH] adreslerindeki baytları tahmin edin.",
      codeSnippet: "; SS = 2000H, SP = 0100H, AX = 1234H\nPUSH AX",
      initialState: {
        registers: { "SS": "2000H", "SP": "0100H", "AX": "1234H" }
      },
      registersToPredict: [
        {
          name: "SP",
          expected: "00FEH",
          acceptedValues: ["00FEH", "00FE", "FEH", "FE", "0x00FE", "0xfe"],
          description: "🚨 HOCANIN KURALI: PUSH yapıldığında SP 2 AZALIR: 0100H - 2 = 00FEH."
        }
      ],
      flagsToPredict: [],
      memoryToPredict: [
        {
          address: "SS:[00FEH] (Yığın Tepesi TOS - Düşük Bayt)",
          expected: "34H",
          acceptedValues: ["34H", "34", "0x34", "34h"],
          explanation: "Little-Endian: Düşük adrese (SP = 00FEH) kelimenin düşük baytı (AL = 34H) yazılır."
        },
        {
          address: "SS:[00FFH] (Yüksek Bayt)",
          expected: "12H",
          acceptedValues: ["12H", "12", "0x12", "12h"],
          explanation: "Yüksek adrese (SP+1 = 00FFH) kelimenin yüksek baytı (AH = 12H) yazılır."
        }
      ],
      hocaGradingNotes: "Hoca sınav sorusu: PUSH AX komutunda önce SP mi azalır yoksa veri mi yazılır? Cevap: Önce SP = SP - 2 yapılır, ardından veri yazılır."
    },
    {
      id: "pred-m6-nested-loop-stack",
      milestoneId: "milestone-6",
      stageNumber: 6,
      title: "Alıştırma 6.2: Tahta Notu (Week 6) — İç İçe Döngüde PUSH/POP CX Koruması",
      difficulty: "zor",
      difficultyLabel: "🔴 Week 6 Vaka Analizi: CX Bozulması ve Düzeltme",
      scenario: "Dış döngü CX = 3, iç döngü CX = 2 kez dönecektir. İç döngüye girerken PUSH CX, çıkarken POP CX yapılmaktadır. Toplam iç işlem kaç kez yürütülür ve dış döngü bitiminde DX ne olur?",
      codeSnippet: "MOV DX, 0\nMOV CX, 3\n\nDIS_DONGU:\nPUSH CX\nMOV CX, 2\n\nIC_DONGU:\nINC DX\nLOOP IC_DONGU\n\nPOP CX\nLOOP DIS_DONGU",
      initialState: {
        registers: { "DX": "0", "CX": "3" }
      },
      registersToPredict: [
        {
          name: "DX",
          expected: "0006H",
          acceptedValues: ["0006H", "0006", "6", "0x0006", "6h"],
          description: "Dış döngü 3 kez, her seferinde iç döngü 2 kez döner: Toplam 3 × 2 = 6 kez INC DX çalışır."
        },
        {
          name: "CX",
          expected: "0000H",
          acceptedValues: ["0000H", "0000", "0", "0x0000", "0h"],
          description: "Tüm döngüler başarıyla tamamlandığında CX = 0 olur."
        }
      ],
      flagsToPredict: [],
      hocaGradingNotes: "Hoca tahta notu: PUSH CX ve POP CX unutulursa iç döngü CX'i sıfırlar, dış döngüye dönünce LOOP CX'i -1 (FFFFH = 65535) yaparak sonsuz döngüye sokar!"
    }
  ],

  // =========================================================================
  // AŞAMA 7: Dizi & String İşlemleri (MOVS, LODS, STOS, CMPS, SCAS, REP)
  // =========================================================================
  "milestone-7": [
    {
      id: "pred-m7-rep-movsb",
      milestoneId: "milestone-7",
      stageNumber: 7,
      title: "Alıştırma 7.1: REP MOVSB ve Direction Flag (DF) ile İndeks Değişimi",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 7 Tahmini: REP MOVSB Sonrası İndeksler",
      scenario: "SI = 0100H, DI = 0200H, CX = 4 ayarlanmış ve CLD (DF=0) çalıştırılmıştır. REP MOVSB sonrasında SI, DI ve CX değerlerini tahmin edin.",
      codeSnippet: "CLD\nMOV SI, 0100H\nMOV DI, 0200H\nMOV CX, 4\nREP MOVSB",
      initialState: {
        registers: { "SI": "0100H", "DI": "0200H", "CX": "4" },
        flags: { "DF": "0" }
      },
      registersToPredict: [
        {
          name: "SI",
          expected: "0104H",
          acceptedValues: ["0104H", "0104", "0x0104", "104H", "104"],
          description: "CLD nedeniyle DF=0'dır; her bayt transferinde SI 1 artar: 0100H + 4 = 0104H."
        },
        {
          name: "DI",
          expected: "0204H",
          acceptedValues: ["0204H", "0204", "0x0204", "204H", "204"],
          description: "Her baytta DI 1 artar: 0200H + 4 = 0204H."
        },
        {
          name: "CX",
          expected: "0000H",
          acceptedValues: ["0000H", "0000", "0", "0x0000", "0h"],
          description: "REP ön eki CX sıfır olana kadar tekrarlar: CX = 0000H."
        }
      ],
      flagsToPredict: [
        {
          name: "DF",
          expected: "0",
          bitDerivation: "CLD komutu Direction Flag'i 0 yapar (İleri yön)."
        }
      ],
      hocaGradingNotes: "Eğer STD çalıştırılsaydı DF=1 olurdu ve SI = 00FCH, DI = 01FCH olurdu! Sınavda CLD mi STD mi verildiğine dikkat edilmelidir."
    }
  ],

  // =========================================================================
  // AŞAMA 8: BCD & ASCII Aritmetiği (DAA, DAS, AAA, AAS, AAM, AAD)
  // =========================================================================
  "milestone-8": [
    {
      id: "pred-m8-daa-packed",
      milestoneId: "milestone-8",
      stageNumber: 8,
      title: "Alıştırma 8.1: DAA ile Paketlenmiş BCD Düzeltmesi (38 + 27 = 65)",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 8 Tahmini: DAA Algoritması",
      scenario: "AL = 38H ve BL = 27H (Packed BCD 38 ve 27). ADD AL, BL yapıldığında AL = 5FH olur. Ardından DAA komutu çalıştırıldığında AL ve AF bayrağını tahmin edin.",
      codeSnippet: "MOV AL, 38H\nMOV BL, 27H\nADD AL, BL   ; AL = 5FH\nDAA",
      initialState: {
        registers: { "AL": "38H", "BL": "27H" }
      },
      registersToPredict: [
        {
          name: "AL",
          expected: "65H",
          acceptedValues: ["65H", "65", "0x65", "65h"],
          description: "5FH alt nibble'ı (F) > 9 olduğu için DAA 6 ekler: 5FH + 6 = 65H (Packed BCD 65)."
        }
      ],
      flagsToPredict: [
        {
          name: "AF",
          expected: "1",
          bitDerivation: "Alt basamaktan onlar basamağına elde geçtiği için DAA AF=1 yapar."
        },
        {
          name: "CF",
          expected: "0",
          bitDerivation: "Yüksek nibble (6) ≤ 9 olduğu için 100'ler basamağına taşma yoktur, CF = 0."
        }
      ],
      hocaGradingNotes: "DAA komutu sadece AL üzerinde çalışır; operand almaz. Alt nibble > 9 ise 6 eklenir, üst nibble > 9 ise 60H eklenir."
    },
    {
      id: "pred-m8-aam-unpacked",
      milestoneId: "milestone-8",
      stageNumber: 8,
      title: "Alıştırma 8.2: AAM ile Çarpım Sonrası Basamak Ayırma (7 × 8 = 56)",
      difficulty: "kolay",
      difficultyLabel: "🟢 Aşama 8 Tahmini: AAM Bölme Mekanizması",
      scenario: "AL = 7 ve BL = 8 çarpılıyor (MUL BL -> AX = 0038H = 56). Ardından AAM komutu çalıştırılıyor. AH ve AL değerlerini tahmin edin.",
      codeSnippet: "MOV AL, 7\nMOV BL, 8\nMUL BL   ; AX = 0038H = 56\nAAM",
      initialState: {
        registers: { "AL": "7", "BL": "8" }
      },
      registersToPredict: [
        {
          name: "AH",
          expected: "05H",
          acceptedValues: ["05H", "05", "5", "0x05", "5h"],
          description: "AAM AL'yi 10'a böler: Bölüm AH = 56 / 10 = 5."
        },
        {
          name: "AL",
          expected: "06H",
          acceptedValues: ["06H", "06", "6", "0x06", "6h"],
          description: "Kalan AL = 56 % 10 = 6."
        }
      ],
      flagsToPredict: [],
      hocaGradingNotes: "AAM komutu donanımsal olarak AL / 10 işlemini gerçekleştirir. Unpacked BCD'de her bayt tek basamak saklar."
    }
  ],

  // =========================================================================
  // AŞAMA 9: Port I/O ve Sistem Kesmeleri (IN, OUT, INT, IVT)
  // =========================================================================
  "milestone-9": [
    {
      id: "pred-m9-ivt-address",
      milestoneId: "milestone-9",
      stageNumber: 9,
      title: "Alıştırma 9.1: IVT Vektör Adres Hesabı (INT 21H)",
      difficulty: "orta",
      difficultyLabel: "🟡 Sınav Sorusu: Kesme Vektör Tablosu (IVT) Adresi",
      scenario: "INT 21H DOS servis çağrısının IVT (Interrupt Vector Table) içindeki 4-baytlık başlangıç fiziksel adresini hesaplayın.",
      codeSnippet: "; INT Type = 21H\n; IVT Vektör Başlangıç Adresi = Type × 4\n; 21H × 4 = ?",
      initialState: {
        registers: { "INT_TYPE": "21H" }
      },
      registersToPredict: [
        {
          name: "PA",
          expected: "00084H",
          acceptedValues: ["00084H", "0084H", "84H", "84", "0x0084", "0x84"],
          description: "Formül: Tip × 4 = 21H × 4 = (33 onluk) × 4 = 132 onluk = 84H (00084H)."
        }
      ],
      flagsToPredict: [],
      memoryToPredict: [
        {
          address: "00084H - 00085H",
          expected: "IP",
          acceptedValues: ["IP", "Dönüş IP", "Offset IP"],
          explanation: "İlk 2 bayt Kesme Servis Rutininin (ISR) IP ofsetini tutar."
        },
        {
          address: "00086H - 00087H",
          expected: "CS",
          acceptedValues: ["CS", "Segment CS"],
          explanation: "Sonraki 2 bayt ISR'nin CS segmentini tutar."
        }
      ],
      hocaGradingNotes: "Hoca sınav klasiği: Tip N kesmesinin vektör adresi N × 4 formülüdür. 21H hex olduğu için önce onluğa çevrilip (33) 4 ile çarpılır (132) veya doğrudan hex 21h * 4 = 84h hesaplanır."
    }
  ],

  // =========================================================================
  // AŞAMA 10: Boru Hattı (Pipelining) & Rescheduling
  // =========================================================================
  "milestone-10": [
    {
      id: "pred-m10-rescheduling",
      milestoneId: "milestone-10",
      stageNumber: 10,
      title: "Alıştırma 10.1: Komut Yeniden Sıralama (Rescheduling) ile Stall Önleme",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 10 Tahmini: Bağımsız Komut Sıralaması",
      scenario: "Aşağıdaki kodda AX'ten sonra araya bağımsız BX komutu yerleştirilmiştir. Kod tamamlandığında AX ve BX değerlerini tahmin edin.",
      codeSnippet: "MOV AX, 10H\nMOV BX, 20H\nADD AX, 05H\nADD BX, 0AH",
      initialState: {
        registers: { "AX": "0", "BX": "0" }
      },
      registersToPredict: [
        {
          name: "AX",
          expected: "15H",
          acceptedValues: ["15H", "15", "0x15", "15h"],
          description: "10H + 5 = 15H."
        },
        {
          name: "BX",
          expected: "2AH",
          acceptedValues: ["2AH", "2A", "0x2A", "2ah"],
          description: "20H + 0AH = 2AH."
        }
      ],
      flagsToPredict: [
        {
          name: "ZF",
          expected: "0",
          bitDerivation: "Sonuçlar sıfır değildir, ZF = 0."
        }
      ],
      hocaGradingNotes: "Boru hattında RAW (Read After Write) veri gecikmesini önlemek için derleyiciler komutları bu şekilde araya sokarak yeniden sıralar."
    }
  ],

  // =========================================================================
  // AŞAMA 11: İleri Sistem Komutları (CLC, STC, CMC, LAHF, SAHF, XLAT)
  // =========================================================================
  "milestone-11": [
    {
      id: "pred-m11-xlat-lookup",
      milestoneId: "milestone-11",
      stageNumber: 11,
      title: "Alıştırma 11.1: XLAT Donanımsal Tablo Çeviri Komutu",
      difficulty: "orta",
      difficultyLabel: "🟡 Barry Brey Klasiği: XLAT Tablo Erişimi",
      scenario: "BX = 0200H (tablo taban adresi) ve AL = 3 (indis). [0203H] hücresinde 4FH baytı bulunmaktadır. XLAT komutu çalıştırıldığında AL değerini tahmin edin.",
      codeSnippet: "MOV BX, 0200H\nMOV AL, 3\nXLAT   ; AL = [BX + AL] = [0203H]",
      initialState: {
        registers: { "BX": "0200H", "AL": "3" },
        memory: { "[0203H]": "4FH" }
      },
      registersToPredict: [
        {
          name: "AL",
          expected: "4FH",
          acceptedValues: ["4FH", "4F", "0x4F", "4fh"],
          description: "XLAT formülü: AL = [DS:BX + AL] = [0200H + 3] = [0203H] = 4FH."
        }
      ],
      flagsToPredict: [
        {
          name: "CF",
          expected: "0",
          bitDerivation: "XLAT komutu durum bayraklarını DEĞİŞTİRMEZ."
        }
      ],
      hocaGradingNotes: "XLAT komutu operand almaz; daima DS:BX tabanını ve AL indisini kullanır. Bayrakları etkilemez."
    },
    {
      id: "pred-m11-lahf-sahf",
      milestoneId: "milestone-11",
      stageNumber: 11,
      title: "Alıştırma 11.2: LAHF ile Bayrakların AH Yazmacına Kopyalanması",
      difficulty: "orta",
      difficultyLabel: "🟡 Aşama 11 Tahmini: LAHF Bit Yerleşimi",
      scenario: "CF = 1 ve ZF = 1 kuruludur. LAHF komutu çalıştırıldığında AH'nin 0. biti (CF) ve 6. biti (ZF) ne olur?",
      codeSnippet: "; CF = 1, ZF = 1 iken\nLAHF",
      initialState: {
        flags: { "CF": "1", "ZF": "1" }
      },
      registersToPredict: [
        {
          name: "AH_Bit0 (CF)",
          expected: "1",
          acceptedValues: ["1", "01H", "01"],
          description: "LAHF'ta AH'nin 0. biti Carry Flag'i (CF=1) tutar."
        },
        {
          name: "AH_Bit6 (ZF)",
          expected: "1",
          acceptedValues: ["1", "01H", "01"],
          description: "LAHF'ta AH'nin 6. biti Zero Flag'i (ZF=1) tutar."
        }
      ],
      flagsToPredict: [],
      hocaGradingNotes: "LAHF komutu SF, ZF, AF, PF ve CF bayraklarını AH'nin 7, 6, 4, 2, 0 bitlerine yükler. 8080 işlemcisinden kod taşırken kullanılır."
    }
  ]
};
