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
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [newName, setNewName] = useState('');
  const widths: PreviewWidth[] = [...PREVIEW_WIDTHS, 'fluid'];
  const activeIsCustom = state.customs.some((c) => c.meta.id === state.activeId);

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
        {confirmingReset ? (
          <div className="pg-inline-form" role="group" aria-label="Reset this preset?">
            <span className="pg-hint">
              Reset “{active.meta.name}” to its base? Saved edits are lost.
            </span>
            <button
              type="button"
              className="pg-button pg-button-danger"
              aria-label="Confirm reset"
              onClick={() => {
                actions.resetToBase(state.activeId);
                setConfirmingReset(false);
              }}
            >
              Reset
            </button>
            <button type="button" className="pg-button" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="pg-button"
            // A built-in only drops its draft; a custom loses saved edits, so it asks first.
            onClick={() =>
              activeIsCustom ? setConfirmingReset(true) : actions.resetToBase(state.activeId)
            }
          >
            Reset
          </button>
        )}
        <button type="button" className="pg-button" onClick={onExport}>
          Export
        </button>
        <button type="button" className="pg-button" onClick={onImport}>
          Import
        </button>
      </div>

      <div className="pg-topbar-group">
        <button
          type="button"
          className="pg-chip"
          aria-pressed={state.ui.compareId !== null}
          onClick={() =>
            actions.setUi({
              compareId: state.ui.compareId
                ? null
                : (builtIns.find((p) => p.meta.id !== state.activeId)?.meta.id ?? null),
            })
          }
        >
          Compare
        </button>
        {state.ui.compareId !== null && (
          <select
            aria-label="Compare with"
            className="pg-select"
            value={state.ui.compareId}
            onChange={(e) => actions.setUi({ compareId: e.target.value })}
          >
            {[...builtIns, ...state.customs].map((p) => (
              <option key={p.meta.id} value={p.meta.id}>
                {p.meta.name}
              </option>
            ))}
          </select>
        )}
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
