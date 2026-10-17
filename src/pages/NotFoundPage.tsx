import { ShieldMark } from '@/components/brand/ShieldMark';
import { ButtonLink } from '@/components/ui/Button';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function NotFoundPage() {
  useDocumentMeta({
    title: 'Page not found — SafeWalkMaps',
    description: 'That page does not exist. Head back to SafeWalkMaps.',
    path: '/404',
    noindex: true,
  });

  return (
    <section className="relative overflow-hidden bg-surface">
      {/* A route that stops short of the shield. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 900 520"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 120 520 V 400 H 300 V 300" stroke="rgb(6 42 94 / 0.08)" strokeWidth="2" />
          <path d="M 780 520 V 420 H 620 V 320" stroke="rgb(6 42 94 / 0.08)" strokeWidth="2" />
          <path
            d="M 450 520 V 440 H 370 V 372"
            stroke="var(--brand-green)"
            strokeWidth="6"
            opacity="0.75"
          />
          <path
            d="M 370 372 H 450"
            stroke="var(--brand-green)"
            strokeWidth="6"
            strokeDasharray="4 12"
            opacity="0.4"
          />
        </g>
        <circle cx="370" cy="372" r="7" fill="var(--brand-green)" />
      </svg>

      <div className="shell relative flex min-h-[78svh] flex-col items-center justify-center py-section text-center">
        <ShieldMark className="h-14" />
        <p className="eyebrow mt-8 justify-center">
          <span className="tabular text-green-800">404</span>
          <span aria-hidden="true" className="eyebrow-rule" />
          <span>Route not found</span>
        </p>
        <h1 className="mt-5 max-w-[22ch] text-display-lg text-ink-primary">
          This path does not go anywhere.
        </h1>
        <p className="mt-6 max-w-prose text-body-lg text-ink-secondary">
          The page you were looking for has moved or never existed. Nothing lost — the way back is
          well lit.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg" routeHover>
            Back to SafeWalkMaps
          </ButtonLink>
          <ButtonLink href="/#waitlist" variant="secondary" size="lg">
            Join the iOS waitlist
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
