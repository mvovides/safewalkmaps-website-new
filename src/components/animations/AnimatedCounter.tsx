import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

export type AnimatedCounterProps = {
  value: number;
  /** Where the count starts from. */
  from?: number;
  durationMs?: number;
  className?: string;
  /** Appended inside the same element, e.g. "%". */
  suffix?: string;
  /** Re-run whenever `value` changes, not only on first view. */
  live?: boolean;
};

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * Writes to `textContent` from inside a rAF loop rather than through React
 * state, so a counting number never triggers a re-render — and the element
 * carries the final value in the DOM from the start for crawlers and for
 * anyone with reduced motion enabled.
 */
export function AnimatedCounter({
  value,
  from = 0,
  durationMs = 1400,
  className,
  suffix,
  live = false,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (armed || reduced || typeof IntersectionObserver !== 'function') return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [armed, reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduced || (!armed && !live)) {
      node.textContent = String(value);
      return;
    }
    if (!armed) return;

    const start = performance.now();
    const origin = live ? Number(node.textContent) || from : from;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const current = origin + (value - origin) * easeOutExpo(progress);
      node.textContent = String(Math.round(current));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [armed, value, from, durationMs, reduced, live]);

  return (
    <span className={cn('tabular', className)}>
      <span ref={ref}>{value}</span>
      {suffix}
    </span>
  );
}
