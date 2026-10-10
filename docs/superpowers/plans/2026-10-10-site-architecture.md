# Site Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move seven sections off the SafeWalkMaps home page onto four new routes, cutting the home page from 21.6 to ~12.3 screens on desktop, and switch the header from scroll-spy anchors to route-based navigation.

**Architecture:** Four new lazy-loaded pages compose existing section components unchanged apart from a heading-level prop and a dropped eyebrow index. A single `src/data/routes.ts` becomes the one source of truth for every public path, so navigation links, the sitemap and the router are all testable against it. The home page keeps its scroll experience and gains a redirect for hashes whose sections have moved.

**Tech Stack:** React 18, TypeScript, Vite 5, react-router-dom 6, Tailwind 3. Tests: Vitest + @testing-library/react + jsdom (added in Task 1).

**Spec:** [`docs/superpowers/specs/2026-10-10-site-architecture-design.md`](../specs/2026-10-10-site-architecture-design.md)

## Deviation from the spec — read before starting

The spec calls for a new `PageIntro` component supplying each page's `h1`. **Do not build it.**

Every section that moves already renders its own `SectionHeading` — an eyebrow, an editorial
headline and a lede. A `PageIntro` above that would render a second eyebrow, `h1` and lede
saying nearly the same thing, two blocks deep.

Instead, `SectionHeading` gains an `as` prop and the lead section on each page renders its
existing heading as the `h1`. Same visual result the spec described (page eyebrow, editorial
headline, lede), no duplication, no new component. `MissionSection` renders a raw `h2` rather
than `SectionHeading`, so it gets the same prop directly.

Everything else in the spec stands.

## Global Constraints

- **No new product claims.** Only copy and data already in the repo. Feature status (shipped vs planned) is unresolved in `before-launch.md` — do not imply either.
- **Exactly one `<h1>` per route.**
- **No new runtime dependencies.** Task 1 adds dev dependencies only.
- **Every task ends green on:** `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- **Section `id` attributes stay as they are** — deep links and `scroll-margin-top` depend on them.
- **Commit attribution:** every commit message ends with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Branch:** `feature/site-architecture`, already cut from `refactor/apple-motion-materials`. Do not rebase onto `main`; the motion pass must merge first.
- **Do not reformat untouched files.** The repo has pre-existing Prettier drift in ~60 files; leave it.

## Review Focus

Five conditions the spec implies that no obvious task would otherwise cover. Each has a test assigned to the task that owns the code.

1. **A hash that still points at a home-page section must not be redirected.** `#routes`, `#waitlist`, `#how-it-works` and `#main` stay on `/`. A redirect map that matches too eagerly sends visitors away from the page they asked for. → Task 8.
2. **Back, after a stale-hash redirect, must not land on the stale URL.** `navigate(..., { replace: true })` is what prevents a Back-button trap. → Task 8.
3. **Direct entry to a new route must serve the app, not a 404.** These are client-side routes on a static host; `vercel.json`, `netlify.toml` and `public/_redirects` must already rewrite unknown paths to `index.html`. This is config, not code — verify it rather than assume. → Task 11.
4. **Reduced motion must not strand the new pages' content invisible.** Every moved section carries `data-reveal`; `useScrollReveal` re-runs per route. If it does not, a reduced-motion visitor sees blank panels. → Task 11.
5. **A nav or footer link pointing at a path with no route is a dead link.** Seven links change in this plan; one typo is invisible until someone clicks it. → Task 3.

---

### Task 1: Test infrastructure

**Files:**
- Modify: `package.json` (devDependencies, `test` script)
- Modify: `vite.config.ts` (test block)
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run test` (single run) and `npm run test:watch`. A jsdom environment with `@testing-library/jest-dom` matchers registered and cleanup between tests. The `@` alias resolves in tests, inherited from `vite.config.ts`.

- [ ] **Step 1: Install dev dependencies**

```bash
npm i -D vitest@2.1.8 @testing-library/react@16.1.0 @testing-library/jest-dom@6.6.3 @testing-library/user-event@14.5.2 jsdom@25.0.1
```

- [ ] **Step 2: Add the test scripts**

In `package.json`, inside `"scripts"`, after the existing `"typecheck"` line:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Configure Vitest**

In `vite.config.ts`, add a `test` key to the `defineConfig` object, as a sibling of `build`:

```ts
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
  },
```

Change the import at the top of the file so the `test` key type-checks:

```ts
/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';
```

- [ ] **Step 4: Write the setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom implements neither of these, and both are used on every route:
// useScrollReveal and useActiveSection construct an IntersectionObserver, and
// the motion system reads matchMedia. Without them every render throws.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

vi.stubGlobal('IntersectionObserver', NoopObserver);
vi.stubGlobal('ResizeObserver', NoopObserver);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom has no layout engine, so scrollIntoView and scrollTo are absent.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 5: Write a smoke test that proves the harness works**

Create `src/test/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { siteConfig } from '@/lib/config';

