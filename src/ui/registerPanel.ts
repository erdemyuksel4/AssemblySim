import { Registers } from '../cpu/registers.js';
import { Flags } from '../cpu/flags.js';

export type NumberFormat = 'hex' | 'dec' | 'bin';

export const REG_INFO: Record<string, { title: string; desc: string }> = {
  // General Purpose Registers
  'A': {
    title: 'AX - Accumulator Register (Biriktirici)',
    desc: 'Birincil aritmetik, mantık ve G/Ç (I/O) yazmacı. Çarpma/bölme ve sistem çağrılarında temeldir. AH (yüksek 8-bit) ve AL (düşük 8-bit) olarak ayrılır.'
  },
  'B': {
    title: 'BX - Base Register (Taban Yazmacı)',
    desc: 'Taban adresleme yazmacı. Bellek erişimlerinde dolaylı adresleme [BX] için kullanılabilen tek genel amaçlı veri yazmacıdır. (BH ve BL).'
  },
  'C': {
    title: 'CX - Count Register (Sayaç Yazmacı)',
    desc: 'Sayaç yazmacı. LOOP döngülerinde, REP dizi tekrarlarında ve bit kaydırma/döndürme (SHL, ROL vb.) işlemlerinde otomatik sayaçtır. (CH ve CL).'
  },
  'D': {
    title: 'DX - Data Register (Veri Yazmacı)',
    desc: 'Veri yazmacı. 32-bit çarpma ve bölmelerde AX ile eşleşir (DX:AX). Ayrıca IN/OUT port adreslemesinde DX kullanılır. (DH ve DL).'
  },

  // Segment Registers
  'SS': {
    title: 'SS - Stack Segment (Yığın Segmenti)',
    desc: 'Yığın bölgesinin başlangıç segment adresini tutar. SP ve BP işaretçileri varsayılan olarak SS segmentini referans alır.'
  },
  'DS': {
    title: 'DS - Data Segment (Veri Segmenti)',
    desc: 'Programın verilerinin ve değişkenlerinin saklandığı varsayılan veri segmentidir. [offset] adreslemeleri DS tabanlıdır.'
  },
  'ES': {
    title: 'ES - Extra Segment (Ek Segment)',
    desc: 'Ek veri segmenti. Özellikle dizi ve metin komutlarında (MOVSB, STOSB vb.) hedef bellek alanını (ES:DI) belirler.'
  },
  'CS': {
    title: 'CS - Code Segment (Kod Segmenti)',
    desc: 'Yürütülen makine kodlarının bulunduğu kod segmenti. IP (Instruction Pointer) ile birlikte fiziksel yürütme adresini (CS*16 + IP) oluşturur.'
  },

  // Pointer & Index Registers
  'SP': {
    title: 'SP - Stack Pointer (Yığın İşaretçisi)',
    desc: 'Yığının (Stack) en üst noktasının ofset adresini tutar. PUSH ile 2 bayt azalır, POP ile 2 bayt artar.'
  },
  'BP': {
    title: 'BP - Base Pointer (Taban İşaretçisi)',
    desc: 'Yığındaki altprogram parametrelerine ve yerel değişkenlere erişmek için kullanılan taban ofset işaretçisidir ([BP+offset]).'
  },
  'SI': {
    title: 'SI - Source Index (Kaynak İndeksi)',
    desc: 'Kaynak bellek indeks işaretçisi. Dizi komutlarında (MOVSB, LODSB vb.) kaynak adresi (DS:SI) olarak kullanılır.'
  },
  'DI': {
    title: 'DI - Destination Index (Hedef İndeksi)',
    desc: 'Hedef bellek indeks işaretçisi. Dizi komutlarında (MOVSB, STOSB vb.) hedef adresi (ES:DI) olarak kullanılır.'
  },
  'IP': {
    title: 'IP - Instruction Pointer (Komut İşaretçisi)',
    desc: 'Yürütülecek bir sonraki komutun ofset adresini gösterir. Doğrudan MOV ile değiştirilemez; atlama (JMP), çağrı (CALL) veya RET ile değişir.'
  },

  // Status & Control Flags
  'OF': {
    title: 'OF - Overflow Flag (Taşma Bayrağı)',
    desc: 'İşaretli (signed) aritmetik işlemlerde sonuç hedefin kapasitesini aştığında 1 olur.'
  },
  'DF': {
    title: 'DF - Direction Flag (Yön Bayrağı)',
    desc: 'Dizi/string komutlarında yönü belirler. 0 ise ileri/artan adresler (CLD), 1 ise geri/azalan adresler (STD).'
  },
  'IF': {
    title: 'IF - Interrupt Flag (Kesme Bayrağı)',
    desc: 'Dış donanım kesmelerini etkinleştirir (STI: 1) veya devre dışı bırakır/maskeler (CLI: 0).'
  },
  'TF': {
    title: 'TF - Trap Flag (Adım Bayrağı)',
    desc: 'Tek adımda hata ayıklama (single-step debug) modunu etkinleştirir. Her komuttan sonra INT 1 üretir.'
  },
  'SF': {
    title: 'SF - Sign Flag (İşaret Bayrağı)',
    desc: 'Yapılan işlemin en yüksek biti 1 ise (negatifse) 1, pozitifse 0 olur.'
  },
  'ZF': {
    title: 'ZF - Zero Flag (Sıfır Bayrağı)',
    desc: 'İşlem sonucu 0 olduğunda 1 olur. CMP veya SUB sonrası eşitlik kontrollerinde (JE, JZ) kullanılır.'
  },
  'AF': {
    title: 'AF - Auxiliary Carry Flag (Yardımcı Elde)',
    desc: 'Düşük 4-bitlik parçadan (nibble) 4. bite taşma olduğunda 1 olur. BCD (DAA, AAA vb.) aritmetiğinde kullanılır.'
  },
  'PF': {
    title: 'PF - Parity Flag (Eşlik Bayrağı)',
    desc: 'Sonucun en düşük baytındaki 1 bitlerinin sayısı çift ise 1, tek ise 0 olur.'
  },
  'CF': {
    title: 'CF - Carry Flag (Elde Bayrağı)',
    desc: 'İşaretsiz (unsigned) aritmetikte taşma veya çıkarmada borç oluştuğunda 1 olur.'
  }
};

