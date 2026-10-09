import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group/button relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-pill font-semibold transition-[transform,box-shadow,background-color,color,border-color] duration-base ease-out-expo ' +
  'touch-manipulation active:scale-[0.97] motion-reduce:active:scale-100 ' +
  'disabled:pointer-events-none disabled:opacity-55';

const variants: Record<Variant, string> = {
  primary: 'bg-navy-800 text-white shadow-md hover:bg-navy-700 hover:shadow-lg active:bg-navy-900',
  accent:
    'bg-green-500 text-navy-900 shadow-green hover:bg-green-400 hover:shadow-green-lg active:bg-green-600',
  secondary:
    'border border-line-strong bg-white text-navy-800 shadow-xs hover:border-navy-300 hover:bg-navy-50 hover:shadow-sm',
  ghost: 'text-ink-secondary hover:bg-surface-tertiary hover:text-navy-800',
  inverse:
    'border border-line-inverse-strong bg-white/8 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/14',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-body-sm',
  md: 'h-12 px-5 text-body-sm',
  lg: 'h-14 px-7 text-body',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Draws a brand route line that travels across the button on hover. */
  routeHover?: boolean;
};

/**
 * A thin green line that sweeps along the base of the button on hover — the
 * same route-drawing gesture the rest of the site uses, at button scale.
 */
function RouteSheen({ variant }: { variant: Variant }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-5 bottom-[0.55rem] h-px origin-left scale-x-0 rounded-full transition-transform duration-slower ease-out-expo group-hover/button:scale-x-100',
        variant === 'accent' ? 'bg-navy-900/35' : 'bg-green-500',
      )}
    />
  );
}

export type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, routeHover = false, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {routeHover && <RouteSheen variant={variant} />}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
});

export type ButtonLinkProps = CommonProps & {
  href: string;
  /** Force an anchor tag — used for in-page hashes and external links. */
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  onPointerMove?: React.PointerEventHandler<HTMLAnchorElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLAnchorElement>;
  'aria-label'?: string;
};

/**
 * Link-flavoured button.
 *
 * Internal paths route through react-router; hashes and external URLs stay as
 * plain anchors so in-page navigation and new tabs behave natively.
 */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  {
    href,
    external,
    variant = 'primary',
    size = 'md',
    className,
    children,
    routeHover = false,
    onClick,
    ...rest
  },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <>
      {routeHover && <RouteSheen variant={variant} />}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </>
  );

  const isExternal = external || /^https?:|^mailto:|^tel:/.test(href);
  const isHash = href.startsWith('#');

  if (isExternal || isHash) {
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        onClick={onClick}
        {...(isExternal && !href.startsWith('mailto:') && !href.startsWith('tel:')
          ? { target: '_blank', rel: 'noreferrer noopener' }
          : {})}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link ref={ref} to={href} className={classes} onClick={onClick} {...rest}>
      {inner}
    </Link>
  );
});
