import { MedicationLog } from '@/models/MedicationLog';
import { MedicationLogStats } from '@/services/MedicationLogService';

export interface MedicationLogResponse {
  id: string;
  prescription: {
    id: string;
    familyMember: {
      id: string;
      name: string;
      type: string;
    };
    medication: {
      id: string;
      name: string;
      dosage: string;
    };
  };
  scheduledTime: string;
  takenTime?: string;
  status: string;
  notes?: string;
  isLate: boolean;
  createdAt: string;
}

export interface DailyScheduleResponse {
  date: string;
  logs: MedicationLogResponse[];
  summary: {
    total: number;
    taken: number;
    missed: number;
    skipped: number;
    pending: number;
  };
}

export interface ComplianceStatsResponse {
  period: string;
  totalLogs: number;
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  complianceRate: number;
  complianceGrade: string;
}

export class MedicationLogView {
  static format(log: MedicationLog): MedicationLogResponse {
    const scheduledTime = new Date(log.scheduledTime);
    const isLate = log.status === 'taken' && log.takenTime && new Date(log.takenTime) > scheduledTime;

    return {
      id: log.id,
      prescription: {
        id: log.prescription.id,
        familyMember: {
          id: log.prescription.familyMember.id,
          name: log.prescription.familyMember.name,
          type: log.prescription.familyMember.type
        },
        medication: {
          id: log.prescription.medication.id,
          name: log.prescription.medication.name,
          dosage: log.prescription.medication.dosage
        }
      },
      scheduledTime: log.scheduledTime.toISOString(),
      takenTime: log.takenTime?.toISOString(),
      status: log.status,
      notes: log.notes,
      isLate: isLate || false,
      createdAt: log.createdAt.toISOString()
    };
  }

  static formatList(logs: MedicationLog[]): MedicationLogResponse[] {
    return logs.map(log => this.format(log));
  }

  static formatDailySchedule(logs: MedicationLog[], date: Date): DailyScheduleResponse {
    const formattedLogs = this.formatList(logs);
    
    const summary = {
      total: logs.length,
      taken: logs.filter(log => log.status === 'taken').length,
      missed: logs.filter(log => log.status === 'missed').length,
      skipped: logs.filter(log => log.status === 'skipped').length,
      pending: 0
    };

    const now = new Date();
    summary.pending = logs.filter(log => {
      const scheduledTime = new Date(log.scheduledTime);
      return scheduledTime <= now && log.status === 'taken' && !log.takenTime;
    }).length;

    return {
      date: date.toISOString().split('T')[0],
      logs: formattedLogs,
      summary
    };
  }

  static formatComplianceStats(stats: MedicationLogStats, days: number): ComplianceStatsResponse {
    const complianceGrade = this.getComplianceGrade(stats.complianceRate);

    return {
      period: `Last ${days} days`,
      totalLogs: stats.totalLogs,
      takenCount: stats.takenCount,
      missedCount: stats.missedCount,
      skippedCount: stats.skippedCount,
      complianceRate: stats.complianceRate,
      complianceGrade
    };
  }

  private static getComplianceGrade(rate: number): string {
    if (rate >= 95) return 'Excellent';
    if (rate >= 85) return 'Good';
    if (rate >= 70) return 'Fair';
    if (rate >= 50) return 'Poor';
    return 'Critical';
  }
}