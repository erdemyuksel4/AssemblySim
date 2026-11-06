# Bölüm 1: Giriş, Bilgisayar Mimarisi ve Sayı Sistemleri

## Giriş ve Öğrenme Hedefleri

Bilgisayar sistemleri, 20. yüzyılın ortalarında devasa salonları dolduran elektron tüplü ve binlerce kilovat güç harcayan devasa makinelerden, günümüzde bir tırnak büyüklüğündeki silikon yongaya sığan mikroskobik yapılara doğru muazzam bir evrim geçirmiştir. Bu dönüşümün merkezinde yer alan en kritik donanım bileşeni **Mikroişlemci (Microprocessor - MP)** veya genel adıyla **Merkezi İşlem Birimi (Central Processing Unit - CPU)** dir.

Mikroişlemci tabanlı bir bilgisayar sistemini anlamak; donanım bloklarının birbiriyle nasıl haberleştiğini, fiziksel adreslerin ve veri akışlarının hangi hatlar üzerinden taşındığını ve nihayetinde ikili (binary) düzeydeki elektrik sinyallerinin sayısal ve mantıksal değerleri nasıl temsil ettiğini derinlemesine kavramayı gerektirir. Bellek (Memory) ve Giriş/Çıkış (G/Ç - I/O) birimleri kendi başlarına hiçbir işlem yapamazlar; sistemdeki her bir veri transferini, adres üretimini ve çevrim zamanlamasını doğrudan mikroişlemci yönetir.

Bu bölümü tamamladığınızda aşağıdaki temel kazanımları elde etmiş olacaksınız:
1. Bir mikroişlemcinin tanımını, tarihsel gelişim evrelerini ve bilgisayar mimarisindeki yönetici rolünü açıklayabilmek.
2. Bilgisayarın **üç temel donanım bloğunu** (CPU, Bellek, G/Ç) ve bunları birbirine bağlayan **sistem veriyollarını (Address Bus, Data Bus, Control Bus: MEMR, MEMW, IOR, IOW)** ayrıntılarıyla tanımlayabilmek.
3. Adres hattı sayısı ile doğrudan adreslenebilir bellek uzayı arasındaki $2^n$ bağıntısını hesaplayabilmek.
4. Klasik IBM PC ve DOS mimarisindeki 1 MB Real Mode bellek haritasını; **TPA (Transient Program Area - 640 KB)**, **Video RAM (A0000h – BFFFFh)**, **Sistem ROM/BIOS (C0000h – FFFFFh)** ve **64 KB G/Ç uzayı** bileşenleriyle analiz edebilmek.
5. Mikroişlemcinin yürüttüğü üç temel görevi (Veri Aktarımı, Aritmetik/Mantık, Program Akış Kontrolü) ve karar mekanizmasını destekleyen temel bayrakları (ZF, SF, CF, PF, OF, AF) açıklayabilmek.
6. Farklı sayı tabanları (Decimal, Binary, Octal, Hexadecimal) arasında **Bölme-Kalan (Division-Remainder)** ve kesirli sayılarda **Çarpma-Taban (Multiply-Radix)** algoritmalarıyla çift yönlü dönüşüm yapabilmek.
7. Negatif sayıların donanımsal temsilinde kullanılan **Bire Tümleyen (One's Complement)** ve **İkiye Tümleyen (Two's Complement)** yöntemlerini matematiksel olarak ispatlayabilmek.
8. Bilgisayar sistemlerinde veri temsil standartları olan **Paketlenmiş/Paketlenmemiş BCD**, **ASCII** ve **Unicode** kodlama modellerini kavramak ve ASCII-sayı dönüşümlerini gerçekleştirebilmek.

---

## 1.1 Mikroişlemci Tanımı ve Bilgisayar Sistemlerinin Tarihsel Evrimi

### Mikroişlemcinin Tanımı
Akademik literatürde mikroişlemci şu şekilde tanımlanır (Brey, 2008):

> **Mikroişlemci (Microprocessor - MP / CPU):**  
> Tek bir tümleşik devre (Integrated Circuit - IC) yongası üzerine inşa edilmiş, bilgisayar sisteminin merkezi kontrol ve işlem birimidir. Mikroişlemci; bellek ve G/Ç sistemini yalnızca **veriyolları (buses)** aracılığıyla kontrol eder ve bellekte sıralı olarak saklanan makine komutlarını getirip yürüterek programları icra eder.

