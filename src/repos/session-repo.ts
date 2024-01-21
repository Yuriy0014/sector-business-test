import { inject, injectable } from 'inversify'
import { v4 as uuidv4 } from 'uuid'
import { DataSource, type Repository } from 'typeorm'
import { SessionEntity } from '../domain/entities/session.entity'
import { type reqSessionDTOType } from '../dto/session.dto'
import {
  type SessionUpdateContentModel,
  type SessionUpdateFilterModel,
} from '../models/session.model'

@injectable()
export class SessionRepo {
  private readonly sessionRepository: Repository<SessionEntity>

  constructor(@inject(DataSource) private readonly dataSource: DataSource) {
    this.sessionRepository = dataSource.getRepository(SessionEntity)
  }

  async registerSession(sessionDTO: reqSessionDTOType): Promise<boolean | null> {
    try {
      const id = uuidv4()
      // Создание экземпляра класса
      const session = new SessionEntity()

      // Задание значений
      session.id = id
      session.ip = sessionDTO.loginIp
      session.title = 'Title session'
      session.lastActiveDate = new Date()
      session.deviceId = sessionDTO.deviceId
      session.deviceName = sessionDTO.deviceName
      session.userId = sessionDTO.userId
      session.RFTokenIAT = new Date(sessionDTO.refreshTokenIssuedAt)

      // Сохранение в базу данных
      await this.sessionRepository.save(session)
      return true
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async updateSessionInfo(
    filter: SessionUpdateFilterModel,
    updateSessionContent: SessionUpdateContentModel
  ): Promise<boolean | null> {
    try {
      // Проверяем, что сессия существует
      const foundSession = await this.dataSource
        .getRepository(SessionEntity)
        .createQueryBuilder('s')
        .select('s.id')
        .where('s.userId = :userId AND s.deviceId = :deviceId AND s.RFTokenIAT = :RFTokenIAT', {
          userId: filter.userId,
          deviceId: filter.deviceId,
          RFTokenIAT: filter.RFTokenIAT,
        })
        .getOne()

      if (!foundSession) return false

      // Обновление свойств экземпляра
      foundSession.ip = updateSessionContent.ip
      foundSession.lastActiveDate = updateSessionContent.lastActiveDate
      foundSession.deviceName = updateSessionContent.deviceName
      foundSession.RFTokenIAT = updateSessionContent.RFTokenIAT

      // Сохранение обновлений
      await this.dataSource.getRepository(SessionEntity).save(foundSession)

      // Проверяем, что запись обновилась
      const foundSessionAfterUpdate = await this.dataSource
        .getRepository(SessionEntity)
        .createQueryBuilder('s')
        .select('s.id')
        .where('s.id = :id AND s.deviceId = :deviceId AND s.RFTokenIAT = :RFTokenIAT', {
          id: foundSession.id, // Убедитесь, что foundSession не массив
          deviceId: filter.deviceId,
          RFTokenIAT: updateSessionContent.RFTokenIAT,
        })
        .getOne()
      if (!foundSessionAfterUpdate) return false

      return true
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async deleteSession(currentRFTokenIAT: number, userId: string): Promise<boolean | null> {
    try {
      // Удаление сессии
      await this.sessionRepository
        .createQueryBuilder()
        .delete()
        .from(SessionEntity)
        .where('RFTokenIAT = :RFTokenIAT AND userId = :userId', {
          RFTokenIAT: new Date(currentRFTokenIAT),
          userId,
        })
        .execute()

      // Проверка, что сессия удалена
      const deletedSession = await this.sessionRepository
        .createQueryBuilder('s')
        .select('s.id')
        .where('s.userId = :userId AND s.RFTokenIAT = :RFTokenIAT', {
          userId,
          RFTokenIAT: new Date(currentRFTokenIAT),
        })
        .getOne()

      return deletedSession === null
    } catch (e) {
      console.log(e)
      return null
    }
  }
}
