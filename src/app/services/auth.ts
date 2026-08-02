import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<{ id: string; name: string } | null>(null);

  readonly loggedIn = computed(() => this.user() !== null);
  readonly currentUser = this.user.asReadonly();

  login(user: { id: string; name: string } = { id: 'demo', name: 'Demo' }): void {
    this.user.set(user);
  }

  logout(): void {
    this.user.set(null);
  }
}
