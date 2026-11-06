import { MainTopic } from '../studyData.js';

export const TOPIC_12: MainTopic = {
  "id": "topic-12-gecen-yil-bcd-and-ascii-math",
  "number": 12,
  "category": "secondary",
  "weekLabel": "Geçen Yıl",
  "title": "12. Modül (Geçen Yıl): BCD, Onluk Düzeltme (DAA/DAS) ve ASCII Aritmetik Laboratuvarı",
  "titleEn": "Last Year Module 12: BCD, Decimal Adjust (DAA/DAS) & ASCII Arithmetic Lab",
  "shortTitle": "Geçen Yıl: BCD & ASCII",
  "shortTitleEn": "Archive: BCD & ASCII",
  "badge": "MODÜL 12 • GEÇEN YIL",
  "badgeEn": "ARCHIVE • BCD & ASCII",
  "icon": "🔢",
  "summary": "Geçen yılın BCD ve ASCII aritmetik uygulamaları: Packed BCD (DAA, DAS), Unpacked BCD (AAA, AAS, AAM, AAD) ve ASCII-Binary sayı dönüşüm algoritmaları.",
  "summaryEn": "Archive BCD and ASCII arithmetic labs: Packed BCD (DAA, DAS), Unpacked BCD (AAA, AAS, AAM, AAD), and ASCII-to-Binary conversion algorithms.",
  "opcodes": [
    "DAA",
    "DAS",
    "AAA",
    "AAS",
    "AAM",
    "AAD",
    "OR",
    "AND"
  ],
  "subLessons": [
    {
      "id": "sub-12-1-packed-bcd-daa-das-lab",
      "number": "12.1",
      "title": "Paketlenmiş BCD Aritmetiği ve DAA / DAS Düzeltme Komutları",
      "titleEn": "Packed BCD Arithmetic Adjustments: DAA and DAS",
      "summary": "Paketlenmiş BCD formatı, ikili toplayıcı uyumsuzlukları ve DAA/DAS tam karar mantığı tabloları (+06h/+60h ve -06h/-60h düzeltmeleri).",
      "summaryEn": "Packed BCD representation (2 digits per byte), addition correction with DAA (+06h / +60h when lower nibble > 9 or AF=1, or upper nibble > 9 or CF=1), subtraction correction with DAS, and AF/CF mechanics.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Paketlenmiş BCD (Packed BCD) Formatı ve ALU Uyumsuzluğu</h4>\n            <p>\n              <strong>İkili Kodlanmış Onlu (BCD - Binary Coded Decimal)</strong> formatında her onluk basamak (0–9) \n              4 bitlik bir nipel (nibble) ile temsil edilir:\n            </p>\n            <ul>\n              <li><strong>Paketlenmemiş BCD (Unpacked BCD):</strong> Her baytta yalnızca bir basamak tutulur; üst nipel daima <code>0000b</code>'dir (<code>00h–09h</code>).</li>\n              <li><strong>Paketlenmiş BCD (Packed BCD):</strong> Her baytta iki basamak tutulur (<code>00h–99h</code>). Örneğin 59 sayısı ikili tabanda <code>0011 1011b</code> iken BCD formatında <code>0101 1001b</code> (<code>59h</code>) olarak saklanır.</li>\n            </ul>\n            <p>\n              Standart ikili toplayıcı (binary adder), BCD kurallarını bilmez. Örneğin BCD <code>38h</code> ile BCD <code>45h</code> \n              toplandığında ALU saf ikili olarak şunu üretir:\n            </p>\n            <div class=\"nb-code-box\">$$38\text{h} + 45\text{h} = 7\text{Dh}$$</div>\n            <p>\n              Oysa <code>'D'</code> geçerli bir ondalık BCD hanesi değildir (çünkü $38 + 45 = 83$ olmalıdır). \n              Bu uyumsuzluğu gidermek için toplama işleminden hemen sonra <strong><code>DAA</code></strong>, \n              çıkarma işleminden hemen sonra ise <strong><code>DAS</code></strong> komutu yürütülür.\n            </p>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. DAA (Decimal Adjust for Addition) Düzeltme Algoritması</h4>\n            <p>\n              <code>DAA</code> komutu <strong>yalnızca <code>AL</code> yazmacı üzerinde çalışır</strong>. \n              Bir <code>ADD</code> veya <code>ADC</code> komutunun hemen ardından çağrılmalıdır:\n            </p>\n\n            <div class=\"nb-card\">\n              <h5>🧮 DAA İki Aşamalı Donanımsal Karar Mantığı</h5>\n              <ol>\n                <li>\n                  <strong>Düşük Nipel Düzeltmesi (Lower Nibble Adjustment):</strong>\n                  <br>Eğer $AL$'nin alt 4 biti ($AL land 0\text{Fh}$) $9$'dan büyükse <strong>VEYA</strong> Yardımcı Elde Bayrağı $AF = 1$ ise:\n                  <br><code>AL &larr; AL + 06h, &nbsp; AF &larr; 1</code>\n                </li>\n                <li>\n                  <strong>Yüksek Nipel Düzeltmesi (Upper Nibble Adjustment):</strong>\n                  <br>Eğer $AL$'nin üst 4 biti $9$'dan büyükse ($AL > 9\text{Fh}$) <strong>VEYA</strong> Elde Bayrağı $CF = 1$ ise:\n                  <br><code>AL &larr; AL + 60h, &nbsp; CF &larr; 1</code>\n                </li>\n              </ol>\n            </div>\n\n            <div class=\"nb-table-wrapper\" style=\"margin-top: 14px;\">\n              <table class=\"nb-table\">\n                <thead>\n                  <tr>\n                    <th>Başlangıç AL Değeri</th>\n                    <th>Giriş AF</th>\n                    <th>Giriş CF</th>\n                    <th>AL'ye Eklenen Değer</th>\n                    <th>Çıkış AF</th>\n                    <th>Çıkış CF</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  <tr>\n                    <td>Alt nipel &le; 9, Üst nipel &le; 9</td>\n                    <td>0</td>\n                    <td>0</td>\n                    <td><code>+00h</code></td>\n                    <td>0</td>\n                    <td>0</td>\n                  </tr>\n                  <tr>\n                    <td>Alt nipel &gt; 9, Üst nipel &le; 8</td>\n                    <td>X</td>\n                    <td>0</td>\n                    <td><code>+06h</code></td>\n                    <td>1</td>\n                    <td>0</td>\n                  </tr>\n                  <tr>\n                    <td>Alt nipel &le; 9, Üst nipel &gt; 9</td>\n                    <td>0</td>\n                    <td>X</td>\n                    <td><code>+60h</code></td>\n                    <td>0</td>\n                    <td>1</td>\n                  </tr>\n                  <tr>\n                    <td>Alt nipel &gt; 9, Üst nipel &gt; 9</td>\n                    <td>X</td>\n                    <td>X</td>\n                    <td><code>+66h</code></td>\n                    <td>1</td>\n                    <td>1</td>\n                  </tr>\n                </tbody>\n              </table>\n            </div>\n\n            <div class=\"nb-code-box\" style=\"margin-top: 14px;\">\n              <span class=\"nb-code-label\">8086 Assembly: DAA ile Paketlenmiş BCD Toplama</span>\n<pre><code>ORG 100h\nMOV AL, 38h     ; Paketlenmiş BCD 38\nMOV BL, 45h     ; Paketlenmiş BCD 45\nADD AL, BL      ; İkili toplam: AL = 7Dh, AF = 0, CF = 0 (geçersiz BCD)\nDAA             ; Alt nipel D > 9 olduğu için +06h ekler: AL = 83h, CF = 0\n; AL artık geçerli BCD 83 değerini taşır\nHLT</code></pre>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">3. DAS (Decimal Adjust for Subtraction) Düzeltme Algoritması</h4>\n            <p>\n              <code>DAS</code> komutu paketlenmiş BCD çıkarma işlemlerinden (<code>SUB</code> veya <code>SBB</code>) \n              sonra <code>AL</code> yazmacındaki ikili farkı ondalık tabana uydurur:\n            </p>\n            <ol>\n              <li>Eğer $AL$'nin alt nipeli $> 9$ veya $AF = 1$ ise:\n                <br><code>AL &larr; AL - 06h, &nbsp; AF &larr; 1</code></li>\n              <li>Eğer $AL > 9\text{Fh}$ veya $CF = 1$ ise:\n                <br><code>AL &larr; AL - 60h, &nbsp; CF &larr; 1</code></li>\n            </ol>\n\n            <div class=\"nb-code-box\">\n              <span class=\"nb-code-label\">8086 Assembly: DAS ile Paketlenmiş BCD Çıkarma</span>\n<pre><code>ORG 100h\nMOV AL, 83h     ; BCD 83\nMOV BL, 45h     ; BCD 45\nSUB AL, BL      ; AL = 83h - 45h = 3Eh (ikili fark)\nDAS             ; Alt nipel E > 9 olduğundan 06h düşer: AL = 38h, CF = 0\n; AL = 38h (BCD 38)\nHLT</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 5: Arithmetic & Logic — Decimal Adjustments</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Packed BCD Arithmetic Adjustments: DAA and DAS</h4>\n            <p>\n              In packed BCD arithmetic, two decimal digits (0–9) are packed into a single byte. When binary <code>ADD</code> or <code>SUB</code> executes, standard binary addition creates illegal digits (hex A–F) or invalid carries because binary addition wraps at 16 rather than 10.\n            </p>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>DAA (Decimal Adjust after Addition)</h5>\n                <ul>\n                  <li>If lower nibble $> 9$ or $\text{AF} = 1$: adds $06\text{H}$ to AL, sets $\text{AF} = 1$.</li>\n                  <li>If upper nibble $> 9$ or $\text{CF} = 1$: adds $60\text{H}$ to AL, sets $\text{CF} = 1$.</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>DAS (Decimal Adjust after Subtraction)</h5>\n                <ul>\n                  <li>If lower nibble $> 9$ or $\text{AF} = 1$: subtracts $06\text{H}$ from AL, sets $\text{AF} = 1$.</li>\n                  <li>If upper nibble $> 9$ or $\text{CF} = 1$: subtracts $60\text{H}$ from AL, sets $\text{CF} = 1$.</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-9-1",
        "question": "Paketlenmiş BCD 38h ile BCD 45h toplandığında ALU ikili olarak 7Dh üretir. Hemen ardından `DAA` komutu çalıştırıldığında AL yazmacının nihai değeri ne olur?",
        "options": [
          "7Dh",
          "83h",
          "73h",
          "93h"
        ],
        "correctIndex": 1,
        "explanation": "7Dh sayısında alt nipel D > 9 olduğu için DAA komutunun 1. kuralı devreye girer ve 06h eklenir: 7Dh + 06h = 83h. Bu değer ondalık 38 + 45 = 83 işleminin tam BCD karşılığıdır."
      },
      "task": {
        "id": "task-9-1-daa-addition",
        "title": "DAA ile Paketlenmiş BCD Toplama Düzeltmesi",
        "difficulty": "Orta",
        "scenario": "AL=38h ve BL=45h BCD sayıları toplanıp DAA ile düzeltilecektir.",
        "taskPrompt": "AL ve BL yazmaçlarına değerleri yükleyin. ADD AL, BL ve ardından DAA komutunu çalıştırarak AL'nin 83h olmasını sağlayın.",
        "starterCode": "ORG 100h\nMOV AL, 38h\nMOV BL, 45h\n; ADD AL, BL ardından DAA komutunu çalıştırın\nHLT",
        "solutionCode": "ORG 100h\nMOV AL, 38h\nMOV BL, 45h\nADD AL, BL\nDAA\nHLT",
        "hints": [
          "ADD AL, BL ikili toplama yapar (7Dh).",
          "DAA alt nipele 6 ekleyerek sonucu 83h yapar."
        ],
        "assertions": {
          "registers": {
            "al": 131
          }
        },
        "examTip": "DAA yalnızca AL yazmacında ve ADD/ADC komutlarından hemen sonra çalışır."
      }
    },
    {
      "id": "sub-12-2-unpacked-bcd-aaa-aam-lab",
      "number": "12.2",
      "title": "Paketsiz ASCII Aritmetiği: AAA, AAS, AAM ve AAD Komutları",
      "titleEn": "Unpacked BCD and ASCII Adjustments: AAA, AAS, AAM, and AAD",
      "summary": "Tek basamaklı ASCII aritmetiği, AAA/AAS üst nipel maskelemesi, AAM genelleştirilmiş taban komut kodu (D4 imm8) ve AAD komutunun bölme öncesi çalışma kuralı.",
      "summaryEn": "ASCII and unpacked BCD arithmetic: AAA (ASCII Adjust after Addition), AAS (ASCII Adjust after Subtraction), AAM (ASCII Adjust after Multiplication: AH = AL/10, AL = AL mod 10), and AAD (ASCII Adjust before Division: AL = AH*10 + AL, AH = 0).",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. ASCII Sayı Temsili ve Paketlenmemiş BCD (Unpacked BCD)</h4>\n            <p>\n              ASCII karakter tablosunda rakamlar (<code>'0'–'9'</code>) <code>30h</code> ile <code>39h</code> \n              arasında yer alır (ikili: <code>0011 xxxx b</code>). \n              Paketlenmemiş BCD formatında ise her baytta yalnızca bir basamak bulunur ve üst nipel daima <code>0000b</code>'dir (<code>00h–09h</code>).\n            </p>\n            <p>\n              8086 mikroişlemcisi klavyeden girilen metin tabanlı rakamlar üzerinde toplama, çıkarma, çarpma ve bölme \n              yapabilmek için dört özel düzeltme komutu sunar: <strong>AAA, AAS, AAM, AAD</strong>.\n            </p>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. AAA ve AAS: Toplama ve Çıkarma Düzeltmesi</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>➕ AAA (ASCII Adjust for Addition)</h5>\n                <p>İki ASCII veya paketlenmemiş BCD rakamı toplandıktan sonra çağrılır:</p>\n                <ul>\n                  <li>Eğer $(AL land 0\text{Fh}) > 9$ veya $AF = 1$ ise:\n                    <br><code>AL &larr; (AL + 6) &and; 0Fh</code>\n                    <br><code>AH &larr; AH + 1, &nbsp; AF = 1, &nbsp; CF = 1</code></li>\n                  <li>Aksi halde:\n                    <br><code>AL &larr; AL &and; 0Fh, &nbsp; AF = 0, &nbsp; CF = 0</code></li>\n                </ul>\n                <p><strong>En Belirgin Özellik:</strong> <code>AAA</code> yürütüldükten sonra <code>AL</code>'nin üst nipeli <strong>DAİMA 0000b (0h)</strong> olur!</p>\n              </div>\n\n              <div class=\"nb-card\">\n                <h5>➖ AAS (ASCII Adjust for Subtraction)</h5>\n                <p>ASCII çıkarma işleminden sonra farkı düzeltir:</p>\n                <ul>\n                  <li>Eğer $(AL land 0\text{Fh}) > 9$ veya $AF = 1$ ise:\n                    <br><code>AL &larr; (AL - 6) &and; 0Fh</code>\n                    <br><code>AH &larr; AH - 1, &nbsp; AF = 1, &nbsp; CF = 1</code></li>\n                  <li>Aksi halde:\n                    <br><code>AL &larr; AL &and; 0Fh, &nbsp; AF = 0, &nbsp; CF = 0</code></li>\n                </ul>\n                <p>Borç alındığında <code>AH</code>'den 1 düşülür ve <code>CF=AF=1</code> yapılır.</p>\n              </div>\n            </div>\n\n            <div class=\"nb-code-box\" style=\"margin-top: 14px;\">\n              <span class=\"nb-code-label\">8086 Assembly: AAA ile ASCII Toplama ve Karakter Üretimi</span>\n<pre><code>ORG 100h\nMOV AX, 0038h   ; '8' ASCII karakteri (AL = 38h, AH = 00h)\nADD AL, 37h     ; '7' ASCII karakteri eklenir (AL = 38h + 37h = 6Fh)\nAAA             ; Düzeltme: AL = 05h, AH = 01h (AX = 0105h -> 15 ondalık)\nOR AX, 3030h    ; Yeniden ASCII formatına çevirme: AX = 3135h ('1' ve '5')\nHLT</code></pre>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">3. AAM: Çarpma Düzeltmesi ve Genelleştirilmiş Taban (Opcode D4 imm8)</h4>\n            <p>\n              <code>AAM</code> (ASCII Adjust for Multiplication), iki tek haneli paketlenmemiş BCD sayının çarpımı \n              sonrasında çağrılır. <code>AL</code> içindeki çarpım sonucunu onlar ve birler basamağına ayırır:\n            </p>\n            <div class=\"nb-code-box\">$$AH leftarrow lfloor AL / 10 \rfloor, quad AL leftarrow AL pmod{10}$$</div>\n\n            <div class=\"nb-callout nb-callout-warning\" style=\"margin-top: 12px;\">\n              <h5>⚡ İleri Düzey Mimari Bilgisi: AAM'in Genelleştirilmiş Taban Özelliği</h5>\n              <p>\n                Standart <code>AAM</code> komutunun makine kodu iki bayttır: <strong><code>D4 0Ah</code></strong>. \n                Buradaki <code>0Ah</code> değeri bölen ondalık tabanı (10) temsil eder.\n                Eğer programcı makine kodundaki <code>0Ah</code> yerine başka bir anlık sabit (<code>imm8</code>) yazarsa \n                (örneğin <code>D4 10h</code>), <code>AAM</code> komutu belirtilen tabana göre bölme yaparak \n                sayıyı onaltılık (hexadecimal) veya sekizlik (octal) basamaklarına ayırır!\n              </p>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">4. AAD: Bölme Öncesinde Çalışma Kuralı (Opcode D5 imm8)</h4>\n            <div class=\"nb-callout nb-callout-danger\">\n              <h5>🚫 En Kritik Kural: AAD Bölmeden SONRA DEĞİL, Bölmeden HEMEN ÖNCE Yürütülür!</h5>\n              <p>\n                Diğer tüm düzeltme komutlarının (DAA, DAS, AAA, AAS, AAM) aksine <strong><code>AAD</code> (ASCII Adjust before Division)</strong>, \n                bölme işleminden <strong>SONRA DEĞİL, BÖLME İŞLEMİNDEN HEMEN ÖNCE</strong> yürütülür!\n                <br>\n                <code>AH:AL</code> içindeki iki basamaklı paketlenmemiş BCD sayıyı ikiliye (binary) dönüştürerek \n                standart <code>DIV</code> komutuna hazırlar:\n              </p>\n              <div class=\"nb-code-box\">$$AL leftarrow (AH \times 10) + AL, quad AH leftarrow 0$$</div>\n            </div>\n\n            <div class=\"nb-code-box\" style=\"margin-top: 14px;\">\n              <span class=\"nb-code-label\">8086 Assembly: \"35\" / 5 İşlemi için AAD ve DIV Kullanımı</span>\n<pre><code>ORG 100h\n; İki basamaklı \"35\" sayısını 5'e bölmek:\nMOV AX, 0305h   ; AH = 3 (onlar hanesi), AL = 5 (birler hanesi)\nAAD             ; AL = (3 * 10) + 5 = 35 (23h), AH = 0 (BÖLMEDEN ÖNCE ÇAĞRILDI!)\nMOV BL, 5       ; Bölen = 5\nDIV BL          ; AL = 7 (Bölüm), AH = 0 (Kalan)\nHLT</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 5: Arithmetic & Logic — ASCII Adjustments</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Unpacked BCD and ASCII Adjustments: AAA, AAS, AAM, AAD</h4>\n            <ul>\n              <li><strong>AAA (ASCII Adjust after Addition):</strong> Adjusts AL after adding two unpacked/ASCII digits. If lower nibble $> 9$ or $\text{AF} = 1$: adds 6 to AL, adds 1 to AH, clears upper nibble of AL.</li>\n              <li><strong>AAS (ASCII Adjust after Subtraction):</strong> Adjusts AL after subtracting unpacked digits. If borrow occurred, decrements AH and adjusts AL.</li>\n              <li><strong>AAM (ASCII Adjust after Multiplication):</strong> Executes AFTER <code>MUL</code> on two unpacked digits:\n                $$\text{AH} leftarrow \text{AL} div 10, quad \text{AL} leftarrow \text{AL} pmod{10}$$\n                Splits binary product into tens in AH and units in AL.</li>\n              <li><strong>AAD (ASCII Adjust before Division):</strong> Executes BEFORE <code>DIV</code> on two unpacked digits:\n                $$\text{AL} leftarrow (\text{AH} \times 10) + \text{AL}, quad \text{AH} leftarrow 0$$\n                Recombines tens and units into standard binary before division.</li>\n            </ul>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-9-2",
        "question": "8086 mimarisinde BCD ve ASCII aritmetik düzeltme komutları arasında aritmetik işlemden SONRA değil, işlemden HEMEN ÖNCE yürütülen yegane komut hangisidir?",
        "options": [
          "DAA (Decimal Adjust for Addition)",
          "AAA (ASCII Adjust for Addition)",
          "AAM (ASCII Adjust for Multiplication)",
          "AAD (ASCII Adjust before Division)"
        ],
        "correctIndex": 3,
        "explanation": "AAD komutu, bölme işleminden önce çalıştırılarak AH:AL yazmaçlarındaki iki paketlenmemiş basamağı ikili tabana (AL = AH*10 + AL, AH=0) dönüştürür. Diğer tüm komutlar (DAA, DAS, AAA, AAS, AAM) aritmetik işlemden sonra çalışır."
      },
      "task": {
        "id": "task-9-2-aaa-adjust",
        "title": "AAA ile ASCII Toplama ve Elde Biriktirme",
        "difficulty": "Orta",
        "scenario": "AX=0008h değerine AL üzerinden 7 eklenir (8 + 7 = 15). AAA ile onlar basamağı AH=1, birler basamağı AL=5 yapılacaktır.",
        "taskPrompt": "AX=8 yükleyin, AL'ye 7 ekleyin ve AAA komutunu çalıştırarak AX=0105h olmasını sağlayın.",
        "starterCode": "ORG 100h\nMOV AX, 8\nADD AL, 7\n; AAA komutunu çalıştırarak sonucu paketlenmemiş BCD'ye dönüştürün\nHLT",
        "solutionCode": "ORG 100h\nMOV AX, 8\nADD AL, 7\nAAA\nHLT",
        "hints": [
          "ADD AL, 7 sonucunda AL = 0Fh olur.",
          "AAA alt nipele 6 ekler (0Fh + 6 = 15h), AL=05h yapar ve AH=01h artırır."
        ],
        "assertions": {
          "registers": {
            "ax": 261,
            "ah": 1,
            "al": 5
          }
        },
        "examTip": "AAA komutu toplama sonrası onlar basamağını AH'ye taşır."
      }
    },
    {
      "id": "sub-12-3-ascii-binary-conversion-lab",
      "number": "12.3",
      "title": "Çok Duyarlıklı (Multi-Precision) Toplama, Çıkarma ve Dizi Akümülasyonu",
      "titleEn": "Multi-Byte BCD and ASCII Calculations in Assembly",
      "summary": "32-bit ve 64-bit çok kelimeli sayı dizilerinin döngü ile ADC yardımıyla toplanması, elde zinciri (carry propagation) ve maaş bordrosu birikimli toplam algoritması.",
      "summaryEn": "Writing complete multi-digit BCD addition loops, decimal accounting routines, digit string parsing, carry propagation across bytes, and converting between binary and formatted decimal strings.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Çok Duyarlıklı (Multi-Precision) Aritmetik Temelleri</h4>\n            <p>\n              16-bitlik bir mimaride 32-bit, 64-bit veya keyfi uzunluktaki büyük sayıların toplanması ve çıkarılması, \n              <strong>Elde Bayrağının (CF - Carry Flag)</strong> basamaklar arasında zincirlenmesi prensibine dayanır.\n            </p>\n            <ul>\n              <li><strong>En Düşük Anlamlı Kelime (Least Significant Word):</strong> Standart <code>ADD</code> veya <code>SUB</code> komutu ile işlenir. Oluşan elde veya borç $CF$ bayrağına yazılır.</li>\n              <li><strong>Yüksek Anlamlı Kelimeler (Higher Words):</strong> Sırasıyla <code>ADC</code> (Add with Carry) veya <code>SBB</code> (Subtract with Borrow) komutları ile toplanır/çıkarılır; böylece alt basamaktan taşan elde hiçbir veri kaybı olmadan üst basamağa dahil edilir.</li>\n            </ul>\n\n            <div class=\"nb-code-box\">\n              <span class=\"nb-code-label\">32-Bit Toplama ve Çıkarma Şablonu</span>\n<pre><code>; Sayı 1: DX:AX (High:Low)\n; Sayı 2: BX:CX (High:Low)\n; Toplam: DX:AX\nADD AX, CX      ; Düşük 16 bit toplanır, taşarsa CF = 1 olur\nADC DX, BX      ; Yüksek 16 bit toplanır ve önceki toplamanın eldesi (CF) eklenir\n\n; Çıkarma: DX:AX - BX:CX -> DX:AX\nSUB AX, CX      ; Düşük 16 bit çıkarılır, gerekirse CF borçlanır\nSBB DX, BX      ; Yüksek 16 bit çıkarılır ve CF borcu düşülür</code></pre>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Bellekteki Çok Kelimeli Dizi Toplama Rutini (Maaş Bordrosu Algoritması)</h4>\n            <p>\n              Ders notlarında (Week 11) incelenen çalışan ücretlerinin toplamını hesaplayan birikimli toplam algoritmasında, \n              dizideki 16-bitlik kelimeler toplanırken toplamın 16 biti aşması durumunda elde <code>ADC DX, 0</code> ile \n              yüksek anlamlı kelimede biriktirilir.\n            </p>\n\n            <div class=\"nb-code-box\">\n              <span class=\"nb-code-label\">Dizi Toplama ve 32-Bit Akümülasyon Döngüsü</span>\n<pre><code>ORG 100h\nLEA SI, SAYILAR     ; Dizinin başlangıç adresi\nMOV CX, 5           ; Toplanacak kelime sayısı\nXOR AX, AX          ; Toplamın düşük 16 biti (Low Word)\nXOR DX, DX          ; Toplamın yüksek 16 biti (High Word / Elde biriktirici)\n\nTOPLAMA_DONGUSU:\n    ADD AX, [SI]    ; Sıradaki 16-bit kelimeyi toplama ekle\n    ADC DX, 0       ; Toplama 16 biti aştıysa eldeyi DX'e taşı (DX = DX + 0 + CF)\n    ADD SI, 2       ; Bir sonraki kelimeye geç (Word = 2 bayt)\n    LOOP TOPLAMA_DONGUSU\n\n; Sonuç: DX:AX 32-bitlik toplam değerini içerir\nHLT\n\nSAYILAR DW 27345, 28521, 29533, 30105, 32375</code></pre>\n            </div>\n\n            <div class=\"nb-callout nb-callout-warning\" style=\"margin-top: 14px;\">\n              <h5>⚡ Kritik Mimari Nüans: Neden ADC Komutu ADD SI, 2'den Önce Gelmelidir?</h5>\n              <p>\n                Yukarıdaki döngüde <code>ADC DX, 0</code> komutu mutlaka <code>ADD SI, 2</code> komutundan \n                <strong>ÖNCE</strong> yürütülmelidir!\n                <br>\n                Çünkü <code>ADD SI, 2</code> komutu ALU durum bayraklarını (ve dolayısıyla <strong>CF</strong> bayrağını) günceller. \n                Eğer <code>ADD SI, 2</code> önce çalıştırılsaydı, dizideki sayının eklenmesinden doğan elde ($CF$) kaybolurdu!\n                <br>\n                <em>Alternatif Çözüm:</em> Adres ilerletme için <code>INC SI</code> / <code>INC SI</code> kullanılsaydı, \n                <code>INC</code> komutu <strong>CF bayrağını koruduğu için</strong> yerleşimi serbest olurdu!\n              </p>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 5: Arithmetic & Logic — Multi-Precision Calculations</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Multi-Byte and Multi-Precision Calculations</h4>\n            <p>\n              When working with large numeric values or decimal strings:\n            </p>\n            <ul>\n              <li><strong>Lowest Word:</strong> Computed using <code>ADD</code> or <code>SUB</code>, setting the Carry Flag ($CF$).</li>\n              <li><strong>Higher Words:</strong> Computed in a counted loop using <code>ADC</code> (Add with Carry) or <code>SBB</code> (Subtract with Borrow), propagating the carry forward across multi-word arrays.</li>\n              <li><strong>Decimal Financial Accounting:</strong> Strings of packed BCD digits are accumulated byte-by-byte using <code>ADC</code> followed by <code>DAA</code> to maintain exact cent-accurate decimal balances without floating-point rounding errors.</li>\n            </ul>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-9-3",
        "question": "Bir 16-bit kelime dizisi toplanırken `ADD AX, [SI]` komutundan hemen sonra neden `ADC DX, 0` komutu çalıştırılmalıdır?",
        "options": [
          "DX yazmacını sıfırlamak için",
          "ADD AX, [SI] işleminden doğan Carry Flag (CF) elde değerini yüksek kelimeye (DX) aktararak 32-bitlik akümülasyon sağlamak için",
          "Döngü sayacı CX'i bir azaltmak için",
          "Yürütme Birimi'nin (EU) donanım saatini senkronize etmek için"
        ],
        "correctIndex": 1,
        "explanation": "Dizideki kelimeler toplandıkça AX yazmacı 65535 değerini aşabilir. ADC DX, 0 komutu, AX toplamından doğan eldeyi (CF) DX yazmacına ekleyerek DX:AX çifti üzerinde veri kaybı yaşanmadan 32-bitlik birikimli toplam sağlar."
      },
      "task": {
        "id": "task-9-3-multiprecision-salary",
        "title": "32-Bit Birikimli Dizi Toplamı (Maaş Bordrosu Algoritması)",
        "difficulty": "Zor",
        "scenario": "MAASLAR adında 4 kelimelik (Word) bir veri dizisi bulunmaktadır: 10000, 20000, 30000, 15000. Bu dizinin toplamı 75000 ondalık değerindedir (Hex: 000124F8h). 16-bitlik AX sınırını aştığı için toplam DX:AX yazmaç çiftinde biriktirilmelidir.",
        "taskPrompt": "SI ile MAASLAR dizisini işaretleyin, CX=4 sayacını kurun, AX ve DX yazmaçlarını sıfırlayın. Bir döngü kurarak her adımda ADD AX, [SI], ardından ADC DX, 0 ve ADD SI, 2 komutlarını çalıştırın. Program sonunda DX=0001h ve AX=24F8h olmalıdır.",
        "starterCode": "ORG 100h\nLEA SI, MAASLAR\nMOV CX, 4\nXOR AX, AX\nXOR DX, DX\n; Bir döngü ile MAASLAR dizisindeki 4 kelimeyi toplayıp\n; 32-bit toplamı DX:AX içinde biriktirin\nHLT\nMAASLAR DW 10000, 20000, 30000, 15000",
        "solutionCode": "ORG 100h\nLEA SI, MAASLAR\nMOV CX, 4\nXOR AX, AX\nXOR DX, DX\nTOPLA:\nADD AX, [SI]\nADC DX, 0\nADD SI, 2\nLOOP TOPLA\nHLT\nMAASLAR DW 10000, 20000, 30000, 15000",
        "hints": [
          "Döngü gövdesinde sırasıyla ADD AX, [SI] ve ADC DX, 0 yapın.",
          "Ardından ADD SI, 2 ile bir sonraki kelimeye geçip LOOP TOPLA komutunu çalıştırın.",
          "75000 ondalık sayısı = 1 * 65536 + 9464 = 0001h : 24F8h değerine karşılık gelir."
        ],
        "assertions": {
          "registers": {
            "ax": 9464,
            "dx": 1
          }
        },
        "examTip": "ADC DX, 0 komutu, ADD SI, 2'den önce gelmelidir; çünkü ADD SI, 2 elde bayrağını bozar."
      }
    }
  ],
  "mindMap": {
    "x": 18,
    "y": 64,
    "connections": [
      "topic-13-interrupts-and-ivt"
    ]
  }
};
