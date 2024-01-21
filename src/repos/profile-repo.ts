import { injectable, inject } from 'inversify'
import { type ProfileCreateModel } from '../models/profile.model'
import { v4 as uuidv4 } from 'uuid'
import { ProfileEntity } from '../domain/entities/profile.entity'
import { DataSource, type Repository } from 'typeorm'
import { type updateProfileDTO } from '../dto/auth.dto'

@injectable()
export class ProfileRepo {
  private readonly profileRepository: Repository<ProfileEntity>

  constructor(@inject(DataSource) private readonly dataSource: DataSource) {
    this.profileRepository = dataSource.getRepository(ProfileEntity)
  }

  async createProfile(createDTO: ProfileCreateModel): Promise<string | null> {
    try {
      const id = uuidv4()

      const profile = new ProfileEntity()
      profile.id = id
      profile.firstName = createDTO.firstName
      profile.lastName = createDTO.lastName
      profile.male = createDTO.male
      profile.email = createDTO.email
      profile.passwordHash = createDTO.passwordHash
      profile.regDateId = new Date()
      profile.photoName = createDTO.photoName

      await this.profileRepository.save(profile)

      return id
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async findByEmail(email: string) {
    try {
      const profile = await this.profileRepository
        .createQueryBuilder('u')
        .select([
          'u.id',
          'u.firstName',
          'u.lastName',
          'u.male',
          'u.email',
          'u.photoName',
          'u.passwordHash',
          'u.regDateId',
        ])
        .where('email = :email', { email })
        .getOne()

      if (!profile) {
        return false
      }

      return profile
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async updateProfile(id: string, dto: updateProfileDTO): Promise<boolean | null> {
    try {
      const profile = await this.profileRepository
        .createQueryBuilder('u')
        .select([
          'u.id',
          'u.firstName',
          'u.lastName',
          'u.male',
          'u.email',
          'u.photoName',
          'u.passwordHash',
          'u.regDateId',
        ])
        .where('id = :id', { id })
        .getOne()

      if (!profile) {
        return false
      }

      Object.assign(profile, dto)

      await this.profileRepository.save(profile)

      return true
    } catch (e) {
      console.log(e)
      return null
    }
  }
}
