export type SettingsSectionId = 'account' | 'sites';

export interface SettingsSectionLink {
  readonly id: SettingsSectionId;
  readonly label: string;
}

/** In-page anchors — account identity + status sites only. */
export const SETTINGS_SECTION_LINKS: readonly SettingsSectionLink[] = [
  { id: 'account', label: 'Account' },
  { id: 'sites', label: 'Sites' },
];

const SECTION_IDS = new Set<string>(SETTINGS_SECTION_LINKS.map((link) => link.id));

/** Map legacy `?tab=` / fragment values onto a settings section id. */
export const resolveSettingsSection = (raw: string | null | undefined): SettingsSectionId | null => {
  if (!raw) {
    return null;
  }
  const key = raw.trim().toLowerCase();
  if (SECTION_IDS.has(key)) {
    return key as SettingsSectionId;
  }
  if (
    key === 'profile' ||
    key === 'security' ||
    key === 'billing' ||
    key === 'preferences' ||
    key === 'appearance' ||
    key === 'notifications' ||
    key === 'theme' ||
    key === 'delivery'
  ) {
    return 'account';
  }
  return null;
};
