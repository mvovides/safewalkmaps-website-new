import { useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { ThemeConfig } from '@/theme/config';
import { builtInPresets } from '@/theme/presets';

import { StoreContext } from './context';
import { loadState, safeLocalStorage, saveState, type StorageLike } from './persistence';
import { createReducer } from './reducer';

export type PlaygroundProviderProps = {
  children: ReactNode;
  builtIns?: readonly ThemeConfig[];
  /** Injected in tests; defaults to localStorage when it is usable. */
  storage?: StorageLike | null;
};

/** Owns the playground state and persists it on every change. Hooks live in ./hooks. */
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
