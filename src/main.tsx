import './index.scss';
import './i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App.tsx';
import { initPerformanceMonitoring } from '@/utils/performanceMonitoring';

// Initialize performance monitoring (only active in development)
initPerformanceMonitoring();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
