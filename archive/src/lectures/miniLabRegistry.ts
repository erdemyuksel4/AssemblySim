import { CPU } from '../cpu/cpu.js';
import { AsmResult } from '../assembler/assembler.js';
import { NumberFormat } from '../ui/registerPanel.js';
import { LectureExample } from './lectureData.js';
import { LectureStorage } from './lectureStorage.js';

export type MiniLabSpeed = '0.5' | '1' | '2';

export interface MiniLabRecord {
  id: string;
  cpu: CPU;
  userCode: string;
  currentAsmResult: AsmResult | null;
  speed: MiniLabSpeed;
  showSolution: boolean;
  numberFormat: NumberFormat;
  consoleBuffer: string;
  ipToLineMap: Map<number, number>;
  isInitialized: boolean;
  isDirty?: boolean;
  activeDifficultyId?: string;
  editorScroll?: { top: number; left: number };
  memBasePhys?: number;
  memUserPinned?: boolean;
}

/**
 * Isolated registry for lecture mini-lab CPUs and user states.
 * Mini-lab CPUs are completely isolated sandboxes, dedicated to their
 * respective exercises, and are NOT exposed to user management or interference.
 */
export class MiniLabRegistry {
  private static records: Map<string, MiniLabRecord> = new Map();

  static getOrCreate(example: LectureExample): MiniLabRecord {
    let rec = this.records.get(example.id);
    if (!rec) {
      const cpu = new CPU();
      if (example.initialMemory) {
        for (const block of example.initialMemory) {
          cpu.mem.loadBytes(block.segment, block.offset, block.bytes, 'data');
        }
      }
      if (example.initialRegisters) {
        Object.assign(cpu.regs, example.initialRegisters);
      }

      const savedCode = LectureStorage.loadExampleCode(example.id);
      rec = {
        id: example.id,
        cpu,
        userCode: savedCode !== null ? savedCode : example.code,
        currentAsmResult: null,
        speed: '1',
        showSolution: false,
        numberFormat: 'hex',
        consoleBuffer: '',
        ipToLineMap: new Map(),
        isInitialized: false,
        isDirty: false,
        activeDifficultyId: example.id
      };
      this.records.set(example.id, rec);
    }
    return rec;
  }

  static get(id: string): MiniLabRecord | undefined {
    return this.records.get(id);
  }

  static reset(example: LectureExample): MiniLabRecord {
    LectureStorage.resetExampleCode(example.id);
    const rec = this.getOrCreate(example);
    rec.cpu.reset();
    if (example.initialMemory) {
      for (const block of example.initialMemory) {
        rec.cpu.mem.loadBytes(block.segment, block.offset, block.bytes, 'data');
      }
    }
    if (example.initialRegisters) {
      Object.assign(rec.cpu.regs, example.initialRegisters);
    }
    rec.userCode = example.code;
    rec.currentAsmResult = null;
    rec.consoleBuffer = '';
    rec.isInitialized = false;
    rec.isDirty = false;
    rec.memBasePhys = undefined;
    rec.memUserPinned = false;
    return rec;
  }

  static clearAll(): void {
    this.records.clear();
  }
}
