/**
 * starterTemplates.ts
 * 
 * OS Sandbox mimari rehberi ve modül başlangıç şablonları.
 * Her modül için Giriş, Çıkış, İstenen Mantık ve Test adımlarını içeren
 * yapılandırılmış görev tanımları barındırır.
 */

export const OS_GUIDE_TEMPLATE = `; ==============================================================================
; 📘 SIFIRDAN İŞLETİM SİSTEMİ MİMARİSİ VE GELİŞTİRME REHBERİ
; ==============================================================================
; Bu dosya, kendi x86 / 8086 işletim sisteminizi inşa ederken her kararın
; arkasındaki donanımsal mantığı, bellek haritasını ve kod yapısını öğretir.
;
; İÇİNDEKİLER:
; 1. BİLGİSAYARIN KRONOLOJİK ÇALIŞMA SIRASI (GÜÇ DÜĞMESİNDEN SHELL'E KADAR)
; 2. BELLEK HARİTASI (NEDEN 7C00H? NEDEN 0700H? BAŞKA SAYI SEÇİLEMEZ Mİ?)
; 3. YAZMAÇLAR (REGISTERS) VE GÖREVLERİ
; 4. KESMELER (INTERRUPTS) VE EKRAN / KLAVYE
; 5. 5 AŞAMALI GÖREV DAĞILIMI (HANGİ MODÜL NE YAPACAK?)
; 6. ÇALIŞAN TAM REFERANS İŞLETİM SİSTEMİ (MİNİ ÖRNEK)
; ==============================================================================

; ------------------------------------------------------------------------------
; BÖLÜM 1: BİLGİSAYARIN KRONOLOJİK ÇALIŞMA SIRASI (GÜÇTEN KULLANICIYA)
; ------------------------------------------------------------------------------
; Bir x86 bilgisayarın güç düğmesine basıldığında işletim sistemi kabuğuna
; (Shell) ulaşana kadar donanımda şu 10 adım gerçekleşir:
;
; [0. MİKROSANİYE] GÜÇ DÜĞMESİ & RESET SİNYALİ:
;   Anakart güç kaynağı (PSU) voltajların oturduğunu bildiren "Power Good"
;   sinyali üretir ve 8086 işlemcisine bir RESET voltajı gönderir.
;
; [1. ADIM] CPU İLK UYANMA (RESET VEKTÖRÜ):
;   8086 işlemcisi fabrikasyon donanım kuralı gereği CS=FFFFh, IP=0000h ile uyanır.
;   Fiziksel Adres: (FFFFh * 16) + 0000h = 0xFFFF0.
;   Burası anakarttaki ROM BIOS çipidir. Burada "JMP FAR F000:E05Bh" emri vardır.
;
; [2. ADIM] POST (POWER-ON SELF TEST):
;   BIOS donanımı test eder: RAM hücrelerini sayar, ekran kartını ve klavye
;   kontrolcüsünü (Intel 8042) başlatır.
;
; [3. ADIM] IVT VE BDA KURULUMU:
;   BIOS, RAM'in en altındaki Kesme Vektör Tablosunu (IVT: 0x00000 - 0x003FF) ve
;   BIOS Veri Alanını (BDA: 0x00400 - 0x004FF) hazır eder.
;
; [4. ADIM] MBR DİSK TARAMASI (INT 19h BOOTSTRAP):
;   BIOS sabit diskin/disketin 0. sektörünü (ilk 512 bayt) okur.
;   Son 2 baytın 0xAA55 (Boot İmzası) olup olmadığını denetler.
;
; [5. ADIM] RAM'E YÜKLEME VE JUMP:
;   BIOS bu 512 baytı RAM'in 0000:7C00h adresine yazar ve "JMP 0000:7C00h" yapar.
;   ARTIŞ TÜM DONANIM KONTROLÜ SİZİN KODUNUZDADIR!
;
; [6. ADIM -> boot.asm (GÖREV 1)]:
;   Bootloader kodunuz çalışır: CLI ile kesmeleri susturur, DS=0, SS=0 segmentlerini
;   sıfırlar, Yığını (SP=7C00h) kurar, Kernel'ı RAM'e (1000h) yükler ve oraya zıplar.
;
; [7. ADIM -> kernel.asm (GÖREV 2)]:
;   Çekirdek RAM'de uyanır; ekran modunu 03h (80x25 renkli CRT) yapar, karşılama
;   başlığını basar ve sistem alt servislerini hazırlar.
;
; [8. ADIM -> screen.asm (GÖREV 3)]:
;   Ekran sürücüsü VRAM (0B800h) ve INT 10h ile karakter/string basma fonksiyonlarını
;   çekirdeğin ve kabuğun emrine sunar.
;
; [9. ADIM -> keyboard.asm (GÖREV 4)]:
;   Klavye sürücüsü INT 16h ile tuş okuma, tampon belleğe alma ve Backspace ile
;   karakter silme mantığını yürütür.
;
; [10. ADIM -> shell.asm (GÖREV 5)]:
;   Kullanıcıya komut istemini açar ("BenimOS> "); kullanıcı komut yazar, Shell
;   komutu ayrıştırır (help, cls vb.), çalıştırır ve sonsuz döngüde sistemi yönetir.

; ------------------------------------------------------------------------------
; BÖLÜM 2: BELLEK HARİTASI VE ADRES KARARLARI
; ------------------------------------------------------------------------------
;  +-------------------------+ 0x00000
;  |  IVT (Kesme Tablosu)    |  1 KB (0x00000 - 0x003FF) -> INT 0 - INT 255 vektörleri
;  +-------------------------+ 0x00400
;  |  BDA (BIOS Veri Alanı)  |  256 Bayt (0x00400 - 0x004FF) -> Donanım durumları
;  +-------------------------+ 0x00500
;  |  Kullanılabilir Boş RAM |  ~30 KB (0x00500 - 0x07BFF) -> Güvenli boş alan
;  +-------------------------+ 0x07C00
;  |  BOOTLOADER (512 Bayt)  |  0x07C00 - 0x07DFF -> BIOS'un yüklediği yer!
;  +-------------------------+ 0x07E00
;  |  Geniş Serbest RAM      |  ~608 KB (0x07E00 - 0x9FFFF) -> KERNEL BURAYA KONUR!
;  +-------------------------+ 0xA0000
;  |  VGA Grafik Belleği     |  128 KB (0xA0000 - 0xBFFFF)
;  |  (0xB800:0000 Metin)    |  -> 80x25 Renkli CRT Ekran VRAM'i
;  +-------------------------+ 0xC0000
;  |  Genişleme ROM / BIOS   |  256 KB (0xC0000 - 0xFFFFF)
;  +-------------------------+ 0xFFFFF (1 MB Tepe Noktası)

; ❓ SORU: NEDEN 7C00h? NEDEN BAŞKA BİR SAYI DEĞİL?
; CEVAP: 1981 IBM PC 5150 mimarisinde en düşük RAM 32 KB idi (0x8000h).
; Bootloader 512 bayttır (0x200h). Mühendisler 32 KB'ın en tepesine koydular:
; 0x8000h - 0x0200h = 0x7C00h! Böylece altında en geniş serbest RAM kaldı.

; ------------------------------------------------------------------------------
; BÖLÜM 3: 5 AŞAMALI GÖREV DAĞILIMI
; ------------------------------------------------------------------------------
; Sol menüdeki modüller sırasıyla şu görevleri üstlenir:
;   - boot.asm     -> GÖREV 1: Segmentleri sıfırla, yığını kur, Kernel'a atla.
;   - kernel.asm   -> GÖREV 2: Ekran modunu 03h yap, karşılama başlığını yazdır.
;   - screen.asm   -> GÖREV 3: Karakter/string basma ve ekran temizleme rutinleri.
;   - keyboard.asm -> GÖREV 4: Tuş bekleme, echo ve satır tamponu (Backspase dahil).
;   - shell.asm    -> GÖREV 5: "BenimOS>" komut istemi ve "help"/"cls" komutları.

; ==============================================================================
; BÖLÜM 4: ÇALIŞAN TAM REFERANS İŞLETİM SİSTEMİ (MİNİ ÖRNEK)
; Aşağıdaki kod tam çalışan bir mini çekirdektir. Hemen "Çalıştır" diyerek test edin!
; ==============================================================================

ORG 7C00h               ; Bootloader başlangıç adresi

START:
    CLI                 ; Kesmeleri kapat (güvenli donanım kurulumu)
    XOR AX, AX          ; AX = 0
    MOV DS, AX          ; Veri segmenti = 0000h
    MOV ES, AX          ; Ekstra segment = 0000h
    MOV SS, AX          ; Yığın segmenti = 0000h
    MOV SP, 7C00h       ; Yığın tepesini bootloader altına kur (aşağı doğru büyür)
    STI                 ; Kesmeleri tekrar aç

    ; 1. Ekranı Temizle (Mod 03h: 80x25 CRT Metin Modu)
    MOV AH, 00h
    MOV AL, 03h
    INT 10h

    ; 2. Karşılama Mesajını Yazdır
    MOV SI, MSG_BANNER
    CALL PRINT_STRING

    MOV SI, MSG_PROMPT
    CALL PRINT_STRING

SHELL_LOOP:
    ; Klavyeden bir tuş bekle
    MOV AH, 00h
    INT 16h             ; AL = basılan tuşun ASCII değeri

    ; ENTER basıldı mı? (ASCII 13)
    CMP AL, 13
    JE  ON_ENTER

    ; 'C' veya 'c' basıldı mı? (Clear Screen)
    CMP AL, 'c'
    JE  DO_CLEAR
    CMP AL, 'C'
    JE  DO_CLEAR

    ; 'H' veya 'h' basıldı mı? (Help)
    CMP AL, 'h'
    JE  DO_HELP
    CMP AL, 'H'
    JE  DO_HELP

    ; Normal tuş: Ekrana yaz (Echo)
    MOV AH, 0Eh
    MOV BL, 0Ah         ; Yeşil CRT rengi
    INT 10h
    JMP SHELL_LOOP

ON_ENTER:
    MOV SI, MSG_NEWLINE
    CALL PRINT_STRING
    MOV SI, MSG_PROMPT
    CALL PRINT_STRING
    JMP SHELL_LOOP

DO_CLEAR:
    MOV AH, 00h
    MOV AL, 03h
    INT 10h             ; Ekranı sıfırla
    MOV SI, MSG_PROMPT
    CALL PRINT_STRING
    JMP SHELL_LOOP

DO_HELP:
    MOV SI, MSG_HELP
    CALL PRINT_STRING
    MOV SI, MSG_PROMPT
    CALL PRINT_STRING
    JMP SHELL_LOOP

PRINT_STRING:
    PUSHA               ; Tüm yazmaçları koru
.loop:
    LODSB               ; AL = DS:[SI], SI++
    OR AL, AL           ; Sıfır (null terminator) geldi mi?
    JZ .done
    MOV AH, 0Eh         ; Teletype BIOS çıktısı
    MOV BL, 0Fh         ; Parlak Beyaz
    INT 10h
    JMP .loop
.done:
    POPA                ; Yazmaçları geri yükle
    RET

MSG_BANNER:
    DB 13, 10
    DB "==================================================", 13, 10
    DB "   [BenimOS v1.0] - Kisisel 8086 Isletim Sistemi  ", 13, 10
    DB "   Donanim Hazir. CRT Monitor Aktif. (80x25 Text) ", 13, 10
    DB "==================================================", 13, 10, 0

MSG_HELP:
    DB 13, 10
    DB "--- YARDIM MENUSU ---", 13, 10
    DB " Komutlar: [H] Yardim | [C] Ekrani Temizle | [Enter] Yeni Satir", 13, 10, 0

MSG_PROMPT:
    DB 13, 10, "BenimOS> ", 0

MSG_NEWLINE:
    DB 13, 10, 0

; 512 Bayt Bootloader İmzası
DW 0AA55h
`;

