import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type SafetyScoreRingProps = {
  /** Route score, 0–100. */
  score: number;
  /**
   * Lowest single-segment score on the route. Shown as a notch on the ring —
   * the routing model tracks it, so the interface shows it rather than letting
   * a good average hide a bad stretch.
   */
  lowestSegment?: number;
  /** 0–1, scales the drawn arc for scroll-driven reveals. */
  progress?: number;
  className?: string;
  tone?: 'light' | 'dark';
  strokeWidth?: number;
  children?: ReactNode;
};

const SIZE = 200;
const RADIUS = 86;

/**
 * The Safety Score ring.
 *
 * The arc is a circle with `pathLength={1}`, so the drawn fraction is exactly
 * `score / 100` and the reveal is a single dash-offset tween.
 */
export function SafetyScoreRing({
  score,
  lowestSegment,
  progress = 1,
  className,
  tone = 'light',
  strokeWidth = 12,
  children,
}: SafetyScoreRingProps) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `score-arc-${uid}`;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const fraction = (Math.min(100, Math.max(0, score)) / 100) * clampedProgress;

  const trackColor = tone === 'light' ? 'rgb(6 42 94 / 0.08)' : 'rgb(255 255 255 / 0.12)';
  const tickColor = tone === 'light' ? 'rgb(6 42 94 / 0.16)' : 'rgb(255 255 255 / 0.22)';

  // Notch angle for the lowest segment, measured from 12 o'clock.
  const notchAngle = lowestSegment === undefined ? null : (lowestSegment / 100) * 360 - 90;

  return (
    <div className={cn('relative grid aspect-square place-items-center', className)}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6AF5A4" />
            <stop offset="0.45" stopColor="#43E68D" />
            <stop offset="1" stopColor="#17F58B" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Scale ticks every 10 points */}
        <g stroke={tickColor} strokeWidth={1.5} strokeLinecap="round">
          {Array.from({ length: 10 }, (_, index) => {
            const angle = (index / 10) * 360 - 90;
            const radians = (angle * Math.PI) / 180;
            const inner = RADIUS - strokeWidth / 2 - 5;
            const outer = RADIUS - strokeWidth / 2 - 1;
            return (
              <line
                key={index}
                x1={SIZE / 2 + Math.cos(radians) * inner}
                y1={SIZE / 2 + Math.sin(radians) * inner}
                x2={SIZE / 2 + Math.cos(radians) * outer}
                y2={SIZE / 2 + Math.sin(radians) * outer}
              />
            );
          })}
        </g>

        {/* Score arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - fraction}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          data-score-arc
          style={{ transition: 'stroke-dashoffset var(--duration-slower) var(--ease-out-expo)' }}
        />

        {/* Lowest-segment notch */}
        {notchAngle !== null && (
          <g
            transform={`rotate(${notchAngle} ${SIZE / 2} ${SIZE / 2})`}
            opacity={clampedProgress}
          >
            <line
              x1={SIZE / 2 + RADIUS - strokeWidth / 2 - 2}
              y1={SIZE / 2}
              x2={SIZE / 2 + RADIUS + strokeWidth / 2 + 2}
              y2={SIZE / 2}
              stroke={tone === 'light' ? 'var(--brand-navy)' : '#FFFFFF'}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
      <div className="relative z-10 flex flex-col items-center">{children}</div>
    </div>
  );
}
