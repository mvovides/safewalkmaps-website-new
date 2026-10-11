# Theme playground — a design sandbox for the SafeWalkMaps website

Date: 2026-10-11
Branch: `theme-playground`, cut from `main` at `1e9a2c8`

## Why

The site has one visual direction, chosen early: white surfaces, logo-derived navy and
green, Inter, pill buttons, glass navigation. Before committing to it for launch, the owner
wants to see genuinely different directions side by side, on real SafeWalkMaps components
and copy, and to export the one they choose in a form that can be applied to the site
without re-deriving it.

Today that is not possible. The design system's colours, radii, shadows, type scale and
spacing are literal values in `tailwind.config.ts`. Nothing about the rendered site can be
changed at runtime, so a "theme" cannot be tried without editing source and rebuilding.

The goal is a playground page where almost every visual variable can be changed and the
site components update immediately; a set of complete, deliberately different presets;
saving and favouriting; and an export whose contents are exactly what the real site will
consume.

## Decisions

Put to the owner and answered. Recorded so the reasoning is not lost.

1. **Token bridge, not isolated copies.** The Tailwind theme moves onto CSS custom
   properties holding today's exact values. The playground then re-themes the *real*
   header, buttons, phone mockups and sections, and applying a chosen preset later is a
   data change rather than a port. The alternative of a playground built from copies of the
   components was rejected because the previews would drift from the real site and the
   chosen design would have to be re-implemented by hand.
2. **Separate Vite entry with an iframe preview.** `playground.html` is a second page,
   excluded from the production build. The preview renders inside an iframe so the fixed
   glass navigation, the `lg` breakpoint and the scroll animations behave exactly as on the
   live site, and the control panel is never affected by the theme under test. A gated route
   inside the main app was rejected because an inline preview cannot respond to breakpoints,
   fights the fixed header, and would have to be special-cased in the route tests.
3. **Full scope.** Compare mode and a Live-site preview mode are in, not deferred.

Standing constraints from `CLAUDE.md` that shape this work: the logo and brand identity
are not changed by a theme; no testimonials, statistics or social proof are invented; and
nothing in the playground ships to production.

## Goals

- Change colours, typography, shape, depth, spacing, layout, component styles, motion and
  copy, and see SafeWalkMaps components update live, at phone, tablet and desktop widths.
- Nine complete presets with materially different directions, including the exact current
  site as a baseline.
- Save, favourite, duplicate, rename, delete and reset presets; compare two side by side.
- Export a preset as JSON (canonical), a CSS `:root` block, or a TypeScript file; import a
  previously exported JSON.
- The production build is byte-for-byte unaffected in behaviour: same rendered values, no
  playground code or CSS, no new runtime dependency.

## Non-goals

- Deploying the playground. A `build:playground` script exists so it *can* be hosted for
  review, but hosting is a separate decision.
- Porting structural variants into the production sections. The playground defines them
  and documents the mapping; the port happens when a preset is chosen.
- A design-token pipeline beyond this site (Figma sync, Style Dictionary, etc.).

## Architecture

```
tailwind.config.ts ──imports──▶ src/theme/tokens.ts (ThemeTokens + defaultTokens)
        │                                │
        │  plugin: addBase({ ':root': tokensToCssVariables(defaultTokens) })
        │  utilities: rgb(var(--color-navy-800) / <alpha-value>), var(--radius-lg) …
        ▼
  production CSS  (same resolved values as today; no JS involved)

playground.html ──▶ src/playground/main.tsx
        │   no ?preview  → <Shell/>   control panel, presets, export, iframes
        │   ?preview=1   → <Preview/> applies ThemeConfig to <html>, renders
        │                             Component lab or the real <App/>
        └── shell ⇄ preview over window.postMessage (same origin)
```

Three layers, each usable without the one above it:

| Layer | Lives in | Depends on | Ships to production |
| --- | --- | --- | --- |
| Tokens and theme model | `src/theme/` | nothing (no DOM) | tokens only, via Tailwind |
| Theme application | `src/theme/apply.ts` | DOM | no |
| Playground | `src/playground/`, `playground.html` | both above, site components | no |

## 1. Token bridge

### 1.1 `ThemeTokens`

`src/theme/tokens.ts` exports the type and `defaultTokens`, whose values are today's
literals copied from `tailwind.config.ts` and `src/styles/index.css`. The module uses no
DOM or `import.meta` so it type-checks under `tsconfig.node.json` when the Tailwind config
imports it.

