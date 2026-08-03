import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-status',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './auth-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthStatus implements OnInit {
  private readonly auth = inject(AuthService);
  readonly note = signal('Current authentication and session registry state.');
  readonly tiles = catalogStatTiles([
    { id: 'session', label: 'Session', value: 'Ready' },
    { id: 'identity', label: 'Identity', value: 'Bound' },
    { id: 'registry', label: 'Registry', value: 'Live' },
  ]);

  ngOnInit(): void {
    this.note.set(this.auth.isAuthenticated() ? 'Authenticated session' : 'Guest session');
  }
}
