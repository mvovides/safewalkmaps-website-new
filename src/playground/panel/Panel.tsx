import { usePlaygroundActions, usePlaygroundState } from '../store/hooks';
import type { PanelTab } from '../store/types';
import { ColoursTab } from './ColoursTab';
import { ContentTab } from './ContentTab';
import { LayoutTab } from './LayoutTab';
import { MotionTab } from './MotionTab';
import { PresetsTab } from './PresetsTab';
import { ShapeTab } from './ShapeTab';
import { TypographyTab } from './TypographyTab';

const PANEL_TABS: ReadonlyArray<{ id: PanelTab; label: string }> = [
  { id: 'presets', label: 'Presets' },
  { id: 'colours', label: 'Colours' },
  { id: 'typography', label: 'Typography' },
  { id: 'shape', label: 'Shape' },
  { id: 'layout', label: 'Layout' },
  { id: 'motion', label: 'Motion' },
  { id: 'content', label: 'Content' },
];

const tabs: Record<PanelTab, () => JSX.Element> = {
  presets: PresetsTab,
  colours: ColoursTab,
  typography: TypographyTab,
  shape: ShapeTab,
  layout: LayoutTab,
  motion: MotionTab,
  content: ContentTab,
};

export function Panel() {
  const { ui } = usePlaygroundState();
  const { setUi } = usePlaygroundActions();
  const Active = tabs[ui.panelTab] ?? PresetsTab;
  return (
    <div className="pg-panel-inner">
      <div role="tablist" aria-label="Theme controls" className="pg-tabs">
        {PANEL_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={ui.panelTab === tab.id}
            className="pg-tab"
            onClick={() => setUi({ panelTab: tab.id })}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pg-tabpanel">
        <Active />
      </div>
    </div>
  );
}
