import { Button, ButtonLink } from '@/components/ui/Button';
import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { labButtonProps } from './labStyles';

const SIZES = ['sm', 'md', 'lg'] as const;

export function LabButtons({ config }: { config: ThemeConfig }) {
  const preset = labButtonProps(config);
  const { shape, primary, hover } = config.components.button;
  return (
    <LabSection id="buttons" title="Buttons" variant={`${shape} · ${primary} · ${hover}`}>
      <div className="grid gap-8">
        <div className="flex flex-wrap items-center gap-3">
          {SIZES.map((size) => (
            <ButtonLink
              key={size}
              href="#waitlist"
              size={size}
              variant={preset.variant}
              className={preset.className}
              routeHover={preset.routeHover}
            >
              {config.content.ctaLabel}
            </ButtonLink>
          ))}
          <Button variant={preset.variant} className={preset.className} disabled>
            Disabled
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" routeHover>
            Primary
          </Button>
          <Button variant="accent" routeHover>
            Accent
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="on-navy flex flex-wrap items-center gap-3 rounded-card bg-surface-navy p-6">
          <Button variant="inverse">Inverse</Button>
          <Button variant="accent" routeHover>
            Accent on navy
          </Button>
        </div>
      </div>
    </LabSection>
  );
}
