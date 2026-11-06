import { MainTopic } from '../studyData.js';

export const TOPIC_14: MainTopic = {
  "id": "topic-14-dma-and-os-support",
  "number": 14,
  "category": "secondary",
  "weekLabel": "Geçen Yıl",
  "title": "14. Modül (Geçen Yıl): G/Ç Yoklama Laboratuvarı, 8237A DMA Kanal Programlama ve İşletim Sistemi Desteği",
  "titleEn": "Last Year Module 14: I/O Polling Lab, 8237A DMA Channel Programming & OS Support (Protected Mode & Paging)",
  "shortTitle": "Geçen Yıl: OS & Korumalı Mod",
  "shortTitleEn": "Archive: OS & Protected Mode",
  "badge": "MODÜL 14 • GEÇEN YIL",
  "badgeEn": "ARCHIVE • OS SUPPORT",
  "icon": "🛡️",
  "summary": "Geçen yılın ileri sistem konuları (`w9.pdf`, `w11.pdf`, `w13a.pdf`): Durum yoklama (Polling) laboratuvarı, 8237A DMA kanal kaydedicileri ve İşletim Sistemi Desteği (Protected Mode, GDT/LDT, Ring 0–3, Sanal Bellek & Paging).",
  "summaryEn": "Archive system topics (`w9.pdf`, `w11.pdf`, `w13a.pdf`): Status polling lab, 8237A DMA channel programming, and OS Support (Protected Mode, GDT/LDT, Rings 0–3, Virtual Memory & Paging).",
  "opcodes": [
    "IN",
    "OUT",
    "TEST",
    "JZ",
    "MOV",
    "SHR",
    "OR"
  ],
  "subLessons": [
    {
      "id": "sub-14-1-io-polling-handshake-lab",
      "number": "14.1",
      "title": "G/Ç Veri Transfer Yöntemleri: Programlı G/Ç (Polling) ve El Sıkışma",
      "titleEn": "I/O Transfer Techniques: Programmed I/O (Polling) and Handshaking",
      "summary": "Meşgul bekleme (Busy-wait), Kesmeli G/Ç ve donanımsal el sıkışma sinyalleri (STB#, IBF, ACK#, OBF#) ile seri arayüzler.",
      "summaryEn": "Three I/O transfer methods, busy-waiting polling CPU overhead, hardware handshaking signals (STB#, IBF, ACK#, OBF#), and UART/serial interface fundamentals.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">G/Ç Veri Transfer Stratejileri</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>⏳ Programlı G/Ç (Polling / Busy-Wait)</h5>\n                <ul>\n                  <li>CPU bir döngüde çevre biriminin durum yazmacını sürekli sorgular.</li>\n                  <li>Ekstra donanım istemez, yazılımı basittir.</li>\n                  <li><strong>Dezavantaj:</strong> Cihaz hazır olana kadar CPU zamanını %100 israf eder; başka işlem yapılamaz.</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>🔔 Kesmeli G/Ç (Interrupt-Driven I/O)</h5>\n                <ul>\n                  <li>CPU transfer emrini verir ve diğer işlerine döner.</li>\n                  <li>Cihaz hazır olduğunda <code>INTR</code> piniyle CPU'yu uyarır.</li>\n                  <li>CPU verimliliği en üst düzeydedir; CPU boşta beklemez.</li>\n                </ul>\n              </div>\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Donanımsal El Sıkışma (Handshaking) Sinyalleri</h4>\n            <p>Farklı saat hızlarına sahip iki bağımsız cihazın asenkron haberleşmesinde veri kaybını önlemek için el sıkışma sinyalleri kullanılır:</p>\n            <ul>\n              <li><strong>STB# (Strobe):</strong> Vericinin veri yoluna geçerli bayt sürdüğünü belirten aktif-düşük darbe.</li>\n              <li><strong>IBF (Input Buffer Full):</strong> Alıcı giriş tamponunun dolduğunu ve CPU okuyana kadar yeni veri gönderilmemesini bildiren aktif-yüksek çıkış.</li>\n              <li><strong>ACK# (Acknowledge):</strong> Alıcının veriyi başarıyla aldığını ve yeni transfere hazır olduğunu bildiren aktif-düşük darbe.</li>\n              <li><strong>OBF# (Output Buffer Full):</strong> Göndericinin çıkış tamponunda bekleyen veri olduğunu bildiren aktif-düşük sinyal.</li>\n            </ul>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Seri İletişim Standartları ve Polling Simülasyonu</h4>\n            <p>Uzun mesafeli veri aktarımında paralel hatlar yerine tek hat üzerinden seri iletim kullanılır: <strong>UART</strong> (Asenkron, Start/Parity/Stop bitleri, COM1: 03F8h, COM2: 02F8h), <strong>RS-232</strong>, <strong>USB</strong> (Diferansiyel sinyal, PnP, Hot-swap), <strong>Ethernet</strong> (IEEE 802.3) ve <strong>Bluetooth</strong> (2.4 GHz ISM bandı).</p>\n\n            <div class=\"nb-code-box\">\n              <pre><code>; Polling (Programlı G/Ç) Simülasyon Kodu\nORG 100h\nbekle_dongusu:\n    IN   AL, 64h        ; Durum portunu oku\n    TEST AL, 01h        ; Veri hazır biti (Bit 0) 1 mi?\n    JZ   bekle_dongusu  ; Hazır değilse bekle (Busy-wait döngüsü)\n    IN   AL, 60h        ; Hazır! Veriyi klavye portundan oku\n    HLT</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 7: I/O Organization and Peripherals (Slides 13–21)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Three I/O Transfer Techniques (Slide 14)</h4>\n            <p>\n              Data transfer between CPU and peripherals can be accomplished by three primary methods:\n            </p>\n            <ul>\n              <li><strong>Programmed I/O (Polling):</strong> The CPU directly issues I/O commands and continually tests peripheral status in a busy-waiting loop until the device is ready. Wastes 100% of CPU cycles during wait.</li>\n              <li><strong>Interrupt-Driven I/O:</strong> CPU issues command and continues background tasks; the device triggers an interrupt when ready to transfer data, eliminating idle waiting.</li>\n              <li><strong>Direct Memory Access (DMA):</strong> An independent DMA controller transfers data blocks directly between peripheral and memory, bypassing the CPU entirely.</li>\n            </ul>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Hardware Handshaking Signals (Slide 9)</h4>\n            <p>\n              Asynchronous communication between mismatched clocks relies on hardware handshaking lines:\n            </p>\n            <ul>\n              <li><code>STB#</code> (Strobe): Active-low pulse indicating valid data is present on the bus.</li>\n              <li><code>IBF</code> (Input Buffer Full): Active-high signal indicating the input latch is full.</li>\n              <li><code>ACK#</code> (Acknowledge): Active-low pulse confirming peripheral received data.</li>\n              <li><code>OBF#</code> (Output Buffer Full): Active-low signal indicating data is ready in output buffer.</li>\n            </ul>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-12-2",
        "question": "Programlı G/Ç (Polling / Meşgul Bekleme) yönteminin en büyük dezavantajı nedir?",
        "options": [
          "Fazladan harici donanım gerektirmesi",
          "İşlemciyi çevre birimi hazır olana kadar meşgul döngüsünde kilitli tutarak CPU zamanını israf etmesi",
          "Yalnızca okuma işlemlerinde çalışabilmesi",
          "Adres veriyolunu daraltması"
        ],
        "correctIndex": 1,
        "explanation": "Polling yönteminde CPU çevre biriminin hazır bitini sürekli sorgulayan bir döngüde kilitlenir ve başka hiçbir faydalı iş yapamaz."
      },
      "task": {
        "id": "task-12-2-polling-simulation",
        "title": "Durum Biti Denetimi (Polling Simülasyonu)",
        "difficulty": "Orta",
        "scenario": "AL yazmacındaki durum bitini (Bit 0) TEST AL, 1 ile kontrol edin. Hazır ise BL yazmacına 0AAh yükleyin.",
        "taskPrompt": "TEST AL, 1 komutu ile sıfır kontrolü yapın ve BL yazmacına 0AAh değerini aktarın.",
        "starterCode": "ORG 100h\nMOV AL, 1\n; TEST AL, 1 ile kontrol edip BL'ye 0AAh yükleyin\nHLT",
        "solutionCode": "ORG 100h\nMOV AL, 1\nTEST AL, 1\nJZ bekle\nMOV BL, 0AAh\nbekle:\nHLT",
        "hints": [
          "TEST AL, 1 yazın.",
          "JZ bekle komutu ile bayrak 0 ise atlayın, değilse MOV BL, 0AAh çalıştırın."
        ],
        "assertions": {
          "registers": {
            "bl": 170
          }
        },
        "examTip": "TEST komutu yıkıcı olmayan bir AND işlemidir; işlenenleri bozmadan durum bayraklarını günceller."
      }
    },
    {
      "id": "sub-14-2-8237a-dma-channel-lab",
      "number": "14.2",
      "title": "Intel 8237 DMA Denetleyicisi ve Transfer Modları",
      "titleEn": "Intel 8237 DMA Controller Architecture and Cache Coherency",
      "summary": "8237 4 bağımsız kanalı, Dahili yazmaçlar (CAR, BAR, CWCR, BWCR), Terminal Count (N - 1 kuralı) ve Önbellek Tutarlılığı (Cache Coherency).",
      "summaryEn": "Four independent DMA channels, internal registers (CAR, BAR, CWCR, BWCR), Terminal Count (N - 1) rule, and hardware cache coherency solutions (bus snooping, cache flushing).",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">Intel 8237 DMA Denetleyicisi Mimarisi</h4>\n            <p>IBM PC mimarisinde standart olan Intel 8237 entegresi, <strong>4 bağımsız kanala (Channel 0-3)</strong> sahiptir:</p>\n            <ul>\n              <li><strong>Channel 0:</strong> RAM hücrelerinin tazelenmesi (DRAM Refresh).</li>\n              <li><strong>Channel 1:</strong> Boş / Ses kartı ve yedek çevre birimleri.</li>\n              <li><strong>Channel 2:</strong> Disket Sürücü Denetleyicisi (Floppy Disk Controller).</li>\n              <li><strong>Channel 3:</strong> Sabit disk veya yüksek hızlı çevre birimleri.</li>\n            </ul>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">8237 Dahili Yazmaçları ve Terminal Count (TC) Kuralı</h4>\n            <table class=\"nb-table\">\n              <thead>\n                <tr>\n                  <th>Yazmaç Adı</th>\n                  <th>Genişlik</th>\n                  <th>Görevi ve Açıklaması</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr><td><strong>CAR (Current Address Register)</strong></td><td>16-bit</td><td>O anda transfer edilen bellek adresini tutar; her transferde artar/azalır.</td></tr>\n                <tr><td><strong>BAR (Base Address Register)</strong></td><td>16-bit</td><td>Transferin başlangıç adresini saklar (Auto-Initialize için).</td></tr>\n                <tr><td><strong>CWCR (Current Word Count Register)</strong></td><td>16-bit</td><td>Kalan transfer sayısını tutar; 0'dan geriye sayınca TC üretir.</td></tr>\n                <tr><td><strong>BWCR (Base Word Count Register)</strong></td><td>16-bit</td><td>Toplam transfer boyutunu ($N - 1$) saklar.</td></tr>\n                <tr><td><strong>Command / Mode / Mask Registers</strong></td><td>8-bit</td><td>Transfer türü (Read/Write), kanal maskeleme ve genel çalışma ayarları.</td></tr>\n              </tbody>\n            </table>\n\n            <div class=\"nb-formula-box\">\n              $$\text{Word Count Yazmacı Değeri} = N - 1 quad (\text{Transfer edilecek bayt sayısı: } N)$$\n            </div>\n\n            <div class=\"nb-callout tip\">\n              💡 <strong>Terminal Count (TC) Mantığı:</strong> 8237 sayacı 0'a ulaştığında 1 bayt daha aktarım yapar. Bu nedenle 64 bayt aktarmak için sayaç yazmacına $64 - 1 = 63 = 3Fh$ yazılır. Sayaç 0000h'dan FFFFh'a düştüğünde donanımsal <strong>TC</strong> pini aktif olur.\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">DMA ve Önbellek Tutarlılığı (Cache Coherency)</h4>\n            <p>DMA doğrudan RAM'e yazdığında CPU önbelleğinde eski kopya kalabilir (<strong>Stale Data</strong>) veya CPU önbelleğe yazıp RAM'e yazmamışken DMA eski veriyi diske yazabilir (<strong>Write-Back Çakışması</strong>). Çözümler:</p>\n            <ul>\n              <li><strong>Bus Snooping:</strong> Önbellek veriyolunu dinler; DMA adrese yazınca ilgili önbellek satırını <em>Invalid</em> yapar.</li>\n              <li><strong>Yazılımsal Temizleme (Flush / Invalidate):</strong> OS transfer öncesi önbelleği RAM'e yazar ve geçersiz kılar.</li>\n              <li><strong>Non-Cacheable Buffers:</strong> DMA tampon bölgeleri önbelleğe alınamaz olarak işaretlenir.</li>\n            </ul>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 (Geçen Yıl / Previous Year) — w9.pdf: DMA Controller & Components</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Intel 8237 DMA Controller Architecture</h4>\n            <p>\n              The 8237 DMA controller includes four independent channels (Channels 0–3) to oversee concurrent transfer requests:\n            </p>\n            <ul>\n              <li><strong>CAR (Current Address Register):</strong> Holds the active memory address being accessed; increments or decrements after each byte/word transfer.</li>\n              <li><strong>BAR (Base Address Register):</strong> Preserves original starting memory address for automatic reinitialization.</li>\n              <li><strong>CWCR (Current Word Count Register):</strong> Tracks the remaining number of transfers. Decrements toward zero.</li>\n              <li><strong>Terminal Count (TC) & The $N - 1$ Rule:</strong> Because the counter triggers Terminal Count when rolling over from <code>0000H</code> to <code>0FFFFH</code> (meaning one transfer still occurs on zero), the count register must be loaded with $N - 1$ for an $N$-byte block transfer.</li>\n            </ul>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. DMA and Cache Coherency</h4>\n            <p>\n              When DMA writes directly to main memory, cached copies in the CPU become stale. Coherency is preserved by:\n            </p>\n            <ul>\n              <li><strong>Bus Snooping:</strong> Cache controllers monitor system bus DMA transactions and invalidate matching cached lines.</li>\n              <li><strong>Software Flushing / Invalidation:</strong> Operating system flushes dirty cache lines to RAM prior to DMA transfers.</li>\n              <li><strong>Non-Cacheable Memory Regions:</strong> Dedicated DMA buffers designated as non-cacheable in page tables.</li>\n            </ul>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-14-2",
        "question": "Gerçek zamanlı veya yüksek öncelikli CPU görevlerinin aksamaması için DMA transferinin saat çevrimleri arasına serpiştirilerek yapıldığı DMA modu hangisidir?",
        "options": [
          "Burst (Blok) Modu",
          "Çevrim Çalma (Cycle Stealing) Modu",
          "Cascade Modu",
          "Polling Modu"
        ],
        "correctIndex": 1,
        "explanation": "Çevrim Çalma (Cycle Stealing) modunda DMA her veri baytından sonra veriyolunu CPU'ya bırakır, böylece CPU kilitlenmez."
      },
      "task": {
        "id": "task-14-2-dma-counter-calc",
        "title": "DMA Sayaç Değeri (N - 1) Hazırlama",
        "difficulty": "Kolay",
        "scenario": "8237 DMA denetleyicisinde N baytlık transfer için Word Count yazmacına N - 1 yazılır. 64 baytlık transfer için CX yazmacına 63 (3Fh) yükleyin.",
        "taskPrompt": "CX yazmacına 3Fh yükleyin.",
        "starterCode": "ORG 100h\n; CX yazmacına 3Fh yükleyin\nHLT",
        "solutionCode": "ORG 100h\nMOV CX, 3Fh\nHLT",
        "hints": [
          "MOV CX, 3Fh komutunu yazın."
        ],
        "assertions": {
          "registers": {
            "cx": 63
          }
        },
        "examTip": "8237 DMA sayacı 0'a ulaştıktan sonra 1 kez daha transfer yaptığı için boyut daima N-1 olarak ayarlanır."
      }
    },
    {
      "id": "sub-14-3-os-support-protected-mode-paging",
      "number": "14.3",
      "title": "İşletim Sistemi Desteği, Proses Kontrol Bloğu (PCB) ve Çift Mod",
      "titleEn": "Operating System Support, Process Control Block (PCB), and Context Switching",
      "summary": "Proses yaşam döngüsü (5 durum), PCB yapısı, Bağlam Değişimi (Context Switching), User vs Kernel modu ve ayrıcalıklı komutlar.",
      "summaryEn": "5-state process lifecycle (New, Ready, Running, Blocked, Terminated), PCB structure, CPU context switching mechanics, dual-mode execution (User vs Kernel), and privileged instructions.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">Proses Yaşam Döngüsü (5 Durum) ve Proses Kontrol Bloğu (PCB)</h4>\n            <p>İşletim sisteminde çalışan bir program örneğine <strong>Proses (Process)</strong> denir. Proses yaşam döngüsü 5 durumdan oluşur: <strong>New &rarr; Ready &rarr; Running &rarr; Waiting/Blocked &rarr; Terminated</strong>.</p>\n            \n            <p>İşletim sistemi her prosesin tüm durumunu <strong>Proses Kontrol Bloğu (PCB - Process Control Block)</strong> içinde saklar:</p>\n            <ul>\n              <li><strong>PID (Process ID) & Durum:</strong> Tekil kimlik ve çalışma durumu.</li>\n              <li><strong>Program Sayacı (CS:IP):</strong> Bir sonraki yürütülecek komut adresi.</li>\n              <li><strong>İşlemci Yazmaçları:</strong> <code>AX, BX, CX, DX, SP, BP, SI, DI, FLAGS</code> ve segment yazmaçları.</li>\n              <li><strong>Bellek ve Dosya Yönetimi:</strong> Sayfa tabloları, açık dosya tanıtıcıları.</li>\n            </ul>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Bağlam Değiştirme (Context Switching)</h4>\n            <p>CPU bir prosesten diğerine geçerken, durdurulan prosesin yazmaçları PCB'sine kaydedilir (Bağlam Saklama) ve yeni prosesin PCB'sindeki yazmaçlar CPU'ya yüklenir (Bağlam Yükleme). Bu süreç saf bir yönetimsel ek yüktür (overhead).</p>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Donanımsal Koruma: Kullanıcı Modu (Ring 3) vs. Çekirdek Modu (Ring 0)</h4>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>👤 Kullanıcı Modu (User Mode - Ring 3)</h5>\n                <ul>\n                  <li>Normal kullanıcı uygulamaları çalışır.</li>\n                  <li>Doğrudan donanıma ve G/Ç portlarına erişemez.</li>\n                  <li>Ayrıcalıklı komutlar (CLI, STI, HLT) YASAKTIR; çalıştırılırsa koruma hatası (Fault) üretir.</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>👑 Çekirdek Modu (Kernel Mode - Ring 0)</h5>\n                <ul>\n                  <li>İşletim sistemi çekirdeği ve aygıt sürücüleri çalışır.</li>\n                  <li>Tüm fiziksel belleğe ve donanıma sınırsız erişim.</li>\n                  <li>Tüm ayrıcalıklı komutlar serbesttir.</li>\n                  <li>Kullanıcı kodu <strong>Sistem Çağrısı (System Call / INT 21h)</strong> ile Çekirdek Moduna geçiş ister.</li>\n                </ul>\n              </div>\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Bağlam Saklama (Context Save) Assembly Deseni</h4>\n            <div class=\"nb-code-box\">\n              <pre><code>; Timer Kesmesi Geldiğinde Bağlam Saklama (Context Save)\n    PUSH AX             ; Genel amaçlı yazmaçları yığına it\n    PUSH BX\n    PUSH CX\n    PUSH DX\n    PUSH SI\n    PUSH DI\n    PUSH DS\n    PUSH ES\n    ; (İşletim sistemi zamanlayıcısı yeni prosesi seçer...)\n    ; Bağlam Geri Yükleme (Context Restore) - Tam ters sırada (LIFO)\n    POP  ES\n    POP  DS\n    POP  DI\n    POP  SI\n    POP  DX\n    POP  CX\n    POP  BX\n    POP  AX\n    IRET                ; IP, CS, FLAGS geri yüklenir ve proses çalışır!</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 (Geçen Yıl / Previous Year) — w12a.pdf: Operating System Support & Context Switching</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Process Lifecycle and Process Control Block (PCB)</h4>\n            <p>\n              An active program in execution is managed as a Process transitioning across five states: <strong>New &rarr; Ready &rarr; Running &rarr; Blocked/Waiting &rarr; Terminated</strong>.\n            </p>\n            <ul>\n              <li><strong>Process Control Block (PCB):</strong> The operating system kernel maintains a PCB for each process, storing its Process ID (PID), CPU state (Program Counter CS:IP, general registers AX, BX, CX, DX, SP, BP, SI, DI, and FLAGS), scheduling priorities, and memory management descriptors.</li>\n            </ul>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Context Switching and Dual-Mode Operation</h4>\n            <p>\n              <strong>Context Switching:</strong> Saving the CPU execution state of the currently running process into its PCB and restoring the saved state of the next scheduled process.\n            </p>\n            <div class=\"nb-card\" style=\"margin-top: 10px;\">\n              <h5>Dual Mode: User Mode vs. Kernel (Supervisor) Mode</h5>\n              <p>\n                Modern CPUs enforce privilege rings: user applications execute in unprivileged User Mode, preventing direct hardware access. System calls (via software interrupts or <code>SYSENTER</code>) switch the CPU into privileged Kernel Mode to perform I/O operations and process management safely.\n              </p>\n            </div>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-14-3",
        "question": "Bir işletim sisteminde CPU bir prosesi durdurup diğerine geçerken (Context Switch), durdurulan prosesin işlemci yazmaçları nereye kaydedilir?",
        "options": [
          "Sistem ROM belleğine",
          "Proses Kontrol Bloğuna (PCB) veya Proses Yığınına",
          "Video RAM alanına",
          "Sabit diske doğrudan"
        ],
        "correctIndex": 1,
        "explanation": "İşletim sistemi her prosesin yazmaçlarını, IP değerini ve durumunu kendi Proses Kontrol Bloğuna (PCB) veya prosesin yığınına kaydeder."
      },
      "task": {
        "id": "task-14-3-context-save",
        "title": "Bağlam Saklama (Context Save) Simülasyonu",
        "difficulty": "Orta",
        "scenario": "Bağlam saklama simülasyonu olarak AX=1234h, BX=5678h, DX=9ABCh yazmaçlarını yığına PUSH edin ve yazmaçları sıfırlayın.",
        "taskPrompt": "PUSH AX, PUSH BX, PUSH DX yazın ve ardından AX, BX, DX yazmaçlarını 0 yapın.",
        "starterCode": "ORG 100h\nMOV AX, 1234h\nMOV BX, 5678h\nMOV DX, 9ABCh\n; AX, BX, DX yazmaçlarını yığına PUSH edin ve ardından yazmaçları 0 yapın\nHLT",
        "solutionCode": "ORG 100h\nMOV AX, 1234h\nMOV BX, 5678h\nMOV DX, 9ABCh\nPUSH AX\nPUSH BX\nPUSH DX\nMOV AX, 0\nMOV BX, 0\nMOV DX, 0\nHLT",
        "hints": [
          "PUSH AX, PUSH BX, PUSH DX komutlarını yazın.",
          "MOV AX, 0, MOV BX, 0, MOV DX, 0 komutlarıyla yazmaçları sıfırlayın."
        ],
        "assertions": {
          "registers": {
            "ax": 0,
            "bx": 0,
            "dx": 0,
            "sp": 65530
          },
          "memory": [
            {
              "segment": 0,
              "offset": 65530,
              "expectedBytes": [
                188,
                154,
                120,
                86,
                52,
                18
              ]
            }
          ]
        },
        "examTip": "Bağlam saklama sırasında yığına atılan yazmaçlar, bağlam geri yüklenirken tam ters sırada (LIFO) POP edilir."
      }
    }
  ],
  "mindMap": {
    "x": 50,
    "y": 82,
    "connections": [
      "topic-15-advanced-architectures"
    ]
  }
};
