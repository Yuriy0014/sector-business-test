import { inject, injectable } from 'inversify'
import { type Request, type Response } from 'express'
import { STATUSES_HTTP } from '../enum/http-statuses'
import { DataSource, type Repository } from 'typeorm'
import { ProfileEntity } from '../domain/entities/profile.entity'
import { SessionEntity } from '../domain/entities/session.entity'
import { clearDirectory } from '../helpers/deleter'

@injectable()
export class TestingController {
  private readonly profileRepository: Repository<ProfileEntity>
  private readonly sessionRepository: Repository<SessionEntity>

  constructor(@inject(DataSource) private readonly dataSource: DataSource) {
    this.profileRepository = dataSource.getRepository(ProfileEntity)
    this.sessionRepository = dataSource.getRepository(SessionEntity)
  }

  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      // Удаляем все записи из таблицы sessions
      await this.sessionRepository.delete({})

      // Удаляем все записи из таблицы profiles
      await this.profileRepository.delete({})

      // Удаляем из папки все фото
      await clearDirectory('uploads/')
    } catch (e) {
      console.log(e)
      res.sendStatus(STATUSES_HTTP.SERVER_ERROR_500)
      return
    }

    res.sendStatus(STATUSES_HTTP.NO_CONTENT_204)
    return
  }
}
