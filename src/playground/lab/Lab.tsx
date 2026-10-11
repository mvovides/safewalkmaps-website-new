import type { ThemeConfig } from '@/theme/config';

export type LabProps = { config: ThemeConfig; section: string | null };

/** Placeholder until the compositions land; the shell and preview plumbing is testable without them. */
export function Lab({ config }: LabProps) {
  return (
    <main className="shell py-section">
      <p className="lab-chrome">Component lab — {config.meta.name}</p>
    </main>
  );
}
