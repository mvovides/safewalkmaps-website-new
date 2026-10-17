# Theme playground

A design sandbox for the SafeWalkMaps website. Change almost every visual variable, watch
real SafeWalkMaps components update, save the directions you like, and export the exact
configuration for the one you choose. The design is recorded in
[`superpowers/specs/2026-10-11-theme-playground-design.md`](superpowers/specs/2026-10-11-theme-playground-design.md).

## Open it

```bash
npm run dev
```

Then open <http://localhost:5173/playground.html>. The normal site is still at `/`.

The production build never includes the playground: `npm run build` writes `dist/` with no
playground code or CSS. To host a copy for review, `npm run build:playground` writes a
self-contained `dist-playground/` and `npm run preview:playground` serves it.

## The screen

- **Top bar.** Preset selector and the active preset's name, with an amber dot when a built-in
  has unsaved edits. Save as, Reset, Export, Import. Compare toggle and the preset to compare
  with. Preview width: Phone (390), Tablet (768), Desktop (1280) or Fluid. Mode: Component lab
  or Live site, with a route selector in Live site and a section jump list in the lab.
- **Panel** on the left, seven tabs. Every control applies immediately.
- **Preview** on the right: an iframe running the same page in preview mode. A fixed width
  wider than the stage is scaled to fit, and the document inside still measures the true
  width, so the site's breakpoints behave exactly as they do live.

## Controls

- **Presets.** Search, favourites filter, and for each preset: select, favourite, duplicate,
  reset to base, and for custom presets rename and delete.
- **Colours.** Light or dark scheme. Brand navy and brand green pickers, each regenerating its
  tonal ramp around the colour you pick. Eight curated palettes. An expander to edit every ramp
  step. Semantic colours (ink, surfaces, navy surface) with "Derive from palette". Live WCAG
  2.1 contrast readouts with AA/AAA grades for the pairs the site depends on.
- **Typography.** Body, heading and mono families from a curated list (hosted families load
  from Google Fonts inside the playground only). Heading weight. Type scale: compact, default,
  editorial, display. Display tracking.
- **Shape.** Base radius, which regenerates the radius scale. Button shape: pill, rounded,
  square. Card radius. Shadow level: none, soft, medium, dramatic, tinted from the palette.
  Border strength.
- **Layout.** Density (compact, comfortable, airy), content width, section dividers, and one
  select per component: navigation, hero layout, button colour and hover, cards, feature
  layout, route options, stats, badges, map tone, route stroke, icon style and stroke,
  testimonial, call to action, footer.
- **Motion.** Intensity (none, subtle, standard, expressive), reveal style (rise, fade, mask,
  scale), hover lift on cards, and a reduced-motion emulation for the lab's CSS.
- **Content.** Headline variant (default, benefit, direct, question), tone of the small
  caption under the call to action, and the CTA label (40 characters).

## Preview modes

**Component lab** is a long page of SafeWalkMaps compositions built from the site's own
primitives: navigation, hero, route and safety visualisation, route options (fastest,
balanced, safer), safety score, features, stats, badges and chips, buttons, typography,
icons, map UI elements, testimonial, call to action and footer. Every layout and style
variant renders here, and each section's caption names the variant in play.

**Live site** renders the real pages (`/`, `/safety-score`, `/features`, `/about`, `/faq`)
through the production `App` with the token overrides applied. Use it to judge palette,
type, shape, depth, spacing and motion on the actual pages. Component variants do not apply
here; they are the playground's proposals for how the real sections could change.

## Presets

Built-in presets are read-only. Editing one creates a draft (the amber dot); "Save as" keeps
it as a custom preset. Nine ship with the playground:

| Preset             | Direction                                                                             |
| ------------------ | ------------------------------------------------------------------------------------- |
| SafeWalkMaps Today | The current site, exactly. Everything else is measured against it.                    |
| Clean Minimal      | Near-black ink on white, hairline cards, square-ish corners, no shadows, lots of air. |
| Premium Modern     | Deeper navy, large radii, layered shadows, gradient button, bento features.           |
| Safety First       | High contrast, AA-safe green as the signal colour, route cards, stat tiles.           |
| Night Navigation   | Dark surfaces, bright green, mono figures, night map, immersive hero.                 |
| Light and Airy     | Off-white surfaces, lighter navy, pastel tints, DM Sans, generous space.              |
| Bold Startup       | Saturated green buttons, heavy display type, editorial hero, navy CTA band.           |
| Cupertino          | System type, tight tracking, soft radii, glass everywhere, quiet motion.              |
| Wayfinder          | Map-first hero, cased route strokes, floating pill bar, filled icon tiles.            |

## Saving, favourites and import

