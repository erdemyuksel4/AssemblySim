export interface LectureExample {
  id: string;
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
  'milestone-1': {
    milestoneId: 'milestone-1',
    milestoneNumber: 1,
    title: 'Temel Yazmaçlar & Veri Aktarımı (MOV & XCHG)',
    subtitle: 'İvedi (Immediate), Doğrudan (Direct) ve Dolaylı (Indirect) Adresleme ile 8086 Veri Akışı',
    slideRef: 'Week 2, 3 & 4 Slaytları (Brey 8. Baskı Bölüm 3-4)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 1: TEMEL KAVRAMLAR</div>
        <p class="lecture-hero-text">
          8086 mikroişlemcisinde programlamanın temeli <b>veri aktarımı</b>dır. Bilgisayarda gerçekleştirilen tüm aritmetik, mantıksal veya kontrol işlemlerinden önce veriler bellekten veya sabitlerden yazmaçlara (registers) getirilmelidir.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>Hocanın Altın Kuralı:</strong> <code>MOV Hedef, Kaynak</code> komutunda veri akışı <strong>DAİMA SAĞDAN SOLA</strong> gerçekleşir. Kaynaktaki veri silinmez, kopyalanır. Bellekten belleğe doğrudan aktarım (örn: <code>MOV [0200H], [0100H]</code>) 8086 mimarisinde <strong>YASAKTIR!</strong>
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. 8086 Genel Amaçlı Yazmaçları (AX, BX, CX, DX)',
        contentHtml: `
          <p>8086 mikroişlemcisi 16-bit mimariye sahiptir ve 4 adet genel amaçlı yazmacı ikiye bölünerek 8-bit olarak da kullanılabilir:</p>
          <div class="lecture-reg-diagram">
            <div class="reg-box"><b>AX (16-bit Akümülatör)</b> = AH (Yüksek 8-bit) : AL (Düşük 8-bit)</div>
            <div class="reg-box"><b>BX (16-bit Taban / Base)</b> = BH : BL <i>(Bellek adreslemede ofset tutabilir)</i></div>
            <div class="reg-box"><b>CX (16-bit Sayıcı / Counter)</b> = CH : CL <i>(Döngülerde LOOP sayacıdır)</i></div>
            <div class="reg-box"><b>DX (16-bit Veri / Data)</b> = DH : DL <i>(Çarpma/bölme ve I/O portlarında kullanılır)</i></div>
          </div>
          <p>
            <strong>Dikkat:</strong> Boyut uyuşmazlığı hatadır! 16-bit yazmaca 8-bit yazmaç kopyalanamaz (Örn: <code>MOV AX, BL</code> derleme hatası verir).
          </p>
        `,
        examples: [
          {
            id: 'ex-m1-immediate',
            title: 'Canlı Örnek 1: İvedi (Immediate) ve Yazmaçlar Arası Aktarım',
            scenario: 'Sensör yapılandırma yazmaçlarına başlangıç sabitleri (0x1234 ve 0x5678) yüklenecek ve kopyalama testi yapılacaktır.',
            task: 'AX içine 1234H, BX içine 5678H sabitlerini yükleyin. Ardından CX içine AX değerini kopyalayıp HLT ile durun.',
            code: `; Örnek 1: Ivedi ve Yazmac Kopyalama
ORG 100H

MOV AX, 1234H
MOV BX, 5678H
MOV CX, AX

HLT`,
            solutionCode: `ORG 100H
MOV AX, 1234H
MOV BX, 5678H
MOV CX, AX
HLT`,
            solutionBreakdown: [
              '1. Satır: ORG 100H — DOS COM formatında kodun CS:0100h adresinden başladığını belirtir.',
              '2. Satır: MOV AX, 1234H — AX = 1234h olur (AH = 12h, AL = 34h). İvedi (Immediate) adreslemedir.',
              '3. Satır: MOV BX, 5678H — BX = 5678h olur (BH = 56h, BL = 78h).',
              '4. Satır: MOV CX, AX — AX değeri CX içine kopyalanır. CX = 1234h olur. AX değişmez.',
              '5. Satır: HLT — İşlemciyi durdurur (Halt). Komut işletimini sonlandırır.'
            ],
            examTips: 'Sınavda hoca sayıların sonundaki "H" (Hexadecimal) harfini unutursanız onluk (decimal) tabanda algılayacağı için puan kırabilir. Daima 16\'lık tabanda H ekleyin.'
          }
        ]
      },
      {
        title: '2. Doğrudan Bellek Adresleme & Little-Endian Kuralı',
        contentHtml: `
          <p>Köşeli parantez <code>[...]</code> bellek erişimi anlamına gelir. Örneğin <code>MOV AX, [0200H]</code> komutu DS:0200h adresindeki veriyi okur.</p>
          <div class="lecture-callout-info">
            🧩 <strong>Little-Endian Mimarisi:</strong> Intel x86 mimarisinde çok baytlı (16-bit word) sayılar belleğe saklanırken <strong>DÜŞÜK ANLAMLI BAYT DÜŞÜK ADRESE (Low Byte ➔ Low Address)</strong>, yüksek anlamlı bayt yüksek adrese yazılır.<br>
            Örneğin <code>1234H</code> sayısı belleğe yazıldığında:
            <ul>
              <li><code>[0200H] = 34H</code> (Düşük bayt)</li>
              <li><code>[0201H] = 12H</code> (Yüksek bayt)</li>
            </ul>
          </div>
        `,
        examples: [
          {
            id: 'ex-m1-memory-read',
            title: 'Canlı Örnek 2: Bellekten Word Okuma ve Hedef Adrese Yazma',
            scenario: 'DS:0200h adresinde telemetri verisi olan 0xBEEF (EFh, BEh) baytları bulunmaktadır. Bu veriyi okuyup DS:0202h adresine kopyalayınız.',
            task: 'DS:0200h adresindeki 16-bit kelimeyi AX içine okuyun, ardından bu değeri [0202H] adresine yazın.',
            code: `; Örnek 2: Bellek Okuma ve Yazma
ORG 100H

MOV AX, [0200H]
MOV [0202H], AX

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0xEF, 0xBE] }
            ],
            solutionCode: `ORG 100H
MOV AX, [0200H]
MOV [0202H], AX
HLT`,
            solutionBreakdown: [
              '1. Satır: MOV AX, [0200H] — DS:0200h adresindeki EFh düşük bayt AL\'ye, 0201h adresindeki BEh yüksek bayt AH\'ye gelir. AX = BEEFh olur.',
              '2. Satır: MOV [0202H], AX — AX\'in içeriği (BEEFh) bellek adresine yazılır: [0202h]=EFh, [0203h]=BEh.',
              '3. Satır: HLT — Program durur.'
            ],
            examTips: 'Bellekten belleğe doğrudan kopyalama yapılamadığı için (MOV [0202H], [0200H] geçersizdir), aracı olarak daima AX gibi bir yazmaç kullanılmalıdır!'
          }
        ]
      },
      {
        title: '3. XCHG (Exchange) Komutu ile Değiş-Tokuş',
        contentHtml: `
          <p><code>XCHG Hedef, Kaynak</code> komutu iki operantın değerini aracı bir yazmaca veya değişkene gerek duymadan takas eder.</p>
          <div class="lecture-callout-tip">
            ⚡ <strong>Verimlilik:</strong> Üç adet MOV komutuyla geçici değişkende tutarak takas etmek yerine tek bir XCHG komutu çok daha az makine kodu üretir ve daha hızlı çalışır.
          </div>
        `,
        examples: [
          {
            id: 'ex-m1-xchg-swap',
            title: 'Canlı Örnek 3: XCHG ile İki Yazmacın Değerini Takas Etme',
            scenario: 'AX = 1111h ve BX = 9999h değerleri ile başlanıyor. Bu iki yazmacın değerleri yer değiştirmelidir.',
            task: 'XCHG komutunu kullanarak AX ve BX yazmaçlarının içeriklerini takas edin.',
            code: `; Örnek 3: XCHG Komutu
ORG 100H

MOV AX, 1111H
MOV BX, 9999H
XCHG AX, BX

HLT`,
            solutionCode: `ORG 100H
MOV AX, 1111H
MOV BX, 9999H
XCHG AX, BX
HLT`,
            solutionBreakdown: [
              '1. Satır: AX = 1111h yüklenir.',
              '2. Satır: BX = 9999h yüklenir.',
              '3. Satır: XCHG AX, BX — AX 9999h olurken BX 1111h olur. Tek vuruşta takas gerçekleşir.',
              '4. Satır: HLT — Program durur.'
            ],
            examTips: 'XCHG komutunda operantlardan biri sabit (Immediate) sayı OLAMAZ! Örneğin XCHG AX, 5 geçersizdir çünkü sabit bir sayının içine yazma yapılamaz.'
          }
        ]
      }
    ]
  },

  'milestone-2': {
    milestoneId: 'milestone-2',
    milestoneNumber: 2,
    title: 'Aritmetik İşlemler & Bayraklar (ADD, ADC, SUB, SBB, MUL, DIV)',
    subtitle: 'Toplama, Çıkarma, Elde Bitleri, 32-bit Genişletilmiş Aritmetik ve FLAGS Donanım Mantığı',
    slideRef: 'Week 5 Slaytları (Brey 8. Baskı Bölüm 5)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 2: ARİTMETİK</div>
        <p class="lecture-hero-text">
          Aritmetik işlemler doğrudan işlemcinin <b>ALU (Aritmetik Mantık Birimi)</b> tarafından yürütülür ve sonuçlara göre <b>FLAGS (Bayraklar)</b> kaydı donanımsal olarak güncellenir.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>Elde (Carry) vs Taşma (Overflow) Farkı:</strong><br>
          • <strong>CF (Carry Flag):</strong> İşaretsiz (unsigned) sayılarda en yüksek bitten taşan eldeyi gösterir.<br>
          • <strong>OF (Overflow Flag):</strong> İşaretli (signed, 2\'ye tümleyen) sayılarda sonucun kapasiteyi aşıp işaret bitini bozduğunu gösterir.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. ADD & ADC ile 32-bit Çift Kelime Toplama',
        contentHtml: `
          <p>8086 bir 16-bit işlemcidir. Peki 32-bit iki sayıyı nasıl toplarız? Cevap: <b>ADC (Add with Carry)</b> komutudur!</p>
          <p>
            Önce düşük 16-bitlik parçalar <code>ADD</code> ile toplanır; bu toplamdan elde (carry) çıkarsa <code>CF = 1</code> olur.<br>
            Ardından yüksek 16-bitlik parçalar <code>ADC</code> ile toplanır: <code>ADC Hedef, Kaynak = Hedef + Kaynak + CF</code>.
          </p>
        `,
        examples: [
          {
            id: 'ex-m2-adc-32bit',
            title: 'Canlı Örnek: 32-Bit Sayı Toplama (DX:AX + CX:BX)',
            scenario: 'Birinci 32-bit sayı DX:AX (0001:FFFFh), ikinci 32-bit sayı CX:BX (0002:0001h) yazmaçlarında tutulmaktadır.',
            task: 'Önce düşük kelimeleri ADD ile, ardından yüksek kelimeleri ADC ile toplayarak 32-bitlik toplamı DX:AX içinde elde edin.',
            code: `; Örnek: 32-Bit Toplama (ADC)
ORG 100H

MOV AX, 0FFFFH
MOV DX, 0001H
MOV BX, 0001H
MOV CX, 0002H

ADD AX, BX
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
              '1. Satır-4: Sayıların düşük ve yüksek parçaları yüklenir. Sayı 1 = 0001FFFFh, Sayı 2 = 00020001h.',
              '5. Satır: ADD AX, BX — FFFFh + 0001h = 0000h olur. En yüksek bitten 1 elde çıkar ve CF = 1 kurulur!',
              '6. Satır: ADC DX, CX — DX (0001h) + CX (0002h) + CF (1) = 0004h elde edilir.',
              'Sonuç: 32-bit toplam tam olarak 00040000h olur (DX:AX).'
            ],
            examTips: 'Sınavda yüksek kelimeleri toplarken ADD yazarsanız eldeden gelen 1 kaybolur ve sonuç 00030000h çıkarak yanlış olur. Daima ADC kullanmalısınız!'
          }
        ]
      },
      {
        title: '2. Çarpma ve Bölme (MUL, IMUL, DIV, IDIV)',
        contentHtml: `
          <p>8086'da çarpma ve bölme komutlarında birinci operant gizlidir (yazılmaz, işlemci otomatik olarak AX kullanır):</p>
          <ul>
            <li><b>8-bit Çarpma:</b> <code>MUL BL</code> ➔ <code>AX = AL × BL</code> (Sonuç 16-bit olarak AX içine yazılır).</li>
            <li><b>16-bit Çarpma:</b> <code>MUL BX</code> ➔ <code>DX:AX = AX × BX</code> (Sonuç 32-bit olur; yüksek kelime DX, düşük AX).</li>
            <li><b>16-bit Bölme:</b> <code>DIV BL</code> ➔ <code>AX / BL</code> ➔ <b>Bölüm AL</b> içine, <b>Kalan (Modulus) AH</b> içine yazılır.</li>
          </ul>
        `,
        examples: [
          {
            id: 'ex-m2-div-modulus',
            title: 'Canlı Örnek: DIV ile Kalan (Modulus) Hesaplama',
            scenario: 'AX = 107 sayısı verilmiştir. Bu sayının 10\'a bölümünden kalanı (modulus) ve bölümü hesaplayınız.',
            task: 'AX içine 107 yükleyin. BL içine 10 yükleyin. DIV BL komutuyla bölme yapın. Kalanın AH içinde, bölümün AL içinde olduğunu gözlemleyin.',
            code: `; Örnek: DIV ile Bolum ve Kalan
ORG 100H

MOV AX, 107
MOV BL, 10
DIV BL

HLT`,
            solutionCode: `ORG 100H
MOV AX, 107
MOV BL, 10
DIV BL
HLT`,
            solutionBreakdown: [
              '1. Satır: AX = 107 (006Bh) yüklenir.',
              '2. Satır: BL = 10 yüklenir.',
              '3. Satır: DIV BL — 107 / 10 işlemi yapılır: Bölüm = 10 (0Ah) AL içine, Kalan = 7 (07h) AH içine yazılır. AX = 070Ah olur.',
              '4. Satır: HLT ile program sonlanır.'
            ],
            examTips: 'Bölende sıfır olursa veya bölüm AL kapasitesini (255) aşarsa donanım otomatik olarak Tip 0 (Divide Error) hatası üretir!'
          }
        ]
      }
    ]
  },

  'milestone-3': {
    milestoneId: 'milestone-3',
    milestoneNumber: 3,
    title: 'Mantıksal İşlemler & Bit Manipülasyonu (AND, OR, XOR, SHL, SAR)',
    subtitle: 'Bit Maskeleme, Hızlı Çarpma/Bölme, Yazmaç Sıfırlama ve Aritmetik Kaydırma',
    slideRef: 'Week 5 Slaytları (Mantık ve Kaydırma Operasyonları)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 3: BİT DÜZEYİ</div>
        <p class="lecture-hero-text">
          Assembly seviyesinde donanım portlarını kontrol etmek, bayrakları süzmek ve yüksek hızlı matematiksel optimizasyonlar yapmak için <b>bit düzeyinde mantıksal komutlar</b> vazgeçilmezdir.
        </p>
      </div>
    `,
    sections: [
      {
        title: '1. Bit Maskeleme (AND) ve Bit Kurma (OR)',
        contentHtml: `
          <p>
            • <b>AND (Maskeleme):</b> İstenmeyen bitleri 0 yapmak için kullanılır (Örn: ASCII '5' = 35h'i sayısal 5'e çevirmek için <code>AND AL, 0FH</code> yapılır).<br>
            • <b>OR (Bit Kurma):</b> Seçilen bitleri 1 yapmak için kullanılır.<br>
            • <b>XOR (Sıfırlama):</b> <code>XOR AX, AX</code> komutu bir sayıyı kendisiyle XOR'layarak sıfırlar. <code>MOV AX, 0</code>'dan daha kısa (2 bayt) ve daha hızlıdır.
          </p>
        `,
        examples: [
          {
            id: 'ex-m3-masking',
            title: 'Canlı Örnek: ASCII Rakamı Sayısala Çevirme (Maskeleme)',
            scenario: 'Klavyeden gelen AL yazmacındaki karakter \'7\' (ASCII 37h = 0011 0111b) değerindedir.',
            task: 'AL yazmacına 0FH ile AND maskelemesi uygulayarak saf sayısal 7 (07h) değerini elde edin.',
            code: `; Örnek: Bit Maskeleme (AND)
ORG 100H

MOV AL, 37H ; ASCII '7'
AND AL, 0FH ; Maskele: 37h AND 0Fh = 07h

HLT`,
            solutionCode: `ORG 100H
MOV AL, 37H
AND AL, 0FH
HLT`,
            solutionBreakdown: [
              '1. Satır: AL = 37h (0011 0111b) yüklenir.',
              '2. Satır: AND AL, 0Fh (0000 1111b) işlemi yapılır. Yüksek 4 bit (0011) sıfırlanır, düşük 4 bit (0111 = 7) korunur. AL = 07h olur.',
              '3. Satır: HLT ile durulur.'
            ],
            examTips: 'ASCII rakamdan sayıya geçişte AND 0FH; tersine sayıdan ASCII karaktere geçişte ise OR 30H kullanılır.'
          }
        ]
      },
      {
        title: '2. Kaydırma Komutları ile Hızlı Çarpma (SHL) ve İşaret Korumalı Bölme (SAR)',
        contentHtml: `
          <p>
            • <b>SHL (Shift Logical Left):</b> Sayıyı 1 bit sola kaydırmak 2 ile çarpmak demektir. Örneğin bir sayıyı 10 ile çarpmak için: $10x = (8x) + (2x) = (x \ll 3) + (x \ll 1)$.<br>
            • <b>SAR (Shift Arithmetic Right):</b> İşaretli sayılarda en yüksek biti (işaret bitini) koruyarak sağa kaydırır. Böylece negatif sayılar bozulmadan 2'ye bölünür.
          </p>
        `,
        examples: [
          {
            id: 'ex-m3-shl-sar',
            title: 'Canlı Örnek: SAR ile Negatif Sayıyı Bölme (-16 / 4 = -4)',
            scenario: 'AX = FFF0h (-16) negatif sıcaklık değeridir. SHR kullanılırsa işaret biti 0 olacağından pozitif devasa bir sayıya dönüşür. SAR işaret bitini korur.',
            task: 'AX içine FFF0h yükleyin. SAR komutunu 2 kez kullanarak AX\'i 4\'e bölün. Sonucun FFFCh (-4) olduğunu gözlemleyin.',
            code: `; Örnek: SAR ile Isaret Korumali Bolme
ORG 100H

MOV AX, 0FFF0H ; -16
SAR AX, 1      ; -8 (FFF8h)
SAR AX, 1      ; -4 (FFFCh)

HLT`,
            solutionCode: `ORG 100H
MOV AX, 0FFF0H
SAR AX, 1
SAR AX, 1
HLT`,
            solutionBreakdown: [
              '1. Satır: AX = FFF0h (-16) atanır.',
              '2. Satır: SAR AX, 1 — Sayı 1 bit sağa kaydırılır, en yüksek bite 1 kopyalanır. AX = FFF8h (-8) olur.',
              '3. Satır: SAR AX, 1 — Tekrar 1 bit sağa kaydırılır. AX = FFFCh (-4) olur.',
              '4. Satır: HLT — İşaret başarıyla korunarak bölme tamamlanır.'
            ],
            examTips: 'İşaretsiz sayılarda SHR, işaretli (negatif olma ihtimali olan) sayılarda mutlaka SAR kullanılmalıdır.'
          }
        ]
      }
    ]
  },

  'milestone-4': {
    milestoneId: 'milestone-4',
    milestoneNumber: 4,
    title: 'Akış Kontrolü & Döngüler (CMP, Jcc, LOOP, LOOPNE)',
    subtitle: 'Koşullu Atlama Kararları, Karşılaştırma Mantığı ve Donanımsal CX Döngüleri',
    slideRef: 'Week 6 Slaytları (Brey 8. Baskı Bölüm 6)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 4: AKIŞ KONTROLÜ</div>
        <p class="lecture-hero-text">
          Programların akıllı kararlar vermesini sağlayan yapı <b>CMP (Compare)</b> ve ardından gelen <b>Jcc (Koşullu Atlama)</b> komutlarıdır. <code>CMP Hedef, Kaynak</code> arka planda çıkarma (SUB) yapar, ancak sonucu kaydetmez; yalnızca FLAGS kaydını günceller.
        </p>
      </div>
    `,
    sections: [
      {
        title: '1. CMP ve Koşullu Atlama Matrisi',
        contentHtml: `
          <p>
            • <b>JE / JZ:</b> Eşitse atla (ZF = 1).<br>
            • <b>JNE / JNZ:</b> Eşit değilse atla (ZF = 0).<br>
            • <b>İşaretsiz Karşılaştırma:</b> <code>JA</code> (Büyükse), <code>JB</code> (Küçükse), <code>JAE</code>, <code>JBE</code>.<br>
            • <b>İşaretli Karşılaştırma:</b> <code>JG</code> (Büyükse), <code>JL</code> (Küçükse), <code>JGE</code>, <code>JLE</code>.
          </p>
        `,
        examples: [
          {
            id: 'ex-m4-max-finder',
            title: 'Canlı Örnek: İki Sayıdan Büyük Olanı Bulma (Max Finder)',
            scenario: 'AX = 25 ve BX = 40 verilmiştir. Büyük olan sayıyı tespit edip AX içine yazmanız istenmektedir.',
            task: 'CMP AX, BX yapın. Eğer AX büyükse atlayın; değilse AX içine BX değerini kopyalayın.',
            code: `; Örnek: Iki Sayidan Buyugunu Bulma
ORG 100H

MOV AX, 25
MOV BX, 40

CMP AX, BX
JAE AX_BUYUK
MOV AX, BX   ; BX buyukse AX'e kopyala

AX_BUYUK:
HLT`,
            solutionCode: `ORG 100H
MOV AX, 25
MOV BX, 40
CMP AX, BX
JAE AX_BUYUK
MOV AX, BX
AX_BUYUK:
HLT`,
            solutionBreakdown: [
              '1. Satır-3: AX = 25, BX = 40 yüklenir.',
              '4. Satır: CMP AX, BX — 25 - 40 yapılır. Sonuç negatif olduğu için CF=1 kurulur.',
              '5. Satır: JAE AX_BUYUK — AX >= BX olmadığı için atlama GERÇEKLEŞMEZ, alt satıra geçilir.',
              '6. Satır: MOV AX, BX — AX = 40 (büyük olan) yapılır.',
              '7. Satır: AX_BUYUK etiketi ve HLT ile program sonlanır.'
            ],
            examTips: 'İşaretsiz sayılarda Above/Below (JA/JB), işaretli sayılarda Greater/Less (JG/JL) komut çiftleri kullanılır.'
          }
        ]
      },
      {
        title: '2. LOOP Komutu ile Sayaçlı Döngüler',
        contentHtml: `
          <p>
            <code>LOOP Etiket</code> komutu tek vuruşta iki işlem yapar:<br>
            1. CX sayacını 1 azaltır: <code>CX ← CX - 1</code><br>
            2. Eğer <code>CX ≠ 0</code> ise belirtilen etikete geri sıçrar. CX = 0 olduğunda döngüden çıkar.
          </p>
        `,
        examples: [
          {
            id: 'ex-m4-loop-sum',
            title: 'Canlı Örnek: 1\'den N\'e Kadar Sayıların Toplamı (LOOP)',
            scenario: '1\'den 5\'e kadar olan sayıların toplamı (1+2+3+4+5 = 15) hesaplanacaktır.',
            task: 'CX sayacına 5 yükleyin. Her adımda CX değerini AX toplamına ekleyip LOOP komutuyla döngüyü işletin.',
            code: `; Örnek: 1'den 5'e Toplam (LOOP)
ORG 100H

MOV AX, 0
MOV CX, 5

TOPLA_DONGU:
ADD AX, CX
LOOP TOPLA_DONGU

HLT`,
            solutionCode: `ORG 100H
MOV AX, 0
MOV CX, 5
TOPLA_DONGU:
ADD AX, CX
LOOP TOPLA_DONGU
HLT`,
            solutionBreakdown: [
              '1. Satır: AX = 0 (Toplam sıfırlanır).',
              '2. Satır: CX = 5 (Döngü 5 kez dönecektir).',
              '3. Satır: TOPLA_DONGU: ADD AX, CX — AX sırasıyla 5, 5+4=9, 9+3=12, 12+2=14, 14+1=15 değerlerini alır.',
              '4. Satır: LOOP TOPLA_DONGU — CX bir azaltılır. CX sıfır olana kadar yukarı zıplar.',
              'Sonuç: AX = 15 (0Fh) olur.'
            ],
            examTips: 'LOOP komutu bayrakları ETKİLEMEZ! Sadece CX sayacını azaltır ve sıfır olup olmadığına bakar.'
          }
        ]
      }
    ]
  },

  'milestone-5': {
    milestoneId: 'milestone-5',
    milestoneNumber: 5,
    title: 'Bellek & İndeksli Adresleme (Diziler & Matrisler)',
    subtitle: 'Base-Plus-Index [BX+SI], Relative Addressing ve Dizi Elemanlarına Erişim',
    slideRef: 'Week 3 & 4 Slaytları (Section 2: Addressing Modes)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 5: DİZİLER VE BELLEK</div>
        <p class="lecture-hero-text">
          Diziler ve matrisler gibi veri yapılarına erişirken sabit adresler yetersiz kalır. 8086'nın <b>Base-Plus-Index</b> adresleme modu (<code>[BX+SI]</code>, <code>[BP+DI]</code> vb.) dizi ofsetlerini dinamik olarak taramayı sağlar.
        </p>
      </div>
    `,
    sections: [
      {
        title: '1. Tabanlı İndeksli Adresleme Formülü',
        contentHtml: `
          <p>
            Formül: <code>EA = Taban (BX veya BP) + İndeks (SI veya DI) + Öteleme (Displacement)</code><br>
            • Eğer taban <b>BX</b> ise varsayılan segment <b>DS (Data Segment)</b>'dir.<br>
            • Eğer taban <b>BP</b> ise varsayılan segment <b>SS (Stack Segment)</b>'dir.
          </p>
        `,
        examples: [
          {
            id: 'ex-m5-array-sum',
            title: 'Canlı Örnek: Bellekteki Bayt Dizisinin Elemanlarını Toplama',
            scenario: 'DS:0200h adresinde 4 elemanlı bir bayt dizisi [10, 20, 30, 40] bulunmaktadır.',
            task: 'SI indeks yazmacını kullanarak dizinin tüm elemanlarını gezip AL içine toplamı (100 = 64h) hesaplayın.',
            code: `; Örnek: Dizi Toplama [0200h + SI]
ORG 100H

MOV SI, 0
MOV AL, 0
MOV CX, 4

DONGU:
ADD AL, [0200H + SI]
INC SI
LOOP DONGU

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [10, 20, 30, 40] }
            ],
            solutionCode: `ORG 100H
MOV SI, 0
MOV AL, 0
MOV CX, 4
DONGU:
ADD AL, [0200H + SI]
INC SI
LOOP DONGU
HLT`,
            solutionBreakdown: [
              '1. Satır: SI = 0 (Dizi başlangıç indeksi).',
              '2. Satır: AL = 0 (Toplam akümülatörü).',
              '3. Satır: CX = 4 (Eleman sayısı).',
              '4. Satır: ADD AL, [0200H + SI] — Sırasıyla [0200h]=10, [0201h]=20, [0202h]=30, [0203h]=40 okunup eklenir.',
              '5. Satır: INC SI — İndeks bir sonraki bayta ilerletilir.',
              '6. Satır: LOOP DONGU — CX bitene kadar tekrarlanır. Toplam AL = 100 (64h) olur.'
            ],
            examTips: 'Word (16-bit) dizilerde INC SI yerine ADD SI, 2 yapılmalıdır çünkü her word 2 bayt yer kaplar!'
          }
        ]
      }
    ]
  },

  'milestone-6': {
    milestoneId: 'milestone-6',
    milestoneNumber: 6,
    title: 'Yığın (Stack) Mimarisi & Prosedürler (CALL & RET)',
    subtitle: 'LIFO Prensibi, SP Azalışı, Altprogram Çağrıları ve Dönüş Adresleri',
    slideRef: 'Week 3 & 6 Slaytları (Stack Operations & Subroutines)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 6: YIĞIN & ALT PROGRAMLAR</div>
        <p class="lecture-hero-text">
          Yığın (Stack), <b>Son Giren İlk Çıkar (LIFO - Last In First Out)</b> kuralıyla çalışan özel bir bellek alanıdır. Altprogram (fonksiyon) çağrılarında dönüş adresi yığına atılır ve fonksiyon bitince oradan geri yüklenir.
        </p>
        <div class="lecture-golden-rule">
          💡 <strong>SP Sayacı Ters Çalışır!</strong> 8086'da yığına veri atıldıkça (PUSH), Stack Pointer (SP) artmaz, <strong>2 AZALIR (SP ← SP - 2)</strong>! Veri çekildikçe (POP), SP <strong>2 ARTAR</strong>.
        </div>
      </div>
    `,
    sections: [
      {
        title: '1. PUSH, POP, CALL ve RET Komutları',
        contentHtml: `
          <p>
            • <code>PUSH AX</code>: SP ← SP - 2 yapılır, AX'in değeri SS:SP adresine yazılır.<br>
            • <code>POP AX</code>: SS:SP adresindeki veri AX'e çekilir, SP ← SP + 2 yapılır.<br>
            • <code>CALL Prosedur</code>: Bir sonraki komutun IP adresini yığına atar (PUSH IP) ve prosedür adresine zıplar.<br>
            • <code>RET</code>: Yığından dönüş adresini çeker (POP IP) ve ana programa geri döner.
          </p>
        `,
        examples: [
          {
            id: 'ex-m6-call-ret',
            title: 'Canlı Örnek: Kare Alma Prosedürü (CALL & RET)',
            scenario: 'AX = 5 sayısının karesini hesaplayan bir prosedür çağrılacaktır.',
            task: 'KARE_AL adında bir altprogram tanımlayın. Ana programdan CALL KARE_AL ile çağırıp RET ile dönün.',
            code: `; Örnek: CALL ve RET ile Kare Alma
ORG 100H

MOV AL, 5
CALL KARE_AL
HLT

KARE_AL:
MUL AL     ; AX = AL * AL (5 * 5 = 25)
RET`,
            solutionCode: `ORG 100H
MOV AL, 5
CALL KARE_AL
HLT

KARE_AL:
MUL AL
RET`,
            solutionBreakdown: [
              '1. Satır: AL = 5 yüklenir.',
              '2. Satır: CALL KARE_AL — Sonraki satırın adresi (HLT komutunun adresi) yığına PUSH edilir ve KARE_AL etiketine sıçranır.',
              '3. Satır: KARE_AL içinde MUL AL çalışır: 5 × 5 = 25 (19h) AX içine yazılır.',
              '4. Satır: RET — Yığındaki dönüş adresi POP edilerek ana programa dönülür.',
              '5. Satır: HLT ile program durur.'
            ],
            examTips: 'Prosedürün sonuna RET koymayı unutursanız işlemci bellekteki rastgele baytları komut sanarak çalıştırmaya devam eder ve program çöker!'
          }
        ]
      }
    ]
  },

  'milestone-7': {
    milestoneId: 'milestone-7',
    milestoneNumber: 7,
    title: 'Dizi (String) Blok İşlemleri (MOVSB, STOSB, SCASB)',
    subtitle: 'Donanımsal Blok Aktarımı, Direction Flag (DF), CLD/STD ve REP Önekleri',
    slideRef: 'Week 4 Slaytları (String Data Transfers)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 7: STRING OPERASYONLARI</div>
        <p class="lecture-hero-text">
          8086, bellek bloklarını yüksek hızda kopyalamak, doldurmak veya aramak için özel <b>String Komutlarına</b> sahiptir. Bu komutlar döngü yazmadan tek vuruşta blok veri işler.
        </p>
      </div>
    `,
    sections: [
      {
        title: '1. String Komutlarının Kuralları & DF Bayrağı',
        contentHtml: `
          <p>
            • Kaynak adres daima <b>DS:SI</b>, hedef adres daima <b>ES:DI</b> olmalıdır.<br>
            • <b>CLD (Clear Direction):</b> <code>DF = 0</code> yapar, SI ve DI her adımdan sonra otomatik artar (İleri yön).<br>
            • <b>STD (Set Direction):</b> <code>DF = 1</code> yapar, SI ve DI otomatik azalır (Geri yön).<br>
            • <b>REP Öneki:</b> CX sayacı sıfır olana kadar işlemi donanımsal olarak tekrarlar.
          </p>
        `,
        examples: [
          {
            id: 'ex-m7-movsb-block',
            title: 'Canlı Örnek: REP MOVSB ile 4 Baytlık Blok Kopyalama',
            scenario: 'DS:0200h adresinde bulunan "ABCD" (41h, 42h, 43h, 44h) string verisi ES:0250h adresine tek seferde kopyalanacaktır.',
            task: 'CLD ile yönü ayarlayın, SI=0200h, DI=0250h ve CX=4 kurup REP MOVSB çalıştırın.',
            code: `; Örnek: REP MOVSB Blok Kopyalama
ORG 100H

CLD
MOV SI, 0200H
MOV DI, 0250H
MOV CX, 4
REP MOVSB

HLT`,
            initialMemory: [
              { segment: 0x0000, offset: 0x0200, bytes: [0x41, 0x42, 0x43, 0x44] }
            ],
            solutionCode: `ORG 100H
CLD
MOV SI, 0200H
MOV DI, 0250H
MOV CX, 4
REP MOVSB
HLT`,
            solutionBreakdown: [
              '1. Satır: CLD — DF = 0 yapılarak ileriye doğru artış seçilir.',
              '2. Satır: SI = 0200h (Kaynak ofset).',
              '3. Satır: DI = 0250h (Hedef ofset).',
              '4. Satır: CX = 4 (Kopyalanacak bayt sayısı).',
              '5. Satır: REP MOVSB — Tek bir komutla 4 bayt DS:SI\'den ES:DI\'ye pompalanır. CX = 0 olur.',
              '6. Satır: Hedef bellek [0250h..0253h] artık "ABCD" verisini içerir.'
            ],
            examTips: 'MOVSB komutunda hedef segmentin ES olduğunu unutmayın! Kod segmentiyle veri segmenti aynı ise ES da DS ile aynı değere sahip olmalıdır.'
          }
        ]
      }
    ]
  },

  'milestone-8': {
    milestoneId: 'milestone-8',
    milestoneNumber: 8,
    title: 'G/Ç Portları, Kesmeler & DMA (IN, OUT, INT 21h, 8237 DMA)',
    subtitle: 'Port Haberleşmesi, Kesme Vektör Tablosu (IVT), Donanımsal Kesmeler ve DMA Mimarisi',
    slideRef: 'Week 6 & 7 Slaytları (I/O Systems & Interrupts)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 8: GİRİŞ/ÇIKIŞ & DONANIM</div>
        <p class="lecture-hero-text">
          Mikroişlemcinin dış dünyayla konuşmasını sağlayan <b>IN/OUT Portları</b>, işletim sistemiyle iletişim kuran <b>INT 21H Servisleri</b> ve yüksek hızlı bellek aktarımı sağlayan <b>DMA (Direct Memory Access)</b> donanım mekanizmaları.
        </p>
      </div>
    `,
    sections: [
      {
        title: '1. INT 21H ile Ekrana String Yazdırma (AH=09H)',
        contentHtml: `
          <p>
            DOS işletim sisteminde ekrana yazı basmak için <code>INT 21H</code> kesmesinin <code>AH = 09H</code> servisi kullanılır.<br>
            • String adresi <b>DX</b> yazmacına yüklenir.<br>
            • String'in sonu mutlaka dolar işareti (<code>$</code>) ile bitmelidir!
          </p>
        `,
        examples: [
          {
            id: 'ex-m8-int21-print',
            title: 'Canlı Örnek: INT 21H AH=09H ile Terminale Yazı Basma',
            scenario: 'DS:0120h adresinde "KOD$" stringi bulunmaktadır. Bu string ekrana yazdırılmalıdır.',
            task: 'DX içine 0120h adresini, AH içine 09h servis numarasını yükleyin ve INT 21H çağırın.',
            code: `; Örnek: INT 21H String Yazdirma
ORG 100H

MOV DX, 0120H
MOV AH, 09H
INT 21H

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
              '1. Satır: MOV DX, 0120H — Yazdırılacak string\'in ofset adresi DX içine verilir.',
              '2. Satır: MOV AH, 09H — DOS API 9. servis seçilir (Print String).',
              '3. Satır: INT 21H — DOS kesmesi çağrılır, konsola "KOD" basılır ve dolar işaretinde ($) durulur.',
              '4. Satır: HLT ile program sonlanır.'
            ],
            examTips: 'Dolar işareti ($) unutulursa DOS bellekte rastgele bir $ bulana kadar ekrana çöp karakterler basmaya devam eder!'
          }
        ]
      }
    ]
  },

  'milestone-9': {
    milestoneId: 'milestone-9',
    milestoneNumber: 9,
    title: 'İleri Algoritmalar & Pipelining (Bubble Sort, Fibonacci, Hazards)',
    subtitle: 'Sıralama Algoritmaları, Dinamik Hesaplamalar, Boru Hattı Mimarisi ve CISC vs RISC',
    slideRef: 'Week 12–15 Slaytları (Advanced Topics & System Algorithms)',
    overviewHtml: `
      <div class="lecture-hero-card">
        <div class="lecture-hero-badge">AŞAMA 9: İLERİ ALGORİTMALAR</div>
        <p class="lecture-hero-text">
          Tüm assembly yeteneklerinin birleştiği aşama: <b>Bubble Sort sıralama algoritması</b>, <b>Fibonacci sayı dizisi</b>, işlemci içindeki <b>Pipelining (Boru Hattı)</b> aşamaları ve donanımsal tehlikeler (Hazards).
        </p>
      </div>
    `,
    sections: [
      {
        title: '1. N. Fibonacci Sayısını Hesaplama Algoritması',
        contentHtml: `
          <p>
            Fibonacci dizisi: $F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8, F(7)=13...$<br>
            Her yeni terim, kendisinden önceki iki terimin toplamıdır: $F(n) = F(n-1) + F(n-2)$.
          </p>
        `,
        examples: [
          {
            id: 'ex-m9-fibonacci',
            title: 'Canlı Örnek: 7. Fibonacci Sayısını Hesaplama',
            scenario: 'CX = 7 verilmiştir. 7. Fibonacci sayısını hesaplayıp sonucu AX içine yazınız.',
            task: 'Başlangıç değerleri AL=1, BL=1 kurun. CX-2 kez döngü işletip yeni terimleri toplayarak AX = 13 (0Dh) elde edin.',
            code: `; Örnek: Fibonacci Hesabi (CX=7 -> 13)
ORG 100H

MOV CX, 7
MOV AL, 1
MOV BL, 1

SUB CX, 2

FIB_DONGU:
MOV DL, AL
ADD AL, BL
MOV BL, DL
LOOP FIB_DONGU

MOV AH, 0
HLT`,
            solutionCode: `ORG 100H
MOV CX, 7
MOV AL, 1
MOV BL, 1
SUB CX, 2
FIB_DONGU:
MOV DL, AL
ADD AL, BL
MOV BL, DL
LOOP FIB_DONGU
MOV AH, 0
HLT`,
            solutionBreakdown: [
              '1. Satır-3: CX = 7 (aranan terim), AL = 1 (F1), BL = 1 (F2).',
              '4. Satır: SUB CX, 2 — İlk 2 terim bilindiği için döngü 5 kez dönecektir.',
              '5. Satır: DL = AL (Eski terim saklanır), AL = AL + BL (Yeni terim üretilir: 2, 3, 5, 8, 13), BL = DL (Önceki terim kaydırılır).',
              '6. Satır: LOOP ile 5 adım tamamlandığında AL = 13 (0Dh) olur.',
              '7. Satır: AH sıfırlanır, AX = 000Dh (13) elde edilir.'
            ],
            examTips: 'Fibonacci döngüsünde iki değişkenin değerini kaydırırken DL gibi üçüncü bir yardımcı yazmaç veya XCHG komutu kullanılmalıdır.'
          }
        ]
      }
    ]
  }
};
