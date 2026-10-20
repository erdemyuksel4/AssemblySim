export class TooltipManager {
  private static tooltipEl: HTMLElement | null = null;
  private static activeTarget: HTMLElement | null = null;

  static init(): void {
    if (this.tooltipEl) return;

    const el = document.createElement('div');
    el.className = 'global-info-tooltip';
    el.innerHTML = `
      <div class="tooltip-title"></div>
      <div class="tooltip-desc"></div>
      <div class="tooltip-arrow"></div>
    `;
    document.body.appendChild(el);
    this.tooltipEl = el;

    document.addEventListener('mouseover', (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.info-btn') as HTMLElement;
      if (target) {
        this.show(target);
      }
    });

    document.addEventListener('mouseout', (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.info-btn') as HTMLElement;
      if (target && target === this.activeTarget) {
        this.hide();
      }
    });

    // Clicking does nothing at all, only hover works
    document.addEventListener('click', (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.info-btn');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  private static show(target: HTMLElement): void {
    if (!this.tooltipEl) return;

    const title = target.getAttribute('data-info-title') || '';
    const desc = target.getAttribute('data-info-desc') || '';
    if (!title && !desc) return;

    this.activeTarget = target;
    const titleEl = this.tooltipEl.querySelector('.tooltip-title') as HTMLElement;
    const descEl = this.tooltipEl.querySelector('.tooltip-desc') as HTMLElement;
    const arrowEl = this.tooltipEl.querySelector('.tooltip-arrow') as HTMLElement;

    titleEl.textContent = title;
    titleEl.style.display = title ? 'block' : 'none';
    descEl.textContent = desc;

    this.tooltipEl.classList.add('visible');

    // Layout calculation
    const rect = target.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    let top = rect.top - tooltipRect.height - 8;
    let arrowOnTop = false;

    // Flip below if not enough room on top
    if (top < 10) {
      top = rect.bottom + 8;
      arrowOnTop = true;
    }

    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    // Boundary clamp
    const padding = 10;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;

    // Arrow positioning relative to info button
    const arrowX = rect.left + rect.width / 2 - left;
    arrowEl.style.left = `${arrowX}px`;

    if (arrowOnTop) {
      this.tooltipEl.classList.add('arrow-top');
    } else {
      this.tooltipEl.classList.remove('arrow-top');
    }
  }

  private static hide(): void {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.remove('visible');
    this.activeTarget = null;
  }
}
