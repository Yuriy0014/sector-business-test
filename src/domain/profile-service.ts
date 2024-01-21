import { inject, injectable } from 'inversify'
import { ProfileRepo } from '../repos/profile-repo'
import bcrypt from 'bcrypt'
import { STATUSES_HTTP } from '../enum/http-statuses'
import { type registrationDTO, type updateProfileDTO } from '../dto/auth.dto'

@injectable()
export class ProfileService {
  constructor(@inject(ProfileRepo) protected profileRepo: ProfileRepo) {}

  async createProfile(dto: registrationDTO, photoName: string) {
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const createDTO = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      male: dto.male,
      email: dto.email,
      passwordHash,
      photoName,
    }

    // Создаем юзера
    const profileId = await this.profileRepo.createProfile(createDTO)

    if (!profileId) {
      return {
        resultCode: STATUSES_HTTP.SERVER_ERROR_500,
        data: null,
        errorMessage: 'Возникла ошибка при регистрации',
      }
    }

    return {
      resultCode: STATUSES_HTTP.NO_CONTENT_204,
      data: profileId,
    }
  }

  async checkCredentials(email: string, password: string) {
    const profile = await this.profileRepo.findByEmail(email)
    if (profile === false) {
      return {
        resultCode: STATUSES_HTTP.UNAUTHORIZED_401,
        data: null,
        errorMessage: 'Пользователь не найден',
      }
    }

    if (profile === null) {
      return {
        resultCode: STATUSES_HTTP.SERVER_ERROR_500,
        data: null,
        errorMessage: 'Возникла ошибка попытке найти пользователя',
      }
    }

    const passHash = profile.passwordHash

    const result = await bcrypt.compare(password, passHash)

    if (!result) {
      return {
        resultCode: STATUSES_HTTP.UNAUTHORIZED_401,
        data: null,
        errorMessage: 'Авторизация не удалась',
      }
    }

    return {
      resultCode: STATUSES_HTTP.OK_200,
      data: profile,
    }
  }

  async updateProfile(id: string, dto: updateProfileDTO) {
    const udpateStatus = await this.profileRepo.updateProfile(id, dto)

    if (udpateStatus === false) {
      return {
        resultCode: STATUSES_HTTP.NOT_FOUND_404,
        data: null,
        errorMessage: 'Профиль с таким id не найден',
      }
    }

    if (udpateStatus === null) {
      return {
        resultCode: STATUSES_HTTP.SERVER_ERROR_500,
        data: null,
        errorMessage: 'Что-то пошло не так. Попробуй еще раз',
      }
    }

    return {
      resultCode: STATUSES_HTTP.NO_CONTENT_204,
      data: udpateStatus,
    }
  }
}
