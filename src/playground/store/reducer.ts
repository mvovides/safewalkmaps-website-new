import type { ThemeConfig } from '@/theme/config';

import type { PlaygroundAction, PlaygroundState } from './types';

type BuiltIns = readonly ThemeConfig[];

export const isBuiltInId = (builtIns: BuiltIns, id: string) =>
  builtIns.some((p) => p.meta.id === id);

export function findPreset(
  state: PlaygroundState,
  builtIns: BuiltIns,
  id: string,
): ThemeConfig | undefined {
  return state.customs.find((p) => p.meta.id === id) ?? builtIns.find((p) => p.meta.id === id);
}

/** Whether the active built-in carries unsaved edits. */
export const hasDraft = (state: PlaygroundState) => state.activeId in state.drafts;

/** What the preview should show: the draft when one exists, else the stored preset, else `today`. */
export function activeConfig(state: PlaygroundState, builtIns: BuiltIns): ThemeConfig {
  return (
    state.drafts[state.activeId] ??
    findPreset(state, builtIns, state.activeId) ??
    (builtIns[0] as ThemeConfig)
  );
}

const touch = (config: ThemeConfig, now: string): ThemeConfig => ({
  ...config,
  meta: { ...config.meta, updatedAt: now },
});

/** Everything except identity: what "reset to base" copies across. */
const body = (c: ThemeConfig) => ({
  tokens: c.tokens,
  components: c.components,
  layout: c.layout,
  motion: c.motion,
  content: c.content,
});

const withoutDraft = (drafts: Record<string, ThemeConfig>, id: string) => {
  if (!(id in drafts)) return drafts;
  const next = { ...drafts };
  delete next[id];
  return next;
};

/**
 * The reducer is pure: ids and timestamps arrive on the action, supplied by the
 * provider's action creators, so every transition can be tested exactly.
 */
export function createReducer(builtIns: BuiltIns) {
  const today = builtIns[0] as ThemeConfig;

  return function reduce(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
    switch (action.type) {
      case 'select':
        return { ...state, activeId: action.id };

      case 'update': {
        const current = activeConfig(state, builtIns);
        const isCustom = state.customs.some((c) => c.meta.id === state.activeId);
        if (isCustom) {
          return {
            ...state,
            customs: state.customs.map((c) =>
              c.meta.id === state.activeId ? touch(action.updater(c), action.now) : c,
            ),
          };
        }
        const next = action.updater(current);
        return {
          ...state,
          drafts: {
            ...state.drafts,
            [state.activeId]: { ...next, meta: { ...current.meta, updatedAt: action.now } },
          },
        };
      }

      case 'saveAs': {
        const current = activeConfig(state, builtIns);
        const basedOn = isBuiltInId(builtIns, state.activeId)
          ? state.activeId
          : current.meta.basedOn;
        const custom: ThemeConfig = {
          ...current,
          meta: {
            ...current.meta,
            id: action.id,
            name: action.name.trim() || current.meta.name,
            builtIn: false,
            basedOn,
            favourite: false,
            createdAt: action.now,
            updatedAt: action.now,
          },
        };
        return {
          ...state,
          customs: [...state.customs, custom],
          drafts: withoutDraft(state.drafts, state.activeId),
          activeId: action.id,
        };
      }

      case 'duplicate': {
        const source =
          action.id === state.activeId
            ? activeConfig(state, builtIns)
            : findPreset(state, builtIns, action.id);
        if (!source) return state;
        const custom: ThemeConfig = {
          ...source,
          meta: {
            ...source.meta,
            id: action.newId,
            name: `${source.meta.name} copy`,
            builtIn: false,
            basedOn: source.meta.builtIn ? source.meta.id : source.meta.basedOn,
            favourite: false,
            createdAt: action.now,
            updatedAt: action.now,
          },
        };
        return { ...state, customs: [...state.customs, custom], activeId: action.newId };
      }

      case 'rename': {
        const name = action.name.trim();
        if (!name || !state.customs.some((c) => c.meta.id === action.id)) return state;
        return {
          ...state,
          customs: state.customs.map((c) =>
            c.meta.id === action.id
              ? { ...c, meta: { ...c.meta, name, updatedAt: action.now } }
              : c,
          ),
        };
      }

      case 'remove': {
        if (!state.customs.some((c) => c.meta.id === action.id)) return state;
        return {
          ...state,
          customs: state.customs.filter((c) => c.meta.id !== action.id),
          favourites: state.favourites.filter((id) => id !== action.id),
          activeId: state.activeId === action.id ? today.meta.id : state.activeId,
          ui: {
            ...state.ui,
            compareId: state.ui.compareId === action.id ? null : state.ui.compareId,
          },
        };
      }

      case 'toggleFavourite': {
        const on = !state.favourites.includes(action.id);
        return {
          ...state,
          favourites: on
            ? [...state.favourites, action.id]
            : state.favourites.filter((id) => id !== action.id),
          customs: state.customs.map((c) =>
            c.meta.id === action.id ? { ...c, meta: { ...c.meta, favourite: on } } : c,
          ),
        };
      }

      case 'resetToBase': {
        if (isBuiltInId(builtIns, action.id)) {
          return { ...state, drafts: withoutDraft(state.drafts, action.id) };
        }
        const custom = state.customs.find((c) => c.meta.id === action.id);
        if (!custom) return state;
        const base = builtIns.find((p) => p.meta.id === custom.meta.basedOn) ?? today;
        return {
          ...state,
          customs: state.customs.map((c) =>
            c.meta.id === action.id
              ? { ...c, ...body(base), meta: { ...c.meta, updatedAt: action.now } }
              : c,
          ),
        };
      }

      case 'import': {
        const custom: ThemeConfig = {
          ...action.config,
          meta: {
            ...action.config.meta,
            id: action.id,
            builtIn: false,
            basedOn: action.config.meta.builtIn
              ? action.config.meta.id
              : action.config.meta.basedOn,
            createdAt: action.now,
            updatedAt: action.now,
          },
        };
        return { ...state, customs: [...state.customs, custom], activeId: action.id };
      }

      case 'setUi':
        return { ...state, ui: { ...state.ui, ...action.ui } };

      default:
        return state;
    }
  };
}
