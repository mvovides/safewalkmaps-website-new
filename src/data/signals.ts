/**
 * The safety layer: the data SafeWalkMaps reads before it suggests a route.
 *
 * Weights are the defaults from the SafeWalkMaps routing specification
 * (v1): crime 0.30, lighting 0.22, CCTV 0.12, crowd density 0.12 and
 * community reports 0.10, with roadworks and street context making up the
 * remainder. CCTV, closures and street context are presented together as one
 * "context" layer here because that is how they surface in the app.
 *
 * Canvas for all geometry below: 1000 × 620 (landscape).
 */

export const NETWORK_WIDTH = 1000;
export const NETWORK_HEIGHT = 620;

export type NetworkStreet = { d: string; major?: boolean };

export const networkStreets: NetworkStreet[] = [
  // Main roads.
  { d: 'M 500 30 V 592', major: true },
  { d: 'M 40 300 H 968', major: true },
  { d: 'M 200 30 V 592', major: true },
  { d: 'M 40 180 H 968', major: true },

  // Secondary grid.
  { d: 'M 80 60 V 592' },
  { d: 'M 340 30 V 592' },
  { d: 'M 660 30 V 592' },
  { d: 'M 800 30 V 592' },
  { d: 'M 930 60 V 560' },
  { d: 'M 40 90 H 968' },
  { d: 'M 40 420 H 968' },
  { d: 'M 40 530 H 968' },

  // Irregular connectors.
  { d: 'M 340 420 L 410 350 L 500 350' },
  { d: 'M 660 180 L 730 110 L 800 110' },
  { d: 'M 80 420 L 140 480 L 140 530' },
  { d: 'M 930 300 L 968 260' },
  { d: 'M 260 90 V 180' },
  { d: 'M 580 420 V 530' },
  { d: 'M 870 420 V 530' },
  { d: 'M 410 530 L 460 592' },
];

export const networkOrigin = { x: 120, y: 530 } as const;
export const networkDestination = { x: 880, y: 90 } as const;

/** The route SafeWalkMaps lands on once every layer is in play. */
export const networkRoute = 'M 120 530 H 200 V 420 H 500 V 180 H 800 V 90 H 880';

/** A plausible fastest alternative, for contrast. */
export const networkFastRoute = 'M 120 530 V 420 H 340 V 90 H 660 V 90 H 880';

/* ------------------------------------------------------------------ *
 * Layer 01 — Street lighting
 * Pools of light along the streets councils record as lit.
 * ------------------------------------------------------------------ */
export type LightPool = { x: number; y: number; r: number };

export const lightPools: LightPool[] = [
  { x: 120, y: 530, r: 34 },
  { x: 200, y: 530, r: 30 },
  { x: 200, y: 470, r: 28 },
  { x: 200, y: 420, r: 32 },
  { x: 280, y: 420, r: 28 },
  { x: 360, y: 420, r: 30 },
  { x: 440, y: 420, r: 28 },
  { x: 500, y: 420, r: 34 },
  { x: 500, y: 350, r: 30 },
  { x: 500, y: 300, r: 36 },
  { x: 500, y: 240, r: 30 },
  { x: 500, y: 180, r: 34 },
  { x: 580, y: 180, r: 28 },
  { x: 660, y: 180, r: 32 },
  { x: 730, y: 180, r: 28 },
  { x: 800, y: 180, r: 32 },
  { x: 800, y: 130, r: 28 },
  { x: 800, y: 90, r: 30 },
  { x: 880, y: 90, r: 34 },
  // Lit main roads away from the route.
  { x: 340, y: 300, r: 26 },
  { x: 660, y: 300, r: 26 },
  { x: 930, y: 300, r: 24 },
  { x: 200, y: 180, r: 26 },
];

/** Streets with no lighting record, or records flagged as faulty. */
export const unlitStreets: string[] = [
  'M 340 420 V 530',
  'M 80 180 V 300',
  'M 580 420 V 530',
  'M 410 530 L 460 592',
];

/* ------------------------------------------------------------------ *
 * Layer 02 — Recent incidents
 * Aggregated areas, never individual reports. Intensity 0–1.
 * ------------------------------------------------------------------ */
export type RiskZone = { x: number; y: number; rx: number; ry: number; intensity: number };

export const riskZones: RiskZone[] = [
  { x: 350, y: 505, rx: 104, ry: 76, intensity: 0.86 },
  { x: 118, y: 236, rx: 86, ry: 70, intensity: 0.6 },
  { x: 600, y: 480, rx: 92, ry: 64, intensity: 0.46 },
  { x: 886, y: 420, rx: 74, ry: 56, intensity: 0.3 },
  { x: 420, y: 120, rx: 80, ry: 52, intensity: 0.24 },
];

/* ------------------------------------------------------------------ *
 * Layer 03 — Foot traffic
 * How busy a street tends to be at the time you are walking.
 * ------------------------------------------------------------------ */
export type CrowdPoint = { x: number; y: number; density: number };

