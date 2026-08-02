import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-status',
  imports: [Banner, PageSection, SectionHeader, StatCard, DashboardGrid],
  templateUrl: './auth-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthStatus implements OnInit {
  private readonly auth = inject(AuthService);
  readonly note = signal('Current authentication and session registry state.');
  readonly metrics = signal([
    { label: 'Surface', value: 'Auth status' },
    { label: 'State', value: 'Live' },
    { label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    this.note.set(this.auth.isAuthenticated() ? 'Authenticated session' : 'Guest session');
  }
}
