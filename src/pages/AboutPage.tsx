import { ContactSection } from '@/components/sections/ContactSection';
import { MissionSection } from '@/components/sections/MissionSection';
import { PrivacySection } from '@/components/sections/PrivacySection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function AboutPage() {
  useDocumentMeta({
    title: 'About — SafeWalkMaps',
    description:
      'Why SafeWalkMaps exists, how it treats your data, and how to get in touch. Built by Marvian Tech, in beta in London and Sheffield.',
    path: '/about',
  });

  return (
    <>
      <MissionSection headingAs="h1" className="pt-32 lg:pt-36" />
      <PrivacySection />
      {/* No closing CTA here: the contact form is already an ask, and a second
          one stacked under it reads as noise. */}
      <ContactSection />
    </>
  );
}
