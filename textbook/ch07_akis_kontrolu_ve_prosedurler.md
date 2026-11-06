# BÖLÜM 7: Program Akış Kontrolü, Koşullu Sıçramalar, Döngüler ve Prosedürler (Control Flow, Conditional Jumps, Loops & Procedures)

Mikroişlemcilerin program yürütme mekanizması, varsayılan olarak sıralı (ardışıl) bir düzendedir; Komut İşaretçisi (Instruction Pointer - `IP`), her komut baytı çekildikten sonra bir sonraki komutu gösterecek şekilde artırılır. Ancak algoritmik mantığın kurulabilmesi, karar mekanizmalarının (if-then-else) işletilmesi, belirli kod bloklarının yinelenmesi (for, while döngüleri) ve modüler yazılım geliştirme (fonksiyon/alt yordam çağrıları) için program akışının dinamik olarak değiştirilmesi zorunludur.

Intel 8086 mikroişlemcisi; koşulsuz sıçramalar (`JMP`), durum bayraklarına duyarlı koşullu dallanmalar (`Jcc`), sayaç denetimli donanımsal döngüler (`LOOP`, `LOOPE`, `LOOPNE`, `JCXZ`) ve yığın (stack) mekanizmasını kullanan alt yordam (subroutine) çağrı/dönüş komutları (`CALL`, `RET`) ile donatılmıştır.

---

## 7.1 Program Akış Kontrolünün Temelleri: Koşulsuz Sıçrama (JMP: Short, Near, Far)

Koşulsuz sıçrama komutu (`JMP - Unconditional Jump`), herhangi bir bayrak kontrolü yapmaksızın program yürütme akışını doğrudan belirtilen hedef adrese yönlendirir. 8086 mimarisinde `JMP` komutu, hedefin uzaklığına ve segment içi veya segmentler arası olmasına bağlı olarak üç temel biçimde uygulanır:

```
+-----------------------------------------------------------------------------------+
|                           8086 JMP ÇEŞİTLERİ                                      |
+-------------------+----------------------+-------------------+--------------------+
| Sıçrama Türü      | Makine Kodu / Opcode | Menzil (Mesafe)   | Değişen Yazmaçlar  |
+-------------------+----------------------+-------------------+--------------------+
| Short Jump (Kısa) | EB cb (2 bayt)       | -128 .. +127 bayt | Sadece IP (disp8)  |
| Near Jump (Yakın) | E9 cw (3 bayt)       | -32768 .. +32767  | Sadece IP (disp16) |
| Far Jump (Uzak)   | EA cd (5 bayt)       | Farklı Segment    | Hem CS hem IP      |
+-------------------+----------------------+-------------------+--------------------+
```

### 1. Short Jump (Kısa Sıçrama)
Short jump, aynı kod segmenti (`CS`) içerisinde $\pm 128$ baytlık göreceli mesafeye yapılan sıçramadır. 
- Makine kodunda 1 baytlık opcode (`EBh`) ve 1 baytlık işaretli deplasman (displacement: `disp8`) yer alır (toplam 2 bayt).
- Hedef fiziksel adres formülü:
  $$\text{Hedef IP} = \text{IP}_{sonraki} + \text{disp8}$$
- Burada $\text{IP}_{sonraki}$, sıçrama komutunun hemen ardından gelen komutun ofset adresidir. Deplasman $-128 \le \text{disp8} \le +127$ aralığında 2'ye tümleyen (two's complement) biçimindedir.

```assembly
; Kısa Sıçrama Örneği
ORG 100h
JMP SHORT ileri_hedef
NOP
ileri_hedef:
MOV AX, 1
HLT
```

### 2. Near Jump (Yakın Sıçrama - Segment İçi)
Near jump, yine mevcut kod segmenti içinde fakat $\pm 32\text{ KB}$ aralığındaki hedeflere ulaşmak için kullanılır.
- Doğrudan (Direct Near): `E9h` opcode ve 16-bitlik işaretli deplasman (`disp16`) içerir (toplam 3 bayt).
  $$\text{Hedef IP} = \text{IP}_{sonraki} + \text{disp16} \quad (-32768 \le \text{disp16} \le +32767)$$
