import { inject, injectable } from 'inversify'
import { SessionRepo } from '../repos/session-repo'
import { type reqSessionDTOType } from '../dto/session.dto'
import { STATUSES_HTTP } from '../enum/http-statuses'
import { type Result } from '../models/result-pattern.model'
import {
  type SessionUpdateContentModel,
  type SessionUpdateFilterModel,
} from '../models/session.model'

@injectable()
export class SessionService {
  constructor(@inject(SessionRepo) protected sessionsRepo: SessionRepo) {}

  async registerSession(
    loginIp: string,
    RefreshTokenIssuedAt: number,
    deviceName: string,
    UserId: string,
    deviceId: string
  ): Promise<Result<boolean>> {
    const dto: reqSessionDTOType = {
      loginIp,
      refreshTokenIssuedAt: RefreshTokenIssuedAt,
      deviceName,
      userId: UserId,
      deviceId,
    }

    const creationResult = await this.sessionsRepo.registerSession(dto)

    if (!creationResult) {
      return {
        resultCode: STATUSES_HTTP.SERVER_ERROR_500,
        data: null,
        errorMessage: 'Не удалось залогиниться. Попроубуйте позднее',
      }
    }

    return {
      resultCode: STATUSES_HTTP.OK_200,
      data: creationResult,
    }
  }

  async updateSession(
    currentRFTokenIAT: number,
    deviceId: string,
    loginIp: string,
    RefreshTokenIssuedAt: number,
    deviceName: string,
    UserId: string
  ) {
    const filter: SessionUpdateFilterModel = {
      deviceId,
      RFTokenIAT: new Date(currentRFTokenIAT),
      userId: UserId,
    }

    const updateSessionContent: SessionUpdateContentModel = {
      ip: loginIp,
      lastActiveDate: new Date(),
      deviceName,
      RFTokenIAT: new Date(RefreshTokenIssuedAt),
    }

    return await this.sessionsRepo.updateSessionInfo(filter, updateSessionContent)
  }

  async deleteSession(currentRFTokenIAT: number, userId: string) {
    const deletionStatus = await this.sessionsRepo.deleteSession(currentRFTokenIAT, userId)

    if (!deletionStatus) {
      return {
        resultCode: STATUSES_HTTP.SERVER_ERROR_500,
        data: null,
        errorMessage: 'Не удалось удалить сессию',
      }
    }

    return {
      resultCode: STATUSES_HTTP.NO_CONTENT_204,
      data: deletionStatus,
    }
  }
}
