import { MemoryRouter } from 'react-router-dom';

import { App } from '@/App';

import type { LiveRoute } from '../protocol';

/** The production App, on an in-memory router so navigating inside the frame never leaves the preview. */
export function LiveSite({ route }: { route: LiveRoute }) {
  return (
    <MemoryRouter
      key={route}
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );
}
