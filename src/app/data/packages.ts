import type { CardVisual } from '../components/card/card';
import type { ArticleEntry } from '../shared/article-entry';

export interface PackageItem {
  name: string;
  description: string;
  /** Optional install / group note. */
  note?: string;
  /** GitHub repo path `owner/name` for starring. */
  github?: string;
}

export interface PackageGroup {
  id: string;
  title: string;
  summary: string;
  items: PackageItem[];
}

export interface LearnTopic extends ArticleEntry {
  github?: string;
  note?: string;
  groupId: string;
}

const GROUP_VISUAL: Record<string, Exclude<CardVisual, 'none'>> = {
  backend: 'gold',
  addons: 'red',
  frontend: 'olive',
  engine: 'gold',
  infra: 'olive',
};

export function packageSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[/_.]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function topicBody(item: PackageItem, groupTitle: string): string[] {
  const paragraphs = [
    `${item.name} is a direct dependency in the ${groupTitle} layer of the stack: ${item.description}.`,
  ];

  if (item.note) {
    paragraphs.push(`Enable or install with: ${item.note}.`);
  }

  if (item.github) {
    paragraphs.push(
      `Upstream is ${item.github}. Star the repository on GitHub if this package is part of your toolchain.`,
    );
  } else {
    paragraphs.push('This entry is documented for the runtime inventory; no GitHub star target is listed.');
  }

  return paragraphs;
}

