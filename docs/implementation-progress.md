# Implementation progress

Status as of the initial build of the redesigned site. Branch: `feature/website-build`.

## Complete

| Area | State |
| --- | --- |
| Toolchain | Vite + React 18 + TypeScript + Tailwind 3, ESLint, Prettier. `lint`, `typecheck` and `build` all pass clean. |
| Design system | Tokens in `tailwind.config.ts` and `src/styles/index.css`, sampled from the supplied logo. Contrast checked and documented. |
| Brand marks | Icon traced from `safewalkmaps_logo.svg`; wordmark set as live text matching the horizontal lockup. |
| Homepage | Hero plus eleven sections, all built, all with real copy. |
| Motion | Scroll-reveal system plus four GSAP ScrollTrigger stories. Reduced-motion alternatives implemented, not just disabled. |
| Product mockups | Route picker and night navigation screens, built from DOM elements at iPhone proportions. |
| Forms | Waitlist and contact, with validation, loading, success and error states, behind a transport-agnostic service. |
| Supporting pages | `/privacy`, `/terms`, `/404`. |
| SEO | Metadata, canonical URLs, OpenGraph and Twitter cards, JSON-LD (Organization, WebSite, MobileApplication, FAQPage), robots, sitemap, manifest. |
| Assets | Favicon set, PWA icons, 1200×630 social preview, all generated from the logo. |
| Deployment | Vercel, Netlify and Cloudflare Pages configuration committed. |

## Mobile pass

Measured on a 4x-throttled phone profile (390 x 844), production build:

| | Before | After |
| --- | --- | --- |
| Frames over 32ms, full-page scroll | 81 | 5 |
| Worst frame | 83ms | 33ms |
| Long tasks | 1 | 0 |
| p99 frame time | 33ms | 17ms |
| Total scroll length | 28.2 screens | 26.8 screens |

What changed, and why:

- **Inter was never loading.** The font stack said `InterVariable`; the package registers
  `Inter Variable`. The whole site had been rendering in a system fallback.
- **An SVG Gaussian blur sat behind an animating path.** The route halo re-blurred every
  frame. Replaced with two stacked translucent strokes.
- **25 infinite animations ran at once.** Decorative map pulses now stand down below `lg`
  and leave a static halo.
- **Pinned stories were too long on a phone.** Tuned via `--signal-step` and `--hero-intro`
  to roughly one thumb flick per beat.
- **Scrub lag was tuned for a wheel.** `scrubFor()` drops it to 0.35 on touch.
- **Reveals outlasted the gesture.** Shorter and closer below `lg`.
- **No press feedback on touch.** Added `:active` states and `touch-action: manipulation`.
- **Tap targets.** The phone mockup's segmented control gets a pseudo-element hit area past
  44px; footer navigation links went from 24px to 40px. Inline links inside sentences were
  left alone — WCAG 2.5.8 exempts them.
- **A blank viewport between the hero intro and the hero.** The composition now scrolls away
  intact rather than fading into an empty stage.

Two things were measured and then *not* changed: removing the header's backdrop blur made
frame timing slightly worse (run-to-run noise dominates — it is not a bottleneck), and the
static heat-blob filter on the safety map is rasterised once, so it stays.

## Apple-design pass

Branch: `refactor/apple-motion-materials`. A refinement pass against Apple's interface
guidance (chiefly *Designing Fluid Interfaces*, WWDC 2018), not a rebuild — the type scale,
reduced-motion coverage and compositor-friendly reveals from the earlier work were already
sound and were left alone.

### A spring vocabulary

The motion system was entirely decelerating cubic-beziers. A bezier cannot express a spring:
no overshoot, and the wrong tail shape. Three springs are now generated from spring physics
by `scripts/generate-spring-easings.mjs` and sampled into CSS `linear()`:

| Token | Damping | Response | Settles | Used for |
| --- | --- | --- | --- | --- |
| `--ease-spring` | 1.0 | 0.4s | 588ms | Reveals, repositioning, press release |
| `--duration-spring-snappy` | 1.0 | 0.3s | 441ms | Tab pill, chevron, nav indicator, menu glyph |
| `--ease-spring-sheet` | 0.8 | 0.3s | 405ms | The mobile sheet — the one place overshoot belongs |

A critically damped spring's normalised curve is invariant under time scaling, so the first
two share one easing and differ only in duration. That is also why the phone's 460ms reveal
override is still a real spring rather than a truncated one.

`linear()` sits behind `@supports`; browsers without it keep the existing beziers.

### What changed

- **Press response.** Every tappable control engaged its press over 240ms. The new
  `.tappable` class makes it asymmetric — 90ms in, 320ms out on a spring — because lag on
  the way down is the one latency that reads as the interface being dead.
- **A real bug: the hero's primary CTA had no press feedback at all.** `useMagnetic` wrote
  an inline `transform`, which replaces the property wholesale and silently killed
  `active:scale`. Now writes `translate`, which composes.
- **Four animations drove layout properties** — the nav indicator (`left`/`width`), the menu
  glyph (`top`), the signal weight bars (`width`, while a pinned section is scrubbed) and
  several `transition-all` declarations. All now transform-only or scoped.
