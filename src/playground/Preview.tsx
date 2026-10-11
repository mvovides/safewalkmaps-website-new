import { useEffect, useState } from 'react';

import { applyTheme } from '@/theme/apply';

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

  useEffect(() => {
    if (!payload) return undefined;
    const root = document.documentElement;
    const cleanup = applyTheme(root, payload.config);
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
