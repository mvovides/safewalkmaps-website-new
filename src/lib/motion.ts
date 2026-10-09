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

/** Shared easing names so timelines stay consistent with the CSS tokens. */
export const ease = {
  out: 'power3.out',
  outExpo: 'expo.out',
  inOut: 'power2.inOut',
  linear: 'none',
} as const;

export { gsap, ScrollTrigger };
