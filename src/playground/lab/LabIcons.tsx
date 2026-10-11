import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronRight,
  CloudOff,
  CornerUpRight,
  Home,
  Info,
  Mail,
  MapPinned,
  MessageSquareWarning,
  Minus,
  Navigation,
  Share2,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

import type { ThemeConfig } from '@/theme/config';

import { LabSection } from './LabSection';
import { iconTile } from './labStyles';

/** The lucide icons the site uses today. */
const ICONS: Array<[string, LucideIcon]> = [
  ['ArrowDown', ArrowDown],
  ['ArrowUpRight', ArrowUpRight],
  ['Check', Check],
  ['ChevronRight', ChevronRight],
  ['CloudOff', CloudOff],
  ['CornerUpRight', CornerUpRight],
  ['Home', Home],
  ['Info', Info],
  ['Mail', Mail],
  ['MapPinned', MapPinned],
  ['MessageSquareWarning', MessageSquareWarning],
  ['Minus', Minus],
  ['Navigation', Navigation],
  ['Share2', Share2],
  ['ShieldAlert', ShieldAlert],
];

export function LabIcons({ config }: { config: ThemeConfig }) {
  const tile = iconTile(config);
  return (
    <LabSection
      id="icons"
      title="Icons"
      variant={`${config.components.icons.style} · ${tile.strokeWidth}`}
    >
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        {ICONS.map(([name, Icon]) => (
          <li
            key={name}
            className="flex flex-col items-center gap-2 text-caption text-ink-tertiary"
          >
            <span className={tile.className}>
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={tile.strokeWidth} />
            </span>
            {name}
          </li>
        ))}
      </ul>
    </LabSection>
  );
}
