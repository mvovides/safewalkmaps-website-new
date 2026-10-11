import { deepMerge, type DeepPartial } from '@/theme/build';
import type { ThemeConfig } from '@/theme/config';
import type { ThemeTokens } from '@/theme/tokens';

type Updater = (config: ThemeConfig) => ThemeConfig;

/** Small immutable setters the panel tabs compose into one `update()` call. */
export const setTokens =
  (patch: DeepPartial<ThemeTokens>): Updater =>
  (c) => ({ ...c, tokens: deepMerge(c.tokens, patch) });

export const setComponents =
  (patch: DeepPartial<ThemeConfig['components']>): Updater =>
  (c) => ({ ...c, components: deepMerge(c.components, patch) });

export const setLayout =
  (patch: Partial<ThemeConfig['layout']>): Updater =>
  (c) => ({ ...c, layout: { ...c.layout, ...patch } });

export const setMotion =
  (patch: Partial<ThemeConfig['motion']>): Updater =>
  (c) => ({ ...c, motion: { ...c.motion, ...patch } });

export const setContent =
  (patch: Partial<ThemeConfig['content']>): Updater =>
  (c) => ({ ...c, content: { ...c.content, ...patch } });

export const compose =
  (...updaters: Updater[]): Updater =>
  (c) =>
    updaters.reduce((acc, fn) => fn(acc), c);
