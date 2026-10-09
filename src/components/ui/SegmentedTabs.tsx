import { useCallback, useRef } from 'react';

import { cn } from '@/lib/cn';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** Short line under the label on wider layouts. */
  meta?: string;
};

export type SegmentedTabsProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Id prefix shared with the panels this control drives. */
  idPrefix: string;
  label: string;
  className?: string;
  inverse?: boolean;
};

/**
 * iOS-style segmented control, implemented as a tablist.
 *
 * The selected background is a single absolutely-positioned pill that slides
 * between segments — one transform rather than a colour change per segment —
 * and arrow keys move between tabs the way the ARIA tabs pattern expects.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  idPrefix,
  label,
  className,
  inverse = false,
}: SegmentedTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const count = options.length;

  const focusTab = useCallback((index: number) => {
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[index]?.focus();
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (activeIndex + 1) % count;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (activeIndex - 1 + count) % count;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = count - 1;
    if (next === null) return;
    event.preventDefault();
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    focusTab(next);
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        'relative grid w-full gap-1 rounded-2xl p-1.5',
        inverse ? 'bg-white/8 ring-1 ring-white/12' : 'bg-surface-tertiary ring-1 ring-line',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      {/* Sliding selection pill. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute bottom-1.5 top-1.5 rounded-xl transition-transform duration-slow ease-out-expo',
          inverse ? 'bg-white shadow-sm' : 'bg-white shadow-sm',
        )}
        style={{
          width: `calc((100% - 0.75rem - ${(count - 1) * 0.25}rem) / ${count})`,
          left: '0.375rem',
          transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
        }}
      />

      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            id={`${idPrefix}-tab-${option.value}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${option.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex min-h-11 flex-col items-center justify-center rounded-xl px-2 py-2 transition-colors duration-base',
              selected
                ? 'text-navy-800'
                : inverse
                  ? 'text-white/60 hover:text-white/85'
                  : 'text-ink-secondary hover:text-navy-700',
            )}
          >
            <span className="text-body-sm font-semibold leading-tight">{option.label}</span>
            {option.meta && (
              <span
                className={cn(
                  'tabular mt-0.5 text-caption leading-tight',
                  selected ? 'text-ink-tertiary' : inverse ? 'text-white/40' : 'text-ink-tertiary',
                )}
              >
                {option.meta}
              </span>
            )}
            <span className="sr-only">{index === activeIndex ? ' (selected)' : ''}</span>
          </button>
        );
      })}
    </div>
  );
}
