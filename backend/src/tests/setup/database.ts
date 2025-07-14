import { DataSourceOptions } from 'typeorm';
import { FamilyMember } from '../../models/FamilyMember';
import { Medication } from '../../models/Medication';
import { Prescription } from '../../models/Prescription';
import { MedicationLog } from '../../models/MedicationLog';

export const testDatabaseConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:', // Use in-memory database for tests
  entities: [FamilyMember, Medication, Prescription, MedicationLog],
  synchronize: true, // Auto-create schema for tests
  logging: false, // Disable SQL logging during tests
  dropSchema: true, // Clean schema on each test run
};