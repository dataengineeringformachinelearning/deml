import { describe, expect, it } from 'vitest';

import { measuredMetricPoints } from './chart-data.util';

describe('measuredMetricPoints', () => {
  it('drops missing observations while keeping values aligned with their labels', () => {
    const measured = measuredMetricPoints(
      [
        { label: '10:00', latency: 0 },
        { label: '11:00', latency: null },
        { label: '12:00', latency: 12.5 },
        { label: '13:00', latency: Number.NaN },
      ],
      point => point.latency,
    );

    expect(measured.map(({ point }) => point.label)).toEqual(['10:00', '12:00']);
    expect(measured.map(({ value }) => value)).toEqual([0, 12.5]);
  });
});
