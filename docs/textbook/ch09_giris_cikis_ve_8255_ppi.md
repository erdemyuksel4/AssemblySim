# BÖLÜM 9: Giriş/Çıkış (G/Ç) Sistemleri, Portlar ve 8255 PPI Denetleyicisi (I/O Systems, Ports & 8255 PPI)

Bir bilgisayar sisteminin temel amacı yalnızca merkezi işlem birimi (CPU) ve bellek arasında dahili hesaplamalar yürütmek değildir; dış dünyadan veri almak, sensörleri okumak, insan etkileşimini sağlamak (klavye, fare) ve işlenen verileri ekran, yazıcı, disk ve ağ ortamına aktarmaktır. Bu iletişim Giriş/Çıkış (Input/Output - G/Ç) sistemleri üzerinden yürütülür.

Mikroişlemciler ile çevre birimleri (peripherals) doğrudan birbirine bağlanamaz; çünkü çevre birimleri işlemciden çok daha yavaştır, farklı veri formatları (seri/paralel) ve farklı sinyal seviyeleri kullanırlar. Bu uyumsuzlukları gidermek üzere **G/Ç Modülleri (I/O Modules)** ve **Programlanabilir Çevre Birimi Arayüzleri (PPI - Programmable Peripheral Interface)** kullanılır.

---

## 9.1 Giriş/Çıkış Arayüzü İlkeleri ve G/Ç Modüllerinin Temel Rolü

Bir G/Ç modülü (veya G/Ç denetleyicisi), işlemci ile harici aygıtlar arasında köprü vazifesi görür. Başlıca fonksiyonları şunlardır:

1. **Kontrol ve Zamanlama (Control & Timing):** Sistem veriyolları ile harici cihazlar arasındaki veri akışını senkronize eder.
2. **İşlemci İletişimi (Processor Communication):** İşlemciden gelen komutları çözer (komut çözme), durum raporlaması yapar (Busy, Ready) ve adres tanıması gerçekleştirir.
3. **Cihaz İletişimi (Device Communication):** Harici cihazın durumunu sorgular ve veri sinyallerini yönetir.
4. **Veri Tamponlama (Data Buffering):** Yüksek hızlı sistem veriyolu (MHz mertebesinde) ile yavaş çalışan çevre birimleri (klavye ms mertebesinde, seri port kbit mertebesinde) arasındaki hız farkını dengelemek amacıyla verileri geçici tamponlarda (buffer) saklar.
5. **Hata Tespiti (Error Detection):** Mekanik arızalar, iletim parite hataları ve veri bozulmalarını CPU'ya bildirir.

---

## 9.2 G/Ç Adresleme Modelleri: Yalıtılmış G/Ç (Isolated I/O) vs. Bellek Haritalı G/Ç (Memory-Mapped I/O)

Mikroişlemci mimarilerinde çevre birimlerinin adreslenmesi için iki köklü yaklaşım mevcuttur:

```
+-----------------------------------------------------------------------------------------+
|                  GİRİŞ/ÇIKIŞ ADRESLEME MODELLERİNİN KARŞILAŞTIRILMASI                   |
+---------------------------+------------------------------+------------------------------+
| Özellik                   | Yalıtılmış G/Ç (Isolated I/O)| Bellek Haritalı (Memory-Map) |
+---------------------------+------------------------------+------------------------------+
| Adres Uzayı               | Ayrı 64 KB Port Alanı        | Ana Bellek ile Ortak Uzay    |
| Port Adres Aralığı        | 0000h – FFFFh (65536 Port)   | Bellek adreslerinin bir kısmı|
| Özel Komutlar             | IN ve OUT komutları zorunlu  | Standart bellek komutları MOV|
| Kontrol Sinyalleri        | /IOR ve /IOW                 | /MEMR ve /MEMW               |
| Donanım Pini              | M/IO# = 0                    | M/IO# = 1                    |
| Bellek Kapasitesi Kaybı   | Yok (1 MB RAM aynen korunur) | Var (G/Ç alanı RAM'den çalar)|
| Adres Çözümleme Hızı      | Çok Hızlı (Kısa adresler)    | Esnek ancak karmaşık         |
| Mimariler                 | Intel x86, Z80               | ARM, Motorola 68000, MIPS    |
+---------------------------+------------------------------+------------------------------+
```

