import { MainTopic } from '../studyData.js';

export const TOPIC_10: MainTopic = {
  "id": "topic-10-gecen-yil-stack-and-arrays-lab",
  "number": 10,
  "category": "secondary",
  "weekLabel": "Geçen Yıl",
  "title": "10. Modül (Geçen Yıl): Yığın (Stack) Çerçeveleri, Uzak İşaretçiler ve Dizi İndeksleme",
  "titleEn": "Last Year Module 10: Stack Frames, Far Pointers (LDS/LES) & Array Indexing Labs",
  "shortTitle": "Geçen Yıl: Yığın & Diziler",
  "shortTitleEn": "Archive: Stack & Arrays",
  "badge": "MODÜL 10 • GEÇEN YIL",
  "badgeEn": "ARCHIVE • STACK & ARRAYS",
  "icon": "📚",
  "summary": "Geçen yılın veri yapıları laboratuvarları: PUSH/POP ile dizi ters çevirme, LEA/LDS/LES/LAHF/SAHF işaretçi yükleme ve 1D/2D dizi indeksleme algoritmaları.",
  "summaryEn": "Archive data structure labs: Stack LIFO reversal with PUSH/POP, pointer loading with LEA/LDS/LES/LAHF/SAHF, and 1D/2D array indexing.",
  "opcodes": [
    "PUSH",
    "POP",
    "LEA",
    "LDS",
    "LES",
    "LAHF",
    "SAHF",
    "MOV"
  ],
  "subLessons": [
    {
      "id": "sub-10-1-stack-lifo-lab",
      "number": "10.1",
      "title": "Yığın (Stack) Mimarisi (LIFO): PUSH, POP, PUSHA/POPA ve PUSHF/POPF",
      "titleEn": "Stack Instructions In Depth: PUSH, POP, PUSHA, POPA, PUSHF, POPF",
      "summary": "SS:SP çalışma dinamiği, yığının küçük adreslere doğru (aşağıya) büyümesi, PUSH ve POP mikro-adımları, 8-bit PUSH AL ve POP CS donanımsal yasakları, Toplu yazmaç saklama (PUSHA/POPA) ve PUSHF/POPF kritik kesme koruma kalıbı.",
      "summaryEn": "Full stack instruction set: 16-bit operand rule, PUSHA/POPA register order (AX, CX, DX, BX, SP, BP, SI, DI), skipping SP on POPA to protect stack integrity, and PUSHF/POPF flags manipulation.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Yığın (Stack) Bellek Mimarisi ve LIFO Mekanizması</h4>\n            <p>\n              Yığın belleği, mikroişlemcinin geçici verilerini, alt yordam dönüş adreslerini ve bayrak durumlarını saklamak amacıyla kullandığı dinamik bellek alanıdır.\n              8086 yığın mimarisi <strong>LIFO (Last-In, First-Out - Son Giren İlk Çıkar)</strong> kuralını benimser.\n            </p>\n\n            <div class=\"nb-code-box\">\nFiziksel Adres Formülü:\nPA_stack = (SS * 16) + SP\n\n   Yüksek Adresler  ┌────────────────────────────────────┐\n                    │      Yığın Tabanı (Stack Base)     │\n                    ├────────────────────────────────────┤\n                    │   Önceden Saklanmış Kelimeler      │\n                    ├────────────────────────────────────┤ ◄── SP = 0100h (Önceki Yığın Tepesi)\n       BÜYÜME       │  [Yeni Veri Düşük Bayt] (SP-2)     │\n       YÖNÜ         │  [Yeni Veri Yüksek Bayt] (SP-1)    │\n         │          ├────────────────────────────────────┤ ◄── SP = 00FEh (Yeni Yığın Tepesi: SP-2)\n         ▼          │   Kullanılmamış Boş Yığın Alanı    │\n   Düşük Adresler   └────────────────────────────────────┘\n            </div>\n\n            <p style=\"margin-top: 10px;\">\n              Yığın mimarisinin en ayırt edici özelliği <strong>ters yönde (yüksek adreslerden düşük adreslere doğru)</strong> büyümesidir:\n              Veri eklendikçe <code>SP</code> azalır; veri çekildikçe <code>SP</code> artar.\n            </p>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. PUSH ve POP Komutlarının Donanımsal Mikro-Adımları</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>📥 PUSH source16 Mikro-Adımları</h5>\n                <ol>\n                  <li>Yığın işaretçisi 2 azaltılır:\n                    $$SP \\leftarrow SP - 2$$\n                  </li>\n                  <li>16-bitlik veri yeni <code>SS:SP</code> adresine Little-Endian düzeninde yazılır:\n                    $$\\text{Memory}[SS:SP] \\leftarrow \\text{Data16}$$\n                  </li>\n                </ol>\n                <div class=\"nb-callout warning\">\n                  ⚠️ <strong>8-Bit PUSH Yapılamaz:</strong> Yığın 16-bit kelime tabanlıdır. <code>PUSH AL</code> sentaks hatasıdır! Tüm yazmaç (<code>PUSH AX</code>) atılmalıdır.\n                </div>\n              </div>\n\n              <div class=\"nb-card\">\n                <h5>📤 POP destination16 Mikro-Adımları</h5>\n                <ol>\n                  <li><code>SS:SP</code> adresindeki 16-bitlik kelime okunur:\n                    $$\\text{Data16} \\leftarrow \\text{Memory}[SS:SP]$$\n                  </li>\n                  <li>Yığın işaretçisi 2 artırılır:\n                    $$SP \\leftarrow SP + 2$$\n                  </li>\n                </ol>\n                <div class=\"nb-callout warning\">\n                  ⚠️ <strong>POP CS Komutu Yoktur:</strong> Yığından rastgele bir segment çekilip kod segmentine yüklenmesi sistemi çökerteceği için donanımsal olarak yasaktır. CS yalnızca <code>RET FAR</code> veya <code>IRET</code> ile güncellenir.\n                </div>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">3. Toplu Yığın Komutları (PUSHA, POPA, PUSHF, POPF)</h4>\n            <div class=\"nb-table-wrapper\">\n              <table class=\"nb-table\">\n                <thead>\n                  <tr>\n                    <th>Komut</th>\n                    <th>İşlem Sırası ve Mekanizma</th>\n                    <th>Tüketilen Bayt</th>\n                    <th>Temel Kullanım Amacı</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  <tr>\n                    <td><strong>PUSHA (80186+)</strong></td>\n                    <td>Sırasıyla: <code>AX, CX, DX, BX, Temp SP, BP, SI, DI</code> yığına atılır.</td>\n                    <td>16 Bayt</td>\n                    <td>Alt yordama girerken tüm genel yazmaçları tek komutta koruma.</td>\n                  </tr>\n                  <tr>\n                    <td><strong>POPA (80186+)</strong></td>\n                    <td>Sırasıyla: <code>DI, SI, BP, [SP atlanır], BX, DX, CX, AX</code> yığından çekilir.</td>\n                    <td>16 Bayt</td>\n                    <td>Alt yordamdan çıkarken genel yazmaçları geri yükleme.</td>\n                  </tr>\n                  <tr>\n                    <td><strong>PUSHF</strong></td>\n                    <td>16-bitlik <code>FLAGS</code> yazmacını yığına kaydeder ($SP \\leftarrow SP - 2$).</td>\n                    <td>2 Bayt</td>\n                    <td>Kritik bölgeye girerken kesme bayrağı (IF) ve durum bayraklarını saklama.</td>\n                  </tr>\n                  <tr>\n                    <td><strong>POPF</strong></td>\n                    <td>Yığından 16-bit kelimeyi çekip doğrudan <code>FLAGS</code> yazmacına yazar ($SP \\leftarrow SP + 2$).</td>\n                    <td>2 Bayt</td>\n                    <td>Kritik bölgeden çıkışta bayrakları eski haline getirme.</td>\n                  </tr>\n                </tbody>\n              </table>\n            </div>\n\n            <div class=\"nb-callout tip\" style=\"margin-top: 12px;\">\n              💡 <strong>POPA'daki SP Atlama Mekanizması:</strong> POPA yığındaki SP değerini doğrudan SP yazmacına yazmaz;\n              çünkü yazsaydı sonraki yazmaçları çekecek yığın işaretçisi bozulurdu. Bunun yerine yığındaki eski SP alanını 2 bayt atlayarak geçer ($SP \\leftarrow SP + 2$).\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">4. Çalışan 8086 Assembly Kod Örneği</h4>\n            <pre class=\"nb-code-sample\"><code>ORG 100h\n; LIFO ile Değer Takası:\nMOV AX, 1111h\nMOV BX, 2222h\nMOV CX, 3333h\n\nPUSH AX             ; 1. AX yığına girdi (en altta)\nPUSH BX             ; 2. BX yığına girdi\nPUSH CX             ; 3. CX yığına girdi (en üstte)\n\nPOP AX              ; En üstteki CX (3333h) AX içine çekilir\nPOP BX              ; Ortadaki BX (2222h) BX içine çekilir\nPOP CX              ; En alttaki AX (1111h) CX içine çekilir\n; Sonuç: AX=3333h, BX=2222h, CX=1111h (Tam tersine döndü!)\n\nHLT</code></pre>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 4: Data Movement Instructions (Slides 17–22)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Stack Instructions, In Depth</h4>\n            <p>\n              The stack operates on a LIFO basis using <code>SS:SP</code>. Stack instructions on 8086 strictly require 16-bit word operands:\n            </p>\n            <ul>\n              <li><code>PUSH reg16 / mem16</code>: Decrements SP by 2, writes 16-bit word at <code>SS:SP</code>. Pushing an 8-bit byte (e.g. <code>PUSH AL</code>) is strictly illegal.</li>\n              <li><code>POP reg16 / mem16</code>: Reads 16-bit word from <code>SS:SP</code>, increments SP by 2. <code>POP CS</code> is strictly illegal.</li>\n            </ul>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. PUSHA, POPA, PUSHF, and POPF</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>PUSHA (Push All General Registers)</h5>\n                <p>Pushes 8 general registers in fixed sequence: <code>AX</code>, <code>CX</code>, <code>DX</code>, <code>BX</code>, original <code>SP</code>, <code>BP</code>, <code>SI</code>, <code>DI</code> (occupies 16 stack bytes).</p>\n              </div>\n              <div class=\"nb-card\">\n                <h5>POPA (Pop All General Registers)</h5>\n                <p>Restores registers in exact reverse order: <code>DI</code>, <code>SI</code>, <code>BP</code>, <strong>skips original SP without writing it to SP</strong>, <code>BX</code>, <code>DX</code>, <code>CX</code>, <code>AX</code>. Discarding the SP slot prevents stack pointer corruption.</p>\n              </div>\n            </div>\n            <p>\n              <code>PUSHF</code> and <code>POPF</code> push and pop the 16-bit FLAGS register, enabling subroutines and interrupt service routines to preserve the complete processor status.\n            </p>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-6-2",
        "question": "8086 mimarisinde 16-bitlik bir PUSH AX komutu çalıştırıldığında SP (Stack Pointer) yazmacında ne gerçekleşir?",
        "options": [
          "SP yazmacı 2 artırılır (SP = SP + 2)",
          "SP yazmacı 2 azaltılır (SP = SP - 2)",
          "SP yazmacı 1 azaltılır (SP = SP - 1)",
          "SP yazmacı değişmez"
        ],
        "correctIndex": 1,
        "explanation": "x86 mimarisinde yığın yüksek bellek adreslerinden düşük adreslere doğru büyür. PUSH yapıldığında önce SP 2 azaltılır, ardından veri [SS:SP] adresine yazılır."
      },
      "task": {
        "id": "task-6-2-stack-reverse",
        "title": "Yığın (Stack) Üzerinden Değerleri Tersine Çevirme",
        "difficulty": "Orta",
        "scenario": "AX=1111h, BX=2222h, CX=3333h olsun. Yığına sırasıyla PUSH AX, PUSH BX, PUSH CX yapın. Ardından LIFO (Son Giren İlk Çıkar) kuralını kullanarak POP komutlarıyla AX=3333h, BX=2222h, CX=1111h olmasını sağlayın.",
        "taskPrompt": "AX=1111h, BX=2222h, CX=3333h yükleyin. Sırasıyla yığına atın. Ardından yığından sırayla AX, BX, CX yazmaçlarına geri çekerek değerleri tersine çevirin.",
        "starterCode": "; 6.2 Yığın ile Değerleri Ters Çevirme\nORG 100h\n\nMOV AX, 1111h\nMOV BX, 2222h\nMOV CX, 3333h\n\n; PUSH AX, BX, CX yapın:\n\n; POP AX, BX, CX yaparak değerleri tersine çevirin:\n\n\nHLT\n",
        "solutionCode": "ORG 100h\nMOV AX, 1111h\nMOV BX, 2222h\nMOV CX, 3333h\nPUSH AX\nPUSH BX\nPUSH CX\nPOP AX\nPOP BX\nPOP CX\nHLT\n",
        "hints": [
          "En son atılan CX ilk olarak POP AX ile AX içine girer.",
          "Ortadaki BX yine POP BX ile BX içine girer.",
          "İlk atılan AX ise en son POP CX ile CX içine girer."
        ],
        "assertions": {
          "registers": {
            "ax": 13107,
            "bx": 8738,
            "cx": 4369
          },
          "maxSteps": 50
        },
        "examTip": "LIFO kuralı gereğince yığına atılan sıra A, B, C ise yığından çekilen sıra C, B, A olur."
      }
    },
    {
      "id": "sub-10-2-lea-lds-les-lab",
      "number": "10.2",
      "title": "Yığın Çerçevesi (Stack Frame), İşaretçiler (LEA, LDS, LES) ve Boyut Genişletme",
      "titleEn": "Data Conversion Instructions: CBW, CWD, MOVSX, and MOVZX",
      "summary": "Standart Yığın Çerçevesi (Stack Frame / Activation Record: BP tabanı, [BP+4]/[BP+6] parametreler, [BP-2]/[BP-4] yerel değişkenler, Prologue ve Epilogue), LEA dinamik efektif adres hesaplama vs MOV OFFSET derleme zamanı sabiti, 32-bit uzak gösterici yükleyicileri (LDS, LES, LSS), İşaretli boyut genişletme (CBW, CWD, CWDE, CDQ, MOVSX, MOVZX) ve LAHF / SAHF bayrak aktarımları.",
      "summaryEn": "Arithmetic sign extension: CBW (AL to AX), CWD (AX to DX:AX), CWDE, CDQ, MOVSX (signed extension to larger register), MOVZX (zero extension to larger register), and LAHF/SAHF.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Standart Yığın Çerçevesi (Stack Frame / Activation Record)</h4>\n            <p>\n              Yüksek seviyeli dillerde (C/C++, Pascal) bir fonksiyon çağrıldığında parametreler ve yerel değişkenler yığın üzerinde\n              <strong>Yığın Çerçevesi (Stack Frame)</strong> adı verilen düzenli bir blokta organize edilir. Taban referansı olarak\n              <code>BP (Base Pointer)</code> kullanılır; çünkü <code>BP</code> varsayılan olarak <code>SS</code> segmentiyle eşleşir.\n            </p>\n\n            <div class=\"nb-code-box\">\n                ┌──────────────────────────────────────┐\n   [BP + 6]     │        Parametre 2 (arg2)            │\n                ├──────────────────────────────────────┤\n   [BP + 4]     │        Parametre 1 (arg1)            │\n                ├──────────────────────────────────────┤\n   [BP + 2]     │        Dönüş Adresi (Return IP)      │\n                ├──────────────────────────────────────┤ ◄── BP (Eski BP'nin saklandığı yer)\n   [BP - 2]     │        Yerel Değişken 1 (var1)       │\n                ├──────────────────────────────────────┤\n   [BP - 4]     │        Yerel Değişken 2 (var2)       │\n                ├──────────────────────────────────────┤ ◄── SP (Yığının o anki tepesi)\n            </div>\n\n            <div class=\"nb-grid-2\" style=\"margin-top: 10px;\">\n              <div class=\"nb-card\">\n                <h5>Standart Fonksiyon Girişi (Prologue)</h5>\n                <pre class=\"nb-code-sample\"><code>PUSH BP        ; 1. Çağıranın BP'sini sakla\nMOV BP, SP     ; 2. Yığın tepesini yeni taban yap\nSUB SP, 4      ; 3. Yerel değişkenlere yer aç</code></pre>\n                <p>Parametreler <code>[BP+4], [BP+6]</code>; yerel değişkenler <code>[BP-2], [BP-4]</code> ile okunur.</p>\n              </div>\n\n              <div class=\"nb-card\">\n                <h5>Standart Fonksiyon Çıkışı (Epilogue)</h5>\n                <pre class=\"nb-code-sample\"><code>MOV SP, BP     ; 1. Yerel değişkenleri temizle\nPOP BP         ; 2. Çağıranın BP'sini geri yükle\nRET 4          ; 3. Dön ve 4 bayt parametreyi at</code></pre>\n                <p><code>RET n</code> komutu hem fonksiyon dönüşünü yapar hem de yığındaki parametreleri temizler.</p>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Bellek İşaretçi Komutları: LEA vs MOV OFFSET, LDS, LES, LSS</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>LEA (Load Effective Address) Komutu</h5>\n                <p>\n                  <code>LEA reg16, mem</code> hedef yazmaca bellek işleneninin <strong>Efektif Adresini (Offset)</strong> hesaplayarak yükler.\n                  Bellek içeriğine dokunmaz ve FLAGS bayraklarını DEĞİŞTİRMEZ!\n                </p>\n                <p>\n                  <code>LEA BX, [SI+4]</code> çalışma anında dinamik formülü çözerken, <code>MOV BX, OFFSET TABLO</code> yalnızca derleme anındaki statik etiketin ofsetini alabilir.\n                </p>\n                <div class=\"nb-callout tip\">\n                  💡 <strong>Hızlı Aritmetik Numarası:</strong><br>\n                  <code>LEA AX, [BX+BX]</code> &rarr; $AX = BX \\times 2$ (Bayrakları bozmadan hızlı çarpma!)\n                </div>\n              </div>\n\n              <div class=\"nb-card\">\n                <h5>32-Bit Uzak İşaretçi Yükleyicileri (LDS, LES, LSS)</h5>\n                <p>Uzak işaretçiler (Far Pointer) 4 bayttır (16-bit ofset + 16-bit segment):</p>\n                <ul>\n                  <li><code>LDS reg16, mem32</code>: Ofseti <code>reg16</code>'ya, segmenti <code>DS</code>'ye yükler.</li>\n                  <li><code>LES reg16, mem32</code>: Ofseti <code>reg16</code>'ya, segmenti <code>ES</code>'ye yükler.</li>\n                  <li><code>LSS SP, mem32 (80386+)</code>: Yığın ofsetini ve segmentini kesintisiz tek çevrimde yükler.</li>\n                </ul>\n                <p>Bellekte Little-Endian: İlk kelime ofsettir, ikinci kelime segmenttir.</p>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">3. Boyut Genişletme (CBW, CWD, MOVSX, MOVZX) ve Bayrak Aktarımları</h4>\n            <div class=\"nb-table-wrapper\">\n              <table class=\"nb-table\">\n                <thead>\n                  <tr>\n                    <th>Komut</th>\n                    <th>Kaynak &rarr; Hedef</th>\n                    <th>Çalışma Mantığı</th>\n                    <th>Kritik Kullanım Alanı</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  <tr>\n                    <td><strong>CBW</strong></td>\n                    <td><code>AL &rarr; AX</code></td>\n                    <td>AL bit 7=1 ise AH=FFh, 0 ise AH=00h yapar.</td>\n                    <td>8-bit işaretli sayıyı 16-bit yapma.</td>\n                  </tr>\n                  <tr>\n                    <td><strong>CWD</strong></td>\n                    <td><code>AX &rarr; DX:AX</code></td>\n                    <td>AX bit 15=1 ise DX=FFFFh, 0 ise DX=0000h yapar.</td>\n                    <td>16-bit işaretli bölme (<code>IDIV</code>) öncesi zorunludur!</td>\n                  </tr>\n                  <tr>\n                    <td><strong>MOVSX (80386+)</strong></td>\n                    <td><code>reg/mem &rarr; reg</code></td>\n                    <td>İşaret bitini koruyarak genişletir.</td>\n                    <td>Genel amaçlı işaretli genişletme.</td>\n                  </tr>\n                  <tr>\n                    <td><strong>MOVZX (80386+)</strong></td>\n                    <td><code>reg/mem &rarr; reg</code></td>\n                    <td>Üst bitleri sıfırla doldurur.</td>\n                    <td>İşaretsiz sayıları genişletme.</td>\n                  </tr>\n                  <tr>\n                    <td><strong>LAHF / SAHF</strong></td>\n                    <td><code>FLAGS &harr; AH</code></td>\n                    <td>Durum bayraklarını AH'ye aktarır veya AH'den yazar.</td>\n                    <td>8080 uyumluluğu ve 8087 FPU karşılaştırma sonuçları aktarımı.</td>\n                  </tr>\n                </tbody>\n              </table>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 4: Data Movement Instructions (Slides 30–34)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Conversion and Sign-Extension Instructions</h4>\n            <p>\n              When working with mixed signed and unsigned data widths, specialized conversion instructions preserve numerical integrity:\n            </p>\n            <ul>\n              <li><strong>CBW (Convert Byte to Word):</strong> Extends sign bit of AL into all bits of AH, converting an 8-bit signed integer into a 16-bit signed integer in AX.</li>\n              <li><strong>CWD (Convert Word to Doubleword):</strong> Extends sign bit of AX into DX, producing a 32-bit signed dividend in DX:AX before executing <code>IDIV</code>.</li>\n              <li><strong>MOVSX (Move with Sign-Extend):</strong> Copies an 8-bit or 16-bit signed value into a larger 16-bit or 32-bit register, replicating the sign bit throughout the destination.</li>\n              <li><strong>MOVZX (Move with Zero-Extend):</strong> Copies an unsigned byte/word into a larger register, padding the upper bits with zeros.</li>\n            </ul>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Flag Transfers: LAHF and SAHF</h4>\n            <p>\n              <code>LAHF</code> (Load AH from Flags) copies the low byte of the FLAGS register (SF, ZF, AF, PF, CF) into AH. <code>SAHF</code> (Store AH into Flags) transfers the bits in AH back into the FLAGS register. This mechanism maintains compatibility with older 8080/8085 code.\n            </p>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-6-3",
        "question": "LEA BX, [SI+4] komutu ile MOV BX, OFFSET TABLO komutu arasındaki en temel mimari fark nedir?",
        "options": [
          "LEA çalışma zamanında dinamik yazmaç toplamlarını çözer; MOV OFFSET derleme zamanında statik etiketin ofsetini alır",
          "LEA bayrak yazmacını değiştirir, MOV değiştirmez",
          "LEA yalnızca segment yazmaçlarına yükleme yapabilir",
          "İki komut arasında hiçbir fark yoktur"
        ],
        "correctIndex": 0,
        "explanation": "LEA işlemcinin donanımsal adres toplayıcısını kullanarak çalışma anında [SI+4] gibi dinamik formülleri hesaplar; MOV OFFSET ise derleme anında sabit olan etiket ofsetini komuta gömer."
      },
      "task": {
        "id": "task-6-3-cbw-sign-ext",
        "title": "CBW ile İşaretli Sayıyı 16-Bite Genişletme",
        "difficulty": "Kolay",
        "scenario": "AL yazmacına 8-bitlik negatif bir sayı olan 0FEh (-2 onluk) yükleyin. CBW komutu kullanarak sayıyı 16-bitlik AX yazmacına işaretli olarak genişletin (AX = 0xFFFE olmalıdır).",
        "taskPrompt": "AL yazmacına 0FEh yükleyin. CBW komutunu çalıştırın. AX yazmacının 0xFFFE olduğunu doğrulayın ve programı HLT ile sonlandırın.",
        "starterCode": "; 6.3 CBW ile İşaret Genişletme\nORG 100h\n\nMOV AL, 0FEh    ; -2 (8-bit)\n\n; CBW komutunu çalıştırın:\n\n\nHLT\n",
        "solutionCode": "ORG 100h\nMOV AL, 0FEh\nCBW\nHLT\n",
        "hints": [
          "CBW (Convert Byte to Word) komutunu yazın.",
          "AL nin en anlamlı biti 1 olduğu için AH = 0xFF yapılır."
        ],
        "assertions": {
          "registers": {
            "ax": 65534,
            "al": 254,
            "ah": 255
          },
          "maxSteps": 50
        },
        "examTip": "CBW komutu AL deki işaret bitini AH ye yayar. Sayı pozitifse AH=00h, negatifse AH=FFh olur."
      }
    },
    {
      "id": "sub-10-3-array-indexing-lab",
      "number": "10.3",
      "title": "Tekrar Önekleri (REP, REPE, REPNE) ve Blok Bellek Doldurma",
      "titleEn": "The REP Prefix and Block Memory Copy (REP MOVS / REP STOS)",
      "summary": "CX sayacı ile donanımsal iç döngüler, REP (CX != 0 koşulsuz tekrar), REPE/REPZ (CX != 0 VE ZF == 1 eşitken tekrar), REPNE/REPNZ (CX != 0 VE ZF == 0 farklıyken tekrar), Döngü sonrasında ZF bayrağı testi ile çıkış nedenini saptama ve Yüksek hızlı 16-bit REP MOVSW memcpy algoritması.",
      "summaryEn": "Counted repetition using CX: REP (repeat while CX != 0), high-speed memory block copies (REP MOVSB/MOVSW), memory fill (REP STOSB/STOSW), and string search/compare (REPE/REPNE CMPSB/SCASB).",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Donanımsal Tekrar Önekleri (Repeat Prefixes)</h4>\n            <p>\n              String komutlarının önüne 1 baytlık bir <strong>Tekrar Öneki (Repeat Prefix)</strong> eklendiğinde,\n              işlemci komutu donanımsal bir iç döngü şeklinde <code>CX</code> sayacı sıfırlanana dek otomatik olarak yürütür:\n            </p>\n\n            <div class=\"nb-code-box\">\n┌─────────────────────────────────────────────────────────────┐\n│                       TEKRAR ÖNEKLERİ                       │\n│                                                             │\n│  1. REP            : Koşulsuz tekrar (CX != 0 iken)         │\n│  2. REPE  / REPZ   : Eşitken tekrar (CX != 0 VE ZF == 1)    │\n│  3. REPNE / REPNZ  : Eşit değilken tekrar (CX != 0 VE ZF==0)│\n└─────────────────────────────────────────────────────────────┘\n            </div>\n\n            <div class=\"nb-grid-2\" style=\"margin-top: 10px;\">\n              <div class=\"nb-card\">\n                <h5>1. REP (Repeat While CX &ne; 0)</h5>\n                <p>Koşulsuz tekrar önekidir. Genellikle <code>MOVSB/MOVSW</code> ve <code>STOSB/STOSW</code> komutlarıyla kullanılır:</p>\n                <ol>\n                  <li>$CX == 0$ ise döngüyü sonlandır.</li>\n                  <li>String komutunu yürüt.</li>\n                  <li>$CX \\leftarrow CX - 1$ yap ve 1. adıma dön.</li>\n                </ol>\n                <p>FLAGS bayraklarını doğrudan etkilemez.</p>\n              </div>\n\n              <div class=\"nb-card\">\n                <h5>2. REPE / REPZ & 3. REPNE / REPNZ</h5>\n                <p>Karşılaştırma komutları (<code>CMPSB</code> ve <code>SCASB</code>) ile kullanılır:</p>\n                <ul>\n                  <li><strong>REPE / REPZ:</strong> $CX \\neq 0$ VE $ZF = 1$ olduğu sürece devam eder. İki eleman farklı olduğunda ($ZF=0$) döngü anında kırılır.</li>\n                  <li><strong>REPNE / REPNZ:</strong> $CX \\neq 0$ VE $ZF = 0$ olduğu sürece devam eder. Aranan eleman bulunduğunda ($ZF=1$) döngü hemen durur.</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Döngü Çıkışında ZF Bayrağı Testi (Pedagojik İncelik)</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>REPE CMPSB Sonucu: Stringler Eşit mi?</h5>\n                <p><code>REPE CMPSB</code> döngüsü bittiğinde iki dize tam eşit miydi yoksa farklılık mı vardı?</p>\n                <ul>\n                  <li><strong>$ZF = 1$ ise:</strong> Dizeler incelenen tüm karakterler boyunca <strong>birbirine tamamen eşittir</strong> ($CX=0$ olana dek hiç fark çıkmamıştır).</li>\n                  <li><strong>$ZF = 0$ ise:</strong> İşlemci farklı iki karakterle karşılaşmış ve döngü erken kırılmıştır!</li>\n                </ul>\n                <p>Programcı döngü bitiminde hemen <code>JZ ESIT</code> veya <code>JNZ FARKLI</code> ile kontrol eder.</p>\n              </div>\n\n              <div class=\"nb-card\">\n                <h5>REPNE SCASB Sonucu: Karakter Bulundu mu?</h5>\n                <p><code>REPNE SCASB</code> döngüsü bittiğinde aranan karakter bulundu mu?</p>\n                <ul>\n                  <li><strong>$ZF = 1$ ise:</strong> Aranan karakter başarıyla <strong>BULUNMUŞTUR</strong>.</li>\n                  <li><strong>$ZF = 0$ ise:</strong> Dize boyunca aranan karakter <strong>BULUNAMAMIŞTIR</strong> ($CX=0$ olmuştur).</li>\n                </ul>\n                <p>Programcı <code>JZ BULUNDU</code> komutu ile sıçrama yapar.</p>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">3. Yüksek Hızlı Blok Bellek Kopyalama (Memcpy)</h4>\n            <p>\n              8086'nın 16-bit veri yolundan tam verim almak için blok kopyalamalarda bayt yerine kelime (Word) komutu olan <code>REP MOVSW</code> tercih edilir.\n              Bu sayede döngü sayısı yarıya iner ($CX = \\text{Bayt Sayısı} / 2$) ve donanımsal transfer 2 kat hızlanır:\n            </p>\n            <pre class=\"nb-code-sample\"><code>ORG 100h\n; 256 baytlık blok kopyalama (Memcpy):\nCLD                   ; İleri yön\nMOV CX, 128           ; 128 kelime = 256 bayt\nLEA SI, KAYNAK_BLOK   ; DS:SI\nLEA DI, HEDEF_BLOK    ; ES:DI\nREP MOVSW             ; 16-bit kelimelerle 2 kat hızlı donanımsal transfer!\nHLT</code></pre>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 4: Data Movement Instructions (Slides 26–29)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. The REP Prefix and Fast Block Transfers</h4>\n            <p>\n              The <code>REP</code> (Repeat) prefix executes the following string instruction repeatedly until the <code>CX</code> counter decrements to zero:\n            </p>\n            <ul>\n              <li><strong>REP MOVSB / MOVSW:</strong> Moves CX bytes/words from <code>[DS:SI]</code> to <code>[ES:DI]</code> at maximum hardware bus speed.</li>\n              <li><strong>REP STOSB / STOSW:</strong> Fills a memory buffer of CX bytes/words at <code>[ES:DI]</code> with the value in AL/AX.</li>\n              <li><strong>REPE / REPZ:</strong> Repeats comparison while <code>CX != 0</code> AND <code>ZF == 1</code> (elements match).</li>\n              <li><strong>REPNE / REPNZ:</strong> Repeats scan/compare while <code>CX != 0</code> AND <code>ZF == 0</code> (elements differ).</li>\n            </ul>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-7-2",
        "question": "Bir REPE CMPSB komut dizisi çalıştırıldıktan sonra, programcının iki stringin birbirine tamamen eşit olduğunu doğrulaması için hangi koşulu test etmesi gerekir?",
        "options": [
          "CX = 1 olması",
          "ZF = 1 (Zero Flag set) olması",
          "CF = 1 (Carry Flag set) olması",
          "DF = 1 (Direction Flag set) olması"
        ],
        "correctIndex": 1,
        "explanation": "REPE CMPSB komutu elemanlar eşitken (ZF=1) devam eder ve ya CX=0 olduğunda ya da farklı bir eleman bulunup ZF=0 olduğunda durur. Döngü çıkışında ZF hala 1 ise, incelenen tüm karakterler birbirine tamamen eşittir."
      },
      "task": {
        "id": "task-7-2-rep-stosb-block",
        "title": "REP STOSB ile Bellek Bloğunu Doldurma",
        "difficulty": "Orta",
        "scenario": "Bellekte 0200h adresinden itibaren 4 baytlık alanı REP STOSB kullanarak 0AAh değeriyle doldurmanız isteniyor.",
        "taskPrompt": "CLD çalıştırın. CX = 4, AL = 0AAh, DI = 0200h yapın. REP STOSB komutunu çalıştırın. Sonuçta CX = 0 ve DI = 0204h olduğunu doğrulayın.",
        "starterCode": "; 7.2 REP STOSB ile Blok Doldurma\nORG 100h\n\n; CLD ile ileri yönü seçin:\n; CX = 4, AL = 0AAh, DI = 0200h ayarlayın:\n; REP STOSB komutunu çalıştırın:\n\n\nHLT\n",
        "solutionCode": "ORG 100h\nCLD\nMOV CX, 4\nMOV AL, 0AAh\nMOV DI, 0200h\nREP STOSB\nHLT\n",
        "hints": [
          "CLD ardından MOV CX, 4, MOV AL, 0AAh, MOV DI, 0200h yazın.",
          "REP STOSB komutunu ekleyin.",
          "Döngü 4 kez çalışır; her adımda DI 1 artar ve CX 1 azalır."
        ],
        "assertions": {
          "registers": {
            "cx": 0,
            "al": 170,
            "di": 516
          },
          "maxSteps": 50
        },
        "examTip": "REP öneki CX=0 olana dek işlemi yineler. İşlem bitiminde CX daima 0 olur."
      }
    }
  ],
  "mindMap": {
    "x": 82,
    "y": 64,
    "connections": [
      "topic-11-gecen-yil-arithmetic-and-scas-lab"
    ]
  }
};
