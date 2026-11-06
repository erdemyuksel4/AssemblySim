# Bölüm 5: Aritmetik Komutlar, BCD/ASCII Aritmetiği ve Bayrak Hassasiyeti (Arithmetic Instructions, BCD/ASCII Arithmetic & Flag Sensitivity)

8086 mikroişlemcisinin Aritmetik Mantık Birimi (ALU - Arithmetic Logic Unit), ikili (binary), paketlenmiş/paketlenmemiş BCD (Binary Coded Decimal) ve ASCII formatındaki veriler üzerinde temel ve gelişmiş matematiksel hesaplamaları doğrudan donanımsal düzeyde yürütür. Bu bölümde; temel toplama ve çıkarma komutları, bayrak kütüğünün (FLAGS Register) aritmetik duyarlılığı, işaretli taşma kuralının ($OF = C_{in} \oplus C_{out}$) matematiksel temelleri, karşılaştırma mantığı, donanımsal çarpma ve bölme mekanizmaları, sıfıra bölme ve taşma istisnaları (Type 0 Interrupt), BCD düzeltme komutları (DAA, DAS), ASCII aritmetiği (AAA, AAS, AAM, AAD) ve çok kelimeli (Multi-Precision) hesaplama algoritmaları kuramsal ve uygulamalı olarak incelenmektedir.

---

## 5.1 Temel Toplama ve Çıkarma: ADD, ADC, INC, SUB, SBB, DEC, NEG Komutları

8086 işlemcisinde toplama ve çıkarma komutları bayt (8-bit) veya kelime (16-bit) genişliğindeki işlenenler üzerinde yürütülür. Modern x86 işlemcilerinde bu komutlar çift kelime (32-bit EAX) ve dörtlü kelime (64-bit RAX) genişliklerine kadar genişletilmiştir.

### ADD ve ADC (Toplama ve Eldeli Toplama)

`ADD` (Addition) komutu, kaynak işlenen ile hedef işleneni ikili tabanda toplar ve sonucu hedef işlenene yazar:

$$\text{Hedef} \leftarrow \text{Hedef} + \text{Kaynak}$$

Desteklenen işlenen kombinasyonları:
- `ADD reg, reg` (Örn: `ADD AL, BL`, `ADD AX, BX`)
- `ADD reg, mem` (Örn: `ADD DX, [SI]`)
- `ADD mem, reg` (Örn: `ADD [BX], CL`)
- `ADD reg, imm` (Örn: `ADD CL, 44H`)
- `ADD mem, imm` (Örn: `ADD WORD PTR [DI], 1000H`)

> **Donanım Kuralı:** 8086 mimarisinde hiçbir aritmetik komut doğrudan bellekten belleğe (`mem, mem`) işlem yapamaz. Bellekteki iki sayıyı toplamak için değerlerden biri önce bir yazmaca yüklenmelidir.

`ADC` (Add with Carry) komutu, iki işlenenin toplamına ek olarak **Elde Bayrağını (CF - Carry Flag)** da sonuca dahil eder:

$$\text{Hedef} \leftarrow \text{Hedef} + \text{Kaynak} + CF$$

Eğer komut yürütülmeden önce $CF = 1$ ise toplama 1 eklenir; $CF = 0$ ise standart toplama gibi davranır. `ADC`, işlemcinin doğal yazmaç genişliğini (16-bit) aşan 32-bit, 64-bit veya keyfi uzunluktaki çok kelimeli (Multi-Precision) sayıların toplanmasında bir önceki basamaktan gelen eldeyi taşımak için zorunludur.

### INC (Bir Artırma)

`INC` (Increment) komutu, belirtilen yazmaç veya bellek içeriğine 1 ekler:

$$\text{Hedef} \leftarrow \text{Hedef} + 1$$

`INC` komutunun makine kodu tek baytlık kısa forma (`INC reg16` opcode `40h`–`47h`) sahip olduğundan `ADD reg, 1` komutuna göre hem bellek tasarrufu sağlar hem de döngüler için optimize edilmiştir.

```asm
INC BL              ; 8-bit yazmaç artırma
INC AX              ; 16-bit yazmaç artırma
INC BYTE PTR [BX]   ; Bellekteki baytı artırma
INC DATA1           ; Tanımlı bellek değişkenini artırma
```

> **Kritik Mimari Kural:** `INC` ve `DEC` komutları **Elde Bayrağını (CF - Carry Flag) ASLA ETKİLEMEZ!** ZF, SF, OF, AF ve PF bayrakları güncellenirken CF önceki durumunu korur. Bu mimari karar bilinçli olarak alınmıştır: Çok kelimeli toplama/çıkarma döngülerinde sayaçları artırırken veya bellek işaretçilerini ilerletirken (`INC SI`), basamaklar arasındaki CF elde zincirinin bozulması engellenir.

