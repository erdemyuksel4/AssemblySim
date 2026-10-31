/**
 * topicStudyData.ts
 * 
 * 8086 Assembly Kapsamlı ve Adım Adım Konu Odaklı Çalışma & Pratik Müfredatı.
 * Her aşama yerine doğrudan konu başlığı seçilir.
 * Her konuda:
 *   1. Adım adım teorik ve donanım mekanizması bilgisi
 *   2. Her türlü kullanımı, varyasyonu ve yasakları gösteren zengin kod örnekleri ("Simülatörde Çalıştır" butonlu)
 *   3. Sınav çıkmışları, durum tahminleri ve adım adım çözümlü sorular
 *   4. Uygulamalı kodlama alıştırmaları
 */

export interface UsageVariation {
  title: string;
  description: string;
  code: string;
  syntaxRule?: string;
  isInvalid?: boolean;
  outputNote?: string;
}

export interface UsageVariationGroup {
  groupTitle: string;
  groupDescription?: string;
  items: UsageVariation[];
}

export interface TheoryStep {
  stepNumber: number;
  stepTitle: string;
  htmlContent: string;
}

export interface TopicQuestion {
  id: string;
  title: string;
  points?: number;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  scenario: string;
  codeSnippet: string;
  solutionSteps: string[];
  expectedResult?: string;
  examTips: string;
}

export interface TopicChallenge {
  id: string;
  title: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  task: string;
  starterCode: string;
  solutionCode: string;
}

export interface TopicItem {
  id: string;
  legacyMilestoneId: string;
  number: number;
  title: string;
  shortTitle: string;
  icon: string;
  badge: string;
  opcodes: string[];
  summary: string;
  theorySteps: TheoryStep[];
  usageGroups: UsageVariationGroup[];
  questions: TopicQuestion[];
  challenges: TopicChallenge[];
}

