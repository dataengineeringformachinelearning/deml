import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Bento-style grid for dashboard cards.
 * Children set `data-size` (sm | md | lg | wide | tall | hero) on their host.
 */
@Component({
  selector: 'app-dashboard-grid',
  templateUrl: './dashboard-grid.html',
  styleUrl: './dashboard-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGrid {}
