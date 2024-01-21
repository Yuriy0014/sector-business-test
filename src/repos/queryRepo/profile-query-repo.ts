import { inject, injectable } from 'inversify'
import { DataSource, type Repository } from 'typeorm'
import { ProfileEntity } from '../../domain/entities/profile.entity'
import { MapProfileViewModelSQL } from '../../helpers/mapper-ProfileViewModel'
import { type ProfileViewModel } from '../../models/profile.model'

@injectable()
export class ProfileQueryRepo {
  private readonly profileRepository: Repository<ProfileEntity>

  constructor(
    @inject(MapProfileViewModelSQL) protected mapProfileViewModelSQL: MapProfileViewModelSQL,
    @inject(DataSource) private readonly dataSource: DataSource
  ) {
    this.profileRepository = dataSource.getRepository(ProfileEntity)
  }

  async findProfiles(pageNumber: number, pageSize: number) {
    try {
      const [rawProfiles, totalCount] = await this.profileRepository
        .createQueryBuilder('p')
        .select([
          'p.id',
          'p.firstName',
          'p.lastName',
          'p.male',
          'p.email',
          'p.photoName',
          'p.passwordHash',
          'p.regDateId',
        ])
        .orderBy('p.regDateId')
        .take(pageSize)
        .skip(pageSize * (pageNumber - 1))
        .getManyAndCount()

      const foundProfiles = rawProfiles.map(profile =>
        this.mapProfileViewModelSQL.getProfileViewModel(profile)
      )

      return {
        pagesCount: Math.ceil(totalCount / pageSize),
        page: pageNumber,
        pageSize,
        totalCount,
        items: foundProfiles,
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async findProfileById(id: string): Promise<ProfileViewModel | null | false> {
    try {
      const user = await this.profileRepository
        .createQueryBuilder('p')
        .select([
          'p.id',
          'p.firstName',
          'p.lastName',
          'p.male',
          'p.email',
          'p.photoName',
          'p.passwordHash',
          'p.regDateId',
        ])
        .where('p.id = :id', { id })
        .getOne()

      if (user) {
        return this.mapProfileViewModelSQL.getProfileViewModel(user)
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async findProfileByEmail(email: string) {
    try {
      const user = await this.profileRepository
        .createQueryBuilder('p')
        .select([
          'p.id',
          'p.firstName',
          'p.lastName',
          'p.male',
          'p.email',
          'p.photoName',
          'p.passwordHash',
          'p.regDateId',
        ])
        .where('p.email = :email', { email })
        .getOne()

      if (user) {
        return this.mapProfileViewModelSQL.getProfileViewModel(user)
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
}
