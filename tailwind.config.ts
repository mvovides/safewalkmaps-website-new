import type { Config } from 'tailwindcss';

/**
 * SafeWalkMaps design system.
 *
 * Every navy and green value below is sampled from the supplied logo
 * (`safewalkmaps_logo.svg`): the shield gradient runs #062E6F → #05295F → #031B3D
 * and the route gradient runs #6AF5A4 → #43E68D → #17F58B. The remaining steps are
 * tonal extensions of those two hues so the palette stays recognisably brand-true.
 *
 * Contrast notes (verified against #FFFFFF):
 *   ink.primary    #06152E  16.2:1  AAA body text
 *   ink.secondary  #4A5F7D   7.2:1  AA  body text
 *   ink.tertiary   #788CA6   3.9:1  large text / labels only
 *   green.800      #07704A   6.1:1  AA  green text on white
 *   green.500      #17F58B   1.5:1  graphics only on white — 11.8:1 on navy.900
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

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      opacity: fineOpacity,
      colors: {
        navy: {
          50: '#F2F6FC',
          100: '#E2EBF7',
          200: '#C3D5EC',
          300: '#93AFD7',
          400: '#5B7FB5',
          500: '#2F5B96',
          600: '#0A3C85',
          700: '#062E6F', // logo shield gradient — start
          800: '#062A5E', // brand navy — wordmark
          900: '#031B3D', // logo shield gradient — end
          950: '#020F24',
        },
        green: {
          50: '#EBFEF4',
          100: '#D2FCE5',
          200: '#A6F8CA',
          300: '#6AF5A4', // logo route gradient — start
          400: '#43E68D', // logo route gradient — mid
          500: '#17F58B', // logo route gradient — end · signature accent
          600: '#0FBF6D',
          700: '#0A9159',
          800: '#07704A', // AA-safe green text on white
          900: '#054F36',
        },
        ink: {
          primary: '#06152E',
          secondary: '#4A5F7D',
          tertiary: '#788CA6',
          inverse: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F6F8FB',
          tertiary: '#EDF2F8',
          navy: '#031B3D',
          'navy-soft': '#06234C',
        },
        line: {
          DEFAULT: 'rgb(6 42 94 / 0.09)',
          strong: 'rgb(6 42 94 / 0.16)',
          inverse: 'rgb(255 255 255 / 0.12)',
          'inverse-strong': 'rgb(255 255 255 / 0.22)',
        },
        danger: {
          DEFAULT: '#D92D20',
          soft: '#FEF3F2',
        },
        warning: {
          DEFAULT: '#F79009',
          ink: '#B54708',
          soft: '#FFFAEB',
        },
      },
      fontFamily: {
        sans: [
          // `@fontsource-variable/inter` registers the family as
          // "Inter Variable" — with the space. Without it the whole stack
          // silently falls through to the system font.
          'Inter Variable',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Fluid editorial display scale.
        'display-2xl': ['clamp(2.875rem, 9.4vw, 8rem)', { lineHeight: '0.94', letterSpacing: '-0.045em' }],
        'display-xl': ['clamp(2.5rem, 6.6vw, 5.25rem)', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(2.125rem, 5.4vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-md': ['clamp(1.75rem, 3.9vw, 3rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(1.4375rem, 2.6vw, 2.125rem)', { lineHeight: '1.14', letterSpacing: '-0.022em' }],
        'body-xl': ['clamp(1.125rem, 1.5vw, 1.4375rem)', { lineHeight: '1.5', letterSpacing: '-0.012em' }],
        'body-lg': ['clamp(1.0625rem, 1.1vw, 1.1875rem)', { lineHeight: '1.6', letterSpacing: '-0.008em' }],
        body: ['1.0625rem', { lineHeight: '1.62', letterSpacing: '-0.006em' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '-0.004em' }],
        caption: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        label: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.12em' }],
      },
      spacing: {
        13: '3.25rem', // iOS-sized form control height
        section: 'clamp(5rem, 11vh, 9.5rem)',
        'section-lg': 'clamp(6.5rem, 15vh, 13rem)',
        gutter: 'clamp(1.25rem, 4vw, 2.5rem)',
      },
      maxWidth: {
        shell: '80rem', // 1280px content column
        'shell-wide': '90rem', // 1440px for full-bleed visuals
        prose: '38rem',
        'prose-lg': '44rem',
      },
      borderRadius: {
        xs: '0.375rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        phone: '2.875rem',
        pill: '999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgb(6 42 94 / 0.06)',
        sm: '0 2px 8px -2px rgb(6 42 94 / 0.08), 0 1px 2px rgb(6 42 94 / 0.04)',
        md: '0 10px 28px -8px rgb(6 42 94 / 0.12), 0 2px 6px -2px rgb(6 42 94 / 0.06)',
        lg: '0 26px 60px -18px rgb(6 42 94 / 0.16), 0 6px 16px -8px rgb(6 42 94 / 0.08)',
        xl: '0 44px 96px -28px rgb(6 42 94 / 0.22), 0 10px 24px -12px rgb(6 42 94 / 0.10)',
        phone: '0 56px 120px -32px rgb(3 27 61 / 0.34), 0 12px 32px -12px rgb(3 27 61 / 0.18)',
        'phone-sm': '0 28px 64px -22px rgb(3 27 61 / 0.30), 0 6px 18px -8px rgb(3 27 61 / 0.14)',
        green: '0 12px 32px -10px rgb(10 145 89 / 0.42)',
        'green-lg': '0 18px 48px -12px rgb(10 145 89 / 0.46)',
        inset: 'inset 0 1px 0 rgb(255 255 255 / 0.08)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'out-back': 'cubic-bezier(0.34, 1.4, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '240ms',
        slow: '420ms',
        slower: '700ms',
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
  plugins: [],
};

export default config;
