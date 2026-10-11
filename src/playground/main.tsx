import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/index.css';
import './playground.css';
import { Preview } from './Preview';
import { Shell } from './Shell';

/**
 * One entry, two documents. The shell is the control panel; each preview iframe
 * loads this same page with `?preview=1` and renders the themed content instead.
 */
const params = new URLSearchParams(window.location.search);
const isPreview = params.get('preview') === '1';
const frameId = params.get('frame') === 'b' ? 'b' : 'a';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found in playground.html');

createRoot(container).render(
  <StrictMode>{isPreview ? <Preview frameId={frameId} /> : <Shell />}</StrictMode>,
);
