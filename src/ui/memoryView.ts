import { Memory } from '../cpu/memory.js';
import { Registers } from '../cpu/registers.js';

export class MemoryView {
  private container: HTMLElement;
  private currentBasePhys: number = 0x07100; // Default CS:0100 = 0x7000 + 0x100 = 0x7100
  private rowCount: number = 16; // 16 rows * 16 bytes = 256 bytes visible at a time

  constructor(container: HTMLElement) {
    this.container = container;
  }

  jumpTo(seg: number, off: number): void {
    const phys = (((seg & 0xFFFF) << 4) + (off & 0xFFFF)) & 0xFFFFF;
    this.jumpToPhys(phys);
  }

  jumpToPhys(phys: number): void {
    // Align to 16 bytes
    this.currentBasePhys = Math.max(0, (phys & 0xFFFFF) & ~0x0F);
  }

  render(mem: Memory, regs: Registers): void {
    // Physical pointers for badges
    const ipPhys = mem.toPhys(regs.cs, regs.ip);
    const siPhys = mem.toPhys(regs.ds, regs.si);
    const diPhys = mem.toPhys(regs.es, regs.di);
    const bxPhys = mem.toPhys(regs.ds, regs.bx);
    const bpPhys = mem.toPhys(regs.ss, regs.bp);
    const spPhys = mem.toPhys(regs.ss, regs.sp);

    // Format current address header
    const curSeg = (this.currentBasePhys >> 4) & 0xFFFF;
    const curOff = this.currentBasePhys & 0x000F;

    let rowsHtml = '';
    for (let r = 0; r < this.rowCount; r++) {
      const rowPhys = (this.currentBasePhys + r * 16) & 0xFFFFF;
      const addrHex = rowPhys.toString(16).toUpperCase().padStart(5, '0');

      let hexCells = '';
      let asciiCells = '';

      for (let c = 0; c < 16; c++) {
        const cellPhys = (rowPhys + c) & 0xFFFFF;
        const val = mem.data[cellPhys];
        const hexVal = val.toString(16).toUpperCase().padStart(2, '0');

        // Character for ascii
        const char = (val >= 32 && val <= 126) ? String.fromCharCode(val) : '.';

        // Badges and styles
        const badges: string[] = [];
        let cellClasses = 'mem-cell';

        // High priority: IP, pointers, access
        if (cellPhys === ipPhys) {
          cellClasses += ' mem-ip';
          badges.push('IP');
        }
        if (cellPhys === siPhys) {
          badges.push('SI');
        }
        if (cellPhys === diPhys) {
          badges.push('DI');
        }
        if (cellPhys === bxPhys) {
          badges.push('BX');
        }
        if (cellPhys === bpPhys) {
          badges.push('BP');
        }
        if (cellPhys === spPhys) {
          badges.push('SP');
        }

        // Access logs
        if (mem.lastWrites.has(cellPhys)) {
          cellClasses += ' mem-written';
        } else if (mem.lastReads.has(cellPhys)) {
          cellClasses += ' mem-read';
        } else {
          // Check static code / data type
          const cellType = mem.getCellType(cellPhys);
          if (cellType === 'code') cellClasses += ' mem-code';
          else if (cellType === 'data') cellClasses += ' mem-data';
        }

        const badgeHtml = badges.length > 0
          ? `<span class="mem-badge-pointer" title="${badges.join(', ')}">${badges.join('/')}</span>`
          : '';

        hexCells += `
          <div class="${cellClasses}" data-phys="${cellPhys}">
            ${hexVal}
            ${badgeHtml}
          </div>
        `;

        asciiCells += `<span class="mem-ascii-char">${this.escapeHtml(char)}</span>`;
      }

      rowsHtml += `
        <div class="mem-grid-row">
          <div class="mem-row-addr">${addrHex}</div>
          <div class="mem-hex-cols">${hexCells}</div>
          <div class="mem-ascii-cols">${asciiCells}</div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="mem-view-wrapper">
        <!-- Toolbar & Quick Jumps -->
        <div class="mem-controls">
          <div class="mem-search-bar">
            <span class="mem-label">Adres:</span>
            <input type="text" id="mem-addr-input" class="mem-addr-input" placeholder="0700:0100 veya 7100" value="${this.currentBasePhys.toString(16).toUpperCase()}" />
            <button id="mem-btn-go" class="btn-mem-tool">Git</button>
          </div>
          <div class="mem-page-buttons">
            <button id="mem-btn-prev" class="btn-mem-page" title="Önceki Sayfa">▲</button>
            <button id="mem-btn-next" class="btn-mem-page" title="Sonraki Sayfa">▼</button>
          </div>
        </div>

        <div class="mem-quick-jumps">
          <button class="btn-quick-jump" data-target="CS:IP">CS:IP</button>
          <button class="btn-quick-jump" data-target="CS:0100">CS:0100</button>
          <button class="btn-quick-jump" data-target="DS:SI">DS:SI</button>
          <button class="btn-quick-jump" data-target="ES:DI">ES:DI</button>
          <button class="btn-quick-jump" data-target="DS:BX">DS:BX</button>
          <button class="btn-quick-jump" data-target="SS:SP">SS:SP</button>
        </div>

        <!-- Legend / Color Code Guide -->
        <div class="mem-legend">
          <span class="legend-item"><span class="legend-box box-code"></span> Kod</span>
          <span class="legend-item"><span class="legend-box box-data"></span> Veri</span>
          <span class="legend-item"><span class="legend-box box-written"></span> Yazılan</span>
          <span class="legend-item"><span class="legend-box box-read"></span> Okunan</span>
          <span class="legend-item"><span class="legend-box box-ip"></span> IP</span>
        </div>

        <!-- Hex Grid Header -->
        <div class="mem-grid-header">
          <div class="mem-row-addr">ADDR</div>
          <div class="mem-hex-cols">
            ${Array.from({ length: 16 }, (_, i) => `<span>${i.toString(16).toUpperCase().padStart(2, '0')}</span>`).join('')}
          </div>
          <div class="mem-ascii-cols">ASCII</div>
        </div>

        <!-- Hex Grid Body -->
        <div class="mem-grid-body">
          ${rowsHtml}
        </div>
      </div>
    `;

    this.attachEventListeners(mem, regs);
  }

  private attachEventListeners(mem: Memory, regs: Registers): void {
    const input = this.container.querySelector('#mem-addr-input') as HTMLInputElement;
    const btnGo = this.container.querySelector('#mem-btn-go') as HTMLButtonElement;
    const btnPrev = this.container.querySelector('#mem-btn-prev') as HTMLButtonElement;
    const btnNext = this.container.querySelector('#mem-btn-next') as HTMLButtonElement;

    const navigate = () => {
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

    btnGo?.addEventListener('click', navigate);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigate();
    });

    btnPrev?.addEventListener('click', () => {
      this.currentBasePhys = Math.max(0, this.currentBasePhys - 256);
      this.render(mem, regs);
    });

    btnNext?.addEventListener('click', () => {
      this.currentBasePhys = Math.min(0xFFFFF - 256, this.currentBasePhys + 256);
      this.render(mem, regs);
    });

    // Quick jump buttons
    this.container.querySelectorAll('.btn-quick-jump').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switch (target) {
          case 'CS:IP': this.jumpTo(regs.cs, regs.ip); break;
          case 'CS:0100': this.jumpTo(regs.cs, 0x0100); break;
          case 'DS:SI': this.jumpTo(regs.ds, regs.si); break;
          case 'ES:DI': this.jumpTo(regs.es, regs.di); break;
          case 'DS:BX': this.jumpTo(regs.ds, regs.bx); break;
          case 'SS:SP': this.jumpTo(regs.ss, regs.sp); break;
        }
        this.render(mem, regs);
      });
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
