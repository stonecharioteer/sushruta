import { FamilyMemberType, Gender, Species } from '../../src/models/FamilyMember';
import { MedicationStatus } from '../../src/models/MedicationLog';

export const testFamilyMembers = [
  {
    name: 'John Doe',
    type: FamilyMemberType.HUMAN,
    dateOfBirth: new Date('1990-01-01'),
    gender: Gender.MALE
  },
  {
    name: 'Jane Doe',
    type: FamilyMemberType.HUMAN,
    dateOfBirth: new Date('1992-05-15'),
    gender: Gender.FEMALE
  },
  {
    name: 'Fluffy',
    type: FamilyMemberType.PET,
    dateOfBirth: new Date('2020-06-15'),
    gender: Gender.FEMALE,
    species: Species.CAT
  },
  {
    name: 'Max',
    type: FamilyMemberType.PET,
    dateOfBirth: new Date('2019-03-10'),
    gender: Gender.MALE,
    species: Species.DOG
  }
];

export const testMedications = [
  {
    name: 'Aspirin',
    dosage: '100mg',
    frequency: 'Once daily',
    instructions: 'Take with food'
  },
  {
    name: 'Vitamin D',
    dosage: '1000 IU',
    frequency: 'Once daily',
    instructions: 'Take in the morning'
  }
];

export const createTestPrescription = (familyMemberId: string, medicationId: string) => ({
  familyMemberId,
  medicationId,
  startDate: new Date(),
  active: true
});

export const createTestMedicationLog = (prescriptionId: string) => ({
  prescriptionId,
  scheduledTime: new Date(),
  status: MedicationStatus.TAKEN,
  notes: 'Test log entry'
});