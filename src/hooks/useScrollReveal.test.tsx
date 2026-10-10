import { act, fireEvent, screen } from '@testing-library/react';
import { lazy, StrictMode, Suspense, type ComponentType } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SiteLayout } from '@/components/layout/SiteLayout';
import { emulateReducedMotion } from '@/test/reducedMotion';
import { renderWithRouter } from '@/test/renderWithRouter';

/**
 * A controllable IntersectionObserver.
 *
 * The stub in src/test/setup.ts never calls back, so a reveal could never be
 * delivered through the real path. This one records what each instance observes
 * and lets a test deliver a notification by hand.
 */
class FakeIntersectionObserver implements IntersectionObserver {
  static all: FakeIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];
  readonly observed = new Set<Element>();
  disconnected = false;

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.all.push(this);
  }

  observe(target: Element) {
    this.observed.add(target);
  }

  unobserve(target: Element) {
    this.observed.delete(target);
  }

  disconnect() {
    this.observed.clear();
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  deliver(target: Element, isIntersecting: boolean) {
    const entry = { target, isIntersecting } as IntersectionObserverEntry;
    act(() => this.callback([entry], this));
  }
}

const watching = (element: Element) =>
  FakeIntersectionObserver.all.filter((o) => !o.disconnected && o.observed.has(element));

/** Lets a MutationObserver callback, and whatever it sets, settle. */
const flush = () => act(async () => {});

/** Replaces requestAnimationFrame with a queue the test advances by hand. */
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
    get pending() {
      return queue.size;
    },
    next() {
      const due = [...queue.values()];
      queue.clear();
      act(() => due.forEach((callback) => callback(performance.now())));
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
    arrive: () => act(async () => release()),
  };
}

function Article() {
  return (
    <>
      <section data-reveal data-testid="plain" />
      <ul data-reveal-stagger data-testid="list">
        <li />
      </ul>
    </>
  );
}

function GoTo({ to }: { to: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      go to {to}
    </button>
  );
}

/** Both reveal elements the `Article` page renders. */
const revealElements = () => [screen.getByTestId('plain'), screen.getByTestId('list')];

const html = () => document.documentElement;

