import { describe, it, expect } from 'vitest';
import { getSpeedDelayMs, ExecutionSpeed } from '../src/ui/main';

describe('Execution Speed Settings', () => {
  it('returns 600ms for 0.5x speed', () => {
    expect(getSpeedDelayMs('0.5')).toBe(600);
  });

  it('returns 300ms for 1x speed', () => {
    expect(getSpeedDelayMs('1')).toBe(300);
  });

  it('returns 100ms for 2x speed', () => {
    expect(getSpeedDelayMs('2')).toBe(100);
  });

  it('returns 10ms for max speed (100 lines/sec)', () => {
    const delay = getSpeedDelayMs('max');
    expect(delay).toBe(10);
    // 1000ms divided by delay gives 100 lines per second
    expect(1000 / delay).toBe(100);
  });

  it('defaults to 300ms for unknown speed', () => {
    expect(getSpeedDelayMs('unknown' as ExecutionSpeed)).toBe(300);
  });
});
