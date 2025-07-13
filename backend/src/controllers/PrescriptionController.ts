import { Request, Response, NextFunction } from 'express';
import { PrescriptionService } from '@/services/PrescriptionService';
import { PrescriptionView, ResponseFormatter } from '@/views';

export class PrescriptionController {
  private prescriptionService: PrescriptionService;

  constructor() {
    this.prescriptionService = new PrescriptionService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prescription = await this.prescriptionService.create(req.body);
      const response = PrescriptionView.format(prescription);
      
      res.status(201).json(ResponseFormatter.created(response, 'Prescription created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { familyMemberId, active } = req.query;
      
      let prescriptions;
      if (familyMemberId && typeof familyMemberId === 'string') {
        if (active === 'true') {
          prescriptions = await this.prescriptionService.findActivePrescriptionsByFamilyMember(familyMemberId);
        } else {
          prescriptions = await this.prescriptionService.findByFamilyMember(familyMemberId);
        }
      } else if (active === 'true') {
        prescriptions = await this.prescriptionService.findActivePrescriptions();
      } else {
        prescriptions = await this.prescriptionService.findAll();
      }

      const response = PrescriptionView.formatList(prescriptions);
      res.json(ResponseFormatter.success(response, 'Prescriptions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.findById(id);
      const response = PrescriptionView.formatDetailed(prescription);
      
      res.json(ResponseFormatter.success(response, 'Prescription retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.update(id, req.body);
      const response = PrescriptionView.format(prescription);
      
      res.json(ResponseFormatter.updated(response, 'Prescription updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.deactivate(id);
      const response = PrescriptionView.format(prescription);
      
      res.json(ResponseFormatter.updated(response, 'Prescription deactivated successfully'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.prescriptionService.delete(id);
      
      res.json(ResponseFormatter.deleted('Prescription deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}