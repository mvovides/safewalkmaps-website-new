import { useEffect, useRef, useState } from 'react';

import {
  isPlaygroundMessage,
  isSameOrigin,
  postToFrame,
  previewUrl,
  type ApplyPayload,
  type FrameId,
  type PreviewWidth,
} from '../protocol';

export type PreviewFrameProps = {
  frameId: FrameId;
  payload: ApplyPayload;
  width: PreviewWidth;
  onScroll?: (fraction: number) => void;
  /** Mirrored scroll position from the other frame (compare mode). */
  scrollTo?: number | null;
};

/**
 * One preview iframe. Sends `apply` as soon as the frame says it is ready and again on
 * every change. A fixed device width wider than the stage is scaled down to fit, so the
 * document inside still measures the true width and its breakpoints behave.
 */
export function PreviewFrame({ frameId, payload, width, onScroll, scrollTo }: PreviewFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isSameOrigin(event) || !isPlaygroundMessage(event.data)) return;
      if (!('frameId' in event.data) || event.data.frameId !== frameId) return;
      if (event.data.type === 'swm-theme/ready') setReady(true);
      if (event.data.type === 'swm-theme/scroll') onScroll?.(event.data.fraction);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frameId, onScroll]);

  useEffect(() => {
    if (ready) postToFrame(frameRef.current, { type: 'swm-theme/apply', payload });
  }, [ready, payload]);

  useEffect(() => {
    if (ready && typeof scrollTo === 'number') {
      postToFrame(frameRef.current, { type: 'swm-theme/scrollTo', fraction: scrollTo });
    }
  }, [ready, scrollTo]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const target = width === 'fluid' ? available.width : width;
  const scale = target > 0 && available.width > 0 ? Math.min(1, available.width / target) : 1;
  const left = available.width > 0 ? Math.max(0, (available.width - target * scale) / 2) : 0;

  return (
    <div ref={stageRef} className="pg-stage" data-testid={`preview-${frameId}`}>
      <div
        data-testid={`preview-stage-${frameId}`}
        className="pg-stage-inner"
        style={{
          width: width === 'fluid' ? '100%' : `${width}px`,
          height: scale < 1 && available.height > 0 ? `${available.height / scale}px` : '100%',
          transform: scale < 1 ? `scale(${scale})` : undefined,
          left: width === 'fluid' ? 0 : `${left}px`,
        }}
      >
        <iframe
          ref={frameRef}
          title={`Preview ${frameId}`}
          src={previewUrl(frameId)}
          className="pg-frame"
        />
      </div>
    </div>
  );
}
