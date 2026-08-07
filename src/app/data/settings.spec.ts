import { resolveSettingsSection } from './settings';

describe('resolveSettingsSection', () => {
  it('maps direct section ids', () => {
    expect(resolveSettingsSection('account')).toBe('account');
    expect(resolveSettingsSection('sites')).toBe('sites');
  });

  it('maps legacy aliases to account', () => {
    expect(resolveSettingsSection('profile')).toBe('account');
    expect(resolveSettingsSection('billing')).toBe('account');
    expect(resolveSettingsSection('preferences')).toBe('account');
    expect(resolveSettingsSection('appearance')).toBe('account');
  });

  it('returns null for unknown values', () => {
    expect(resolveSettingsSection('')).toBeNull();
    expect(resolveSettingsSection('nope')).toBeNull();
  });
});
