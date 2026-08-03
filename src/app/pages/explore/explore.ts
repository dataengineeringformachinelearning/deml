import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { EXPLORE_CARDS } from '../../data/explore';

@Component({
  selector: 'app-explore',
  imports: [Banner, Button, ButtonGroup, Card, CardGrid, PageSection, SectionHeader],
  templateUrl: './explore.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explore {
  readonly cards = EXPLORE_CARDS;
}
