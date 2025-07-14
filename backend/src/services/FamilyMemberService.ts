import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { FamilyMember, FamilyMemberType, Gender, Species } from '../models/FamilyMember';
import { Prescription } from '../models/Prescription';
import { MedicationLog } from '../models/MedicationLog';
import { AppError } from '../middleware/errorHandler';

export interface CreateFamilyMemberDTO {
  name: string;
  type: FamilyMemberType;
  dateOfBirth?: Date;
  gender?: Gender;
  species?: Species;
}

export interface UpdateFamilyMemberDTO {
  name?: string;
  type?: FamilyMemberType;
  dateOfBirth?: Date;
  gender?: Gender;
  species?: Species;
}

export class FamilyMemberService {
  private familyMemberRepository: Repository<FamilyMember>;
  private prescriptionRepository: Repository<Prescription>;
  private medicationLogRepository: Repository<MedicationLog>;

  constructor() {
    this.familyMemberRepository = AppDataSource.getRepository(FamilyMember);
    this.prescriptionRepository = AppDataSource.getRepository(Prescription);
    this.medicationLogRepository = AppDataSource.getRepository(MedicationLog);
  }

  async create(data: CreateFamilyMemberDTO): Promise<FamilyMember> {
    const familyMember = this.familyMemberRepository.create(data);
    return await this.familyMemberRepository.save(familyMember);
  }

  async findAll(): Promise<FamilyMember[]> {
    return await this.familyMemberRepository.find({
      relations: ['prescriptions', 'prescriptions.medication'],
      order: { name: 'ASC' }
    });
  }

  async findById(id: string): Promise<FamilyMember> {
    const familyMember = await this.familyMemberRepository.findOne({
      where: { id },
      relations: ['prescriptions', 'prescriptions.medication']
    });

    if (!familyMember) {
      throw new AppError('Family member not found', 404);
    }

    return familyMember;
  }

  async update(id: string, data: UpdateFamilyMemberDTO): Promise<FamilyMember> {
    const familyMember = await this.findById(id);
    
    Object.assign(familyMember, data);
    return await this.familyMemberRepository.save(familyMember);
  }

  async delete(id: string): Promise<void> {
    const familyMember = await this.findById(id);
    
    // First, get all prescriptions for this family member
    const prescriptions = await this.prescriptionRepository.find({
      where: { familyMemberId: id }
    });

    // Delete medication logs for each prescription
    for (const prescription of prescriptions) {
      await this.medicationLogRepository.delete({ prescriptionId: prescription.id });
    }

    // Delete all prescriptions for this family member
    await this.prescriptionRepository.delete({ familyMemberId: id });

    // Finally, delete the family member
    await this.familyMemberRepository.remove(familyMember);
  }

  async findByType(type: FamilyMemberType): Promise<FamilyMember[]> {
    return await this.familyMemberRepository.find({
      where: { type },
      relations: ['prescriptions', 'prescriptions.medication'],
      order: { name: 'ASC' }
    });
  }
}