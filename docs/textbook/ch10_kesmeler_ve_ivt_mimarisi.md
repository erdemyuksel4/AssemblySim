# BÖLÜM 10: Kesmeler, Kesme Vektör Tablosu (IVT) ve İstisna Mimarisi (Interrupts, IVT Architecture & Exceptions)

Mikroişlemcilerin normal program akışını yürütürken harici olaylara anında tepki verebilmesi, zaman uyumsuz (asenkron) çevre birimlerini yönetebilmesi ve çalışma zamanı hatalarını (sıfıra bölme gibi) güvenle yakalayabilmesi **Kesme (Interrupt)** ve **İstisna (Exception)** mimarisi sayesinde mümkündür. 

Polling (meşgul bekleme) yönteminin işlemci kaynaklarını boşa harcamasını engelleyen kesme mekanizması; donanım aygıtlarının ihtiyaç duyduklarında CPU'ya doğrudan sinyal göndermesini ve işletim sisteminin güvenli çekirdek hizmetleri sunmasını sağlar.

---

## 10.1 Kesme (Interrupt) ve İstisna (Exception) Tanımı, Donanım ve Yazılım Kesmelerinin Farkları

### Kesme (Interrupt) Nedir?
Kesme, işlemciye dışarıdan (harici donanım pinlerinden) veya içeriden (özel bir komutla) gönderilen ve o anda yürütülen programı geçici olarak durduran bir sinyaldir. İşlemci mevcut durumunu (FLAGS ve CS:IP) yığına kaydeder, ilgili olayı karşılamak üzere hazırlanmış özel bir alt programa—**Kesme Servis Rutini (ISR - Interrupt Service Routine)**—dallanır ve işlem bittiğinde kaldığı noktaya geri döner.

### İstisna (Exception) Nedir?
İstisnalar, işlemcinin komut yürütme döngüsü sırasında doğrudan komutun kendisinden kaynaklanan dahili senkron olaylardır:
1. **Hata (Fault):** Komut yürütülmeden önce tespit edilen ve düzeltilebilir durumlardır (örneğin sayfa hatası - page fault). Düzeltildikten sonra aynı komut yeniden denenir.
2. **Tuzak (Trap):** Komut yürütüldükten hemen sonra tetiklenen istisnalardır (örneğin tek adım - single step tuzak bayrağı `TF=1` veya `INT 3` kesme noktası). Dönüş adresi bir sonraki komuttur.
3. **İptal (Abort):** Donanım arızası veya kritik tutarsızlıklar nedeniyle programın kurtarılamaz şekilde sonlandırılmasıdır.

### Kesme Kaynaklarının Sınıflandırılması:
- **Harici Donanım Kesmeleri (Hardware Interrupts):** Çevre birimlerinin CPU'nun `INTR` veya `NMI` fiziksel pinlerini lojik 1 yapmasıyla oluşur (asenkron).
- **Yazılım Kesmeleri (Software Interrupts):** Programcının kodun içine açıkça yazdığı `INT n` (örneğin `INT 21h`, `INT 10h`) veya `INTO` komutları ile tetiklenir (senkron).

---

## 10.2 Kesme Vektör Tablosu (IVT - Interrupt Vector Table) Mimarisi

Intel 8086 mimarisinde toplam **256 vektör (256 kesme)** (`0` ile `255` arası) tanımlanmıştır. Her bir kesmenin servis rutinini (`ISR`) bellekte bulabilmek için Real Mode bellek alanının en başında özel bir tablo yer alır: **Kesme Vektör Tablosu (Interrupt Vector Table - IVT)**.