```ts
export type ThemeTokens = {
  colors: {
    scheme: 'light' | 'dark';                      // → color-scheme on :root
    navy:  Record<NavyStep, string>;               // 50…950, hex
    green: Record<GreenStep, string>;              // 50…900, hex
    ink:     { primary: string; secondary: string; tertiary: string; inverse: string };
    surface: { base: string; secondary: string; tertiary: string; navy: string; navySoft: string };
    line:    { base: string; strong: string; inverse: string; inverseStrong: string }; // full rgb()/alpha strings
    danger:  { base: string; soft: string };
    warning: { base: string; ink: string; soft: string };
  };
  typography: {
    sans: string;            // full font-family stack
    display: string | null;  // optional separate heading family; null = same as sans
    mono: string;
    headingWeight: 500 | 600 | 700 | 800;
    scale: Record<TypeStep, { size: string; lineHeight: string; letterSpacing: string }>;
    // TypeStep = display-2xl | display-xl | display-lg | display-md | display-sm |
    //            body-xl | body-lg | body | body-sm | caption | label
  };
  radius: {
    xs: string; sm: string; md: string; lg: string; xl: string;
    '2xl': string; '3xl': string; phone: string; pill: string;
    control: string;   // buttons, inputs, pills — new, defaults to pill
    card: string;      // cards — new, defaults to 2xl
  };
  shadows: Record<'xs'|'sm'|'md'|'lg'|'xl'|'phone'|'phoneSm'|'green'|'greenLg'|'inset', string>;
  spacing: {
    section: string; sectionLg: string; gutter: string;        // → spacing.*
    shell: string; shellWide: string; prose: string; proseLg: string; // → maxWidth.*
  };
  motion: {
    duration: { fast: string; base: string; slow: string; slower: string };
    ease: { outExpo: string; outQuint: string; inOutSoft: string; outBack: string };
    revealScale: number;   // multiplies the reveal travel; 1 = today, 0 = no travel
  };
};
```

### 1.2 CSS variables

`src/theme/cssVariables.ts` exports `tokensToCssVariables(tokens): Record<string, string>`.
Naming:

| Token | Variable | Form | Why |
| --- | --- | --- | --- |
| `colors.navy[800]` | `--color-navy-800` | `6 42 94` (channels) | needed for `<alpha-value>` so `bg-navy-800/35` still works |
| `colors.green`, `ink`, `surface`, `danger`, `warning` | `--color-<family>-<step>` | channels | same |
| `colors.line.*` | `--color-line`, `--color-line-strong`, `--color-line-inverse`, `--color-line-inverse-strong` | full `rgb(… / a)` string | alpha is part of the value; no utility applies a modifier to these (checked) |
| `colors.scheme` | `--color-scheme` | keyword | `:root { color-scheme: var(--color-scheme) }` |
| `typography.sans` / `display` / `mono` | `--font-sans`, `--font-display`, `--font-mono` | stack | `display` falls back to `var(--font-sans)` when null |
| `typography.headingWeight` | `--heading-weight` | number | applied in the `h1–h4` base rule |
| `typography.scale.*` | `--text-<step>`, `--leading-<step>`, `--tracking-<step>` | as today (`clamp()` allowed) | |
| `radius.*` | `--radius-<key>` | length | |
| `shadows.*` | `--shadow-<key>` | shadow list | |
| `spacing.*` | `--space-section`, `--space-section-lg`, `--space-gutter`, `--width-shell`, `--width-shell-wide`, `--width-prose`, `--width-prose-lg` | length | |
| `motion.duration.*` | `--duration-fast` … | time | these names already exist in `index.css`; the declarations move here |
| `motion.ease.*` | `--ease-out-expo` … | easing | same |
| `motion.revealScale` | `--reveal-scale` | number | |

