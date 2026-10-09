import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';

import { PhoneFrame } from '@/components/product/PhoneFrame';
import { RoutePickerScreen } from '@/components/product/RoutePickerScreen';
import { ButtonLink } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Chip';
import { ILLUSTRATIVE_NOTE, saferRouteDelta } from '@/data/city';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap } from '@/lib/motion';

import { HeroIntroCanvas } from './HeroIntroCanvas';

const CAPTION_ONE = 'Navigation knows the fastest way.';
const CAPTION_TWO = 'It does not always know how the walk feels.';

/**
 * The scroll-driven opening.
 *
 * The first beat plays on load, not on scroll, so the page never opens on an
 * empty white screen: the route climbs out of the fold and the shield lights up
 * by itself. Scrolling then drives the remaining two beats — a second route
 * peeling away from the same fork, and the whole composition receding to hand
 * over to the hero proper.
 *
 * Every tween targets a transform, an opacity or a dash offset, and GSAP writes
 * to the DOM nodes directly, so scrubbing the intro never re-renders React.
 */
function HeroIntro() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGsapContext(wrapRef, (scope) => {
    const dash = (selector: string, value: number) =>
      gsap.set(selector, { strokeDasharray: 1, strokeDashoffset: value });

    // ---- Starting state: nothing drawn.
    dash('[data-hero="trunk"], [data-hero="trunk-casing"]', 1);
    dash('[data-hero="green"], [data-hero="green-casing"]', 1);
    dash('[data-hero="navy"], [data-hero="navy-casing"]', 1);
    gsap.set('[data-hero="shield"]', { opacity: 0, scale: 0.8, transformOrigin: '50% 72%' });
    gsap.set('[data-hero="caption-1"]', { opacity: 0, y: 14 });
    gsap.set('[data-hero="caption-2"]', { opacity: 0, y: 18 });

    // ---- Beat 1, on load: one route climbs up into the shield.
    gsap
      .timeline({ delay: 0.15 })
      .to('[data-hero="ambient"]', { opacity: 1, duration: 0.9, ease: 'power1.out' }, 0)
      .to(
        '[data-hero="trunk"], [data-hero="trunk-casing"]',
        { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut' },
        0,
      )
      .to(
        '[data-hero="green"], [data-hero="green-casing"]',
        { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' },
        0.7,
      )
      .to('[data-hero="caption-1"]', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.25)
      .to(
        '[data-hero="shield"]',
        { opacity: 1, scale: 1, duration: 0.75, ease: 'back.out(1.5)' },
        1.15,
      );

    // ---- Beats 2 and 3, on scroll.
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      defaults: { ease: 'none' },
    });

    timeline
      .fromTo('[data-hero="scroll-hint"]', { opacity: 1 }, { opacity: 0, duration: 0.1 }, 0)
      // The fork, and the route that goes another way.
      .to('[data-hero="fork"]', { opacity: 1, duration: 0.07 }, 0.16)
      .fromTo(
        '[data-hero="caption-1"]',
        { opacity: 1, y: 0 },
        { opacity: 0, y: -18, duration: 0.11 },
        0.22,
      )
      .to('[data-hero="navy-group"]', { opacity: 1, duration: 0.06 }, 0.3)
      .to(
        '[data-hero="navy"], [data-hero="navy-casing"]',
        { strokeDashoffset: 0, duration: 0.26 },
        0.3,
      )
      .to('[data-hero="caption-2"]', { opacity: 1, y: 0, duration: 0.12 }, 0.42)
      // Recede, and hand over.
      .to('[data-hero="caption-2"]', { opacity: 0, y: -18, duration: 0.1 }, 0.8)
      .to(
        '[data-hero="canvas"]',
        { opacity: 0, scale: 1.07, y: -36, duration: 0.2, ease: 'power1.in' },
        0.8,
      );
    // No manual teardown: `gsap.context` reverts these timelines and disposes
    // the ScrollTrigger it created when the hook unmounts.
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[185svh] lg:h-[205svh]">
      <div
        data-hero="stage"
        className="sticky top-0 h-[100svh] overflow-hidden"
      >
        <div data-hero="canvas" className="absolute inset-0">
          <HeroIntroCanvas />
        </div>

        {/* Beat captions, sitting above the composition. Both are real text in
            the DOM from the first paint. */}
        <div className="shell absolute inset-x-0 top-[19svh] z-10 flex justify-center lg:top-[21svh]">
          <p
            data-hero="caption-1"
            className="max-w-[15ch] text-balance text-center text-display-md font-semibold tracking-[-0.03em] text-ink-primary sm:max-w-[20ch]"
          >
            {CAPTION_ONE}
          </p>
          <p
            data-hero="caption-2"
            className="absolute left-1/2 top-0 w-full max-w-[17ch] -translate-x-1/2 text-balance text-center text-display-md font-semibold tracking-[-0.03em] text-ink-primary sm:max-w-[23ch]"
          >
            {CAPTION_TWO}
          </p>
        </div>

        <div
          data-hero="scroll-hint"
          className="absolute bottom-9 right-gutter z-10 flex flex-col items-center gap-2.5"
        >
          <span className="text-label font-semibold uppercase text-ink-tertiary">Scroll</span>
          <ArrowDown
            aria-hidden="true"
            className="h-4 w-4 animate-scroll-hint text-green-800"
            strokeWidth={2.25}
          />
        </div>
      </div>
    </div>
  );
}