Mikroişlemci ile mikrobilgisayar arasındaki temel ayrım şudur: Mikroişlemci yalnızca CPU çekirdeğini (Aritmetik Mantık Birimi, Yazmaçlar, Kontrol Ünitesi) barındırırken; mikrobilgisayar bu mikroişlemcinin harici bellek yongaları (RAM, ROM) ve G/Ç arayüz denetleyicileri ile sistem veriyolları üzerinden bir araya getirilmesiyle oluşan eksiksiz bir sistemdir.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MİKROBİLGİSAYAR SİSTEMİ MİMARİSİ                     │
│                                                                        │
│   ┌────────────────────┐   Sistem Veriyolları    ┌─────────────────┐   │
│   │   MİKROİŞLEMCİ     │◄───────────────────────►│  BELLEK SİSTEMİ │   │
│   │      (CPU)         │   (Address, Data, Ctrl) │    (RAM / ROM)  │   │
│   └─────────┬──────────┘                         └─────────────────┘   │
│             │                                                          │
│             │ Sistem Veriyolları                                       │
│             ▼                                                          │
│   ┌────────────────────┐                                               │
│   │ G/Ç SİSTEMİ (I/O)  │                                               │
│   │ (Klavye, Ekran vb) │                                               │
│   └────────────────────┘                                               │
└────────────────────────────────────────────────────────────────────────┘
```

### 4004'ten Modern Çok Çekirdeklilere Tarihsel Gelişim
Intel'in 1971 yılında Japon hesap makinesi üreticisi Busicom için geliştirdiği dünyanın ilk tek yongalı mikroişlemcisi olan **Intel 4004**'ten günümüzün 64-bit çok çekirdekli mimarilerine uzanan süreç, saat hızları, veriyolu genişlikleri ve transistör yoğunluğu açısından üstel bir büyüme sergilemiştir:

1. **Intel 4004 (1971):** Dünyanın ilk ticari mikroişlemcisidir. 4-bit mimariye, 740 kHz saat frekansına ve 4096 adet 4-bitlik bellek hücresini adresleme kapasitesine sahipti. P-MOS teknolojisiyle 2300 transistörden oluşuyordu.
2. **Intel 8008 (1972):** İlk 8-bit mikroişlemcidir. 500–800 kHz saat hızına sahipti ve 16 KB bellek adresleyebiliyordu.
3. **Intel 8080 (1974):** İkinci nesil 8-bit işlemcidir. N-MOS teknolojisiyle 2 MHz saat frekansına ulaşmış, 64 KB bellek adresleyebilmiş ve efsanevi Altair 8800 bilgisayarının temelini oluşturarak kişisel bilgisayar devrimini başlatmıştır.
4. **Intel 8085 (1976):** 8080'in modernize edilmiş versiyonudur. Tek bir +5V besleme gerilimiyle çalışır, 3–5 MHz saat frekansına sahiptir, 64 KB bellek adresler ve dahili donanımsal kesme (RST 5.5, 6.5, 7.5, TRAP) yönetimi sunar.
5. **Intel 8086 (1978):** 16-bit veri veriyoluna ve 20-bit adres veriyoluna sahip çığır açıcı işlemcidir. **1 MB fiziksel bellek** adresleyebilir. 4.77 MHz, 8 MHz ve 10 MHz versiyonları üretilmiştir. Komut getirme ve yürütme birimlerini ayıran (BIU ve EU) ilk boru hattı (pipelining) yapısını (6-baytlık Prefetch Queue) tanıtmıştır.
6. **Intel 8088 (1979):** Dahili mimarisi 8086 ile tamamen aynı (16-bit) olmasına rağmen, dönemin ucuz 8-bit donanım kartlarıyla uyumluluk sağlamak adına harici veri veriyolu 8-bite indirilmiş versiyonudur. IBM tarafından 1981 yılında ilk **IBM PC (Model 5150)** için seçilmiş ve PC endüstri standardı haline gelmiştir.
7. **Intel 80286 (1982):** 16-bit veri ve 24-bit adres veriyoluna sahiptir (**16 MB fiziksel bellek**). Real Mode yanında çoklu görev ve bellek koruması sağlayan **Korumalı Mod (Protected Mode)** mimarisini tanıtmıştır. Saat frekansı 6–20 MHz arasındadır.
8. **Intel 80386 (1985):** İlk tam 32-bit x86 işlemcisidir. 32-bit veri ve 32-bit adres veriyolu sayesinde **4 GB fiziksel bellek** adresleyebilir. Donanımsal **Sayfalama (Paging)** ve Sanal 8086 (V86) modlarını getirmiştir.
9. **Intel 80486 (1989):** Dahili 8 KB L1 önbellek (L1 Cache) ve dahili matematiksel işlemciyi (Floating-Point Unit - FPU / 80387) CPU çekirdeğine entegre eden 32-bit işlemcidir.
10. **Intel Pentium Serisi (1993):** 64-bit harici veri veriyoluna, 32-bit adres yoluna ve aynı anda iki komut çalıştırabilen çift boru hatlı (U ve V boru hatları) **Süperskalar (Superscalar)** mimariye sahiptir.
11. **Modern Çok Çekirdekli İşlemciler (Core 2, Core i7/i9, Xeon vb.):** 64-bit yerel mimari (x86-64 / AMD64), 3–5+ GHz çekirdek saat frekansları, 6 ile 64+ fiziksel çekirdek, çok seviyeli önbellekler (L1, L2, L3) ve saniyede on milyarlarca komut yürütme kapasitesi (MIPS / FLOPS).

| Mikroişlemci Modeli | Çıkış Yılı | Veri Veriyolu (Data Bus) | Adres Veriyolu (Address Bus) | Azami Bellek Kapasitesi | Tipik Saat Frekansı | Transistör Sayısı |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Intel 4004** | 1971 | 4-bit | 12-bit | 4 KB (nibble) | 740 kHz | 2,300 |
| **Intel 8008** | 1972 | 8-bit | 14-bit | 16 KB | 500–800 kHz | 3,500 |
| **Intel 8080** | 1974 | 8-bit | 16-bit | 64 KB | 2 MHz | 6,000 |
| **Intel 8085** | 1976 | 8-bit | 16-bit | 64 KB | 3–5 MHz | 6,500 |
| **Intel 8086** | 1978 | 16-bit | 20-bit | 1 MB | 4.77–10 MHz | 29,000 |
| **Intel 8088** | 1979 | 8-bit (harici) | 20-bit | 1 MB | 4.77–8 MHz | 29,000 |
| **Intel 80286** | 1982 | 16-bit | 24-bit | 16 MB | 6–20 MHz | 134,000 |
| **Intel 80386** | 1985 | 32-bit | 32-bit | 4 GB | 16–33 MHz | 275,000 |
| **Intel 80486** | 1989 | 32-bit | 32-bit | 4 GB | 25–50 MHz | 1.2 Milyon |
| **Pentium (P5)** | 1993 | 64-bit | 32-bit | 4 GB | 60–200 MHz | 3.1 Milyon |
| **Core 2 / Modern Çok Çekirdek** | 2006+ | 64-bit | 36–52 bit | 64 GB – 4 PB | 3–5+ GHz | Milyarlarca |

### Başarım Ölçütleri: Saat Frekansı, MIPS ve FLOPS
Bir işlemcinin performansı yalnızca saat frekansıyla ölçülemez. Çevrim başına düşen komut sayısı (IPC - Instructions Per Cycle), dahili önbellek boyutları ve veriyolu mimarisi toplam işlem hızını doğrudan belirler:
- **Saat Frekansı (Clock Frequency):** İşlemcinin iç adımlarını senkronize eden osilatör sinyalidir (Hertz, MHz, GHz).
- **MIPS (Millions of Instructions Per Second):** İşlemcinin saniyede yürüttüğü milyon cinsinden tamsayı komut sayısıdır. 8086 işlemcisi 1 MIPS'in oldukça altında çalışırken, modern çok çekirdekli işlemciler yüz binlerce MIPS düzeyine ulaşmıştır.
- **FLOPS (Floating-Point Operations Per Second):** Bilimsel ve grafiksel hesaplamalarda saniyede yürütülen kayan noktalı matematiksel işlem sayısıdır (GFLOPS, TFLOPS).

---

## 1.2 Bilgisayarın Üç Temel Bloğu ve Sistem Veriyolu Mimarisi

Bir bilgisayar sisteminin donanım yapısı incelendiğinde, sistemin işleyişi **üç temel blok** ve bu blokları birbirine bağlayan **üç ana veriyolu** etrafında organize edilmiştir.

```
                  ┌──────────────────────────────────────────────┐
                  │              MİKROİŞLEMCİ (CPU)              │
                  │   ┌────────────────┐    ┌────────────────┐   │
                  │   │  Kontrol Birimi│    │ Aritmetik/Mantık│  │
                  │   │      (CU)      │    │  Birimi (ALU)  │   │
                  │   └───────┬────────┘    └────────┬───────┘   │
                  └───────────┼──────────────────────┼───────────┘
                              │                      │
       ═══════════════════════╪══════════════════════╪═══════════════════════ (Address Bus - Adres Veriyolu, Tek Yönlü)
                              │                      │
       ◄──────────────────────┴──────────────────────┴──────────────────────► (Data Bus - Veri Veriyolu, Çift Yönlü)
                              │
       ───────────────────────┬────────────────────────────────────────────── (Control Bus - Kontrol Veriyolu: MEMR, MEMW, IOR, IOW)
                              │
             ┌────────────────┴───────────────┐     ┌────────────────────────┐
             │         BELLEK SİSTEMİ         │     │    GİRİŞ/ÇIKIŞ (G/Ç)   │
             │   ┌─────────┐    ┌─────────┐   │     │  ┌────────┐ ┌────────┐ │
             │   │   RAM   │    │   ROM   │   │     │  │ Klavye │ │ Ekran  │ │
             │   └─────────┘    └─────────┘   │     │  └────────┘ └────────┘ │
             └────────────────────────────────┘     └────────────────────────┘
