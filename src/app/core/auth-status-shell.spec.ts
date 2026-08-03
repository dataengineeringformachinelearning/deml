import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const indexSource = readFileSync(resolve(process.cwd(), 'src/index.html'), 'utf8');
const vercelSource = readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8');
const routesSource = readFileSync(resolve(process.cwd(), 'src/app/app.routes.ts'), 'utf8');

describe('auth-status document isolation', () => {
  it('does not load third-party analytics in the document shell', () => {
    expect(indexSource).not.toContain(
      '<script async src="https://www.googletagmanager.com/gtag/js',
    );
    expect(indexSource).not.toContain('googletagmanager.com');
  });

  it('keeps the auth-status route available for the embed bridge', () => {
    expect(routesSource).toContain("path: 'auth-status'");
    expect(routesSource).toContain('./pages/auth-status/auth-status');
  });

  it('ships SPA fallback and widget rewrites on Vercel CSR deploy', () => {
    expect(vercelSource).toContain('"source": "/assets/widget.js"');
    expect(vercelSource).toContain('"source": "/assets/widget.css"');
    expect(vercelSource).toContain('"destination": "/index.html"');
    // Catch-all SPA rewrite must be last so widget rewrites win.
    const widgetJs = vercelSource.lastIndexOf('"source": "/assets/widget.js"');
    const catchAll = vercelSource.lastIndexOf('"source": "/(.*)"');
    expect(widgetJs).toBeGreaterThan(-1);
    expect(catchAll).toBeGreaterThan(widgetJs);
  });
});
