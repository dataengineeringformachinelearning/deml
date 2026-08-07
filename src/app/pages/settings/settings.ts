import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, lastValueFrom } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { CheckboxField } from '../../components/checkbox-field/checkbox-field';
import { FormPanel } from '../../components/form-panel/form-panel';
import { PageSection } from '../../components/page-section/page-section';
import { TextField } from '../../components/text-field/text-field';
import { OFFLINE_BODY } from '../../core/continuity-copy';
import { apiErrorMessage } from '../../core/utils/api-error.utils';
import { resolveSettingsSection, type SettingsSectionId } from '../../data/settings';
import { AuthService } from '../../services/auth.service';
import { ConnectivityService } from '../../services/connectivity.service';
import { DialogService } from '../../services/dialog.service';
import {
  MonitorService,
  filterOwnedStatusPages,
  isPlatformStatusPage,
  type StatusPageData,
} from '../../services/monitor.service';

@Component({
  selector: 'app-settings',
  imports: [
    Banner,
    Button,
    ButtonGroup,
    CheckboxField,
    FormPanel,
    PageSection,
    TextField,
  ],
  templateUrl: './settings.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(DialogService);
  private readonly monitor = inject(MonitorService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly displayName = signal('');
  readonly email = signal('');
  readonly profileError = signal('');
  readonly profileMessage = signal('');
  readonly profileBusy = signal(false);

  readonly sites = signal<StatusPageData[]>([]);
  readonly sitesLoading = signal(true);
  /** True when owned-list load failed with no cache — never show “No sites yet”. */
  readonly sitesLoadFailed = signal(false);
  readonly sitesRetrying = signal(false);
  readonly sitesError = signal('');
  readonly sitesMessage = signal('');
  readonly sitesStale = this.monitor.ownedSitesServingStale;
  readonly online = this.connectivity.online;
  readonly siteBusy = signal(false);
  /** Monotonic load generation — drop stale async completions. */
  private sitesLoadGeneration = 0;
  readonly editingSiteId = signal<string | null>(null);
  readonly siteTitle = signal('');
  readonly siteSlug = signal('');
  readonly siteDescription = signal('');
  readonly sitePublished = signal(false);
  readonly siteTitleError = signal('');
  readonly siteSlugError = signal('');

  constructor() {
    this.hydrateProfile();
    this.loadSites();

    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragment) => {
      const section = resolveSettingsSection(fragment);
      if (section) {
        this.scrollToSection(section);
      }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const section =
        resolveSettingsSection(params.get('section')) ?? resolveSettingsSection(params.get('tab'));
      if (section) {
        this.scrollToSection(section);
      }
    });

    afterNextRender(() => {
      const fragment = this.route.snapshot.fragment;
      const section =
        resolveSettingsSection(fragment) ??
        resolveSettingsSection(this.route.snapshot.queryParamMap.get('section')) ??
        resolveSettingsSection(this.route.snapshot.queryParamMap.get('tab'));
      if (section) {
        this.scrollToSection(section);
      }
    });
  }

  async saveProfile(event: Event): Promise<void> {
    event.preventDefault();
    this.profileError.set('');
    this.profileMessage.set('');
    if (!this.online()) {
      this.profileError.set(OFFLINE_BODY);
      return;
    }
    this.profileBusy.set(true);
    try {
      const result = await this.auth.updateDisplayName(this.displayName());
      if (!result.success) {
        this.profileError.set(result.error ?? 'Unable to save profile.');
        return;
      }
      this.hydrateProfile();
      this.profileMessage.set('Profile saved.');
    } finally {
      this.profileBusy.set(false);
    }
  }

  startCreateSite(): void {
    this.editingSiteId.set(null);
    this.siteTitle.set('');
    this.siteSlug.set('');
    this.siteDescription.set('');
    this.sitePublished.set(false);
    this.siteTitleError.set('');
    this.siteSlugError.set('');
    this.sitesError.set('');
    this.sitesMessage.set('');
  }

  startEditSite(site: StatusPageData): void {
    if (isPlatformStatusPage(site)) {
      this.sitesError.set('Platform status is managed by DEML and cannot be edited here.');
      return;
    }
    this.editingSiteId.set(site.id);
    this.siteTitle.set(site.title);
    this.siteSlug.set(site.slug);
    this.siteDescription.set(site.description || '');
    this.sitePublished.set(!!site.is_published);
    this.siteTitleError.set('');
    this.siteSlugError.set('');
    this.sitesError.set('');
    this.sitesMessage.set('');
    this.scrollToSection('sites');
  }

  async saveSite(event: Event): Promise<void> {
    event.preventDefault();
    if (this.siteBusy()) {
      return;
    }
    this.sitesError.set('');
    this.sitesMessage.set('');
    this.siteTitleError.set('');
    this.siteSlugError.set('');

    if (!this.online()) {
      this.sitesError.set(OFFLINE_BODY);
      return;
    }

    const title = this.siteTitle().trim();
    const slug = this.siteSlug().trim().toLowerCase().replace(/\s+/g, '-');
    const description = this.siteDescription().trim();
    let valid = true;

    if (!title) {
      this.siteTitleError.set('Enter a site title.');
      valid = false;
    }
    if (!slug) {
      this.siteSlugError.set('Enter a URL slug.');
      valid = false;
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      this.siteSlugError.set('Use lowercase letters, numbers, and hyphens.');
      valid = false;
    } else if (isPlatformStatusPage(slug)) {
      this.siteSlugError.set('That slug is reserved for DEML platform status.');
      valid = false;
    }
    if (!valid) {
      return;
    }

    this.siteBusy.set(true);
    const payload = {
      title,
      slug,
      description,
      is_published: this.sitePublished(),
    };

    try {
      const editingId = this.editingSiteId();
      if (editingId) {
        await firstValueFrom(this.monitor.updateStatusPage(editingId, payload));
        this.sitesMessage.set('Site updated.');
      } else {
        await firstValueFrom(this.monitor.createStatusPage(payload));
        this.sitesMessage.set('Site created.');
      }
      this.startCreateSite();
      await this.loadSites();
    } catch (err: unknown) {
      this.sitesError.set(apiErrorMessage(err, 'Unable to save site. Try again.'));
    } finally {
      this.siteBusy.set(false);
    }
  }

  async deleteSite(site: StatusPageData): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    if (isPlatformStatusPage(site)) {
      this.sitesError.set('Platform status is managed by DEML and cannot be deleted here.');
      return;
    }
    const confirmed = await this.dialog.confirm({
      title: `Delete “${site.title}”?`,
      body: 'This cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep site',
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }

    if (!this.online()) {
      this.sitesError.set(OFFLINE_BODY);
      return;
    }

    this.siteBusy.set(true);
    this.sitesError.set('');
    this.sitesMessage.set('');
    const prior = this.sites();
    // Optimistic remove — restore on failure so UI never lies about delete success.
    this.sites.set(prior.filter(item => item.id !== site.id));
    try {
      await firstValueFrom(this.monitor.deleteStatusPage(site.id));
      if (this.editingSiteId() === site.id) {
        this.startCreateSite();
      }
      this.sitesMessage.set('Site deleted.');
      await this.loadSites();
    } catch (err: unknown) {
      this.sites.set(prior);
      this.sitesError.set(apiErrorMessage(err, 'Unable to delete site. Try again.'));
    } finally {
      this.siteBusy.set(false);
    }
  }

  private hydrateProfile(): void {
    const profile = this.auth.getAccountProfile();
    this.displayName.set(profile.displayName);
    this.email.set(profile.email);
  }

  retryLoadSites(): void {
    this.sitesRetrying.set(true);
    void this.loadSites();
  }

  private async loadSites(): Promise<void> {
    const generation = ++this.sitesLoadGeneration;
    this.sitesLoading.set(true);
    this.sitesLoadFailed.set(false);
    const peek = filterOwnedStatusPages(this.monitor.peekOwnedStatusPages());
    if (peek.length) {
      // Peek is provisional — mark stale until revalidate settles.
      this.sites.set(peek);
      this.monitor.ownedSitesServingStale.set(true);
      this.sitesLoading.set(false);
    }

    try {
      // lastValueFrom waits for SWR revalidate; never treat warm cache as final.
      const pages = await lastValueFrom(this.monitor.getOwnedStatusPages());
      if (generation !== this.sitesLoadGeneration) return;
      if (!Array.isArray(pages)) {
        throw new Error('invalid_owned_sites_payload');
      }
      this.sites.set(filterOwnedStatusPages(pages));
      this.sitesError.set('');
      this.sitesLoadFailed.set(false);
      // Stale flag is cleared only by MonitorService network tap on success.
    } catch (err: unknown) {
      if (generation !== this.sitesLoadGeneration) return;
      const warm = filterOwnedStatusPages(this.monitor.peekOwnedStatusPages());
      if (warm.length) {
        this.sites.set(warm);
        this.monitor.ownedSitesServingStale.set(true);
        this.sitesError.set('');
        this.sitesLoadFailed.set(false);
      } else {
        this.sites.set([]);
        this.sitesLoadFailed.set(true);
        this.sitesError.set(apiErrorMessage(err, 'Unable to load sites. Try again.'));
      }
    } finally {
      if (generation === this.sitesLoadGeneration) {
        this.sitesLoading.set(false);
        this.sitesRetrying.set(false);
      }
    }
  }

  private scrollToSection(section: SettingsSectionId): void {
    if (!this.isBrowser) {
      return;
    }
    globalThis.setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }
}
