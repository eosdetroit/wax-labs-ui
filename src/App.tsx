import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from '@/api/queryClient';
import { ChainProvider } from '@/providers/chain.tsx';
import { ConfigProvider } from '@/providers/config.tsx';
import { NotificationsProvider } from '@/providers/notifications.tsx';
import { ToastProvider } from '@/providers/toast';
import { route } from '@/route';
import { initPerformanceMonitoring } from '@/utils/performanceMonitoring';

export function App() {
  // Initialize performance monitoring in development environment
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return (
    <ChainProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <ToastProvider>
            <NotificationsProvider>
              <RouterProvider router={route} />
              <ReactQueryDevtools initialIsOpen={false} />
            </NotificationsProvider>
          </ToastProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </ChainProvider>
  );
}

export default function WrappedApp() {
  return (
    <Suspense fallback="Loading...">
      <App />
    </Suspense>
  );
}
