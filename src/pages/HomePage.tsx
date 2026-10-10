import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { RouteChoiceSection } from '@/components/sections/RouteChoiceSection';
import { SafetyLayerSection } from '@/components/sections/SafetyLayerSection';
import { WaitlistSection } from '@/components/sections/WaitlistSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useStaleHashRedirect } from '@/hooks/useStaleHashRedirect';
import { siteConfig } from '@/lib/config';

/**
 * The homepage is the argument, and nothing else:
 *
 *   hero          — the claim
 *   01 problem    — why the claim matters
 *   02 layer      — what it is built from
 *   03 routes     — and you still choose
 *   04 waitlist   — the ask
 *   final CTA
 *
 * The detail each of these raises lives on its own route: /safety-score,
 * /features, /about and /faq.
 */
export function HomePage() {
  useDocumentMeta({
    title: 'SafeWalkMaps — Safety-Aware Walking Navigation',
    description: `${siteConfig.description} Coming soon on iOS.`,
    path: '/',
  });
  useStaleHashRedirect();

  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SafetyLayerSection />
      <RouteChoiceSection />
      <WaitlistSection />
      <FinalCtaSection />
    </>
  );
}
