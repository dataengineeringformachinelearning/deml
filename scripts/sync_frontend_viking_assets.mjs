#!/usr/bin/env node
/**
 * Copy built Viking-UI CSS into the Angular frontend public assets.
 * Used by Vercel (and local) when marketing/docs trees are absent.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "packages", "viking-ui", "dist");
const destDir = path.join(root, "frontend", "public", "assets");

const files = ["viking-ui.css", "viking-app.css", "suite-fonts.css"];

fs.mkdirSync(destDir, { recursive: true });
for (const name of files) {
  const src = path.join(dist, name);
  if (!fs.existsSync(src)) {
    console.error(`Missing Viking-UI build output: ${src}`);
    process.exit(1);
  }
  const dest = path.join(destDir, name);
  fs.copyFileSync(src, dest);
  console.log(`Synced ${name} → frontend/public/assets/`);
}