export const BOOT_ASM_TEMPLATE = `; ==============================================================================
; +-----------------------------------------------------------------------------+
; | 🎯 GÖREV 1: MBR ÖNYÜKLEYİCİ & DONANIM SEGMENT KURULUMU                      |
; +-----------------------------------------------------------------------------+
; | 📥 GİRİŞ:  CS:IP = 0000:7C00h (BIOS'un yüklediği yer) | DL = 80h (Sürücü No)|
; | 📤 ÇIKIŞ:  DS=0000h, ES=0000h, SS=0000h | SP=7C00h | JMP 1000h (Kernel)     |
; | ⚙️ İSTENEN: 1. CLI ile kesmeleri sustur                                      |
; |            2. XOR AX, AX -> DS, ES, SS segmentlerini sıfırla               |
; |            3. Yığını SP=7C00h olarak kur                                    |
; |            4. STI ile kesmeleri aç                                          |
; |            5. Ekrana yeşil CRT boot mesajı bas (INT 10h)                    |
; |            6. Çekirdek giriş noktasına atla (JMP KERNEL_ENTRY / 1000h)      |
; | 🧪 TEST:   CRT monitörde yeşil bootloader yazısını ve Kernel geçişini görün.|
; +-----------------------------------------------------------------------------+
; ==============================================================================

ORG 7C00h

BOOT_START:
    CLI                 ; Kesmeleri sustur (Yığın kurulurken kesme gelirse sistem çöker!)
    XOR AX, AX
    MOV DS, AX          ; DS = 0000h (Veri segmenti)
    MOV ES, AX          ; ES = 0000h (Ekstra segment)
    MOV SS, AX          ; SS = 0000h (Yığın segmenti)
    MOV SP, 7C00h       ; Yığını 7C00h'dan aşağı doğru büyüt
    STI                 ; Donanım güvenli, kesmeleri aç

    ; Ekrana Boot mesajı yazdır
    MOV SI, BOOT_MSG
    CALL BOOT_PRINT

    ; Kernel modülüne geçiş simülasyonu
    ; Gerçek donanımda burada INT 13h ile diskten sektörler okunur.
    JMP KERNEL_ENTRY

BOOT_PRINT:
    PUSHA
.loop:
    LODSB
    OR AL, AL
    JZ .done
    MOV AH, 0Eh
    MOV BL, 0Ah         ; CRT Yeşili
    INT 10h
    JMP .loop
.done:
    POPA
    RET

BOOT_MSG:
    DB ">> [BOOTLOADER] BIOS MBR yuklendi (0x7C00). Kernel calistiriliyor...", 13, 10, 0

KERNEL_ENTRY:
    HLT

; 512 Bayt MBR İmzası
DW 0AA55h
`;

