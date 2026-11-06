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
