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
