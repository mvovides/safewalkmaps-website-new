import { useRef } from 'react';

import { SHIELD_VIEWBOX, ShieldMarkPaths } from '@/components/brand/ShieldMark';
import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap } from '@/lib/motion';

/**
 * The closing beat: one last route climbing into the shield, echoing the
 * gesture the page opened with.
 *
 * The composition is an inline block of fixed proportions rather than a
 * section-sized background, so the shield always lands directly above the
 * headline instead of drifting with the section's height.
 */
const ARRIVAL_PATH = 'M 20 300 H 110 V 236 H 200 V 126';

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
      gsap.set('[data-cta="shield"]', { opacity: 0, scale: 0.84, transformOrigin: '50% 80%' });

      gsap
        .timeline({
          scrollTrigger: { trigger: scope, start: 'top 85%', end: 'center 62%', scrub: 0.6 },
          defaults: { ease: 'none' },
        })
        .to(
          '[data-cta="route"], [data-cta="route-casing"]',
          { strokeDashoffset: 0, duration: 0.62 },
          0,
        )
        .to(
          '[data-cta="shield"]',
          { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
          0.46,
        );
    },
    [reduced],
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-surface pb-section-lg pt-24">
      <div className="shell flex flex-col items-center text-center">
        {/* Route into the shield */}
        <div className="relative w-full max-w-[26rem]" data-reveal="fade">
          <svg viewBox="0 0 400 320" className="h-auto w-full" aria-hidden="true">
            <g stroke="rgb(6 42 94 / 0.07)" strokeWidth="2" fill="none">
              <path d="M 110 320 V 120" />
              <path d="M 200 320 V 120" />
              <path d="M 290 320 V 120" />
              <path d="M 0 236 H 400" />
              <path d="M 0 300 H 400" />
            </g>

            <path
              d={ARRIVAL_PATH}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="14"
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
              x={160}
              y={20}
              width={80}
              height={111}
              viewBox={SHIELD_VIEWBOX}
              data-cta="shield"
              overflow="visible"
            >
              <ShieldMarkPaths />
            </svg>
          </svg>
        </div>

        <h2
          className="mt-4 max-w-[17ch] text-display-xl font-semibold text-ink-primary"
          data-reveal
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
