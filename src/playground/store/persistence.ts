import type { ThemeConfig } from '@/theme/config';
import { parseThemeConfig } from '@/theme/validate';

import { LIVE_ROUTES, PREVIEW_WIDTHS } from '../protocol';
import { initialState, initialUi, type PlaygroundState, type PlaygroundUi } from './types';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const STORAGE_KEYS = {
  customs: 'swm-playground.v1.customs',
  favourites: 'swm-playground.v1.favourites',
  active: 'swm-playground.v1.active',
  drafts: 'swm-playground.v1.drafts',
  ui: 'swm-playground.v1.ui',
} as const;

/** `window.localStorage`, or null where touching it throws (private mode, blocked storage). */
export function safeLocalStorage(): StorageLike | null {
  try {
    const storage = window.localStorage;
    storage.getItem(STORAGE_KEYS.active);
    return storage;
  } catch {
    return null;
  }
}

function read<T>(storage: StorageLike, key: string): T | undefined {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  return JSON.parse(raw) as T;
}

/** Stored presets are re-validated on the way in; anything that no longer parses is dropped. */
const parseAll = (value: unknown): ThemeConfig[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const result = parseThemeConfig(item);
        return result.ok ? [result.config] : [];
      })
    : [];

/** Drafts are kept only for built-ins that still exist, under the id they were made for. */
function parseDrafts(
  value: unknown,
  builtIns: readonly ThemeConfig[],
): Record<string, ThemeConfig> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const drafts: Record<string, ThemeConfig> = {};
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!builtIns.some((p) => p.meta.id === id)) continue;
    const result = parseThemeConfig(raw);
    if (result.ok && result.config.meta.id === id) drafts[id] = result.config;
  }
  return drafts;
}

function sanitiseUi(value: unknown): PlaygroundUi {
  const ui = { ...initialUi };
  if (typeof value !== 'object' || value === null) return ui;
  const v = value as Partial<Record<keyof PlaygroundUi, unknown>>;
  if (v.width === 'fluid' || (PREVIEW_WIDTHS as readonly number[]).includes(v.width as number)) {
    ui.width = v.width as PlaygroundUi['width'];
  }
  if (v.mode === 'lab' || v.mode === 'live') ui.mode = v.mode;
  if ((LIVE_ROUTES as readonly string[]).includes(v.route as string)) {
    ui.route = v.route as PlaygroundUi['route'];
  }
  if (typeof v.compareId === 'string') ui.compareId = v.compareId;
  if (typeof v.panelTab === 'string') ui.panelTab = v.panelTab as PlaygroundUi['panelTab'];
  if (typeof v.labSection === 'string') ui.labSection = v.labSection;
  if (typeof v.reducedMotion === 'boolean') ui.reducedMotion = v.reducedMotion;
  return ui;
}

export function loadState(
  storage: StorageLike | null,
  builtIns: readonly ThemeConfig[],
): PlaygroundState {
  if (!storage) return initialState;
  try {
    const customs = parseAll(read(storage, STORAGE_KEYS.customs));
    const favouritesRaw = read<unknown>(storage, STORAGE_KEYS.favourites);
    const favourites = Array.isArray(favouritesRaw)
      ? favouritesRaw.filter((x): x is string => typeof x === 'string')
      : [];
    const drafts = parseDrafts(read(storage, STORAGE_KEYS.drafts), builtIns);
    const activeRaw = read<unknown>(storage, STORAGE_KEYS.active);
    const known = (id: unknown) =>
      typeof id === 'string' &&
      (customs.some((c) => c.meta.id === id) || builtIns.some((p) => p.meta.id === id));
    const activeId = known(activeRaw) ? (activeRaw as string) : initialState.activeId;
    const ui = sanitiseUi(read(storage, STORAGE_KEYS.ui));
    if (ui.compareId && !known(ui.compareId)) ui.compareId = null;
    return { customs, favourites, activeId, drafts, ui };
  } catch {
    return initialState;
  }
}

export function saveState(storage: StorageLike | null, state: PlaygroundState): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.customs, JSON.stringify(state.customs));
    storage.setItem(STORAGE_KEYS.favourites, JSON.stringify(state.favourites));
    storage.setItem(STORAGE_KEYS.active, JSON.stringify(state.activeId));
    storage.setItem(STORAGE_KEYS.drafts, JSON.stringify(state.drafts));
    storage.setItem(STORAGE_KEYS.ui, JSON.stringify(state.ui));
  } catch {
    // Storage is full or blocked; the session carries on in memory.
  }
}
