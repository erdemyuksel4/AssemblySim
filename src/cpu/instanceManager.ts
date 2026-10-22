import { CPU } from './cpu.js';

export interface CpuInstance {
  id: string;
  name: string;
  color: string;
  cpu: CPU;
  createdAt: number;
  isDefault?: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16'  // Lime
];

export class CpuInstanceManager {
  private instances: Map<string, CpuInstance> = new Map();
  private defaultId: string = 'cpu-default';
  private counter: number = 1;

  constructor() {
    this.createInstance('Ana İşlemci (CPU-1)', this.defaultId, true);
  }

  createInstance(name?: string, customId?: string, isDefault: boolean = false): CpuInstance {
    const id = customId || `cpu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const instanceIndex = this.instances.size;
    const color = PRESET_COLORS[instanceIndex % PRESET_COLORS.length];
    const instanceName = name || `İşlemci #${++this.counter}`;

    const instance: CpuInstance = {
      id,
      name: instanceName,
      color,
      cpu: new CPU(),
      createdAt: Date.now(),
      isDefault
    };

    this.instances.set(id, instance);
    return instance;
  }

  getInstance(id: string): CpuInstance | undefined {
    return this.instances.get(id);
  }

  getOrDefaultInstance(id?: string): CpuInstance {
    if (id && this.instances.has(id)) {
      return this.instances.get(id)!;
    }
    return this.getDefaultInstance();
  }

  getDefaultInstance(): CpuInstance {
    const def = this.instances.get(this.defaultId);
    if (def) return def;
    const first = this.instances.values().next().value;
    if (first) return first;
    return this.createInstance('Ana İşlemci (CPU-1)', this.defaultId, true);
  }

  getAllInstances(): CpuInstance[] {
    return Array.from(this.instances.values());
  }

  removeInstance(id: string): boolean {
    if (id === this.defaultId) {
      return false;
    }
    return this.instances.delete(id);
  }

  resetInstance(id: string): void {
    const inst = this.instances.get(id);
    if (inst) {
      inst.cpu.reset();
    }
  }

  renameInstance(id: string, newName: string): boolean {
    const inst = this.instances.get(id);
    if (inst && newName.trim()) {
      inst.name = newName.trim();
      return true;
    }
    return false;
  }
}
