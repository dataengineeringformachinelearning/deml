import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { STATUS_TILES } from '../../data/status';

@Component({
  selector: 'app-status',
  imports: [Banner, Button, PageSection, SectionHeader, TileBoard],
  templateUrl: './status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Status {
  readonly tiles = STATUS_TILES;
}
