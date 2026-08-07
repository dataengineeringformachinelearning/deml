import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { multiFactor, RecaptchaVerifier, type MultiFactorInfo } from 'firebase/auth';
import { filter, firstValueFrom, lastValueFrom, take } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Callout } from '../../components/callout/callout';
import { CheckboxField } from '../../components/checkbox-field/checkbox-field';
import { ErrorState } from '../../components/error-state/error-state';
import { FormPanel } from '../../components/form-panel/form-panel';
import { PageSection } from '../../components/page-section/page-section';
import { Sheet } from '../../components/sheet/sheet';
import { Skeleton } from '../../components/skeleton/skeleton';
import { TextField } from '../../components/text-field/text-field';
import {
  OFFLINE_BODY,
  OFFLINE_WRITES,
  RETRY,
  STALE_SITES,
} from '../../core/continuity-copy';
import { apiErrorMessage } from '../../core/utils/api-error.utils';
import {
  logFirebaseAuthError,
  mapFirebaseMfaError,
  normalizePhoneE164,
  phoneFormatHint,
  phoneValidationError,
} from '../../core/utils/phone.utils';
import { resolveSettingsSection, type SettingsSectionId } from '../../data/settings';
import { ensureFieldVisible } from '../../shared/focus-field';
import {
  AccountApiService,
  type ApiKeyRow,
  type SessionRow,
} from '../../services/account-api.service';
import { AuthService } from '../../services/auth.service';
import { ConnectivityService } from '../../services/connectivity.service';
import { DialogService } from '../../services/dialog.service';
import {
  MonitorService,
  filterOwnedStatusPages,
  isPlatformStatusPage,
  type StatusPageData,
} from '../../services/monitor.service';

/** Keep in sync with deml-ui `--duration-fast`. */
const SHEET_EXIT_MS = 140;

type LinkedProvider = {
  providerId: string;
  email: string;
};