### 1. Yalıtılmış G/Ç (Isolated I/O / Port I/O)
Intel 8086 mimarisi donanımsal olarak Yalıtılmış G/Ç (Isolated I/O) modelini destekler. İşlemcinin `M/IO#` kontrol pini lojik 0 (`M/IO# = 0`) yapıldığında işlemci bellek okuma/yazma sinyallerini (`MEMR#`, `MEMW#`) devre dışı bırakır ve G/Ç kontrol sinyallerini (`IOR#`, `IOW#`) üretir.
- 16-bitlik port adresi sayesinde $2^{16} = 65,536$ adet bağımsız 8-bitlik G/Ç portu (`0000h`–`FFFFh`) adreslenebilir.
- Bu portlar ana bellekten tamamen bağımsızdır; dolayısıyla 1 MB'lık fiziksel RAM alanından tek bir bayt dahi eksilmez.

### 2. Bellek Haritalı G/Ç (Memory-Mapped I/O)
Bu modelde çevre birimleri doğrudan belleğin bir parçası gibi adreslenir. `M/IO#` pini daima lojik 1 (`M/IO# = 1`) seviyesinde tutulur. 
- Ayrı `IN` ve `OUT` komutlarına gerek kalmaz; herhangi bir bellek referans komutu (`MOV AX, [B8000h]`, `ADD [0E000h], BL`, `TEST BYTE PTR [D000h], 01h`) çevre birimleriyle iletişim kurabilir.
- Tüm 8086 adresleme modları çevre birimleri için de kullanılabilir hale gelir. Ancak G/Ç aygıtlarına ayrılan adres aralıkları sistem RAM'inin kullanılabilir boyutunu küçültür.

---

## 9.3 8086 G/Ç Komutları: IN ve OUT

8086 mimarisinde Yalıtılmış G/Ç portlarına veri okumak ve yazmak için yalnızca iki komut kullanılır: `IN` ve `OUT`. Veri transferi zorunlu olarak Akümülatör yazmacı (`AL` bayt için, `AX` kelime için) üzerinden gerçekleşir.

### 1. Sabit Port Adresleme (Fixed Port Addressing: 00h – FFh)
Port numarası 0 ile 255 (00h–FFh) arasında bir sabit ise, port adresi komutun hemen ardına anlık 1 baytlık sabit (immediate 8-bit) olarak gömülür:

```assembly
; Sabit Port Örnekleri
IN  AL, 60h       ; 60h nolu klavye portundan 1 bayt oku -> AL
OUT 61h, AL       ; AL içeriğini 61h nolu sistem kontrol portuna yaz
IN  AX, 20h       ; 20h (alt bayt) ve 21h (üst bayt) portlarından 1 kelime oku -> AX
OUT 80h, AL       ; POST teşhis portuna AL yaz
```

### 2. Değişken Port Adresleme (Variable Port Addressing: 0000h – FFFFh)
Port numarası 255'ten büyük olduğunda (veya çalışma zamanında dinamik olarak hesaplanacaksa), 16-bitlik port adresi zorunlu olarak `DX` yazmacına yerleştirilmelidir:

```assembly
; Değişken Port Örnekleri (DX Kullanımı Zorunludur)
MOV DX, 03F8h     ; COM1 Seri Portu Taban Adresi (1016 desimal)
IN  AL, DX        ; DX adresindeki seri porttan 1 bayt oku -> AL

MOV DX, 0378h     ; LPT1 Paralel Port Veri Yazmacı
MOV AL, 55h       ; Gönderilecek veri
OUT DX, AL        ; DX adresindeki porta AL yaz
```

---

## 9.4 G/Ç Veri Transfer Yöntemleri: Programlı G/Ç, Kesmeli G/Ç ve Senkronizasyon

İşlemci ile çevre birimleri arasında veri alışverişi üç farklı stratejiyle yürütülebilir:

