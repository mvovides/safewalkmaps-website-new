import { ArrowRight } from 'lucide-react';

import { Section, SectionHeading } from '@/components/layout/Section';
import { cardSurface } from '@/components/ui/cardSurface';
import { privacyPoints } from '@/data/features';
import { cn } from '@/lib/cn';

/**
 * A route that is drawn, walked, and then gone — the privacy model as a
 * picture rather than a paragraph.
 */
function VanishingRoute() {
  return (
    <svg viewBox="0 0 420 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="privacy-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--brand-green)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--brand-green)" stopOpacity="0.25" />
          <stop offset="0.72" stopColor="var(--brand-green)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--brand-green)" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Street context */}
      <g stroke="rgb(6 42 94 / 0.08)" strokeWidth="2" fill="none">
        <path d="M 40 60 H 390" />
        <path d="M 40 110 H 390" />
        <path d="M 40 160 H 390" />
        <path d="M 110 20 V 200" />
        <path d="M 210 20 V 200" />
        <path d="M 310 20 V 200" />
      </g>

      {/* The walk so far: faded at the start, solid where you are now. */}
      <path
        d="M 50 160 H 110 V 110 H 210 V 60 H 330"
        fill="none"
        stroke="url(#privacy-fade)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Where the trail has already gone. */}
      <g stroke="rgb(6 42 94 / 0.14)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round">
        <path d="M 50 160 H 110 V 110 H 180" fill="none" />
      </g>

      <circle cx="330" cy="60" r="12" fill="var(--brand-green)" opacity="0.16" />
      <circle cx="330" cy="60" r="6" fill="var(--brand-green)" />

      <text x="50" y="196" className="fill-ink-tertiary text-[12px]">
        nothing kept
      </text>
      <text x="330" y="38" textAnchor="middle" className="fill-ink-secondary text-[12px] font-medium">
        you, now
      </text>
    </svg>
  );
}

export function PrivacySection() {
  return (
    <Section id="privacy" tone="secondary">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Privacy"
            title={
              <>
                Your route is personal.
                <span className="block text-ink-tertiary">Your privacy should be too.</span>
              </>
            }
            lede="A safety app that quietly built a record of everywhere you walk would be a strange kind of safety app. So SafeWalkMaps is built to hold as little as it can get away with."
          />

          <div
            className={cn(cardSurface, 'mt-10 hidden aspect-[420/220] w-full p-4 lg:block')}
            data-reveal="scale"
          >
            <VanishingRoute />
          </div>
        </div>

        <div>
          <ul className="divide-y divide-line border-y border-line" data-reveal-stagger>
            {privacyPoints.map((point) => (
              <li key={point.title} className="py-7">
                <h3 className="flex items-start gap-3 text-body-lg text-ink-primary">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"
                  />
                  {point.title}
                </h3>
                <p className="ml-[1.125rem] mt-2.5 max-w-prose text-ink-secondary">{point.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-prose text-caption leading-relaxed text-ink-tertiary">
              We do not claim a security certification we do not hold, and no service can promise
              absolute security. What we can do is collect less.
            </p>
            <a
              href="/privacy"
              className="group -my-2 inline-flex shrink-0 items-center gap-1.5 rounded-md py-2 text-body-sm font-semibold text-navy-800 transition-colors duration-base hover:text-navy-600"
            >
              Read the full policy
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
