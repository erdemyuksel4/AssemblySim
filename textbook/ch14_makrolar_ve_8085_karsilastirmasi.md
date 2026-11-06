# BÖLÜM 14: Assembly Dili Makroları ve Intel 8085 vs. 8086 Karşılaştırması (Assembly Macros & Intel 8085 vs. 8086 Comparison)

Assembly dilinde kod tekrarını önlemek, okunabilirliği artırmak ve yüksek performanslı algoritmalar geliştirmek için iki temel modüler yapı kullanılır: **Prosedürler (Alt Yordamlar - CALL/RET)** ve **Makrolar (MACRO / ENDM)**. Bu iki yöntemin donanımsal ve çalışma zamanı etkileri birbirinden taban tabana zıttır.

Ayrıca 16-bitlik 8086 mimarisinin evrimini, adresleme mantığını ve donanım yeteneklerini derinlemesine kavramak için, kendisinden hemen önceki 8-bitlik öncülü olan efsanevi **Intel 8085** mikroişlemcisinin mimarisi ve komut yapısıyla karşılaştırılması akademik olarak büyük bir önem taşır.

---

## 14.1 Assembly Dilinde Makro (MACRO) Kavramı ve Sözdizimi

Makro (Macro), derleyici (Assembler) seviyesinde çalışan bir ön işlemci mekanizmasıdır. Bir komut dizisine tek bir isim verilerek tanımlanır; kaynak kodda bu makro ismi her çağrıldığında, derleyici makro isminin yerine makronun içerdiği tüm komutları satır içine birebir kopyalar. Bu işleme **Makro Genişlemesi (Macro Expansion / Satır İçi Genişleme)** denir.

Makrolar derleme zamanında (Assembly Time) işlenir; çalışma zamanında (Runtime) "makro çağırma" diye bir işlemci adımı yoktur.

```assembly
; Basit Bir Makro Tanımlama Şablonu
KARE_AL MACRO sayi
    MOV AX, sayi
    MUL AX
ENDM

; Kaynak Kodda Kullanımı:
KARE_AL 5
KARE_AL BX
```

Derleyici kaynak kodu tararken `KARE_AL 5` gördüğü yere doğrudan `MOV AX, 5` ve `MUL AX` makine kodlarını yerleştirir.

---

## 14.2 Makrolar ile Prosedürlerin (CALL / RET) Karşılaştırmalı Analizi

Makrolar ile Prosedürler (Subroutines) arasındaki seçim, yazılım mühendisliğinde klasik bir **Zaman vs. Bellek (Time vs. Space)** takasıdır:

```
+-----------------------------------------------------------------------------------------+
|                  MAKRO (MACRO) vs. PROSEDÜR (CALL/RET) KARŞILAŞTIRMASI                  |
+---------------------------+------------------------------+------------------------------+
| Özellik                   | Makrolar (MACRO / ENDM)      | Prosedürler (CALL / RET)     |
+---------------------------+------------------------------+------------------------------+
| İşleme Zamanı             | Derleme Zamanı (Assembly Time| Çalışma Zamanı (Runtime)     |
| Kod Boyutu (Code Size)    | Büyür (Her çağrıda kod kopyal| Küçüktür (Bellekte tek kopya)|
| Çalışma Hızı (Speed)      | Çok Hızlı (0 çağrı ek yükü)  | Daha Yavaş (CALL/RET ek yükü)|
| Yığın Kullanımı (Stack)   | Sıfır (Yığın kullanılmaz)    | Var (Dönüş adresi yığına PUSH|
| Parametre Aktarımı        | Metin yerine koyma (Textual) | Yazmaçlar veya Yığın (Stack) |
| Özyineleme (Recursion)    | Desteklenmez                 | Tam Desteklenir              |
| İdeal Kullanım Alanı      | 2-4 komutluk kısa işlemler,  | Uzun, karmaşık, sık yinelenen|
|                           | kritik hız gerektiren yerler | büyük algoritmik bloklar     |
+---------------------------+------------------------------+------------------------------+
```

