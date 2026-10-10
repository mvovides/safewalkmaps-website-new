# Site architecture — moving detail off the home page

Date: 2026-10-10
Branch: `feature/site-architecture`, cut from `refactor/apple-motion-materials`

## Why

The home page is one continuous argument across thirteen sections. Measured against the
production build it runs **21.6 screens on desktop and 27.9 on a phone**. A visitor who
only wants to know what the product is has to scroll past the safety-score methodology,
six feature cards, the privacy position, five scenarios, the mission, the FAQ and a
contact form to get there.

The goal is that the scroll journey on the home page carries the pitch, and detail lives
on pages a visitor chooses to open.

## Measured starting point

Per-section scroll cost, production build, `document.scrollHeight / viewport height`:

| Section id | Desktop | Phone | Disposition |
| --- | --- | --- | --- |
| `hero` | 3.18 | 3.50 | stays |
| `problem` | 1.31 | 1.62 | stays |
| `how-it-works` | 4.32 | 3.48 | stays |
| `safety-score` | 1.61 | 2.54 | → `/safety-score` |
| `routes` | 1.39 | 2.18 | stays |
| `features` | 1.66 | 3.39 | → `/features` |
| `privacy` | 1.06 | 1.67 | → `/about` |
| `scenarios` | 1.22 | 0.96 | → `/features` |
| `mission` | 1.07 | 1.35 | → `/about` |
| `waitlist` | 0.93 | 1.61 | stays |
| `faq` | 1.45 | 2.29 | → `/faq` |
| `contact` | 0.71 | 1.15 | → `/about` |
| final CTA | 1.13 | 1.05 | stays, and is reused as every detail page's closer |
| **Total** | **21.6** | **27.9** | |

Projected home page: **12.3 desktop / 13.4 phone** — a 43% cut on desktop, 52% on phone.

These are measurements of the current build, not estimates. The same script should be
re-run after implementation to confirm the projection.

## Decisions

All four were put to the owner and answered. Recorded here so the reasoning is not lost.

1. **Split: narrative spine.** Home keeps hero → problem → how-it-works → routes →
   waitlist → CTA. Seven sections move. The alternative of moving only Safety score and
   Features was rejected as too small a cut (18%); condensing the pinned signal story was
   rejected because it is the home page's biggest animation set-piece.
2. **Depth: reshape existing material.** The moved sections get page framing, room, and a
   closing CTA. No new product claims are written. This matters because feature status
   (shipped vs planned) is still an open question in `before-launch.md` — writing deeper
   feature copy would require answers the project does not have.
3. **Navigation: pure route nav.** Four page links. The active indicator matches the route.
   A mixed anchor/route nav was rejected because the indicator would need two rules and
   one link would behave unlike the rest.
4. **Waitlist: home only.** One form, one submission path. Detail pages close with a CTA
   that links to `/#waitlist`.

A fifth question was raised and answered against the recommendation: the privacy section
moves to `/about` rather than staying on the home page. The concern raised was that for a
personal-safety product the data-handling promise reads as a reason to trust the product
rather than as a detail, and it sat immediately before the ask. The owner's decision is
to move it. Recorded here only so the trade-off is visible if conversion is reviewed
later; the design below implements the move.

## Page map

| Route | Contents | Lazy |
| --- | --- | --- |
| `/` | `HeroSection`, `ProblemSection`, `SafetyLayerSection`, `RouteChoiceSection`, `WaitlistSection`, `FinalCtaSection` | no — carries the scroll experience |
| `/safety-score` | `PageIntro`, `SafetyScoreSection`, `FinalCtaSection` | yes |
| `/features` | `PageIntro`, `FeatureSection`, `ScenariosSection`, `FinalCtaSection` | yes |
| `/about` | `PageIntro`, `MissionSection`, `PrivacySection`, `ContactSection` | yes |
| `/faq` | `PageIntro`, `FaqSection`, `FinalCtaSection` | yes |
| `/privacy`, `/terms`, `*` | unchanged | yes (already) |

`/about` ends on `ContactSection` rather than the CTA — a contact form is already an ask,
and stacking a second one under it would be noise.

## Components

### New: `PageIntro`

One new component, in `src/components/layout/PageIntro.tsx`.

```
type PageIntroProps = {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: 'white' | 'secondary';
};
```

Renders the `h1` for the route, with top padding that clears the fixed navigation
(`--nav-height`). Visually it is `SectionHeading` at page scale; it exists separately
because `SectionHeading` renders an `h2` and every route needs exactly one `h1`.

### Changed: section components

Each moved section currently renders its own `<Section>` with a hardcoded eyebrow index.
Two changes:

- **Drop the index** from moved sections. `01`–`10` encodes one continuous argument that
  no longer exists. `index` is already optional on `Eyebrow` and `SectionHeading`, so this
  is deleting a prop, not adding a branch.
- **Renumber the home page.** Four sections there carry an index, and all four change:
  `01` problem, `02` how-it-works, `03` routes, `04` waitlist (from `01`, `02`, `04`, `09`).
  The hero and the final CTA have no index and gain none.

Section `id` attributes stay as they are. They cost nothing, they keep deep links like
`/features#features` working, and `scroll-margin-top` is already handled globally.

### Reused: `FinalCtaSection`

Used unchanged as the closer on `/safety-score`, `/features` and `/faq`. Its button
already points at `#waitlist`; that becomes `/#waitlist` (see Cross-links).

### Deleted: `useActiveSection`

The header's scroll-spy has no consumer once navigation is route-based. The hook and its
file are removed rather than left dormant.

## Navigation

`src/data/navigation.ts`:

