import { LegalPage } from '@/components/layout/LegalPage';
import { privacySections, PRIVACY_UPDATED } from '@/data/legal';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function PrivacyPage() {
  useDocumentMeta({
    title: 'Privacy policy — SafeWalkMaps',
    description:
      'How SafeWalkMaps handles location, reports and account data. Your live location is not stored, shared links expire, and reports are anonymised.',
    path: '/privacy',
  });

  return (
    <LegalPage
      title="Your route is personal. Your privacy should be too."
      intro="A safety app that quietly built a record of everywhere you walk would be a strange kind of safety app. This page explains what SafeWalkMaps collects, what it deliberately does not, and what you can ask us to do about it."
      updated={PRIVACY_UPDATED}
      sections={privacySections}
    />
  );
}
