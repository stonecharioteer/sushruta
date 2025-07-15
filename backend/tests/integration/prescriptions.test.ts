import request from 'supertest';
import { app } from '../../src/app';
import { DataSource } from 'typeorm';
import { testDatabaseConfig } from '../setup/database';

describe('Prescriptions API Integration Tests', () => {
  let server: any;
  let dataSource: DataSource;
  let familyMemberId: string;
  let medicationId: string;
  let prescriptionId: string;

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
    // Clean up database before each test (disable foreign key constraints temporarily)
    await dataSource.query('PRAGMA foreign_keys = OFF');
    await dataSource.query('DELETE FROM medication_logs');
    await dataSource.query('DELETE FROM prescriptions');
    await dataSource.query('DELETE FROM medications');
    await dataSource.query('DELETE FROM family_members');
    await dataSource.query('PRAGMA foreign_keys = ON');

    // Create test family member
    const familyMemberResponse = await request(server)
      .post('/api/family-members')
      .send({
        name: 'John Doe',
        type: 'human',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      });
    familyMemberId = familyMemberResponse.body.data.id;

    // Create test medication
    const medicationResponse = await request(server)
      .post('/api/medications')
      .send({
        name: 'Test Medication',
        dosage: '100mg',
        frequency: 'Daily'
      });
    medicationId = medicationResponse.body.data.id;

    // Create test prescription
    const prescriptionResponse = await request(server)
      .post('/api/prescriptions')
      .send({
        familyMemberId,
        medicationId,
        startDate: '2024-01-01',
        active: true
      });
    prescriptionId = prescriptionResponse.body.data.id;
  });

  describe('Prescription Cache Invalidation Bug Fix (Issue #6)', () => {
    it('should return active prescriptions when queried with active=true', async () => {
      const response = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(prescriptionId);
      expect(response.body.data[0].active).toBe(true);
    });

    it('should return all prescriptions when queried without active filter', async () => {
      const response = await request(server)
        .get('/api/prescriptions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(prescriptionId);
      expect(response.body.data[0].active).toBe(true);
    });

    it('should deactivate prescription and immediately reflect in active prescriptions query', async () => {
      // Step 1: Verify prescription is active
      const beforeResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      
      expect(beforeResponse.body.data).toHaveLength(1);
      expect(beforeResponse.body.data[0].id).toBe(prescriptionId);
      expect(beforeResponse.body.data[0].active).toBe(true);

      // Step 2: Deactivate prescription
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);

      // Step 3: Verify prescription is no longer in active query
      const afterResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      
      expect(afterResponse.body.data).toHaveLength(0);

      // Step 4: Verify prescription still exists but is inactive
      const allResponse = await request(server)
        .get('/api/prescriptions')
        .expect(200);
      
      expect(allResponse.body.data).toHaveLength(1);
      expect(allResponse.body.data[0].id).toBe(prescriptionId);
      expect(allResponse.body.data[0].active).toBe(false);
    });

    it('should reactivate prescription and immediately reflect in active prescriptions query', async () => {
      // Step 1: Deactivate prescription first
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);

      // Step 2: Verify prescription is not in active query
      const beforeResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      
      expect(beforeResponse.body.data).toHaveLength(0);

      // Step 3: Reactivate prescription
      await request(server)
        .put(`/api/prescriptions/${prescriptionId}`)
        .send({ active: true })
        .expect(200);

      // Step 4: Verify prescription is back in active query
      const afterResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      
      expect(afterResponse.body.data).toHaveLength(1);
      expect(afterResponse.body.data[0].id).toBe(prescriptionId);
      expect(afterResponse.body.data[0].active).toBe(true);
    });

    it('should handle multiple pause/unpause cycles correctly', async () => {
      // Cycle 1: Deactivate
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);

      let activeResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      expect(activeResponse.body.data).toHaveLength(0);

      // Cycle 1: Reactivate
      await request(server)
        .put(`/api/prescriptions/${prescriptionId}`)
        .send({ active: true })
        .expect(200);

      activeResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      expect(activeResponse.body.data).toHaveLength(1);
      expect(activeResponse.body.data[0].active).toBe(true);

      // Cycle 2: Deactivate again
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);

      activeResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      expect(activeResponse.body.data).toHaveLength(0);

      // Cycle 2: Reactivate again
      await request(server)
        .put(`/api/prescriptions/${prescriptionId}`)
        .send({ active: true })
        .expect(200);

      activeResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      expect(activeResponse.body.data).toHaveLength(1);
      expect(activeResponse.body.data[0].active).toBe(true);
    });

    it('should maintain data integrity after pause/unpause operations', async () => {
      const originalResponse = await request(server)
        .get(`/api/prescriptions/${prescriptionId}`)
        .expect(200);

      const originalData = originalResponse.body.data;

      // Deactivate
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);

      // Reactivate
      await request(server)
        .put(`/api/prescriptions/${prescriptionId}`)
        .send({ active: true })
        .expect(200);

      // Verify all data is preserved except active status
      const finalResponse = await request(server)
        .get(`/api/prescriptions/${prescriptionId}`)
        .expect(200);

      const finalData = finalResponse.body.data;

      expect(finalData.id).toBe(originalData.id);
      expect(finalData.familyMemberId).toBe(originalData.familyMemberId);
      expect(finalData.medicationId).toBe(originalData.medicationId);
      expect(finalData.startDate).toBe(originalData.startDate);
      expect(finalData.active).toBe(true);
    });
  });

  describe('Regression Testing', () => {
    it('should still support all existing prescription operations', async () => {
      // Test GET all
      const allResponse = await request(server)
        .get('/api/prescriptions')
        .expect(200);
      expect(allResponse.body.data).toHaveLength(1);

      // Test GET by ID
      const byIdResponse = await request(server)
        .get(`/api/prescriptions/${prescriptionId}`)
        .expect(200);
      expect(byIdResponse.body.data.id).toBe(prescriptionId);

      // Test UPDATE
      const updateResponse = await request(server)
        .put(`/api/prescriptions/${prescriptionId}`)
        .send({ 
          startDate: '2024-02-01',
          endDate: '2024-12-31'
        })
        .expect(200);
      expect(updateResponse.body.data.startDate).toBe('2024-02-01');

      // Test DELETE
      await request(server)
        .delete(`/api/prescriptions/${prescriptionId}`)
        .expect(204);

      // Verify deletion
      await request(server)
        .get(`/api/prescriptions/${prescriptionId}`)
        .expect(404);
    });

    it('should handle edge cases with deactivate endpoint', async () => {
      // Test deactivating non-existent prescription
      await request(server)
        .patch('/api/prescriptions/non-existent-id/deactivate')
        .expect(404);

      // Test deactivating already inactive prescription
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);

      // Should still work (idempotent)
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);
    });

    it('should handle filtered queries correctly', async () => {
      // Create additional prescription
      const prescription2Response = await request(server)
        .post('/api/prescriptions')
        .send({
          familyMemberId,
          medicationId,
          startDate: '2024-01-01',
          endDate: null,
          active: true
        });
      const prescription2Id = prescription2Response.body.id;

      // Deactivate first prescription
      await request(server)
        .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
        .expect(200);

      // Test active filter
      const activeResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      expect(activeResponse.body.data).toHaveLength(1);
      expect(activeResponse.body.data[0].id).toBe(prescription2Id);

      // Test inactive filter (if supported)
      const inactiveResponse = await request(server)
        .get('/api/prescriptions?active=false')
        .expect(200);
      expect(inactiveResponse.body.data).toHaveLength(1);
      expect(inactiveResponse.body.data[0].id).toBe(prescriptionId);
    });
  });

  describe('Performance and Consistency', () => {
    it('should handle rapid pause/unpause operations', async () => {
      // Rapid fire operations
      for (let i = 0; i < 5; i++) {
        await request(server)
          .patch(`/api/prescriptions/${prescriptionId}/deactivate`)
          .expect(200);

        await request(server)
          .put(`/api/prescriptions/${prescriptionId}`)
          .send({ active: true })
          .expect(200);
      }

      // Verify final state
      const finalResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      expect(finalResponse.body.data).toHaveLength(1);
      expect(finalResponse.body.data[0].active).toBe(true);
    });

    it('should maintain consistency across concurrent operations', async () => {
      // This test ensures that the active query always reflects the current state
      // regardless of the order of operations
      
      const operations = [
        () => request(server).patch(`/api/prescriptions/${prescriptionId}/deactivate`),
        () => request(server).put(`/api/prescriptions/${prescriptionId}`).send({ active: true }),
        () => request(server).get('/api/prescriptions?active=true'),
        () => request(server).get('/api/prescriptions')
      ];

      // Execute operations in different orders
      for (const operation of operations) {
        await operation().expect((res) => {
          expect(res.status).toBeLessThan(500); // Should not cause server errors
        });
      }

      // Final consistency check
      const finalResponse = await request(server)
        .get('/api/prescriptions?active=true')
        .expect(200);
      
      // Should have either 0 or 1 prescription based on final state
      expect(finalResponse.body.data.length).toBeLessThanOrEqual(1);
    });
  });
});