describe('useScrollReveal', () => {
  const originalObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    FakeIntersectionObserver.all = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.stubGlobal('IntersectionObserver', originalObserver);
    html().classList.remove('motion-ready');
  });

  describe('arming', () => {
    it('hides the reveal elements that are on the page when the layout mounts', async () => {
      controlFrames();
      renderWithRouter(
        <SiteLayout>
          <Article />
        </SiteLayout>,
      );
      await flush();

      for (const element of revealElements()) {
        expect(element).toHaveAttribute('data-visible', 'false');
        expect(watching(element)).toHaveLength(1);
      }
      expect(html()).toHaveClass('motion-ready');
    });

    it('arms elements that only arrive once a lazy route has loaded', async () => {
      // The layout mounts, and its effect runs, while Suspense is still showing
      // the fallback. The route's elements do not exist yet, and nothing about
      // the pathname changes when they appear.
      controlFrames();
      const { Page, arrive } = lazyPage(Article);

      renderWithRouter(
        <SiteLayout>
          <Suspense fallback={<div aria-busy="true" />}>
            <Routes>
              <Route path="/features" element={<Page />} />
            </Routes>
          </Suspense>
        </SiteLayout>,
        { initialEntries: ['/features'] },
      );
      await flush();
      expect(screen.queryByTestId('plain')).toBeNull();

      await arrive();
      await flush();

      for (const element of revealElements()) {
        expect(element).toHaveAttribute('data-visible', 'false');
        expect(watching(element)).toHaveLength(1);
      }
    });

    it('does not arm the page while only the loading fallback is showing', async () => {
      // `motion-ready` is the switch that lets the hidden state apply. Throwing
      // it with nothing to hide arms nothing.
      controlFrames();
      const { Page, arrive } = lazyPage(Article);

      renderWithRouter(
        <SiteLayout>
          <Suspense fallback={<div aria-busy="true" />}>
            <Routes>
              <Route path="/features" element={<Page />} />
            </Routes>
          </Suspense>
        </SiteLayout>,
        { initialEntries: ['/features'] },
      );
      await flush();
      expect(html()).not.toHaveClass('motion-ready');

      await arrive();
      await flush();
      expect(html()).toHaveClass('motion-ready');
    });

    it('arms the elements of the page it navigates to', async () => {
      controlFrames();
      renderWithRouter(
        <SiteLayout>
          <GoTo to="/features" />
          <Routes>
            <Route path="/" element={<p>nothing to reveal</p>} />
            <Route path="/features" element={<Article />} />
          </Routes>
        </SiteLayout>,
      );
      await flush();

      fireEvent.click(screen.getByRole('button', { name: 'go to /features' }));
      await flush();

      for (const element of revealElements()) {
        expect(element).toHaveAttribute('data-visible', 'false');
        expect(watching(element)).toHaveLength(1);
      }
    });

    it('still observes the page after React runs the effect twice in development', async () => {
      // StrictMode mounts, cleans up and mounts again. The first pass leaves the
      // elements marked hidden with no observer; the second must pick them up
      // rather than assume that a marked element is already being watched.
      controlFrames();
      renderWithRouter(
        <StrictMode>
          <SiteLayout>
            <Article />
          </SiteLayout>
        </StrictMode>,
      );
      await flush();

      for (const element of revealElements()) {
        expect(element).toHaveAttribute('data-visible', 'false');
        expect(watching(element)).toHaveLength(1);
      }
    });
  });

  describe('revealing', () => {
    it('reveals an element once it scrolls into view, and stops watching it', async () => {
      controlFrames();
      renderWithRouter(
        <SiteLayout>
          <Article />
        </SiteLayout>,
      );
      await flush();
      const plain = screen.getByTestId('plain');
      const [observer] = watching(plain);

      observer?.deliver(plain, false);
      expect(plain).toHaveAttribute('data-visible', 'false');

      observer?.deliver(plain, true);
      expect(plain).toHaveAttribute('data-visible', 'true');
      expect(watching(plain)).toHaveLength(0);
      // Its neighbour has not scrolled in.
      expect(screen.getByTestId('list')).toHaveAttribute('data-visible', 'false');
    });

    it('reveals what is already above the fold without waiting for an intersection', async () => {
      // Deep links and restored scroll positions: the element is already behind
      // the reader, so no observer will ever see it enter. jsdom's viewport is
      // 768px tall, so 120 is inside the top 90% and 2400 is far below it.
      const frames = controlFrames();
      renderWithRouter(
        <SiteLayout>
          <Article />
        </SiteLayout>,
      );
      const plain = screen.getByTestId('plain');
      const list = screen.getByTestId('list');
      vi.spyOn(plain, 'getBoundingClientRect').mockReturnValue({ top: 120 } as DOMRect);
      vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 2400 } as DOMRect);
      await flush();

      frames.next();

      expect(plain).toHaveAttribute('data-visible', 'true');
      expect(list).toHaveAttribute('data-visible', 'false');
    });

    it('settles an element that arrives late the same way', async () => {
      const frames = controlFrames();
      const { Page, arrive } = lazyPage(Article);

      renderWithRouter(
        <SiteLayout>
          <Suspense fallback={<div aria-busy="true" />}>
            <Routes>
              <Route path="/features" element={<Page />} />
            </Routes>
          </Suspense>
        </SiteLayout>,
        { initialEntries: ['/features'] },
      );
      await flush();
      frames.next();

      await arrive();
      await flush();
      expect(screen.getByTestId('plain')).toHaveAttribute('data-visible', 'false');
      frames.next();

      // jsdom lays nothing out, so every element reads as being at the top.
      for (const element of revealElements()) {
        expect(element).toHaveAttribute('data-visible', 'true');
      }
    });
  });

  describe('when the visitor prefers reduced motion', () => {
    it('shows what is on the page and never arms it', async () => {
      emulateReducedMotion();
      renderWithRouter(
        <SiteLayout>
          <Article />
        </SiteLayout>,
      );
      await flush();

      for (const element of revealElements()) {
        expect(element).toHaveAttribute('data-visible', 'true');
      }
      expect(html()).not.toHaveClass('motion-ready');
    });

    it('shows elements that arrive once a lazy route has loaded', async () => {
      emulateReducedMotion();
      const { Page, arrive } = lazyPage(Article);

      renderWithRouter(
        <SiteLayout>
          <Suspense fallback={<div aria-busy="true" />}>
            <Routes>
              <Route path="/features" element={<Page />} />
            </Routes>
          </Suspense>
        </SiteLayout>,
        { initialEntries: ['/features'] },
      );
      await flush();

      await arrive();
      await flush();

      for (const element of revealElements()) {
        expect(element).toHaveAttribute('data-visible', 'true');
      }
      expect(html()).not.toHaveClass('motion-ready');
    });
  });

  describe('lifecycle', () => {
    it('does not re-scan the page in response to its own writes', async () => {
      // Arming and revealing both write `data-visible` into <main>. If the watch
      // reached attributes, each write would queue another scan, which would
      // write again.
      const frames = controlFrames();
      const scan = vi.spyOn(document, 'querySelectorAll');
      const { Page, arrive } = lazyPage(Article);

      renderWithRouter(
        <SiteLayout>
          <Suspense fallback={<div aria-busy="true" />}>
            <Routes>
              <Route path="/features" element={<Page />} />
            </Routes>
          </Suspense>
        </SiteLayout>,
        { initialEntries: ['/features'] },
      );
      await arrive();
      await flush();
      expect(screen.getByTestId('plain')).toHaveAttribute('data-visible', 'false');
      const scansAfterArming = scan.mock.calls.length;

      frames.next();
      await flush();
      expect(screen.getByTestId('plain')).toHaveAttribute('data-visible', 'true');

      expect(scan).toHaveBeenCalledTimes(scansAfterArming);
    });

    it('lets go of elements that leave the page', async () => {
      controlFrames();
      renderWithRouter(
        <SiteLayout>
          <GoTo to="/elsewhere" />
          <Routes>
            <Route path="/" element={<Article />} />
            <Route path="/elsewhere" element={<p>nothing to reveal</p>} />
          </Routes>
        </SiteLayout>,
      );
      await flush();
      const plain = screen.getByTestId('plain');
      expect(watching(plain)).toHaveLength(1);

      fireEvent.click(screen.getByRole('button', { name: 'go to /elsewhere' }));
      await flush();

      expect(plain).not.toBeInTheDocument();
      expect(watching(plain)).toHaveLength(0);
    });

    it('releases its observers, its frame and the armed state on unmount', async () => {
      const frames = controlFrames();
      const liveMutationObservers = new Set<MutationObserver>();
      class TrackedMutationObserver extends MutationObserver {
        constructor(callback: MutationCallback) {
          super(callback);
          liveMutationObservers.add(this);
        }
        override disconnect() {
          liveMutationObservers.delete(this);
          super.disconnect();
        }
      }
      const originalMutationObserver = globalThis.MutationObserver;
      vi.stubGlobal('MutationObserver', TrackedMutationObserver);

      try {
        const { unmount } = renderWithRouter(
          <SiteLayout>
            <Article />
          </SiteLayout>,
        );
        await flush();
        expect(html()).toHaveClass('motion-ready');
        expect(liveMutationObservers.size).toBeGreaterThan(0);
        expect(frames.pending).toBeGreaterThan(0);

        unmount();

        expect(liveMutationObservers.size).toBe(0);
        expect(FakeIntersectionObserver.all.filter((o) => !o.disconnected)).toHaveLength(0);
        expect(html()).not.toHaveClass('motion-ready');
        expect(frames.pending).toBe(0);
      } finally {
        vi.stubGlobal('MutationObserver', originalMutationObserver);
      }
    });
  });
});
