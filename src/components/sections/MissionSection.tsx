import { NetworkField } from '@/components/illustrations/NetworkField';
import { Eyebrow } from '@/components/layout/Section';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/config';

export type MissionSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};

export function MissionSection({ headingAs: Heading = 'h2', className }: MissionSectionProps = {}) {
  return (
    <section
      id="mission"
      data-nav-theme="dark"
      className={cn(
        'on-navy relative overflow-hidden bg-surface-navy py-section-lg text-white',
        className,
      )}
    >
      {/* The network, behind the statement. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(70%_60%_at_50%_45%,#000_30%,transparent_100%)]"
      >
        <NetworkField />
      </div>

      <div className="shell relative">
        <div className="max-w-4xl" data-reveal-stagger>
          <Eyebrow tone="inverse" className="mb-7">
            The mission
          </Eyebrow>

          <Heading className="text-display-lg font-semibold text-white">
            Walking should not mean choosing between
            <span className="text-green-500"> convenience</span> and
            <span className="text-green-500"> confidence</span>.
          </Heading>

          <div className="mt-9 grid gap-7 text-body-lg text-white/80 sm:grid-cols-2 sm:gap-10">
            <p>
              Most people already do this calculation in their heads. They take the long way, or
              cross the road, or stay on the main street, based on whatever they happen to know
              about the area. SafeWalkMaps just does the calculation properly, and explains it.
            </p>
            <p>
              The longer goal is a safety layer for urban navigation that works anywhere —
              city by city, as the open data each one publishes allows. It is an infrastructure
              problem as much as an app problem, and we are starting where we can be useful.
            </p>
          </div>

          <dl className="mt-14 grid gap-8 border-t border-line-inverse pt-9 sm:grid-cols-3">
            <div>
              <dt className="text-label font-semibold uppercase tracking-[0.12em] text-white/70">
                In beta
              </dt>
              <dd className="mt-2.5 text-display-sm font-semibold text-white">
                {siteConfig.betaCities.join(' & ')}
              </dd>
            </div>
            <div>
              <dt className="text-label font-semibold uppercase tracking-[0.12em] text-white/70">
                Next
              </dt>
              <dd className="mt-2.5 text-display-sm font-semibold text-white">iPhone</dd>
            </div>
            <div>
              <dt className="text-label font-semibold uppercase tracking-[0.12em] text-white/70">
                Then
              </dt>
              <dd className="mt-2.5 text-display-sm font-semibold text-white">
                Wherever the data reaches
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