```

### 1. Address Bus (Adres Veriyolu)
- **Yönü:** **Tek Yönlüdür (Unidirectional).** Adresler daima mikroişlemci tarafından üretilir ve bellek ile G/Ç cihazlarına doğru tek taraflı olarak akar.
- **İşlevi:** İşlemcinin o anda okumak veya yazmak istediği bellek hücresinin ya da harici G/Ç portunun fiziksel numarasını taşır.
- **Adresleme Kapasitesi Formülü:**  
  Adres veriyolundaki iletken hat sayısı $n$ ise, işlemcinin doğrudan adresleyebileceği azami bağımsız bellek konumu sayısı şu formülle hesaplanır:

$$\text{Adreslenebilir Bellek Uzayı} = 2^n \text{ bayt}$$

Örneğin:
- 16 hatlı bir adres veriyolu: $2^{16} = 65,536 \text{ bayt} = 64 \text{ KB}$ adres uzayı sunar.
- Intel 8086'nın 20 hatlı adres veriyolu ($A_0 - A_{19}$):
  $$2^{20} = 1,048,576 \text{ bayt} = 1 \text{ MB}$$
  Bu adresler onaltılı tabanda `00000h` ile `FFFFFh` arasındadır.
- 32 hatlı bir adres veriyolu (Intel 80386/80486): $2^{32} = 4,294,967,296 \text{ bayt} = 4 \text{ GB}$ adresler.

### 2. Data Bus (Veri Veriyolu)
- **Yönü:** **Çift Yönlüdür (Bidirectional).** Veri, işlemciden belleğe/GÇ'ye doğru akabileceği gibi (yazma - write), bellekten/GÇ'den işlemciye doğru da (okuma - read) akabilir.
- **İşlevi:** İşlemcinin işleyeceği komut kodlarını, sayısal sabitleri ve değişken verileri taşır.
- **Genişlik ve Başarım:**  
  Veri veriyolunun bit genişliği, tek bir saat çevriminde işlemciye transfer edilebilecek maksimum bilgi miktarını belirler. 8086 mikroişlemcisi 16-bit veri veriyoluna ($D_0 - D_{15}$) sahiptir; bu sayede tek bir veriyolu çevriminde 1 kelime (2 bayt) okuyup yazabilir. Modern 64-bit işlemciler ise her çevrimde 64 bit (8 bayt) veri aktarır.

### 3. Control Bus (Kontrol Veriyolu)
- **Yönü:** Karışık kontrol hatlarından oluşur.
- **İşlevi:** Veriyolu üzerindeki transferlerin ne zaman başlayacağını, ne tür bir işlem yapılacağını ve verinin ne zaman geçerli olduğunu belirleyen zamanlama ve yetkilendirme sinyallerini taşır.
- **Dört Temel Kontrol Sinyali:**  
  Bir x86 sisteminde bellek ve G/Ç erişimlerini yöneten en kritik dört kontrol hattı şunlardır (sinyal adının üzerindeki çizgi veya sonundaki `#` işareti, sinyalin **aktif-düşük / active-low** olduğunu, yani mantık 0 seviyesinde tetiklendiğini gösterir):
  1. $\overline{\text{MEMR}}$ / **MEMR# (Memory Read - Bellek Okuma):** İşlemci bellekten veri okuyacağı zaman bu hattı 0 yapar. Bellek yongası adres veriyolundaki konuma ait veriyi veri veriyoluna sürer.
  2. $\overline{\text{MEMW}}$ / **MEMW# (Memory Write - Bellek Yazma):** İşlemci veri veriyolundaki bir değeri belleğe kaydedeceği zaman bu hattı 0 yapar.
  3. $\overline{\text{IOR}}$ / **IOR# (I/O Read - Giriş/Çıkış Okuma):** İşlemci bir G/Ç portundan (örneğin klavye tamponundan) veri okuyacağı zaman bu hattı 0 yapar.
  4. $\overline{\text{IOW}}$ / **IOW# (I/O Write - Giriş/Çıkış Yazma):** İşlemci bir G/Ç portuna (örneğin ekran kartı kontrol yazmacına) veri göndereceği zaman bu hattı 0 yapar.

> **Aktif-Düşük Mantığı Örneği:**  
> Eğer $\overline{\text{IOW}} = 0$ ise, mikroişlemci veri veriyolunda hazır bulundurduğu baytı, adres veriyolunda belirtilen G/Ç portuna yazmaktadır. $\overline{\text{MEMR}} = 1$ iken bellek okuma devreleri pasiftir ve veri veriyolunu serbest (yüksek empedans - High-Z) durumda tutar.

---

## 1.3 Klasik PC Bellek Haritası ve G/Ç Uzayı

Intel 8086 mikroişlemcisinin 20-bit adres veriyolu ile eriştiği **1 MB (1,048,576 bayt)** fiziksel adres uzayı, klasik IBM PC ve MS-DOS mimarisinde belirli donanımsal ve yazılımsal işlevlere göre katı sınırlarla bölünmüştür. Bu mimari model günümüzde modern x86 işlemcilerin geriye dönük uyumluluk için ilk açılışta çalıştığı **Gerçek Mod (Real Mode)** temelini oluşturur.

```
Fiziksel Adres    Boyut      Bölge Adı ve Donanım İşlevi
══════════════    ═════      ════════════════════════════════════════════════════
FFFFFh ┌───────┐  64 KB      Sistem BIOS ROM (Kurulum, POST, Kesme Servisleri)
       │       │             [FFFF0h: Reset Vektörü - JMP F000:E05Bh]
F0000h ├───────┤
EFFFFh │       │  64 KB      Kaset BASIC / Genişleme ROM Alanı
E0000h ├───────┤
DFFFFh │       │  96 KB      Genişletilmiş Bellek (EMS) Sayfa Çerçevesi / Donanım ROM
C8000h ├───────┤
C7FFFh │       │  32 KB      Video BIOS ROM (Ekran Kartı Dahili Yazılımı)
C0000h ├───────┤ ───────────────────────────────────────────────────────────── (Sistem Alanı Üst Sınırı)
BFFFFh │       │             Video RAM (CGA/VGA Renkli Metin Ekranı: B8000h)
       │       │  128 KB     Video RAM (MDA Monokrom Metin Ekranı:   B0000h)
       │       │             Video RAM (EGA/VGA Grafik Ekranı:       A0000h)
A0000h ├───────┤ ───────────────────────────────────────────────────────────── (TPA Üst Sınırı: 640 KB)
9FFFFh │       │
       │       │             TPA (Transient Program Area - Geçici Program Alanı)
       │       │             - Kullanıcı Uygulama Programları
       │       │  640 KB     - COMMAND.COM (Komut Satırı Yorumlayıcısı)
       │       │             - Aygıt Sürücüleri (Mouse, CD-ROM vb.)
       │       │             - DOS Çekirdeği (IO.SYS, MSDOS.SYS)
00500h ├───────┤             - BIOS Veri Alanı (BDA - 00400h–004FFh)
003FFh │       │  1024 B     Kesme Vektör Tablosu (IVT - 256 Adet 4-Baytlık Gösterici)
00000h └───────┘
```

### 1. TPA (Transient Program Area - Geçici Program Alanı: 640 KB)
- **Adres Aralığı:** `00000h` – `9FFFFh`
- **Toplam Boyut:** Tam **640 KB** (655,360 bayt).
- **İşlevi:** DOS işletim sisteminin çalıştığı ve kullanıcı programlarının yüklendiği ana bellek bölgesidir.
  - `00000h` – `003FFh` (1 KB): 256 adet kesme işaretçisini barındıran **Kesme Vektör Tablosu (Interrupt Vector Table - IVT)** dır.
  - `00400h` – `004FFh` (256 Bayt): Seri/paralel port adresleri, klavye bayrakları ve video modlarını tutan **BIOS Data Area (BDA)** dır.
  - `00500h` ve yukarısı: DOS işletim sistemi çekirdeği bileşenleri yer alır:
    - `IO.SYS`: Donanım aygıtları (klavye, ekran, yazıcı, disket) ile DOS arasındaki düşük seviyeli iletişimi sağlayan programdır.
    - `MSDOS.SYS`: Dosya sistemi yönetimini ve sistem çağrılarını barındıran DOS çekirdeğidir.
    - `COMMAND.COM`: Kullanıcının komut satırından girdiği komutları yorumlayan kabuk programıdır.
    - Installable Drivers: Fare, optik sürücü veya ağ kartı gibi harici aygıt sürücüleri.
    - Aktif ve arka plandaki DOS kullanıcı uygulamaları.

