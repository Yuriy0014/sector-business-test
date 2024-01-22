import { body } from 'express-validator'
import { maleEnum } from '../models/profile.model'
import { inject, injectable } from 'inversify'
import { ProfileQueryRepo } from '../repos/queryRepo/profile-query-repo'

@injectable()
export class ProfileValidationMW {
  constructor(@inject(ProfileQueryRepo) protected profileQueryRepo: ProfileQueryRepo) {}

  maleEnumValues = Object.values(maleEnum)

  passwordValidation = body('password')
    .isString()
    .withMessage('Пароль должен быть строкой')
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Пароль должен содержать от 6 до 20 символов')

  firstNameValidation = body('firstName')
    .isString()
    .withMessage('Имя должно быть строкой')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Имя должно должны быть длиной от 1 до 40 символов')
    .matches(/^[а-яА-Яa-zA-Z]+$/)
    .withMessage('Имя должно состоять только из русских или анлийских букв')

  firstNameValidationOptional = body('firstName')
    .optional()
    .isString()
    .withMessage('Имя должно быть строкой')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Имя должно быть длиной от 1 до 40 символов')
    .matches(/^[а-яА-Яa-zA-Z]+$/)
    .withMessage('Имя должно состоять только из русских или анлийских букв')

  lastNameValidation = body('lastName')
    .isString()
    .withMessage('Фамилия должно быть строкой')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Фамилия должно должны быть длиной от 1 до 40 символов')
    .matches(/^[а-яА-Яa-zA-Z]+$/)
    .withMessage('Фамилия должно состоять только из русских или анлийских букв')

  maleValidation = body('male')
    .isString()
    .withMessage('пол должен быть строкой')
    .trim()
    .custom(value => this.maleEnumValues.includes(value))
    .withMessage("Пол должен быть 'Мужской' или 'Женский'")

  maleValidationOptional = body('male')
    .optional()
    .isString()
    .withMessage('пол должен быть строкой')
    .trim()
    .custom(value => this.maleEnumValues.includes(value))
    .withMessage("Пол должен быть 'Мужской' или 'Женский'")

  lastNameValidationOptional = body('lastName')
    .optional()
    .isString()
    .withMessage('Фамилия должно быть строкой')
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Фамилия должно быть длиной от 1 до 40 символов')
    .matches(/^[а-яА-Яa-zA-Z]+$/)
    .withMessage('Фамилия должно состоять только из русских или анлийских букв')

  emailValidation = body('email')
    .isString()
    .withMessage('Email должен быть строкой')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Email должен содержать от 5 до 50 символов')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('ERROR неверный формат email')

  isEmailExistValidation = body('email').custom(async value => {
    const emailExists = await this.profileQueryRepo.findProfileByEmail(value)

    if (emailExists === null) {
      throw new Error('Что-то пошло не так')
    }

    if (emailExists) {
      throw new Error('Профайл с таким email уже зарегестрирован')
    }
  })

  emailValidationOptional = body('email')
    .optional()
    .isString()
    .withMessage('Email должен быть строкой')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Email должен содержать от 5 до 50 символов')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('ERROR неверный формат email')

  ///////
  // Валидация полей для superuser
  ///////

  superBooleanValidationOptional = body('isSuper')
    .optional()
    .isBoolean()
    .withMessage('isSuper должно быть булевым значением')

  passwordHashValidationOptional = body('passwordHash')
    .optional()
    .matches(/^\$2[aby]?\$10\$\S{53}$/)
    .withMessage('неверный формат хэша пароля')

  regDateIdValidationOptional = body('regDateId')
    .optional()
    .isISO8601()
    .withMessage('неверный формат даты регистрации')
}
