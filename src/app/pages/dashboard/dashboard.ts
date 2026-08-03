import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { DASH_TILES } from '../../data/dashboard';
import { LiveUpdatesService } from '../../services/live-updates.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './dashboard.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly live = inject(LiveUpdatesService);
  private readonly auth = inject(AuthService);
  readonly tiles = DASH_TILES;
  readonly authenticated = this.auth.isAuthenticated;
}
