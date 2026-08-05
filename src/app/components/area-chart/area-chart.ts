// CHART RULES LOCKED: height fixed, width 100%, shared global scale – DO NOT CHANGE
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

import {
  CHART_SCALE,
  type ChartDomain,
  computeSharedDomain,
  mapValueToY,
} from '../dashboard/chart-scale';
import type { DashAccent, DashPoint } from '../dashboard/dashboard.types';

/** SVG viewBox — display size is CSS-fixed (140 spark / 280 panel); width 100%. */
const VIEW_W = CHART_SCALE.viewInline;
const VIEW_H = CHART_SCALE.viewBlock;
/**
 * Spark viewBox ~4:1 matches typical md tile width × 140px height so
 * preserveAspectRatio=none does not flatten slopes horizontally.
 */
const SPARK_VIEW_W = CHART_SCALE.sparkViewInline;
const SPARK_VIEW_H = CHART_SCALE.sparkViewBlock;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

let areaChartSeq = 0;

export type AreaChartVariant = 'full' | 'spark';

type PlotNode = { x: number; y: number; label: string };

/** Catmull-Rom → cubic bezier path (smooth activity-graph curve). */
function smoothLinePath(nodes: readonly PlotNode[]): string {
  if (nodes.length === 0) return '';
  if (nodes.length === 1) {
    return `M${nodes[0].x.toFixed(2)},${nodes[0].y.toFixed(2)}`;
  }
  if (nodes.length === 2) {
    return `M${nodes[0].x.toFixed(2)},${nodes[0].y.toFixed(2)} L${nodes[1].x.toFixed(2)},${nodes[1].y.toFixed(2)}`;
  }

  let d = `M${nodes[0].x.toFixed(2)},${nodes[0].y.toFixed(2)}`;
  for (let i = 0; i < nodes.length - 1; i++) {
    const p0 = nodes[i === 0 ? 0 : i - 1];
    const p1 = nodes[i];
    const p2 = nodes[i + 1];
    const p3 = nodes[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-area-chart',
  templateUrl: './area-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-accent]': 'accent()',
    '[attr.data-variant]': 'variant()',
  },
})
export class AreaChart {
  readonly gradientId = `area-chart-grad-${++areaChartSeq}`;
  readonly glowId = `area-chart-glow-${areaChartSeq}`;

  /** Series points plotted left → right. */
  readonly points = input.required<readonly DashPoint[]>();

  /**
   * Shared board y-domain. When omitted, falls back to this series only
   * (tests); production boards MUST pass computeSharedDomain(...).
   */
  readonly domain = input<ChartDomain | null>(null);

  readonly accent = input<DashAccent>('primary');

  /** `full` = labelled activity graph; `spark` = compact sparkline. */
  readonly variant = input<AreaChartVariant>('full');

  readonly ariaLabel = input('Area chart');

  readonly viewBox = computed(() => {
    if (this.variant() === 'spark') {
      return `0 0 ${SPARK_VIEW_W} ${SPARK_VIEW_H}`;
    }
    return `0 0 ${VIEW_W} ${VIEW_H}`;
  });

  readonly viewRight = computed(() =>
    this.variant() === 'spark' ? SPARK_VIEW_W - 4 : VIEW_W - PAD_R,
  );

  readonly axisLabelY = computed(() =>
    this.variant() === 'spark' ? SPARK_VIEW_H - 4 : VIEW_H - 8,
  );

  /**
   * Stretch to the fixed CSS stage so width is fluid and height stays locked.
   * Y mapping uses the shared domain — never local auto-scale.
   */
  readonly preserveAspectRatio = 'none' as const;

  readonly plot = computed(() => {
    const pts = this.points();
    const isSpark = this.variant() === 'spark';
    const viewW = isSpark ? SPARK_VIEW_W : VIEW_W;
    const viewH = isSpark ? SPARK_VIEW_H : VIEW_H;
    const padL = isSpark ? 4 : PAD_L;
    const padR = isSpark ? 4 : PAD_R;
    const padT = isSpark ? 8 : PAD_T;
    const padB = isSpark ? 8 : PAD_B;
    const innerW = viewW - padL - padR;
    const innerH = viewH - padT - padB;
    const floorY = padT + innerH;

    const resolvedDomain =
      this.domain() ?? computeSharedDomain(pts.length ? [pts] : []);

    if (pts.length === 0) {
      return {
        line: '',
        area: '',
        baselineY: viewH / 2,
        nodes: [] as PlotNode[],
        gridXs: [] as number[],
        yTop: '',
        yBottom: '',
        showAxes: false,
        showGrid: false,
        padL,
        floorY,
        nodeRadius: isSpark ? 2.25 : 3.5,
      };
    }

    const step = pts.length === 1 ? 0 : innerW / (pts.length - 1);
    const baselineY = padT + innerH / 2;

    const nodes: PlotNode[] = pts.map((p, i) => {
      const x = padL + step * i;
      const y = mapValueToY(p.value, resolvedDomain, padT, innerH);
      return { x, y, label: p.label };
    });

    const line = smoothLinePath(nodes);
    const last = nodes[nodes.length - 1];
    const first = nodes[0];
    const area = `${line} L${last.x.toFixed(2)},${floorY.toFixed(2)} L${first.x.toFixed(2)},${floorY.toFixed(2)} Z`;

    return {
      line,
      area,
      baselineY,
      nodes,
      gridXs: isSpark ? [] : nodes.map((n) => n.x),
      yTop: resolvedDomain.max.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      yBottom: resolvedDomain.min.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      }),
      showAxes: !isSpark,
      showGrid: !isSpark,
      padL,
      floorY,
      nodeRadius: isSpark ? 2.25 : 3.5,
    };
  });
}
