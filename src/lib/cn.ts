import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge needs to be told about our custom scales.
 *
 * Without this it classifies `text-body-sm` as a text *colour* (it only knows
 * the stock font-size names), so `cn('text-white', 'text-body-sm')` silently
 * drops the colour — which is how every primary button ended up with navy text
 * on a navy background.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Custom radius names, so `cn('rounded-control', 'rounded-xl')` resolves
      // to one class instead of leaving both in place.
      borderRadius: ['xs', 'phone', 'pill', 'control', 'card'],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'display-2xl',
            'display-xl',
            'display-lg',
            'display-md',
            'display-sm',
            'body-xl',
            'body-lg',
            'body',
            'body-sm',
            'caption',
            'label',
          ],
        },
      ],
    },
  },
});

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
