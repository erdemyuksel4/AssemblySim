import { KnowledgeNode, KnowledgeEdge, ClusterInfo, GroupingMode, getClusterDefinitions } from './knowledgeData.js';

export interface PhysicsConfig {
  repulsion: number;       // Node-to-node repulsion
  linkDistance: number;    // Resting link distance
  linkStrength: number;    // Spring constant
  clusterStrength: number; // Multi-centroid pull strength
  centerGravity: number;   // Global gravity toward (0, 0)
  damping: number;         // Velocity friction
  maxSpeed: number;        // Speed clamp
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  repulsion: 420,
  linkDistance: 85,
  linkStrength: 0.18,
  clusterStrength: 0.035,
  centerGravity: 0.012,
  damping: 0.92,           // Fluid glide
  maxSpeed: 22
};

export class GraphPhysics {
  public config: PhysicsConfig;
  public nodes: KnowledgeNode[] = [];
  public edges: KnowledgeEdge[] = [];
  public clusters: ClusterInfo[] = [];
  public groupingMode: GroupingMode = 'flags';
  public alpha: number = 1.0; // Simulation energy / heat

  private nodeMap: Map<string, KnowledgeNode> = new Map();
  private clusterMap: Map<string, ClusterInfo> = new Map();
  private time: number = 0;

  constructor(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    groupingMode: GroupingMode = 'flags',
    config: Partial<PhysicsConfig> = {}
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.groupingMode = groupingMode;
    this.config = { ...DEFAULT_PHYSICS_CONFIG, ...config };
    this.initNodeMap();
    this.setGroupingMode(groupingMode);
  }

  private initNodeMap(): void {
    this.nodeMap.clear();
    this.nodes.forEach(n => this.nodeMap.set(n.id, n));
  }

  public setGroupingMode(mode: GroupingMode): void {
    this.groupingMode = mode;
    this.clusters = getClusterDefinitions(mode);
    this.clusterMap.clear();
    this.clusters.forEach(c => this.clusterMap.set(c.id, c));
    this.wakeUp(1.0);

    // Assign clusterId to nodes based on active mode
    this.nodes.forEach(node => {
      let clusterKey = '';
      if (mode === 'subclusters') {
        clusterKey = node.kind === 'sub_hub' ? node.id : (node.subTraitId || node.flagImpact);
      } else if (mode === 'flags') {
        clusterKey = node.flagImpact;
      } else if (mode === 'mechanism') {
        clusterKey = node.mechanism;
      } else if (mode === 'category') {
        clusterKey = node.category;
      } else if (mode === 'hardware') {
        clusterKey = node.hardwareLayer;
      }
      node.clusterId = clusterKey;
      
      const targetCluster = this.clusterMap.get(clusterKey);
      if (targetCluster) {
        // Dynamic push toward new cluster anchor
        node.vx += (targetCluster.anchorX - node.x) * 0.04;
        node.vy += (targetCluster.anchorY - node.y) * 0.04;
      }
    });
  }

  public wakeUp(heat: number = 0.8): void {
    this.alpha = Math.max(this.alpha, heat);
  }

