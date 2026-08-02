import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

import { CHART_SCALE } from '../dashboard/chart-scale';
import type { DashAccent, DashPoint } from '../dashboard/dashboard.types';

/** SVG viewBox — aspect locked to CHART_SCALE.fullAspect (360/150 = 2.4). */
const VIEW_W = CHART_SCALE.viewInline;
const VIEW_H = CHART_SCALE.viewBlock;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

let areaChartSeq = 0;

export type AreaChartVariant = 'full' | 'spark';

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

  readonly accent = input<DashAccent>('primary');

  /** `full` = labelled plot; `spark` = compact sparkline. */
  readonly variant = input<AreaChartVariant>('full');

  readonly ariaLabel = input('Area chart');

  readonly viewBox = `0 0 ${VIEW_W} ${VIEW_H}`;
  readonly viewRight = VIEW_W - PAD_R;
  readonly axisLabelY = VIEW_H - 8;

  /** Full and spark plots always meet — never stretch the series. */
  readonly preserveAspectRatio = 'xMidYMid meet' as const;

  readonly plot = computed(() => {
    const pts = this.points();
    const isSpark = this.variant() === 'spark';
    const padL = isSpark ? 4 : PAD_L;
    const padR = isSpark ? 4 : PAD_R;
    const padT = isSpark ? 8 : PAD_T;
    const padB = isSpark ? 8 : PAD_B;

    if (pts.length === 0) {
      return {
        line: '',
        area: '',
        baselineY: VIEW_H / 2,
        nodes: [] as { x: number; y: number; label: string }[],
        gridXs: [] as number[],
        yTop: '',
        yBottom: '',
        showAxes: false,
        padL,
        floorY: VIEW_H - padB,
        nodeRadius: isSpark ? 2.25 : 3.5,
      };
    }

    const values = pts.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerW = VIEW_W - padL - padR;
    const innerH = VIEW_H - padT - padB;
    const step = pts.length === 1 ? 0 : innerW / (pts.length - 1);
    const baselineY = padT + innerH / 2;

    const nodes = pts.map((p, i) => {
      const x = padL + step * i;
      const y = padT + innerH - ((p.value - min) / range) * innerH;
      return { x, y, label: p.label };
    });

    const line = nodes
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
      .join(' ');
    const last = nodes[nodes.length - 1];
    const first = nodes[0];
    const floorY = padT + innerH;
    const area = `${line} L${last.x.toFixed(2)},${floorY.toFixed(2)} L${first.x.toFixed(2)},${floorY.toFixed(2)} Z`;

    return {
      line,
      area,
      baselineY,
      nodes,
      gridXs: nodes.map((n) => n.x),
      yTop: max.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      yBottom: min.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      showAxes: !isSpark,
      padL,
      floorY,
      nodeRadius: isSpark ? 2.25 : 3.5,
    };
  });
}
