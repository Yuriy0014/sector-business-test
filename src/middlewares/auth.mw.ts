import { type NextFunction, type Request, type Response } from 'express'
import { JwtService } from '../application/jwt-service'
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { STATUSES_HTTP } from '../enum/http-statuses'
import { inject, injectable } from 'inversify'
import { ProfileQueryRepo } from '../repos/queryRepo/profile-query-repo'
import { SessionQueryRepo } from '../repos/queryRepo/session-query-repo'
import {isProfileRoleModel} from "../models/profile.model";

@injectable()
export class AuthMW {
  constructor(
    @inject(JwtService) protected jwtService: JwtService,
    @inject(ProfileQueryRepo) protected profileQueryRepo: ProfileQueryRepo,
    @inject(SessionQueryRepo) protected sessionsQueryRepo: SessionQueryRepo
  ) {}

  async addReqUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.headers.authorization) {
      next()
      return
    }

    const token = req.headers.authorization.split(' ')[1]

    try {
      const RFTokenInfo = await this.jwtService.getInfoFromRFToken(token)
      if (RFTokenInfo) {
        const user = await this.profileQueryRepo.findProfileRoleById(RFTokenInfo.userId)
        if (user === null || user === false) {
          res.status(STATUSES_HTTP.UNAUTHORIZED_401).json({
            message: 'Произошла ошибка. Попробуйте еще раз',
          })
          return
        } else {
          req.user = user
          next()
        }
        return
      }
      next()
    } catch (e) {
      console.log(e)
      next()
    }
  }

  async authenticationCheckBearer(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      res.sendStatus(STATUSES_HTTP.UNAUTHORIZED_401)
      return
    }

    const token = req.headers.authorization.split(' ')[1]

    const RFTokenInfo = await this.jwtService.getInfoFromRFToken(token)
    if (RFTokenInfo) {
      const user = await this.profileQueryRepo.findProfileById(RFTokenInfo.userId)

      if (!user) {
        res.status(STATUSES_HTTP.SERVER_ERROR_500).json({
          message: 'Произошла ошибка. Попробуйте еще раз',
        })
        return
      }
      next()
      return
    }
    res.sendStatus(STATUSES_HTTP.UNAUTHORIZED_401)
  }

  checkOwner(req: Request, res: Response, next: NextFunction) {

    // Проверка, является ли пользователь суперпользователем
    if (isProfileRoleModel(req.user!) && req.user!.isSuper) {
      next(); // у суперпольхзователя полный доступ
      return;
    }

    if (req.params.id !== req.user!.id) {
      res.status(STATUSES_HTTP.FORBIDDEN_403).json({
        message: 'Отказано в доступе',
      })
      return
    }
    next()
  }

  async verifyRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    let result: any
    const refreshTokenCookie = req.cookies.refreshToken

    if (!refreshTokenCookie) {
      res
        .status(STATUSES_HTTP.UNAUTHORIZED_401)
        .json({ errorsMessages: [{ message: 'No token provided!', field: 'refreshToken' }] })
      return
    }
    try {
      result = jwt.verify(refreshTokenCookie, process.env.JWT_SECRET!)
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        res
          .status(STATUSES_HTTP.UNAUTHORIZED_401)
          .send({ message: 'Unauthorized! Token has expired!' })
        return
      }

      res.status(STATUSES_HTTP.UNAUTHORIZED_401).send({ message: 'Unauthorized!' })
      return
    }

    // Проверяем наличие RFToken в базе активных сессий
    const deviceId: string = result.deviceId
    const RFTIAT = result.iat * 1000
    const isActive = await this.sessionsQueryRepo.findSessionWithRFToken(RFTIAT, deviceId)
    if (!isActive) {
      res.status(STATUSES_HTTP.UNAUTHORIZED_401).json({
        errorsMessages: [
          {
            message: 'Unauthorized! В БД с сессиями нет такой записи',
            field: 'refreshToken',
          },
        ],
      })
      return
    }

    const user = await this.profileQueryRepo.findProfileById(result.userId)

    if (!user) {
      res.status(STATUSES_HTTP.SERVER_ERROR_500).json({
        message: 'Произошла ошибка. Попробуйте еще раз',
      })
      return
    }

    req.user = user
    next()
    return
  }
}