- Dolaylı (Indirect Near): Hedef adres bir yazmaçta ya da bellek konumunda tutulur (`FF /4`). Örneğin `JMP AX` komutunda `IP` yazmacına doğrudan `AX` değeri kopyalanır (`IP <- AX`). `JMP [BX]` komutunda ise `DS:BX` adresindeki 16-bitlik veri `IP` yazmacına yüklenir.

### 3. Far Jump (Uzak Sıçrama - Segmentler Arası)
Far jump (Intersegment Jump), program akışını farklı bir kod segmentine geçirmek için kullanılır.
- Doğrudan Far: 5 baytlık komuttur. `EAh` opcode'unu 16-bitlik yeni `IP` (Offset) ve ardından 16-bitlik yeni `CS` (Segment) baytları takip eder (`JMP FAR PTR HedefEtiket` veya `JMP 2000h:0100h`).
- Dolaylı Far: Bellekten 4 bayt (Doubleword far pointer) okunarak ilk kelime `IP`'ye, ikinci kelime `CS`'ye atanır (`JMP DWORD PTR [BX]`).

---

## 7.2 Koşullu Sıçrama Komutları (Jcc): Bayrak Kuralları ve Karşılaştırma Mantığı

Koşullu sıçrama komutları (`Jcc`), `FLAGS` yazmacındaki belirli durum bayraklarının (`ZF, CF, SF, OF, PF`) değerlerini denetler. Eğer ilgili koşul mantıksal olarak doğru (True) ise hedef adrese dallanır; koşul yanlış (False) ise işlemci bir sonraki sıralı komutu yürütmeye devam eder.

> **Kritik Mimari Kural:** 8086 mimarisinde tüm koşullu sıçramalar (`Jcc`) **yalnızca Short Jump (Kısa Sıçrama)** formatındadır. Makine kodunda 1 bayt opcode ve 1 bayt işaretli deplasman bulunur (hedef menzili $-128 \le \text{disp8} \le +127$ bayttır). Eğer daha uzak bir mesafeye koşullu sıçranması gerekiyorsa, zıt koşullu bir kısa sıçrama ile bir `Near JMP` komutu üzerinden atlama tekniği (Trampoline) uygulanır.

Koşullu sıçramalar çoğunlukla bir `CMP` (Compare) veya `TEST` komutunu takip eder.

### Kapsamlı Jcc Koşullu Sıçrama Tablosu

Aşağıdaki referans tablosunda 8086'nın tüm koşullu sıçrama komutları, anlamları, denetledikleri bayrak durumları ve kullanım kategorileri verilmiştir:

| Komut (Mnemonic) | Eşdeğeri (Alias) | Açıklama (İngilizce & Türkçe) | Bayrak Şartı (Flag Condition) | Aritmetik Tür |
| :--- | :--- | :--- | :--- | :--- |
| **JZ** | **JE** | Jump if Zero / Jump if Equal (Sıfırsa veya Eşitse) | $ZF = 1$ | Genel / Eşitlik |
| **JNZ** | **JNE** | Jump if Not Zero / Jump if Not Equal (Sıfır Değilse / Eşit Değilse) | $ZF = 0$ | Genel / Eşitlik |
| **JC** | **JB / JNAE** | Jump if Carry / Jump if Below (Elde Varsa / Küçükse) | $CF = 1$ | İşaretsiz (Unsigned) |
| **JNC** | **JAE / JNB** | Jump if No Carry / Jump if Above or Equal (Elde Yoksa / Büyük-Eşitse) | $CF = 0$ | İşaretsiz (Unsigned) |
| **JA** | **JNBE** | Jump if Above / Jump if Not Below or Equal (Büyükse) | $CF = 0 \land ZF = 0$ | İşaretsiz (Unsigned) |
| **JBE** | **JNA** | Jump if Below or Equal / Jump if Not Above (Küçük ya da Eşitse) | $CF = 1 \lor ZF = 1$ | İşaretsiz (Unsigned) |
| **JG** | **JNLE** | Jump if Greater / Jump if Not Less or Equal (İşaretli Büyükse) | $ZF = 0 \land SF = OF$ | İşaretli (Signed) |
| **JGE** | **JNL** | Jump if Greater or Equal / Jump if Not Less (İşaretli Büyük-Eşitse) | $SF = OF$ | İşaretli (Signed) |
| **JL** | **JNGE** | Jump if Less / Jump if Not Greater or Equal (İşaretli Küçükse) | $SF \neq OF$ | İşaretli (Signed) |
| **JLE** | **JNG** | Jump if Less or Equal / Jump if Not Greater (İşaretli Küçük-Eşitse) | $ZF = 1 \lor SF \neq OF$ | İşaretli (Signed) |
| **JS** | — | Jump if Sign (Negatifse / Sonuç Eksi ise) | $SF = 1$ | Tek Bayrak |
| **JNS** | — | Jump if Not Sign (Pozitifse / Sonuç Artı ise) | $SF = 0$ | Tek Bayrak |
| **JO** | — | Jump if Overflow (Taşma Varsa) | $OF = 1$ | Tek Bayrak |
| **JNO** | — | Jump if No Overflow (Taşma Yoksa) | $OF = 0$ | Tek Bayrak |
| **JP** | **JPE** | Jump if Parity / Jump if Parity Even (Çift Parite) | $PF = 1$ | Tek Bayrak |
| **JNP** | **JPO** | Jump if No Parity / Jump if Parity Odd (Tek Parite) | $PF = 0$ | Tek Bayrak |

