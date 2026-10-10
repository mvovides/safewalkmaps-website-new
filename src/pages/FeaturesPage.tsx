import { FeatureSection } from '@/components/sections/FeatureSection';
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { ScenariosSection } from '@/components/sections/ScenariosSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function FeaturesPage() {
  useDocumentMeta({
    title: 'Features — SafeWalkMaps',
    description:
      'What SafeWalkMaps does on a walk: live navigation that keeps explaining itself, re-routing when the street ahead changes, shared journeys, and the situations it is built for.',
    path: '/features',
  });

  return (
    <>
      {/* The lead section clears the fixed header, the way LegalPage does. */}
      <FeatureSection headingAs="h1" className="pt-32 lg:pt-36" />
      <ScenariosSection />
      <FinalCtaSection />
    </>
  );
}
