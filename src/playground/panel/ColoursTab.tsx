import { contrastRatio, deriveSemantic, generateRamp, wcagLevel } from '@/theme/color';
import { GREEN_STEPS, NAVY_STEPS } from '@/theme/tokens';

import { useActiveConfig, usePlaygroundActions } from '../store/hooks';
import { ColorField, Field, SegmentedChoice } from './controls';
import { setTokens } from './updaters';

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
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
        onChange={(scheme) => applyPalette(colors.navy['800'], colors.green['500'], scheme)}
      />
      <ColorField
        label="Brand navy"
        value={colors.navy['800']}
        hint="Anchors the navy ramp at step 800."
        onChange={(hex) => update(setTokens({ colors: { navy: generateRamp(hex, 'navy') } }))}
      />
      <ColorField
        label="Brand green"
        value={colors.green['500']}
        hint="Anchors the green ramp at step 500."
        onChange={(hex) => update(setTokens({ colors: { green: generateRamp(hex, 'green') } }))}
      />

      <Field label="Palettes">
        <div className="pg-swatches">
          {SWATCHES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="pg-swatch"
              onClick={() => applyPalette(s.navy, s.green)}
              aria-label={s.label}
              title={s.label}
            >
              <span style={{ background: s.navy }} />
              <span style={{ background: s.green }} />
            </button>
          ))}
        </div>
      </Field>

      <details className="pg-details">
        <summary>Edit ramp steps</summary>
        {NAVY_STEPS.map((step) => (
          <ColorField
            key={step}
            label={`Navy ${step}`}
            value={colors.navy[step]}
            onChange={(hex) => update(setTokens({ colors: { navy: { [step]: hex } } }))}
          />
        ))}
        {GREEN_STEPS.map((step) => (
          <ColorField
            key={step}
            label={`Green ${step}`}
            value={colors.green[step]}
            onChange={(hex) => update(setTokens({ colors: { green: { [step]: hex } } }))}
          />
        ))}
      </details>

      <details className="pg-details" open>
        <summary>Semantic colours</summary>
        <ColorField
          label="Ink primary"
          value={colors.ink.primary}
          onChange={(hex) => update(setTokens({ colors: { ink: { primary: hex } } }))}
        />
        <ColorField
          label="Ink secondary"
          value={colors.ink.secondary}
          onChange={(hex) => update(setTokens({ colors: { ink: { secondary: hex } } }))}
        />
        <ColorField
          label="Ink tertiary"
          value={colors.ink.tertiary}
          onChange={(hex) => update(setTokens({ colors: { ink: { tertiary: hex } } }))}
        />
        <ColorField
          label="Surface"
          value={colors.surface.base}
          onChange={(hex) => update(setTokens({ colors: { surface: { base: hex } } }))}
        />
        <ColorField
          label="Surface secondary"
          value={colors.surface.secondary}
          onChange={(hex) => update(setTokens({ colors: { surface: { secondary: hex } } }))}
        />
        <ColorField
          label="Surface tertiary"
          value={colors.surface.tertiary}
          onChange={(hex) => update(setTokens({ colors: { surface: { tertiary: hex } } }))}
        />
        <ColorField
          label="Navy surface"
          value={colors.surface.navy}
          onChange={(hex) => update(setTokens({ colors: { surface: { navy: hex } } }))}
        />
        <button
          type="button"
          className="pg-button"
          onClick={() =>
            update(setTokens({ colors: deriveSemantic(colors.navy, colors.green, colors.scheme) }))
          }
        >
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
                <span className="pg-contrast-sample" style={{ color: fg, background: bg }}>
                  Aa
                </span>
                <span>{label}</span>
                <code>
                  {ratio.toFixed(1)}:1 {level}
                </code>
              </li>
            );
          })}
        </ul>
      </Field>
    </div>
  );
}
