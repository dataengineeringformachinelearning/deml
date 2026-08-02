import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [Banner, PageSection, SectionHeader, StatCard, DashboardGrid],
  templateUrl: './settings.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings implements OnInit {
  private readonly settings = inject(SettingsService);
  readonly note = signal('Billing, consent, and workspace preferences.');
  readonly metrics = signal([
    { label: 'Surface', value: 'Settings' },
    { label: 'State', value: 'Live' },
    { label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    // SettingsService ready for account/billing prefs
  }
}
