import { resolveSettingsSection } from './settings';

describe('resolveSettingsSection', () => {
  it('maps direct section ids', () => {
    expect(resolveSettingsSection('account')).toBe('account');
    expect(resolveSettingsSection('sites')).toBe('sites');
    expect(resolveSettingsSection('preferences')).toBe('preferences');
  });

  it('maps legacy tab aliases', () => {
    expect(resolveSettingsSection('profile')).toBe('account');
    expect(resolveSettingsSection('billing')).toBe('account');
    expect(resolveSettingsSection('notifications')).toBe('preferences');
  });

  it('returns null for unknown values', () => {
    expect(resolveSettingsSection('')).toBeNull();
    expect(resolveSettingsSection('nope')).toBeNull();
  });
});
