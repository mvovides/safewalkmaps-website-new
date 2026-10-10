import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { navLinks, navSectionIds } from '@/data/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useNavOverDark } from '@/hooks/useNavOverDark';
import { cn } from '@/lib/cn';

import { MobileMenu } from './MobileMenu';

/** Pixels scrolled before the header takes on its glass surface. */
const CONDENSE_AT = 24;

/**
 * Base width of the active-section indicator, in pixels.
 *
 * The indicator is drawn at this width once and then transformed, so moving it
 * between nav items costs a compositor transform rather than a layout pass per
 * frame. Animating `left`/`width` — which this used to do — reflows the header
 * on every one of the ~26 frames the transition runs for.
 *
 * Keeping the base close to a real nav item's width keeps the X scale factor
 * near 1, so the 1px radius on a 2px-tall bar stays visually round.
 */
const INDICATOR_BASE_WIDTH = 100;

export function SiteHeader() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useActiveSection(isHome ? navSectionIds : []);
  // Invert over the navy surfaces so the glass never reads as a grey band.
  const overDark = useNavOverDark();
  const inverted = overDark && !menuOpen;

  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  // Held so the indicator can fade out where it last sat, rather than sliding
  // to the left edge on its way out — things should leave from where they are.
  const lastIndicator = useRef<{ left: number; width: number } | null>(null);
  if (indicator) lastIndicator.current = indicator;
  const indicatorBox = indicator ?? lastIndicator.current;

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
    <header className="fixed inset-x-0 top-0 z-50">
      {/* The glass material, as its own layer so it can extend past the bar
          and fade out rather than ending on a hard line. */}
      <div
        aria-hidden="true"
        className={cn(
          'nav-glass',
          inverted ? 'nav-glass-dark' : 'nav-glass-light',
          // No fade when the sheet is attached underneath: there is no
          // content/chrome boundary to soften, only a seam to avoid drawing.
          menuOpen && 'nav-glass-flush',
          condensed || menuOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div className="shell relative flex h-[var(--nav-height)] items-center justify-between gap-6">
        <Link
          to="/"
          className="-my-1 shrink-0 rounded-lg py-1"
          aria-label="SafeWalkMaps — home"
          onClick={() => setMenuOpen(false)}
        >
          <Logo
            variant={inverted ? 'mono-light' : 'brand'}
            className="text-[0.95rem]"
            markClassName="h-[1.85rem]"
          />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul ref={listRef} className="relative flex items-center gap-1">
            {/* Sliding active indicator — transform only, never layout. */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -bottom-0.5 left-0 h-[2px] origin-left rounded-full bg-green-500',
                'transition-[transform,opacity] duration-spring-snappy ease-spring',
                indicator ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                width: INDICATOR_BASE_WIDTH,
                transform: indicatorBox
                  ? `translate3d(${indicatorBox.left}px, 0, 0) scaleX(${
                      indicatorBox.width / INDICATOR_BASE_WIDTH
                    })`
                  : 'translate3d(0, 0, 0) scaleX(0)',
              }}
            />
            {navLinks.map((link) => (
              <li key={link.sectionId} data-section={link.sectionId}>
                <a
                  href={isHome ? link.hash : `/${link.hash}`}
                  aria-current={activeSection === link.sectionId ? 'true' : undefined}
                  className={cn(
                    'inline-flex h-10 items-center rounded-lg px-3.5 text-body-sm font-medium transition-colors duration-base',
                    // Vibrancy: over a translucent surface the label is brand
                    // navy at reduced alpha, so it picks up what is behind it,
                    // rather than a flat grey that sits dead on the glass. At
                    // 75% it still clears the old #4A5F7D on contrast (7.7:1
                    // against white, up from 7.2:1). The tracking bump is the
                    // small positive adjustment small text wants when it is
                    // read through a blur.
                    'tracking-[0.005em]',
                    activeSection === link.sectionId
                      ? inverted
                        ? 'text-white'
                        : 'text-navy-900'
                      : inverted
                        ? 'text-white/70 hover:text-white'
                        : 'text-navy-900/75 hover:text-navy-900',
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
            variant={inverted ? 'accent' : 'primary'}
            size="sm"
            routeHover
            className="hidden sm:inline-flex"
          >
            Join waitlist
          </ButtonLink>

          <MobileMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            isHome={isHome}
            inverted={inverted}
          />
        </div>
      </div>
    </header>
  );
}
