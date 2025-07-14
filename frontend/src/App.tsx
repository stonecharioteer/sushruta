import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Family from '@/pages/Family';
import FamilyMemberForm from '@/pages/FamilyMemberForm';
import Medications from '@/pages/Medications';
import MedicationForm from '@/pages/MedicationForm';
import Schedule from '@/pages/Schedule';
import Prescriptions from '@/pages/Prescriptions';
import PrescriptionForm from '@/pages/PrescriptionForm';
import About from '@/pages/About';

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
            <Route path="/family/new" element={<FamilyMemberForm />} />
            <Route path="/family/:id/edit" element={<FamilyMemberForm />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/medications/new" element={<MedicationForm />} />
            <Route path="/medications/:id/edit" element={<MedicationForm />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/prescriptions/new" element={<PrescriptionForm />} />
            <Route path="/prescriptions/:id/edit" element={<PrescriptionForm />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;