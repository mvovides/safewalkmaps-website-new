import { cn } from '@/lib/cn';

/**
 * An abstract field of connected walks — the "safety layer" as a picture.
 *
 * Geometry is a fixed table rather than randomised at render, so the shape is
 * identical on every load and nothing shifts between paints.
 */

const NODES = [
  { x: 120, y: 300, r: 5 },
  { x: 260, y: 170, r: 3.5 },
  { x: 300, y: 420, r: 4 },
  { x: 440, y: 260, r: 6 },
  { x: 520, y: 120, r: 3.5 },
  { x: 580, y: 400, r: 4.5 },
  { x: 720, y: 220, r: 5.5 },
  { x: 800, y: 460, r: 3.5 },
  { x: 880, y: 150, r: 4 },
  { x: 960, y: 330, r: 5 },
  { x: 1080, y: 230, r: 3.5 },
  { x: 1140, y: 430, r: 4.5 },
];

/** Street-like connections: right angles, not straight lines between points. */
const LINKS = [
  'M 120 300 H 200 V 170 H 260',
  'M 260 170 H 380 V 260 H 440',
  'M 120 300 V 420 H 300',
  'M 300 420 H 380 V 260',
  'M 440 260 V 120 H 520',
  'M 440 260 H 520 V 400 H 580',
  'M 520 120 H 650 V 220 H 720',
  'M 580 400 H 660 V 220',
  'M 720 220 H 800 V 460',
  'M 720 220 V 150 H 880',
  'M 880 150 H 960 V 330',
  'M 960 330 H 1040 V 230 H 1080',
  'M 960 330 V 430 H 1140',
  'M 800 460 H 900 V 330',
];

export function NetworkField({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1260 560"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="var(--brand-green)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.22"
      >
        {LINKS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {NODES.map((node, index) => (
        <g key={`${node.x}-${node.y}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r * 2.6}
            fill="var(--brand-green)"
            opacity="0.1"
            className="pulse-decorative"
            style={{ animationDelay: `${(index % 6) * 0.45}s`, transformOrigin: `${node.x}px ${node.y}px` }}
          />
          <circle cx={node.x} cy={node.y} r={node.r} fill="var(--brand-green)" opacity="0.65" />
        </g>
      ))}
    </svg>
  );
}