  public tick(): void {
    this.time += 0.02;
    const { repulsion, linkDistance, linkStrength, clusterStrength, centerGravity, damping, maxSpeed } = this.config;
    const nodeCount = this.nodes.length;
    const energy = Math.max(0.15, this.alpha);

    // 1. Cluster Attraction & Ambient Organic Life
    for (let i = 0; i < nodeCount; i++) {
      const node = this.nodes[i];
      if (node.fx !== undefined && node.fx !== null) continue;

      // Center gravity
      node.vx -= node.x * centerGravity * energy;
      node.vy -= node.y * centerGravity * energy;

      // Cluster anchor pull
      if (node.clusterId) {
        const cluster = this.clusterMap.get(node.clusterId);
        if (cluster) {
          const dx = cluster.anchorX - node.x;
          const dy = cluster.anchorY - node.y;
          node.vx += dx * clusterStrength * energy;
          node.vy += dy * clusterStrength * energy;
        }
      }

      // Very subtle ambient breathing motion so nodes feel alive
      const phase = i * 0.35 + this.time;
      node.vx += Math.sin(phase) * 0.08;
      node.vy += Math.cos(phase * 0.8) * 0.08;
    }

    // 2. Node-to-Node Repulsion (Soft Coulomb Field)
    for (let i = 0; i < nodeCount; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < nodeCount; j++) {
        const n2 = this.nodes[j];

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        let distSq = dx * dx + dy * dy;
        const minDist = n1.radius + n2.radius + 16;
        const minDistSq = minDist * minDist;

        if (distSq < 1) distSq = 1;
        const dist = Math.sqrt(distSq);

        let force = (repulsion * energy) / distSq;
        // Collision prevention push
        if (distSq < minDistSq) {
          force += (minDist - dist) * 0.5;
        }

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (n1.fx === undefined || n1.fx === null) {
          n1.vx -= fx;
          n1.vy -= fy;
        }
        if (n2.fx === undefined || n2.fx === null) {
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 3. Elastic Spring Forces Along Links (Rubber-band physics!)
    const edgeCount = this.edges.length;
    for (let i = 0; i < edgeCount; i++) {
      const edge = this.edges[i];
      const source = this.nodeMap.get(edge.source);
      const target = this.nodeMap.get(edge.target);

      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Spring displacement: pulls closer or pushes if compressed
      const displacement = dist - linkDistance;
      const k = (edge.strength || 1) * linkStrength * energy;
      const force = displacement * k;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      // If one of the nodes is being dragged, the other receives strong pull!
      const isSourceDragged = source.fx !== undefined && source.fx !== null;
      const isTargetDragged = target.fx !== undefined && target.fx !== null;

      if (!isSourceDragged) {
        source.vx += fx * (isTargetDragged ? 1.6 : 1);
        source.vy += fy * (isTargetDragged ? 1.6 : 1);
      }
      if (!isTargetDragged) {
        target.vx -= fx * (isSourceDragged ? 1.6 : 1);
        target.vy -= fy * (isSourceDragged ? 1.6 : 1);
      }
    }

    // 4. Update Positions & Fluid Damping
    for (let i = 0; i < nodeCount; i++) {
      const node = this.nodes[i];

      if (node.fx !== undefined && node.fx !== null) {
        node.x = node.fx;
        node.y = node.fy!;
        node.vx = 0;
        node.vy = 0;
        continue;
      }

      node.vx *= damping;
      node.vy *= damping;

      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > maxSpeed) {
        node.vx = (node.vx / speed) * maxSpeed;
        node.vy = (node.vy / speed) * maxSpeed;
      }

      node.x += node.vx;
      node.y += node.vy;
    }

    // Slowly decay energy down to baseline
    if (this.alpha > 0.2) {
      this.alpha *= 0.994;
    }
  }

  public setNodeDrag(nodeId: string, x: number | null, y: number | null, releaseVx?: number, releaseVy?: number): void {
    const node = this.nodeMap.get(nodeId);
    if (!node) return;
    this.wakeUp(1.0);

    if (x !== null && y !== null) {
      node.fx = x;
      node.fy = y;
      node.x = x;
      node.y = y;
    } else {
      node.fx = null;
      node.fy = null;
      // Transfer fling momentum if provided!
      if (releaseVx !== undefined && releaseVy !== undefined) {
        node.vx = Math.min(25, Math.max(-25, releaseVx * 0.7));
        node.vy = Math.min(25, Math.max(-25, releaseVy * 0.7));
      }
    }
  }

  public getNodeAt(x: number, y: number, padding: number = 12): KnowledgeNode | null {
    // Generous hit test for effortless mouse grabbing
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const hitRadius = node.radius + padding;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return node;
      }
    }
    return null;
  }
}