1. **Programlı G/Ç (Programmed I/O / Polling / Busy-Waiting):**
   İşlemci bir döngü içerisinde çevre biriminin durum yazmacını sürekli okur (`TEST` veya `AND` ile) ve cihaz "Hazır" (Ready) bayrağını verene kadar meşgul bekleme (busy-wait) döngüsünde kilitlenir.
   - *Avantajı:* Sıfır ek donanım, basit yazılım mimarisi.
   - *Dezavantajı:* İşlemci zamanı muazzam derecede israf edilir; CPU başka hiçbir iş yapamaz.
2. **Kesmeli G/Ç (Interrupt-Driven I/O):**
   İşlemci transfer emrini verdikten sonra kendi işlerine devam eder. Çevre birimi veriyi hazırladığında işlemcinin `INTR` pinine kesme sinyali gönderir. İşlemci mevcut komutu bitirip Kesme Servis Rutinine (`ISR`) dallanır, veriyi okur ve ana programa geri döner.
   - *Avantajı:* CPU verimliliği son derece yüksektir; işlemci boşta beklemez.
3. **Doğrudan Bellek Erişimi (DMA):**
   Büyük blok transferlerinde (disk, ağ) işlemci tamamen baypas edilir ve transferi özel bir DMA denetleyicisi yürütür (bkz. Bölüm 11).

```assembly
; Polling (Programlı G/Ç) Simülasyon Kodu
poll_loop:
    IN   AL, 64h        ; Durum portunu oku
    TEST AL, 01h        ; Veri hazır biti (Bit 0) 1 mi?
    JZ   poll_loop      ; Hazır değilse bekle (Busy-wait)
    IN   AL, 60h        ; Hazır! Veriyi oku
```

---

## 9.5 Veriyolu Sistemleri ve El Sıkışma (Handshaking) Sinyalleri

Farklı çalışma frekanslarına sahip iki donanım bileşeni asenkron olarak veri aktarırken veri kaybını önlemek amacıyla **El Sıkışma (Handshaking)** protokolü uygulanır.

```
+-------------------------------------------------------------------------------+
|                    DONANIMSAL EL SIKIŞMA (HANDSHAKING) SİNYALLERİ             |
+-------------------------------------------------------------------------------+

  Verici (Örn: Çevre Birimi)                   Alıcı (Örn: 8255 PPI / CPU)
          |                                                 |
          |----------- Veri Veriyolu (D0-D7) -------------->| (Veri sürülür)
          |                                                 |
          |----------- STB# (Strobe - Düşen Kenar) -------->| (Veri geçerli sinyali)
          |                                                 |
          |                                            [Tampona Alındı]
          |                                                 |
          |<---------- IBF (Input Buffer Full: Lojik 1) ----| (Tampon dolu, dur!)
          |                                                 |
          |                                            [CPU Okudu]
          |                                                 |
          |<---------- ACK# (Acknowledge - Düşük Sinyal) ---| (Yeni veri gönderebilirsin)
```

- **$\overline{\text{STB}}$ (Strobe):** Verici cihazın veriyoluna geçerli bir bayt sürdüğünü haber veren aktif-düşük darbedir.
- **$\text{IBF}$ (Input Buffer Full):** Giriş tamponunun dolu olduğunu ve CPU tarafından henüz okunmadığını belirten aktif-yüksek çıkıştır.
- **$\overline{\text{ACK}}$ (Acknowledge):** Alıcı cihazın veriyi başarıyla aldığını ve yeni bir veri transferine hazır olduğunu bildiren onay sinyalidir.

---

## 9.6 Intel 8255 PPI (Programlanabilir Çevre Birimi Arayüzü) Donanım Mimarisi

Intel 8255 PPI (Programmable Peripheral Interface), mikroişlemcilerin paralel G/Ç işlemlerini yönetmek üzere tasarlanmış 40-pinli standart bir LSI entegresidir. Endüstriyel otomasyonda, step motor kontrolünde, LCD/7-segment display sürmede, yazıcı (Centronics) arayüzlerinde ve tuş takımı (Matrix Keypad) taramada yaygın olarak kullanılmıştır.

### 8255 PPI Blok Şeması ve Port Yapısı

Intel 8255 PPI mimarisi, toplam **24 adet G/Ç hattına** sahiptir ve bunlar üç ana porta ve iki kontrol grubuna ayrılmıştır:

