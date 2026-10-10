import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Anchors that used to resolve on the home page, and where their content went.
 *
 * `#privacy` maps to `/about`, not to the `/privacy` legal page: the old anchor
 * pointed at the privacy *section*, and the policy is a different document.
 *
 * Hashes for sections still on the home page are deliberately absent —
 * `#routes`, `#waitlist`, `#how-it-works`, `#problem` must not be redirected.
 */
export const STALE_HASH_ROUTES: Record<string, string> = {
  '#safety-score': '/safety-score',
  '#features': '/features',
  '#scenarios': '/features',
  '#privacy': '/about',
  '#mission': '/about',
  '#contact': '/about#contact',
  '#faq': '/faq',
};

/**
 * Forwards a link to a section that has moved to the page it now lives on.
 *
 * Runs on the home page only. `replace` rather than `push`, so Back returns the
 * visitor to wherever they came from rather than to a home page they never
 * meant to see — and so the redirect cannot become a loop.
 */
export function useStaleHashRedirect(): void {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = STALE_HASH_ROUTES[hash];
    if (target) navigate(target, { replace: true });
  }, [hash, navigate]);
}
