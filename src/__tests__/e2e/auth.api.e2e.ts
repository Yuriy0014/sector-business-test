import request from 'supertest'

import { STATUSES_HTTP } from '../../enum/http-statuses'
import { RouterPaths } from '../../helpers/RouterPaths'
import { app } from '../../app-settings'
import { type registrationDTO } from '../../dto/auth.dto'
import { myDataSource } from '../../db/app-data-source'
import { ProfileEntity } from '../../domain/entities/profile.entity'
import { type loginModel, maleEnum } from '../../models/profile.model'
import { type Repository } from 'typeorm'
import { generateString } from '../utils/export_data_functions'
import path from 'path'

describe('/Testing AUTH', () => {
  let profile1: ProfileEntity | null
  let profile2: ProfileEntity | null
  let accessToken1: string
  let accessToken1OLD: string
  let refreshToken1: string
  let refreshToken1OLD: string
  let profileRepository: Repository<ProfileEntity>

  async function testRegistrationWithDefaultPhoto(
    data: any,
    expectedErrorsCount: number,
    expectedErrors: any
  ) {
    const filePath = path.join(__dirname, '../img/gosling_good.png')
    const response = await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data.firstName ?? '')
      .field('lastName', data.lastName ?? '')
      .field('email', data.email ?? '')
      .field('password', data.password ?? '')
      .field('male', data.male ?? '')
      .attach('photo', filePath) // Путь к файлу фотографии
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    expect(response.body).toHaveProperty('errorsMessages')
    const errorsMessages = response.body.errorsMessages
    expect(Array.isArray(errorsMessages)).toBeTruthy()
    expect(errorsMessages).toHaveLength(expectedErrorsCount)

    expectedErrors.forEach((expectedError: any, index: number) => {
      expect(errorsMessages[index].message).toBe(expectedError.message)
      expect(errorsMessages[index].field).toBe(expectedError.field)
    })
  }

  beforeAll(async () => {
    await myDataSource.initialize()
    profileRepository = myDataSource.getRepository(ProfileEntity)
  })

  it('Delete all data before tests', async () => {
    await request(app).delete(`${RouterPaths.testing}`).expect(STATUSES_HTTP.NO_CONTENT_204)
  })

  /// /////
  /// Регистрация
  /// ////

  it('Регистрация неуспешна при отсутствии всех полей', async () => {
    const data = {}
    const expectedErrors = [
      { message: 'Имя должно должны быть длиной от 1 до 40 символов', field: 'firstName' },
      { message: 'Фамилия должно должны быть длиной от 1 до 40 символов', field: 'lastName' },
      { message: 'Пароль должен содержать от 6 до 20 символов', field: 'password' },
      { message: "Пол должен быть 'Мужской' или 'Женский'", field: 'male' },
      { message: 'Email должен содержать от 5 до 50 символов', field: 'email' },
    ]
    await testRegistrationWithDefaultPhoto(data, 5, expectedErrors)
  })

  it('Регистрация неуспешна при отсутствии поля firstName', async () => {
    const data = {
      lastName: 'Тьюринг',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    await testRegistrationWithDefaultPhoto(data, 1, [
      { message: 'Имя должно должны быть длиной от 1 до 40 символов', field: 'firstName' },
    ])
  })

  it('Регистрация неуспешна при отсутствии поля lastName', async () => {
    const data = {
      firstName: 'Алан',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    await testRegistrationWithDefaultPhoto(data, 1, [
      { message: 'Фамилия должно должны быть длиной от 1 до 40 символов', field: 'lastName' },
    ])
  })

  it('Регистрация неуспешна при отсутствии поля email', async () => {
    const data = {
      firstName: 'Алан',
      lastName: 'Тьюринг',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    await testRegistrationWithDefaultPhoto(data, 1, [
      { message: 'Email должен содержать от 5 до 50 символов', field: 'email' },
    ])
  })

  it('Регистрация неуспешна при отсутствии поля password', async () => {
    const data = {
      firstName: 'Алан',
      lastName: 'Тьюринг',
      email: 'alantuiring@yandex.ru',
      male: maleEnum.man,
    }
    await testRegistrationWithDefaultPhoto(data, 1, [
      { message: 'Пароль должен содержать от 6 до 20 символов', field: 'password' },
    ])
  })

  it('Регистрация неуспешна при отсутствии поля male', async () => {
    const data = {
      firstName: 'Алан',
      lastName: 'Тьюринг',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
    }
    await testRegistrationWithDefaultPhoto(data, 1, [
      { message: "Пол должен быть 'Мужской' или 'Женский'", field: 'male' },
    ])
  })

  it('Регистрация неуспешна при слишком длинном или коротком имени', async () => {
    const data = {
      lastName: 'Тьюринг',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }

    const data1 = {
      ...data,
      firstName: '',
    }
    await testRegistrationWithDefaultPhoto(data1, 1, [
      { message: 'Имя должно должны быть длиной от 1 до 40 символов', field: 'firstName' },
    ])

    const data2 = {
      ...data,
      firstName: generateString(41),
    }

    await testRegistrationWithDefaultPhoto(data2, 1, [
      { message: 'Имя должно должны быть длиной от 1 до 40 символов', field: 'firstName' },
    ])
  })

  it('Регистрация неуспешна если в имени содержатся недопустимые символы', async () => {
    const data = {
      firstName: '',
      lastName: 'Тьюринг',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }

    const data1 = {
      ...data,
      firstName: 'Саша1997',
    }
    await testRegistrationWithDefaultPhoto(data1, 1, [
      { message: 'Имя должно состоять только из русских или анлийских букв', field: 'firstName' },
    ])

    const data2 = {
      ...data,
      firstName: 'Sasha_Tut',
    }

    await testRegistrationWithDefaultPhoto(data2, 1, [
      { message: 'Имя должно состоять только из русских или анлийских букв', field: 'firstName' },
    ])
  })

  it('Регистрация неуспешна при слишком длинном или коротком фамилии', async () => {
    const data = {
      firstName: 'Алан',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }

    const data1 = {
      ...data,
      lastName: '',
    }
    await testRegistrationWithDefaultPhoto(data1, 1, [
      { message: 'Фамилия должно должны быть длиной от 1 до 40 символов', field: 'lastName' },
    ])

    const data2 = {
      ...data,
      lastName: generateString(41),
    }

    await testRegistrationWithDefaultPhoto(data2, 1, [
      { message: 'Фамилия должно должны быть длиной от 1 до 40 символов', field: 'lastName' },
    ])
  })

  it('Регистрация неуспешна если в фамилии содержатся недопустимые символы', async () => {
    const data = {
      firstName: 'Алан',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }

    const data1 = {
      ...data,
      lastName: 'Тьюринг2024',
    }
    await testRegistrationWithDefaultPhoto(data1, 1, [
      {
        message: 'Фамилия должно состоять только из русских или анлийских букв',
        field: 'lastName',
      },
    ])

    const data2 = {
      ...data,
      lastName: 'Tur_was_here@',
    }

    await testRegistrationWithDefaultPhoto(data2, 1, [
      {
        message: 'Фамилия должно состоять только из русских или анлийских букв',
        field: 'lastName',
      },
    ])
  })

  it('Регистрация неуспешна если пол не один из двух', async () => {
    const data = {
      firstName: 'Алан',
      lastName: 'Тьюринг',
      email: 'alantuiring@yandex.ru',
      password: 'Genious2279',
      male: 'Европеец',
    }

    await testRegistrationWithDefaultPhoto(data, 1, [
      { message: "Пол должен быть 'Мужской' или 'Женский'", field: 'male' },
    ])
  })

  it('Регистрация неуспешна если пароль длинный или короткий', async () => {
    const data = {
      firstName: 'Алан',
      lastName: 'Тьюринг',
      email: 'alantuiring@yandex.ru',
      male: maleEnum.man,
    }

    const data1 = {
      ...data,
      password: generateString(5),
    }

    await testRegistrationWithDefaultPhoto(data1, 1, [
      { message: 'Пароль должен содержать от 6 до 20 символов', field: 'password' },
    ])

    const data2 = {
      ...data,
      password: generateString(21),
    }

    await testRegistrationWithDefaultPhoto(data2, 1, [
      { message: 'Пароль должен содержать от 6 до 20 символов', field: 'password' },
    ])
  })

  it('Регистрация неуспешна если email длинный или короткий', async () => {
    const data = {
      firstName: 'Алан',
      lastName: 'Тьюринг',
      password: generateString(10),
      male: maleEnum.man,
    }

    const data1 = {
      ...data,
      email: generateString(50) + '@gmail.ru',
    }

    await testRegistrationWithDefaultPhoto(data1, 1, [
      { message: 'Email должен содержать от 5 до 50 символов', field: 'email' },
    ])
  })

  it('Регистрация неуспешна если email некорректный', async () => {
    const data = {
      firstName: 'Алан',
      lastName: 'Тьюринг',
      password: generateString(10),
      male: maleEnum.man,
    }

    const data1 = {
      ...data,
      email: generateString(30),
    }

    await testRegistrationWithDefaultPhoto(data1, 1, [
      { message: 'ERROR неверный формат email', field: 'email' },
    ])
  })

  it('Слишком большое фото', async () => {
    const filePath = path.join(__dirname, '../img/big.png')

    const data: registrationDTO = {
      firstName: 'Alan',
      lastName: 'Тьюринг',
      email: 'alantuiring1823@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    const response = await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data.firstName)
      .field('lastName', data.lastName)
      .field('email', data.email)
      .field('password', data.password)
      .field('male', data.male)
      .attach('photo', filePath) // Путь к файлу фотографии
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    expect(response.body).toHaveProperty('errorsMessages')
    const errorsMessages = response.body.errorsMessages
    expect(Array.isArray(errorsMessages)).toBeTruthy()
    expect(errorsMessages).toHaveLength(1)

    expect(errorsMessages[0].message).toBe('Размер файла превышает максимально допустимый')
  })

  it('Вместо фото файл другого разрешения', async () => {
    const filePath = path.join(__dirname, '../img/file_not_png.txt')

    const data: registrationDTO = {
      firstName: 'Alan',
      lastName: 'Тьюринг',
      email: 'alantuiring1823@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    const response = await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data.firstName)
      .field('lastName', data.lastName)
      .field('email', data.email)
      .field('password', data.password)
      .field('male', data.male)
      .attach('photo', filePath) // Путь к файлу фотографии
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    expect(response.body).toHaveProperty('errorsMessages')
    const errorsMessages = response.body.errorsMessages
    expect(Array.isArray(errorsMessages)).toBeTruthy()
    expect(errorsMessages).toHaveLength(1)

    expect(errorsMessages[0].message).toBe('Неподдерживаемый формат файла')
  })

  it('Регистрация без фото', async () => {
    const data: registrationDTO = {
      firstName: 'Alan',
      lastName: 'Тьюринг',
      email: 'alantuiring1823@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    const response = await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data.firstName)
      .field('lastName', data.lastName)
      .field('email', data.email)
      .field('password', data.password)
      .field('male', data.male)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    expect(response.body).toHaveProperty('errorsMessages')
    const errorsMessages = response.body.errorsMessages
    expect(Array.isArray(errorsMessages)).toBeTruthy()
    expect(errorsMessages).toHaveLength(1)

    expect(errorsMessages[0].message).toBe('Фото обязательно для загрузки')
  })

  it('Успешная регистрация png', async () => {
    const filePath = path.join(__dirname, '../img/gosling_good.png')

    const data: registrationDTO = {
      firstName: 'Alan',
      lastName: 'Тьюринг',
      email: 'alantuiringPNG@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data.firstName)
      .field('lastName', data.lastName)
      .field('email', data.email)
      .field('password', data.password)
      .field('male', data.male)
      .attach('photo', filePath) // Путь к файлу фотографии
      .expect(STATUSES_HTTP.NO_CONTENT_204)

    profile1 = await profileRepository.findOneBy({ email: data.email })

    expect(profile1).not.toBe(null)
    expect(profile1).toMatchObject({
      id: expect.any(String),
      firstName: data.firstName,
      lastName: data.lastName,
      male: data.male,
      email: data.email,
      photoName: expect.any(String),
      passwordHash: expect.any(String),
      regDateId: expect.any(Date),
    })
  })

  it('Успешная регистрация jpg', async () => {
    const filePath = path.join(__dirname, '../img/panda_good.jpg')

    const data: registrationDTO = {
      firstName: 'Alan',
      lastName: 'Тьюринг',
      email: 'alantuiringJPG@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data.firstName)
      .field('lastName', data.lastName)
      .field('email', data.email)
      .field('password', data.password)
      .field('male', data.male)
      .attach('photo', filePath) // Путь к файлу фотографии
      .expect(STATUSES_HTTP.NO_CONTENT_204)

    profile2 = await profileRepository.findOneBy({ email: data.email })

    expect(profile2).not.toBe(null)
    expect(profile2).toMatchObject({
      id: expect.any(String),
      firstName: data.firstName,
      lastName: data.lastName,
      male: data.male,
      email: data.email,
      photoName: expect.any(String),
      passwordHash: expect.any(String),
      regDateId: expect.any(Date),
    })
  })

  /// /////
  /// Логин
  /// ////

  it('Логин несуществующего юзера', async () => {
    const data: loginModel = {
      email: 'test_test@test.ru',
      password: 'testPass',
    }
    await request(app)
      .post(`${RouterPaths.auth}/login`)
      .send(data)
      .expect(STATUSES_HTTP.UNAUTHORIZED_401)
  })

  it('Логин существующего юзера c неверным паролем', async () => {
    const data1: loginModel = {
      email: profile1!.email,
      password: 'testPass',
    }

    await request(app)
      .post(`${RouterPaths.auth}/login`)
      .send(data1)
      .expect(STATUSES_HTTP.UNAUTHORIZED_401)
  })

  it('Логин успешный profile1', async () => {
    const data: loginModel = {
      email: profile1!.email,
      password: 'Genious2279',
    }
    const response = await request(app)
      .post(`${RouterPaths.auth}/login`)
      .send(data)
      .expect(STATUSES_HTTP.OK_200)

    accessToken1 = response.body.accessToken
    // Проверка наличия access токена
    expect(response.body).toHaveProperty('accessToken')
    expect(accessToken1).toEqual(expect.any(String)) // Проверка на тип строка
    expect(accessToken1).not.toBe('') // Проверка на пустую строку

    // Предположим, что response.headers['set-cookie'] - это строка
    expect(response.headers['set-cookie']).toBeDefined()

    // Преобразуем строку в массив, разделяя её по запятой и пробелу
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const cookiesArray: string[] = response.headers['set-cookie']

    // Находим refreshToken
    const refreshTokenCookie = cookiesArray.find(cookie => cookie.startsWith('refreshToken='))
    expect(refreshTokenCookie).toBeDefined()

    // Извлекаем значение токена
    refreshToken1 = refreshTokenCookie!.split('=')[1]
    expect(refreshToken1).toBeTruthy()
    expect(refreshToken1).toEqual(expect.any(String)) // Проверка на тип строка
    expect(refreshToken1).not.toBe('') // Проверка на пустую строку
  })

  /// /////
  /// Логин
  /// ////

  it('Получение новой пары JWT успешное', async () => {
    // Функция для создания задержки т.к. польхователи могут создаться однвременно, что влияет на тесты.
    const delay = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    // Пауза в 1 секунду
    await delay(3000)

    const response22 = await request(app)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', [`refreshToken=${refreshToken1}`]) // Установка cookie
      .expect(STATUSES_HTTP.OK_200)

    accessToken1OLD = accessToken1
    refreshToken1OLD = refreshToken1

    accessToken1 = response22.body.accessToken
    // Проверка наличия access токена
    expect(response22.body).toHaveProperty('accessToken')
    expect(accessToken1).toEqual(expect.any(String)) // Проверка на тип строка
    expect(accessToken1).not.toBe('') // Проверка на пустую строку

    // Предположим, что response.headers['set-cookie'] - это строка
    expect(response22.headers['set-cookie']).toBeDefined()

    // Преобразуем строку в массив, разделяя её по запятой и пробелу
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const cookiesArray: string[] = response22.headers['set-cookie']

    // Находим refreshToken
    const refreshTokenCookie = cookiesArray.find(cookie => cookie.startsWith('refreshToken='))
    expect(refreshTokenCookie).toBeDefined()

    // Извлекаем значение токена
    refreshToken1 = refreshTokenCookie!.split('=')[1]
    expect(refreshToken1).toBeTruthy()
    expect(refreshToken1).toEqual(expect.any(String)) // Проверка на тип строка
    expect(refreshToken1).not.toBe('') // Проверка на пустую строку
  })

  it('Получение новой пары JWT c старым RF token (но по дате еще действителен) 401', async () => {
    await request(app)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', [`refreshToken=${refreshToken1OLD}`]) // Установка cookie
      .expect(STATUSES_HTTP.UNAUTHORIZED_401)
  })

  it('Попытка вылогиниться с неактуальным RFToken 401', async () => {
    await request(app)
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', [`refreshToken=${refreshToken1OLD}`]) // Установка cookie
      .expect(STATUSES_HTTP.UNAUTHORIZED_401)
  })

  it('Логаут успешный', async () => {
    await request(app)
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', [`refreshToken=${refreshToken1}`]) // Установка cookie
      .expect(STATUSES_HTTP.NO_CONTENT_204)
  })

  it('Логаут повторный 401', async () => {
    await request(app)
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', [`refreshToken=${refreshToken1}`]) // Установка cookie
      .expect(STATUSES_HTTP.UNAUTHORIZED_401)
  })

  it('Получение новой пары JWT после логаута', async () => {
    await request(app)
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', [`refreshToken=${refreshToken1}`]) // Установка cookie
      .expect(STATUSES_HTTP.UNAUTHORIZED_401)
  })

  afterAll(async () => {
    await myDataSource.destroy()
  })
})
