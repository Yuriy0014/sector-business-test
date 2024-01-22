import { type Request, type Response } from 'express'
import { STATUSES_HTTP } from '../enum/http-statuses'
import { inject, injectable } from 'inversify'
import { ProfileQueryRepo } from '../repos/queryRepo/profile-query-repo'
import { ProfileService } from '../domain/profile-service'
import {isProfileRoleModel, type ProfileViewModel, type ProfileWithPaginationModel} from '../models/profile.model'
import { type ErrorType, type Result } from '../models/result-pattern.model'
import { type updateProfileDTO } from '../dto/auth.dto'

@injectable()
export class ProfileController {
  constructor(
    @inject(ProfileQueryRepo) protected profileQueryRepo: ProfileQueryRepo,
    @inject(ProfileService) protected profileService: ProfileService
  ) {}

  async findAllProfiles(req: Request, res: Response<ProfileWithPaginationModel | ErrorType>) {
    const pageNumber = +(req.query.page ?? 1)
    const pageSize = 10

    const foundUsers = await this.profileQueryRepo.findProfiles(pageNumber, pageSize)

    if (foundUsers === null) {
      res.status(STATUSES_HTTP.SERVER_ERROR_500).json({ Error: 'Прости. Что-то пошло не так' })
    } else {
      foundUsers.items.forEach(element => {
        element.photoUrl = `${req.protocol}://${req.get('host')}/uploads/${element.photoUrl}`
      })
      res.status(STATUSES_HTTP.OK_200).json(foundUsers)
    }
  }

  async findProfileById(req: Request, res: Response<ProfileViewModel | ErrorType>) {
    const foundUser = await this.profileQueryRepo.findProfileById(req.params.id)

    if (foundUser === null) {
      res.status(STATUSES_HTTP.SERVER_ERROR_500).json({ Error: 'Прости. Что-то пошло не так' })
      return
    }

    if (foundUser === false) {
      res.status(STATUSES_HTTP.NOT_FOUND_404).json({ Error: ' Такой профиль на найден' })
      return
    }

    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${foundUser.photoUrl}`

    foundUser.photoUrl = photoUrl

    res.status(STATUSES_HTTP.OK_200).json(foundUser)
  }

  async updateProfile(req: Request, res: Response) {
    let allowedFields = ['firstName', 'lastName', 'male', 'email']
    const updateProfileDto: updateProfileDTO = {}


    // Проверка, является ли пользователь суперпользователем
    if (isProfileRoleModel(req.user!) && req.user!.isSuper) {
      // Суперадмин может менять любые поля (id не влючил т.к. по сути это служебное поле)
      allowedFields = [...allowedFields, 'passwordHash', 'regDateId', 'isSuper']
    }

    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key) && allowedFields.includes(key)) {
        updateProfileDto[key as keyof updateProfileDTO] = req.body[key]
      }
    }

    // Если фото подгрузили, обновляем
    if (req.fileName) updateProfileDto['photoName'] = req.fileName

    console.log(updateProfileDto)

    // Если объект пустой - сразу возвращаем 204
    if (Object.keys(updateProfileDto).length === 0) {
      res
        .status(STATUSES_HTTP.NO_CONTENT_204)
        .json({ Info: 'Не предоставлено полей, доступных для изменения' })
      return
    }

    const updateStatus: Result<boolean> = await this.profileService.updateProfile(
      req.params.id,
      updateProfileDto
    )
    if (updateStatus.data === null) {
      res.status(updateStatus.resultCode).json({ updateStatus: updateStatus.errorMessage })
    } else {
      res.sendStatus(STATUSES_HTTP.NO_CONTENT_204)
    }
  }
}
