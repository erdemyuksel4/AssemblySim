/**
 * osSandboxView.ts
 * 
 * 8086 Kişisel İşletim Sistemi Laboratuvarı (OS Sandbox).
 * Sıfırdan bir işletim sisteminin tüm katmanlarını (Bootloader, Çekirdek,
 * Ekran Sürücüsü, Klavye Sürücüsü, Shell ve Sistem Kesmeleri) adım adım
 * ve interaktif olarak inşa etmeyi sağlayan merkez.
 */

import { CPU } from '../cpu/cpu.js';
import { Assembler, AsmResult } from '../assembler/assembler.js';
import { WorkspaceManager } from '../workspace/workspaceManager.js';
import { OSProject, WorkspaceDocument } from '../workspace/types.js';

export interface OSSandboxCallbacks {
  onOpenInMainEditor?: (title: string, code: string, docId?: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export type OSStageId = 'bootloader' | 'kernel' | 'screen' | 'keyboard' | 'shell' | 'syscalls';

export interface OSStageInfo {
  id: OSStageId;
  title: string;
  badge: string;
  fileRole: string;
  shortDesc: string;
  conceptTitle: string;
  conceptBody: string;
  hardwareTheory: string;
  criticalOpcodes: { opcode: string; role: string; whyNeeded: string }[];
  starterCode: string;
}

export const OS_STAGES: OSStageInfo[] = [
  {
    id: 'bootloader',
    title: '1. Aşama: Bootloader (Önyükleyici)',
    badge: '🚀 İLK KIVILCIM',
    fileRole: 'boot.asm',
    shortDesc: 'Bilgisayar açıldığında donanımın diskin ilk 512 baytını RAM 07C0:0000h adresine yüklemesi ve çalıştırması.',
    conceptTitle: 'Bilgisayar Açılış Anında Ne Yapar?',
    conceptBody: `Elektrik düğmesine bastığında CPU sıfırlanır ve BIOS ROM'u çalıştırır. BIOS donanımı kontrol eder (POST) ve diskin 1. sektörünü (512 bayt) belleğin 0000:7C00h (veya 07C0:0000h) adresine kopyalar. Son iki baytı 0x55, 0xAA (Sihirli İmza) ise bu kodun geçerli bir işletim sistemi önyükleyicisi olduğunu anlar ve kontrolü bu koda devreder!`,
    hardwareTheory: `Bootloader başladığında segment yazmaçlarının (DS, ES, SS) nerede olduğu garanti değildir. Bu yüzden ilk işimiz CLI ile kesmeleri kapatıp segmentleri 0000h'a, yığını (Stack) ise 7C00h adresine çekmektir. Yığın bellek adresinde aşağıya doğru büyüdüğü için boot kodumuza asla zarar vermez.`,
    criticalOpcodes: [
      { opcode: 'CLI / STI', role: 'Kesmeleri Kapat / Aç', whyNeeded: 'Yığın (SS:SP) ayarlanırken donanım kesmesi gelirse sistem çökebilir. Atomik ayar için kesmeler kapatılır.' },
      { opcode: 'XOR AX, AX', role: 'Sıfırlama', whyNeeded: 'MOV AX, 0 yerine 2 baytlık XOR komutu kullanılır; 512 baytlık sınırda her bayt kritiktir.' },
      { opcode: 'LODSB', role: 'Stringden Bayt Oku', whyNeeded: '[DS:SI] adresindeki karakteri tek seferde AL\'ye çeker ve SI\'yı 1 artırır.' },
      { opcode: 'INT 10h', role: 'BIOS Video Servisi', whyNeeded: 'AH=0Eh modunda BIOS ekrana teletype karakter basar; işletim sisteminin ilk sesidir.' }
    ],
    starterCode: `; === [1. ADIM] 512 Baytlık MBR Bootloader ===
ORG 7C00h

BOOT_START:
    CLI                 ; Kesmeleri kapat
    XOR AX, AX
    MOV DS, AX          ; DS = 0
    MOV ES, AX          ; ES = 0
    MOV SS, AX          ; SS = 0
    MOV SP, 7C00h       ; Yığını 7C00h'den aşağı büyüt
    STI                 ; Kesmeleri aç

    ; Ekrana Açılış Mesajını Bas
    LEA SI, MSG_BOOT
    CALL PRINT_STRING

    ; Çekirdeğe Zıpla veya Dur
    HLT

PRINT_STRING:
    MOV AH, 0Eh
.LOOP:
    LODSB
    CMP AL, 0
    JE .DONE
    INT 10h
    JMP .LOOP
.DONE:
    RET

MSG_BOOT DB '>>> [BOOTLOADER] Bilgisayar baslatildi! ErdemOS yukleniyor...', 0Dh, 0Ah, 0

; 512 Bayta Tamamla ve MBR İmzasını Ekle
TIMES 510 - ($ - $$) DB 0
DW 0AA55h
`
  },
  {
    id: 'kernel',
    title: '2. Aşama: Kernel (Ana Çekirdek)',
    badge: '⚙️ BEYİN MERKEZİ',
    fileRole: 'kernel.asm',
    shortDesc: 'Sistemin kalbi. Bellek haritasını doğrular, aygıt sürücülerini başlatır ve ana komut döngüsünü yönetir.',
    conceptTitle: 'Çekirdek Neden Ayrı Bir Katmandır?',
    conceptBody: `512 baytlık boot sektörüne koca bir işletim sistemi sığmaz. Bootloader'ın tek görevi çekirdeği (Kernel) diskten RAM'e (genellikle 1000h adresine) yükleyip oraya atlamaktır. Çekirdek devreye girdiğinde artık 512 bayt sınırımız yoktur; tüm sistem servisleri, sürücüler ve hafıza yönetimi burada yaşar.`,
    hardwareTheory: `Çekirdek ilk başladığında ekrana logosunu/başlığını çizer, donanım portlarını sıfırlar, değişkenler için RAM'de bir tampon bölgesi ayırır ve kullanıcıdan komut almak üzere hazır bekler.`,
    criticalOpcodes: [
      { opcode: 'CALL / RET', role: 'Alt Rutin Çağrısı', whyNeeded: 'Kernel modülerdir; ekran, klavye ve bellek fonksiyonlarını CALL ile çağırır ve RET ile döner.' },
      { opcode: 'PUSH / POP', role: 'Yazmaç Koruması', whyNeeded: 'Fonksiyon çağrılarında AX, BX, CX gibi kritik yazmaçların bozulmaması için stack kullanılır.' },
      { opcode: 'HLT', role: 'İşlemciyi Dinlendir', whyNeeded: 'Komut yokken CPU boşuna %100 çalışmaz; bir tuş veya kesme gelene kadar HLT ile uyur.' }
    ],
    starterCode: `; === [2. ADIM] Ana Çekirdek (Kernel) ===
ORG 1000h

KERNEL_MAIN:
    ; Başlık ve Sistem Bilgisini Yazdır
    LEA SI, MSG_KERNEL_BANNER
    CALL KERNEL_PRINT

    ; Ana Çekirdek Bekleme Döngüsü
KERNEL_LOOP:
    HLT
    JMP KERNEL_LOOP

KERNEL_PRINT:
    MOV AH, 0Eh
.LOOP:
    LODSB
    OR AL, AL
    JZ .DONE
    INT 10h
    JMP .LOOP
.DONE:
    RET

MSG_KERNEL_BANNER:
    DB '========================================', 0Dh, 0Ah
    DB '          KISISEL 8086 KERNEL           ', 0Dh, 0Ah
    DB '========================================', 0Dh, 0Ah
    DB '[SISTEM] RAM Haritasi: 1 MB Gercek Mod', 0Dh, 0Ah
    DB '[SISTEM] Cekirdek aktif, komut bekleniyor.', 0Dh, 0Ah, 0
`
  },
  {
    id: 'screen',
    title: '3. Aşama: Ekran Sürücüsü (Screen Driver)',
    badge: '🖥️ GÖRSEL DÜNYA',
    fileRole: 'screen.asm',
    shortDesc: 'Ekrana karakter, string ve yeni satır basma; ekranı temizleme ve renkli pencereler açma.',
    conceptTitle: 'Ekrana Yazı Nasıl Basılır? (BIOS vs Doğrudan VRAM)',
    conceptBody: `8086'da ekrana iki şekilde yazı yazabiliriz:
1. Kolay Yol: BIOS INT 10h (AH=0Eh Teletype) çağrısı.
2. Gerçek İşletim Sistemi Yolu: Doğrudan 0B800h adresindeki Ekran Belleğine (VRAM) yazmak! VRAM'de her karakter için 2 bayt vardır: 1. bayt ASCII karakteri, 2. bayt ise Renk Kodudur (Örn: Mavi zemin üzerine parlak sarı yazı). VRAM'e yazıldığı anda monitörde anında görünür!`,
    hardwareTheory: `80x25 VGA metin modunda toplam 2000 karakter hücresi vardır (4000 bayt). Sol üst köşe 0B800:0000h adresidir. Ekranı temizlemek için 2000 hücreye boşluk (ASCII 20h) ve varsayılan renk özelliği yazmak yeterlidir.`,
    criticalOpcodes: [
      { opcode: 'STOSB / STOSW', role: 'Belleğe Hızlı Yaz', whyNeeded: 'VRAM\'e veya bellek tamponuna ardışık karakter/renk yazmak için DI işaretçisini otomatik ilerletir.' },
      { opcode: 'INT 10h AH=06h', role: 'Ekranı Kaydır / Temizle', whyNeeded: 'Tüm ekranı tek seferde silip imleci (0, 0) koordinatına almak için donanım rutini.' },
      { opcode: 'INT 10h AH=02h', role: 'İmleç Konumlandırma', whyNeeded: 'DH=Satır, DL=Sütun vererek imleci ekranın istediğimiz yerine taşır.' }
    ],
    starterCode: `; === [3. ADIM] Ekran Sürücüsü ===

; AL'deki karakteri ekrana basar
SCREEN_PUT_CHAR:
    PUSH AX
    PUSH BX
    MOV AH, 0Eh
    MOV BH, 0
    MOV BL, 0Fh         ; Parlak Beyaz
    INT 10h
    POP BX
    POP AX
    RET

; Yeni satıra geçer (CR + LF)
SCREEN_NEWLINE:
    PUSH AX
    MOV AL, 0Dh         ; Carriage Return (Satır Başı)
    CALL SCREEN_PUT_CHAR
    MOV AL, 0Ah         ; Line Feed (Alt Satır)
    CALL SCREEN_PUT_CHAR
    POP AX
    RET

; Ekranı baştan aşağı temizler
SCREEN_CLEAR:
    PUSH AX
    PUSH BX
    PUSH CX
    PUSH DX
    MOV AH, 06h
    MOV AL, 0           ; 0 = Tüm ekranı temizle
    MOV BH, 07h         ; Siyah arka plan, gri yazı
    MOV CX, 0000h       ; (0, 0)
    MOV DX, 184Fh       ; (24, 79)
    INT 10h

    ; İmleci (0, 0)'a al
    MOV AH, 02h
    MOV BH, 0
    MOV DX, 0000h
    INT 10h
    POP DX
    POP CX
    POP BX
    POP AX
    RET
`
  },
  {
    id: 'keyboard',
    title: '4. Aşama: Klavye Sürücüsü (Keyboard Driver)',
    badge: '⌨️ KULLANICI GİRDİSİ',
    fileRole: 'keyboard.asm',
    shortDesc: 'Kullanıcının bastığı tuşları okuma, ekrana yansıtma (echo), Backspace ile silme ve tamponlama.',
    conceptTitle: 'Klavye Donanımı Nasıl Çalışır?',
    conceptBody: `Klavyeden bir tuşa basıldığında donanım bir "Scan Code" üretir. BIOS INT 16h servisi tuşu bekler, Scan Code'u ASCII karaktere çevirir ve AL yazmacına koyar. İşletim sistemimiz bu karakterleri alır, ekrana geri basar (böylece kullanıcı ne yazdığını görür) ve kullanıcının Enter tuşuna basmasını bekler.`,
    hardwareTheory: `Kullanıcı Enter'a basana kadar karakterler bellekteki bir "Giriş Tamponuna" (Buffer) sırayla kaydedilir. Eğer kullanıcı Backspace'e basarsa imleç 1 geri alınır, ekrana boşluk basılıp tekrar geri gelinir ve tampon işaretçisi (DI) 1 azaltılır.`,
    criticalOpcodes: [
      { opcode: 'INT 16h AH=00h', role: 'Tuş Bekle ve Oku', whyNeeded: 'Kullanıcı tuşa basana kadar bekler, basılınca AL=ASCII kodunu döndürür.' },
      { opcode: 'CMP AL, 0Dh', role: 'Enter Kontrolü', whyNeeded: '0Dh (Enter) basıldığında satırın bittiğini anlar ve komut yorumlayıcıya geçer.' },
      { opcode: 'CMP AL, 08h', role: 'Backspace Kontrolü', whyNeeded: '08h basıldığında tampondan son karakteri siler.' }
    ],
    starterCode: `; === [4. ADIM] Klavye Sürücüsü ===

; Klavyeden tek bir tuş okur (Çıkış: AL = ASCII)
KEYBOARD_GET_KEY:
    MOV AH, 00h
    INT 16h
    RET

; Enter'a basılana kadar satır okur (Giriş: DI = Buffer Adresi)
KEYBOARD_GET_LINE:
    PUSH AX
    PUSH DI
.READ_LOOP:
    CALL KEYBOARD_GET_KEY

    CMP AL, 0Dh         ; Enter tuşu mu?
    JE .LINE_DONE

    ; Karakteri tampona kaydet
    STOSB

    ; Ekrana bas (Echo)
    CALL SCREEN_PUT_CHAR
    JMP .READ_LOOP

.LINE_DONE:
    MOV AL, 0           ; Null ile bitir
    STOSB
    CALL SCREEN_NEWLINE
    POP DI
    POP AX
    RET
`
  },
  {
    id: 'shell',
    title: '5. Aşama: Kişisel Shell (Komut İstemcisi)',
    badge: '🐚 ETKİLEŞİMLİ KOMUT SATIRI',
    fileRole: 'shell.asm',
    shortDesc: 'Prompt (BENIM-OS>), girilen komutu ayrıştırma (parsing), komut tablosu ve alt programlara dallanma.',
    conceptTitle: 'Shell (Kabuk) Bir İşletim Sisteminde Ne Yapar?',
    conceptBody: `Shell, işletim sisteminin kullanıcıyla konuştuğu arayüzdür. Kullanıcıya bir istem (prompt) gösterir: "OS> ". Kullanıcının yazdığı metni okur, bilinen komutlarla ("help", "clear", "ver", "mem") karşılaştırır. Eşleşme varsa ilgili fonksiyonu CALL ile çalıştırır; yoksa "Bilinmeyen komut!" uyarısı verir.`,
    hardwareTheory: `Komut karşılaştırma döngüsünde SI girilen komut tamponunu, DI ise tanımlı komut sabitini (DB 'help', 0) gösterir. Karakter karakter karşılaştırma yapılır (CMP [SI], AL). Eşleşirse ilgili komut etiketine (JE EXEC_HELP) atlanır.`,
    criticalOpcodes: [
      { opcode: 'LEA SI / DI', role: 'Adres Yükleme', whyNeeded: 'String karşılaştırma için kaynak ve hedef bellek adreslerini hazırlar.' },
      { opcode: 'CMP + JE / JNE', role: 'Karşılaştırma & Dallanma', whyNeeded: 'Yazılan kelimenin komut listesindekiyle eşleşip eşleşmediğini denetler.' }
    ],
    starterCode: `; === [5. ADIM] Kişisel Shell (Komut Satırı) ===

SHELL_RUN:
    ; Prompt Göster: BENIM-OS>
    LEA SI, PROMPT_STR
    CALL PRINT_STRING

    ; Kullanıcıdan Komutu Oku
    LEA DI, CMD_INPUT_BUF
    CALL KEYBOARD_GET_LINE

    ; Komutları Kontrol Et
    LEA SI, CMD_INPUT_BUF
    LEA DI, STR_HELP
    CALL STR_CMP
    JE .DO_HELP

    LEA SI, CMD_INPUT_BUF
    LEA DI, STR_CLS
    CALL STR_CMP
    JE .DO_CLS

    ; Eşleşmedi ise bilinmeyen komut
    LEA SI, MSG_UNKNOWN
    CALL PRINT_STRING
    JMP SHELL_RUN

.DO_HELP:
    LEA SI, MSG_HELP
    CALL PRINT_STRING
    JMP SHELL_RUN

.DO_CLS:
    CALL SCREEN_CLEAR
    JMP SHELL_RUN

STR_CMP:
.CMP_LOOP:
    MOV AL, [SI]
    MOV BL, [DI]
    CMP AL, BL
    JNE .NOT_EQUAL
    CMP AL, 0
    JE .EQUAL
    INC SI
    INC DI
    JMP .CMP_LOOP
.EQUAL:
    XOR AX, AX          ; ZF = 1 (Esit)
    RET
.NOT_EQUAL:
    MOV AX, 1           ; ZF = 0 (Esit degil)
    RET

PROMPT_STR      DB 'BENIM-OS> ', 0
STR_HELP        DB 'help', 0
STR_CLS         DB 'cls', 0
MSG_UNKNOWN     DB 'Bilinmeyen komut! Yardim icin [help] yazin.', 0Dh, 0Ah, 0
MSG_HELP        DB 'Komutlar: help, cls', 0Dh, 0Ah, 0
CMD_INPUT_BUF   TIMES 64 DB 0
`
  },
  {
    id: 'syscalls',
    title: '6. Aşama: Kendi Kesmelerimiz & Syscall',
    badge: '⚡ SİSTEM ÇAĞRILARI',
    fileRole: 'interrupts.asm',
    shortDesc: '0000:0000 IVT tablosuna kendi fonksiyonumuzu kaydetmek (Örn: INT 80h) ve IRET ile dönmek.',
    conceptTitle: 'İşletim Sistemleri Neden Kendi Kesmelerini Yazar?',
    conceptBody: `Bir işletim sisteminde çalışan kullanıcı programları (örneğin bir oyun veya hesap makinesi) ekranın veya donanımın doğrudan içine dalmaz. Bunun yerine işletim sistemine "Bunu benim adıma ekrana yaz" der. İşte buna "Sistem Çağrısı (Syscall)" denir. Linux'ta bu geleneksel olarak INT 80h, DOS'ta ise INT 21h'dir!`,
    hardwareTheory: `8086'da RAM'in ilk 1024 baytı (0000:0000 - 0000:03FF) Kesme Vektör Tablosudur (IVT). Toplam 256 kesme vardır ve her biri 4 bayttır (2 bayt Offset, 2 bayt Segment). Eğer INT 80h (128. kesme) kullanmak istiyorsak, 128 * 4 = 512 (0200h) adresine kendi fonksiyonumuzun adresini yazarız! Fonksiyonumuz işi bitince IRET komutu ile kullanıcı programına geri döner.`,
    criticalOpcodes: [
      { opcode: 'IRET', role: 'Kesmeden Dönüş', whyNeeded: 'Normal RET sadece IP\'yi çeker. IRET ise stack\'ten IP, CS ve FLAGS yazmaçlarının üçünü birden çekerek eski haline döndürür.' },
      { opcode: 'MOV [0200h], OFFSET', role: 'IVT Kaydı', whyNeeded: 'İşletim sistemimizin çağrı adresini işlemcinin donanım tablosuna yazar.' }
    ],
    starterCode: `; === [6. ADIM] Kendi Sistem Kesmemiz (INT 80h) ===

INSTALL_SYSCALL:
    CLI                 ; IVT guncellenirken kesmeleri kapat
    PUSH ES
    XOR AX, AX
    MOV ES, AX          ; ES = 0000h (IVT alani)

    ; INT 80h = 128 * 4 = 512 = 0200h adresi
    MOV WORD [ES:0200h], MY_SYSCALL_HANDLER
    MOV WORD [ES:0202h], CS

    POP ES
    STI
    RET

; Sistem Kesmesi Islecimiz:
; AH=1: Ekrana SI adresindeki stringi yaz
; AH=2: Ekrani temizle
MY_SYSCALL_HANDLER:
    PUSH AX
    PUSH BX
    CMP AH, 1
    JE .SYSCALL_PRINT
    CMP AH, 2
    JE .SYSCALL_CLEAR
    JMP .SYSCALL_EXIT

.SYSCALL_PRINT:
    CALL PRINT_STRING
    JMP .SYSCALL_EXIT

.SYSCALL_CLEAR:
    CALL SCREEN_CLEAR
    JMP .SYSCALL_EXIT

.SYSCALL_EXIT:
    POP BX
    POP AX
    IRET                ; Kesmeden donus! (POP IP, CS, FLAGS)
`
  }
];

export class OSSandboxView {
  private container: HTMLElement;
  private workspace: WorkspaceManager;
  private callbacks?: OSSandboxCallbacks;

  // Active state
  private activeStageId: OSStageId = 'bootloader';
  private activeProjectId: string = '';
  private crtColorMode: 'amber' | 'green' | 'vga' = 'vga';

  // Simulator Runtime
  private cpu: CPU;
  private isRunning: boolean = false;
  private runTimer: number | null = null;
  private execSpeedHz: number = 1000;
  private crtLines: string[] = [];
  private currentCrtLine: string = '';
  private cursorBlink: boolean = true;
  private blinkTimer: number | null = null;

  constructor(
    container: HTMLElement, 
    workspace: WorkspaceManager, 
    callbacks?: OSSandboxCallbacks
  ) {
    this.container = container;
    this.workspace = workspace;
    this.callbacks = callbacks;
    this.cpu = new CPU();

    // Select first OS project if exists
    const projects = this.workspace.getOSProjects();
    if (projects.length > 0) {
      this.activeProjectId = projects[0].id;
    }

    this.render();
    this.startBlinkTimer();
  }

  destroy(): void {
    this.stopExecution();
    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
  }

  setProject(projectId: string): void {
    this.activeProjectId = projectId;
    this.render();
  }

  private startBlinkTimer(): void {
    if (this.blinkTimer) clearInterval(this.blinkTimer);
    this.blinkTimer = window.setInterval(() => {
      this.cursorBlink = !this.cursorBlink;
      const cursorEl = this.container.querySelector('.crt-cursor') as HTMLElement | null;
      if (cursorEl) {
        cursorEl.style.opacity = this.cursorBlink ? '1' : '0';
      }
    }, 530);
  }

  render(): void {
    const projects = this.workspace.getOSProjects();
    const activeProject = projects.find(p => p.id === this.activeProjectId) || projects[0];
    const currentStage = OS_STAGES.find(s => s.id === this.activeStageId) || OS_STAGES[0];

    this.container.innerHTML = `
      <div class="os-sandbox-wrapper">
        <!-- OS Sandbox Top Navigation Banner -->
        <header class="os-sandbox-header">
          <div class="os-header-left">
            <span class="os-header-badge">💻 8086 KİŞİSEL İŞLETİM SİSTEMİ LABORATUVARI</span>
            <h2 class="os-header-title">Bare-Metal 8086 OS Stüdyosu</h2>
            <p class="os-header-desc">
              Sıfırdan kendi işletim sistemini 8086 Assembly ile inşa et. Donanım açılışından kabuğa (shell) kadar tüm adımların arkasındaki mantığı keşfet.
            </p>
          </div>

          <div class="os-header-actions">
            <div class="os-proj-selector-wrap">
              <label class="os-label-inline">Aktif Proje:</label>
              <select id="os-proj-select" class="os-proj-select">
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === activeProject?.id ? 'selected' : ''}>
                    ${this.escapeHtml(p.name)} (${p.fileDocIds.length} Modül)
                  </option>
                `).join('')}
              </select>
              <button id="btn-os-new-proj" class="btn-os-secondary" title="Yeni OS Projesi Oluştur">＋ Yeni OS</button>
            </div>
          </div>
        </header>

        <!-- 6 Guided Construction Milestones Navigator -->
        <nav class="os-stages-nav">
          ${OS_STAGES.map((stage, idx) => `
            <button class="os-stage-btn ${stage.id === this.activeStageId ? 'active' : ''}" data-stage-id="${stage.id}">
              <span class="os-stage-idx">${idx + 1}</span>
              <div class="os-stage-texts">
                <span class="os-stage-name">${stage.title.split(':')[1]?.trim() || stage.title}</span>
                <span class="os-stage-file">${stage.fileRole}</span>
              </div>
            </button>
          `).join('')}
        </nav>

        <!-- Main OS Sandbox Two-Column Workspace -->
        <div class="os-workspace-grid">
          <!-- Left Column: Architecture & Interactive Guide -->
          <div class="os-left-column">
            <!-- Stage Concept Card -->
            <div class="os-card os-concept-card">
              <div class="os-card-header">
                <span class="os-card-tag">${currentStage.badge}</span>
                <h3 class="os-card-title">${currentStage.conceptTitle}</h3>
              </div>
              <p class="os-card-text">${currentStage.conceptBody}</p>
              
              <div class="os-hardware-box">
                <div class="os-box-title">⚡ Donanım Mekanizması & Mimari Kural:</div>
                <div class="os-box-content">${currentStage.hardwareTheory}</div>
              </div>

              <!-- Critical Opcodes Table -->
              <div class="os-opcodes-section">
                <h4 class="os-section-subtitle">📌 Bu Adımdaki Kritik Komutlar ve Görevleri:</h4>
                <div class="os-opcodes-table-wrap">
                  <table class="os-opcodes-table">
                    <thead>
                      <tr>
                        <th>Komut</th>
                        <th>Görevi</th>
                        <th>Neden Bu Komut Seçildi?</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${currentStage.criticalOpcodes.map(op => `
                        <tr>
                          <td><code class="opcode-pill">${op.opcode}</code></td>
                          <td><strong>${op.role}</strong></td>
                          <td class="text-secondary">${op.whyNeeded}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Code Preview & Edit Card -->
            <div class="os-card os-code-card">
              <div class="os-card-header os-code-header">
                <div class="os-file-info">
                  <span class="os-code-icon">📄</span>
                  <span class="os-code-filename">${currentStage.fileRole}</span>
                  <span class="os-code-role-badge">Kaynak Kod</span>
                </div>
                <button id="btn-os-open-editor" class="btn-os-primary" title="Bu kodu ana editörde açıp serbestçe düzenleyin">
                  ✏️ Ana Editörde Düzenle
                </button>
              </div>
              <div class="os-code-preview-wrap">
                <pre class="os-code-preview"><code>${this.escapeHtml(this.getStageCode(activeProject, currentStage))}</code></pre>
              </div>
            </div>
          </div>

          <!-- Right Column: Retro CRT Display & OS Machine Runner -->
          <div class="os-right-column">
            <!-- CRT Monitor Wrapper -->
            <div class="os-crt-container">
              <div class="os-crt-bezel">
                <div class="os-crt-header-bar">
                  <div class="os-crt-lights">
                    <span class="crt-led power ${this.isRunning ? 'active' : ''}"></span>
                    <span class="crt-led-label">POWER</span>
                    <span class="crt-led hdd ${this.isRunning ? 'active' : ''}"></span>
                    <span class="crt-led-label">DISK</span>
                  </div>
                  <span class="os-crt-brand">8086 VINTAGE CRT MONITOR</span>
                  <div class="os-crt-palette-switch">
                    <button class="btn-palette ${this.crtColorMode === 'vga' ? 'active' : ''}" data-palette="vga" title="VGA Renkli Mod">VGA</button>
                    <button class="btn-palette ${this.crtColorMode === 'green' ? 'active' : ''}" data-palette="green" title="Yeşil Fosfor Monitör">GRN</button>
                    <button class="btn-palette ${this.crtColorMode === 'amber' ? 'active' : ''}" data-palette="amber" title="Kehribar Monitör">AMB</button>
                  </div>
                </div>

                <!-- CRT Glass Screen -->
                <div class="os-crt-screen ${this.crtColorMode}" id="os-crt-screen" tabindex="0" title="Klavyenizle yazı yazmak için monitöre tıklayın">
                  <div class="crt-scanlines"></div>
                  <div class="crt-glow"></div>
                  <div class="crt-content" id="os-crt-content">
                    ${this.renderCrtContent()}
                  </div>
                </div>

                <div class="os-crt-footer-bar">
                  <span class="crt-hint">💡 Monitöre tıklayıp klavyenizle komut yazabilirsiniz</span>
                  <span class="crt-mode-badge">80x25 Real-Mode Text Mode</span>
                </div>
              </div>
            </div>

            <!-- Machine Control Deck -->
            <div class="os-card os-controls-deck">
              <div class="os-deck-row">
                <button id="btn-os-boot" class="btn-os-action boot" title="İşletim sistemini derle ve 8086 makinesini başlat">
                  🚀 OS'i Boot Et (Başlat)
                </button>
                <button id="btn-os-pause" class="btn-os-action" ${!this.isRunning ? 'disabled' : ''} title="Çalışmayı duraklat">
                  ⏸️ Duraklat
                </button>
                <button id="btn-os-step" class="btn-os-action" title="Tek komut adım yürüt">
                  ⏭️ Tek Adım
                </button>
                <button id="btn-os-reboot" class="btn-os-action danger" title="Makineyi yeniden başlat ve belleği sıfırla">
                  🔄 Yeniden Başlat
                </button>
              </div>

              <!-- Speed & Boot Mode Options -->
              <div class="os-deck-subrow">
                <div class="os-speed-wrap">
                  <span class="os-deck-label">CPU Hızı:</span>
                  <select id="os-speed-select" class="os-select-mini">
                    <option value="10">10 Hz (Çok Yavaş)</option>
                    <option value="100">100 Hz (Görsel Adım)</option>
                    <option value="1000" selected>1000 Hz (Normal)</option>
                    <option value="10000">10 kHz (Hızlı)</option>
                  </select>
                </div>

                <div class="os-mode-wrap">
                  <span class="os-deck-label">Boot Başlangıç Noktası:</span>
                  <span class="os-boot-addr">CS:IP = 0000:7C00h (MBR)</span>
                </div>
              </div>
            </div>

            <!-- Live Memory Map & Real Mode Visualizer -->
            <div class="os-card os-memmap-card">
              <div class="os-card-header">
                <span class="os-card-tag">🗺️ REAL-MODE BELLEK PLANI</span>
                <h4 class="os-card-title">1 MB RAM Haritası & Durum</h4>
              </div>

              <div class="os-mem-segments-grid">
                <div class="mem-seg-item ivt">
                  <div class="seg-range">0000:0000h - 0000:03FFh</div>
                  <div class="seg-name">IVT (Kesme Vektör Tablosu - 1 KB)</div>
                  <div class="seg-status">Syscall & BIOS Vektörleri</div>
                </div>
                <div class="mem-seg-item bda">
                  <div class="seg-range">0040:0000h - 0040:00FFh</div>
                  <div class="seg-name">BDA (BIOS Veri Alanı)</div>
                  <div class="seg-status">Klavye & Ekran Durumu</div>
                </div>
                <div class="mem-seg-item boot active">
                  <div class="seg-range">0000:7C00h - 0000:7DFFh</div>
                  <div class="seg-name">Boot Sektörü (512 Bayt MBR)</div>
                  <div class="seg-status">Önyükleyici Kodu (boot.asm)</div>
                </div>
                <div class="mem-seg-item kernel">
                  <div class="seg-range">1000:0000h ...</div>
                  <div class="seg-name">Kernel (Çekirdek Bellek Alanı)</div>
                  <div class="seg-status">kernel.asm + Sürücüler</div>
                </div>
                <div class="mem-seg-item vram">
                  <div class="seg-range">B800:0000h - B800:7FFFh</div>
                  <div class="seg-name">VGA Video RAM (Renkli Metin)</div>
                  <div class="seg-status">Monitör Tamponu</div>
                </div>
              </div>

              <!-- Live Register Status Pill Row -->
              <div class="os-live-regs" id="os-live-regs">
                ${this.renderLiveRegisters()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private renderCrtContent(): string {
    if (this.crtLines.length === 0 && !this.currentCrtLine) {
      return `
        <div class="crt-boot-prompt">
          <div class="crt-banner-text">8086 REAL-MODE SYSTEM READY</div>
          <div class="crt-banner-text">ROM BIOS V2.0 - 640 KB BASE RAM</div>
          <br/>
          <div>Lutfen OS'i baslatmak icin <span class="crt-highlight">[OS'i Boot Et]</span> butonuna tiklayin...</div>
          <br/>
          <div class="crt-line-row">
            <span class="crt-cursor">_</span>
          </div>
        </div>
      `;
    }

    const linesHtml = this.crtLines.map(line => `
      <div class="crt-line-row">${this.escapeHtml(line)}</div>
    `).join('');

    const activeLineHtml = `
      <div class="crt-line-row">
        <span>${this.escapeHtml(this.currentCrtLine)}</span>
        <span class="crt-cursor">_</span>
      </div>
    `;

    return linesHtml + activeLineHtml;
  }

  private renderLiveRegisters(): string {
    const regs = this.cpu.regs;
    const flags = this.cpu.flags;
    const toHex4 = (n: number) => n.toString(16).toUpperCase().padStart(4, '0');

    return `
      <div class="os-reg-pill"><strong>CS:IP</strong> ${toHex4(regs.cs)}:${toHex4(regs.ip)}</div>
      <div class="os-reg-pill"><strong>DS</strong> ${toHex4(regs.ds)}</div>
      <div class="os-reg-pill"><strong>ES</strong> ${toHex4(regs.es)}</div>
      <div class="os-reg-pill"><strong>SS:SP</strong> ${toHex4(regs.ss)}:${toHex4(regs.sp)}</div>
      <div class="os-reg-pill"><strong>AX</strong> ${toHex4(regs.ax)}</div>
      <div class="os-reg-pill"><strong>BX</strong> ${toHex4(regs.bx)}</div>
      <div class="os-reg-pill"><strong>CX</strong> ${toHex4(regs.cx)}</div>
      <div class="os-reg-pill"><strong>DX</strong> ${toHex4(regs.dx)}</div>
      <div class="os-reg-pill"><strong>FLAGS</strong> ${flags.toWord().toString(16).toUpperCase().padStart(4, '0')}</div>
    `;
  }

  private getStageCode(project: OSProject | undefined, stage: OSStageInfo): string {
    if (project) {
      // Find matching document in project
      const docs = this.workspace.getAllDocuments();
      const doc = docs.find(d => project.fileDocIds.includes(d.id) && (d.osRole === stage.id || d.title.toLowerCase().includes(stage.id)));
      if (doc) return doc.code;
    }
    return stage.starterCode;
  }

  private attachEvents(): void {
    // Stage Selector Buttons
    this.container.querySelectorAll<HTMLButtonElement>('.os-stage-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stageId = btn.getAttribute('data-stage-id') as OSStageId;
        if (stageId && stageId !== this.activeStageId) {
          this.activeStageId = stageId;
          this.render();
        }
      });
    });

    // Project Select Dropdown
    const projSelect = this.container.querySelector<HTMLSelectElement>('#os-proj-select');
    projSelect?.addEventListener('change', () => {
      this.activeProjectId = projSelect.value;
      this.callbacks?.onSelectProject?.(this.activeProjectId);
      this.render();
    });

    // New Project Button
    const newProjBtn = this.container.querySelector<HTMLButtonElement>('#btn-os-new-proj');
    newProjBtn?.addEventListener('click', () => {
      const name = prompt('Yeni İşletim Sistemi Projesinin Adı:', 'RetroOS');
      if (name && name.trim()) {
        const newProj = this.workspace.createOSProject(name.trim());
        this.activeProjectId = newProj.id;
        this.render();
      }
    });

    // Open in Editor Button
    const openEditorBtn = this.container.querySelector<HTMLButtonElement>('#btn-os-open-editor');
    openEditorBtn?.addEventListener('click', () => {
      const stage = OS_STAGES.find(s => s.id === this.activeStageId) || OS_STAGES[0];
      const projects = this.workspace.getOSProjects();
      const proj = projects.find(p => p.id === this.activeProjectId) || projects[0];
      const docs = this.workspace.getAllDocuments();
      const doc = docs.find(d => proj?.fileDocIds.includes(d.id) && (d.osRole === stage.id || d.title.toLowerCase().includes(stage.id)));

      if (doc) {
        this.callbacks?.onOpenInMainEditor?.(doc.title, doc.code, doc.id);
      } else {
        this.callbacks?.onOpenInMainEditor?.(stage.fileRole, stage.starterCode);
      }
    });

    // CRT Palette Buttons
    this.container.querySelectorAll<HTMLButtonElement>('.btn-palette').forEach(btn => {
      btn.addEventListener('click', () => {
        const pal = btn.getAttribute('data-palette') as 'vga' | 'green' | 'amber';
        if (pal) {
          this.crtColorMode = pal;
          const crtScreen = this.container.querySelector('#os-crt-screen');
          if (crtScreen) {
            crtScreen.className = `os-crt-screen ${pal}`;
          }
          this.container.querySelectorAll('.btn-palette').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });

    // Machine Controls: Boot OS
    const bootBtn = this.container.querySelector<HTMLButtonElement>('#btn-os-boot');
    bootBtn?.addEventListener('click', () => {
      this.bootOperatingSystem();
    });

    // Machine Controls: Pause
    const pauseBtn = this.container.querySelector<HTMLButtonElement>('#btn-os-pause');
    pauseBtn?.addEventListener('click', () => {
      this.stopExecution();
      this.updateControlsUI();
    });

    // Machine Controls: Step
    const stepBtn = this.container.querySelector<HTMLButtonElement>('#btn-os-step');
    stepBtn?.addEventListener('click', () => {
      this.stepExecution();
    });

    // Machine Controls: Reboot
    const rebootBtn = this.container.querySelector<HTMLButtonElement>('#btn-os-reboot');
    rebootBtn?.addEventListener('click', () => {
      this.rebootOperatingSystem();
    });

    // Speed selector
    const speedSelect = this.container.querySelector<HTMLSelectElement>('#os-speed-select');
    speedSelect?.addEventListener('change', () => {
      this.execSpeedHz = parseInt(speedSelect.value, 10) || 1000;
    });

    // CRT Interactive Typing: Listen for keydown when CRT screen is focused
    const crtScreen = this.container.querySelector<HTMLElement>('#os-crt-screen');
    crtScreen?.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent browser scrolling on space/arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'].includes(e.key)) {
        e.preventDefault();
      }

      let charCode: number | null = null;
      if (e.key === 'Enter') {
        charCode = 0x0D;
      } else if (e.key === 'Backspace') {
        charCode = 0x08;
      } else if (e.key === 'Tab') {
        charCode = 0x09;
      } else if (e.key.length === 1) {
        charCode = e.key.charCodeAt(0);
      }

      if (charCode !== null) {
        // Feed into CPU I/O Port & input queue
        this.cpu.io.feedInput(charCode);

        // Visual flash or local echo if not handled by BIOS
        if (charCode === 0x0D) {
          this.crtLines.push(this.currentCrtLine);
          this.currentCrtLine = '';
        } else if (charCode === 0x08) {
          this.currentCrtLine = this.currentCrtLine.slice(0, -1);
        } else {
          this.currentCrtLine += String.fromCharCode(charCode);
        }
        this.updateCrtDisplay();
      }
    });
  }

  /**
   * Boot the active OS Project into the virtual 8086 machine
   */
  bootOperatingSystem(): void {
    this.stopExecution();
    this.crtLines = [];
    this.currentCrtLine = '';

    // Collect code from project
    const projects = this.workspace.getOSProjects();
    const proj = projects.find(p => p.id === this.activeProjectId) || projects[0];
    const docs = this.workspace.getAllDocuments();

    // Get bootloader code and kernel code
    const bootDoc = docs.find(d => proj?.fileDocIds.includes(d.id) && (d.osRole === 'boot' || d.title.toLowerCase().includes('boot')));
    const kernelDoc = docs.find(d => proj?.fileDocIds.includes(d.id) && (d.osRole === 'kernel' || d.title.toLowerCase().includes('kernel')));

    const bootCode = bootDoc ? bootDoc.code : OS_STAGES[0].starterCode;
    const kernelCode = kernelDoc ? kernelDoc.code : '';

    // Assemble boot code
    const bootResult: AsmResult = Assembler.assemble(bootCode);
    if (bootResult.errors.length > 0) {
      this.crtLines.push(`>>> [BOOT HATASI]: ${bootResult.errors[0].message} (Satir: ${bootResult.errors[0].line})`);
      this.updateCrtDisplay();
      return;
    }

    // Reset CPU
    this.cpu.reset();

    // Load bootloader at 0000:7C00h (or 07C0:0000h)
    const bootBytes = bootResult.bytes;
    for (let i = 0; i < bootBytes.length; i++) {
      this.cpu.mem.writeByte(0x0000, 0x7C00 + i, bootBytes[i], true);
    }

    // If kernel exists, assemble and load at 1000:0000h
    if (kernelCode) {
      const kernelResult = Assembler.assemble(kernelCode);
      if (kernelResult.errors.length === 0) {
        const kBytes = kernelResult.bytes;
        for (let i = 0; i < kBytes.length; i++) {
          this.cpu.mem.writeByte(0x1000, 0x0000 + i, kBytes[i], true);
        }
      }
    }

    // Set Initial Register State for Real-Mode BIOS Boot
    this.cpu.regs.cs = 0x0000;
    this.cpu.regs.ip = 0x7C00;
    this.cpu.regs.ds = 0x0000;
    this.cpu.regs.es = 0x0000;
    this.cpu.regs.ss = 0x0000;
    this.cpu.regs.sp = 0x7C00;

    this.crtLines.push('>>> [BIOS] Sistem Baslatiliyor...');
    this.crtLines.push('>>> [BIOS] Diskin 0. sektoru 0000:7C00h adresine yuklendi.');
    this.crtLines.push('>>> [BIOS] Kontrol MBR Bootloader\'a devrediliyor...');
    this.crtLines.push('');
    this.updateCrtDisplay();

    this.isRunning = true;
    this.updateControlsUI();
    this.runLoop();
  }

  private handleCpuConsoleOutput(text: string): void {
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '\n') {
        this.crtLines.push(this.currentCrtLine);
        this.currentCrtLine = '';
      } else if (ch === '\r') {
        // Carriage return ignored as \n handles new line
      } else {
        this.currentCrtLine += ch;
      }
    }
    // Limit CRT lines
    if (this.crtLines.length > 24) {
      this.crtLines = this.crtLines.slice(-24);
    }
    this.updateCrtDisplay();
  }

  private stepExecution(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.updateControlsUI();
    }
    const res = this.cpu.step();
    if (res.consoleText) {
      this.handleCpuConsoleOutput(res.consoleText);
    }
    this.updateLiveRegistersUI();
    if (res.halted || res.error) {
      this.stopExecution();
      if (res.error) {
        this.crtLines.push(`>>> [CPU HATASI]: ${res.error}`);
        this.updateCrtDisplay();
      }
    }
  }

  private runLoop(): void {
    if (!this.isRunning) return;

    // Execute in batches for smooth performance
    const batchSize = Math.max(1, Math.floor(this.execSpeedHz / 60));
    for (let i = 0; i < batchSize; i++) {
      const res = this.cpu.step();
      if (res.consoleText) {
        this.handleCpuConsoleOutput(res.consoleText);
      }
      if (res.halted || res.error) {
        this.stopExecution();
        this.updateLiveRegistersUI();
        if (res.error) {
          this.crtLines.push(`>>> [CPU HATASI]: ${res.error}`);
          this.updateCrtDisplay();
        }
        return;
      }
    }

    this.updateLiveRegistersUI();
    this.runTimer = window.setTimeout(() => this.runLoop(), 1000 / 60);
  }

  private stopExecution(): void {
    this.isRunning = false;
    if (this.runTimer !== null) {
      clearTimeout(this.runTimer);
      this.runTimer = null;
    }
    this.updateControlsUI();
  }

  private rebootOperatingSystem(): void {
    this.stopExecution();
    this.cpu.reset();
    this.crtLines = [];
    this.currentCrtLine = '';
    this.updateCrtDisplay();
    this.updateLiveRegistersUI();
    this.updateControlsUI();
  }

  private updateControlsUI(): void {
    const pauseBtn = this.container.querySelector<HTMLButtonElement>('#btn-os-pause');
    if (pauseBtn) {
      pauseBtn.disabled = !this.isRunning;
    }
    const leds = this.container.querySelectorAll('.crt-led');
    leds.forEach(led => {
      if (this.isRunning) {
        led.classList.add('active');
      } else {
        led.classList.remove('active');
      }
    });
  }

  private updateCrtDisplay(): void {
    const screenContent = this.container.querySelector('#os-crt-content');
    if (screenContent) {
      screenContent.innerHTML = this.renderCrtContent();
      // Auto-scroll to bottom
      const screenEl = this.container.querySelector('#os-crt-screen');
      if (screenEl) {
        screenEl.scrollTop = screenEl.scrollHeight;
      }
    }
  }

  private updateLiveRegistersUI(): void {
    const regContainer = this.container.querySelector('#os-live-regs');
    if (regContainer) {
      regContainer.innerHTML = this.renderLiveRegisters();
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
