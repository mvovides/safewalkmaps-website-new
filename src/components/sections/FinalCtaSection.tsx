import { useRef } from 'react';

import { SHIELD_VIEWBOX, ShieldMarkPaths } from '@/components/brand/ShieldMark';
import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap } from '@/lib/motion';

/** The route arrives from the bottom of the page and completes in the shield. */
const ARRIVAL_PATH = 'M 600 640 V 560 H 494 V 480 H 600 V 404';

export function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    sectionRef,
    (scope) => {
      if (reduced) return;

      gsap.set('[data-cta="route"], [data-cta="route-casing"]', {
        strokeDasharray: 1,
        strokeDashoffset: 1,
      });
      gsap.set('[data-cta="shield"]', { opacity: 0, scale: 0.86, transformOrigin: '50% 70%' });

      gsap
        .timeline({
          scrollTrigger: { trigger: scope, start: 'top 82%', end: 'center 58%', scrub: 0.6 },
          defaults: { ease: 'none' },
        })
        .to('[data-cta="route"], [data-cta="route-casing"]', { strokeDashoffset: 0, duration: 0.6 }, 0)
        .to('[data-cta="shield"]', { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 0.45);
    },
    [reduced],
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-surface pb-section-lg pt-section-lg"
    >
      {/* Route and shield */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-0">
        <svg
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          <g fill="none" stroke="rgb(6 42 94 / 0.05)" strokeWidth="2">
            <path d="M 0 480 H 1200" />
            <path d="M 0 560 H 1200" />
            <path d="M 0 640 H 1200" />
            <path d="M 300 380 V 700" />
            <path d="M 900 380 V 700" />
          </g>

          <path
            d={ARRIVAL_PATH}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            data-cta="route-casing"
          />
          <path
            d={ARRIVAL_PATH}
            fill="none"
            stroke="var(--brand-green)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            data-cta="route"
          />

          <svg
            x={548}
            y={252}
            width={104}
            height={145}
            viewBox={SHIELD_VIEWBOX}
            data-cta="shield"
            overflow="visible"
          >
            <ShieldMarkPaths />
          </svg>
        </svg>
      </div>

      <div className="shell relative flex flex-col items-center text-center">
        {/* Leaves room for the shield above the headline. */}
        <div aria-hidden="true" className="h-[clamp(7rem,16vh,11rem)]" />

        <h2
          className="max-w-[18ch] text-display-xl font-semibold text-ink-primary"
          data-reveal="mask"
        >
          Take the route that considers more.
        </h2>

        <p className="mt-7 max-w-prose text-body-xl text-ink-secondary" data-reveal>
          Three minutes is usually the whole difference. SafeWalkMaps just makes sure you know
          what those three minutes buy.
        </p>

        <div className="mt-10 flex flex-col items-center gap-5" data-reveal>
          <ButtonLink href="#waitlist" size="lg" routeHover>
            Join the iOS waitlist
          </ButtonLink>
          <StatusPill>Coming soon on iOS</StatusPill>
        </div>
      </div>
    </section>
  );
}
