import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
  /** Clock shown in the status bar. */
  time?: string;
  /** Smaller shadow for phones used inside cards. */
  elevation?: 'full' | 'soft';
  /** Accessible description of what the mockup depicts. */
  label?: string;
};

/** iOS status-bar glyphs, drawn rather than imported so they stay crisp. */
function StatusGlyphs() {
  return (
    <div className="flex items-center gap-1.5">
      {/* Cellular */}
      <svg viewBox="0 0 18 12" className="h-[0.6em] w-auto" aria-hidden="true">
        <g fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" opacity="0.4" />
        </g>
      </svg>
      {/* Wi-Fi */}
      <svg viewBox="0 0 16 12" className="h-[0.62em] w-auto" aria-hidden="true">
        <path
          d="M8 10.8 5.9 8.4a3.2 3.2 0 0 1 4.2 0L8 10.8ZM3.7 5.9a6.4 6.4 0 0 1 8.6 0l-1.4 1.6a4.4 4.4 0 0 0-5.8 0L3.7 5.9ZM1.5 3.4a9.6 9.6 0 0 1 13 0l-1.4 1.6a7.6 7.6 0 0 0-10.2 0L1.5 3.4Z"
          fill="currentColor"
        />
      </svg>
      {/* Battery */}
      <svg viewBox="0 0 26 12" className="h-[0.64em] w-auto" aria-hidden="true">
        <rect
          x="0.6"
          y="0.6"
          width="22"
          height="10.8"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
        <rect x="2.3" y="2.3" width="14" height="7.4" rx="1.8" fill="currentColor" />
        <path
          d="M24.2 4.2v3.6a2 2 0 0 0 0-3.6Z"
          fill="currentColor"
          fillOpacity="0.4"
        />
      </svg>
    </div>
  );
}

/**
 * An iPhone-proportioned frame (393 × 852pt) built from DOM elements rather
 * than an image, so everything inside it can animate.
 *
 * Deliberately restrained: one hairline highlight on the bezel, one shadow,
 * no chrome reflections. The screen content should be what draws the eye.
 */
export function PhoneFrame({
  children,
  className,
  time = '23:41',
  elevation = 'full',
  label,
}: PhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative aspect-[393/852] w-full rounded-phone bg-navy-950 p-[0.44rem]',
        'ring-1 ring-white/12',
        elevation === 'full' ? 'shadow-phone' : 'shadow-phone-sm',
        className,
      )}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {/* Bezel highlight — a single hairline, not a gradient sheen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-phone bg-gradient-to-b from-white/14 via-transparent to-white/6"
      />

      {/* `.phone-screen` is the size container; `.phone-ui` must be a
          descendant of it, because an element cannot query itself — put both on
          one element and `cqw` silently falls back to the viewport. */}
      <div className="phone-screen relative h-full w-full overflow-hidden rounded-[2.45rem] bg-surface-secondary">
        <div className="phone-ui absolute inset-0">
          {/* Status bar */}
          <div className="absolute inset-x-0 top-0 z-30 flex h-[2.9em] items-center justify-between px-[1.4em] text-navy-900">
            <span className="tabular text-[0.72em] font-semibold tracking-tight">{time}</span>
            <StatusGlyphs />
          </div>

          {/* Dynamic Island */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[0.52em] z-40 h-[1.42em] w-[5.4em] -translate-x-1/2 rounded-pill bg-navy-950"
          />

          {children}

          {/* Home indicator */}
          <div
            aria-hidden="true"
            className="absolute bottom-[0.42em] left-1/2 z-40 h-[0.22em] w-[7.4em] -translate-x-1/2 rounded-pill bg-navy-900/28"
          />
        </div>
      </div>
    </div>
  );
}
