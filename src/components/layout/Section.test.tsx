import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeading } from './Section';

describe('SectionHeading', () => {
  it('renders an h2 by default', () => {
    render(<SectionHeading title="A heading" />);
    expect(screen.getByRole('heading', { level: 2, name: 'A heading' })).toBeInTheDocument();
  });

  it('renders an h1 when asked', () => {
    render(<SectionHeading as="h1" title="A page title" />);
    expect(screen.getByRole('heading', { level: 1, name: 'A page title' })).toBeInTheDocument();
  });

  it('keeps its styling at h1', () => {
    render(<SectionHeading as="h1" title="Styled" size="lg" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-display-lg');
  });
});
