// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Family Member Types
export enum MemberType {
  HUMAN = 'human',
  PET = 'pet'
}

export interface FamilyMember {
  id: string;
  name: string;
  type: MemberType;
  dateOfBirth?: string;
  age?: number;
  notes?: string;
  activePrescriptionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberDetail extends FamilyMember {
  prescriptions: Prescription[];
}

export interface CreateFamilyMemberRequest {
  name: string;
  type: MemberType;
  dateOfBirth?: string;
  notes?: string;
}

// Medication Types
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  activePrescriptionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

// Prescription Types
export interface Prescription {
  id: string;
  familyMember: {
    id: string;
    name: string;
    type: string;
  };
  medication: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  };
  startDate: string;
  endDate?: string;
  active: boolean;
  logCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionRequest {
  familyMemberId: string;
  medicationId: string;
  startDate: string;
  endDate?: string;
  active?: boolean;
}

// Medication Log Types
export enum MedicationLogStatus {
  PENDING = 'pending',
  TAKEN = 'taken',
  MISSED = 'missed',
  SKIPPED = 'skipped'
}

export interface MedicationLog {
  id: string;
  prescription: {
    id: string;
    familyMemberId: string;
    familyMember: {
      id: string;
      name: string;
      type: string;
    };
    medication: {
      id: string;
      name: string;
      dosage: string;
    };
  };
  scheduledTime: string;
  takenTime?: string;
  status: MedicationLogStatus;
  dosage: string;
  notes?: string;
  isLate: boolean;
  createdAt: string;
}

export interface CreateMedicationLogRequest {
  prescriptionId: string;
  scheduledTime: string;
  takenTime?: string;
  status: MedicationLogStatus;
  notes?: string;
}

// Daily Schedule Types
export interface DailySchedule {
  date: string;
  logs: MedicationLog[];
  summary: {
    total: number;
    taken: number;
    missed: number;
    skipped: number;
    pending: number;
  };
}

// Compliance Stats Types
export interface ComplianceStats {
  period: string;
  totalLogs: number;
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  complianceRate: number;
  complianceGrade: string;
}