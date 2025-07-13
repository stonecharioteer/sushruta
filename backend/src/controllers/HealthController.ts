import { Request, Response } from 'express';
import { AppDataSource } from '@/config/database';
import { ResponseFormatter } from '@/views';

export class HealthController {
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const isDbConnected = AppDataSource.isInitialized;
      
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          connected: isDbConnected,
          type: AppDataSource.options.type
        },
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      if (!isDbConnected) {
        res.status(503).json(ResponseFormatter.error('Service Unavailable', 'Database not connected'));
        return;
      }

      res.json(ResponseFormatter.success(healthData, 'Health check passed'));
    } catch (error) {
      res.status(503).json(ResponseFormatter.error('Service Unavailable', 'Health check failed'));
    }
  };

  readiness = async (req: Request, res: Response): Promise<void> => {
    try {
      const isDbConnected = AppDataSource.isInitialized;
      
      if (!isDbConnected) {
        res.status(503).json(ResponseFormatter.error('Not Ready', 'Database not connected'));
        return;
      }

      res.json(ResponseFormatter.success({ ready: true }, 'Service is ready'));
    } catch (error) {
      res.status(503).json(ResponseFormatter.error('Not Ready', 'Service not ready'));
    }
  };

  liveness = async (req: Request, res: Response): Promise<void> => {
    res.json(ResponseFormatter.success({ alive: true }, 'Service is alive'));
  };
}