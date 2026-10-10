# Before launch — open items

Five things need a decision from you before this site replaces safewalkmaps.com. None of them
block deploying to a staging URL; all of them block going live.

Each one exists because the rebuild refused to invent an answer. Where a fact was not
established, the site says so visibly rather than guessing.

---

## 1. Legal details — the only hard blocker

**Status:** placeholder warnings are rendered on the live pages.

`src/data/legal.ts` contains `needs-confirmation` blocks that render as amber warning panels
on `/privacy` and `/terms`. They are deliberately impossible to miss, so the site cannot
quietly ship with invented legal text.

What has to be supplied:

| Item | Where it appears |
| --- | --- |
| Registered operating entity and address | Privacy §4 "Legal basis and your rights", Terms §1 "About these terms" |
| Whether a Data Protection Officer is formally appointed | Privacy §4 |
| Final sub-processor list, and whether any process data outside the UK/EEA | Privacy §5 "Who else sees it" |
| Retention periods for diagnostic and crash data | Privacy §6 "How long we keep it" |
| Liability cap, governing law and jurisdiction | Terms §7 "Liability" |

The previous site's terms carried literal `[Your Jurisdiction]` placeholders, which is what
prompted handling this explicitly.

**Recommendation:** get the liability and jurisdiction clauses drafted by a qualified adviser
rather than adapted from a template. Everything else on that list is a fact you already know;
it just has to be written down.

**To close it:** replace each `{ type: 'needs-confirmation', text: ... }` entry in
`src/data/legal.ts` with the real text. When the last one is gone, the amber panels disappear
on their own.

---

## 2. Per-feature status — shipped, or planned?

**Status:** the site presents these the way your current product pages do.

Live navigation, mid-walk re-routing, location sharing, community reports, offline areas and
SOS are all described as things the app does — matching the existing safewalkmaps.com copy.

The app is in beta in London and Sheffield, so some of these may be planned rather than
shipped. The brief was explicit about distinguishing the two, and I could not verify which is
which from outside.

**What to do:** tell me which of the six are not yet in the build, and I will mark them. The
honest options are a "Planned" chip on the card or a short qualifier in the body copy —
either is better than a visitor downloading the app and finding a feature missing.

**Where:** `src/data/features.ts` and `src/components/sections/FeatureSection.tsx`. The meta
descriptions of the pages that moved off the home page repeat the same claims, so they need
the same pass: the `description` passed to `useDocumentMeta` in `src/pages/SafetyScorePage.tsx`,
`src/pages/FeaturesPage.tsx`, `src/pages/AboutPage.tsx` and `src/pages/FaqPage.tsx`. The
features page names live navigation, re-routing and shared journeys; the FAQ page says where the
app is available.

---

## 3. The encryption claim — deliberately dropped

**Status:** removed from this rebuild. This is a change from your current site.

safewalkmaps.com currently states **"End-to-end encryption for sensitive data"** and
**"Encrypted data storage"**. This rebuild does not repeat either, because I could not verify
them and the brief said not to claim encryption standards that have not been implemented.

What the privacy page says instead is narrower and defensible: traffic is sent over HTTPS,
production access is restricted, and — stated plainly — no security certification is held.

**If the end-to-end encryption claim is accurate**, say so and I will restore it; it is a
genuinely strong trust signal and it is a shame to lose it. **If it is aspirational**, it
should stay off the site. For a personal-safety product, an unverifiable security claim is the
single most damaging thing to be caught on.

**Where:** `src/data/legal.ts` (Privacy §7 "Security") and
`src/components/sections/PrivacySection.tsx`.

---

## 4. Deployment and environment variables

**Status:** ready to deploy; needs configuration.

The site builds and runs with no environment variables at all, but the forms will simulate
submissions and say so on screen until a key is set.

