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
    it('should create a prescription medication successfully', async () => {
      const medicationData = {
        name: 'Amoxicillin',
        description: 'Antibiotic for bacterial infections',
        dosage: '500mg',
        unit: 'tablets',
        quantity: 30,
        expiryDate: '2025-12-31',
        isPrescription: true,
        notes: 'Take with food'
      };

      const response = await request(server)
        .post('/api/medications')
        .send(medicationData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Amoxicillin',
        description: 'Antibiotic for bacterial infections',
        dosage: '500mg',
        unit: 'tablets',
        quantity: 30,
        expiryDate: '2025-12-31T00:00:00.000Z',
        isPrescription: true,
        notes: 'Take with food',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should create an over-the-counter medication successfully', async () => {
      const medicationData = {
        name: 'Ibuprofen',
        description: 'Pain reliever and anti-inflammatory',
        dosage: '200mg',
        unit: 'capsules',
        quantity: 50,
        expiryDate: '2026-06-15',
        isPrescription: false,
        notes: 'Do not exceed 6 capsules in 24 hours'
      };

      const response = await request(server)
        .post('/api/medications')
        .send(medicationData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Ibuprofen',
        isPrescription: false,
        quantity: 50
      });
    });

    it('should create medication with minimal required fields', async () => {
      const minimalData = {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        unit: 'tablets',
        quantity: 60
      };

      const response = await request(server)
        .post('/api/medications')
        .send(minimalData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Vitamin D3',
        dosage: '1000 IU',
        unit: 'tablets',
        quantity: 60,
        description: null,
        expiryDate: null,
        isPrescription: false,
        notes: null
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing required fields'
        // Missing name, dosage, unit, quantity
      };

      const response = await request(server)
        .post('/api/medications')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringContaining('required')
          }),
          expect.objectContaining({
            field: 'dosage',
            message: expect.stringContaining('required')
          }),
          expect.objectContaining({
            field: 'unit',
            message: expect.stringContaining('required')
          }),
          expect.objectContaining({
            field: 'quantity',
            message: expect.stringContaining('required')
          })
        ])
      });
    });

    it('should validate quantity is positive number', async () => {
      const invalidData = {
        name: 'Test Med',
        dosage: '100mg',
        unit: 'tablets',
        quantity: -5
      };

      const response = await request(server)
        .post('/api/medications')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'quantity',
            message: expect.stringContaining('positive')
          })
        ])
      });
    });

    it('should validate expiry date format', async () => {
      const invalidData = {
        name: 'Test Med',
        dosage: '100mg',
        unit: 'tablets',
        quantity: 10,
        expiryDate: 'invalid-date'
      };

      const response = await request(server)
        .post('/api/medications')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'expiryDate',
            message: expect.stringContaining('date')
          })
        ])
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
          description: 'Antibiotic',
          dosage: '500mg',
          unit: 'tablets',
          quantity: 30,
          isPrescription: true,
          expiryDate: '2025-12-31'
        });

      await request(server)
        .post('/api/medications')
        .send({
          name: 'Ibuprofen',
          description: 'Pain reliever',
          dosage: '200mg',
          unit: 'capsules',
          quantity: 50,
          isPrescription: false,
          expiryDate: '2026-06-15'
        });

      await request(server)
        .post('/api/medications')
        .send({
          name: 'Vitamin D3',
          dosage: '1000 IU',
          unit: 'tablets',
          quantity: 60,
          isPrescription: false
        });
    });

    it('should retrieve all medications', async () => {
      const response = await request(server)
        .get('/api/medications')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Amoxicillin', isPrescription: true }),
          expect.objectContaining({ name: 'Ibuprofen', isPrescription: false }),
          expect.objectContaining({ name: 'Vitamin D3', isPrescription: false })
        ])
      );
    });

    it('should filter by prescription status', async () => {
      const response = await request(server)
        .get('/api/medications?isPrescription=true')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ name: 'Amoxicillin', isPrescription: true });
    });

    it('should filter by non-prescription status', async () => {
      const response = await request(server)
        .get('/api/medications?isPrescription=false')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every((med: any) => med.isPrescription === false)).toBe(true);
    });

    it('should search by name', async () => {
      const response = await request(server)
        .get('/api/medications?search=ibuprofen')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ name: 'Ibuprofen' });
    });

    it('should handle case-insensitive search', async () => {
      const response = await request(server)
        .get('/api/medications?search=VITAMIN')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ name: 'Vitamin D3' });
    });
  });

  describe('GET /api/medications/:id', () => {
    let medicationId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/medications')
        .send({
          name: 'Amoxicillin',
          description: 'Antibiotic',
          dosage: '500mg',
          unit: 'tablets',
          quantity: 30,
          isPrescription: true
        });
      medicationId = response.body.id;
    });

    it('should retrieve a specific medication', async () => {
      const response = await request(server)
        .get(`/api/medications/${medicationId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: medicationId,
        name: 'Amoxicillin',
        description: 'Antibiotic',
        dosage: '500mg',
        unit: 'tablets',
        quantity: 30,
        isPrescription: true
      });
    });

    it('should return 404 for non-existent medication', async () => {
      const response = await request(server)
        .get('/api/medications/non-existent-id')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Medication not found'
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
          description: 'Antibiotic',
          dosage: '500mg',
          unit: 'tablets',
          quantity: 30,
          isPrescription: true
        });
      medicationId = response.body.id;
    });

    it('should update a medication successfully', async () => {
      const updateData = {
        name: 'Amoxicillin Clavulanate',
        description: 'Antibiotic combination',
        dosage: '875mg/125mg',
        unit: 'tablets',
        quantity: 20,
        isPrescription: true,
        notes: 'Updated medication'
      };

      const response = await request(server)
        .put(`/api/medications/${medicationId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: medicationId,
        name: 'Amoxicillin Clavulanate',
        description: 'Antibiotic combination',
        dosage: '875mg/125mg',
        quantity: 20,
        notes: 'Updated medication'
      });
    });

    it('should validate update data', async () => {
      const invalidData = {
        name: '', // Empty name
        quantity: -5 // Invalid quantity
      };

      const response = await request(server)
        .put(`/api/medications/${medicationId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });

    it('should allow partial updates', async () => {
      const partialUpdate = {
        quantity: 25,
        notes: 'Quantity updated'
      };

      const response = await request(server)
        .put(`/api/medications/${medicationId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body).toMatchObject({
        id: medicationId,
        name: 'Amoxicillin', // Original name preserved
        quantity: 25, // Updated
        notes: 'Quantity updated' // Updated
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
          unit: 'tablets',
          quantity: 10
        });
      medicationId = response.body.id;
    });

    it('should delete a medication successfully', async () => {
      await request(server)
        .delete(`/api/medications/${medicationId}`)
        .expect(204);

      // Verify deletion
      await request(server)
        .get(`/api/medications/${medicationId}`)
        .expect(404);
    });

    it('should return 404 for non-existent medication', async () => {
      await request(server)
        .delete('/api/medications/non-existent-id')
        .expect(404);
    });
  });

  describe('Medication Inventory Management', () => {
    let medicationId: string;

    beforeEach(async () => {
      const response = await request(server)
        .post('/api/medications')
        .send({
          name: 'Test Med',
          dosage: '100mg',
          unit: 'tablets',
          quantity: 100
        });
      medicationId = response.body.id;
    });

    it('should handle quantity updates for inventory tracking', async () => {
      // Reduce quantity (medication taken)
      await request(server)
        .put(`/api/medications/${medicationId}`)
        .send({ quantity: 95 })
        .expect(200);

      const response = await request(server)
        .get(`/api/medications/${medicationId}`)
        .expect(200);

      expect(response.body.quantity).toBe(95);
    });

    it('should allow zero quantity (out of stock)', async () => {
      await request(server)
        .put(`/api/medications/${medicationId}`)
        .send({ quantity: 0 })
        .expect(200);

      const response = await request(server)
        .get(`/api/medications/${medicationId}`)
        .expect(200);

      expect(response.body.quantity).toBe(0);
    });

    it('should track expiry dates for safety', async () => {
      const pastDate = '2020-01-01';
      
      await request(server)
        .put(`/api/medications/${medicationId}`)
        .send({ expiryDate: pastDate })
        .expect(200);

      const response = await request(server)
        .get(`/api/medications/${medicationId}`)
        .expect(200);

      expect(response.body.expiryDate).toContain('2020-01-01');
    });
  });

  describe('Edge Cases and Data Integrity', () => {
    it('should handle medications with complex dosages', async () => {
      const complexMed = {
        name: 'Insulin Glargine',
        description: 'Long-acting insulin',
        dosage: '100 units/mL (10 mL vial)',
        unit: 'vials',
        quantity: 3,
        isPrescription: true,
        notes: 'Refrigerate. Rotate injection sites.'
      };

      const response = await request(server)
        .post('/api/medications')
        .send(complexMed)
        .expect(201);

      expect(response.body.dosage).toBe('100 units/mL (10 mL vial)');
      expect(response.body.notes).toBe('Refrigerate. Rotate injection sites.');
    });

    it('should handle different unit types', async () => {
      const unitTypes = [
        { name: 'Liquid Med', unit: 'mL', quantity: 250 },
        { name: 'Powder Med', unit: 'grams', quantity: 50 },
        { name: 'Injection', unit: 'ampules', quantity: 10 },
        { name: 'Cream', unit: 'tubes', quantity: 2 },
        { name: 'Drops', unit: 'bottles', quantity: 1 }
      ];

      for (const unitType of unitTypes) {
        const response = await request(server)
          .post('/api/medications')
          .send({
            ...unitType,
            dosage: '10mg'
          })
          .expect(201);

        expect(response.body.unit).toBe(unitType.unit);
        expect(response.body.quantity).toBe(unitType.quantity);
      }
    });

    it('should handle medications with very long names and descriptions', async () => {
      const longName = 'A'.repeat(500);
      const longDescription = 'B'.repeat(2000);

      const response = await request(server)
        .post('/api/medications')
        .send({
          name: longName,
          description: longDescription,
          dosage: '10mg',
          unit: 'tablets',
          quantity: 30
        })
        .expect(201);

      expect(response.body.name).toBe(longName);
      expect(response.body.description).toBe(longDescription);
    });

    it('should handle duplicate medication names (different dosages)', async () => {
      await request(server)
        .post('/api/medications')
        .send({
          name: 'Ibuprofen',
          dosage: '200mg',
          unit: 'tablets',
          quantity: 50
        })
        .expect(201);

      await request(server)
        .post('/api/medications')
        .send({
          name: 'Ibuprofen',
          dosage: '400mg',
          unit: 'tablets',
          quantity: 30
        })
        .expect(201);

      const response = await request(server)
        .get('/api/medications')
        .expect(200);

      const ibuprofenMeds = response.body.filter((med: any) => med.name === 'Ibuprofen');
      expect(ibuprofenMeds).toHaveLength(2);
      expect(ibuprofenMeds[0].dosage).not.toBe(ibuprofenMeds[1].dosage);
    });

    it('should handle large quantity numbers', async () => {
      const largeQuantity = 999999;

      const response = await request(server)
        .post('/api/medications')
        .send({
          name: 'Bulk Vitamin',
          dosage: '100mg',
          unit: 'tablets',
          quantity: largeQuantity
        })
        .expect(201);

      expect(response.body.quantity).toBe(largeQuantity);
    });
  });
});