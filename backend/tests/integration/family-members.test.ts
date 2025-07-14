import request from 'supertest';
import { app } from '../../src/app';
import { DataSource } from 'typeorm';
import { testDatabaseConfig } from '../setup/database';
import { FamilyMemberType } from '../../src/models';

describe('Family Members API Integration Tests', () => {
  let server: any;
  let dataSource: DataSource;

  beforeAll(async () => {
    // Initialize test database
    dataSource = new DataSource(testDatabaseConfig);
    await dataSource.initialize();
    
    // Use the imported app
    server = app;
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    await dataSource.query('DELETE FROM family_members');
  });

  describe('POST /api/family-members', () => {
    it('should create a human family member successfully', async () => {
      const humanData = {
        name: 'John Doe',
        type: FamilyFamilyMemberType.HUMAN,
        dateOfBirth: '1990-01-15',
        notes: 'Father, no known allergies'
      };

      const response = await request(server)
        .post('/api/family-members')
        .send(humanData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        type: 'human',
        dateOfBirth: '1990-01-15T00:00:00.000Z',
        notes: 'Father, no known allergies',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should create a pet family member successfully', async () => {
      const petData = {
        name: 'Buddy',
        type: FamilyMemberType.PET,
        dateOfBirth: '2020-06-10',
        notes: 'Golden Retriever, loves treats'
      };

      const response = await request(server)
        .post('/api/family-members')
        .send(petData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Buddy',
        type: 'pet',
        dateOfBirth: '2020-06-10T00:00:00.000Z',
        notes: 'Golden Retriever, loves treats',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should create family member without optional fields', async () => {
      const minimalData = {
        name: 'Jane Smith',
        type: FamilyMemberType.HUMAN
      };

      const response = await request(server)
        .post('/api/family-members')
        .send(minimalData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Jane Smith',
        type: 'human',
        dateOfBirth: null,
        notes: null
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        type: FamilyFamilyMemberType.HUMAN
        // Missing name
      };

      const response = await request(server)
        .post('/api/family-members')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringContaining('required')
          })
        ])
      });
    });

    it('should validate member type enum', async () => {
      const invalidData = {
        name: 'Test',
        type: 'invalid_type'
      };

      const response = await request(server)
        .post('/api/family-members')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'type',
            message: expect.stringContaining('must be one of')
          })
        ])
      });
    });

    it('should validate date format', async () => {
      const invalidData = {
        name: 'Test',
        type: FamilyFamilyMemberType.HUMAN,
        dateOfBirth: 'invalid-date'
      };

      const response = await request(server)
        .post('/api/family-members')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'dateOfBirth',
            message: expect.stringContaining('date')
          })
        ])
      });
    });
  });

  describe('GET /api/family-members', () => {
    beforeEach(async () => {
      // Create test data
      await request(server)
        .post('/api/family-members')
        .send({
          name: 'John Doe',
          type: FamilyFamilyMemberType.HUMAN,
          dateOfBirth: '1990-01-15',
          notes: 'Father'
        });

      await request(server)
        .post('/api/family-members')
        .send({
          name: 'Buddy',
          type: FamilyMemberType.PET,
          dateOfBirth: '2020-06-10',
          notes: 'Golden Retriever'
        });

      await request(server)
        .post('/api/family-members')
        .send({
          name: 'Jane Smith',
          type: FamilyMemberType.HUMAN
        });
    });

    it('should retrieve all family members', async () => {
      const response = await request(server)
        .get('/api/family-members')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'John Doe', type: 'human' }),
          expect.objectContaining({ name: 'Buddy', type: 'pet' }),
          expect.objectContaining({ name: 'Jane Smith', type: 'human' })
        ])
      );
    });

    it('should filter by member type', async () => {
      const response = await request(server)
        .get('/api/family-members?type=human')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every((member: any) => member.type === 'human')).toBe(true);
    });

    it('should filter by pet type', async () => {
      const response = await request(server)
        .get('/api/family-members?type=pet')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ name: 'Buddy', type: 'pet' });
    });
  });

  describe('GET /api/family-members/:id', () => {
    let memberId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/family-members')
        .send({
          name: 'John Doe',
          type: FamilyFamilyMemberType.HUMAN,
          dateOfBirth: '1990-01-15',
          notes: 'Father'
        });
      memberId = response.body.id;
    });

    it('should retrieve a specific family member', async () => {
      const response = await request(server)
        .get(`/api/family-members/${memberId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: memberId,
        name: 'John Doe',
        type: 'human',
        dateOfBirth: '1990-01-15T00:00:00.000Z',
        notes: 'Father'
      });
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(server)
        .get('/api/family-members/non-existent-id')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Family member not found'
      });
    });
  });

  describe('PUT /api/family-members/:id', () => {
    let memberId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/family-members')
        .send({
          name: 'John Doe',
          type: FamilyFamilyMemberType.HUMAN,
          dateOfBirth: '1990-01-15',
          notes: 'Father'
        });
      memberId = response.body.id;
    });

    it('should update a family member successfully', async () => {
      const updateData = {
        name: 'John Smith',
        type: FamilyFamilyMemberType.HUMAN,
        dateOfBirth: '1990-01-15',
        notes: 'Father, updated notes'
      };

      const response = await request(server)
        .put(`/api/family-members/${memberId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: memberId,
        name: 'John Smith',
        notes: 'Father, updated notes'
      });
    });

    it('should validate update data', async () => {
      const invalidData = {
        name: '', // Empty name
        type: FamilyMemberType.HUMAN
      };

      const response = await request(server)
        .put(`/api/family-members/${memberId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('DELETE /api/family-members/:id', () => {
    let memberId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/family-members')
        .send({
          name: 'John Doe',
          type: FamilyMemberType.HUMAN
        });
      memberId = response.body.id;
    });

    it('should delete a family member successfully', async () => {
      await request(server)
        .delete(`/api/family-members/${memberId}`)
        .expect(204);

      // Verify deletion
      await request(server)
        .get(`/api/family-members/${memberId}`)
        .expect(404);
    });

    it('should return 404 for non-existent member', async () => {
      await request(server)
        .delete('/api/family-members/non-existent-id')
        .expect(404);
    });
  });

  describe('Edge Cases and Data Integrity', () => {
    it('should handle special characters in names', async () => {
      const specialData = {
        name: "O'Connor-Smith Jr.",
        type: FamilyFamilyMemberType.HUMAN,
        notes: 'Special chars: àáâãäåæçèéêë'
      };

      const response = await request(server)
        .post('/api/family-members')
        .send(specialData)
        .expect(201);

      expect(response.body.name).toBe("O'Connor-Smith Jr.");
      expect(response.body.notes).toBe('Special chars: àáâãäåæçèéêë');
    });

    it('should handle very long names and notes', async () => {
      const longName = 'A'.repeat(255); // Max length
      const longNotes = 'B'.repeat(1000);

      const response = await request(server)
        .post('/api/family-members')
        .send({
          name: longName,
          type: FamilyFamilyMemberType.HUMAN,
          notes: longNotes
        })
        .expect(201);

      expect(response.body.name).toBe(longName);
      expect(response.body.notes).toBe(longNotes);
    });

    it('should handle future birth dates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const response = await request(server)
        .post('/api/family-members')
        .send({
          name: 'Future Baby',
          type: FamilyFamilyMemberType.HUMAN,
          dateOfBirth: futureDate.toISOString().split('T')[0]
        })
        .expect(201);

      expect(response.body.dateOfBirth).toContain(futureDate.getFullYear().toString());
    });

    it('should handle multiple pets with same name', async () => {
      await request(server)
        .post('/api/family-members')
        .send({
          name: 'Buddy',
          type: FamilyMemberType.PET,
          notes: 'First Buddy - Golden Retriever'
        })
        .expect(201);

      await request(server)
        .post('/api/family-members')
        .send({
          name: 'Buddy',
          type: FamilyMemberType.PET,
          notes: 'Second Buddy - Labrador'
        })
        .expect(201);

      const response = await request(server)
        .get('/api/family-members')
        .expect(200);

      const buddies = response.body.filter((member: any) => member.name === 'Buddy');
      expect(buddies).toHaveLength(2);
    });
  });
});