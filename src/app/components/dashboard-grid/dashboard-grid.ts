import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Equal-cell dashboard grid.
 * Children set `data-size` (sm | md | lg | wide | tall | hero) on their host.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-dashboard-grid',
  templateUrl: './dashboard-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGrid {}
