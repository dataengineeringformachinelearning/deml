import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "@dataengineeringformachinelearning/viking-ui";
const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL_MANIFEST = "packages/viking-ui/package.json";
// Marketing lives in the community repo — do not require it here.
const CONSUMER_MANIFESTS = [
  "frontend/package.json",
  "viking-ui-docs/package.json",
].filter((relativePath) => existsSync(join(ROOT_DIR, relativePath)));
const COPY_FILES = [
  "BOOK.md",
  "WHITEPAPER.md",
  "packages/viking-ui/README.md",
  "viking-ui-docs/README.md",
].filter((relativePath) => existsSync(join(ROOT_DIR, relativePath)));
const COPY_DIRECTORIES = ["frontend/src", "viking-ui-docs/src"].filter(
  (relativePath) => existsSync(join(ROOT_DIR, relativePath)),
);
const COPY_EXTENSIONS = new Set([
  ".astro",
  ".html",
  ".js",
  ".md",
  ".mjs",
  ".ts",
]);
const LOCKFILE_PROJECTS = [
  ".",
  "frontend",
  "packages/viking-ui",
  "viking-ui-docs",
].filter((relativePath) => existsSync(join(ROOT_DIR, relativePath)));
const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write") || args.has("--changesets");
// Lockfile refresh hits the npm registry for nested installs (`--workspaces=false`).
// Do that only after publish (`npm run sync:viking-ui:version`), never during
// `version:viking-ui` / `--changesets` when the new version is not on npm yet.
const shouldRefreshLockfiles = args.has("--lockfiles");
const shouldValidateLockfiles =
  !args.has("--changesets") || args.has("--lockfiles");
const failures = [];

const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(ROOT_DIR, relativePath), "utf8"));

