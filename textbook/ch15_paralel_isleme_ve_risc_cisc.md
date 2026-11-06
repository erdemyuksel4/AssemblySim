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
