# Mikroişlemciler ve 8086 Montaj Dili: Kapsamlı Ders Kitabı
## Comprehensive Microprocessors & 8086 Assembly Textbook

Bu dizin, **BMI3121 Mikroişlemciler (Microprocessors)** lisans dersinin 21 kaynak dokümanından (5 adet PPTX ders sunumu ve 16 adet PDF ders notu / laboratuvar dokümanı, toplam 766 slayt ve sayfa) hiçbir kavram, formül, mimari tanım veya tablo kaybı olmaksızın ("sıfır kayıp" / zero-loss ilkesiyle) derlenmiş akademik ders kitabını ve müfredat yapısını içermektedir.

Ders kitabı, Türk yükseköğretim standartlarına uygun zengin akademik Türkçe anlatımla kaleme alınmış; uluslararası mühendislik ve montaj dili standartlarına tam uyum için orijinal İngilizce teknik terimler, yazmaç adları ve 8086 komut mnemonikleri aynen muhafaza edilmiştir (örneğin: *Bus Interface Unit (BIU - Veriyolu Arayüz Birimi)*, *Prefetch Queue (Ön Getirme Kuyruğu)*, *Effective Address (EA - Efektif Adres)*).

---

## 📚 Kitap Mimarisi ve Dosya Yapısı

Ders kitabı iki farklı formatta sunulmaktadır:
1. **Modüler Bölüm Dosyaları (`ch01` – `ch15`)**: Konu bazlı çalışma, bireysel ders hazırlığı ve hızlı erişim için bağımsız dosyalar.
2. **Tek Ciltlik Ana Kitap ([`COMPLETE_TEXTBOOK.md`](COMPLETE_TEXTBOOK.md))**: Tüm 15 bölümü, akademik önsözü, detaylı içindekiler tablosunu ve 4 kapsamlı teknik eki (Ek A–D) tek bir ciltte birleştiren ana başvuru eseri.

---

## 📑 Genel İçindekiler Tablosu (Master Table of Contents)

