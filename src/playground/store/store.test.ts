import { describe, expect, it } from 'vitest';

import type { ThemeConfig } from '@/theme/config';
import { todayPreset } from '@/theme/presets/today';

import { loadState, saveState, type StorageLike } from './persistence';
import { activeConfig, createReducer, findPreset, hasDraft } from './reducer';
import { initialState, type PlaygroundState } from './types';

const alt: ThemeConfig = {
  ...todayPreset,
  meta: { ...todayPreset.meta, id: 'alt', name: 'Alt' },
  components: { ...todayPreset.components, nav: { style: 'solid' } },
};
const builtIns = [todayPreset, alt];
const reduce = createReducer(builtIns);
const NOW = '2026-10-11T10:00:00.000Z';
const setNav = (style: ThemeConfig['components']['nav']['style']) => (config: ThemeConfig) => ({
  ...config,
  components: { ...config.components, nav: { style } },
});

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('reducer', () => {
  it('editing a built-in creates a draft and leaves the built-in alone', () => {
    const state = reduce(initialState, { type: 'update', updater: setNav('dark'), now: NOW });
    expect(hasDraft(state)).toBe(true);
    expect(activeConfig(state, builtIns).components.nav.style).toBe('dark');
    expect(todayPreset.components.nav.style).toBe('glass');
    expect(state.draft?.meta.updatedAt).toBe(NOW);
  });

  it('saveAs turns the draft into a custom based on the built-in and selects it', () => {
    let state = reduce(initialState, { type: 'update', updater: setNav('dark'), now: NOW });
    state = reduce(state, { type: 'saveAs', name: 'Mine', id: 'custom-abc12345', now: NOW });
    expect(state.customs).toHaveLength(1);
    expect(state.customs[0]?.meta).toMatchObject({
      id: 'custom-abc12345',
      name: 'Mine',
      builtIn: false,
      basedOn: 'today',
    });
    expect(state.activeId).toBe('custom-abc12345');
    expect(hasDraft(state)).toBe(false);
    expect(activeConfig(state, builtIns).components.nav.style).toBe('dark');
  });

  it('editing a custom writes to it directly', () => {
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, {
      type: 'update',
      updater: setNav('minimal'),
      now: '2026-10-11T11:00:00.000Z',
    });
    expect(state.customs[0]?.components.nav.style).toBe('minimal');
    expect(state.customs[0]?.meta.updatedAt).toBe('2026-10-11T11:00:00.000Z');
    expect(state.draft).toBeNull();
  });

  it('duplicate copies a preset under a new id and name', () => {
    const state = reduce(initialState, {
      type: 'duplicate',
      id: 'alt',
      newId: 'custom-2',
      now: NOW,
    });
    expect(state.customs[0]?.meta).toMatchObject({
      id: 'custom-2',
      name: 'Alt copy',
      basedOn: 'alt',
      builtIn: false,
    });
    expect(state.customs[0]?.components.nav.style).toBe('solid');
    expect(state.activeId).toBe('custom-2');
  });

  it('rename changes a custom name and ignores blanks and built-ins', () => {
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'rename', id: 'custom-1', name: '  Night  ', now: NOW });
    expect(state.customs[0]?.meta.name).toBe('Night');
    state = reduce(state, { type: 'rename', id: 'custom-1', name: '   ', now: NOW });
    expect(state.customs[0]?.meta.name).toBe('Night');
    expect(reduce(state, { type: 'rename', id: 'today', name: 'X', now: NOW })).toBe(state);
  });

  it('remove deletes a custom and falls back to today when it was active', () => {
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'toggleFavourite', id: 'custom-1' });
    state = reduce(state, { type: 'setUi', ui: { compareId: 'custom-1' } });
    state = reduce(state, { type: 'remove', id: 'custom-1' });
    expect(state.customs).toHaveLength(0);
    expect(state.favourites).toEqual([]);
    expect(state.activeId).toBe('today');
    expect(state.ui.compareId).toBeNull();
  });

  it('toggleFavourite flips the flag and mirrors it onto customs', () => {
    let state = reduce(initialState, { type: 'toggleFavourite', id: 'alt' });
    expect(state.favourites).toEqual(['alt']);
    state = reduce(state, { type: 'toggleFavourite', id: 'alt' });
    expect(state.favourites).toEqual([]);
    state = reduce(state, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'toggleFavourite', id: 'custom-1' });
    expect(state.customs[0]?.meta.favourite).toBe(true);
  });

  it('resetToBase drops a draft, or restores a custom from its base', () => {
    let state = reduce(initialState, { type: 'update', updater: setNav('dark'), now: NOW });
    state = reduce(state, { type: 'resetToBase', id: 'today', now: NOW });
    expect(hasDraft(state)).toBe(false);

    state = reduce(state, { type: 'duplicate', id: 'alt', newId: 'custom-3', now: NOW });
    state = reduce(state, { type: 'update', updater: setNav('dark'), now: NOW });
    state = reduce(state, { type: 'resetToBase', id: 'custom-3', now: NOW });
    expect(state.customs[0]?.components.nav.style).toBe('solid');
    expect(state.customs[0]?.meta.name).toBe('Alt copy');
  });

  it('resetToBase falls back to today when basedOn is unknown', () => {
    const orphan: ThemeConfig = {
      ...alt,
      meta: { ...alt.meta, id: 'custom-9', builtIn: false, basedOn: 'gone' },
    };
    const state: PlaygroundState = { ...initialState, customs: [orphan], activeId: 'custom-9' };
    const next = reduce(state, { type: 'resetToBase', id: 'custom-9', now: NOW });
    expect(next.customs[0]?.components.nav.style).toBe('glass');
  });

  it('import adds a custom with a fresh id and selects it', () => {
    const state = reduce(initialState, { type: 'import', config: alt, id: 'custom-7', now: NOW });
    expect(state.customs[0]?.meta).toMatchObject({
      id: 'custom-7',
      builtIn: false,
      basedOn: 'alt',
      createdAt: NOW,
    });
    expect(state.activeId).toBe('custom-7');
  });

  it('findPreset prefers customs and falls back to built-ins', () => {
    const state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    expect(findPreset(state, builtIns, 'custom-1')?.meta.name).toBe('Mine');
    expect(findPreset(state, builtIns, 'alt')?.meta.name).toBe('Alt');
    expect(findPreset(state, builtIns, 'nope')).toBeUndefined();
    expect(activeConfig({ ...state, activeId: 'nope' }, builtIns).meta.id).toBe('today');
  });
});

