import { useState } from 'react';

import { LAB_SECTIONS } from '../lab/labStyles';
import { LIVE_ROUTES, PREVIEW_WIDTHS, type LiveRoute, type PreviewWidth } from '../protocol';
import {
  useActiveConfig,
  useBuiltIns,
  usePlaygroundActions,
  usePlaygroundState,
} from '../store/hooks';
import { hasDraft } from '../store/reducer';

const WIDTH_LABELS: Record<string, string> = {
  '390': 'Phone',
  '768': 'Tablet',
  '1280': 'Desktop',
  fluid: 'Fluid',
};

export type TopBarProps = {
  onExport: () => void;
  onImport: () => void;
};

export function TopBar({ onExport, onImport }: TopBarProps) {
  const state = usePlaygroundState();
  const builtIns = useBuiltIns();
  const active = useActiveConfig();
  const actions = usePlaygroundActions();
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const widths: PreviewWidth[] = [...PREVIEW_WIDTHS, 'fluid'];

  return (
    <header className="pg-topbar">
      <div className="pg-topbar-group">
        <label className="pg-label" htmlFor="pg-preset">
          Preset
        </label>
        <select
          id="pg-preset"
          className="pg-select"
          value={state.activeId}
          onChange={(event) => actions.select(event.target.value)}
        >
          <optgroup label="Built in">
            {builtIns.map((p) => (
              <option key={p.meta.id} value={p.meta.id}>
                {p.meta.name}
              </option>
            ))}
          </optgroup>
          {state.customs.length > 0 && (
            <optgroup label="Mine">
              {state.customs.map((p) => (
                <option key={p.meta.id} value={p.meta.id}>
                  {p.meta.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <span className="pg-active-name" data-testid="active-name">
          {active.meta.name}
        </span>
        {hasDraft(state) && (
          <span className="pg-dot" title="Unsaved changes" aria-label="Unsaved changes" />
        )}
      </div>

      <div className="pg-topbar-group">
        {saving ? (
          <form
            className="pg-inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              actions.saveAs(newName);
              setSaving(false);
            }}
          >
            <input
              className="pg-input"
              aria-label="New preset name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button type="submit" className="pg-button">
              Save
            </button>
            <button type="button" className="pg-button" onClick={() => setSaving(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="pg-button"
            onClick={() => {
              setNewName(`${active.meta.name} (custom)`);
              setSaving(true);
            }}
          >
            Save as
          </button>
        )}
        <button
          type="button"
          className="pg-button"
          onClick={() => actions.resetToBase(state.activeId)}
        >
          Reset
        </button>
        <button type="button" className="pg-button" onClick={onExport}>
          Export
        </button>
        <button type="button" className="pg-button" onClick={onImport}>
          Import
        </button>
      </div>

      <div className="pg-topbar-group" role="group" aria-label="Preview width">
        {widths.map((w) => (
          <button
            key={String(w)}
            type="button"
            className="pg-chip"
            aria-pressed={state.ui.width === w}
            onClick={() => actions.setUi({ width: w })}
          >
            {WIDTH_LABELS[String(w)]}
          </button>
        ))}
      </div>

      <div className="pg-topbar-group" role="group" aria-label="Preview mode">
        <button
          type="button"
          className="pg-chip"
          aria-pressed={state.ui.mode === 'lab'}
          onClick={() => actions.setUi({ mode: 'lab' })}
        >
          Component lab
        </button>
        <button
          type="button"
          className="pg-chip"
          aria-pressed={state.ui.mode === 'live'}
          onClick={() => actions.setUi({ mode: 'live' })}
        >
          Live site
        </button>
        {state.ui.mode === 'live' && (
          <select
            aria-label="Route"
            className="pg-select"
            value={state.ui.route}
            onChange={(event) => actions.setUi({ route: event.target.value as LiveRoute })}
          >
            {LIVE_ROUTES.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>
        )}
        {state.ui.mode === 'lab' && (
          <select
            aria-label="Jump to section"
            className="pg-select"
            value={state.ui.labSection ?? ''}
            onChange={(e) => actions.setUi({ labSection: e.target.value || null })}
          >
            <option value="">Jump to…</option>
            {LAB_SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        )}
      </div>
    </header>
  );
}
