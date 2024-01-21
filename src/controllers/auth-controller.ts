import { type Request, type Response } from 'express'
import { JwtService } from '../application/jwt-service'
import { STATUSES_HTTP } from '../enum/http-statuses'
import { inject, injectable } from 'inversify'
import { SessionService } from '../domain/session-service'
import { ProfileService } from '../domain/profile-service'
import { type Result } from '../models/result-pattern.model'
import { type ProfileEntity } from '../domain/entities/profile.entity'
import { type registrationDTO } from '../dto/auth.dto'

@injectable()
export class AuthController {
  constructor(
    @inject(ProfileService) protected profileService: ProfileService,
    @inject(JwtService) protected jwtService: JwtService,
    @inject(SessionService) protected sessionsService: SessionService
  ) {}

  async login(req: Request, res: Response) {
    const profile: Result<null | ProfileEntity> | null = await this.profileService.checkCredentials(
      req.body.email as string,
      req.body.password as string
    )

    if (profile.data === null) {
      res.status(profile.resultCode).json({ Error: profile.errorMessage })
      return
    }

    const accessToken = await this.jwtService.createJWT(profile.data.id)
    const deviceId = (+new Date()).toString()
    const refreshToken = await this.jwtService.createJWTRefresh(profile.data.id, deviceId)

    // Подготавливаем данные для записи в таблицу сессий
    const RFTokenInfo = await this.jwtService.getInfoFromRFToken(refreshToken)
    if (RFTokenInfo === null) {
      res.status(500).json('Не удалось залогиниться. Попроубуйте позднее')
      return
    }
    const loginIp = req.socket.remoteAddress ?? 'IP undefined'
    const deviceName: string = req.headers['user-agent'] ?? 'deviceName undefined'

    // Фиксируем сессию
    const sessionRegInfo = await this.sessionsService.registerSession(
      loginIp,
      RFTokenInfo.iat,
      deviceName,
      profile.data.id,
      deviceId
    )
    if (sessionRegInfo.data === null) {
      res.status(profile.resultCode).json({ Error: profile.errorMessage })
      return
    }

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
    res.status(200).json({ accessToken })
  }

  async registerProfile(req: Request, res: Response) {
    const dto: registrationDTO = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      male: req.body.male,
    }

    const user = await this.profileService.createProfile(dto, req.fileName)

    if (user.data === null) {
      res.status(user.resultCode).json(user.errorMessage)
    } else {
      res.status(user.resultCode).send()
    }
  }

  async updateTokens(req: Request, res: Response) {
    const accessTokenNew = await this.jwtService.createJWT(req.user!.id)

    // Получаем данные о текущем токене
    const CurrentRFTokenInfo = await this.jwtService.getInfoFromRFToken(
      req.cookies.refreshToken as string
    )
    if (!CurrentRFTokenInfo) {
      res
        .status(STATUSES_HTTP.SERVER_ERROR_500)
        .json('Не удалось залогиниться. Попроубуйте позднее')
      return
    }

    // Генерируем новый RT
    const refreshTokenNew = await this.jwtService.createJWTRefresh(
      req.user!.id,
      CurrentRFTokenInfo.deviceId
    )

    // Подготавливаем данные для записи в таблицу сессий
    const FRTokenInfo = await this.jwtService.getInfoFromRFToken(refreshTokenNew)
    if (FRTokenInfo === null) {
      res
        .status(STATUSES_HTTP.SERVER_ERROR_500)
        .json('Не удалось залогиниться. Попроубуйте позднее')
      return
    }
    const loginIp = req.socket.remoteAddress ?? 'IP undefined'
    const deviceName =
      req.headers['User-Agent'] !== undefined
        ? req.headers['User-Agent'][0]
        : 'deviceName undefined'

    // Обновляем запись в списке сессий
    const sessionRegInfoNew = await this.sessionsService.updateSession(
      CurrentRFTokenInfo.iat,
      CurrentRFTokenInfo.deviceId,
      loginIp,
      FRTokenInfo.iat,
      deviceName,
      req.user!.id
    )

    if (!sessionRegInfoNew) {
      res
        .status(STATUSES_HTTP.SERVER_ERROR_500)
        .json('Не удалось залогиниться. Попроубуйте позднее')
      return
    }

    res.cookie('refreshToken', refreshTokenNew, { httpOnly: true, secure: true })
    res.status(STATUSES_HTTP.OK_200).json({ accessToken: accessTokenNew })
  }

  async logout(req: Request, res: Response) {
    const RFTokenInfo = await this.jwtService.getInfoFromRFToken(req.cookies.refreshToken)
    if (RFTokenInfo === null) {
      res.status(STATUSES_HTTP.SERVER_ERROR_500).json('Не удалось вылогиниться. Попробуйте позднее')
      return
    }

    // Удаляем запись с текущей сессией из БД
    const deletionStatus = await this.sessionsService.deleteSession(RFTokenInfo.iat, req.user!.id)

    if (deletionStatus.data === null) {
      res.status(deletionStatus.resultCode).json({ Error: deletionStatus.errorMessage })
    } else {
      res.sendStatus(STATUSES_HTTP.NO_CONTENT_204)
    }
  }
}
