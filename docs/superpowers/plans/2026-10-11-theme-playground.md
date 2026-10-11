# Theme Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `playground.html` sandbox where every visual variable of the SafeWalkMaps site can be changed live on real components, with nine presets, save/compare/export, and a token bridge that lets a chosen preset be applied to production as data.

**Architecture:** The Tailwind theme moves onto CSS custom properties generated from `src/theme/tokens.ts`, with today's values as defaults emitted by a Tailwind plugin, so production renders identically and components become re-themeable at runtime. A second Vite entry (`playground.html`) hosts a control panel that drives an iframe preview over `postMessage`; the preview applies a `ThemeConfig` to `<html>` and renders either lab compositions built from the real primitives or the real `App`.

**Tech Stack:** React 18, TypeScript 5.6, Vite 5.4, Tailwind 3.4 (jiti config loader), Vitest 2 + Testing Library, no new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-11-theme-playground-design.md`

## Global Constraints

- Branch `theme-playground`; Conventional Commits; commit at every task end. Never touch `main`.
- No new runtime dependency. Google Fonts requests only from the playground, never from production.
- `npm run build` output must contain no playground JS and no playground-only CSS; production rendered values must equal today's (spec §1.6 CSS diff).
- The logo (`ShieldMark`, wordmark `#32D583`) and the score-ring gradient are never tokenised.
- No fabricated testimonials, statistics or product claims; every illustrative figure carries `ILLUSTRATIVE_NOTE`; the testimonial composition is a labelled placeholder.
- Only `tailwind.config.ts`, `vite.config.ts`, `package.json`, `.gitignore`, `src/styles/index.css`, `src/lib/cn.ts`, `src/components/ui/Button.tsx`, `src/components/layout/Section.tsx` and the two docs change among existing files.
- Existing 134 tests stay green after every task. Run `npm run lint && npm run typecheck && npm run test` before each commit; `npm run build` at Tasks 2, 6 and 14.
- Formatting: run `npx prettier --write <files>` on every file touched (`.prettierrc.json`: single quotes, width 100, trailing commas).
- Windows host: scripts must not use `VAR=x cmd` syntax; cross-platform behaviour comes from `vite.config.ts` setting `process.env.PLAYGROUND`.

## Review Focus

1. **A pasted import that is valid JSON but not a theme** (e.g. `{"foo":1}`) must list errors, never throw or half-apply. Test in Task 3 (`validate.test.ts`, "rejects an object with no schemaVersion").
2. **A custom preset whose `basedOn` built-in no longer exists** (renamed preset ids in a future version) must reset to `today`, not crash. Test in Task 6 (`store.test.ts`, "resetToBase falls back to today when basedOn is unknown").
3. **`localStorage` unavailable** (private mode, blocked storage) must leave the playground working in memory. Test in Task 6 ("falls back to memory when storage throws or is missing").
4. **A font family not in the curated list** (imported from a hand-edited JSON) must apply as a plain stack without trying to load anything. Test in Task 8 (`fonts.test.ts`, "ignores stacks with no matching option and bundled families").
5. **A preview iframe that posts `ready` before the shell has state** (fast load) must still receive the first `apply`. Test in Task 7 (`PreviewFrame.test.tsx`, "replies to ready with the current config, and re-sends on change").

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/theme/tokens.ts` | `ThemeTokens` type, step constants, `defaultTokens` (today's literals). No DOM. |
| `src/theme/cssVariables.ts` | `hexToChannels`, `kebab`, `tokensToCssVariables`. No DOM. |
| `src/theme/config.ts` | `ThemeConfig` type and the enum unions. |
| `src/theme/validate.ts` | `parseThemeConfig(unknown)`. |
| `src/theme/export.ts` | `toJson`, `toCss`, `toTypeScript`. |
| `src/theme/apply.ts` | `applyTheme(root, config)` (DOM). |
| `src/theme/color.ts` | hex/rgb/hsl maths, `generateRamp`, `contrastRatio`, `wcagLevel`, `deriveSemantic`. |
| `src/theme/derive.ts` | `densityTokens`, `contentWidthTokens`, `intensityTokens`, `radiusScale`, `shadowSet`, `typeScale`. |
| `src/theme/build.ts` | `buildTokens(options)` for authoring presets. |
| `src/theme/presets/*.ts`, `index.ts` | the nine `ThemeConfig`s and `builtInPresets`. |
| `tailwind.config.ts` | utilities read variables; plugin emits defaults. |
| `playground.html`, `src/playground/main.tsx` | second entry; shell or preview by query. |
| `src/playground/protocol.ts` | message types, guards, `postToParent`, `postToFrame`. |
| `src/playground/fonts.ts` | curated families, `ensureFontLoaded`. |
| `src/playground/content.ts` | headline/tone variants, placeholder testimonial. |
| `src/playground/store/*` | state types, reducer, persistence, provider + hooks. |
| `src/playground/Shell.tsx`, `shell/*` | top bar, preview frames, export drawer, import dialog. |
| `src/playground/panel/*` | tabs and controls. |
| `src/playground/Preview.tsx`, `preview/LiveSite.tsx` | preview document. |
| `src/playground/lab/*` | `Lab.tsx`, `LabSection.tsx`, `labStyles.ts`, fifteen compositions. |
| `src/playground/playground.css` | lab chrome, variant CSS hooks, shell layout. |
| `docs/theme-playground.md` | user guide and apply-to-production steps. |

---

### Task 1: Token module and CSS-variable converter

**Files:**
- Create: `src/theme/tokens.ts`
- Create: `src/theme/cssVariables.ts`
- Test: `src/theme/tokens.test.ts`

**Interfaces:**
- Produces: `ThemeTokens`, `NAVY_STEPS`, `GREEN_STEPS`, `TYPE_STEPS`, `RADIUS_KEYS`, `SHADOW_KEYS`, `defaultTokens`, `hexToChannels(hex: string): string`, `kebab(key: string): string`, `tokensToCssVariables(tokens: ThemeTokens): Record<string, string>`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/theme/tokens.test.ts
import { describe, expect, it } from 'vitest';

import { hexToChannels, kebab, tokensToCssVariables } from './cssVariables';
import { defaultTokens } from './tokens';

/** The literals that lived in tailwind.config.ts and index.css before the bridge. */
const PRE_BRIDGE = {
  navy800: '#062A5E',
  green500: '#17F58B',
  inkSecondary: '#4A5F7D',
  surfaceSecondary: '#F6F8FB',
  lineStrong: 'rgb(6 42 94 / 0.16)',
  radiusLg: '1rem',
  shadowMd: '0 10px 28px -8px rgb(6 42 94 / 0.12), 0 2px 6px -2px rgb(6 42 94 / 0.06)',
  displayXl: { size: 'clamp(2.5rem, 6.6vw, 5.25rem)', lineHeight: '0.98', letterSpacing: '-0.04em' },
  section: 'clamp(5rem, 11vh, 9.5rem)',
  durationBase: '240ms',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

describe('hexToChannels', () => {
  it('converts six-digit hex to space-separated channels', () => {
    expect(hexToChannels('#062A5E')).toBe('6 42 94');
    expect(hexToChannels('#ffffff')).toBe('255 255 255');
  });
  it('expands three-digit hex', () => {
    expect(hexToChannels('#fff')).toBe('255 255 255');
  });
  it('throws on anything else', () => {
    expect(() => hexToChannels('rgb(1 2 3)')).toThrow(/hex/);
  });
});

describe('kebab', () => {
  it('turns camelCase into kebab-case', () => {
    expect(kebab('navySoft')).toBe('navy-soft');
    expect(kebab('phoneSm')).toBe('phone-sm');
    expect(kebab('base')).toBe('base');
  });
});

describe('defaultTokens', () => {
  it('pins the pre-bridge literals', () => {
    expect(defaultTokens.colors.navy['800']).toBe(PRE_BRIDGE.navy800);
    expect(defaultTokens.colors.green['500']).toBe(PRE_BRIDGE.green500);
    expect(defaultTokens.colors.ink.secondary).toBe(PRE_BRIDGE.inkSecondary);
    expect(defaultTokens.colors.surface.secondary).toBe(PRE_BRIDGE.surfaceSecondary);
    expect(defaultTokens.colors.line.strong).toBe(PRE_BRIDGE.lineStrong);
    expect(defaultTokens.radius.lg).toBe(PRE_BRIDGE.radiusLg);
    expect(defaultTokens.shadows.md).toBe(PRE_BRIDGE.shadowMd);
    expect(defaultTokens.typography.scale['display-xl']).toEqual(PRE_BRIDGE.displayXl);
    expect(defaultTokens.spacing.section).toBe(PRE_BRIDGE.section);
    expect(defaultTokens.motion.duration.base).toBe(PRE_BRIDGE.durationBase);
    expect(defaultTokens.motion.ease.outExpo).toBe(PRE_BRIDGE.easeOutExpo);
    expect(defaultTokens.radius.control).toBe('999px');
    expect(defaultTokens.radius.card).toBe('1.75rem');
    expect(defaultTokens.typography.headingWeight).toBe(600);
    expect(defaultTokens.motion.revealScale).toBe(1);
  });
});

describe('tokensToCssVariables', () => {
  const vars = tokensToCssVariables(defaultTokens);

  it('emits channel triplets for alpha-capable families', () => {
    expect(vars['--color-navy-800']).toBe('6 42 94');
    expect(vars['--color-green-500']).toBe('23 245 139');
    expect(vars['--color-ink-primary']).toBe('6 21 46');
    expect(vars['--color-surface']).toBe('255 255 255');
    expect(vars['--color-surface-navy-soft']).toBe('6 35 76');
    expect(vars['--color-warning-ink']).toBe('181 71 8');
    expect(vars['--color-danger-soft']).toBe('254 243 242');
  });

  it('emits line colours verbatim because their alpha is part of the value', () => {
    expect(vars['--color-line']).toBe('rgb(6 42 94 / 0.09)');
    expect(vars['--color-line-inverse-strong']).toBe('rgb(255 255 255 / 0.22)');
  });

  it('emits typography, radius, shadow, spacing and motion variables', () => {
    expect(vars['--font-sans']).toContain("'Inter Variable'");
    expect(vars['--font-display']).toBe('var(--font-sans)');
    expect(vars['--heading-weight']).toBe('600');
    expect(vars['--text-display-xl']).toBe('clamp(2.5rem, 6.6vw, 5.25rem)');
    expect(vars['--leading-display-xl']).toBe('0.98');
    expect(vars['--tracking-display-xl']).toBe('-0.04em');
    expect(vars['--radius-2xl']).toBe('1.75rem');
    expect(vars['--radius-control']).toBe('999px');
    expect(vars['--shadow-phone-sm']).toContain('0 28px 64px');
    expect(vars['--shadow-green-lg']).toContain('rgb(10 145 89 / 0.46)');
    expect(vars['--space-section-lg']).toBe('clamp(6.5rem, 15vh, 13rem)');
    expect(vars['--width-shell']).toBe('80rem');
    expect(vars['--duration-slower']).toBe('700ms');
    expect(vars['--ease-in-out-soft']).toBe('cubic-bezier(0.65, 0, 0.35, 1)');
    expect(vars['--reveal-scale']).toBe('1');
    expect(vars['--color-scheme']).toBe('light');
  });

  it('derives the legacy hex variables the SVG illustrations read', () => {
    expect(vars['--brand-navy']).toBe('#062a5e');
    expect(vars['--brand-navy-bright']).toBe('#062e6f');
    expect(vars['--brand-navy-deep']).toBe('#031b3d');
    expect(vars['--brand-navy-darkest']).toBe('#020f24');
    expect(vars['--brand-green']).toBe('#17f58b');
    expect(vars['--brand-green-light']).toBe('#6af5a4');
    expect(vars['--brand-green-mid']).toBe('#43e68d');
    expect(vars['--brand-green-muted']).toBe('#0a9159');
    expect(vars['--brand-green-ink']).toBe('#07704a');
    expect(vars['--surface']).toBe('#ffffff');
    expect(vars['--surface-navy']).toBe('#031b3d');
    expect(vars['--text-tertiary']).toBe('#788ca6');
    expect(vars['--border']).toBe('rgb(6 42 94 / 0.09)');
    expect(vars['--danger']).toBe('#d92d20');
    expect(vars['--warning']).toBe('#f79009');
  });

  it('emits a display family verbatim when one is set', () => {
    const withDisplay = {
      ...defaultTokens,
      typography: { ...defaultTokens.typography, display: "'Manrope', sans-serif" },
    };
    expect(tokensToCssVariables(withDisplay)['--font-display']).toBe("'Manrope', sans-serif");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/theme/tokens.test.ts`
Expected: FAIL, "Failed to resolve import './cssVariables'".

- [ ] **Step 3: Write `src/theme/tokens.ts`**

```ts
/**
 * The SafeWalkMaps design tokens, as data.
 *
 * `defaultTokens` holds the values that used to be literals in tailwind.config.ts
 * and src/styles/index.css. The Tailwind config imports this file and emits the
 * values as CSS custom properties, so this module must stay free of DOM types
 * and `import.meta` (it is type-checked under tsconfig.node.json too).
 */

export const NAVY_STEPS = [
  '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950',
] as const;
export const GREEN_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
export const TYPE_STEPS = [
  'display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm',
  'body-xl', 'body-lg', 'body', 'body-sm', 'caption', 'label',
] as const;
export const RADIUS_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'phone', 'pill', 'control', 'card'] as const;
export const SHADOW_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'phone', 'phoneSm', 'green', 'greenLg', 'inset'] as const;

export type NavyStep = (typeof NAVY_STEPS)[number];
export type GreenStep = (typeof GREEN_STEPS)[number];
export type TypeStep = (typeof TYPE_STEPS)[number];
export type RadiusKey = (typeof RADIUS_KEYS)[number];
export type ShadowKey = (typeof SHADOW_KEYS)[number];

export type TypeStyle = { size: string; lineHeight: string; letterSpacing: string };
export type HeadingWeight = 500 | 600 | 700 | 800;

export type ThemeTokens = {
  colors: {
    scheme: 'light' | 'dark';
    navy: Record<NavyStep, string>;
    green: Record<GreenStep, string>;
    ink: { primary: string; secondary: string; tertiary: string; inverse: string };
    surface: { base: string; secondary: string; tertiary: string; navy: string; navySoft: string };
    /** Full `rgb(r g b / a)` strings: the alpha is part of the value. */
    line: { base: string; strong: string; inverse: string; inverseStrong: string };
    danger: { base: string; soft: string };
    warning: { base: string; ink: string; soft: string };
  };
  typography: {
    sans: string;
    /** Heading family; null means "same as sans". */
    display: string | null;
    mono: string;
    headingWeight: HeadingWeight;
    scale: Record<TypeStep, TypeStyle>;
  };
  radius: Record<RadiusKey, string>;
  shadows: Record<ShadowKey, string>;
  spacing: {
    section: string;
    sectionLg: string;
    gutter: string;
    shell: string;
    shellWide: string;
    prose: string;
    proseLg: string;
  };
  motion: {
    duration: { fast: string; base: string; slow: string; slower: string };
    ease: { outExpo: string; outQuint: string; inOutSoft: string; outBack: string };
    /** Multiplies the distance a scroll reveal travels. 1 = today, 0 = none. */
    revealScale: number;
  };
};

export const defaultTokens: ThemeTokens = {
  colors: {
    scheme: 'light',
    navy: {
      '50': '#F2F6FC', '100': '#E2EBF7', '200': '#C3D5EC', '300': '#93AFD7', '400': '#5B7FB5',
      '500': '#2F5B96', '600': '#0A3C85', '700': '#062E6F', '800': '#062A5E', '900': '#031B3D',
      '950': '#020F24',
    },
    green: {
      '50': '#EBFEF4', '100': '#D2FCE5', '200': '#A6F8CA', '300': '#6AF5A4', '400': '#43E68D',
      '500': '#17F58B', '600': '#0FBF6D', '700': '#0A9159', '800': '#07704A', '900': '#054F36',
    },
    ink: { primary: '#06152E', secondary: '#4A5F7D', tertiary: '#788CA6', inverse: '#FFFFFF' },
    surface: {
      base: '#FFFFFF', secondary: '#F6F8FB', tertiary: '#EDF2F8', navy: '#031B3D', navySoft: '#06234C',
    },
    line: {
      base: 'rgb(6 42 94 / 0.09)',
      strong: 'rgb(6 42 94 / 0.16)',
      inverse: 'rgb(255 255 255 / 0.12)',
      inverseStrong: 'rgb(255 255 255 / 0.22)',
    },
    danger: { base: '#D92D20', soft: '#FEF3F2' },
    warning: { base: '#F79009', ink: '#B54708', soft: '#FFFAEB' },
  },
  typography: {
    sans: "'Inter Variable', Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
    display: null,
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    headingWeight: 600,
    scale: {
      'display-2xl': { size: 'clamp(2.875rem, 9.4vw, 8rem)', lineHeight: '0.94', letterSpacing: '-0.045em' },
      'display-xl': { size: 'clamp(2.5rem, 6.6vw, 5.25rem)', lineHeight: '0.98', letterSpacing: '-0.04em' },
      'display-lg': { size: 'clamp(2.125rem, 5.4vw, 4.25rem)', lineHeight: '1.02', letterSpacing: '-0.035em' },
      'display-md': { size: 'clamp(1.75rem, 3.9vw, 3rem)', lineHeight: '1.06', letterSpacing: '-0.03em' },
      'display-sm': { size: 'clamp(1.4375rem, 2.6vw, 2.125rem)', lineHeight: '1.14', letterSpacing: '-0.022em' },
      'body-xl': { size: 'clamp(1.125rem, 1.5vw, 1.4375rem)', lineHeight: '1.5', letterSpacing: '-0.012em' },
      'body-lg': { size: 'clamp(1.0625rem, 1.1vw, 1.1875rem)', lineHeight: '1.6', letterSpacing: '-0.008em' },
      body: { size: '1.0625rem', lineHeight: '1.62', letterSpacing: '-0.006em' },
      'body-sm': { size: '0.9375rem', lineHeight: '1.6', letterSpacing: '-0.004em' },
      caption: { size: '0.8125rem', lineHeight: '1.5', letterSpacing: '0' },
      label: { size: '0.6875rem', lineHeight: '1.4', letterSpacing: '0.12em' },
    },
  },
  radius: {
    xs: '0.375rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.25rem', '2xl': '1.75rem',
    '3xl': '2.25rem', phone: '2.875rem', pill: '999px', control: '999px', card: '1.75rem',
  },
  shadows: {
    xs: '0 1px 2px rgb(6 42 94 / 0.06)',
    sm: '0 2px 8px -2px rgb(6 42 94 / 0.08), 0 1px 2px rgb(6 42 94 / 0.04)',
    md: '0 10px 28px -8px rgb(6 42 94 / 0.12), 0 2px 6px -2px rgb(6 42 94 / 0.06)',
    lg: '0 26px 60px -18px rgb(6 42 94 / 0.16), 0 6px 16px -8px rgb(6 42 94 / 0.08)',
    xl: '0 44px 96px -28px rgb(6 42 94 / 0.22), 0 10px 24px -12px rgb(6 42 94 / 0.10)',
    phone: '0 56px 120px -32px rgb(3 27 61 / 0.34), 0 12px 32px -12px rgb(3 27 61 / 0.18)',
    phoneSm: '0 28px 64px -22px rgb(3 27 61 / 0.30), 0 6px 18px -8px rgb(3 27 61 / 0.14)',
    green: '0 12px 32px -10px rgb(10 145 89 / 0.42)',
    greenLg: '0 18px 48px -12px rgb(10 145 89 / 0.46)',
    inset: 'inset 0 1px 0 rgb(255 255 255 / 0.08)',
  },
  spacing: {
    section: 'clamp(5rem, 11vh, 9.5rem)',
    sectionLg: 'clamp(6.5rem, 15vh, 13rem)',
    gutter: 'clamp(1.25rem, 4vw, 2.5rem)',
    shell: '80rem',
    shellWide: '90rem',
    prose: '38rem',
    proseLg: '44rem',
  },
  motion: {
    duration: { fast: '150ms', base: '240ms', slow: '420ms', slower: '700ms' },
    ease: {
      outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      outQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
      inOutSoft: 'cubic-bezier(0.65, 0, 0.35, 1)',
      outBack: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
    },
    revealScale: 1,
  },
};
```

- [ ] **Step 4: Write `src/theme/cssVariables.ts`**

```ts
import {
  GREEN_STEPS, NAVY_STEPS, RADIUS_KEYS, SHADOW_KEYS, TYPE_STEPS, type ThemeTokens,
} from './tokens';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#062A5E` → `6 42 94`, the form Tailwind needs behind `<alpha-value>`. */
export function hexToChannels(hex: string): string {
  const match = HEX.exec(hex.trim());
  if (!match) throw new Error(`Expected a hex colour, got "${hex}"`);
  let digits = match[1] as string;
  if (digits.length === 3) digits = digits.split('').map((d) => d + d).join('');
  const value = parseInt(digits, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

export function kebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Every custom property the theme defines, ready for `:root` or `style.setProperty`.
 * Includes the legacy hex names (`--brand-navy`, `--surface`, …) that inline SVGs
 * read, derived from the same tokens so nothing can drift.
 */
export function tokensToCssVariables(tokens: ThemeTokens): Record<string, string> {
  const { colors, typography, radius, shadows, spacing, motion } = tokens;
  const vars: Record<string, string> = {};
  const hex = (value: string) => value.toLowerCase();

  vars['--color-scheme'] = colors.scheme;
  for (const step of NAVY_STEPS) vars[`--color-navy-${step}`] = hexToChannels(colors.navy[step]);
  for (const step of GREEN_STEPS) vars[`--color-green-${step}`] = hexToChannels(colors.green[step]);
  for (const [key, value] of Object.entries(colors.ink)) {
    vars[`--color-ink-${kebab(key)}`] = hexToChannels(value);
  }
  vars['--color-surface'] = hexToChannels(colors.surface.base);
  vars['--color-surface-secondary'] = hexToChannels(colors.surface.secondary);
  vars['--color-surface-tertiary'] = hexToChannels(colors.surface.tertiary);
  vars['--color-surface-navy'] = hexToChannels(colors.surface.navy);
  vars['--color-surface-navy-soft'] = hexToChannels(colors.surface.navySoft);
  vars['--color-line'] = colors.line.base;
  vars['--color-line-strong'] = colors.line.strong;
  vars['--color-line-inverse'] = colors.line.inverse;
  vars['--color-line-inverse-strong'] = colors.line.inverseStrong;
  vars['--color-danger'] = hexToChannels(colors.danger.base);
  vars['--color-danger-soft'] = hexToChannels(colors.danger.soft);
  vars['--color-warning'] = hexToChannels(colors.warning.base);
  vars['--color-warning-ink'] = hexToChannels(colors.warning.ink);
  vars['--color-warning-soft'] = hexToChannels(colors.warning.soft);

  vars['--font-sans'] = typography.sans;
  vars['--font-display'] = typography.display ?? 'var(--font-sans)';
  vars['--font-mono'] = typography.mono;
  vars['--heading-weight'] = String(typography.headingWeight);
  for (const step of TYPE_STEPS) {
    const style = typography.scale[step];
    vars[`--text-${step}`] = style.size;
    vars[`--leading-${step}`] = style.lineHeight;
    vars[`--tracking-${step}`] = style.letterSpacing;
  }

  for (const key of RADIUS_KEYS) vars[`--radius-${key}`] = radius[key];
  for (const key of SHADOW_KEYS) vars[`--shadow-${kebab(key)}`] = shadows[key];

  vars['--space-section'] = spacing.section;
  vars['--space-section-lg'] = spacing.sectionLg;
  vars['--space-gutter'] = spacing.gutter;
  vars['--width-shell'] = spacing.shell;
  vars['--width-shell-wide'] = spacing.shellWide;
  vars['--width-prose'] = spacing.prose;
  vars['--width-prose-lg'] = spacing.proseLg;

  vars['--duration-fast'] = motion.duration.fast;
  vars['--duration-base'] = motion.duration.base;
  vars['--duration-slow'] = motion.duration.slow;
  vars['--duration-slower'] = motion.duration.slower;
  vars['--ease-out-expo'] = motion.ease.outExpo;
  vars['--ease-out-quint'] = motion.ease.outQuint;
  vars['--ease-in-out-soft'] = motion.ease.inOutSoft;
  vars['--ease-out-back'] = motion.ease.outBack;
  vars['--reveal-scale'] = String(motion.revealScale);

  // Legacy names read by inline SVG and the GSAP timelines.
  vars['--brand-navy'] = hex(colors.navy['800']);
  vars['--brand-navy-bright'] = hex(colors.navy['700']);
  vars['--brand-navy-deep'] = hex(colors.navy['900']);
  vars['--brand-navy-darkest'] = hex(colors.navy['950']);
  vars['--brand-green'] = hex(colors.green['500']);
  vars['--brand-green-light'] = hex(colors.green['300']);
  vars['--brand-green-mid'] = hex(colors.green['400']);
  vars['--brand-green-muted'] = hex(colors.green['700']);
  vars['--brand-green-ink'] = hex(colors.green['800']);
  vars['--surface'] = hex(colors.surface.base);
  vars['--surface-secondary'] = hex(colors.surface.secondary);
  vars['--surface-tertiary'] = hex(colors.surface.tertiary);
  vars['--surface-navy'] = hex(colors.surface.navy);
  vars['--text-primary'] = hex(colors.ink.primary);
  vars['--text-secondary'] = hex(colors.ink.secondary);
  vars['--text-tertiary'] = hex(colors.ink.tertiary);
  vars['--border'] = colors.line.base;
  vars['--border-strong'] = colors.line.strong;
  vars['--danger'] = hex(colors.danger.base);
  vars['--warning'] = hex(colors.warning.base);

  return vars;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/theme/tokens.test.ts`
Expected: PASS (5 describe blocks, all green).

- [ ] **Step 6: Lint, format, commit**

```bash
npx prettier --write src/theme/tokens.ts src/theme/cssVariables.ts src/theme/tokens.test.ts
npm run lint && npm run typecheck
git add src/theme/tokens.ts src/theme/cssVariables.ts src/theme/tokens.test.ts
git commit -m "feat(theme): design tokens as data, with a CSS-variable converter"
```

---

### Task 2: Tailwind and CSS bridge, component touches, baseline verification

**Files:**
- Modify: `tailwind.config.ts` (whole file)
- Modify: `src/styles/index.css` (`:root` block, `h1–h4` rule, reveal distances, `.nav-glass-*` tints, `prefers-contrast` block)
- Modify: `src/components/ui/Button.tsx:11` (`rounded-pill` → `rounded-control`)
- Modify: `src/components/layout/Section.tsx:499` (drop `font-semibold`)
- Modify: `src/lib/cn.ts` (register radius names)
- Scratchpad only (not committed): `css-diff.mjs`

**Interfaces:**
- Consumes: `defaultTokens`, `tokensToCssVariables`, `NAVY_STEPS`, `GREEN_STEPS`, `TYPE_STEPS` from Task 1.
- Produces: utilities `rounded-control`, `rounded-card`, `font-display`; CSS variables on `:root` in production; `process.env.PLAYGROUND` gate for content globs (set in Task 6).

- [ ] **Step 1: Capture the baseline CSS before touching anything**

```bash
npm run build
cp dist/assets/index-*.css "$SCRATCH/baseline.css"   # $SCRATCH = the session scratchpad directory
```

- [ ] **Step 2: Write the CSS-diff script in the scratchpad**

```js
// $SCRATCH/css-diff.mjs — run with: node css-diff.mjs baseline.css bridged.css
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const postcss = require('postcss');

const [baselinePath, bridgedPath] = process.argv.slice(2);
const parse = (p) => postcss.parse(fs.readFileSync(p, 'utf8'));
const baseline = parse(baselinePath);
const bridged = parse(bridgedPath);

const vars = new Map();
bridged.walkRules(':root', (rule) =>
  rule.walkDecls((d) => { if (d.prop.startsWith('--')) vars.set(d.prop, d.value); }),
);

function resolve(value, depth = 0) {
  if (depth > 12) return value;
  return value.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, name, fallback) =>
    vars.has(name) ? resolve(vars.get(name), depth + 1) : (fallback ?? `var(${name})`),
  );
}
function norm(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/,\s*/g, ',')
    .replace(/(^|[^\d])0\.(\d)/g, '$1.$2')
    .replace(/#[0-9a-f]{6}\b/gi, (m) => m.toLowerCase())
    .trim();
}
function index(root, doResolve) {
  const map = new Map();
  root.walkRules((rule) => {
    const parent = rule.parent;
    if (parent?.type === 'atrule' && parent.name === 'keyframes') return;
    const media = parent?.type === 'atrule' ? `@${parent.name} ${parent.params} ` : '';
    const key = media + rule.selector;
    const decls = [];
    rule.walkDecls((d) => {
      if (rule.selector === ':root' && d.prop.startsWith('--')) return;
      decls.push(`${d.prop}:${norm(doResolve ? resolve(d.value) : d.value)}`);
    });
    map.set(key, (map.get(key) ?? []).concat(decls).sort());
  });
  return map;
}

const a = index(baseline, false);
const b = index(bridged, true);
let problems = 0;
for (const [key, decls] of a) {
  const other = b.get(key);
  if (!other) { console.log(`MISSING in bridged: ${key}`); problems++; continue; }
  if (decls.join(';') !== other.join(';')) {
    console.log(`DIFF ${key}\n  baseline: ${decls.join('; ')}\n  bridged:  ${other.join('; ')}`);
    problems++;
  }
}
for (const key of b.keys()) if (!a.has(key)) console.log(`ONLY in bridged: ${key}`);
console.log(problems === 0 ? 'No differences in resolved values.' : `${problems} difference(s).`);
```

Permitted output: `ONLY in bridged` for `.rounded-control` (used by `Button`); one `DIFF` on `h1,h2,h3,h4` where the bridged side adds `font-family:'inter variable',…` equal to the body stack. Anything else is a bug to fix before committing.

- [ ] **Step 3: Rewrite `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

import { tokensToCssVariables } from './src/theme/cssVariables';
import { defaultTokens, GREEN_STEPS, NAVY_STEPS, TYPE_STEPS } from './src/theme/tokens';

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
 *   ink.primary 18.2:1 · ink.secondary 6.5:1 · ink.tertiary 3.4:1 (large text only)
 *   green.800 6.1:1 · green.500 1.5:1 (graphics only on white; 11.8:1 on navy.900)
 */

/** Every integer 0–100, because the stock opacity scale drops `bg-white/96` silently. */
const fineOpacity = Object.fromEntries(
  Array.from({ length: 101 }, (_, value) => [String(value), String(value / 100)]),
);

const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const steps = (family: string, list: readonly string[]) =>
  Object.fromEntries(list.map((step) => [step, channel(`color-${family}-${step}`)]));

/** The playground is scanned only when vite.config.ts says it is being served or built. */
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
        spring: 'var(--ease-spring)',
        'spring-sheet': 'var(--ease-spring-sheet)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        'press-in': 'var(--duration-press-in)',
        'press-out': 'var(--duration-press-out)',
        spring: 'var(--duration-spring)',
        'spring-snappy': 'var(--duration-spring-snappy)',
        'spring-sheet': 'var(--duration-spring-sheet)',
      },
      keyframes: { /* unchanged: node-pulse, route-dash, sheen-sweep, float-soft, fade-rise, scroll-hint */ },
      animation: { /* unchanged */ },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({ ':root': tokensToCssVariables(defaultTokens) });
    }),
  ],
};

export default config;
```

Copy the existing `keyframes` and `animation` objects verbatim into the two placeholders above; they are not shown here only to keep this step readable.

- [ ] **Step 4: Edit `src/styles/index.css`**

In the `:root` block, delete the Brand, Surfaces, Text, Lines & status and Motion (`--ease-out-*`, `--ease-in-out-soft`, `--duration-fast|base|slow|slower`) declarations — the plugin now emits them. Keep the press durations, the springs, `--nav-height`, `--nav-edge-fade`, `--signal-step`, `--hero-intro`. Change:

```css
    color-scheme: var(--color-scheme);
```

Replace the heading rule:

```css
  h1,
  h2,
  h3,
  h4 {
    @apply text-ink-primary;
    font-family: var(--font-display);
    font-weight: var(--heading-weight);
    text-wrap: balance;
  }
```

Glass tints read the tokens (resolved values unchanged):

```css
  .nav-glass-light {
    --nav-glass-tint: rgb(var(--color-surface) / 0.82);
  }

  .nav-glass-dark {
    --nav-glass-tint: rgb(var(--color-navy-950) / 0.55);
  }
```

Reveal travel scales with the token. Every literal distance in the reveal system becomes a `calc()`:

```css
  .motion-ready [data-reveal][data-visible='false'] {
    opacity: 0;
    transform: translate3d(0, calc(1.25rem * var(--reveal-scale)), 0);
  }
  .motion-ready [data-reveal='scale'][data-visible='false'] {
    transform: translate3d(0, calc(1.75rem * var(--reveal-scale)), 0) scale(0.975);
  }
  .motion-ready [data-reveal-stagger][data-visible='false'] > * {
    opacity: 0;
    transform: translate3d(0, calc(1.25rem * var(--reveal-scale)), 0);
  }
  /* inside @media (max-width: 1023px) */
    .motion-ready [data-reveal][data-visible='false'],
    .motion-ready [data-reveal-stagger][data-visible='false'] > * {
      transform: translate3d(0, calc(0.75rem * var(--reveal-scale)), 0);
    }
    .motion-ready [data-reveal='scale'][data-visible='false'] {
      transform: translate3d(0, calc(1rem * var(--reveal-scale)), 0) scale(0.985);
    }