> **Hayati Sistem Uyarısı:**  
> Klasik DOS ortamında diskte yer açmak amacıyla `IO.SYS`, `MSDOS.SYS` veya `COMMAND.COM` dosyaları asla silinmemelidir. Bu dosyaların silinmesi sistemin açılmasını (boot etmesini) imkansız kılar.

### 2. Sistem Alanı (System Area: 384 KB)
- **Adres Aralığı:** `A0000h` – `FFFFFh`
- **Toplam Boyut:** **384 KB** ($1024\text{ KB} - 640\text{ KB} = 384\text{ KB}$).
- **Bileşenleri:**
  1. **Video RAM (VRAM) (`A0000h` – `BFFFFh` - 128 KB):**  
     Ekran kartı donanımına ayrılmış bellek bölgesidir. Bu bölgeye yazılan her bayt doğrudan ekranda bir piksel veya karakter olarak görüntülenir:
     - `A0000h` – `AFFFFh` (64 KB): Grafik ekran belleğidir (EGA/VGA ve ünlü Mode 13h - 320x200 256 renk grafik modu).
     - `B0000h` – `B7FFFh` (32 KB): Eski MDA (Monochrome Display Adapter) metin ekranı.
     - `B8000h` – `BFFFFh` (32 KB): Standart CGA/VGA renkli metin ekran belleğidir (80 sütun x 25 satır; her karakter 1 bayt ASCII karakter kodu ve 1 bayt renk niteliği / attribute byte olmak üzere 2 bayt yer kaplar).
  2. **Video BIOS ROM (`C0000h` – `C7FFFh` - 32 KB):**  
     Ekran kartı donanımının açılış rutinlerini ve INT 10h video servislerini barındıran dahili ROM yongasıdır.
  3. **Genişletilmiş Bellek (EMS / Serbest Alan) (`C8000h` – `DFFFFh` - 96 KB):**  
     Eski PC sistemlerinde 640 KB sınırını aşmak için kullanılan Sayfa Çerçevesi (Page Frame) ve ek donanım denetleyicileri (SCSI, ağ kartları) için serbest bırakılmış alandır.
  4. **Kaset BASIC (`E0000h` – `EFFFFh` - 64 KB):**  
     Orijinal IBM PC'de disket takılmadığında çalışan ROM tabanlı BASIC dilini barındırıyordu. Modern sistemlerde boştur veya sistem BIOS genişlemelerine ayrılır.
  5. **Sistem BIOS ROM (`F0000h` – `FFFFFh` - 64 KB):**  
     Sistem anakartındaki ana BIOS yongasıdır. Sistemin en tepesindeki 64 KB'lık alanda oturur:
     - `F0000h` – `F7FFFh`: Sistemin ilk açılış testlerini (POST - Power-On Self Test) ve donanım ilklendirme kodlarını içerir.
     - `F8000h` – `FFFFFh`: Klavye, disk ve saat gibi temel çevre birimlerini yöneten düşük seviyeli BIOS kesme rutinlerini barındırır.
     - `FFFF0h` **(Reset Vektörü):** Bilgisayara elektrik verildiğinde veya reset tuşuna basıldığında 8086 işlemcisinin çalıştırdığı ilk komut tam olarak bu adrestedir (`CS:IP = F000h:FFF0h`). Burada genellikle `JMP F000:E05Bh` şeklinde sistem BIOS açılış koduna sıçrayan bir uzak atlama komutu yer alır.

### 3. G/Ç Port Uzayı (I/O Space: 64 KB)
Mikroişlemci çevre birimleri ile yalnızca bellek üzerinden değil, bağımsız bir **G/Ç Port Uzayı (I/O Port Space)** üzerinden de haberleşir:
- Port adres aralığı: `0000h` ile `FFFFh` arasındadır (tam **65,536 adet 8-bitlik port**, 64 KB).
- Bu alan fiziksel RAM'den tamamen bağımsızdır; işlemci bu porta erişirken $\overline{\text{MEMR}}/\overline{\text{MEMW}}$ yerine $\overline{\text{IOR}}/\overline{\text{IOW}}$ sinyallerini üretir.
- Portlara yalnızca özel assembly komutları olan `IN` (porttan oku) ve `OUT` (porta yaz) ile erişilebilir.

### 4. Modern Sistemlerle Karşılaştırma: Sayfalama ve Sanal Bellek
Klasik DOS mimarisinde her program doğrudan fiziksel bellek adreslerine erişir ve tek bir bellek haritası tüm sistem tarafından paylaşılırdı. 

Modern 32-bit ve 64-bit işletim sistemlerinde (Windows, Linux) ise donanımsal **Sayfalama (Paging)** birimi bulunur. İşletim sistemi her işleme (process) 4 KB'lık sayfalardan oluşan bağımsız bir **Sanal Adres Uzayı (Virtual Address Space)** tanımlar. Fiziksel RAM yetersiz kaldığında sabit disk veya SSD bir bellek uzantısı olarak kullanılır; bu mekanizmaya **Sanal Bellek (Virtual Memory)** adı verilir.

---

## 1.4 Mikroişlemcinin Rolü ve Çekirdek İşlemleri

Mikroişlemcinin saniyede milyarlarca çevrim gerçekleştiren karmaşık mimarisi, en temelde son derece sade **üç çekirdek görevin** sonsuz bir döngüde tekrarlanmasına dayanır:

```
                  ┌──────────────────────────────────────────────┐
                  │          MİKROİŞLEMCİNİN 3 TEMEL GÖREVİ       │
                  └──────────────────────┬───────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
┌─────────┴──────────┐        ┌──────────┴──────────┐        ┌──────────┴──────────┐
│  1. Veri Aktarımı  │        │ 2. Aritmetik/Mantık │        │ 3. Akış Kontrolü    │
│  (Data Transfer)   │        │ (Arithmetic & Logic)│        │   (Program Flow)    │
│ Bellek <-> İşlemci │        │ ALU ile Toplama,    │        │ Bayrakları test edip│
│ G/Ç    <-> İşlemci │        │ Çıkarma, AND, OR,   │        │ koşullu sıçramalarla│
│ Yazmaç <-> Yazmaç  │        │ Kaydırma, Döndürme  │        │ kararlar alma       │
└────────────────────┘        └─────────────────────┘        └─────────────────────┘
```

### Komut Yürütme Döngüsü (Instruction Cycle)
İşlemci bellekte sıralı olarak bulunan komutları şu 4 adımlı döngü ile çalıştırır:
1. **Fetch (Getir):** Program Sayacının (IP) gösterdiği adresten sıradaki makine kodu baytını bellekten getir.
2. **Decode (Çöz):** Getirilen baytın hangi komut olduğunu ve hangi işlenenleri gerektirdiğini denetim biriminde çöz.
3. **Execute (Yürüt):** Komutun gerektirdiği işlemi (ALU hesabı, veri transferi veya adres sıçraması) gerçekleştir.
4. **Repeat (Tekrarla):** IP yazmacını bir sonraki komuta ilerlet ve döngüyü baştan başlat.

