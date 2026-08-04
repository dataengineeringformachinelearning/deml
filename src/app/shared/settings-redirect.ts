import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import type { SettingsSectionId } from '../data/settings';

/** Redirect legacy /account and /sites bookmarks to the unified settings page. */
export const settingsSectionRedirect = (section: SettingsSectionId): CanActivateFn => {
  return () => inject(Router).createUrlTree(['/settings'], { fragment: section });
};
