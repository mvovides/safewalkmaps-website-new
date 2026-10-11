import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { todayPreset } from '@/theme/presets/today';

import type * as Protocol from './protocol';

vi.mock('./protocol', async () => {
  const actual = await vi.importActual<typeof Protocol>('./protocol');
  return { ...actual, postToParent: vi.fn() };
});

import { Preview } from './Preview';
import { postToParent } from './protocol';

function apply(payload: object) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'swm-theme/apply', payload },
        origin: window.location.origin,
      }),
    );
  });
}

describe('Preview', () => {
  it('announces itself and applies the theme it is sent', () => {
    render(<Preview frameId="a" />);
    expect(postToParent).toHaveBeenCalledWith({ type: 'swm-theme/ready', frameId: 'a' });
    const dark = {
      ...todayPreset,
      tokens: {
        ...todayPreset.tokens,
        colors: { ...todayPreset.tokens.colors, scheme: 'dark' },
      },
    };
    apply({ config: dark, mode: 'lab', route: '/', labSection: null, reducedMotion: true });
    expect(document.documentElement.style.getPropertyValue('--color-scheme')).toBe('dark');
    expect(document.documentElement.dataset.swmScheme).toBe('dark');
    expect(document.documentElement.dataset.swmReduced).toBe('true');
  });

  it('reports scroll position and honours scrollTo without echoing it', () => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    const scrollTo = vi.spyOn(window, 'scrollTo');
    render(<Preview frameId="a" />);
    apply({ config: todayPreset, mode: 'lab', route: '/', labSection: null, reducedMotion: false });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 3000,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(postToParent).toHaveBeenCalledWith({
      type: 'swm-theme/scroll',
      frameId: 'a',
      fraction: 0.25,
    });
    vi.mocked(postToParent).mockClear();
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'swm-theme/scrollTo', fraction: 0.5 },
          origin: window.location.origin,
        }),
      );
    });
    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'instant' });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(postToParent).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'swm-theme/scroll' }),
    );
  });

  it('renders the real site in live mode', () => {
    render(<Preview frameId="a" />);
    apply({
      config: todayPreset,
      mode: 'live',
      route: '/features',
      labSection: null,
      reducedMotion: false,
    });
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });
});
