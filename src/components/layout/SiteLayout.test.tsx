import { act, fireEvent, screen } from '@testing-library/react';
import { lazy, Suspense, type ComponentType } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { emulateReducedMotion } from '@/test/reducedMotion';
import { renderWithRouter } from '@/test/renderWithRouter';

import { SiteLayout } from './SiteLayout';

/**
 * Replaces requestAnimationFrame with a queue the test advances by hand, so
 * "N frames have passed" is exact rather than a race against a real clock.
 * Like the real thing, a callback queued while a frame runs waits for the next.
 */
function controlFrames() {
  let nextId = 1;
  const queue = new Map<number, FrameRequestCallback>();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = nextId++;
    queue.set(id, callback);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    queue.delete(id);
  });

  return {
    /** Frames still waiting to run. Zero means nothing can fire later. */
    get pending() {
      return queue.size;
    },
    advance(frames: number) {
      for (let i = 0; i < frames; i++) {
        const due = [...queue.values()];
        queue.clear();
        act(() => {
          for (const callback of due) callback(performance.now());
        });
      }
    },
  };
}

/** A lazy route whose chunk "arrives" only when the test says so. */
function lazyPage(Page: ComponentType) {
  let release!: () => void;
  const chunk = new Promise<{ default: ComponentType }>((resolve) => {
    release = () => resolve({ default: Page });
  });
  return {
    Page: lazy(() => chunk),
    /** Delivers the chunk and lets Suspense swap the fallback for the page. */
    arrive: () => act(async () => release()),
  };
}

function GoTo({ to }: { to: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      go to {to}
    </button>
  );
}

const SCROLL_OPTIONS = { behavior: 'smooth', block: 'start' };
// `auto` defers to the page's computed scroll-behavior, which the stylesheet
// sets to `auto` under prefers-reduced-motion. `smooth` would not.
const REDUCED_MOTION_SCROLL_OPTIONS = { behavior: 'auto', block: 'start' };

describe('SiteLayout hash scrolling', () => {
  let frames: ReturnType<typeof controlFrames>;
  let scrollIntoView: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    frames = controlFrames();
    scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to a hash target that only exists once its lazy route has loaded', async () => {
    // The direct-load case: the location already carries the hash while
    // Suspense is still showing its fallback, so the first look finds nothing.
    const { Page, arrive } = lazyPage(() => <section id="contact" data-testid="contact" />);

    renderWithRouter(
      <SiteLayout>
        <Suspense fallback={<div aria-busy="true" />}>
          <Routes>
            <Route path="/about" element={<Page />} />
          </Routes>
        </Suspense>
      </SiteLayout>,
      { initialEntries: ['/about#contact'] },
    );

    // Several frames pass with the chunk still in flight.
    frames.advance(3);
    expect(document.getElementById('contact')).toBeNull();
    expect(scrollIntoView).not.toHaveBeenCalled();

    await arrive();
    frames.advance(3);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByTestId('contact'));
    expect(scrollIntoView).toHaveBeenCalledWith(SCROLL_OPTIONS);
  });

  it('jumps instead of animating when the visitor prefers reduced motion', () => {
    // An explicit `behavior` in the options overrides the stylesheet's
    // `scroll-behavior`, so asking for `smooth` here would animate a
    // multi-screen scroll for someone who asked for no motion at all.
    emulateReducedMotion();
    renderWithRouter(
      <SiteLayout>
        <Routes>
          <Route path="/about" element={<section id="contact" />} />
        </Routes>
      </SiteLayout>,
      { initialEntries: ['/about#contact'] },
    );

    frames.advance(1);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith(REDUCED_MOTION_SCROLL_OPTIONS);
  });

  it('honours the preference as it stands when the scroll happens, not when the search began', async () => {
    // The search can outlive the render that started it, for as long as a slow
    // chunk takes to arrive, and the setting can change in that time.
    const { Page, arrive } = lazyPage(() => <section id="contact" />);

    renderWithRouter(
      <SiteLayout>
        <Suspense fallback={<div aria-busy="true" />}>
          <Routes>
            <Route path="/about" element={<Page />} />
          </Routes>
        </Suspense>
      </SiteLayout>,
      { initialEntries: ['/about#contact'] },
    );
    frames.advance(2);
    emulateReducedMotion();

    await arrive();
    frames.advance(2);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith(REDUCED_MOTION_SCROLL_OPTIONS);
  });

  it('scrolls on the first frame, once, when the target is already on the page', () => {
    renderWithRouter(
      <SiteLayout>
        <Routes>
          <Route path="/about" element={<section id="contact" />} />
        </Routes>
      </SiteLayout>,
      { initialEntries: ['/about#contact'] },
    );

    frames.advance(1);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    // Found, so nothing is left queued to look again.
    expect(frames.pending).toBe(0);
    frames.advance(5);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('gives up if the target never appears, and does not scroll if it turns up later', async () => {
    const { Page, arrive } = lazyPage(() => <section id="contact" />);

    renderWithRouter(
      <SiteLayout>
        <Suspense fallback={<div aria-busy="true" />}>
          <Routes>
            <Route path="/about" element={<Page />} />
          </Routes>
        </Suspense>
      </SiteLayout>,
      { initialEntries: ['/about#contact'] },
    );

    // Far more frames than any sensible budget, with the chunk still missing.
    frames.advance(500);
    expect(frames.pending).toBe(0);

    await arrive();
    frames.advance(5);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('abandons the search when the visitor navigates away', () => {
    // /faq carries its own #contact. If the abandoned search were still alive it
    // would find that one and drag the visitor to it.
    const { Page } = lazyPage(() => <section id="contact" />);

    renderWithRouter(
      <SiteLayout>
        <GoTo to="/faq" />
        <Suspense fallback={<div aria-busy="true" />}>
          <Routes>
            <Route path="/about" element={<Page />} />
            <Route path="/faq" element={<section id="contact" />} />
          </Routes>
        </Suspense>
      </SiteLayout>,
      { initialEntries: ['/about#contact'] },
    );

    frames.advance(2);
    fireEvent.click(screen.getByRole('button', { name: 'go to /faq' }));

    frames.advance(5);
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(frames.pending).toBe(0);
  });

  it('replaces the search when only the hash changes', () => {
    renderWithRouter(
      <SiteLayout>
        <GoTo to="/faq#second" />
        <Routes>
          <Route path="/faq" element={<section id="second" />} />
        </Routes>
      </SiteLayout>,
      { initialEntries: ['/faq#first'] },
    );

    // #first is never on the page, so the first search is still running.
    frames.advance(2);
    fireEvent.click(screen.getByRole('button', { name: 'go to /faq#second' }));
    frames.advance(1);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('second'));

    // The old search must not outlive its replacement and pick up #first later.
    const late = document.createElement('div');
    late.id = 'first';
    document.body.append(late);
    frames.advance(5);
    late.remove();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('abandons the search on unmount', () => {
    const { unmount } = renderWithRouter(
      <SiteLayout>
        <Routes>
          <Route path="/about" element={<div />} />
        </Routes>
      </SiteLayout>,
      { initialEntries: ['/about#contact'] },
    );

    frames.advance(2);
    unmount();

    const late = document.createElement('div');
    late.id = 'contact';
    document.body.append(late);
    frames.advance(5);
    late.remove();

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(frames.pending).toBe(0);
  });
});
