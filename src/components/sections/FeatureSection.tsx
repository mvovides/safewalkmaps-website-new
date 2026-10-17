import {
  CloudOff,
  MapPinned,
  MessageSquareWarning,
  Share2,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Section, SectionHeading } from '@/components/layout/Section';
import { NavigationScreen } from '@/components/product/NavigationScreen';
import { PhoneFrame } from '@/components/product/PhoneFrame';
import { cardSurface } from '@/components/ui/cardSurface';
import { cn } from '@/lib/cn';

/** A share link that visibly expires — drawn, not described. */
function ShareIllustration() {
  return (
    <svg viewBox="0 0 260 90" className="h-auto w-full" aria-hidden="true">
      <rect
        x="1"
        y="18"
        width="258"
        height="34"
        rx="17"
        className="fill-navy-800/[0.04] stroke-navy-800/10"
      />
      <circle cx="26" cy="35" r="6" fill="var(--brand-green)" />
      <rect x="42" y="30" width="112" height="5" rx="2.5" className="fill-navy-800/20" />
      <rect x="42" y="39" width="64" height="4" rx="2" className="fill-navy-800/10" />
      <text x="236" y="39" textAnchor="end" className="fill-ink-tertiary text-[11px] font-medium">
        expires
      </text>
      <line
        x1="1"
        y1="68"
        x2="259"
        y2="68"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        className="stroke-navy-800/15"
      />
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
    <ul className="w-full space-y-2">
      {items.map((item) => (
        <li
          key={item.label}
          style={{ opacity: item.opacity }}
          className="flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-2.5"
        >
          <span className="flex items-center gap-2.5 text-body-sm text-ink-secondary">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {item.label}
          </span>
          <span className="text-caption text-ink-tertiary">{item.age}</span>
        </li>
      ))}
    </ul>
  );
}

/** A downloaded area that keeps routing with the signal gone. */
function OfflineIllustration() {
  return (
    <svg viewBox="0 0 260 160" className="h-auto w-full" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="258"
        height="128"
        rx="14"
        className="fill-navy-800/[0.03] stroke-navy-800/10"
      />
      <g strokeWidth="2" strokeLinecap="round" className="stroke-navy-800/10">
        <line x1="12" y1="34" x2="248" y2="34" />
        <line x1="12" y1="62" x2="248" y2="62" />
        <line x1="12" y1="98" x2="248" y2="98" />
        <line x1="46" y1="12" x2="46" y2="118" />
        <line x1="112" y1="12" x2="112" y2="118" />
        <line x1="156" y1="12" x2="156" y2="118" />
        <line x1="214" y1="12" x2="214" y2="118" />
      </g>
      {/* The saved area. */}
      <rect
        x="26"
        y="18"
        width="150"
        height="96"
        rx="10"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        className="fill-green-500/[0.07] stroke-green-600"
      />
      <path
        d="M 46 98 V 62 H 112 V 34 H 156"
        fill="none"
        stroke="var(--brand-green)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="98" r="4.5" strokeWidth="2" className="fill-surface stroke-navy-800" />
      <circle cx="156" cy="34" r="5" fill="var(--brand-green)" />
      {/* No signal: empty bars, struck through, on a chip above the map. */}
      <rect
        x="188"
        y="16"
        width="60"
        height="58"
        rx="10"
        className="fill-surface stroke-navy-800/10"
      />
      <g className="fill-navy-800/15">
        <rect x="204" y="38" width="5" height="6" rx="1" />
        <rect x="212" y="34" width="5" height="10" rx="1" />
        <rect x="220" y="30" width="5" height="14" rx="1" />
        <rect x="228" y="26" width="5" height="18" rx="1" />
      </g>
      <line
        x1="201"
        y1="47"
        x2="236"
        y2="23"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-ink-tertiary"
      />
      <text x="218" y="64" textAnchor="middle" className="fill-ink-tertiary text-[10px]">
        no signal
      </text>
      <text x="0" y="152" className="fill-ink-tertiary text-[11px]">
        navigation and saved scores keep working
      </text>
    </svg>
  );
}

