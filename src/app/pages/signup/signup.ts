import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { CheckboxField } from '../../components/checkbox-field/checkbox-field';
import { FormPanel } from '../../components/form-panel/form-panel';
import { PageSection } from '../../components/page-section/page-section';
import { TextField } from '../../components/text-field/text-field';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [PageSection, FormPanel, TextField, CheckboxField, Button, ButtonGroup, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  host: { class: 'page page--auth' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly acceptTerms = signal(false);

  readonly nameError = signal('');
  readonly emailError = signal('');
  readonly passwordError = signal('');
  readonly confirmError = signal('');
  readonly formError = signal('');

  submit(event: Event): void {
    event.preventDefault();

    const name = this.name().trim();
    const email = this.email().trim();
    const password = this.password();
    const confirmPassword = this.confirmPassword();
    let valid = true;

    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.confirmError.set('');
    this.formError.set('');

    if (!name) {
      this.nameError.set('Enter your name.');
      valid = false;
    }

    if (!email) {
      this.emailError.set('Enter your email.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.emailError.set('Enter a valid email address.');
      valid = false;
    }

    if (!password) {
      this.passwordError.set('Choose a password.');
      valid = false;
    } else if (password.length < 8) {
      this.passwordError.set('Use at least 8 characters.');
      valid = false;
    }

    if (!confirmPassword) {
      this.confirmError.set('Confirm your password.');
      valid = false;
    } else if (password !== confirmPassword) {
      this.confirmError.set('Passwords do not match.');
      valid = false;
    }

    if (!this.acceptTerms()) {
      this.formError.set('Accept the terms to continue.');
      valid = false;
    }

    if (!valid) {
      return;
    }

    this.auth.login({ id: email.toLowerCase(), name });
    void this.router.navigateByUrl('/dashboard');
  }
}
