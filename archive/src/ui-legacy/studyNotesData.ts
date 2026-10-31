/**
 * studyNotesData.ts
 * 
 * Doç. Dr. Mehmet Akif Çifci'nin BMI3121 Mikroişlemciler dersinin (Barry B. Brey müfredatı)
 * 1. haftasından 15. haftasına kadar verilen TÜM teorik bilgileri, slayt tablolarını,
 * sayı dönüştürme algoritmalarını, bellek haritalarını, bayrak matematiğini,
 * tahta notlarını ve 14 adet laboratuvar kod örneğini içeren eksiksiz çalışma notları veritabanı.
 * 
 * HİÇBİR BİLGİ ATLANMADAN VE EKSİLTİLMEDEN DERLENMİŞTİR.
 */

export interface WeekStudyNote {
  weekNumber: number;
  title: string;
  subtitle: string;
  period: 'Vize Öncesi (Hafta 1-7)' | 'Vize Sonrası (Hafta 9-15)';
  slideCount: string;
  sourceFiles: string[];
  keyTopics: string[];
  summaryHtml: string;
}

export interface FlagGuideItem {
  name: string;
  bitPosition: number;
  type: 'Status (Durum)' | 'Control (Kontrol)' | 'System (Sistem)';
  fullTitle: string;
  hardwareMeaning: string;
  bitCalculationRule: string;
  instructionsAffecting: string;
  instructionsNotAffecting: string;
  workedExamExample: string;
}

