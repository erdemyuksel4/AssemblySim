import { Registers } from '../cpu/registers.js';
import { Flags } from '../cpu/flags.js';

export class RegisterPanel {
  private container: HTMLElement;
  private prevRegs: Map<string, number> = new Map();
  private prevFlags: Map<string, boolean> = new Map();
  private displayFormat: 'hex' | 'dec' | 'bin' = 'hex';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  setFormat(format: 'hex' | 'dec' | 'bin'): void {
    this.displayFormat = format;
  }

  update(regs: Registers, flags: Flags, changedRegs: string[] = [], changedFlags: string[] = []): void {
    const format16 = (val: number): string => {
      if (this.displayFormat === 'dec') return val.toString(10);
      if (this.displayFormat === 'bin') return val.toString(2).padStart(16, '0');
      return '0x' + val.toString(16).toUpperCase().padStart(4, '0');
    };

    const format8 = (val: number): string => {
      if (this.displayFormat === 'dec') return val.toString(10);
      if (this.displayFormat === 'bin') return val.toString(2).padStart(8, '0');
      return '0x' + val.toString(16).toUpperCase().padStart(2, '0');
    };

    const isRegChanged = (name: string) => changedRegs.includes(name.toUpperCase());
    const isFlagChanged = (name: string) => changedFlags.includes(name.toUpperCase());

    const genRegRow = (name: string, val: number, subL?: { name: string; val: number }, subH?: { name: string; val: number }) => {
      const changedClass = isRegChanged(name) ? 'reg-flash' : '';
      const changedL = subL && isRegChanged(subL.name) ? 'reg-flash' : '';
      const changedH = subH && isRegChanged(subH.name) ? 'reg-flash' : '';

      if (subL && subH) {
        return `
          <div class="reg-card ${changedClass}">
            <div class="reg-card-header">
              <span class="reg-name">${name}</span>
              <span class="reg-val-16">${format16(val)}</span>
            </div>
            <div class="reg-sub-split">
              <div class="reg-sub-cell ${changedH}">
                <span class="sub-name">${subH.name}:</span>
                <span class="sub-val">${format8(subH.val)}</span>
              </div>
              <div class="reg-sub-cell ${changedL}">
                <span class="sub-name">${subL.name}:</span>
                <span class="sub-val">${format8(subL.val)}</span>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="reg-card ${changedClass}">
          <div class="reg-card-header">
            <span class="reg-name">${name}</span>
            <span class="reg-val-16">${format16(val)}</span>
          </div>
        </div>
      `;
    };

    const genFlagBadge = (name: string, active: boolean, title: string) => {
      const changedClass = isFlagChanged(name) ? 'flag-flash' : '';
      const activeClass = active ? 'flag-active' : 'flag-inactive';
      return `
        <div class="flag-badge ${activeClass} ${changedClass}" title="${name}: ${title} (${active ? '1' : '0'})">
          <span class="flag-name">${name}</span>
          <span class="flag-val">${active ? '1' : '0'}</span>
        </div>
      `;
    };

    this.container.innerHTML = `
      <div class="registers-container">
        <!-- Flags Section -->
        <div class="panel-sub-header">
          <span>FLAGS (DURUM BAYRAKLARI)</span>
        </div>
        <div class="flags-grid">
          ${genFlagBadge('CF', flags.cf, 'Carry Flag (Elde)')}
          ${genFlagBadge('PF', flags.pf, 'Parity Flag (Çiftlik)')}
          ${genFlagBadge('AF', flags.af, 'Auxiliary Carry Flag (Yardımcı Elde)')}
          ${genFlagBadge('ZF', flags.zf, 'Zero Flag (Sıfır)')}
          ${genFlagBadge('SF', flags.sf, 'Sign Flag (İşaret / Negatif)')}
          ${genFlagBadge('TF', flags.tf, 'Trap Flag (Tek Adım)')}
          ${genFlagBadge('IF', flags.if, 'Interrupt Flag (Kesme Açık)')}
          ${genFlagBadge('DF', flags.df, 'Direction Flag (Yön: 0=İleri, 1=Geri)')}
          ${genFlagBadge('OF', flags.of, 'Overflow Flag (İşaretli Taşma)')}
        </div>

        <!-- General Purpose Registers (AX..DX with AH/AL) -->
        <div class="panel-sub-header">
          <span>GENEL YAZMAÇLAR (16-bit & 8-bit)</span>
        </div>
        <div class="reg-grid-2col">
          ${genRegRow('AX', regs.ax, { name: 'AL', val: regs.al }, { name: 'AH', val: regs.ah })}
          ${genRegRow('BX', regs.bx, { name: 'BL', val: regs.bl }, { name: 'BH', val: regs.bh })}
          ${genRegRow('CX', regs.cx, { name: 'CL', val: regs.cl }, { name: 'CH', val: regs.ch })}
          ${genRegRow('DX', regs.dx, { name: 'DL', val: regs.dl }, { name: 'DH', val: regs.dh })}
        </div>

        <!-- Pointers and Index Registers -->
        <div class="panel-sub-header">
          <span>İŞARETÇİ VE İNDEKS YAZMAÇLARI</span>
        </div>
        <div class="reg-grid-3col">
          ${genRegRow('SI', regs.si)}
          ${genRegRow('DI', regs.di)}
          ${genRegRow('BP', regs.bp)}
          ${genRegRow('SP', regs.sp)}
          ${genRegRow('IP', regs.ip)}
        </div>

        <!-- Segment Registers -->
        <div class="panel-sub-header">
          <span>SEGMENT YAZMAÇLARI</span>
        </div>
        <div class="reg-grid-4col">
          ${genRegRow('CS', regs.cs)}
          ${genRegRow('DS', regs.ds)}
          ${genRegRow('ES', regs.es)}
          ${genRegRow('SS', regs.ss)}
        </div>
      </div>
    `;
  }
}
