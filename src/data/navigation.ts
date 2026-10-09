export type NavLink = {
  label: string;
  /** In-page anchor on the homepage. */
  hash: string;
  /** Matching section id, used for the active indicator. */
  sectionId: string;
};

export const navLinks: NavLink[] = [
  { label: 'How it works', hash: '#how-it-works', sectionId: 'how-it-works' },
  { label: 'Safety score', hash: '#safety-score', sectionId: 'safety-score' },
  { label: 'Features', hash: '#features', sectionId: 'features' },
  { label: 'FAQ', hash: '#faq', sectionId: 'faq' },
];

export const navSectionIds = navLinks.map((link) => link.sectionId);

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Safety score', href: '/#safety-score' },
      { label: 'Compare routes', href: '/#routes' },
      { label: 'Features', href: '/#features' },
      { label: 'iOS waitlist', href: '/#waitlist' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our mission', href: '/#mission' },
      { label: 'Contact', href: '/#contact' },
      { label: 'Marvian Tech', href: 'https://marvian.tech', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
] as const;
