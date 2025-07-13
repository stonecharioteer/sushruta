import { Request, Response, NextFunction } from 'express';
import { FamilyMemberService } from '@/services/FamilyMemberService';
import { FamilyMemberView, ResponseFormatter } from '@/views';
import { FamilyMemberType } from '@/models/FamilyMember';

export class FamilyMemberController {
  private familyMemberService: FamilyMemberService;

  constructor() {
    this.familyMemberService = new FamilyMemberService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const familyMember = await this.familyMemberService.create(req.body);
      const response = FamilyMemberView.format(familyMember);
      
      res.status(201).json(ResponseFormatter.created(response, 'Family member created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.query;
      
      let familyMembers;
      if (type && Object.values(FamilyMemberType).includes(type as FamilyMemberType)) {
        familyMembers = await this.familyMemberService.findByType(type as FamilyMemberType);
      } else {
        familyMembers = await this.familyMemberService.findAll();
      }

      const response = FamilyMemberView.formatList(familyMembers);
      res.json(ResponseFormatter.success(response, 'Family members retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const familyMember = await this.familyMemberService.findById(id);
      const response = FamilyMemberView.formatDetailed(familyMember);
      
      res.json(ResponseFormatter.success(response, 'Family member retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const familyMember = await this.familyMemberService.update(id, req.body);
      const response = FamilyMemberView.format(familyMember);
      
      res.json(ResponseFormatter.updated(response, 'Family member updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.familyMemberService.delete(id);
      
      res.json(ResponseFormatter.deleted('Family member deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}