import { AlertCircle } from 'lucide-react';
import { forwardRef, useId } from 'react';

import { cn } from '@/lib/cn';

export type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  error?: string | undefined;
  hint?: string;
  className?: string;
  /** Styles for placement on the navy surface. */
  inverse?: boolean;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, className, inverse = false, id, required, ...rest },
  ref,
) {
  const generatedId = useId().replace(/:/g, '');
  const fieldId = id ?? `field-${generatedId}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={fieldId}
        className={cn(
          'text-body-sm font-medium',
          inverse ? 'text-white/80' : 'text-ink-secondary',
        )}
      >
        {label}
        {!required && (
          <span className={cn('ml-1.5 font-normal', inverse ? 'text-white/40' : 'text-ink-tertiary')}>
            optional
          </span>
        )}
      </label>

      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          'h-13 w-full rounded-xl border px-4 text-body outline-none transition-[border-color,background-color,box-shadow] duration-base ease-out-expo',
          'placeholder:text-ink-tertiary',
          inverse
            ? 'border-white/16 bg-white/8 text-white placeholder:text-white/35 focus:border-green-500 focus:bg-white/12 focus:ring-4 focus:ring-green-500/18'
            : 'border-line-strong bg-white text-ink-primary focus:border-navy-600 focus:ring-4 focus:ring-navy-600/12',
          error &&
            (inverse
              ? 'border-danger/70 focus:border-danger focus:ring-danger/20'
              : 'border-danger focus:border-danger focus:ring-danger/15'),
        )}
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className={cn('text-caption', inverse ? 'text-white/50' : 'text-ink-tertiary')}>
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className={cn(
            'flex items-center gap-1.5 text-caption font-medium',
            inverse ? 'text-danger/95' : 'text-danger',
          )}
        >
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});
