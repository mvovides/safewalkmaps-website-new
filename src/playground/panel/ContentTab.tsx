import { CTA_LABEL_MAX, HEADLINES, TONES } from '@/theme/config';

import { headlines } from '../content';
import { useActiveConfig, usePlaygroundActions } from '../store/hooks';
import { SegmentedChoice, TextInput } from './controls';
import { setContent } from './updaters';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ContentTab() {
  const config = useActiveConfig();
  const { update } = usePlaygroundActions();
  const copy = headlines[config.content.headline];
  return (
    <div className="pg-stack">
      <SegmentedChoice
        label="Headline"
        value={config.content.headline}
        options={HEADLINES.map((h) => ({ value: h, label: cap(h) }))}
        onChange={(headline) => update(setContent({ headline }))}
      />
      <p className="pg-hint">
        “{copy.line1} {copy.line2}”
      </p>
      <SegmentedChoice
        label="Tone"
        value={config.content.tone}
        options={TONES.map((t) => ({ value: t, label: cap(t) }))}
        onChange={(tone) => update(setContent({ tone }))}
      />
      <TextInput
        label="CTA label"
        value={config.content.ctaLabel}
        maxLength={CTA_LABEL_MAX}
        onChange={(ctaLabel) => update(setContent({ ctaLabel: ctaLabel.slice(0, CTA_LABEL_MAX) }))}
        hint={`${config.content.ctaLabel.length}/${CTA_LABEL_MAX}`}
      />
    </div>
  );
}
