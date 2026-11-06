#!/usr/bin/env python3
"""
build_complete_textbook.py
--------------------------
Consolidates all 15 chapters of the AssemblySim Microprocessors Academic Textbook
into a single-volume master textbook: docs/textbook/COMPLETE_TEXTBOOK.md.
Incorporates Front Matter, Academic Foreword (Önsöz), Zero-loss methodology,
Master Table of Contents, and Appendices A through E.
"""

import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
TEXTBOOK_DIR = ROOT_DIR / "docs" / "textbook"
OUTPUT_FILE = TEXTBOOK_DIR / "COMPLETE_TEXTBOOK.md"

CHAPTER_FILES = [
    "ch01_giris_ve_sayi_sistemleri.md",
    "ch02_8086_mimarisi_ve_segmentasyon.md",
    "ch03_adresleme_modlari.md",
    "ch04_veri_aktarimi_ve_yigin.md",
    "ch05_aritmetik_islemler.md",
    "ch06_mantik_ve_bit_kaydirma.md",
    "ch07_akis_kontrolu_ve_prosedurler.md",
    "ch08_diziler_ve_tablo_islemleri.md",
    "ch09_giris_cikis_ve_8255_ppi.md",
    "ch10_kesmeler_ve_ivt_mimarisi.md",
    "ch11_dma_ve_isletim_sistemi_destegi.md",
    "ch12_komut_boru_hatti_ve_tehlikeler.md",
    "ch13_bellek_hiyerarsisi_ve_onbellek.md",
    "ch14_makrolar_ve_8085_karsilastirmasi.md",
    "ch15_paralel_isleme_ve_risc_cisc.md",
]

FRONT_MATTER = r"""# MİKROİŞLEMCİLER VE 8086 MONTAJ DİLİ: KAPSAMLI DERS KİTABI
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
"""

APPENDICES = r"""

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
"""



def build():
    print(f"Building {OUTPUT_FILE}...")
    content_parts = [FRONT_MATTER]

    for ch_filename in CHAPTER_FILES:
        ch_path = TEXTBOOK_DIR / ch_filename
        if not ch_path.exists():
            raise FileNotFoundError(f"Missing chapter file: {ch_path}")
        print(f"  Integrating {ch_filename}...")
        ch_text = ch_path.read_text(encoding="utf-8")
        
        # Add a clear separator before each chapter
        content_parts.append(f"\n\n---\n\n{ch_text.strip()}\n")

    # Add Appendices
    print("  Appending Appendices A through E...")
    content_parts.append(APPENDICES)

    full_text = "".join(content_parts)
    OUTPUT_FILE.write_text(full_text, encoding="utf-8")
    
    line_count = len(full_text.splitlines())
    byte_count = len(full_text.encode("utf-8"))
    print(f"Successfully generated {OUTPUT_FILE}")
    print(f"Total: {line_count:,} lines, {byte_count:,} bytes ({byte_count / 1024:.1f} KB)")


if __name__ == "__main__":
    build()
