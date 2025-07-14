import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prescription } from './Prescription';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  dosage!: string;

  @Column({ type: 'varchar', length: 100 })
  frequency!: string;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @OneToMany(() => Prescription, prescription => prescription.medication, { cascade: true })
  prescriptions!: Prescription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}