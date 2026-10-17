import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/config';

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'definitions'; items: { term: string; text: string }[] }
  /** A detail that must be confirmed before publication. Rendered visibly so
   *  it cannot be missed, rather than silently invented. */
  | { type: 'needs-confirmation'; text: string };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalPageProps = {
  title: string;
  intro: string;
  /** ISO date of the last substantive change. */
  updated: string;
  sections: LegalSection[];
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'p') {
          return (
            <p key={key} className="text-ink-secondary">
              {block.text}
            </p>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={key} className="space-y-2.5">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3 text-ink-secondary">
                  <span
                    aria-hidden="true"
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'definitions') {
          return (
            <dl key={key} className="space-y-4">
              {block.items.map((item) => (
                <div key={item.term}>
                  <dt className="font-semibold text-ink-primary">{item.term}</dt>
                  <dd className="mt-1 text-ink-secondary">{item.text}</dd>
                </div>
              ))}
            </dl>
          );
        }

        return (
          <div
            key={key}
            className="flex gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3.5"
          >
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-warning-ink"
            />
            <p className="text-body-sm text-warning-ink">
              <span className="font-semibold">Needs confirmation before publication: </span>
              {block.text}
            </p>
          </div>
        );
      })}
    </>
  );
}

/**
 * Shared layout for the privacy policy and terms.
 *
 * A sticky contents list on desktop, and the same design tokens as the rest of
 * the site so the legal pages do not feel like a different website.
 */
export function LegalPage({ title, intro, updated, sections }: LegalPageProps) {
  const formatted = useMemo(() => formatDate(updated), [updated]);

  return (
    <>
      <header className="border-b border-line bg-surface-secondary pb-14 pt-32 lg:pb-16 lg:pt-36">
        <div className="shell">
          <p className="eyebrow mb-5">
            <span aria-hidden="true" className="eyebrow-rule" />
            <span>Legal</span>
          </p>
          <h1 className="max-w-[24ch] text-display-lg text-ink-primary">{title}</h1>
          <p className="mt-6 max-w-prose-lg text-body-lg text-ink-secondary">{intro}</p>
          <p className="mt-7 text-caption text-ink-tertiary">Last updated {formatted}</p>
        </div>
      </header>

      <div className="shell grid gap-12 py-section lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-label font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
            Contents
          </h2>
          <ol className="mt-4 space-y-2.5">
            {sections.map((section, index) => (
              <li key={section.id} className="flex gap-3">
                <span className="tabular pt-px text-caption text-ink-tertiary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <a
                  href={`#${section.id}`}
                  className="text-body-sm text-ink-secondary transition-colors duration-base hover:text-navy-800"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-prose-lg">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={cn('scroll-mt-28', index > 0 && 'mt-14 border-t border-line pt-14')}
            >
              <h2 className="flex items-baseline gap-3 text-display-sm text-ink-primary">
                <span className="tabular text-body-sm font-semibold text-green-800">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.title}
              </h2>
              <div className="mt-5 space-y-5">
                <Blocks blocks={section.blocks} />
              </div>
            </section>
          ))}

          <div className="mt-16 rounded-2xl border border-line bg-surface-secondary p-7">
            <h2 className="text-body-lg text-ink-primary">Questions about this?</h2>
            <p className="mt-2.5 text-ink-secondary">
              Email us and a person will reply. We read everything.
            </p>
            <ButtonLink
              href={`mailto:${siteConfig.contactEmail}`}
              variant="secondary"
              className="mt-5"
            >
              {siteConfig.contactEmail}
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
