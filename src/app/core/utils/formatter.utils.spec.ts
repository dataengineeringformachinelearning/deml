import { describe, expect, it } from 'vitest';
import { formatLatencyMs, formatServiceName } from './formatter.utils';

describe('formatServiceName', () => {
  it('preserves human-authored acronyms', () => {
    expect(formatServiceName('DEML API')).toBe('DEML API');
  });

  it('still cleans legacy route-derived service names', () => {
    expect(formatServiceName('localhost:8000 - api v1 system status status pages')).toBe(
      'Status Pages',
    );
  });
});

describe('formatLatencyMs', () => {
  it('keeps missing or invalid telemetry visibly unavailable', () => {
    expect(formatLatencyMs(null)).toBe('—');
    expect(formatLatencyMs(undefined)).toBe('—');
    expect(formatLatencyMs(Number.NaN)).toBe('—');
  });

  it('preserves a measured zero and requested precision', () => {
    expect(formatLatencyMs(0)).toBe('0 ms');
    expect(formatLatencyMs(12.5, 2)).toBe('12.50 ms');
  });
});
