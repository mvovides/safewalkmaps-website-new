import { useId } from 'react';

import { cn } from '@/lib/cn';

/**
 * The SafeWalkMaps icon mark, traced from the supplied logo asset.
 *
 * Three layers, unchanged from the brand asset:
 *   1. the navy shield-pin          (#062E6F → #05295F → #031B3D)
 *   2. the green route threading through it (#6AF5A4 → #43E68D → #17F58B)
 *   3. the white walker
 *
 * The route layer is wrapped in a mask so it can be drawn on from the bottom —
 * the same gesture the site uses for every route line. `routeProgress` of 1
 * (the default) is the logo exactly as supplied.
 */

const SHIELD_PATH =
  'M 202.60 100.16 L 196.59 102.16 L 178.56 113.38 L 159.33 123.00 L 133.69 133.01 L 109.25 139.82 L 103.64 142.63 L 99.23 147.04 L 96.43 152.24 L 95.22 158.25 L 95.22 221.15 L 97.23 242.79 L 101.63 261.62 L 112.05 287.66 L 124.87 310.10 L 144.90 338.14 L 170.14 367.39 L 199.79 397.84 L 203.40 399.44 L 208.21 399.44 L 211.41 397.84 L 228.24 380.61 L 263.49 340.14 L 287.13 306.49 L 301.96 278.45 L 309.57 256.41 L 313.17 237.58 L 314.38 222.76 L 314.38 157.85 L 311.97 149.44 L 304.76 141.83 L 280.72 134.62 L 257.08 125.80 L 233.45 114.58 L 211.41 101.36 Z';

const ROUTE_PATH =
  'M 114.86 156.65 L 112.45 161.06 L 112.45 225.16 L 114.86 242.79 L 119.26 257.61 L 126.88 273.64 L 134.89 286.06 L 146.91 300.08 L 147.31 299.68 L 145.30 293.67 L 145.30 284.46 L 146.91 280.05 L 146.91 278.04 L 140.90 269.23 L 134.89 257.21 L 130.08 243.19 L 127.68 231.57 L 126.88 224.36 L 126.88 168.67 L 127.68 167.87 L 152.52 160.26 L 166.94 154.65 L 192.18 142.63 L 203.80 135.82 L 206.60 135.82 L 223.83 145.43 L 244.26 155.05 L 258.69 160.66 L 282.72 167.87 L 283.53 168.67 L 283.53 223.16 L 282.32 233.97 L 278.72 248.80 L 271.91 265.22 L 263.09 279.65 L 254.28 290.87 L 237.85 306.89 L 237.85 307.69 L 247.87 314.10 L 256.68 306.89 L 265.90 297.68 L 277.12 283.65 L 283.93 272.84 L 289.94 260.42 L 295.54 241.99 L 297.95 223.56 L 297.95 161.06 L 296.75 158.25 L 294.74 156.25 L 277.12 151.04 L 254.68 143.03 L 229.04 131.01 L 207.80 118.59 L 203.80 118.19 L 184.57 129.41 L 161.33 140.62 L 142.50 147.84 L 124.87 153.45 L 118.86 154.65 Z M 227.04 223.16 L 226.63 223.96 L 227.84 230.37 L 230.64 231.17 L 238.65 235.58 L 243.06 240.79 L 243.46 245.19 L 239.86 250.00 L 235.05 252.80 L 229.44 254.81 L 187.77 264.02 L 175.35 268.43 L 168.94 272.04 L 162.93 277.64 L 160.53 281.65 L 159.33 286.46 L 159.33 290.87 L 160.53 295.27 L 166.14 304.09 L 178.16 314.50 L 200.19 330.53 L 207.80 338.14 L 210.61 342.15 L 214.21 349.76 L 215.42 354.97 L 215.42 364.98 L 212.21 375.40 L 217.82 370.19 L 246.27 338.14 L 246.67 335.74 L 243.46 330.93 L 233.45 322.12 L 219.02 313.30 L 196.59 301.68 L 188.57 296.47 L 183.37 290.46 L 182.96 284.86 L 184.17 282.05 L 186.97 278.85 L 194.58 274.44 L 203.80 271.23 L 228.64 265.22 L 240.66 261.22 L 247.87 257.21 L 253.48 251.60 L 255.08 247.20 L 255.08 243.59 L 252.68 237.98 L 244.26 230.77 Z';