### SUB ve SBB (Çıkarma ve Borçlu Çıkarma)

`SUB` (Subtract) komutu, hedef işlenenden kaynak işleneni çıkarır ve farkı hedefe yazar:

$$\text{Hedef} \leftarrow \text{Hedef} - \text{Kaynak}$$

`SBB` (Subtract with Borrow) komutu ise hedeften hem kaynak işleneni hem de önceki işlemden kalan borcu (CF) çıkarır:

$$\text{Hedef} \leftarrow \text{Hedef} - \text{Kaynak} - CF$$

`SBB`, çok kelimeli çıkarma algoritmalarında yüksek anlamlı kelimelerden borç düşülmesini sağlar:

```asm
; 32-Bit Çıkarma: DX:AX - SI:DI -> DX:AX
SUB AX, DI      ; Düşük 16 bit çıkarılır, gerekirse CF (borç) set edilir
SBB DX, SI      ; Yüksek 16 bit çıkarılır ve CF borcu düşülür
```

### DEC (Bir Azaltma)

`DEC` (Decrement) komutu işlenenden 1 çıkarır:

$$\text{Hedef} \leftarrow \text{Hedef} - 1$$

Tıpkı `INC` gibi, `DEC` komutu da döngü sayaçlarında elde zincirini korumak için **CF bayrağını değiştirmez**.

### NEG (İkiye Tümleyen Alma / Negatifini Alma)

`NEG` (Negate) komutu, işlenenin işaretini tersine çevirerek ikiye tümleyenini (Two's Complement) hesaplar:

$$\text{Hedef} \leftarrow 0 - \text{Hedef} = (\overline{\text{Hedef}}) + 1$$

`NEG` komutunun bayraklar üzerindeki etkisi şöyledir:
- İşlenen $0$ ise $CF = 0$ olur.
- İşlenen $0$'dan farklı herhangi bir değer ise $CF = 1$ olur (çünkü 0'dan pozitif bir sayı çıkarıldığında borçlanma gerçekleşir).
- 8-bitlik `-128` (`80H`) veya 16-bitlik `-32768` (`8000H`) değerine `NEG` uygulandığında, elde edilen sayı pozitif aralığa sığmadığından **Taşma Bayrağı (OF - Overflow Flag) 1 olur** ve işlenen değişmeden kalır.

---

## 5.2 Aritmetik Durum Bayraklarının Mekaniği (CF, OF, SF, ZF, AF, PF) ve Taşma (Overflow) Kuralı

8086 işlemcisinde her aritmetik işlem sonrasında ALU, sonucun niteliklerini 16-bitlik `FLAGS` yazmacındaki 6 durum bayrağına yansıtır:

| Bayrak | Kısaltma | Adı | Set Edilme Şartı ($= 1$) | Sıfırlanma Şartı ($= 0$) |
|:---:|:---:|:---|:---|:---|
| Bit 0 | **CF** | Carry Flag (Elde Bayrağı) | En yüksek anlamlı bitten (MSB) elde veya borç çıktığında | Elde veya borç oluşmadığında |
| Bit 2 | **PF** | Parity Flag (Parite Bayrağı) | Sonucun en düşük 8 bitindeki 1'lerin sayısı çift (even) ise | 1'lerin sayısı tek (odd) ise |
| Bit 4 | **AF** | Auxiliary Carry (Yardımcı Elde) | Bit 3'ten Bit 4'e (düşük nipelden yüksek nipele) elde/borç geçtiğinde | Nipel arası geçiş olmadığında |
| Bit 6 | **ZF** | Zero Flag (Sıfır Bayrağı) | Aritmetik işlemin matematiksel sonucu tam $0$ ise | Sonuç sıfırdan farklı ise |
| Bit 7 | **SF** | Sign Flag (İşaret Bayrağı) | Sonucun en yüksek anlamlı biti $MSB = 1$ ise (negatif sayı) | $MSB = 0$ ise (pozitif sayı) |
| Bit 11 | **OF** | Overflow Flag (Taşma Bayrağı) | İşaretli ikiye tümleyen aritmetik sınırları aşıldığında | Sonuç geçerli işaretli aralıkta ise |

### İşaretsiz vs. İşaretli Taşma Ayrımı (CF vs. OF)

Mikroişlemci donanımı, toplanan veya çıkarılan bitlerin işaretli mi yoksa işaretsiz mi olduğunu bilemez. ALU işlemi salt ikili (binary) olarak yapar ve iki farklı bayrağı aynı anda günceller:
1. **İşaretsiz Aritmetik Gözetimi (CF):** Veri işaretsiz kabul edilir. 8-bitte $0 \dots 255$, 16-bitte $0 \dots 65535$ aralığı taşarsa $CF = 1$ olur.
2. **İşaretli Aritmetik Gözetimi (OF):** Veri işaretli kabul edilir. 8-bitte $-128 \dots +127$, 16-bitte $-32768 \dots +32767$ aralığı aşılırsa $OF = 1$ olur.

