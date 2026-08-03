import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { SETTINGS_CARDS } from '../../data/settings';

@Component({
  selector: 'app-settings',
  imports: [Banner, Button, ButtonGroup, Card, CardGrid, PageSection, SectionHeader],
  templateUrl: './settings.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  readonly cards = SETTINGS_CARDS;
}
