// CHART RULES LOCKED: height fixed, width 100%, shared global scale – DO NOT CHANGE
import {
  CHART_SCALE,
  CHART_SERIES,
  DASH_ACCENT_SERIES,
  computeSharedDomain,
  mapValueToY,
} from './chart-scale';

describe('CHART_SCALE', () => {
  it('locks fixed spark and panel heights (140 / 280)', () => {
    expect(CHART_SCALE.sparkHeight).toBe(140);
    expect(CHART_SCALE.panelHeight).toBe(280);
  });

  it('keeps SVG viewBox as coordinate space only', () => {
    expect(CHART_SCALE.viewInline).toBe(360);
    expect(CHART_SCALE.viewBlock).toBe(150);
  });

  it('maps series and accents to deml-ui palette tokens only', () => {
    expect(CHART_SERIES.primary).toBe('var(--chart-series-1)');
    expect(CHART_SERIES.secondary).toBe('var(--chart-series-2)');
    expect(CHART_SERIES.success).toBe('var(--chart-series-3)');
    expect(CHART_SERIES.danger).toBe('var(--chart-series-4)');
    expect(DASH_ACCENT_SERIES.primary).toBe(CHART_SERIES.primary);
    expect(DASH_ACCENT_SERIES.gold).toBe(CHART_SERIES.success);
    expect(DASH_ACCENT_SERIES.red).toBe(CHART_SERIES.danger);
  });
});

describe('computeSharedDomain', () => {
  it('uses global min/max across all series', () => {
    const domain = computeSharedDomain([
      [{ value: 32 }, { value: 70 }],
      [{ value: 1200 }, { value: 2510 }],
    ]);
    expect(domain).toEqual({ min: 32, max: 2510 });
  });

  it('applies a safe floor when min === max', () => {
    const domain = computeSharedDomain([[{ value: 50 }, { value: 50 }]]);
    expect(domain.min).toBeLessThan(50);
    expect(domain.max).toBeGreaterThan(50);
  });

  it('maps values onto the shared domain into viewBox y', () => {
    const domain = { min: 1200, max: 2510 };
    const top = mapValueToY(2510, domain, 14, 110);
    const bottom = mapValueToY(1200, domain, 14, 110);
    expect(top).toBeCloseTo(14, 5);
    expect(bottom).toBeCloseTo(124, 5);
  });
});
