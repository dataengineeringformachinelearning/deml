export interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
  readonly routerLink?: string;
}

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

/** Restored site-footer directory — Platforms / Resources / Support / Legal. */
export const SITE_FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Platforms',
    links: [
      { label: 'DEML', routerLink: '/', href: '/' },
      { label: 'FORJD', href: 'https://backend.forjd.co/', external: true },
      { label: 'Explore', routerLink: '/explore', href: '/explore' },
      { label: 'Dashboard', routerLink: '/dashboard', href: '/dashboard' },
      { label: 'Learn', routerLink: '/learn', href: '/learn' },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        label: 'Community',
        href: 'https://dataengineeringformachinelearning.com/',
        external: true,
      },
      {
        label: 'Whitepaper',
        href: 'https://dataengineeringformachinelearning.com/whitepaper/',
        external: true,
      },
      {
        label: 'Book',
        href: 'https://dataengineeringformachinelearning.com/book/',
        external: true,
      },
      { label: 'Blue Notes', routerLink: '/blog', href: '/blog' },
      {
        label: 'DEML Swagger',
        href: 'https://backend.deml.app/api/v1/docs',
        external: true,
      },
      {
        label: 'DEML ReDoc',
        href: 'https://backend.deml.app/api/v1/redoc',
        external: true,
      },
      {
        label: 'FORJD capabilities',
        href: 'https://backend.forjd.co/api/v1/capabilities',
        external: true,
      },
    ],
  },
  {
    title: 'Support',
    links: [
      {
        label: 'Platform Status',
        routerLink: '/status/platform-status',
        href: '/status/platform-status',
      },
      { label: 'Report a Bug', href: '/?reportBug=1' },
    ],
  },
  {
    title: 'Legal & Compliance',
    links: [
      {
        label: 'Privacy Policy',
        href: 'https://dataengineeringformachinelearning.com/privacy/',
        external: true,
      },
      {
        label: 'Terms of Service',
        href: 'https://dataengineeringformachinelearning.com/terms/',
        external: true,
      },
      {
        label: 'SOC2 Compliance',
        href: 'https://dataengineeringformachinelearning.com/compliance/',
        external: true,
      },
      {
        label: 'GDPR Compliance',
        href: 'https://dataengineeringformachinelearning.com/privacy/#gdpr',
        external: true,
      },
      {
        label: 'Cookie Settings',
        href: 'https://dataengineeringformachinelearning.com/?cookieSettings=1',
        external: true,
      },
    ],
  },
] as const;
