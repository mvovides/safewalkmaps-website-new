import type { ThemeConfig } from '@/theme/config';

/**
 * The contract between the shell and its preview iframes. Both documents are the
 * same origin, so messages are plain objects over `postMessage`; every handler
 * still checks the origin and ignores anything it does not recognise.
 */

export const PREVIEW_WIDTHS = [390, 768, 1280] as const;
export type PreviewWidth = (typeof PREVIEW_WIDTHS)[number] | 'fluid';
export type PreviewMode = 'lab' | 'live';
export const LIVE_ROUTES = ['/', '/safety-score', '/features', '/about', '/faq'] as const;
export type LiveRoute = (typeof LIVE_ROUTES)[number];
export type FrameId = 'a' | 'b';

export type ApplyPayload = {
  config: ThemeConfig;
  mode: PreviewMode;
  route: LiveRoute;
  labSection: string | null;
};

export type ShellToPreview =
  | { type: 'swm-theme/apply'; payload: ApplyPayload }
  | { type: 'swm-theme/scrollTo'; fraction: number };

export type PreviewToShell =
  | { type: 'swm-theme/ready'; frameId: FrameId }
  | { type: 'swm-theme/scroll'; frameId: FrameId; fraction: number };

export type PlaygroundMessage = ShellToPreview | PreviewToShell;

export function isPlaygroundMessage(data: unknown): data is PlaygroundMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { type?: unknown }).type === 'string' &&
    (data as { type: string }).type.startsWith('swm-theme/')
  );
}

export function isSameOrigin(event: MessageEvent): boolean {
  return event.origin === window.location.origin;
}

export function postToParent(message: PreviewToShell): void {
  if (window.parent !== window) window.parent.postMessage(message, window.location.origin);
}

export function postToFrame(frame: HTMLIFrameElement | null, message: ShellToPreview): void {
  frame?.contentWindow?.postMessage(message, window.location.origin);
}

/** The same page, in preview mode, for one frame. Relative, so it works in dev and in dist-playground. */
export function previewUrl(frameId: FrameId): string {
  const url = new URL('playground.html', window.location.href);
  url.searchParams.set('preview', '1');
  url.searchParams.set('frame', frameId);
  return url.toString();
}
