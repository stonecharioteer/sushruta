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
      startDate: prescription.startDate.toISOString().split('T')[0],
      endDate: prescription.endDate?.toISOString().split('T')[0],
      active: prescription.active,
      logCount,
      createdAt: prescription.createdAt.toISOString(),
      updatedAt: prescription.updatedAt.toISOString()
    };
  }

  static formatDetailed(prescription: Prescription): PrescriptionDetailResponse {
    const baseResponse = this.format(prescription);

    const medicationLogs = prescription.medicationLogs?.map(log => ({
      id: log.id,
      scheduledTime: log.scheduledTime.toISOString(),
      takenTime: log.takenTime?.toISOString(),
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