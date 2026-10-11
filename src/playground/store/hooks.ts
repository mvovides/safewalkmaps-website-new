import { useContext, useMemo } from 'react';

import type { ThemeConfig } from '@/theme/config';

import { StoreContext, type Store } from './context';
import { activeConfig } from './reducer';
import type { PlaygroundUi } from './types';

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
