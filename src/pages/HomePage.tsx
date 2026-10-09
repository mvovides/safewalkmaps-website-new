import { ContactSection } from '@/components/sections/ContactSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { FeatureSection } from '@/components/sections/FeatureSection';
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { MissionSection } from '@/components/sections/MissionSection';
import { PrivacySection } from '@/components/sections/PrivacySection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { RouteChoiceSection } from '@/components/sections/RouteChoiceSection';
import { SafetyLayerSection } from '@/components/sections/SafetyLayerSection';
import { SafetyScoreSection } from '@/components/sections/SafetyScoreSection';
import { ScenariosSection } from '@/components/sections/ScenariosSection';
import { WaitlistSection } from '@/components/sections/WaitlistSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { siteConfig } from '@/lib/config';

/**
 * The homepage is one continuous argument:
 *
 *   hero          — the claim
 *   01 problem    — why the claim matters
 *   02 layer      — what it is built from
 *   03 score      — how to read the output
 *   04 routes     — and you still choose
 *   05 features   — what it is like to use
 *   06 privacy    — what it costs you (nothing)
 *   07 scenarios  — when you would reach for it
 *   08 mission    — where it goes next
 *   09 waitlist   — the ask
 *   10 faq        — the objections, answered honestly
 *   contact / final CTA
 */
export function HomePage() {
  useDocumentMeta({
    title: 'SafeWalkMaps — Safety-Aware Walking Navigation',
    description: `${siteConfig.description} Coming soon on iOS.`,
    path: '/',
  });

  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SafetyLayerSection />
      <SafetyScoreSection />
      <RouteChoiceSection />
      <FeatureSection />
      <PrivacySection />
      <ScenariosSection />
      <MissionSection />
      <WaitlistSection />
      <FaqSection />
      <ContactSection />
      <FinalCtaSection />
    </>
  );
}