- **Prosedürün Bedeli:** Bir `CALL` komutu yürütülürken dönüş adresi yığına itilir ($SP \leftarrow SP - 2$), hedef adrese atlanır, prosedür sonunda `RET` komutu yığından adresi çeker ($SP \leftarrow SP + 2$). Bu işlem en az 20-30 saat çevrimi ek yük (overhead) ve boru hattında dallanma cezası yaratır.
- **Makronun Bedeli:** Makroda hiçbir çağrı ve dönüş gecikmesi yoktur; kod dümdüz akar. Ancak 20 komutluk bir makro kod içinde 50 kez çağrılırsa programın bellek boyutu 1000 komut büyür (Code Bloat).

---

## 14.3 Parametreli ve Koşullu Makro Yapıları (IF, IFDEF, REPT)

Makrolar değişken argümanlar alabilir ve derleyici direktifleri ile koşullu derleme (Conditional Assembly) yapabilir:

```assembly
; Koşullu Makro (Conditional Macro) Örneği
TOPLA MACRO Hedef, Deger
    IF Deger EQ 1
        INC Hedef          ; Eğer eklenecek sayı 1 ise daha kısa ve hızlı olan INC kullan
    ELSE
        ADD Hedef, Deger   ; Değilse normal ADD komutunu üret
    ENDIF
ENDM

; IFDEF / IFNDEF Kullanımı
HATA_YAZ MACRO mesaj
    IFDEF DEBUG_MODE       ; Eğer DEBUG_MODE sembolü tanımlıysa bu kodu üret
        MOV DX, OFFSET mesaj
        MOV AH, 09h
        INT 21h
    ENDIF
ENDM
```

---

## 14.4 Intel 8085 Mikroişlemcisi Mimarisi

1976 yılında piyasaya sürülen **Intel 8085**, popüler 8080 işlemcisinin geliştirilmiş sürümüdür. Tek bir +5V besleme gerilimi ile çalışan ilk başarılı mikroişlemcilerdendir:

- **ALU Genişliği:** 8-bitlik Aritmetik Mantık Birimine sahiptir. Tüm dahili işlemler bayt seviyesindedir.
- **Adres Veriyolu:** 16-bit genişliğindedir. Dolayısıyla adresleyebileceği azami bellek uzayı:
  $$\text{Bellek Uzayı} = 2^{16} = 65,536\text{ Bayt} = 64\text{ KB}$$
- **Çoklanmış (Multiplexed) Veriyolu (`AD0 – AD7`):** Pin sayısını 40 pinde tutmak için en düşük anlamlı 8 adres biti ile 8-bitlik veri veriyolu çoklanmıştır (`AD0–AD7`). Harici bir mandal (latch) entegresi (74LS373), `ALE` (Address Latch Enable) pini aktif olduğunda bu hatlardaki adres bilgisini yakalar.

---

## 14.5 Intel 8085 Programlama Modeli: Yazmaçlar ve Bellek İşaretçisi

Intel 8085, yazılımcıya 7 adet 8-bitlik ve 2 adet 16-bitlik temel yazmaç sunar:

```
+-------------------------------------------------------------+
|               INTEL 8085 PROGRAMLAMA MODELİ                 |
+------------------------------+------------------------------+
| Akümülatör (A) [8-Bit]       | Bayrak Yazmacı (FLAGS) [8-Bit|
+------------------------------+------------------------------+
| B Yazmacı [8-Bit]            | C Yazmacı [8-Bit]            | -> BC Çifti (16-bit)
| D Yazmacı [8-Bit]            | E Yazmacı [8-Bit]            | -> DE Çifti (16-bit)
| H Yazmacı [8-Bit]            | L Yazmacı [8-Bit]            | -> HL Çifti (M Bellek İşaretçisi)
+------------------------------+------------------------------+
| Yığın İşaretçisi (SP - Stack Pointer) [16-Bit]              |
| Program Sayacı (PC - Program Counter) [16-Bit]              |
+-------------------------------------------------------------+
```

