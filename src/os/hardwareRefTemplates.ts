/**
 * hardwareRefTemplates.ts
 * 
 * Bilgisayar donanımının (BIOS ROM, Kesme Vektör Tablosu - IVT, BIOS Veri Alanı - BDA)
 * kaynak kodlarını ve referans belgelerini içerir.
 * 
 * Kullanıcı bu kodları yazmak zorunda DEĞİLDİR; anakart donanımının arka planda
 * ne yaptığını, hangi yazmaçları kullandığını ve ne döndürdüğünü incelemek için
 * salt okunur referans olarak sunulur.
 */

export const REF_BIOS_ROM_TEMPLATE = `; ==============================================================================
; 🏛️ [DONANIM REFERANSI] BIOS ROM Kaynak Kodu (Anakart Salt Okunur Belleği)
; Adres Aralığı: F000:0000h - F000:FFFFh (Fiziksel: 0xF0000 - 0xFFFFF)
; ==============================================================================
; DİKKAT: Bu dosyayı sizin yazmanız GEREKMEZ! 
; Bu dosya, anakartın üzerindeki ROM çipinin içinde zaten var olan kodları,
; çağırdığınız INT 10h / INT 16h kesmelerinin arka planda ne yaptığını ve
; yazmaçlara (Registers) ne değerler döndürdüğünü görmeniz için hazırlanmıştır.
; ==============================================================================

ORG 0F0000h

; ------------------------------------------------------------------------------
; 1. BIOS TANIMLAYICI VE TELİF HAKKI
; ------------------------------------------------------------------------------
BIOS_HEADER:
    DB "IBM COMPATIBLE 8086 ROM BIOS (C) 1981-2026 ASSEMBLY SIMULATOR", 0

; ------------------------------------------------------------------------------
; 2. INT 10h - VİDEO VE CRT EKRAN SERVİS RUTİNİ (Adres: F000:1000h)
; ------------------------------------------------------------------------------
; Siz kodunuzda "INT 10h" yazdığınızda işlemci buradaki kodu çalıştırır.
; Hangi işlevin çalışacağı AH yazmacındaki koda göre belirlenir.
; ------------------------------------------------------------------------------
BIOS_INT10_HANDLER:
    PUSH BX
    PUSH CX
    PUSH DX
    PUSH ES
    PUSH SI
    PUSH DI

    ; AH = 0Eh ise: Teletype Karakter Yazma
    CMP AH, 0Eh
    JE .func_teletype

    ; AH = 00h ise: Video Modu Ayarlama
    CMP AH, 00h
    JE .func_set_video_mode

    ; AH = 02h ise: İmleç Konumlandırma
    CMP AH, 02h
    JE .func_set_cursor_pos

    ; AH = 03h ise: İmleç Konumunu Oku
    CMP AH, 03h
    JE .func_get_cursor_pos

    JMP .exit_int10

; --- [FONKSİYON 0Eh] TELETYPE KARAKTER YAZMA ---
; GİRDİ:
;   AL = Yazılacak ASCII karakter (Örn: 'A', 13 [CR], 10 [LF], 8 [Backspace])
;   BL = Metin rengi / Özelliği (Attribute) (Örn: 0Ah = CRT Yeşili, 0Fh = Beyaz)
;   BH = Ekran Sayfası (Varsayılan 0)
; NE DÖNDÜRÜR:
;   Karakteri VRAM'e yazar, imleci 1 sütun sağa kaydırır.
;   Satır sonuna geldiyse otomatik alt satıra geçer.
; -------------------------------------------------
.func_teletype:
    ; 1. Satır başı (Carriage Return - CR 13) kontrolü
    CMP AL, 13
    JE .handle_cr

    ; 2. Alt satır (Line Feed - LF 10) kontrolü
    CMP AL, 10
    JE .handle_lf

    ; 3. Normal karakter: Doğrudan VGA Metin Modu VRAM'ine (0B800h) yaz
    MOV BX, 0B800h
    MOV ES, BX          ; ES = VRAM Segmenti
    ; Fiziksel Ofset = (Satır * 80 + Sütun) * 2
    ; [ES:DI] = ASCII Karakter, [ES:DI+1] = Renk Baytı
    ; Karakter basılır ve imleç sütunu 1 artırılır.
    JMP .exit_int10

.handle_cr:
    ; İmleç sütununu (DL) 0 yap
    JMP .exit_int10

.handle_lf:
    ; İmleç satırını (DH) 1 artır; 25. satıra geldiyse ekranı yukarı kaydır (Scroll)
    JMP .exit_int10

; --- [FONKSİYON 00h] VİDEO MODU DEĞİŞTİRME ---
; GİRDİ:
;   AL = İstenen mod (03h: 80x25 16 Renk CRT Metin Modu)
; NE DÖNDÜRÜR:
;   AL = CRT kontrolcü bayrağı, ekran temizlenir, BDA video modu güncellenir.
; -------------------------------------------------
.func_set_video_mode:
    ; CRT Donanım Kontrolcüsü Portuna (0x3D4) ayarları gönder
    ; 0B800h VRAM alanındaki 2000 hücreyi (80x25) temizle
    JMP .exit_int10

; --- [FONKSİYON 02h] İMLEÇ KONUMLANDIR ---
; GİRDİ:
;   DH = Satır numarası (0 - 24)
;   DL = Sütun numarası (0 - 79)
;   BH = Sayfa numarası (0)
; NE DÖNDÜRÜR:
;   Donanımsal imleci belirtilen satır ve sütuna taşır.
; -------------------------------------------------
.func_set_cursor_pos:
    ; BDA'daki 0040:0050h imleç tablosuna DH ve DL değerlerini kaydeder.
    JMP .exit_int10

.func_get_cursor_pos:
    ; ÇIKIŞ: DH = Satır, DL = Sütun döner.
    JMP .exit_int10

.exit_int10:
    POP DI
    POP SI
    POP ES
    POP DX
    POP CX
    POP BX
    IRET                ; Kesmeden geri dön (Stack'ten IP, CS, FLAGS çeker)

; ------------------------------------------------------------------------------
; 3. INT 16h - KLAVYE BIOS SERVİS RUTİNİ (Adres: F000:1600h)
; ------------------------------------------------------------------------------
; Klavyeden tuş okunduğunda donanım klavye çipi (Intel 8042) ile haberleşir.
; ------------------------------------------------------------------------------
BIOS_INT16_HANDLER:
    ; AH = 00h ise: Tuş basılana kadar bekle ve oku (Bloklar)
    CMP AH, 00h
    JE .func_wait_key

    ; AH = 01h ise: Tuş basıldı mı kontrol et (Bloklamaz)
    CMP AH, 01h
    JE .func_check_key

    IRET

; --- [FONKSİYON 00h] TUŞ BEKLE VE OKU ---
; GİRDİ:
;   Yok (AH = 00h olması yeterli)
; NE DÖNDÜRÜR:
;   AL = Basılan tuşun ASCII karakter kodu (Örn: 'a' = 61h, Enter = 0Dh, Backspace = 08h)
;   AH = Donanımsal Tarama Kodu (Hardware Scan Code - Örn: 'A' için 1Eh, Enter için 1Ch)
; -------------------------------------------------
.func_wait_key:
.wait_loop:
    ; BDA içindeki Klavye Tamponu işaretçilerini (Head ve Tail) kontrol et
    ; Head == Tail ise tampon boştur -> Tuş beklenir
    ; Tuş geldiğinde tampondan çeker:
    ; MOV AL, [Tampon_Karakteri]
    ; MOV AH, [Tampon_TaramaKodu]
    IRET

; --- [FONKSİYON 01h] TUŞ BASILDI MI KONTROL ET ---
; GİRDİ:
;   Yok (AH = 01h)
; NE DÖNDÜRÜR:
;   ZF = 1 (Zero Flag Set): Tampon boş, basılan tuş yok!
;   ZF = 0 (Zero Flag Clear): Tamponda tuş HAZIR!
;     AL = Hazırdaki tuşun ASCII kodu (tuş tamponda kalmaya devam eder)
;     AH = Hazırdaki tuşun Tarama kodu
; -------------------------------------------------
.func_check_key:
    ; Tampon dolu mu kontrol et:
    ; Doluysa ZF=0 yap, boşsa ZF=1 yap
    IRET

; ------------------------------------------------------------------------------
; 4. INT 13h - SABİT DİSK VE DİSKET SERVİS RUTİNİ
; ------------------------------------------------------------------------------
; Diskin sektörlerini okuyup RAM'e yazmak için kullanılır.
; GİRDİ:
;   AH = 02h (Sektör Oku)
;   AL = Okunacak sektör sayısı
;   CH = Silindir no (0-1023)
;   CL = Sektör no (1-63)
;   DH = Kafa (Head) no (0-255)
;   DL = Sürücü no (00h = Floppy, 80h = 1. Sabit Disk)
;   ES:BX = Verinin yazılacağı RAM hedef adresi
; NE DÖNDÜRÜR:
;   CF = 0 (Carry Temiz): Başarılı! AH = 00h, AL = Okunan sektör sayısı.
;   CF = 1 (Carry Set): Hata oluştu! AH = Hata Kodu.
; ------------------------------------------------------------------------------
BIOS_INT13_HANDLER:
    ; Disk kontrolcüsü I/O portları (0x1F0 - 0x1F7) üzerinden disk okunur
    CLC                 ; Başarılı: Carry flag temizle
    MOV AH, 00h         ; Hata yok
    IRET

; ------------------------------------------------------------------------------
; 5. INT 19h - BOOTSTRAP LOADER (MBR ÖNYÜKLEME RUTİNİ)
; ------------------------------------------------------------------------------
; Bilgisayar açılışında POST bittikten sonra diskin ilk sektörünü RAM'e indiren kod.
; ------------------------------------------------------------------------------
BIOS_BOOTSTRAP_LOADER:
    ; 1. Diskin ilk sektörünü (LBA 0 / Silindir 0, Kafa 0, Sektör 1) oku:
    MOV AX, 0201h       ; AH=02h (Oku), AL=01h (1 Sektör)
    MOV CX, 0001h       ; CH=0 (Silindir 0), CL=1 (Sektör 1)
    MOV DX, 0080h       ; DH=0 (Kafa 0), DL=80h (1. Sabit Disk)
    XOR BX, BX
    MOV ES, BX
    MOV BX, 7C00h       ; Hedef: 0000:7C00h RAM adresi
    INT 13h

    ; 2. Boot İmzası Kontrolü (Son 2 bayt 0xAA55 mi?)
    CMP WORD [ES:7DFEh], 0AA55h
    JNE .boot_failed

    ; 3. Başarılı! Kontrolü kullanıcı koduna devret:
    JMP 0000:7C00h      ; KONTROL ARTIK SİZİN BOOTLOADER'INIZDA!

.boot_failed:
    ; "No bootable device found" mesajı bas ve durdur
    HLT

; ------------------------------------------------------------------------------
; 6. CPU POWER-ON RESET VEKTÖRÜ (Adres: 0xFFFF0)
; ------------------------------------------------------------------------------
; İşlemciye elektrik verildiğinde 8086 donanımı CS=FFFFh, IP=0000h yapar.
; İşlemcinin evrende okuduğu İLK TALİMAT tam olarak buradadır:
; ------------------------------------------------------------------------------
ORG 0FFFF0h
RESET_VECTOR:
    JMP 0F000h:0E05Bh   ; Anakartın BIOS POST (Power-On Self Test) başlangıcına atla!

; BIOS Sürüm Tarihi (8 Bayt Standart ASCII: MM/DD/YY)
ORG 0FFFF5h
    DB "01/01/81"

; Sistem Model Tanımlayıcısı (0xFF = Standart Orijinal IBM PC)
ORG 0FFFFEh
    DB 0FFh
`;