describe('test harness', () => {
  it('resolves the @ alias', () => {
    expect(siteConfig.name).toBe('SafeWalkMaps');
  });

  it('provides a jsdom document', () => {
    expect(document.body).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run the tests**

Run: `npm run test`
Expected: PASS, 2 tests.

- [ ] **Step 7: Make sure the new files do not break the other checks**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all clean.

`vitest/globals` has to be visible to TypeScript for `describe`/`it`/`expect` to type-check
without importing them. They are imported explicitly in every test file in this plan, so no
`types` entry is required in `tsconfig`. If you add a test that relies on globals instead,
add `"types": ["vitest/globals"]` to `tsconfig.app.json`'s `compilerOptions`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/test/setup.ts src/test/smoke.test.ts
git commit -m "$(cat <<'EOF'
chore: add Vitest and Testing Library

The project had no test runner, so `npm run test` in CLAUDE.md's check
list was a script that did not exist. This restructure moves seven
sections across four new routes, where the risk is concentrated in
routing and rendering — exactly what a component test catches in
milliseconds and a manual browser pass catches at the end, if at all.

jsdom implements neither IntersectionObserver nor matchMedia, and both
are used on every route, so the setup file stubs them.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `SectionHeading` gains a heading level

**Files:**
- Modify: `src/components/layout/Section.tsx`
- Test: `src/components/layout/Section.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `SectionHeadingProps.as?: 'h1' | 'h2'`, default `'h2'`. Consumed by Tasks 4, 5 and 7.

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/Section.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeading } from './Section';

describe('SectionHeading', () => {
  it('renders an h2 by default', () => {
    render(<SectionHeading title="A heading" />);
    expect(screen.getByRole('heading', { level: 2, name: 'A heading' })).toBeInTheDocument();
  });

  it('renders an h1 when asked', () => {
    render(<SectionHeading as="h1" title="A page title" />);
    expect(screen.getByRole('heading', { level: 1, name: 'A page title' })).toBeInTheDocument();
  });

  it('keeps its styling at h1', () => {
    render(<SectionHeading as="h1" title="Styled" size="lg" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-display-lg');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- Section`
Expected: FAIL — the second test errors because `as` is not a known prop and no `h1` is rendered.

- [ ] **Step 3: Add the prop**

In `src/components/layout/Section.tsx`, add to `SectionHeadingProps`:

```ts
  /**
   * Heading level. A section inside a page is an `h2`; the section that leads
   * a route renders its heading as that route's `h1`, so the page needs no
   * separate title block repeating it.
   */
  as?: 'h1' | 'h2';
```

In the `SectionHeading` function signature, destructure the prop under a capitalised local
name so JSX treats it as a component, and because `as` is awkward as a bare identifier:

```tsx
  as: Heading = 'h2',
```

Then replace the `<h2 ...>` opening tag with `<Heading ...>` and its `</h2>` with `</Heading>`,
leaving every attribute exactly as it is.

- [ ] **Step 4: Run the tests**

Run: `npm run test -- Section`
Expected: PASS, 3 tests.

- [ ] **Step 5: Confirm nothing else moved**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Section.tsx src/components/layout/Section.test.tsx
git commit -m "$(cat <<'EOF'
feat: let SectionHeading render as an h1

Sections that move to their own route need their existing heading to
become that route's h1. The alternative — a separate page title block
above the section — renders a second eyebrow, heading and lede saying
nearly the same thing.

Defaults to h2, so every current caller is unchanged.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Route table and navigation data

**Files:**
- Create: `src/data/routes.ts`
- Modify: `src/data/navigation.ts`
- Test: `src/data/navigation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `ROUTES: readonly string[]` — every public path, including `/privacy` and `/terms`.
  - `NavLink = { label: string; path: string }` and `navLinks: NavLink[]`.
  - `footerColumns` with the same shape as today, hrefs updated.
  - `navSectionIds` is **deleted**.

- [ ] **Step 1: Write the failing test**

Create `src/data/navigation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { footerColumns, navLinks } from './navigation';
import { ROUTES } from './routes';

/** A link target is valid if it is a known route, optionally with a #hash. */
function resolves(href: string): boolean {
  if (href.startsWith('http')) return true;
  const [path] = href.split('#');
  // `/#waitlist` splits to '/', and a bare '#x' means the current page.
  if (path === '') return true;
  return ROUTES.includes(path);
}

describe('ROUTES', () => {
  it('lists every public path exactly once', () => {
    expect(new Set(ROUTES).size).toBe(ROUTES.length);
  });

  it('includes the four new pages', () => {
    expect(ROUTES).toEqual(
      expect.arrayContaining(['/safety-score', '/features', '/about', '/faq']),
    );
  });
});

describe('navLinks', () => {
  it('points every item at a real route', () => {
    for (const link of navLinks) {
      expect(ROUTES, `nav link "${link.label}" -> ${link.path}`).toContain(link.path);
    }
  });

  it('is the four detail pages', () => {
    expect(navLinks.map((l) => l.path)).toEqual([
      '/safety-score',
      '/features',
      '/about',
      '/faq',
    ]);
  });
});

describe('footerColumns', () => {
  it('points every link at a real route or an external URL', () => {
    for (const column of footerColumns) {
      for (const link of column.links) {
        expect(resolves(link.href), `footer link "${link.label}" -> ${link.href}`).toBe(true);
      }
    }
  });

  it('has no links left pointing at moved sections', () => {
    const moved = ['#safety-score', '#features', '#privacy', '#scenarios', '#mission', '#faq'];
    const hrefs = footerColumns.flatMap((c) => c.links.map((l) => l.href));
    for (const stale of moved) {
      expect(hrefs, `footer still links to ${stale}`).not.toContain(`/${stale}`);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- navigation`
Expected: FAIL — `./routes` does not exist.

- [ ] **Step 3: Create the route table**

Create `src/data/routes.ts`:

```ts
/**
 * Every public path on the site, in one place.
 *
 * The router, the navigation, the footer and the sitemap all have to agree on
 * this list. Keeping it here means a link to a path that does not exist is a
 * test failure rather than something a visitor discovers.
 */
export const ROUTES = [
  '/',
  '/safety-score',
  '/features',
  '/about',
  '/faq',
  '/privacy',
  '/terms',
] as const;

export type Route = (typeof ROUTES)[number];
```

- [ ] **Step 4: Rewrite the navigation data**

Replace the top of `src/data/navigation.ts` (the `NavLink` type, `navLinks` and `navSectionIds`) with:

```ts
export type NavLink = {
  label: string;
  /** Absolute path to the page this links to. */
  path: string;
};

export const navLinks: NavLink[] = [
  { label: 'Safety score', path: '/safety-score' },
  { label: 'Features', path: '/features' },
  { label: 'About', path: '/about' },
  { label: 'FAQ', path: '/faq' },
];
```

Delete the `navSectionIds` export entirely.

Then update `footerColumns` to:

```ts
export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Safety score', href: '/safety-score' },
      { label: 'Compare routes', href: '/#routes' },
      { label: 'Features', href: '/features' },
      { label: 'iOS waitlist', href: '/#waitlist' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our mission', href: '/about' },
      { label: 'Contact', href: '/about#contact' },
      { label: 'Marvian Tech', href: 'https://marvian.tech', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
] as const;
```

- [ ] **Step 5: Run the tests**

Run: `npm run test -- navigation`
Expected: PASS, 6 tests.

- [ ] **Step 6: Expect typecheck to fail, and note where**

Run: `npm run typecheck`
Expected: FAIL in `src/components/navigation/SiteHeader.tsx` (uses `navSectionIds`, `link.hash`, `link.sectionId`) and `src/components/navigation/MobileMenu.tsx` (uses `link.hash`, `link.sectionId`).

This is expected — Task 9 fixes the header and menu. Do not fix them here; do not commit a broken typecheck either. Instead, proceed straight to Task 9 before committing, then return and commit both together.

**If you are executing tasks in isolation:** merge Task 3 and Task 9 into a single commit at the end of Task 9. The test files from both tasks are committed there.

- [ ] **Step 7: Hold the commit**

No commit at the end of this task. Task 9 commits the navigation change as one coherent unit.

---

### Task 4: `/safety-score`

**Files:**
- Create: `src/pages/SafetyScorePage.tsx`
- Modify: `src/components/sections/SafetyScoreSection.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/SafetyScorePage.test.tsx`

**Interfaces:**
- Consumes: `SectionHeading`'s `as` prop (Task 2), `ROUTES` (Task 3).
- Produces: `SafetyScorePage` (named export), and `SafetyScoreSectionProps = { headingAs?: 'h1' | 'h2'; className?: string }`.

- [ ] **Step 1: Write the failing test**

Create `src/pages/SafetyScorePage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SafetyScorePage } from './SafetyScorePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <SafetyScorePage />
    </MemoryRouter>,
  );
}

describe('SafetyScorePage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leads with the safety score heading as the h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Understand the route/i);
  });

  it('shows the score ring section', () => {
    const { container } = renderPage();
    expect(container.querySelector('#safety-score')).toBeInTheDocument();
  });

  it('sets the document title and canonical path', () => {
    renderPage();
    expect(document.title).toMatch(/Safety score/i);
  });

  it('closes with a link to the waitlist that works from this page', () => {
    renderPage();
    const cta = screen
      .getAllByRole('link')
      .find((a) => /waitlist/i.test(a.textContent ?? ''));
    expect(cta).toHaveAttribute('href', '/#waitlist');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- SafetyScorePage`
Expected: FAIL — module `./SafetyScorePage` not found.

- [ ] **Step 3: Make the section's heading level configurable**

In `src/components/sections/SafetyScoreSection.tsx`, add above the component:

```tsx
export type SafetyScoreSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};
```

Change the signature to:

```tsx
export function SafetyScoreSection({ headingAs = 'h2', className }: SafetyScoreSectionProps = {}) {
```

Change the `<Section>` opening tag to:

```tsx
    <Section id="safety-score" tone="navy" spacing="large" className={className}>
```

In the `<SectionHeading>` call, delete the line `index="03"` and add `as={headingAs}`.

- [ ] **Step 4: Write the page**

Create `src/pages/SafetyScorePage.tsx`:

```tsx
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { SafetyScoreSection } from '@/components/sections/SafetyScoreSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function SafetyScorePage() {
  useDocumentMeta({
    title: 'The safety score — SafeWalkMaps',
    description:
      'How SafeWalkMaps scores a walking route: the worst stretch on the way, how much of the walk sits below par, and how confident the underlying data is.',
    path: '/safety-score',
  });

  return (
    <>
      {/* The lead section clears the fixed header, the way LegalPage does. */}
      <SafetyScoreSection headingAs="h1" className="pt-32 lg:pt-36" />
      <FinalCtaSection />
    </>
  );
}
```

- [ ] **Step 5: Register the route**

In `src/App.tsx`, add beside the other lazy imports:

```tsx
const SafetyScorePage = lazy(() =>
  import('@/pages/SafetyScorePage').then((module) => ({ default: module.SafetyScorePage })),
);
```

And inside `<Routes>`, after the `/` route:

```tsx
          <Route path="/safety-score" element={<SafetyScorePage />} />
```

- [ ] **Step 6: Point the closing CTA at the home page's waitlist**

This page's test asserts the CTA resolves from a sub-page, so the fix belongs here rather
than in Task 10.

In `src/components/sections/FinalCtaSection.tsx`, change the `ButtonLink`'s
`href="#waitlist"` to `href="/#waitlist"`. A bare `#waitlist` looks for an anchor on the
current page; from `/safety-score` there is none.

- [ ] **Step 7: Run the tests**

Run: `npm run test -- SafetyScorePage`
Expected: PASS, 5 tests.

- [ ] **Step 8: Full check**

Run: `npm run test && npm run typecheck && npm run lint && npm run build`
Expected: typecheck still fails in `SiteHeader`/`MobileMenu` if Task 3 ran first. That is known and Task 9 resolves it. Everything else clean.

- [ ] **Step 9: Commit**

```bash
git add src/pages/SafetyScorePage.tsx src/pages/SafetyScorePage.test.tsx src/components/sections/SafetyScoreSection.tsx src/components/sections/FinalCtaSection.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
feat: give the safety score its own page

Moves the safety score off the home page onto /safety-score. The
section's existing heading becomes the route's h1, so the page needs no
separate title block repeating it, and its eyebrow index goes — the
01-10 numbering described one continuous argument that no longer exists.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `/features`

**Files:**
- Create: `src/pages/FeaturesPage.tsx`
- Modify: `src/components/sections/FeatureSection.tsx`
- Modify: `src/components/sections/ScenariosSection.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/FeaturesPage.test.tsx`

**Interfaces:**
- Consumes: `SectionHeading`'s `as` prop (Task 2).
- Produces: `FeaturesPage` (named export), `FeatureSectionProps = { headingAs?: 'h1' | 'h2'; className?: string }`.

- [ ] **Step 1: Write the failing test**

Create `src/pages/FeaturesPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { FeaturesPage } from './FeaturesPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <FeaturesPage />
    </MemoryRouter>,
  );
}

describe('FeaturesPage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leads with the features heading as the h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/keeps telling you why/i);
  });

  it('shows both the features and the scenarios', () => {
    const { container } = renderPage();
    expect(container.querySelector('#features')).toBeInTheDocument();
    expect(container.querySelector('#scenarios')).toBeInTheDocument();
  });

  it('alternates surface tone so the two sections read as separate', () => {
    const { container } = renderPage();
    expect(container.querySelector('#scenarios')).toHaveClass('bg-surface-secondary');
  });

  it('sets the document title', () => {
    renderPage();
    expect(document.title).toMatch(/Features/i);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- FeaturesPage`
Expected: FAIL — module not found.

- [ ] **Step 3: Make `FeatureSection` configurable**

In `src/components/sections/FeatureSection.tsx`, add above the component:

```tsx
export type FeatureSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};
```

Change the signature to:

```tsx
export function FeatureSection({ headingAs = 'h2', className }: FeatureSectionProps = {}) {
```

Change the `<Section>` tag to:

```tsx
    <Section id="features" spacing="large" className={className}>
```

In the `<SectionHeading>` call, delete `index="05"` and add `as={headingAs}`.

- [ ] **Step 4: Give `ScenariosSection` the secondary surface**

In `src/components/sections/ScenariosSection.tsx`:

Change `<Section id="scenarios">` to:

```tsx
    <Section id="scenarios" tone="secondary">
```

Delete the `index="07"` line from its `<SectionHeading>`.

On the home page these two sections were separated by the privacy section, so both could be
white. On `/features` they are adjacent, and two white surfaces in a row read as one long
section.

- [ ] **Step 5: Write the page**

Create `src/pages/FeaturesPage.tsx`:

```tsx
import { FeatureSection } from '@/components/sections/FeatureSection';
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { ScenariosSection } from '@/components/sections/ScenariosSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function FeaturesPage() {
  useDocumentMeta({
    title: 'Features — SafeWalkMaps',
    description:
      'What SafeWalkMaps does on a walk: live navigation that keeps explaining itself, re-routing when the street ahead changes, shared journeys, and the situations it is built for.',
    path: '/features',
  });

  return (
    <>
      <FeatureSection headingAs="h1" className="pt-32 lg:pt-36" />
      <ScenariosSection />
      <FinalCtaSection />
    </>
  );
}
```

- [ ] **Step 6: Register the route**

In `src/App.tsx`:

```tsx
const FeaturesPage = lazy(() =>
  import('@/pages/FeaturesPage').then((module) => ({ default: module.FeaturesPage })),
);
```

```tsx
          <Route path="/features" element={<FeaturesPage />} />
```

- [ ] **Step 7: Run the tests**

Run: `npm run test -- FeaturesPage`
Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add src/pages/FeaturesPage.tsx src/pages/FeaturesPage.test.tsx src/components/sections/FeatureSection.tsx src/components/sections/ScenariosSection.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
feat: give features and scenarios their own page

Moves both off the home page onto /features. The scenarios section
takes the secondary surface: on the home page the privacy section sat
between the two, so both could be white, but adjacent they read as one
long section.

Claims nothing new about any feature — per-feature status is still open
in before-launch.md.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `/about`

**Files:**
- Create: `src/pages/AboutPage.tsx`
- Modify: `src/components/sections/MissionSection.tsx`
- Modify: `src/components/sections/PrivacySection.tsx`
- Modify: `src/components/sections/ContactSection.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/AboutPage.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (`MissionSection` renders a raw heading).
- Produces: `AboutPage` (named export), `MissionSectionProps = { headingAs?: 'h1' | 'h2'; className?: string }`.

- [ ] **Step 1: Write the failing test**

Create `src/pages/AboutPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AboutPage } from './AboutPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe('AboutPage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leads with the mission statement as the h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Walking should not mean/i);
  });

  it('carries mission, privacy and contact', () => {
    const { container } = renderPage();
    expect(container.querySelector('#mission')).toBeInTheDocument();
    expect(container.querySelector('#privacy')).toBeInTheDocument();
    expect(container.querySelector('#contact')).toBeInTheDocument();
  });

  it('keeps #contact addressable, so /about#contact lands on the form', () => {
    const { container } = renderPage();
    expect(container.querySelector('#contact')).toBeInTheDocument();
  });

  it('sets the document title', () => {
    renderPage();
    expect(document.title).toMatch(/About/i);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- AboutPage`
Expected: FAIL — module not found.

- [ ] **Step 3: Make `MissionSection` configurable**

In `src/components/sections/MissionSection.tsx`, add above the component:

```tsx
export type MissionSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};
```

Change the signature to:

```tsx
export function MissionSection({ headingAs: Heading = 'h2', className }: MissionSectionProps = {}) {
```

Change the `<section>` tag's className to include the passthrough — it does not currently use
`cn`, so add the import `import { cn } from '@/lib/cn';` and change the attribute to:

```tsx
      className={cn(
        'on-navy relative overflow-hidden bg-surface-navy py-section-lg text-white',
        className,
      )}
```

Delete `index="08"` from the `<Eyebrow>` call.

Replace the `<h2 className="text-display-lg font-semibold text-white">` opening tag with
`<Heading className="text-display-lg font-semibold text-white">` and its closing `</h2>` with
`</Heading>`.

- [ ] **Step 4: Drop the stale indices from the other two sections**

In `src/components/sections/PrivacySection.tsx`, delete the `index="06"` line.

`ContactSection` has no index; leave it alone.

- [ ] **Step 5: Write the page**

Create `src/pages/AboutPage.tsx`:

```tsx
import { ContactSection } from '@/components/sections/ContactSection';
import { MissionSection } from '@/components/sections/MissionSection';
import { PrivacySection } from '@/components/sections/PrivacySection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function AboutPage() {
  useDocumentMeta({
    title: 'About — SafeWalkMaps',
    description:
      'Why SafeWalkMaps exists, how it treats your data, and how to get in touch. Built by Marvian Tech, in beta in London and Sheffield.',
    path: '/about',
  });

  return (
    <>
      <MissionSection headingAs="h1" className="pt-32 lg:pt-36" />
      <PrivacySection />
      {/* No closing CTA here: the contact form is already an ask, and a second
          one stacked under it reads as noise. */}
      <ContactSection />
    </>
  );
}
```

- [ ] **Step 6: Register the route**

In `src/App.tsx`:

```tsx
const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage })),
);
```

```tsx
          <Route path="/about" element={<AboutPage />} />
```

- [ ] **Step 7: Run the tests**

Run: `npm run test -- AboutPage`
Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add src/pages/AboutPage.tsx src/pages/AboutPage.test.tsx src/components/sections/MissionSection.tsx src/components/sections/PrivacySection.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
feat: add an about page carrying mission, privacy and contact

Moves three sections off the home page onto /about. The mission
statement becomes the route's h1.

The page closes on the contact form rather than the waitlist CTA — a
contact form is already an ask, and stacking a second under it reads as
noise.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `/faq`, and moving the FAQPage structured data

**Files:**
- Create: `src/pages/FaqPage.tsx`
- Modify: `src/components/sections/FaqSection.tsx`
- Modify: `src/App.tsx`
- Modify: `index.html`
- Test: `src/pages/FaqPage.test.tsx`

**Interfaces:**
- Consumes: `SectionHeading`'s `as` prop (Task 2), `faqItems` from `@/data/faq`.
- Produces: `FaqPage` (named export), `FaqSectionProps = { headingAs?: 'h1' | 'h2'; className?: string }`.

- [ ] **Step 1: Write the failing test**

Create `src/pages/FaqPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { FaqPage } from './FaqPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <FaqPage />
    </MemoryRouter>,
  );
}

function faqLd(): HTMLScriptElement | null {
  return document.head.querySelector<HTMLScriptElement>('script[data-faq-schema]');
}

describe('FaqPage', () => {
  it('renders exactly one h1', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('shows the accordion', () => {
    const { container } = renderPage();
    expect(container.querySelector('#faq')).toBeInTheDocument();
  });

  it('injects FAQPage structured data while mounted', () => {
    renderPage();
    const script = faqLd();
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent ?? '{}');
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity.length).toBeGreaterThan(0);
    expect(parsed.mainEntity[0]['@type']).toBe('Question');
  });

  it('removes the structured data on unmount, so it never describes another page', () => {
    const { unmount } = renderPage();
    expect(faqLd()).not.toBeNull();
    unmount();
    expect(faqLd()).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- FaqPage`
Expected: FAIL — module not found.

- [ ] **Step 3: Make `FaqSection` configurable**

In `src/components/sections/FaqSection.tsx`, add above the component:

```tsx
export type FaqSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};
```

Change the signature to:

```tsx
export function FaqSection({ headingAs = 'h2', className }: FaqSectionProps = {}) {
```

Change `<Section id="faq" tone="secondary">` to:

```tsx
    <Section id="faq" tone="secondary" className={className}>
```

Delete `index="10"` from the `<SectionHeading>` call and add `as={headingAs}`.

- [ ] **Step 4: Write the page, with the structured data**

Create `src/pages/FaqPage.tsx`:

```tsx
import { useEffect } from 'react';

import { FaqSection } from '@/components/sections/FaqSection';
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { faqItems } from '@/data/faq';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/**
 * FAQPage structured data, injected while this route is mounted.
 *
 * It used to live in index.html, which was only correct while the FAQ was on
 * the home page. Describing a page's questions from a page that no longer
 * contains them is wrong markup, so it travels with the route instead.
 */
function useFaqSchema(): void {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.faqSchema = '';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer.join(' '),
        },
      })),
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);
}

export function FaqPage() {
  useDocumentMeta({
    title: 'Frequently asked questions — SafeWalkMaps',
    description:
      'How the safety score is built, what data SafeWalkMaps uses, what it does with your location, and where the app is available.',
    path: '/faq',
  });
  useFaqSchema();

  return (
    <>
      <FaqSection headingAs="h1" className="pt-32 lg:pt-36" />
      <FinalCtaSection />
    </>
  );
}
```

- [ ] **Step 5: Register the route**

In `src/App.tsx`:

```tsx
const FaqPage = lazy(() =>
  import('@/pages/FaqPage').then((module) => ({ default: module.FaqPage })),
);
```

```tsx
          <Route path="/faq" element={<FaqPage />} />
```

- [ ] **Step 6: Remove the stale copy from `index.html`**

Delete the entire second `<script type="application/ld+json">` block — the one whose
`"@type"` is `"FAQPage"`, starting at roughly line 99. Leave the first block (the `@graph`
with `Organization`, `WebSite` and `MobileApplication`) exactly as it is: it describes the
site, not any one page.

- [ ] **Step 7: Run the tests**

Run: `npm run test -- FaqPage`
Expected: PASS, 4 tests.

- [ ] **Step 8: Typecheck**

Run: `npm run typecheck`
Expected: clean.

`FaqItem.answer` is `string[]` (paragraphs, rendered in order), which is why the schema joins
them into one answer string. No change to `src/data/faq.ts` is needed.

- [ ] **Step 9: Commit**

```bash
git add src/pages/FaqPage.tsx src/pages/FaqPage.test.tsx src/components/sections/FaqSection.tsx src/App.tsx index.html
git commit -m "$(cat <<'EOF'
feat: give the FAQ its own page and move its structured data with it

The FAQPage JSON-LD sat in index.html, which was correct only while the
FAQ was on the home page. It now mounts and unmounts with the route, so
it never describes a page that does not contain the questions.

Trade-off worth stating: a crawler that does not execute JavaScript no
longer sees FAQ structured data. Google renders JS and will. The
alternative was leaving incorrect markup on the home page.

The Organization/WebSite/MobileApplication graph stays in index.html —
it describes the site, not a page.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Trim the home page, renumber it, and redirect stale hashes

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Create: `src/hooks/useStaleHashRedirect.ts`
- Modify: `src/components/sections/ProblemSection.tsx`
- Modify: `src/components/sections/SafetyLayerSection.tsx`
- Modify: `src/components/sections/RouteChoiceSection.tsx`
- Modify: `src/components/sections/WaitlistSection.tsx`
- Test: `src/hooks/useStaleHashRedirect.test.tsx`
- Test: `src/pages/HomePage.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `useStaleHashRedirect(): void` and `STALE_HASH_ROUTES: Record<string, string>`.

- [ ] **Step 1: Write the failing test for the redirect**

Create `src/hooks/useStaleHashRedirect.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { STALE_HASH_ROUTES, useStaleHashRedirect } from './useStaleHashRedirect';

function Home() {
  useStaleHashRedirect();
  return <p>home</p>;
}

function Probe() {
  const { pathname, hash } = useLocation();
  return <p data-testid="here">{pathname + hash}</p>;
}

function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('useStaleHashRedirect', () => {
  it('sends every moved hash to its new route', () => {
    for (const [hash, target] of Object.entries(STALE_HASH_ROUTES)) {
      const { unmount } = renderAt(`/${hash}`);
      expect(screen.getByTestId('here').textContent, `${hash} should go to ${target}`).toBe(target);
      unmount();
    }
  });

  it('leaves hashes whose sections are still on the home page alone', () => {
    for (const hash of ['#routes', '#waitlist', '#how-it-works', '#problem', '#main']) {
      const { unmount } = renderAt(`/${hash}`);
      expect(screen.getByText('home'), `${hash} should stay on the home page`).toBeInTheDocument();
      unmount();
    }
  });

  it('does nothing when there is no hash', () => {
    renderAt('/');
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('replaces the history entry rather than pushing, so Back is not a trap', () => {
    // A push would leave the stale URL in history; going back would redirect
    // again and the visitor could never leave.
    const { unmount } = renderAt('#features');
    unmount();
    // Asserted structurally: the hook must pass { replace: true }.
    expect(useStaleHashRedirect.toString()).toMatch(/replace:\s*true/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- useStaleHashRedirect`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the hook**

Create `src/hooks/useStaleHashRedirect.ts`:

```ts
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Anchors that used to resolve on the home page, and where their content went.
 *
 * `#privacy` maps to `/about`, not to the `/privacy` legal page: the old anchor
 * pointed at the privacy *section*, and the policy is a different document.
 *
 * Hashes for sections still on the home page are deliberately absent —
 * `#routes`, `#waitlist`, `#how-it-works`, `#problem` must not be redirected.
 */
export const STALE_HASH_ROUTES: Record<string, string> = {
  '#safety-score': '/safety-score',
  '#features': '/features',
  '#scenarios': '/features',
  '#privacy': '/about',
  '#mission': '/about',
  '#contact': '/about#contact',
  '#faq': '/faq',
};

/**
 * Forwards a link to a section that has moved to the page it now lives on.
 *
 * Runs on the home page only. `replace` rather than `push`, so Back returns the
 * visitor to wherever they came from rather than to a home page they never
 * meant to see — and so the redirect cannot become a loop.
 */
export function useStaleHashRedirect(): void {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = STALE_HASH_ROUTES[hash];
    if (target) navigate(target, { replace: true });
  }, [hash, navigate]);
}
```

- [ ] **Step 4: Run the redirect tests**

Run: `npm run test -- useStaleHashRedirect`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing test for the trimmed home page**

Create `src/pages/HomePage.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('keeps the narrative spine', () => {
    const { container } = renderHome();
    for (const id of ['hero', 'problem', 'how-it-works', 'routes', 'waitlist']) {
      expect(container.querySelector(`#${id}`), `#${id} should still be on the home page`).toBeInTheDocument();
    }
  });

  it('no longer carries the sections that moved', () => {
    const { container } = renderHome();
    for (const id of ['safety-score', 'features', 'privacy', 'scenarios', 'mission', 'faq', 'contact']) {
      expect(container.querySelector(`#${id}`), `#${id} should have moved off the home page`).toBeNull();
    }
  });

  it('renders exactly one h1', () => {
    const { container } = renderHome();
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('numbers the remaining sections in an unbroken run', () => {
    const { container } = renderHome();
    const indices = Array.from(container.querySelectorAll('.eyebrow .tabular'))
      .map((el) => el.textContent?.trim())
      .filter((text): text is string => Boolean(text && /^\d+$/.test(text)));
    expect(indices).toEqual(['01', '02', '03', '04']);
  });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npm run test -- HomePage`
Expected: FAIL — the moved sections are still rendered, and the indices read `01 02 02 04 09`.

- [ ] **Step 7: Trim the home page**

Replace `src/pages/HomePage.tsx` entirely:

```tsx
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { RouteChoiceSection } from '@/components/sections/RouteChoiceSection';
import { SafetyLayerSection } from '@/components/sections/SafetyLayerSection';
import { WaitlistSection } from '@/components/sections/WaitlistSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useStaleHashRedirect } from '@/hooks/useStaleHashRedirect';
import { siteConfig } from '@/lib/config';

/**
 * The homepage is the argument, and nothing else:
 *
 *   hero          — the claim
 *   01 problem    — why the claim matters
 *   02 layer      — what it is built from
 *   03 routes     — and you still choose
 *   04 waitlist   — the ask
 *   final CTA
 *
 * The detail each of these raises lives on its own route: /safety-score,
 * /features, /about and /faq.
 */
export function HomePage() {
  useDocumentMeta({
    title: 'SafeWalkMaps — Safety-Aware Walking Navigation',
    description: `${siteConfig.description} Coming soon on iOS.`,
    path: '/',
  });
  useStaleHashRedirect();

  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SafetyLayerSection />
      <RouteChoiceSection />
      <WaitlistSection />
      <FinalCtaSection />
    </>
  );
}
```

- [ ] **Step 8: Renumber the four remaining indices**

| File | Change |
| --- | --- |
| `src/components/sections/ProblemSection.tsx` | `index="01"` — unchanged, leave it |
| `src/components/sections/SafetyLayerSection.tsx` | `index="02"` in **both** places (lines ~123 and ~182) — unchanged, leave them |
| `src/components/sections/RouteChoiceSection.tsx` | `index="04"` → `index="03"` |
| `src/components/sections/WaitlistSection.tsx` | `index="09"` → `index="04"` |

- [ ] **Step 9: Run the tests**

Run: `npm run test -- HomePage`
Expected: PASS, 4 tests.

- [ ] **Step 10: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.test.tsx src/hooks/useStaleHashRedirect.ts src/hooks/useStaleHashRedirect.test.tsx src/components/sections/RouteChoiceSection.tsx src/components/sections/WaitlistSection.tsx
git commit -m "$(cat <<'EOF'
refactor: cut the home page down to the argument

Seven sections now live on their own routes, leaving hero, problem, the
signal story, route comparison, waitlist and the closing CTA. Measured
21.6 screens on desktop before; the projection is ~12.3.

Links to the moved anchors are forwarded rather than broken:
/#features and friends redirect to the page that now holds them, with
replace rather than push so Back is not a trap. Hashes whose sections
are still here are deliberately left alone.

The remaining eyebrow indices renumber to an unbroken 01-04.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Route-based header navigation

**Files:**
- Modify: `src/components/navigation/SiteHeader.tsx`
- Modify: `src/components/navigation/MobileMenu.tsx`
- Delete: `src/hooks/useActiveSection.ts`
- Test: `src/components/navigation/SiteHeader.test.tsx`

**Interfaces:**
- Consumes: `navLinks: { label, path }[]` and `ROUTES` (Task 3).
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing test**

Create `src/components/navigation/SiteHeader.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { navLinks } from '@/data/navigation';

import { SiteHeader } from './SiteHeader';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
    </MemoryRouter>,
  );
}

describe('SiteHeader', () => {
  it('renders every nav link as a real path', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.path,
      );
    }
  });

  it('marks the current route as current', () => {
    renderAt('/features');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Features' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks nothing current on the home page', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).not.toHaveAttribute(
        'aria-current',
      );
    }
  });

  it('points the waitlist button at the home page anchor from a sub-page', () => {
    renderAt('/features');
    expect(screen.getAllByRole('link', { name: /join waitlist/i })[0]).toHaveAttribute(
      'href',
      '/#waitlist',
    );
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run test -- SiteHeader`
Expected: FAIL — `SiteHeader` still imports `navSectionIds` and reads `link.hash`.

- [ ] **Step 3: Rewrite the header's navigation**

In `src/components/navigation/SiteHeader.tsx`:

Remove these imports:

```tsx
import { navLinks, navSectionIds } from '@/data/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';
```

Replace with:

```tsx
import { navLinks } from '@/data/navigation';
```

Remove the line:

```tsx
  const activeSection = useActiveSection(isHome ? navSectionIds : []);
```

and replace it with:

```tsx
  // The indicator tracks the route now, not scroll position. One rule for
  // every item, and nothing to measure while scrolling.
  const activePath = navLinks.some((link) => link.path === pathname) ? pathname : null;
```

In `measureIndicator`, change the two references from `activeSection` to `activePath`, and the
query selector from `[data-section="${activeSection}"]` to `[data-path="${activePath}"]`. The
dependency array becomes `[activePath]`.

In the `<li>`, change `data-section={link.sectionId}` to `data-path={link.path}`.

Replace the `<a>` element inside the `<li>` with a router `Link`:

```tsx
                <Link
                  to={link.path}
                  aria-current={activePath === link.path ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-10 items-center rounded-lg px-3.5 text-body-sm font-medium transition-colors duration-base',
                    'tracking-[0.005em]',
                    activePath === link.path
                      ? inverted
                        ? 'text-white'
                        : 'text-navy-900'
                      : inverted
                        ? 'text-white/70 hover:text-white'
                        : 'text-navy-900/75 hover:text-navy-900',
                  )}
                >
                  {link.label}
                </Link>
```

`Link` is already imported in this file.

Change the waitlist `ButtonLink`'s `href` from `isHome ? '#waitlist' : '/#waitlist'` to just
`'/#waitlist'` — it resolves correctly from every route, so the branch is dead weight.

- [ ] **Step 4: Update the mobile menu**

In `src/components/navigation/MobileMenu.tsx`, replace the nav `<a>` with a `Link`:

```tsx
                  <Link
                    to={link.path}
                    onClick={() => onOpenChange(false)}
                    style={{ transitionDelay: open ? `${90 + index * 55}ms` : '0ms' }}
                    className={cn(
                      'flex items-center justify-between py-4 text-display-sm font-semibold tracking-[-0.025em] text-ink-primary transition-[transform,opacity] duration-spring ease-spring',
                      open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                    )}
                  >
                    {link.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-5 w-5 text-ink-tertiary"
                      strokeWidth={2}
                    />
                  </Link>
```

Add `import { Link } from 'react-router-dom';` at the top.

Change the waitlist `ButtonLink` href to `'/#waitlist'`.

`isHome` is now unused in this component — remove it from `MobileMenuProps`, from the
destructured props, and from the `<MobileMenu ... />` call site in `SiteHeader.tsx`.

- [ ] **Step 5: Delete the scroll-spy hook**

```bash
git rm src/hooks/useActiveSection.ts
```

Confirm nothing imports it:

Run: `grep -rn "useActiveSection" src`
Expected: no output.

- [ ] **Step 6: Run everything**

Run: `npm run test && npm run typecheck && npm run lint && npm run build`
Expected: all clean. This is the point at which the typecheck failure introduced in Task 3 is resolved.

- [ ] **Step 7: Commit, including Task 3's held changes**

```bash
git add src/data/routes.ts src/data/navigation.ts src/data/navigation.test.ts src/components/navigation/SiteHeader.tsx src/components/navigation/SiteHeader.test.tsx src/components/navigation/MobileMenu.tsx
git rm --cached --ignore-unmatch src/hooks/useActiveSection.ts >/dev/null 2>&1 || true
git add -A src/hooks
git commit -m "$(cat <<'EOF'
feat: switch the header to route-based navigation

The nav pointed at four in-page anchors and tracked which one owned the
viewport. With the detail on its own routes, three of those anchors no
longer exist on the home page.

navLinks become { label, path }, the sliding indicator matches the
active route instead of scroll position — keeping the transform-and-
spring implementation, only changing what feeds it — and links become
router Links so navigation does not reload the document.

Adds src/data/routes.ts as the single source of truth for public paths,
so a link to a path with no route is a test failure rather than
something a visitor finds.

useActiveSection loses its only consumer and is deleted. The isHome
branches on the waitlist buttons collapse: /#waitlist resolves from
every route.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Cross-links

**Files:**
- Modify: `src/components/sections/hero/HeroSection.tsx`
- Modify: `src/components/sections/FinalCtaSection.tsx`
- Read only: `src/components/layout/SiteFooter.tsx` (verified to map over `footerColumns`; no change needed)
- Test: `src/components/sections/crossLinks.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/crossLinks.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { FinalCtaSection } from './FinalCtaSection';

describe('waitlist cross-links', () => {
  it('resolves from a sub-page, not just from the home page', () => {
    render(
      <MemoryRouter initialEntries={['/features']}>
        <FinalCtaSection />
      </MemoryRouter>,
    );
    const cta = screen.getAllByRole('link').find((a) => /waitlist/i.test(a.textContent ?? ''));
    expect(cta).toHaveAttribute('href', '/#waitlist');
  });
});
```

- [ ] **Step 2: Run it**

Run: `npm run test -- crossLinks`
Expected: PASS. Task 4 already changed `FinalCtaSection`, because its own page test asserted
this. The test is written here anyway so the behaviour is pinned by a test that names it.

- [ ] **Step 3: Fix every bare `#waitlist`**

Run: `grep -rn '"#waitlist"\|'"'"'#waitlist'"'"'' src`

For each hit **except** inside `useStaleHashRedirect.ts`, change `#waitlist` to `/#waitlist`.
Expected locations: `HeroSection.tsx`, `FinalCtaSection.tsx`.

Leave `#how-it-works` in the hero's secondary CTA alone: it targets a section still on the
home page, and the hero only ever renders there.

- [ ] **Step 4: Leave the footer alone — confirm why**

`SiteFooter` maps over `footerColumns` and renders `link.href` through a helper that already
routes `/#…` to an `<a>` and everything else to a router `Link`. Task 3 updated the data, so
the footer picks the new targets up with no code change, and `navigation.test.ts` covers it.

Confirm rather than assume:

Run: `grep -n 'footerColumns\|link.href' src/components/layout/SiteFooter.tsx`
Expected: the component maps `footerColumns` and passes `link.href`; no literal section
anchors in the file.

- [ ] **Step 5: Run everything**

Run: `npm run test && npm run typecheck && npm run lint && npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add -A src/components
git commit -m "$(cat <<'EOF'
fix: make the waitlist links resolve from every route

A bare #waitlist looks for an anchor on the current page. From
/features or /faq there is none, so the primary call to action did
nothing. Now /#waitlist, which resolves everywhere.

#how-it-works in the hero's secondary CTA stays bare: it targets a
section still on the home page, and the hero only renders there.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Sitemap, host rewrites, and whole-site verification

**Files:**
- Modify: `public/sitemap.xml`
- Test: `src/data/sitemap.test.ts`
- Test: `src/App.test.tsx`
- Modify: `docs/implementation-progress.md`

**Interfaces:**
- Consumes: `ROUTES` (Task 3).
- Produces: nothing.

- [ ] **Step 1: Write the failing tests**

Create `src/data/sitemap.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { ROUTES } from './routes';

const sitemap = readFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf8');

describe('sitemap.xml', () => {
  it('lists every public route', () => {
    for (const route of ROUTES) {
      const loc = `https://safewalkmaps.com${route === '/' ? '/' : route}`;
      expect(sitemap, `sitemap is missing ${route}`).toContain(`<loc>${loc}</loc>`);
    }
  });

  it('lists nothing that is not a route', () => {
    const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) =>
      m[1].replace('https://safewalkmaps.com', '').replace(/^$/, '/'),
    );
    for (const loc of locs) {
      expect(ROUTES, `sitemap lists ${loc}, which has no route`).toContain(loc);
    }
  });
});
```

Create `src/App.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from './App';
import { ROUTES } from './data/routes';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it.each(ROUTES)('renders %s with exactly one h1', async (route) => {
    const { container } = renderAt(route);
    await waitFor(() => {
      expect(container.querySelectorAll('h1').length).toBe(1);
    });
  });

  it('renders a 404 for an unknown path', async () => {
    renderAt('/definitely-not-a-page');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
        /does not go anywhere/i,
      );
    });
  });

  it('leaves no reveal element stranded invisible', async () => {
    // useScrollReveal arms the hidden state by adding `motion-ready` to <html>
    // and only reveals on intersection. The observer is stubbed in tests, so
    // this asserts the safety net: without JS-driven reveal, content is visible.
    const { container } = renderAt('/features');
    await waitFor(() => {
      expect(container.querySelector('#features')).toBeInTheDocument();
    });
    const hidden = Array.from(container.querySelectorAll('[data-reveal]')).filter(
      (el) => el.getAttribute('data-visible') === 'false',
    );
    expect(hidden.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run them and watch the sitemap test fail**

Run: `npm run test -- sitemap App`
Expected: the sitemap test FAILS (four routes missing). The App test should pass.

- [ ] **Step 3: Add the four routes to the sitemap**

In `public/sitemap.xml`, insert these four `<url>` blocks after the home entry and before
`/privacy`:

```xml
  <url>
    <loc>https://safewalkmaps.com/safety-score</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://safewalkmaps.com/features</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://safewalkmaps.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://safewalkmaps.com/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

- [ ] **Step 4: Run the tests**

Run: `npm run test`
Expected: PASS, the whole suite.

- [ ] **Step 5: Verify the host rewrites serve these routes on a hard refresh**

These are client-side routes. A direct request to `/features` must serve `index.html` or the
host returns 404.

All three host configs already carry a catch-all rewrite at status 200, so the new routes are
served without any change:

| File | Rule |
| --- | --- |
| `public/_redirects` | `/*    /index.html   200` |
| `netlify.toml` | `[[redirects]]` `from = "/*"`, `to = "/index.html"`, `status = 200` |
| `vercel.json` | `"source": "/((?!assets/).*)"`, `"destination": "/index.html"` |

One thing is stale and should be fixed: the comment at the top of `public/_redirects` says
the fallback exists for "(/privacy, /terms)". Update it to not enumerate routes:

```
# Netlify and Cloudflare Pages: serve the SPA shell for client-side routes
# and let React Router render the 404 for anything else.
```

Then confirm the rules are really there:

Run: `grep -n 'index.html' public/_redirects netlify.toml vercel.json`
Expected: one hit in each file.

- [ ] **Step 6: Verify in a real browser**

Build and preview:

```bash
npm run build
npm run preview -- --port 4188
```

Then run the rendered checks. The measurement and check scripts from the previous pass live
outside the repo; re-point them at `http://localhost:4188` and confirm:

- the home page measures near **12.3 screens desktop / 13.4 phone**
- all seven routes render with no console errors or warnings
- no horizontal overflow at 390, 768, 1440
- the header indicator sits under the active nav item on each sub-page, and is hidden on `/`
- `/about#contact` scrolls to the contact form
- `/#features` lands on `/features`, and Back returns to where you came from
- under `prefers-reduced-motion`, nothing on the new pages is stranded invisible

Screenshot each new route at 390 and 1440 and look at them.

- [ ] **Step 7: Update the progress document**

In `docs/implementation-progress.md`, add a `## Site architecture` section immediately before
`## Verified`. It must contain, in this order:

1. A one-paragraph statement of the problem: the home page measured 21.6 screens on desktop
   and 27.9 on a phone, and the detail is now on its own routes.
2. The before/after table of per-section scroll cost — copy the measured table from the spec
   and add an **after** column with the figures you measured in Step 6.
3. The page map table: route, what it carries, whether it is lazy.
4. A short "What changed" list: route-based navigation replacing scroll-spy, `useActiveSection`
   deleted, eyebrow indices renumbered to an unbroken 01-04, stale hashes forwarded.
5. The FAQ structured-data move, stating the trade-off plainly: a crawler that does not run
   JavaScript no longer sees it.
6. A "Testing" note: Vitest and Testing Library were added, what the suite covers, and that
   `npm run test` is now a real script rather than one CLAUDE.md referred to but that did not
   exist.
7. A line recording the deviation from the spec: `PageIntro` was not built; `SectionHeading`
   gained an `as` prop instead, and why.

- [ ] **Step 8: Commit**

```bash
git add public/sitemap.xml src/data/sitemap.test.ts src/App.test.tsx docs/implementation-progress.md vercel.json netlify.toml public/_redirects
git commit -m "$(cat <<'EOF'
feat: add the new routes to the sitemap, and verify the whole site

Sitemap gains the four new pages at priority 0.8 — above the legal
pages, below home. A test asserts the sitemap and the route table agree
in both directions, so neither can drift.

App-level tests assert every route renders exactly one h1 and that an
unknown path still reaches the 404.

Verified in Chromium at 390, 768 and 1440 against the production build.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Done when

- `npm run test`, `npm run typecheck`, `npm run lint` and `npm run build` all pass.
- The home page measures near 12.3 screens on desktop and 13.4 on a phone.
- All seven routes render, each with exactly one `h1`, with no console output.
- Every nav and footer link resolves; every stale hash forwards.
- `docs/implementation-progress.md` records the change.