```
       +-------------------------------------------------------------+
       |               KESME VEKTÖR TABLOSU (IVT) HARİTASI          |
       +-------------------------------------------------------------+
       Fiziksel Adres    Vektör No     İçerik (4 Bayt Far Pointer)
       -------------------------------------------------------------
       003FFh          |             | Tip 255 ISR Segment (High)
       003FEh          | Tip 255     | Tip 255 ISR Segment (Low)
       003FDh          | (Kullanıcı) | Tip 255 ISR Offset  (High)
       003FCh          |             | Tip 255 ISR Offset  (Low)
       ...             | ...         | ...
       00023h          |             | Tip 8 ISR Segment (Timer)
       ...             | ...         | ...
       00013h          |             | Tip 4 ISR Segment (INTO)
       ...             | Tip 4-0     | ...
       00003h          |             | Tip 0 ISR Segment (High)
       00002h          | Tip 0       | Tip 0 ISR Segment (Low)
       00001h          | (Sıfıra     | Tip 0 ISR Offset  (High)
       00000h          |  Bölme)     | Tip 0 ISR Offset  (Low)
       +-------------------------------------------------------------+
```

### IVT Bellek Alanı ve Vektör Hesaplama Formülü
- **Konum:** Belleğin en alt adresi olan `00000h` ile `003FFh` arasındadır (tam 1024 bayt = 1 KB).
- **Vektör Yapısı:** Her vektör, ilgili ISR'nin 32-bitlik uzak adresini (`far pointer: CS:IP`) saklar:
  - 2 Bayt: `Offset` (Düşük anlamlı bayt önce - Little-Endian)
  - 2 Bayt: `Segment` (Düşük anlamlı bayt önce)
  - Her vektör tam 4 bayt yer kaplar.

Herhangi bir $N$ kesme tipi (Type $N$) için IVT başlangıç fiziksel adres formülü:
$$IVT Adresi = Tip * 4\n\text{IVT Adresi} = \text{Tip} \times 4$$

Örneğin Tip 8 kesmesinin IVT adresi: $8 \times 4 = 32 = 00020h$'dir. Bu adresteki 4 bayt sırasıyla:
- `00020h`: IP Düşük Bayt
- `00021h`: IP Yüksek Bayt
- `00022h`: CS Düşük Bayt
- `00023h`: CS Yüksek Bayt

---

## 10.3 Intel Tarafından Rezerve Edilmiş Özel Kesmeler (Tip 0 – Tip 4)

Intel, 8086 mimarisinde ilk 5 kesme tipini (Tip 0'dan Tip 4'e kadar) işlemcinin dahili mimari denetimleri ve temel istisnaları için rezerve etmiştir:

| Kesme Tipi | Vektör Adresi (IVT) | Tetiklenme Kaynağı | Açıklama ve Kullanım Amacı |
| :---: | :---: | :--- | :--- |
| **Type 0 (Tip 0)** | `00000h` | Donanımsal / Dahili | **Divide by Zero (Sıfıra Bölme Hatası):** `DIV` veya `IDIV` komutunda bölen sıfır olduğunda veya bölüm hedef yazmaca sığmadığında (Quotient Overflow) otomatik tetiklenir. |
| **Type 1 (Tip 1)** | `00004h` | Dahili Tuzak (Trap) | **Single Step (Tek Adım Hata Ayıklama):** `FLAGS` yazmacındaki Tuzak Bayrağı (`TF = 1`) yapıldığında, işlemci her komutu yürüttükten sonra otomatik olarak bu kesmeyi çağırarak hata ayıklayıcılara (debugger) kontrol verir. |
| **Type 2 (Tip 2)** | `00008h` | Harici Donanım Pini | **NMI (Non-Maskable Interrupt):** Maskelenemez Donanım Kesmesi. Kritik güç kesintileri, RAM parite hataları ve ölümcül sistem arızalarında işlemcinin `NMI` pinine gelen kenar tetiklemeli sinyalle devreye girer. `IF` bayrağı ile engellenemez. |
| **Type 3 (Tip 3)** | `0000Ch` | Özel 1-Baytlık Komut | **Breakpoint (Kesme Noktası):** Hata ayıklayıcıların program kodunun içine geçici olarak yerleştirdiği özel 1-baytlık `INT 3` (`0xCC` opcode) komutudur. Tek baytlık olması sayesinde herhangi bir komutun ilk baytının yerine atomik olarak yazılabilir. |
| **Type 4 (Tip 4)** | `00010h` | Koşullu Yazılım Komutu| **Overflow Trap (INTO Komutu):** Aritmetik işlemlerde işaretli taşma meydana geldiğinde (`OF = 1`), hemen ardından `INTO` (Interrupt on Overflow) komutu çalıştırılırsa bu kesme tetiklenir. `OF = 0` ise hiçbir şey yapmaz. |

