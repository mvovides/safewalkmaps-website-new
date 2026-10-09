import { Section, SectionHeading } from '@/components/layout/Section';
import { Accordion } from '@/components/ui/Accordion';
import { faqItems } from '@/data/faq';
import { siteConfig } from '@/lib/config';

export function FaqSection() {
  return (
    <Section id="faq" tone="secondary">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            index="10"
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
          <Accordion items={faqItems} defaultOpenId={faqItems[0]?.id} />
        </div>
      </div>
    </Section>
  );
}
