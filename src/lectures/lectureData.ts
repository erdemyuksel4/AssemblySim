export type ExerciseDifficulty = 'kolay' | 'orta' | 'zor';

export interface LectureExample {
  id: string;
  difficulty: ExerciseDifficulty;
  difficultyLabel: string;
  title: string;
  scenario: string;
  task: string;
  code: string;
  initialRegisters?: Record<string, number>;
  initialMemory?: Array<{ segment: number; offset: number; bytes: number[] }>;
  solutionCode: string;
  solutionBreakdown: string[];
  examTips: string;
}

export interface LectureSection {
  title: string;
  contentHtml: string;
  examples?: LectureExample[];
}

export interface MilestoneLecture {
  milestoneId: string;
  milestoneNumber: number;
  title: string;
  subtitle: string;
  slideRef: string;
  overviewHtml: string;
  sections: LectureSection[];
}

export const MILESTONE_LECTURES: Record<string, MilestoneLecture> = {
  // =========================================================================
  // AŞAMA 1: TEMEL YAZMAÇLAR, VERİ AKTARIMI & MİMARİ
  // =========================================================================
  'milestone-1': {
    milestoneId: 'milestone-1',
    milestoneNumber: 1,
    title: 'Temel Yazmaçlar & Veri Aktarımı (MOV, XCHG, LEA & Mimari)',
    subtitle: '8086 CPU Mimarisi (BIU & EU), 1 MB Bellek Haritası, Little-Endian ve Adresleme Temelleri',
    slideRef: 'Week 1, 2, 3 & 4 Slaytları (Brey 8. Baskı Bölüm 1–4)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 1: MİMARİ & VERİ AKIŞI TEMELLERİ</div>
        <p class="lecture-hero-text">
          8086 mikroişlemcisi iki ana bağımsız birimden oluşur: <b>Bus Interface Unit (BIU - Veriyolu Arayüz Birimi)</b> ve <b>Execution Unit (EU - Yürütme Birimi)</b>. 
          BIU; bellekten komutları okur, 6-baytlık Prefetch Kuyruğunda (FIFO) bekletir ve 20-bitlik fiziksel adresleri hesaplar. EU ise komutları çözer (Decode) ve ALU ile yürütür (Execute).
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>Hocanın Altın Kuralları:</strong><br>
          1. <code>MOV Hedef, Kaynak</code> komutunda veri akışı <strong>DAİMA SAĞDAN SOLA</strong> gerçekleşir. Kaynaktaki veri silinmez, kopyalanır.<br>
          2. Bellekten belleğe doğrudan aktarım (örn: <code>MOV [0200H], [0100H]</code>) 8086 mimarisinde <strong>YASAKTIR!</strong> Veri mutlaka bir yazmaç üzerinden aktarılmalıdır.<br>
          3. <code>CS</code> (Code Segment) yazmacı doğrudan <code>MOV</code> ile değiştirilemez. <code>CS:IP</code> yalnızca atlama (JMP/CALL) ile değişir.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. 8086 Yazmaç Kümesi & Little-Endian Bellek Organizasyonu',
        contentHtml: `
          <p>8086 mikroişlemcisinde 14 adet 16-bitlik yazmaç bulunur:</p>
          <ul>
            <li><b>Genel Amaçlı (Veri):</b> <code>AX</code> (Akümülatör: AH:AL), <code>BX</code> (Taban: BH:BL), <code>CX</code> (Sayaç: CH:CL), <code>DX</code> (Veri/Port: DH:DL).</li>
            <li><b>Segment Yazmaçları:</b> <code>CS</code> (Code), <code>DS</code> (Data), <code>SS</code> (Stack), <code>ES</code> (Extra).</li>
            <li><b>İşaretçi & İndeksler:</b> <code>IP</code> (Instruction Pointer), <code>SP</code> (Stack Pointer), <code>BP</code> (Base Pointer), <code>SI</code> (Source Index), <code>DI</code> (Destination Index).</li>
          </ul>
          <h4>20-Bit Fiziksel Adres Formülü:</h4>
          <p>
            8086, 20-bit adres yolu ile <b>1 MB ($2^{20} = 1,048,576$ bayt)</b> bellek adresler. Fiziksel adres formülü:
            <br><code>Fiziksel Adres = (Segment × 10h) + Offset = (Segment × 16) + Offset</code>
          </p>
          <h4>Little-Endian Kuralı:</h4>
          <p>
            Intel x86 mimarisinde 16-bit bir kelime belleğe yazılırken <strong>Düşük Anlamlı Bayt Düşük Adrese (Low Byte ➔ Low Address)</strong>, yüksek anlamlı bayt yüksek adrese yazılır. Örneğin <code>1234H</code> sayısı <code>0200H</code> adresine yazıldığında:
            <code>[0200H] = 34H</code>, <code>[0201H] = 12H</code> olur.
          </p>
        `,
        examples: [
          {
            id: 'ex-m1-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 1.1: Yazmaçlar Arası Doğrudan Kopyalama ve Takas (MOV & XCHG)',
            scenario: 'İşlemcinin genel amaçlı yazmaçlarına ivedi (immediate) sabitler yüklenecek ve üçüncü bir yazmaç kullanmadan yerleri değiştirilecektir.',
            task: 'AX içine 1234H, BX içine 5678H sabitlerini yükleyin. XCHG komutu ile değerleri takas edin. Ardından CX içine güncel AX değerini kopyalayıp HLT ile durun.',
            code: `; 🟢 Kolay: Dogrudan Birebir Veri Aktarimi
ORG 100H

MOV AX, 1234H
MOV BX, 5678H

; AX ve BX degerlerini tek komutla degis tokus yapin:
XCHG AX, BX

; Guncel AX degerini CX yazmacina kopyalayin:
MOV CX, AX

HLT`,
            solutionCode: `ORG 100H
MOV AX, 1234H
MOV BX, 5678H
XCHG AX, BX
MOV CX, AX
HLT`,
            solutionBreakdown: [
              '1. Satır: ORG 100H — Programın DOS COM giriş noktasını CS:0100h olarak belirler.',
              '2-3. Satır: MOV AX, 1234H ve MOV BX, 5678H ile 16-bit ivedi sayılar yazmaçlara alınır.',
              '4. Satır: XCHG AX, BX — Donanımsal takas gerçekleşir: AX = 5678h, BX = 1234h olur.',
              '5. Satır: MOV CX, AX — AX\'teki 5678h değeri CX içine kopyalanır.',
              '6. Satır: HLT — İşlemciyi durdurur.'
            ],
            examTips: 'XCHG komutunda operantlardan biri sabit sayı (Immediate) OLAMAZ! (Örn: XCHG AX, 5 geçersizdir).'
          },
          {
            id: 'ex-m1-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 1.2: Little-Endian Sensör Okuma & Big-Endian Formatına Çevrim',
            scenario: 'Bir sensör modülü belleğin [0200h] adresine 16-bitlik Little-Endian bir okuma verisi (0x5A34), [0202h] adresine ise bir katsayı bırakmıştır. Ağ protokolü için bu verinin Big-Endian (yüksek ve düşük baytları takas edilmiş) formata çevrilmesi gerekmektedir.',
            task: '[0200h] adresindeki veriyi AX\'e, [0202h] adresindeki veriyi BX\'e yükleyin. XCHG AH, AL komutu ile AX\'in baytlarını ters çevirin ve sonucu DX\'e kopyalayın.',
            code: `; 🟡 Orta: Little-Endian Okuma ve Big-Endian Bayt Takasi
ORG 100H

; Bellek [0200h] adresindeki 16-bit veriyi AX'e yukleyin
MOV AX, [0200H]

; Bellek [0202h] adresindeki 16-bit veriyi BX'e yukleyin
MOV BX, [0202H]

; AX yazmacinin yuksek (AH) ve dusuk (AL) baytlarini takas edin:
XCHG AH, AL

; Big-Endian formata donusen degeri DX'e aktarin:
MOV DX, AX

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x34, 0x5A, 0x88, 0x11] } // [0200]=5A34h, [0202]=1188h
            ],
            solutionCode: `ORG 100H
MOV AX, [0200H]
MOV BX, [0202H]
XCHG AH, AL
MOV DX, AX
HLT`,
            solutionBreakdown: [
              '1. Satır: MOV AX, [0200H] — Little-Endian gereği adresteki 34h AL\'ye, 5Ah AH\'ye girer (AX = 5A34h).',
              '2. Satır: MOV BX, [0202H] — BX = 1188h olarak yüklenir.',
              '3. Satır: XCHG AH, AL — 8-bitlik yüksek ve düşük parçalar takas edilerek AX = 345Ah (Big-Endian) elde edilir.',
              '4. Satır: MOV DX, AX — Sonuç DX yazmacına aktarılır.'
            ],
            examTips: 'Sınavda belleğe 16-bit veri yazılırken düşük baytın daima küçük adrese yazıldığını unutmayın (Low byte ➔ Low address).'
          },
          {
            id: 'ex-m1-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 1.3: Aygıt Denetim Bloğu (Device Control Block) Taşıma & Taban Adresleme',
            scenario: 'Gömülü bir donanım sürücüsünde, bellekteki 4 word\'lük aygıt yapılandırma tablosu (Baud Rate, Mode, Status, Buffer Ptr) LEA ve [BX+SI] tabanlı-indeksli adresleme kullanılarak CPU yazmaçlarına dağıtılmalıdır.',
            task: 'LEA BX, [0200H] ile taban adresini BX içine alın. SI indeksini sıfırlayın. [BX+SI] adresinden okuyarak AX=Baud, SI+=2 ile BX+SI üzerinden CX=Mode, DX=Status, DI=Buffer Ptr değerlerini ilgili yazmaçlara dağıtın.',
            code: `; 🔴 Zor: Donanim Yapilandirma Blogu Ayrıştırma
ORG 100H

; 1. Taban adresini LEA ile BX'e yukleyin
LEA BX, [0200H]

; 2. SI indeksini sifirlayin
MOV SI, 0000H

; 3. [BX+SI] uzerinden ilk kelimeyi AX'e okuyun
MOV AX, [BX+SI]

; 4. SI indeksini 2 artirip sonraki kelimeyi CX'e okuyun
ADD SI, 2
MOV CX, [BX+SI]

; 5. SI indeksini 2 artirip sonraki kelimeyi DX'e okuyun
ADD SI, 2
MOV DX, [BX+SI]

; 6. SI indeksini 2 artirip dorduncu kelimeyi DI'ye okuyun
ADD SI, 2
MOV DI, [BX+SI]

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x80, 0x25, 0x03, 0x00, 0x01, 0x00, 0x00, 0x03] }
              // 2580h (9600 baud), 0003h (8N1), 0001h (online), 0300h (buffer ptr)
            ],
            solutionCode: `ORG 100H
LEA BX, [0200H]
MOV SI, 0000H
MOV AX, [BX+SI]
ADD SI, 2
MOV CX, [BX+SI]
ADD SI, 2
MOV DX, [BX+SI]
ADD SI, 2
MOV DI, [BX+SI]
HLT`,
            solutionBreakdown: [
              '1. Satır: LEA BX, [0200H] — BX içine taban ofset adresi 0200h yüklenir.',
              '2. Satır: MOV SI, 0000H — İndeks başlangıç değeri verilir.',
              '3-9. Satırlar: [BX+SI] tabanlı indeksli adresleme ile ikişer bayt aralıklarla bellek taranır ve donanım yazmaçlarına aktarılır.'
            ],
            examTips: 'LEA (Load Effective Address) komutu köşeli parantezin içindeki adresin KENDİSİNİ yazmaca yükler; bellek içeriğini okumaz. MOV ise bellek içeriğini okur.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 2: ARİTMETİK İŞLEMLER & BAYRAKLAR
  // =========================================================================
  'milestone-2': {
    milestoneId: 'milestone-2',
    milestoneNumber: 2,
    title: 'Aritmetik İşlemler & Bayraklar (ADD, ADC, SUB, SBB, MUL, DIV)',
    subtitle: 'ALU Donanım İşlemleri, 32-bit Eldeli Toplama/Çıkarma, Bayrak Analizi (CF, ZF, SF, OF) ve Sabit Noktalı Aritmetik',
    slideRef: 'Week 5 Slaytları & Brey Bölüm 5',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 2: ALU & BAYRAKLAR</div>
        <p class="lecture-hero-text">
          Aritmetik işlemler doğrudan işlemcinin <b>ALU (Aritmetik Mantık Birimi)</b> tarafından yürütülür ve sonuçlara göre <b>FLAGS (Bayraklar)</b> kaydı donanımsal olarak güncellenir.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>Elde (Carry) vs Taşma (Overflow) Donanım Farkı:</strong><br>
          • <strong>CF (Carry Flag):</strong> İşaretsiz (unsigned) sayılarda en yüksek bitten taşan elde veya çıkarmada borcu gösterir.<br>
          • <strong>OF (Overflow Flag):</strong> İşaretli (signed, 2'ye tümleyen) sayılarda sonucun kapasiteyi aşıp işaret bitini (MSB) bozduğunu gösterir ($OF = C_{in} \oplus C_{out}$).<br>
          • <strong>ZF (Zero Flag):</strong> İşlem sonucu 0 olduğunda 1 olur.<br>
          • <strong>SF (Sign Flag):</strong> Sonucun en yüksek biti (işaret biti) 1 ise (negatifse) 1 olur.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. Toplama, Çıkarma, Çarpma ve Bölme Mimarisi',
        contentHtml: `
          <p>8086'da çarpma ve bölme komutlarında birinci operant gizlidir (yazılmaz, işlemci otomatik olarak AX kullanır):</p>
          <ul>
            <li><b>8-bit Çarpma:</b> <code>MUL BL</code> ➔ <code>AX = AL × BL</code> (Sonuç 16-bit olarak AX içine yazılır).</li>
            <li><b>16-bit Çarpma:</b> <code>MUL BX</code> ➔ <code>DX:AX = AX × BX</code> (Sonuç 32-bit olur; yüksek kelime DX, düşük AX).</li>
            <li><b>16-bit / 8-bit Bölme:</b> <code>DIV BL</code> ➔ <code>AX / BL</code> ➔ <b>Bölüm AL</b> içine, <b>Kalan (Modulus) AH</b> içine yazılır.</li>
            <li><b>32-bit / 16-bit Bölme:</b> <code>DIV BX</code> ➔ <code>DX:AX / BX</code> ➔ <b>Bölüm AX</b> içine, <b>Kalan DX</b> içine yazılır.</li>
          </ul>
        `,
        examples: [
          {
            id: 'ex-m2-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 2.1: Temel Toplama, Çıkarma ve Sıfır Bayrağı (ADD, SUB, ZF)',
            scenario: 'İki sayıyı toplayıp çıkararak Sıfır (ZF) ve Elde (CF) bayraklarının donanımsal değişimini gözlemleme.',
            task: 'AX içine 0005H yükleyin. ADD AX, 0005H komutuyla 10 (0Ah) yapın. Ardından SUB AX, 000AH yaparak sonucun 0 olmasını ve ZF=1 bayrağının kurulmasını sağlayın.',
            code: `; 🟢 Kolay: Temel Toplama ve Sifir Bayragi Dogrulama
ORG 100H

MOV AX, 0005H
ADD AX, 0005H   ; AX = 10 (000Ah), ZF = 0
SUB AX, 000AH   ; AX = 0, ZF = 1 olmalidir!

HLT`,
            solutionCode: `ORG 100H
MOV AX, 0005H
ADD AX, 0005H
SUB AX, 000AH
HLT`,
            solutionBreakdown: [
              '1. Satır: MOV AX, 0005H ile AX = 5 atanır.',
              '2. Satır: ADD AX, 0005H ile AX = 10 (0Ah) olur. Sonuç sıfır olmadığı için ZF = 0 kalır.',
              '3. Satır: SUB AX, 000AH ile 10 - 10 = 0 hesaplanır. AX = 0000h olur ve ALU otomatik olarak ZF = 1 yapar.',
              '4. Satır: HLT ile program tamamlanır.'
            ],
            examTips: 'SUB komutu çıkarma yapıp sonucu hedefe yazar. CMP komutu ise aynı çıkarmayı yapar fakat sonucu hedefe yazmaz, SADECE bayrakları etkiler!'
          },
          {
            id: 'ex-m2-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 2.2: 32-Bit Genişletilmiş Sayıların Toplanması (ADC ile Eldeli Toplama)',
            scenario: '8086 bir 16-bit işlemcidir. İki adet 32-bit sayıyı toplamak için sayılar ikiye bölünür (Düşük Word + Yüksek Word + Elde). Sayı 1: DX:AX (0001:FFFFh), Sayı 2: CX:BX (0002:0001h).',
            task: 'Önce ADD AX, BX ile düşük kelimeleri toplayın (elde oluşup CF=1 olacaktır). Ardından ADC DX, CX ile eldeyi yüksek kelimelere ekleyerek 32-bitlik doğru toplamı DX:AX içinde elde edin.',
            code: `; 🟡 Orta: 32-Bit Sayi Toplama (ADC)
ORG 100H

MOV AX, 0FFFFH   ; Sayi 1 Dusuk Word
MOV DX, 0001H    ; Sayi 1 Yuksek Word
MOV BX, 0001H    ; Sayi 2 Dusuk Word
MOV CX, 0002H    ; Sayi 2 Yuksek Word

; Dusuk kelimeleri toplayin (CF bayragi 1 olacak):
ADD AX, BX

; Yuksek kelimeleri elde ile toplayin:
ADC DX, CX

HLT`,
            solutionCode: `ORG 100H
MOV AX, 0FFFFH
MOV DX, 0001H
MOV BX, 0001H
MOV CX, 0002H
ADD AX, BX
ADC DX, CX
HLT`,
            solutionBreakdown: [
              '1-4. Satırlar: Sayı 1 = 0001FFFFh, Sayı 2 = 00020001h yazmaçlara yüklenir.',
              '5. Satır: ADD AX, BX — FFFFh + 0001h = 0000h hesaplanır, en yüksek bitten 1 elde çıkar ve CF = 1 olur!',
              '6. Satır: ADC DX, CX — DX (0001h) + CX (0002h) + CF (1) = 0004h elde edilir.',
              'Sonuç: DX:AX = 00040000h (Tam ve doğru 32-bit toplam).'
            ],
            examTips: 'Yüksek kelimeleri toplarken ADD yazarsanız eldeden gelen 1 kaybolur ve sonuç 00030000h çıkarak sınavda puan kaybettirir. Daima ADC kullanılmalıdır.'
          },
          {
            id: 'ex-m2-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 2.3: Analog Sıcaklık Sensörü ADC Verisini Celsius Derecesine Dönüştürme',
            scenario: 'Bir endüstriyel ADC (Analog-Digital Converter) çipi 0–1023 arası 10-bitlik ham voltaj okuması üretmektedir. Gerçek sıcaklık formülü T = (ADC × 125) / 256 şeklindedir (Sabit noktalı / Fixed-point hesaplama).',
            task: 'Giriş ADC verisi AX = 512 (0200h) olsun. 1. MOV BX, 125 yükleyin. 2. MUL BX ile çarpın (sonuç 32-bit olarak DX:AX içine gelecektir). 3. MOV BX, 256 yükleyin ve DIV BX ile bölün. Bölüm AX (tam derece = 250), kalan DX içine yazılmalıdır.',
            code: `; 🔴 Zor: Sensor ADC Olcekleme (Carpma ve Bolme)
ORG 100H

MOV AX, 0200H   ; ADC Ham Verisi = 512
MOV BX, 125     ; Katsayi = 125

; DX:AX = AX * BX carpimini yapin:
MUL BX

; Sonucu 256'ya bolun (Bolum AX, Kalan DX):
MOV BX, 256
DIV BX

HLT`,
            solutionCode: `ORG 100H
MOV AX, 0200H
MOV BX, 125
MUL BX
MOV BX, 256
DIV BX
HLT`,
            solutionBreakdown: [
              '1-2. Satır: AX = 512, BX = 125.',
              '3. Satır: MUL BX — DX:AX = 512 × 125 = 64,000 (0000:FA00h).',
              '4-5. Satır: DIV BX — DX:AX / 256 bölünür. AX = 250 (00FAh, tam derece), DX = 0 (kalan) elde edilir.'
            ],
            examTips: 'DIV komutu çalıştırılmadan önce DX yazmacının yüksek word için doğru hazırlanmış olması gerekir. Aksi halde Tip 0 (Divide Error) kesmesi tetiklenir.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 3: MANTIKSAL İŞLEMLER & BİT MASKELEME
  // =========================================================================
  'milestone-3': {
    milestoneId: 'milestone-3',
    milestoneNumber: 3,
    title: 'Mantıksal İşlemler & Bit Maskeleme (AND, OR, XOR, TEST, SHL/SHR)',
    subtitle: 'Bit Manipülasyonu, Hızlı 2 ile Çarpma/Bölme, Parity Kontrolü ve Donanım Durum Yazmaçları',
    slideRef: 'Week 5 & Week 10 Slaytları',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 3: BİT MANİPÜLASYONU</div>
        <p class="lecture-hero-text">
          Mantıksal komutlar bitler düzeyinde çalışır ve donanım kontrolünde kritik öneme sahiptir:
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>Mantık Komutlarının 4 Temel Kullanım Amacı:</strong><br>
          1. <code>AND</code> ➔ <strong>Bit Sıfırlama (Maskeleme):</strong> İstenmeyen bitleri 0 yapmak için kullanılır.<br>
          2. <code>OR</code> ➔ <strong>Bit Kurma (Set Etme):</strong> Belirli bitleri 1 yapmak için kullanılır.<br>
          3. <code>XOR</code> ➔ <strong>Bit Tersleme / Hızlı Sıfırlama:</strong> <code>XOR AX, AX</code> komutu AX'i sıfırlar, <code>MOV AX, 0</code>'dan daha kısa makine kodu üretir ve daha hızlıdır.<br>
          4. <code>TEST</code> ➔ <strong>Tahribatsız AND:</strong> Hedef yazmacı bozmadan yalnızca bayrakları (özellikle ZF) etkiler.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. Mantık Komutları ve Kaydırma (Shift/Rotate) Mimarisi',
        contentHtml: `
          <p>Kaydırma komutları bitleri sola veya sağa kaydırarak hızlı 2'nin katları ile çarpma ve bölme sağlar:</p>
          <ul>
            <li><code>SHL AX, 1</code> ➔ AX = AX × 2 (En yüksek bit CF içine düşer, sağdan 0 girer).</li>
            <li><code>SHR AX, 1</code> ➔ AX = AX / 2 (İşaretsiz bölme, en düşük bit CF içine düşer, soldan 0 girer).</li>
            <li><code>SAR AX, 1</code> ➔ Aritmetik sağa kaydırma: <b>İşaret bitini (MSB) koruyarak</b> böler.</li>
          </ul>
        `,
        examples: [
          {
            id: 'ex-m3-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 3.1: Bit Düzeyinde Maskeleme ve Kurma (AND & OR)',
            scenario: 'Bir donanım kontrol baytının alt 4 bitini (nibble) sıfırlamak ve en yüksek bitini (Bit 7) 1 yapmak istenmektedir.',
            task: 'AL içine 0B7H yükleyin. AND AL, 0F0H ile alt 4 biti sıfırlayın. Ardından OR AL, 80H ile 7. biti 1 yapıp HLT ile durun.',
            code: `; 🟢 Kolay: Bit Maskeleme ve Kurma
ORG 100H

MOV AL, 0B7H    ; 1011 0111b

; Alt 4 biti sifirlayin:
AND AL, 0F0H    ; 1011 0000b (B0h)

; En yuksek biti (Bit 7) 1 yapin:
OR AL, 80H     ; 1011 0000b OR 1000 0000b = B0h

HLT`,
            solutionCode: `ORG 100H
MOV AL, 0B7H
AND AL, 0F0H
OR AL, 80H
HLT`,
            solutionBreakdown: [
              '1. Satır: AL = B7h (10110111b).',
              '2. Satır: AND AL, 0F0h — 0 ile AND\'lenen alt 4 bit sıfırlanır, üst 4 bit korunur (AL = B0h).',
              '3. Satır: OR AL, 80h — Bit 7 zaten 1 olduğu için değer B0h kalır, eğer 0 olsaydı 1 yapılırdı.'
            ],
            examTips: 'Tek bir biti test etmek için CMP yerine TEST komutu kullanılmalıdır (Örn: TEST AL, 01h ile tek/çift kontrolü).'
          },
          {
            id: 'ex-m3-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 3.2: Hamming Weight (1 Bitlerinin Sayısını Bulma / PopCount)',
            scenario: 'Veri iletiminde paketin eşlik (parity) ve veri bütünlüğü kontrolü için 16-bitlik AX yazmacında kaç adet 1 biti bulunduğunun sayılması gerekmektedir.',
            task: 'AX = 0A5C3H (1010 0101 1100 0011b) sayısını inceleyin. BL sayacını sıfırlayın. CX = 16 sayacı kurun. Her adımda SHR AX, 1 yapın. Eğer elde (CF=1) oluşursa BL\'yi artırın. Döngü bittiğinde BL içinde toplam 1 bit sayısını (8) elde edin.',
            code: `; 🟡 Orta: 1 Bitlerinin Sayisini Bulma
ORG 100H

MOV AX, 0A5C3H   ; Sayi
MOV BL, 0        ; 1 bitleri sayaci
MOV CX, 16       ; 16 bit taranacak

SAY_DONGU:
SHR AX, 1        ; En sagdaki bit CF icine duser
JNC ATLA         ; Eger CF = 0 ise artirma yapma
INC BL           ; CF = 1 ise sayaci artir

ATLA:
LOOP SAY_DONGU

HLT`,
            solutionCode: `ORG 100H
MOV AX, 0A5C3H
MOV BL, 0
MOV CX, 16
SAY_DONGU:
SHR AX, 1
JNC ATLA
INC BL
ATLA:
LOOP SAY_DONGU
HLT`,
            solutionBreakdown: [
              '1. Satır: AX = A5C3h (8 adet 1 biti vardır).',
              '2-3. Satır: BL = 0 sayaç, CX = 16 döngü.',
              '4. Satır: SHR AX, 1 ile en sağdaki bit CF bayrağına taşınır.',
              '5-6. Satır: JNC ATLA ile elde yoksa atlanır; elde varsa INC BL çalışır.',
              '7. Satır: LOOP SAY_DONGU 16 kez döner. Sonuç: BL = 8.'
            ],
            examTips: 'SHR komutu CF bayrağına kaydırılan son biti yazar. Bu sayede JNC veya JC komutuyla taşan bit test edilebilir.'
          },
          {
            id: 'ex-m3-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 3.3: UART Seri Port Hat Durumu (LSR) Teşhisi ve Hata Ayrıştırma',
            scenario: '16550 uyumlu seri iletişim çipinin Hat Durum Yazmacında (Line Status Register): Bit 0: Data Ready (DR), Bit 1: Overrun Error (OE), Bit 2: Parity Error (PE), Bit 3: Framing Error (FE). Sürücü bu baytı okuyup teşhis koymalıdır.',
            task: 'Giriş AL = 07H (0000 0111b: Veri Hazır, Overrun ve Parity hatası var). 1. TEST AL, 0EH ile donanım hatalarını (OE, PE, FE) kontrol edin. Hata varsa DX = 0FFFFH (HATA KODU) yapıp bitirin. Hata yoksa ve Bit 0 (DR) 1 ise DX = 0001H (BASARILI) yazın.',
            code: `; 🔴 Zor: UART Seri Iletisim Hata Teshisi
ORG 100H

MOV AL, 07H     ; Donanim Durum Bayti (Hatalar mevcut)

; OE, PE, FE bitlerini (maske: 0000 1110b = 0Eh) test edin:
TEST AL, 0EH
JNZ HATA_VAR    ; Hata bitlerinden biri bile 1 ise dallan

; Hata yoksa Veri Hazir (Bit 0 = 01h) mi test edin:
TEST AL, 01H
JZ VERI_YOK
MOV DX, 0001H   ; DX = 1: Veri Hazir ve Hata Yok
JMP BITIR

HATA_VAR:
MOV DX, 0FFFFH  ; DX = FFFFh: Donanim Hata Kodu
JMP BITIR

VERI_YOK:
MOV DX, 0000H

BITIR:
HLT`,
            solutionCode: `ORG 100H
MOV AL, 07H
TEST AL, 0EH
JNZ HATA_VAR
TEST AL, 01H
JZ VERI_YOK
MOV DX, 0001H
JMP BITIR
HATA_VAR:
MOV DX, 0FFFFH
JMP BITIR
VERI_YOK:
MOV DX, 0000H
BITIR:
HLT`,
            solutionBreakdown: [
              '1. Satır: AL = 07h durum kodu.',
              '2. Satır: TEST AL, 0Eh — Bit 1, 2, 3 kontrol edilir. AL\'de Bit 1 ve 2 kurulu olduğu için ZF = 0 çıkar.',
              '3. Satır: JNZ HATA_VAR ile doğrudan hata bloğuna atlanır ve DX = FFFFh atanır.',
              'Sonuç: Sürücü hatalı paketi güvenle yakalar.'
            ],
            examTips: 'TEST komutu kaynak veya hedefi bozmaz. Bu sayede aynı yazmaç üzerinde arka arkaya farklı bit maskeleri test edilebilir.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 4: YIĞIN (STACK) & PROSEDÜR ÇAĞRILARI
  // =========================================================================
  'milestone-4': {
    milestoneId: 'milestone-4',
    milestoneNumber: 4,
    title: 'Yığın (Stack) & Prosedür Çağrıları (PUSH, POP, CALL, RET, Stack Frame)',
    subtitle: 'LIFO Prensibi, Aktivasyon Kaydı [BP+Offset], C Çağrı Kuralı (cdecl) ve Context Switching',
    slideRef: 'Week 3, 6 & Week 13 Slaytları',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 4: YIĞIN VE ALTPROGRAMLAR</div>
        <p class="lecture-hero-text">
          Yığın (Stack), <b>SS (Stack Segment)</b> ve <b>SP (Stack Pointer)</b> tarafından yönetilen LIFO (Son Giren İlk Çıkar) bellek yapısıdır.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>Yığın Mimarisi Altın Kuralları:</strong><br>
          1. <strong>Ters Yönde Büyüme:</strong> Yığın yüksek adresten düşük adrese doğru büyür.<br>
          2. <code>PUSH AX</code> komutunda: Önce <code>SP = SP - 2</code> yapılır, ardından veri <code>SS:[SP]</code> adresine yazılır.<br>
          3. <code>POP AX</code> komutunda: Önce veri <code>SS:[SP]</code> adresinden okunur, ardından <code>SP = SP + 2</code> yapılır.<br>
          4. <code>CALL</code> komutu geri dönüş adresini (IP) yığına iter; <code>RET</code> komutu yığından IP'yi çekerek çağrılan yere döner.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. Stack Frame & Parametre Aktarımı Mimarisi',
        contentHtml: `
          <p>Modern derleyiciler (C/C++) altprogramlara parametre aktarırken yığını kullanır:</p>
          <pre>
PUSH argüman2
PUSH argüman1
CALL Fonksiyon
...
Fonksiyon:
PUSH BP           ; Eski taban göstericisini sakla
MOV BP, SP        ; BP'yi mevcut yığın tepesine sabitle
SUB SP, 4         ; Yerel değişkenler için 4 bayt yer aç
; [BP+4] = Dönüş Adresi (IP)
; [BP+6] = argüman1
; [BP+8] = argüman2
MOV SP, BP
POP BP
RET
          </pre>
        `,
        examples: [
          {
            id: 'ex-m4-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 4.1: Yığın Kullanarak İki Yazmacın Değerini Takas Etme (PUSH & POP)',
            scenario: 'Üçüncü bir yardımcı yazmaç kullanmadan, sadece yığın komutları ile iki yazmacın değerlerini tersine çevirme.',
            task: 'AX = 1234H, BX = 5678H yükleyin. Sırasıyla PUSH AX, PUSH BX yapın. Ardından POP AX, POP BX komutlarını işleterek değerlerin takas olduğunu gözlemleyin.',
            code: `; 🟢 Kolay: Yigin ile Yazmac Takasi
ORG 100H

MOV AX, 1234H
MOV BX, 5678H

PUSH AX
PUSH BX

POP AX
POP BX

HLT`,
            solutionCode: `ORG 100H
MOV AX, 1234H
MOV BX, 5678H
PUSH AX
PUSH BX
POP AX
POP BX
HLT`,
            solutionBreakdown: [
              '1-2. Satır: AX = 1234h, BX = 5678h.',
              '3-4. Satır: Yığına önce AX (1234h), sonra BX (5678h) itilir. Yığının tepesinde 5678h vardır.',
              '5. Satır: POP AX ➔ Yığının tepesindeki 5678h AX\'e çıkar. AX = 5678h olur.',
              '6. Satır: POP BX ➔ Yığındaki 1234h BX\'e çıkar. BX = 1234h olur. Takas tamamlandı!'
            ],
            examTips: 'LIFO kuralı: En son PUSH edilen değer ilk POP edilir. Bu nedenle PUSH AX, PUSH BX sırasına karşılık POP AX, POP BX yazıldığında değerler otomatikman yer değiştirir.'
          },
          {
            id: 'ex-m4-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 4.2: cdecl Çağrı Kuralı ile Parametre Alan ve Kare Hesaplayan Prosedür',
            scenario: 'Bir geometrik hesaplama kütüphanesinde, yığından parametre alarak sayının karesini hesaplayan ve RET 2 ile yığını temizleyen bir fonksiyon yazılması istenmektedir.',
            task: 'Ana programda PUSH 0005H parametresini yığına itin ve CALL KARE_AL çağrın. Altprogramda [BP+4] ile parametreye erişip karesini AX içine yazın ve RET 2 ile dönün.',
            code: `; 🟡 Orta: Parametreli Altprogram (Stack Frame)
ORG 100H

MOV AX, 0005H
PUSH AX          ; Parametreyi yigina ilet
CALL KARE_AL
HLT              ; AX icinde sonuc 25 (0019h) olmalidir!

KARE_AL:
PUSH BP          ; Eski BP'yi sakla
MOV BP, SP       ; BP = SP sabitle
MOV AX, [BP+4]   ; Parametreyi oku (5)
MUL AX           ; AX = AX * AX (25 = 0019h)
MOV SP, BP
POP BP
RET 2            ; Don ve yigindaki 2 baytlik parametreyi temizle`,
            solutionCode: `ORG 100H
MOV AX, 0005H
PUSH AX
CALL KARE_AL
HLT

KARE_AL:
PUSH BP
MOV BP, SP
MOV AX, [BP+4]
MUL AX
MOV SP, BP
POP BP
RET 2`,
            solutionBreakdown: [
              '1-3. Satır: Parametre (5) yığına itilir ve CALL KARE_AL ile IP yığına saklanır.',
              '4-5. Satır: Altprogramda standart Stack Frame kurulur (PUSH BP, MOV BP, SP).',
              '6-7. Satır: [BP+4] ile parametre (5) AX\'e okunur ve MUL AX ile karesi alınır (AX = 25).',
              '8-10. Satır: Stack temizlenir ve RET 2 komutu ile parametrenin 2 baytı SP\'den düşülerek dönülür.'
            ],
            examTips: 'RET 2 komutu, geri dönüş adresini yığından çektikten sonra SP\'ye 2 ekler. Bu sayede çağıran tarafın ek bir ADD SP, 2 yapmasına gerek kalmaz (Pascal / stdcall kuralı).'
          },
          {
            id: 'ex-m4-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 4.3: İşletim Sistemi Görev Değişimi (Context Switching) Simülasyonu',
            scenario: 'Çok görevli (multitasking) bir RTOS çekirdeğinde, zamanlayıcı (Timer) tetiklendiğinde aktif görevin CPU yazmaçları yığına yedeklenmeli ve yeni görevin kaydedilmiş durumu yığından çekilmelidir.',
            task: '1. PUSHF, PUSH AX, PUSH BX, PUSH CX, PUSH DX ile CPU durumunu yığına kaydedin. 2. SP değerini [0200H] adresine saklayın. 3. Yeni görevin SP değerini yükleyip POP DX, POP CX, POP BX, POP AX, POPF ile yeni göreve geçişi tamamlayın.',
            code: `; 🔴 Zor: Context Switching Simülasyonu
ORG 100H

; 1. Gorev 1 Calisma Durumu:
MOV AX, 1111H
MOV BX, 2222H
MOV CX, 3333H
MOV DX, 4444H

; Context Save: Gorev 1 durumunu yigina yedekle
PUSHF
PUSH AX
PUSH BX
PUSH CX
PUSH DX

; SP gostericisini Gorev 1 PCB alanina [0200h] sakla:
MOV [0200H], SP

; Context Restore Simülasyonu: Yigindan durumu geri yukle
POP DX
POP CX
POP BX
POP AX
POPF

HLT`,
            solutionCode: `ORG 100H
MOV AX, 1111H
MOV BX, 2222H
MOV CX, 3333H
MOV DX, 4444H
PUSHF
PUSH AX
PUSH BX
PUSH CX
PUSH DX
MOV [0200H], SP
POP DX
POP CX
POP BX
POP AX
POPF
HLT`,
            solutionBreakdown: [
              '1-4. Satır: Görev 1 register değerleri oluşturulur.',
              '5-9. Satır: PUSHF ve PUSH komutlarıyla FLAGS, AX, BX, CX, DX yığına atılır (Context Save).',
              '10. Satır: MOV [0200H], SP ile görevin yığın tepesi PCB (Process Control Block) içine saklanır.',
              '11-15. Satır: POP ve POPF ile ters sırada CPU durumu geri yüklenir (Context Restore).'
            ],
            examTips: 'İşletim sistemlerinde kesme hizmet rutinleri (ISR) sonlandığında IRET çağrılır. IRET otomatik olarak POP IP, POP CS ve POPF işlemlerini tek seferde yapar.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 5: AKIŞ KONTROLÜ & KOŞULLU ATLAMALAR
  // =========================================================================
  'milestone-5': {
    milestoneId: 'milestone-5',
    milestoneNumber: 5,
    title: 'Akış Kontrolü & Koşullu Atlamalar (JMP, JE, JNE, JL/JG, JB/JA, LOOP)',
    subtitle: 'İşaretli vs İşaretsiz Karşılaştırma Matrisi, Sonlu Durum Makinesi (FSM) ve Dizi Arama',
    slideRef: 'Week 6 & Week 11 Slaytları',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 5: PROGRAM DENETİMİ</div>
        <p class="lecture-hero-text">
          Program kontrol komutları <b>IP (Instruction Pointer)</b> yazmacını güncelleyerek kodun ardışıl akışını değiştirir.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>İşaretli vs İşaretsiz Atlama Ayrımı:</strong><br>
          • <strong>İşaretsiz (Unsigned) Karşılaştırmalar:</strong> <code>JA</code> (Above), <code>JAE</code>, <code>JB</code> (Below), <code>JBE</code> ➔ CF ve ZF bayraklarına bakar.<br>
          • <strong>İşaretli (Signed) Karşılaştırmalar:</strong> <code>JG</code> (Greater), <code>JGE</code>, <code>JL</code> (Less), <code>JLE</code> ➔ SF, OF ve ZF bayraklarına bakar ($SF \neq OF$).<br>
          • <code>LOOP Etiket</code> komutu her adımda otomatik <code>CX = CX - 1</code> yapar; <code>CX != 0</code> ise etikete sıçrar.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. Koşullu Dallanmalar & Algoritmik Akış',
        contentHtml: `
          <p>Karşılaştırma komutu <code>CMP Hedef, Kaynak</code> arka planda <code>Hedef - Kaynak</code> çıkarması yapar ve bayrakları kurar.</p>
          <table class="lecture-table">
            <tr><th>Komut</th><th>Açıklama</th><th>Bayrak Koşulu</th></tr>
            <tr><td><code>JE / JZ</code></td><td>Eşitse / Sıfırsa Atla</td><td>ZF = 1</td></tr>
            <tr><td><code>JNE / JNZ</code></td><td>Eşit Değilse Atla</td><td>ZF = 0</td></tr>
            <tr><td><code>JA / JNBE</code></td><td>Büyükse Atla (İşaretsiz)</td><td>CF = 0 ve ZF = 0</td></tr>
            <tr><td><code>JB / JNAE</code></td><td>Küçükse Atla (İşaretsiz)</td><td>CF = 1</td></tr>
            <tr><td><code>JG / JNLE</code></td><td>Büyükse Atla (İşaretli)</td><td>ZF = 0 ve SF = OF</td></tr>
            <tr><td><code>JL / JNGE</code></td><td>Küçükse Atla (İşaretli)</td><td>SF ≠ OF</td></tr>
          </table>
        `,
        examples: [
          {
            id: 'ex-m5-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 5.1: Temel Karşılaştırma ve İki Yollu Atlama (CMP & JE/JNE)',
            scenario: 'Kullanıcının girdiği bir onay karakterinin (\'Y\' = 59H) doğrulanması.',
            task: 'AL yazmacına 59H yükleyin. CMP AL, 59H ile karşılaştırın. Eşitse ESIT_KOLU etiketine atlayıp BX = 1 yapın; değilse BX = 0 yapıp programı sonlandırın.',
            code: `; 🟢 Kolay: Karşılaştırma ve İki Yollu Atlama
ORG 100H

MOV AL, 59H     ; 'Y' karakteri
CMP AL, 59H
JE ESIT_KOLU

MOV BX, 0000H   ; Eşit değilse
JMP SON

ESIT_KOLU:
MOV BX, 0001H   ; Eşitse

SON:
HLT`,
            solutionCode: `ORG 100H
MOV AL, 59H
CMP AL, 59H
JE ESIT_KOLU
MOV BX, 0000H
JMP SON
ESIT_KOLU:
MOV BX, 0001H
SON:
HLT`,
            solutionBreakdown: [
              '1. Satır: AL = 59h yüklenir.',
              '2. Satır: CMP AL, 59h ile 59h - 59h = 0 hesaplanır ve ZF = 1 olur.',
              '3. Satır: JE ESIT_KOLU ZF=1 olduğu için dallanmayı tetikler.',
              '4. Satır: BX = 1 atanır ve program durur.'
            ],
            examTips: 'İki yollu atlamalarda ilk kolun sonuna mutlaka JMP SON konulmalıdır; aksi halde program ikinci kolun içine de akar (Fall-through bug).'
          },
          {
            id: 'ex-m5-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 5.2: Dizideki En Büyük Elemanı ve İndeksini Bulma (Array Max Search)',
            scenario: 'Bir öğrenci notları dizisinde (sonu 0AAh ile işaretlenmiş) en yüksek notu ve kaçıncı sırada olduğunu bulan algoritmanın yazılması istenmektedir.',
            task: 'SI göstericisini [0200H] adresine verin. BL = 0 maksimum değer, CX = 0 indeks sayacı olsun. Her elemanı okuyun, 0AAh görünce bitirin. Eğer eleman BL\'den büyükse (JA) BL\'yi güncelleyin ve indisini DX\'e kaydedin.',
            code: `; 🟡 Orta: Dizide En Buyuk Elemani Bulma
ORG 100H

MOV SI, 0200H   ; Dizi adresi
MOV BL, 0       ; En buyuk eleman saklayici
MOV CX, 0       ; Sayac

TARA:
MOV AL, [SI]
CMP AL, 0AAH    ; Dizi sonu isaretcisi mi?
JE BITIR

CMP AL, BL
JBE KUCUK
MOV BL, AL      ; Yeni maksimumu kaydet
MOV DX, CX      ; Maksimumun indeksini DX'e kaydet

KUCUK:
INC SI
INC CX
JMP TARA

BITIR:
HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x12, 0x45, 0x9A, 0x33, 0x78, 0xAA] }
            ],
            solutionCode: `ORG 100H
MOV SI, 0200H
MOV BL, 0
MOV CX, 0
TARA:
MOV AL, [SI]
CMP AL, 0AAH
JE BITIR
CMP AL, BL
JBE KUCUK
MOV BL, AL
MOV DX, CX
KUCUK:
INC SI
INC CX
JMP TARA
BITIR:
HLT`,
            solutionBreakdown: [
              '1-3. Satır: Başlangıç değişkenleri (SI=0200h, BL=0, CX=0).',
              '4-6. Satır: Eleman okunur, 0AAh (son) mu diye bakılır.',
              '7-10. Satır: CMP AL, BL ile kıyaslanır. Büyükse BL = AL güncellenir ve DX = CX (indeks) saklanır.',
              '11-14. Satır: SI ve CX artırılarak sonraki elemana geçilir. Sonuç: BL = 9Ah, DX = 2.'
            ],
            examTips: 'Dizi sonu belirteci (Sentinel value) kullanmak, eleman sayısını önceden bilmediğimiz dinamik dizilerde en popüler sınav kurgusudur.'
          },
          {
            id: 'ex-m5-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 5.3: Asansör Motoru Kontrolcüsü (3 Konumlu Sonlu Durum Makinesi - FSM)',
            scenario: 'Bir akıllı bina asansöründe mevcut kat (CURRENT) ile çağrılan hedef kat (TARGET) karşılaştırılır: Hedef > Mevcut ➔ Motor YUKARI (DX = 1); Hedef < Mevcut ➔ Motor AŞAĞI (DX = 2); Hedef == Mevcut ➔ Motor DUR & KAPI AÇ (DX = 0). Asansör hedefe varana kadar birer kat ilerletilmelidir.',
            task: 'CURRENT = 2, TARGET = 5 verilsin. Döngü kurun: CURRENT < TARGET olduğu sürece DX = 1 yapıp CURRENT\'ı artırın. Eşit olduğunda döngüden çıkıp DX = 0 yapın.',
            code: `; 🔴 Zor: Asansor Motor Kontrolcüsü (FSM)
ORG 100H

MOV AL, 2       ; CURRENT_FLOOR = 2
MOV BL, 5       ; TARGET_FLOOR = 5

KONTROL_DONGUSU:
CMP AL, BL
JE HEDEFE_VARILDI
JB YUKARI_GIT
JA ASAGI_GIT

YUKARI_GIT:
MOV DX, 0001H   ; Motor: YUKARI
INC AL          ; Bir kat yukari cik
JMP KONTROL_DONGUSU

ASAGI_GIT:
MOV DX, 0002H   ; Motor: ASAGI
DEC AL          ; Bir kat asagi in
JMP KONTROL_DONGUSU

HEDEFE_VARILDI:
MOV DX, 0000H   ; Motor: DUR ve KAPI AC
HLT`,
            solutionCode: `ORG 100H
MOV AL, 2
MOV BL, 5
KONTROL_DONGUSU:
CMP AL, BL
JE HEDEFE_VARILDI
JB YUKARI_GIT
JA ASAGI_GIT
YUKARI_GIT:
MOV DX, 0001H
INC AL
JMP KONTROL_DONGUSU
ASAGI_GIT:
MOV DX, 0002H
DEC AL
JMP KONTROL_DONGUSU
HEDEFE_VARILDI:
MOV DX, 0000H
HLT`,
            solutionBreakdown: [
              '1-2. Satır: Başlangıç katı AL = 2, hedef kat BL = 5.',
              '3-6. Satır: FSM Durum Denetleyicisi: CMP AL, BL ile durum belirlenir.',
              '7-10. Satır: YUKARI_GIT bloğu DX = 1 yapar, AL 1 artırılır ve döngüye dönülür.',
              '15-17. Satır: AL = 5 olunca JE HEDEFE_VARILDI tetiklenir, DX = 0 yapılır ve durulur.'
            ],
            examTips: 'Sonlu Durum Makinelerinde (FSM) her durum bloğu görevini yaptıktan sonra mutlaka ana denetim döngüsüne (JMP KONTROL_DONGUSU) geri dönmelidir.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 6: DİZİ & STRİNG İŞLEMLERİ
  // =========================================================================
  'milestone-6': {
    milestoneId: 'milestone-6',
    milestoneNumber: 6,
    title: 'Dizi & String İşlemleri (MOVS, LODS, STOS, CMPS, SCAS, REP)',
    subtitle: 'Yüksek Hızlı Donanımsal Blok Transferi, Arama, Karşılaştırma, DF Bayrağı ve Bellek Sıfırlama',
    slideRef: 'Week 4 & Week 11 Slaytları',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 6: DONANIMSAL DİZİ KOMUTLARI</div>
        <p class="lecture-hero-text">
          8086, bellek bloklarını tek komut döngüsünde işleyebilen 5 özel donanımsal string komutuna sahiptir. Bu komutlar <b>DS:SI</b> (Kaynak) ve <b>ES:DI</b> (Hedef) indeks çiftini otomatik günceller.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>String Komutları Altın Kuralları:</strong><br>
          1. <strong>DF (Direction Flag) Yönü Belirler:</strong> <code>CLD</code> (DF=0) yapılırsa adresler artar (Auto-increment); <code>STD</code> (DF=1) yapılırsa adresler azalır (Auto-decrement).<br>
          2. <strong>Hedef Segment Kuralı:</strong> <code>ES:DI</code> hedef adresi daima <code>ES</code> segmentini referans alır ve segment ezme (override) yapılamaz!<br>
          3. <code>REP</code> öneki <code>CX</code> sıfır olana kadar komutu donanımsal olarak yineler.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. 5 Temel Dizi Komutu ve REP Önekleri',
        contentHtml: `
          <ul>
            <li><code>MOVSB / MOVSW</code>: <code>ES:[DI] = DS:[SI]</code> bellek kopyalama.</li>
            <li><code>LODSB / LODSW</code>: <code>AL/AX = DS:[SI]</code> bellekten yazmaca okuma.</li>
            <li><code>STOSB / STOSW</code>: <code>ES:[DI] = AL/AX</code> yazmaçtan belleğe yazma.</li>
            <li><code>SCASB / SCASW</code>: <code>AL/AX - ES:[DI]</code> arama yapma (ZF güncellenir).</li>
            <li><code>CMPSB / CMPSW</code>: <code>DS:[SI] - ES:[DI]</code> iki bloğu kıyaslama.</li>
          </ul>
        `,
        examples: [
          {
            id: 'ex-m6-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 6.1: Tek Komutla Bellek Blok Sıfırlama (STOSB & REP)',
            scenario: 'Grafik video tamponunu veya 16 baytlık bir bellek bölgesini tek hamlede sıfırlamak istenmektedir.',
            task: 'DI = 0200H adresini hedef belirleyin. AL = 00H temizleme baytını, CX = 16 sayacını kurun. CLD ve REP STOSB komutuyla 16 baytı sıfırlayın.',
            code: `; 🟢 Kolay: REP STOSB ile Bellek Temizleme
ORG 100H

MOV DI, 0200H   ; Hedef bellek ofseti
MOV AL, 00H     ; Yazilacak bayt (00h)
MOV CX, 16      ; 16 bayt temizlenecek

CLD             ; DF = 0 (Ileri yonde artsin)
REP STOSB       ; CX kez ES:[DI] = AL yap ve DI'yi artir

HLT`,
            solutionCode: `ORG 100H
MOV DI, 0200H
MOV AL, 00H
MOV CX, 16
CLD
REP STOSB
HLT`,
            solutionBreakdown: [
              '1-3. Satır: Hedef DI = 0200h, yazılacak bayt AL = 0, tekrar sayısı CX = 16.',
              '4. Satır: CLD — Direction Flag sıfırlanır, DI her adımda 1 artar.',
              '5. Satır: REP STOSB — 16 bayt sıfırlanır ve CX = 0 olunca durulur.'
            ],
            examTips: 'STOSB komutundan önce CLD komutunu unutursanız ve DF önceden 1 kalmışsa, bellek geriye doğru yazılır ve kritik kodların üzerine yazarak çökmeye neden olur.'
          },
          {
            id: 'ex-m6-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 6.2: Metin Dizgisi İçinde Karakter Arama ve Sayma (SCASB)',
            scenario: 'Bellekteki bir metin belgesinde kaç adet boşluk karakteri (\' \' = 20H) olduğunu sayan bir kelime analiz modülü yazılması istenmektedir.',
            task: 'DI = 0200H metin adresi, CX = 12 metin uzunluğu, AL = 20H (boşluk), BX = 0 sayaç kurun. CLD yapın. Döngüde SCASB komutunu işletin; eğer karakter eşitse (JE) BX sayacını artırın.',
            code: `; 🟡 Orta: SCASB ile Karakter Arama
ORG 100H

MOV DI, 0200H   ; Metin adresi
MOV CX, 12      ; 12 karakter tara
MOV AL, 20H     ; Aranan: Bosluk (' ')
MOV BX, 0       ; Bosluk sayaci

CLD

TARA:
SCASB           ; AL ile ES:[DI] karsilastir, DI++
JNE ATLA
INC BX          ; Bosluk bulunduysa BX++

ATLA:
LOOP TARA

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x41, 0x20, 0x42, 0x20, 0x43, 0x20, 0x44, 0x20, 0x45, 0x20, 0x46, 0x20] } // "A B C D E F "
            ],
            solutionCode: `ORG 100H
MOV DI, 0200H
MOV CX, 12
MOV AL, 20H
MOV BX, 0
CLD
TARA:
SCASB
JNE ATLA
INC BX
ATLA:
LOOP TARA
HLT`,
            solutionBreakdown: [
              '1-5. Satır: Arama parametreleri hazırlanır (AL=20h, BX=0 sayaç, CX=12 uzunluk).',
              '6. Satır: SCASB — AL ile [DI] kıyaslanır, DI otomatik 1 artar ve ZF güncellenir.',
              '7-8. Satır: JNE ATLA ile eşleşmeyenler atlanır, eşleşenlerde INC BX çalışır.',
              '9. Satır: LOOP ile 12 karakter taranır. Sonuç: BX = 6 boşluk.'
            ],
            examTips: 'SCASB hedef bellek olarak ES:DI kullanır. DS:SI kullanmaz! Kaynak bellekten okumak için LODSB kullanılır.'
          },
          {
            id: 'ex-m6-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 6.3: Ağ Paketi Blok Memcpy & Checksum Doğrulama',
            scenario: 'Ağ kartı tamponundan (0200h) gelen 8 word\'lük (16 bayt) veri paketi güvenli alana (0250h) REP MOVSW ile kopyalanmalı ve ardından LODSB ile 8-bitlik sağlama toplamı (Checksum) hesaplanmalıdır.',
            task: '1. SI = 0200H, DI = 0250H, CX = 8, CLD, REP MOVSW ile 16 baytı taşıyın. 2. SI = 0250H, CX = 16, AH = 0 kurun. LODSB ile bayt bayt okuyup ADD AH, AL yapın. Toplam AH yazmacında elde edilsin.',
            code: `; 🔴 Zor: Ag Paketi Memcpy & Checksum
ORG 100H

; 1. Asama: Hizli 16-bit Blok Transferi (REP MOVSW)
MOV SI, 0200H   ; Kaynak Paket Adresi
MOV DI, 0250H   ; Hedef Tampon Adresi
MOV CX, 8       ; 8 Kelime = 16 Bayt
CLD
REP MOVSW

; 2. Asama: Kopyalanan Paketin Checksum Hesabi
MOV SI, 0250H   ; Okunacak adres
MOV CX, 16      ; 16 bayt
MOV AH, 0       ; Checksum toplami

TOPLA:
LODSB           ; AL = [SI] ve SI++
ADD AH, AL      ; Toplama ekle
LOOP TOPLA

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x10, 0x20, 0x30, 0x40, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C] }
            ],
            solutionCode: `ORG 100H
MOV SI, 0200H
MOV DI, 0250H
MOV CX, 8
CLD
REP MOVSW
MOV SI, 0250H
MOV CX, 16
MOV AH, 0
TOPLA:
LODSB
ADD AH, AL
LOOP TOPLA
HLT`,
            solutionBreakdown: [
              '1-5. Satır: REP MOVSW ile 16 bayt tek komutta 8 kelime olarak transfer edilir (en yüksek veriyolu hızı).',
              '6-9. Satır: LODSB ile taşınan baytlar sırayla AL içine okunur ve AH içine toplanarak sağlama toplamı çıkarılır.'
            ],
            examTips: 'MOVSW komutu her adımda SI ve DI işaretçilerini 2 artırır (çünkü kelime/word 2 bayttır). MOVSB ise 1 artırır.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 7: G/Ç SİSTEMLERİ, PORTLAR & DMA 8237
  // =========================================================================
  'milestone-7': {
    milestoneId: 'milestone-7',
    milestoneNumber: 7,
    title: 'Giriş/Çıkış (I/O) Sistemleri, Portlar & DMA 8237',
    subtitle: 'Programmed I/O (Polling) vs Interrupt I/O vs DMA, Intel 8237 El Sıkışma Sinyalleri ve Donanım Portları',
    slideRef: 'Week 7 Slaytları & Brey Bölüm 11-13',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 7: G/Ç VE DOĞRUDAN BELLEK ERİŞİMİ (DMA)</div>
        <p class="lecture-hero-text">
          8086 mikroişlemcisi, bellek alanından bağımsız <b>64 KB ($2^{16} = 65,536$)</b> genişliğinde ayrı bir <b>Giriş/Çıkış (I/O) Port Haritasına</b> sahiptir (Isolated / Port-Mapped I/O).
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>G/Ç ve DMA Mimarisinin Temel Kuralları:</strong><br>
          1. <strong>Port Erişim Kuralı:</strong> Port numarası <code>00h - FFh</code> (0–255) arasında ise doğrudan yazılabilir (Örn: <code>IN AL, 60h</code>). Port 255'ten büyükse port adresi MUTLAKA <code>DX</code> yazmacına yüklenmelidir (Örn: <code>MOV DX, 0378h</code> ➔ <code>IN AL, DX</code>).<br>
          2. <strong>DMA (Direct Memory Access) Prensibi:</strong> CPU'yu tamamen devre dışı bırakarak çevre birimleri (Disk, Ağ) ile bellek arasında yüksek hızlı veri taşır.<br>
          3. <strong>8237 DMA El Sıkışma Sinyalleri:</strong> <code>DREQ</code> (İstek) ➔ <code>HOLD</code> (Pin 31, CPU'ya veriyolunu bırak emri) ➔ <code>HLDA</code> (Pin 30, CPU veriyolunu High-Z yaptı onayı) ➔ <code>DACK</code> ➔ Transfer ➔ <code>TC / EOP</code> (Bitti).
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. Port İletişimi, Polling ve DMA 8237 Denetleyicisi',
        contentHtml: `
          <h4>3 G/Ç Yönteminin Karşılaştırması:</h4>
          <ul>
            <li><b>1. Programmed I/O (Polling / Busy-Waiting):</b> CPU sürekli port durumunu döngüde kontrol eder. CPU zamanını en çok tüketen verimsiz yöntemdir.</li>
            <li><b>2. Interrupt-Driven I/O:</b> Donanım hazır olduğunda CPU'ya kesme (INT) gönderir. CPU hazır olana kadar kendi işini yapar.</li>
            <li><b>3. Direct Memory Access (DMA):</b> CPU veri taşıma işine hiç karışmaz. 8237 DMA çipi bellek ile cihaz arasında doğrudan transfer yapar (Burst Modu veya Çevrim Çalma / Cycle Stealing).</li>
          </ul>
        `,
        examples: [
          {
            id: 'ex-m7-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 7.1: G/Ç Portlarından Doğrudan Okuma ve Yazma (IN & OUT)',
            scenario: 'Donanım klavye durum portundan (Port 64h) kontrol baytını okumak ve komut portuna (Port 64h) kendini test et komutu (0AAh) göndermek.',
            task: 'IN AL, 64H ile portu okuyun. MOV AL, 0AAH yükleyip OUT 64H, AL ile komut portuna yazın.',
            code: `; 🟢 Kolay: Port Okuma ve Yazma (IN & OUT)
ORG 100H

; Port 64h durumunu AL yazmacina oku:
IN AL, 64H

; Self-Test komutunu (0AAh) porta yaz:
MOV AL, 0AAH
OUT 64H, AL

HLT`,
            solutionCode: `ORG 100H
IN AL, 64H
MOV AL, 0AAH
OUT 64H, AL
HLT`,
            solutionBreakdown: [
              '1. Satır: IN AL, 64H — Port 64h\'deki donanım mandalı (latch) okunur.',
              '2-3. Satır: OUT 64H, AL — AL içindeki 0AAh komut baytı donanım portuna iletilir.'
            ],
            examTips: 'IN ve OUT komutlarında veri akışı daima akümülatör (AL/AX) üzerinden yapılmak zorundadır (Örn: OUT 64h, BL YASAKTIR!).'
          },
          {
            id: 'ex-m7-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 7.2: Programmed I/O (Polling) ile Yazıcı Port Durumu Bekleme',
            scenario: 'Bir paralel yazıcıya (LPT Port 378h) veri göndermeden önce durum portundaki (Port 379h) Meşgul (Busy - Bit 7) sinyalinin sıfır olmasının beklenmesi gerekmektedir.',
            task: 'DX = 0379H portunu okuyun (IN AL, DX). TEST AL, 80H ile meşgul bitini test edin. Meşgul ise (JNZ) bekleyin. Hazır olduğunda DX = 0378H yapın, AL = \'A\' (41h) karakterini OUT DX, AL ile yazıcıya gönderin.',
            code: `; 🟡 Orta: Polling (Busy-Waiting) Dongusu
ORG 100H

MOV DX, 0379H   ; Durum portu adresi (> 255 oldugu icin DX'te)

BEKLE:
IN AL, DX       ; Durum portunu oku
TEST AL, 80H    ; Bit 7 (Busy) 1 mi?
JNZ BEKLE       ; 1 ise mesguldur, beklemeye devam et!

; Yazici bosaldi, veriyi gonder:
MOV DX, 0378H   ; Veri portu adresi
MOV AL, 'A'     ; Gonderilecek karakter (41h)
OUT DX, AL

HLT`,
            solutionCode: `ORG 100H
MOV DX, 0379H
BEKLE:
IN AL, DX
TEST AL, 80H
JNZ BEKLE
MOV DX, 0378H
MOV AL, 'A'
OUT DX, AL
HLT`,
            solutionBreakdown: [
              '1. Satır: Port numarası 255\'ten büyük olduğu için DX yazmacına alınır.',
              '2-4. Satır: TEST AL, 80h ile Bit 7 meşguliyet kontrolü yapılır (Polling döngüsü).',
              '5-7. Satır: Meşguliyet kalkınca (ZF=1) döngüden çıkılır ve Port 378h\'ye \'A\' karakteri basılır.'
            ],
            examTips: 'Port numarası 00h-FFh aralığında ise doğrudan yazılabilir (IN AL, 60h). Ancak 100h-FFFFh aralığında port mutlaka DX içinde verilmelidir.'
          },
          {
            id: 'ex-m7-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 7.3: Intel 8237 DMA Denetleyicisi Blok Bellek Transferi Simülasyonu',
            scenario: 'c:\\Users\\erdem\\Desktop\\Dersler\\Microprocessor\\geçen yıl\\MicroProcessor code examples week.pdf Week 9 profesör örneği: Intel 8237 DMA Kanal 2 denetleyicisi simülasyonunda, kaynak bellek bloğundan hedef bellek alanına word birimlerinde blok transferi gerçekleştirilip DMA Terminal Count (TC) bayrağı raporlanmalıdır.',
            task: 'SI = 0200H (Kaynak), DI = 0250H (Hedef), CX = 4 (Kelime Sayacı) kurun. CLD ve REP MOVSW komutuyla 4 kelimeyi (8 bayt) aktarın. Transfer tamamlandığında DMA TC (Terminal Count) sinyalini simüle etmek için DX = 0001H kurun.',
            code: `; 🔴 Zor: Intel 8237 DMA Blok Transfer Simülasyonu
ORG 100H

; DMA Kanal Parametreleri:
MOV SI, 0200H   ; DMA Base Source Address
MOV DI, 0250H   ; DMA Base Destination Address
MOV CX, 4       ; DMA Transfer Count (Word)

CLD
REP MOVSW       ; Donanimsal Burst Mode Word Transferi

; DMA Transfer Bitti Sinyali (TC = Terminal Count):
MOV DX, 0001H   ; DX = 1: DMA TC Aktif

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x34, 0x12, 0x78, 0x56, 0xBC, 0x9A, 0xF0, 0xDE] }
            ],
            solutionCode: `ORG 100H
MOV SI, 0200H
MOV DI, 0250H
MOV CX, 4
CLD
REP MOVSW
MOV DX, 0001H
HLT`,
            solutionBreakdown: [
              '1-3. Satır: 8237 DMA denetleyicisinin taban adres ve sayaç yazmaçları simüle edilir.',
              '4-5. Satır: REP MOVSW ile CPU döngü maliyetine girmeden yüksek hızlı blok transferi yapılır.',
              '6. Satır: MOV DX, 0001H — DMA transferinin başarıyla bittiğini bildiren Terminal Count (TC) sinyali üretilir.'
            ],
            examTips: 'Sınavda 8237 DMA el sıkışma sinyal sırası sorulur: DREQ (Cihaz ister) ➔ HOLD (CPU\'ya iletilir) ➔ HLDA (CPU yolu bırakır) ➔ DACK (Onaylanır) ➔ Veri Akar ➔ TC (Transfer biter).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 8: KESMELER (INTERRUPTS), IVT & 8259 PIC
  // =========================================================================
  'milestone-8': {
    milestoneId: 'milestone-8',
    milestoneNumber: 8,
    title: 'Kesmeler (Interrupts), 256 Vektörlü IVT & 8259 PIC',
    subtitle: 'Kesme Vektör Tablosu (00000H–003FFH), INT 10h/16h/21h Servisleri, ISR ve IRET Yaşam Döngüsü',
    slideRef: 'Week 6 Slaytları & Brey Bölüm 12',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 8: KESME SİSTEMİ & IVT</div>
        <p class="lecture-hero-text">
          Kesme (Interrupt), işlemcinin normal akışını geçici olarak durdurup öncelikli bir donanım veya yazılım olayına hizmet etmesini (Interrupt Service Routine - ISR) sağlayan mekanizmadır.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>IVT ve Kesme Döngüsü Altın Kuralları:</strong><br>
          1. <strong>IVT Konumu:</strong> Belleğin ilk 1 KB'ı ($00000\text{h} - 003\text{FF}\text{h}$) Kesme Vektör Tablosudur (256 vektör × 4 bayt).<br>
          2. <strong>Vektör Adres Formülü:</strong> $\text{IVT Fiziksel Adresi} = \text{Tip Numarası} \times 4$. Örneğin Tip 21h için adres: $21\text{h} \times 4 = 84\text{h}$ ($0000:0084\text{h}$).<br>
          3. <strong>Vektör Formatı:</strong> İlk 2 bayt ISR ofset adresi (IP), sonraki 2 bayt ISR segment adresidir (CS).<br>
          4. <strong>Kesme Donanım Döngüsü:</strong> 1. PUSHF ➔ 2. IF=0, TF=0 ➔ 3. PUSH CS, PUSH IP ➔ 4. IVT'den yeni IP ve CS yüklenir ➔ 5. ISR çalışır ➔ 6. <code>IRET</code> ile bayraklar ve adres geri yüklenir.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. BIOS/DOS Kesmeleri & Özel ISR Kurulumu',
        contentHtml: `
          <h4>Önemli Standart Kesmeler:</h4>
          <ul>
            <li><code>Tip 0 (00h):</code> Divide Error (0'a bölme veya taşma hatası).</li>
            <li><code>Tip 1 (04h):</code> Single Step (TF = 1 iken hata ayıklama kesmesi).</li>
            <li><code>Tip 2 (08h):</code> NMI (Non-Maskable Interrupt - Donanımsal kritik hata).</li>
            <li><code>Tip 3 (0Ch):</code> Breakpoint (0xCC - Tek baytlık kesme noktası).</li>
            <li><code>INT 10h:</code> BIOS Video Hizmetleri (AH = 0Eh: Ekrana teletype karakter bas).</li>
            <li><code>INT 16h:</code> BIOS Klavye Hizmetleri (AH = 00h: Tuş basılmasını bekle).</li>
            <li><code>INT 21h:</code> DOS API Hizmetleri (AH = 09h: Sonu $ olan dizgiyi bas).</li>
          </ul>
        `,
        examples: [
          {
            id: 'ex-m8-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 8.1: BIOS Video Kesmesi ile Ekrana Karakter Yazdırma (INT 10h)',
            scenario: 'c:\\Users\\erdem\\Desktop\\Dersler\\Microprocessor\\geçen yıl\\MicroProcessor code examples week.pdf Week 12 örneği: BIOS INT 10h video servisini kullanarak terminale \'A\' karakteri basma.',
            task: 'AH = 0EH (Teletype servisi), AL = \'A\' (41h) yükleyin. INT 10H çağırarak ekrana karakteri basın ve HLT ile durun.',
            code: `; 🟢 Kolay: BIOS Video Kesmesi (INT 10h)
ORG 100H

MOV AH, 0EH     ; Teletype Karakter Yazma Servisi
MOV AL, 'A'     ; Ekrana basılacak karakter
INT 10H         ; BIOS Video Kesmesi

HLT`,
            solutionCode: `ORG 100H
MOV AH, 0EH
MOV AL, 'A'
INT 10H
HLT`,
            solutionBreakdown: [
              '1. Satır: AH = 0Eh teletype fonksiyon kodu seçilir.',
              '2. Satır: AL = 41h (\'A\') yazılacak karakter atanır.',
              '3. Satır: INT 10H çağrılır ve BIOS konsola karakteri yazar.'
            ],
            examTips: 'INT 10h AH=0Eh teletype çıktısı imleci otomatik olarak bir sağa kaydırır. Ekran denetleyicisi ile en temel etkileşim biçimidir.'
          },
          {
            id: 'ex-m8-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 8.2: DOS API (INT 21h) ile Konsola Sonu Dolar İşaretli Dizgi Yazdırma',
            scenario: 'DOS işletim sisteminde ekrana yazı basmak için INT 21H kesmesinin AH = 09H servisi kullanılır. String adresi DX yazmacına verilir ve sonu mutlaka dolar ($) ile bitmelidir.',
            task: 'DS:0120h adresindeki "KOD$" dizgisini DX içine yükleyin. AH = 09H seçin ve INT 21H çağırarak konsola metni yazdırın.',
            code: `; 🟡 Orta: DOS INT 21h String Yazdirma
ORG 100H

MOV DX, 0120H   ; String ofset adresi
MOV AH, 09H     ; DOS Print String Fonksiyonu
INT 21H         ; Ekrana "KOD" basar ($ gorunce durur)

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0120, bytes: [0x4B, 0x4F, 0x44, 0x24] } // "KOD$"
            ],
            solutionCode: `ORG 100H
MOV DX, 0120H
MOV AH, 09H
INT 21H
HLT`,
            solutionBreakdown: [
              '1. Satır: MOV DX, 0120H — Yazdırılacak metnin adresi verilir.',
              '2. Satır: MOV AH, 09H — DOS API 9. servisi seçilir.',
              '3. Satır: INT 21H — DOS stringi ekrana basar ve $ karakterinde durur.'
            ],
            examTips: 'Metin sonuna $ (24h) konulmazsa DOS bellekte rastgele bir $ görene kadar tüm belleği ekrana çöp karakterler olarak basar!'
          },
          {
            id: 'ex-m8-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 8.3: Özel Donanım Kesme Hizmet Rutini (ISR) ve IVT Vektör Kurulumu',
            scenario: 'Sistemde Tip 60h kesmesi için özel bir kesme servis rutini (MY_ISR) tanımlanacaktır. IVT adresi: Tip 60h × 4 = 0180h (0000:0180h). Rutin çalıştığında DX = 0AA55h imza değerini kurup IRET ile geri dönecektir.',
            task: '1. CLI ile kesmeleri geçici durdurun. 2. IVT [0180h] adresine MY_ISR ofsetini yazın. 3. [0182h] adresine CS segmentini yazın. 4. STI ile kesmeleri açın. 5. INT 60H komutunu tetikleyip rutinin çalıştığını ve IRET ile döndüğünü doğrulayın.',
            code: `; 🔴 Zor: IVT Vektor Kurulumu ve Ozel ISR
ORG 100H

CLI             ; Vektor yazilirken kesmeleri engelle

; IVT 0000:0180h adresine MY_ISR ofsetini yaz:
MOV WORD PTR [0180H], OFFSET MY_ISR

; IVT 0000:0182h adresine CS segmentini yaz:
MOV WORD PTR [0182H], CS

STI             ; Kesmeleri tekrar ac

; Ozel kesmeyi yazilimsal tetikle:
INT 60H

HLT

; Ozel Kesme Hizmet Rutini (ISR):
MY_ISR:
MOV DX, 0AA55H  ; Donanim basari imzasi
IRET            ; Kesmeden donus (POPF, POP CS, POP IP)`,
            solutionCode: `ORG 100H
CLI
MOV WORD PTR [0180H], OFFSET MY_ISR
MOV WORD PTR [0182H], CS
STI
INT 60H
HLT

MY_ISR:
MOV DX, 0AA55H
IRET`,
            solutionBreakdown: [
              '1. Satır: CLI — Kesme vektörü yazılırken araya başka kesme girmesin diye IF=0 yapılır.',
              '2-3. Satır: IVT 0180h adresine rutinin ofset ve segmenti kaydedilir (Tip 60h × 4 = 0180h).',
              '4. Satır: STI ile kesmeler tekrar devreye alınır.',
              '5. Satır: INT 60H ile CPU IVT\'den adresi çeker ve MY_ISR\'a sıçrar.',
              '8-9. Satır: Rutin DX = AA55h yapar ve IRET ile ana koda döner.'
            ],
            examTips: 'Bir kesme servis rutini RET ile DEĞİL, MUTLAKA IRET (Interrupt Return) ile sonlandırılmalıdır! Çünkü IRET yığından bayrakları (FLAGS) da geri yükler.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // AŞAMA 9: İLERİ İŞLEMCİ MİMARİSİ, PIPELINING, CISC/RISC & 8085
  // =========================================================================
  'milestone-9': {
    milestoneId: 'milestone-9',
    milestoneNumber: 9,
    title: 'İleri İşlemci Mimarisi, Boru Hattı (Pipelining), CISC/RISC & 8085',
    subtitle: '5 Aşamalı Komut Boru Hattı, Hazards (Tehlikeler), Loop Unrolling, CISC vs RISC ve Intel 8085',
    slideRef: 'Week 12, 13, 14 & 15 Slaytları & Müfredat Kılavuzu',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 9: BORU HATTI & MİMARİ MUKAYESE</div>
        <p class="lecture-hero-text">
          Modern işlemcilerin temel performans artırıcı tekniği <b>Pipelining (Komut Boru Hattı)</b> mimarisidir. Komut işletim döngüsü 5 bağımsız donanım aşamasına bölünür: 
          <b>IF</b> (Fetch), <b>ID</b> (Decode), <b>EX</b> (Execute), <b>MEM</b> (Memory Access), <b>WB</b> (Writeback).
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>Boru Hattı Hızlanması & Tehlikeler (Hazards):</strong><br>
          • <strong>İdeal Hızlanma:</strong> $k$ aşamalı bir boru hattında $n$ komut için hızlanma $S = \frac{n \cdot k}{k + n - 1}$ olur. $n \to \infty$ iken hızlanma $k$ katına yaklaşır ve her çevrimde 1 komut tamamlanır ($\text{CPI} \approx 1$).<br>
          • <strong>Structural Hazard:</strong> İki komutun aynı anda aynı donanım birimine (örn. tek bellek portu) erişmek istemesi. Harvard mimarisi (ayrı veri ve kod yolu) ile çözülür.<br>
          • <strong>Data Hazard (RAW):</strong> Bir komutun henüz önceki komut tarafından yazılmamış veriyi okumaya çalışması. <b>Data Forwarding (Bypassing)</b> ile çözülür.<br>
          • <strong>Control Hazard:</strong> Koşullu atlamalarda hangi yolun seçileceğinin geç öğrenilmesi. <b>Branch Prediction (Dallanma Tahmini)</b> ve boru hattı boşaltma (Flush) ile yönetilir.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. CISC vs RISC & Intel 8085 Mimarisi',
        contentHtml: `
          <h4>CISC vs RISC Karşılaştırma Matrisi:</h4>
          <table class="lecture-table">
            <tr><th>Özellik</th><th>CISC (Intel x86)</th><th>RISC (ARM, MIPS, RISC-V)</th></tr>
            <tr><td>Komut Yapısı</td><td>Değişken uzunluklu (1–15 bayt), karmaşık</td><td>Sabit uzunluklu (32-bit), basit</td></tr>
            <tr><td>Bellek Erişimi</td><td>Komutlar doğrudan belleğe erişebilir (MOV [BX], AX)</td><td>Sadece LOAD ve STORE komutları belleğe erişir</td></tr>
            <tr><td>Yazmaç Sayısı</td><td>Az sayıda özel amaçlı yazmaç (AX, BX...)</td><td>Çok sayıda genel amaçlı yazmaç (R0–R31)</td></tr>
            <tr><td>Boru Hattı Uyumu</td><td>Karmaşık çözme (Decode) gerektirir</td><td>Boru hattına mükemmel uyumludur (CPI ≈ 1)</td></tr>
          </table>
          <h4>Intel 8085 (8-bit) Mimarisi:</h4>
          <p>
            8085, 8-bitlik bir akümülatör (<code>A</code>) ve 6 adet 8-bitlik genel yazmaca (<code>B, C, D, E, H, L</code>) sahiptir. 
            <code>HL</code> çifti birlikte 16-bitlik bellek göstericisi (<code>M</code>) olarak kullanılır. 
            8086'nın <code>AX, BX, CX, DX</code> yapısı 8085'in bu yazmaç mirasının 16-bitlik genişletilmiş halidir.
          </p>
        `,
        examples: [
          {
            id: 'ex-m9-kolay',
            difficulty: 'kolay',
            difficultyLabel: '🟢 Kolay: Doğrudan & Birebir',
            title: 'Alıştırma 9.1: Intel 8085 Komut Kümesi ve Akümülatör Simülasyonu',
            scenario: '8085 mikroişlemcisinin klasik "MVI A, 25h", "MVI B, 15h" ve "ADD B" komut zincirinin 8086 karşılığı ile çalıştırılması.',
            task: '8085 akümülatörünü AL, B yazmacını BL olarak simüle edin. AL içine 25H, BL içine 15H yükleyin. ADD AL, BL komutunu vererek akümülatörde 3Ah toplamını elde edin.',
            code: `; 🟢 Kolay: 8085 Akümülatör Aritmetiği
ORG 100H

; 8085: MVI A, 25h
MOV AL, 25H

; 8085: MVI B, 15h
MOV BL, 15H

; 8085: ADD B (A = A + B)
ADD AL, BL

HLT`,
            solutionCode: `ORG 100H
MOV AL, 25H
MOV BL, 15H
ADD AL, BL
HLT`,
            solutionBreakdown: [
              '1. Satır: MOV AL, 25h — 8085\'teki MVI A (Move Immediate to Accumulator) komutudur.',
              '2. Satır: MOV BL, 15h — 8085\'teki MVI B komutudur.',
              '3. Satır: ADD AL, BL — 8085\'teki ADD B komutunun birebir karşılığıdır (AL = 3Ah).'
            ],
            examTips: '8085\'te tüm aritmetik işlemler akümülatör (A) üzerinde biter. 8086 ise akümülatör zorunluluğunu esneterek genel yazmaçlar arası toplamaya da izin vermiştir.'
          },
          {
            id: 'ex-m9-orta',
            difficulty: 'orta',
            difficultyLabel: '🟡 Orta: Anlamlı Senaryo',
            title: 'Alıştırma 9.2: Boru Hattı Hızlandırması için Döngü Açma (Loop Unrolling)',
            scenario: 'c:\\Users\\erdem\\Desktop\\Dersler\\Microprocessor\\geçen yıl\\MicroProcessor code examples week.pdf Week 13 profesör örneği: Pipelined işlemcilerde döngü dallanma cezalarını (Branch Penalties / Flush) engellemek için döngü gövdesi açılarak (Loop Unrolling) ardışıl çalıştırılır.',
            task: 'AX = 0 olsun. LOOP kullanmak yerine döngüyü açarak 4 kez art arda ADD AX, 1 komutu çalıştırın. Dallanma maliyeti olmadan AX = 4 elde edilişini gözlemleyin.',
            code: `; 🟡 Orta: Loop Unrolling (Dongu Acma)
ORG 100H

MOV AX, 0

; Loop komutu yerine acilmis ardısıl komutlar:
ADD AX, 1   ; 1. iterasyon
ADD AX, 1   ; 2. iterasyon
ADD AX, 1   ; 3. iterasyon
ADD AX, 1   ; 4. iterasyon

HLT`,
            solutionCode: `ORG 100H
MOV AX, 0
ADD AX, 1
ADD AX, 1
ADD AX, 1
ADD AX, 1
HLT`,
            solutionBreakdown: [
              '1. Satır: AX = 0 başlatılır.',
              '2-5. Satır: LOOP komutunun her adımda yaptığı CX azaltma ve koşullu atlama gecikmesi olmadan, boru hattı kesintisiz beslenerek AX = 4 hesaplanır.'
            ],
            examTips: 'Loop Unrolling, kod boyutunu biraz artırır (Code size expansion) ancak dallanma cezalarını (Branch Penalty) ortadan kaldırarak boru hattı verimini maksimuma çıkarır.'
          },
          {
            id: 'ex-m9-zor',
            difficulty: 'zor',
            difficultyLabel: '🔴 Zor: Gerçek Hayat / Donanım Sürücüsü',
            title: 'Alıştırma 9.3: Boru Hattı Veri Bağımlılığı (RAW Hazard) Giderme & Komut Yeniden Sıralama',
            scenario: 'Derleyici optimizasyonu simülasyonu: Bir LOAD komutunun hemen ardından gelen komut aynı yazmacı kullanırsa (Load-Use RAW Data Hazard), boru hattı 1 çevrim donar (Stall/Bubble). Optimize edici derleyici araya bağımsız bir komut sokarak stall oluşmasını engeller.',
            task: 'Ham kod: 1. MOV AX, [0200H] (Load), 2. ADD AX, BX (Use - RAW stall yaratır!), 3. MOV CX, 0010H (Bağımsız). Bu komutları akıllıca yeniden sıralayarak: MOV AX, [0200H] ➔ MOV CX, 0010H (araya bağımsız komut) ➔ ADD AX, BX şeklinde boru hattını dolduran optimize kodu yazın.',
            code: `; 🔴 Zor: Instruction Rescheduling (Komut Yeniden Siralama)
ORG 100H

MOV BX, 0005H   ; On hazirlik

; 1. Load komutu:
MOV AX, [0200H]

; 2. Bagimsiz komut araya alinir (RAW stall'u engeller!):
MOV CX, 0010H

; 3. Artik AX hazir, guvenle kullanilabilir:
ADD AX, BX

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x20, 0x00] } // [0200] = 0020h
            ],
            solutionCode: `ORG 100H
MOV BX, 0005H
MOV AX, [0200H]
MOV CX, 0010H
ADD AX, BX
HLT`,
            solutionBreakdown: [
              '1. Satır: BX = 5.',
              '2. Satır: MOV AX, [0200H] — Bellekten okuma başlar (MEM aşaması).',
              '3. Satır: MOV CX, 0010H — Araya bağımsız bir komut yerleştirilerek CPU boş beklemek yerine (Stall/NOP yerine) faydalı iş yapar.',
              '4. Satır: ADD AX, BX — AX değeri bellekten gelmiş olduğu için bekleme olmadan doğrudan yürütülür (AX = 20h + 5 = 25h).'
            ],
            examTips: 'Derleyicilerin yaptığı Instruction Rescheduling (Komut Yeniden Sıralama), donanıma ek maliyet getirmeden salt yazılımla boru hattı kabarcıklarını (Stalls/Bubbles) yok eder.'
          }
        ]
      }
    ]
  }
};
