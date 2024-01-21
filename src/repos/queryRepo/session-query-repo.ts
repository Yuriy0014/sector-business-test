import { inject, injectable } from 'inversify'
import { DataSource, type Repository } from 'typeorm'
import { SessionEntity } from '../../domain/entities/session.entity'

@injectable()
export class SessionQueryRepo {
  private readonly sessionRepository: Repository<SessionEntity>

  constructor(@inject(DataSource) private readonly dataSource: DataSource) {
    this.sessionRepository = dataSource.getRepository(SessionEntity)
  }

  async findSessionWithRFToken(RFTIAT: number, deviceId: string) {
    try {
      const foundSession = await this.sessionRepository
        .createQueryBuilder('s')
        .select([
          's.id',
          's.ip',
          's.title',
          's.lastActiveDate',
          's.deviceId',
          's.deviceName',
          's.userId',
          's.RFTokenIAT',
        ])
        .where('s.deviceId = :deviceId AND s.RFTokenIAT = :IAt ', {
          deviceId,
          IAt: new Date(RFTIAT),
        })
        .getOne()

      if (foundSession) {
        return foundSession
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
}
