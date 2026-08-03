import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-status',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Status {
  private readonly monitor = inject(MonitorService);
  readonly tiles = catalogStatTiles([
    { id: 'api', label: 'API', value: 'Up' },
    { id: 'queue', label: 'Queue', value: 'Up' },
    { id: 'storage', label: 'Storage', value: 'Up' },
  ]);
}
