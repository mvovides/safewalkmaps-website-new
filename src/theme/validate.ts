import {
  BADGE_STYLES,
  BUTTON_HOVERS,
  BUTTON_PRIMARIES,
  BUTTON_SHAPES,
  CARD_STYLES,
  CONTENT_WIDTHS,
  CTA_LABEL_MAX,
  CTA_STYLES,
  DENSITIES,
  DIVIDERS,
  FEATURE_LAYOUTS,
  FOOTER_STYLES,
  HEADLINES,
  HERO_LAYOUTS,
  ICON_STROKES,
  ICON_STYLES,
  MAP_TONES,
  MOTION_INTENSITIES,
  NAV_STYLES,
  REVEAL_STYLES,
  ROUTE_OPTION_STYLES,
  ROUTE_STROKES,
  SCHEMA_VERSION,
  STATS_STYLES,
  TESTIMONIAL_STYLES,
  TONES,
  type ThemeConfig,
} from './config';
import { GREEN_STEPS, NAVY_STEPS, RADIUS_KEYS, SHADOW_KEYS, TYPE_STEPS } from './tokens';

export type ParseResult =
  { ok: true; config: ThemeConfig; warnings: string[] } | { ok: false; errors: string[] };

const HEX = /^#[0-9a-f]{6}$/i;
const RGB = /^rgba?\([^;{}<>]*\)$/i;
const HEADING_WEIGHTS = [500, 600, 700, 800] as const;

/**
 * Token strings are written verbatim into a `:root` block by the CSS export and
 * into `style.setProperty` by the preview. A value that could close a declaration
 * or open a comment is refused, so an imported preset cannot smuggle CSS through
 * a font stack or a shadow.
 */
const isSafeCssValue = (s: string) => !/[;{}<>]/.test(s) && !s.includes('/*') && !s.includes('*/');

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Checks a value against the ThemeConfig shape and returns a fresh object built only
 * from known keys. Every problem is collected rather than thrown, so the import
 * dialog can list them all; unknown keys are dropped with a warning.
 */
