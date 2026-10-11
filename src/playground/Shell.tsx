import { useMemo, useState } from 'react';

import { Panel } from './panel/Panel';
import type { ApplyPayload } from './protocol';
import { ExportDrawer } from './shell/ExportDrawer';
import { ImportDialog } from './shell/ImportDialog';
import { PreviewFrame } from './shell/PreviewFrame';
import { TopBar } from './shell/TopBar';
import { useActiveConfig, usePlaygroundState } from './store/hooks';
import { PlaygroundProvider } from './store/PlaygroundProvider';

type Dialog = 'export' | 'import' | null;

function ShellBody() {
  const state = usePlaygroundState();
  const config = useActiveConfig();
  const [dialog, setDialog] = useState<Dialog>(null);
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
      <TopBar onExport={() => setDialog('export')} onImport={() => setDialog('import')} />
      <aside className="pg-panel" aria-label="Theme controls">
        <Panel />
      </aside>
      <section className="pg-previews" aria-label="Preview">
        <PreviewFrame frameId="a" payload={payload} width={state.ui.width} />
      </section>
      <ExportDrawer open={dialog === 'export'} onClose={() => setDialog(null)} />
      <ImportDialog open={dialog === 'import'} onClose={() => setDialog(null)} />
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
