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
