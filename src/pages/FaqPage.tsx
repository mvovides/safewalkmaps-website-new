import { useEffect } from 'react';

import { FaqSection } from '@/components/sections/FaqSection';
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { faqItems } from '@/data/faq';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/**
 * FAQPage structured data, injected while this route is mounted.
 *
 * It used to live in index.html, which was only correct while the FAQ was on
 * the home page. Describing a page's questions from a page that no longer
 * contains them is wrong markup, so it travels with the route instead.
 */
function useFaqSchema(): void {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.faqSchema = '';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer.join(' '),
        },
      })),
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);
}

export function FaqPage() {
  useDocumentMeta({
    title: 'Frequently asked questions — SafeWalkMaps',
    description:
      'How the safety score is built, what data SafeWalkMaps uses, what it does with your location, and where the app is available.',
    path: '/faq',
  });
  useFaqSchema();

  return (
    <>
      <FaqSection headingAs="h1" className="pt-32 lg:pt-36" />
      <FinalCtaSection />
    </>
  );
}