export function parseThemeConfig(input: unknown): ParseResult {
  const errors: string[] = [];
  const warnings = new Set<string>();

  if (!isRec(input)) return { ok: false, errors: ['Expected a JSON object.'] };
  if (input.schemaVersion !== SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [
        `schemaVersion must be ${SCHEMA_VERSION}; got ${JSON.stringify(input.schemaVersion)}.`,
      ],
    };
  }

  const str = (v: unknown, path: string, test?: (s: string) => boolean, hint = ''): string => {
    if (typeof v !== 'string' || (test && !test(v))) {
      errors.push(
        `${path}: expected a string${hint ? ` (${hint})` : ''}; got ${JSON.stringify(v)}.`,
      );
      return '';
    }
    return v;
  };
  const css = (v: unknown, path: string) =>
    str(v, path, isSafeCssValue, 'CSS value without ; { } < > or comment markers');
  const hex = (v: unknown, path: string) =>
    str(v, path, (s) => HEX.test(s), 'hex colour like #062A5E');
  const rgb = (v: unknown, path: string) =>
    str(v, path, (s) => RGB.test(s), 'rgb(r g b / a) string');
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
  const oneOf = <T extends readonly (string | number)[]>(
    v: unknown,
    path: string,
    allowed: T,
  ): T[number] => {
    if (!(allowed as readonly unknown[]).includes(v)) {
      errors.push(
        `${path}: expected one of ${allowed.map(String).join(', ')}; got ${JSON.stringify(v)}.`,
      );
      return allowed[0] as T[number];
    }
    return v as T[number];
  };
  const obj = (v: unknown, path: string, known: readonly string[]): Rec => {
    if (!isRec(v)) {
      errors.push(`${path}: expected an object.`);
      return {};
    }
    for (const key of Object.keys(v)) {
      if (!known.includes(key)) warnings.add(`${path}.${key}: unknown key dropped.`);
    }
    return v;
  };
  const record = <K extends string>(
    v: unknown,
    path: string,
    keys: readonly K[],
    each: (x: unknown, p: string) => string,
  ): Record<K, string> => {
    const source = obj(v, path, keys);
    return Object.fromEntries(keys.map((k) => [k, each(source[k], `${path}.${k}`)])) as Record<
      K,
      string
    >;
  };

  const root = obj(input, 'config', [
    'schemaVersion',
    'meta',
    'tokens',
    'components',
    'layout',
    'motion',
    'content',
  ]);
  const meta = obj(root.meta, 'meta', [
    'id',
    'name',
    'description',
    'builtIn',
    'basedOn',
    'favourite',
    'createdAt',
    'updatedAt',
  ]);
  const tokens = obj(root.tokens, 'tokens', [
    'colors',
    'typography',
    'radius',
    'shadows',
    'spacing',
    'motion',
  ]);
  const colors = obj(tokens.colors, 'tokens.colors', [
    'scheme',
    'navy',
    'green',
    'ink',
    'surface',
    'line',
    'danger',
    'warning',
  ]);
  const typography = obj(tokens.typography, 'tokens.typography', [
    'sans',
    'display',
    'mono',
    'headingWeight',
    'scale',
  ]);
  const scaleSource = obj(typography.scale, 'tokens.typography.scale', TYPE_STEPS);
  const spacing = obj(tokens.spacing, 'tokens.spacing', [
    'section',
    'sectionLg',
    'gutter',
    'shell',
    'shellWide',
    'prose',
    'proseLg',
  ]);
  const motionTokens = obj(tokens.motion, 'tokens.motion', ['duration', 'ease', 'revealScale']);
  const components = obj(root.components, 'components', [
    'button',
    'card',
    'nav',
    'hero',
    'cta',
    'footer',
    'features',
    'stats',
    'badge',
    'routeOptions',
    'mapUi',
    'icons',
    'testimonial',
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
      const path = `tokens.typography.scale.${step}`;
      const style = obj(scaleSource[step], path, ['size', 'lineHeight', 'letterSpacing']);
      return [
        step,
        {
          size: css(style.size, `${path}.size`),
          lineHeight: css(style.lineHeight, `${path}.lineHeight`),
          letterSpacing: css(style.letterSpacing, `${path}.letterSpacing`),
        },
      ];
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
        ink: record(
          colors.ink,
          'tokens.colors.ink',
          ['primary', 'secondary', 'tertiary', 'inverse'] as const,
          hex,
        ),
        surface: record(
          colors.surface,
          'tokens.colors.surface',
          ['base', 'secondary', 'tertiary', 'navy', 'navySoft'] as const,
          hex,
        ),
        line: record(
          colors.line,
          'tokens.colors.line',
          ['base', 'strong', 'inverse', 'inverseStrong'] as const,
          rgb,
        ),
        danger: record(colors.danger, 'tokens.colors.danger', ['base', 'soft'] as const, hex),
        warning: record(
          colors.warning,
          'tokens.colors.warning',
          ['base', 'ink', 'soft'] as const,
          hex,
        ),
      },
      typography: {
        sans: css(typography.sans, 'tokens.typography.sans'),
        display:
          typography.display === null ? null : css(typography.display, 'tokens.typography.display'),
        mono: css(typography.mono, 'tokens.typography.mono'),
        headingWeight: oneOf(
          typography.headingWeight,
          'tokens.typography.headingWeight',
          HEADING_WEIGHTS,
        ),
        scale,
      },
      radius: record(tokens.radius, 'tokens.radius', RADIUS_KEYS, css),
      shadows: record(tokens.shadows, 'tokens.shadows', SHADOW_KEYS, css),
      spacing: {
        section: css(spacing.section, 'tokens.spacing.section'),
        sectionLg: css(spacing.sectionLg, 'tokens.spacing.sectionLg'),
        gutter: css(spacing.gutter, 'tokens.spacing.gutter'),
        shell: css(spacing.shell, 'tokens.spacing.shell'),
        shellWide: css(spacing.shellWide, 'tokens.spacing.shellWide'),
        prose: css(spacing.prose, 'tokens.spacing.prose'),
        proseLg: css(spacing.proseLg, 'tokens.spacing.proseLg'),
      },
      motion: {
        duration: record(
          motionTokens.duration,
          'tokens.motion.duration',
          ['fast', 'base', 'slow', 'slower'] as const,
          css,
        ),
        ease: record(
          motionTokens.ease,
          'tokens.motion.ease',
          ['outExpo', 'outQuint', 'inOutSoft', 'outBack'] as const,
          css,
        ),
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
      features: {
        layout: oneOf(features.layout, 'components.features.layout', FEATURE_LAYOUTS),
      },
      stats: { style: oneOf(stats.style, 'components.stats.style', STATS_STYLES) },
      badge: { style: oneOf(badge.style, 'components.badge.style', BADGE_STYLES) },
      routeOptions: {
        style: oneOf(routeOptions.style, 'components.routeOptions.style', ROUTE_OPTION_STYLES),
      },
      mapUi: {
        tone: oneOf(mapUi.tone, 'components.mapUi.tone', MAP_TONES),
        routeStroke: oneOf(mapUi.routeStroke, 'components.mapUi.routeStroke', ROUTE_STROKES),
      },
      icons: {
        style: oneOf(icons.style, 'components.icons.style', ICON_STYLES),
        strokeWidth: oneOf(icons.strokeWidth, 'components.icons.strokeWidth', ICON_STROKES),
      },
      testimonial: {
        style: oneOf(testimonial.style, 'components.testimonial.style', TESTIMONIAL_STYLES),
      },
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
        content.ctaLabel,
        'content.ctaLabel',
        (s) => s.trim().length > 0 && s.length <= CTA_LABEL_MAX,
        `1–${CTA_LABEL_MAX} characters`,
      ),
    },
  };

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, config, warnings: Array.from(warnings) };
}