### Standart Veri Genişlikleri
x86 assembly programlamasında kullanılan standart veri genişlikleri şu şekildedir:
- **Byte (Bayt):** 8 bit genişliğindedir. Belleğin adreslenebilen en küçük temel birimidir ($0$ ile $255$ arası). 8086 yazmaçları: `AL, AH, BL, BH, CL, CH, DL, DH`.
- **Word (Kelime):** 16 bit genişliğindedir (tam 2 bayt). 8086 mimarisinin yerel işlem birimidir. Yazmaçlar: `AX, BX, CX, DX, SP, BP, SI, DI, CS, DS, SS, ES, IP, FLAGS`.
- **Doubleword (Çift Kelime):** 32 bit genişliğindedir (4 bayt). 80386 ile tanıtılmıştır (`EAX, EBX, ECX, EDX`).
- **Quadword (Dörtlü Kelime):** 64 bit genişliğindedir (8 bayt). Modern 64-bit işlemcilerin yerel yazmaç boyutudur (`RAX, RBX, RCX, RDX`).

### Karar Mekanizması ve Durum Bayrakları
Mikroişlemci zekasını ve program akışını değiştirme yeteneğini, yapılan aritmetik ve mantıksal işlemlerin sonucunda **FLAGS (Bayraklar)** yazmacında otomatik güncellenen durum bitlerinden alır. Programlama modeli tipik olarak bir karşılaştırma (`CMP`) veya test (`TEST`) komutunu, ardından bu bayrakları okuyan bir koşullu sıçrama (`Jcc`) komutunu işletir:

```assembly
CMP AL, 5       ; AL yazmacı ile 5 sayısını karşılaştır (AL - 5 işlemi yaparak bayrakları kur)
JE EsitLabel    ; ZF = 1 ise (yani AL == 5 ise) EsitLabel etiketine sıçra
```

| Bayrak Kısaltması | Bayrak Adı | Test Ettiği Sayısal Durum ve Anlamı |
| :---: | :--- | :--- |
| **ZF** | Zero Flag (Sıfır Bayrağı) | Son yapılan işlemin sonucu tam olarak **sıfır** ise 1, sıfırdan farklı ise 0 olur. |
| **SF** | Sign Flag (İşaret Bayrağı) | Sonucun en yüksek anlamlı biti (MSB) 1 ise (yani sonuç **negatif** ise) 1, pozitif ise 0 olur. |
| **CF** | Carry Flag (Elde Bayrağı) | İşaretsiz toplamada en yüksek bitten bir **elde (carry)** çıkmışsa veya çıkarmada **borç (borrow)** alınmışsa 1 olur. |
| **OF** | Overflow Flag (Taşma Bayrağı) | İşaretli iki sayının toplama/çıkarma işleminde sonuç izin verilen işaretli aralığı aşmışsa (hatalı işaret üretilmişse) 1 olur. |
| **PF** | Parity Flag (Parite Bayrağı) | Sonucun en düşük 8 bitindeki 1'lerin toplam sayısı **çift (even)** ise 1, tek (odd) ise 0 olur. |
| **AF** | Auxiliary Carry (Yardımcı Elde) | Bit 3'ten Bit 4'e bir elde geçmişse 1 olur. BCD aritmetiğinde (`DAA, DAS`) kullanılır. |

---

## 1.5 Sayı Sistemleri ve Konumsal Ağırlıklı Gösterim

Mikroişlemciler fiziksel dünyada yalnızca iki voltaj seviyesini (örneğin 0V = mantık 0, 5V = mantık 1) tanıdıkları için **ikili (binary)** sayı tabanında işlem yaparlar. İnsanların kullandığı onluk sistem ile bilgisayarın ikili sistemi arasında köprü kurmak ve uzun ikili dizileri kompakt biçimde temsil etmek için dört temel sayı sistemi kullanılır:

| Taban Değeri ($r$) | Sayı Sistemi Adı | Kullanılan Basamak Sembolleri | Tipik Kullanım Alanı |
| :---: | :--- | :--- | :--- |
| **Taban 10** | Decimal (Onlu) | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 | İnsan arayüzleri, günlük matematiksel hesaplamalar. |
| **Taban 2** | Binary (İkili) | 0, 1 | Sayısal mantık devreleri, flip-floplar, makine kodu. |
| **Taban 8** | Octal (Sekizli) | 0, 1, 2, 3, 4, 5, 6, 7 | Eski PDP/UNIX sistemleri, 3-bit alan gruplamaları. |
| **Taban 16** | Hexadecimal (Onaltılı) | 0–9, A(10), B(11), C(12), D(13), E(14), F(15) | Bellek adresleri, opcode gösterimi, bayt değerleri. |

Assembly programlamada onaltılı sayıları belirtmek için sonuna `H` veya `h` eki konulur (`1234H`), modern C/C++ ve üst seviye dillerde ise `0x` öneki kullanılır (`0x1234`). Her iki gösterim de tamamen eşdeğerdir:
$$1234\text{H} \equiv 0\text{x}1234$$

### Konumsal Ağırlıklı Gösterim (Positional Notation)
Herhangi bir sayı tabanında ($r$) yazılan bir sayının her basamağı, o basamağın taban noktasına (radix point) olan uzaklığına göre belirlenen bir ağırlığa sahiptir:
- Taban noktasının **solundaki** pozitif basamaklar: $r^0, r^1, r^2, \dots$
- Taban noktasının **sağındaki** kesirli basamaklar: $r^{-1}, r^{-2}, r^{-3}, \dots$

Genel matematiksel gösterim formülü:

$$N = \sum_{i=-m}^{n-1} d_i \cdot r^i$$

Örnek olarak üç basamaklı onlu bir sayı ele alalım ($537_{10}$):
$$537_{10} = 5 \times 10^2 + 3 \times 10^1 + 7 \times 10^0 = 500 + 30 + 7 = 537$$

### Örnek 1: İkili (Binary) &rarr; Onlu (Decimal) Dönüşümü
$1101\ 0101_2$ ikili sayısını onlu karşılığına dönüştürelim:
- Bit 7 ($2^7 = 128$): $1 \times 128 = 128$
- Bit 6 ($2^6 = 64$): $1 \times 64 = 64$
- Bit 5 ($2^5 = 32$): $0 \times 32 = 0$
- Bit 4 ($2^4 = 16$): $1 \times 16 = 16$
- Bit 3 ($2^3 = 8$): $0 \times 8 = 0$
- Bit 2 ($2^2 = 4$): $1 \times 4 = 4$
- Bit 1 ($2^1 = 2$): $0 \times 2 = 0$
- Bit 0 ($2^0 = 1$): $1 \times 1 = 1$

$$\text{Toplam} = 128 + 64 + 16 + 4 + 1 = 213_{10}$$
$$1101\ 0101_2 = 213_{10}$$

### Örnek 2: Onaltılı (Hexadecimal) &rarr; Onlu (Decimal) Dönüşümü
$2\text{AF}_{16}$ onaltılı sayısını onlu sisteme çevirelim:
- Basamak 2 ($16^2 = 256$): $2 \times 256 = 512$
- Basamak 1 ($16^1 = 16$): $\text{A}(10) \times 16 = 160$
- Basamak 0 ($16^0 = 1$): $\text{F}(15) \times 1 = 15$

$$\text{Toplam} = 512 + 160 + 15 = 687_{10}$$
$$2\text{AF}_{16} = 687_{10}$$

