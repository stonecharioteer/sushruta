import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '@/pages/Dashboard';

// Mock the API modules
vi.mock('@/services/api', () => ({
  familyMembersApi: {
    getAll: vi.fn(() => Promise.resolve([
      { id: '1', name: 'John Doe', type: 'human' },
      { id: '2', name: 'Max', type: 'pet' }
    ]))
  },
  medicationsApi: {
    getAll: vi.fn(() => Promise.resolve([
      { id: '1', name: 'Aspirin' },
      { id: '2', name: 'Vitamins' }
    ]))
  },
  medicationLogsApi: {
    getTodaysSchedule: vi.fn(() => Promise.resolve({
      logs: [],
      summary: { total: 5, taken: 2, missed: 1, pending: 2 }
    })),
    getComplianceStats: vi.fn(() => Promise.resolve({
      complianceRate: 85,
      complianceGrade: 'B',
      totalLogs: 100,
      takenCount: 85,
      missedCount: 15,
      period: 'Last 30 days'
    }))
  }
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard header', async () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your family medicine tracker')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays quick actions section', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for loading to complete and quick actions to appear
    await screen.findByText('Quick Actions');
    
    expect(screen.getByText('Add Family Member')).toBeInTheDocument();
    expect(screen.getByText('Add Medication')).toBeInTheDocument();
    expect(screen.getByText('New Prescription')).toBeInTheDocument();
    expect(screen.getByText('Log Medication')).toBeInTheDocument();
  });

  it('renders stats cards with data', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for data to load
    await screen.findByText('Family Members');
    
    expect(screen.getByText('Family Members')).toBeInTheDocument();
    expect(screen.getByText('Medications')).toBeInTheDocument();
    expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
    expect(screen.getByText('Compliance Rate')).toBeInTheDocument();
  });

  it('has navigation links', async () => {
    renderWithProviders(<Dashboard />);
    
    await screen.findByText("View Today's Schedule");
    
    const scheduleLink = screen.getByText("View Today's Schedule").closest('a');
    expect(scheduleLink).toHaveAttribute('href', '/schedule');
  });
});