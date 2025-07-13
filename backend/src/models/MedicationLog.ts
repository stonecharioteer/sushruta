import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './Prescription';

export enum MedicationStatus {
  TAKEN = 'taken',
  MISSED = 'missed',
  SKIPPED = 'skipped'
}

@Entity('medication_logs')
export class MedicationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  prescriptionId!: string;

  @Column({ type: 'datetime' })
  scheduledTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  takenTime?: Date;

  @Column({
    type: 'varchar',
    enum: MedicationStatus,
    default: MedicationStatus.TAKEN
  })
  status!: MedicationStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Prescription, prescription => prescription.medicationLogs)
  @JoinColumn({ name: 'prescriptionId' })
  prescription!: Prescription;

  @CreateDateColumn()
  createdAt!: Date;
}