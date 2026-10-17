import { Mail } from 'lucide-react';
import { useRef, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/config';
import { sendContactMessage, validateEmail } from '@/services/waitlist';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactSection() {
  const [status, setStatus] = useState<Status>('idle');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [messageError, setMessageError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [simulated, setSimulated] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '');
    const name = String(data.get('name') ?? '');
    const message = String(data.get('message') ?? '');

    const invalidEmail = validateEmail(email);
    const invalidMessage = message.trim() ? undefined : 'Please add a message.';
    setEmailError(invalidEmail);
    setMessageError(invalidMessage);
    setFormError(undefined);
    if (invalidEmail || invalidMessage) return;

    setStatus('submitting');
    const result = await sendContactMessage({ email, name, message });

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
    <Section id="contact">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div data-reveal-stagger>
          <h2 className="text-display-md text-ink-primary">Get in touch.</h2>
          <p className="mt-5 max-w-prose text-body-lg text-ink-secondary">
            Questions, feedback, a bug, or a city you want us to cover next. We read everything,
            and a person replies.
          </p>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="mt-7 inline-flex items-center gap-2.5 rounded-pill border border-line-strong bg-white px-4 py-2.5 text-body-sm font-medium text-ink-primary shadow-xs transition-colors duration-base hover:border-navy-300 hover:bg-navy-50"
          >
            <Mail aria-hidden="true" className="h-4 w-4 text-navy-700" />
            {siteConfig.contactEmail}
          </a>
        </div>

        <div>
          {status === 'success' ? (
            <div
              role="status"
              className="rounded-2xl border border-green-200 bg-green-50 p-7 sm:p-8"
            >
              <h3 className="text-body-lg text-green-900">Message sent.</h3>
              <p className="mt-2.5 text-green-900/80">
                Thanks — we will get back to you within a day or two.
              </p>
              {simulated && (
                <p className="mt-5 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-body-sm text-warning-ink">
                  <span className="font-semibold">Development mode. </span>
                  No form backend is configured, so nothing was actually sent.
                </p>
              )}
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-6 text-body-sm font-semibold text-green-900 underline-offset-4 hover:underline"
              >
                Send another
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={onSubmit}
              noValidate
              className="rounded-2xl border border-line bg-white p-7 shadow-sm sm:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" name="name" autoComplete="name" placeholder="Alex" />
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
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <label htmlFor="contact-message" className="text-body-sm font-medium text-ink-secondary">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  aria-invalid={messageError ? true : undefined}
                  aria-describedby={messageError ? 'contact-message-error' : undefined}
                  onChange={() => messageError && setMessageError(undefined)}
                  placeholder="What's on your mind?"
                  className={cn(
                    'w-full resize-y rounded-xl border border-line-strong bg-white px-4 py-3 text-body outline-none transition-[border-color,background-color,box-shadow] duration-base ease-out-expo',
                    'placeholder:text-ink-tertiary focus:border-navy-600 focus:ring-4 focus:ring-navy-600/12',
                    messageError && 'border-danger focus:border-danger focus:ring-danger/15',
                  )}
                />
                {messageError && (
                  <p id="contact-message-error" className="text-caption font-medium text-danger">
                    {messageError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                routeHover
                disabled={status === 'submitting'}
                className="mt-6 w-full sm:w-auto"
              >
                {status === 'submitting' ? 'Sending…' : 'Send message'}
              </Button>

              {formError && (
                <p role="alert" className="mt-4 text-body-sm text-danger">
                  {formError}{' '}
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="font-semibold underline underline-offset-4"
                  >
                    {siteConfig.contactEmail}
                  </a>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
