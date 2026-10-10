import { act, fireEvent, screen } from '@testing-library/react';
import { lazy, Suspense, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SiteLayout } from '@/components/layout/SiteLayout';
import { renderWithRouter } from '@/test/renderWithRouter';

import { useNavOverDark } from './useNavOverDark';

/**
 * A controllable IntersectionObserver.
 *
 * The stub in src/test/setup.ts never calls back, so `overDark` could never flip
 * through the real path. This one records which elements each instance observes
 * and lets a test deliver a notification by hand, which is all the hook needs
 * from the browser. Like the real thing it says nothing on its own when an
 * observed element leaves the page; a test that wants a notification sends it.
 */
class FakeIntersectionObserver implements IntersectionObserver {
  static all: FakeIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [0];
  readonly observed = new Set<Element>();
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ) {
    this.rootMargin = options.rootMargin ?? '0px';
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

  /** Delivers one notification, as the browser would after `target` crossed the band. */
  deliver(target: Element, isIntersecting: boolean) {
    const entry = { target, isIntersecting } as IntersectionObserverEntry;
    act(() => this.callback([entry], this));
  }
}

const liveObservers = () => FakeIntersectionObserver.all.filter((o) => !o.disconnected);
const watching = (element: Element) => liveObservers().filter((o) => o.observed.has(element));

