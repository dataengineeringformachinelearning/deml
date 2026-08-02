import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { CheckboxField } from '../../components/checkbox-field/checkbox-field';
import { FormPanel } from '../../components/form-panel/form-panel';
import { PageSection } from '../../components/page-section/page-section';
import { TextField } from '../../components/text-field/text-field';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [PageSection, FormPanel, TextField, CheckboxField, Button, ButtonGroup, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: { class: 'page page--auth' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal('');
  readonly password = signal('');
  readonly remember = signal(true);
  readonly emailError = signal('');
  readonly passwordError = signal('');
  readonly formError = signal('');
  readonly busy = signal(false);

  async submit(event: Event): Promise<void> {
    event.preventDefault();

    const email = this.email().trim();
    const password = this.password();
    let valid = true;

    this.emailError.set('');
    this.passwordError.set('');
    this.formError.set('');

    if (!email) {
      this.emailError.set('Enter your email.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.emailError.set('Enter a valid email address.');
      valid = false;
    }

    if (!password) {
      this.passwordError.set('Enter your password.');
      valid = false;
    }

    if (!valid) {
      return;
    }

    this.busy.set(true);
    try {
      const result = await this.auth.login({ username: email.toLowerCase(), password });
      if (!result.success) {
        this.formError.set(result.error ?? 'Unable to log in.');
        return;
      }
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } finally {
      this.busy.set(false);
    }
  }
}
