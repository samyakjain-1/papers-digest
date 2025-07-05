import { renderApp } from 'modelence/client';
import { toast } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { routes } from './routes';
// @ts-ignore
import favicon from './assets/favicon.svg';
import './index.css';

const queryClient = new QueryClient();

renderApp({
  routesElement: (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="text-center p-8">Loading page...</div>}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.Component />} />
          ))}
        </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  ),
  errorHandler: (error) => {
    toast.error(error.message);
  },
  loadingElement: <div>Loading...</div>,
  favicon
});