```

Replace the whole `@media (prefers-contrast: more)` block with:

```css
@media (prefers-contrast: more) {
  :root {
    /* #354964 and #4F6485: 9.2:1 and 6.0:1 against white. */
    --color-ink-secondary: 53 73 100;
    --color-ink-tertiary: 79 100 133;
    --color-line: rgb(6 42 94 / 0.38);
    --color-line-strong: rgb(6 42 94 / 0.62);
    --text-secondary: #354964;
    --text-tertiary: #4f6485;
    --border: rgb(6 42 94 / 0.38);
    --border-strong: rgb(6 42 94 / 0.62);
  }

  .nav-glass-light {
    --nav-glass-tint: var(--surface);
  }

  .nav-glass-dark {
    --nav-glass-tint: var(--brand-navy-darkest);
  }

  .nav-glass {
    border-bottom: 1px solid var(--border-strong);
  }

  /* The focus ring is the one thing that must never be subtle. */
  :focus-visible {
    outline-width: 3px;
  }
}
```

Update the token comment at the top of the file to say the custom properties are emitted from `src/theme/tokens.ts` by the Tailwind plugin.

- [ ] **Step 5: Component touches**

`src/components/ui/Button.tsx` — in `base`, replace `rounded-pill` with `rounded-control`.

`src/components/layout/Section.tsx` — in `SectionHeading`, change `'max-w-[20ch] font-semibold'` to `'max-w-[20ch]'`.

`src/lib/cn.ts` — extend the merge config:

```ts
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Custom radius names, so `cn('rounded-control', 'rounded-xl')` resolves.
      borderRadius: ['xs', 'phone', 'pill', 'control', 'card'],
    },
    classGroups: {
      'font-size': [ /* unchanged list */ ],
    },
  },
});
```

- [ ] **Step 6: Build and diff**

```bash
npm run build
cp dist/assets/index-*.css "$SCRATCH/bridged.css"
node "$SCRATCH/css-diff.mjs" "$SCRATCH/baseline.css" "$SCRATCH/bridged.css"
```

Expected: only the permitted lines from Step 2. Fix anything else. Also grep the built CSS for a leaked literal that should now be a variable: `grep -c "#062a5e" dist/assets/index-*.css` should count only the `:root` legacy variables (the logo `#32D583` and ring gradient stops are expected to remain).

- [ ] **Step 7: Run the suite, lint, typecheck**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: all green, 134 + 5 tests.

- [ ] **Step 8: Screenshots if a browser is available**

If `npx playwright --version` works outside the repo (see `scripts/generate-og-image.mjs` for how it was done before), screenshot `/`, `/safety-score`, `/features` at 390 and 1440 from `npm run preview` on both builds and compare. Record the result either way in the progress doc at Task 14.

- [ ] **Step 9: Commit**

```bash
npx prettier --write tailwind.config.ts src/styles/index.css src/lib/cn.ts src/components/ui/Button.tsx src/components/layout/Section.tsx
git add tailwind.config.ts src/styles/index.css src/lib/cn.ts src/components/ui/Button.tsx src/components/layout/Section.tsx
git commit -m "refactor(theme): drive the Tailwind theme from CSS variables with identical defaults"
```

---

### Task 3: Theme model, baseline preset and validator

**Files:**
- Create: `src/theme/config.ts`
- Create: `src/theme/presets/today.ts`
- Create: `src/theme/validate.ts`
- Test: `src/theme/validate.test.ts`

**Interfaces:**
- Consumes: `ThemeTokens`, `defaultTokens`, step constants (Task 1).
- Produces: `ThemeConfig`, `ThemeComponents`, `ThemeMeta`, every `*_STYLES` constant, `CTA_LABEL_MAX = 40`, `SCHEMA_VERSION = 1`, `todayPreset: ThemeConfig`, `parseThemeConfig(input: unknown): ParseResult`, `type ParseResult = { ok: true; config: ThemeConfig; warnings: string[] } | { ok: false; errors: string[] }`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/theme/validate.test.ts
import { describe, expect, it } from 'vitest';

import { todayPreset } from './presets/today';
import { parseThemeConfig } from './validate';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('parseThemeConfig', () => {
  it('accepts the baseline preset and returns an equal config', () => {
    const result = parseThemeConfig(clone(todayPreset));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config).toEqual(todayPreset);
  });

  it('rejects an object with no schemaVersion', () => {
    const result = parseThemeConfig({ foo: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join('\n')).toMatch(/schemaVersion/);
  });

  it('rejects non-objects', () => {
    expect(parseThemeConfig(null).ok).toBe(false);
    expect(parseThemeConfig('{}').ok).toBe(false);
    expect(parseThemeConfig(42).ok).toBe(false);
  });

  it('rejects an unsupported schemaVersion', () => {
    const bad = { ...clone(todayPreset), schemaVersion: 2 };
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toMatch(/schemaVersion.*1/);
  });

  it('names the path of a bad enum value', () => {
    const bad = clone(todayPreset);
    (bad.components.nav as { style: string }).style = 'neon';
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join('\n')).toMatch(/components\.nav\.style/);
  });

  it('rejects a non-hex palette colour', () => {
    const bad = clone(todayPreset);
    bad.tokens.colors.navy['800'] = 'blue';
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join('\n')).toMatch(/tokens\.colors\.navy\.800/);
  });

  it('rejects a line colour that is not an rgb() string', () => {
    const bad = clone(todayPreset);
    bad.tokens.colors.line.base = '#FFFFFF';
    expect(parseThemeConfig(bad).ok).toBe(false);
  });

  it('rejects a CTA label over the limit', () => {
    const bad = clone(todayPreset);
    bad.content.ctaLabel = 'x'.repeat(41);
    expect(parseThemeConfig(bad).ok).toBe(false);
  });

  it('drops unknown keys and warns about them', () => {
    const extra = { ...clone(todayPreset), extra: 1, meta: { ...todayPreset.meta, nope: true } };
    const result = parseThemeConfig(extra);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect('extra' in result.config).toBe(false);
      expect('nope' in result.config.meta).toBe(false);
      expect(result.warnings.join('\n')).toMatch(/extra/);
    }
  });

  it('reports every error, not just the first', () => {
    const bad = clone(todayPreset);
    (bad.layout as { density: string }).density = 'huge';
    (bad.motion as { reveal: string }).reveal = 'spin';
    const result = parseThemeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/theme/validate.test.ts`
Expected: FAIL, cannot resolve `./validate`.

- [ ] **Step 3: Write `src/theme/config.ts`**

```ts
import type { ThemeTokens } from './tokens';

export const BUTTON_SHAPES = ['pill', 'rounded', 'square'] as const;
export const BUTTON_PRIMARIES = ['navy', 'green', 'gradient', 'outline'] as const;
export const BUTTON_HOVERS = ['route-sheen', 'lift', 'fill', 'none'] as const;
export const CARD_STYLES = ['outlined', 'elevated', 'flat', 'glass', 'navy'] as const;
export const NAV_STYLES = ['glass', 'solid', 'floating-pill', 'minimal', 'dark'] as const;
export const HERO_LAYOUTS = ['split-phone', 'centered', 'immersive-dark', 'editorial', 'map-first'] as const;
export const CTA_STYLES = ['shield-arrival', 'navy-band', 'gradient-band', 'minimal'] as const;
export const FOOTER_STYLES = ['navy-columns', 'light-compact', 'dark-big-logo'] as const;
export const FEATURE_LAYOUTS = ['bento', 'three-column', 'list', 'alternating'] as const;
export const STATS_STYLES = ['inline', 'tiles', 'ring'] as const;
export const BADGE_STYLES = ['soft', 'outline', 'solid'] as const;
export const ROUTE_OPTION_STYLES = ['segmented', 'cards', 'list'] as const;
export const MAP_TONES = ['light', 'night'] as const;
export const ROUTE_STROKES = ['cased', 'solid', 'dashed'] as const;
export const ICON_STYLES = ['outline', 'filled-tile', 'duotone'] as const;
export const ICON_STROKES = [1.5, 2, 2.5] as const;
export const TESTIMONIAL_STYLES = ['cards', 'single-quote', 'hidden'] as const;
export const DENSITIES = ['compact', 'comfortable', 'airy'] as const;
export const CONTENT_WIDTHS = ['narrow', 'default', 'wide'] as const;
export const DIVIDERS = ['none', 'hairline', 'tonal'] as const;
export const MOTION_INTENSITIES = ['none', 'subtle', 'standard', 'expressive'] as const;
export const REVEAL_STYLES = ['rise', 'fade', 'mask', 'scale'] as const;
export const HEADLINES = ['default', 'benefit', 'direct', 'question'] as const;
export const TONES = ['calm', 'confident', 'urgent'] as const;
export const CTA_LABEL_MAX = 40;
export const SCHEMA_VERSION = 1;

type Of<T extends readonly unknown[]> = T[number];

export type ThemeComponents = {
  button: { shape: Of<typeof BUTTON_SHAPES>; primary: Of<typeof BUTTON_PRIMARIES>; hover: Of<typeof BUTTON_HOVERS> };
  card: { style: Of<typeof CARD_STYLES> };
  nav: { style: Of<typeof NAV_STYLES> };
  hero: { layout: Of<typeof HERO_LAYOUTS> };
  cta: { style: Of<typeof CTA_STYLES> };
  footer: { style: Of<typeof FOOTER_STYLES> };
  features: { layout: Of<typeof FEATURE_LAYOUTS> };
  stats: { style: Of<typeof STATS_STYLES> };
  badge: { style: Of<typeof BADGE_STYLES> };
  routeOptions: { style: Of<typeof ROUTE_OPTION_STYLES> };
  mapUi: { tone: Of<typeof MAP_TONES>; routeStroke: Of<typeof ROUTE_STROKES> };
  icons: { style: Of<typeof ICON_STYLES>; strokeWidth: Of<typeof ICON_STROKES> };
  testimonial: { style: Of<typeof TESTIMONIAL_STYLES> };
};

export type ThemeMeta = {
  id: string;
  name: string;
  description: string;
  builtIn: boolean;
  basedOn: string | null;
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ThemeConfig = {
  schemaVersion: typeof SCHEMA_VERSION;
  meta: ThemeMeta;
  tokens: ThemeTokens;
  components: ThemeComponents;
  layout: {
    density: Of<typeof DENSITIES>;
    contentWidth: Of<typeof CONTENT_WIDTHS>;
    dividers: Of<typeof DIVIDERS>;
  };
  motion: {
    intensity: Of<typeof MOTION_INTENSITIES>;
    reveal: Of<typeof REVEAL_STYLES>;
    hoverLift: boolean;
  };
  content: {
    headline: Of<typeof HEADLINES>;
    tone: Of<typeof TONES>;
    ctaLabel: string;
  };
};
```

- [ ] **Step 4: Write `src/theme/presets/today.ts`**

```ts
import type { ThemeConfig } from '../config';
import { defaultTokens } from '../tokens';

const AUTHORED = '2026-10-11T00:00:00.000Z';

/** The site exactly as it ships today. Every other preset is measured against this. */
export const todayPreset: ThemeConfig = {
  schemaVersion: 1,
  meta: {
    id: 'today',
    name: 'SafeWalkMaps Today',
    description: 'The current site: white surfaces, logo navy and green, Inter, pill buttons, glass navigation.',
    builtIn: true,
    basedOn: null,
    favourite: false,
    createdAt: AUTHORED,
    updatedAt: AUTHORED,
  },
  tokens: defaultTokens,
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'route-sheen' },
    card: { style: 'outlined' },
    nav: { style: 'glass' },
    hero: { layout: 'split-phone' },
    cta: { style: 'shield-arrival' },
    footer: { style: 'navy-columns' },
    features: { layout: 'bento' },
    stats: { style: 'inline' },
    badge: { style: 'soft' },
    routeOptions: { style: 'segmented' },
    mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2 },
    testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'standard', reveal: 'rise', hoverLift: false },
  content: { headline: 'default', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
};
```

- [ ] **Step 5: Write `src/theme/validate.ts`**

A closure-based validator: each helper records an error with a dotted path and returns a safe fallback so checking continues; `obj()` warns about unknown keys; the returned config is rebuilt from known keys only.

```ts
import {
  BADGE_STYLES, BUTTON_HOVERS, BUTTON_PRIMARIES, BUTTON_SHAPES, CARD_STYLES, CONTENT_WIDTHS,
  CTA_LABEL_MAX, CTA_STYLES, DENSITIES, DIVIDERS, FEATURE_LAYOUTS, FOOTER_STYLES, HEADLINES,
  HERO_LAYOUTS, ICON_STROKES, ICON_STYLES, MAP_TONES, MOTION_INTENSITIES, NAV_STYLES,
  REVEAL_STYLES, ROUTE_OPTION_STYLES, ROUTE_STROKES, SCHEMA_VERSION, STATS_STYLES,
  TESTIMONIAL_STYLES, TONES, type ThemeConfig,
} from './config';
import { GREEN_STEPS, NAVY_STEPS, RADIUS_KEYS, SHADOW_KEYS, TYPE_STEPS } from './tokens';

export type ParseResult =
  | { ok: true; config: ThemeConfig; warnings: string[] }
  | { ok: false; errors: string[] };

const HEX = /^#[0-9a-f]{6}$/i;
const RGB = /^rgba?\(/i;
const HEADING_WEIGHTS = [500, 600, 700, 800] as const;

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

export function parseThemeConfig(input: unknown): ParseResult {
  const errors: string[] = [];
  const warnings = new Set<string>();

  if (!isRec(input)) return { ok: false, errors: ['Expected a JSON object.'] };
  if (input.schemaVersion !== SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [`schemaVersion must be ${SCHEMA_VERSION}; got ${JSON.stringify(input.schemaVersion)}.`],
    };
  }

  const str = (v: unknown, path: string, test?: (s: string) => boolean, hint = ''): string => {
    if (typeof v !== 'string' || (test && !test(v))) {
      errors.push(`${path}: expected a string${hint ? ` (${hint})` : ''}; got ${JSON.stringify(v)}.`);
      return '';
    }
    return v;
  };
  const hex = (v: unknown, path: string) => str(v, path, (s) => HEX.test(s), 'hex colour like #062A5E');
  const rgb = (v: unknown, path: string) => str(v, path, (s) => RGB.test(s), 'rgb(r g b / a) string');
  const bool = (v: unknown, path: string): boolean => {
    if (typeof v !== 'boolean') errors.push(`${path}: expected true or false.`);
    return v === true;
  };
  const num = (v: unknown, path: string, min: number, max: number): number => {
    if (typeof v !== 'number' || Number.isNaN(v) || v < min || v > max) {
      errors.push(`${path}: expected a number between ${min} and ${max}.`);
      return min;
    }
    return v;
  };
  const oneOf = <T extends readonly (string | number)[]>(v: unknown, path: string, allowed: T): T[number] => {
    if (!(allowed as readonly unknown[]).includes(v)) {
      errors.push(`${path}: expected one of ${allowed.map(String).join(', ')}; got ${JSON.stringify(v)}.`);
      return allowed[0] as T[number];
    }
    return v as T[number];
  };
  const obj = (v: unknown, path: string, known: readonly string[]): Rec => {
    if (!isRec(v)) {
      errors.push(`${path}: expected an object.`);
      return {};
    }
    for (const key of Object.keys(v)) if (!known.includes(key)) warnings.add(`${path}.${key}: unknown key dropped.`);
    return v;
  };
  const record = <K extends string>(
    v: unknown, path: string, keys: readonly K[], each: (x: unknown, p: string) => string,
  ): Record<K, string> => {
    const source = obj(v, path, keys);
    return Object.fromEntries(keys.map((k) => [k, each(source[k], `${path}.${k}`)])) as Record<K, string>;
  };

  const root = obj(input, 'config', ['schemaVersion', 'meta', 'tokens', 'components', 'layout', 'motion', 'content']);
  const meta = obj(root.meta, 'meta', ['id', 'name', 'description', 'builtIn', 'basedOn', 'favourite', 'createdAt', 'updatedAt']);
  const tokens = obj(root.tokens, 'tokens', ['colors', 'typography', 'radius', 'shadows', 'spacing', 'motion']);
  const colors = obj(tokens.colors, 'tokens.colors', ['scheme', 'navy', 'green', 'ink', 'surface', 'line', 'danger', 'warning']);
  const typography = obj(tokens.typography, 'tokens.typography', ['sans', 'display', 'mono', 'headingWeight', 'scale']);
  const scaleSource = obj(typography.scale, 'tokens.typography.scale', TYPE_STEPS);
  const spacing = obj(tokens.spacing, 'tokens.spacing', ['section', 'sectionLg', 'gutter', 'shell', 'shellWide', 'prose', 'proseLg']);
  const motionTokens = obj(tokens.motion, 'tokens.motion', ['duration', 'ease', 'revealScale']);
  const components = obj(root.components, 'components', [
    'button', 'card', 'nav', 'hero', 'cta', 'footer', 'features', 'stats', 'badge', 'routeOptions', 'mapUi', 'icons', 'testimonial',
  ]);
  const button = obj(components.button, 'components.button', ['shape', 'primary', 'hover']);
  const card = obj(components.card, 'components.card', ['style']);
  const nav = obj(components.nav, 'components.nav', ['style']);
  const hero = obj(components.hero, 'components.hero', ['layout']);
  const cta = obj(components.cta, 'components.cta', ['style']);
  const footer = obj(components.footer, 'components.footer', ['style']);
  const features = obj(components.features, 'components.features', ['layout']);
  const stats = obj(components.stats, 'components.stats', ['style']);
  const badge = obj(components.badge, 'components.badge', ['style']);
  const routeOptions = obj(components.routeOptions, 'components.routeOptions', ['style']);
  const mapUi = obj(components.mapUi, 'components.mapUi', ['tone', 'routeStroke']);
  const icons = obj(components.icons, 'components.icons', ['style', 'strokeWidth']);
  const testimonial = obj(components.testimonial, 'components.testimonial', ['style']);
  const layout = obj(root.layout, 'layout', ['density', 'contentWidth', 'dividers']);
  const motion = obj(root.motion, 'motion', ['intensity', 'reveal', 'hoverLift']);
  const content = obj(root.content, 'content', ['headline', 'tone', 'ctaLabel']);

  const scale = Object.fromEntries(
    TYPE_STEPS.map((step) => {
      const style = obj(scaleSource[step], `tokens.typography.scale.${step}`, ['size', 'lineHeight', 'letterSpacing']);
      return [step, {
        size: str(style.size, `tokens.typography.scale.${step}.size`),
        lineHeight: str(style.lineHeight, `tokens.typography.scale.${step}.lineHeight`),
        letterSpacing: str(style.letterSpacing, `tokens.typography.scale.${step}.letterSpacing`),
      }];
    }),
  ) as ThemeConfig['tokens']['typography']['scale'];

  const config: ThemeConfig = {
    schemaVersion: SCHEMA_VERSION,
    meta: {
      id: str(meta.id, 'meta.id', (s) => /^[a-z0-9-]+$/.test(s), 'lowercase slug'),
      name: str(meta.name, 'meta.name', (s) => s.trim().length > 0, 'non-empty'),
      description: str(meta.description, 'meta.description'),
      builtIn: bool(meta.builtIn, 'meta.builtIn'),
      basedOn: meta.basedOn === null ? null : str(meta.basedOn, 'meta.basedOn'),
      favourite: bool(meta.favourite, 'meta.favourite'),
      createdAt: str(meta.createdAt, 'meta.createdAt'),
      updatedAt: str(meta.updatedAt, 'meta.updatedAt'),
    },
    tokens: {
      colors: {
        scheme: oneOf(colors.scheme, 'tokens.colors.scheme', ['light', 'dark'] as const),
        navy: record(colors.navy, 'tokens.colors.navy', NAVY_STEPS, hex),
        green: record(colors.green, 'tokens.colors.green', GREEN_STEPS, hex),
        ink: record(colors.ink, 'tokens.colors.ink', ['primary', 'secondary', 'tertiary', 'inverse'] as const, hex),
        surface: record(colors.surface, 'tokens.colors.surface', ['base', 'secondary', 'tertiary', 'navy', 'navySoft'] as const, hex),
        line: record(colors.line, 'tokens.colors.line', ['base', 'strong', 'inverse', 'inverseStrong'] as const, rgb),
        danger: record(colors.danger, 'tokens.colors.danger', ['base', 'soft'] as const, hex),
        warning: record(colors.warning, 'tokens.colors.warning', ['base', 'ink', 'soft'] as const, hex),
      },
      typography: {
        sans: str(typography.sans, 'tokens.typography.sans'),
        display: typography.display === null ? null : str(typography.display, 'tokens.typography.display'),
        mono: str(typography.mono, 'tokens.typography.mono'),
        headingWeight: oneOf(typography.headingWeight, 'tokens.typography.headingWeight', HEADING_WEIGHTS),
        scale,
      },
      radius: record(tokens.radius, 'tokens.radius', RADIUS_KEYS, str),
      shadows: record(tokens.shadows, 'tokens.shadows', SHADOW_KEYS, str),
      spacing: {
        section: str(spacing.section, 'tokens.spacing.section'),
        sectionLg: str(spacing.sectionLg, 'tokens.spacing.sectionLg'),
        gutter: str(spacing.gutter, 'tokens.spacing.gutter'),
        shell: str(spacing.shell, 'tokens.spacing.shell'),
        shellWide: str(spacing.shellWide, 'tokens.spacing.shellWide'),
        prose: str(spacing.prose, 'tokens.spacing.prose'),
        proseLg: str(spacing.proseLg, 'tokens.spacing.proseLg'),
      },
      motion: {
        duration: record(motionTokens.duration, 'tokens.motion.duration', ['fast', 'base', 'slow', 'slower'] as const, str),
        ease: record(motionTokens.ease, 'tokens.motion.ease', ['outExpo', 'outQuint', 'inOutSoft', 'outBack'] as const, str),
        revealScale: num(motionTokens.revealScale, 'tokens.motion.revealScale', 0, 3),
      },
    },
    components: {
      button: {
        shape: oneOf(button.shape, 'components.button.shape', BUTTON_SHAPES),
        primary: oneOf(button.primary, 'components.button.primary', BUTTON_PRIMARIES),
        hover: oneOf(button.hover, 'components.button.hover', BUTTON_HOVERS),
      },
      card: { style: oneOf(card.style, 'components.card.style', CARD_STYLES) },
      nav: { style: oneOf(nav.style, 'components.nav.style', NAV_STYLES) },
      hero: { layout: oneOf(hero.layout, 'components.hero.layout', HERO_LAYOUTS) },
      cta: { style: oneOf(cta.style, 'components.cta.style', CTA_STYLES) },
      footer: { style: oneOf(footer.style, 'components.footer.style', FOOTER_STYLES) },
      features: { layout: oneOf(features.layout, 'components.features.layout', FEATURE_LAYOUTS) },
      stats: { style: oneOf(stats.style, 'components.stats.style', STATS_STYLES) },
      badge: { style: oneOf(badge.style, 'components.badge.style', BADGE_STYLES) },
      routeOptions: { style: oneOf(routeOptions.style, 'components.routeOptions.style', ROUTE_OPTION_STYLES) },
      mapUi: {
        tone: oneOf(mapUi.tone, 'components.mapUi.tone', MAP_TONES),
        routeStroke: oneOf(mapUi.routeStroke, 'components.mapUi.routeStroke', ROUTE_STROKES),
      },
      icons: {
        style: oneOf(icons.style, 'components.icons.style', ICON_STYLES),
        strokeWidth: oneOf(icons.strokeWidth, 'components.icons.strokeWidth', ICON_STROKES),
      },
      testimonial: { style: oneOf(testimonial.style, 'components.testimonial.style', TESTIMONIAL_STYLES) },
    },
    layout: {
      density: oneOf(layout.density, 'layout.density', DENSITIES),
      contentWidth: oneOf(layout.contentWidth, 'layout.contentWidth', CONTENT_WIDTHS),
      dividers: oneOf(layout.dividers, 'layout.dividers', DIVIDERS),
    },
    motion: {
      intensity: oneOf(motion.intensity, 'motion.intensity', MOTION_INTENSITIES),
      reveal: oneOf(motion.reveal, 'motion.reveal', REVEAL_STYLES),
      hoverLift: bool(motion.hoverLift, 'motion.hoverLift'),
    },
    content: {
      headline: oneOf(content.headline, 'content.headline', HEADLINES),
      tone: oneOf(content.tone, 'content.tone', TONES),
      ctaLabel: str(
        content.ctaLabel, 'content.ctaLabel',
        (s) => s.trim().length > 0 && s.length <= CTA_LABEL_MAX, `1–${CTA_LABEL_MAX} characters`,
      ),
    },
  };

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, config, warnings: Array.from(warnings) };
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/theme/validate.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 7: Lint, format, commit**

```bash
npx prettier --write src/theme/config.ts src/theme/presets/today.ts src/theme/validate.ts src/theme/validate.test.ts
npm run lint && npm run typecheck
git add src/theme/config.ts src/theme/presets/today.ts src/theme/validate.ts src/theme/validate.test.ts
git commit -m "feat(theme): ThemeConfig model, baseline preset and a validating parser"
```

---

### Task 4: Exporters and DOM application

**Files:**
- Create: `src/theme/export.ts`
- Create: `src/theme/apply.ts`
- Test: `src/theme/export.test.ts`, `src/theme/apply.test.ts`

**Interfaces:**
- Consumes: `ThemeConfig`, `todayPreset`, `parseThemeConfig`, `tokensToCssVariables`.
- Produces: `toJson(config): string`, `toCss(config): string`, `toTypeScript(config): string`, `exportFileName(config, format: ExportFormat): string`, `type ExportFormat = 'json' | 'css' | 'ts'`, `flattenChoices(config): Array<[string, string]>`, `primaryFamily(stack: string): string`, `applyTheme(root: HTMLElement, config): () => void`, `THEME_DATA_ATTRIBUTES`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/theme/export.test.ts
import { describe, expect, it } from 'vitest';

import { exportFileName, flattenChoices, primaryFamily, toCss, toJson, toTypeScript } from './export';
import { todayPreset } from './presets/today';
import { parseThemeConfig } from './validate';

describe('toJson', () => {
  it('round-trips through the parser', () => {
    const parsed = parseThemeConfig(JSON.parse(toJson(todayPreset)));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.config).toEqual(todayPreset);
  });
});

describe('toCss', () => {
  const css = toCss(todayPreset);
  it('emits a :root block with every variable', () => {
    expect(css).toContain(':root {');
    expect(css).toContain('  --color-navy-800: 6 42 94;');
    expect(css).toContain('  --radius-control: 999px;');
    expect(css).toContain('  --brand-green: #17f58b;');
  });
  it('names the preset and lists the component choices', () => {
    expect(css).toContain('SafeWalkMaps Today');
    expect(css).toContain('components.nav.style: glass');
    expect(css).toContain('layout.density: comfortable');
  });
  it('adds a font note only for a non-Inter family', () => {
    expect(css).not.toMatch(/fontsource/);
    const manrope = {
      ...todayPreset,
      tokens: { ...todayPreset.tokens, typography: { ...todayPreset.tokens.typography, sans: "'Manrope', sans-serif" } },
    };
    expect(toCss(manrope)).toMatch(/@fontsource-variable.*Manrope/);
  });
});

describe('toTypeScript', () => {
  it('is a module exporting a ThemeConfig', () => {
    const ts = toTypeScript(todayPreset);
    expect(ts.startsWith("import type { ThemeConfig } from '../config';")).toBe(true);
    expect(ts).toContain('const theme: ThemeConfig = {');
    expect(ts).toContain('"id": "today"');
    expect(ts.trimEnd().endsWith('export default theme;')).toBe(true);
  });
});

describe('helpers', () => {
  it('builds file names from the id', () => {
    expect(exportFileName(todayPreset, 'json')).toBe('safewalkmaps-theme-today.json');
    expect(exportFileName(todayPreset, 'ts')).toBe('safewalkmaps-theme-today.ts');
  });
  it('extracts the first family of a stack', () => {
    expect(primaryFamily("'Inter Variable', Inter, sans-serif")).toBe('Inter Variable');
    expect(primaryFamily('ui-monospace, Menlo')).toBe('ui-monospace');
  });
  it('flattens every non-token choice', () => {
    const keys = flattenChoices(todayPreset).map(([k]) => k);
    expect(keys).toContain('components.button.shape');
    expect(keys).toContain('motion.hoverLift');
    expect(keys).toContain('content.ctaLabel');
    expect(keys.some((k) => k.startsWith('tokens.'))).toBe(false);
  });
});
```

```ts
// src/theme/apply.test.ts
import { describe, expect, it } from 'vitest';

import { applyTheme } from './apply';
import { todayPreset } from './presets/today';

