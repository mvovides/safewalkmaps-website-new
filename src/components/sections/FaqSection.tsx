import { Section, SectionHeading } from '@/components/layout/Section';
import { Accordion } from '@/components/ui/Accordion';
import { faqItems } from '@/data/faq';
import { siteConfig } from '@/lib/config';

export type FaqSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};

export function FaqSection({ headingAs = 'h2', className }: FaqSectionProps = {}) {
  // One level below the section heading, so a lead `h1` is followed by `h2`s.
  const questionLevel = headingAs === 'h1' ? 'h2' : 'h3';

  return (
    <Section id="faq" tone="secondary" className={className}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            as={headingAs}
            eyebrow="Questions"
            title="The questions worth asking."
            size="md"
            lede="Including the one about whether a score means a route is safe. It does not, and the answer explains why we will not say otherwise."
          />
          <p className="mt-8 text-body-sm text-ink-tertiary">
            Something we have not covered?{' '}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-navy-800 underline underline-offset-4 hover:text-navy-600"
            >
              Email us
            </a>{' '}
            — a person reads every message.
          </p>
        </div>

        <div data-reveal>
          <Accordion
            items={faqItems}
            defaultOpenId={faqItems[0]?.id}
            headingLevel={questionLevel}
          />
        </div>
      </div>
    </Section>
  );
}
