import { Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [Banner, Button, ButtonGroup],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly auth = inject(AuthService);

  readonly loggedIn = this.auth.loggedIn;

  login(): void {
    this.auth.login();
  }
}