const WALKER_PATH =
  'M 205.40 177.48 L 202.60 177.08 L 198.59 178.29 L 188.97 184.70 L 182.96 189.90 L 179.76 204.33 L 180.16 206.73 L 181.76 207.93 L 184.57 207.93 L 186.17 206.73 L 189.38 194.31 L 190.58 193.11 L 194.58 190.71 L 195.79 190.71 L 196.19 193.91 L 189.78 225.56 L 176.96 242.79 L 177.76 246.39 L 180.16 248.00 L 183.77 247.60 L 197.79 230.37 L 200.19 221.15 L 200.99 219.95 L 201.79 219.95 L 203.40 221.55 L 208.61 228.77 L 211.41 245.99 L 213.81 248.00 L 216.62 248.00 L 218.22 247.20 L 219.42 245.59 L 219.82 243.59 L 217.02 224.76 L 207.40 209.94 L 209.41 198.72 L 210.61 198.32 L 213.41 202.32 L 224.63 208.33 L 226.63 208.33 L 228.64 206.73 L 229.04 203.53 L 228.24 203.53 L 227.44 201.92 L 219.02 197.12 L 216.62 195.11 L 211.01 181.89 L 209.01 179.49 Z M 205.80 157.05 L 203.00 158.25 L 200.59 161.06 L 199.79 163.06 L 199.79 167.07 L 201.39 170.27 L 203.80 172.28 L 207.40 173.48 L 210.21 173.08 L 212.61 171.88 L 214.62 169.87 L 215.82 167.47 L 215.82 162.66 L 214.62 160.26 L 212.61 158.25 L 209.81 157.05 Z';

/** The mark's native coordinate box, for callers nesting it in another SVG. */
export const SHIELD_VIEWBOX = '95 97 220 306';

export type ShieldMarkPathsProps = {
  /** 0 hides the green route, 1 shows the mark exactly as supplied. */
  routeProgress?: number;
  /** Render the shield in flat white, for use on navy surfaces. */
  variant?: 'brand' | 'mono-light';
};

/**
 * The mark's geometry as a bare `<g>`, so it can be composed into a larger
 * SVG scene (the hero does exactly this, nesting it inside the route canvas).
 */
export function ShieldMarkPaths({ routeProgress = 1, variant = 'brand' }: ShieldMarkPathsProps) {
  const uid = useId().replace(/:/g, '');
  const shieldGradient = `swm-shield-${uid}`;
  const routeGradient = `swm-route-${uid}`;
  const routeMask = `swm-route-mask-${uid}`;

  // The mask window grows upward from the base of the mark as progress rises,
  // so the route appears to travel up into the shield.
  const clamped = Math.min(1, Math.max(0, routeProgress));
  const maskHeight = 310 * clamped;
  const maskY = 404 - maskHeight;

  const mono = variant === 'mono-light';

  return (
    <g>
      <defs>
        <linearGradient id={shieldGradient} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#062E6F" />
          <stop offset="0.55" stopColor="#05295F" />
          <stop offset="1" stopColor="#031B3D" />
        </linearGradient>
        <linearGradient id={routeGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6AF5A4" />
          <stop offset="0.45" stopColor="#43E68D" />
          <stop offset="1" stopColor="#17F58B" />
        </linearGradient>
        <mask id={routeMask}>
          <rect x="90" y={maskY} width="230" height={maskHeight} fill="#fff" />
        </mask>
      </defs>

      <path d={SHIELD_PATH} fill={mono ? '#FFFFFF' : `url(#${shieldGradient})`} />
      <g mask={`url(#${routeMask})`}>
        <path d={ROUTE_PATH} fill={mono ? '#17F58B' : `url(#${routeGradient})`} />
      </g>
      <path d={WALKER_PATH} fill={mono ? '#031B3D' : '#FFFFFF'} />
    </g>
  );
}

export type ShieldMarkProps = ShieldMarkPathsProps & {
  className?: string;
  title?: string;
};

export function ShieldMark({
  className,
  routeProgress = 1,
  variant = 'brand',
  title,
}: ShieldMarkProps) {
  return (
    <svg
      viewBox={SHIELD_VIEWBOX}
      className={cn('block h-auto w-auto', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <ShieldMarkPaths routeProgress={routeProgress} variant={variant} />
    </svg>
  );
}
