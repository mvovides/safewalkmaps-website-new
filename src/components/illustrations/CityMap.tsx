import { useId } from 'react';

import {
  destination,
  origin,
  parkBlock,
  routes,
  streets,
  type RouteKey,
} from '@/data/city';
import { cn } from '@/lib/cn';

import { RouteEndpoint, RouteLine } from './RouteLine';

/** Bounding box of every route, used to fit the map into a viewport band. */
const ROUTE_BOX = { x: 54, y: 56, width: 288, height: 280 } as const;

export type CityMapProps = {
  /** Viewport in screen units — normally the phone screen, 393 × 852. */
  width: number;
  height: number;
  /** Vertical band the route must sit inside (e.g. below the status bar,
   *  above the bottom sheet). */
  band: { top: number; bottom: number };
  /** The route drawn in full brand green. */
  activeRoute: RouteKey;
  /** Also draw the other two routes, dimmed, underneath. */
  showAlternatives?: boolean;
  /** 0–1 draw progress for the active route. */
  routeProgress?: number;
  /** 0–1 draw progress for the street network. */
  networkProgress?: number;
  /** Animate the direction-of-travel dashes along the active route. */
  flow?: boolean;
  className?: string;
  /** Darken the whole map, for the night-time navigation screen. */
  tone?: 'day' | 'night';
};

/**
 * The map behind every phone screen.
 *
 * The city is authored in its own 360 × 400 coordinate space and then fitted
 * into the caller's viewport with a single transform, so the route always lands
 * inside the visible band while the street network still bleeds off every edge.
 */
export function CityMap({
  width,
  height,
  band,
  activeRoute,
  showAlternatives = false,
  routeProgress = 1,
  networkProgress = 1,
  flow = false,
  className,
  tone = 'day',
}: CityMapProps) {
  const uid = useId().replace(/:/g, '');
  const gridId = `city-grid-${uid}`;

  // Fit the route box into the band, with a comfortable margin.
  const marginX = 30;
  const bandHeight = band.bottom - band.top;
  const scale = Math.min(
    (width - marginX * 2) / ROUTE_BOX.width,
    (bandHeight - 32) / ROUTE_BOX.height,
  );
  const translateX = (width - ROUTE_BOX.width * scale) / 2 - ROUTE_BOX.x * scale;
  const translateY = band.top + (bandHeight - ROUTE_BOX.height * scale) / 2 - ROUTE_BOX.y * scale;

  const night = tone === 'night';
  const surfaceFill = night ? '#071F42' : '#EEF2F7';
  const parkFill = night ? 'rgb(23 245 139 / 0.08)' : 'rgb(23 245 139 / 0.10)';
  const minorStroke = night ? 'rgb(255 255 255 / 0.11)' : 'rgb(6 42 94 / 0.11)';
  const majorStroke = night ? 'rgb(255 255 255 / 0.2)' : 'rgb(6 42 94 / 0.17)';
  const pathStroke = night ? 'rgb(255 255 255 / 0.16)' : 'rgb(6 42 94 / 0.16)';

  const alternatives = routes.filter((route) => route.key !== activeRoute);
  const active = routes.find((route) => route.key === activeRoute) ?? routes[0];
  const dash = 1 - Math.min(1, Math.max(0, networkProgress));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id={gridId} width="26" height="26" patternUnits="userSpaceOnUse">
          <path
            d="M 26 0 L 0 0 0 26"
            fill="none"
            stroke={night ? 'rgb(255 255 255 / 0.04)' : 'rgb(6 42 94 / 0.04)'}
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width={width} height={height} fill={surfaceFill} />
      <rect width={width} height={height} fill={`url(#${gridId})`} />

      <g transform={`translate(${translateX} ${translateY}) scale(${scale})`}>
        {/* Park */}
        <path d={parkBlock} fill={parkFill} />

        {/* Street network */}
        <g fill="none" strokeLinecap="round">
          <g stroke={minorStroke} strokeWidth={2.6}>
            {streets
              .filter((street) => !street.major && !street.path)
              .map((street) => (
                <path
                  key={street.d}
                  d={street.d}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={dash}
                />
              ))}
          </g>
          <g stroke={majorStroke} strokeWidth={6.5}>
            {streets
              .filter((street) => street.major)
              .map((street) => (
                <path
                  key={street.d}
                  d={street.d}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={dash}
                />
              ))}
          </g>
          {/* Unlit footpaths read as dashed lines. */}
          <g stroke={pathStroke} strokeWidth={2.4} strokeDasharray="5 6">
            {streets
              .filter((street) => street.path)
              .map((street) => (
                <path key={street.d} d={street.d} opacity={networkProgress} />
              ))}
          </g>
        </g>

        {/* Alternative routes, dimmed beneath the chosen one. */}
        {showAlternatives &&
          alternatives.map((route) => (
            <RouteLine
              key={route.key}
              d={route.d}
              tone="muted"
              width={5}
              casing={false}
              progress={routeProgress}
              dataRoute={route.key}
            />
          ))}

        {/* The chosen route. */}
        {active && (
          <RouteLine
            d={active.d}
            tone="brand"
            width={7}
            progress={routeProgress}
            glow
            flow={flow}
            dataRoute={active.key}
          />
        )}

        <g opacity={routeProgress > 0.1 ? 1 : 0} style={{ transition: 'opacity 300ms' }}>
          <RouteEndpoint x={origin.x} y={origin.y} kind="origin" pulse />
          <RouteEndpoint x={destination.x} y={destination.y} kind="destination" />
        </g>
      </g>
    </svg>
  );
}
