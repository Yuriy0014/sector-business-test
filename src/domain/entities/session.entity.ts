import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { ProfileEntity } from './profile.entity'

@Entity({ name: 'sessions' })
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  ip: string

  @Column()
  title: string

  @Column()
  lastActiveDate: Date

  @Column()
  deviceId: string

  @Column()
  deviceName: string

  @Column()
  userId: string

  @Column()
  RFTokenIAT: Date

  @ManyToOne(() => ProfileEntity, profile => profile.sessions)
  profile: ProfileEntity
}
