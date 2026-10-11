import { Logo } from '@/components/brand/Logo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { footerColumns } from '@/data/navigation';
import { siteConfig } from '@/lib/config';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';

export function LabFooter({ config }: { config: ThemeConfig }) {
  const style = config.components.footer.style;
  const year = new Date().getFullYear();
  // `footerColumns` is a readonly tuple union, so flatten to labels explicitly.
  const links: string[] = footerColumns.flatMap((column) => column.links.map((link) => link.label));
  return (
    <LabSection id="footer" title="Footer" variant={style} bleed>
      {style === 'navy-columns' && <SiteFooter />}
      {style === 'light-compact' && (
        <footer className="border-t border-line bg-surface text-ink-primary">
          <div className="shell flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
            <Logo className="text-[1rem]" markClassName="h-7" />
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-ink-secondary">
              {links.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <p className="text-caption text-ink-tertiary">
              © {year} SafeWalkMaps · a {siteConfig.parentCompany.name} product
            </p>
          </div>
        </footer>
      )}
      {style === 'dark-big-logo' && (
        <footer className="on-navy bg-navy-950 text-white" data-nav-theme="dark">
          <div className="shell py-section">
            <Logo
              variant="mono-light"
              className="text-[clamp(1.5rem,4vw,2.75rem)]"
              markClassName="h-[1.4em]"
            />
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-white/60">
              {links.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <p className="mt-10 max-w-[46ch] text-caption text-white/40">
              Safety scores are relative guidance from available data, not a guarantee. In an
              emergency, contact your local emergency services.
            </p>
            <p className="mt-4 text-caption text-white/40">© {year} SafeWalkMaps</p>
          </div>
        </footer>
      )}
    </LabSection>
  );
}
