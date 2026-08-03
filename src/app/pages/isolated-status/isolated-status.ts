import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { TileBoard } from '../../components/tile-board/tile-board';
import { catalogStatTiles } from '../../data/catalog-tiles';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-isolated-status',
  imports: [Banner, PageSection, SectionHeader, TileBoard],
  templateUrl: './isolated-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsolatedStatus implements OnInit {
  private readonly monitor = inject(MonitorService);
  private readonly route = inject(ActivatedRoute);
  readonly slug = signal('');
  readonly note = signal('Isolated status view for a single surface.');
  readonly tiles = catalogStatTiles([
    { id: 'surface', label: 'Surface', value: 'Detail' },
    { id: 'health', label: 'Health', value: 'Up' },
    { id: 'source', label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    this.slug.set(String(this.route.snapshot.paramMap.get('slug') ?? ''));
    this.note.set(this.slug() ? `Status for ${this.slug()}` : 'Status detail');
  }
}