export const KERNEL_ASM_TEMPLATE = `; ==============================================================================
; +-----------------------------------------------------------------------------+
; | 🎯 GÖREV 2: ANA ÇEKİRDEK BAŞLATMA & SİSTEM KARŞILAMA                        |
; +-----------------------------------------------------------------------------+
; | 📥 GİRİŞ:  CS:IP = 1000:0000h (Bootloader'dan devralınan kontrol)           |
; |            DS = 0000h, SP = 7C00h (Güvenli segment ve yığın)               |
; | 📤 ÇIKIŞ:  Video Modu = 03h (80x25 renkli CRT metin)                        |
; |            CRT Ekranında beyaz sistem başlığı ve RAM bilgisi                |
; |            JMP SHELL_START (Komut kabuğuna geçiş)                           |
; | ⚙️ İSTENEN: 1. INT 10h (AH=00h, AL=03h) ile ekranı temizle                  |
; |            2. SI yazmacına KERNEL_BANNER adresini ata, ekrana yazdır        |
; |            3. Kontrolü Shell modülüne (JMP SHELL_START) devret              |
; | 🧪 TEST:   Çalıştırdığınızda CRT monitörün temizlenip başlığın geldiğini    |
; |            gözlemleyin.                                                     |
; +-----------------------------------------------------------------------------+
; ==============================================================================

ORG 1000h

KERNEL_MAIN:
    ; 1. Ekranı Temizle (VGA 80x25 Renkli Metin Modu)
    MOV AH, 00h
    MOV AL, 03h
    INT 10h

    ; 2. Çekirdek Karşılama Başlığını Yazdır
    MOV SI, KERNEL_BANNER
    CALL KERNEL_PRINT_STR

    ; 3. Shell (Komut İstemcisi) Modülüne Devret
    JMP SHELL_START

KERNEL_PRINT_STR:
    PUSHA
.loop:
    LODSB
    OR AL, AL
    JZ .done
    MOV AH, 0Eh
    MOV BL, 0Fh         ; Parlak Beyaz
    INT 10h
    JMP .loop
.done:
    POPA
    RET

KERNEL_BANNER:
    DB "=================================================", 13, 10
    DB " [KERNEL] Cekirdek v1.0 RAM'de Aktif (Adres: 1000h)", 13, 10
    DB " Bellek: 640 KB Gecerli | Ekran: CRT VRAM Aktif  ", 13, 10
    DB "=================================================", 13, 10, 0

SHELL_START:
    HLT
`;

