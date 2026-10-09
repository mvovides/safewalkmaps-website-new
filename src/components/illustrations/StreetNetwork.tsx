import { cn } from '@/lib/cn';

export type StreetLike = { d: string; major?: boolean };

export type StreetNetworkProps = {
  streets: StreetLike[];
  className?: string;
  /** `light` sits on white surfaces, `dark` on the navy surface. */
  tone?: 'light' | 'dark';
  /** Multiplier for stroke widths, for small canvases. */
  scale?: number;
  /** Progressive construction: 0 draws nothing, 1 draws the whole network. */
  progress?: number;
};

/**
 * The street network every map visual is built on.
 *
 * Two passes — minor streets then main roads — so junctions read correctly
 * and the heavier roads sit on top. Main roads are also the streets that tend
 * to carry lighting and footfall, which makes the hierarchy meaningful rather
 * than decorative.
 */
export function StreetNetwork({
  streets,
  className,
  tone = 'light',
  scale = 1,
  progress = 1,
}: StreetNetworkProps) {
  const minorStroke = tone === 'light' ? 'rgb(6 42 94 / 0.10)' : 'rgb(255 255 255 / 0.10)';
  const majorStroke = tone === 'light' ? 'rgb(6 42 94 / 0.16)' : 'rgb(255 255 255 / 0.17)';
  const clamped = Math.min(1, Math.max(0, progress));

  const minor = streets.filter((street) => !street.major);
  const major = streets.filter((street) => street.major);

  return (
    <g className={cn(className)} data-layer="streets">
      <g stroke={minorStroke} strokeWidth={2.5 * scale} strokeLinecap="round" fill="none">
        {minor.map((street) => (
          <path
            key={street.d}
            d={street.d}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - clamped}
          />
        ))}
      </g>
      <g stroke={majorStroke} strokeWidth={6 * scale} strokeLinecap="round" fill="none">
        {major.map((street) => (
          <path
            key={street.d}
            d={street.d}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - clamped}
          />
        ))}
      </g>
    </g>
  );
}

export type MapSurfaceProps = {
  width: number;
  height: number;
  tone?: 'light' | 'dark';
  /** Rounded-corner radius for the map plate. */
  radius?: number;
};

/** The paper the map is printed on: a soft plate plus a faint block grid. */
export function MapSurface({ width, height, tone = 'light', radius = 0 }: MapSurfaceProps) {
  const fill = tone === 'light' ? '#F6F8FB' : '#05224A';
  const grid = tone === 'light' ? 'rgb(6 42 94 / 0.045)' : 'rgb(255 255 255 / 0.05)';

  return (
    <g data-layer="surface">
      <rect width={width} height={height} rx={radius} fill={fill} />
      <g stroke={grid} strokeWidth={1} fill="none">
        {Array.from({ length: Math.floor(width / 40) }, (_, index) => (
          <line key={`v${index}`} x1={(index + 1) * 40} y1={0} x2={(index + 1) * 40} y2={height} />
        ))}
        {Array.from({ length: Math.floor(height / 40) }, (_, index) => (
          <line key={`h${index}`} x1={0} y1={(index + 1) * 40} x2={width} y2={(index + 1) * 40} />
        ))}
      </g>
    </g>
  );
}
