/**
 * osMissions.ts
 * 
 * İşletim sistemi modüllerine ait görev tanımları (Giriş, Çıkış, İstenen Mantık, Test).
 */

export interface OSMission {
  role: string;
  stageNumber: number;
  title: string;
  badge: string;
  summary: string;
  inputs: string;
  outputs: string;
  requirements: string[];
  testStep: string;
}

export const OS_MISSIONS: Record<string, OSMission> = {
  boot: {
    role: 'boot',
    stageNumber: 1,
    title: 'GÖREV 1: MBR Önyükleyici & Donanım Segment Kurulumu',
    badge: '1. AŞAMA: BOOTLOADER',
    summary: 'BIOS diski okuyup kontrolü 7C00h adresine verdiğinde donanımı güvenli hale getirip Kernel\'ı başlatmak.',
    inputs: 'CS:IP = 0000:7C00h (BIOS MBR adresi) | DL = 80h (Sürücü No)',
    outputs: 'DS = 0000h, ES = 0000h, SS = 0000h | SP = 7C00h | JMP 1000h (Kernel)',
    requirements: [
      'Kesmeleri durdur (CLI) ile güvenli segment kurulumu yap',
      'XOR AX, AX ile DS, ES, SS segmentlerini 0000h olarak ayarla',
      'Yığın işaretçisini (SP) 7C00h altına kur (yığın aşağı doğru güvenle büyür)',
      'Kesmeleri aç (STI) ve ekrana yeşil CRT boot mesajı yazdır',
      'Kernel giriş adresine atla (JMP KERNEL_ENTRY / 1000h)'
    ],
    testStep: 'Simülatörde "Çalıştır"a basın. Monitörde yeşil boot mesajını ve Kernel geçişini doğrulayın.'
  },
  kernel: {
    role: 'kernel',
    stageNumber: 2,
    title: 'GÖREV 2: Ana Çekirdek Başlatma & Sistem Karşılama',
    badge: '2. AŞAMA: KERNEL',
    summary: 'Sistemin ana beyni olarak RAM\'de (1000h) uyanıp ekran modunu ayarlamak ve çekirdek başlığını sunmak.',
    inputs: 'CS:IP = 1000:0000h (Bootloader devri) | DS = 0000h, SP = 7C00h',
    outputs: 'Video Modu: 03h (80x25 CRT) | Ekranda sistem başlığı | JMP SHELL_START',
    requirements: [
      'INT 10h (AH=00h, AL=03h) ile 80x25 renkli CRT metin modunu etkinleştir ve ekranı temizle',
      'SI yazmacına KERNEL_BANNER adresini yükle ve string\'i ekrana yazdır',
      'Sistem bellek durumunu (640 KB) doğrula ve kontrolü Shell modülüne (JMP SHELL_START) aktar'
    ],
    testStep: 'Çalıştırdığınızda CRT monitörün temizlenip parlak beyaz çekirdek başlığının ekranda belirdiğini görün.'
  },
  screen: {
    role: 'screen',
    stageNumber: 3,
    title: 'GÖREV 3: CRT Ekran & Metin Sürücüsü (Display Driver)',
    badge: '3. AŞAMA: EKRAN SÜRÜCÜSÜ',
    summary: 'Monitöre tek karakter basma (PUTC), string yazdırma (PUTS), ekran temizleme ve imleç konumlandırma fonksiyonları sağlamak.',
    inputs: 'PUTC: AL = Karakter, BL = Renk | PUTS: SI = String adresi | SET_CURSOR: DH = Satır, DL = Sütun',
    outputs: 'Karakterler CRT VRAM\'ine (0B800h) basılır, imleç ilerler, yazmaçlar PUSHA/POPA ile korunur',
    requirements: [
      'SCREEN_PUTC: INT 10h (AH=0Eh) ile teletype karakter bas',
      'SCREEN_PUTS: LODSB kullanarak string sonundaki sıfıra (NULL) kadar karakterleri bas',
      'SCREEN_CLEAR: INT 10h (AH=00h, AL=03h) ile ekranı temizle',
      'Tüm alt rutinlerin başında PUSHA, sonunda POPA ve RET kullanarak çağıran kodun yazmaçlarını koru'
    ],
    testStep: 'Farklı string adreslerini SI\'ye verip CALL SCREEN_PUTS ile monitörde metin çıktısını test edin.'
  },
  keyboard: {
    role: 'keyboard',
    stageNumber: 4,
    title: 'GÖREV 4: Klavye Sürücüsü & Satır Tamponu (Keyboard Driver)',
    badge: '4. AŞAMA: KLAVYE SÜRÜCÜSÜ',
    summary: 'Klavyeden tuş okuma, Backspace ile karakter silme ve satır girişini tampon belleğe aktarma.',
    inputs: 'READ_CHAR: Yok | READ_LINE: DI = RAM Tampon Adresi, CX = Maksimum Karakter Sayısı',
    outputs: 'READ_CHAR: AL = ASCII tuş kodu, AH = Scan code | READ_LINE: [DI] içinde null ile biten metin',
    requirements: [
      'KEYBOARD_READ_CHAR: INT 16h (AH=00h) çağırarak tuş bekle ve oku',
      'KEYBOARD_READ_LINE döngüsünde basılan her tuşu ekrana yazdır (Echo)',
      'Enter (13) basıldığında tamponu 0 ile sonlandır ve alt satıra geç (CR+LF)',
      'Backspace (8) basıldığında tampon sayacını 1 azalt, CRT ekranda boşlukla karakteri sil'
    ],
    testStep: 'Kodu çalıştırın, CRT monitöre tıklayıp klavyenizden bir şeyler yazın ve Enter/Backspace tuşlarını deneyin.'
  },
  shell: {
    role: 'shell',
    stageNumber: 5,
    title: 'GÖREV 5: Etkileşimli Komut Kabuğu (CLI Shell)',
    badge: '5. AŞAMA: KİŞİSEL SHELL',
    summary: 'Kullanıcıdan "BenimOS>" komut satırında emir bekleyen, komutları ayrıştırıp çalıştıran ana etkileşim döngüsü.',
    inputs: 'SHELL_INPUT_BUFFER: Klavyeden girilen komut dizisi',
    outputs: 'help -> yardım menüsü | cls -> ekran temizleme | bilinmeyen komut -> hata mesajı',
    requirements: [
      'Her döngüde ekrana "BenimOS> " komut istemini bas',
      'KEYBOARD_READ_LINE ile komutu tampona oku',
      'STRING_COMPARE ile komutu "help" ve "cls" ile karşılaştır',
      'Eşleşen komut rutinini çalıştırıp yeni satırda tekrar komut istemine dön'
    ],
    testStep: 'CRT monitörde "help" yazıp Enter\'a basın; ardından "cls" yazıp ekranın temizlendiğini test edin.'
  }
};

export function getMissionForDoc(title: string, role?: string): OSMission | null {
  if (role && OS_MISSIONS[role]) return OS_MISSIONS[role];
  const t = title.toLowerCase();
  if (t.includes('boot')) return OS_MISSIONS.boot;
  if (t.includes('kernel')) return OS_MISSIONS.kernel;
  if (t.includes('screen')) return OS_MISSIONS.screen;
  if (t.includes('keyboard')) return OS_MISSIONS.keyboard;
  if (t.includes('shell')) return OS_MISSIONS.shell;
  return null;
}