export const REF_IVT_TABLE_TEMPLATE = `; ==============================================================================
; ⚡ [DONANIM REFERANSI] IVT (Kesme Vektör Tablosu - Interrupt Vector Table)
; Adres Aralığı: 0000:0000h - 0000:03FFh (Fiziksel: 0x00000 - 0x003FF, 1024 Bayt)
; ==============================================================================
; DİKKAT: Bu kodları yazmanız gerekmez; RAM'in en altında donanımsal olarak
; nasıl dizildiklerini ve hangi kesmenin nereye gittiğini gösteren haritadır.
;
; YAPISI:
; Tabloda 256 adet kesme vardır (INT 0 - INT 255).
; Her kesme vektörü RAM'de tam 4 bayt yer kaplar:
;   - İlk 2 Bayt: Fonksiyonun IP (Offset) adresi
;   - Sonraki 2 Bayt: Fonksiyonun CS (Segment) adresi
; Formül: INT N adresi = N * 4
; ==============================================================================

; --- TEMEL KESME HARİTASI ---
;
; Kesme No | Bellek Adresi | Görevi / Yönlendirdiği Adres
; -------- | ------------- | ---------------------------------------------
; INT 00h  | 0x00000       | Sıfıra Bölme Hatası (Divide by Zero)
; INT 01h  | 0x00004       | Tek Adım Hata Ayıklama (Single Step Trap)
; INT 02h  | 0x00008       | NMI (Maskelenemeyen Donanım Kesmesi)
; INT 03h  | 0x0000C       | Kesme Noktası (Breakpoint - CC opcode)
; INT 04h  | 0x00010       | Taşma Hatası (INTO - Overflow)
; INT 08h  | 0x00020       | Donanımsal Zamanlayıcı (PIT Timer IRQ 0 - 18.2 Hz)
; INT 09h  | 0x00024       | Donanımsal Klavye Kesmesi (Keyboard IRQ 1)
; INT 10h  | 0x00040       | BIOS Video & CRT Ekran Servisi (F000:1000h)
; INT 13h  | 0x0004C       | BIOS Sabit Disk & Disket Servisi (F000:1300h)
; INT 16h  | 0x00058       | BIOS Klavye Okuma Servisi (F000:1600h)
; INT 19h  | 0x00064       | BIOS Bootstrap Önyükleyici (F000:E6F2h)
; INT 20h  | 0x00080       | DOS Program Sonlandırma
; INT 21h  | 0x00084       | DOS Ana Sistem Çağrıları (System Calls)
;
; ==============================================================================
; IVT ÖRNEĞİ: KENDİ ÖZEL KESMENİZİ NASIL EKLERSİNİZ?
; Örneğin INT 80h (Sistem Çağrısı) fonksiyonu yazmak isterseniz:
; ==============================================================================

; Adım 1: INT 80h'nin IVT adresini hesapla:
; 80h = 128 (onluk tabanda) -> 128 * 4 = 512 = 0x200 fiziksel adres

INSTALL_MY_CUSTOM_INT:
    CLI                 ; Tablo güncellenirken kesmeleri sustur
    XOR AX, AX
    MOV ES, AX          ; ES = 0000h (IVT Segmenti)

    ; Kendi fonksiyonumuzun IP ve CS adresini yazalım:
    MOV WORD [ES:0200h], MY_SYSCALL_ROUTINE ; IP adresi
    MOV WORD [ES:0202h], CS                 ; CS adresi
    STI                 ; Kesmeleri aç
    RET

; Kendi Kesme Rutinimiz:
MY_SYSCALL_ROUTINE:
    ; Burada işletim sistemi komutu çalışır...
    IRET                ; KESMEDEN DÖNÜŞ (IP, CS, FLAGS geri çekilir)
`;

