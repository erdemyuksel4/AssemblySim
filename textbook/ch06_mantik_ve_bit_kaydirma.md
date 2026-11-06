# Bölüm 6: Mantıksal İşlemler, Maskeleme ve Bit Kaydırma/Döndürme (Logic Instructions, Masking & Shifts/Rotates)

Mikroişlemcilerin programlanmasında aritmetik hesaplamalar kadar önemli bir diğer temel alan, bit düzeyinde (Bitwise) mantıksal manipülasyonlar, bayrak durum testleri ve verilerin sola/sağa ötelenmesidir. Intel 8086 mimarisinde mantıksal işlemler (AND, OR, XOR, NOT, TEST) ve bit kaydırma/döndürme komutları (SHL/SAL, SHR, SAR, ROL, ROR, RCL, RCR), verilerin paketlenmesi/açılması, çevre birimi kontrol yazmaçlarının yönetimi, maskeleme (masking) işlemleri ve çarpma/bölme işlemlerinin donanımsal olarak hızlandırılmasında kritik rol oynar. Bu bölümde tüm Boole mantık kapıları, doğruluk tabloları (truth tables), yıkıcı olmayan bit kontrolü, işaret uzatmalı aritmetik kaydırma ve çok kelimeli (Multi-Word) veri bloklarında bit öteleme algoritmaları derinlemesine incelenmektedir.

---

## 6.1 Boole Mantık İşlemleri: AND, OR, XOR, NOT Komutları ve Doğruluk Tabloları

8086 mikroişlemcisinin Yürütme Birimi (EU - Execution Unit) içinde yer alan ALU, iki işlenen arasındaki Boole mantık işlemlerini bit bit (bit-by-bit / bitwise) paralel olarak gerçekleştirir.

### Doğruluk Tabloları (Truth Tables)

Temel mantık fonksiyonlarının girdi bitlerine ($A$ ve $B$) karşılık ürettiği çıktı değerleri aşağıdaki doğruluk tablosunda özetlenmiştir:

| Girdi A | Girdi B | AND ($A \land B$) | OR ($A \lor B$) | XOR ($A \oplus B$) | NOT A ($\overline{A}$) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 |

### Komut Sözdizimi ve İşleyiş

