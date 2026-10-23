export type ExerciseDifficulty = 'kolay' | 'orta' | 'zor';

export interface LectureExample {
  id: string;
  difficulty: ExerciseDifficulty;
  difficultyLabel: string;
  title: string;
  scenario: string;
  task: string;
  code: string;
  initialRegisters?: Record<string, number>;
  initialMemory?: Array<{ segment: number; offset: number; bytes: number[] }>;
  solutionCode: string;
  solutionBreakdown: string[];
  examTips: string;
}

export interface LectureSection {
  title: string;
  contentHtml: string;
  examples?: LectureExample[];
}

export interface MilestoneLecture {
  milestoneId: string;
  milestoneNumber: number;
  title: string;
  subtitle: string;
  slideRef: string;
  overviewHtml: string;
  sections: LectureSection[];
}

export const MILESTONE_LECTURES: Record<string, MilestoneLecture> = {
  "milestone-1": {
    "milestoneId": "milestone-1",
    "milestoneNumber": 1,
    "title": "8086 CPU Mimarisi, 1 MB Bellek Haritası & 20-Bit Adresleme",
    "subtitle": "BIU & EU Donanım Birimleri, 14 Yazmaç ve Durum Bayrakları, TPA & System Area, Little-Endian Prensibi ve İnteraktif Keşif Araçları",
    "slideRef": "Hoca: Week 1 & 2 PPTX / w1, w2 PDF | Kitap: Barry B. Brey Bölüm 1 & 2",
    "overviewHtml": "\n      <div class=\"lecture-hero-card\">\n        <div class=\"lecture-hero-badge\">AŞAMA 1: MİKROİŞLEMCİ MİMARİSİ VE DONANIM TEMELLERİ (GİRİŞ)</div>\n        <p class=\"lecture-hero-text\">\n          Mikroişlemci tabanlı bir bilgisayar sistemi; <b>Merkezi İşlem Birimi (CPU)</b>, <b>Bellek (RAM/ROM)</b> ve <b>Giriş/Çıkış (I/O)</b> arabirimlerinin adres, veri ve kontrol veriyolları (buses) ile birbirine bağlanmasıyla oluşur. \n          8086 mikroişlemcisi, komutları getiren <b>BIU</b> birimi ile komutları yürüten <b>EU</b> birimini birbirinden ayırarak modern boru hattı (pipelining) mimarisinin temelini atmıştır.\n        </p>\n        <div class=\"lecture-golden-rule\">\n          💡 <strong>Önemli Pedagojik Not (Kod Yazma Zorunluluğu Yoktur):</strong><br>\n          Bu ilk aşama mikroişlemcinin donanım bloklarını, yazmaçlarını ve hafıza organizasyonunu kavramaya ayrılmıştır. \n          <strong>Sizden bu aşamada herhangi bir assembly kodu yazmanız veya problem çözmeniz BEKLENMEMEKTEDİR.</strong><br>\n          Aşağıdaki görsel anlatımları inceleyebilir, entegre ettiğimiz <b>20-Bit Adres Hesaplayıcı</b> ve <b>Little-Endian Görselleştirici</b> araçlarıyla donanım mantığını keşfedebilirsiniz. Kod yazma ve uygulamalı alıştırmalar bir sonraki aşamada (Aşama 2) başlayacaktır.\n        </div>\n      </div>\n    ",
    "sections": [
      {
        "title": "1. 8086 Dahili Mimarisi: BIU ve EU İşbölümü",
        "contentHtml": "\n              <h4>1.1. Bus Interface Unit (BIU - Veriyolu Arayüz Birimi)</h4>\n              <p>\n                BIU birimi, işlemcinin dış dünyayla (sistem veriyolları ve bellek) doğrudan iletişim kuran tek parçasıdır. Görevleri:\n              </p>\n              <ul>\n                <li>Bellekten yürütülecek komutları okumak ve <b>6-baytlık Komut Ön Getirme Kuyruğuna (Prefetch Queue - FIFO)</b> yerleştirmek.</li>\n                <li>Segment yazmaçlarını (<code>CS, DS, SS, ES</code>) ve komut göstericisini (<code>IP</code>) tutmak.</li>\n                <li>Segment ve ofset değerlerini birleştirerek <b>20-bitlik fiziksel bellek adresini</b> hesaplamak ve adres veriyoluna sürmek.</li>\n              </ul>\n\n              <h4>1.2. Execution Unit (EU - Yürütme Birimi)</h4>\n              <p>\n                EU birimi, veriyollarıyla doğrudan konuşmaz; ihtiyaç duyduğu komutları BIU kuyruğunun başından çeker:\n              </p>\n              <ul>\n                <li><b>Komut Çözücü (Instruction Decoder):</b> Getirilen makine kodunu çözer ve kontrol sinyallerine dönüştürür.</li>\n                <li><b>16-Bit Aritmetik Mantık Birimi (ALU):</b> Toplama, çıkarma, mantıksal VE/VEYA gibi tüm hesaplamaları yürütür.</li>\n                <li><b>Yazmaç Kümesi:</b> Genel amaçlı yazmaçları (<code>AX, BX, CX, DX</code>), işaretçi ve indeksleri (<code>SP, BP, SI, DI</code>) barındırır.</li>\n                <li><b>Bayraklar Yazmacı (Flags):</b> ALU'da yapılan işlemlerin sonucuna göre durum bitlerini (CF, ZF, SF, OF vb.) kurar.</li>\n              </ul>\n            "
      },
      {
        "title": "2. 14 Adet 16-Bitlik Yazmaç Kümesi ve Durum Bayrakları",
        "contentHtml": "\n              <p>8086 mikroişlemcisinde tamamı 16-bit genişliğinde 14 adet yazmaç bulunur. Bu yazmaçlar görevlerine göre 4 gruba ayrılır:</p>\n              \n              <table class=\"lecture-table\">\n                <thead>\n                  <tr><th>Grup</th><th>Yazmaç</th><th>Adı</th><th>Özel Donanımsal Görevi</th></tr>\n                </thead>\n                <tbody>\n                  <tr><td rowspan=\"4\"><b>Genel Amaçlı (Veri)</b><br><small>8-bit (H/L) olarak da erişilebilir</small></td><td><code>AX (AH:AL)</code></td><td>Akümülatör (Accumulator)</td><td>Aritmetik ve mantıksal işlemlerin merkezidir; çarpma/bölme ve I/O komutlarında zorunludur.</td></tr>\n                  <tr><td><code>BX (BH:BL)</code></td><td>Taban (Base)</td><td>Bellek adreslemede taban göstericisi olarak kullanılabilen tek genel yazmaçtır.</td></tr>\n                  <tr><td><code>CX (CH:CL)</code></td><td>Sayaç (Count)</td><td>Döngülerde (LOOP) ve bit kaydırma komutlarında (SHL/SHR) donanımsal sayaçtır.</td></tr>\n                  <tr><td><code>DX (DH:DL)</code></td><td>Veri (Data)</td><td>32-bit çarpma/bölmede üst 16 biti tutar; 255'ten büyük port adreslerini (IN/OUT) saklar.</td></tr>\n                  <tr><td rowspan=\"2\"><b>İşaretçiler (Pointers)</b></td><td><code>SP</code></td><td>Yığın Göstericisi (Stack Pointer)</td><td>Yığının en üst noktasını gösterir (PUSH/POP ile otomatik güncellenir).</td></tr>\n                  <tr><td><code>BP</code></td><td>Taban Göstericisi (Base Pointer)</td><td>Yığın çerçevesi (Stack Frame) üzerinde yerel değişkenlere ve parametrelere erişir.</td></tr>\n                  <tr><td rowspan=\"2\"><b>İndeksler (Index)</b></td><td><code>SI</code></td><td>Kaynak İndeksi (Source Index)</td><td>Dizi ve blok kopyalama işlemlerinde kaynak bellek göstericisidir.</td></tr>\n                  <tr><td><code>DI</code></td><td>Hedef İndeksi (Destination Index)</td><td>Dizi ve string işlemlerinde hedef bellek göstericisidir.</td></tr>\n                  <tr><td rowspan=\"4\"><b>Segment Yazmaçları</b></td><td><code>CS</code></td><td>Kod Segmenti (Code Segment)</td><td>Yürütülecek program kodlarının bulunduğu 64 KB'lık segmenti gösterir.</td></tr>\n                  <tr><td><code>DS</code></td><td>Veri Segmenti (Data Segment)</td><td>Program değişkenlerinin ve genel verilerin bulunduğu segmenti gösterir.</td></tr>\n                  <tr><td><code>SS</code></td><td>Yığın Segmenti (Stack Segment)</td><td>Yığın (Stack) belleğinin bulunduğu segmenti gösterir.</td></tr>\n                  <tr><td><code>ES</code></td><td>Ekstra Segment (Extra Segment)</td><td>String operasyonlarında hedefin bulunduğu yardımcı veri segmentidir.</td></tr>\n                  <tr><td rowspan=\"2\"><b>Özel Amaçlı</b></td><td><code>IP</code></td><td>Komut Göstericisi (Instruction Pointer)</td><td>Sırada çalıştırılacak komutun CS içindeki ofset adresini tutar.</td></tr>\n                  <tr><td><code>FLAGS</code></td><td>Bayraklar Yazmacı (16-bit)</td><td>6 durum bayrağı (CF, PF, AF, ZF, SF, OF) ve 3 kontrol bayrağı (TF, IF, DF) içerir.</td></tr>\n                </tbody>\n              </table>\n            "
      },
      {
        "title": "3. 1 MB Bellek Haritası: TPA ve System Area Haritası",
        "contentHtml": "\n              <p>\n                8086'nın 20-bitlik adres yolu toplam <b>$2^{20} = 1,048,576$ bayt (1 Megabayt)</b> bellek alanı sağlar. \n                Hocanızın Week 1 & 2 slaytlarında ve Barry Brey kitabında vurgulanan standart 1 MB bellek haritası şöyledir:\n              </p>\n\n              <table class=\"lecture-table\">\n                <thead>\n                  <tr><th>Bölge Adı</th><th>Fiziksel Adres Aralığı</th><th>Kapasite</th><th>İçerik ve Donanımsal Kullanım</th></tr>\n                </thead>\n                <tbody>\n                  <tr>\n                    <td><b>TPA (Transient Program Area)</b></td>\n                    <td><code>00000H – 9FFFFH</code></td>\n                    <td>640 KB</td>\n                    <td>İlk 1 KB'da Kesme Vektör Tablosu (IVT), DOS işletim sistemi çekirdeği, aygıt sürücüleri ve kullanıcının çalıştırdığı programlar burada yer alır.</td>\n                  </tr>\n                  <tr>\n                    <td><b>System Area (Video RAM)</b></td>\n                    <td><code>A0000H – BFFFFH</code></td>\n                    <td>128 KB</td>\n                    <td>Monitör ekran kartı bellek tamponudur (CGA, EGA, VGA grafik ve metin ekran bellekleri).</td>\n                  </tr>\n                  <tr>\n                    <td><b>System Area (ROM Eklentileri)</b></td>\n                    <td><code>C0000H – DFFFFH</code></td>\n                    <td>128 KB</td>\n                    <td>Sabit disk denetleyicileri, ağ kartları ve donanım genişleme adaptörlerinin kendi ROM BIOS yazılımları.</td>\n                  </tr>\n                  <tr>\n                    <td><b>System Area (Sistem BIOS ROM)</b></td>\n                    <td><code>E0000H – FFFFFH</code></td>\n                    <td>128 KB</td>\n                    <td>Anakartın Sistem BIOS yazılımıdır. Bilgisayar ilk açıldığında (RESET) CPU otomatik olarak <b>FFFF0H</b> adresindeki komuttan başlar.</td>\n                  </tr>\n                </tbody>\n              </table>\n\n              <h4>Varsayılan Segment-Offset Eşleşmeleri (Sınav Sorusu!):</h4>\n              <p>İşlemci belleğe erişirken hangi segment yazmacı ile hangi ofset yazmacının birlikte çalışacağını donanımsal olarak bilir:</p>\n              <ul>\n                <li><code>CS : IP</code> ➔ Yürütülecek komutun getirilmesi (Instruction Fetch)</li>\n                <li><code>SS : SP</code> ➔ Yığın tepesi adresi (PUSH, POP, CALL, RET)</li>\n                <li><code>SS : BP</code> ➔ Yığın çerçevesi / yerel fonksiyon parametreleri</li>\n                <li><code>DS : BX</code> ➔ Taban adresleme ile veri okuma</li>\n                <li><code>DS : SI</code> ➔ Kaynak veri göstericisi</li>\n                <li><code>ES : DI</code> ➔ String ve blok aktarımında hedef adresi</li>\n              </ul>\n            "
      },
      {
        "title": "4. 20-Bit Fiziksel Adres Formülü & İnteraktif Hesaplama Aracı",
        "contentHtml": "\n              <p>\n                8086'nın içindeki yazmaçlar 16-bit olmasına rağmen dışarıdaki adres veriyolu 20-bit'tir. \n                İşlemci 16-bitlik bir Segment ile 16-bitlik bir Ofseti birleştirerek 20-bitlik fiziksel adresi üretir:\n              </p>\n              <div class=\"lecture-golden-rule\">\n                📐 <strong>Fiziksel Adres Formülü:</strong><br>\n                <code>Fiziksel Adres = (Segment × 10H) + Offset = (Segment × 16) + Offset</code><br>\n                <small>Mantık: Segment değeri ikilik tabanda 4 bit sola kaydırılır (sonuna bir hex 0 eklenir), ardından ofset eklenir.</small>\n              </div>\n\n              <!-- İnteraktif Adres Hesaplayıcı Kartı -->\n              <div class=\"interactive-calc-card\">\n                <div class=\"calc-card-header\">\n                  <span class=\"calc-card-badge\">⚡ Canlı İnteraktif Araç</span>\n                  <h4 class=\"calc-card-title\">20-Bit Fiziksel Adres ve Bellek Konumu Hesaplayıcı</h4>\n                </div>\n                <p style=\"font-size: 13px; color: #475569; margin-bottom: 12px;\">\n                  Segment ve Ofset değerlerini Hex (16'lık taban) olarak girin, formülün adım adım nasıl çalıştığını ve adresin 1 MB haritada nereye düştüğünü canlı olarak görün:\n                </p>\n                <div class=\"calc-input-row\">\n                  <div class=\"calc-input-group\">\n                    <label>Segment Yazmacı (Hex):</label>\n                    <input type=\"text\" id=\"input-calc-segment\" class=\"calc-input\" value=\"1234\" maxlength=\"4\" placeholder=\"örn: 1234\">\n                  </div>\n                  <div class=\"calc-input-group\">\n                    <label>Ofset Yazmacı (Hex):</label>\n                    <input type=\"text\" id=\"input-calc-offset\" class=\"calc-input\" value=\"0100\" maxlength=\"4\" placeholder=\"örn: 0100\">\n                  </div>\n                  <button type=\"button\" id=\"btn-calc-address\" class=\"btn-calc-action\">Adresi Hesapla</button>\n                </div>\n                <div id=\"calc-address-result\"></div>\n              </div>\n            "
      },
      {
        "title": "5. Little-Endian Kuralı & İnteraktif Bellek Yerleşim Aracı",
        "contentHtml": "\n              <p>\n                Intel x86 mimarisinde 16-bitlik (2 baytlık) bir kelime belleğe yazılırken baytlar şu kurala göre yerleşir:\n              </p>\n              <div class=\"lecture-golden-rule\">\n                📌 <strong>Little-Endian Altın Kuralı:</strong><br>\n                <strong>Düşük Anlamlı Bayt Düşük Adrese (Low Byte ➔ Low Address)</strong>, yüksek anlamlı bayt ise bir sonraki yüksek adrese yazılır!\n              </div>\n\n              <!-- İnteraktif Little-Endian Görselleştirici -->\n              <div class=\"interactive-calc-card\">\n                <div class=\"calc-card-header\">\n                  <span class=\"calc-card-badge\">⚡ Canlı İnteraktif Araç</span>\n                  <h4 class=\"calc-card-title\">Little-Endian Bellek Simülatörü</h4>\n                </div>\n                <p style=\"font-size: 13px; color: #475569; margin-bottom: 12px;\">\n                  16-bit bir sayı ve belleğe yazılacağı başlangıç adresini girin; işlemcinin baytları belleğe nasıl paylaştırdığını görsel olarak izleyin:\n                </p>\n                <div class=\"calc-input-row\">\n                  <div class=\"calc-input-group\">\n                    <label>16-Bit Kelime (Hex):</label>\n                    <input type=\"text\" id=\"input-endian-word\" class=\"calc-input\" value=\"5A34\" maxlength=\"4\" placeholder=\"örn: 5A34\">\n                  </div>\n                  <div class=\"calc-input-group\">\n                    <label>Başlangıç Bellek Adresi:</label>\n                    <input type=\"text\" id=\"input-endian-addr\" class=\"calc-input\" value=\"0200\" maxlength=\"4\" placeholder=\"örn: 0200\">\n                  </div>\n                  <button type=\"button\" id=\"btn-calc-endian\" class=\"btn-calc-action\">Belleğe Yerleştir</button>\n                </div>\n                <div id=\"endian-result-container\"></div>\n              </div>\n            "
      },
      {
        "title": "6. Gelecek Aşamaya Hazırlık: Veri Akışı ve İlk Komutların Mantığı",
        "contentHtml": "\n              <p>\n                Mimariyi, yazmaçları ve bellek adreslemesini öğrendiniz. Bir sonraki aşama olan <b>Aşama 2: Aritmetik İşlemler & Bayraklar</b> dersinde ilk assembly kodlarınızı yazmaya başlayacaksınız.\n              </p>\n              <p>\n                Orada göreceğiniz temel veri aktarım kuralı şudur:\n              </p>\n              <ul>\n                <li><code>MOV Hedef, Kaynak</code> komutunda veri akışı <strong>DAİMA SAĞDAN SOLA</strong> gerçekleşir. Kaynaktaki veri silinmez, kopyalanır.</li>\n                <li>Bellekten belleğe doğrudan aktarım 8086 mimarisinde yasaktır; veri mutlaka bir yazmaç üzerinden aktarılır.</li>\n              </ul>\n              <div style=\"text-align: center; margin-top: 24px;\">\n                <p style=\"font-weight: 600; color: #475569;\">Tebrikler! 8086 mimari temellerini tamamladınız. Artık bir sonraki derse geçmeye hazırsınız:</p>\n              </div>\n            "
      }
    ]
  },
  "milestone-2": {
    "milestoneId": "milestone-2",
    "milestoneNumber": 2,
    "title": "Aritmetik İşlemler & Bayraklar (ADD, ADC, SUB, SBB, MUL, DIV)",
    "subtitle": "ALU Donanım İşlemleri, 32-bit Eldeli Toplama/Çıkarma, Bayrak Analizi (CF, ZF, SF, OF) ve İşaretli Bölme/Taşma (INT 0)",
    "slideRef": "Hoca: Week 5 PPTX / w5, w11 PDF | Kitap: Barry B. Brey Bölüm 5",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 2: ALGORİTMİK HESAPLAMA & BAYRAKLAR</div>\n            <p class=\"lecture-hero-text\">\n              8086 mikroişlemcisinde tüm aritmetik hesaplamalar 16-bitlik Aritmetik Mantık Birimi (ALU) tarafından yürütülür. \n              İşlem sonucunda işlemcinin <b>Bayraklar (Flags)</b> yazmacındaki 6 durum biti (CF, PF, AF, ZF, SF, OF) donanımsal olarak güncellenir.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Sınav Kuralları:</strong><br>\n              1. <b>INC ve DEC Kuralı (Sınav Klasiği):</b> <code>INC</code> ve <code>DEC</code> komutları ZF, SF, OF, AF, PF bayraklarını günceller fakat <strong>CARRY FLAG'i (CF - Elde Bayrağı) ASLA DEĞİŞTİRMEZ!</strong> Çok kelimeli döngülerde sayaç artırılırken elde bayrağının kaybolmaması için bu özellik kasıtlı tasarlanmıştır.<br>\n              2. <b>Bölme Aşımı (Divide Overflow / INT 0):</b> Bölme işleminde bölen sayı 0 ise veya bölüm sonucu hedef yazmaca sığmıyorsa (örn: AX=3000, BL=2 yapıldığında bölüm 1500 çıkar ve 8-bitlik AL'ye sığmaz), işlemci otomatik olarak <strong>Interrupt 0 (Divide Error)</strong> üretir!<br>\n              3. <b>İşaret Genişletme:</b> <code>IDIV</code> komutundan önce negatif sayıların işaretini yaymak için byte için <code>CBW</code>, word için <code>CWD</code> kullanılmalıdır.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. ALU Mimarisi ve Aritmetik Durum Bayrakları (CF, ZF, SF, OF, AF, PF)",
        "contentHtml": "\n                  <p>8086 ALU'su bir aritmetik işlem yürüttüğünde sonuç yazmaca yazılırken bayraklar şu kurallarla kurulur:</p>\n                  <table class=\"lecture-table\">\n                    <thead>\n                      <tr><th>Bayrak</th><th>Adı</th><th>Kurulma (1 Olma) Durumu</th><th>Sınav Örnek Senaryosu</th></tr>\n                    </thead>\n                    <tbody>\n                      <tr><td><code>CF</code></td><td>Carry Flag (Elde)</td><td>İşaretsiz toplama işleminde MSB'den dışarı elde çıktığında veya çıkarmada borç alındığında 1 olur.</td><td><code>FFh + 01h = 100h</code> (AL=00h, CF=1).</td></tr>\n                      <tr><td><code>ZF</code></td><td>Zero Flag (Sıfır)</td><td>İşlem sonucu tamamen sıfır çıktığında 1 olur.</td><td><code>SUB AX, AX</code> sonucu AX=0 ve ZF=1 olur.</td></tr>\n                      <tr><td><code>SF</code></td><td>Sign Flag (İşaret)</td><td>Sonucun en yüksek biti (MSB: 8-bitte bit 7, 16-bitte bit 15) 1 ise (negatifse) 1 olur.</td><td><code>5 - 10 = -5</code> sonucunda SF=1.</td></tr>\n                      <tr><td><code>OF</code></td><td>Overflow Flag (Taşma)</td><td>İşaretli iki sayı toplandığında/çıkarıldığında kapasite aşıldığında 1 olur ($+ + + = -$ veya $- + - = +$).</td><td>İşaretli <code>7Fh (+127) + 01h = 80h (-128)</code> $\\rightarrow$ OF=1.</td></tr>\n                      <tr><td><code>AF</code></td><td>Auxiliary Carry</td><td>Bit 3'ten Bit 4'e (düşük nibble'dan yüksek nibble'a) elde çıktığında 1 olur (BCD düzeltmeleri için).</td><td><code>DAA</code> ve <code>DAS</code> komutları AF'yi okur.</td></tr>\n                      <tr><td><code>PF</code></td><td>Parity Flag (Eşlik)</td><td>Sonucun düşük baytındaki (bit 0–7) toplam 1 sayısının adedi <b>ÇİFT</b> ise 1 olur.</td><td>Seri iletişimde hata sezme.</td></tr>\n                    </tbody>\n                  </table>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: Aritmetik Komutlar & Sınav Tuzakları (ADD, ADC, SUB, SBB, MUL, DIV, CBW, CWD)",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4><code>ADD</code> ve <code>ADC</code> — Toplama ve Eldeli Toplama</h4>\n                    <ul>\n                      <li><code>ADD Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef + Kaynak$. Tüm 6 durum bayrağını günceller.</li>\n                      <li><code>ADC Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef + Kaynak + CF$. 32-bit veya daha geniş çok kelimeli sayılarda alt parçadan gelen eldeyi üst parçaya eklemek için kullanılır.</li>\n                      <li><b>32-Bit Toplama Kalıbı (Slayt 9):</b>\n                        <pre><code>ADD AX, CX     ; Dusuk 16-bitleri topla (AX = AX + CX), CF kurulur\nADC DX, BX     ; Yuksek 16-bitleri elde ile topla (DX = DX + BX + CF)</code></pre>\n                      </li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>SUB</code>, <code>SBB</code> ve <code>CMP</code> — Çıkarma, Borçlu Çıkarma ve Karşılaştırma</h4>\n                    <ul>\n                      <li><code>SUB Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef - Kaynak$.</li>\n                      <li><code>SBB Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef - Kaynak - CF$. Çok kelimeli çıkarmada alt parçadan gelen borcu (CF) düşer.</li>\n                      <li><code>CMP Hedef, Kaynak</code> $\\rightarrow$ Çıkarma işlemi ($Hedef - Kaynak$) yapar ancak <b>sonucu hiçbir yere yazmaz</b>, sadece bayrakları (CF, ZF, SF, OF) günceller. Koşullu atlamalardan önce karar vermek için kullanılır.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>INC</code> ve <code>DEC</code> — Bir Artırma ve Bir Azaltma</h4>\n                    <ul>\n                      <li><code>INC Hedef</code> ($Hedef = Hedef + 1$) | <code>DEC Hedef</code> ($Hedef = Hedef - 1$).</li>\n                      <li><b>⚠️ Altın Kural:</b> CF (Carry Flag) bayrağını <strong>ASLA ETKİLEMEZ!</strong> ZF, SF, OF, AF, PF etkilenir.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>MUL</code> ve <code>IMUL</code> — Çarpma İşlemleri</h4>\n                    <ul>\n                      <li><b>8-Bit Çarpma:</b> <code>MUL r/m8</code> $\\rightarrow$ $AX = AL \\times r/m8$. (Çarpan AL'dedir, 16-bit sonuç AX'e yazılır).</li>\n                      <li><b>16-Bit Çarpma:</b> <code>MUL r/m16</code> $\\rightarrow$ $DX:AX = AX \\times r/m16$. (Çarpan AX'tedir; sonucun üst 16 biti DX'e, alt 16 biti AX'e yazılır).</li>\n                      <li><code>IMUL</code> işaretli (2'ye tümleyen) çarpmadır.</li>\n                      <li><b>Bayrak Etkisi:</b> Sonucun üst yarısı anlamlı veri içeriyorsa (sıfır değilse) CF=1 ve OF=1 olur, aksi halde 0 olur.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>DIV</code>, <code>IDIV</code>, <code>CBW</code> ve <code>CWD</code> — Bölme ve İşaret Genişletme</h4>\n                    <ul>\n                      <li><b>8-Bit Bölme (Bölünen AX, Bölen r/m8):</b>\n                        <br>Bölüm $\\rightarrow$ <code>AL</code>, Kalan $\\rightarrow$ <code>AH</code>.\n                      </li>\n                      <li><b>16-Bit Bölme (Bölünen DX:AX, Bölen r/m16):</b>\n                        <br>Bölüm $\\rightarrow$ <code>AX</code>, Kalan $\\rightarrow$ <code>DX</code>.\n                      </li>\n                      <li><b>İşaret Genişletme Komutları (IDIV Öncesi Şarttır):</b>\n                        <ul>\n                          <li><code>CBW</code> (Convert Byte to Word): AL'deki 8-bit sayının işaretini (bit 7) AH'ye yayarak 16-bit AX yapar.</li>\n                          <li><code>CWD</code> (Convert Word to Doubleword): AX'teki 16-bit sayının işaretini DX'e yayarak 32-bit DX:AX yapar.</li>\n                        </ul>\n                      </li>\n                      <li><b>⚠️ Bölme Taşması (Divide Overflow / INT 0):</b> Bölen 0 ise VEYA bölüm sonucu hedef yazmaca sığmıyorsa (örn: 8-bit bölmede bölüm > 255 ise) CPU donanımsal <b>INT 0 (Bölme Hatası)</b> üretir!</li>\n                    </ul>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde aritmetik komutları test edebilirsiniz. <b>Cevap hazır gelmez</b>; yönergeleri takip ederek kodunuzu yazın.</p>\n                ",
        "examples": [
          {
            "id": "ex-m2-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 2.1: 32-bit Eldeli Toplama (ADD & ADC)",
            "scenario": "8086 16-bitlik bir işlemci olduğu için 32-bit sayılar iki parça halinde toplanır. Düşük kelimeden doğacak eldenin yüksek kelimeye aktarılması gerekir.",
            "task": "Düşük kelimeleri (AX=0FFFFh ve CX=0002h) ADD ile toplayın. Yüksek kelimeleri (DX=0001h ve BX=0003h) ADC ile toplayarak 32-bitlik toplamı DX:AX içinde elde edin.",
            "code": "; 🟢 Kolay: 32-bit Eldeli Toplama\nORG 100H\n\n; 1. Ilk 32-bit sayiyi yukleyin (DX:AX = 0001FFFFh):\nMOV DX, 0001H\nMOV AX, 0FFFFH\n\n; 2. Ikinci 32-bit sayiyi yukleyin (BX:CX = 00030002h):\nMOV BX, 0003H\nMOV CX, 0002H\n\n; 3. Dusuk 16-bitleri toplayin (AX = AX + CX):\n; TODO: Buraya ADD komutunu yazin\n\n\n; 4. Yuksek 16-bitleri elde ile toplayin (DX = DX + BX + CF):\n; TODO: Buraya ADC komutunu yazin\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV DX, 0001H\nMOV AX, 0FFFFH\nMOV BX, 0003H\nMOV CX, 0002H\nADD AX, CX\nADC DX, BX\nHLT",
            "solutionBreakdown": [
              "1-4. Satırlar: 32-bit sayılar DX:AX ve BX:CX yazmaç çiftlerine paylaştırılır.",
              "5. Satır: ADD AX, CX — FFFFh + 0002h = 0001h olur ve Carry Flag (CF=1) kurulur.",
              "6. Satır: ADC DX, BX — DX = 0001h + 0003h + CF(1) = 0005h olur.",
              "Sonuç: DX:AX = 00050001h (32-bit doğru toplam elde edilir)."
            ],
            "examTips": "Sınavda 32-bit toplama sorulduğunda düşük parçada ADD, yüksek parçada ise önceki eldenin kaybolmaması için kesinlikle ADC kullanılmalıdır!"
          },
          {
            "id": "ex-m2-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 2.2: Karmaşık Aritmetik Formül Hesabı ((5 + 3) * 4) - 6",
            "scenario": "Hocanın ders notlarında (Week 10 Kod Örneği 4) yer alan standart aritmetik hiyerarşi formülünün 8-bit register mimarisi üzerinde çözülmesi gerekmektedir.",
            "task": "AX içine 5 değerini yükleyin. 3 ile toplayın. Sonucu 4 ile çarpın. Çıkan sonuçtan 6 çıkarın. Sonucu AX yazmacında bırakın.",
            "code": "; 🟡 Orta: Karmaşık Aritmetik Hesap ((5 + 3) * 4) - 6\nORG 100H\n\n; 1. AX icine 5 yukleyin ve 3 ekleyin:\n; TODO:\n\n\n; 2. Sonucu 4 ile carpmak icin BL'ye 4 yukleyin ve carpin (MUL BL):\n; TODO:\n\n\n; 3. Sonuctan 6 cikarin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 5\nADD AX, 3\nMOV BL, 4\nMUL BL\nSUB AX, 6\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 5 ve ADD AX, 3 — AX = 8 olur.",
              "2. Satır: MOV BL, 4 ve MUL BL — AL (8) * BL (4) = 32 (20h), sonuç AX içine yazılır.",
              "3. Satır: SUB AX, 6 — 32 - 6 = 26 (1Ah) elde edilir."
            ],
            "examTips": "8-bit MUL işleminde çarpan yazmacı (örn: BL) belirtilir, çarpılan ise DAİMA AL yazmacıdır. 16-bit sonuç AX'e yazılır."
          },
          {
            "id": "ex-m2-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / Sinyal İşleme",
            "title": "Alıştırma 2.3: İşaretli Bölme & CBW ile Sıcaklık Ortalaması Hesabı",
            "scenario": "Negatif sıcaklık değerleri üreten bir sensörden okunan 8-bitlik işaretli bir değer (-50, yani CEh) 5'e bölünecektir. Bölme öncesinde işaretin bozulmaması için CBW ile AX genişletilmeli ve IDIV ile bölünmelidir.",
            "task": "AL içine -50 yükleyin. CBW komutu ile 16-bit AX'e işaret genişletmesi yapın. BL içine 5 yükleyin ve IDIV BL ile bölün. Bölüm AL'de, kalan AH'de oluşsun.",
            "code": "; 🔴 Zor: Isaretli Bolme ve CBW\nORG 100H\n\n; 1. AL icine -50 yukleyin:\n; TODO:\n\n\n; 2. CBW komutu ile AL'nin isaretini AH'ye yayin:\n; TODO:\n\n\n; 3. BL icine 5 yukleyin ve isaretli bolme yapin (IDIV BL):\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AL, -50\nCBW\nMOV BL, 5\nIDIV BL\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AL, -50 — AL = CEh (-50'nin 2'ye tümleyeni) olur.",
              "2. Satır: CBW — AL negatif olduğundan (bit 7 = 1), AH = FFh yapılır. AX = FFCEh (-50 16-bit) olur.",
              "3. Satır: IDIV BL — -50 / 5 = -10 (F6h) bölüm AL içine, 0 kalan AH içine yazılır."
            ],
            "examTips": "İşaretli bölmede (IDIV) CBW unutulursa AH'de önceki çöpler kalır ve pozitif sayı gibi işlem görür, sonuç tamamen yanlış çıkar!"
          }
        ]
      }
    ]
  },
  "milestone-3": {
    "milestoneId": "milestone-3",
    "milestoneNumber": 3,
    "title": "Mantıksal İşlemler, Maskeleme & Adresleme Modları (AND, OR, XOR, TEST, SHL, SHR, SAR, ROTATE)",
    "subtitle": "The Seven Data-Addressing Modes, Bit Düzeyinde Donanım Maskeleme, Hızlı 2^n Çarpma/Bölme ve Döndürme Komutları",
    "slideRef": "Hoca: Week 3 & 5 PPTX / w3, w3extra, w5, w10 PDF | Kitap: Barry B. Brey Bölüm 3 & 5",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 3: ADRESLEME MODLARI & BİT MANİPÜLASYONU</div>\n            <p class=\"lecture-hero-text\">\n              8086 mikroişlemcisinde verinin nerede bulunduğunu (yazmaç, ivedi sabit veya bellek) ve belleğe nasıl erişileceğini <b>Veri Adresleme Modları</b> belirler. \n              Mantıksal komutlar ise donanım portlarındaki durum bitlerini filtrelemek (maskelemek), tek bir biti 1 veya 0 yapmak için kullanılır.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Kuralları & Sınav Kılavuzu:</strong><br>\n              1. <b>Sıfırlamada Hız:</b> <code>MOV AX, 0</code> yerine <code>XOR AX, AX</code> kullanmak hem program kodunu küçültür (2 bayt vs 3 bayt) hem de işlemci saat çevriminde daha hızlıdır.<br>\n              2. <b>SAR vs SHR Farkı (Sınav Sorusu):</b> <code>SHR</code> sağa kaydırırken soldan daima 0 sokar (işaretsiz bölme). <code>SAR</code> (Aritmetik Sağa Kaydırma) ise en yüksek biti (işaret bitini) koruyarak sağa kaydırır (işaretli sayıyı 2'ye bölme).<br>\n              3. <b>NOT vs NEG Farkı:</b> <code>NOT</code> komutu 1'e tümleyenini alır ve <strong>HİÇBİR BAYRAĞI ETKİLEMEZ!</strong> <code>NEG</code> komutu ise 2'ye tümleyenini ($0 - Dest$) alır ve CF dahil bayrakları kurar.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. The Seven Data-Addressing Modes & Program Memory Addressing (Hocanın 7 Modu)",
        "contentHtml": "\n                  <p>Hocanızın Week 3 sunumunda ve ders notlarında listelenen <b>7 Veri Adresleme Modu</b> şunlardır:</p>\n                  <table class=\"lecture-table\">\n                    <thead>\n                      <tr><th>No</th><th>Adresleme Modu</th><th>Örnek Komut</th><th>Açıklama</th></tr>\n                    </thead>\n                    <tbody>\n                      <tr><td>1</td><td><b>Register Addressing</b></td><td><code>MOV AX, BX</code></td><td>Veri tamamen CPU yazmaçları arasında aktarılır. En hızlı moddur.</td></tr>\n                      <tr><td>2</td><td><b>Immediate Addressing</b></td><td><code>MOV AL, 22H</code></td><td>Sabit sayı doğrudan komutun içine gömülüdür (makine kodunda taşınır).</td></tr>\n                      <tr><td>3</td><td><b>Direct Addressing</b></td><td><code>MOV [1234H], AX</code></td><td>Verinin bellekteki ofset adresi komutta açıkça belirtilmiştir.</td></tr>\n                      <tr><td>4</td><td><b>Register Indirect Addressing</b></td><td><code>MOV [BX], CL</code></td><td>Bellek adresi bir gösterici yazmaçta (BX, BP, SI, DI) tutulur.</td></tr>\n                      <tr><td>5</td><td><b>Base-Plus-Index Addressing</b></td><td><code>MOV [BX+SI], SP</code></td><td>Bir taban yazmacı (BX veya BP) ile bir indeks yazmacı (SI veya DI) toplanarak adres bulunur.</td></tr>\n                      <tr><td>6</td><td><b>Register Relative Addressing</b></td><td><code>MOV [BX+4], AX</code></td><td>Bir gösterici yazmaca sabit bir deplasman (ofset) eklenir (dizi/tablo erişimi).</td></tr>\n                      <tr><td>7</td><td><b>Base Relative-Plus-Index</b></td><td><code>MOV [BX+DI+4], CX</code></td><td>Taban + İndeks + Deplasman birleştirilir (2 boyutlu matris/kayıt erişimi).</td></tr>\n                    </tbody>\n                  </table>\n\n                  <h4>Program Bellek Adresleme Modları (JMP / CALL için):</h4>\n                  <ul>\n                    <li><b>Direct Program Memory:</b> <code>JMP FAR PTR TARGET</code> (Yeni CS ve IP komutta sabittir).</li>\n                    <li><b>Relative Program Memory:</b> <code>JMP LABEL</code> (Mevcut IP'ye göre $+2$ veya $-5$ gibi bağıl atlama).</li>\n                    <li><b>Indirect Program Memory:</b> <code>JMP AX</code> veya <code>JMP [BX]</code> (Atlanacak hedef adres yazmaçta veya bellektedir).</li>\n                  </ul>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: Mantıksal ve Bit Kaydırma Komutları (AND, OR, XOR, TEST, SHL, SHR, SAR, ROL, ROR, RCL, RCR)",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4><code>AND</code>, <code>OR</code>, <code>XOR</code> ve <code>TEST</code></h4>\n                    <ul>\n                      <li><code>AND Hedef, Kaynak</code>: İki operant arasında bit düzeyinde VE işlemi yapar. İstenmeyen bitleri sıfırlamak (maskelemek) için kullanılır. Örnek: ASCII rakamı BCD'ye dönüştürme: <code>AND AL, 0FH</code>.</li>\n                      <li><code>OR Hedef, Kaynak</code>: Belirli bitleri 1 yapmak için kullanılır.</li>\n                      <li><code>XOR Hedef, Kaynak</code>: Bitleri terslemek veya bir yazmacı hızlıca sıfırlamak için kullanılır (<code>XOR AX, AX</code>).</li>\n                      <li><code>TEST Hedef, Kaynak</code>: <code>AND</code> işlemi yapar fakat <b>sonucu hedefe YAZMAZ</b>. Yalnızca Zero Flag (ZF), Sign Flag (SF) ve Parity Flag (PF) bayraklarını kurar. Donanım durum bitlerini denetlemek için kullanılır.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>SHL</code>, <code>SHR</code> ve <code>SAR</code> — Bit Kaydırma Komutları</h4>\n                    <ul>\n                      <li><code>SHL Hedef, 1</code> (veya <code>SHL Hedef, CL</code>): Sola mantıksal kaydırır. Sağdan 0 girer, en soldan çıkan bit Carry Flag'e (CF) gider. <b>Sayıyı 2 ile çarpar.</b></li>\n                      <li><code>SHR Hedef, 1</code>: Sağa mantıksal kaydırır. Soldan 0 girer, en sağdan çıkan bit CF'ye gider. <b>İşaretsiz sayıyı 2'ye böler.</b></li>\n                      <li><code>SAR Hedef, 1</code>: Sağa aritmetik kaydırır. <b>En soldaki işaret bitini (bit 7 veya 15) KORUR</b> ve sağa yayar. <b>İşaretli negatif/pozitif sayıyı 2'ye böler.</b></li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>ROL</code>, <code>ROR</code>, <code>RCL</code> ve <code>RCR</code> — Döngüsel Kaydırma Komutları</h4>\n                    <ul>\n                      <li><code>ROL</code> / <code>ROR</code>: Bitler bir uçtan çıkıp diğer uca girer (halka şeklinde döner).</li>\n                      <li><code>RCL</code> / <code>RCR</code>: Bitler Carry Flag (CF) ile birlikte 9-bitlik (byte için) veya 17-bitlik (word için) geniş bir döngüde kayar. Çok kelimeli (32-bit, 48-bit) sayıları sola/sağa kaydırmada kullanılır.</li>\n                    </ul>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde mantıksal ve bit kaydırma komutlarını deneyebilirsiniz. <b>Cevap hazır gelmez</b>; yönergeleri izleyerek kodunuzu tamamlayın.</p>\n                ",
        "examples": [
          {
            "id": "ex-m3-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 3.1: Hızlı 2 ile Çarpma (SHL) ve 4'e Bölme (SHR) & Sıfırlama",
            "scenario": "Hocanın ders notlarında (Week 10 Kod Örneği 5) yer alan donanımsal kaydırma aritmetiği uygulanacaktır.",
            "task": "AX içine 12 yükleyin. SHL AX, 1 ile 2 ile çarpın (24 olsun). SHR AX, 2 ile 4'e bölün (6 olsun). Son olarak XOR BX, BX ile BX yazmacını sıfırlayın.",
            "code": "; 🟢 Kolay: Hizli Carpma/Bolme ve Sifirlama\nORG 100H\n\n; 1. AX icine 12 yukleyin:\n; TODO:\n\n\n; 2. AX'i 1 bit sola kaydirin (SHL AX, 1 -> sayi 2 ile carpilir):\n; TODO:\n\n\n; 3. AX'i 2 bit saga kaydirin (SHR AX, 2 -> sayi 4'e bolunur):\n; TODO:\n\n\n; 4. BX yazmacini XOR ile tek komutta sifirlayin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 12\nSHL AX, 1\nSHR AX, 2\nXOR BX, BX\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 12 — Başlangıç değeri yüklenir.",
              "2. Satır: SHL AX, 1 — Sayı sola 1 bit kayarak 2 ile çarpılır (AX = 24).",
              "3. Satır: SHR AX, 2 — Sayı sağa 2 bit kayarak 4'e bölünür (AX = 6).",
              "4. Satır: XOR BX, BX — BX yazmacı sıfırlanır (BX = 0000h) ve ZF=1 olur."
            ],
            "examTips": "Sınavda 2'nin kuvvetleriyle çarpma ve bölmelerde MUL/DIV yerine SHL/SHR kullanılması hem daha az çevrim tüketir hem de daha az kod üretir."
          },
          {
            "id": "ex-m3-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 3.2: ASCII Rakamı BCD'ye Çevirme (AND) & Parity (PF) Kontrolü",
            "scenario": "Klavyeden okunan ASCII formatındaki bir rakam karakterinin ('7', yani 37h) nümerik BCD değerine (07h) dönüştürülmesi ve en düşük bitinin TEST ile kontrol edilmesi gerekmektedir.",
            "task": "AL içine '7' (37h) yükleyin. AND AL, 0FH komutu ile yüksek nibble'ı temizleyin. Ardından TEST AL, 01H ile sayının tek/çift olduğunu test edip HLT ile durun.",
            "code": "; 🟡 Orta: ASCII-BCD Donusumu ve Bit Testi\nORG 100H\n\n; 1. AL icine '7' (37h) yukleyin:\n; TODO:\n\n\n; 2. AND komutu ile yuksek 4 biti maskeleyin (0Fh ile AND yapin):\n; TODO:\n\n\n; 3. TEST komutu ile AL'nin 0. bitini (tek/cift) test edin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AL, '7'\nAND AL, 0FH\nTEST AL, 01H\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AL, '7' — AL = 37h olur.",
              "2. Satır: AND AL, 0FH — 37h AND 0Fh = 07h (Sayı saf BCD rakamına dönüşür).",
              "3. Satır: TEST AL, 01H — 7'nin son biti 1 olduğundan sonuç 1 çıkar, Zero Flag sıfırlanır (ZF=0)."
            ],
            "examTips": "ASCII rakamlarını ('0'-'9', yani 30h-39h) saf sayıya dönüştürmenin standart yolu AND AL, 0FH komutudur."
          },
          {
            "id": "ex-m3-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / Bitwise Kombinasyonlar",
            "title": "Alıştırma 3.3: Donanım Portu Bit Maskeleme Kombinasyonu (Hocanın Kod PDF'i Örnek 6)",
            "scenario": "Hocanın sınav/lab kod belgesindeki Hafta 10 Örnek 6'da yer alan donanım portu filtreleme algoritması uygulanacaktır.",
            "task": "AX içine 0FFFFh yükleyin. Sırasıyla AND AX, 0F0F0h, OR AX, 0F00Fh, XOR AX, 0FFFFh ve NOT AX işlemlerini uygulayarak bayrak ve yazmaç durumunu izleyin.",
            "code": "; 🔴 Zor: Donanim Bitwise Kombinasyonlari (Hocanin Ornek 6'si)\nORG 100H\n\n; 1. AX icine 0FFFFh yukleyin:\n; TODO:\n\n\n; 2. AND AX, 0F0F0h ile belirli bitleri maskeleyin:\n; TODO:\n\n\n; 3. OR AX, 0F00Fh ile kose bitleri set edin:\n; TODO:\n\n\n; 4. XOR AX, 0FFFFh ile tum bitleri tersleyin:\n; TODO:\n\n\n; 5. NOT AX ile bitleri tekrar tersleyip orjinale dondurun:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 0FFFFH\nAND AX, 0F0F0H\nOR AX, 0F00FH\nXOR AX, 0FFFFH\nNOT AX\nHLT",
            "solutionBreakdown": [
              "1. Satır: AX = FFFFh yüklenir.",
              "2. Satır: AND AX, 0F0F0h — AX = F0F0h olur.",
              "3. Satır: OR AX, 0F00Fh — AX = F0FFh olur.",
              "4. Satır: XOR AX, 0FFFFh — F0FFh XOR FFFFh = 0F00h olur.",
              "5. Satır: NOT AX — 0F00h terslenerek AX = F0FFh değerine geri döner."
            ],
            "examTips": "NOT komutunun bayrakları asla değiştirmediğini, fakat AND/OR/XOR komutlarının ZF, SF, PF bayraklarını kurduğunu unutmayın."
          }
        ]
      }
    ]
  },
  "milestone-4": {
    "milestoneId": "milestone-4",
    "milestoneNumber": 4,
    "title": "Yığın (Stack) & Prosedür Çağrıları (PUSH, POP, CALL, RET, Stack Frame)",
    "subtitle": "LIFO Bellek Organizasyonu, SS:SP Mekaniği, Donanımsal Saklama Sırası, Aktivasyon Kaydı (Stack Frame) ve RET n",
    "slideRef": "Hoca: Week 3 & 4 PPTX / w3, w4, w6, w11 PDF | Kitap: Barry B. Brey Bölüm 4 & 6",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 4: YIĞIN (STACK) VE PROSEDÜR ÇAĞRILARI</div>\n            <p class=\"lecture-hero-text\">\n              Yığın (Stack), <b>Son Giren İlk Çıkar (LIFO - Last In First Out)</b> kuralıyla çalışan bellek bölgesidir. \n              İşlemci; fonksiyon çağrılarında dönüş adresini (IP/CS), yazmaç durumlarını ve fonksiyon parametrelerini yığında saklar.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Kuralları & Sınav Kılavuzu:</strong><br>\n              1. <b>Yığının Yönü:</b> 8086 mimarisinde yığın <strong>YÜKSEK ADRESTEN DÜŞÜK ADRESE DOĞRU BÜYÜR</strong>. <code>PUSH</code> komutu SP'yi 2 AZALTIR (SP = SP - 2), <code>POP</code> komutu SP'yi 2 ARTIRIR (SP = SP + 2).<br>\n              2. <b>Donanımsal Sıralama (PUSHA/POPA):</b> <code>PUSHA</code> komutu yazmaçları yığına <code>AX, CX, DX, BX, SP, BP, SI, DI</code> sırasıyla iter. <code>POPA</code> ise yığından tam ters sırada çeker.<br>\n              3. <b>Stack Frame & Parametre Temizleme (RET n):</b> Fonksiyona yığın üzerinden parametre geçildiğinde, fonksiyon sonundaki <code>RET n</code> komutu dönüş adresini çektikten sonra SP'ye $n$ bayt ekleyerek yığını tek adımda temizler.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. Yığın Mimarisi (LIFO), SS:SP ve Yığının Aşağı Büyümesi",
        "contentHtml": "\n                  <p>Yığın bellek alanı, <code>SS (Stack Segment)</code> segment yazmacı ve <code>SP (Stack Pointer)</code> ofset yazmacı ile adreslenir:</p>\n                  <ul>\n                    <li><b>Fiziksel Yığın Adresi Formülü:</b> <code>Fiziksel Adres = (SS × 10H) + SP</code>.</li>\n                    <li><b>16-Bit Kelime Kuralı:</b> 8086 mimarisinde yığına 8-bitlik tek bir bayt itilemez. PUSH ve POP işlemleri daima 16-bit (2 bayt) kelimeler üzerinde gerçekleşir.</li>\n                    <li><b>Yığının Boşalması ve Taşması:</b> Yığın doldukça SP küçülür (0000h'a yaklaşır). Yığın boşaldıkça SP büyür.</li>\n                  </ul>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: Yığın ve Prosedür Komutları (PUSH, POP, PUSHA, POPA, PUSHF, POPF, CALL, RET, RET n)",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4><code>PUSH</code> ve <code>POP</code></h4>\n                    <ul>\n                      <li><code>PUSH Kaynak</code>: SP = SP - 2 yapılır, ardından 16-bit veri <code>[SS:SP]</code> adresine yazılır.</li>\n                      <li><code>POP Hedef</code>: <code>[SS:SP]</code> adresindeki 16-bit veri hedefe okunur, ardından SP = SP + 2 yapılır.</li>\n                      <li><b>Stack ile Takas Kalıbı (Slayt 34 & Kod PDF'i Örnek 18):</b>\n                        <pre><code>PUSH AX     ; Once AX yigina atilir\nPUSH BX     ; Sonra BX yigina atilir\nPOP AX      ; Yiginin tepesindeki BX degeri AX'e cikar!\nPOP BX      ; Ilk atilan AX degeri BX'e cikar! (Takas tamamlandi)</code></pre>\n                      </li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>PUSHA</code> ve <code>POPA</code> — Tüm Genel Yazmaçları Saklama</h4>\n                    <ul>\n                      <li><code>PUSHA</code>: 8 adet genel amaçlı yazmacı yığına şu kesin sırayla iter: <b>AX, CX, DX, BX, SP (orijinal), BP, SI, DI</b> (toplam 16 bayt yer kaplar).</li>\n                      <li><code>POPA</code>: Yığından sırayla geri çeker: <b>DI, SI, BP, (orijinal SP atlanır), BX, DX, CX, AX</b>.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>PUSHF</code> ve <code>POPF</code> — Bayrakları Saklama</h4>\n                    <ul>\n                      <li><code>PUSHF</code>: 16-bitlik Flags yazmacının tamamını yığına iter.</li>\n                      <li><code>POPF</code>: Yığından 16-bitlik kelimeyi çeker ve Flags yazmacına yükler.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>CALL</code>, <code>RET</code> ve <code>RET n</code> — Prosedür Çağırma ve Dönüş</h4>\n                    <ul>\n                      <li><b>Near CALL:</b> Yürütülmekte olan komutun hemen sonrasındaki <code>IP</code> adresini yığına iter ve hedef ofsete atlar. <b>Near RET:</b> Yığından <code>IP</code>'yi çeker.</li>\n                      <li><b>Far CALL:</b> Önce <code>CS</code>, sonra <code>IP</code> yığına itilir. <b>Far RET:</b> Önce <code>IP</code>, sonra <code>CS</code> yığından çekilir.</li>\n                      <li><b><code>RET n</code> (Callee Clean-up):</b> Dönüş adresini çektikten sonra <code>SP = SP + n</code> yapar. Fonksiyona yığından aktarılan $n$ baytlık parametreleri tek adımda temizlemek için kullanılır.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4>Standart Aktivasyon Kaydı (Stack Frame)</h4>\n                    <pre><code>Prosedur:\n  PUSH BP          ; Onceki cerceve gostericisini sakla\n  MOV BP, SP       ; Yeni cerceveyi yigin tepesine sabitle\n  MOV AX, [BP+4]   ; Yigindaki son parametreye eris\n  MOV BX, [BP+6]   ; Yigindaki ilk parametreye eris\n  ...\n  POP BP           ; Eski cerceveyi geri yukle\n  RET n            ; Parametreleri temizleyerek don</code></pre>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde yığın mekanizmasını ve prosedür çağrılarını test edin. <b>Cevap hazır gelmez</b>; yönergeleri izleyin.</p>\n                ",
        "examples": [
          {
            "id": "ex-m4-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 4.1: Stack ile Register Değiş Tokuşu (Hocanın Slayt 34 ve Örnek 18'i)",
            "scenario": "Hocanın Week 3 sunumunda ve kod belgesindeki Hafta 11 Örnek 18'de yer alan stack tabanlı LIFO takas algoritması uygulanacaktır.",
            "task": "AX içine 1111h, BX içine 2222h yükleyin. Sırasıyla PUSH AX ve PUSH BX yapın. Ardından POP AX ve POP BX yaparak değerleri takas edin ve HLT ile durun.",
            "code": "; 🟢 Kolay: Stack ile Register Degis Tokusu (Hocanin Ornek 18'i)\nORG 100H\n\n; 1. AX icine 1111H, BX icine 2222H yukleyin:\n; TODO:\n\n\n; 2. Once AX'i, ardindan BX'i yigina itin (PUSH):\n; TODO:\n\n\n; 3. Once AX'e, ardindan BX'e yigindan cekin (POP) - LIFO geregi yer degisirler:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 1111H\nMOV BX, 2222H\nPUSH AX\nPUSH BX\nPOP AX\nPOP BX\nHLT",
            "solutionBreakdown": [
              "1. Satır: AX = 1111h, BX = 2222h yüklenir.",
              "2. Satır: PUSH AX — Yığına 1111h atılır (SP 2 azalır).",
              "3. Satır: PUSH BX — Yığına 2222h atılır (yığının tepesinde artık 2222h var).",
              "4. Satır: POP AX — Yığının tepesindeki 2222h AX içine çekilir!",
              "5. Satır: POP BX — Yığında kalan 1111h BX içine çekilir! (Takas tamamlandı)."
            ],
            "examTips": "LIFO mantığında en son atılan (PUSH BX) ilk çekilir (POP AX). Bu sayede üçüncü bir yazmaç olmadan takas yapılır."
          },
          {
            "id": "ex-m4-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 4.2: Toplama Prosedürü Çağrısı (CALL & RET - Hocanın Örnek 17'si)",
            "scenario": "Hocanın kod belgesindeki Hafta 11 Örnek 17'de yer alan 'sumAxBx' alt programı yazılacak ve çağrılacaktır.",
            "task": "AX içine 10, BX içine 20 yükleyin. CALL sumAxBx ile alt rutine gidin. Alt rutinde DX içine AX ve BX'i toplayarak ekleyin ve RET ile dönün. Ana programda HLT ile durun.",
            "code": "; 🟡 Orta: Prosedur Cagrisi ve Toplama (Hocanin Ornek 17'si)\nORG 100H\n\n; 1. AX icine 10, BX icine 20, DX icine 0 yukleyin:\n; TODO:\n\n\n; 2. sumAxBx alt programini CALL ile cagirin:\n; TODO:\n\n\n; 3. Fonksiyon donusunde islemi durdurun:\nHLT\n\n; --- sumAxBx Alt Programi ---\nsumAxBx:\n; 4. DX icine AX ve BX degerlerini toplayarak ekleyin:\n; TODO:\n\n\n; 5. RET komutu ile cagiran noktaya geri donun:\n; TODO:\n",
            "solutionCode": "ORG 100H\nMOV AX, 10\nMOV BX, 20\nMOV DX, 0\nCALL sumAxBx\nHLT\n\nsumAxBx:\nADD DX, AX\nADD DX, BX\nRET",
            "solutionBreakdown": [
              "1. Satır: Girdi yazmaçları hazırlanır (AX=10, BX=20, DX=0).",
              "2. Satır: CALL sumAxBx — Dönüş adresi yığına itilir ve sumAxBx etiketine atlanır.",
              "3. Satır: sumAxBx içinde ADD DX, AX ve ADD DX, BX ile DX = 30 hesaplanır.",
              "4. Satır: RET — Yığındaki dönüş adresi IP'ye geri yüklenir ve program HLT komutuna döner."
            ],
            "examTips": "CALL komutunun IP'yi yığına ittiğini, RET komutunun ise yığındaki adresi çekip IP'ye yazarak geri döndüğünü unutmayın."
          },
          {
            "id": "ex-m4-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / Stack Frame & RET n",
            "title": "Alıştırma 4.3: Stack Frame Mimarisi & Yığından Parametre Temizleme (RET n)",
            "scenario": "Gömülü sistemlerde ve derleyicilerde (C calling convention) fonksiyonlara parametreler yığın üzerinden geçirilir. Prosedür BP üzerinden parametreleri okur, hesaplar ve RET 4 ile yığını tek adımda temizleyerek döner.",
            "task": "Ana programda yığına sırasıyla 1000h ve 2000h parametrelerini itin (PUSH). CALL AddParams ile prosedürü çağırın. Prosedür içinde PUSH BP ve MOV BP, SP ile stack frame kurun. Parametreleri [BP+4] ve [BP+6] üzerinden AX ve BX'e okuyun. DX içinde toplayın. POP BP yapın ve RET 4 komutu ile yığını temizleyerek dönün. (SADECE Aşama 1-4 komutları).",
            "code": "; 🔴 Zor: Stack Frame & RET n Callee Cleanup\nORG 100H\n\n; 1. Yigina sirasiyla 1000h ve 2000h parametrelerini itin (PUSH):\n; TODO:\n\n\n; 2. AddParams prosedurunu CALL ile cagirin:\n; TODO:\n\n\n; 3. Fonksiyon donusunde islemi durdurun:\nHLT\n\n; --- AddParams Proseduru ---\nAddParams:\n; 4. Stack frame kurun (PUSH BP ve MOV BP, SP):\n; TODO:\n\n\n; 5. Yigindan parametreleri AX ve BX'e okuyun ([BP+4] ve [BP+6]):\n; TODO:\n\n\n; 6. DX icinde toplami elde edin (DX=0, ADD DX, AX ve ADD DX, BX):\n; TODO:\n\n\n; 7. Onceki BP'yi geri yukleyin (POP BP):\n; TODO:\n\n\n; 8. RET 4 ile donus adresini cekip yigindaki 4 bayti temizleyin:\n; TODO:\n",
            "solutionCode": "ORG 100H\nPUSH 1000H\nPUSH 2000H\nCALL AddParams\nHLT\n\nAddParams:\nPUSH BP\nMOV BP, SP\nMOV AX, [BP+4]\nMOV BX, [BP+6]\nMOV DX, 0\nADD DX, AX\nADD DX, BX\nPOP BP\nRET 4",
            "solutionBreakdown": [
              "1-2. Satırlar: Yığına 1000h ve 2000h parametreleri atılır (toplam 4 bayt).",
              "3. Satır: CALL AddParams — Dönüş IP adresi (2 bayt) yığına itilir.",
              "4-5. Satırlar: PUSH BP ve MOV BP, SP — Çerçeve sabitlenir. Yığında: [BP]=Eski BP, [BP+2]=Dönüş IP, [BP+4]=2000h, [BP+6]=1000h bulunur.",
              "6-7. Satırlar: Parametreler okunup DX = 3000h hesaplanır.",
              "8. Satır: POP BP ile çağıran fonksiyonun BP'si geri yüklenir.",
              "9. Satır: RET 4 — Dönüş adresini IP'ye çeker ve SP = SP + 4 yaparak yığındaki 2 parametreyi tek adımda temizler."
            ],
            "examTips": "Sınavda 'Callee clean-up' mekanizması sorulduğunda cevabın RET n olduğu ve ilk parametrenin [BP+4]'ten başladığı (çünkü CALL 2 bayt, PUSH BP 2 bayt tüketir) kuralını unutmayın!"
          }
        ]
      }
    ]
  },
  "milestone-5": {
    "milestoneId": "milestone-5",
    "milestoneNumber": 5,
    "title": "Akış Kontrolü & Koşullu Atlamalar (JMP, JE, JNE, JL/JG, JB/JA, LOOP)",
    "subtitle": "İşaretli vs İşaretsiz Karşılaştırma Matrisi, JCXZ Güvenlik Kuralı, Döngü Mekanizmaları ve 0xAA Sentinel Arama",
    "slideRef": "Hoca: Week 5 & 6 Slaytları / w6, w11 PDF | Kitap: Barry B. Brey Bölüm 6",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 5: PROGRAM AKIŞ KONTROLÜ & DÖNGÜLER</div>\n            <p class=\"lecture-hero-text\">\n              Mikroişlemcide karar yapıları (if-else, switch) ve döngüler (for, while); <code>CMP</code> veya <code>TEST</code> ile bayrakların kurulması ve ardından gelen <b>Koşullu Atlama (Conditional Jump)</b> komutlarıyla gerçekleştirilir.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Kuralları & Sınav Kılavuzu:</strong><br>\n              1. <b>İşaretli vs İşaretsiz Ayrımı (Sınavın En Büyük Tuzağı):</b><br>\n                 • İşaretsiz sayılarda: <code>JA (Above)</code>, <code>JB (Below)</code>, <code>JAE</code>, <code>JBE</code> kullanılır (Carry ve Zero bayraklarına bakar).<br>\n                 • İşaretli sayılarda: <code>JG (Greater)</code>, <code>JL (Less)</code>, <code>JGE</code>, <code>JLE</code> kullanılır (Sign ve Overflow bayraklarına bakar). Sınavda asla karıştırmayın!<br>\n              2. <b>Hocanın JCXZ Kuralı:</b> <code>LOOP</code> komutuna girmeden önce <code>CX = 0</code> ise, döngü 0 kez dönmez! <code>DEC CX</code> ile CX = FFFFh (65.535) olur ve döngü <strong>65.536 KEZ</strong> döner. Bu hatayı önlemek için döngünün başına daima <code>JCXZ Cikis</code> konulmalıdır.<br>\n              3. <b>0xAA Sentinel Arama:</b> Hocanın sınav sorularında dizilerin uzunluğu bazen CX ile verilmez; dizinin bittiğini gösteren <code>0xAA</code> sonlandırıcı sabiti kullanılır.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. Karşılaştırma Mekanizması ve Tam Atlama Bayrak Matrisi",
        "contentHtml": "\n                  <p><code>CMP Hedef, Kaynak</code> komutu $Hedef - Kaynak$ çıkarması yaptıktan sonra aşağıdaki atlama komutları çalışır:</p>\n                  \n                  <h4>İşaretsiz Karşılaştırma Komutları (Unsigned Jumps):</h4>\n                  <table class=\"lecture-table\">\n                    <thead>\n                      <tr><th>Komut</th><th>Anlamı</th><th>Test Edilen Bayrak Koşulu</th></tr>\n                    </thead>\n                    <tbody>\n                      <tr><td><code>JA / JNBE</code></td><td>Jump if Above (Büyükse)</td><td>$CF = 0 \\land ZF = 0$</td></tr>\n                      <tr><td><code>JAE / JNB / JNC</code></td><td>Jump if Above or Equal / No Carry</td><td>$CF = 0$</td></tr>\n                      <tr><td><code>JB / JNAE / JC</code></td><td>Jump if Below / Carry (Küçükse)</td><td>$CF = 1$</td></tr>\n                      <tr><td><code>JBE / JNA</code></td><td>Jump if Below or Equal (Küçük veya Eşitse)</td><td>$CF = 1 \\lor ZF = 1$</td></tr>\n                    </tbody>\n                  </table>\n\n                  <h4>İşaretli Karşılaştırma Komutları (Signed Jumps):</h4>\n                  <table class=\"lecture-table\">\n                    <thead>\n                      <tr><th>Komut</th><th>Anlamı</th><th>Test Edilen Bayrak Koşulu</th></tr>\n                    </thead>\n                    <tbody>\n                      <tr><td><code>JG / JNLE</code></td><td>Jump if Greater (Büyükse)</td><td>$ZF = 0 \\land SF = OF$</td></tr>\n                      <tr><td><code>JGE / JNL</code></td><td>Jump if Greater or Equal</td><td>$SF = OF$</td></tr>\n                      <tr><td><code>JL / JNGE</code></td><td>Jump if Less (Küçükse)</td><td>$SF \\neq OF$</td></tr>\n                      <tr><td><code>JLE / JNG</code></td><td>Jump if Less or Equal</td><td>$ZF = 1 \\lor SF \\neq OF$</td></tr>\n                    </tbody>\n                  </table>\n\n                  <h4>Tek Bayrak Denetleyen Komutlar:</h4>\n                  <ul>\n                    <li><code>JE / JZ</code>: $ZF = 1$ (Sonuç sıfırsa veya eşitse atlar).</li>\n                    <li><code>JNE / JNZ</code>: $ZF = 0$ (Sonuç sıfır değilse veya eşit değilse atlar).</li>\n                    <li><code>JS</code> ($SF = 1$, negatifse), <code>JNS</code> ($SF = 0$, pozitifse).</li>\n                    <li><code>JO</code> ($OF = 1$, işaretli taşma varsa), <code>JNO</code> ($OF = 0$).</li>\n                    <li><code>JP / JPE</code> ($PF = 1$, parite çiftse), <code>JNP / JPO</code> ($PF = 0$, tekse).</li>\n                  </ul>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: Döngü Komutları & Sınav Kuralları (LOOP, LOOPE, LOOPNE, JCXZ)",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4><code>LOOP HedefEtiket</code> — Donanımsal Sayaçlı Döngü</h4>\n                    <ul>\n                      <li><b>Çalışma Mantığı:</b> Önce <code>CX = CX - 1</code> yapar. Eğer <code>CX != 0</code> ise HedefEtiket'e atlar; <code>CX == 0</code> olduğunda bir alt satıra geçer.</li>\n                      <li><b>Bayraklara Etkisi:</b> <strong>HİÇBİR BAYRAĞI DEĞİŞTİRMEZ!</strong> (ZF bayrağını etkilemez).</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>JCXZ HedefEtiket</code> — CX Sıfırsa Atla</h4>\n                    <ul>\n                      <li>CX yazmacının değeri 0 ise doğrudan atlar. Hiçbir bayrağı etkilemez.</li>\n                      <li><b>Hocanın Kullanım Kuralı:</b> Bir dizi işlemeden önce sayaç kontrolü için <code>LOOP</code>'tan önce mutlaka yazılmalıdır.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>LOOPE / LOOPZ</code> ve <code>LOOPNE / LOOPNZ</code></h4>\n                    <ul>\n                      <li><code>LOOPE label</code> (Loop while Equal): CX'i 1 azaltır. Eğer <code>CX != 0</code> VE <code>ZF == 1</code> (elemanlar eşit) ise döner. Eşitlik bozulursa döngüden çıkar.</li>\n                      <li><code>LOOPNE label</code> (Loop while Not Equal): CX'i 1 azaltır. Eğer <code>CX != 0</code> VE <code>ZF == 0</code> ise döner. Eşleşen eleman bulunduğunda (ZF=1 olduğunda) döngüden erken çıkar.</li>\n                    </ul>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde akış kontrolü ve döngü algoritmalarını test edin. <b>Cevap hazır gelmez</b>; yönergeleri takip edin.</p>\n                ",
        "examples": [
          {
            "id": "ex-m5-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 5.1: Koşullu Atlama ile Mutlak Fark (Hocanın Kod PDF'i Örnek 16)",
            "scenario": "Hocanın sınav kod dokümanındaki Örnek 16'da yer alan 'Absolute Difference' algoritması uygulanacaktır. İki sayının mutlak farkı ($|AX - BX|$) hesaplanacaktır.",
            "task": "AX=15 ve BX=25 değerlerini yükleyin. CMP AX, BX ile karşılaştırın. Eğer AX < BX ise (JC DIFF2) BX'ten AX'i çıkarın. Değilse AX'ten BX'i çıkarın. Mutlak farkı AX yazmacında bırakın.",
            "code": "; 🟢 Kolay: Absolute Difference (Hocanin Ornek 16'si)\nORG 100H\n\nMOV AX, 15\nMOV BX, 25\n\n; 1. AX ve BX'i karsilastirin (CMP AX, BX):\n; TODO:\n\n\n; 2. Eger AX < BX ise (Carry olusmussa) DIFF2 etiketine atlayin (JC DIFF2):\n; TODO:\n\n\nDIFF1:\n; 3. AX buyuk veya esitse SUB AX, BX yapip DONE'a atlayin:\n; TODO:\n\n\nDIFF2:\n; 4. BX buyukse SUB BX, AX yapip sonucu AX'e tasiyin:\n; TODO:\n\n\nDONE:\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 15\nMOV BX, 25\nCMP AX, BX\nJC DIFF2\n\nDIFF1:\nSUB AX, BX\nJMP DONE\n\nDIFF2:\nSUB BX, AX\nMOV AX, BX\n\nDONE:\nHLT",
            "solutionBreakdown": [
              "1. Satır: AX = 15 (0Fh), BX = 25 (19h) yüklenir.",
              "2. Satır: CMP AX, BX — 15 - 25 borç gerektirdiğinden Carry Flag kurulur (CF=1).",
              "3. Satır: JC DIFF2 — CF=1 olduğundan DIFF2 etiketine atlanır.",
              "4. Satır: SUB BX, AX — BX = 25 - 15 = 10 olur ve MOV AX, BX ile AX = 10 elde edilir."
            ],
            "examTips": "İşaretsiz sayılarda CMP sonrası küçük olma durumu Carry Flag (CF=1) ile denetlenir. JC veya JB aynı görevi görür."
          },
          {
            "id": "ex-m5-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 5.2: Kelime Dizisinde Tek/Çift Sayı Ayıklayıcı (Hocanın Örnek 19'u)",
            "scenario": "Hocanın kod belgesindeki Hafta 11 Örnek 19'da yer alan dizi analizi uygulanacaktır. Bellekteki kelime dizisi taranarak tek sayılar BX'te, çift sayılar DX'te sayılacaktır.",
            "task": "Diziyi döngü ile tarayın. Her kelime için SHR AX, 1 uygulayın. Eğer CF=0 ise (JNC even) çift sayacı DX'i artırın; CF=1 ise tek sayacı BX'i artırın. Dizi bitene kadar devam edin.",
            "code": "; 🟡 Orta: Tek/Cift Sayi Ayiklayici (Hocanin Ornek 19'u)\nORG 100H\n\nLEA SI, [0200H]     ; Dizi baslangic adresi\nMOV CX, 4           ; 4 elemanli dizi\nMOV BX, 0           ; Tek sayilar sayaci\nMOV DX, 0           ; Cift sayilar sayaci\n\nL0:\n; 1. [SI] adresindeki kelimeyi AX'e okuyun ve SI'yi 2 artirin:\n; TODO:\n\n\n; 2. SHR AX, 1 ile en dusuk biti Carry Flag'e atin:\n; TODO:\n\n\n; 3. Eger Carry yoksa (cift ise) EVEN_NUM etiketine atlayin (JNC EVEN_NUM):\n; TODO:\n\n\n; 4. Carry varsa (tek ise) tek sayaci BX'i artirin ve CNT_LOOP'a atlayin:\n; TODO:\n\n\nEVEN_NUM:\n; 5. Cift sayaci DX'i artirin:\n; TODO:\n\n\nCNT_LOOP:\nLOOP L0\n\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  5,
                  0,
                  8,
                  0,
                  3,
                  0,
                  12,
                  0
                ]
              }
            ],
            "solutionCode": "ORG 100H\nLEA SI, [0200H]\nMOV CX, 4\nMOV BX, 0\nMOV DX, 0\n\nL0:\nMOV AX, [SI]\nADD SI, 2\nSHR AX, 1\nJNC EVEN_NUM\nINC BX\nJMP CNT_LOOP\n\nEVEN_NUM:\nINC DX\n\nCNT_LOOP:\nLOOP L0\n\nHLT",
            "solutionBreakdown": [
              "1. Satır: Dizi elemanı AX'e okunur.",
              "2. Satır: SHR AX, 1 komutu sayının son bitini (bit 0) Carry Flag'e iter.",
              "3. Satır: Son bit 0 ise sayı çifttir (CF=0) ve JNC EVEN_NUM ile DX artırılır.",
              "4. Satır: Son bit 1 ise sayı tektir (CF=1) ve INC BX çalışır.",
              "5. Satır: 4 eleman sonunda 2 tek (5, 3) ve 2 çift (8, 12) için BX=2, DX=2 elde edilir."
            ],
            "examTips": "Hoca tek/çift kontrolünü sınavlarda AND yerine genellikle 'SHR AX, 1' ve 'JNC' kombinasyonuyla sormaktadır!"
          },
          {
            "id": "ex-m5-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / Sentinel Arama",
            "title": "Alıştırma 5.3: 0xAA Sentinel ile Dizi Maksimumu Bulma (Hocanın Örnek 15'i)",
            "scenario": "Hocanın sınav kod dokümanındaki Sayfa 6 Örnek 15'te yer alan sentinel tabanlı maksimum bulma algoritması uygulanacaktır.",
            "task": "Bellekten MOV AL, [SI] ve INC SI ile baytları sırayla okuyun (SADECE Aşama 1-5 komutları). Eğer okunan değer 0AAh ise (JZ END_SEARCH) aramayı bitirin. Değilse BL'deki mevcut maksimum ile karşılaştırın (CMP AL, BL) ve daha büyükse BL'yi güncelleyin.",
            "code": "; 🔴 Zor: 0xAA Sentinel Array Max (Hocanin Ornek 15'i)\nORG 100H\n\nLEA SI, [0200H]     ; Dizi adresi\nMOV BL, 0           ; Mevcut maksimum (en kucuk baslangic)\n\nSEARCH_LOOP:\n; 1. [SI]'den bir bayti AL'ye okuyun ve SI'yi 1 artirin (INC SI):\n; TODO:\n\n\n; 2. AL ile 0AAh (sonlandirici) degerini karsilastirin:\n; TODO:\n\n\n; 3. Eger 0AAh bulunduysa END_SEARCH etiketine atlayin (JZ END_SEARCH):\n; TODO:\n\n\n; 4. AL ile mevcut maksimum BL'yi karsilastirin (CMP AL, BL):\n; TODO:\n\n\n; 5. Eger AL <= BL ise CONTINUE_LOOP etiketine atlayin (JBE CONTINUE_LOOP):\n; TODO:\n\n\n; 6. AL daha buyukse yeni maksimum olarak BL'ye atayin:\n; TODO:\n\n\nCONTINUE_LOOP:\nJMP SEARCH_LOOP\n\nEND_SEARCH:\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  18,
                  69,
                  137,
                  51,
                  170
                ]
              }
            ],
            "solutionCode": "ORG 100H\nLEA SI, [0200H]\nMOV BL, 0\n\nSEARCH_LOOP:\nMOV AL, [SI]\nINC SI\nCMP AL, 0AAH\nJZ END_SEARCH\nCMP AL, BL\nJBE CONTINUE_LOOP\nMOV BL, AL\n\nCONTINUE_LOOP:\nJMP SEARCH_LOOP\n\nEND_SEARCH:\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AL, [SI] ve INC SI ile dizi sırayla taranır (Henüz Aşama 6'daki LODSB komutuna ihtiyaç duymadan saf Aşama 1-5 komutlarıyla çözülür).",
              "2. Satır: CMP AL, 0AAh ile sentinel sonlandırıcı kontrol edilir, dizi sonuna gelindiğinde (0AAh görüldüğünde) döngü kırılır.",
              "3. Satır: CMP AL, BL ve JBE ile mevcut maksimumdan büyük sayılar tespit edilerek BL = 89h olarak bulunur."
            ],
            "examTips": "Sabit sayaç CX yerine belleğin sonunda özel bir karakter (0xAA veya 0x00) arayan bu yapı hocanın sınavlarının en klasik sorusudur."
          }
        ]
      }
    ]
  },
  "milestone-6": {
    "milestoneId": "milestone-6",
    "milestoneNumber": 6,
    "title": "Dizi & String İşlemleri (MOVS, LODS, STOS, CMPS, SCAS, REP)",
    "subtitle": "Yüksek Hızlı Donanımsal Blok Transferi, Arama, Karşılaştırma, DF Bayrağı ve XLAT Lookup Tabloları",
    "slideRef": "Hoca: Week 4 PPTX / w4, w11 PDF, Code Examples PDF | Kitap: Barry B. Brey Bölüm 4",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 6: DİZİ VE STRİNG İŞLEMLERİ</div>\n            <p class=\"lecture-hero-text\">\n              8086 mikroişlemcisinde ardışık bellek blokları (metinler, diziler, veri tamponları) döngü yazmadan, tek komut ve donanımsal <b>Tekrar Ön Ekleri (REP Prefixes)</b> ile saat çevrimi düzeyinde yüksek hızla işlenir.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Kuralları & Sınav Kılavuzu:</strong><br>\n              1. <b>Sabit Segment Kuralı:</b> String komutlarında kaynak adres <strong>DAİMA DS:SI</strong>, hedef adres ise <strong>DAİMA ES:DI</strong> olmak zorundadır. Hedef segment (ES) kesinlikle değiştirilemez.<br>\n              2. <b>Direction Flag (CLD / STD Tuzağı):</b> String işleminden önce yön bayrağını belirlemek <strong>ZORUNLUDUR</strong>. Artan adreslerde (0000 ➔ FFFF) <code>CLD</code> (DF=0) kullanılmalıdır. <code>CLD</code> unutulursa DF bayrağı 1 kalabilir ve hafıza geriye doğru yazılarak bozulur!<br>\n              3. <b>XLAT Tablo Dönüşümü:</b> <code>XLAT</code> komutu <code>[DS:BX + AL]</code> adresindeki tablo verisini doğrudan AL içine yükler. Karakter dönüşümleri ve 7-segment gösterge kodlamasında hocanın favori komutudur.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. String İşlem Mimarisi ve Direction Flag (DF)",
        "contentHtml": "\n                  <p>String komutları, diğer 8086 komutlarından farklı olarak otomatik adres artırma/azaltma yeteneğine sahiptir:</p>\n                  <ul>\n                    <li><b>Kaynak Yazmaç:</b> <code>SI (Source Index)</code> — Varsayılan segmenti <code>DS</code>'dir.</li>\n                    <li><b>Hedef Yazmaç:</b> <code>DI (Destination Index)</code> — Varsayılan segmenti <b>KESİNLİKLE ES</b>'dir.</li>\n                    <li><b>Yön Bayrağı (Direction Flag - DF):</b>\n                      <ul>\n                        <li><code>CLD (Clear Direction Flag):</code> DF = 0 yapar. Her bayt/kelime işleminden sonra SI ve DI <b>OTOMATİK ARTAR</b> (+1 veya +2).</li>\n                        <li><code>STD (Set Direction Flag):</code> DF = 1 yapar. Her işlemden sonra SI ve DI <b>OTOMATİK AZALIR</b> (-1 veya -2).</li>\n                      </ul>\n                    </li>\n                  </ul>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: 5 String Komutu, Tekrar Ön Ekleri ve XLAT",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4>5 Temel String Komutu</h4>\n                    <table class=\"lecture-table\">\n                      <thead>\n                        <tr><th>Komut (Byte / Word)</th><th>Kaynak</th><th>Hedef</th><th>İşlem Özeti</th></tr>\n                      </thead>\n                      <tbody>\n                        <tr><td><code>MOVSB / MOVSW</code></td><td><code>[DS:SI]</code></td><td><code>[ES:DI]</code></td><td>Bellekten belleğe blok kopyalar.</td></tr>\n                        <tr><td><code>LODSB / LODSW</code></td><td><code>[DS:SI]</code></td><td><code>AL / AX</code></td><td>Bellekten yazmaca veri yükler (SI güncellenir).</td></tr>\n                        <tr><td><code>STOSB / STOSW</code></td><td><code>AL / AX</code></td><td><code>[ES:DI]</code></td><td>Yazmaçtaki veriyi belleğe depolar (Bellek sıfırlama/doldurma).</td></tr>\n                        <tr><td><code>CMPSB / CMPSW</code></td><td><code>[DS:SI]</code></td><td><code>[ES:DI]</code></td><td>İki bellek bloğunu karşılaştırır (bayrakları kurar).</td></tr>\n                        <tr><td><code>SCASB / SCASW</code></td><td><code>AL / AX</code></td><td><code>[ES:DI]</code></td><td>Bellekte belirli bir karakteri veya sayıyı arar (bayrakları kurar).</td></tr>\n                      </tbody>\n                    </table>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4>Tekrar Ön Ekleri (Repeat Prefixes)</h4>\n                    <ul>\n                      <li><code>REP (Repeat):</code> <code>CX != 0</code> olduğu sürece komutu tekrar eder. Her adımda <code>CX = CX - 1</code> yapar. (MOVS ve STOS ile kullanılır).</li>\n                      <li><code>REPE / REPZ (Repeat while Equal / Zero):</code> <code>CX != 0</code> VE <code>ZF == 1</code> olduğu sürece tekrar eder (CMPS ve SCAS ile kullanılır).</li>\n                      <li><code>REPNE / REPNZ (Repeat while Not Equal / Not Zero):</code> <code>CX != 0</code> VE <code>ZF == 0</code> olduğu sürece tekrar eder. Aranan karakter bulunduğunda (ZF=1 olduğunda) döngüyü kırar.</li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4><code>XLAT / XLATB</code> — Tablo Çeviri Komutu</h4>\n                    <ul>\n                      <li><b>Çalışma Prensibi:</b> <code>AL = [DS:BX + AL]</code>. BX yazmacındaki taban adresine AL'deki indis eklenir ve o adresteki bayt AL içine yazılır.</li>\n                      <li><b>Kullanım Örneği (Slayt 33):</b> Küçük harfi büyük harfe veya BCD rakamı 7-segment LED koduna çevirme.</li>\n                    </ul>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde string komutlarını test edin. <b>Cevap hazır gelmez</b>; yönergeleri izleyin.</p>\n                ",
        "examples": [
          {
            "id": "ex-m6-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 6.1: REP MOVSB ile 10-Baytlık Blok Kopyalama (Hocanın Slayt 28 Örneği)",
            "scenario": "Hocanın Week 4 Slayt 28'de sunduğu klasik REP MOVSB blok transfer algoritması uygulanacaktır. [0200h] adresindeki 10 baytlık veri [0300h] adresine tek komutta aktarılacaktır.",
            "task": "CLD ile yönü artan yapın. CX içine 10 yükleyin. SI içine 0200h, DI içine 0300h yükleyin. REP MOVSB komutunu çalıştırarak blok kopyalamayı tamamlayın.",
            "code": "; 🟢 Kolay: REP MOVSB ile Blok Kopyalama (Slayt 28)\nORG 100H\n\n; 1. Direction Flag'i sifirlayin (artan adres icin CLD):\n; TODO:\n\n\n; 2. Sayac yazmaci CX'e 10 yukleyin:\n; TODO:\n\n\n; 3. Kaynak adresini SI'ye yukleyin (0200h):\n; TODO:\n\n\n; 4. Hedef adresini DI'ye yukleyin (0300h):\n; TODO:\n\n\n; 5. REP MOVSB komutu ile blok kopyalamayi baslatin:\n; TODO:\n\n\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  65,
                  83,
                  77,
                  56,
                  48,
                  56,
                  54,
                  83,
                  73,
                  77
                ]
              }
            ],
            "solutionCode": "ORG 100H\nCLD\nMOV CX, 10\nMOV SI, 0200H\nMOV DI, 0300H\nREP MOVSB\nHLT",
            "solutionBreakdown": [
              "1. Satır: CLD — DF=0 yapılarak SI ve DI'nin her aktarımda 1 artması sağlanır.",
              "2. Satır: MOV CX, 10 — 10 bayt aktarılacağı belirtilir.",
              "3-4. Satırlar: SI = 0200h (Kaynak) ve DI = 0300h (Hedef) hazırlanır.",
              "5. Satır: REP MOVSB — Donanımsal döngüyle 10 bayt tek adımda [0300h] adresine aktarılır, CX=0 olur."
            ],
            "examTips": "Sınavda string kopyalamada CLD komutunu yazmayı unutmak doğrudan puan kaybıdır."
          },
          {
            "id": "ex-m6-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 6.2: REPNE SCASB ile String İçinde Karakter Arama",
            "scenario": "Bellekteki bir metin tamponunda ('HELLO WORLD') 'W' karakterinin (57h) konumu bulunacak ve DI göstergesinden indeks hesaplanacaktır.",
            "task": "CLD uygulayın. AL içine 'W' (57h) yükleyin. DI içine metin adresi olan 0200h'ı, CX içine metin uzunluğu olan 11'i yükleyin. REPNE SCASB ile arama yapın. Eşleşme bulunduğunda döngü durur.",
            "code": "; 🟡 Orta: REPNE SCASB ile Karakter Arama\nORG 100H\n\n; 1. CLD ile yonu belirleyin:\n; TODO:\n\n\n; 2. Aranan karakter olan 'W' (57h) sabitini AL'ye yukleyin:\n; TODO:\n\n\n; 3. Metin adresi olan 0200h'i DI'ye, tampon boyutu 11'i CX'e yukleyin:\n; TODO:\n\n\n; 4. REPNE SCASB komutunu calistirarak karakteri arayin:\n; TODO:\n\n\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  72,
                  69,
                  76,
                  76,
                  79,
                  32,
                  87,
                  79,
                  82,
                  76,
                  68
                ]
              }
            ],
            "solutionCode": "ORG 100H\nCLD\nMOV AL, 'W'\nMOV DI, 0200H\nMOV CX, 11\nREPNE SCASB\nHLT",
            "solutionBreakdown": [
              "1. Satır: CLD — Arama yönü ileri (artan) olarak kurulur.",
              "2. Satır: AL = 'W' (57h) — Karşılaştırılacak değer belirlenir.",
              "3. Satır: DI = 0200h ve CX = 11 hazırlanır.",
              "4. Satır: REPNE SCASB — Her adımda [ES:DI] ile AL karşılaştırılır. 'W' bulunduğunda ZF=1 olur ve döngü derhal durur."
            ],
            "examTips": "REPNE SCASB aranan karakter bulunduğunda (ZF=1) veya CX=0 olduğunda durur. Durduğunda DI aranan elemanın bir sonraki adresini gösterir."
          },
          {
            "id": "ex-m6-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / Tablo Çevrimi",
            "title": "Alıştırma 6.3: XLAT ile BCD-to-7 Segment Gösterge Kodlama (Slayt 33 Örneği)",
            "scenario": "Hocanın Week 4 Slayt 33'te anlattığı XLAT komutu kullanılarak, 0-9 arası bir BCD rakamı (örn: 3) 7-segment LED göstergesi için gerekli hex koduna dönüştürülecektir.",
            "task": "Belleğin [0200h] adresindeki 7-segment tablosunun taban adresini BX'e LEA ile alın. Çevrilecek rakamı AL içine 3 olarak yükleyin. XLAT komutunu çalıştırarak AL içine 3 rakamının 7-segment kodunu (4Fh) getirin.",
            "code": "; 🔴 Zor: XLAT Tablo Cevrimi (Slayt 33)\nORG 100H\n\n; 1. Tablonun taban adresini (0200h) LEA ile BX'e yukleyin:\n; TODO:\n\n\n; 2. Indis olarak AL icine 3 rakamini yukleyin:\n; TODO:\n\n\n; 3. XLAT komutu ile tablodan degeri AL'ye donusturun:\n; TODO:\n\n\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  63,
                  6,
                  91,
                  79,
                  102,
                  109,
                  125,
                  7,
                  127,
                  111
                ]
              }
            ],
            "solutionCode": "ORG 100H\nLEA BX, [0200H]\nMOV AL, 3\nXLAT\nHLT",
            "solutionBreakdown": [
              "1. Satır: LEA BX, [0200H] — Dönüşüm tablosunun başlangıç ofseti BX'e alınır.",
              "2. Satır: MOV AL, 3 — Çevrilecek indis AL'ye atanır.",
              "3. Satır: XLAT — Donanımsal olarak [BX + AL] adresi hesaplanır (0200h + 3 = 0203h). O adresteki 4Fh (3 rakamının 7-segment LED kodu) AL içine yazılır."
            ],
            "examTips": "XLAT komutu örtük olarak AL ve DS:BX yazmaçlarını kullanır. Komuta hiçbir operant verilmez (yalnızca XLAT yazılır)."
          }
        ]
      }
    ]
  },
  "milestone-7": {
    "milestoneId": "milestone-7",
    "milestoneNumber": 7,
    "title": "Giriş/Çıkış (I/O) Sistemleri, Portlar & DMA 8237",
    "subtitle": "Isolated I/O vs Memory-Mapped I/O, Sabit/Değişken Portlar (DX), Intel 8237 El Sıkışması (HRQ/HLDA) ve Blok Transfer",
    "slideRef": "Hoca: Week 4 PPTX, Week 7 Syllabus, w9 PDF, Code Examples PDF | Kitap: Barry B. Brey Bölüm 11 & 13",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 7: GİRİŞ/ÇIKIŞ (I/O) VE DOĞRUDAN BELLEK ERİŞİMİ (DMA)</div>\n            <p class=\"lecture-hero-text\">\n              Mikroişlemci dış dünya ve donanım aygıtlarıyla portlar üzerinden haberleşir. \n              8086 mimarisinde I/O adres uzayı bellekten tamamen yalıtılmış (Isolated I/O) olup <b>IN ve OUT</b> komutlarıyla yönetilir. Yüksek hızlı veri aktarımlarında ise CPU baypas edilerek <b>Intel 8237 DMA Denetleyicisi</b> devreye girer.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Kuralları & Sınav Kılavuzu:</strong><br>\n              1. <b>Sabit Port vs Değişken Port Kuralı (Sınav Sorusu):</b><br>\n                 • Port numarası <code>00H – FFH</code> (0–255) arasında ise <strong>Sabit Port</strong> kullanılır (örn: <code>IN AL, 60H</code>).<br>\n                 • Port numarası 255'ten büyükse (<code>0100H – FFFFH</code>, 64 KB'a kadar) port numarası <strong>MUTLAKA DX YAZMACINA</strong> yüklenmeli ve <strong>Değişken Port</strong> kullanılmalıdır (örn: <code>MOV DX, 378H; IN AL, DX</code>). DX haricinde hiçbir yazmaç port adresi tutamaz!<br>\n              2. <b>Yalnızca Akümülatör Kuralı:</b> I/O komutlarında veri aktarımı <strong>YALNIZCA AL (8-bit) veya AX (16-bit)</strong> üzerinden yapılabilir. <code>IN BL, 60H</code> veya <code>OUT 20H, CL</code> YASAKTIR!<br>\n              3. <b>8237 DMA El Sıkışması:</b> DMA denetleyicisi CPU'ya <code>HRQ (Hold Request)</code> gönderir, CPU veriyollarını yüksek empedansa (Tristate) alıp onay verince <code>HLDA (Hold Acknowledge)</code> sinyali üretir.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. I/O Mimarileri: Isolated (Port) I/O vs Memory-Mapped I/O",
        "contentHtml": "\n                  <p>Bilgisayar sistemlerinde iki temel I/O yaklaşımı bulunur:</p>\n                  <table class=\"lecture-table\">\n                    <thead>\n                      <tr><th>Mimari</th><th>Adres Uzayı</th><th>Kullanılan Komutlar</th><th>Kontrol Sinyalleri</th></tr>\n                    </thead>\n                    <tbody>\n                      <tr><td><b>Isolated I/O (Port I/O)</b></td><td>Bellekten bağımsız 64 KB (0000H–FFFFH)</td><td><code>IN</code> ve <code>OUT</code></td><td><code>/IOR</code> (I/O Read) ve <code>/IOW</code> (I/O Write)</td></tr>\n                      <tr><td><b>Memory-Mapped I/O</b></td><td>Normal 1 MB bellek haritası içinde ayrılmış alan</td><td>Tüm standart komutlar (<code>MOV, ADD, TEST</code>)</td><td><code>/MEMR</code> ve <code>/MEMW</code></td></tr>\n                    </tbody>\n                  </table>\n\n                  <h4>3 Temel I/O Veri Aktarım Tekniği (Hocanın İzlencesi):</h4>\n                  <ol>\n                    <li><b>Programmed I/O (Polling / Yoklama):</b> İşlemci aygıtın durum portunu sürekli okuyarak döngüde bekler (CPU zamanı boşa harcanır).</li>\n                    <li><b>Interrupt-Driven I/O (Kesme Tabanlı):</b> Aygıt veri hazır olduğunda kesme sinyali gönderir, CPU işini bölüp veriyi okur.</li>\n                    <li><b>Direct Memory Access (DMA):</b> Aygıt ile bellek arasında işlemciye hiç uğramadan donanımsal doğrudan veri aktarımı yapılır.</li>\n                  </ol>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: I/O Komutları & Intel 8237 DMA Denetleyicisi",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4><code>IN</code> ve <code>OUT</code> — Donanım Portu Giriş / Çıkış</h4>\n                    <ul>\n                      <li><code>IN AL, port8</code> / <code>IN AX, port8</code> — 8-bit sabit porttan okuma (örn: <code>IN AL, 20H</code>).</li>\n                      <li><code>IN AL, DX</code> / <code>IN AX, DX</code> — DX'teki 16-bitlik porttan okuma (örn: <code>MOV DX, 378H; IN AL, DX</code>).</li>\n                      <li><code>OUT port8, AL</code> / <code>OUT port8, AX</code> — 8-bit sabit porta veri gönderme (örn: <code>OUT 61H, AL</code>).</li>\n                      <li><code>OUT DX, AL</code> / <code>OUT DX, AX</code> — Değişken porta veri gönderme (örn: <code>MOV DX, 378H; OUT DX, AL</code>).</li>\n                      <li><b>Bayraklara Etkisi:</b> <strong>HİÇBİR BAYRAĞI DEĞİŞTİRMEZ!</strong></li>\n                    </ul>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4>Intel 8237 DMA Denetleyicisi Mimarisi</h4>\n                    <ul>\n                      <li><b>HRQ (Hold Request):</b> 8237 DMA çipi, veriyolunu devralmak istediğinde CPU'nun HOLD bacağına 1 gönderir.</li>\n                      <li><b>HLDA (Hold Acknowledge):</b> CPU mevcut komutun çevrimini tamamlar, adres/veri yollarını serbest bırakır (Tristate) ve DMA'ya HLDA sinyali ile onay verir.</li>\n                      <li><b>Çalışma Modları:</b>\n                        <ul>\n                          <li><b>Cycle Stealing (Çevrim Çalma):</b> DMA tek bir bayt/kelime aktarır, sonra yolu hemen CPU'ya geri verir.</li>\n                          <li><b>Burst Mode (Patlama Modu):</b> Tüm veri bloğu bitene kadar DMA veriyolunu elinde tutar (en yüksek hız).</li>\n                        </ul>\n                      </li>\n                    </ul>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde I/O ve DMA simülasyonu alıştırmalarını gerçekleştirin. <b>Cevap hazır gelmez</b>; yönergeleri izleyin.</p>\n                ",
        "examples": [
          {
            "id": "ex-m7-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 7.1: Sabit ve Değişken Port Haberleşmesi (IN & OUT)",
            "scenario": "Klavye durum portundan (sabit port 60h) 8-bit veri okunacak ve paralel yazıcı portuna (değişken port 378h) gönderilecektir.",
            "task": "IN AL, 60H komutu ile sabit porttan veriyi AL'ye okuyun. Değişken port adresi olan 0378H'ı DX yazmacına yükleyin. OUT DX, AL komutu ile veriyi porta basıp HLT ile durun.",
            "code": "; 🟢 Kolay: Sabit ve Degisken Port Haberlesmesi\nORG 100H\n\n; 1. Sabit port 60h'tan veriyi AL'ye okuyun (IN AL, 60h):\n; TODO:\n\n\n; 2. Degisken port adresi olan 378h sabitini DX yazmacina yukleyin:\n; TODO:\n\n\n; 3. AL'deki veriyi OUT komutu ile DX portuna gonderin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nIN AL, 60H\nMOV DX, 378H\nOUT DX, AL\nHLT",
            "solutionBreakdown": [
              "1. Satır: IN AL, 60H — 8-bit sabit adresten (60h) veri AL akümülatörüne çekilir.",
              "2. Satır: MOV DX, 378H — 255'ten büyük port adresleri için DX kullanılır.",
              "3. Satır: OUT DX, AL — AL'deki veri donanım portuna yazılır."
            ],
            "examTips": "Sınavda OUT 378H, AL yazmak kesinlikle yanlıştır çünkü port adresi 8-bit'ten büyüktür. Mutlaka MOV DX, 378H ardından OUT DX, AL yazılmalıdır."
          },
          {
            "id": "ex-m7-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 7.2: 16-Bit Word DMA Blok Transferi (Hocanın Örnek 2'si)",
            "scenario": "Hocanın Week 9 DMA Kod Örneği 2'de yer alan donanımsal 16-bit word blok transferi simülasyonu uygulanacaktır.",
            "task": "CLD ile yönü artan yapın. CX içine 4 kelime (8 bayt) yükleyin. SI içine 0200h, DI içine 0300h yükleyin. REP MOWSW komutu ile 16-bitlik blok transferini gerçekleştirin.",
            "code": "; 🟡 Orta: 16-Bit Word DMA Blok Transferi (Hocanin Ornek 2'si)\nORG 100H\n\n; 1. CLD ile DF bayragini sifirlayin:\n; TODO:\n\n\n; 2. 4 adet kelime (word) transfer etmek icin CX'e 4 yukleyin:\n; TODO:\n\n\n; 3. Kaynak adresi 0200h'i SI'ye, hedef adresi 0300h'i DI'ye yukleyin:\n; TODO:\n\n\n; 4. REP MOWSW komutu ile 16-bit transferi baslatin:\n; TODO:\n\n\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  17,
                  34,
                  51,
                  68,
                  85,
                  102,
                  119,
                  136
                ]
              }
            ],
            "solutionCode": "ORG 100H\nCLD\nMOV CX, 4\nMOV SI, 0200H\nMOV DI, 0300H\nREP MOVSW\nHLT",
            "solutionBreakdown": [
              "1. Satır: CLD ile DF=0 yapılır.",
              "2. Satır: CX = 4 olarak belirlenir.",
              "3. Satır: SI ve DI adresleri yüklenir.",
              "4. Satır: REP MOWSW her adımda 2 bayt (1 word) kopyalar, SI ve DI 2 artar. 4 adımda toplam 8 bayt aktarılır."
            ],
            "examTips": "MOVSW kelime kopyaladığından SI ve DI yazmaçları her adımda 1 değil 2 artar."
          },
          {
            "id": "ex-m7-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / DMA Maskeleme",
            "title": "Alıştırma 7.3: Donanım Maskelemeli DMA Transferi (Hocanın Örnek 3'ü)",
            "scenario": "Hocanın Week 9 DMA Kod Örneği 3'te sunduğu maskelemeli transfer algoritması uygulanacaktır. Kaynaktan okunan veriler bir maske (0Fh) ile filtrelendikten sonra hedefe yazılacaktır.",
            "task": "CLD uygulayın. CX=4 yapın. SI=0200h, DI=0300h yapın. Bir transfer döngüsü kurun: LODSB ile baytı AL'ye alın, AND AL, 0FH ile maskeleyin, STOSB ile hedefe yazın. LOOP ile 4 bayt için tekrarlayın.",
            "code": "; 🔴 Zor: Donanim Maskelemeli DMA Transferi (Hocanin Ornek 3'u)\nORG 100H\n\nCLD\nMOV CX, 4\nMOV SI, 0200H\nMOV DI, 0300H\n\nTRANSFER_LOOP:\n; 1. LODSB ile kaynaktan bir bayti AL'ye okuyun:\n; TODO:\n\n\n; 2. AND AL, 0FH komutu ile sadece alt 4 biti maskeleyin:\n; TODO:\n\n\n; 3. STOSB ile filtrelenmis bayti hedefe yazin:\n; TODO:\n\n\n; 4. LOOP komutu ile TRANSFER_LOOP etiketine donun:\n; TODO:\n\n\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  245,
                  168,
                  115,
                  156
                ]
              }
            ],
            "solutionCode": "ORG 100H\nCLD\nMOV CX, 4\nMOV SI, 0200H\nMOV DI, 0300H\n\nTRANSFER_LOOP:\nLODSB\nAND AL, 0FH\nSTOSB\nLOOP TRANSFER_LOOP\n\nHLT",
            "solutionBreakdown": [
              "1. Satır: LODSB [SI]'deki baytı okur ve SI'yi 1 artırır.",
              "2. Satır: AND AL, 0FH komutu donanımsal maskeleme uygulayarak yüksek nibble'ı sıfırlar (örn: F5h -> 05h).",
              "3. Satır: STOSB filtrelenmiş veriyi [DI] adresine yazar ve DI'yi 1 artırır.",
              "4. Satır: LOOP komutu CX sıfır olana kadar döngüyü sürdürür."
            ],
            "examTips": "Doğrudan REP MOVSB yerine araya filtreleme mantığı konulduğunda LODSB + Mantıksal İşlem + STOSB + LOOP yapısı kullanılır."
          }
        ]
      }
    ]
  },
  "milestone-8": {
    "milestoneId": "milestone-8",
    "milestoneNumber": 8,
    "title": "Kesmeler (Interrupts), 256 Vektörlü IVT & 8259 PIC",
    "subtitle": "Kesme Vektör Tablosu (00000H–003FFH), İlk 5 Özel Kesme (INT 0–4), Donanımsal Kesme Döngüsü ve BIOS/DOS Servisleri",
    "slideRef": "Hoca: Week 6 w6, Week 12 w12a PDF, Code Examples PDF | Kitap: Barry B. Brey Bölüm 12",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 8: KESME YÖNETİMİ & SİSTEM SERVİSLERİ</div>\n            <p class=\"lecture-hero-text\">\n              Kesme (Interrupt), işlemcinin normal akışını anlık olarak durdurup acil bir olaya veya donanım aygıtına yanıt vermesini sağlayan mekanizmadır. \n              8086 mimarisinde 256 adet kesme tanımlıdır ve her birinin servis rutini (ISR) adresi <b>Kesme Vektör Tablosu'nda (IVT)</b> saklanır.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Kuralları & Sınav Kılavuzu:</strong><br>\n              1. <b>IVT Konumu & Formülü (Sınav Sorusudur):</b> IVT daima belleğin ilk 1024 baytında (<code>00000H – 003FFH</code>) yer alır. Her vektör 4 bayttır (2 bayt IP, 2 bayt CS). Kesme Numarası $N$ olan bir kesmenin adresi:<br>\n                 • $IP Adresi = N \\times 4$<br>\n                 • $CS Adresi = (N \\times 4) + 2$<br>\n              2. <b>İlk 5 Özel Kesme (Ayrılmış Kesmeler):</b><br>\n                 • <code>INT 0:</code> Divide Error (0'a bölme veya bölme aşımı)<br>\n                 • <code>INT 1:</code> Single Step / Trap (Adım adım hata ayıklama)<br>\n                 • <code>INT 2:</code> NMI (Non-Maskable Interrupt - CLI ile engellenemez)<br>\n                 • <code>INT 3:</code> Breakpoint (1-baytlık özel 0xCC makine kodu)<br>\n                 • <code>INT 4:</code> Overflow (INTO komutu ile taşma varsa)<br>\n              3. <b>IRET vs RET Farkı:</b> Normal <code>RET</code> yalnızca yığından dönüş adresini çekerken, <code>IRET</code> komutu yığından sırasıyla <strong>IP, CS ve FLAGS</strong> yazmaçlarını çekerek işlemcinin kesme öncesi durumunu eksiksiz geri yükler.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. Kesme Mekanizması & Kesme Vektör Tablosu (IVT)",
        "contentHtml": "\n                  <p>8086 mikroişlemcisinde kesmeler 3 gruba ayrılır:</p>\n                  <ul>\n                    <li><b>Donanımsal Kesmeler (Hardware Interrupts):</b> INTR bacağı (Maskelenebilir, 8259 PIC denetleyicisi ile yönetilir) ve NMI bacağı (Maskelenemez).</li>\n                    <li><b>Yazılımsal Kesmeler (Software Interrupts):</b> Programcı tarafından çağrılan <code>INT n</code> komutları (örn: <code>INT 10h, INT 21h</code>).</li>\n                    <li><b>İstisnalar (Exceptions / Hatalar):</b> Sıfıra bölme gibi CPU'nun kendi ürettiği donanımsal hatalar (<code>INT 0</code>).</li>\n                  </ul>\n\n                  <h4>Kesme Vektör Tablosu (IVT) Haritası:</h4>\n                  <table class=\"lecture-table\">\n                    <thead>\n                      <tr><th>Kesme No</th><th>Vektör Bellek Adresi</th><th>Görevi / Tanımı</th></tr>\n                    </thead>\n                    <tbody>\n                      <tr><td><code>INT 0</code></td><td><code>00000H – 00003H</code></td><td>Bölme Hatası (Divide by Zero / Overflow)</td></tr>\n                      <tr><td><code>INT 1</code></td><td><code>00004H – 00007H</code></td><td>Tek Adım İnceleme (Trap Flag TF=1 ise her komuttan sonra)</td></tr>\n                      <tr><td><code>INT 2</code></td><td><code>00008H – 0000BH</code></td><td>Maskelenemez Kesme (NMI - Güç kesintisi, RAM parite hatası)</td></tr>\n                      <tr><td><code>INT 3</code></td><td><code>0000CH – 0000FH</code></td><td>Kesme Noktası (Breakpoint - Debugger'lar komutun ilk baytına 0CCh yazar)</td></tr>\n                      <tr><td><code>INT 4</code></td><td><code>00010H – 00013H</code></td><td>Taşma Kesmesi (INTO komutu ile OF=1 ise tetiklenir)</td></tr>\n                      <tr><td><code>INT 5–31</code></td><td><code>00014H – 0007FH</code></td><td>Intel tarafından gelecekteki işlemciler için ayrılmıştır</td></tr>\n                      <tr><td><code>INT 32–255</code></td><td><code>00080H – 003FFH</code></td><td>BIOS ve DOS servisleri ile kullanıcı donanım kesmeleri</td></tr>\n                    </tbody>\n                  </table>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: Kesme Yaşam Döngüsü & BIOS/DOS Fonksiyonları",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4>Donanımın 7 Adımlı Kesme Tepkisi (Kesme Çevrimi)</h4>\n                    <ol>\n                      <li>Flags (Bayraklar) yazmacı yığına itilir (PUSH FLAGS).</li>\n                      <li>IF (Interrupt Flag) ve TF (Trap Flag) sıfırlanır (yeni maskelenebilir kesmeler engellenir).</li>\n                      <li>Mevcut CS yazmacı yığına itilir (PUSH CS).</li>\n                      <li>Mevcut IP yazmacı yığına itilir (PUSH IP).</li>\n                      <li>Kesme numarası $N$ için $N \\times 4$ adresinden yeni IP, $(N \\times 4) + 2$ adresinden yeni CS okunur.</li>\n                      <li>Kesme Servis Rutini (ISR) çalıştırılır.</li>\n                      <li>ISR sonundaki <code>IRET</code> komutu yığından sırasıyla <b>IP, CS ve FLAGS</b> değerlerini çekerek programı kaldığı yerden devam ettirir.</li>\n                    </ol>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4>BIOS & DOS Servis Komutları</h4>\n                    <ul>\n                      <li><code>INT 10h</code> (BIOS Video Servisleri):\n                        <ul>\n                          <li><code>AH = 0Eh:</code> Teletype Karakter Yazma. <code>AL = Karakter ASCII</code>, imleç otomatik ilerler.</li>\n                        </ul>\n                      </li>\n                      <li><code>INT 16h</code> (BIOS Klavye Servisleri):\n                        <ul>\n                          <li><code>AH = 00h:</code> Klavye Tuşu Bekleme. Basılan tuşun ASCII kodu <code>AL</code> içine, donanım tarama kodu (Scan Code) <code>AH</code> içine döner.</li>\n                        </ul>\n                      </li>\n                      <li><code>INT 21h</code> (DOS Servisleri):\n                        <ul>\n                          <li><code>AH = 01h:</code> Klavyeden karakter oku ve ekrana bas.</li>\n                          <li><code>AH = 02h:</code> DL'deki tek karakteri ekrana bas.</li>\n                          <li><code>AH = 09h:</code> DX ofsetindeki '$' ile biten metni ekrana bas.</li>\n                          <li><code>AH = 4Ch:</code> Programı sonlandır ve DOS'a dön.</li>\n                        </ul>\n                      </li>\n                    </ul>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde kesme komutlarını ve BIOS fonksiyonlarını test edin. <b>Cevap hazır gelmez</b>; yönergeleri izleyin.</p>\n                ",
        "examples": [
          {
            "id": "ex-m8-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 8.1: BIOS Teletype ile Ekrana Karakter Basma (Hocanın Örnek 11'i)",
            "scenario": "Hocanın Week 12 Kesme Kod Örneği 11'de yer alan BIOS INT 10h servisi kullanılarak ekrana 'A' karakteri yazdırılacaktır.",
            "task": "AH içine 0Eh (Teletype servisi), AL içine 'A' (41h) karakterini yükleyin. INT 10H komutunu çalıştırarak konsola karakteri basın ve HLT ile durun.",
            "code": "; 🟢 Kolay: BIOS Teletype Karakter Basma (Hocanin Ornek 11'i)\nORG 100H\n\n; 1. BIOS Teletype fonksiyon kodunu AH'ye yukleyin (0Eh):\n; TODO:\n\n\n; 2. Ekrana basilacak karakter olan 'A' sabitini AL'ye yukleyin:\n; TODO:\n\n\n; 3. INT 10H yazilimsal kesmesini cagirarak ekrana basin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AH, 0EH\nMOV AL, 'A'\nINT 10H\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AH, 0Eh — Video teletype fonksiyonu seçilir.",
              "2. Satır: MOV AL, 'A' — Basılacak karakter (41h) AL akümülatörüne yüklenir.",
              "3. Satır: INT 10H — BIOS video rutini çağrılır ve konsola 'A' karakteri yazdırılır."
            ],
            "examTips": "BIOS video işlemlerinde fonksiyon numarası DAİMA AH yazmacına, parametreler ise AL veya diğer yazmaçlara yüklenir."
          },
          {
            "id": "ex-m8-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 8.2: BIOS Klavye Girdisi Okuma & Yankılama (Hocanın Örnek 10'u)",
            "scenario": "Hocanın Week 12 Kod Örneği 10'da yer alan BIOS INT 16h ile kullanıcıdan tuş okuma ve okunan tuşu INT 10h ile ekrana basma (Echo) algoritması uygulanacaktır.",
            "task": "AH=00h yapıp INT 16H çağırarak klavyeden tuş okuyun (ASCII AL'ye gelir). Ardından AH=0Eh yapıp INT 10H çağırarak bu karakteri ekrana yankılayın.",
            "code": "; 🟡 Orta: Klavye Okuma ve Ekrana Yankilama (Hocanin Ornek 10'u)\nORG 100H\n\n; 1. Klavyeden tus okumak icin AH=00h yapip INT 16H cagirin:\n; TODO:\n\n\n; 2. Okunan tus AL icindedir; ekrana basmak icin AH=0Eh yapip INT 10H cagirin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AH, 00H\nINT 16H\nMOV AH, 0EH\nINT 10H\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AH, 00h ve INT 16H — İşlemci klavyeden bir tuşa basılmasını bekler. Tuş basıldığında ASCII kodu AL'ye yazılır.",
              "2. Satır: MOV AH, 0Eh ve INT 10H — AL'deki okunan karakter ekrana basılır (Echo işlemi)."
            ],
            "examTips": "INT 16h fonksiyonu basılan tuşun ASCII kodunu AL'ye, donanım Scan Code'unu ise AH'ye döndürür."
          },
          {
            "id": "ex-m8-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / Hata Ayıklama",
            "title": "Alıştırma 8.3: Yazılımsal Kesme Noktası & INT 3 (Hocanın Örnek 12'si)",
            "scenario": "Hocanın Week 12 Kod Örneği 12'de yer alan yazılımsal kesme noktası (Breakpoint) simülasyonu uygulanacaktır.",
            "task": "AX içine 1000h yükleyin. Araya INT 3 kesme komutu yerleştirin. INT 3 sonrasında BX içine 2000h yükleyin. Simülatörde kesme oluşumunu ve programın duruşunu izleyin.",
            "code": "; 🔴 Zor: Breakpoint Simulation (Hocanin Ornek 12'si)\nORG 100H\n\n; 1. AX icine 1000h yukleyin:\n; TODO:\n\n\n; 2. Yazilimsal kesme noktasi olusturmak icin INT 3 komutunu calistirin:\n; TODO:\n\n\n; 3. Kesme sonrasi BX icine 2000h yukleyin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 1000H\nINT 3\nMOV BX, 2000H\nHLT",
            "solutionBreakdown": [
              "1. Satır: AX = 1000h yüklenir.",
              "2. Satır: INT 3 komutu 1-baytlık '0CCh' makine koduna derlenir ve donanımsal kesme çağrısı tetikler.",
              "3. Satır: Normal akışta debugger kontrolü devralır. Devam edildiğinde BX = 2000h atanır."
            ],
            "examTips": "INT 3 diğer iki baytlık INT n komutlarından farklı olarak tek bir bayttan (0CCh) oluşur. Bu sayede işlemcide herhangi bir tek baytlık komutun üzerine geçici olarak yazılarak breakpoint konabilir."
          }
        ]
      }
    ]
  },
  "milestone-9": {
    "milestoneId": "milestone-9",
    "milestoneNumber": 9,
    "title": "İleri İşlemci Mimarisi, Boru Hattı (Pipelining), CISC/RISC & 8085",
    "subtitle": "5 Aşamalı Komut Boru Hattı, Hazards (Tehlikeler), Loop Unrolling, CISC vs RISC ve Intel 8085 Mimarisi",
    "slideRef": "Hoca: Week 12, 13, 14 & 15 PDF'leri, Code Examples PDF | Kitap: Barry B. Brey Bölüm 14 & 16",
    "overviewHtml": "\n          <div class=\"lecture-hero-card\">\n            <div class=\"lecture-hero-badge\">AŞAMA 9: İLERİ MİMARİLER, BORU HATTI & MİKROİŞLEMCİ EVRİMİ</div>\n            <p class=\"lecture-hero-text\">\n              Mikroişlemci performansını artırmanın temel yolu komutları ardışık değil, birbiriyle çakıştırarak (Pipelining) yürütmektir. \n              Ancak boru hattında ortaya çıkan <b>Tehlikeler (Hazards)</b> gecikmelere (stall) yol açar. Bu aşamada boru hattı optimizasyonu, Makro mimarisi ve Intel 8085 öncülü incelenir.\n            </p>\n            <div class=\"lecture-golden-rule\">\n              💡 <strong>Hocanın Altın Kuralları & Sınav Kılavuzu:</strong><br>\n              1. <b>3 Büyük Pipeline Tehlikesi (Hazards):</b><br>\n                 • <b>Structural Hazard:</b> Aynı anda iki komutun aynı donanım birimine (örn: tek bellek portu) erişmek istemesi.<br>\n                 • <b>Data Hazard (RAW - Read After Write):</b> Bir komutun henüz önceki komut tarafından yazılmamış sonucu okumaya çalışması.<br>\n                 • <b>Control Hazard:</b> Koşullu atlama (JMP/CALL) nedeniyle boru hattındaki komutların geçersiz kalıp temizlenmesi (Branch Penalty).<br>\n              2. <b>Yazılımsal Pipeline Çözümleri (Hocanın Kod Örnekleri 13 & 14):</b><br>\n                 • <b>Loop Unrolling (Döngü Açma):</b> LOOP atlama cezasını kaldırmak için döngü gövdesini ardışık yazmak.<br>\n                 • <b>Instruction Rescheduling:</b> Veri bağımlılığı olan komutların arasına bağımsız komutlar yerleştirerek bekleme çevrimlerini (NOP) ortadan kaldırmak.<br>\n              3. <b>Makro vs Prosedür (Sınav Karşılaştırması):</b> Makro derleme zamanında açılır, hızlıdır fakat kod boyutunu büyütür. Prosedür tek kopyadır, CALL/RET ile yığın kullanır, küçük boyutludur fakat daha yavaştır.\n            </div>\n          </div>\n        ",
    "sections": [
      {
        "title": "1. Komut Boru Hattı (Pipelining) ve 3 Büyük Tehlike (Hazards)",
        "contentHtml": "\n                  <p>Klasik bir RISC/CISC boru hattı 5 aşamadan oluşur:</p>\n                  <ol>\n                    <li><b>IF (Instruction Fetch):</b> Komut bellekten getirilir.</li>\n                    <li><b>ID (Instruction Decode):</b> Komut çözülür ve kaynak yazmaçlar okunur.</li>\n                    <li><b>EX (Execute):</b> ALU işlemi yürütülür veya bellek adresi hesaplanır.</li>\n                    <li><b>MEM (Memory Access):</b> Bellekten okuma veya belleğe yazma yapılır.</li>\n                    <li><b>WB (Write Back):</b> Sonuç hedef yazmaca kaydedilir.</li>\n                  </ol>\n\n                  <h4>3 Büyük Pipeline Tehlikesi & Çözümleri:</h4>\n                  <table class=\"lecture-table\">\n                    <thead>\n                      <tr><th>Tehlike Türü</th><th>Oluşma Sebebi</th><th>Donanımsal Çözüm</th><th>Yazılımsal / Derleyici Çözümü</th></tr>\n                    </thead>\n                    <tbody>\n                      <tr><td><b>Structural Hazard</b></td><td>Aynı donanım kaynağına çakışan erişim</td><td>Ayrık Komut ve Veri Önbellekleri (Harvard Mimarisi)</td><td>Pipeline Stall (Bekletme çevrimi)</td></tr>\n                      <tr><td><b>Data Hazard (RAW)</b></td><td>Yazmaç henüz güncellenmeden okunması</td><td>Operand Forwarding (Baypas hattı)</td><td><b>Instruction Rescheduling</b> (Bağımsız komut araya sokma)</td></tr>\n                      <tr><td><b>Control Hazard</b></td><td>Koşullu atlamanın yönünün belirsizliği</td><td>Branch Prediction (Dallanma Tahmini)</td><td><b>Loop Unrolling</b> (Döngüyü açarak atlamaları azaltma)</td></tr>\n                    </tbody>\n                  </table>\n                "
      },
      {
        "title": "2. Komut Kılavuzu: Makrolar vs Prosedürler & Intel 8085 Mimarisi",
        "contentHtml": "\n                  <div class=\"instruction-box\">\n                    <h4>Makro (MACRO / ENDM) vs Prosedür (PROC / ENDP)</h4>\n                    <table class=\"lecture-table\">\n                      <thead>\n                        <tr><th>Özellik</th><th>Makro (MACRO)</th><th>Prosedür (PROC)</th></tr>\n                      </thead>\n                      <tbody>\n                        <tr><td><b>Genişleme Zamanı</b></td><td>Derleme Anında (Assembler Time - Metin Değişimi)</td><td>Çalışma Anında (Run Time - CALL/RET)</td></tr>\n                        <tr><td><b>Yürütme Hızı</b></td><td>Çok Hızlı (CALL, RET ve Stack maliyeti sıfır)</td><td>Daha Yavaş (Yığına IP/CS itme-çekme çevrimleri)</td></tr>\n                        <tr><td><b>Bellek / Kod Boyutu</b></td><td>Büyük (Her çağrıldığı yerde kod tekrar kopyalanır)</td><td>Küçük (Bellekte tek kopya olarak tutulur)</td></tr>\n                        <tr><td><b>Yığın (Stack) Kullanımı</b></td><td>Yığın kullanmaz</td><td>Yığın zorunludur</td></tr>\n                      </tbody>\n                    </table>\n                  </div>\n\n                  <div class=\"instruction-box\">\n                    <h4>Intel 8085 vs 8086 Karşılaştırması (Hocanın Week 14 Slaytları)</h4>\n                    <ul>\n                      <li><b>8085:</b> 8-bitlik saf akümülatör (A) mimarisi. 16-bit adres yolu ($2^{16} = 64$ KB bellek). Yazmaçlar: <code>A (Akümülatör)</code>, <code>B-C</code>, <code>D-E</code>, <code>H-L</code> (16-bit bellek işaretçisi çiftleri), <code>SP</code>, <code>PC</code>. Adres ve veri yolu <code>AD0–AD7</code> üzerinde zaman paylaşımlıdır (multiplexed).</li>\n                      <li><b>8086:</b> 16-bit veri yolu, 20-bit adres yolu (1 MB). Segmentli bellek mimarisi (CS, DS, SS, ES) ve genel amaçlı yazmaç kümesi (AX, BX, CX, DX).</li>\n                    </ul>\n                  </div>\n                "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n                  <p>Aşağıdaki editörde boru hattı optimizasyonu ve ileri mimari simülasyonlarını test edin. <b>Cevap hazır gelmez</b>; yönergeleri izleyin.</p>\n                ",
        "examples": [
          {
            "id": "ex-m9-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 9.1: Loop Unrolling ile Pipeline Stall Engelleme (Hocanın Örnek 13'ü)",
            "scenario": "Hocanın Week 13 Pipelining Kod Örneği 13'te sunduğu 'Loop Unrolling' tekniği uygulanacaktır. 4 kez dönen bir döngü yerine 4 ardışık toplama yazılarak dallanma cezası sıfırlanacaktır.",
            "task": "AX içine 0 yükleyin. LOOP komutu yerine ardışık 4 adet ADD AX, 1 komutu yazarak AX'i 4 yapın ve HLT ile durun.",
            "code": "; 🟢 Kolay: Loop Unrolling Simulation (Hocanin Ornek 13'u)\nORG 100H\n\n; 1. AX icine 0 yukleyin:\n; TODO:\n\n\n; 2. LOOP kullanmadan, 4 adet ardisik ADD AX, 1 komutu yazarak donguyu acin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 0\nADD AX, 1\nADD AX, 1\nADD AX, 1\nADD AX, 1\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 0 — Akümülatör sıfırlanır.",
              "2-5. Satırlar: 4 adet ardışık ADD AX, 1 komutu çalışır. İşlemci hiçbir JMP/LOOP cezası (branch stall) yaşamadan boru hattını tam verimle doldurur ve AX = 4 olur."
            ],
            "examTips": "Loop Unrolling yöntemi kod boyutunu bir miktar artırır ancak dallanma cezasını (Branch Penalty) ve sayaç azaltma çevrimlerini ortadan kaldırarak maksimum hız sağlar."
          },
          {
            "id": "ex-m9-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 9.2: Instruction Rescheduling ile RAW Data Hazard Önleme (Hocanın Örnek 14'ü)",
            "scenario": "Hocanın Week 13 Pipelining Kod Örneği 14'te yer alan komut yeniden sıralama tekniği uygulanacaktır. AX'e bağımlı komutun bekleme yapmaması için araya CX ile ilgili bağımsız işlem serpiştirilecektir.",
            "task": "MOV AX, 1 yazın. AX'in sonucunu beklemeden araya bağımsız MOV CX, 2 yazın. Ardından ADD AX, 10 ve ADD CX, 20 işlemlerini yürüterek boru hattı duraklamasını (stall) önleyin.",
            "code": "; 🟡 Orta: Instruction Rescheduling (Hocanin Ornek 14'u)\nORG 100H\n\n; 1. AX icine 1 yukleyin:\n; TODO:\n\n\n; 2. RAW tehlikesini engellemek icin araya bagimsiz CX komutunu serpistirin (MOV CX, 2):\n; TODO:\n\n\n; 3. AX ile ilgili islemi yurutun (ADD AX, 10):\n; TODO:\n\n\n; 4. CX ile ilgili islemi yurutun (ADD CX, 20):\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AX, 1\nMOV CX, 2\nADD AX, 10\nADD CX, 20\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 1 komutu yürütülmeye başlar.",
              "2. Satır: AX'in yazmaç yazma (WB) aşaması beklenirken, AX ile hiçbir veri bağı olmayan MOV CX, 2 boru hattına alınır.",
              "3-4. Satırlar: ADD AX, 10 ve ADD CX, 20 ile AX=11, CX=22 elde edilir; boru hattında tek bir çevrim dahi duraklama (bubble) yaşanmaz."
            ],
            "examTips": "Instruction Rescheduling (Komut Yeniden Sıralama), modern derleyicilerin donanımsal NOP gecikmelerini önlemek için uyguladığı en temel optimizasyondur."
          },
          {
            "id": "ex-m9-zor",
            "difficulty": "zor",
            "difficultyLabel": "🔴 Zor: Gerçek Hayat / Mimari Simülasyonu",
            "title": "Alıştırma 9.3: Intel 8085 Bellek İşaretçisi (HL Çifti) Simülasyonu",
            "scenario": "Intel 8085 mimarisinde belleğe erişim HL yazmaç çifti ('M' operantı) üzerinden yürütülürdü. 8086 üzerinde bu mimari BX/SI işaretçisi ve AL akümülatörü ile simüle edilecektir.",
            "task": "BX içine [0200h] adresini yükleyin (HL çifti benzeri). [BX] adresindeki ilk veriyi AL'ye okuyun. BX'i 1 artırın. [BX] adresindeki veriyi AL ile toplayıp sonucu [0205h] adresine yazın.",
            "code": "; 🔴 Zor: Intel 8085 HL Mimari Simülasyonu\nORG 100H\n\n; 1. HL cifti yerine BX'e tablo baslangicini yukleyin (0200h):\n; TODO:\n\n\n; 2. [BX] adresindeki bayti AL akumuletorune okuyun:\n; TODO:\n\n\n; 3. HL ciftini (BX) 1 artirin:\n; TODO:\n\n\n; 4. [BX] adresindeki ikinci bayti AL ile toplayin:\n; TODO:\n\n\n; 5. Sonucu [0205h] adresine kaydedin:\n; TODO:\n\n\nHLT",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  37,
                  21,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV BX, 0200H\nMOV AL, [BX]\nINC BX\nADD AL, [BX]\nMOV [0205H], AL\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BX, 0200h — 8085'in LXI H, 0200h komutunun 8086 karşılığıdır.",
              "2. Satır: MOV AL, [BX] — 8085'in MOV A, M (bellekten akümülatöre okuma) karşılığıdır (AL = 25h).",
              "3. Satır: INC BX — HL işaretçisi bir sonraki bayta (0201h) ilerletilir.",
              "4. Satır: ADD AL, [BX] — 8085'in ADD M komutudur: 25h + 15h = 3Ah elde edilir.",
              "5. Satır: MOV [0205H], AL — Sonuç hafızaya yazılır."
            ],
            "examTips": "8085'te belleğe doğrudan adresleme dışında genel veri erişimi daima HL yazmaç çifti (M - Memory) üzerinden yapılırdı."
          }
        ]
      }
    ]
  }
};
