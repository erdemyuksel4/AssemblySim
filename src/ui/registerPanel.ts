import { Registers } from '../cpu/registers.js';
import { Flags } from '../cpu/flags.js';

export type NumberFormat = 'hex' | 'dec' | 'bin';

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
      return `
        <div class="table-row-split ${this.currentFormat === 'bin' ? 'bin-font' : ''}">
          <span>${label}</span>
          <span class="${flashH}">${format8(hVal)}</span>
          <span class="${flashL}">${format8(lVal)}</span>
        </div>
      `;
    };

    const singleRow = (label: string, val: number, name: string) => {
      const flash = isChanged(name) ? 'cell-flash' : '';
      return `
        <div class="table-row-item ${this.currentFormat === 'bin' ? 'bin-font' : ''}">
          <span>${label}</span>
          <span class="${flash}">${format16(val)}</span>
        </div>
      `;
    };

    const flagCell = (name: string, val: boolean) => {
      const activeClass = val ? 'flag-val-active' : '';
      return `
        <div>
          <div class="flag-col-header">${name}</div>
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
              <span>Reg</span>
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
            <div class="black-card-header">
              <span>Segments</span>
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
            <div class="black-card-header">
              <span>Pointers</span>
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
          <div class="black-card-header">
            <span>Flags:</span>
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
