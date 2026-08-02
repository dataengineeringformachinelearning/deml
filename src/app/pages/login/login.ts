import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { CheckboxField } from '../../components/checkbox-field/checkbox-field';
import { FormPanel } from '../../components/form-panel/form-panel';
import { TextField } from '../../components/text-field/text-field';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormPanel, TextField, CheckboxField, Button, ButtonGroup, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: { class: 'page page--auth' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly remember = signal(true);
  readonly emailError = signal('');
  readonly passwordError = signal('');
  readonly formError = signal('');

  submit(event: Event): void {
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

    const name = email.split('@')[0] || 'Demo';
    this.auth.login({ id: email.toLowerCase(), name });
    void this.router.navigateByUrl('/dashboard');
  }
}
