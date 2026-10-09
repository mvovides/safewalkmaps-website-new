import { useId } from 'react';

import { cn } from '@/lib/cn';

export type RouteTone = 'brand' | 'alt' | 'muted';

export type RouteLineProps = {
  d: string;
  tone?: RouteTone;
  /** Stroke width of the route itself, in user units. */
  width?: number;
  /** 0 = undrawn, 1 = fully drawn. */
  progress?: number;
  /** Draw a lighter casing beneath the route, the way map apps do. */
  casing?: boolean;
  /** Animate a dashed overlay along the route to suggest direction of travel. */
  flow?: boolean;
  /** Soft glow beneath the line. Used sparingly, for the chosen route. */
  glow?: boolean;
  className?: string;
  /** Hook for GSAP to target this specific line. */
  dataRoute?: string;
};

const strokes: Record<RouteTone, string> = {
  brand: 'var(--brand-green)',
  alt: '#5B7FB5',
  muted: 'rgb(6 42 94 / 0.22)',
};

/**
 * The route line — the site's central motif.
 *
 * `pathLength={1}` normalises the geometry so a dash offset of `1 - progress`
 * draws the line regardless of how long the path actually is. That keeps the
 * draw-on animation identical across every route on the page and means GSAP
 * only ever has to tween a single number between 0 and 1.
 */
export function RouteLine({
  d,
  tone = 'brand',
  width = 7,
  progress = 1,
  casing = true,
  flow = false,
  glow = false,
  className,
  dataRoute,
}: RouteLineProps) {
  const uid = useId().replace(/:/g, '');
  const glowId = `route-glow-${uid}`;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = 1 - clamped;

  const shared = {
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: 1,
  };

  return (
    <g className={cn(className)} data-route={dataRoute}>
      {glow && (
        <defs>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="blur" operator="over" />
          </filter>
        </defs>
      )}

      {glow && (
        <path
          {...shared}
          d={d}
          stroke={strokes[tone]}
          strokeWidth={width * 1.7}
          strokeOpacity={0.13}
          filter={`url(#${glowId})`}
          strokeDasharray="1"
          strokeDashoffset={offset}
          data-route-layer="glow"
        />
      )}

      {casing && (
        <path
          {...shared}
          d={d}
          stroke={tone === 'brand' ? '#FFFFFF' : '#FFFFFF'}
          strokeWidth={width + 5}
          strokeOpacity={0.9}
          strokeDasharray="1"
          strokeDashoffset={offset}
          data-route-layer="casing"
        />
      )}

      <path
        {...shared}
        d={d}
        stroke={strokes[tone]}
        strokeWidth={width}
        strokeDasharray="1"
        strokeDashoffset={offset}
        data-route-layer="line"
      />

      {flow && (
        <path
          {...shared}
          d={d}
          stroke="#FFFFFF"
          strokeWidth={width * 0.34}
          strokeOpacity={0.55}
          strokeDasharray="0.012 0.03"
          className="animate-route-dash"
          style={{ strokeDashoffset: offset }}
          data-route-layer="flow"
        />
      )}
    </g>
  );
}

export type RouteEndpointProps = {
  x: number;
  y: number;
  kind: 'origin' | 'destination';
  /** Scales the marker for small canvases. */
  scale?: number;
  pulse?: boolean;
};

/** Origin and destination markers: a ringed dot, and the shield-derived pin. */
export function RouteEndpoint({ x, y, kind, scale = 1, pulse = false }: RouteEndpointProps) {
  if (kind === 'origin') {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {pulse && (
          <circle r={9} fill="var(--brand-navy)" opacity={0.18} className="animate-node-pulse" />
        )}
        <circle r={9} fill="#FFFFFF" />
        <circle r={9} fill="none" stroke="var(--brand-navy)" strokeWidth={2.5} />
        <circle r={3.5} fill="var(--brand-navy)" />
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Pin shape echoing the shield in the logo. */}
      <path
        d="M 0 10 C -7.2 1.4 -11 -3.6 -11 -8.4 C -11 -15.1 -6.1 -20 0 -20 C 6.1 -20 11 -15.1 11 -8.4 C 11 -3.6 7.2 1.4 0 10 Z"
        fill="var(--brand-navy-deep)"
      />
      <circle cy={-8.6} r={4.1} fill="var(--brand-green)" />
    </g>
  );
}
