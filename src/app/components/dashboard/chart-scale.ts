/**
 * Canonical chart scale — fluid, aspect-locked plots.
 * Keep in sync with `--chart-*` tokens in `src/styles.css`.
 *
 * Charts fill their container width and derive height from aspect ratio
 * so they never squash, stretch, or sit as a tiny hardcoded box.
 * SVG viewBox aspect must match `fullAspect` / `sparkAspect`.
 */
export const CHART_SCALE = {
  /**
   * Full plot aspect (inline / block). Wide, readable band —
   * same visual language across area, bar, and metric panels.
   */
  fullAspect: 2.4,

  /** Spark shares the same aspect so trends match full plots. */
  sparkAspect: 2.4,

  /** SVG viewBox width — 360 / 150 = 2.4. */
  viewInline: 360,
  /** SVG viewBox height. */
  viewBlock: 150,

  /** Soft floor for plot block height (8px grid) — readability. */
  minBlock: 160,
  /** Soft ceiling for plot block height (8px grid) — avoids towering heroes. */
  maxBlock: 320,
  /** Soft floor for spark height (8px grid). */
  sparkMinBlock: 96,
  /** Soft ceiling for spark height (8px grid). */
  sparkMaxBlock: 200,
} as const;

export type ChartScale = typeof CHART_SCALE;