export const TOPIC_CURRICULUM: TopicItem[] = [
  // -------------------------------------------------------------------------
  // KONU 1: 8086 MİMARİSİ & 20-BİT BELLEK SEGMENTASYONU
  // -------------------------------------------------------------------------
  {
    id: 'arch-20bit',
    legacyMilestoneId: 'milestone-1',
    number: 1,
    title: '8086 İşlemci Mimarisi, Donanım Birimleri & 20-Bit Bellek Segmentasyonu',
    shortTitle: '1. Mimari & 20-Bit Bellek',
    icon: '🏛️',
    badge: 'MİMARİ TEMEL',
    opcodes: ['CS', 'DS', 'SS', 'ES', 'IP', 'AX', 'BX', 'CX', 'DX', 'SP', 'BP', 'SI', 'DI', 'FLAGS'],
    summary: 'BIU & EU birimleri işbölümü, 14 adet 16-bit yazmaç, Komut Ön Getirme Kuyruğu (Prefetch Queue), 20-bit Fiziksel Adres Hesaplama (Segment × 16 + Offset) ve Little-Endian bellek saklama prensibi.',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: BIU ve EU Donanım Birimleri İşbölümü',
        htmlContent: `
          <p>
            8086 mikroişlemcisi, modern boru hattı (pipelining) mimarisinin öncüsüdür ve iki ana bağımsız birimden oluşur:
          </p>
          <div class="theory-grid-2col">
            <div class="theory-box biu-box">
              <h4>🚌 BIU (Bus Interface Unit - Veriyolu Arayüz Birimi)</h4>
              <p>İşlemcinin dış dünya (bellek ve G/Ç portları) ile doğrudan konuşan TEK birimidir:</p>
              <ul>
                <li>Bellekten sıradaki komutları getirir ve <strong>6-baytlık Komut Ön Getirme Kuyruğuna (Prefetch Queue - FIFO)</strong> doldurur.</li>
                <li>Segment yazmaçlarını (<code>CS, DS, SS, ES</code>) ve komut göstericisini (<code>IP</code>) bünyesinde barındırır.</li>
                <li>Segment ve Ofset değerlerini toplayarak <strong>20-bitlik fiziksel adresi</strong> üretir ve adres veriyoluna sürer.</li>
              </ul>
            </div>
            <div class="theory-box eu-box">
              <h4>⚙️ EU (Execution Unit - Yürütme Birimi)</h4>
              <p>Veriyollarıyla doğrudan konuşmaz; kuyruktan aldığı komutları çözer ve işletir:</p>
              <ul>
                <li><strong>Komut Çözücü (Instruction Decoder):</strong> Makine kodlarını kontrol sinyallerine çevirir.</li>
                <li><strong>16-Bit Aritmetik Mantık Birimi (ALU):</strong> Toplama, çıkarma, VE/VEYA mantık işlemlerini yapar.</li>
                <li><strong>Yazmaç Kümesi:</strong> Genel amaçlı veri yazmaçları (<code>AX, BX, CX, DX</code>), indeks/işaretçiler (<code>SP, BP, SI, DI</code>) burada bulunur.</li>
                <li><strong>Bayraklar Yazmacı (FLAGS):</strong> ALU işlemleri sonucunda kurulan durum bitlerini tutar.</li>
              </ul>
            </div>
          </div>
          <div class="theory-note-tip">
            💡 <strong>Pipelining Avantajı:</strong> EU bir komutu yürütürken (örneğin çarpmayla meşgulken), BIU boş durmaz; bellekten sıradaki komut baytlarını çekip 6-baytlık kuyruğa doldurur. Böylece komut getirme gecikmesi (fetch latency) gizlenir.
          </div>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: 14 Adet 16-Bit Yazmaç ve Görev Dağılımı',
        htmlContent: `
          <p>8086 içinde bulunan 14 adet yazmacın tamamı 16-bit (2 bayt) genişliğindedir:</p>
          <div class="registers-table-wrap">
            <table class="topic-detail-table">
              <thead>
                <tr>
                  <th>Yazmaç Grubu</th>
                  <th>Yazmaçlar</th>
                  <th>Bayt Bölünebilirlik</th>
                  <th>Özel Donanım Görevi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Veri Yazmaçları</strong></td>
                  <td><code>AX, BX, CX, DX</code></td>
                  <td>Evet (<code>AH/AL, BH/BL, CH/CL, DH/DL</code>)</td>
                  <td>
                    <strong>AX:</strong> Akümülatör (çarpma/bölme/I/O)<br>
                    <strong>BX:</strong> Taban Yazmacı (Bellek adreslemede kullanılabilir)<br>
                    <strong>CX:</strong> Sayaç (Döngü ve kaydırmalarda sayaç)<br>
                    <strong>DX:</strong> Veri (Büyük çarpma/bölme ve 16-bit I/O portları)
                  </td>
                </tr>
                <tr>
                  <td><strong>İşaretçi & İndeksler</strong></td>
                  <td><code>SP, BP, SI, DI</code></td>
                  <td>Hayır (Sadece 16-bit)</td>
                  <td>
                    <strong>SP:</strong> Yığın İşaretçisi (Top of Stack)<br>
                    <strong>BP:</strong> Taban İşaretçisi (Yığındaki parametreleri okuma)<br>
                    <strong>SI:</strong> Kaynak İndeksi (Kaynak bellek adresi)<br>
                    <strong>DI:</strong> Hedef İndeksi (Hedef bellek adresi)
                  </td>
                </tr>
                <tr>
                  <td><strong>Segment Yazmaçları</strong></td>
                  <td><code>CS, DS, SS, ES</code></td>
                  <td>Hayır (Sadece 16-bit)</td>
                  <td>
                    <strong>CS:</strong> Kod Segmenti (Çalıştırılan kodlar)<br>
                    <strong>DS:</strong> Veri Segmenti (Değişkenler ve diziler)<br>
                    <strong>SS:</strong> Yığın Segmenti (Stack alanı)<br>
                    <strong>ES:</strong> Ekstra Segment (String transfer hedefi)
                  </td>
                </tr>
                <tr>
                  <td><strong>Özel Yazmaçlar</strong></td>
                  <td><code>IP, FLAGS</code></td>
                  <td>Hayır (Sadece 16-bit)</td>
                  <td>
                    <strong>IP:</strong> Komut Göstericisi (CS içindeki sıradaki komut ofseti)<br>
                    <strong>FLAGS:</strong> Durum (CF, ZF, SF, OF, AF, PF) ve Kontrol (DF, IF, TF) bayrakları
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        stepNumber: 3,
        stepTitle: '3. Adım: 20-Bit Fiziksel Adres Hesaplama (Segment:Offset)',
        htmlContent: `
          <p>
            8086'nın yazmaçları <strong>16-bit</strong> olmasına rağmen, harici adres veriyolu <strong>20-bit</strong> genişliğindedir. Bu sayede $2^{20} = 1\\text{ MB}$ (1.048.576 bayt) bellek adreslenebilir.
          </p>
          <div class="formula-card">
            <span class="formula-title">📐 Fiziksel Adres Hesaplama Formülü</span>
            <div class="formula-math">
              $$\\text{Fiziksel Adres (PA)} = (\\text{Segment} \\times 16_{10}) + \\text{Offset} = (\\text{Segment} \\times 10_{16}) + \\text{Offset}$$
            </div>
            <p class="formula-desc">
              Segment yazmacı 16'lık (Hex) tabanda <strong>1 basamak sola kaydırılır</strong> (sonuna bir '0' eklenir) ve ofset değeri ile toplanır.
            </p>
          </div>
          <div class="calculation-example-box">
            <strong>Örnek Adım Adım Hesaplama:</strong><br>
            Verilen Mantıksal Adres: <code>CS:IP = 1234H:0100H</code><br>
            1. Segmenti 16 ile çarp (Hex tabanda 1 basamak sola kaydır): <code>1234H × 10H = 12340H</code><br>
            2. Ofset değerini ekle: <code>12340H + 0100H = 12440H</code><br>
            Sonuç: İşlemcinin adres veriyoluna sürdüğü 20-bit Fiziksel Adres: <strong>12440H</strong>
          </div>
        `
      },
      {
        stepNumber: 4,
        stepTitle: '4. Adım: Little-Endian Kuralı (Düşük Bayt Düşük Adrese)',
        htmlContent: `
          <p>
            Intel x86 mimarisinde çok baytlı veriler (16-bit word veya 32-bit dword) belleğe yazılırken <strong>Little-Endian</strong> formatı kullanılır:
          </p>
          <div class="theory-golden-rule">
            📌 <strong>Little-Endian Altın Kuralı:</strong><br>
            <strong>Düşük Anlamlı Bayt (Low Byte) DÜŞÜK ADRESE</strong>, Yüksek Anlamlı Bayt (High Byte) ise BİR SONRAKİ YÜKSEK ADRESE yazılır!
          </div>
          <div class="calculation-example-box">
            <strong>Somut Örnek:</strong><br>
            <code>AX = 5A34H</code> kelimesini <code>0200H</code> bellek adresine kopyaladığımızda:<br>
            - Düşük Bayt: <code>AL = 34H</code> → Adres <code>0200H</code> içine yazılır.<br>
            - Yüksek Bayt: <code>AH = 5AH</code> → Adres <code>0201H</code> içine yazılır.<br>
            Bellekten 16-bit word olarak geri okunduğunda işlemci otomatik olarak <code>[0201H][0200H] = 5A34H</code> olarak birleştirir.
          </div>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Segment ve Ofset Eşleşmeleri & Başlangıç Şablonu',
        groupDescription: '8086 programında segmentlerin hafızadaki yerleşimi ve varsayılan eşleşmeler.',
        items: [
          {
            title: 'Standart DOS .COM Formatı (Tek Segment Modeli)',
            description: 'Kod, veri ve yığın tek bir 64KB segmenti paylaşır. ORG 100H ile PSP sonrası başlar.',
            code: `; Standart Tek Segment .COM Program Sablonu\nORG 100H\n\nMOV AX, 1234H      ; AX yazmacina 16-bit veri yukle\nMOV BX, 5678H      ; BX yazmacina 16-bit veri yukle\nADD AX, BX         ; AX = 1234H + 5678H = 68ACH\n\nHLT                ; Islemciyi durdur`
          },
          {
            title: 'Veri Segmenti Yükleme (DS Ayarlama Kuralı)',
            description: 'Segment yazmaçlarına doğrudan ivedi (immediate) sayı yüklenemez! Önce genel amaçlı yazmaca alınmalıdır.',
            code: `; DS Yazmacini Baslatma Kurali\nORG 100H\n\n; YANLIS (Derleme Hatasi verir):\n; MOV DS, 2000H    ; YASAK!\n\n; DOGRU YONTEM:\nMOV AX, 2000H      ; Once AX yazmacina al\nMOV DS, AX         ; AX uzerinden DS yazmacina aktar\n\nMOV BX, 0100H      ; Ofset belirle\nMOV WORD PTR [BX], 99AAH ; DS:0100H adresine yaz\n\nHLT`
          },
          {
            title: 'Little-Endian Prensibini Bellekte Gözlemleme',
            description: '16-bit 0A4B2H sayısını belleğe yazıp, bayt bayt okuyarak düşük baytın düşük adrese yazıldığını ispatlayalım.',
            code: `; Little-Endian Bellek Ispat Ornegi\nORG 100H\n\nMOV BX, 0200H              ; Hedef ofset adresi\nMOV WORD PTR [BX], 0A4B2H  ; 16-bit sayiyi yaz\n\n; Simdi bellekteki tek tek baytlari okuyalim:\nMOV AL, [0200H]            ; AL = B2H (Dusuk anlamli bayt dusuk adreste!)\nMOV AH, [0201H]            ; AH = A4H (Yuksek anlamli bayt yuksek adreste!)\n\nHLT`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-arch-1',
        title: 'Soru 1: Fiziksel Adres (PA) Hesaplama',
        points: 15,
        difficulty: 'Kolay',
        scenario: 'İşlemcide CS = 25A0H ve IP = 014CH değerleri bulunmaktadır. İşlemcinin bellekten okuyacağı sıradaki komutun 20-bit Fiziksel Adresini (PA) adım adım hesaplayınız.',
        codeSnippet: '; CS = 25A0H\n; IP = 014CH\n; PA = (CS * 10H) + IP',
        solutionSteps: [
          'Adım 1: Segment değerini 16 (Hex 10H) ile çarpıp bir basamak sola kaydırın: 25A0H × 10H = 25A00H.',
          'Adım 2: Ofset değerini (IP) ekleyin: 25A00H + 014CH = 25B4CH.',
          'Sonuç: 20-bit Fiziksel Adres = 25B4CH.'
        ],
        expectedResult: '25B4CH',
        examTips: 'Sınavda en sık yapılan hata Segment ile Ofseti doğrudan toplamaktır (25A0H + 014CH). Segmentin sonuna mutlaka bir adet 0 eklemeyi unutmayın!'
      },
      {
        id: 'q-arch-2',
        title: 'Soru 2: Little-Endian Bellek Analizi',
        points: 20,
        difficulty: 'Orta',
        scenario: 'Belleğin 0300H adresinde 78H, 0301H adresinde 56H, 0302H adresinde 34H ve 0303H adresinde 12H baytları bulunmaktadır. "MOV AX, [0301H]" komutu çalıştırıldığında AX yazmacının nihai değeri ne olur?',
        codeSnippet: '; Bellek durumu:\n; [0300H] = 78H\n; [0301H] = 56H\n; [0302H] = 34H\n; [0303H] = 12H\nMOV AX, [0301H]',
        solutionSteps: [
          'Adım 1: AX 16-bitlik bir yazmaçtır, bu yüzden bellekten 2 ardışık bayt okunur: [0301H] ve [0302H].',
          'Adım 2: Little-Endian kuralına göre düşük adresteki bayt AL yazmacına gider: AL = [0301H] = 56H.',
          'Adım 3: Yüksek adresteki bayt AH yazmacına gider: AH = [0302H] = 34H.',
          'Sonuç: AX = AH:AL = 3456H.'
        ],
        expectedResult: 'AX = 3456H',
        examTips: 'Adres 0301H verildiğinde [0300H] baytı kullanılmaz! Başlangıç adresi 0301H olduğundan [0301H] ve [0302H] okunur.'
      }
    ],
    challenges: [
      {
        id: 'ch-arch-little-endian',
        title: 'Alıştırma: Belleğe 16-Bit Kelime Yazma ve Takas',
        difficulty: 'Kolay',
        task: '0250H adresine 16-bit 0BEEFH kelimesini yazın. Ardından [0250H] ve [0251H] adreslerindeki baytları okuyup sırasıyla BL ve BH yazmaçlarına yükleyerek Little-Endian kuralını doğrulayın.',
        starterCode: 'ORG 100H\n; 1. 0250H adresine 0BEEFH kelimesini yazin\n; 2. Dusuk bayti BL\'ye, yuksek bayti BH\'ye okuyun\n\nHLT',
        solutionCode: 'ORG 100H\nMOV WORD PTR [0250H], 0BEEFH\nMOV BL, [0250H]   ; BL = 0EFH\nMOV BH, [0251H]   ; BH = 0BEH\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 2: ADRESLEME MODLARI & TEMEL VERİ TRANSFERİ (MOV, XCHG, LEA)
  // -------------------------------------------------------------------------
  {
    id: 'addressing-mov',
    legacyMilestoneId: 'milestone-2',
    number: 2,
    title: '8086 Adresleme Modları & Temel Veri Transferi (MOV, XCHG, LEA, LDS, LES)',
    shortTitle: '2. Adresleme Modları & MOV',
    icon: '🎯',
    badge: 'TEMEL KOMUT SETİ',
    opcodes: ['MOV', 'XCHG', 'LEA', 'LDS', 'LES'],
    summary: 'İşlemcinin belleğe ve yazmaçlara erişim sağlayan 7 temel adresleme modu; MOV komutunun tüm varyasyonları, boyut belirteçleri (BYTE PTR / WORD PTR), atomik takas (XCHG) ve adres yükleme (LEA).',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: 7 Temel Adresleme Modu Mantığı',
        htmlContent: `
          <p>
            8086'da bir komutun işleyeceği verinin (operant) nerede bulunduğunu belirleme yöntemine <strong>Adresleme Modu</strong> denir:
          </p>
          <div class="theory-table-wrap">
            <table class="topic-detail-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Adresleme Modu</th>
                  <th>Örnek Komut</th>
                  <th>Efektif Adres (EA) Formülü</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td><strong>İvedi (Immediate)</strong></td>
                  <td><code>MOV AX, 1234H</code></td>
                  <td>Yok (Veri komutun içinde)</td>
                  <td>Sabit bir sayı doğrudan yazmaca yüklenir. En hızlı moddur.</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td><strong>Yazmaç (Register)</strong></td>
                  <td><code>MOV AX, BX</code></td>
                  <td>Yok (Yazmaç içi)</td>
                  <td>Veri bir yazmaçtan diğerine kopyalanır. Bellek erişimi yoktur.</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td><strong>Doğrudan Bellek (Direct)</strong></td>
                  <td><code>MOV AX, [0200H]</code></td>
                  <td>$EA = \\text{Sabit Ofset}$</td>
                  <td>Sabit bir bellek adresindeki veri okunur/yazılır.</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td><strong>Yazmaç Dolaylı (Indirect)</strong></td>
                  <td><code>MOV AX, [BX]</code></td>
                  <td>$EA = [BX] \\text{ veya } [SI] \\text{ veya } [DI]$</td>
                  <td>Adres bir yazmaçta tutulur. C işaretçilerine (pointers) benzer.</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td><strong>Tabanlı (Based)</strong></td>
                  <td><code>MOV AX, [BX+4]</code></td>
                  <td>$EA = [BX] + \\text{Disp} \\text{ veya } [BP] + \\text{Disp}$</td>
                  <td>Taban yazmacına sabit bir ofset (displacement) eklenir.</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td><strong>İndeksli (Indexed)</strong></td>
                  <td><code>MOV AX, [SI+2]</code></td>
                  <td>$EA = [SI] + \\text{Disp} \\text{ veya } [DI] + \\text{Disp}$</td>
                  <td>Dizilerde eleman indisleme için idealdir.</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td><strong>Tabanlı-İndeksli</strong></td>
                  <td><code>MOV AX, [BX+SI+4]</code></td>
                  <td>$EA = [BX/BP] + [SI/DI] + \\text{Disp}$</td>
                  <td>İki boyutlu matris ve struct erişimleri için kullanılır.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: MOV Komutunun Kesin Kuralları ve Yasaklar',
        htmlContent: `
          <div class="theory-golden-rule">
            ⚠️ <strong>MOV Komutunda Kesinlikle YASAK Olan Durumlar (Sınav Tuzakları):</strong>
            <ul>
              <li><strong>Bellekten Belleğe Aktarım YASAKTIR:</strong> <code>MOV [DI], [SI]</code> ❌ (8086 tek komutta iki bellek erişimi yapamaz. Önce bir yazmaca alınmalıdır!).</li>
              <li><strong>Segment Yazmaçlarına İvedi Sayı Yüklenemez:</strong> <code>MOV DS, 1000H</code> ❌ (Önce AX'e, sonra AX'ten DS'e!).</li>
              <li><strong>CS Yazmacı Hedef Olamaz:</strong> <code>MOV CS, AX</code> ❌ (Kod segmentini doğrudan değiştirmek yasaktır; sadece JMP/CALL ile değişir).</li>
              <li><strong>İki Segment Yazmacı Arasında Aktarım Yapılamaz:</strong> <code>MOV DS, ES</code> ❌ (Yazmaç üzerinden dolaylı aktarılmalıdır).</li>
              <li><strong>Boyut Uyuşmazlığı Hatası:</strong> <code>MOV AL, BX</code> ❌ (8-bit hedefe 16-bit kaynak kopyalanamaz!).</li>
            </ul>
          </div>
          <p>
            Belleğe sabit bir sayı yazarken boyut belirsizse <code>BYTE PTR</code> veya <code>WORD PTR</code> belirteci ZORUNLUDUR:
            <br><code>MOV BYTE PTR [BX], 55H</code> (1 bayt yazar)
            <br><code>MOV WORD PTR [BX], 55H</code> (2 bayt yazar: 0055H)
          </p>
        `
      },
      {
        stepNumber: 3,
        stepTitle: '3. Adım: XCHG ve LEA Komutlarının Farkı',
        htmlContent: `
          <div class="theory-grid-2col">
            <div class="theory-box">
              <h4>🔄 XCHG (Exchange - Atomik Değer Takası)</h4>
              <p>İki operantın değerini üçüncü bir geçici değişkene ihtiyaç duymadan takas eder:</p>
              <ul>
                <li><code>XCHG AX, BX</code> → AX ve BX yer değiştirir.</li>
                <li><code>XCHG [SI], DX</code> → Bellekteki değer ile DX takas edilir.</li>
                <li><strong>Kural:</strong> İvedi değerler veya segment yazmaçları ile kullanılamaz (<code>XCHG AX, 5</code> ❌).</li>
              </ul>
            </div>
            <div class="theory-box">
              <h4>🎯 LEA (Load Effective Address - Efektif Adres Yükle)</h4>
              <p>Bellekteki veriyi DEĞİL, <strong>hesaplanan ofset adresin kendisini</strong> yazmaca yükler:</p>
              <ul>
                <li><code>MOV SI, [BX+DI+4]</code> → Belleğin o adresindeki <strong>VERİYİ</strong> SI'ya okur.</li>
                <li><code>LEA SI, [BX+DI+4]</code> → <strong>BX + DI + 4 adresinin kendisini</strong> SI'ya yazar (belleğe erişmez!).</li>
                <li>Hızlı aritmetik hesaplamalar için de sıklıkla kullanılır.</li>
              </ul>
            </div>
          </div>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: Yazmaçtan Yazmaca & İvedi Değer Aktarımı (Reg-Reg, Imm-Reg)',
        groupDescription: 'En sık kullanılan, en hızlı çalışan temel atama komutları.',
        items: [
          {
            title: 'Yazmaçtan Yazmaca Veri Kopyalama',
            description: 'BX içindeki değeri AX yazmacına kopyalar. BX içindeki değer bozulmaz.',
            code: `ORG 100H\nMOV BX, 4567H      ; BX = 4567H\nMOV AX, BX         ; AX = 4567H (BX aynen kalir)\nMOV CL, AL         ; CL = 67H (8-bit bayt aktarimi)\nHLT`
          },
          {
            title: 'İvedi Değer (Immediate) Atama',
            description: 'Sabit sayıları doğrudan 8-bit veya 16-bit yazmaçlara yükleme.',
            code: `ORG 100H\nMOV AX, 0FFFFH     ; 16-bit pozitif/negatif sayi\nMOV BL, 2AH        ; 8-bit (onluk tabanda 42)\nMOV CX, 0          ; CX yazmacini sifirla\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 2: Bellek Adresleme Modları ile MOV (Mem-Reg, Reg-Mem)',
        groupDescription: '7 farklı adresleme moduyla bellekten veri okuma ve belleğe veri yazma.',
        items: [
          {
            title: 'Doğrudan ve Dolaylı Bellek Erişimi ([Adres] ve [BX])',
            description: 'Doğrudan adres ve yazmaç dolaylı mod ile bellek erişimi.',
            code: `ORG 100H\n; 1. Dogrudan adresleme ile bellege yazalim:\nMOV WORD PTR [0200H], 1A2BH\n\n; 2. Dogrudan okuyalim:\nMOV AX, [0200H]    ; AX = 1A2BH\n\n; 3. Dolayli mod ([BX]):\nMOV BX, 0200H\nMOV DX, [BX]       ; DX = 1A2BH\nHLT`
          },
          {
            title: 'Tabanlı-İndeksli Mod ile Dizi/Matris Erişimi ([BX+SI+Disp])',
            description: 'Taban ve indeks yazmaçlarını bir ofset ile toplayarak belleğe erişim.',
            code: `ORG 100H\nMOV BX, 0200H      ; Taban adresi\nMOV SI, 0004H      ; Eleman ofseti (indeks)\n\n; [0200H + 0004H + 2] = [0206H] adresine yaz:\nMOV BYTE PTR [BX+SI+2], 77H\n\n; Geri okuyalim:\nMOV AL, [BX+SI+2]  ; AL = 77H\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 3: XCHG (Takas) ve LEA (Adres Yükleme) Kullanımları',
        groupDescription: 'Değer takas etme ve efektif adres hesaplama senaryoları.',
        items: [
          {
            title: 'XCHG ile Atomik Değişken Takası',
            description: 'Geçici yazmaç kullanmadan AX ve BX içeriğini tek komutta takas eder.',
            code: `ORG 100H\nMOV AX, 1111H\nMOV BX, 9999H\n\nXCHG AX, BX        ; Artik AX = 9999H, BX = 1111H\n\n; Bellek ile yazmac arasinda takas:\nMOV WORD PTR [0200H], 5555H\nXCHG AX, [0200H]   ; AX = 5555H, [0200H] = 9999H\nHLT`
          },
          {
            title: 'LEA ile Efektif Adres Hesaplama (Pointer Alma)',
            description: 'LEA adresi yükler; MOV veriyi yükler. Aralarındaki farkı canlı izleyin.',
            code: `ORG 100H\nMOV BX, 0100H\nMOV SI, 0020H\n\n; LEA sadece adresi hesaplar (0100H + 0020H + 4 = 0124H):\nLEA DI, [BX+SI+4]  ; DI = 0124H (Bellek okunmaz!)\n\n; Simdi o adrese veri yazalim:\nMOV WORD PTR [DI], 0A0B0H\n\n; MOV ile o adresteki veriyi okuyalim:\nMOV DX, [DI]       ; DX = 0A0B0H\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 4: Kesinlikle YASAK / Hatalı Kullanımlar (Syntax Error Demos)',
        groupDescription: 'Derleyicinin reddettiği ve vize sınavlarında sorulan yasak komut kalıpları.',
        items: [
          {
            title: 'Yasak Bellekten Belleğe Aktarım ve Çözümü',
            description: 'MOV [DI], [SI] komutu işlemci mimarisinde fiziksel olarak yoktur.',
            code: `; YANLIS KULLANIM (Derlenmez):\n; MOV [0300H], [0200H]   ; YASAK: Bellekten bellege aktarilamaz!\n\n; DOGRU COZUM (Yazmac uzerinden aktarim):\nORG 100H\nMOV WORD PTR [0200H], 1234H\n\nMOV AX, [0200H]          ; 1. Once yazmaca al\nMOV [0300H], AX          ; 2. Yazmactan hedefe yaz\nHLT`,
            isInvalid: false,
            syntaxRule: '8086 tek bir komut döngüsünde iki ayrı bellek veri yolu transferi yapamaz.'
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-addr-1',
        title: 'Soru 1: Adresleme Modunu Belirleme',
        points: 15,
        difficulty: 'Kolay',
        scenario: 'Aşağıdaki komutların her birinin hangi adresleme moduna ait olduğunu belirtiniz:\n1) MOV AX, [BX]\n2) MOV [0200H], CL\n3) MOV DX, [BP+SI+6]\n4) MOV CX, 0FF00H',
        codeSnippet: '; 1) MOV AX, [BX]\n; 2) MOV [0200H], CL\n; 3) MOV DX, [BP+SI+6]\n; 4) MOV CX, 0FF00H',
        solutionSteps: [
          '1) MOV AX, [BX] → Yazmaç Dolaylı Adresleme (Register Indirect)',
          '2) MOV [0200H], CL → Doğrudan Bellek Adresleme (Direct Addressing)',
          '3) MOV DX, [BP+SI+6] → Tabanlı-İndeksli Adresleme (Based-Indexed with Displacement)',
          '4) MOV CX, 0FF00H → İvedi Adresleme (Immediate Addressing)'
        ],
        expectedResult: 'Tüm 4 mod doğru eşleştirildi.',
        examTips: 'Köşeli parantez içindeki yazmaçlara dikkat edin. BX/BP taban, SI/DI indekstir. İkisi birden varsa Tabanlı-İndekslidir.'
      },
      {
        id: 'q-addr-2',
        title: 'Soru 2: LEA ve MOV Karşılaştırmalı Sınav Sorusu',
        points: 20,
        difficulty: 'Orta',
        scenario: 'BX = 0200H, SI = 0010H ve DS:0214H adresindeki veri 8899H olsun. Aşağıdaki iki komut çalıştırıldıktan sonra AX ve DX yazmaçlarının değerleri ne olur?\nLEA AX, [BX+SI+4]\nMOV DX, [BX+SI+4]',
        codeSnippet: '; BX = 0200H, SI = 0010H\n; [0214H] = 8899H\nLEA AX, [BX+SI+4]\nMOV DX, [BX+SI+4]',
        solutionSteps: [
          'Adım 1: Efektif adres hesaplanır: EA = BX + SI + 4 = 0200H + 0010H + 0004H = 0214H.',
          'Adım 2: LEA AX komutu hesaplanan ADRESİN KENDİSİNİ AX içine yazar: AX = 0214H.',
          'Adım 3: MOV DX komutu o adresteki VERİYİ okur: DX = [0214H] = 8899H.',
          'Sonuç: AX = 0214H, DX = 8899H.'
        ],
        expectedResult: 'AX = 0214H, DX = 8899H',
        examTips: 'LEA adresi alır, MOV veriyi alır. Sınavlarda en çok sorulan ve puan kaybettiren tuzaktır!'
      }
    ],
    challenges: [
      {
        id: 'ch-addr-swap-blocks',
        title: 'Alıştırma: İki Bellek Bloğundaki Verileri Takas Etme',
        difficulty: 'Orta',
        task: '[0200H] adresinde 1122H ve [0202H] adresinde 3344H kelimeleri bulunmaktadır. XCHG komutunu kullanarak bu iki bellek bölgesindeki verileri birbirleriyle takas ediniz.',
        starterCode: 'ORG 100H\nMOV WORD PTR [0200H], 1122H\nMOV WORD PTR [0202H], 3344H\n\n; Kodunuzu buraya yazin:\n\nHLT',
        solutionCode: 'ORG 100H\nMOV WORD PTR [0200H], 1122H\nMOV WORD PTR [0202H], 3344H\n\nMOV AX, [0200H]\nXCHG AX, [0202H]\nMOV [0200H], AX\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 3: ARİTMETİK İŞLEMLER & BAYRAKLAR (ADD, SUB, MUL, DIV, FLAGS)
  // -------------------------------------------------------------------------
  {
    id: 'arithmetic-flags',
    legacyMilestoneId: 'milestone-3',
    number: 3,
    title: 'Aritmetik İşlemler & 6 Durum Bayrağı (ADD, SUB, INC, DEC, CMP, MUL, DIV, FLAGS)',
    shortTitle: '3. Aritmetik & Bayraklar',
    icon: '➕',
    badge: 'HESAPLAMA & KARAR',
    opcodes: ['ADD', 'ADC', 'SUB', 'SBB', 'INC', 'DEC', 'NEG', 'CMP', 'MUL', 'IMUL', 'DIV', 'IDIV', 'DAA'],
    summary: '8-bit ve 16-bit toplama, çıkarma; çok kelimeli işlemler için ADC/SBB; çarpma (MUL/IMUL) ve bölme (DIV/IDIV) mekanizmaları; 6 durum bayrağının (CF, ZF, SF, OF, AF, PF) kesin matematiksel türetimi.',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: 6 Durum Bayrağının (Flags) Donanım Mantığı',
        htmlContent: `
          <p>ALU bir işlem yaptığında sonucuna göre 6 adet durum bayrağını günceller:</p>
          <div class="theory-table-wrap">
            <table class="topic-detail-table">
              <thead>
                <tr>
                  <th>Bayrak</th>
                  <th>İsim</th>
                  <th>1 Olma Koşulu (Kurulma)</th>
                  <th>0 Olma Koşulu</th>
                  <th>Kullanım Amacı</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CF</strong></td>
                  <td>Carry Flag (Elde)</td>
                  <td>En yüksek bitten (bit 7 veya 15) dışarı elde taştıysa veya borç alındıysa</td>
                  <td>Elde/borç yoksa</td>
                  <td><strong>İşaretsiz sayılarda taşma</strong> ve çok-baytlı toplama</td>
                </tr>
                <tr>
                  <td><strong>ZF</strong></td>
                  <td>Zero Flag (Sıfır)</td>
                  <td>İşlem sonucu tam olarak <strong>0</strong> ise</td>
                  <td>Sonuç sıfırdan farklıysa</td>
                  <td>Eşitlik kontrolü (CMP sonrası JE/JZ)</td>
                </tr>
                <tr>
                  <td><strong>SF</strong></td>
                  <td>Sign Flag (İşaret)</td>
                  <td>Sonucun en yüksek anlamlı biti (MSB) 1 ise (negatif sayı)</td>
                  <td>MSB 0 ise (pozitif)</td>
                  <td>İşaretli sayıların negatifliğini anlama</td>
                </tr>
                <tr>
                  <td><strong>OF</strong></td>
                  <td>Overflow Flag (Taşma)</td>
                  <td><strong>İşaretli sayı sınırları aşıldıysa</strong> (iki pozitif toplamından negatif çıkması)</td>
                  <td>Taşma yoksa</td>
                  <td><strong>İşaretli aritmetikte taşma</strong> tespiti</td>
                </tr>
                <tr>
                  <td><strong>AF</strong></td>
                  <td>Auxiliary Flag (Yardımcı)</td>
                  <td>Bit 3'ten Bit 4'e elde geçtiyse (alt nibble taşması)</td>
                  <td>Alt nibble eldesi yoksa</td>
                  <td>BCD (ikili kodlanmış onluk) aritmetiği (DAA/DAS)</td>
                </tr>
                <tr>
                  <td><strong>PF</strong></td>
                  <td>Parity Flag (Eşlik)</td>
                  <td>Sonucun düşük baytındaki '1' bitlerinin sayısı <strong>ÇİFT</strong> ise</td>
                  <td>'1' bitlerinin sayısı TEK ise</td>
                  <td>Veri iletim hata kontrolü</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="theory-golden-rule">
            📌 <strong>CF ve OF Arasındaki Hayati Fark:</strong><br>
            - <strong>CF (Carry):</strong> İşlemci sayıları <strong>İŞARETSİZ</strong> (0..255) kabul ettiğinde taşmayı gösterir.<br>
            - <strong>OF (Overflow):</strong> İşlemci sayıları <strong>İŞARETLİ (-128..+127)</strong> kabul ettiğinde taşmayı gösterir.<br>
            Örneğin <code>7FH + 01H = 80H</code> işleminde: İşaretsiz olarak 127 + 1 = 128 (sığar, CF=0). Fakat işaretli olarak +127 + 1 = -128 (taşar, iki pozitiften negatif çıktı, OF=1)!
          </div>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: Toplama, Çıkarma ve Karşılaştırma (ADD, ADC, SUB, SBB, CMP, INC, DEC)',
        htmlContent: `
          <ul>
            <li><code>ADD Hedef, Kaynak</code>: Hedef = Hedef + Kaynak. Tüm bayrakları etkiler.</li>
            <li><code>ADC Hedef, Kaynak</code>: Hedef = Hedef + Kaynak + CF. Çok-kelimeli (32-bit / 64-bit) toplama için kullanılır.</li>
            <li><code>SUB Hedef, Kaynak</code>: Hedef = Hedef - Kaynak. Tüm bayrakları etkiler.</li>
            <li><code>SBB Hedef, Kaynak</code>: Hedef = Hedef - Kaynak - CF. Borçlu çıkarma.</li>
            <li><code>CMP Hedef, Kaynak</code>: Hedef - Kaynak işlemini yapar fakat <strong>sonucu HEDEFE KAYDETMEZ</strong>; sadece bayrakları günceller! Karar yapıları (JE, JL, JA vb.) öncesinde kullanılır.</li>
            <li><code>INC / DEC</code>: Değeri 1 artırır / azaltır. <strong>DİKKAT: CF BAYRAĞINI ETKİLEMEZ!</strong> Bu sayede döngü sayacı olarak döngü içindeki eldeli toplamaları bozmaz.</li>
          </ul>
        `
      },
      {
        stepNumber: 3,
        stepTitle: '3. Adım: Çarpma (MUL, IMUL) ve Bölme (DIV, IDIV) Donanım Kuralları',
        htmlContent: `
          <p>8086'da çarpma ve bölme komutlarında akümülatör (AX) ve veri yazmacı (DX) donanımsal olarak ZORUNLUDUR:</p>
          <div class="theory-grid-2col">
            <div class="theory-box">
              <h4>✖️ Çarpma (MUL / IMUL)</h4>
              <p>Tek bir kaynak operant alır (diğer çarpan donanım tarafından belirlenir):</p>
              <ul>
                <li><strong>8-bit:</strong> <code>MUL BL</code> → <code>AX = AL × BL</code></li>
                <li><strong>16-bit:</strong> <code>MUL BX</code> → <code>DX:AX = AX × BX</code> (Yüksek 16-bit DX'e, düşük 16-bit AX'e yazılır).</li>
                <li><code>MUL</code> işaretsiz, <code>IMUL</code> işaretli çarpar.</li>
              </ul>
            </div>
            <div class="theory-box">
              <h4>➗ Bölme (DIV / IDIV)</h4>
              <p>Bölünen sayı peşin olarak AX veya DX:AX içinde bulunmalıdır:</p>
              <ul>
                <li><strong>8-bit:</strong> <code>DIV BL</code> → Bölünen <code>AX</code>'tir. Sonuçta <code>AL = Bölüm</code>, <code>AH = Kalan</code>.</li>
                <li><strong>16-bit:</strong> <code>DIV BX</code> → Bölünen <code>DX:AX</code>'tir. Sonuçta <code>AX = Bölüm</code>, <code>DX = Kalan</code>.</li>
                <li>Sıfıra bölme yapılırsa CPU anında <strong>INT 0 (Divide by Zero)</strong> hatası fırlatır!</li>
              </ul>
            </div>
          </div>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: Toplama & 32-Bit Çok Baytlı Eldeli Toplama (ADD & ADC)',
        groupDescription: 'Temel toplama ve 16-bit sınırını aşan büyük sayıların eldeli toplaması.',
        items: [
          {
            title: 'Temel Toplama ve Bayrak Durumları',
            description: 'Toplama işlemi sonrasında ALU bayraklarının değişimini izleyin.',
            code: `ORG 100H\nMOV AL, 0F5H       ; AL = 1111 0101b\nMOV BL, 00BH       ; BL = 0000 1011b\nADD AL, BL         ; AL = 00H (Elde tasiyor: 100H)\n; Sonuc: AL = 00H, CF = 1, ZF = 1, AF = 1, PF = 1\nHLT`
          },
          {
            title: 'ADC ile 32-Bit Sayı Toplama',
            description: 'İki adet 32-bit sayıyı (DX:AX ve CX:BX) alt ve üst kelimeler olarak eldeli toplama.',
            code: `ORG 100H\n; 1. Sayi: 0002FFFFH (DX:AX)\nMOV DX, 0002H\nMOV AX, 0FFFFH\n\n; 2. Sayi: 00010002H (CX:BX)\nMOV CX, 0001H\nMOV BX, 0002H\n\n; Once dusuk kelimeleri topla:\nADD AX, BX         ; FFFFH + 0002H = 0001H (CF = 1 oldu!)\n\n; Sonra yuksek kelimeleri eldesiyle topla:\nADC DX, CX         ; 0002H + 0001H + 1 = 0004H\n\n; Sonuc: DX:AX = 00040001H\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 2: Çarpma (MUL) ve Bölme (DIV) Kullanım Örnekleri',
        groupDescription: '8-bit ve 16-bit çarpma ve bölme mekanizmalarının simülasyonu.',
        items: [
          {
            title: '8-Bit ve 16-Bit Çarpma (MUL)',
            description: 'AL * Kaynak ve AX * Kaynak çarpımlarının sonuç yazmaçlarına yerleşimi.',
            code: `ORG 100H\n; 8-bit carpma (25 * 10 = 250 = 00FAH):\nMOV AL, 25\nMOV BL, 10\nMUL BL             ; AX = AL * BL = 00FAH\n\n; 16-bit carpma (1000H * 2000H = 02000000H):\nMOV AX, 1000H\nMOV BX, 2000H\nMUL BX             ; DX:AX = 0200 0000H (DX = 0200H, AX = 0000H)\nHLT`
          },
          {
            title: 'Bölme İşlemi (Bölüm ve Kalan Ayrımı)',
            description: '100 sayısını 7\'ye bölme: Bölüm AL\'ye, Kalan AH\'ye düşer.',
            code: `ORG 100H\nMOV AX, 100        ; Bolunen = 100 (AX icinde)\nMOV BL, 7          ; Bolen = 7\nDIV BL             ; AL = 14 (Bolum), AH = 2 (Kalan: 14*7 + 2 = 100)\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 3: CMP (Karşılaştırma) ve Bayrak Kurulumu',
        groupDescription: 'İki sayıyı karşılaştırıp sonuca dokunmadan bayrakları kurma.',
        items: [
          {
            title: 'CMP ile Eşitlik ve Büyüklük Testi',
            description: 'CMP çıkarma yapar ama hedefi bozmaz; ZF ve CF durumuna dikkat edin.',
            code: `ORG 100H\nMOV AX, 50\nMOV BX, 50\nCMP AX, BX         ; AX - BX = 0 -> ZF = 1 (Esitler! AX hala 50)\n\nMOV CX, 30\nCMP CX, AX         ; 30 - 50 -> Negatif, CF = 1 (CX kucuktur AX)\nHLT`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-arith-1',
        title: 'Soru 1: 0F5H + 00BH Tam Bayrak Türetimi (Klasik Sınav Sorusu)',
        points: 20,
        difficulty: 'Zor',
        scenario: 'AL = 0F5H ve BL = 00BH yüklenip "ADD AL, BL" çalıştırılıyor. Nihai AL değerini ve 6 durum bayrağını (CF, ZF, SF, OF, PF, AF) bit seviyesinde türeterek açıklayınız.',
        codeSnippet: 'MOV AL, 0F5H\nMOV BL, 00BH\nADD AL, BL',
        solutionSteps: [
          'Bit Seviyesi Toplama:\n  0F5H = 1111 0101b\n+ 00BH = 0000 1011b\n--------------------\n  100H = 1 0000 0000b',
          'AL 8-bit olduğu için düşük 8 biti alır: AL = 00H.',
          'CF = 1: 8. bitten dışarıya elde taştı (100H > FFH).',
          'ZF = 1: AL içindeki sonuç 00H oldu.',
          'AF = 1: Alt nibble toplamasında (0101b + 1011b = 10000b) bit 3\'ten bit 4\'e elde geçti.',
          'PF = 1: 00H içinde çift sayıda (0 adet) 1 biti vardır (0 çifttir).',
          'SF = 0: En yüksek anlamlı bit (bit 7) 0\'dır.',
          'OF = 0: İşaretli olarak (-11) + (+11) = 0 işleminde taşma yoktur.'
        ],
        expectedResult: 'AL = 00H, CF=1, ZF=1, AF=1, PF=1, SF=0, OF=0',
        examTips: '00H sonucunda PF\'nin 1 olduğunu unutmayın! 0 adet 1 biti çift sayılır.'
      }
    ],
    challenges: [
      {
        id: 'ch-arith-div-mod',
        title: 'Alıştırma: 16-Bit Bölme ile Saat ve Dakika Hesabı',
        difficulty: 'Orta',
        task: 'AX içinde toplam dakika sayısı olarak 175 verilmiştir. Bir saatte 60 dakika olduğunu kullanarak, 175 dakikayı saat ve artan dakikaya çeviriniz (Bölüm CH\'ye, Kalan CL\'ye kaydedilsin).',
        starterCode: 'ORG 100H\nMOV AX, 175        ; Toplam dakika\n; Kodunuzu buraya yazin (Bolen: 60)\n\nHLT',
        solutionCode: 'ORG 100H\nMOV AX, 175\nMOV BL, 60\nDIV BL             ; AL = 2 (Saat), AH = 55 (Dakika)\nMOV CH, AL\nMOV CL, AH\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 4: MANTIKSAL İŞLEMLER & BİT KAYDIRMA/DÖNDÜRME
  // -------------------------------------------------------------------------
  {
    id: 'logic-shifts',
    legacyMilestoneId: 'milestone-4',
    number: 4,
    title: 'Mantıksal İşlemler & Bit Kaydırma/Döndürme (AND, OR, XOR, NOT, TEST, SHL, SHR, SAR, ROL, ROR)',
    shortTitle: '4. Mantıksal & Kaydırma',
    icon: '🔀',
    badge: 'BİT MANİPÜLASYONU',
    opcodes: ['AND', 'OR', 'XOR', 'NOT', 'TEST', 'SHL', 'SAL', 'SHR', 'SAR', 'ROL', 'ROR', 'RCL', 'RCR'],
    summary: 'Bit maskeleme işlemleri (sıfırlama, birleme, tersleme); TEST ile tahribatsız kontrol; SHL/SHR ile 2\'nin kuvvetleriyle hızlı çarpma/bölme; SAR ile işaret korumalı aritmetik kaydırma ve halka döndürme (ROL/ROR).',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: Bit Maskeleme Sanatı (AND, OR, XOR, TEST)',
        htmlContent: `
          <div class="theory-grid-2col">
            <div class="theory-box">
              <h4>🎭 Maskeleme Görevleri</h4>
              <ul>
                <li><strong>AND (Bit Sıfırlama):</strong> İstenen bitleri 0 yapmak için kullanılır (örneğin küçük harfi büyük harfe çevirmek için bit 5 sıfırlanır: <code>AND AL, 0DFH</code>).</li>
                <li><strong>OR (Bit Birleme):</strong> İstenen bitleri 1 yapmak için kullanılır.</li>
                <li><strong>XOR (Bit Tersleme / Sıfırlama):</strong> Bir yazmacı sıfırlamanın en hızlı ve en az yer kaplayan yoludur: <code>XOR AX, AX</code> (2 bayt kaplar; <code>MOV AX, 0</code> 3 bayt kaplar!).</li>
                <li><strong>TEST (Tahribatsız Kontrol):</strong> <code>AND</code> işlemi yapar ancak hedefi değiştirmez, sadece ZF/SF bayraklarını günceller.</li>
              </ul>
            </div>
            <div class="theory-box">
              <h4>🔄 NOT Komutu</h4>
              <p>Her bir biti ters çevirir (1'e tümleyen). <strong>Hayati Kural:</strong> <code>NOT</code> komutu hiçbir bayrağı (FLAGS) ETKİLEMEZ!</p>
            </div>
          </div>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: Kaydırma ve Döndürme Farkları (Shift vs Rotate)',
        htmlContent: `
          <div class="theory-table-wrap">
            <table class="topic-detail-table">
              <thead>
                <tr>
                  <th>Komut</th>
                  <th>İsim & Yön</th>
                  <th>Giren Bit</th>
                  <th>Çıkan Bit (CF)</th>
                  <th>Matematiksel Karşılığı</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>SHL / SAL</code></td>
                  <td>Sola Mantıksal/Aritmetik</td>
                  <td>Sağdan <strong>0</strong> girer</td>
                  <td>En sol bit (MSB) <strong>CF</strong>'ye düşer</td>
                  <td>2 ile çarpma (Sayı $\\times 2^n$)</td>
                </tr>
                <tr>
                  <td><code>SHR</code></td>
                  <td>Sağa Mantıksal</td>
                  <td>Soldan <strong>0</strong> girer</td>
                  <td>En sağ bit (LSB) <strong>CF</strong>'ye düşer</td>
                  <td>İşaretsiz 2'ye bölme</td>
                </tr>
                <tr>
                  <td><code>SAR</code></td>
                  <td>Sağa Aritmetik</td>
                  <td><strong>İşaret Biti (MSB) korunarak kopyalanır</strong></td>
                  <td>En sağ bit (LSB) <strong>CF</strong>'ye düşer</td>
                  <td>İşaretli (-/+) 2'ye bölme</td>
                </tr>
                <tr>
                  <td><code>ROL / ROR</code></td>
                  <td>Halka Döndürme</td>
                  <td>Çıkan bit diğer uca geri girer</td>
                  <td>Aynı zamanda <strong>CF</strong>'ye kopyalanır</td>
                  <td>Dairesel bit rotasyonu</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="theory-note-tip">
            ⚠️ <strong>CL Yazmacı Kuralı:</strong> 8086'da kaydırma miktarı 1 ise <code>SHL AX, 1</code> şeklinde sabit yazılabilir. Fakat 1'den fazla kaydırmak için sayı ZORUNLU OLARAK <code>CL</code> yazmacına konulmalıdır:
            <br><code>MOV CL, 4</code> → <code>SHR AX, CL</code>
          </div>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: Mantıksal İşlemler ve Maskeleme Örnekleri',
        groupDescription: 'Bit temizleme, bit açma ve hızlı sıfırlama.',
        items: [
          {
            title: 'Hızlı Yazmaç Sıfırlama ve Harf Dönüşümü',
            description: 'XOR ile sıfırlama ve ASCII küçük \'a\' (61h) harfini büyük \'A\' (41h) yapma.',
            code: `ORG 100H\nXOR AX, AX         ; AX = 0000H (ZF = 1 olur)\n\nMOV AL, 'a'        ; AL = 61H (0110 0001b)\nAND AL, 0DFH       ; 5. biti sifirla (1101 1111b) -> AL = 'A' (41H)\nHLT`
          },
          {
            title: 'TEST Komutu ile Tek/Çift Sayı Kontrolü',
            description: 'En düşük bit 1 ise sayı tektir; TEST ile AL bozulmadan ZF kontrol edilir.',
            code: `ORG 100H\nMOV AL, 17         ; 17 tek sayidir (0001 0001b)\nTEST AL, 01H       ; Bit 0'i test et -> Sonuc 1, ZF = 0 (Tek!)\n\nMOV BL, 20         ; 20 cift sayidir (0001 0100b)\nTEST BL, 01H       ; Bit 0'i test et -> Sonuc 0, ZF = 1 (Cift!)\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 2: Kaydırma ile Hızlı Çarpma ve Bölme (SHL, SHR, SAR)',
        groupDescription: 'ALU çarpma ünitesine gerek duymadan 2, 4, 8, 16 ile çarpma/bölme.',
        items: [
          {
            title: 'SHL ile Sayıyı 8 ile Çarpma (3 Kez Sola Kaydırma)',
            description: 'CL yazmacına 3 koyarak sayıyı tek adımda 8 ile çarpalım.',
            code: `ORG 100H\nMOV AX, 5          ; Carpılacak sayi = 5\nMOV CL, 3          ; 2^3 = 8 ile carpmak icin sayac\nSHL AX, CL         ; AX = 5 * 8 = 40 (0028H)\nHLT`
          },
          {
            title: 'SAR ile Negatif Sayıyı 2\'ye Bölme (İşaret Korumalı)',
            description: 'SHR negatif sayıyı bozar; SAR ise MSB işaret bitini korur.',
            code: `ORG 100H\nMOV AL, -16        ; AL = 0F0H (1111 0000b)\nSAR AL, 1          ; AL = -8 (1111 1000b = 0F8H)\nHLT`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-logic-1',
        title: 'Soru 1: SAR ve SHR Arasındaki Kritik Fark',
        points: 15,
        difficulty: 'Orta',
        scenario: 'AL = 0F0H (-16) iken "SHR AL, 1" ve "SAR AL, 1" komutları ayrı ayrı çalıştırılırsa AL değerleri ne olur? Açıklayınız.',
        codeSnippet: '; Durum 1:\nMOV AL, 0F0H\nSHR AL, 1\n\n; Durum 2:\nMOV AL, 0F0H\nSAR AL, 1',
        solutionSteps: [
          '0F0H ikili açılımı: 1111 0000b.',
          '1) SHR AL, 1: Soldan 0 girer -> 0111 1000b = 78H (Onluk +120). İşaret kaybolur!',
          '2) SAR AL, 1: Soldan işaret biti olan 1 kopyalanarak girer -> 1111 1000b = 0F8H (Onluk -8). İşaretli bölme doğru çalışır.'
        ],
        expectedResult: 'SHR sonucu 78H (+120), SAR sonucu 0F8H (-8)',
        examTips: 'İşaretli sayıları bölerken daima SAR, işaretsiz sayıları bölerken daima SHR kullanılır.'
      }
    ],
    challenges: [
      {
        id: 'ch-logic-unpack-nibbles',
        title: 'Alıştırma: Bayt İçindeki İki Nibble\'ı Ayırma',
        difficulty: 'Orta',
        task: 'AL yazmacında 9AH verisi bulunmaktadır. Yüksek nibble\'ı (9) BH yazmacına, düşük nibble\'ı (A) BL yazmacına izole ediniz (Maskeleme ve kaydırma kullanarak).',
        starterCode: 'ORG 100H\nMOV AL, 9AH\n; Yüksek nibble BH\'ye, Dusuk nibble BL\'ye:\n\nHLT',
        solutionCode: 'ORG 100H\nMOV AL, 9AH\nMOV BL, AL\nAND BL, 0FH        ; BL = 0AH (Dusuk nibble)\n\nMOV BH, AL\nMOV CL, 4\nSHR BH, CL         ; BH = 09H (Yuksek nibble)\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 5: PROGRAM AKIŞI, DALLANMALAR & DÖNGÜLER
  // -------------------------------------------------------------------------
  {
    id: 'control-loops',
    legacyMilestoneId: 'milestone-5',
    number: 5,
    title: 'Program Akış Kontrolü, Koşullu Dallanmalar & Döngüler (JMP, Jxx, LOOP, JCXZ)',
    shortTitle: '5. Akış Kontrolü & Döngüler',
    icon: '🔄',
    badge: 'KONTROL & ALGORİTMA',
    opcodes: ['JMP', 'JE', 'JZ', 'JNE', 'JNZ', 'JA', 'JB', 'JAE', 'JBE', 'JG', 'JL', 'JGE', 'JLE', 'JC', 'JNC', 'JO', 'JS', 'LOOP', 'LOOPE', 'LOOPNE', 'JCXZ'],
    summary: 'Koşulsuz atlama (JMP); işaretli (JG/JL) ve işaretsiz (JA/JB) sayılar için koşullu dallanma haritası; donanımsal LOOP sayacı mekanizması; sınav klasiği Döngü İzleme Tablosu (Trace Table).',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: İşaretli vs İşaretsiz Dallanma Komutları Matrisi',
        htmlContent: `
          <div class="theory-table-wrap">
            <table class="topic-detail-table">
              <thead>
                <tr>
                  <th>Sayı Türü</th>
                  <th>Büyüktür Komutu</th>
                  <th>Küçüktür Komutu</th>
                  <th>Büyük-Eşit / Küçük-Eşit</th>
                  <th>Eşit / Eşit Değil</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>İşaretsiz (Unsigned)</strong></td>
                  <td><code>JA</code> (Above)</td>
                  <td><code>JB</code> (Below)</td>
                  <td><code>JAE</code> / <code>JBE</code></td>
                  <td><code>JE / JZ</code> & <code>JNE / JNZ</code></td>
                </tr>
                <tr>
                  <td><strong>İşaretli (Signed)</strong></td>
                  <td><code>JG</code> (Greater)</td>
                  <td><code>JL</code> (Less)</td>
                  <td><code>JGE</code> / <code>JLE</code></td>
                  <td><code>JE / JZ</code> & <code>JNE / JNZ</code></td>
                </tr>
                <tr>
                  <td><strong>Bayrak Tabanlı</strong></td>
                  <td colspan="4">
                    <code>JC</code> (Elde varsa, CF=1) | <code>JNC</code> (Elde yoksa, CF=0)<br>
                    <code>JZ</code> (Sıfırsa, ZF=1) | <code>JNZ</code> (Sıfır değilse, ZF=0)<br>
                    <code>JS</code> (Negatifse, SF=1) | <code>JO</code> (Taşma varsa, OF=1)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: LOOP ve JCXZ Komutlarının Kesin Çalışma Şekli',
        htmlContent: `
          <div class="theory-golden-rule">
            ⚙️ <strong>LOOP Komutunun Donanım Mekanizması:</strong><br>
            <code>LOOP Etiket</code> komutu tek başına şu iki adımı otomatik icra eder:<br>
            1. <strong>CX = CX - 1</strong> (Sayaç yazmacını 1 azaltır).<br>
            2. <strong>Eğer CX ≠ 0 ise</strong> Etiket adresine geri atlar. Eğer CX = 0 olduysa döngüden çıkar.<br>
            <strong>ÖNEMLİ:</strong> LOOP komutu <strong>HİÇBİR DURUM BAYRAĞINI (FLAGS) ETKİLEMEZ!</strong>
          </div>
          <p>
            ⚠️ <strong>Sıfır Tuzağı ve JCXZ:</strong> Eğer döngüye girmeden önce CX zaten 0 ise, LOOP komutu CX'i 1 azaltıp <code>FFFFH</code> (65535) yapar ve döngü 65535 kez döner! Bundan korunmak için döngüden önce <code>JCXZ CIKIS</code> emniyet kontrolü konur.
          </p>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: Koşullu Dallanma ve Karar Yapıları (If - Else)',
        groupDescription: 'İki sayıyı karşılaştırıp sonuca göre farklı kod bloklarını çalıştırma.',
        items: [
          {
            title: 'If-Else Karar Şablonu (AX ve BX Karşılaştırma)',
            description: 'AX > BX ise DX=1 yap; aksi halde DX=2 yap.',
            code: `ORG 100H\nMOV AX, 35\nMOV BX, 20\n\nCMP AX, BX         ; AX ile BX'i karsilastir\nJLE KUCUK_ESIT     ; Eger AX <= BX ise dallan\n\nBUYUK:\nMOV DX, 1          ; AX daha buyuk\nJMP BITIR          ; Else blogunu atla\n\nKUCUK_ESIT:\nMOV DX, 2          ; AX kucuk veya esit\n\nBITIR:\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 2: LOOP Komutu ile Dizi Toplama ve Döngüler',
        groupDescription: '1\'den 5\'e kadar olan sayıları toplayan sayaçlı döngü.',
        items: [
          {
            title: '1\'den N\'e Kadar Sayıların Toplamı',
            description: 'CX sayacı ile 5 kez dönen döngü.',
            code: `ORG 100H\nMOV CX, 5          ; Dongu sayaci (5 kez donecek)\nXOR AX, AX         ; Toplam = 0\n\nDONGU:\nADD AX, CX         ; AX = AX + CX (5+4+3+2+1)\nLOOP DONGU         ; CX = CX - 1; CX != 0 ise DONGU'ye atla\n\n; AX = 15 (000FH)\nHLT`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-loop-1',
        title: 'Soru 1: Döngü İzleme Tablosu (Trace Table - 20 Puan)',
        points: 20,
        difficulty: 'Zor',
        scenario: 'Aşağıdaki kod parçasının her iterasyonunda AX, CX ve ZF bayrağının değerlerini adım adım gösteren İzleme Tablosunu (Trace Table) çıkarınız.',
        codeSnippet: 'MOV AX, 0\nMOV CX, 3\nBASLA:\nADD AX, 10\nLOOP BASLA\nHLT',
        solutionSteps: [
          'Başlangıç: AX = 0, CX = 3',
          'İterasyon 1: ADD AX, 10 -> AX = 10. LOOP BASLA -> CX = 2 (CX≠0, atlar).',
          'İterasyon 2: ADD AX, 10 -> AX = 20. LOOP BASLA -> CX = 1 (CX≠0, atlar).',
          'İterasyon 3: ADD AX, 10 -> AX = 30. LOOP BASLA -> CX = 0 (CX=0, döngü biter).',
          'Döngü Sonu: AX = 30 (001EH), CX = 0000H.'
        ],
        expectedResult: 'AX = 30, CX = 0',
        examTips: 'LOOP komutunun CX=0 olduğunda döngüyü bitirdiğini ve bayrakları değiştirmediğini unutmayın.'
      }
    ],
    challenges: [
      {
        id: 'ch-loop-count-evens',
        title: 'Alıştırma: Dizideki Çift Sayı Adedini Sayma',
        difficulty: 'Zor',
        task: '0200H adresinden başlayan 4 elemanlı bayt dizisinde (örneğin: 3, 4, 8, 9) kaç adet çift sayı olduğunu sayıp sonucu DL yazmacına kaydediniz.',
        starterCode: 'ORG 100H\nMOV BYTE PTR [0200H], 3\nMOV BYTE PTR [0201H], 4\nMOV BYTE PTR [0202H], 8\nMOV BYTE PTR [0203H], 9\n\n; Cift sayi sayaci: DL\nHLT',
        solutionCode: 'ORG 100H\nMOV BYTE PTR [0200H], 3\nMOV BYTE PTR [0201H], 4\nMOV BYTE PTR [0202H], 8\nMOV BYTE PTR [0203H], 9\n\nMOV SI, 0200H\nMOV CX, 4\nXOR DL, DL\n\nKONTROL:\nMOV AL, [SI]\nTEST AL, 1\nJNZ TEK\nINC DL\nTEK:\nINC SI\nLOOP KONTROL\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 6: YIĞIN (STACK), ALT YORDAMLAR & PROSEDÜRLER
  // -------------------------------------------------------------------------
  {
    id: 'stack-procedures',
    legacyMilestoneId: 'milestone-6',
    number: 6,
    title: 'Yığın Mimarisi (Stack), Alt Yordamlar & Prosedür Çağrısı (PUSH, POP, CALL, RET, BP)',
    shortTitle: '6. Yığın & Prosedürler',
    icon: '📚',
    badge: 'BELLEK & ALT PROGRAM',
    opcodes: ['PUSH', 'POP', 'PUSHF', 'POPF', 'CALL', 'RET'],
    summary: 'Yığının LIFO (Son Giren İlk Çıkar) yapısı ve bellekte aşağıya doğru büyümesi (SP azalır); CALL ve RET ile dönüş adresi saklama; BP ile Stack Frame oluşturma ve prosedüre parametre aktarımı.',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: Yığın (Stack) Çalışma Prensibi ve SP Değişimi',
        htmlContent: `
          <div class="theory-golden-rule">
            📌 <strong>Yığının Bellek Büyüme Yönü:</strong><br>
            8086'da yığın <strong>YÜKSEK ADRESTEN DÜŞÜK ADRESE DOĞRU BÜYÜR</strong> (Grow downwards).<br>
            - <code>PUSH AX</code>: Yığına 2 bayt ekler → <strong>SP = SP - 2</strong> (SP iki azalır!).<br>
            - <code>POP AX</code>: Yığından 2 bayt çeker → <strong>SP = SP + 2</strong> (SP iki artar!).<br>
            Yığın daima <strong>16-bit (2 bayt - kelime)</strong> olarak çalışır. 8-bitlik bir yazmaç doğrudan PUSH edilemez (<code>PUSH AL</code> ❌ YASAKTIR).
          </div>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: CALL ve RET Komutlarının Donanım İşleyişi',
        htmlContent: `
          <ul>
            <li><code>CALL ProsedürAdı</code>:
              <br>1. Sıradaki komutun adresini (<code>IP</code>) yığına atar: <code>PUSH IP</code>.
              <br>2. <code>IP</code> yazmacına prosedürün başlangıç adresini yükler ve oraya sıçrar.
            </li>
            <li><code>RET</code>:
              <br>1. Yığından dönüş adresini çeker: <code>POP IP</code>.
              <br>2. Kaldığı yerden ana programa devam eder.
            </li>
          </ul>
          <div class="theory-note-tip">
            💡 <strong>Prosedür İçi Yazmaç Koruma Kuralı:</strong> Bir alt yordam yazarken ana programın yazmaçlarını bozmama prensibi geçerlidir. Prosedür başında <code>PUSH</code> edilen yazmaçlar, prosedür sonunda <strong>TERS SIRAYLA</strong> <code>POP</code> edilmelidir!
          </div>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: PUSH, POP ve Yazmaç Saklama Kalıbı',
        groupDescription: 'Yazmaç değerlerini geçici olarak yığına atıp geri alma.',
        items: [
          {
            title: 'Yığın ile İki Değeri Takas Etme',
            description: 'PUSH ve POP ile AX ve BX içeriğini yer değiştirme.',
            code: `ORG 100H\nMOV AX, 1234H\nMOV BX, 5678H\n\nPUSH AX            ; Yigina AX (1234H) atildi (SP 2 azaldi)\nPUSH BX            ; Yigina BX (5678H) atildi (SP 2 azaldi)\n\nPOP AX             ; Son giren ilk cikar: AX = 5678H\nPOP BX             ; BX = 1234H\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 2: CALL ve RET ile Modüler Prosedür Yazımı',
        groupDescription: 'Bağımsız bir alt yordam tanımlama ve çağırma.',
        items: [
          {
            title: 'Kare Alma Alt Yordamı (CALL ve RET)',
            description: 'AL içindeki sayının karesini hesaplayıp dönen fonksiyon.',
            code: `ORG 100H\nMOV AL, 5\nCALL KARE_AL       ; AL = 5 * 5 = 25 (19H)\n\nMOV AL, 7\nCALL KARE_AL       ; AL = 7 * 7 = 49 (31H)\nHLT\n\n; --- ALT YORDAM ---\nKARE_AL PROC\n  MUL AL           ; AL * AL -> AX (sonuc AL'de)\n  RET              ; Ana programa geri don\nKARE_AL ENDP`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-stack-1',
        title: 'Soru 1: PUSH / POP Sonrası SP Hesabı',
        points: 15,
        difficulty: 'Kolay',
        scenario: 'Başlangıçta SP = 0100H iken sırasıyla "PUSH AX", "PUSH BX", "POP CX" komutları çalıştırılırsa nihai SP değeri ne olur?',
        codeSnippet: '; Baslangicta SP = 0100H\nPUSH AX\nPUSH BX\nPOP CX',
        solutionSteps: [
          '1. PUSH AX: SP = 0100H - 2 = 00FEH',
          '2. PUSH BX: SP = 00FEH - 2 = 00FCH',
          '3. POP CX: SP = 00FCH + 2 = 00FEH',
          'Sonuç: Nihai SP = 00FEH.'
        ],
        expectedResult: 'SP = 00FEH',
        examTips: 'PUSH yaptıkça SP azalır, POP yaptıkça SP artar.'
      }
    ],
    challenges: [
      {
        id: 'ch-stack-reverse',
        title: 'Alıştırma: Diziyi Yığın Kullanarak Ters Çevirme',
        difficulty: 'Orta',
        task: 'AX, BX, CX yazmaçlarındaki 1, 2, 3 değerlerini yığına atıp geri çekerek sırayı 3, 2, 1 şeklinde tersine çeviriniz.',
        starterCode: 'ORG 100H\nMOV AX, 1\nMOV BX, 2\nMOV CX, 3\n\n; Yigin kullanarak AX=3, BX=2, CX=1 yapin:\n\nHLT',
        solutionCode: 'ORG 100H\nMOV AX, 1\nMOV BX, 2\nMOV CX, 3\nPUSH AX\nPUSH BX\nPUSH CX\nPOP AX\nPOP BX\nPOP CX\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 7: DİZİ & STRİNG İŞLEMLERİ
  // -------------------------------------------------------------------------
  {
    id: 'strings',
    legacyMilestoneId: 'milestone-7',
    number: 7,
    title: 'Dizi & Karakter Dizisi (String) İşlemleri (MOVSB, LODSB, STOSB, CMPSB, SCASB, REP, DF)',
    shortTitle: '7. Dizi & String İşlemleri',
    icon: '🧵',
    badge: 'BLOK VERİ TRANSFERİ',
    opcodes: ['MOVSB', 'MOVSW', 'LODSB', 'LODSW', 'STOSB', 'STOSW', 'CMPSB', 'CMPSW', 'SCASB', 'SCASW', 'REP', 'REPE', 'REPNE', 'CLD', 'STD'],
    summary: 'Donanımsal string komutları; DS:SI (kaynak) ve ES:DI (hedef) yazmaç kuralları; Yön Bayrağı (DF, CLD, STD); REP ön eki ile bellek blok kopyalama, doldurma ve karakter arama.',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: String Komutlarının Donanım Kuralları',
        htmlContent: `
          <div class="theory-golden-rule">
            📌 <strong>String Komutlarının Sabit Yazmaç Çifti:</strong><br>
            - <strong>Kaynak (Source):</strong> DAİMA <code>DS:SI</code> segment ve indeksindedir.<br>
            - <strong>Hedef (Destination):</strong> DAİMA <code>ES:DI</code> segment ve indeksindedir.<br>
            - <strong>Sayaç (Counter):</strong> <code>REP</code> ön eki kullanıldığında tekrar sayısı <code>CX</code> yazmacındadır.
          </div>
          <p>
            <strong>Yön Bayrağı (Direction Flag - DF):</strong><br>
            - <code>CLD</code> (Clear Direction Flag): <strong>DF = 0</strong> yapar. Her işlemden sonra SI ve DI <strong>ARTAR</strong> (düşük adresten yükseğe, soldan sağa).<br>
            - <code>STD</code> (Set Direction Flag): <strong>DF = 1</strong> yapar. SI ve DI <strong>AZALIR</strong> (geriye doğru).
          </p>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: 5 Temel String Komutu Özeti',
        htmlContent: `
          <ul>
            <li><code>MOVSB / MOVSW</code>: Bellekten belleğe doğrudan transfer: <code>[ES:DI] <- [DS:SI]</code>.</li>
            <li><code>LODSB / LODSW</code>: Bellekten akümülatöre okur: <code>AL/AX <- [DS:SI]</code>.</li>
            <li><code>STOSB / STOSW</code>: Akümülatörden belleğe yazar: <code>[ES:DI] <- AL/AX</code> (Bellek doldurma/sıfırlama).</li>
            <li><code>CMPSB / CMPSW</code>: İki diziyi karşılaştırır: <code>[DS:SI] - [ES:DI]</code> (Bayrakları kurar).</li>
            <li><code>SCASB / SCASW</code>: Bellekte değer arar: <code>AL/AX - [ES:DI]</code> (Karakter arama).</li>
          </ul>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: Hızlı Bellek Kopyalama ve Doldurma (REP MOVSB & REP STOSB)',
        groupDescription: 'Döngü kodu yazmadan donanım hızıyla blok bellek transferi.',
        items: [
          {
            title: 'REP MOVSB ile 5 Baytlık Blok Kopyalama',
            description: 'Kaynak dizideki veriyi hedef diziye tek satırda aktarır.',
            code: `ORG 100H\n; Kaynak verileri hazirla:\nMOV BYTE PTR [0200H], 10H\nMOV BYTE PTR [0201H], 20H\nMOV BYTE PTR [0202H], 30H\n\nCLD                ; DF = 0 (Ileri dogru art)\nMOV SI, 0200H      ; DS:SI = Kaynak\nMOV DI, 0300H      ; ES:DI = Hedef\nMOV CX, 3          ; 3 bayt kopyala\n\nREP MOVSB          ; [0300H]..[0302H] adresine kopyalandi!\nHLT`
          },
          {
            title: 'REP STOSB ile Bellek Alanını Sıfırlama (Memset)',
            description: '10 baytlık bir bellek bölgesini 00H ile doldurma.',
            code: `ORG 100H\nCLD\nMOV DI, 0200H      ; Hedef adres\nMOV AL, 00H        ; Doldurulacak deger\nMOV CX, 10         ; 10 bayt boyunca\nREP STOSB          ; 10 bayt sifirlandi\nHLT`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-str-1',
        title: 'Soru 1: CLD ve STD Sonrası SI/DI Değişimi',
        points: 15,
        difficulty: 'Kolay',
        scenario: 'SI = 0100H iken "CLD" ardından "LODSW" çalıştırılırsa sıradaki SI değeri ne olur?',
        codeSnippet: 'MOV SI, 0100H\nCLD\nLODSW',
        solutionSteps: [
          '1. CLD yön bayrağını DF=0 yapar (artan yön).',
          '2. LODSW bir kelime (word = 2 bayt) okur.',
          '3. Kelime okunduğu için SI 2 artar: SI = 0100H + 2 = 0102H.'
        ],
        expectedResult: 'SI = 0102H',
        examTips: 'MOVSB/LODSB için 1 bayt, MOVSW/LODSW için 2 bayt artış/azalış olur.'
      }
    ],
    challenges: [
      {
        id: 'ch-str-find-char',
        title: 'Alıştırma: Dizide Belirli Karakteri Bulma (SCASB)',
        difficulty: 'Orta',
        task: '0200H adresindeki 5 baytlık dizide 24H ($) karakterini arayınız. Bulunduğunda döngüyü kesip DI ofsetini saklayınız.',
        starterCode: 'ORG 100H\nMOV BYTE PTR [0200H], \'A\'\nMOV BYTE PTR [0201H], \'B\'\nMOV BYTE PTR [0202H], \'$\'\nMOV BYTE PTR [0203H], \'C\'\nMOV BYTE PTR [0204H], \'D\'\n\n; SCASB ile \'$\' karakterini arayin:\nHLT',
        solutionCode: 'ORG 100H\nMOV BYTE PTR [0200H], \'A\'\nMOV BYTE PTR [0201H], \'B\'\nMOV BYTE PTR [0202H], \'$\'\nMOV BYTE PTR [0203H], \'C\'\nMOV BYTE PTR [0204H], \'D\'\nCLD\nMOV DI, 0200H\nMOV AL, \'$\'\nMOV CX, 5\nREPNE SCASB\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 8: GİRİŞ / ÇIKIŞ (I/O) & KESMELER (INTERRUPTS & IVT)
  // -------------------------------------------------------------------------
  {
    id: 'io-interrupts',
    legacyMilestoneId: 'milestone-9',
    number: 8,
    title: 'Giriş / Çıkış (I/O Portları) & Donanım/Yazılım Kesmeleri (IN, OUT, INT, IVT, INT 21h, IRET)',
    shortTitle: '8. I/O & Kesmeler',
    icon: '🔌',
    badge: 'SİSTEM & ÇEVRE BİRİMLERİ',
    opcodes: ['IN', 'OUT', 'INT', 'IRET', 'CLI', 'STI'],
    summary: 'Port I/O mekanizması (IN/OUT, DX ile 16-bit portlar); Kesme Vektör Tablosu (IVT - 00000H - 003FFH); INT çağrısı adımları ve DOS INT 21h sistem servisleri.',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: I/O Port Adresleme Kuralları (IN ve OUT)',
        htmlContent: `
          <p>8086 harici çevre birimleriyle (klavye, ekran kartı, zamanlayıcı) portlar üzerinden konuşur:</p>
          <ul>
            <li><strong>Doğrudan Port (8-Bit Sabit):</strong> Port numarası <code>00H - 0FFH</code> (0..255) arasında ise doğrudan sabit olarak yazılabilir: <code>IN AL, 60H</code> veya <code>OUT 61H, AL</code>.</li>
            <li><strong>Dolaylı Port (16-Bit):</strong> Port numarası 255'ten büyükse (<code>0000H - 0FFFFH</code>), port numarası ZORUNLU OLARAK <code>DX</code> yazmacına konulmalıdır: <code>MOV DX, 03F8H</code> → <code>IN AL, DX</code>.</li>
          </ul>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: Kesme Vektör Tablosu (IVT - Interrupt Vector Table)',
        htmlContent: `
          <div class="theory-golden-rule">
            📐 <strong>IVT Bellek Haritası ve Adres Formülü:</strong><br>
            - IVT, belleğin en başındaki ilk 1024 baytta (<code>00000H - 003FFH</code>) yer alır.<br>
            - Toplam <strong>256 adet kesme</strong> (0..255) vardır. Her kesme için 4 baytlık bir adres tutulur (2 bayt IP, 2 bayt CS).<br>
            <strong>Kesme Vektörü Adres Formülü:</strong> $\\text{IVT Adresi} = \\text{Kesme Numarası} \\times 4$.
          </div>
          <div class="calculation-example-box">
            <strong>Örnek IVT Adres Hesabı:</strong><br>
            <code>INT 21H</code> (DOS Servisi) kesmesinin vektör adresi:<br>
            $21H = 33_{10}$ → $33 \\times 4 = 132_{10} = 0084H$.<br>
            Dolayısıyla <code>00084H</code> adresinde ISR'ın IP değeri, <code>00086H</code> adresinde ise CS değeri saklanır.
          </div>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: Standart DOS INT 21h Sistem Çağrıları',
        groupDescription: 'Ekrana karakter ve metin yazdırma servisleri.',
        items: [
          {
            title: 'INT 21h ile Ekrana Karakter ve Metin Yazma',
            description: 'AH=02h (tek karakter) ve AH=09h ($-sonlandırıcılı metin).',
            code: `ORG 100H\n; 1. Tek karakter yaz (AH = 02H, Karakter DL'de):\nMOV AH, 02H\nMOV DL, 'X'\nINT 21H\n\n; 2. Programi DOS'a guvenle sonlandir (AH = 4CH):\nMOV AH, 4CH\nINT 21H`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-io-1',
        title: 'Soru 1: IVT Adres Hesabı',
        points: 15,
        difficulty: 'Kolay',
        scenario: 'İşlemcide "INT 08H" (Timer kesmesi) çağrıldığında, işlemci kesme alt yordamının (ISR) adresini okumak için belleğin hangi fiziksel adreslerine başvurur?',
        codeSnippet: 'INT 08H',
        solutionSteps: [
          'IVT adresi = Kesme No × 4 = 8 × 4 = 32 = 0020H.',
          'Ofset (IP) değeri: 00020H ve 00021H adreslerinden okunur.',
          'Segment (CS) değeri: 00022H ve 00023H adreslerinden okunur.'
        ],
        expectedResult: '00020H - 00023H adresleri',
        examTips: 'Her kesme 4 bayt yer kaplar. Adres daima Kesme No × 4 ile bulunur.'
      }
    ],
    challenges: [
      {
        id: 'ch-io-read-port',
        title: 'Alıştırma: 16-Bit DX Portundan Veri Okuma',
        difficulty: 'Kolay',
        task: '0378H (LPT Paralel Port) adresinden 1 bayt veri okuyup AL yazmacına alınız.',
        starterCode: 'ORG 100H\n; 0378H portundan AL\'ye okuyun:\n\nHLT',
        solutionCode: 'ORG 100H\nMOV DX, 0378H\nIN AL, DX\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 9: TABLO ÇEVİRİSİ (XLAT) & ÖZEL İLERİ DÜZEY KOMUTLAR
  // -------------------------------------------------------------------------
  {
    id: 'xlat-special',
    legacyMilestoneId: 'milestone-11',
    number: 9,
    title: 'Tablo Çevirisi (XLAT) & Özel İleri Düzey Komutlar (XLAT, CBW, CWD, HLT, NOP)',
    shortTitle: '9. XLAT & Özel Komutlar',
    icon: '⚙️',
    badge: 'İLERİ SEVİYE & SİSTEM',
    opcodes: ['XLAT', 'CBW', 'CWD', 'HLT', 'NOP', 'WAIT'],
    summary: 'Donanımsal arama tablosu çevirisi (XLAT); işaret genişletme (CBW, CWD); işlemci kontrol komutları (HLT, NOP) ve segment geçersiz kılma ön ekleri (Segment Overrides).',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: XLAT (Translate Table) Mekanizması',
        htmlContent: `
          <div class="theory-golden-rule">
            📌 <strong>XLAT Komutunun Çalışma Mantığı:</strong><br>
            <code>XLAT</code> komutu tek bir baytlık arama tablosu çevirisi yapar:<br>
            <strong>AL = DS:[BX + AL]</strong><br>
            - <code>BX</code>: Çeviri tablosunun başlangıç ofset adresini tutar.<br>
            - <code>AL</code>: Tablo içindeki eleman indeksini tutar.<br>
            Komut çalıştırıldığında AL içindeki indeks değeri, tablonun o elemanındaki bayt ile yer değiştirir. Karar/dallanma komutlarına gerek kalmadan 7-segment display kodlayıcı, ASCII-Hex çevirici ve şifreleme algoritmalarında kullanılır.
          </div>
        `
      },
      {
        stepNumber: 2,
        stepTitle: '2. Adım: İşaret Genişletme (CBW ve CWD)',
        htmlContent: `
          <ul>
            <li><code>CBW (Convert Byte to Word):</code> AL içindeki 8-bitlik işaretli sayının işaret bitini (bit 7) AH yazmacına kopyalayarak 16-bit AX yapar (Örn: AL = -5 ise AX = -5 olur).</li>
            <li><code>CWD (Convert Word to Doubleword):</code> AX içindeki 16-bitlik işaretli sayının işaretini DX yazmacına kopyalayarak DX:AX 32-bit çift kelimesi yapar (İşaretli <code>IDIV</code> öncesi zorunludur).</li>
          </ul>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: XLAT ile Şifreleme ve Tablo Çevirisi',
        groupDescription: 'Dallanmasız donanım tablosu erişimi.',
        items: [
          {
            title: 'XLAT ile Rakamı 7-Segment Koduna Çevirme',
            description: '3 rakamını (AL=3) tablodan okuyup 7-segment display desenine dönüştürme.',
            code: `ORG 100H\n; 7-Segment Tablosu (0, 1, 2, 3...):\nMOV BYTE PTR [0200H], 3FH   ; '0'\nMOV BYTE PTR [0201H], 06H   ; '1'\nMOV BYTE PTR [0202H], 5BH   ; '2'\nMOV BYTE PTR [0203H], 4FH   ; '3'\n\nMOV BX, 0200H      ; Tablo baslangici\nMOV AL, 3          ; Aranacak rakam: 3\nXLAT               ; AL = DS:[0200H + 3] = 4FH!\nHLT`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-xlat-1',
        title: 'Soru 1: CBW ve CWD İşaret Genişletme Çıkmışı',
        points: 15,
        difficulty: 'Kolay',
        scenario: 'AL = 0FEH (-2) iken "CBW" komutu çalıştırıldığında AX değeri ne olur? Açıklayınız.',
        codeSnippet: 'MOV AL, 0FEH\nCBW',
        solutionSteps: [
          '0FEH = 1111 1110b. En yüksek anlamlı bit (MSB) 1\'dir (negatif).',
          'CBW komutu işaret bitini AH içine kopyalar: AH = 0FFH.',
          'Sonuç: AX = 0FFFEH (16-bitlik -2 sayısı).'
        ],
        expectedResult: 'AX = 0FFFEH',
        examTips: 'Pozitif bir sayıda (MSB=0) AH 00H olur; negatif sayıda (MSB=1) AH 0FFH olur.'
      }
    ],
    challenges: [
      {
        id: 'ch-xlat-caesar',
        title: 'Alıştırma: XLAT ile Sezar Şifresi Çözme',
        difficulty: 'Orta',
        task: '0200H adresinde bulunan ikame tablosunu kullanarak AL içindeki şifreli baytı (01H) çözüp orijinal haline getiriniz.',
        starterCode: 'ORG 100H\nMOV BYTE PTR [0200H], \'Z\'\nMOV BYTE PTR [0201H], \'A\'\nMOV BYTE PTR [0202H], \'B\'\n\nMOV BX, 0200H\nMOV AL, 1\n; XLAT ile cozumleyin:\n\nHLT',
        solutionCode: 'ORG 100H\nMOV BYTE PTR [0200H], \'Z\'\nMOV BYTE PTR [0201H], \'A\'\nMOV BYTE PTR [0202H], \'B\'\nMOV BX, 0200H\nMOV AL, 1\nXLAT\nHLT'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // KONU 10: KLASİK SINAV SORULARI & ALGORİTMA PRATİKLERİ
  // -------------------------------------------------------------------------
  {
    id: 'algorithms-exam',
    legacyMilestoneId: 'milestone-10',
    number: 10,
    title: 'Klasik Sınav Soruları, Algoritmalar & Kodlama Pratikleri (Vize & Final Standartları)',
    shortTitle: '10. Sınav Algoritmaları',
    icon: '💡',
    badge: 'SINAV & LEETCODE',
    opcodes: ['DİZİ_TOPLAM', 'MAX_MIN', 'REVERSE', 'PALINDROM', 'BUBBLE_SORT', 'FIBONACCI'],
    summary: 'Üniversite vize ve finallerinde en sık sorulan 7 klasik assembly algoritması; adım adım kod çözümleri, tahta izleme şablonları ve doğrudan simülatörde çalıştırılabilir tam programlar.',
    theorySteps: [
      {
        stepNumber: 1,
        stepTitle: '1. Adım: Sınavlarda En Çok Puan Kazandıran 7 Algoritma Kalıbı',
        htmlContent: `
          <p>Mikroişlemciler vize ve final sınavlarındaki kod yazma soruları genellikle şu 7 temel algoritma etrafında döner:</p>
          <ol>
            <li><strong>Dizi Elemanlarının Toplamı ve Ortalaması:</strong> SI ile diziyi gezip AX'te toplama, DIV ile bölme.</li>
            <li><strong>En Büyük (MAX) ve En Küçük (MIN) Elemanı Bulma:</strong> İlk elemanı MAX kabul edip döngüyle CMP ve JG/JL karşılaştırması.</li>
            <li><strong>Diziyi Yerinde Ters Çevirme (In-Place Reverse):</strong> Baştan SI, sondan DI işaretçileriyle elemanları XCHG ile takas etme.</li>
            <li><strong>Palindrom Kontrolü:</strong> Kelimenin baştan ve sondan eşitliğini CMPSB veya CMP ile test etme.</li>
            <li><strong>Bubble Sort (Kabarcık Sıralaması):</strong> İç içe çift döngü ile diziyi küçükten büyüğe sıralama.</li>
            <li><strong>Karakter ve String Dönüşümü:</strong> Küçük harfleri büyük harfe çevirme (<code>AND AL, 0DFH</code>).</li>
            <li><strong>Fibonacci Serisi Üretimi:</strong> İki önceki terimi toplayarak belleğe ardışık yazma.</li>
          </ol>
        `
      }
    ],
    usageGroups: [
      {
        groupTitle: 'Grup 1: Dizi Algoritmaları (Toplam, Ortalama, Min & Max)',
        groupDescription: 'Doğrudan editöre aktarıp çalıştırabileceğiniz tam kodlar.',
        items: [
          {
            title: 'Algoritma 1: Dizideki En Büyük (MAX) Elemanı Bulma',
            description: '5 elemanlı bir dizideki en büyük sayıyı bulup AL yazmacına kaydeder.',
            code: `ORG 100H\n; 5 elemanli dizi:\nMOV BYTE PTR [0200H], 23H\nMOV BYTE PTR [0201H], 87H\nMOV BYTE PTR [0202H], 12H\nMOV BYTE PTR [0203H], 99H\nMOV BYTE PTR [0204H], 45H\n\nMOV SI, 0200H      ; Dizi baslangic adresi\nMOV CX, 4          ; Karsilastirma sayisi = N - 1\nMOV AL, [SI]       ; Ilk elemani MAX kabul et\n\nARA:\nINC SI             ; Sonraki elemana gec\nCMP [SI], AL       ; [SI] > AL mi?\nJBE KUCUK          ; Degilse atla\nMOV AL, [SI]       ; Yeni MAX = [SI]\nKUCUK:\nLOOP ARA\n\n; Sonuc: AL = 99H\nHLT`
          },
          {
            title: 'Algoritma 2: Diziyi Yerinde Ters Çevirme (In-Place Reverse)',
            description: 'SI baştan, DI sondan ilerleyerek bellek elemanlarını takas eder.',
            code: `ORG 100H\n; 4 elemanli dizi:\nMOV BYTE PTR [0200H], 10H\nMOV BYTE PTR [0201H], 20H\nMOV BYTE PTR [0202H], 30H\nMOV BYTE PTR [0203H], 40H\n\nMOV SI, 0200H      ; Baslangic\nMOV DI, 0203H      ; Bitis\n\nTERS_CEVIR:\nMOV AL, [SI]\nXCHG AL, [DI]\nMOV [SI], AL       ; Takas tamamlandi\n\nINC SI\nDEC DI\nCMP SI, DI\nJB TERS_CEVIR\n\n; Dizi simdi: 40H, 30H, 20H, 10H\nHLT`
          }
        ]
      },
      {
        groupTitle: 'Grup 2: Sıralama & Seri Üretimi (Bubble Sort & Fibonacci)',
        groupDescription: 'İç içe döngüler ve sıralama mantığı.',
        items: [
          {
            title: 'Algoritma 3: Fibonacci İlk 6 Terimini Belleğe Yazma',
            description: 'F(0)=0, F(1)=1, F(N)=F(N-1)+F(N-2) serisini belleğe doldurur.',
            code: `ORG 100H\nMOV DI, 0200H      ; Dizi baslangici\nMOV BYTE PTR [DI], 0   ; F(0) = 0\nMOV BYTE PTR [DI+1], 1 ; F(1) = 1\n\nMOV CX, 4          ; 4 terim daha uretilecek\nADD DI, 2\n\nFIBO:\nMOV AL, [DI-1]\nADD AL, [DI-2]     ; AL = onceki iki terimin toplami\nMOV [DI], AL       ; Yaz\nINC DI\nLOOP FIBO\n\n; Bellek: 0, 1, 1, 2, 3, 5\nHLT`
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-algo-1',
        title: 'Soru 1: Dizi Arama Algoritması Analizi',
        points: 20,
        difficulty: 'Zor',
        scenario: 'Bir dizideki negatif sayıların toplamını hesaplayan bir assembly döngüsünde, negatiflik kontrolü hangi bayrak ve dallanma komutu ile yapılmalıdır? Açıklayınız.',
        codeSnippet: 'MOV AL, [SI]\nTEST AL, 80H\n; veya\nCMP AL, 0',
        solutionSteps: [
          'Yöntem 1: TEST AL, 80H (En yüksek bit 1 ise ZF=0 olur; JNZ ile negatif olduğu anlaşılır).',
          'Yöntem 2: CMP AL, 0 ardından JL (Jump if Less - SF≠OF) kullanılır.',
          'Sonuç: İşaretli sayılarda negatiflik kontrolü SF bayrağı veya JL komutu ile yapılır.'
        ],
        expectedResult: 'JL veya JS komutu',
        examTips: 'İşaretsiz JB komutu kullanılmamalıdır; JB negatif sayıları algılayamaz!'
      }
    ],
    challenges: [
      {
        id: 'ch-algo-palindrome',
        title: 'Alıştırma: 4 Karakterlik Palindrom Testi',
        difficulty: 'Zor',
        task: '0200H adresindeki 4 baytlık dizinin (örneğin: \'A\', \'B\', \'B\', \'A\') palindrom olup olmadığını test ediniz. Palindrom ise DX=1, değilse DX=0 yapınız.',
        starterCode: 'ORG 100H\nMOV BYTE PTR [0200H], \'A\'\nMOV BYTE PTR [0201H], \'B\'\nMOV BYTE PTR [0202H], \'B\'\nMOV BYTE PTR [0203H], \'A\'\n\n; Palindrom testi:\nHLT',
        solutionCode: 'ORG 100H\nMOV BYTE PTR [0200H], \'A\'\nMOV BYTE PTR [0201H], \'B\'\nMOV BYTE PTR [0202H], \'B\'\nMOV BYTE PTR [0203H], \'A\'\n\nMOV SI, 0200H\nMOV DI, 0203H\nMOV DX, 1\n\nTEST_LOOP:\nMOV AL, [SI]\nCMP AL, [DI]\nJNE DEGIL\nINC SI\nDEC DI\nCMP SI, DI\nJB TEST_LOOP\nJMP BITIR\n\nDEGIL:\nMOV DX, 0\nBITIR:\nHLT'
      }
    ]
  }
];

export function getTopicById(idOrMilestone: string): TopicItem {
  const found = TOPIC_CURRICULUM.find(
    t => t.id === idOrMilestone || t.legacyMilestoneId === idOrMilestone
  );
  return found || TOPIC_CURRICULUM[0];
}
