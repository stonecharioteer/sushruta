import request from 'supertest';
import { app } from '../../src/app';
import { DataSource } from 'typeorm';
import { testDatabaseConfig } from '../setup/database';

describe('Medications API Integration Tests', () => {
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
    await dataSource.query('DELETE FROM medications');
  });

  describe('POST /api/medications', () => {
    it('should create a medication successfully', async () => {
      const medicationData = {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily',
        instructions: 'Take with food'
      };

      const response = await request(server)
        .post('/api/medications')
        .send(medicationData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Twice daily',
          instructions: 'Take with food',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });
    });

    it('should create medication with minimal required fields', async () => {
      const minimalData = {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: 'Daily'
      };

      const response = await request(server)
        .post('/api/medications')
        .send(minimalData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'Daily',
          instructions: null
        }
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        instructions: 'Missing required fields'
        // Missing name, dosage, frequency
      };

      const response = await request(server)
        .post('/api/medications')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('required')
      });
    });
  });

  describe('GET /api/medications', () => {
    beforeEach(async () => {
      // Create test medications
      await request(server)
        .post('/api/medications')
        .send({
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Twice daily',
          instructions: 'Antibiotic'
        });

      await request(server)
        .post('/api/medications')
        .send({
          name: 'Ibuprofen',
          dosage: '200mg',
          frequency: 'As needed',
          instructions: 'Pain reliever'
        });
    });

    it('should retrieve all medications', async () => {
      const response = await request(server)
        .get('/api/medications')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Amoxicillin' }),
          expect.objectContaining({ name: 'Ibuprofen' })
        ])
      );
    });
  });

  describe('GET /api/medications/:id', () => {
    let medicationId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/medications')
        .send({
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Twice daily',
          instructions: 'Antibiotic'
        });
      medicationId = response.body.data.id;
    });

    it('should retrieve a specific medication', async () => {
      const response = await request(server)
        .get(`/api/medications/${medicationId}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: medicationId,
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily',
        instructions: 'Antibiotic'
      });
    });

    it('should return 404 for non-existent medication', async () => {
      const response = await request(server)
        .get('/api/medications/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found')
      });
    });
  });

  describe('PUT /api/medications/:id', () => {
    let medicationId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/medications')
        .send({
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Twice daily',
          instructions: 'Antibiotic'
        });
      medicationId = response.body.data.id;
    });

    it('should update a medication successfully', async () => {
      const updateData = {
        name: 'Amoxicillin Clavulanate',
        dosage: '875mg/125mg',
        frequency: 'Twice daily',
        instructions: 'Antibiotic combination'
      };

      const response = await request(server)
        .put(`/api/medications/${medicationId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: medicationId,
        name: 'Amoxicillin Clavulanate',
        dosage: '875mg/125mg',
        frequency: 'Twice daily',
        instructions: 'Antibiotic combination'
      });
    });

    it('should allow partial updates', async () => {
      const partialUpdate = {
        dosage: '250mg',
        instructions: 'Lower dose'
      };

      const response = await request(server)
        .put(`/api/medications/${medicationId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: medicationId,
        name: 'Amoxicillin', // Original name preserved
        dosage: '250mg', // Updated
        frequency: 'Twice daily', // Original frequency preserved
        instructions: 'Lower dose' // Updated
      });
    });
  });

  describe('DELETE /api/medications/:id', () => {
    let medicationId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/medications')
        .send({
          name: 'Test Medication',
          dosage: '100mg',
          frequency: 'Daily'
        });
      medicationId = response.body.data.id;
    });

    it('should delete a medication successfully', async () => {
      await request(server)
        .delete(`/api/medications/${medicationId}`)
        .expect(200);

      // Verify deletion
      await request(server)
        .get(`/api/medications/${medicationId}`)
        .expect(404);
    });

    it('should return 404 for non-existent medication', async () => {
      await request(server)
        .delete('/api/medications/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });
  });
});