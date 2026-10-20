import { Memory } from '../cpu/memory.js';
import { Registers } from '../cpu/registers.js';

export class MemoryView {
  private container: HTMLElement;
  private currentBasePhys: number = 0x00000;
  private rowCount: number = 8; // 8 rows * 16 bytes = 128 bytes visible at a time

  constructor(container: HTMLElement) {
    this.container = container;
  }

  jumpTo(seg: number, off: number): void {
    const phys = (((seg & 0xFFFF) << 4) + (off & 0xFFFF)) & 0xFFFFF;
    this.jumpToPhys(phys);
  }

  jumpToPhys(phys: number): void {
    this.currentBasePhys = Math.max(0, (phys & 0xFFFFF) & ~0x0F);
  }

  render(mem: Memory, regs: Registers): void {
    const ipPhys = mem.toPhys(regs.cs, regs.ip);

    let rowsHtml = '';
    for (let r = 0; r < this.rowCount; r++) {
      const rowPhys = (this.currentBasePhys + r * 16) & 0xFFFFF;
      let cellsHtml = '';

      for (let c = 0; c < 16; c++) {
        const cellPhys = (rowPhys + c) & 0xFFFFF;
        const val = mem.data[cellPhys];
        const hexVal = val.toString(16).toUpperCase().padStart(2, '0');

        let cellClass = 'mem-byte-cell';
        if (cellPhys === ipPhys) {
          cellClass += ' is-ip';
        } else if (mem.lastWrites.has(cellPhys)) {
          cellClass += ' is-written';
        } else {
          const type = mem.getCellType(cellPhys);
          if (type === 'code') cellClass += ' is-code';
          else if (type === 'data') cellClass += ' is-data';
        }

        cellsHtml += `<span class="${cellClass}" title="0x${cellPhys.toString(16).toUpperCase()}">${hexVal}</span>`;
      }

      rowsHtml += `<div class="mem-row">${cellsHtml}</div>`;
    }

    const addrHex = this.currentBasePhys.toString(16).toUpperCase().padStart(5, '0');

    this.container.innerHTML = `
      <div class="memory-card">
        <div class="memory-header-row">
          <div class="memory-title">
            <span>Memory</span>
            <span class="info-btn" data-info-title="1 MB Gerçek Mod Belleği" data-info-desc="00000h - FFFFFh arası 20-bitlik fiziksel bellek alanını görüntüler. Yeşil: Kod bölgesi, Mavi: Veri bölgesi, Turuncu: CS:IP, Kırmızı: Son yazılan adres." tabindex="-1">i</span>
          </div>
          <div class="memory-address-control">
            <div class="start-addr-col">
              <span class="start-addr-label">
                Start Address
                <span class="info-btn" data-info-title="Bellek Başlangıç Adresi" data-info-desc="Görüntülenecek 20-bitlik fiziksel başlangıç adresini (00000h - FFFFFh) belirler. Değeri yazıp SET butonuna basarak atlayabilirsiniz." tabindex="-1">i</span>
              </span>
              <input type="text" id="mem-start-addr-input" class="start-addr-input" value="${addrHex}" />
            </div>
            <button id="btn-mem-set" class="btn-set">SET</button>
          </div>
        </div>

        <div class="memory-grid-box">
          ${rowsHtml}
        </div>
      </div>
    `;

    this.attachEvents(mem, regs);
  }

  private attachEvents(mem: Memory, regs: Registers): void {
    const input = this.container.querySelector('#mem-start-addr-input') as HTMLInputElement;
    const btnSet = this.container.querySelector('#btn-mem-set') as HTMLButtonElement;

    const applyAddr = () => {
      const val = input.value.trim().toUpperCase();
      let targetPhys = 0;
      if (val.includes(':')) {
        const parts = val.split(':');
        const seg = parseInt(parts[0], 16) || 0;
        const off = parseInt(parts[1], 16) || 0;
        targetPhys = mem.toPhys(seg, off);
      } else {
        targetPhys = parseInt(val, 16) || 0;
      }
      this.jumpToPhys(targetPhys);
      this.render(mem, regs);
    };

    btnSet?.addEventListener('click', applyAddr);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyAddr();
    });
  }
}