export const SCREEN_ASM_TEMPLATE = `; ==============================================================================
; +-----------------------------------------------------------------------------+
; | 🎯 GÖREV 3: CRT EKRAN & METİN SÜRÜCÜSÜ (DISPLAY DRIVER)                    |
; +-----------------------------------------------------------------------------+
; | 📥 GİRİŞ:  PUTC: AL = Karakter, BL = Renk kodu                              |
; |            PUTS: SI = Null (0) ile biten string RAM adresi                  |
; |            SET_CURSOR: DH = Satır (0-24), DL = Sütun (0-79)                 |
; |            CLEAR: Giriş parametresi yok                                     |
; | 📤 ÇIKIŞ:  Karakterler CRT monitöre basılır, imleç güncellenir              |
; |            Çağıran yazmaçlar PUSHA ve POPA ile korunur                      |
; | ⚙️ İSTENEN: 1. SCREEN_CLEAR ile INT 10h (AH=00h, AL=03h) çağır              |
; |            2. SCREEN_PUTC ile INT 10h (AH=0Eh) çağır                        |
; |            3. SCREEN_PUTS içinde LODSB ile sıfıra kadar döngü kur           |
; |            4. Fonksiyonların başında PUSHA, sonunda POPA ve RET kullan      |
; | 🧪 TEST:   CALL SCREEN_CLEAR ardından SI'ye metin verip CALL SCREEN_PUTS    |
; |            yaparak CRT ekranda çıktıyı doğrulayın.                          |
; +-----------------------------------------------------------------------------+
; ==============================================================================

; --- RUTİN 1: Ekranı Temizle ---
SCREEN_CLEAR:
    PUSHA
    MOV AH, 00h
    MOV AL, 03h         ; 80x25 Standart Metin Modu
    INT 10h
    POPA
    RET

; --- RUTİN 2: İmleci Konumlandır ---
; Giriş: DH = Satır (0-24), DL = Sütun (0-79)
SCREEN_SET_CURSOR:
    PUSHA
    MOV AH, 02h
    MOV BH, 00h         ; Sayfa 0
    INT 10h
    POPA
    RET

; --- RUTİN 3: Tek Karakter Bas (Teletype) ---
; Giriş: AL = Karakter, BL = Renk Özelliği
SCREEN_PUTC:
    PUSHA
    MOV AH, 0Eh
    INT 10h
    POPA
    RET

; --- RUTİN 4: Sıfır Sonlandırmalı String Bas ---
; Giriş: SI = String adresi, BL = Renk
SCREEN_PUTS:
    PUSHA
.loop:
    LODSB
    OR AL, AL
    JZ .done
    MOV AH, 0Eh
    INT 10h
    JMP .loop
.done:
    POPA
    RET
`;

