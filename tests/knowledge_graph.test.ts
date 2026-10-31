import { describe, it, expect } from 'vitest';
import { build8086KnowledgeGraph, getClusterDefinitions, GroupingMode } from '../src/ui/graph/knowledgeData.js';
import { GraphPhysics } from '../src/ui/graph/graphPhysics.js';

describe('8086 Knowledge Graph & Neural Map', () => {
  it('should build knowledge graph with nodes and valid edges', () => {
    const { nodes, edges } = build8086KnowledgeGraph();

    expect(nodes.length).toBeGreaterThan(50);
    expect(edges.length).toBeGreaterThan(30);

    const nodeIds = new Set(nodes.map(n => n.id));

    // Verify all edges connect existing nodes
    edges.forEach(edge => {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    });
  });

  it('should correctly classify flag impact for instructions', () => {
    const { nodes } = build8086KnowledgeGraph();
    const nodeMap = new Map(nodes.map(n => [n.label, n]));

    // 1. None (Do not affect flags)
    const mov = nodeMap.get('MOV');
    expect(mov?.flagImpact).toBe('none');

    const push = nodeMap.get('PUSH');
    expect(push?.flagImpact).toBe('none');

    const pop = nodeMap.get('POP');
    expect(pop?.flagImpact).toBe('none');

    const lea = nodeMap.get('LEA');
    expect(lea?.flagImpact).toBe('none');

    const jmp = nodeMap.get('JMP');
    expect(jmp?.flagImpact).toBe('none');

    // 2. All arithmetic (Modify all status flags)
    const add = nodeMap.get('ADD');
    expect(add?.flagImpact).toBe('all_arithmetic');

    const sub = nodeMap.get('SUB');
    expect(sub?.flagImpact).toBe('all_arithmetic');

    const cmp = nodeMap.get('CMP');
    expect(cmp?.flagImpact).toBe('all_arithmetic');

    // 3. No CF (INC, DEC preserve CF)
    const inc = nodeMap.get('INC');
    expect(inc?.flagImpact).toBe('no_cf');

    const dec = nodeMap.get('DEC');
    expect(dec?.flagImpact).toBe('no_cf');

    // 4. Logic (CF=0, OF=0)
    const and = nodeMap.get('AND');
    expect(and?.flagImpact).toBe('logic');

    const xor = nodeMap.get('XOR');
    expect(xor?.flagImpact).toBe('logic');

    // 5. Flag controls (CLC, STC, STI, CLI...)
    const clc = nodeMap.get('CLC');
    expect(clc?.flagImpact).toBe('flag_control');

    const stc = nodeMap.get('STC');
    expect(stc?.flagImpact).toBe('flag_control');
  });

  it('should create sub-trait junction hubs and connect member instructions', () => {
    const { nodes, edges } = build8086KnowledgeGraph();

    const subHubs = nodes.filter(n => n.kind === 'sub_hub');
    expect(subHubs.length).toBeGreaterThanOrEqual(15);

    // Verify stack sub-hub exists and connects to PUSH / POP
    const stackHub = subHubs.find(h => h.id === 'sub-stack-ops');
    expect(stackHub).toBeDefined();

    const stackEdges = edges.filter(e => e.target === 'sub-stack-ops' || e.source === 'sub-stack-ops');
    expect(stackEdges.length).toBeGreaterThanOrEqual(5);

    // Verify ZF jump sub-hub exists and connects to JZ
    const zeroJumpHub = subHubs.find(h => h.id === 'sub-branch-zero');
    expect(zeroJumpHub).toBeDefined();

    const zeroEdges = edges.filter(e => e.target === 'sub-branch-zero' || e.source === 'sub-branch-zero');
    expect(zeroEdges.length).toBeGreaterThanOrEqual(2);
  });

  it('should provide valid cluster definitions for all grouping modes including subclusters', () => {
    const modes: GroupingMode[] = ['subclusters', 'flags', 'mechanism', 'category', 'hardware'];

    modes.forEach(mode => {
      const clusters = getClusterDefinitions(mode);
      expect(clusters.length).toBeGreaterThan(3);

      clusters.forEach(c => {
        expect(c.id).toBeTruthy();
        expect(c.label).toBeTruthy();
        expect(Number.isFinite(c.anchorX)).toBe(true);
        expect(Number.isFinite(c.anchorY)).toBe(true);
      });
    });
  });

  it('should simulate physics ticks without NaN and honor drag locking', () => {
    const { nodes, edges } = build8086KnowledgeGraph();
    const physics = new GraphPhysics(nodes, edges, 'flags');

    // Test initial tick
    physics.tick();

    physics.nodes.forEach(n => {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
      expect(Number.isFinite(n.vx)).toBe(true);
      expect(Number.isFinite(n.vy)).toBe(true);
    });

    // Test dragging lock
    const testNode = physics.nodes[0];
    physics.setNodeDrag(testNode.id, 500, -300);
    expect(testNode.fx).toBe(500);
    expect(testNode.fy).toBe(-300);

    physics.tick();
    expect(testNode.x).toBe(500);
    expect(testNode.y).toBe(-300);

    // Release drag
    physics.setNodeDrag(testNode.id, null, null);
    expect(testNode.fx).toBeNull();
  });
});
