import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';

@Component({
  selector: 'app-vulnerabilities',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './vulnerabilities.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Vulnerabilities {
  readonly tiles = catalogStatTiles([
    { id: 'critical', label: 'Critical', value: '2' },
    { id: 'high', label: 'High', value: '9' },
    { id: 'resolved', label: 'Resolved', value: '128' },
  ]);
}
