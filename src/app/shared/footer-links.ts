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

/** Flat legal + status links — no column chrome. */
export const SITE_FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: '',
    links: [
      {
        label: 'Privacy',
        href: 'https://dataengineeringformachinelearning.com/privacy/',
        external: true,
      },
      {
        label: 'Terms',
        href: 'https://dataengineeringformachinelearning.com/terms/',
        external: true,
      },
      {
        label: 'Status',
        routerLink: '/status/platform-status',
        href: '/status/platform-status',
      },
    ],
  },
] as const;