1. **Akümülatör (A):** Tüm aritmetik ve mantıksal işlemlerin birincil işleneni ve sonucun yazıldığı ana yazmaçtır.
2. **Genel Amaçlı Yazmaçlar (`B, C, D, E, H, L`):** Bağımsız 8-bitlik yazmaçlar olarak kullanılabildikleri gibi, 16-bitlik işlemler için 3 çift halinde eşleşebilirler: `BC`, `DE` ve `HL`.
3. **HL Bellek İşaretçisi (`M`):** 8085 komut kümesinde `M` işleneni, `HL` yazmaç çiftinin 16-bitlik adres olarak gösterdiği bellek konumunu (`Memory[HL]`) ifade eder.
4. **Program Counter (PC):** Yürütülecek bir sonraki komutun 16-bitlik adresini tutar.
5. **Stack Pointer (SP):** 64 KB'lık RAM içindeki LIFO yığın tepesini gösteren 16-bitlik yazmaçtır.
6. **FLAGS (Bayraklar):** 5 durum bayrağı vardır: `S` (Sign), `Z` (Zero), `AC` (Auxiliary Carry), `P` (Parity), `CY` (Carry).

---

## 14.6 Intel 8085 Komut Kümesi ve Adresleme Modları

8085 komutları 1, 2 veya 3 bayt uzunluğundadır:

### Temel 8085 Komutları:
- **Veri Transferi:**
  - `MOV r1, r2`: Yazmaçtan yazmaca kopyala (`MOV A, B`).
  - `MVI r, data8`: Yazmaca 8-bit anlık veri yükle (`MVI A, 35h`).
  - `LXI rp, data16`: 16-bitlik yazmaç çiftine anlık 16-bit adres yükle (`LXI H, 2000h` -> $HL = 2000h$).
  - `LDA addr16`: Doğrudan 16-bitlik bellek adresindeki baytı Akümülatöre oku (`LDA 2500h`).
  - `STA addr16`: Akümülatördeki baytı doğrudan 16-bitlik adrese sakla (`STA 2500h`).
  - `LHLD addr16` / `SHLD addr16`: HL çiftini bellekten doğrudan oku / belleğe sakla.
- **Aritmetik ve Mantık:**
  - `ADD r`: Akümülatöre yazmacı ekle ($A \leftarrow A + r$).
  - `SUB r`: Akümülatörden yazmacı çıkar ($A \leftarrow A - r$).
  - `INR r` / `DCR r`: 8-bit yazmacı 1 artır / 1 azalt.
  - `INX rp` / `DCX rp`: 16-bit yazmaç çiftini 1 artır / 1 azalt (`INX H`).
  - `DAD rp`: HL yazmaç çiftine belirtilen çifti 16-bit topla ($HL \leftarrow HL + rp$). 8085'in tek 16-bit toplama komutudur!
- **Akış Kontrolü:**
  - `JMP addr16`, `CALL addr16`, `RET`. Koşullu varyantlar: `JZ, JNZ, JC, JNC, JM, JP`.

> **Kritik Donanım Eksikliği:** Intel 8085 işlemcisinde **donanımsal Çarpma (MUL) ve Bölme (DIV) komutları YOKTUR!** Çarpma ve bölme işlemleri, yazılımcı tarafından yazılan ardışık toplama-kaydırma (Shift-and-Add) alt yordamları ile yazılımsal olarak çözülmek zorundaydı.

---

## 14.7 Intel 8085 Donanım Kesmeleri ve Öncelik Sıralaması

Intel 8085, harici aygıtlar için 5 adet dahili öncelikli kesme girişine sahiptir. Her kesme bellekte sabit bir vektör adresine doğrudan dallanır:

```
+-----------------------------------------------------------------------------------------+
|                  INTEL 8085 KESME ÖNCELİK VE VEKTÖR TABLOSU                             |
+-------------------+-----------------+-------------------+-------------------------------+
| Kesme Girişi      | Öncelik Sırası  | Sabit Vektör Adres| Maskelenebilirlik             |
+-------------------+-----------------+-------------------+-------------------------------+
| **TRAP**          | 1 (En Yüksek)   | 0024h             | Maskelenemez (NMI)            |
| **RST 7.5**       | 2               | 003Ch             | Maskelenebilir (Yükselen Kenar|
| **RST 6.5**       | 3               | 0034h             | Maskelenebilir (Yüksek Seviye)|
| **RST 5.5**       | 4               | 002Ch             | Maskelenebilir (Yüksek Seviye)|
| **INTR**          | 5 (En Düşük)    | Harici Donanım    | Maskelenebilir (Yüksek Seviye)|
+-------------------+-----------------+-------------------+-------------------------------+
```

