import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prescription } from './Prescription';

export enum FamilyMemberType {
  HUMAN = 'human',
  PET = 'pet'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum Species {
  CAT = 'cat',
  DOG = 'dog'
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

  @Column({
    type: 'varchar',
    enum: Gender,
    nullable: true
  })
  gender?: Gender;

  @Column({
    type: 'varchar',
    enum: Species,
    nullable: true
  })
  species?: Species;

  @OneToMany(() => Prescription, prescription => prescription.familyMember, { cascade: true })
  prescriptions!: Prescription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}