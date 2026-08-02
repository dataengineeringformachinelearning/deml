import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { HOME_CARDS, resolveHomeCardActions } from '../../data/home';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [Banner, Button, ButtonGroup, Card, CardGrid, PageSection, SectionHeader],
  templateUrl: './home.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AuthService);

  readonly loggedIn = this.auth.loggedIn;

  readonly cards = computed(() =>
    HOME_CARDS.map((card) => ({
      ...card,
      actions: resolveHomeCardActions(card, this.loggedIn()),
    })),
  );
}