describe('applyTheme', () => {
  it('writes every variable and the data hooks, and the cleanup removes them', () => {
    const root = document.createElement('div');
    const cleanup = applyTheme(root, todayPreset);
    expect(root.style.getPropertyValue('--color-navy-800')).toBe('6 42 94');
    expect(root.style.getPropertyValue('--font-display')).toBe('var(--font-sans)');
    expect(root.dataset.swmDensity).toBe('comfortable');
    expect(root.dataset.swmDividers).toBe('none');
    expect(root.dataset.swmReveal).toBe('rise');
    expect(root.dataset.swmHoverLift).toBe('false');
    expect(root.dataset.swmScheme).toBe('light');
    cleanup();
    expect(root.style.getPropertyValue('--color-navy-800')).toBe('');
    expect(root.dataset.swmDensity).toBeUndefined();
  });

  it('re-applying overwrites rather than accumulates', () => {
    const root = document.createElement('div');
    applyTheme(root, todayPreset);
    const dark = {
      ...todayPreset,
      tokens: { ...todayPreset.tokens, colors: { ...todayPreset.tokens.colors, scheme: 'dark' as const } },
    };
    applyTheme(root, dark);
    expect(root.style.getPropertyValue('--color-scheme')).toBe('dark');
    expect(root.dataset.swmScheme).toBe('dark');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/theme/export.test.ts src/theme/apply.test.ts`
Expected: FAIL, unresolved imports.

- [ ] **Step 3: Write `src/theme/export.ts`**

```ts
import type { ThemeConfig } from './config';
import { tokensToCssVariables } from './cssVariables';

export type ExportFormat = 'json' | 'css' | 'ts';

export function toJson(config: ThemeConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

/** First family in a CSS font stack, without quotes. */
export function primaryFamily(stack: string): string {
  const first = stack.split(',')[0] ?? '';
  return first.trim().replace(/^['"]|['"]$/g, '');
}

/** Every choice outside `tokens`, as dotted paths — the part of a theme that is ported by hand. */
export function flattenChoices(config: ThemeConfig): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === 'object' && value !== null) {
      for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
      return;
    }
    out.push([path, String(value)]);
  };
  walk(config.components, 'components');
  walk(config.layout, 'layout');
  walk(config.motion, 'motion');
  walk(config.content, 'content');
  return out;
}

export function toCss(config: ThemeConfig): string {
  const vars = tokensToCssVariables(config.tokens);
  const family = primaryFamily(config.tokens.typography.sans);
  const usesInter = /inter/i.test(family);
  const lines: string[] = [
    `/* SafeWalkMaps theme: ${config.meta.name} (${config.meta.id}) */`,
    '/* Generated by the theme playground. Paste into :root, or copy the values into src/theme/tokens.ts. */',
  ];
  if (!usesInter) {
    lines.push(
      `/* Font: this theme uses "${family}". Add its @fontsource-variable package and import it at the top of src/styles/index.css before applying. */`,
    );
  }
  lines.push('', ':root {');
  for (const [name, value] of Object.entries(vars)) lines.push(`  ${name}: ${value};`);
  lines.push('}', '', '/* Component choices, ported by hand (see docs/theme-playground.md):');
  for (const [key, value] of flattenChoices(config)) lines.push(` *   ${key}: ${value}`);
  lines.push(' */', '');
  return lines.join('\n');
}

export function toTypeScript(config: ThemeConfig): string {
  return [
    "import type { ThemeConfig } from '../config';",
    '',
    `/** ${config.meta.name}. Exported from the theme playground. */`,
    `const theme: ThemeConfig = ${JSON.stringify(config, null, 2)};`,
    '',
    'export default theme;',
    '',
  ].join('\n');
}

export function exportFileName(config: ThemeConfig, format: ExportFormat): string {
  return `safewalkmaps-theme-${config.meta.id}.${format}`;
}
```

- [ ] **Step 4: Write `src/theme/apply.ts`**

```ts
import type { ThemeConfig } from './config';
import { tokensToCssVariables } from './cssVariables';

/** `dataset` keys the preview CSS reads for the choices that are not tokens. */
export const THEME_DATA_ATTRIBUTES = [
  'swmDensity', 'swmDividers', 'swmReveal', 'swmHoverLift', 'swmScheme',
] as const;

/**
 * Writes a theme onto an element — normally `document.documentElement` in the
 * preview — and returns a function that removes everything it wrote.
 */
export function applyTheme(root: HTMLElement, config: ThemeConfig): () => void {
  const vars = tokensToCssVariables(config.tokens);
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  root.dataset.swmDensity = config.layout.density;
  root.dataset.swmDividers = config.layout.dividers;
  root.dataset.swmReveal = config.motion.reveal;
  root.dataset.swmHoverLift = String(config.motion.hoverLift);
  root.dataset.swmScheme = config.tokens.colors.scheme;

  return () => {
    for (const name of Object.keys(vars)) root.style.removeProperty(name);
    for (const attribute of THEME_DATA_ATTRIBUTES) delete root.dataset[attribute];
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/theme/export.test.ts src/theme/apply.test.ts`
Expected: PASS.

- [ ] **Step 6: Lint, format, commit**

```bash
npx prettier --write src/theme/export.ts src/theme/apply.ts src/theme/export.test.ts src/theme/apply.test.ts
npm run lint && npm run typecheck
git add src/theme/export.ts src/theme/apply.ts src/theme/export.test.ts src/theme/apply.test.ts
git commit -m "feat(theme): JSON, CSS and TypeScript exporters, and runtime application"
```

---

### Task 5: Colour maths, derived token sets and the preset builder

**Files:**
- Create: `src/theme/color.ts`
- Create: `src/theme/derive.ts`
- Create: `src/theme/build.ts`
- Test: `src/theme/color.test.ts`, `src/theme/derive.test.ts`, `src/theme/build.test.ts`

**Interfaces:**
- Consumes: `ThemeTokens`, `defaultTokens`, step constants, `hexToChannels`; enums from `config.ts`.
- Produces:
  - `color.ts`: `hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `hslToHex`, `mix(a, b, t)`, `relativeLuminance(hex)`, `contrastRatio(a, b)`, `wcagLevel(ratio, largeText?)`, `generateRamp(anchor, family)`, `deriveSemantic(navy, green, scheme)`, `NAVY_LIGHTNESS`, `GREEN_LIGHTNESS`.
  - `derive.ts`: `densitySpacing(density)`, `contentWidthSpacing(width)`, `intensityMotion(intensity)`, `radiusScale(baseRem, shape)`, `shadowSet(level, navy800, navy900, green700)`, `typeScale(name)`, types `ShadowLevel = 'none' | 'soft' | 'medium' | 'dramatic'`, `TypeScaleName = 'compact' | 'default' | 'editorial' | 'display'`.
  - `build.ts`: `buildTokens(options: BuildOptions): ThemeTokens`, `deepMerge`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/theme/color.test.ts
import { describe, expect, it } from 'vitest';

import {
  contrastRatio, deriveSemantic, generateRamp, hexToRgb, hslToHex, mix, rgbToHex, rgbToHsl, wcagLevel,
} from './color';
import { defaultTokens } from './tokens';

describe('conversions', () => {
  it('round-trips hex through rgb', () => {
    expect(rgbToHex(hexToRgb('#062A5E'))).toBe('#062A5E');
    expect(rgbToHex(hexToRgb('#17f58b'))).toBe('#17F58B');
  });
  it('reads the brand navy as a ~215° hue at ~20% lightness', () => {
    const hsl = rgbToHsl(hexToRgb('#062A5E'));
    expect(Math.round(hsl.h)).toBe(215);
    expect(Math.round(hsl.l)).toBe(20);
  });
  it('hslToHex inverts rgbToHsl closely', () => {
    expect(hslToHex(rgbToHsl(hexToRgb('#4A5F7D')))).toBe('#4A5F7D');
  });
  it('mixes in rgb space', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });
});

describe('contrast', () => {
  it('matches the documented palette figures', () => {
    expect(contrastRatio('#06152E', '#FFFFFF')).toBeCloseTo(18.2, 0);
    expect(contrastRatio('#4A5F7D', '#FFFFFF')).toBeCloseTo(6.5, 0);
    expect(contrastRatio('#17F58B', '#031B3D')).toBeCloseTo(11.8, 0);
  });
  it('grades against WCAG 2.1', () => {
    expect(wcagLevel(7.2)).toBe('AAA');
    expect(wcagLevel(4.6)).toBe('AA');
    expect(wcagLevel(3.4)).toBe('Fail');
    expect(wcagLevel(3.4, true)).toBe('AA');
  });
});

describe('generateRamp', () => {
  it('keeps the anchor exactly and gets lighter toward 50', () => {
    const navy = generateRamp('#062A5E', 'navy');
    expect(navy['800']).toBe('#062A5E');
    const l = (hex: string) => rgbToHsl(hexToRgb(hex)).l;
    expect(l(navy['50'])).toBeGreaterThan(l(navy['100']));
    expect(l(navy['100'])).toBeGreaterThan(l(navy['500']));
    expect(l(navy['900'])).toBeGreaterThan(l(navy['950']));
    const green = generateRamp('#17F58B', 'green');
    expect(green['500']).toBe('#17F58B');
    expect(l(green['50'])).toBeGreaterThan(90);
  });
});

describe('deriveSemantic', () => {
  it('produces a light scheme close to today', () => {
    const semantic = deriveSemantic(defaultTokens.colors.navy, defaultTokens.colors.green, 'light');
    expect(semantic.surface.base).toBe('#FFFFFF');
    expect(contrastRatio(semantic.ink.primary, '#FFFFFF')).toBeGreaterThan(15);
    expect(semantic.line.base).toBe('rgb(6 42 94 / 0.09)');
  });
  it('produces dark surfaces for the dark scheme', () => {
    const semantic = deriveSemantic(defaultTokens.colors.navy, defaultTokens.colors.green, 'dark');
    expect(rgbToHsl(hexToRgb(semantic.surface.base)).l).toBeLessThan(12);
    expect(contrastRatio(semantic.ink.primary, semantic.surface.base)).toBeGreaterThan(12);
    expect(semantic.line.base).toBe('rgb(255 255 255 / 0.10)');
  });
});
```

```ts
// src/theme/derive.test.ts
import { describe, expect, it } from 'vitest';

import {
  contentWidthSpacing, densitySpacing, intensityMotion, radiusScale, shadowSet, typeScale,
} from './derive';
import { defaultTokens } from './tokens';

describe('derive', () => {
  it('reproduces today at the default settings', () => {
    expect(densitySpacing('comfortable')).toEqual({
      section: defaultTokens.spacing.section,
      sectionLg: defaultTokens.spacing.sectionLg,
      gutter: defaultTokens.spacing.gutter,
    });
    expect(contentWidthSpacing('default')).toEqual({ shell: '80rem', shellWide: '90rem' });
    expect(intensityMotion('standard')).toEqual(defaultTokens.motion);
    expect(radiusScale(1, 'pill')).toEqual(defaultTokens.radius);
    expect(shadowSet('medium', '#062A5E', '#031B3D', '#0A9159')).toEqual(defaultTokens.shadows);
    expect(typeScale('default')).toEqual(defaultTokens.typography.scale);
  });

  it('shapes buttons from the radius scale', () => {
    expect(radiusScale(0.5, 'rounded').control).toBe(radiusScale(0.5, 'rounded').md);
    expect(radiusScale(0.5, 'square').control).toBe('0.25rem');
    expect(radiusScale(0, 'rounded').lg).toBe('0px');
    expect(radiusScale(0, 'rounded').pill).toBe('999px');
  });

  it('scales shadows by level', () => {
    expect(shadowSet('none', '#062A5E', '#031B3D', '#0A9159').md).toBe('none');
    expect(shadowSet('soft', '#062A5E', '#031B3D', '#0A9159').md).toMatch(/rgb\(6 42 94 \/ 0\.07\)/);
    expect(shadowSet('dramatic', '#062A5E', '#031B3D', '#0A9159').md).toMatch(/36px/);
  });

  it('motion intensity none stops the reveals', () => {
    const none = intensityMotion('none');
    expect(none.revealScale).toBe(0);
    expect(none.duration.base).toBe('0ms');
    expect(intensityMotion('expressive').revealScale).toBeGreaterThan(1);
  });

  it('type scales move the display steps only', () => {
    const display = typeScale('display');
    expect(display['display-xl'].size).not.toBe(defaultTokens.typography.scale['display-xl'].size);
    expect(display.body).toEqual(defaultTokens.typography.scale.body);
    expect(typeScale('compact')['display-xl'].size).toMatch(/^clamp\(2\.15rem/);
  });
});
```

```ts
// src/theme/build.test.ts
import { describe, expect, it } from 'vitest';

import { buildTokens, deepMerge } from './build';
import { hexToRgb, rgbToHsl } from './color';
import { defaultTokens } from './tokens';

describe('buildTokens', () => {
  it('anchors the ramps on the given brand colours', () => {
    const tokens = buildTokens({ navy: '#062A5E', green: '#17F58B' });
    expect(tokens.colors.navy['800']).toBe('#062A5E');
    expect(tokens.colors.green['500']).toBe('#17F58B');
    expect(tokens.shadows).toEqual(defaultTokens.shadows);
    expect(tokens.spacing).toEqual(defaultTokens.spacing);
    expect(tokens.motion).toEqual(defaultTokens.motion);
    expect(tokens.typography.sans).toBe(defaultTokens.typography.sans);
  });

  it('builds a dark scheme', () => {
    const tokens = buildTokens({ navy: '#062A5E', green: '#17F58B', scheme: 'dark' });
    expect(tokens.colors.scheme).toBe('dark');
    expect(rgbToHsl(hexToRgb(tokens.colors.surface.base)).l).toBeLessThan(12);
  });

  it('applies overrides last', () => {
    const tokens = buildTokens({
      navy: '#062A5E', green: '#17F58B',
      overrides: { colors: { ink: { primary: '#0A0A0A' } }, radius: { card: '0px' } },
    });
    expect(tokens.colors.ink.primary).toBe('#0A0A0A');
    expect(tokens.radius.card).toBe('0px');
    expect(tokens.radius.lg).toBe('1rem');
  });

  it('deepMerge leaves untouched branches alone', () => {
    const merged = deepMerge({ a: { b: 1, c: 2 }, d: 3 }, { a: { c: 9 } });
    expect(merged).toEqual({ a: { b: 1, c: 9 }, d: 3 });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/theme/color.test.ts src/theme/derive.test.ts src/theme/build.test.ts`
Expected: FAIL, unresolved imports.

- [ ] **Step 3: Write `src/theme/color.ts`**

```ts
import { hexToChannels } from './cssVariables';
import type { GreenStep, NavyStep, ThemeTokens } from './tokens';

export type Rgb = { r: number; g: number; b: number };
/** h in degrees 0–360, s and l in percent 0–100. */
export type Hsl = { h: number; s: number; l: number };

export function hexToRgb(hex: string): Rgb {
  const [r, g, b] = hexToChannels(hex).split(' ').map(Number) as [number, number, number];
  return { r, g, b };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  const sector = Math.floor(((h % 360) + 360) % 360 / 60);
  const [r1, g1, b1] = (
    [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]] as const
  )[sector] ?? [0, 0, 0];
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl));
}

/** Linear mix of two hex colours in rgb space; t = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
}

export function relativeLuminance(hex: string): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio, to two decimals. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function wcagLevel(ratio: number, largeText = false): 'AAA' | 'AA' | 'Fail' {
  const aa = largeText ? 3 : 4.5;
  const aaa = largeText ? 4.5 : 7;
  if (ratio >= aaa) return 'AAA';
  if (ratio >= aa) return 'AA';
  return 'Fail';
}

/** Lightness targets per step, read off today's palette. The anchor step is kept exactly. */
export const NAVY_LIGHTNESS: Record<NavyStep, number> = {
  '50': 97, '100': 93, '200': 85, '300': 71, '400': 53, '500': 39, '600': 28, '700': 23, '800': 20, '900': 13, '950': 7,
};
export const GREEN_LIGHTNESS: Record<GreenStep, number> = {
  '50': 96, '100': 91, '200': 81, '300': 69, '400': 58, '500': 52, '600': 41, '700': 30, '800': 23, '900': 16,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * A tonal ramp from one anchor colour. Hue is kept, lightness follows the step table
 * (shifted half-way toward the anchor's own lightness so an unusual anchor still gets a
 * usable ramp), and saturation eases off toward the light end so tints stay clean.
 */
export function generateRamp<F extends 'navy' | 'green'>(
  anchor: string, family: F,
): F extends 'navy' ? Record<NavyStep, string> : Record<GreenStep, string> {
  const base = rgbToHsl(hexToRgb(anchor));
  const table: Record<string, number> = family === 'navy' ? NAVY_LIGHTNESS : GREEN_LIGHTNESS;
  const anchorStep = family === 'navy' ? '800' : '500';
  const offset = (base.l - table[anchorStep]!) * 0.5;
  const entries = Object.entries(table).map(([step, target]) => {
    if (step === anchorStep) return [step, rgbToHex(hexToRgb(anchor))];
    const l = clamp(target + offset, 3, 98);
    const s = l > 80 ? base.s * (1 - (l - 80) / 60) : base.s;
    return [step, hslToHex({ h: base.h, s: clamp(s, 8, 100), l })];
  });
  return Object.fromEntries(entries) as never;
}

type Semantic = Pick<ThemeTokens['colors'], 'ink' | 'surface' | 'line'>;

/** Ink, surface and line colours that suit a palette, for either scheme. */
export function deriveSemantic(
  navy: Record<NavyStep, string>, green: Record<GreenStep, string>, scheme: 'light' | 'dark',
): Semantic {
  const h = rgbToHsl(hexToRgb(navy['800'])).h;
  const navyChannels = hexToChannels(navy['800']);
  void green;
  if (scheme === 'light') {
    return {
      ink: {
        primary: hslToHex({ h, s: 77, l: 10 }),
        secondary: hslToHex({ h, s: 26, l: 39 }),
        tertiary: hslToHex({ h, s: 22, l: 56 }),
        inverse: '#FFFFFF',
      },
      surface: {
        base: '#FFFFFF',
        secondary: hslToHex({ h, s: 38, l: 97.5 }),
        tertiary: hslToHex({ h, s: 40, l: 95 }),
        navy: navy['900'],
        navySoft: hslToHex({ h, s: 85, l: 16 }),
      },
      line: {
        base: `rgb(${navyChannels} / 0.09)`,
        strong: `rgb(${navyChannels} / 0.16)`,
        inverse: 'rgb(255 255 255 / 0.12)',
        inverseStrong: 'rgb(255 255 255 / 0.22)',
      },
    };
  }
  return {
    ink: {
      primary: hslToHex({ h, s: 40, l: 97 }),
      secondary: hslToHex({ h, s: 20, l: 76 }),
      tertiary: hslToHex({ h, s: 16, l: 58 }),
      inverse: hslToHex({ h, s: 70, l: 10 }),
    },
    surface: {
      base: hslToHex({ h, s: 60, l: 6 }),
      secondary: hslToHex({ h, s: 50, l: 9 }),
      tertiary: hslToHex({ h, s: 45, l: 13 }),
      navy: navy['900'],
      navySoft: hslToHex({ h, s: 85, l: 16 }),
    },
    line: {
      base: 'rgb(255 255 255 / 0.10)',
      strong: 'rgb(255 255 255 / 0.18)',
      inverse: 'rgb(255 255 255 / 0.12)',
      inverseStrong: 'rgb(255 255 255 / 0.22)',
    },
  };
}
```

- [ ] **Step 4: Write `src/theme/derive.ts`**

```ts
import type { BUTTON_SHAPES, CONTENT_WIDTHS, DENSITIES, MOTION_INTENSITIES } from './config';
import { hexToChannels } from './cssVariables';
import { defaultTokens, SHADOW_KEYS, TYPE_STEPS, type ShadowKey, type ThemeTokens, type TypeStep } from './tokens';

type Density = (typeof DENSITIES)[number];
type ContentWidth = (typeof CONTENT_WIDTHS)[number];
type Intensity = (typeof MOTION_INTENSITIES)[number];
type ButtonShape = (typeof BUTTON_SHAPES)[number];
export type ShadowLevel = 'none' | 'soft' | 'medium' | 'dramatic';
export type TypeScaleName = 'compact' | 'default' | 'editorial' | 'display';

const trim = (n: number) => String(Math.round(n * 10000) / 10000);
const rem = (n: number) => (n === 0 ? '0px' : `${trim(n)}rem`);

export function densitySpacing(density: Density): Pick<ThemeTokens['spacing'], 'section' | 'sectionLg' | 'gutter'> {
  switch (density) {
    case 'compact':
      return { section: 'clamp(3.5rem, 7vh, 6rem)', sectionLg: 'clamp(4.5rem, 9vh, 8rem)', gutter: 'clamp(1rem, 3vw, 2rem)' };
    case 'airy':
      return { section: 'clamp(6.5rem, 14vh, 12rem)', sectionLg: 'clamp(8rem, 18vh, 16rem)', gutter: 'clamp(1.5rem, 5vw, 3rem)' };
    default:
      return { section: defaultTokens.spacing.section, sectionLg: defaultTokens.spacing.sectionLg, gutter: defaultTokens.spacing.gutter };
  }
}

export function contentWidthSpacing(width: ContentWidth): Pick<ThemeTokens['spacing'], 'shell' | 'shellWide'> {
  switch (width) {
    case 'narrow': return { shell: '68rem', shellWide: '80rem' };
    case 'wide': return { shell: '90rem', shellWide: '100rem' };
    default: return { shell: '80rem', shellWide: '90rem' };
  }
}

export function intensityMotion(intensity: Intensity): ThemeTokens['motion'] {
  const ease = defaultTokens.motion.ease;
  switch (intensity) {
    case 'none': return { duration: { fast: '0ms', base: '0ms', slow: '0ms', slower: '0ms' }, ease, revealScale: 0 };
    case 'subtle': return { duration: { fast: '120ms', base: '180ms', slow: '300ms', slower: '480ms' }, ease, revealScale: 0.6 };
    case 'expressive': return { duration: { fast: '180ms', base: '320ms', slow: '560ms', slower: '900ms' }, ease, revealScale: 1.4 };
    default: return defaultTokens.motion;
  }
}

/** The radius scale from one base (today 1rem = `lg`). The phone bezel is a device, so it is fixed. */
export function radiusScale(baseRem: number, shape: ButtonShape): ThemeTokens['radius'] {
  const scale = {
    xs: rem(baseRem * 0.375), sm: rem(baseRem * 0.5), md: rem(baseRem * 0.75), lg: rem(baseRem),
    xl: rem(baseRem * 1.25), '2xl': rem(baseRem * 1.75), '3xl': rem(baseRem * 2.25),
    phone: '2.875rem', pill: '999px',
  };
  const control = shape === 'pill' ? '999px' : shape === 'rounded' ? scale.md : '0.25rem';
  return { ...scale, control, card: scale['2xl'] };
}

type Layer = { y: number; blur: number; spread?: number; alpha: number; color: 'navy' | 'navyDeep' | 'green' | 'white'; inset?: boolean };
const MEDIUM: Record<ShadowKey, Layer[]> = {
  xs: [{ y: 1, blur: 2, alpha: 0.06, color: 'navy' }],
  sm: [{ y: 2, blur: 8, spread: -2, alpha: 0.08, color: 'navy' }, { y: 1, blur: 2, alpha: 0.04, color: 'navy' }],
  md: [{ y: 10, blur: 28, spread: -8, alpha: 0.12, color: 'navy' }, { y: 2, blur: 6, spread: -2, alpha: 0.06, color: 'navy' }],
  lg: [{ y: 26, blur: 60, spread: -18, alpha: 0.16, color: 'navy' }, { y: 6, blur: 16, spread: -8, alpha: 0.08, color: 'navy' }],
  xl: [{ y: 44, blur: 96, spread: -28, alpha: 0.22, color: 'navy' }, { y: 10, blur: 24, spread: -12, alpha: 0.1, color: 'navy' }],
  phone: [{ y: 56, blur: 120, spread: -32, alpha: 0.34, color: 'navyDeep' }, { y: 12, blur: 32, spread: -12, alpha: 0.18, color: 'navyDeep' }],
  phoneSm: [{ y: 28, blur: 64, spread: -22, alpha: 0.3, color: 'navyDeep' }, { y: 6, blur: 18, spread: -8, alpha: 0.14, color: 'navyDeep' }],
  green: [{ y: 12, blur: 32, spread: -10, alpha: 0.42, color: 'green' }],
  greenLg: [{ y: 18, blur: 48, spread: -12, alpha: 0.46, color: 'green' }],
  inset: [{ y: 1, blur: 0, alpha: 0.08, color: 'white', inset: true }],
};
const LEVELS: Record<Exclude<ShadowLevel, 'none'>, { alpha: number; blur: number; y: number }> = {
  soft: { alpha: 0.6, blur: 0.85, y: 0.85 },
  medium: { alpha: 1, blur: 1, y: 1 },
  dramatic: { alpha: 1.35, blur: 1.3, y: 1.2 },
};

/** A complete shadow set tinted from the palette; `medium` reproduces today's strings exactly. */
export function shadowSet(level: ShadowLevel, navy800: string, navy900: string, green700: string): ThemeTokens['shadows'] {
  if (level === 'none') {
    return Object.fromEntries(SHADOW_KEYS.map((key) => [key, 'none'])) as ThemeTokens['shadows'];
  }
  const factor = LEVELS[level];
  const colors = { navy: hexToChannels(navy800), navyDeep: hexToChannels(navy900), green: hexToChannels(green700), white: '255 255 255' };
  const render = (layer: Layer) => {
    const y = layer.inset ? layer.y : Math.round(layer.y * factor.y);
    const blur = layer.inset ? layer.blur : Math.round(layer.blur * factor.blur);
    const alpha = Math.min(0.6, layer.alpha * factor.alpha).toFixed(2);
    const spread = layer.spread === undefined ? '' : ` ${layer.spread}px`;
    return `${layer.inset ? 'inset ' : ''}0 ${y}px ${blur}px${spread} rgb(${colors[layer.color]} / ${alpha})`;
  };
  return Object.fromEntries(
    SHADOW_KEYS.map((key) => [key, MEDIUM[key].map(render).join(', ')]),
  ) as ThemeTokens['shadows'];
}

const scaleClamp = (value: string, factor: number) =>
  value.replace(/(\d*\.?\d+)(rem|vw)/g, (_, n: string, unit: string) => `${trim(Number(n) * factor)}${unit}`);
const adjustEm = (value: string, delta: number) => `${trim((parseFloat(value) || 0) + delta)}em`;
const adjustNumber = (value: string, delta: number, min = 0.9) => trim(Math.max(min, parseFloat(value) + delta));
const DISPLAY_STEPS: TypeStep[] = ['display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm'];

/** Named type scales. Only the display steps move; body copy stays readable at every setting. */
export function typeScale(name: TypeScaleName): ThemeTokens['typography']['scale'] {
  const base = defaultTokens.typography.scale;
  if (name === 'default') return base;
  const factor = name === 'compact' ? 0.86 : name === 'editorial' ? 1.08 : 1.22;
  const leading = name === 'compact' ? 0.04 : name === 'editorial' ? 0.02 : -0.03;
  const tracking = name === 'compact' ? 0 : name === 'editorial' ? 0.01 : -0.01;
  return Object.fromEntries(
    TYPE_STEPS.map((step) => {
      const style = base[step];
      if (!DISPLAY_STEPS.includes(step)) {
        if (name === 'editorial' && (step === 'body' || step === 'body-lg')) {
          return [step, { ...style, lineHeight: '1.7' }];
        }
        return [step, style];
      }
      return [step, {
        size: scaleClamp(style.size, factor),
        lineHeight: adjustNumber(style.lineHeight, leading),
        letterSpacing: adjustEm(style.letterSpacing, tracking),
      }];
    }),
  ) as ThemeTokens['typography']['scale'];
}
```

- [ ] **Step 5: Write `src/theme/build.ts`**

```ts
import type { BUTTON_SHAPES, CONTENT_WIDTHS, DENSITIES, MOTION_INTENSITIES } from './config';
import { deriveSemantic, generateRamp } from './color';
import {
  contentWidthSpacing, densitySpacing, intensityMotion, radiusScale, shadowSet, typeScale,
  type ShadowLevel, type TypeScaleName,
} from './derive';
import { defaultTokens, type HeadingWeight, type ThemeTokens, TYPE_STEPS } from './tokens';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export type BuildOptions = {
  navy: string;
  green: string;
  scheme?: 'light' | 'dark';
  sans?: string;
  display?: string | null;
  mono?: string;
  headingWeight?: HeadingWeight;
  typeScale?: TypeScaleName;
  /** Added to every display step's letter-spacing, in em (negative = tighter). */
  trackingAdjust?: number;
  radiusBase?: number;
  buttonShape?: (typeof BUTTON_SHAPES)[number];
  shadows?: ShadowLevel;
  density?: (typeof DENSITIES)[number];
  contentWidth?: (typeof CONTENT_WIDTHS)[number];
  intensity?: (typeof MOTION_INTENSITIES)[number];
  /** Applied last, over everything derived above. */
  overrides?: DeepPartial<ThemeTokens>;
};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function deepMerge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch) return base;
  if (!isObject(base) || !isObject(patch)) return (patch as T) ?? base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    out[key] = isObject(value) && isObject(out[key]) ? deepMerge(out[key], value as never) : value;
  }
  return out as T;
}

/** Assemble a full token set from a handful of design decisions. Used by the presets and the Colours tab. */
export function buildTokens(options: BuildOptions): ThemeTokens {
  const scheme = options.scheme ?? 'light';
  const navy = generateRamp(options.navy, 'navy');
  const green = generateRamp(options.green, 'green');
  const semantic = deriveSemantic(navy, green, scheme);
  const scale = typeScale(options.typeScale ?? 'default');
  const tracked = options.trackingAdjust
    ? (Object.fromEntries(
        TYPE_STEPS.map((step) => {
          const style = scale[step];
          if (!step.startsWith('display')) return [step, style];
          const em = (parseFloat(style.letterSpacing) || 0) + (options.trackingAdjust ?? 0);
          return [step, { ...style, letterSpacing: `${Math.round(em * 1000) / 1000}em` }];
        }),
      ) as ThemeTokens['typography']['scale'])
    : scale;

  const tokens: ThemeTokens = {
    colors: {
      scheme,
      navy,
      green,
      ...semantic,
      danger: defaultTokens.colors.danger,
      warning: defaultTokens.colors.warning,
    },
    typography: {
      sans: options.sans ?? defaultTokens.typography.sans,
      display: options.display ?? null,
      mono: options.mono ?? defaultTokens.typography.mono,
      headingWeight: options.headingWeight ?? 600,
      scale: tracked,
    },
    radius: radiusScale(options.radiusBase ?? 1, options.buttonShape ?? 'pill'),
    shadows: shadowSet(options.shadows ?? 'medium', navy['800'], navy['900'], green['700']),
    spacing: {
      ...densitySpacing(options.density ?? 'comfortable'),
      ...contentWidthSpacing(options.contentWidth ?? 'default'),
      prose: defaultTokens.spacing.prose,
      proseLg: defaultTokens.spacing.proseLg,
    },
    motion: intensityMotion(options.intensity ?? 'standard'),
  };
  return deepMerge(tokens, options.overrides);
}
```

Note for the `build.test.ts` shadow assertion: `generateRamp('#17F58B','green')['700']` is a generated colour, not `#0A9159`, so the shadow test compares against `shadowSet('medium', navy800, navy900, green700)` of the *generated* ramp — change the first test's shadow line to `expect(tokens.shadows.md).toBe(defaultTokens.shadows.md)` (navy-tinted shadows are exact because the navy ramp keeps `800` and derives `900` from the table) and `expect(tokens.shadows.green).toMatch(/^0 12px 32px -10px rgb\(/)`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/theme/color.test.ts src/theme/derive.test.ts src/theme/build.test.ts`
Expected: PASS. If `generateRamp` navy `900` does not come out as `#031B3D`, the `shadowSet` inside `buildTokens` will differ from the default phone shadow; that is acceptable and the test only pins `md`.

- [ ] **Step 7: Lint, format, commit**

```bash
npx prettier --write src/theme/color.ts src/theme/derive.ts src/theme/build.ts src/theme/color.test.ts src/theme/derive.test.ts src/theme/build.test.ts
npm run lint && npm run typecheck
git add src/theme/color.ts src/theme/derive.ts src/theme/build.ts src/theme/color.test.ts src/theme/derive.test.ts src/theme/build.test.ts
git commit -m "feat(theme): colour maths, derived token sets and a preset builder"
```

---

### Task 6: Playground store — reducer, persistence, provider

**Files:**
- Create: `src/theme/presets/index.ts` (just `today` for now; Task 11 adds the rest)
- Create: `src/playground/protocol.ts` (types only are needed here; the functions are used in Task 7)
- Create: `src/playground/store/types.ts`, `src/playground/store/reducer.ts`, `src/playground/store/persistence.ts`, `src/playground/store/PlaygroundProvider.tsx`
- Test: `src/playground/store/store.test.ts`

**Interfaces:**
- Consumes: `ThemeConfig`, `todayPreset`, `parseThemeConfig`.
- Produces:
  - `protocol.ts`: `PREVIEW_WIDTHS = [390, 768, 1280]`, `PreviewWidth`, `PreviewMode = 'lab' | 'live'`, `LIVE_ROUTES`, `LiveRoute`, `FrameId = 'a' | 'b'`, `ApplyPayload`, `ShellToPreview`, `PreviewToShell`, `isPlaygroundMessage`, `isSameOrigin`, `postToParent`, `postToFrame`, `previewUrl(frameId)`.
  - `store/types.ts`: `PanelTab`, `PlaygroundUi`, `PlaygroundState`, `PlaygroundAction`, `initialUi`, `initialState`.
  - `store/reducer.ts`: `createReducer(builtIns)`, `findPreset(state, builtIns, id)`, `activeConfig(state, builtIns)`, `hasDraft(state)`, `isBuiltInId(builtIns, id)`.
  - `store/persistence.ts`: `type StorageLike`, `safeLocalStorage()`, `loadState(storage, builtIns)`, `saveState(storage, state)`, `STORAGE_KEYS`.
  - `store/PlaygroundProvider.tsx`: `PlaygroundProvider`, `usePlaygroundState`, `useBuiltIns`, `useActiveConfig`, `usePlaygroundActions` (returns `{ select, update, saveAs, duplicate, rename, remove, toggleFavourite, resetToBase, importConfig, setUi }`).
  - `presets/index.ts`: `builtInPresets: readonly ThemeConfig[]`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/playground/store/store.test.ts
import { describe, expect, it } from 'vitest';

import type { ThemeConfig } from '@/theme/config';
import { todayPreset } from '@/theme/presets/today';

import { loadState, saveState, type StorageLike } from './persistence';
import { activeConfig, createReducer, findPreset, hasDraft } from './reducer';
import { initialState, type PlaygroundState } from './types';

const alt: ThemeConfig = {
  ...todayPreset,
  meta: { ...todayPreset.meta, id: 'alt', name: 'Alt' },
  components: { ...todayPreset.components, nav: { style: 'solid' } },
};
const builtIns = [todayPreset, alt];
const reduce = createReducer(builtIns);
const NOW = '2026-10-11T10:00:00.000Z';
const setNav = (style: ThemeConfig['components']['nav']['style']) => (config: ThemeConfig) => ({
  ...config,
  components: { ...config.components, nav: { style } },
});

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('reducer', () => {
  it('editing a built-in creates a draft and leaves the built-in alone', () => {
    const state = reduce(initialState, { type: 'update', updater: setNav('dark'), now: NOW });
    expect(hasDraft(state)).toBe(true);
    expect(activeConfig(state, builtIns).components.nav.style).toBe('dark');
    expect(todayPreset.components.nav.style).toBe('glass');
    expect(state.draft?.meta.updatedAt).toBe(NOW);
  });

  it('saveAs turns the draft into a custom based on the built-in and selects it', () => {
    let state = reduce(initialState, { type: 'update', updater: setNav('dark'), now: NOW });
    state = reduce(state, { type: 'saveAs', name: 'Mine', id: 'custom-abc12345', now: NOW });
    expect(state.customs).toHaveLength(1);
    expect(state.customs[0]?.meta).toMatchObject({ id: 'custom-abc12345', name: 'Mine', builtIn: false, basedOn: 'today' });
    expect(state.activeId).toBe('custom-abc12345');
    expect(hasDraft(state)).toBe(false);
    expect(activeConfig(state, builtIns).components.nav.style).toBe('dark');
  });

  it('editing a custom writes to it directly', () => {
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'update', updater: setNav('minimal'), now: '2026-10-11T11:00:00.000Z' });
    expect(state.customs[0]?.components.nav.style).toBe('minimal');
    expect(state.customs[0]?.meta.updatedAt).toBe('2026-10-11T11:00:00.000Z');
    expect(state.draft).toBeNull();
  });

  it('duplicate copies a preset under a new id and name', () => {
    const state = reduce(initialState, { type: 'duplicate', id: 'alt', newId: 'custom-2', now: NOW });
    expect(state.customs[0]?.meta).toMatchObject({ id: 'custom-2', name: 'Alt copy', basedOn: 'alt', builtIn: false });
    expect(state.customs[0]?.components.nav.style).toBe('solid');
    expect(state.activeId).toBe('custom-2');
  });

  it('rename changes a custom name and ignores blanks and built-ins', () => {
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'rename', id: 'custom-1', name: '  Night  ', now: NOW });
    expect(state.customs[0]?.meta.name).toBe('Night');
    state = reduce(state, { type: 'rename', id: 'custom-1', name: '   ', now: NOW });
    expect(state.customs[0]?.meta.name).toBe('Night');
    expect(reduce(state, { type: 'rename', id: 'today', name: 'X', now: NOW })).toBe(state);
  });

  it('remove deletes a custom and falls back to today when it was active', () => {
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'toggleFavourite', id: 'custom-1' });
    state = reduce(state, { type: 'setUi', ui: { compareId: 'custom-1' } });
    state = reduce(state, { type: 'remove', id: 'custom-1' });
    expect(state.customs).toHaveLength(0);
    expect(state.favourites).toEqual([]);
    expect(state.activeId).toBe('today');
    expect(state.ui.compareId).toBeNull();
  });

  it('toggleFavourite flips the flag and mirrors it onto customs', () => {
    let state = reduce(initialState, { type: 'toggleFavourite', id: 'alt' });
    expect(state.favourites).toEqual(['alt']);
    state = reduce(state, { type: 'toggleFavourite', id: 'alt' });
    expect(state.favourites).toEqual([]);
    state = reduce(state, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'toggleFavourite', id: 'custom-1' });
    expect(state.customs[0]?.meta.favourite).toBe(true);
  });

  it('resetToBase drops a draft, or restores a custom from its base', () => {
    let state = reduce(initialState, { type: 'update', updater: setNav('dark'), now: NOW });
    state = reduce(state, { type: 'resetToBase', id: 'today', now: NOW });
    expect(hasDraft(state)).toBe(false);

    state = reduce(state, { type: 'duplicate', id: 'alt', newId: 'custom-3', now: NOW });
    state = reduce(state, { type: 'update', updater: setNav('dark'), now: NOW });
    state = reduce(state, { type: 'resetToBase', id: 'custom-3', now: NOW });
    expect(state.customs[0]?.components.nav.style).toBe('solid');
    expect(state.customs[0]?.meta.name).toBe('Alt copy');
  });

  it('resetToBase falls back to today when basedOn is unknown', () => {
    const orphan: ThemeConfig = {
      ...alt,
      meta: { ...alt.meta, id: 'custom-9', builtIn: false, basedOn: 'gone' },
    };
    const state: PlaygroundState = { ...initialState, customs: [orphan], activeId: 'custom-9' };
    const next = reduce(state, { type: 'resetToBase', id: 'custom-9', now: NOW });
    expect(next.customs[0]?.components.nav.style).toBe('glass');
  });

  it('import adds a custom with a fresh id and selects it', () => {
    const state = reduce(initialState, { type: 'import', config: alt, id: 'custom-7', now: NOW });
    expect(state.customs[0]?.meta).toMatchObject({ id: 'custom-7', builtIn: false, basedOn: 'alt', createdAt: NOW });
    expect(state.activeId).toBe('custom-7');
  });

  it('findPreset prefers customs and falls back to built-ins', () => {
    const state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    expect(findPreset(state, builtIns, 'custom-1')?.meta.name).toBe('Mine');
    expect(findPreset(state, builtIns, 'alt')?.meta.name).toBe('Alt');
    expect(findPreset(state, builtIns, 'nope')).toBeUndefined();
    expect(activeConfig({ ...state, activeId: 'nope' }, builtIns).meta.id).toBe('today');
  });
});