### İşaretli Taşma Algılama Formülü (Signed Overflow Detection Formula)

Donanımsal düzeyde taşma bayrağı, en yüksek anlamlı bite (MSB) giren elde ($C_{in}$) ile bu bitten çıkan eldenin ($C_{out}$) dışlamalı veya (XOR) işlemine tabi tutulmasıyla belirlenir:

$$OF = C_{in} \oplus C_{out}$$

$$\text{Taşma Kuralı: } OF = \text{Carry into MSB} \oplus \text{Carry out of MSB}$$

- Eğer MSB'ye bir elde girmiş ($C_{in}=1$) fakat dışarı elde çıkmamışsa ($C_{out}=0$), $OF = 1 \oplus 0 = 1$ olur (Taşma var).
- Eğer MSB'ye elde girmemiş ($C_{in}=0$) fakat dışarı elde çıkmışsa ($C_{out}=1$), $OF = 0 \oplus 1 = 1$ olur (Taşma var).
- $C_{in}$ ve $C_{out}$ birbirine eşit olduğunda ($0 \oplus 0 = 0$ veya $1 \oplus 1 = 0$) taşma oluşmaz ($OF = 0$).

Programlama mantığı açısından işaretli taşma şu iki durumda kesinlikle gerçekleşir:
1. İki pozitif sayı toplanıp sonuç **negatif** çıkarsa ($+A + +B = -C$).
2. İki negatif sayı toplanıp sonuç **pozitif** çıkarsa ($-A + -B = +C$).

### Adım Adım Bayrak Analizi Örnekleri

#### Örnek 1: Taşmasız Pozitif Toplama
```asm
MOV DL, 12H      ; 0001 0010b (+18)
ADD DL, 33H      ; 0011 0011b (+51)
; Sonuç: 45H     ; 0100 0101b (+69)
```
- **Z (Zero Flag) = 0:** Sonuç $45H \neq 0$.
- **C (Carry Flag) = 0:** Bit 7'den dışarı elde çıkmadı ($C_{out}=0$).
- **A (Auxiliary Carry) = 0:** Bit 3'ten Bit 4'e nipel geçişi olmadı ($2H + 3H = 5H \le 9$).
- **S (Sign Flag) = 0:** MSB biti 0'dır (sonuç pozitif).
- **P (Parity Flag) = 0:** $45H = 01000101b$ içinde 3 adet '1' vardır (tek parite / odd).
- **O (Overflow Flag) = 0:** Pozitif ile pozitif toplandı, sonuç pozitif ($C_{in}=0, C_{out}=0 \to 0 \oplus 0 = 0$).

#### Örnek 2: Borçlanmalı Çıkarma (Borrow Subtraction)
```asm
MOV CH, 22H      ; 0010 0010b (34)
SUB CH, 44H      ; 0100 0100b (68)
; 22H - 44H = DEH ; 1101 1110b (-34 işaretli, 222 işaretsiz)
```
- **Z = 0:** Sonuç $DEH \neq 0$.
- **C = 1:** $22H < 44H$ olduğundan borç alındı (işaretsiz borçlanma).
- **A = 1:** Düşük nipelde $2H - 4H$ borçlanma gerektirdi.
- **S = 1:** MSB biti 1'dir (sonuç negatif).
- **P = 1:** $DEH = 11011110b$ içinde 6 adet '1' vardır (çift parite / even).
- **O = 0:** $+34 - (+68) = -34$. Sayı $-128 \dots +127$ sınırları içerisindedir, taşma yoktur.

#### Örnek 3: İşaretli Taşma (Signed Overflow)
```asm
MOV AL, 7FH      ; 0111 1111b (+127 ondalık, 8-bit azami pozitif)
ADD AL, 01H      ; 0000 0001b (+1)
; Sonuç: 80H     ; 1000 0000b (-128 ikiye tümleyen)
```
- **CF = 0:** 8-bit işaretsiz toplam $128 \le 255$, elde yok.
- **OF = 1:** İki pozitif sayı toplandı ($+127 + 1 = +128$), fakat $+128$ değeri 8-bit işaretli alana sığmadığından işaret biti ters dönerek negatif $(-128)$ oldu! $C_{in}=1, C_{out}=0 \implies OF = 1 \oplus 0 = 1$.
- **SF = 1, ZF = 0, AF = 1, PF = 0.**

---

## 5.3 Karşılaştırma Mekanizması: CMP Komutu ve İşaretli/İşaretsiz Karşılaştırma Mantığı

`CMP` (Compare) komutu iki işleneni karşılaştırmak için kullanılır:

