# MİKROİŞLEMCİLER VE 8086 MONTAJ DİLİ: KAPSAMLI DERS KİTABI
## Comprehensive Microprocessors & 8086 Assembly Language: The Definitive Academic Edition

**BMI3121 Microprocessors Course Curriculum**  
*Marmara Üniversitesi Bilgisayar Mühendisliği Bölümü Lisans Müfredatı*  
**Yayın Yılı**: 2026 Akademik Baskı  
**Pedagojik Metodoloji**: Sıfır Kayıp (Zero-Loss) Müfredat Sentezi & Çift Dilli Terminoloji Standardı  

---

## 📖 Akademik Önsöz (Academic Foreword)

Bilgisayar sistemleri mühendisliğinin ve modern bilgi işlemin kalbinde işlemci mimarisi yer alır. Transistörlerin mantık kapılarına, mantık kapılarının aritmetik-mantık birimlerine (ALU) ve kontrol mantığına, kontrol mantığının ise soyut yazılım dillerine bağlandığı en kritik kesişim noktası mikroişlemcidir.

Intel 8086 işlemcisi, bilgisayar mimarisi eğitiminde tüm dünyada yarım asırdır temel referans standardı olma özelliğini korumaktadır. 16-bit veri ve 20-bit adres veriyolu genişliği, Bus Interface Unit (BIU) ile Execution Unit (EU) arasındaki fonksiyonel işbölümü, 6-baytlık komut ön getirme kuyruğu (Prefetch Queue) ile sağlanan öncü boru hattı (pipelining) mimarisi, segmentasyon tabanlı bellek yönetimi ve donanımsal kesme vektör tablosu (IVT); günümüzün çok çekirdekli, süperskalar x86-64 canavarlarının dahi özünde çalışan temel ilkeleri oluşturmaktadır. Bir bilgisayar mühendisi için 8086 mimarisini ve onun makine diline en yakın ifadesi olan assembly (montaj) dilini özümsemek, işletim sistemlerinin bellek yönetimini, derleyicilerin kod üretim mantığını, çevre birimi sürücülerinin el sıkışma protokollerini ve donanım düzeyinde güvenlik mekanizmalarını derinlemesine anlamanın tek yoludur.

### Sıfır Kayıp (Zero-Loss) Müfredat Metodolojisi

Bu eser, Marmara Üniversitesi Bilgisayar Mühendisliği Bölümü **BMI3121 Microprocessors** dersi kapsamında kullanılan **21 özgün kaynak dokümanın** (5 adet PPTX sunumu, 200 slayt; 16 adet PDF ders notu ve laboratuvar kılavuzu, 566 sayfa; toplam 766 sayfa/slayt ve 41 referans tablosu) harfiyen taranması ve tek bir eksik bırakılmaksızın sentezlenmesi ile oluşturulmuştur:

1. **Hiçbir Kavram ve Kural Dışarıda Bırakılmamıştır**: 1 MB Real Mode bellek alanındaki Geçici Program Alanı (TPA 640 KB), Video RAM (A0000h–BFFFFh) ve ROM BIOS sınırlarından, 8255 PPI kontrol kelimesi formatlarına; Kesme Vektör Tablosu'nun (IVT 00000h–003FFh) 256 vektöründen, 8237 DMA denetleyicisinin HOLD/HLDA veriyolu arbitrasyonuna; 5-aşamalı komut boru hattı tehlikelerinden (RAW, WAR, WAW), önbellek AMAT başarım modellerine, Flynn taksonomisinden Amdahl Yasası hızlanma tavanına kadar tüm içerik eksiksiz olarak aktarılmıştır.
2. **Akademik Türkçe Anlatım & Standart İngilizce Terminoloji**: Bilimsel anlatım yüksek standartlı akademik Türkçe ile kurulurken; uluslararası literatürde, veri föylerinde (datasheet) ve derleyici ortamlarında kabul görmüş tüm teknik terimler, komut mnemonikleri (`MOV`, `ADC`, `XLAT`, `DAA`, `INTO`, `LODSB`, vb.), pin sinyalleri ($\overline{\text{MEMR}}, \overline{\text{MEMW}}, \overline{\text{IOR}}, \overline{\text{IOW}}$) ve yazmaç adları orijinal İngilizce formlarında parantez içi çift dilli eşleştirmelerle korunmuştur.
3. **Kendi Kendine Yeten (Self-Contained) Görselleştirme**: Tüm mimari bloklar, zamanlama diyagramları, bellek haritaları, durum grafikleri ve boru hattı akışları temiz Markdown ASCII tabloları ve şemalarıyla çizilmiş; hiçbir harici görsel bağlantısına bağımlı kalmaksızın %100 çevrimdışı görüntülenebilir hale getirilmiştir.
4. **Çalıştırılabilir Kod ve Simülatör Entegrasyonu**: Kitap içerisindeki yüzlerce kod örneği ve algoritma, modern web tabanlı **AssemblySim** 8086 simülatöründe (`ORG 100h` formatında) birebir derlenip adım adım (single-step) yürütülebilecek biçimde test edilmiştir.

Bu kapsamlı başvuru kitabı; 15 ana bölüm ve 5 teknik ekten oluşmaktadır.

---

## 📑 Ayrıntılı Genel İçindekiler Tablosu (Master Table of Contents)

### [Bölüm 1: Mikroişlemcilere Giriş, Bilgisayar Mimarisi ve Sayı Sistemleri](#bölüm-1-giriş-bilgisayar-mimarisi-ve-sayı-sistemleri)
- 1.1 Mikroişlemci Tanımı ve Bilgisayar Sistemlerinin Tarihsel Evrimi (4004'ten Modern Çok Çekirdeklilere)
- 1.2 Bilgisayarın Üç Temel Bloğu ve Sistem Veriyolu Mimarisi (Address Bus, Data Bus, Control Bus: MEMR, MEMW, IOR, IOW)
- 1.3 Klasik PC Bellek Haritası (TPA 640 KB, Video RAM A0000h-BFFFFh, Sistem ROM/BIOS C0000h-FFFFFh) ve G/Ç Uzayı
- 1.4 Sayı Sistemleri (İkili, Sekizli, Onlu, Onaltılı) ve Konumsal Ağırlıklı Gösterim ($N = \sum d_i \cdot r^i$)
- 1.5 Sayı Sistemi Dönüşüm Algoritmaları (Bölme-Kalan Metodu, Kesirli Sayılarda Çarpma-Taban / Multiply-Radix)
- 1.6 Bilgisayar Veri Temsili: Tümleyen Aritmetiği (1's & 2's Complement), BCD, ASCII ve Unicode

### [Bölüm 2: Intel 8086 Donanım Mimarisi, Yazmaçlar ve Segmentasyon](#bölüm-2-intel-8086-donanım-mimarisi-yazmaçlar-ve-segmentasyon-8086-hardware-architecture-registers--segmentation)
- 2.1 8086 İç Donanım Mimarisi: BIU (Bus Interface Unit) vs. EU (Execution Unit) İşbölümü
- 2.2 6-Baytlık Komut Ön Getirme Kuyruğu (Prefetch Queue) ve Pipelining Temelleri
- 2.3 İşlemci Komut Yürütme Döngüsü: Getir-Çöz-Çalıştır (Fetch-Decode-Execute / FDE) ve ALU
- 2.4 8086 Programlama Modeli: 14 Adet 16-Bit Yazmaç (AX, BX, CX, DX, SP, BP, SI, DI, CS, DS, SS, ES, IP, FLAGS)
- 2.5 16-Bit FLAGS (Bayrak) Yazmacının Anatomisi: 6 Durum Bayrağı (CF, PF, AF, ZF, SF, OF) ve 3 Kontrol Bayrağı (TF, IF, DF)
- 2.6 Real Mode 20-Bit Fiziksel Adres Hesaplama ($PA = \text{Segment}\times 16 + \text{Offset}$) ve Segment Dolanması (Wrap-Around)
- 2.7 Bellek Düzeni: Little-Endian Bayt Yerleşimi ve Çift/Tek Bellek Bankaları (Even/Odd Banks, BHE# ve A0)

### [Bölüm 3: 8086 Adresleme Modları ve Makine Kodu Formatı](#bölüm-3-8086-adresleme-modları-ve-makine-kodu-formatı)
- 3.1 Veri Adresleme Modlarının Temel İlkeleri ve MOV Sözdizimi
- 3.2 7 Temel Veri Adresleme Modu (Register, Immediate, Direct, Register Indirect, Base-Plus-Index, Register Relative, Base Relative-Plus-Index)
- 3.3 Program Bellek Adresleme Modları (Direct Far, Relative Near/Short, Indirect)
- 3.4 Segment Geçersiz Kılma Önekleri (Segment Override Prefixes: CS: 2Eh, SS: 36h, DS: 3Eh, ES: 26h)
- 3.5 8086 Makine Kodu İkili Formatı: Opcode, D-Biti, W-Biti, MOD-REG-R/M Baytı, Displacement ve Immediate Alanları
- 3.6 CISC (x86) ve RISC (ARM) Adresleme Modlarının Karşılaştırmalı Analizi

### [Bölüm 4: Veri Aktarım Komutları, Yığın Mimarisi ve İşaretçiler](#bölüm-4-veri-aktarım-komutları-yığın-mimarisi-ve-işaretçiler)
- 4.1 MOV Komutunun Çalışma Kuralları, Donanımsal Sınırlamaları ve Geçersiz İşlem Kombinasyonları
- 4.2 XCHG Komutu ve Atomik Veri Takas Mekanizması
- 4.3 Yığın (Stack) Bellek Mimarisi (LIFO), SS:SP Dinamiği ve PUSH / POP Komutları
- 4.4 Toplu Yığın İşlemleri: PUSHA, POPA, PUSHF, POPF ve Yığın Çerçevesi (Stack Frame) Oluşturma
- 4.5 Bellek İşaretçi Komutları: LEA (Load Effective Address) vs. MOV OFFSET, LDS, LES, LFS, LGS, LSS
- 4.6 Bayt-Kelime Boyut Genişletme Komutları (CBW, CWD, CWDE, CDQ, MOVSX, MOVZX) ve Bayrak Aktarımları (LAHF, SAHF)

### [Bölüm 5: Aritmetik Komutlar, BCD/ASCII Aritmetiği ve Bayrak Hassasiyeti](#bölüm-5-aritmetik-komutlar-bcdascii-aritmetiği-ve-bayrak-hassasiyeti-arithmetic-instructions-bcdascii-arithmetic--flag-sensitivity)
- 5.1 Temel Toplama ve Çıkarma: ADD, ADC, INC, SUB, SBB, DEC, NEG Komutları
- 5.2 Aritmetik Durum Bayraklarının Mekaniği (CF, OF, SF, ZF, AF, PF) ve Taşma (Overflow: $OF = C_{in} \oplus C_{out}$) Kuralı
- 5.3 Karşılaştırma Mekanizması: CMP Komutu ve İşaretli/İşaretsiz Karşılaştırma Mantığı
- 5.4 Çarpma İşlemleri: İşaretsiz (MUL) ve İşaretli (IMUL) Çarpma Kuralları, DX:AX Sonuç Yazmaçları
- 5.5 Bölme İşlemleri: İşaretsiz (DIV) ve İşaretli (IDIV) Bölme Kuralları, Bölüm/Kalan Yerleşimi ve Type 0 Taşma Kesmesi
- 5.6 Paketlenmiş ve Paketlenmemiş BCD Aritmetiği: DAA (Decimal Adjust for Addition) ve DAS (Decimal Adjust for Subtraction)
- 5.7 ASCII Aritmetiği: AAA, AAS, AAM ve AAD Komutlarının Matematiksel Algoritmaları
- 5.8 Çok Basamaklı ve Çok Kelimeli (Multi-Precision) Toplama/Çıkarma Algoritmaları

### [Bölüm 6: Mantıksal İşlemler, Maskeleme ve Bit Kaydırma/Döndürme](#bölüm-6-mantıksal-işlemler-maskeleme-ve-bit-kaydırmadöndürme-logic-instructions-masking--shiftsrotates)
- 6.1 Boole Mantık İşlemleri: AND, OR, XOR, NOT Komutları ve Doğruluk Tabloları
- 6.2 Bit Maskeleme Teknikleri: Belirli Bitleri Sıfırlama (AND), Birleme (OR) ve Tersleme (XOR)
- 6.3 TEST Komutu ve Yıkıcı Olmayan (Non-Destructive) Durum Tespiti
- 6.4 Mantıksal ve Aritmetik Kaydırma Komutları: SHL/SAL, SHR, SAR (Çarpma ve Bölme Hızlandırma)
- 6.5 Döngüsel Kaydırma Komutları: ROL, ROR, RCL, RCR (Carry Bayrağı Dahil/Hariç Döndürme)
- 6.6 Çok Kelimeli (Multi-Word / 32-bit / 48-bit) Verilerde Bit Kaydırma ve Döndürme Algoritmaları

### [Bölüm 7: Program Akış Kontrolü, Koşullu Sıçramalar, Döngüler ve Prosedürler](#bölüm-7-program-akış-kontrolü-koşullu-sıçramalar-döngüler-ve-prosedürler-control-flow-conditional-jumps-loops--procedures)
- 7.1 Program Akış Kontrolünün Temelleri: Koşulsuz Sıçrama (JMP: Short, Near, Far)
- 7.2 Koşullu Sıçrama Komutları (Jcc): Eşitlik, İşaretli ve İşaretsiz Sayı Karşılaştırma Bayrak Kuralları
- 7.3 Sayaç Temelli Döngü Komutları: LOOP, LOOPE/LOOPZ, LOOPNE/LOOPNZ ve JCXZ
- 7.4 Prosedür Çağrıları ve Dönüş Mekanizması: CALL (Near/Far), RET (Near/Far, RET n)
- 7.5 Alt Yordamlarda Parametre Aktarımı: Yazmaçlar, Bellek Alanları ve Yığın (Stack) ile İletişim
- 7.6 Standart Yığın Çerçevesi (Stack Frame), BP Tabanlı Yerel Değişkenler ve Çağrı Standartları
- 7.7 Yuvalanmış (Nested) Prosedür Çağrıları ve Özyineleme (Recursion) İlkeleri

### [Bölüm 8: Dizi ve String İşlemleri, Blok Bellek Transferi ve XLAT](#bölüm-8-dizi-ve-string-işlemleri-blok-bellek-transferi-ve-xlat)
- 8.1 Dizi ve String Mimarisi: DS:SI (Kaynak) ve ES:DI (Hedef) Yazmaç Çiftleri
- 8.2 Yön Bayrağı (Direction Flag - DF), CLD (DF=0) ve STD (DF=1) Bayrak Yönetimi
- 8.3 Beş Temel String Primitifi: MOVSB/MOVSW, LODSB/LODSW, STOSB/STOSW, CMPSB/CMPSW, SCASB/SCASW
- 8.4 Tekrar Önekleri: REP, REPE/REPZ, REPNE/REPNZ ile Yüksek Hızlı Blok İşlemleri
- 8.5 XLAT / XLATB Komutu ve Arama Tablosu (Lookup Table / DS:BX + AL) Dönüşüm Tekniği
- 8.6 Uygulamalı Dizi Algoritmaları: Arama, Sıralama, En Büyük/En Küçük Bulma ve Bellek Kopyalama

### [Bölüm 9: Giriş/Çıkış (G/Ç) Sistemleri, Portlar ve 8255 PPI Denetleyicisi](#bölüm-9-girişçıkış-gç-sistemleri-portlar-ve-8255-ppi-denetleyicisi-io-systems-ports--8255-ppi)
- 9.1 Giriş/Çıkış Arayüzü İlkeleri ve G/Ç Modüllerinin Temel Rolü
- 9.2 G/Ç Adresleme Modelleri: Yalıtılmış G/Ç (Isolated / Port I/O) vs. Bellek Haritalı G/Ç (Memory-Mapped I/O)
- 9.3 8086 G/Ç Komutları: IN ve OUT (Sabit Port 00h-FFh vs. Değişken Port DX: 0000h-FFFFh)
- 9.4 G/Ç Veri Transfer Yöntemleri: Programlı G/Ç (Polling / Busy-Wait), Kesmeli G/Ç ve Senkronizasyon
- 9.5 Veriyolu Sistemleri ve El Sıkışma (Handshaking) Sinyalleri (STB#, IBF/OBF, ACK#)
- 9.6 Intel 8255 PPI Donanım Mimarisi: Port A, Port B, Port C (Üst/Alt) ve Kontrol Yazmacı
- 9.7 8255 Çalışma Modları: Mod 0 (Temel G/Ç), Mod 1 (Strobed G/Ç), Mod 2 (Çift Yönlü Veriyolu) ve BSR (Bit Set/Reset) Modu
- 9.8 Seri İletişim Arayüzlerine Genel Bakış (UART, RS-232, USB, Ethernet, Bluetooth)

### [Bölüm 10: Kesmeler, Kesme Vektör Tablosu (IVT) ve İstisna Mimarisi](#bölüm-10-kesmeler-kesme-vektör-tablosu-ivt-ve-istisna-mimarisi-interrupts-ivt-architecture--exceptions)
- 10.1 Kesme (Interrupt) ve İstisna (Exception) Tanımı, Donanım ve Yazılım Kesmelerinin Farkları
- 10.2 Kesme Vektör Tablosu (Interrupt Vector Table - IVT) Mimarisi (00000h–003FFh, 256 Vektör, $PA = \text{Tip}\times 4$)
- 10.3 Intel Tarafından Rezerve Edilmiş Özel Kesmeler: Tip 0 (Sıfıra Bölme), Tip 1 (Tek Adım / TF), Tip 2 (NMI), Tip 3 (Breakpoint - 0xCC), Tip 4 (INTO / Taşma)
- 10.4 Donanım Kesmeleri: Maskelenebilir Kesmeler (INTR, CLI/STI Bayrağı) ve Maskelenemez Kesmeler (NMI)
- 10.5 8086 Kesme Yanıt ve Yürütme Sırası: FLAGS Saklama, IF/TF Temizleme, CS:IP Yığına Atma, Vektör Çekme ve IRET
- 10.6 Kesme Servis Rutinleri (ISR) Tasarım İlkeleri, Bağlam Saklama (PUSHA/POPA) ve Yuvalanmış Kesmeler
- 10.7 Intel 8259A Programlanabilir Kesme Denetleyicisi (PIC) ve Öncelikli Kesme Yönetimi
- 10.8 Standart BIOS ve DOS Kesmeleri: INT 10h (Video Hizmetleri), INT 16h (Klavye Hizmetleri), INT 21h (DOS Fonksiyonları)

### [Bölüm 11: Doğrudan Bellek Erişimi (DMA) ve İşletim Sistemi Desteği](#bölüm-11-doğrudan-bellek-erişimi-dma-ve-işletim-sistemi-desteği-direct-memory-access--operating-system-support)
- 11.1 Doğrudan Bellek Erişimi (DMA) Kavramı ve İşlemci Darboğazlarının Giderilmesi
- 11.2 Veriyolu Tahsisi ve Çakışma Yönetimi (Bus Arbitration): HOLD ve HLDA Sinyalleri, Çevrim Çalma vs. Blok (Burst) Modu
- 11.3 Intel 8237 DMA Denetleyicisi Mimarisi: 4 Bağımsız Kanal, İç Yazmaçlar (Address, Word Count, Command, Mode, Mask)
- 11.4 DMA Veri Transfer Adımları ve Bellek-Bellek, G/Ç-Bellek Transfer Modları
- 11.5 DMA ve Önbellek Tutarlılığı (Cache Coherency) Problemi ve Çözümleri
- 11.6 İşletim Sistemi Temelleri ve İşlemci Desteği: Proses Durumları (New, Ready, Running, Waiting, Terminated)
- 11.7 Proses Kontrol Bloğu (PCB - Process Control Block) Yapısı, Bağlam Değiştirme (Context Switching) ve İşlemci Planlama
- 11.8 Donanım Koruma Seviyeleri: Kullanıcı Modu (User Mode) vs. Çekirdek Modu (Kernel / Supervisor Mode)

### [Bölüm 12: Komut Boru Hattı (Instruction Pipelining) ve Tehlikeler (Hazards)](#bölüm-12-komut-boru-hattı-instruction-pipelining-ve-tehlikeler-hazards)
- 12.1 Komut Boru Hattı (Instruction Pipelining) Temel İlkesi ve Montaj Hattı Analojisi
- 12.2 Klasik 5-Aşamalı RISC/İşlemci Boru Hattı: IF (Fetch), ID (Decode), EX (Execute), MEM (Memory), WB (Write-Back)
- 12.3 Boru Hattı Başarımı ve Hızlanma (Speedup) Matematiksel Modeli ($S_k = \frac{n \cdot k}{k + n - 1}$)
- 12.4 Boru Hattı Tehlikeleri 1: Yapısal Tehlikeler (Structural Hazards) ve Kaynak Çakışmaları
- 12.5 Boru Hattı Tehlikeleri 2: Veri Tehlikeleri (Data Hazards: RAW, WAR, WAW), İletme (Forwarding/Bypassing) ve Duraklatma (Stall/Bubble)
- 12.6 Boru Hattı Tehlikeleri 3: Kontrol Tehlikeleri (Control / Branch Hazards) ve Dallanma Cezası (Branch Penalty)
- 12.7 Dallanma Tahmini (Statik Tahmin, Dinamik 1-Bit / 2-Bit Doygunluk Sayıcıları, BTB) ve Gecikmeli Dallanma (Delayed Branching)

### [Bölüm 13: Bellek Hiyerarşisi, Önbellek Mimarisi ve Yerellik İlkesi](#bölüm-13-bellek-hiyerarşisi-önbellek-mimarisi-ve-yerellik-ilkesi-memory-hierarchy-cache-memory--locality-of-reference)
- 13.1 Bellek Hiyerarşisi Piramidi: Hız, Kapasite ve Maliyet Takasları (Yazmaçlar, L1/L2/L3 Önbellek, DRAM, SSD, HDD)
- 13.2 Yerellik İlkesi (Principle of Locality): Zamansal Yerellik (Temporal) ve Mekansal Yerellik (Spatial)
- 13.3 Önbellek Organizasyonunun Temel Yapısı: Hat/Blok Boyutu, Etiket (Tag), İndeks (Index) ve Ofset (Offset: $A = t + s + b$)
- 13.4 Önbellek Eşleme Teknikleri: Doğrudan Eşlemeli (Direct-Mapped), Tam İlişkili (Fully Associative) ve Kümeli İlişkili (Set-Associative)
- 13.5 Önbellek Iska Türleri (The 3 Cs: Compulsory/Cold, Capacity, Conflict Misses)
- 13.6 Önbellek Yazma Politikaları: Doğrudan Yazma (Write-Through) vs. Geriye Yazma (Write-Back, Dirty Bit)
- 13.7 Blok Değiştirme Algoritmaları (LRU, FIFO, Random), AMAT Modeli ve Çok Çekirdekli Sistemlerde MESI Protokolü

### [Bölüm 14: Assembly Dili Makroları ve Intel 8085 vs. 8086 Karşılaştırması](#bölüm-14-assembly-dili-makroları-ve-intel-8085-vs-8086-karşılaştırması-assembly-macros--intel-8085-vs-8086-comparison)
- 14.1 Assembly Dilinde Makro (MACRO) Kavramı, Tanımlama ve Çağırma Sözdizimi (MACRO, ENDM)
- 14.2 Makrolar ile Prosedürlerin (CALL / RET) Karşılaştırmalı Analizi: Kod Boyutu, Çalışma Hızı ve Yığın Yükü Takasları
- 14.3 Parametreli ve Koşullu Makro Yapıları (IF, IFE, IFDEF, IFNDEF, REPT)
- 14.4 Intel 8085 Mikroişlemcisi Mimarisi: 8-Bit ALU, 16-Bit Adres Veriyolu, Çoklanmış AD0–AD7 Veriyolu
- 14.5 Intel 8085 Programlama Modeli: Akümülatör (A), Genel Yazmaçlar (B, C, D, E, H, L), Yazmaç Çiftleri (BC, DE, HL / M), PC, SP ve FLAGS
- 14.6 Intel 8085 Komut Kümesi ve Adresleme Modları (MOV, MVI, LXI, LDA, STA, LHLD, SHLD, ADD, SUB, INR, DCR, INX, DCX, DAD, JMP, CALL, RET)
- 14.7 Intel 8085 Donanım Kesmeleri: TRAP (NMI), RST 7.5, RST 6.5, RST 5.5, INTR Öncelik Sıralaması
- 14.8 Kapsamlı Karşılaştırma: Intel 8085 vs. Intel 8086 (Mimari, Performans, Adresleme Kapasitesi ve Komut Zenginliği)

### [Bölüm 15: Paralel İşleme, Çok Çekirdekli Mimariler ve RISC vs. CISC](#bölüm-15-paralel-işleme-çok-çekirdekli-mimariler-ve-risc-vs-cisc-parallel-processing-multi-core--risc-vs-cisc)
- 15.1 Paralel İşleme İlkeleri ve Flynn Taksonomisi: SISD, SIMD, MISD, MIMD Mimarileri
- 15.2 Paralellik Düzeyleri: Bit Düzeyi, Komut Düzeyi (ILP: Superscalar, Out-of-Order), İş Parçacığı Düzeyi (TLP: Çok Çekirdek, SMT / Hyper-Threading) ve Veri Paralelliği (SIMD, GPU)
- 15.3 Çok Çekirdekli (Multi-Core) İşlemci Mimarileri: Paylaşılan Bellek (Shared Memory - UMA/NUMA) ve Çekirdekler Arası İletişim
- 15.4 Paralel Başarım Sınırları: Amdahl Yasası (Seri Darboğaz İlkesi: $S(s) = \frac{1}{(1-p) + p/s}$, Azami Tavan: $\frac{1}{1-p}$)
- 15.5 Ölçeklenmiş Hızlanma: Gustafson Yasası ($S(s) = (1-p) + s \cdot p$) ve Büyük Veri İşleme Dinamikleri
- 15.6 RISC (Reduced Instruction Set Computer) vs. CISC (Complex Instruction Set Computer) Mimarilerinin Derinlemesine Karşılaştırması
- 15.7 Modern İşlemcilerin Hibrit Mimarisi: CISC Komutlarının Dahili RISC Benzeri Mikro-Operasyonlara (µops) Çözülmesi

### [Ekler (Appendices)](#ekler-appendices)
- [Ek A: 8086 Komut Kümesi ve Bayrak Etkileri Hızlı Başvuru Tablosu](#ek-a-8086-komut-kümesi-ve-bayrak-etkileri-hızlı-başvuru-tablosu)
- [Ek B: Kesme Vektör Tablosu (IVT 00000h–003FFh, Tip 0–255) Tam Haritası](#ek-b-kesme-vektör-tablosu-ivt-00000h003ffh-tip-0255-tam-haritası)
- [Ek C: ASCII ve Donanım Tarama Kodları Tablosu](#ek-c-ascii-ve-donanım-tarama-kodları-tablosu)
- [Ek D: 8085 vs 8086 Mnemonic Çevrim ve Karşılaştırma Rehberi](#ek-d-8085-vs-8086-mnemonic-çevrim-ve-karşılaştırma-rehberi)
- [Ek E: Donanım ve Mimari Referans Tabloları](#ek-e-donanım-ve-mimari-referans-tabloları)

---


---

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


---

# Bölüm 2: Intel 8086 Donanım Mimarisi, Yazmaçlar ve Segmentasyon (8086 Hardware Architecture, Registers & Segmentation)

## Giriş ve Bölümün Kapsamı

Intel 8086, 1978 yılında piyasaya sürülen ve modern x86 bilişim dünyasının temellerini atan 16-bitlik bir mikroişlemcidir. Kendisinden önceki 8-bitlik Intel 8080/8085 işlemcilerinden farklı olarak, 8086 mimarisi hem dahili veri yollarında hem de harici veri veriyolunda 16-bitlik sözcük (word) genişliğini kullanmaktadır. 20-bitlik fiziksel adres veriyolu sayesinde işlemci, tam $2^{20} = 1.048.576\text{ bayt} = 1\text{ MB}$ fiziksel bellek uzayını doğrudan adresleyebilmektedir.

Bu bölümde, 8086 mikroişlemcisinin dahili donanım organizasyonu, işlemcinin iki ana bağımsız birime (BIU ve EU) ayrılması, 6-baytlık komut ön getirme kuyruğu (prefetch queue), temel işlemci döngüsü (Fetch-Decode-Execute / FDE), 14 adet 16-bitlik yazmaçtan oluşan programlama modeli, 16-bitlik bayrak yazmacı (FLAGS), Real Mode (Gerçek Mod) 20-bitlik fiziksel adres hesaplama formülü ($PA = \text{Segment}\times 16 + \text{Offset}$), bellek segmentasyonu ve dolanması (wrap-around), çift/tek bellek bankaları (Even/Odd banks, BHE# ve A0) ve Little-Endian bayt depolama mimarisi en ince donanımsal ayrıntılarıyla incelenecektir.

---

## 2.1 8086 İç Donanım Mimarisi: BIU (Bus Interface Unit) vs. EU (Execution Unit) İşbölümü

Geleneksel mikroişlemcilerde işlemci döngüsü katı bir sıra izlerdi: işlemci önce bellekten bir komut getirir (Fetch), ardından komutu çözer (Decode) ve son olarak çalıştırırdı (Execute). Komut bellekte okunurken aritmetik mantık birimi atıl (idle) bekler; işlemci hesaplama yaparken ise dış veriyolları boş kalırdı. 

Intel mühendisleri 8086 işlemcisinde bu verimsizliği ortadan kaldırmak amacıyla işlemci donanımını iki bağımsız, paralel çalışan işlevsel birime ayırmışlardır:
1. **BIU (Bus Interface Unit - Veriyolu Arayüz Birimi)**
2. **EU (Execution Unit - Yürütme Birimi)**

Bu mimari ayrım, bilgisayar mühendisliğinde komut boru hattının (instruction pipelining) ilk mikroişlemci uygulamasıdır.

```
+===================================================================================+
|                       INTEL 8086 MİKROİŞLEMCİ İÇ MİMARİSİ                          |
+===================================================================================+
|                                                                                   |
|   +---------------------------------------+   +-------------------------------+   |
|   |    BIU (BUS INTERFACE UNIT)           |   |    EU (EXECUTION UNIT)        |   |
|   |    Veriyolu Arayüz Birimi             |   |    Yürütme Birimi             |   |
|   +---------------------------------------+   +-------------------------------+   |
|   |                                       |   |                               |   |
|   |  +---------------------------------+  |   |  +-------------------------+  |   |
|   |  | Segment Yazmaçları (16-bit):    |  |   |  | Genel Amaçlı Yazmaçlar: |  |   |
|   |  |   CS (Code Segment)             |  |   |  |   AX (AH / AL)          |  |   |
|   |  |   DS (Data Segment)             |  |   |  |   BX (BH / BL)          |  |   |
|   |  |   SS (Stack Segment)            |  |   |  |   CX (CH / CL)          |  |   |
|   |  |   ES (Extra Segment)            |  |   |  |   DX (DH / DL)          |  |   |
|   |  +---------------------------------+  |   |  +-------------------------+  |   |
|   |  | Komut İşaretçisi:               |  |   |  | İşaretçi & İndeksler:   |  |   |
|   |  |   IP (Instruction Pointer)      |  |   |  |   SP (Stack Pointer)    |  |   |
|   |  +---------------------------------+  |   |  |   BP (Base Pointer)     |  |   |
|   |                   |                   |   |  |   SI (Source Index)     |  |   |
|   |                   v                   |   |  |   DI (Dest Index)       |  |   |
|   |  +---------------------------------+  |   |  +-------------------------+  |   |
|   |  | 20-Bit Fiziksel Adres Toplayıcı |  |   |               |               |   |
|   |  | (Segment << 4) + Offset         |  |   |               v               |   |
|   |  +---------------------------------+  |   |  +-------------------------+  |   |
|   |                   |                   |   |  | 16-Bit ALU              |  |   |
|   |                   v                   |   |  | Aritmetik Mantık Birimi |  |   |
|   |  +---------------------------------+  |   |  +-------------------------+  |   |
|   |  | Veriyolu Kontrol Mantığı        |  |   |         |           ^         |   |
|   |  | (BHE#, RD#, WR#, M/IO#, ALE)    |  |   |         v           |         |   |
|   |  +---------------------------------+  |   |  +-------------+    |         |   |
|   |                   |                   |   |  | FLAGS       |    |         |   |
|   |                   v                   |   |  | 16-Bit      |    |         |   |
|   |  +---------------------------------+  |   |  | Bayrak      |    |         |   |
|   |  | 6-Baytlık Komut Ön Getirme     |  |   |  | Yazmacı     |    |         |   |
|   |  | Kuyruğu (Prefetch Queue - FIFO) |  |   |  +-------------+    |         |   |
|   |  | [ B1 | B2 | B3 | B4 | B5 | B6 ] |======> Kontrol Birimi      |         |   |
|   |  +---------------------------------+  |   |  (Control Unit &    |         |   |
|   +-------------------|-------------------+   |   Komut Çözücü)     |         |   |
|                       | (Dış Veriyolları)     +-------------|-------|---------+   |
|                       v                                     v       v             |
|          +========================+             +========================+        |
|          | ADRES/VERİ VERİYOLLARI |             | DAHİLİ YÜRÜTME VERİYOLU|        |
|          | A19-A0 & D15-D0        |             | (16-bit Dahili Bus)    |        |
|          +========================+             +========================+        |
+===================================================================================+
```

### BIU (Bus Interface Unit - Veriyolu Arayüz Birimi) ve Görevleri

BIU, işlemci yongası ile dış dünya (sistem belleği ve G/Ç aygıtları) arasındaki tüm fiziksel iletişimi kuran **yegane** donanım birimidir. EU doğrudan sistem veriyollarına bağlanamaz; bellekten okuma veya belleğe yazma ihtiyacı duyduğunda bunu BIU'ya talep olarak iletir.

BIU bünyesinde bulunan temel donanım blokları ve görevleri şunlardır:
1. **Adres Üretimi (Address Generation):** 16-bitlik segment yazmaçları ile 16-bitlik ofset değerlerini alarak dahili 20-bitlik adres toplayıcısında birleştirir ve harici adres veriyoluna ($A_{19}-A_0$) 20-bitlik fiziksel adres sürer.
2. **Komut Ön Getirme (Instruction Prefetching):** Sistem veriyolları EU tarafından veri transferi için kullanılmadığı anlarda, BIU boş durmaz; `CS:IP` yazmaç çiftinin gösterdiği bellek adresinden sıradaki komut baytlarını peşin peşin okur ve dahili **6-baytlık Prefetch Queue (Komut Ön Getirme Kuyruğu)** içerisine yazar.
3. **Veri Transferi (Bus Control):** EU bir bellek işlenenini okumak (`MOV AX, [BX]`) veya yazmak (`MOV [DI], CX`) istediğinde, veriyolu kontrol sinyallerini ($\overline{\text{RD}}, \overline{\text{WR}}, \text{M}/\overline{\text{IO}}, \text{ALE}, \overline{\text{BHE}}$) üreterek 16-bitlik harici veri yolunda ($D_{15}-D_0$) okuma/yazma çevrimini yürütür.
4. **Segment Yazmaçları ve IP:** Kod segmenti (`CS`), Veri segmenti (`DS`), Yığın segmenti (`SS`), Ekstra segment (`ES`) ve Komut İşaretçisi (`IP`) doğrudan BIU donanımında yer alır.

### EU (Execution Unit - Yürütme Birimi) ve Görevleri

EU, getirilen makine komutlarını çözmek, mikro-işlemleri planlamak ve hesaplamaları gerçekleştirmekle görevli işlem birimidir. Dış veriyollarının zamanlama ve sinyal ayrıntılarıyla ilgilenmez; komut baytlarını doğrudan BIU'nun prefetch kuyruğundan çeker.

EU bünyesindeki temel donanım blokları ve görevleri şunlardır:
1. **Kontrol Birimi (Control Unit - CU) ve Komut Çözücü (Instruction Decoder):** Prefetch kuyruğunun başındaki komut baytını okur, opkodunu (işlem kodunu) çözer ve komutun gerektirdiği mikro-operasyon adımlarını tetikler.
2. **16-Bit Aritmetik Mantık Birimi (ALU - Arithmetic Logic Unit):** İşlemcinin hesaplama motorudur. 8-bit ve 16-bit tamsayı toplama (`ADD`), çıkarma (`SUB`), çarpma (`MUL`), bölme (`DIV`), mantıksal işlemler (`AND`, `OR`, `XOR`, `NOT`) ve bit kaydırma/döndürme işlemlerini yürütür.
3. **Genel Amaçlı Veri Yazmaçları:** Hızlı veri saklama için kullanılan `AX`, `BX`, `CX` ve `DX` yazmaçları ile bunların 8-bitlik yarıları (`AH`, `AL`, `BH`, `BL`, `CH`, `CL`, `DH`, `DL`) EU içerisindedir.
4. **İşaretçi ve İndeks Yazmaçları:** Yığın işaretçisi (`SP`), taban işaretçisi (`BP`), kaynak indeks (`SI`) ve hedef indeks (`DI`) yazmaçları EU denetimindedir.
5. **Bayrak Yazmacı (FLAGS):** ALU'da yapılan son aritmetik veya mantıksal işlemin sonucuna göre güncellenen durum bayrakları (CF, PF, AF, ZF, SF, OF) ve işlemcinin çalışmasını yönlendiren kontrol bayrakları (TF, IF, DF) burada tutulur.

### Temel İşlemci Kontrol Komutları: HLT ve NOP

İşlemcinin BIU ve EU birimlerinin koordineli çalışmasında iki özel komut kritik rol oynar:
- `NOP (No Operation)`: Opkodu `90h` olan bu komut, EU biriminde hiçbir yazmacı veya bayrağı değiştirmeden tam 3 saat çevrimi harcar. Kod hizalama, hassas donanım gecikmeleri oluşturma veya bellek yamalarında kullanılır.
- `HLT (Halt)`: İşlemciyi durma (halt) durumuna sokar. İşlemci harici bir donanım kesmesi (`INTR` veya `NMI`) veya reset sinyali gelene kadar komut yürütmeyi durdurur; saat darbeleri çalışmaya devam eder ancak veriyolu çevrimleri askıya alınır.

---

## 2.2 6-Baytlık Komut Ön Getirme Kuyruğu (Prefetch Queue) ve Pipelining Temelleri

BIU ile EU arasındaki en kritik köprü **6-baytlık komut ön getirme kuyruğudur (Prefetch Queue)**. Bu kuyruk, donanımsal bir **FIFO (First-In, First-Out - İlk Giren İlk Çıkar)** bellek yapısıdır.

```
       +-------------------------------------------------------------+
       |   BIU 6-BAYTLIK KOMUT ÖN GETİRME KUYRUĞU (FIFO YAPISI)      |
       +-------------------------------------------------------------+
       Bellekten                                               EU'ya
       Okunan Baytlar                                    Komut Çözücüye
       ===============> [ Bayt 6 | Bayt 5 | Bayt 4 | Bayt 3 | Bayt 2 | Bayt 1 ] =======>
                         (Giriş)                               (Çıkış)
```

### Boru Hattı (Pipelining) Mekanizması

Geleneksel işlemcilerde bir komut bitmeden diğeri getirilemezdi. 8086 mimarisinde ise BIU ve EU asenkron ve paralel çalışır:
- EU bir komut üzerinde aritmetik hesaplama yaparken (örneğin çok çevrim süren `MUL BX` komutunu yürütürken), dış veriyolları boştadır.
- Bu boşluğu tespit eden BIU, bir sonraki komutun baytlarını bellekten okur ve 6-baytlık FIFO kuyruğuna doldurur.
- EU o anki komutu tamamladığında, bir sonraki komut için bellek erişimi beklemek zorunda kalmaz; komut baytı hazır bekleyen kuyruktan anında çekilir ($0$ veriyolu bekleme çevrimi).

### Kuyruk Doldurma Kuralı (Queue Fetch Threshold)

8086 mikroişlemcisinin veri veriyolu 16-bit (2 bayt) genişliğindedir. BIU, veriyolu bant genişliğini verimli kullanabilmek için her seferinde çift bayt (word) getirmeye çalışır. Bu nedenle BIU'nun kuyruğa yeni bir komut getirme kuralı şöyledir:
> **Kural:** 6-baytlık kuyrukta en az **2 baytlık boş yer** oluştuğunda ve EU dış veriyolunu kullanmıyorsa, BIU `CS:IP` adresinden 16-bitlik okuma yaparak 2 baytı kuyruğa ekler ve IP değerini 2 artırır.

### Boru Hattı Tehlikesi: Dallanma ve Kuyruk Boşaltma (Pipeline Flush)

Pipelining mekanizmasının en zayıf noktası kontrol akışı dallanmalarıdır. Program akışı sıralı ilerlerken kuyruk mükemmel hızlandırma sağlar. Ancak işlemci bir koşulsuz sıçrama (`JMP`), alt yordam çağrısı (`CALL`), yordamdan dönüş (`RET`) veya şartı sağlanan bir koşullu sıçrama (`JZ`, `JNZ` vb.) komutu ile karşılaştığında:
1. Önceden getirilip kuyrukta saklanan sıralı komut baytları geçersiz hale gelir.
2. Kuyruk derhal tamamen boşaltılır (**Queue Flush**).
3. BIU, yeni hedef adresin fiziksel konumuna (`yeni CS:IP`) veriyolunu yönlendirir ve ilk komut baytlarını getirene kadar EU bekletilir (Pipeline Stall / Branch Penalty).

Bu durum, programlama pratiğinde sık ve gereksiz dallanmalardan kaçınmanın neden önemli bir optimizasyon ilkesi olduğunu açıklamaktadır.

---

## 2.3 İşlemci Komut Yürütme Döngüsü: Getir-Çöz-Çalıştır (Fetch-Decode-Execute / FDE)

Bir komutun işlemci tarafından işlenmesi üç ana evreden oluşan **FDE (Fetch-Decode-Execute)** döngüsü şeklinde gerçekleşir:

```
            +-------------------------------------------+
            |      1. GETİR (INSTRUCTION FETCH)         |
            | BIU, CS:IP adresinden komutu okur ve     |
            | 6-baytlık Prefetch Queue'ya ekler.        |
            +-------------------------------------------+
                                  |
                                  v
            +-------------------------------------------+
            |      2. ÇÖZ (INSTRUCTION DECODE)          |
            | EU Kontrol Birimi kuyruktan opkodu alır,  |
            | MOD-REG-R/M baytını çözümler.             |
            +-------------------------------------------+
                                  |
                                  v
            +-------------------------------------------+
            |      3. ÇALIŞTIR (EXECUTE)                |
            | 16-bit ALU işlemi yapar, bayrakları       |
            | günceller, gerekirse bellek/yazmaç yazar. |
            +-------------------------------------------+
                                  |
                                  +---------> Döngü Başına Dön
```

### FDE Aşamalarının Ayrıntılı Analizi

1. **Fetch (Komut Getirme):**
   - Komut İşaretçisi (`IP`), kod segmenti içindeki okunacak bir sonraki komut baytının ofsetini tutar.
   - BIU, $PA = CS \times 16 + IP$ adresini üretip bellekten okur.
   - Komut baytları 6-baytlık FIFO kuyruğuna yazılır.

2. **Decode (Komut Çözme):**
   - EU Kontrol Birimi, kuyruğun başındaki ilk 1 veya 2 baytı çeker.
   - Opkod incelenerek komutun türü (aritmetik, mantık, veri transferi, kontrol), işlenenlerin boyutları ($W$ biti: bayt/kelime), yönü ($D$ biti) ve adresleme modu (MOD, REG, R/M alanları) donanımsal mantık kapılarıyla çözülür.

3. **Execute (Yürütme / Çalıştırma):**
   - Gerekli işlenenler (operandlar) yazmaçlardan veya bellekten temin edilir.
   - 16-bit ALU işlemi yürütür (örn. iki sayıyı toplar veya VE mantığı uygular).
   - Sonuç hedef yazmaca veya belleğe yazılır.
   - Durum bayrakları (FLAGS: CF, PF, AF, ZF, SF, OF) ALU çıktısına göre güncellenir.

### Veriyolu Saat Çevrimleri (T-States)

8086 mimarisinde temel bir veriyolu işlemi (Bus Cycle) en az **4 saat çevriminden (Clock Cycle - T1, T2, T3, T4)** oluşur:
- **T1:** 20-bitlik fiziksel adres veriyoluna sürülür ve Adres Kilitleme Sinyali (`ALE`) aktif edilir.
- **T2:** Adres hatları veri hatlarına dönüştürülür (Time-Multiplexed Bus), okuma (`RD#`) veya yazma (`WR#`) kontrol sinyali sürülür.
- **T3:** Bellek veya G/Ç aygıtının yanıt vermesi beklenir. Aygıt yavaşsa `READY` hattı düşük tutularak araya bekleme durumları (`Tw - Wait States`) eklenir.
- **T4:** Veri hatlarındaki bayt/kelime işlemci veya bellek tarafından örneklenir (latch edilir) ve veriyolu çevrimi tamamlanır.

---

## 2.4 8086 Programlama Modeli: 14 Adet 16-Bit Yazmaç

Programlama modeli, bir yazılımcının assembly dilinde doğrudan adresleyebildiği veya programın işleyişi sırasında dikkate almak zorunda olduğu işlemci yazmaçlarının bütünüdür.

8086 mikroişlemcisinde tamamı **16-bit** genişliğinde tam **14 adet program-görünür (program-visible)** yazmaç bulunmaktadır:
- 4 adet Genel Amaçlı Veri Yazmacı: `AX`, `BX`, `CX`, `DX`
- 2 adet İşaretçi Yazmacı: `SP`, `BP`
- 2 adet İndeks Yazmacı: `SI`, `DI`
- 4 adet Segment Yazmacı: `CS`, `DS`, `SS`, `ES`
- 1 adet Komut İşaretçisi: `IP`
- 1 adet Bayrak Yazmacı: `FLAGS`

Program-görünmez (program-invisible) yazmaçlar ise komut kuyruğunun dahili tamponları, geçici ALU yazmaçları ve veriyolu arabirim kütükleri gibi uygulama geliştiricinin doğrudan adlandıramadığı donanım elemanlarıdır.

```
+===================================================================================+
|               INTEL 8086 PROGRAMLAMA MODELİ (14 ADET 16-BİT YAZMAÇ)               |
+===================================================================================+
|  GENEL AMAÇLI VERİ YAZMAÇLARI (Multipurpose Registers)                            |
|  +--------------------+--------------------+                                      |
|  | AH (Bits 15..8)    | AL (Bits 7..0)     |  AX (Akümülatör / Accumulator)       |
|  +--------------------+--------------------+                                      |
|  | BH (Bits 15..8)    | BL (Bits 7..0)     |  BX (Taban / Base Index)             |
|  +--------------------+--------------------+                                      |
|  | CH (Bits 15..8)    | CL (Bits 7..0)     |  CX (Sayaç / Count Register)         |
|  +--------------------+--------------------+                                      |
|  | DH (Bits 15..8)    | DL (Bits 7..0)     |  DX (Veri / Data Register)           |
|  +--------------------+--------------------+                                      |
+-----------------------------------------------------------------------------------+
|  İŞARETÇİ VE İNDEKS YAZMAÇLARI (Pointer & Index Registers)                         |
|  +-----------------------------------------+                                      |
|  | SP (Stack Pointer - Yığın İşaretçisi)   |  Yığın tepesi ofseti                 |
|  +-----------------------------------------+                                      |
|  | BP (Base Pointer - Taban İşaretçisi)    |  Yığın çerçevesi / parametre erişimi |
|  +-----------------------------------------+                                      |
|  | SI (Source Index - Kaynak İndeks)       |  Kaynak string / bellek işaretçisi   |
|  +-----------------------------------------+                                      |
|  | DI (Destination Index - Hedef İndeks)   |  Hedef string / bellek işaretçisi    |
|  +-----------------------------------------+                                      |
+-----------------------------------------------------------------------------------+
|  SEGMENT YAZMAÇLARI (Segment Registers - 64 KB Segment Tabanları)                 |
|  +-----------------------------------------+                                      |
|  | CS (Code Segment - Kod Segmenti)        |  Yürütülen komutların tabanı         |
|  +-----------------------------------------+                                      |
|  | DS (Data Segment - Veri Segmenti)       |  Statik ve genel değişkenlerin tabanı|
|  +-----------------------------------------+                                      |
|  | SS (Stack Segment - Yığın Segmenti)     |  Yığın belleğin tabanı               |
|  +-----------------------------------------+                                      |
|  | ES (Extra Segment - Ekstra Segment)     |  Ekstra veri ve hedef string tabanı  |
|  +-----------------------------------------+                                      |
+-----------------------------------------------------------------------------------+
|  KONTROL VE DURUM YAZMAÇLARI (Control & Status Registers)                          |
|  +-----------------------------------------+                                      |
|  | IP (Instruction Pointer - Komut İşaret.)|  Sıradaki komutun ofset adresi       |
|  +-----------------------------------------+                                      |
|  | FLAGS (16-Bit Bayrak Yazmacı)           |  9 aktif bayrak (6 durum, 3 kontrol) |
|  +-----------------------------------------+                                      |
+===================================================================================+
```

### Yazmaç Genişliklerinin Tarihsel Evrimi (8, 16, 32, 64-Bit)

x86 mimarisi geriye dönük tam uyumluluk (backward compatibility) felsefesiyle tasarlanmıştır. Bu sayede 8086 için yazılmış bir makine kodu, günümüzün modern 64-bit Core i9 veya AMD Ryzen işlemcilerinde dahi doğrudan çalışabilmektedir:

| Genişlik | Yazmaç Örnekleri | Tanıtıldığı Mimari | Adresleme Biçimi |
|---|---|---|---|
| **8-bit** | `AH, AL, BH, BL, CH, CL, DH, DL` | 8086 (1978) | Bağımsız bayt yazmaçları |
| **16-bit** | `AX, BX, CX, DX, SP, BP, SI, DI, IP, FLAGS, CS, DS, SS, ES` | 8086 (1978) | Standart kelime (word) |
| **32-bit** | `EAX, EBX, ECX, EDX, ESP, EBP, ESI, EDI, EIP, EFLAGS, FS, GS` | 80386 (1985) | `E` (Extended) ön eki |
| **64-bit** | `RAX, RBX, RCX, RDX, RSP, RBP, RSI, RDI, RIP, RFLAGS` + `R8-R15` | AMD64 / Intel 64 (2003) | `R` ön eki ve R8-R15 |

### İçiçe Geçmiş Yazmaç Yapısı (Nested Widths)

64-bitlik `RAX` yazmacı bağımsız yeni bir donanım değildir; `EAX`, `AX`, `AH` ve `AL` aynı fiziksel silikon kütüğünün farklı alt kesitleridir:
```
63                                            31              15       7      0
+---------------------------------------------+---------------+--------+------+
|                                             |               |   AH   |  AL  |
|                                             |               +--------+------+
|                                             |               |       AX      |
|                                             +---------------+---------------+
|                                             |              EAX              |
+---------------------------------------------+-------------------------------+
|                                             RAX                             |
+-----------------------------------------------------------------------------+
```
- `AL` (Bits 7..0) yazıldığında, `AH` ve `RAX`'in üst 48 biti **kesinlikle değişmez**.
- `AH` (Bits 15..8) yazıldığında, `AL` ve üst 48 bit korunur.
- `AX` (Bits 15..0) yazıldığında, alt 16 bit güncellenir.
- 64-bit modda `R8-R15` yazmaçları için boyut önekleri: `R9B` (8-bit bayt), `R9W` (16-bit kelime), `R9D` (32-bit çift kelime), `R9` (64-bit dörtlü kelime). `R8-R15` yazmaçlarında üst bayt (`AH` benzeri) ayrımı yoktur; yalnızca en sağdaki 8 bit bayt olarak adreslenebilir.

### Çok Amaçlı Yazmaçların (AX, BX, CX, DX, SP, BP, SI, DI) Görevleri

1. **AX (Accumulator Register - Akümülatör):**
   - Aritmetik ve mantık işlemlerinde ana sonuç yazmacıdır.
   - Donanımsal çarpma (`MUL/IMUL`) ve bölme (`DIV/IDIV`) işlemlerinde zorunlu işlenendir.
   - BCD ve ASCII düzeltme komutları (`DAA`, `DAS`, `AAA`, `AAS`, `AAM`, `AAD`) doğrudan AL/AX üzerinde çalışır.
   - Giriş/Çıkış (`IN/OUT`) komutlarında port verisi daima AL (8-bit) veya AX (16-bit) üzerinden akar.
2. **BX (Base Register - Taban Yazmacı):**
   - Bellek adresleme modlarında taban işaretçisi olarak kullanılır. `[BX]` şeklinde dolaylı bellek erişimine izin veren tek genel veri yazmacıdır.
   - `XLAT` (Translate / Tablo Çeviri) komutunda arama tablosunun başlangıç ofsetini tutar.
   - Varsayılan olarak `DS` (Data Segment) ile eşleşir.
3. **CX (Count Register - Sayaç Yazmacı):**
   - Tekrarlı döngü komutlarında (`LOOP`, `LOOPE`, `LOOPNE`) donanımsal sayaçtır. Her adımda otomatik olarak 1 azalır ve 0 kontrolü yapılır.
   - Bit kaydırma ve döndürme komutlarında (`SHL`, `SHR`, `SAR`, `ROL`, `ROR`, `RCL`, `RCR`) 1'den büyük kaydırma miktarı zorunlu olarak `CL` yazmacında verilir.
   - Tekrarlı string komutlarında (`REP`, `REPE`, `REPNE`) transfer edilecek eleman sayısını tutar.
4. **DX (Data Register - Veri Yazmacı):**
   - 16-bitlik çarpma işleminde sonucun yüksek 16 bitini tutar (`DX:AX`).
   - 32-bitin 16-bite bölünmesinde bölünen sayının yüksek 16 bitini barındırır.
   - G/Ç port adreslemesinde port numarası 255'ten (0FFh) büyük olduğunda port adresi `DX` yazmacına yüklenir (`IN AL, DX` veya `OUT DX, AX`).
5. **SP (Stack Pointer - Yığın İşaretçisi):**
   - Yığın (stack) alanının en tepesindeki geçerli ofset adresini tutar.
   - `PUSH`, `POP`, `CALL`, `RET`, `INT`, `IRET` komutlarında otomatik olarak 2 azalır veya 2 artar.
   - Varsayılan olarak daima `SS` (Stack Segment) ile çalışır.
6. **BP (Base Pointer - Taban İşaretçisi):**
   - Yığın çerçevesi (stack frame) oluşturularak fonksiyonlara geçirilen parametrelere ve yerel değişkenlere erişmek için kullanılır.
   - `[BP+4]`, `[BP-2]` gibi ofsetlerle yığın belleğine rastgele erişim sağlar.
   - Varsayılan olarak `SS` segmenti ile eşleşir.
7. **SI (Source Index - Kaynak İndeks):**
   - Bellekten blok veri transferlerinde veya dizi işlemlerinde kaynak elemanın ofsetini tutar.
   - String komutlarında (`MOVSB`, `LODSB`, `CMPSB`) varsayılan olarak `DS:SI` çifti kullanılır.
8. **DI (Destination Index - Hedef İndeks):**
   - Blok veri transferlerinde hedef elemanın ofset adresini tutar.
   - String komutlarında (`MOVSB`, `STOSB`, `SCASB`) **istisnasız her zaman `ES:DI`** çifti olarak kullanılır.

---

## 2.5 16-Bit FLAGS (Bayrak) Yazmacının Anatomisi: 6 Durum Bayrağı ve 3 Kontrol Bayrağı

8086 mikroişlemcisinde bulunan 16-bitlik **FLAGS (Bayrak Yazmacı)**, işlemcinin durum gösterge paneli (dashboard) gibidir. Bu yazmaçtaki bitlerin 9 tanesi aktif olarak kullanılır:
- **6 Durum Bayrağı (Status Flags):** CF, PF, AF, ZF, SF, OF (ALU işlemlerinin sonucunu yansıtır).
- **3 Kontrol Bayrağı (Control Flags):** TF, IF, DF (İşlemcinin çalışma modunu denetler).
- Geriye kalan bitler tanımsız veya Intel tarafından gelecekteki mimariler için rezerve edilmiştir.

```
+===================================================================================+
|                       16-BİT FLAGS (BAYRAK YAZMACI) BİT HARİTASI                   |
+===================================================================================+
| 15 | 14 | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0     |
+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+--------+
| 0  | NT |  IOPL   | OF | DF | IF | TF | SF | ZF | 0  | AF | 0  | PF | 1  | CF     |
+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+--------+
       ^    \_____/   ^    ^    ^    ^    ^    ^         ^         ^         ^
       |       |      |    |    |    |    |    |         |         |         |
       |       |      |    |    |    |    |    |         |         |         +-- CF: Carry Flag (Bit 0)
       |       |      |    |    |    |    |    |         |         +------------ PF: Parity Flag (Bit 2)
       |       |      |    |    |    |    |    |         +---------------------- AF: Auxiliary Carry (Bit 4)
       |       |      |    |    |    |    |    +-------------------------------- ZF: Zero Flag (Bit 6)
       |       |      |    |    |    |    +------------------------------------- SF: Sign Flag (Bit 7)
       |       |      |    |    |    +------------------------------------------ TF: Trap Flag (Bit 8)
       |       |      |    |    +----------------------------------------------- IF: Interrupt Flag (Bit 9)
       |       |      |    +---------------------------------------------------- DF: Direction Flag (Bit 10)
       |       |      +--------------------------------------------------------- OF: Overflow Flag (Bit 11)
       |       +---------------------------------------------------------------- IOPL: I/O Privilege Level (80286+)
       +------------------------------------------------------------------------ NT: Nested Task Flag (80286+)
```

### FLAGS Yazmacı Kapsamlı Referans Tablosu

Aşağıdaki tablo 8086 FLAGS yazmacındaki tüm bitleri, adlarını, türlerini ve işlevlerini eksiksiz özetlemektedir:

| Bit No | Kısaltma | Bayrak Adı (English / Türkçe) | Tür | Açıklama ve Çalışma Kuralı |
|---|---|---|---|---|
| **0** | **CF** | **Carry Flag** (Elde Bayrağı) | Durum | Toplama işleminde en yüksek değerlikli bitten (MSB) dışarı elde çıkarsa veya çıkarmada borç (borrow) alınırsa `1` olur. İşaretsiz aritmetik taşmalarını gösterir. |
| **1** | — | Rezerve | — | Donanımsal olarak daima `1` değerindedir. |
| **2** | **PF** | **Parity Flag** (Parite Bayrağı) | Durum | ALU sonucunun **en alt 8 bitindeki (low byte)** ikili `1`'lerin sayısı çift (even) ise `PF = 1`, tek (odd) ise `PF = 0` olur. Seri iletişim hata denetiminde kullanılır. |
| **3** | — | Rezerve | — | Tanımsız / `0`. |
| **4** | **AF** | **Auxiliary Carry Flag** (Yardımcı Elde) | Durum | Toplama veya çıkarmada 3. bitten 4. bite (alt nibble'dan üst nibble'a) elde veya borç geçtiğinde `1` olur. Paketlenmiş BCD aritmetiğinde (`DAA`, `DAS`) kullanılır. |
| **5** | — | Rezerve | — | Tanımsız / `0`. |
| **6** | **ZF** | **Zero Flag** (Sıfır Bayrağı) | Durum | Yapılan aritmetik veya mantıksal işlemin sonucu tam olarak sıfır çıktığında `ZF = 1` olur. Sonuç sıfırdan farklıysa `ZF = 0` olur. `CMP` ve koşullu sıçramaların kalbidir. |
| **7** | **SF** | **Sign Flag** (İşaret Bayrağı) | Durum | İşlem sonucunun en yüksek değerlikli bitini (MSB - işaret biti) kopyalar. Sonuç negatif ise (`MSB = 1`) `SF = 1`, pozitif veya sıfır ise (`MSB = 0`) `SF = 0` olur. |
| **8** | **TF** | **Trap Flag** (Tuzak / Adım Bayrağı) | Kontrol | `TF = 1` yapıldığında işlemci tek adım moduna (Single Step Mode) geçer. Her komut çalıştırıldıktan sonra otomatik olarak Tip 1 kesmesi tetiklenir (Debugger desteği). |
| **9** | **IF** | **Interrupt Flag** (Kesme İzin Bayrağı) | Kontrol | `IF = 1` ise harici maskelenebilir donanım kesmeleri (`INTR` pini) kabul edilir. `STI` komutu ile `1`, `CLI` komutu ile `0` yapılır. `NMI` kesmesini etkilemez. |
| **10** | **DF** | **Direction Flag** (Yön Bayrağı) | Kontrol | String komutlarında (`MOVS`, `LODS`, `STOS` vb.) `SI` ve `DI` yazmaçlarının otomatik artışını (`DF = 0`, `CLD` komutu) veya azalışını (`DF = 1`, `STD` komutu) belirler. |
| **11** | **OF** | **Overflow Flag** (Taşma Bayrağı) | Durum | İşaretli 2'ye tümleyen (signed two's complement) aritmetik işleminde sonuç temsil edilebilir sayı aralığını aştığında `1` olur. |
| **12-13** | **IOPL** | I/O Privilege Level (G/Ç Ayrıcalık Düzeyi) | Sistem | 80286 ve üzeri korumalı modda G/Ç aygıtlarına erişim ayrıcalık düzeyini (00: en yüksek, 11: en düşük) belirler. |
| **14** | **NT** | Nested Task (İçiçe Görev Bayrağı) | Sistem | 80286+ korumalı modda bir görevin başka bir görev içinden `CALL` ile çağrıldığını gösterir. |
| **15** | — | Rezerve | — | Tanımsız / `0`. |

*(Not: Pentium ve sonraki 32/64-bit işlemcilerde EFLAGS/RFLAGS içerisine RF - Resume, VM - Virtual 8086 Mode, AC - Alignment Check, VIF - Virtual Interrupt, VIP - Virtual Interrupt Pending ve ID - CPUID desteği eklenmiştir).*

### Carry (CF) ile Overflow (OF) Arasındaki Hayati Fark

Sınavlarda ve sistem programlamada en sık karıştırılan kavram Elde (Carry) ile Taşma (Overflow) bayraklarıdır:
- **Carry Flag (CF - Elde):** İşaretsiz (unsigned) sayılar için geçerlidir. $N$ bitlik bir sayının kapasitesini ($0$ ile $2^N-1$) aşan bir bit dışarı taştığında set edilir.
- **Overflow Flag (OF - Taşma):** İşaretli (signed) 2'ye tümleyen sayılar için geçerlidir. İki pozitif sayının toplamı negatif çıkarsa veya iki negatif sayının toplamı pozitif çıkarsa meydana gelir.

Matematiksel olarak ALU donanımında taşma şu formülle tespit edilir:
$$OF = C_{in} \oplus C_{out}$$
Burada $C_{in}$ en yüksek bite (MSB) giren elde, $C_{out}$ ise en yüksek bitten çıkan eldedir. Eğer en yüksek bite giren elde ile çıkan elde birbirinden farklıysa ($1 \oplus 0 = 1$ veya $0 \oplus 1 = 1$), taşma gerçekleşir ve $OF = 1$ olur.

#### Sayısal Örnek 1: Taşma (OF = 1, CF = 0)
8-bit işaretli toplamada $+127$ ($7Fh$) ile $+1$ ($01h$) toplayalım:
```
    0111 1111  ( 7Fh = +127 )
  + 0000 0001  ( 01h = +1   )
  -------------
    1000 0000  ( 80h = -128 işaretli sistemde! )
```
- İki pozitif sayının toplamı negatif ($-128$) çıkmıştır! Mantıksal bir imkansızlık oluştuğundan **$OF = 1$** olur.
- Ancak 8. bitten dışarıya 9. bir bit taşmadığı için **$CF = 0$** kalır.

#### Sayısal Örnek 2: Elde (CF = 1, OF = 0)
8-bit toplamada $255$ ($FFh$) ile $1$ ($01h$) toplayalım:
```
    1111 1111  ( FFh = 255 unsigned veya -1 signed )
  + 0000 0001  ( 01h = 1   unsigned veya +1 signed )
  -------------
  1 0000 0000  ( Sonuç: 00h, dışarı çıkan elde = 1 )
```
- Dışarıya 9. bit taştığı için **$CF = 1$** olur.
- İşaretli bakış açısıyla: $-1 + (+1) = 0$'dır. Sonuç ($00h$) tamamen doğrudur; dolayısıyla işaretli taşma yoktur: **$OF = 0$**.
- Sonuç sıfır çıktığı için **$ZF = 1$** olur.

---

## 2.6 Real Mode 20-Bit Fiziksel Adres Hesaplama ve Segment Dolanması (Wrap-Around)

Intel 8086 mikroişlemcisinin dahili mimarisi, yazmaçları ve ALU'su 16-bit genişliğindedir. 16-bitlik tek bir yazmaç en fazla $2^{16} = 65.536\text{ bayt} = 64\text{ KB}$ bellek adresleyebilir. Ancak 8086'nın harici adres veriyolu 20-bit genişliğindedir ve $2^{20} = 1.048.576\text{ bayt} = 1\text{ MB}$ fiziksel bellek alanına sahiptir.

16-bitlik yazmaçlarla 20-bitlik bellek alanını adresleyebilmek için Intel mühendisleri **Bellek Segmentasyonu (Memory Segmentation)** tekniğini geliştirmişlerdir.

### 20-Bit Fiziksel Adres Hesaplama Formülü

Real Mode modunda fiziksel adres, bir **Segment Yazmacı** ile bir **Ofset (Offset) Adresinin** donanımsal olarak birleştirilmesiyle üretilir. 

Fiziksel Adres (Physical Address - PA) formülü:
$$PA = \text{Segment} \times 16 + \text{Offset}$$

Onaltılık (Hexadecimal) tabanda 16 ile çarpmak, sayının sağına bir adet $0h$ hanesi eklemek veya sayıyı ikili tabanda 4 bit sola kaydırmak ($\ll 4$) demektir:
$$PA = (\text{Segment} \ll 4) + \text{Offset}$$

Düz metin gösterimiyle:
$$\text{PA = Segment * 16 + Offset}$$

```
+===================================================================================+
|               20-BİT FİZİKSEL ADRES OLUŞTURMA DONANIM MEKANİZMASI                 |
+===================================================================================+
|  Segment Yazmacı (16-bit):  | 1 | 2 | 3 | 4 |                                     |
|  4 Bit Sola Kaydır (<< 4):  | 1 | 2 | 3 | 4 | 0 |  (Segment Taban Adresi)         |
|                                                                                   |
|  Ofset Yazmacı (16-bit):            | 0 | 5 | 0 | 0 |  (Segment İçi Konum)        |
|  +--------------------------------------------------+                             |
|  20-Bit Fiziksel Adres (PA):| 1 | 2 | 8 | 4 | 0 |                                 |
+===================================================================================+
```

### Segment Boyutu ve Sınırları

- Her bellek segmenti daima **$64\text{ KB} = 65.536\text{ bayt}$** uzunluğundadır (Ofset aralığı: $0000h$ ile $FFFFh$).
- Bir segmentin başlangıç adresi (Base Address): $\text{Segment} \times 16$
- Bir segmentin bitiş adresi (Limit Address): $(\text{Segment} \times 16) + FFFFh$
- Segment yazmacı 1 arttığında, fiziksel başlangıç adresi $10h = 16$ bayt ileri kayar. Bu 16 baytlık bloklara bilgisayar mimarisinde **paragraf (paragraph)** adı verilir. Dolayısıyla segmentler bellekte herhangi bir paragraf sınırından başlayabilir.

### Sayısal Adres Hesaplama Örnekleri

1. **Örnek 1 (Komut Getirme - CS:IP):**
   $CS = 1400h$ ve $IP = 1200h$ olsun.
   $$\text{Segment Tabanı} = 1400h \times 10h = 14000h$$
   $$PA = 14000h + 1200h = 15200h$$
   İşlemci sıradaki komutu bellekten fiziksel $15200h$ adresinden çeker.

2. **Örnek 2 (Yığın Erişimi - SS:BP):**
   $SS = 2000h$ ve $BP = 3000h$ olsun.
   $$\text{Segment Tabanı} = 2000h \times 10h = 20000h$$
   $$PA = 20000h + 3000h = 23000h$$

3. **Örnek 3 (Segment Aralığı Hesaplama):**
   Segment yazmacı $2000h$ olduğunda:
   - Başlangıç adresi: $20000h$
   - Bitiş adresi: $20000h + FFFFh = 2FFFFh$
   Segment yazmacı $2001h$ olduğunda:
   - Başlangıç adresi: $20010h$
   - Bitiş adresi: $20010h + FFFFh = 3000Fh$

### Varsayılan Segment ve Ofset Eşleşmeleri Tablosu

8086 mikroişlemcisi, bellek erişim türüne göre otomatik olarak belirli segment ve ofset yazmaçlarını eşleştirir:

| Segment Yazmacı | Ofset Yazmacı | Özel Kullanım Amacı (Special Purpose) | Segment Geçersiz Kılma (Override) |
|---|---|---|---|
| `CS` (Code Segment) | `IP` (Instruction Pointer) | Yürütülecek makine komutunun adresi | Yapılamaz (Asla değiştirilemez) |
| `SS` (Stack Segment) | `SP` (Stack Pointer) | Yığın tepesi bellek adresi (`PUSH`, `POP`) | Yapılamaz |
| `SS` (Stack Segment) | `BP` (Base Pointer) | Yığın parametreleri ve yerel değişkenler | Yapılabilir (`CS:`, `DS:`, `ES:`) |
| `DS` (Data Segment) | `BX`, `SI`, `DI`, veya 8/16-bit anlık sayı | Genel veri ve değişken erişimi | Yapılabilir (`CS:`, `SS:`, `ES:`) |
| `ES` (Extra Segment) | `DI` (Destination Index) | String komutlarında hedef adres (`MOVSB`, `STOSB` vb.) | Yapılamaz (String hedefi daima ES'tir) |

### Yeniden Konumlanabilirlik (Relocatable Programs and Data)

Segmentasyon modelinin en büyük mühendislik kazanımı **yeniden konumlanabilirliktir (relocatability)**:
- Bir program içerisindeki tüm dallanmalar ve değişken erişimleri segment tabanına göre **ofset** olarak derlenir.
- Program belleğin hangi fiziksel adresine yüklenirse yüklensin, işletim sisteminin yalnızca segment yazmacını (örneğin `CS` ve `DS`) yüklenen bloğun başlangıcına ayarlaması yeterlidir. Program kodu içerisindeki tek bir adresi bile yamamaya (patching) gerek kalmadan kod sorunsuz çalışır.
- Farklı segment:ofset çiftleri aynı fiziksel adresi gösterebilir. Örneğin `1000:2000h` ($10000h + 2000h = 12000h$) ile `1200:0000h` ($12000h + 0000h = 12000h$) aynı fiziksel bayta işaret eder.

### Segment Dolanması (Segment Wrap-Around at 1 MB)

8086 mikroişlemcisinde harici adres veriyolu tam 20 pinden oluşur ($A_{19}$ ile $A_0$). 20 pin ile üretilebilecek en büyük adres $FFFFFh$'dir.

Peki segment yazmacı $FFFFh$ ve ofset yazmacı $FFFFh$ yapılırsa ne olur?
$$PA = FFFF0h + FFFFh = 10FFEFh$$
Sonuç 21-bitlik bir sayı olan $10FFEFh$'dir! Ancak 8086 işlemcisinde 21. adres biti ($A_{20}$) donanımsal olarak **mevcut değildir**. 21. bit fiziksel olarak yok sayıldığı için en soldaki $1$ biti düşer ve adres:
$$10FFEFh \pmod{100000h} = 0FFEFh$$
değerine geri döner! 

Bu olaya **Segment Dolanması (Wrap-Around)** adı verilir. Belleğin en sonundan taşan adresler otomatik olarak belleğin en başına ($00000h$) dolanır.

*(Tarihsel Not: 80286 işlemcisinde 24-bit adres yolu olduğu için bu adres 1 MB'ın üzerindeki ilk 64 KB'lık High Memory Area - HMA bölgesine erişiyordu. IBM PC uyumluluğunu korumak amacıyla klavye denetleyicisi üzerinden $A_{20}$ hattını zorla sıfıra çeken meşhur **Gate A20** donanımı eklenmiştir).*

---

## 2.7 Bellek Düzeni: Little-Endian Bayt Yerleşimi ve Çift/Tek Bellek Bankaları (Even/Odd Banks, BHE# ve A0)

8086 mikroişlemcisinin bellek mimarisinde iki temel donanımsal ilke geçerlidir:
1. Bayt sıralamasında **Little-Endian** standardı.
2. 16-bit veri veriyolunu desteklemek için belleğin **Çift (Even)** ve **Tek (Odd)** bankalara ayrılması.

### Little-Endian Bayt Depolama Standardı

x86 işlemci ailesi çok baytlı verileri belleğe yazarken **Little-Endian (Düşük Anlamlı Bayt Önce)** kuralını uygular:
- **Düşük anlamlı bayt (Least Significant Byte - LSB), düşük fiziksel bellek adresinde** saklanır.
- **Yüksek anlamlı bayt (Most Significant Byte - MSB), yüksek fiziksel bellek adresinde** saklanır.

#### 16-Bit Kelime (Word) Örneği:
`1234h` 16-bitlik onaltılık sayısını ele alalım:
- $12h$: Yüksek anlamlı bayt (MSB)
- $34h$: Düşük anlamlı bayt (LSB)
Bu kelime bellekte $0200h$ adresine yazıldığında:
```
Fiziksel Adres    Değer
0200h             34h   <-- LSB (Düşük adreste)
0201h             12h   <-- MSB (Yüksek adreste)
```

#### 32-Bit Çift Kelime (Doubleword) Örneği:
`12345678h` 32-bitlik verisi $0300h$ adresine yazıldığında:
```
Fiziksel Adres    Değer
0300h             78h   <-- En Düşük Bayt (Bits 7..0)
0301h             56h   <-- (Bits 15..8)
0302h             34h   <-- (Bits 23..16)
0303h             12h   <-- En Yüksek Bayt (Bits 31..24)
```

Big-Endian mimarilerde (örneğin eski Motorola 68000 veya ağ protokolleri) bu sıralama tam tersidir (yüksek bayt düşük adrestedir). Assembly geliştiricileri bellek dökümlerini incelerken baytların ters sıralı görünmesine dikkat etmelidir.

### 8086 Çift/Tek Bellek Bankaları (Even/Odd Banks, BHE# ve A0)

Intel 8086, 16-bitlik harici veri yoluna ($D_{15}-D_0$) sahiptir ancak bellek bayt bayt adreslenir. İşlemcinin hem tek bir baytı (8-bit) hem de bir kelimeyi (16-bit) tek bir saat çevriminde okuyup yazabilmesi için 1 MB'lık fiziksel bellek donanımsal olarak **iki adet 512 KB'lık bağımsız bankaya** ayrılmıştır:

1. **Çift Bank (Even Bank / Low Bank):**
   - Çift adreslerdeki baytları ($00000h, 00002h, 00004h, \dots, FFFFEh$) barındırır.
   - Veri veriyolunun alt 8 bitine (**$D_7 - D_0$**) bağlıdır.
   - Adres biti **$A_0 = 0$** olduğunda aktifleşir.
2. **Tek Bank (Odd Bank / High Bank):**
   - Tek adreslerdeki baytları ($00001h, 00003h, 00005h, \dots, FFFFFh$) barındırır.
   - Veri veriyolunun üst 8 bitine (**$D_{15} - D_8$**) bağlıdır.
   - İşlemcinin **$\overline{\text{BHE}}$ (Bus High Enable)** kontrol pini düşük seviyeye çekildiğinde ($\overline{\text{BHE}} = 0$) aktifleşir.

```
+===================================================================================+
|               8086 ÇİFT/TEK BELLEK BANKALARI VE VERİYOLU BAĞLANTISI                |
+===================================================================================+
|                                                                                   |
|           +-----------------------+       +-----------------------+               |
|           |       ODD BANK        |       |       EVEN BANK       |               |
|           |       (Tek Bank)      |       |       (Çift Bank)     |               |
|           |       512 KB RAM      |       |       512 KB RAM      |               |
|           +-----------------------+       +-----------------------+               |
|           | Adresler: Tek Sayılar |       | Adresler: Çift Sayılar|               |
|           | 00001h, 00003h, ...   |       | 00000h, 00002h, ...   |               |
|           +-----------------------+       +-----------------------+               |
|                       |                               |                           |
|      Seçim: BHE# = 0  |                               | Seçim: A0 = 0             |
|                       v                               v                           |
|           +-----------------------+       +-----------------------+               |
|           | Üst Veri Yolu D15-D8  |       | Alt Veri Yolu D7-D0   |               |
|           +-----------------------+       +-----------------------+               |
|                       \                               /                           |
|                        \                             /                            |
|                         +---------------------------+                             |
|                         | 8086 16-BİT VERİ VERİYOLU |                             |
|                         +---------------------------+                             |
+===================================================================================+
```

### Bellek Erişim Durumları Doğruluk Tablosu

İşlemcinin $\overline{\text{BHE}}$ ve $A_0$ pinlerinin durumuna göre belleğe nasıl eriştiği aşağıdaki tabloda gösterilmiştir:

| $\overline{\text{BHE}}$ | $A_0$ | Gerçekleşen Veri Transferi | Kullanılan Veriyolu | Gerekli Veriyolu Çevrimi |
|---|---|---|---|---|
| **0** | **0** | Çift adresten 16-bit Kelime (Word) Erişimi (Hizalı / Aligned) | $D_{15} - D_0$ (Tüm Veriyolu) | **1 Çevrim** (Hızlı!) |
| **1** | **0** | Çift adresten 8-bit Bayt (Byte) Erişimi | $D_7 - D_0$ (Alt Bank) | **1 Çevrim** |
| **0** | **1** | Tek adresten 8-bit Bayt (Byte) Erişimi | $D_{15} - D_8$ (Üst Bank) | **1 Çevrim** |
| **1** | **1** | Veriyolu Boşta (Bellek Erişimi Yok) | — | — |

### Hizalı (Aligned) vs. Hizalanmamış (Unaligned) Bellek Erişimi

Bu donanımsal bank yapısı, yazılım performansı açısından hayati bir kural doğurur:
- **Hizalı Kelime Erişimi (Aligned Word Access):** 16-bitlik bir kelime **çift bir adreste** (örneğin $0200h$) başlıyorsa, düşük baytı Even Bank'ta ($0200h$), yüksek baytı Odd Bank'tadır ($0201h$). İşlemci $A_0 = 0$ ve $\overline{\text{BHE}} = 0$ yaparak **tek bir veriyolu çevriminde** tüm kelimeyi okur veya yazar.
- **Hizalanmamış Kelime Erişimi (Unaligned Word Access):** 16-bitlik bir kelime **tek bir adreste** (örneğin $0201h$) başlıyorsa, düşük baytı Odd Bank'ta ($0201h$), yüksek baytı bir sonraki çift adrestedir ($0202h$). 8086 bu veriyi tek çevrimde okuyamaz! İşlemci otomatik olarak **iki ardışık veriyolu çevrimi** gerçekleştirmek zorunda kalır:
  1. *Çevrim 1:* Tek adresteki ($0201h$) düşük bayt $D_{15}-D_8$ üzerinden okunur ($\overline{\text{BHE}}=0, A_0=1$).
  2. *Çevrim 2:* Çift adresteki ($0202h$) yüksek bayt $D_7-D_0$ üzerinden okunur ($\overline{\text{BHE}}=1, A_0=0$).

Sonuç olarak, 8086 mimarisinde kelime verilerini çift adreslere hizalamak programın bellek erişim hızını **%100 oranında (2 kat)** artırmaktadır.

---

## 2.8 Bölüm Özeti ve Anahtar Kavramlar

Bu bölümde Intel 8086 mimarisinin donanımsal ve mantıksal temelleri incelenmiştir:
1. **BIU ve EU İşbölümü:** BIU dış veriyolları, adresleme ve komut getirme ile ilgilenirken; EU komutları çözüp 16-bit ALU ile çalıştırır.
2. **Prefetch Queue (6-bayt):** FIFO kuyruğu sayesinde komut getirme ile yürütme üstüste bindirilir (pipelining). Dallanma durumunda kuyruk boşaltılır (flush).
3. **14 Adet 16-Bit Yazmaç:** AX, BX, CX, DX genel amaçlı yazmaçları 8-bitlik parçalara ayrılabilir (AH/AL vb.). SP, BP, SI, DI işaretçi ve indekslerdir. CS, DS, SS, ES segment tabanlarını, IP ise komut ofsetini tutar.
4. **FLAGS Anatomisi:** 6 durum bayrağı (CF, PF, AF, ZF, SF, OF) ALU sonucunu bildirir. 3 kontrol bayrağı (TF, IF, DF) işlemci davranışını yönetir. CF işaretsiz elde, OF işaretli taşmadır.
5. **20-Bit Fiziksel Adres:** $PA = \text{Segment}\times 16 + \text{Offset}$ formülüyle 1 MB alan taranır. Programlar bellekte yeniden konumlandırılabilir (relocatable). $FFFFFh$ sınırından taşan adresler $00000h$'a dolanır (wrap-around).
6. **Little-Endian & Bellek Bankaları:** Düşük anlamlı bayt düşük adrese yazılır. Bellek Even ($A_0=0, D_7-D_0$) ve Odd ($\overline{\text{BHE}}=0, D_{15}-D_8$) banklarına ayrılarak hizalı kelimelerin tek çevrimde okunması sağlanır.


---

# Bölüm 3: 8086 Adresleme Modları ve Makine Kodu Formatı

## Giriş ve Öğrenme Hedefleri

Bir mikroişlemcinin komut kümesini (Instruction Set Architecture - ISA) öğrenmek ve verimli assembly dili programları geliştirmek, işlemcinin veriye nasıl eriştiğini tam olarak kavramaktan geçer. Bir işlemcinin işleyeceği verinin nerede bulunduğunu (bir yazmaçta mı, komutun içinde mi yoksa belleğin belirli bir adresinde mi) ve bu veriye hangi yöntemle ulaşılacağını belirleyen mekanizmaya **Adresleme Modu (Addressing Mode)** adı verilir.

Bu bölümde aşağıdaki temel kazanımlar elde edilecektir:
1. `MOV` komutu ekseninde veri akış yönü, kaynak ve hedef işlenen (operand) kuralları.
2. 8086 mimarisindeki **7 Temel Veri Adresleme Modu** (Register, Immediate, Direct, Register Indirect, Base-Plus-Index, Register Relative, Base Relative-Plus-Index).
3. Program bellek adresleme modları: Doğrudan (Direct Far), Bağıl (Relative Near / Relative Short) ve Dolaylı (Indirect) sıçramalar (`JMP`, `CALL`).
4. Yığın bellek adresleme mantığı (`SS:SP`, `PUSH`, `POP`).
5. Segment Geçersiz Kılma Önekleri (Segment Override Prefixes: `CS: 2Eh`, `SS: 36h`, `DS: 3Eh`, `ES: 26h`).
6. 8086 makine kodu ikili formatı: Opcode, D-biti (Direction), W-biti (Width), `MOD-REG-R/M` baytı, Displacement (Deplasman) ve Immediate alanları.
7. CISC (x86) ve RISC (ARM) mimarilerinin adresleme felsefeleri ve başarım takasları.

---

## 3.1 Veri Adresleme Modlarının Temel İlkeleri ve MOV Sözdizimi

Mikroişlemci sistemlerinde en sık kullanılan ve en esnek komut `MOV` (Move Data) komutudur. Bu komut, veri adresleme modlarının tamamını incelemek için referans teşkil eder.

### Veri Akış Yönü ve İşlenen Kuralları

8086 Assembly dilinde `MOV` komutunun genel sözdizimi şu şekildedir:

```assembly
MOV destination, source
```

Burada `destination` **hedef işlenen**, `source` ise **kaynak işlenen**dir. 

```
┌──────────────────────────────────────────────────────────┐
│                   VERİ AKIŞ YÖNÜ                         │
│                                                          │
│   MOV    destination    ,    source                      │
│            ▲                    │                        │
│            │                    │                        │
│            └────────────────────┘                        │
│             Kopyalanan Veri                              │
│             (Sağdan Sola Doğru)                          │
└──────────────────────────────────────────────────────────┘
```

> **Önemli Kural 1: Veri Akışı Sağdan Soladır.**  
> Doğal dillerde okuma yönü soldan sağa olsa da, 8086 assembly dilinde verinin akışı istisnasız **sağdan sola** (kaynaktan hedefe) doğrudur.

> **Önemli Kural 2: MOV Taşımaz, Kopyalar.**  
> `MOV` adı İngilizce "Move" kelimesinden gelse de komut veriyi taşınan yerden silmez; bir kopyasını hedefe yazar. Kaynak işlenenin içeriği işlemden sonra kesinlikle değişmez; hedef işlenenin önceki içeriği ise ezilerek yenisiyle değiştirilir.

> **Önemli Kural 3: Bayraklar (FLAGS) Etkilenmez.**  
> Veri aktarım komutları (`MOV`, `PUSH`, `POP`, `XCHG`, `LEA`, `LDS`, `LES` vb.), aritmetik ve mantık komutlarının aksine **FLAGS (Bayraklar) yazmacını değiştirmez**. Durum bayrakları (CF, ZF, SF, OF, AF, PF) önceki değerlerini muhafaza eder.

### Veri Genişliği Uyumu (Type Matching)

Kaynak ve hedef işlenenlerin veri boyutları (8-bit veya 16-bit) birebir aynı olmak zorundadır. Bir 8-bit yazmaç ile 16-bit yazmaç arasında doğrudan aktarım donanımsal olarak yapılamaz ve derleyici tarafından sentaks hatası olarak reddedilir:

```assembly
MOV AL, BL      ; Geçerli: 8-bit -> 8-bit
MOV AX, BX      ; Geçerli: 16-bit -> 16-bit
MOV AX, BL      ; GEÇERSİZ: Boyut uyuşmazlığı (16-bit hedef, 8-bit kaynak)!
MOV [BX], 5     ; BELİRSİZ: Belleğe 1 bayt mı yoksa 1 kelime mi yazılacak?
MOV BYTE PTR [BX], 5 ; Geçerli: Bellek hücresinin 1 bayt olduğu açıkça belirtildi.
MOV WORD PTR [BX], 5 ; Geçerli: Belleğe 16-bit (2 bayt) yazılacağı belirtildi.
```

---

## 3.2 7 Temel Veri Adresleme Modu (7 Data Addressing Modes)

Intel 8086 mimarisi, belleğe ve yazmaçlara erişmek için 7 farklı veri adresleme modu sunar. Bu modlar donanım karmaşıklığı, esneklik ve komut uzunluğu açısından farklılık gösterir.

```
                    ┌──────────────────────────────────────────────┐
                    │       8086 VERİ ADRESLEME MODLARI            │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
         │                   │                           │                   │
┌────────┴────────┐ ┌────────┴────────┐         ┌────────┴────────┐ ┌────────┴────────┐
│ 1. Register     │ │ 2. Immediate    │         │ 3. Direct       │ │ 4. Register     │
│    Addressing   │ │    Addressing   │         │    Addressing   │ │    Indirect     │
│ (Yazmaç Adres.) │ │ (Anlık Adres.)  │         │ (Doğrudan Adres)│ │ (Yazmaç Dolaylı)│
└─────────────────┘ └─────────────────┘         └─────────────────┘ └─────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────┴────────┐               ┌────────┴────────┐               ┌────────┴────────┐
│ 5. Base-Plus-   │               │ 6. Register     │               │ 7. Base Rel-    │
│    Index        │               │    Relative     │               │    Plus-Index   │
│ (Taban+İndeks)  │               │ (Yazmaç Bağıl)  │               │ (Taban Bağıl+İnd)│
└─────────────────┘               └─────────────────┘               └─────────────────┘
```

### 1. Register Addressing Mode (Yazmaç Adresleme Modu)

Veri, işlemcinin dahili yazmaçlarından birinden diğerine aktarılır. Bellek erişimi gerektirmediğinden komut boyutu çok küçüktür (genellikle 2 bayt) ve yürütme hızı en yüksektir (yalnızca 2 saat çevrimi).

- **Sözdizimi:** `MOV reg, reg`
- **Örnekler:**
  ```assembly
  MOV AX, BX      ; BX'in 16-bitlik içeriğini AX'e kopyalar
  MOV CL, DH      ; DH'nin 8-bitlik içeriğini CL'ye kopyalar
  MOV SI, DI      ; DI içeriğini SI'ya kopyalar
  MOV DS, AX      ; Segment yazmacına AX içeriğini aktarır
  ```

### 2. Immediate Addressing Mode (Anlık / İvedi Adresleme Modu)

İşlenecek sayısal sabit (literal), komutun kendi makine kodu baytları içerisinde saklanır. İşlemci komutu bellekten çekerken sabiti de komutla beraber alır; ayrı bir veri okuma veriyolu çevrimi yapılmasına gerek kalmaz.

- **Sözdizimi:** `MOV reg, constant` veya `MOV mem, constant`
- **Örnekler:**
  ```assembly
  MOV AL, 22h                 ; AL yazmacına anlık 22h (onaltılık) baytı yükler
  MOV AX, 1234h               ; AX yazmacına 16-bitlik 1234h kelimesini yükler
  MOV WORD PTR [BX], 0ABCDh   ; BX'in işaret ettiği bellek adresine ABCD kelimesini yazar
  ```

### 3. Direct Addressing Mode (Doğrudan Adresleme Modu)

Bellekteki verinin ofset adresi doğrudan komutun içine bir sayı sabiti veya etiket olarak yazılır. 8086 makine kodunda bu ofset adresi 16-bitlik (2 baytlık) deplasman olarak komutun arkasına Little-Endian formatında eklenir.

- **Sözdizimi:** `MOV reg, [offset]` veya `MOV [offset], reg`
- **Efektif Adres Formülü:**
  $$EA = \text{disp16}$$
- **Fiziksel Adres Formülü:**
  $$PA = (DS \times 16) + \text{disp16}$$
- **Örnekler:**
  ```assembly
  MOV CX, [1000h] ; DS:1000h adresindeki 16-bit kelimeyi CX'e okur
  MOV [2500h], AL ; AL baytını DS:2500h bellek adresine saklar
  MOV BX, LIST    ; Assembler LIST etiketinin ofsetini doğrudan komuta gömer
  ```

### 4. Register Indirect Addressing Mode (Yazmaç Dolaylı Adresleme Modu)

Verinin bulunduğu bellek hücresinin efektif ofset adresi doğrudan komutta verilmez; bir taban (Base) veya indeks (Index) yazmacında tutulur. Köşeli parantez `[...]` işaretçi mantığını gösterir.

8086 mimarisinde yazmaç dolaylı adreslemede **yalnızca 4 yazmaç** kullanılabilir:
- `BX` (Base Register) — Varsayılan Segment: `DS`
- `BP` (Base Pointer) — Varsayılan Segment: `SS`
- `SI` (Source Index) — Varsayılan Segment: `DS`
- `DI` (Destination Index) — Varsayılan Segment: `DS`

> **Kritik Kural:** `AX`, `CX`, `DX`, `SP` yazmaçları köşeli parantez içinde dolaylı bellek işaretçisi olarak **KULLANILAMAZ**. `MOV AX, [CX]` ifadesi donanımsal olarak geçersizdir!

- **Efektif Adres:**
  $$EA = [BX \mid BP \mid SI \mid DI]$$
- **Örnekler:**
  ```assembly
  MOV AX, [BX]    ; DS:BX adresindeki 16-bit kelimeyi AX'e yükler
  MOV CL, [SI]    ; DS:SI adresindeki 8-bit baytı CL'ye yükler
  MOV [DI], DX    ; DX içeriğini DS:DI adresine yazar
  MOV AL, [BP]    ; DİKKAT: BP varsayılan olarak SS ile eşleşir! (SS:BP)
  ```

### 5. Base-Plus-Index Addressing Mode (Taban Artı İndeks Adresleme Modu)

Efektif adres, bir taban yazmacı (`BX` veya `BP`) ile bir indeks yazmacının (`SI` veya `DI`) toplanmasıyla elde edilir. Bu mod, özellikle iki boyutlu dizilere, tablolara veya bir dizinin elemanlarına dinamik olarak erişmek için son derece uygundur.

- **Efektif Adres Formülü:**
  $$EA = [BX \mid BP] + [SI \mid DI]$$
- **Geçerli Kombinasyonlar:**
  1. `[BX + SI]` (Varsayılan segment: `DS`)
  2. `[BX + DI]` (Varsayılan segment: `DS`)
  3. `[BP + SI]` (Varsayılan segment: `SS`)
  4. `[BP + DI]` (Varsayılan segment: `SS`)
- **Örnekler:**
  ```assembly
  MOV AX, [BX+SI]     ; DS:(BX+SI) adresindeki kelimeyi AX'e yükler
  MOV [BX+DI], CL     ; CL içeriğini DS:(BX+DI) adresine yazar
  MOV DX, [BP+SI]     ; SS:(BP+SI) adresinden DX'e kelime yükler
  ```

### 6. Register Relative Addressing Mode (Yazmaç Bağıl Adresleme Modu)

Efektif adres, bir taban veya indeks yazmacının içeriğine sabit bir deplasman (Displacement - 8-bit veya 16-bit) eklenerek hesaplanır. Tek boyutlu dizilerde veya bir veri yapısının (struct) belirli bir alanına erişirken kullanılır.

- **Efektif Adres Formülü:**
  $$EA = [BX \mid BP \mid SI \mid DI] + \text{disp}$$
- **Sözdizimi Varyasyonları:**
  Assembler açısından aşağıdaki yazımlar birbirine tamamen denktir:
  - `MOV AX, [BX + 4]`
  - `MOV AX, [BX] + 4`
  - `MOV AX, 4[BX]`
  - `MOV AX, ARRAY[BX]` (burada `ARRAY` derleyicinin atadığı 16-bit ofsettir)
- **Örnekler:**
  ```assembly
  MOV AX, [BX+4]      ; DS:(BX+4) adresindeki kelimeyi AX'e yükler
  MOV [BP-2], CX      ; SS:(BP-2) adresine CX kelimesini yazar (yerel değişken)
  MOV DL, [SI+100h]   ; DS:(SI+100h) adresindeki baytı DL'ye çeker
  ```

### 7. Base Relative-Plus-Index Addressing Mode (Taban Bağıl Artı İndeks Adresleme)

8086 mimarisinin en gelişmiş ve en karmaşık veri adresleme modudur. Efektif adres; bir taban yazmacı (`BX` veya `BP`), bir indeks yazmacı (`SI` veya `DI`) ve sabit bir deplasmanın (Displacement) toplanmasıyla oluşturulur. Çok boyutlu matrislerde, tablo içinde tablo içeren yapılarda veya nesne/kayıt dizilerinde (array of structures) kullanılır.

- **Efektif Adres Formülü:**
  $$EA = [BX \mid BP] + [SI \mid DI] + \text{disp}$$
- **Sözdizimi Varyasyonları:**
  - `MOV AX, [BX + SI + 4]`
  - `MOV AX, [BX + 4 + SI]`
  - `MOV AX, ARRAY[BX + SI]`
  - `MOV AX, [BX][SI + 4]`
- **Örnekler:**
  ```assembly
  MOV AX, [BX+SI+10h]     ; DS:(BX + SI + 10h) adresinden AX'e kelime yükler
  MOV ARRAY[BP+DI], CL    ; SS:(BP + DI + ARRAY_OFSET) adresine CL yazar
  ```

### 7 Veri Adresleme Modu Karşılaştırma Özeti

| No | Adresleme Modu | Örnek Komut | Efektif Adres (EA) Formülü | Varsayılan Segment | Tipik Kullanım Alanı |
|:---|:---|:---|:---|:---|:---|
| **1** | **Register** | `MOV AX, BX` | Yok (Yazmaç içi) | Yok | Hızlı veri kopyalama, geçici hesaplar |
| **2** | **Immediate** | `MOV AL, 55h` | Yok (Komut baytı) | `CS` (Komut akışı) | Sabit sayı, maske veya sayaç yükleme |
| **3** | **Direct** | `MOV AX, [1234h]` | $EA = \text{disp16}$ | `DS` | Global/statik değişkenlere erişim |
| **4** | **Register Indirect** | `MOV AX, [BX]` | $EA = [BX \mid BP \mid SI \mid DI]$ | `DS` (`BP` için `SS`) | Dinamik bellek işaretçileri, dizi başı |
| **5** | **Base-Plus-Index** | `MOV AX, [BX+SI]` | $EA = [BX \mid BP] + [SI \mid DI]$ | `DS` (`BP` için `SS`) | 2B matris satır/sütun, kayıt içi indeks |
| **6** | **Register Relative** | `MOV AX, [BX+4]` | $EA = [Reg] + \text{disp}$ | `DS` (`BP` için `SS`) | Dizi elemanı `A[i]`, yerel değişken `[BP-k]` |
| **7** | **Base Relative-Plus-Index** | `MOV AX, [BX+DI+4]` | $EA = [Base] + [Index] + \text{disp}$| `DS` (`BP` için `SS`) | Çok boyutlu diziler, struct dizileri |

---

## 3.3 Program Bellek Adresleme Modları (Program Memory Addressing Modes)

Veri adresleme modları verinin nerede olduğunu belirlerken, **Program Bellek Adresleme Modları** programın yürütme akışını değiştiren dallanma (`JMP`) ve prosedür çağırma (`CALL`) komutlarının bir sonraki komutu nereden çekeceğini belirler.

```
                    ┌──────────────────────────────────────────────┐
                    │      PROGRAM BELLEK ADRESLEME MODLARI        │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────┴────────┐               ┌────────┴────────┐               ┌────────┴────────┐
│ 1. Direct Far   │               │ 2. Relative     │               │ 3. Indirect     │
│    Addressing   │               │    Addressing   │               │    Addressing   │
│ (Doğrudan Uzak) │               │ (Bağıl Yakın)   │               │ (Dolaylı)       │
└─────────────────┘               └─────────────────┘               └─────────────────┘
```

### 1. Direct Program Addressing (Doğrudan Program Adresleme - Far)

Doğrudan program adreslemede atlanacak 20-bitlik fiziksel adresin Segment ve Offset bileşenleri komutun gövdesinde açıkça kodlanır. 8086 mimarisinde bu sıçramaya **Far Jump (Uzak Sıçrama)** veya **Intersegment Jump** denir.

- Komutun ardından 4 bayt gelir: 2 bayt yeni `IP` (offset) ve 2 bayt yeni `CS` (segment).
- Yürütme sonucunda hem `CS` hem de `IP` yazmaçları güncellenir.
- **Örnek:**
  ```assembly
  JMP FAR PTR 1000h:0200h ; CS <- 1000h, IP <- 0200h yapar
  ```

### 2. Relative Program Addressing (Bağıl Program Adresleme - Near & Short)

Bağıl program adreslemede atlanacak mutlak adres komut içine yazılmaz. Bunun yerine sıradaki komutun `IP` değerine eklenecek veya çıkarılacak **işaretli bir deplasman (displacement)** değeri kodlanır. Bu sıçramalar segmenti değiştirmediği için **Intrasegment Jump (Segment İçi Sıçrama)** olarak adlandırılır.

$$\text{Hedef Adres} = \text{IP}_{\text{next}} + \text{displacement}$$

Burada $\text{IP}_{\text{next}}$, `JMP` komutunun hemen ardından gelen bir sonraki komutun bellek adresidir.

İki alt türü bulunur:
1. **Short Jump (Kısa Sıçrama):**
   - Deplasman boyutu: 1 bayt (8-bit işaretli tamsayı).
   - Atlama menzili: $-128$ ile $+127$ bayt arası.
   - Opcode: `EB` ardından 8-bit `disp8`.
2. **Near Jump (Yakın Sıçrama):**
   - Deplasman boyutu: 2 bayt (16-bit işaretli tamsayı).
   - Atlama menzili: $-32768$ ile $+32767$ bayt arası (tüm 64 KB segment içi).
   - Opcode: `E9` ardından 16-bit `disp16` (Little-Endian).

> **Neden Bağıl Adresleme Kullanılır? (Relocatable Code Prensibi)**  
> Mutlak adres kullanmak yerine `IP + disp` kullanıldığında, derlenmiş makine kodu belleğin neresine yüklenirse yüklensin sıçrama komutları kusursuz çalışır. Çünkü komutlar arasındaki göreli mesafe (`disp`) asla değişmez. Bu durum işletim sistemlerinin programları dinamik konumlara yüklemesini (Relocatable Executable) mümkün kılar.

### 3. Indirect Program Addressing (Dolaylı Program Adresleme)

Atlanacak adres doğrudan komutta yer almaz; genel amaçlı bir yazmaçta veya bir bellek hücresinde tutulur.

- **Yazmaç Dolaylı Sıçrama:**
  ```assembly
  MOV BX, OFFSET HEDEF
  JMP BX                  ; IP <- BX içeriği yüklenir (Near Indirect)
  ```
- **Bellek Dolaylı Sıçrama:**
  ```assembly
  JMP WORD PTR [BX]       ; DS:BX adresindeki kelime IP'ye aktarılır (Near Indirect)
  JMP DWORD PTR [SI]      ; DS:SI adresindeki 4 bayttan ilk kelime IP'ye,
                          ; ikinci kelime CS'ye yüklenir (Far Indirect)
  ```
Bu mod, yüksek seviyeli dillerdeki `switch-case` tablolarını, atlama tablolarını (Jump Tables) ve C dilindeki fonksiyon işaretçilerini (Function Pointers) donanımda gerçekleştirmek için kullanılır.

---

## 3.4 Yığın Bellek Adresleme Mekanizması (Stack Memory Addressing)

Program yürütülürken geçici verileri saklamak, alt yordam çağrılarında (`CALL`) dönüş adresini muhafaza etmek ve kesme (`INT`) işlemlerinde işlemci bağlamını kaydetmek için **Yığın (Stack)** belleği kullanılır.

- Yığın mimarisi **LIFO (Last-In, First-Out - Son Giren İlk Çıkar)** kuralıyla çalışır.
- Yığının taban adresi `SS` (Stack Segment) yazmacında, yığının o anki en tepe noktasının ofseti ise `SP` (Stack Pointer) yazmacında tutulur.
- Yığın **aşağı doğru (yüksek bellek adreslerinden düşük bellek adreslerine)** doğru büyür.
- Fiziksel yığın adresi:
  $$PA_{\text{stack}} = (SS \times 16) + SP$$

```
   Yüksek Adresler  ┌──────────────────────────────────┐
                    │         Yığın Tabanı             │
                    ├──────────────────────────────────┤
                    │         Önceki Veriler           │
                    ├──────────────────────────────────┤ ◄── Eski SP
     BÜYÜME         │     Yeni Eklenen Veri (Kelime)   │
      YÖNÜ          ├──────────────────────────────────┤ ◄── Yeni SP (SP = SP - 2)
       │            │         Boş Alan                 │
       ▼            │             ...                  │
   Düşük Adresler   └──────────────────────────────────┘
```

- **PUSH Komutu:** $SP \leftarrow SP - 2$ yapılır, ardından 16-bitlik kelime `[SS:SP]` adresine yazılır.
- **POP Komutu:** `[SS:SP]` adresindeki 16-bit kelime okunur, ardından $SP \leftarrow SP + 2$ yapılır.
- 8086 mimarisinde yığın işlemleri **yalnızca 16-bit kelimeler** halinde yapılır; 8-bitlik tek bir bayt yığına atılamaz (`PUSH AL` sentaks hatasıdır).

---

## 3.5 Segment Geçersiz Kılma Önekleri (Segment Override Prefixes)

8086 mikroişlemcisinde her adresleme modunun BIU tarafından otomatik olarak ilişkilendirildiği varsayılan bir segment yazmacı vardır:

| Bellek İşaretçisi | Varsayılan Segment | Açıklama |
|:---|:---|:---|
| `IP` (Instruction Pointer) | `CS` (Code Segment) | Komut getirme işlemleri |
| `SP` (Stack Pointer) / `BP` (Base Pointer) | `SS` (Stack Segment) | Yığın işlemleri ve yerel parametreler |
| `BX`, `SI`, `DI` veya Sayısal Adres `[disp]` | `DS` (Data Segment) | Genel veri okuma ve yazma |
| `DI` (Yalnızca String Komutlarında) | `ES` (Extra Segment) | String hedef baytları |

Ancak programcı, varsayılan segment kuralını geçersiz kılarak veriyi başka bir segmentten okumak veya oraya yazmak isteyebilir. Bu durumda komutun önüne **Segment Geçersiz Kılma Öneki (Segment Override Prefix)** eklenir.

Derleyici, bu komutların makine kodunun başına tam 1 baytlık özel bir önek baytı yerleştirir:

| Segment Yazmacı | Segment Override Baytı (Hex) | Örnek Komut | Makine Kodu Açıklaması |
|:---|:---:|:---|:---|
| **ES** | `26h` | `MOV AL, ES:[BX]` | `26 8A 07` (ES öneki `26h` başa gelir) |
| **CS** | `2Eh` | `MOV AX, CS:[1000h]`| `2E A1 00 10` (CS öneki `2Eh` başa gelir) |
| **SS** | `36h` | `MOV DL, SS:[SI]` | `36 8A 14` (SS öneki `36h` başa gelir) |
| **DS** | `3Eh` | `MOV CL, DS:[BP]` | `3E 8A 4E 00` (BP varsayılan SS yerine DS kullanır) |

```assembly
; Örnek Senaryo:
MOV AL, [BP]       ; Varsayılan adresleme: SS:[BP] hücresinden okur.
MOV AL, ES:[BP]    ; Override: BIU SS yerine ES tabanını kullanır (Makine kodu başında 26h vardır).
MOV CX, CS:[TABLO] ; Kod segmenti içinde saklanmış sabit tabloyu okur (CS öneki: 2Eh).
```

> **Önemli Kısıtlama:** Komut getirme (`CS:IP`), donanımsal yığın işaretçisi (`SS:SP`) ve string komutlarındaki hedef (`ES:DI`) segmentleri geçersiz kılınamaz; bu donanımsal eşleşmeler sabittir.

---

## 3.6 8086 Makine Kodu İkili Formatı (8086 Machine Code Format)

8086 komutları makine dilinde **1 bayt ile 6 bayt** arasında değişken uzunlukta kodlanır. 

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│    Bayt 1    │    Bayt 2    │    Bayt 3    │    Bayt 4    │    Bayt 5    │    Bayt 6    │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Opcode │ D │ W│ MOD│ REG│ R/M │  Disp-Low    │  Disp-High   │  Data-Low    │  Data-High   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### Bayt 1: Opcode, D-Biti ve W-Biti

İlk baytın ilk 6 biti işlem kodunu (Opcode), son 2 biti ise işlemin yönünü ve genişliğini belirler:
- **Opcode (6 bit):** Hangi işlemin yapılacağını belirtir (örn. `MOV reg/mem` için opcode `%100010`).
- **D-Biti (Direction - Yön Biti, 1 bit):**
  - $D = 1$: `REG` alanındaki yazmaç **Hedef (Destination)** işlenendir (`MOV REG, R/M`).
  - $D = 0$: `REG` alanındaki yazmaç **Kaynak (Source)** işlenendir (`MOV R/M, REG`).
- **W-Biti (Width - Genişlik Biti, 1 bit):**
  - $W = 0$: İşlem **8-bitlik Bayt (Byte)** genişliğindedir.
  - $W = 1$: İşlem **16-bitlik Kelime (Word)** genişliğindedir.

### Bayt 2: MOD, REG ve R/M Alanları

İkinci bayt, işlenenlerin adresleme modunu ve kullanılacak yazmaçları tam olarak belirler:
- **MOD (Mode - Mod Alanı, 2 bit):** Adresleme türünü ve arkadan kaç baytlık deplasman geleceğini belirler:
  - `00`: Bellek modu, deplasman **yoktur** (İstisna: $R/M = 110$ ise doğrudan 16-bit adres `disp16` gelir).
  - `01`: Bellek modu, arkadan **8-bit işaretli deplasman** (`disp8`) gelir.
  - `10`: Bellek modu, arkadan **16-bit deplasman** (`disp16`) gelir.
  - `11`: **Yazmaç modu (Register Mode)**; bellek erişimi yoktur, hem kaynak hem hedef yazmaçtır.
- **REG (Register - Yazmaç Alanı, 3 bit):** Doğrudan bir işlemci yazmacını kodlar.
- **R/M (Register/Memory Alanı, 3 bit):** MOD alanına bağlı olarak bir yazmacı ya da bellek efektif adresleme formülünü kodlar.

### REG Yazmaç Kodlama Tablosu

| 3-Bit Kod | W = 0 (8-Bit Bayt Yazmacı) | W = 1 (16-Bit Kelime Yazmacı) |
|:---:|:---:|:---:|
| `000` | `AL` | `AX` |
| `001` | `CL` | `CX` |
| `010` | `DL` | `DX` |
| `011` | `BL` | `BX` |
| `100` | `AH` | `SP` |
| `101` | `CH` | `BP` |
| `110` | `DH` | `SI` |
| `111` | `BH` | `DI` |

### MOD-REG-R/M Kod Çözümleme Tablosu

Aşağıdaki tablo, 8086 makine kodunda `MOD` ve `R/M` bitlerinin hangi efektif bellek formülüne karşılık geldiğini eksiksiz olarak listeler:

| R/M | MOD = 00 | MOD = 01 | MOD = 10 | MOD = 11 (W=0) | MOD = 11 (W=1) |
|:---:|:---|:---|:---|:---:|:---:|
| `000` | `[BX + SI]` | `[BX + SI + disp8]` | `[BX + SI + disp16]` | `AL` | `AX` |
| `001` | `[BX + DI]` | `[BX + DI + disp8]` | `[BX + DI + disp16]` | `CL` | `CX` |
| `010` | `[BP + SI]` | `[BP + SI + disp8]` | `[BP + SI + disp16]` | `DL` | `DX` |
| `011` | `[BP + DI]` | `[BP + DI + disp8]` | `[BP + DI + disp16]` | `BL` | `BX` |
| `100` | `[SI]` | `[SI + disp8]` | `[SI + disp16]` | `AH` | `SP` |
| `101` | `[DI]` | `[DI + disp8]` | `[DI + disp16]` | `CH` | `BP` |
| `110` | `[disp16]` *(Doğrudan Adres!)* | `[BP + disp8]` | `[BP + disp16]` | `DH` | `SI` |
| `111` | `[BX]` | `[BX + disp8]` | `[BX + disp16]` | `BH` | `DI` |

> **Önemli İstisna (MOD=00, R/M=110):**  
> `MOD=00` normalde deplasmansız bellek erişimini ifade ederken, $R/M = 110$ durumu `[BP]` anlamına **GELMEZ**. Bu kombinasyon donanımsal olarak **Doğrudan Adresleme (Direct Addressing - `[disp16]`)** için ayrılmıştır! Eğer `[BP]` yazılmak istenirse derleyici bunu mecburen `MOD=01, R/M=110, disp8=00h` şeklinde 3 bayt olarak kodlar.

### Örnek Makine Kodu Çözümlemesi

**Örnek 1:** `MOV AX, BX` komutunun makine kodunu oluşturalım:
1. `MOV reg, reg` temel işlem kodu: `%100010`
2. Hedef `AX` (REG alanı seçilsin), dolayısıyla $D = 1$ (Hedef REG'dedir).
3. 16-bit işlem olduğu için $W = 1$.
   - Bayt 1: `%100010 1 1` = `8Bh`
4. İki işlenen de yazmaç olduğundan $MOD = 11$.
5. `AX` yazmacının REG kodu: `000`.
6. `BX` yazmacının R/M kodu: `011`.
   - Bayt 2: `%11 000 011` = `C3h`
- **Sonuç:** `MOV AX, BX` makine kodu **`8B C3`** (veya $D=0$ seçilirse alternatif olarak `89 D8`) olur.

**Örnek 2:** `MOV [BX+SI+10h], CX` komutunun makine kodunu oluşturalım:
1. Opcode: `%100010`.
2. Kaynak `CX` bir yazmaçtır, hedef bellektir. REG alanına `CX` koyarsak $D = 0$ (Kaynak REG'dedir).
3. 16-bit işlem olduğu için $W = 1$.
   - Bayt 1: `%100010 0 1` = `89h`
4. Deplasman `10h` 8-bitlik bir sayıdır ($-128..+127$ aralığında), bu yüzden $MOD = 01$ (8-bit disp).
5. `CX` yazmacının REG kodu: `001`.
6. `[BX+SI]` kombinasyonunun R/M tablosundaki kodu: `000`.
   - Bayt 2: `%01 001 000` = `48h`
7. Bayt 3 (disp8): `10h`.
- **Sonuç:** `MOV [BX+SI+10h], CX` makine kodu **`89 48 10`** (tam 3 bayt) olur.

---

## 3.7 CISC (x86) ve RISC (ARM) Adresleme Modlarının Karşılaştırmalı Analizi

İşlemci tasarımında adresleme modlarının zenginliği ve karmaşıklığı, CISC ve RISC mimari felsefeleri arasındaki en keskin ayrım çizgilerinden biridir.

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│           CISC (Intel x86 / 8086)            │               RISC (ARM / MIPS)              │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Bellek-Bellek veya Bellek-ALU İşlemleri      │ Saf Yükle/Sakla (Load/Store) Mimarisi        │
│ Doğrudan bellekteki işlenenle toplama/çıkarma│ ALU işlemleri yalnızca yazmaçlar arasında    │
│ yapılabilir (örn: ADD AX, [BX+SI+10h]).      │ yapılır; belleğe yalnızca LDR/STR dokunur.   │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Değişken Komut Uzunluğu                      │ Sabit Komut Uzunluğu                         │
│ Komutlar 1 bayttan 15 bayta kadar değişir.   │ Tüm komutlar sabit 32-bit (4 bayt) tir.      │
│ Çözme (Decode) donanımı karmaşıktır.         │ Komut çözme son derece basit ve hızlıdır.    │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Çok Sayıda Karmaşık Adresleme Modu           │ Az Sayıda ve Sade Adresleme Modu             │
│ Taban, indeks, deplasman, segment override   │ Genellikle Taban + Ofset veya Taban + Yazmaç;│
│ gibi çok adımlı donanımsal hesaplama.        │ donanım boru hattı (pipelining) zorlanmaz.   │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Kod Boyutu (Code Density) Çok Kompakttır     │ Kod Boyutu Daha Büyüktür                     │
│ Tek bir komutla hem bellek okunur, işlem     │ Bellekten veri çekmek, ALU'da işlemek ve     │
│ yapılır ve sonuç yazılır.                    │ saklamak için en az 3 ayrı komut gerekir.    │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

Modern x86 işlemcileri (Intel Core i7/i9, AMD Ryzen), bu mimari gerilimi aşmak için hibrit bir yöntem kullanır: Programcıdan gelen zengin CISC komutları, işlemcinin komut çözme (decoder) ünitesinde donanımsal olarak küçük, basit, sabit uzunluklu **RISC benzeri mikro-operasyonlara (µops)** bölünür ve yürütme çekirdeğinde süperskalar olarak çalıştırılır.

---

## 3.8 Bölüm Özeti ve Çalışma Soruları

### Bölüm Özeti
- `MOV destination, source` komutunda veri akışı sağdan sola doğrudur, kaynak asla değişmez, bayraklar etkilenmez.
- 8086 mimarisinde 7 temel veri adresleme modu bulunur: Register, Immediate, Direct, Register Indirect, Base-Plus-Index, Register Relative, Base Relative-Plus-Index.
- Yazmaç dolaylı modda yalnızca `BX`, `BP`, `SI`, `DI` kullanılabilir. `BP` varsayılan olarak `SS` ile, diğerleri `DS` ile eşleşir.
- Program bellek adresleme: Direct Far (`ptr16:16`), Relative Near/Short (`IP + disp`), Indirect (`JMP [BX]`).
- Segment geçersiz kılma önekleri (`ES: 26h`, `CS: 2Eh`, `SS: 36h`, `DS: 3Eh`), varsayılan segment kurallarını esnetir.
- 8086 makine kodu formatı; Opcode, D (yön), W (genişlik), MOD (adresleme modu), REG (yazmaç) ve R/M (yazmaç/bellek) alanlarından meydana gelir.

### Çözümlü Çalışma Soruları

**Soru 1:**  
`DS = 2000h`, `BX = 0300h`, `SI = 0040h` ve bellekte `20340h` fiziksel adresindeki kelime `55AAh` olsun.  
`MOV AX, [BX+SI]` komutu yürütüldüğünde:  
a) Kullanılan veri adresleme modu nedir?  
b) Efektif Adres (EA) ve Fiziksel Adres (PA) nedir?  
c) İşlem sonunda AX yazmacının içeriği ne olur?

*Çözüm:*  
a) Bir taban (`BX`) ve indeks (`SI`) yazmacı toplandığından mod **Base-Plus-Index Addressing Mode (Taban Artı İndeks)** dir.  
b) $EA = BX + SI = 0300h + 0040h = 0340h$.  
Fiziksel Adres: $PA = (DS \times 16) + EA = (2000h \times 16) + 0340h = 20000h + 0340h = 20340h$.  
c) `20340h` adresindeki `55AAh` kelimesi `AX` yazmacına yüklenir. Sonuç: $AX = 55AAh$.

**Soru 2:**  
`CS = 3000h`, `IP = 0100h` iken yürütülen 2 baytlık bir `JMP SHORT ETIKET` komutunun makine kodu `EB 14` olsun.  
a) Bu komut hangi program bellek adresleme modunu kullanmaktadır?  
b) Atlama hedefinin yeni fiziksel adresi ne olacaktır?

*Çözüm:*  
a) `IP` yazmacına 8-bit işaretli deplasman eklendiği için **Relative Program Addressing (Kısa Bağıl Sıçrama)** modudur.  
b) Komut 2 bayttır. Sıradaki komutun adresi: $\text{IP}_{\text{next}} = 0100h + 2 = 0102h$.  
Makine kodundaki deplasman: $+14h$ (+20 bayt).  
Yeni $\text{IP} = \text{IP}_{\text{next}} + \text{disp8} = 0102h + 14h = 0116h$.  
Yeni Fiziksel Adres: $PA = (CS \times 16) + \text{IP} = 30000h + 0116h = 30116h$.


---

# Bölüm 4: Veri Aktarım Komutları, Yığın Mimarisi ve İşaretçiler

## Giriş ve Öğrenme Hedefleri

8086 mikroişlemcisinde verinin işlenebilmesi için öncelikle bellek, yazmaçlar ve G/Ç birimleri arasında doğru ve etkin bir biçimde aktarılması gerekir. Bu aktarım yalnızca temel kopyalama komutu olan `MOV` ile sınırlı kalmayıp; donanımsal yazmaç takası (`XCHG`), yığın bellek yönetimi (`PUSH`, `POP`, `PUSHA`, `POPA`, `PUSHF`, `POPF`), çok segmentli işaretçi yükleme (`LEA`, `LDS`, `LES`, `LFS`, `LGS`, `LSS`), boyut genişletme (`CBW`, `CWD`, `CWDE`, `CDQ`, `MOVSX`, `MOVZX`) ve bayrak aktarımı (`LAHF`, `SAHF`) komutlarını da kapsar.

Bu bölümde aşağıdaki temel konular derinlemesine ele alınacaktır:
1. `MOV` komutunun çalışma mantığı, donanımsal sınırlamaları, geçersiz işlem kombinasyonları ve yasal çözüm yolları.
2. `XCHG` komutu ile atomik veri takası ve kesintisiz (bus-locked) donanım senkronizasyonu.
3. Yığın (Stack) bellek mimarisi (LIFO), `SS:SP` çalışma dinamiği, `PUSH` ve `POP` mikro-adımları.
4. Toplu yığın saklama komutları (`PUSHA`, `POPA`, `PUSHF`, `POPF`) ve standart Yığın Çerçevesi (Stack Frame / Activation Record) inşası.
5. Efektif adres ve işaretçi komutları: `LEA` (Load Effective Address) ile `MOV OFFSET` farkı, 32-bit uzak işaretçi yükleyicileri (`LDS`, `LES`).
6. İşaretli ve işaretsiz boyut genişletme komutları (`CBW`, `CWD`, `CWDE`, `CDQ`, `MOVSX`, `MOVZX`) ve 8080 uyumluluk bayrak komutları (`LAHF`, `SAHF`).

---

## 4.1 MOV Komutunun Çalışma Kuralları, Donanımsal Sınırlamaları ve Geçersiz Kombinasyonlar

`MOV` komutu, 8086 mikroişlemcisinin en temel veri kopyalama komutudur. Ancak mikroişlemcinin dahili veriyolu mimarisi ve donanım tasarımı nedeniyle her kaynak ve hedef kombinasyonu geçerli değildir.

```assembly
MOV destination, source
```

### Donanımsal Sınırlamalar ve Yasaklar

8086 işlemcisinde aşağıdaki 4 temel işlem doğrudan `MOV` komutu ile **YAPILAMAZ**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GEÇERSİZ MOV KOMBİNASYONLARI                           │
│                                                                             │
│  1. Bellekten Belleğe Doğrudan Aktarım:       MOV [mem1], [mem2]  ❌        │
│  2. Segment Yazmacına Anlık Sabit Yükleme:    MOV DS, 1000h       ❌        │
│  3. Segment Yazmaçları Arası Aktarım:         MOV DS, ES          ❌        │
│  4. CS (Code Segment) Yazmacına Yazma:        MOV CS, AX          ❌        │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Bellekten Belleğe Doğrudan Aktarım Yasağı (`MOV mem, mem`)
İşlemcinin Bus Interface Unit (BIU) birimi tek bir makine çevriminde sistem adres veriyoluna yalnızca bir adet adres sürebilir. Eğer bellekten belleğe doğrudan transfer yapılmak istenseydi, işlemcinin önce kaynak bellek adresini okuması, veriyi dahili bir geçici saklayıcıda tutması ve ardından hedef bellek adresine yazması gerekirdi. 8086 komut seti mimarisinde bu iki adımlı işlem `MOV` komutuna dahil edilmemiştir (bellekten belleğe blok transfer için Bölüm 8'de incelenecek olan `MOVSB/MOVSW` komutları tasarlanmıştır).

- **Çözüm:** Veri önce genel amaçlı bir yazmaca (örn. `AX`) okunur, ardından hedef belleğe yazılır:
  ```assembly
  MOV AX, [KAYNAK]      ; 1. Adım: Bellekten yazmaca oku
  MOV [HEDEF], AX       ; 2. Adım: Yazmaçtan hedef belleğe yaz
  ```

#### 2. Segment Yazmacına Anlık Değer Yükleme Yasağı (`MOV SegReg, immediate`)
8086 komut kodlama formatında segment yazmaçlarına doğrudan anlık sabit (immediate literal) kabul eden bir op-code (makine kodu şablonu) donanımsal mikro-kod ROM'unda yer almaz.
- **Çözüm:** İstenen segment adresi önce genel amaçlı bir yazmaca (genellikle `AX`) yüklenir, ardından segment yazmacına aktarılır:
  ```assembly
  MOV AX, 2000h         ; Ara yazmaca anlık sabiti yükle
  MOV DS, AX            ; Segment yazmacına aktar (Geçerli!)
  ```

#### 3. Segment Yazmaçları Arasında Doğrudan Aktarım Yasağı (`MOV SegReg, SegReg`)
İki segment yazmacı arasında doğrudan veri yolu bağlantısı yoktur.
- **Çözüm:**
  ```assembly
  MOV AX, DS
  MOV ES, AX            ; AX üzerinden DS içeriği ES'ye kopyalandı
  ```
  veya yığın kullanarak:
  ```assembly
  PUSH DS
  POP ES                ; Yığın üzerinden DS içeriği ES'ye aktarıldı
  ```

#### 4. CS (Code Segment) Yazmacına Hedef Olarak Yazma Yasağı (`MOV CS, reg/mem`)
`CS` yazmacı, yürütülmekte olan kod segmentinin taban adresini belirler. Eğer programcı rastgele bir `MOV CS, AX` komutu çalıştırabilseydi, o anda `IP`'nin gösterdiği komut dizisi anında geçersiz bir kod alanına düşer ve işlemci kilitlenirdi. `CS` yazmacı yalnızca program akışını kontrollü olarak değiştiren `JMP FAR`, `CALL FAR`, `RET FAR` veya kesme (`INT`, `IRET`) komutları ile yeni bir `IP` değeriyle eşzamanlı olarak güncellenebilir.

### Geçersiz MOV Kombinasyonları ve Yasal Karşılıkları Tablosu

| Geçersiz / Yasak Kombinasyon | Hata Nedeni | Yasal Alternatif (Doğru Çözüm) |
|:---|:---|:---|
| `MOV [DI], [SI]` | Bellekten belleğe doğrudan aktarım yapılamaz | `MOV AL, [SI]` ardından `MOV [DI], AL` (veya `MOVSB`) |
| `MOV DS, 1000h` | Segment yazmacına anlık sabit atanamaz | `MOV AX, 1000h` ardından `MOV DS, AX` |
| `MOV ES, DS` | İki segment yazmacı doğrudan kopyalanamaz | `MOV AX, DS` ardından `MOV ES, AX` (veya `PUSH DS / POP ES`) |
| `MOV CS, AX` | CS yazmacı doğrudan hedef olamaz | `JMP FAR PTR HEDEF_SEG:HEDEF_OFF` |
| `MOV [BX], 20h` | Veri genişliği (Byte mı Word mü?) belirsiz | `MOV BYTE PTR [BX], 20h` veya `MOV WORD PTR [BX], 20h` |
| `MOV AL, BX` | Boyut uyuşmazlığı (8-bit hedef, 16-bit kaynak) | `MOV AL, BL` veya `MOV AX, BX` |

---

## 4.2 XCHG Komutu ve Atomik Veri Takas Mekanizması

`XCHG` (Exchange) komutu, iki işlenenin içeriğini karşılıklı olarak takas eder (swap).

```assembly
XCHG destination, source
```

```
┌──────────────────────────────────────────────────────────┐
│                   XCHG TAKAS MEKANİZMASI                 │
│                                                          │
│              ┌─────────────┐     ┌─────────────┐         │
│              │ İşlenen 1   │◄───►│ İşlenen 2   │         │
│              │ (Örn: AX)   │     │ (Örn: BX)   │         │
│              └─────────────┘     └─────────────┘         │
│                                                          │
│   Tek bir makine komutu ile ara değişken kullanmadan     │
│   donanımsal olarak karşılıklı yer değiştirme yapılır.   │
└──────────────────────────────────────────────────────────┘
```

Klasik programlamada iki değişkenin değerini takas etmek için üçüncü bir geçici değişkene (temporary variable) ihtiyaç duyulurken, `XCHG` komutu işlemci içindeki geçici latch yazmaçlarını kullanarak takası **tek bir komutta** gerçekleştirir:

```assembly
; XCHG olmadan 3 komut gerekir:
MOV DX, AX      ; DX = geçici
MOV AX, BX      ; AX = BX
MOV BX, DX      ; BX = eski AX

; XCHG ile tek komut:
XCHG AX, BX     ; AX ile BX anında takas edilir!
```

### Kurallar ve Kısıtlamalar
1. `XCHG reg, reg` (yazmaç-yazmaç) veya `XCHG reg, mem` (yazmaç-bellek) şeklinde kullanılabilir.
2. **Bellekten belleğe takas yapılamaz:** `XCHG [BX], [SI]` geçersizdir.
3. **Segment yazmaçları kullanılamaz:** `XCHG DS, AX` geçersizdir.
4. **Anlık sabit kullanılamaz:** `XCHG AX, 5` geçersizdir.
5. FLAGS yazmacını etkilemez.

### Atomik İşlem ve Veriyolu Kilidi (Bus Lock) Önemi
`XCHG` komutu bellekle bir yazmaç arasında çalıştırıldığında (`XCHG AX, [SEMAFOR]`), 8086 mikroişlemcisi bellekten okuma (Read) ve belleğe yazma (Write) adımlarını arka arkaya kesintisiz olarak icra eder. Bu işlem sırasında harici veriyoluna `LOCK#` sinyali sürülür. Böylece çok işlemcili sistemlerde veya kesmeli ortamlarda araya başka bir işlemcinin ya da DMA denetleyicisinin girmesi engellenir. Bu özellik, işletim sistemlerinde **Semafor (Semaphore)** ve **Mutex (Karşılıklı Dışlama)** kilit mekanizmalarını kurmak için hayati önem taşır.

---

## 4.3 Yığın (Stack) Bellek Mimarisi (LIFO), SS:SP Dinamiği ve PUSH / POP Komutları

Yığın belleği, mikroişlemcinin geçici verilerini, alt yordam dönüş adreslerini ve işlemci bayrak durumlarını saklamak amacıyla kullandığı dinamik bellek alanıdır.

### LIFO Çalışma Prensibi ve Yığın Büyüme Dinamiği

8086 yığın mimarisi **LIFO (Last-In, First-Out - Son Giren İlk Çıkar)** kuralını benimser. Yığına en son eklenen veri, oradan ilk çekilecek olan veridir.

Yığın mimarisinin en ayırt edici özelliği **ters yönde (aşağıya doğru)** büyümesidir:
- Yığın belleğinin başlangıç tabanı yüksek bellek adresindedir.
- Yığına her veri eklendiğinde yığın tepesi **küçük adreslere doğru** ilerler.
- Yığından veri çekildiğinde ise yığın tepesi **büyük adreslere doğru** geri çekilir.

```
Fiziksel Adres Formülü:
PA_stack = (SS * 16) + SP
```

```
   Yüksek Adresler  ┌────────────────────────────────────┐
                    │      Yığın Tabanı (Stack Base)     │
                    ├────────────────────────────────────┤
                    │   Önceden Saklanmış Kelimeler      │
                    ├────────────────────────────────────┤ ◄── SP = 0100h (Önceki Yığın Tepesi)
       BÜYÜME       │  [Yeni Veri Düşük Bayt] (SP-2)     │
       YÖNÜ         │  [Yeni Veri Yüksek Bayt] (SP-1)    │
         │          ├────────────────────────────────────┤ ◄── SP = 00FEh (Yeni Yığın Tepesi: SP-2)
         ▼          │   Kullanılmamış Boş Yığın Alanı    │
   Düşük Adresler   └────────────────────────────────────┘
```

### PUSH Komutu ve Mikro-Adımları

`PUSH source` komutu, 16-bitlik bir işleneni yığına kaydeder.

```assembly
PUSH AX         ; AX yazmacını yığına atar
PUSH DS         ; Segment yazmacını yığına atar
PUSH WORD PTR [BX] ; Bellekten okunan 16-bit kelimeyi yığına atar
```

`PUSH` komutunun işlemci seviyesindeki tam mikro-çalışma sırası şöyledir:
1. Yığın işaretçisi 2 azaltılır:
   $$SP \leftarrow SP - 2$$
2. 16-bitlik veri, yeni `SS:SP` adresine Little-Endian düzeninde (düşük bayt düşük adrese, yüksek bayt yüksek adrese) yazılır:
   $$\text{Memory}[SS:SP] \leftarrow \text{Data16}$$

> **Önemli Kural: 8-Bit PUSH Yapılamaz!**  
> 8086 yığın mimarisi kelime (16-bit word) tabanlıdır. `PUSH AL` veya `PUSH BL` gibi 8-bitlik komutlar **YOKTUR**. Bayt saklanmak isteniyorsa tüm yazmaç (`PUSH AX`) saklanmalıdır.

### POP Komutu ve Mikro-Adımları

`POP destination` komutu, yığının en tepesinde duran 16-bitlik kelimeyi çeker ve hedef işlenene aktarır.

```assembly
POP BX          ; Yığından en üstteki kelimeyi BX'e çeker
POP ES          ; Yığından kelimeyi ES segmentine çeker
POP WORD PTR [DI] ; Yığından kelimeyi belleğe çeker
```

`POP` komutunun işlemci seviyesindeki tam mikro-çalışma sırası şöyledir:
1. `SS:SP` adresindeki 16-bitlik kelime okunarak hedef işlenene yazılır:
   $$\text{Data16} \leftarrow \text{Memory}[SS:SP]$$
2. Yığın işaretçisi 2 artırılır:
   $$SP \leftarrow SP + 2$$

> **Önemli Kısıtlama: POP CS Komutu Yoktur!**  
> `POP CS` komutu donanımsal olarak yasaktır. Çünkü yığından rastgele bir segment çekilip kod segmentine yüklenmesi sistemin çökmesine yol açar. Yığından hem CS hem IP çekmek için yalnızca `RET FAR` veya `IRET` komutları kullanılır.

### PUSH ve POP ile Değer Takası (Klasik Örnek)

İki yazmacın değerini yığın kullanarak takas etmek, yığının LIFO mantığını anlamak için en temel örnektir:

```assembly
PUSH AX         ; 1. AX yığına atıldı (en altta kalacak)
PUSH BX         ; 2. BX yığına atıldı (en üstte duruyor)
POP AX          ; 3. En üstteki veri (BX'in ilk değeri) AX'e çekildi!
POP BX          ; 4. Alttaki veri (AX'in ilk değeri) BX'e çekildi!
; Sonuç: AX ile BX değerleri yer değiştirdi.
```

---

## 4.4 Toplu Yığın İşlemleri: PUSHA, POPA, PUSHF, POPF ve Yığın Çerçevesi

Alt yordamlara girerken işlemcinin tüm yazmaçlarını tek tek `PUSH` etmek yerine tek bir komutla topluca saklamak için özel komutlar geliştirilmiştir.

### PUSHA ve POPA Komutları (Toplu Genel Yazmaç Saklama)

`PUSHA` (Push All) komutu, 80186 ve sonraki x86 işlemcilerinde 8 adet genel amaçlı yazmacı belirli bir donanımsal sırada yığına kaydeder. Toplam 16 bayt yığın alanı tüketir.

`POPA` (Pop All) komutu ise bu 8 yazmacı yığından tam ters sırada geri yükler.

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│       PUSHA Yığına Atma Sırası       │       POPA Yığından Çekme Sırası     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│  1. AX                               │  1. DI                               │
│  2. CX                               │  2. SI                               │
│  3. DX                               │  3. BP                               │
│  4. BX                               │  4. [SP atlanır - SP = SP + 2]       │
│  5. Geçici SP (komut başındaki SP)   │  5. BX                               │
│  6. BP                               │  6. DX                               │
│  7. SI                               │  7. CX                               │
│  8. DI                               │  8. AX                               │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

> **POPA'daki SP Detayı:**  
> `POPA` komutu yığından `SP` değerini çekerken bunu doğrudan `SP` yazmacına yazmaz; çünkü yazsaydı yığından sonraki yazmaçları çekecek işaretçi bozulurdu. Bunun yerine yığındaki eski SP alanını 2 bayt atlayarak geçer ($SP \leftarrow SP + 2$).

### PUSHF ve POPF Komutları (Bayrak Saklama)

- **`PUSHF` (Push Flags):** 16-bitlik `FLAGS` yazmacını yığına atar ($SP \leftarrow SP - 2$).
- **`POPF` (Pop Flags):** Yığından 16-bitlik kelimeyi çekip doğrudan `FLAGS` yazmacına yükler ($SP \leftarrow SP + 2$).

Kritik kod bloklarına girmeden önce kesme bayrağını (`IF`) ve durum bayraklarını korumak için kullanılır:

```assembly
PUSHF           ; Mevcut bayrak durumunu (özellikle IF kesme durumunu) sakla
CLI             ; Kesmeleri geçici olarak kapat (kritik bölge)
; ... kritik donanım işlemleri ...
POPF            ; Bayrakları eski haline getir (IF eskiden açıksa tekrar açılır)
```

### Standart Yığın Çerçevesi (Stack Frame / Activation Record)

Yüksek seviyeli programlama dillerinde (C, C++, Pascal) bir fonksiyon çağrıldığında, fonksiyona geçirilen parametreler ve fonksiyonun yerel değişkenleri yığın üzerinde **Yığın Çerçevesi (Stack Frame)** adı verilen düzenli bir blokta tutulur.

Bu çerçevenin taban referans noktası olarak `BP` (Base Pointer) yazmacı kullanılır; çünkü `BP` varsayılan olarak `SS` segmentini adresler.

```
                ┌──────────────────────────────────────┐
   [BP + 6]     │        Parametre 2 (arg2)            │
                ├──────────────────────────────────────┤
   [BP + 4]     │        Parametre 1 (arg1)            │
                ├──────────────────────────────────────┤
   [BP + 2]     │        Dönüş Adresi (Return IP)      │
                ├──────────────────────────────────────┤ ◄── BP (Eski BP'nin saklandığı yer)
   [BP - 2]     │        Yerel Değişken 1 (var1)       │
                ├──────────────────────────────────────┤
   [BP - 4]     │        Yerel Değişken 2 (var2)       │
                ├──────────────────────────────────────┤ ◄── SP (Yığının o anki tepesi)
```

#### Standart Prosedür Giriş Kodu (Prologue):
```assembly
PUSH BP         ; 1. Çağıran fonksiyonun BP değerini yığına kaydet
MOV BP, SP      ; 2. Mevcut yığın tepesini yeni çerçeve tabanı yap
SUB SP, 4       ; 3. İki adet 16-bit yerel değişken için yığında yer aç
```

#### Prosedür İçi Erişim:
```assembly
MOV AX, [BP+4]  ; 1. parametreyi oku
MOV [BP-2], AX  ; Yerel değişken 1'e yaz
```

#### Standart Prosedür Çıkış Kodu (Epilogue):
```assembly
MOV SP, BP      ; 1. Yerel değişkenleri yığından temizle (SP'yi eski yerine getir)
POP BP          ; 2. Çağıran fonksiyonun BP değerini geri yükle
RET 4           ; 3. Dön ve çağrının yığına attığı 4 baytlık parametreleri temizle
```

---

## 4.5 Bellek İşaretçi Komutları: LEA vs MOV OFFSET, LDS, LES, LFS, LGS, LSS

Adresleme işlemlerinde bellek hücresinin içeriği değil, o hücrenin bellek adresi üzerinde işlem yapmak gerektiğinde özel işaretçi komutları kullanılır.

### LEA (Load Effective Address) Komutu

`LEA reg16, mem` komutu, hedef yazmaca belirtilen bellek işleneninin **Efektif Adresini (Offset)** hesaplayarak yükler. Bellek içeriğine dokunmaz; yalnızca işlemcinin adres toplama donanımını çalıştırır.

```assembly
LEA BX, [SI+4]      ; SI + 4 toplamını hesaplar ve doğrudan BX'e yazar
LEA AX, [BX+DI+10h] ; BX + DI + 10h efektif adresini AX'e aktarır
```

### LEA ile MOV OFFSET Karşılaştırması

Programcılar sıklıkla `LEA` ile `MOV reg, OFFSET label` komutunu birbirine karıştırır. Aralarındaki farklar şunlardır:

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│           MOV reg, OFFSET label      │            LEA reg, [mem]            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Derleme Zamanı (Compile-Time)        │ Çalışma Zamanı (Run-Time)            │
│ Assembler etiketin ofsetini derlerken│ İşlemci içindeki adres toplayıcı     │
│ hesaplar ve komutun içine sabit kor. │ formülü çalışma anında çözer.        │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Sabit Adresler İçindir               │ Dinamik İfadeleri Çözebilir          │
│ Yalnızca statik etiketlerle çalışır; │ [BX+SI+4] gibi yazmaç içeren dinamik │
│ MOV BX, OFFSET [SI+4] GEÇERSİZDİR!   │ adresleri başarıyla çözer.           │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Daha Hızlı ve Kısa Makine Kodu       │ 1 Çevrim Daha Fazla Sürebilir        │
│ Doğrudan anlık yükleme (3 bayt).     │ Karmaşık MOD-REG-R/M çözümü (3-4 bayt)│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

> **Yazılımcı İpucu: Hızlı Aritmetik İçin LEA Kullanımı**  
> `LEA`, FLAGS yazmacını değiştirmeden hızlı çarpma ve toplama yapmak için sıkça kullanılır:
> ```assembly
> LEA AX, [BX+BX]    ; AX = BX * 2 (Bayrakları etkilemeden!)
> LEA AX, [BX+SI]    ; AX = BX + SI (ADD komutunun aksine FLAGS değişmez!)
> ```

### LDS ve LES Komutları (32-Bit Uzak İşaretçi Yükleme)

8086 mimarisinde uzak bir işaretçi (Far Pointer), 16-bitlik bir Ofset ve 16-bitlik bir Segment olmak üzere toplam 4 bayttan (32 bit) oluşur. Bellekteki bu 4 baytlık işaretçiyi tek bir komutla hem genel yazmaca hem de ilgili segment yazmacına yüklemek için `LDS` ve `LES` komutları kullanılır:

```assembly
LDS reg16, mem32    ; reg16 <- [mem],  DS <- [mem+2]
LES reg16, mem32    ; reg16 <- [mem],  ES <- [mem+2]
```

```
Bellek Haritası (Little-Endian 4 Bayt):
mem + 0: [Ofset Düşük Bayt ] ──► reg16 (Düşük)
mem + 1: [Ofset Yüksek Bayt] ──► reg16 (Yüksek)
mem + 2: [Segment Düşük    ] ──► Segment Yazmacı (DS veya ES)
mem + 3: [Segment Yüksek   ] ──► Segment Yazmacı (DS veya ES)
```

```assembly
; Örnek Kullanım:
VERI_POINTER DD 10002000h ; Ofset: 2000h, Segment: 1000h
LDS SI, VERI_POINTER      ; SI <- 2000h, DS <- 1000h (Tek komutta yüklendi!)
LES DI, HEDEF_POINTER     ; DI <- Ofset, ES <- Segment
```

### İleri İşlemcilerde Eklenen İşaretçi Komutları (80386+)
- **`LFS reg, mem`:** Ofseti yazmaca, segmenti `FS` yazmacına yükler.
- **`LGS reg, mem`:** Ofseti yazmaca, segmenti `GS` yazmacına yükler.
- **`LSS reg, mem`:** Ofseti belirtilen yazmaca (genellikle `SP`), segmenti `SS` yazmacına yükler. Bu komut, yığın işaretçisini ve segmentini tek bir atomik çevrimde güncelleyerek kesme oluşması durumunda yığının bozulmasını önler.

---

## 4.6 Boyut Genişletme Komutları ve Bayrak Aktarımları

Farklı büyüklükteki işaretli ve işaretsiz sayılarla işlem yaparken veri boyutunun uyumlu hale getirilmesi gerekir.

### İşaretli Boyut Genişletme: CBW ve CWD

İşaretli (two's complement) sayılarda bir sayının değerini bozmadan boyutunu büyütmek için en anlamlı bitin (işaret biti - MSB) üst baytlara kopyalanması (**Sign Extension - İşaret Genişletme**) gerekir.

#### 1. CBW (Convert Byte to Word)
- `AL` yazmacındaki 8-bitlik işaretli sayıyı `AX` yazmacına 16-bitlik işaretli sayıya genişletir.
- Komut hiçbir operand almaz.
- Mantık: Eğer `AL`'nin en anlamlı biti (bit 7) `1` ise `AH`'yi `FFh` yapar; bit 7 `0` ise `AH`'yi `00h` yapar.
```assembly
MOV AL, +5      ; AL = 05h (0000 0101b)
CBW             ; AX = 0005h (+5 olarak kaldı)

MOV AL, -5      ; AL = FBh (1111 1011b)
CBW             ; AX = FFFBh (-5 olarak 16-bite genişledi!)
```

#### 2. CWD (Convert Word to Doubleword)
- `AX` yazmacındaki 16-bitlik işaretli sayıyı `DX:AX` çiftinde 32-bitlik işaretli sayıya genişletir.
- Özellikle 16-bitlik işaretli bölme (`IDIV`) komutundan önce `DX` yazmacını işaret bitleriyle doldurmak için zorunludur!
- Mantık: Eğer `AX`'in en anlamlı biti (bit 15) `1` ise `DX` = `FFFFh` olur; `0` ise `DX` = `0000h` olur.
```assembly
MOV AX, -100    ; AX = FF9Ch
CWD             ; DX = FFFFh, AX = FF9Ch (DX:AX = 32-bit -100)
```

#### İleri İşlemci Genişletmeleri (80386+):
- **`CWDE` (Convert Word to Doubleword Extended):** `AX` işaretini `EAX`'e (32-bit) genişletir.
- **`CDQ` (Convert Doubleword to Quadword):** `EAX` işaretini `EDX:EAX` çiftine (64-bit) genişletir.

### MOVSX ve MOVZX Komutları (80386+)

8086'da `CBW` ve `CWD` yalnızca akümülatör (`AL`, `AX`) üzerinde çalışırken, 80386 ile gelen `MOVSX` ve `MOVZX` komutları herhangi bir yazmaç veya bellek hücresini genişleterek aktarabilir:

1. **`MOVSX` (Move with Sign-Extend):**
   Kaynak işlenenin işaret bitini koruyarak hedef yazmaca kopyalar.
   ```assembly
   MOVSX CX, BL    ; BL = 80h (-128) ise CX = FF80h (-128) olur.
   ```
2. **`MOVZX` (Move with Zero-Extend):**
   İşaretsiz sayılar içindir. Hedef yazmacın üst bitlerini sıfırlarla doldurur.
   ```assembly
   MOVZX CX, BL    ; BL = 80h ise CX = 0080h (+128) olur.
   ```

### Bayrak Aktarım Komutları: LAHF ve SAHF

Intel 8086, kendisinden önceki 8-bitlik Intel 8080 işlemcisi için yazılmış programların kolayca 8086'ya taşınabilmesi amacıyla iki özel bayrak aktarım komutuna sahiptir:

- **`LAHF` (Load AH from Flags):**
  `FLAGS` yazmacının alt 8 bitinde yer alan durum bayraklarını (`SF`, `ZF`, `0`, `AF`, `0`, `PF`, `1`, `CF`) doğrudan `AH` yazmacına kopyalar.
- **`SAHF` (Store AH into Flags):**
  `AH` yazmacının içeriğini doğrudan `FLAGS` yazmacının alt baytına yazar. Matematiksel işlemci (8087 FPU) karşılaştırma sonuçlarını ana işlemcinin bayraklarına aktarırken modern derleyicilerde dahi sıkça kullanılır.

```
       ┌───┬───┬───┬───┬───┬───┬───┬───┐
AH  ◄──│SF │ZF │ 0 │AF │ 0 │PF │ 1 │CF │ ◄── FLAGS (Düşük Bayt)
       └───┴───┴───┴───┴───┴───┴───┴───┘
```

---

## 4.7 Bölüm Özeti ve Çalışma Soruları

### Bölüm Özeti
- `MOV` komutunda bellekten belleğe, segmentten segmente, anlık sayıdan segmente aktarım yapılamaz ve `CS` hedef olamaz.
- `XCHG` ara değişken kullanmadan iki işleneni takas eder; bellek ile yapıldığında donanımsal `LOCK#` sinyaliyle atomik çalışır.
- Yığın (Stack) mimarisi LIFO prensibiyle aşağıya (düşük adreslere) doğru büyür. $PA_{\text{stack}} = (SS \times 16) + SP$.
- `PUSH` önce $SP = SP - 2$ yapar, sonra kelimeyi yazar. `POP` önce kelimeyi okur, sonra $SP = SP + 2$ yapar.
- `PUSHA` ve `POPA` 8 genel yazmacı topluca yığına atar ve geri çeker. `PUSHF` ve `POPF` bayrakları korur.
- Yığın çerçevesinde yerel değişkenler `[BP - k]`, parametreler `[BP + k]` ofsetleriyle adreslenir.
- `LEA` dinamik efektif adresi hesaplar (FLAGS değişmez); `MOV OFFSET` derleme zamanı statik etiketidir. `LDS`/`LES` 32-bit uzak işaretçi yükler.
- `CBW` (AL $\to$ AX) ve `CWD` (AX $\to$ DX:AX) işaretli genişletme yapar; `LAHF`/`SAHF` bayrakların AH ile transferini sağlar.

### Çözümlü Çalışma Soruları

**Soru 1:**  
Aşağıdaki 8086 assembly komut satırlarının her birinin geçerli (Legal) mi yoksa geçersiz (Illegal) mi olduğunu belirleyiniz. Geçersiz olanların nedenini açıklayınız:  
a) `MOV DS, 3000h`  
b) `MOV ES, AX`  
c) `PUSH BL`  
d) `XCHG [BX], [SI]`  
e) `LEA BX, [SI+4]`

*Çözüm:*  
a) **Geçersiz (Illegal):** Segment yazmaçlarına doğrudan anlık sabit (immediate) atanamaz. Önce `MOV AX, 3000h` ardından `MOV DS, AX` yapılmalıdır.  
b) **Geçerli (Legal):** Genel amaçlı bir yazmaçtan segment yazmacına kelime aktarımı tamamen yasaldır.  
c) **Geçersiz (Illegal):** 8086 yığın mimarisi 16-bit kelime tabanlıdır; 8-bitlik yazmaçlar tek başına PUSH edilemez. `PUSH BX` yapılmalıdır.  
d) **Geçersiz (Illegal):** İşlemci tek bir çevrimde iki farklı bellek hücresine erişemez. En az bir işlenen yazmaç olmalıdır (`XCHG AX, [BX]`).  
e) **Geçerli (Legal):** `LEA` komutu donanımsal adres toplayıcıyı kullanarak `SI + 4` efektif adresini `BX` yazmacına yükler.

**Soru 2:**  
`SS = 5000h`, `SP = 0200h`, `AX = 1234h`, `BX = 0ABCDh` iken aşağıdaki komut dizisi çalıştırılıyor:
```assembly
PUSH AX
PUSH BX
POP CX
```
Komut dizisi tamamlandıktan sonra:  
a) Son durumda `SP` yazmacının değeri ne olur?  
b) `CX` yazmacının değeri ne olur?  
c) `PUSH AX` komutunun ardından yığına yazılan verinin 20-bitlik fiziksel adresi nedir?

*Çözüm:*  
a) `PUSH AX` ile $SP = 0200h - 2 = 01FEh$.  
`PUSH BX` ile $SP = 01FEh - 2 = 01FCh$.  
`POP CX` ile $SP = 01FCh + 2 = 01FEh$.  
Sonuç: $SP = 01FEh$.  
b) Yığına en son `BX` ($0ABCDh$) atılmıştı. LIFO kuralı gereğince `POP CX` komutu yığının en üstündeki veriyi çeker. Dolayısıyla $CX = 0ABCDh$ olur.  
c) `PUSH AX` komutu yürütüldüğünde $SP = 01FEh$ idi.  
Fiziksel Adres: $PA = (SS \times 16) + SP = (5000h \times 16) + 01FEh = 50000h + 01FEh = 501FEh$.
Little-Endian kuralına göre: `501FEh` adresine `34h`, `501FFh` adresine `12h` yazılır.


---

# Bölüm 5: Aritmetik Komutlar, BCD/ASCII Aritmetiği ve Bayrak Hassasiyeti (Arithmetic Instructions, BCD/ASCII Arithmetic & Flag Sensitivity)

8086 mikroişlemcisinin Aritmetik Mantık Birimi (ALU - Arithmetic Logic Unit), ikili (binary), paketlenmiş/paketlenmemiş BCD (Binary Coded Decimal) ve ASCII formatındaki veriler üzerinde temel ve gelişmiş matematiksel hesaplamaları doğrudan donanımsal düzeyde yürütür. Bu bölümde; temel toplama ve çıkarma komutları, bayrak kütüğünün (FLAGS Register) aritmetik duyarlılığı, işaretli taşma kuralının ($OF = C_{in} \oplus C_{out}$) matematiksel temelleri, karşılaştırma mantığı, donanımsal çarpma ve bölme mekanizmaları, sıfıra bölme ve taşma istisnaları (Type 0 Interrupt), BCD düzeltme komutları (DAA, DAS), ASCII aritmetiği (AAA, AAS, AAM, AAD) ve çok kelimeli (Multi-Precision) hesaplama algoritmaları kuramsal ve uygulamalı olarak incelenmektedir.

---

## 5.1 Temel Toplama ve Çıkarma: ADD, ADC, INC, SUB, SBB, DEC, NEG Komutları

8086 işlemcisinde toplama ve çıkarma komutları bayt (8-bit) veya kelime (16-bit) genişliğindeki işlenenler üzerinde yürütülür. Modern x86 işlemcilerinde bu komutlar çift kelime (32-bit EAX) ve dörtlü kelime (64-bit RAX) genişliklerine kadar genişletilmiştir.

### ADD ve ADC (Toplama ve Eldeli Toplama)

`ADD` (Addition) komutu, kaynak işlenen ile hedef işleneni ikili tabanda toplar ve sonucu hedef işlenene yazar:

$$\text{Hedef} \leftarrow \text{Hedef} + \text{Kaynak}$$

Desteklenen işlenen kombinasyonları:
- `ADD reg, reg` (Örn: `ADD AL, BL`, `ADD AX, BX`)
- `ADD reg, mem` (Örn: `ADD DX, [SI]`)
- `ADD mem, reg` (Örn: `ADD [BX], CL`)
- `ADD reg, imm` (Örn: `ADD CL, 44H`)
- `ADD mem, imm` (Örn: `ADD WORD PTR [DI], 1000H`)

> **Donanım Kuralı:** 8086 mimarisinde hiçbir aritmetik komut doğrudan bellekten belleğe (`mem, mem`) işlem yapamaz. Bellekteki iki sayıyı toplamak için değerlerden biri önce bir yazmaca yüklenmelidir.

`ADC` (Add with Carry) komutu, iki işlenenin toplamına ek olarak **Elde Bayrağını (CF - Carry Flag)** da sonuca dahil eder:

$$\text{Hedef} \leftarrow \text{Hedef} + \text{Kaynak} + CF$$

Eğer komut yürütülmeden önce $CF = 1$ ise toplama 1 eklenir; $CF = 0$ ise standart toplama gibi davranır. `ADC`, işlemcinin doğal yazmaç genişliğini (16-bit) aşan 32-bit, 64-bit veya keyfi uzunluktaki çok kelimeli (Multi-Precision) sayıların toplanmasında bir önceki basamaktan gelen eldeyi taşımak için zorunludur.

### INC (Bir Artırma)

`INC` (Increment) komutu, belirtilen yazmaç veya bellek içeriğine 1 ekler:

$$\text{Hedef} \leftarrow \text{Hedef} + 1$$

`INC` komutunun makine kodu tek baytlık kısa forma (`INC reg16` opcode `40h`–`47h`) sahip olduğundan `ADD reg, 1` komutuna göre hem bellek tasarrufu sağlar hem de döngüler için optimize edilmiştir.

```asm
INC BL              ; 8-bit yazmaç artırma
INC AX              ; 16-bit yazmaç artırma
INC BYTE PTR [BX]   ; Bellekteki baytı artırma
INC DATA1           ; Tanımlı bellek değişkenini artırma
```

> **Kritik Mimari Kural:** `INC` ve `DEC` komutları **Elde Bayrağını (CF - Carry Flag) ASLA ETKİLEMEZ!** ZF, SF, OF, AF ve PF bayrakları güncellenirken CF önceki durumunu korur. Bu mimari karar bilinçli olarak alınmıştır: Çok kelimeli toplama/çıkarma döngülerinde sayaçları artırırken veya bellek işaretçilerini ilerletirken (`INC SI`), basamaklar arasındaki CF elde zincirinin bozulması engellenir.

### SUB ve SBB (Çıkarma ve Borçlu Çıkarma)

`SUB` (Subtract) komutu, hedef işlenenden kaynak işleneni çıkarır ve farkı hedefe yazar:

$$\text{Hedef} \leftarrow \text{Hedef} - \text{Kaynak}$$

`SBB` (Subtract with Borrow) komutu ise hedeften hem kaynak işleneni hem de önceki işlemden kalan borcu (CF) çıkarır:

$$\text{Hedef} \leftarrow \text{Hedef} - \text{Kaynak} - CF$$

`SBB`, çok kelimeli çıkarma algoritmalarında yüksek anlamlı kelimelerden borç düşülmesini sağlar:

```asm
; 32-Bit Çıkarma: DX:AX - SI:DI -> DX:AX
SUB AX, DI      ; Düşük 16 bit çıkarılır, gerekirse CF (borç) set edilir
SBB DX, SI      ; Yüksek 16 bit çıkarılır ve CF borcu düşülür
```

### DEC (Bir Azaltma)

`DEC` (Decrement) komutu işlenenden 1 çıkarır:

$$\text{Hedef} \leftarrow \text{Hedef} - 1$$

Tıpkı `INC` gibi, `DEC` komutu da döngü sayaçlarında elde zincirini korumak için **CF bayrağını değiştirmez**.

### NEG (İkiye Tümleyen Alma / Negatifini Alma)

`NEG` (Negate) komutu, işlenenin işaretini tersine çevirerek ikiye tümleyenini (Two's Complement) hesaplar:

$$\text{Hedef} \leftarrow 0 - \text{Hedef} = (\overline{\text{Hedef}}) + 1$$

`NEG` komutunun bayraklar üzerindeki etkisi şöyledir:
- İşlenen $0$ ise $CF = 0$ olur.
- İşlenen $0$'dan farklı herhangi bir değer ise $CF = 1$ olur (çünkü 0'dan pozitif bir sayı çıkarıldığında borçlanma gerçekleşir).
- 8-bitlik `-128` (`80H`) veya 16-bitlik `-32768` (`8000H`) değerine `NEG` uygulandığında, elde edilen sayı pozitif aralığa sığmadığından **Taşma Bayrağı (OF - Overflow Flag) 1 olur** ve işlenen değişmeden kalır.

---

## 5.2 Aritmetik Durum Bayraklarının Mekaniği (CF, OF, SF, ZF, AF, PF) ve Taşma (Overflow) Kuralı

8086 işlemcisinde her aritmetik işlem sonrasında ALU, sonucun niteliklerini 16-bitlik `FLAGS` yazmacındaki 6 durum bayrağına yansıtır:

| Bayrak | Kısaltma | Adı | Set Edilme Şartı ($= 1$) | Sıfırlanma Şartı ($= 0$) |
|:---:|:---:|:---|:---|:---|
| Bit 0 | **CF** | Carry Flag (Elde Bayrağı) | En yüksek anlamlı bitten (MSB) elde veya borç çıktığında | Elde veya borç oluşmadığında |
| Bit 2 | **PF** | Parity Flag (Parite Bayrağı) | Sonucun en düşük 8 bitindeki 1'lerin sayısı çift (even) ise | 1'lerin sayısı tek (odd) ise |
| Bit 4 | **AF** | Auxiliary Carry (Yardımcı Elde) | Bit 3'ten Bit 4'e (düşük nipelden yüksek nipele) elde/borç geçtiğinde | Nipel arası geçiş olmadığında |
| Bit 6 | **ZF** | Zero Flag (Sıfır Bayrağı) | Aritmetik işlemin matematiksel sonucu tam $0$ ise | Sonuç sıfırdan farklı ise |
| Bit 7 | **SF** | Sign Flag (İşaret Bayrağı) | Sonucun en yüksek anlamlı biti $MSB = 1$ ise (negatif sayı) | $MSB = 0$ ise (pozitif sayı) |
| Bit 11 | **OF** | Overflow Flag (Taşma Bayrağı) | İşaretli ikiye tümleyen aritmetik sınırları aşıldığında | Sonuç geçerli işaretli aralıkta ise |

### İşaretsiz vs. İşaretli Taşma Ayrımı (CF vs. OF)

Mikroişlemci donanımı, toplanan veya çıkarılan bitlerin işaretli mi yoksa işaretsiz mi olduğunu bilemez. ALU işlemi salt ikili (binary) olarak yapar ve iki farklı bayrağı aynı anda günceller:
1. **İşaretsiz Aritmetik Gözetimi (CF):** Veri işaretsiz kabul edilir. 8-bitte $0 \dots 255$, 16-bitte $0 \dots 65535$ aralığı taşarsa $CF = 1$ olur.
2. **İşaretli Aritmetik Gözetimi (OF):** Veri işaretli kabul edilir. 8-bitte $-128 \dots +127$, 16-bitte $-32768 \dots +32767$ aralığı aşılırsa $OF = 1$ olur.

### İşaretli Taşma Algılama Formülü (Signed Overflow Detection Formula)

Donanımsal düzeyde taşma bayrağı, en yüksek anlamlı bite (MSB) giren elde ($C_{in}$) ile bu bitten çıkan eldenin ($C_{out}$) dışlamalı veya (XOR) işlemine tabi tutulmasıyla belirlenir:

$$OF = C_{in} \oplus C_{out}$$

$$\text{Taşma Kuralı: } OF = \text{Carry into MSB} \oplus \text{Carry out of MSB}$$

- Eğer MSB'ye bir elde girmiş ($C_{in}=1$) fakat dışarı elde çıkmamışsa ($C_{out}=0$), $OF = 1 \oplus 0 = 1$ olur (Taşma var).
- Eğer MSB'ye elde girmemiş ($C_{in}=0$) fakat dışarı elde çıkmışsa ($C_{out}=1$), $OF = 0 \oplus 1 = 1$ olur (Taşma var).
- $C_{in}$ ve $C_{out}$ birbirine eşit olduğunda ($0 \oplus 0 = 0$ veya $1 \oplus 1 = 0$) taşma oluşmaz ($OF = 0$).

Programlama mantığı açısından işaretli taşma şu iki durumda kesinlikle gerçekleşir:
1. İki pozitif sayı toplanıp sonuç **negatif** çıkarsa ($+A + +B = -C$).
2. İki negatif sayı toplanıp sonuç **pozitif** çıkarsa ($-A + -B = +C$).

### Adım Adım Bayrak Analizi Örnekleri

#### Örnek 1: Taşmasız Pozitif Toplama
```asm
MOV DL, 12H      ; 0001 0010b (+18)
ADD DL, 33H      ; 0011 0011b (+51)
; Sonuç: 45H     ; 0100 0101b (+69)
```
- **Z (Zero Flag) = 0:** Sonuç $45H \neq 0$.
- **C (Carry Flag) = 0:** Bit 7'den dışarı elde çıkmadı ($C_{out}=0$).
- **A (Auxiliary Carry) = 0:** Bit 3'ten Bit 4'e nipel geçişi olmadı ($2H + 3H = 5H \le 9$).
- **S (Sign Flag) = 0:** MSB biti 0'dır (sonuç pozitif).
- **P (Parity Flag) = 0:** $45H = 01000101b$ içinde 3 adet '1' vardır (tek parite / odd).
- **O (Overflow Flag) = 0:** Pozitif ile pozitif toplandı, sonuç pozitif ($C_{in}=0, C_{out}=0 \to 0 \oplus 0 = 0$).

#### Örnek 2: Borçlanmalı Çıkarma (Borrow Subtraction)
```asm
MOV CH, 22H      ; 0010 0010b (34)
SUB CH, 44H      ; 0100 0100b (68)
; 22H - 44H = DEH ; 1101 1110b (-34 işaretli, 222 işaretsiz)
```
- **Z = 0:** Sonuç $DEH \neq 0$.
- **C = 1:** $22H < 44H$ olduğundan borç alındı (işaretsiz borçlanma).
- **A = 1:** Düşük nipelde $2H - 4H$ borçlanma gerektirdi.
- **S = 1:** MSB biti 1'dir (sonuç negatif).
- **P = 1:** $DEH = 11011110b$ içinde 6 adet '1' vardır (çift parite / even).
- **O = 0:** $+34 - (+68) = -34$. Sayı $-128 \dots +127$ sınırları içerisindedir, taşma yoktur.

#### Örnek 3: İşaretli Taşma (Signed Overflow)
```asm
MOV AL, 7FH      ; 0111 1111b (+127 ondalık, 8-bit azami pozitif)
ADD AL, 01H      ; 0000 0001b (+1)
; Sonuç: 80H     ; 1000 0000b (-128 ikiye tümleyen)
```
- **CF = 0:** 8-bit işaretsiz toplam $128 \le 255$, elde yok.
- **OF = 1:** İki pozitif sayı toplandı ($+127 + 1 = +128$), fakat $+128$ değeri 8-bit işaretli alana sığmadığından işaret biti ters dönerek negatif $(-128)$ oldu! $C_{in}=1, C_{out}=0 \implies OF = 1 \oplus 0 = 1$.
- **SF = 1, ZF = 0, AF = 1, PF = 0.**

---

## 5.3 Karşılaştırma Mekanizması: CMP Komutu ve İşaretli/İşaretsiz Karşılaştırma Mantığı

`CMP` (Compare) komutu iki işleneni karşılaştırmak için kullanılır:

$$\text{CMP Hedef, Kaynak}$$

`CMP`, arka planda `SUB` komutu ile tamamen aynı şekilde çıkarma işlemi yürütür:

$$\text{Geçici Değer} \leftarrow \text{Hedef} - \text{Kaynak}$$

> **En Kritik Özellik:** `CMP` komutu hedef işlenenin içeriğini **ASLA DEĞİŞTİRMEZ**. Çıkarma sonucunu çöpe atar, yalnızca ve yalnızca durum bayraklarını (`FLAGS: CF, ZF, SF, OF, AF, PF`) günceller.

Bu mekanizma, programcının veriyi bozmadan koşullu sıçrama (Conditional Jump - `Jcc`) komutları ile dallanma yapmasını sağlar.

```asm
CMP AL, 10H     ; AL ile 10H karşılaştırılır (AL - 10H hesaplanır)
JAE BUYUK_ESIT  ; Eğer AL >= 10H ise BUYUK_ESIT etiketine atla
MOV BL, 0       ; AL < 10H ise burası yürütülür
BUYUK_ESIT:
```

### İşaretsiz Karşılaştırma Mantığı (Unsigned: Above / Below)

İşaretsiz sayılarda büyüklük ilişkisi yalnızca **CF** ve **ZF** bayrakları üzerinden yorumlanır:
- **Eşitlik ($\text{Hedef} = \text{Kaynak}$):** Fark sıfırdır $\implies \mathbf{ZF = 1, CF = 0}$.
- **Büyük ($\text{Hedef} > \text{Kaynak}$):** Borçlanma olmaz ve sonuç sıfır değildir $\implies \mathbf{CF = 0 \land ZF = 0}$ (`JA` / `JNBE`).
- **Küçük ($\text{Hedef} < \text{Kaynak}$):** Borçlanma zorunludur $\implies \mathbf{CF = 1}$ (`JB` / `JNAE`).
- **Büyük veya Eşit ($\text{Hedef} \ge \text{Kaynak}$):** Borçlanma yoktur $\implies \mathbf{CF = 0}$ (`JAE` / `JNB`).
- **Küçük veya Eşit ($\text{Hedef} \le \text{Kaynak}$):** $\mathbf{CF = 1 \lor ZF = 1}$ (`JBE` / `JNA`).

### İşaretli Karşılaştırma Mantığı (Signed: Greater / Less)

İşaretli ikiye tümleyen sayılarda çıkarma sonucu taşma meydana gelebileceğinden, büyüklük tespiti **SF** ve **OF** bayraklarının mantıksal bağıntısına dayanır:
- **Küçük ($\text{Hedef} < \text{Kaynak}$):** Taşma yokken sonuç negatifse ($SF=1, OF=0$) veya taşma varken sonuç pozitifse ($SF=0, OF=1$), hedef kaynaktan küçüktür $\implies \mathbf{SF \neq OF}$ (`JL` / `JNGE`).
- **Büyük veya Eşit ($\text{Hedef} \ge \text{Kaynak}$):** $\mathbf{SF = OF}$ (`JGE` / `JNL`).
- **Büyük ($\text{Hedef} > \text{Kaynak}$):** $\mathbf{ZF = 0 \land SF = OF}$ (`JG` / `JNLE`).
- **Küçük veya Eşit ($\text{Hedef} \le \text{Kaynak}$):** $\mathbf{ZF = 1 \lor SF \neq OF}$ (`JLE` / `JNG`).

---

## 5.4 Çarpma İşlemleri: İşaretsiz (MUL) ve İşaretli (IMUL) Çarpma Kuralları, DX:AX Sonuç Yazmaçları

İki $N$-bitlik sayının çarpımı $2N$ bitlik bir alana ihtiyaç duyar. Bu nedenle 8086 mikroişlemcisinde çarpma komutları sonuçları çift genişlikteki yazmaç kombinasyonlarında toplar.

Çarpma komutlarında ilk işlenen (multiplicand) örtük olarak (implicit) daima akümülatör yazmacında (`AL` veya `AX`) bulunur. Komutta yalnızca ikinci işlenen (çarpan / multiplier) belirtilir:

### 8-Bit Çarpma: $AX \leftarrow AL \times \text{src8}$
- Çarpılan: `AL` (8-bit)
- Çarpan: Herhangi bir 8-bit yazmaç (`BL, CL, DL, AH...`) veya 8-bit bellek hücresi (`BYTE PTR [SI]`). Anlık sabit değer (immediate) 8086'da doğrudan verilemez.
- Çarpım Sonucu: 16-bitlik tam sonuç **`AX` yazmacına** yazılır (`AH` yüksek bayt, `AL` düşük bayt).

```asm
MOV BL, 5       ; Çarpan BL = 5
MOV AL, 10      ; Çarpılan AL = 10
MUL BL          ; AX = AL * BL = 50 (0032H). AH = 00H, AL = 32H
```

### 16-Bit Çarpma: $DX:AX \leftarrow AX \times \text{src16}$
- Çarpılan: `AX` (16-bit)
- Çarpan: Herhangi bir 16-bit yazmaç (`BX, CX, DX, SI, DI, BP`) veya 16-bit bellek hücresi (`WORD PTR [BX]`).
- Çarpım Sonucu: 32-bitlik tam sonuç **`DX:AX` yazmaç çiftine** yazılır.
  - **`DX`:** Çarpımın en yüksek anlamlı 16 biti (High 16 bits).
  - **`AX`:** Çarpımın en düşük anlamlı 16 biti (Low 16 bits).

```asm
MOV AX, 1000H
MOV BX, 2000H
MUL BX          ; DX:AX = 1000H * 2000H = 02000000H -> DX = 0200H, AX = 0000H
```

### 32-Bit Çarpma (80386+ Genişlemesi)
Modern 32-bit işlemcilerde:
$$EDX:EAX \leftarrow EAX \times \text{src32}$$

### Çarpma Komutlarında Bayrak Hassasiyeti (CF ve OF)

Çarpma işlemi sonrasında ALU bayraklarından **yalnızca CF ve OF anlamlıdır**; ZF, SF, AF ve PF bayraklarının durumu tanımsızdır (unpredictable).
- **MUL (İşaretsiz Çarpma):** Eğer çarpım sonucunun yüksek yarısı sıfırdan farklı bir değer içeriyorsa (yani 8-bitte $AH \neq 0$ veya 16-bitte $DX \neq 0$), **$CF = OF = 1$** olur. Bu durum, sonucun tek bir yazmaca sığmadığını ve çift yazmaç gerektirdiğini gösterir. Yüksek yarı $0$ ise $CF = OF = 0$ olur.
- **IMUL (İşaretli Çarpma):** Eğer çarpım sonucunun yüksek yarısı, düşük yarısının saf bir işaret uzatması (sign extension) değilse **$CF = OF = 1$** olur. Eğer yüksek yarı tamamen düşük yarının işaretini taşıyorsa ek anlamlı bilgi içermez ve $CF = OF = 0$ olur.

```asm
; IMUL Örneği:
MOV AL, -5      ; AL = FBH
MOV BL, 4       ; BL = 04H
IMUL BL         ; AX = -20 = FFECh. AH = FFh (AL'nin işaret uzatması), CF=OF=0
```

---

## 5.5 Bölme İşlemleri: İşaretsiz (DIV) ve İşaretli (IDIV) Bölme Kuralları, Bölüm/Kalan Yerleşimi ve Type 0 Taşma Kesmesi

Bölme işlemi, çarpmanın tam tersine $2N$ bitlik bir bölüneni $N$ bitlik bir bölene bölerek $N$ bitlik bölüm ve $N$ bitlik kalan üretir.

### 8-Bit Bölme (16-Bit / 8-Bit)
- Bölünen (Dividend): **`AX`** (16-bit)
- Bölen (Divisor): 8-bit yazmaç veya bellek hücresi (`src8`)
- **Bölüm (Quotient):** **`AL`** yazmacına yerleşir ($AL = \lfloor AX / \text{src8} \rfloor$).
- **Kalan (Remainder):** **`AH`** yazmacına yerleşir ($AH = AX \pmod{\text{src8}}$).

```asm
; Örnek: 100 / 10 = 10 (Kalan 0)
MOV AX, 64H     ; AX = 100 (ondalık)
MOV BL, 0AH     ; BL = 10
DIV BL          ; AL = 10 (0AH), AH = 0 (kalan)
```

### 16-Bit Bölme (32-Bit / 16-Bit)
- Bölünen (Dividend): **`DX:AX`** (32-bit, yüksek yarı `DX`, düşük yarı `AX`)
- Bölen (Divisor): 16-bit yazmaç veya bellek hücresi (`src16`)
- **Bölüm (Quotient):** **`AX`** yazmacına yerleşir.
- **Kalan (Remainder):** **`DX`** yazmacına yerleşir.

```asm
MOV DX, 0       ; İşaretsiz bölmede yüksek yarı sıfırlanmalıdır
MOV AX, 5000H
MOV CX, 100H
DIV CX          ; AX = 50H (bölüm), DX = 0H (kalan)
```

### Bölüneni Hazırlama Kuralları: Sıfır ve İşaret Uzatma (CBW, CWD)

Programcı bölme yapmadan önce bölünen yazmaç çiftini mutlaka doğru biçimde hazırlamak zorundadır:
1. **İşaretsiz Bölmede (DIV):**
   - 8-bitlik bölme için: `AH` sıfırlanmalıdır (`MOV AH, 0`).
   - 16-bitlik bölme için: `DX` sıfırlanmalıdır (`MOV DX, 0` veya `XOR DX, DX`).
2. **İşaretli Bölmede (IDIV):**
   - 8-bitlik bölme için: `AL` yazmacındaki işaretli değer `AX`'e genişletilmelidir: **`CBW`** (Convert Byte to Word).
   - 16-bitlik bölme için: `AX` yazmacındaki işaretli değer `DX:AX`'e genişletilmelidir: **`CWD`** (Convert Word to Doubleword).

```asm
; İşaretli 16-Bit Bölme Örneği: -100 / 9
MOV AX, -100    ; AX = FF9Ch
CWD             ; DX:AX = FFFFFFFF FF9Ch (DX işaret uzatması ile FFFFh oldu)
MOV CX, 9
IDIV CX         ; AX = -11 (FFF5h), DX = -1 (FFFFh, kalan)
```

> **İşaret Kuralı:** İşaretli bölmede (IDIV) kalanın işareti daima **bölünenin (dividend) işareti ile aynıdır**.

### Bölme Hataları ve Type 0 Taşma Kesmesi (Divide by Zero & Divide Overflow)

Bölme komutları sonrasında tüm durum bayrakları (`FLAGS`) tanımsızdır. Ancak bölme işlemine özgü iki kritik donanımsal hata senaryosu mevcuttur:

1. **Sıfıra Bölme Hatası (Divide by Zero):** Bölen işlenen $0$ olduğunda matematiksel olarak tanımsızlık oluşur.
2. **Bölme Taşması Hatası (Divide Overflow):** Bölme sonucunda ortaya çıkan bölüm (quotient), hedef yazmacın alabileceği azami kapasiteyi aştığında oluşur.
   - *Örnek:* 8-bitlik işaretsiz bölmede $AX = 3000$ ve bölen $BL = 2$ olsun. Matematiksel bölüm $3000 / 2 = 1500$'dür. Oysa bölümün yazılacağı `AL` yazmacı en fazla $255$ değerini alabilir. $1500 > 255$ olduğundan bölüm `AL`'ye sığamaz ve **Bölme Taşması (Divide Overflow)** gerçekleşir.

```
       Bölme Hatası Tetiklenme Mekanizması
  +-------------------------------------------+
  | Bölme İşlemi (DIV veya IDIV) Yürütülür    |
  +-------------------------------------------+
                       |
         +-------------+-------------+
         |                           |
  [Bölen == 0?]             [Bölüm Sığmıyor mu?]
  (Divide by Zero)          (Divide Overflow)
         |                           |
         +-------------+-------------+
                       | EVET
                       v
  +-------------------------------------------+
  | Donanımsal Kesme: Intel Tip 0 (Type 0)    |
  | IVT Adresi: 00000h - 00003h Çekilir       |
  | "Divide Error" / "Divide Overflow" Basılır|
  | Program Zorla Sonlandırılır (Halt/Crash)  |
  +-------------------------------------------+
```

Bu iki durumdan biri gerçekleştiğinde 8086 CPU yürütmeyi derhal durdurur ve **Intel Tip 0 (Type 0 - Divide Error Exception)** kesmesini tetikler. İşlemci, Kesme Vektör Tablosu'nun (IVT) ilk 4 baytında (`00000h`–`00003h`) kayıtlı olan ISR rutinini çalıştırarak ekrana bir hata mesajı basar ve programı sonlandırır.

---

## 5.6 Paketlenmiş ve Paketlenmemiş BCD Aritmetiği: DAA (Decimal Adjust for Addition) ve DAS (Decimal Adjust for Subtraction)

İkili Kodlanmış Onlu (BCD - Binary Coded Decimal) formatında her onluk basamak (0–9) 4 bitlik bir nipel (nibble) ile temsil edilir:
- **Paketlenmemiş BCD (Unpacked BCD):** Her baytta yalnızca bir basamak tutulur (üst nipel daima `0000b`'dir: `00h`–`09h`).
- **Paketlenmiş BCD (Packed BCD):** Her baytta iki basamak tutulur (`00h`–`99h`). Örneğin $59$ sayısı ikili tabanda `0011 1011b` iken BCD formatında `0101 1001b` (`59h`) olarak kodlanır.

Standart ikili toplayıcı (binary adder), BCD kurallarını bilmez. Örneğin BCD 38h ile BCD 45h toplandığında ALU ikili olarak şunu üretir:

$$38\text{H} + 45\text{H} = 7\text{DH}$$

Oysa 'D' geçerli bir ondalık BCD hanesi değildir ($38 + 45 = 83$ olmalıdır). Bu uyumsuzluğu gidermek için toplama işleminden hemen sonra `DAA`, çıkarma işleminden hemen sonra ise `DAS` komutu yürütülür.

### DAA (Decimal Adjust for Addition) Düzeltme Algoritması

`DAA` komutu yalnızca `AL` yazmacı üzerinde çalışır. `ADD` veya `ADC` komutunun hemen ardından çağrılmalıdır:

```asm
MOV AL, 38H     ; BCD 38
MOV BL, 45H     ; BCD 45
ADD AL, BL      ; İkili toplam: AL = 7DH, AF = 0, CF = 0
DAA             ; BCD Düzeltmesi: AL = 83H, CF = 0
```

`DAA` donanımsal düzeltme tablosu ve karar mantığı şu iki aşamadan oluşur:
1. **Düşük Nipel Düzeltmesi:**
   - Eğer $AL$'nin alt 4 biti ($AL \land 0\text{FH}$) $9$'dan büyükse **VEYA** Yardımcı Elde Bayrağı $AF = 1$ ise:
     $$AL \leftarrow AL + 06\text{H}, \quad AF \leftarrow 1$$
2. **Yüksek Nipel Düzeltmesi:**
   - Eğer $AL$'nin üst 4 biti $9$'dan büyükse ($AL > 9\text{FH}$) **VEYA** Elde Bayrağı $CF = 1$ ise:
     $$AL \leftarrow AL + 60\text{H}, \quad CF \leftarrow 1$$

| Başlangıç AL Değeri | Giriş AF | Giriş CF | AL'ye Eklenen Değer | Çıkış AF | Çıkış CF |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Alt nipel $\le 9$, Üst nipel $\le 9$ | 0 | 0 | $+00\text{H}$ | 0 | 0 |
| Alt nipel $> 9$, Üst nipel $\le 8$ | X | 0 | $+06\text{H}$ | 1 | 0 |
| Alt nipel $\le 9$, Üst nipel $> 9$ | 0 | X | $+60\text{H}$ | 0 | 1 |
| Alt nipel $> 9$, Üst nipel $> 9$ | X | X | $+66\text{H}$ | 1 | 1 |

### DAS (Decimal Adjust for Subtraction) Düzeltme Algoritması

`DAS` komutu paketlenmiş BCD çıkarma işlemlerinden (`SUB` veya `SBB`) sonra `AL` yazmacını düzeltir:

1. Eğer $AL$'nin alt nipeli $> 9$ veya $AF = 1$ ise:
   $$AL \leftarrow AL - 06\text{H}, \quad AF \leftarrow 1$$
2. Eğer $AL > 9\text{FH}$ veya $CF = 1$ ise:
   $$AL \leftarrow AL - 60\text{H}, \quad CF \leftarrow 1$$

```asm
MOV AL, 83H     ; BCD 83
MOV BL, 45H     ; BCD 45
SUB AL, BL      ; AL = 83H - 45H = 3EH (ikili fark)
DAS             ; AL = 38H (BCD 38)
```

---

## 5.7 ASCII Aritmetiği: AAA, AAS, AAM ve AAD Komutlarının Matematiksel Algoritmaları

ASCII karakter tablosunda rakamlar ('0'–'9') `30H` ile `39H` arasında yer alır. Mikroişlemci doğrudan klavyeden veya metin dosyasından okunan ASCII karakterler üzerinde toplama, çıkarma, çarpma ve bölme yapabilir.

### AAA (ASCII Adjust for Addition)
İki ASCII karakter toplandıktan sonra `AL` yazmacını paketlenmemiş BCD formatına (00h-09h) çevirir ve varsa eldeyi `AH` yazmacına aktarır:

```asm
MOV AX, 0008H   ; Unpacked BCD 8 (veya '8' için 38h)
ADD AL, 07H     ; AL = 8 + 7 = 0FH
AAA             ; AL = 05H, AH = 01H (AX = 0105H -> 15 ondalık)
OR AX, 3030H    ; AX = 3135H ('1' ve '5' ASCII karakterleri)
```

- **AAA Algoritması:**
  - Eğer $(AL \land 0\text{FH}) > 9$ veya $AF = 1$ ise:
    $$AL \leftarrow (AL + 6) \land 0\text{FH}, \quad AH \leftarrow AH + 1, \quad AF \leftarrow 1, \quad CF \leftarrow 1$$
  - Aksi halde:
    $$AL \leftarrow AL \land 0\text{FH}, \quad AF \leftarrow 0, \quad CF \leftarrow 0$$
  - `AAA` yürütüldükten sonra `AL`'nin üst nipeli daima `0` olur.

### AAS (ASCII Adjust for Subtraction)
ASCII çıkarma işlemi sonrasında farkı düzeltir:
- Eğer $(AL \land 0\text{FH}) > 9$ veya $AF = 1$ ise:
  $$AL \leftarrow (AL - 6) \land 0\text{FH}, \quad AH \leftarrow AH - 1, \quad AF \leftarrow 1, \quad CF \leftarrow 1$$
- Aksi halde:
  $$AL \leftarrow AL \land 0\text{FH}, \quad AF \leftarrow 0, \quad CF \leftarrow 0$$

### AAM (ASCII Adjust for Multiplication)
İki tek haneli paketlenmemiş BCD sayının çarpımı (veya ikili çarpımı) `AL`'dedir. `AAM`, bu değeri iki basamaklı paketlenmemiş BCD formatına (onlar basamağı `AH`, birler basamağı `AL`) ayırır:

$$AH \leftarrow \lfloor AL / 10 \rfloor, \quad AL \leftarrow AL \pmod{10}$$

```asm
MOV AL, 5
MOV BL, 7
MUL BL          ; AL = 35 (23H)
AAM             ; AH = 35 / 10 = 3, AL = 35 % 10 = 5 -> AX = 0305H
OR AX, 3030H    ; AX = 3335H ('3' ve '5' karakterleri)
```

> **İleri Düzey Mimari Notu (Genelleştirilmiş Taban):** `AAM` komutunun makine kodu iki bayttır: `D4 0AH`. Buradaki `0AH` bölen tabandır (10). Eğer makine kodunda `0AH` yerine başka bir taban yazılırsa (örn. `D4 10H`), `AAM` komutu onaltılık (hex) tabana göre dönüştürme yapar!

### AAD (ASCII Adjust before Division)
Diğer düzeltme komutlarının aksine `AAD`, bölme işleminden **SONRA DEĞİL, BÖLME İŞLEMİNDEN HEMEN ÖNCE** yürütülür! `AH:AL` içindeki iki basamaklı paketlenmemiş BCD sayıyı ikiliye (binary) dönüştürerek `DIV` komutuna hazırlar:

$$AL \leftarrow (AH \times 10) + AL, \quad AH \leftarrow 0$$

```asm
; "35" / 5 işlemini yapmak:
MOV AX, 0305H   ; Onlar hanesi 3 (AH), birler hanesi 5 (AL)
AAD             ; AL = (3 * 10) + 5 = 35 (23H), AH = 0
MOV BL, 5
DIV BL          ; AL = 7 (bölüm), AH = 0 (kalan)
```

---

## 5.8 Çok Basamaklı ve Çok Kelimeli (Multi-Precision) Toplama/Çıkarma Algoritmaları

Standart 16-bitlik mimaride 32-bit, 64-bit veya dizi tabanlı devasa sayıların toplanması ve çıkarılması, Elde Bayrağının (CF) basamaklar arasında taşınması prensibine dayanır.

### 32-Bit Toplama Algoritması
İki adet 32-bit sayı bellekte veya yazmaç çiftlerinde (`DX:AX` ve `BX:CX`) tutulsun:

```asm
; Sayı 1: DX:AX (High:Low)
; Sayı 2: BX:CX (High:Low)
; Toplam: DX:AX içine yazılacak
ADD AX, CX      ; Düşük 16 bit toplanır. Sonuç 16 biti aşarsa CF = 1 olur.
ADC DX, BX      ; Yüksek 16 bit toplanır ve önceki toplamanın eldesi (CF) eklenir.
```

### Bellekteki Çok Kelimeli Dizi Toplama Rutini
Aşağıdaki örnekte `w11.pdf` ders notlarında incelenen birden fazla işçinin günlük/yıllık ücretlerinin toplamını hesaplayan algoritmanın genelleştirilmiş assembly kodu görülmektedir:

```asm
ORG 100h

LEA SI, SAYILAR     ; Sayılar dizisinin başlangıç adresi
MOV CX, 5           ; Toplanacak kelime sayısı (5 adet word)
XOR AX, AX          ; Toplamın düşük kelimesi sıfırlanır
XOR DX, DX          ; Toplamın yüksek kelimesi (elde biriktirici) sıfırlanır

TOPLAMA_DONGUSU:
    ADD AX, [SI]    ; Sıradaki kelimeyi toplama ekle
    ADC DX, 0       ; Eğer toplama 16 biti aştıysa eldeyi DX'e taşı
    ADD SI, 2       ; Bir sonraki kelimeye geç (Word = 2 bayt)
    LOOP TOPLAMA_DONGUSU

; Sonuç: DX:AX 32-bitlik toplam değerini içerir
HLT

SAYILAR DW 27345, 28521, 29533, 30105, 32375
```

Bu algoritmada `ADD AX, [SI]` komutu her kelimeyi akümülatöre ekler; oluşan elde ise `ADC DX, 0` ile yüksek anlamlı kelimede biriktirilir. Böylece 16-bitlik işlemci üzerinde hiçbir veri kaybı yaşanmadan 32-bitlik akümülasyon gerçekleştirilmiş olur.


---

# Bölüm 6: Mantıksal İşlemler, Maskeleme ve Bit Kaydırma/Döndürme (Logic Instructions, Masking & Shifts/Rotates)

Mikroişlemcilerin programlanmasında aritmetik hesaplamalar kadar önemli bir diğer temel alan, bit düzeyinde (Bitwise) mantıksal manipülasyonlar, bayrak durum testleri ve verilerin sola/sağa ötelenmesidir. Intel 8086 mimarisinde mantıksal işlemler (AND, OR, XOR, NOT, TEST) ve bit kaydırma/döndürme komutları (SHL/SAL, SHR, SAR, ROL, ROR, RCL, RCR), verilerin paketlenmesi/açılması, çevre birimi kontrol yazmaçlarının yönetimi, maskeleme (masking) işlemleri ve çarpma/bölme işlemlerinin donanımsal olarak hızlandırılmasında kritik rol oynar. Bu bölümde tüm Boole mantık kapıları, doğruluk tabloları (truth tables), yıkıcı olmayan bit kontrolü, işaret uzatmalı aritmetik kaydırma ve çok kelimeli (Multi-Word) veri bloklarında bit öteleme algoritmaları derinlemesine incelenmektedir.

---

## 6.1 Boole Mantık İşlemleri: AND, OR, XOR, NOT Komutları ve Doğruluk Tabloları

8086 mikroişlemcisinin Yürütme Birimi (EU - Execution Unit) içinde yer alan ALU, iki işlenen arasındaki Boole mantık işlemlerini bit bit (bit-by-bit / bitwise) paralel olarak gerçekleştirir.

### Doğruluk Tabloları (Truth Tables)

Temel mantık fonksiyonlarının girdi bitlerine ($A$ ve $B$) karşılık ürettiği çıktı değerleri aşağıdaki doğruluk tablosunda özetlenmiştir:

| Girdi A | Girdi B | AND ($A \land B$) | OR ($A \lor B$) | XOR ($A \oplus B$) | NOT A ($\overline{A}$) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 |

### Komut Sözdizimi ve İşleyiş

- **`AND Hedef, Kaynak`:** Mantıksal çarpma işlemidir. Karşılıklı gelen her iki bit de `1` olduğunda sonuç biti `1` olur; aksi halde `0` üretilir.
- **`OR Hedef, Kaynak`:** Mantıksal toplama işlemidir. Karşılıklı gelen bitlerden en az biri `1` ise sonuç biti `1` olur; her iki bit de `0` ise `0` üretilir.
- **`XOR Hedef, Kaynak`:** Dışlamalı Veya (Exclusive-OR) işlemidir. İki giriş biti birbirinden farklı olduğunda sonuç `1`, aynı olduğunda (`0-0` veya `1-1`) sonuç `0` olur.
- **`NOT Hedef`:** Tek işlenenli mantıksal tersleme işlemidir. İşlenenin tüm bitlerini tersine çevirerek bire tümleyenini (One's Complement) alır ($0 \to 1, 1 \to 0$).

```asm
AND AL, BL      ; AL = AL AND BL
OR  DX, [BX]    ; DX = DX OR [DS:BX]
XOR CH, DL      ; CH = CH XOR DL
NOT AX          ; AX = NOT AX (Tüm bitler terslenir)
```

### Mantıksal Komutların Bayrak Kütüğüne (FLAGS) Etkisi

Mantıksal işlemler ALU bayraklarını belirli kurallara göre günceller:
1. **CF ve OF Bayrakları:** `AND`, `OR` ve `XOR` komutları **Elde Bayrağını (CF) ve Taşma Bayrağını (OF) DAİMA SIFIRLAR ($CF = 0, OF = 0$)**. Mantıksal işlemlerde elde ya da aritmetik taşma söz konusu olamayacağından bu bayraklar donanım tarafından temizlenir.
2. **ZF, SF ve PF Bayrakları:** Sonucun değerine göre güncellenir. Eğer işlem sonucu tam `0` ise $ZF = 1$ olur; sonucun en yüksek anlamlı biti (MSB) `1` ise $SF = 1$ olur; sonucun en düşük 8 bitindeki '1' sayısı çift ise $PF = 1$ olur.
3. **AF Bayrağı:** Durumu tanımsızdır (unpredictable).
4. **NOT Komutunun Özel Durumu:** `NOT` komutu **BAYRAK KÜTÜĞÜNDEKİ HİÇBİR BİTİ ETKİLEMEZ!** FLAGS yazmacı `NOT` yürütülmeden önceki durumunu aynen muhafaza eder.

---

## 6.2 Bit Maskeleme Teknikleri: Belirli Bitleri Sıfırlama (AND), Birleme (OR) ve Tersleme (XOR)

Gömülü sistemlerde ve sistem programlamada, bir yazmaçtaki belirli bitlerin diğer bitleri bozmadan değiştirilmesi gereklidir. Bu amaca yönelik tasarlanan sabit bit kalıplarına **Maske (Mask)**, yapılan işleme ise **Bit Maskeleme (Masking)** adı verilir.

```
                    Üç Temel Maskeleme Amacı
   +-------------------------------------------------------------+
   | 1. Bit Sıfırlama (Clear): AND kullanılır. Maske biti = 0   |
   | 2. Bit Birleme   (Set)  : OR  kullanılır. Maske biti = 1   |
   | 3. Bit Tersleme  (Toggle): XOR kullanılır. Maske biti = 1   |
   +-------------------------------------------------------------+
```

### 1. Belirli Bitleri Sıfırlama (Clearing Bits with AND)

Bir yazmaçtaki belirli bitleri sıfırlamak, diğer bitleri ise aynen korumak için `AND` işlemi kullanılır. Kural şudur:
- Sıfırlanmak istenen pozisyonlara maskede `0` konur ($X \land 0 = 0$).
- Korunmak istenen pozisyonlara maskede `1` konur ($X \land 1 = X$).

#### Örnek: ASCII Karakterini Sayısal Değere (BCD) Dönüştürme
ASCII '0'–'9' karakterleri `30H`–`39H` arasındadır (`0011 xxxxb`). Yüksek 4 biti (`0011b`) temizleyip sadece düşük 4 biti almak için `0FH` maskesi ile `AND` yapılır:

```asm
MOV AL, '5'     ; AL = 35H (0011 0101b)
AND AL, 0FH     ; AL = 35H AND 0FH = 05H (0000 0101b) -> Sayısal 5
```

İki ASCII basamağını aynı anda dönüştürmek için 16-bit maskeleme uygulanabilir (Week 5 Slide 30):
```asm
MOV BX, 3135H   ; '1' (31h) ve '5' (35h) ASCII karakterleri
AND BX, 0F0FH   ; BX = 0105H (Paketlenmemiş BCD basamakları 1 ve 5)
```

### 2. Belirli Bitleri Birleme (Setting Bits with OR)

Bir yazmaçtaki belirli bitleri 1 yapmak, diğer bitlere dokunmamak için `OR` işlemi kullanılır:
- 1 yapılmak istenen pozisyonlara maskede `1` konur ($X \lor 1 = 1$).
- Korunmak istenen pozisyonlara maskede `0` konur ($X \lor 0 = X$).

#### Örnek: Donanım Kontrol Bitlerini Etkinleştirme
```asm
; Bir çevre birimi kontrol yazmacında Bit 9 ve Bit 10'u 1 yapmak:
; Maske: 0000 0110 0000 0000b = 0600H
OR CX, 0600H    ; Bit 9 ve 10 set edilir, kalan 14 bit korunur
```

### 3. Belirli Bitleri Tersleme (Inverting / Toggling Bits with XOR)

Belirli bitlerin durumunu tersine çevirmek ($0 \to 1, 1 \to 0$) için `XOR` işlemi kullanılır:
- Terslenmek istenen pozisyonlara maskede `1` konur ($X \oplus 1 = \overline{X}$).
- Aynen korunması istenen pozisyonlara maskede `0` konur ($X \oplus 0 = X$).

```asm
; CX yazmacında yalnızca Bit 12'yi terslemek:
XOR CX, 1000H   ; Bit 12 terslenir, diğer tüm bitler değişmez
```

### En Hızlı Yazmaç Sıfırlama Tekniği: `XOR reg, reg`

8086 montaj dilinde bir yazmacı sıfırlamak için `MOV AX, 0` yerine neredeyse daima `XOR AX, AX` tercih edilir:

```asm
XOR AX, AX      ; AX = 0000H, ZF = 1, CF = OF = 0
```

Bu tercihin mimari nedenleri:
1. **Kod Boyutu (Opcode Density):** `MOV AX, 0` komutu 3 bayttır (`B8 00 00`, 16-bit anlık veri taşır). `XOR AX, AX` ise yalnızca **2 bayttır** (`31 C0`). Komut ön getirme kuyruğunda yer tasarrufu sağlar.
2. **Çalışma Hızı:** Anlık sabit verinin getirilmesi gerekmeyip doğrudan iç yazmaçlar üzerinden yürütülür.
3. **Bayrak Güncellemesi:** Sonuç sıfır olduğu için donanımsal olarak **$ZF = 1$** yapılır.

---

## 6.3 TEST Komutu ve Yıkıcı Olmayan (Non-Destructive) Durum Tespiti

`TEST` komutu, iki işlenen arasında mantıksal `AND` işlemi yürütür:

$$\text{Geçici Değer} \leftarrow \text{Hedef} \land \text{Kaynak}$$

> **Kritik Mimari Özellik:** Tıpkı `CMP` komutunun `SUB` işlemini hedefi değiştirmeden yapması gibi, `TEST` komutu da `AND` işlemini hedef işleneni **ASLA DEĞİŞTİRMEDEN** yürütür. Hedef yazmaç veya bellek içeriği aynen korunur; yalnızca durum bayrakları (`FLAGS: ZF, SF, PF`) güncellenir ($CF=0, OF=0$).

`TEST` komutu genellikle bir işlenenin belirli bir bitinin veya bit grubunun `1` mi yoksa `0` mı olduğunu sorgulamak için kullanılır ve ardından bir koşullu sıçrama (`JZ` veya `JNZ`) ile kontrol sağlanır:
- Test edilen bit `0` ise $\implies \text{Sonuç} = 0 \implies \mathbf{ZF = 1}$ (`JZ` sıçrar).
- Test edilen bit `1` ise $\implies \text{Sonuç} \neq 0 \implies \mathbf{ZF = 0}$ (`JNZ` sıçrar).

```asm
; Örnek 1: Sayının Tek (Odd) veya Çift (Even) Olduğunu Kontrol Etmek
; Bir sayının en sağdaki biti (Bit 0 / LSB) 1 ise sayı TEK, 0 ise ÇİFTTİR.
TEST AL, 01H     ; AL'nin Bit 0'ı test edilir
JNZ SAYI_TEK    ; Eğer Bit 0 == 1 ise (ZF=0), SAYI_TEK etiketine sıçra
; Burada sayı çifttir

; Örnek 2: Sayının Negatif Olduğunu (MSB / İşaret Biti) Kontrol Etmek
TEST AL, 80H     ; AL'nin en sol biti (Bit 7) test edilir (80h = 1000 0000b)
JNZ NEGATIF_SAYI ; Bit 7 == 1 ise NEGATIF_SAYI etiketine atla
```

---

## 6.4 Mantıksal ve Aritmetik Kaydırma Komutları: SHL/SAL, SHR, SAR (Çarpma ve Bölme Hızlandırma)

Kaydırma komutları, bir yazmaç veya bellek hücresindeki bitlerin tamamını belirtilen adım sayısı kadar sola veya sağa öteler.

### Kaydırma Sayacı Kuralı (Shift Count)
8086 mikroişlemcisinde kaydırma miktarı:
- Yalnızca **1 bit** kaydırılacaksa komutta anlık sabit olarak yazılabilir: `SHL AX, 1`.
- Eğer **1'den fazla bit** kaydırılacaksa, kaydırma miktarı **MUTLAKA `CL` YAZMACINA YÜKLENMELİDİR**:
  ```asm
  MOV CL, 3
  SHL AX, CL      ; AX 3 bit sola kaydırılır
  ```
  *(Not: Anlık sabit ile `SHL AX, 3` yazımı 80186 ve sonraki işlemcilerde desteklenmiş olup, saf 8086'da donanımsal olarak geçersizdir).*

### SHL / SAL (Shift Logical Left / Shift Arithmetic Left)
Mantıksal Sola Kaydırma (`SHL`) ve Aritmetik Sola Kaydırma (`SAL`) komutları **aynı makine koduna ve aynı donanımsal işleyişe sahiptir**:

```
           +-----------------------------------------------+
     CF <--| Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | <-- 0
           +-----------------------------------------------+
```

- En sağdan (LSB) içeriye daima **`0` biti** girer.
- Tüm bitler bir pozisyon sola ötelenir.
- En yüksek anlamlı bitten (MSB) çıkan bit **Elde Bayrağına (CF)** yazılır.
- **Matematiksel Etki:** İkili bir sayıyı 1 bit sola kaydırmak, sayıyı **2 ile çarpmak** demektir ($x \leftarrow x \times 2^n$).
- **OF Bayrağı:** 1-bitlik kaydırmada, sonuç bitinin işareti (yeni MSB) ile CF'ye çıkan eski MSB farklı ise $OF = 1$ olur (işaretli taşma).

### SHR (Shift Logical Right - Mantıksal Sağa Kaydırma)
İşaretsiz sayılar üzerinde mantıksal sağa öteleme yapar:

```
           +-----------------------------------------------+
     0 --> | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | --> CF
           +-----------------------------------------------+
```

- En soldan (MSB) içeriye daima **`0` biti** girer.
- Tüm bitler bir pozisyon sağa ötelenir.
- En düşük anlamlı bitten (LSB) çıkan bit **Elde Bayrağına (CF)** aktarılır.
- **Matematiksel Etki:** İşaretsiz tamsayıyı **2'ye bölmek** demektir ($x \leftarrow \lfloor x / 2^n \rfloor$). Çıkan kesir kısmı CF bayrağında kalır.

### SAR (Shift Arithmetic Right - Aritmetik Sağa Kaydırma & İşaret Uzatma)
İşaretli ikiye tümleyen sayılar üzerinde bölme yapmak için tasarlanmıştır:

```
           +-----------------------------------------------+
     +---> | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | --> CF
     |     +-----------------------------------------------+
     +-------+ (İşaret biti korunur / Sign Extension)
```

- En düşük anlamlı bit (LSB) **CF**'ye aktarılır.
- Tüm bitler sağa kaydırılır.
- **EN KRİTİK FARK:** En sol bite (MSB) `0` girmez! **Eski MSB (İşaret Biti) DEĞİŞTİRİLMEDEN KORUNUR (Sign Extension / İşaret Uzatma)**. Sayı negatifse MSB `1` olarak kalır ve içeri `1` girer; sayı pozitifse `0` olarak kalır ve içeri `0` girer.
- **Matematiksel Etki:** İşaretli tamsayıyı işareti bozmadan **2'ye bölmek** demektir.

```asm
; Örnek: -8 sayısının 2'ye bölünmesi
MOV AL, -8      ; AL = F8H (1111 1000b)
SAR AL, 1       ; AL = FCH (1111 1100b = -4 ondalık), CF = 0
```

### Kaydırma Komutlarıyla Hızlı Aritmetik Çarpma

Donanımsal `MUL` komutu onlarca saat çevrimi (clock cycle) tüketirken, kaydırma komutları çok daha hızlıdır. Sabit sayılarla çarpma işlemlerinde kaydırma ve toplama kombinasyonu kullanılır:

```asm
; AX yazmacını 10 ile çarpmak: AX * 10 = (AX * 8) + (AX * 2)
MOV BX, AX      ; Orijinal değeri yedekle
SHL AX, 1       ; AX = AX * 2
SHL BX, 1
SHL BX, 1
SHL BX, 1       ; BX = Orijinal * 8
ADD AX, BX      ; AX = (AX * 2) + (AX * 8) = AX * 10
```

---

## 6.5 Döngüsel Kaydırma Komutları: ROL, ROR, RCL, RCR (Carry Bayrağı Dahil/Hariç Döndürme)

Döngüsel kaydırma (Rotate) komutlarında hiçbir bit kaybolmaz. Bir uçtan dışarı çıkan bitler dairesel olarak diğer uçtan içeri geri girer.

```
                            Döngüsel Kaydırma Ailesi
         +-------------------------------------------------------------+
         | Standart Döngü (Carry Hariç) : ROL (Sola)  , ROR (Sağa)    |
         | Elde Dahil Döngü (Carry Ring): RCL (Sola)  , RCR (Sağa)    |
         +-------------------------------------------------------------+
```

### ROL (Rotate Left - Sola Döndürme)
Bitler sola ötelenir. En soldaki bitten (MSB) çıkan bit hem en sağa (LSB) geri döner **hem de** Carry Bayrağına (CF) kopyalanır:

```
        +------------------------------------------------------+
        |                                                      |
        v  +-----------------------------------------------+   |
     +--+--| Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 |<--+
     |     +-----------------------------------------------+
     v
    CF
```

### ROR (Rotate Right - Sağa Döndürme)
Bitler sağa ötelenir. En sağdaki bitten (LSB) çıkan bit hem en sola (MSB) geri döner hem de CF'ye kopyalanır:

```
        +------------------------------------------------------+
        |                                                      |
        |   +-----------------------------------------------+  v
        +-->| Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 |--+--+
            +-----------------------------------------------+  |
                                                               v
                                                              CF
```

### RCL (Rotate Carry Left - Elde Dahil Sola Döndürme)
Carry bayrağını da döngü halkasına katarak **9-bitlik** (bayt işlemi) veya **17-bitlik** (kelime işlemi) kapalı bir halka oluşturur:
- MSB'den çıkan bit **CF**'ye geçer.
- CF'deki eski değer ise **LSB**'ye girer.

```
     +---------------------------------------------------------+
     |                                                         |
     v     +-----------------------------------------------+   |
    CF <-- | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 |<--+
           +-----------------------------------------------+
```

### RCR (Rotate Carry Right - Elde Dahil Sağa Döndürme)
9-bitlik veya 17-bitlik halkada sağa döndürme:
- LSB'den çıkan bit **CF**'ye geçer.
- CF'deki eski değer ise **MSB**'ye girer.

```
     +---------------------------------------------------------+
     |                                                         |
     |     +-----------------------------------------------+   v
     +---> | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | --> CF
           +-----------------------------------------------+
```

#### Örnek: 4-Bit Nipel Takası (Nibble Swap)
Bir bayt içindeki yüksek ve alçak nipelleri takas etmek için `ROL` veya `ROR` 4 kez döndürülür:

```asm
MOV AL, 0F0H    ; AL = 1111 0000b
MOV CL, 4
ROL AL, CL      ; AL = 0000 1111b (0FH)
```

---

## 6.6 Çok Kelimeli (Multi-Word / 32-bit / 48-bit) Verilerde Bit Kaydırma ve Döndürme Algoritmaları

Tek bir yazmacın genişliğini aşan (32-bit, 48-bit, 64-bit) çok kelimeli verilerin sola veya sağa kaydırılmasında `SHL`/`SHR` ile `RCL`/`RCR` komutları zincirleme olarak birlikte kullanılır.

### Çok Kelimeli Sola Kaydırma Zinciri (Multi-Word Left Shift)

Kural:
1. En düşük anlamlı kelime **`SHL`** ile kaydırılır (en sağdan `0` girer, taşan MSB biti CF'ye çıkar).
2. Sonraki tüm yüksek anlamlı kelimeler sırasıyla **`RCL`** ile kaydırılır (önceki kelimeden CF'ye çıkan bit yeni kelimenin LSB'sine girer; kendi MSB'si ise CF'ye çıkarak bir sonraki kelimeye aktarılır).

#### Week 5 Slide 38 İncelemesi: 48-Bitlik Sayıyı 1 Basamak Sola Kaydırma
DX, BX ve AX yazmaçlarına yayılmış 48-bitlik bir veriyi (`DX:BX:AX`) ele alalım:

```asm
; Başlangıç Değerleri:
; DX:BX:AX = 0001H : 8000H : 0001H
; İkili: 0000 0000 0000 0001 : 1000 0000 0000 0000 : 0000 0000 0000 0001

SHL AX, 1       ; AX sola 1 kayar. LSB=0 girer. AX'in MSB'si (0) CF'ye çıkar.
                ; AX yeni değeri = 0002H, CF = 0

RCL BX, 1       ; CF (0) BX'in LSB'sine girer. BX'in MSB'si (1) CF'ye çıkar!
                ; BX yeni değeri = 0000H, CF = 1

RCL DX, 1       ; CF (1) DX'in LSB'sine girer. DX'in MSB'si (0) CF'ye çıkar.
                ; DX yeni değeri = 0003H, CF = 0

; Sonuç:
; DX:BX:AX = 0003H : 0000H : 0002H
```

Matematiksel Sağlama:
- Başlangıç: $1 \times 2^{32} + 2^{31} + 1 = 4,294,967,296 + 2,147,483,648 + 1 = 6,442,450,945$
- Çarpı 2: $6,442,450,945 \times 2 = 12,884,901,890$
- Bitiş: $3 \times 2^{32} + 0 + 2 = 12,884,901,888 + 2 = 12,884,901,890$
Sonuç tam iki katına çıkmış ve 48-bitlik blok kusursuzca ötelenmiştir.

### Çok Kelimeli Sağa Kaydırma Zinciri (Multi-Word Right Shift)

Sağa kaydırma işleminde yön tersinedir:
1. En yüksek anlamlı kelime **`SHR`** (işaretsiz bölme) veya **`SAR`** (işaretli bölme) ile kaydırılır; LSB'si CF'ye çıkar.
2. Düşük anlamlı kelimelere doğru sırasıyla **`RCR`** uygulanarak CF'deki bit bir alttaki kelimenin MSB'sine aktarılır.

```asm
; 32-Bit İşaretsiz Sayıyı Sağa 1 Kaydırma (DX:AX / 2)
SHR DX, 1       ; DX sağa kayar, LSB biti CF'ye aktarılır
RCR AX, 1       ; CF'deki bit AX'in MSB'sine girer, AX'in LSB'si CF'ye çıkar
```

### Uygulamalı Dizi Örneği: Dizideki Tek ve Çift Sayıları Sayma
Aşağıdaki kod parçası, `MicroProcessor code examples week.pdf` (Sayfa 8)'deki çalışır örneğin 8086 gerçekleştirimidir:

```asm
ORG 100h

LEA SI, DIZI        ; 10 elemanlı word dizisi
MOV CX, 10          ; Eleman sayısı
XOR BX, BX          ; Tek sayı sayacı (odd count)
XOR DX, DX          ; Çift sayı sayacı (even count)

SAYMA_DONGUSU:
    LODSW           ; Sıradaki kelimeyi AX'e yükle (SI = SI + 2)
    SHR AX, 1       ; LSB bitini CF'ye kaydır
    JNC CIFT_SAYI   ; Eğer CF == 0 ise sayı çifttir, sıçra
    INC BX          ; CF == 1 ise tek sayıdır, BX'i artır
    JMP DEVAM

CIFT_SAYI:
    INC DX          ; Çift sayı sayacını artır

DEVAM:
    LOOP SAYMA_DONGUSU

; Sonuç: BX = Tek sayı adedi, DX = Çift sayı adedi
HLT

DIZI DW 8, 11, 43, 56, 507, 608, 0, 123, 17, 13
```

Bu örnek, `SHR AX, 1` komutunun tek çevrimde hem sayıyı 2'ye böldüğünü hem de LSB bitini $CF$ bayrağına aktararak $JNC$ ile doğrudan karar vermeyi sağladığını kanıtlamaktadır.


---

# BÖLÜM 7: Program Akış Kontrolü, Koşullu Sıçramalar, Döngüler ve Prosedürler (Control Flow, Conditional Jumps, Loops & Procedures)

Mikroişlemcilerin program yürütme mekanizması, varsayılan olarak sıralı (ardışıl) bir düzendedir; Komut İşaretçisi (Instruction Pointer - `IP`), her komut baytı çekildikten sonra bir sonraki komutu gösterecek şekilde artırılır. Ancak algoritmik mantığın kurulabilmesi, karar mekanizmalarının (if-then-else) işletilmesi, belirli kod bloklarının yinelenmesi (for, while döngüleri) ve modüler yazılım geliştirme (fonksiyon/alt yordam çağrıları) için program akışının dinamik olarak değiştirilmesi zorunludur.

Intel 8086 mikroişlemcisi; koşulsuz sıçramalar (`JMP`), durum bayraklarına duyarlı koşullu dallanmalar (`Jcc`), sayaç denetimli donanımsal döngüler (`LOOP`, `LOOPE`, `LOOPNE`, `JCXZ`) ve yığın (stack) mekanizmasını kullanan alt yordam (subroutine) çağrı/dönüş komutları (`CALL`, `RET`) ile donatılmıştır.

---

## 7.1 Program Akış Kontrolünün Temelleri: Koşulsuz Sıçrama (JMP: Short, Near, Far)

Koşulsuz sıçrama komutu (`JMP - Unconditional Jump`), herhangi bir bayrak kontrolü yapmaksızın program yürütme akışını doğrudan belirtilen hedef adrese yönlendirir. 8086 mimarisinde `JMP` komutu, hedefin uzaklığına ve segment içi veya segmentler arası olmasına bağlı olarak üç temel biçimde uygulanır:

```
+-----------------------------------------------------------------------------------+
|                           8086 JMP ÇEŞİTLERİ                                      |
+-------------------+----------------------+-------------------+--------------------+
| Sıçrama Türü      | Makine Kodu / Opcode | Menzil (Mesafe)   | Değişen Yazmaçlar  |
+-------------------+----------------------+-------------------+--------------------+
| Short Jump (Kısa) | EB cb (2 bayt)       | -128 .. +127 bayt | Sadece IP (disp8)  |
| Near Jump (Yakın) | E9 cw (3 bayt)       | -32768 .. +32767  | Sadece IP (disp16) |
| Far Jump (Uzak)   | EA cd (5 bayt)       | Farklı Segment    | Hem CS hem IP      |
+-------------------+----------------------+-------------------+--------------------+
```

### 1. Short Jump (Kısa Sıçrama)
Short jump, aynı kod segmenti (`CS`) içerisinde $\pm 128$ baytlık göreceli mesafeye yapılan sıçramadır. 
- Makine kodunda 1 baytlık opcode (`EBh`) ve 1 baytlık işaretli deplasman (displacement: `disp8`) yer alır (toplam 2 bayt).
- Hedef fiziksel adres formülü:
  $$\text{Hedef IP} = \text{IP}_{sonraki} + \text{disp8}$$
- Burada $\text{IP}_{sonraki}$, sıçrama komutunun hemen ardından gelen komutun ofset adresidir. Deplasman $-128 \le \text{disp8} \le +127$ aralığında 2'ye tümleyen (two's complement) biçimindedir.

```assembly
; Kısa Sıçrama Örneği
ORG 100h
JMP SHORT ileri_hedef
NOP
ileri_hedef:
MOV AX, 1
HLT
```

### 2. Near Jump (Yakın Sıçrama - Segment İçi)
Near jump, yine mevcut kod segmenti içinde fakat $\pm 32\text{ KB}$ aralığındaki hedeflere ulaşmak için kullanılır.
- Doğrudan (Direct Near): `E9h` opcode ve 16-bitlik işaretli deplasman (`disp16`) içerir (toplam 3 bayt).
  $$\text{Hedef IP} = \text{IP}_{sonraki} + \text{disp16} \quad (-32768 \le \text{disp16} \le +32767)$$
- Dolaylı (Indirect Near): Hedef adres bir yazmaçta ya da bellek konumunda tutulur (`FF /4`). Örneğin `JMP AX` komutunda `IP` yazmacına doğrudan `AX` değeri kopyalanır (`IP <- AX`). `JMP [BX]` komutunda ise `DS:BX` adresindeki 16-bitlik veri `IP` yazmacına yüklenir.

### 3. Far Jump (Uzak Sıçrama - Segmentler Arası)
Far jump (Intersegment Jump), program akışını farklı bir kod segmentine geçirmek için kullanılır.
- Doğrudan Far: 5 baytlık komuttur. `EAh` opcode'unu 16-bitlik yeni `IP` (Offset) ve ardından 16-bitlik yeni `CS` (Segment) baytları takip eder (`JMP FAR PTR HedefEtiket` veya `JMP 2000h:0100h`).
- Dolaylı Far: Bellekten 4 bayt (Doubleword far pointer) okunarak ilk kelime `IP`'ye, ikinci kelime `CS`'ye atanır (`JMP DWORD PTR [BX]`).

---

## 7.2 Koşullu Sıçrama Komutları (Jcc): Bayrak Kuralları ve Karşılaştırma Mantığı

Koşullu sıçrama komutları (`Jcc`), `FLAGS` yazmacındaki belirli durum bayraklarının (`ZF, CF, SF, OF, PF`) değerlerini denetler. Eğer ilgili koşul mantıksal olarak doğru (True) ise hedef adrese dallanır; koşul yanlış (False) ise işlemci bir sonraki sıralı komutu yürütmeye devam eder.

> **Kritik Mimari Kural:** 8086 mimarisinde tüm koşullu sıçramalar (`Jcc`) **yalnızca Short Jump (Kısa Sıçrama)** formatındadır. Makine kodunda 1 bayt opcode ve 1 bayt işaretli deplasman bulunur (hedef menzili $-128 \le \text{disp8} \le +127$ bayttır). Eğer daha uzak bir mesafeye koşullu sıçranması gerekiyorsa, zıt koşullu bir kısa sıçrama ile bir `Near JMP` komutu üzerinden atlama tekniği (Trampoline) uygulanır.

Koşullu sıçramalar çoğunlukla bir `CMP` (Compare) veya `TEST` komutunu takip eder.

### Kapsamlı Jcc Koşullu Sıçrama Tablosu

Aşağıdaki referans tablosunda 8086'nın tüm koşullu sıçrama komutları, anlamları, denetledikleri bayrak durumları ve kullanım kategorileri verilmiştir:

| Komut (Mnemonic) | Eşdeğeri (Alias) | Açıklama (İngilizce & Türkçe) | Bayrak Şartı (Flag Condition) | Aritmetik Tür |
| :--- | :--- | :--- | :--- | :--- |
| **JZ** | **JE** | Jump if Zero / Jump if Equal (Sıfırsa veya Eşitse) | $ZF = 1$ | Genel / Eşitlik |
| **JNZ** | **JNE** | Jump if Not Zero / Jump if Not Equal (Sıfır Değilse / Eşit Değilse) | $ZF = 0$ | Genel / Eşitlik |
| **JC** | **JB / JNAE** | Jump if Carry / Jump if Below (Elde Varsa / Küçükse) | $CF = 1$ | İşaretsiz (Unsigned) |
| **JNC** | **JAE / JNB** | Jump if No Carry / Jump if Above or Equal (Elde Yoksa / Büyük-Eşitse) | $CF = 0$ | İşaretsiz (Unsigned) |
| **JA** | **JNBE** | Jump if Above / Jump if Not Below or Equal (Büyükse) | $CF = 0 \land ZF = 0$ | İşaretsiz (Unsigned) |
| **JBE** | **JNA** | Jump if Below or Equal / Jump if Not Above (Küçük ya da Eşitse) | $CF = 1 \lor ZF = 1$ | İşaretsiz (Unsigned) |
| **JG** | **JNLE** | Jump if Greater / Jump if Not Less or Equal (İşaretli Büyükse) | $ZF = 0 \land SF = OF$ | İşaretli (Signed) |
| **JGE** | **JNL** | Jump if Greater or Equal / Jump if Not Less (İşaretli Büyük-Eşitse) | $SF = OF$ | İşaretli (Signed) |
| **JL** | **JNGE** | Jump if Less / Jump if Not Greater or Equal (İşaretli Küçükse) | $SF \neq OF$ | İşaretli (Signed) |
| **JLE** | **JNG** | Jump if Less or Equal / Jump if Not Greater (İşaretli Küçük-Eşitse) | $ZF = 1 \lor SF \neq OF$ | İşaretli (Signed) |
| **JS** | — | Jump if Sign (Negatifse / Sonuç Eksi ise) | $SF = 1$ | Tek Bayrak |
| **JNS** | — | Jump if Not Sign (Pozitifse / Sonuç Artı ise) | $SF = 0$ | Tek Bayrak |
| **JO** | — | Jump if Overflow (Taşma Varsa) | $OF = 1$ | Tek Bayrak |
| **JNO** | — | Jump if No Overflow (Taşma Yoksa) | $OF = 0$ | Tek Bayrak |
| **JP** | **JPE** | Jump if Parity / Jump if Parity Even (Çift Parite) | $PF = 1$ | Tek Bayrak |
| **JNP** | **JPO** | Jump if No Parity / Jump if Parity Odd (Tek Parite) | $PF = 0$ | Tek Bayrak |

### İşaretli vs. İşaretsiz Sayı Karşılaştırması Örneği
```assembly
; Unsigned vs Signed Karşılaştırma Analizi
MOV AL, 0FFh     ; İşaretsiz: 255, İşaretli: -1
MOV BL, 01h      ; İşaretsiz: 1,   İşaretli: +1
CMP AL, BL

; İşaretsiz bakışta: 255 > 1 olduğundan JA dallanır (CF=0, ZF=0)
JA  unsigned_greater

; İşaretli bakışta: -1 < +1 olduğundan JL dallanır (SF=1, OF=0 => SF != OF)
JL  signed_less
```

---

## 7.3 Sayaç Temelli Döngü Komutları: LOOP, LOOPE/LOOPZ, LOOPNE/LOOPNZ ve JCXZ

8086 mimarisi, döngü işlemlerini donanımsal düzeyde hızlandırmak amacıyla sayaç yazmacı olan `CX` (veya `CL`) yazmacını otomatik olarak yöneten özel döngü komutlarına sahiptir.

```
       +---------------------------------------------+
       |               LOOP ÇALIŞMA SIRASI           |
       |                                             |
       |             [ LOOP hedef ]                  |
       |                   |                         |
       |           CX <-- CX - 1                     |
       |                   |                         |
       |            CX == 0 mı?                      |
       |              /        \                     |
       |        (HAYIR)        (EVET)                |
       |          /                \                 |
       |  IP <-- IP + disp8      Döngüden Çık        |
       |  (Hedefe Sıçra)         (Sıradaki Komut)    |
       +---------------------------------------------+
```

### 1. LOOP Komutu
`LOOP` komutu her işletildiğinde aşağıdaki iki işlemi atomik olarak gerçekleştirir:
1. $CX \leftarrow CX - 1$
2. Eğer $CX \neq 0$ ise hedef etikete kısa sıçrama yapar; $CX = 0$ olduğunda döngü sonlanır.
> **Önemli Bayrak Kuralı:** `LOOP` komutu `CX` yazmacını 1 azalttığı halde **FLAGS yazmacındaki hiçbir bayrağı (ZF dahil) DEĞİŞTİRMEZ!**

```assembly
; 1'den 10'a kadar olan sayıların toplamı
ORG 100h
MOV CX, 10       ; Sayaç = 10
MOV AX, 0        ; Toplam = 0
topla_dongu:
ADD AX, CX       ; AX += CX
LOOP topla_dongu ; CX--, CX!=0 ise topla_dongu'ye sıçra
HLT
```

### 2. LOOPE / LOOPZ (Loop while Equal / Loop while Zero)
`LOOPE` (veya `LOOPZ`) komutu iki koşulu birlikte test eder:
1. $CX \leftarrow CX - 1$
2. Eğer $CX \neq 0 \text{ VE } ZF = 1$ ise hedefe sıçrar.
Döngü; $CX = 0$ olduğunda veya döngü içindeki bir işlem $ZF = 0$ yaptığında (örneğin eşit olmayan bir eleman bulunduğunda) kırılır. Dizi arama işlemlerinde eşitlik devam ettiği sürece ilerlemek için idealdir.

### 3. LOOPNE / LOOPNZ (Loop while Not Equal / Loop while Not Zero)
`LOOPNE` (veya `LOOPNZ`) komutu:
1. $CX \leftarrow CX - 1$
2. Eğer $CX \neq 0 \text{ VE } ZF = 0$ ise hedefe sıçrar.
Döngü; $CX = 0$ olduğunda veya aranan eleman bulunup $ZF = 1$ olduğunda sonlanır.

### 4. JCXZ (Jump if CX is Zero)
Eğer bir döngüye girilirken `CX = 0` ise, standart bir `LOOP` komutu ilk adımda `CX`'i azaltarak `0 - 1 = 0FFFFh (65535)` yapar ve döngü 65536 kez yinelenir. Bu ölümcül mantık hatasını önlemek için döngünün hemen başında `JCXZ` komutu çalıştırılır:
- `JCXZ HedefEtiket`: Eğer $CX = 0$ ise doğrudan döngü sonuna sıçrar. FLAGS bayraklarını etkilemez.

```assembly
; Güvenli Döngü Deseni (JCXZ Korumalı)
JCXZ dongu_atla   ; CX = 0 ise gövdeyi hiç çalıştırma
dongu_bas:
    ; ... döngü gövdesi ...
    LOOP dongu_bas
dongu_atla:
```

---

## 7.4 Prosedür Çağrıları ve Dönüş Mekanizması: CALL (Near/Far), RET (Near/Far, RET n)

Alt yordamlar (prosedürler / subroutines), yazılımın modülerliğini sağlar. Bir prosedür çağrıldığında işlemci sıradaki komutun adresini yığına (`Stack`) kaydeder; alt yordam tamamlandığında ise bu adresi yığından çekerek kaldığı yere geri döner.

```
       +-------------------------------------------------------------+
       |               CALL VE RET YIĞIN DİNAMİĞİ                     |
       +-------------------------------------------------------------+
       
       CALL calistirildiginda:
       -----------------------
       SP <-- SP - 2
       Memory[SS:SP] <-- IP_sonraki (Geri dönüş adresi)
       IP <-- Prosedur_Ofseti
       
       RET calistirildiginda:
       ----------------------
       IP <-- Memory[SS:SP] (Adres yigindan cekilir)
       SP <-- SP + 2
```

### 1. Near CALL ve Near RET
- **Near CALL (`E8 cw`):** Aynı kod segmenti içindeki alt yordamı çağırır. Sıradaki komutun ofset adresini (`IP`) yığına iter ($SP \leftarrow SP - 2$, $[SS:SP] \leftarrow IP$). Ardından `IP` yazmacına alt yordamın ofset adresini yükler.
- **Near RET (`C3h`):** Yığından 2 bayt çekerek `IP` yazmacına yükler ($IP \leftarrow [SS:SP]$, $SP \leftarrow SP + 2$).

### 2. Far CALL ve Far RET
- **Far CALL (`9A cd`):** Farklı bir segmentteki prosedürü çağırır. Önce mevcut `CS` yazmacını, ardından sıradaki `IP` yazmacını yığına iter (toplam 4 bayt).
- **Far RET (`CBh`):** Yığından önce `IP`'yi, ardından `CS`'yi çekerek segmentler arası dönüşü tamamlar ($SP \leftarrow SP + 4$).

### 3. RET n (Temizlemeli Dönüş)
C ve Pascal gibi yüksek seviyeli dillerde prosedüre yığın üzerinden aktarılan argümanları temizlemek için `RET n` kullanılır:
- İşlemci yığından dönüş adresini `IP`'ye çeker, ardından yığın işaretçisine $n$ bayt ekler ($SP \leftarrow SP + 2 + n$). Böylece parametreler için ayrılan yığın alanı tek bir komutla serbest bırakılmış olur.

---

## 7.5 Alt Yordamlarda Parametre Aktarımı

Prosedürlere veri/argüman aktarmak için üç temel yöntem kullanılır:

1. **Yazmaçlar Aracılığıyla Parametre Aktarımı (FastCall Mantığı):**
   - En hızlı yöntemdir. Parametreler doğrudan `AX, BX, CX, DX, SI, DI` yazmaçlarına yüklenir.
   - Sınırlaması: Yazmaç sayısı kısıtlıdır; çok sayıda argüman veya büyük yapılar aktarılamaz.
2. **Ortak Bellek Alanları (Global Değişkenler):**
   - Parametreler veri segmentinde tanımlı sabit bellek adreslerine yazılır.
   - Dezavantajı: Kodun yeniden girişli (reentrant) ve özyinelemeli (recursive) çalışmasını engeller.
3. **Yığın (Stack) Üzerinden Parametre Aktarımı:**
   - Modern derleyicilerin standart yöntemidir. Parametreler `PUSH` komutları ile yığına atılır. Sınırsız sayıda parametre aktarılabilir ve özyinelemeyi (recursion) mükemmel destekler.

---

## 7.6 Standart Yığın Çerçevesi (Stack Frame) ve BP Tabanlı Yerel Değişkenler

Yığın üzerinden parametre aktarıldığında ve alt yordam içinde yerel değişkenlere ihtiyaç duyulduğunda **Standart Yığın Çerçevesi (Stack Frame)** kurulur. Bu çerçevede temel referans işaretçisi olarak Taban İşaretçisi (`BP - Base Pointer`) kullanılır.

```
       Yüksek Bellek Adresi
       +-------------------------------+
       |       Parametre 2             | [BP + 6]
       +-------------------------------+
       |       Parametre 1             | [BP + 4]
       +-------------------------------+
       |   Geri Dönüş Adresi (IP)      | [BP + 2]  <- CALL komutu koydu
       +-------------------------------+
BP --> |     Eski BP Değeri            | [BP + 0]  <- PUSH BP ile saklandı
       +-------------------------------+
       |     Yerel Değişken 1          | [BP - 2]
       +-------------------------------+
SP --> |     Yerel Değişken 2          | [BP - 4]  <- SUB SP, 4 ile ayrıldı
       +-------------------------------+
       Düşük Bellek Adresi (Yığın Büyüme Yönü: Aşağı)
```

### Prosedür Başlığı (Prologue) ve Kapanışı (Epilogue)
```assembly
; Standart C Tarzı Fonksiyon Şablonu
my_function PROC
    ; --- PROLOGUE (Giriş) ---
    PUSH BP             ; Çağıran fonksiyonun BP değerini sakla
    MOV  BP, SP         ; Mevcut yığın tepesini referans tabanı yap
    SUB  SP, 4          ; 2 adet yerel kelime değişkeni için yer aç (4 bayt)

    ; --- İŞLEM GÖVDESİ ---
    ; Parametre 1: [BP + 4]
    ; Parametre 2: [BP + 6]
    ; Yerel Değişken 1: [BP - 2]
    ; Yerel Değişken 2: [BP - 4]
    MOV AX, [BP + 4]    ; İlk parametreyi AX'e al
    ADD AX, [BP + 6]    ; İkinci parametreyi ekle
    MOV [BP - 2], AX    ; Sonucu yerel değişkene yaz

    ; --- EPILOGUE (Çıkış) ---
    MOV  SP, BP         ; Yerel değişken alanını serbest bırak
    POP  BP             ; Eski BP'yi geri yükle
    RET  4              ; Dön ve 4 baytlık (2 parametre) argümanı temizle
my_function ENDP
```

---

## 7.7 Yuvalanmış (Nested) Prosedür Çağrıları ve Özyineleme (Recursion) İlkeleri

Bir alt yordamın başka bir alt yordamı çağırmasına **Yuvalanmış Çağrı (Nested Call)**; bir alt yordamın doğrudan ya da dolaylı olarak kendisini çağırmasına ise **Özyineleme (Recursion)** denir.

Özyinelemede her yeni çağrı, yığında kendi bağımsız `Stack Frame`'ini oluşturur. Bu sayede her çağrı düzeyinin parametreleri ve yerel değişkenleri birbirine karışmadan saklanır. 

### Özyinelemeli Faktoriyel Hesabı ($N!$)
```assembly
; Özyinelemeli Faktoriyel Fonksiyonu: Fact(N)
; Giriş: AX = N (örneğin 4)
; Çıkış: AX = N! (24)
ORG 100h
MOV AX, 4
CALL factorial
HLT

factorial PROC
    CMP AX, 1           ; Taban Durumu (Base Case): N <= 1 mi?
    JLE base_case       ; Evetse doğrudan 1 döndür
    
    PUSH AX             ; N değerini yığına sakla
    DEC  AX             ; N - 1 hesapla
    CALL factorial      ; Recursive çağrı: Fact(N - 1) -> Sonuç AX'te döner
    
    POP  BX             ; Orijinal N değerini BX'e çek
    MUL  BX             ; AX = AX * BX => Fact(N-1) * N
    RET

base_case:
    MOV AX, 1           ; 1! = 1
    RET
factorial ENDP
```

Özyinelemeli rutinlerde **taban durumunun (base case)** doğru tanımlanması hayati önem taşır; aksi halde yığın sonsuz büyüyerek bellek taşmasına (`Stack Overflow`) yol açar.


---

# Bölüm 8: Dizi ve String İşlemleri, Blok Bellek Transferi ve XLAT

## Giriş ve Öğrenme Hedefleri

Mikroişlemci uygulamalarında metin dizeleri (strings), tamsayı dizileri (arrays), ses/görüntü tamponları (buffers) ve arama tabloları (lookup tables) gibi çok baytlı ardışık veri yapıları yoğun biçimde işlenir. Klasik döngüler (`LOOP`, `JNZ`) ile her elemanı tek tek okumak, işaretçiyi artırmak ve sayaç kontrol etmek ciddi bir çevrim yükü oluşturur. 

Intel 8086 mimarisi, bu darboğazı aşmak için donanımsal olarak optimize edilmiş **5 Temel String Primitifi (`MOVS`, `LODS`, `STOS`, `CMPS`, `SCAS`)**, bunlarla birlikte çalışan **Tekrar Önekleri (`REP`, `REPE/REPZ`, `REPNE/REPNZ`)**, otomatik işaretçi yönetimini sağlayan **Yön Bayrağı (`DF`, `CLD`, `STD`)** ve donanımsal tablo arama komutu olan **`XLAT / XLATB`** komutunu sunar.

Bu bölümde aşağıdaki temel kazanımlar elde edilecektir:
1. String ve dizi mimarisinin temelleri: `DS:SI` (Kaynak) ve `ES:DI` (Hedef) yazmaç çiftleri.
2. Yön Bayrağı (Direction Flag - DF) mekanizması: `CLD` (DF=0, ileri yönlü artış) ve `STD` (DF=1, geri yönlü azalış).
3. 5 temel string komutu: `MOVSB/MOVSW`, `LODSB/LODSW`, `STOSB/STOSW`, `CMPSB/CMPSW`, `SCASB/SCASW`.
4. Blok bellek transferi ve tekrar önekleri: `REP`, `REPE/REPZ`, `REPNE/REPNZ` ile yüksek hızlı donanımsal döngüler.
5. `XLAT / XLATB` komutu ve Arama Tablosu (Lookup Table / $AL \leftarrow [DS:BX + AL]$) dönüşüm tekniği.
6. Uygulamalı algoritmalar: Blok bellek kopyalama, metin içi karakter arama, string eşitlik karşılaştırması ve dizi en büyük/en küçük elemanını bulma.

---

## 8.1 Dizi ve String Mimarisi: DS:SI ve ES:DI Yazmaç Çiftleri

8086 mimarisinde bir "string" terimi, bellekte ardışık olarak sıralanmış baytlar (`BYTE`) veya kelimeler (`WORD`) dizisi anlamına gelir. Bu diziler ASCII metin karakterleri olabileceği gibi, ham sayı dizileri ya da donanım paketleri de olabilir.

String komutlarının tamamı donanımsal olarak sabitlenmiş şu iki yazmaç çiftiyle çalışır:

```
┌─────────────────────────────────────────────────────────────┐
│             STRING İŞARETÇİ YAZMAÇLARI                      │
│                                                             │
│  Kaynak İşaretçisi (Source):        DS:SI                   │
│  (Data Segment : Source Index)                              │
│                                                             │
│  Hedef İşaretçisi (Destination):    ES:DI                   │
│  (Extra Segment : Destination Index)                        │
└─────────────────────────────────────────────────────────────┘
```

### Segment Kuralları ve Override Kısıtlaması
- **Kaynak (`DS:SI`):** Varsayılan olarak `DS` segmentini kullanır. İstenirse Segment Override Prefix (`CS:`, `SS:`, `ES:`) kullanılarak başka bir segmente yönlendirilebilir.
- **Hedef (`ES:DI`):** İstisnasız **daima `ES` (Extra Segment)** ile eşleşir! Hedef için segment geçersiz kılma (override) yapılamaz; donanımsal olarak `ES:DI` çifti zorunludur.

Bu nedenle string işlemleri başlatılmadan önce `DS` ve `ES` segment yazmaçları ile `SI` ve `DI` indeks yazmaçları doğru bellek adreslerine ayarlanmalıdır:

```assembly
MOV AX, DATA_SEG
MOV DS, AX          ; Kaynak segmenti DS'ye yükle
MOV ES, AX          ; Hedef segmenti ES'ye yükle (aynı segmentte kopyalama için)
LEA SI, KAYNAK_DIZI ; Kaynak ofsetini SI'ya yükle
LEA DI, HEDEF_DIZI  ; Hedef ofsetini DI'ya yükle
```

---

## 8.2 Yön Bayrağı (Direction Flag - DF), CLD ve STD Yönetimi

String komutlarının her çalıştırılışında, işaretçi yazmaçları (`SI` ve/veya `DI`) otomatik olarak güncellenir. Bu güncellemenin **hangi yöne (ileri mi yoksa geri mi)** yapılacağını `FLAGS` yazmacının 10. biti olan **Yön Bayrağı (Direction Flag - DF)** belirler.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    YÖN BAYRAĞI (DF) VE OTOMATİK İŞARETÇİ                    │
│                                                                             │
│  CLD  (Clear Direction Flag) -> DF = 0                                      │
│  Otomatik Artış (Auto-Increment / Düşük Adresten Yüksek Adrese Doğru)       │
│  Bayt işlemi: SI <- SI + 1,  DI <- DI + 1                                   │
│  Kelime işlemi: SI <- SI + 2, DI <- DI + 2                                  │
│                                                                             │
│  STD  (Set Direction Flag)   -> DF = 1                                      │
│  Otomatik Azalış (Auto-Decrement / Yüksek Adresten Düşük Adrese Doğru)      │
│  Bayt işlemi: SI <- SI - 1,  DI <- DI - 1                                   │
│  Kelime işlemi: SI <- SI - 2, DI <- DI - 2                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### İşaretçi Güncelleme Formülleri:
1. Eğer $DF = 0$ (`CLD`):
   $$SI \leftarrow SI + \text{size}, \quad DI \leftarrow DI + \text{size}$$
2. Eğer $DF = 1$ (`STD`):
   $$SI \leftarrow SI - \text{size}, \quad DI \leftarrow DI - \text{size}$$

Burada $\text{size} = 1$ (bayt komutları için: `MOVSB`, `LODSB`, `STOSB`, `CMPSB`, `SCASB`) veya $\text{size} = 2$ (kelime komutları için: `MOVSW`, `LODSW`, `STOSW`, `CMPSW`, `SCASW`) dir.

> **Kritik Kural: Yönü Daima Açıkça Belirtin!**  
> Bir string operasyonuna başlamadan önce yön bayrağının önceki işlemlerden hangi değerde kaldığı bilinemez. Bu nedenle her string işleminden önce mutlaka `CLD` veya `STD` komutu açıkça çalıştırılmalıdır.

---

## 8.3 Beş Temel String Primitifi

8086 mimarisi, bellek transferi, bellek doldurma, okuma, arama ve karşılaştırma için 5 temel string komutu içerir:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         5 TEMEL STRING PRİMİTİFİ                            │
│                                                                             │
│  1. MOVSB / MOVSW : Bellekten belleğe taşı  (ES:DI <- DS:SI)                │
│  2. LODSB / LODSW : Bellekten akümülatöre al (AL/AX <- DS:SI)               │
│  3. STOSB / STOSW : Akümülatörden belleğe yaz (ES:DI <- AL/AX)               │
│  4. CMPSB / CMPSW : İki bellek dizesini kıyasla (DS:SI - ES:DI)             │
│  5. SCASB / SCASW : Bellekte dizeyi tara/ara   (AL/AX - ES:DI)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. MOVSB ve MOVSW (Move String Byte / Word)
Bellekteki bir hücreden başka bir hücreye veri kopyalar.
- **İşlem:**
  $$\text{Memory}[ES:DI] \leftarrow \text{Memory}[DS:SI]$$
- Ardından $SI$ ve $DI$ yön bayrağına göre 1 (bayt) veya 2 (kelime) artırılır ya da azaltılır.
- FLAGS etkilenmez.
- `MOVSB`: 1 bayt kopyalar; `MOVSW`: 2 bayt (1 kelime) kopyalar.

### 2. LODSB ve LODSW (Load String Byte / Word)
Kaynak bellekten (`DS:SI`) veriyi okuyup akümülatör yazmacına (`AL` veya `AX`) yükler.
- **İşlem:**
  - `LODSB`: $AL \leftarrow \text{Memory}[DS:SI]$ ($SI \leftarrow SI \pm 1$)
  - `LODSW`: $AX \leftarrow \text{Memory}[DS:SI]$ ($SI \leftarrow SI \pm 2$)
- $DI$ yazmacına dokunmaz; yalnızca $SI$ güncellenir.
- Genellikle `REP` önekiyle kullanılmaz (çünkü her adımda AL ezilir); bunun yerine bir döngü içinde baytları tek tek işleyip analiz etmek için kullanılır.

### 3. STOSB ve STOSW (Store String Byte / Word)
Akümülatördeki (`AL` veya `AX`) veriyi hedef belleğe (`ES:DI`) yazar.
- **İşlem:**
  - `STOSB`: $\text{Memory}[ES:DI] \leftarrow AL$ ($DI \leftarrow DI \pm 1$)
  - `STOSW`: $\text{Memory}[ES:DI] \leftarrow AX$ ($DI \leftarrow DI \pm 2$)
- $SI$ yazmacına dokunmaz; yalnızca $DI$ güncellenir.
- Bellekte belirli bir bloğu sıfırlamak (sıfırla doldurmak) veya sabit bir değerle başlatmak (örneğin ekrana boşluk karakteri basmak) için `REP STOSB` şeklinde sıkça kullanılır.

### 4. CMPSB ve CMPSW (Compare String Byte / Word)
İki bellek bloğundaki baytları veya kelimeleri birbirinden çıkararak (`DS:SI` eksi `ES:DI`) karşılaştırır.
- **İşlem:**
  $$\text{Temp} = \text{Memory}[DS:SI] - \text{Memory}[ES:DI]$$
- Sonuç belleğe yazılmaz, atılır; ancak `FLAGS` yazmacı (özellikle `ZF`, `CF`, `SF`) güncellenir!
- Ardından hem $SI$ hem de $DI$ otomatik olarak güncellenir.
- Eğer iki eleman eşitse $ZF = 1$ olur.

### 5. SCASB ve SCASW (Scan String Byte / Word)
Hedef bellek hücresindeki (`ES:DI`) veriyi akümülatör (`AL` veya `AX`) ile karşılaştırarak tarar.
- **İşlem:**
  $$\text{Temp} = AL - \text{Memory}[ES:DI] \quad (\text{veya } AX - \text{Memory}[ES:DI])$$
- Sonuç belleğe yazılmaz; `FLAGS` güncellenir.
- Yalnızca $DI$ güncellenir ($SI$ değişmez).
- Bir metin dizesi içinde belirli bir karakteri (örneğin satır sonu `00h` veya `$` karakterini) aramak için kullanılır.

### String Primitifleri Karşılaştırma Tablosu

| Komut | Kaynak | Hedef | Güncellenen İşaretçiler | FLAGS Etkisi | Temel Amacı |
|:---|:---:|:---:|:---:|:---:|:---|
| **MOVSB / MOVSW** | `DS:SI` | `ES:DI` | `SI` ve `DI` | Etkilenmez | Blok bellek kopyalama |
| **LODSB / LODSW** | `DS:SI` | `AL` / `AX` | Yalnızca `SI` | Etkilenmez | Bellekten eleman okuma |
| **STOSB / STOSW** | `AL` / `AX` | `ES:DI` | Yalnızca `DI` | Etkilenmez | Bellek bloğunu doldurma |
| **CMPSB / CMPSW** | `DS:SI` | `ES:DI` | `SI` ve `DI` | CF, ZF, SF, OF, AF, PF | İki dizeyi karşılaştırma |
| **SCASB / SCASW** | `AL` / `AX` | `ES:DI` | Yalnızca `DI` | CF, ZF, SF, OF, AF, PF | Dizede karakter arama |

---

## 8.4 Tekrar Önekleri: REP, REPE/REPZ, REPNE/REPNZ

String komutlarının gerçek gücü, komutun önüne 1 baytlık bir **Tekrar Öneki (Repeat Prefix)** eklendiğinde ortaya çıkar. Tekrar öneki eklendiğinde işlemci, komutu donanımsal bir iç döngü şeklinde `CX` sayacı sıfırlanana dek otomatik olarak yürütür.

```
┌─────────────────────────────────────────────────────────────┐
│                       TEKRAR ÖNEKLERİ                       │
│                                                             │
│  1. REP            : Koşulsuz tekrar (CX != 0 iken)         │
│  2. REPE  / REPZ   : Eşitken tekrar (CX != 0 VE ZF == 1)    │
│  3. REPNE / REPNZ  : Eşit değilken tekrar (CX != 0 VE ZF==0)│
└─────────────────────────────────────────────────────────────┘
```

### 1. REP (Repeat While CX $\neq$ 0)
Koşulsuz tekrar önekidir. Genellikle `MOVSB/MOVSW` ve `STOSB/STOSW` komutlarıyla birlikte kullanılır.
- **Çalışma Algoritması:**
  1. $CX == 0$ ise döngüyü sonlandır ve sıradaki komuta geç.
  2. String komutunu yürüt (`MOVSB` veya `STOSB`).
  3. $CX \leftarrow CX - 1$ yap.
  4. 1. Adıma geri dön.
- `FLAGS` yazmacını doğrudan etkilemez.

```assembly
; 100 baytlık bellek bloğunu kopyalama:
CLD                 ; İleri yön (DF = 0)
MOV CX, 100         ; Sayaç = 100 bayt
LEA SI, KAYNAK_BLOK ; DS:SI kaynak
LEA DI, HEDEF_BLOK  ; ES:DI hedef
REP MOVSB           ; 100 baytı donanımsal azami hızda kopyalar!
```

### 2. REPE / REPZ (Repeat While Equal / Zero)
Karşılaştırma komutları (`CMPSB/CMPSW` ve `SCASB/SCASW`) ile birlikte kullanılır.
- **Çalışma Algoritması:**
  Döngü şu iki koşuldan biri bozulana kadar devam eder:
  - $CX == 0$ olduğunda (tüm dize incelendi, fark bulunamadı)
  - VEYA $ZF == 0$ olduğunda (farklı bir karakter bulundu!)

```assembly
; İki string dizisinin birebir eşitliğini kontrol etme:
CLD
MOV CX, 50          ; En fazla 50 karakter karşılaştır
LEA SI, STR1
LEA DI, STR2
REPE CMPSB          ; Karakterler eşit olduğu sürece (ZF=1) devam et
JZ ESIT             ; Döngü bittiğinde hala ZF=1 ise stringler tamamen eşittir!
; ZF=0 ise ilk farklı karakterde döngüden çıkılmıştır.
```

### 3. REPNE / REPNZ (Repeat While Not Equal / Not Zero)
Arama işlemlerinde (`SCASB/SCASW`) aranan karakter bulunana kadar ilerlemek için kullanılır.
- **Çalışma Algoritması:**
  Döngü şu iki koşuldan biri gerçekleşene kadar devam eder:
  - $CX == 0$ olduğunda (arandı ama bulunamadı)
  - VEYA $ZF == 1$ olduğunda (aranan karakter BULUNDU!)

```assembly
; Bir string içinde 'A' (41h) karakterini arama:
CLD
MOV CX, 100         ; Azami 100 karakter tara
MOV AL, 'A'         ; Aranan karakter
LEA DI, METIN_DIZI  ; ES:DI taranacak bellek
REPNE SCASB         ; 'A' bulunmadığı sürece (ZF=0) ilerle
JZ BULUNDU          ; ZF=1 ise 'A' karakteri bulundu!
; ZF=0 ise 100 karakter içinde 'A' yoktur.
```

---

## 8.5 XLAT / XLATB Komutu ve Arama Tablosu (Lookup Table)

`XLAT` (Translate) veya `XLATB` komutu, 8086 mimarisinin donanımsal tablo çeviri komutudur. Tek bir çevrimde bir kodu başka bir koda dönüştürmek için tasarlanmıştır.

```assembly
XLAT            ; veya XLATB
```

### Donanımsal Çalışma Prensibi

`XLAT` komutu hiçbir operand almaz. Donanımsal olarak şu iki yazmaçla sabit çalışır:
- **`BX` (Base Register):** Çeviri tablosunun başlangıç ofset adresini tutar (`DS:BX`).
- **`AL` (Accumulator Low):** Tablodan okunacak elemanın **indisini (0-255)** tutar.

Komut çalıştırıldığında şu işlem tek bir hamlede gerçekleşir:
$$EA = BX + AL$$
$$AL \leftarrow \text{Memory}[DS:EA] = \text{Memory}[DS:BX + AL]$$

İşlem sonucunda `AL`'nin eski indis değeri ezilir ve yerine tablonun o indisinde bulunan dönüştürülmüş bayt yazılır! FLAGS yazmacı etkilenmez.

```
                   ┌──────────────────────────────────────┐
   BX ────────────►│  İndis 0: Tablo Elemanı 0            │
                   ├──────────────────────────────────────┤
                   │  İndis 1: Tablo Elemanı 1            │
                   ├──────────────────────────────────────┤
   BX + AL ───────►│  İndis 2: İstenen Dönüşüm Değeri     │ ──┐
                   ├──────────────────────────────────────┤   │
                   │  İndis 3: Tablo Elemanı 3            │   │
                   └──────────────────────────────────────┘   │
                                                              ▼
                                                   Yeni AL İçeriği!
```

### XLAT Kullanım Alanları:
1. **7-Segment Gösterge Kod Çözümü:** 0-9 arası rakamları display LED segment baytlarına çevirme.
2. **Karakter Şifreleme / Deşifreleme (Substitution Cipher):** ASCII karakterleri yerine şifreli harfleri koyma.
3. **EBCDIC - ASCII Dönüşümü:** Eski IBM anaçatı (mainframe) kodlamasını ASCII'ye çevirme.
4. **Trigonometrik / Matematiksel Arama Tabloları:** Sinüs/Kosinüs değerlerini float hesaplamak yerine tablodan anında çekme.

#### Örnek: Hexadecimal Sayıyı ASCII Karaktere Çevirme
```assembly
; 0-15 arasındaki bir sayıyı '0'-'9', 'A'-'F' ASCII karakterine çevirme:
HEX_TABLO DB '0123456789ABCDEF' ; 16 baytlık arama tablosu

LEA BX, HEX_TABLO   ; Tablo başlangıç ofsetini BX'e yükle
MOV AL, 0Bh         ; AL = 11 (Onaltılık B harfi aranıyor)
XLAT                ; AL <- [BX + 11] = 'B' (42h ASCII) yüklenir!
; Sonuç: AL = 'B'
```

---

## 8.6 Uygulamalı Dizi Algoritmaları

### Algoritma 1: Yüksek Hızlı Blok Bellek Kopyalama (Memcpy)
```assembly
ORG 100h
; 256 baytlık veri bloğunu kopyalayalım
MOV AX, 1000h
MOV DS, AX
MOV ES, AX

LEA SI, KAYNAK_TAMPON ; DS:SI
LEA DI, HEDEF_TAMPON  ; ES:DI
MOV CX, 128           ; 128 kelime = 256 bayt

CLD                   ; İleri yön
REP MOVSW             ; 16-bit kelimelerle 2 kat hızlı transfer!
HLT

KAYNAK_TAMPON DB 256 DUP(55h)
HEDEF_TAMPON  DB 256 DUP(00h)
```

### Algoritma 2: Metin İçinde Karakter Sayma ve Arama
```assembly
ORG 100h
; Metin içindeki 'e' harflerini sayan program
CLD
LEA DI, METIN
MOV CX, UZUNLUK
MOV DX, 0            ; DX = sayaç (kaç adet 'e' var)

TEKRAR_ARA:
MOV AL, 'e'
REPNE SCASB          ; 'e' bulana kadar tara
JNZ BITIR            ; CX bitti ve bulunamadıysa çık

INC DX               ; Bir adet 'e' bulundu, sayacı artır
JCXZ BITIR           ; String sonuna gelindiyse bitir
JMP TEKRAR_ARA       ; Kaldığı yerden aramaya devam et

BITIR:
HLT

METIN   DB 'microprocessor assembly language programming'
UZUNLUK EQU $ - METIN
```

### Algoritma 3: Dizi En Büyük Elemanı Bulma (Max Search)
```assembly
ORG 100h
; 8-bitlik dizideki en büyük elemanı bulur (AL = Max)
LEA SI, DIZI
MOV CX, ELEMAN_SAYISI
CLD

LODSB                ; İlk elemanı AL'ye çek (başlangıç Max değeri)
DEC CX               ; 1 eleman okundu, kaldı CX-1

DONGU:
JCXZ TAMAM
LODSB                ; Sıradaki elemanı AL'ye çek
CMP AL, AH           ; AH'de o ana kadarki Max tutuluyor olsun
JBE DEVAM            ; AL <= AH ise yeni max değil
MOV AH, AL           ; AL > AH ise yeni Max AH = AL olur
DEVAM:
LOOP DONGU

TAMAM:
MOV AL, AH           ; En büyük sayıyı AL'ye al
HLT

DIZI          DB 12h, 45h, 89h, 23h, 9Fh, 3Ah, 05h
ELEMAN_SAYISI EQU $ - DIZI
```

---

## 8.7 Bölüm Özeti ve Çalışma Soruları

### Bölüm Özeti
- String komutları `DS:SI` (kaynak) ve `ES:DI` (hedef) yazmaç çiftleriyle çalışır; hedef segmenti daima `ES` olmak zorundadır.
- Yön Bayrağı (DF): `CLD` ile $DF=0$ (otomatik artış $SI++, DI++$), `STD` ile $DF=1$ (otomatik azalış $SI--, DI--$).
- 5 temel primitif: `MOVS` (blok kopyalama), `LODS` (akümülatöre yükleme), `STOS` (belleğe doldurma), `CMPS` (iki bloğu karşılaştırma), `SCAS` (blokta arama).
- Tekrar önekleri: `REP` ($CX \neq 0$), `REPE` ($CX \neq 0 \land ZF=1$), `REPNE` ($CX \neq 0 \land ZF=0$).
- `XLAT` komutu $AL \leftarrow [DS:BX + AL]$ işlemini tek hamlede yaparak tablo çevirisi sağlar.

### Çözümlü Çalışma Soruları

**Soru 1:**  
`DF = 0`, `CX = 4`, `AL = 0AAh`, `ES = 2000h` ve `DI = 0100h` iken aşağıdaki komut çalıştırılıyor:
```assembly
REP STOSB
```
Bu komut tamamlandıktan sonra:  
a) `DI` yazmacının son değeri ne olur?  
b) `CX` yazmacının son değeri ne olur?  
c) Belleğin hangi fiziksel adreslerine hangi bayt değerleri yazılmıştır?

*Çözüm:*  
a) `DF = 0` olduğu için `STOSB` her adımda `DI`'yı 1 artırır. 4 kez tekrarlandığından:  
Son $\text{DI} = 0100h + 4 = 0104h$.  
b) `REP` öneki `CX` her adımda 1 azaltarak 0 olduğunda durur. Sonuç: $CX = 0000h$.  
c) `ES:DI` başlangıç fiziksel adresi: $PA = (2000h \times 16) + 0100h = 20100h$.  
Yazılan adresler:  
- `20100h`: `0AAh`  
- `20101h`: `0AAh`  
- `20102h`: `0AAh`  
- `20103h`: `0AAh`

**Soru 2:**  
Bir `REPE CMPSB` komut dizisi çalıştırıldıktan sonra döngünün neden bittiğini (iki dize birbirine tam eşit olduğu için mi, yoksa farklı bir karakterle karşılaşıldığı için mi) programcı hangi bayrağı test ederek anlar?

*Çözüm:*  
`REPE` öneki iki şarttan biri bozulduğunda durur: $CX=0$ veya $ZF=0$.  
Eğer döngü bittiğinde **$ZF = 1$** ise, dizeler incelenen karakterler boyunca **birbirine tamamen eşittir** ($CX=0$ olana kadar hiç fark çıkmamıştır).  
Eğer döngü bittiğinde **$ZF = 0$** ise, işlemci **farklı iki karakterle karşılaşmış** ve döngü erken kırılmıştır. Programcı `JZ` veya `JNZ` komutu ile durumu kontrol eder.


---

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

# BÖLÜM 10: Kesmeler, Kesme Vektör Tablosu (IVT) ve İstisna Mimarisi (Interrupts, IVT Architecture & Exceptions)

Mikroişlemcilerin normal program akışını yürütürken harici olaylara anında tepki verebilmesi, zaman uyumsuz (asenkron) çevre birimlerini yönetebilmesi ve çalışma zamanı hatalarını (sıfıra bölme gibi) güvenle yakalayabilmesi **Kesme (Interrupt)** ve **İstisna (Exception)** mimarisi sayesinde mümkündür. 

Polling (meşgul bekleme) yönteminin işlemci kaynaklarını boşa harcamasını engelleyen kesme mekanizması; donanım aygıtlarının ihtiyaç duyduklarında CPU'ya doğrudan sinyal göndermesini ve işletim sisteminin güvenli çekirdek hizmetleri sunmasını sağlar.

---

## 10.1 Kesme (Interrupt) ve İstisna (Exception) Tanımı, Donanım ve Yazılım Kesmelerinin Farkları

### Kesme (Interrupt) Nedir?
Kesme, işlemciye dışarıdan (harici donanım pinlerinden) veya içeriden (özel bir komutla) gönderilen ve o anda yürütülen programı geçici olarak durduran bir sinyaldir. İşlemci mevcut durumunu (FLAGS ve CS:IP) yığına kaydeder, ilgili olayı karşılamak üzere hazırlanmış özel bir alt programa—**Kesme Servis Rutini (ISR - Interrupt Service Routine)**—dallanır ve işlem bittiğinde kaldığı noktaya geri döner.

### İstisna (Exception) Nedir?
İstisnalar, işlemcinin komut yürütme döngüsü sırasında doğrudan komutun kendisinden kaynaklanan dahili senkron olaylardır:
1. **Hata (Fault):** Komut yürütülmeden önce tespit edilen ve düzeltilebilir durumlardır (örneğin sayfa hatası - page fault). Düzeltildikten sonra aynı komut yeniden denenir.
2. **Tuzak (Trap):** Komut yürütüldükten hemen sonra tetiklenen istisnalardır (örneğin tek adım - single step tuzak bayrağı `TF=1` veya `INT 3` kesme noktası). Dönüş adresi bir sonraki komuttur.
3. **İptal (Abort):** Donanım arızası veya kritik tutarsızlıklar nedeniyle programın kurtarılamaz şekilde sonlandırılmasıdır.

### Kesme Kaynaklarının Sınıflandırılması:
- **Harici Donanım Kesmeleri (Hardware Interrupts):** Çevre birimlerinin CPU'nun `INTR` veya `NMI` fiziksel pinlerini lojik 1 yapmasıyla oluşur (asenkron).
- **Yazılım Kesmeleri (Software Interrupts):** Programcının kodun içine açıkça yazdığı `INT n` (örneğin `INT 21h`, `INT 10h`) veya `INTO` komutları ile tetiklenir (senkron).

---

## 10.2 Kesme Vektör Tablosu (IVT - Interrupt Vector Table) Mimarisi

Intel 8086 mimarisinde toplam **256 vektör (256 kesme)** (`0` ile `255` arası) tanımlanmıştır. Her bir kesmenin servis rutinini (`ISR`) bellekte bulabilmek için Real Mode bellek alanının en başında özel bir tablo yer alır: **Kesme Vektör Tablosu (Interrupt Vector Table - IVT)**.

```
       +-------------------------------------------------------------+
       |               KESME VEKTÖR TABLOSU (IVT) HARİTASI          |
       +-------------------------------------------------------------+
       Fiziksel Adres    Vektör No     İçerik (4 Bayt Far Pointer)
       -------------------------------------------------------------
       003FFh          |             | Tip 255 ISR Segment (High)
       003FEh          | Tip 255     | Tip 255 ISR Segment (Low)
       003FDh          | (Kullanıcı) | Tip 255 ISR Offset  (High)
       003FCh          |             | Tip 255 ISR Offset  (Low)
       ...             | ...         | ...
       00023h          |             | Tip 8 ISR Segment (Timer)
       ...             | ...         | ...
       00013h          |             | Tip 4 ISR Segment (INTO)
       ...             | Tip 4-0     | ...
       00003h          |             | Tip 0 ISR Segment (High)
       00002h          | Tip 0       | Tip 0 ISR Segment (Low)
       00001h          | (Sıfıra     | Tip 0 ISR Offset  (High)
       00000h          |  Bölme)     | Tip 0 ISR Offset  (Low)
       +-------------------------------------------------------------+
```

### IVT Bellek Alanı ve Vektör Hesaplama Formülü
- **Konum:** Belleğin en alt adresi olan `00000h` ile `003FFh` arasındadır (tam 1024 bayt = 1 KB).
- **Vektör Yapısı:** Her vektör, ilgili ISR'nin 32-bitlik uzak adresini (`far pointer: CS:IP`) saklar:
  - 2 Bayt: `Offset` (Düşük anlamlı bayt önce - Little-Endian)
  - 2 Bayt: `Segment` (Düşük anlamlı bayt önce)
  - Her vektör tam 4 bayt yer kaplar.

Herhangi bir $N$ kesme tipi (Type $N$) için IVT başlangıç fiziksel adres formülü:
$$IVT Adresi = Tip * 4\n\text{IVT Adresi} = \text{Tip} \times 4$$

Örneğin Tip 8 kesmesinin IVT adresi: $8 \times 4 = 32 = 00020h$'dir. Bu adresteki 4 bayt sırasıyla:
- `00020h`: IP Düşük Bayt
- `00021h`: IP Yüksek Bayt
- `00022h`: CS Düşük Bayt
- `00023h`: CS Yüksek Bayt

---

## 10.3 Intel Tarafından Rezerve Edilmiş Özel Kesmeler (Tip 0 – Tip 4)

Intel, 8086 mimarisinde ilk 5 kesme tipini (Tip 0'dan Tip 4'e kadar) işlemcinin dahili mimari denetimleri ve temel istisnaları için rezerve etmiştir:

| Kesme Tipi | Vektör Adresi (IVT) | Tetiklenme Kaynağı | Açıklama ve Kullanım Amacı |
| :---: | :---: | :--- | :--- |
| **Type 0 (Tip 0)** | `00000h` | Donanımsal / Dahili | **Divide by Zero (Sıfıra Bölme Hatası):** `DIV` veya `IDIV` komutunda bölen sıfır olduğunda veya bölüm hedef yazmaca sığmadığında (Quotient Overflow) otomatik tetiklenir. |
| **Type 1 (Tip 1)** | `00004h` | Dahili Tuzak (Trap) | **Single Step (Tek Adım Hata Ayıklama):** `FLAGS` yazmacındaki Tuzak Bayrağı (`TF = 1`) yapıldığında, işlemci her komutu yürüttükten sonra otomatik olarak bu kesmeyi çağırarak hata ayıklayıcılara (debugger) kontrol verir. |
| **Type 2 (Tip 2)** | `00008h` | Harici Donanım Pini | **NMI (Non-Maskable Interrupt):** Maskelenemez Donanım Kesmesi. Kritik güç kesintileri, RAM parite hataları ve ölümcül sistem arızalarında işlemcinin `NMI` pinine gelen kenar tetiklemeli sinyalle devreye girer. `IF` bayrağı ile engellenemez. |
| **Type 3 (Tip 3)** | `0000Ch` | Özel 1-Baytlık Komut | **Breakpoint (Kesme Noktası):** Hata ayıklayıcıların program kodunun içine geçici olarak yerleştirdiği özel 1-baytlık `INT 3` (`0xCC` opcode) komutudur. Tek baytlık olması sayesinde herhangi bir komutun ilk baytının yerine atomik olarak yazılabilir. |
| **Type 4 (Tip 4)** | `00010h` | Koşullu Yazılım Komutu| **Overflow Trap (INTO Komutu):** Aritmetik işlemlerde işaretli taşma meydana geldiğinde (`OF = 1`), hemen ardından `INTO` (Interrupt on Overflow) komutu çalıştırılırsa bu kesme tetiklenir. `OF = 0` ise hiçbir şey yapmaz. |

---

## 10.4 Donanım Kesmeleri: Maskelenebilir (INTR) vs. Maskelenemez (NMI)

8086 mikroişlemcisinde iki adet fiziksel kesme pini bulunur:

### 1. Maskelenebilir Kesmeler (INTR - Interrupt Request)
İşlemcinin `INTR` pini lojik 1 yapıldığında işlemci harici bir kesme talebi alır. Ancak işlemcinin bu kesmeyi kabul edip etmeyeceği `FLAGS` yazmacındaki **Kesme Bayrağı (Interrupt Flag - IF)** tarafından denetlenir:
- `STI` (Set Interrupt Flag): $IF \leftarrow 1$ yapar. Maskelenebilir kesmeler kabul edilir.
- `CLI` (Clear Interrupt Flag): $IF \leftarrow 0$ yapar. Maskelenebilir kesmeler (`INTR`) tamamen devre dışı bırakılır (maskelenir).
- Kritik zamanlı kod bloklarında (örneğin yığın işaretçisi değiştirilirken veya donanım portlarına atomik veri yazılırken) kesmeler `CLI` ile kapatılır ve işlem bitince `STI` ile açılır.

### 2. Maskelenemez Kesmeler (NMI - Non-Maskable Interrupt)
- Pozitif kenar tetiklemelidir (0'dan 1'e geçişte tetiklenir).
- `IF` bayrağının durumundan (`CLI` veya `STI`) kesinlikle etkilenmez; işlemci çalışır durumda olduğu sürece daima kabul edilir.
- Yalnızca sistemin donanımsal varlığını tehdit eden kritik arızalarda (bellek parite hatası, elektrik voltaj düşmesi) kullanılır.

---

## 10.5 8086 Kesme Yanıt ve Yürütme Sırası: Adım Adım Donanım Algoritması

Bir kesme sinyali (veya `INT n` komutu) geldiğinde 8086 CPU aşağıdaki donanımsal adımları kesin bir sıra ile otomatik olarak yürütür:

```
+-----------------------------------------------------------------------------------------+
|                  8086 KESME YÜRÜTME DÖNGÜSÜ (HARDWARE INTERRUPT SEQUENCE)               |
+-----------------------------------------------------------------------------------------+

  1. Mevcut Komutun Bitişi:
     İşlemci o anda yürütmekte olduğu komutu tamamlar (HLT hariç).
     
  2. Bayrakların Saklanması:
     SP <-- SP - 2
     Memory[SS:SP] <-- FLAGS (16-bitlik durum ve kontrol bayrakları yığına itilir)
     
  3. Kesme ve Tuzak Bayraklarının Kapatılması:
     IF <-- 0 (Yeni bir INTR kesmesinin araya girmesi engellenir)
     TF <-- 0 (Single step modu kapatılır)
     
  4. Geri Dönüş Kod Adresinin Saklanması:
     SP <-- SP - 2
     Memory[SS:SP] <-- CS (Mevcut Kod Segmenti yığına itilir)
     SP <-- SP - 2
     Memory[SS:SP] <-- IP (Sıradaki komutun ofseti yığına itilir)
     
  5. Vektör Adresinin Alınması ve ISR'ye Atlama:
     Donanım kesmesinde INTA# döngüsüyle veri yolundan Tip N numarası okunur;
     yazılım kesmesinde komutun içindeki n sayısı alınır.
     Vektör_Adresi = N * 4
     IP <-- Memory[00000h + N*4]      (Yeni IP çekilir)
     CS <-- Memory[00000h + N*4 + 2]  (Yeni CS çekilir)
     
  6. ISR Kodunun Yürütülmesi
     
  7. IRET (Interrupt Return) Komutu ile Dönüş:
     IP    <-- Memory[SS:SP]; SP <-- SP + 2
     CS    <-- Memory[SS:SP]; SP <-- SP + 2
     FLAGS <-- Memory[SS:SP]; SP <-- SP + 2 (Eski bayraklar ve IF aynen geri yüklenir)
```

> **IRET vs RET Farkı:** Standart bir `RET` komutu yığından yalnızca `IP` (veya `CS:IP`) değerini çeker. Oysa kesme anında yığına ek olarak `FLAGS` yazmacı da atılmıştır. Bu nedenle bir kesme servis rutini zorunlu olarak `IRET` komutuyla bitmelidir; `IRET` yığından sırasıyla `IP`, `CS` ve `FLAGS` yazmaçlarını çekerek işlemcinin kesme öncesindeki tüm durumunu eksiksiz restore eder.

---

## 10.6 Kesme Servis Rutinleri (ISR) Tasarım İlkeleri ve Bağlam Saklama

Kesme servis rutinleri tasarlanırken şu ilkelere titizlikle uyulmalıdır:
1. **Bağlam Saklama (Context Saving):** ISR içinde değiştirilecek olan tüm genel amaçlı yazmaçlar (`AX, BX, CX, DX, SI, DI, DS, ES`) rutinin en başında yığına `PUSH` edilmeli; `IRET`'ten hemen önce ters sırada `POP` edilmelidir.
2. **Kısa ve Hızlı Yürütme:** ISR içinde uzun döngülerden, ağır matematiksel işlemlerden ve bloke edici G/Ç işlemlerinden kaçınılmalıdır.
3. **Yeniden Giriş ve Yuvalanmış Kesmeler:** Eğer yüksek öncelikli bir kesmenin mevcut ISR'yi kesmesine izin verilecekse, bağlam saklandıktan hemen sonra `STI` komutu ile kesmeler yeniden açılabilir.

```assembly
; Standart ve Güvenli Bir ISR Şablonu
my_custom_isr PROC
    ; --- Bağlam Saklama (Context Saving) ---
    PUSH AX
    PUSH BX
    PUSH CX
    PUSH DX
    PUSH DS
    
    ; Veri Segmentini Ayarla
    MOV  AX, @DATA
    MOV  DS, AX
    
    ; --- Kesme İşlemi Gövdesi ---
    ; (Donanımdan veri oku veya bayrakları güncelle)
    
    ; PIC'e Kesme Sonu (EOI) Bildirimi Gönder
    MOV  AL, 20h
    OUT  20h, AL
    
    ; --- Bağlam Geri Yükleme ---
    POP  DS
    POP  DX
    POP  CX
    POP  BX
    POP  AX
    
    ; Kesmeden Dönüş
    IRET
my_custom_isr ENDP
```

---

## 10.7 Intel 8259A Programlanabilir Kesme Denetleyicisi (PIC)

8086 mikroişlemcisinin yalnızca tek bir `INTR` pini olmasına karşın, bir bilgisayar sisteminde klavye, disk, fare, seri portlar ve sistem saati gibi çok sayıda çevre birimi kesme üretir. Bu çoklu kesme kaynaklarını yönetmek ve önceliklendirmek için **Intel 8259A PIC (Programmable Interrupt Controller)** kullanılır.

```
       +-----------------------+
 IRQ0 -| Timer (8253 PIT)      |
 IRQ1 -| Klavye (Keyboard)     |
 IRQ2 -| İkinci 8259A (Slave)  |          8086 CPU
 IRQ3 -| COM2 Seri Port        |       +------------+
 IRQ4 -| COM1 Seri Port        |------>| INTR       |
 IRQ5 -| LPT2 / Ses Kartı      |       |            |
 IRQ6 -| Disket Sürücü         |<------| INTA#      |
 IRQ7 -| LPT1 Yazıcı Portu     |       +------------+
       |                       |<=====> D0 - D7 (Vektör No)
       | Intel 8259A Master PIC|
       +-----------------------+
```

### 8259A Çalışma Mekanizması:
1. Bir cihaz `IRQ` hattını aktif eder.
2. 8259A Kesme İstek Yazmacına (`IRR - Interrupt Request Register`) bu talebi kaydeder ve Kesme Maske Yazmacı (`IMR - Interrupt Mask Register`) ile maskeli olup olmadığını kontrol eder.
3. Maskeli değilse ve önceliği yüksekse, CPU'nun `INTR` pinini lojik 1 yapar.
4. CPU iki adet $\overline{\text{INTA}}$ (Interrupt Acknowledge) darbesi üretir. İkinci darbede 8259A, sistem veri veriyoluna kesmenin tip numarasını (örneğin IRQ0 için `08h`, IRQ1 için `09h`) bayt olarak sürer.
5. CPU bu numarayı alıp $N \times 4$ formülü ile IVT'den ilgili ISR adresini çeker.
6. **EOI (End of Interrupt) Komutu:** ISR işlemi bittiğinde, 8259A'nın Hizmet İçi Yazmacındaki (`ISR - In-Service Register`) ilgili biti temizlemek için PIC'e EOI komutu (`AL = 20h` -> `OUT 20h, AL`) yazılmalıdır; aksi halde 8259A daha düşük öncelikli kesmeleri sonsuza dek bloke eder.

---

## 10.8 Standart BIOS ve DOS Kesmeleri

PC mimarisinde donanımı doğrudan programlamak yerine BIOS ROM ve DOS işletim sistemi tarafından sunulan standart kesme servisleri kullanılır:

### 1. BIOS INT 10h — Video Hizmetleri
- `AH = 0Eh`: Teletype Karakter Yazma (`AL` = Karakter ASCII kodu, ekrana yazar ve imleci ilerletir).
- `AH = 00h`: Video Modu Seçimi (`AL` = Mod numarası; örn: `03h` 80x25 renkli metin, `13h` 320x200 256 renk VGA).
- `AH = 02h`: İmleç Konumlandırma (`DH` = Satır, `DL` = Sütun, `BH` = Sayfa).

```assembly
; Ekrana 'A' Karakteri Yazdırma Örneği (BIOS INT 10h)
MOV AH, 0Eh       ; Teletype fonksiyonu
MOV AL, 'A'       ; Basılacak karakter (41h)
INT 10h           ; Video kesmesini çağır
```

### 2. BIOS INT 16h — Klavye Hizmetleri
- `AH = 00h`: Klavyeden Tuş Bekleme ve Okuma (`AL` = ASCII kodu, `AH` = Donanım Tarama Kodu / Scan Code döner).
- `AH = 01h`: Tuş Tamponu Durum Kontrolü (`ZF = 1` ise tuş yok, `ZF = 0` ise tuş hazır).

### 3. DOS INT 21h — Sistem Çağrıları (API)
- `AH = 09h`: Ekrana '$' ile Biten Dizi Yazdırma (`DS:DX` dizinin başlangıç adresini gösterir).
- `AH = 01h`: Klavyeden Karakter Okuma (Ekrana yansıtmalı / Echoed).
- `AH = 4Ch`: Programı Sonlandırma ve DOS'a Dönüş (`AL` = Çıkış hata kodu).

```assembly
; DOS INT 21h ile "Merhaba" Yazdırma ve Çıkış
ORG 100h
MOV DX, OFFSET mesaj
MOV AH, 09h       ; Dizi yazdırma fonksiyonu
INT 21h

MOV AX, 4C00h     ; AH=4Ch (Çıkış), AL=00h (Hatasız)
INT 21h

mesaj DB 'Merhaba Dunya!', 0Dh, 0Ah, '$'
```


---

# BÖLÜM 11: Doğrudan Bellek Erişimi (DMA) ve İşletim Sistemi Desteği (Direct Memory Access & Operating System Support)

Giriş/Çıkış sistemlerinde yüksek hızlı çevre birimlerinin (sabit diskler, SSD'ler, grafik kartları, yüksek hızlı ağ kartları) veri aktarım hızları muazzam boyutlara ulaşmıştır. Eğer diskteki bir dosyanın her baytı CPU tarafından `IN` ve `MOV [mem], AL` komutlarıyla tek tek okunup belleğe yazılsaydı, işlemci saniyede yüz binlerce çevrimi veri taşımakla tüketir, hesaplama gücü kilitlenir ve sistemde ciddi bir G/Ç darboğazı (I/O Bottleneck) oluşurdu.

Bu darboğazı aşmak için geliştirilen donanımsal çözüm **Doğrudan Bellek Erişimi (DMA - Direct Memory Access)** mekanizmasıdır. DMA sayesinde çevre birimleri, CPU'nun müdahalesine ihtiyaç duymaksızın doğrudan sistem belleği (RAM) ile veri alışverişi yapabilir.

---

## 11.1 Doğrudan Bellek Erişimi (DMA) Kavramı ve İşlemci Darboğazlarının Giderilmesi

Doğrudan Bellek Erişimi (DMA - Direct Memory Access), harici donanım birimlerinin sistem veriyollarını (Address, Data ve Control Bus) geçici olarak kendi denetimine alarak ana bellek ile doğrudan, yüksek hızlı blok veri transferi gerçekleştirmesidir.

```
+-----------------------------------------------------------------------------------------+
|                  İŞLEMCİ ARACILI G/Ç vs. DOĞRUDAN BELLEK ERİŞİMİ (DMA)                  |
+-----------------------------------------------------------------------------------------+

  1. Klasik Programlı / Kesmeli G/Ç (CPU Merkezli - Yavaş):
     +--------------+      IN       +----------+     MOV [mem]     +----------+
     | Çevre Birimi | ------------> | CPU (AX) | ----------------> | RAM      |
     +--------------+               +----------+                   +----------+
     (Her bayt için CPU 2 kez veriyolu çevrimi yapar: Cihaz->CPU, ardından CPU->RAM)

  2. Doğrudan Bellek Erişimi (DMA Denetleyicisi - Yüksek Hızlı):
     +--------------+                    DOĞRUDAN                   +----------+
     | Çevre Birimi | ============================================> | RAM      |
     +--------------+                                               +----------+
            ^                                                            ^
            |             +---------------------------+                  |
            +------------ | Intel 8237 DMA Controller | -----------------+
                          +---------------------------+
                          (CPU serbesttir, kendi dahili işlerini yürütür)
```

DMA transferinde CPU yalnızca transferin başlangıcında devreye girer:
1. Kaynak ve hedef adresleri DMA denetleyicisine yazar.
2. Transfer edilecek bayt/kelime sayısını belirler.
3. Okuma mı yazma mı yapılacağını (modu) yapılandırır ve transferi başlatır.
Bu adımdan sonra CPU transferden tamamen çekilir; veri aktarımını DMA denetleyicisi yönetir. Transfer tamamlandığında DMA denetleyicisi CPU'ya bir kesme (`Interrupt`) göndererek işlemin bittiğini bildirir.

---

## 11.2 Veriyolu Tahsisi ve Çakışma Yönetimi (Bus Arbitration): HOLD ve HLDA Sinyalleri

Sistemde bellek ve çevre birimlerine bağlı tek bir adres ve veri veriyolu bulunur. Aynı anda hem CPU'nun hem de DMA denetleyicisinin veriyoluna sinyal sürmesi ölümcül donanımsal çakışmalara (bus contention) yol açar. Bu nedenle veriyolunun kimin kullanımında olacağını belirlemek üzere **Veriyolu Tahsisi (Bus Arbitration)** protokolü uygulanır.

8086 mikroişlemcisinde veriyolu tahsisi iki özel pin aracılığıyla yönetilir: `HOLD` ve `HLDA`.

```
       +--------------------+                    +------------------+
       |                    |------ HOLD ------->|                  |
       | Intel 8237 DMA     |                    | 8086 CPU         |
       | Controller         |<----- HLDA --------|                  |
       +--------------------+                    +------------------+
                 |                                         |
                 +================ Veriyolları ============+
                   (Adres, Veri, Kontrol: MEMR#, MEMW#, IOR#, IOW#)
```

### HOLD ve HLDA Protokolünün İşleyiş Sırası:
1. Bir çevre birimi DMA transferi talep ettiğinde (`DREQ` pini aktif), Intel 8237 DMA Denetleyicisi 8086 CPU'nun `HOLD` (Hold Request) giriş pinini lojik 1 yapar.
2. 8086 CPU, yürütmekte olduğu mevcut veriyolu çevrimini tamamlar.
3. CPU, kendi adres, veri ve kontrol hatlarını yüksek empedans durumuna (High-Z / Float) alarak veriyollarını elektriksel olarak serbest bırakır.
4. CPU, DMA denetleyicisine `HLDA` (Hold Acknowledge) çıkış pininden lojik 1 göndererek veriyollarını devrettiğini onaylar.
5. 8237 DMA denetleyicisi veriyollarının mutlak hakimi olur; bellek okuma/yazma sinyallerini bizzat üreterek transferi gerçekleştirir.
6. Transfer bittiğinde (veya ayrılan süre dolduğunda) 8237, `HOLD` sinyalini lojik 0'a çeker. CPU da `HLDA` sinyalini keserek veriyollarını geri devralır ve normal program yürütmesine devam eder.

### DMA Transfer Modları: Çevrim Çalma vs. Blok Modu
Veriyolunun DMA denetleyicisi tarafından ne kadar süreyle tutulacağına bağlı olarak temel transfer modları şunlardır:

1. **Çevrim Çalma (Cycle Stealing Modu):**
   DMA denetleyicisi her seferinde yalnızca tek bir bayt (veya 1 kelime) transfer eder ve ardından veriyolunu derhal CPU'ya iade eder. Eğer CPU o çevrimde belleğe erişmiyorsa, DMA transferi CPU'yu hiç yavaşlatmadan gerçekleşir ("çevrim çalınır"). Gerçek zamanlı sistemlerde CPU'nun kilitlenmesini önlemek için tercih edilir.
2. **Blok Modu (Burst Mode):**
   DMA denetleyicisi veriyolunu devraldıktan sonra, tüm veri bloğu (örneğin 64 KB) tamamen aktarılana kadar veriyolunu bırakmaz. Transfer son derece yüksek hızda biter; ancak transfer süresince CPU bellek erişimi yapamaz ve beklemek zorunda kalır.
3. **Şeffaf Mod (Transparent Mode):**
   DMA denetleyicisi sistem veriyolunu yalnızca ve yalnızca CPU dahili bir işlemle meşgulken ve veriyolunu kullanmıyorken ele geçirir. CPU başarımında sıfır kayıp oluşur ancak en yavaş transfer modudur.

---

## 11.3 Intel 8237 DMA Denetleyicisi Mimarisi ve İç Yazmaçları

IBM PC mimarisinde endüstri standardı haline gelen **Intel 8237**, yüksek hızlı 4 kanallı bir programlanabilir DMA denetleyicisidir (Programmable DMA Controller).

```
               +--------------------------------------+
  DREQ0, DACK0 | Channel 0 (RAM Yenileme / DRAM Ref.) |
  DREQ1, DACK1 | Channel 1 (Seri Port / Kullanıcı)    |
  DREQ2, DACK2 | Channel 2 (Disket / Floppy Disk)     |
  DREQ3, DACK3 | Channel 3 (Sabit Disk / Hard Disk)   |
               +--------------------------------------+
               | Intel 8237 Dahili Yazmaç Bloğu       |
               +--------------------------------------+
```

### 8237 Bağımsız Kanalları:
- **Kanal 0 (Channel 0):** Klasik PC mimarisinde dinamik RAM (DRAM) bellek hücrelerinin periyodik olarak tazelenmesi (RAM Refresh) için tahsis edilmiştir.
- **Kanal 1 (Channel 1):** Boş / Yedek çevre birimleri veya ses kartları için ayrılmıştır.
- **Kanal 2 (Channel 2):** Disket Sürücü Denetleyicisi (Floppy Disk Controller - FDC) için standart kanaldır.
- **Kanal 3 (Channel 3):** Sabit disk veya yüksek hızlı çevre birimleri için kullanılır.

### 8237 DMA Denetleyicisi Dahili Yazmaç Haritası Tablosu

Her bir kanalın transfer parametrelerini yönetmek ve genel denetleyiciyi programlamak için aşağıdaki dahili yazmaçlar kullanılır:

| Yazmaç Adı (Register Name) | Boyut | Kanal İlişkisi | Fonksiyon ve Görevi |
| :--- | :---: | :---: | :--- |
| **Current Address Register (CAR)** | 16-bit | Kanal Başına 1 Adet | O anda transfer edilmekte olan baytın bellek adresini tutar; her transferde otomatik artar/azalır. |
| **Base Address Register (BAR)** | 16-bit | Kanal Başına 1 Adet | Transferin başlangıç adresini saklar; otomatik ilklendirmede (auto-initialization) adresi geri yükler. |
| **Current Word Count Register (CWCR)** | 16-bit | Kanal Başına 1 Adet | Transfer edilecek kalan bayt sayısını tutar; her transferde 1 azalır. 0'dan geriye sayınca TC üretir. |
| **Base Word Count Register (BWCR)** | 16-bit | Kanal Başına 1 Adet | Toplam transfer boyutunu ($N - 1$) saklar; otomatik tekrar başlatmada sayaç buradaki değerle dolar. |
| **Command Register (Komut Yazmacı)** | 8-bit | Ortak (Tüm Kanallar) | 8237 genel çalışma parametrelerini (Memory-to-Memory transfer aktifliği, DREQ/DACK lojik seviyeleri) belirler. |
| **Mode Register (Mod Yazmacı)** | 8-bit | Ortak (Kanal Seçimli)| İlgili kanalın transfer tipini (Okuma/Yazma/Doğrulama) ve modunu (Demand, Single, Block, Cascade) tanımlar. |
| **Mask Register (Maske Yazmacı)** | 8-bit | Ortak (Kanal Seçimli)| Belirli kanalların donanımsal `DREQ` taleplerini tek tek veya topluca maskelemek (engellemek) için kullanılır. |
| **Request Register (İstek Yazmacı)** | 8-bit | Ortak (Kanal Seçimli)| Donanımsal pin olmaksızın yazılım yoluyla bir DMA transfer talebi (Software DMA Request) başlatır. |
| **Status Register (Durum Yazmacı)** | 8-bit | Ortak (Tüm Kanallar) | Hangi kanalların Terminal Count (TC) seviyesine ulaştığını ve hangi kanallarda bekleyen istek olduğunu bildirir. |

> **Terminal Count (TC) Kuralı:** 8237'de transfer edilecek bayt sayısı $N$ ise, Word Count yazmacına daima $N - 1$ değeri yazılır. Örneğin 64 bayt aktarılacaksa `CWCR = 63 = 3Fh` yapılır. Sayaç $0000h$'dan $FFFFh$'a düştüğünde donanımsal **Terminal Count (TC)** pini lojik 1 olur ve transfer tamamlanır.

---

## 11.4 DMA Veri Transfer Adımları

Tipik bir çevre biriminden belleğe (Peripheral-to-Memory) DMA okuma transferi adım adım şu şekilde icra edilir:

1. **Cihaz Talebi:** Çevre birimi, tamponundaki veriyi aktarmaya hazır olduğunda 8237'nin ilgili `DREQ` (DMA Request) hattını aktif eder.
2. **İşlemci Talebi:** 8237, 8086 CPU'nun `HOLD` pinine lojik 1 gönderir.
3. **Veriyolu Terki:** CPU çevrimini bitirir, veriyollarını boşaltır ve `HLDA` onayını verir.
4. **Cihaz Onayı:** 8237, çevre birimine `DACK#` (DMA Acknowledge) sinyali göndererek transferin başladığını bildirir.
5. **Doğrudan Veri Akışı:** 8237 adres veriyoluna bellek adresini sürer, aynı anda çevre birimine G/Ç Okuma (`IOR#`), belleğe ise Bellek Yazma (`MEMW#`) sinyallerini gönderir.
6. Veri, çevre biriminden çıkarak veri veriyolu üzerinden **doğrudan belleğe** akar (CPU'ya hiç uğramaz).
7. Sayaç 1 azaltılır, adres 1 artırılır. Sayaç sıfırlandığında `TC` sinyali üretilir, `HOLD` bırakılır ve CPU'ya bir kesme ile transfer sonu müjdelenir.

---

## 11.5 DMA ve Önbellek Tutarlılığı (Cache Coherency) Problemi

Modern işlemcilerde işlemci çekirdeği ile ana bellek arasında yüksek hızlı önbellekler (`L1, L2, L3 Cache`) bulunur. DMA denetleyicisi doğrudan ana belleğe (RAM) yazdığında veya RAM'den okuduğunda ciddi bir **Önbellek Tutarlılığı (Cache Coherency)** sorunu ortaya çıkar:

```
               +-------------------+
               |     8086 CPU      |
               +-------------------+
                         |
               +-------------------+
               |    L1/L2 CACHE    |  <- [Eski Veri: X = 5] (Dirty/Stale!)
               +-------------------+
                         |
  +--------+   Yazma   +-----------+
  |  DMA   | --------> |  RAM      |  <- [Yeni Veri: X = 20] (Bellek güncellendi!)
  +--------+           +-----------+
```

1. **Eski Veri (Stale Data) Problemi:** DMA denetleyicisi çevre biriminden gelen yeni verileri doğrudan RAM'e yazar. Ancak CPU önbelleğinde bu bellek adresinin eski bir kopyası durmaktadır. CPU belleği okumak istediğinde önbellekten eski değeri (X = 5) okur ve hatalı işlem yapar.
2. **Üzerine Yazma (Write-Back) Problemi:** CPU önbelleğindeki veriyi değiştirmiş ancak henüz RAM'e yazmamıştır (Geriye Yazma - Write-Back modunda). Bu sırada DMA denetleyicisi RAM'den çevre birimine aktarım yaparsa, RAM'deki bayat veriyi diske yazar. Hemen ardından önbellek RAM'e yazıldığında DMA'nın yaptığı işlem boşa gider.

### Çözüm Yöntemleri:
- **Donanımsal Veriyolu Gözetleme (Bus Snooping):** Önbellek denetleyicisi sistem veriyolundaki DMA işlemlerini dinler. DMA bir adrese yazdığında, önbellek o adresteki satırını anında geçersiz (Invalid) kılar.
- **Yazılımsal Önbellek Temizleme (Flushing / Invalidation):** İşletim sistemi bir DMA transferi başlatmadan önce ilgili bellek bölgesine ait önbellek satırlarını RAM'e boşaltır (`flush`) ve transfer bittiğinde önbelleği geçersiz kılar (`invalidate`).
- **Önbelleğe Alınmayan Bellek Bölgeleri (Non-Cacheable DMA Buffers):** DMA tamponları olarak ayrılan bellek bölgeleri sayfa tablosunda "önbelleğe alınamaz" olarak işaretlenir.

---

## 11.6 İşletim Sistemi Temelleri ve İşlemci Desteği: Proses Durumları

İşletim sistemleri (OS), donanım kaynaklarını adil, güvenli ve verimli bir şekilde paylaştırmakla yükümlü temel sistem yazılımlarıdır. Çalışmakta olan bir programın bellekteki icra örneğine **Proses (Process)** denir.

Bir proses yaşam döngüsü boyunca 5 temel durumdan geçer:

```
       [ NEW ] (Yeni Oluşturuldu)
          |
          v
   +--> [ READY ] (Hazır Kuyruğunda) <----+
   |      |                               |
   |   Zamanlayıcı (Dispatch)             | Kesme / Süre Bitti (Timeout)
   |      v                               |
   |    [ RUNNING ] (İşlemcide Yürütülüyor)+
   |      |
   |   G/Ç veya Olay Bekleme
   |      v
   +--- [ WAITING / BLOCKED ] (Beklemede)
          |
          | (İşlem Tamamlandı)
          v
       [ TERMINATED ] (Sonlandırıldı)
```

1. **New (Yeni):** Prosesin işletim sistemi tarafından oluşturulma aşamasıdır.
2. **Ready (Hazır):** Prosesin çalışmak için tüm kaynaklara (kod, veri, bellek) sahip olduğu ve yalnızca CPU zaman dilimi beklediği durumdur.
3. **Running (Çalışıyor):** İşlemci yazmaçlarının ve kontrolünün bizzat o proseste olduğu ve komutların fiilen yürütüldüğü durumdur.
4. **Waiting / Blocked (Beklemede):** Prosesin bir G/Ç işleminin (örneğin klavye girdisi, disk okuması) tamamlanmasını beklediği durumdur. Bu aşamada CPU'yu meşgul etmez.
5. **Terminated (Sonlandırıldı):** Prosesin icrasını tamamlayıp sistem kaynaklarını iade ettiği durumdur.

---

## 11.7 Proses Kontrol Bloğu (PCB) ve Bağlam Değiştirme (Context Switching)

İşletim sistemi çekirdeği (Kernel), sistemdeki her bir prosesin tüm durumunu, kaynaklarını ve çalışma anındaki yazmaç değerlerini **Proses Kontrol Bloğu (PCB - Process Control Block)** adı verilen özel bir veri yapısında saklar.

### Proses Kontrol Bloğu (PCB) Alanları:
- **Proses Kimliği (PID - Process ID):** Prosesin tekil kimlik numarası.
- **Proses Durumu (Process State):** Ready, Running, Waiting vb.
- **Program Sayacı (PC / IP):** Prosesin bir sonraki yürütülecek komutunun adresi (`CS:IP`).
- **İşlemci Yazmaçları (CPU Registers):** `AX, BX, CX, DX, SP, BP, SI, DI, FLAGS` ve tüm Segment yazmaçları.
- **Bellek Yönetim Bilgileri:** Sayfa tabloları, segment sınırları (Base/Limit).
- **Açık Dosya Tanımlayıcıları:** Prosese tahsis edilmiş dosya ve soket tanıtıcıları.

### Bağlam Değiştirme (Context Switching):
Çoklu görev (Multitasking) işletim sistemlerinde, bir proses durdurulup diğer prosese geçilirken yapılan işleme **Bağlam Değiştirme (Context Switching)** denir:

```
  Proses A (Çalışıyor)               İşletim Sistemi Çekirdeği              Proses B (Hazır)
          |                                     |                                 |
          |--- Zamanlayıcı Kesmesi (Timer) ---->|                                 |
          |    [Bağlam Saklama]                 |                                 |
          |    Proses A'nın tüm yazmaçları      |                                 |
          |    PCB_A içine kaydedilir.          |                                 |
          |                                     |                                 |
          |                                     |--- Zamanlama Algoritması        |
          |                                     |    (Round-Robin / Priority)     |
          |                                     |                                 |
          |                                     |    [Bağlam Yükleme]             |
          |                                     |    Proses B'nin PCB_B           |
          |                                     |    yazmaçları CPU'ya yüklenir.  |
          |                                     |                                 |
          |                                     |---------- IRET ---------------->|
          |                                                                       | (Proses B çalışır)
```

Bağlam değiştirme tamamen bir yönetimsel ek yüktür (overhead); bu süreçte hiçbir kullanıcı kodu ilerlemez. Bu nedenle mikroişlemcilerin yazmaç saklama yetenekleri (örneğin `PUSHA`, `POPA` komutları veya donanımsal gölge yazmaç bankaları) bağlam değiştirme süresini asgariye indirmek üzere tasarlanmıştır.

---

## 11.8 Donanım Koruma Seviyeleri: Kullanıcı Modu (User Mode) vs. Çekirdek Modu (Kernel Mode)

Modern işletim sistemlerinin kararlılığı ve güvenliği, hatalı veya kötü niyetli bir kullanıcı programının tüm sistemi kilitlemesini engelleyen donanımsal koruma mekanizmalarına dayanır. Mikroişlemci mimarisinde bu koruma **Çift Mod (Dual-Mode Operation)** ile sağlanır:

```
+-----------------------------------------------------------------------------------------+
|                    KULLANICI MODU (USER MODE) vs. ÇEKİRDEK MODU (KERNEL MODE)           |
+---------------------------+------------------------------+------------------------------+
| Özellik                   | Kullanıcı Modu (User Mode)   | Çekirdek Modu (Kernel Mode)  |
+---------------------------+------------------------------+------------------------------+
| Ayrıcalık Seviyesi        | Düşük Ayrıcalıklı (Ring 3)   | En Yüksek Ayrıcalıklı (Ring 0|
| Çalıştırılan Kod          | Kullanıcı Uygulamaları, Oyun | İşletim Sistemi Çekirdeği,   |
|                           | Web Tarayıcı, Derleyici      | Aygıt Sürücüleri (Drivers)   |
| Bellek Erişimi            | Yalnızca kendi kullanıcı     | Tüm fiziksel RAM ve donanım  |
|                           | bellek alanına erişebilir    | adreslerine sınırsız erişim  |
| Tehlikeli Komutlar        | YASAK (İstisna üretir)       | SERBEST (CLI, STI, HLT, LGDT)|
| Port Erişimi (IN/OUT)     | Kısıtlı / Yasak              | Doğrudan tam erişim          |
+---------------------------+------------------------------+------------------------------+
```

### Ayrıcalıklı Komutlar (Privileged Instructions):
Sistemin kararlılığını doğrudan etkileyen komutlar yalnızca Çekirdek Modunda (`Kernel Mode` / `Supervisor Mode`) çalıştırılabilir:
- Donanım kesmelerini kapatan veya açan komutlar (`CLI`, `STI`).
- İşlemciyi durduran `HLT` komutu.
- Bellek yönetim ve segment sınır yazmaçlarını değiştiren komutlar.
- Doğrudan G/Ç portlarına erişen `IN` ve `OUT` komutları (korumalı modda).

Kullanıcı Modundaki bir uygulama diskten dosya okumak istediğinde, donanıma doğrudan erişemez; bir yazılım kesmesi (`INT 21h` veya `SYSCALL / SYSENTER`) aracılığıyla **Sistem Çağrısı (System Call)** yapar. İşlemci donanımsal olarak Çekirdek Moduna geçer, isteği denetler, veriyi güvenle okur, tekrar Kullanıcı Moduna dönerek sonucu uygulamaya teslim eder.


---

# BÖLÜM 12: Komut Boru Hattı (Instruction Pipelining) ve Tehlikeler (Hazards)

Mikroişlemcilerin saat frekansını artırarak performansı yükseltme yaklaşımı, silikon teknolojisinin fiziksel sınırları (ısı yayılımı ve güç tüketimi - power wall) nedeniyle tıkandığında, bilgisayar mimarisinde performansı artırmanın en etkin yolu **paralel komut yürütme** teknikleri olmuştur.

Bu tekniklerin en temeli ve modern tüm mikroişlemcilerin çekirdeğinde yer alan yapı taşı **Komut Boru Hattı (Instruction Pipelining)** mimarisidir. Komut boru hattı, tek bir komutun yürütülme süresini (latency) kısaltmaz; ancak birim zamanda tamamlanan komut sayısını (**İşlem Hacmi / Throughput**) katlayarak işlemci başarımını dramatik şekilde artırır.

---

## 12.1 Komut Boru Hattı (Instruction Pipelining) Temel İlkesi ve Montaj Hattı Analojisi

Boru hattı mimarisi, otomotiv endüstrisindeki Henry Ford montaj hattı prensibine dayanır:

```
+-----------------------------------------------------------------------------------------+
|                  SIRALI YÜRÜTME vs. BORU HATTI (PIPELINING) KARŞILAŞTIRMASI             |
+-----------------------------------------------------------------------------------------+

  1. Sıralı Yürütme (Non-Pipelined): Her komut tamamen bitmeden diğeri başlamaz.
     Çevrim:   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
     Komut 1: [IF][ID][EX][MEM][WB]
     Komut 2:                     [IF][ID][EX][MEM][WB]
     Komut 3:                                         [IF][ID][EX][MEM][WB]
     (3 komut = 15 saat çevrimi)

  2. Boru Hattı ile Yürütme (Pipelined): Komut adımları üst üste örtüşür (Overlap).
     Çevrim:   1   2   3   4   5   6   7
     Komut 1: [IF][ID][EX][MEM][WB]
     Komut 2:     [IF][ID][EX][MEM][WB]
     Komut 3:         [IF][ID][EX][MEM][WB]
     (3 komut = 7 saat çevriminde biter!)
```

Intel 8086 işlemcisi, donanımını iki bağımsız bloğa (BIU ve EU) bölerek ve 6-baytlık Prefetch Kuyruğunu kullanarak komut getirme ile komut yürütmeyi örtüştürmüş; böylece ilk 2-aşamalı ilkel boru hattını başlatmıştır. Modern RISC ve CISC işlemciler ise bu prensibi çok daha derin aşamalara ayırmıştır.

---

## 12.2 Klasik 5-Aşamalı İşlemci Boru Hattı (The Classic 5-Stage RISC Pipeline)

Bilgisayar mimarisinde standart kabul edilen klasik 5-aşamalı komut boru hattı şu evrelerden oluşur:

```
  +------+       +------+       +------+       +------+       +------+
  |  IF  | ----> |  ID  | ----> |  EX  | ----> | MEM  | ----> |  WB  |
  +------+       +------+       +------+       +------+       +------+
  Komut          Komut          Yürütme /      Bellek         Yazmaca
  Getir          Çöz            ALU İşlemi     Erişimi        Geri Yaz
```

1. **IF (Instruction Fetch - Komut Getir):**
   Program Sayacının (`PC` veya `IP`) gösterdiği bellek adresinden komut baytları çekilir ve Komut Yazmacına (`IR - Instruction Register`) yüklenir. Program sayacı bir sonraki komuta ilerletilir.
2. **ID (Instruction Decode - Komut Çöz & Yazmaç Oku):**
   Komutun işlem kodu (Opcode) çözülür, kontrol sinyalleri üretilir ve işlenenlerin bulunduğu kaynak yazmaçlar yazmaç dosyasından (Register File) okunur.
3. **EX (Execute - Yürütme / Efektif Adres Hesaplama):**
   Aritmetik Mantık Birimi (ALU) devreye girer. Aritmetik/mantık işlemi icra edilir veya bellek operasyonları için efektif adres toplanır.
4. **MEM (Memory Access - Bellek Erişimi):**
   Yalnızca bellek okuma (`Load` / `MOV reg, [mem]`) veya bellek yazma (`Store` / `MOV [mem], reg`) komutlarında aktiftir. Veri önbelleğinden (D-Cache) okuma yapılır ya da veri yazılır. Belleğe dokunmayan komutlar bu aşamada boş geçer.
5. **WB (Write-Back - Yazmaca Geri Yazma):**
   ALU'nun ürettiği sonuç veya bellekten okunan veri, hedef yazmaca (`Register File`) fiziksel olarak yazılır. Komut böylece tamamen tamamlanmış olur.

---

## 12.3 Boru Hattı Başarımı ve Hızlanma (Speedup) Matematiksel Modeli

Boru hattı mimarisinin teorik kazancını inceleyelim:
- $k$ = Boru hattındaki aşama sayısı (Stage count, örn: $k = 5$)
- $n$ = Yürütülecek toplam komut sayısı
- $\tau$ = Her aşamanın saat çevrim süresi (Clock cycle time)

### 1. Boru Hattı Olmayan Sistemde Toplam Süre ($T_{seq}$):
Her komut $k$ çevrim sürer. $n$ adet komut ardışıl yürütüldüğünde:
$$T_{seq} = n \cdot k \cdot \tau$$

### 2. Boru Hattına Sahip Sistemde Toplam Süre ($T_{pipe}$):
İlk komut boru hattını $k$ çevrimde doldurur. Boru hattı dolduktan sonra her saat çevriminde tam 1 komut tamamlanarak boru hattından çıkar. Geriye kalan $n - 1$ komutun her biri 1'er çevrimde biter:
$$T_{pipe} = [k + (n - 1)] \cdot \tau = (k + n - 1) \cdot \tau$$

### 3. Boru Hattı Hızlanma (Speedup) Modeli ($S_k$):
Hızlanma, sıralı sürenin boru hattı süresine oranıdır:
$$S_k = \frac{T_{seq}}{T_{pipe}} = \frac{n \cdot k \cdot \tau}{(k + n - 1) \cdot \tau} = \frac{n \cdot k}{k + n - 1}$$
$$Speedup = n * k / (k + n - 1)\nS_k = \frac{n \cdot k}{k + n - 1}$$

### Teorik Azami Hızlanma Sınırı:
Komut sayısı çok büyük olduğunda ($n \to \infty$):
$$\lim_{n \to \infty} S_k = \lim_{n \to \infty} \frac{n \cdot k}{n + k - 1} = k$$
Yani 5 aşamalı bir boru hattı, sıralı sisteme göre teorik olarak **en fazla 5 kat hızlanma ($S_5 = 5$)** sağlayabilir. İdeal durumda Komut Başına Çevrim Sayısı $CPI = 1$ olur.

Ancak gerçekte hiçbir işlemci bu teorik sınıra tam ulaşamaz; çünkü boru hattının akışını bozan **Boru Hattı Tehlikeleri (Pipeline Hazards)** mevcuttur.

---

## 12.4 Boru Hattı Tehlikeleri 1: Yapısal Tehlikeler (Structural Hazards)

Yapısal tehlike (Structural Hazard), donanım kaynaklarının yetersizliği nedeniyle aynı saat çevriminde iki farklı aşamanın aynı fiziksel donanım birimine aynı anda erişmek istemesi (donanım çakışması) durumudur.

```
       Çevrim:     1      2      3      4
       Komut 1:  [IF]   [ID]   [EX]   [MEM]   [WB]   <- Bellekten veri okuyor (MEM)
       Komut 4:                [IF]                  <- Bellekten komut çekiyor (IF)
                                ^^^^^
             [ÇAKIŞMA: Tek bir bellek portu varsa ikisi birden erişemez!]
```

- **Örnek:** Eğer işlemcide tek bir birleşik bellek (Unified Cache / Von Neumann mimarisi) varsa; 1. komut `MEM` aşamasında bellekten veri okurken, 4. komut `IF` aşamasında bellekten komut çekemez.
- **Çözüm:** **Harvard Mimarisi** kullanımı. Komut önbelleği (Instruction Cache / I-Cache) ile Veri önbelleği (Data Cache / D-Cache) birbirinden fiziksel olarak ayrılarak bağımsız veriyolları ile donatılır.

---

## 12.5 Boru Hattı Tehlikeleri 2: Veri Tehlikeleri (Data Hazards) ve Çözüm Yolları

Veri tehlikesi (Data Hazard), boru hattında henüz yürütülmekte olan bir komutun yazacağı sonuca, hemen ardından gelen bir sonraki komutun ihtiyaç duyması durumunda ortaya çıkar. 

Üç temel veri bağımlılığı türü mevcuttur:

1. **RAW (Read After Write / True Dependency - Gerçek Bağımlılık):**
   $I_2$ komutu, $I_1$ komutunun yazacağı yazmacı okumak ister. En yaygın ve kaçınılmaz tehlikedir.
   ```assembly
   ADD R1, R2, R3    ; R1 = R2 + R3 (R1 değeri WB aşamasında, Çevrim 5'te yazılacak)
   SUB R4, R1, R5    ; R1'i okumak istiyor (ID aşamasında, Çevrim 3'te okumalı!)
   ```
2. **WAR (Write After Read / Anti-Dependency - Karşıt Bağımlılık):**
   $I_2$ komutu, $I_1$ komutu okumadan önce ilgili yazmaca yeni veri yazmak ister. Sırasız yürütülen (Out-of-Order) işlemcilerde ortaya çıkar.
3. **WAW (Write After Write / Output Dependency - Çıkış Bağımlılığı):**
   $I_2$ komutu, $I_1$ komutu yazmadan önce aynı hedef yazmaca yazmaya çalışır. Sonucun hatalı üzerine yazılmaması için sıralama korunmalıdır.

### Veri Tehlikelerini Çözme Mekanizmaları:

#### A. Boru Hattı Duraklatma (Pipeline Stall) ve Kabarcık (Bubble)
En basit çözüm, bağımlı komutun yürütülmesini donanımsal olarak duraklatmaktır. Boru hattının arasına hiçbir işlem yapmayan yapay boşluklar—**Kabarcık (Bubble / NOP)**—yerleştirilir. Bu durum işlemcinin $CPI$ değerini artırarak performansı düşürür.

```
       Çevrim:   1    2    3    4    5    6    7
       ADD:     [IF] [ID] [EX] [MEM][WB] (R1 hazır)
       SUB:          [IF] [ID] [---][---][EX] [MEM][WB]
                           ^^^^^^^^^^^^^^ (Stall / 2 Çevrim Bubble)
```

#### B. Veri İletme (Data Forwarding / Bypassing)
Yazmaç dosyasına yazılmayı beklemek yerine, ALU'nun `EX` aşamasının çıkışında hesaplanan taze sonuç, özel dahili bypass hatları üzerinden doğrudan sonraki komutun `EX` girişine iletilir (**Forwarding / Bypassing**). Bu sayede `RAW` tehlikeleri duraklatmaya gerek kalmadan (0 kabarcık ile) çözülür.

```
       ADD: [IF] [ID] [EX] ----+ [MEM] [WB]
                               | (Forwarding Hattı)
       SUB:      [IF] [ID] ----v [EX]  [MEM] [WB]
```

> **Load-Use Gecikmesi:** Eğer önceki komut bellekten veri yükleyen bir `Load` komutu ise, veri ancak `MEM` aşamasının sonunda hazır olur. Bu durumda `Forwarding` yapılsa dahi zorunlu olarak **1 çevrimlik duraklatma (Load-Use Stall)** kaçınılmazdır.

---

## 12.6 Boru Hattı Tehlikeleri 3: Kontrol Tehlikeleri (Control Hazards) ve Dallanma Cezası

Kontrol tehlikeleri (Control / Branch Hazards), program akışını değiştiren koşullu ve koşulsuz sıçrama komutları (`JMP, Jcc, CALL, RET`) nedeniyle ortaya çıkar.

İşlemci bir koşullu dallanma (`JZ label`) ile karşılaştığında:
1. Dallanmanın gerçekleşip gerçekleşmeyeceği (Taken or Not-Taken),
2. Dallanılacak hedef adres,
ancak `ID` veya `EX` aşamasında (bayraklar hesaplandığında) kesinleşir. 

Oysa bu karar verilene kadar boru hattı arkadan gelen ardışık komutları getirmeye (`IF`) devam etmiştir! Eğer dallanma gerçekleşirse (`Taken`), boru hattına yanlışlıkla sokulmuş olan tüm bu komutlar iptal edilmeli, kuyruk boşaltılmalı (**Pipeline Flush**) ve yeni hedef adresten komut getirilmelidir. Bu kayıp zamana **Dallanma Cezası (Branch Penalty)** denir.

```
       Çevrim:   1    2    3    4    5
       JZ:      [IF] [ID] [EX] (Dallanma kararı verildi: Sıçra!)
       Komut+1:      [IF] [ID] (İPTAL / FLUSH!)
       Komut+2:           [IF] (İPTAL / FLUSH!)
       Hedef:                  [IF] [ID] [EX] [MEM] [WB]
                 ^^^^^^^^^^^^^
                 (2-3 Çevrimlik Dallanma Cezası / Branch Penalty)
```

---

## 12.7 Dallanma Tahmini (Branch Prediction), BTB ve Gecikmeli Dallanma

Dallanma cezasının modern derin boru hatlarında (10-20 aşama) performansı yerle bir etmesini önlemek amacıyla ileri tahmin teknikleri uygulanır:

### 1. Statik Dallanma Tahmini (Static Branch Prediction)
Çalışma zamanı geçmişine bakılmaksızın komutun tipine veya yönüne göre sabit karar verilir:
- **BTFN (Backward Taken, Forward Not-Taken):** Geriye doğru olan dallanmaların (döngüler çoğunlukla tekrar eder) `Taken` olacağı; ileriye doğru olan dallanmaların (hata blokları nadiren çalışır) `Not-Taken` olacağı varsayılır.

### 2. Dinamik Dallanma Tahmini (Dynamic Branch Prediction)
İşlemci donanımında her dallanma komutunun geçmişteki davranışını kaydeden küçük bir hafıza tutulur:
- **1-Bit Tahminci:** Son yapılan dallanmanın aynısını tahmin eder. Döngü çıkışlarında iki kez ardışık hata yapar.
- **2-Bit Doygunluk Sayıcısı (2-Bit Saturating Counter):** Tek bir istisnada tahmini hemen değiştirmez; iki kez ardışık hata yapılmasını bekler. Dört durumu vardır:
  - `11` = Güçlü Dallanır (Strongly Taken)
  - `10` = Zayıf Dallanır (Weakly Taken)
  - `01` = Zayıf Dallanmaz (Weakly Not-Taken)
  - `00` = Güçlü Dallanmaz (Strongly Not-Taken)

```
        +-----------------(Taken)------------------+
        |                                          |
        v                                          |
     +----+           +----+           +----+      |    +----+
     | 11 | --(NT)--> | 10 | --(NT)--> | 01 | --(NT)--> | 00 |
     +----+           +----+           +----+           +----+
        ^               |                ^                |
        |----(Taken)----+                +-----(Taken)----+
```

### 3. Dallanma Hedef Tamponu (BTB - Branch Target Buffer)
Dallanma tahmincisi dallanılacağını öngörse bile, hedef adresin hesaplanması vakit alır. **Dallanma Hedef Tamponu (BTB)**, daha önce çalıştırılmış dallanma komutlarının adreslerini ve onların hedef adreslerini içeren özel bir önbellektir. Komut getirildiği anda (`IF`), BTB'de hedef adres anında bulunur ve tek bir saat çevrimi dahi kaybedilmeden hedef komut getirilir.

### 4. Gecikmeli Dallanma (Delayed Branching)
Özellikle klasik RISC mimarilerinde (MIPS, SPARC) kullanılan yazılımsal bir çözümdür:
- Dallanma komutunun hemen ardındaki komut yuvasına **Gecikme Yuvası (Branch Delay Slot)** adı verilir.
- Derleyici, dallanma gerçekleşsin ya da gerçekleşmesin mutlaka çalışması gereken bağımsız bir komutu bu yuvaya yerleştirir. İşlemci bu yuvadaki komutu dallanmadan önce zorunlu olarak çalıştırır; böylece dallanma cezası sıfıra indirilir.


---

# BÖLÜM 13: Bellek Hiyerarşisi, Önbellek Mimarisi ve Yerellik İlkesi (Memory Hierarchy, Cache Memory & Locality of Reference)

Bilgisayar sistemlerinde işlemci çekirdeklerinin işlem hızı (GHz saat frekansları), dinamik ana belleklerin (DRAM) erişim hızından onlarca kat daha hızlı gelişmiştir. Bu hız uyumsuzluğu literatürde **Bellek Duvarı (Memory Wall)** olarak adlandırılır. Eğer bir işlemci her veri ve komut erişiminde doğrudan ana belleği beklemek zorunda kalsaydı, yüzlerce saat çevrimi boyunca boşta (idle) beklerdi.

Bu fiziksel ve ekonomik ikilemi çözmek amacıyla bilgisayar mimarileri, en hızlı ve pahalı bellekten en yavaş ve ucuz depolamaya kadar uzanan katmanlı bir **Bellek Hiyerarşisi (Memory Hierarchy)** ve **Önbellek (Cache)** mimarisi üzerine kurulmuştur.

---

## 13.1 Bellek Hiyerarşisi Piramidi: Hız, Kapasite ve Maliyet Takasları

Bellek tasarımında üç temel parametre birbiriyle çelişir: **Hız (Erişim Süresi)**, **Kapasite (Boyut)** ve **Maliyet (Bayt Başına Fiyat)**. Hızlı bellekler (SRAM tabanlı) pahalı ve küçük; yavaş bellekler (DRAM ve Manyetik/Flash diskler) ise ucuz ve büyüktür.

Bellek hiyerarşisi, kullanıcıya "sanki ana belleğin tamamı en hızlı önbellek hızındaymış gibi" geniş ve hızlı bir bellek yanılsaması sunar.

```
                            /\
                           /  \
                          /    \     İşlemci İçi Yazmaçlar (Registers)
                         / CPU  \    (< 1 ns, < 1 KB, En Yüksek Maliyet)
                        /--------\
                       / L1 Cache \  (1-2 ns, 32-64 KB, Çok Yüksek Maliyet)
                      /------------\
                     /   L2 Cache   \ (3-10 ns, 256 KB - 1 MB, Yüksek Maliyet)
                    /----------------\
                   /     L3 Cache     \ (10-20 ns, 8-64 MB, Orta Maliyet)
                  /--------------------\
                 /  Ana Bellek (DRAM)   \ (50-100 ns, 8-64 GB, Düşük Maliyet)
                /------------------------\
               / İkincil Bellek (SSD/NVMe)\ (10-100 us, 512 GB - 4 TB)
              /----------------------------\
             / Manyetik Sabit Diskler (HDD) \ (5-10 ms, Çok TB, En Düşük Maliyet)
            /--------------------------------\
```

### Bellek Hiyerarşisi Karşılaştırma Tablosu

Aşağıdaki referans tablosunda bellek hiyerarşisinin tüm katmanları, teknolojik yapıları, tipik erişim süreleri ve kapasiteleri karşılaştırılmıştır:

| Bellek Seviyesi (Katman) | Donanım Teknolojisi | Tipik Erişim Süresi | Tipik Kapasite | Yönetici Mekanizma | Bayt Başı Maliyet |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Yazmaçlar (Registers)** | Özel Çok Portlu Flip-Flop | $< 1\text{ ns}$ (1 çevrim) | $< 1\text{ KB}$ | Derleyici / Programcı | En Yüksek |
| **L1 Önbellek (Level 1)** | Statik RAM (SRAM, Çekirdek İçi)| $1$–$2\text{ ns}$ (2-4 çevrim) | $32$–$64\text{ KB}$ | Donanımsal Önbellek Denetleyici | Çok Yüksek |
| **L2 Önbellek (Level 2)** | Statik RAM (SRAM, Çekirdeğe Yakın)| $3$–$10\text{ ns}$ (10-15 çevrim)| $256\text{ KB}$–$1\text{ MB}$ | Donanımsal Önbellek Denetleyici | Yüksek |
| **L3 Önbellek (Level 3)** | Statik RAM (SRAM, Çekirdekler Ortak)| $10$–$20\text{ ns}$ (30-50 çevrim)| $8$–$64\text{ MB}$ | Donanımsal Önbellek Denetleyici | Orta |
| **Ana Bellek (DRAM / RAM)** | Dinamik RAM (DDR4 / DDR5 DRAM) | $50$–$100\text{ ns}$ (100-200 çevrim)| $8$–$64\text{ GB}$ | İşletim Sistemi / Donanım | Düşük |
| **Katı Hal Sürücü (SSD)** | NAND Flash Bellek (NVMe / SATA)| $10$–$100\ \mu\text{s}$ | $512\text{ GB}$–$4\text{ TB}$ | İşletim Sistemi (Dosya Sistemi)| Çok Düşük |
| **Manyetik Disk (HDD)** | Dönen Manyetik Plakalar | $5$–$10\text{ ms}$ | $2$–$20\text{ TB}$ | İşletim Sistemi (Sanal Bellek) | En Düşük |

---

## 13.2 Yerellik İlkesi (Principle of Locality): Zamansal ve Mekânsal Yerellik

Küçük bir önbelleğin tüm bellek işlemlerinin %90-95'ini karşılayabilmesi (Hit Rate) tesadüf değildir; programların çalışma karakteristiğindeki **Yerellik İlkesi (Principle of Locality)** sayesinde gerçekleşir.

Yerellik ilkesi iki temel boyuttan oluşur:

### 1. Zamansal Yerellik (Temporal Locality)
Zamansal yerellik; yakın zamanda erişilmiş bir bellek konumuna (veri veya komut), çok yakın bir gelecekte tekrar erişilme olasılığının son derece yüksek olduğunu ifade eder.
- *Gerekçe:* Döngüler (`LOOP`, `for`, `while`), döngü sayaçları, yığın işaretçisi (`SP`, `BP`), fonksiyon geri dönüş adresleri ve sık başvurulan yerel değişkenler defalarca okunup yazılır.
- *Önbellek Karşılığı:* Bir veri bellekten ilk kez okunduğunda önbelleğe alınır ve bir süre orada tutulur.

### 2. Mekânsal Yerellik (Spatial Locality)
Mekânsal yerellik; belirli bir bellek konumuna erişildiğinde, bu adrese fiziksel olarak komşu olan (ardışık) adreslere de çok yakında erişilme olasılığının yüksek olmasıdır.
- *Gerekçe:* Komutlar varsayılan olarak bellekte ardışık (`IP` artarak) yürütülür. Ayrıca diziler, matrisler, string karakter blokları ve yapılar (struct) bellekte ardışık baytlar halinde saklanır.
- *Önbellek Karşılığı:* İşlemci tek bir bayt istese dahi, önbellek ana bellekten yalnızca o baytı değil, o baytın içinde bulunduğu tüm bloğu (**Önbellek Satırı / Cache Line - tipik olarak 64 bayt**) bir bütün olarak çeker.

```assembly
; Mekânsal ve Zamansal Yerellik Örneği
ORG 100h
MOV CX, 1000      ; CX: Zamansal yerellik (döngü boyunca sürekli kullanılır)
MOV SI, OFFSET dizi
topla:
    ADD AX, [SI]  ; [SI]: Mekânsal yerellik (dizi elemanları bellekte ardışıktır)
    ADD SI, 2
    LOOP topla
HLT
dizi DW 1000 DUP(1)
```

---

## 13.3 Önbellek Organizasyonunun Temel Yapısı: Etiket (Tag), İndeks (Index) ve Ofset (Offset)

İşlemcinin ürettiği fiziksel adres ($A$ bit), önbellek denetleyicisi tarafından üç bağımsız alana bölünerek yorumlanır:

```
+-------------------------------------------------------------------------------+
|                       ÖNBELLEK ADRES BÖLÜMLEME FORMATI                        |
+-------------------------------------------------------------------------------+
|       Etiket (Tag)        |       İndeks (Index)      |     Blok Ofseti       |
|          t bit            |           s bit           |        b bit          |
+-------------------------------------------------------------------------------+
|<----------------------------- Adres Genişliği: A bit ------------------------>|
```

Formül:
$$\text{Adres Genişliği } A = \text{Tag } (t) + \text{Index } (s) + \text{Offset } (b)$$
$$A = Tag + Index + Offset\nA = t + s + b\nA = \text{Tag} + \text{Index} + \text{Offset}$$

1. **Blok İçi Ofset (Block Offset - $b$ bit):**
   Bir önbellek satırının (Cache Block/Line) boyutunu temsil eder. Blok boyutu $B$ bayt ise:
   $$b = \log_2(B)$$
   Örneğin 64 baytlık bir blok için: $b = \log_2(64) = 6\text{ bit}$. Bu bitler, blok içindeki tam hangi baytın istendiğini seçer.
2. **Küme İndeksi (Set Index - $s$ bit):**
   Önbelleğin hangi satırına (veya kümesine) bakılacağını seçer. Önbellekteki toplam küme sayısı $S$ ise:
   $$s = \log_2(S)$$
3. **Etiket (Tag - $t$ bit):**
   Geriye kalan en yüksek anlamlı adres bitleridir: $t = A - (s + b)$. Önbellek satırında saklanan verinin gerçekten aranan fiziksel adrese ait olup olmadığını doğrulamak için satırın başındaki etiket yazmacı ile karşılaştırılır.

---

## 13.4 Önbellek Eşleme Teknikleri (Cache Mapping Techniques)

Bir bellek bloğunun önbelleğin neresine yerleşebileceğini belirleyen 3 temel eşleme mimarisi vardır:

```
+-----------------------------------------------------------------------------------------+
|                  ÖNBELLEK EŞLEME YÖNTEMLERİNİN KARŞILAŞTIRILMASI                        |
+---------------------------+------------------------------+------------------------------+
| Yöntem                    | Yerleşim Kuralı              | Karşılaştırma Donanımı       |
+---------------------------+------------------------------+------------------------------+
| Doğrudan Eşlemeli         | Her blok yalnızca tek bir    | 1 adet Komparatör (En ucuz,  |
| (Direct-Mapped)           | sabit hatta gidebilir.       | en hızlı, yüksek çakışma)    |
|---------------------------+------------------------------+------------------------------+
| Kümeli İlişkili           | Her blok belirli bir kümenin | K adet Komparatör (Dengeli,  |
| (Set-Associative - K-Way) | herhangi bir hattına gider.  | modern CPU standardı)        |
|---------------------------+------------------------------+------------------------------+
| Tam İlişkili              | Her blok önbelleğin herhangi | Tüm hatlar kadar Komparatör  |
| (Fully Associative)       | bir boş yerine gidebilir.    | (En pahalı, sıfır çakışma)   |
+---------------------------+------------------------------+------------------------------+
```

### 1. Doğrudan Eşlemeli Önbellek (Direct-Mapped Cache)
Bellek bloğunun gideceği satır katı bir modülo aritmetiği ile belirlenir:
$$\text{Satır Numarası} = (\text{Blok Adresi}) \pmod{\text{Toplam Satır Sayısı}}$$
- *Avantajı:* Arama donanımı son derece basittir; yalnızca 1 adet karşılaştırıcı (komparatör) yeterlidir, erişim süresi en kısadır.
- *Dezavantajı:* Farklı adreslerdeki iki aktif blok aynı satıra denk geldiğinde, önbellek tamamen boş olsa dahi birbirlerini sürekli dışarı atarlar (**Çakışma Iskası - Conflict Miss**).

### 2. Kümeli İlişkili Önbellek (Set-Associative Cache - K-Way)
Önbellek her biri $K$ adet hattan oluşan kümelere ayrılır (2-Way, 4-Way, 8-Way). Bellek bloğunun hangi kümeye gideceği indeks bitleriyle belirlenir:
$$\text{Küme Numarası} = (\text{Blok Adresi}) \pmod{\text{Toplam Küme Sayısı}}$$
Blok, o küme içindeki $K$ hattan herhangi birine yerleşebilir. Küme içindeki $K$ hattın etiketleri paralel olarak $K$ adet komparatör ile aynı anda karşılaştırılır. Günümüz işlemcilerinde (L1/L2/L3) en yaygın kullanılan dengeli yapıdır.

### 3. Tam İlişkili Önbellek (Fully Associative Cache)
İndeks biti yoktur ($s = 0$). Herhangi bir bellek bloğu önbellekteki herhangi bir satıra serbestçe yerleşebilir. Çakışma ıskaları tamamen yok edilir. Ancak arama için önbellekteki tüm satırların etiketleri aynı anda karşılaştırılmalıdır (içerik adreslemeli bellek - CAM gerektirir). Bu nedenle yüksek donanım maliyeti ve gecikme yüzünden yalnızca TLB (Translation Lookaside Buffer) gibi küçük yapılarda uygulanır.

---

## 13.5 Önbellek Iska Türleri: Üç C Kuralı (The 3 Cs of Cache Misses)

Önbellek ıskaları (Cache Misses) bilgisayar mimarı Mark Hill tarafından "3 C" kuralı ile sınıflandırılmıştır:

1. **Zorunlu Iska (Compulsory Miss / Cold Miss / Soğuk Iska):**
   Bir veri veya komut bloğuna program başladığından beri **ilk kez** erişildiğinde meydana gelir. Blok daha önce hiç getirilmediği için ıskalaması kaçınılmazdır. Önbellek boyutu sonsuz dahi olsa bu ıskalar engellenemez. Blok boyutunu artırmak mekânsal yerellik sayesinde zorunlu ıskaları azaltabilir.
2. **Kapasite Iskası (Capacity Miss):**
   Programın aktif olarak kullandığı çalışma kümesinin (Working Set) boyutu, önbelleğin toplam fiziksel kapasitesini aştığında oluşur. Önbellek dolduğu için daha önce getirilmiş olan faydalı bloklar dışarı atılmak zorunda kalınmıştır. Çözümü önbellek kapasitesini büyütmektir.
3. **Çakışma Iskası (Conflict Miss / Collision Miss):**
   Yalnızca Doğrudan Eşlemeli ve Kümeli İlişkili önbelleklerde görülür. Önbellekte genel olarak boş yerler bulunmasına rağmen, birden fazla aktif bellek bloğunun aynı indekse (küme veya satıra) haritalanması sonucu birbirlerini dışarı atmasıdır. Kümeli ilişki derecesini artırmak ($K$ değerini büyütmek) çakışma ıskalarını azaltır.

---

## 13.6 Önbellek Yazma Politikaları: Doğrudan Yazma vs. Geriye Yazma

İşlemci belleğe bir veri yazmak istediğinde (Store işlemi), önbellek iki farklı politika ile yönetilir:

```
+-----------------------------------------------------------------------------------------+
|                  ÖNBELLEK YAZMA POLİTİKALARININ KARŞILAŞTIRILMASI                       |
+---------------------------+------------------------------+------------------------------+
| Özellik                   | Doğrudan Yazma (Write-Through| Geriye Yazma (Write-Back)    |
+---------------------------+------------------------------+------------------------------+
| Ana Belleğe Yazma Zamanı  | Eşzamanlı (Önbellekle aynı an| Yalnızca blok atılırken      |
| Veriyolu Trafiği          | Çok Yüksek (Her yazmada meşgu| Çok Düşük (Yalnızca kirliyse)|
| Kirli Bit (Dirty Bit)     | Gerek Yok                    | Zorunlu (1 bit/hat)          |
| RAM ile Tutarlılık        | Kusursuz (RAM daima güncel)  | RAM geçici olarak bayat kalır|
| Yazma Hızı                | Yavaş (RAM hızına bağımlı)   | Çok Hızlı (Önbellek hızında) |
+---------------------------+------------------------------+------------------------------+
```

1. **Doğrudan Yazma (Write-Through):**
   İşlemci veri yazdığında, veri hem önbelleğe hem de ana belleğe (RAM) eşzamanlı olarak yazılır. Ana bellek ile önbellek daima %100 tutarlıdır. Ancak her yazma işlemi yavaş DRAM hızında gerçekleştiği için performansı düşürür (bu etkiyi azaltmak için araya Yazma Tamponu / Write Buffer konur).
2. **Geriye Yazma (Write-Back):**
   Veri yalnızca önbelleğe yazılır ve işlem hemen biter. İlgili satırın başına **Kirli Bit (Dirty Bit)** adı verilen 1-bitlik bayrak konur (`Dirty = 1`). Ana bellek güncellenmez. Ancak o blok ileride başka bir blok için önbellekten tahliye edileceği (eviction) zaman, eğer Dirty biti 1 ise RAM'e yazılır; 0 ise doğrudan çöpe atılır. Veriyolu trafiğini asgari düzeye indirdiği için modern L1/L2 önbelleklerin vazgeçilmezidir.

---

## 13.7 Blok Değiştirme Algoritmaları ve AMAT Hesaplaması

Kümeli ilişkili bir önbellekte yeni bir blok getirileceğinde ve küme tamamen dolu olduğunda, hangi eski hattın feda edileceğine **Blok Değiştirme Politikası** karar verir:
- **LRU (Least Recently Used - En Uzun Süredir Kullanılmayan):** Geçmişte en uzun süredir erişilmemiş olan hattı dışarı atar. Zamansal yerellik ilkesine en uygun ve en başarılı algoritmadır.
- **FIFO (First-In, First-Out):** Kümeye ilk giren hattı ilk çıkarır.
- **Random (Rastgele):** Donanımsal olarak rastgele bir hattı feda eder; uygulanması çok ucuzdur ve yüksek ilişkili önbelleklerde LRU'ya yakın başarım gösterir.

### Ortalama Bellek Erişim Süresi (AMAT - Average Memory Access Time)
Bir bellek sisteminin gerçek performansını ölçen en temel metrik AMAT'tır:
$$\text{AMAT} = \text{Hit Time} + (\text{Miss Rate} \times \text{Miss Penalty})$$
$$\text{AMAT} = \text{Hit Time} + \text{Miss Rate} \times \text{Miss Penalty}$$

- **Hit Time (İsabet Süresi):** İstenen verinin önbellekte bulunması durumunda geçen erişim süresi (örn: L1 için 1 ns).
- **Miss Rate (Iska Oranı):** İstenen verinin önbellekte bulunamama yüzdesi ($0.0 \le \text{Miss Rate} \le 1.0$).
- **Miss Penalty (Iska Cezası):** Iska durumunda verinin bir alt bellek katmanından (RAM) getirilip önbelleğe yerleştirilmesine kadar geçen gecikme süresi (örn: 50 ns).

#### Örnek Sayısal Hesaplama:
- $\text{Hit Time} = 1\text{ ns}$
- $\text{Miss Rate} = \%5 = 0.05$
- $\text{Miss Penalty} = 50\text{ ns}$
$$\text{AMAT} = 1\text{ ns} + (0.05 \times 50\text{ ns}) = 1\text{ ns} + 2.5\text{ ns} = 3.5\text{ ns}$$
Görüldüğü gibi %5'lik küçük bir ıskalama oranı dahi ortalama erişim süresini 1 ns'den 3.5 ns'ye (3.5 katına) çıkarmaktadır. Bu nedenle önbellek mimarisinde ıskaları önlemek en kritik optimizasyondur.


---

# BÖLÜM 14: Assembly Dili Makroları ve Intel 8085 vs. 8086 Karşılaştırması (Assembly Macros & Intel 8085 vs. 8086 Comparison)

Assembly dilinde kod tekrarını önlemek, okunabilirliği artırmak ve yüksek performanslı algoritmalar geliştirmek için iki temel modüler yapı kullanılır: **Prosedürler (Alt Yordamlar - CALL/RET)** ve **Makrolar (MACRO / ENDM)**. Bu iki yöntemin donanımsal ve çalışma zamanı etkileri birbirinden taban tabana zıttır.

Ayrıca 16-bitlik 8086 mimarisinin evrimini, adresleme mantığını ve donanım yeteneklerini derinlemesine kavramak için, kendisinden hemen önceki 8-bitlik öncülü olan efsanevi **Intel 8085** mikroişlemcisinin mimarisi ve komut yapısıyla karşılaştırılması akademik olarak büyük bir önem taşır.

---

## 14.1 Assembly Dilinde Makro (MACRO) Kavramı ve Sözdizimi

Makro (Macro), derleyici (Assembler) seviyesinde çalışan bir ön işlemci mekanizmasıdır. Bir komut dizisine tek bir isim verilerek tanımlanır; kaynak kodda bu makro ismi her çağrıldığında, derleyici makro isminin yerine makronun içerdiği tüm komutları satır içine birebir kopyalar. Bu işleme **Makro Genişlemesi (Macro Expansion / Satır İçi Genişleme)** denir.

Makrolar derleme zamanında (Assembly Time) işlenir; çalışma zamanında (Runtime) "makro çağırma" diye bir işlemci adımı yoktur.

```assembly
; Basit Bir Makro Tanımlama Şablonu
KARE_AL MACRO sayi
    MOV AX, sayi
    MUL AX
ENDM

; Kaynak Kodda Kullanımı:
KARE_AL 5
KARE_AL BX
```

Derleyici kaynak kodu tararken `KARE_AL 5` gördüğü yere doğrudan `MOV AX, 5` ve `MUL AX` makine kodlarını yerleştirir.

---

## 14.2 Makrolar ile Prosedürlerin (CALL / RET) Karşılaştırmalı Analizi

Makrolar ile Prosedürler (Subroutines) arasındaki seçim, yazılım mühendisliğinde klasik bir **Zaman vs. Bellek (Time vs. Space)** takasıdır:

```
+-----------------------------------------------------------------------------------------+
|                  MAKRO (MACRO) vs. PROSEDÜR (CALL/RET) KARŞILAŞTIRMASI                  |
+---------------------------+------------------------------+------------------------------+
| Özellik                   | Makrolar (MACRO / ENDM)      | Prosedürler (CALL / RET)     |
+---------------------------+------------------------------+------------------------------+
| İşleme Zamanı             | Derleme Zamanı (Assembly Time| Çalışma Zamanı (Runtime)     |
| Kod Boyutu (Code Size)    | Büyür (Her çağrıda kod kopyal| Küçüktür (Bellekte tek kopya)|
| Çalışma Hızı (Speed)      | Çok Hızlı (0 çağrı ek yükü)  | Daha Yavaş (CALL/RET ek yükü)|
| Yığın Kullanımı (Stack)   | Sıfır (Yığın kullanılmaz)    | Var (Dönüş adresi yığına PUSH|
| Parametre Aktarımı        | Metin yerine koyma (Textual) | Yazmaçlar veya Yığın (Stack) |
| Özyineleme (Recursion)    | Desteklenmez                 | Tam Desteklenir              |
| İdeal Kullanım Alanı      | 2-4 komutluk kısa işlemler,  | Uzun, karmaşık, sık yinelenen|
|                           | kritik hız gerektiren yerler | büyük algoritmik bloklar     |
+---------------------------+------------------------------+------------------------------+
```

- **Prosedürün Bedeli:** Bir `CALL` komutu yürütülürken dönüş adresi yığına itilir ($SP \leftarrow SP - 2$), hedef adrese atlanır, prosedür sonunda `RET` komutu yığından adresi çeker ($SP \leftarrow SP + 2$). Bu işlem en az 20-30 saat çevrimi ek yük (overhead) ve boru hattında dallanma cezası yaratır.
- **Makronun Bedeli:** Makroda hiçbir çağrı ve dönüş gecikmesi yoktur; kod dümdüz akar. Ancak 20 komutluk bir makro kod içinde 50 kez çağrılırsa programın bellek boyutu 1000 komut büyür (Code Bloat).

---

## 14.3 Parametreli ve Koşullu Makro Yapıları (IF, IFDEF, REPT)

Makrolar değişken argümanlar alabilir ve derleyici direktifleri ile koşullu derleme (Conditional Assembly) yapabilir:

```assembly
; Koşullu Makro (Conditional Macro) Örneği
TOPLA MACRO Hedef, Deger
    IF Deger EQ 1
        INC Hedef          ; Eğer eklenecek sayı 1 ise daha kısa ve hızlı olan INC kullan
    ELSE
        ADD Hedef, Deger   ; Değilse normal ADD komutunu üret
    ENDIF
ENDM

; IFDEF / IFNDEF Kullanımı
HATA_YAZ MACRO mesaj
    IFDEF DEBUG_MODE       ; Eğer DEBUG_MODE sembolü tanımlıysa bu kodu üret
        MOV DX, OFFSET mesaj
        MOV AH, 09h
        INT 21h
    ENDIF
ENDM
```

---

## 14.4 Intel 8085 Mikroişlemcisi Mimarisi

1976 yılında piyasaya sürülen **Intel 8085**, popüler 8080 işlemcisinin geliştirilmiş sürümüdür. Tek bir +5V besleme gerilimi ile çalışan ilk başarılı mikroişlemcilerdendir:

- **ALU Genişliği:** 8-bitlik Aritmetik Mantık Birimine sahiptir. Tüm dahili işlemler bayt seviyesindedir.
- **Adres Veriyolu:** 16-bit genişliğindedir. Dolayısıyla adresleyebileceği azami bellek uzayı:
  $$\text{Bellek Uzayı} = 2^{16} = 65,536\text{ Bayt} = 64\text{ KB}$$
- **Çoklanmış (Multiplexed) Veriyolu (`AD0 – AD7`):** Pin sayısını 40 pinde tutmak için en düşük anlamlı 8 adres biti ile 8-bitlik veri veriyolu çoklanmıştır (`AD0–AD7`). Harici bir mandal (latch) entegresi (74LS373), `ALE` (Address Latch Enable) pini aktif olduğunda bu hatlardaki adres bilgisini yakalar.

---

## 14.5 Intel 8085 Programlama Modeli: Yazmaçlar ve Bellek İşaretçisi

Intel 8085, yazılımcıya 7 adet 8-bitlik ve 2 adet 16-bitlik temel yazmaç sunar:

```
+-------------------------------------------------------------+
|               INTEL 8085 PROGRAMLAMA MODELİ                 |
+------------------------------+------------------------------+
| Akümülatör (A) [8-Bit]       | Bayrak Yazmacı (FLAGS) [8-Bit|
+------------------------------+------------------------------+
| B Yazmacı [8-Bit]            | C Yazmacı [8-Bit]            | -> BC Çifti (16-bit)
| D Yazmacı [8-Bit]            | E Yazmacı [8-Bit]            | -> DE Çifti (16-bit)
| H Yazmacı [8-Bit]            | L Yazmacı [8-Bit]            | -> HL Çifti (M Bellek İşaretçisi)
+------------------------------+------------------------------+
| Yığın İşaretçisi (SP - Stack Pointer) [16-Bit]              |
| Program Sayacı (PC - Program Counter) [16-Bit]              |
+-------------------------------------------------------------+
```

1. **Akümülatör (A):** Tüm aritmetik ve mantıksal işlemlerin birincil işleneni ve sonucun yazıldığı ana yazmaçtır.
2. **Genel Amaçlı Yazmaçlar (`B, C, D, E, H, L`):** Bağımsız 8-bitlik yazmaçlar olarak kullanılabildikleri gibi, 16-bitlik işlemler için 3 çift halinde eşleşebilirler: `BC`, `DE` ve `HL`.
3. **HL Bellek İşaretçisi (`M`):** 8085 komut kümesinde `M` işleneni, `HL` yazmaç çiftinin 16-bitlik adres olarak gösterdiği bellek konumunu (`Memory[HL]`) ifade eder.
4. **Program Counter (PC):** Yürütülecek bir sonraki komutun 16-bitlik adresini tutar.
5. **Stack Pointer (SP):** 64 KB'lık RAM içindeki LIFO yığın tepesini gösteren 16-bitlik yazmaçtır.
6. **FLAGS (Bayraklar):** 5 durum bayrağı vardır: `S` (Sign), `Z` (Zero), `AC` (Auxiliary Carry), `P` (Parity), `CY` (Carry).

---

## 14.6 Intel 8085 Komut Kümesi ve Adresleme Modları

8085 komutları 1, 2 veya 3 bayt uzunluğundadır:

### Temel 8085 Komutları:
- **Veri Transferi:**
  - `MOV r1, r2`: Yazmaçtan yazmaca kopyala (`MOV A, B`).
  - `MVI r, data8`: Yazmaca 8-bit anlık veri yükle (`MVI A, 35h`).
  - `LXI rp, data16`: 16-bitlik yazmaç çiftine anlık 16-bit adres yükle (`LXI H, 2000h` -> $HL = 2000h$).
  - `LDA addr16`: Doğrudan 16-bitlik bellek adresindeki baytı Akümülatöre oku (`LDA 2500h`).
  - `STA addr16`: Akümülatördeki baytı doğrudan 16-bitlik adrese sakla (`STA 2500h`).
  - `LHLD addr16` / `SHLD addr16`: HL çiftini bellekten doğrudan oku / belleğe sakla.
- **Aritmetik ve Mantık:**
  - `ADD r`: Akümülatöre yazmacı ekle ($A \leftarrow A + r$).
  - `SUB r`: Akümülatörden yazmacı çıkar ($A \leftarrow A - r$).
  - `INR r` / `DCR r`: 8-bit yazmacı 1 artır / 1 azalt.
  - `INX rp` / `DCX rp`: 16-bit yazmaç çiftini 1 artır / 1 azalt (`INX H`).
  - `DAD rp`: HL yazmaç çiftine belirtilen çifti 16-bit topla ($HL \leftarrow HL + rp$). 8085'in tek 16-bit toplama komutudur!
- **Akış Kontrolü:**
  - `JMP addr16`, `CALL addr16`, `RET`. Koşullu varyantlar: `JZ, JNZ, JC, JNC, JM, JP`.

> **Kritik Donanım Eksikliği:** Intel 8085 işlemcisinde **donanımsal Çarpma (MUL) ve Bölme (DIV) komutları YOKTUR!** Çarpma ve bölme işlemleri, yazılımcı tarafından yazılan ardışık toplama-kaydırma (Shift-and-Add) alt yordamları ile yazılımsal olarak çözülmek zorundaydı.

---

## 14.7 Intel 8085 Donanım Kesmeleri ve Öncelik Sıralaması

Intel 8085, harici aygıtlar için 5 adet dahili öncelikli kesme girişine sahiptir. Her kesme bellekte sabit bir vektör adresine doğrudan dallanır:

```
+-----------------------------------------------------------------------------------------+
|                  INTEL 8085 KESME ÖNCELİK VE VEKTÖR TABLOSU                             |
+-------------------+-----------------+-------------------+-------------------------------+
| Kesme Girişi      | Öncelik Sırası  | Sabit Vektör Adres| Maskelenebilirlik             |
+-------------------+-----------------+-------------------+-------------------------------+
| **TRAP**          | 1 (En Yüksek)   | 0024h             | Maskelenemez (NMI)            |
| **RST 7.5**       | 2               | 003Ch             | Maskelenebilir (Yükselen Kenar|
| **RST 6.5**       | 3               | 0034h             | Maskelenebilir (Yüksek Seviye)|
| **RST 5.5**       | 4               | 002Ch             | Maskelenebilir (Yüksek Seviye)|
| **INTR**          | 5 (En Düşük)    | Harici Donanım    | Maskelenebilir (Yüksek Seviye)|
+-------------------+-----------------+-------------------+-------------------------------+
```

1. **TRAP:** En yüksek öncelikli kesmedir. Asla maskelenemez (NMI dengi). Hem seviye hem kenar tetiklemelidir. Güç kesintisi gibi felaket durumlarında kullanılır.
2. **RST 7.5, RST 6.5, RST 5.5:** Dahili restart kesmeleridir. `SIM` (Set Interrupt Mask) komutuyla maskelenebilir, `RIM` (Read Interrupt Mask) ile durumları okunabilir.
3. **INTR:** En genel ve en düşük öncelikli kesmedir. Vektör adresi sabit değildir; harici donanım (örneğin 8259) veri yoluna bir `RST n` veya `CALL` komutu sürmelidir.

---

## 14.8 Kapsamlı Karşılaştırma: Intel 8085 vs. Intel 8086

Intel 8085'ten 8086'ya geçiş, mikroişlemci tarihinde basit bir frekans artışı değil; mimari bir kuantum sıçramasıdır.

### Intel 8085 ve 8086 Mimari Karşılaştırma Tablosu

| Mimari Parametre | Intel 8085 Mikroişlemcisi | Intel 8086 Mikroişlemcisi | Mimari Gelişme Analizi |
| :--- | :--- | :--- | :--- |
| **İşlemci Mimarisi (ALU)**| **8-bit** (Dahili veri yolları 8-bit)| **16-bit** (ALU ve genel yazmaçlar 16-bit)| İşlem gücü ve veri bant genişliği 2 katına çıktı. |
| **Adres Veriyolu Genişliği**| **16-bit** | **20-bit** | Adres hatları 4 bit genişletildi. |
| **Azami Bellek Kapasitesi**| **64 KB** ($2^{16}$ bayt) | **1 MB** ($2^{20} = 1,048,576$ bayt) | Bellek adresleme kapasitesi tam **16 katına** çıktı. |
| **Bellek Organizasyonu**   | Düz (Flat Memory Modeli, Tek Alan)| **Segmentli** (Segmented: 64 KB Segmentler)| Program, Veri, Yığın segmentleri bağımsız ayrıldı. |
| **Komut Ön Getirme Kuyruğu**| **YOK** (Tamamen ardışıl FDE döngüsü)| **VAR** (6-baytlık Prefetch FIFO Kuyruğu) | İlk komut boru hattı (pipelining) hayata geçti. |
| **Dahili Birim Ayrımı**    | Tek blok kontrol mantığı | **BIU (Veriyolu) ve EU (Yürütme) Ayrımı**| Komut getirme ile komut yürütme örtüştürüldü. |
| **Donanımsal Çarpma/Bölme**| **YOK** (Yazılımsal rutin zorunlu) | **VAR** (Donanımsal `MUL, IMUL, DIV, IDIV`)| Matematiksel işlem performansı 50-100 kat hızlandı. |
| **Dizi / String Komutları**| YOK (Tek tek döngüde bayt okunur) | **VAR** (`MOVS, LODS, STOS, CMPS, SCAS, REP`)| Yüksek hızlı bellek blok kopyalama getirildi. |
| **Tablo Çeviri Yeteneği**  | Elle dolaylı adresleme gerekir    | **VAR** (`XLAT / XLATB` komutu) | Kod dönüşümleri tek komuta indirildi. |
| **Saat Frekansı (İlk Sürüm)| $3\text{ MHz} - 5\text{ MHz}$ | $5\text{ MHz} - 10\text{ MHz}$ | Frekans tavanı artırıldı. |
| **G/Ç Port Kapasitesi**    | 256 Port (8-bit port adresi)      | 65536 Port (16-bit `DX` port adresi) | Port kapasitesi 256 kattan fazla büyüdü. |
| **Çalışma Modları**        | Tek Mod                           | Minimum Mod / Maximum Mod (8087 Coprocessor)| Çok işlemcili ve yardımcı işlemcili sistem desteği. |

Bu mimari devrim sayesinde Intel 8086, sonraki tüm x86 (80286, 80386, Pentium ve modern 64-bit Core i7/i9) işlemcilerinin doğrudan atası ve geriye dönük uyumluluk standardı haline gelmiştir.


---

# BÖLÜM 15: Paralel İşleme, Çok Çekirdekli Mimariler ve RISC vs. CISC (Parallel Processing, Multi-Core & RISC vs. CISC)

Bilgisayar mimarisinin evriminde tek bir işlemcinin saat frekansını artırarak performansı yükseltme dönemi, güç tüketimi ve aşırı ısınma engeline (Power Wall) çarparak sona ermiştir. Günümüz bilişim sistemlerinde performansı artırmanın mutlak yolu; çoklu komutların, çoklu verilerin ve çoklu iş parçacıklarının aynı anda yürütülmesine dayanan **Paralel İşleme (Parallel Processing)** ve çok çekirdekli mimarilerdir.

Bu bölümde; bilgisayar mimarilerini komut ve veri akışlarına göre sınıflandıran Flynn Taksonomisi, paralelliğin donanımsal ve yazılımsal seviyeleri (ILP, TLP, SIMD), paralel sistemlerin teorik başarım sınırlarını çizen Amdahl ve Gustafson Yasaları, bilgisayar tasarım felsefelerindeki iki dev ekol olan **RISC vs. CISC** çatışması ve modern işlemcilerin benimsediği hibrit mikro-operasyon (`µops`) mimarisi incelenecektir.

---

## 15.1 Paralel İşleme İlkeleri ve Flynn Taksonomisi (Flynn's Taxonomy)

1966 yılında Michael J. Flynn tarafından önerilen **Flynn Taksonomisi**, bilgisayar mimarilerini donanımdaki **Komut Akışı (Instruction Stream)** ve **Veri Akışı (Data Stream)** sayısına göre 4 temel sınıfa ayırır:

```
                          VERİ AKIŞI (DATA STREAM)
                          Tek Veri (Single Data)       Çoklu Veri (Multiple Data)
                      +-----------------------------+-----------------------------+
   Tek Komut          |          S I S D            |          S I M D            |
   (Single            | Single Instruction          | Single Instruction          |
   Instruction)       | Single Data                 | Multiple Data               |
KOMUT                 | (Klasik Von Neumann, 8086)  | (Vektör İşlemciler, GPU)    |
AKIŞI                 +-----------------------------+-----------------------------+
   Çoklu Komut        |          M I S D            |          M I M D            |
   (Multiple          | Multiple Instruction        | Multiple Instruction        |
   Instruction)       | Single Data                 | Multiple Data               |
                      | (Kritik Hata Toleransı, Uzay| (Modern Çok Çekirdekli CPU) |
                      +-----------------------------+-----------------------------+
```

Flynn Taksonomisi ve Çok İşlemcili Mimariler analizi:

1. **SISD (Single Instruction, Single Data):**
   Tek bir kontrol birimi tek bir komut akışını çeker ve tek bir veri akışı üzerinde icra eder. Geleneksel tek çekirdekli sıralı bilgisayarlar ve orijinal Intel 8086 işlemcisi tipik SISD örnekleridir.
2. **SIMD (Single Instruction, Multiple Data):**
   Tek bir komut (Instruction), eşzamanlı olarak birden fazla bağımsız veri elemanı üzerinde paralel icra edilir. Vektörel işlemciler, modern grafik işlem birimleri (GPU) ve Intel MMX / SSE / AVX komut kümeleri bu mimariye dayanır (örneğin tek bir `VADDPS` komutu ile 8 adet kayan noktalı sayının aynı anda toplanması).
3. **MISD (Multiple Instruction, Single Data):**
   Birden fazla farklı komut dizisi aynı tekil veri akışı üzerinde paralel çalışır. Çok nadir görülen bir mimaridir; temel kullanım alanı uzay araçları (Space Shuttle uçuş bilgisayarları) ve nükleer reaktör kontrol sistemlerindeki hata toleranslı (Fault-Tolerant) üçlü yedeklemeli (Triple Modular Redundancy) sistemlerdir.
4. **MIMD (Multiple Instruction, Multiple Data):**
   Birden fazla bağımsız işlemci veya çekirdek, birbirinden tamamen bağımsız komut dizilerini farklı veri kümeleri üzerinde eşzamanlı olarak yürütür. Günümüzün tüm modern çok çekirdekli (Multi-Core) işlemcileri, küme (Cluster) bilgisayarları ve süper bilgisayarları MIMD mimarisindedir.

---

## 15.2 Paralellik Düzeyleri: Bit, Komut (ILP), İş Parçacığı (TLP) ve Veri Paralelliği

Hesaplama mimarilerinde paralellik dört farklı hiyerarşik düzeyde gerçekleştirilir:

1. **Bit Düzeyinde Paralellik (Bit-Level Parallelism):**
   İşlemci kelime genişliğinin artırılmasıdır (4-bit'ten 8-bit 8085'e, 16-bit 8086'ya, 32-bit 80386'ya ve günümüz 64-bit mimarilerine geçiş). 64-bitlik bir toplama, 8-bitlik bir işlemcide 8 ardışık çevrim gerektirirken, 64-bitlik ALU'da tek saat çevriminde biter.
2. **Komut Düzeyinde Paralellik (ILP - Instruction-Level Parallelism):**
   Tek bir program akışı (tek thread) içindeki bağımsız komutların aynı anda yürütülmesidir:
   - **Boru Hattı (Pipelining):** Komut aşamalarının örtüştürülmesi.
   - **Süperskalar (Superscalar Execution):** İşlemciye birden fazla yürütme birimi (ALU, FPU, Yükleme/Saklama Birimi) eklenerek tek bir saat çevriminde birden fazla komutun aynı anda başlatılması ($IPC > 1$).
   - **Sırasız Yürütme (Out-of-Order Execution):** Komutların programdaki yazılış sırasına göre değil; verileri hazır oldukça bağımsız yürütülüp sonuçların sırayla yazılması.
   - **Çok Uzun Komut Kelimesi (VLIW):** Derleyicinin birbirine bağımlı olmayan komutları tek bir devasa komut paketinde birleştirmesi.
3. **İş Parçacığı Düzeyinde Paralellik (TLP - Thread-Level Parallelism):**
   Bir yazılımın birden fazla bağımsız iş parçacığına (thread) veya prosesine bölünerek farklı çekirdeklerde paralel koşturulmasıdır.
   - **Eşzamanlı Çoklu İş Parçacığı (SMT - Simultaneous Multithreading / Intel Hyper-Threading):** Tek bir fiziksel işlemci çekirdeğinin içinde iki bağımsız mimari durum (Registers, Program Counter) barındırarak, işletim sistemine iki mantıksal çekirdek gibi görünmesi ve tek çekirdeğin boş kalan yürütme birimlerini ikinci iş parçacığıyla doldurmasıdır.
4. **Veri Paralelliği (Data Parallelism):**
   Büyük veri dizilerinin parçalanarak SIMD veya GPU çekirdeklerinde eşzamanlı işlenmesidir.

---

## 15.3 Çok Çekirdekli (Multi-Core) İşlemci Mimarileri ve Bellek Organizasyonu

Çok çekirdekli (Multi-Core) sistemler, tek bir silikon yonga (die) üzerine iki veya daha fazla bağımsız işlemci çekirdeğinin entegre edilmesidir.

```
       +-------------------------------------------------------+
       |                  ÇOK ÇEKİRDEKLİ İŞLEMCİ               |
       |                                                       |
       |  +---------------------+     +---------------------+  |
       |  | Çekirdek 0 (Core 0) |     | Çekirdek 1 (Core 1) |  |
       |  | +--------+ +------+ |     | +--------+ +------+ |  |
       |  | | L1-I$  | | L1-D$| |     | | L1-I$  | | L1-D$| |  |
       |  | +--------+ +------+ |     | +--------+ +------+ |  |
       |  |      L2 Cache       |     |      L2 Cache       |  |
       |  +---------------------+     +---------------------+  |
       |             |                           |             |
       |             +-------------+-------------+             |
       |                           |                           |
       |           PAYLAŞILAN L3 ÖNBELLEK (SHARED L3 CACHE)    |
       |                           |                           |
       |               SİSTEM VERİYOLU ARAYÜZÜ                 |
       +-------------------------------------------------------+
                                   |
                           Ana Bellek (DRAM)
```

Çok çekirdekli mimarilerde bellek erişim yapısı ikiye ayrılır:
- **UMA (Uniform Memory Access - SMP):** Tüm çekirdekler ortak bir ana belleğe tek bir sistem veriyolu üzerinden eşit erişim süresiyle bağlanır.
- **NUMA (Non-Uniform Memory Access):** Her işlemci soketinin kendi yerel belleği vardır; başka bir soketin belleğine erişim interconnect (örneğin Intel UPI veya AMD Infinity Fabric) üzerinden geçer ve daha uzun sürer.

---

## 15.4 Paralel Başarım Sınırları: Amdahl Yasası (Amdahl's Law)

Bir bilgisayar programını hızlandırmak için sonsuz sayıda işlemci çekirdeği eklense dahi, ulaşılabilecek hızlanmanın katı bir matematiksel sınırı vardır. Bu gerçek, 1967 yılında Gene Amdahl tarafından formüle edilen **Amdahl Yasası (Amdahl's Law)** ile kanıtlanmıştır.

Amdahl Yasası, bir programın doğası gereği paralelleştirilemeyen (sıralı / seri çalışmak zorunda olan) bir kısmının, tüm sistemin hızlanmasını nasıl sınırladığını gösterir:

### Amdahl Yasası Matematiksel Modeli:
- $p$ = Programın paralel hale getirilebilen kesri ($0 \le p \le 1$)
- $1 - p$ = Programın zorunlu olarak seri (ardışıl) yürütülmesi gereken kesri (Seri Darboğaz)
- $s$ = Paralel kısma tahsis edilen hızlanma katsayısı (veya çekirdek sayısı $N$)

Amdahl Hızlanma Formülü:
$$S(s) = \frac{1}{(1 - p) + \frac{p}{s}}$$
$$S(s) = 1 / ((1 - p) + p/s)$$

### Amdahl Teorik Azami Hızlanma Tavanı (Speedup Ceiling):
Eğer sonsuz sayıda işlemci çekirdeği kullanılırsa ($s \to \infty$):
$$\lim_{s \to \infty} S(s) = \frac{1}{(1 - p) + 0} = \frac{1}{1 - p}$$
$$\text{Speedup Ceiling} = \frac{1}{1 - p}$$

#### Sayısal Örnek ve Çıkarımlar:
Bir programın %90'ı paralelleştirilebiliyor ($p = 0.90$), ancak %10'luk kısmı dosya okuma, G/Ç ve kilit mekanizmaları nedeniyle seri çalışmak zorunda olsun ($1 - p = 0.10$):
- 4 Çekirdekte: $S(4) = \frac{1}{0.10 + 0.90 / 4} = \frac{1}{0.10 + 0.225} = \frac{1}{0.325} \approx 3.07\text{ kat}$
- 16 Çekirdekte: $S(16) = \frac{1}{0.10 + 0.90 / 16} = \frac{1}{0.10 + 0.056} \approx 6.4\text{ kat}$
- Sonsuz Çekirdekte: $\lim_{s \to \infty} S(s) = \frac{1}{1 - 0.90} = \frac{1}{0.10} = \mathbf{10\text{ kat!}}$

> **Çarpıcı Sonuç:** Programın yalnızca %10'u seri olsa bile, 1 milyon çekirdek dahi taksanız sistem asla **10 kattan fazla** hızlanamaz! Amdahl Yasası, paralel programlamadaki en büyük düşmanın seri darboğazlar olduğunu açıkça gösterir.

---

## 15.5 Ölçeklenmiş Hızlanma: Gustafson Yasası (Gustafson's Law)

Amdahl Yasası, sabit boyutlu bir iş yükünün (Fixed Workload) daha fazla çekirdeğe dağıtılmasını modeller. Ancak 1988 yılında John Gustafson, paralel bilgisayarlar güçlendikçe kullanıcıların problemi sabit tutmadığını; problemin boyutunu (veri büyüklüğünü) çekirdek sayısıyla orantılı olarak büyüttüğünü gözlemlemiştir (**Ölçeklenmiş Hızlanma - Scaled Speedup**).

Büyük veri kümelerinde seri kısım ($1 - p$) toplam süre içinde giderek küçülür, paralel kısım baskın hale gelir.

### Gustafson Yasası Matematiksel Formülü:
$$S(s) = (1 - p) + s \cdot p$$
$$S(s) = (1 - p) + s * p$$

Örneğin $p = 0.90$ olan bir problemde çekirdek sayısı $s = 64$ yapıldığında ve problem boyutu da büyütüldüğünde:
$$S(64) = (1 - 0.90) + 64 \times 0.90 = 0.10 + 57.6 = \mathbf{57.7\text{ kat hızlanma!}}$$
Gustafson Yasası, süper bilgisayarların ve büyük veri analitiğinin neden devasa işlemci sayılarıyla verimli çalışabildiğini açıklar.

---

## 15.6 RISC (Reduced Instruction Set Computer) vs. CISC (Complex Instruction Set Computer)

1980'lerde bilgisayar mimarisi iki farklı tasarım felsefesi arasında büyük bir rekabete sahne olmuştur:

- **CISC Felsefesi (Intel x86, Motorola 68000, VAX):**
  Donanım karmaşık olmalı, tek bir komut çok adımlı karmaşık işleri bitirebilmeli, derleyicinin yükü hafifletilmeli ve bellek pahalı olduğu için program kodu mümkün olduğunca az bayt tutmalıdır.
- **RISC Felsefesi (ARM, MIPS, SPARC, RISC-V, PowerPC):**
  Komutlar çok basit, sabit uzunlukta ve tek saat çevriminde çalışacak şekilde tasarlanmalı; bellek erişimi yalnızca özel Load/Store komutlarıyla sınırlandırılmalı; karmaşık işler derleyici tarafından basit komutların dizilmesiyle çözülmelidir.

### RISC ve CISC Felsefeleri Kapsamlı Karşılaştırma Tablosu

Aşağıdaki referans tablosunda RISC ve CISC mimari paradigmalarının temel özellikleri karşılaştırılmıştır:

| Mimari Kriter | RISC (Reduced Instruction Set) | CISC (Complex Instruction Set) |
| :--- | :--- | :--- |
| **Komut Uzunluğu** | **Sabit Uzunlukta** (Daima 32-bit veya 16-bit)| **Değişken Uzunlukta** (1 bayttan 15 bayta kadar)|
| **Komut Kümesi Boyutu**| Küçük, basit temel komutlar | Devasa, yüzlerce karmaşık komut |
| **Bellek Erişimi** | **Yalnızca Load/Store Mimarisi:** ALU komutları doğrudan belleğe dokunamaz (`LDR/STR`). | **Doğrudan Bellek Operasyonları:** ALU komutları doğrudan bellekle çalışabilir (`ADD [BX+SI], AX`).|
| **Adresleme Modları** | Çok az, son derece basit adresleme modları | Çok sayıda, son derece karmaşık adresleme modları |
| **Yürütme Süresi** | Komutların neredeyse tamamı **1 çevrimde** biter.| Komutlar değişken sürelerde (1 ila onlarca çevrim) biter.|
| **Yazmaç Sayısı** | **Büyük Yazmaç Dosyası:** Genellikle 32 veya daha fazla genel yazmaç. | **Küçük Yazmaç Seti:** Tarihsel olarak 8-16 adet yazmaç (x86'da 8 genel yazmaç).|
| **Kontrol Birimi Tasarımı**| **Donanımsal Kablolu Mantık (Hardwired Logic):** Çok hızlı, yüksek frekanslı. | **Mikroprogramlı ROM (Microcode Control Unit):** Karmaşık kod çözücü mantık devreleri.|
| **Boru Hattı Uyumluluğu** | Sabit format sayesinde boru hattına mükemmel uyum. | Değişken uzunluk boru hattında aşırı karmaşıklık yaratır.|
| **Derleyici Rolü** | Çok karmaşık optimizasyon derleyicisi gerektirir. | Basit derleyici; komutlar doğrudan makineye yakındır.|
| **Modern Temsilciler** | ARM (Cortex serisi, Apple Silicon M1/M2/M3), RISC-V| Intel x86 (Core i3/i5/i7/i9), AMD Ryzen |

---

## 15.7 Modern İşlemcilerin Hibrit Mimarisi: CISC Komutlarının Mikro-Operasyonlara (µops) Çözülmesi

Günümüz bilgisayar mimarisi artık saf bir "CISC vs. RISC" kutuplaşmasında değildir; her iki felsefenin en güçlü yönlerini birleştiren **Hibrit Bir Mimari** standarda dönüşmüştür:

Intel Pentium Pro mimarisinden itibaren tüm modern x86 işlemciler (Intel Core ve AMD Ryzen serisi), dış dünyaya karşı x86 CISC komut kümesini kabul ederken, işlemci çekirdeğinin içinde **yüksek performanslı bir RISC motoru** barındırır.

```
       x86 CISC Komutları (Dış Dünya)
       (Örn: ADD [EBX+ECX*4+10h], EAX)
                      |
                      v
       +------------------------------------+
       |  Dahili Donanımsal Kod Çözücüler   |
       |  (Instruction Decoders)            |
       +------------------------------------+
                      |
                      | CISC komutu 3 basit RISC benzeri
                      | mikro-operasyona (uops) parçalanır:
                      v
       1. uop: LOAD  Reg_temp, [Adres]       (Bellekten oku)
       2. uop: ADD   Reg_temp, EAX           (ALU işlemi yap)
       3. uop: STORE [Adres],  Reg_temp      (Belleğe geri yaz)
                      |
                      v
       +------------------------------------+
       |   Süperskalar RISC Çekirdeği       |
       |   (Out-of-Order Execution Engine)  |
       +------------------------------------+
       (Çok sayıda paralel ALU'da uops'lar 1'er çevrimde icra edilir)
```

Bu dahili küçük parçalara **Mikro-Operasyonlar (Micro-operations / Micro-ops / µops)** denir.

### Hibrit Mimarinin Kazanımları:
1. **Yazılım Uyumluluğu:** 1978 yılından kalma milyarlarca satırlık x86 CISC yazılım kütüphaneleri yeniden derlenmeye gerek kalmaksızın çalışmaya devam eder.
2. **Donanım Verimliliği:** İşlemcinin çekirdeğindeki boru hatları sabit ve basit `µops` birimleriyle beslendiği için süperskalar, sırasız yürütme (out-of-order) ve dallanma tahmini algoritmaları saf bir RISC hızı ve verimliliğiyle icra edilir.


---

# EKLER (APPENDICES)

---

## EK A: 8086 Komut Kümesi ve Bayrak Etkileri Hızlı Başvuru Tablosu

Bu ekte, Intel 8086 mikroişlemcisinin tüm resmi komut kümesi, operand formatları, tahmini saat çevrimleri (clock cycles) ve 16-bitlik FLAGS yazmacındaki bayraklara olan etkileri toplu bir başvuru tablosu halinde sunulmuştur.

### Bayrak Açıklama Kısaltmaları:
- **`*` (Etkilenir)**: Komutun yürütme sonucuna göre bayrak 0 veya 1 yapılır.
- **`-` (Etkilenmez)**: Bayrak önceki değerini aynen korur.
- **`0` (Temizlenir)**: Bayrak daima 0 (sıfır) yapılır.
- **`1` (Kurulur)**: Bayrak daima 1 (bir) yapılır.
- **`?` (Tanımsız)**: Komut sonrası bayrağın değeri mimari tarafından garanti edilmez.

| Mnemonic | Sözdizimi (Syntax) | İşlem Açıklaması | CF | PF | AF | ZF | SF | OF | DF | IF | TF |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MOV** | `MOV dest, src` | Kaynaktan hedefe veri aktarımı (`dest <- src`) | - | - | - | - | - | - | - | - | - |
| **XCHG** | `XCHG op1, op2` | İki işlenenin değerini atomik takas eder | - | - | - | - | - | - | - | - | - |
| **PUSH** | `PUSH src16` | 16-bit veriyi yığına atar (`SP <- SP - 2, [SS:SP] <- src`) | - | - | - | - | - | - | - | - | - |
| **POP** | `POP dest16` | Yığından 16-bit veri çeker (`dest <- [SS:SP], SP <- SP + 2`) | - | - | - | - | - | - | - | - | - |
| **PUSHA** | `PUSHA` | 8 genel yazmacı yığına atar (AX, CX, DX, BX, SP, BP, SI, DI) | - | - | - | - | - | - | - | - | - |
| **POPA** | `POPA` | Yazmaçları yığından geri yükler (DI, SI, BP, skip, BX, DX, CX, AX) | - | - | - | - | - | - | - | - | - |
| **PUSHF** | `PUSHF` | 16-bit FLAGS yazmacını yığına atar | - | - | - | - | - | - | - | - | - |
| **POPF** | `POPF` | Yığından 16-bit FLAGS yazmacını geri yükler | * | * | * | * | * | * | * | * | * |
| **LEA** | `LEA reg16, [mem]` | Bellek işleneninin 16-bit efektif adresini yazmaca yükler | - | - | - | - | - | - | - | - | - |
| **LDS** | `LDS reg16, [mem32]` | 32-bit uzak işaretçiyi DS ve reg16 içine yükler | - | - | - | - | - | - | - | - | - |
| **LES** | `LES reg16, [mem32]` | 32-bit uzak işaretçiyi ES ve reg16 içine yükler | - | - | - | - | - | - | - | - | - |
| **XLAT** | `XLAT` / `XLATB` | Çeviri tablosundan bayt okur: `AL <- [DS:BX + AL]` | - | - | - | - | - | - | - | - | - |
| **IN** | `IN AL/AX, port` | G/Ç portundan AL veya AX içine bayt/kelime okur | - | - | - | - | - | - | - | - | - |
| **OUT** | `OUT port, AL/AX` | AL veya AX'teki bayt/kelimeyi G/Ç portuna yazar | - | - | - | - | - | - | - | - | - |
| **CBW** | `CBW` | AL baytının işaretini AX kelimesine uzatır (AH = sign(AL)) | - | - | - | - | - | - | - | - | - |
| **CWD** | `CWD` | AX kelimesinin işaretini DX:AX çift kelimesine uzatır | - | - | - | - | - | - | - | - | - |
| **LAHF** | `LAHF` | FLAGS alt baytını AH yazmacına kopyalar (SF, ZF, AF, PF, CF) | - | - | - | - | - | - | - | - | - |
| **SAHF** | `SAHF` | AH yazmacındaki bitleri FLAGS alt baytına yazar | * | * | * | * | * | - | - | - | - |
| **ADD** | `ADD dest, src` | İki işleneni toplar (`dest <- dest + src`) | * | * | * | * | * | * | - | - | - |
| **ADC** | `ADC dest, src` | İki işleneni Carry ile toplar (`dest <- dest + src + CF`) | * | * | * | * | * | * | - | - | - |
| **INC** | `INC dest` | İşleneni 1 artırır (`dest <- dest + 1`, CF korunur!) | - | * | * | * | * | * | - | - | - |
| **SUB** | `SUB dest, src` | İki işleneni çıkarır (`dest <- dest - src`) | * | * | * | * | * | * | - | - | - |
| **SBB** | `SBB dest, src` | İki işleneni Borç ile çıkarır (`dest <- dest - src - CF`) | * | * | * | * | * | * | - | - | - |
| **DEC** | `DEC dest` | İşleneni 1 azaltır (`dest <- dest - 1`, CF korunur!) | - | * | * | * | * | * | - | - | - |
| **NEG** | `NEG dest` | İkiye tümleyenini alır (`dest <- 0 - dest`) | * | * | * | * | * | * | - | - | - |
| **CMP** | `CMP dest, src` | Çıkarma simülasyonuyla bayrakları ayarlar (`dest - src`) | * | * | * | * | * | * | - | - | - |
| **MUL** | `MUL src` | İşaretsiz çarpma (8-bit: `AX <- AL*src`, 16-bit: `DX:AX <- AX*src`) | * | ? | ? | ? | ? | * | - | - | - |
| **IMUL** | `IMUL src` | İşaretli çarpma (üst yarı sıfır/işaret uzantısı değilse CF=OF=1) | * | ? | ? | ? | ? | * | - | - | - |
| **DIV** | `DIV src` | İşaretsiz bölme (8-bit: `AL=bölüm, AH=kalan`, 16-bit: `AX=bölüm, DX=kalan`) | ? | ? | ? | ? | ? | ? | - | - | - |
| **IDIV** | `IDIV src` | İşaretli bölme (sıfıra bölme veya sığmama durumunda Type 0) | ? | ? | ? | ? | ? | ? | - | - | - |
| **DAA** | `DAA` | Toplama sonrası AL'yi paketlenmiş BCD formatına dönüştürür | * | * | * | * | * | ? | - | - | - |
| **DAS** | `DAS` | Çıkarma sonrası AL'yi paketlenmiş BCD formatına dönüştürür | * | * | * | * | * | ? | - | - | - |
| **AAA** | `AAA` | Toplama sonrası AL'yi tek basamak ASCII formatına ayarlar | * | ? | * | ? | ? | ? | - | - | - |
| **AAS** | `AAS` | Çıkarma sonrası AL'yi tek basamak ASCII formatına ayarlar | * | ? | * | ? | ? | ? | - | - | - |
| **AAM** | `AAM` | İki ASCII çarpımı sonrası: `AH <- AL/10, AL <- AL%10` | ? | * | ? | * | * | ? | - | - | - |
| **AAD** | `AAD` | Bölme öncesi iki basamağı AL'ye paketler: `AL <- AH*10 + AL` | ? | * | ? | * | * | ? | - | - | - |
| **AND** | `AND dest, src` | Bit düzeyinde Boole VE işlemi (`OF=0, CF=0`) | 0 | * | ? | * | * | 0 | - | - | - |
| **OR** | `OR dest, src` | Bit düzeyinde Boole VEYA işlemi (`OF=0, CF=0`) | 0 | * | ? | * | * | 0 | - | - | - |
| **XOR** | `XOR dest, src` | Bit düzeyinde Boole DIŞLAMALI VEYA işlemi (`OF=0, CF=0`) | 0 | * | ? | * | * | 0 | - | - | - |
| **NOT** | `NOT dest` | Bire tümleyen (tüm bitleri tersleme, bayrakları etkilemez) | - | - | - | - | - | - | - | - | - |
| **TEST** | `TEST dest, src` | Yıkıcı olmayan Boole VE: hedefi değiştirmez, FLAGS günceller | 0 | * | ? | * | * | 0 | - | - | - |
| **SHL / SAL**| `SHL dest, count` | Mantıksal sola kaydırma: LSB'ye 0 girer, MSB -> CF | * | * | ? | * | * | * | - | - | - |
| **SHR** | `SHR dest, count` | Mantıksal sağa kaydırma: MSB'ye 0 girer, LSB -> CF | * | * | ? | * | * | * | - | - | - |
| **SAR** | `SAR dest, count` | Aritmetik sağa kaydırma: MSB işaretini korur, LSB -> CF | * | * | ? | * | * | * | - | - | - |
| **ROL** | `ROL dest, count` | Sola döngüsel döndürme: çıkan bit hem CF'ye hem LSB'ye girer | * | - | - | - | - | * | - | - | - |
| **ROR** | `ROR dest, count` | Sağa döngüsel döndürme: çıkan bit hem CF'ye hem MSB'ye girer | * | - | - | - | - | * | - | - | - |
| **RCL** | `RCL dest, count` | Carry dahil sola döndürme (9/17 bit halka: MSB->CF, eski CF->LSB)| * | - | - | - | - | * | - | - | - |
| **RCR** | `RCR dest, count` | Carry dahil sağa döndürme (9/17 bit halka: LSB->CF, eski CF->MSB)| * | - | - | - | - | * | - | - | - |
| **MOVSB/W** | `MOVSB` / `MOVSW` | `[DS:SI]` adresinden `[ES:DI]` adresine bayt/kelime aktarır | - | - | - | - | - | - | - | - | - |
| **LODSB/W** | `LODSB` / `LODSW` | `[DS:SI]` adresinden AL veya AX içine bayt/kelime yükler | - | - | - | - | - | - | - | - | - |
| **STOSB/W** | `STOSB` / `STOSW` | AL veya AX değerini `[ES:DI]` adresine yazar | - | - | - | - | - | - | - | - | - |
| **CMPSB/W** | `CMPSB` / `CMPSW` | `[DS:SI]` ile `[ES:DI]` adreslerindeki veriyi karşılaştırır | * | * | * | * | * | * | - | - | - |
| **SCASB/W** | `SCASB` / `SCASW` | AL/AX ile `[ES:DI]` adresindeki veriyi karşılaştırıp arar | * | * | * | * | * | * | - | - | - |
| **REP** | `REP string_op` | CX sıfır olana dek string komutunu tekrarlar (`CX <- CX - 1`) | - | - | - | - | - | - | - | - | - |
| **REPE/Z** | `REPE string_op`| CX != 0 ve ZF == 1 olduğu sürece string komutunu tekrarlar | - | - | - | - | - | - | - | - | - |
| **REPNE/NZ**| `REPNE string_op`| CX != 0 ve ZF == 0 olduğu sürece string komutunu tekrarlar | - | - | - | - | - | - | - | - | - |
| **JMP** | `JMP target` | Koşulsuz sıçrama (Short: $\pm 128$B, Near: $\pm 32$KB, Far: ptr16:16) | - | - | - | - | - | - | - | - | - |
| **JZ / JE** | `JZ target` | Sıfırsa veya eşitse sıçra ($ZF = 1$) | - | - | - | - | - | - | - | - | - |
| **JNZ / JNE**| `JNZ target` | Sıfır değilse veya eşit değilse sıçra ($ZF = 0$) | - | - | - | - | - | - | - | - | - |
| **JC / JB** | `JC target` | Elde varsa veya işaretsiz küçükse sıçra ($CF = 1$) | - | - | - | - | - | - | - | - | - |
| **JNC / JAE**| `JNC target` | Elde yoksa veya işaretsiz büyük/eşitse sıçra ($CF = 0$) | - | - | - | - | - | - | - | - | - |
| **JA / JNBE**| `JA target` | İşaretsiz büyükse sıçra ($CF = 0 \land ZF = 0$) | - | - | - | - | - | - | - | - | - |
| **JBE / JNA**| `JBE target` | İşaretsiz küçük veya eşitse sıçra ($CF = 1 \lor ZF = 1$) | - | - | - | - | - | - | - | - | - |
| **JG / JNLE**| `JG target` | İşaretli büyükse sıçra ($ZF = 0 \land SF = OF$) | - | - | - | - | - | - | - | - | - |
| **JGE / JNL**| `JGE target` | İşaretli büyük veya eşitse sıçra ($SF = OF$) | - | - | - | - | - | - | - | - | - |
| **JL / JNGE**| `JL target` | İşaretli küçükse sıçra ($SF \neq OF$) | - | - | - | - | - | - | - | - | - |
| **JLE / JNG**| `JLE target` | İşaretli küçük veya eşitse sıçra ($ZF = 1 \lor SF \neq OF$) | - | - | - | - | - | - | - | - | - |
| **JS / JNS** | `JS target` | İşaret negatifse ($SF = 1$) / pozitifse ($SF = 0$) sıçra | - | - | - | - | - | - | - | - | - |
| **JO / JNO** | `JO target` | Taşma varsa ($OF = 1$) / taşma yoksa ($OF = 0$) sıçra | - | - | - | - | - | - | - | - | - |
| **JP / JPE** | `JP target` | Parite çiftse sıçra ($PF = 1$) | - | - | - | - | - | - | - | - | - |
| **JNP / JPO**| `JNP target` | Parite tekse sıçra ($PF = 0$) | - | - | - | - | - | - | - | - | - |
| **LOOP** | `LOOP target` | `CX <- CX - 1`; CX != 0 ise hedefe sıçra | - | - | - | - | - | - | - | - | - |
| **LOOPE/Z** | `LOOPE target` | `CX <- CX - 1`; CX != 0 ve ZF == 1 ise hedefe sıçra | - | - | - | - | - | - | - | - | - |
| **LOOPNE/NZ**| `LOOPNE target`| `CX <- CX - 1`; CX != 0 ve ZF == 0 ise hedefe sıçra | - | - | - | - | - | - | - | - | - |
| **JCXZ** | `JCXZ target` | CX yazmacı tam sıfır ise sıçra (CX'i değiştirmez) | - | - | - | - | - | - | - | - | - |
| **CALL** | `CALL target` | Dönüş adresini yığına atıp alt yordama sıçrar | - | - | - | - | - | - | - | - | - |
| **RET** | `RET [n]` | Yığından dönüş adresini çeker (opsiyonel n bayt parametre atar) | - | - | - | - | - | - | - | - | - |
| **CLC** | `CLC` | Carry bayrağını temizler ($CF \leftarrow 0$) | 0 | - | - | - | - | - | - | - | - |
| **STC** | `STC` | Carry bayrağını kurar ($CF \leftarrow 1$) | 1 | - | - | - | - | - | - | - | - |
| **CMC** | `CMC` | Carry bayrağını tersler ($CF \leftarrow \overline{CF}$) | * | - | - | - | - | - | - | - | - |
| **CLD** | `CLD` | Yön bayrağını temizler ($DF \leftarrow 0$, otomatik artış $SI++, DI++$) | - | - | - | - | - | - | 0 | - | - |
| **STD** | `STD` | Yön bayrağını kurar ($DF \leftarrow 1$, otomatik azalış $SI--, DI--$) | - | - | - | - | - | - | 1 | - | - |
| **CLI** | `CLI` | Maskelenebilir kesmeleri kapatır ($IF \leftarrow 0$, INTR devre dışı) | - | - | - | - | - | - | - | 0 | - |
| **STI** | `STI` | Maskelenebilir kesmeleri açar ($IF \leftarrow 1$, INTR devrede) | - | - | - | - | - | - | - | 1 | - |
| **HLT** | `HLT` | İşlemciyi durdurur (harici kesme veya Reset gelene kadar uyur) | - | - | - | - | - | - | - | - | - |
| **NOP** | `NOP` | İşlemsiz çevrim (`XCHG AX, AX`, 1 bayt `90h`, 3 clock cycle) | - | - | - | - | - | - | - | - | - |
| **WAIT** | `WAIT` | TEST# pini aktif (düşük seviye) olana dek işlemciyi bekletir | - | - | - | - | - | - | - | - | - |
| **LOCK** | `LOCK prefix` | Komut süresince LOCK# pinini çekip sistem veriyolunu kilitler | - | - | - | - | - | - | - | - | - |
| **INT** | `INT n` | Yazılımsal kesme çağrısı: FLAGS, CS, IP saklar, IVT[n]'e dalar | - | - | - | - | - | - | - | 0 | 0 |
| **INTO** | `INTO` | Taşma kesmesi: Eğer OF == 1 ise INT 4 çağırır, değilse NOP | - | - | - | - | - | - | - | - | - |
| **IRET** | `IRET` | Kesme dönüşü: Yığından sırasıyla IP, CS ve FLAGS geri yükler | * | * | * | * | * | * | * | * | * |

---

## EK B: Kesme Vektör Tablosu (IVT 00000h–003FFh, Tip 0–255) Tam Haritası

8086 mikroişlemcisinde 1 MB Real Mode bellek alanının en altındaki ilk 1024 bayt (`00000h` ile `003FFh` arası) Kesme Vektör Tablosu'na (Interrupt Vector Table - IVT) tahsis edilmiştir. Bu tabloda 256 adet kesme tipinin her biri için 4 baytlık bir uzak işaretçi (Far Pointer: 2 bayt Ofset + 2 bayt Segment) saklanır.

$$\text{Fiziksel Başlangıç Adresi} = \text{Tip Numarası} \times 4$$

```
   Adres 4N + 0: Ofset Alt Baytı (Low Byte)
   Adres 4N + 1: Ofset Üst Baytı (High Byte)
   Adres 4N + 2: Segment Alt Baytı (Low Byte)
   Adres 4N + 3: Segment Üst Baytı (High Byte)
```

| Tip (Hex) | Tip (Dec) | Fiziksel Adres Aralığı | Standart Görevi ve Tetikleme Kaynağı | Sınıflandırma |
| :---: | :---: | :---: | :--- | :--- |
| **00h** | 0 | `00000h – 00003h` | **Divide by Zero Error**: Sıfıra bölme veya bölme sonucunun hedef yazmaca sığmaması (DIV / IDIV). | Intel Rezerve (İstisna) |
| **01h** | 1 | `00004h – 00007h` | **Single Step / Trace Trap**: Her komut yürütümünden sonra hata ayıklama kesmesi (TF=1). | Intel Rezerve (Tuzak) |
| **02h** | 2 | `00008h – 0000Bh` | **NMI (Non-Maskable Interrupt)**: Donanımsal NMI pininden gelen maskelenemez kritik hata (RAM parite, güç kesintisi). | Intel Rezerve (Donanım) |
| **03h** | 3 | `0000Ch – 0000Fh` | **Breakpoint (Kesme Noktası)**: 1 baytlık özel `0xCC` opkodu ile hata ayıklayıcı tuzaklama komutu. | Intel Rezerve (Yazılım) |
| **04h** | 4 | `00010h – 00013h` | **Overflow Trap (INTO)**: OF (Taşma Bayrağı) = 1 olduğunda INTO komutu tarafından tetiklenen tuzak. | Intel Rezerve (Yazılım) |
| **05h** | 5 | `00014h – 00017h` | **BOUND Range Exceeded / Print Screen**: 80186+ dizi sınır kontrolü; IBM PC'de Print Screen tuşu. | Intel / BIOS |
| **06h** | 6 | `00018h – 0001Bh` | **Invalid Opcode**: Tanımsız veya geçersiz işlem kodu yürütme girişimi (80286+). | Intel Rezerve |
| **07h** | 7 | `0001Ch – 0001Fh` | **Coprocessor Not Available**: Matematiksel işlemci (8087) bulunamadı veya ESC komutu hatası. | Intel Rezerve |
| **08h** | 8 | `00020h – 00023h` | **IRQ0 - Master PIC Zamanlayıcı**: 8253/8254 PIT Kanal 0 zamanlayıcı vuruşu (~18.2 Hz). | IBM PC Donanım (IRQ0) |
| **09h** | 9 | `00024h – 00027h` | **IRQ1 - Klavye Denetleyicisi**: Klavye tuşuna basıldığında (Make) veya bırakıldığında (Break) tetiklenir. | IBM PC Donanım (IRQ1) |
| **0Ah** | 10 | `00028h – 0002Bh` | **IRQ2 - Kaskat PIC**: PC/XT'de rezerve; PC/AT'de Slave 8259A PIC kaskat bağlantı hattı. | IBM PC Donanım (IRQ2) |
| **0Bh** | 11 | `0002Ch – 0002Fh` | **IRQ3 - İkinci Seri Port (COM2 / COM4)**: UART 16550 seri iletişim kesmesi. | IBM PC Donanım (IRQ3) |
| **0Ch** | 12 | `00030h – 00033h` | **IRQ4 - Birinci Seri Port (COM1 / COM3)**: UART 16550 seri iletişim kesmesi. | IBM PC Donanım (IRQ4) |
| **0Dh** | 13 | `00034h – 00037h` | **IRQ5 - Sabit Disk (XT) / Paralel Port 2 (LPT2)**: AT mimarisinde LPT2 yazıcı kesmesi. | IBM PC Donanım (IRQ5) |
| **0Eh** | 14 | `00038h – 0003Bh` | **IRQ6 - Disket Sürücü (FDC)**: Disket denetleyicisi veri aktarım tamamlandı bildirimi. | IBM PC Donanım (IRQ6) |
| **0Fh** | 15 | `0003Ch – 0003Fh` | **IRQ7 - Birinci Paralel Port (LPT1)**: Yazıcı meşgul/hazır kesmesi veya sahte kesme (Spurious). | IBM PC Donanım (IRQ7) |
| **10h** | 16 | `00040h – 00043h` | **BIOS Video Hizmetleri**: Ekran modu seçimi, imleç konumu, piksel/karakter yazma (AH fonksiyonları). | BIOS Servisi |
| **11h** | 17 | `00044h – 00047h` | **BIOS Ekipman Tespiti (Equipment List)**: Takılı disket, seri/paralel port ve video türünü AX'e döner. | BIOS Servisi |
| **12h** | 18 | `00048h – 0004Bh` | **BIOS Konvansiyonel Bellek Tespiti**: Sistemdeki TPA miktarını (maksimum 640 KB) AX'e döner. | BIOS Servisi |
| **13h** | 19 | `0004Ch – 0004Fh` | **BIOS Düşük Seviye Disk Hizmetleri**: Sektör oku/yaz/formatla, sürücü parametreleri (CHS/LBA). | BIOS Servisi |
| **14h** | 20 | `00050h – 00053h` | **BIOS Seri İletişim Hizmetleri**: RS-232 baud hızı ayarla, karakter gönder/al, durum oku. | BIOS Servisi |
| **15h** | 21 | `00054h – 00057h` | **BIOS Sistem Hizmetleri & E820 Bellek Haritası**: A20 hattı, APM güç yönetimi, CMOS saat. | BIOS Servisi |
| **16h** | 22 | `00058h – 0005Bh` | **BIOS Klavye Hizmetleri**: AH=00h tuş oku, AH=01h tuş tamponu durumu, AH=02h shift durum bayrakları. | BIOS Servisi |
| **17h** | 23 | `0005Ch – 0005Fh` | **BIOS Paralel Yazıcı Hizmetleri**: Karakter yaz, yazıcıyı ilkle, durum bayraklarını oku. | BIOS Servisi |
| **18h** | 24 | `00060h – 00063h` | **BIOS ROM Cassette BASIC**: Disket/disk önyükleme başarısız olduğunda ROM BASIC'i başlatır. | BIOS Servisi |
| **19h** | 25 | `00064h – 00067h` | **BIOS Bootstrap Loader**: Disk sektör 0'ı (MBR / Boot Sector) `0000:7C00h` adresine yükler ve yürütür. | BIOS Servisi |
| **1Ah** | 26 | `00068h – 0006Bh` | **BIOS Saat Hizmetleri**: Geceyarısından bu yana geçen vuruş sayısını oku/ayarla, RTC saat/tarih. | BIOS Servisi |
| **1Bh** | 27 | `0006Ch – 0006Fh` | **BIOS Ctrl+Break İşleyicisi**: Klavye sürücüsü tarafından çağrılan kullanıcı kesme kancası. | BIOS Servisi |
| **1Ch** | 28 | `00070h – 00073h` | **BIOS Kullanıcı Zamanlayıcı Kancası**: Her saat vuruşunda (IRQ0) çağrılan kullanıcı alt yordamı. | BIOS Servisi |
| **20h** | 32 | `00080h – 00083h` | **DOS Program Terminate**: Programı sonlandırır ve kontrolü COMMAND.COM'a devreder. | DOS Servisi |
| **21h** | 33 | `00084h – 00087h` | **DOS Genel Fonksiyon Dağıtıcısı**: Konsol G/Ç, dosya yönetimi, dinamik bellek, proses kontrolü. | DOS API (Temel) |
| **23h** | 35 | `0008Ch – 0008Fh` | **DOS Ctrl+C Denetim Kancası**: Kullanıcı Ctrl+C tuşladığında yürütülecek işleyici. | DOS Servisi |
| **24h** | 36 | `00090h – 00093h` | **DOS Kritik Hata İşleyicisi (Critical Error)**: "Abort, Retry, Ignore, Fail?" hata işleyicisi. | DOS Servisi |
| **27h** | 39 | `0009Ch – 0009Fh` | **DOS TSR (Terminate and Stay Resident)**: Programı bellekte bırakarak sonlandırır. | DOS Servisi |
| **2Fh** | 47 | `000BCh – 000BFh` | **DOS Çoklayıcı Kesmesi (Multiplex Interrupt)**: Yazdırma kuyruğu, CD-ROM sürücüsü, MSCDEX. | DOS Servisi |
| **33h** | 51 | `000CCh – 000CFh` | **MS Fare Sürücüsü (Mouse API)**: Fare imlecini göster/gizle, koordinatları oku, tıklamaları algıla. | Cihaz Sürücüsü |
| **70h** | 112 | `001C0h – 001C3h` | **IRQ8 - Slave PIC Gerçek Zaman Saati (RTC)**: CMOS periyodik veya alarm kesmesi. | IBM PC AT Donanım |
| **71h** | 113 | `001C4h – 001C7h` | **IRQ9 - Slave PIC Yönlendirilmiş IRQ2**: Kaskat hattı aktarımı. | IBM PC AT Donanım |
| **74h** | 116 | `001D0h – 001D3h` | **IRQ12 - Slave PIC PS/2 Fare**: PS/2 fare paketi hazır kesmesi. | IBM PC AT Donanım |
| **75h** | 117 | `001D4h – 001D7h` | **IRQ13 - Slave PIC Matematiksel İşlemci (FPU)**: Sayısal işlemci istisnası (FERR# sinyali). | IBM PC AT Donanım |
| **76h** | 118 | `001D8h – 001DBh` | **IRQ14 - Slave PIC Birinci IDE Sabit Disk**: Disk sektör okuma/yazma tamamlandı bildirimi. | IBM PC AT Donanım |
| **77h** | 119 | `001DCh – 001DFh` | **IRQ15 - Slave PIC İkinci IDE Sabit Disk**: İkincil kanal disk denetleyicisi bildirimi. | IBM PC AT Donanım |
| **80h–FFh** | 128–255 | `00200h – 003FFh` | **Kullanıcı ve Uygulama Yazılım Kesmeleri**: Serbestçe atanabilen Far Pointer vektör havuzu. | Kullanıcı Tanımlı |

---

## EK C: ASCII ve Donanım Tarama Kodları Tablosu

### C.1 Standart ASCII Karakter Tablosu (0–127)

| Hex | Dec | Karakter / Kısaltma | Fonksiyon / Anlamı | Hex | Dec | Karakter | Hex | Dec | Karakter | Hex | Dec | Karakter |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `00h` | 0 | **NUL** | Null (Boş Karakter / Dizi Sonu) | `20h` | 32 | **(Space)** | `40h` | 64 | **@** | `60h` | 96 | **`** |
| `01h` | 1 | **SOH** | Start of Heading (Başlık Başı) | `21h` | 33 | **!** | `41h` | 65 | **A** | `61h` | 97 | **a** |
| `02h` | 2 | **STX** | Start of Text (Metin Başı) | `22h` | 34 | **"** | `42h` | 66 | **B** | `62h` | 98 | **b** |
| `03h` | 3 | **ETX** | End of Text (Metin Sonu / Ctrl+C) | `23h` | 35 | **#** | `43h` | 67 | **C** | `63h` | 99 | **c** |
| `04h` | 4 | **EOT** | End of Transmission (Ctrl+D) | `24h` | 36 | **$** | `44h` | 68 | **D** | `64h` | 100 | **d** |
| `05h` | 5 | **ENQ** | Enquiry (Sorgu) | `25h` | 37 | **%** | `45h` | 69 | **E** | `65h` | 101 | **e** |
| `06h` | 6 | **ACK** | Acknowledge (Onay) | `26h` | 38 | **&** | `46h` | 70 | **F** | `66h` | 102 | **f** |
| `07h` | 7 | **BEL** | Bell (Zil Sesi / Bip) | `27h` | 39 | **'** | `47h` | 71 | **G** | `67h` | 103 | **g** |
| `08h` | 8 | **BS** | Backspace (Geri Alma) | `28h` | 40 | **(** | `48h` | 72 | **H** | `68h` | 104 | **h** |
| `09h` | 9 | **HT** | Horizontal Tab (Yatay Sekme) | `29h` | 41 | **)** | `49h` | 73 | **I** | `69h` | 105 | **i** |
| `0Ah` | 10 | **LF** | Line Feed (Alt Satıra Geçiş / \n) | `2Ah` | 42 | ***** | `4Ah` | 74 | **J** | `6Ah` | 106 | **j** |
| `0Bh` | 11 | **VT** | Vertical Tab (Düşey Sekme) | `2Bh` | 43 | **+** | `4Bh` | 75 | **K** | `6Bh` | 107 | **k** |
| `0Ch` | 12 | **FF** | Form Feed (Sayfa Başı / Ekran Temizle) | `2Ch` | 44 | **,** | `4Ch` | 76 | **L** | `6Ch` | 108 | **l** |
| `0Dh` | 13 | **CR** | Carriage Return (Satır Başı / \r) | `2Dh` | 45 | **-** | `4Dh` | 77 | **M** | `6Dh` | 109 | **m** |
| `0Eh` | 14 | **SO** | Shift Out | `2Eh` | 46 | **.** | `4Eh` | 78 | **N** | `6Eh` | 110 | **n** |
| `0Fh` | 15 | **SI** | Shift In | `2Fh` | 47 | **/** | `4Fh` | 79 | **O** | `6Fh` | 111 | **o** |
| `10h` | 16 | **DLE** | Data Link Escape | `30h` | 48 | **0** | `50h` | 80 | **P** | `70h` | 112 | **p** |
| `11h` | 17 | **DC1** | Device Control 1 (XON) | `31h` | 49 | **1** | `51h` | 81 | **Q** | `71h` | 113 | **q** |
| `12h` | 18 | **DC2** | Device Control 2 | `32h` | 50 | **2** | `52h` | 82 | **R** | `72h` | 114 | **r** |
| `13h` | 19 | **DC3** | Device Control 3 (XOFF) | `33h` | 51 | **3** | `53h` | 83 | **S** | `73h` | 115 | **s** |
| `14h` | 20 | **DC4** | Device Control 4 | `34h` | 52 | **4** | `54h` | 84 | **T** | `74h` | 116 | **t** |
| `15h` | 21 | **NAK** | Negative Acknowledge (Ret) | `35h` | 53 | **5** | `55h` | 85 | **U** | `75h` | 117 | **u** |
| `16h` | 22 | **SYN** | Synchronous Idle | `36h` | 54 | **6** | `56h` | 86 | **V** | `76h` | 118 | **v** |
| `17h` | 23 | **ETB** | End of Transmission Block | `37h` | 55 | **7** | `57h` | 87 | **W** | `77h` | 119 | **w** |
| `18h` | 24 | **CAN** | Cancel (İptal) | `38h` | 56 | **8** | `58h` | 88 | **X** | `78h` | 120 | **x** |
| `19h` | 25 | **EM** | End of Medium | `39h` | 57 | **9** | `59h` | 89 | **Y** | `79h` | 121 | **y** |
| `1Ah` | 26 | **SUB** | Substitute (DOS Dosya Sonu: EOF) | `3Ah` | 58 | **:** | `5Ah` | 90 | **Z** | `7Ah` | 122 | **z** |
| `1Bh` | 27 | **ESC** | Escape (Kaçış Karakteri) | `3Bh` | 59 | **;** | `5Bh` | 91 | **[** | `7Bh` | 123 | **{** |
| `1Ch` | 28 | **FS** | File Separator | `3Ch` | 60 | **<** | `5Ch` | 92 | **\\** | `7Ch` | 124 | **\|** |
| `1Dh` | 29 | **GS** | Group Separator | `3Dh` | 61 | **=** | `5Dh` | 93 | **]** | `7Dh` | 125 | **}** |
| `1Eh` | 30 | **RS** | Record Separator | `3Eh` | 62 | **>** | `5Eh` | 94 | **^** | `7Eh` | 126 | **~** |
| `1Fh` | 31 | **US** | Unit Separator | `3Fh` | 63 | **?** | `5Fh` | 95 | **_** | `7Fh` | 127 | **DEL** |

### C.2 IBM PC/AT Klavye Tarama Kodları (Set 1 Scan Codes)

Klavyede bir tuşa basıldığında (Make) klavye denetleyicisi (8042) sisteme bir Make Code üretir. Tuş bırakıldığında ise Make Code'un en yüksek bitine 1 eklenerek ($80h + \text{Make}$) Break Code üretilir.

| Tuş | Make Code (Hex) | Break Code (Hex) | Tuş | Make Code (Hex) | Break Code (Hex) | Tuş | Make Code (Hex) | Break Code (Hex) |
| :--- | :---: | :---: | :--- | :---: | :---: | :--- | :---: | :---: |
| **ESC** | `01h` | `81h` | **A** | `1Eh` | `9Eh` | **F1** | `3Bh` | `BBh` |
| **1 / !** | `02h` | `82h` | **S** | `1Fh` | `9Fh` | **F2** | `3Ch` | `BCh` |
| **2 / @** | `03h` | `83h` | **D** | `20h` | `A0h` | **F3** | `3Dh` | `BDh` |
| **Backspace** | `0Eh` | `8Eh` | **Enter** | `1Ch` | `9Ch` | **F4** | `3Eh` | `BEh` |
| **Tab** | `0Fh` | `8Fh` | **Sol Ctrl** | `1Dh` | `9Dh` | **F5** | `3Fh` | `BFh` |
| **Q** | `10h` | `90h` | **Sol Shift** | `2Ah` | `AAh` | **F10** | `44h` | `C4h` |
| **W** | `11h` | `91h` | **Sağ Shift**| `36h` | `B6h` | **Yukarı Ok** | `E0h 48h` | `E0h C8h` |
| **E** | `12h` | `92h` | **Space (Boşluk)** | `39h` | `B9h` | **Aşağı Ok** | `E0h 50h` | `E0h D0h` |
| **R** | `13h` | `93h` | **Caps Lock** | `3Ah` | `BAh` | **Sol Ok** | `E0h 4Bh` | `E0h CBh` |
| **T** | `14h` | `94h` | **Sol Alt** | `38h` | `B8h` | **Sağ Ok** | `E0h 4Dh` | `E0h CDh` |

### C.3 Standart VGA Mod 13h (320x200, 256 Renk) Temel Palet İndeksleri

| İndeks | Renk Adı (Türkçe / İngilizce) | RGB Değeri | İndeks | Renk Adı (Türkçe / İngilizce) | RGB Değeri |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **0** | Siyah (Black) | `(0, 0, 0)` | **8** | Koyu Gri (Dark Gray) | `(85, 85, 85)` |
| **1** | Mavi (Blue) | `(0, 0, 170)` | **9** | Açık Mavi (Light Blue) | `(85, 85, 255)` |
| **2** | Yeşil (Green) | `(0, 170, 0)` | **10** | Açık Yeşil (Light Green) | `(85, 255, 85)` |
| **3** | Camgöbeği (Cyan) | `(0, 170, 170)` | **11** | Açık Camgöbeği (Light Cyan) | `(85, 255, 255)` |
| **4** | Kırmızı (Red) | `(170, 0, 0)` | **12** | Açık Kırmızı (Light Red) | `(255, 85, 85)` |
| **5** | Eflatun / Macenta (Magenta) | `(170, 0, 170)` | **13** | Açık Eflatun (Light Magenta) | `(255, 85, 255)` |
| **6** | Kahverengi (Brown) | `(170, 85, 0)` | **14** | Sarı (Yellow) | `(255, 255, 85)` |
| **7** | Açık Gri (Light Gray) | `(170, 170, 170)` | **15** | Parlak Beyaz (Bright White) | `(255, 255, 255)` |

---

## EK D: 8085 vs 8086 Mnemonic Çevrim ve Karşılaştırma Rehberi

Intel 8085 (1976), 8-bitlik veri veriyolu ve 16-bitlik adres veriyoluna sahip klasik bir Von Neumann mikroişlemcisidir. Intel 8086 (1978) ise 8085'in kaynak kod seviyesinde yukarı doğru uyumlu (upward compatible) olacak şekilde tasarlanmış 16-bitlik ilk x86 işlemcisidir. Bu ek, 8085 montaj programlarının 8086 ortamına taşınması için doğrudan bir çevrim sözlüğü sunmaktadır.

### D.1 Komut Seviyesinde Birebir Çevrim Tablosu

| 8085 Komutu | 8085 Açıklaması | 8086 Karşılığı (Intel Sözdizimi) | Mimari Değişim ve Dikkat Edilecek Hususlar |
| :--- | :--- | :--- | :--- |
| `MOV r1, r2` | Yazmaçtan yazmaca kopyala | `MOV r1, r2` | Doğrudan uyumlu (Örn: `MOV A, B` -> `MOV AL, BL`) |
| `MVI r, data8` | Yazmaca 8-bit anlık veri yükle | `MOV r, data8` | 8086'da tek bir `MOV` genel komutu kullanılır |
| `LXI rp, data16` | Yazmaç çiftine 16-bit veri yükle | `MOV rp, data16` | Örn: `LXI H, 1234h` -> `MOV BX, 1234h` |
| `LDA addr16` | Bellekten Akümülatöre oku | `MOV AL, [addr16]` | Doğrudan adresleme köşeli parantez `[...]` ile belirtilir |
| `STA addr16` | Akümülatörden belleğe yaz | `MOV [addr16], AL` | Doğrudan adresleme hedef yapılır |
| `LHLD addr16` | Bellekten L ve H içine 16-bit oku | `MOV BX, [addr16]` | 8085 HL çifti 8086'da çoğunlukla BX veya SI/DI ile eşleşir |
| `SHLD addr16` | H ve L içeriğini belleğe yaz | `MOV [addr16], BX` | 16-bit kelime doğrudan belleğe Little-Endian yazılır |
| `LDAX B` / `D` | BC veya DE çiftinin gösterdiği bellek | `MOV AL, [BX]` / `[BP]` | 8086'da dolaylı adresleme `[BX]`, `[BP]`, `[SI]`, `[DI]` iledir |
| `STAX B` / `D` | Akümülatörü BC/DE işaretine yaz | `MOV [BX], AL` / `[BP]` | Dolaylı hedefe yazma |
| `ADD r` / `M` | Akümülatöre yazmaç/bellek ekle | `ADD AL, r` / `ADD AL, [BX]` | 8086'da hedef daima açıkça belirtilmelidir (`AL`) |
| `ADI data8` | Akümülatöre anlık sayı ekle | `ADD AL, data8` | Anlık toplama genel `ADD` komutuna indirgenir |
| `ADC r` / `M` | Carry ile Akümülatöre topla | `ADC AL, r` / `ADC AL, [BX]` | Eldeli toplama doğrudan uyumludur |
| `SUB r` / `M` | Akümülatörden yazmaç/bellek çıkar | `SUB AL, r` / `SUB AL, [BX]` | Hedef `AL` olarak açıkça yazılır |
| `SUI data8` | Akümülatörden anlık sayı çıkar | `SUB AL, data8` | Doğrudan çıkarma |
| `SBB r` / `M` | Borç (Borrow/CF) ile çıkar | `SBB AL, r` / `SBB AL, [BX]` | Borçlu çıkarma doğrudan uyumludur |
| `INR r` / `M` | 8-bit yazmacı veya belleği 1 artır | `INC r` / `INC BYTE PTR [BX]`| Her iki mimaride de `INC` Carry (CF) bayrağına dokunmaz! |
| `DCR r` / `M` | 8-bit yazmacı veya belleği 1 azalt | `DEC r` / `DEC BYTE PTR [BX]`| Her iki mimaride de `DEC` Carry (CF) bayrağını korur |
| `INX rp` | 16-bit yazmaç çiftini 1 artır | `INC rp` (Örn: `INC BX`) | 8085'te `INX` hiçbir bayrağı etkilemez; 8086'da da CF değişmez |
| `DCX rp` | 16-bit yazmaç çiftini 1 azalt | `DEC rp` (Örn: `DEC BX`) | 16-bit azaltma |
| `DAD rp` | `HL <- HL + rp` 16-bit toplama | `ADD BX, rp` (veya `ADD SI, rp`)| 8085'te sadece CY bayrağını etkiler; 8086'da tüm bayraklar güncellenir |
| `ANA r` / `M` | Boole VE işlemi | `AND AL, r` / `AND AL, [BX]` | Mantıksal VE |
| `ANI data8` | Anlık sayı ile Boole VE | `AND AL, data8` | Bit maskeleme |
| `ORA r` / `M` | Boole VEYA işlemi | `OR AL, r` / `OR AL, [BX]` | Mantıksal VEYA |
| `XRA r` / `M` | Boole DIŞLAMALI VEYA | `XOR AL, r` / `XOR AL, [BX]` | `XRA A` yazmaç sıfırlar; 8086'da `XOR AL, AL` |
| `CMA` | Akümülatörün 1'e tümleyenini al | `NOT AL` | Tüm bitleri tersler |
| `CMC` | Carry bayrağını tersle | `CMC` | Birebir aynı mnemonik |
| `STC` | Carry bayrağını 1 yap | `STC` | Birebir aynı mnemonik |
| `CMP r` / `M` | Akümülatör ile karşılaştır | `CMP AL, r` / `CMP AL, [BX]` | Çıkarma yoluyla bayrakları günceller |
| `CPI data8` | Anlık veri ile karşılaştır | `CMP AL, data8` | Anlık karşılaştırma |
| `RLC` | Akümülatörü Carry olmadan sola döndür| `ROL AL, 1` | 8086'da kaydırma miktarı (1 veya CL) belirtilir |
| `RRC` | Akümülatörü Carry olmadan sağa döndür| `ROR AL, 1` | Döngüsel sağa döndürme |
| `RAL` | Carry dahil 9-bit sola döndür | `RCL AL, 1` | Rotate through Carry Left |
| `RAR` | Carry dahil 9-bit sağa döndür | `RCR AL, 1` | Rotate through Carry Right |
| `JMP addr16` | Koşulsuz sıçrama | `JMP addr16` | 8086 segment içi near jump kullanır |
| `JC` / `JNC` | Elde Varsa / Yoksa sıçra | `JC target` / `JNC target` | Birebir aynı mnemonikler |
| `JZ` / `JNZ` | Sıfırsa / Sıfır Değilse sıçra | `JZ target` / `JNZ target` | Birebir aynı mnemonikler |
| `JM` / `JP` | Negatifse (Minus) / Pozitifse sıçra | `JS target` / `JNS target` | 8086'da Sign bayrağı `JS`/`JNS` olarak adlandırılır |
| `JPE` / `JPO`| Parite Çiftse / Tekse sıçra | `JP target` / `JNP target` | Birebir aynı bayrak mantığı |
| `CALL addr16`| Alt yordam çağrısı | `CALL addr16` | Dönüş adresi yığına atılır |
| `RET` | Alt yordamdan dönüş | `RET` | Yığından dönüş adresi IP'ye çekilir |
| `PCHL` | Program sayacına HL yükle | `JMP BX` (veya `JMP SI`) | Dolaylı yazmaç sıçraması (Indirect Jump) |
| `SPHL` | Stack Pointer'a HL yükle | `MOV SP, BX` | Yığın işaretçisini taban adresine kurma |
| `XCHG` | DE ile HL çiftini takas et | `XCHG DX, BX` | Atomik yazmaç takası |
| `XTHL` | Yığın tepesi ile HL'yi takas et | `POP AX; XCHG AX, BX; PUSH AX`| Veya `XCHG BX, [SP]` |
| `PUSH rp` | Yazmaç çiftini yığına at | `PUSH rp` (Örn: `PUSH BX`) | x86 yığını 16-bit olarak aşağı doğru büyür |
| `POP rp` | Yığından yazmaç çiftine çek | `POP rp` (Örn: `POP BX`) | Yığından geri çekme |
| `IN port8` | 8-bit G/Ç portundan oku | `IN AL, port8` | Port adresi sabit veya DX yazmacında |
| `OUT port8` | 8-bit G/Ç portuna yaz | `OUT port8, AL` | Veri kaynağı AL veya AX |
| `EI` / `DI` | Kesmeleri Aç / Kapat | `STI` / `CLI` | 8086'da `STI` (Set IF) ve `CLI` (Clear IF) |
| `HLT` | İşlemciyi durdur | `HLT` | Birebir aynı mnemonik |
| `NOP` | İşlemsiz çevrim (Boş işlem) | `NOP` | Birebir aynı mnemonik |
| `RIM` / `SIM` | Seri G/Ç ve Kesme Maskesi | 8259A PIC portları / UART | 8086'da seri ve kesme mantığı harici çiplere devredilmiştir |

---

## EK E: Donanım ve Mimari Referans Tabloları

Bu ek, kitabın ilgili bölümlerinde detaylandırılan 10 temel donanım ve mimari tablosunu hızlı başvuru ve karşılaştırma amacıyla tek bir çatı altında toplamaktadır.

### E.1 16-Bit FLAGS (Bayrak) Yazmacı Bit Pozisyonları ve Görevleri Tablosu

| Bit | CF (Carry) | PF (Parity) | AF | ZF (Zero) | SF | TF | IF | DF | OF (Overflow) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Pozisyon | Bit 0 (Elde) | Bit 2 (Parite) | Bit 4 (Aux) | Bit 6 (Sıfır) | Bit 7 (İşaret) | Bit 8 (Tuzak) | Bit 9 (Kesme) | Bit 10 (Yön) | Bit 11 (Taşma) |
| Görevi | İşaretsiz aritmetik elde/borç | Alt 8-bitte çift sayıda 1 varlığı | BCD basamaklar arası yardımcı elde | İşlem sonucunun tam sıfır olması | Sonucun MSB işaret biti (negatif=1) | Tek adım (single-step) hata ayıklama | Maskelenebilir donanım kesme izni | String komutlarında işaretçi artış/azalış yönü | İşaretli aritmetik taşma durumu |

### E.2 Varsayılan Segment-Offset Yazmaç Eşleşmeleri Tablosu

| Varsayılan Çift | CS:IP Code Segment | SS:SP Stack Segment | DS:BX Data Segment | ES:DI |
| :--- | :--- | :--- | :--- | :--- |
| **Yazmaç Eşleşmesi** | CS:IP | SS:SP / SS:BP | DS:BX / DS:SI / DS:DI | ES:DI (String Hedef) |
| **Bellek Türü** | Program Kodu & Komut Getirme | Yığın & Yerel Yığın Parametreleri | Genel Bellek Verileri & Diziler | String Hedef Bellek Alanı |
| **Fiziksel Adres** | $\text{CS} \times 16 + \text{IP}$ | $\text{SS} \times 16 + \text{SP}$ | $\text{DS} \times 16 + \text{EA}$ | $\text{ES} \times 16 + \text{DI}$ |

### E.3 8086 Makine Kodu MOD-REG-R/M Kod Çözümleme Tablosu

| MOD | REG | R/M | Adresleme Modu / Efektif Adres (EA) Formülü |
| :---: | :---: | :---: | :--- |
| `00` | 000–111 | `000` | `[BX + SI]` (Deplasmansız Base-Plus-Index) |
| `00` | 000–111 | `001` | `[BX + DI]` (Deplasmansız Base-Plus-Index) |
| `00` | 000–111 | `010` | `[BP + SI]` (Deplasmansız Base-Plus-Index, varsayılan segment SS) |
| `00` | 000–111 | `011` | `[BP + DI]` (Deplasmansız Base-Plus-Index, varsayılan segment SS) |
| `00` | 000–111 | `100` | `[SI]` (Register Indirect) |
| `00` | 000–111 | `101` | `[DI]` (Register Indirect) |
| `00` | 000–111 | `110` | Doğrudan Adresleme: `[disp16]` (DİKKAT: `[BP]` DEĞİLDİR!) |
| `00` | 000–111 | `111` | `[BX]` (Register Indirect) |
| `01` | 000–111 | `000–111` | 8-bit işaret uzatmalı deplasman: `[R/M + disp8]` |
| `10` | 000–111 | `000–111` | 16-bit deplasman: `[R/M + disp16]` |
| `11` | 000–111 | `000–111` | Yazmaç Adresleme Modu (Bellek yok: W=0 ise 8-bit, W=1 ise 16-bit reg) |

### E.4 Koşullu Sıçrama (Jcc) Komutları ve Bayrak Şartları Tablosu

| Komut | JZ / JE | JNZ / JNE | JA / JB / JG / JL | Bayrak Şartı & Matematiksel Koşul |
| :--- | :---: | :---: | :---: | :--- |
| **JZ / JE** | 1 | 0 | - | $ZF = 1$ (Sıfır sonucu veya karşılaştırılanlar eşit) |
| **JNZ / JNE**| 0 | 1 | - | $ZF = 0$ (Sıfır değil veya eşit değil) |
| **JA / JNBE**| 0 | 1 | JA ($CF=0 \land ZF=0$) | İşaretsiz büyük (Above) |
| **JB / JNAE**| - | - | JB ($CF=1$) | İşaretsiz küçük (Below / Carry var) |
| **JG / JNLE**| 0 | 1 | JG ($ZF=0 \land SF=OF$) | İşaretli büyük (Greater) |
| **JL / JNGE**| - | - | JL ($SF \neq OF$) | İşaretli küçük (Less) |

### E.5 8255 PPI Kontrol Kelimesi Bit Formatı Tablosu

| Kontrol Biti | Grup A Port A | Grup B Port B | Mode 0 Mod 0 D7 | Mod Açıklaması |
| :---: | :---: | :---: | :---: | :--- |
| **D7** | - | - | 1 (Mod Tanımlama Aktif) | D7=1: G/Ç Mod Tanımlama; D7=0: BSR Modu |
| **D6–D5**| Grup A Mod Seçimi | - | 00 = Mode 0 (Temel G/Ç) | 01 = Mode 1 (Strobed G/Ç), 1x = Mode 2 (Çift Yönlü) |
| **D4** | Port A Yönü (1=Giriş, 0=Çıkış)| - | - | Port A 8-bit veri yönü |
| **D3** | Port C Üst (PC7–PC4) Yönü | - | - | Port C üst nipel veri yönü |
| **D2** | - | Grup B Mod Seçimi | 0 = Mode 0, 1 = Mode 1 | Grup B (Port B & PC Alt) Modu |
| **D1** | - | Port B Yönü (1=Giriş, 0=Çıkış)| - | Port B 8-bit veri yönü |
| **D0** | - | Port C Alt (PC3–PC0) Yönü | - | Port C alt nipel veri yönü |

### E.6 Intel Rezerve Özel Kesmeler (Tip 0 – Tip 4) Tablosu

| Kesme Tipi | Type 0 Tip 0 | Type 1 Tip 1 | Type 2 Tip 2 NMI | Type 3 Breakpoint | Type 4 INTO Overflow |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Vektör Adresi**| `00000h` | `00004h` | `00008h` | `0000Ch` | `00010h` |
| **Tetiklenme** | DIV / IDIV sıfıra bölme | TF (Trap Flag) = 1 | NMI harici pini (Donanım) | `0xCC` 1-bayt opkodu | OF = 1 iken `INTO` komutu |
| **Öncelik** | Komut içi istisna | Komut sonu tuzak | Donanım (Maskelenemez) | Yazılım kesmesi | Yazılım kesmesi |
| **Kullanım** | Sıfıra bölme hatası işleme| Adım adım hata ayıklama | RAM parite, kritik güç kesintisi| Debugger tuzaklama noktası | İşaretli taşma denetimi |

### E.7 8237 DMA Denetleyicisi Dahili Yazmaç Haritası Tablosu

| Yazmaç Adı | Command Komut | Mode Mod | Mask Maske | Address Count Yazmaçları |
| :--- | :---: | :---: | :---: | :--- |
| **Base / Current Address** | - | - | - | 16-bitlik transfer başlangıç ve anlık bellek adresi |
| **Base / Current Word Count**| - | - | - | 16-bitlik aktarılacak bayt/kelime sayısı ($N-1$) |
| **Command Register** | Command Komut | - | - | Bellek-bellek transfer izni, denetleyici aç/kapa, DREQ/DACK polaritesi |
| **Mode Register** | - | Mode Mod | - | Kanal seçimi, transfer yönü (Okuma/Yazma/Doğrulama), transfer modu (Demand/Single/Block/Cascade) |
| **Mask Register** | - | - | Mask Maske | Bağımsız kanalların (Kanal 0–3) DREQ taleplerini maskeleme/etkinleştirme |

### E.8 Bellek Hiyerarşisi Piramidi Hız, Kapasite ve Maliyet Tablosu

| Hiyerarşi Seviyesi | Register Yazmaç | L1 L2 L3 Önbellek | DRAM RAM Ana Bellek | SSD Disk |
| :--- | :--- | :--- | :--- | :--- |
| **Tipik Kapasite** | $< 1\text{ KB}$ | L1: 32–64 KB, L2: 256KB–1MB, L3: 8–64 MB | 8 GB – 64 GB | 512 GB – 4 TB (SSD), 2–16 TB (HDD) |
| **Erişim Süresi** | $< 1\text{ ns}$ (0–1 clock) | L1: 1–2 ns, L2: 3–10 ns, L3: 10–20 ns | 50 – 100 ns | SSD: 10–100 µs, HDD: 5–10 ms |
| **Bant Genişliği** | Terabayt/sn (Dahili) | 500 – 1000 GB/sn | 25 – 100 GB/sn | SSD: 2–7 GB/sn, HDD: 150–250 MB/sn |
| **Maliyet / Bayt** | En yüksek (Çip içi) | Çok yüksek (SRAM) | Orta / Düşük (DRAM) | Çok düşük (NAND Flash / Manyetik) |

### E.9 Intel 8085 ve 8086 Mimari Karşılaştırma Tablosu

| Kriter | 8085 | 8086 | 8-bit / 16-bit, 64 KB / 1 MB Adresleme ve Mimari Fark |
| :--- | :--- | :--- | :--- |
| **Veri Yolu Genişliği** | 8-bit | 16-bit | 8086 tek çevrimde 16-bit tam kelime transfer edebilir |
| **Adres Veriyolu** | 16-bit | 20-bit | $2^{16} = 64\text{ KB}$ vs $2^{20} = 1\text{ MB}$ adres uzayı |
| **Bellek Mimarisi** | Düz (Flat) 64 KB | Segmentli (64 KB'lık CS, DS, SS, ES segmentleri) | Segment:Offset ile 1 MB adres üretimi |
| **Komut Ön Getirme** | Yok | 6-baytlık FIFO Prefetch Queue | BIU ve EU birimleri arasında komut boru hattı |
| **Çarpma & Bölme** | Yazılımsal rutin | Donanımsal `MUL`, `IMUL`, `DIV`, `IDIV` | Donanımsal ALU çarpma ve bölme birimi |

### E.10 RISC ve CISC Felsefeleri Kapsamlı Karşılaştırma Tablosu

| Mimari Özellik | RISC | CISC | Instruction Komut Register Yazmaç Mantığı |
| :--- | :--- | :--- | :--- |
| **Komut Kümesi Boyutu** | Az sayıda, basit ve düzenli | Çok sayıda, karmaşık ve çok işlevli | RISC komutları tekil işlev yapar; CISC çok adımlı işlemleri tek komuta sığdırır |
| **Komut Uzunluğu** | Sabit (Genellikle 32-bit / 4 bayt) | Değişken (x86'da 1 bayt ile 15 bayt arası)| RISC boru hattında komut çözme (ID) donanımı basittir |
| **Bellek Erişimi** | Yalnızca Load / Store (`LDR`, `STR`) | Aritmetik komutlar doğrudan belleğe erişir| CISC mimarisinde `ADD AX, [BX+SI]` doğrudan bellek işler |
| **Yazmaç Sayısı** | Çok sayıda (32 veya daha fazla) | Sınırlı sayıda (8–16 genel yazmaç) | RISC derleyicileri değişkenleri yazmaçlarda tutar |
| **Yürütme Döngüsü** | Komut başına ~1 saat çevrimi (CPI ~ 1)| Komut başına çok sayıda çevrim (Multi-cycle)| CISC komutları arka planda mikro-operasyonlara (µops) bölünür |
| **Kontrol Birimi** | Donanımsal kablolu mantık (Hardwired)| Mikro-kod ROM (Microcode Control Unit) | RISC çok daha yüksek saat frekanslarına kolayca ulaşır |

---

## EK F: 10 Temel Mimari Referans Tablosu Hızlı Dizin Özeti

| No | Tablo Adı | Tanımlayıcı Kolonlar ve Anahtar Alanlar | Referans Bölüm |
| :---: | :--- | :--- | :---: |
| 1 | 8086 FLAGS Register Anatomy | | CF (Carry) | PF (Parity) | ZF (Zero) | OF (Overflow) | | Bölüm 2 |
| 2 | Default Segment:Offset Pairs | | CS:IP Code Segment | SS:SP Stack Segment | DS:BX Data Segment | | Bölüm 2 |
| 3 | MOD-REG-R/M Machine Code Decoding | | MOD | REG | R/M | | Bölüm 3 |
| 4 | Jcc Conditional Jump Flags | | JZ / JE | JNZ / JNE | JA / JB / JG / JL | | Bölüm 7 |
| 5 | 8255 PPI Mode Definition Control Word | | Grup A Port A | Grup B Port B | Mode 0 Mod 0 D7 | | Bölüm 9 |
| 6 | IVT Dedicated Interrupt Types | | Type 0 Tip 0 | Type 1 Tip 1 | Type 2 Tip 2 NMI | | Bölüm 10 |
| 7 | 8237 DMA Controller Internal Registers | | Command Komut | Mode Mod | Mask Maske | Address Count | | Bölüm 11 |
| 8 | Memory Hierarchy Speed/Capacity/Cost | | Register Yazmaç | L1 L2 L3 Önbellek | DRAM RAM Ana Bellek | SSD Disk | | Bölüm 13 |
| 9 | Intel 8085 vs 8086 Architectural Comparison | | 8085 | 8086 | 8-bit / 16-bit, 64 KB / 1 MB | | Bölüm 14 |
| 10 | RISC vs CISC Architectural Comparison | | RISC | CISC | Instruction Komut Register Yazmaç | | Bölüm 15 |


---

## Ek: Sınıf Tahtası & Projeksiyon Uygulamaları (Week 6 & Week 7 Classroom Photos — `Foto/`)

### Week 6: Simple Exercise — Trace the Loop (`Foto/451.jpeg`)
```assembly
; Simple Exercise: Trace the Loop
    MOV CX, 4
    MOV AX, 0
    MOV BX, 2
AGAIN:
    ADD AX, BX
    ADD BX, 2
    LOOP AGAIN
```
- **How many times does the loop body run?** -> `4`
- **What is AX when the loop finishes?** -> `20`
- **What is BX when the loop finishes?** -> `10`
- **What is CX when the loop finishes?** -> `0`

### Week 6: Nested Loop Fix (`Foto/WhatsApp Image 2026-10-26 at 17.04.30.jpeg`)
```assembly
OUTER:
    PUSH CX
    MOV CX, 3
INNER:
    LOOP INNER
    POP CX
    LOOP OUTER
```

### Week 6: CASE STUDY — Adding Two Arrays (`Foto/234.jpeg`)
- `BLOCK1 DW 5,10,15` ve `BLOCK2 DW 3,4,5` -> Beklenen Sonuçlar: `Position 1: 8`, `Position 2: 14`, `Position 3: 20` (`LODSW`, `ADD AX, [ES:DI]`, `STOSW`, `LOOP L1`).

### Week 7: Polling Loop (`Foto/WhatsApp Image 2026-11-02 at 21.43.43.jpeg`)
```assembly
POLL_LOOP:
    LOAD R1, [IO_STATUS_REG]
    TEST R1, #READY_BIT
    JUMP_IF_ZERO POLL_LOOP
```

### Week 7: ISOLATED I/O (x86 Assembly) vs. MEMORY-MAPPED I/O (ARM64 Assembly) (`Foto/2.jpeg` & `Foto/23.jpeg`)
- **Isolated I/O (x86)**: `mov dx, 0x03F8` -> `in al, dx` -> `test al, 0x01` -> `jz _start` -> `mov dx, 0x03F9` -> `mov al, 0x41` -> `out dx, al`
- **Memory-Mapped I/O (ARM64)**: `ldr x0, =0x40020000` -> `ldr w1, [x0, #0x10]` -> `tst w1, #1` -> `b.eq _start` -> `mov w2, #0x41` -> `str w2, [x0, #0x04]`
