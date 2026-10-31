export interface CodeSample {
  name: string;
  description: string;
  code: string;
}

export const SAMPLES: CodeSample[] = [
  {
    name: "1. Kabul Testi (Dizi Toplamı)",
    description: "DIZI içindeki 5, 12, 8 sayılarını toplayıp AL'ye yazar (AL=19h, CX=0).",
    code: `ORG 100H ; DOS COM dosyası başlangıç direktifi

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
`
  },
  {
    name: "2. INT 21h ile Ekrana Yazdırma",
    description: "DOS INT 21h servisi (AH=09h) ile konsola merhaba mesajı yazdırır.",
    code: `ORG 100H

START:
  MOV DX, OFFSET MESAJ ; String adresini DX'e al
  MOV AH, 09H          ; INT 21h String yazdırma fonksiyonu
  INT 21H              ; Konsola yaz

  MOV AH, 4CH          ; DOS program sonlandırma
  MOV AL, 0            ; Dönüş kodu 0
  INT 21H

MESAJ DB 'Merhaba, 8086 Web Assembly IDE!', 0DH, 0AH, '$'
`
  },
  {
    name: "3. Fibonacci Dizisi (Belleğe Yazma)",
    description: "İlk 8 Fibonacci sayısını hesaplayıp FIBO_DIZI belleğine yazar.",
    code: `ORG 100H

START:
  LEA DI, FIBO_DIZI ; Yazılacak bellek adresi
  MOV BYTE PTR [DI], 1
  INC DI
  MOV BYTE PTR [DI], 1
  INC DI

  MOV CX, 6         ; Kalan 6 terimi hesapla
  MOV AL, 1
  MOV BL, 1

DONGU:
  MOV DL, AL
  ADD DL, BL        ; DL = AL + BL
  MOV [DI], DL      ; Belleğe yaz
  INC DI
  MOV AL, BL
  MOV BL, DL
  LOOP DONGU

  HLT

FIBO_DIZI DB 8 DUP(0)
`
  },
  {
    name: "4. CALL ve RET ile Altprogram (Kare Alma)",
    description: "Yığın kullanarak altprogram çağırır, AL karesini hesaplar.",
    code: `ORG 100H

START:
  MOV AL, 7
  CALL KARE_AL
  MOV BL, AL        ; Sonuç BL'de (49 = 31h)
  HLT

KARE_AL:
  MOV CL, AL
  MOV AL, 0
TOPLAMA:
  ADD AL, CL
  DEC CL
  JNZ TOPLAMA
  RET
`
  },
  {
    name: "5. Karşılaştırma ve Mantık İşlemleri (CMP & Jcc)",
    description: "CMP, AND, XOR ve koşullu atlama örnekleri.",
    code: `ORG 100H

START:
  MOV AX, 00FFH
  XOR AX, 0F0FH     ; Bitwise XOR
  AND AX, 0FF00H    ; Bitwise AND
  CMP AX, 0F000H
  JE  ESIT
  MOV BX, 0
  JMP BITIR

ESIT:
  MOV BX, 1         ; Eşitse BX=1

BITIR:
  HLT
`
  }
];
