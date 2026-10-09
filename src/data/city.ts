/**
 * The illustrative city used inside every SafeWalkMaps phone mockup.
 *
 * Geometry is fictional and authored by hand — no map provider's tiles or
 * screenshots appear anywhere on this site.
 *
 * Canvas: 360 × 400. Streets run past the canvas edges so the map bleeds to the
 * edge of the phone screen instead of floating in a box.
 *
 * All three routes share an origin and destination. On a pure street grid every
 * direct staircase between two points measures exactly the same, so the three
 * routes differ for the reason they differ in real life: the fastest one takes
 * a diagonal footpath across the park, and the safer one stays on main roads.
 *
 *   Fastest   496.0 units → 1.75 km → 20.96 min  → 21 min, 1.7 km
 *   Balanced  544.6 units → 1.92 km → 23.01 min  → 23 min, 1.9 km
 *   Safer     568.0 units → 2.00 km → 24.00 min  → 24 min, 2.0 km
 *
 * at a constant 5.0 km/h (1 unit ≈ 3.52 m), rounded to the nearest minute.
 * (Verified by measuring the path data.) The displayed numbers are therefore
 * internally consistent rather than decorative — but they are still
 * illustrative, and the interface says so wherever they appear.
 */

export const CITY_WIDTH = 360;
export const CITY_HEIGHT = 400;

export type StreetSegment = {
  d: string;
  /** Main roads are drawn heavier; they are also the streets that tend to be lit. */
  major?: boolean;
  /** Unlit footpaths and alleys, drawn as a dashed line. */
  path?: boolean;
};

export const streets: StreetSegment[] = [
  // Main roads — the lit, busier network.
  { d: 'M 234 -60 V 470', major: true },
  { d: 'M -60 336 H 420', major: true },
  { d: 'M -60 112 H 420', major: true },
  { d: 'M 342 -60 V 470', major: true },

  // Secondary grid.
  { d: 'M 18 -60 V 470' },
  { d: 'M 54 -60 V 470' },
  { d: 'M 162 -60 V 470' },
  { d: 'M 306 -60 V 470' },
  { d: 'M -60 24 H 420' },
  { d: 'M -60 56 H 420' },
  { d: 'M -60 256 H 420' },
  { d: 'M -60 376 H 420' },

  // Streets that stop at the park rather than running through it.
  { d: 'M 102 -60 V 112' },
  { d: 'M 102 256 V 470' },
  { d: 'M -60 184 H 54' },
  { d: 'M 162 184 H 420' },

  // Irregular connectors, so the grid does not read as graph paper.
  { d: 'M 234 336 L 272 298 L 306 298' },
  { d: 'M 18 56 L 54 24' },
  { d: 'M 162 376 L 198 344' },
  { d: 'M 306 184 L 342 152' },
  { d: 'M 198 24 V 56' },
  { d: 'M 270 336 V 376' },
  { d: 'M 78 256 V 336' },

  // The park footpath — the diagonal the fastest route uses.
  { d: 'M 54 256 L 162 112', path: true },
];

/** The park the fastest route cuts across. */
export const parkBlock = 'M 54 112 H 162 V 256 H 54 Z';

export const origin = { x: 54, y: 336, label: 'Library' } as const;
export const destination = { x: 342, y: 56, label: 'Home' } as const;

export type RouteKey = 'fastest' | 'balanced' | 'safer';

export type RouteFactor = {
  label: string;
  /** `plus` raises the score, `minus` lowers it, `flag` is a data caveat. */
  tone: 'plus' | 'minus' | 'flag';
};

export type RouteOption = {
  key: RouteKey;
  name: string;
  /** One-line characterisation of the route. */
  summary: string;
  minutes: number;
  distanceKm: number;
  safetyScore: number;
  /** Lowest-scoring single segment on the route — surfaced, never hidden. */
  lowestSegment: number;
  /** Share of the walk below the low-score threshold, as a percentage. */
  exposurePercent: number;
  /** Confidence in the data behind this score, as a percentage. */
  confidencePercent: number;
  /** SVG path on the 360 × 400 city canvas. */
  d: string;
  factors: RouteFactor[];
};

export const routes: RouteOption[] = [
  {
    key: 'fastest',
    name: 'Fastest',
    summary: 'Cuts straight across the park.',
    minutes: 21,
    distanceKm: 1.7,
    safetyScore: 61,
    lowestSegment: 34,
    exposurePercent: 38,
    confidencePercent: 82,
    d: 'M 54 336 V 256 L 162 112 V 56 H 342',
    factors: [
      { label: 'Unlit for roughly a third of the walk', tone: 'minus' },
      { label: 'Very little footfall after 9pm', tone: 'minus' },
      { label: 'Shortest distance of the three', tone: 'plus' },
    ],
  },
  {
    key: 'balanced',
    name: 'Balanced',
    summary: 'Skirts the park and keeps to lit streets.',
    minutes: 23,
    distanceKm: 1.9,
    safetyScore: 78,
    lowestSegment: 58,
    exposurePercent: 11,
    confidencePercent: 86,
    d: 'M 54 336 H 102 V 224 L 142 184 H 162 V 112 H 342 V 56',
    factors: [
      { label: 'Lit for most of the journey', tone: 'plus' },
      { label: 'Joins the main road early', tone: 'plus' },
      { label: 'One quieter stretch along the park wall', tone: 'minus' },
    ],
  },
  {
    key: 'safer',
    name: 'Safer',
    summary: 'Main roads the whole way.',
    minutes: 24,
    distanceKm: 2.0,
    safetyScore: 86,
    lowestSegment: 71,
    exposurePercent: 0,
    confidencePercent: 91,
    d: 'M 54 336 H 162 V 256 H 234 V 112 H 342 V 56',
    factors: [
      { label: 'Well lit for the full route', tone: 'plus' },
      { label: 'Busier streets at this time of evening', tone: 'plus' },
      { label: 'Lower recent incident density', tone: 'plus' },
      { label: 'One stretch with older lighting data', tone: 'flag' },
    ],
  },
];

const byKey = routes.reduce<Partial<Record<RouteKey, RouteOption>>>((accumulator, route) => {
  accumulator[route.key] = route;
  return accumulator;
}, {});

export function getRoute(key: RouteKey): RouteOption {
  const route = byKey[key];
  if (!route) throw new Error(`Unknown route: ${key}`);
  return route;
}

export const defaultRouteKey: RouteKey = 'safer';

/** Minutes the safer route adds over the fastest one. */
export const saferRouteDelta = getRoute('safer').minutes - getRoute('fastest').minutes;

/** Standard wording for anywhere demo figures appear. */
export const ILLUSTRATIVE_NOTE = 'Illustrative route data. Real routes depend on your location.';