### İşaretli vs. İşaretsiz Sayı Karşılaştırması Örneği
```assembly
; Unsigned vs Signed Karşılaştırma Analizi
MOV AL, 0FFh     ; İşaretsiz: 255, İşaretli: -1
MOV BL, 01h      ; İşaretsiz: 1,   İşaretli: +1
CMP AL, BL

; İşaretsiz bakışta: 255 > 1 olduğundan JA dallanır (CF=0, ZF=0)
JA  unsigned_greater

; İşaretli bakışta: -1 < +1 olduğundan JL dallanır (SF=1, OF=0 => SF != OF)
JL  signed_less
```

---

## 7.3 Sayaç Temelli Döngü Komutları: LOOP, LOOPE/LOOPZ, LOOPNE/LOOPNZ ve JCXZ

8086 mimarisi, döngü işlemlerini donanımsal düzeyde hızlandırmak amacıyla sayaç yazmacı olan `CX` (veya `CL`) yazmacını otomatik olarak yöneten özel döngü komutlarına sahiptir.

```
       +---------------------------------------------+
       |               LOOP ÇALIŞMA SIRASI           |
       |                                             |
       |             [ LOOP hedef ]                  |
       |                   |                         |
       |           CX <-- CX - 1                     |
       |                   |                         |
       |            CX == 0 mı?                      |
       |              /        \                     |
       |        (HAYIR)        (EVET)                |
       |          /                \                 |
       |  IP <-- IP + disp8      Döngüden Çık        |
       |  (Hedefe Sıçra)         (Sıradaki Komut)    |
       +---------------------------------------------+
```

### 1. LOOP Komutu
`LOOP` komutu her işletildiğinde aşağıdaki iki işlemi atomik olarak gerçekleştirir:
1. $CX \leftarrow CX - 1$
2. Eğer $CX \neq 0$ ise hedef etikete kısa sıçrama yapar; $CX = 0$ olduğunda döngü sonlanır.
> **Önemli Bayrak Kuralı:** `LOOP` komutu `CX` yazmacını 1 azalttığı halde **FLAGS yazmacındaki hiçbir bayrağı (ZF dahil) DEĞİŞTİRMEZ!**

```assembly
; 1'den 10'a kadar olan sayıların toplamı
ORG 100h
MOV CX, 10       ; Sayaç = 10
MOV AX, 0        ; Toplam = 0
topla_dongu:
ADD AX, CX       ; AX += CX
LOOP topla_dongu ; CX--, CX!=0 ise topla_dongu'ye sıçra
HLT
```

### 2. LOOPE / LOOPZ (Loop while Equal / Loop while Zero)
`LOOPE` (veya `LOOPZ`) komutu iki koşulu birlikte test eder:
1. $CX \leftarrow CX - 1$
2. Eğer $CX \neq 0 \text{ VE } ZF = 1$ ise hedefe sıçrar.
Döngü; $CX = 0$ olduğunda veya döngü içindeki bir işlem $ZF = 0$ yaptığında (örneğin eşit olmayan bir eleman bulunduğunda) kırılır. Dizi arama işlemlerinde eşitlik devam ettiği sürece ilerlemek için idealdir.

