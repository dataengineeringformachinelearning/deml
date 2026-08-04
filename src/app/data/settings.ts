export type SettingsSectionId = 'account' | 'sites' | 'preferences';

export interface SettingsSectionLink {
  readonly id: SettingsSectionId;
  readonly label: string;
}

/** In-page section anchors for the unified settings editor. */
export const SETTINGS_SECTION_LINKS: readonly SettingsSectionLink[] = [
  { id: 'account', label: 'Account' },
  { id: 'sites', label: 'Sites' },
  { id: 'preferences', label: 'Preferences' },
];

const SECTION_IDS = new Set<string>(SETTINGS_SECTION_LINKS.map((link) => link.id));

/** Map legacy `?tab=` / `?section=` values onto a settings section id. */
export const resolveSettingsSection = (raw: string | null | undefined): SettingsSectionId | null => {
  if (!raw) {
    return null;
  }
  const key = raw.trim().toLowerCase();
  if (SECTION_IDS.has(key)) {
    return key as SettingsSectionId;
  }
  if (key === 'profile' || key === 'security' || key === 'billing') {
    return 'account';
  }
  if (key === 'notifications' || key === 'theme' || key === 'delivery') {
    return 'preferences';
  }
  return null;
};
