import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { FormPanel } from '../../components/form-panel/form-panel';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import {
  HOME_DESTINATIONS,
  HOME_HERO,
  HOME_PILLARS,
  resolveHomeCardActions,
  type HomeCard,
} from '../../data/home';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [
    Banner,
    Button,
    ButtonGroup,
    Card,
    CardGrid,
    FormPanel,
    PageSection,
    SectionHeader,
  ],
  templateUrl: './home.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AuthService);

  readonly loggedIn = this.auth.isAuthenticated;
  readonly hero = HOME_HERO;
  readonly pillars = HOME_PILLARS;

  readonly destinationCards = computed(() => {
    const signedIn = this.loggedIn();
    return HOME_DESTINATIONS.map(
      (card): HomeCard => ({
        ...card,
        actions: resolveHomeCardActions(card, signedIn),
      }),
    );
  });

  readonly ctaTitle = computed(() =>
    this.loggedIn() ? 'Continue in your workspace' : 'Create an account',
  );

  readonly ctaDescription = computed(() =>
    this.loggedIn()
      ? 'Open the dashboard for live pulse, or browse the status directory and learn catalog.'
      : 'Sign up to bind an account, then open dashboards and analytics. Guests can still browse Explore and Learn.',
  );
}
