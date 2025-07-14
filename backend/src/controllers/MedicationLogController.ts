import { Request, Response, NextFunction } from 'express';
import { MedicationLogService } from '../services/MedicationLogService';
import { MedicationLogView, ResponseFormatter } from '../views';

export class MedicationLogController {
  private medicationLogService: MedicationLogService;

  constructor() {
    this.medicationLogService = new MedicationLogService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicationLog = await this.medicationLogService.create(req.body);
      const response = MedicationLogView.format(medicationLog);
      
      res.status(201).json(ResponseFormatter.created(response, 'Medication log created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { prescriptionId, familyMemberId, startDate, endDate } = req.query;
      
      let medicationLogs;
      
      if (startDate && endDate && typeof startDate === 'string' && typeof endDate === 'string') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        medicationLogs = await this.medicationLogService.findByDateRange(start, end);
      } else if (prescriptionId && typeof prescriptionId === 'string') {
        medicationLogs = await this.medicationLogService.findByPrescription(prescriptionId);
      } else if (familyMemberId && typeof familyMemberId === 'string') {
        medicationLogs = await this.medicationLogService.findByFamilyMember(familyMemberId);
      } else {
        medicationLogs = await this.medicationLogService.findAll();
      }

      const response = MedicationLogView.formatList(medicationLogs);
      res.json(ResponseFormatter.success(response, 'Medication logs retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const medicationLog = await this.medicationLogService.findById(id);
      const response = MedicationLogView.format(medicationLog);
      
      res.json(ResponseFormatter.success(response, 'Medication log retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getTodaysSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { familyMemberId } = req.query;
      
      const todaysLogs = await this.medicationLogService.findTodaysLogs(
        familyMemberId && typeof familyMemberId === 'string' ? familyMemberId : undefined
      );

      const response = MedicationLogView.formatDailySchedule(todaysLogs, new Date());
      res.json(ResponseFormatter.success(response, "Today's medication schedule retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  getComplianceStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { familyMemberId, days } = req.query;
      
      const daysNumber = days && typeof days === 'string' ? parseInt(days) : 30;
      const stats = await this.medicationLogService.getComplianceStats(
        familyMemberId && typeof familyMemberId === 'string' ? familyMemberId : undefined,
        daysNumber
      );

      const response = MedicationLogView.formatComplianceStats(stats, daysNumber);
      res.json(ResponseFormatter.success(response, 'Compliance statistics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const medicationLog = await this.medicationLogService.update(id, req.body);
      const response = MedicationLogView.format(medicationLog);
      
      res.json(ResponseFormatter.updated(response, 'Medication log updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  markAsTaken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { takenTime } = req.body;
      
      const medicationLog = await this.medicationLogService.markAsTaken(
        id, 
        takenTime ? new Date(takenTime) : undefined
      );
      const response = MedicationLogView.format(medicationLog);
      
      res.json(ResponseFormatter.updated(response, 'Medication marked as taken successfully'));
    } catch (error) {
      next(error);
    }
  };

  markAsMissed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const medicationLog = await this.medicationLogService.markAsMissed(id);
      const response = MedicationLogView.format(medicationLog);
      
      res.json(ResponseFormatter.updated(response, 'Medication marked as missed successfully'));
    } catch (error) {
      next(error);
    }
  };

  markAsSkipped = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const medicationLog = await this.medicationLogService.markAsSkipped(id, notes);
      const response = MedicationLogView.format(medicationLog);
      
      res.json(ResponseFormatter.updated(response, 'Medication marked as skipped successfully'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.medicationLogService.delete(id);
      
      res.json(ResponseFormatter.deleted('Medication log deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}