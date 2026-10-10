export type NavLink = {
  label: string;
  /** Absolute path to the page this links to. */
  path: string;
};

export const navLinks: NavLink[] = [
  { label: 'Safety score', path: '/safety-score' },
  { label: 'Features', path: '/features' },
  { label: 'About', path: '/about' },
  { label: 'FAQ', path: '/faq' },
];

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Safety score', href: '/safety-score' },
      { label: 'Compare routes', href: '/#routes' },
      { label: 'Features', href: '/features' },
      { label: 'iOS waitlist', href: '/#waitlist' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our mission', href: '/about' },
      { label: 'Contact', href: '/about#contact' },
      { label: 'Marvian Tech', href: 'https://marvian.tech', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
] as const;
