import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { SessionEntity } from './session.entity'

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  male: string

  @Column()
  email: string

  @Column()
  photoName: string

  @Column()
  passwordHash: string

  @Column()
  regDateId: Date

  @OneToMany(() => SessionEntity, session => session.profile)
  sessions: SessionEntity[]
}
