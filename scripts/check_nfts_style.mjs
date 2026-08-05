#!/usr/bin/env node
/**
 * NFTS (new-from-the-start / warm ash) style enforcement for deml.
 * Fails the process on any drift from THEME.md / deml-ui SoT.
 * No escape hatches — product UI is a pure deml-ui consumer.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const errors = [];

const NFTS_HEX = new Set(
  [
    '35312d',
    '1c1916',
    'f3f0ea',
    'd4cec5',
    '2f5f8f',
    '3f6b54',
    '9e3d47',
    'c6c0b7',
    '4a453f',
    '9bb8d4',
    'ffffff',
    '000000',
  ].map((h) => h.toLowerCase()),
);

/** Hex only allowed in theme bootstrap surfaces (must still be NFTS palette). */
const HEX_ALLOW_FILES = new Set([
  'src/index.html',
  'src/app/services/theme.ts',
]);

const SCAN_EXTS = new Set(['.ts', '.html', '.css', '.scss', '.js', '.mjs']);
const IGNORE_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  '.git',
  'coverage',
  'vendor',
  '.angular',
]);

function fail(msg) {
  errors.push(msg);
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIR_NAMES.has(name)) continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function rel(p) {
  return relative(ROOT, p).split('\\').join('/');
}

function read(p) {
  return readFileSync(p, 'utf8');
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function stripCommentsTs(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

// --- 1) angular.json must load deml-ui CSS ---
{
  const angularPath = join(ROOT, 'angular.json');
  if (!existsSync(angularPath)) {
    fail('angular.json missing');
  } else {
    const angular = read(angularPath);
    if (!angular.includes('node_modules/deml-ui/dist/styles/deml-ui.css')) {
      fail(
        'angular.json must include node_modules/deml-ui/dist/styles/deml-ui.css in styles',
      );
    }
  }
}

// --- 2) No DS chrome CSS under src/app ---
{
  const appCss = walk(join(ROOT, 'src/app')).filter((p) => extname(p) === '.css');
  for (const p of appCss) {
    fail(`Forbidden component CSS (DS chrome belongs in deml-ui): ${rel(p)}`);
  }
}

// --- 3) No styleUrl / styleUrls / styles: in Angular component metadata ---
{
  const tsFiles = walk(join(ROOT, 'src/app')).filter((p) => extname(p) === '.ts');
  const styleProp =
    /\bstyleUrls?\s*:|\bstyles\s*:\s*\[|\bstyles\s*:\s*`|\bstyles\s*:\s*'/;
  for (const p of tsFiles) {
    if (p.endsWith('.spec.ts')) continue;
    const body = stripCommentsTs(read(p));
    if (styleProp.test(body)) {
      fail(
        `Forbidden styleUrl/styleUrls/styles in product component: ${rel(p)}`,
      );
    }
  }
}

// --- 4) src/styles.css must not grow product chrome ---
{
  const stylesPath = join(ROOT, 'src/styles.css');
  if (existsSync(stylesPath)) {
    const raw = read(stylesPath);
    const withoutComments = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .trim();
    if (withoutComments.length > 0) {
      fail(
        'src/styles.css must stay empty of product rules (deml-ui owns chrome). Found non-comment CSS.',
      );
    }
  }
}

// --- 5) Viking / retired naming ---
{
  const roots = ['src', 'backend', 'docs', 'scripts'].map((d) => join(ROOT, d));
  const vikingRe = /viking-ui|--viking-|@dataengineeringformachinelearning\/viking-ui|packages\/viking-ui|\bviking-[a-z]/i;
  const skip = (r) =>
    r.includes('/vendor/') ||
    r.endsWith('deml-ui.css') ||
    r.endsWith('deml-ui-elements.js') ||
    r.endsWith('deml-ui.iife.js.map') ||
    r.includes('deml-ui-tokens.css');
  for (const root of roots) {
    for (const p of walk(root)) {
      const r = rel(p);
      if (skip(r)) continue;
      if (!SCAN_EXTS.has(extname(p)) && !r.endsWith('.md') && !r.endsWith('.yml')) {
        continue;
      }
      // Docs may mention Viking as retired — allow "Viking" word in docs only when forbidding.
      const text = read(p);
      if (r.startsWith('docs/') || r.endsWith('AGENTS.md') || r.endsWith('THEME.md') || r.endsWith('.cursorrules')) {
        if (/\b--viking-|\bviking-[a-z]+|packages\/viking-ui|@dataengineeringformachinelearning\/viking-ui/i.test(text)) {
          // Mentions of retired paths in "do not use" docs are OK if not importing.
          if (/from ['"].*viking|import .*viking|require\(['"].*viking/i.test(text)) {
            fail(`Viking import in docs/standards: ${r}`);
          }
        }
        continue;
      }
      if (vikingRe.test(text)) {
        // Allow prose "Viking-UI is retired" in comments of sync scripts
        if (
          r.startsWith('scripts/') &&
          /retired|forbidden|do not|never/i.test(text) &&
          !/addEventListener\(\s*['"]viking-/i.test(text)
        ) {
          continue;
        }
        fail(`Viking naming / tokens forbidden: ${r}`);
      }
    }
  }
  if (existsSync(join(ROOT, 'packages/viking-ui'))) {
    fail('packages/viking-ui must not exist');
  }
}

// --- 6) Hardcoded hex in product TS/HTML/CSS ---
{
  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  const productRoots = [join(ROOT, 'src')];
  for (const root of productRoots) {
    for (const p of walk(root)) {
      const r = rel(p);
      if (!SCAN_EXTS.has(extname(p))) continue;
      if (r.includes('.spec.')) {
        // Specs: no raw hex at all — use CSS variables.
        const text = read(p);
        const matches = [...text.matchAll(hexRe)];
        for (const m of matches) {
          fail(`Hardcoded hex in spec (use deml-ui CSS vars): ${r} → ${m[0]}`);
        }
        continue;
      }
      const text = read(p);
      const matches = [...text.matchAll(hexRe)];
      for (const m of matches) {
        const raw = m[0];
        let hex = m[1].toLowerCase();
        if (hex.length === 3) {
          hex = hex
            .split('')
            .map((c) => c + c)
            .join('');
        }
        if (hex.length === 8) hex = hex.slice(0, 6);
        if (!HEX_ALLOW_FILES.has(r)) {
          fail(`Hardcoded hex outside theme bootstrap allowlist: ${r} → ${raw}`);
          continue;
        }
        if (!NFTS_HEX.has(hex)) {
          fail(`Non-NFTS hex in theme bootstrap: ${r} → ${raw}`);
        }
      }
    }
  }
}

// --- 7) Forbidden type / CDN stacks ---
{
  const forbiddenType =
    /\bSyne\b|\bFraunces\b|fonts\.googleapis\.com|fonts\.gstatic\.com/i;
  const interBinary =
    /fonts\/inter\/|InterVariable|InterVariable-Italic/i;
  for (const rootName of ['src', 'backend/templates']) {
    const root = join(ROOT, rootName);
    for (const p of walk(root)) {
      if (!SCAN_EXTS.has(extname(p)) && extname(p) !== '.html') continue;
      const text = read(p);
      // Allow "no Syne / Fraunces" / retirement prose in HTML comments only when
      // not loading those stacks; still fail live Google Fonts / Syne / Fraunces.
      if (forbiddenType.test(text)) {
        fail(`Forbidden font stack / Google Fonts CDN in product: ${rel(p)}`);
      }
      if (rootName === 'backend/templates' && interBinary.test(text)) {
        fail(`Inter font binary references are forbidden (Geist only): ${rel(p)}`);
      }
    }
  }
}

// --- 8) Chart / grid squash patterns in product sources ---
{
  const squash =
    /grid-auto-rows\s*:\s*var\(--(?:dash-row|tile-row[^)]*)\)\s*;/;
  for (const p of walk(join(ROOT, 'src'))) {
    if (!['.css', '.html', '.ts'].includes(extname(p))) continue;
    const text = read(p);
    if (squash.test(text) && !/minmax\s*\(/i.test(text)) {
      fail(`Fixed-only grid-auto-rows (must use minmax(..., auto)): ${rel(p)}`);
    }
  }
}

// --- 9) Django static mirror must match installed deml-ui package ---
{
  const pkgCss = join(ROOT, 'node_modules/deml-ui/dist/styles/deml-ui.css');
  const staticCss = join(ROOT, 'backend/static/deml-ui.css');
  if (!existsSync(pkgCss)) {
    fail(
      'node_modules/deml-ui/dist/styles/deml-ui.css missing — run npm ci / pin deml-ui',
    );
  } else if (!existsSync(staticCss)) {
    fail('backend/static/deml-ui.css missing — run scripts/sync_deml_ui_static.sh');
  } else {
    const a = sha256(readFileSync(pkgCss));
    const b = sha256(readFileSync(staticCss));
    if (a !== b) {
      fail(
        'backend/static/deml-ui.css does not match node_modules/deml-ui dist — run scripts/sync_deml_ui_static.sh',
      );
    }
  }
}

// --- 10) package.json must depend on deml-ui; forbid styling frameworks ---
{
  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(read(pkgPath));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps['deml-ui']) {
    fail('package.json must depend on deml-ui');
  } else {
    const pin = String(deps['deml-ui']);
    // Pure npm consumer — no github:/file:/git: pins for product installs.
    if (/^(github:|git\+|file:|http:|https:\/\/github)/i.test(pin)) {
      fail(
        `deml-ui must be an npm semver range (published package), not "${pin}"`,
      );
    }
    if (!/^[\^~]?[0-9]/.test(pin) && !/^[0-9]/.test(pin)) {
      fail(`deml-ui pin must be a semver range, got "${pin}"`);
    }
  }
  const banned = [
    '@angular/material',
    'bootstrap',
    'tailwindcss',
    '@dataengineeringformachinelearning/viking-ui',
    'viking-ui',
  ];
  for (const name of banned) {
    if (deps[name]) fail(`Forbidden styling dependency: ${name}`);
  }
}

if (errors.length) {
  console.error('NFTS style gate FAILED — new-from-the-start warm ash is mandatory.\n');
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\n${errors.length} violation(s). See THEME.md / AGENTS.md.`);
  process.exit(1);
}

console.log('NFTS style gate passed — deml consumes deml-ui warm ash only.');
process.exit(0);
