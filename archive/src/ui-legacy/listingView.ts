import { ListingItem } from '../assembler/assembler.js';

export class ListingView {
  private container: HTMLElement;
  private onJumpToMemory?: (addr: number) => void;

  constructor(container: HTMLElement, onJumpToMemory?: (addr: number) => void) {
    this.container = container;
    this.onJumpToMemory = onJumpToMemory;
  }

  render(listing: ListingItem[], currentIp: number = 0x0100): void {
    if (listing.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">Henüz derlenmiş kod listing'i bulunmuyor. Programı derlemek için 'Assemble' butonuna basın.</div>
      `;
      return;
    }

    let rowsHtml = '';
    for (const item of listing) {
      const addrHex = item.addr.toString(16).toUpperCase().padStart(4, '0') + 'h';
      const bytesHex = item.bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      const isCurrent = item.addr === currentIp;

      const activeClass = isCurrent ? 'listing-row-active' : '';

      rowsHtml += `
        <tr class="listing-row ${activeClass}" data-addr="${item.addr}">
          <td class="col-active">${isCurrent ? '▶' : ''}</td>
          <td class="col-addr font-mono">${addrHex}</td>
          <td class="col-bytes font-mono">${bytesHex}</td>
          <td class="col-line font-mono">Satır ${item.line}</td>
        </tr>
      `;
    }

    this.container.innerHTML = `
      <div class="listing-table-container">
        <table class="listing-table">
          <thead>
            <tr>
              <th style="width: 20px;"></th>
              <th>Adres</th>
              <th>Makine Kodu (Byte'lar)</th>
              <th>Kaynak</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    this.container.querySelectorAll('.listing-row').forEach((row) => {
      row.addEventListener('click', () => {
        const addr = parseInt(row.getAttribute('data-addr') || '0', 10);
        this.onJumpToMemory?.(addr);
      });
    });
  }
}
