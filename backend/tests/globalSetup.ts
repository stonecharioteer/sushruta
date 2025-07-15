import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
  
  // Set NODE_ENV to test if not already set
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }
  
  // Ensure required test environment variables are set
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'sqlite::memory:';
  }
  
  if (!process.env.DATABASE_TYPE) {
    process.env.DATABASE_TYPE = 'sqlite';
  }
  
  if (!process.env.LOG_LEVEL) {
    process.env.LOG_LEVEL = 'error';
  }
}