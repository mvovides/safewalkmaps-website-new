import { siteConfig } from '@/lib/config';

import { submitToWeb3Forms, type SubmitResult } from './web3forms';

export type WaitlistInput = {
  email: string;
  /** Optional — we ask, but we do not insist. */
  name?: string;
  /** Optional city, so we know where to expand next. */
  city?: string;
};

/** Pragmatic address check: structure only, never a claim of deliverability. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter your email address.';
  if (!EMAIL_PATTERN.test(trimmed)) return 'That does not look like an email address.';
  return undefined;
}

/**
 * Join the iOS waitlist.
 *
 * The transport lives behind this function, so swapping Web3Forms for an API
 * route or a mailing-list provider later is a one-file change.
 */
export async function joinWaitlist(input: WaitlistInput): Promise<SubmitResult> {
  const error = validateEmail(input.email);
  if (error) return { status: 'error', message: error };

  return submitToWeb3Forms({
    subject: 'New iOS waitlist signup — SafeWalkMaps',
    from_name: 'SafeWalkMaps website',
    email: input.email.trim(),
    name: input.name?.trim() || 'Not provided',
    city: input.city?.trim() || 'Not provided',
    source: `${siteConfig.url} — waitlist`,
  });
}

export type ContactInput = {
  email: string;
  name?: string;
  message: string;
};

export async function sendContactMessage(input: ContactInput): Promise<SubmitResult> {
  const error = validateEmail(input.email);
  if (error) return { status: 'error', message: error };
  if (!input.message.trim()) {
    return { status: 'error', message: 'Please tell us what you would like to say.' };
  }

  return submitToWeb3Forms({
    subject: 'Message from the SafeWalkMaps website',
    from_name: 'SafeWalkMaps website',
    email: input.email.trim(),
    name: input.name?.trim() || 'Not provided',
    message: input.message.trim(),
    source: `${siteConfig.url} — contact`,
  });
}
