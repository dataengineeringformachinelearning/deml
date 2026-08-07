import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConfirmSheet } from './components/confirm-sheet/confirm-sheet';
import { Navbar } from './components/navbar/navbar';
import { SiteFooter } from './components/site-footer/site-footer';
import { SessionStateService } from './services/session-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SiteFooter, ConfirmSheet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Wire idle + cross-tab session coordination once at app boot. */
  private readonly sessionState = inject(SessionStateService);

  constructor() {
    this.sessionState.init();
  }
}
