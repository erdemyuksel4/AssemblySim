import { CPU } from '../cpu/cpu.js';
import { Assembler } from '../assembler/assembler.js';
import { StudyTask } from './studyData.js';

export interface DiffItem {
  target: string;
  expected: string;
  actual: string;
  matched: boolean;
}

export interface StudyGradeResult {
  success: boolean;
  status: 'PASSED' | 'FAILED' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT';
  message: string;
  steps: number;
  diffs: DiffItem[];
}

export class StudyRunner {
  static grade(task: StudyTask, userCode: string): StudyGradeResult {
    // 1. Compile Code
    const asmResult = Assembler.assemble(userCode);
    if (asmResult.errors && asmResult.errors.length > 0) {
      const err = asmResult.errors[0];
      return {
        success: false,
        status: 'COMPILE_ERROR',
        message: `Derleme Hatası (Satır ${err.line}): ${err.message}`,
        steps: 0,
        diffs: []
      };
    }

    if (!asmResult.bytes || asmResult.bytes.length === 0) {
      return {
        success: false,
        status: 'COMPILE_ERROR',
        message: 'Derleyici herhangi bir makine kodu baytı üretemedi.',
        steps: 0,
        diffs: []
      };
    }

    // 2. Setup Sandbox CPU
    const cpu = new CPU();
    cpu.loadCOM(asmResult.bytes, asmResult.origin);

    // Apply custom initial registers if defined
    if (task.testSetup?.initialRegisters) {
      for (const [reg, val] of Object.entries(task.testSetup.initialRegisters)) {
        const lower = reg.toLowerCase();
        if (lower in cpu.regs) {
          (cpu.regs as any)[lower] = val & 0xFFFF;
        } else if (lower === 'al') {
          cpu.regs.ax = (cpu.regs.ax & 0xFF00) | (val & 0xFF);
        } else if (lower === 'ah') {
          cpu.regs.ax = (cpu.regs.ax & 0x00FF) | ((val & 0xFF) << 8);
        } else if (lower === 'bl') {
          cpu.regs.bx = (cpu.regs.bx & 0xFF00) | (val & 0xFF);
        } else if (lower === 'bh') {
          cpu.regs.bx = (cpu.regs.bx & 0x00FF) | ((val & 0xFF) << 8);
        } else if (lower === 'cl') {
          cpu.regs.cx = (cpu.regs.cx & 0xFF00) | (val & 0xFF);
        } else if (lower === 'ch') {
          cpu.regs.cx = (cpu.regs.cx & 0x00FF) | ((val & 0xFF) << 8);
        } else if (lower === 'dl') {
          cpu.regs.dx = (cpu.regs.dx & 0xFF00) | (val & 0xFF);
        } else if (lower === 'dh') {
          cpu.regs.dx = (cpu.regs.dx & 0x00FF) | ((val & 0xFF) << 8);
        }
      }
    }

    // Apply custom initial memory if defined
    if (task.testSetup?.initialMemory) {
      for (const block of task.testSetup.initialMemory) {
        for (let i = 0; i < block.bytes.length; i++) {
          cpu.mem.writeByte(block.segment, block.offset + i, block.bytes[i]);
        }
      }
    }

    // 3. Execution Loop
    const maxSteps = task.assertions.maxSteps || 3000;
    let steps = 0;
    let runtimeError: string | null = null;

    while (!cpu.halted && steps < maxSteps) {
      const info = cpu.step();
      steps++;
      if (info.error) {
        runtimeError = info.error;
        break;
      }
    }

    if (runtimeError) {
      return {
        success: false,
        status: 'RUNTIME_ERROR',
        message: `Çalışma Zamanı Hatası: ${runtimeError}`,
        steps,
        diffs: []
      };
    }

    if (!cpu.halted && steps >= maxSteps) {
      return {
        success: false,
        status: 'TIMEOUT',
        message: `Zaman Aşımı: Program ${maxSteps} adımda sonlanmadı (HLT eksik olabilir veya sonsuz döngü var).`,
        steps,
        diffs: []
      };
    }

    // 4. Assertions Evaluation
    const diffs: DiffItem[] = [];
    let allMatched = true;

    // Check Registers
    if (task.assertions.registers) {
      for (const [reg, expectedVal] of Object.entries(task.assertions.registers)) {
        const lower = reg.toLowerCase();
        let actualVal = 0;
        let is8Bit = false;

        if (lower === 'al') {
          actualVal = cpu.regs.ax & 0xFF;
          is8Bit = true;
        } else if (lower === 'ah') {
          actualVal = (cpu.regs.ax >> 8) & 0xFF;
          is8Bit = true;
        } else if (lower === 'bl') {
          actualVal = cpu.regs.bx & 0xFF;
          is8Bit = true;
        } else if (lower === 'bh') {
          actualVal = (cpu.regs.bx >> 8) & 0xFF;
          is8Bit = true;
        } else if (lower === 'cl') {
          actualVal = cpu.regs.cx & 0xFF;
          is8Bit = true;
        } else if (lower === 'ch') {
          actualVal = (cpu.regs.cx >> 8) & 0xFF;
          is8Bit = true;
        } else if (lower === 'dl') {
          actualVal = cpu.regs.dx & 0xFF;
          is8Bit = true;
        } else if (lower === 'dh') {
          actualVal = (cpu.regs.dx >> 8) & 0xFF;
          is8Bit = true;
        } else if (lower in cpu.regs) {
          actualVal = (cpu.regs as any)[lower];
        }

        const matched = actualVal === expectedVal;
        if (!matched) allMatched = false;

        const pad = is8Bit ? 2 : 4;
        diffs.push({
          target: reg.toUpperCase(),
          expected: expectedVal.toString(16).toUpperCase().padStart(pad, '0') + 'h',
          actual: actualVal.toString(16).toUpperCase().padStart(pad, '0') + 'h',
          matched
        });
      }
    }

    // Check Flags
    if (task.assertions.flags) {
      for (const [flag, expectedVal] of Object.entries(task.assertions.flags)) {
        const lower = flag.toLowerCase();
        const actualVal = (cpu.flags as any)[lower] ? 1 : 0;
        const matched = actualVal === expectedVal;
        if (!matched) allMatched = false;

        diffs.push({
          target: `FLAG ${flag.toUpperCase()}`,
          expected: expectedVal.toString(),
          actual: actualVal.toString(),
          matched
        });
      }
    }

    // Check Memory
    if (task.assertions.memory) {
      for (const memCheck of task.assertions.memory) {
        for (let i = 0; i < memCheck.expectedBytes.length; i++) {
          const off = memCheck.offset + i;
          const expByte = memCheck.expectedBytes[i];
          const actByte = cpu.mem.readByte(memCheck.segment, off);
          const matched = actByte === expByte;
          if (!matched) allMatched = false;

          diffs.push({
            target: `[${memCheck.segment.toString(16).toUpperCase()}:${off.toString(16).toUpperCase().padStart(4, '0')}h]`,
            expected: expByte.toString(16).toUpperCase().padStart(2, '0') + 'h',
            actual: actByte.toString(16).toUpperCase().padStart(2, '0') + 'h',
            matched
          });
        }
      }
    }

    if (!allMatched) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Beklenen değerler uyuşmadı. Lütfen aşağıdaki fark tablosunu inceleyin.',
        steps,
        diffs
      };
    }

    return {
      success: true,
      status: 'PASSED',
      message: `Tebrikler! Görev ${steps} adımda başarıyla tamamlandı.`,
      steps,
      diffs
    };
  }
}
