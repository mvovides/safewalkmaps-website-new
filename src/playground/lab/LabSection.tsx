import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type LabSectionProps = {
  id: string;
  title: string;
  variant?: string;
  tone?: 'default' | 'navy';
  /** Children run full-bleed; the caption keeps its shell. */
  bleed?: boolean;
  children: ReactNode;
};

/** One composition's frame: a themed section with an unthemed caption naming its variant. */
export function LabSection({
  id,
  title,
  variant,
  tone = 'default',
  bleed = false,
  children,
}: LabSectionProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      data-nav-theme={tone === 'navy' ? 'dark' : undefined}
      className={cn(
        'lab-section',
        tone === 'navy' ? 'on-navy bg-surface-navy text-white' : 'bg-surface text-ink-primary',
      )}
    >
      <div className="shell pt-section">
        <p className="lab-chrome">
          <span>{title}</span>
          {variant && <span>· {variant}</span>}
        </p>
      </div>
      {bleed ? children : <div className="shell pb-section">{children}</div>}
    </section>
  );
}
