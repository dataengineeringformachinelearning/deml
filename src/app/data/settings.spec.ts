import { resolveSettingsSection } from './settings';

describe('resolveSettingsSection', () => {
  it('maps direct section ids', () => {
    expect(resolveSettingsSection('account')).toBe('account');
    expect(resolveSettingsSection('security')).toBe('security');
    expect(resolveSettingsSection('connected')).toBe('connected');
    expect(resolveSettingsSection('integrations')).toBe('integrations');
    expect(resolveSettingsSection('sessions')).toBe('sessions');
    expect(resolveSettingsSection('sites')).toBe('sites');
    expect(resolveSettingsSection('danger')).toBe('danger');
  });

  it('maps aliases onto sections', () => {
    expect(resolveSettingsSection('profile')).toBe('account');
    expect(resolveSettingsSection('mfa')).toBe('security');
    expect(resolveSettingsSection('api-keys')).toBe('integrations');
    expect(resolveSettingsSection('delete-account')).toBe('danger');
  });

  it('returns null for unknown values', () => {
    expect(resolveSettingsSection('')).toBeNull();
    expect(resolveSettingsSection('billing')).toBeNull();
    expect(resolveSettingsSection('nope')).toBeNull();
  });
});
