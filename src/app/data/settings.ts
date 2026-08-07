export type SettingsSectionId =
  | 'account'
  | 'security'
  | 'connected'
  | 'integrations'
  | 'sessions'
  | 'sites'
  | 'danger';

export interface SettingsSectionLink {
  readonly id: SettingsSectionId;
  readonly label: string;
}

/** In-page anchors for account, security, credentials, and sites. */
export const SETTINGS_SECTION_LINKS: readonly SettingsSectionLink[] = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'connected', label: 'Connected accounts' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'sites', label: 'Sites' },
  { id: 'danger', label: 'Delete account' },
];

const SECTION_IDS = new Set<string>(SETTINGS_SECTION_LINKS.map((link) => link.id));

const SECTION_ALIASES: Readonly<Record<string, SettingsSectionId>> = {
  profile: 'account',
  password: 'account',
  mfa: 'security',
  'two-factor': 'security',
  providers: 'connected',
  google: 'connected',
  apple: 'connected',
  'api-keys': 'integrations',
  keys: 'integrations',
  credentials: 'integrations',
  session: 'sessions',
  delete: 'danger',
  'delete-account': 'danger',
};

/** Resolve fragment / `?section=` onto a settings section id. */
export const resolveSettingsSection = (raw: string | null | undefined): SettingsSectionId | null => {
  if (!raw) {
    return null;
  }
  const key = raw.trim().toLowerCase();
  if (SECTION_IDS.has(key)) {
    return key as SettingsSectionId;
  }
  return SECTION_ALIASES[key] ?? null;
};
