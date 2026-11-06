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
