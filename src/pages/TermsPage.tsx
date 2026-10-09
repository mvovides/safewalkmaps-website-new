import { LegalPage } from '@/components/layout/LegalPage';
import { termsSections, TERMS_UPDATED } from '@/data/legal';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function TermsPage() {
  useDocumentMeta({
    title: 'Terms of service — SafeWalkMaps',
    description:
      'The terms covering use of SafeWalkMaps, including what a Safety Score is and what it is not.',
    path: '/terms',
  });

  return (
    <LegalPage
      title="Terms of service"
      intro="The rules of the road, in plain English. The most important section is the second one: what SafeWalkMaps is, and what it is not."
      updated={TERMS_UPDATED}
      sections={termsSections}
    />
  );
}
