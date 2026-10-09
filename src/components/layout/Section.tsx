import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Surface treatment. `navy` flips the section to the dark brand surface. */
  tone?: 'white' | 'secondary' | 'navy';
  /** Vertical rhythm. */
  spacing?: 'normal' | 'large' | 'none';
  /** Remove the content shell so the section can run full-bleed. */
  bleed?: boolean;
  'aria-labelledby'?: string;
};

const tones: Record<NonNullable<SectionProps['tone']>, string> = {
  white: 'bg-surface text-ink-primary',
  secondary: 'bg-surface-secondary text-ink-primary',
  navy: 'on-navy bg-surface-navy text-white',
};

const spacings: Record<NonNullable<SectionProps['spacing']>, string> = {
  normal: 'py-section',
  large: 'py-section-lg',
  none: '',
};

export function Section({
  id,
  children,
  className,
  tone = 'white',
  spacing = 'normal',
  bleed = false,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('relative', tones[tone], spacings[spacing], className)}
      {...rest}
    >
      {bleed ? children : <div className="shell">{children}</div>}
    </section>
  );
}

export type EyebrowProps = {
  /** Section index, e.g. "02". */
  index?: string;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'inverse';
};

/** The small all-caps section label: `02 — The problem`. */
export function Eyebrow({ index, children, className, tone = 'default' }: EyebrowProps) {
  return (
    <p className={cn('eyebrow', tone === 'inverse' && 'text-white/55', className)}>
      {index && (
        <>
          <span className={cn('tabular', tone === 'inverse' ? 'text-green-500' : 'text-green-800')}>
            {index}
          </span>
          <span
            aria-hidden="true"
            className={cn('eyebrow-rule', tone === 'inverse' && 'bg-white/25')}
          />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}

export type SectionHeadingProps = {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
  tone?: 'default' | 'inverse';
  size?: 'md' | 'lg';
  id?: string;
};

/**
 * The standard section opener. Left-aligned by default — centred headings are
 * reserved for the few deliberate focal moments on the page.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  className,
  align = 'left',
  tone = 'default',
  size = 'lg',
  id,
}: SectionHeadingProps) {
  const inverse = tone === 'inverse';
  return (
    <header
      className={cn(
        'flex flex-col',
        align === 'center' && 'items-center text-center',
        className,
      )}
      data-reveal-stagger
    >
      {eyebrow && (
        <Eyebrow index={index} tone={tone} className="mb-5">
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        id={id}
        className={cn(
          size === 'lg' ? 'text-display-lg' : 'text-display-md',
          'max-w-[20ch] font-semibold',
          align === 'center' && 'max-w-[26ch]',
          inverse && 'text-white',
        )}
      >
        {title}
      </h2>
      {lede && (
        <div
          className={cn(
            'mt-6 max-w-prose text-body-lg',
            inverse ? 'text-white/70' : 'text-ink-secondary',
            align === 'center' && 'mx-auto',
          )}
        >
          {lede}
        </div>
      )}
    </header>
  );
}
