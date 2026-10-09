import { useId } from 'react';

import type {
  CommunityReport,
  ContextMarker,
  CrowdPoint,
  LightPool,
  RiskZone,
} from '@/data/signals';

/**
 * The five data layers of the safety map, each as its own `<g>` so the
 * scroll timeline can fade them independently.
 *
 * Every layer carries `data-layer` so GSAP can target it by name instead of by
 * DOM position, which keeps the timeline readable.
 */

/* ---------------------------------------------------------------- 01 lighting */

export function LightingLayer({
  pools,
  unlit,
}: {
  pools: LightPool[];
  unlit: string[];
}) {
  const uid = useId().replace(/:/g, '');
  const glowId = `light-glow-${uid}`;

  return (
    <g data-layer="lighting">
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#FFD86B" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFD86B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Unlit streets, marked before the light goes on. */}
      <g
        stroke="var(--brand-navy-deep)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeOpacity={0.22}
        strokeDasharray="9 9"
        fill="none"
        data-layer="unlit"
      >
        {unlit.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      <g data-layer="light-pools">
        {pools.map((pool) => (
          <g key={`${pool.x}-${pool.y}`} data-light-pool>
            <circle cx={pool.x} cy={pool.y} r={pool.r} fill={`url(#${glowId})`} />
            <circle cx={pool.x} cy={pool.y} r={2.4} fill="#FFC93C" />
          </g>
        ))}
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- 02 incidents */

export function IncidentLayer({ zones }: { zones: RiskZone[] }) {
  const uid = useId().replace(/:/g, '');
  const zoneId = `risk-zone-${uid}`;
  const blurId = `risk-blur-${uid}`;

  return (
    <g data-layer="incidents">
      <defs>
        <radialGradient id={zoneId}>
          <stop offset="0" stopColor="#D92D20" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#D92D20" stopOpacity="0.2" />
          <stop offset="1" stopColor="#D92D20" stopOpacity="0" />
        </radialGradient>
        <filter id={blurId} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <g filter={`url(#${blurId})`}>
        {zones.map((zone) => (
          <ellipse
            key={`${zone.x}-${zone.y}`}
            cx={zone.x}
            cy={zone.y}
            rx={zone.rx}
            ry={zone.ry}
            fill={`url(#${zoneId})`}
            opacity={zone.intensity}
            data-risk-zone
          />
        ))}
      </g>

      {/* Contour ring on the densest areas, so intensity is not colour-only. */}
      <g fill="none" stroke="#D92D20" strokeWidth={1.25} strokeOpacity={0.3}>
        {zones
          .filter((zone) => zone.intensity > 0.5)
          .map((zone) => (
            <ellipse
              key={`ring-${zone.x}-${zone.y}`}
              cx={zone.x}
              cy={zone.y}
              rx={zone.rx * 0.62}
              ry={zone.ry * 0.62}
              strokeDasharray="4 5"
            />
          ))}
      </g>
    </g>
  );
}

/* ---------------------------------------------------------------- 03 footfall */

export function FootfallLayer({ points }: { points: CrowdPoint[] }) {
  return (
    <g data-layer="footfall">
      {points.map((point) => {
        const busy = point.density > 0.4;
        return (
          <g key={`${point.x}-${point.y}`} data-crowd-point>
            {busy ? (
              <>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={5 + point.density * 9}
                  fill="var(--brand-navy-bright)"
                  opacity={0.1 + point.density * 0.12}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={2 + point.density * 2.4}
                  fill="var(--brand-navy-bright)"
                  opacity={0.42 + point.density * 0.3}
                />
              </>
            ) : (
              // Quiet streets read as hollow rings — an empty street is a
              // signal in its own right, not an absence of one.
              <circle
                cx={point.x}
                cy={point.y}
                r={6}
                fill="none"
                stroke="var(--brand-navy)"
                strokeWidth={1.4}
                strokeOpacity={0.3}
                strokeDasharray="2.5 3"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ----------------------------------------------------------------- 04 reports */

export function ReportLayer({ reports }: { reports: CommunityReport[] }) {
  return (
    <g data-layer="reports">
      {reports.map((report) => (
        <g key={report.label} transform={`translate(${report.x} ${report.y})`} data-report-marker>
          <circle r={19} fill="var(--brand-green)" opacity={0.18} className="animate-node-pulse" />
          <circle r={12} fill="#FFFFFF" stroke="var(--brand-green-muted)" strokeWidth={2.25} />
          {/* Exclamation glyph, drawn so it stays crisp at any scale. */}
          <rect x={-1.3} y={-6.5} width={2.6} height={7.5} rx={1.3} fill="var(--brand-green-ink)" />
          <circle cy={4.4} r={1.6} fill="var(--brand-green-ink)" />
        </g>
      ))}
    </g>
  );
}

/* ----------------------------------------------------------------- 05 context */

export function ContextLayer({ markers }: { markers: ContextMarker[] }) {
  return (
    <g data-layer="context">
      {markers.map((marker) => {
        const key = `${marker.kind}-${marker.x}-${marker.y}`;

        if (marker.kind === 'crossing') {
          return (
            <g key={key} transform={`translate(${marker.x} ${marker.y})`} data-context-marker>
              <g stroke="var(--brand-navy)" strokeOpacity={0.75} strokeWidth={3.5}>
                <line x1={-12} y1={-9} x2={-12} y2={9} />
                <line x1={-4} y1={-9} x2={-4} y2={9} />
                <line x1={4} y1={-9} x2={4} y2={9} />
                <line x1={12} y1={-9} x2={12} y2={9} />
              </g>
            </g>
          );
        }

        if (marker.kind === 'closure') {
          return (
            <g key={key} transform={`translate(${marker.x} ${marker.y})`} data-context-marker>
              <rect x={-16} y={-6} width={32} height={12} rx={3} fill="var(--warning)" />
              <g stroke="#FFFFFF" strokeWidth={2.6} strokeOpacity={0.9}>
                <line x1={-8} y1={-6} x2={-14} y2={6} />
                <line x1={2} y1={-6} x2={-4} y2={6} />
                <line x1={12} y1={-6} x2={6} y2={6} />
              </g>
            </g>
          );
        }

        return (
          <g key={key} transform={`translate(${marker.x} ${marker.y})`} data-context-marker>
            {/* CCTV field of view. */}
            <path
              d="M 0 0 L 38 -22 A 44 44 0 0 0 38 22 Z"
              fill="var(--brand-navy-bright)"
              opacity={0.16}
            />
            <circle r={6.5} fill="var(--brand-navy)" opacity={0.85} />
            <circle r={2.6} fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------ shared decoration */

export type SafetyNodeProps = {
  x: number;
  y: number;
  /** Radius of the solid core. */
  r?: number;
  tone?: 'brand' | 'navy';
  pulse?: boolean;
};

/** A single pulsing safety node — used for accent geometry across the site. */
export function SafetyNode({ x, y, r = 4, tone = 'brand', pulse = true }: SafetyNodeProps) {
  const color = tone === 'brand' ? 'var(--brand-green)' : 'var(--brand-navy)';
  return (
    <g transform={`translate(${x} ${y})`}>
      {pulse && <circle r={r * 2.4} fill={color} opacity={0.2} className="animate-node-pulse" />}
      <circle r={r} fill={color} />
    </g>
  );
}
