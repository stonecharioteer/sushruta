import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Medication } from '../models/Medication';
import { AppError } from '../middleware/errorHandler';

export interface CreateMedicationDTO {
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

export interface UpdateMedicationDTO {
  name?: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
}

export class MedicationService {
  private medicationRepository: Repository<Medication>;

  constructor() {
    this.medicationRepository = AppDataSource.getRepository(Medication);
  }

  async create(data: CreateMedicationDTO): Promise<Medication> {
    const existingMedication = await this.medicationRepository.findOne({
      where: { name: data.name }
    });

    if (existingMedication) {
      throw new AppError('Medication with this name already exists', 409);
    }

    const medication = this.medicationRepository.create(data);
    return await this.medicationRepository.save(medication);
  }

  async findAll(): Promise<Medication[]> {
    return await this.medicationRepository.find({
      relations: ['prescriptions'],
      order: { name: 'ASC' }
    });
  }

  async findById(id: string): Promise<Medication> {
    const medication = await this.medicationRepository.findOne({
      where: { id },
      relations: ['prescriptions', 'prescriptions.familyMember']
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return medication;
  }

  async update(id: string, data: UpdateMedicationDTO): Promise<Medication> {
    const medication = await this.findById(id);

    if (data.name && data.name !== medication.name) {
      const existingMedication = await this.medicationRepository.findOne({
        where: { name: data.name }
      });

      if (existingMedication) {
        throw new AppError('Medication with this name already exists', 409);
      }
    }

    Object.assign(medication, data);
    return await this.medicationRepository.save(medication);
  }

  async delete(id: string): Promise<void> {
    const medication = await this.findById(id);
    
    if (medication.prescriptions && medication.prescriptions.length > 0) {
      throw new AppError('Cannot delete medication that has active prescriptions', 409);
    }

    await this.medicationRepository.remove(medication);
  }

  async search(query: string): Promise<Medication[]> {
    return await this.medicationRepository
      .createQueryBuilder('medication')
      .where('LOWER(medication.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(medication.instructions) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy('medication.name', 'ASC')
      .getMany();
  }
}