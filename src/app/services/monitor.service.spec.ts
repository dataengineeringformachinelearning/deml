import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  MonitorService,
  filterOwnedStatusPages,
  isPlatformStatusPage,
  publicStatusPageTag,
} from './monitor.service';
import { API_ENDPOINTS } from '../core/constants/api.constants';

describe('MonitorService', () => {
  let service: MonitorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MonitorService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MonitorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('labels user pages separately from the platform page', () => {
    expect(publicStatusPageTag('joealongi-dev')).toBe('Public Status Page');
    expect(publicStatusPageTag('platform-status')).toBe('Platform Status');
    expect(publicStatusPageTag('loading')).toBe('Loading');
    expect(isPlatformStatusPage('platform-status')).toBe(true);
    expect(isPlatformStatusPage({ slug: 'joealongi-dev' })).toBe(false);
    expect(
      filterOwnedStatusPages([
        { slug: 'platform-status' },
        { slug: 'joealongi-dev' },
      ]).map(page => page.slug),
    ).toEqual(['joealongi-dev']);
  });

  it('should fetch the public status directory including platform', () => {
    const mockPages = [
      {
        id: 'p1',
        title: 'Platform Status',
        slug: 'platform-status',
        description: '',
        created_at: '',
        user_id: 1,
      },
    ];

    service.getStatusPages().subscribe(pages => {
      expect(pages.length).toBe(1);
      expect(pages[0].slug).toBe('platform-status');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES);
    expect(req.request.method).toBe('GET');
    req.flush(mockPages);
  });

  it('should filter platform pages from owned status lists', () => {
    const mockPages = [
      {
        id: 'p1',
        title: 'Platform Status',
        slug: 'platform-status',
        description: '',
        created_at: '',
        user_id: null,
      },
      {
        id: 'p2',
        title: 'joealongi.dev',
        slug: 'joealongi-dev',
        description: '',
        created_at: '',
        user_id: 1,
      },
    ];

    service.getOwnedStatusPages().subscribe(pages => {
      expect(pages.map(page => page.slug)).toEqual(['joealongi-dev']);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES);
    expect(req.request.method).toBe('GET');
    req.flush(mockPages);
  });

  it('coalesces concurrent status-page requests and revalidates the warm value', async () => {
    const results: number[] = [];
    service.getStatusPages().subscribe(pages => results.push(pages.length));
    service.getStatusPages().subscribe(pages => results.push(pages.length));

    const first = httpMock.expectOne(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES);
    first.flush([]);
    expect(results).toEqual([0, 0]);

    await Promise.resolve();
    service.getStatusPages().subscribe();
    httpMock.expectOne(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES).flush([]);
  });

  it('should create a status page', () => {
    const payload = { title: 'New Page', slug: 'new-slug' };
    const mockCreated = {
      id: 'p2',
      title: 'New Page',
      slug: 'new-slug',
      description: '',
      created_at: '',
      user_id: 1,
    };

    service.createStatusPage(payload).subscribe(page => {
      expect(page.id).toBe('p2');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('Idempotency-Key')).toBeTruthy();
    req.flush(mockCreated);
  });

  it('should delete a status page', () => {
    service.deleteStatusPage('p2').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES}/p2`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