```bash
VITE_WEB3FORMS_ACCESS_KEY=   # waitlist + contact delivery
VITE_SITE_URL=https://safewalkmaps.com
VITE_CONTACT_EMAIL=safewalkmaps@gmail.com
```

Your existing deployment already uses `VITE_WEB3FORMS_ACCESS_KEY`, so the same key carries
over — no new account needed.

**Checklist for go-live:**

1. Set the three variables in the host's project settings.
2. Deploy and confirm a real waitlist submission lands in the inbox.
3. Confirm all seven routes resolve on a hard refresh: `/`, `/safety-score`, `/features`,
   `/about`, `/faq`, `/privacy` and `/terms` (SPA rewrites are configured for Vercel, Netlify
   and Cloudflare Pages — whichever you use is already covered).
4. Check the social preview: paste the home page URL into a Slack or iMessage thread, and it
   should show the right title, description and image. **Expect the same check to fail on
   every other page.** Pasting `/features` (or `/safety-score`, `/about`, `/faq`, `/privacy`,
   `/terms`) will preview the home page's title and description, because link unfurlers do not
   run the JavaScript that rewrites them. That is the open question in item 5, not a
   misconfigured host.

---

## 5. Social previews — what a pasted link to the new pages shows

**Status:** the pages are correct for anyone who opens them, and wrong for anything that only
reads the HTML. Not built, and not decided.

The site is client-rendered, so every URL is served the same `index.html`, which carries the
home page's title, description, canonical link and `og:url`. `src/hooks/useDocumentMeta.ts`
rewrites those once JavaScript runs. A browser sees the right values for `/features`, and so
does Google, which renders JavaScript.

Slack, iMessage and most other link unfurlers do not run JavaScript. Pasting
`safewalkmaps.com/features` into one previews the home page's title and description. Both
`og:url` and the canonical link still say `/`, which invites a platform to treat the share as a
share of the home page. Meanwhile `public/sitemap.xml` advertises `/safety-score`, `/features`,
`/about` and `/faq` at priority 0.8, so crawlers are told these are pages in their own right.
The `FAQPage` structured data that moved to `/faq` has the same limit: it is injected by
JavaScript, so a consumer that does not run it will not see it.

This was harmless while the only sub-pages were `/privacy` and `/terms`. It is not harmless now
that the safety score, the features, the mission and the FAQ each have an address of their own
and the sitemap points search engines at them.

**The options**, none of them chosen:

- **Prerender the routes at build time.** A build step renders each of the seven routes to its
  own HTML file with its own head, and the site still behaves as a single-page app after load.
  It keeps the current stack, and adds a build step that has to keep working.
- **Static generation.** Move the site onto a framework that renders every page ahead of time.
  It solves this at the root, at the price of changing the stack, which is not a decision to
  make quietly.
- **A prerendering service in front of the host.** It serves rendered HTML to crawlers and
  unfurlers and leaves the code alone. It is usually a paid service, and puts a third party in
  the request path.
- **Leave it.** Ship knowing that links to the new pages preview as the home page. That is a
  legitimate choice; it just needs to be a choice.

**What I need from you:** which of these to pursue, or confirmation that you accept the current
behaviour for launch. Until then step 4 of the go-live checklist in item 4 will fail on every
page but the home page.

**Where:** `index.html`, `src/hooks/useDocumentMeta.ts` and `public/sitemap.xml`.

---

## Not blocking, but worth knowing

- **Illustrative data is labelled.** The three demo routes carry a visible disclaimer wherever
  their figures appear. Their times and distances are internally consistent — derived from the
  measured path geometry at a constant pace — so the numbers hold up if anyone checks them.
- **No invented social proof.** The current site's testimonials ("Aisha", "Priya") and the
  "Be one of the first 500" counter were left out deliberately. If you have real testimonials
  with permission to use them, they would strengthen the page and I can add a section.
- **Beta cities are hardcoded** in `src/lib/config.ts` as London and Sheffield. Update that one
  constant when you expand and it propagates everywhere.
