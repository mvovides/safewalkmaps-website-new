import { ArrowUpRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';
import { footerColumns } from '@/data/navigation';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/config';

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className =
    'group -my-1 inline-flex items-center gap-1 rounded-md py-2 text-body-sm text-white/55 transition-colors duration-base hover:text-white lg:py-1';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {children}
        <ArrowUpRight
          aria-hidden="true"
          className="h-3.5 w-3.5 opacity-0 transition-opacity duration-base group-hover:opacity-100"
        />
      </a>
    );
  }

  if (href.startsWith('/#') || href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-nav-theme="dark"
      className="on-navy relative overflow-hidden bg-surface-navy text-white"
    >
      {/* A last route line, running off the top edge of the footer. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMin slice"
        className="pointer-events-none absolute inset-x-0 top-0 h-[200px] w-full opacity-[0.17]"
      >
        <path
          d="M -40 190 H 220 V 96 H 540 V 150 H 860 V 54 H 1180 V 120 H 1480"
          fill="none"
          stroke="var(--brand-green)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 9"
        />
      </svg>

      <div className="shell relative pb-10 pt-section">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,2fr)]">
          <div>
            <Logo variant="mono-light" className="text-[1.05rem]" markClassName="h-8" />
            <p className="mt-5 max-w-[34ch] text-body-sm leading-relaxed text-white/55">
              Safety-aware walking navigation. We compare the routes you could take and show you
              why each one scores the way it does.
            </p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mt-6 inline-flex items-center gap-2 rounded-pill border border-line-inverse-strong px-4 py-2 text-body-sm text-white/80 transition-colors duration-base hover:border-green-500/60 hover:text-white"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              {siteConfig.contactEmail}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-label font-semibold uppercase tracking-[0.12em] text-white/40">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-1 lg:space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink
                        href={link.href}
                        external={'external' in link ? link.external : undefined}
                      >
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'mt-14 flex flex-col gap-5 border-t border-line-inverse pt-7',
            'sm:flex-row sm:items-center sm:justify-between',
          )}
        >
          <p className="text-caption leading-relaxed text-white/40">
            © {year} SafeWalkMaps. A{' '}
            <a
              href={siteConfig.parentCompany.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/60 underline-offset-4 transition-colors duration-base hover:text-white hover:underline"
            >
              {siteConfig.parentCompany.name}
            </a>{' '}
            product.
          </p>
          <p className="max-w-[46ch] text-caption leading-relaxed text-white/40">
            Safety scores are relative guidance from available data, not a guarantee. In an
            emergency, contact your local emergency services.
          </p>
        </div>
      </div>
    </footer>
  );
}
