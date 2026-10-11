import { useState } from 'react';

import type { ThemeConfig } from '@/theme/config';

import { useBuiltIns, usePlaygroundActions, usePlaygroundState } from '../store/hooks';

function PresetRow({
  preset,
  active,
  favourite,
  draft,
}: {
  preset: ThemeConfig;
  active: boolean;
  favourite: boolean;
  draft: boolean;
}) {
  const actions = usePlaygroundActions();
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(preset.meta.name);
  const label = preset.meta.name;

  return (
    <li className="pg-preset" data-active={active}>
      <button
        type="button"
        className="pg-preset-select"
        aria-label={`Select ${label}`}
        aria-pressed={active}
        onClick={() => actions.select(preset.meta.id)}
      >
        <span className="pg-preset-name">
          {label}
          {draft && <span className="pg-dot" title="Unsaved changes" />}
        </span>
        <span className="pg-preset-desc">{preset.meta.description}</span>
      </button>
      <div className="pg-preset-actions">
        <button
          type="button"
          className="pg-icon-button"
          aria-label={`${favourite ? 'Unfavourite' : 'Favourite'} ${label}`}
          aria-pressed={favourite}
          onClick={() => actions.toggleFavourite(preset.meta.id)}
        >
          {favourite ? '★' : '☆'}
        </button>
        <button
          type="button"
          className="pg-icon-button"
          aria-label={`Duplicate ${label}`}
          onClick={() => actions.duplicate(preset.meta.id)}
        >
          ⧉
        </button>
        <button
          type="button"
          className="pg-icon-button"
          aria-label={`Reset ${label} to its base`}
          onClick={() => actions.resetToBase(preset.meta.id)}
        >
          ↺
        </button>
        {!preset.meta.builtIn && (
          <>
            <button
              type="button"
              className="pg-icon-button"
              aria-label={`Rename ${label}`}
              onClick={() => setRenaming((v) => !v)}
            >
              ✎
            </button>
            <button
              type="button"
              className="pg-icon-button"
              aria-label={`Delete ${label}`}
              onClick={() => setConfirming(true)}
            >
              🗑
            </button>
          </>
        )}
      </div>
      {renaming && (
        <form
          className="pg-inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            actions.rename(preset.meta.id, name);
            setRenaming(false);
          }}
        >
          <input
            className="pg-input"
            aria-label={`New name for ${label}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="pg-button">
            Rename
          </button>
        </form>
      )}
      {confirming && (
        <div className="pg-inline-form" role="group" aria-label={`Delete ${label}?`}>
          <span className="pg-hint">Delete “{label}”? This cannot be undone.</span>
          <button
            type="button"
            className="pg-button pg-button-danger"
            aria-label={`Confirm delete ${label}`}
            onClick={() => actions.remove(preset.meta.id)}
          >
            Delete
          </button>
          <button type="button" className="pg-button" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}

export function PresetsTab() {
  const state = usePlaygroundState();
  const builtIns = useBuiltIns();
  const [query, setQuery] = useState('');
  const [onlyFavourites, setOnlyFavourites] = useState(false);

  const matches = (p: ThemeConfig) =>
    (!onlyFavourites || state.favourites.includes(p.meta.id)) &&
    `${p.meta.name} ${p.meta.description}`.toLowerCase().includes(query.trim().toLowerCase());
  const row = (p: ThemeConfig) => (
    <PresetRow
      key={p.meta.id}
      preset={p}
      active={p.meta.id === state.activeId}
      favourite={state.favourites.includes(p.meta.id)}
      draft={state.draft?.meta.id === p.meta.id}
    />
  );
  const customs = state.customs.filter(matches);

  return (
    <div className="pg-stack">
      <div className="pg-field">
        <input
          className="pg-input"
          type="search"
          aria-label="Search presets"
          placeholder="Search presets"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="pg-hint">
          <input
            type="checkbox"
            checked={onlyFavourites}
            onChange={(e) => setOnlyFavourites(e.target.checked)}
          />{' '}
          Favourites only
        </label>
      </div>
      <ul className="pg-preset-list" aria-label="Built-in presets">
        {builtIns.filter(matches).map(row)}
      </ul>
      {customs.length > 0 && (
        <ul className="pg-preset-list" aria-label="My presets">
          {customs.map(row)}
        </ul>
      )}
      <p className="pg-hint">
        Built-in presets are read-only. Editing one creates a draft; use “Save as” in the top bar to
        keep it.
      </p>
    </div>
  );
}
