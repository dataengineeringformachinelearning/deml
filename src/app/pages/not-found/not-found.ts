import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';

@Component({
  selector: 'app-not-found',
  imports: [Banner, PageSection, SectionHeader, StatCard, DashboardGrid],
  templateUrl: './not-found.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound implements OnInit {

  readonly note = signal('That route is not available.');
  readonly metrics = signal([
    { label: 'Surface', value: 'Not found' },
    { label: 'State', value: 'Live' },
    { label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    /* scaffolded product surface */
  }
}
