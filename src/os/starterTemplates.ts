/**
 * starterTemplates.ts
 * 
 * Yeni bir OS projesi oluşturulduğunda açılan temiz başlangıç dosyaları.
 * Kullanıcı kendi işletim sistemini bu dosyalara satır satır kendisi yazacaktır.
 */

export const BOOT_ASM_TEMPLATE = `; ==========================================================
; [OS PROJESİ] 1. MODÜL: BOOTLOADER (Önyükleyici)
; Bilgisayar açıldığında BIOS bu 512 baytlık kodu 0000:7C00h
; adresine yükler ve CS:IP'yi buraya yönlendirir.
; ==========================================================
ORG 7C00h

; [ADIM 1]: Buraya donanım segmentlerini sıfırlayan ve
; ilk ekrana yazdırma kodlarımızı birlikte yazacağız.

HLT
`;

export const KERNEL_ASM_TEMPLATE = `; ==========================================================
; [OS PROJESİ] 2. MODÜL: KERNEL (Ana Çekirdek)
; Bootloader tarafından RAM'e (1000h adresine) yüklenen
; ve sistemin ana beyni olan çekirdek kodumuz.
; ==========================================================
ORG 1000h

; [ADIM 2]: Çekirdek başlangıç ve karşılama kodları buraya yazılacak.

HLT
`;

export const SCREEN_ASM_TEMPLATE = `; ==========================================================
; [OS PROJESİ] 3. MODÜL: EKRAN SÜRÜCÜSÜ (Screen Driver)
; Ekrana karakter basma, string yazdırma ve ekranı temizleme.
; ==========================================================

; [ADIM 3]: Ekran alt rutinlerimizi (PUT_CHAR, CLEAR vb.) buraya yazacağız.

RET
`;

export const KEYBOARD_ASM_TEMPLATE = `; ==========================================================
; [OS PROJESİ] 4. MODÜL: KLAVYE SÜRÜCÜSÜ (Keyboard Driver)
; Klavyeden tuş okuma, tampon (buffer) ve echo yönetimi.
; ==========================================================

; [ADIM 4]: Klavye okuma rutinlerimizi buraya yazacağız.

RET
`;

export const SHELL_ASM_TEMPLATE = `; ==========================================================
; [OS PROJESİ] 5. MODÜL: KİŞİSEL KOMUT İSTEMCİSİ (Shell)
; Komut istemi (prompt), komut ayrıştırma ve alt programlar.
; ==========================================================

; [ADIM 5]: Komut satırı döngümüzü buraya yazacağız.

RET
`;
