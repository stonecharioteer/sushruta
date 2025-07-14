import { Request, Response, NextFunction } from 'express';
import { MedicationService } from '../services/MedicationService';
import { MedicationView, ResponseFormatter } from '../views';

export class MedicationController {
  private medicationService: MedicationService;

  constructor() {
    this.medicationService = new MedicationService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medication = await this.medicationService.create(req.body);
      const response = MedicationView.format(medication);
      
      res.status(201).json(ResponseFormatter.created(response, 'Medication created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search } = req.query;
      
      let medications;
      if (search && typeof search === 'string') {
        medications = await this.medicationService.search(search);
      } else {
        medications = await this.medicationService.findAll();
      }

      const response = MedicationView.formatList(medications);
      res.json(ResponseFormatter.success(response, 'Medications retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const medication = await this.medicationService.findById(id);
      const response = MedicationView.formatDetailed(medication);
      
      res.json(ResponseFormatter.success(response, 'Medication retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const medication = await this.medicationService.update(id, req.body);
      const response = MedicationView.format(medication);
      
      res.json(ResponseFormatter.updated(response, 'Medication updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.medicationService.delete(id);
      
      res.json(ResponseFormatter.deleted('Medication deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}