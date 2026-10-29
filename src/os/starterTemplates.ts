/**
 * starterTemplates.ts
 * 
 * OS Sandbox için zengin mimari rehberi ve modül başlangıç şablonları.
 */

export const OS_GUIDE_TEMPLATE = `; ==============================================================================
; 📘 SIFIRDAN İŞLETİM SİSTEMİ MİMARİSİ VE GELİŞTİRME REHBERİ
; ==============================================================================
; Bu dosya, kendi x86 / 8086 işletim sisteminizi inşa ederken her kararın
; arkasındaki donanımsal mantığı, bellek haritasını ve kod yapısını öğretir.
;
; İÇİNDEKİLER:
; 1. BİLGİSAYAR AÇILDIĞINDA NE OLUR? (BOOT SIRASI & DONANIM)
; 2. BELLEK HARİTASI (NEDEN 7C00H? NEDEN 0700H? BAŞKA SAYI SEÇİLEMEZ Mİ?)
; 3. YAZMAÇLAR (REGISTERS) VE GÖREVLERİ
; 4. KESMELER (INTERRUPTS) VE IVT TABLOSU
; 5. MODÜL MİMARİSİ VE ADIM ADIM İŞLETİM SİSTEMİ YAPIMI
; 6. ÇALIŞAN TAM REFERANS KODU
; ==============================================================================

; ------------------------------------------------------------------------------
; BÖLÜM 1: BİLGİSAYAR AÇILDIĞINDA DONANIMDA NE OLUR?
; ------------------------------------------------------------------------------
; 1. Güç Düğmesi: Anakart CPU'ya RESET sinyali gönderir.
; 2. Reset Vektörü: 8086 CPU mimarisi donanımsal olarak CS=0FFFFh, IP=0000h ile
;    uyanır. Fiziksel adres: (0FFFFh * 16) + 0000h = 0FFFF0h. Burası anakarttaki
;    ROM BIOS çipinin başlangıcıdır.
; 3. POST (Power-On Self Test): BIOS RAM'i, ekranı, klavyeyi ve sürücüleri test eder.
; 4. MBR Taraması: BIOS sabit disk veya disketin ilk sektörünü (512 bayt) okur.
;    Eğer son iki bayt 55h ve AAh (Boot İmzası) ise bu geçerli bir Bootloader'dır.
; 5. RAM'e Yükleme: BIOS bu 512 baytı RAM'in 0000:7C00h adresine kopyalar ve
;    işlemciyi 'JMP 0000:7C00h' ile oraya yönlendirir.
;    ARTIK TÜM DONANIM VE İŞLEMCİ KONTROLÜ SİZİN KODUNUZDADIR!

; ------------------------------------------------------------------------------
; BÖLÜM 2: BELLEK HARİTASI VE ADRES KARARLARI
; ------------------------------------------------------------------------------
; 8086 Gerçek Modu (Real Mode) 1 MB (1,048,576 bayt) adres alanına sahiptir:
;
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
;
; ❓ SORU: NEDEN 7C00h? NEDEN BAŞKA BİR SAYI DEĞİL?
; CEVAP: 1981 yılında ilk IBM PC 5150 tasarlanırken en düşük RAM kapasitesi
; 32 KB idi (32 * 1024 = 32768 bayt = 0x8000h).
; Bootloader 512 bayttır (0x200h).
; IBM mühendisleri dediler ki: "Bootloader'ı 32 KB'lık belleğin en sonuna koyalım
; ki altında (0x0500 ile 0x7BFF arasında) işletim sistemi için tek parça en geniş
; boş RAM alanı kalsın."
; Hesap: 0x8000 - 0x0200 = 0x7C00!
; Bu yüzden tüm x86 PC BIOS'ları diski mutlaka 0000:7C00h adresine indirir.
;
; ❓ SORU: BEN BAŞKA BİR SAYI SEÇEMEZ MİYİM?
; CEVAP: 
; 1. Bootloader için: BIOS donanımı kodlanmış olduğu için ilk 512 bayt mutlaka
;    7C00h'a gelir. FAKAT bootloader kodunuz başlar başlamaz kendini RAM'in
;    istediğiniz yerine kopyalayabilir (Relocation)! Örneğin kendini 0600h'a
;    kopyalayıp oraya zıplayabilir (Linux & Windows bootloader'ları bunu yapar).
; 2. Kernel (Çekirdek) için: %100 ÖZGÜRSÜNÜZ! BIOS Kernel'ı yüklemez; Kernel'ı
;    yükleyen sizsiniz (Bootloader'ınız). İster 1000h adresine koyun, ister
;    2000h, ister 0700h. Tek kural IVT (0-3FFh) ve BDA (400-4FFh)'ya yazmayın!
;
; ❓ SORU: 0700h / 0100h NEREDEN GELİYOR?
; CEVAP: MS-DOS COM programları her zaman segmentin 0100h ofsetine yüklenir.
; İlk 256 bayt (0000h-00FFh) PSP (Program Segment Prefix) için ayrılmıştır.
; 0700:0100h adresi alt bellekten uzak, son derece güvenli bir standart alandır.

; ------------------------------------------------------------------------------
; BÖLÜM 3: YAZMAÇLAR (REGISTERS) NE İŞ YAPAR?
; ------------------------------------------------------------------------------
; - AX (Akümülatör): Matematik, I/O ve kesme fonksiyon kodları (AH=işlev, AL=veri).
; - BX (Taban/Base): Bellek taban adresi işaretçisi (Pointer).
; - CX (Sayaç/Counter): Döngü (LOOP) ve string işlemlerinde (REP) sayaç.
; - DX (Veri/Data): Çarpma/bölme işlemlerinde ve I/O port adreslerinde kullanılır.
; - SI (Kaynak İndeks): Kaynak bellek işaretçisi (String okurken: LODSB).
; - DI (Hedef İndeks): Hedef bellek işaretçisi (Video belleğine yazarken: STOSW).
; - SP (Yığın İşaretçisi): Stack'in tepesi (PUSH edince küçülür, POP ile büyür).
; - BP (Taban İşaretçisi): Fonksiyon yerel değişkenlerine erişim işaretçisi.
; - CS, DS, SS, ES: Segment yazmaçları (Kod, Veri, Yığın, Ekstra).

; ------------------------------------------------------------------------------
; BÖLÜM 4: KESMELER (INTERRUPTS) VE EKRAN / KLAVYE
; ------------------------------------------------------------------------------
; - INT 10h: Video / CRT Monitör Sürücüsü
;     AH = 0Eh -> Teletype karakter yazma (AL = ASCII Karakteri, BL = Renk)
;     AH = 00h -> Video modu ayarlama (AL = 03h: 80x25 16 Renk Metin Modu)
;     AH = 02h -> İmleç konumlandırma (DH = Satır, DL = Sütun)
; - INT 16h: Klavye Sürücüsü
;     AH = 00h -> Tuşa basılmasını bekle ve oku (AL = ASCII Kodu döner)
;     AH = 01h -> Tuş basıldı mı kontrol et (ZF bayrağı)
; - VRAM Doğrudan Erişim:
;     Segment 0B800h adresi ekranın piksel/karakter hafızasıdır.
;     Her karakter 2 bayttır: [ASCII Karakteri] + [Renk Özelliği (Attribute)].

; ==============================================================================
; BÖLÜM 5: ÇALIŞAN TAM REFERANS İŞLETİM SİSTEMİ (MİNİ ÖRNEK)
; Aşağıdaki kod tam çalışan bir mini çekirdektir. Simülatörde "Çalıştır" diyerek
; hemen CRT Monitörde test edebilirsiniz!
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

; 3. Ana Etkileşimli Shell (Komut İstemcisi) Döngüsü
SHELL_LOOP:
    ; Klavyeden bir tuş bekle
    MOV AH, 00h
    INT 16h             ; AL = basılan tuşun ASCII değeri

    ; ENTER basıldı mı? (ASCII 13 / 0Dh)
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

; ------------------------------------------------------------------------------
; ALT RUTİNLER (DRIVERS)
; ------------------------------------------------------------------------------
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

; ------------------------------------------------------------------------------
; VERİ ALANI (STRINGS & VERİLER)
; ------------------------------------------------------------------------------
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
; [MODÜL 1] boot.asm - MBR Önyükleyici (Bootloader)
; ==============================================================================
; BIOS bilgisayar açıldığında bu kodu diskin ilk 512 baytından okur ve
; RAM'in 0000:7C00h fiziksel adresine yükleyip CS:IP'yi buraya yönlendirir.
;
; Görevi: Donanım segmentlerini sıfırlamak, yığını kurmak ve Kernel'ı yüklemek.
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
    ; Simülatörümüzde doğrudan Kernel başlangıcına atlıyoruz:
    JMP KERNEL_ENTRY

BOOT_PRINT:
    LODSB
    OR AL, AL
    JZ .done
    MOV AH, 0Eh
    MOV BL, 0Ah         ; CRT Yeşili
    INT 10h
    JMP BOOT_PRINT
.done:
    RET

BOOT_MSG:
    DB ">> [BOOTLOADER] BIOS MBR yuklendi (0x7C00). Kernel calistiriliyor...", 13, 10, 0

; Simülatör için Kernel giriş noktası etiketi:
KERNEL_ENTRY:
    HLT

; 512 Bayt MBR Dolgusu ve İmzası
DW 0AA55h
`;

