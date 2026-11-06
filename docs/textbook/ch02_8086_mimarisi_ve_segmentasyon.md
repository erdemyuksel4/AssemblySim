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
