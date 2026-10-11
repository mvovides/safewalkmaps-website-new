import type { ThemeConfig } from './config';
import { tokensToCssVariables } from './cssVariables';

/** `dataset` keys the preview CSS reads for the choices that are not tokens. */
export const THEME_DATA_ATTRIBUTES = [
  'swmDensity',
  'swmDividers',
  'swmReveal',
  'swmHoverLift',
  'swmScheme',
] as const;

/**
 * Writes a theme onto an element — normally `document.documentElement` in the
 * preview — and returns a function that removes everything it wrote.
 */
export function applyTheme(root: HTMLElement, config: ThemeConfig): () => void {
  const vars = tokensToCssVariables(config.tokens);
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  root.dataset.swmDensity = config.layout.density;
  root.dataset.swmDividers = config.layout.dividers;
  root.dataset.swmReveal = config.motion.reveal;
  root.dataset.swmHoverLift = String(config.motion.hoverLift);
  root.dataset.swmScheme = config.tokens.colors.scheme;

  return () => {
    for (const name of Object.keys(vars)) root.style.removeProperty(name);
    for (const attribute of THEME_DATA_ATTRIBUTES) delete root.dataset[attribute];
  };
}