$$\text{CMP Hedef, Kaynak}$$

`CMP`, arka planda `SUB` komutu ile tamamen aynı şekilde çıkarma işlemi yürütür:

$$\text{Geçici Değer} \leftarrow \text{Hedef} - \text{Kaynak}$$

> **En Kritik Özellik:** `CMP` komutu hedef işlenenin içeriğini **ASLA DEĞİŞTİRMEZ**. Çıkarma sonucunu çöpe atar, yalnızca ve yalnızca durum bayraklarını (`FLAGS: CF, ZF, SF, OF, AF, PF`) günceller.

Bu mekanizma, programcının veriyi bozmadan koşullu sıçrama (Conditional Jump - `Jcc`) komutları ile dallanma yapmasını sağlar.

```asm
CMP AL, 10H     ; AL ile 10H karşılaştırılır (AL - 10H hesaplanır)
JAE BUYUK_ESIT  ; Eğer AL >= 10H ise BUYUK_ESIT etiketine atla
MOV BL, 0       ; AL < 10H ise burası yürütülür
BUYUK_ESIT:
```

### İşaretsiz Karşılaştırma Mantığı (Unsigned: Above / Below)

İşaretsiz sayılarda büyüklük ilişkisi yalnızca **CF** ve **ZF** bayrakları üzerinden yorumlanır:
- **Eşitlik ($\text{Hedef} = \text{Kaynak}$):** Fark sıfırdır $\implies \mathbf{ZF = 1, CF = 0}$.
- **Büyük ($\text{Hedef} > \text{Kaynak}$):** Borçlanma olmaz ve sonuç sıfır değildir $\implies \mathbf{CF = 0 \land ZF = 0}$ (`JA` / `JNBE`).
- **Küçük ($\text{Hedef} < \text{Kaynak}$):** Borçlanma zorunludur $\implies \mathbf{CF = 1}$ (`JB` / `JNAE`).
- **Büyük veya Eşit ($\text{Hedef} \ge \text{Kaynak}$):** Borçlanma yoktur $\implies \mathbf{CF = 0}$ (`JAE` / `JNB`).
- **Küçük veya Eşit ($\text{Hedef} \le \text{Kaynak}$):** $\mathbf{CF = 1 \lor ZF = 1}$ (`JBE` / `JNA`).

### İşaretli Karşılaştırma Mantığı (Signed: Greater / Less)

İşaretli ikiye tümleyen sayılarda çıkarma sonucu taşma meydana gelebileceğinden, büyüklük tespiti **SF** ve **OF** bayraklarının mantıksal bağıntısına dayanır:
- **Küçük ($\text{Hedef} < \text{Kaynak}$):** Taşma yokken sonuç negatifse ($SF=1, OF=0$) veya taşma varken sonuç pozitifse ($SF=0, OF=1$), hedef kaynaktan küçüktür $\implies \mathbf{SF \neq OF}$ (`JL` / `JNGE`).
- **Büyük veya Eşit ($\text{Hedef} \ge \text{Kaynak}$):** $\mathbf{SF = OF}$ (`JGE` / `JNL`).
- **Büyük ($\text{Hedef} > \text{Kaynak}$):** $\mathbf{ZF = 0 \land SF = OF}$ (`JG` / `JNLE`).
- **Küçük veya Eşit ($\text{Hedef} \le \text{Kaynak}$):** $\mathbf{ZF = 1 \lor SF \neq OF}$ (`JLE` / `JNG`).

---

## 5.4 Çarpma İşlemleri: İşaretsiz (MUL) ve İşaretli (IMUL) Çarpma Kuralları, DX:AX Sonuç Yazmaçları

İki $N$-bitlik sayının çarpımı $2N$ bitlik bir alana ihtiyaç duyar. Bu nedenle 8086 mikroişlemcisinde çarpma komutları sonuçları çift genişlikteki yazmaç kombinasyonlarında toplar.

Çarpma komutlarında ilk işlenen (multiplicand) örtük olarak (implicit) daima akümülatör yazmacında (`AL` veya `AX`) bulunur. Komutta yalnızca ikinci işlenen (çarpan / multiplier) belirtilir:

### 8-Bit Çarpma: $AX \leftarrow AL \times \text{src8}$
- Çarpılan: `AL` (8-bit)
- Çarpan: Herhangi bir 8-bit yazmaç (`BL, CL, DL, AH...`) veya 8-bit bellek hücresi (`BYTE PTR [SI]`). Anlık sabit değer (immediate) 8086'da doğrudan verilemez.
- Çarpım Sonucu: 16-bitlik tam sonuç **`AX` yazmacına** yazılır (`AH` yüksek bayt, `AL` düşük bayt).

```asm
MOV BL, 5       ; Çarpan BL = 5
MOV AL, 10      ; Çarpılan AL = 10
MUL BL          ; AX = AL * BL = 50 (0032H). AH = 00H, AL = 32H
```

