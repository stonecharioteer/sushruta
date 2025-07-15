import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Prescriptions from '@/pages/Prescriptions';
import { prescriptionsApi } from '@/services/api';

// Mock the API modules
vi.mock('@/services/api', () => ({
  prescriptionsApi: {
    getAll: vi.fn(),
    deactivate: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

const mockPrescriptions = [
  {
    id: '1',
    active: true,
    startDate: '2024-01-01',
    endDate: null,
    familyMember: { id: '1', name: 'John Doe', type: 'human' },
    medication: { id: '1', name: 'Aspirin', dosage: '100mg', frequency: 'Daily' }
  },
  {
    id: '2',
    active: false,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    familyMember: { id: '2', name: 'Jane Doe', type: 'human' },
    medication: { id: '2', name: 'Vitamins', dosage: '1 tablet', frequency: 'Daily' }
  }
];

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

describe('Prescriptions Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(prescriptionsApi.getAll).mockResolvedValue(mockPrescriptions);
    vi.mocked(prescriptionsApi.deactivate).mockResolvedValue({});
    vi.mocked(prescriptionsApi.update).mockResolvedValue({});
    vi.mocked(prescriptionsApi.delete).mockResolvedValue({});
  });

  it('renders prescriptions page with active and inactive sections', async () => {
    renderWithProviders(<Prescriptions />);
    
    expect(screen.getByText('Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Manage prescriptions for family members')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Active Prescriptions (1)')).toBeInTheDocument();
      expect(screen.getByText('Inactive Prescriptions (1)')).toBeInTheDocument();
    });
  });

  it('displays active prescriptions correctly', async () => {
    renderWithProviders(<Prescriptions />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
    });
  });

  it('displays inactive prescriptions correctly', async () => {
    renderWithProviders(<Prescriptions />);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Vitamins')).toBeInTheDocument();
    });
  });

  describe('Cache Invalidation Fix', () => {
    it('calls deactivate mutation and invalidates both cache keys', async () => {
      const queryClient = createTestQueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Prescriptions />
          </BrowserRouter>
        </QueryClientProvider>
      );
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Find and click the deactivate button (AlertCircle icon) for active prescription
      const deactivateButtons = screen.getAllByRole('button');
      const deactivateButton = deactivateButtons.find(btn => 
        btn.querySelector('svg[data-lucide="alert-circle"]')
      );
      
      expect(deactivateButton).toBeInTheDocument();
      fireEvent.click(deactivateButton!);
      
      await waitFor(() => {
        expect(prescriptionsApi.deactivate).toHaveBeenCalledWith('1');
      });
      
      // Wait for mutation to complete
      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith(['prescriptions']);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith(['active-prescriptions']);
      });
      
      // Verify both cache keys were invalidated
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    });

    it('calls reactivate mutation and invalidates both cache keys', async () => {
      const queryClient = createTestQueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Prescriptions />
          </BrowserRouter>
        </QueryClientProvider>
      );
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
      
      // Find and click the reactivate button (PlayCircle icon) for inactive prescription
      const reactivateButtons = screen.getAllByRole('button');
      const reactivateButton = reactivateButtons.find(btn => 
        btn.querySelector('svg[data-lucide="play-circle"]')
      );
      
      expect(reactivateButton).toBeInTheDocument();
      fireEvent.click(reactivateButton!);
      
      await waitFor(() => {
        expect(prescriptionsApi.update).toHaveBeenCalledWith('2', { active: true });
      });
      
      // Wait for mutation to complete
      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith(['prescriptions']);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith(['active-prescriptions']);
      });
      
      // Verify both cache keys were invalidated
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Regression Testing', () => {
    it('still invalidates prescriptions cache on delete', async () => {
      const queryClient = createTestQueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      // Mock window.confirm to return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Prescriptions />
          </BrowserRouter>
        </QueryClientProvider>
      );
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Find and click the delete button (Trash2 icon)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg[data-lucide="trash-2"]')
      );
      
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton!);
      
      await waitFor(() => {
        expect(prescriptionsApi.delete).toHaveBeenCalledWith('1');
      });
      
      // Wait for mutation to complete
      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith(['prescriptions']);
      });
      
      // Verify delete still works as expected
      expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    });

    it('displays prescription summary stats correctly', async () => {
      renderWithProviders(<Prescriptions />);
      
      await waitFor(() => {
        expect(screen.getByText('Prescription Summary')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Total prescriptions
        expect(screen.getByText('1')).toBeInTheDocument(); // Active prescriptions
        expect(screen.getByText('Total Prescriptions')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no active prescriptions', async () => {
      // Mock empty active prescriptions
      vi.mocked(prescriptionsApi.getAll).mockResolvedValue([
        mockPrescriptions[1] // Only inactive prescription
      ]);
      
      renderWithProviders(<Prescriptions />);
      
      await waitFor(() => {
        expect(screen.getByText('No active prescriptions yet.')).toBeInTheDocument();
        expect(screen.getByText('Add First Prescription')).toBeInTheDocument();
      });
    });
  });
});