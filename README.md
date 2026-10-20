# 8086 Web Assembly IDE & Simulator

Tamamen tarayıcıda çalışan, saf TypeScript ile geliştirilmiş, iki geçişli (two-pass) gerçek 8086 makine kodu üreten assembler ve 16-bit Intel 8086 Real Mode (DOS COM, ORG 100H, EMU8086/MASM sentaksı) CPU simülatörü. Backend bağımlılığı yoktur.

---

## 🚀 Özellikler

### 1. İki Geçişli (Two-Pass) Gerçek Makine Kodu Assembler
- **Gerçek Opcode & ModRM Üretimi:** Komutları yorumlayıcı olarak değil, gerçek Intel 8086 makine koduna dönüştürüp RAM'e yazar.
- **Sayı Formatları:** 
  - Hex: `100H`, `0FFH`, `0F0FH` (harfle başlayan hex sayılarda başa `0` zorunluluğu)
  - Binary: `101B`, `11001010B`
  - Ondalık: `123`, `-5`
  - Karakter Sabitleri: `'A'`, `'Merhaba$'`
- **Veri Direktifleri:**
  - `DB 5, 12, 8`
  - `DB 'Merhaba$'`
  - `DW 1234H, 5678H`
  - `DB 10 DUP(0)`, `DB 3 DUP(1, 2)`, `DB 5 DUP(?)`
- **Adresleme Modları (ModRM Standardı):**
  - `[BX+SI]`, `[BX+DI]`, `[BP+SI]`, `[BP+DI]`
  - `[SI]`, `[DI]`, `[BX]`
  - `[BP]` (8086 donanım kuralına uygun: `mod=01, disp8=0`)
  - `[BX+DI+4]`, `[BP+6]`, `[1000H]`, `[DIZI]`
  - BP tabanlı adreslemelerde varsayılan segment `SS`, diğerlerinde `DS`.
  - Segment override prefixleri (`CS:`, `DS:`, `ES:`, `SS:`).
- **Tip Belirteçleri:**
  - `BYTE PTR` / `WORD PTR`
  - Belirsiz durumlarda (örn. `MOV [BX], 5`) *"Operand size belirtilmedi"* hatası.
- **İleri Referans & Atlama Menzil Kontrolü:**
  - `LEA reg, label` -> 8D /r disp16
  - `JMP` -> E9 rel16
  - `Jcc` ve `LOOP` -> rel8 (-128 .. +127 sınır kontrolü ve menzil hatası bildirimi)

### 2. 16-bit Intel 8086 Real Mode CPU
- **1 MB RAM:** `new Uint8Array(1 << 20)`, fiziksel adres `((seg << 4) + off) & 0xFFFFF` (20-bit wrap-around).
- **COM Yükleme Ortamı:** `CS=DS=ES=SS=0700h`, `IP=0100h`, `SP=FFFEh`.
- **Yazmaçlar:**
  - 16-bit: `AX`, `BX`, `CX`, `DX`, `SI`, `DI`, `BP`, `SP`, `IP`, `CS`, `DS`, `ES`, `SS`
  - 8-bit alt yazmaçlar: `AL`, `AH`, `BL`, `BH`, `CL`, `CH`, `DL`, `DH`
- **Aritmetik ve Durum Bayrakları:** `CF`, `PF`, `AF`, `ZF`, `SF`, `TF`, `IF`, `DF`, `OF`.
  - `ADD` / `SUB` / `CMP` tüm bayrakları günceller.
  - `INC` / `DEC` **CF bayrağına dokunmaz**.
  - `LOOP` hiçbir bayrağı değiştirmez.
- **Komut Aşamaları:**
  - Aşama 1 (MVP): `MOV`, `LEA`, `ADD`, `SUB`, `INC`, `DEC`, `CMP`, `JMP`, `Jcc` (16 koşullu atlama), `LOOP`, `LOOPE`, `LOOPNE`, `NOP`, `HLT`
  - Aşama 2: `AND`, `OR`, `XOR`, `NOT`, `NEG`, `TEST`, `SHL/SAL`, `SHR`, `SAR`, `ROL`, `ROR`, `RCL`, `RCR`, `XCHG`
  - Aşama 3: `PUSH`, `POP`, `PUSHF`, `POPF`, `CALL`, `RET`, `RET imm16`, `MUL`, `DIV`, `IMUL`, `IDIV`
  - Aşama 4: `INT 20h` (Sonlandırma), `INT 21h` (`AH=02h` char yazma, `AH=09h` string yazma, `AH=4Ch` çıkış), `MOVSB`, `STOSB`, `LODSB`, `REP` prefixi

