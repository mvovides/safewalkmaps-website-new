import { createContext } from 'react';

import type { ThemeConfig } from '@/theme/config';

import type { PlaygroundAction, PlaygroundState } from './types';

export type Store = {
  state: PlaygroundState;
  dispatch: (action: PlaygroundAction) => void;
  builtIns: readonly ThemeConfig[];
};

export const StoreContext = createContext<Store | null>(null);
