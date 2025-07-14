import { FamilyMemberService } from '../../../src/services/FamilyMemberService';
import { FamilyMemberType } from '../../../src/models/FamilyMember';
import { AppError } from '../../../src/middleware/errorHandler';
import { testFamilyMembers } from '../../fixtures/testData';

describe('FamilyMemberService', () => {
  let familyMemberService: FamilyMemberService;

  beforeEach(() => {
    familyMemberService = new FamilyMemberService();
  });

  describe('create', () => {
    it('should create a new family member', async () => {
      const familyMemberData = testFamilyMembers[0];
      
      const result = await familyMemberService.create(familyMemberData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(familyMemberData.name);
      expect(result.type).toBe(familyMemberData.type);
      expect(result.id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all family members', async () => {
      // Create test data
      await familyMemberService.create(testFamilyMembers[0]);
      await familyMemberService.create(testFamilyMembers[1]);
      
      const result = await familyMemberService.findAll();
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe(testFamilyMembers[0].name);
      expect(result[1].name).toBe(testFamilyMembers[1].name);
    });

    it('should return empty array when no family members exist', async () => {
      const result = await familyMemberService.findAll();
      
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return family member by id', async () => {
      const created = await familyMemberService.create(testFamilyMembers[0]);
      
      const result = await familyMemberService.findById(created.id);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.name).toBe(testFamilyMembers[0].name);
    });

    it('should throw error when family member not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await expect(familyMemberService.findById(nonExistentId))
        .rejects.toThrow(AppError);
    });
  });

  describe('update', () => {
    it('should update family member', async () => {
      const created = await familyMemberService.create(testFamilyMembers[0]);
      const updateData = { name: 'Jane Doe' };
      
      const result = await familyMemberService.update(created.id, updateData);
      
      expect(result.name).toBe('Jane Doe');
      expect(result.id).toBe(created.id);
    });

    it('should throw error when updating non-existent family member', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await expect(familyMemberService.update(nonExistentId, { name: 'Test' }))
        .rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete family member', async () => {
      const created = await familyMemberService.create(testFamilyMembers[0]);
      
      await familyMemberService.delete(created.id);
      
      await expect(familyMemberService.findById(created.id))
        .rejects.toThrow(AppError);
    });
  });

  describe('findByType', () => {
    it('should return family members filtered by type', async () => {
      await familyMemberService.create(testFamilyMembers[0]); // HUMAN
      await familyMemberService.create(testFamilyMembers[1]); // PET
      
      const humans = await familyMemberService.findByType(FamilyMemberType.HUMAN);
      const pets = await familyMemberService.findByType(FamilyMemberType.PET);
      
      expect(humans).toHaveLength(1);
      expect(humans[0].type).toBe(FamilyMemberType.HUMAN);
      
      expect(pets).toHaveLength(1);
      expect(pets[0].type).toBe(FamilyMemberType.PET);
    });
  });
});