| Bölüm | Başlık ve Kapsam | Kaynak Dokümanlar | Bağlantı |
| :---: | :--- | :--- | :---: |
| **Bölüm 1** | **Mikroişlemcilere Giriş, Bilgisayar Mimarisi ve Sayı Sistemleri**<br>Tarihsel evrim (4004'ten modern işlemcilere), 3 temel blok, sistem veriyolları (Address, Data, Control: MEMR, MEMW, IOR, IOW), Klasik PC Bellek Haritası (TPA 640 KB, VRAM, BIOS ROM), G/Ç uzayı, sayı tabanları, bölme-kalan ve multiply-radix dönüşümleri, 1's ve 2's complement, BCD, ASCII. | Week 1 PPTX, w1.pdf, Syllabus | [`ch01_giris_ve_sayi_sistemleri.md`](ch01_giris_ve_sayi_sistemleri.md) |
| **Bölüm 2** | **Intel 8086 Donanım Mimarisi, Yazmaçlar ve Segmentasyon**<br>BIU ve EU fonksiyonel ayrımı, 6-baytlık Prefetch Queue (FIFO), komut döngüsü (FDE), 14 adet 16-bit yazmaç (AX, BX, CX, DX, SP, BP, SI, DI, CS, DS, SS, ES, IP, FLAGS), 9 aktif bayrak, Real Mode 20-bit fiziksel adres formülü ($PA = \text{Seg}\times 16 + \text{Off}$), segment dolanması (wrap-around), Little-Endian bayt yerleşimi, Even/Odd bellek bankaları (BHE# ve A0). | Week 2 PPTX, w2.pdf, w5.pdf | [`ch02_8086_mimarisi_ve_segmentasyon.md`](ch02_8086_mimarisi_ve_segmentasyon.md) |
| **Bölüm 3** | **8086 Adresleme Modları ve Makine Kodu Formatı**<br>7 temel veri adresleme modu (Register, Immediate, Direct, Register Indirect, Base-Plus-Index, Register Relative, Base Relative-Plus-Index), program bellek adresleme modları (Direct Far, Relative Near/Short, Indirect), segment geçersiz kılma önekleri (CS, SS, DS, ES), makine kodu ikili yapısı (Opcode, D, W, MOD-REG-R/M baytı, deplasman), CISC ve RISC adresleme karşılaştırması. | Week 3 PPTX, w3.pdf, w3extra.pdf, w4.pdf | [`ch03_adresleme_modlari.md`](ch03_adresleme_modlari.md) |
| **Bölüm 4** | **Veri Aktarım Komutları, Yığın Mimarisi ve İşaretçiler**<br>MOV kuralları ve donanımsal yasaklar, XCHG atomik takası, Yığın (Stack) mimarisi (LIFO, SS:SP dinamiği), PUSH, POP, PUSHA, POPA, PUSHF, POPF, standart yığın çerçevesi (stack frame) ve BP tabanlı yerel değişken erişimi, LEA vs MOV OFFSET, LDS, LES, LFS, LGS, LSS, boyut genişletme (CBW, CWD, CWDE, CDQ, MOVSX, MOVZX), LAHF, SAHF. | Week 4 PPTX, w4.pdf, Code Examples | [`ch04_veri_aktarimi_ve_yigin.md`](ch04_veri_aktarimi_ve_yigin.md) |
| **Bölüm 5** | **Aritmetik Komutlar, BCD/ASCII Aritmetiği ve Bayrak Hassasiyeti**<br>ADD, ADC, INC, SUB, SBB, DEC, NEG, aritmetik durum bayrakları mekaniği (CF, OF, SF, ZF, AF, PF) ve işaretli taşma kuralı ($OF = C_{in} \oplus C_{out}$), CMP mekanizması, MUL ve IMUL (DX:AX yazmaçları), DIV ve IDIV (bölüm/kalan, Type 0 sıfıra bölme kesmesi), paketlenmiş/paketlenmemiş BCD aritmetiği (DAA, DAS), ASCII aritmetiği (AAA, AAS, AAM, AAD), çok kelimeli (multi-precision) toplama ve çıkarma. | Week 5 PPTX, w10.pdf, w11.pdf, Code Examples | [`ch05_aritmetik_islemler.md`](ch05_aritmetik_islemler.md) |
| **Bölüm 6** | **Mantıksal İşlemler, Maskeleme ve Bit Kaydırma/Döndürme**<br>Boole mantık komutları (AND, OR, XOR, NOT) ve doğruluk tabloları, bit maskeleme (sıfırlama, birleme, tersleme), TEST komutu (yıkıcı olmayan durum kontrolü), mantıksal ve aritmetik kaydırma (SHL/SAL, SHR, SAR ile hızlı çarpma/bölme), döngüsel döndürme (ROL, ROR, RCL, RCR), çok kelimeli verilerde bit kaydırma ve döndürme algoritmaları. | Week 5 PPTX, w10.pdf, Code Examples | [`ch06_mantik_ve_bit_kaydirma.md`](ch06_mantik_ve_bit_kaydirma.md) |
| **Bölüm 7** | **Program Akış Kontrolü, Koşullu Sıçramalar, Döngüler ve Prosedürler**<br>Koşulsuz sıçrama (JMP: Short $\pm 128$ bayt, Near $\pm 32$ KB, Far ptr16:16), Jcc koşullu sıçrama komutları ailesi (işaretli, işaretsiz ve tek bayrak şartları), sayaçlı döngüler (LOOP, LOOPE/LOOPZ, LOOPNE/LOOPNZ, JCXZ), alt yordam mekanizması (CALL, RET, RET n), parametre aktarımı (yazmaçlar, bellek, yığın), BP tabanlı standart aktivasyon kaydı, özyineleme (recursion). | Week 3 PPTX, w3.pdf, w6.pdf, Code Examples | [`ch07_akis_kontrolu_ve_prosedurler.md`](ch07_akis_kontrolu_ve_prosedurler.md) |
| **Bölüm 8** | **Dizi ve String İşlemleri, Blok Bellek Transferi ve Tablo Çevrimi (XLAT)**<br>String mimarisi: DS:SI (kaynak) ve ES:DI (hedef) çiftleri, Yön Bayrağı (Direction Flag - DF) yönetimi (CLD ile ileri, STD ile geri), 5 temel string primitifi (MOVSB/MOVSW, LODSB/LODSW, STOSB/STOSW, CMPSB/CMPSW, SCASB/SCASW), tekrar önekleri (REP, REPE/REPZ, REPNE/REPNZ), XLAT / XLATB arama tablosu (lookup table) çevrim tekniği, dizi arama ve sıralama algoritmaları. | Week 4 PPTX, Code Examples | [`ch08_diziler_ve_tablo_islemleri.md`](ch08_diziler_ve_tablo_islemleri.md) |
| **Bölüm 9** | **Giriş/Çıkış (G/Ç) Sistemleri, Portlar ve 8255 PPI Denetleyicisi**<br>G/Ç modüllerinin rolü, Yalıtılmış G/Ç (Isolated / Port I/O: 64 KB, $\overline{\text{IOR}}/\overline{\text{IOW}}$) vs Bellek Haritalı G/Ç (Memory-Mapped I/O), IN ve OUT komutları (sabit port 00h-FFh vs değişken port DX), programlı G/Ç (polling/busy-wait), kesmeli G/Ç, donanımsal el sıkışma (STB#, IBF, ACK#), Intel 8255 PPI mimarisi (Port A, B, C, Kontrol Yazmacı), Mod 0, Mod 1, Mod 2 ve BSR (Bit Set/Reset) modu, seri arayüzler (UART, RS-232, USB). | w6.pdf, Week 4 PPTX, Syllabus | [`ch09_giris_cikis_ve_8255_ppi.md`](ch09_giris_cikis_ve_8255_ppi.md) |
| **Bölüm 10** | **Kesmeler, Kesme Vektör Tablosu (IVT) ve İstisna Mimarisi**<br>Kesme (Interrupt) ve İstisna (Exception) tanımı, donanım vs yazılım kesmeleri, Kesme Vektör Tablosu (IVT: 00000h–003FFh, 256 vektör, $4N$ adresleme formülü), Intel rezerve kesmeleri (Tip 0 Sıfıra Bölme, Tip 1 Tek Adım / TF, Tip 2 NMI, Tip 3 Kesme Noktası / 0xCC, Tip 4 INTO), INTR ve NMI, CLI/STI yönetimi, kesme yürütme çevrimi (FLAGS, CS, IP yığına atma, IF/TF temizleme, IRET), ISR tasarımı, Intel 8259A PIC, BIOS INT 10h/16h ve DOS INT 21h hizmetleri. | w12a.pdf, Syllabus, Code Examples | [`ch10_kesmeler_ve_ivt_mimarisi.md`](ch10_kesmeler_ve_ivt_mimarisi.md) |
| **Bölüm 11** | **Doğrudan Bellek Erişimi (DMA) ve İşletim Sistemi Desteği**<br>DMA kavramı ve CPU darboğazının giderilmesi, veriyolu tahsisi (bus arbitration: HOLD ve HLDA sinyalleri), Çevrim Çalma (Cycle Stealing) vs Blok (Burst) transfer modu, Intel 8237 DMA Denetleyicisi mimarisi (4 kanal: Kanal 0 DRAM refresh, Kanal 2 disket), iç yazmaçlar, DMA ve önbellek tutarlılığı (cache coherency), proses durumları ve Proses Kontrol Bloğu (PCB), bağlam değiştirme (context switching), kullanıcı modu vs çekirdek modu donanım koruması. | w9.pdf, Syllabus, Code Examples | [`ch11_dma_ve_isletim_sistemi_destegi.md`](ch11_dma_ve_isletim_sistemi_destegi.md) |
| **Bölüm 12** | **Komut Boru Hattı (Instruction Pipelining) ve Tehlikeler (Hazards)**<br>Montaj hattı analojisi ve boru hattı ilkesi, klasik 5-aşamalı işlemci boru hattı (IF, ID, EX, MEM, WB), boru hattı başarımı ve hızlanma formülü ($S_k = \frac{n \cdot k}{k + n - 1}$), yapısal tehlikeler (structural hazards), veri tehlikeleri (data hazards: RAW gerçek bağımlılık, WAR, WAW), veri iletme (forwarding/bypassing), boru hattı duraklatma (stall/bubble), kontrol tehlikeleri (branch hazards) ve dallanma cezası (branch penalty), statik ve dinamik dallanma tahmini (2-bit doygunluk sayacı, BTB), gecikmeli dallanma. | w13a.pdf, Syllabus, Code Examples | [`ch12_komut_boru_hatti_ve_tehlikeler.md`](ch12_komut_boru_hatti_ve_tehlikeler.md) |
| **Bölüm 13** | **Bellek Hiyerarşisi, Önbellek Mimarisi ve Yerellik İlkesi**<br>Bellek hiyerarşisi piramidi (Yazmaçlar, L1, L2, L3, DRAM, SSD, HDD: hız, kapasite ve maliyet karşılaştırması), Yerellik İlkesi (zamansal ve mekânsal yerellik), önbellek blok yapısı (Etiket / Tag, İndeks / Index, Ofset / Offset: $A = t + s + b$), eşleme teknikleri (Doğrudan Eşlemeli, Kümeli İlişkili, Tam İlişkili), önbellek ıska türleri (The 3 Cs: Compulsory, Capacity, Conflict), yazma politikaları (Write-Through vs Write-Back, Dirty Bit), blok değiştirme (LRU, FIFO, Random), Ortalama Bellek Erişim Süresi ($\text{AMAT} = \text{Hit Time} + \text{Miss Rate} \times \text{Miss Penalty}$), çok çekirdekte MESI protokolü. | w14a.pdf, Syllabus | [`ch13_bellek_hiyerarsisi_ve_onbellek.md`](ch13_bellek_hiyerarsisi_ve_onbellek.md) |
| **Bölüm 14** | **Assembly Dili Makroları ve Intel 8085 vs. 8086 Karşılaştırması**<br>Makro kavramı, MACRO ve ENDM sözdizimi, satır içi genişleme (in-line expansion), makrolar ve alt yordamların (CALL/RET) karşılaştırması (kod boyutu vs çalışma hızı takası), parametreli ve koşullu makrolar (IF, IFDEF, REPT), Intel 8085 mimarisi (8-bit veri, 16-bit adres, 64 KB bellek), 8085 yazmaç seti (A, BC, DE, HL / M, PC, SP), 8085 donanım kesmeleri ve öncelikleri (TRAP/NMI, RST 7.5, RST 6.5, RST 5.5, INTR), 8085 vs 8086 kapsamlı karşılaştırma tablosu. | Syllabus, w5.pdf | [`ch14_makrolar_ve_8085_karsilastirmasi.md`](ch14_makrolar_ve_8085_karsilastirmasi.md) |
| **Bölüm 15** | **Paralel İşleme, Çok Çekirdekli Mimariler ve RISC vs. CISC**<br>Paralel işleme temelleri, Flynn Taksonomisi (SISD, SIMD, MISD, MIMD), paralellik düzeyleri (Bit, Komut Düzeyi ILP: Superscalar, Out-of-Order; İş Parçacığı Düzeyi TLP: Çok Çekirdek, SMT / Hyper-Threading; Veri Paralelliği: SIMD), paylaşılan bellek mimarileri (UMA vs NUMA), Amdahl Yasası ve paralel hızlanma tavanı ($S = \frac{1}{(1-p) + p/s}$, tavan: $\frac{1}{1-p}$), Gustafson Yasası (ölçeklenmiş hızlanma), RISC vs CISC felsefelerinin derinlemesine karşılaştırması, modern melez (hibrit) mimarilerde CISC komutlarının dahili mikro-operasyonlara (µops) çözülmesi. | w15a.pdf, w4.pdf, w5.pdf, Syllabus | [`ch15_paralel_isleme_ve_risc_cisc.md`](ch15_paralel_isleme_ve_risc_cisc.md) |

---

## 🗺️ 21 Kaynak Dokümanın Tam Müfredat Haritası (Curriculum Mapping Matrix)

Aşağıdaki tablo, Marmara Üniversitesi Bilgisayar Mühendisliği Bölümü **BMI3121 Microprocessors** dersi kapsamında yer alan 21 özgün belgenin ders kitabındaki bölümlere ve simülatör konularına birebir izdüşümünü göstermektedir:

| # | Kaynak Doküman | Tür & Boyut | Kaynak Kapsamı & Ana Konular | İlgili Kitap Bölümü | AssemblySim Konusu |
|---|:---|:---|:---|:---|:---|
| 1 | `Week 1 - Microprocessors and the Computer.pptx` | PPTX, 40 slayt | 3 blok, sistem veriyolları, TPA (640 KB), VRAM, ROM, G/Ç uzayı, sayı sistemleri, taban dönüşümleri, multiply-radix, 1's/2's complement, BCD, ASCII. | Bölüm 1 | Konu 1 & 2 |
| 2 | `w1.pdf` | PDF, 38 sayfa | Mikroişlemci tanımı, 4004'ten modern işlemcilere tarihsel evrim, veriyolu pinleri, PC bellek haritası (1 MB), dönüşüm algoritmaları. | Bölüm 1 | Konu 1 & 2 |
| 3 | `BMI3121_Microprocessors_Syllabus.pdf` | PDF, 1 sayfa | Resmi 16 haftalık ders planı, laboratuvar izlencesi, ara sınav ve final konuları. | Bölüm 1–15 | Konu 1–15 |
| 4 | `Week 2 - The Microprocessor and Its Architecture.pptx` | PPTX, 40 slayt | Programlama modeli, 8/16/32/64-bit yazmaçlar, FLAGS (9 bayrak), 20-bit adresleme ($PA = \text{Seg}\times 16 + \text{Off}$), Little-Endian, bellek bankaları. | Bölüm 2 | Konu 3 & 4 |
| 5 | `w2.pdf` | PDF, 35 sayfa | 8086 CPU iç mimarisi, BIU vs EU, 6-baytlık Prefetch Queue, CS/DS/SS/ES/IP, varsayılan yazmaç çiftleri, segment dolanması (wrap-around). | Bölüm 2 | Konu 3 & 4 |
| 6 | `w5.pdf` | PDF, 52 sayfa | İşlemci yapısı ve işlevi, Getir-Çöz-Çalıştır (FDE) döngüsü, ALU ve Kontrol Birimi donanımı, iç veriyolu, komut durum diyagramları. | Bölüm 2, 14, 15 | Konu 3, 14, 15 |
| 7 | `Week 3 - Addressing Modes.pptx` | PPTX, 40 slayt | 7 veri adresleme modu (Register, Immediate, Direct, Indirect, Base-Plus-Index, Relative, Base Relative-Plus-Index), program bellek adresleme. | Bölüm 3, 7 | Konu 5, 11 |
| 8 | `w3.pdf` | PDF, 30 sayfa | MOV ile veri adresleme, her mod için fiziksel adres hesabı, deplasman kuralları, taban/indeks yazmaç kısıtlamaları ([BX], [BP], [SI], [DI]). | Bölüm 3, 7 | Konu 5, 11 |
| 9 | `w3extra.pdf` | PDF, 1 sayfa | 7 veri adresleme modunun 1 sayfalık özet başvuru kartı ve pratik örnekler. | Bölüm 3 | Konu 5 |
| 10 | `w4.pdf` | PDF, 51 sayfa | Komut kümeleri, makine kodu ikili formatı (Opcode, D, W, MOD-REG-R/M), CISC vs RISC adresleme farkları. | Bölüm 3, 4, 15 | Konu 5, 6, 15 |
| 11 | `Week 4 - Data Movement Instructions.pptx` | PPTX, 40 slayt | MOV kuralları ve yasaklar, XCHG, LEA vs MOV OFFSET, LDS, LES, yığın komutları (PUSH/POP, PUSHA/POPA, PUSHF/POPF), IN/OUT, string komutları, XLAT. | Bölüm 4, 8, 9 | Konu 6, 7, 12 |
| 12 | `Week 5 - Arithmetic and Logic Instructions.pptx` | PPTX, 40 slayt | Toplama (ADD, ADC, INC), Çıkarma (SUB, SBB, DEC, NEG, CMP), Çarpma (MUL, IMUL), Bölme (DIV, IDIV), Mantık (AND, OR, XOR, NOT, TEST), Kaydırma (SHL, SHR, SAR, ROL, ROR, RCL, RCR). | Bölüm 5, 6 | Konu 8, 9, 10 |
| 13 | `w10.pdf` | PDF, 92 sayfa | Kapsamlı aritmetik ve mantık ansiklopedisi, ALU bayrakları, BCD düzeltme (DAA, DAS), ASCII düzeltme (AAA, AAS, AAM, AAD), çok kelimeli işlemler. | Bölüm 5, 6 | Konu 8, 9, 10 |
| 14 | `w11.pdf` | PDF, 15 sayfa | İşaretli ve işaretsiz toplama/çıkarma, 2'ye tümleyen kuralları, multi-precision ADC/SBB zincirleri, bayrak duyarlılık analizi (CF, OF, SF, ZF, AF, PF). | Bölüm 5 | Konu 8, 9 |
| 15 | `MicroProcessor code examples week.pdf` | PDF, 8 sayfa | Çalıştırılabilir 8 sayfalık assembly kodu (simüle DMA, aritmetik zincirler, koşullu dallanmalar, iç içe döngüler, BIOS INT 10h/16h, boru hattı simülasyonu, dizi en büyük eleman arama, yığın kullanımı). | Bölüm 4, 5, 6, 7, 8, 9, 10, 11, 12 | Konu 6–14 |
| 16 | `w6.pdf` | PDF, 51 sayfa | G/Ç mimarisi, modüller, programlı G/Ç, kesmeli G/Ç, Intel 8255 PPI (Port A/B/C, Kontrol Yazmacı, Mod 0/1/2/BSR), seri arayüzler (UART, USB, Bluetooth). | Bölüm 7, 9 | Konu 11, 12 |
| 17 | `w9.pdf` | PDF, 32 sayfa | Doğrudan Bellek Erişimi (DMA), Intel 8237 mimarisi, 4 bağımsız kanal, HOLD/HLDA veriyolu arbitrasyonu, çevrim çalma vs burst modu, önbellek tutarlılığı. | Bölüm 11 | Konu 14 |
| 18 | `w12a.pdf` | PDF, 33 sayfa | Kesmeler ve istisnalar, IVT (00000h–003FFh, 256 vektör), Tip 0-4 rezerve kesmeler, donanım vs yazılım kesmeleri, ISR tasarımı, Intel 8259A PIC. | Bölüm 10 | Konu 13 |
| 19 | `w13a.pdf` | PDF, 38 sayfa | Komut boru hattı (pipelining), 5 aşama (IF, ID, EX, MEM, WB), hızlanma formülü ($S_k$), yapısal/veri/kontrol tehlikeleri, iletme, dallanma tahmini (2-bit doygunluk sayacı, BTB). | Bölüm 12 | Konu 15 (15.1) |
| 20 | `w14a.pdf` | PDF, 49 sayfa | Bellek hiyerarşisi piramidi, yerellik ilkesi (zamansal/mekânsal), önbellek organizasyonu (Tag, Index, Offset), eşleme modları, 3 Cs ıskaları, write-through vs write-back, AMAT formülü. | Bölüm 13 | Konu 15 (15.2) |
| 21 | `w15a.pdf` | PDF, 40 sayfa | Paralel işleme, Flynn Taksonomisi (SISD, SIMD, MISD, MIMD), ILP, TLP, çok çekirdek, Amdahl Yasası, Gustafson Yasası, RISC vs CISC, modern hibrit mikro-operasyonlar (µops). | Bölüm 15 | Konu 15 (15.3) |

---

## 🎯 Pedagojik İlkeler ve Terminoloji Kuralları

1. **Sıfır Kayıp (Zero-Loss) Prensibi**: Kaynak ders belgelerindeki hiçbir formül, bellek sınır adresi, pin sinyali ($\overline{\text{MEMR}}, \overline{\text{MEMW}}, \overline{\text{IOR}}, \overline{\text{IOW}}$), yazmaç düzeni veya komut istisnası atlanmamıştır.
2. **Akademik Türkçe & Özgün Terminoloji Uyumu**: Anlatım dili yüksek akademik Türkçe ile kurulurken, uluslararası standart 8086 mnemonikleri (`MOV`, `ADD`, `XCHG`, `LODSB`, vb.) ve yaygın İngilizce mühendislik terimleri parantez içi veya çift dilli olarak verilmiştir (Örn: *Bus Interface Unit (BIU - Veriyolu Arayüz Birimi)*).
3. **Kendi Kendine Yeten (Self-Contained) Çizimler**: Donanım mimarileri, bellek haritaları, durum makineleri ve boru hattı zaman diyagramları, harici resim dosyalarına bağımlılık olmaksızın temiz Markdown ASCII diyagramları ve tablolarla görselleştirilmiştir.
4. **Çalıştırılabilir Kod Odaklılık**: Tüm assembly kod parçacıkları, Intel sözdizimine ve AssemblySim simülatörünün `ORG 100h` çalışma formatına tam uyumlu olarak tasarlanmıştır.

---

## 🧪 Doğrulama ve Kalite Güvencesi (Verification Suite)

Ders kitabının sıfır kayıp garantisi, otomatik test süiti ile bağımsız olarak doğrulanmaktadır:

```bash
# Tüm 15 bölüm ve tek ciltlik COMPLETE_TEXTBOOK.md üzerinde 405 kontrol öğesini doğrula:
python scripts/verify_textbook_coverage.py --complete-file docs/textbook/COMPLETE_TEXTBOOK.md
```

Bu betik:
- 15 bölüm dosyasının eksiksiz mevcudiyetini,
- `COMPLETE_TEXTBOOK.md` dosyasının bütünlüğünü,
- 21 kaynak belgeden türetilen **405 adet zorunlu anahtar kelime, donanım mimarisi bloğu, adresleme modu, 8086 komutu, matematiksel formül ve teknik referans tablosunu**
programatik olarak doğrular ve %100 kapsama oranı sağlamadan geçişe izin vermez.
