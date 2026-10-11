import type { ThemeConfig } from '../config';

export const AUTHORED = '2026-10-11T00:00:00.000Z';

type Input = Omit<ThemeConfig, 'schemaVersion' | 'meta'> & {
  id: string;
  name: string;
  description: string;
};

/** Fills in the fixed metadata every built-in shares. */
export function preset({ id, name, description, ...rest }: Input): ThemeConfig {
  return {
    schemaVersion: 1,
    meta: {
      id,
      name,
      description,
      builtIn: true,
      basedOn: null,
      favourite: false,
      createdAt: AUTHORED,
      updatedAt: AUTHORED,
    },
    ...rest,
  };
}

/** Font stacks mirrored from src/playground/fonts.ts; the theme layer must not import the playground. */
export const STACKS = {
  system:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Helvetica, Arial, sans-serif",
  manrope: "'Manrope', 'Inter Variable', Inter, system-ui, sans-serif",
  plusJakarta: "'Plus Jakarta Sans', 'Inter Variable', Inter, system-ui, sans-serif",
  dmSans: "'DM Sans', 'Inter Variable', Inter, system-ui, sans-serif",
  spaceGrotesk: "'Space Grotesk', 'Inter Variable', Inter, system-ui, sans-serif",
  sora: "'Sora', 'Inter Variable', Inter, system-ui, sans-serif",
  jetbrainsMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;
