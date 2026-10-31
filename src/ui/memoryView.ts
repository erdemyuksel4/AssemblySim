import { Memory } from '../cpu/memory.js';
import { Registers } from '../cpu/registers.js';

export function getMemoryRegionLabel(phys: number): string {
  if (phys < 0 || phys >= 0x100000) return '1 MB Sınırı Dışında (Bellek Yok)';
  const p = phys & 0xFFFFF;
  if (p < 0x00400) return 'IVT (Kesme Vektör Tablosu - 0x00000)';
  if (p < 0x00500) return 'BDA (BIOS Veri Alanı - 0x00400)';
  if (p >= 0x00500 && p < 0xA0000) return '640 KB Kişisel Alan (Konvansiyonel RAM - 0x00500 - 0x9FFFF)';
  if (p >= 0xA0000 && p < 0xB8000) return 'EGA/VGA Grafik Video Belleği';
  if (p >= 0xB8000 && p < 0xC0000) return 'VRAM (80x25 Renkli Metin CRT Modu)';
  if (p >= 0xC0000 && p < 0xF0000) return 'Video BIOS & Kart Genişleme ROM';
  if (p >= 0xF0000 && p < 0xFFFF0) return 'ROM BIOS (Anakart Salt Okunur Belleği)';
  if (p >= 0xFFFF0) return 'CPU Power-On Reset Vektörü (0xFFFF0)';
  return '640 KB Kişisel Alan (RAM)';
}

export class MemoryView {
  private container: HTMLElement;
  private currentBasePhys: number = 0x00500;
  private defaultOriginPhys: number = 0x00500;
  private userPinned: boolean = false;
  private rowCount: number = 8; // 8 rows * 16 bytes = 128 bytes visible at a time
  private onManualAddressChange?: (phys: number) => void;

  constructor(container: HTMLElement, onManualAddressChange?: (phys: number) => void) {
    this.container = container;
    this.onManualAddressChange = onManualAddressChange;
  }

  jumpTo(seg: number, off: number): void {
    const phys = (((seg & 0xFFFF) << 4) + (off & 0xFFFF)) & 0xFFFFF;
    this.jumpToPhys(phys);
  }

  jumpToPhys(phys: number): void {
    // 1 MB sınırını doğrudan koru, wrap-around yapma
    this.currentBasePhys = Math.max(0, phys & ~0x0F);
  }

  syncOrigin(originPhys: number): void {
    const alignedOrigin = Math.max(0, originPhys & ~0x0F);
    if (!this.userPinned || alignedOrigin !== this.defaultOriginPhys) {
      this.defaultOriginPhys = alignedOrigin;
      this.userPinned = false;
      this.currentBasePhys = alignedOrigin;
    }
  }

  restoreViewState(originPhys: number, customPhys?: number, userPinned: boolean = false): void {
    const alignedOrigin = Math.max(0, originPhys & ~0x0F);
    this.defaultOriginPhys = alignedOrigin;
    this.userPinned = userPinned;
    if (userPinned && customPhys !== undefined) {
      this.currentBasePhys = Math.max(0, customPhys & ~0x0F);
    } else {
      this.currentBasePhys = alignedOrigin;
    }
  }

  getBasePhys(): number {
    return this.currentBasePhys;
  }

  isUserPinned(): boolean {
    return this.userPinned;
  }