- **`AND Hedef, Kaynak`:** Mantıksal çarpma işlemidir. Karşılıklı gelen her iki bit de `1` olduğunda sonuç biti `1` olur; aksi halde `0` üretilir.
- **`OR Hedef, Kaynak`:** Mantıksal toplama işlemidir. Karşılıklı gelen bitlerden en az biri `1` ise sonuç biti `1` olur; her iki bit de `0` ise `0` üretilir.
- **`XOR Hedef, Kaynak`:** Dışlamalı Veya (Exclusive-OR) işlemidir. İki giriş biti birbirinden farklı olduğunda sonuç `1`, aynı olduğunda (`0-0` veya `1-1`) sonuç `0` olur.
- **`NOT Hedef`:** Tek işlenenli mantıksal tersleme işlemidir. İşlenenin tüm bitlerini tersine çevirerek bire tümleyenini (One's Complement) alır ($0 \to 1, 1 \to 0$).

```asm
AND AL, BL      ; AL = AL AND BL
OR  DX, [BX]    ; DX = DX OR [DS:BX]
XOR CH, DL      ; CH = CH XOR DL
NOT AX          ; AX = NOT AX (Tüm bitler terslenir)
```

### Mantıksal Komutların Bayrak Kütüğüne (FLAGS) Etkisi

Mantıksal işlemler ALU bayraklarını belirli kurallara göre günceller:
1. **CF ve OF Bayrakları:** `AND`, `OR` ve `XOR` komutları **Elde Bayrağını (CF) ve Taşma Bayrağını (OF) DAİMA SIFIRLAR ($CF = 0, OF = 0$)**. Mantıksal işlemlerde elde ya da aritmetik taşma söz konusu olamayacağından bu bayraklar donanım tarafından temizlenir.
2. **ZF, SF ve PF Bayrakları:** Sonucun değerine göre güncellenir. Eğer işlem sonucu tam `0` ise $ZF = 1$ olur; sonucun en yüksek anlamlı biti (MSB) `1` ise $SF = 1$ olur; sonucun en düşük 8 bitindeki '1' sayısı çift ise $PF = 1$ olur.
3. **AF Bayrağı:** Durumu tanımsızdır (unpredictable).
4. **NOT Komutunun Özel Durumu:** `NOT` komutu **BAYRAK KÜTÜĞÜNDEKİ HİÇBİR BİTİ ETKİLEMEZ!** FLAGS yazmacı `NOT` yürütülmeden önceki durumunu aynen muhafaza eder.

---

## 6.2 Bit Maskeleme Teknikleri: Belirli Bitleri Sıfırlama (AND), Birleme (OR) ve Tersleme (XOR)

Gömülü sistemlerde ve sistem programlamada, bir yazmaçtaki belirli bitlerin diğer bitleri bozmadan değiştirilmesi gereklidir. Bu amaca yönelik tasarlanan sabit bit kalıplarına **Maske (Mask)**, yapılan işleme ise **Bit Maskeleme (Masking)** adı verilir.

```
                    Üç Temel Maskeleme Amacı
   +-------------------------------------------------------------+
   | 1. Bit Sıfırlama (Clear): AND kullanılır. Maske biti = 0   |
   | 2. Bit Birleme   (Set)  : OR  kullanılır. Maske biti = 1   |
   | 3. Bit Tersleme  (Toggle): XOR kullanılır. Maske biti = 1   |
   +-------------------------------------------------------------+
```

### 1. Belirli Bitleri Sıfırlama (Clearing Bits with AND)

Bir yazmaçtaki belirli bitleri sıfırlamak, diğer bitleri ise aynen korumak için `AND` işlemi kullanılır. Kural şudur:
- Sıfırlanmak istenen pozisyonlara maskede `0` konur ($X \land 0 = 0$).
- Korunmak istenen pozisyonlara maskede `1` konur ($X \land 1 = X$).

#### Örnek: ASCII Karakterini Sayısal Değere (BCD) Dönüştürme
ASCII '0'–'9' karakterleri `30H`–`39H` arasındadır (`0011 xxxxb`). Yüksek 4 biti (`0011b`) temizleyip sadece düşük 4 biti almak için `0FH` maskesi ile `AND` yapılır:

```asm
MOV AL, '5'     ; AL = 35H (0011 0101b)
AND AL, 0FH     ; AL = 35H AND 0FH = 05H (0000 0101b) -> Sayısal 5
```

İki ASCII basamağını aynı anda dönüştürmek için 16-bit maskeleme uygulanabilir (Week 5 Slide 30):
```asm
MOV BX, 3135H   ; '1' (31h) ve '5' (35h) ASCII karakterleri
AND BX, 0F0FH   ; BX = 0105H (Paketlenmemiş BCD basamakları 1 ve 5)
```

### 2. Belirli Bitleri Birleme (Setting Bits with OR)

Bir yazmaçtaki belirli bitleri 1 yapmak, diğer bitlere dokunmamak için `OR` işlemi kullanılır:
- 1 yapılmak istenen pozisyonlara maskede `1` konur ($X \lor 1 = 1$).
- Korunmak istenen pozisyonlara maskede `0` konur ($X \lor 0 = X$).

#### Örnek: Donanım Kontrol Bitlerini Etkinleştirme
```asm
; Bir çevre birimi kontrol yazmacında Bit 9 ve Bit 10'u 1 yapmak:
; Maske: 0000 0110 0000 0000b = 0600H
OR CX, 0600H    ; Bit 9 ve 10 set edilir, kalan 14 bit korunur
```

### 3. Belirli Bitleri Tersleme (Inverting / Toggling Bits with XOR)

Belirli bitlerin durumunu tersine çevirmek ($0 \to 1, 1 \to 0$) için `XOR` işlemi kullanılır:
- Terslenmek istenen pozisyonlara maskede `1` konur ($X \oplus 1 = \overline{X}$).
- Aynen korunması istenen pozisyonlara maskede `0` konur ($X \oplus 0 = X$).

```asm
; CX yazmacında yalnızca Bit 12'yi terslemek:
XOR CX, 1000H   ; Bit 12 terslenir, diğer tüm bitler değişmez
```

### En Hızlı Yazmaç Sıfırlama Tekniği: `XOR reg, reg`

8086 montaj dilinde bir yazmacı sıfırlamak için `MOV AX, 0` yerine neredeyse daima `XOR AX, AX` tercih edilir:

```asm
XOR AX, AX      ; AX = 0000H, ZF = 1, CF = OF = 0
```

Bu tercihin mimari nedenleri:
1. **Kod Boyutu (Opcode Density):** `MOV AX, 0` komutu 3 bayttır (`B8 00 00`, 16-bit anlık veri taşır). `XOR AX, AX` ise yalnızca **2 bayttır** (`31 C0`). Komut ön getirme kuyruğunda yer tasarrufu sağlar.
2. **Çalışma Hızı:** Anlık sabit verinin getirilmesi gerekmeyip doğrudan iç yazmaçlar üzerinden yürütülür.
3. **Bayrak Güncellemesi:** Sonuç sıfır olduğu için donanımsal olarak **$ZF = 1$** yapılır.

---

## 6.3 TEST Komutu ve Yıkıcı Olmayan (Non-Destructive) Durum Tespiti

`TEST` komutu, iki işlenen arasında mantıksal `AND` işlemi yürütür:

$$\text{Geçici Değer} \leftarrow \text{Hedef} \land \text{Kaynak}$$

> **Kritik Mimari Özellik:** Tıpkı `CMP` komutunun `SUB` işlemini hedefi değiştirmeden yapması gibi, `TEST` komutu da `AND` işlemini hedef işleneni **ASLA DEĞİŞTİRMEDEN** yürütür. Hedef yazmaç veya bellek içeriği aynen korunur; yalnızca durum bayrakları (`FLAGS: ZF, SF, PF`) güncellenir ($CF=0, OF=0$).

`TEST` komutu genellikle bir işlenenin belirli bir bitinin veya bit grubunun `1` mi yoksa `0` mı olduğunu sorgulamak için kullanılır ve ardından bir koşullu sıçrama (`JZ` veya `JNZ`) ile kontrol sağlanır:
- Test edilen bit `0` ise $\implies \text{Sonuç} = 0 \implies \mathbf{ZF = 1}$ (`JZ` sıçrar).
- Test edilen bit `1` ise $\implies \text{Sonuç} \neq 0 \implies \mathbf{ZF = 0}$ (`JNZ` sıçrar).

```asm
; Örnek 1: Sayının Tek (Odd) veya Çift (Even) Olduğunu Kontrol Etmek
; Bir sayının en sağdaki biti (Bit 0 / LSB) 1 ise sayı TEK, 0 ise ÇİFTTİR.
TEST AL, 01H     ; AL'nin Bit 0'ı test edilir
JNZ SAYI_TEK    ; Eğer Bit 0 == 1 ise (ZF=0), SAYI_TEK etiketine sıçra
; Burada sayı çifttir

; Örnek 2: Sayının Negatif Olduğunu (MSB / İşaret Biti) Kontrol Etmek
TEST AL, 80H     ; AL'nin en sol biti (Bit 7) test edilir (80h = 1000 0000b)
JNZ NEGATIF_SAYI ; Bit 7 == 1 ise NEGATIF_SAYI etiketine atla
```

---

## 6.4 Mantıksal ve Aritmetik Kaydırma Komutları: SHL/SAL, SHR, SAR (Çarpma ve Bölme Hızlandırma)

Kaydırma komutları, bir yazmaç veya bellek hücresindeki bitlerin tamamını belirtilen adım sayısı kadar sola veya sağa öteler.

### Kaydırma Sayacı Kuralı (Shift Count)
8086 mikroişlemcisinde kaydırma miktarı:
- Yalnızca **1 bit** kaydırılacaksa komutta anlık sabit olarak yazılabilir: `SHL AX, 1`.
- Eğer **1'den fazla bit** kaydırılacaksa, kaydırma miktarı **MUTLAKA `CL` YAZMACINA YÜKLENMELİDİR**:
  ```asm
  MOV CL, 3
  SHL AX, CL      ; AX 3 bit sola kaydırılır
  ```
  *(Not: Anlık sabit ile `SHL AX, 3` yazımı 80186 ve sonraki işlemcilerde desteklenmiş olup, saf 8086'da donanımsal olarak geçersizdir).*

### SHL / SAL (Shift Logical Left / Shift Arithmetic Left)
Mantıksal Sola Kaydırma (`SHL`) ve Aritmetik Sola Kaydırma (`SAL`) komutları **aynı makine koduna ve aynı donanımsal işleyişe sahiptir**:

```
           +-----------------------------------------------+
     CF <--| Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | <-- 0
           +-----------------------------------------------+
```

- En sağdan (LSB) içeriye daima **`0` biti** girer.
- Tüm bitler bir pozisyon sola ötelenir.
- En yüksek anlamlı bitten (MSB) çıkan bit **Elde Bayrağına (CF)** yazılır.
- **Matematiksel Etki:** İkili bir sayıyı 1 bit sola kaydırmak, sayıyı **2 ile çarpmak** demektir ($x \leftarrow x \times 2^n$).
- **OF Bayrağı:** 1-bitlik kaydırmada, sonuç bitinin işareti (yeni MSB) ile CF'ye çıkan eski MSB farklı ise $OF = 1$ olur (işaretli taşma).

### SHR (Shift Logical Right - Mantıksal Sağa Kaydırma)
İşaretsiz sayılar üzerinde mantıksal sağa öteleme yapar:

```
           +-----------------------------------------------+
     0 --> | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | --> CF
           +-----------------------------------------------+
```

- En soldan (MSB) içeriye daima **`0` biti** girer.
- Tüm bitler bir pozisyon sağa ötelenir.
- En düşük anlamlı bitten (LSB) çıkan bit **Elde Bayrağına (CF)** aktarılır.
- **Matematiksel Etki:** İşaretsiz tamsayıyı **2'ye bölmek** demektir ($x \leftarrow \lfloor x / 2^n \rfloor$). Çıkan kesir kısmı CF bayrağında kalır.

### SAR (Shift Arithmetic Right - Aritmetik Sağa Kaydırma & İşaret Uzatma)
İşaretli ikiye tümleyen sayılar üzerinde bölme yapmak için tasarlanmıştır:

```
           +-----------------------------------------------+
     +---> | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | --> CF
     |     +-----------------------------------------------+
     +-------+ (İşaret biti korunur / Sign Extension)
```

- En düşük anlamlı bit (LSB) **CF**'ye aktarılır.
- Tüm bitler sağa kaydırılır.
- **EN KRİTİK FARK:** En sol bite (MSB) `0` girmez! **Eski MSB (İşaret Biti) DEĞİŞTİRİLMEDEN KORUNUR (Sign Extension / İşaret Uzatma)**. Sayı negatifse MSB `1` olarak kalır ve içeri `1` girer; sayı pozitifse `0` olarak kalır ve içeri `0` girer.
- **Matematiksel Etki:** İşaretli tamsayıyı işareti bozmadan **2'ye bölmek** demektir.

```asm
; Örnek: -8 sayısının 2'ye bölünmesi
MOV AL, -8      ; AL = F8H (1111 1000b)
SAR AL, 1       ; AL = FCH (1111 1100b = -4 ondalık), CF = 0
```

### Kaydırma Komutlarıyla Hızlı Aritmetik Çarpma

Donanımsal `MUL` komutu onlarca saat çevrimi (clock cycle) tüketirken, kaydırma komutları çok daha hızlıdır. Sabit sayılarla çarpma işlemlerinde kaydırma ve toplama kombinasyonu kullanılır:

```asm
; AX yazmacını 10 ile çarpmak: AX * 10 = (AX * 8) + (AX * 2)
MOV BX, AX      ; Orijinal değeri yedekle
SHL AX, 1       ; AX = AX * 2
SHL BX, 1
SHL BX, 1
SHL BX, 1       ; BX = Orijinal * 8
ADD AX, BX      ; AX = (AX * 2) + (AX * 8) = AX * 10
```

---

## 6.5 Döngüsel Kaydırma Komutları: ROL, ROR, RCL, RCR (Carry Bayrağı Dahil/Hariç Döndürme)

Döngüsel kaydırma (Rotate) komutlarında hiçbir bit kaybolmaz. Bir uçtan dışarı çıkan bitler dairesel olarak diğer uçtan içeri geri girer.

```
                            Döngüsel Kaydırma Ailesi
         +-------------------------------------------------------------+
         | Standart Döngü (Carry Hariç) : ROL (Sola)  , ROR (Sağa)    |
         | Elde Dahil Döngü (Carry Ring): RCL (Sola)  , RCR (Sağa)    |
         +-------------------------------------------------------------+
```

### ROL (Rotate Left - Sola Döndürme)
Bitler sola ötelenir. En soldaki bitten (MSB) çıkan bit hem en sağa (LSB) geri döner **hem de** Carry Bayrağına (CF) kopyalanır:

```
        +------------------------------------------------------+
        |                                                      |
        v  +-----------------------------------------------+   |
     +--+--| Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 |<--+
     |     +-----------------------------------------------+
     v
    CF
```

### ROR (Rotate Right - Sağa Döndürme)
Bitler sağa ötelenir. En sağdaki bitten (LSB) çıkan bit hem en sola (MSB) geri döner hem de CF'ye kopyalanır:

```
        +------------------------------------------------------+
        |                                                      |
        |   +-----------------------------------------------+  v
        +-->| Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 |--+--+
            +-----------------------------------------------+  |
                                                               v
                                                              CF
```

### RCL (Rotate Carry Left - Elde Dahil Sola Döndürme)
Carry bayrağını da döngü halkasına katarak **9-bitlik** (bayt işlemi) veya **17-bitlik** (kelime işlemi) kapalı bir halka oluşturur:
- MSB'den çıkan bit **CF**'ye geçer.
- CF'deki eski değer ise **LSB**'ye girer.

```
     +---------------------------------------------------------+
     |                                                         |
     v     +-----------------------------------------------+   |
    CF <-- | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 |<--+
           +-----------------------------------------------+
```

### RCR (Rotate Carry Right - Elde Dahil Sağa Döndürme)
9-bitlik veya 17-bitlik halkada sağa döndürme:
- LSB'den çıkan bit **CF**'ye geçer.
- CF'deki eski değer ise **MSB**'ye girer.

```
     +---------------------------------------------------------+
     |                                                         |
     |     +-----------------------------------------------+   v
     +---> | Bit 7 | Bit 6 | Bit 5 | ... | Bit 1 | Bit 0 | --> CF
           +-----------------------------------------------+
```

#### Örnek: 4-Bit Nipel Takası (Nibble Swap)
Bir bayt içindeki yüksek ve alçak nipelleri takas etmek için `ROL` veya `ROR` 4 kez döndürülür:

```asm
MOV AL, 0F0H    ; AL = 1111 0000b
MOV CL, 4
ROL AL, CL      ; AL = 0000 1111b (0FH)
```

---

## 6.6 Çok Kelimeli (Multi-Word / 32-bit / 48-bit) Verilerde Bit Kaydırma ve Döndürme Algoritmaları

Tek bir yazmacın genişliğini aşan (32-bit, 48-bit, 64-bit) çok kelimeli verilerin sola veya sağa kaydırılmasında `SHL`/`SHR` ile `RCL`/`RCR` komutları zincirleme olarak birlikte kullanılır.

### Çok Kelimeli Sola Kaydırma Zinciri (Multi-Word Left Shift)

Kural:
1. En düşük anlamlı kelime **`SHL`** ile kaydırılır (en sağdan `0` girer, taşan MSB biti CF'ye çıkar).
2. Sonraki tüm yüksek anlamlı kelimeler sırasıyla **`RCL`** ile kaydırılır (önceki kelimeden CF'ye çıkan bit yeni kelimenin LSB'sine girer; kendi MSB'si ise CF'ye çıkarak bir sonraki kelimeye aktarılır).

#### Week 5 Slide 38 İncelemesi: 48-Bitlik Sayıyı 1 Basamak Sola Kaydırma
DX, BX ve AX yazmaçlarına yayılmış 48-bitlik bir veriyi (`DX:BX:AX`) ele alalım:

```asm
; Başlangıç Değerleri:
; DX:BX:AX = 0001H : 8000H : 0001H
; İkili: 0000 0000 0000 0001 : 1000 0000 0000 0000 : 0000 0000 0000 0001

SHL AX, 1       ; AX sola 1 kayar. LSB=0 girer. AX'in MSB'si (0) CF'ye çıkar.
                ; AX yeni değeri = 0002H, CF = 0

RCL BX, 1       ; CF (0) BX'in LSB'sine girer. BX'in MSB'si (1) CF'ye çıkar!
                ; BX yeni değeri = 0000H, CF = 1

RCL DX, 1       ; CF (1) DX'in LSB'sine girer. DX'in MSB'si (0) CF'ye çıkar.
                ; DX yeni değeri = 0003H, CF = 0

; Sonuç:
; DX:BX:AX = 0003H : 0000H : 0002H
```

Matematiksel Sağlama:
- Başlangıç: $1 \times 2^{32} + 2^{31} + 1 = 4,294,967,296 + 2,147,483,648 + 1 = 6,442,450,945$
- Çarpı 2: $6,442,450,945 \times 2 = 12,884,901,890$
- Bitiş: $3 \times 2^{32} + 0 + 2 = 12,884,901,888 + 2 = 12,884,901,890$
Sonuç tam iki katına çıkmış ve 48-bitlik blok kusursuzca ötelenmiştir.

### Çok Kelimeli Sağa Kaydırma Zinciri (Multi-Word Right Shift)

Sağa kaydırma işleminde yön tersinedir:
1. En yüksek anlamlı kelime **`SHR`** (işaretsiz bölme) veya **`SAR`** (işaretli bölme) ile kaydırılır; LSB'si CF'ye çıkar.
2. Düşük anlamlı kelimelere doğru sırasıyla **`RCR`** uygulanarak CF'deki bit bir alttaki kelimenin MSB'sine aktarılır.

```asm
; 32-Bit İşaretsiz Sayıyı Sağa 1 Kaydırma (DX:AX / 2)
SHR DX, 1       ; DX sağa kayar, LSB biti CF'ye aktarılır
RCR AX, 1       ; CF'deki bit AX'in MSB'sine girer, AX'in LSB'si CF'ye çıkar
```

### Uygulamalı Dizi Örneği: Dizideki Tek ve Çift Sayıları Sayma
Aşağıdaki kod parçası, `MicroProcessor code examples week.pdf` (Sayfa 8)'deki çalışır örneğin 8086 gerçekleştirimidir:

```asm
ORG 100h

LEA SI, DIZI        ; 10 elemanlı word dizisi
MOV CX, 10          ; Eleman sayısı
XOR BX, BX          ; Tek sayı sayacı (odd count)
XOR DX, DX          ; Çift sayı sayacı (even count)

SAYMA_DONGUSU:
    LODSW           ; Sıradaki kelimeyi AX'e yükle (SI = SI + 2)
    SHR AX, 1       ; LSB bitini CF'ye kaydır
    JNC CIFT_SAYI   ; Eğer CF == 0 ise sayı çifttir, sıçra
    INC BX          ; CF == 1 ise tek sayıdır, BX'i artır
    JMP DEVAM

CIFT_SAYI:
    INC DX          ; Çift sayı sayacını artır

DEVAM:
    LOOP SAYMA_DONGUSU

; Sonuç: BX = Tek sayı adedi, DX = Çift sayı adedi
HLT

DIZI DW 8, 11, 43, 56, 507, 608, 0, 123, 17, 13
```

Bu örnek, `SHR AX, 1` komutunun tek çevrimde hem sayıyı 2'ye böldüğünü hem de LSB bitini $CF$ bayrağına aktararak $JNC$ ile doğrudan karar vermeyi sağladığını kanıtlamaktadır.
