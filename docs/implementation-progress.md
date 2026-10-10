# Implementation progress

Status as of the initial build of the redesigned site. Branch: `feature/website-build`.

## Complete

| Area | State |
| --- | --- |
| Toolchain | Vite + React 18 + TypeScript + Tailwind 3, ESLint, Prettier. `lint`, `typecheck` and `build` all pass clean. |
| Design system | Tokens in `tailwind.config.ts` and `src/styles/index.css`, sampled from the supplied logo. Contrast checked and documented. |
| Brand marks | Icon traced from `safewalkmaps_logo.svg`; wordmark set as live text matching the horizontal lockup. |
| Homepage | Hero plus five sections (problem, safety layer, route choice, waitlist, final call to action), all with real copy. The other sections moved to their own routes; see Site architecture below. |
| Motion | Scroll-reveal system plus four GSAP ScrollTrigger stories. Reduced-motion alternatives implemented, not just disabled. |
| Product mockups | Route picker and night navigation screens, built from DOM elements at iPhone proportions. |
| Forms | Waitlist and contact, with validation, loading, success and error states, behind a transport-agnostic service. |
| Supporting pages | `/safety-score`, `/features`, `/about`, `/faq`, `/privacy` and `/terms`, which with `/` make the seven public routes, plus the 404. |
| SEO | Metadata, canonical URLs, OpenGraph and Twitter cards, JSON-LD (Organization, WebSite and MobileApplication in `index.html`; `FAQPage` is injected on `/faq`), robots, sitemap, manifest. |
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

## Site architecture

Branch: `feature/site-architecture`. The home page had grown into the whole site. Measured
on the production build, it was **21.6 screens tall on a desktop and 27.9 on a phone**: a
visitor had to scroll past the detail of every feature, scenario, FAQ and policy to reach
the ask. The argument now stays on the home page and the detail lives on its own routes,
which brings the home page to **12.8 screens on desktop and 14.6 on a phone**.

### What it cost, and where each section went

Per-section scroll cost before the change, in screens of viewport height, and where the
section lives now. The after figure is the page total in the last row: a section that moved
costs the home page nothing.

| Section | Desktop | Phone | Now |
| --- | --- | --- | --- |
| hero | 3.18 | 3.50 | stays on `/` |
| problem | 1.31 | 1.62 | stays on `/` |
| how-it-works | 4.32 | 3.48 | stays on `/` |
| safety-score | 1.61 | 2.54 | moved to `/safety-score` |
| routes | 1.39 | 2.18 | stays on `/` |
| features | 1.66 | 3.39 | moved to `/features` |
| privacy | 1.06 | 1.67 | moved to `/about` |
| scenarios | 1.22 | 0.96 | moved to `/features` |
| mission | 1.07 | 1.35 | moved to `/about` |
| waitlist | 0.93 | 1.61 | stays on `/` |
| faq | 1.45 | 2.29 | moved to `/faq` |
| contact | 0.71 | 1.15 | moved to `/about` |
| final CTA | 1.13 | 1.05 | stays on `/`, and closes each detail page |
| **Home page total** | **21.6 → 12.8** | **27.9 → 14.6** | |

The section rows are measured per section and do not add up to the page totals; the
difference is height that belongs to no listed section.

### Page map

| Route | Carries | Lazy |
| --- | --- | --- |
| `/` | Hero, problem, how it works, route choice, waitlist, final CTA | No, in the main bundle |
| `/safety-score` | The safety score (leads as the `h1`), final CTA | Yes |
| `/features` | Features (leads as the `h1`), scenarios, final CTA | Yes |
| `/about` | Mission (leads as the `h1`), privacy, contact. No closing CTA: the contact form is already an ask | Yes |
| `/faq` | The FAQ (leads as the `h1`), final CTA, `FAQPage` structured data | Yes |
| `/privacy`, `/terms` | Legal pages | Yes |
| `*` | The 404 | Yes |

`ROUTES` in `src/data/routes.ts` is the single list of public paths. The router, the
navigation, the footer and the sitemap are all tested against it.

### What changed

- **Route-based navigation replaces scroll-spy.** The header links to real pages and marks
  the current one with `aria-current`; the indicator sits under the active item on a
  sub-page and is hidden on `/`. `useActiveSection`, which tracked the section in view, is
  deleted.
- **Eyebrow indices renumber to a contiguous 01 to 04 in the DOM.** Moving sections away left
  the home page numbered 01, 02, 04, 09; it is renumbered. **That is not what a phone shows.**
  In the animated layout, `SafetyLayerSection` hides its `02` eyebrow below `lg` with its
  responsive layout, so the visible run there reads 01, 03, 04. The gap predates this work and
  was left alone on purpose: that CSS was tuned in an earlier motion pass. Under
  `prefers-reduced-motion` the static layout shows all four.
