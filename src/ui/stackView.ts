import { Memory } from '../cpu/memory.js';
import { Registers } from '../cpu/registers.js';

export class StackView {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(mem: Memory, regs: Registers): void {
    const ss = regs.ss;
    const sp = regs.sp;

    // We will show a window of word slots around SP (e.g. from SP - 8 up to SP + 16, capped at 0xFFFE)
    const items: { offset: number; val: number; isTop: boolean }[] = [];
    const startOff = Math.max(0, (sp - 8) & ~1);
    const endOff = Math.min(0xFFFE, (sp + 16) & ~1);

    for (let off = startOff; off <= endOff; off += 2) {
      const val = mem.readWord(ss, off, false); // don't track as read in UI inspect
      items.push({
        offset: off,
        val,
        isTop: off === sp
      });
    }

    let rowsHtml = '';
    for (const item of items) {
      const addrHex = `${ss.toString(16).toUpperCase().padStart(4, '0')}:${item.offset.toString(16).toUpperCase().padStart(4, '0')}`;
      const valHex = '0x' + item.val.toString(16).toUpperCase().padStart(4, '0');
      const valDec = item.val.toString(10);
      const isTopClass = item.isTop ? 'stack-top-row' : '';

      rowsHtml += `
        <tr class="stack-row ${isTopClass}">
          <td class="col-sp-indicator">${item.isTop ? '◀ SP' : ''}</td>
          <td class="col-addr font-mono">${addrHex}</td>
          <td class="col-val font-mono">${valHex}</td>
          <td class="col-dec font-mono">${valDec}</td>
        </tr>
      `;
    }

    this.container.innerHTML = `
      <div class="stack-view-wrapper">
        <div class="stack-info-bar">
          <span>Yığın Segmenti (SS): <strong>${ss.toString(16).toUpperCase().padStart(4, '0')}h</strong></span>
          <span>Yığın İşaretçisi (SP): <strong>${sp.toString(16).toUpperCase().padStart(4, '0')}h</strong></span>
        </div>
        <table class="stack-table">
          <thead>
            <tr>
              <th style="width: 50px;">İşaret</th>
              <th>Adres (SS:SP)</th>
              <th>Word Değeri (Hex)</th>
              <th>Ondalık</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }
}
