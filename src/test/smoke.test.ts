import { describe, expect, it } from 'vitest';

import { siteConfig } from '@/lib/config';

describe('test harness', () => {
  it('resolves the @ alias', () => {
    expect(siteConfig.name).toBe('SafeWalkMaps');
  });

  it('provides a jsdom document', () => {
    expect(document.body).toBeInTheDocument();
  });
});
