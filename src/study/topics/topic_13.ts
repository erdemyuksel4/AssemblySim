import { MainTopic } from '../studyData.js';

export const TOPIC_13: MainTopic = {
  "id": "topic-13-interrupts-and-ivt",
  "number": 13,
  "category": "secondary",
  "weekLabel": "Geçen Yıl",
  "title": "13. Modül (Geçen Yıl): Kesme Vektör Tablosu (IVT), ISR Tasarımı ve 8259A PIC Laboratuvarı",
  "titleEn": "Last Year Module 13: Interrupt Vector Table (IVT), ISR Design & 8259A PIC Lab",
  "shortTitle": "Geçen Yıl: Kesmeler & IVT",
  "shortTitleEn": "Archive: Interrupts & IVT",
  "badge": "MODÜL 13 • GEÇEN YIL",
  "badgeEn": "ARCHIVE • INTERRUPTS",
  "icon": "⚡",
  "summary": "Geçen yılın kesme mimarisi (`w10.pdf`) uygulamaları: Donanım/Yazılım kesmeleri, IVT (00000H–003FFH) vektör adres hesabı, IRET ve 8259A PIC EOI protokolü.",
  "summaryEn": "Archive interrupt architecture (`w10.pdf`) labs: Hardware/Software interrupts, IVT vector calculation, IRET stack restoration, and 8259A PIC EOI protocol.",
  "opcodes": [
    "INT",
    "INTO",
    "IRET",
    "CLI",
    "STI",
    "PUSHF",
    "POPF"
  ],
  "subLessons": [
    {
      "id": "sub-13-1-interrupt-types-and-cycle-lab",
      "number": "13.1",
      "title": "Kesme ve İstisna Kavramı, Donanım vs. Yazılım Kesmeleri",
      "titleEn": "Interrupt and Exception Fundamentals: Hardware vs. Software",
      "summary": "İstisnaların 3 türü (Fault, Trap, Abort), Maskelenebilir (INTR) ve Maskelenemez (NMI) donanım kesmeleri, CLI/STI ve IF bayrağı.",
      "summaryEn": "Classification of exceptions (Faults, Traps, Aborts), Maskable Interrupts (INTR) controlled by the IF flag via CLI/STI, Non-Maskable Interrupts (NMI), and software interrupt mechanisms.",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">Kesme (Interrupt) ve İstisna (Exception) Mimarisi</h4>\n            <p>Kesme; asenkron harici çevre birimlerinin veya senkron dahili olayların CPU'ya sinyal göndererek mevcut programı geçici olarak durdurması ve olaya özel <strong>Kesme Servis Rutinine (ISR - Interrupt Service Routine)</strong> dallanmasıdır.</p>\n\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>⚡ Donanım Kesmeleri (Hardware Interrupts)</h5>\n                <ul>\n                  <li><strong>INTR (Maskelenebilir):</strong> Harici cihazlar pini 1 yapar. <code>IF</code> bayrağı ile açılıp kapatılır (<code>CLI</code> kapatır, <code>STI</code> açar).</li>\n                  <li><strong>NMI (Maskelenemez):</strong> Kritik arızalarda (parite hatası, voltaj düşmesi) pozitif kenarla tetiklenir. <code>CLI</code> ile engellenemez!</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>💻 Yazılım Kesmeleri & İstisnalar (Exceptions)</h5>\n                <ul>\n                  <li><strong>Hata (Fault):</strong> Komuttan önce yakalanır; düzeltilip komut yeniden denenir (örn. Sayfa Hatası).</li>\n                  <li><strong>Tuzak (Trap):</strong> Komut icrasından hemen sonra tetiklenir (örn. <code>TF=1</code> Single Step, <code>INT 3</code> Breakpoint).</li>\n                  <li><strong>İptal (Abort):</strong> Kurtarılamaz donanım/tutarlılık hatasıdır; programı sonlandırır.</li>\n                </ul>\n              </div>\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Kritik Bölge Yönetimi (CLI ve STI Komutları)</h4>\n            <p>Yığın işaretçisi (SP/SS) güncellenirken veya donanım portlarına atomik veri yazılırken araya başka bir kesmenin girmesini engellemek için <code>CLI</code> ile kesmeler kapatılır, işlem bitince <code>STI</code> ile yeniden açılır:</p>\n\n            <div class=\"nb-code-box\">\n              <pre><code>; Atomik Yığın Değişimi Örneği (CLI / STI Koruması)\n    CLI               ; IF = 0: Harici donanım kesmelerini geçici durdur\n    MOV SS, AX        ; Yığın segmentini ayarla\n    MOV SP, 0FFFEh    ; Yığın işaretçisini ayarla\n    STI               ; IF = 1: Donanım kesmelerini tekrar serbest bırak</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 6 (Slides 27–29) & Week 7 (Slides 22–24)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Hardware vs. Software Interrupts (Week 6 Slide 28)</h4>\n            <p>\n              An interrupt pauses whatever program the processor is executing and transfers control to a dedicated handler routine (Interrupt Service Routine - ISR):\n            </p>\n            <div class=\"nb-grid-2\">\n              <div class=\"nb-card\">\n                <h5>Hardware Interrupts</h5>\n                <ul>\n                  <li><strong>INTR (Maskable):</strong> Initiated by an external I/O device asserting the INTR pin. Can be disabled by clearing the Interrupt Flag (<code>CLI</code>, IF=0) and enabled with <code>STI</code> (IF=1).</li>\n                  <li><strong>NMI (Non-Maskable):</strong> Edge-triggered high-priority interrupt reserved for catastrophic hardware failures (e.g. power failure, memory parity error). Cannot be masked by software.</li>\n                </ul>\n              </div>\n              <div class=\"nb-card\">\n                <h5>Software Interrupts & Exceptions</h5>\n                <ul>\n                  <li><strong>Software Interrupts:</strong> Triggered explicitly in program code using the <code>INT n</code> instruction (e.g. <code>INT 21H</code> for DOS system calls).</li>\n                  <li><strong>Exceptions:</strong> Internal synchronous events categorized as Faults (restartable, detected before instruction), Traps (handled immediately after instruction, e.g. Single-Step TF=1), and Aborts (unrecoverable system errors).</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-13-1",
        "question": "8086 mikroişlemcisinde maskelenebilir harici donanım kesmelerini (INTR) geçici olarak devre dışı bırakmak için hangi komut kullanılır?",
        "options": [
          "STI",
          "CLI",
          "HLT",
          "NOP"
        ],
        "correctIndex": 1,
        "explanation": "CLI (Clear Interrupt Flag) IF bayrağını 0 yaparak INTR pininden gelen maskelenebilir kesmeleri devre dışı bırakır."
      },
      "task": {
        "id": "task-13-1-cli-sti",
        "title": "Kesme Bayrağı Kontrolü (CLI / STI)",
        "difficulty": "Kolay",
        "scenario": "CLI ile kesmeleri kapatın, ardından STI komutu ile tekrar açarak IF bayrağının 1 olmasını sağlayın.",
        "taskPrompt": "CLI ve STI komutlarını çalıştırıp ardından AX yazmacına 1 yükleyin.",
        "starterCode": "ORG 100h\nMOV AX, 0\n; CLI ardından STI komutlarını çalıştırın ve ardından MOV AX, 1 yazın\nHLT",
        "solutionCode": "ORG 100h\nCLI\nSTI\nMOV AX, 1\nHLT",
        "hints": [
          "CLI yazın, bir alt satıra STI yazın, ardından MOV AX, 1 ekleyin."
        ],
        "assertions": {
          "flags": {
            "if": 1
          },
          "registers": {
            "ax": 1
          }
        },
        "examTip": "CLI ve STI yalnızca IF (Interrupt Flag) bayrağını değiştirir, diğer bayraklara dokunmaz."
      }
    },
    {
      "id": "sub-13-2-ivt-and-iret-lab",
      "number": "13.2",
      "title": "Kesme Vektör Tablosu (IVT) ve Tip 0-4 Intel Özel Kesmeleri",
      "titleEn": "Interrupt Vector Table (IVT) Architecture and Reserved Vectors",
      "summary": "00000h-003FFh aralığında 256 vektörlük IVT haritası, Vektör*4 formülü ve Tip 0-4 rezerve kesmeler.",
      "summaryEn": "Structure of the 1 KB IVT (00000H–003FFH), 4-byte CS:IP pointer format, physical vector address formula (Vector * 4), and dedicated Intel reserved interrupts (Type 0 divide error to Type 4 overflow).",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">Kesme Vektör Tablosu (IVT) Mimarisi</h4>\n            <p>Real Mode belleğin en başında (<code>00000h - 003FFh</code> arası, tam 1024 bayt = 1 KB) <strong>256 adet kesme vektörü</strong> bulunur. Her vektör, ilgili ISR'nin 32-bitlik uzak adresini (<strong>Far Pointer: CS:IP</strong>) saklar:</p>\n            <ul>\n              <li>2 Bayt: Ofset Adresi (<code>IP</code>) — Düşük bayt önce (Little-Endian).</li>\n              <li>2 Bayt: Segment Adresi (<code>CS</code>) — Düşük bayt önce.</li>\n              <li>Her vektör tam 4 bayttır ($256 \times 4 = 1024\text{ bayt}$).</li>\n            </ul>\n\n            <div class=\"nb-formula-box\">\n              $$\text{IVT Fiziksel Adresi} = \text{Tip Numarası} \times 4$$\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Intel Rezerve Kesmeler (Tip 0 – Tip 4)</h4>\n            <table class=\"nb-table\">\n              <thead>\n                <tr>\n                  <th>Kesme Tipi</th>\n                  <th>IVT Başlangıç Adresi</th>\n                  <th>Tetiklenme Kaynağı</th>\n                  <th>Açıklama ve Görevi</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr><td><strong>Type 0</strong></td><td><code>00000h</code></td><td>Dahili Donanım</td><td><strong>Divide by Zero:</strong> <code>DIV/IDIV</code> işleminde bölen 0 olduğunda veya bölüm yazmaca sığmadığında tetiklenir.</td></tr>\n                <tr><td><strong>Type 1</strong></td><td><code>00004h</code></td><td>Dahili Tuzak (Trap)</td><td><strong>Single Step:</strong> <code>TF = 1</code> iken her komuttan sonra otomatik tetiklenerek hata ayıklayıcıya döner.</td></tr>\n                <tr><td><strong>Type 2</strong></td><td><code>00008h</code></td><td>Harici NMI Pini</td><td><strong>Non-Maskable Interrupt:</strong> Voltaj düşmesi veya RAM parite hatalarında çağrılır; maskelenemez.</td></tr>\n                <tr><td><strong>Type 3</strong></td><td><code>0000Ch</code></td><td>Özel Komut (0xCC)</td><td><strong>Breakpoint:</strong> Tek baytlık <code>INT 3</code> komutudur; herhangi bir komutun yerine atomik yazılabilir.</td></tr>\n                <tr><td><strong>Type 4</strong></td><td><code>00010h</code></td><td>Koşullu Komut</td><td><strong>Overflow Trap (INTO):</strong> İşaretli taşma olduğunda (<code>OF = 1</code>) <code>INTO</code> komutu ile tetiklenir.</td></tr>\n              </tbody>\n            </table>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Vektör Adresi Hesaplama ve IVT Kurulumu</h4>\n            <div class=\"nb-code-box\">\n              <pre><code>; Tip 8 Kesmesi (Timer) IVT Adresi: 8 * 4 = 32 = 00020h\n; IVT'ye Yeni ISR Adresi Yazma (Örn: Tip 60h Kullanıcı Kesmesi)\n    MOV AX, 0000h\n    MOV ES, AX          ; ES = 0000h (IVT Segmenti)\n    MOV DI, 60h * 4     ; DI = 240 = 00F0h (Tip 60h IVT ofseti)\n    MOV WORD PTR ES:[DI], OFFSET my_isr   ; IP yaz\n    MOV WORD PTR ES:[DI+2], CS            ; CS yaz</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 6: Program Control (Slides 29–31)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. Interrupt Vectors and the Vector Table (Slide 30)</h4>\n            <p>\n              The first 1 KB of physical memory (<code>00000H–003FFH</code>) is dedicated to the <strong>Interrupt Vector Table (IVT)</strong>:\n            </p>\n            <ul>\n              <li>Holds pointers for <strong>256 possible interrupt types</strong> (Type 0 through Type 255).</li>\n              <li>Each vector entry occupies <strong>4 bytes</strong>: a 2-byte Instruction Pointer offset (<code>IP</code>) followed by a 2-byte Code Segment selector (<code>CS</code>).</li>\n              <li><strong>Physical Address Calculation:</strong> $\text{IVT Address} = \text{Type Number} \times 4$. For example, Vector <code>21H</code> (33 decimal) starts at memory address $33 \times 4 = 132 = \text{00084H}$.</li>\n            </ul>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Intel Reserved Interrupt Types (Types 0 to 4)</h4>\n            <ul>\n              <li><strong>Type 0: Divide Error:</strong> Generated when a <code>DIV</code> or <code>IDIV</code> division produces a quotient that exceeds destination capacity or division by zero occurs.</li>\n              <li><strong>Type 1: Single Step:</strong> Invoked after each instruction if the Trap Flag (<code>TF</code>) is set to 1.</li>\n              <li><strong>Type 2: Non-Maskable Interrupt:</strong> Triggered by the external <code>NMI</code> pin.</li>\n              <li><strong>Type 3: Breakpoint:</strong> Special 1-byte instruction (<code>INT 3</code>, opcode <code>0CCH</code>) used by debuggers.</li>\n              <li><strong>Type 4: Overflow:</strong> Executed conditionally by the <code>INTO</code> instruction when the Overflow Flag is set (<code>OF = 1</code>).</li>\n            </ul>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-13-2",
        "question": "Tip 8 kesmesinin (Sistem Zamanlayıcısı) Kesme Vektör Tablosundaki (IVT) başlangıç fiziksel adresi nedir?",
        "options": [
          "00008h",
          "00010h",
          "00020h (32 desimal)",
          "00040h"
        ],
        "correctIndex": 2,
        "explanation": "IVT Adresi = Tip * 4 = 8 * 4 = 32 = 00020h."
      },
      "task": {
        "id": "task-13-2-ivt-address-calc",
        "title": "IVT Vektör Adresi Hesaplama",
        "difficulty": "Orta",
        "scenario": "Tip 5 kesmesinin IVT adresini hesaplamak için AX=5 değerini 4 ile çarpın (SHL AX, 1 iki kez). AX=20 (14h) olmalıdır.",
        "taskPrompt": "AX yazmacına 5 yükleyin ve sola kaydırmalarla 4 ile çarparak IVT başlangıç adresini bulun.",
        "starterCode": "ORG 100h\nMOV AX, 5\n; AX'i 4 ile çarpın\nHLT",
        "solutionCode": "ORG 100h\nMOV AX, 5\nSHL AX, 1\nSHL AX, 1\nHLT",
        "hints": [
          "SHL AX, 1 komutunu iki kez art arda çalıştırarak sayıyı 4 ile çarpın."
        ],
        "assertions": {
          "registers": {
            "ax": 20
          }
        },
        "examTip": "Her vektör 4 bayt olduğu için Tip numarası daima 4 ile çarpılır (Tip * 4)."
      }
    },
    {
      "id": "sub-13-3-8259a-pic-eoi-lab",
      "number": "13.3",
      "title": "Kesme Servis Rutini (ISR) Tasarımı, IRET ve 8259A PIC",
      "titleEn": "Interrupt Service Routine (ISR) Design, IRET, and Intel 82C59A PIC",
      "summary": "Donanımsal 7 adımlı kesme döngüsü, IRET vs RET farkı, Intel 8259A PIC (IRR, ISR, IMR, EOI) ve BIOS/DOS servisleri.",
      "summaryEn": "7-step hardware interrupt execution sequence, stack layout (pushing FLAGS, CS, IP), IRET instruction restoring FLAGS and CS:IP, and Intel 82C59A Programmable Interrupt Controller (IRR, ISR, IMR, EOI command).",
      "theoryHtml": "\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">Donanımsal Kesme Yürütme Sırası (7 Adım)</h4>\n            <ol>\n              <li><strong>Komut Tamamlama:</strong> İşlemci yürütülmekte olan komutu tamamlar (HLT hariç).</li>\n              <li><strong>FLAGS Yığına:</strong> $SP leftarrow SP - 2$, $\text{Memory}[SS:SP] leftarrow FLAGS$.</li>\n              <li><strong>Bayrakları Sıfırlama:</strong> $IF leftarrow 0$ (yeni kesme engellenir), $TF leftarrow 0$.</li>\n              <li><strong>CS ve IP Yığına:</strong> $SP leftarrow SP - 2$, $[SS:SP] leftarrow CS$; ardından $SP leftarrow SP - 2$, $[SS:SP] leftarrow IP$.</li>\n              <li><strong>IVT'den Vektör Çekme:</strong> $N \times 4$ adresinden yeni $IP$, $N \times 4 + 2$ adresinden yeni $CS$ okunur.</li>\n              <li><strong>ISR İcrası:</strong> Kesme Servis Rutini kodları çalışır.</li>\n              <li><strong>IRET ile Dönüş:</strong> Yığından sırasıyla <code>IP</code>, <code>CS</code> ve <code>FLAGS</code> çekilerek kesme öncesi tüm durum eksiksiz restore edilir.</li>\n            </ol>\n\n            <div class=\"nb-callout tip\">\n              ⚠️ <strong>IRET vs RET Farkı:</strong> Standart <code>RET</code> yalnızca <code>IP</code> (veya <code>CS:IP</code>) çeker. Oysa kesme yığına <code>FLAGS</code> yazmacını da ittiği için ISR mutlaka <code>IRET</code> ile bitmelidir; aksi halde yığın bozulur ve bayraklar geri yüklenemez!\n            </div>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Intel 8259A PIC ve EOI Komutu</h4>\n            <p>8259A denetleyicisi 8 harici kesme hattını (IRQ0-IRQ7) önceliklendirir. Üç temel yazmacı vardır: <strong>IRR</strong> (Gelen İstekler), <strong>IMR</strong> (Maskeli Hatlar) ve <strong>ISR</strong> (Hizmet Gören Hat). ISR tamamlandığında denetleyicinin kilitli kalmaması için <strong>EOI (End of Interrupt)</strong> komutu (<code>OUT 20h, AL</code> ile 20h) gönderilmelidir.</p>\n\n            <h4 class=\"nb-title\" style=\"margin-top: 16px;\">Standart BIOS ve DOS Servisleri (INT 10h / INT 21h)</h4>\n            <div class=\"nb-code-box\">\n              <pre><code>; 1. BIOS INT 10h: Teletype ile Ekrana Karakter Yazma\n    MOV AH, 0Eh       ; AH = 0Eh (Teletype karakter çıktısı)\n    MOV AL, 'M'       ; AL = Basılacak karakter ('M' = 4Dh)\n    INT 10h           ; BIOS video servisini çağır\n\n; 2. DOS INT 21h: Ekrana '$' ile Biten Dizi Yazma ve Çıkış\n    MOV DX, OFFSET msg\n    MOV AH, 09h       ; Dizi yazdırma servisi\n    INT 21h\n    MOV AX, 4C00h     ; AH=4Ch (Çıkış), AL=00h (Hatasız)\n    INT 21h\nmsg DB 'AssemblySim!$', 0</code></pre>\n            </div>\n          </div>\n        ",
      "theoryHtmlEn": "\n          <div class=\"nb-callout info\">\n            <strong>🇬🇧 Official Course Lecture Slide Text (Verbatim Professor Content)</strong><br>\n            <em>BMI3121 · Microprocessor Systems — Week 7: I/O Organization (Slides 25–33)</em>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">1. The Interrupt Processing Sequence: Hardware Steps (Slides 25–28)</h4>\n            <ol>\n              <li>Device signals CPU on <code>INTR</code>; CPU acknowledges with <code>INTA#</code> pulses and reads interrupt type byte $N$ from data bus.</li>\n              <li>CPU pushes <code>FLAGS</code> register onto stack ($SP leftarrow SP - 2$).</li>\n              <li>CPU clears <code>IF</code> and <code>TF</code> ($IF leftarrow 0$, $TF leftarrow 0$) to disable further maskable interrupts during entry.</li>\n              <li>CPU pushes return address: first <code>CS</code>, then <code>IP</code> onto stack ($SP leftarrow SP - 4$).</li>\n              <li>CPU fetches new <code>IP</code> from $[N \times 4]$ and new <code>CS</code> from $[N \times 4 + 2]$.</li>\n              <li>CPU executes the Interrupt Service Routine (ISR).</li>\n              <li>ISR terminates with <code>IRET</code>, popping <code>IP</code>, <code>CS</code>, and <code>FLAGS</code> in reverse order to seamlessly resume interrupted program.</li>\n            </ol>\n            <div class=\"nb-callout tip\">\n              <strong>IRET vs RET:</strong> Standard <code>RET</code> only pops IP (or CS:IP). <code>IRET</code> pops IP, CS, <em>and</em> FLAGS, properly restoring processor status.\n            </div>\n          </div>\n          <div class=\"nb-section\">\n            <h4 class=\"nb-title\">2. Intel 82C59A Priority Interrupt Controller (PIC) (Slides 32–33)</h4>\n            <p>\n              Arbitrates up to 8 prioritized interrupt request lines (<code>IR0–IR7</code>):\n            </p>\n            <ul>\n              <li><strong>IRR (Interrupt Request Register):</strong> Stores pending unserviced interrupt requests.</li>\n              <li><strong>ISR (In-Service Register):</strong> Tracks the interrupt currently being serviced by the CPU.</li>\n              <li><strong>IMR (Interrupt Mask Register):</strong> Bitmask allowing software to individually enable or disable specific IRQ lines.</li>\n              <li><strong>EOI (End of Interrupt):</strong> At the end of the ISR, software must issue an EOI command (<code>OUT 20H, AL</code> with <code>AL=20H</code>) to the 8259A to reset the in-service bit.</li>\n            </ul>\n          </div>\n        ",
      "quiz": {
        "id": "quiz-13-3",
        "question": "Bir alt yordam normalde RET ile biterken, bir Kesme Servis Rutini (ISR) neden zorunlu olarak IRET komutu ile bitmelidir?",
        "options": [
          "IRET daha az saat çevrimi tüketir",
          "IRET hem CS ve IP dönüş adreslerini hem de yığına saklanmış olan FLAGS yazmacını geri yükler",
          "IRET donanım portlarını sıfırlar",
          "IRET ekranı temizler"
        ],
        "correctIndex": 1,
        "explanation": "Kesme oluştuğunda işlemci yığına FLAGS, CS ve IP kaydeder. IRET bu üçünü sırayla çekerek işlemcinin kesme öncesi tüm durumunu eksiksiz restore eder."
      },
      "task": {
        "id": "task-13-3-bios-int-char",
        "title": "BIOS INT 10h ile Ekrana Karakter Basma",
        "difficulty": "Orta",
        "scenario": "BIOS INT 10h video kesmesini kullanarak teletype modunda (AH=0Eh) ekrana 'M' (4Dh) karakterini yazdırın.",
        "taskPrompt": "AH=0Eh, AL=4Dh yükleyin ve INT 10h kesmesini çağırın.",
        "starterCode": "ORG 100h\n; AH=0Eh, AL='M' yükleyip INT 10h çağırın\nHLT",
        "solutionCode": "ORG 100h\nMOV AH, 0Eh\nMOV AL, 'M'\nINT 10h\nHLT",
        "hints": [
          "MOV AH, 0Eh ve MOV AL, 'M' yazın.",
          "INT 10h komutunu çağırın."
        ],
        "assertions": {
          "registers": {
            "ah": 14,
            "al": 77
          }
        },
        "examTip": "BIOS INT 10h Video servislerinde AH=0Eh teletype karakter yazdırma fonksiyonudur."
      }
    }
  ],
  "mindMap": {
    "x": 18,
    "y": 82,
    "connections": [
      "topic-14-dma-and-os-support"
    ]
  }
};
