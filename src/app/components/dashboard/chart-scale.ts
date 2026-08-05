// CHART RULES LOCKED: height fixed, width 100%, shared global scale – DO NOT CHANGE
/**
 * Canonical chart scale — fixed stage heights, fluid width, shared y-domain.
 * Keep in sync with `--chart-height-*` / `--chart-stage-ink` in deml-ui tokens.
 *
 * Height is ONLY from CSS tokens (140 spark / 280 panel). Width is always 100%.
 * Never size from data, aspect, or per-chart nice domains.
 */

export const CHART_SCALE = {
  /** Spark / stat plot stage height (px) — `--chart-height-spark`. */
  sparkHeight: 140,
  /** Full / panel plot stage height (px) — `--chart-height-panel`. */
  panelHeight: 280,

  /** SVG viewBox width (coordinate space only; CSS owns display size). */
  viewInline: 360,
  /** SVG viewBox height (coordinate space only). */
  viewBlock: 150,

  /**
   * Spark viewBox — ~4:1 to match md tile width × 140px stage so
   * preserveAspectRatio=none does not flatten the series.
   */
  sparkViewInline: 560,
  sparkViewBlock: 140,

  /** @deprecated Compat — fixed heights supersede aspect. */
  fullAspect: 2.4,
  /** @deprecated Compat — fixed heights supersede aspect. */
  sparkAspect: 2.4,
  /** @deprecated Use panelHeight. */
  minBlock: 280,
  /** @deprecated Use panelHeight. */
  maxBlock: 280,
  /** @deprecated Use sparkHeight. */
  sparkMinBlock: 140,
  /** @deprecated Use sparkHeight. */
  sparkMaxBlock: 140,
} as const;

export type ChartScale = typeof CHART_SCALE;

/** Shared y-domain for every line chart on a board. */
export type ChartDomain = {
  readonly min: number;
  readonly max: number;
};

type ValuePoint = { readonly value: number };

/**
 * Global min/max across all series on a board.
 * Safe floor when min === max so a flat series still paints.
 * Every line chart on the board MUST use this domain — never local auto-scale.
 */
export function computeSharedDomain(
  seriesList: readonly (readonly ValuePoint[])[],
): ChartDomain {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const series of seriesList) {
    for (const point of series) {
      const v = point.value;
      if (!Number.isFinite(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }

  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.05 || 1;
    return { min: min - pad, max: max + pad };
  }

  return { min, max };
}

/**
 * Map a value onto the shared domain into a viewBox y (padT → floor).
 * Higher values → smaller y (SVG).
 */
export function mapValueToY(
  value: number,
  domain: ChartDomain,
  padT: number,
  innerH: number,
): number {
  const span = domain.max - domain.min || 1;
  const t = (value - domain.min) / span;
  return padT + innerH - t * innerH;
}

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
