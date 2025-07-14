import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { MedicationLog, MedicationStatus } from '../models/MedicationLog';
import { PrescriptionService } from './PrescriptionService';
import { AppError } from '../middleware/errorHandler';

export interface CreateMedicationLogDTO {
  prescriptionId: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: MedicationStatus;
  notes?: string;
}

export interface UpdateMedicationLogDTO {
  takenTime?: Date;
  status?: MedicationStatus;
  notes?: string;
}

export interface MedicationLogStats {
  totalLogs: number;
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  complianceRate: number;
}

export class MedicationLogService {
  private medicationLogRepository: Repository<MedicationLog>;
  private prescriptionService: PrescriptionService;

  constructor() {
    this.medicationLogRepository = AppDataSource.getRepository(MedicationLog);
    this.prescriptionService = new PrescriptionService();
  }

  async create(data: CreateMedicationLogDTO): Promise<MedicationLog> {
    await this.prescriptionService.findById(data.prescriptionId);

    const medicationLog = this.medicationLogRepository.create({
      ...data,
      takenTime: data.status === MedicationStatus.TAKEN ? (data.takenTime || new Date()) : data.takenTime
    });

    return await this.medicationLogRepository.save(medicationLog);
  }

  async findAll(): Promise<MedicationLog[]> {
    return await this.medicationLogRepository.find({
      relations: ['prescription', 'prescription.familyMember', 'prescription.medication'],
      order: { scheduledTime: 'DESC' }
    });
  }

  async findById(id: string): Promise<MedicationLog> {
    const medicationLog = await this.medicationLogRepository.findOne({
      where: { id },
      relations: ['prescription', 'prescription.familyMember', 'prescription.medication']
    });

    if (!medicationLog) {
      throw new AppError('Medication log not found', 404);
    }

    return medicationLog;
  }

  async findByPrescription(prescriptionId: string): Promise<MedicationLog[]> {
    await this.prescriptionService.findById(prescriptionId);

    return await this.medicationLogRepository.find({
      where: { prescriptionId },
      relations: ['prescription', 'prescription.familyMember', 'prescription.medication'],
      order: { scheduledTime: 'DESC' }
    });
  }

  async findByFamilyMember(familyMemberId: string): Promise<MedicationLog[]> {
    return await this.medicationLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.prescription', 'prescription')
      .leftJoinAndSelect('prescription.familyMember', 'familyMember')
      .leftJoinAndSelect('prescription.medication', 'medication')
      .where('prescription.familyMemberId = :familyMemberId', { familyMemberId })
      .orderBy('log.scheduledTime', 'DESC')
      .getMany();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<MedicationLog[]> {
    return await this.medicationLogRepository.find({
      where: {
        scheduledTime: Between(startDate, endDate)
      },
      relations: ['prescription', 'prescription.familyMember', 'prescription.medication'],
      order: { scheduledTime: 'ASC' }
    });
  }

  async findTodaysLogs(familyMemberId?: string): Promise<MedicationLog[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const queryBuilder = this.medicationLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.prescription', 'prescription')
      .leftJoinAndSelect('prescription.familyMember', 'familyMember')
      .leftJoinAndSelect('prescription.medication', 'medication')
      .where('log.scheduledTime BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay });

    if (familyMemberId) {
      queryBuilder.andWhere('prescription.familyMemberId = :familyMemberId', { familyMemberId });
    }

    return await queryBuilder
      .orderBy('log.scheduledTime', 'ASC')
      .getMany();
  }

  async update(id: string, data: UpdateMedicationLogDTO): Promise<MedicationLog> {
    const medicationLog = await this.findById(id);

    Object.assign(medicationLog, data);

    if (data.status === MedicationStatus.TAKEN && !data.takenTime && !medicationLog.takenTime) {
      medicationLog.takenTime = new Date();
    }

    return await this.medicationLogRepository.save(medicationLog);
  }

  async markAsTaken(id: string, takenTime?: Date): Promise<MedicationLog> {
    return await this.update(id, {
      status: MedicationStatus.TAKEN,
      takenTime: takenTime || new Date()
    });
  }

  async markAsMissed(id: string): Promise<MedicationLog> {
    return await this.update(id, {
      status: MedicationStatus.MISSED,
      takenTime: undefined
    });
  }

  async markAsSkipped(id: string, notes?: string): Promise<MedicationLog> {
    return await this.update(id, {
      status: MedicationStatus.SKIPPED,
      takenTime: undefined,
      notes
    });
  }

  async getComplianceStats(familyMemberId?: string, days: number = 30): Promise<MedicationLogStats> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const queryBuilder = this.medicationLogRepository
      .createQueryBuilder('log')
      .leftJoin('log.prescription', 'prescription')
      .where('log.scheduledTime BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (familyMemberId) {
      queryBuilder.andWhere('prescription.familyMemberId = :familyMemberId', { familyMemberId });
    }

    const logs = await queryBuilder.getMany();

    const totalLogs = logs.length;
    const takenCount = logs.filter(log => log.status === MedicationStatus.TAKEN).length;
    const missedCount = logs.filter(log => log.status === MedicationStatus.MISSED).length;
    const skippedCount = logs.filter(log => log.status === MedicationStatus.SKIPPED).length;
    const complianceRate = totalLogs > 0 ? (takenCount / totalLogs) * 100 : 0;

    return {
      totalLogs,
      takenCount,
      missedCount,
      skippedCount,
      complianceRate: Math.round(complianceRate * 100) / 100
    };
  }

  async delete(id: string): Promise<void> {
    const medicationLog = await this.findById(id);
    await this.medicationLogRepository.remove(medicationLog);
  }
}