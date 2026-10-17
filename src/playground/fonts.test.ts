import { describe, expect, it } from 'vitest';

import { defaultTokens, FONT_STACKS } from '@/theme/tokens';

import { ensureFontLoaded, findFontOption, fontOptions } from './fonts';

describe('fonts', () => {
  it('matches a stack to its option by first family', () => {
    expect(findFontOption("'Manrope', sans-serif")?.id).toBe('manrope');
    expect(findFontOption(defaultTokens.typography.sans)?.id).toBe('instrument-sans');
    expect(findFontOption(FONT_STACKS.inter)?.id).toBe('inter');
    expect(findFontOption("'Inter', sans-serif")?.id).toBe('inter');
    expect(findFontOption("'Comic Neue', cursive")).toBeUndefined();
  });

  it('injects a Google Fonts link once for a hosted family', () => {
    const doc = document.implementation.createHTMLDocument('x');
    ensureFontLoaded(doc, "'Manrope', sans-serif");
    ensureFontLoaded(doc, "'Manrope', sans-serif");
    const links = doc.querySelectorAll('link[rel="stylesheet"]');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('href')).toMatch(/fonts\.googleapis\.com\/css2\?family=Manrope/);
  });

  it('ignores stacks with no matching option and bundled families', () => {
    const doc = document.implementation.createHTMLDocument('x');
    ensureFontLoaded(doc, "'Comic Neue', cursive");
    ensureFontLoaded(doc, defaultTokens.typography.sans);
    ensureFontLoaded(doc, FONT_STACKS.inter);
    ensureFontLoaded(doc, null);
    expect(doc.querySelectorAll('link')).toHaveLength(0);
  });

  it('still fetches a bundled family for a stack that names it plainly', () => {
    const doc = document.implementation.createHTMLDocument('x');
    ensureFontLoaded(doc, "'Instrument Sans', 'Inter Variable', Inter, system-ui, sans-serif");
    expect(doc.querySelector('link')?.getAttribute('href')).toMatch(/family=Instrument\+Sans/);
  });

  it('every hosted option has a css2 URL with display=swap', () => {
    for (const option of fontOptions) {
      if (option.googleCss) {
        expect(option.googleCss).toMatch(
          /^https:\/\/fonts\.googleapis\.com\/css2\?family=.+&display=swap$/,
        );
      }
    }
  });
});
