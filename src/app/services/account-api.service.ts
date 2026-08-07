import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

import { environment } from '../../environments/environment';

export type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
};

export type ApiKeyGenerateResponse = {
  status: string;
  name: string;
  key: string;
  prefix: string;
};

export type SessionRow = {
  session_id: string;
  user_agent: string;
  ip: string;
  created_at: number;
  last_seen: number;
};

/** Account credentials API — API keys + session registry (list/revoke). */
@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);
  private static readonly TIMEOUT_MS = 15_000;

  private readonly authBase = `${environment.backendUrl}/api/v1/auth`;

  listApiKeys = (): Promise<ApiKeyRow[]> =>
    firstValueFrom(
      this.http
        .get<ApiKeyRow[]>(`${this.authBase}/api-keys`)
        .pipe(timeout({ first: AccountApiService.TIMEOUT_MS })),
    );

  generateApiKey = (name: string): Promise<ApiKeyGenerateResponse> =>
    firstValueFrom(
      this.http
        .post<ApiKeyGenerateResponse>(`${this.authBase}/api-keys/generate`, { name })
        .pipe(timeout({ first: AccountApiService.TIMEOUT_MS })),
    );

  revokeApiKey = (keyId: string): Promise<void> =>
    firstValueFrom(
      this.http
        .delete(`${this.authBase}/api-keys/${keyId}`)
        .pipe(timeout({ first: AccountApiService.TIMEOUT_MS })),
    ).then(() => undefined);

  listSessions = (): Promise<SessionRow[]> =>
    firstValueFrom(
      this.http
        .get<SessionRow[]>(`${this.authBase}/sessions`)
        .pipe(timeout({ first: AccountApiService.TIMEOUT_MS })),
    );

  revokeSession = (sessionId: string): Promise<void> =>
    firstValueFrom(
      this.http
        .delete(`${this.authBase}/sessions/${sessionId}`)
        .pipe(timeout({ first: AccountApiService.TIMEOUT_MS })),
    ).then(() => undefined);
}
