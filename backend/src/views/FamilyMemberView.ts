import { FamilyMember } from '../models/FamilyMember';

export interface FamilyMemberResponse {
  id: string;
  name: string;
  type: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  species?: string;
  activePrescriptionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberDetailResponse extends FamilyMemberResponse {
  prescriptions: {
    id: string;
    medication: {
      id: string;
      name: string;
      dosage: string;
      frequency: string;
    };
    startDate: string;
    endDate?: string;
    active: boolean;
  }[];
}

export class FamilyMemberView {
  static format(familyMember: FamilyMember): FamilyMemberResponse {
    const age = familyMember.dateOfBirth 
      ? this.calculateAge(familyMember.dateOfBirth)
      : undefined;

    const activePrescriptionsCount = familyMember.prescriptions
      ? familyMember.prescriptions.filter(p => p.active).length
      : 0;

    return {
      id: familyMember.id,
      name: familyMember.name,
      type: familyMember.type,
      dateOfBirth: familyMember.dateOfBirth 
        ? (familyMember.dateOfBirth instanceof Date 
          ? familyMember.dateOfBirth.toISOString().split('T')[0]
          : String(familyMember.dateOfBirth).split('T')[0])
        : undefined,
      age,
      gender: familyMember.gender,
      species: familyMember.species,
      activePrescriptionsCount,
      createdAt: familyMember.createdAt.toISOString(),
      updatedAt: familyMember.updatedAt.toISOString()
    };
  }

  static formatDetailed(familyMember: FamilyMember): FamilyMemberDetailResponse {
    const baseResponse = this.format(familyMember);

    const prescriptions = familyMember.prescriptions?.map(prescription => ({
      id: prescription.id,
      medication: {
        id: prescription.medication.id,
        name: prescription.medication.name,
        dosage: prescription.medication.dosage,
        frequency: prescription.medication.frequency
      },
      startDate: prescription.startDate instanceof Date 
        ? prescription.startDate.toISOString().split('T')[0]
        : String(prescription.startDate).split('T')[0],
      endDate: prescription.endDate 
        ? (prescription.endDate instanceof Date 
          ? prescription.endDate.toISOString().split('T')[0]
          : String(prescription.endDate).split('T')[0])
        : undefined,
      active: prescription.active
    })) || [];

    return {
      ...baseResponse,
      prescriptions
    };
  }

  static formatList(familyMembers: FamilyMember[]): FamilyMemberResponse[] {
    return familyMembers.map(member => this.format(member));
  }

  private static calculateAge(birthDate: Date | string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}