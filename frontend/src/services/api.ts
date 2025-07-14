import axios, { AxiosResponse } from 'axios';
import type {
  ApiResponse,
  FamilyMember,
  FamilyMemberDetail,
  CreateFamilyMemberRequest,
  Medication,
  CreateMedicationRequest,
  Prescription,
  CreatePrescriptionRequest,
  MedicationLog,
  MedicationLogStatus,
  CreateMedicationLogRequest,
  DailySchedule,
  ComplianceStats,
} from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5415';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
);

// Family Members API
export const familyMembersApi = {
  getAll: async (): Promise<FamilyMember[]> => {
    const response: AxiosResponse<ApiResponse<FamilyMember[]>> = await api.get('/api/family-members');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<FamilyMemberDetail> => {
    const response: AxiosResponse<ApiResponse<FamilyMemberDetail>> = await api.get(`/api/family-members/${id}`);
    if (!response.data.data) throw new Error('Family member not found');
    return response.data.data;
  },

  getByType: async (type: 'human' | 'pet'): Promise<FamilyMember[]> => {
    const response: AxiosResponse<ApiResponse<FamilyMember[]>> = await api.get(`/api/family-members?type=${type}`);
    return response.data.data || [];
  },

  create: async (data: CreateFamilyMemberRequest): Promise<FamilyMember> => {
    const response: AxiosResponse<ApiResponse<FamilyMember>> = await api.post('/api/family-members', data);
    if (!response.data.data) throw new Error('Failed to create family member');
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateFamilyMemberRequest>): Promise<FamilyMember> => {
    const response: AxiosResponse<ApiResponse<FamilyMember>> = await api.put(`/api/family-members/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update family member');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/family-members/${id}`);
  },
};

// Medications API
export const medicationsApi = {
  getAll: async (search?: string): Promise<Medication[]> => {
    const url = search ? `/api/medications?search=${encodeURIComponent(search)}` : '/api/medications';
    const response: AxiosResponse<ApiResponse<Medication[]>> = await api.get(url);
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Medication> => {
    const response: AxiosResponse<ApiResponse<Medication>> = await api.get(`/api/medications/${id}`);
    if (!response.data.data) throw new Error('Medication not found');
    return response.data.data;
  },

  create: async (data: CreateMedicationRequest): Promise<Medication> => {
    const response: AxiosResponse<ApiResponse<Medication>> = await api.post('/api/medications', data);
    if (!response.data.data) throw new Error('Failed to create medication');
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateMedicationRequest>): Promise<Medication> => {
    const response: AxiosResponse<ApiResponse<Medication>> = await api.put(`/api/medications/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update medication');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/medications/${id}`);
  },
};

// Prescriptions API
export const prescriptionsApi = {
  getAll: async (familyMemberId?: string, active?: boolean): Promise<Prescription[]> => {
    let url = '/api/prescriptions';
    const params = new URLSearchParams();
    
    if (familyMemberId) params.append('familyMemberId', familyMemberId);
    if (active !== undefined) params.append('active', active.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response: AxiosResponse<ApiResponse<Prescription[]>> = await api.get(url);
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Prescription> => {
    const response: AxiosResponse<ApiResponse<Prescription>> = await api.get(`/api/prescriptions/${id}`);
    if (!response.data.data) throw new Error('Prescription not found');
    return response.data.data;
  },

  create: async (data: CreatePrescriptionRequest): Promise<Prescription> => {
    const response: AxiosResponse<ApiResponse<Prescription>> = await api.post('/api/prescriptions', data);
    if (!response.data.data) throw new Error('Failed to create prescription');
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreatePrescriptionRequest>): Promise<Prescription> => {
    const response: AxiosResponse<ApiResponse<Prescription>> = await api.put(`/api/prescriptions/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update prescription');
    return response.data.data;
  },

  deactivate: async (id: string): Promise<Prescription> => {
    const response: AxiosResponse<ApiResponse<Prescription>> = await api.patch(`/api/prescriptions/${id}/deactivate`);
    if (!response.data.data) throw new Error('Failed to deactivate prescription');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/prescriptions/${id}`);
  },
};

// Medication Logs API
export const medicationLogsApi = {
  getAll: async (filters?: {
    prescriptionId?: string;
    familyMemberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MedicationLog[]> => {
    let url = '/api/medication-logs';
    const params = new URLSearchParams();
    
    if (filters?.prescriptionId) params.append('prescriptionId', filters.prescriptionId);
    if (filters?.familyMemberId) params.append('familyMemberId', filters.familyMemberId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response: AxiosResponse<ApiResponse<MedicationLog[]>> = await api.get(url);
    return response.data.data || [];
  },

  getTodaysSchedule: async (familyMemberId?: string): Promise<DailySchedule> => {
    let url = '/api/medication-logs/today';
    if (familyMemberId) {
      url += `?familyMemberId=${familyMemberId}`;
    }
    
    const response: AxiosResponse<ApiResponse<DailySchedule>> = await api.get(url);
    if (!response.data.data) throw new Error('Failed to get today\'s schedule');
    return response.data.data;
  },

  getComplianceStats: async (familyMemberId?: string, days?: number): Promise<ComplianceStats> => {
    let url = '/api/medication-logs/compliance-stats';
    const params = new URLSearchParams();
    
    if (familyMemberId) params.append('familyMemberId', familyMemberId);
    if (days) params.append('days', days.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response: AxiosResponse<ApiResponse<ComplianceStats>> = await api.get(url);
    if (!response.data.data) throw new Error('Failed to get compliance stats');
    return response.data.data;
  },

  create: async (data: CreateMedicationLogRequest): Promise<MedicationLog> => {
    const response: AxiosResponse<ApiResponse<MedicationLog>> = await api.post('/api/medication-logs', data);
    if (!response.data.data) throw new Error('Failed to create medication log');
    return response.data.data;
  },

  markAsTaken: async (id: string, takenTime?: string): Promise<MedicationLog> => {
    const response: AxiosResponse<ApiResponse<MedicationLog>> = await api.patch(`/api/medication-logs/${id}/taken`, {
      takenTime,
    });
    if (!response.data.data) throw new Error('Failed to mark as taken');
    return response.data.data;
  },

  markAsMissed: async (id: string): Promise<MedicationLog> => {
    const response: AxiosResponse<ApiResponse<MedicationLog>> = await api.patch(`/api/medication-logs/${id}/missed`);
    if (!response.data.data) throw new Error('Failed to mark as missed');
    return response.data.data;
  },

  markAsSkipped: async (id: string, notes?: string): Promise<MedicationLog> => {
    const response: AxiosResponse<ApiResponse<MedicationLog>> = await api.patch(`/api/medication-logs/${id}/skipped`, {
      notes,
    });
    if (!response.data.data) throw new Error('Failed to mark as skipped');
    return response.data.data;
  },

  getScheduleForDate: async (date: string): Promise<DailySchedule> => {
    const response: AxiosResponse<ApiResponse<DailySchedule>> = await api.get(`/api/medication-logs/schedule/${date}`);
    if (!response.data.data) throw new Error('Failed to get schedule for date');
    return response.data.data;
  },

  updateStatus: async (id: string, status: MedicationLogStatus): Promise<MedicationLog> => {
    const response: AxiosResponse<ApiResponse<MedicationLog>> = await api.patch(`/api/medication-logs/${id}/status`, {
      status,
    });
    if (!response.data.data) throw new Error('Failed to update status');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/medication-logs/${id}`);
  },
};

// Health API
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};