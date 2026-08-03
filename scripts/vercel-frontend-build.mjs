#!/usr/bin/env node
/**
 * Vercel still has Root Directory = frontend from the pre-rewrite app.
 * This shim installs/builds the repo-root Angular app and copies browser output
 * into frontend/dist/deml/browser for the project outputDirectory.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDir, '..');
const frontendDir = path.join(root, 'frontend');

function run(command, args, cwd, envExtra = {}) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...envExtra },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// Ensure root deps (including github:deml-ui) are installed when Vercel only
// installs inside frontend/. Prefer ignore-scripts: deml-ui ships dist, and
// prepare rebuilds blow the 8GB builder before ng even starts.
if (!fs.existsSync(path.join(root, 'node_modules', 'deml-ui'))) {
  run('npm', ['install', '--include=dev', '--ignore-scripts'], root);
}

const demlUiCss = path.join(root, 'node_modules', 'deml-ui', 'dist', 'styles', 'deml-ui.css');
if (!fs.existsSync(demlUiCss)) {
  run('npm', ['run', 'prepare', '--prefix', path.join(root, 'node_modules', 'deml-ui')], root, {
    NODE_OPTIONS: '--max-old-space-size=3072',
  });
}

run('node', ['set-env.js'], root);
run('npm', ['run', 'build:contracts'], root);
// Static browser build — single worker + modest heap leave room for esbuild.
run('npx', ['ng', 'build', '--configuration', 'vercel'], root, {
  NODE_OPTIONS: '--max-old-space-size=3072',
  NG_BUILD_MAX_WORKERS: '1',
});

const from = path.join(root, 'dist', 'deml', 'browser');
const to = path.join(frontendDir, 'dist', 'deml', 'browser');
fs.rmSync(to, { recursive: true, force: true });
fs.mkdirSync(path.dirname(to), { recursive: true });
fs.cpSync(from, to, { recursive: true });
console.log(`Copied ${from} → ${to}`);
