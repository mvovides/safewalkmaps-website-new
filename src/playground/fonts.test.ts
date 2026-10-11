import { describe, expect, it } from 'vitest';

import { defaultTokens } from '@/theme/tokens';

import { ensureFontLoaded, findFontOption, fontOptions } from './fonts';

describe('fonts', () => {
  it('matches a stack to its option by first family', () => {
    expect(findFontOption("'Manrope', sans-serif")?.id).toBe('manrope');
    expect(findFontOption(defaultTokens.typography.sans)?.id).toBe('inter');
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
    ensureFontLoaded(doc, null);
    expect(doc.querySelectorAll('link')).toHaveLength(0);
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