The converter also emits the **legacy hex variables** the SVG illustrations read today, so
no illustration changes: `--brand-navy` (= navy.800), `--brand-navy-bright` (700),
`--brand-navy-deep` (900), `--brand-navy-darkest` (950), `--brand-green` (green.500),
`--brand-green-light` (300), `--brand-green-mid` (400), `--brand-green-muted` (700),
`--brand-green-ink` (800), `--surface`, `--surface-secondary`, `--surface-tertiary`,
`--surface-navy`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--border`,
`--border-strong`, `--danger`, `--warning`. Each is derived from the same token, so a
preset cannot leave an SVG on the old colour.

### 1.3 Tailwind config

`tailwind.config.ts` imports `defaultTokens` and `tokensToCssVariables` and:

- Generates `theme.extend.colors` from the token keys. Channel families become
  `rgb(var(--color-navy-800) / <alpha-value>)`; line colours become `var(--color-line)`.
  Adding a palette step is then one edit in `tokens.ts`.
- Maps `borderRadius`, `boxShadow`, `fontFamily`, `fontSize` (size, line-height and
  letter-spacing each a variable), `spacing.section|section-lg|gutter`, `maxWidth.*`,
  `transitionDuration.fast|base|slow|slower` and `transitionTimingFunction.out-*|in-out-soft`
  to the variables above. `spacing.13`, the press and spring durations, keyframes and
  animations are unchanged.
- Adds `borderRadius.control` and `borderRadius.card`.
- Registers a plugin: `addBase({ ':root': tokensToCssVariables(defaultTokens) })`. The
  defaults therefore ship inside `@layer base`, exactly where the hand-written `:root`
  block sits today, so cascade order is unchanged and the site needs no JavaScript to be
  themed.

The `fineOpacity` scale, `content` globs (see §3) and everything else stay.

### 1.4 `src/styles/index.css`

- The hand-written brand/surface/text/border/danger/warning/duration/ease declarations in
  `:root` are removed; the plugin now emits them. The springs, press durations,
  `--nav-height`, `--nav-edge-fade`, `--signal-step`, `--hero-intro` and the
  tap-highlight rule stay.
- `color-scheme: light` becomes `color-scheme: var(--color-scheme)`.
- The `h1–h4` base rule takes `font-weight: var(--heading-weight)` and
  `font-family: var(--font-display)` in place of `font-semibold`. Default values reproduce
  today's rendering. This base rule is the carrier for the heading tokens: a heading that
  also carries an explicit `font-semibold` utility (the hero `h1`, `FeatureCard` titles)
  keeps that weight regardless of the token until the utility is removed in the port.
  Lab compositions never add a weight utility to a heading, so the token reaches them.
- The reveal rules use `calc(1.25rem * var(--reveal-scale))` (desktop) and
  `calc(0.75rem * var(--reveal-scale))` (below `lg`) instead of the literal distances.
- The `prefers-contrast: more` block overrides the variables instead of restating
  utilities: `--color-ink-secondary: 53 73 100` (#354964), `--color-ink-tertiary: 79 100 133`
  (#4F6485), `--color-line: rgb(6 42 94 / 0.38)`, `--color-line-strong: rgb(6 42 94 / 0.62)`,
  plus the legacy `--text-secondary`, `--text-tertiary`, `--border` and `--border-strong`
  they derive from. The restated `.text-ink-*`, `.border-line*`, `.hairline` and
  `.eyebrow-rule` rules are deleted because the utilities now read the variables. The
  comment explaining that "the Tailwind palette is literal hex" goes with them. Rendered
  result under increased contrast is unchanged, and the same CSS-diff in §1.6 checks it.

### 1.5 Component touches

Three small ones, each a visual no-op today, so that "button shape", "card shape" and
"heading weight" are real tokens in every preview mode:

- `Button`/`ButtonLink` base class: `rounded-pill` → `rounded-control`. Default is identical.
- `SectionHeading` drops the redundant `font-semibold` from its heading element; the
  `h1–h4` base rule already applies that weight, so the rendered result is unchanged and
  the heading-weight token now reaches every section opener.
- `src/lib/cn.ts` registers `control`, `card`, `pill` and `phone` as border-radius values
  in the tailwind-merge config, so `cn('rounded-control', 'rounded-xl')` resolves the way a
  caller expects instead of leaving both classes in place.

The lab compositions use `rounded-card`. Production sections keep their `rounded-2xl`,
which moves with the radius scale; whether to switch them to `rounded-card` is part of
the port, not this branch.

The brand mark (`ShieldMark`, the wordmark's `#32D583`) and the score ring's green gradient
stops are **not** tokenised. The first two are the logo. The ring gradient is left literal
for now so the ring reads the same in every preset; a preset that changes the green will
show the ring's gradient unchanged, and the lab labels it as such.

### 1.6 Baseline equivalence

The bridge must not change the production site. Verification, in order:

1. `npm run build` on `main` and on the bridge commit. A throwaway script (scratchpad,
   not committed) parses both `dist/assets/*.css`, substitutes every `var(--…)` in the
   bridged CSS with its `:root` value, normalises whitespace and colour syntax, and diffs
   against the baseline. The only permitted differences are the `:root` declarations
   themselves, the two new `rounded-control`/`rounded-card` utilities, and the base
   heading rule and increased-contrast block, whose resolved values must still match.
2. The full Vitest suite (134 tests) passes unchanged.
3. A new test pins `defaultTokens` to a frozen copy of the pre-bridge literals, so a later
   edit to the defaults is a deliberate, visible change.
4. If Playwright is available outside the repo, as it was for the Apple-design pass,
   screenshots of `/`, `/safety-score` and `/features` at 390 and 1440 are compared before
   and after. If it is not available, that is stated in the progress doc rather than claimed.

