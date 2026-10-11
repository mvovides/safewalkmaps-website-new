import { useCallback, useMemo, useState } from 'react';

import { Panel } from './panel/Panel';
import type { ApplyPayload } from './protocol';
import { ExportDrawer } from './shell/ExportDrawer';
import { ImportDialog } from './shell/ImportDialog';
import { PreviewFrame } from './shell/PreviewFrame';
import { TopBar } from './shell/TopBar';
import { useActiveConfig, useBuiltIns, usePlaygroundState } from './store/hooks';
import { PlaygroundProvider } from './store/PlaygroundProvider';
import { findPreset } from './store/reducer';

type Dialog = 'export' | 'import' | null;

function ShellBody() {
  const state = usePlaygroundState();
  const builtIns = useBuiltIns();
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

  // Compare mode: a second frame on the chosen preset, with scroll mirrored both ways.
  const compare = state.ui.compareId ? findPreset(state, builtIns, state.ui.compareId) : undefined;
  const comparePayload = useMemo<ApplyPayload | null>(
    () => (compare ? { ...payload, config: compare } : null),
    [compare, payload],
  );
  const [mirror, setMirror] = useState<{ a: number | null; b: number | null }>({
    a: null,
    b: null,
  });
  const onScrollA = useCallback(
    (fraction: number) => setMirror((m) => ({ ...m, b: fraction })),
    [],
  );
  const onScrollB = useCallback(
    (fraction: number) => setMirror((m) => ({ ...m, a: fraction })),
    [],
  );

  return (
    <div className="pg-shell">
      <TopBar onExport={() => setDialog('export')} onImport={() => setDialog('import')} />
      <aside className="pg-panel" aria-label="Theme controls">
        <Panel />
      </aside>
      <section className="pg-previews" aria-label="Preview">
        <PreviewFrame
          frameId="a"
          payload={payload}
          width={state.ui.width}
          onScroll={comparePayload ? onScrollA : undefined}
          scrollTo={mirror.a}
        />
        {comparePayload && (
          <PreviewFrame
            frameId="b"
            payload={comparePayload}
            width={state.ui.width}
            onScroll={onScrollB}
            scrollTo={mirror.b}
          />
        )}
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
