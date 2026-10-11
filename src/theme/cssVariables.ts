import {
  GREEN_STEPS,
  NAVY_STEPS,
  RADIUS_KEYS,
  SHADOW_KEYS,
  TYPE_STEPS,
  type ThemeTokens,
} from './tokens';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#062A5E` → `6 42 94`, the form Tailwind needs behind `<alpha-value>`. */
export function hexToChannels(hex: string): string {
  const match = HEX.exec(hex.trim());
  if (!match) throw new Error(`Expected a hex colour, got "${hex}"`);
  let digits = match[1] as string;
  if (digits.length === 3) {
    digits = digits
      .split('')
      .map((d) => d + d)
      .join('');
  }
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
  for (const step of GREEN_STEPS) {
    vars[`--color-green-${step}`] = hexToChannels(colors.green[step]);
  }
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