### Örnek 3: Taban 6 &rarr; Onlu Dönüşümü (Ders Notu Örneği)
$125_6$ sayısını onlu sisteme çevirelim:
- $1 \times 6^2 = 1 \times 36 = 36$
- $2 \times 6^1 = 2 \times 6 = 12$
- $5 \times 6^0 = 5 \times 1 = 5$

$$\text{Toplam} = 36 + 12 + 5 = 53_{10}$$

### Binary-Coded Hexadecimal (BCH) Gruplama Kuralı
$16 = 2^4$ olduğundan, her bir onaltılı hane tam olarak **4 ikili bite (nibble)** karşılık gelir. Bu birebir eşleme sayesinde hiçbir karmaşık aritmetik yapmadan gruplama yoluyla dönüşüm yapılır:

$$2\text{AC}_{16} \implies \underbrace{0010}_{2} \ \underbrace{1010}_{\text{A}} \ \underbrace{1100}_{\text{C}_2}$$
$$83\text{D}.\text{E}_{16} \implies \underbrace{1000}_{8} \ \underbrace{0011}_{3} \ \underbrace{1101}_{\text{D}} \ . \ \underbrace{1110}_{\text{E}_2}$$

---

## 1.6 Sayı Sistemi Dönüşüm Algoritmaları

Onlu sistemden diğer tabanlara geçişte tamsayı kısmı ile kesirli kısım birbirinden farklı matematiksel algoritmalarla dönüştürülür.

### 1. Tamsayılarda Bölme-Kalan Metodu (Division-Remainder Method)
Bir onluk tamsayıyı hedef tabana ($r$) dönüştürmek için:
1. Sayı hedef tabana bölünür.
2. Bölüm ve kalan not edilir.
3. Bölüm sıfır olana kadar elde edilen yeni bölüm tekrar $r$'ye bölünür.
4. Kalanlar **alttan üste (son kalandan ilk kalana doğru)** okunarak hedef sayı oluşturulur (İlk kalan en düşük anlamlı bit olan LSB, son kalan en yüksek anlamlı bit olan MSB olur).

#### Örnek: $89_{10}$ Sayısını İkili (Binary) Tabana Dönüştürme
| İşlem | Bölüm (Quotient) | Kalan (Remainder) | Anlamı |
| :---: | :---: | :---: | :---: |
| $89 \div 2$ | 44 | **1** | LSB (En sağdaki bit) |
| $44 \div 2$ | 22 | **0** | |
| $22 \div 2$ | 11 | **0** | |
| $11 \div 2$ | 5 | **1** | |
| $5 \div 2$ | 2 | **1** | |
| $2 \div 2$ | 1 | **0** | |
| $1 \div 2$ | 0 | **1** | MSB (En soldaki bit) |

Kalanları alttan üste okuduğumuzda:  
$$89_{10} = 1011001_2$$  
**Sağlama:** $64 + 16 + 8 + 1 = 89_{10}$ (Doğru).

#### Örnek: $500_{10}$ Sayısını Onaltılı (Hexadecimal) Tabana Dönüştürme
| İşlem | Bölüm (Quotient) | Kalan (Remainder) | Onaltılı Sembol |
| :---: | :---: | :---: | :---: |
| $500 \div 16$ | 31 | **4** | 4 (LSB) |
| $31 \div 16$ | 1 | **15** | F |
| $1 \div 16$ | 0 | **1** | 1 (MSB) |

Kalanları alttan üste okuduğumuzda:  
$$500_{10} = 1\text{F}4_{16}$$  
**Sağlama:** $1 \times 256 + 15 \times 16 + 4 \times 1 = 256 + 240 + 4 = 500_{10}$ (Doğru).

---

### 2. Kesirli Sayılarda Çarpma-Taban Algoritması (Multiply-Radix Algorithm)
Onluk tabandaki bir kesirli sayıyı ($0 < F < 1$) hedef tabana ($r$) dönüştürmek için çarpma-taban algoritması uygulanır:
1. Kesirli sayı hedef tabanla ($r$) çarpılır:
   $$F \times r = I_1 + F_1$$
2. Ortaya çıkan sonucun tamsayı kısmı ($I_1$), kesir noktasının hemen sağındaki yeni basamak olarak kaydedilir (sıfır çıksa dahi kaydedilir).
3. Sonucun kesirli kısmı ($F_1$) alınarak tekrar $r$ ile çarpılır.
4. Bu işlem kesirli kısım tam **sıfır** olana veya istenen basamak hassasiyetine ulaşılana kadar tekrarlanır.
5. Basamaklar **yukarıdan aşağıya (ilk elde edilenden son elde edilene doğru)** yazılır.

#### Örnek: $0.125_{10}$ Kesrini İkili Tabana Dönüştürme
1. $0.125 \times 2 = \mathbf{0}.25$ &rarr; Tamsayı basamak: **0**
2. $0.25 \times 2 = \mathbf{0}.50$ &rarr; Tamsayı basamak: **0**
3. $0.50 \times 2 = \mathbf{1}.00$ &rarr; Tamsayı basamak: **1** (Kesir sıfırlandı, işlem tamamlandı).

Yukarıdan aşağıya basamaklar: $0, 0, 1$.  
$$0.125_{10} = 0.001_2$$

#### Örnek: $0.125_{10}$ Kesrini Sekizli (Octal) Tabana Dönüştürme
1. $0.125 \times 8 = \mathbf{1}.00$ &rarr; Tamsayı basamak: **1** (Kesir hemen sıfırlandı).  
$$0.125_{10} = 0.1_8$$

#### Örnek: $0.046875_{10}$ Kesrini Onaltılı (Hexadecimal) Tabana Dönüştürme
1. $0.046875 \times 16 = \mathbf{0}.75$ &rarr; Tamsayı basamak: **0**
2. $0.75 \times 16 = \mathbf{12}.00$ &rarr; Tamsayı basamak: $12 = \mathbf{C}$

Yukarıdan aşağıya basamaklar: $0, \text{C}$.  
$$0.046875_{10} = 0.0\text{C}_{16}$$

---

## 1.7 Bilgisayar Veri Temsili ve Tümleyen Aritmetiği

Sayısal elektronikte çıkarma işlemini gerçekleştirmek için ayrı bir çıkarma devresi tasarlamak maliyetli ve karmaşıktır. Bu nedenle modern bilgisayarlar çıkarma işlemini **negatif sayıyı ikiye tümleyen formunda temsil edip toplama devresine sokarak** gerçekleştirirler:
$$A - B = A + (-B)$$

### 1. Bire Tümleyen (One's Complement / Radix-1 Complement)
İkili sistemde bir sayının bire tümleyeni, sayının tüm bitlerinin mantıksal olarak terslenmesiyle ($0 \to 1, 1 \to 0$, NOT işlemi) elde edilir.

> **Bire Tümleyenin Sakıncası (Çift Sıfır Problemi):**  
> Bire tümleyen sisteminde iki farklı sıfır değeri oluşur:
> - Pozitif Sıfır: `0000 0000b` (+0)
> - Negatif Sıfır: `1111 1111b` (-0)  
> İki farklı sıfırın varlığı mantıksal karşılaştırma devrelerinde donanım karmaşasına yol açtığı için bire tümleyen tek başına negatif sayı saklamada kullanılmaz; yalnızca ikiye tümleyene giden bir ara basamak olarak değerlendirilir.

### 2. İkiye Tümleyen (Two's Complement / Radix Complement)
İkiye tümleyen sisteminde yalnızca **tek bir sıfır (00000000b)** bulunur ve modern işlemcilerin tamsayı aritmetik birimleri (ALU) istisnasız bu standardı uygular.

