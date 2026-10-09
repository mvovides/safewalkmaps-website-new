import { Section, SectionHeading } from '@/components/layout/Section';
import { scenarios } from '@/data/features';

/**
 * Real situations rather than demographic fear marketing.
 *
 * A horizontal rail on mobile (which is how most of these visits arrive) and a
 * staggered grid on desktop. Each card carries a time, because the time of day
 * is the thing that actually changes the answer.
 */
export function ScenariosSection() {
  return (
    <Section id="scenarios">
      <SectionHeading
        index="07"
        eyebrow="Built for real walks"
        title={
          <>
            Ordinary walks,
            <span className="block text-ink-tertiary">on ordinary evenings.</span>
          </>
        }
        lede="Cities are not dangerous places you need protecting from. They are places you move through constantly, usually without thinking about it. SafeWalkMaps is for the handful of moments when you do."
        className="max-w-4xl"
      />

      {/* Mobile: a scroll rail. Desktop: a staggered grid. */}
      <ul
        className="fade-edges-x -mx-gutter mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-2 lg:mx-0 lg:mt-16 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
        data-reveal-stagger
      >
        {scenarios.map((scenario, index) => (
          <li
            key={scenario.id}
            className={[
              'w-[17.5rem] shrink-0 snap-start lg:w-auto',
              // Offset the middle column so the grid does not read as a table.
              index === 1 ? 'lg:mt-10' : '',
              index === 4 ? 'lg:col-start-2 lg:mt-10' : '',
            ].join(' ')}
          >
            <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-xs transition-[transform,box-shadow] duration-spring ease-spring hover:-translate-y-0.5 hover:shadow-md sm:p-7">
              <p className="tabular inline-flex w-fit items-center gap-2 rounded-pill bg-navy-50 px-3 py-1 text-caption font-semibold text-navy-700">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {scenario.time}
              </p>
              <h3 className="mt-5 text-body-lg font-semibold text-ink-primary">
                {scenario.title}
              </h3>
              <p className="mt-2.5 text-ink-secondary">{scenario.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
