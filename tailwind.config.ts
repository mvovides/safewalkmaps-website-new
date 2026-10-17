import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

import { tokensToCssVariables } from './src/theme/cssVariables';
import {
  defaultTokens,
  FONT_STACKS,
  GREEN_STEPS,
  NAVY_STEPS,
  TYPE_STEPS,
} from './src/theme/tokens';

/**
 * SafeWalkMaps design system.
 *
 * The values live in `src/theme/tokens.ts`. This file maps them onto Tailwind:
 * every colour, radius, shadow, font, size and duration utility reads a CSS custom
 * property, and the plugin at the bottom emits the defaults on `:root`, so the
 * production CSS still carries the real numbers and needs no JavaScript.
 *
 * Colours use `rgb(var(--…) / <alpha-value>)` with the variables holding bare
 * channel triplets, which is what keeps `bg-navy-800/35` and friends working.
 * The line colours carry their alpha inside the value and have no modifiers.
 *
 * Contrast notes for the default palette (against #FFFFFF, WCAG 2.1):
 *   ink.primary    #06162D  18.1:1  AAA body text
 *   ink.secondary  #4A5F7D   6.5:1  AA  body text
 *   ink.tertiary   #768BA7   3.5:1  large text / labels only
 *   green.800      #175638   8.7:1  AAA green text on white
 *   green.500      #34C57F   2.2:1  graphics only on white
 *   navy.800       #244E8A   8.3:1  white on the primary button
 *
 * On surface.navy (#09479C) white is 8.8:1, but translucent white has less
 * headroom than it had on the old near-black navy: body copy needs at least
 * 70% (5.1:1), and anything under 45% falls below 3:1. green.500 is 3.9:1, so
 * it carries graphics and display-size words; small green text uses
 * green.300 (5.3:1).
 *
 * `ink.tertiary` clears AA for large text (3:1) but not for body copy, which
 * is why it stays on labels and captions. Under `prefers-contrast: more` both
 * secondary and tertiary are darkened to 9.2:1 and 6.0:1 — see the
 * increased-contrast block in src/styles/index.css.
 */

/**
 * Tailwind's stock opacity scale only contains multiples of five, and any
 * `/N` modifier outside it is silently dropped — `bg-white/96` produces no
 * rule at all. Glass surfaces need finer control than that, so every integer
 * from 0 to 100 is registered here.
 */
const fineOpacity = Object.fromEntries(
  Array.from({ length: 101 }, (_, value) => [String(value), String(value / 100)]),
);

const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const steps = (family: string, list: readonly string[]) =>
  Object.fromEntries(list.map((step) => [step, channel(`color-${family}-${step}`)]));

/**
 * The playground is scanned only when vite.config.ts says it is being served
 * or built, so production CSS never carries playground-only utilities.
 */
const playgroundContent =
  process.env.PLAYGROUND === '1' ? ['./playground.html', './src/playground/**/*.{ts,tsx}'] : [];

const config: Config = {
  content: [
    './index.html',
    './src/*.{ts,tsx}',
    './src/{components,pages,hooks,lib,data,styles,theme,services}/**/*.{ts,tsx}',
    ...playgroundContent,
  ],
  theme: {
    extend: {
      opacity: fineOpacity,
      colors: {
        navy: steps('navy', NAVY_STEPS),
        green: steps('green', GREEN_STEPS),
        ink: {
          primary: channel('color-ink-primary'),
          secondary: channel('color-ink-secondary'),
          tertiary: channel('color-ink-tertiary'),
          inverse: channel('color-ink-inverse'),
        },
        surface: {
          DEFAULT: channel('color-surface'),
          secondary: channel('color-surface-secondary'),
          tertiary: channel('color-surface-tertiary'),
          navy: channel('color-surface-navy'),
          'navy-soft': channel('color-surface-navy-soft'),
        },
        line: {
          DEFAULT: 'var(--color-line)',
          strong: 'var(--color-line-strong)',
          inverse: 'var(--color-line-inverse)',
          'inverse-strong': 'var(--color-line-inverse-strong)',
        },
        danger: { DEFAULT: channel('color-danger'), soft: channel('color-danger-soft') },
        warning: {
          DEFAULT: channel('color-warning'),
          ink: channel('color-warning-ink'),
          soft: channel('color-warning-soft'),
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
        // The logo's wordmark. Part of the brand mark, so it is fixed rather
        // than a theme token: it stays Inter whatever the body family is.
        wordmark: FONT_STACKS.inter,
      },
      fontSize: Object.fromEntries(
        TYPE_STEPS.map((step) => [
          step,
          [
            `var(--text-${step})`,
            { lineHeight: `var(--leading-${step})`, letterSpacing: `var(--tracking-${step})` },
          ],
        ]),
      ),
      spacing: {
        13: '3.25rem', // iOS-sized form control height
        section: 'var(--space-section)',
        'section-lg': 'var(--space-section-lg)',
        gutter: 'var(--space-gutter)',
      },
      maxWidth: {
        shell: 'var(--width-shell)',
        'shell-wide': 'var(--width-shell-wide)',
        prose: 'var(--width-prose)',
        'prose-lg': 'var(--width-prose-lg)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        phone: 'var(--radius-phone)',
        pill: 'var(--radius-pill)',
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        phone: 'var(--shadow-phone)',
        'phone-sm': 'var(--shadow-phone-sm)',
        green: 'var(--shadow-green)',
        'green-lg': 'var(--shadow-green-lg)',
        inset: 'var(--shadow-inset)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
        'out-quint': 'var(--ease-out-quint)',
        'in-out-soft': 'var(--ease-in-out-soft)',
        'out-back': 'var(--ease-out-back)',
        // Spring curves. Defined in index.css so a @supports block can swap the
        // real `linear()` sampling in over a bezier fallback. Each one is only
        // correct at its paired duration below.
        spring: 'var(--ease-spring)',
        'spring-sheet': 'var(--ease-spring-sheet)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        // Press feedback is asymmetric: near-instant in, unhurried out.
        'press-in': 'var(--duration-press-in)',
        'press-out': 'var(--duration-press-out)',
        // Settle times of the generated springs — see generate-spring-easings.mjs.
        spring: 'var(--duration-spring)',
        'spring-snappy': 'var(--duration-spring-snappy)',
        'spring-sheet': 'var(--duration-spring-sheet)',
      },
      keyframes: {
        'node-pulse': {
          '0%': { transform: 'scale(0.72)', opacity: '0.55' },
          '70%': { transform: 'scale(2.1)', opacity: '0' },
          '100%': { transform: 'scale(2.1)', opacity: '0' },
        },
        'route-dash': {
          to: { strokeDashoffset: '-24' },
        },
        'sheen-sweep': {
          '0%': { transform: 'translateX(-130%)' },
          '100%': { transform: 'translateX(130%)' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        'fade-rise': {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'scroll-hint': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '28%': { opacity: '1' },
          '100%': { transform: 'translateY(13px)', opacity: '0' },
        },
      },
      animation: {
        'node-pulse': 'node-pulse 3s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'route-dash': 'route-dash 1.1s linear infinite',
        'float-soft': 'float-soft 7s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        'fade-rise': 'fade-rise 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scroll-hint': 'scroll-hint 2.1s cubic-bezier(0.65, 0, 0.35, 1) infinite',
      },
    },
  },
  plugins: [
    // The token defaults, emitted into the base layer exactly where the
    // hand-written `:root` block used to sit, so cascade order is unchanged.
    plugin(({ addBase }) => {
      addBase({ ':root': tokensToCssVariables(defaultTokens) });
    }),
  ],
};

export default config;
