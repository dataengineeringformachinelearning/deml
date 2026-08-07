import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const indexSource = readFileSync(resolve(process.cwd(), 'src/index.html'), 'utf8');
const vercelSource = readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8');
const routesSource = readFileSync(resolve(process.cwd(), 'src/app/app.routes.ts'), 'utf8');
const navbarSource = readFileSync(
  resolve(process.cwd(), 'backend/static/widgets/navbar.js'),
  'utf8',
);

describe('document shell isolation', () => {
  it('does not load third-party analytics in the document shell', () => {
    expect(indexSource).not.toContain(
      '<script async src="https://www.googletagmanager.com/gtag/js',
    );
    expect(indexSource).not.toContain('googletagmanager.com');
  });

  it('does not mount retired auth-status, blog, or dashboard product routes', () => {
    expect(routesSource).not.toContain("path: 'auth-status'");
    expect(routesSource).not.toContain('./pages/auth-status/auth-status');
    expect(routesSource).not.toContain('./pages/blog/');
    expect(routesSource).not.toContain("path: 'dashboard'");
  });

  it('keeps a headless auth-bridge for Django chrome (not product nav)', () => {
    expect(routesSource).toContain("path: 'auth-bridge'");
    expect(routesSource).toContain('bareShell: true');
    expect(navbarSource).toContain('/auth-bridge');
    expect(navbarSource).not.toContain('/auth-status');
    expect(navbarSource).toContain('/settings');
    expect(navbarSource).not.toContain('/dashboard');
  });

  it('ships SPA fallback and widget rewrites on Vercel CSR deploy', () => {
    expect(vercelSource).toContain('"source": "/assets/widget.js"');
    expect(vercelSource).toContain('"source": "/assets/widget.css"');
    expect(vercelSource).toContain('"destination": "/index.html"');
    const widgetJs = vercelSource.lastIndexOf('"source": "/assets/widget.js"');
    const catchAll = vercelSource.lastIndexOf('"source": "/(.*)"');
    expect(widgetJs).toBeGreaterThan(-1);
    expect(catchAll).toBeGreaterThan(widgetJs);
  });
});