### 3. LOOPNE / LOOPNZ (Loop while Not Equal / Loop while Not Zero)
`LOOPNE` (veya `LOOPNZ`) komutu:
1. $CX \leftarrow CX - 1$
2. Eğer $CX \neq 0 \text{ VE } ZF = 0$ ise hedefe sıçrar.
Döngü; $CX = 0$ olduğunda veya aranan eleman bulunup $ZF = 1$ olduğunda sonlanır.

### 4. JCXZ (Jump if CX is Zero)
Eğer bir döngüye girilirken `CX = 0` ise, standart bir `LOOP` komutu ilk adımda `CX`'i azaltarak `0 - 1 = 0FFFFh (65535)` yapar ve döngü 65536 kez yinelenir. Bu ölümcül mantık hatasını önlemek için döngünün hemen başında `JCXZ` komutu çalıştırılır:
- `JCXZ HedefEtiket`: Eğer $CX = 0$ ise doğrudan döngü sonuna sıçrar. FLAGS bayraklarını etkilemez.

```assembly
; Güvenli Döngü Deseni (JCXZ Korumalı)
JCXZ dongu_atla   ; CX = 0 ise gövdeyi hiç çalıştırma
dongu_bas:
    ; ... döngü gövdesi ...
    LOOP dongu_bas
dongu_atla:
```

---

## 7.4 Prosedür Çağrıları ve Dönüş Mekanizması: CALL (Near/Far), RET (Near/Far, RET n)

Alt yordamlar (prosedürler / subroutines), yazılımın modülerliğini sağlar. Bir prosedür çağrıldığında işlemci sıradaki komutun adresini yığına (`Stack`) kaydeder; alt yordam tamamlandığında ise bu adresi yığından çekerek kaldığı yere geri döner.

```
       +-------------------------------------------------------------+
       |               CALL VE RET YIĞIN DİNAMİĞİ                     |
       +-------------------------------------------------------------+
       
       CALL calistirildiginda:
       -----------------------
       SP <-- SP - 2
       Memory[SS:SP] <-- IP_sonraki (Geri dönüş adresi)
       IP <-- Prosedur_Ofseti
       
       RET calistirildiginda:
       ----------------------
       IP <-- Memory[SS:SP] (Adres yigindan cekilir)
       SP <-- SP + 2
```

### 1. Near CALL ve Near RET
- **Near CALL (`E8 cw`):** Aynı kod segmenti içindeki alt yordamı çağırır. Sıradaki komutun ofset adresini (`IP`) yığına iter ($SP \leftarrow SP - 2$, $[SS:SP] \leftarrow IP$). Ardından `IP` yazmacına alt yordamın ofset adresini yükler.
- **Near RET (`C3h`):** Yığından 2 bayt çekerek `IP` yazmacına yükler ($IP \leftarrow [SS:SP]$, $SP \leftarrow SP + 2$).

### 2. Far CALL ve Far RET
- **Far CALL (`9A cd`):** Farklı bir segmentteki prosedürü çağırır. Önce mevcut `CS` yazmacını, ardından sıradaki `IP` yazmacını yığına iter (toplam 4 bayt).
- **Far RET (`CBh`):** Yığından önce `IP`'yi, ardından `CS`'yi çekerek segmentler arası dönüşü tamamlar ($SP \leftarrow SP + 4$).

### 3. RET n (Temizlemeli Dönüş)
C ve Pascal gibi yüksek seviyeli dillerde prosedüre yığın üzerinden aktarılan argümanları temizlemek için `RET n` kullanılır:
- İşlemci yığından dönüş adresini `IP`'ye çeker, ardından yığın işaretçisine $n$ bayt ekler ($SP \leftarrow SP + 2 + n$). Böylece parametreler için ayrılan yığın alanı tek bir komutla serbest bırakılmış olur.

---

## 7.5 Alt Yordamlarda Parametre Aktarımı

Prosedürlere veri/argüman aktarmak için üç temel yöntem kullanılır:

