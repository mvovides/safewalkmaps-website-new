import { Logo } from '@/components/brand/Logo';
import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { ButtonLink } from '@/components/ui/Button';
import { navLinks } from '@/data/navigation';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { labButtonProps } from './labStyles';

export function LabNav({ config }: { config: ThemeConfig }) {
  const style = config.components.nav.style;
  const button = labButtonProps(config);
  const dark = style === 'dark';
  const linkTone = dark
    ? 'text-white/70'
    : style === 'minimal'
      ? 'text-ink-tertiary'
      : 'text-navy-900/75';

  return (
    <LabSection id="nav" title="Navigation" variant={style} bleed>
      {/* A slice of map behind the bar, so glass and floating variants have something to sit over. */}
      <div className={cn('relative overflow-hidden', dark ? 'bg-surface-navy' : 'bg-surface')}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 h-72 opacity-50"
        >
          <ComparisonMap />
        </div>
        {style === 'glass' && (
          <div aria-hidden="true" className="nav-glass nav-glass-light opacity-100" />
        )}
        <div className={cn('relative', style === 'floating-pill' && 'px-gutter pb-16 pt-3')}>
          <div
            className={cn(
              'relative flex h-[var(--nav-height)] items-center justify-between gap-6',
              style === 'floating-pill'
                ? 'mx-auto max-w-4xl rounded-control border border-line bg-surface/92 px-5 shadow-md backdrop-blur-md'
                : 'shell',
              style === 'solid' && 'border-b border-line bg-surface',
              style === 'minimal' && 'border-b border-line',
              dark && 'text-white',
            )}
          >
            <Logo
              variant={dark ? 'mono-light' : 'brand'}
              className="text-[0.95rem]"
              markClassName="h-[1.85rem]"
            />
            <nav aria-label="Lab primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <span
                      className={cn(
                        'inline-flex h-10 items-center rounded-lg px-3.5 text-body-sm font-medium',
                        linkTone,
                      )}
                    >
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>
            {style !== 'minimal' && (
              <ButtonLink
                href="#waitlist"
                size="sm"
                variant={dark ? 'accent' : button.variant}
                className={button.className}
                routeHover={button.routeHover}
              >
                Join waitlist
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </LabSection>
  );
}
