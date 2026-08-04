import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { FormPanel } from '../../components/form-panel/form-panel';
import { PageSection } from '../../components/page-section/page-section';
import { TextField } from '../../components/text-field/text-field';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mfa',
  imports: [PageSection, FormPanel, TextField, Button, ButtonGroup, RouterLink],
  templateUrl: './mfa.html',
  host: { class: 'page page--auth' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mfa implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly code = signal('');
  readonly codeError = signal('');
  readonly formError = signal('');
  readonly busy = signal(false);
  readonly codeSent = signal(false);
  readonly sending = signal(false);

  readonly phoneHint = this.auth.mfaPhoneHint;

  readonly description = computed(() => {
    const phone = this.phoneHint();
    if (phone) {
      return `Enter the SMS verification code sent to ${phone}.`;
    }
    return 'Enter the SMS verification code sent to your enrolled phone number.';
  });

  readonly loginQueryParams = computed(() => {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl ? { returnUrl } : {};
  });

  ngOnInit(): void {
    if (!this.auth.hasPendingMfaChallenge()) {
      void this.router.navigate(['/login'], {
        queryParams: this.loginQueryParams(),
        replaceUrl: true,
      });
      return;
    }
    void this.sendCode();
  }

  async sendCode(): Promise<void> {
    if (this.sending() || this.busy()) {
      return;
    }

    this.sending.set(true);
    this.formError.set('');
    this.codeError.set('');

    try {
      const result = await this.auth.sendMfaSignInCode();
      if (!result.success) {
        this.formError.set(result.error ?? 'Failed to send verification code.');
        this.codeSent.set(false);
        return;
      }
      this.codeSent.set(true);
    } finally {
      this.sending.set(false);
    }
  }

  async resend(): Promise<void> {
    this.code.set('');
    await this.sendCode();
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();

    const code = this.code().trim();
    this.codeError.set('');
    this.formError.set('');

    if (!this.codeSent()) {
      this.formError.set('Wait for the verification code to send, then try again.');
      return;
    }

    if (!code) {
      this.codeError.set('Enter the verification code.');
      return;
    }

    this.busy.set(true);
    try {
      const result = await this.auth.resolveMfaSignIn(code);
      if (!result.success) {
        this.formError.set(result.error ?? 'Unable to verify the code.');
        return;
      }
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } finally {
      this.busy.set(false);
    }
  }

  cancel(): void {
    this.auth.clearMfaChallenge();
  }
}