1. **Yazmaçlar Aracılığıyla Parametre Aktarımı (FastCall Mantığı):**
   - En hızlı yöntemdir. Parametreler doğrudan `AX, BX, CX, DX, SI, DI` yazmaçlarına yüklenir.
   - Sınırlaması: Yazmaç sayısı kısıtlıdır; çok sayıda argüman veya büyük yapılar aktarılamaz.
2. **Ortak Bellek Alanları (Global Değişkenler):**
   - Parametreler veri segmentinde tanımlı sabit bellek adreslerine yazılır.
   - Dezavantajı: Kodun yeniden girişli (reentrant) ve özyinelemeli (recursive) çalışmasını engeller.
3. **Yığın (Stack) Üzerinden Parametre Aktarımı:**
   - Modern derleyicilerin standart yöntemidir. Parametreler `PUSH` komutları ile yığına atılır. Sınırsız sayıda parametre aktarılabilir ve özyinelemeyi (recursion) mükemmel destekler.

---

## 7.6 Standart Yığın Çerçevesi (Stack Frame) ve BP Tabanlı Yerel Değişkenler

Yığın üzerinden parametre aktarıldığında ve alt yordam içinde yerel değişkenlere ihtiyaç duyulduğunda **Standart Yığın Çerçevesi (Stack Frame)** kurulur. Bu çerçevede temel referans işaretçisi olarak Taban İşaretçisi (`BP - Base Pointer`) kullanılır.

```
       Yüksek Bellek Adresi
       +-------------------------------+
       |       Parametre 2             | [BP + 6]
       +-------------------------------+
       |       Parametre 1             | [BP + 4]
       +-------------------------------+
       |   Geri Dönüş Adresi (IP)      | [BP + 2]  <- CALL komutu koydu
       +-------------------------------+
BP --> |     Eski BP Değeri            | [BP + 0]  <- PUSH BP ile saklandı
       +-------------------------------+
       |     Yerel Değişken 1          | [BP - 2]
       +-------------------------------+
SP --> |     Yerel Değişken 2          | [BP - 4]  <- SUB SP, 4 ile ayrıldı
       +-------------------------------+
       Düşük Bellek Adresi (Yığın Büyüme Yönü: Aşağı)
```

### Prosedür Başlığı (Prologue) ve Kapanışı (Epilogue)
```assembly
; Standart C Tarzı Fonksiyon Şablonu
my_function PROC
    ; --- PROLOGUE (Giriş) ---
    PUSH BP             ; Çağıran fonksiyonun BP değerini sakla
    MOV  BP, SP         ; Mevcut yığın tepesini referans tabanı yap
    SUB  SP, 4          ; 2 adet yerel kelime değişkeni için yer aç (4 bayt)

    ; --- İŞLEM GÖVDESİ ---
    ; Parametre 1: [BP + 4]
    ; Parametre 2: [BP + 6]
    ; Yerel Değişken 1: [BP - 2]
    ; Yerel Değişken 2: [BP - 4]
    MOV AX, [BP + 4]    ; İlk parametreyi AX'e al
    ADD AX, [BP + 6]    ; İkinci parametreyi ekle
    MOV [BP - 2], AX    ; Sonucu yerel değişkene yaz

    ; --- EPILOGUE (Çıkış) ---
    MOV  SP, BP         ; Yerel değişken alanını serbest bırak
    POP  BP             ; Eski BP'yi geri yükle
    RET  4              ; Dön ve 4 baytlık (2 parametre) argümanı temizle
my_function ENDP
```

---

## 7.7 Yuvalanmış (Nested) Prosedür Çağrıları ve Özyineleme (Recursion) İlkeleri

Bir alt yordamın başka bir alt yordamı çağırmasına **Yuvalanmış Çağrı (Nested Call)**; bir alt yordamın doğrudan ya da dolaylı olarak kendisini çağırmasına ise **Özyineleme (Recursion)** denir.

Özyinelemede her yeni çağrı, yığında kendi bağımsız `Stack Frame`'ini oluşturur. Bu sayede her çağrı düzeyinin parametreleri ve yerel değişkenleri birbirine karışmadan saklanır. 

