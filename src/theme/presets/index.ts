import type { ThemeConfig } from '../config';
import { boldStartupPreset } from './bold-startup';
import { cleanMinimalPreset } from './clean-minimal';
import { cupertinoPreset } from './cupertino';
import { lightAiryPreset } from './light-airy';
import { nightNavigationPreset } from './night-navigation';
import { premiumModernPreset } from './premium-modern';
import { safetyFirstPreset } from './safety-first';
import { todayPreset } from './today';
import { wayfinderPreset } from './wayfinder';

/** Read-only presets, in display order. `today` is always first and is the fallback everywhere. */
export const builtInPresets: readonly ThemeConfig[] = [
  todayPreset,
  cleanMinimalPreset,
  premiumModernPreset,
  safetyFirstPreset,
  nightNavigationPreset,
  lightAiryPreset,
  boldStartupPreset,
  cupertinoPreset,
  wayfinderPreset,
];