## 2. Theme model

`src/theme/config.ts`:

```ts
export type ThemeConfig = {
  schemaVersion: 1;
  meta: {
    id: string;              // slug; built-ins are fixed, customs are random
    name: string;
    description: string;
    builtIn: boolean;
    basedOn: string | null;  // id of the built-in a custom was duplicated from
    favourite: boolean;
    createdAt: string;       // ISO
    updatedAt: string;
  };
  tokens: ThemeTokens;
  components: {
    button:   { shape: 'pill' | 'rounded' | 'square';
                primary: 'navy' | 'green' | 'gradient' | 'outline';
                hover: 'route-sheen' | 'lift' | 'fill' | 'none' };
    card:     { style: 'outlined' | 'elevated' | 'flat' | 'glass' | 'navy' };
    nav:      { style: 'glass' | 'solid' | 'floating-pill' | 'minimal' | 'dark' };
    hero:     { layout: 'split-phone' | 'centered' | 'immersive-dark' | 'editorial' | 'map-first' };
    cta:      { style: 'shield-arrival' | 'navy-band' | 'gradient-band' | 'minimal' };
    footer:   { style: 'navy-columns' | 'light-compact' | 'dark-big-logo' };
    features: { layout: 'bento' | 'three-column' | 'list' | 'alternating' };
    stats:    { style: 'inline' | 'tiles' | 'ring' };
    badge:    { style: 'soft' | 'outline' | 'solid' };
    routeOptions: { style: 'segmented' | 'cards' | 'list' };
    mapUi:    { tone: 'light' | 'night'; routeStroke: 'cased' | 'solid' | 'dashed' };
    icons:    { style: 'outline' | 'filled-tile' | 'duotone'; strokeWidth: 1.5 | 2 | 2.5 };
    testimonial: { style: 'cards' | 'single-quote' | 'hidden' };
  };
  layout: {
    density: 'compact' | 'comfortable' | 'airy';   // scales section spacing and card padding
    contentWidth: 'narrow' | 'default' | 'wide';   // sets --width-shell
    dividers: 'none' | 'hairline' | 'tonal';
  };
  motion: {
    intensity: 'none' | 'subtle' | 'standard' | 'expressive'; // sets durations and --reveal-scale
    reveal: 'rise' | 'fade' | 'mask' | 'scale';
    hoverLift: boolean;
  };
  content: {
    headline: 'default' | 'benefit' | 'direct' | 'question';
    tone: 'calm' | 'confident' | 'urgent';
    ctaLabel: string;
  };
};
```

`density`, `contentWidth` and `intensity` are *derived* controls: changing one writes the
corresponding token values (e.g. `airy` sets `spacing.section` to a larger clamp). The
tokens remain the source of truth in the export; the enum records the choice so the control
shows the right selection on import.

`src/theme/validate.ts` exports `parseThemeConfig(input: unknown): { ok: true; config } |
{ ok: false; errors: string[] }`. Hand-written checks, no schema library: required keys,
enum membership, colour strings, `schemaVersion === 1`. Unknown keys are dropped with a
warning. A future `schemaVersion: 2` would add a migration here.

`src/theme/export.ts`: `toJson(config)`, `toCss(config)` (the `:root` block plus a comment
listing the component choices as `data-*` hints), `toTypeScript(config)` (a file that
`export default`s a `ThemeConfig`, suitable to drop into `src/theme/presets/`).

`src/theme/apply.ts` (DOM): `applyTheme(root: HTMLElement, config)` sets every variable
with `style.setProperty`, sets `data-swm-density`, `data-swm-dividers`, `data-swm-reveal`
and `data-swm-hover-lift` for the few CSS-only hooks, and returns a function that removes
them.

## 3. Playground entry and build isolation

Files:

- `playground.html` — second page at the repo root. Loads `/src/playground/main.tsx`.
  `<meta name="robots" content="noindex">`.
- `src/playground/main.tsx` — reads `?preview=1`; mounts `<Shell/>` or `<Preview/>`.
- `src/playground/**` — everything else (see §§4–8).

`vite.config.ts` becomes a function of `{ command, mode }`:

- `process.env.PLAYGROUND = command === 'serve' || mode === 'playground' ? '1' : ''`,
  set before returning the config so the Tailwind config (loaded by PostCSS in the same
  process) can read it. Cross-platform; no `cross-env`.
- `build.rollupOptions.input` is `index.html` normally and `playground.html` in
  `--mode playground`.
- `build.outDir` is `dist` normally and `dist-playground` in `--mode playground`.