---

## 10.4 Donanım Kesmeleri: Maskelenebilir (INTR) vs. Maskelenemez (NMI)

8086 mikroişlemcisinde iki adet fiziksel kesme pini bulunur:

### 1. Maskelenebilir Kesmeler (INTR - Interrupt Request)
İşlemcinin `INTR` pini lojik 1 yapıldığında işlemci harici bir kesme talebi alır. Ancak işlemcinin bu kesmeyi kabul edip etmeyeceği `FLAGS` yazmacındaki **Kesme Bayrağı (Interrupt Flag - IF)** tarafından denetlenir:
- `STI` (Set Interrupt Flag): $IF \leftarrow 1$ yapar. Maskelenebilir kesmeler kabul edilir.
- `CLI` (Clear Interrupt Flag): $IF \leftarrow 0$ yapar. Maskelenebilir kesmeler (`INTR`) tamamen devre dışı bırakılır (maskelenir).
- Kritik zamanlı kod bloklarında (örneğin yığın işaretçisi değiştirilirken veya donanım portlarına atomik veri yazılırken) kesmeler `CLI` ile kapatılır ve işlem bitince `STI` ile açılır.

### 2. Maskelenemez Kesmeler (NMI - Non-Maskable Interrupt)
- Pozitif kenar tetiklemelidir (0'dan 1'e geçişte tetiklenir).
- `IF` bayrağının durumundan (`CLI` veya `STI`) kesinlikle etkilenmez; işlemci çalışır durumda olduğu sürece daima kabul edilir.
- Yalnızca sistemin donanımsal varlığını tehdit eden kritik arızalarda (bellek parite hatası, elektrik voltaj düşmesi) kullanılır.

---

## 10.5 8086 Kesme Yanıt ve Yürütme Sırası: Adım Adım Donanım Algoritması

Bir kesme sinyali (veya `INT n` komutu) geldiğinde 8086 CPU aşağıdaki donanımsal adımları kesin bir sıra ile otomatik olarak yürütür:

```
+-----------------------------------------------------------------------------------------+
|                  8086 KESME YÜRÜTME DÖNGÜSÜ (HARDWARE INTERRUPT SEQUENCE)               |
+-----------------------------------------------------------------------------------------+

  1. Mevcut Komutun Bitişi:
     İşlemci o anda yürütmekte olduğu komutu tamamlar (HLT hariç).
     
  2. Bayrakların Saklanması:
     SP <-- SP - 2
     Memory[SS:SP] <-- FLAGS (16-bitlik durum ve kontrol bayrakları yığına itilir)
     
  3. Kesme ve Tuzak Bayraklarının Kapatılması:
     IF <-- 0 (Yeni bir INTR kesmesinin araya girmesi engellenir)
     TF <-- 0 (Single step modu kapatılır)
     
  4. Geri Dönüş Kod Adresinin Saklanması:
     SP <-- SP - 2
     Memory[SS:SP] <-- CS (Mevcut Kod Segmenti yığına itilir)
     SP <-- SP - 2
     Memory[SS:SP] <-- IP (Sıradaki komutun ofseti yığına itilir)
     
  5. Vektör Adresinin Alınması ve ISR'ye Atlama:
     Donanım kesmesinde INTA# döngüsüyle veri yolundan Tip N numarası okunur;
     yazılım kesmesinde komutun içindeki n sayısı alınır.
     Vektör_Adresi = N * 4
     IP <-- Memory[00000h + N*4]      (Yeni IP çekilir)
     CS <-- Memory[00000h + N*4 + 2]  (Yeni CS çekilir)
     
  6. ISR Kodunun Yürütülmesi
     
  7. IRET (Interrupt Return) Komutu ile Dönüş:
     IP    <-- Memory[SS:SP]; SP <-- SP + 2
     CS    <-- Memory[SS:SP]; SP <-- SP + 2
     FLAGS <-- Memory[SS:SP]; SP <-- SP + 2 (Eski bayraklar ve IF aynen geri yüklenir)
```

