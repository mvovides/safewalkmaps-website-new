import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { navLinks, navSectionIds } from '@/data/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';
import { cn } from '@/lib/cn';

import { MobileMenu } from './MobileMenu';

/** Pixels scrolled before the header takes on its glass surface. */
const CONDENSE_AT = 24;

export function SiteHeader() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useActiveSection(isHome ? navSectionIds : []);

  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // One passive scroll listener, coalesced into a single rAF, flipping one
  // boolean — cheap enough to leave running for the whole session.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setCondensed(window.scrollY > CONDENSE_AT);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const measureIndicator = useCallback(() => {
    const list = listRef.current;
    if (!list || !activeSection) {
      setIndicator(null);
      return;
    }
    const item = list.querySelector<HTMLElement>(`[data-section="${activeSection}"]`);
    if (!item) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: item.offsetLeft, width: item.offsetWidth });
  }, [activeSection]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator]);

  useEffect(() => {
    window.addEventListener('resize', measureIndicator);
    return () => window.removeEventListener('resize', measureIndicator);
  }, [measureIndicator]);

  // Close the menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-slow ease-out-expo',
        condensed || menuOpen
          ? 'bg-white/82 shadow-[0_1px_0_0_rgb(6_42_94_/_0.08)] backdrop-blur-xl backdrop-saturate-150'
          : 'bg-transparent',
      )}
    >
      <div className="shell flex h-[var(--nav-height)] items-center justify-between gap-6">
        <Link
          to="/"
          className="shrink-0 rounded-sm"
          aria-label="SafeWalkMaps — home"
          onClick={() => setMenuOpen(false)}
        >
          <Logo className="text-[0.95rem]" markClassName="h-[1.85rem]" />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul ref={listRef} className="relative flex items-center gap-1">
            {/* Sliding active indicator */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -bottom-0.5 h-[2px] rounded-full bg-green-500 transition-all duration-slow ease-out-expo',
                indicator ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                left: indicator?.left ?? 0,
                width: indicator?.width ?? 0,
              }}
            />
            {navLinks.map((link) => (
              <li key={link.sectionId} data-section={link.sectionId}>
                <a
                  href={isHome ? link.hash : `/${link.hash}`}
                  aria-current={activeSection === link.sectionId ? 'true' : undefined}
                  className={cn(
                    'inline-flex h-10 items-center rounded-lg px-3.5 text-body-sm font-medium transition-colors duration-base',
                    activeSection === link.sectionId
                      ? 'text-navy-800'
                      : 'text-ink-secondary hover:text-navy-800',
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink
            href={isHome ? '#waitlist' : '/#waitlist'}
            variant="primary"
            size="sm"
            routeHover
            className="hidden sm:inline-flex"
          >
            Join waitlist
          </ButtonLink>

          <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} isHome={isHome} />
        </div>
      </div>
    </header>
  );
}
