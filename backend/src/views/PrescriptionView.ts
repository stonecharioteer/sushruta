import { Prescription } from '../models/Prescription';

export interface PrescriptionResponse {
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

export interface PrescriptionDetailResponse extends PrescriptionResponse {
  medicationLogs: {
    id: string;
    scheduledTime: string;
    takenTime?: string;
    status: string;
    notes?: string;
  }[];
}

export class PrescriptionView {
  static format(prescription: Prescription): PrescriptionResponse {
    const logCount = prescription.medicationLogs?.length || 0;

    return {
      id: prescription.id,
      familyMember: {
        id: prescription.familyMember.id,
        name: prescription.familyMember.name,
        type: prescription.familyMember.type
      },
      medication: {
        id: prescription.medication.id,
        name: prescription.medication.name,
        dosage: prescription.medication.dosage,
        frequency: prescription.medication.frequency
      },
      startDate: prescription.startDate instanceof Date ? prescription.startDate.toISOString().split('T')[0] : String(prescription.startDate),
      endDate: prescription.endDate ? (prescription.endDate instanceof Date ? prescription.endDate.toISOString().split('T')[0] : String(prescription.endDate)) : undefined,
      active: prescription.active,
      logCount,
      createdAt: prescription.createdAt instanceof Date ? prescription.createdAt.toISOString() : String(prescription.createdAt),
      updatedAt: prescription.updatedAt instanceof Date ? prescription.updatedAt.toISOString() : String(prescription.updatedAt)
    };
  }

  static formatDetailed(prescription: Prescription): PrescriptionDetailResponse {
    const baseResponse = this.format(prescription);

    const medicationLogs = prescription.medicationLogs?.map(log => ({
      id: log.id,
      scheduledTime: log.scheduledTime instanceof Date ? log.scheduledTime.toISOString() : String(log.scheduledTime),
      takenTime: log.takenTime ? (log.takenTime instanceof Date ? log.takenTime.toISOString() : String(log.takenTime)) : undefined,
      status: log.status,
      notes: log.notes
    })) || [];

    return {
      ...baseResponse,
      medicationLogs
    };
  }

  static formatList(prescriptions: Prescription[]): PrescriptionResponse[] {
    return prescriptions.map(prescription => this.format(prescription));
  }
}