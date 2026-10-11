import type { ThemeConfig } from '@/theme/config';

import type { LiveRoute, PreviewMode, PreviewWidth } from '../protocol';

export type PanelTab =
  'presets' | 'colours' | 'typography' | 'shape' | 'layout' | 'motion' | 'content';

export type PlaygroundUi = {
  width: PreviewWidth;
  mode: PreviewMode;
  route: LiveRoute;
  compareId: string | null;
  panelTab: PanelTab;
  labSection: string | null;
  reducedMotion: boolean;
};

export type PlaygroundState = {
  customs: ThemeConfig[];
  favourites: string[];
  activeId: string;
  /** Unsaved edits to a built-in; only in force while `draft.meta.id === activeId`. */
  draft: ThemeConfig | null;
  ui: PlaygroundUi;
};

export type PlaygroundAction =
  | { type: 'select'; id: string }
  | { type: 'update'; updater: (config: ThemeConfig) => ThemeConfig; now: string }
  | { type: 'saveAs'; name: string; id: string; now: string }
  | { type: 'duplicate'; id: string; newId: string; now: string }
  | { type: 'rename'; id: string; name: string; now: string }
  | { type: 'remove'; id: string }
  | { type: 'toggleFavourite'; id: string }
  | { type: 'resetToBase'; id: string; now: string }
  | { type: 'import'; config: ThemeConfig; id: string; now: string }
  | { type: 'setUi'; ui: Partial<PlaygroundUi> };

export const initialUi: PlaygroundUi = {
  width: 'fluid',
  mode: 'lab',
  route: '/',
  compareId: null,
  panelTab: 'presets',
  labSection: null,
  reducedMotion: false,
};

export const initialState: PlaygroundState = {
  customs: [],
  favourites: [],
  activeId: 'today',
  draft: null,
  ui: initialUi,
};
