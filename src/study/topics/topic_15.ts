import { MainTopic } from '../studyData.js';

export const TOPIC_15: MainTopic = {
  "id": "topic-15-advanced-architectures",
  "number": 15,
  "category": "secondary",
  "weekLabel": "Geçen Yıl",
  "title": "15. Modül (Geçen Yıl): İleri Mikroişlemci Mimarileri (RISC vs CISC, Superscalar ve Çok Çekirdek)",
  "titleEn": "Last Year Module 15: Advanced Architectures (RISC vs CISC, Superscalar & Multicore)",
  "shortTitle": "Geçen Yıl: İleri Mimariler",
  "shortTitleEn": "Archive: Advanced Arch",
  "badge": "MODÜL 15 • GEÇEN YIL",
  "badgeEn": "ARCHIVE • ADVANCED ARCH",
  "icon": "🚀",
  "summary": "Geçen yılın ileri bilgisayar mimarisi konuları (`w14a.pdf`, `w15a.pdf`): CISC vs RISC tasarım felsefeleri, Süperskaler yürütme (ILP, Out-of-Order, Register Renaming, Tomasulo) ve Çok Çekirdekli Sistemler (MESI, Amdahl Yasası).",
  "summaryEn": "Archive advanced architecture topics (`w14a.pdf`, `w15a.pdf`): CISC vs RISC design philosophies, Superscalar execution (ILP, Out-of-Order, Register Renaming), and Multicore Systems (MESI, Amdahl's Law).",
  "opcodes": [
    "MOV",
    "ADD",
    "SUB",
    "MUL",
    "CMP",
    "JMP"
  ],
  "subLessons": [
    {
      "id": "sub-15-1-cisc-vs-risc-architecture",
      "number": "15.1",
      "title": "Komut Boru Hattı (Pipelining) ve Tehlikeler (Hazards)",
      "titleEn": "Instruction Pipelining and Hazard Resolution",
      "summary": "5 Aşamalı Boru Hattı (IF, ID, EX, MEM, WB), Hızlanma modeli, Yapısal/Veri/Kontrol tehlikeleri, Veri İletme (Forwarding) ve 2-Bit Dinamik Dallanma Tahmini.",
      "summaryEn": "5-stage pipeline (IF, ID, EX, MEM, WB), ideal speedup formula, structural hazards, data hazards (RAW, WAR, WAW), data forwarding, branch penalty, and 2-bit dynamic branch prediction.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">Klasik 5-Aşamalı Komut Boru Hattı (5-Stage Pipeline)</h4>\n            <p>Boru hattı mimarisi, komutların icra aşamalarını montaj hattı gibi üst üste örtüştürerek işlem hacmini (Throughput) katlar:</p>\n            <ul>\n              <li><strong>1. IF (Instruction Fetch):</strong> PC/IP adresinden komut baytları çekilir ve komut yazmacına (IR) yüklenir.</li>\n              <li><strong>2. ID (Instruction Decode):</strong> İşlem kodu çözülür, kontrol sinyalleri üretilir ve kaynak yazmaçlar okunur.</li>\n              <li><strong>3. EX (Execute):</strong> ALU aritmetik/mantık işlemini yürütür veya bellek için efektif adresi hesaplar.</li>\n              <li><strong>4. MEM (Memory Access):</strong> Yalnızca Load ve Store komutlarında aktiftir; veri önbelleğinden okuma/yazma yapılır.</li>\n              <li><strong>5. WB (Write-Back):</strong> Hesaplanan sonuç hedef yazmaca fiziksel olarak geri yazılır.</li>\n            </ul>\n\n            <div class=\"nb-formula-box\">\n              $$S_k = \frac{n cdot k}{k + n - 1} qquad lim_{n \to infty} S_k = k quad (\text{5 Aşamada İdeal Azami Hızlanma: } 5\times)$$\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Boru Hattı Tehlikeleri (Pipeline Hazards) ve Çözüm Yolları</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>⚠️ Yapısal ve Veri Tehlikeleri (RAW / WAR / WAW)</h5>\n                <ul>\n                  <li><strong>Yapısal Tehlike (Structural):</strong> Aynı anda iki aşamanın aynı donanıma erişmek istemesi. <em>Çözüm:</em> Harvard Mimarisi (Ayrı I-Cache ve D-Cache).</li>\n                  <li><strong>RAW (Read After Write / True Dependency):</strong> Komut henüz yazılmamış sonucu okumak ister. <em>Çözüm:</em> Veri İletme (Data Forwarding / Bypassing).</li>\n                  <li><strong>Load-Use Gecikmesi:</strong> Bellekten veri okuma MEM aşamasında bittiğinden, iletmeye rağmen 1 çevrimlik duraklatma (Bubble) kaçınılmazdır.</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>🔀 Kontrol Tehlikeleri ve Dallanma Tahmini</h5>\n                <ul>\n                  <li><strong>Dallanma Cezası (Branch Penalty):</strong> Sıçrama kararı verilene kadar getirilen komutlar iptal edilir (Pipeline Flush).</li>\n                  <li><strong>Statik BTFN:</strong> Geriye sıçra (döngü), ileriye sıçrama (hata bloğu).</li>\n                  <li><strong>2-Bit Doygunluk Sayıcısı:</strong> 11 (Güçlü Alır), 10 (Zayıf Alır), 01 (Zayıf Almaz), 00 (Güçlü Almaz).</li>\n                  <li><strong>BTB (Branch Target Buffer):</strong> Sıçrama hedef adresini önbellekte saklar (0-çevrim gecikme).</li>\n                </ul>\n              </div>\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Boru Hattı Bağımsız İşlemler Örneği</h4>\n            <div class=\"nb-code-box\">\n              <pre><code>; Bağımsız İşlemler: RAW Veri Tehlikesi ve Stall Yaratmaz\nORG 100h\n    MOV AX, 10\n    MOV BX, 20\n    ADD AX, 5           ; AX üzerinde işlem (ALU 1)\n    SUB BX, 2           ; BX üzerinde bağımsız işlem (ALU 2) - Tam hızda paralel akar!\n    HLT</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 (Geçen Yıl / Previous Year) — w13a.pdf: Instruction Pipelining (Slides 2–18)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. The 5-Stage Instruction Pipeline</h4>\n            <p>\n              Instruction pipelining is a technique used in modern microprocessors to increase instruction throughput by overlapping the execution of multiple instructions:\n            </p>\n            <ol>\n              <li><strong>Fetch (IF):</strong> Retrieve instruction from memory using Program Counter (PC/IP).</li>\n              <li><strong>Decode (ID):</strong> Translate opcode into control signals and read source registers.</li>\n              <li><strong>Execute (EX):</strong> Perform ALU operations or calculate effective addresses.</li>\n              <li><strong>Memory Access (MEM):</strong> Access data memory for Load/Store operations.</li>\n              <li><strong>Write-Back (WB):</strong> Write the computed result back into destination register file.</li>\n            </ol>\n            <div class=\"nb-formula-box\">\n              $$\text{Speedup } S_k = \frac{n cdot k}{k + n - 1} \to k quad (\text{For a 5-stage pipeline, ideal speedup approaches } 5\times)$$\n            </div>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Pipeline Hazards and Mitigation Strategies</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>Structural and Data Hazards</h5>\n                <ul>\n                  <li><strong>Structural Hazard:</strong> Resource conflict when hardware cannot support multiple concurrent stages (e.g. single-port memory). Resolved by separate instruction and data caches (Harvard architecture).</li>\n                  <li><strong>Data Hazard (RAW - Read After Write):</strong> Instruction depends on the result of an earlier uncompleted instruction. Mitigated by <em>Data Forwarding (Bypassing)</em> from EX/MEM stages directly to ALU.</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>Control Hazards and Branch Prediction</h5>\n                <ul>\n                  <li><strong>Branch Penalty:</strong> Conditional jumps discard incorrectly fetched instructions upon misprediction, stalling the pipeline (pipeline flush).</li>\n                  <li><strong>Dynamic Branch Prediction:</strong> 2-bit saturating counters (Strongly Taken, Weakly Taken, Weakly Not Taken, Strongly Not Taken) achieve >90% branch accuracy.</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-15-1",
        "question": "Bir komutun üreteceği sonucu hemen ardından gelen bir sonraki komutun işlenen olarak okumak istemesi durumunda oluşan veri tehlikesi türü hangisidir?",
        "options": [
          "RAW (Read After Write / True Dependency)",
          "WAR (Write After Read)",
          "WAW (Write After Write)",
          "Yapısal Tehlike (Structural Hazard)"
        ],
        "correctIndex": 0,
        "explanation": "En sık rastlanan veri tehlikesi RAW (Yazdıktan Sonra Oku / True Dependency) durumudur; bir komutun ürettiği sonuç henüz yazmaca yazılmadan sonraki komut tarafından okunmak istenir."
      },
      "task": {
        "id": "task-15-1-pipeline-independent-ops",
        "title": "Boru Hattı Bağımsız İşlemler Sıralaması",
        "difficulty": "Orta",
        "scenario": "Boru hattı kabarcıklarını (stall) önlemek için bağımsız işlemleri yan yana dizin: AX'e 5 eklerken BX'ten 2 çıkarın.",
        "taskPrompt": "AX=10, BX=20 ilklendirin. ADD AX, 5 ve SUB BX, 2 komutlarını bağımsız olarak yürütün.",
        "starterCode": "ORG 100h\nMOV AX, 10\nMOV BX, 20\n; AX'e 5 ekleyin ve BX'ten 2 çıkarın\nHLT",
        "solutionCode": "ORG 100h\nMOV AX, 10\nMOV BX, 20\nADD AX, 5\nSUB BX, 2\nHLT",
        "hints": [
          "ADD AX, 5 komutunu yazın.",
          "SUB BX, 2 komutunu ekleyin."
        ],
        "assertions": {
          "registers": {
            "ax": 15,
            "bx": 18
          }
        },
        "examTip": "Bağımsız yazmaçlarla çalışan komutlar boru hattında veri tehlikesi (RAW) yaratmadan tam hızda akar."
      }
    },
    {
      "id": "sub-15-2-superscalar-and-ooo-execution",
      "number": "15.2",
      "title": "Bellek Hiyerarşisi, Önbellek Eşleme ve Yerellik İlkesi",
      "titleEn": "Cache Memory Architecture and the Memory Hierarchy",
      "summary": "7 Seviyeli Bellek Piramidi, Zamansal/Mekânsal Yerellik, Önbellek Adres Bölümleme (A = t + s + b), Doğrudan/K-Yollu/Tam İlişkili eşleme, 3 C ıskaları, Yazma politikaları ve AMAT formülü.",
      "summaryEn": "7-level memory pyramid, principles of temporal and spatial locality, cache address breakdown (Tag, Index, Offset), mapping techniques (direct, set-associative, fully associative), 3 C misses, and Average Memory Access Time (AMAT).",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">7-Katmanlı Bellek Hiyerarşisi Piramidi</h4>\n            <table class=\"nb-table\">\n              <thead>\n                <tr>\n                  <th>Katman</th>\n                  <th>Teknoloji</th>\n                  <th>Erişim Süresi</th>\n                  <th>Tipik Kapasite</th>\n                  <th>Yönetici</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr><td><strong>1. Yazmaçlar (Registers)</strong></td><td>Flip-Flop (Çok Portlu)</td><td>&lt; 1 ns (1 Çevrim)</td><td>&lt; 1 KB</td><td>Derleyici / Programcı</td></tr>\n                <tr><td><strong>2. L1 Cache</strong></td><td>SRAM (Çekirdek İçi)</td><td>1 - 2 ns (2-4 Çevrim)</td><td>32 - 64 KB</td><td>Donanımsal Denetleyici</td></tr>\n                <tr><td><strong>3. L2 Cache</strong></td><td>SRAM (Çekirdeğe Yakın)</td><td>3 - 10 ns (10-15 Çevrim)</td><td>256 KB - 1 MB</td><td>Donanımsal Denetleyici</td></tr>\n                <tr><td><strong>4. L3 Cache</strong></td><td>SRAM (Çekirdekler Ortak)</td><td>10 - 20 ns (30-50 Çevrim)</td><td>8 - 64 MB</td><td>Donanımsal Denetleyici</td></tr>\n                <tr><td><strong>5. Ana Bellek (RAM)</strong></td><td>DRAM (DDR4 / DDR5)</td><td>50 - 100 ns (100-200 Çevrim)</td><td>8 - 64 GB</td><td>İşletim Sistemi / Donanım</td></tr>\n                <tr><td><strong>6. İkincil Bellek (SSD)</strong></td><td>NAND Flash (NVMe)</td><td>10 - 100 µs</td><td>512 GB - 4 TB</td><td>İşletim Sistemi (Dosya Sis.)</td></tr>\n                <tr><td><strong>7. Manyetik Disk (HDD)</strong></td><td>Dönen Manyetik Plaka</td><td>5 - 10 ms</td><td>2 - 20 TB</td><td>İşletim Sistemi (Sanal Bellek)</td></tr>\n              </tbody>\n            </table>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Yerellik İlkesi ve Önbellek Adres Bölümleme Formülü</h4>\n            <p><strong>Zamansal Yerellik (Temporal):</strong> Yakın zamanda erişilen adrese (döngü, sayaç, yığın) tekrar erişilir. <strong>Mekânsal Yerellik (Spatial):</strong> Erişilen adresin fiziksel komşularına (dizi, ardışık kod) erişilir; bu nedenle veri <strong>64 baytlık bloklar (Cache Line)</strong> halinde getirilir.</p>\n\n            <div class=\"nb-formula-box\">\n              $$\text{Adres Genişliği } A = \text{Tag } (t) + \text{Index } (s) + \text{Offset } (b) qquad b = log_2(B), quad s = log_2(S), quad t = A - (s + b)$$\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Önbellek Eşleme, 3 C Iska Türleri ve Yazma Politikaları</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>🗺️ Eşleme Yöntemleri & 3 C Iska</h5>\n                <ul>\n                  <li><strong>Doğrudan Eşlemeli:</strong> Satır = Blok mod Satır_Sayısı (1 komparatör, yüksek çakışma).</li>\n                  <li><strong>K-Yollu Kümeli İlişkili:</strong> Küme = Blok mod Küme_Sayısı (K komparatör, modern CPU standardı).</li>\n                  <li><strong>Tam İlişkili:</strong> İndeks yok, CAM ile tüm satırlar taranır (TLB'de kullanılır).</li>\n                  <li><strong>3 C Iska:</strong> Zorunlu (Cold/Compulsory), Kapasite (Capacity), Çakışma (Conflict).</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>✍️ Yazma Politikaları & AMAT Formülü</h5>\n                <ul>\n                  <li><strong>Doğrudan Yazma (Write-Through):</strong> Hem önbelleğe hem RAM'e eşzamanlı yazar; veriyolu trafiği yüksektir.</li>\n                  <li><strong>Geriye Yazma (Write-Back):</strong> Yalnızca önbelleğe yazar, <em>Dirty Bit</em> kurar. RAM'e yalnızca blok atılırken yazar.</li>\n                  <li><strong>AMAT:</strong> $\text{Hit Time} + (\text{Miss Rate} \times \text{Miss Penalty})$</li>\n                  <li><em>Örnek:</em> $1\text{ ns} + (0.05 \times 50\text{ ns}) = 3.5\text{ ns}$.</li>\n                </ul>\n              </div>\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Mekânsal Yerellik ile Dizi İşleme Assembly Kodu</h4>\n            <div class=\"nb-code-box\">\n              <pre><code>; Mekânsal Yerellik Prensibi (Cache Line 64-Bayt Tek Seferde Gelir)\nORG 100h\n    MOV SI, 0200h       ; Ardışık bellek bloğu adresi\n    MOV AL, [SI]        ; İlk bayt okunurken tüm 64 baytlık blok L1 önbelleğe dolar!\n    ADD AL, [SI+1]      ; L1 Cache Hit (1 ns)!\n    ADD AL, [SI+2]      ; L1 Cache Hit (1 ns)!\n    HLT</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 (Geçen Yıl / Previous Year) — w14a.pdf: Memory Hierarchy and Cache Memory (Slides 2–20)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Purpose and Structure of the Memory Hierarchy</h4>\n            <p>\n              The primary purpose of the memory hierarchy is to balance the trade-offs between speed, cost, and capacity:\n            </p>\n            <ul>\n              <li><strong>Registers:</strong> Fastest, smallest (&lt; 1 KB), located directly inside CPU core.</li>\n              <li><strong>Cache Memory (L1, L2, L3):</strong> High-speed SRAM buffers mitigating the processor-memory performance gap.</li>\n              <li><strong>Main Memory (RAM):</strong> Moderate capacity DRAM providing primary workspace.</li>\n              <li><strong>Secondary Storage (SSD / HDD):</strong> Non-volatile bulk storage.</li>\n            </ul>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Locality Principles and Cache Mapping</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>Locality of Reference</h5>\n                <ul>\n                  <li><strong>Temporal Locality:</strong> Recently referenced items are likely to be accessed again in the near future (loops, stack pointers).</li>\n                  <li><strong>Spatial Locality:</strong> Items stored at nearby addresses are likely to be accessed soon (sequential instructions, array traversal).</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>Cache Organization & AMAT</h5>\n                <ul>\n                  <li><strong>Direct-Mapped:</strong> Each memory block maps to exactly one cache line.</li>\n                  <li><strong>K-Way Set-Associative:</strong> Each block maps to any of $K$ lines in a designated set.</li>\n                  <li><strong>AMAT Formula:</strong> $\text{AMAT} = \text{Hit Time} + (\text{Miss Rate} \times \text{Miss Penalty})$.</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-15-2",
        "question": "Bir programın ardışık bellek adreslerindeki dizi elemanlarını sırayla okuması hangi yerellik ilkesinin (Locality of Reference) mükemmel bir örneğidir?",
        "options": [
          "Zamansal Yerellik (Temporal Locality)",
          "Mekânsal Yerellik (Spatial Locality)",
          "Kapasite Yerelliği",
          "Çakışma Yerelliği"
        ],
        "correctIndex": 1,
        "explanation": "Mekânsal yerellik (Spatial Locality), erişilen bir adrese komşu ardışık adreslerin de yakında erişileceğini ifade eder; diziler bunun temel örneğidir."
      },
      "task": {
        "id": "task-15-2-spatial-locality-array",
        "title": "Mekânsal Yerellik ile Dizi Toplamı",
        "difficulty": "Orta",
        "scenario": "Mekânsal yerellik prensibiyle ardışık 3 baytlık bir bellek bloğundaki sayıları SI işaretçisiyle toplayın: AL = [SI] + [SI+1] + [SI+2].",
        "taskPrompt": "SI=200h yapın. AL'ye [SI] okuyun, ardından ADD AL, [SI+1] ve ADD AL, [SI+2] yapın.",
        "testSetup": {
          "initialMemory": [
            {
              "segment": 0,
              "offset": 512,
              "bytes": [
                10,
                20,
                30
              ]
            }
          ]
        },
        "starterCode": "ORG 100h\nMOV SI, 200h\n; [SI], [SI+1], [SI+2] baytlarını AL'de toplayın\nHLT",
        "solutionCode": "ORG 100h\nMOV SI, 200h\nMOV AL, [SI]\nADD AL, [SI+1]\nADD AL, [SI+2]\nHLT",
        "hints": [
          "MOV AL, [SI] yazın.",
          "ADD AL, [SI+1] ve ADD AL, [SI+2] komutlarını ekleyin."
        ],
        "assertions": {
          "registers": {
            "al": 60
          }
        },
        "examTip": "Ardışık bellek adreslerini okumak önbellek satırının (Cache Line) tek bir bellek çevriminde getirilmesini sağlayarak donanımı hızlandırır."
      }
    },
    {
      "id": "sub-15-3-multicore-mesi-and-amdahl",
      "number": "15.3",
      "title": "Makrolar, Intel 8085 vs. 8086 ve Paralel Mimariler (Flynn / Amdahl)",
      "titleEn": "Assembly Macros, 8085 vs. 8086, and Parallel Architectures (Flynn / Amdahl)",
      "summary": "Makro vs Prosedür (Zaman vs Bellek), Intel 8085 vs 8086 12 maddelik karşılaştırma, Flynn Taksonomisi, Amdahl & Gustafson Yasaları, RISC vs CISC ve µops hibrit mimarisi.",
      "summaryEn": "Macros vs procedures trade-offs, Intel 8085 vs 8086 architectural comparison, Flynn taxonomy (SISD, SIMD, MISD, MIMD), Amdahl and Gustafson scalability laws, and modern CISC/RISC micro-op (µop) hybrid design.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">Makrolar (MACRO / ENDM) vs. Prosedürler (CALL / RET)</h4>\n            <p><strong>Makro:</strong> Derleme zamanında (Assembly Time) satır içine kopyalanır (satır içi genişleme). Çağrı ek yükü (CALL/RET) ve yığın kullanımı sıfırdır; ancak kod boyutu büyür (<strong>Code Bloat</strong>). Prosedürler ise bellekte tek kopya tutarak yer tasarrufu sağlar ancak 20-30 çevrimlik çağrı gecikmesine yol açar.</p>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Intel 8085 vs. 8086 Mimari Karşılaştırma Matrisi (12 Madde)</h4>\n            <table class=\"nb-table\">\n              <thead>\n                <tr>\n                  <th>Mimari Parametre</th>\n                  <th>Intel 8085</th>\n                  <th>Intel 8086</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr><td><strong>1. ALU Genişliği</strong></td><td>8-bit</td><td>16-bit</td></tr>\n                <tr><td><strong>2. Adres Veriyolu</strong></td><td>16-bit</td><td>20-bit</td></tr>\n                <tr><td><strong>3. Azami Bellek Kapasitesi</strong></td><td>64 KB ($2^{16}$)</td><td>1 MB ($2^{20}$, 16 kat daha büyük)</td></tr>\n                <tr><td><strong>4. Bellek Organizasyonu</strong></td><td>Düz (Flat)</td><td>Segmentli (CS, DS, SS, ES)</td></tr>\n                <tr><td><strong>5. Prefetch Komut Kuyruğu</strong></td><td>YOK (Tamamen ardışıl)</td><td>VAR (6-baytlık FIFO kuyruk)</td></tr>\n                <tr><td><strong>6. Dahili Birim Ayrımı</strong></td><td>Tek kontrol bloğu</td><td>BIU (Veriyolu) ve EU (Yürütme) Ayrımı</td></tr>\n                <tr><td><strong>7. Donanımsal Çarpma/Bölme</strong></td><td><strong>YOK</strong> (Yazılımsal rutin zorunlu)</td><td><strong>VAR</strong> (Donanımsal MUL, IMUL, DIV, IDIV)</td></tr>\n                <tr><td><strong>8. Dizi / String Komutları</strong></td><td>YOK</td><td>VAR (MOVS, LODS, STOS, CMPS, SCAS, REP)</td></tr>\n                <tr><td><strong>9. Tablo Çeviri Komutu</strong></td><td>YOK</td><td>VAR (XLAT / XLATB)</td></tr>\n                <tr><td><strong>10. Saat Frekansı</strong></td><td>3 - 5 MHz</td><td>5 - 10 MHz</td></tr>\n                <tr><td><strong>11. G/Ç Port Sayısı</strong></td><td>256 Port (8-bit)</td><td>65,536 Port (16-bit DX)</td></tr>\n                <tr><td><strong>12. Çalışma Modları</strong></td><td>Tek Mod</td><td>Min Mod / Max Mod (8087 Matematik İşlemcisi)</td></tr>\n              </tbody>\n            </table>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Flynn Taksonomisi ve Paralel Başarım Yasaları</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>🌐 Flynn Taksonomisi (2x2 Matris)</h5>\n                <ul>\n                  <li><strong>SISD:</strong> Tek Komut, Tek Veri (Klasik 8086).</li>\n                  <li><strong>SIMD:</strong> Tek Komut, Çoklu Veri (GPU, Vektör, AVX).</li>\n                  <li><strong>MISD:</strong> Çoklu Komut, Tek Veri (Uzay mekiği hata toleransı).</li>\n                  <li><strong>MIMD:</strong> Çoklu Komut, Çoklu Veri (Modern Çok Çekirdekli CPU).</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>📐 Amdahl ve Gustafson Yasaları</h5>\n                <ul>\n                  <li><strong>Amdahl Yasası:</strong> Sabit iş yükünde hızlanma seri kısım ($1 - p$) tarafından kilitlenir!</li>\n                  <li>$$S(s) = \frac{1}{(1 - p) + \frac{p}{s}} implies lim_{s \to infty} S(s) = \frac{1}{1 - p}$$</li>\n                  <li><em>Örnek:</em> Programın %90'ı paralelse ($p=0.90$), sonsuz çekirdekte dahi tavan hızlanma: $1 / 0.10 = mathbf{10\times}$!</li>\n                  <li><strong>Gustafson Yasası:</strong> Problem boyutu büyüdüğünde: $S(s) = (1 - p) + s cdot p$.</li>\n                </ul>\n              </div>\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">RISC vs. CISC ve Modern Hibrit Mikro-Operasyon (µops) Mimarisi</h4>\n            <p>RISC basit, sabit uzunlukta ve Load/Store odaklı komutlar sunarken; CISC değişken uzunlukta ve doğrudan belleğe dokunan zengin komutlara sahiptir. Modern x86 işlemciler (Intel Core, AMD Ryzen) dışarıdan CISC komutlarını kabul edip, dahili donanımsal kod çözücülerle hızlı RISC benzeri <strong>mikro-operasyonlara (µops)</strong> bölen süperskalar hibrit bir mimari kullanır.</p>\n\n            <div class=\"nb-code-box\">\n              <pre><code>; SIMD Tarzı Paralel Veri İşleme Simülasyonu\nORG 100h\n    MOV AX, 0101h       ; AH = 01h, AL = 01h\n    ADD AL, 10          ; Alt bayt veri kanalında bağımsız işlem (AL = 11)\n    ADD AH, 20          ; Üst bayt veri kanalında bağımsız işlem (AH = 21)\n    HLT</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 (Geçen Yıl / Previous Year) — w15a.pdf: Parallel Processing & Course Matrix</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Macros vs. Procedures and 8085 vs. 8086</h4>\n            <ul>\n              <li><strong>Macros (Inline Expansion):</strong> Expanded textually by assembler at compile time. Eliminates CALL/RET overhead and stack traffic, but increases binary code size.</li>\n              <li><strong>Procedures:</strong> Stored once in memory and invoked at runtime via CALL/RET, saving space at the cost of call overhead.</li>\n              <li><strong>Intel 8085 vs 8086:</strong> The 8085 is an 8-bit accumulator-based CPU with 64 KB flat address space and no instruction queue; the 8086 is a 16-bit pipelined CPU with 1 MB segmented memory, BIU prefetch queue (6 bytes), and hardware MUL/DIV instructions.</li>\n            </ul>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Flynn's Taxonomy and Amdahl's Law</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>Flynn's Classification</h5>\n                <ul>\n                  <li><strong>SISD:</strong> Single Instruction, Single Data (traditional uniprocessors).</li>\n                  <li><strong>SIMD:</strong> Single Instruction, Multiple Data (vector and GPU streaming processors).</li>\n                  <li><strong>MISD:</strong> Multiple Instruction, Single Data (redundant fault-tolerant systems).</li>\n                  <li><strong>MIMD:</strong> Multiple Instruction, Multiple Data (multi-core and cluster processors).</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>Amdahl's Speedup Ceiling</h5>\n                <p>\n                  Limits theoretical speedup based on the strictly serial fraction ($1 - p$):\n                </p>\n                <div class=\"nb-formula-box\">\n                  $$\text{Speedup } S = \frac{1}{(1 - p) + \frac{p}{N}} \to \frac{1}{1 - p}$$\n                </div>\n                <p><em>Example:</em> If 80% of a workload is parallelized ($p = 0.80$), maximum achievable speedup is bounded at $1 / (1 - 0.80) = mathbf{5\times}$, regardless of how many cores are deployed.</p>\n              </div>\n            </div>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-15-3",
        "question": "Amdahl Yasasına göre bir programın %80'i paralel hale getirilebiliyorsa (p = 0.80), sonsuz sayıda işlemci kullanılsa dahi ulaşılabilecek teorik azami hızlanma tavanı (Speedup Ceiling) kaçtır?",
        "options": [
          "2 kat",
          "5 kat",
          "10 kat",
          "80 kat"
        ],
        "correctIndex": 1,
        "explanation": "Azami hızlanma = 1 / (1 - p) = 1 / (1 - 0.80) = 1 / 0.20 = 5 kat. Hızlanma seri kısım (%20) tarafından kilitlenir."
      },
      "task": {
        "id": "task-15-3-simd-add-simulation",
        "title": "SIMD Tarzı Bağımsız Veri İşleme Simülasyonu",
        "difficulty": "Orta",
        "scenario": "SIMD tarzı paralel veri işlemesini simüle etmek için AX yazmacının alt baytını (AL) 10 ile, üst baytını (AH) 20 ile bağımsız toplayın.",
        "taskPrompt": "AX=0101h ilklendirin. ADD AL, 10 ve ADD AH, 20 komutlarını çalıştırın. Sonuç AL=11, AH=21 olmalıdır.",
        "starterCode": "ORG 100h\nMOV AX, 0101h\n; AL'ye 10 ekleyin, AH'ye 20 ekleyin\nHLT",
        "solutionCode": "ORG 100h\nMOV AX, 0101h\nADD AL, 10\nADD AH, 20\nHLT",
        "hints": [
          "ADD AL, 10 komutunu yazın.",
          "ADD AH, 20 komutunu ekleyin."
        ],
        "assertions": {
          "registers": {
            "al": 11,
            "ah": 21
          }
        },
        "examTip": "SIMD (Single Instruction Multiple Data), aynı işlemin farklı veri kanallarında bağımsız yürütülmesidir."
      }
    }
  ],
  "mindMap": {
    "x": 82,
    "y": 82,
    "connections": []
  }
};
