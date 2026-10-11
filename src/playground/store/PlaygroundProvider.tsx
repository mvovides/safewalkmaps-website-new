import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { ThemeConfig } from '@/theme/config';
import { builtInPresets } from '@/theme/presets';

import { loadState, safeLocalStorage, saveState, type StorageLike } from './persistence';
import { activeConfig, createReducer } from './reducer';
import type { PlaygroundAction, PlaygroundState, PlaygroundUi } from './types';

type Store = {
  state: PlaygroundState;
  dispatch: (action: PlaygroundAction) => void;
  builtIns: readonly ThemeConfig[];
};

const StoreContext = createContext<Store | null>(null);

export type PlaygroundProviderProps = {
  children: ReactNode;
  builtIns?: readonly ThemeConfig[];
  /** Injected in tests; defaults to localStorage when it is usable. */
  storage?: StorageLike | null;
};

export function PlaygroundProvider({
  children,
  builtIns = builtInPresets,
  storage,
}: PlaygroundProviderProps) {
  const store = useMemo(() => (storage === undefined ? safeLocalStorage() : storage), [storage]);
  const reducer = useMemo(() => createReducer(builtIns), [builtIns]);
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState(store, builtIns));

  useEffect(() => {
    saveState(store, state);
  }, [store, state]);

  const value = useMemo(() => ({ state, dispatch, builtIns }), [state, builtIns]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('usePlayground* must be used inside <PlaygroundProvider>');
  return store;
}

export const usePlaygroundState = () => useStore().state;
export const useBuiltIns = () => useStore().builtIns;

export function useActiveConfig(): ThemeConfig {
  const { state, builtIns } = useStore();
  return activeConfig(state, builtIns);
}

const newId = () => `custom-${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

/** Action creators that supply ids and timestamps, so the reducer stays pure. */
export function usePlaygroundActions() {
  const { dispatch } = useStore();
  return useMemo(
    () => ({
      select: (id: string) => dispatch({ type: 'select', id }),
      update: (updater: (config: ThemeConfig) => ThemeConfig) =>
        dispatch({ type: 'update', updater, now: now() }),
      saveAs: (name: string) => dispatch({ type: 'saveAs', name, id: newId(), now: now() }),
      duplicate: (id: string) => dispatch({ type: 'duplicate', id, newId: newId(), now: now() }),
      rename: (id: string, name: string) => dispatch({ type: 'rename', id, name, now: now() }),
      remove: (id: string) => dispatch({ type: 'remove', id }),
      toggleFavourite: (id: string) => dispatch({ type: 'toggleFavourite', id }),
      resetToBase: (id: string) => dispatch({ type: 'resetToBase', id, now: now() }),
      importConfig: (config: ThemeConfig) =>
        dispatch({ type: 'import', config, id: newId(), now: now() }),
      setUi: (ui: Partial<PlaygroundUi>) => dispatch({ type: 'setUi', ui }),
    }),
    [dispatch],
  );
}
