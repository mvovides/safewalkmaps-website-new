import { Plus } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

export type AccordionItem = {
  id: string;
  question: string;
  answer: string[];
};

type RowProps = {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
  headingLevel: NonNullable<AccordionProps['headingLevel']>;
};

function AccordionRow({ item, open, onToggle, headingLevel: Heading }: RowProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const baseId = useId().replace(/:/g, '');
  const panelId = `faq-panel-${baseId}`;
  const buttonId = `faq-trigger-${baseId}`;

  // Measure rather than relying on `grid-template-rows: 0fr` so the transition
  // is identical on older Safari, and re-measure when the viewport reflows text.
  const measure = useCallback(() => {
    if (panelRef.current) setHeight(panelRef.current.scrollHeight);
  }, []);

  useEffect(() => {
    measure();
    if (typeof ResizeObserver !== 'function' || !panelRef.current) {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="border-b border-line last:border-b-0">
      <Heading>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="tappable group flex w-full touch-manipulation items-start justify-between gap-6 py-6 text-left hover:text-navy-700 active:opacity-70 sm:py-7"
        >
          <span className="text-body-lg font-semibold text-ink-primary group-hover:text-navy-700">
            {item.question}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-strong text-navy-700 transition-all duration-spring-snappy ease-spring',
              open
                ? 'rotate-[135deg] border-green-500 bg-green-500 text-navy-900'
                : 'group-hover:border-navy-300 group-hover:bg-navy-50',
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
          </span>
        </button>
      </Heading>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        style={{ height: open ? height : 0 }}
        className="overflow-hidden transition-[height] duration-spring-snappy ease-spring"
      >
        <div
          ref={panelRef}
          aria-hidden={!open}
          className="max-w-prose-lg space-y-4 pb-7 pr-10 text-ink-secondary"
        >
          {item.answer.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  /** Id of the item open on first render. */
  defaultOpenId?: string;
  /**
   * Heading level wrapping each question. The default suits an accordion
   * inside a section that has its own `h2`; when the page's `h1` sits directly
   * above the accordion, pass `h2` so the outline does not skip a level.
   */
  headingLevel?: 'h2' | 'h3';
};

/**
 * Single-open accordion.
 *
 * The panel stays mounted so the height transition can run (a transition
 * cannot start from `display: none`), and the answer is marked `aria-hidden`
 * while collapsed so screen readers do not read text the eye cannot see.
 * Answers are non-interactive prose, so nothing focusable is left in the
 * collapsed panel.
 */
export function Accordion({
  items,
  className,
  defaultOpenId,
  headingLevel = 'h3',
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className={cn('divide-y divide-line', className)}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          open={openId === item.id}
          headingLevel={headingLevel}
          onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}
