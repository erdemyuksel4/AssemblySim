import { KnowledgeNode, KnowledgeEdge, ClusterInfo, GRAPH_COLORS } from './knowledgeData.js';
import { GraphPhysics } from './graphPhysics.js';

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

interface DustParticle {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
}

export class GraphRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private physics: GraphPhysics;

  public viewport: ViewportTransform = { x: 0, y: 0, zoom: 0.9 };
  public hoveredNode: KnowledgeNode | null = null;
  public selectedNode: KnowledgeNode | null = null;
  public draggedNode: KnowledgeNode | null = null;
  public searchQuery: string = '';

  private animFrameId: number | null = null;
  private pulsePhase: number = 0;
  private isDestroyed: boolean = false;
  private dust: DustParticle[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement, physics: GraphPhysics) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not available');
    this.ctx = context;
    this.physics = physics;

    this.initDust();
    this.setupResizeObserver();
    this.resize();
    this.centerViewport();
  }

  private initDust(): void {
    this.dust = [];
    for (let i = 0; i < 45; i++) {
      this.dust.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.35 + 0.1,
        speed: Math.random() * 0.2 + 0.05
      });
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        this.render();
      });
      this.resizeObserver.observe(this.canvas);
    }
  }

  public resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
    }
  }

  public centerViewport(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.viewport.x = rect.width / 2;
      this.viewport.y = rect.height / 2;
      this.viewport.zoom = 0.88;
    }
  }

  public screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.viewport.x) / this.viewport.zoom,
      y: (sy - this.viewport.y) / this.viewport.zoom
    };
  }

  public worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: wx * this.viewport.zoom + this.viewport.x,
      y: wy * this.viewport.zoom + this.viewport.y
    };
  }

  public startAnimation(): void {
    if (this.animFrameId !== null) return;
    this.isDestroyed = false;

    const renderLoop = () => {
      if (this.isDestroyed) return;
      this.time += 0.025;
      this.pulsePhase = (this.pulsePhase + 0.018) % 1;
      this.physics.tick();
      this.render();
      this.animFrameId = requestAnimationFrame(renderLoop);
    };

    this.animFrameId = requestAnimationFrame(renderLoop);
  }

  public stopAnimation(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.stopAnimation();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  public render(): void {
    const { ctx, canvas } = this;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width <= 0 || height <= 0) return;

    // Reset base transform to Retina DPR
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Deep Space Cosmic Background
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Vignette
    const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.7);
    bgGlow.addColorStop(0, '#0f172a');
    bgGlow.addColorStop(1, '#050811');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Camera Transform (Pan & Zoom)
    ctx.save();
    ctx.translate(this.viewport.x, this.viewport.y);
    ctx.scale(this.viewport.zoom, this.viewport.zoom);

    // 3. Floating Dust & Grid
    this.drawFloatingDust();

    // 4. Compute Active Connected Graph Subset
    const activeNodes = this.computeActiveNeighborhood();

    // 5. Cluster Nebulae
    this.drawClusterNebulae();

    // 6. Neural Synaptic Cords (Edges)
    this.drawEdges(activeNodes);

    // 7. Interactive Nodes
    this.drawNodes(activeNodes);

    ctx.restore();
  }

  private drawFloatingDust(): void {
    const { ctx } = this;
    ctx.save();
    this.dust.forEach(p => {
      p.y -= p.speed;
      if (p.y < -800) p.y = 800;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
      ctx.fill();
    });
    ctx.restore();
  }

  private computeActiveNeighborhood(): Set<string> | null {
    const target = this.draggedNode || this.hoveredNode || this.selectedNode;
    if (!target && !this.searchQuery) return null;

    const set = new Set<string>();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      this.physics.nodes.forEach(n => {
        if (n.label.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
          set.add(n.id);
        }
      });
      return set;
    }

    if (target) {
      set.add(target.id);
      
      // If hovering over a Hub, add all instructions pointing to it!
      if (target.kind === 'flag_hub') {
        this.physics.nodes.forEach(n => {
          if (n.flagImpact === target.flagImpact) {
            set.add(n.id);
          }
        });
      }

      // Add all 1-hop connected neighbors
      this.physics.edges.forEach(e => {
        if (e.source === target.id) set.add(e.target);
        if (e.target === target.id) set.add(e.source);
      });
    }

    return set;
  }

  private drawClusterNebulae(): void {
    const { ctx, time } = this;
    const clusters = this.physics.clusters;

    clusters.forEach(cluster => {
      const clusterNodes = this.physics.nodes.filter(n => n.clusterId === cluster.id);
      if (clusterNodes.length === 0) return;

      let maxDist = 80;
      clusterNodes.forEach(n => {
        const dx = n.x - cluster.anchorX;
        const dy = n.y - cluster.anchorY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > maxDist && d < 450) maxDist = d;
      });

      // Subtle breathing pulse
      const breathe = Math.sin(time * 1.5 + cluster.anchorX) * 10;
      const radius = maxDist + 50 + breathe;

      // Soft nebula glow
      const grad = ctx.createRadialGradient(
        cluster.anchorX, cluster.anchorY, 15,
        cluster.anchorX, cluster.anchorY, radius
      );
      grad.addColorStop(0, `${cluster.color}1c`);
      grad.addColorStop(0.6, `${cluster.color}08`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cluster.anchorX, cluster.anchorY, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Atmospheric outer ring
      ctx.beginPath();
      ctx.arc(cluster.anchorX, cluster.anchorY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${cluster.color}33`;
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Cluster Title Label with neon tint
      ctx.font = '700 13px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = `${cluster.color}dd`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(cluster.label, cluster.anchorX, cluster.anchorY - radius + 18);
    });
  }

  private drawEdges(activeNodes: Set<string> | null): void {
    const { ctx, pulsePhase } = this;
    const nodeMap = new Map(this.physics.nodes.map(n => [n.id, n]));
    const target = this.draggedNode || this.hoveredNode || this.selectedNode;

    this.physics.edges.forEach(edge => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;

      const isDirectActive = target && (src.id === target.id || tgt.id === target.id);
      const isBothActive = activeNodes && activeNodes.has(src.id) && activeNodes.has(tgt.id);

      let strokeStyle = 'rgba(100, 116, 139, 0.18)';
      let lineWidth = 1;
      let alpha = 0.25;

      if (activeNodes) {
        if (isDirectActive) {
          strokeStyle = tgt.color || '#38bdf8';
          lineWidth = 2.6;
          alpha = 0.95;
        } else if (isBothActive) {
          strokeStyle = tgt.color || '#38bdf8';
          lineWidth = 1.6;
          alpha = 0.65;
        } else {
          alpha = 0.05;
        }
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;

      // Draw direct line
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();

      // Electric Synaptic Pulse along active cords
      if (isDirectActive) {
        const px = src.x + (tgt.x - src.x) * pulsePhase;
        const py = src.y + (tgt.y - src.y) * pulsePhase;

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = strokeStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private drawNodes(activeNodes: Set<string> | null): void {
    const { ctx, time } = this;
    const zoom = this.viewport.zoom;

    this.physics.nodes.forEach(node => {
      const isDragged = this.draggedNode?.id === node.id;
      const isHovered = this.hoveredNode?.id === node.id;
      const isSelected = this.selectedNode?.id === node.id;
      const isHighlighted = isDragged || isHovered || isSelected;
      const isActive = !activeNodes || activeNodes.has(node.id);

      ctx.save();

      // Non-active nodes fade out gently
      if (activeNodes && !isActive) {
        ctx.globalAlpha = 0.12;
      } else {
        ctx.globalAlpha = 1.0;
      }

      // Radius grows with spring effect when grabbed or hovered
      const radius = node.radius * (isDragged ? 1.4 : (isHovered || isSelected ? 1.25 : 1.0));

      // 1. Luminous Neon Corona Halo
      const isHub = node.kind === 'flag_hub' || node.kind === 'sub_hub';
      if (isHighlighted || isHub) {
        const pulse = Math.sin(time * 3 + node.x) * 4;
        const multiplier = node.kind === 'flag_hub' ? 2.6 : (node.kind === 'sub_hub' ? 2.1 : 1.9);
        const auraRadius = radius * multiplier + pulse;
        const aura = ctx.createRadialGradient(node.x, node.y, radius * 0.4, node.x, node.y, auraRadius);
        aura.addColorStop(0, `${node.color}66`);
        aura.addColorStop(0.6, `${node.color}22`);
        aura.addColorStop(1, 'transparent');

        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Node Core Fill with Gradient
      const coreGrad = ctx.createRadialGradient(
        node.x - radius * 0.3, node.y - radius * 0.3, radius * 0.1,
        node.x, node.y, radius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.35, node.color);
      coreGrad.addColorStop(1, '#0f172a');

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Outer crisp rim
      ctx.lineWidth = isHighlighted ? 2.8 : (isHub ? 2.0 : 1.5);
      ctx.strokeStyle = isHighlighted ? '#ffffff' : (isHub ? '#ffffffaa' : `${node.color}cc`);
      ctx.stroke();

      // If sub_hub, draw an inner decorative concentric ring
      if (node.kind === 'sub_hub') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // If dragged, draw an energetic spring anchor ring
      if (isDragged) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 3. Node Labels (Razor sharp Retina typography)
      const shouldDrawLabel = 
        isHub || 
        isHighlighted || 
        (activeNodes && activeNodes.has(node.id)) || 
        zoom > 0.55;

      if (shouldDrawLabel) {
        const fontSize = node.kind === 'flag_hub' ? 12.5 : (node.kind === 'sub_hub' ? 11.5 : (isHighlighted ? 11 : 9.5));
        ctx.font = `${isHub || isHighlighted ? '700' : '600'} ${fontSize}px "JetBrains Mono", Consolas, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelY = node.y + radius + 5;
        const text = node.kind === 'sub_hub' && node.memberCount 
          ? `${node.label} (${node.memberCount})` 
          : node.label;

        // Label pill background for perfect legibility
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        ctx.fillStyle = isHub ? 'rgba(15, 23, 42, 0.95)' : 'rgba(8, 13, 26, 0.88)';
        ctx.fillRect(node.x - textWidth / 2 - 5, labelY - 2, textWidth + 10, fontSize + 4);

        // Thin label border on highlight or hub
        if (isHighlighted || isHub) {
          ctx.strokeStyle = `${node.color}cc`;
          ctx.lineWidth = 1;
          ctx.strokeRect(node.x - textWidth / 2 - 5, labelY - 2, textWidth + 10, fontSize + 4);
        }

        ctx.fillStyle = isHighlighted ? '#ffffff' : (isHub ? node.color : '#f1f5f9');
        ctx.fillText(text, node.x, labelY);
      }

      ctx.restore();
    });
  }
}
