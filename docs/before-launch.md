# Before launch — open items

Four things need a decision from you before this site replaces safewalkmaps.com. None of them
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

**Where:** `src/data/features.ts` and `src/components/sections/FeatureSection.tsx`.

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
3. Confirm `/privacy` and `/terms` resolve on a hard refresh (SPA rewrites are configured for
   Vercel, Netlify and Cloudflare Pages — whichever you use is already covered).
4. Check the social preview renders: paste the URL into a Slack or iMessage thread.

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
