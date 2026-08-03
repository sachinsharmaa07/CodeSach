import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRouter } from '@/router';
import { useThemeStore } from '@/store/theme.store';
import '@/index.css';

document.documentElement.classList.toggle('dark', useThemeStore.getState().theme === 'dark');

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000, retry: 1 } },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="bottom-right" theme={useThemeStore.getState().theme} richColors />
    </QueryClientProvider>
  </StrictMode>,
);