`tailwind.config.ts` `content`: `./index.html`, `./src/*.{ts,tsx}`,
`./src/{components,pages,hooks,lib,data,styles,theme,services}/**/*.{ts,tsx}`, plus
`./playground.html` and `./src/playground/**/*.{ts,tsx}` only when `PLAYGROUND=1`. The
production CSS therefore contains no playground-only utilities. (Negated globs are not
relied on.)

Scripts added to `package.json`:

```json
"build:playground": "tsc -b && vite build --mode playground",
"preview:playground": "vite preview --outDir dist-playground"
```

`.gitignore` gains `dist-playground/`. `tsc -b` type-checks the playground on every build
either way, which is wanted. ESLint covers it already (`**/*.{ts,tsx}`).

In dev, `npm run dev` serves both pages; the playground is at
`http://localhost:5173/playground.html`. Nothing else changes about `dev`.

## 4. Preview protocol

Shell and preview are the same origin. Messages are plain objects with a `type` string
prefixed `swm-theme/`:

| Direction | `type` | Payload | When |
| --- | --- | --- | --- |
| preview → shell | `ready` | `{ frameId }` | after mount |
| shell → preview | `apply` | `{ config, mode: 'lab' \| 'live', route, labSection? }` | on ready and on every state change |
| preview → shell | `scroll` | `{ frameId, fraction }` | on scroll, throttled to one per frame |
| shell → preview | `scrollTo` | `{ fraction }` | compare mode, mirrors the other frame |

Every handler checks `event.origin === window.location.origin` and ignores unknown types.
Scroll mirroring sets a short-lived "programmatic" flag so the two frames do not ping-pong.

Device widths: 390, 768, 1280 and fluid. The iframe is given that CSS width; when it is
wider than the available area the frame is scaled down with `transform: scale()` on its
wrapper, so the document inside still measures the true width and breakpoints behave.

## 5. Preview modes

### 5.1 Component lab

A long page in `src/playground/lab/`, one composition per section, each a small React
component that **reuses the real primitives** and **implements the variants**. A thin
`.lab-chrome` caption above each (literal neutral colours, not themed) names the section
and the active variant.

| Lab section | Reuses | Variants it renders | Production change the variant maps to |
| --- | --- | --- | --- |
| Navigation | `Logo`, `ButtonLink`, `navLinks`, `.nav-glass` | `nav.style` ×5 | `SiteHeader` surface classes and the glass layer |
| Hero | `StatusPill`, `ButtonLink`, `PhoneFrame`, `RoutePickerScreen`, `CityMap` | `hero.layout` ×5, `content.headline`, `content.ctaLabel` | `HeroMain` grid and copy constants |
| Route and safety visualisation | `ComparisonMap`, `CityMap`, `NetworkMap` | `mapUi.tone`, `mapUi.routeStroke` | `CityMap`/`RouteLine` props |
| Route options | `SegmentedTabs`, `Chip`, `AnimatedCounter`, `PhoneFrame`, `RoutePickerScreen`, `routes` data | `routeOptions.style` ×3 | `RouteChoiceSection` control block |
| Safety score | `SafetyScoreRing`, `Chip`, `AnimatedCounter`, `getRoute('safer')` | `card.style` for the panel | `SafetyScoreSection` panel |
| Features | `features` data, `NavigationScreen`, `PhoneFrame`, lucide icons | `features.layout` ×4, `card.style`, `icons.*` | `FeatureSection` grid and `FeatureCard` |
| Stats | illustrative route figures only | `stats.style` ×3 | new or existing figure blocks |
| Badges and chips | `Chip` (all tones), `StatusPill`, a "Planned" chip | `badge.style` | `Chip` tone classes |
| Buttons | `Button`, `ButtonLink` (all variants and sizes) | `button.*` | `Button` variants and base class |
| Typography | the type scale, body copy from the site, headline variants | tokens only | — |
| Icons | the lucide set the site uses | `icons.*` | icon wrappers in cards |
| Map UI elements | turn card, live notice, score pill, segmented control from the phone screens | `mapUi.*`, `badge.style` | `RoutePickerScreen`, `NavigationScreen` |
| Testimonial | **placeholder** quote, labelled "Placeholder — replace with a real, permissioned testimonial" | `testimonial.style` ×3 | a future section, only with real quotes |
| Call to action | `ShieldMarkPaths`, `ButtonLink`, `StatusPill` | `cta.style` ×4 | `FinalCtaSection` |
| Footer | `Logo`, `footerColumns`, `siteConfig` | `footer.style` ×3 | `SiteFooter` |

Variants are React props on the lab components, chosen from the config. Where a variant is
purely CSS (density, dividers, reveal style, hover lift) the lab reads the `data-swm-*`
attributes set by `applyTheme`.