### 16-Bit Çarpma: $DX:AX \leftarrow AX \times \text{src16}$
- Çarpılan: `AX` (16-bit)
- Çarpan: Herhangi bir 16-bit yazmaç (`BX, CX, DX, SI, DI, BP`) veya 16-bit bellek hücresi (`WORD PTR [BX]`).
- Çarpım Sonucu: 32-bitlik tam sonuç **`DX:AX` yazmaç çiftine** yazılır.
  - **`DX`:** Çarpımın en yüksek anlamlı 16 biti (High 16 bits).
  - **`AX`:** Çarpımın en düşük anlamlı 16 biti (Low 16 bits).

```asm
MOV AX, 1000H
MOV BX, 2000H
MUL BX          ; DX:AX = 1000H * 2000H = 02000000H -> DX = 0200H, AX = 0000H
```

### 32-Bit Çarpma (80386+ Genişlemesi)
Modern 32-bit işlemcilerde:
$$EDX:EAX \leftarrow EAX \times \text{src32}$$

### Çarpma Komutlarında Bayrak Hassasiyeti (CF ve OF)

Çarpma işlemi sonrasında ALU bayraklarından **yalnızca CF ve OF anlamlıdır**; ZF, SF, AF ve PF bayraklarının durumu tanımsızdır (unpredictable).
- **MUL (İşaretsiz Çarpma):** Eğer çarpım sonucunun yüksek yarısı sıfırdan farklı bir değer içeriyorsa (yani 8-bitte $AH \neq 0$ veya 16-bitte $DX \neq 0$), **$CF = OF = 1$** olur. Bu durum, sonucun tek bir yazmaca sığmadığını ve çift yazmaç gerektirdiğini gösterir. Yüksek yarı $0$ ise $CF = OF = 0$ olur.
- **IMUL (İşaretli Çarpma):** Eğer çarpım sonucunun yüksek yarısı, düşük yarısının saf bir işaret uzatması (sign extension) değilse **$CF = OF = 1$** olur. Eğer yüksek yarı tamamen düşük yarının işaretini taşıyorsa ek anlamlı bilgi içermez ve $CF = OF = 0$ olur.

```asm
; IMUL Örneği:
MOV AL, -5      ; AL = FBH
MOV BL, 4       ; BL = 04H
IMUL BL         ; AX = -20 = FFECh. AH = FFh (AL'nin işaret uzatması), CF=OF=0
```

---

## 5.5 Bölme İşlemleri: İşaretsiz (DIV) ve İşaretli (IDIV) Bölme Kuralları, Bölüm/Kalan Yerleşimi ve Type 0 Taşma Kesmesi

Bölme işlemi, çarpmanın tam tersine $2N$ bitlik bir bölüneni $N$ bitlik bir bölene bölerek $N$ bitlik bölüm ve $N$ bitlik kalan üretir.

### 8-Bit Bölme (16-Bit / 8-Bit)
- Bölünen (Dividend): **`AX`** (16-bit)
- Bölen (Divisor): 8-bit yazmaç veya bellek hücresi (`src8`)
- **Bölüm (Quotient):** **`AL`** yazmacına yerleşir ($AL = \lfloor AX / \text{src8} \rfloor$).
- **Kalan (Remainder):** **`AH`** yazmacına yerleşir ($AH = AX \pmod{\text{src8}}$).

```asm
; Örnek: 100 / 10 = 10 (Kalan 0)
MOV AX, 64H     ; AX = 100 (ondalık)
MOV BL, 0AH     ; BL = 10
DIV BL          ; AL = 10 (0AH), AH = 0 (kalan)
```

### 16-Bit Bölme (32-Bit / 16-Bit)
- Bölünen (Dividend): **`DX:AX`** (32-bit, yüksek yarı `DX`, düşük yarı `AX`)
- Bölen (Divisor): 16-bit yazmaç veya bellek hücresi (`src16`)
- **Bölüm (Quotient):** **`AX`** yazmacına yerleşir.
- **Kalan (Remainder):** **`DX`** yazmacına yerleşir.

```asm
MOV DX, 0       ; İşaretsiz bölmede yüksek yarı sıfırlanmalıdır
MOV AX, 5000H
MOV CX, 100H
DIV CX          ; AX = 50H (bölüm), DX = 0H (kalan)
```

### Bölüneni Hazırlama Kuralları: Sıfır ve İşaret Uzatma (CBW, CWD)

Programcı bölme yapmadan önce bölünen yazmaç çiftini mutlaka doğru biçimde hazırlamak zorundadır:
1. **İşaretsiz Bölmede (DIV):**
   - 8-bitlik bölme için: `AH` sıfırlanmalıdır (`MOV AH, 0`).
   - 16-bitlik bölme için: `DX` sıfırlanmalıdır (`MOV DX, 0` veya `XOR DX, DX`).
