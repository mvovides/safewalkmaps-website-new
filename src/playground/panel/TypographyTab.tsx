import { useEffect } from 'react';

import { typeScale, type TypeScaleName } from '@/theme/derive';
import type { HeadingWeight, ThemeTokens } from '@/theme/tokens';

import { ensureFontLoaded, fontOptions } from '../fonts';
import { useActiveConfig, usePlaygroundActions } from '../store/hooks';
import { RangeField, SegmentedChoice, SelectField } from './controls';
import { setTokens } from './updaters';

const SCALES: TypeScaleName[] = ['compact', 'default', 'editorial', 'display'];
const DISPLAY = ['display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm'] as const;
const SAME_AS_BODY = '__same__';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Scale = ThemeTokens['typography']['scale'];

function detectScale(scale: Scale): TypeScaleName | 'custom' {
  const sizes = (s: Scale) => DISPLAY.map((step) => s[step].size).join('|');
  return SCALES.find((name) => sizes(typeScale(name)) === sizes(scale)) ?? 'custom';
}

export function TypographyTab() {
  const { tokens } = useActiveConfig();
  const { update } = usePlaygroundActions();
  const { typography } = tokens;

  // Show each hosted family in its own face inside the panel's selects.
  useEffect(() => {
    for (const option of fontOptions) ensureFontLoaded(document, option.stack);
  }, []);

  const byRole = (role: 'sans' | 'display' | 'mono') =>
    fontOptions
      .filter((f) => f.roles.includes(role))
      .map((f) => ({ value: f.stack, label: f.label }));
  const inFace = (stack: string) => (stack === SAME_AS_BODY ? undefined : { fontFamily: stack });
  const tracking = parseFloat(typography.scale['display-xl'].letterSpacing) || 0;

  return (
    <div className="pg-stack">
      <SelectField
        label="Body family"
        value={typography.sans}
        options={byRole('sans')}
        optionStyle={inFace}
        onChange={(sans) => update(setTokens({ typography: { sans } }))}
        hint="Hosted families load from Google Fonts in the playground only."
      />
      <SelectField
        label="Heading family"
        value={typography.display ?? SAME_AS_BODY}
        options={[{ value: SAME_AS_BODY, label: 'Same as body' }, ...byRole('display')]}
        optionStyle={inFace}
        onChange={(v) =>
          update(setTokens({ typography: { display: v === SAME_AS_BODY ? null : v } }))
        }
      />
      <SelectField
        label="Mono family"
        value={typography.mono}
        options={byRole('mono')}
        optionStyle={inFace}
        onChange={(mono) => update(setTokens({ typography: { mono } }))}
      />
      <SegmentedChoice
        label="Heading weight"
        value={typography.headingWeight}
        options={([500, 600, 700, 800] as HeadingWeight[]).map((w) => ({
          value: w,
          label: String(w),
        }))}
        onChange={(headingWeight) => update(setTokens({ typography: { headingWeight } }))}
      />
      <SegmentedChoice
        label="Type scale"
        value={detectScale(typography.scale)}
        options={[
          ...SCALES.map((s) => ({ value: s, label: cap(s) })),
          { value: 'custom' as const, label: 'Custom' },
        ]}
        onChange={(name) => {
          if (name !== 'custom') update(setTokens({ typography: { scale: typeScale(name) } }));
        }}
      />
      <RangeField
        label="Display tracking"
        value={tracking}
        min={-0.07}
        max={0.02}
        step={0.005}
        format={(v) => `${v.toFixed(3)}em`}
        onChange={(em) => {
          const delta = em - tracking;
          const scale = Object.fromEntries(
            DISPLAY.map((step) => {
              const current = parseFloat(typography.scale[step].letterSpacing) || 0;
              return [step, { letterSpacing: `${Math.round((current + delta) * 1000) / 1000}em` }];
            }),
          );
          update(setTokens({ typography: { scale } }));
        }}
      />
    </div>
  );
}
