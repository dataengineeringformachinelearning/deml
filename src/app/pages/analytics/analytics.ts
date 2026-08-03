import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { ANALYTICS_TILES } from '../../data/analytics';
import { AnalyticsQueryService } from '../../services/analytics-query.service';

@Component({
  selector: 'app-analytics',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './analytics.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Analytics {
  private readonly analytics = inject(AnalyticsQueryService);
  readonly tiles = ANALYTICS_TILES;
}