  render(mem: Memory, regs: Registers): void {
    const ipPhys = mem.toPhys(regs.cs, regs.ip);
    const regionName = getMemoryRegionLabel(this.currentBasePhys);

    let rowsHtml = '';
    for (let r = 0; r < this.rowCount; r++) {
      const rowPhys = this.currentBasePhys + r * 16;
      const rowHex = rowPhys.toString(16).toUpperCase().padStart(5, '0');
      let cellsHtml = '';
      let asciiHtml = '';

      for (let c = 0; c < 16; c++) {
        const cellPhys = rowPhys + c;

        // 1 MB RAM İÇERİSİNDE DEĞİLSE VERİ GÖSTERME
        if (cellPhys < 0 || cellPhys >= 0x100000) {
          cellsHtml += `<span class="mem-byte-cell is-empty" title="0x${cellPhys.toString(16).toUpperCase()} (1 MB RAM Dışı - Veri Yok)" style="color: var(--text-muted); opacity: 0.35;">--</span>`;
          asciiHtml += '.';
          continue;
        }

        const val = mem.data[cellPhys];
        const hexVal = val.toString(16).toUpperCase().padStart(2, '0');
        const charStr = (val >= 32 && val <= 126) ? String.fromCharCode(val) : '.';

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

        const safeChar = charStr === '<' ? '&lt;' : charStr === '>' ? '&gt;' : charStr === '&' ? '&amp;' : charStr;
        cellsHtml += `<span class="${cellClass}" title="0x${cellPhys.toString(16).toUpperCase()} = 0x${hexVal} ('${safeChar}')">${hexVal}</span>`;
        asciiHtml += safeChar;
      }

      rowsHtml += `
        <div class="mem-row-wrapper">
          <span class="mem-row-addr">${rowHex}:</span>
          <div class="mem-row">${cellsHtml}</div>
          <span class="mem-row-ascii">${asciiHtml}</span>
        </div>
      `;
    }

    const addrHex = this.currentBasePhys.toString(16).toUpperCase().padStart(5, '0');

    this.container.innerHTML = `
      <div class="memory-card">
        <div class="memory-header-row">
          <div class="memory-title">
            <span>Memory (1 MB)</span>
            <span class="info-btn" data-info-title="1 MB Gerçek Mod Belleği" data-info-desc="00000h - FFFFFh arası 20-bitlik fiziksel bellek alanını görüntüler. 1 MB sınırının ötesinde bellek bulunmaz. Yeşil: Kod bölgesi, Mavi: Veri bölgesi, Turuncu: CS:IP, Kırmızı: Son yazılan adres." tabindex="-1">i</span>
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

        <!-- Hızlı Konum Atlama Butonları -->
        <div class="memory-quick-jumps">
          <button class="mem-jump-btn ${this.currentBasePhys === 0x00000 ? 'active' : ''}" data-addr="00000" title="Kesme Vektör Tablosu (0x00000)">IVT</button>
          <button class="mem-jump-btn ${this.currentBasePhys === 0x00400 ? 'active' : ''}" data-addr="00400" title="BIOS Veri Alanı (0x00400)">BDA</button>
          <button class="mem-jump-btn ${this.currentBasePhys >= 0x00500 && this.currentBasePhys < 0xA0000 ? 'active' : ''}" data-addr="00500" title="640 KB Kişisel Alan / Kullanıcı RAM (0x00500 - 0x9FFFF)">640 KB RAM</button>
          <button class="mem-jump-btn ${this.currentBasePhys === 0xB8000 ? 'active' : ''}" data-addr="B8000" title="CGA/VGA Renkli Metin Belleği (0xB8000)">VRAM</button>
          <button class="mem-jump-btn ${this.currentBasePhys === 0xF0000 ? 'active' : ''}" data-addr="F0000" title="ROM BIOS Alanı (0xF0000)">ROM BIOS</button>
          <button class="mem-jump-btn ${this.currentBasePhys === 0xFFFF0 ? 'active' : ''}" data-addr="FFFF0" title="CPU Power-On Reset Vektörü (0xFFFF0)">Reset</button>
        </div>

        <!-- Bölge Bilgi Rozeti -->
        <div class="memory-region-badge">
          <span class="region-pin">📍 Bölge:</span> <span class="region-name">${regionName}</span>
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

    const applyAddr = (rawVal?: string) => {
      const val = (rawVal !== undefined ? rawVal : input.value).trim().toUpperCase().replace(/H$/, '');
      let targetPhys = 0;
      if (val.includes(':')) {
        const parts = val.split(':');
        const seg = parseInt(parts[0].replace(/H$/, ''), 16) || 0;
        const off = parseInt(parts[1].replace(/H$/, ''), 16) || 0;
        targetPhys = mem.toPhys(seg, off);
      } else {
        targetPhys = parseInt(val, 16) || 0;
      }
      this.userPinned = true;
      this.jumpToPhys(targetPhys);
      this.onManualAddressChange?.(this.currentBasePhys);
      this.render(mem, regs);
    };

    btnSet?.addEventListener('click', () => applyAddr());
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyAddr();
    });

    // Quick jump click handlers
    if (typeof this.container.querySelectorAll === 'function') {
      const jumpBtns = this.container.querySelectorAll<HTMLButtonElement>('.mem-jump-btn');
      jumpBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const addrStr = btn.getAttribute('data-addr');
          if (addrStr) {
            applyAddr(addrStr);
          }
        });
      });
    }
  }
}
