import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-status',
  imports: [Banner, PageSection, SectionHeader, StatCard, DashboardGrid],
  templateUrl: './status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Status implements OnInit {
  private readonly monitor = inject(MonitorService);
  readonly note = signal('Service health and continuity signals.');
  readonly metrics = signal([
    { label: 'Surface', value: 'Status' },
    { label: 'State', value: 'Live' },
    { label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    // Live monitor wiring available via MonitorService
  }
}
