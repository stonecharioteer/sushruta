import { Medication } from '../models/Medication';

export interface MedicationResponse {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  activePrescriptionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDetailResponse extends MedicationResponse {
  prescriptions: {
    id: string;
    familyMember: {
      id: string;
      name: string;
      type: string;
    };
    startDate: string;
    endDate?: string;
    active: boolean;
  }[];
}

export class MedicationView {
  static format(medication: Medication): MedicationResponse {
    const activePrescriptionsCount = medication.prescriptions
      ? medication.prescriptions.filter(p => p.active).length
      : 0;

    return {
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      instructions: medication.instructions,
      activePrescriptionsCount,
      createdAt: medication.createdAt.toISOString(),
      updatedAt: medication.updatedAt.toISOString()
    };
  }

  static formatDetailed(medication: Medication): MedicationDetailResponse {
    const baseResponse = this.format(medication);

    const prescriptions = medication.prescriptions?.map(prescription => ({
      id: prescription.id,
      familyMember: {
        id: prescription.familyMember.id,
        name: prescription.familyMember.name,
        type: prescription.familyMember.type
      },
      startDate: prescription.startDate.toISOString().split('T')[0],
      endDate: prescription.endDate?.toISOString().split('T')[0],
      active: prescription.active
    })) || [];

    return {
      ...baseResponse,
      prescriptions
    };
  }

  static formatList(medications: Medication[]): MedicationResponse[] {
    return medications.map(medication => this.format(medication));
  }
}