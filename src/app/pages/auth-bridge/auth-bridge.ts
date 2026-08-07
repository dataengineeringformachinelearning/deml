import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

/**
 * Headless cross-origin auth bridge for Django (and similar) chrome.
 * Not product nav — iframe / `postMessage` only (`AUTH_STATUS` / sign-out).
 */
@Component({
  selector: 'app-auth-bridge',
  template: '',
  host: {
    class: 'auth-bridge',
    'aria-hidden': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthBridge implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private parentOrigin = '';

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const params = this.route.snapshot.queryParamMap;
    this.parentOrigin = this.trustedParentOrigin(params.get('parent_origin')?.trim() ?? '');

    const action = params.get('action');
    if (action === 'signout') {
      void this.auth.logout().finally(() => this.postStatus());
    } else {
      this.postStatus();
    }

    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (!this.parentOrigin || event.origin !== this.parentOrigin) {
        return;
      }
      if (event.data?.type === 'AUTH_STATUS_REQUEST') {
        this.postStatus();
      }
    };
    win.addEventListener('message', onMessage);
    this.destroyRef.onDestroy(() => win.removeEventListener('message', onMessage));

    toObservable(this.auth.isAuthenticated)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.postStatus());
  }

  private allowedOrigins(): Set<string> {
    const origins = new Set<string>();
    for (const raw of [
      environment.marketingUrl,
      environment.backendUrl,
      environment.frontendUrl,
      'http://localhost:4321',
      'http://127.0.0.1:4321',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'https://dataengineeringformachinelearning.com',
      'https://www.dataengineeringformachinelearning.com',
      'https://backend.deml.app',
    ]) {
      try {
        if (raw) {
          origins.add(new URL(raw).origin);
        }
      } catch {
        /* ignore bad env */
      }
    }
    return origins;
  }

  private trustedParentOrigin(candidate: string): string {
    if (!candidate) {
      return '';
    }
    try {
      const origin = new URL(candidate).origin;
      return this.allowedOrigins().has(origin) ? origin : '';
    } catch {
      return '';
    }
  }

  private postStatus(): void {
    if (!this.parentOrigin || !this.document.defaultView?.parent) {
      return;
    }
    const payload = {
      type: 'AUTH_STATUS',
      isAuthenticated: this.auth.isAuthenticated(),
      userId: this.auth.currentUserId(),
      role: this.auth.currentUserRole(),
      timestamp: Date.now(),
    };
    this.document.defaultView.parent.postMessage(payload, this.parentOrigin);
  }
}
