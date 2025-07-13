import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { FamilyMember, FamilyMemberType } from '@/models/FamilyMember';
import { AppError } from '@/middleware/errorHandler';

export interface CreateFamilyMemberDTO {
  name: string;
  type: FamilyMemberType;
  dateOfBirth?: Date;
}

export interface UpdateFamilyMemberDTO {
  name?: string;
  type?: FamilyMemberType;
  dateOfBirth?: Date;
}

export class FamilyMemberService {
  private familyMemberRepository: Repository<FamilyMember>;

  constructor() {
    this.familyMemberRepository = AppDataSource.getRepository(FamilyMember);
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