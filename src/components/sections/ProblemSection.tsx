import { useRef } from 'react';

import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { Section, SectionHeading } from '@/components/layout/Section';
import { getRoute, ILLUSTRATIVE_NOTE, saferRouteDelta } from '@/data/city';
import { useGsapContext } from '@/hooks/useGsapContext';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap, scrubFor } from '@/lib/motion';

const fastest = getRoute('fastest');
const safer = getRoute('safer');

type StatProps = {
  label: string;
  valueKey: 'minutes' | 'distance' | 'score';
  from: number;
  to: number;
  suffix?: string;
  decimals?: number;
  emphasis?: boolean;
};

/**
 * A figure that transforms between the two routes as the section scrolls.
 * The DOM carries the "safer" value from the start, so it is correct for
 * crawlers and for reduced motion.
 */
function Stat({ label, valueKey, from, to, suffix, decimals = 0, emphasis }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
        {label}
      </span>
      <span
        className={cn(
          'tabular text-display-sm font-semibold',
          emphasis ? 'text-green-800' : 'text-ink-primary',
        )}
      >
        <span data-stat={valueKey} data-from={from} data-to={to} data-decimals={decimals}>
          {to.toFixed(decimals)}
        </span>
        {suffix && <span className="ml-1 text-body-sm font-medium text-ink-tertiary">{suffix}</span>}
      </span>
    </div>
  );
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    sectionRef,
    (scope) => {
      if (reduced) return;

      gsap.set('[data-cmp="safe"], [data-cmp="safe-casing"]', {
        strokeDasharray: 1,
        strokeDashoffset: 1,
      });
      gsap.set('[data-cmp="delta"]', { opacity: 0, y: 10 });

      const stats = Array.from(scope.querySelectorAll<HTMLElement>('[data-stat]'));
      // Start every figure on the fastest route's value.
      stats.forEach((node) => {
        const decimals = Number(node.dataset.decimals ?? 0);
        node.textContent = Number(node.dataset.from ?? 0).toFixed(decimals);
      });

      const counter = { progress: 0 };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: scope,
            start: 'top 72%',
            end: 'bottom 72%',
            scrub: scrubFor(0.7),
          },
          defaults: { ease: 'none' },
        })
        // Lighting appears, explaining why the safer route scores better.
        .to('[data-cmp="lamps"]', { opacity: 1, duration: 0.3 }, 0.08)
        // The safer route draws over the fastest one.
        .to('[data-cmp="safe-group"]', { opacity: 1, duration: 0.05 }, 0.1)
        .to(
          '[data-cmp="safe"], [data-cmp="safe-casing"]',
          { strokeDashoffset: 0, duration: 0.45 },
          0.1,
        )
        // The fastest route fades back but never disappears — the comparison
        // only means something while you can still see both.
        .to('[data-cmp="fast-group"]', { opacity: 0.4, duration: 0.3 }, 0.18)
        // Figures travel between the two routes.
        .to(
          counter,
          {
            progress: 1,
            duration: 0.45,
            onUpdate: () => {
              for (const node of stats) {
                const from = Number(node.dataset.from ?? 0);
                const to = Number(node.dataset.to ?? 0);
                const decimals = Number(node.dataset.decimals ?? 0);
                node.textContent = (from + (to - from) * counter.progress).toFixed(decimals);
              }
            },
          },
          0.12,
        )
        .to('[data-cmp="delta"]', { opacity: 1, y: 0, duration: 0.18 }, 0.52);
    },
    [reduced],
  );

  return (
    <Section id="problem" tone="secondary" spacing="large">
      <div ref={sectionRef}>
        <SectionHeading
          index="01"
          eyebrow="The problem"
          title={
            <>
              Maps know where you are going.
              <span className="block text-ink-tertiary">
                They do not always know how the walk feels.
              </span>
            </>
          }
          lede="Navigation optimises for distance and time, so a shortcut through an unlit, empty back street is simply the best answer to the question it was asked. SafeWalkMaps asks a different question."
          className="max-w-4xl"
        />

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          {/* The map */}
          <div
            className="relative overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-5"
            data-reveal="scale"
          >
            <div className="aspect-[800/440] w-full">
              <ComparisonMap />
            </div>
          </div>

          {/* The numbers */}
          <div data-reveal-stagger>
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-green-500/15"
                />
                <span className="text-body-sm font-semibold text-ink-primary">
                  The same walk, two ways
                </span>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-4">
                <Stat
                  label="Time"
                  valueKey="minutes"
                  from={fastest.minutes}
                  to={safer.minutes}
                  suffix="min"
                />
                <Stat
                  label="Distance"
                  valueKey="distance"
                  from={fastest.distanceKm}
                  to={safer.distanceKm}
                  suffix="km"
                  decimals={1}
                />
                <Stat
                  label="Safety"
                  valueKey="score"
                  from={fastest.safetyScore}
                  to={safer.safetyScore}
                  emphasis
                />
              </div>

              <div
                data-cmp="delta"
                className="mt-7 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3.5"
              >
                <span className="tabular shrink-0 text-body-lg font-semibold text-green-900">
                  +{saferRouteDelta} min
                </span>
                <span className="text-body-sm text-green-900/80">
                  buys a route that stays on lit, busier streets the whole way.
                </span>
              </div>

              <p className="demo-note mt-5">{ILLUSTRATIVE_NOTE}</p>
            </div>

            <p className="mt-7 max-w-prose text-body-lg text-ink-secondary">
              Neither route is wrong. The point is that you were only ever shown one of them — and
              never told what the difference was.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