- **The header is glass with a soft edge, not a bar with a rule.** The material moved to its
  own layer, extends 28px past the bar and is masked to nothing, so content dissolves into
  the chrome. The fade is dropped while the mobile sheet is attached, where there is no
  content boundary to soften.
- **The mobile sheet materialises** — blur ramps with the scale and the slide, on the
  under-damped spring. Its blur is heavier than the bar's, because a bigger surface should
  read as thicker.
- **Vibrancy on the nav labels.** Brand navy at 75% alpha instead of flat grey, so they pick
  up what is behind them. Contrast goes up, not down: 7.7:1 against white, from 6.5:1.
- **The status pill is no longer glass.** It sat inside the sheet's glass in one of its three
  placements, and a light translucent surface on another loses legibility.

### Accessibility

`prefers-reduced-motion` was already handled. The two settings that govern translucency were
not, and the site leans on `backdrop-filter` throughout:

- **`prefers-reduced-transparency`** — blur comes off, surfaces go solid, the bar gets a real
  border in place of its soft edge. Blurs are matched by attribute substring rather than
  enumerated, so one added later cannot be missed. The phone mockups are deliberately exempt:
  they are pictures of the iOS app, not chrome the visitor operates.
- **`prefers-contrast: more`** — solid surfaces, hairlines from 0.09/0.16 alpha to 0.38/0.62,
  a 3px focus ring, and the two weakest text tones darkened (`ink.tertiary` to 6.0:1, which
  brings it above AA for body copy rather than labels only).

Because the Tailwind palette is literal hex — deliberately, so the `/alpha` modifiers used
across the site keep working — raising the custom properties does not reach the utilities,
and the utilities are restated. Those rules sit outside `@layer`, which beats Tailwind's
layered utilities without `!important`.

### Correction to the palette documentation

Two contrast figures in `tailwind.config.ts` were overstated and are corrected:
`ink.secondary` is **6.5:1**, not 7.2:1, and `ink.tertiary` is **3.4:1**, not 3.9:1. Both
still clear AA for their documented uses, but the comment is load-bearing. All six figures
have been recomputed from the WCAG 2.1 relative luminance formula.

### Not done, deliberately

- **No drag or swipe gestures.** Velocity handoff and momentum projection are the heart of
  Apple's fluidity, but nothing on this site is draggable, and making the route comparison
  swipeable is a feature decision rather than a refinement, so it is left for you to call.
- **No haptics.** iOS Safari does not implement the Vibration API, and this site's audience
  is iOS.
- **No motion library.** Motion/Framer Motion would add ~30kB for behaviour CSS `linear()`
  already provides. Revisit only if real gesture work lands.
- **No repo-wide reformat.** 60 files have pre-existing Prettier drift. Fixing it would bury
  this work in churn; it should be its own commit.

## Verified

The Apple-design pass was re-verified in Chromium at 390, 768 and 1440px against the
production build, with a scripted suite of 23 rendered assertions — computed timing
functions, the glass layer's blur/mask/height, the nav indicator being transform-driven,
both new media queries actually matching before their effects are trusted, console output
on every route, and horizontal overflow at each width. All 23 pass. Screenshots of the
hero, the engaged glass bar and the open mobile sheet were reviewed at each width.

Note on tooling: Playwright is still not a project dependency. It was installed outside the
repo for this verification, exactly as `scripts/generate-og-image.mjs` describes.

From the original build, checked in a real browser at 375, 390, 430, 768, 1440 and 1728px:

- No console errors or warnings on any route, in dev and in the production build.
- No horizontal overflow at any tested width.
- Exactly one `<h1>` per route, no heading-level skips, every field labelled, every
  button and link has an accessible name.
- Skip link is the first tab stop.
- Mobile menu opens, traps nothing, closes on Escape and returns focus.
- Waitlist rejects an empty and a malformed address, succeeds on a valid one, and
  discloses when a submission was simulated.
- Under `prefers-reduced-motion`, no reveal element is left hidden and the pinned
  sections render readable static alternatives.

## Decisions worth knowing

- **No Lenis.** Native scrolling plus ScrollTrigger is smoother on mobile Safari and does
  not interfere with anchor focus. Revisit only if the desktop feel is judged lacking.
- **CSS sticky rather than ScrollTrigger `pin`.** Fewer layout side effects and no
  pin-spacer maths.
- **Illustrative route figures are internally consistent.** The three routes share an
  origin and destination and their times and distances follow from measured path geometry
  at a constant pace. See the comment at the top of `src/data/city.ts`.
- **Playwright is not a dependency.** It is used on demand to regenerate static brand
  rasters, which are committed.

## Needs your input before production

Four open items, written up in full in [`before-launch.md`](before-launch.md):

1. **Legal details** — the only hard blocker. Visible placeholder panels on `/privacy` and
   `/terms` until real text replaces them.
2. **Per-feature status** — which of the six app features are shipped versus planned.
3. **The encryption claim** — the current site states end-to-end encryption; this rebuild
   deliberately does not, because it could not be verified.
4. **Deployment config** — three environment variables, then a go-live checklist.

Merging is no longer pending: `feature/website-build` was merged to `main` once the above were
documented.
