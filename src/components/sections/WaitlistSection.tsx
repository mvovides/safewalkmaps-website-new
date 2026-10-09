import { Check } from 'lucide-react';
import { useId, useRef, useState } from 'react';

import { ShieldMark } from '@/components/brand/ShieldMark';
import { Eyebrow } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/config';
import { joinWaitlist, validateEmail } from '@/services/waitlist';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** A route that completes into a tick once you are on the list. */
function SuccessMark({ animate }: { animate: boolean }) {
  return (
    <span className="relative grid h-14 w-14 place-items-center rounded-full bg-green-500/14">
      <span
        className={cn(
          'grid h-10 w-10 place-items-center rounded-full bg-green-500 text-navy-900',
          animate && 'animate-fade-rise',
        )}
      >
        <Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />
      </span>
    </span>
  );
}

export function WaitlistSection() {
  const [status, setStatus] = useState<Status>('idle');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [simulated, setSimulated] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const liveRegionId = useId();
  const reduced = useReducedMotion();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '');
    const name = String(data.get('name') ?? '');
    const city = String(data.get('city') ?? '');

    const invalid = validateEmail(email);
    setEmailError(invalid);
    setFormError(undefined);
    if (invalid) return;

    setStatus('submitting');
    const result = await joinWaitlist({ email, name, city });

    if (result.status === 'ok') {
      setSimulated(result.simulated);
      setStatus('success');
      formRef.current?.reset();
      return;
    }

    setFormError(result.message);
    setStatus('error');
  }

  return (
    <section id="waitlist" className="relative overflow-hidden bg-surface py-section-lg">
      <div className="shell">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-secondary px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          {/* A route arriving at the shield, behind the panel. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 460"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.6]"
          >
            <g fill="none" stroke="rgb(6 42 94 / 0.06)" strokeWidth="2">
              <path d="M 0 120 H 1200" />
              <path d="M 0 240 H 1200" />
              <path d="M 0 360 H 1200" />
              <path d="M 220 0 V 460" />
              <path d="M 980 0 V 460" />
            </g>
            <path
              d="M -20 420 H 160 V 300 H 340 V 180"
              fill="none"
              stroke="var(--brand-green)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.3"
              strokeDasharray="6 10"
            />
            <path
              d="M 1220 420 H 1040 V 300 H 860 V 180"
              fill="none"
              stroke="var(--brand-green)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.3"
              strokeDasharray="6 10"
            />
          </svg>

          <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
            <div data-reveal-stagger>
              <Eyebrow index="09" className="mb-6">
                Early access
              </Eyebrow>
              <h2 className="text-display-lg font-semibold text-ink-primary">
                SafeWalkMaps is coming
                <span className="block text-ink-tertiary">to iPhone.</span>
              </h2>
              <p className="mt-6 max-w-prose text-body-lg text-ink-secondary">
                Join the early-access list and you will be among the first to get the build. One
                email when it is ready, and nothing else.
              </p>
              <p className="mt-5 text-body-sm text-ink-tertiary">
                In beta in {siteConfig.betaCities.join(' and ')}. Tell us your city and it helps
                decide where we go next.
              </p>
            </div>

            <div>
              {status === 'success' ? (
                <div
                  className="rounded-2xl border border-green-200 bg-white p-7 shadow-sm sm:p-8"
                  role="status"
                >
                  <SuccessMark animate={!reduced} />
                  <h3 className="mt-6 text-display-sm font-semibold text-ink-primary">
                    You are on the list.
                  </h3>
                  <p className="mt-3 text-ink-secondary">
                    We will email you when the iOS build is ready to hand out. No newsletter, no
                    drip campaign.
                  </p>

                  {simulated && (
                    <p className="mt-5 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-body-sm text-warning-ink">
                      <span className="font-semibold">Development mode. </span>
                      No form backend is configured, so this signup was simulated and nothing was
                      sent. Set <code className="font-mono text-caption">VITE_WEB3FORMS_ACCESS_KEY</code>{' '}
                      to deliver submissions.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-body-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
                  >
                    Add another email
                  </button>
                </div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={onSubmit}
                  noValidate
                  className="rounded-2xl border border-line bg-white p-7 shadow-sm sm:p-8"
                >
                  <div className="flex items-center gap-3">
                    <ShieldMark className="h-7" />
                    <h3 className="text-body-lg font-semibold text-ink-primary">
                      Join the iOS waitlist
                    </h3>
                  </div>

                  <div className="mt-6 space-y-4">
                    <TextField
                      label="Email address"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      error={emailError}
                      onChange={() => emailError && setEmailError(undefined)}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        label="Name"
                        name="name"
                        autoComplete="given-name"
                        placeholder="Alex"
                      />
                      <TextField
                        label="City"
                        name="city"
                        autoComplete="address-level2"
                        placeholder="Sheffield"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    routeHover
                    disabled={status === 'submitting'}
                    className="mt-6 w-full"
                  >
                    {status === 'submitting' ? 'Joining…' : 'Join the waitlist'}
                  </Button>

                  <p
                    id={liveRegionId}
                    role="alert"
                    aria-live="polite"
                    className={cn(
                      'mt-4 text-body-sm text-danger',
                      !formError && 'sr-only',
                    )}
                  >
                    {formError}
                    {formError && (
                      <>
                        {' '}
                        <a
                          href={`mailto:${siteConfig.contactEmail}`}
                          className="font-semibold underline underline-offset-4"
                        >
                          {siteConfig.contactEmail}
                        </a>
                      </>
                    )}
                  </p>

                  <p className="mt-4 text-caption leading-relaxed text-ink-tertiary">
                    We only email you about SafeWalkMaps, and you can unsubscribe at any time. See
                    our{' '}
                    <a href="/privacy" className="underline underline-offset-4 hover:text-ink-secondary">
                      privacy policy
                    </a>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
