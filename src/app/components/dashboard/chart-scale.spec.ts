import { CHART_SCALE } from './chart-scale';

describe('CHART_SCALE', () => {
  it('keeps full and spark aspects aligned for a consistent look', () => {
    expect(CHART_SCALE.fullAspect).toBe(2.4);
    expect(CHART_SCALE.sparkAspect).toBe(CHART_SCALE.fullAspect);
  });

  it('keeps SVG viewBox on the same aspect as the full plot', () => {
    expect(CHART_SCALE.viewInline / CHART_SCALE.viewBlock).toBeCloseTo(CHART_SCALE.fullAspect, 5);
  });

  it('keeps block floors and ceilings on the 8px grid', () => {
    expect(CHART_SCALE.minBlock % 8).toBe(0);
    expect(CHART_SCALE.maxBlock % 8).toBe(0);
    expect(CHART_SCALE.sparkMinBlock % 8).toBe(0);
    expect(CHART_SCALE.sparkMaxBlock % 8).toBe(0);
    expect(CHART_SCALE.minBlock).toBeLessThan(CHART_SCALE.maxBlock);
    expect(CHART_SCALE.sparkMinBlock).toBeLessThan(CHART_SCALE.sparkMaxBlock);
  });
});
