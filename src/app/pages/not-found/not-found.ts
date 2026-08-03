import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';

@Component({
  selector: 'app-not-found',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './not-found.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  readonly tiles = catalogStatTiles([
    { id: 'code', label: 'Code', value: '404' },
    { id: 'route', label: 'Route', value: 'Missing' },
    { id: 'action', label: 'Action', value: 'Home' },
  ]);
}
