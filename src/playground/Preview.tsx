import { useEffect, useState } from 'react';

import { applyTheme } from '@/theme/apply';

import { loadThemeFonts } from './fonts';
import { Lab } from './lab/Lab';
import { LiveSite } from './preview/LiveSite';
import {
  isPlaygroundMessage,
  isSameOrigin,
  postToParent,
  type ApplyPayload,
  type FrameId,
} from './protocol';

/**
 * The document inside each preview iframe. It applies whatever the shell sends to
 * <html>, then renders either the component lab or the real site.
 */
export function Preview({ frameId }: { frameId: FrameId }) {
  const [payload, setPayload] = useState<ApplyPayload | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isSameOrigin(event) || !isPlaygroundMessage(event.data)) return;
      if (event.data.type === 'swm-theme/apply') setPayload(event.data.payload);
    };
    window.addEventListener('message', onMessage);
    postToParent({ type: 'swm-theme/ready', frameId });
    return () => window.removeEventListener('message', onMessage);
  }, [frameId]);

  // Compare mode mirrors scroll between frames. Report our position as a fraction, and
  // follow the other frame's without echoing the programmatic scroll back.
  useEffect(() => {
    let frame = 0;
    let programmaticUntil = 0;
    const range = () => document.documentElement.scrollHeight - window.innerHeight;
    const onScroll = () => {
      if (performance.now() < programmaticUntil || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const total = range();
        postToParent({
          type: 'swm-theme/scroll',
          frameId,
          fraction: total > 0 ? window.scrollY / total : 0,
        });
      });
    };
    const onMessage = (event: MessageEvent) => {
      if (!isSameOrigin(event) || !isPlaygroundMessage(event.data)) return;
      if (event.data.type !== 'swm-theme/scrollTo') return;
      programmaticUntil = performance.now() + 150;
      window.scrollTo({
        top: Math.round(event.data.fraction * range()),
        behavior: 'instant' as ScrollBehavior,
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('message', onMessage);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [frameId]);

  useEffect(() => {
    if (!payload) return undefined;
    const root = document.documentElement;
    const cleanup = applyTheme(root, payload.config);
    loadThemeFonts(document, payload.config.tokens.typography);
    root.dataset.swmReduced = String(payload.reducedMotion);
    return () => {
      cleanup();
      delete root.dataset.swmReduced;
    };
  }, [payload]);

  if (!payload) return <div className="min-h-screen-dvh" aria-busy="true" />;
  if (payload.mode === 'live') return <LiveSite route={payload.route} />;
  return <Lab config={payload.config} section={payload.labSection} />;
}
