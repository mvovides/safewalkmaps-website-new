import {
  BADGE_STYLES,
  BUTTON_HOVERS,
  BUTTON_PRIMARIES,
  CARD_STYLES,
  CTA_STYLES,
  FEATURE_LAYOUTS,
  FOOTER_STYLES,
  HERO_LAYOUTS,
  ICON_STROKES,
  ICON_STYLES,
  MAP_TONES,
  NAV_STYLES,
  ROUTE_OPTION_STYLES,
  ROUTE_STROKES,
  STATS_STYLES,
  TESTIMONIAL_STYLES,
} from '@/theme/config';
import { contentWidthSpacing, densitySpacing } from '@/theme/derive';

import { useActiveConfig, usePlaygroundActions } from '../store/hooks';
import { SegmentedChoice, SelectField } from './controls';
import { compose, setComponents, setLayout, setTokens } from './updaters';

const opts = <T extends string | number>(values: readonly T[]) =>
  values.map((v) => ({ value: v, label: String(v) }));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function LayoutTab() {
  const config = useActiveConfig();
  const { update } = usePlaygroundActions();
  const c = config.components;

  return (
    <div className="pg-stack">
      <SegmentedChoice
        label="Density"
        value={config.layout.density}
        options={(['compact', 'comfortable', 'airy'] as const).map((d) => ({
          value: d,
          label: cap(d),
        }))}
        onChange={(density) =>
          update(compose(setLayout({ density }), setTokens({ spacing: densitySpacing(density) })))
        }
      />
      <SegmentedChoice
        label="Content width"
        value={config.layout.contentWidth}
        options={(['narrow', 'default', 'wide'] as const).map((w) => ({ value: w, label: cap(w) }))}
        onChange={(contentWidth) =>
          update(
            compose(
              setLayout({ contentWidth }),
              setTokens({ spacing: contentWidthSpacing(contentWidth) }),
            ),
          )
        }
      />
      <SegmentedChoice
        label="Section dividers"
        value={config.layout.dividers}
        options={(['none', 'hairline', 'tonal'] as const).map((d) => ({ value: d, label: cap(d) }))}
        onChange={(dividers) => update(setLayout({ dividers }))}
      />

      <SelectField
        label="Navigation"
        value={c.nav.style}
        options={opts(NAV_STYLES)}
        onChange={(style) => update(setComponents({ nav: { style } }))}
        hint="Glass, solid bar, floating pill, text-only, or dark."
      />
      <SelectField
        label="Hero layout"
        value={c.hero.layout}
        options={opts(HERO_LAYOUTS)}
        onChange={(layout) => update(setComponents({ hero: { layout } }))}
      />
      <SelectField
        label="Button colour"
        value={c.button.primary}
        options={opts(BUTTON_PRIMARIES)}
        onChange={(primary) => update(setComponents({ button: { primary } }))}
      />
      <SelectField
        label="Button hover"
        value={c.button.hover}
        options={opts(BUTTON_HOVERS)}
        onChange={(hover) => update(setComponents({ button: { hover } }))}
      />
      <SelectField
        label="Cards"
        value={c.card.style}
        options={opts(CARD_STYLES)}
        onChange={(style) => update(setComponents({ card: { style } }))}
      />
      <SelectField
        label="Feature layout"
        value={c.features.layout}
        options={opts(FEATURE_LAYOUTS)}
        onChange={(layout) => update(setComponents({ features: { layout } }))}
      />
      <SelectField
        label="Route options"
        value={c.routeOptions.style}
        options={opts(ROUTE_OPTION_STYLES)}
        onChange={(style) => update(setComponents({ routeOptions: { style } }))}
      />
      <SelectField
        label="Stats"
        value={c.stats.style}
        options={opts(STATS_STYLES)}
        onChange={(style) => update(setComponents({ stats: { style } }))}
      />
      <SelectField
        label="Badges"
        value={c.badge.style}
        options={opts(BADGE_STYLES)}
        onChange={(style) => update(setComponents({ badge: { style } }))}
      />
      <SelectField
        label="Map tone"
        value={c.mapUi.tone}
        options={opts(MAP_TONES)}
        onChange={(tone) => update(setComponents({ mapUi: { tone } }))}
      />
      <SelectField
        label="Route stroke"
        value={c.mapUi.routeStroke}
        options={opts(ROUTE_STROKES)}
        onChange={(routeStroke) => update(setComponents({ mapUi: { routeStroke } }))}
      />
      <SelectField
        label="Icon style"
        value={c.icons.style}
        options={opts(ICON_STYLES)}
        onChange={(style) => update(setComponents({ icons: { style } }))}
      />
      <SegmentedChoice
        label="Icon stroke"
        value={c.icons.strokeWidth}
        options={opts(ICON_STROKES)}
        onChange={(strokeWidth) => update(setComponents({ icons: { strokeWidth } }))}
      />
      <SelectField
        label="Testimonial"
        value={c.testimonial.style}
        options={opts(TESTIMONIAL_STYLES)}
        onChange={(style) => update(setComponents({ testimonial: { style } }))}
        hint="Placeholder copy only. Real quotes need permission."
      />
      <SelectField
        label="Call to action"
        value={c.cta.style}
        options={opts(CTA_STYLES)}
        onChange={(style) => update(setComponents({ cta: { style } }))}
      />
      <SelectField
        label="Footer"
        value={c.footer.style}
        options={opts(FOOTER_STYLES)}
        onChange={(style) => update(setComponents({ footer: { style } }))}
      />
    </div>
  );
}
