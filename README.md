# SafeWalkMaps — website

The marketing site for [SafeWalkMaps](https://safewalkmaps.com), a safety-aware walking
navigation app coming to iOS.

Built with React, Vite, TypeScript, Tailwind CSS and GSAP ScrollTrigger. It is a static
single-page app — no server, no database, no build-time data fetching — so it deploys to any
CDN host.

---

## Quick start

```bash
npm install
cp .env.example .env    # optional: forms fall back to development mode without it
npm run dev             # http://localhost:5173
```

### Scripts

| Script                       | What it does                                                             |
| ---------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                | Vite dev server with hot reload                                          |
| `npm run build`              | Type-check, then build to `dist/`                                        |
| `npm run preview`            | Serve the production build locally                                       |
| `npm run lint`               | ESLint over the whole project                                            |
| `npm run typecheck`          | TypeScript, no emit                                                      |
| `npm run format`             | Prettier over source                                                     |
| `npm run og`                 | Regenerate the favicon set and social preview (see below)                |
| `npm run build:playground`   | Build the theme playground to `dist-playground/` (never part of `build`) |
| `npm run preview:playground` | Serve that playground build locally                                      |

The theme playground is served in dev at `/playground.html`; see
[`docs/theme-playground.md`](docs/theme-playground.md).

---

## Environment variables

Every variable is optional — the site builds and renders without any of them. Copy
`.env.example` to `.env` and fill in what you need.

| Variable                    | Purpose                                                                                         | Without it                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `VITE_WEB3FORMS_ACCESS_KEY` | Delivers waitlist and contact submissions to your inbox via [Web3Forms](https://web3forms.com). | Forms run in **development mode**: submissions are simulated and the success screen says so explicitly. Nothing is sent. |
| `VITE_SITE_URL`             | Canonical origin for canonical links and OpenGraph URLs. No trailing slash.                     | Falls back to `https://safewalkmaps.com`.                                                                                |
| `VITE_CONTACT_EMAIL`        | Public contact address and `mailto:` fallback if a submission fails.                            | Falls back to `safewalkmaps@gmail.com`.                                                                                  |

The Web3Forms access key is a public, submission-only credential — it is safe in a client
bundle and cannot read anything back. It is read from the environment so it can be rotated per
deployment rather than committed.

**On your host**, set these in the project's environment variable settings. Vite inlines
`VITE_*` variables at build time, so a change requires a redeploy, not just a restart.

---

## Deployment

The build output is a static `dist/` directory. Because `/privacy` and `/terms` are
client-side routes, the host must serve `index.html` for unknown paths.

| Host                 | Configuration                   | Notes                                                                                    |
| -------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| **Vercel**           | `vercel.json` (committed)       | Build `npm run build`, output `dist`. Rewrites and cache headers are already configured. |
| **Netlify**          | `netlify.toml` (committed)      | Build command and publish directory are set.                                             |
| **Cloudflare Pages** | `public/_redirects` (committed) | Build `npm run build`, output `dist`.                                                    |
| **Any static host**  | —                               | Serve `dist/`, and rewrite unmatched paths to `/index.html`.                             |

After deploying, set the environment variables above and redeploy once so the forms go live.

---

## Project structure

```
src/
  components/
    animations/     scroll-reveal counter and motion helpers
    brand/          logo marks traced from the supplied asset
    illustrations/  route lines, street networks, safety data layers, score ring
    layout/         page shell, sections, footer, legal page template
    navigation/     header and mobile menu
    product/        iPhone frame and the app screens inside it
    sections/       one file per homepage section
    ui/             buttons, chips, accordion, fields, segmented tabs
  data/             all site copy and the illustrative route geometry
  hooks/            reveal, media query, reduced motion, GSAP context
  lib/              design tokens bridge, config, motion setup
  pages/            home, privacy, terms, 404
  services/         waitlist and contact transport
  styles/           design tokens and global CSS
scripts/            one-off brand asset generation
public/             icons, social preview, robots, sitemap, manifest
```

### Where the content lives

All copy is in `src/data/`, separate from the components that render it:

- `city.ts` — the three illustrative routes and the street geometry behind every phone mockup
- `signals.ts` — the five safety data layers and their weights in the routing model
- `features.ts`, `faq.ts`, `legal.ts`, `navigation.ts` — section copy

---

## Design system

Colours are sampled directly from `safewalkmaps_logo.svg`: the shield gradient
(`#062E6F → #05295F → #031B3D`) and the route gradient (`#6AF5A4 → #43E68D → #17F58B`).

Tokens live in two places that must stay in step:

- `tailwind.config.ts` — the source of truth for utilities (colours, fluid type scale, radii,
  shadows, easing)
- `src/styles/index.css` — the same brand values as CSS custom properties, so inline SVG and
  GSAP timelines can reach them

Contrast is checked and noted in the config. In short: `green.500` is a graphics colour on
white (1.5:1) and a text colour on navy (11.8:1); use `green.800` for green text on white.

---

## Motion

Two systems, deliberately:

1. **Scroll reveals** — a single `IntersectionObserver` (`useScrollReveal`) toggles
   `data-visible` on every `[data-reveal]` element. Nothing is hidden until JavaScript marks
   the document `motion-ready`, so the page is fully readable if JS fails or is slow.
2. **Scroll stories** — GSAP ScrollTrigger drives the hero, the pinned safety-layer section,
   the route comparison and the final CTA. Timelines are built inside `gsap.context` via
   `useGsapContext`, which reverts tweens and disposes ScrollTriggers on unmount.

GSAP writes to DOM nodes directly rather than through React state, so scrubbing a scroll story
costs no re-renders. The pinned section re-renders only when its step index changes — six times
across the whole section.

**Reduced motion** is handled at both levels: the CSS forces every reveal visible, and the
components that own scroll stories render an alternative static layout rather than a blank
screen. The safety-layer section, for example, becomes a readable list beside a map showing all
five layers at once.

### Motion on touch

Mobile is not the desktop timeline scaled down. Four things differ, each for a reason:

|                          | Phone                    | Desktop      |
| ------------------------ | ------------------------ | ------------ |
| Scroll per pinned beat   | ~41svh (`--signal-step`) | ~55svh       |
| Scrub lag (`scrubFor`)   | 0.35                     | 0.6 – 0.8    |
| Reveal duration / travel | 460ms / 12px             | 700ms / 20px |
| Decorative map pulses    | static halo              | animating    |

A thumb covers far more of the page per gesture than a wheel does, so a long scrub reads as
the animation being detached from your hand, and a 700ms reveal is still running as the
element leaves the screen. The pinned stories get less distance — but not so little that a
beat ends before it can be read.

Two rules worth keeping if you extend this:

- **Never put an SVG filter on a path that animates.** The route halo is two stacked
  translucent strokes, not a Gaussian blur, because the dash offset animates and the filter
  would re-run every frame. That one change removed most of the dropped frames on mobile.
- **Hover does not exist on touch.** Every control has an `:active` state and
  `touch-action: manipulation`, or a tap gives no acknowledgement at all.

Measured on the production build, 4× CPU throttle, 390×844, scrolling the full page: p99
frame time 17ms, five frames over 32ms, worst frame 33ms, no long tasks. The probes used are
throwaway scripts, not part of the repo — see "Regenerating brand assets" for how Playwright
is used here.

---

## Regenerating brand assets

`public/og-image.png`, `favicon.ico`, `apple-touch-icon.png` and the PWA icons are generated
from `public/icon.svg` and `scripts/og-template.html`. The outputs are committed, so this only
needs running when the brand or the social-preview layout changes.

Playwright is used purely as a renderer and is deliberately **not** a project dependency:

```bash
npm i -D playwright && npx playwright install chromium
cp public/icon.svg scripts/icon.svg
npm run og
rm scripts/icon.svg
```

---

## Responsible messaging

This is a personal-safety product, so the copy has rules. They are not stylistic.

- A Safety Score is **relative guidance from available data**, never a guarantee.
- Never imply a route is "safe", that a high score prevents harm, or that a lower-scoring
  street is inherently dangerous.
- SafeWalkMaps is **not** an emergency service and does not replace one.
- Demo figures carry the `ILLUSTRATIVE_NOTE` disclaimer wherever they appear.
- No invented testimonials, user counts, waitlist numbers, press logos, certifications or
  security claims. The privacy page says plainly that no security certification is held.

The illustrative route numbers are internally consistent rather than decorative: the three
routes share an origin and destination, and their times and distances follow from the measured
path geometry at a constant walking pace. See the comment at the top of `src/data/city.ts`.

---

## Before going live

**See [`docs/before-launch.md`](docs/before-launch.md)** — four open items, what each one
blocks, and how to close it.

The short version: `src/data/legal.ts` contains visible **“needs confirmation”** blocks
marking legal details that must be supplied rather than invented. They render as amber warning
panels on `/privacy` and `/terms`, so the site cannot quietly ship with made-up legal text.
Alongside that, three product decisions need your call: which features are shipped versus
planned, whether the end-to-end encryption claim from the current site is accurate, and the
environment variables for the host.