/** One press, and the three things it sets off. */
function SosIllustration() {
  const actions = [
    { label: 'Emergency services', status: 'location sent' },
    { label: 'Emergency contacts', status: 'link to follow' },
    { label: 'Alarm', status: 'sounding' },
  ];
  return (
    <div className="w-full">
      {/* The dot carries the red: danger text on its soft tint is 4.4:1, short of AA. */}
      <span className="inline-flex items-center gap-2 rounded-pill bg-danger-soft px-3 py-1 text-caption font-semibold text-ink-primary">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-danger" />
        SOS
      </span>
      <ul className="mt-4 space-y-2">
        {actions.map((action) => (
          <li
            key={action.label}
            className="flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-2.5"
          >
            <span className="text-body-sm text-ink-secondary">{action.label}</span>
            <span className="text-caption text-ink-tertiary">{action.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Feature = {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  visual: ReactNode;
  /** The phone is a device in the panel, cropped by its lower edge; the rest sit centred. */
  device?: boolean;
  note?: string;
};

const FEATURES: Feature[] = [
  {
    id: 'navigation',
    icon: MapPinned,
    title: 'Turn-by-turn, with the score in view',
    body: 'Walking directions that keep the route’s score and the reason behind it on screen. If a new report lands on the street ahead, SafeWalkMaps offers you a re-route rather than quietly changing its mind.',
    visual: (
      <PhoneFrame
        elevation="soft"
        time="23:41"
        label="SafeWalkMaps navigating at night, showing the next turn and the route's safety score."
      >
        <NavigationScreen />
      </PhoneFrame>
    ),
    device: true,
  },
  {
    id: 'reports',
    icon: MessageSquareWarning,
    title: 'Report what the data misses',
    body: "A light that is out, a pavement that is closed, an underpass that feels wrong. Two taps, anonymous, and it feeds into everyone's routing.",
    visual: <ReportsIllustration />,
  },
  {
    id: 'sharing',
    icon: Share2,
    title: 'Share the walk, not your history',
    body: 'Send someone a temporary link that follows you until you arrive, then expires. No permanent trail, and no account needed to use it.',
    visual: <ShareIllustration />,
  },
  {
    id: 'offline',
    icon: CloudOff,
    title: 'Works without a signal',
    body: 'Download an area before you leave and keep navigation and saved scores. Live reports sync back up when you reconnect.',
    visual: <OfflineIllustration />,
  },
  {
    id: 'sos',
    icon: ShieldAlert,
    title: 'SOS when you need it',
    body: 'Alerts emergency services with your location, notifies your emergency contacts with a link to follow, and sounds an alarm from your phone.',
    visual: <SosIllustration />,
    note: 'SafeWalkMaps is not an emergency service. In an emergency, contact your local emergency number.',
  },
];

export type FeatureSectionProps = {
  /** `h1` when this section leads its own route. */
  headingAs?: 'h1' | 'h2';
  className?: string;
};

/**
 * The features, one at a time: each row pairs a glass card carrying the claim
 * with a panel that shows it, and the two swap sides on every row so the eye
 * zig-zags down the page. On a phone they stack, card first.
 */
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

      <div className="mt-14 grid gap-14 lg:mt-20 lg:gap-24">
        {FEATURES.map(({ id, icon: Icon, title, body, visual, device, note }, index) => (
          <div
            key={id}
            className={cn(
              'grid items-center gap-6 lg:grid-cols-2 lg:gap-14',
              index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
            )}
          >
            <article className={cn(cardSurface, 'p-7 sm:p-9')} data-reveal>
              <Icon aria-hidden="true" className="h-6 w-6 text-navy-700" strokeWidth={2} />
              <CardHeading className="mt-6 text-display-sm text-ink-primary">{title}</CardHeading>
              <p className="mt-3.5 max-w-prose text-ink-secondary">{body}</p>
              {note && (
                <p className="mt-6 rounded-lg bg-surface-secondary px-3.5 py-2.5 text-caption leading-relaxed text-ink-secondary">
                  {note}
                </p>
              )}
            </article>

            <div
              className={cn(
                'relative flex justify-center overflow-hidden rounded-card border border-line bg-surface-secondary',
                device
                  ? 'items-start px-8 pt-10'
                  : 'min-h-[16rem] items-center p-8 sm:min-h-[20rem] sm:p-12',
              )}
              data-reveal="scale"
            >
              {device ? (
                // Run the phone off the panel's lower edge rather than shrink it to fit.
                <div className="-mb-16 w-full max-w-[13.5rem] sm:-mb-20">{visual}</div>
              ) : (
                <div className="w-full max-w-sm">{visual}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
