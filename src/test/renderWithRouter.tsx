import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Keep in step with the `future` prop on the BrowserRouter in src/main.tsx.
 *
 * These are not boilerplate to strip. The app ships with both flags on, so
 * tests must run under the same router semantics, and leaving them off prints
 * a React Router warning on every render.
 */
const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

type RenderWithRouterOptions = {
  /** Locations the in-memory history starts with; the last one is current. */
  initialEntries?: string[];
};

/** Renders `ui` inside a MemoryRouter configured the way the app's router is. */
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'] }: RenderWithRouterOptions = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries} future={FUTURE_FLAGS}>
      {ui}
    </MemoryRouter>,
  );
}