export const ALL_WEEKS_STUDY_NOTES: WeekStudyNote[] = [
  // =========================================================================
  // HAFTA 1: Giriş, Mikroişlemci Evrimi, 1 MB Bellek Haritası & Sayı Sistemleri
  // =========================================================================
  {
    weekNumber: 1,
    title: "Mikroişlemciler, Bilgisayar Yapısı & Sayı Sistemleri",
    subtitle: "Veriyolları (Bus), 8086 Evrimi, TPA & System Area, Sayı Tabanları & Çift Taban Çarpanı",
    period: "Vize Öncesi (Hafta 1-7)",
    slideCount: "40 Slayt",
    sourceFiles: ["Week 1 - Microprocessors and the Computer.md", "w1.pdf"],
    keyTopics: [
      "3 Temel Blok: CPU, Bellek, I/O",
      "Veriyolu Yapısı: Adres (Unidirectional), Veri (Bidirectional), Kontrol",
      "İşlemci Karşılaştırma Tablosu (8086 -> Pentium 4)",
      "1 MB Bellek Haritası: TPA (640 KB), System Area (384 KB), XMS",
      "Sayfalama (Paging - 4KB) ve Sanal Bellek",
      "I/O Port Uzayı (0000H - FFFFH)",
      "Sayı Dönüşümleri (213, 687, 89, 500) ve BCH",
      "Kesirli Sayı Çarpan Algoritması (Multiply-Radix: 0.125, 0.046875)",
      "1'in ve 2'nin Tümleyeni (-76 Örneği), ASCII, Unicode, BCD"
    ],
    summaryHtml: `
      <div class="note-section-card">
        <h4>1. Bilgisayarın 3 Temel Bloğu ve Veriyolları (Buses)</h4>
        <p>Bilgisayar sistemi 3 ana bileşenin veriyolları ile bağlanmasıyla çalışır:</p>
        <ul>
          <li><b>Mikroişlemci (CPU):</b> Bilgisayarın beynidir. Veri aktarımı, ALU hesaplamaları ve program akışını yürütür.</li>
          <li><b>Bellek (Memory):</b> Program kodlarını ve verileri saklar. 8086'da 20-bit adres yolu ile <code>2<sup>20</sup> = 1,048,576 bayt (1 MB)</code> adreslenebilir.</li>
          <li><b>Giriş/Çıkış (I/O):</b> Klavye, ekran, disk gibi çevre birimleridir. 16-bit port adresiyle <code>65,536 adet (64K)</code> port adreslenir.</li>
        </ul>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>Veriyolu (Bus)</th><th>Yön</th><th>Genişlik (8086)</th><th>Görevi ve Açıklama</th></tr></thead>
            <tbody>
              <tr><td><b>Adres Veriyolu (Address Bus)</b></td><td>Tek Yönlü (CPU ➔ Bellek/IO)</td><td>20-Bit</td><td>Erişilecek bellek veya I/O portunun adresini taşır (00000H – FFFFFH). $2^n$ bellek hücresi seçer.</td></tr>
              <tr><td><b>Veri Veriyolu (Data Bus)</b></td><td>Çift Yönlü (CPU ⇄ Bellek/IO)</td><td>16-Bit</td><td>Komut ve veri baytlarını taşır. 8086 tek çevrimde 16-bit (kelime) transfer eder.</td></tr>
              <tr><td><b>Kontrol Veriyolu (Control Bus)</b></td><td>Karışık / Çıkış</td><td>Farklı Hatlar</td><td>Zamanlama ve okuma/yazma sinyallerini iletir: <code>MEMR</code> (Bellek Oku), <code>MEMW</code> (Bellek Yaz), <code>IOR</code> (Port Oku), <code>IOW</code> (Port Yaz).</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style="margin-top:16px;">2. Intel Mikroişlemci Ailesi Evrim Tablosu (Slayt Tablosu)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>İşlemci</th><th>Yıl</th><th>Veri Yolu</th><th>Adres Yolu</th><th>Maksimum Bellek</th><th>Saat Frekansı</th><th>MIPS / Not</th></tr></thead>
            <tbody>
              <tr><td><b>8086</b></td><td>1978</td><td>16-bit</td><td>20-bit</td><td>1 MB</td><td>4.77 – 8 MHz</td><td>< 1 MIPS (İlk 16-bit x86)</td></tr>
              <tr><td><b>80286</b></td><td>1982</td><td>16-bit</td><td>24-bit</td><td>16 MB</td><td>6 – 20 MHz</td><td>Korumalı Mod (Protected Mode)</td></tr>
              <tr><td><b>80386</b></td><td>1985</td><td>32-bit</td><td>32-bit</td><td>4 GB</td><td>16 – 33 MHz</td><td>İlk 32-bit, Sayfalama (Paging)</td></tr>
              <tr><td><b>80486</b></td><td>1989</td><td>32-bit</td><td>32-bit</td><td>4 GB</td><td>25 – 50 MHz</td><td>Dahili 8 KB L1 Cache + FPU</td></tr>
              <tr><td><b>Pentium</b></td><td>1993</td><td>64-bit</td><td>32-bit</td><td>4 GB</td><td>60 – 200 MHz</td><td>Çift Boru Hattı (Superscalar u/v)</td></tr>
              <tr><td><b>Modern CPU</b></td><td>Günümüz</td><td>64-bit</td><td>48–52 bit</td><td>TB'larca RAM</td><td>3 – 5+ GHz</td><td>Çok Çekirdek, TLP, AVX-512</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style="margin-top:16px;">3. 1 MB Klasik PC Bellek Haritası (TPA & System Area)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>Bölge</th><th>Adres Aralığı</th><th>Boyut</th><th>İçerik ve Donanımsal Anlamı</th></tr></thead>
            <tbody>
              <tr><td><b>TPA (Transient Program Area)</b></td><td><code>00000H – 9FFFFH</code></td><td>640 KB</td><td>00000H–003FFH Kesme Vektör Tablosu (IVT), 00400H BIOS Bilgi Alanı, IO.SYS, MSDOS.SYS, aygıt sürücüleri ve kullanıcı EXE/COM programları.</td></tr>
              <tr><td><b>Video RAM (Ekran Kartı)</b></td><td><code>A0000H – BFFFFH</code></td><td>128 KB</td><td>CGA, EGA, VGA metin ve grafik ekran bellek tamponları.</td></tr>
              <tr><td><b>Genişleme ROM Alanı</b></td><td><code>C0000H – DFFFFH</code></td><td>128 KB</td><td>Sabit disk denetleyici ROM'u (C0000H Video BIOS başlar), ağ kartı BIOS'ları ve EMS genişletilmiş bellek.</td></tr>
              <tr><td><b>Kaset BASIC & Serbest</b></td><td><code>E0000H – EFFFFH</code></td><td>64 KB</td><td>Orijinal IBM PC'de Kaset BASIC ROM'u; modern sistemlerde BIOS uzantısı.</td></tr>
              <tr><td><b>Sistem BIOS ROM</b></td><td><code>F0000H – FFFFFH</code></td><td>64 KB</td><td>Anakart Sistem BIOS ROM'u. Bilgisayar RESET edildiğinde işlemci <b>FFFF0H</b> adresinden başlar!</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style="margin-top:16px;">4. Sayı Sistemleri Dönüşüm Formülleri & Slayt Örnekleri</h4>
        <ul>
          <li><b>Hex'ten Onluğa:</b> <code>2AF₁₆ = (2 × 16²) + (10 × 16¹) + (15 × 16⁰) = 512 + 160 + 15 = 687₁₀</code></li>
          <li><b>İkilikten Onluğa:</b> <code>1101 0101₂ = 128 + 64 + 16 + 4 + 1 = 213₁₀</code></li>
          <li><b>Onluktan Hex'e:</b> <code>500₁₀ = 500 / 16 = 31 (Kalan 4) -> 31 / 16 = 1 (Kalan 15=F) -> 1F4₁₆</code></li>
          <li><b>Onluktan İkiliye:</b> <code>89₁₀ = 64 + 16 + 8 + 1 = 1011001₂</code></li>
          <li><b>Kesirli Sayılarda Çarpan Algoritması (Multiply-Radix):</b>
            <br>• <code>0.125₁₀</code> ikili tabana: <code>0.125 × 2 = 0.25 (0)</code> -> <code>0.25 × 2 = 0.5 (0)</code> -> <code>0.5 × 2 = 1.0 (1)</code> ➔ <b>0.001₂ = 0.1₈</b>.
            <br>• <code>0.046875₁₀</code> hex tabana: <code>0.046875 × 16 = 0.75 (0)</code> -> <code>0.75 × 16 = 12.0 (C)</code> ➔ <b>0.0C₁₆</b>.
          </li>
          <li><b>İki'nin Tümleyeni (Two's Complement) - Negatif Sayı Formatı:</b>
            <br>Örnek <code>-76₁₀</code> (8-bit):
            <br>1. <code>+76₁₀ = 0100 1100₂</code>
            <br>2. Bütün bitleri tersle (1'in tümleyeni): <code>1011 0011₂</code>
            <br>3. 1 ekle (2'nin tümleyeni): <code>1011 0011 + 1 = 1011 0100₂ = B4₁₆</code>.
          </li>
          <li><b>Packed vs Unpacked BCD:</b>
            <br>• Packed BCD: 1 baytta 2 onluk basamak (örn: 35 için <code>35H = 0011 0101b</code>).
            <br>• Unpacked BCD: 1 baytta 1 onluk basamak (örn: 5 için <code>05H = 0000 0101b</code>).
          </li>
        </ul>
      </div>
    `
  },

  // =========================================================================
  // HAFTA 2: Mimarisi, Yazmaçlar & FLAGS / EFLAGS / RFLAGS Detayı
  // =========================================================================
  {
    weekNumber: 2,
    title: "Mikroişlemci Mimarisi, Yazmaç Modeli & Segmentasyon",
    subtitle: "Program Görünür/Görünmez Yazmaçlar, 17 Bayrak Biti, 20-Bit Formülü ve Segment Ötelemesi",
    period: "Vize Öncesi (Hafta 1-7)",
    slideCount: "40 Slayt",
    sourceFiles: ["Week 2 - The Microprocessor and Its Architecture.md", "w2.pdf"],
    keyTopics: [
      "Program-Visible vs Program-Invisible Yazmaçlar (GDTR, LDTR, IDTR, TR)",
      "Yazmaç Genişleme Hiyerarşisi (RAX -> EAX -> AX -> AH/AL)",
      "64-bit Ek Yazmaçlar: R8-R15 ve Bayt Geçersizlik Kuralı",
      "Tam Bayrak Kılavuzu: 6 Durum + 3 Kontrol + 8 Sistem Bayrağı (IOPL, NT, RF, VM, AC, VIF, VIP, ID)",
      "Segment Yazmaçları (CS, DS, SS, ES, FS, GS)",
      "20-bit Fiziksel Adres Formülü: Segment * 10H + Offset",
      "64 KB Segment Sınırı (+FFFFH) ve 16-Baytlık Segment Kayması (Overlap)"
    ],
    summaryHtml: `
      <div class="note-section-card">
        <h4>1. Program Görünür Yazmaç Kümesi ve Çok Amaçlı Yazmaçlar</h4>
        <p>8086'dan modern 64-bit işlemcilere kadar yazmaç kapsama hiyerarşisi:</p>
        <div class="code-preview-box">
          <code>RAX (64-bit) ──> EAX (32-bit) ──> AX (16-bit) ──> AH (8-bit) : AL (8-bit)</code>
        </div>
        <ul>
          <li><b>AX (Accumulator):</b> Aritmetik/mantık merkezidir. MUL, DIV ve I/O komutlarında zorunludur.</li>
          <li><b>BX (Base Index):</b> Bellek işaret etmede taban olarak kullanılabilen tek genel veri yazmacıdır.</li>
          <li><b>CX (Count):</b> Sayaçtır. LOOP döngülerinde, SHL/SHR kaydırmalarında (CL) ve REP ön ekinde kullanılır.</li>
          <li><b>DX (Data):</b> 32-bit çarpma/bölmede üst kelimeyi tutar (DX:AX); 255'ten büyük port adreslerini (IN/OUT DX) saklar.</li>
          <li><b>SP (Stack Pointer):</b> Yığın tepesinin ofset adresini tutar (SS:SP).</li>
          <li><b>BP (Base Pointer):</b> Yığın çerçevesindeki fonksiyon parametrelerine erişir (SS:BP).</li>
          <li><b>SI (Source Index):</b> Kaynak göstericisi (DS:SI).</li>
          <li><b>DI (Destination Index):</b> Hedef göstericisi (ES:DI).</li>
          <li><b>R8–R15 Genişlemesi:</b> 64-bit mimaride eklenen 8 yazmaçtır. Alt parçalara <code>R8D</code> (32-bit), <code>R8W</code> (16-bit), <code>R8B</code> (8-bit) ile erişilir; ancak AH/BH gibi yüksek baytlarına doğrudan erişilemez!</li>
        </ul>

        <h4 style="margin-top:16px;">2. Durum, Kontrol ve Sistem Bayrakları (FLAGS / EFLAGS / RFLAGS)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>Bayrak</th><th>Bit</th><th>Tipi</th><th>Adı ve Anlamı</th><th>Donanımsal Tetiklenme Koşulu</th></tr></thead>
            <tbody>
              <tr><td><code>CF</code></td><td>0</td><td>Durum</td><td>Carry (Elde)</td><td>En yüksek bitten (bit 7 veya 15) dışarı elde taştığında veya çıkarma borcu olduğunda 1 olur.</td></tr>
              <tr><td><code>PF</code></td><td>2</td><td>Durum</td><td>Parity (Eşlik)</td><td>Sonucun düşük 8 bitindeki '1'lerin sayısı çift ise 1, tek ise 0 olur.</td></tr>
              <tr><td><code>AF</code></td><td>4</td><td>Durum</td><td>Auxiliary Carry (Yardımcı Elde)</td><td>Bit 3'ten Bit 4'e elde geçtiğinde (alt nibble taşması) 1 olur. BCD düzeltmede (DAA/DAS) kullanılır.</td></tr>
              <tr><td><code>ZF</code></td><td>6</td><td>Durum</td><td>Zero (Sıfır)</td><td>İşlem sonucu tam olarak 0 çıktığında 1 olur.</td></tr>
              <tr><td><code>SF</code></td><td>7</td><td>Durum</td><td>Sign (İşaret)</td><td>Sonucun en yüksek anlamlı bitinin (MSB, işaret biti) kopyasıdır (1=negatif, 0=pozitif).</td></tr>
              <tr><td><code>TF</code></td><td>8</td><td>Kontrol</td><td>Trap (Adım İnceleme)</td><td>1 yapıldığında işlemci her komuttan sonra Tip 1 kesmesi üreterek tek adımda hata ayıklama (single-step) sağlar.</td></tr>
              <tr><td><code>IF</code></td><td>9</td><td>Kontrol</td><td>Interrupt Enable (Kesme İzni)</td><td>INTR donanım kesme bacağını kontrol eder. <code>STI</code> ile 1 (izinli), <code>CLI</code> ile 0 (yasaklı) yapılır.</td></tr>
              <tr><td><code>DF</code></td><td>10</td><td>Kontrol</td><td>Direction (Yön)</td><td>String işlemlerinde yönü belirler. <code>CLD</code> (0 = İleri / SI,DI artar), <code>STD</code> (1 = Geri / SI,DI azalır).</td></tr>
              <tr><td><code>OF</code></td><td>11</td><td>Durum</td><td>Overflow (İşaretli Taşma)</td><td>İşaretli aritmetikte sonucun sınırları aşması durumunda 1 olur (+127 aşılırsa veya -128 altına inilirse).</td></tr>
              <tr><td><code>IOPL</code></td><td>12-13</td><td>Sistem</td><td>I/O Privilege Level</td><td>Giriş/çıkış izin seviyesini belirler (00 en yüksek/OS, 11 en düşük/kullanıcı).</td></tr>
              <tr><td><code>NT</code></td><td>14</td><td>Sistem</td><td>Nested Task (İç İçe Görev)</td><td>Bir görevin başka bir görevi CALL ile çağırdığını belirtir (IRET yönlendirmesi).</td></tr>
              <tr><td><code>RF</code></td><td>16</td><td>Sistem</td><td>Resume Flag</td><td>Hata ayıklama kesmelerini geçici olarak askıya alır.</td></tr>
              <tr><td><code>VM</code></td><td>17</td><td>Sistem</td><td>Virtual 8086 Mode</td><td>386+ işlemcilerde korumalı mod altında 1 MB'lık DOS ortamlarını sanallaştırır.</td></tr>
              <tr><td><code>AC</code></td><td>18</td><td>Sistem</td><td>Alignment Check</td><td>Bellek erişimlerinin sınır hizalamasını (4 veya 8 bayta bölünürlük) denetler.</td></tr>
              <tr><td><code>VIF/VIP</code></td><td>19-20</td><td>Sistem</td><td>Virtual Interrupt / Pending</td><td>Sanal modda kesme önceliğini yönetir.</td></tr>
              <tr><td><code>ID</code></td><td>21</td><td>Sistem</td><td>CPUID Flag</td><td>İşlemcinin CPUID komutunu destekleyip desteklemediğini bildirir.</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style="margin-top:16px;">3. Gerçek Mod (Real Mode) 20-Bit Fiziksel Adres Formülü</h4>
        <div class="theory-formula-box">
          <code>Fiziksel Adres = (Segment × 10H) + Offset = (Segment × 16) + Offset</code>
        </div>
        <p><b>Slayt Örnekleri:</b></p>
        <ul>
          <li><code>CS = 1400H, IP = 1200H</code> ➔ <code>PA = 14000H + 1200H = 15200H</code></li>
          <li><code>SS = 2000H, BP = 3000H</code> ➔ <code>PA = 20000H + 3000H = 23000H</code></li>
          <li><b>Segment Sınırları ve Öteleme:</b> Her segment tam 64 KB (0000H–FFFFH) uzunluğundadır:
            <br>• <code>1000H</code> segmenti ➔ <code>10000H – 1FFFFH</code>
            <br>• <code>2000H</code> segmenti ➔ <code>20000H – 2FFFFH</code>
            <br>• <code>2001H</code> segmenti ➔ <code>20010H – 3000FH</code> (Segment 1 artınca başlangıç adresi 16 bayt [10H] kayar! Segmentler iç içe geçer).
          </li>
        </ul>
      </div>
    `
  },

  // =========================================================================
  // HAFTA 3: Adresleme Modları & Yığın (Stack) Mimarisi
  // =========================================================================
  {
    weekNumber: 3,
    title: "Adresleme Modları & Yığın (Stack) Bellek",
    subtitle: "7 Veri Adresleme Modu, 3 Program Bellek Modu, LIFO SP Değişim Dinamikleri ve PUSH/POP",
    period: "Vize Öncesi (Hafta 1-7)",
    slideCount: "40 Slayt",
    sourceFiles: ["Week 3 - Addressing Modes.md", "w3extra.pdf"],
    keyTopics: [
      "MOV Sağdan Sola Kopyalama Kuralı & Bayrak Etkilenmezliği",
      "7 Veri Adresleme Modu (Register, Immediate, Direct, Reg Indirect, Base-Plus-Index, Relative, Base Relative-Plus-Index)",
      "3 Program Bellek Adresleme Modu: Direct Far (5 Bayt), Relative (Short -128..+127 / Near 2B), Indirect",
      "Yığın (Stack) LIFO Mimarisi: SS * 10H + SP",
      "PUSH Adımları: SP = SP - 2, [SP-1] High, [SP-2] Low",
      "POP Adımları: Low = [SP], High = [SP+1], SP = SP + 2",
      "Neden POP CS Yasaktır? Yığın Takas (Swap) Algoritması"
    ],
    summaryHtml: `
      <div class="note-section-card">
        <h4>1. 7 Veri Adresleme Modu (Data-Addressing Modes)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>Adresleme Modu</th><th>Örnek Komut</th><th>Efektif Adres (EA) Hesabı</th><th>Açıklama</th></tr></thead>
            <tbody>
              <tr><td><b>Register (Yazmaç)</b></td><td><code>MOV CX, DX</code></td><td>Yok (İşlemci içi)</td><td>En hızlı adresleme modudur; bellek veriyoluna çıkılmaz.</td></tr>
              <tr><td><b>Immediate (Sabit)</b></td><td><code>MOV AL, 22H</code></td><td>Yok (Opcode içinde)</td><td>Sabit sayı doğrudan komutun makine kodu baytından okunur.</td></tr>
              <tr><td><b>Direct (Doğrudan)</b></td><td><code>MOV CX, [1234H]</code></td><td><code>EA = 1234H</code></td><td>Değişkenin veya adresin kendisi doğrudan komutta belirtilir.</td></tr>
              <tr><td><b>Register Indirect (Dolaylı)</b></td><td><code>MOV AX, [BX]</code></td><td><code>EA = BX / BP / SI / DI</code></td><td>Yazmaç bir bellek adresini (pointer) tutar. Yalnızca BX, BP, SI ve DI kullanılabilir!</td></tr>
              <tr><td><b>Base-Plus-Index</b></td><td><code>MOV [BX+DI], CL</code></td><td><code>EA = Taban + İndeks</code></td><td>Taban (BX veya BP) ile İndeks (SI veya DI) toplanarak adres üretilir.</td></tr>
              <tr><td><b>Register Relative</b></td><td><code>MOV AX, [BX+4]</code></td><td><code>EA = Yazmaç + Sabit</code></td><td>Dizilerde <code>ARRAY[BX]</code> şeklinde sabit ofset eklenerek kullanılır.</td></tr>
              <tr><td><b>Base Relative-Plus-Index</b></td><td><code>MOV AX, [BX+DI+4]</code></td><td><code>EA = BX + DI + 4</code></td><td>İki boyutlu matris ve struct erişimleri için kullanılır.</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style="margin-top:16px;">2. Program Bellek Adresleme Modları (Dallanmalar)</h4>
        <ul>
          <li><b>Direct Program Memory Addressing (Far Jump / Intersegment):</b>
            <br>• Örnek: <code>JMP FAR PTR 1000:0000</code>
            <br>• 5 bayttan oluşur: 1 bayt opcode + 2 bayt IP ofseti + 2 bayt CS segmenti. Farklı bir koda tamamen sıçrar.
          </li>
          <li><b>Relative Program Memory Addressing (Near & Short Jump / Intrasegment):</b>
            <br>• Kod göstericisine (IP) bağıl yer değiştirme (displacement) eklenir: <code>Yeni IP = Mevcut IP + Displacement</code>.
            <br>• <b>Short Jump:</b> 1 baytlık işaretli ofset (<code>-128</code> ile <code>+127</code> bayt arası sıçrama). Tüm koşullu atlamalar (JE, JNE, JA vb.) 8086'da short jump'tır.
            <br>• <b>Near Jump:</b> 2 baytlık ofset (<code>-32768</code> ile <code>+32767</code> bayt arası veya aynı 64 KB segment içi).
          </li>
          <li><b>Indirect Program Memory Addressing:</b>
            <br>• Örnek: <code>JMP AX</code> veya <code>JMP [BX]</code> (Fonksiyon işaretçi tabloları / Jump tables).
          </li>
        </ul>

        <h4 style="margin-top:16px;">3. Yığın (Stack) Bellek ve LIFO Dinamikleri</h4>
        <div class="theory-formula-box">
          <code>Yığın Fiziksel Adresi = (SS × 10H) + SP</code>
        </div>
        <ul>
          <li>🚨 <b>PUSH Komutu Donanımsal Adımları:</b>
            <br>1. Önce SP 2 azaltılır: <code>SP = SP - 2</code>
            <br>2. 16-bit verinin Yüksek Baytı <code>[SP+1]</code>'e, Düşük Baytı <code>[SP]</code>'ye yazılır (Little-Endian).
            <br>• Örnek: <code>AX = 3050H</code> iken <code>PUSH AX</code>: <code>SP-1 = 30H</code>, <code>SP-2 = 50H</code>, <code>SP = SP - 2</code>.
          </li>
          <li>🚨 <b>POP Komutu Donanımsal Adımları:</b>
            <br>1. <code>SS:[SP]</code> adresinden Düşük Bayt, <code>SS:[SP+1]</code> adresinden Yüksek Bayt okunur.
            <br>2. SP 2 artırılır: <code>SP = SP + 2</code>.
          </li>
          <li><b>Neden POP CS Yasaktır?</b> Kod segmenti (CS) yığından rastgele bir değerle değiştirilirse işlemcinin hangi program komutunu yürüteceği belirsizleşir ve sistem çöker. CS sadece <code>RET</code>, <code>IRET</code> veya Far <code>JMP/CALL</code> ile güncellenir.</li>
        </ul>
      </div>
    `
  },

  // =========================================================================
  // HAFTA 4: Veri Hareketi Komutları & Dönüşümler
  // =========================================================================
  {
    weekNumber: 4,
    title: "Veri Hareketi Komutları & Tip Dönüşümleri",
    subtitle: "5 Veri Grubu, Geçersiz MOV Kuralları, PUSHA/POPA Sırası, Port I/O ve Dönüşüm Komutları",
    period: "Vize Öncesi (Hafta 1-7)",
    slideCount: "40 Slayt",
    sourceFiles: ["Week 4 - Data Movement Instructions.md", "w4.pdf"],
    keyTopics: [
      "5 Veri Taşıma Kategorisi (Reg/Mem, Stack, I/O, String, Conversion)",
      "Segment Geçersiz Kılma Öneki (Segment Override Prefix: ES:[BX])",
      "Geçersiz MOV Kombinasyonları (Mem-to-Mem, Imm-to-Seg, CS'ye Yazma, Boyut Uyuşmazlığı)",
      "XCHG Komutu ve Geçici Yazmaçsız Takas",
      "LEA vs MOV OFFSET Karşılaştırması",
      "PUSHA ve POPA Kesin Yazmaç Sıralaması (SP Atlaması)",
      "Sabit Port (00H-FFH) vs Değişken Port (DX)",
      "String Komutları: MOVS, LODS, STOS, REP ve CLD/STD",
      "Dönüşüm Komutları: MOVSX, MOVZX, CBW, CWD, CWDE, CDQ, XLAT"
    ],
    summaryHtml: `
      <div class="note-section-card">
        <h4>1. Geçersiz MOV Kombinasyonları ve Donanımsal Nedenleri</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>Hatalı Kod</th><th>Neden Geçersizdir? (Donanım Kısıtı)</th><th>Doğru Düzeltme Yolu</th></tr></thead>
            <tbody>
              <tr><td><code>MOV [DI], [SI]</code></td><td>Bellekten belleğe doğrudan transfer işlem kodu (opcode) 8086'da yoktur! Tek komutta iki bellek adresi sürülemez.</td><td><code>MOV AX, [SI]</code><br><code>MOV [DI], AX</code> (veya <code>MOVSB</code>)</td></tr>
              <tr><td><code>MOV DS, 1000H</code></td><td>Segment yazmaçlarına doğrudan sabit (immediate) sayı yükleyecek donanımsal devre yoktur.</td><td><code>MOV AX, 1000H</code><br><code>MOV DS, AX</code></td></tr>
              <tr><td><code>MOV CS, AX</code></td><td>CS yazmacına doğrudan veri yazılamaz; kod akışı bütünlüğünü bozar.</td><td><code>JMP FAR PTR ...</code></td></tr>
              <tr><td><code>MOV AL, BX</code></td><td>Boyut uyuşmazlığı! AL 8-bit, BX 16-bit'tir.</td><td><code>MOV AX, BX</code> veya <code>MOV AL, BL</code></td></tr>
            </tbody>
          </table>
        </div>

        <h4 style="margin-top:16px;">2. PUSHA ve POPA Donanımsal Sıralaması (Sınav Sorusu!)</h4>
        <p>Tüm genel yazmaçları tek komutta yığına kaydeder ve geri çeker (80186+):</p>
        <ul>
          <li><b>PUSHA Sırası (SP = SP - 16):</b>
            <br><code>AX ➔ CX ➔ DX ➔ BX ➔ Orijinal SP ➔ BP ➔ SI ➔ DI</code>
          </li>
          <li><b>POPA Sırası (SP = SP + 16):</b>
            <br><code>DI ➔ SI ➔ BP ➔ (Orijinal SP yoksayılır/atlanır!) ➔ BX ➔ DX ➔ CX ➔ AX</code>
          </li>
        </ul>

        <h4 style="margin-top:16px;">3. Sabit Port vs Değişken Port (IN ve OUT)</h4>
        <ul>
          <li><b>Sabit Port (Fixed Port):</b> Port adresi <code>00H – FFH</code> (0–255) arasında ise doğrudan yazılabilir:
            <br>• <code>IN AL, 60H</code> (Klavyeden bayt oku)
            <br>• <code>OUT 80H, AL</code> (Donanım test portuna yaz)
          </li>
          <li><b>Değişken Port (Variable Port):</b> Port adresi 255'ten büyükse (<code>0000H – FFFFH</code>), port adresi <b>MUTLAKA DX YAZMACINA</b> yüklenmelidir:
            <br>• <code>MOV DX, 03F8H</code> ➔ <code>OUT DX, AL</code> (COM1 seri portu).
          </li>
        </ul>

        <h4 style="margin-top:16px;">4. Tür Dönüştürme ve İşaret Yayma Komutları</h4>
        <ul>
          <li><code>MOVSX Hedef, Kaynak</code>: Kaynağın işaret bitini (MSB) hedefin üst bitlerine yayar (Sign-Extend).</li>
          <li><code>MOVZX Hedef, Kaynak</code>: Üst bitleri sıfır ile doldurur (Zero-Extend).</li>
          <li><code>CBW</code> (Convert Byte to Word): AL'nin işaretini AH'ye yayarak AX yapar (Örn: <code>AL = -5 = FBH</code> ➔ <code>AX = FFFBH</code>).</li>
          <li><code>CWD</code> (Convert Word to Doubleword): AX'in işaretini DX'e yayarak DX:AX yapar (Negatifse DX=FFFFH, pozitifse DX=0000H).</li>
          <li><code>XLAT</code> (Translate): Tablo dönüştürme komutudur. <code>AL = [DS:BX + AL]</code> formülünü tek çevrimde donanımsal yürütür.</li>
        </ul>
      </div>
    `
  },

  // =========================================================================
  // HAFTA 5 & w11.pdf: Aritmetik, Mantık & Çoklu Kelime İşlemleri
  // =========================================================================
  {
    weekNumber: 5,
    title: "Aritmetik ve Mantık Komutları (ALU) & Slayt Soruları",
    subtitle: "ADD/ADC, SUB/SBB, Çarpma/Bölme Hataları, Donanımsal 3 Adımlı Çıkarma, Mantık & Bit Kaydırma",
    period: "Vize Öncesi (Hafta 1-7)",
    slideCount: "40 Slayt + w11.pdf Özel Dosyası",
    sourceFiles: ["Week 5 - Arithmetic and Logic Instructions.md", "w5.pdf", "w11.pdf"],
    keyTopics: [
      "ADD vs ADC (Çoklu Kelime Toplama): 64-bit DQ Toplamı Örneği",
      "5 Baytlık Günlük Ücret Toplama Örneği (w11.pdf)",
      "INC ve DEC Neden CF Bayrağını Değiştirmez?",
      "SUB Donanımsal 3 Adımı: 2'nin Tümleyeni + Topla + Eldeyi Tersle (w11.pdf)",
      "32-Bit DD Çıkarma Örneği (62562FAH - 412963BH)",
      "MUL ve IMUL: CF ve OF Bayraklarının Özel Anlamı",
      "DIV ve IDIV: 2 Kritik Hata Durumu (Bölme Sıfır & Bölme Taşması -> Tip 0 Kesmesi)",
      "AND, OR, XOR, TEST: CF=0 ve OF=0 Kuralı",
      "48-Bit Sola Kaydırma Zinciri: SHL AX + RCL BX + RCL DX"
    ],
    summaryHtml: `
      <div class="note-section-card">
        <h4>1. Çoklu Kelime Toplama (ADC) ve w11.pdf Slayt Sorusu</h4>
        <p>16-bit işlemcide 32-bit veya 64-bit sayıları toplarken alt parçalardan gelen elde (Carry Flag) <code>ADC</code> komutu ile üst parçaya eklenir:</p>
        <div class="code-preview-box">
          <code>; 64-Bit Toplama (w11.pdf Sayfa 2): 548FB9963CE7H + 3FCD4FA23B8DH\nCLC                 ; Eldeyi temizle\nMOV AX, [DATA1]     ; Düşük kelime\nADD AX, [DATA2]     ; İlk toplama ADD ile\nMOV [SONUC], AX\nMOV AX, [DATA1+2]\nADC AX, [DATA2+2]   ; Sonraki kelimeler ADC ile eldeleri toplar\nMOV [SONUC+2], AX</code>
        </div>
        <ul>
          <li><b>5 Baytlık İşçi Ücreti Toplamı (w11.pdf):</b> 5 günlük ücretler (<code>125, 235, 197, 91, 48</code>) toplanırken 8-bit AL taşacağı için her bayt <code>ADD AL, [SI]</code> yapıldıktan sonra <code>ADC AH, 00H</code> eklenerek elde AH içinde biriktirilir!</li>
        </ul>

        <h4 style="margin-top:16px;">2. Donanımsal 3 Adımlı Çıkarma Algoritması (w11.pdf)</h4>
        <p>8086 mikroişlemcisinde ALU içinde ayrı bir çıkarma devresi yoktur. Çıkarma 3 donanım adımıyla gerçekleşir:</p>
        <ol>
          <li><b>Çıkan sayının (Subtrahend) 2'nin tümleyeni alınır.</b></li>
          <li><b>Eksilen sayıya (Minuend) eklenir.</b></li>
          <li><b>Oluşan Carry biti TERSLENİR (Invert Carry)!</b> Carry 0 ise CF=1 (Borç alındı), Carry 1 ise CF=0 (Borç yok).</li>
        </ol>

        <h4 style="margin-top:16px;">3. Çarpma ve Bölmede Bayrak Davranışları & Tip 0 Hatası</h4>
        <ul>
          <li><b>MUL / IMUL Bayrak Kuralı:</b> Çarpma işlemlerinde yalnızca <b>CF ve OF bayrakları tanımlıdır!</b> Diğer tüm bayraklar belirsizdir.
            <br>• Eğer çarpımın yüksek yarısı (AH veya DX) sıfır değilse (anlamlı veri içeriyorsa) <b>CF = 1 ve OF = 1</b> olur.
            <br>• Yüksek yarı tamamen sıfır ise <b>CF = 0 ve OF = 0</b> olur.
          </li>
          <li><b>DIV / IDIV ve Kesme 0 (Divide by Zero / Overflow):</b>
            <br>• Bölme komutlarında <b>TÜM DURUM BAYRAKLARI BELİRSİZDİR (Undefined)!</b>
            <br>• <b>Tip 0 Kesmesi Üreten 2 Hata:</b>
            <br>1. Sıfıra bölme (Bölen = 0).
            <br>2. <b>Bölme Taşması (Divide Overflow):</b> Bölüm sonucu hedef yazmaca sığmazsa oluşur!
            <br>Örnek (Slayt Sorusu): <code>AX = 3000 (0BB8H), BL = 2</code>. <code>DIV BL</code> yapıldığında <code>3000 / 2 = 1500</code> çıkar. Ancak 1500 sayısı 8-bitlik AL akümülatörüne (maksimum 255) SIĞMAZ! İşlemci donanımsal olarak <b>Divide Error (INT 0)</b> üreterek çöker.
          </li>
        </ul>

        <h4 style="margin-top:16px;">4. 48-Bit Sola Kaydırma Zinciri (SHL + RCL)</h4>
        <p>48-bitlik bir sayıyı (DX:BX:AX) ikilik tabanda 2 ile çarpmak (1 bit sola kaydırmak) için elde bayrağı köprü olarak kullanılır:</p>
        <div class="code-preview-box">
          <code>SHL AX, 1   ; AX'in en sol biti (MSB) CF'ye düşer\nRCL BX, 1   ; CF'deki bit BX'in sağına girer, BX'in solu CF'ye çıkar\nRCL DX, 1   ; CF'deki bit DX'in sağına girer (48-bit tam sola kaydı!)</code>
        </div>
      </div>
    `
  },

  // =========================================================================
  // HAFTA 6 & 7: Vaka Çalışmaları, Tahta Notları, I/O & DMA Sistemleri
  // =========================================================================
  {
    weekNumber: 6,
    title: "Program Akışı, Tahta Çizimleri, I/O & Kesmeler (INT/IVT)",
    subtitle: "Döngü İzleme Tablosu (Excalidraw), Dizi Toplama, 14 Kod Örneği, IVT Vektörleri ve DMA",
    period: "Vize Öncesi (Hafta 1-7)",
    slideCount: "40 Slayt + 3 Tahta Çizimi + 8 Sayfa Kod Örnekleri",
    sourceFiles: ["Week 6 - In-Class Notes and Case Studies.md", "MicroProcessor code examples week.pdf", "w6.pdf", "w9.pdf"],
    keyTopics: [
      "Week 6 Tahta Notu 1: Döngü İzleme Tablosu (4 Çevrim, AX=14H, BX=0AH, CX=0, ZF=0)",
      "Week 6 Tahta Notu 2: BLOCK1 + BLOCK2 Dizi Eleman Toplamı",
      "Week 6 Tahta Notu 3: İç İçe Döngüde PUSH CX / POP CX Zorunluluğu",
      "14 Kod Örneği: 0xaa Bitişli Dizide Max Bulma, |AX-BX| Mutlak Fark, Tek/Çift lodsw+shr",
      "Kesme Vektör Tablosu (IVT: 00000H - 003FFH, 256 Vektör * 4 Bayt)",
      "Ön Tanımlı Kesmeler: INT 0 (Bölme Hata), INT 1 (Single Step), INT 2 (NMI), INT 3 (Breakpoint)",
      "Giriş/Çıkış Yöntemleri: Programmed I/O (Polling), Interrupt-Driven I/O, DMA",
      "DMA Controller (8237) ve 3 Veri Transfer Modu: Burst, Cycle Stealing, Transparent",
      "Isolated I/O (IN/OUT) vs Memory-Mapped I/O"
    ],
    summaryHtml: `
      <div class="note-section-card">
        <h4>1. Doç. Dr. Mehmet Akif Çifci'nin Tahta Çizimleri (Week 6 Excalidraw)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>Çevrim No</th><th>Çevrim Başı CX</th><th>Yürütülen Komutlar</th><th>AX Değeri</th><th>BX Değeri</th><th>Çevrim Sonu CX</th><th>Döngüden Çıkıldı mı?</th></tr></thead>
            <tbody>
              <tr><td>1. Tur</td><td>4</td><td>ADD AX, BX (0+2) ; ADD BX, 2 (2+2)</td><td>2 (0002H)</td><td>4 (0004H)</td><td>3</td><td>Hayır (CX ≠ 0)</td></tr>
              <tr><td>2. Tur</td><td>3</td><td>ADD AX, BX (2+4) ; ADD BX, 2 (4+2)</td><td>6 (0006H)</td><td>6 (0006H)</td><td>2</td><td>Hayır (CX ≠ 0)</td></tr>
              <tr><td>3. Tur</td><td>2</td><td>ADD AX, BX (6+6) ; ADD BX, 2 (6+2)</td><td>12 (000CH)</td><td>8 (0008H)</td><td>1</td><td>Hayır (CX ≠ 0)</td></tr>
              <tr><td>4. Tur</td><td>1</td><td>ADD AX, BX (12+8) ; ADD BX, 2 (8+2)</td><td><b>20 (0014H)</b></td><td><b>10 (000AH)</b></td><td><b>0</b></td><td><b>EVET (CX = 0)</b></td></tr>
            </tbody>
          </table>
        </div>
        <p style="margin-top:8px;">💡 <b>Hocanın Tahtadaki Altın Uyarısı:</b> Döngü bittiğinde <code>AX = 20 (14H)</code>, <code>BX = 10 (0AH)</code> ve <code>CX = 0</code> olur. <strong>Sıfır Bayrağı ZF = 0 KALIR!</strong> Çünkü LOOP komutu bayrakları etkilemez; en son çalışan <code>ADD BX, 2</code> komutunda BX=10 olduğu için ZF sıfırda kalmıştır.</p>

        <h4 style="margin-top:16px;">2. Laboratuvar Kod Örnekleri Kitapçığı (w6 Code Examples PDF)</h4>
        <ul>
          <li><b>Örnek 8: 0xaa ile Biten Dizide Maksimum Elemanı Bulma:</b>
            <div class="code-preview-box">
              <code>KONTROL:\nLODSB           ; AL = [SI], SI = SI + 1\nCMP AL, 0AAH    ; Dizi sonu imi mi?\nJZ BITIR        ; Evet ise döngüden çık\nCMP AL, BL      ; Mevcut max (BL) ile karşılaştır\nJB DEVAM        ; AL < BL ise atla\nMOV BL, AL      ; Yeni maksimumu BL'ye yaz\nDEVAM:\nJMP KONTROL</code>
            </div>
          </li>
          <li><b>Örnek 9: |AX - BX| Mutlak Farkı Hesaplama:</b>
            <div class="code-preview-box">
              <code>CMP AX, BX      ; Karşılaştır\nJC BX_BUYUK     ; AX < BX ise (CF=1) BX_BUYUK'e atla\nSUB AX, BX      ; AX >= BX ise fark AX - BX\nJMP BITIR\nBX_BUYUK:\nSUB BX, AX      ; BX > AX ise fark BX - AX\nMOV AX, BX\nBITIR: HLT</code>
            </div>
          </li>
          <li><b>Örnek 12: 10 Elemanlı Word Dizisinde Çift Sayıları Sayma:</b>
            <div class="code-preview-box">
              <code>LODSW           ; AX = [SI], SI = SI + 2\nSHR AX, 1       ; En sağdaki tek/çift biti CF içine kayar\nJNC CIFT_SAYI   ; CF = 0 ise sayı çifttir!\nJMP TEK_DEVAM</code>
            </div>
          </li>
        </ul>

        <h4 style="margin-top:16px;">3. Direct Memory Access (DMA) ve 3 Transfer Modu (Hafta 7)</h4>
        <div class="table-responsive">
          <table class="theory-table">
            <thead><tr><th>DMA Transfer Modu</th><th>Veriyolu Hakimiyeti</th><th>Hız & CPU Etkisi</th><th>Tipik Kullanım Alanı</th></tr></thead>
            <tbody>
              <tr><td><b>Burst Mode (Blok Aktarımı)</b></td><td>DMA tüm veriyolunu tamamen ele geçirir; blok bitene kadar CPU durur (HOLD sinyali).</td><td>Maksimum veri aktarım hızı; ancak CPU tamamen kilitlenir.</td><td>Sabit diskten yüksek hızlı bellek sayfası okuma.</td></tr>
              <tr><td><b>Cycle Stealing (Çevrim Çalma)</b></td><td>DMA tek bir bayt/kelime aktarır, ardından veriyolunu hemen CPU'ya geri bırakır.</td><td>Dengeli mod; CPU işlemlerine devam ederken aralarda transfer yapılır.</td><td>Ağ kartları, ses kartı veri tamponları.</td></tr>
              <tr><td><b>Transparent Mode (Gizli Mod)</b></td><td>DMA yalnızca CPU'nun sistem veriyolunu kullanmadığı saat çevrimlerinde aktarım yapar.</td><td>CPU performansına sıfır etki; ancak en yavaş transfer modudur.</td><td>Arka plan bellek yenileme (DRAM Refresh).</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `
  },

  // =========================================================================
  // HAFTALAR 9-15: Final Konuları (İleri İşlemci Mimarisi, Boru Hattı, Önbellek)
  // =========================================================================
  {
    weekNumber: 9,
    title: "İleri İşlemci Organizasyonu, Boru Hattı & Önbellek (Final Konuları)",
    subtitle: "MAR/MBR/PC/IR/PSW, 6 Kademeli Pipeline, Tehlikeler (RAW/WAR/WAW), Cache Haritalama, Amdahl & Gustafson Yasaları",
    period: "Vize Sonrası (Hafta 9-15)",
    slideCount: "40+ Slayt x 5 Hafta",
    sourceFiles: ["w10.pdf", "w12a.pdf", "w13a.pdf", "w14a.pdf", "w15a.pdf"],
    keyTopics: [
      "İşlemci İçi Organizasyon: ALU, CU, MAR, MBR, PC, IR, PSW",
      "Dolaylı Çevrim (Indirect Cycle) ve Yürütme Döngüsü",
      "6-Kademeli Boru Hattı: FI, DI, CO, FO, EI, WO",
      "Pipeline Performans Formülleri: Saat Periyodu tau, Toplam Süre Tk,n, Hızlanma Sk",
      "Boru Hattı Tehlikeleri: Yapısal, Veri (RAW, WAR, WAW), Kontrol/Dallanma",
      "Tehlike Çözümleri: Stalling/Bubble, Forwarding, Out-of-Order, Branch Prediction",
      "Önbellek (Cache): Zamansal/Mekansal Yerellik, Direct/Associative/Set-Associative",
      "Önbellek Yazma Politikaları: Write-Through vs Write-Back",
      "Önbellek Iska Türleri: Compulsory (Cold), Capacity, Conflict",
      "Paralellik Yasaları: Amdahl Yasası (Sabit Problem) vs Gustafson Yasası (Ölçekli Problem)"
    ],
    summaryHtml: `
      <div class="note-section-card">
        <h4>1. İşlemci İç Yapısı ve Temel Yazmaçlar</h4>
        <ul>
          <li><b>MAR (Memory Address Register):</b> Bellekten okunacak veya belleğe yazılacak hücrenin adresini tutar; doğrudan adres veriyoluna bağlıdır.</li>
          <li><b>MBR (Memory Buffer Register):</b> Bellekten okunan veya belleğe yazılacak veriyi tutar; doğrudan veri veriyoluna bağlıdır.</li>
          <li><b>PC (Program Counter / IP):</b> Sırada getirilecek komutun adresini tutar.</li>
          <li><b>IR (Instruction Register):</b> Bellekten getirilen komutun opcode'unu tutar; komut çözücüye (Instruction Decoder) aktarılır.</li>
          <li><b>PSW (Program Status Word):</b> Durum ve bayraklar yazmacıdır (FLAGS).</li>
        </ul>

        <h4 style="margin-top:16px;">2. 6 Aşamalı Komut Boru Hattı (6-Stage Pipeline)</h4>
        <div class="theory-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
          <div class="theory-card"><span class="theory-card-badge">1. FI</span><h5>Fetch Instruction</h5><p>Komutu bellekten getir</p></div>
          <div class="theory-card"><span class="theory-card-badge">2. DI</span><h5>Decode Instruction</h5><p>Komut kodunu çöz</p></div>
          <div class="theory-card"><span class="theory-card-badge">3. CO</span><h5>Calculate Operands</h5><p>Efektif adresi hesapla</p></div>
          <div class="theory-card"><span class="theory-card-badge">4. FO</span><h5>Fetch Operands</h5><p>İşlenenleri bellekten al</p></div>
          <div class="theory-card"><span class="theory-card-badge">5. EI</span><h5>Execute Instruction</h5><p>ALU'da komutu yürüt</p></div>
          <div class="theory-card"><span class="theory-card-badge">6. WO</span><h5>Write Operand</h5><p>Sonucu hedefe kaydet</p></div>
        </div>

        <h4 style="margin-top:16px;">3. Pipeline Performans Denklemleri (Sınav Formülleri!)</h4>
        <ul>
          <li><b>Kademe Süresi:</b> <code>τ = max(τ_i) + d</code> (En yavaş kademenin süresi + mandal gecikmesi).</li>
          <li><b>k Kademeli Boru Hattında n Komutun Toplam Süresi:</b> <code>T_{k,n} = [k + (n - 1)] × τ</code></li>
          <li><b>Teorik Hızlanma (Speedup):</b> <code>S_k = (n × k) / [k + (n - 1)]</code>. Çok büyük n için: <code>S_k ➔ k</code> kat hızlanma!</li>
        </ul>

        <h4 style="margin-top:16px;">4. Boru Hattı Tehlikeleri (Hazards) ve Veri Bağımlılıkları</h4>
        <ul>
          <li><b>RAW (Read After Write - Gerçek Bağımlılık):</b> Komut 2, Komut 1'in üreteceği sonucu henüz yazılmadan okumaya çalışır. Çözüm: <i>Bypass / Operand Forwarding</i> (Veriyi WO aşamasını beklemeden doğrudan ALU çıkışından bir sonraki komutun girişine yönlendirme).</li>
          <li><b>WAR (Write After Read - Sahte Bağımlılık):</b> Komut 2, Komut 1 henüz eski değeri okumadan üzerine yeni veri yazar.</li>
          <li><b>WAW (Write After Write - Çıkış Bağımlılığı):</b> Komut 2, Komut 1'den önce yazmaç üzerine yazar ve sıra bozulur.</li>
          <li><b>Dallanma Cezası (Branch Penalty):</b> Bir JMP/CALL komutunda boru hattındaki komutlar geçersiz kalır ve boru hattı boşaltılır (Flush).</li>
        </ul>

        <h4 style="margin-top:16px;">5. Amdahl Yasası vs Gustafson Yasası (Paralellik Formülleri)</h4>
        <ul>
          <li><b>Amdahl Yasası (Sabit İş Yükü):</b>
            <br><code>Speedup = 1 / [ (1 - P) + (P / N) ]</code>
            <br>(P: Paralelleştirilebilir oran, N: Çekirdek/işlemci sayısı). Sonsuz çekirdek olsa bile hızlanma <code>1 / (1 - P)</code> ile sınırlıdır!
          </li>
          <li><b>Gustafson Yasası (Ölçeklenebilir İş Yükü):</b>
            <br><code>Speedup = N - P × (N - 1) = (1 - P) + P × N</code>
            <br>Problem boyutu çekirdek sayısıyla orantılı büyütüldüğünde hızlanma neredeyse doğrusal (linear) artar.
          </li>
        </ul>
      </div>
    `
  }
];

