import { build8086KnowledgeGraph, KnowledgeNode, GroupingMode, GRAPH_COLORS } from './knowledgeData.js';
import { GraphPhysics } from './graphPhysics.js';
import { GraphRenderer } from './graphRenderer.js';

export interface GraphViewCallbacks {
  onReturnToEditor: () => void;
  onInsertCodeToEditor?: (code: string) => void;
  onOpenInManual?: (opcode: string) => void;
}

export class GraphView {
  private container: HTMLElement;
  private callbacks: GraphViewCallbacks;

  private canvas!: HTMLCanvasElement;
  private physics!: GraphPhysics;
  private renderer!: GraphRenderer;

  private draggedNode: KnowledgeNode | null = null;
  private isPanning: boolean = false;
  private lastMousePos = { x: 0, y: 0 };
  private mouseVelocity = { vx: 0, vy: 0 };
  private dragStartPos = { x: 0, y: 0 };
  private isActualDrag: boolean = false;

  private activeGroupingMode: GroupingMode = 'subclusters';
  private detailPanelEl!: HTMLElement;
  private searchInputEl!: HTMLInputElement;

  constructor(container: HTMLElement, callbacks: GraphViewCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init(): void {
    const { nodes, edges } = build8086KnowledgeGraph();
    this.physics = new GraphPhysics(nodes, edges, this.activeGroupingMode);

    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();

    this.renderer.startAnimation();
  }

  public onShow(): void {
    requestAnimationFrame(() => {
      if (this.renderer) {
        this.renderer.resize();
        this.renderer.centerViewport();
        this.physics.wakeUp(1.0);
        this.renderer.render();
      }
    });
  }

  private renderDOM(): void {
    this.container.innerHTML = `
      <div class="graph-root-container">
        <!-- Top Navigation & Controls Toolbar -->
        <header class="graph-toolbar">
          <div class="graph-toolbar-left">
            <button class="btn-graph-back" id="btn-graph-back" title="Editöre Dön (Esc)">
              <span class="btn-arrow">←</span> Editöre Dön
            </button>
            <div class="graph-brand">
              <span class="graph-brand-icon">🧠</span>
              <span class="graph-brand-title">8086 Sinir Ağı & Bilgi Haritası</span>
              <span class="graph-node-count-badge" id="graph-node-count">${this.physics.nodes.length} Düğüm</span>
            </div>
          </div>

          <!-- Middle Filter & Grouping Controls -->
          <div class="graph-toolbar-center">
            <!-- Search Input -->
            <div class="graph-search-wrap">
              <span class="graph-search-icon">🔍</span>
              <input type="text" id="graph-search-input" class="graph-search-input" placeholder="Komut ara (örn: MOV, flag, stack)..." />
              <button id="graph-search-clear" class="graph-search-clear" style="display:none;" title="Temizle">✕</button>
            </div>

            <!-- Grouping Mode Selector -->
            <div class="graph-group-selector-wrap">
              <label for="graph-group-mode" class="graph-group-label">Gruplama:</label>
              <select id="graph-group-mode" class="graph-group-select" title="Farklı özelliklere göre kümeleme">
                <option value="subclusters" selected>🔍 Alt Kümeler & Ortak Özellikler (Önerilen)</option>
                <option value="flags">🚩 Bayrak Etkisine Göre (Ana Gruplar)</option>
                <option value="mechanism">⚙️ İşlem & Operand Tipine Göre</option>
                <option value="category">📖 Manuel Kategorisine Göre</option>
                <option value="hardware">💻 8086 Donanım Katmanına Göre</option>
              </select>
            </div>
          </div>

          <!-- Right Quick Filter Buttons & View Controls -->
          <div class="graph-toolbar-right">
            <div class="graph-quick-pills">
              <button class="graph-pill-btn active" data-pill="all">Tümü</button>
              <button class="graph-pill-btn" data-pill="flag-none" title="Hiçbir bayrağı etkilemeyen komutlar">🚫 No Flags</button>
              <button class="graph-pill-btn" data-pill="flag-all" title="Tüm aritmetik bayrakları değiştirenler">⚡ Aritmetik</button>
              <button class="graph-pill-btn" data-pill="stack" title="Yığın komutları">📚 Yığın</button>
              <button class="graph-pill-btn" data-pill="jump" title="Dallanma komutları">🔀 Atlama</button>
            </div>

            <button class="btn-graph-action" id="btn-graph-recenter" title="Haritayı Ortala">⟲ Ortala</button>
          </div>
        </header>

        <!-- Main Body: Canvas + Inspector Drawer -->
        <div class="graph-main-viewport">
          <canvas id="graph-canvas" class="graph-canvas"></canvas>

          <!-- Right Inspector Card (Obsidian Detail Panel) -->
          <aside class="graph-inspector-drawer" id="graph-inspector" style="display: none;">
            <div class="inspector-header">
              <div class="inspector-title-wrap">
                <h3 class="inspector-title" id="insp-title">MOV</h3>
                <span class="inspector-kind-badge" id="insp-kind">Komut</span>
              </div>
              <button class="btn-close-inspector" id="btn-close-insp" title="Kapat">✕</button>
            </div>

            <div class="inspector-content">
              <!-- Flag Impact Badge Box -->
              <div class="insp-flag-impact-box" id="insp-flag-box">
                <div class="insp-flag-label">🚩 Bayrak Etkisi:</div>
                <div class="insp-flag-value" id="insp-flag-val">Hiçbir bayrağı etkilemez.</div>
              </div>

              <!-- Summary & Description -->
              <div class="insp-section">
                <div class="insp-section-label">Açıklama:</div>
                <p class="insp-text" id="insp-desc"></p>
              </div>

              <!-- Hardware Rule Note if present -->
              <div class="insp-rules-box" id="insp-rules-box" style="display: none;">
                <span class="insp-rules-icon">⚠️</span>
                <div class="insp-rules-text" id="insp-rules-text"></div>
              </div>

              <!-- Sample Code Box -->
              <div class="insp-section" id="insp-sample-section">
                <div class="insp-section-header">
                  <span class="insp-section-label">Örnek Kullanım:</span>
                  <div class="insp-code-actions">
                    <button class="btn-insp-copy" id="btn-insp-copy" title="Kodu Kopyala">📋 Kopyala</button>
                    <button class="btn-insp-insert" id="btn-insp-insert" title="Kodu Editöre Aktar">⚡ Editöre Ekle</button>
                  </div>
                </div>
                <pre class="insp-code-block"><code id="insp-code">MOV AX, 1234H</code></pre>
              </div>

              <!-- Connected Sister Instructions / Concepts -->
              <div class="insp-section">
                <div class="insp-section-label">Aynı Özelliği Paylaşan Kardeş Komutlar:</div>
                <div class="insp-related-tags" id="insp-related-tags"></div>
              </div>

              <!-- Action Link -->
              <div class="insp-footer-actions">
                <button class="btn-insp-open-manual" id="btn-insp-open-manual">
                  📖 Manuelde Tam Detayı Gör
                </button>
              </div>
            </div>
          </aside>
        </div>

        <!-- Bottom Physics & Legend Bar -->
        <footer class="graph-footer-bar">
          <div class="graph-legend-items">
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagNone};"></span> Bayrak Etkilemeyenler</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagAll};"></span> Tüm Aritmetik Bayraklar</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagNoCf};"></span> CF Korumalı (INC/DEC)</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagLogic};"></span> Mantıksal (CF=0, OF=0)</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagShift};"></span> Kaydırma / Döndürme</span>
            <span class="legend-item"><span class="legend-dot" style="background: ${GRAPH_COLORS.flagControl};"></span> Bayrak Kontrol (CLC...)</span>
          </div>

          <div class="graph-physics-controls">
            <label class="phys-label">Kuvvetler:</label>
            <span class="phys-slider-wrap" title="Düğümlerin küme merkezine çekim gücü">
              Çekim: <input type="range" id="slider-attraction" min="10" max="100" value="35" />
            </span>
            <span class="phys-slider-wrap" title="Düğümler arası itme mesafesi">
              İtme: <input type="range" id="slider-repulsion" min="150" max="900" value="420" />
            </span>
            <span class="phys-slider-wrap" title="Yay bağlantı mesafesi">
              Mesafe: <input type="range" id="slider-distance" min="40" max="200" value="85" />
            </span>
          </div>
        </footer>
      </div>
    `;

    this.detailPanelEl = this.container.querySelector('#graph-inspector') as HTMLElement;
    this.searchInputEl = this.container.querySelector('#graph-search-input') as HTMLInputElement;
  }

  private setupCanvas(): void {
    this.canvas = this.container.querySelector('#graph-canvas') as HTMLCanvasElement;
    this.renderer = new GraphRenderer(this.canvas, this.physics);
  }

  private bindEvents(): void {
    // 1. Back to Editor
    const backBtn = this.container.querySelector('#btn-graph-back');
    backBtn?.addEventListener('click', () => {
      this.callbacks.onReturnToEditor();
    });

    // 2. Recenter View
    const recenterBtn = this.container.querySelector('#btn-graph-recenter');
    recenterBtn?.addEventListener('click', () => {
      this.renderer.centerViewport();
      this.physics.wakeUp(1.0);
      this.renderer.render();
    });

    // 3. Grouping Mode Change
    const groupSelect = this.container.querySelector('#graph-group-mode') as HTMLSelectElement;
    groupSelect?.addEventListener('change', () => {
      const mode = groupSelect.value as GroupingMode;
      this.activeGroupingMode = mode;
      this.physics.setGroupingMode(mode);
    });

    // 4. Search Filter
    const clearBtn = this.container.querySelector('#graph-search-clear') as HTMLButtonElement;
    this.searchInputEl?.addEventListener('input', () => {
      const q = this.searchInputEl.value.trim();
      this.renderer.searchQuery = q;
      this.physics.wakeUp(0.6);
      clearBtn.style.display = q ? 'block' : 'none';
    });

    clearBtn?.addEventListener('click', () => {
      this.searchInputEl.value = '';
      this.renderer.searchQuery = '';
      clearBtn.style.display = 'none';
      this.physics.wakeUp(0.6);
      this.searchInputEl.focus();
    });

    // 5. Quick Pills Filter
    const pills = this.container.querySelectorAll('.graph-pill-btn');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const pillId = pill.getAttribute('data-pill');
        this.handlePillFilter(pillId);
      });
    });

    // 6. Physics Sliders
    const sliderAttract = this.container.querySelector('#slider-attraction') as HTMLInputElement;
    sliderAttract?.addEventListener('input', () => {
      this.physics.config.clusterStrength = Number(sliderAttract.value) / 1000;
      this.physics.wakeUp(0.7);
    });

    const sliderRepulsion = this.container.querySelector('#slider-repulsion') as HTMLInputElement;
    sliderRepulsion?.addEventListener('input', () => {
      this.physics.config.repulsion = Number(sliderRepulsion.value);
      this.physics.wakeUp(0.7);
    });

    const sliderDist = this.container.querySelector('#slider-distance') as HTMLInputElement;
    sliderDist?.addEventListener('input', () => {
      this.physics.config.linkDistance = Number(sliderDist.value);
      this.physics.wakeUp(0.7);
    });

    // 7. Inspector Drawer Close
    const closeInspBtn = this.container.querySelector('#btn-close-insp');
    closeInspBtn?.addEventListener('click', () => {
      this.renderer.selectedNode = null;
      this.detailPanelEl.style.display = 'none';
    });

    // 8. Inspector Code Actions
    const copyBtn = this.container.querySelector('#btn-insp-copy');
    copyBtn?.addEventListener('click', () => {
      const codeEl = this.container.querySelector('#insp-code');
      if (codeEl?.textContent) {
        navigator.clipboard.writeText(codeEl.textContent);
        copyBtn.textContent = '✓ Kopyalandı';
        setTimeout(() => { copyBtn.textContent = '📋 Kopyala'; }, 1500);
      }
    });

    const insertBtn = this.container.querySelector('#btn-insp-insert');
    insertBtn?.addEventListener('click', () => {
      const codeEl = this.container.querySelector('#insp-code');
      if (codeEl?.textContent && this.callbacks.onInsertCodeToEditor) {
        this.callbacks.onInsertCodeToEditor(codeEl.textContent);
      }
    });

    const openManualBtn = this.container.querySelector('#btn-insp-open-manual');
    openManualBtn?.addEventListener('click', () => {
      if (this.renderer.selectedNode && this.callbacks.onOpenInManual) {
        const opcode = this.renderer.selectedNode.label;
        this.callbacks.onOpenInManual(opcode);
      }
    });

    // 9. Canvas Mouse Interactions (Rubberband Drag, Fling, Pan, Zoom)
    this.bindCanvasMouseEvents();
  }

  private handlePillFilter(pillId: string | null): void {
    if (!pillId || pillId === 'all') {
      this.renderer.searchQuery = '';
      this.renderer.hoveredNode = null;
      this.physics.wakeUp(0.6);
      return;
    }

    if (pillId === 'flag-none') {
      const hub = this.physics.nodes.find(n => n.id === 'hub-flag-none');
      if (hub) this.selectNode(hub);
    } else if (pillId === 'flag-all') {
      const hub = this.physics.nodes.find(n => n.id === 'hub-flag-all');
      if (hub) this.selectNode(hub);
    } else if (pillId === 'stack') {
      const stackNode = this.physics.nodes.find(n => n.label === 'PUSH') || this.physics.nodes.find(n => n.mechanism === 'stack_op');
      if (stackNode) this.selectNode(stackNode);
    } else if (pillId === 'jump') {
      const jmpNode = this.physics.nodes.find(n => n.label === 'JMP') || this.physics.nodes.find(n => n.mechanism === 'control_jump');
      if (jmpNode) this.selectNode(jmpNode);
    }
  }

  private bindCanvasMouseEvents(): void {
    const canvas = this.canvas;

    // Zoom on wheel towards cursor
    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newZoom = Math.min(3.8, Math.max(0.2, this.renderer.viewport.zoom * zoomFactor));
      
      this.renderer.viewport.x = mouseX - (mouseX - this.renderer.viewport.x) * (newZoom / this.renderer.viewport.zoom);
      this.renderer.viewport.y = mouseY - (mouseY - this.renderer.viewport.y) * (newZoom / this.renderer.viewport.zoom);
      this.renderer.viewport.zoom = newZoom;
    }, { passive: false });

    // Mouse Down: Hit test node for drag or initiate pan
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const worldPos = this.renderer.screenToWorld(sx, sy);

      const hitNode = this.physics.getNodeAt(worldPos.x, worldPos.y, 14);
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      this.dragStartPos = { x: e.clientX, y: e.clientY };
      this.mouseVelocity = { vx: 0, vy: 0 };
      this.isActualDrag = false;

      if (hitNode) {
        this.draggedNode = hitNode;
        this.renderer.draggedNode = hitNode;
        this.physics.setNodeDrag(hitNode.id, worldPos.x, worldPos.y);
        canvas.style.cursor = 'grabbing';
      } else {
        this.isPanning = true;
        canvas.style.cursor = 'move';
      }
    });

    // Window Mouse Move (Fluid tracking everywhere even if cursor leaves canvas)
    window.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.mouseVelocity = { vx: dx, vy: dy };
      this.lastMousePos = { x: e.clientX, y: e.clientY };

      const totalDist = Math.hypot(e.clientX - this.dragStartPos.x, e.clientY - this.dragStartPos.y);
      if (totalDist > 4) {
        this.isActualDrag = true;
      }

      if (this.draggedNode) {
        const worldPos = this.renderer.screenToWorld(sx, sy);
        this.physics.setNodeDrag(this.draggedNode.id, worldPos.x, worldPos.y);
        return;
      }

      if (this.isPanning) {
        this.renderer.viewport.x += dx;
        this.renderer.viewport.y += dy;
        return;
      }

      // Hover Hit Testing
      if (sx >= 0 && sx <= rect.width && sy >= 0 && sy <= rect.height) {
        const worldPos = this.renderer.screenToWorld(sx, sy);
        const hit = this.physics.getNodeAt(worldPos.x, worldPos.y, 10);
        if (hit !== this.renderer.hoveredNode) {
          this.renderer.hoveredNode = hit;
          canvas.style.cursor = hit ? 'grab' : 'default';
        }
      }
    });

    // Window Mouse Up: Release node with sling / fling physics or open inspector on click
    window.addEventListener('mouseup', () => {
      if (this.draggedNode) {
        const node = this.draggedNode;
        if (!this.isActualDrag) {
          // Clean click without drag -> select node and open inspector
          this.selectNode(node);
        }

        // Release node and transfer fling momentum!
        this.physics.setNodeDrag(
          node.id, 
          null, 
          null, 
          this.mouseVelocity.vx, 
          this.mouseVelocity.vy
        );

        this.draggedNode = null;
        this.renderer.draggedNode = null;
        canvas.style.cursor = this.renderer.hoveredNode ? 'grab' : 'default';
      } else if (this.isPanning && !this.isActualDrag) {
        // Clicked on empty space: deselect
        this.renderer.selectedNode = null;
        this.detailPanelEl.style.display = 'none';
        canvas.style.cursor = 'default';
      }

      this.isPanning = false;
    });
  }

  public selectNode(node: KnowledgeNode): void {
    this.renderer.selectedNode = node;
    this.physics.wakeUp(0.8);
    this.showInspector(node);
  }

  private showInspector(node: KnowledgeNode): void {
    const insp = this.detailPanelEl;
    insp.style.display = 'flex';

    const titleEl = insp.querySelector('#insp-title') as HTMLElement;
    const kindEl = insp.querySelector('#insp-kind') as HTMLElement;
    const flagValEl = insp.querySelector('#insp-flag-val') as HTMLElement;
    const descEl = insp.querySelector('#insp-desc') as HTMLElement;
    const rulesBox = insp.querySelector('#insp-rules-box') as HTMLElement;
    const rulesText = insp.querySelector('#insp-rules-text') as HTMLElement;
    const codeEl = insp.querySelector('#insp-code') as HTMLElement;
    const sampleSec = insp.querySelector('#insp-sample-section') as HTMLElement;
    const tagsContainer = insp.querySelector('#insp-related-tags') as HTMLElement;
    const openManualBtn = insp.querySelector('#btn-insp-open-manual') as HTMLElement;

    titleEl.textContent = node.label;
    titleEl.style.color = node.color;
    kindEl.textContent = node.kind === 'flag_hub' ? 'Ana Özellik Havuzu' : (node.kind === 'sub_hub' ? 'Ortak Alt Küme Kavşağı' : '8086 Komutu');

    flagValEl.textContent = node.flagsText || 'Belirtilmedi';
    descEl.textContent = node.summary;

    if (node.rules) {
      rulesBox.style.display = 'flex';
      rulesText.innerHTML = node.rules.replace(/\n/g, '<br/>');
    } else {
      rulesBox.style.display = 'none';
    }

    if (node.sampleCode) {
      sampleSec.style.display = 'block';
      codeEl.textContent = node.sampleCode;
    } else {
      sampleSec.style.display = 'none';
    }

    if (node.kind === 'instruction') {
      openManualBtn.style.display = 'block';
    } else {
      openManualBtn.style.display = 'none';
    }

    // Populate Sister Instructions sharing same sub-trait or flag impact
    let sisters: KnowledgeNode[] = [];
    if (node.kind === 'sub_hub') {
      // Find all instruction nodes connected to this sub_hub
      const memberIds = new Set(
        this.physics.edges
          .filter(e => e.target === node.id || e.source === node.id)
          .map(e => e.target === node.id ? e.source : e.target)
      );
      sisters = this.physics.nodes.filter(n => memberIds.has(n.id) && n.kind === 'instruction');
    } else if (node.subTraitId) {
      // Find all sibling instructions sharing the same sub-trait!
      sisters = this.physics.nodes.filter(n => 
        n.id !== node.id && 
        n.kind === 'instruction' && 
        n.subTraitId === node.subTraitId
      ).slice(0, 18);
    } else {
      // Fallback: same flag impact
      sisters = this.physics.nodes.filter(n => 
        n.id !== node.id && 
        n.kind === 'instruction' && 
        n.flagImpact === node.flagImpact
      ).slice(0, 16);
    }

    if (sisters.length > 0) {
      tagsContainer.innerHTML = sisters.map(s => `
        <button class="insp-tag-pill" data-node-id="${s.id}" style="border-color: ${s.color}66; color: ${s.color};">
          ${s.label}
        </button>
      `).join('');

      tagsContainer.querySelectorAll('.insp-tag-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-node-id');
          const targetNode = this.physics.nodes.find(n => n.id === targetId);
          if (targetNode) {
            this.selectNode(targetNode);
          }
        });
      });
    } else {
      tagsContainer.innerHTML = `<span style="font-size: 11px; color: #64748b;">Doğrudan eşleşen kardeş komut yok.</span>`;
    }
  }

  public destroy(): void {
    this.renderer.destroy();
  }
}
