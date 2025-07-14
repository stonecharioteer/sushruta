import request from 'supertest';
import { app } from '../../../src/app';
import { testFamilyMembers } from '../../fixtures/testData';

describe('/api/family-members', () => {
  describe('POST /api/family-members', () => {
    it('should create a new family member', async () => {
      const response = await request(app)
        .post('/api/family-members')
        .send(testFamilyMembers[0])
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(testFamilyMembers[0].name);
      expect(response.body.data.type).toBe(testFamilyMembers[0].type);
      expect(response.body.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/family-members')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });

    it('should validate family member type', async () => {
      const invalidData = { ...testFamilyMembers[0], type: 'invalid' };
      
      const response = await request(app)
        .post('/api/family-members')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/family-members', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/family-members')
        .send(testFamilyMembers[0]);
      
      await request(app)
        .post('/api/family-members')
        .send(testFamilyMembers[1]);
    });

    it('should return all family members', async () => {
      const response = await request(app)
        .get('/api/family-members')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/family-members?type=human')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('human');
    });
  });

  describe('GET /api/family-members/:id', () => {
    let familyMemberId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/family-members')
        .send(testFamilyMembers[0]);
      
      familyMemberId = response.body.data.id;
    });

    it('should return family member by id', async () => {
      const response = await request(app)
        .get(`/api/family-members/${familyMemberId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(familyMemberId);
      expect(response.body.data.prescriptions).toBeDefined();
    });

    it('should return 404 for non-existent family member', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .get(`/api/family-members/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .get('/api/family-members/invalid-uuid')
        .expect(400);
    });
  });

  describe('PUT /api/family-members/:id', () => {
    let familyMemberId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/family-members')
        .send(testFamilyMembers[0]);
      
      familyMemberId = response.body.data.id;
    });

    it('should update family member', async () => {
      const updateData = { name: 'Updated Name' };
      
      const response = await request(app)
        .put(`/api/family-members/${familyMemberId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent family member', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app)
        .put(`/api/family-members/${nonExistentId}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/family-members/:id', () => {
    let familyMemberId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/family-members')
        .send(testFamilyMembers[0]);
      
      familyMemberId = response.body.data.id;
    });

    it('should delete family member', async () => {
      const response = await request(app)
        .delete(`/api/family-members/${familyMemberId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await request(app)
        .get(`/api/family-members/${familyMemberId}`)
        .expect(404);
    });

    it('should return 404 for non-existent family member', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app)
        .delete(`/api/family-members/${nonExistentId}`)
        .expect(404);
    });
  });
});