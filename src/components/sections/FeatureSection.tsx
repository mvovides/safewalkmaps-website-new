import { CloudOff, MapPinned, MessageSquareWarning, Share2, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Section, SectionHeading } from '@/components/layout/Section';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { NavigationScreen } from '@/components/product/NavigationScreen';
import { cn } from '@/lib/cn';

type CardProps = {
  title: string;
  /** The tag for the card's title: one level below the section heading. */
  headingTag: 'h2' | 'h3';
  body: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

function FeatureCard({ title, headingTag: Heading, body, icon, className, children }: CardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-xs transition-shadow duration-slow ease-out-expo hover:shadow-md sm:p-7',
        className,
      )}
    >
      {icon && (
        <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-700">
          {icon}
        </span>
      )}
      <Heading className="text-body-lg font-semibold text-ink-primary">{title}</Heading>
      <p className="mt-2.5 text-ink-secondary">{body}</p>
      {children}
    </article>
  );
}

/** A share link that visibly expires — drawn, not described. */
function ShareIllustration() {
  return (
    <svg viewBox="0 0 260 90" className="mt-auto h-[90px] w-full pt-6" aria-hidden="true">
      <rect
        x="1"
        y="18"
        width="258"
        height="34"
        rx="17"
        fill="rgb(6 42 94 / 0.04)"
        stroke="rgb(6 42 94 / 0.1)"
      />
      <circle cx="26" cy="35" r="6" fill="var(--brand-green)" />
      <rect x="42" y="30" width="112" height="5" rx="2.5" fill="rgb(6 42 94 / 0.22)" />
      <rect x="42" y="39" width="64" height="4" rx="2" fill="rgb(6 42 94 / 0.12)" />
      <text
        x="236"
        y="39"
        textAnchor="end"
        className="fill-ink-tertiary text-[11px] font-medium"
      >
        expires
      </text>
      <g stroke="rgb(6 42 94 / 0.16)" strokeWidth="1.5" strokeDasharray="3 5">
        <line x1="1" y1="68" x2="259" y2="68" />
      </g>
      <text x="0" y="86" className="fill-ink-tertiary text-[11px]">
        link stops working when you arrive
      </text>
    </svg>
  );
}

/** Three anonymous reports fading as they age. */
function ReportsIllustration() {
  const items = [
    { label: 'Street light out', age: '2 days', opacity: 1 },
    { label: 'Pavement closed', age: '9 days', opacity: 0.6 },
    { label: 'Underpass dark', age: '24 days', opacity: 0.3 },
  ];
  return (
    <ul className="mt-auto space-y-2 pt-6">
      {items.map((item) => (
        <li
          key={item.label}
          style={{ opacity: item.opacity }}
          className="flex items-center justify-between rounded-lg border border-line bg-surface-secondary px-3.5 py-2.5"
        >
          <span className="flex items-center gap-2.5 text-body-sm text-ink-secondary">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-green-500"
            />
            {item.label}
          </span>
          <span className="text-caption text-ink-tertiary">{item.age}</span>
        </li>
      ))}
    </ul>
  );
}

export type FeatureSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};

export function FeatureSection({ headingAs = 'h2', className }: FeatureSectionProps = {}) {
  // Derived, not a fixed `h3`: the feature titles must sit exactly one level
  // below this section's own heading. Leading a page as an `h1` makes them
  // `h2`s; hard-coding `h3` would skip a level there and break the site's
  // contiguous heading order.
  const CardHeading = headingAs === 'h1' ? 'h2' : 'h3';

  return (
    <Section id="features" spacing="large" className={className}>
      <SectionHeading
        as={headingAs}
        eyebrow="Walk with context"
        title={
          <>
            It keeps telling you why,
            <span className="block text-ink-tertiary">the whole way home.</span>
          </>
        }
        lede="The score is not a screen you pass through on the way to directions. It stays with you, and it updates if the street ahead changes."
        className="max-w-4xl"
      />

      <div className="mt-14 grid gap-5 lg:mt-16 lg:grid-cols-12">
        {/* Hero feature — live navigation */}
        <article
          className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-navy p-7 text-white sm:p-9 lg:col-span-7 lg:flex-row lg:items-center lg:gap-8"
          data-reveal="scale"
        >
          <div className="relative z-10 lg:flex-1">
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-green-500">
              <MapPinned aria-hidden="true" className="h-5 w-5" />
            </span>
            <CardHeading className="text-display-sm font-semibold text-white">
              Turn-by-turn, with the score in view
            </CardHeading>
            <p className="mt-3.5 max-w-prose text-white/60">
              Walking directions that keep the route&rsquo;s score and the reason behind it on
              screen. If a new report lands on the street ahead, SafeWalkMaps offers you a
              re-route rather than quietly changing its mind.
            </p>
          </div>

          <div className="relative z-10 mx-auto mt-8 w-full max-w-[13.5rem] lg:mt-0 lg:w-[13.5rem] lg:shrink-0">
            <div className="translate-y-6 lg:translate-y-10">
              <PhoneFrame
                elevation="soft"
                time="23:41"
                label="SafeWalkMaps navigating at night, showing the next turn and the route's safety score."
              >
                <NavigationScreen />
              </PhoneFrame>
            </div>
          </div>
        </article>

        {/* Two stacked */}
        <div className="grid gap-5 lg:col-span-5" data-reveal>
          <FeatureCard
            headingTag={CardHeading}
            title="Report what the data misses"
            body="A light that is out, a pavement that is closed, an underpass that feels wrong. Two taps, anonymous, and it feeds into everyone's routing."
            icon={<MessageSquareWarning aria-hidden="true" className="h-5 w-5" />}
          >
            <ReportsIllustration />
          </FeatureCard>
        </div>

        {/* Wide share panel */}
        <FeatureCard
          className="lg:col-span-5"
          headingTag={CardHeading}
          title="Share the walk, not your history"
          body="Send someone a temporary link that follows you until you arrive, then expires. No permanent trail, and no account needed to use it."
          icon={<Share2 aria-hidden="true" className="h-5 w-5" />}
        >
          <ShareIllustration />
        </FeatureCard>

        <FeatureCard
          className="lg:col-span-3"
          headingTag={CardHeading}
          title="Works without a signal"
          body="Download an area before you leave and keep navigation and saved scores. Live reports sync back up when you reconnect."
          icon={<CloudOff aria-hidden="true" className="h-5 w-5" />}
        />

        <FeatureCard
          className="lg:col-span-4"
          headingTag={CardHeading}
          title="SOS when you need it"
          body="Alerts emergency services with your location, notifies your emergency contacts with a link to follow, and sounds an alarm from your phone."
          icon={<ShieldAlert aria-hidden="true" className="h-5 w-5" />}
        >
          <p className="mt-auto rounded-lg bg-surface-secondary px-3.5 py-2.5 text-caption leading-relaxed text-ink-tertiary">
            SafeWalkMaps is not an emergency service. In an emergency, contact your local
            emergency number.
          </p>
        </FeatureCard>
      </div>
    </Section>
  );
}
