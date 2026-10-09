import { HeroSection } from '@/components/sections/hero/HeroSection';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { siteConfig } from '@/lib/config';

export function HomePage() {
  useDocumentMeta({
    title: 'SafeWalkMaps — Safety-Aware Walking Navigation',
    description: siteConfig.description + ' Coming soon on iOS.',
    path: '/',
  });

  return (
    <>
      <HeroSection />
    </>
  );
}
