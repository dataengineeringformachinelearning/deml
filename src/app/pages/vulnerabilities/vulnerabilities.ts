import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { VulnerabilityService } from '../../services/vulnerability.service';

@Component({
  selector: 'app-vulnerabilities',
  imports: [Banner, PageSection, SectionHeader, StatCard, DashboardGrid],
  templateUrl: './vulnerabilities.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Vulnerabilities implements OnInit {
  private readonly vulnerabilities = inject(VulnerabilityService);
  readonly note = signal('Tracked findings and remediation status.');
  readonly metrics = signal([
    { label: 'Surface', value: 'Vulnerabilities' },
    { label: 'State', value: 'Live' },
    { label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    // VulnerabilityService ready for findings fetch
  }
}
