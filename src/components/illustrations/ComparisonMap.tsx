import { cn } from '@/lib/cn';

/**
 * The fastest-versus-safer comparison map.
 *
 * Canvas 800 × 440. Both routes share an origin and destination, and their
 * lengths carry the same numbers used everywhere else on the site:
 *
 *   Fastest  762.8 units → 1.73 km → 20.8 min   (diagonal across the park)
 *   Safer    880.0 units → 2.00 km → 24.0 min   (grid, main roads)
 *
 * at 5.0 km/h — so "+3 minutes" is a measured consequence of the geometry
 * rather than a number picked to look good.
 *
 * Rendered as static markup with `data-*` hooks; the section's GSAP timeline
 * drives the transformation.
 */

export const FAST_ROUTE = 'M 80 360 H 120 L 320 160 H 560 V 80 H 680';
export const SAFE_ROUTE = 'M 80 360 H 200 V 240 H 440 V 160 H 560 V 80 H 680';

const PARK = 'M 120 160 H 320 V 360 H 120 Z';

const STREETS = [
  { d: 'M 200 -20 V 460', major: true },
  { d: 'M -20 240 H 820', major: true },
  { d: 'M 560 -20 V 460', major: true },
  { d: 'M -20 80 H 820', major: true },
  { d: 'M 320 -20 V 460' },
  { d: 'M 440 -20 V 460' },
  { d: 'M 680 -20 V 460' },
  { d: 'M 80 -20 V 160' },
  { d: 'M 80 360 V 460' },
  { d: 'M -20 160 H 820' },
  { d: 'M -20 320 H 120' },
  { d: 'M 320 320 H 820' },
  { d: 'M -20 400 H 820' },
];

/** Lamps along the safer route — the reason it scores the way it does. */
const LAMPS = [
  { x: 140, y: 360 },
  { x: 200, y: 360 },
  { x: 200, y: 300 },
  { x: 200, y: 240 },
  { x: 270, y: 240 },
  { x: 340, y: 240 },
  { x: 410, y: 240 },
  { x: 440, y: 200 },
  { x: 480, y: 160 },
  { x: 560, y: 160 },
  { x: 560, y: 110 },
  { x: 620, y: 80 },
  { x: 680, y: 80 },
];

export function ComparisonMap({ className }: { className?: string }) {
  const line = {
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: 1,
  };

  return (
    <svg
      viewBox="0 0 800 440"
      className={cn('h-full w-full', className)}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cmp-lamp">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFD86B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Park — the block the fast route cuts across. */}
      <path d={PARK} fill="rgb(6 42 94 / 0.045)" />
      <text
        x="220"
        y="266"
        textAnchor="middle"
        className="fill-ink-tertiary text-[13px] font-medium"
        style={{ letterSpacing: '0.04em' }}
      >
        Park
      </text>

      {/* Streets */}
      <g fill="none" strokeLinecap="round">
        <g stroke="rgb(6 42 94 / 0.09)" strokeWidth={2.5}>
          {STREETS.filter((s) => !s.major).map((s) => (
            <path key={s.d} d={s.d} />
          ))}
        </g>
        <g stroke="rgb(6 42 94 / 0.15)" strokeWidth={7}>
          {STREETS.filter((s) => s.major).map((s) => (
            <path key={s.d} d={s.d} />
          ))}
        </g>
      </g>

      {/* Street lighting, revealed with the safer route. */}
      <g data-cmp="lamps" opacity={0}>
        {LAMPS.map((lamp) => (
          <g key={`${lamp.x}-${lamp.y}`}>
            <circle cx={lamp.x} cy={lamp.y} r={23} fill="url(#cmp-lamp)" />
            <circle cx={lamp.x} cy={lamp.y} r={2.2} fill="#FFC93C" />
          </g>
        ))}
      </g>

      {/* The fastest route. */}
      <g data-cmp="fast-group">
        <path {...line} d={FAST_ROUTE} stroke="#FFFFFF" strokeWidth={14} />
        <path {...line} d={FAST_ROUTE} stroke="#5B7FB5" strokeWidth={6.5} data-cmp="fast" />
      </g>

      {/* The safer route, drawn over it. */}
      <g data-cmp="safe-group" opacity={0}>
        <path {...line} d={SAFE_ROUTE} stroke="#FFFFFF" strokeWidth={15} data-cmp="safe-casing" />
        <path
          {...line}
          d={SAFE_ROUTE}
          stroke="var(--brand-green)"
          strokeWidth={7}
          data-cmp="safe"
        />
      </g>

      {/* Endpoints */}
      <g>
        <circle cx={80} cy={360} r={9} fill="#FFFFFF" />
        <circle cx={80} cy={360} r={9} fill="none" stroke="var(--brand-navy)" strokeWidth={2.5} />
        <circle cx={80} cy={360} r={3.5} fill="var(--brand-navy)" />
        <g transform="translate(680 80)">
          <path
            d="M 0 10 C -7.2 1.4 -11 -3.6 -11 -8.4 C -11 -15.1 -6.1 -20 0 -20 C 6.1 -20 11 -15.1 11 -8.4 C 11 -3.6 7.2 1.4 0 10 Z"
            fill="var(--brand-navy-deep)"
          />
          <circle cy={-8.6} r={4.1} fill="var(--brand-green)" />
        </g>
      </g>

      {/* Labels */}
      <text x="80" y="392" textAnchor="middle" className="fill-ink-secondary text-[13px] font-medium">
        Library
      </text>
      <text x="680" y="48" textAnchor="middle" className="fill-ink-secondary text-[13px] font-medium">
        Home
      </text>
    </svg>
  );
}
