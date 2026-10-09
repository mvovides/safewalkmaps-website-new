/**
 * Generate CSS `linear()` easing functions from spring physics.
 *
 * Apple parameterises springs with two designer-facing numbers rather than the
 * mass/stiffness/damping triplet (see WWDC 2018, "Designing Fluid Interfaces"):
 *
 *   response — the undamped period, in seconds. How quickly it reaches target.
 *   damping  — the damping ratio. 1.0 settles with no overshoot; below 1.0
 *              overshoots and oscillates.
 *
 * A cubic-bezier cannot express a spring: it has no overshoot and the wrong
 * tail shape. CSS `linear()` can, by sampling the real curve into stops. This
 * script solves the spring ODE analytically, samples it, and prints custom
 * properties for `src/styles/index.css`.
 *
 * Run:  node scripts/generate-spring-easings.mjs
 *
 * The output is pasted into the `Motion` token block. It is committed rather
 * than generated at build time — these are design tokens that should only
 * change deliberately, and a reviewer should see the diff.
 */

/** Stops in the emitted `linear()`. Enough that the piecewise-linear error
 *  stays under ~0.3% of the travel, which is below the perception threshold
 *  for the distances these springs move (§11, frame-level smoothness). */
const STOPS = 28;

/** Treat the spring as settled once it stays this close to its target. */
const SETTLE_EPSILON = 0.001;

/**
 * Normalised displacement of a unit-step spring response at time `t`.
 * Returns 0 at t=0 and approaches 1. May exceed 1 when `damping` < 1.
 */
function springValue(t, { response, damping }) {
  const omega = (2 * Math.PI) / response;

  if (damping === 1) {
    // Critically damped — the fastest approach with no overshoot.
    return 1 - (1 + omega * t) * Math.exp(-omega * t);
  }

  if (damping < 1) {
    // Underdamped — overshoots, then rings down.
    const omegaD = omega * Math.sqrt(1 - damping * damping);
    const decay = Math.exp(-damping * omega * t);
    return (
      1 - decay * (Math.cos(omegaD * t) + ((damping * omega) / omegaD) * Math.sin(omegaD * t))
    );
  }

  // Overdamped — two real roots. Included for completeness.
  const root = Math.sqrt(damping * damping - 1);
  const r1 = -omega * (damping - root);
  const r2 = -omega * (damping + root);
  return 1 - (r1 * Math.exp(r2 * t) - r2 * Math.exp(r1 * t)) / (r1 - r2);
}

/**
 * How long until the spring is visually at rest.
 *
 * Walks forward in small steps and returns the first time after which the
 * curve never again leaves the epsilon band. This is the `transition-duration`
 * the easing must be paired with — a `linear()` curve is only correct at the
 * duration it was sampled for.
 */
function settleTime(spring) {
  const step = 1 / 1000;
  let lastDisturbed = 0;
  for (let t = 0; t <= 10; t += step) {
    if (Math.abs(springValue(t, spring) - 1) > SETTLE_EPSILON) lastDisturbed = t;
  }
  return lastDisturbed + step;
}

function toLinearEasing(spring) {
  const duration = settleTime(spring);
  const samples = Array.from({ length: STOPS }, (_, index) => {
    const progress = index / (STOPS - 1);
    if (index === 0) return 0;
    if (index === STOPS - 1) return 1;
    return springValue(progress * duration, spring);
  });

  // Trim trailing zeros so the emitted CSS stays readable.
  const stops = samples.map((value) => String(Number(value.toFixed(4))));
  return { duration, css: `linear(${stops.join(', ')})` };
}

/**
 * The spring set.
 *
 * `response`/`damping` are the values Apple publishes for the equivalent
 * interaction, so the feel matches the platform rather than being invented:
 *
 *   spring       — damping 1.0, response 0.4s. Repositioning something already
 *                  on screen. The default for anything a user can touch.
 *   spring-snappy— damping 1.0, response 0.3s. Small state flips: a tab pill,
 *                  a chevron, a nav indicator.
 *   spring-sheet — damping 0.8, response 0.3s. A drawer arriving. The one place
 *                  overshoot is right, because a sheet reads as an object with
 *                  mass that was thrown into place.
 *
 * Note: a critically damped spring's *normalised* curve is invariant under
 * time scaling, so `spring` and `spring-snappy` share one easing function and
 * differ only in duration. Emitting it twice would be two names for one curve.
 */
const SPRINGS = [
  { name: 'spring', response: 0.4, damping: 1 },
  { name: 'spring-snappy', response: 0.3, damping: 1 },
  { name: 'spring-sheet', response: 0.3, damping: 0.8 },
];

const lines = [];
const emitted = new Map();

for (const { name, ...spring } of SPRINGS) {
  const { duration, css } = toLinearEasing(spring);
  const ms = Math.round(duration * 1000);
  const existing = emitted.get(css);

  lines.push(`    /* damping ${spring.damping}, response ${spring.response}s — settles in ${ms}ms */`);
  if (existing) {
    lines.push(`    /* curve is identical to --ease-${existing}; only the duration differs */`);
  } else {
    lines.push(`    --ease-${name}: ${css};`);
    emitted.set(css, name);
  }
  lines.push(`    --duration-${name}: ${ms}ms;`);
}

console.log(lines.join('\n'));
