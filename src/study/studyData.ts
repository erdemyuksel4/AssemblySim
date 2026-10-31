/**
 * studyData.ts
 * 
 * 8086 Assembly Kapsamlı ve Damıtılmış Müfredat & Zihin Haritası Veri Modeli.
 * Arşivdeki ders notları, slaytlar, vize soruları ve görevlerin sadeleştirilmiş sentezidir.
 */

export interface ConceptQuiz {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyTask {
  id: string;
  title: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  scenario: string;
  taskPrompt: string;
  starterCode: string;
  solutionCode: string;
  hints: string[];
  testSetup?: {
    initialRegisters?: Record<string, number>;
    initialMemory?: Array<{ segment: number; offset: number; bytes: number[] }>;
  };
  assertions: {
    registers?: Record<string, number>;
    flags?: Record<string, number>;
    memory?: Array<{ segment: number; offset: number; expectedBytes: number[] }>;
    maxSteps?: number;
  };
  examTip?: string;
}

export interface SubLesson {
  id: string;
  number: string;
  title: string;
  summary: string;
  theoryHtml: string;
  quiz?: ConceptQuiz;
  task?: StudyTask;
}

export interface MainTopic {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  badge: string;
  icon: string;
  summary: string;
  opcodes: string[];
  mindMap: {
    x: number;
    y: number;
    connections: string[];
  };
  subLessons: SubLesson[];
}

export const STUDY_TOPICS: MainTopic[] = [
  // =========================================================================
  // 1. 8086 MİMARİSİ VE 20-BİT BELLEK SEGMENTASYONU
  // =========================================================================
  {
    id: 'topic-1-architecture',
    number: 1,
    title: '8086 İşlemci Mimarisi & 20-Bit Bellek Segmentasyonu',
    shortTitle: '1. Mimari & 20-Bit Bellek',
    badge: 'MİMARİ TEMEL',
    icon: '🏛️',
    summary: 'BIU & EU birimleri işbölümü, 14 adet 16-bit yazmaç, 20-bit Fiziksel Adres Formülü (PA = Segment × 16 + Offset) ve Little-Endian prensibi.',
    opcodes: ['CS', 'DS', 'SS', 'ES', 'IP', 'AX', 'BX', 'CX', 'DX', 'SP', 'BP', 'SI', 'DI', 'FLAGS'],
    mindMap: {
      x: 15,
      y: 20,
      connections: ['topic-2-addressing']
    },
    subLessons: [
      {
        id: 'sub-1-biu-eu',
        number: '1.1',
        title: 'BIU ve EU Donanım Birimleri İşbölümü',
        summary: 'Komut Ön Getirme Kuyruğu (Prefetch Queue) ve Pipelining mimarisinin temelleri.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">BIU (Bus Interface Unit) vs. EU (Execution Unit)</h4>
            <p>8086 mikroişlemcisi, iki bağımsız donanım birimine ayrılarak ilk modern boru hattı (pipelining) mantığını kurmuştur:</p>
            <div class="nb-grid-2">
              <div class="nb-card biu-card">
                <h5>🚌 BIU (Veriyolu Arayüz Birimi)</h5>
                <ul>
                  <li>Dış dünya ve sistem veriyolları ile konuşan <strong>tek</strong> birimdir.</li>
                  <li>Bellekten komutları getirip <strong>6-baytlık Prefetch Queue (FIFO)</strong> kuyruğuna koyar.</li>
                  <li>Segment yazmaçlarını (<code>CS, DS, SS, ES</code>) ve <code>IP</code> yazmacını barındırır.</li>
                  <li>20-bitlik fiziksel adresi hesaplayıp adres veriyoluna sürer.</li>
                </ul>
              </div>
              <div class="nb-card eu-card">
                <h5>⚙️ EU (Yürütme Birimi)</h5>
                <ul>
                  <li>Dış veriyollarına doğrudan dokunmaz; kuyruktan gelen komutları yürütür.</li>
                  <li><strong>ALU (16-bit):</strong> Tüm aritmetik ve mantıksal hesaplamaları yapar.</li>
                  <li>Genel yazmaçları (<code>AX, BX, CX, DX</code>) ve işaretçileri (<code>SP, BP, SI, DI</code>) yönetir.</li>
                  <li>Durum ve kontrol bayraklarını (<code>FLAGS</code>) günceller.</li>
                </ul>
              </div>
            </div>
            <div class="nb-callout tip">
              💡 <strong>Pipelining:</strong> EU bir komutu çözer veya çalıştırırken, BIU boş beklemez; sıradaki komutları getirip 6-baytlık kuyruğa doldurur.
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-1-1',
          question: '8086 mimarisinde 20-bit fiziksel adres hesaplama ve bellekten komut getirme işlemlerini hangi donanım birimi yürütür?',
          options: [
            'EU (Execution Unit)',
            'BIU (Bus Interface Unit)',
            'ALU (Aritmetik Mantık Birimi)',
            'Flags Register'
          ],
          correctIndex: 1,
          explanation: 'BIU (Bus Interface Unit), segment yazmaçlarını kullanarak fiziksel adresi hesaplayan ve sistem veriyollarından komut getiren birimdir.'
        },
        task: {
          id: 'task-1-regs-init',
          title: 'Genel Amaçlı Yazmaçları Hazırlama',
          difficulty: 'Kolay',
          scenario: 'İşlemcinin veri yazmaçlarını (AX, BX, CX, DX) başlangıç değerleriyle doldurmamız isteniyor.',
          taskPrompt: 'AX yazmacına 1234H, BX yazmacına 5678H, CX yazmacına 0010H yükleyin ve programı HLT ile sonlandırın.',
          starterCode: `; 1.1 Genel Yazmaçları Başlatma
ORG 100h

; AX'e 1234h, BX'e 5678h, CX'e 10h yükleyin:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 1234h
MOV BX, 5678h
MOV CX, 0010h
HLT
`,
          hints: ['MOV hedef, kaynak komutunu kullanın.', 'Hex değerlerin sonuna "h" harfi koymayı unutmayın.'],
          assertions: {
            registers: { ax: 0x1234, bx: 0x5678, cx: 0x0010 },
            maxSteps: 50
          },
          examTip: 'AX, BX, CX, DX 16-bittir ve yüksek/düşük 8-bitlik parçalarına (AH/AL, BH/BL vb.) bağımsız erişilebilir.'
        }
      },
      {
        id: 'sub-1-physical-addr',
        number: '1.2',
        title: '20-Bit Fiziksel Adres Formülü & Little-Endian',
        summary: 'Segment × 16 + Offset formülü, 1 MB bellek haritası ve düşük baytın önce saklanması.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">20-Bit Fiziksel Adres Formülü</h4>
            <p>8086 yazmaçları 16-bit olmasına rağmen adres veriyolu 20-bit (1 MB) genişliğindedir. Bu adres şu formülle üretilir:</p>
            <div class="nb-formula-box">
              <code>Fiziksel Adres (PA) = (Segment × 10H) + Offset = (Segment × 16) + Offset</code>
            </div>
            <p>Örneğin: <code>DS = 1230H</code> ve <code>SI = 0045H</code> ise:</p>
            <pre class="nb-code-sample">Segment:  12300H   (Segment 1 hex basamağı sola kaydırıldı)
Offset:  + 0045H
PA:        12345H   (20-Bit Fiziksel Bellek Adresi)</pre>

            <h4 class="nb-title" style="margin-top: 14px;">Little-Endian Prensibi</h4>
            <p>8086 mimarisinde çok baytlı (16-bit Word) bir veri belleğe yazılırken:</p>
            <ul>
              <li><strong>Düşük Anlamlı Bayt (Low Byte):</strong> Düşük adrese yazılır.</li>
              <li><strong>Yüksek Anlamlı Bayt (High Byte):</strong> Yüksek adrese (+1) yazılır.</li>
            </ul>
            <div class="nb-callout warning">
              ⚠️ <code>MOV WORD PTR [0100H], 1234H</code> komutu çalıştırıldığında bellekte <code>0100H: 34H</code> ve <code>0101H: 12H</code> olarak saklanır!
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-1-2',
          question: 'DS = 2000H ve BX = 0150H olduğunda işlemcinin okuyacağı 20-bitlik fiziksel adres nedir?',
          options: [
            '20150H',
            '21500H',
            '20050H',
            '02150H'
          ],
          correctIndex: 0,
          explanation: 'Fiziksel Adres = (2000H × 10H) + 0150H = 20000H + 0150H = 20150H.'
        },
        task: {
          id: 'task-1-little-endian',
          title: 'Little-Endian Prensibi ile Belleğe Yazma',
          difficulty: 'Kolay',
          scenario: 'Belleğin [0200h] adresine 16-bitlik 4A8Fh değerini yazarak Little-Endian sıralamasını test edin.',
          taskPrompt: 'AX yazmacına 4A8Fh yükleyin ve bu 16-bitlik veriyi [0200h] adresine aktarın. HLT ile bitirin.',
          starterCode: `; 1.2 Little-Endian Bellek Yazımı
ORG 100h

; AX'e 4A8Fh yükleyin, ardından [0200h]'e yazın:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 4A8Fh
MOV [0200h], AX
HLT
`,
          hints: ['MOV [0200h], AX komutunu kullanın.'],
          assertions: {
            registers: { ax: 0x4A8F },
            memory: [
              { segment: 0x0000, offset: 0x0200, expectedBytes: [0x8F, 0x4A] }
            ],
            maxSteps: 50
          },
          examTip: 'Sınavlarda 0200h adresindeki bayt sorulduğunda 8Fh, 0201h adresindeki bayt sorulduğunda 4Ah cevabı verilmelidir.'
        }
      }
    ]
  },

  // =========================================================================
  // 2. VERİ AKTARIMI VE 7 ADRESLEME MODU
  // =========================================================================
  {
    id: 'topic-2-addressing',
    number: 2,
    title: 'Veri Aktarımı & 7 Adresleme Modu (MOV, XCHG, LEA)',
    shortTitle: '2. Adresleme Modları & MOV',
    badge: 'TEMEL KOMUTLAR',
    icon: '📦',
    summary: 'MOV ve XCHG komut kuralları, bellek-bellek kısıtlaması, LEA ile ofset yükleme ve 7 bellek adresleme modu.',
    opcodes: ['MOV', 'XCHG', 'LEA', 'OFFSET'],
    mindMap: {
      x: 35,
      y: 20,
      connections: ['topic-3-arithmetic']
    },
    subLessons: [
      {
        id: 'sub-2-mov-rules',
        number: '2.1',
        title: 'MOV ve XCHG Komutlarının Kesin Kuralları',
        summary: 'Hedef/kaynak boyut uyumu, CS yazmacına yazma yasağı ve bayrak etkileşimi.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">MOV Komutunun 4 Altın Kuralı</h4>
            <ul>
              <li><strong>1. Boyut Uyumu:</strong> Her iki operand aynı boyutta olmalıdır (8-bit ile 8-bit, 16-bit ile 16-bit). <code>MOV AL, BX ; HATA!</code></li>
              <li><strong>2. Bellekten Belleğe Yasaktır:</strong> Tek bir MOV komutu ile doğrudan RAM'den RAM'e kopyalama yapılamaz. <code>MOV [0100h], [0200h] ; HATA!</code> (Araya yazmaç girmelidir).</li>
              <li><strong>3. Segment Yazmaçlarına Doğrudan Sabit Atanamaz:</strong> <code>MOV DS, 1000h ; HATA!</code> (Önce AX'e, oradan DS'ye aktarılır).</li>
              <li><strong>4. CS Değiştirilemez & Bayraklar Etkilenmez:</strong> MOV ve XCHG hiçbir bayrağı (CF, ZF vb.) DEĞİŞTİRMEZ!</li>
            </ul>
            <h4 class="nb-title" style="margin-top: 14px;">XCHG (Exchange - Değer Takası)</h4>
            <p>İki operandın değerini birbirleriyle yer değiştirir. Segment yazmaçları veya iki bellek adresiyle kullanılamaz.</p>
          </div>
        `,
        quiz: {
          id: 'quiz-2-1',
          question: 'Aşağıdaki 8086 Assembly komutlarından hangisi sentaktik olarak GEÇERLİDİR?',
          options: [
            'MOV [0100h], [0200h]',
            'MOV DS, 2000h',
            'MOV AX, [0100h]',
            'MOV CS, AX'
          ],
          correctIndex: 2,
          explanation: 'Bellekten yazmaca (MOV AX, [0100h]) geçerlidir. RAM-RAM aktarımı, DS\'ye doğrudan sabit yükleme ve CS\'ye doğrudan yazma donanımsal olarak yasaktır.'
        },
        task: {
          id: 'task-2-xchg-swap',
          title: 'XCHG ile Bellek ve Yazmaç Takası',
          difficulty: 'Kolay',
          scenario: 'AX yazmacındaki değeri [0200h] adresindeki veri ile takas etmeniz gerekiyor.',
          taskPrompt: 'AX\'e 1111h yükleyin, [0200h] adresine 9999h yazın. Ardından XCHG ile AX ile [0200h]\'ı takas edin. HLT ile bitirin.',
          starterCode: `; 2.1 XCHG ile Takas
ORG 100h

; AX'e 1111h yükleyin:
; [0200h] adresine 9999h yazın:
; XCHG ile takas edin:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 1111h
MOV WORD PTR [0200h], 9999h
XCHG AX, [0200h]
HLT
`,
          hints: ['XCHG AX, [0200h] komutu iki tarafı yer değiştirir.'],
          assertions: {
            registers: { ax: 0x9999 },
            memory: [
              { segment: 0x0000, offset: 0x0200, expectedBytes: [0x11, 0x11] }
            ],
            maxSteps: 50
          },
          examTip: 'XCHG komutu geçici bir yazmaca ihtiyaç duymadan atomik takas sağlar.'
        }
      },
      {
        id: 'sub-2-addressing-modes',
        number: '2.2',
        title: '7 Adresleme Modu & LEA Komutu',
        summary: 'Doğrudan, yazmaç, taban, indeksli, taban-indeksli adresleme ve LEA ofset hesaplama.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">8086'nın 7 Bellek Adresleme Modu</h4>
            <div class="nb-table-wrap">
              <table class="nb-table">
                <thead>
                  <tr><th>Adresleme Modu</th><th>Örnek Komut</th><th>Açıklama</th></tr>
                </thead>
                <tbody>
                  <tr><td>1. İvedi (Immediate)</td><td><code>MOV AX, 1234H</code></td><td>Sabit değer doğrudan komuttadır.</td></tr>
                  <tr><td>2. Yazmaç (Register)</td><td><code>MOV AX, BX</code></td><td>Yazmaçtan yazmaca kopyalama.</td></tr>
                  <tr><td>3. Doğrudan (Direct)</td><td><code>MOV AX, [0100H]</code></td><td>Sabit bellek adresinden okuma.</td></tr>
                  <tr><td>4. Tabanlı (Based)</td><td><code>MOV AX, [BX]</code> veya <code>[BP]</code></td><td>BX veya BP içindeki adresi ofset alır.</td></tr>
                  <tr><td>5. İndeksli (Indexed)</td><td><code>MOV AX, [SI]</code> veya <code>[DI]</code></td><td>SI veya DI içindeki ofseti kullanır.</td></tr>
                  <tr><td>6. Taban-İndeksli</td><td><code>MOV AX, [BX+SI]</code></td><td>BX ve SI toplanarak ofset bulunur.</td></tr>
                  <tr><td>7. Deplasmanlı</td><td><code>MOV AX, [BX+DI+4]</code></td><td>Taban, indeks ve sabit ofset toplanır.</td></tr>
                </tbody>
              </table>
            </div>
            <div class="nb-callout tip">
              💡 <strong>LEA (Load Effective Address):</strong> Bellekten veri çekmez, sadece parantez içindeki ofset adresini hesaplayıp yazmaca yükler! <code>LEA BX, [SI+4]</code> komutu <code>BX = SI + 4</code> yapar.
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-2-2',
          question: 'BX = 0100H ve SI = 0020H iken "LEA AX, [BX+SI+5]" komutu çalışırsa AX ne olur?',
          options: [
            '0125H',
            '0120H',
            'Bellekteki 0125H adresinin içeriği',
            'Hata verir'
          ],
          correctIndex: 0,
          explanation: 'LEA belleği okumaz; sadece adresi (0100H + 0020H + 5 = 0125H) hesaplayıp doğrudan AX\'e yazar.'
        },
        task: {
          id: 'task-2-lea-pointer',
          title: 'LEA ile Ofset Hesaplama ve Bellek Okuma',
          difficulty: 'Kolay',
          scenario: 'Dizi elemanına taban ve indeks adresleme ile erişip değeri AX yazmacına okuyun.',
          taskPrompt: 'BX = 0200h, SI = 0004h yapın. [0204h] adresine 77h yazın. [BX+SI] adresleme modu ile bu baytı AL yazmacına okuyun. HLT ile bitirin.',
          starterCode: `; 2.2 Taban + İndeks Adresleme
ORG 100h

; BX = 0200h, SI = 0004h yapın:
; [0204h] adresine 77h baytını yazın:
; MOV AL, [BX+SI] ile okuyun:


HLT
`,
          solutionCode: `ORG 100h
MOV BX, 0200h
MOV SI, 0004h
MOV BYTE PTR [0204h], 77h
MOV AL, [BX+SI]
HLT
`,
          hints: ['MOV AL, [BX+SI] komutu doğrudan BX+SI adresindeki baytı okur.'],
          assertions: {
            registers: { al: 0x77, bx: 0x0200, si: 0x0004 },
            maxSteps: 50
          },
          examTip: 'Köşeli parantez içinde sadece BX, BP, SI ve DI yazmaçları kullanılabilir. [AX] veya [CX] kesinlikle YASAKTIR!'
        }
      }
    ]
  },

  // =========================================================================
  // 3. ARİTMETİK İŞLEMLER VE BAYRAK MEKANİĞİ
  // =========================================================================
  {
    id: 'topic-3-arithmetic',
    number: 3,
    title: 'Aritmetik İşlemler & Bayrak Mekaniği (ADD, SUB, CMP, MUL, DIV)',
    shortTitle: '3. Aritmetik & Bayraklar',
    badge: 'HESAPLAMA & MANTIK',
    icon: '➕',
    summary: 'CF, ZF, SF, OF, AF, PF bayraklarının davranışları, INC/DEC istisnası, CMP mantığı, çarpma ve bölme mekanizması.',
    opcodes: ['ADD', 'ADC', 'SUB', 'SBB', 'INC', 'DEC', 'CMP', 'MUL', 'DIV'],
    mindMap: {
      x: 55,
      y: 20,
      connections: ['topic-4-logic']
    },
    subLessons: [
      {
        id: 'sub-3-flags-rules',
        number: '3.1',
        title: 'Durum Bayrakları ve INC/DEC İstisnası',
        summary: 'Elde (CF), Sıfır (ZF), İşaret (SF), Taşma (OF) bayrakları ve INC/DEC kuralı.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Durum Bayrakları Tablosu</h4>
            <ul>
              <li><strong>CF (Carry Flag - Elde Bayrağı):</strong> İşaretsiz taşma/elde oluştuğunda 1 olur.</li>
              <li><strong>ZF (Zero Flag - Sıfır Bayrağı):</strong> İşlem sonucu 0 olduğunda 1 olur.</li>
              <li><strong>SF (Sign Flag - İşaret Bayrağı):</strong> Sonucun en yüksek biti 1 (negatif) ise 1 olur.</li>
              <li><strong>OF (Overflow Flag - Taşma Bayrağı):</strong> İşaretli aritmetikte taşma (pozitif+pozitif=negatif) olduğunda 1 olur.</li>
            </ul>
            <div class="nb-callout warning">
              🚨 <strong>Çok Önemli Sınav Kuralı (INC & DEC İstisnası):</strong><br>
              <code>INC</code> ve <code>DEC</code> komutları ZF, SF, OF, AF, PF bayraklarını günceller; fakat <strong>CF (Elde Bayrağı) ASLA DEĞİŞMEZ!</strong><br>
              Örneğin <code>AL = 0FFH</code> iken <code>INC AL</code> yapılırsa <code>AL = 00H</code> ve <code>ZF = 1</code> olur ama <code>CF = 0</code> kalır!
            </div>
            <h4 class="nb-title" style="margin-top: 14px;">CMP (Compare) Komutu</h4>
            <p><code>CMP hedef, kaynak</code> komutu arka planda <code>hedef - kaynak</code> çıkarmasını yapar. Hedefin değerini <strong>asla bozmaz</strong>, sadece bayrakları kurar.</p>
          </div>
        `,
        quiz: {
          id: 'quiz-3-1',
          question: 'AL = 0FFH iken "INC AL" komutu yürütülürse CF ve ZF bayraklarının durumu ne olur?',
          options: [
            'CF = 1, ZF = 1',
            'CF = 0, ZF = 1 (INC elde bayrağını etkilemez)',
            'CF = 1, ZF = 0',
            'CF = 0, ZF = 0'
          ],
          correctIndex: 1,
          explanation: 'INC komutu hiçbir zaman CF bayrağını değiştirmez (CF eski değerini korur). Sonuç 00H olduğu için ZF = 1 olur.'
        },
        task: {
          id: 'task-3-cmp-flags',
          title: 'CMP ile Bayrak Kurulumu',
          difficulty: 'Kolay',
          scenario: 'İki değeri CMP ile karşılaştırarak ZF ve CF bayraklarını gözlemleyin.',
          taskPrompt: 'AL = 50h yapın, ardından BL = 50h yapın. CMP AL, BL çalıştırın. Böylece ZF=1 olsun. HLT ile bitirin.',
          starterCode: `; 3.1 CMP ile Karşılaştırma
ORG 100h

; AL = 50h ve BL = 50h yükleyin:
; CMP AL, BL çalıştırın:


HLT
`,
          solutionCode: `ORG 100h
MOV AL, 50h
MOV BL, 50h
CMP AL, BL
HLT
`,
          hints: ['CMP AL, BL komutunu yazın.'],
          assertions: {
            registers: { al: 0x50, bl: 0x50 },
            flags: { zf: 1, cf: 0 },
            maxSteps: 50
          },
          examTip: 'Eğer hedef = kaynak ise CMP sonucu ZF=1 ve CF=0 olur. Hedef < kaynak ise işaretsiz karşılaştırmada CF=1 olur.'
        }
      },
      {
        id: 'sub-3-mul-div',
        number: '3.2',
        title: 'Çarpma (MUL) ve Bölme (DIV) Mekanizması',
        summary: 'Gizli yazmaçlar AX ve DX kullanımı, bölüm ve kalan sonuçları.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">MUL ve DIV Gizli Yazmaç Donanımı</h4>
            <p>Çarpma ve bölmede ikinci operand komutta yazılmaz, donanımsal olarak sabittir:</p>
            <div class="nb-grid-2">
              <div class="nb-card">
                <h5>✖️ MUL (İşaretsiz Çarpma)</h5>
                <ul>
                  <li><strong>8-bit:</strong> <code>MUL BL</code> &rarr; <code>AX = AL × BL</code></li>
                  <li><strong>16-bit:</strong> <code>MUL BX</code> &rarr; <code>DX:AX = AX × BX</code> (Yüksek 16-bit DX'e, düşük 16-bit AX'e düşer).</li>
                </ul>
              </div>
              <div class="nb-card">
                <h5>➗ DIV (İşaretsiz Bölme)</h5>
                <ul>
                  <li><strong>8-bit:</strong> <code>DIV BL</code> &rarr; <code>AX / BL</code> &rarr; Bölüm <code>AL</code>, Kalan <code>AH</code></li>
                  <li><strong>16-bit:</strong> <code>DIV BX</code> &rarr; <code>DX:AX / BX</code> &rarr; Bölüm <code>AX</code>, Kalan <code>DX</code></li>
                </ul>
              </div>
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-3-2',
          question: 'AX = 0019H (ondalık 25) iken BL = 04H atanıp "DIV BL" çalıştırılırsa AL (bölüm) ve AH (kalan) ne olur?',
          options: [
            'AL = 06H, AH = 01H',
            'AL = 01H, AH = 06H',
            'AL = 04H, AH = 01H',
            'AL = 25H, AH = 00H'
          ],
          correctIndex: 0,
          explanation: '25 / 4 = 6 bölüm (AL = 06H), 1 kalan (AH = 01H).'
        },
        task: {
          id: 'task-3-div-operation',
          title: 'DIV ile Bölüm ve Kalanı Hesaplama',
          difficulty: 'Orta',
          scenario: '100 sayısını 7\'ye bölüp bölümü AL\'de, kalanı AH\'de elde edin.',
          taskPrompt: 'AX\'e 100 (ondalık 100 veya 64h), BL\'ye 7 yükleyin. DIV BL çalıştırın ve HLT ile sonlandırın.',
          starterCode: `; 3.2 8-Bit DIV İşlemi
ORG 100h

; AX = 100 ve BL = 7 yükleyin:
; DIV BL çalıştırın:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 100
MOV BL, 7
DIV BL
HLT
`,
          hints: ['MOV AX, 100 ve MOV BL, 7 ardından DIV BL yazın.'],
          assertions: {
            registers: { al: 14, ah: 2 },
            maxSteps: 50
          },
          examTip: '100 / 7 = 14 (AL = 0Eh), Kalan = 2 (AH = 02h).'
        }
      }
    ]
  },

  // =========================================================================
  // 4. MANTIKSAL İŞLEMLER VE BİT KAYDIRMA
  // =========================================================================
  {
    id: 'topic-4-logic',
    number: 4,
    title: 'Mantıksal İşlemler, Maskeleme & Bit Kaydırma',
    shortTitle: '4. Mantık & Bit Kaydırma',
    badge: 'BİT MANİPÜLASYONU',
    icon: '🔀',
    summary: 'AND ile maskeleme, OR ile bit kurma, XOR ile sıfırlama, TEST komutu ve SHL/SHR/ROL/ROR kaydırmaları.',
    opcodes: ['AND', 'OR', 'XOR', 'NOT', 'TEST', 'SHL', 'SHR', 'SAR', 'ROL', 'ROR'],
    mindMap: {
      x: 75,
      y: 20,
      connections: ['topic-5-control-flow']
    },
    subLessons: [
      {
        id: 'sub-4-bitwise-mask',
        number: '4.1',
        title: 'Mantıksal Kapılar & Maskeleme (AND, OR, XOR, TEST)',
        summary: 'AND ile bit temizleme, OR ile bit 1 yapma, XOR AX, AX optimizasyonu ve TEST komutu.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Bit Düzeyinde Mantık İşlemleri</h4>
            <ul>
              <li><code>AND</code>: Belirli bitleri sıfırlamak (maskelemek) için kullanılır. <code>AND AL, 0FH</code> alt 4 biti korur, üst 4 biti sıfırlar.</li>
              <li><code>OR</code>: Belirli bitleri 1 yapmak için kullanılır. <code>OR AL, 20H</code> 5. biti 1 yapar.</li>
              <li><code>XOR</code>: Kendisiyle XOR'lanan yazmaç sıfırlanır: <code>XOR AX, AX</code> komutu <code>MOV AX, 0</code>'dan daha kısa makine kodu üretir ve daha hızlıdır!</li>
              <li><code>TEST</code>: AND işlemi yapar ancak <strong>hedefin değerini değiştirmez</strong>; sadece bayrakları (özellikle ZF) kurar.</li>
            </ul>
          </div>
        `,
        quiz: {
          id: 'quiz-4-1',
          question: 'Bir yazmaçtaki sayının tek mi çift mi olduğunu sayının değerini bozmadan anlamak için hangi komut kullanılmalıdır?',
          options: [
            'TEST reg, 1',
            'AND reg, 0',
            'OR reg, 1',
            'XOR reg, reg'
          ],
          correctIndex: 0,
          explanation: 'TEST reg, 1 komutu en düşük biti test eder; sayı çiftse sonuç 0 olup ZF=1 kurulur ve yazmaç değeri korunur.'
        },
        task: {
          id: 'task-4-xor-zero',
          title: 'XOR ile Yazmaç Sıfırlama ve ZF Bayrağı',
          difficulty: 'Kolay',
          scenario: 'AX yazmacını en verimli şekilde sıfırlayın ve ZF bayrağının 1 olduğunu doğrulayın.',
          taskPrompt: 'AX\'e FFFFh yükleyin, ardından XOR AX, AX ile sıfırlayın. HLT ile bitirin.',
          starterCode: `; 4.1 XOR ile Sıfırlama
ORG 100h

MOV AX, 0FFFFh
; AX'i XOR ile sıfırlayın:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 0FFFFh
XOR AX, AX
HLT
`,
          hints: ['XOR AX, AX komutu AX\'i 0000h yapar ve ZF=1 kurar.'],
          assertions: {
            registers: { ax: 0 },
            flags: { zf: 1 },
            maxSteps: 50
          },
          examTip: 'Sınavlarda "Yazmacı sıfırlayan ve bayrakları etkileyen komut" sorulduğunda cevap XOR reg, reg\'dir (MOV bayrakları etkilemez).'
        }
      },
      {
        id: 'sub-4-shifts-rotates',
        number: '4.2',
        title: 'Bit Kaydırma ve Döndürme (SHL, SHR, SAR, ROL)',
        summary: '2 ile çarpma/bölme, CL sayacı kuralı ve Carry bayrağına düşen bit.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Bit Kaydırma ve CL Sayacı Kuralı</h4>
            <p>1 bitten fazla kaydırma yapılacaksa kaydırma miktarı <strong>CL yazmacında</strong> tutulmalıdır:</p>
            <pre class="nb-code-sample">MOV CL, 3
SHL AX, CL   ; AX'i 3 bit sola kaydır (2^3 = 8 ile çarp)</pre>
            <ul>
              <li><code>SHL / SAL</code>: Sola mantıksal kaydırır, sağdan 0 girer. Son çıkan bit CF'ye düşer.</li>
              <li><code>SHR</code>: Sağa mantıksal kaydırır, soldan 0 girer (işaretsiz 2'ye bölme).</li>
              <li><code>SAR</code>: Aritmetik sağa kaydırır; soldan <strong>işaret biti</strong> korunarak girer (negatif sayılar için bölme).</li>
            </ul>
          </div>
        `,
        quiz: {
          id: 'quiz-4-2',
          question: '8086 mimarisinde bir yazmacı 4 bit sağa kaydırmak için kaydırma adedi nerede belirtilmelidir?',
          options: [
            'CL yazmacında',
            'CH yazmacında',
            'BL yazmacında',
            'Doğrudan komutta 4 yazılamaz, sadece CL kullanılır'
          ],
          correctIndex: 0,
          explanation: '8086 standart ISA kuralına göre 1\'den büyük kaydırma adedi mutlaka CL yazmacında verilmelidir.'
        },
        task: {
          id: 'task-4-shl-multiply',
          title: 'SHL ile 4 ile Çarpma (2 Bit Sola Kaydır)',
          difficulty: 'Kolay',
          scenario: 'AL yazmacındaki 5 değerini SHL kullanarak 4 ile çarpın (sonuç 20 olmalıdır).',
          taskPrompt: 'AL = 5 yapın. CL = 2 yapın. SHL AL, CL çalıştırın. HLT ile bitirin.',
          starterCode: `; 4.2 SHL ile Hızlı Çarpma
ORG 100h

; AL = 5 ve CL = 2 yükleyin:
; SHL AL, CL çalıştırın:


HLT
`,
          solutionCode: `ORG 100h
MOV AL, 5
MOV CL, 2
SHL AL, CL
HLT
`,
          hints: ['MOV CL, 2 ardından SHL AL, CL yazın.'],
          assertions: {
            registers: { al: 20 },
            maxSteps: 50
          },
          examTip: 'SHL n bit kaydırma = 2^n ile çarpma. SHR n bit kaydırma = 2^n ile bölme anlamına gelir.'
        }
      }
    ]
  },

  // =========================================================================
  // 5. PROGRAM AKIŞ KONTROLÜ, ATLAMA VE DÖNGÜLER
  // =========================================================================
  {
    id: 'topic-5-control-flow',
    number: 5,
    title: 'Program Akış Kontrolü, Koşullu Atlamalar & Döngüler',
    shortTitle: '5. Akış & Döngüler',
    badge: 'KONTROL AKIŞI',
    icon: '🔄',
    summary: 'Koşulsuz JMP, JZ/JNZ, JC/JNC, JA/JB, JG/JL koşullu atlamaları ve LOOP sayacı (CX).',
    opcodes: ['JMP', 'JZ', 'JNZ', 'JC', 'JNC', 'JA', 'JB', 'JG', 'JL', 'LOOP', 'LOOPZ', 'LOOPNZ'],
    mindMap: {
      x: 75,
      y: 50,
      connections: ['topic-6-stack-procedures']
    },
    subLessons: [
      {
        id: 'sub-5-conditional-jumps',
        number: '5.1',
        title: 'Koşullu Atlamalar (JZ, JNZ, JC, JA/JB, JG/JL)',
        summary: 'İşaretsiz (Above/Below) ve işaretli (Greater/Less) atlama ayrımları.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Sınav Klasiği: İşaretli vs. İşaretsiz Atlamalar</h4>
            <div class="nb-grid-2">
              <div class="nb-card">
                <h5>İşaretsiz (Unsigned)</h5>
                <ul>
                  <li><code>JA (Jump if Above)</code>: Büyükseniz atla (CF=0 ve ZF=0)</li>
                  <li><code>JB (Jump if Below)</code>: Küçükseniz atla (CF=1)</li>
                  <li><code>JAE / JBE</code>: Büyük-eşit / Küçük-eşit</li>
                </ul>
              </div>
              <div class="nb-card">
                <h5>İşaretli (Signed)</h5>
                <ul>
                  <li><code>JG (Jump if Greater)</code>: Büyükseniz atla (ZF=0 ve SF=OF)</li>
                  <li><code>JL (Jump if Less)</code>: Küçükseniz atla (SF ≠ OF)</li>
                  <li><code>JGE / JLE</code>: Büyük-eşit / Küçük-eşit</li>
                </ul>
              </div>
            </div>
            <div class="nb-callout tip">
              💡 <code>JZ / JE</code>: Sonuç sıfır ise (ZF=1) atla.<br>
              <code>JNZ / JNE</code>: Sonuç sıfır değil ise (ZF=0) atla.
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-5-1',
          question: 'İşaretsiz iki sayıyı karşılaştırdıktan sonra "sayı küçükse" atlamak için hangi komut tercih edilmelidir?',
          options: [
            'JB (Jump if Below)',
            'JL (Jump if Less)',
            'JS (Jump if Sign)',
            'JPO (Jump if Parity Odd)'
          ],
          correctIndex: 0,
          explanation: 'İşaretsiz sayılarda Above/Below (JA/JB), işaretli sayılarda Greater/Less (JG/JL) kullanılır.'
        },
        task: {
          id: 'task-5-max-two',
          title: 'Koşullu Atlama ile İki Sayının Büyüğünü Bulma',
          difficulty: 'Orta',
          scenario: 'AL ve BL içindeki değerlerden büyük olanını seçip AX\'e aktarın.',
          taskPrompt: 'AL = 40h, BL = 75h veriliyor. Karşılaştırıp büyük olanı AL\'de bırakın ve HLT ile bitirin.',
          starterCode: `; 5.1 İki Sayının Büyüğünü Bulma
ORG 100h

MOV AL, 40h
MOV BL, 75h

CMP AL, BL
JAE AL_BUYUK
MOV AL, BL

AL_BUYUK:
HLT
`,
          solutionCode: `ORG 100h
MOV AL, 40h
MOV BL, 75h
CMP AL, BL
JAE AL_BUYUK
MOV AL, BL
AL_BUYUK:
HLT
`,
          hints: ['JAE AL_BUYUK ile AL büyük-eşitse atlama yapın.'],
          assertions: {
            registers: { al: 0x75 },
            maxSteps: 50
          },
          examTip: 'CMP komutunun ardından koşullu atlama yaparak if-else yapısı kurulur.'
        }
      },
      {
        id: 'sub-5-loop-instruction',
        number: '5.2',
        title: 'LOOP Komutu ve Sayaç Mantığı (CX)',
        summary: 'CX yazmacının otomatik bir azaltılması ve sıfır olana kadar geriye atlama.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">LOOP Komutu Nasıl Çalışır?</h4>
            <p><code>LOOP etiket</code> komutu donanımsal olarak şu iki adımı otomatik icra eder:</p>
            <ol>
              <li><code>CX = CX - 1</code> yapar (Dikkat: Bayrakları DEĞİŞTİRMEZ!).</li>
              <li>Eğer <code>CX ≠ 0</code> ise belirtilen etikete atlar. CX = 0 olunca döngüden çıkar.</li>
            </ol>
            <div class="nb-callout warning">
              🚨 <strong>Tuzak:</strong> Eğer döngüye girmeden önce <code>CX = 0</code> ise, LOOP komutu CX'i bir azaltıp <code>FFFFH (65535)</code> yapar ve döngü 65535 kez döner! Bu yüzden döngü öncesinde <code>JCXZ</code> ile kontrol edilmelidir.
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-5-2',
          question: 'LOOP komutu çalıştırıldığında hangi yazmaç otomatik olarak 1 azaltılır ve bayraklar nasıl etkilenir?',
          options: [
            'CX azaltılır, bayraklar ETKİLENMEZ',
            'CX azaltılır, ZF güncellenir',
            'AX azaltılır, CF güncellenir',
            'SI azaltılır, bayraklar etkilenmez'
          ],
          correctIndex: 0,
          explanation: 'LOOP donanımsal olarak CX = CX - 1 yapar fakat hiçbir bayrağı (ZF dahil) güncellemez.'
        },
        task: {
          id: 'task-5-loop-sum',
          title: 'LOOP ile 1\'den 5\'e Kadar Sayıları Toplama',
          difficulty: 'Orta',
          scenario: 'CX sayacını kullanarak 1 + 2 + 3 + 4 + 5 toplamını AX yazmacında hesaplayın (Sonuç: 15 / 0Fh).',
          taskPrompt: 'AX = 0, CX = 5 yapın. Döngüde her adımda AX\'e CX\'i ekleyin ve LOOP ile dönün. HLT ile bitirin.',
          starterCode: `; 5.2 LOOP ile Toplam
ORG 100h

XOR AX, AX
MOV CX, 5

TOPLA_DONGU:
  ; AX'e CX'i ekleyin:
  
  LOOP TOPLA_DONGU

HLT
`,
          solutionCode: `ORG 100h
XOR AX, AX
MOV CX, 5

TOPLA_DONGU:
  ADD AX, CX
  LOOP TOPLA_DONGU

HLT
`,
          hints: ['Döngü içinde ADD AX, CX yazın.'],
          assertions: {
            registers: { ax: 15, cx: 0 },
            maxSteps: 50
          },
          examTip: 'LOOP komutunun hedef etiketi göreli (relative -128..+127 bayt) uzaklıkta olmalıdır.'
        }
      }
    ]
  },

  // =========================================================================
  // 6. YIĞIN (STACK) MİMARİSİ VE PROSEDÜRLER
  // =========================================================================
  {
    id: 'topic-6-stack-procedures',
    number: 6,
    title: 'Yığın Mimarisi (Stack) & Prosedürler (CALL, RET, BP)',
    shortTitle: '6. Yığın & Prosedürler',
    badge: 'ALT YORDAMLAR',
    icon: '🥞',
    summary: 'LIFO prensibi, SP işaretçisinin aşağı büyümesi (-2), PUSH/POP kuralları, CALL/RET ve yerel çerçeve (BP).',
    opcodes: ['PUSH', 'POP', 'PUSHF', 'POPF', 'CALL', 'RET'],
    mindMap: {
      x: 55,
      y: 50,
      connections: ['topic-7-strings']
    },
    subLessons: [
      {
        id: 'sub-6-stack-lifo',
        number: '6.1',
        title: 'Yığın (Stack) Mimarisi ve PUSH / POP Mekanizması',
        summary: 'SP yazmacının -2 azalması, 8-bit PUSH yasağı ve LIFO kuralı.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Yığın (Stack) Nasıl Çalışır?</h4>
            <p>8086'da yığın <strong>aşağıya doğru (yüksek adresten düşük adrese)</strong> büyür:</p>
            <ul>
              <li><code>PUSH kaynak</code>: Önce <code>SP = SP - 2</code> yapılır, ardından 16-bit veri <code>SS:SP</code> adresine yazılır.</li>
              <li><code>POP hedef</code>: <code>SS:SP</code> adresindeki 16-bit veri okunur, ardından <code>SP = SP + 2</code> yapılır.</li>
            </ul>
            <div class="nb-callout warning">
              🚨 <strong>8-Bit Yasağı:</strong> 8086'da 8-bitlik yazmaçlar yığına itilemez! <code>PUSH AL ; HATA!</code>. Sadece 16-bit Word atılabilir.
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-6-1',
          question: 'SP = 0100H iken "PUSH AX" komutu yürütülürse SP yazmacının yeni değeri ne olur?',
          options: [
            '00FEH (SP 2 azalır)',
            '0102H (SP 2 artar)',
            '00FFH (SP 1 azalır)',
            '0100H (Değişmez)'
          ],
          correctIndex: 0,
          explanation: 'Yığın aşağıya doğru büyüdüğü için her PUSH işleminde SP değeri 2 azalır (0100H - 2 = 00FEH).'
        },
        task: {
          id: 'task-6-reverse-stack',
          title: 'Yığın ile Değerleri Tersine Çevirme',
          difficulty: 'Kolay',
          scenario: 'AX = 1234h ve BX = 5678h değerlerini yığına atıp sırasıyla çekerek değerleri takas edin.',
          taskPrompt: 'AX\'e 1234h, BX\'e 5678h yükleyin. PUSH AX, PUSH BX yapın. Ardından POP AX, POP BX yapın. Sonuçta AX=5678h, BX=1234h olmalıdır.',
          starterCode: `; 6.1 Yığın ile Takas
ORG 100h

MOV AX, 1234h
MOV BX, 5678h

; Yığına itin:
; Geri çekin:


HLT
`,
          solutionCode: `ORG 100h
MOV AX, 1234h
MOV BX, 5678h
PUSH AX
PUSH BX
POP AX
POP BX
HLT
`,
          hints: ['İlk atılan son çıkar (LIFO). PUSH AX, PUSH BX ardından POP AX, POP BX yapın.'],
          assertions: {
            registers: { ax: 0x5678, bx: 0x1234 },
            maxSteps: 50
          },
          examTip: 'Yığına atılan sıranın tam tersi sırada POP yapılmazsa veriler birbirine karışır.'
        }
      },
      {
        id: 'sub-6-call-ret',
        number: '6.2',
        title: 'Alt Yordamlar: CALL ve RET Mekanizması',
        summary: 'Dönüş adresinin yığına saklanması ve yordamdan dönüş.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">CALL ve RET Nasıl İletişim Kurar?</h4>
            <ol>
              <li><code>CALL alt_program</code>: Bir sonraki komutun adresi (<code>IP</code>) yığına atılır (<code>PUSH IP</code>) ve alt programa zıplanır.</li>
              <li>Alt program işini bitirince <code>RET</code> komutu çağrılır.</li>
              <li><code>RET</code>: Yığından saklanan dönüş adresi çekilir (<code>POP IP</code>) ve ana programa dönülür.</li>
            </ol>
            <div class="nb-callout tip">
              💡 Alt program içinde PUSH yaptıysanız, RET komutuna gelmeden önce mutlaka aynı sayıda POP yaparak yığın dengesini (Stack Balance) korumalısınız!
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-6-2',
          question: 'CALL komutu işletildiğinde işlemci hangi değeri yığına otomatik olarak kaydeder?',
          options: [
            'Bir sonraki komutun dönüş adresi (IP)',
            'AX yazmacının içeriği',
            'FLAGS bayrak yazmacı',
            'CS segmentinin son adresi'
          ],
          correctIndex: 0,
          explanation: 'CALL komutu ana programa geri dönebilmek için sıradaki komutun adresini (IP) yığına PUSH eder.'
        },
        task: {
          id: 'task-6-call-subroutine',
          title: 'CALL ve RET ile Kare Alma Yordamı',
          difficulty: 'Orta',
          scenario: 'Ana programda AL=4 verip alt programı çağırın. Alt program AL\'yi kendisiyle çarparak kare alsın.',
          taskPrompt: 'AL=4 yapın. CALL KARE_AL ile alt programa gidin. Alt programda MUL AL yapın, RET ile dönün. Ana programda HLT ile bitirin.',
          starterCode: `; 6.2 CALL ve RET
ORG 100h

MOV AL, 4
CALL KARE_AL
HLT

KARE_AL:
  ; AL'nin karesini alın (MUL AL):
  ; RET ile dönün:
`,
          solutionCode: `ORG 100h
MOV AL, 4
CALL KARE_AL
HLT

KARE_AL:
  MUL AL
  RET
`,
          hints: ['KARE_AL etiketinin altında MUL AL ve RET yazın.'],
          assertions: {
            registers: { ax: 16 },
            maxSteps: 50
          },
          examTip: 'Ana program akışı alt programa girmesin diye CALL komutunun hemen ardına HLT konur.'
        }
      }
    ]
  },

  // =========================================================================
  // 7. STRİNG VE DİZİ İŞLEMLERİ
  // =========================================================================
  {
    id: 'topic-7-strings',
    number: 7,
    title: 'String ve Dizi İşlemleri, Blok Bellek Transferi (MOVS, REP, DF)',
    shortTitle: '7. String & Dizi İşlemleri',
    badge: 'BLOK VERİ TRANSFERİ',
    icon: '🔤',
    summary: 'DS:SI ve ES:DI çiftleri, DF bayrağı (CLD / STD), MOVS, LODS, STOS, SCAS ve REP ön ekleri.',
    opcodes: ['MOVSB', 'MOVSW', 'LODSB', 'STOSB', 'SCASB', 'CMPSB', 'REP', 'REPE', 'REPNE', 'CLD', 'STD'],
    mindMap: {
      x: 35,
      y: 50,
      connections: ['topic-8-io-interrupts']
    },
    subLessons: [
      {
        id: 'sub-7-string-ops',
        number: '7.1',
        title: 'String Komutları, Yön Bayrağı (DF) ve REP Ön Eki',
        summary: 'CLD ile ileri (+1/+2), STD ile geri (-1/-2) yönü, CX sayacı ile blok kopyalama.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">String Komutlarının Donanım Kuralları</h4>
            <ul>
              <li><strong>Kaynak Gösterici:</strong> Her zaman <code>DS:SI</code> çiftidir.</li>
              <li><strong>Hedef Gösterici:</strong> Her zaman <code>ES:DI</code> çiftidir.</li>
              <li><strong>DF (Direction Flag):</strong>
                <ul>
                  <li><code>CLD (Clear Direction)</code>: DF = 0 yapar &rarr; İndeksler otomatik <strong>ARTAR</strong> (+1 bayt, +2 word).</li>
                  <li><code>STD (Set Direction)</code>: DF = 1 yapar &rarr; İndeksler otomatik <strong>AZALIR</strong>.</li>
                </ul>
              </li>
              <li><strong>REP Ön Eki:</strong> Komutu <code>CX</code> defa tekrarlar ve her adımda CX'i 1 azaltır.</li>
            </ul>
          </div>
        `,
        quiz: {
          id: 'quiz-7-1',
          question: 'MOVSB komutu çalıştırıldığında SI ve DI yazmaçlarının otomatik artması için hangi komut önceden çalıştırılmalıdır?',
          options: [
            'CLD (DF = 0)',
            'STD (DF = 1)',
            'CLC (CF = 0)',
            'CLI (IF = 0)'
          ],
          correctIndex: 0,
          explanation: 'CLD (Clear Direction Flag), DF bayrağını 0 yaparak string komutlarının adresleri ileriye doğru (+1/+2) artırmasını sağlar.'
        },
        task: {
          id: 'task-7-stosb-fill',
          title: 'STOSB ve REP ile Bellek Bloğunu Doldurma',
          difficulty: 'Orta',
          scenario: 'Bellekteki [0200h] adresinden başlayan 4 baytlık alanı 0AAh değeriyle doldurun.',
          taskPrompt: 'CLD yapın. AL = 0AAh, DI = 0200h, CX = 4 yapın. REP STOSB komutunu çalıştırın. HLT ile bitirin.',
          starterCode: `; 7.1 STOSB ile Blok Doldurma
ORG 100h

; CLD, AL=0AAh, DI=0200h, CX=4 ayarlayın:
; REP STOSB çalıştırın:


HLT
`,
          solutionCode: `ORG 100h
CLD
MOV AL, 0AAh
MOV DI, 0200h
MOV CX, 4
REP STOSB
HLT
`,
          hints: ['CLD, MOV AL, 0AAh, MOV DI, 0200h, MOV CX, 4 ve REP STOSB yazın.'],
          assertions: {
            memory: [
              { segment: 0x0000, offset: 0x0200, expectedBytes: [0xAA, 0xAA, 0xAA, 0xAA] }
            ],
            registers: { cx: 0 },
            maxSteps: 50
          },
          examTip: 'STOSB AL\'deki değeri ES:DI\'ye yazar ve DI\'yi DF\'ye göre günceller.'
        }
      }
    ]
  },

  // =========================================================================
  // 8. G/Ç PORTLARI VE KESMELER
  // =========================================================================
  {
    id: 'topic-8-io-interrupts',
    number: 8,
    title: 'G/Ç Portları, BIOS Kesmeleri & Donanım (IN, OUT, INT, IVT)',
    shortTitle: '8. G/Ç & Kesmeler',
    badge: 'DONANIM ETKİLEŞİMİ',
    icon: '⚡',
    summary: 'IN ve OUT komutları, DX port kuralı, Kesme Vektör Tablosu (IVT), INT 10h ekran ve INT 21h DOS servisleri.',
    opcodes: ['IN', 'OUT', 'INT', 'IRET', 'CLI', 'STI'],
    mindMap: {
      x: 15,
      y: 50,
      connections: ['topic-9-algorithms']
    },
    subLessons: [
      {
        id: 'sub-8-io-ivt',
        number: '8.1',
        title: 'G/Ç Portları ve Kesme Vektör Tablosu (IVT)',
        summary: 'Port adresleme kuralları, DX yazmacı zorunluluğu ve 00000h adresindeki IVT yapısı.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">Giriş / Çıkış (IN / OUT) Portları</h4>
            <p>8086 dış çevre birimleriyle (klavye, timer, ekran) portlar üzerinden konuşur:</p>
            <ul>
              <li><strong>Sabit Port Adresi (0-255):</strong> <code>IN AL, 60h</code> veya <code>OUT 20h, AL</code></li>
              <li><strong>Geniş Port Adresi (256-65535):</strong> Port adresi mutlaka <strong>DX yazmacında</strong> olmalıdır: <code>MOV DX, 03F8h &rarr; OUT DX, AL</code></li>
            </ul>
            <h4 class="nb-title" style="margin-top: 14px;">Kesme Vektör Tablosu (IVT)</h4>
            <p>Belleğin ilk 1 KB'lık alanında (<code>00000H – 003FFH</code>) 256 adet kesmenin her biri için 4 baytlık (2 bayt IP, 2 bayt CS) ISR adresi bulunur.</p>
          </div>
        `,
        quiz: {
          id: 'quiz-8-1',
          question: '0378H (LPT1 Paralel Port) adresine bir bayt veri göndermek için port adresi hangi yazmaca yüklenmelidir?',
          options: [
            'DX yazmacına',
            'BX yazmacına',
            'AX yazmacına',
            'SI yazmacına'
          ],
          correctIndex: 0,
          explanation: '8086 mimarisinde 255\'ten büyük G/Ç port adresleri mutlaka DX yazmacı üzerinden verilmelidir (OUT DX, AL).'
        },
        task: {
          id: 'task-8-port-io',
          title: 'IN ve OUT ile Port Haberleşmesi',
          difficulty: 'Kolay',
          scenario: '60h klavye portundan veriyi AL yazmacına okuyun ve BL yazmacına saklayın.',
          taskPrompt: 'IN AL, 60h ile porttan okuyun. Okunan değeri MOV BL, AL ile saklayın. HLT ile bitirin.',
          starterCode: `; 8.1 Porttan Okuma
ORG 100h

; 60h portundan AL'ye okuyun:
; BL'ye kopyalayın:


HLT
`,
          solutionCode: `ORG 100h
IN AL, 60h
MOV BL, AL
HLT
`,
          hints: ['IN AL, 60h ardından MOV BL, AL yazın.'],
          assertions: {
            maxSteps: 50
          },
          examTip: 'IN komutunun hedefi her zaman AL (8-bit) veya AX (16-bit) olmak zorundadır.'
        }
      }
    ]
  },

  // =========================================================================
  // 9. İLERİ ALGORİTMALAR VE SINAV SORULARI
  // =========================================================================
  {
    id: 'topic-9-algorithms',
    number: 9,
    title: 'İleri Algoritmalar, XLAT & Vize Sınav Soru Çözümleri',
    shortTitle: '9. Algoritmalar & Sınav',
    badge: 'SINAV & ALGORİTMA',
    icon: '🎯',
    summary: 'XLAT tablo arama, dizi sıralama, palindrom kontrolü, matris toplamı ve klasik vize sınav soruları.',
    opcodes: ['XLAT', 'XLATB'],
    mindMap: {
      x: 45,
      y: 80,
      connections: []
    },
    subLessons: [
      {
        id: 'sub-9-xlat-exam',
        number: '9.1',
        title: 'XLAT (Translate) Komutu ve Tablo Çevrimi',
        summary: 'DS:BX tablosundan AL indisindeki elemanı okuma mekanizması.',
        theoryHtml: `
          <div class="nb-section">
            <h4 class="nb-title">XLAT Komutunun Çalışma Mantığı</h4>
            <p><code>XLAT</code> komutu donanımsal olarak şu işlemi tek hamlede yapar:</p>
            <div class="nb-formula-box">
              <code>AL = [BX + AL]</code>
            </div>
            <p>Yani <code>BX</code> yazmacı tablonun başlangıç ofsetini, <code>AL</code> ise tablodaki indisi tutar. Komut çalışınca <code>AL</code> yazmacına tablonun o indisindeki değer gelir.</p>
            <div class="nb-callout tip">
              💡 7-Segment gösterge çevrimlerinde, şifreleme ve karakter dönüşüm tablolarında çok sık kullanılır ve vize sınavlarında sorulur.
            </div>
          </div>
        `,
        quiz: {
          id: 'quiz-9-1',
          question: 'XLAT komutu çalıştırıldığında tablo başlangıç adresi ve eleman indisi sırasıyla hangi yazmaçlarda bulunmalıdır?',
          options: [
            'Tablo başlangıcı BX, indis AL',
            'Tablo başlangıcı SI, indis AX',
            'Tablo başlangıcı DS, indis BX',
            'Tablo başlangıcı BP, indis CX'
          ],
          correctIndex: 0,
          explanation: 'XLAT donanımsal olarak DS:BX tablosundan AL ofsetindeki baytı okuyup tekrar AL\'ye yazar (AL = [BX + AL]).'
        },
        task: {
          id: 'task-9-xlat-lookup',
          title: 'XLAT ile Tablodan Eleman Çekme',
          difficulty: 'Orta',
          scenario: 'Bellekte tanımlı tablonun 3. indisindeki elemanı XLAT ile AL yazmacına çekin.',
          taskPrompt: 'BX = 0200h yapın. Belleğe tabloyu yazın. AL = 3 yapın ve XLAT çalıştırın (Sonuç: AL = 44h olmalıdır).',
          starterCode: `; 9.1 XLAT ile Tablo Okuma
ORG 100h

; Belleğe tablo değerlerini hazırlıyoruz:
MOV BYTE PTR [0200h], 11h
MOV BYTE PTR [0201h], 22h
MOV BYTE PTR [0202h], 33h
MOV BYTE PTR [0203h], 44h

MOV BX, 0200h   ; Tablo başlangıç ofseti
; AL'ye 3 indisini yükleyin:
; XLAT komutunu çalıştırın:


HLT
`,
          solutionCode: `ORG 100h
MOV BYTE PTR [0200h], 11h
MOV BYTE PTR [0201h], 22h
MOV BYTE PTR [0202h], 33h
MOV BYTE PTR [0203h], 44h

MOV BX, 0200h
MOV AL, 3
XLAT
HLT
`,
          hints: ['MOV AL, 3 ardından XLAT yazın.'],
          assertions: {
            registers: { al: 0x44 },
            maxSteps: 50
          },
          examTip: 'XLAT komutu hiçbir operand almaz; BX ve AL operandları donanımsal olarak sabittir.'
        }
      }
    ]
  }
];