describe('persistence', () => {
  it('round-trips through storage', () => {
    const storage = memoryStorage();
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'toggleFavourite', id: 'custom-1' });
    state = reduce(state, { type: 'setUi', ui: { width: 390, mode: 'live' } });
    state = reduce(state, { type: 'select', id: 'today' });
    state = reduce(state, { type: 'update', updater: setNav('dark'), now: NOW });
    saveState(storage, state);
    expect(loadState(storage, builtIns)).toEqual(state);
  });

  it('drops customs that no longer parse and resets a missing active id', () => {
    const storage = memoryStorage();
    storage.setItem('swm-playground.v1.customs', JSON.stringify([{ schemaVersion: 1, meta: { id: 'bad' } }]));
    storage.setItem('swm-playground.v1.active', JSON.stringify('bad'));
    const state = loadState(storage, builtIns);
    expect(state.customs).toEqual([]);
    expect(state.activeId).toBe('today');
  });

  it('falls back to memory when storage throws or is missing', () => {
    const broken: StorageLike = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    expect(loadState(broken, builtIns)).toEqual(initialState);
    expect(() => saveState(broken, initialState)).not.toThrow();
    expect(loadState(null, builtIns)).toEqual(initialState);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/playground/store/store.test.ts`
Expected: FAIL, unresolved imports.

- [ ] **Step 3: Write `src/theme/presets/index.ts` and `src/playground/protocol.ts`**

```ts
// src/theme/presets/index.ts
import type { ThemeConfig } from '../config';
import { todayPreset } from './today';

/** Read-only presets, in display order. `today` is always first and is the fallback everywhere. */
export const builtInPresets: readonly ThemeConfig[] = [todayPreset];
```

```ts
// src/playground/protocol.ts
import type { ThemeConfig } from '@/theme/config';

export const PREVIEW_WIDTHS = [390, 768, 1280] as const;
export type PreviewWidth = (typeof PREVIEW_WIDTHS)[number] | 'fluid';
export type PreviewMode = 'lab' | 'live';
export const LIVE_ROUTES = ['/', '/safety-score', '/features', '/about', '/faq'] as const;
export type LiveRoute = (typeof LIVE_ROUTES)[number];
export type FrameId = 'a' | 'b';

export type ApplyPayload = {
  config: ThemeConfig;
  mode: PreviewMode;
  route: LiveRoute;
  labSection: string | null;
};

export type ShellToPreview =
  | { type: 'swm-theme/apply'; payload: ApplyPayload }
  | { type: 'swm-theme/scrollTo'; fraction: number };

export type PreviewToShell =
  | { type: 'swm-theme/ready'; frameId: FrameId }
  | { type: 'swm-theme/scroll'; frameId: FrameId; fraction: number };

export type PlaygroundMessage = ShellToPreview | PreviewToShell;

export function isPlaygroundMessage(data: unknown): data is PlaygroundMessage {
  return (
    typeof data === 'object' && data !== null &&
    typeof (data as { type?: unknown }).type === 'string' &&
    (data as { type: string }).type.startsWith('swm-theme/')
  );
}

export function isSameOrigin(event: MessageEvent): boolean {
  return event.origin === window.location.origin;
}

export function postToParent(message: PreviewToShell): void {
  if (window.parent !== window) window.parent.postMessage(message, window.location.origin);
}

export function postToFrame(frame: HTMLIFrameElement | null, message: ShellToPreview): void {
  frame?.contentWindow?.postMessage(message, window.location.origin);
}

/** The same page, in preview mode, for one frame. Relative, so it works in dev and in dist-playground. */
export function previewUrl(frameId: FrameId): string {
  const url = new URL('playground.html', window.location.href);
  url.searchParams.set('preview', '1');
  url.searchParams.set('frame', frameId);
  return url.toString();
}
```

- [ ] **Step 4: Write `src/playground/store/types.ts`**

```ts
import type { ThemeConfig } from '@/theme/config';

import type { LiveRoute, PreviewMode, PreviewWidth } from '../protocol';

export type PanelTab = 'presets' | 'colours' | 'typography' | 'shape' | 'layout' | 'motion' | 'content';

export type PlaygroundUi = {
  width: PreviewWidth;
  mode: PreviewMode;
  route: LiveRoute;
  compareId: string | null;
  panelTab: PanelTab;
  labSection: string | null;
};

export type PlaygroundState = {
  customs: ThemeConfig[];
  favourites: string[];
  activeId: string;
  /** Unsaved edits to a built-in; only in force while `draft.meta.id === activeId`. */
  draft: ThemeConfig | null;
  ui: PlaygroundUi;
};

export type PlaygroundAction =
  | { type: 'select'; id: string }
  | { type: 'update'; updater: (config: ThemeConfig) => ThemeConfig; now: string }
  | { type: 'saveAs'; name: string; id: string; now: string }
  | { type: 'duplicate'; id: string; newId: string; now: string }
  | { type: 'rename'; id: string; name: string; now: string }
  | { type: 'remove'; id: string }
  | { type: 'toggleFavourite'; id: string }
  | { type: 'resetToBase'; id: string; now: string }
  | { type: 'import'; config: ThemeConfig; id: string; now: string }
  | { type: 'setUi'; ui: Partial<PlaygroundUi> };

export const initialUi: PlaygroundUi = {
  width: 'fluid', mode: 'lab', route: '/', compareId: null, panelTab: 'presets', labSection: null,
};

export const initialState: PlaygroundState = {
  customs: [], favourites: [], activeId: 'today', draft: null, ui: initialUi,
};
```

- [ ] **Step 5: Write `src/playground/store/reducer.ts`**

```ts
import type { ThemeConfig } from '@/theme/config';

import type { PlaygroundAction, PlaygroundState } from './types';

type BuiltIns = readonly ThemeConfig[];

export const isBuiltInId = (builtIns: BuiltIns, id: string) => builtIns.some((p) => p.meta.id === id);

export function findPreset(state: PlaygroundState, builtIns: BuiltIns, id: string): ThemeConfig | undefined {
  return state.customs.find((p) => p.meta.id === id) ?? builtIns.find((p) => p.meta.id === id);
}

export const hasDraft = (state: PlaygroundState) => state.draft !== null && state.draft.meta.id === state.activeId;

/** What the preview should show: the draft when one is in force, else the stored preset, else `today`. */
export function activeConfig(state: PlaygroundState, builtIns: BuiltIns): ThemeConfig {
  if (hasDraft(state) && state.draft) return state.draft;
  return findPreset(state, builtIns, state.activeId) ?? (builtIns[0] as ThemeConfig);
}

const touch = (config: ThemeConfig, now: string): ThemeConfig => ({ ...config, meta: { ...config.meta, updatedAt: now } });

/** Everything except identity: what "reset to base" copies across. */
const body = (c: ThemeConfig) => ({
  tokens: c.tokens, components: c.components, layout: c.layout, motion: c.motion, content: c.content,
});

export function createReducer(builtIns: BuiltIns) {
  const today = builtIns[0] as ThemeConfig;

  return function reduce(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
    switch (action.type) {
      case 'select':
        return { ...state, activeId: action.id };

      case 'update': {
        const current = activeConfig(state, builtIns);
        if (!isBuiltInId(builtIns, state.activeId) && state.customs.some((c) => c.meta.id === state.activeId)) {
          return {
            ...state,
            customs: state.customs.map((c) => (c.meta.id === state.activeId ? touch(action.updater(c), action.now) : c)),
          };
        }
        const next = action.updater(current);
        return { ...state, draft: { ...next, meta: { ...current.meta, updatedAt: action.now } } };
      }

      case 'saveAs': {
        const current = activeConfig(state, builtIns);
        const basedOn = isBuiltInId(builtIns, state.activeId) ? state.activeId : current.meta.basedOn;
        const custom: ThemeConfig = {
          ...current,
          meta: {
            ...current.meta, id: action.id, name: action.name.trim() || current.meta.name, builtIn: false,
            basedOn, favourite: false, createdAt: action.now, updatedAt: action.now,
          },
        };
        return {
          ...state,
          customs: [...state.customs, custom],
          draft: hasDraft(state) ? null : state.draft,
          activeId: action.id,
        };
      }

      case 'duplicate': {
        const source = action.id === state.activeId ? activeConfig(state, builtIns) : findPreset(state, builtIns, action.id);
        if (!source) return state;
        const custom: ThemeConfig = {
          ...source,
          meta: {
            ...source.meta, id: action.newId, name: `${source.meta.name} copy`, builtIn: false,
            basedOn: source.meta.builtIn ? source.meta.id : source.meta.basedOn,
            favourite: false, createdAt: action.now, updatedAt: action.now,
          },
        };
        return { ...state, customs: [...state.customs, custom], activeId: action.newId };
      }

      case 'rename': {
        const name = action.name.trim();
        if (!name || !state.customs.some((c) => c.meta.id === action.id)) return state;
        return {
          ...state,
          customs: state.customs.map((c) =>
            c.meta.id === action.id ? { ...c, meta: { ...c.meta, name, updatedAt: action.now } } : c,
          ),
        };
      }

      case 'remove': {
        if (!state.customs.some((c) => c.meta.id === action.id)) return state;
        return {
          ...state,
          customs: state.customs.filter((c) => c.meta.id !== action.id),
          favourites: state.favourites.filter((id) => id !== action.id),
          activeId: state.activeId === action.id ? today.meta.id : state.activeId,
          ui: { ...state.ui, compareId: state.ui.compareId === action.id ? null : state.ui.compareId },
        };
      }

      case 'toggleFavourite': {
        const on = !state.favourites.includes(action.id);
        return {
          ...state,
          favourites: on ? [...state.favourites, action.id] : state.favourites.filter((id) => id !== action.id),
          customs: state.customs.map((c) =>
            c.meta.id === action.id ? { ...c, meta: { ...c.meta, favourite: on } } : c,
          ),
        };
      }

      case 'resetToBase': {
        if (isBuiltInId(builtIns, action.id)) {
          return state.draft?.meta.id === action.id ? { ...state, draft: null } : state;
        }
        const custom = state.customs.find((c) => c.meta.id === action.id);
        if (!custom) return state;
        const base = builtIns.find((p) => p.meta.id === custom.meta.basedOn) ?? today;
        return {
          ...state,
          customs: state.customs.map((c) =>
            c.meta.id === action.id ? { ...c, ...body(base), meta: { ...c.meta, updatedAt: action.now } } : c,
          ),
        };
      }

      case 'import': {
        const custom: ThemeConfig = {
          ...action.config,
          meta: {
            ...action.config.meta, id: action.id, builtIn: false,
            basedOn: action.config.meta.builtIn ? action.config.meta.id : action.config.meta.basedOn,
            createdAt: action.now, updatedAt: action.now,
          },
        };
        return { ...state, customs: [...state.customs, custom], activeId: action.id };
      }

      case 'setUi':
        return { ...state, ui: { ...state.ui, ...action.ui } };

      default:
        return state;
    }
  };
}
```

- [ ] **Step 6: Write `src/playground/store/persistence.ts`**

```ts
import type { ThemeConfig } from '@/theme/config';
import { parseThemeConfig } from '@/theme/validate';

import { LIVE_ROUTES, PREVIEW_WIDTHS } from '../protocol';
import { initialState, initialUi, type PlaygroundState, type PlaygroundUi } from './types';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const STORAGE_KEYS = {
  customs: 'swm-playground.v1.customs',
  favourites: 'swm-playground.v1.favourites',
  active: 'swm-playground.v1.active',
  draft: 'swm-playground.v1.draft',
  ui: 'swm-playground.v1.ui',
} as const;

/** `window.localStorage`, or null where reading it throws (private mode, blocked storage). */
export function safeLocalStorage(): StorageLike | null {
  try {
    const storage = window.localStorage;
    storage.getItem(STORAGE_KEYS.active);
    return storage;
  } catch {
    return null;
  }
}

function read<T>(storage: StorageLike, key: string): T | undefined {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  return JSON.parse(raw) as T;
}

const parseAll = (value: unknown): ThemeConfig[] =>
  Array.isArray(value)
    ? value.flatMap((item) => { const r = parseThemeConfig(item); return r.ok ? [r.config] : []; })
    : [];

function sanitiseUi(value: unknown): PlaygroundUi {
  const ui = { ...initialUi };
  if (typeof value !== 'object' || value === null) return ui;
  const v = value as Partial<Record<keyof PlaygroundUi, unknown>>;
  if (v.width === 'fluid' || (PREVIEW_WIDTHS as readonly number[]).includes(v.width as number)) ui.width = v.width as PlaygroundUi['width'];
  if (v.mode === 'lab' || v.mode === 'live') ui.mode = v.mode;
  if ((LIVE_ROUTES as readonly string[]).includes(v.route as string)) ui.route = v.route as PlaygroundUi['route'];
  if (typeof v.compareId === 'string') ui.compareId = v.compareId;
  if (typeof v.panelTab === 'string') ui.panelTab = v.panelTab as PlaygroundUi['panelTab'];
  if (typeof v.labSection === 'string') ui.labSection = v.labSection;
  return ui;
}

export function loadState(storage: StorageLike | null, builtIns: readonly ThemeConfig[]): PlaygroundState {
  if (!storage) return initialState;
  try {
    const customs = parseAll(read(storage, STORAGE_KEYS.customs));
    const favouritesRaw = read<unknown>(storage, STORAGE_KEYS.favourites);
    const favourites = Array.isArray(favouritesRaw) ? favouritesRaw.filter((x): x is string => typeof x === 'string') : [];
    const draftRaw = read<unknown>(storage, STORAGE_KEYS.draft);
    const draftParsed = draftRaw === undefined || draftRaw === null ? null : parseThemeConfig(draftRaw);
    const draft = draftParsed && draftParsed.ok ? draftParsed.config : null;
    const activeRaw = read<unknown>(storage, STORAGE_KEYS.active);
    const known = (id: unknown) =>
      typeof id === 'string' && (customs.some((c) => c.meta.id === id) || builtIns.some((p) => p.meta.id === id));
    const activeId = known(activeRaw) ? (activeRaw as string) : initialState.activeId;
    const ui = sanitiseUi(read(storage, STORAGE_KEYS.ui));
    if (ui.compareId && !known(ui.compareId)) ui.compareId = null;
    return { customs, favourites, activeId, draft, ui };
  } catch {
    return initialState;
  }
}

export function saveState(storage: StorageLike | null, state: PlaygroundState): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.customs, JSON.stringify(state.customs));
    storage.setItem(STORAGE_KEYS.favourites, JSON.stringify(state.favourites));
    storage.setItem(STORAGE_KEYS.active, JSON.stringify(state.activeId));
    storage.setItem(STORAGE_KEYS.draft, JSON.stringify(state.draft));
    storage.setItem(STORAGE_KEYS.ui, JSON.stringify(state.ui));
  } catch {
    // Storage is full or blocked; the session carries on in memory.
  }
}
```

- [ ] **Step 7: Write `src/playground/store/PlaygroundProvider.tsx`**

```tsx
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { ThemeConfig } from '@/theme/config';
import { builtInPresets } from '@/theme/presets';

import { loadState, safeLocalStorage, saveState, type StorageLike } from './persistence';
import { activeConfig, createReducer } from './reducer';
import type { PlaygroundAction, PlaygroundState, PlaygroundUi } from './types';

type Store = {
  state: PlaygroundState;
  dispatch: (action: PlaygroundAction) => void;
  builtIns: readonly ThemeConfig[];
};

const StoreContext = createContext<Store | null>(null);

export type PlaygroundProviderProps = {
  children: ReactNode;
  builtIns?: readonly ThemeConfig[];
  /** Injected in tests; defaults to localStorage when it is usable. */
  storage?: StorageLike | null;
};

export function PlaygroundProvider({ children, builtIns = builtInPresets, storage }: PlaygroundProviderProps) {
  const store = useMemo(() => (storage === undefined ? safeLocalStorage() : storage), [storage]);
  const reducer = useMemo(() => createReducer(builtIns), [builtIns]);
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState(store, builtIns));

  useEffect(() => {
    saveState(store, state);
  }, [store, state]);

  const value = useMemo(() => ({ state, dispatch, builtIns }), [state, builtIns]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('usePlayground* must be used inside <PlaygroundProvider>');
  return store;
}

export const usePlaygroundState = () => useStore().state;
export const useBuiltIns = () => useStore().builtIns;
export function useActiveConfig(): ThemeConfig {
  const { state, builtIns } = useStore();
  return activeConfig(state, builtIns);
}

const newId = () => `custom-${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

/** Action creators that supply ids and timestamps, so the reducer stays pure. */
export function usePlaygroundActions() {
  const { dispatch } = useStore();
  return useMemo(
    () => ({
      select: (id: string) => dispatch({ type: 'select', id }),
      update: (updater: (config: ThemeConfig) => ThemeConfig) => dispatch({ type: 'update', updater, now: now() }),
      saveAs: (name: string) => dispatch({ type: 'saveAs', name, id: newId(), now: now() }),
      duplicate: (id: string) => dispatch({ type: 'duplicate', id, newId: newId(), now: now() }),
      rename: (id: string, name: string) => dispatch({ type: 'rename', id, name, now: now() }),
      remove: (id: string) => dispatch({ type: 'remove', id }),
      toggleFavourite: (id: string) => dispatch({ type: 'toggleFavourite', id }),
      resetToBase: (id: string) => dispatch({ type: 'resetToBase', id, now: now() }),
      importConfig: (config: ThemeConfig) => dispatch({ type: 'import', config, id: newId(), now: now() }),
      setUi: (ui: Partial<PlaygroundUi>) => dispatch({ type: 'setUi', ui }),
    }),
    [dispatch],
  );
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run src/playground/store/store.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 9: Lint, format, commit**

```bash
npx prettier --write src/theme/presets/index.ts src/playground/protocol.ts src/playground/store/*.ts src/playground/store/*.tsx
npm run lint && npm run typecheck
git add src/theme/presets/index.ts src/playground/protocol.ts src/playground/store
git commit -m "feat(playground): preset store with drafts, favourites and persistence"
```

---

### Task 7: Playground entry, build isolation, iframe preview and Live site mode

**Files:**
- Create: `playground.html`, `src/playground/main.tsx`, `src/playground/Preview.tsx`, `src/playground/preview/LiveSite.tsx`, `src/playground/lab/Lab.tsx` (stub, filled in Task 9), `src/playground/shell/PreviewFrame.tsx`, `src/playground/shell/TopBar.tsx`, `src/playground/Shell.tsx`, `src/playground/playground.css`
- Modify: `vite.config.ts` (function form, `PLAYGROUND` flag, input/outDir by mode), `package.json` (two scripts), `.gitignore` (`dist-playground/`)
- Test: `src/playground/shell/PreviewFrame.test.tsx`, `src/playground/Preview.test.tsx`

**Interfaces:**
- Consumes: store (Task 6), `applyTheme` (Task 4), `App`, protocol.
- Produces: `Preview({ frameId })`, `LiveSite({ route })`, `Lab({ config, section })` stub, `PreviewFrame({ frameId, payload, width, onScroll?, scrollTo? })`, `TopBar()`, `Shell()`, CSS classes `.pg-shell`, `.pg-topbar`, `.pg-panel`, `.pg-stage`, `.lab-chrome`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/playground/shell/PreviewFrame.test.tsx
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

import type { ApplyPayload } from '../protocol';

vi.mock('../protocol', async () => {
  const actual = await vi.importActual<typeof import('../protocol')>('../protocol');
  return { ...actual, postToFrame: vi.fn() };
});

import { postToFrame } from '../protocol';
import { PreviewFrame } from './PreviewFrame';

const payload: ApplyPayload = { config: todayPreset, mode: 'lab', route: '/', labSection: null };

function ready(frameId: 'a' | 'b') {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', { data: { type: 'swm-theme/ready', frameId }, origin: window.location.origin }),
    );
  });
}

describe('PreviewFrame', () => {
  it('renders an iframe pointing at the preview URL for its frame', () => {
    render(<PreviewFrame frameId="b" payload={payload} width="fluid" />);
    const frame = screen.getByTitle('Preview b');
    expect(frame.getAttribute('src')).toMatch(/playground\.html\?preview=1&frame=b/);
  });

  it('replies to ready with the current config, and re-sends on change', () => {
    const { rerender } = render(<PreviewFrame frameId="a" payload={payload} width="fluid" />);
    expect(postToFrame).not.toHaveBeenCalled();
    ready('a');
    expect(postToFrame).toHaveBeenLastCalledWith(expect.anything(), { type: 'swm-theme/apply', payload });
    const next = { ...payload, mode: 'live' as const };
    rerender(<PreviewFrame frameId="a" payload={next} width="fluid" />);
    expect(postToFrame).toHaveBeenLastCalledWith(expect.anything(), { type: 'swm-theme/apply', payload: next });
  });

  it('ignores ready from another frame and from another origin', () => {
    vi.mocked(postToFrame).mockClear();
    render(<PreviewFrame frameId="a" payload={payload} width="fluid" />);
    ready('b');
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { data: { type: 'swm-theme/ready', frameId: 'a' }, origin: 'https://evil.example' }),
      );
    });
    expect(postToFrame).not.toHaveBeenCalled();
  });

  it('sets a fixed width for a device preset', () => {
    render(<PreviewFrame frameId="a" payload={payload} width={390} />);
    const stage = screen.getByTestId('preview-stage-a');
    expect(stage.style.width).toBe('390px');
  });
});
```

```tsx
// src/playground/Preview.test.tsx
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

vi.mock('./protocol', async () => {
  const actual = await vi.importActual<typeof import('./protocol')>('./protocol');
  return { ...actual, postToParent: vi.fn() };
});

import { Preview } from './Preview';
import { postToParent } from './protocol';

function apply(payload: object) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'swm-theme/apply', payload }, origin: window.location.origin }));
  });
}

describe('Preview', () => {
  it('announces itself and applies the theme it is sent', () => {
    render(<Preview frameId="a" />);
    expect(postToParent).toHaveBeenCalledWith({ type: 'swm-theme/ready', frameId: 'a' });
    const dark = {
      ...todayPreset,
      tokens: { ...todayPreset.tokens, colors: { ...todayPreset.tokens.colors, scheme: 'dark' } },
    };
    apply({ config: dark, mode: 'lab', route: '/', labSection: null });
    expect(document.documentElement.style.getPropertyValue('--color-scheme')).toBe('dark');
    expect(document.documentElement.dataset.swmScheme).toBe('dark');
  });

  it('renders the real site in live mode', () => {
    render(<Preview frameId="a" />);
    apply({ config: todayPreset, mode: 'live', route: '/features', labSection: null });
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/playground`
Expected: the two new files FAIL on unresolved imports; `store.test.ts` still passes.

- [ ] **Step 3: Entry and build isolation**

`playground.html` at the repo root:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>SafeWalkMaps theme playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/playground/main.tsx"></script>
  </body>
</html>
```

`vite.config.ts` (whole file):

```ts
/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ command, mode }) => {
  const playgroundBuild = mode === 'playground';

  // Tailwind's config is loaded by PostCSS inside this same process and reads
  // this flag to decide whether to scan the playground sources. The dev server
  // always serves the playground; `vite build` never includes it unless asked
  // for with `--mode playground`, which also writes to its own directory.
  process.env.PLAYGROUND = command === 'serve' || playgroundBuild ? '1' : '';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': here('./src') },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
    build: {
      target: 'es2020',
      cssTarget: 'safari14',
      sourcemap: false,
      outDir: playgroundBuild ? 'dist-playground' : 'dist',
      rollupOptions: {
        input: here(playgroundBuild ? './playground.html' : './index.html'),
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('react-router') || id.includes('@remix-run')) return 'vendor-router';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) return 'vendor-icons';
            return undefined;
          },
        },
      },
    },
  };
});
```

`package.json` scripts, added after `"preview"`:

```json
    "build:playground": "tsc -b && vite build --mode playground",
    "preview:playground": "vite preview --outDir dist-playground",
```

`.gitignore`, under "Build output": add `dist-playground/`.

- [ ] **Step 4: `src/playground/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/index.css';
import './playground.css';
import { Preview } from './Preview';
import { Shell } from './Shell';

const params = new URLSearchParams(window.location.search);
const isPreview = params.get('preview') === '1';
const frameId = params.get('frame') === 'b' ? 'b' : 'a';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found in playground.html');

createRoot(container).render(
  <StrictMode>{isPreview ? <Preview frameId={frameId} /> : <Shell />}</StrictMode>,
);
```

- [ ] **Step 5: `src/playground/Preview.tsx`, `preview/LiveSite.tsx`, `lab/Lab.tsx` stub**

```tsx
// src/playground/Preview.tsx
import { useEffect, useState } from 'react';

import { applyTheme } from '@/theme/apply';

import { Lab } from './lab/Lab';
import { LiveSite } from './preview/LiveSite';
import { isPlaygroundMessage, isSameOrigin, postToParent, type ApplyPayload, type FrameId } from './protocol';

/**
 * The document inside each preview iframe. It applies whatever the shell sends to
 * <html>, then renders either the component lab or the real site.
 */
export function Preview({ frameId }: { frameId: FrameId }) {
  const [payload, setPayload] = useState<ApplyPayload | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isSameOrigin(event) || !isPlaygroundMessage(event.data)) return;
      if (event.data.type === 'swm-theme/apply') setPayload(event.data.payload);
    };
    window.addEventListener('message', onMessage);
    postToParent({ type: 'swm-theme/ready', frameId });
    return () => window.removeEventListener('message', onMessage);
  }, [frameId]);

  useEffect(() => {
    if (!payload) return undefined;
    return applyTheme(document.documentElement, payload.config);
  }, [payload]);

  if (!payload) return <div className="min-h-screen-dvh" aria-busy="true" />;
  if (payload.mode === 'live') return <LiveSite route={payload.route} />;
  return <Lab config={payload.config} section={payload.labSection} />;
}
```

```tsx
// src/playground/preview/LiveSite.tsx
import { MemoryRouter } from 'react-router-dom';

import { App } from '@/App';

import type { LiveRoute } from '../protocol';

/** The production App, on an in-memory router so navigating inside the frame never leaves the preview. */
export function LiveSite({ route }: { route: LiveRoute }) {
  return (
    <MemoryRouter key={route} initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </MemoryRouter>
  );
}
```

```tsx
// src/playground/lab/Lab.tsx  (stub — Task 9 replaces the body)
import type { ThemeConfig } from '@/theme/config';

export type LabProps = { config: ThemeConfig; section: string | null };

export function Lab({ config }: LabProps) {
  return (
    <main className="shell py-section">
      <p className="lab-chrome">Component lab — {config.meta.name}</p>
    </main>
  );
}
```

- [ ] **Step 6: `src/playground/shell/PreviewFrame.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';

import {
  isPlaygroundMessage, isSameOrigin, postToFrame, previewUrl, type ApplyPayload, type FrameId, type PreviewWidth,
} from '../protocol';

export type PreviewFrameProps = {
  frameId: FrameId;
  payload: ApplyPayload;
  width: PreviewWidth;
  onScroll?: (fraction: number) => void;
  /** Mirrored scroll position from the other frame (compare mode). */
  scrollTo?: number | null;
};

/**
 * One preview iframe. Sends `apply` as soon as the frame says it is ready and again on
 * every change. A fixed device width wider than the stage is scaled down to fit, so the
 * document inside still measures the true width and its breakpoints behave.
 */
