import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { navLinks } from '@/data/navigation';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cn } from '@/lib/cn';

export type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHome: boolean;
  /** The header is currently over a dark surface. */
  inverted?: boolean;
};

/**
 * Three lines that become a cross.
 *
 * All three bars share one `top` and are moved apart with `translateY`, so
 * opening the menu is a pure compositor transform. Driving `top` — which this
 * used to do — relayouts the glyph every frame, and because `top` and `rotate`
 * are separate interpolations the bars took a subtly different path in than
 * out. One transform per bar makes the gesture reversible along its own path.
 */
function MenuGlyph({ open }: { open: boolean }) {
  const bar =
    'absolute left-0 top-[4.7px] h-[1.6px] w-full rounded-full bg-current ' +
    'transition-[transform,opacity] duration-spring-snappy ease-spring';
  return (
    <span aria-hidden="true" className="relative block h-[11px] w-[19px]">
      <span className={cn(bar, open ? 'rotate-45' : '-translate-y-[4.7px]')} />
      <span className={cn(bar, open ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100')} />
      <span className={cn(bar, open ? '-rotate-45' : 'translate-y-[4.7px]')} />
    </span>
  );
}

/**
 * Mobile navigation.
 *
 * A sheet that drops from under the header rather than a full-screen takeover:
 * the page stays visible behind it, which keeps the sense of place. Items
 * stagger in on open, and the whole sheet is `inert` to the keyboard when shut.
 */
export function MobileMenu({ open, onOpenChange, isHome, inverted = false }: MobileMenuProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(open);

  // Escape closes, and focus returns to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  // Keep closed menu contents out of the tab order without unmounting them,
  // so the open/close transition can still run.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (open) sheet.removeAttribute('inert');
    else sheet.setAttribute('inert', '');
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className={cn(
          'tappable -mr-1.5 grid h-11 w-11 place-items-center rounded-full active:scale-[0.94] motion-reduce:active:scale-100 lg:hidden',
          inverted ? 'text-white hover:bg-white/10' : 'text-navy-800 hover:bg-navy-50',
        )}
      >
        <MenuGlyph open={open} />
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={cn(
          'fixed inset-0 top-[var(--nav-height)] z-40 bg-navy-950/18 backdrop-blur-[2px] transition-opacity duration-spring-sheet ease-spring-sheet lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Sheet */}
      <div
        id="mobile-menu"
        ref={sheetRef}
        className={cn(
          'fixed inset-x-0 top-[var(--nav-height)] z-40 origin-top overflow-hidden border-b border-line lg:hidden',
          // Materialises rather than fades: the blur ramps up with the scale
          // and the slide, so the surface reads as glass arriving instead of a
          // flat panel being turned up. A bigger surface than the bar above it,
          // so a heavier blur — weight is how the two read as different
          // thicknesses of the same material.
          'bg-white/96 transition-[transform,opacity,backdrop-filter] duration-spring-sheet ease-spring-sheet',
          open
            ? 'translate-y-0 scale-100 opacity-100 backdrop-blur-2xl backdrop-saturate-150'
            : 'pointer-events-none -translate-y-3 scale-[0.985] opacity-0 backdrop-blur-none',
        )}
      >
        <div className="shell safe-bottom pb-7 pt-3">
          <nav aria-label="Mobile">
            <ul>
              {navLinks.map((link, index) => (
                <li key={link.sectionId} className="border-b border-line last:border-b-0">
                  <a
                    href={isHome ? link.hash : `/${link.hash}`}
                    onClick={() => onOpenChange(false)}
                    style={{ transitionDelay: open ? `${90 + index * 55}ms` : '0ms' }}
                    className={cn(
                      'flex items-center justify-between py-4 text-display-sm font-semibold tracking-[-0.025em] text-ink-primary transition-[transform,opacity] duration-spring ease-spring',
                      open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                    )}
                  >
                    {link.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-5 w-5 text-ink-tertiary"
                      strokeWidth={2}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            style={{ transitionDelay: open ? `${90 + navLinks.length * 55}ms` : '0ms' }}
            className={cn(
              'mt-6 flex flex-col gap-4 transition-[transform,opacity] duration-spring ease-spring',
              open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
            )}
          >
            <ButtonLink
              href={isHome ? '#waitlist' : '/#waitlist'}
              size="lg"
              routeHover
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Join the iOS waitlist
            </ButtonLink>
            <StatusPill className="self-start">Coming soon on iOS</StatusPill>
          </div>
        </div>
      </div>
    </>
  );
}
