import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

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
  private readonly router = inject(Router);

  /** Headless routes (auth-bridge) omit product chrome. */
  readonly bareShell = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.isBareShell()),
      startWith(this.isBareShell()),
    ),
    { initialValue: this.isBareShell() },
  );

  constructor() {
    this.sessionState.init();
  }

  private isBareShell(): boolean {
    let node = this.router.routerState.snapshot.root;
    while (node) {
      if (node.data?.['bareShell'] === true) {
        return true;
      }
      if (!node.firstChild) {
        break;
      }
      node = node.firstChild;
    }
    return false;
  }
}
