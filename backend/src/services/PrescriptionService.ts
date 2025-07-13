import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { Prescription } from '@/models/Prescription';
import { FamilyMemberService } from './FamilyMemberService';
import { MedicationService } from './MedicationService';
import { AppError } from '@/middleware/errorHandler';

export interface CreatePrescriptionDTO {
  familyMemberId: string;
  medicationId: string;
  startDate: Date;
  endDate?: Date;
  active?: boolean;
}

export interface UpdatePrescriptionDTO {
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
}

export class PrescriptionService {
  private prescriptionRepository: Repository<Prescription>;
  private familyMemberService: FamilyMemberService;
  private medicationService: MedicationService;

  constructor() {
    this.prescriptionRepository = AppDataSource.getRepository(Prescription);
    this.familyMemberService = new FamilyMemberService();
    this.medicationService = new MedicationService();
  }

  async create(data: CreatePrescriptionDTO): Promise<Prescription> {
    await this.familyMemberService.findById(data.familyMemberId);
    await this.medicationService.findById(data.medicationId);

    const existingPrescription = await this.prescriptionRepository.findOne({
      where: {
        familyMemberId: data.familyMemberId,
        medicationId: data.medicationId,
        active: true
      }
    });

    if (existingPrescription) {
      throw new AppError('Active prescription already exists for this medication and family member', 409);
    }

    const prescription = this.prescriptionRepository.create({
      ...data,
      active: data.active ?? true
    });

    return await this.prescriptionRepository.save(prescription);
  }

  async findAll(): Promise<Prescription[]> {
    return await this.prescriptionRepository.find({
      relations: ['familyMember', 'medication', 'medicationLogs'],
      order: { startDate: 'DESC' }
    });
  }

  async findById(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['familyMember', 'medication', 'medicationLogs']
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    return prescription;
  }

  async findByFamilyMember(familyMemberId: string): Promise<Prescription[]> {
    await this.familyMemberService.findById(familyMemberId);

    return await this.prescriptionRepository.find({
      where: { familyMemberId },
      relations: ['medication', 'medicationLogs'],
      order: { startDate: 'DESC' }
    });
  }

  async findActivePrescriptions(): Promise<Prescription[]> {
    return await this.prescriptionRepository.find({
      where: { active: true },
      relations: ['familyMember', 'medication', 'medicationLogs'],
      order: { startDate: 'DESC' }
    });
  }

  async findActivePrescriptionsByFamilyMember(familyMemberId: string): Promise<Prescription[]> {
    await this.familyMemberService.findById(familyMemberId);

    return await this.prescriptionRepository.find({
      where: { 
        familyMemberId,
        active: true 
      },
      relations: ['medication', 'medicationLogs'],
      order: { startDate: 'DESC' }
    });
  }

  async update(id: string, data: UpdatePrescriptionDTO): Promise<Prescription> {
    const prescription = await this.findById(id);

    if (data.endDate && data.startDate && data.endDate <= data.startDate) {
      throw new AppError('End date must be after start date', 400);
    }

    Object.assign(prescription, data);
    return await this.prescriptionRepository.save(prescription);
  }

  async deactivate(id: string): Promise<Prescription> {
    return await this.update(id, { active: false, endDate: new Date() });
  }

  async delete(id: string): Promise<void> {
    const prescription = await this.findById(id);
    await this.prescriptionRepository.remove(prescription);
  }
}