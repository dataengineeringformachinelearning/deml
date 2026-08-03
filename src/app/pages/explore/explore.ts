import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';

@Component({
  selector: 'app-explore',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './explore.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explore {
  readonly tiles = catalogStatTiles([
    { id: 'docs', label: 'Docs', value: 'Open' },
    { id: 'apis', label: 'APIs', value: 'Live' },
    { id: 'guides', label: 'Guides', value: '12' },
  ]);
}
