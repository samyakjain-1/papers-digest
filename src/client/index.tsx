import { renderApp } from 'modelence/client';
import { Toaster, toast } from 'react-hot-toast';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { routes } from './routes';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import DocumentTitle from './components/DocumentTitle';
// @ts-ignore
import favicon from './assets/favicon.svg';
import './index.css';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PageTransition>
                <route.Component />
              </PageTransition>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

renderApp({
  routesElement: (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <DocumentTitle title="PaperDigest" />
        <Suspense fallback={<div className="text-center p-8">Loading page...</div>}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  ),
  errorHandler: (error) => {
    toast.error(error.message);
  },
  loadingElement: <div>Loading...</div>,
  favicon,
});