/** Reports `element` entering or leaving the header band, via whoever observes it. */
function report(element: Element, isIntersecting: boolean) {
  const observers = watching(element);
  if (observers.length === 0) {
    throw new Error('Nothing is observing this element, so the browser would never report on it.');
  }
  observers.forEach((observer) => observer.deliver(element, isIntersecting));
}

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
    nextFrame() {
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

/** Every value the probe has rendered, in order. */
let seen: boolean[] = [];

function Probe() {
  const overDark = useNavOverDark();
  seen.push(overDark);
  return <output data-testid="over-dark">{String(overDark)}</output>;
}

const NavyBlock = () => <section data-nav-theme="dark" data-testid="navy" />;

/** Renders its children only once the test presses the button. */
function Reveal({ children, label = 'reveal' }: { children: ReactNode; label?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setShown((value) => !value)}>
        {label}
      </button>
      {shown && children}
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

const overDarkProbe = () => screen.getByTestId('over-dark');

describe('useNavOverDark', () => {
  const originalObserver = globalThis.IntersectionObserver;
  const originalHeight = window.innerHeight;

  beforeEach(() => {
    FakeIntersectionObserver.all = [];
    seen = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.stubGlobal('IntersectionObserver', originalObserver);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalHeight });
  });

  describe('sections that arrive after the header has mounted', () => {
    it('observes a dark section that was not on the page when the hook mounted', async () => {
      // The header mounts once and never again, so anything rendered later has
      // to be found by something other than the mount-time query.
      renderWithRouter(
        <>
          <Probe />
          <main>
            <Reveal>
              <NavyBlock />
            </Reveal>
          </main>
        </>,
      );
      expect(screen.queryByTestId('navy')).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: 'reveal' }));
      await flush();

      const navy = screen.getByTestId('navy');
      expect(watching(navy)).toHaveLength(1);

      report(navy, true);
      expect(overDarkProbe()).toHaveTextContent('true');
      report(navy, false);
      expect(overDarkProbe()).toHaveTextContent('false');
    });

    it('inverts the real header when a lazy route brings in its navy section', async () => {
      // The reported failure end to end: the header is outside <Routes>, so it
      // mounts while Suspense is still showing its fallback, and the section
      // only exists once the chunk resolves.
      const { Page, arrive } = lazyPage(NavyBlock);

      renderWithRouter(
        <SiteLayout>
          <Suspense fallback={<div aria-busy="true" />}>
            <Routes>
              <Route path="/about" element={<Page />} />
            </Routes>
          </Suspense>
        </SiteLayout>,
        { initialEntries: ['/about'] },
      );
      const glass = () => screen.getByRole('banner').querySelector('.nav-glass');
      expect(screen.queryByTestId('navy')).toBeNull();
      expect(glass()).toHaveClass('nav-glass-light');

      await arrive();
      await flush();
      report(screen.getByTestId('navy'), true);

      expect(glass()).toHaveClass('nav-glass-dark');
    });

    it('notices a section whose theme is switched on after it has rendered', async () => {
      function Switching() {
        const [dark, setDark] = useState(false);
        return (
          <section data-testid="navy" data-nav-theme={dark ? 'dark' : undefined}>
            <button type="button" onClick={() => setDark((value) => !value)}>
              switch
            </button>
          </section>
        );
      }
      renderWithRouter(
        <>
          <Probe />
          <main>
            <Switching />
          </main>
        </>,
      );
      const navy = screen.getByTestId('navy');
      expect(watching(navy)).toHaveLength(0);

      fireEvent.click(screen.getByRole('button', { name: 'switch' }));
      await flush();
      expect(watching(navy)).toHaveLength(1);
      report(navy, true);
      expect(overDarkProbe()).toHaveTextContent('true');

      // Switched off again: no notification is coming, so the hook must drop it.
      fireEvent.click(screen.getByRole('button', { name: 'switch' }));
      await flush();
      expect(watching(navy)).toHaveLength(0);
      expect(overDarkProbe()).toHaveTextContent('false');
    });
  });

  describe('route changes, with the header never unmounting', () => {
    function renderRoutes(initialEntries: string[]) {
      return renderWithRouter(
        <>
          <Probe />
          <main>
            <GoTo to="/" />
            <GoTo to="/a" />
            <GoTo to="/b" />
            <Routes>
              <Route path="/" element={<div />} />
              <Route path="/a" element={<section data-nav-theme="dark" data-testid="a" />} />
              <Route path="/b" element={<article data-nav-theme="dark" data-testid="b" />} />
            </Routes>
          </main>
        </>,
        { initialEntries },
      );
    }
    const go = async (to: string) => {
      fireEvent.click(screen.getByRole('button', { name: `go to ${to}` }));
      await flush();
    };

    it('picks up the dark section of the page it navigates to', async () => {
      renderRoutes(['/']);
      expect(liveObservers().flatMap((o) => [...o.observed])).toHaveLength(0);

      await go('/a');

      const a = screen.getByTestId('a');
      expect(watching(a)).toHaveLength(1);
      report(a, true);
      expect(overDarkProbe()).toHaveTextContent('true');
    });

    it('stops reporting dark once the visitor leaves the page that had it', async () => {
      // The mirror-image failure: a stale "dark" would leave white link text on
      // a white page. No callback is sent for the removal, so the hook has to
      // work it out itself.
      renderRoutes(['/a']);
      await flush();
      const a = screen.getByTestId('a');
      report(a, true);
      expect(overDarkProbe()).toHaveTextContent('true');

      await go('/');

      expect(watching(a)).toHaveLength(0);
      expect(overDarkProbe()).toHaveTextContent('false');
    });

    it('does not flash light while one dark page replaces another', async () => {
      renderRoutes(['/a']);
      await flush();
      report(screen.getByTestId('a'), true);
      seen = [];

      await go('/b');
      const b = screen.getByTestId('b');
      expect(watching(b)).toHaveLength(1);
      report(b, true);

      expect(overDarkProbe()).toHaveTextContent('true');
      expect(seen).not.toContain(false);
    });

    it('ignores a notification that was already queued for a section that has gone', async () => {
      renderRoutes(['/a']);
      await flush();
      const a = screen.getByTestId('a');
      const [observer] = watching(a);
      await go('/');

      observer?.deliver(a, true);

      expect(overDarkProbe()).toHaveTextContent('false');
    });
  });

  describe('lifecycle', () => {
    it('rebuilds the band when the viewport is resized', () => {
      // The behaviour the hook already had. It must survive the lifecycle work.
      const frames = controlFrames();
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
      renderWithRouter(
        <>
          <Probe />
          <main>
            <NavyBlock />
          </main>
        </>,
      );
      const navy = screen.getByTestId('navy');
      const [before] = watching(navy);
      expect(before?.rootMargin).toBe('0px 0px -728px 0px');

      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
      window.dispatchEvent(new Event('resize'));
      // Nothing happens until the frame: resizes are coalesced.
      expect(watching(navy)).toEqual([before]);
      frames.nextFrame();

      const [after] = watching(navy);
      expect(after).not.toBe(before);
      expect(before?.disconnected).toBe(true);
      expect(after?.rootMargin).toBe('0px 0px -528px 0px');
      expect(liveObservers()).toHaveLength(1);

      // The rebuilt observer is wired to the hook, not just constructed.
      report(navy, true);
      expect(overDarkProbe()).toHaveTextContent('true');
    });

    it('carries late sections through a resize rebuild, and keeps watching for more', async () => {
      const frames = controlFrames();
      renderWithRouter(
        <>
          <Probe />
          <main>
            <Reveal label="first">
              <NavyBlock />
            </Reveal>
            <Reveal label="second">
              <section data-nav-theme="dark" data-testid="second" />
            </Reveal>
          </main>
        </>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'first' }));
      await flush();

      window.dispatchEvent(new Event('resize'));
      frames.nextFrame();

      // A section that arrived late is re-observed by the rebuilt observer...
      const [rebuilt] = liveObservers();
      expect(liveObservers()).toHaveLength(1);
      expect(rebuilt?.observed.has(screen.getByTestId('navy'))).toBe(true);

      // ...and the one that arrives after the rebuild is picked up as well.
      fireEvent.click(screen.getByRole('button', { name: 'second' }));
      await flush();
      expect(watching(screen.getByTestId('second'))).toEqual([rebuilt]);
    });

    it('releases every observer and listener on unmount', async () => {
      const frames = controlFrames();
      const disconnectMutations = vi.spyOn(MutationObserver.prototype, 'disconnect');
      const { unmount } = renderWithRouter(
        <>
          <Probe />
          <main>
            <Reveal>
              <NavyBlock />
            </Reveal>
          </main>
        </>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'reveal' }));
      await flush();
      expect(liveObservers()).toHaveLength(1);

      // A rebuild is queued for the next frame when the visitor leaves.
      window.dispatchEvent(new Event('resize'));
      unmount();

      expect(liveObservers()).toHaveLength(0);
      expect(disconnectMutations).toHaveBeenCalledTimes(1);

      // Neither that queued rebuild nor a later resize may bring an observer back.
      const created = FakeIntersectionObserver.all.length;
      frames.nextFrame();
      window.dispatchEvent(new Event('resize'));
      frames.nextFrame();
      expect(FakeIntersectionObserver.all).toHaveLength(created);
    });

    it('does not re-scan the page when only text changes, such as a number counting up', async () => {
      // A text node cannot be a dark surface. A counter that sets `textContent`
      // swaps the node for a new one each time it ticks, which the page really does
      // while scrolling, so each swap is a childList mutation.
      function Counter() {
        const target = useRef<HTMLSpanElement>(null);
        const tick = () => {
          if (target.current)
            target.current.textContent = String(Number(target.current.textContent) + 1);
        };
        return (
          <>
            <button type="button" onClick={tick}>
              tick
            </button>
            <span ref={target}>0</span>
          </>
        );
      }
      const scan = vi.spyOn(document, 'querySelectorAll');
      renderWithRouter(
        <>
          <Probe />
          <main>
            <Counter />
            <Reveal label="reveal">
              <NavyBlock />
            </Reveal>
          </main>
        </>,
      );
      await flush();
      scan.mockClear();

      for (let tick = 0; tick < 3; tick++) {
        fireEvent.click(screen.getByRole('button', { name: 'tick' }));
        await flush();
      }
      expect(scan).not.toHaveBeenCalled();

      // Elements still count, so the filter has not made the hook deaf.
      fireEvent.click(screen.getByRole('button', { name: 'reveal' }));
      await flush();
      expect(scan).toHaveBeenCalled();
      expect(watching(screen.getByTestId('navy'))).toHaveLength(1);
    });

    it('does not re-scan the page for changes outside the content area', async () => {
      // The header's own markup changes as it inverts and as its menu opens.
      // Reacting to that would make the hook feed on its own output.
      const scan = vi.spyOn(document, 'querySelectorAll');
      renderWithRouter(
        <>
          <header>
            <Probe />
            <Reveal label="chrome">
              <span />
            </Reveal>
          </header>
          <main>
            <Reveal label="content">
              <NavyBlock />
            </Reveal>
          </main>
        </>,
      );
      await flush();
      scan.mockClear();

      fireEvent.click(screen.getByRole('button', { name: 'chrome' }));
      await flush();
      expect(scan).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'content' }));
      await flush();
      expect(scan).toHaveBeenCalled();
      expect(watching(screen.getByTestId('navy'))).toHaveLength(1);
    });
  });
});