export const KEYBOARD_ASM_TEMPLATE = `; ==============================================================================
; +-----------------------------------------------------------------------------+
; | 🎯 GÖREV 4: KLAVYE SÜRÜCÜSÜ & SATIR TAMPONU (KEYBOARD DRIVER)              |
; +-----------------------------------------------------------------------------+
; | 📥 GİRİŞ:  READ_CHAR: Giriş yok                                             |
; |            CHECK_KEY: Giriş yok                                             |
; |            READ_LINE: DI = Karakter tampon RAM adresi                       |
; |                       CX = Maksimum karakter sınırı                         |
; | 📤 ÇIKIŞ:  READ_CHAR: AL = ASCII tuş kodu, AH = Hardware Scan Code          |
; |            CHECK_KEY: ZF=1 (Tuş yok), ZF=0 (Tuş hazır, AL=ASCII)            |
; |            READ_LINE: [DI] içinde null ile biten metin, CRT ekranında Echo  |
; | ⚙️ İSTENEN: 1. KEYBOARD_READ_CHAR içinde INT 16h (AH=00h) çağır             |
; |            2. READ_LINE içinde her tuşu ekrana yansıt (Echo)                |
; |            3. Enter (13) basılırsa tamponu 0 ile bitir ve CR+LF bas         |
; |            4. Backspace (8) basılırsa tampon sayacını 1 azalt, CRT ekranda  |
; |               boşlukla sil                                                  |
; | 🧪 TEST:   Çalıştırıp monitöre tıklayın, klavyeden yazı yazın, Backspace ile|
; |            silip Enter'a basarak tamponun dolduğunu test edin.              |
; +-----------------------------------------------------------------------------+
; ==============================================================================

; --- RUTİN 1: Tuş Basılmasını Bekle ve Oku ---
; Çıkış: AL = Tuşun ASCII Kodu, AH = Donanımsal Tarama Kodu (Scan Code)
KEYBOARD_READ_CHAR:
    MOV AH, 00h
    INT 16h
    RET

; --- RUTİN 2: Tuşa Basıldı mı Kontrol Et (Bloklamaz) ---
; Çıkış: ZF = 1 ise tuş yok; ZF = 0 ise tuş hazır (AL = ASCII)
KEYBOARD_CHECK_KEY:
    MOV AH, 01h
    INT 16h
    RET

; --- RUTİN 3: Bir Satır Metin Oku (String Input Buffer) ---
; Giriş: DI = Tamponun RAM adresi, CX = Maksimum Karakter Sayısı
KEYBOARD_READ_LINE:
    PUSHA
    XOR BX, BX          ; Karakter sayacı = 0
.read_loop:
    CALL KEYBOARD_READ_CHAR
    
    ; ENTER tuşu mu?
    CMP AL, 13
    JE .enter_pressed

    ; BACKSPACE tuşu mu?
    CMP AL, 8
    JE .backspace_pressed

    ; Maksimum uzunluğa ulaşıldı mı?
    CMP BX, CX
    JAE .read_loop

    ; Karakteri tampona kaydet ve ekrana bas
    MOV [DI + BX], AL
    INC BX
    MOV AH, 0Eh
    MOV BL, 0Fh
    INT 10h
    JMP .read_loop

.backspace_pressed:
    CMP BX, 0
    JE .read_loop
    DEC BX
    ; Ekranda geri al ve boşlukla sil
    MOV AH, 0Eh
    MOV AL, 8
    INT 10h
    MOV AL, ' '
    INT 10h
    MOV AL, 8
    INT 10h
    JMP .read_loop

.enter_pressed:
    MOV BYTE PTR [DI + BX], 0 ; Null ile bitir
    ; Alt satıra geç (CR + LF)
    MOV AH, 0Eh
    MOV AL, 13
    INT 10h
    MOV AL, 10
    INT 10h
    POPA
    RET
`;