```
               +-----------------------+
    D0 - D7 <->|       İÇ VERİYOLU     |<-> PORT A (PA0 - PA7) [8-Bit Latch/Buffer]
               +-----------------------+
   RD#, WR# -->| KONTROL MANTIĞI       |<-> PORT B (PB0 - PB7) [8-Bit Latch/Buffer]
     CS#, RESET|                       |
       A1, A0  | Grup A / Grup B       |<-> PORT C Üst (PC4 - PC7) [4-Bit]
               | Kontrol Yazmaçları    |<-> PORT C Alt (PC0 - PC3) [4-Bit]
               +-----------------------+
```

1. **Port A (`PA0 – PA7`):** 8-bitlik veri giriş/çıkış portudur. Hem giriş hem çıkış modunda mandallıdır (latched).
2. **Port B (`PB0 – PB7`):** 8-bitlik veri portudur. Çıkışta mandallı, girişte mandalsız tamponludur.
3. **Port C (`PC0 – PC7`):** İki bağımsız 4-bitlik parçaya ayrılabilen 8-bitlik porttur:
   - **Port C Üst (`PC4 – PC7`):** Grup A kontrol ve el sıkışma sinyalleri için kullanılır.
   - **Port C Alt (`PC0 – PC3`):** Grup B kontrol ve el sıkışma sinyalleri için kullanılır.
4. **Kontrol Yazmacı (Control Register):** 8255'in çalışma modlarını ve port yönlerini programlayan dahili yazmaçtır. Yalnızca yazılabilir (write-only).

### 8255 Dahili Adres Seçim Tablosu ($A_1, A_0$)

| $CS\#$ | $A_1$ | $A_0$ | Seçilen Dahili Birim | İşlem ($RD\#=0$) | İşlem ($WR\#=0$) |
| :---: | :---: | :---: | :--- | :--- | :--- |
| 0 | 0 | 0 | **Port A** | Port A'dan Veri Oku | Port A'ya Veri Yaz |
| 0 | 0 | 1 | **Port B** | Port B'den Veri Oku | Port B'ye Veri Yaz |
| 0 | 1 | 0 | **Port C** | Port C'den Veri Oku | Port C'ye Veri Yaz |
| 0 | 1 | 1 | **Kontrol Yazmacı** | Geçersiz (Okunamaz) | Kontrol Kelimesi Yaz |
| 1 | X | X | **Devre Dışı** | Veriyolu Yüksek Empedans (High-Z) | Veriyolu High-Z |

---

## 9.7 8255 Çalışma Modları: Mod 0, Mod 1, Mod 2 ve BSR Modu

8255 denetleyicisinde iki temel çalışma formatı bulunur:
1. **G/Ç Mod Tanımlama (I/O Mode Definition):** Kontrol kelimesinin en yüksek biti $D_7 = 1$ olduğunda aktifleşir.
2. **Bit Set/Reset Modu (BSR Mode):** Kontrol kelimesinin en yüksek biti $D_7 = 0$ olduğunda aktifleşir.

### 1. G/Ç Mod Tanımlama Kontrol Kelimesi Formatı ($D_7 = 1$)

Aşağıdaki referans tablosu, $D_7 = 1$ iken Kontrol Yazmacına yazılacak bitlerin anlamlarını ve Grup A / Grup B port yönlerini tanımlar:

