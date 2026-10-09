import { useRef, useState } from 'react';

import { NetworkMap } from '@/components/illustrations/NetworkMap';
import { Eyebrow } from '@/components/layout/Section';
import { signalLayers } from '@/data/signals';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { gsap, scrubFor } from '@/lib/motion';

/** Five data layers, then a sixth beat where they resolve into one route. */
const STEP_COUNT = signalLayers.length + 1;
const FINAL_STEP = STEP_COUNT - 1;

const FINAL_COPY = {
  title: 'Many signals. One clearer route.',
  body: 'No single layer decides anything. Scores are weighted together, penalised for the worst stretch on the route and for how much of the walk sits below par, then checked against how confident we are in the underlying data.',
  caveat: 'Where the data is thin, the score is deliberately more cautious.',
};

/** A weight bar, so the relative influence of each signal is visible. */
function WeightBar({ weight, active }: { weight: number; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 w-24 overflow-hidden rounded-full bg-navy-100">
        <div
          className="h-full rounded-full bg-green-500 transition-[width] duration-slower ease-out-expo"
          style={{ width: active ? `${weight * 100}%` : '0%' }}
        />
      </div>
      <span className="tabular text-caption text-ink-tertiary">
        {Math.round(weight * 100)}% of the model
      </span>
    </div>
  );
}

