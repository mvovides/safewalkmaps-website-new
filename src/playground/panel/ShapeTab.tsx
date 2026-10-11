import type { BUTTON_SHAPES } from '@/theme/config';
import { hexToChannels } from '@/theme/cssVariables';
import { radiusScale, shadowSet, type ShadowLevel } from '@/theme/derive';

import { useActiveConfig, usePlaygroundActions } from '../store/hooks';
import { RangeField, SegmentedChoice, SelectField } from './controls';
import { compose, setComponents, setTokens } from './updaters';

const LEVELS: ShadowLevel[] = ['none', 'soft', 'medium', 'dramatic'];
const CARD_KEYS = ['md', 'lg', 'xl', '2xl', '3xl'] as const;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ShapeTab() {
  const config = useActiveConfig();
  const { update } = usePlaygroundActions();
  const { radius, shadows, colors } = config.tokens;
  const base = radius.lg.endsWith('rem') ? parseFloat(radius.lg) : 0;
  const shape = config.components.button.shape;
  const shadowsFor = (level: ShadowLevel) =>
    shadowSet(level, colors.navy['800'], colors.navy['900'], colors.green['700']);
  const level = LEVELS.find((l) => shadowsFor(l).md === shadows.md) ?? 'custom';
  const lineAlpha = Number(/\/ ([0-9.]+)\)/.exec(colors.line.base)?.[1] ?? 0.09);

  return (
    <div className="pg-stack">
      <RangeField
        label="Base radius"
        value={base}
        min={0}
        max={2}
        step={0.125}
        format={(v) => `${v}rem`}
        onChange={(remValue) => update(setTokens({ radius: radiusScale(remValue, shape) }))}
      />
      <SegmentedChoice
        label="Button shape"
        value={shape}
        options={
          [
            { value: 'pill', label: 'Pill' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'square', label: 'Square' },
          ] as const
        }
        onChange={(next: (typeof BUTTON_SHAPES)[number]) =>
          update(
            compose(
              setComponents({ button: { shape: next } }),
              setTokens({ radius: { control: radiusScale(base, next).control } }),
            ),
          )
        }
      />
      <SelectField
        label="Card radius"
        value={CARD_KEYS.find((k) => radius[k] === radius.card) ?? '2xl'}
        options={CARD_KEYS.map((k) => ({ value: k, label: `${k} (${radius[k]})` }))}
        onChange={(k) => update(setTokens({ radius: { card: radius[k] } }))}
      />
      <SegmentedChoice
        label="Shadows"
        value={level}
        options={[
          ...LEVELS.map((l) => ({ value: l, label: cap(l) })),
          { value: 'custom' as const, label: 'Custom' },
        ]}
        onChange={(l) => {
          if (l !== 'custom') update(setTokens({ shadows: shadowsFor(l) }));
        }}
      />
      <RangeField
        label="Border strength"
        value={lineAlpha}
        min={0.04}
        max={0.4}
        step={0.01}
        format={(v) => v.toFixed(2)}
        onChange={(alpha) => {
          const ch = hexToChannels(colors.navy['800']);
          update(
            setTokens({
              colors: {
                line: {
                  base: `rgb(${ch} / ${alpha.toFixed(2)})`,
                  strong: `rgb(${ch} / ${Math.min(0.9, alpha * 1.8).toFixed(2)})`,
                },
              },
            }),
          );
        }}
      />
    </div>
  );
}