2. **İşaretli Bölmede (IDIV):**
   - 8-bitlik bölme için: `AL` yazmacındaki işaretli değer `AX`'e genişletilmelidir: **`CBW`** (Convert Byte to Word).
   - 16-bitlik bölme için: `AX` yazmacındaki işaretli değer `DX:AX`'e genişletilmelidir: **`CWD`** (Convert Word to Doubleword).

```asm
; İşaretli 16-Bit Bölme Örneği: -100 / 9
MOV AX, -100    ; AX = FF9Ch
CWD             ; DX:AX = FFFFFFFF FF9Ch (DX işaret uzatması ile FFFFh oldu)
MOV CX, 9
IDIV CX         ; AX = -11 (FFF5h), DX = -1 (FFFFh, kalan)
```

> **İşaret Kuralı:** İşaretli bölmede (IDIV) kalanın işareti daima **bölünenin (dividend) işareti ile aynıdır**.

### Bölme Hataları ve Type 0 Taşma Kesmesi (Divide by Zero & Divide Overflow)

Bölme komutları sonrasında tüm durum bayrakları (`FLAGS`) tanımsızdır. Ancak bölme işlemine özgü iki kritik donanımsal hata senaryosu mevcuttur:

1. **Sıfıra Bölme Hatası (Divide by Zero):** Bölen işlenen $0$ olduğunda matematiksel olarak tanımsızlık oluşur.
2. **Bölme Taşması Hatası (Divide Overflow):** Bölme sonucunda ortaya çıkan bölüm (quotient), hedef yazmacın alabileceği azami kapasiteyi aştığında oluşur.
   - *Örnek:* 8-bitlik işaretsiz bölmede $AX = 3000$ ve bölen $BL = 2$ olsun. Matematiksel bölüm $3000 / 2 = 1500$'dür. Oysa bölümün yazılacağı `AL` yazmacı en fazla $255$ değerini alabilir. $1500 > 255$ olduğundan bölüm `AL`'ye sığamaz ve **Bölme Taşması (Divide Overflow)** gerçekleşir.

```
       Bölme Hatası Tetiklenme Mekanizması
  +-------------------------------------------+
  | Bölme İşlemi (DIV veya IDIV) Yürütülür    |
  +-------------------------------------------+
                       |
         +-------------+-------------+
         |                           |
  [Bölen == 0?]             [Bölüm Sığmıyor mu?]
  (Divide by Zero)          (Divide Overflow)
         |                           |
         +-------------+-------------+
                       | EVET
                       v
  +-------------------------------------------+
  | Donanımsal Kesme: Intel Tip 0 (Type 0)    |
  | IVT Adresi: 00000h - 00003h Çekilir       |
  | "Divide Error" / "Divide Overflow" Basılır|
  | Program Zorla Sonlandırılır (Halt/Crash)  |
  +-------------------------------------------+
```

Bu iki durumdan biri gerçekleştiğinde 8086 CPU yürütmeyi derhal durdurur ve **Intel Tip 0 (Type 0 - Divide Error Exception)** kesmesini tetikler. İşlemci, Kesme Vektör Tablosu'nun (IVT) ilk 4 baytında (`00000h`–`00003h`) kayıtlı olan ISR rutinini çalıştırarak ekrana bir hata mesajı basar ve programı sonlandırır.

---

## 5.6 Paketlenmiş ve Paketlenmemiş BCD Aritmetiği: DAA (Decimal Adjust for Addition) ve DAS (Decimal Adjust for Subtraction)

