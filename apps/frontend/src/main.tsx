import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRouter } from '@/router';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="bottom-right" theme="dark" richColors />
    </QueryClientProvider>
  </StrictMode>,
);