### 3. Görselleştirme Odaklı Web IDE Arayüzü
- **Koyu Tema:** Modern, göz yormayan karanlık tema.
- **Toolbar:** `Assemble`, `Step`, `Run`, `Pause`, `Step Back`, `Reset`, Hız Kaydırıcısı (1 Hz - 10000 Hz / Maksimum), CPU Durum Rozeti.
- **Gelişmiş Kod Editörü:**
  - Sözdizimi renklendirme (komutlar, yazmaçlar, direktifler, sayılar, etiketler, yorumlar)
  - Satır numaraları ve Breakpoint açma/kapatma (satır numarasına tıklama)
  - Çalışma sırasında IP'ye karşılık gelen aktif kaynak kod satırının yeşil neon ok ve parlak satır ışığı ile vurgulanması
  - Satır bazında hata gösterimi
- **Yazmaç Paneli:**
  - `AX`, `BX`, `CX`, `DX` için hem 16-bit değer hem de `AH` ve `AL` alt yazmaçları ayrı ayrı gösterilir.
  - Değişen yazmaçlar sarı renkle yanıp söner (`reg-flash`).
  - HEX / DEC / BIN format seçicisi.
- **Flag Rozetleri:** 1 olan bayraklar canlı neon mavi, 0 olanlar soluk gri; hover ile Türkçe açıklamalar.
- **16 Sütunlu Bellek Grid'i + ASCII Sütunu:**
  - Renk kodlaması:
    - 🟦 **Mavi:** Kod byte'ları
    - 🟩 **Yeşil:** Veri byte'ları (`DB`/`DW`)
    - 🟧 **Turuncu:** Son yazılan hücre
    - 🔵 **Açık Mavi:** Son okunan hücre
    - 🟥 **Kırmızı Çerçeve:** `IP` işaretçisinin gösterdiği byte
    - 🏷️ **Sarı Rozetler:** `SI→`, `DI→`, `BX→`, `BP→`, `SP→` göstergeleri
  - Hızlı atlama kısayolları (`CS:IP`, `CS:0100`, `DS:SI`, `ES:DI`, `DS:BX`, `SS:SP`).
- **Stack (Yığın) Görünümü:** `SS:SP` civarındaki word slotları ve tepe noktasında `◀ SP` işareti.
- **Listing Sekmesi:** Bellek adresi, makine kodu byte'ları ve kaynak satır yan yana; satıra tıklayınca doğrudan belleğe atlama.
- **Step Back (Geri Adım):** Yapılan her adımda register, flag ve değiştirilen bellek hücrelerinin diff'i saklanır; simülasyon geriye doğru yürütülebilir.

---

## 🧪 Kabul Testi (Proje Şartnamesi)

Aşağıdaki assembly kodu derlenip çalıştırıldığında `AL = 19h` (ondalık 25), `CX = 0` olmakta ve işlemci `HLT` durumunda durmaktadır:

```assembly
ORG 100H ; DOS COM dosyası başlangıç direktifi

START:
  LEA SI, DIZI    ; Dizinin offset adresini SI'ya yükle
  MOV CX, 3       ; Eleman sayısı
  MOV AL, 0       ; Toplamı tutacak yazmaç

TOPLA:
  ADD AL, [SI]    ; SI adresindeki elemanı ekle
  INC SI          ; Sonraki bayta geç
  LOOP TOPLA      ; CX sıfır olana kadar dön

  HLT             ; İşlemciyi durdur

DIZI DB 5, 12, 8  ; Veri dizisi
```

---

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- npm

### Adımlar

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirici Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızda açın: `http://localhost:5173`

3. **Birim Testlerini Çalıştırın (Vitest):**
   ```bash
   npm test
   ```

4. **Production Build:**
   ```bash
   npm run build
   ```

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlem |
|---|---|
| `F10` | Step (Tek Adım Çalıştır) |
| `F5` | Run / Pause (Çalıştır / Duraklat) |
| `Ctrl + Enter` | Assemble (Derle ve Belleğe Yükle) |
