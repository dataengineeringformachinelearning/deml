export interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
  readonly routerLink?: string;
}

export interface FooterLinkGroup {
  readonly heading: string;
  readonly links: readonly FooterLink[];
}

const COMMUNITY = 'https://dataengineeringformachinelearning.com';

/** Categorized suite + legal + status links (credit lives in site-footer bottom). */
export const SITE_FOOTER_GROUPS: readonly FooterLinkGroup[] = [
  {
    heading: 'Resources',
    links: [
      { label: 'Book', href: `${COMMUNITY}/book`, external: true },
      { label: 'Whitepaper', href: `${COMMUNITY}/whitepaper`, external: true },
      { label: 'Docs', href: `${COMMUNITY}/documentation`, external: true },
      { label: 'Blog', href: `${COMMUNITY}/blog`, external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Compliance', href: `${COMMUNITY}/compliance`, external: true },
      { label: 'Privacy', href: `${COMMUNITY}/privacy/`, external: true },
      { label: 'Terms', href: `${COMMUNITY}/terms/`, external: true },
      {
        label: 'Status',
        routerLink: '/status/platform-status',
        href: '/status/platform-status',
      },
    ],
  },
] as const;

/** Flat link list for callers that do not need group headings. */
export const SITE_FOOTER_LINKS: readonly FooterLink[] = SITE_FOOTER_GROUPS.flatMap(
  (group) => group.links,
);