### Özyinelemeli Faktoriyel Hesabı ($N!$)
```assembly
; Özyinelemeli Faktoriyel Fonksiyonu: Fact(N)
; Giriş: AX = N (örneğin 4)
; Çıkış: AX = N! (24)
ORG 100h
MOV AX, 4
CALL factorial
HLT

factorial PROC
    CMP AX, 1           ; Taban Durumu (Base Case): N <= 1 mi?
    JLE base_case       ; Evetse doğrudan 1 döndür
    
    PUSH AX             ; N değerini yığına sakla
    DEC  AX             ; N - 1 hesapla
    CALL factorial      ; Recursive çağrı: Fact(N - 1) -> Sonuç AX'te döner
    
    POP  BX             ; Orijinal N değerini BX'e çek
    MUL  BX             ; AX = AX * BX => Fact(N-1) * N
    RET

base_case:
    MOV AX, 1           ; 1! = 1
    RET
factorial ENDP
```

Özyinelemeli rutinlerde **taban durumunun (base case)** doğru tanımlanması hayati önem taşır; aksi halde yığın sonsuz büyüyerek bellek taşmasına (`Stack Overflow`) yol açar.


---

## 7.7 Sınıf Tahtası & Projeksiyon Uygulamaları (Week 6 Classroom Photos)

Derste projeksiyonda (`week6.excalidraw` ve `CASESTUDY_WEEK6.docx`) çözülen üç kritik döngü ve dizi uygulaması aşağıda birebir kodları ve izleme (trace) tablolarıyla yer almaktadır:

### 1. Simple Exercise: Trace the Loop (`Foto/451.jpeg` — `week6.excalidraw`)
```assembly
; Simple Exercise: Trace the Loop
; Ask code:
    MOV CX, 4
    MOV AX, 0
    MOV BX, 2
AGAIN:
    ADD AX, BX
    ADD BX, 2
    LOOP AGAIN
```
- **1. How many times does the loop body run?** -> `4`
- **2. What is AX when the loop finishes?** -> `20` (`0014H`)
- **3. What is BX when the loop finishes?** -> `10` (`000AH`)
- **4. What is CX when the loop finishes?** -> `0` (`0000H`)

| Pass | CX before | AX after ADD | BX after ADD | CX after LOOP | Jump? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | 4 | 2 | 4 | 3 | yes |
| **2** | 3 | 6 | 6 | 2 | yes |
| **3** | 2 | 12 | 8 | 1 | yes |
| **4** | 1 | 20 | 10 | 0 | no (Falls through) |

### 2. İç İçe Döngülerde (`Nested Loops`) CX Çakışması ve `PUSH CX` / `POP CX` Çözümü (`Foto/17.04.30.jpeg`)
```assembly
; YES (CX != 0) -> Jumps back to MyLoop
; NO  (CX == 0) -> Loop terminates (Falls through)

OUTER:
    PUSH CX         ; Dış döngü sayacını yığına kaydet
    MOV CX, 3       ; İç döngü sayacını yükle
INNER:
    LOOP INNER
    POP CX          ; Dış döngü sayacını yığından geri yükle
    LOOP OUTER
```

### 3. CASE STUDY: İki Dizinin Elemanlarını Toplama — `BLOCK1` & `BLOCK2` (`Foto/234.jpeg` — `CASESTUDY_WEEK6.docx`)
```text
CASE STUDY
We have two arrays each contain 3 numbers
BLOCK1 DW 5,10,15
BLOCK2 DW 3,4,5

YOUR TASK
ADD EACH NUMBER IN BLOCK1 TO THE corresponding number in BLOCK2

Expected Result:
Position 1: BLOCK1=5,  BLOCK2=3 -> RESULT=8
Position 2: BLOCK1=10, BLOCK2=4 -> RESULT=14
Position 3: BLOCK1=15, BLOCK2=5 -> RESULT=20
```
```assembly
    CLD
    MOV CX, 3           ; load count of 3
    LEA SI, BLOCK1      ; address BLOCK1 (DS:SI)
    LEA DI, BLOCK2      ; address BLOCK2 (ES:DI)
L1:
    LODSW               ; load AX with BLOCK1 element, SI += 2
    ADD AX, [ES:DI]     ; add BLOCK2 data to AX
    STOSW               ; store sum in BLOCK2, DI += 2
    LOOP L1             ; repeat 3 times
```
