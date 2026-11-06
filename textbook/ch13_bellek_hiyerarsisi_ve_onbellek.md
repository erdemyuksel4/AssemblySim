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
