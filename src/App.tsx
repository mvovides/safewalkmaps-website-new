import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { SiteLayout } from '@/components/layout/SiteLayout';
import { HomePage } from '@/pages/HomePage';

// The homepage carries the scroll experience, so it ships in the main bundle.
// The supporting pages are split out — most visitors never open them.
const SafetyScorePage = lazy(() =>
  import('@/pages/SafetyScorePage').then((module) => ({ default: module.SafetyScorePage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import('@/pages/TermsPage').then((module) => ({ default: module.TermsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

/** Neutral placeholder while a split route loads — no spinner flash. */
function RouteFallback() {
  return <div className="min-h-[70svh]" aria-busy="true" />;
}

export function App() {
  return (
    <SiteLayout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/safety-score" element={<SafetyScorePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </SiteLayout>
  );
}
