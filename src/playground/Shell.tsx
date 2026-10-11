import { useMemo } from 'react';

import { Panel } from './panel/Panel';
import type { ApplyPayload } from './protocol';
import { PreviewFrame } from './shell/PreviewFrame';
import { TopBar } from './shell/TopBar';
import { useActiveConfig, usePlaygroundState } from './store/hooks';
import { PlaygroundProvider } from './store/PlaygroundProvider';

function ShellBody() {
  const state = usePlaygroundState();
  const config = useActiveConfig();
  const payload = useMemo<ApplyPayload>(
    () => ({
      config,
      mode: state.ui.mode,
      route: state.ui.route,
      labSection: state.ui.labSection,
      reducedMotion: state.ui.reducedMotion,
    }),
    [config, state.ui.mode, state.ui.route, state.ui.labSection, state.ui.reducedMotion],
  );

  return (
    <div className="pg-shell">
      <TopBar />
      <aside className="pg-panel" aria-label="Theme controls">
        <Panel />
      </aside>
      <section className="pg-previews" aria-label="Preview">
        <PreviewFrame frameId="a" payload={payload} width={state.ui.width} />
      </section>
    </div>
  );
}

export function Shell() {
  return (
    <PlaygroundProvider>
      <ShellBody />
    </PlaygroundProvider>
  );
}
