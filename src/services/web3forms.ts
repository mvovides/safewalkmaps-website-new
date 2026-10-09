import { isFormBackendConfigured, web3FormsAccessKey } from '@/lib/config';

const ENDPOINT = 'https://api.web3forms.com/submit';
const TIMEOUT_MS = 15000;

export type SubmitResult =
  | { status: 'ok'; simulated: boolean }
  | { status: 'error'; message: string };

/** Message shown when something goes wrong, pointing at the mailto fallback. */
const GENERIC_ERROR = 'That did not go through. Please try again, or email us directly.';

/**
 * Post a form payload to Web3Forms.
 *
 * The access key is a public, submission-only key — it cannot read anything —
 * but it is still read from the environment so it can be rotated per deploy.
 *
 * When no key is configured (local development, or a preview deploy without
 * environment variables) the submission is *simulated* rather than failing.
 * Callers are told which happened via `simulated`, so the UI can be honest
 * about it instead of showing a success state that did not happen.
 */
export async function submitToWeb3Forms(
  fields: Record<string, string>,
): Promise<SubmitResult> {
  if (!isFormBackendConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { status: 'ok', simulated: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: web3FormsAccessKey, ...fields }),
      signal: controller.signal,
    });

    const data: unknown = await response.json().catch(() => null);
    const succeeded =
      response.ok &&
      typeof data === 'object' &&
      data !== null &&
      (data as { success?: boolean }).success !== false;

    if (!succeeded) {
      const message =
        typeof data === 'object' && data !== null && typeof (data as { message?: string }).message === 'string'
          ? (data as { message: string }).message
          : GENERIC_ERROR;
      return { status: 'error', message };
    }

    return { status: 'ok', simulated: false };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { status: 'error', message: 'That took too long. Please try again.' };
    }
    return { status: 'error', message: GENERIC_ERROR };
  } finally {
    clearTimeout(timeout);
  }
}
