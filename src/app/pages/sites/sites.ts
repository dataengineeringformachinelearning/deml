import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { SITE_CARDS, SITE_TILES } from '../../data/sites';

@Component({
  selector: 'app-sites',
  imports: [
    Banner,
    Button,
    ButtonGroup,
    PageSection,
    SectionHeader,
    TileBoard,
    CardGrid,
    Card,
  ],
  templateUrl: './sites.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sites {
  readonly sites = SITE_CARDS;
  readonly tiles = SITE_TILES;
}