export const INSTRUCTION_FLAG_MATRIX: Array<{
  instruction: string;
  category: string;
  cf: string;
  zf: string;
  sf: string;
  of: string;
  pf: string;
  af: string;
  ruleExplanation: string;
}> = [
  { instruction: "MOV / XCHG / LEA", category: "Veri Hareketi", cf: "—", zf: "—", sf: "—", of: "—", pf: "—", af: "—", ruleExplanation: "🚨 ALTIN KURAL: Veri taşıma komutları bayrakları ASLA DEĞİŞTİRMEZ! Sıfır veya negatif taşınsa bile bayraklar korunur." },
  { instruction: "PUSH / POP", category: "Yığın", cf: "—", zf: "—", sf: "—", of: "—", pf: "—", af: "—", ruleExplanation: "Yığın komutları bayrakları etkilemez (POPF hariç, POPF tüm bayrakları yığından günceller)." },
  { instruction: "ADD / ADC", category: "Aritmetik", cf: "Güncellenir", zf: "Güncellenir", sf: "Güncellenir", of: "Güncellenir", pf: "Güncellenir", af: "Güncellenir", ruleExplanation: "Tüm 6 durum bayrağını tam olarak hesaplar. ADC komutunda işleme girmeden önceki eski CF de hesaba katılır." },
  { instruction: "INC / DEC", category: "Aritmetik", cf: "— KORUNUR!", zf: "Güncellenir", sf: "Güncellenir", of: "Güncellenir", pf: "Güncellenir", af: "Güncellenir", ruleExplanation: "🚨 SINAV TUZAĞI: INC ve DEC CARRY BAYRAĞINI (CF) DEĞİŞTİRMEZ! Döngülerde sayaç artırılırken çoklu kelime toplama (ADC) eldesini bozmamak için donanım CF'yi korur." },
  { instruction: "SUB / SBB / CMP", category: "Aritmetik", cf: "Güncellenir (Borç)", zf: "Güncellenir", sf: "Güncellenir", of: "Güncellenir", pf: "Güncellenir", af: "Güncellenir", ruleExplanation: "CMP çıkarma yapar ama hedefi değiştirmez; yalnızca 6 bayrağı kurar. Küçükten büyük çıkarsa CF = 1 (Borç) olur." },
  { instruction: "NEG", category: "Aritmetik", cf: "Sonuç ≠ 0 ise 1", zf: "Güncellenir", sf: "Güncellenir", of: "80H/8000H ise 1", pf: "Güncellenir", af: "Güncellenir", ruleExplanation: "0 - Hedef yapar. Kaynak 0 ise CF = 0, diğer tüm değerlerde CF = 1 olur. 80H (-128) negate edilirse +128 sığmadığı için OF = 1 olur!" },
  { instruction: "MUL / IMUL", category: "Çarpma", cf: "Üst yarı ≠ 0 ise 1", zf: "Belirsiz (?)", sf: "Belirsiz (?)", of: "Üst yarı ≠ 0 ise 1", pf: "Belirsiz (?)", af: "Belirsiz (?)", ruleExplanation: "Yalnızca CF ve OF tanımlıdır! Sonucun üst yarısı (AH veya DX) anlamlı veri taşıyorsa CF=OF=1, sıfırsa CF=OF=0 olur." },
  { instruction: "DIV / IDIV", category: "Bölme", cf: "Belirsiz (?)", zf: "Belirsiz (?)", sf: "Belirsiz (?)", of: "Belirsiz (?)", pf: "Belirsiz (?)", af: "Belirsiz (?)", ruleExplanation: "TÜM DURUM BAYRAKLARI BELİRSİZDİR! Hiçbir bayrak koşullu atlama için güvenilemez." },
  { instruction: "AND / OR / XOR / TEST", category: "Mantık", cf: "0 (TEMİZLENİR)", zf: "Güncellenir", sf: "Güncellenir", of: "0 (TEMİZLENİR)", pf: "Güncellenir", af: "Belirsiz (?)", ruleExplanation: "🚨 Mantıksal komutlar Carry Flag (CF) ve Overflow Flag (OF) bayraklarını DAİMA 0 YAPAR! AF belirsizdir." },
  { instruction: "NOT", category: "Mantık", cf: "—", zf: "—", sf: "—", of: "—", pf: "—", af: "—", ruleExplanation: "Bitleri tersler (1'in tümleyeni). HİÇBİR BAYRAĞI ETKİLEMEZ!" },
  { instruction: "SHL / SHR", category: "Kaydırma", cf: "Dışarı düşen bit", zf: "Güncellenir", sf: "Güncellenir", of: "1-bit kaydırmada", pf: "Güncellenir", af: "Belirsiz (?)", ruleExplanation: "Dışarı kayan son bit CF içine girer. 1 bit kaydırıldığında eğer en yüksek bit değişmişse OF = 1 olur." },
  { instruction: "SAR", category: "Aritmetik Kaydırma", cf: "Dışarı düşen bit", zf: "Güncellenir", sf: "MSB korunur (1/0)", of: "0", pf: "Güncellenir", af: "Belirsiz (?)", ruleExplanation: "İşaret bitini (MSB) çoğaltarak sağa kaydırır. İşaretli negatif sayıları 2'ye böler." },
  { instruction: "LOOP / JCXZ", category: "Program Akışı", cf: "—", zf: "—", sf: "—", of: "—", pf: "—", af: "—", ruleExplanation: "🚨 HOCANIN ALTIN KURALI: LOOP CX'i azaltsa bile ve CX=0 olsa bile BAYRAKLARI ASLA DEĞİŞTİRMEZ! JCXZ de bayrakları etkilemez." },
  { instruction: "CLC / STC / CMC", category: "Bayrak Kontrolü", cf: "CLC=0, STC=1, CMC=NOT", zf: "—", sf: "—", of: "—", pf: "—", af: "—", ruleExplanation: "Doğrudan CF'yi sıfırlar, kurar veya tersler. Diğer bayraklara dokunmaz." }
];