The lab runs the real `useScrollReveal` so reveal styles and motion intensity can be judged,
and honours `prefers-reduced-motion` exactly as the site does.

### 5.2 Live site

`<Preview mode="live">` renders the real `App` inside a `MemoryRouter` at the route the
shell selected (`/`, `/safety-score`, `/features`, `/about`, `/faq`). Tokens apply in full;
component variants do not, and the shell says so beside the mode switch. This is the view
for judging palette, type, shape, depth, spacing and motion on the actual pages, including
the GSAP scroll stories.

Known limit, stated in the UI: the real sections use literal `white` utilities in places
(button text on navy, glass tints, phone bezels), so a dark preset in Live site will show
those spots unthemed. The Component lab is the faithful view for dark presets.

## 6. Controls

Left panel, ~340px, tabbed. Every control writes to the active preset immediately; the
preview updates on the next frame.

- **Presets** — built-in and custom lists, favourites filter, search; per preset: select,
  star, duplicate, rename, delete (custom only), "reset to base" (custom: back to its
  `basedOn`; built-in: discard unsaved edits).
- **Colours** — brand navy, brand green and accent pickers, each with a generated ramp
  (HSL: hue kept, lightness fixed per step 50→950, saturation eased toward the ends) and an
  "edit steps" expander for per-step overrides; semantic colours (ink ×3, surface ×3, line
  ×2) with a "derive from palette" button; eight curated palette swatches; light/dark
  scheme switch; live WCAG 2.1 contrast readouts with AA/AAA badges for ink on surface,
  green text on surface, green accent on navy, and button label on button.
- **Typography** — curated family pairings (see §9), separate heading family toggle,
  heading weight, heading tracking, type-scale presets (compact / default / editorial /
  display), body size and line-height.
- **Shape and depth** — base radius slider that regenerates the radius scale, button
  radius (pill / rounded / square), card radius, shadow intensity (none / soft / medium /
  dramatic, each a complete shadow set tinted from the current navy), border strength.
- **Layout and components** — density, content width, dividers, and one select per
  `components.*` entry, each with a one-line description.
- **Motion** — intensity, reveal style, hover lift, plus a "simulate reduced motion"
  toggle that sets the iframe's preference where the browser allows and otherwise explains
  how to toggle it at OS level.
- **Content** — headline variant, tone, CTA label (free text, 40 chars max).

Top bar: preset name (click to rename), unsaved-changes dot, device width, mode switch
(Lab / Live) with route selector in Live, lab section jump list, Compare toggle, light/dark
quick toggle, Export, Import, Reset.

Export drawer: JSON / CSS / TypeScript tabs, Copy and Download buttons. Download names
follow `safewalkmaps-theme-<id>.<json|css|ts>`.

Import: file picker or paste area → `parseThemeConfig`; on success it is added as a custom
preset and selected; on failure the errors are listed.

## 7. Presets

Nine, in `src/theme/presets/`, each a full `ThemeConfig`, `index.ts` exporting the ordered
list. Directions, with the settings that make each one *not* a recolour of another:

| Id | Name | Direction | Distinguishing choices |
| --- | --- | --- | --- |
| `today` | SafeWalkMaps Today | the current site, exactly | `defaultTokens`; glass nav, split-phone hero, shield CTA, navy-columns footer, segmented routes |
| `clean-minimal` | Clean Minimal | restraint | near-black ink, navy as accent only, 8px radii, no shadows, hairline cards, `minimal` nav, `fade` reveals, airy density, `three-column` features |
| `premium-modern` | Premium Modern | depth and polish | deeper navy, softer green, 20px radii, layered shadows, `gradient` primary button, `glass` nav, `bento` features, Manrope headings, `expressive` motion |
| `safety-first` | Safety First | the product is a safety tool | high contrast, AA-safe green used as a signal colour, amber flags prominent, `solid` nav, `cards` routes, `tiles` stats, `direct` headline, comfortable density |
| `night-navigation` | Night Navigation | dark / tech | dark surfaces, bright green accent, JetBrains Mono for figures, `night` map, `dark` nav, `immersive-dark` hero, glow shadows, `dashed` route stroke |
| `light-airy` | Light and Airy | soft and open | off-white surfaces, pale navy ink, pastel green tints, DM Sans, large line-height, `airy` density, `light-compact` footer, `scale` reveals |
| `bold-startup` | Bold Startup | energy | saturated green primary buttons, Plus Jakarta Sans 800 display, `editorial` hero, `navy-band` CTA, `solid` badges, `lift` hover, `benefit` headline |
| `cupertino` | Cupertino | Apple-like | system font stack, very tight tracking, large continuous-feel radii, `glass` nav and `glass` cards, grey-tinted secondary surfaces, `centered` hero, subtle spring motion |
| `wayfinder` | Wayfinder | map-app inspired | `map-first` hero with the city map full-bleed, `cased` route stroke, pill chips, `floating-pill` nav, teal-shifted navy, `inline` stats, `filled-tile` icons |

