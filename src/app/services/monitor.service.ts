import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap, timeout } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api.constants';
import { SwrCacheService } from '../core/cache/swr-cache.service';
import { SKIP_AUTH } from '../core/interceptors/credentials.interceptor';

/** Align with BFF/FORJD read budget (client retries included). */
const STATUS_READ_TIMEOUT_MS = 25_000;
const STATUS_WRITE_TIMEOUT_MS = 20_000;

export interface StatusPageData {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_published?: boolean;
  created_at: string;
  user_id: number | null;
  overall_uptime?: number;
  uptime_history?: { date: string; status: string; uptime: number | null }[];
  /** Embedded on the public slug / directory payload (SoT for product UI). */
  services?: MonitoredServiceData[];
  incidents?: IncidentData[];
}

export interface MonitoredServiceData {
  id: string;
  name: string;
  url: string;
  status_page_id: string;
  created_at: string;
  status?: string;
  sla?: number | null;
  uptime_history?: { date: string; status: string; uptime: number | null }[];
  p99_latency?: number | null;
}

export interface IncidentData {
  id: string;
  title: string;
  message: string;
  status: string;
  status_page_id: string;
  created_at: string;
  updated_at: string;
}

/** DEML platform status page (tenant0) — never a user-owned site. */
export const PLATFORM_STATUS_SLUG = 'platform-status';

export const isPlatformStatusPage = (
  page: Pick<StatusPageData, 'slug'> | string | null | undefined,
): boolean => {
  const slug = typeof page === 'string' ? page : page?.slug;
  return slug === PLATFORM_STATUS_SLUG;
};

/** Drop platform/tenant0 pages from account-scoped site lists. */
export const filterOwnedStatusPages = <T extends Pick<StatusPageData, 'slug'>>(
  pages: readonly T[] | null | undefined,
): T[] => (Array.isArray(pages) ? pages.filter(page => !isPlatformStatusPage(page)) : []);

export const publicStatusPageTag = (slug: string): string => {
  if (slug === 'loading') return 'Loading';
  return isPlatformStatusPage(slug) ? 'Platform Status' : 'Public Status Page';
};

/**
 * Status data plane client — directory, slug embed, owned CRUD only.
 * No enrichment, endpoints, or third-party integrations.
 */
@Injectable({
  providedIn: 'root',
})
export class MonitorService {
  private http = inject(HttpClient);
  private swr = inject(SwrCacheService);

  /** True when public directory is painted from SWR cache after a failed refresh. */
  readonly directoryServingStale = signal(false);
  /** True when owned sites list is painted from SWR cache after a failed refresh. */
  readonly ownedSitesServingStale = signal(false);
  /** True when a public slug page is painted from SWR cache after a failed refresh. */
  readonly slugServingStale = signal(false);

  /** Public explore directory (cross-tenant published + platform). Never send auth. */
  getStatusPages(): Observable<StatusPageData[]> {
    const key = this.swr.key('status:pages:public', {});
    return this.swr.observe(
      key,
      () =>
        this.http
          .get<StatusPageData[]>(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES, {
            withCredentials: true,
            context: new HttpContext().set(SKIP_AUTH, true),
          })
          .pipe(
            timeout({ first: STATUS_READ_TIMEOUT_MS }),
            tap(() => this.directoryServingStale.set(false)),
          ),
      {
        freshMs: 0,
        staleMs: 5 * 60_000,
        scope: 'public-status',
        onRevalidateError: () => this.directoryServingStale.set(true),
      },
    );
  }

  /** Account-scoped sites for Settings — excludes platform/tenant0. */
  getOwnedStatusPages(): Observable<StatusPageData[]> {
    const key = this.swr.key('status:pages:owned', {});
    return this.swr.observe(
      key,
      () =>
        this.http
          .get<StatusPageData[]>(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES, {
            withCredentials: true,
          })
          .pipe(
            timeout({ first: STATUS_READ_TIMEOUT_MS }),
            map(pages => filterOwnedStatusPages(pages)),
            tap(() => this.ownedSitesServingStale.set(false)),
          ),
      {
        freshMs: 0,
        staleMs: 5 * 60_000,
        scope: 'auth',
        onRevalidateError: () => this.ownedSitesServingStale.set(true),
      },
    );
  }

  /** Synchronous SWR peek for optimistic explore directory paint. */
  peekStatusPages(): StatusPageData[] | undefined {
    return this.swr.get<StatusPageData[]>(this.swr.key('status:pages:public', {}));
  }

  /** Synchronous SWR peek for Settings sites (already platform-filtered). */
  peekOwnedStatusPages(): StatusPageData[] | undefined {
    return this.swr.get<StatusPageData[]>(this.swr.key('status:pages:owned', {}));
  }

  /** Synchronous SWR peek for a public slug page (provisional until revalidate). */
  peekStatusPageBySlug(slug: string): StatusPageData | undefined {
    return this.swr.get<StatusPageData>(this.swr.key('status:slug', { slug }));
  }

  getStatusPageBySlug(slug: string) {
    const key = this.swr.key('status:slug', { slug });
    return this.swr.observe(
      key,
      () =>
        this.http
          .get<StatusPageData>(
            `${API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES}/slug/${encodeURIComponent(slug)}`,
            {
              withCredentials: true,
              context: new HttpContext().set(SKIP_AUTH, true),
            },
          )
          .pipe(
            timeout({ first: STATUS_READ_TIMEOUT_MS }),
            tap(() => this.slugServingStale.set(false)),
          ),
      {
        freshMs: 0,
        staleMs: 10 * 60_000,
        scope: 'public-status',
        onRevalidateError: () => this.slugServingStale.set(true),
      },
    );
  }

  private invalidateStatusReads(): void {
    this.swr.invalidate('status:pages');
    this.swr.invalidate('status:slug');
  }

  createStatusPage(data: {
    title: string;
    slug: string;
    description?: string;
    is_published?: boolean;
  }) {
    const idempotencyKey =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `create-${Date.now()}`;
    return this.http
      .post<StatusPageData>(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES, data, {
        withCredentials: true,
        headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
      })
      .pipe(
        timeout({ first: STATUS_WRITE_TIMEOUT_MS }),
        tap(() => this.invalidateStatusReads()),
      );
  }

  updateStatusPage(
    pageId: string,
    data: {
      title: string;
      slug: string;
      description?: string;
      is_published?: boolean;
    },
  ) {
    return this.http
      .put<StatusPageData>(`${API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES}/${pageId}`, data, {
        withCredentials: true,
      })
      .pipe(
        timeout({ first: STATUS_WRITE_TIMEOUT_MS }),
        tap(() => this.invalidateStatusReads()),
      );
  }

  deleteStatusPage(pageId: string) {
    return this.http
      .delete(`${API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES}/${pageId}`, {
        withCredentials: true,
      })
      .pipe(
        timeout({ first: STATUS_WRITE_TIMEOUT_MS }),
        tap(() => this.invalidateStatusReads()),
      );
  }
}