export const SHELL_ASM_TEMPLATE = `; ==============================================================================
; +-----------------------------------------------------------------------------+
; | 🎯 GÖREV 5: ETKİLEŞİMLİ KOMUT KABUĞU (CLI SHELL)                            |
; +-----------------------------------------------------------------------------+
; | 📥 GİRİŞ:  SHELL_INPUT_BUFFER: Klavyeden girilen komut dizisi               |
; | 📤 ÇIKIŞ:  "help" yazılırsa: Yardım menüsü metni                           |
; |            "cls" yazılırsa: CRT ekranının sıfırlanması                      |
; |            Bilinmeyen komutta: Hata mesajı                                  |
; |            Her işlem sonunda tekrar "BenimOS> " komut istemi                |
; | ⚙️ İSTENEN: 1. Sonsuz döngüde SHELL_PROMPT ("BenimOS> ") yazdır             |
; |            2. KEYBOARD_READ_LINE ile komut satırını oku                     |
; |            3. STRING_COMPARE ile komutu "help" ve "cls" ile karşılaştır     |
; |            4. Eşleşen komut rutinini çalıştırıp yeni satırda döngüye dön     |
; | 🧪 TEST:   Monitörde "help" yazıp Enter'a basın; ardından "cls" yazıp       |
; |            ekranın temizlendiğini test edin.                                |
; +-----------------------------------------------------------------------------+
; ==============================================================================

SHELL_MAIN_LOOP:
    ; Komut İstemini Göster
    MOV SI, SHELL_PROMPT
    CALL SCREEN_PUTS

    ; Klavyeden Komut Satırı Oku
    MOV DI, SHELL_INPUT_BUFFER
    MOV CX, 64                  ; Maksimum 64 karakter
    CALL KEYBOARD_READ_LINE

    ; Komutu Çözümle
    MOV SI, SHELL_INPUT_BUFFER
    
    ; Boş giriş kontrolü
    CMP BYTE PTR [SI], 0
    JE SHELL_MAIN_LOOP

    ; 'help' komutu mu?
    MOV DI, CMD_HELP_STR
    CALL STRING_COMPARE
    JE CMD_HELP_EXEC

    ; 'cls' komutu mu?
    MOV DI, CMD_CLS_STR
    CALL STRING_COMPARE
    JE CMD_CLS_EXEC

    ; Bilinmeyen Komut
    MOV SI, ERR_UNKNOWN_CMD
    CALL SCREEN_PUTS
    JMP SHELL_MAIN_LOOP

CMD_HELP_EXEC:
    MOV SI, HELP_TEXT
    CALL SCREEN_PUTS
    JMP SHELL_MAIN_LOOP

CMD_CLS_EXEC:
    CALL SCREEN_CLEAR
    JMP SHELL_MAIN_LOOP

; --- STRING KARŞILAŞTIRMA (SI ile DI eşit mi?) ---
; Çıkış: ZF=1 ise eşit, ZF=0 ise farklı
STRING_COMPARE:
    PUSHA
.cmp_loop:
    MOV AL, [SI]
    MOV BL, [DI]
    CMP AL, BL
    JNE .not_equal
    OR AL, AL
    JZ .equal
    INC SI
    INC DI
    JMP .cmp_loop
.not_equal:
    POPA
    OR AL, 1            ; ZF = 0 yap
    RET
.equal:
    POPA
    XOR AX, AX          ; ZF = 1 yap
    RET

; --- SHELL VERİLERİ ---
SHELL_PROMPT:      DB "BenimOS> ", 0
CMD_HELP_STR:      DB "help", 0
CMD_CLS_STR:       DB "cls", 0
ERR_UNKNOWN_CMD:   DB "Bilinmeyen komut! 'help' yazarak komutlari gorebilirsiniz.", 13, 10, 0
HELP_TEXT:
    DB "Mevcut Komutlar:", 13, 10
    DB "  help - Bu yardim mesajini gosterir", 13, 10
    DB "  cls  - CRT ekranini temizler", 13, 10, 0

SHELL_INPUT_BUFFER: DB 64 DUP(0)

; --- HARİCİ SÜRÜCÜ BAĞLANTILARI (screen.asm ve keyboard.asm ile entegre) ---
SCREEN_PUTS:
    PUSHA
.loop:
    LODSB
    OR AL, AL
    JZ .done
    MOV AH, 0Eh
    INT 10h
    JMP .loop
.done:
    POPA
    RET

SCREEN_CLEAR:
    MOV AH, 00h
    MOV AL, 03h
    INT 10h
    RET

KEYBOARD_READ_LINE:
    MOV AH, 00h
    INT 16h
    MOV BYTE PTR [DI], AL
    MOV BYTE PTR [DI+1], 0
    RET
`;
