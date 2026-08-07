import { describe, expect, it } from 'vitest';
import { DEFAULT_POST_LOGIN_PATH, resolvePostLoginTarget } from './return-url.utils';

describe('resolvePostLoginTarget', () => {
  const options = {
    marketingOrigin: 'https://dataengineeringformachinelearning.com',
    appOrigin: 'https://deml.app',
  };

  it('defaults to settings when returnUrl is missing', () => {
    expect(resolvePostLoginTarget(undefined, options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
    expect(resolvePostLoginTarget('', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
  });

  it('keeps safe in-app relative paths', () => {
    expect(resolvePostLoginTarget('/settings', options)).toEqual({
      kind: 'app',
      url: '/settings',
    });
    expect(resolvePostLoginTarget('/settings?tab=billing', options)).toEqual({
      kind: 'app',
      url: '/settings?tab=billing',
    });
  });

  it('sends bare home to settings', () => {
    expect(resolvePostLoginTarget('/', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
  });

  it('rejects absolute URLs passed through navigateByUrl (the /https: bug)', () => {
    expect(resolvePostLoginTarget('https://deml.app/explore', options)).toEqual({
      kind: 'app',
      url: '/explore',
    });
    expect(resolvePostLoginTarget('https://deml.app/', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
    expect(resolvePostLoginTarget('/https:', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
    expect(resolvePostLoginTarget('https:', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
  });

  it('allows marketing-site returns as external navigation', () => {
    expect(
      resolvePostLoginTarget(
        'https://dataengineeringformachinelearning.com/documentation/',
        options,
      ),
    ).toEqual({
      kind: 'external',
      url: 'https://dataengineeringformachinelearning.com/documentation/',
    });
  });

  it('sends auth loops and unknown hosts to settings', () => {
    expect(resolvePostLoginTarget('/login', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
    expect(resolvePostLoginTarget('/signup', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
    expect(resolvePostLoginTarget('/mfa', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
    expect(resolvePostLoginTarget('https://deml.app/login?mode=register', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
    expect(resolvePostLoginTarget('https://evil.example/phish', options)).toEqual({
      kind: 'app',
      url: DEFAULT_POST_LOGIN_PATH,
    });
  });
});