All nine share the same copy options and the same illustrative data. None adds a product
claim.

## 8. Preset management and persistence

`src/playground/store/`: a reducer and a React context, no state library.

- State: `{ presets: ThemeConfig[] (custom), activeId, draft: ThemeConfig | null,
  ui: { width, mode, route, compareId, panelTab } }`.
- Built-in presets are read-only. Editing one creates a `draft`, shown with an
  unsaved-changes dot; "Save as" turns the draft into a custom preset with `basedOn` set,
  and "reset" discards it. Editing a custom preset writes to it directly and persists on
  the same tick, so custom presets never show the dot. Custom ids are
  `custom-` followed by eight random base-36 characters.
- Persistence: `localStorage` keys `swm-playground.v1.presets`, `.active`, `.ui`, written
  on change and read on load, inside `try/catch` so a blocked store degrades to in-memory.
- Actions: `select`, `update(path, value)`, `saveAs(name)`, `duplicate(id)`,
  `rename(id, name)`, `remove(id)`, `toggleFavourite(id)`, `resetToBase(id)`,
  `import(config)`, `setUi(partial)`.

Compare mode: a second iframe receives the preset chosen in a dropdown (any built-in or
custom); both frames share width and mode; scroll is mirrored (§4).

## 9. Fonts

Inter ships with the site via `@fontsource-variable/inter`. For comparison the playground
offers a curated list in `src/playground/fonts.ts`: Inter, Manrope, Plus Jakarta Sans,
DM Sans, Space Grotesk, Instrument Sans, Geist, Outfit, Sora, Fraunces (serif display),
Newsreader (serif display), JetBrains Mono, IBM Plex Mono, and the system stack. Each entry
has the Google Fonts `css2` URL. The shell and the preview inject a `<link rel="stylesheet">`
for a family the first time it is needed. This request leaves the machine only inside the
playground; the production site makes no such request.

Choosing a non-Inter family for production means adding its `@fontsource-variable/*`
package and import, which is part of the port, and the exported CSS says so in a comment.

## 10. Responsible content

- Every figure in Stats, Route options and Safety score comes from `src/data/city.ts`
  and carries `ILLUSTRATIVE_NOTE`.
- The Testimonial composition renders placeholder text with a visible label. It cannot be
  edited into a real quote inside the playground; real testimonials are a content decision
  with permission attached.
- Headline variants rephrase the existing claim ("the safer route, not just the fastest")
  without adding capabilities, guarantees or launch dates. The "Planned" chip exists so a
  preset can be judged with honest feature labelling.
- No analytics, no tracking, no external requests other than Google Fonts when a non-Inter
  family is selected.

## 11. Accessibility and motion

- The shell is keyboard-operable: tabs, selects, sliders, colour inputs and the preset list
  are native controls or follow the ARIA tabs pattern already used by `SegmentedTabs`.
- Contrast readouts are informational; the playground never blocks a choice, it reports it.
- The preview honours `prefers-reduced-motion` through the site's own CSS and hooks.
- `motion.intensity: 'none'` sets `--reveal-scale: 0` and the shortest durations, which is
  also a quick way to judge a theme without motion.

## 12. Testing

New Vitest files, in the existing style (`renderWithRouter`, jsdom stubs in
`src/test/setup.ts`):

- `src/theme/tokens.test.ts` — every expected variable is emitted; hex → channel conversion
  (`#062A5E` → `6 42 94`); legacy variables derive from the right tokens; `defaultTokens`
  equals the frozen pre-bridge literals.
- `src/theme/validate.test.ts` — every built-in preset parses; missing or wrong
  `schemaVersion`, bad enum, bad colour each produce a path-qualified error; unknown keys
  are dropped.
- `src/theme/export.test.ts` — JSON round-trips through `parseThemeConfig`; CSS output has a
  `:root` block with every variable; TypeScript output contains the header and the config.
- `src/theme/apply.test.ts` — variables and `data-swm-*` attributes land on the element and
  the returned function removes them.
- `src/playground/store/store.test.ts` — each action; persistence round trip; blocked
  `localStorage` falls back to memory.
- `src/playground/Shell.test.tsx` — renders, lists nine built-ins, selecting one changes the
  active name, export drawer shows JSON containing that id, import of a bad file lists
  errors.
