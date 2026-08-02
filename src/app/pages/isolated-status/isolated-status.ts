import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { MonitorService } from '../../services/monitor.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-isolated-status',
  imports: [Banner, PageSection, SectionHeader, StatCard, DashboardGrid],
  templateUrl: './isolated-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsolatedStatus implements OnInit {
  private readonly monitor = inject(MonitorService);
  private readonly route = inject(ActivatedRoute);
  readonly slug = signal('');
  readonly note = signal('Isolated status view for a single surface.');
  readonly metrics = signal([
    { label: 'Surface', value: 'Status detail' },
    { label: 'State', value: 'Live' },
    { label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    // Live monitor wiring available via MonitorService
    this.slug.set(String(this.route.snapshot.paramMap.get('slug') ?? ''));
    this.note.set(this.slug() ? `Status for ${this.slug()}` : 'Status detail');
  }
}