Custom presets, favourites, the current draft and the UI state persist in this browser's
`localStorage` under `swm-playground.v1.*`. Nothing leaves the machine. If storage is
blocked, the playground runs in memory for the session.

- **Reset** on a built-in discards its draft. On a custom preset it restores the tokens and
  choices of the built-in it was based on (or Today if that base no longer exists) and keeps
  the name.
- **Import** accepts a JSON file or pasted text. It is validated; anything that is not a
  theme is refused with the reasons listed. Imported presets become custom presets.

## Export

Export offers three formats of the active preset, each copyable or downloadable as
`safewalkmaps-theme-<id>.<ext>`:

- **JSON** is the canonical format. It holds everything and re-imports.
- **CSS** is the `:root` block of custom properties, ready for `src/styles/index.css`, with
  the component choices listed in a comment.
- **TypeScript** is a preset module ready to drop into `src/theme/presets/`.

Names containing comment terminators are neutralised in the generated comments, and the
validator refuses token values that could close a CSS declaration, so an imported file cannot
smuggle CSS or code into an export.

## Applying a chosen preset to the real site

1. **Tokens.** Export JSON. Either save the TypeScript export as `src/theme/presets/<id>.ts`
   and point `src/theme/tokens.ts`'s `defaultTokens` at its `tokens`, or copy the token values
   into `defaultTokens` directly. The Tailwind plugin emits the new values on `:root` and every
   utility, inline SVG and GSAP timeline follows. Build, run the suite, check in a browser.
   The preset builder's baselines (the "standard" motion set, the Inter stack) are fixed in
   `derive.ts` and `build.ts`, so changing `defaultTokens` changes the site and the Today
   preset, never the other built-ins.
2. **Fonts.** If the body or heading family is not one the site bundles (Instrument Sans or
   Inter), add its `@fontsource-variable/*` package and import it at the top of
   `src/styles/index.css`. The package registers the family with a " Variable" suffix, while
   an exported stack names it as Google serves it, so put the registered name first:
   `'Instrument Sans Variable', 'Instrument Sans', …`. A stack without it falls through to
   the next family without any warning. `FONT_STACKS` in `src/theme/tokens.ts` holds the
   bundled stacks.
3. **Component variants.** Read the `components` block of the export. For each entry that
   differs from Today, port the lab composition into the production component it stands in
   for: navigation → `SiteHeader`; hero → `HeroMain` in `HeroSection`; route options →
   `RouteChoiceSection`; safety score panel → `SafetyScoreSection`; features and their icons
   → `FeatureSection`; the card material → `cardSurface` in `src/components/ui/`; call to
   action → `FinalCtaSection`; footer → `SiteFooter`; badges → `Chip`; buttons → `Button`.
   One commit per component.
4. **Dark schemes only.** The real sections use literal `white` and `navy-950` utilities in
   places (button labels on navy, glass tints, phone bezels). Live site mode shows where.
   Replace them with semantic tokens (`ink-inverse`, `surface-navy`) as part of the port.
5. **Navy surface.** The safety score, mission and footer sections set translucent white
   text on `surface.navy`. If the new navy surface is lighter, recheck those opacities
   against it; the contrast notes in `tailwind.config.ts` give the floors.
6. Update `docs/implementation-progress.md`.

## Known limits

- Live site mode is faithful to tokens, not to layout variants.
- Dark presets expose literal-white utilities in Live site mode until the port in step 4.
- The brand mark, the logo's wordmark and the score ring's green gradient never re-theme. The
  mark and wordmark are the logo; the ring gradient is kept constant so the ring reads the
  same in every preset.
- Heading weight reaches the lab and the base heading rule, but production headings that
  carry an explicit weight utility keep it until the port removes it. Heading family does
  reach them.
- The reduced-motion toggle emulates the preference for the lab's CSS only. The real site's
  GSAP stories read the OS setting.
- Hosted fonts come from Google Fonts by URL, in the playground only. Offline, those families
  fall back to the system stack.

## Files

| Path                                                          | Holds                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/theme/tokens.ts`                                         | The token type and today's values. The one place production reads. |
| `src/theme/cssVariables.ts`                                   | Tokens to CSS custom properties.                                   |
| `src/theme/config.ts`, `validate.ts`, `export.ts`, `apply.ts` | The theme model, parser, exporters and runtime application.        |
| `src/theme/color.ts`, `derive.ts`, `build.ts`                 | Colour maths, derived token sets and the preset builder.           |
| `src/theme/presets/`                                          | The nine built-in presets.                                         |
| `playground.html`, `src/playground/`                          | The playground: shell, panel, preview, lab, store.                 |
| `tailwind.config.ts`                                          | Utilities read the variables; the plugin emits the defaults.       |
