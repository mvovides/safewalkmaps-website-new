import { SHIELD_VIEWBOX, ShieldMarkPaths } from '@/components/brand/ShieldMark';
import { cn } from '@/lib/cn';

/**
 * The hero's opening composition.
 *
 * A single green route climbs from below the fold into the shield; then a navy
 * route peels away from the same fork and takes its own way to the same place.
 * That is the whole product argument, told in two lines.
 *
 * Rendered as static markup with `data-*` hooks. The hero's GSAP timeline
 * tweens the dash offsets on these nodes directly, so scrubbing the intro
 * never triggers a React render.
 */

/**
 * Geometry sits inside viewBox y 100–800. At every common viewport the canvas
 * is cropped to roughly that band by `xMidYMid slice`, so the composition stays
 * clear of the caption above it and never runs off the bottom of the screen.
 */
export const TRUNK_PATH = 'M 200 900 V 836 H 356 V 772 H 468 V 706 H 600 V 650';
export const GREEN_PATH = 'M 600 650 V 510';
export const NAVY_PATH = 'M 600 650 H 468 V 570 H 584 V 510';

/** Faint street geometry behind the routes, for depth. */
/**
 * The route follows this grid exactly, so the two read as one street network
 * rather than a line laid over wallpaper.
 */
const AMBIENT_STREETS = [
  'M 200 900 V 486',
  'M 356 900 V 486',
  'M 468 900 V 486',
  'M 712 900 V 486',
  'M 856 900 V 486',
  'M 1000 900 V 540',
  'M 104 570 H 1096',
  'M 104 650 H 1096',
  'M 104 706 H 1096',
  'M 104 772 H 1096',
  'M 104 836 H 1096',
];

const AMBIENT_NODES = [
  { x: 356, y: 650 },
  { x: 712, y: 706 },
  { x: 856, y: 570 },
  { x: 468, y: 836 },
  { x: 1000, y: 650 },
];

export type HeroIntroCanvasProps = {
  className?: string;
  /**
   * Render the finished composition rather than the pre-animation state.
   * Used for the reduced-motion opening, where no timeline will ever run.
   */
  revealed?: boolean;
};

export function HeroIntroCanvas({ className, revealed = false }: HeroIntroCanvasProps) {
  const hidden = revealed ? 1 : 0;
  const line = {
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: 1,
  };

  return (
    <svg
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      aria-hidden="true"
    >
      {/* Ambient street network */}
      <g data-hero="ambient" opacity={hidden}>
        <g {...line} stroke="rgb(6 42 94 / 0.055)" strokeWidth={1.75}>
          {AMBIENT_STREETS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {AMBIENT_NODES.map((node) => (
          <circle
            key={`${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r={2.5}
            fill="rgb(6 42 94 / 0.12)"
          />
        ))}
      </g>

      {/* The navy alternative — the conventional fastest route. */}
      <g data-hero="navy-group" opacity={hidden}>
        <path {...line} d={NAVY_PATH} stroke="#FFFFFF" strokeWidth={11} data-hero="navy-casing" />
        <path {...line} d={NAVY_PATH} stroke="#5B7FB5" strokeWidth={5} data-hero="navy" />
      </g>

      {/* The SafeWalkMaps route.
          Both casings are painted before either coloured line, so the round cap
          where the trunk meets the branch cannot punch a white notch through
          the line it joins. */}
      <g data-hero="green-group">
        <path {...line} d={TRUNK_PATH} stroke="#FFFFFF" strokeWidth={12} data-hero="trunk-casing" />
        <path {...line} d={GREEN_PATH} stroke="#FFFFFF" strokeWidth={12} data-hero="green-casing" />
        <path
          {...line}
          d={TRUNK_PATH}
          stroke="var(--brand-green)"
          strokeWidth={5.5}
          data-hero="trunk"
        />
        <path
          {...line}
          d={GREEN_PATH}
          stroke="var(--brand-green)"
          strokeWidth={5.5}
          data-hero="green"
        />
      </g>

      {/* Fork marker */}
      <g data-hero="fork" opacity={hidden}>
        <circle cx={600} cy={650} r={13} fill="var(--brand-green)" opacity={0.16} />
        <circle cx={600} cy={650} r={5.5} fill="#FFFFFF" />
        <circle
          cx={600}
          cy={650}
          r={5.5}
          fill="none"
          stroke="var(--brand-green-muted)"
          strokeWidth={2.5}
        />
      </g>

      {/* The shield the route climbs into. */}
      <svg
        x={545}
        y={353}
        width={110}
        height={153}
        viewBox={SHIELD_VIEWBOX}
        data-hero="shield"
        overflow="visible"
      >
        <ShieldMarkPaths />
      </svg>
    </svg>
  );
}