/** The hero proper — the state the opening resolves into. */
function HeroMain() {
  const magnetic = useMagnetic<HTMLAnchorElement>();

  return (
    <div className="shell relative grid items-center gap-14 pb-section pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-16 lg:pb-section-lg lg:pt-20">
      {/* A route line arriving from the intro, tying the two together. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 600 420"
        preserveAspectRatio="xMinYMin meet"
        className="pointer-events-none absolute -left-24 -top-16 hidden h-[420px] w-[600px] opacity-[0.38] lg:block"
      >
        <path
          d="M 120 -40 V 96 H 232 V 206"
          fill="none"
          stroke="var(--brand-green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 8"
          opacity="0.5"
        />
        <circle cx="232" cy="206" r="4" fill="var(--brand-green)" />
      </svg>

      <div className="relative" data-reveal-stagger>
        <StatusPill className="mb-7">Coming soon on iOS</StatusPill>

        <h1 className="text-display-xl font-semibold text-ink-primary">
          The safer route.
          <span className="block text-ink-tertiary">Not just the fastest one.</span>
        </h1>

        <p className="mt-7 max-w-prose text-body-xl text-ink-secondary">
          SafeWalkMaps reads street lighting, recent incident data, foot traffic and community
          reports, then shows you how the routes you could take actually compare — and why.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink
            href="#waitlist"
            size="lg"
            routeHover
            className="sm:w-auto"
            {...magnetic}
          >
            Join the iOS waitlist
          </ButtonLink>
          <ButtonLink href="#how-it-works" variant="secondary" size="lg">
            See how it works
          </ButtonLink>
        </div>

        <p className="mt-6 text-caption text-ink-tertiary">
          In beta in London and Sheffield. No spam — one email when it launches.
        </p>
      </div>

      {/* Product visual */}
      <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[21.5rem]" data-reveal="scale">
        <div
          aria-hidden="true"
          className="absolute -inset-10 -z-10 rounded-[50%] bg-green-500/10 blur-3xl"
        />
        <PhoneFrame label="The SafeWalkMaps route picker, comparing three walking routes.">
          <RoutePickerScreen activeRoute="safer" />
        </PhoneFrame>

        {/* Floating comparison callout */}
        <div className="absolute -left-6 bottom-[26%] z-20 hidden rounded-xl border border-line bg-white/94 px-4 py-3 shadow-lg backdrop-blur-md sm:block lg:-left-14">
          <p className="tabular text-body-sm font-semibold text-ink-primary">
            +{saferRouteDelta} min
          </p>
          <p className="text-caption text-ink-tertiary">for a safer route</p>
        </div>

        <p className="demo-note mt-5 text-center">{ILLUSTRATIVE_NOTE}</p>
      </div>
    </div>
  );
}

/**
 * Reduced-motion opening: the same composition, fully drawn, with both beats of
 * copy present as ordinary text. Nothing is lost by turning animation off.
 */
function HeroIntroStatic() {
  return (
    <div className="relative overflow-hidden">
      <div className="shell flex min-h-[58svh] flex-col items-center justify-center gap-8 py-20 text-center">
        <div className="relative h-[280px] w-full max-w-[620px]">
          <HeroIntroCanvas revealed />
        </div>
        <div className="space-y-2">
          <p className="text-display-sm font-semibold tracking-[-0.025em] text-ink-tertiary">
            {CAPTION_ONE}
          </p>
          <p className="text-display-sm font-semibold tracking-[-0.025em] text-ink-primary">
            {CAPTION_TWO}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section id="hero" className="relative bg-surface">
      {reduced ? <HeroIntroStatic /> : <HeroIntro />}
      <HeroMain />
    </section>
  );
}
