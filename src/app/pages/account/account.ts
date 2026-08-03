import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { ACCOUNT_BASE_TILES, ACCOUNT_PREF_CARDS } from '../../data/account';
import type { DashTile } from '../../data/dashboard';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-account',
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
  templateUrl: './account.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Account {
  private readonly themeService = inject(ThemeService);

  readonly isDark = this.themeService.isDark;
  readonly prefs = ACCOUNT_PREF_CARDS;

  readonly tiles = computed((): readonly DashTile[] => {
    const themeTile: DashTile = {
      kind: 'stat',
      id: 'theme',
      size: 'sm',
      accent: 'red',
      label: 'Theme',
      value: this.isDark() ? 'Dark' : 'Light',
      meta: 'Appearance',
    };
    return [...ACCOUNT_BASE_TILES, themeTile];
  });

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
