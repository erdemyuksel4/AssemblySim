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