| Bit Pozisyonu | Fonksiyon Adı | Değer = 1 Anlamı | Değer = 0 Anlamı | Kapsadığı Birim |
| :---: | :--- | :--- | :--- | :--- |
| **D7** | **Mod Belirleme Bayrağı** | $1 =$ I/O Mod Tanımlama Aktif | $0 =$ BSR Modu Aktif | Tüm Denetleyici |
| **D6** | **Grup A Mod Seçimi (Bit 1)** | $00 =$ Mod 0 (Temel G/Ç) | $01 =$ Mod 1 (Strobed G/Ç) | Grup A |
| **D5** | **Grup A Mod Seçimi (Bit 0)** | $1X =$ Mod 2 (Çift Yönlü Veriyolu)| (D6 ve D5 birlikte çözülür) | Grup A |
| **D4** | **Port A Yönü** | $1 =$ Giriş (Input) | $0 =$ Çıkış (Output) | Port A |
| **D3** | **Port C Üst Yönü (PC7-PC4)** | $1 =$ Giriş (Input) | $0 =$ Çıkış (Output) | Port C Üst |
| **D2** | **Grup B Mod Seçimi** | $1 =$ Mod 1 (Strobed G/Ç) | $0 =$ Mod 0 (Temel G/Ç) | Grup B |
| **D1** | **Port B Yönü** | $1 =$ Giriş (Input) | $0 =$ Çıkış (Output) | Port B |
| **D0** | **Port C Alt Yönü (PC3-PC0)** | $1 =$ Giriş (Input) | $0 =$ Çıkış (Output) | Port C Alt |

### 8255 PPI Temel Çalışma Modları:

#### Mod 0: Temel Giriş/Çıkış (Basic I/O)
- El sıkışma sinyali kullanılmaz.
- Port A, Port B, Port C Üst ve Port C Alt birbirinden tamamen bağımsız 4 port olarak giriş ya da çıkış olarak programlanabilir.
- Çıkış portları mandallıdır (latched); giriş portları ise mandalsız tamponludur.
- Örneğin: Port A çıkış (0), Port B giriş (1), Port C üst çıkış (0), Port C alt çıkış (0) için Mod 0 kontrol kelimesi:
  $$\text{Kontrol Kelimesi} = 10000010b = 82h$$

#### Mod 1: Strobed Giriş/Çıkış (Handshake I/O)
- Port A ve Port B tek yönlü veri transferi yaparken, Port C pinleri donanımsal el sıkışma sinyalleri ($\overline{\text{STB}}, \text{IBF}, \overline{\text{ACK}}, \overline{\text{OBF}}, \text{INTR}$) olarak görev yapar.

#### Mod 2: Çift Yönlü Veriyolu (Strobed Bidirectional Bus I/O)
- **Yalnızca Port A** için geçerlidir. Port A, 8-bitlik çift yönlü bir sistem veriyolu haline gelir.
- Port C'nin 5 pini (`PC3 – PC7`) hem giriş hem çıkış el sıkışma kontrolleri için tahsis edilir. Port B ise Mod 0 veya Mod 1'de bağımsız çalışmaya devam eder.

### 2. BSR (Bit Set/Reset) Modu ($D_7 = 0$)
BSR modu, Port C'nin 8 pininden (`PC0 – PC7`) herhangi birini diğer pinlerin durumunu bozmadan tek bir işlemle lojik 1 (Set) veya lojik 0 (Reset) yapmak için kullanılır.
- $D_7 = 0$ yapıldığında BSR modu seçilir.
- $D_6, D_5, D_4$ kullanılmaz (donanımsal olarak 0 verilir).
- $D_3, D_2, D_1$ değiştirilecek Port C pinini seçer (`000` = PC0, `111` = PC7).
- $D_0$ biti yeni değeri belirler ($1 = \text{Set}, 0 = \text{Reset}$).

```assembly
; BSR Modu ile PC3 Pinini Lojik 1 Yapma:
; D7=0, D6..D4=000, D3..D1=011 (PC3), D0=1 (Set) => 00000111b = 07h
MOV AL, 07h
OUT 03h, AL       ; 8255 Kontrol portuna yaz -> PC3 = 1 olur

; BSR Modu ile PC3 Pinini Lojik 0 Yapma:
; D7=0, D6..D4=000, D3..D1=011 (PC3), D0=0 (Reset) => 00000110b = 06h
MOV AL, 06h
OUT 03h, AL       ; Kontrol portuna yaz -> PC3 = 0 olur
```

---

## 9.8 Seri İletişim Arayüzlerine Genel Bakış

Paralel iletişimde çok sayıda iletken kablo gerektiğinden, uzun mesafeli veri iletiminde maliyeti düşürmek ve sinyal bozulmalarını (cross-talk) engellemek amacıyla veriler tek bir hat üzerinden bit bit aktarılır (Seri İletişim).

