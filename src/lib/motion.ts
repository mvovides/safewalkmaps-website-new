import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Register GSAP plugins exactly once.
 *
 * `ignoreMobileResize` stops ScrollTrigger from recalculating every trigger
 * when mobile Safari's toolbar collapses, which is the single biggest source
 * of scroll jank on iOS.
 */
export function registerMotionPlugins(): void {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });
  registered = true;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Read the breakpoint synchronously, for use inside a timeline builder.
 *
 * Deliberately not a hook: reading it here means the timeline is built once
 * with the right values, instead of being torn down and rebuilt when a
 * reactive breakpoint hook settles.
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(min-width: 1024px)').matches;
}

/**
 * How far a scrubbed timeline lags behind the scroll position.
 *
 * Touch scrolling arrives in fast flicks with momentum, so a long scrub reads
 * as the animation being detached from your thumb. Pointer scrolling is
 * steadier and benefits from the extra smoothing.
 */
export function scrubFor(desktop: number, mobile = 0.35): number {
  return isDesktopViewport() ? desktop : mobile;
}

/** Shared easing names so timelines stay consistent with the CSS tokens. */
export const ease = {
  out: 'power3.out',
  outExpo: 'expo.out',
  inOut: 'power2.inOut',
  linear: 'none',
} as const;

export { gsap, ScrollTrigger };
