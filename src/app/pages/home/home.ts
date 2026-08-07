import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { HOME_HERO } from '../../data/home';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [Banner, Button, ButtonGroup],
  templateUrl: './home.html',
  host: { class: 'page' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AuthService);

  readonly loggedIn = this.auth.isAuthenticated;
  readonly hero = HOME_HERO;
}