```
export type NavLink = { label: string; path: string };

export const navLinks: NavLink[] = [
  { label: 'Safety score', path: '/safety-score' },
  { label: 'Features',     path: '/features' },
  { label: 'About',        path: '/about' },
  { label: 'FAQ',          path: '/faq' },
];
```

`navSectionIds` is removed.

In `SiteHeader`, the active item is derived from `useLocation().pathname` instead of
`useActiveSection`. The sliding indicator keeps the transform-and-spring implementation
from the motion pass — only its input changes, from a scroll-derived section id to a
route match. `measureIndicator` is unchanged apart from the attribute it queries.

Links become react-router `<Link>` rather than `<a href="#…">`, so navigation does not
reload the document.

`MobileMenu` takes the same list. Its `isHome` prop becomes unnecessary for the nav links
(they are absolute paths now) but is still needed for the waitlist button, so it stays.

Footer columns are rewritten:

| Current | Becomes |
| --- | --- |
| `/#how-it-works` | `/#how-it-works` (unchanged — still on home) |
| `/#safety-score` | `/safety-score` |
| `/#routes` | `/#routes` (unchanged — still on home) |
| `/#features` | `/features` |
| `/#waitlist` | `/#waitlist` (unchanged) |
| `/#mission` | `/about` |
| `/#contact` | `/about#contact` |
| `/#faq` | `/faq` |

## Routing

Four lazy routes added to `App.tsx` beside the existing ones, following the established
pattern exactly. The home page stays in the main bundle because it carries the scroll
experience; the detail pages are split because most visitors will open at most one.

The router already handles scroll on route change and honours `#hash` targets once the new
route has painted (`useRouteScroll` in `SiteLayout`). `/about#contact` works without
further change.

## SEO

- **Per-page metadata.** Each new page calls `useDocumentMeta` with its own title,
  description and path, as `PrivacyPage` and `TermsPage` already do.
- **Sitemap.** Four entries added to `public/sitemap.xml` at priority `0.8` — above the
  legal pages at `0.5`, below home at `1.0`.
- **FAQPage JSON-LD moves.** It currently sits in `index.html`, which is correct only
  while the FAQ is on the home page. It moves to `/faq`, injected on mount and removed on
  unmount. This is a behaviour change worth stating plainly: a crawler that does not
  execute JavaScript will no longer see FAQ structured data. Google renders JS and will;
  the alternative — leaving it on a page that no longer contains the FAQ — is incorrect
  markup. The `MobileApplication`, `Organization` and `WebSite` graph in `index.html`
  stays where it is, since it describes the site rather than any one page.

## Cross-links

Five `#waitlist` references become `/#waitlist` so they resolve from a detail page rather
than looking for an anchor on the current route:

- `HeroSection` primary CTA
- `FinalCtaSection` button
- `SiteHeader` waitlist button (already branches on `isHome`; the branch collapses)
- `MobileMenu` waitlist button (same)
- Footer `Product → iOS waitlist`

`#how-it-works` in the hero's secondary CTA stays as-is: it targets a section still on the
home page, and the hero only ever renders there.

## Out of scope

- No new product copy. Nothing is claimed about the app that the repo does not already
  claim.
- No change to the four open items in `before-launch.md`. Feature status becomes more
  visible on a dedicated `/features` page, but resolving it still needs the owner's input.
- No redesign of the sections themselves. They move and lose their index; their internals
  are untouched.
- No change to the motion system from the previous pass.

## Risks

1. **Deep links break.** `safewalkmaps.com/#features` and `/#safety-score` may exist in
   the wild. Mitigation: the home page keeps its `id`s for sections that stay, and the
   moved ones are redirected client-side.

   A `useStaleHashRedirect` hook in `HomePage` reads `location.hash` on mount, looks it up
   in a `Record<string, string>` map, and on a hit calls
   `navigate(path, { replace: true })`. `replace` rather than `push`, so Back returns the
   visitor to wherever they came from rather than to a home page they never meant to see.

   This must run before `useRouteScroll` tries to scroll to a now-absent anchor. In
   practice it does — `SiteLayout`'s scroll effect defers to `requestAnimationFrame` while
   the redirect fires synchronously in the child's mount effect — but the plan should
   assert that ordering in a test rather than rely on it holding.

   | Stale hash | Redirects to |
   | --- | --- |
   | `#safety-score` | `/safety-score` |
   | `#features` | `/features` |
   | `#scenarios` | `/features` |
   | `#privacy` | `/about` |
   | `#mission` | `/about` |
   | `#contact` | `/about#contact` |
   | `#faq` | `/faq` |

   `#privacy` maps to `/about`, not to the `/privacy` legal page: the old anchor pointed
   at the privacy *section*, and the policy is a different document.
2. **Thin pages.** `/safety-score` is 1.61 screens of content plus intro and CTA. It is a
   real page but not a long one. Accepted under decision 2; revisit if analytics show
   bounce.
3. **Branch ordering.** This branch is cut from `refactor/apple-motion-materials`, which
   is itself unmerged. `SiteHeader` is modified by both. They must merge in order:
   motion pass first, then this.

## Verification

1. `npm run typecheck`, `npm run lint`, `npm run build` clean.
2. Re-run the scroll measurement script against the production build and confirm the home
   page lands near 12.3 / 13.4 screens.
3. Rendered checks, extending the existing suite:
   - every route returns exactly one `h1`
   - no console errors or warnings on any of the seven routes
   - no horizontal overflow at 390, 768, 1440
   - header indicator matches the active route on each page
   - every footer and nav link resolves (no 404s, no dead anchors)
   - each stale hash redirects to its new route
   - `/about#contact` scrolls to the contact section
   - reduced-motion leaves nothing stranded invisible on the new pages
4. Screenshots of each new route at phone and desktop width, reviewed.