İkili Kodlanmış Onlu (BCD - Binary Coded Decimal) formatında her onluk basamak (0–9) 4 bitlik bir nipel (nibble) ile temsil edilir:
- **Paketlenmemiş BCD (Unpacked BCD):** Her baytta yalnızca bir basamak tutulur (üst nipel daima `0000b`'dir: `00h`–`09h`).
- **Paketlenmiş BCD (Packed BCD):** Her baytta iki basamak tutulur (`00h`–`99h`). Örneğin $59$ sayısı ikili tabanda `0011 1011b` iken BCD formatında `0101 1001b` (`59h`) olarak kodlanır.

Standart ikili toplayıcı (binary adder), BCD kurallarını bilmez. Örneğin BCD 38h ile BCD 45h toplandığında ALU ikili olarak şunu üretir:

$$38\text{H} + 45\text{H} = 7\text{DH}$$

Oysa 'D' geçerli bir ondalık BCD hanesi değildir ($38 + 45 = 83$ olmalıdır). Bu uyumsuzluğu gidermek için toplama işleminden hemen sonra `DAA`, çıkarma işleminden hemen sonra ise `DAS` komutu yürütülür.

### DAA (Decimal Adjust for Addition) Düzeltme Algoritması

`DAA` komutu yalnızca `AL` yazmacı üzerinde çalışır. `ADD` veya `ADC` komutunun hemen ardından çağrılmalıdır:

```asm
MOV AL, 38H     ; BCD 38
MOV BL, 45H     ; BCD 45
ADD AL, BL      ; İkili toplam: AL = 7DH, AF = 0, CF = 0
DAA             ; BCD Düzeltmesi: AL = 83H, CF = 0
```

`DAA` donanımsal düzeltme tablosu ve karar mantığı şu iki aşamadan oluşur:
1. **Düşük Nipel Düzeltmesi:**
   - Eğer $AL$'nin alt 4 biti ($AL \land 0\text{FH}$) $9$'dan büyükse **VEYA** Yardımcı Elde Bayrağı $AF = 1$ ise:
     $$AL \leftarrow AL + 06\text{H}, \quad AF \leftarrow 1$$
2. **Yüksek Nipel Düzeltmesi:**
   - Eğer $AL$'nin üst 4 biti $9$'dan büyükse ($AL > 9\text{FH}$) **VEYA** Elde Bayrağı $CF = 1$ ise:
     $$AL \leftarrow AL + 60\text{H}, \quad CF \leftarrow 1$$

| Başlangıç AL Değeri | Giriş AF | Giriş CF | AL'ye Eklenen Değer | Çıkış AF | Çıkış CF |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Alt nipel $\le 9$, Üst nipel $\le 9$ | 0 | 0 | $+00\text{H}$ | 0 | 0 |
| Alt nipel $> 9$, Üst nipel $\le 8$ | X | 0 | $+06\text{H}$ | 1 | 0 |
| Alt nipel $\le 9$, Üst nipel $> 9$ | 0 | X | $+60\text{H}$ | 0 | 1 |
| Alt nipel $> 9$, Üst nipel $> 9$ | X | X | $+66\text{H}$ | 1 | 1 |

### DAS (Decimal Adjust for Subtraction) Düzeltme Algoritması

`DAS` komutu paketlenmiş BCD çıkarma işlemlerinden (`SUB` veya `SBB`) sonra `AL` yazmacını düzeltir:

1. Eğer $AL$'nin alt nipeli $> 9$ veya $AF = 1$ ise:
   $$AL \leftarrow AL - 06\text{H}, \quad AF \leftarrow 1$$
2. Eğer $AL > 9\text{FH}$ veya $CF = 1$ ise:
   $$AL \leftarrow AL - 60\text{H}, \quad CF \leftarrow 1$$

```asm
MOV AL, 83H     ; BCD 83
MOV BL, 45H     ; BCD 45
SUB AL, BL      ; AL = 83H - 45H = 3EH (ikili fark)
DAS             ; AL = 38H (BCD 38)
```

---

## 5.7 ASCII Aritmetiği: AAA, AAS, AAM ve AAD Komutlarının Matematiksel Algoritmaları

ASCII karakter tablosunda rakamlar ('0'–'9') `30H` ile `39H` arasında yer alır. Mikroişlemci doğrudan klavyeden veya metin dosyasından okunan ASCII karakterler üzerinde toplama, çıkarma, çarpma ve bölme yapabilir.

### AAA (ASCII Adjust for Addition)
İki ASCII karakter toplandıktan sonra `AL` yazmacını paketlenmemiş BCD formatına (00h-09h) çevirir ve varsa eldeyi `AH` yazmacına aktarır:

```asm
MOV AX, 0008H   ; Unpacked BCD 8 (veya '8' için 38h)
ADD AL, 07H     ; AL = 8 + 7 = 0FH
AAA             ; AL = 05H, AH = 01H (AX = 0105H -> 15 ondalık)
OR AX, 3030H    ; AX = 3135H ('1' ve '5' ASCII karakterleri)
```

- **AAA Algoritması:**
  - Eğer $(AL \land 0\text{FH}) > 9$ veya $AF = 1$ ise:
    $$AL \leftarrow (AL + 6) \land 0\text{FH}, \quad AH \leftarrow AH + 1, \quad AF \leftarrow 1, \quad CF \leftarrow 1$$
  - Aksi halde:
    $$AL \leftarrow AL \land 0\text{FH}, \quad AF \leftarrow 0, \quad CF \leftarrow 0$$
  - `AAA` yürütüldükten sonra `AL`'nin üst nipeli daima `0` olur.

### AAS (ASCII Adjust for Subtraction)
ASCII çıkarma işlemi sonrasında farkı düzeltir:
- Eğer $(AL \land 0\text{FH}) > 9$ veya $AF = 1$ ise:
  $$AL \leftarrow (AL - 6) \land 0\text{FH}, \quad AH \leftarrow AH - 1, \quad AF \leftarrow 1, \quad CF \leftarrow 1$$
- Aksi halde:
  $$AL \leftarrow AL \land 0\text{FH}, \quad AF \leftarrow 0, \quad CF \leftarrow 0$$

### AAM (ASCII Adjust for Multiplication)
İki tek haneli paketlenmemiş BCD sayının çarpımı (veya ikili çarpımı) `AL`'dedir. `AAM`, bu değeri iki basamaklı paketlenmemiş BCD formatına (onlar basamağı `AH`, birler basamağı `AL`) ayırır:

$$AH \leftarrow \lfloor AL / 10 \rfloor, \quad AL \leftarrow AL \pmod{10}$$

```asm
MOV AL, 5
MOV BL, 7
MUL BL          ; AL = 35 (23H)
AAM             ; AH = 35 / 10 = 3, AL = 35 % 10 = 5 -> AX = 0305H
OR AX, 3030H    ; AX = 3335H ('3' ve '5' karakterleri)
```

> **İleri Düzey Mimari Notu (Genelleştirilmiş Taban):** `AAM` komutunun makine kodu iki bayttır: `D4 0AH`. Buradaki `0AH` bölen tabandır (10). Eğer makine kodunda `0AH` yerine başka bir taban yazılırsa (örn. `D4 10H`), `AAM` komutu onaltılık (hex) tabana göre dönüştürme yapar!

### AAD (ASCII Adjust before Division)
Diğer düzeltme komutlarının aksine `AAD`, bölme işleminden **SONRA DEĞİL, BÖLME İŞLEMİNDEN HEMEN ÖNCE** yürütülür! `AH:AL` içindeki iki basamaklı paketlenmemiş BCD sayıyı ikiliye (binary) dönüştürerek `DIV` komutuna hazırlar:

$$AL \leftarrow (AH \times 10) + AL, \quad AH \leftarrow 0$$

```asm
; "35" / 5 işlemini yapmak:
MOV AX, 0305H   ; Onlar hanesi 3 (AH), birler hanesi 5 (AL)
AAD             ; AL = (3 * 10) + 5 = 35 (23H), AH = 0
MOV BL, 5
DIV BL          ; AL = 7 (bölüm), AH = 0 (kalan)
```

---

## 5.8 Çok Basamaklı ve Çok Kelimeli (Multi-Precision) Toplama/Çıkarma Algoritmaları

Standart 16-bitlik mimaride 32-bit, 64-bit veya dizi tabanlı devasa sayıların toplanması ve çıkarılması, Elde Bayrağının (CF) basamaklar arasında taşınması prensibine dayanır.

### 32-Bit Toplama Algoritması
İki adet 32-bit sayı bellekte veya yazmaç çiftlerinde (`DX:AX` ve `BX:CX`) tutulsun:

```asm
; Sayı 1: DX:AX (High:Low)
; Sayı 2: BX:CX (High:Low)
; Toplam: DX:AX içine yazılacak
ADD AX, CX      ; Düşük 16 bit toplanır. Sonuç 16 biti aşarsa CF = 1 olur.
ADC DX, BX      ; Yüksek 16 bit toplanır ve önceki toplamanın eldesi (CF) eklenir.
```

### Bellekteki Çok Kelimeli Dizi Toplama Rutini
Aşağıdaki örnekte `w11.pdf` ders notlarında incelenen birden fazla işçinin günlük/yıllık ücretlerinin toplamını hesaplayan algoritmanın genelleştirilmiş assembly kodu görülmektedir:

```asm
ORG 100h

LEA SI, SAYILAR     ; Sayılar dizisinin başlangıç adresi
MOV CX, 5           ; Toplanacak kelime sayısı (5 adet word)
XOR AX, AX          ; Toplamın düşük kelimesi sıfırlanır
XOR DX, DX          ; Toplamın yüksek kelimesi (elde biriktirici) sıfırlanır

TOPLAMA_DONGUSU:
    ADD AX, [SI]    ; Sıradaki kelimeyi toplama ekle
    ADC DX, 0       ; Eğer toplama 16 biti aştıysa eldeyi DX'e taşı
    ADD SI, 2       ; Bir sonraki kelimeye geç (Word = 2 bayt)
    LOOP TOPLAMA_DONGUSU

; Sonuç: DX:AX 32-bitlik toplam değerini içerir
HLT

SAYILAR DW 27345, 28521, 29533, 30105, 32375
```

Bu algoritmada `ADD AX, [SI]` komutu her kelimeyi akümülatöre ekler; oluşan elde ise `ADC DX, 0` ile yüksek anlamlı kelimede biriktirilir. Böylece 16-bitlik işlemci üzerinde hiçbir veri kaybı yaşanmadan 32-bitlik akümülasyon gerçekleştirilmiş olur.
