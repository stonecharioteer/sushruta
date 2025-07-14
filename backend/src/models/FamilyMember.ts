import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prescription } from './Prescription';

export enum FamilyMemberType {
  HUMAN = 'human',
  PET = 'pet'
}

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'varchar',
    enum: FamilyMemberType,
    default: FamilyMemberType.HUMAN
  })
  type!: FamilyMemberType;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @OneToMany(() => Prescription, prescription => prescription.familyMember)
  prescriptions!: Prescription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}