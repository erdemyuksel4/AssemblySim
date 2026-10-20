import { Memory, MemoryDiffEntry } from './memory.js';
import { Registers, RegisterState } from './registers.js';
import { Flags, FlagsState } from './flags.js';
import { Executor, StepResult } from './executor.js';

export interface CpuStepInfo {
  halted: boolean;
  error?: string;
  ipBefore: number;
  ipAfter: number;
  changedRegs: string[];
  changedFlags: string[];
  memReads: number[];
  memWrites: number[];
  consoleText?: string;
}

export interface CpuHistoryEntry {
  regs: RegisterState;
  flags: FlagsState;
  memChanges: MemoryDiffEntry[];
  consoleLength: number;
}

export class CPU {
  readonly mem: Memory;
  readonly regs: Registers;
  readonly flags: Flags;
  private executor: Executor;

  halted: boolean = false;
  lastError?: string;
  consoleBuffer: string = '';

  private history: CpuHistoryEntry[] = [];
  readonly maxHistory: number = 2000;

  constructor() {
    this.mem = new Memory();
    this.regs = new Registers();
    this.flags = new Flags();
    this.executor = new Executor(this.mem, this.regs, this.flags);
    this.reset();
  }

  reset(): void {
    this.mem.reset();
    this.regs.resetCOM();
    this.flags.reset();
    this.halted = false;
    this.lastError = undefined;
    this.consoleBuffer = '';
    this.history = [];
  }

  // Load a DOS COM binary at CS:0100h (or specified origin)
  loadCOM(bytes: Uint8Array | number[], origin: number = 0x0100): void {
    this.reset();
    this.mem.loadBytes(this.regs.cs, origin, bytes, 'code');
    this.regs.ip = origin;
  }

  // Single step execution
  step(): CpuStepInfo {
    if (this.halted || this.lastError) {
      return {
        halted: this.halted,
        error: this.lastError,
        ipBefore: this.regs.ip,
        ipAfter: this.regs.ip,
        changedRegs: [],
        changedFlags: [],
        memReads: [],
        memWrites: []
      };
    }

    // Capture state before step
    const oldRegs = this.regs.clone();
    const oldFlags = this.flags.clone();
    this.mem.clearAccessLogs();

    // Track memory writes by intercepting physically
    const writesBefore = new Map<number, number>();
    // We can record old values during write, but memory.lastWrites tells us which phys addresses were written
    const ipBefore = this.regs.ip;

    // Execute step
    const result = this.executor.executeStep();

    if (result.halted) this.halted = true;
    if (result.error) this.lastError = result.error;
    if (result.consoleText) {
      this.consoleBuffer += result.consoleText;
    }

    // Collect changed registers
    const changedRegs: string[] = [];
    if (this.regs.ax !== oldRegs.ax) {
      changedRegs.push('AX');
      if (this.regs.al !== (oldRegs.ax & 0xFF)) changedRegs.push('AL');
      if (this.regs.ah !== ((oldRegs.ax >> 8) & 0xFF)) changedRegs.push('AH');
    }
    if (this.regs.bx !== oldRegs.bx) {
      changedRegs.push('BX');
      if (this.regs.bl !== (oldRegs.bx & 0xFF)) changedRegs.push('BL');
      if (this.regs.bh !== ((oldRegs.bx >> 8) & 0xFF)) changedRegs.push('BH');
    }
    if (this.regs.cx !== oldRegs.cx) {
      changedRegs.push('CX');
      if (this.regs.cl !== (oldRegs.cx & 0xFF)) changedRegs.push('CL');
      if (this.regs.ch !== ((oldRegs.cx >> 8) & 0xFF)) changedRegs.push('CH');
    }
    if (this.regs.dx !== oldRegs.dx) {
      changedRegs.push('DX');
      if (this.regs.dl !== (oldRegs.dx & 0xFF)) changedRegs.push('DL');
      if (this.regs.dh !== ((oldRegs.dx >> 8) & 0xFF)) changedRegs.push('DH');
    }
    if (this.regs.si !== oldRegs.si) changedRegs.push('SI');
    if (this.regs.di !== oldRegs.di) changedRegs.push('DI');
    if (this.regs.bp !== oldRegs.bp) changedRegs.push('BP');
    if (this.regs.sp !== oldRegs.sp) changedRegs.push('SP');
    if (this.regs.ip !== oldRegs.ip) changedRegs.push('IP');
    if (this.regs.cs !== oldRegs.cs) changedRegs.push('CS');
    if (this.regs.ds !== oldRegs.ds) changedRegs.push('DS');
    if (this.regs.es !== oldRegs.es) changedRegs.push('ES');
    if (this.regs.ss !== oldRegs.ss) changedRegs.push('SS');

    // Collect changed flags
    const changedFlags: string[] = [];
    if (this.flags.cf !== oldFlags.cf) changedFlags.push('CF');
    if (this.flags.pf !== oldFlags.pf) changedFlags.push('PF');
    if (this.flags.af !== oldFlags.af) changedFlags.push('AF');
    if (this.flags.zf !== oldFlags.zf) changedFlags.push('ZF');
    if (this.flags.sf !== oldFlags.sf) changedFlags.push('SF');
    if (this.flags.of !== oldFlags.of) changedFlags.push('OF');
    if (this.flags.df !== oldFlags.df) changedFlags.push('DF');
    if (this.flags.if !== oldFlags.if) changedFlags.push('IF');

    // Collect memory writes
    const memWritesList = Array.from(this.mem.lastWrites);
    const memReadsList = Array.from(this.mem.lastReads);

    // Save history diff entry for Step Back
    const memChanges: MemoryDiffEntry[] = [];
    for (const phys of memWritesList) {
      const oldVal = this.mem.lastWriteOldValues.get(phys) ?? 0;
      memChanges.push({
        physAddr: phys,
        oldVal,
        newVal: this.mem.data[phys]
      });
    }

    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    this.history.push({
      regs: oldRegs,
      flags: oldFlags,
      memChanges,
      consoleLength: this.consoleBuffer.length
    });

    return {
      halted: this.halted,
      error: this.lastError,
      ipBefore,
      ipAfter: this.regs.ip,
      changedRegs,
      changedFlags,
      memReads: memReadsList,
      memWrites: memWritesList,
      consoleText: result.consoleText
    };
  }

  // Step back to previous state
  stepBack(): boolean {
    if (this.history.length === 0) return false;
    const entry = this.history.pop()!;

    // Restore registers and flags
    this.regs.restore(entry.regs);
    this.flags.restore(entry.flags);

    // Restore memory cells
    for (const change of entry.memChanges) {
      this.mem.writePhys(change.physAddr, change.oldVal);
    }

    // Restore console buffer
    this.consoleBuffer = this.consoleBuffer.slice(0, entry.consoleLength);

    this.halted = false;
    this.lastError = undefined;
    this.mem.clearAccessLogs();
    return true;
  }

  canStepBack(): boolean {
    return this.history.length > 0;
  }

  // Run for a given chunk of steps (for non-blocking UI run)
  runChunk(maxSteps: number): { stepsExecuted: number; halted: boolean; error?: string } {
    let steps = 0;
    while (steps < maxSteps && !this.halted && !this.lastError) {
      this.step();
      steps++;
    }
    return {
      stepsExecuted: steps,
      halted: this.halted,
      error: this.lastError
    };
  }
}
