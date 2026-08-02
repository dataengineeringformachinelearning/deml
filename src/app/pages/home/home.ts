import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { SectionHeader } from '../../components/section-header/section-header';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [Banner, Button, ButtonGroup, Card, CardGrid, SectionHeader],
  templateUrl: './home.html',
  styleUrl: './home.css',
  host: { class: 'page' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AuthService);

  readonly loggedIn = this.auth.loggedIn;

  login(): void {
    this.auth.login();
  }
}
