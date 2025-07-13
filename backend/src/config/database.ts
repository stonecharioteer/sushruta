import { DataSource } from 'typeorm';
import { FamilyMember } from '@/models/FamilyMember';
import { Medication } from '@/models/Medication';
import { Prescription } from '@/models/Prescription';
import { MedicationLog } from '@/models/MedicationLog';
import { config } from './index';

const createDataSourceConfig = () => {
  const baseConfig = {
    entities: [FamilyMember, Medication, Prescription, MedicationLog],
    migrations: ['src/migrations/*.ts'],
    synchronize: config.node.env === 'development',
    logging: config.node.env === 'development',
  };

  if (config.database.type === 'sqlite') {
    return {
      ...baseConfig,
      type: 'sqlite' as const,
      database: config.database.url.replace('sqlite:', ''),
    };
  } else {
    return {
      ...baseConfig,
      type: 'postgres' as const,
      url: config.database.url,
      ssl: config.node.env === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
};

export const AppDataSource = new DataSource(createDataSourceConfig());