import { primaryFamily } from '@/theme/export';
import { defaultTokens, type ThemeTokens } from '@/theme/tokens';

export type FontRole = 'sans' | 'display' | 'mono';
export type FontOption = {
  id: string;
  label: string;
  stack: string;
  /** Google Fonts css2 URL, or null for bundled/system families. Requested only inside the playground. */
  googleCss: string | null;
  roles: FontRole[];
};

const google = (family: string, axes: string) =>
  `https://fonts.googleapis.com/css2?family=${family}:${axes}&display=swap`;
const sans = (name: string) => `'${name}', 'Inter Variable', Inter, system-ui, sans-serif`;
const serif = (name: string) => `'${name}', Georgia, 'Times New Roman', serif`;
const mono = (name: string) => `'${name}', ui-monospace, SFMono-Regular, Menlo, monospace`;

/** Curated families for comparison. Choosing one for production means adding its @fontsource package. */
export const fontOptions: FontOption[] = [
  {
    id: 'inter',
    label: 'Inter (bundled)',
    stack: defaultTokens.typography.sans,
    googleCss: null,
    roles: ['sans', 'display'],
  },
  {
    id: 'system',
    label: 'System (SF Pro / Segoe)',
    stack:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Helvetica, Arial, sans-serif",
    googleCss: null,
    roles: ['sans', 'display'],
  },
  {
    id: 'manrope',
    label: 'Manrope',
    stack: sans('Manrope'),
    googleCss: google('Manrope', 'wght@300..800'),
    roles: ['sans', 'display'],
  },
  {
    id: 'plus-jakarta-sans',
    label: 'Plus Jakarta Sans',
    stack: sans('Plus Jakarta Sans'),
    googleCss: google('Plus+Jakarta+Sans', 'wght@300..800'),
    roles: ['sans', 'display'],
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    stack: sans('DM Sans'),
    googleCss: google('DM+Sans', 'opsz,wght@9..40,300..800'),
    roles: ['sans', 'display'],
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    stack: sans('Space Grotesk'),
    googleCss: google('Space+Grotesk', 'wght@300..700'),
    roles: ['sans', 'display'],
  },
  {
    id: 'instrument-sans',
    label: 'Instrument Sans',
    stack: sans('Instrument Sans'),
    googleCss: google('Instrument+Sans', 'wght@400..700'),
    roles: ['sans', 'display'],
  },
  {
    id: 'geist',
    label: 'Geist',
    stack: sans('Geist'),
    googleCss: google('Geist', 'wght@300..800'),
    roles: ['sans', 'display'],
  },
  {
    id: 'outfit',
    label: 'Outfit',
    stack: sans('Outfit'),
    googleCss: google('Outfit', 'wght@300..800'),
    roles: ['sans', 'display'],
  },
  {
    id: 'sora',
    label: 'Sora',
    stack: sans('Sora'),
    googleCss: google('Sora', 'wght@300..800'),
    roles: ['sans', 'display'],
  },
  {
    id: 'fraunces',
    label: 'Fraunces (serif)',
    stack: serif('Fraunces'),
    googleCss: google('Fraunces', 'opsz,wght@9..144,300..800'),
    roles: ['display'],
  },
  {
    id: 'newsreader',
    label: 'Newsreader (serif)',
    stack: serif('Newsreader'),
    googleCss: google('Newsreader', 'opsz,wght@6..72,300..800'),
    roles: ['display'],
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    stack: mono('JetBrains Mono'),
    googleCss: google('JetBrains+Mono', 'wght@400..700'),
    roles: ['mono'],
  },
  {
    id: 'ibm-plex-mono',
    label: 'IBM Plex Mono',
    stack: mono('IBM Plex Mono'),
    googleCss: google('IBM+Plex+Mono', 'wght@400;500;600;700'),
    roles: ['mono'],
  },
  {
    id: 'system-mono',
    label: 'System mono',
    stack: defaultTokens.typography.mono,
    googleCss: null,
    roles: ['mono'],
  },
];

export function findFontOption(stack: string | null): FontOption | undefined {
  if (!stack) return undefined;
  const family = primaryFamily(stack).toLowerCase();
  return fontOptions.find((option) => primaryFamily(option.stack).toLowerCase() === family);
}

/** Adds the stylesheet for a hosted family once per document. Unknown and bundled stacks do nothing. */
export function ensureFontLoaded(doc: Document, stack: string | null): void {
  const option = findFontOption(stack);
  if (!option?.googleCss) return;
  const id = `swm-font-${option.id}`;
  if (doc.getElementById(id)) return;
  const link = doc.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = option.googleCss;
  doc.head.appendChild(link);
}

export function loadThemeFonts(doc: Document, typography: ThemeTokens['typography']): void {
  ensureFontLoaded(doc, typography.sans);
  ensureFontLoaded(doc, typography.display);
  ensureFontLoaded(doc, typography.mono);
}