describe('persistence', () => {
  it('round-trips through storage', () => {
    const storage = memoryStorage();
    let state = reduce(initialState, { type: 'saveAs', name: 'Mine', id: 'custom-1', now: NOW });
    state = reduce(state, { type: 'toggleFavourite', id: 'custom-1' });
    state = reduce(state, { type: 'setUi', ui: { width: 390, mode: 'live' } });
    state = reduce(state, { type: 'select', id: 'today' });
    state = reduce(state, { type: 'update', updater: setNav('dark'), now: NOW });
    saveState(storage, state);
    expect(loadState(storage, builtIns)).toEqual(state);
  });

  it('drops customs that no longer parse and resets a missing active id', () => {
    const storage = memoryStorage();
    storage.setItem(
      'swm-playground.v1.customs',
      JSON.stringify([{ schemaVersion: 1, meta: { id: 'bad' } }]),
    );
    storage.setItem('swm-playground.v1.active', JSON.stringify('bad'));
    const state = loadState(storage, builtIns);
    expect(state.customs).toEqual([]);
    expect(state.activeId).toBe('today');
  });

  it('falls back to memory when storage throws or is missing', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadState(broken, builtIns)).toEqual(initialState);
    expect(() => saveState(broken, initialState)).not.toThrow();
    expect(loadState(null, builtIns)).toEqual(initialState);
  });
});
