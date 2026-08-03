import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import type { DashTile } from '../../data/dashboard';
import { STATUS_SERVICES, STATUS_UPTIME_SPARK } from '../../data/status';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-isolated-status',
  imports: [Banner, Button, ButtonGroup, PageSection, SectionHeader, TileBoard],
  templateUrl: './isolated-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsolatedStatus implements OnInit {
  private readonly monitor = inject(MonitorService);
  private readonly route = inject(ActivatedRoute);
  readonly slug = signal('');
  readonly note = signal('Isolated status view for a single surface.');

  readonly tiles = computed((): readonly DashTile[] => {
    const label = this.slug() || 'Surface';
    return [
      {
        kind: 'stat',
        id: 'surface',
        size: 'sm',
        accent: 'primary',
        label: 'Surface',
        value: label.length > 12 ? `${label.slice(0, 12)}…` : label || 'Detail',
        meta: 'Public status page',
      },
      {
        kind: 'stat',
        id: 'health',
        size: 'sm',
        accent: 'gold',
        label: 'Health',
        value: 'Up',
        meta: 'Last probe',
        sparkline: STATUS_UPTIME_SPARK,
      },
      {
        kind: 'stat',
        id: 'source',
        size: 'sm',
        accent: 'red',
        label: 'Source',
        value: 'BFF',
        meta: 'Monitor service',
      },
      {
        kind: 'metrics',
        id: 'checks',
        size: 'wide',
        accent: 'primary',
        heading: 'Checks',
        meta: label ? `Checks for ${label}` : 'Surface checks',
        items: STATUS_SERVICES,
        ariaLabel: 'Isolated surface health checks',
      },
    ];
  });

  ngOnInit(): void {
    this.slug.set(String(this.route.snapshot.paramMap.get('slug') ?? ''));
    this.note.set(this.slug() ? `Status for ${this.slug()}` : 'Status detail');
  }
}