const writeJson = (relativePath, value) => {
  writeFileSync(
    join(ROOT_DIR, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
  );
};

const run = (command, commandArgs, cwd = ROOT_DIR) => {
  const result = spawnSync(command, commandArgs, {
    cwd,
    env: process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (args.has("--changesets")) {
  run("npx", ["-y", "@changesets/cli", "version"]);
}

const canonicalVersion = readJson(CANONICAL_MANIFEST).version;
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(canonicalVersion)) {
  throw new Error(
    `${CANONICAL_MANIFEST} has an invalid SemVer version: ${canonicalVersion}`,
  );
}
const canonicalRange = `^${canonicalVersion}`;

const collectCopyFiles = (relativeDirectory) => {
  const absoluteDirectory = join(ROOT_DIR, relativeDirectory);
  return readdirSync(absoluteDirectory).flatMap((entry) => {
    const relativePath = join(relativeDirectory, entry);
    const absolutePath = join(ROOT_DIR, relativePath);
    if (statSync(absolutePath).isDirectory()) {
      return collectCopyFiles(relativePath);
    }
    return COPY_EXTENSIONS.has(extname(entry)) ? [relativePath] : [];
  });
};

const updateFile = (relativePath, nextContent) => {
  const absolutePath = join(ROOT_DIR, relativePath);
  const currentContent = readFileSync(absolutePath, "utf8");
  if (currentContent === nextContent) return;
  if (shouldWrite) {
    writeFileSync(absolutePath, nextContent);
    console.log(`Aligned ${relativePath} to Viking-UI ${canonicalVersion}`);
    return;
  }
  failures.push(relativePath);
};

for (const relativePath of CONSUMER_MANIFESTS) {
  const manifest = readJson(relativePath);
  const currentRange = manifest.dependencies?.[PACKAGE_NAME];
  if (currentRange === canonicalRange) continue;
  if (!manifest.dependencies || currentRange === undefined) {
    throw new Error(
      `${relativePath} must declare ${PACKAGE_NAME} in dependencies.`,
    );
  }
  if (shouldWrite) {
    manifest.dependencies[PACKAGE_NAME] = canonicalRange;
    writeJson(relativePath, manifest);
    console.log(`Aligned ${relativePath} to ${canonicalRange}`);
  } else {
    failures.push(relativePath);
  }
}

const versionedCopyFiles = [
  ...COPY_FILES,
  ...COPY_DIRECTORIES.flatMap(collectCopyFiles),
];
for (const relativePath of versionedCopyFiles) {
  const currentContent = readFileSync(join(ROOT_DIR, relativePath), "utf8");
  const nextContent = currentContent
    .replace(
      /(@dataengineeringformachinelearning\/viking-ui@)(?:latest|\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/g,
      `$1${canonicalVersion}`,
    )
    .replace(
      /The current\s+publish target is `[^`]+`\./g,
      `The current publish target is \`${canonicalVersion}\`.`,
    );
  updateFile(relativePath, nextContent);
}

if (shouldRefreshLockfiles) {
  // Root workspace install resolves local packages (deml-contracts, viking-ui).
  // Nested --workspaces=false installs break on unpublished workspace deps.
  run(
    "npm",
    [
      "install",
      "--package-lock-only",
      "--legacy-peer-deps",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
    ],
    ROOT_DIR,
  );

  // Keep the package-local lockfile version field in sync for npm pack/publish.
  const vikingLockPath = "packages/viking-ui/package-lock.json";
  if (existsSync(join(ROOT_DIR, vikingLockPath))) {
    const vikingLock = readJson(vikingLockPath);
    vikingLock.version = canonicalVersion;
    if (vikingLock.packages?.[""]) {
      vikingLock.packages[""].version = canonicalVersion;
    }
    writeJson(vikingLockPath, vikingLock);
    console.log(`Aligned ${vikingLockPath} to ${canonicalVersion}`);
  }

  // Nested consumer locks (legacy) — patch version pins only.
  for (const relativePath of [
    "frontend/package-lock.json",
    "viking-ui-docs/package-lock.json",
  ]) {
    if (!existsSync(join(ROOT_DIR, relativePath))) continue;
    const lockfile = readJson(relativePath);
    let changed = false;
    if (lockfile.packages?.[""]?.dependencies?.[PACKAGE_NAME]) {
      lockfile.packages[""].dependencies[PACKAGE_NAME] = canonicalRange;
      changed = true;
    }
    const nodeKey = `node_modules/${PACKAGE_NAME}`;
    const tarball = `https://registry.npmjs.org/${PACKAGE_NAME}/-/${PACKAGE_NAME.split("/").pop()}-${canonicalVersion}.tgz`;
    // Prefer live integrity from the registry when available.
    let integrity = lockfile.packages?.[nodeKey]?.integrity;
    try {
      const meta = spawnSync(
        "npm",
        ["view", `${PACKAGE_NAME}@${canonicalVersion}`, "dist.integrity"],
        { encoding: "utf8" },
      );
      if (meta.status === 0 && meta.stdout.trim()) {
        integrity = meta.stdout.trim();
      }
    } catch {
      /* keep prior integrity */
    }
    if (lockfile.packages?.[nodeKey]) {
      lockfile.packages[nodeKey].version = canonicalVersion;
      lockfile.packages[nodeKey].resolved = tarball;
      if (integrity) lockfile.packages[nodeKey].integrity = integrity;
      changed = true;
    }
    if (lockfile.dependencies?.[PACKAGE_NAME]) {
      const entry = lockfile.dependencies[PACKAGE_NAME];
      if (typeof entry === "object" && entry) {
        entry.version = canonicalVersion;
        entry.resolved = tarball;
        if (integrity) entry.integrity = integrity;
        changed = true;
      }
    }
    if (changed) {
      writeJson(relativePath, lockfile);
      console.log(`Aligned ${relativePath} to ${canonicalRange}`);
    }
  }
}

const expectLockValue = (relativePath, actual, expected, contract) => {
  if (actual === expected) return;
  failures.push(
    `${relativePath}: ${contract} is ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
  );
};

if (shouldValidateLockfiles) {
  for (const relativeDirectory of CONSUMER_MANIFESTS.map((path) =>
    dirname(path),
  )) {
    const relativePath = join(relativeDirectory, "package-lock.json");
    const lockfile = readJson(relativePath);
    expectLockValue(
      relativePath,
      lockfile.packages?.[""]?.dependencies?.[PACKAGE_NAME],
      canonicalRange,
      `${PACKAGE_NAME} manifest range`,
    );
    expectLockValue(
      relativePath,
      lockfile.packages?.[`node_modules/${PACKAGE_NAME}`]?.version,
      canonicalVersion,
      `${PACKAGE_NAME} resolved version`,
    );
  }

  const packageLock = readJson("packages/viking-ui/package-lock.json");
  expectLockValue(
    "packages/viking-ui/package-lock.json",
    packageLock.version,
    canonicalVersion,
    "root version",
  );
  expectLockValue(
    "packages/viking-ui/package-lock.json",
    packageLock.packages?.[""]?.version,
    canonicalVersion,
    "workspace version",
  );

  const rootLock = readJson("package-lock.json");
  for (const relativePath of CONSUMER_MANIFESTS) {
    const workspacePath = dirname(relativePath);
    expectLockValue(
      "package-lock.json",
      rootLock.packages?.[workspacePath]?.dependencies?.[PACKAGE_NAME],
      canonicalRange,
      `${workspacePath} ${PACKAGE_NAME} range`,
    );
  }
  expectLockValue(
    "package-lock.json",
    rootLock.packages?.["packages/viking-ui"]?.version,
    canonicalVersion,
    "canonical workspace version",
  );
} else {
  console.log(
    "Skipped lockfile refresh/validation (pre-publish). After npm publish, run `npm run sync:viking-ui:version`.",
  );
}

if (failures.length > 0) {
  console.error(`Viking-UI ${canonicalVersion} version drift detected:`);
  for (const failure of [...new Set(failures)]) {
    console.error(` - ${failure}`);
  }
  console.error(
    "Run `npm run sync:viking-ui:version` and commit the generated changes.",
  );
  process.exit(1);
}

console.log(`Viking-UI version contract is aligned at ${canonicalVersion}.`);