export const KERNEL_ASM_TEMPLATE = `; ==============================================================================
; [MODÜL 2] kernel.asm - Ana Çekirdek (Core Kernel)
; ==============================================================================
; Bootloader tarafından RAM'e (genellikle 1000h adresine) yüklenen ve
; sistemin tüm donanımını, sürücülerini ve komut istemcisini yöneten beyin.
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
; [MODÜL 3] screen.asm - Video & CRT Ekran Sürücüsü (Display Driver)
; ==============================================================================
; Bu modül ekrana karakter basma, renkli metin yazdırma, imleç yönetimi ve
; VRAM (0B800h) doğrudan erişim rutinlerini içerir.
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
; [MODÜL 4] keyboard.asm - Klavye Sürücüsü (Keyboard Driver)
; ==============================================================================
; Klavyeden karakter okuma, tuş tamponu (buffer) kontrolü ve
; ekrana yansıtma (echo) işlemlerini üstlenir.
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
    MOV BYTE [DI + BX], 0 ; Null ile bitir
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
; [MODÜL 5] shell.asm - Komut İstemcisi ve Yorumlayıcı (CLI Shell)
; ==============================================================================
; Kullanıcıdan gelen komutları ayrıştıran, yorumlayan ve alt programları
; çalıştıran etkileşimli kabuk (Shell).
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
    CMP BYTE [SI], 0
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