@Component({
  selector: 'app-settings',
  imports: [
    Banner,
    Button,
    ButtonGroup,
    Callout,
    CheckboxField,
    ErrorState,
    FormPanel,
    PageSection,
    Sheet,
    Skeleton,
    TextField,
  ],
  templateUrl: './settings.html',
  host: {
    class: 'page page--catalog',
    '(focusin)': 'onFocusIn($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly auth = inject(AuthService);
  private readonly accountApi = inject(AccountApiService);
  private readonly dialog = inject(DialogService);
  private readonly monitor = inject(MonitorService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private siteEditorExitTimer: ReturnType<typeof setTimeout> | null = null;
  private lastReconnectGeneration = 0;
  private mfaRecaptchaVerifier: RecaptchaVerifier | null = null;
  private mfaVerificationId: string | null = null;

  readonly displayName = signal('');
  readonly email = signal('');
  readonly profileError = signal('');
  readonly profileMessage = signal('');
  readonly profileBusy = signal(false);

  readonly newEmail = signal('');
  readonly emailError = signal('');
  readonly emailMessage = signal('');
  readonly emailBusy = signal(false);

  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly passwordError = signal('');
  readonly passwordMessage = signal('');
  readonly passwordBusy = signal(false);

  readonly mfaEnrolled = this.auth.mfaEnrolled;
  readonly mfaPhone = signal('');
  readonly mfaCode = signal('');
  readonly mfaPhoneError = signal('');
  readonly mfaCodeError = signal('');
  readonly mfaError = signal('');
  readonly mfaMessage = signal('');
  readonly mfaBusy = signal(false);
  readonly mfaCodeSent = signal(false);
  readonly mfaFactors = signal<MultiFactorInfo[]>([]);
  readonly phoneHint = phoneFormatHint;

  readonly linkedProviders = signal<LinkedProvider[]>([]);
  readonly providerError = signal('');
  readonly providerMessage = signal('');
  readonly providerBusy = signal(false);

  readonly apiKeys = signal<ApiKeyRow[]>([]);
  readonly apiKeysLoading = signal(false);
  readonly apiKeysError = signal('');
  readonly apiKeyName = signal('');
  readonly newlyGeneratedKey = signal('');
  readonly copiedApiKey = signal(false);
  readonly apiKeyBusy = signal(false);

  readonly sessions = signal<SessionRow[]>([]);
  readonly sessionsLoading = signal(false);
  readonly sessionsError = signal('');
  readonly sessionBusy = signal(false);
  readonly currentSessionId = this.auth.sessionId;

  readonly deleteError = signal('');
  readonly deleteBusy = signal(false);

  readonly sites = signal<StatusPageData[]>([]);
  readonly sitesLoading = signal(true);
  /** True when owned-list load failed with no cache — never show “No sites yet”. */
  readonly sitesLoadFailed = signal(false);
  readonly sitesRetrying = signal(false);
  readonly sitesError = signal('');
  readonly sitesMessage = signal('');
  readonly sitesStale = this.monitor.ownedSitesServingStale;
  readonly online = this.connectivity.online;
  readonly offlineWrites = OFFLINE_WRITES;
  readonly staleSites = STALE_SITES;
  readonly retryLabel = RETRY;
  readonly siteBusy = signal(false);
  /** Monotonic load generation — drop stale async completions. */
  private sitesLoadGeneration = 0;
  readonly editingSiteId = signal<string | null>(null);
  readonly siteEditorOpen = signal(false);
  readonly siteEditorLeaving = signal(false);
  readonly siteTitle = signal('');
  readonly siteSlug = signal('');
  readonly siteDescription = signal('');
  readonly sitePublished = signal(false);
  readonly siteTitleError = signal('');
  readonly siteSlugError = signal('');

  constructor() {
    this.hydrateProfile();
    this.refreshLinkedProviders();
    this.refreshMfaFactors();

    // Owned list requires a live session — never fetch/cache while anonymous.
    if (this.auth.isAuthenticated()) {
      void this.loadSites();
      void this.loadAccountExtras();
    } else {
      toObservable(this.auth.isAuthenticated)
        .pipe(
          filter(Boolean),
          take(1),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          void this.loadSites();
          void this.loadAccountExtras();
        });
    }

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

      effect(
        () => {
          const gen = this.connectivity.reconnectGeneration();
          if (gen > 0 && gen !== this.lastReconnectGeneration && this.auth.isAuthenticated()) {
            this.lastReconnectGeneration = gen;
            this.monitor.invalidateStatusReads();
            void this.loadSites();
            void this.loadAccountExtras();
          }
        },
        { injector: this.injector },
      );
    });

    this.destroyRef.onDestroy(() => {
      this.clearSiteEditorExitTimer();
      this.clearMfaRecaptcha();
      this.setBodyScrollLocked(false);
    });
  }

  onFocusIn(event: FocusEvent): void {
    ensureFieldVisible(event.target);
  }

  onEscape(): void {
    if (this.siteEditorOpen() && !this.siteBusy()) {
      this.closeSiteEditor();
    }
  }

  hasProvider(providerId: string): boolean {
    return this.linkedProviders().some((p) => p.providerId === providerId);
  }

  providerLabel(providerId: string): string {
    if (providerId === 'google.com') return 'Google';
    if (providerId === 'apple.com') return 'Apple';
    if (providerId === 'password') return 'Email / password';
    return providerId;
  }

  formatSessionTime(epochSeconds: number): string {
    if (!epochSeconds) return 'Unknown';
    try {
      return new Date(epochSeconds * 1000).toLocaleString();
    } catch {
      return 'Unknown';
    }
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

  async saveEmail(event: Event): Promise<void> {
    event.preventDefault();
    this.emailError.set('');
    this.emailMessage.set('');
    if (!this.online()) {
      this.emailError.set(OFFLINE_BODY);
      return;
    }
    const next = this.newEmail().trim();
    if (!next || !next.includes('@')) {
      this.emailError.set('Enter a valid email address.');
      return;
    }
    this.emailBusy.set(true);
    try {
      const result = await this.auth.updateUserEmail(next);
      if (result.status !== 'success') {
        this.emailError.set(result.message ?? 'Unable to update email.');
        return;
      }
      this.newEmail.set('');
      this.hydrateProfile();
      this.emailMessage.set('Email updated.');
    } finally {
      this.emailBusy.set(false);
    }
  }

  async savePassword(event: Event): Promise<void> {
    event.preventDefault();
    this.passwordError.set('');
    this.passwordMessage.set('');
    if (!this.online()) {
      this.passwordError.set(OFFLINE_BODY);
      return;
    }
    const next = this.newPassword();
    const confirm = this.confirmPassword();
    if (next.length < 6) {
      this.passwordError.set('Password should be at least 6 characters.');
      return;
    }
    if (next !== confirm) {
      this.passwordError.set('Passwords do not match.');
      return;
    }
    this.passwordBusy.set(true);
    try {
      const result = await this.auth.updateUserPassword(next);
      if (result.status !== 'success') {
        this.passwordError.set(result.message ?? 'Unable to update password.');
        return;
      }
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.passwordMessage.set('Password updated.');
    } finally {
      this.passwordBusy.set(false);
    }
  }

  async sendMfaEnrollmentCode(): Promise<void> {
    this.mfaError.set('');
    this.mfaMessage.set('');
    this.mfaPhoneError.set('');
    this.mfaCodeError.set('');
    if (!this.online()) {
      this.mfaError.set(OFFLINE_BODY);
      return;
    }
    const phone = normalizePhoneE164(this.mfaPhone());
    const phoneErr = phoneValidationError(phone);
    if (phoneErr) {
      this.mfaPhoneError.set(phoneErr);
      return;
    }
    this.mfaBusy.set(true);
    try {
      this.clearMfaRecaptcha();
      const verifier = await this.ensureMfaRecaptcha();
      this.mfaVerificationId = await this.auth.sendMfaEnrollmentCode(phone, verifier);
      this.mfaPhone.set(phone);
      this.mfaCodeSent.set(true);
      this.mfaMessage.set('Verification code sent. Enter it below to finish enrollment.');
    } catch (err: unknown) {
      logFirebaseAuthError('MFA enrollment send', err);
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: string }).code)
          : undefined;
      this.mfaError.set(mapFirebaseMfaError(code));
      this.clearMfaRecaptcha();
    } finally {
      this.mfaBusy.set(false);
    }
  }

  async confirmMfaEnrollment(event: Event): Promise<void> {
    event.preventDefault();
    this.mfaError.set('');
    this.mfaMessage.set('');
    this.mfaCodeError.set('');
    if (!this.online()) {
      this.mfaError.set(OFFLINE_BODY);
      return;
    }
    const verificationId = this.mfaVerificationId;
    const code = this.mfaCode().trim();
    if (!verificationId) {
      this.mfaError.set('Request a verification code first.');
      return;
    }
    if (!code) {
      this.mfaCodeError.set('Enter the SMS verification code.');
      return;
    }
    this.mfaBusy.set(true);
    try {
      await this.auth.confirmMfaEnrollment(verificationId, code);
      this.mfaCode.set('');
      this.mfaPhone.set('');
      this.mfaCodeSent.set(false);
      this.mfaVerificationId = null;
      this.clearMfaRecaptcha();
      this.refreshMfaFactors();
      this.mfaMessage.set('SMS multi-factor authentication is enabled.');
    } catch (err: unknown) {
      logFirebaseAuthError('MFA enrollment confirm', err);
      const codeName =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: string }).code)
          : undefined;
      this.mfaError.set(mapFirebaseMfaError(codeName));
    } finally {
      this.mfaBusy.set(false);
    }
  }

  async disableMfa(): Promise<void> {
    this.mfaError.set('');
    this.mfaMessage.set('');
    if (!this.online()) {
      this.mfaError.set(OFFLINE_BODY);
      return;
    }
    const factors = this.mfaFactors();
    if (!factors.length) {
      this.mfaError.set('No enrolled MFA factors to disable.');
      return;
    }
    const confirmed = await this.dialog.confirm({
      title: 'Disable multi-factor authentication?',
      body: 'You will only need your password (or linked provider) to sign in.',
      confirmLabel: 'Disable MFA',
      cancelLabel: 'Keep MFA',
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }
    this.mfaBusy.set(true);
    try {
      for (const factor of factors) {
        await this.auth.unenrollMfa(factor);
      }
      await this.auth.refreshMfaState(true);
      this.refreshMfaFactors();
      this.mfaMessage.set('Multi-factor authentication disabled.');
    } catch (err: unknown) {
      logFirebaseAuthError('MFA disable', err);
      this.mfaError.set('Unable to disable MFA. Sign out, sign back in, and try again.');
    } finally {
      this.mfaBusy.set(false);
    }
  }

  async linkGoogle(): Promise<void> {
    await this.linkProvider('google');
  }

  async linkApple(): Promise<void> {
    await this.linkProvider('apple');
  }

  async unlinkGoogle(): Promise<void> {
    await this.unlinkProvider('google.com');
  }

  async unlinkApple(): Promise<void> {
    await this.unlinkProvider('apple.com');
  }

  async generateApiKey(event: Event): Promise<void> {
    event.preventDefault();
    this.apiKeysError.set('');
    this.newlyGeneratedKey.set('');
    this.copiedApiKey.set(false);
    if (!this.online()) {
      this.apiKeysError.set(OFFLINE_BODY);
      return;
    }
    const name = this.apiKeyName().trim() || 'Integration Key';
    this.apiKeyBusy.set(true);
    try {
      const res = await this.accountApi.generateApiKey(name);
      this.newlyGeneratedKey.set(res.key);
      this.apiKeyName.set('');
      await this.loadApiKeys();
    } catch (err: unknown) {
      this.apiKeysError.set(apiErrorMessage(err, 'Unable to generate API key. Try again.'));
    } finally {
      this.apiKeyBusy.set(false);
    }
  }

  async copyApiKey(): Promise<void> {
    const key = this.newlyGeneratedKey();
    if (!key || !this.isBrowser) {
      return;
    }
    try {
      await navigator.clipboard.writeText(key);
      this.copiedApiKey.set(true);
      globalThis.setTimeout(() => this.copiedApiKey.set(false), 2000);
    } catch {
      this.apiKeysError.set('Unable to copy key. Select and copy it manually.');
    }
  }

  async revokeApiKey(key: ApiKeyRow): Promise<void> {
    this.apiKeysError.set('');
    if (!this.online()) {
      this.apiKeysError.set(OFFLINE_BODY);
      return;
    }
    const confirmed = await this.dialog.confirm({
      title: `Revoke “${key.name}”?`,
      body: 'Systems using this key lose access immediately.',
      confirmLabel: 'Revoke',
      cancelLabel: 'Keep key',
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }
    this.apiKeyBusy.set(true);
    try {
      await this.accountApi.revokeApiKey(key.id);
      await this.loadApiKeys();
    } catch (err: unknown) {
      this.apiKeysError.set(apiErrorMessage(err, 'Unable to revoke API key. Try again.'));
    } finally {
      this.apiKeyBusy.set(false);
    }
  }

  async revokeSession(session: SessionRow): Promise<void> {
    this.sessionsError.set('');
    if (!this.online()) {
      this.sessionsError.set(OFFLINE_BODY);
      return;
    }
    const isCurrent = session.session_id === this.currentSessionId();
    const confirmed = await this.dialog.confirm({
      title: isCurrent ? 'Sign out this device?' : 'Revoke session?',
      body: isCurrent
        ? 'You will be signed out on this browser.'
        : 'That device will need to sign in again.',
      confirmLabel: isCurrent ? 'Sign out' : 'Revoke',
      cancelLabel: 'Cancel',
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }
    this.sessionBusy.set(true);
    try {
      await this.accountApi.revokeSession(session.session_id);
      if (isCurrent) {
        await this.auth.logout();
        await this.router.navigate(['/login']);
        return;
      }
      await this.loadSessions();
    } catch (err: unknown) {
      this.sessionsError.set(apiErrorMessage(err, 'Unable to revoke session. Try again.'));
    } finally {
      this.sessionBusy.set(false);
    }
  }

  async deleteAccount(): Promise<void> {
    this.deleteError.set('');
    if (!this.online()) {
      this.deleteError.set(OFFLINE_BODY);
      return;
    }
    const confirmed = await this.dialog.confirm({
      title: 'Delete account permanently?',
      body: 'Your status pages, credentials, and account data will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete account',
      cancelLabel: 'Keep account',
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }
    this.deleteBusy.set(true);
    try {
      const result = await this.auth.deleteAccount();
      if (result.status === 'completed') {
        await this.router.navigate(['/']);
        if (this.isBrowser) {
          globalThis.location.reload();
        }
        return;
      }
      this.deleteError.set(
        result.message ??
          'Account deletion could not be completed. Your identities and data remain intact.',
      );
    } finally {
      this.deleteBusy.set(false);
    }
  }

  openCreateSite(): void {
    this.resetSiteForm();
    this.openSiteEditor();
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
    this.openSiteEditor();
  }

  closeSiteEditor(force = false): void {
    if (!this.siteEditorOpen() || this.siteEditorLeaving()) {
      return;
    }
    if (this.siteBusy() && !force) {
      return;
    }
    this.siteEditorLeaving.set(true);
    const finish = () => {
      this.clearSiteEditorExitTimer();
      this.siteEditorOpen.set(false);
      this.siteEditorLeaving.set(false);
      this.setBodyScrollLocked(false);
      this.resetSiteForm();
    };
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.isBrowser || reduceMotion) {
      finish();
      return;
    }
    this.siteEditorExitTimer = setTimeout(finish, SHEET_EXIT_MS);
  }

  private openSiteEditor(): void {
    this.clearSiteEditorExitTimer();
    this.siteEditorLeaving.set(false);
    this.siteEditorOpen.set(true);
    this.setBodyScrollLocked(true);
  }

  private resetSiteForm(): void {
    this.editingSiteId.set(null);
    this.siteTitle.set('');
    this.siteSlug.set('');
    this.siteDescription.set('');
    this.sitePublished.set(false);
    this.siteTitleError.set('');
    this.siteSlugError.set('');
  }

  private clearSiteEditorExitTimer(): void {
    if (this.siteEditorExitTimer !== null) {
      clearTimeout(this.siteEditorExitTimer);
      this.siteEditorExitTimer = null;
    }
  }

  private setBodyScrollLocked(locked: boolean): void {
    if (!this.isBrowser) {
      return;
    }
    this.document.body.style.overflow = locked ? 'hidden' : '';
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
      const saved = editingId
        ? await firstValueFrom(this.monitor.updateStatusPage(editingId, payload))
        : await firstValueFrom(this.monitor.createStatusPage(payload));
      // Merge write response before reload — if revalidate fails after SWR
      // invalidate, the UI still shows the saved site (not a pre-write list).
      const prior = this.sites();
      const merged = filterOwnedStatusPages(
        editingId
          ? prior.map((site) => (site.id === editingId ? { ...site, ...saved } : site))
          : [...prior.filter((site) => site.id !== saved.id), saved],
      );
      this.sites.set(merged);
      this.sitesMessage.set(editingId ? 'Site updated.' : 'Site created.');
      this.siteBusy.set(false);
      this.closeSiteEditor(true);
      await this.loadSites();
      if (this.sitesLoadFailed()) {
        // Write succeeded; list refresh failed — keep merged list, clear success copy.
        this.sitesMessage.set('');
        this.sites.set(merged);
        this.monitor.ownedSitesServingStale.set(true);
        this.sitesLoadFailed.set(false);
        this.sitesError.set('');
      } else if (this.sitesStale()) {
        this.sitesMessage.set(
          editingId
            ? 'Site updated — showing cached list until refresh succeeds.'
            : 'Site created — showing cached list until refresh succeeds.',
        );
      }
    } catch (err: unknown) {
      this.sitesError.set(apiErrorMessage(err, 'Unable to save site. Try again.'));
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
    this.sites.set(prior.filter((item) => item.id !== site.id));
    try {
      await firstValueFrom(this.monitor.deleteStatusPage(site.id));
      if (this.editingSiteId() === site.id) {
        this.closeSiteEditor(true);
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

  private async linkProvider(kind: 'google' | 'apple'): Promise<void> {
    this.providerError.set('');
    this.providerMessage.set('');
    if (!this.online()) {
      this.providerError.set(OFFLINE_BODY);
      return;
    }
    this.providerBusy.set(true);
    try {
      const result =
        kind === 'google' ? await this.auth.linkGoogleAccount() : await this.auth.linkAppleAccount();
      if (!result.success) {
        this.providerError.set(result.error ?? `Unable to link ${kind}.`);
        return;
      }
      this.refreshLinkedProviders();
      this.providerMessage.set(
        kind === 'google' ? 'Google account linked.' : 'Apple account linked.',
      );
    } finally {
      this.providerBusy.set(false);
    }
  }

  private async unlinkProvider(providerId: string): Promise<void> {
    this.providerError.set('');
    this.providerMessage.set('');
    if (!this.online()) {
      this.providerError.set(OFFLINE_BODY);
      return;
    }
    const label = this.providerLabel(providerId);
    const confirmed = await this.dialog.confirm({
      title: `Unlink ${label}?`,
      body: `You will no longer be able to sign in with ${label} unless you link it again.`,
      confirmLabel: 'Unlink',
      cancelLabel: 'Keep linked',
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }
    this.providerBusy.set(true);
    try {
      const result = await this.auth.unlinkProvider(providerId);
      if (!result.success) {
        this.providerError.set(result.error ?? `Unable to unlink ${label}.`);
        return;
      }
      this.refreshLinkedProviders();
      this.providerMessage.set(`${label} unlinked.`);
    } finally {
      this.providerBusy.set(false);
    }
  }

  private async loadAccountExtras(): Promise<void> {
    await Promise.all([this.loadApiKeys(), this.loadSessions(), this.auth.refreshMfaState()]);
    this.refreshMfaFactors();
    this.refreshLinkedProviders();
  }

  private async loadApiKeys(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.apiKeysLoading.set(true);
    this.apiKeysError.set('');
    try {
      this.apiKeys.set(await this.accountApi.listApiKeys());
    } catch (err: unknown) {
      this.apiKeysError.set(apiErrorMessage(err, 'Unable to load API keys.'));
    } finally {
      this.apiKeysLoading.set(false);
    }
  }

  private async loadSessions(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.sessionsLoading.set(true);
    this.sessionsError.set('');
    try {
      this.sessions.set(await this.accountApi.listSessions());
    } catch (err: unknown) {
      this.sessionsError.set(apiErrorMessage(err, 'Unable to load sessions.'));
    } finally {
      this.sessionsLoading.set(false);
    }
  }

  private hydrateProfile(): void {
    const profile = this.auth.getAccountProfile();
    this.displayName.set(profile.displayName);
    this.email.set(profile.email);
  }

  private refreshLinkedProviders(): void {
    const user = this.auth.auth?.currentUser;
    if (!user) {
      this.linkedProviders.set([]);
      return;
    }
    this.linkedProviders.set(
      (user.providerData ?? []).map((provider) => ({
        providerId: provider.providerId,
        email: provider.email ?? '',
      })),
    );
  }

  private refreshMfaFactors(): void {
    const user = this.auth.auth?.currentUser;
    if (!user) {
      this.mfaFactors.set([]);
      return;
    }
    try {
      this.mfaFactors.set([...multiFactor(user).enrolledFactors]);
    } catch {
      this.mfaFactors.set([]);
    }
  }

  private clearMfaRecaptcha(): void {
    if (this.mfaRecaptchaVerifier) {
      try {
        this.mfaRecaptchaVerifier.clear();
      } catch {
        // Ignore clear failures on torn-down widgets.
      }
      this.mfaRecaptchaVerifier = null;
    }
  }

  private async ensureMfaRecaptcha(): Promise<RecaptchaVerifier> {
    if (!this.isBrowser) {
      throw new Error('MFA enrollment requires a browser.');
    }
    const auth = this.auth.auth;
    if (!auth || !('app' in auth)) {
      throw new Error('Firebase Auth is not available.');
    }
    if (this.mfaRecaptchaVerifier) {
      return this.mfaRecaptchaVerifier;
    }
    let element = this.document.getElementById('settings-mfa-recaptcha');
    if (!element) {
      element = this.document.createElement('div');
      element.id = 'settings-mfa-recaptcha';
      element.setAttribute('aria-hidden', 'true');
      this.document.body.appendChild(element);
    }
    this.mfaRecaptchaVerifier = new RecaptchaVerifier(auth, element, {
      size: 'invisible',
      callback: () => undefined,
      'expired-callback': () => this.clearMfaRecaptcha(),
      'error-callback': () => this.clearMfaRecaptcha(),
    });
    await this.mfaRecaptchaVerifier.render();
    return this.mfaRecaptchaVerifier;
  }

  retryLoadSites(): void {
    this.sitesRetrying.set(true);
    void this.loadSites();
  }

  private async loadSites(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      // Refuse owned-list fetch without a session — prevents public directory
      // from being cached under the auth SWR key.
      this.sitesLoading.set(false);
      return;
    }
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
      // After a successful write + invalidate, keep the last good UI list rather
      // than wiping to [] (which would lie as “no sites”).
      const keep = warm.length ? warm : this.sites();
      if (keep.length) {
        this.sites.set(keep);
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
