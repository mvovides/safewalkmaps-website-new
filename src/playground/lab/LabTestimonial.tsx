import type { ThemeConfig } from '@/theme/config';

import { PLACEHOLDER_TESTIMONIAL } from '../content';
import { LabSection } from './LabSection';
import { cardClasses } from './labStyles';

export function LabTestimonial({ config }: { config: ThemeConfig }) {
  const style = config.components.testimonial.style;
  const quote = (key: number) => (
    <figure key={key} className={cardClasses(config.components.card.style)}>
      <blockquote className="text-body-lg text-ink-primary">
        “{PLACEHOLDER_TESTIMONIAL.quote}”
      </blockquote>
      <figcaption className="mt-4 text-caption text-ink-tertiary">
        {PLACEHOLDER_TESTIMONIAL.author} · {PLACEHOLDER_TESTIMONIAL.context}
      </figcaption>
    </figure>
  );
  return (
    <LabSection id="testimonial" title="Testimonial" variant={style}>
      <p className="demo-note mb-6" role="note">
        Placeholder only. SafeWalkMaps publishes no testimonial without the person's permission.
      </p>
      {style === 'hidden' && (
        <p className="text-body-sm text-ink-tertiary">Hidden in this preset.</p>
      )}
      {style === 'single-quote' && (
        <div className="mx-auto max-w-prose-lg text-center">{quote(0)}</div>
      )}
      {style === 'cards' && <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map(quote)}</div>}
    </LabSection>
  );
}
