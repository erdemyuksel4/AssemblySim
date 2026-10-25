import { CPU } from '../cpu/cpu.js';
import { Assembler } from '../assembler/assembler.js';
import { 
  Challenge, 
  GradingResult, 
  AssertionDiff, 
  RegisterExpectations, 
  FlagExpectations,
  ChallengeTestSetup
} from './types.js';

export class ChallengeRunner {
  static grade(challenge: Challenge, userSourceCode: string): GradingResult {
    const startTime = performance.now();

    // 1. Compilation Phase
    const asmResult = Assembler.assemble(userSourceCode);
    if (asmResult.errors && asmResult.errors.length > 0) {
      const err = asmResult.errors[0];
      return {
        status: 'COMPILE_ERROR',
        success: false,
        stepCount: 0,
        diffs: [],
        compileError: { line: err.line, message: err.message },
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }

    if (asmResult.bytes.length === 0) {
      return {
        status: 'COMPILE_ERROR',
        success: false,
        stepCount: 0,
        diffs: [],
        compileError: { line: 1, message: 'Derleyici herhangi bir makine kodu baytı üretemedi.' },
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }

    // 2. Sandbox CPU Provisioning
    const sandboxCpu = new CPU();
    const setup = challenge.testSetup || {};

    // Load assembled machine code at origin first (loadCOM resets CPU state)
    sandboxCpu.loadCOM(asmResult.bytes, asmResult.origin);
    this.applySetup(sandboxCpu, setup);

    // 3. Guarded Step Loop
    const maxSteps = challenge.assertions.maxSteps || 5000;
    let steps = 0;
    let runtimeError: string | undefined;

    while (!sandboxCpu.halted && steps < maxSteps) {
      const stepInfo = sandboxCpu.step();
      steps++;

      if (stepInfo.error) {
        runtimeError = stepInfo.error;
        break;
      }

      if (stepInfo.waitingForInput && !sandboxCpu.io.hasInput()) {
        runtimeError = 'Girdi bekleme zaman aşımı (I/O kuyruğunda girdi kalmadı).';
        break;
      }
    }

    const executionTimeMs = Math.round(performance.now() - startTime);

    if (runtimeError) {
      return {
        status: 'RUNTIME_ERROR',
        success: false,
        stepCount: steps,
        diffs: [],
        runtimeError,
        executionTimeMs
      };
    }

    if (!sandboxCpu.halted && steps >= maxSteps) {
      return {
        status: 'TIMEOUT',
        success: false,
        stepCount: steps,
        diffs: [{
          target: 'Döngü Sınırı',
          expected: `${maxSteps} adımdan önce HLT`,
          actual: `${maxSteps} adım aşıldı`,
          passed: false,
          message: 'Kod maksimum adım sınırında durduruldu. Sonsuz döngü kontrolü yapın ve program sonuna HLT ekleyin.'
        }],
        executionTimeMs
      };
    }

    // 4. Assertion Evaluation
    const diffs: AssertionDiff[] = [];
    const assertions = challenge.assertions;

    // Evaluate Registers
    if (assertions.expectedRegisters) {
      diffs.push(...this.evaluateRegisters(sandboxCpu, assertions.expectedRegisters));
    }

    // Evaluate Flags
    if (assertions.expectedFlags) {
      diffs.push(...this.evaluateFlags(sandboxCpu, assertions.expectedFlags));
    }

    // Evaluate Memory
    if (assertions.expectedMemory && assertions.expectedMemory.length > 0) {
      for (const memExp of assertions.expectedMemory) {
        const actualBytes: number[] = [];
        for (let i = 0; i < memExp.expectedBytes.length; i++) {
          actualBytes.push(sandboxCpu.mem.readByte(memExp.segment, memExp.offset + i, false));
        }

        const matches = actualBytes.every((b, idx) => b === memExp.expectedBytes[idx]);
        const formatHexArr = (arr: number[]) => '[' + arr.map(x => x.toString(16).toUpperCase().padStart(2, '0') + 'h').join(', ') + ']';

        diffs.push({
          target: memExp.label || `Bellek ${memExp.segment.toString(16).toUpperCase()}:${memExp.offset.toString(16).toUpperCase()}h`,
          expected: formatHexArr(memExp.expectedBytes),
          actual: formatHexArr(actualBytes),
          passed: matches,
          message: matches ? undefined : 'Bellek hücrelerindeki değerler beklenen bayt dizisi ile uyuşmuyor.'
        });
      }
    }

    // Evaluate I/O Ports
    if (assertions.expectedPorts) {
      for (const [portStr, expVal] of Object.entries(assertions.expectedPorts)) {
        const portNum = Number(portStr) & 0xFFFF;
        const actVal = sandboxCpu.io.readByte(portNum);
        const passed = (actVal & 0xFF) === (expVal & 0xFF);
        const fmtHex = (n: number) => n.toString(16).toUpperCase().padStart(2, '0') + 'h (' + n + ')';
        diffs.push({
          target: `I/O Port [${portNum.toString(16).toUpperCase().padStart(2, '0')}h]`,
          expected: fmtHex(expVal & 0xFF),
          actual: fmtHex(actVal & 0xFF),
          passed,
          message: passed ? undefined : `Port ${portNum.toString(16).toUpperCase()}h değeri beklenen bayt ile uyuşmuyor.`
        });
      }
    }

    // Evaluate Console Output
    if (assertions.expectedConsole) {
      const actualConsole = sandboxCpu.consoleBuffer;
      if (assertions.expectedConsole.exactMatch !== undefined) {
        const matches = actualConsole === assertions.expectedConsole.exactMatch;
        diffs.push({
          target: 'Terminal Konsol Çıktısı',
          expected: JSON.stringify(assertions.expectedConsole.exactMatch),
          actual: JSON.stringify(actualConsole),
          passed: matches,
          message: matches ? undefined : 'Konsola yazılan metin beklenen metin ile birebir eşleşmiyor.'
        });
      } else if (assertions.expectedConsole.contains !== undefined) {
        const matches = actualConsole.includes(assertions.expectedConsole.contains);
        diffs.push({
          target: 'Terminal Konsol Çıktısı (İçerik)',
          expected: `"${assertions.expectedConsole.contains}" içermeli`,
          actual: JSON.stringify(actualConsole),
          passed: matches,
          message: matches ? undefined : 'Konsol çıktısı beklenen dizeyi içermiyor.'
        });
      }
    }

    const allPassed = diffs.length > 0 ? diffs.every(d => d.passed) : true;

    return {
      status: allPassed ? 'PASSED' : 'FAILED',
      success: allPassed,
      stepCount: steps,
      diffs,
      executionTimeMs
    };
  }

  static applySetup(cpu: CPU, setup: ChallengeTestSetup): void {
    // Load initial memory bytes if specified
    if (setup.initialMemory && setup.initialMemory.length > 0) {
      for (const m of setup.initialMemory) {
        cpu.mem.loadBytes(m.segment, m.offset, m.bytes, 'data');
      }
    }

    // Set initial registers (after loadCOM so they aren't reset)
    if (setup.initialRegisters) {
      this.applyRegisterExpectations(cpu, setup.initialRegisters);
    }

    // Set initial flags (after loadCOM)
    if (setup.initialFlags) {
      this.applyFlagExpectations(cpu, setup.initialFlags);
    }

    // Set initial I/O ports (after loadCOM)
    if (setup.initialPorts) {
      for (const [portStr, val] of Object.entries(setup.initialPorts)) {
        cpu.io.writeByte(Number(portStr) & 0xFFFF, val & 0xFF);
      }
    }

    // Feed simulated input queue (after loadCOM)
    if (setup.inputQueue) {
      cpu.feedInput(setup.inputQueue);
    }
  }

  private static applyRegisterExpectations(cpu: CPU, regs: RegisterExpectations): void {
    if (regs.ax !== undefined) cpu.regs.ax = regs.ax & 0xFFFF;
    if (regs.bx !== undefined) cpu.regs.bx = regs.bx & 0xFFFF;
    if (regs.cx !== undefined) cpu.regs.cx = regs.cx & 0xFFFF;
    if (regs.dx !== undefined) cpu.regs.dx = regs.dx & 0xFFFF;
    if (regs.si !== undefined) cpu.regs.si = regs.si & 0xFFFF;
    if (regs.di !== undefined) cpu.regs.di = regs.di & 0xFFFF;
    if (regs.bp !== undefined) cpu.regs.bp = regs.bp & 0xFFFF;
    if (regs.sp !== undefined) cpu.regs.sp = regs.sp & 0xFFFF;
    if (regs.cs !== undefined) cpu.regs.cs = regs.cs & 0xFFFF;
    if (regs.ds !== undefined) cpu.regs.ds = regs.ds & 0xFFFF;
    if (regs.ss !== undefined) cpu.regs.ss = regs.ss & 0xFFFF;
    if (regs.es !== undefined) cpu.regs.es = regs.es & 0xFFFF;

    if (regs.al !== undefined) cpu.regs.al = regs.al & 0xFF;
    if (regs.ah !== undefined) cpu.regs.ah = regs.ah & 0xFF;
    if (regs.bl !== undefined) cpu.regs.bl = regs.bl & 0xFF;
    if (regs.bh !== undefined) cpu.regs.bh = regs.bh & 0xFF;
    if (regs.cl !== undefined) cpu.regs.cl = regs.cl & 0xFF;
    if (regs.ch !== undefined) cpu.regs.ch = regs.ch & 0xFF;
    if (regs.dl !== undefined) cpu.regs.dl = regs.dl & 0xFF;
    if (regs.dh !== undefined) cpu.regs.dh = regs.dh & 0xFF;
  }

  private static applyFlagExpectations(cpu: CPU, flags: FlagExpectations): void {
    if (flags.cf !== undefined) cpu.flags.cf = flags.cf !== 0;
    if (flags.zf !== undefined) cpu.flags.zf = flags.zf !== 0;
    if (flags.sf !== undefined) cpu.flags.sf = flags.sf !== 0;
    if (flags.of !== undefined) cpu.flags.of = flags.of !== 0;
    if (flags.pf !== undefined) cpu.flags.pf = flags.pf !== 0;
    if (flags.af !== undefined) cpu.flags.af = flags.af !== 0;
    if (flags.df !== undefined) cpu.flags.df = flags.df !== 0;
  }

  private static evaluateRegisters(cpu: CPU, expected: RegisterExpectations): AssertionDiff[] {
    const diffs: AssertionDiff[] = [];
    const fmt16 = (n: number) => n.toString(16).toUpperCase().padStart(4, '0') + 'h (' + n + ')';
    const fmt8 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0') + 'h (' + n + ')';

    // 16-bit checks
    const check16 = (name: string, expVal: number | undefined, actVal: number) => {
      if (expVal !== undefined) {
        const passed = (actVal & 0xFFFF) === (expVal & 0xFFFF);
        diffs.push({
          target: `Yazmaç ${name}`,
          expected: fmt16(expVal & 0xFFFF),
          actual: fmt16(actVal & 0xFFFF),
          passed,
          message: passed ? undefined : `${name} yazmacı beklenen değer ile uyuşmuyor.`
        });
      }
    };

    // 8-bit checks
    const check8 = (name: string, expVal: number | undefined, actVal: number) => {
      if (expVal !== undefined) {
        const passed = (actVal & 0xFF) === (expVal & 0xFF);
        diffs.push({
          target: `Yazmaç ${name}`,
          expected: fmt8(expVal & 0xFF),
          actual: fmt8(actVal & 0xFF),
          passed,
          message: passed ? undefined : `${name} yazmacı beklenen değer ile uyuşmuyor.`
        });
      }
    };

    check16('AX', expected.ax, cpu.regs.ax);
    check16('BX', expected.bx, cpu.regs.bx);
    check16('CX', expected.cx, cpu.regs.cx);
    check16('DX', expected.dx, cpu.regs.dx);
    check16('SI', expected.si, cpu.regs.si);
    check16('DI', expected.di, cpu.regs.di);
    check16('BP', expected.bp, cpu.regs.bp);
    check16('SP', expected.sp, cpu.regs.sp);
    check16('CS', expected.cs, cpu.regs.cs);
    check16('DS', expected.ds, cpu.regs.ds);
    check16('SS', expected.ss, cpu.regs.ss);
    check16('ES', expected.es, cpu.regs.es);

    check8('AL', expected.al, cpu.regs.al);
    check8('AH', expected.ah, cpu.regs.ah);
    check8('BL', expected.bl, cpu.regs.bl);
    check8('BH', expected.bh, cpu.regs.bh);
    check8('CL', expected.cl, cpu.regs.cl);
    check8('CH', expected.ch, cpu.regs.ch);
    check8('DL', expected.dl, cpu.regs.dl);
    check8('DH', expected.dh, cpu.regs.dh);

    return diffs;
  }

  private static evaluateFlags(cpu: CPU, expected: FlagExpectations): AssertionDiff[] {
    const diffs: AssertionDiff[] = [];
    const checkFlag = (name: string, expVal: number | undefined, actBool: boolean, meaning0: string, meaning1: string) => {
      if (expVal !== undefined) {
        const expBit = expVal ? 1 : 0;
        const actBit = actBool ? 1 : 0;
        const passed = expBit === actBit;
        diffs.push({
          target: `Bayrak ${name}`,
          expected: `${expBit} (${expBit ? meaning1 : meaning0})`,
          actual: `${actBit} (${actBit ? meaning1 : meaning0})`,
          passed,
          message: passed ? undefined : `${name} bayrağı beklenen durumda değil.`
        });
      }
    };

    checkFlag('CF (Carry)', expected.cf, cpu.flags.cf, 'Elde Yok', 'Elde Var');
    checkFlag('ZF (Zero)', expected.zf, cpu.flags.zf, 'Sıfırdan Farklı', 'Sıfır Sonuç');
    checkFlag('SF (Sign)', expected.sf, cpu.flags.sf, 'Pozitif', 'Negatif');
    checkFlag('OF (Overflow)', expected.of, cpu.flags.of, 'Taşma Yok', 'Taşma Var');
    checkFlag('PF (Parity)', expected.pf, cpu.flags.pf, 'Tek Parite', 'Çift Parite');
    checkFlag('AF (Auxiliary)', expected.af, cpu.flags.af, 'Yardımcı Elde Yok', 'Yardımcı Elde Var');
    checkFlag('DF (Direction)', expected.df, cpu.flags.df, 'İleri (CLD)', 'Geri (STD)');

    return diffs;
  }
}
