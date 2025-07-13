import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { FamilyMember } from './FamilyMember';
import { Medication } from './Medication';
import { MedicationLog } from './MedicationLog';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  familyMemberId!: string;

  @Column({ type: 'uuid' })
  medicationId!: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @ManyToOne(() => FamilyMember, familyMember => familyMember.prescriptions)
  @JoinColumn({ name: 'familyMemberId' })
  familyMember!: FamilyMember;

  @ManyToOne(() => Medication, medication => medication.prescriptions)
  @JoinColumn({ name: 'medicationId' })
  medication!: Medication;

  @OneToMany(() => MedicationLog, log => log.prescription)
  medicationLogs!: MedicationLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}