export function PreviewFrame({ frameId, payload, width, onScroll, scrollTo }: PreviewFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isSameOrigin(event) || !isPlaygroundMessage(event.data)) return;
      if (!('frameId' in event.data) || event.data.frameId !== frameId) return;
      if (event.data.type === 'swm-theme/ready') setReady(true);
      if (event.data.type === 'swm-theme/scroll') onScroll?.(event.data.fraction);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frameId, onScroll]);

  useEffect(() => {
    if (ready) postToFrame(frameRef.current, { type: 'swm-theme/apply', payload });
  }, [ready, payload]);

  useEffect(() => {
    if (ready && typeof scrollTo === 'number') postToFrame(frameRef.current, { type: 'swm-theme/scrollTo', fraction: scrollTo });
  }, [ready, scrollTo]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const target = width === 'fluid' ? available.width : width;
  const scale = target > 0 && available.width > 0 ? Math.min(1, available.width / target) : 1;
  const left = available.width > 0 ? Math.max(0, (available.width - target * scale) / 2) : 0;

  return (
    <div ref={stageRef} className="pg-stage" data-testid={`preview-${frameId}`}>
      <div
        data-testid={`preview-stage-${frameId}`}
        className="pg-stage-inner"
        style={{
          width: width === 'fluid' ? '100%' : `${width}px`,
          height: scale < 1 && available.height > 0 ? `${available.height / scale}px` : '100%',
          transform: scale < 1 ? `scale(${scale})` : undefined,
          left: width === 'fluid' ? 0 : `${left}px`,
        }}
      >
        <iframe ref={frameRef} title={`Preview ${frameId}`} src={previewUrl(frameId)} className="pg-frame" />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: `src/playground/shell/TopBar.tsx` and `src/playground/Shell.tsx` (minimal; Tasks 8 and 12 extend them)**

```tsx
// src/playground/shell/TopBar.tsx
import { LIVE_ROUTES, PREVIEW_WIDTHS, type LiveRoute, type PreviewWidth } from '../protocol';
import { useActiveConfig, useBuiltIns, usePlaygroundActions, usePlaygroundState } from '../store/PlaygroundProvider';

const WIDTH_LABELS: Record<string, string> = { '390': 'Phone', '768': 'Tablet', '1280': 'Desktop', fluid: 'Fluid' };

export function TopBar() {
  const state = usePlaygroundState();
  const builtIns = useBuiltIns();
  const active = useActiveConfig();
  const actions = usePlaygroundActions();
  const widths: PreviewWidth[] = [...PREVIEW_WIDTHS, 'fluid'];

  return (
    <header className="pg-topbar">
      <div className="pg-topbar-group">
        <label className="pg-label" htmlFor="pg-preset">Preset</label>
        <select
          id="pg-preset"
          className="pg-select"
          value={state.activeId}
          onChange={(event) => actions.select(event.target.value)}
        >
          <optgroup label="Built in">
            {builtIns.map((p) => <option key={p.meta.id} value={p.meta.id}>{p.meta.name}</option>)}
          </optgroup>
          {state.customs.length > 0 && (
            <optgroup label="Mine">
              {state.customs.map((p) => <option key={p.meta.id} value={p.meta.id}>{p.meta.name}</option>)}
            </optgroup>
          )}
        </select>
        <span className="pg-active-name" data-testid="active-name">{active.meta.name}</span>
      </div>

      <div className="pg-topbar-group" role="group" aria-label="Preview width">
        {widths.map((w) => (
          <button
            key={String(w)}
            type="button"
            className="pg-chip"
            aria-pressed={state.ui.width === w}
            onClick={() => actions.setUi({ width: w })}
          >
            {WIDTH_LABELS[String(w)]}
          </button>
        ))}
      </div>

      <div className="pg-topbar-group" role="group" aria-label="Preview mode">
        <button type="button" className="pg-chip" aria-pressed={state.ui.mode === 'lab'} onClick={() => actions.setUi({ mode: 'lab' })}>
          Component lab
        </button>
        <button type="button" className="pg-chip" aria-pressed={state.ui.mode === 'live'} onClick={() => actions.setUi({ mode: 'live' })}>
          Live site
        </button>
        {state.ui.mode === 'live' && (
          <select
            aria-label="Route"
            className="pg-select"
            value={state.ui.route}
            onChange={(event) => actions.setUi({ route: event.target.value as LiveRoute })}
          >
            {LIVE_ROUTES.map((route) => <option key={route} value={route}>{route}</option>)}
          </select>
        )}
      </div>
    </header>
  );
}
```

```tsx
// src/playground/Shell.tsx
import { useMemo } from 'react';

import type { ApplyPayload } from './protocol';
import { PreviewFrame } from './shell/PreviewFrame';
import { TopBar } from './shell/TopBar';
import { PlaygroundProvider, useActiveConfig, usePlaygroundState } from './store/PlaygroundProvider';

function ShellBody() {
  const state = usePlaygroundState();
  const config = useActiveConfig();
  const payload = useMemo<ApplyPayload>(
    () => ({ config, mode: state.ui.mode, route: state.ui.route, labSection: state.ui.labSection }),
    [config, state.ui.mode, state.ui.route, state.ui.labSection],
  );

  return (
    <div className="pg-shell">
      <TopBar />
      <aside className="pg-panel" aria-label="Theme controls">
        {/* Task 8 mounts <Panel/> here. */}
      </aside>
      <section className="pg-previews" aria-label="Preview">
        <PreviewFrame frameId="a" payload={payload} width={state.ui.width} />
      </section>
    </div>
  );
}

export function Shell() {
  return (
    <PlaygroundProvider>
      <ShellBody />
    </PlaygroundProvider>
  );
}
```

- [ ] **Step 8: `src/playground/playground.css`**

Shell chrome is deliberately plain and literal (greys), so it reads the same under every preset in the frames.

```css
/* Shell layout */
.pg-shell { display: grid; grid-template-rows: auto 1fr; grid-template-columns: 340px 1fr; height: 100svh; background: #f4f5f7; color: #111827; font: 14px/1.4 ui-sans-serif, system-ui, sans-serif; }
.pg-topbar { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 1rem 1.5rem; align-items: center; padding: 0.6rem 1rem; background: #fff; border-bottom: 1px solid #e5e7eb; }
.pg-topbar-group { display: flex; align-items: center; gap: 0.4rem; }
.pg-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; }
.pg-select { height: 32px; padding: 0 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; font: inherit; }
.pg-chip { height: 32px; padding: 0 0.75rem; border: 1px solid #d1d5db; border-radius: 999px; background: #fff; font: inherit; cursor: pointer; }
.pg-chip[aria-pressed='true'] { background: #111827; color: #fff; border-color: #111827; }
.pg-active-name { font-weight: 600; margin-left: 0.5rem; }
.pg-panel { overflow: auto; background: #fff; border-right: 1px solid #e5e7eb; }
.pg-previews { position: relative; display: flex; gap: 2px; overflow: hidden; }
.pg-stage { position: relative; flex: 1; overflow: hidden; background: #e5e7eb; }
.pg-stage-inner { position: absolute; top: 0; transform-origin: top left; }
.pg-frame { display: block; width: 100%; height: 100%; border: 0; background: #fff; }
@media (max-width: 1023px) { .pg-shell { grid-template-columns: 1fr; grid-template-rows: auto auto 1fr; } .pg-panel { max-height: 40svh; border-right: 0; border-bottom: 1px solid #e5e7eb; } }

/* Lab chrome — captions above each composition, never themed */
.lab-chrome { display: inline-flex; gap: 0.5rem; align-items: baseline; margin: 0 0 0.75rem; padding: 0.2rem 0.6rem; border: 1px solid #e5e7eb; border-radius: 4px; background: #f3f4f6; color: #6b7280; font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.02em; }
```

Task 9 appends the variant hooks (`[data-swm-dividers]`, `[data-swm-reveal]`, `[data-swm-hover-lift]`, `[data-route-stroke]`) to this file.

- [ ] **Step 9: Run tests, lint, typecheck, both builds**

```bash
npm run lint && npm run typecheck && npm run test
npm run build
ls dist/assets | grep -i playground && echo "LEAK" || echo "production clean"
grep -c "pg-shell" dist/assets/index-*.css   # expected 0
npm run build:playground
ls dist-playground/playground.html
```

Expected: all green; no playground asset in `dist`; `dist-playground/playground.html` exists. Then `npm run dev` and open `http://localhost:5173/playground.html`: the preset select shows "SafeWalkMaps Today", switching to Live site renders the home page inside the frame, the width chips resize it.

- [ ] **Step 10: Commit**

```bash
npx prettier --write playground.html vite.config.ts src/playground/*.tsx src/playground/**/*.tsx src/playground/playground.css
git add playground.html vite.config.ts package.json .gitignore src/playground
git commit -m "feat(playground): second Vite entry with an iframe preview and Live site mode"
```

---

### Task 8: Fonts, copy variants and the control panel

**Files:**
- Create: `src/playground/fonts.ts`, `src/playground/content.ts`, `src/playground/panel/updaters.ts`, `src/playground/panel/controls.tsx`, `src/playground/panel/Panel.tsx`, `src/playground/panel/ColoursTab.tsx`, `src/playground/panel/TypographyTab.tsx`, `src/playground/panel/ShapeTab.tsx`, `src/playground/panel/LayoutTab.tsx`, `src/playground/panel/MotionTab.tsx`, `src/playground/panel/ContentTab.tsx`
- Modify: `src/playground/Shell.tsx` (mount `<Panel/>`), `src/playground/Preview.tsx` (load fonts, reduced-motion attribute), `src/playground/protocol.ts` (`reducedMotion` in `ApplyPayload`), `src/playground/store/types.ts` (`reducedMotion` in `PlaygroundUi`), `src/playground/playground.css` (panel styles, reduced-motion emulation)
- Test: `src/playground/fonts.test.ts`, `src/playground/panel/Panel.test.tsx`

**Interfaces:**
- Consumes: store hooks, `generateRamp`, `deriveSemantic`, `contrastRatio`, `wcagLevel`, `typeScale`, `radiusScale`, `shadowSet`, `densitySpacing`, `contentWidthSpacing`, `intensityMotion`, `deepMerge`, enums from `config.ts`.
- Produces:
  - `fonts.ts`: `FontOption`, `fontOptions`, `findFontOption(stack)`, `ensureFontLoaded(doc, stack)`, `loadThemeFonts(doc, typography)`.
  - `content.ts`: `headlines`, `toneCaptions`, `PLACEHOLDER_TESTIMONIAL`, `labStats`.
  - `updaters.ts`: `setTokens(patch)`, `setComponents(patch)`, `setLayout(patch)`, `setMotion(patch)`, `setContent(patch)` — each returns `(config) => config`.
  - `controls.tsx`: `Field`, `SegmentedChoice`, `ColorField`, `RangeField`, `SelectField`, `ToggleField`, `TextInput`.
  - `Panel.tsx`: `Panel()`, `PANEL_TABS`.
  - `ApplyPayload.reducedMotion: boolean`; `PlaygroundUi.reducedMotion: boolean` (default `false`).

- [ ] **Step 1: Write the failing tests**

```ts
// src/playground/fonts.test.ts
import { describe, expect, it } from 'vitest';

import { defaultTokens } from '@/theme/tokens';

import { ensureFontLoaded, findFontOption, fontOptions } from './fonts';

describe('fonts', () => {
  it('matches a stack to its option by first family', () => {
    expect(findFontOption("'Manrope', sans-serif")?.id).toBe('manrope');
    expect(findFontOption(defaultTokens.typography.sans)?.id).toBe('inter');
    expect(findFontOption("'Comic Neue', cursive")).toBeUndefined();
  });

  it('injects a Google Fonts link once for a hosted family', () => {
    const doc = document.implementation.createHTMLDocument('x');
    ensureFontLoaded(doc, "'Manrope', sans-serif");
    ensureFontLoaded(doc, "'Manrope', sans-serif");
    const links = doc.querySelectorAll('link[rel="stylesheet"]');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('href')).toMatch(/fonts\.googleapis\.com\/css2\?family=Manrope/);
  });

  it('ignores stacks with no matching option and bundled families', () => {
    const doc = document.implementation.createHTMLDocument('x');
    ensureFontLoaded(doc, "'Comic Neue', cursive");
    ensureFontLoaded(doc, defaultTokens.typography.sans);
    ensureFontLoaded(doc, null);
    expect(doc.querySelectorAll('link')).toHaveLength(0);
  });

  it('every hosted option has a css2 URL with display=swap', () => {
    for (const option of fontOptions) {
      if (option.googleCss) expect(option.googleCss).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?family=.+&display=swap$/);
    }
  });
});
```

```tsx
// src/playground/panel/Panel.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlaygroundProvider, useActiveConfig } from '../store/PlaygroundProvider';
import { Panel } from './Panel';

function Probe() {
  const config = useActiveConfig();
  return (
    <output data-testid="probe">
      {config.components.nav.style}|{config.tokens.colors.navy['800']}|{config.layout.density}|{config.tokens.spacing.section}|{config.content.ctaLabel}
    </output>
  );
}

function setup(tab?: string) {
  render(
    <PlaygroundProvider storage={null}>
      <Panel />
      <Probe />
    </PlaygroundProvider>,
  );
  if (tab) fireEvent.click(screen.getByRole('tab', { name: tab }));
}

describe('Panel', () => {
  it('shows every tab', () => {
    setup();
    for (const name of ['Presets', 'Colours', 'Typography', 'Shape', 'Layout', 'Motion', 'Content']) {
      expect(screen.getByRole('tab', { name })).toBeInTheDocument();
    }
  });

  it('changing the brand navy regenerates the ramp around it', () => {
    setup('Colours');
    fireEvent.change(screen.getByLabelText('Brand navy'), { target: { value: '#0a3d66' } });
    expect(screen.getByTestId('probe').textContent).toContain('#0A3D66');
  });

  it('a component select writes the variant', () => {
    setup('Layout');
    fireEvent.change(screen.getByLabelText('Navigation'), { target: { value: 'floating-pill' } });
    expect(screen.getByTestId('probe').textContent).toContain('floating-pill');
  });

  it('density writes both the enum and the spacing tokens', () => {
    setup('Layout');
    fireEvent.click(screen.getByRole('radio', { name: 'Airy' }));
    const text = screen.getByTestId('probe').textContent ?? '';
    expect(text).toContain('airy');
    expect(text).toContain('clamp(6.5rem, 14vh, 12rem)');
  });

  it('the CTA label is capped at 40 characters', () => {
    setup('Content');
    const input = screen.getByLabelText('CTA label') as HTMLInputElement;
    expect(input.maxLength).toBe(40);
    fireEvent.change(input, { target: { value: 'Get the app' } });
    expect(screen.getByTestId('probe').textContent).toContain('Get the app');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/playground/fonts.test.ts src/playground/panel/Panel.test.tsx`
Expected: FAIL, unresolved imports.

- [ ] **Step 3: `src/playground/fonts.ts`**

```ts
import { primaryFamily } from '@/theme/export';
import { defaultTokens, type ThemeTokens } from '@/theme/tokens';

export type FontRole = 'sans' | 'display' | 'mono';
export type FontOption = {
  id: string;
  label: string;
  stack: string;
  /** Google Fonts css2 URL, or null for bundled/system families. Requested only inside the playground. */
  googleCss: string | null;
  roles: FontRole[];
};

const google = (family: string, axes: string) =>
  `https://fonts.googleapis.com/css2?family=${family}:${axes}&display=swap`;
const sans = (name: string) => `'${name}', 'Inter Variable', Inter, system-ui, sans-serif`;
const serif = (name: string) => `'${name}', Georgia, 'Times New Roman', serif`;
const mono = (name: string) => `'${name}', ui-monospace, SFMono-Regular, Menlo, monospace`;

export const fontOptions: FontOption[] = [
  { id: 'inter', label: 'Inter (bundled)', stack: defaultTokens.typography.sans, googleCss: null, roles: ['sans', 'display'] },
  { id: 'system', label: 'System (SF Pro / Segoe)', stack: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Helvetica, Arial, sans-serif", googleCss: null, roles: ['sans', 'display'] },
  { id: 'manrope', label: 'Manrope', stack: sans('Manrope'), googleCss: google('Manrope', 'wght@300..800'), roles: ['sans', 'display'] },
  { id: 'plus-jakarta-sans', label: 'Plus Jakarta Sans', stack: sans('Plus Jakarta Sans'), googleCss: google('Plus+Jakarta+Sans', 'wght@300..800'), roles: ['sans', 'display'] },
  { id: 'dm-sans', label: 'DM Sans', stack: sans('DM Sans'), googleCss: google('DM+Sans', 'opsz,wght@9..40,300..800'), roles: ['sans', 'display'] },
  { id: 'space-grotesk', label: 'Space Grotesk', stack: sans('Space Grotesk'), googleCss: google('Space+Grotesk', 'wght@300..700'), roles: ['sans', 'display'] },
  { id: 'instrument-sans', label: 'Instrument Sans', stack: sans('Instrument Sans'), googleCss: google('Instrument+Sans', 'wght@400..700'), roles: ['sans', 'display'] },
  { id: 'geist', label: 'Geist', stack: sans('Geist'), googleCss: google('Geist', 'wght@300..800'), roles: ['sans', 'display'] },
  { id: 'outfit', label: 'Outfit', stack: sans('Outfit'), googleCss: google('Outfit', 'wght@300..800'), roles: ['sans', 'display'] },
  { id: 'sora', label: 'Sora', stack: sans('Sora'), googleCss: google('Sora', 'wght@300..800'), roles: ['sans', 'display'] },
  { id: 'fraunces', label: 'Fraunces (serif)', stack: serif('Fraunces'), googleCss: google('Fraunces', 'opsz,wght@9..144,300..800'), roles: ['display'] },
  { id: 'newsreader', label: 'Newsreader (serif)', stack: serif('Newsreader'), googleCss: google('Newsreader', 'opsz,wght@6..72,300..800'), roles: ['display'] },
  { id: 'jetbrains-mono', label: 'JetBrains Mono', stack: mono('JetBrains Mono'), googleCss: google('JetBrains+Mono', 'wght@400..700'), roles: ['mono'] },
  { id: 'ibm-plex-mono', label: 'IBM Plex Mono', stack: mono('IBM Plex Mono'), googleCss: google('IBM+Plex+Mono', 'wght@400;500;600;700'), roles: ['mono'] },
  { id: 'system-mono', label: 'System mono', stack: defaultTokens.typography.mono, googleCss: null, roles: ['mono'] },
];

export function findFontOption(stack: string | null): FontOption | undefined {
  if (!stack) return undefined;
  const family = primaryFamily(stack).toLowerCase();
  return fontOptions.find((option) => primaryFamily(option.stack).toLowerCase() === family);
}

/** Adds the stylesheet for a hosted family once per document. Unknown and bundled stacks do nothing. */
export function ensureFontLoaded(doc: Document, stack: string | null): void {
  const option = findFontOption(stack);
  if (!option?.googleCss) return;
  const id = `swm-font-${option.id}`;
  if (doc.getElementById(id)) return;
  const link = doc.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = option.googleCss;
  doc.head.appendChild(link);
}

export function loadThemeFonts(doc: Document, typography: ThemeTokens['typography']): void {
  ensureFontLoaded(doc, typography.sans);
  ensureFontLoaded(doc, typography.display);
  ensureFontLoaded(doc, typography.mono);
}
```

- [ ] **Step 4: `src/playground/content.ts`**

Copy stays inside the claims the site already makes. Nothing here adds a capability or a guarantee.

```ts
import type { HEADLINES, TONES } from '@/theme/config';
import { getRoute, saferRouteDelta } from '@/data/city';

export type HeadlineCopy = { line1: string; line2: string; lede: string };

export const headlines: Record<(typeof HEADLINES)[number], HeadlineCopy> = {
  default: {
    line1: 'The safer route.',
    line2: 'Not just the fastest one.',
    lede: 'SafeWalkMaps reads street lighting, recent incident data, foot traffic and community reports, then shows you how the routes you could take actually compare — and why.',
  },
  benefit: {
    line1: 'Know what three extra minutes buy.',
    line2: 'Before you set off.',
    lede: 'SafeWalkMaps compares the routes you could take on lighting, recent incident data, foot traffic and community reports, and shows you the trade.',
  },
  direct: {
    line1: 'Walking directions that explain themselves.',
    line2: 'Lighting. Incidents. Footfall. Reports.',
    lede: 'Every route gets a safety score and the reasons behind it. You still choose.',
  },
  question: {
    line1: 'Which way home tonight?',
    line2: 'Now you can see the difference.',
    lede: 'SafeWalkMaps compares your options on street lighting, recent incident data, foot traffic and community reports, and tells you why each one scored the way it did.',
  },
};

export const toneCaptions: Record<(typeof TONES)[number], string> = {
  calm: 'In beta in London and Sheffield. No spam — one email when it launches.',
  confident: 'In beta in London and Sheffield. One email when it launches.',
  urgent: 'Beta in London and Sheffield. Coming soon on iOS.',
};

/** The only testimonial the playground will ever show. */
export const PLACEHOLDER_TESTIMONIAL = {
  quote: 'Placeholder quote — replace with a real, permissioned testimonial before this section ships.',
  author: 'Name withheld',
  context: 'Placeholder, not a customer',
} as const;

const safer = getRoute('safer');

/** Figures for the Stats composition, all from the illustrative route data. */
export const labStats = [
  { label: 'Safety score', value: safer.safetyScore, suffix: '/100' },
  { label: 'Walk time', value: safer.minutes, suffix: ' min' },
  { label: 'Lowest stretch', value: safer.lowestSegment, suffix: '' },
  { label: 'Data confidence', value: safer.confidencePercent, suffix: '%' },
  { label: 'For a safer route', value: saferRouteDelta, suffix: ' min', prefix: '+' },
] as const;
```

- [ ] **Step 5: `src/playground/panel/updaters.ts`**

```ts
import { deepMerge } from '@/theme/build';
import type { ThemeConfig } from '@/theme/config';
import type { ThemeTokens } from '@/theme/tokens';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
type Updater = (config: ThemeConfig) => ThemeConfig;

export const setTokens = (patch: DeepPartial<ThemeTokens>): Updater => (c) => ({ ...c, tokens: deepMerge(c.tokens, patch) });
export const setComponents = (patch: DeepPartial<ThemeConfig['components']>): Updater => (c) => ({ ...c, components: deepMerge(c.components, patch) });
export const setLayout = (patch: Partial<ThemeConfig['layout']>): Updater => (c) => ({ ...c, layout: { ...c.layout, ...patch } });
export const setMotion = (patch: Partial<ThemeConfig['motion']>): Updater => (c) => ({ ...c, motion: { ...c.motion, ...patch } });
export const setContent = (patch: Partial<ThemeConfig['content']>): Updater => (c) => ({ ...c, content: { ...c.content, ...patch } });
export const compose = (...updaters: Updater[]): Updater => (c) => updaters.reduce((acc, fn) => fn(acc), c);
```

- [ ] **Step 6: `src/playground/panel/controls.tsx`**

Native inputs wrapped with labels. `SegmentedChoice` is a radio group so tests can address options by role `radio`.

```tsx
import { useId, type ReactNode } from 'react';

export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="pg-field">
      <label className="pg-field-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="pg-hint">{hint}</p>}
    </div>
  );
}

export function SegmentedChoice<T extends string | number>({ label, value, options, onChange }: {
  label: string; value: T; options: ReadonlyArray<{ value: T; label: string }>; onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="pg-field">
      <legend className="pg-field-label">{label}</legend>
      <div className="pg-segmented" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <label key={String(option.value)} className="pg-segment" data-selected={option.value === value}>
            <input type="radio" name={name} value={String(option.value)} checked={option.value === value} onChange={() => onChange(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ColorField({ label, value, onChange, hint }: { label: string; value: string; onChange: (hex: string) => void; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="pg-color">
        <input id={id} type="color" value={value.toLowerCase()} onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <code>{value.toUpperCase()}</code>
      </div>
    </Field>
  );
}

export function RangeField({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; format?: (value: number) => string;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <div className="pg-range">
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <code>{format ? format(value) : value}</code>
      </div>
    </Field>
  );
}

export function SelectField<T extends string>({ label, value, options, onChange, hint }: {
  label: string; value: T; options: ReadonlyArray<{ value: T; label: string }>; onChange: (value: T) => void; hint?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} className="pg-select pg-select-block" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  );
}

export function ToggleField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (checked: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input id={id} type="checkbox" role="switch" aria-checked={checked} checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </Field>
  );
}

export function TextInput({ label, value, onChange, maxLength, hint }: { label: string; value: string; onChange: (value: string) => void; maxLength?: number; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input id={id} className="pg-input" type="text" value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}
```

- [ ] **Step 7: The tabs**

`Panel.tsx`:

```tsx
import type { PanelTab } from '../store/types';
import { usePlaygroundActions, usePlaygroundState } from '../store/PlaygroundProvider';
import { ColoursTab } from './ColoursTab';
import { ContentTab } from './ContentTab';
import { LayoutTab } from './LayoutTab';
import { MotionTab } from './MotionTab';
import { PresetsTab } from './PresetsTab';
import { ShapeTab } from './ShapeTab';
import { TypographyTab } from './TypographyTab';

export const PANEL_TABS: ReadonlyArray<{ id: PanelTab; label: string }> = [
  { id: 'presets', label: 'Presets' }, { id: 'colours', label: 'Colours' }, { id: 'typography', label: 'Typography' },
  { id: 'shape', label: 'Shape' }, { id: 'layout', label: 'Layout' }, { id: 'motion', label: 'Motion' }, { id: 'content', label: 'Content' },
];

const tabs: Record<PanelTab, () => JSX.Element> = {
  presets: PresetsTab, colours: ColoursTab, typography: TypographyTab, shape: ShapeTab, layout: LayoutTab, motion: MotionTab, content: ContentTab,
};

export function Panel() {
  const { ui } = usePlaygroundState();
  const { setUi } = usePlaygroundActions();
  const Active = tabs[ui.panelTab] ?? PresetsTab;
  return (
    <div className="pg-panel-inner">
      <div role="tablist" aria-label="Theme controls" className="pg-tabs">
        {PANEL_TABS.map((tab) => (
          <button key={tab.id} role="tab" type="button" aria-selected={ui.panelTab === tab.id} className="pg-tab" onClick={() => setUi({ panelTab: tab.id })}>
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pg-tabpanel"><Active /></div>
    </div>
  );
}
```

Until Task 12 writes `PresetsTab.tsx`, create it as a stub that renders `<p className="pg-hint">Preset management arrives in Task 12.</p>`.

`ColoursTab.tsx`:

```tsx
import { contrastRatio, deriveSemantic, generateRamp, wcagLevel } from '@/theme/color';
import { GREEN_STEPS, NAVY_STEPS } from '@/theme/tokens';

import { useActiveConfig, usePlaygroundActions } from '../store/PlaygroundProvider';
import { ColorField, Field, SegmentedChoice } from './controls';
import { compose, setTokens } from './updaters';

/** Curated pairings; each applies both ramps and re-derives the semantic colours. */
const SWATCHES = [
  { id: 'today', label: 'Logo navy + green', navy: '#062A5E', green: '#17F58B' },
  { id: 'deep-mint', label: 'Deep navy + mint', navy: '#071C3F', green: '#2EDC8C' },
  { id: 'teal-lime', label: 'Teal + lime', navy: '#0A3D66', green: '#9BE564' },
  { id: 'slate-emerald', label: 'Slate + emerald', navy: '#1F2A44', green: '#10B981' },
  { id: 'indigo-spring', label: 'Indigo + spring green', navy: '#1E1B4B', green: '#22E584' },
  { id: 'midnight-neon', label: 'Midnight + neon', navy: '#03112B', green: '#2CFF9A' },
  { id: 'charcoal-green', label: 'Charcoal + green', navy: '#111827', green: '#17F58B' },
  { id: 'forest-sand', label: 'Forest + sand', navy: '#0B3B2E', green: '#E3C27A' },
] as const;

export function ColoursTab() {
  const config = useActiveConfig();
  const { update } = usePlaygroundActions();
  const { colors } = config.tokens;

  const applyPalette = (navyHex: string, greenHex: string, scheme = colors.scheme) => {
    const navy = generateRamp(navyHex, 'navy');
    const green = generateRamp(greenHex, 'green');
    update(setTokens({ colors: { scheme, navy, green, ...deriveSemantic(navy, green, scheme) } }));
  };

  const pairs = [
    ['Body text on surface', colors.ink.primary, colors.surface.base, false],
    ['Secondary text on surface', colors.ink.secondary, colors.surface.base, false],
    ['Tertiary text on surface (large)', colors.ink.tertiary, colors.surface.base, true],
    ['Green text on surface', colors.green['800'], colors.surface.base, false],
    ['Green accent on navy', colors.green['500'], colors.navy['900'], true],
    ['Button label on navy button', '#FFFFFF', colors.navy['800'], false],
  ] as const;

  return (
    <div className="pg-stack">
      <SegmentedChoice
        label="Scheme"
        value={colors.scheme}
        options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
        onChange={(scheme) => applyPalette(colors.navy['800'], colors.green['500'], scheme)}
      />
      <ColorField label="Brand navy" value={colors.navy['800']} hint="Anchors the navy ramp at step 800." onChange={(hex) => update(setTokens({ colors: { navy: generateRamp(hex, 'navy') } }))} />
      <ColorField label="Brand green" value={colors.green['500']} hint="Anchors the green ramp at step 500." onChange={(hex) => update(setTokens({ colors: { green: generateRamp(hex, 'green') } }))} />

      <Field label="Palettes">
        <div className="pg-swatches">
          {SWATCHES.map((s) => (
            <button key={s.id} type="button" className="pg-swatch" onClick={() => applyPalette(s.navy, s.green)} aria-label={s.label} title={s.label}>
              <span style={{ background: s.navy }} /><span style={{ background: s.green }} />
            </button>
          ))}
        </div>
      </Field>

      <details className="pg-details">
        <summary>Edit ramp steps</summary>
        {NAVY_STEPS.map((step) => (
          <ColorField key={step} label={`Navy ${step}`} value={colors.navy[step]} onChange={(hex) => update(setTokens({ colors: { navy: { [step]: hex } } }))} />
        ))}
        {GREEN_STEPS.map((step) => (
          <ColorField key={step} label={`Green ${step}`} value={colors.green[step]} onChange={(hex) => update(setTokens({ colors: { green: { [step]: hex } } }))} />
        ))}
      </details>

      <details className="pg-details" open>
        <summary>Semantic colours</summary>
        <ColorField label="Ink primary" value={colors.ink.primary} onChange={(hex) => update(setTokens({ colors: { ink: { primary: hex } } }))} />
        <ColorField label="Ink secondary" value={colors.ink.secondary} onChange={(hex) => update(setTokens({ colors: { ink: { secondary: hex } } }))} />
        <ColorField label="Ink tertiary" value={colors.ink.tertiary} onChange={(hex) => update(setTokens({ colors: { ink: { tertiary: hex } } }))} />
        <ColorField label="Surface" value={colors.surface.base} onChange={(hex) => update(setTokens({ colors: { surface: { base: hex } } }))} />
        <ColorField label="Surface secondary" value={colors.surface.secondary} onChange={(hex) => update(setTokens({ colors: { surface: { secondary: hex } } }))} />
        <ColorField label="Surface tertiary" value={colors.surface.tertiary} onChange={(hex) => update(setTokens({ colors: { surface: { tertiary: hex } } }))} />
        <ColorField label="Navy surface" value={colors.surface.navy} onChange={(hex) => update(setTokens({ colors: { surface: { navy: hex } } }))} />
        <button type="button" className="pg-button" onClick={() => update(setTokens({ colors: deriveSemantic(colors.navy, colors.green, colors.scheme) }))}>
          Derive from palette
        </button>
      </details>

      <Field label="Contrast (WCAG 2.1)">
        <ul className="pg-contrast">
          {pairs.map(([label, fg, bg, large]) => {
            const ratio = contrastRatio(fg, bg);
            const level = wcagLevel(ratio, large);
            return (
              <li key={label} data-level={level}>
                <span className="pg-contrast-sample" style={{ color: fg, background: bg }}>Aa</span>
                <span>{label}</span>
                <code>{ratio.toFixed(1)}:1 {level}</code>
              </li>
            );
          })}
        </ul>
      </Field>
    </div>
  );
}
```

`TypographyTab.tsx`:

```tsx
import { typeScale, type TypeScaleName } from '@/theme/derive';
import type { HeadingWeight } from '@/theme/tokens';

import { fontOptions } from '../fonts';
import { useActiveConfig, usePlaygroundActions } from '../store/PlaygroundProvider';
import { RangeField, SegmentedChoice, SelectField } from './controls';
import { setTokens } from './updaters';

const SCALES: TypeScaleName[] = ['compact', 'default', 'editorial', 'display'];
const DISPLAY = ['display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm'] as const;

function detectScale(scale: ReturnType<typeof typeScale>): TypeScaleName | 'custom' {
  const sizes = (s: ReturnType<typeof typeScale>) => DISPLAY.map((step) => s[step].size).join('|');
  return SCALES.find((name) => sizes(typeScale(name)) === sizes(scale)) ?? 'custom';
}

export function TypographyTab() {
  const { tokens } = useActiveConfig();
  const { update } = usePlaygroundActions();
  const { typography } = tokens;
  const sansOptions = fontOptions.filter((f) => f.roles.includes('sans')).map((f) => ({ value: f.stack, label: f.label }));
  const displayOptions = [{ value: '__same__', label: 'Same as body' }, ...fontOptions.filter((f) => f.roles.includes('display')).map((f) => ({ value: f.stack, label: f.label }))];
  const monoOptions = fontOptions.filter((f) => f.roles.includes('mono')).map((f) => ({ value: f.stack, label: f.label }));
  const tracking = parseFloat(typography.scale['display-xl'].letterSpacing) || 0;

  return (
    <div className="pg-stack">
      <SelectField label="Body family" value={typography.sans} options={sansOptions} onChange={(sans) => update(setTokens({ typography: { sans } }))} hint="Hosted families load from Google Fonts in the playground only." />
      <SelectField label="Heading family" value={typography.display ?? '__same__'} options={displayOptions} onChange={(v) => update(setTokens({ typography: { display: v === '__same__' ? null : v } }))} />
      <SelectField label="Mono family" value={typography.mono} options={monoOptions} onChange={(mono) => update(setTokens({ typography: { mono } }))} />
      <SegmentedChoice label="Heading weight" value={typography.headingWeight} options={([500, 600, 700, 800] as HeadingWeight[]).map((w) => ({ value: w, label: String(w) }))} onChange={(headingWeight) => update(setTokens({ typography: { headingWeight } }))} />
      <SegmentedChoice
        label="Type scale"
        value={detectScale(typography.scale)}
        options={[...SCALES.map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) })), { value: 'custom' as const, label: 'Custom' }]}
        onChange={(name) => { if (name !== 'custom') update(setTokens({ typography: { scale: typeScale(name) } })); }}
      />
      <RangeField
        label="Display tracking"
        value={tracking}
        min={-0.07} max={0.02} step={0.005}
        format={(v) => `${v.toFixed(3)}em`}
        onChange={(em) => {
          const base = parseFloat(typography.scale['display-xl'].letterSpacing) || 0;
          const delta = em - base;
          const scale = Object.fromEntries(
            DISPLAY.map((step) => [step, { letterSpacing: `${(Math.round(((parseFloat(typography.scale[step].letterSpacing) || 0) + delta) * 1000) / 1000)}em` }]),
          );
          update(setTokens({ typography: { scale } }));
        }}
      />
    </div>
  );
}
```

`ShapeTab.tsx`:

```tsx
import type { BUTTON_SHAPES } from '@/theme/config';
import { radiusScale, shadowSet, type ShadowLevel } from '@/theme/derive';
import { hexToChannels } from '@/theme/cssVariables';

import { useActiveConfig, usePlaygroundActions } from '../store/PlaygroundProvider';
import { RangeField, SegmentedChoice, SelectField } from './controls';
import { compose, setComponents, setTokens } from './updaters';

const LEVELS: ShadowLevel[] = ['none', 'soft', 'medium', 'dramatic'];
const CARD_KEYS = ['md', 'lg', 'xl', '2xl', '3xl'] as const;

export function ShapeTab() {
  const config = useActiveConfig();
  const { update } = usePlaygroundActions();
  const { radius, shadows, colors } = config.tokens;
  const base = radius.lg.endsWith('rem') ? parseFloat(radius.lg) : 0;
  const shape = config.components.button.shape;
  const level = LEVELS.find((l) => shadowSet(l, colors.navy['800'], colors.navy['900'], colors.green['700']).md === shadows.md) ?? 'custom';
  const lineAlpha = Number(/\/ ([0-9.]+)\)/.exec(colors.line.base)?.[1] ?? 0.09);

  return (
    <div className="pg-stack">
      <RangeField label="Base radius" value={base} min={0} max={2} step={0.125} format={(v) => `${v}rem`} onChange={(rem) => update(setTokens({ radius: radiusScale(rem, shape) }))} />
      <SegmentedChoice
        label="Button shape"
        value={shape}
        options={[{ value: 'pill', label: 'Pill' }, { value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }] as const}
        onChange={(next: (typeof BUTTON_SHAPES)[number]) => update(compose(setComponents({ button: { shape: next } }), setTokens({ radius: { control: radiusScale(base, next).control } })))}
      />
      <SelectField label="Card radius" value={CARD_KEYS.find((k) => radius[k] === radius.card) ?? '2xl'} options={CARD_KEYS.map((k) => ({ value: k, label: `${k} (${radius[k]})` }))} onChange={(k) => update(setTokens({ radius: { card: radius[k] } }))} />
      <SegmentedChoice
        label="Shadows"
        value={level}
        options={[...LEVELS.map((l) => ({ value: l, label: l[0]!.toUpperCase() + l.slice(1) })), { value: 'custom' as const, label: 'Custom' }]}
        onChange={(l) => { if (l !== 'custom') update(setTokens({ shadows: shadowSet(l, colors.navy['800'], colors.navy['900'], colors.green['700']) })); }}
      />
      <RangeField
        label="Border strength"
        value={lineAlpha} min={0.04} max={0.4} step={0.01} format={(v) => v.toFixed(2)}
        onChange={(alpha) => {
          const ch = hexToChannels(colors.navy['800']);
          update(setTokens({ colors: { line: { base: `rgb(${ch} / ${alpha.toFixed(2)})`, strong: `rgb(${ch} / ${Math.min(0.9, alpha * 1.8).toFixed(2)})` } } }));
        }}
      />
    </div>
  );
}
```

`LayoutTab.tsx` — density, width and dividers first, then one `SelectField` per component with a plain-English description:

```tsx
import {
  BADGE_STYLES, BUTTON_HOVERS, BUTTON_PRIMARIES, CARD_STYLES, CTA_STYLES, FEATURE_LAYOUTS, FOOTER_STYLES, HERO_LAYOUTS,
  ICON_STROKES, ICON_STYLES, MAP_TONES, NAV_STYLES, ROUTE_OPTION_STYLES, ROUTE_STROKES, STATS_STYLES, TESTIMONIAL_STYLES,
} from '@/theme/config';
import { contentWidthSpacing, densitySpacing } from '@/theme/derive';

import { useActiveConfig, usePlaygroundActions } from '../store/PlaygroundProvider';
import { SegmentedChoice, SelectField } from './controls';
import { compose, setComponents, setLayout, setTokens } from './updaters';

const opts = <T extends string | number>(values: readonly T[]) => values.map((v) => ({ value: v, label: String(v) }));
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

export function LayoutTab() {
  const config = useActiveConfig();
  const { update } = usePlaygroundActions();
  const c = config.components;

  return (
    <div className="pg-stack">
      <SegmentedChoice label="Density" value={config.layout.density} options={(['compact', 'comfortable', 'airy'] as const).map((d) => ({ value: d, label: cap(d) }))} onChange={(density) => update(compose(setLayout({ density }), setTokens({ spacing: densitySpacing(density) })))} />
      <SegmentedChoice label="Content width" value={config.layout.contentWidth} options={(['narrow', 'default', 'wide'] as const).map((w) => ({ value: w, label: cap(w) }))} onChange={(contentWidth) => update(compose(setLayout({ contentWidth }), setTokens({ spacing: contentWidthSpacing(contentWidth) })))} />
      <SegmentedChoice label="Section dividers" value={config.layout.dividers} options={(['none', 'hairline', 'tonal'] as const).map((d) => ({ value: d, label: cap(d) }))} onChange={(dividers) => update(setLayout({ dividers }))} />

      <SelectField label="Navigation" value={c.nav.style} options={opts(NAV_STYLES)} onChange={(style) => update(setComponents({ nav: { style } }))} hint="Glass, solid bar, floating pill, text-only, or dark." />
      <SelectField label="Hero layout" value={c.hero.layout} options={opts(HERO_LAYOUTS)} onChange={(layout) => update(setComponents({ hero: { layout } }))} />
      <SelectField label="Button colour" value={c.button.primary} options={opts(BUTTON_PRIMARIES)} onChange={(primary) => update(setComponents({ button: { primary } }))} />
      <SelectField label="Button hover" value={c.button.hover} options={opts(BUTTON_HOVERS)} onChange={(hover) => update(setComponents({ button: { hover } }))} />
      <SelectField label="Cards" value={c.card.style} options={opts(CARD_STYLES)} onChange={(style) => update(setComponents({ card: { style } }))} />
      <SelectField label="Feature layout" value={c.features.layout} options={opts(FEATURE_LAYOUTS)} onChange={(layout) => update(setComponents({ features: { layout } }))} />
      <SelectField label="Route options" value={c.routeOptions.style} options={opts(ROUTE_OPTION_STYLES)} onChange={(style) => update(setComponents({ routeOptions: { style } }))} />
      <SelectField label="Stats" value={c.stats.style} options={opts(STATS_STYLES)} onChange={(style) => update(setComponents({ stats: { style } }))} />
      <SelectField label="Badges" value={c.badge.style} options={opts(BADGE_STYLES)} onChange={(style) => update(setComponents({ badge: { style } }))} />
      <SelectField label="Map tone" value={c.mapUi.tone} options={opts(MAP_TONES)} onChange={(tone) => update(setComponents({ mapUi: { tone } }))} />
      <SelectField label="Route stroke" value={c.mapUi.routeStroke} options={opts(ROUTE_STROKES)} onChange={(routeStroke) => update(setComponents({ mapUi: { routeStroke } }))} />
      <SelectField label="Icon style" value={c.icons.style} options={opts(ICON_STYLES)} onChange={(style) => update(setComponents({ icons: { style } }))} />
      <SegmentedChoice label="Icon stroke" value={c.icons.strokeWidth} options={opts(ICON_STROKES)} onChange={(strokeWidth) => update(setComponents({ icons: { strokeWidth } }))} />
      <SelectField label="Testimonial" value={c.testimonial.style} options={opts(TESTIMONIAL_STYLES)} onChange={(style) => update(setComponents({ testimonial: { style } }))} hint="Placeholder copy only. Real quotes need permission." />
      <SelectField label="Call to action" value={c.cta.style} options={opts(CTA_STYLES)} onChange={(style) => update(setComponents({ cta: { style } }))} />
      <SelectField label="Footer" value={c.footer.style} options={opts(FOOTER_STYLES)} onChange={(style) => update(setComponents({ footer: { style } }))} />
    </div>
  );
}
```

`MotionTab.tsx`:

```tsx
import { intensityMotion } from '@/theme/derive';

import { useActiveConfig, usePlaygroundActions, usePlaygroundState } from '../store/PlaygroundProvider';
import { SegmentedChoice, ToggleField } from './controls';
import { compose, setMotion, setTokens } from './updaters';

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

export function MotionTab() {
  const config = useActiveConfig();
  const { ui } = usePlaygroundState();
  const { update, setUi } = usePlaygroundActions();
  return (
    <div className="pg-stack">
      <SegmentedChoice label="Intensity" value={config.motion.intensity} options={(['none', 'subtle', 'standard', 'expressive'] as const).map((i) => ({ value: i, label: cap(i) }))} onChange={(intensity) => update(compose(setMotion({ intensity }), setTokens({ motion: intensityMotion(intensity) })))} />
      <SegmentedChoice label="Reveal style" value={config.motion.reveal} options={(['rise', 'fade', 'mask', 'scale'] as const).map((r) => ({ value: r, label: cap(r) }))} onChange={(reveal) => update(setMotion({ reveal }))} />
      <ToggleField label="Hover lift on cards" checked={config.motion.hoverLift} onChange={(hoverLift) => update(setMotion({ hoverLift }))} />
      <ToggleField
        label="Preview with reduced motion"
        checked={ui.reducedMotion}
        onChange={(reducedMotion) => setUi({ reducedMotion })}
        hint="Emulates prefers-reduced-motion for the CSS in the Component lab. The real site's GSAP stories read the OS setting, so toggle that to test Live site mode."
      />
    </div>
  );
}
```

`ContentTab.tsx`:

```tsx
import { CTA_LABEL_MAX, HEADLINES, TONES } from '@/theme/config';

import { headlines } from '../content';
import { useActiveConfig, usePlaygroundActions } from '../store/PlaygroundProvider';
import { SegmentedChoice, TextInput } from './controls';
import { setContent } from './updaters';

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

export function ContentTab() {
  const config = useActiveConfig();
  const { update } = usePlaygroundActions();
  return (
    <div className="pg-stack">
      <SegmentedChoice label="Headline" value={config.content.headline} options={HEADLINES.map((h) => ({ value: h, label: cap(h) }))} onChange={(headline) => update(setContent({ headline }))} />
      <p className="pg-hint">“{headlines[config.content.headline].line1} {headlines[config.content.headline].line2}”</p>
      <SegmentedChoice label="Tone" value={config.content.tone} options={TONES.map((t) => ({ value: t, label: cap(t) }))} onChange={(tone) => update(setContent({ tone }))} />
      <TextInput label="CTA label" value={config.content.ctaLabel} maxLength={CTA_LABEL_MAX} onChange={(ctaLabel) => update(setContent({ ctaLabel: ctaLabel.slice(0, CTA_LABEL_MAX) }))} hint={`${config.content.ctaLabel.length}/${CTA_LABEL_MAX}`} />
    </div>
  );
}
```

- [ ] **Step 8: Wire the panel, fonts and reduced-motion emulation**

- `protocol.ts`: add `reducedMotion: boolean` to `ApplyPayload`.
- `store/types.ts`: add `reducedMotion: boolean` to `PlaygroundUi`, `false` in `initialUi`; `persistence.ts` `sanitiseUi` copies it when boolean.
- `Shell.tsx`: payload includes `reducedMotion: state.ui.reducedMotion`; replace the `<aside>` comment with `<Panel />`.
- Tests written in Task 7 that build an `ApplyPayload` gain `reducedMotion: false`.
- `Preview.tsx`: after `applyTheme`, `loadThemeFonts(document, payload.config.tokens.typography)` and `document.documentElement.dataset.swmReduced = String(payload.reducedMotion)`.
- Shell document: `TypographyTab` lists families in their own face — call `ensureFontLoaded(document, option.stack)` for each hosted option in a `useEffect` when the tab mounts, and give each `<option>` `style={{ fontFamily: option.stack }}`.
- `playground.css` additions:

```css
.pg-panel-inner { display: grid; grid-template-rows: auto 1fr; height: 100%; }
.pg-tabs { display: flex; flex-wrap: wrap; gap: 2px; padding: 0.5rem; border-bottom: 1px solid #e5e7eb; }
.pg-tab { padding: 0.35rem 0.6rem; border: 0; border-radius: 6px; background: transparent; font: inherit; cursor: pointer; color: #374151; }
.pg-tab[aria-selected='true'] { background: #111827; color: #fff; }
.pg-tabpanel { overflow: auto; padding: 1rem; }
.pg-stack { display: grid; gap: 1rem; }
.pg-field { display: grid; gap: 0.35rem; border: 0; padding: 0; margin: 0; min-width: 0; }
.pg-field-label { font-size: 12px; font-weight: 600; color: #374151; }
.pg-hint { margin: 0; font-size: 12px; color: #6b7280; }
.pg-segmented { display: flex; flex-wrap: wrap; gap: 2px; padding: 2px; border: 1px solid #d1d5db; border-radius: 8px; }
.pg-segment { flex: 1; text-align: center; padding: 0.35rem 0.5rem; border-radius: 6px; cursor: pointer; font-size: 13px; }
.pg-segment input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.pg-segment[data-selected='true'] { background: #111827; color: #fff; }
.pg-segment:has(input:focus-visible) { outline: 2px solid #2563eb; outline-offset: 1px; }
.pg-color { display: flex; align-items: center; gap: 0.5rem; }
.pg-color input { width: 36px; height: 28px; padding: 0; border: 1px solid #d1d5db; border-radius: 6px; background: none; }
.pg-range { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; align-items: center; }
.pg-select-block, .pg-input { width: 100%; height: 32px; padding: 0 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font: inherit; }
.pg-button { height: 32px; padding: 0 0.75rem; border: 1px solid #111827; border-radius: 6px; background: #fff; font: inherit; cursor: pointer; }
.pg-swatches { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.pg-swatch { display: inline-flex; width: 44px; height: 28px; padding: 0; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; cursor: pointer; }
.pg-swatch span { flex: 1; }
.pg-details summary { cursor: pointer; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.pg-details .pg-field { margin-bottom: 0.5rem; }
.pg-contrast { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.35rem; font-size: 12px; }
.pg-contrast li { display: grid; grid-template-columns: 28px 1fr auto; gap: 0.5rem; align-items: center; }
.pg-contrast li[data-level='Fail'] code { color: #b91c1c; }
.pg-contrast-sample { display: inline-grid; place-items: center; width: 28px; height: 22px; border-radius: 4px; border: 1px solid #e5e7eb; font-weight: 600; }

/* Reduced-motion emulation in the preview (mirrors the site's media-query block). */
[data-swm-reduced='true'] *, [data-swm-reduced='true'] *::before, [data-swm-reduced='true'] *::after {
  animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important;
}
[data-swm-reduced='true'].motion-ready [data-reveal], [data-swm-reduced='true'].motion-ready [data-reveal-stagger] > * {
  opacity: 1 !important; clip-path: none !important; transform: none !important;
}
```

- [ ] **Step 9: Run the tests, lint, typecheck**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: green. Then `npm run dev`, open the playground and check: changing Brand navy recolours the Live site header and buttons; choosing Manrope changes the body face after the font loads; Dark scheme flips the lab background; the reduced-motion toggle stops reveals in the lab.

- [ ] **Step 10: Commit**

```bash
npx prettier --write src/playground
git add src/playground
git commit -m "feat(playground): control panel for colours, type, shape, layout, motion and copy"
```

---

### Task 9: Component lab — frame, style helpers and the first seven compositions

**Files:**
- Create: `src/playground/lab/labStyles.ts`, `src/playground/lab/LabSection.tsx`, `src/playground/lab/LabNav.tsx`, `src/playground/lab/LabHero.tsx`, `src/playground/lab/LabButtons.tsx`, `src/playground/lab/LabTypography.tsx`, `src/playground/lab/LabBadges.tsx`, `src/playground/lab/LabIcons.tsx`, `src/playground/lab/LabTestimonial.tsx`
- Modify: `src/playground/lab/Lab.tsx` (replace the stub), `src/playground/playground.css` (variant hooks)
- Test: `src/playground/lab/labStyles.test.ts`

**Interfaces:**
- Consumes: real primitives (`Logo`, `ButtonLink`, `StatusPill`, `Chip`, `PhoneFrame`, `RoutePickerScreen`, `NavigationScreen`, `CityMap`, `ComparisonMap`, `navLinks`, `ILLUSTRATIVE_NOTE`, `useScrollReveal`), `headlines`, `toneCaptions`, `PLACEHOLDER_TESTIMONIAL`.
- Produces: `LAB_SECTIONS`, `LabSectionId`, `cardClasses(style, extra?)`, `labButtonProps(config)`, `iconTile(config, inverse?)`, `badgeOverride(style, tone)`, `LabSection({ id, title, variant?, tone?, bleed?, children })`, one component per composition taking `{ config: ThemeConfig }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/playground/lab/labStyles.test.ts
import { describe, expect, it } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

import { badgeOverride, cardClasses, iconTile, LAB_SECTIONS, labButtonProps } from './labStyles';

describe('labStyles', () => {
  it('lists fifteen sections with unique ids', () => {
    expect(LAB_SECTIONS).toHaveLength(15);
    expect(new Set(LAB_SECTIONS.map((s) => s.id)).size).toBe(15);
  });

  it('maps card styles to classes', () => {
    expect(cardClasses('outlined')).toContain('border-line');
    expect(cardClasses('navy')).toContain('bg-surface-navy');
    expect(cardClasses('glass')).toContain('backdrop-blur-md');
    expect(cardClasses('flat', 'p-0')).toMatch(/p-0$/);
  });

  it('maps button choices onto the real Button variants', () => {
    expect(labButtonProps(todayPreset)).toEqual({ variant: 'primary', className: '', routeHover: true });
    const green = { ...todayPreset, components: { ...todayPreset.components, button: { shape: 'pill', primary: 'green', hover: 'lift' } as const } };
    const props = labButtonProps(green);
    expect(props.variant).toBe('accent');
    expect(props.className).toContain('hover:-translate-y-0.5');
    expect(props.routeHover).toBe(false);
  });

  it('builds icon tiles and badge overrides', () => {
    expect(iconTile(todayPreset).className).toContain('bg-navy-50');
    expect(iconTile(todayPreset).strokeWidth).toBe(2);
    expect(badgeOverride('solid', 'plus')).toContain('bg-green-800');
    expect(badgeOverride('soft', 'plus')).toBe('');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/playground/lab/labStyles.test.ts`
Expected: FAIL, unresolved import.

- [ ] **Step 3: `src/playground/lab/labStyles.ts`**

```ts
import type { ChipTone } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

export const LAB_SECTIONS = [
  { id: 'nav', title: 'Navigation' },
  { id: 'hero', title: 'Hero' },
  { id: 'route-viz', title: 'Route and safety visualisation' },
  { id: 'route-options', title: 'Route options' },
  { id: 'safety-score', title: 'Safety score' },
  { id: 'features', title: 'Features' },
  { id: 'stats', title: 'Stats' },
  { id: 'badges', title: 'Badges and chips' },
  { id: 'buttons', title: 'Buttons' },
  { id: 'typography', title: 'Typography' },
  { id: 'icons', title: 'Icons' },
  { id: 'map-ui', title: 'Map UI elements' },
  { id: 'testimonial', title: 'Testimonial' },
  { id: 'cta', title: 'Call to action' },
  { id: 'footer', title: 'Footer' },
] as const;
export type LabSectionId = (typeof LAB_SECTIONS)[number]['id'];

type CardStyle = ThemeConfig['components']['card']['style'];
type BadgeStyle = ThemeConfig['components']['badge']['style'];

const CARD: Record<CardStyle, string> = {
  outlined: 'border border-line bg-surface shadow-xs',
  elevated: 'border border-transparent bg-surface shadow-lg',
  flat: 'bg-surface-secondary',
  glass: 'border border-line bg-surface/70 backdrop-blur-md',
  navy: 'on-navy border border-white/10 bg-surface-navy text-white',
};

export function cardClasses(style: CardStyle, extra?: string): string {
  return cn('lab-card rounded-card p-6 sm:p-7', CARD[style], extra);
}

/** How the preset's button choices land on the real `Button` variants. */
export function labButtonProps(config: ThemeConfig): {
  variant: 'primary' | 'accent' | 'secondary';
  className: string;
  routeHover: boolean;
} {
  const { primary, hover } = config.components.button;
  const variant = primary === 'green' ? 'accent' : primary === 'outline' ? 'secondary' : 'primary';
  const className = cn(
    primary === 'gradient' && 'bg-gradient-to-br from-navy-600 to-navy-900 hover:from-navy-500 hover:to-navy-800',
    hover === 'lift' && 'hover:-translate-y-0.5 hover:shadow-lg',
    hover === 'fill' && variant === 'secondary' && 'hover:border-navy-800 hover:bg-navy-800 hover:text-white',
    hover === 'none' && 'hover:shadow-none',
  );
  return { variant, className, routeHover: hover === 'route-sheen' };
}

export function iconTile(config: ThemeConfig, inverse = false): { className: string; strokeWidth: number } {
  const { style, strokeWidth } = config.components.icons;
  const className = cn(
    'grid h-10 w-10 place-items-center rounded-lg',
    style === 'outline' && (inverse ? 'text-green-500' : 'text-navy-700'),
    style === 'filled-tile' && (inverse ? 'bg-white/10 text-green-500' : 'bg-navy-50 text-navy-700'),
    style === 'duotone' && (inverse ? 'bg-green-500/15 text-green-300' : 'bg-green-500/15 text-green-800'),
  );
  return { className, strokeWidth };
}

const SOLID: Record<ChipTone, string> = {
  plus: 'border-transparent bg-green-800 text-white',
  minus: 'border-transparent bg-navy-800 text-white',
  flag: 'border-transparent bg-warning-ink text-white',
  neutral: 'border-transparent bg-ink-secondary text-white',
};
const OUTLINE: Record<ChipTone, string> = {
  plus: 'border-green-700 bg-transparent text-green-800',
  minus: 'border-navy-400 bg-transparent text-navy-800',
  flag: 'border-warning bg-transparent text-warning-ink',
  neutral: 'border-line-strong bg-transparent text-ink-secondary',
};

/** Extra classes for `Chip`; `soft` is the component's own look, so nothing is added. */
export function badgeOverride(style: BadgeStyle, tone: ChipTone): string {
  if (style === 'solid') return SOLID[tone];
  if (style === 'outline') return OUTLINE[tone];
  return '';
}
```

- [ ] **Step 4: `src/playground/lab/LabSection.tsx` and `Lab.tsx`**

```tsx
// LabSection.tsx
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type LabSectionProps = {
  id: string;
  title: string;
  variant?: string;
  tone?: 'default' | 'navy';
  /** Children run full-bleed; the caption keeps its shell. */
  bleed?: boolean;
  children: ReactNode;
};

export function LabSection({ id, title, variant, tone = 'default', bleed = false, children }: LabSectionProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      data-nav-theme={tone === 'navy' ? 'dark' : undefined}
      className={cn('lab-section', tone === 'navy' ? 'on-navy bg-surface-navy text-white' : 'bg-surface text-ink-primary')}
    >
      <div className="shell pt-section">
        <p className="lab-chrome">
          <span>{title}</span>
          {variant && <span>· {variant}</span>}
        </p>
      </div>
      {bleed ? children : <div className="shell pb-section">{children}</div>}
    </section>
  );
}
```

```tsx
// Lab.tsx
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { ThemeConfig } from '@/theme/config';

import { LabBadges } from './LabBadges';
import { LabButtons } from './LabButtons';
import { LabCta } from './LabCta';
import { LabFeatures } from './LabFeatures';
import { LabFooter } from './LabFooter';
import { LabHero } from './LabHero';
import { LabIcons } from './LabIcons';
import { LabMapUi } from './LabMapUi';
import { LabNav } from './LabNav';
import { LabRouteOptions } from './LabRouteOptions';
import { LabRouteViz } from './LabRouteViz';
import { LabSafetyScore } from './LabSafetyScore';
import { LabStats } from './LabStats';
import { LabTestimonial } from './LabTestimonial';
import { LabTypography } from './LabTypography';

export type LabProps = { config: ThemeConfig; section: string | null };

/**
 * Every SafeWalkMaps composition the playground can style, in page order. Runs the
 * site's own scroll-reveal controller so motion settings can be judged here too.
 */
export function Lab({ config, section }: LabProps) {
  useScrollReveal();

  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' });
  }, [section]);

  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LabNav config={config} />
      <main>
        <LabHero config={config} />
        <LabRouteViz config={config} />
        <LabRouteOptions config={config} />
        <LabSafetyScore config={config} />
        <LabFeatures config={config} />
        <LabStats config={config} />
        <LabBadges config={config} />
        <LabButtons config={config} />
        <LabTypography config={config} />
        <LabIcons config={config} />
        <LabMapUi config={config} />
        <LabTestimonial config={config} />
        <LabCta config={config} />
      </main>
      <LabFooter config={config} />
    </MemoryRouter>
  );
}
```

Until Task 10 lands, create `LabRouteViz`, `LabRouteOptions`, `LabSafetyScore`, `LabFeatures`, `LabStats`, `LabMapUi`, `LabCta`, `LabFooter` as one-line stubs returning `<LabSection id=… title=…><p className="pg-hint">Arrives in Task 10.</p></LabSection>` so the lab renders at the end of this task.

- [ ] **Step 5: Navigation and hero**

```tsx
// LabNav.tsx
import { Logo } from '@/components/brand/Logo';
import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { ButtonLink } from '@/components/ui/Button';
import { navLinks } from '@/data/navigation';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { labButtonProps } from './labStyles';

export function LabNav({ config }: { config: ThemeConfig }) {
  const style = config.components.nav.style;
  const button = labButtonProps(config);
  const dark = style === 'dark';
  const linkTone = dark ? 'text-white/70' : style === 'minimal' ? 'text-ink-tertiary' : 'text-navy-900/75';

  return (
    <LabSection id="nav" title="Navigation" variant={style} bleed>
      {/* A slice of map behind the bar, so glass and floating variants have something to sit over. */}
      <div className={cn('relative overflow-hidden', dark ? 'bg-surface-navy' : 'bg-surface')}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 h-72 opacity-50">
          <ComparisonMap />
        </div>
        {style === 'glass' && <div aria-hidden="true" className="nav-glass nav-glass-light opacity-100" />}
        <div className={cn('relative', style === 'floating-pill' && 'px-gutter pt-3 pb-16')}>
          <div
            className={cn(
              'relative flex h-[var(--nav-height)] items-center justify-between gap-6',
              style === 'floating-pill'
                ? 'mx-auto max-w-4xl rounded-control border border-line bg-surface/92 px-5 shadow-md backdrop-blur-md'
                : 'shell',
              style === 'solid' && 'border-b border-line bg-surface',
              style === 'minimal' && 'border-b border-line',
              dark && 'text-white',
            )}
          >
            <Logo variant={dark ? 'mono-light' : 'brand'} className="text-[0.95rem]" markClassName="h-[1.85rem]" />
            <nav aria-label="Lab primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <span className={cn('inline-flex h-10 items-center rounded-lg px-3.5 text-body-sm font-medium', linkTone)}>{link.label}</span>
                  </li>
                ))}
              </ul>
            </nav>
            {style !== 'minimal' && (
              <ButtonLink href="#waitlist" size="sm" variant={dark ? 'accent' : button.variant} className={button.className} routeHover={button.routeHover}>
                Join waitlist
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </LabSection>
  );
}
```

```tsx
// LabHero.tsx
import { CityMap } from '@/components/illustrations/CityMap';
import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { NavigationScreen } from '@/components/product/NavigationScreen';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { RoutePickerScreen } from '@/components/product/RoutePickerScreen';
import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { ILLUSTRATIVE_NOTE } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { headlines, toneCaptions } from '../content';
import { LabSection } from './LabSection';
import { cardClasses, labButtonProps } from './labStyles';

export function LabHero({ config }: { config: ThemeConfig }) {
  const layout = config.components.hero.layout;
  const copy = headlines[config.content.headline];
  const caption = toneCaptions[config.content.tone];
  const button = labButtonProps(config);
  const inverse = layout === 'immersive-dark';
  const stroke = config.components.mapUi.routeStroke;

  const headline = (size: 'text-display-xl' | 'text-display-2xl' = 'text-display-xl') => (
    <h1 className={cn(size, inverse ? 'text-white' : 'text-ink-primary')}>
      {copy.line1}
      <span className={cn('block', inverse ? 'text-white/55' : 'text-ink-tertiary')}>{copy.line2}</span>
    </h1>
  );
  const lede = <p className={cn('mt-7 max-w-prose text-body-xl', inverse ? 'text-white/70' : 'text-ink-secondary')}>{copy.lede}</p>;
  const actions = (
    <div className={cn('mt-9 flex flex-col gap-3 sm:flex-row sm:items-center', layout === 'centered' && 'sm:justify-center')}>
      <ButtonLink href="#waitlist" size="lg" variant={inverse ? 'accent' : button.variant} className={button.className} routeHover={button.routeHover}>
        {config.content.ctaLabel}
      </ButtonLink>
      <ButtonLink href="#route-options" variant={inverse ? 'inverse' : 'secondary'} size="lg">See how it works</ButtonLink>
    </div>
  );
  const note = <p className={cn('mt-6 text-caption', inverse ? 'text-white/50' : 'text-ink-tertiary')}>{caption}</p>;
  const phone = (className: string, night = false) => (
    <div className={cn('mx-auto w-full', className)} data-route-stroke={stroke}>
      <PhoneFrame elevation="soft" label="The SafeWalkMaps route picker, comparing three walking routes.">
        {night ? <NavigationScreen /> : <RoutePickerScreen activeRoute="safer" />}
      </PhoneFrame>
      <p className={cn('demo-note mt-4 text-center', inverse && 'text-white/45')}>{ILLUSTRATIVE_NOTE}</p>
    </div>
  );

  if (layout === 'map-first') {
    return (
      <LabSection id="hero" title="Hero" variant={layout} bleed>
        <div className="relative min-h-[72svh] overflow-hidden" data-route-stroke={stroke}>
          <CityMap width={1200} height={760} band={{ top: 80, bottom: 700 }} activeRoute="safer" showAlternatives tone={config.components.mapUi.tone === 'night' ? 'night' : 'day'} className="absolute inset-0 h-full w-full" />
          <div className="shell relative py-section">
            <div className={cardClasses('glass', 'max-w-2xl')}>
              <StatusPill className="mb-6">Coming soon on iOS</StatusPill>
              {headline()}
              {lede}
              {actions}
              {note}
            </div>
          </div>
        </div>
      </LabSection>
    );
  }

  if (layout === 'editorial') {
    return (
      <LabSection id="hero" title="Hero" variant={layout}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <StatusPill className="mb-7">Coming soon on iOS</StatusPill>
            {headline('text-display-2xl')}
          </div>
          <div className="lg:col-span-4">{lede}{actions}{note}</div>
        </div>
        <div className="mt-14 overflow-hidden rounded-card border border-line bg-surface-secondary" data-route-stroke={stroke}>
          <ComparisonMap className="h-auto w-full" />
        </div>
      </LabSection>
    );
  }

  if (layout === 'centered') {
    return (
      <LabSection id="hero" title="Hero" variant={layout}>
        <div className="flex flex-col items-center text-center">
          <StatusPill className="mb-7">Coming soon on iOS</StatusPill>
          <div className="max-w-3xl">{headline()}</div>
          <div className="max-w-prose">{lede}</div>
          {actions}
          {note}
          {phone('mt-14 max-w-[18rem]')}
        </div>
      </LabSection>
    );
  }

  return (
    <LabSection id="hero" title="Hero" variant={layout} tone={inverse ? 'navy' : 'default'}>
      <div className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-16">
        {inverse && <div aria-hidden="true" className="pointer-events-none absolute -inset-x-20 top-0 h-96 rounded-full bg-green-500/10 blur-3xl" />}
        <div className="relative" data-reveal-stagger>
          <StatusPill className="mb-7" inverse={inverse}>Coming soon on iOS</StatusPill>
          {headline()}
          {lede}
          {actions}
          {note}
        </div>
        {phone('max-w-[20rem] sm:max-w-[21.5rem]', inverse)}
      </div>
    </LabSection>
  );
}
```

- [ ] **Step 6: Buttons, typography, badges, icons, testimonial**

```tsx
// LabButtons.tsx
import { Button, ButtonLink } from '@/components/ui/Button';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { labButtonProps } from './labStyles';

const SIZES = ['sm', 'md', 'lg'] as const;

export function LabButtons({ config }: { config: ThemeConfig }) {
  const preset = labButtonProps(config);
  const { shape, primary, hover } = config.components.button;
  return (
    <LabSection id="buttons" title="Buttons" variant={`${shape} · ${primary} · ${hover}`}>
      <div className="grid gap-8">
        <div className="flex flex-wrap items-center gap-3">
          {SIZES.map((size) => (
            <ButtonLink key={size} href="#waitlist" size={size} variant={preset.variant} className={preset.className} routeHover={preset.routeHover}>
              {config.content.ctaLabel}
            </ButtonLink>
          ))}
          <Button variant={preset.variant} className={preset.className} disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" routeHover>Primary</Button>
          <Button variant="accent" routeHover>Accent</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="on-navy flex flex-wrap items-center gap-3 rounded-card bg-surface-navy p-6">
          <Button variant="inverse">Inverse</Button>
          <Button variant="accent" routeHover>Accent on navy</Button>
        </div>
      </div>
    </LabSection>
  );
}
```

```tsx
// LabTypography.tsx
import type { ThemeConfig } from '@/theme/config';
import { TYPE_STEPS, type TypeStep } from '@/theme/tokens';

import { headlines } from '../content';
import { LabSection } from './LabSection';

/** Literal class names so Tailwind generates every step for the lab. */
const CLASS: Record<TypeStep, string> = {
  'display-2xl': 'text-display-2xl', 'display-xl': 'text-display-xl', 'display-lg': 'text-display-lg',
  'display-md': 'text-display-md', 'display-sm': 'text-display-sm', 'body-xl': 'text-body-xl',
  'body-lg': 'text-body-lg', body: 'text-body', 'body-sm': 'text-body-sm', caption: 'text-caption', label: 'text-label uppercase',
};

export function LabTypography({ config }: { config: ThemeConfig }) {
  const copy = headlines[config.content.headline];
  const { sans, display, headingWeight } = config.tokens.typography;
  return (
    <LabSection id="typography" title="Typography" variant={`${display ? 'two families' : 'one family'} · heading ${headingWeight}`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          {TYPE_STEPS.map((step) => (
            <div key={step} className="grid gap-1">
              <span className="lab-chrome">{step}</span>
              <p className={`${CLASS[step]} ${step.startsWith('display') ? 'font-display text-ink-primary' : 'text-ink-secondary'}`} style={step.startsWith('display') ? { fontWeight: headingWeight } : undefined}>
                {step.startsWith('display') ? copy.line1 : 'Lit for most of the journey. Joins the main road early.'}
              </p>
            </div>
          ))}
        </div>
        <aside className="grid gap-4 self-start rounded-card border border-line bg-surface-secondary p-6 text-body-sm text-ink-secondary">
          <p><strong className="text-ink-primary">Body:</strong> {sans}</p>
          <p><strong className="text-ink-primary">Headings:</strong> {display ?? 'same as body'}</p>
          <p><strong className="text-ink-primary">Headline variant:</strong> {config.content.headline}</p>
        </aside>
      </div>
    </LabSection>
  );
}
```

```tsx
// LabBadges.tsx
import { Chip, StatusPill, type ChipTone } from '@/components/ui/Chip';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { badgeOverride } from './labStyles';

const SAMPLES: Array<{ tone: ChipTone; label: string }> = [
  { tone: 'plus', label: 'Well lit for the full route' },
  { tone: 'minus', label: 'Very little footfall after 9pm' },
  { tone: 'flag', label: 'One stretch with older lighting data' },
  { tone: 'neutral', label: 'Planned' },
];

export function LabBadges({ config }: { config: ThemeConfig }) {
  const style = config.components.badge.style;
  return (
    <LabSection id="badges" title="Badges and chips" variant={style}>
      <div className="grid gap-6">
        <ul className="flex flex-wrap gap-2.5">
          {SAMPLES.map((s) => <li key={s.label}><Chip tone={s.tone} className={badgeOverride(style, s.tone)}>{s.label}</Chip></li>)}
          <li><StatusPill>Coming soon on iOS</StatusPill></li>
        </ul>
        <ul className="on-navy flex flex-wrap gap-2.5 rounded-card bg-surface-navy p-6">
          {SAMPLES.map((s) => <li key={s.label}><Chip tone={s.tone} inverse>{s.label}</Chip></li>)}
          <li><StatusPill inverse>Coming soon on iOS</StatusPill></li>
        </ul>
        <p className="demo-note">"Planned" is the honest label for a feature that is not yet in the build.</p>
      </div>
    </LabSection>
  );
}
```

```tsx
// LabIcons.tsx
import {
  ArrowDown, ArrowUpRight, Check, ChevronRight, CloudOff, CornerUpRight, Home, Info, Mail, MapPinned,
  MessageSquareWarning, Minus, Navigation, Share2, ShieldAlert, type LucideIcon,
} from 'lucide-react';

import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { iconTile } from './labStyles';

const ICONS: Array<[string, LucideIcon]> = [
  ['ArrowDown', ArrowDown], ['ArrowUpRight', ArrowUpRight], ['Check', Check], ['ChevronRight', ChevronRight], ['CloudOff', CloudOff],
  ['CornerUpRight', CornerUpRight], ['Home', Home], ['Info', Info], ['Mail', Mail], ['MapPinned', MapPinned],
  ['MessageSquareWarning', MessageSquareWarning], ['Minus', Minus], ['Navigation', Navigation], ['Share2', Share2], ['ShieldAlert', ShieldAlert],
];

export function LabIcons({ config }: { config: ThemeConfig }) {
  const tile = iconTile(config);
  return (
    <LabSection id="icons" title="Icons" variant={`${config.components.icons.style} · ${tile.strokeWidth}`}>
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        {ICONS.map(([name, Icon]) => (
          <li key={name} className="flex flex-col items-center gap-2 text-caption text-ink-tertiary">
            <span className={tile.className}><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={tile.strokeWidth} /></span>
            {name}
          </li>
        ))}
      </ul>
    </LabSection>
  );
}
```

```tsx
// LabTestimonial.tsx
import type { ThemeConfig } from '@/theme/config';

import { PLACEHOLDER_TESTIMONIAL } from '../content';
import { LabSection } from './LabSection';
import { cardClasses } from './labStyles';

export function LabTestimonial({ config }: { config: ThemeConfig }) {
  const style = config.components.testimonial.style;
  const quote = (
    <figure className={cardClasses(config.components.card.style)}>
      <blockquote className="text-body-lg text-ink-primary">“{PLACEHOLDER_TESTIMONIAL.quote}”</blockquote>
      <figcaption className="mt-4 text-caption text-ink-tertiary">{PLACEHOLDER_TESTIMONIAL.author} · {PLACEHOLDER_TESTIMONIAL.context}</figcaption>
    </figure>
  );
  return (
    <LabSection id="testimonial" title="Testimonial" variant={style}>
      <p className="demo-note mb-6" role="note">Placeholder only. SafeWalkMaps publishes no testimonial without the person's permission.</p>
      {style === 'hidden' && <p className="text-body-sm text-ink-tertiary">Hidden in this preset.</p>}
      {style === 'single-quote' && <div className="mx-auto max-w-prose-lg text-center">{quote}</div>}
      {style === 'cards' && <div className="grid gap-5 md:grid-cols-3">{quote}{quote}{quote}</div>}
    </LabSection>
  );
}
```

- [ ] **Step 7: Variant hooks in `playground.css`**

```css
/* Section dividers */
[data-swm-dividers='hairline'] .lab-section + .lab-section { border-top: 1px solid var(--color-line); }
[data-swm-dividers='tonal'] .lab-section[data-tone='default']:nth-of-type(even) { background: rgb(var(--color-surface-secondary)); }

/* Reveal style (the site's CSS keys on the attribute value; the lab keys on the preset) */
.motion-ready[data-swm-reveal='fade'] [data-reveal][data-visible='false'] { transform: none !important; }
.motion-ready[data-swm-reveal='scale'] [data-reveal][data-visible='false'] { transform: translate3d(0, calc(1.75rem * var(--reveal-scale)), 0) scale(0.975) !important; }
.motion-ready[data-swm-reveal='mask'] [data-reveal][data-visible='false'] { clip-path: inset(0 0 100% 0) !important; opacity: 1 !important; transform: none !important; }
.motion-ready[data-swm-reveal='mask'] [data-reveal][data-visible='true'] { clip-path: inset(0 0 -10% 0); }

/* Hover lift on cards */
[data-swm-hover-lift='true'] .lab-card { transition: transform var(--duration-base) var(--ease-out-expo), box-shadow var(--duration-base) var(--ease-out-expo); }
[data-swm-hover-lift='true'] .lab-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }

/* Route stroke: RouteLine marks its layers with data-route-layer */
[data-route-stroke='solid'] [data-route-layer='casing'] { display: none; }
[data-route-stroke='dashed'] [data-route-layer='casing'] { display: none; }
[data-route-stroke='dashed'] [data-route-layer='line'] { stroke-dasharray: 0.03 0.018 !important; }
```

- [ ] **Step 8: Run tests, lint, typecheck, look at it**

Run: `npm run lint && npm run typecheck && npm run test`. Then `npm run dev`, open the playground in Component lab mode and check at 390 and 1280: the five nav styles, the five hero layouts (map-first fills the frame, immersive-dark inverts), buttons change shape with the radius slider, badges switch styles, the testimonial is labelled as a placeholder.

- [ ] **Step 9: Commit**

```bash
npx prettier --write src/playground
git add src/playground
git commit -m "feat(playground): component lab with navigation, hero, buttons, type, badges, icons and testimonial"
```

---

### Task 10: Component lab — route, score, features, stats, map UI, CTA and footer

**Files:**
- Create: `src/playground/lab/LabRouteViz.tsx`, `LabRouteOptions.tsx`, `LabSafetyScore.tsx`, `LabFeatures.tsx`, `LabStats.tsx`, `LabMapUi.tsx`, `LabCta.tsx`, `LabFooter.tsx` (replacing the Task 9 stubs)
- Test: `src/playground/lab/Lab.test.tsx`

**Interfaces:**
- Consumes: `routes`, `getRoute`, `defaultRouteKey`, `ILLUSTRATIVE_NOTE`, `features`, `footerColumns`, `siteConfig`, `SegmentedTabs`, `SafetyScoreRing`, `AnimatedCounter`, `ShieldMark`, `SiteFooter`, `labStats`, `cardClasses`, `iconTile`, `badgeOverride`, `labButtonProps`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/playground/lab/Lab.test.tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

import { Lab } from './Lab';
import { LAB_SECTIONS } from './labStyles';

describe('Lab', () => {
  it('renders every section with its id', () => {
    render(<Lab config={todayPreset} section={null} />);
    for (const section of LAB_SECTIONS) expect(document.getElementById(section.id)).not.toBeNull();
  });

  it('route options switch the figures shown', () => {
    render(<Lab config={todayPreset} section={null} />);
    const section = document.getElementById('route-options') as HTMLElement;
    expect(within(section).getAllByText('24').length).toBeGreaterThan(0);
    fireEvent.click(within(section).getByRole('tab', { name: /fastest/i }));
    expect(within(section).getAllByText('21').length).toBeGreaterThan(0);
  });

  it('shows the placeholder testimonial only as a placeholder', () => {
    const cards = { ...todayPreset, components: { ...todayPreset.components, testimonial: { style: 'cards' as const } } };
    render(<Lab config={cards} section={null} />);
    expect(screen.getAllByText(/placeholder quote/i).length).toBe(3);
    expect(screen.getByRole('note')).toHaveTextContent(/permission/i);
  });

  it('labels every illustrative figure', () => {
    render(<Lab config={todayPreset} section={null} />);
    for (const id of ['hero', 'route-options', 'safety-score', 'stats']) {
      expect(within(document.getElementById(id) as HTMLElement).getAllByText(/illustrative route data/i).length).toBeGreaterThan(0);
    }
  });

  it('renders the real footer for navy-columns and a light one otherwise', () => {
    const { unmount } = render(<Lab config={todayPreset} section={null} />);
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-surface-navy');
    unmount();
    const light = { ...todayPreset, components: { ...todayPreset.components, footer: { style: 'light-compact' as const } } };
    render(<Lab config={light} section={null} />);
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-surface');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/playground/lab/Lab.test.tsx`
Expected: FAIL — the stubs have no tabs, no figures, no footer.

- [ ] **Step 3: Route visualisation and route options**

```tsx
// LabRouteViz.tsx
import { CityMap } from '@/components/illustrations/CityMap';
import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { ILLUSTRATIVE_NOTE } from '@/data/city';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { cardClasses } from './labStyles';

export function LabRouteViz({ config }: { config: ThemeConfig }) {
  const { tone, routeStroke } = config.components.mapUi;
  return (
    <LabSection id="route-viz" title="Route and safety visualisation" variant={`${tone} · ${routeStroke}`}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" data-route-stroke={routeStroke}>
        <figure className={cardClasses(config.components.card.style, 'p-0 overflow-hidden')}>
          <ComparisonMap className="h-auto w-full" />
          <figcaption className="demo-note px-6 py-4">Fastest across the park against safer on main roads. {ILLUSTRATIVE_NOTE}</figcaption>
        </figure>
        <figure className="overflow-hidden rounded-card border border-line">
          <div className="aspect-[393/520]">
            <CityMap width={393} height={520} band={{ top: 40, bottom: 500 }} activeRoute="safer" showAlternatives flow tone={tone === 'night' ? 'night' : 'day'} />
          </div>
        </figure>
      </div>
    </LabSection>
  );
}
```

```tsx
// LabRouteOptions.tsx
import { useState } from 'react';

import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { RoutePickerScreen } from '@/components/product/RoutePickerScreen';
import { Chip } from '@/components/ui/Chip';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { defaultRouteKey, getRoute, ILLUSTRATIVE_NOTE, routes, type RouteKey } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { badgeOverride, cardClasses } from './labStyles';

const options = routes.map((r) => ({ value: r.key, label: r.name, meta: `${r.minutes} min` }));

export function LabRouteOptions({ config }: { config: ThemeConfig }) {
  const [selected, setSelected] = useState<RouteKey>(defaultRouteKey);
  const route = getRoute(selected);
  const style = config.components.routeOptions.style;
  const badge = config.components.badge.style;

  const picker =
    style === 'segmented' ? (
      <SegmentedTabs options={options} value={selected} onChange={setSelected} idPrefix="lab-route" label="Compare walking routes" />
    ) : style === 'cards' ? (
      <div className="grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Compare walking routes">
        {routes.map((r) => (
          <button key={r.key} role="tab" type="button" aria-selected={r.key === selected} onClick={() => setSelected(r.key)}
            className={cn(cardClasses(config.components.card.style, 'text-left'), r.key === selected && 'ring-2 ring-green-500')}>
            <span className="block text-body-sm font-semibold text-ink-primary">{r.name}</span>
            <span className="tabular mt-1 block text-display-sm text-ink-primary">{r.minutes}<span className="text-body-sm text-ink-tertiary"> min</span></span>
            <span className="mt-2 block text-caption text-ink-tertiary">{r.distanceKm.toFixed(1)} km · safety {r.safetyScore}</span>
          </button>
        ))}
      </div>
    ) : (
      <ul className="divide-y divide-line rounded-card border border-line" role="tablist" aria-label="Compare walking routes">
        {routes.map((r) => (
          <li key={r.key}>
            <button role="tab" type="button" aria-selected={r.key === selected} onClick={() => setSelected(r.key)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
              <span aria-hidden="true" className={cn('h-4 w-4 rounded-full border-2', r.key === selected ? 'border-green-700 bg-green-500' : 'border-line-strong')} />
              <span className="flex-1 text-body-sm font-semibold text-ink-primary">{r.name}</span>
              <span className="tabular text-body-sm text-ink-secondary">{r.minutes} min · {r.distanceKm.toFixed(1)} km · {r.safetyScore}/100</span>
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <LabSection id="route-options" title="Route options" variant={style}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center" data-route-stroke={config.components.mapUi.routeStroke}>
        <div>
          {picker}
          <div role="tabpanel" className="mt-8">
            <div className="flex flex-wrap items-end gap-x-9 gap-y-5">
              <div><p className="text-label font-semibold uppercase text-ink-tertiary">Time</p><p className="mt-1.5 flex items-baseline gap-1.5"><AnimatedCounter value={route.minutes} live durationMs={620} className="text-display-md text-ink-primary" /><span className="text-body-lg font-medium text-ink-tertiary">min</span></p></div>
              <div><p className="text-label font-semibold uppercase text-ink-tertiary">Distance</p><p className="tabular mt-1.5 text-display-md text-ink-primary">{route.distanceKm.toFixed(1)}<span className="text-body-lg font-medium text-ink-tertiary"> km</span></p></div>
              <div><p className="text-label font-semibold uppercase text-ink-tertiary">Safety</p><p className="mt-1.5 flex items-baseline gap-1.5"><AnimatedCounter value={route.safetyScore} live durationMs={620} className="text-display-md text-green-800" /><span className="text-body-lg font-medium text-ink-tertiary">/100</span></p></div>
              <SafetyScoreRing score={route.safetyScore} lowestSegment={route.lowestSegment} strokeWidth={14} className="w-20"><span className="tabular text-body font-semibold">{route.safetyScore}</span></SafetyScoreRing>
            </div>
            <p className="mt-6 text-body-lg text-ink-secondary">{route.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2.5">{route.factors.map((f) => <li key={f.label}><Chip tone={f.tone} className={badgeOverride(badge, f.tone)}>{f.label}</Chip></li>)}</ul>
            <p className="demo-note mt-6">{ILLUSTRATIVE_NOTE}</p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[19rem]">
          <PhoneFrame elevation="soft" label={`SafeWalkMaps showing the ${route.name.toLowerCase()} route.`}>
            <RoutePickerScreen activeRoute={selected} onSelect={setSelected} />
          </PhoneFrame>
        </div>
      </div>
    </LabSection>
  );
}
```

- [ ] **Step 4: Safety score, features, stats**

```tsx
// LabSafetyScore.tsx
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { Chip } from '@/components/ui/Chip';
import { getRoute, ILLUSTRATIVE_NOTE } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { badgeOverride, cardClasses } from './labStyles';

const route = getRoute('safer');
const figures = [
  { label: 'Lowest single stretch', value: route.lowestSegment, suffix: '' },
  { label: 'Below par', value: route.exposurePercent, suffix: '%' },
  { label: 'Data confidence', value: route.confidencePercent, suffix: '%' },
];

export function LabSafetyScore({ config }: { config: ThemeConfig }) {
  const card = config.components.card.style;
  const dark = card === 'navy';
  return (
    <LabSection id="safety-score" title="Safety score" variant={`panel ${card}`}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
        <div className={cardClasses(card, 'mx-auto w-full max-w-[24rem]')}>
          <SafetyScoreRing score={route.safetyScore} lowestSegment={route.lowestSegment} tone={dark ? 'dark' : 'light'} strokeWidth={10} className="w-full">
            <span className="flex items-baseline">
              <AnimatedCounter value={route.safetyScore} className={cn('text-[clamp(3.25rem,9.5vw,4.75rem)] font-semibold leading-none tracking-[-0.045em]', dark ? 'text-white' : 'text-ink-primary')} />
              <span className={cn('ml-1 text-body-lg font-medium', dark ? 'text-white/40' : 'text-ink-tertiary')}>/100</span>
            </span>
            <span className={cn('mt-2 text-label font-semibold uppercase tracking-[0.14em]', dark ? 'text-green-500' : 'text-green-800')}>Safety score</span>
          </SafetyScoreRing>
          <p className={cn('mt-5 text-center text-caption', dark ? 'text-white/50' : 'text-ink-tertiary')}>The ring's green gradient is a brand constant and does not follow the palette.</p>
        </div>
        <div>
          <ul className="flex flex-wrap gap-2.5">{route.factors.map((f) => <li key={f.label}><Chip tone={f.tone} className={badgeOverride(config.components.badge.style, f.tone)}>{f.label}</Chip></li>)}</ul>
          <dl className="mt-8 divide-y divide-line border-t border-line">
            {figures.map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-6 py-5">
                <dt className="text-body-lg font-semibold text-ink-primary">{f.label}</dt>
                <dd><AnimatedCounter value={f.value} suffix={f.suffix} className="text-display-sm font-semibold text-green-800" /></dd>
              </div>
            ))}
          </dl>
          <p className="demo-note mt-4">{ILLUSTRATIVE_NOTE}</p>
        </div>
      </div>
    </LabSection>
  );
}
```

```tsx
// LabFeatures.tsx
import { CloudOff, MapPinned, MessageSquareWarning, RefreshCw, Share2, ShieldAlert, type LucideIcon } from 'lucide-react';

import { ComparisonMap } from '@/components/illustrations/ComparisonMap';
import { NavigationScreen } from '@/components/product/NavigationScreen';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { features } from '@/data/features';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { cardClasses, iconTile } from './labStyles';

const ICON: Record<string, LucideIcon> = { navigation: MapPinned, updates: RefreshCw, sharing: Share2, reports: MessageSquareWarning, offline: CloudOff, sos: ShieldAlert };
const BENTO = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-3', 'lg:col-span-4', 'lg:col-span-12'];

export function LabFeatures({ config }: { config: ThemeConfig }) {
  const layout = config.components.features.layout;
  const card = config.components.card.style;
  const tile = iconTile(config, card === 'navy');

  const Card = ({ id, title, body, className }: { id: string; title: string; body: string; className?: string }) => {
    const Icon = ICON[id] ?? MapPinned;
    return (
      <article className={cardClasses(card, cn('flex flex-col', className))}>
        <span className={cn(tile.className, 'mb-5')}><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={tile.strokeWidth} /></span>
        <h3 className="text-body-lg">{title}</h3>
        <p className={cn('mt-2.5', card === 'navy' ? 'text-white/65' : 'text-ink-secondary')}>{body}</p>
      </article>
    );
  };

  return (
    <LabSection id="features" title="Features" variant={`${layout} · ${card} cards`}>
      {layout === 'bento' && (
        <div className="grid gap-5 lg:grid-cols-12">
          {features.map((f, i) => (i === 0 ? (
            <article key={f.id} className={cardClasses('navy', 'lg:col-span-7 lg:flex lg:items-center lg:gap-8')}>
              <div className="lg:flex-1"><span className={cn(iconTile(config, true).className, 'mb-5')}><MapPinned aria-hidden="true" className="h-5 w-5" strokeWidth={tile.strokeWidth} /></span><h3 className="text-display-sm text-white">{f.title}</h3><p className="mt-3.5 text-white/60">{f.body}</p></div>
              <div className="mx-auto mt-8 w-full max-w-[12rem] lg:mt-0"><PhoneFrame elevation="soft" label="Night navigation"><NavigationScreen /></PhoneFrame></div>
            </article>
          ) : <Card key={f.id} {...f} className={BENTO[i]} />))}
        </div>
      )}
      {layout === 'three-column' && <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map((f) => <Card key={f.id} {...f} />)}</div>}
      {layout === 'list' && (
        <ul className="divide-y divide-line border-y border-line">
          {features.map((f) => { const Icon = ICON[f.id] ?? MapPinned; return (
            <li key={f.id} className="flex gap-5 py-6"><span className={tile.className}><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={tile.strokeWidth} /></span><div><h3 className="text-body-lg">{f.title}</h3><p className="mt-1.5 max-w-prose text-ink-secondary">{f.body}</p></div></li>
          ); })}
        </ul>
      )}
      {layout === 'alternating' && (
        <div className="grid gap-14">
          {features.slice(0, 4).map((f, i) => (
            <div key={f.id} className={cn('grid items-center gap-8 lg:grid-cols-2', i % 2 === 1 && 'lg:[&>*:first-child]:order-2')}>
              <Card {...f} />
              <div className="overflow-hidden rounded-card border border-line bg-surface-secondary">{i % 2 === 0 ? <ComparisonMap className="h-auto w-full" /> : <div className="mx-auto w-full max-w-[12rem] py-8"><PhoneFrame elevation="soft" label="Night navigation"><NavigationScreen /></PhoneFrame></div>}</div>
            </div>
          ))}
        </div>
      )}
    </LabSection>
  );
}
```

```tsx
// LabStats.tsx
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { SafetyScoreRing } from '@/components/illustrations/SafetyScoreRing';
import { ILLUSTRATIVE_NOTE, routes } from '@/data/city';
import type { ThemeConfig } from '@/theme/config';

import { labStats } from '../content';
import { LabSection } from './LabSection';
import { cardClasses } from './labStyles';

export function LabStats({ config }: { config: ThemeConfig }) {
  const style = config.components.stats.style;
  return (
    <LabSection id="stats" title="Stats" variant={style}>
      {style === 'inline' && (
        <dl className="flex flex-wrap gap-x-12 gap-y-6">
          {labStats.map((s) => (
            <div key={s.label}><dt className="text-label font-semibold uppercase text-ink-tertiary">{s.label}</dt><dd className="mt-1.5 text-display-md text-ink-primary">{'prefix' in s ? s.prefix : ''}<AnimatedCounter value={s.value} suffix={s.suffix} /></dd></div>
          ))}
        </dl>
      )}
      {style === 'tiles' && (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {labStats.map((s) => (
            <div key={s.label} className={cardClasses(config.components.card.style)}><dd className="text-display-sm text-ink-primary">{'prefix' in s ? s.prefix : ''}<AnimatedCounter value={s.value} suffix={s.suffix} /></dd><dt className="mt-2 text-caption text-ink-tertiary">{s.label}</dt></div>
          ))}
        </dl>
      )}
      {style === 'ring' && (
        <ul className="grid gap-8 sm:grid-cols-3">
          {routes.map((r) => (
            <li key={r.key} className="flex flex-col items-center text-center">
              <SafetyScoreRing score={r.safetyScore} lowestSegment={r.lowestSegment} strokeWidth={12} className="w-40"><span className="tabular text-display-sm text-ink-primary">{r.safetyScore}</span><span className="text-label font-semibold uppercase text-ink-tertiary">{r.name}</span></SafetyScoreRing>
              <p className="mt-3 text-body-sm text-ink-secondary">{r.minutes} min · {r.distanceKm.toFixed(1)} km</p>
            </li>
          ))}
        </ul>
      )}
      <p className="demo-note mt-6">{ILLUSTRATIVE_NOTE}</p>
    </LabSection>
  );
}
```

- [ ] **Step 5: Map UI, CTA, footer**

```tsx
// LabMapUi.tsx
import { CornerUpRight, Navigation, Share2, ShieldAlert } from 'lucide-react';

import { getRoute, routes } from '@/data/city';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';

const safer = getRoute('safer');

/** The app's chrome, lifted out of the phone screens at 1rem scale, on a map-coloured plate. */
export function LabMapUi({ config }: { config: ThemeConfig }) {
  const night = config.components.mapUi.tone === 'night';
  const sw = config.components.icons.strokeWidth;
  return (
    <LabSection id="map-ui" title="Map UI elements" variant={night ? 'night' : 'light'}>
      <div className={cn('grid gap-5 rounded-card p-6 sm:grid-cols-2', night ? 'bg-[#071F42] text-white' : 'bg-[#EEF2F7] text-ink-primary')}>
        <div className="flex items-center gap-3.5 rounded-xl bg-navy-900/88 px-4 py-3.5 text-white shadow-lg backdrop-blur-md">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-green-500 text-navy-900"><CornerUpRight aria-hidden="true" className="h-5 w-5" strokeWidth={sw} /></span>
          <span className="flex min-w-0 flex-col leading-tight"><span className="tabular text-body-lg font-semibold">120 m</span><span className="truncate text-body-sm text-white/65">Turn right onto Chapel Street</span></span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border border-green-500/25 bg-green-500/12 px-3.5 py-2.5"><span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" /><span className={cn('text-body-sm', night ? 'text-green-100' : 'text-green-900')}>Ahead is lit and busier than usual for this time.</span></div>
        <div className="flex items-center gap-2 self-start rounded-control border border-green-500/30 bg-green-500/14 px-3 py-1.5"><span className={cn('tabular text-body font-semibold', night ? 'text-green-300' : 'text-green-800')}>{safer.safetyScore}</span><span className={cn('text-label font-semibold uppercase', night ? 'text-green-300/70' : 'text-green-800/70')}>Safety</span></div>
        <div className={cn('grid grid-cols-3 gap-1 rounded-lg p-1', night ? 'bg-white/10' : 'bg-surface-tertiary')}>
          {routes.map((r) => <span key={r.key} className={cn('flex flex-col items-center rounded-md py-1.5 text-caption', r.key === 'safer' ? 'bg-white font-semibold text-navy-800 shadow-sm' : night ? 'text-white/70' : 'text-ink-secondary')}>{r.name}<span className="tabular opacity-70">{r.minutes} min</span></span>)}
        </div>
        <span className="flex h-12 items-center justify-center gap-2 rounded-control bg-navy-800 text-body-sm font-semibold text-white"><Navigation aria-hidden="true" className="h-4 w-4" fill="currentColor" strokeWidth={sw} />Start walking</span>
        <div className="grid grid-cols-2 gap-2">
          <span className={cn('flex h-11 items-center justify-center gap-2 rounded-lg text-body-sm font-semibold', night ? 'bg-white/10 text-white' : 'bg-navy-50 text-navy-800')}><Share2 aria-hidden="true" className="h-4 w-4" strokeWidth={sw} />Share walk</span>
          <span className="flex h-11 items-center justify-center gap-2 rounded-lg bg-danger/90 text-body-sm font-semibold text-white"><ShieldAlert aria-hidden="true" className="h-4 w-4" strokeWidth={sw} />SOS</span>
        </div>
      </div>
    </LabSection>
  );
}
```

```tsx
// LabCta.tsx
import { ShieldMark } from '@/components/brand/ShieldMark';
import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { labButtonProps } from './labStyles';

const TITLE = 'Take the route that considers more.';
const BODY = 'Three minutes is usually the whole difference. SafeWalkMaps just makes sure you know what those three minutes buy.';

export function LabCta({ config }: { config: ThemeConfig }) {
  const style = config.components.cta.style;
  const button = labButtonProps(config);
  const dark = style === 'navy-band' || style === 'gradient-band';
  const inner = (
    <div className="flex flex-col items-center text-center">
      {style === 'shield-arrival' && <ShieldMark className="mb-6 h-24" />}
      <h2 className={cn(style === 'minimal' ? 'text-display-sm' : 'text-display-xl', 'max-w-[17ch]', dark ? 'text-white' : 'text-ink-primary')}>{TITLE}</h2>
      <p className={cn('mt-6 max-w-prose text-body-xl', dark ? 'text-white/70' : 'text-ink-secondary')}>{BODY}</p>
      <div className="mt-9 flex flex-col items-center gap-5">
        <ButtonLink href="#waitlist" size="lg" variant={dark ? 'accent' : style === 'minimal' ? 'secondary' : button.variant} className={button.className} routeHover={button.routeHover}>{config.content.ctaLabel}</ButtonLink>
        <StatusPill inverse={dark}>Coming soon on iOS</StatusPill>
      </div>
    </div>
  );
  if (style === 'gradient-band') {
    return (
      <LabSection id="cta" title="Call to action" variant={style} bleed>
        <div className="on-navy relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white" data-nav-theme="dark">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-green-500/15 blur-3xl" />
          <div className="shell relative py-section-lg">{inner}</div>
        </div>
      </LabSection>
    );
  }
  return <LabSection id="cta" title="Call to action" variant={style} tone={style === 'navy-band' ? 'navy' : 'default'}>{inner}</LabSection>;
}
```

```tsx
// LabFooter.tsx
import { Logo } from '@/components/brand/Logo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { footerColumns } from '@/data/navigation';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/config';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';

export function LabFooter({ config }: { config: ThemeConfig }) {
  const style = config.components.footer.style;
  const year = new Date().getFullYear();
  const links = footerColumns.flatMap((c) => c.links);
  return (
    <LabSection id="footer" title="Footer" variant={style} bleed>
      {style === 'navy-columns' && <SiteFooter />}
      {style === 'light-compact' && (
        <footer className="border-t border-line bg-surface text-ink-primary">
          <div className="shell flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
            <Logo className="text-[1rem]" markClassName="h-7" />
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-ink-secondary">{links.map((l) => <li key={l.label}>{l.label}</li>)}</ul>
            <p className="text-caption text-ink-tertiary">© {year} SafeWalkMaps · a {siteConfig.parentCompany.name} product</p>
          </div>
        </footer>
      )}
      {style === 'dark-big-logo' && (
        <footer className={cn('on-navy bg-navy-950 text-white')} data-nav-theme="dark">
          <div className="shell py-section">
            <Logo variant="mono-light" className="text-[clamp(1.5rem,4vw,2.75rem)]" markClassName="h-[1.4em]" />
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-white/60">{links.map((l) => <li key={l.label}>{l.label}</li>)}</ul>
            <p className="mt-10 max-w-[46ch] text-caption text-white/40">Safety scores are relative guidance from available data, not a guarantee. In an emergency, contact your local emergency services.</p>
            <p className="mt-4 text-caption text-white/40">© {year} SafeWalkMaps</p>
          </div>
        </footer>
      )}
    </LabSection>
  );
}
```

- [ ] **Step 6: Run the tests, lint, typecheck; inspect in the browser**

Run: `npx vitest run src/playground && npm run lint && npm run typecheck`. In the browser, at 390 and 1280: the three route-option styles all switch the figures and the phone; the safety panel follows the card style; features render all four layouts; the map UI plate flips to night; the footer renders all three styles.

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/playground
git add src/playground
git commit -m "feat(playground): lab compositions for routes, score, features, stats, map UI, CTA and footer"
```

---

### Task 11: The eight remaining presets

**Files:**
- Create: `src/theme/presets/shared.ts`, `clean-minimal.ts`, `premium-modern.ts`, `safety-first.ts`, `night-navigation.ts`, `light-airy.ts`, `bold-startup.ts`, `cupertino.ts`, `wayfinder.ts`
- Modify: `src/theme/presets/index.ts` (list all nine)
- Test: `src/theme/presets/presets.test.ts`

**Interfaces:**
- Consumes: `buildTokens`, `fontOptions` stacks (copy the stack strings; `src/theme` must not import from `src/playground`), `ThemeConfig`.
- Produces: `preset(input)` helper; nine exported presets; `builtInPresets` in spec order.

- [ ] **Step 1: Write the failing test**

```ts
// src/theme/presets/presets.test.ts
import { describe, expect, it } from 'vitest';

import { parseThemeConfig } from '../validate';
import { builtInPresets } from './index';

describe('built-in presets', () => {
  it('are nine, start with today, and have unique slugs', () => {
    expect(builtInPresets).toHaveLength(9);
    expect(builtInPresets[0]?.meta.id).toBe('today');
    expect(new Set(builtInPresets.map((p) => p.meta.id)).size).toBe(9);
    for (const p of builtInPresets) expect(p.meta.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('every preset parses and is marked built in', () => {
    for (const p of builtInPresets) {
      const result = parseThemeConfig(JSON.parse(JSON.stringify(p)));
      expect(result.ok, `${p.meta.id}: ${!result.ok ? result.errors.join('; ') : ''}`).toBe(true);
      expect(p.meta.builtIn).toBe(true);
      expect(p.meta.basedOn).toBeNull();
    }
  });

  it('no two presets are merely a recolour of each other', () => {
    for (const a of builtInPresets) {
      for (const b of builtInPresets) {
        if (a === b) continue;
        const sameStructure = JSON.stringify(a.components) === JSON.stringify(b.components);
        const sameColours = JSON.stringify(a.tokens.colors) === JSON.stringify(b.tokens.colors);
        expect(sameStructure && sameColours, `${a.meta.id} vs ${b.meta.id}`).toBe(false);
        expect(sameStructure, `${a.meta.id} and ${b.meta.id} share every component choice`).toBe(false);
      }
    }
  });

  it('dark presets declare the dark scheme and light ones do not', () => {
    const byId = Object.fromEntries(builtInPresets.map((p) => [p.meta.id, p]));
    expect(byId['night-navigation']?.tokens.colors.scheme).toBe('dark');
    expect(byId['today']?.tokens.colors.scheme).toBe('light');
    expect(byId['cupertino']?.tokens.colors.scheme).toBe('light');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/theme/presets/presets.test.ts`
Expected: FAIL, length 1.

- [ ] **Step 3: `shared.ts`**

```ts
import type { ThemeConfig } from '../config';

export const AUTHORED = '2026-10-11T00:00:00.000Z';

type Input = Omit<ThemeConfig, 'schemaVersion' | 'meta'> & { id: string; name: string; description: string };

/** Fills in the fixed metadata every built-in shares. */
export function preset({ id, name, description, ...rest }: Input): ThemeConfig {
  return {
    schemaVersion: 1,
    meta: { id, name, description, builtIn: true, basedOn: null, favourite: false, createdAt: AUTHORED, updatedAt: AUTHORED },
    ...rest,
  };
}

/** Font stacks mirrored from src/playground/fonts.ts; the theme layer must not import the playground. */
export const STACKS = {
  system: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Helvetica, Arial, sans-serif",
  manrope: "'Manrope', 'Inter Variable', Inter, system-ui, sans-serif",
  plusJakarta: "'Plus Jakarta Sans', 'Inter Variable', Inter, system-ui, sans-serif",
  dmSans: "'DM Sans', 'Inter Variable', Inter, system-ui, sans-serif",
  spaceGrotesk: "'Space Grotesk', 'Inter Variable', Inter, system-ui, sans-serif",
  sora: "'Sora', 'Inter Variable', Inter, system-ui, sans-serif",
  jetbrainsMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;
```

- [ ] **Step 4: The eight presets**

Each file exports one constant. The values below are the design decisions; copy them exactly, then tune in the lab if something reads wrong, keeping the "not a recolour" test green.

```ts
// clean-minimal.ts
import { buildTokens } from '../build';
import { preset } from './shared';

export const cleanMinimalPreset = preset({
  id: 'clean-minimal', name: 'Clean Minimal',
  description: 'Near-black ink on white, navy as an accent only, hairline cards, square-ish corners, no shadows, lots of air.',
  tokens: buildTokens({
    navy: '#0B1F3A', green: '#17F58B', headingWeight: 500, radiusBase: 0.5, buttonShape: 'rounded', shadows: 'none',
    density: 'airy', contentWidth: 'narrow', intensity: 'subtle',
    overrides: { colors: { ink: { primary: '#0A0A0A', secondary: '#4B5563', tertiary: '#9CA3AF' }, line: { base: 'rgb(10 10 10 / 0.10)', strong: 'rgb(10 10 10 / 0.18)' } } },
  }),
  components: {
    button: { shape: 'rounded', primary: 'navy', hover: 'none' }, card: { style: 'outlined' }, nav: { style: 'minimal' },
    hero: { layout: 'centered' }, cta: { style: 'minimal' }, footer: { style: 'light-compact' }, features: { layout: 'three-column' },
    stats: { style: 'inline' }, badge: { style: 'outline' }, routeOptions: { style: 'list' }, mapUi: { tone: 'light', routeStroke: 'solid' },
    icons: { style: 'outline', strokeWidth: 1.5 }, testimonial: { style: 'hidden' },
  },
  layout: { density: 'airy', contentWidth: 'narrow', dividers: 'hairline' },
  motion: { intensity: 'subtle', reveal: 'fade', hoverLift: false },
  content: { headline: 'direct', tone: 'calm', ctaLabel: 'Join the waitlist' },
});
```

```ts
// premium-modern.ts
export const premiumModernPreset = preset({
  id: 'premium-modern', name: 'Premium Modern',
  description: 'Deeper navy, softer green, large radii, layered shadows, a gradient primary button and a bento feature grid.',
  tokens: buildTokens({
    navy: '#071C3F', green: '#2EDC8C', display: STACKS.manrope, headingWeight: 700, radiusBase: 1.25, shadows: 'dramatic',
    intensity: 'expressive',
  }),
  components: {
    button: { shape: 'pill', primary: 'gradient', hover: 'lift' }, card: { style: 'elevated' }, nav: { style: 'glass' },
    hero: { layout: 'split-phone' }, cta: { style: 'gradient-band' }, footer: { style: 'navy-columns' }, features: { layout: 'bento' },
    stats: { style: 'tiles' }, badge: { style: 'soft' }, routeOptions: { style: 'cards' }, mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2 }, testimonial: { style: 'cards' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'expressive', reveal: 'rise', hoverLift: true },
  content: { headline: 'benefit', tone: 'confident', ctaLabel: 'Join the iOS waitlist' },
});
```

```ts
// safety-first.ts
export const safetyFirstPreset = preset({
  id: 'safety-first', name: 'Safety First',
  description: 'High contrast. The AA-safe green is the signal colour, amber flags stand out, routes are cards and figures are tiles.',
  tokens: buildTokens({
    navy: '#0A2F6B', green: '#0A9159', headingWeight: 700, radiusBase: 0.75, buttonShape: 'rounded', shadows: 'soft',
    overrides: { colors: { ink: { primary: '#0B1220' }, green: { '500': '#0FBF6D', '400': '#2FD98A', '300': '#6AE8A8' } } },
  }),
  components: {
    button: { shape: 'rounded', primary: 'green', hover: 'fill' }, card: { style: 'outlined' }, nav: { style: 'solid' },
    hero: { layout: 'split-phone' }, cta: { style: 'navy-band' }, footer: { style: 'navy-columns' }, features: { layout: 'list' },
    stats: { style: 'tiles' }, badge: { style: 'solid' }, routeOptions: { style: 'cards' }, mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2.5 }, testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'hairline' },
  motion: { intensity: 'standard', reveal: 'rise', hoverLift: false },
  content: { headline: 'direct', tone: 'confident', ctaLabel: 'Get early access' },
});
```

```ts
// night-navigation.ts
export const nightNavigationPreset = preset({
  id: 'night-navigation', name: 'Night Navigation',
  description: 'Dark surfaces, a brighter green, mono figures, night map, immersive hero and a dark bar. The app at 11pm.',
  tokens: buildTokens({
    navy: '#0F2A5F', green: '#2CFF9A', scheme: 'dark', display: STACKS.spaceGrotesk, mono: STACKS.jetbrainsMono, headingWeight: 600,
    radiusBase: 0.875, buttonShape: 'rounded', shadows: 'dramatic',
  }),
  components: {
    button: { shape: 'rounded', primary: 'green', hover: 'route-sheen' }, card: { style: 'glass' }, nav: { style: 'dark' },
    hero: { layout: 'immersive-dark' }, cta: { style: 'gradient-band' }, footer: { style: 'dark-big-logo' }, features: { layout: 'bento' },
    stats: { style: 'ring' }, badge: { style: 'outline' }, routeOptions: { style: 'segmented' }, mapUi: { tone: 'night', routeStroke: 'dashed' },
    icons: { style: 'duotone', strokeWidth: 2 }, testimonial: { style: 'single-quote' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'tonal' },
  motion: { intensity: 'standard', reveal: 'rise', hoverLift: true },
  content: { headline: 'default', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
});
```

```ts
// light-airy.ts
export const lightAiryPreset = preset({
  id: 'light-airy', name: 'Light and Airy',
  description: 'Off-white surfaces, a lighter navy, pastel green tints, DM Sans, generous line-height and space.',
  tokens: buildTokens({
    navy: '#1F4A86', green: '#5BE7A6', sans: STACKS.dmSans, headingWeight: 600, typeScale: 'editorial', radiusBase: 1, shadows: 'soft',
    density: 'airy', contentWidth: 'wide', intensity: 'subtle',
    overrides: { colors: { surface: { base: '#FAFBFD', secondary: '#F3F6FA', tertiary: '#EAF0F7' }, ink: { primary: '#1B2A44', secondary: '#5B6E8C', tertiary: '#8B9BB4' } } },
  }),
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'lift' }, card: { style: 'flat' }, nav: { style: 'glass' },
    hero: { layout: 'centered' }, cta: { style: 'minimal' }, footer: { style: 'light-compact' }, features: { layout: 'three-column' },
    stats: { style: 'inline' }, badge: { style: 'soft' }, routeOptions: { style: 'list' }, mapUi: { tone: 'light', routeStroke: 'solid' },
    icons: { style: 'outline', strokeWidth: 1.5 }, testimonial: { style: 'cards' },
  },
  layout: { density: 'airy', contentWidth: 'wide', dividers: 'none' },
  motion: { intensity: 'subtle', reveal: 'scale', hoverLift: true },
  content: { headline: 'question', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
});
```

```ts
// bold-startup.ts
export const boldStartupPreset = preset({
  id: 'bold-startup', name: 'Bold Startup',
  description: 'Saturated green buttons, heavy display type, an editorial hero, a navy call-to-action band and solid badges.',
  tokens: buildTokens({
    navy: '#061A4A', green: '#14E07E', display: STACKS.plusJakarta, headingWeight: 800, typeScale: 'display', trackingAdjust: -0.01,
    radiusBase: 0.75, buttonShape: 'rounded', shadows: 'medium', density: 'compact', intensity: 'expressive',
  }),
  components: {
    button: { shape: 'rounded', primary: 'green', hover: 'lift' }, card: { style: 'elevated' }, nav: { style: 'solid' },
    hero: { layout: 'editorial' }, cta: { style: 'navy-band' }, footer: { style: 'navy-columns' }, features: { layout: 'alternating' },
    stats: { style: 'tiles' }, badge: { style: 'solid' }, routeOptions: { style: 'cards' }, mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2.5 }, testimonial: { style: 'cards' },
  },
  layout: { density: 'compact', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'expressive', reveal: 'rise', hoverLift: true },
  content: { headline: 'benefit', tone: 'confident', ctaLabel: 'Get early access' },
});
```

```ts
// cupertino.ts
export const cupertinoPreset = preset({
  id: 'cupertino', name: 'Cupertino',
  description: 'System type, tight tracking, large soft radii, glass everywhere, grey-tinted secondary surfaces and quiet motion.',
  tokens: buildTokens({
    navy: '#0A3C85', green: '#17F58B', sans: STACKS.system, headingWeight: 700, trackingAdjust: -0.012, radiusBase: 1.125, shadows: 'soft',
    overrides: { colors: { surface: { secondary: '#F5F5F7', tertiary: '#EDEDF0' }, ink: { primary: '#1D1D1F', secondary: '#6E6E73', tertiary: '#86868B' }, line: { base: 'rgb(0 0 0 / 0.08)', strong: 'rgb(0 0 0 / 0.14)' } } },
  }),
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'none' }, card: { style: 'glass' }, nav: { style: 'glass' },
    hero: { layout: 'centered' }, cta: { style: 'minimal' }, footer: { style: 'light-compact' }, features: { layout: 'three-column' },
    stats: { style: 'inline' }, badge: { style: 'soft' }, routeOptions: { style: 'segmented' }, mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'outline', strokeWidth: 2 }, testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'hairline' },
  motion: { intensity: 'standard', reveal: 'rise', hoverLift: false },
  content: { headline: 'default', tone: 'calm', ctaLabel: 'Join the iOS waitlist' },
});
```

```ts
// wayfinder.ts
export const wayfinderPreset = preset({
  id: 'wayfinder', name: 'Wayfinder',
  description: 'Map first. A teal-shifted navy, cased route strokes, a floating pill bar and filled icon tiles, like a navigation app.',
  tokens: buildTokens({
    navy: '#0A3D66', green: '#17F58B', display: STACKS.sora, headingWeight: 700, radiusBase: 1, shadows: 'medium',
  }),
  components: {
    button: { shape: 'pill', primary: 'navy', hover: 'route-sheen' }, card: { style: 'outlined' }, nav: { style: 'floating-pill' },
    hero: { layout: 'map-first' }, cta: { style: 'shield-arrival' }, footer: { style: 'navy-columns' }, features: { layout: 'bento' },
    stats: { style: 'inline' }, badge: { style: 'soft' }, routeOptions: { style: 'segmented' }, mapUi: { tone: 'light', routeStroke: 'cased' },
    icons: { style: 'filled-tile', strokeWidth: 2 }, testimonial: { style: 'hidden' },
  },
  layout: { density: 'comfortable', contentWidth: 'default', dividers: 'none' },
  motion: { intensity: 'standard', reveal: 'mask', hoverLift: false },
  content: { headline: 'direct', tone: 'confident', ctaLabel: 'Join the iOS waitlist' },
});
```

Each file imports `buildTokens` from `'../build'` and `preset`, `STACKS` from `'./shared'`.

`index.ts`:

```ts
export const builtInPresets: readonly ThemeConfig[] = [
  todayPreset, cleanMinimalPreset, premiumModernPreset, safetyFirstPreset, nightNavigationPreset,
  lightAiryPreset, boldStartupPreset, cupertinoPreset, wayfinderPreset,
];
```

- [ ] **Step 5: Run the tests, then look at every preset in the lab at 390 and 1280**

Run: `npx vitest run src/theme && npm run lint && npm run typecheck`. In the browser, step through the nine presets in both modes. Adjust a preset's `overrides` if a contrast readout fails for body text on surface; `night-navigation` is expected to show literal-white spots in Live site mode (spec §5.2).

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/theme/presets
git add src/theme/presets
git commit -m "feat(theme): eight built-in design directions alongside the baseline"
```

---

### Task 12: Preset management — list, favourites, save, duplicate, rename, delete, reset, export, import

**Files:**
- Create: `src/playground/panel/PresetsTab.tsx` (replace stub), `src/playground/shell/ExportDrawer.tsx`, `src/playground/shell/ImportDialog.tsx`, `src/playground/shell/download.ts`
- Modify: `src/playground/shell/TopBar.tsx` (unsaved dot, Save as, Reset, Export, Import, lab section jump), `src/playground/Shell.tsx` (drawer/dialog state), `src/playground/playground.css`
- Test: `src/playground/Shell.test.tsx`

**Interfaces:**
- Consumes: store actions, `toJson`, `toCss`, `toTypeScript`, `exportFileName`, `parseThemeConfig`, `LAB_SECTIONS`.
- Produces: `PresetsTab()`, `ExportDrawer({ open, onClose })`, `ImportDialog({ open, onClose })`, `downloadText(name, text, mime)`, `copyText(text): Promise<boolean>`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/playground/Shell.test.tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Shell } from './Shell';

vi.mock('./shell/download', () => ({ downloadText: vi.fn(), copyText: vi.fn(async () => true) }));

describe('Shell', () => {
  it('lists the nine built-in presets and selects one', () => {
    render(<Shell />);
    const list = screen.getByRole('list', { name: 'Built-in presets' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(9);
    fireEvent.click(within(list).getByRole('button', { name: /select cupertino/i }));
    expect(screen.getByTestId('active-name')).toHaveTextContent('Cupertino');
  });

  it('exports the active preset as JSON naming its id', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    const dialog = screen.getByRole('dialog', { name: /export/i });
    expect(within(dialog).getByRole('textbox')).toHaveValue(expect.stringContaining('"id": "today"'));
    fireEvent.click(within(dialog).getByRole('tab', { name: 'CSS' }));
    expect(within(dialog).getByRole('textbox')).toHaveValue(expect.stringContaining('--color-navy-800: 6 42 94;'));
  });

  it('refuses an import that is not a theme and lists why', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    const dialog = screen.getByRole('dialog', { name: /import/i });
    fireEvent.change(within(dialog).getByLabelText(/paste/i), { target: { value: '{"foo":1}' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /import preset/i }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/schemaVersion/);
  });

  it('save as creates a custom preset, which can be renamed, favourited and deleted', () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: /save as/i }));
    fireEvent.change(screen.getByLabelText('New preset name'), { target: { value: 'Mine' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    const mine = screen.getByRole('list', { name: 'My presets' });
    expect(within(mine).getByText('Mine')).toBeInTheDocument();
    fireEvent.click(within(mine).getByRole('button', { name: /favourite mine/i }));
    expect(within(mine).getByRole('button', { name: /unfavourite mine/i })).toBeInTheDocument();
    fireEvent.click(within(mine).getByRole('button', { name: /delete mine/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(screen.queryByRole('list', { name: 'My presets' })).toBeNull();
    expect(screen.getByTestId('active-name')).toHaveTextContent('SafeWalkMaps Today');
  });
});
```

The `Shell` test renders `PlaygroundProvider` with default storage; `setup.ts` gives jsdom a working `localStorage`, so add `beforeEach(() => window.localStorage.clear())` at the top of the file.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/playground/Shell.test.tsx`
Expected: FAIL, no list named "Built-in presets".

- [ ] **Step 3: `shell/download.ts`**

```ts
export function downloadText(name: string, text: string, mime: string): void {
  if (typeof URL.createObjectURL !== 'function') return;
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: `panel/PresetsTab.tsx`**

```tsx
import { useState } from 'react';

import type { ThemeConfig } from '@/theme/config';

import { useBuiltIns, usePlaygroundActions, usePlaygroundState } from '../store/PlaygroundProvider';

function PresetRow({ preset, active, favourite, draft }: { preset: ThemeConfig; active: boolean; favourite: boolean; draft: boolean }) {
  const actions = usePlaygroundActions();
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(preset.meta.name);
  const label = preset.meta.name;

  return (
    <li className="pg-preset" data-active={active}>
      <button type="button" className="pg-preset-select" aria-label={`Select ${label}`} aria-pressed={active} onClick={() => actions.select(preset.meta.id)}>
        <span className="pg-preset-name">{label}{draft && <span className="pg-dot" title="Unsaved changes" />}</span>
        <span className="pg-preset-desc">{preset.meta.description}</span>
      </button>
      <div className="pg-preset-actions">
        <button type="button" className="pg-icon-button" aria-label={`${favourite ? 'Unfavourite' : 'Favourite'} ${label}`} aria-pressed={favourite} onClick={() => actions.toggleFavourite(preset.meta.id)}>{favourite ? '★' : '☆'}</button>
        <button type="button" className="pg-icon-button" aria-label={`Duplicate ${label}`} onClick={() => actions.duplicate(preset.meta.id)}>⧉</button>
        <button type="button" className="pg-icon-button" aria-label={`Reset ${label} to its base`} onClick={() => actions.resetToBase(preset.meta.id)}>↺</button>
        {!preset.meta.builtIn && (
          <>
            <button type="button" className="pg-icon-button" aria-label={`Rename ${label}`} onClick={() => setRenaming((v) => !v)}>✎</button>
            <button type="button" className="pg-icon-button" aria-label={`Delete ${label}`} onClick={() => setConfirming(true)}>🗑</button>
          </>
        )}
      </div>
      {renaming && (
        <form className="pg-inline-form" onSubmit={(e) => { e.preventDefault(); actions.rename(preset.meta.id, name); setRenaming(false); }}>
          <input className="pg-input" aria-label={`New name for ${label}`} value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit" className="pg-button">Rename</button>
        </form>
      )}
      {confirming && (
        <div className="pg-inline-form" role="group" aria-label={`Delete ${label}?`}>
          <span className="pg-hint">Delete “{label}”? This cannot be undone.</span>
          <button type="button" className="pg-button pg-button-danger" aria-label={`Confirm delete ${label}`} onClick={() => actions.remove(preset.meta.id)}>Delete</button>
          <button type="button" className="pg-button" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      )}
    </li>
  );
}

export function PresetsTab() {
  const state = usePlaygroundState();
  const builtIns = useBuiltIns();
  const [query, setQuery] = useState('');
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const matches = (p: ThemeConfig) =>
    (!onlyFavourites || state.favourites.includes(p.meta.id)) &&
    (p.meta.name + ' ' + p.meta.description).toLowerCase().includes(query.trim().toLowerCase());
  const row = (p: ThemeConfig) => (
    <PresetRow key={p.meta.id} preset={p} active={p.meta.id === state.activeId} favourite={state.favourites.includes(p.meta.id)} draft={state.draft?.meta.id === p.meta.id} />
  );
  const customs = state.customs.filter(matches);

  return (
    <div className="pg-stack">
      <div className="pg-field">
        <input className="pg-input" type="search" aria-label="Search presets" placeholder="Search presets" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="pg-hint"><input type="checkbox" checked={onlyFavourites} onChange={(e) => setOnlyFavourites(e.target.checked)} /> Favourites only</label>
      </div>
      <ul className="pg-preset-list" aria-label="Built-in presets">{builtIns.filter(matches).map(row)}</ul>
      {customs.length > 0 && <ul className="pg-preset-list" aria-label="My presets">{customs.map(row)}</ul>}
      <p className="pg-hint">Built-in presets are read-only. Editing one creates a draft; use “Save as” in the top bar to keep it.</p>
    </div>
  );
}
```

- [ ] **Step 5: Export drawer and import dialog**

```tsx
// shell/ExportDrawer.tsx
import { useEffect, useState } from 'react';

import { exportFileName, toCss, toJson, toTypeScript, type ExportFormat } from '@/theme/export';

import { useActiveConfig } from '../store/PlaygroundProvider';
import { copyText, downloadText } from './download';

const FORMATS: Array<{ id: ExportFormat; label: string; mime: string }> = [
  { id: 'json', label: 'JSON', mime: 'application/json' },
  { id: 'css', label: 'CSS', mime: 'text/css' },
  { id: 'ts', label: 'TypeScript', mime: 'text/typescript' },
];

export function ExportDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const config = useActiveConfig();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const text = format === 'json' ? toJson(config) : format === 'css' ? toCss(config) : toTypeScript(config);
  const current = FORMATS.find((f) => f.id === format)!;
  return (
    <div className="pg-overlay" role="presentation" onClick={onClose}>
      <div className="pg-dialog" role="dialog" aria-modal="true" aria-label={`Export ${config.meta.name}`} onClick={(e) => e.stopPropagation()}>
        <div role="tablist" aria-label="Export format" className="pg-tabs">
          {FORMATS.map((f) => <button key={f.id} role="tab" type="button" aria-selected={format === f.id} className="pg-tab" onClick={() => setFormat(f.id)}>{f.label}</button>)}
        </div>
        <textarea className="pg-code" readOnly value={text} aria-label={`${current.label} export`} />
        <div className="pg-dialog-actions">
          <button type="button" className="pg-button" onClick={async () => { setCopied(await copyText(text)); }}>{copied ? 'Copied' : 'Copy'}</button>
          <button type="button" className="pg-button" onClick={() => downloadText(exportFileName(config, format), text, current.mime)}>Download {exportFileName(config, format)}</button>
          <button type="button" className="pg-button" onClick={onClose}>Close</button>
        </div>
        <p className="pg-hint">JSON is the canonical format and re-imports. CSS is the `:root` block for src/styles/index.css. TypeScript drops into src/theme/presets/. See docs/theme-playground.md for applying a preset.</p>
      </div>
    </div>
  );
}
```

```tsx
// shell/ImportDialog.tsx
import { useState } from 'react';

import { parseThemeConfig } from '@/theme/validate';

import { usePlaygroundActions } from '../store/PlaygroundProvider';

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importConfig } = usePlaygroundActions();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  if (!open) return null;

  const submit = () => {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      setErrors(['Not valid JSON.']);
      return;
    }
    const result = parseThemeConfig(data);
    if (!result.ok) { setErrors(result.errors); return; }
    importConfig(result.config);
    setText(''); setErrors([]); onClose();
  };
  const onFile = (file: File | undefined) => { if (file) void file.text().then(setText); };

  return (
    <div className="pg-overlay" role="presentation" onClick={onClose}>
      <div className="pg-dialog" role="dialog" aria-modal="true" aria-label="Import a preset" onClick={(e) => e.stopPropagation()}>
        <label className="pg-field-label" htmlFor="pg-import-file">Choose a JSON file</label>
        <input id="pg-import-file" type="file" accept="application/json,.json" onChange={(e) => onFile(e.target.files?.[0])} />
        <label className="pg-field-label" htmlFor="pg-import-text">Or paste the JSON</label>
        <textarea id="pg-import-text" className="pg-code" value={text} onChange={(e) => setText(e.target.value)} />
        {errors.length > 0 && <ul role="alert" className="pg-errors">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        <div className="pg-dialog-actions">
          <button type="button" className="pg-button" onClick={submit}>Import preset</button>
          <button type="button" className="pg-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: TopBar additions and Shell wiring**

In `TopBar`, accept `onExport`, `onImport` props and add, after the mode group:

```tsx
<div className="pg-topbar-group">
  {hasDraft(state) && <span className="pg-dot" title="Unsaved changes" aria-label="Unsaved changes" />}
  {saving ? (
    <form className="pg-inline-form" onSubmit={(e) => { e.preventDefault(); actions.saveAs(newName); setSaving(false); }}>
      <input className="pg-input" aria-label="New preset name" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
      <button type="submit" className="pg-button">Save</button>
      <button type="button" className="pg-button" onClick={() => setSaving(false)}>Cancel</button>
    </form>
  ) : (
    <button type="button" className="pg-button" onClick={() => { setNewName(`${active.meta.name} (custom)`); setSaving(true); }}>Save as</button>
  )}
  <button type="button" className="pg-button" onClick={() => actions.resetToBase(state.activeId)}>Reset</button>
  <button type="button" className="pg-button" onClick={onExport}>Export</button>
  <button type="button" className="pg-button" onClick={onImport}>Import</button>
</div>
{state.ui.mode === 'lab' && (
  <select aria-label="Jump to section" className="pg-select" value={state.ui.labSection ?? ''} onChange={(e) => actions.setUi({ labSection: e.target.value || null })}>
    <option value="">Jump to…</option>
    {LAB_SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
  </select>
)}
```

`hasDraft` comes from `../store/reducer`; `saving`/`newName` are `useState`s. In `ShellBody`, hold `const [dialog, setDialog] = useState<'export' | 'import' | null>(null)`, pass `onExport={() => setDialog('export')}` and `onImport={() => setDialog('import')}`, and render `<ExportDrawer open={dialog === 'export'} onClose={() => setDialog(null)} />` and `<ImportDialog open={dialog === 'import'} onClose={() => setDialog(null)} />` after the previews.

`playground.css` additions:

```css
.pg-preset-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.pg-preset { display: grid; gap: 0.35rem; padding: 0.6rem; border: 1px solid #e5e7eb; border-radius: 8px; }
.pg-preset[data-active='true'] { border-color: #111827; box-shadow: 0 0 0 1px #111827; }
.pg-preset-select { display: grid; gap: 0.15rem; text-align: left; border: 0; background: none; padding: 0; font: inherit; cursor: pointer; }
.pg-preset-name { font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; }
.pg-preset-desc { font-size: 12px; color: #6b7280; }
.pg-preset-actions { display: flex; gap: 0.25rem; }
.pg-icon-button { width: 28px; height: 28px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; }
.pg-icon-button[aria-pressed='true'] { background: #fef3c7; border-color: #f59e0b; }
.pg-inline-form { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
.pg-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; }
.pg-button-danger { border-color: #b91c1c; color: #b91c1c; }
.pg-overlay { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; background: rgb(17 24 39 / 0.45); }
.pg-dialog { display: grid; gap: 0.75rem; width: min(720px, 92vw); max-height: 88svh; padding: 1rem; border-radius: 12px; background: #fff; box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.4); }
.pg-code { width: 100%; min-height: 320px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; resize: vertical; }
.pg-dialog-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.pg-errors { margin: 0; padding: 0.6rem 0.9rem; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; color: #991b1b; font-size: 12px; }
```

- [ ] **Step 7: Run the tests, lint, typecheck; try it**

Run: `npm run lint && npm run typecheck && npm run test`. In the browser: edit a built-in, see the dot, Save as, rename, star, duplicate, export JSON, download, reload the page (presets persist), import the downloaded file, delete the copy.

- [ ] **Step 8: Commit**

```bash
npx prettier --write src/playground
git add src/playground
git commit -m "feat(playground): preset list with favourites, save, duplicate, rename, delete, reset, export and import"
```

---

### Task 13: Compare mode with mirrored scrolling

**Files:**
- Modify: `src/playground/Preview.tsx` (emit `scroll`, honour `scrollTo`), `src/playground/Shell.tsx` (second frame, mirroring), `src/playground/shell/TopBar.tsx` (Compare toggle and preset select)
- Test: extend `src/playground/Preview.test.tsx` and `src/playground/Shell.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add to `Preview.test.tsx`:

```tsx
it('reports scroll position and honours scrollTo without echoing it', () => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cb(0); return 1; });
  const scrollTo = vi.spyOn(window, 'scrollTo');
  render(<Preview frameId="a" />);
  apply({ config: todayPreset, mode: 'lab', route: '/', labSection: null, reducedMotion: false });
  Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
  act(() => { window.dispatchEvent(new Event('scroll')); });
  expect(postToParent).toHaveBeenCalledWith({ type: 'swm-theme/scroll', frameId: 'a', fraction: 0.25 });
  vi.mocked(postToParent).mockClear();
  act(() => { window.dispatchEvent(new MessageEvent('message', { data: { type: 'swm-theme/scrollTo', fraction: 0.5 }, origin: window.location.origin })); });
  expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'instant' });
  act(() => { window.dispatchEvent(new Event('scroll')); });
  expect(postToParent).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'swm-theme/scroll' }));
});
```

Add to `Shell.test.tsx`:

```tsx
it('compare mode shows a second frame with the chosen preset', () => {
  render(<Shell />);
  fireEvent.click(screen.getByRole('button', { name: 'Compare' }));
  expect(screen.getByTitle('Preview b')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Compare with'), { target: { value: 'wayfinder' } });
  expect((screen.getByLabelText('Compare with') as HTMLSelectElement).value).toBe('wayfinder');
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/playground/Preview.test.tsx src/playground/Shell.test.tsx`
Expected: the two new tests FAIL.

- [ ] **Step 3: Preview — emit and honour scroll**

In `Preview.tsx`, add one effect:

```tsx
useEffect(() => {
  let frame = 0;
  let programmaticUntil = 0;
  const onScroll = () => {
    if (performance.now() < programmaticUntil || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      postToParent({ type: 'swm-theme/scroll', frameId, fraction: range > 0 ? window.scrollY / range : 0 });
    });
  };
  const onMessage = (event: MessageEvent) => {
    if (!isSameOrigin(event) || !isPlaygroundMessage(event.data) || event.data.type !== 'swm-theme/scrollTo') return;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    programmaticUntil = performance.now() + 150;
    window.scrollTo({ top: Math.round(event.data.fraction * range), behavior: 'instant' as ScrollBehavior });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('message', onMessage);
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('message', onMessage);
    if (frame) cancelAnimationFrame(frame);
  };
}, [frameId]);
```

- [ ] **Step 4: Shell — second frame and mirroring; TopBar — toggle and select**

In `ShellBody`:

```tsx
const compare = findPreset(state, builtIns, state.ui.compareId ?? '') ?? null;
const comparePayload = useMemo<ApplyPayload | null>(
  () => (compare ? { ...payload, config: compare } : null), [compare, payload],
);
const [mirror, setMirror] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
const onScrollA = useCallback((f: number) => setMirror((m) => ({ ...m, b: f })), []);
const onScrollB = useCallback((f: number) => setMirror((m) => ({ ...m, a: f })), []);
…
<section className="pg-previews" aria-label="Preview">
  <PreviewFrame frameId="a" payload={payload} width={state.ui.width} onScroll={comparePayload ? onScrollA : undefined} scrollTo={mirror.a} />
  {comparePayload && <PreviewFrame frameId="b" payload={comparePayload} width={state.ui.width} onScroll={onScrollB} scrollTo={mirror.b} />}
</section>
```

`findPreset` and `builtIns` come from the store (`useBuiltIns()`). In `TopBar`, add a group:

```tsx
<div className="pg-topbar-group">
  <button type="button" className="pg-chip" aria-pressed={state.ui.compareId !== null} onClick={() => actions.setUi({ compareId: state.ui.compareId ? null : (builtIns.find((p) => p.meta.id !== state.activeId)?.meta.id ?? null) })}>
    Compare
  </button>
  {state.ui.compareId !== null && (
    <select aria-label="Compare with" className="pg-select" value={state.ui.compareId} onChange={(e) => actions.setUi({ compareId: e.target.value })}>
      {[...builtIns, ...state.customs].map((p) => <option key={p.meta.id} value={p.meta.id}>{p.meta.name}</option>)}
    </select>
  )}
</div>
```

- [ ] **Step 5: Run the tests, lint, typecheck; try it**

Run: `npm run lint && npm run typecheck && npm run test`. In the browser: Compare on, pick Night Navigation, scroll either frame and watch the other follow; both frames resize together at 390.

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/playground
git add src/playground
git commit -m "feat(playground): side-by-side compare mode with mirrored scrolling"
```

---

### Task 14: Documentation, progress record and final verification

**Files:**
- Create: `docs/theme-playground.md`
- Modify: `docs/implementation-progress.md` (new section), `README.md` (one line under scripts, if a scripts section exists)

- [ ] **Step 1: Write `docs/theme-playground.md`**

Sections, in this order, each a short paragraph or list:

1. **What it is** — one paragraph; link to the spec.
2. **Open it** — `npm run dev`, then `http://localhost:5173/playground.html`. Production builds never include it; `npm run build:playground` writes a hostable copy to `dist-playground/` and `npm run preview:playground` serves it.
3. **The screen** — top bar (preset, width, mode, route, jump list, compare, save as, reset, export, import), panel tabs, preview frame(s). Note the unsaved-changes dot.
4. **Controls** — one bullet per tab listing every control (copy from spec §6 as implemented).
5. **Presets** — the nine with a line each (from spec §7) and the rule that built-ins are read-only.
6. **Save, favourite, duplicate, rename, delete, reset, import** — where things persist (`localStorage`, keys), what reset does for built-ins vs customs.
7. **Export** — the three formats, what each is for, the file names.
8. **Applying a preset to the real site** — the five steps from spec §13, with the exact file paths (`src/theme/presets/`, `src/theme/tokens.ts`, `src/styles/index.css`, the §5.1 component table).
9. **Known limits** — spec §14 verbatim, plus "reduced-motion emulation covers the lab's CSS only".
10. **Files** — the layout from spec §16.

- [ ] **Step 2: Update `docs/implementation-progress.md`**

Append a section `## Theme playground` recording: branch, the token bridge and its verification result (CSS diff outcome, screenshot comparison done or not), the playground entry and isolation, test count before and after, the two build checks, and the limits. Be factual about anything not verified in a browser.

- [ ] **Step 3: Final verification**

```bash
npm run lint && npm run typecheck && npm run test
npm run build && ls dist/assets | grep -ci playground   # expect 0
grep -c "pg-shell" dist/assets/index-*.css              # expect 0
npm run build:playground && ls dist-playground/playground.html
git status --short                                      # only the two docs (and README) modified
```

Then `npm run dev` and walk every preset in both modes at 390 and 1280 one last time.

- [ ] **Step 4: Commit**

```bash
npx prettier --write docs/theme-playground.md docs/implementation-progress.md
git add docs/theme-playground.md docs/implementation-progress.md README.md
git commit -m "docs: theme playground guide and progress record"
```

- [ ] **Step 5: Report**

Confirm the branch (`git branch --show-current` → `theme-playground`), list the commits (`git log --oneline main..HEAD`), and hand over with: how to open it, the controls, how presets save and export, and which files hold the exported theme configuration (`src/theme/tokens.ts`, `src/theme/presets/*.ts`, and the downloaded `safewalkmaps-theme-<id>.{json,css,ts}`).
