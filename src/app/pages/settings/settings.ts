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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { CheckboxField } from '../../components/checkbox-field/checkbox-field';
import { FormPanel } from '../../components/form-panel/form-panel';
import { PageSection } from '../../components/page-section/page-section';
import { TextField } from '../../components/text-field/text-field';
import { apiErrorMessage } from '../../core/utils/api-error.utils';
import {
  SETTINGS_SECTION_LINKS,
  resolveSettingsSection,
  type SettingsSectionId,
} from '../../data/settings';
import { AuthService } from '../../services/auth.service';
import { MonitorService, type StatusPageData } from '../../services/monitor.service';
import { ThemeService } from '../../services/theme';

const NOTIFY_STORAGE_KEY = 'deml-notification-prefs';

interface NotificationPrefs {
  emailAlerts: boolean;
  statusDigest: boolean;
}

const DEFAULT_NOTIFY_PREFS: NotificationPrefs = {
  emailAlerts: true,
  statusDigest: false,
};

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
    RouterLink,
  ],
  templateUrl: './settings.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly auth = inject(AuthService);
  private readonly monitor = inject(MonitorService);
  private readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly sections = SETTINGS_SECTION_LINKS;
  readonly isDark = this.themeService.isDark;
  readonly role = this.auth.currentUserRole;
  readonly mfaEnrolled = this.auth.mfaEnrolled;

  readonly displayName = signal('');
  readonly email = signal('');
  readonly profileError = signal('');
  readonly profileMessage = signal('');
  readonly profileBusy = signal(false);

  readonly sites = signal<StatusPageData[]>([]);
  readonly sitesLoading = signal(true);
  readonly sitesError = signal('');
  readonly sitesMessage = signal('');
  readonly siteBusy = signal(false);
  readonly editingSiteId = signal<string | null>(null);
  readonly siteTitle = signal('');
  readonly siteSlug = signal('');
  readonly siteDescription = signal('');
  readonly sitePublished = signal(false);
  readonly siteTitleError = signal('');
  readonly siteSlugError = signal('');

  readonly emailAlerts = signal(DEFAULT_NOTIFY_PREFS.emailAlerts);
  readonly statusDigest = signal(DEFAULT_NOTIFY_PREFS.statusDigest);
  readonly prefsMessage = signal('');

  constructor() {
    this.hydrateProfile();
    this.hydrateNotificationPrefs();
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

  toggleTheme(): void {
    this.themeService.toggle();
    this.prefsMessage.set('Theme preference saved.');
  }

  async saveProfile(event: Event): Promise<void> {
    event.preventDefault();
    this.profileError.set('');
    this.profileMessage.set('');
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
    this.sitesError.set('');
    this.sitesMessage.set('');
    this.siteTitleError.set('');
    this.siteSlugError.set('');

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
    const confirmed = globalThis.confirm(`Delete site “${site.title}”? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    this.siteBusy.set(true);
    this.sitesError.set('');
    this.sitesMessage.set('');
    try {
      await firstValueFrom(this.monitor.deleteStatusPage(site.id));
      if (this.editingSiteId() === site.id) {
        this.startCreateSite();
      }
      this.sitesMessage.set('Site deleted.');
      await this.loadSites();
    } catch (err: unknown) {
      this.sitesError.set(apiErrorMessage(err, 'Unable to delete site. Try again.'));
    } finally {
      this.siteBusy.set(false);
    }
  }

  savePreferences(event: Event): void {
    event.preventDefault();
    this.persistNotificationPrefs({
      emailAlerts: this.emailAlerts(),
      statusDigest: this.statusDigest(),
    });
    this.prefsMessage.set('Preferences saved.');
  }

  private hydrateProfile(): void {
    const profile = this.auth.getAccountProfile();
    this.displayName.set(profile.displayName);
    this.email.set(profile.email);
  }

  private hydrateNotificationPrefs(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      const raw = localStorage.getItem(NOTIFY_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
      if (typeof parsed.emailAlerts === 'boolean') {
        this.emailAlerts.set(parsed.emailAlerts);
      }
      if (typeof parsed.statusDigest === 'boolean') {
        this.statusDigest.set(parsed.statusDigest);
      }
    } catch {
      /* ignore corrupt prefs */
    }
  }

  private persistNotificationPrefs(prefs: NotificationPrefs): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore storage failures */
    }
  }

  private async loadSites(): Promise<void> {
    this.sitesLoading.set(true);
    const peek = this.monitor.peekStatusPages();
    if (peek) {
      this.sites.set(peek);
      this.sitesLoading.set(false);
    }

    try {
      const pages = await firstValueFrom(this.monitor.getStatusPages());
      this.sites.set(Array.isArray(pages) ? pages : []);
      this.sitesError.set('');
    } catch (err: unknown) {
      if (!peek) {
        this.sitesError.set(apiErrorMessage(err, 'Unable to load sites. Try again.'));
      }
    } finally {
      this.sitesLoading.set(false);
    }
  }

  private scrollToSection(section: SettingsSectionId): void {
    if (!this.isBrowser) {
      return;
    }
    // Defer until the section nodes are in the document (fragment / query navigation).
    globalThis.setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }
}