export class RegisterPanel {
  private container: HTMLElement;
  private currentFormat: NumberFormat = 'hex';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  setFormat(fmt: NumberFormat): void {
    this.currentFormat = fmt;
  }

  getFormat(): NumberFormat {
    return this.currentFormat;
  }

  update(regs: Registers, flags: Flags, changedRegs: string[] = [], _changedFlags: string[] = []): void {
    const format8 = (v: number): string => {
      if (this.currentFormat === 'dec') return v.toString(10);
      if (this.currentFormat === 'bin') return v.toString(2).padStart(8, '0');
      return v.toString(16).toUpperCase().padStart(2, '0');
    };

    const format16 = (v: number): string => {
      if (this.currentFormat === 'dec') return v.toString(10);
      if (this.currentFormat === 'bin') return v.toString(2).padStart(16, '0');
      return v.toString(16).toUpperCase().padStart(4, '0');
    };

    const isChanged = (name: string) => changedRegs.includes(name.toUpperCase());

    const regRow = (label: string, hVal: number, lVal: number, hName: string, lName: string) => {
      const flashH = isChanged(hName) ? 'cell-flash' : '';
      const flashL = isChanged(lName) ? 'cell-flash' : '';
      const info = REG_INFO[label] || { title: label, desc: '' };
      return `
        <div class="table-row-split ${this.currentFormat === 'bin' ? 'bin-font' : ''}">
          <span class="reg-label-cell">
            ${label}
            <span class="info-btn" data-info-title="${info.title}" data-info-desc="${info.desc}" tabindex="-1">i</span>
          </span>
          <span class="${flashH}">${format8(hVal)}</span>
          <span class="${flashL}">${format8(lVal)}</span>
        </div>
      `;
    };

    const singleRow = (label: string, val: number, name: string) => {
      const flash = isChanged(name) ? 'cell-flash' : '';
      const info = REG_INFO[label] || { title: label, desc: '' };
      return `
        <div class="table-row-item ${this.currentFormat === 'bin' ? 'bin-font' : ''}">
          <span class="reg-label-cell">
            ${label}
            <span class="info-btn" data-info-title="${info.title}" data-info-desc="${info.desc}" tabindex="-1">i</span>
          </span>
          <span class="${flash}">${format16(val)}</span>
        </div>
      `;
    };

    const flagCell = (name: string, val: boolean) => {
      const activeClass = val ? 'flag-val-active' : '';
      const info = REG_INFO[name] || { title: name, desc: '' };
      return `
        <div class="flag-item-wrap">
          <div class="flag-col-header">
            <span>${name}</span>
            <span class="info-btn" data-info-title="${info.title}" data-info-desc="${info.desc}" tabindex="-1">i</span>
          </div>
          <div class="flag-col-val ${activeClass}">${val ? '1' : '0'}</div>
        </div>
      `;
    };

    this.container.innerHTML = `
      <div class="cpu-top-block">
        <!-- 3 Columns: Reg | Segments | Pointers -->
        <div class="top-tables-grid">
          <!-- Reg (A, B, C, D with H, L) -->
          <div class="black-card">
            <div class="black-card-header reg-header-split">
              <span class="header-with-info">
                Reg
                <span class="info-btn" data-info-title="Genel Amaçlı Yazmaçlar (16-bit)" data-info-desc="AX, BX, CX, DX genel amaçlı veri yazmaçlarıdır. Her biri 8-bitlik High (H) ve Low (L) parçalara bölünerek de kullanılabilir." tabindex="-1">i</span>
              </span>
              <span>H</span>
              <span>L</span>
            </div>
            <div class="black-card-body">
              ${regRow('A', regs.ah, regs.al, 'AH', 'AL')}
              ${regRow('B', regs.bh, regs.bl, 'BH', 'BL')}
              ${regRow('C', regs.ch, regs.cl, 'CH', 'CL')}
              ${regRow('D', regs.dh, regs.dl, 'DH', 'DL')}
            </div>
          </div>

          <!-- Segments (SS, DS, ES, CS) -->
          <div class="black-card">
            <div class="black-card-header flex-header">
              <span>Segments</span>
              <span class="info-btn" data-info-title="Segment Yazmaçları (16-bit)" data-info-desc="8086'nın 1 MB belleği 64 KB'lık segmentlere ayrılmıştır. Fiziksel Adres = (Segment × 16) + Ofset formülü ile 20-bit adres oluşturulur." tabindex="-1">i</span>
            </div>
            <div class="black-card-body">
              ${singleRow('SS', regs.ss, 'SS')}
              ${singleRow('DS', regs.ds, 'DS')}
              ${singleRow('ES', regs.es, 'ES')}
              ${singleRow('CS', regs.cs, 'CS')}
            </div>
          </div>

          <!-- Pointers (SP, BP, SI, DI, IP) -->
          <div class="black-card">
            <div class="black-card-header flex-header">
              <span>Pointers</span>
              <span class="info-btn" data-info-title="Gösterici ve İndeks Yazmaçları" data-info-desc="Yığın işaretçileri (SP, BP), dizi indeksleri (SI, DI) ve komut işaretçisini (IP) barındırır." tabindex="-1">i</span>
            </div>
            <div class="black-card-body">
              ${singleRow('SP', regs.sp, 'SP')}
              ${singleRow('BP', regs.bp, 'BP')}
              ${singleRow('SI', regs.si, 'SI')}
              ${singleRow('DI', regs.di, 'DI')}
              ${singleRow('IP', regs.ip, 'IP')}
            </div>
          </div>
        </div>

        <!-- Flags Table -->
        <div class="flags-card" style="margin-top: 12px;">
          <div class="black-card-header flex-header">
            <span>Flags:</span>
            <span class="info-btn" data-info-title="Bayraklar Yazmacı (FLAGS Register)" data-info-desc="Son yapılan aritmetik ve mantıksal işlemlerin sonuçlarını (ZF, CF, SF vb.) ve işlemci kontrol modlarını (DF, IF vb.) tutar." tabindex="-1">i</span>
          </div>
          <div class="flags-grid-table">
            ${flagCell('OF', flags.of)}
            ${flagCell('DF', flags.df)}
            ${flagCell('IF', flags.if)}
            ${flagCell('TF', flags.tf)}
            ${flagCell('SF', flags.sf)}
            ${flagCell('ZF', flags.zf)}
            ${flagCell('AF', flags.af)}
            ${flagCell('PF', flags.pf)}
            ${flagCell('CF', flags.cf)}
          </div>
        </div>
      </div>
    `;
  }
}