- Presets: `src/theme/presets/presets.test.ts` — nine presets, unique ids, every one parses,
  and no two share the same `components` *and* `tokens.colors` (the "not a recolour"
  guard).

Existing 134 tests stay green throughout. Build checks, run by hand and recorded in the
progress doc: `npm run build` produces no `playground` asset and its CSS contains no
`.lab-` or `swm-playground` strings; `npm run build:playground` produces
`dist-playground/playground.html`.

Not covered by tests, checked in a browser and recorded: rendering of each preset at 390
and 1280 in both modes, drag-free interaction of every control, and iframe scaling.

## 13. Applying a chosen preset to production

Documented in `docs/theme-playground.md` so it survives this session:

1. **Tokens.** Export JSON. Save it as `src/theme/presets/<id>.ts` via the TypeScript export,
   or paste the `tokens` block into `defaultTokens`. The Tailwind plugin emits the new values
   and every utility, SVG and timeline follows. Build, run the suite, check in a browser.
2. **Fonts.** If the family is not Inter, add its `@fontsource-variable/*` package and swap
   the import at the top of `index.css`.
3. **Component variants.** Read the `components` block. For each entry that differs from
   `today`, port the lab composition's structure into the production component named in the
   §5.1 table. One commit per component.
4. **Dark schemes only.** Replace literal `white`/`navy-950` utilities in the affected
   sections with semantic tokens (`ink-inverse`, `surface-navy`), guided by what Live site
   mode shows unthemed.
5. Update `docs/implementation-progress.md`, remove or keep the playground branch as
   preferred.

## 14. Known limits

- Live site mode is token-faithful, not variant-faithful (§5.2).
- Dark presets expose literal white utilities in Live site mode (§5.2, §13 step 4).
- The brand mark and the score ring gradient do not re-theme (§1.5).
- Heading weight reaches the base rule and the lab, but not production headings that carry
  an explicit weight utility until the port removes it (§1.4). Heading family does reach
  them, because no heading sets a family inline; the hero's scroll captions are paragraphs
  and stay in the body family.
- Type-scale changes are applied through the variables; the GSAP hero captions and the
  phone mockups use `em` sizing and follow automatically, but a dramatically larger display
  scale can make the pinned hero captions wrap at 390px. The lab shows it; the preset
  author decides.
- Google Fonts are loaded by URL in the playground only. Offline, non-Inter families fall
  back to the system stack.

## 15. Milestones

Each is a working checkpoint with its own commits, in this order:

1. **Token bridge** — `src/theme/tokens.ts`, `cssVariables.ts`, Tailwind config and
   `index.css` changes, `rounded-control`, baseline tests, CSS-diff verification.
2. **Theme model and exporters** — `config.ts`, `validate.ts`, `export.ts`, `apply.ts`,
   the `today` preset, tests.
3. **Playground shell and preview** — `playground.html`, Vite and Tailwind isolation,
   `main.tsx`, iframe, protocol, device widths, Live site mode, scripts, `.gitignore`.
4. **Controls** — Colours (ramps, contrast), Typography (fonts), Shape and depth, Motion,
   Content.
5. **Component lab** — the fifteen compositions and their variants; Layout and components
   controls.
6. **Presets** — the remaining eight, tuned in the lab; the "not a recolour" test.
7. **Preset management** — store, persistence, favourites, duplicate, rename, delete, reset,
   import, export drawer.
8. **Compare mode and docs** — second frame, scroll mirroring, `docs/theme-playground.md`,
   progress doc update.

## 16. Files

New:

```
playground.html
src/theme/tokens.ts            src/theme/cssVariables.ts     src/theme/config.ts
src/theme/validate.ts          src/theme/export.ts           src/theme/apply.ts
src/theme/presets/index.ts     src/theme/presets/<nine>.ts
src/theme/*.test.ts            src/theme/presets/presets.test.ts
src/playground/main.tsx        src/playground/Shell.tsx      src/playground/Preview.tsx
src/playground/protocol.ts     src/playground/fonts.ts       src/playground/color.ts (ramps, contrast)
src/playground/store/*         src/playground/panel/*        src/playground/lab/*
src/playground/*.test.ts(x)    src/playground/playground.css
docs/theme-playground.md
```

Changed:

```
tailwind.config.ts   vite.config.ts   package.json   .gitignore
src/styles/index.css   src/lib/cn.ts
src/components/ui/Button.tsx   src/components/layout/Section.tsx
docs/implementation-progress.md
```

Untouched: every page, illustration, hook, data file and test that exists today, and every
section other than the one-class change to `SectionHeading` listed above.