export const crowdPoints: CrowdPoint[] = [
  // Busy main roads.
  { x: 500, y: 150, density: 0.9 },
  { x: 500, y: 215, density: 0.85 },
  { x: 500, y: 275, density: 0.95 },
  { x: 500, y: 330, density: 0.8 },
  { x: 500, y: 390, density: 0.75 },
  { x: 440, y: 300, density: 0.9 },
  { x: 380, y: 300, density: 0.8 },
  { x: 620, y: 300, density: 0.85 },
  { x: 700, y: 300, density: 0.7 },
  { x: 560, y: 180, density: 0.8 },
  { x: 640, y: 180, density: 0.75 },
  { x: 720, y: 180, density: 0.65 },
  { x: 790, y: 180, density: 0.7 },
  { x: 240, y: 420, density: 0.6 },
  { x: 310, y: 420, density: 0.55 },
  { x: 400, y: 420, density: 0.6 },
  { x: 465, y: 420, density: 0.65 },
  { x: 200, y: 470, density: 0.5 },
  { x: 200, y: 350, density: 0.6 },
  { x: 200, y: 240, density: 0.55 },
  { x: 800, y: 130, density: 0.55 },
  { x: 845, y: 90, density: 0.5 },
  // Quiet stretches — empty streets score poorly too.
  { x: 340, y: 470, density: 0.12 },
  { x: 340, y: 520, density: 0.08 },
  { x: 80, y: 240, density: 0.14 },
  { x: 580, y: 480, density: 0.16 },
  { x: 930, y: 440, density: 0.18 },
  { x: 140, y: 500, density: 0.2 },
];

/* ------------------------------------------------------------------ *
 * Layer 04 — Community reports
 * Anonymous, time-stamped, and they expire.
 * ------------------------------------------------------------------ */
export type CommunityReport = {
  x: number;
  y: number;
  label: string;
  age: string;
};

export const communityReports: CommunityReport[] = [
  { x: 340, y: 468, label: 'Street light out', age: '2 days ago' },
  { x: 580, y: 478, label: 'Underpass feels exposed', age: '5 days ago' },
  { x: 262, y: 140, label: 'Pavement blocked', age: '11 hours ago' },
  { x: 872, y: 452, label: 'Poorly lit alley', age: '3 days ago' },
];

/* ------------------------------------------------------------------ *
 * Layer 05 — Context & coverage
 * Crossings, closures, and the CCTV coverage councils publish.
 * ------------------------------------------------------------------ */
export type ContextMarker = {
  x: number;
  y: number;
  kind: 'crossing' | 'closure' | 'camera';
};

export const contextMarkers: ContextMarker[] = [
  { x: 500, y: 300, kind: 'crossing' },
  { x: 500, y: 180, kind: 'crossing' },
  { x: 200, y: 420, kind: 'crossing' },
  { x: 800, y: 180, kind: 'crossing' },
  { x: 410, y: 555, kind: 'closure' },
  { x: 262, y: 140, kind: 'closure' },
  { x: 500, y: 240, kind: 'camera' },
  { x: 660, y: 180, kind: 'camera' },
  { x: 200, y: 470, kind: 'camera' },
  { x: 500, y: 390, kind: 'camera' },
];

/* ------------------------------------------------------------------ *
 * The scroll-driven phases of the safety layer section.
 * ------------------------------------------------------------------ */
export type SignalLayerId = 'lighting' | 'incidents' | 'footfall' | 'reports' | 'context';

export type SignalLayer = {
  id: SignalLayerId;
  index: string;
  title: string;
  /** Weight this signal carries in the routing model, 0–1. */
  weight: number;
  body: string;
  /** The honest limit of this particular signal. */
  caveat: string;
};

export const signalLayers: SignalLayer[] = [
  {
    id: 'lighting',
    index: '01',
    title: 'Street lighting',
    weight: 0.22,
    body: 'Council streetlight records map which streets are actually lit after dark — and which unlit shortcut would save you four minutes. Lighting is weighted by the sun, so it barely matters at 2pm and matters enormously at 11pm.',
    caveat: 'A lamp recorded as working is not always working.',
  },
  {
    id: 'incidents',
    index: '02',
    title: 'Recent incidents',
    weight: 0.3,
    body: 'Published police data, aggregated over a rolling window and matched to the same weekday and hour you are walking. It is read as areas, never as individual reports, and it is the single heaviest signal in the model.',
    caveat: 'Recorded crime reflects what gets reported, not everything that happens.',
  },
  {
    id: 'footfall',
    index: '03',
    title: 'Foot traffic',
    weight: 0.12,
    body: 'How busy a street tends to be at your departure time, compared with what is normal for that street. Scored as a curve rather than a line: an empty street at 11pm is not a good shortcut, and neither is a crush outside a stadium.',
    caveat: 'Patterns are historical, so one-off events can throw them off.',
  },
  {
    id: 'reports',
    index: '04',
    title: 'Community reports',
    weight: 0.1,
    body: 'A broken light, a blocked pavement, an underpass that feels wrong. Reports are anonymous, weighted by how much the model trusts their source, and they fade out over about a month so the map stays current.',
    caveat: 'Reports are subjective, so no single one moves a score much.',
  },
  {
    id: 'context',
    index: '05',
    title: 'Context & coverage',
    weight: 0.26,
    body: 'Crossings, pavement width, roadworks, closures, line of sight, and the CCTV coverage councils publish. The small print of a street — the part that decides whether a route is pleasant to walk or technically possible.',
    caveat: 'Coverage varies hugely between councils.',
  },
];

/** Shown alongside the combined view, derived from the layers above. */
export const totalSignalWeight = signalLayers.reduce((sum, layer) => sum + layer.weight, 0);