export function SafetyLayerSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);

  useGsapContext(
    wrapRef,
    (scope) => {
      if (reduced) return;

      const groups = (name: string) => `[data-layer-group="${name}"]`;

      gsap.set('[data-route-line], [data-route-casing]', {
        strokeDasharray: 1,
        strokeDashoffset: 1,
      });

      /**
       * The five layer beats share the first 70% of the section; the sixth —
       * where the route resolves — gets the remaining 30%, and finishes by 90%
       * so the finished map holds on screen before the pin releases. Timeline
       * positions are normalised to a total duration of 1, which keeps them
       * readable as fractions of the scroll.
       */
      const LAYER_SLOT = 0.14;
      const FINAL_AT = signalLayers.length * LAYER_SLOT; // 0.70

      const stepAt = (progress: number) =>
        Math.min(FINAL_STEP, Math.floor(progress / LAYER_SLOT));

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          scrub: scrubFor(0.7),
          // Phase text is driven by a step index, not by a value that changes
          // every frame, so React re-renders six times across the whole section.
          onUpdate: (self) => setStep(stepAt(self.progress)),
        },
        defaults: { ease: 'none', duration: 0.05 },
      });

      // Each layer comes up at full strength, then settles back so the next one
      // reads clearly. The map never becomes mud.
      const order = signalLayers.map((layer) => layer.id);

      order.forEach((id, index) => {
        const at = index * LAYER_SLOT;
        timeline.to(groups(id), { opacity: 1 }, at + 0.015);
        if (index < order.length - 1) {
          timeline.to(groups(id), { opacity: 0.22, duration: 0.035 }, at + 0.105);
        }
      });

      // Final beat — everything returns, and the route resolves out of it.
      order.forEach((id) => {
        timeline.to(groups(id), { opacity: 0.38, duration: 0.05 }, FINAL_AT);
      });
      timeline
        .to(groups('endpoints'), { opacity: 1, duration: 0.04 }, FINAL_AT)
        .to(groups('fast-route'), { opacity: 0.55, duration: 0.05 }, FINAL_AT + 0.03)
        .to(groups('route'), { opacity: 1, duration: 0.03 }, FINAL_AT + 0.06)
        .to(
          '[data-route-line], [data-route-casing]',
          { strokeDashoffset: 0, duration: 0.14 },
          FINAL_AT + 0.06,
        )
        // Hold the finished map for the last 10% of the section.
        .to({}, { duration: 0.001 }, 1);
    },
    [reduced],
  );

  const layer = step === FINAL_STEP ? null : (signalLayers[step] ?? null);
  const active = layer ?? FINAL_COPY;

  // Reduced motion: present the same material as a readable list beside a map
  // showing every layer at once. Nothing is stranded behind an animation.
  if (reduced) {
    return (
      <section id="how-it-works" className="bg-surface py-section-lg">
        <div className="shell">
          <Eyebrow index="02" className="mb-5">
            The safety layer
          </Eyebrow>
          <h2 className="max-w-[20ch] text-display-lg font-semibold">
            Many signals. One clearer route.
          </h2>
          <p className="mt-6 max-w-prose text-body-lg text-ink-secondary">{FINAL_COPY.body}</p>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
            <ol className="space-y-8">
              {signalLayers.map((item) => (
                <li key={item.id}>
                  <p className="flex items-baseline gap-3">
                    <span className="tabular text-body-sm font-semibold text-green-800">
                      {item.index}
                    </span>
                    <span className="text-display-sm font-semibold">{item.title}</span>
                  </p>
                  <p className="mt-2.5 max-w-prose text-ink-secondary">{item.body}</p>
                  <p className="mt-2 text-caption text-ink-tertiary">{item.caveat}</p>
                  <div className="mt-3">
                    <WeightBar weight={item.weight} active />
                  </div>
                </li>
              ))}
            </ol>
            <div className="rounded-2xl border border-line bg-surface-secondary p-5">
              <div className="aspect-[1000/620] w-full [&_[data-layer-group]]:opacity-100">
                <NetworkMap />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" className="bg-surface">
      <div
        ref={wrapRef}
        className="relative"
        style={{ height: `calc(var(--signal-step) * ${STEP_COUNT})` }}
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="shell flex h-full flex-col justify-center gap-7 lg:flex-row lg:items-center lg:gap-12">
            {/* Map — above the copy on mobile, beside it on desktop.
                Full-bleed on small screens: the network is wide, and the extra
                26% of width is the difference between legible and decorative. */}
            <div className="order-1 flex flex-none items-center justify-center pt-[calc(var(--nav-height)+0.5rem)] lg:order-2 lg:w-[56%] lg:pt-0">
              <div className="-mx-gutter w-screen border-y border-line bg-white/70 px-3 py-3 sm:mx-0 sm:w-full sm:max-w-[46rem] sm:rounded-2xl sm:border sm:p-5 sm:shadow-sm">
                <div className="aspect-[1000/620] w-full">
                  <NetworkMap />
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="order-2 flex flex-none flex-col justify-center pb-8 lg:order-1 lg:w-[46%] lg:pb-0">
              <Eyebrow index="02" className="mb-5 hidden lg:flex">
                The safety layer
              </Eyebrow>

              {/* Phase copy. `key` restarts the entrance on each step. */}
              <div key={step} className="animate-fade-rise">
                <p className="text-display-md font-semibold tracking-[-0.03em]">{active.title}</p>
                <p className="mt-5 max-w-prose text-body-lg text-ink-secondary">{active.body}</p>
                <p className="mt-4 flex items-start gap-2 text-caption text-ink-tertiary">
                  <span
                    aria-hidden="true"
                    className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-ink-tertiary"
                  />
                  {active.caveat}
                </p>
                {layer && (
                  <div className="mt-6">
                    <WeightBar weight={layer.weight} active />
                  </div>
                )}
              </div>

              {/* Progress through the signals, as a carousel indicator. */}
              <div className="mt-8 flex items-center gap-4">
                <ol className="flex items-center gap-1.5" aria-label="Safety signals">
                  {Array.from({ length: STEP_COUNT }, (_, index) => (
                    <li
                      key={index}
                      aria-current={index === step ? 'step' : undefined}
                      className={cn(
                        'h-1 rounded-full transition-all duration-slow ease-out-expo',
                        index === step ? 'w-7 bg-green-500' : 'w-3 bg-navy-200',
                      )}
                    />
                  ))}
                </ol>
                <p className="text-caption text-ink-tertiary">
                  {layer ? `Signal ${step + 1} of ${signalLayers.length}` : 'All of them together'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
