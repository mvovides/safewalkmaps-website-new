import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

import type * as Protocol from '../protocol';
import type { ApplyPayload } from '../protocol';

vi.mock('../protocol', async () => {
  const actual = await vi.importActual<typeof Protocol>('../protocol');
  return { ...actual, postToFrame: vi.fn() };
});

import { postToFrame } from '../protocol';
import { PreviewFrame } from './PreviewFrame';

const payload: ApplyPayload = {
  config: todayPreset,
  mode: 'lab',
  route: '/',
  labSection: null,
  reducedMotion: false,
};

function ready(frameId: 'a' | 'b') {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'swm-theme/ready', frameId },
        origin: window.location.origin,
      }),
    );
  });
}

describe('PreviewFrame', () => {
  it('renders an iframe pointing at the preview URL for its frame', () => {
    render(<PreviewFrame frameId="b" payload={payload} width="fluid" />);
    const frame = screen.getByTitle('Preview b');
    expect(frame.getAttribute('src')).toMatch(/playground\.html\?preview=1&frame=b/);
  });

  it('replies to ready with the current config, and re-sends on change', () => {
    vi.mocked(postToFrame).mockClear();
    const { rerender } = render(<PreviewFrame frameId="a" payload={payload} width="fluid" />);
    expect(postToFrame).not.toHaveBeenCalled();
    ready('a');
    expect(postToFrame).toHaveBeenLastCalledWith(expect.anything(), {
      type: 'swm-theme/apply',
      payload,
    });
    const next = { ...payload, mode: 'live' as const };
    rerender(<PreviewFrame frameId="a" payload={next} width="fluid" />);
    expect(postToFrame).toHaveBeenLastCalledWith(expect.anything(), {
      type: 'swm-theme/apply',
      payload: next,
    });
  });

  it('ignores ready from another frame and from another origin', () => {
    vi.mocked(postToFrame).mockClear();
    render(<PreviewFrame frameId="a" payload={payload} width="fluid" />);
    ready('b');
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'swm-theme/ready', frameId: 'a' },
          origin: 'https://evil.example',
        }),
      );
    });
    expect(postToFrame).not.toHaveBeenCalled();
  });

  it('sets a fixed width for a device preset', () => {
    render(<PreviewFrame frameId="a" payload={payload} width={390} />);
    const stage = screen.getByTestId('preview-stage-a');
    expect(stage.style.width).toBe('390px');
  });
});