1. **UART (Universal Asynchronous Receiver/Transmitter):**
   İşlemciden paralel gelen baytı alır; başına Başlangıç Biti (Start Bit: 0), sonuna Parite Biti ve Bitiş Bitleri (Stop Bit: 1) ekleyerek asenkron seri hatta aktarır. Tersi yönde seri gelen sinyali paralel bayta dönüştürür. RS-232 standardı ile birlikte PC seri portlarında (COM1: `03F8h`, COM2: `02F8h`) on yıllarca temel standart olmuştur.
2. **USB (Universal Serial Bus):**
   Günümüzün evrensel standardıdır. Dört hatlı kablo ($V_{bus}$, $D+$, $D-$, $GND$) üzerinde diferansiyel sinyalleşme kullanır. Tak-Çalıştır (Plug and Play - PnP) ve Çalışırken Takma (Hot-Swapping) yeteneklerine sahiptir.
3. **Ethernet (IEEE 802.3):**
   Yerel ağlarda (LAN) paket tabanlı yüksek hızlı (1 Gbps - 10 Gbps) seri iletişim standardıdır. Ağ Arayüz Kartları (NIC) aracılığıyla çalışır.
4. **FireWire (IEEE 1394) & Thunderbolt:**
   Yüksek bant genişliği gerektiren dijital video ve ses sistemleri için geliştirilmiş peer-to-peer seri veriyollarıdır.
5. **Bluetooth:**
   2.4 GHz ISM bandında frekans atlamalı (Frequency Hopping) kısa mesafeli kablosuz seri iletişim standardıdır.


---

## 9.10 Sınıf Tahtası & Projeksiyon Kod Karşılaştırmaları (Week 7 Classroom Photos)

Derste projeksiyonda gösterilen **Polling Loop (`Foto/21.43.43.jpeg`)** ve **ISOLATED I/O (x86 Assembly) vs. MEMORY-MAPPED I/O (ARM64 Assembly) (`Foto/2.jpeg` & `Foto/23.jpeg`)** kodları aşağıda birebir yer almaktadır:

### 1. Polling Loop (`Foto/WhatsApp Image 2026-11-02 at 21.43.43.jpeg`)
```assembly
; polling
POLL_LOOP:
    LOAD R1, [IO_STATUS_REG]
    TEST R1, #READY_BIT
    JUMP_IF_ZERO POLL_LOOP
```

### 2. ISOLATED I/O (x86 Assembly) vs. MEMORY-MAPPED I/O (ARM64 Assembly) (`Foto/2.jpeg` & `Foto/23.jpeg`)
```assembly
; =====================================================================
; LEFT PANE: ISOLATED I/O (x86 Assembly)
; =====================================================================
section .text
global _start
_start:
    ; 1. Check if the peripheral device is ready
    mov dx, 0x03F8          ; Move the I/O Port Address (e.g., COM1 Serial Port) into DX register
    in  al, dx              ; READ: Copy 1 byte from I/O Port 0x03F8 into the AL register
    test al, 0x01           ; Check if the status bit (Bit 0) is set to 1
    jz _start               ; If bit is 0, loop back and keep polling (device not ready)

    ; 2. Send data to the device
    mov dx, 0x03F9          ; Shift to the target data transmission port
    mov al, 0x41            ; 0x41 is the ASCII character 'A'
    out dx, al              ; WRITE: Push the contents of AL ('A') out to Port 0x03F9
```

```armasm
// =====================================================================
// RIGHT PANE: MEMORY-MAPPED I/O (ARM64 Assembly)
// =====================================================================
.global _start
_start:
    // 1. Load the Memory-Mapped base address of the hardware controller
    ldr x0, =0x40020000     // X0 now holds the memory pointer to the MMIO register block

    // 2. Read the current status of the device
    ldr w1, [x0, #0x10]     // READ: Load word from memory address [0x40020000 + 0x10 Offset] (Status Register)
    tst w1, #1              // Test if Bit 0 is set
    b.eq _start             // If zero, loop back and keep polling

    // 3. Write data to the device
    mov w2, #0x41           // W2 holds the character 'A'
    str w2, [x0, #0x04]     // WRITE: Store word 'A' into memory address [0x40020000 + 0x04 Offset] (Data Register)
```
