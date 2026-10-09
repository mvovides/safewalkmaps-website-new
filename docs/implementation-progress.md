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

## Verified

Checked in a real browser at 375, 390, 768, 1440 and 1728px:

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
