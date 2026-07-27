import { describe, expect, it } from 'vitest';
import {
  formatCesPercent,
  formatCesScore,
  resolveCesTelemetry,
} from './ces-telemetry.util';

describe('CES telemetry normalization', () => {
  it('preserves missing probe telemetry as unavailable', () => {
    expect(resolveCesTelemetry(undefined)).toEqual({
      level: null,
      sla: null,
      stability: null,
    });
    expect(resolveCesTelemetry({ level: null, sla: null, stability: null })).toEqual({
      level: null,
      sla: null,
      stability: null,
    });
  });

  it('preserves measured numeric zeroes', () => {
    expect(resolveCesTelemetry({ level: 0, sla: 0, stability: 0 })).toEqual({
      level: 0,
      sla: 0,
      stability: 0,
    });
    expect(formatCesScore(0)).toBe('0');
    expect(formatCesPercent(0)).toBe('0%');
  });

  it('renders unavailable values as an em dash and clears degraded telemetry', () => {
    expect(formatCesScore(null)).toBe('—');
    expect(formatCesPercent(undefined)).toBe('—');
    expect(
      resolveCesTelemetry({ level: 87, sla: 99, stability: 91 }, true),
    ).toEqual({
      level: null,
      sla: null,
      stability: null,
    });
  });
});