> **IRET vs RET Farkı:** Standart bir `RET` komutu yığından yalnızca `IP` (veya `CS:IP`) değerini çeker. Oysa kesme anında yığına ek olarak `FLAGS` yazmacı da atılmıştır. Bu nedenle bir kesme servis rutini zorunlu olarak `IRET` komutuyla bitmelidir; `IRET` yığından sırasıyla `IP`, `CS` ve `FLAGS` yazmaçlarını çekerek işlemcinin kesme öncesindeki tüm durumunu eksiksiz restore eder.

---

## 10.6 Kesme Servis Rutinleri (ISR) Tasarım İlkeleri ve Bağlam Saklama

Kesme servis rutinleri tasarlanırken şu ilkelere titizlikle uyulmalıdır:
1. **Bağlam Saklama (Context Saving):** ISR içinde değiştirilecek olan tüm genel amaçlı yazmaçlar (`AX, BX, CX, DX, SI, DI, DS, ES`) rutinin en başında yığına `PUSH` edilmeli; `IRET`'ten hemen önce ters sırada `POP` edilmelidir.
2. **Kısa ve Hızlı Yürütme:** ISR içinde uzun döngülerden, ağır matematiksel işlemlerden ve bloke edici G/Ç işlemlerinden kaçınılmalıdır.
3. **Yeniden Giriş ve Yuvalanmış Kesmeler:** Eğer yüksek öncelikli bir kesmenin mevcut ISR'yi kesmesine izin verilecekse, bağlam saklandıktan hemen sonra `STI` komutu ile kesmeler yeniden açılabilir.

```assembly
; Standart ve Güvenli Bir ISR Şablonu
my_custom_isr PROC
    ; --- Bağlam Saklama (Context Saving) ---
    PUSH AX
    PUSH BX
    PUSH CX
    PUSH DX
    PUSH DS
    
    ; Veri Segmentini Ayarla
    MOV  AX, @DATA
    MOV  DS, AX
    
    ; --- Kesme İşlemi Gövdesi ---
    ; (Donanımdan veri oku veya bayrakları güncelle)
    
    ; PIC'e Kesme Sonu (EOI) Bildirimi Gönder
    MOV  AL, 20h
    OUT  20h, AL
    
    ; --- Bağlam Geri Yükleme ---
    POP  DS
    POP  DX
    POP  CX
    POP  BX
    POP  AX
    
    ; Kesmeden Dönüş
    IRET
my_custom_isr ENDP
```

---

## 10.7 Intel 8259A Programlanabilir Kesme Denetleyicisi (PIC)

8086 mikroişlemcisinin yalnızca tek bir `INTR` pini olmasına karşın, bir bilgisayar sisteminde klavye, disk, fare, seri portlar ve sistem saati gibi çok sayıda çevre birimi kesme üretir. Bu çoklu kesme kaynaklarını yönetmek ve önceliklendirmek için **Intel 8259A PIC (Programmable Interrupt Controller)** kullanılır.

```
       +-----------------------+
 IRQ0 -| Timer (8253 PIT)      |
 IRQ1 -| Klavye (Keyboard)     |
 IRQ2 -| İkinci 8259A (Slave)  |          8086 CPU
 IRQ3 -| COM2 Seri Port        |       +------------+
 IRQ4 -| COM1 Seri Port        |------>| INTR       |
 IRQ5 -| LPT2 / Ses Kartı      |       |            |
 IRQ6 -| Disket Sürücü         |<------| INTA#      |
 IRQ7 -| LPT1 Yazıcı Portu     |       +------------+
       |                       |<=====> D0 - D7 (Vektör No)
       | Intel 8259A Master PIC|
       +-----------------------+
```

