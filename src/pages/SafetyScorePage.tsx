import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { SafetyScoreSection } from '@/components/sections/SafetyScoreSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function SafetyScorePage() {
  useDocumentMeta({
    title: 'The safety score — SafeWalkMaps',
    description:
      'How SafeWalkMaps scores a walking route: the worst stretch on the way, how much of the walk sits below par, and how confident the underlying data is.',
    path: '/safety-score',
  });

  return (
    <>
      {/* The lead section clears the fixed header, the way LegalPage does. */}
      <SafetyScoreSection headingAs="h1" className="pt-32 lg:pt-36" />
      <FinalCtaSection />
    </>
  );
}
