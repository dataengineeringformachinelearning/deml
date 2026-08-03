import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';

@Component({
  selector: 'app-settings',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './settings.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  readonly tiles = catalogStatTiles([
    { id: 'profile', label: 'Profile', value: 'Ready' },
    { id: 'security', label: 'Security', value: 'On' },
    { id: 'notify', label: 'Notifications', value: 'Email' },
  ]);
}