Matematiksel tanım formülü:

$$N^* = 2^k - N = (\overline{N}) + 1$$

Burada $k$ sistemin bit genişliği, $\overline{N}$ sayının bire tümleyenidir.

#### İki Adımlı İkiye Tümleyen Alma Kuralı:
1. **Adım 1:** Sayının tüm bitlerini tersle (Bire tümleyenini al).
2. **Adım 2:** Elde edilen sonuca **1 ekle** (İkiye tümleyen tamamlanır).

#### Adım Adım Örnek: $+76_{10}$ Sayısının Negatifini ($-76_{10}$) Bulma
8-bitlik sistemde $+76_{10}$ sayısını $-76_{10}$ değerine dönüştürelim:
1. $+76_{10}$ pozitif ikili değeri: `0100 1100b` (MSB = 0, Pozitif)
2. Bire tümleyen (bitleri tersle): `1011 0011b`
3. 1 ekle (İkiye tümleyen):
   $$\begin{array}{r@{\quad}l}
     1011\ 0011 & (\text{Bire tümleyen}) \\
   +\quad\quad\quad\quad 1 & \\
   \hline
     \mathbf{1011\ 0100} & (\text{İkiye tümleyen} = -76_{10} = \text{B4h})
   \end{array}$$

#### Çift Olumsuzlama ile Doğrulama (Check):
$-76_{10}$ (`1011 0100b`) değerinin tekrar ikiye tümleyenini aldığımızda orijinal $+76_{10}$ değerini elde etmeliyiz:
1. Bitleri tersle: `0100 1011b`
2. 1 ekle: `0100 1011b + 1 = 0100 1100b` ($= 76_{10}$). Sağlama doğrulanmıştır.

#### Toplama Yoluyla Matematiksel İspat ($A + (-A) = 0$):
Pozitif $+76$ ile negatif $-76$ değerlerini topladığımızda:
$$\begin{array}{r@{\quad}l}
  0100\ 1100 & (+76) \\
+\ 1011\ 0100 & (-76) \\
\hline
(1)\ 0000\ 0000 & (\text{Toplam})
\end{array}$$
Burada 8-bitlik yazmaç sınırını aşan en soldaki 9. bit (Elde - Carry) donanım tarafından atılır (discard edilir) ve sonuç tam olarak **0** çıkar! Bu durum ikiye tümleyen aritmetiğinin kusursuz çalıştığının kesin ispatıdır.

### 3. Onaltılı Sistemde Tümleyenler (15's & 16's Complement)
Benzer mantık onaltılı tabanda da geçerlidir:
- **15'e Tümleyen (Radix-1):** Her basamak F (15) sayısından çıkarılır.
  Örneğin $345_{16}$ sayısının 15'e tümleyeni:
  $$\text{FFF}_{16} - 345_{16} = \text{CBA}_{16}$$
- **16'ya Tümleyen (Radix Complement):** 15'e tümleyene 1 eklenir:
  $$\text{CBA}_{16} + 1 = \text{CBB}_{16}$$

### 4. İşaretli ve İşaretsiz Sayı Aralıkları
Bir baytlık hafıza hücresinde saklanan bitlerin büyüklüğü, programcının bu veriyi işaretli mi yoksa işaretsiz mi yorumladığına göre değişir:

