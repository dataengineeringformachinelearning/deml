import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';

@Component({
  selector: 'app-success',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './success.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Success {
  readonly tiles = catalogStatTiles([
    { id: 'result', label: 'Result', value: 'Complete' },
    { id: 'state', label: 'State', value: 'Live' },
    { id: 'source', label: 'Source', value: 'BFF' },
  ]);
}
