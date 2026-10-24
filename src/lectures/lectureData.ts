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
    "title": "Temel Veri Aktarımı Komutları & 7 Adresleme Modu (MOV, XCHG, LEA)",
    "subtitle": "Her Komut ve Adresleme Modu İçin Ayrı Ayrı Anlatım ve Anında Pratik Laboratuvarı",
    "slideRef": "Hoca: Week 3 PPTX / w3 PDF | Kitap: Barry B. Brey Bölüm 3 & 4",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 2: ADIM ADIM VERİ TRANSFERİ & ADRESLEME MODLARI</div>\n      <p class=\"lecture-hero-text\">\n        Bu derste tüm komutları tek seferde ezberlemeniz <b>beklenmemektedir</b>. \n        Her bir komut ve adresleme modu <b>tek tek, bağımsız bir modül</b> olarak ele alınmış ve hemen altına \n        <b>o spesifik komutu uygulayabileceğiniz canlı bir laboratuvar</b> entegre edilmiştir.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Öğrenme Metodolojisi:</strong><br>\n        1. Modülün kısa kuralını ve mantığını okuyun.<br>\n        2. Hemen altındaki mini editörde sadece o komut için kodu yazıp <b>COMPILE</b> ve <b>RUN / NEXT</b> ile çalıştırın.<br>\n        3. Sağdaki <b>Registers (Yazmaçlar)</b> veya <b>Memory (Bellek)</b> panelinden sonucun nasıl değiştiğini gözlerinizle görün.<br>\n        4. Sonraki modüle geçin!\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Yazmaçtan Yazmaca Veri Aktarımı (Register Addressing)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>MOV Hedef, Kaynak</code> — Register Addressing</h4>\n          <p>En temel ve en hızlı aktarımdır. Veri CPU içindeki iki yazmaç arasında kopyalanır.</p>\n          <ul>\n            <li><strong>Veri Yönü (Altın Kural):</strong> Veri <b>SAĞDAN SOLA</b> akar. <code>MOV AX, BX</code> demek $AX = BX$ demektir (BX'teki değer AX'e kopyalanır).</li>\n            <li><strong>Kaynak Silinmez:</strong> BX'in içindeki değer kaybolmaz; aynen korunur.</li>\n            <li><strong>Boyut Eşleşmesi Şarttır:</strong> İki yazmaç da aynı genişlikte olmalıdır:\n              <br>• 16-bit to 16-bit: <code>MOV AX, BX</code>, <code>MOV CX, DX</code> (Geçerli ✅)\n              <br>• 8-bit to 8-bit: <code>MOV AL, BL</code>, <code>MOV CH, DL</code> (Geçerli ✅)\n              <br>• ⚠️ <code>MOV AX, BL</code> <b>HATA!</b> (16-bit hedefe 8-bit kaynak kopyalanamaz! ❌)\n            </li>\n            <li><strong>Bayrak Etkisi:</strong> <code>MOV</code> komutu bayrakları (CF, ZF, SF, OF vb.) <strong>ASLA DEĞİŞTİRMEZ!</strong></li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-reg-reg",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: Yazmaç Kopyalama",
            "title": "Mini-Lab 1: Yazmaçtan Yazmaca Kopyalama (MOV AX, BX)",
            "scenario": "Sistem başlatıldığında BX yazmacında 0x55AA donanım durum kodu hazır bulunmaktadır. Bu kodu AX ve CX yazmaçlarına kopyalamanız isteniyor.",
            "task": "BX yazmacındaki değeri AX'e kopyalayın. Ardından AX'teki değeri CX'e kopyalayın. Programı HLT ile sonlandırın.",
            "code": "; 🟢 Mini-Lab 1: Register Addressing\nORG 100H\n\n; BX baslangic degeri: 55AAH olarak verilmistir.\nMOV BX, 55AAH\n\n; 1. BX'in degerini AX'e kopyalayin (MOV Hedef, Kaynak):\n; TODO:\n\n\n; 2. AX'in degerini CX'e kopyalayin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV BX, 55AAH\nMOV AX, BX\nMOV CX, AX\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BX, 55AAh — BX başlangıç sabiti ile yüklenir.",
              "2. Satır: MOV AX, BX — BX'teki 55AAh değeri AX'e kopyalanır (AX=55AAh, BX=55AAh).",
              "3. Satır: MOV CX, AX — AX'teki 55AAh değeri CX'e kopyalanır (CX=55AAh)."
            ],
            "examTips": "MOV komutunda hedef sol taraftadır. Asla 'MOV Kaynak, Hedef' şeklinde ters yazmayın!"
          }
        ]
      },
      {
        "title": "2. Modül: Sabit Sayı Yükleme (Immediate Addressing)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>MOV Hedef, Sabit</code> — Immediate Addressing</h4>\n          <p>Yazmaca doğrudan sabit bir sayısal değer yüklemek için kullanılır. Değer komutun makine kodu içine doğrudan gömülüdür.</p>\n          <ul>\n            <li><strong>Sayı Formatları:</strong>\n              <br>• Onaltılık (Hex): Sonuna <code>H</code> konur (örn: <code>1234H</code>, <code>0FFH</code>). <em>Eğer sayı harfle başlıyorsa (A-F) başına 0 konulmalıdır (örn: <code>0A5H</code>)!</em>\n              <br>• Onluk (Decimal): Doğrudan yazılır (örn: <code>100</code>, <code>25</code>).\n              <br>• İkilik (Binary): Sonuna <code>B</code> konur (örn: <code>10100101B</code>).\n            </li>\n            <li><strong>Kapasite Sınırı:</strong>\n              <br>• 8-bit yazmaçlar (AL, AH, BL vb.): 0 ile 255 (00H – 0FFH) arası.\n              <br>• 16-bit yazmaçlar (AX, BX, CX, DX vb.): 0 ile 65535 (0000H – 0FFFFH) arası.\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-immediate",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 2. Modül Labı: Sabit Sayı Yükleme",
            "title": "Mini-Lab 2: Immediate (Sabit) Yükleme",
            "scenario": "Bir kontrol algoritmasında sayaç (CX) 100 onluk değerine, veri maskesi (AL) 0F0h değerine, taban gösterici (BX) ise 1000h adresine kurulmalıdır.",
            "task": "CX'e 100 (decimal), AL'ye 0F0H (hex) ve BX'e 1000H (hex) sabitlerini yükleyin.",
            "code": "; 🟢 Mini-Lab 2: Immediate Addressing\nORG 100H\n\n; 1. CX'e 100 onluk (decimal) degerini yukleyin:\n; TODO:\n\n\n; 2. AL'ye 0F0H onaltilik degerini yukleyin (Harfle basladigi icin 0 ile baslayin):\n; TODO:\n\n\n; 3. BX'e 1000H degerini yukleyin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV CX, 100\nMOV AL, 0F0H\nMOV BX, 1000H\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV CX, 100 — Onluk tabanda 100 yüklenir (Hex karşılığı: 0064h).",
              "2. Satır: MOV AL, 0F0H — AL 8-bit yazmacına F0h yüklenir.",
              "3. Satır: MOV BX, 1000H — BX 16-bit yazmacına 1000h yüklenir."
            ],
            "examTips": "Hexadecimal sabit yazarken 'F0H' yazarsanız derleyici bunu değişken ismi zanneder. Harfle başlayan hex sayıların başına daima 0 koyun: '0F0H'."
          }
        ]
      },
      {
        "title": "3. Modül: Doğrudan Bellek Adresleme (Direct Addressing)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>MOV Reg, [Ofset]</code> ve <code>MOV [Ofset], Reg</code> — Direct Addressing</h4>\n          <p>Köşeli parantez <code>[...]</code>, işlemciye <em>\"bu parantezin içindeki değer bir sayı değil, belleğin adresidir; belleğe git ve oradaki veriyi oku/yaz\"</em> emrini verir.</p>\n          <ul>\n            <li><strong>Örnek:</strong> <code>MOV AX, [0200H]</code> komutu, Veri Segmentindeki (DS) 0200h ofset adresine gider ve oradaki 16-bitlik kelimeyi okuyup AX'e yazar.</li>\n            <li><strong>Belleğe Yazma:</strong> <code>MOV [0202H], AX</code> komutu ise AX'in içindeki değeri bellek hücresine yazar.</li>\n            <li><strong>🚨 1. Sınav Klasiği — Köşeli Parantez Farkı:</strong>\n              <br>• <code>MOV AX, 0200H</code> ➔ AX'in içine doğrudan 0200H sayısını koyar (Immediate).\n              <br>• <code>MOV AX, [0200H]</code> ➔ Belleğin 0200H adresindeki <b>içeriği</b> okur (Direct).\n            </li>\n            <li><strong>🚨 2. Sınav Klasiği — Bellekten Belleğe Aktarım YASAKTIR:</strong>\n              <br>• ⚠️ <code>MOV [0202H], [0200H]</code> <b>8086'DA DONANIMSAL OLARAK İMKANSIZDIR!</b>\n              <br>• Çözüm: Bellekteki veri önce bir yazmaca okunur, sonra hedef adrese yazılır:\n              <pre><code>MOV AX, [0200H]   ; 1. Once yazmaca oku\nMOV [0202H], AX   ; 2. Yazmactan hedef bellege yaz</code></pre>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-direct-mem",
            "difficulty": "orta",
            "difficultyLabel": "🟡 3. Modül Labı: Doğrudan Bellek Erişimi",
            "title": "Mini-Lab 3: Bellekten Okuma ve Başka Adrese Yazma",
            "scenario": "Belleğin [0200H] adresinde sensörden gelen 16-bitlik ham sıcaklık verisi saklanmaktadır. Bu veriyi okuyup [0202H] adresindeki telemetri çıkışına aktarmanız gerekiyor.",
            "task": "Belleğin [0200H] adresindeki 16-bit kelimeyi AX'e okuyun. Ardından AX'teki bu değeri [0202H] adresine yazın.",
            "code": "; 🟡 Mini-Lab 3: Direct Addressing\nORG 100H\n\n; 1. [0200H] adresindeki 16-bit veriyi AX yazmacina okuyun:\n; TODO:\n\n\n; 2. AX'teki degeri [0202H] adresine kaydedin:\n; TODO:\n\n\nHLT\n",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  239,
                  190
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV AX, [0200H]\nMOV [0202H], AX\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, [0200H] — DS:0200h adresindeki Little-Endian (EF BE) verisi AX'e 0xBEEF olarak okunur.",
              "2. Satır: MOV [0202H], AX — AX'teki 0xBEEF değeri DS:0202h bellek adresine yazılır."
            ],
            "examTips": "Doğrudan 'MOV [0202H], [0200H]' yazamazsınız! 8086'da bellekten belleğe komut yoktur; mutlaka bir aracı yazmaç (AX, BX, CX vb.) kullanılmalıdır."
          }
        ]
      },
      {
        "title": "4. Modül: Yazmaç Dolaylı Adresleme (Register Indirect Addressing)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>MOV Reg, [İşaretçi]</code> — Register Indirect Addressing</h4>\n          <p>Adresi doğrudan komutun içine sabit yazmak yerine, adresi bir <b>işaretçi yazmacın (Pointer Register)</b> içine koyup belleğe o yazmaç üzerinden erişiriz.</p>\n          <ul>\n            <li><strong>🚨 Çok Önemli Sınav Kuralı (Hangi Yazmaçlar Köşeli Paranteze Girebilir?):</strong>\n              <br>8086'da köşeli parantez içine <strong>YALNIZCA 4 TANE YAZMAÇ</strong> girebilir:\n              <br>✅ <code>[BX]</code> ➔ Taban (Base)\n              <br>✅ <code>[BP]</code> ➔ Taban İşaretçisi (Base Pointer - Varsayılan segment: <b>SS</b>)\n              <br>✅ <code>[SI]</code> ➔ Kaynak İndeksi (Source Index)\n              <br>✅ <code>[DI]</code> ➔ Hedef İndeksi (Destination Index)\n              <br>❌ <code>[AX]</code>, <code>[CX]</code>, <code>[DX]</code>, <code>[SP]</code> <b>ASLA KÖŞELİ PARANTEZE GİREMEZ!</b>\n              <br>Örn: <code>MOV AX, [CX]</code> ➔ <b>SÖZDİZİM HATASI!</b> (Sınavda hoca sıklıkla sorar!).\n            </li>\n            <li><strong>Varsayılan Segment Kuralı:</strong>\n              <br>• <code>[BX]</code>, <code>[SI]</code>, <code>[DI]</code> kullanıldığında CPU otomatik olarak <b>DS (Data Segment)</b> kullanır.\n              <br>• <code>[BP]</code> kullanıldığında CPU otomatik olarak <b>SS (Stack Segment)</b> kullanır!\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-reg-indirect",
            "difficulty": "orta",
            "difficultyLabel": "🟡 4. Modül Labı: Pointer ile Dolaylı Bellek Erişimi",
            "title": "Mini-Lab 4: BX İşaretçisi ile Bellek Okuma",
            "scenario": "Dinamik bir bellek tamponuna erişmek için BX yazmacını gösterici (pointer) olarak kullanmanız gerekiyor. Tampon başlangıcı 0200H adresidir.",
            "task": "BX yazmacına 0200H adresini yükleyin (Immediate). Ardından [BX] dolaylı adreslemesini kullanarak o adresteki 16-bit veriyi DX yazmacına okuyun.",
            "code": "; 🟡 Mini-Lab 4: Register Indirect Addressing\nORG 100H\n\n; 1. BX yazmacina tampon baslangic ofsetini (0200H) yukleyin:\n; TODO:\n\n\n; 2. [BX] dolayli adreslemesi ile bellekteki veriyi DX yazmacina okuyun:\n; TODO:\n\n\nHLT\n",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  66,
                  19
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV BX, 0200H\nMOV DX, [BX]\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BX, 0200H — BX yazmacı bellek işaretçisi (pointer) olarak hazırlanır.",
              "2. Satır: MOV DX, [BX] — CPU, BX'in tuttuğu 0200h adresine gider ve oradaki 16-bit kelimeyi (1342h) DX'e okur."
            ],
            "examTips": "Neden doğrudan [0200H] yerine [BX] kullanılır? Çünkü BX bir yazmaçtır; döngü içinde INC BX yaparak bir sonraki bellek hücresine kolayca ilerleyebilirsiniz!"
          }
        ]
      },
      {
        "title": "5. Modül: Taban ve İndeks Bağıl Adresleme (Based & Indexed Addressing)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>MOV Reg, [BX + Ofset]</code> ve <code>MOV Reg, [SI + Ofset]</code></h4>\n          <p>Bir işaretçi yazmacın üzerine sabit bir yer değiştirme (displacement / ofset) eklenerek bellek adresinin hesaplanmasıdır.</p>\n          <ul>\n            <li><strong>Based Addressing (Taban Adresleme):</strong> <code>MOV AX, [BX + 4]</code> veya <code>MOV AX, [BP - 2]</code>\n              <br>Kullanım Alanı: Veri yapıları (struct/record) ve yerel fonksiyon değişkenleri. Taban adresi BX'tedir, yapı alanlarına (+4, +8 vb.) sabit ofsetle ulaşılır.\n            </li>\n            <li><strong>Indexed Addressing (İndeksli Adresleme):</strong> <code>MOV AX, [SI + 10H]</code> veya <code>MOV AX, [DI + 2]</code>\n              <br>Kullanım Alanı: Dizi (array) ve tablo işlemleri. Dizi başlangıcı sabittir (+10H), SI indisi ile elemanlar taranır.\n            </li>\n            <li><strong>Sözdizim Esnekliği:</strong> <code>[BX + 4]</code> ile <code>[BX][4]</code> veya <code>4[BX]</code> yazılışları tamamen aynı anlama gelir ve aynı makine kodunu üretir.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-based-indexed",
            "difficulty": "orta",
            "difficultyLabel": "🟡 5. Modül Labı: Based/Indexed Ofsetli Erişim",
            "title": "Mini-Lab 5: [BX + Ofset] ile Tablo Elemanı Okuma",
            "scenario": "Bir sensör kalibrasyon tablosu 0200H adresinde başlamaktadır. Tablonun 4. baytındaki kalibrasyon katsayısını [BX + 4] adresleme modu ile AL yazmacına okuyun.",
            "task": "BX'e taban adresi olan 0200H değerini yükleyin. Ardından [BX + 4] komutunu kullanarak o adresteki 8-bitlik veriyi AL yazmacına okuyun.",
            "code": "; 🟡 Mini-Lab 5: Based Addressing\nORG 100H\n\n; 1. BX'e tablo baslangic adresini (0200H) yukleyin:\n; TODO:\n\n\n; 2. [BX + 4] adresleme modu ile 4 bayt ilerideki veriyi AL'ye okuyun:\n; TODO:\n\n\nHLT\n",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  16,
                  32,
                  48,
                  64,
                  153
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV BX, 0200H\nMOV AL, [BX + 4]\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BX, 0200H — Taban adres BX içine alınır.",
              "2. Satır: MOV AL, [BX + 4] — CPU efektif adresi hesaplar: 0200H + 4 = 0204H. O adresteki bayt (99H) AL yazmacına okunur."
            ],
            "examTips": "Burada AL 8-bit olduğu için bellekten sadece 1 bayt (99H) okunur. Eğer MOV AX, [BX+4] yazılsaydı 16-bit (2 bayt) okunurdu."
          }
        ]
      },
      {
        "title": "6. Modül: Taban-İndeksli Adresleme (Based-Indexed Addressing)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>MOV Reg, [Taban + İndeks + Ofset]</code> — Based-Indexed Addressing</h4>\n          <p>8086'nın en gelişmiş bellek adresleme modudur. <b>Bir taban yazmacı (BX veya BP)</b> ile <b>bir indeks yazmacı (SI veya DI)</b> toplanır, istenirse üzerine sabit bir deplasman eklenir.</p>\n          <ul>\n            <li><strong>Formül:</strong> <code>Efektif Adres = Taban + İndeks + Deplasman</code></li>\n            <li><strong>Geçerli Kombinasyonlar:</strong>\n              <br>✅ <code>[BX + SI]</code>, <code>[BX + DI]</code>\n              <br>✅ <code>[BP + SI]</code>, <code>[BP + DI]</code> (Varsayılan segment SS!)\n              <br>✅ <code>[BX + SI + 4]</code>, <code>[BP + DI + 8]</code>\n            </li>\n            <li><strong>🚨 Sınav Tuzağı — İki Taban veya İki İndeks Toplanamaz:</strong>\n              <br>❌ <code>[BX + BP]</code> <b>YASAK!</b> (İkisi de taban yazmacıdır).\n              <br>❌ <code>[SI + DI]</code> <b>YASAK!</b> (İkisi de indeks yazmacıdır).\n              <br>Bir taban ile bir indeks eşleşmek zorundadır!\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-based-index-comb",
            "difficulty": "zor",
            "difficultyLabel": "🔴 6. Modül Labı: 2D Matris Erişimi",
            "title": "Mini-Lab 6: [BX + SI + 2] Taban-İndeks Adresleme",
            "scenario": "2 boyutlu bir matris bellek hücrelerinde tutulmaktadır. BX satır başlangıcını (0200H), SI sütun ofsetini (0010H) göstermektedir. +2 baytlık başlık ofseti ile hedef hücreyi okuyun.",
            "task": "BX=0200H, SI=0010H yükleyin. Ardından [BX + SI + 2] komutu ile adresteki 16-bit kelimeyi AX yazmacına okuyun (Efektif Adres: 0212H).",
            "code": "; 🔴 Mini-Lab 6: Based-Indexed Addressing\nORG 100H\n\n; 1. BX'e 0200H yukleyin:\n; TODO:\n\n\n; 2. SI'ye 0010H yukleyin:\n; TODO:\n\n\n; 3. [BX + SI + 2] adresleme modu ile veriyi AX'e okuyun:\n; TODO:\n\n\nHLT\n",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 530,
                "bytes": [
                  119,
                  136
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV BX, 0200H\nMOV SI, 0010H\nMOV AX, [BX + SI + 2]\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BX, 0200H — Taban adresi.",
              "2. Satır: MOV SI, 0010H — Sütun indisi.",
              "3. Satır: MOV AX, [BX + SI + 2] — Efektif adres: 0200H + 0010H + 2 = 0212H. Bellekten 8877h kelimesi okunur."
            ],
            "examTips": "[BX+SI+2] yazımı ile [BX][SI][2] tamamen aynı anlama gelir."
          }
        ]
      },
      {
        "title": "7. Modül: Segment Yazmaç Kuralları & Başlatma Kısıtlamaları",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4>Segment Yazmaçlarının Özel Kuralları (CS, DS, SS, ES)</h4>\n          <p>Segment yazmaçları 8086 mimarisinde 64 KB'lık bellek bloklarının tabanını gösterir ve donanımsal korumalara tabidir.</p>\n          <ul>\n            <li><strong>🚨 1. Kural: Segment Yazmacına Sabit (Immediate) Atılamaz!</strong>\n              <br>• ❌ <code>MOV DS, 1000H</code> <b>KESİNLİKLE YASAKTIR!</b>\n              <br>• Doğru Yöntem: Sabit sayı önce genel bir yazmaca (örn: AX) yüklenir, ardından segment yazmacına aktarılır:\n              <pre><code>MOV AX, 1000H   ; Once AX'e yukle\nMOV DS, AX      ; Sonra DS'ye aktar</code></pre>\n            </li>\n            <li><strong>🚨 2. Kural: CS Yazmacı Asla Hedef Olamaz!</strong>\n              <br>• ❌ <code>MOV CS, AX</code> <b>YASAKTIR!</b>\n              <br>• Sebep: Eğer CS doğrudan değiştirilebilirse işlemcinin yürütme akışı bozulur. CS yalnızca JMP ve CALL ile değişebilir.\n            </li>\n            <li><strong>🚨 3. Kural: İki Segment Yazmacı Arasında Doğrudan Aktarım Yoktur!</strong>\n              <br>• ❌ <code>MOV DS, ES</code> <b>YASAKTIR!</b> (Araya AX girmelidir: <code>MOV AX, ES</code> ➔ <code>MOV DS, AX</code>).\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-segment-init",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 7. Modül Labı: Segment Başlatma",
            "title": "Mini-Lab 7: Data Segmentini (DS) Kurallara Uygun Başlatma",
            "scenario": "Bir DOS programı başlarken veri segmentinin (DS) taban adresini 2000H segmentine ayarlamanız gerekmektedir.",
            "task": "DS yazmacına doğrudan sabit yükleyemezsiniz. AX yazmacını aracı olarak kullanarak DS yazmacını 2000H segmentine ayarlayın.",
            "code": "; 🟢 Mini-Lab 7: Segment Register Rules\nORG 100H\n\n; 1. Araci genel yazmac olan AX'e 2000H sabitini yukleyin:\n; TODO:\n\n\n; 2. AX'teki bu degeri DS segment yazmacina aktarin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 2000H\nMOV DS, AX\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 2000H — 2000h segment adresi AX genel amaçlı yazmacına alınır.",
              "2. Satır: MOV DS, AX — AX üzerinden DS segment yazmacı güncellenir."
            ],
            "examTips": "Sınavda hoca 'MOV DS, 1000H komutu neden hata verir?' diye sorar. Cevap: 8086 mimarisinde segment yazmaçlarına doğrudan ivedi (immediate) sabit atanamaz; mutlaka genel bir yazmaç üzerinden aktarılmalıdır."
          }
        ]
      },
      {
        "title": "8. Modül: XCHG Komutu ile Atomik Değer Takası",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>XCHG Hedef, Kaynak</code> (Exchange / Değer Takası)</h4>\n          <p>İki operantın değerini birbirleriyle donanımsal olarak yer değiştirir.</p>\n          <ul>\n            <li><strong>Neden Kullanılır?</strong> Normalde iki değişkeni takas etmek için 3. bir geçici değişkene (temp) ihtiyaç vardır. <code>XCHG</code> tek komutta ve donanımsal atomik çevrimde takas yapar.</li>\n            <li><strong>Desteklenen Durumlar:</strong>\n              <br>✅ Register ile Register: <code>XCHG AX, BX</code> (AX ve BX yer değiştirir).\n              <br>✅ Register ile Bellek: <code>XCHG AL, [0200H]</code> (AL ile bellek hücresi takas edilir).\n            </li>\n            <li><strong>🚨 Kesin Yasaklar (Sınav Sorusu):</strong>\n              <br>❌ İki bellek hücresi takas edilemez: <code>XCHG [0100H], [0200H]</code> <b>YASAK!</b>\n              <br>❌ Segment yazmaçları takas edilemez: <code>XCHG AX, DS</code> <b>YASAK!</b>\n              <br>❌ Sabit (Immediate) sayı takas edilemez: <code>XCHG AX, 5</code> <b>YASAK!</b>\n              <br>❌ Durum bayraklarını <b>ETKİLEMEZ!</b>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-xchg-swap",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 8. Modül Labı: XCHG Atomik Takas",
            "title": "Mini-Lab 8: AX ve BX Değerlerini Takas Etme",
            "scenario": "Kanal A (AX = 1111H) ve Kanal B (BX = 2222H) tamponları karıştı. İki yazmacın içeriğini tek bir XCHG komutu ile yer değiştirin.",
            "task": "AX'e 1111H, BX'e 2222H yükleyin. Ardından XCHG AX, BX komutu ile değerleri takas edin. Adım adım (NEXT) çalıştırarak Register panelinde izleyin.",
            "code": "; 🟢 Mini-Lab 8: XCHG Komutu\nORG 100H\n\nMOV AX, 1111H\nMOV BX, 2222H\n\n; 1. AX ve BX degerlerini tek bir XCHG komutu ile yer degistirin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 1111H\nMOV BX, 2222H\nXCHG AX, BX\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 1111H (AX = 1111h)",
              "2. Satır: MOV BX, 2222H (BX = 2222h)",
              "3. Satır: XCHG AX, BX — İşlemci atomik olarak AX=2222h, BX=1111h yapar."
            ],
            "examTips": "XCHG komutu bayrakları değiştirmez ve üçüncü bir yazmaca ihtiyaç duymaz."
          }
        ]
      },
      {
        "title": "9. Modül: LEA (Load Effective Address) Komutu",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>LEA Hedef, Kaynak</code> (Load Effective Address)</h4>\n          <p>Kaynak adresin <b>bellekteki içeriğini DEĞİL</b>, o adresin matematiksel olarak <b>hesaplanan ofset değerini</b> hedef yazmaca yükler.</p>\n          <ul>\n            <li><strong>Nasıl Çalışır?</strong> <code>LEA BX, [SI + 4]</code> komutunda işlemci belleğe hiç gitmez! Yalnızca $SI + 4$ toplamasını yapar ve sonucu BX'e yazar.</li>\n            <li><strong>🚨 En Büyük Sınav Klasiği: LEA vs MOV Farkı:</strong>\n              <table class=\"lecture-table\">\n                <thead>\n                  <tr><th>Komut</th><th>Ne Yapar?</th><th>Açıklama</th></tr>\n                </thead>\n                <tbody>\n                  <tr><td><code>MOV AX, [SI + 4]</code></td><td>Bellek İçeriğini Okur</td><td>Belleğe gider ve o adresteki veriyi çeker.</td></tr>\n                  <tr><td><code>LEA AX, [SI + 4]</code></td><td>Ofset Adresini Hesaplar</td><td>Belleğe gitmez! Sadece $SI + 4$ değerini AX'e yazar.</td></tr>\n                  <tr><td><code>MOV AX, OFFSET Dizi</code></td><td>Sabit Ofset Alır</td><td>Derleme anında (Compile-time) bilinen sabit adresler içindir.</td></tr>\n                  <tr><td><code>LEA AX, [BX + SI + 4]</code></td><td>Dinamik Ofset Alır</td><td>Çalışma anında (Run-time) yazmaçlara bağlı dinamik formüller içindir.</td></tr>\n                </tbody>\n              </table>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m2-lea-calc",
            "difficulty": "orta",
            "difficultyLabel": "🟡 9. Modül Labı: LEA Efektif Adres Yükleme",
            "title": "Mini-Lab 9: LEA ile Belleğe Gitmeden Adres Hesaplama",
            "scenario": "Dizi indeksleme işleminde hedef gösterici (DI), BX tabanı (0100H) ve SI indisinin (0020H) toplamına +4 eklenerek hesaplanacaktır.",
            "task": "BX=0100H, SI=0020H yükleyin. LEA DI, [BX + SI + 4] komutunu çalıştırarak DI içine hesaplanan adresi (0124H) yükleyin.",
            "code": "; 🟡 Mini-Lab 9: LEA Komutu\nORG 100H\n\nMOV BX, 0100H\nMOV SI, 0020H\n\n; 1. LEA komutu ile [BX + SI + 4] adresini DI register'ina aktarin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV BX, 0100H\nMOV SI, 0020H\nLEA DI, [BX + SI + 4]\nHLT",
            "solutionBreakdown": [
              "1. Satır: BX = 0100H",
              "2. Satır: SI = 0020H",
              "3. Satır: LEA DI, [BX + SI + 4] — CPU bellek okuması yapmaz; 0100H + 0020H + 4 = 0124H değerini doğrudan DI'ye atar."
            ],
            "examTips": "LEA komutu 8086'da çarpma içermeyen hızlı toplama hileleri (örn: LEA AX, [BX+SI]) için de sıklıkla kullanılır ve bayrakları etkilemez!"
          }
        ]
      }
    ]
  },
  "milestone-3": {
    "milestoneId": "milestone-3",
    "milestoneNumber": 3,
    "title": "Aritmetik İşlemler & Bayraklar (ADD, ADC, SUB, SBB, MUL, DIV)",
    "subtitle": "Her Aritmetik Komut İçin Ayrı Anlatım, Durum Bayrakları ve Anında Pratik Laboratuvarı",
    "slideRef": "Hoca: Week 5 PPTX / w5, w11 PDF | Kitap: Barry B. Brey Bölüm 5",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 3: ADIM ADIM ARİTMETİK & BAYRAK ANALİZİ</div>\n      <p class=\"lecture-hero-text\">\n        8086 mikroişlemcisinde tüm aritmetik hesaplamalar 16-bitlik ALU tarafından yürütülür. \n        Her işlem sonucunda <b>Bayraklar (Flags)</b> yazmacındaki durum bitleri (CF, ZF, SF, OF, AF, PF) donanımsal olarak kurulur.\n        Bu derste her aritmetik komut bağımsız bir modül olarak incelenir ve hemen altında pratik laboratuvarı yer alır.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın 3 Altın Aritmetik Sınav Kuralı:</strong><br>\n        1. <b>INC ve DEC Kuralı (Sınav Klasiği):</b> <code>INC</code> ve <code>DEC</code> komutları ZF, SF, OF bayraklarını günceller fakat <strong>CARRY FLAG'i (CF) ASLA DEĞİŞTİRMEZ!</strong> Çok kelimeli döngülerde sayaç artırılırken elde kaybolmasın diye bu özellik kasıtlı tasarlanmıştır.<br>\n        2. <b>Bölme Aşımı (Divide Overflow / INT 0):</b> Bölme işleminde bölen 0 ise veya bölüm sonucu hedef yazmaca sığmıyorsa, işlemci otomatik olarak <strong>Interrupt 0 (Bölme Hatası)</strong> üretir!<br>\n        3. <b>İşaret Genişletme:</b> <code>IDIV</code> öncesinde negatif sayının işaretini yaymak için bayt için <code>CBW</code>, kelime için <code>CWD</code> kullanılmalıdır.\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Temel Toplama ve Çıkarma (ADD & SUB)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>ADD Hedef, Kaynak</code> ve <code>SUB Hedef, Kaynak</code></h4>\n          <p>En temel iki aritmetik komuttur. 6 durum bayrağının tamamını (CF, ZF, SF, OF, AF, PF) işlem sonucuna göre günceller.</p>\n          <ul>\n            <li><code>ADD Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef + Kaynak$</li>\n            <li><code>SUB Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef - Kaynak$</li>\n            <li><strong>Bayrak Mantığı:</strong>\n              <br>• Sonuç sıfır çıkarsa ➔ <b>ZF = 1</b> (Zero Flag)\n              <br>• Sonucun en yüksek biti (MSB) 1 ise ➔ <b>SF = 1</b> (Sign Flag - Negatif)\n              <br>• İşaretsiz toplamada elde çıkarsa veya çıkarmada borç alınırsa ➔ <b>CF = 1</b> (Carry Flag)\n              <br>• İşaretli iki sayı toplandığında kapasite aşılırsa ➔ <b>OF = 1</b> (Overflow Flag)\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m3-add-sub",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: ADD ve SUB",
            "title": "Mini-Lab 3.1: Toplama ve Çıkarma ile Paket Sayımı",
            "scenario": "Bir ağ anahtarında gelen paket sayısı (AX=50), işlenen paketler (BX=30) ile toplanacak ve ardından hatalı paketler (CX=15) çıkarılacaktır.",
            "task": "AX = AX + BX yapın. Ardından AX = AX - CX yapın. HLT ile programı bitirin. Sağdaki Bayraklar panelinde ZF ve CF durumlarını izleyin.",
            "code": "; 🟢 Mini-Lab 3.1: ADD ve SUB\nORG 100H\n\nMOV AX, 50\nMOV BX, 30\nMOV CX, 15\n\n; 1. AX = AX + BX toplamasini yapin:\n; TODO:\n\n\n; 2. AX = AX - CX cikarmasini yapin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 50\nMOV BX, 30\nMOV CX, 15\nADD AX, BX\nSUB AX, CX\nHLT",
            "solutionBreakdown": [
              "1. Satır: ADD AX, BX — 50 + 30 = 80 (50H) AX içine yazılır.",
              "2. Satır: SUB AX, CX — 80 - 15 = 65 (41H) AX içine yazılır. ZF=0, CF=0 olur."
            ],
            "examTips": "Toplama ve çıkarma komutları hedef yazmacın eski değerinin üzerine yeni sonucu yazar."
          }
        ]
      },
      {
        "title": "2. Modül: Bir Artırma ve Bir Azaltma (INC & DEC) — Altın Sınav Kuralı",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>INC Hedef</code> ve <code>DEC Hedef</code></h4>\n          <p>Yazmaç veya bellek içeriğini 1 artırır ($+1$) veya 1 azaltır ($-1$). Döngü sayaçlarında ve adres ilerletmede kullanılır.</p>\n          <ul>\n            <li><code>INC AX</code> $\\rightarrow$ $AX = AX + 1$ | <code>DEC CX</code> $\\rightarrow$ $CX = CX - 1$</li>\n            <li><code>ADD AX, 1</code> yerine <code>INC AX</code> kullanmak kodu 1 bayta indirir ve daha hızlıdır.</li>\n            <li>🚨 <strong>HOCANIN EN ÇOK SORDUĞU SINAV SORUSU:</strong>\n              <br><code>INC</code> ve <code>DEC</code> komutları ZF, SF, OF, AF, PF bayraklarını günceller fakat <strong>CARRY FLAG'İ (CF - ELDE BAYRAĞI) ASLA DEĞİŞTİRMEZ!</strong>\n              <br>Örnek: AX = 0FFFFH iken <code>INC AX</code> çalışırsa AX = 0000H olur, <b>ZF=1</b> olur fakat <b>CF kesinlikle 0 kalır!</b>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m3-inc-dec",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 2. Modül Labı: INC ve DEC",
            "title": "Mini-Lab 3.2: Sayaç Artırma/Azaltma ve CF Analizi",
            "scenario": "Döngü sayacı CX=5 olarak verilmiştir. CX değerini DEC ile 1 azaltın. Ardından AX=0FFFFH iken INC AX çalıştırarak CF'nin 0 kaldığını kanıtlayın.",
            "task": "CX'i DEC ile 1 azaltın. Ardından INC AX komutunu çalıştırın. AX'in sıfırlandığını ama CF bayrağının 0 kaldığını Registers panelinden doğrulayın.",
            "code": "; 🟢 Mini-Lab 3.2: INC ve DEC\nORG 100H\n\nMOV CX, 5\nMOV AX, 0FFFFH\n\n; 1. CX'i DEC komutu ile 1 azaltin:\n; TODO:\n\n\n; 2. AX'i INC komutu ile 1 artirin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV CX, 5\nMOV AX, 0FFFFH\nDEC CX\nINC AX\nHLT",
            "solutionBreakdown": [
              "1. Satır: DEC CX — CX = 4 olur.",
              "2. Satır: INC AX — FFFFh + 1 = 0000h olur. Sonuç sıfır çıktığı için ZF=1 olur, ancak INC kuralı gereği CARRY FLAG (CF) 0 kalır!"
            ],
            "examTips": "Sınavda hoca 'AX=FFFFh iken INC AX sonrası CF ve ZF ne olur?' diye sorarsa cevap: ZF=1, CF=0 (değişmez)!"
          }
        ]
      },
      {
        "title": "3. Modül: İki'nin Tümleyeni ile İşaret Değiştirme (NEG)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>NEG Hedef</code> (Two's Complement / Negatifleme)</h4>\n          <p>Hedefteki sayının işaretini tersine çevirir ($Hedef = 0 - Hedef$). Pozitif sayıyı negatif, negatifi pozitif yapar.</p>\n          <ul>\n            <li>Örnek: $AX = 5$ iken <code>NEG AX</code> $\\rightarrow$ $AX = -5$ (16-bit karşılığı: <code>0FFFBH</code>).</li>\n            <li><strong>NOT vs NEG Farkı:</strong> <code>NOT</code> komutu sadece 1'e tümleyen alır (bitleri tersler) ve bayrakları etkilemez. <code>NEG</code> ise 2'nin tümleyenini alır ve bayrakları (özellikle CF ve ZF) günceller.</li>\n            <li><strong>Bayrak Kuralı:</strong> Eğer sayı 0 ise sonuç 0 ve CF=0 olur. Sayı 0 dışında herhangi bir sayı ise <code>NEG</code> işlemi daima <b>CF = 1</b> yapar!</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m3-neg",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 3. Modül Labı: NEG Komutu",
            "title": "Mini-Lab 3.3: Sıcaklık Farkını Negatife Çevirme",
            "scenario": "Pozitif bir sapma değeri olan 25 (0019h), iki'nin tümleyeni formatında -25 olarak sistem belleğine aktarılmalıdır.",
            "task": "AX yazmacındaki 25 değerini NEG komutu ile negatif yapın (-25 / 0xFFE7).",
            "code": "; 🟢 Mini-Lab 3.3: NEG Komutu\nORG 100H\n\nMOV AX, 25\n\n; 1. AX'in iki'nin tumleyenini (negatifini) alin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 25\nNEG AX\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 25 (AX = 0019H)",
              "2. Satır: NEG AX — 0 - 0019H = 0FFE7H (-25). CF=1 ve SF=1 kurulur."
            ],
            "examTips": "NEG komutu 0'dan hedefi çıkardığı için hedef sıfır olmadığı sürece daima CF=1 kurar."
          }
        ]
      },
      {
        "title": "4. Modül: 32-Bit Genişletilmiş Eldeli Toplama ve Borçlu Çıkarma (ADC & SBB)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>ADC</code> (Add with Carry) ve <code>SBB</code> (Subtract with Borrow)</h4>\n          <p>8086 bir 16-bit işlemcidir fakat 32-bit veya daha geniş çok kelimeli sayıları toplamak/çıkarmak için <code>ADC</code> ve <code>SBB</code> kullanılır.</p>\n          <ul>\n            <li><code>ADC Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef + Kaynak + CF$ (Alt parçadan gelen eldeyi üst parçaya ekler).</li>\n            <li><code>SBB Hedef, Kaynak</code> $\\rightarrow$ $Hedef = Hedef - Kaynak - CF$ (Alt parçadan gelen borcu üst parçadan düşer).</li>\n            <li><strong>32-Bit Toplama Şablonu (Hocanın Slaytı):</strong>\n              <pre><code>; Sayi 1: DX:AX (DX yuksek, AX dusuk 16-bit)\n; Sayi 2: CX:BX (CX yuksek, BX dusuk 16-bit)\nADD AX, BX      ; 1. Dusuk 16-bitleri topla, tasarsa CF=1 kurulur\nADC DX, CX      ; 2. Yuksek 16-bitleri topla + alt kelimeden gelen CF'yi ekle!</code></pre>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m3-adc-32",
            "difficulty": "orta",
            "difficultyLabel": "🟡 4. Modül Labı: ADC ile 32-Bit Toplama",
            "title": "Mini-Lab 3.4: 32-Bit İki Sayıyı Toplama (DX:AX + CX:BX)",
            "scenario": "Sayı 1 = 0001FFFFH (DX:AX), Sayı 2 = 00020001H (CX:BX). Düşük parçalar (FFFFh + 0001h) toplanınca 0000h çıkar ve CF=1 elde üretilir.",
            "task": "Önce ADD AX, BX ile düşük parçaları toplayın. Ardından ADC DX, CX ile yüksek parçaları toplayıp eldeyi sonuca dahil edin (Sonuç DX:AX = 00040000H).",
            "code": "; 🟡 Mini-Lab 3.4: 32-Bit Toplama\nORG 100H\n\nMOV DX, 0001H\nMOV AX, 0FFFFH\nMOV CX, 0002H\nMOV BX, 0001H\n\n; 1. Dusuk 16-bitleri ADD ile toplayin:\n; TODO:\n\n\n; 2. Yuksek 16-bitleri ADC ile toplayin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV DX, 0001H\nMOV AX, 0FFFFH\nMOV CX, 0002H\nMOV BX, 0001H\nADD AX, BX\nADC DX, CX\nHLT",
            "solutionBreakdown": [
              "1. Satır: ADD AX, BX — FFFFh + 0001h = 0000h, taşma olduğu için CF=1 kurulur.",
              "2. Satır: ADC DX, CX — 0001h + 0002h + 1 (CF) = 0004h. Toplam sonuç: 00040000H."
            ],
            "examTips": "ADC komutundan önce asla INC veya başka bir işlem araya sokulmamalıdır, yoksa elde zinciri bozulabilir."
          }
        ]
      },
      {
        "title": "5. Modül: Çarpma İşlemleri (MUL & IMUL) — DX:AX Register Çifti",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>MUL Operant</code> (Unsigned) ve <code>IMUL Operant</code> (Signed)</h4>\n          <p>Çarpma işleminde çarpanlardan biri DAİMA akümülatörde (AL veya AX) bulunmak zorundadır!</p>\n          <ul>\n            <li><strong>8-Bit Çarpma:</strong> <code>MUL BL</code> $\\rightarrow$ $AX = AL \\times BL$. 16-bit sonuç doğrudan <code>AX</code> yazmacına yazılır.</li>\n            <li><strong>16-Bit Çarpma:</strong> <code>MUL BX</code> $\\rightarrow$ $DX:AX = AX \\times BX$. 32-bit sonucun üst 16 biti <code>DX</code>, alt 16 biti <code>AX</code> içine yazılır.</li>\n            <li><strong>Bayrak Mantığı:</strong> Sonucun üst yarısı anlamlı veri içeriyorsa (sıfır değilse) <b>CF = 1</b> ve <b>OF = 1</b> olur.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m3-mul",
            "difficulty": "orta",
            "difficultyLabel": "🟡 5. Modül Labı: MUL ile Karesini Alma",
            "title": "Mini-Lab 3.5: 16-Bit Sayının Karesini Hesaplama",
            "scenario": "AX = 1000 (03E8h) sayısının karesi hesaplanacaktır ($1000 \\times 1000 = 1,000,000 = 000F4240H$). Sonuç DX:AX ikilisine yazılacaktır.",
            "task": "AX'in değerini BX'e kopyalayın ve MUL BX komutu ile çarpımı gerçekleştirin. Sonucun DX ve AX içindeki dağılımını izleyin.",
            "code": "; 🟡 Mini-Lab 3.5: 16-Bit MUL\nORG 100H\n\nMOV AX, 1000\n\n; 1. AX'i BX'e kopyalayin:\n; TODO:\n\n\n; 2. MUL BX ile carpimi gerceklestirin (DX:AX = AX * BX):\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 1000\nMOV BX, AX\nMUL BX\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BX, AX — Çarpan BX'e kopyalanır (BX = 03E8h).",
              "2. Satır: MUL BX — 1000 * 1000 = 1,000,000 = 000F4240h. DX = 000Fh, AX = 4240h olur."
            ],
            "examTips": "16-bit çarpmada sonucun üst kısmı DX'e taştığı için DX içindeki önceki veri ezilir!"
          }
        ]
      },
      {
        "title": "6. Modül: Bölme ve İşaret Genişletme (DIV, IDIV, CBW, CWD) — INT 0 Uyarısı",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>DIV Operant</code> ve <code>IDIV Operant</code></h4>\n          <p>Bölme işleminde bölünen sayı daima akümülatör çiftindedir ve sonuç hem bölümü hem kalanı (modulus) üretir.</p>\n          <ul>\n            <li><strong>8-Bit Bölme (Bölünen AX, Bölen r/m8):</strong>\n              <br>• Bölüm $\\rightarrow$ <code>AL</code> | Kalan $\\rightarrow$ <code>AH</code>\n            </li>\n            <li><strong>16-Bit Bölme (Bölünen DX:AX, Bölen r/m16):</strong>\n              <br>• Bölüm $\\rightarrow$ <code>AX</code> | Kalan $\\rightarrow$ <code>DX</code>\n            </li>\n            <li><strong>İşaret Genişletme Komutları (IDIV Öncesi Zorunludur!):</strong>\n              <br>• <code>CBW</code> (Convert Byte to Word): AL'nin işaret bitini AH'ye yayar.\n              <br>• <code>CWD</code> (Convert Word to Doubleword): AX'in işaret bitini DX'e yayar.\n            </li>\n            <li>🚨 <strong>Bölme Taşması (Divide Overflow / INT 0):</strong>\n              <br>Eğer bölen 0 ise VEYA bölüm hedef yazmaca sığmıyorsa (örn: AX=3000, BL=2 yapıldığında bölüm 1500 çıkar ve AL'ye sığmaz), işlemci anında donanımsal <b>INT 0 (Bölme Hatası)</b> kesmesi üretir!\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m3-div",
            "difficulty": "orta",
            "difficultyLabel": "🟡 6. Modül Labı: DIV Bölüm ve Kalan",
            "title": "Mini-Lab 3.6: Toplam Saniyeyi Dakika ve Artık Saniyeye Ayırma",
            "scenario": "Toplam saniye sayısı AX = 125 olarak verilmiştir. 60'a bölerek (DIV BL) dakikayı AL'ye, kalan saniyeyi AH'ye ayırın.",
            "task": "BL yazmacına 60 (3Ch) yükleyin. DIV BL komutunu çalıştırın. AL=2 (Bölüm), AH=5 (Kalan) olduğunu Registers panelinde görün.",
            "code": "; 🟡 Mini-Lab 3.6: 8-Bit DIV\nORG 100H\n\nMOV AX, 125\n\n; 1. BL'ye bolen sabiti olan 60'i yukleyin:\n; TODO:\n\n\n; 2. DIV BL komutu ile AX'i BL'ye bolun:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 125\nMOV BL, 60\nDIV BL\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BL, 60 — Bölen atanır.",
              "2. Satır: DIV BL — 125 / 60 = 2 (Bölüm -> AL), 125 % 60 = 5 (Kalan -> AH). AX = 0502H olur."
            ],
            "examTips": "8-bit bölmede bölünen sayı AX'tir. Bölüm AL'ye, kalan AH'ye düşer."
          }
        ]
      },
      {
        "title": "7. Modül: Karşılaştırma Komutu (CMP) ve Bayrak Dinamikleri",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>CMP Hedef, Kaynak</code> (Compare / Karşılaştırma)</h4>\n          <p>İki sayıyı karşılaştırmak için kullanılan en temel komuttur.</p>\n          <ul>\n            <li><strong>Nasıl Çalışır?</strong> Dahili olarak $Hedef - Kaynak$ çıkarma işlemi yapar.</li>\n            <li><strong>🚨 SUB'dan Tek Farkı:</strong> Çıkarma sonucunu <b>HİÇBİR YAZMACA YAZMAZ</b>! Sadece bayrakları (CF, ZF, SF, OF) günceller. Hedefin değeri bozulmaz.</li>\n            <li><strong>Sonuç Durumları:</strong>\n              <br>• $Hedef == Kaynak$ ise ➔ Sonuç 0 olur, <b>ZF = 1</b>, <b>CF = 0</b>\n              <br>• $Hedef > Kaynak$ ise ➔ <b>ZF = 0</b>, <b>CF = 0</b>\n              <br>• $Hedef < Kaynak$ ise ➔ Borç alınır, <b>CF = 1</b>, <b>ZF = 0</b>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m3-cmp",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 7. Modül Labı: CMP ile Eşitlik Testi",
            "title": "Mini-Lab 3.7: CMP ile Eşitlik ve Büyüklük Testi",
            "scenario": "AX = 50 ve BX = 50 olarak ayarlanmıştır. CMP AX, BX çalıştırıp ZF bayrağının 1 olduğunu doğrulayın. Ardından BX'e 70 yükleyip tekrar CMP yapın (CF=1 olmalı).",
            "task": "CMP AX, BX komutu ile karşılaştırın. Ardından MOV BX, 70 ve CMP AX, BX yaparak bayrakların değişimini adım adım izleyin.",
            "code": "; 🟢 Mini-Lab 3.7: CMP Komutu\nORG 100H\n\nMOV AX, 50\nMOV BX, 50\n\n; 1. AX ile BX'i karsilastirin (Esit olduklari icin ZF=1 olmalidir):\n; TODO:\n\n\n; 2. BX'e 70 yukleyin ve tekrar CMP AX, BX yapin (AX < BX oldugu icin CF=1 olmalidir):\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 50\nMOV BX, 50\nCMP AX, BX\nMOV BX, 70\nCMP AX, BX\nHLT",
            "solutionBreakdown": [
              "1. Satır: CMP AX, BX — 50 - 50 = 0. ZF=1, CF=0 (Eşit).",
              "2. Satır: CMP AX, BX (50 ve 70) — 50 - 70 borç gerektirir. CF=1, ZF=0 (AX < BX)."
            ],
            "examTips": "CMP komutundan hemen sonra genellikle JE, JNE, JA, JB gibi koşullu atlama komutları gelir."
          }
        ]
      }
    ]
  },
  "milestone-4": {
    "milestoneId": "milestone-4",
    "milestoneNumber": 4,
    "title": "Mantıksal ve Bit Düzeyi İşlemler (AND, OR, XOR, NOT, TEST, SHL, SHR, SAR, ROTATE)",
    "subtitle": "Bit Düzeyinde Maskeleme, Hızlı 2^n Çarpma/Bölme ve Döngüsel Kaydırma",
    "slideRef": "Hoca: Week 3 & 5 PPTX / w3, w5 PDF | Kitap: Barry B. Brey Bölüm 5",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 4: BİT DÜZEYİ MANİPÜLASYON & KAYDIRMA</div>\n      <p class=\"lecture-hero-text\">\n        Mantıksal komutlar; donanım portlarındaki tek bir biti açıp kapatmak, istenmeyen bitleri maskelemek \n        ve bit düzeyinde filtreleme yapmak için kullanılır. Kaydırma komutları ise işlemcinin en hızlı çarpma/bölme mekanizmasıdır.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın 3 Altın Mantıksal Kuralı:</strong><br>\n        1. <b>Hızlı Sıfırlama:</b> <code>MOV AX, 0</code> yerine <code>XOR AX, AX</code> kullanmak kodu 2 bayta düşürür ve saat çevriminde daha hızlıdır.<br>\n        2. <b>SAR vs SHR Farkı (Büyük Sınav Sorusu):</b> <code>SHR</code> sağa kaydırırken soldan daima 0 sokar (işaretsiz bölme). <code>SAR</code> (Aritmetik Sağa Kaydırma) ise işaret bitini (MSB) koruyarak sağa kaydırır (işaretli sayıyı 2'ye bölme!).<br>\n        3. <b>NOT vs NEG Farkı:</b> <code>NOT</code> komutu 1'e tümleyen alır ve <strong>HİÇBİR BAYRAĞI ETKİLEMEZ!</strong> <code>NEG</code> ise 2'ye tümleyen alır ve bayrakları kurar.\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Bit Düzeyinde VE (AND) ile Maskeleme",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>AND Hedef, Kaynak</code> — Bit Maskeleme</h4>\n          <p>İki operant arasında bit düzeyinde mantıksal VE işlemi yapar ($1 \\land 1 = 1$, diğer tüm durumlarda $0$).</p>\n          <ul>\n            <li><strong>Kullanım Amacı (Maskeleme):</strong> Bir baytın istemediğimiz bitlerini 0 yapmak (sıfırlamak), istediğimiz bitlerini ise aynen korumak için 0 ile AND'leriz.</li>\n            <li><strong>Örnek (ASCII'den Rakam Ayıklama):</strong> Klavyeden okunan '5' karakterinin ASCII kodu <code>35H</code> (0011 0101B)'dir. Üst 4 biti sıfırlayıp saf 5 sayısını elde etmek için <code>AND AL, 0FH</code> uygulanır.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m4-and-mask",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: AND Maskeleme",
            "title": "Mini-Lab 4.1: ASCII Karakteri Rakam Değerine Dönüştürme",
            "scenario": "Klavyeden okunan '9' karakteri AL yazmacında ASCII kodu 39H (0011 1001b) olarak bulunmaktadır. Yüksek nibble'ı sıfırlayarak AL'yi saf 9 (09h) yapın.",
            "task": "AND AL, 0FH komutunu kullanarak AL yazmacına maskeleme uygulayın.",
            "code": "; 🟢 Mini-Lab 4.1: AND ile Maskeleme\nORG 100H\n\nMOV AL, 39H   ; ASCII '9'\n\n; 1. AL'deki ust 4 biti 0FH ile maskeleyerek sifirlayin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AL, 39H\nAND AL, 0FH\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AL, 39H (0011 1001B)",
              "2. Satır: AND AL, 0FH (0000 1111B) ➔ Sonuç: 0000 1001B = 09H. Üst nibble temizlenir."
            ],
            "examTips": "Bir biti 0 yapmak istiyorsanız o konumu 0 ile AND'lersiniz; korumak istiyorsanız 1 ile AND'lersiniz."
          }
        ]
      },
      {
        "title": "2. Modül: Bit Düzeyinde VEYA (OR) ile Bit Kurma (Set Bit)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>OR Hedef, Kaynak</code> — Bit Kurma (1 Yapma)</h4>\n          <p>İki operant arasında bit düzeyinde VEYA işlemi yapar ($0 \\lor 0 = 0$, herhangi biri 1 ise sonuç $1$).</p>\n          <ul>\n            <li><strong>Kullanım Amacı:</strong> Bir kontrol yazmacındaki belirli bitleri diğer bitleri bozmadan <b>1 (aktif)</b> yapmak için kullanılır.</li>\n            <li>Örnek: AL'nin en düşük bitini (bit 0) 1 yapmak için: <code>OR AL, 01H</code>.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m4-or-set",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 2. Modül Labı: OR ile Bit Açma",
            "title": "Mini-Lab 4.2: Donanım Kontrol Bitlerini Aktifleştirme",
            "scenario": "Bir motor sürücüsünün kontrol yazmacında (AL = 10H) bit 0 (Motor Açık) ve bit 7 (Hazır) bitleri 1 yapılmalıdır (Maske: 81H).",
            "task": "OR AL, 81H komutunu çalıştırarak AL'nin bit 0 ve bit 7'sini 1 yapın (Diğer bitler korunacaktır).",
            "code": "; 🟢 Mini-Lab 4.2: OR Komutu\nORG 100H\n\nMOV AL, 10H\n\n; 1. OR AL, 81H komutu ile hedef bitleri 1 yapin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AL, 10H\nOR AL, 81H\nHLT",
            "solutionBreakdown": [
              "1. Satır: AL = 0001 0000B (10H)",
              "2. Satır: OR AL, 81H (1000 0001B) ➔ Sonuç: 1001 0001B = 91H."
            ],
            "examTips": "Belirli bir biti 1 yapmak için maskede o konuma 1 koyup OR işlemi yapın."
          }
        ]
      },
      {
        "title": "3. Modül: Dışlamalı VEYA (XOR) ile Hızlı Sıfırlama ve Tersleme",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>XOR Hedef, Kaynak</code> — Hızlı Sıfırlama</h4>\n          <p>İki bit birbirinden farklıysa 1, aynıysa 0 üretir ($1 \\oplus 1 = 0$, $0 \\oplus 0 = 0$).</p>\n          <ul>\n            <li><strong>Sınav Klasiği: Neden <code>XOR AX, AX</code>?</strong>\n              <br>Bir sayıyı kendisiyle XOR'lamak tüm bitleri kesinlikle 0 yapar ($AX = 0$).\n              <br><code>MOV AX, 0</code> yerine <code>XOR AX, AX</code> tercih edilir çünkü makine kodu 2 bayttır (daha küçük) ve daha az saat çevrimi harcar. Ayrıca ZF=1 yapar.\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m4-xor-zero",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 3. Modül Labı: XOR Sıfırlama",
            "title": "Mini-Lab 4.3: XOR ile Optimize Yazmaç Sıfırlama",
            "scenario": "Program başlamadan önce AX ve BX yazmaçlarındaki eski artık verileri temizleyip sıfırlamanız gerekiyor.",
            "task": "XOR AX, AX ve XOR BX, BX komutları ile iki yazmacı optimize biçimde sıfırlayın. ZF bayrağının 1 olduğunu izleyin.",
            "code": "; 🟢 Mini-Lab 4.3: XOR ile Sifirlama\nORG 100H\n\nMOV AX, 0ABCDH\nMOV BX, 1234H\n\n; 1. AX'i XOR komutu ile sifirlayin:\n; TODO:\n\n\n; 2. BX'i XOR komutu ile sifirlayin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 0ABCDH\nMOV BX, 1234H\nXOR AX, AX\nXOR BX, BX\nHLT",
            "solutionBreakdown": [
              "1. Satır: XOR AX, AX ➔ AX = 0000H, ZF = 1.",
              "2. Satır: XOR BX, BX ➔ BX = 0000H, ZF = 1."
            ],
            "examTips": "Assembly'de yazmaç sıfırlamanın endüstri standardı 'XOR Reg, Reg' komutudur."
          }
        ]
      },
      {
        "title": "4. Modül: Bire Tümleyen (NOT) — Bayrak Değiştirmeme Kuralı",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>NOT Hedef</code> (One's Complement)</h4>\n          <p>Hedefteki tüm 0 bitlerini 1, tüm 1 bitlerini 0 yapar.</p>\n          <ul>\n            <li>🚨 <strong>Hocanın Çok Sevdiği Sınav Sorusu:</strong>\n              <br><code>NOT</code> komutu <strong>HİÇBİR DURUM BAYRAĞINI (CF, ZF, SF, OF, AF, PF) DEĞİŞTİRMEZ!</strong>\n              <br>Bayrak kuran komut <code>NEG</code> komutudur; <code>NOT</code> ise saf bir mantıksal bit tersleyicidir.\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m4-not",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 4. Modül Labı: NOT Komutu",
            "title": "Mini-Lab 4.4: Bit Tersleme ve Bayrak Analizi",
            "scenario": "AL = 0000 1111b (0Fh) olarak verilmiştir. NOT AL çalıştırarak bitleri tersleyin (F0h) ve bayrakların hiç değişmediğini görün.",
            "task": "NOT AL komutunu çalıştırın. AL'nin 0F0H olduğunu ve bayrakların etkilenmediğini doğrulayın.",
            "code": "; 🟢 Mini-Lab 4.4: NOT Komutu\nORG 100H\n\nMOV AL, 0FH\n\n; 1. NOT AL komutu ile tum bitleri tersleyin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AL, 0FH\nNOT AL\nHLT",
            "solutionBreakdown": [
              "1. Satır: AL = 0000 1111B (0FH)",
              "2. Satır: NOT AL — Tüm bitler terslenir: 1111 0000B (0F0H). Bayraklar etkilenmez."
            ],
            "examTips": "NOT komutu bayrakları değiştirmez!"
          }
        ]
      },
      {
        "title": "5. Modül: Bit Testi (TEST) Komutu",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>TEST Hedef, Kaynak</code> (Non-Destructive AND)</h4>\n          <p>İki operant arasında <code>AND</code> işlemi yapar ancak <b>sonucu hiçbir yere yazmaz</b>! Yalnızca ZF, SF ve PF bayraklarını kurar.</p>\n          <ul>\n            <li><strong>Kullanım Amacı:</strong> Bir durum baytında belirli bir bitin 0 mı yoksa 1 mi olduğunu kontrol etmek için kullanılır.</li>\n            <li>Örnek: <code>TEST AL, 01H</code> ➔ Eğer AL'nin 0. biti 0 ise sonuç 0 çıkar ve <b>ZF = 1</b> olur. 0. biti 1 ise sonuç 1 çıkar ve <b>ZF = 0</b> olur!</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m4-test",
            "difficulty": "orta",
            "difficultyLabel": "🟡 5. Modül Labı: TEST Komutu",
            "title": "Mini-Lab 4.5: Tek / Çift Sayı Tespiti (Bit 0 Testi)",
            "scenario": "Bir sayının en düşük biti (bit 0) 0 ise sayı çift, 1 ise sayı tektir. AL'deki sayının tek mi çift mi olduğunu TEST AL, 1 komutu ile denetleyin.",
            "task": "AL=42 (Çift) iken TEST AL, 1 çalıştırın (ZF=1 olmalı). Ardından AL=43 (Tek) yapıp TEST AL, 1 çalıştırın (ZF=0 olmalı).",
            "code": "; 🟡 Mini-Lab 4.5: TEST Komutu\nORG 100H\n\nMOV AL, 42    ; Cift sayi (bit 0 = 0)\n\n; 1. TEST AL, 1 komutunu calistirin (ZF=1 kurulmalidir):\n; TODO:\n\n\n; 2. AL'yi 43 yapin ve tekrar TEST AL, 1 calistirin (ZF=0 olmalidir):\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AL, 42\nTEST AL, 1\nMOV AL, 43\nTEST AL, 1\nHLT",
            "solutionBreakdown": [
              "1. Satır: 42 (00101010b) & 1 = 0 ➔ ZF = 1 (Çift sayı).",
              "2. Satır: 43 (00101011b) & 1 = 1 ➔ ZF = 0 (Tek sayı)."
            ],
            "examTips": "TEST komutu AL'nin değerini değiştirmez; yalnızca bayrakları günceller."
          }
        ]
      },
      {
        "title": "6. Modül: Mantıksal Kaydırma (SHL & SHR) — Hızlı 2^n Çarpma ve Bölme",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>SHL</code> (Shift Left) ve <code>SHR</code> (Shift Right)</h4>\n          <p>Bitleri sola veya sağa kaydırır. İşlemcide $2^n$ ile en hızlı çarpma/bölme yöntemidir.</p>\n          <ul>\n            <li><code>SHL Hedef, 1</code> ➔ Sola 1 bit kaydırır (Sağdan 0 girer, MSB bit CF'ye çıkar). <b>Sayıyı 2 ile çarpar.</b></li>\n            <li><code>SHR Hedef, 1</code> ➔ Sağa 1 bit kaydırır (Soldan 0 girer, LSB bit CF'ye çıkar). <b>İşaretsiz sayıyı 2'ye böler.</b></li>\n            <li>🚨 <strong>Kural (1'den Fazla Kaydırma):</strong> Eğer 1'den fazla bit kaydırılacaksa, kaydırma miktarı <strong>MUTLAKA CL YAZMACINA</strong> yüklenmelidir:\n              <pre><code>MOV CL, 3\nSHL AX, CL      ; AX'i 3 bit sola kaydir (8 ile carp)</code></pre>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m4-shl-shr",
            "difficulty": "orta",
            "difficultyLabel": "🟡 6. Modül Labı: SHL ve SHR",
            "title": "Mini-Lab 4.6: SHL ile 8 Katına Çıkarma ($2^3$)",
            "scenario": "AX = 5 sayısını çarpma komutu (MUL) kullanmadan, yalnızca 3 bit sola kaydırarak (SHL) 8 ile çarpmanız isteniyor ($5 \\times 8 = 40$).",
            "task": "CL yazmacına 3 yükleyin. Ardından SHL AX, CL komutu ile AX'i 8 katına çıkarın (AX=40 / 0028H).",
            "code": "; 🟡 Mini-Lab 4.6: SHL Komutu\nORG 100H\n\nMOV AX, 5\n\n; 1. Kaydirma miktari olan 3'u CL yazmacina yukleyin:\n; TODO:\n\n\n; 2. SHL AX, CL komutu ile 3 bit sola kaydirin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 5\nMOV CL, 3\nSHL AX, CL\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV CL, 3 — Kaydırma miktarı CL'ye atanır.",
              "2. Satır: SHL AX, CL — 5 (0000 0101b) 3 bit sola kayar ➔ 0010 1000b = 40 (28h)."
            ],
            "examTips": "8086'da 'SHL AX, 3' şeklinde doğrudan sabit 3 yazılamaz! Sadece 1 için doğrudan 'SHL AX, 1' yazılabilir; 1'den büyükler için CL şarttır."
          }
        ]
      },
      {
        "title": "7. Modül: Aritmetik Sağa Kaydırma (SAR) vs SHR — Büyük Sınav Sorusu",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>SAR Hedef, 1</code> (Shift Arithmetic Right)</h4>\n          <p>Aritmetik sağa kaydırma komutudur. İşaretli (negatif ve pozitif) sayıları 2'ye bölmek için tasarlanmıştır.</p>\n          <ul>\n            <li>🚨 <strong>SAR ile SHR Arasındaki Hayati Fark (Sınav Klasiği!):</strong>\n              <table class=\"lecture-table\">\n                <thead>\n                  <tr><th>Komut</th><th>En Soldan Ne Girer?</th><th>Hangi Sayılar İçin?</th></tr>\n                </thead>\n                <tbody>\n                  <tr><td><code>SHR</code></td><td>Daima <b>0</b> girer</td><td>İşaretsiz (Unsigned) sayılar için 2'ye bölme</td></tr>\n                  <tr><td><code>SAR</code></td><td><b>İşaret Biti (MSB) KORUNUR</b> ve aynen yayılır!</td><td>İşaretli (Signed / Negatif) sayılar için 2'ye bölme</td></tr>\n                </tbody>\n              </table>\n            </li>\n            <li>Örnek: $AL = -8$ (1111 1000b). <code>SAR AL, 1</code> yapılırsa en soldaki 1 korunur: $1111 1100b = -4$ olur!</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m4-sar",
            "difficulty": "orta",
            "difficultyLabel": "🟡 7. Modül Labı: SAR ile Negatif Bölme",
            "title": "Mini-Lab 4.7: Negatif Sayıyı SAR ile 2'ye Bölme",
            "scenario": "AL = -16 (0F0H) negatif sayısı SAR komutu ile 1 bit sağa kaydırılarak -8 (0F8H) sonucuna ulaştırılacaktır.",
            "task": "SAR AL, 1 komutunu çalıştırın. En yüksek işaret bitinin korunduğunu ve AL'nin 0F8H olduğunu doğrulayın.",
            "code": "; 🟡 Mini-Lab 4.7: SAR Komutu\nORG 100H\n\nMOV AL, 0F0H   ; -16 (1111 0000b)\n\n; 1. SAR AL, 1 komutu ile isareti koruyarak 2'ye bolun:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AL, 0F0H\nSAR AL, 1\nHLT",
            "solutionBreakdown": [
              "1. Satır: AL = 1111 0000B (-16)",
              "2. Satır: SAR AL, 1 ➔ En soldaki 1 korunur ve sağa yayılır: 1111 1000B = -8 (0F8H)."
            ],
            "examTips": "Eğer burada SAR yerine SHR kullanılsaydı soldan 0 gireceği için sayı pozitif +120'ye dönüşürdü ve sonuç tamamen çökerdi!"
          }
        ]
      }
    ]
  },
  "milestone-5": {
    "milestoneId": "milestone-5",
    "milestoneNumber": 5,
    "title": "Program Akışı, Koşullar ve Döngüler (JMP, JE, JNE, JL/JG, JB/JA, LOOP)",
    "subtitle": "Her Koşullu Atlama ve Döngü İçin Ayrı Anlatım, Bayrak Kontrolü ve Anında Pratik",
    "slideRef": "Hoca: Week 5 PPTX / w5, w10 PDF | Kitap: Barry B. Brey Bölüm 6",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 5: KARAR MEKANİZMALARI, SIÇRAMALAR & DÖNGÜLER</div>\n      <p class=\"lecture-hero-text\">\n        Mikroişlemcinin akıllı kararlar vermesini sağlayan temel yapı <b>Koşullu Dallanmalar (Conditional Jumps)</b> ve <b>Döngülerdir (Loops)</b>. \n        Her bir atlama komutu ALU'nun ürettiği durum bayraklarını (ZF, CF, SF, OF) sorgulayarak programın hangi satırdan devam edeceğini belirler.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın 3 Altın Akış Kuralı:</strong><br>\n        1. <b>İşaretsiz vs İşaretli Ayrımı (Sınav Klasiği):</b> İşaretsiz sayılarda <code>JA</code> (Above) ve <code>JB</code> (Below) kullanılır (CF ve ZF kontrol edilir). İşaretli sayılarda ise <code>JG</code> (Greater) ve <code>JL</code> (Less) kullanılır (SF ve OF kontrol edilir). Asla karıştırmayın!<br>\n        2. <b>LOOP Komutu ve Bayraklar:</b> <code>LOOP</code> komutu CX sayacını otomatik olarak 1 azaltır ve $CX \\neq 0$ ise etikete döner. <strong>LOOP KOMUTU BAYRAKLARI ASLA DEĞİŞTİRMEZ!</strong><br>\n        3. <b>Short Jump Sınırı:</b> Koşullu atlamalar 8086'da 8-bitlik bağıl (relative) ofset kullanır ($-128$ ile $+127$ bayt arası).\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Koşulsuz Atlama (JMP) ve Kod Blokları",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>JMP Etiket</code> — Unconditional Jump</h4>\n          <p>Hiçbir bayrağa veya şarta bakmaksızın program akışını doğrudan belirtilen etikete (Label) yönlendirir.</p>\n          <ul>\n            <li>İşlemci Komut Göstericisine (IP) yeni adresi yükler.</li>\n            <li>Hatalı kod bloklarını atlamak veya sonsuz döngü kurmak için kullanılır.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m5-jmp",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: JMP Komutu",
            "title": "Mini-Lab 5.1: Hatalı Kod Bloğunu JMP ile Atlama",
            "scenario": "Normal akışta aradaki hatalı 'MOV AX, 0' komutunu atlayıp doğrudan 'SONUC' etiketine sıçrayarak AX'in 100 kalmasını sağlayın.",
            "task": "JMP SONUC komutunu kullanarak aradaki sıfırlama komutunu atlayın ve programı HLT ile bitirin.",
            "code": "; 🟢 Mini-Lab 5.1: JMP Komutu\nORG 100H\n\nMOV AX, 100\n\n; 1. Asagidaki hatali blogu atlamak icin SONUC etiketine JMP yapin:\n; TODO:\n\n\nMOV AX, 0   ; Bu komut calismamalidir!\n\nSONUC:\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 100\nJMP SONUC\nMOV AX, 0\nSONUC:\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 100 — AX = 100.",
              "2. Satır: JMP SONUC — İşlemci aradaki komutu atlayıp doğrudan SONUC etiketine sıçrar (AX=100 kalır)."
            ],
            "examTips": "JMP komutu bayrakları etkilemez."
          }
        ]
      },
      {
        "title": "2. Modül: Eşitlik Kontrolü (JE / JZ ve JNE / JNZ)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>JE</code> (Jump if Equal) / <code>JZ</code> (Jump if Zero)</h4>\n          <p><code>CMP</code> veya aritmetik bir işlem sonrasında <b>Zero Flag (ZF = 1)</b> ise atlama yapar.</p>\n          <ul>\n            <li><code>CMP AX, BX</code> yapıldığında eğer $AX == BX$ ise $AX - BX = 0$ çıkar ve <b>ZF = 1</b> olur. <code>JE ESIT</code> komutu bu durumda atlar.</li>\n            <li><code>JNE</code> (Jump if Not Equal) ise $AX \\neq BX$ (ZF = 0) iken atlama yapar.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m5-je-jne",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 2. Modül Labı: JE Eşitlik Testi",
            "title": "Mini-Lab 5.2: İki Sayının Eşitliğini JE ile Test Etme",
            "scenario": "AX = 50 ve BX = 50 sayıları karşılaştırılacaktır. Eşitlerse program ESIT_LABEL etiketine atlayacak ve DX = 1 yapacaktır.",
            "task": "CMP AX, BX ardından JE ESIT_LABEL yazın. Adım adım çalıştırarak ZF=1 olduğunda atlamanın gerçekleştiğini izleyin.",
            "code": "; 🟢 Mini-Lab 5.2: JE Komutu\nORG 100H\n\nMOV AX, 50\nMOV BX, 50\nMOV DX, 0\n\n; 1. AX ile BX'i karsilastirin:\n; TODO:\n\n\n; 2. Eger esitlerse ESIT_LABEL etiketine atlayin (JE):\n; TODO:\n\n\nHLT\n\nESIT_LABEL:\nMOV DX, 1\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 50\nMOV BX, 50\nMOV DX, 0\nCMP AX, BX\nJE ESIT_LABEL\nHLT\nESIT_LABEL:\nMOV DX, 1\nHLT",
            "solutionBreakdown": [
              "1. Satır: CMP AX, BX — 50 == 50 olduğu için ZF = 1 kurulur.",
              "2. Satır: JE ESIT_LABEL — ZF=1 olduğu için ESIT_LABEL'a atlar ve DX = 1 atanır."
            ],
            "examTips": "JE ve JZ aynı makine kodudur (74h). Anlamsal olarak kod okunabilirliği için eşitlikte JE, sıfır testinde JZ tercih edilir."
          }
        ]
      },
      {
        "title": "3. Modül: İşaretsiz Sayı Karşılaştırmaları (JA, JB, JAE, JBE)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>JA</code> (Jump if Above) ve <code>JB</code> (Jump if Below)</h4>\n          <p>İşaretsiz tam sayılarda büyüklük/küçüklük kontrolü için <b>Carry Flag (CF)</b> ve <b>Zero Flag (ZF)</b> kullanılır.</p>\n          <ul>\n            <li><code>CMP AX, BX</code> sonrasında:\n              <br>• $AX > BX$ (Büyükse) ➔ <code>JA</code> atlar (CF=0 ve ZF=0).\n              <br>• $AX < BX$ (Küçükse) ➔ <code>JB</code> atlar (CF=1).\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m5-ja-jb",
            "difficulty": "orta",
            "difficultyLabel": "🟡 3. Modül Labı: JA ile Büyüğü Bulma",
            "title": "Mini-Lab 5.3: İki İşaretsiz Sayıdan Büyüğünü Seçme (Max)",
            "scenario": "AX = 200 ve BX = 150 sayıları karşılaştırılacak, büyük olan sayı CX yazmacına yazılacaktır.",
            "task": "CMP AX, BX ardından JA AX_BUYUK yapın. Büyüğü CX içine aktarın.",
            "code": "; 🟡 Mini-Lab 5.3: JA Komutu\nORG 100H\n\nMOV AX, 200\nMOV BX, 150\n\n; 1. AX ile BX'i karsilastirin:\n; TODO:\n\n\n; 2. AX > BX ise AX_BUYUK etiketine atlayin (JA):\n; TODO:\n\n\nMOV CX, BX\nJMP BITIR\n\nAX_BUYUK:\nMOV CX, AX\n\nBITIR:\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 200\nMOV BX, 150\nCMP AX, BX\nJA AX_BUYUK\nMOV CX, BX\nJMP BITIR\nAX_BUYUK:\nMOV CX, AX\nBITIR:\nHLT",
            "solutionBreakdown": [
              "1. Satır: CMP AX, BX — 200 > 150 olduğu için CF=0 ve ZF=0.",
              "2. Satır: JA AX_BUYUK — Şart sağlandığı için AX_BUYUK'e atlar ve CX = 200 (AX) olur."
            ],
            "examTips": "İşaretsiz sayılarda daima JA/JB kullanılır; JG/JL kullanılırsa negatiflik işaret biti yanlış karara sebep olur!"
          }
        ]
      },
      {
        "title": "4. Modül: İşaretli Sayı Karşılaştırmaları (JG, JL, JGE, JLE)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>JG</code> (Jump if Greater) ve <code>JL</code> (Jump if Less)</h4>\n          <p>İşaretli (iki'nin tümleyeni / negatif) sayılarda büyüklük testi için kullanılır.</p>\n          <ul>\n            <li>İşlemci <b>Sign Flag (SF)</b> ile <b>Overflow Flag (OF)</b> durumlarını XOR mantığıyla birlikte denetler ($SF \\oplus OF$).</li>\n            <li>Örnek: $+5$ sayısı $-10$'dan büyüktür. İşaretli <code>JG</code> komutu $+5$'in büyük olduğunu doğru bilir. (Eğer JA kullanılsaydı $-10$ hex olarak 0FFF6h göründüğü için yanlış karar verirdi!).</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m5-jg-jl",
            "difficulty": "orta",
            "difficultyLabel": "🟡 4. Modül Labı: JG ile İşaretli Karşılaştırma",
            "title": "Mini-Lab 5.4: Pozitif Sayının Negatif Sayıdan Büyüklüğü",
            "scenario": "AX = +5, BX = -10 (0FFF6h). İşaretli JG komutu ile AX'in BX'ten büyük olduğunu test edip POZITIF_BUYUK etiketine sıçrayın.",
            "task": "CMP AX, BX ardından JG POZITIF_BUYUK komutunu çalıştırın. DX = 1 yapın.",
            "code": "; 🟡 Mini-Lab 5.4: JG Komutu\nORG 100H\n\nMOV AX, 5\nMOV BX, -10\nMOV DX, 0\n\n; 1. AX ile BX'i karsilastirin:\n; TODO:\n\n\n; 2. Isaretli olarak AX > BX ise POZITIF_BUYUK etiketine atlayin (JG):\n; TODO:\n\n\nHLT\n\nPOZITIF_BUYUK:\nMOV DX, 1\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 5\nMOV BX, -10\nMOV DX, 0\nCMP AX, BX\nJG POZITIF_BUYUK\nHLT\nPOZITIF_BUYUK:\nMOV DX, 1\nHLT",
            "solutionBreakdown": [
              "1. Satır: CMP AX, BX (5 ile -10) — SF = 0, OF = 0.",
              "2. Satır: JG POZITIF_BUYUK — +5 > -10 olduğu için atlama gerçekleşir ve DX = 1 olur."
            ],
            "examTips": "Negatif sayı içeren algoritmalarda kesinlikle JG veya JL kullanmalısınız."
          }
        ]
      },
      {
        "title": "5. Modül: Donanımsal Döngü Komutu (LOOP) — Altın Kural",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>LOOP Etiket</code> (Donanımsal Sayaç Döngüsü)</h4>\n          <p>Döngü komutu her çalıştığında tek bir makine çevriminde iki işlem yapar:</p>\n          <ol>\n            <li><b>CX sayacını 1 azaltır:</b> $CX = CX - 1$</li>\n            <li><b>Kontrol eder:</b> Eğer $CX \\neq 0$ ise döngü etiketine geri atlar! $CX == 0$ olduğunda döngüden çıkar.</li>\n          </ol>\n          <ul>\n            <li>🚨 <strong>HOCANIN ALTIN KURALI:</strong> <code>LOOP</code> komutu <strong>DURUM BAYRAKLARINI (ZF, CF VB.) ASLA DEĞİŞTİRMEZ!</strong> CX=0 olduğunda bile ZF 1 olmaz!</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m5-loop-sum",
            "difficulty": "orta",
            "difficultyLabel": "🟡 5. Modül Labı: LOOP Döngüsü",
            "title": "Mini-Lab 5.5: 1'den N'e Kadar Sayıların Toplamı",
            "scenario": "Döngü sayacı CX = 5 olarak verilmiştir. LOOP döngüsü ile 1'den 5'e kadar olan sayıları toplayarak AX içinde biriktirin ($5 + 4 + 3 + 2 + 1 = 15$).",
            "task": "DONGU etiketi altında ADD AX, CX yapın ve ardından LOOP DONGU yazın.",
            "code": "; 🟡 Mini-Lab 5.5: LOOP Komutu\nORG 100H\n\nMOV CX, 5\nMOV AX, 0\n\nDONGU:\n; 1. AX = AX + CX toplamini yapin:\n; TODO:\n\n\n; 2. LOOP DONGU komutu ile donguyu dondurun:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV CX, 5\nMOV AX, 0\nDONGU:\nADD AX, CX\nLOOP DONGU\nHLT",
            "solutionBreakdown": [
              "1. Adım: AX = 0 + 5 = 5, CX=4",
              "2. Adım: AX = 5 + 4 = 9, CX=3",
              "3. Adım: AX = 9 + 3 = 12, CX=2",
              "4. Adım: AX = 12 + 2 = 14, CX=1",
              "5. Adım: AX = 14 + 1 = 15 (0Fh), CX=0 olur ve döngü biter."
            ],
            "examTips": "LOOP komutu döngü sayacını daima CX yazmacından okur; başka bir yazmaç sayaç olarak kullanılamaz."
          }
        ]
      }
    ]
  },
  "milestone-6": {
    "milestoneId": "milestone-6",
    "milestoneNumber": 6,
    "title": "Yığın (Stack) & Prosedür Çağrıları (PUSH, POP, CALL, RET, Stack Frame)",
    "subtitle": "LIFO Bellek Yönetimi, SP:SS Dinamikleri, Fonksiyon Çağrısı ve BP Tabanlı Çerçeve",
    "slideRef": "Hoca: Week 5 PPTX / w5, w10 PDF | Kitap: Barry B. Brey Bölüm 5 & 6",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 6: YIĞIN MİMARİSİ (LIFO) & ALT PROGRAMLAR</div>\n      <p class=\"lecture-hero-text\">\n        Yığın (Stack), geçici verileri saklamak, yazmaç durumlarını korumak ve fonksiyon çağırma (CALL/RET) \n        mekanizmasını yönetmek için kullanılan <b>Son Giren İlk Çıkar (LIFO)</b> bellek alanıdır.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın 3 Altın Yığın Kuralı:</strong><br>\n        1. <b>Yığının Aşağı Büyümesi (Sınav Klasiği):</b> <code>PUSH</code> yapıldığında <strong>SP değeri 2 AZALIR</strong> ($SP = SP - 2$). <code>POP</code> yapıldığında ise <strong>SP değeri 2 ARTAR</strong> ($SP = SP + 2$).<br>\n        2. <b>CALL ve RET Mekanizması:</b> <code>CALL</code> komutu sıradaki komutun adresini (IP) yığına iter (PUSH IP). <code>RET</code> komutu ise yığından bu dönüş adresini çeker (POP IP).<br>\n        3. <b>BP Tabanlı Stack Frame:</b> SP sürekli değiştiği için fonksiyon parametrelerine erişimde taban göstericisi <code>BP</code> kullanılır (varsayılan segment <b>SS</b>).\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Yığına Veri Atma (PUSH) — SP'nin 2 Azalması",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>PUSH Kaynak</code> (Yığına Kelime Ekleme)</h4>\n          <p>16-bitlik bir yazmaç veya bellek kelimesini yığının en üstüne (TOS) kaydeder.</p>\n          <ul>\n            <li>🚨 <strong>Donanımsal 2 Adım:</strong>\n              <br>1. Önce Yığın Göstericisi 2 azaltılır: $SP = SP - 2$\n              <br>2. Veri <code>SS:SP</code> adresine yazılır.\n            </li>\n            <li>Sadece 16-bit veri atılabilir (8-bit PUSH AL yapılamaz!).</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m6-push",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: PUSH Komutu",
            "title": "Mini-Lab 6.1: Yazmaçları Yığına Saklama ve SP Değişimi",
            "scenario": "Kritik bir hesaplamadan önce AX = 1234H ve BX = 5678H değerlerini yığına saklayın. SP yazmacının her PUSH komutunda 2 azaldığını izleyin.",
            "task": "PUSH AX ve PUSH BX komutlarını sırasıyla çalıştırın. Registers panelinde SP'nin azaldığını görün.",
            "code": "; 🟢 Mini-Lab 6.1: PUSH Komutu\nORG 100H\n\nMOV AX, 1234H\nMOV BX, 5678H\n\n; 1. AX'i yigina atin (PUSH AX):\n; TODO:\n\n\n; 2. BX'i yigina atin (PUSH BX):\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 1234H\nMOV BX, 5678H\nPUSH AX\nPUSH BX\nHLT",
            "solutionBreakdown": [
              "1. Satır: PUSH AX — SP = SP - 2 olur ve 1234h yığına yazılır.",
              "2. Satır: PUSH BX — SP = SP - 2 olur ve 5678h yığına yazılır."
            ],
            "examTips": "PUSH yapıldığında SP artmaz, DAİMA AZALIR!"
          }
        ]
      },
      {
        "title": "2. Modül: Yığından Geri Yükleme (POP) — LIFO Sırası",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>POP Hedef</code> (Yığından Kelime Çekme)</h4>\n          <p>Yığının en üstündeki veriyi okur ve hedef yazmaca yazar.</p>\n          <ul>\n            <li>🚨 <strong>Donanımsal 2 Adım:</strong>\n              <br>1. <code>SS:SP</code> adresindeki veri hedefe okunur.\n              <br>2. Yığın Göstericisi 2 artırılır: $SP = SP + 2$\n            </li>\n            <li><strong>LIFO Kuralı:</strong> Son giren ilk çıkar! PUSH sırası $AX, BX$ ise, POP sırası tam tersi $BX, AX$ olmalıdır.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m6-pop-swap",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 2. Modül Labı: POP ile LIFO Takas",
            "title": "Mini-Lab 6.2: Yığın Üzerinden İki Yazmacı Takas Etme",
            "scenario": "AX = 1111H ve BX = 2222H verilmiştir. PUSH ve POP komutlarını kullanarak iki yazmacın değerini yığın üzerinden takas edin.",
            "task": "PUSH AX, PUSH BX ardından POP AX, POP BX yaparak değerleri yer değiştirin.",
            "code": "; 🟢 Mini-Lab 6.2: POP Komutu\nORG 100H\n\nMOV AX, 1111H\nMOV BX, 2222H\n\n; 1. AX ve BX'i yigina atin:\n; TODO:\n\n\n; 2. Ters sira ile AX ve BX'e geri cekin (LIFO Takas):\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 1111H\nMOV BX, 2222H\nPUSH AX\nPUSH BX\nPOP AX\nPOP BX\nHLT",
            "solutionBreakdown": [
              "1. Adım: PUSH AX (1111h), PUSH BX (2222h) yığına girer.",
              "2. Adım: POP AX çalışınca en son giren 2222h AX'e çıkar. POP BX çalışınca 1111h BX'e çıkar."
            ],
            "examTips": "Yığın LIFO prensibinde çalıştığı için ters sırayla POP yapılarak doğal bir takas sağlanır."
          }
        ]
      },
      {
        "title": "3. Modül: Prosedür / Fonksiyon Çağrısı (CALL & RET)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>CALL Prosedür</code> ve <code>RET</code></h4>\n          <p>Modüler programlamanın temelidir. Kod tekrarını önler.</p>\n          <ul>\n            <li><strong>CALL:</strong> Sırada çalıştırılacak komutun IP ofsetini yığına iter (<code>PUSH IP</code>) ve prosedür adresine atlar.</li>\n            <li><strong>RET:</strong> Prosedür bittiğinde yığından dönüş adresini çeker (<code>POP IP</code>) ve ana programa kaldığı yerden devam ettirir.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m6-call-ret",
            "difficulty": "orta",
            "difficultyLabel": "🟡 3. Modül Labı: CALL ve RET Fonksiyonu",
            "title": "Mini-Lab 6.3: Mutlak Değer Hesaplayan Prosedür Çağırma",
            "scenario": "AX = -25 sayısını mutlak değere (+25) çeviren 'MUTLAK_AL' isimli alt programı CALL ile çağırın.",
            "task": "CALL MUTLAK_AL komutunu çalıştırın. Fonksiyon içinde NEG AX ve RET yazın.",
            "code": "; 🟡 Mini-Lab 6.3: CALL ve RET\nORG 100H\n\nMOV AX, -25\n\n; 1. Proseduru CALL ile cagirin:\n; TODO:\n\n\nHLT\n\nMUTLAK_AL PROC\n; 2. AX'in negatifini alip RET ile donun:\n; TODO:\n\n\nMUTLAK_AL ENDP\n",
            "solutionCode": "ORG 100H\nMOV AX, -25\nCALL MUTLAK_AL\nHLT\n\nMUTLAK_AL PROC\nNEG AX\nRET\nMUTLAK_AL ENDP",
            "solutionBreakdown": [
              "1. Adım: CALL MUTLAK_AL — Dönüş adresi yığına itilir ve fonksiyona atlanır.",
              "2. Adım: NEG AX — -25 sayısı +25 yapılır.",
              "3. Adım: RET — Yığından dönüş adresi çekilip HLT satırına geri dönülür."
            ],
            "examTips": "CALL dönüş adresi yığında saklanır; bu yüzden fonksiyon içinde PUSH yapıldıysa mutlaka RET'ten önce POP edilmelidir!"
          }
        ]
      }
    ]
  },
  "milestone-7": {
    "milestoneId": "milestone-7",
    "milestoneNumber": 7,
    "title": "Dizi ve String İşlemleri (MOVS, LODS, STOS, CMPS, SCAS, REP)",
    "subtitle": "Donanımsal Hızlandırıcılı Blok Bellek Transferi, Arama ve Direction Flag",
    "slideRef": "Hoca: Week 6 PPTX / w6 PDF | Kitap: Barry B. Brey Bölüm 5",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 7: DONANIMSAL STRİNG İŞLEMCİSİ</div>\n      <p class=\"lecture-hero-text\">\n        8086 mikroişlemcisi bellek bloklarını kopyalamak, aramak ve doldurmak için donanımsal özel komutlara sahiptir. \n        Tek bir <code>REP MOVSB</code> komutu binlerce baytlık veriyi işlemci döngü cezası olmadan yüksek hızla aktarır.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın 3 Altın String Kuralı:</strong><br>\n        1. <b>Sabit Yazmaç Çiftleri (Asla Değişmez!):</b> Kaynak daima <code>DS:SI</code>, hedef ise daima <code>ES:DI</code> olmak zorundadır.<br>\n        2. <b>Direction Flag (DF):</b> <code>CLD</code> (Clear DF ➔ 0) indeksleri <b>ARTIRIR</b> (ileri yönde gider). <code>STD</code> (Set DF ➔ 1) indeksleri <b>AZALTIR</b> (geri yönde gider). Her string işleminden önce yön bayrağı belirlenmelidir!<br>\n        3. <b>REP Ön Eki:</b> <code>CX</code> sayacı sıfır olana kadar komutu tekrarlar ($CX = CX - 1$, $SI = SI pm 1$, $DI = DI pm 1$).\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Direction Flag (CLD & STD) ve İndeks Yönü",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>CLD</code> (Clear Direction Flag) ve <code>STD</code> (Set Direction Flag)</h4>\n          <p>String komutlarının bellekte ileriye doğru mu (artan adresler) yoksa geriye doğru mu (azalan adresler) gideceğini kontrol eder.</p>\n          <ul>\n            <li><code>CLD</code> ➔ $DF = 0$. String komutları çalıştıkça SI ve DI <b>OTOMATİK ARTAR</b> ($+1$ veya $+2$).</li>\n            <li><code>STD</code> ➔ $DF = 1$. String komutları çalıştıkça SI ve DI <b>OTOMATİK AZALIR</b> ($-1$ veya $-2$).</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m7-cld",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: CLD Komutu",
            "title": "Mini-Lab 7.1: İleri Yön Bayrağını Kurma (CLD)",
            "scenario": "Dizi kopyalama işlemi öncesinde Direction Flag (DF) bayrağını sıfırlayarak indekslerin artan yönde çalışmasını güvence altına alın.",
            "task": "CLD komutunu çalıştırın ve Flags panelinde DF bayrağının 0 olduğunu doğrulayın.",
            "code": "; 🟢 Mini-Lab 7.1: CLD Komutu\nORG 100H\n\n; 1. Direction Flag'i sifirlayarak ileri yone ayarlayin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nCLD\nHLT",
            "solutionBreakdown": [
              "1. Satır: CLD — Direction Flag (DF) 0 yapılır. İndeksler (SI/DI) komut yürütüldükçe ileri yönde artacaktır."
            ],
            "examTips": "String operasyonlarına başlarken CLD çalıştırmak profesyonel assembly programcılığının birinci kuralıdır."
          }
        ]
      },
      {
        "title": "2. Modül: Blok Bellek Kopyalama (REP MOVSB)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>REP MOVSB</code> — Repeat Move String Byte</h4>\n          <p><code>DS:SI</code> kaynak adresinden <code>ES:DI</code> hedef adresine bayt bayt kopyalar.</p>\n          <ul>\n            <li><code>REP</code> ön eki sayesinde işlemci tek komutta $CX$ defa tekrar eder.</li>\n            <li>Her adımda: $[ES:DI] = [DS:SI]$, $SI = SI + 1$, $DI = DI + 1$, $CX = CX - 1$.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m7-movsb",
            "difficulty": "orta",
            "difficultyLabel": "🟡 2. Modül Labı: REP MOVSB",
            "title": "Mini-Lab 7.2: 4 Baytlık Bloğu Donanımsal Olarak Kopyalama",
            "scenario": "Belleğin [0200H] adresindeki 4 baytlık veriyi [0210H] adresine REP MOVSB komutu ile tek seferde kopyalayın.",
            "task": "SI=0200H, DI=0210H, CX=4 ayarlayın. CLD ardından REP MOVSB komutunu çalıştırın.",
            "code": "; 🟡 Mini-Lab 7.2: REP MOVSB\nORG 100H\n\nMOV SI, 0200H\nMOV DI, 0210H\nMOV CX, 4\n\n; 1. CLD ile ileri yonu secin:\n; TODO:\n\n\n; 2. REP MOVSB komutu ile blogu kopyalayin:\n; TODO:\n\n\nHLT\n",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  170,
                  187,
                  204,
                  221
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV SI, 0200H\nMOV DI, 0210H\nMOV CX, 4\nCLD\nREP MOVSB\nHLT",
            "solutionBreakdown": [
              "1. Satır: CLD — Yön ileri.",
              "2. Satır: REP MOVSB — 4 baytlık AA, BB, CC, DD bloğu doğrudan [0210H] adresine kopyalanır ve CX=0 olur."
            ],
            "examTips": "MOVSB bayt, MOVSW kelime (word / 2 bayt) kopyalar."
          }
        ]
      },
      {
        "title": "3. Modül: Bellek Doldurma / Sıfırlama (REP STOSB)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>REP STOSB</code> (Store String Byte / Memset)</h4>\n          <p><code>AL</code> akümülatöründeki baytı <code>ES:DI</code> adresindeki bellek bloğuna $CX$ defa yazar.</p>\n          <ul>\n            <li>Bir bellek alanını hızlıca sıfırlamak veya sabit bir karakterle doldurmak için kullanılır.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m7-stosb",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 3. Modül Labı: REP STOSB",
            "title": "Mini-Lab 7.3: 5 Baytlık Bellek Bloğunu Sıfırlama",
            "scenario": "Belleğin [0200H] adresindeki 5 baytlık alanı AL = 00H ile doldurarak sıfırlayın.",
            "task": "DI=0200H, CX=5, AL=0 yapın. CLD ardından REP STOSB çalıştırın.",
            "code": "; 🟢 Mini-Lab 7.3: REP STOSB\nORG 100H\n\nMOV DI, 0200H\nMOV CX, 5\nMOV AL, 00H\n\n; 1. CLD ve REP STOSB ile bellek alanini sifirlayin:\n; TODO:\n\n\nHLT\n",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  17,
                  34,
                  51,
                  68,
                  85
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV DI, 0200H\nMOV CX, 5\nMOV AL, 00H\nCLD\nREP STOSB\nHLT",
            "solutionBreakdown": [
              "1. Satır: CLD",
              "2. Satır: REP STOSB — 0200H'dan itibaren 5 bayt sıfırlanır (00 00 00 00 00)."
            ],
            "examTips": "STOSB kaynak olarak daima AL akümülatörünü kullanır."
          }
        ]
      }
    ]
  },
  "milestone-8": {
    "milestoneId": "milestone-8",
    "milestoneNumber": 8,
    "title": "BCD ve ASCII Aritmetiği (DAA, DAS, AAA, AAS, AAM, AAD)",
    "subtitle": "Paketlenmiş (Packed) ve Paketlenmemiş (Unpacked) BCD, Onluk Düzeltme Algoritmaları, AF ve CF Bayrakları",
    "slideRef": "Hoca: Week 5 PPTX / w5 PDF | Kitap: Barry B. Brey Bölüm 5",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 8: ONLUK (BCD) VE ASCII ARİTMETİĞİ</div>\n      <p class=\"lecture-hero-text\">\n        8086 mikroişlemcisi ikili (binary) tabanda çalışır. Ancak finans, bankacılık ve muhasebe sistemlerinde yuvarlama hatası olmaması için sayılar <b>BCD (Binary Coded Decimal)</b> olarak tutulur. \n        8086, standart ADD, SUB, MUL ve DIV komutlarından sonra BCD düzeltmesi yapan 6 adet donanımsal komut sunar.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın ve Barry Brey'in Altın BCD Kuralları:</strong><br>\n        1. <b>Packed BCD:</b> Her bayt iki onluk basamak saklar (00h–99h). Toplama için <code>DAA</code>, çıkarma için <code>DAS</code> kullanılır.<br>\n        2. <b>Unpacked BCD:</b> Her bayt yalnızca tek bir basamak saklar (00h–09h). Toplama için <code>AAA</code>, çıkarma için <code>AAS</code>, çarpma sonrası <code>AAM</code>, bölme öncesi <code>AAD</code> kullanılır.<br>\n        3. <b>AL Yazmacı Zorunluluğu:</b> DAA, DAS, AAA, AAS, AAM ve AAD komutlarının tamamı <strong>YALNIZCA AL AKÜMÜLATÖRÜ</strong> üzerinde çalışır! Operand almazlar.\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Paketlenmiş (Packed) BCD ve DAA / DAS Komutları",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>DAA</code> (Decimal Adjust after Addition)</h4>\n          <p><code>ADD AL, ...</code> işleminden sonra çalıştırılır. AL'deki ikili sonucu geçerli iki basamaklı Packed BCD'ye dönüştürür:</p>\n          <ul>\n            <li>Eğer AL'nin düşük nibble'ı (bit 0–3) > 9 ise VEYA Auxiliary Carry (AF=1) ise, <b>AL'ye 6 eklenir</b> ve AF=1 yapılır.</li>\n            <li>Eğer AL'nin yüksek nibble'ı (bit 4–7) > 9 ise VEYA Carry Flag (CF=1) ise, <b>AL'ye 60H eklenir</b> ve CF=1 yapılır.</li>\n            <li>Örnek: 35 (BCD 35h) + 28 (BCD 28h) = 5Dh. <code>DAA</code> çalışınca 5Dh + 6 = 63h (Packed BCD 63) elde edilir!</li>\n          </ul>\n        </div>\n\n        <div class=\"instruction-box\">\n          <h4><code>DAS</code> (Decimal Adjust after Subtraction)</h4>\n          <p><code>SUB AL, ...</code> veya <code>SBB AL, ...</code> sonrasında Packed BCD borç düşmesini düzeltir.</p>\n        </div>\n      "
      },
      {
        "title": "2. Paketlenmemiş (Unpacked) BCD ve ASCII Komutları (AAA, AAS, AAM, AAD)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>AAM</code> (ASCII Adjust after Multiply)</h4>\n          <p>Unpacked iki tek basamaklı sayının çarpımından sonra çalıştırılır:</p>\n          <ul>\n            <li><code>MUL</code> sonrası AL'deki iki basamaklı sayıyı 10'a böler: <code>AH = AL / 10</code>, <code>AL = AL % 10</code>.</li>\n            <li>Örnek: 7 * 8 = 56 (AL=38h). <code>AAM</code> çalıştırılınca AH=05h, AL=06h olur!</li>\n          </ul>\n        </div>\n\n        <div class=\"instruction-box\">\n          <h4><code>AAD</code> (ASCII Adjust before Division)</h4>\n          <p>Bölme işleminden <strong>ÖNCE</strong> çalıştırılan tek komuttur! AH ve AL'deki iki haneyi tek bir binary sayıya dönüştürür: <code>AL = (AH * 10) + AL</code>, <code>AH = 0</code>.</p>\n        </div>\n      "
      },
      {
        "title": "3. İnteraktif Laboratuvar İstasyonu (3 Seviyeli Uygulama)",
        "contentHtml": "\n        <p>Aşağıdaki editörde BCD düzeltme komutlarını test edebilirsiniz. <b>Cevap hazır gelmez</b>; yönergeleri izleyin.</p>\n      ",
        "examples": [
          {
            "id": "ex-m8-kolay",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 Kolay: Doğrudan & Birebir",
            "title": "Alıştırma 8.1: DAA ile Packed BCD Toplama",
            "scenario": "AL içine 38h, BL içine 27h (Packed BCD 38 + 27 = 65) yükleyin. ADD AL, BL yapın ve ardından DAA ile BCD düzeltmesi uygulayın.",
            "task": "MOV AL, 38H, MOV BL, 27H, ADD AL, BL, DAA yazın ve programı HLT ile bitirin.",
            "code": "; 🟢 Kolay: DAA ile Packed BCD Toplama\nORG 100H\n\n; 1. AL'ye 38H yukleyin:\n; TODO:\n\n\n; 2. BL'ye 27H yukleyin:\n; TODO:\n\n\n; 3. AL = AL + BL yapin:\n; TODO:\n\n\n; 4. DAA komutu ile BCD duzeltmesi uygulayin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AL, 38H\nMOV BL, 27H\nADD AL, BL\nDAA\nHLT",
            "solutionBreakdown": [
              "1. Satır: AL = 38h (Packed BCD 38)",
              "2. Satır: BL = 27h (Packed BCD 27)",
              "3. Satır: ADD AL, BL -> 38h + 27h = 5Fh",
              "4. Satır: DAA komutu alt nibble Fh > 9 olduğu için 6 ekler: 5Fh + 6 = 65h (Packed BCD 65)."
            ],
            "examTips": "DAA komutu operand almaz; daima AL üzerinde çalışır."
          },
          {
            "id": "ex-m8-orta",
            "difficulty": "orta",
            "difficultyLabel": "🟡 Orta: Anlamlı Senaryo",
            "title": "Alıştırma 8.2: AAM ile İki Basamaklı Çarpımı Ayrıştırma",
            "scenario": "AL=7 ve BL=8 tek basamaklı unpacked sayıları çarpın (MUL BL) ve ardından AAM komutu ile onlar basamağını AH'ye, birler basamağını AL'ye ayırın.",
            "task": "MOV AL, 7, MOV BL, 8, MUL BL, AAM yazın.",
            "code": "; 🟡 Orta: AAM ile Carpim Sonrasi Ayristirma\nORG 100H\n\n; 1. AL'ye 7 yukleyin:\n; TODO:\n\n\n; 2. BL'ye 8 yukleyin:\n; TODO:\n\n\n; 3. MUL BL ile carpin (AL * BL -> AX):\n; TODO:\n\n\n; 4. AAM komutu ile basamaklari ayristirin:\n; TODO:\n\n\nHLT",
            "solutionCode": "ORG 100H\nMOV AL, 7\nMOV BL, 8\nMUL BL\nAAM\nHLT",
            "solutionBreakdown": [
              "1. Satır: AL = 7",
              "2. Satır: BL = 8",
              "3. Satır: MUL BL -> AL * BL = 56 = 0038h (AX)",
              "4. Satır: AAM komutu 56 / 10 = 5 (AH) ve 56 % 10 = 6 (AL) yapar (AH=05h, AL=06h)."
            ],
            "examTips": "AAM komutu çarpma sonrası unpacked BCD formatına dönüştürür."
          }
        ]
      },
      {
        "title": "3. Modül: ASCII Çıkarma ve Bölme Öncesi Düzeltme (AAS & AAD)",
        "contentHtml": "\n      <div class=\"instruction-box\">\n        <h4><code>AAS</code> (ASCII Adjust after Subtraction)</h4>\n        <p>Unpacked iki tek basamaklı sayının <code>SUB</code> ile çıkarılmasından sonra çalıştırılır. Borç alınmışsa (AF=1 veya alt nibble > 9), AL'den 6 çıkarılır ve AH 1 azaltılır.</p>\n      </div>\n\n      <div class=\"instruction-box\">\n        <h4><code>AAD</code> (ASCII Adjust before Division)</h4>\n        <p>Bölme işleminden <strong>ÖNCE</strong> çalıştırılan tek düzeltme komutudur! AH ve AL'deki iki haneyi tek bir ikili sayıya dönüştürür: $AL = (AH \\times 10) + AL$, $AH = 0$. Ardından standart <code>DIV</code> komutu çalıştırılır.</p>\n      </div>\n    ",
        "examples": [
          {
            "id": "ex-m8-aad",
            "difficulty": "orta",
            "difficultyLabel": "🟡 3. Modül Labı: AAD Bölme Öncesi",
            "title": "Mini-Lab 8.3: AAD ile İki Basamaklı Sayıyı Bölmeye Hazırlama",
            "scenario": "AH = 2 (onlar) ve AL = 5 (birler) olarak verilen 25 unpacked sayısını, AAD komutu ile ikili (binary) 25 (19h) değerine dönüştürün.",
            "task": "MOV AH, 2, MOV AL, 5 yükleyin. AAD komutunu çalıştırarak AL = 25 (0019H) ve AH = 0 olduğunu Registers panelinde görün.",
            "code": "; 🟡 Mini-Lab 8.3: AAD Komutu\nORG 100H\n\nMOV AH, 2\nMOV AL, 5\n\n; 1. AAD komutunu calistirarak sayiyi binary formata donusturun:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AH, 2\nMOV AL, 5\nAAD\nHLT",
            "solutionBreakdown": [
              "1. Satır: AH = 2, AL = 5 (Unpacked 25)",
              "2. Satır: AAD — AL = (2 * 10) + 5 = 25 (19H), AH = 0."
            ],
            "examTips": "AAD komutu bölme işleminden ÖNCE çalışan tek komuttur!"
          }
        ]
      }
    ]
  },
  "milestone-9": {
    "milestoneId": "milestone-9",
    "milestoneNumber": 9,
    "title": "Giriş / Çıkış (I/O) Sistemleri, Portlar ve Sistem Kesmeleri (IN, OUT, INT, IVT)",
    "subtitle": "Port Tabanlı Donanım İletişimi, 256 Vektörlü IVT, BIOS ve DOS Sistem Servisleri",
    "slideRef": "Hoca: Week 6 & 12 PDF, Code Examples PDF | Kitap: Barry B. Brey Bölüm 11 & 12",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 9: PORT I/O & SİSTEM KESMELERİ (INTERRUPTS)</div>\n      <p class=\"lecture-hero-text\">\n        Mikroişlemcinin klavye, ekran kartı ve seri port gibi çevre birimleriyle haberleşmesi <b>Port Giriş/Çıkışı (IN/OUT)</b> \n        ve <b>Donanımsal/Yazılımsal Kesmeler (INT)</b> ile gerçekleştirilir.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın 3 Altın I/O & Kesme Kuralı:</strong><br>\n        1. <b>Port Adresi Kuralı (Sınav Klasiği):</b> Port numarası 0–255 (00H–0FFH) arasında ise sabit yazılabilir (<code>IN AL, 80H</code>). Eğer port numarası 255'ten büyükse port adresi <strong>MUTLAKA DX YAZMACINA</strong> yüklenmelidir: <code>MOV DX, 03F8H</code> ➔ <code>OUT DX, AL</code>.<br>\n        2. <b>IVT Konumu ve Formülü:</b> Kesme Vektör Tablosu daima belleğin ilk 1024 baytında (<code>00000H – 003FFH</code>) yer alır. Kesme $N$ adresi: $IP = N \\times 4$, $CS = (N \\times 4) + 2$.<br>\n        3. <b>IRET vs RET:</b> Normal RET sadece IP'yi çekerken, <code>IRET</code> yığından sırasıyla <strong>IP, CS ve FLAGS</strong> çekerek tam geri dönüş sağlar.\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Port Giriş/Çıkışı (IN ve OUT) — DX Kuralı",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>IN Akümülatör, Port</code> ve <code>OUT Port, Akümülatör</code></h4>\n          <p>İşlemci ile çevre birimleri (I/O Portları) arasında bayt veya kelime aktarır.</p>\n          <ul>\n            <li>Veri aktarımı <b>YALNIZCA AL VEYA AX</b> üzerinden yapılabilir!</li>\n            <li>🚨 <strong>DX Kuralı:</strong> 255'ten büyük port adresleri komutun içine yazılamaz; DX'e alınmak zorundadır:\n              <pre><code>MOV DX, 03F8H   ; Seri iletisim portu (COM1)\nOUT DX, AL      ; AL'deki bayti porta gonder</code></pre>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m9-in-out",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: IN ve OUT",
            "title": "Mini-Lab 9.1: 80H Portuna Veri Gönderme ve DX ile Port Erişimi",
            "scenario": "Port 80H donanım teşhis portudur. AL = 0AAH durum kodunu 80H portuna gönderin (OUT 80H, AL).",
            "task": "MOV AL, 0AAH ardından OUT 80H, AL komutunu çalıştırın.",
            "code": "; 🟢 Mini-Lab 9.1: OUT Komutu\nORG 100H\n\nMOV AL, 0AAH\n\n; 1. AL'deki degeri 80H portuna gonderin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AL, 0AAH\nOUT 80H, AL\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AL, 0AAH",
              "2. Satır: OUT 80H, AL — Donanım portuna teşhis baytı yazılır."
            ],
            "examTips": "Port numarası 255'ten küçükse doğrudan port yazılabilir."
          }
        ]
      },
      {
        "title": "2. Modül: BIOS Video Servisi ile Ekrana Karakter Yazma (INT 10H, AH=0Eh)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>INT 10H</code> (BIOS Video Servisleri) — AH = 0Eh Teletype</h4>\n          <p>Ekrana tek bir karakter basmak için kullanılır. İmleci otomatik bir adım ilerletir.</p>\n          <ul>\n            <li><code>AH = 0Eh</code> ➔ Teletype fonksiyonu seçilir.</li>\n            <li><code>AL = Karakter ASCII</code> ➔ Basılacak karakter (örn: <code>'A'</code> veya <code>41H</code>).</li>\n            <li><code>INT 10H</code> ➔ Kesme çağrılır.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m9-int10",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 2. Modül Labı: BIOS INT 10H",
            "title": "Mini-Lab 9.2: Konsola 'A' Karakteri Yazdırma",
            "scenario": "Hocanın Week 12 Kod Örneği 11'de yer alan BIOS teletype fonksiyonu ile ekrana 'A' karakteri yazdırılacaktır.",
            "task": "AH=0Eh, AL='A' yükleyin ve INT 10H çağırarak konsolda 'A' karakterini görün.",
            "code": "; 🟢 Mini-Lab 9.2: INT 10H\nORG 100H\n\n; 1. AH'ye 0Eh fonksiyon kodunu yukleyin:\n; TODO:\n\n\n; 2. AL'ye 'A' karakterini yukleyin:\n; TODO:\n\n\n; 3. INT 10H kesmesini cagirin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AH, 0EH\nMOV AL, 'A'\nINT 10H\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AH, 0EH — Teletype modu.",
              "2. Satır: MOV AL, 'A' — Basılacak karakter.",
              "3. Satır: INT 10H — Ekrana 'A' basılır."
            ],
            "examTips": "BIOS video kesmelerinde AH daima fonksiyon numarasını tutar."
          }
        ]
      },
      {
        "title": "3. Modül: DOS Servis Kesmeleri (INT 21H, AH=02h ve AH=09h)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>INT 21H</code> (MS-DOS İşletim Sistemi Servisleri)</h4>\n          <p>DOS işletim sistemi üzerinden konsol ve dosya erişimi sağlar.</p>\n          <ul>\n            <li><code>AH = 02H:</code> DL'deki tek bir karakteri ekrana basar.</li>\n            <li><code>AH = 09H:</code> DX ofset adresindeki <b>'$' ile biten</b> metin dizgisini ekrana basar.</li>\n            <li><code>AH = 4CH:</code> Programı sonlandırıp DOS'a döner.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m9-int21",
            "difficulty": "orta",
            "difficultyLabel": "🟡 3. Modül Labı: DOS INT 21H",
            "title": "Mini-Lab 9.3: DOS Servisi ile Ekrana Karakter Basma",
            "scenario": "DOS INT 21H fonksiyon 02h servisini kullanarak DL register'ındaki 'X' karakterini ekrana yazdırın.",
            "task": "AH=02H, DL='X' yapın ve INT 21H kesmesini çalıştırın.",
            "code": "; 🟡 Mini-Lab 9.3: INT 21H\nORG 100H\n\n; 1. AH'ye 02H (Karakter Basma) fonksiyonunu yukleyin:\n; TODO:\n\n\n; 2. DL'ye basilicak karakteri ('X') yukleyin:\n; TODO:\n\n\n; 3. INT 21H cagirin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AH, 02H\nMOV DL, 'X'\nINT 21H\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AH, 02H — DOS Karakter Yazma servisi.",
              "2. Satır: MOV DL, 'X' — DL'ye karakter atanır.",
              "3. Satır: INT 21H — Ekrana 'X' basılır."
            ],
            "examTips": "INT 21h AH=02h fonksiyonunda karakter AL'ye değil, DL YAZMACINA konur!"
          }
        ]
      }
    ]
  },
  "milestone-10": {
    "milestoneId": "milestone-10",
    "milestoneNumber": 10,
    "title": "İleri İşlemci Mimarisi, Boru Hattı (Pipelining) & 8086 LeetCode",
    "subtitle": "Boru Hattı Tehlikeleri (Hazards), Döngü Açma (Loop Unrolling) ve Rescheduling",
    "slideRef": "Hoca: Week 12, 13, 14 & 15 PDF'leri | Kitap: Barry B. Brey Bölüm 14 & 16",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 10: PERFORMANS OPTİMİZASYONU & BORU HATTI</div>\n      <p class=\"lecture-hero-text\">\n        İşlemci performansını maksimize etmenin yolu komutları paralel yürütmekten geçer. \n        Ancak boru hattında ortaya çıkan <b>Tehlikeler (Hazards)</b> gecikmelere yol açar. Bu aşamada döngü açma ve komut yeniden sıralama teknikleri pratik edilir.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın 3 Altın Mimari Kuralı:</strong><br>\n        1. <b>Loop Unrolling (Döngü Açma):</b> LOOP komutunun dallanma cezasını (Branch Penalty) kaldırmak için döngü gövdesini ardışık yazmak performansı katlar.<br>\n        2. <b>Instruction Rescheduling:</b> Veri bağımlılığı (RAW) olan komutların arasına bağımsız komutlar sokarak NOP gecikmelerini yok etmek.<br>\n        3. <b>8085 vs 8086:</b> 8085 saf akümülatör ve HL işaretçisi kullanırken, 8086 genel amaçlı yazmaç kümesi ve segmentli mimariye sahiptir.\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Loop Unrolling (Döngü Açma) ile Pipeline Ceza Önleme",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4>Loop Unrolling (Döngü Açma Tekniği)</h4>\n          <p>Küçük sayıda dönen döngülerde her adımda LOOP komutunun harcadığı saat çevrimlerini ve dallanma cezasını (Branch Penalty) ortadan kaldırmak için döngü gövdesi düz satırlar halinde yazılır.</p>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m10-unroll",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: Loop Unrolling",
            "title": "Mini-Lab 10.1: Loop Unrolling ile Hızlı Artırma",
            "scenario": "Hocanın Week 13 Kod Örneği 13'te sunduğu gibi, 4 kez LOOP ile dönmek yerine 4 adet ardışık ADD AX, 1 yazarak boru hattı cezasını sıfırlayın.",
            "task": "AX'i 0 yapın. 4 kez ardışık ADD AX, 1 yazarak AX=4 sonucuna döngüsüz ulaşın.",
            "code": "; 🟢 Mini-Lab 10.1: Loop Unrolling\nORG 100H\n\nMOV AX, 0\n\n; 1. LOOP yerine ardisik 4 adet ADD AX, 1 komutu yazin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 0\nADD AX, 1\nADD AX, 1\nADD AX, 1\nADD AX, 1\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 0",
              "2-5. Satırlar: 4 adet ardışık toplama. Boru hattı hiçbir JMP/LOOP cezası yaşamadan tam hızla dolar (AX=4)."
            ],
            "examTips": "Loop Unrolling kod boyutunu biraz büyütür ama maksimum yürütme hızı sağlar."
          }
        ]
      },
      {
        "title": "2. Modül: Instruction Rescheduling ile RAW Veri Bağımlılığı Önleme",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4>Instruction Rescheduling (Komut Yeniden Sıralama)</h4>\n          <p>Bir komutun sonucunu bekleyen diğer komutun arasına, o yazmaçla ilgisi olmayan bağımsız bir komut sokulur. Böylece işlemci boş beklemez (stall / bubble oluşmaz).</p>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m10-resched",
            "difficulty": "orta",
            "difficultyLabel": "🟡 2. Modül Labı: Rescheduling",
            "title": "Mini-Lab 10.2: Komut Yeniden Sıralama",
            "scenario": "Hocanın Week 13 Kod Örneği 14'te yer alan optimizasyon: AX'in güncellenmesini beklemeden araya CX ile ilgili bağımsız komut yerleştirin.",
            "task": "MOV AX, 1 ardından MOV CX, 2 yazın. Sonra ADD AX, 10 ve ADD CX, 20 çalıştırın.",
            "code": "; 🟡 Mini-Lab 10.2: Rescheduling\nORG 100H\n\n; 1. AX ve CX bagimsiz komutlarini pes pese baslatin:\n; TODO:\n\n\n; 2. Toplama islemlerini yurutun:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AX, 1\nMOV CX, 2\nADD AX, 10\nADD CX, 20\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV AX, 1",
              "2. Satır: Araya bağımsız MOV CX, 2 konur.",
              "3-4. Satırlar: ADD AX, 10 ve ADD CX, 20 ile boru hattında duraklama engellenir."
            ],
            "examTips": "Derleyiciler pipeline verimini artırmak için komut sırasını bağımlılıklara göre otomatik olarak yeniden düzenler."
          }
        ]
      }
    ]
  },
  "milestone-11": {
    "milestoneId": "milestone-11",
    "milestoneNumber": 11,
    "title": "İleri Sistem Komutları, Bayrak Manipülasyonu & Donanım Tabloları",
    "subtitle": "CLC/STC/CMC, CLI/STI, LAHF/SAHF, XLAT, LDS/LES, JCXZ, CBW/CWD ve Assembler Direktifleri",
    "slideRef": "Hoca: Week 3, 5, 6 & Code Examples PDF | Kitap: Barry B. Brey Bölüm 4 & 5",
    "overviewHtml": "\n    <div class=\"lecture-hero-card\">\n      <div class=\"lecture-hero-badge\">AŞAMA 11: İLERİ SİSTEM KOMUTLARI & VERİ TABLOLARI</div>\n      <p class=\"lecture-hero-text\">\n        8086 Instruction Manual'ında yer alan ve doğrudan donanımı denetleyen özel bayrak komutları, \n        hızlı tablo dönüştürme (Lookup Table) ve assembler direktifleri bu kapanış aşamasında tek tek pratik edilir.\n      </p>\n      <div class=\"lecture-golden-rule\">\n        💡 <strong>Hocanın ve Barry Brey'in Altın Sistem Kuralları:</strong><br>\n        1. <b>Carry Bayrağı Denetimi:</b> <code>CLC</code> (CF=0 yapar), <code>STC</code> (CF=1 yapar), <code>CMC</code> (CF'yi tersler).<br>\n        2. <b>Donanımsal Tablo Çevirisi (XLAT):</b> <code>DS:BX</code> adresindeki tablodan <code>AL</code> indeksindeki elemanı tek bir makine çevriminde AL içine okur ($AL = [BX + AL]$).<br>\n        3. <b>Sıfır Sayaç Koruması (JCXZ):</b> LOOP komutu öncesinde CX=0 ise döngünün 65535 kez dönüp taşmasını önlemek için <code>JCXZ</code> ile güvenlik atlaması yapılır.<br>\n        4. <b>Segment Kurulum Altın Kuralı (@DATA):</b> 8086 mimarisinde segment yazmaçlarına doğrudan sabit yüklenemez; veri segmenti için önce <code>MOV AX, @DATA</code>, ardından <code>MOV DS, AX</code> yazılmalıdır!\n      </div>\n    </div>\n  ",
    "sections": [
      {
        "title": "1. Modül: Carry Bayrağı Denetim Komutları (CLC, STC, CMC)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>CLC</code>, <code>STC</code> ve <code>CMC</code></h4>\n          <p>Carry Flag (CF - Elde Bayrağı) durumunu doğrudan donanımsal olarak kurmak, sıfırlamak veya terslemek için kullanılır.</p>\n          <ul>\n            <li><code>CLC</code> (Clear Carry) ➔ $CF = 0$. <code>ADC</code> veya <code>SBB</code> zincirinden önce eldeyi sıfırlamak için kullanılır.</li>\n            <li><code>STC</code> (Set Carry) ➔ $CF = 1$. Hata göstergesi döndürmek veya eldenin 1 olduğunu bildirmek için kullanılır.</li>\n            <li><code>CMC</code> (Complement Carry) ➔ $CF = NOT(CF)$. Elde 1 ise 0, 0 ise 1 yapar.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m11-flags",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 1. Modül Labı: CLC, STC ve CMC",
            "title": "Mini-Lab 11.1: Carry Bayrağını Kurma, Tersleme ve Temizleme",
            "scenario": "Sistemde Carry Flag durumunu sırasıyla 1 yapın (STC), tersleyin (CMC ile 0) ve ardından tekrar 1 yapın.",
            "task": "STC, CMC, STC komutlarını sırasıyla yazın. Adım adım çalıştırarak Flags panelinde CF değişimini izleyin.",
            "code": "; 🟢 Mini-Lab 11.1: Bayrak Kontrol Komutlari\nORG 100H\n\n; 1. STC ile CF=1 yapin:\n; TODO:\n\n\n; 2. CMC ile CF'yi tersleyin (CF=0):\n; TODO:\n\n\n; 3. STC ile tekrar CF=1 yapin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nSTC\nCMC\nSTC\nHLT",
            "solutionBreakdown": [
              "1. Satır: STC — Carry Flag (CF) = 1 olur.",
              "2. Satır: CMC — CF = 0 olur (Terslenir).",
              "3. Satır: STC — CF = 1 olur."
            ],
            "examTips": "Bu komutlar operand almaz; doğrudan bayrak bitini etkiler."
          }
        ]
      },
      {
        "title": "2. Modül: Bayrakları AH Yazmacına Alma ve Yükleme (LAHF & SAHF)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>LAHF</code> ve <code>SAHF</code> (8080/8085 Uyumluluğu)</h4>\n          <p>8086 durum bayrakları ile AH yazmacı arasında doğrudan veri transferi sağlar.</p>\n          <ul>\n            <li><code>LAHF</code> (Load AH from Flags): SF, ZF, AF, PF, CF bayraklarını AH yazmacının 7, 6, 4, 2, 0 bitlerine tek seferde okur.</li>\n            <li><code>SAHF</code> (Store AH into Flags): AH yazmacındaki bitleri bayraklar yazmacına geri yazar.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m11-lahf",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 2. Modül Labı: LAHF ve SAHF",
            "title": "Mini-Lab 11.2: Bayrakları AH Yazmacına Okuma",
            "scenario": "CF=1 iken LAHF komutu ile bayraklar kümesini AH yazmacına aktarın ve AH'nin 0. bitinin 1 olduğunu görün.",
            "task": "STC komutu ile CF=1 yapın. Ardından LAHF komutu ile bayrakları AH'ye okuyun.",
            "code": "; 🟢 Mini-Lab 11.2: LAHF Komutu\nORG 100H\n\n; 1. STC ile CF=1 kurun:\n; TODO:\n\n\n; 2. LAHF komutu ile bayraklari AH'ye okuyun:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nSTC\nLAHF\nHLT",
            "solutionBreakdown": [
              "1. Satır: STC — CF = 1 kurulur.",
              "2. Satır: LAHF — Durum bayrakları AH içine aktarılır (bit 0 = CF = 1)."
            ],
            "examTips": "LAHF ve SAHF Intel 8080/8085 işlemcilerinden 8086'ya kod taşınırken geliştirilmiş özel komutlardır."
          }
        ]
      },
      {
        "title": "3. Modül: Donanımsal Tablo Çeviri Komutu (XLAT / XLATB)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>XLAT</code> (Translate / Lookup Table)</h4>\n          <p>Barry B. Brey kitabının Bölüm 4'ünde genişçe anlatılan donanımsal tablo çeviri komutudur.</p>\n          <ul>\n            <li><strong>Formül:</strong> $AL = [DS:BX + AL]$</li>\n            <li>Tablo başlangıç adresi <code>BX</code> içindedir. Çevrilecek indeks <code>AL</code> içindedir.</li>\n            <li><code>XLAT</code> komutu çalıştığında işlemci otomatik olarak $BX + AL$ adresindeki baytı okur ve sonucu tekrar <code>AL</code> içine yazar!</li>\n            <li>Kullanım Alanı: 7 segment display tablosu, ASCII'den EBCDIC'e çeviri veya şifre çözme tabloları.</li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m11-xlat",
            "difficulty": "orta",
            "difficultyLabel": "🟡 3. Modül Labı: XLAT ile Tablo Okuma",
            "title": "Mini-Lab 11.3: 7-Segment Kod Tablosundan XLAT ile Okuma",
            "scenario": "Tablo 0200H adresinde başlamaktadır: [0200H]=3FH ('0'), [0201H]=06H ('1'), [0202H]=5BH ('2'), [0203H]=4FH ('3'). 3 sayısının kodunu tek bir XLAT komutu ile çekin.",
            "task": "BX=0200H, AL=3 ayarlayın. XLAT komutunu çalıştırarak AL içine 4FH değerinin geldiğini görün.",
            "code": "; 🟡 Mini-Lab 11.3: XLAT Komutu\nORG 100H\n\n; 1. BX'e tablo adresini (0200H) yukleyin:\n; TODO:\n\n\n; 2. AL'ye aranacak indis olan 3'u yukleyin:\n; TODO:\n\n\n; 3. XLAT komutunu calistirin (AL = [BX + AL]):\n; TODO:\n\n\nHLT\n",
            "initialMemory": [
              {
                "segment": 0,
                "offset": 512,
                "bytes": [
                  63,
                  6,
                  91,
                  79,
                  102
                ]
              }
            ],
            "solutionCode": "ORG 100H\nMOV BX, 0200H\nMOV AL, 3\nXLAT\nHLT",
            "solutionBreakdown": [
              "1. Satır: MOV BX, 0200H — Tablo tabanı.",
              "2. Satır: MOV AL, 3 — İndis.",
              "3. Satır: XLAT — [0200H + 3] = [0203H] hücresindeki 4FH baytını AL içine yazar."
            ],
            "examTips": "XLAT operand almaz; sabit olarak BX tabanını ve AL akümülatörünü kullanır."
          }
        ]
      },
      {
        "title": "4. Modül: Sıfır Sayaç Güvenlik Atlaması (JCXZ)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>JCXZ Etiket</code> (Jump if CX is Zero)</h4>\n          <p>CX yazmacı sıfır ($CX == 0$) ise belirtilen etikete atlar. Hiçbir bayrağı etkilemez ve denetlemez.</p>\n          <ul>\n            <li>🚨 <strong>Hocanın Önemli Sınav Uyarısı:</strong>\n              <br>Eğer bir döngüye girerken $CX = 0$ ise, döngü sonundaki <code>LOOP</code> komutu CX'i 1 azaltarak <code>0FFFFH</code> (65535) yapar ve döngü 65535 kez gereksiz yere çalışır!\n              <br>Bunu önlemek için döngünün hemen başına <code>JCXZ DONGUDEN_CIK</code> yazılarak CX=0 durumu güvenle atlanır.\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m11-jcxz",
            "difficulty": "orta",
            "difficultyLabel": "🟡 4. Modül Labı: JCXZ Döngü Güvenliği",
            "title": "Mini-Lab 11.4: CX = 0 İken Döngüyü Güvenle Atlama",
            "scenario": "CX = 0 olduğunda döngünün 65535 kez dönmesini engellemek için döngü öncesinde JCXZ ile ATLA etiketine sıçrayın.",
            "task": "CX=0 iken JCXZ ATLA yazarak döngüyü atlayın. AX'in 0 kaldığını doğrulayın.",
            "code": "; 🟡 Mini-Lab 11.4: JCXZ Komutu\nORG 100H\n\nMOV CX, 0\nMOV AX, 0\n\n; 1. CX == 0 ise ATLA etiketine sicrayin (JCXZ):\n; TODO:\n\n\nDONGU:\nADD AX, 1\nLOOP DONGU\n\nATLA:\nHLT\n",
            "solutionCode": "ORG 100H\nMOV CX, 0\nMOV AX, 0\nJCXZ ATLA\nDONGU:\nADD AX, 1\nLOOP DONGU\nATLA:\nHLT",
            "solutionBreakdown": [
              "1. Satır: CX = 0",
              "2. Satır: JCXZ ATLA — CX sıfır olduğu için döngüye girmeden doğrudan ATLA etiketine atlar."
            ],
            "examTips": "JCXZ komutu bayrakları denetlemez; doğrudan CX yazmacının donanımsal değerine bakar."
          }
        ]
      },
      {
        "title": "5. Modül: İşaret Genişletme Komutları (CBW & CWD)",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>CBW</code> (Convert Byte to Word) ve <code>CWD</code> (Convert Word to Doubleword)</h4>\n          <p>İşaretli (negatif/pozitif) sayılarda <code>IDIV</code> bölmesi yapmadan önce işaret bitini üst parçaya yaymak için kullanılır.</p>\n          <ul>\n            <li><code>CBW</code>: <code>AL</code>'deki 8-bit sayının işaret bitini (bit 7) <code>AH</code>'ye yayarak 16-bit <code>AX</code> yapar.\n              <br>• $AL = -5$ (0FBH) iken <code>CBW</code> ➔ $AX = 0FFFBH$ (-5).\n            </li>\n            <li><code>CWD</code>: <code>AX</code>'teki 16-bit sayının işaret bitini (bit 15) <code>DX</code>'e yayarak 32-bit <code>DX:AX</code> yapar.\n              <br>• Sayı negatifse DX = 0FFFFH, pozitifse DX = 0000H olur.\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m11-cbw",
            "difficulty": "kolay",
            "difficultyLabel": "🟢 5. Modül Labı: CBW Komutu",
            "title": "Mini-Lab 11.5: 8-Bit Negatif Sayıyı 16-Bit'e Genişletme",
            "scenario": "AL = -10 (0F6H) sayısını CBW komutu ile 16-bit AX'e genişleterek AX = 0FFF6H (-10) yapın.",
            "task": "MOV AL, 0F6H ardından CBW komutunu çalıştırın. AH'nin 0FFH olduğunu görün.",
            "code": "; 🟢 Mini-Lab 11.5: CBW Komutu\nORG 100H\n\nMOV AL, 0F6H   ; -10\n\n; 1. CBW komutu ile isareti AH'ye yayarak 16-bit yapin:\n; TODO:\n\n\nHLT\n",
            "solutionCode": "ORG 100H\nMOV AL, 0F6H\nCBW\nHLT",
            "solutionBreakdown": [
              "1. Satır: AL = 0F6H (bit 7 = 1, negatif)",
              "2. Satır: CBW — İşaret biti AH'ye yayılır: AH = 0FFH, AX = 0FFF6H (-10)."
            ],
            "examTips": "IDIV komutundan önce CBW veya CWD çalıştırılmazsa AH/DX içinde kalan çöp veriler sonucu bozar!"
          }
        ]
      },
      {
        "title": "6. Modül: 8086 Bellek Modelleri (.MODEL), Segment Direktifleri (.DATA, .CODE) ve @DATA Altın Kuralı",
        "contentHtml": "\n        <div class=\"instruction-box\">\n          <h4><code>.MODEL</code>, <code>.DATA</code>, <code>.CODE</code>, <code>.STACK</code> ve <code>@DATA</code> Sembolü</h4>\n          <p>\n            Intel 8086 ve MASM/TASM standartlarında program yazarken iki temel yapı kullanılır:\n            <strong>Klasik Tam Segment Tanımı</strong> (Barry B. Brey) ve modern <strong>Basitleştirilmiş Segment Direktifleri</strong> (.MODEL).\n          </p>\n          <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin: 12px 0;\">\n            <div style=\"background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border-left: 3px solid #6366f1;\">\n              <strong>1. Basitleştirilmiş (.MODEL SMALL):</strong>\n              <pre style=\"margin:4px 0; font-size:12px;\"><code>.MODEL SMALL\n.STACK 100H\n.DATA\n  SAYI DW 1234H\n.CODE\nMAIN PROC\n  MOV AX, @DATA\n  MOV DS, AX\n  MOV BX, [SAYI]\n  HLT\nMAIN ENDP\nEND MAIN</code></pre>\n            </div>\n            <div style=\"background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border-left: 3px solid #10b981;\">\n              <strong>2. Geleneksel Tam Segment (Barry Brey):</strong>\n              <pre style=\"margin:4px 0; font-size:12px;\"><code>DATA SEGMENT\n  SAYI DW 1234H\nDATA ENDS\nCODE SEGMENT\n  ASSUME CS:CODE, DS:DATA\nSTART:\n  MOV AX, DATA\n  MOV DS, AX\n  MOV BX, [SAYI]\n  HLT\nCODE ENDS\nEND START</code></pre>\n            </div>\n          </div>\n          <ul>\n            <li><code>.MODEL SMALL</code>: Kod için tek bir 64KB segment, Veri için tek bir 64KB segment tanımlar. Üniversite laboratuvarları ve standart DOS EXE programları için en yaygın modeldir. (Diğerleri: TINY [COM formatı, tek 64KB segment], MEDIUM, COMPACT, LARGE).</li>\n            <li><code>.DATA</code>: Değişkenlerin (DB, DW) bellekteki yerleşim alanını açar.</li>\n            <li><code>.CODE</code>: Yürütülecek işlemci komutlarının segmentini başlatır.</li>\n            <li><code>.STACK 100H</code>: Yığın için 256 baytlık (100h) çalışma alanı tahsis eder.</li>\n            <li><code>@DATA</code>: Derleyicinin .DATA segmentine atadığı 16-bitlik başlangıç segment adresidir.</li>\n            <li>🚨 <strong>HOCANIN VE SINAVLARIN ALTIN KURALI:</strong>\n              <br>Neden <code>MOV DS, @DATA</code> veya <code>MOV DS, 1000H</code> doğrudan yazılamaz?\n              <br><strong>Çünkü Intel 8086 donanım mimarisinde segment yazmaçlarına (CS, DS, ES, SS) doğrudan sabit/immediate sayı yükleyecek bir işlem kodu (opcode) YOKTUR!</strong>\n              <br>Bu nedenle segment adresi önce <code>AX</code> gibi genel amaçlı bir yazmaca yüklenir, ardından <code>DS</code>'ye kopyalanır:\n              <br><code>MOV AX, @DATA</code>\n              <br><code>MOV DS, AX</code>\n            </li>\n          </ul>\n        </div>\n      ",
        "examples": [
          {
            "id": "ex-m11-segment-data",
            "difficulty": "orta",
            "difficultyLabel": "🟡 6. Modül Labı: Segment Kurulumu ve Değişken Okuma",
            "title": "Mini-Lab 11.6: @DATA ile Veri Segmentini Başlatma ve Değişkene Erişim",
            "scenario": ".DATA alanında tanımlı SAYI (1234H) değişkenini okumak için önce MOV AX, @DATA ve MOV DS, AX ile veri segmentini kurun, ardından BX yazmacına değişken değerini yükleyin.",
            "task": "MOV AX, @DATA ve MOV DS, AX komutlarını yazarak DS'yi kurun. Ardından MOV BX, [SAYI] ile 1234H değerini BX'e okuyun.",
            "code": "; 🟡 Mini-Lab 11.6: @DATA ve Segment Direktifleri\n.MODEL SMALL\n.STACK 100H\n.DATA\n  SAYI DW 1234H\n.CODE\nMAIN PROC\n  ; 1. @DATA adresini AX'e yukleyin:\n  ; TODO:\n\n\n  ; 2. AX'i DS yazmacina aktarin:\n  ; TODO:\n\n\n  ; 3. [SAYI] adresindeki degeri BX'e okuyun:\n  ; TODO:\n\n\n  HLT\nMAIN ENDP\nEND MAIN\n",
            "solutionCode": ".MODEL SMALL\n.STACK 100H\n.DATA\n  SAYI DW 1234H\n.CODE\nMAIN PROC\n  MOV AX, @DATA\n  MOV DS, AX\n  MOV BX, [SAYI]\n  HLT\nMAIN ENDP\nEND MAIN",
            "solutionBreakdown": [
              "1. Satır: .MODEL SMALL — 64KB kod ve 64KB veri segmentli standart EXE bellek modelini kurar.",
              "2. Satır: .DATA altında SAYI DW 1234H tanımlanır.",
              "3. Satır: MOV AX, @DATA — Veri segmentinin başlangıç adresi AX genel yazmacına alınır.",
              "4. Satır: MOV DS, AX — DS segment yazmacı başlatılır. (8086'da MOV DS, @DATA doğrudan yapılamaz!).",
              "5. Satır: MOV BX, [SAYI] — DS:SAYI adresindeki 1234H kelimesi BX yazmacına okunur."
            ],
            "examTips": "Sınav Sorusu: 'Neden MOV DS, 1000H veya MOV DS, @DATA komutu derleme hatası verir?' Cevap: 8086 mimarisinde Immediate-to-Segment Register opcodu bulunmaz. Transfer genel amaçlı bir yazmaç üzerinden (AX) iki adımda yapılmak zorundadır."
          }
        ]
      }
    ]
  }
};
