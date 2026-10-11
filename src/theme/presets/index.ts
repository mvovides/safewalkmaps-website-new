import type { ThemeConfig } from '../config';
import { todayPreset } from './today';

/** Read-only presets, in display order. `today` is always first and is the fallback everywhere. */
export const builtInPresets: readonly ThemeConfig[] = [todayPreset];