| Veri Genişliği | İşaretsiz Sayı Aralığı (Unsigned) | İşaretli Sayı Aralığı (Two's Complement) |
| :--- | :--- | :--- |
| **8-Bit Bayt** | $0$ ile $255$ ($00\text{h} - \text{FFh}$) | $-128$ ile $+127$ ($80\text{h} - 7\text{Fh}$) |
| **16-Bit Kelime** | $0$ ile $65,535$ ($0000\text{h} - \text{FFFFh}$) | $-32,768$ ile $+32,767$ ($8000\text{h} - 7\text{FFFh}$) |
| **32-Bit Çift Kelime** | $0$ ile $4,294,967,295$ | $-2,147,483,648$ ile $+2,147,483,647$ |

8-bitlik işaretli bir baytta:
- En yüksek anlamlı bit (MSB, Bit 7) **ağırlığı $-128$ olan işaret bitidir**.
- Diğer bitler pozitif ağırlıklarını korur:
  $$b_7(-128) + b_6(64) + b_5(32) + b_4(16) + b_3(8) + b_2(4) + b_1(2) + b_0(1)$$
  Örneğin `1000 0000b` $= -128$, `1111 1111b` $= -128 + 127 = -1$ dir.

---

## 1.8 Veri Kodlama Standartları: BCD, ASCII ve Unicode

Mikroişlemci yalnızca ikili sayılarla çalışsa da kullanıcı arayüzlerinde onluk rakamlar ve metin karakterleri temsil edilmek zorundadır.

### 1. BCD (Binary Coded Decimal - İkili Kodlanmış Onlu)
BCD formatında her bir onluk basamak (0–9) bağımsız bir **4-bitlik ikili kod** ile ifade edilir ($0000_2$ – $1001_2$). $1010_2$ ile $1111_2$ arasındaki kombinasyonlar (onaltılı A–F) BCD formatında kesinlikle geçersizdir.

İki farklı BCD biçimi bulunur:
1. **Paketlenmemiş BCD (Unpacked BCD):**  
   Her baytta yalnızca bir onluk basamak saklanır. Baytın üst 4 biti daima `0000` dır.
   - Onluk **12** sayısı &rarr; İki ayrı bayt: `0000 0001` ve `0000 0010`
   - Onluk **623** sayısı &rarr; Üç ayrı bayt: `0000 0110`, `0000 0010`, `0000 0011`
   - Tipik olarak klavye, barkod okuyucu veya 7 segment gösterge sürücülerinden gelen ham veriler bu formattadır.
2. **Paketlenmiş BCD (Packed BCD):**  
   Bellekten tasarruf sağlamak amacıyla bir baytın içerisine iki onluk basamak (00–99) sıkıştırılır:
   - Onluk **12** sayısı &rarr; Tek bir bayt: `0001 0010` ($12_{16}$)
   - Onluk **623** sayısı &rarr; İki bayt: `0000 0110` ve `0010 0011` ($06_{16}$ ve $23_{16}$)
   - Intel 8086 mimarisinde `DAA` (Decimal Adjust for Addition) ve `DAS` (Decimal Adjust for Subtraction) komutları paketlenmiş BCD aritmetiğini donanımsal olarak destekler.

| Onluk Sayı (Decimal) | Paketlenmiş BCD (Packed BCD) | Paketlenmemiş BCD (Unpacked BCD) |
| :---: | :--- | :--- |
| **12** | `0001 0010` (1 bayt) | `0000 0001` `0000 0010` (2 bayt) |
| **623** | `0000 0110` `0010 0011` (2 bayt) | `0000 0110` `0000 0010` `0000 0011` (3 bayt) |

---

### 2. ASCII ve Karakter Temsili
**ASCII (American Standard Code for Information Interchange)**, harf, rakam ve sembolleri ikili sayılarla eşleyen 7-bitlik standart bir koddur ($0$ ile $127$ arası):
- **8. Bitin Tarihsel Rolü:** Eski sistemlerde ve seri iletişimde 8. bit (MSB) parite kontrol biti (Parity Bit) olarak kullanılmıştır. Eski nokta vuruşlu yazıcılarda ise 8. bitin 0 olması standart alfanümerik metin baskısını, 1 olması ise grafik çizim modunu seçtirirdi.
- **Genişletilmiş ASCII (Extended ASCII):** 8 bitin tamamı kullanılarak $128$–$255$ aralığına çerçeve çizim karakterleri, yabancı dil harfleri ve matematiksel semboller yerleştirilmiştir.

#### Kritik ASCII Aralıkları ve Dönüşüm Mantığı:
1. **Rakamlar ('0' – '9'):** `30h` – `39h` arasındadır.
   - `'0'` = `30h` (`0011 0000b`)
   - `'9'` = `39h` (`0011 1001b`)
2. **Büyük Harfler ('A' – 'Z'):** `41h` – `5Ah` arasındadır (`'A'` = `41h`, `'Z'` = `5Ah`).
3. **Küçük Harfler ('a' – 'z'):** `61h` – `7Ah` arasındadır (`'a'` = `61h`, `'z'` = `7Ah`).

> **Önemli Pratik: Büyük/Küçük Harf Farkı:**  
> Büyük harfler ile küçük harfler arasındaki tek fark tam olarak **5. bittir ($20\text{h}$)**:  
> `'A'` = `0100 0001b` ($41\text{h}$)  
> `'a'` = `0110 0001b` ($61\text{h}$)  
> Bir karakterin 5. biti 1 yapılırsa (`OR AL, 20h`) küçük harfe, 0 yapılırsa (`AND AL, 0DFh`) büyük harfe dönüştürülür.

> **Önemli Pratik: ASCII Rakam &rarr; Sayı Dönüşümü:**  
> Klavyeden okunan bir ASCII rakam karakterini sayısal BCD değerine dönüştürmek için karakterden `30h` (48) çıkarılır veya üst 4 bit maskelenir:
> ```assembly
> SUB AL, 30h    ; '7' (37h) - 30h = 07h (Sayısal 7)
> ; veya
> AND AL, 0Fh    ; 37h AND 0Fh = 07h
> ```
> Sayıyı ekranda basılacak ASCII karaktere çevirmek için ise `30h` eklenir:
> ```assembly
> ADD AL, 30h    ; 07h + 30h = 37h ('7' ASCII karakteri)
> ```

### 3. Unicode
Klasik ASCII yalnızca 128 karakter sunduğu için dünya dillerindeki tüm alfabeleri (Türkçe, Kiril, Arapça, Çince, Japonca vb.) tek bir sistemde temsil etmek mümkün değildi. 

Bu kısıtı aşmak amacıyla geliştirilen **Unicode** standardı, her karaktere benzersiz bir kod numarası (Code Point) atar. Modern Windows ve Linux sistemlerinde Unicode metinler genellikle 16-bit (UTF-16) veya internet standardı olan değişken uzunluklu **UTF-8** kodlaması ile saklanır.

---

## Bölüm Özeti

- Mikroişlemci (CPU), bilgisayarın beynidir; bellek ve G/Ç birimlerini veriyolları (Address, Data, Control) üzerinden mutlak bir otoriteyle yönetir.
- Adres veriyolu tek yönlüdür; $n$ adet adres hattı $2^n$ bayt fiziksel bellek adresler. 8086'nın 20-bit adres yolu 1 MB (`00000h`–`FFFFFh`), 16-bit G/Ç yolu ise 64 KB (`0000h`–`FFFFh`) port adresler.
- Veri veriyolu çift yönlüdür; aktarılan veri genişliği (8086'da 16 bit, modern işlemcilerde 64 bit) çevrim başına veri transfer hızını belirler.
- Kontrol veriyolu zamanlama sinyallerini taşır. $\overline{\text{MEMR}}$, $\overline{\text{MEMW}}$, $\overline{\text{IOR}}$, $\overline{\text{IOW}}$ sinyalleri aktif-düşük (0 ile tetiklenen) sinyallerdir.
- Klasik PC bellek haritası (1 MB): TPA (640 KB: `00000h`–`9FFFFh`), Sistem Alanı (384 KB: `A0000h`–`FFFFFh`). Sistem alanında Video RAM (`A0000h`–`BFFFFh`) ve Sistem BIOS ROM (`F0000h`–`FFFFFh`) bulunur.
- Mikroişlemcinin üç temel görevi: Veri Aktarımı, Aritmetik/Mantık ve Program Akış Kontrolüdür. Kararlar FLAGS yazmacındaki durum bitlerine (ZF, SF, CF, OF, PF, AF) göre verilir.
- Onlu tamsayılar hedef tabana Bölme-Kalan metodu ile dönüştürülür; kalanlar alttan üste okunur.
- Kesirli onluk sayılar hedef tabana Çarpma-Taban (Multiply-Radix: $F \times r = I_1 + F_1$) algoritması ile dönüştürülür; tamsayı kısımlar yukarıdan aşağıya toplanır.
- Bilgisayarlar negatif sayıları İkiye Tümleyen (Two's Complement: $N^* = 2^k - N = (\overline{N}) + 1$) formunda temsil eder. 1'e tümleyendeki çift sıfır problemi 2'ye tümleyende ortadan kalkar.
- Paketlenmemiş BCD her baytta 1 hane (üst 4 bit 0000), Paketlenmiş BCD her baytta 2 hane saklar.
- ASCII 7-bitlik metin standardıdır. '0'–'9' arası `30h`–`39h` dır; sayıya çevirmek için `30h` çıkarılır, karaktere çevirmek için `30h` eklenir.

---

## Değerlendirme ve Çalışma Soruları

1. 24-bit adres veriyoluna ve 32-bit veri veriyoluna sahip bir mikroişlemci doğrudan kaç megabayt bellek adresleyebilir ve tek bir bellek çevriminde kaç bayt transfer edebilir?
2. $\overline{\text{MEMR}}$ ve $\overline{\text{IOW}}$ kontrol hatlarının ikisi de aynı anda mantık 0 seviyesinde olabilir mi? Nedenini veriyolu çakışması açısından açıklayınız.
3. Klasik IBM PC mimarisinde Video RAM başlangıç adresi neden `A0000h` olarak belirlenmiştir? 640 KB TPA sınırı ile ilişkisini belirtiniz.
4. $138_{10}$ sayısını Bölme-Kalan yöntemi ile ikili ve onaltılı tabanlara dönüştürünüz.
5. $0.0625_{10}$ onluk kesrini Çarpma-Taban (Multiply-Radix) algoritmasını kullanarak ikili, sekizli ve onaltılı tabanlara dönüştürünüz.
6. 8-bitlik bir yazmaçta $+95_{10}$ sayısının ikiye tümleyenini alarak $-95_{10}$ karşılığını ikili ve onaltılı olarak bulunuz. Sonucu $+95$ ile toplayarak doğrulayınız.
7. Bire tümleyen sistemi ile ikiye tümleyen sistemi arasındaki en temel donanımsal fark nedir? Neden modern işlemciler bire tümleyen yerine ikiye tümleyeni tercih etmiştir?
8. Onluk 842 sayısını hem Paketlenmiş BCD hem de Paketlenmemiş BCD formatlarında ikili bayt dizileri olarak gösteriniz.
9. `'K'` harfinin ASCII kodu $4\text{Bh}$ ($0100\ 1011_2$) olduğuna göre, küçük `'k'` harfinin onaltılı ASCII kodunu 5. bit mantığını kullanarak hesaplayınız.
10. `IN` ve `OUT` komutlarının `MOV` komutundan farkı nedir? Neden harici G/Ç cihazlarına `MOV` komutu yerine `IN/OUT` ile erişilir?
