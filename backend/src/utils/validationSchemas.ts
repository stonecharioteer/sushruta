import Joi from 'joi';
import { FamilyMemberType, MedicationStatus } from '@/models';

// Common schemas
export const uuidSchema = Joi.string().uuid();
export const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

// Family Member schemas
export const createFamilyMemberSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    type: Joi.string().valid(...Object.values(FamilyMemberType)).default(FamilyMemberType.HUMAN),
    dateOfBirth: Joi.date().optional(),
  }),
};

export const updateFamilyMemberSchema = {
  params: Joi.object({
    id: uuidSchema.required(),
  }),
  body: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    type: Joi.string().valid(...Object.values(FamilyMemberType)).optional(),
    dateOfBirth: Joi.date().optional(),
  }),
};

export const getFamilyMemberSchema = {
  params: Joi.object({
    id: uuidSchema.required(),
  }),
};

// Medication schemas
export const createMedicationSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    dosage: Joi.string().min(1).max(100).required(),
    frequency: Joi.string().min(1).max(100).required(),
    instructions: Joi.string().optional(),
  }),
};

export const updateMedicationSchema = {
  params: Joi.object({
    id: uuidSchema.required(),
  }),
  body: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    dosage: Joi.string().min(1).max(100).optional(),
    frequency: Joi.string().min(1).max(100).optional(),
    instructions: Joi.string().optional(),
  }),
};

// Prescription schemas
export const createPrescriptionSchema = {
  body: Joi.object({
    familyMemberId: uuidSchema.required(),
    medicationId: uuidSchema.required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    active: Joi.boolean().default(true),
  }),
};

export const updatePrescriptionSchema = {
  params: Joi.object({
    id: uuidSchema.required(),
  }),
  body: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    active: Joi.boolean().optional(),
  }),
};

// Medication Log schemas
export const createMedicationLogSchema = {
  body: Joi.object({
    prescriptionId: uuidSchema.required(),
    scheduledTime: Joi.date().required(),
    takenTime: Joi.date().optional(),
    status: Joi.string().valid(...Object.values(MedicationStatus)).default(MedicationStatus.TAKEN),
    notes: Joi.string().optional(),
  }),
};

export const updateMedicationLogSchema = {
  params: Joi.object({
    id: uuidSchema.required(),
  }),
  body: Joi.object({
    takenTime: Joi.date().optional(),
    status: Joi.string().valid(...Object.values(MedicationStatus)).optional(),
    notes: Joi.string().optional(),
  }),
};