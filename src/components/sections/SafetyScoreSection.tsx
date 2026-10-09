import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Chip } from '@/components/ui/Chip';
import { getRoute, ILLUSTRATIVE_NOTE } from '@/data/city';

const route = getRoute('safer');

/** The three numbers the routing model keeps, and the app shows. */
const transparency = [
  {
    label: 'Lowest single stretch',
    value: route.lowestSegment,
    suffix: '',
    body: 'The worst-scoring segment on the route. A good average should never be allowed to hide one bad street, so the model penalises this directly — and the app shows it.',
  },
  {
    label: 'Below par',
    value: route.exposurePercent,
    suffix: '%',
    body: 'How much of the walk sits under the low-score threshold. Two routes can average the same and feel completely different; this is the number that tells them apart.',
  },
  {
    label: 'Data confidence',
    value: route.confidencePercent,
    suffix: '%',
    body: 'How reliable, how complete and how recent the underlying data is. When confidence drops, the route is scored more cautiously rather than a shaky number being presented as a firm one.',
  },
];

export function SafetyScoreSection() {
  return (
    <Section id="safety-score" tone="navy" spacing="large">
      <SectionHeading
        index="03"
        eyebrow="The safety score"
        tone="inverse"
        title={
          <>
            Understand the route,
            <span className="block text-white/45">not just the number.</span>
          </>
        }
        lede="A score on its own is a verdict you are asked to trust. A score with its reasons attached is information you can actually use — including the parts that count against it."
        className="max-w-4xl"
      />

      <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        {/* The ring */}
        <div className="relative mx-auto w-full max-w-[22rem]" data-reveal="scale">
          <div
            aria-hidden="true"
            className="absolute inset-6 -z-10 rounded-full bg-green-500/10 blur-3xl"
          />
          <SafetyScoreRing
            score={route.safetyScore}
            lowestSegment={route.lowestSegment}
            tone="dark"
            strokeWidth={10}
            className="w-full"
          >
            <span className="flex items-baseline">
              <AnimatedCounter
                value={route.safetyScore}
                className="text-[clamp(3.5rem,11vw,5.5rem)] font-semibold leading-none tracking-[-0.045em] text-white"
              />
              <span className="ml-1 text-body-lg font-medium text-white/40">/100</span>
            </span>
            <span className="mt-2 text-label font-semibold uppercase tracking-[0.14em] text-green-500">
              Safety score
            </span>
          </SafetyScoreRing>

          <p className="mt-6 text-center text-caption leading-relaxed text-white/45">
            The notch on the ring marks the lowest-scoring stretch of this route.
          </p>
        </div>

        {/* Reasons and transparency */}
        <div data-reveal-stagger>
          <h3 className="text-body-sm font-semibold uppercase tracking-[0.12em] text-white/40">
            Why this route scored {route.safetyScore}
          </h3>

          <ul className="mt-5 flex flex-wrap gap-2.5">
            {route.factors.map((factor) => (
              <li key={factor.label}>
                <Chip tone={factor.tone} inverse>
                  {factor.label}
                </Chip>
              </li>
            ))}
          </ul>

          <dl className="mt-10 divide-y divide-line-inverse border-t border-line-inverse">
            {transparency.map((item) => (
              <div key={item.label} className="flex gap-6 py-6">
                <dt className="flex-1 text-body-lg font-semibold text-white">
                  {item.label}
                  <p className="mt-2 max-w-prose text-body-sm font-normal leading-relaxed text-white/55">
                    {item.body}
                  </p>
                </dt>
                <dd className="shrink-0 text-right">
                  <AnimatedCounter
                    value={item.value}
                    suffix={item.suffix}
                    className="text-display-sm font-semibold text-green-500"
                  />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-xl border border-line-inverse bg-white/[0.04] px-5 py-4">
            <p className="text-body-sm leading-relaxed text-white/65">
              A Safety Score compares the routes available to you at a point in time, from the data
              we hold for that area. It is not a guarantee, and a lower-scoring street is not
              inherently dangerous — sometimes it is just a street nobody publishes much about.
            </p>
          </div>

          <p className="mt-4 text-caption text-white/35">{ILLUSTRATIVE_NOTE}</p>
        </div>
      </div>
    </Section>
  );
}