1. **TRAP:** En yüksek öncelikli kesmedir. Asla maskelenemez (NMI dengi). Hem seviye hem kenar tetiklemelidir. Güç kesintisi gibi felaket durumlarında kullanılır.
2. **RST 7.5, RST 6.5, RST 5.5:** Dahili restart kesmeleridir. `SIM` (Set Interrupt Mask) komutuyla maskelenebilir, `RIM` (Read Interrupt Mask) ile durumları okunabilir.
3. **INTR:** En genel ve en düşük öncelikli kesmedir. Vektör adresi sabit değildir; harici donanım (örneğin 8259) veri yoluna bir `RST n` veya `CALL` komutu sürmelidir.

---

## 14.8 Kapsamlı Karşılaştırma: Intel 8085 vs. Intel 8086

Intel 8085'ten 8086'ya geçiş, mikroişlemci tarihinde basit bir frekans artışı değil; mimari bir kuantum sıçramasıdır.

### Intel 8085 ve 8086 Mimari Karşılaştırma Tablosu

| Mimari Parametre | Intel 8085 Mikroişlemcisi | Intel 8086 Mikroişlemcisi | Mimari Gelişme Analizi |
| :--- | :--- | :--- | :--- |
| **İşlemci Mimarisi (ALU)**| **8-bit** (Dahili veri yolları 8-bit)| **16-bit** (ALU ve genel yazmaçlar 16-bit)| İşlem gücü ve veri bant genişliği 2 katına çıktı. |
| **Adres Veriyolu Genişliği**| **16-bit** | **20-bit** | Adres hatları 4 bit genişletildi. |
| **Azami Bellek Kapasitesi**| **64 KB** ($2^{16}$ bayt) | **1 MB** ($2^{20} = 1,048,576$ bayt) | Bellek adresleme kapasitesi tam **16 katına** çıktı. |
| **Bellek Organizasyonu**   | Düz (Flat Memory Modeli, Tek Alan)| **Segmentli** (Segmented: 64 KB Segmentler)| Program, Veri, Yığın segmentleri bağımsız ayrıldı. |
| **Komut Ön Getirme Kuyruğu**| **YOK** (Tamamen ardışıl FDE döngüsü)| **VAR** (6-baytlık Prefetch FIFO Kuyruğu) | İlk komut boru hattı (pipelining) hayata geçti. |
| **Dahili Birim Ayrımı**    | Tek blok kontrol mantığı | **BIU (Veriyolu) ve EU (Yürütme) Ayrımı**| Komut getirme ile komut yürütme örtüştürüldü. |
| **Donanımsal Çarpma/Bölme**| **YOK** (Yazılımsal rutin zorunlu) | **VAR** (Donanımsal `MUL, IMUL, DIV, IDIV`)| Matematiksel işlem performansı 50-100 kat hızlandı. |
| **Dizi / String Komutları**| YOK (Tek tek döngüde bayt okunur) | **VAR** (`MOVS, LODS, STOS, CMPS, SCAS, REP`)| Yüksek hızlı bellek blok kopyalama getirildi. |
| **Tablo Çeviri Yeteneği**  | Elle dolaylı adresleme gerekir    | **VAR** (`XLAT / XLATB` komutu) | Kod dönüşümleri tek komuta indirildi. |
| **Saat Frekansı (İlk Sürüm)| $3\text{ MHz} - 5\text{ MHz}$ | $5\text{ MHz} - 10\text{ MHz}$ | Frekans tavanı artırıldı. |
| **G/Ç Port Kapasitesi**    | 256 Port (8-bit port adresi)      | 65536 Port (16-bit `DX` port adresi) | Port kapasitesi 256 kattan fazla büyüdü. |
| **Çalışma Modları**        | Tek Mod                           | Minimum Mod / Maximum Mod (8087 Coprocessor)| Çok işlemcili ve yardımcı işlemcili sistem desteği. |

Bu mimari devrim sayesinde Intel 8086, sonraki tüm x86 (80286, 80386, Pentium ve modern 64-bit Core i7/i9) işlemcilerinin doğrudan atası ve geriye dönük uyumluluk standardı haline gelmiştir.
