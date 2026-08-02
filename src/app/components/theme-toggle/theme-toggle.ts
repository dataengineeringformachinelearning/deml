import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { LucideMoon, LucideSun } from '@lucide/angular';

import { ThemeService } from '../../services/theme';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-theme-toggle',
  imports: [LucideMoon, LucideSun],
  templateUrl: './theme-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
