/**
 * Canonical chart scale — fluid width, aspect-locked height.
 * Keep in sync with `--chart-*` tokens in deml-ui `styles/tokens.css`.
 *
 * Height comes ONLY from aspect-ratio. Cap size via max-width
 * (`--chart-stage-max-inline`), never max-height that can squash plots.
 * SVG viewBox aspect must match `fullAspect` / `sparkAspect`.
 */
export const CHART_SCALE = {
  /** Full plot aspect (inline / block) — `--chart-aspect`. */
  fullAspect: 2.4,

  /** Spark shares the same aspect — `--chart-spark-aspect`. */
  sparkAspect: 2.4,

  /** SVG viewBox width — 360 / 150 = 2.4. */
  viewInline: 360,
  /** SVG viewBox height. */
  viewBlock: 150,

  /** Soft floor for plot block height (8px grid) — docs/compat. */
  minBlock: 160,
  /** Soft ceiling for plot block height (8px grid). */
  maxBlock: 320,
  /** Soft floor for spark height (8px grid). */
  sparkMinBlock: 96,
  /** Soft ceiling for spark height (8px grid) — matches `--chart-spark-max-block`. */
  sparkMaxBlock: 192,
} as const;

export type ChartScale = typeof CHART_SCALE;

/**
 * Series colors — deml-ui CSS custom properties only (palette roles).
 * Never invent chart hex in the Angular app.
 */
export const CHART_SERIES = {
  primary: 'var(--chart-series-1)',
  secondary: 'var(--chart-series-2)',
  success: 'var(--chart-series-3)',
  danger: 'var(--chart-series-4)',
  ink: 'var(--chart-series-ink)',
  paper: 'var(--chart-series-paper)',
} as const;

/** DashAccent → series token (CSS custom property). */
export const DASH_ACCENT_SERIES = {
  primary: CHART_SERIES.primary,
  gold: CHART_SERIES.success,
  red: CHART_SERIES.danger,
} as const;
