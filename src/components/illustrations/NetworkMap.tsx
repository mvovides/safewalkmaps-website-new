import {
  communityReports,
  contextMarkers,
  crowdPoints,
  lightPools,
  networkDestination,
  networkFastRoute,
  networkOrigin,
  networkRoute,
  networkStreets,
  riskZones,
  unlitStreets,
  NETWORK_HEIGHT,
  NETWORK_WIDTH,
} from '@/data/signals';
import { cn } from '@/lib/cn';

import { RouteEndpoint } from './RouteLine';
import {
  ContextLayer,
  FootfallLayer,
  IncidentLayer,
  LightingLayer,
  ReportLayer,
} from './SafetyLayers';

/**
 * The street network behind the safety-layer story.
 *
 * Each data layer is its own `<g data-layer="…">`, so the section's scroll
 * timeline can bring them up and settle them back by name. Layers start hidden
 * and the chosen route starts undrawn; GSAP owns those properties from mount.
 */
export function NetworkMap({ className }: { className?: string }) {
  const line = {
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: 1,
  };

  return (
    <svg
      viewBox={`0 0 ${NETWORK_WIDTH} ${NETWORK_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-full w-full', className)}
      aria-hidden="true"
    >
      {/* Base network */}
      <g fill="none" strokeLinecap="round">
        <g stroke="rgb(6 42 94 / 0.09)" strokeWidth={2.5}>
          {networkStreets
            .filter((street) => !street.major)
            .map((street) => (
              <path key={street.d} d={street.d} />
            ))}
        </g>
        <g stroke="rgb(6 42 94 / 0.15)" strokeWidth={7}>
          {networkStreets
            .filter((street) => street.major)
            .map((street) => (
              <path key={street.d} d={street.d} />
            ))}
        </g>
      </g>

      {/* Data layers */}
      <g data-layer-group="lighting" opacity={0}>
        <LightingLayer pools={lightPools} unlit={unlitStreets} />
      </g>
      <g data-layer-group="incidents" opacity={0}>
        <IncidentLayer zones={riskZones} />
      </g>
      <g data-layer-group="footfall" opacity={0}>
        <FootfallLayer points={crowdPoints} />
      </g>
      <g data-layer-group="reports" opacity={0}>
        <ReportLayer reports={communityReports} />
      </g>
      <g data-layer-group="context" opacity={0}>
        <ContextLayer markers={contextMarkers} />
      </g>

      {/* The conventional fastest route, for contrast. */}
      <g data-layer-group="fast-route" opacity={0}>
        <path {...line} d={networkFastRoute} stroke="#FFFFFF" strokeWidth={11} />
        <path
          {...line}
          d={networkFastRoute}
          stroke="#5B7FB5"
          strokeWidth={5}
          strokeDasharray="0.014 0.016"
        />
      </g>

      {/* The route every layer has been building towards. */}
      <g data-layer-group="route" opacity={0}>
        <path {...line} d={networkRoute} stroke="#FFFFFF" strokeWidth={16} data-route-casing />
        <path
          {...line}
          d={networkRoute}
          stroke="var(--brand-green)"
          strokeWidth={8}
          data-route-line
        />
      </g>

      {/* Endpoints */}
      <g data-layer-group="endpoints" opacity={0}>
        <RouteEndpoint x={networkOrigin.x} y={networkOrigin.y} kind="origin" scale={1.2} />
        <RouteEndpoint
          x={networkDestination.x}
          y={networkDestination.y}
          kind="destination"
          scale={1.2}
        />
      </g>
    </svg>
  );
}