- **Stale hashes are forwarded.** `/#features`, `/#faq`, `/#contact` and the rest forward to
  the page that now holds the section, with `replace` so Back returns to where the visitor
  came from. Hashes for sections still on the home page are left alone.
- **Waitlist links resolve from every route.** A bare `#waitlist` looks for an anchor on the
  current page, and sub-pages have none. They are now `/#waitlist`.
- **The sitemap lists the four new pages** at priority 0.8, and a test asserts the sitemap
  and `ROUTES` agree in both directions. The three host configs already served any path as
  the SPA shell, so a hard refresh on a new route needs no host change.

### FAQ structured data moved, and what that costs

The `FAQPage` JSON-LD moved out of `index.html` and onto `/faq`, where it is injected when
the page mounts and removed when it unmounts. It could not stay: it described questions
from a page that no longer contains them.

**The trade-off, stated plainly:** a crawler that does not execute JavaScript no longer sees
this structured data. Google renders JavaScript and will read it; other consumers may not.

Doing this exposed an existing defect. The hand-written block in `index.html` was already
**stale** against the rendered page: it listed 8 questions where the page renders 9 (it
omitted "Will it cost anything?"), and two of its questions used different wording from the
page. The schema is now generated from `src/data/faq.ts`, the same data the page renders,
so the two cannot drift. That fixes a pre-existing SEO defect rather than only relocating
one.

### Link previews for the new pages

The same limit reaches further than the structured data. `index.html` carries the home page's
title, description, canonical link and `og:url`, and `useDocumentMeta` rewrites them only after
JavaScript runs. Link unfurlers such as Slack and iMessage do not run it, so a pasted link to
`/safety-score`, `/features`, `/about` or `/faq` previews the home page, and the canonical and
`og:url` say `/`. The sitemap now advertises those four pages at priority 0.8. Prerendering is
out of scope for this branch, so it is recorded as item 5 in [`before-launch.md`](before-launch.md)
with the options, for you to decide.

### Testing

Vitest and Testing Library were added at the start of this work. The project had no test
runner at all, and `npm run test` was a script CLAUDE.md referred to that did not exist; it
is now a real script and runs the suite once. At the time of writing that is 125 tests across
17 files, in jsdom with `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `scrollTo`
and `scrollIntoView` stubbed in `src/test/setup.ts`. Tests render through
`renderWithRouter`, which mirrors the router flags the app ships with.

The suite covers:

- **Routing at app level:** every route in `ROUTES` renders its own page with exactly one `h1`
  (an id only that page carries, so a mis-registered route falling through to the 404 fails),
  an unknown path reaches the 404, and every stale hash forwards to a page that holds the
  section it names.
- **First visit to a lazy route:** the scroll reveals arm for content that arrives after the
  layout has mounted, and under `prefers-reduced-motion` every reveal element is marked visible
  rather than left hidden.
- **Data integrity:** the nav and footer point only at real routes or external URLs, nothing
  still links to a moved section, and the sitemap and `ROUTES` agree.
- **Each page:** one `h1`, no skipped heading levels, a document title, and the `FAQPage`
  schema being injected on mount, once, with one entry per question the page shows, and removed
  on unmount.
- **Navigation behaviour:** the header and the mobile menu mark the current route and nothing
  on `/`, and stale hashes forward, replace rather than push, and scroll on the page they land
  on. Hash scrolls jump rather than animate under `prefers-reduced-motion`.
- **Cross-links:** the four waitlist calls to action point at `/#waitlist` from both `/` and a
  sub-page, and the hero's secondary link correctly stays local.

It does not cover rendered layout, the GSAP motion, or form submission. Those are checked in
a real browser.

### Deviation from the spec

The design spec called for a `PageIntro` component to supply each page's `h1`. It was
deliberately not built. Every moved section already renders its own eyebrow, heading and
lede, so a page-title block above it would say nearly the same thing twice. Instead
`SectionHeading` gained an `as` prop, and the lead section on each route renders its
existing heading as that route's `h1`.

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

Five open items, written up in full in [`before-launch.md`](before-launch.md):

1. **Legal details** — the only hard blocker. Visible placeholder panels on `/privacy` and
   `/terms` until real text replaces them.
2. **Per-feature status** — which of the six app features are shipped versus planned.
3. **The encryption claim** — the current site states end-to-end encryption; this rebuild
   deliberately does not, because it could not be verified.
4. **Deployment config** — three environment variables, then a go-live checklist.
5. **Social previews** — links to the four new pages unfurl as the home page, because the
   metadata is rewritten by JavaScript that unfurlers do not run. Prerendering, static
   generation or a service would fix it; which one, if any, is your call.

Merging is no longer pending: `feature/website-build` was merged to `main` once the above were
documented.
