import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Family from '@/pages/Family';
import Medications from '@/pages/Medications';
import Schedule from '@/pages/Schedule';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/family" element={<Family />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;