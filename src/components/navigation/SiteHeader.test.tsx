import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { navLinks } from '@/data/navigation';
import { renderWithRouter } from '@/test/renderWithRouter';

import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('renders every nav link as a real path', () => {
    renderWithRouter(<SiteHeader />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.path,
      );
    }
  });

  it('marks the current route as current', () => {
    renderWithRouter(<SiteHeader />, { initialEntries: ['/features'] });
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Features' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks nothing current on the home page', () => {
    renderWithRouter(<SiteHeader />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const link of navLinks) {
      expect(within(nav).getByRole('link', { name: link.label })).not.toHaveAttribute(
        'aria-current',
      );
    }
  });

  it('points the waitlist button at the home page anchor from a sub-page', () => {
    renderWithRouter(<SiteHeader />, { initialEntries: ['/features'] });
    expect(screen.getAllByRole('link', { name: /join waitlist/i })[0]).toHaveAttribute(
      'href',
      '/#waitlist',
    );
  });
});

/**
 * jsdom has no layout engine and does not load fonts, so these tests cannot say
 * how wide the indicator really is. What they can pin down is the trigger: that
 * the header measures again once `document.fonts.ready` resolves, using whatever
 * the nav items measure at that moment. The real widths — the bug was an
 * indicator 111px wide under a 119px item — need a browser to check.
 */
describe('SiteHeader indicator and web fonts', () => {
  type Box = { left: number; width: number };

  /** Stands in for the layout engine: what each nav item "measures" right now. */
  function stubLayout(boxes: Record<string, Box>) {
    const reads: string[] = [];
    const boxOf = (element: HTMLElement) => {
      const path = element.dataset.path;
      if (path) reads.push(path);
      return path ? boxes[path] : undefined;
    };
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return boxOf(this)?.left ?? 0;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return boxOf(this)?.width ?? 0;
    });
    return { boxes, reads };
  }

  /** Installs a fake `document.fonts` whose `ready` the test resolves by hand. */
  function stubFonts() {
    let loaded!: () => void;
    const ready = new Promise<void>((resolve) => {
      loaded = resolve;
    });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready } });
    return { load: () => act(async () => loaded()) };
  }

  /** Reads the box the indicator is currently drawn at back out of its transform. */
  function drawnIndicator(): Box {
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const bar = nav.querySelector<HTMLElement>('span[aria-hidden="true"]');
    const drawn = /translate3d\(([\d.]+)px, 0, 0\) scaleX\(([\d.]+)\)/.exec(
      bar?.style.transform ?? '',
    );
    if (!bar || !drawn) throw new Error('the indicator has no box to read');
    // Dividing by the base width and multiplying back leaves float dust (110 comes
    // out as 110.00000000000001), so round it away.
    const width = Number(drawn[2]) * parseFloat(bar.style.width);
    return { left: Number(drawn[1]), width: Math.round(width * 1000) / 1000 };
  }

  afterEach(() => {
    Reflect.deleteProperty(document, 'fonts');
  });

  it('measures the active item again once the web font has loaded', async () => {
    // First paint is in the fallback face, which is narrower. The web font then
    // widens this item and pushes it right.
    const { boxes } = stubLayout({ '/features': { left: 40, width: 110 } });
    const fonts = stubFonts();

    renderWithRouter(<SiteHeader />, { initialEntries: ['/features'] });
    expect(drawnIndicator()).toEqual({ left: 40, width: 110 });

    boxes['/features'] = { left: 52, width: 120 };
    await fonts.load();

    expect(drawnIndicator()).toEqual({ left: 52, width: 120 });
  });

  it('still renders and measures where the browser has no document.fonts', () => {
    stubLayout({ '/features': { left: 40, width: 110 } });
    Object.defineProperty(document, 'fonts', { configurable: true, value: undefined });

    expect(() => renderWithRouter(<SiteHeader />, { initialEntries: ['/features'] })).not.toThrow();
    expect(drawnIndicator()).toEqual({ left: 40, width: 110 });
  });

  it('does not measure a route the visitor left while the font was loading', async () => {
    const { reads } = stubLayout({
      '/features': { left: 40, width: 110 },
      '/about': { left: 160, width: 70 },
    });
    const fonts = stubFonts();

    renderWithRouter(<SiteHeader />, { initialEntries: ['/features'] });
    const about = within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', {
      name: 'About',
    });
    fireEvent.click(about);
    expect(about).toHaveAttribute('aria-current', 'page');
    reads.length = 0;

    await fonts.load();

    // The pending measurement for /features belongs to a closure the navigation
    // replaced. Only the current route's item should be read.
    expect(reads).toContain('/about');
    expect(reads).not.toContain('/features');
  });
});
