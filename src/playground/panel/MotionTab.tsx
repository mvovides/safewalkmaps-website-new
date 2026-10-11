import { intensityMotion } from '@/theme/derive';

import { useActiveConfig, usePlaygroundActions, usePlaygroundState } from '../store/hooks';
import { SegmentedChoice, ToggleField } from './controls';
import { compose, setMotion, setTokens } from './updaters';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function MotionTab() {
  const config = useActiveConfig();
  const { ui } = usePlaygroundState();
  const { update, setUi } = usePlaygroundActions();
  return (
    <div className="pg-stack">
      <SegmentedChoice
        label="Intensity"
        value={config.motion.intensity}
        options={(['none', 'subtle', 'standard', 'expressive'] as const).map((i) => ({
          value: i,
          label: cap(i),
        }))}
        onChange={(intensity) =>
          update(
            compose(setMotion({ intensity }), setTokens({ motion: intensityMotion(intensity) })),
          )
        }
      />
      <SegmentedChoice
        label="Reveal style"
        value={config.motion.reveal}
        options={(['rise', 'fade', 'mask', 'scale'] as const).map((r) => ({
          value: r,
          label: cap(r),
        }))}
        onChange={(reveal) => update(setMotion({ reveal }))}
      />
      <ToggleField
        label="Hover lift on cards"
        checked={config.motion.hoverLift}
        onChange={(hoverLift) => update(setMotion({ hoverLift }))}
      />
      <ToggleField
        label="Preview with reduced motion"
        checked={ui.reducedMotion}
        onChange={(reducedMotion) => setUi({ reducedMotion })}
        hint="Emulates prefers-reduced-motion for the CSS in the Component lab. The real site's GSAP stories read the OS setting, so toggle that to test Live site mode."
      />
    </div>
  );
}
