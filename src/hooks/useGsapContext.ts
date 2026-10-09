import { useLayoutEffect, type DependencyList, type RefObject } from 'react';

import { gsap, registerMotionPlugins } from '@/lib/motion';

/**
 * Build a GSAP timeline scoped to a DOM subtree.
 *
 * `gsap.context` scopes every selector string inside `build` to the element,
 * and `ctx.revert()` on cleanup kills the tweens, removes inline styles and
 * disposes any ScrollTriggers created inside — which is what keeps repeated
 * mounts and route changes from leaking scroll listeners.
 */
export function useGsapContext<T extends HTMLElement>(
  scopeRef: RefObject<T>,
  build: (scope: T) => void,
  deps: DependencyList = [],
): void {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    registerMotionPlugins();
    const context = gsap.context(() => build(scope), scope);
    return () => context.revert();
    // `build` is intentionally excluded: callers pass an inline closure, and the
    // explicit `deps` list is the contract for when the timeline should rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
