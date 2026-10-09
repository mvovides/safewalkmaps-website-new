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

## Verified

Checked in a real browser at 375, 390, 430, 768, 1440 and 1728px:

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

1. **Legal details.** `src/data/legal.ts` carries visible "needs confirmation" blocks for
   the operating entity, registered address, governing jurisdiction, liability cap,
   sub-processor list and whether a DPO is appointed. They render as warning panels on
   `/privacy` and `/terms`.
2. **Per-feature status.** The site presents live navigation, re-routing, sharing,
   reports, offline and SOS the way the current product pages do. If any of those are
   planned rather than shipped, say which and the copy should mark them.
3. **Encryption claims.** The current site states end-to-end encryption; this rebuild
   deliberately does not, because it could not be verified. Restore it only if it is
   accurate.
4. **Merging.** This work sits on `feature/website-build`. Per `CLAUDE.md`, merging to
   `main` waits on your approval.