export const PACKAGE_GROUPS: PackageGroup[] = [
  {
    id: 'backend',
    title: 'Backend (Python)',
    summary: 'API, data, ML, and ops libraries managed with uv.',
    items: [
      {
        name: 'fastapi',
        description: 'API framework',
        github: 'fastapi/fastapi',
      },
      {
        name: 'huggingface_hub',
        description: 'Scheduled model artifact publishing',
        note: 'uv sync --group ml',
        github: 'huggingface/huggingface_hub',
      },
      {
        name: 'uvicorn',
        description: 'ASGI server',
        github: 'Kludex/uvicorn',
      },
      {
        name: 'pydantic-settings',
        description: 'Settings from env (pulls python-dotenv for .env)',
        github: 'pydantic/pydantic-settings',
      },
      {
        name: 'redis-py',
        description: 'Redis / Dragonfly client',
        github: 'redis/redis-py',
      },
      {
        name: 'asyncpg',
        description: 'Async Postgres (Supabase)',
        github: 'MagicStack/asyncpg',
      },
      {
        name: 'psycopg',
        description: 'Sync Postgres for Neon→Supabase ETL',
        note: 'uv sync --group etl',
        github: 'psycopg/psycopg',
      },
      {
        name: 'httpx',
        description: 'HTTP client (engine + probes)',
        github: 'encode/httpx',
      },
      {
        name: 'Prefect',
        description: 'Workflow orchestration',
        github: 'PrefectHQ/prefect',
      },
      {
        name: 'Polars',
        description: 'Batch DataFrames',
        github: 'pola-rs/polars',
      },
      {
        name: 'pyrollbar',
        description: 'Error reporting',
        github: 'rollbar/pyrollbar',
      },
      {
        name: 'sentry-sdk',
        description: 'Optional error tracking',
        note: 'uv sync --group sentry · SENTRY_DSN',
        github: 'getsentry/sentry-python',
      },
      {
        name: 'pytorch',
        description: 'LSTM-AE / transformers / forecasting / NorseSSN fallback',
        note: 'uv sync --group ml',
        github: 'pytorch/pytorch',
      },
      {
        name: 'numpy',
        description: 'Window tensors for ML',
        note: 'uv sync --group ml',
        github: 'numpy/numpy',
      },
      {
        name: 'scikit-learn',
        description: 'Isolation Forest, OCSVM, RF, HistGradientBoosting',
        note: 'uv sync --group ml',
        github: 'scikit-learn/scikit-learn',
      },
      {
        name: 'norse',
        description: 'Optional LIF cells for NorseSSN',
        note: 'uv sync --group ml-spiking',
        github: 'norse/norse',
      },
      {
        name: 'sentence-transformers',
        description: 'Optional event similarity',
        note: 'uv sync --group ml-nlp',
        github: 'UKPLab/sentence-transformers',
      },
      {
        name: 'boto3',
        description: 'S3-compatible export/report storage',
        note: 'uv sync --group storage',
        github: 'boto/boto3',
      },
      {
        name: 'pyjwt',
        description: 'Supabase Auth JWT verification',
        github: 'jpadilla/pyjwt',
      },
      {
        name: 'cryptography',
        description: 'AES-256-GCM E2EE envelopes',
        github: 'pyca/cryptography',
      },
      {
        name: 'PyYAML',
        description: 'Workflow definition loading',
        github: 'yaml/pyyaml',
      },
      {
        name: 'uv',
        description: 'Python package manager',
        github: 'astral-sh/uv',
      },
      {
        name: 'ruff',
        description: 'Linter / formatter',
        note: 'dev',
        github: 'astral-sh/ruff',
      },
      {
        name: 'maturin',
        description: 'Build Rust→Python extensions',
        note: 'dev / engine',
        github: 'PyO3/maturin',
      },
    ],
  },
  {
    id: 'addons',
    title: 'Add-ons',
    summary: 'Optional integrations — disabled by default (FORJD_ADDONS).',
    items: [
      {
        name: 'osv.dev',
        description: 'Vulnerability advisories API',
        note: 'osv-dev',
        github: 'google/osv.dev',
      },
      {
        name: 'osv-scanner',
        description: 'Lockfile/SBOM vuln scanner',
        note: 'osv-scanner',
        github: 'google/osv-scanner',
      },
      {
        name: 'osv-scalibr',
        description: 'SBOM / inventory extraction',
        note: 'osv-scalibr',
        github: 'google/osv-scalibr',
      },
      {
        name: 'nuclei',
        description: 'Template-based scanner',
        note: 'nuclei',
        github: 'projectdiscovery/nuclei',
      },
      {
        name: 'honeydb-python',
        description: 'Honeypot threat intel',
        note: 'honeydb',
        github: 'foospidy/HoneyDB',
      },
      {
        name: 'go-cve-dictionary',
        description: 'Local CVE mirror',
        note: 'go-cve-dictionary',
        github: 'vulsio/go-cve-dictionary',
      },
      {
        name: 'jax',
        description: 'Accelerated ML detectors, install on demand',
        note: 'jax',
        github: 'jax-ml/jax',
      },
      {
        name: 'acme',
        description: 'RL research framework, descriptor only',
        note: 'acme',
        github: 'google-deepmind/acme',
      },
      {
        name: 'robotframework',
        description: 'Acceptance-test automation',
        note: 'robotframework',
        github: 'robotframework/robotframework',
      },
      {
        name: 'oss-fuzz',
        description: 'Continuous fuzzing, CI/infra reference',
        note: 'oss-fuzz',
        github: 'google/oss-fuzz',
      },
      {
        name: 'design-patterns-python',
        description: 'Reference material',
        note: 'design-patterns-python',
        github: 'faif/python-patterns',
      },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend (Angular / npm)',
    summary: 'UI framework, tooling, analytics, and quality gates.',
    items: [
      {
        name: 'angular',
        description: 'UI framework (+ CLI / build tooling)',
        github: 'angular/angular',
      },
      {
        name: 'rxjs',
        description: 'Reactive streams',
        github: 'ReactiveX/rxjs',
      },
      {
        name: 'tslib',
        description: 'TypeScript helpers',
        github: 'microsoft/tslib',
      },
      {
        name: 'sentry-javascript',
        description: '@sentry/angular error + log monitoring',
        github: 'getsentry/sentry-javascript',
      },
      {
        name: 'rollbar.js',
        description: 'Browser error reporting',
        github: 'rollbar/rollbar.js',
      },
      {
        name: 'vercel/analytics',
        description: 'Web analytics',
        github: 'vercel/analytics',
      },
      {
        name: 'vercel/speed-insights',
        description: 'Performance insights',
        github: 'vercel/speed-insights',
      },
      {
        name: 'storybook',
        description: 'Component workshop',
        github: 'storybookjs/storybook',
      },
      {
        name: 'chromatic-cli',
        description: 'Visual regression publishing',
        github: 'chromaui/chromatic-cli',
      },
      {
        name: 'vite',
        description: 'Bundler (Storybook / Vitest)',
        github: 'vitejs/vite',
      },
      {
        name: 'vitest',
        description: 'Unit tests',
        github: 'vitest-dev/vitest',
      },
      {
        name: 'playwright',
        description: 'Landing critical-path e2e (@playwright/test)',
        github: 'microsoft/playwright',
      },
      {
        name: 'analog',
        description: 'Vite plugin for Angular',
        github: 'analogjs/analog',
      },
      {
        name: 'ng-packagr',
        description: 'Library packaging',
        github: 'ng-packagr/ng-packagr',
      },
      {
        name: 'prettier',
        description: 'Code formatting',
        github: 'prettier/prettier',
      },
      {
        name: 'jsdom',
        description: 'DOM for tests',
        github: 'jsdom/jsdom',
      },
    ],
  },
  {
    id: 'engine',
    title: 'Engine (Rust)',
    summary: 'Process + data plane crates for the FORJD engine.',
    items: [
      { name: 'tokio', description: 'Async runtime', github: 'tokio-rs/tokio' },
      { name: 'serde', description: 'Serialization', github: 'serde-rs/serde' },
      {
        name: 'serde_json',
        description: 'JSON values',
        github: 'serde-rs/json',
      },
      {
        name: 'tracing',
        description: 'Structured logging (+ subscriber)',
        github: 'tokio-rs/tracing',
      },
      {
        name: 'arrow-rs',
        description: 'Arrow + Parquet columnar I/O',
        github: 'apache/arrow-rs',
      },
      {
        name: 'bytes',
        description: 'Byte buffers (Parquet reader)',
        github: 'tokio-rs/bytes',
      },
      {
        name: 'thiserror',
        description: 'Typed engine errors',
        github: 'dtolnay/thiserror',
      },
      {
        name: 'subtle',
        description: 'Constant-time token compare',
        github: 'dalek-cryptography/subtle',
      },
      {
        name: 'PyO3',
        description: 'Rust↔Python bindings (forjd_engine)',
        github: 'PyO3/pyo3',
      },
      {
        name: 'axum',
        description: 'HTTP (server / data-plane)',
        github: 'tokio-rs/axum',
      },
      {
        name: 'tower',
        description: 'Timeout / service stack',
        github: 'tower-rs/tower',
      },
      {
        name: 'tower-http',
        description: 'Tracing, body limit, headers, request IDs',
        github: 'tower-rs/tower-http',
      },
      {
        name: 'sqlx',
        description: 'Postgres outbox / scheduler / probes (data-plane)',
        github: 'launchbadge/sqlx',
      },
      {
        name: 'redis-rs',
        description: 'Dragonfly Streams bus + rate limits (data-plane)',
        github: 'redis-rs/redis-rs',
      },
      {
        name: 'reqwest',
        description: 'Health probes / OTLP (data-plane)',
        github: 'seanmonstar/reqwest',
      },
      {
        name: 'aes-gcm',
        description: 'Internode envelope encryption (data-plane)',
        github: 'RustCrypto/AEADs',
      },
      {
        name: 'anyhow',
        description: 'Data-plane error context',
        github: 'dtolnay/anyhow',
      },
      {
        name: 'uuid',
        description: 'Lease / event ids',
        github: 'uuid-rs/uuid',
      },
      {
        name: 'chrono',
        description: 'Scheduler UTC buckets',
        github: 'chronotope/chrono',
      },
      {
        name: 'futures',
        description: 'Bounded concurrency',
        github: 'rust-lang/futures-rs',
      },
      {
        name: 'sha2',
        description: 'Ingest API key + custody hashes',
        github: 'RustCrypto/hashes',
      },
      {
        name: 'opentelemetry-rust',
        description: 'Optional OTLP tracing',
        github: 'open-telemetry/opentelemetry-rust',
      },
      {
        name: 'rustls',
        description: 'TLS for probes and Dragonfly',
        github: 'rustls/rustls',
      },
    ],
  },
  {
    id: 'infra',
    title: 'Infra',
    summary: 'Runtime platforms and data stores (not language crates).',
    items: [
      {
        name: 'Dragonfly',
        description: 'Redis-compatible cache (Fly.io: infra/dragonfly/)',
        github: 'dragonflydb/dragonfly',
      },
      {
        name: 'PostgreSQL',
        description: 'Primary database (hosted on Supabase)',
        github: 'postgres/postgres',
      },
      {
        name: 'Supabase',
        description: 'Hosted Postgres for FORJD',
        github: 'supabase/supabase',
      },
      {
        name: 'pgvector',
        description: 'Vector extension for LSTM-AE latents (Supabase)',
        github: 'pgvector/pgvector',
      },
      {
        name: 'Fly.io',
        description: 'Dragonfly + engine deployment target',
        github: 'superfly/fly',
      },
    ],
  },
];

export function githubUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

export const LEARN_TOPICS: LearnTopic[] = PACKAGE_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    slug: packageSlug(item.name),
    title: item.name,
    excerpt: item.description,
    meta: item.note ? `${group.title} · ${item.note}` : group.title,
    visual: GROUP_VISUAL[group.id] ?? 'gold',
    body: topicBody(item, group.title),
    github: item.github,
    note: item.note,
    groupId: group.id,
  })),
);

export function getLearnTopic(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((topic) => topic.slug === slug);
}

export function topicsForGroup(groupId: string): LearnTopic[] {
  return LEARN_TOPICS.filter((topic) => topic.groupId === groupId);
}
