import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { AUTH_STATUS_CARDS } from '../../data/utility-pages';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-status',
  imports: [Banner, Button, ButtonGroup, Card, CardGrid, PageSection, SectionHeader],
  templateUrl: './auth-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthStatus implements OnInit {
  private readonly auth = inject(AuthService);
  readonly note = signal('Current authentication and session registry state.');
  readonly cards = AUTH_STATUS_CARDS;

  ngOnInit(): void {
    this.note.set(this.auth.isAuthenticated() ? 'Authenticated session' : 'Guest session');
  }
}