export const REF_BDA_MAP_TEMPLATE = `; ==============================================================================
; 📊 [DONANIM REFERANSI] BDA (BIOS Data Area - BIOS Veri Alanı Haritası)
; Adres Aralığı: 0040:0000h - 0040:00FFh (Fiziksel: 0x00400 - 0x004FF, 256 Bayt)
; ==============================================================================
; DİKKAT: Bu alan, BIOS'un donanım durumlarını sakladığı bellek bölgesidir.
; İşletim sisteminiz buradaki adresleri doğrudan okuyarak donanım hakkında
; bilgi sahibi olabilir!
; ==============================================================================

; --- ÖNEMLİ BDA ADRESLERİ VE ANLAMLARI ---
;
; Ofset       | Boyut  | Anlamı ve Ne İşe Yaradığı
; ----------- | ------ | -------------------------------------------------------
; 0040:0000h  | 8 Byte | COM1, COM2, COM3, COM4 Seri Port Adresleri (Örn: 03F8h)
; 0040:0008h  | 8 Byte | LPT1, LPT2, LPT3 Paralel Yazıcı Port Adresleri
; 0040:0010h  | 2 Byte | Donanım Ekipman Listesi (Equipment Word)
; 0040:0013h  | 2 Byte | Taban Bellek Boyutu (KB cinsinden, örn: 640 KB = 0280h)
; 0040:0017h  | 1 Byte | Klavye Shift / Ctrl / Alt / CapsLock Tuş Durum Baytı
; 0040:001Ah  | 2 Byte | Klavye Dairesel Tampon Baş İşaretçisi (Buffer Head)
; 0040:001Ch  | 2 Byte | Klavye Dairesel Tampon Son İşaretçisi (Buffer Tail)
; 0040:001Eh  | 32 B   | Klavye Dairesel Tuş Tamponu (Key Buffer - 16 tuş saklar)
; 0040:0049h  | 1 Byte | Mevcut Ekran Video Modu (Örn: 03h = 80x25 Renkli CRT)
; 0040:004Ah  | 2 Byte | Ekran Sütun Sayısı (Metin modunda 80 = 0050h)
; 0040:0050h  | 16 B   | 8 Sayfanın İmleç Konumları (Her sayfa 2 bayt: Satır, Sütun)
; 0040:006Ch  | 4 Byte | Günlük Zamanlayıcı Sayacı (Timer Ticks - 18.2 Hz)
;
; ==============================================================================
; ÖRNEK: İMLEÇ SATIR VE SÜTUNUNU DOĞRUDAN BDA'DAN OKUMA
; ==============================================================================
READ_CURSOR_FROM_BDA:
    MOV AX, 0040h
    MOV ES, AX
    MOV DL, [ES:0050h]  ; DL = Sütun (Column)
    MOV DH, [ES:0051h]  ; DH = Satır (Row)
    RET
`;