### 8259A Çalışma Mekanizması:
1. Bir cihaz `IRQ` hattını aktif eder.
2. 8259A Kesme İstek Yazmacına (`IRR - Interrupt Request Register`) bu talebi kaydeder ve Kesme Maske Yazmacı (`IMR - Interrupt Mask Register`) ile maskeli olup olmadığını kontrol eder.
3. Maskeli değilse ve önceliği yüksekse, CPU'nun `INTR` pinini lojik 1 yapar.
4. CPU iki adet $\overline{\text{INTA}}$ (Interrupt Acknowledge) darbesi üretir. İkinci darbede 8259A, sistem veri veriyoluna kesmenin tip numarasını (örneğin IRQ0 için `08h`, IRQ1 için `09h`) bayt olarak sürer.
5. CPU bu numarayı alıp $N \times 4$ formülü ile IVT'den ilgili ISR adresini çeker.
6. **EOI (End of Interrupt) Komutu:** ISR işlemi bittiğinde, 8259A'nın Hizmet İçi Yazmacındaki (`ISR - In-Service Register`) ilgili biti temizlemek için PIC'e EOI komutu (`AL = 20h` -> `OUT 20h, AL`) yazılmalıdır; aksi halde 8259A daha düşük öncelikli kesmeleri sonsuza dek bloke eder.

---

## 10.8 Standart BIOS ve DOS Kesmeleri

PC mimarisinde donanımı doğrudan programlamak yerine BIOS ROM ve DOS işletim sistemi tarafından sunulan standart kesme servisleri kullanılır:

### 1. BIOS INT 10h — Video Hizmetleri
- `AH = 0Eh`: Teletype Karakter Yazma (`AL` = Karakter ASCII kodu, ekrana yazar ve imleci ilerletir).
- `AH = 00h`: Video Modu Seçimi (`AL` = Mod numarası; örn: `03h` 80x25 renkli metin, `13h` 320x200 256 renk VGA).
- `AH = 02h`: İmleç Konumlandırma (`DH` = Satır, `DL` = Sütun, `BH` = Sayfa).

```assembly
; Ekrana 'A' Karakteri Yazdırma Örneği (BIOS INT 10h)
MOV AH, 0Eh       ; Teletype fonksiyonu
MOV AL, 'A'       ; Basılacak karakter (41h)
INT 10h           ; Video kesmesini çağır
```

### 2. BIOS INT 16h — Klavye Hizmetleri
- `AH = 00h`: Klavyeden Tuş Bekleme ve Okuma (`AL` = ASCII kodu, `AH` = Donanım Tarama Kodu / Scan Code döner).
- `AH = 01h`: Tuş Tamponu Durum Kontrolü (`ZF = 1` ise tuş yok, `ZF = 0` ise tuş hazır).

### 3. DOS INT 21h — Sistem Çağrıları (API)
- `AH = 09h`: Ekrana '$' ile Biten Dizi Yazdırma (`DS:DX` dizinin başlangıç adresini gösterir).
- `AH = 01h`: Klavyeden Karakter Okuma (Ekrana yansıtmalı / Echoed).
- `AH = 4Ch`: Programı Sonlandırma ve DOS'a Dönüş (`AL` = Çıkış hata kodu).

```assembly
; DOS INT 21h ile "Merhaba" Yazdırma ve Çıkış
ORG 100h
MOV DX, OFFSET mesaj
MOV AH, 09h       ; Dizi yazdırma fonksiyonu
INT 21h

MOV AX, 4C00h     ; AH=4Ch (Çıkış), AL=00h (Hatasız)
INT 21h

mesaj DB 'Merhaba Dunya!', 0Dh, 0Ah, '$'
```
