import request from 'supertest'

import { STATUSES_HTTP } from '../../enum/http-statuses'
import { RouterPaths } from '../../helpers/RouterPaths'
import { app } from '../../app-settings'
import { myDataSource } from '../../db/app-data-source'
import { ProfileEntity } from '../../domain/entities/profile.entity'
import { maleEnum } from '../../models/profile.model'
import { type Repository } from 'typeorm'
import path from 'path'
import { type registrationDTO } from '../../dto/auth.dto'
import { generateString } from '../utils/export_data_functions'

describe('/Testing profiles', () => {
  let data1: registrationDTO
  let data2: registrationDTO
  let profile1: ProfileEntity | null
  let profile2: ProfileEntity | null
  let accessToken1: string
  let accessToken1OLD: string
  let accessToken2: string
  let profileRepository: Repository<ProfileEntity>

  async function testUpdate400Profile2(
    response: any,
    expectedErrorsCount: number,
    expectedErrors: any
  ) {
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

    await request(app).delete(`${RouterPaths.testing}`)

    // Регистрируем юзера1
    const filePath = path.join(__dirname, '../img/gosling_good.png')

    data1 = {
      firstName: 'Alan',
      lastName: 'Тьюринг',
      email: 'alantuiringPNG1@yandex.ru',
      password: 'Genious2279',
      male: maleEnum.man,
    }
    await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data1.firstName)
      .field('lastName', data1.lastName)
      .field('email', data1.email)
      .field('password', data1.password)
      .field('male', data1.male)
      .attach('photo', filePath) // Путь к файлу фотографии
      .expect(STATUSES_HTTP.NO_CONTENT_204)

    // Функция для создания задержки т.к. польхователи могут создаться однвременно, что влияет на тесты.
    const delay = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    // Пауза в 1 секунду
    await delay(1000)

    data2 = {
      firstName: 'Alan',
      lastName: 'Тьюринг',
      email: 'alantuiringPNG2@yandex.ru',
      password: 'KJbbe78u',
      male: maleEnum.man,
    }
    await request(app)
      .post(`${RouterPaths.auth}/register`)
      .field('firstName', data2.firstName)
      .field('lastName', data2.lastName)
      .field('email', data2.email)
      .field('password', data2.password)
      .field('male', data2.male)
      .attach('photo', filePath) // Путь к файлу фотографии
      .expect(STATUSES_HTTP.NO_CONTENT_204)

    // Логинимся

    const loginData1 = {
      email: data1.email,
      password: data1.password,
    }

    const response1 = await request(app)
      .post(`${RouterPaths.auth}/login`)
      .send(loginData1)
      .expect(STATUSES_HTTP.OK_200)

    accessToken1 = response1.body.accessToken

    const loginData2 = {
      email: data2.email,
      password: data2.password,
    }

    const response2 = await request(app)
      .post(`${RouterPaths.auth}/login`)
      .send(loginData2)
      .expect(STATUSES_HTTP.OK_200)

    accessToken2 = response2.body.accessToken
  })

  it('Получение списка профилей c 1 страница', async () => {
    const response1 = await request(app)
      .get(`${RouterPaths.profiles}?page=1`)
      .expect(STATUSES_HTTP.OK_200)

    profile1 = response1.body.items[0]
    profile2 = response1.body.items[1]

    // Проверка структуры ответа
    expect(response1.body).toEqual(
      expect.objectContaining({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            firstName: data1.firstName,
            lastName: data1.lastName,
            email: data1.email,
            photoUrl: expect.any(String),
          }),
          expect.objectContaining({
            id: expect.any(String),
            firstName: data2.firstName,
            lastName: data2.lastName,
            email: data2.email,
            photoUrl: expect.any(String),
          }),
        ]),
      })
    )

    const response2 = await request(app).get(`${RouterPaths.profiles}`).expect(STATUSES_HTTP.OK_200)

    // Проверка структуры ответа
    expect(response2.body).toEqual(
      expect.objectContaining({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            firstName: data2.firstName,
            lastName: data2.lastName,
            email: data2.email,
            photoUrl: expect.any(String),
          }),
          expect.objectContaining({
            id: expect.any(String),
            firstName: data1.firstName,
            lastName: data1.lastName,
            email: data1.email,
            photoUrl: expect.any(String),
          }),
        ]),
      })
    )
  })

  it('Получение списка профилей c пустой страницы', async () => {
    const response1 = await request(app)
      .get(`${RouterPaths.profiles}?page=2`)
      .expect(STATUSES_HTTP.OK_200)

    // Проверка структуры ответа
    expect(response1.body).toEqual(
      expect.objectContaining({
        pagesCount: 1,
        page: 2,
        pageSize: 10,
        totalCount: 2,
        items: [],
      })
    )
  })

  it('Получение профиля по несуществующему id ', async () => {
    await request(app)
      .get(`${RouterPaths.profile}/00000000000000`)
      .expect(STATUSES_HTTP.NOT_FOUND_404)
  })

  it('Получение профиля по id ', async () => {
    const response1 = await request(app)
      .get(`${RouterPaths.profile}/${profile1!.id}`)
      .expect(STATUSES_HTTP.OK_200)

    // Проверка структуры ответа
    expect(response1.body).toEqual(
      expect.objectContaining({ ...profile1, photoUrl: expect.any(String) })
    )
  })

  it('Обновления профиля не владельцем 403', async () => {
    await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken1}` })
      .send({})
      .expect(STATUSES_HTTP.FORBIDDEN_403)
  })

  it('Обновления своего профиля {}', async () => {
    await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .send({})
      .expect(STATUSES_HTTP.NO_CONTENT_204)
  })

  it('Обновления своего профиля 400', async () => {
    const data = {
      email: 'dwiudwddw',
    }

    await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .send(data)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)
  })

  /// //////
  /// UPDATE
  /// /////

  it('Обновление неуспешна при слишком длинном или коротком имени', async () => {
    const data1 = {
      firstName: '',
    }

    const response = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('firstName', data1.firstName)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response, 1, [
      { message: 'Имя должно быть длиной от 1 до 40 символов', field: 'firstName' },
    ])

    const data2 = {
      firstName: generateString(41),
    }

    await testUpdate400Profile2(response, 1, [
      { message: 'Имя должно быть длиной от 1 до 40 символов', field: 'firstName' },
    ])
  })

  it('Обновление неуспешна если в имени содержатся недопустимые символы', async () => {
    const data1 = {
      firstName: 'Саша1997',
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('firstName', data1.firstName)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [
      { message: 'Имя должно состоять только из русских или анлийских букв', field: 'firstName' },
    ])

    const data2 = {
      firstName: 'Sasha_Tut',
    }

    const response2 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('firstName', data2.firstName)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response2, 1, [
      { message: 'Имя должно состоять только из русских или анлийских букв', field: 'firstName' },
    ])
  })

  it('Обновление неуспешна при слишком длинном или коротком фамилии', async () => {
    const data1 = {
      lastName: '',
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('lastName', data1.lastName)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [
      { message: 'Фамилия должно быть длиной от 1 до 40 символов', field: 'lastName' },
    ])

    const data2 = {
      lastName: generateString(41),
    }

    const response2 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('lastName', data2.lastName)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response2, 1, [
      { message: 'Фамилия должно быть длиной от 1 до 40 символов', field: 'lastName' },
    ])
  })

  it('Обновление неуспешна если в фамилии содержатся недопустимые символы', async () => {
    const data1 = {
      lastName: 'Тьюринг2024',
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('lastName', data1.lastName)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [
      {
        message: 'Фамилия должно состоять только из русских или анлийских букв',
        field: 'lastName',
      },
    ])

    const data2 = {
      lastName: 'Tur_was_here@',
    }

    const response2 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('lastName', data2.lastName)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response2, 1, [
      {
        message: 'Фамилия должно состоять только из русских или анлийских букв',
        field: 'lastName',
      },
    ])
  })

  it('Обновление неуспешна если пол не один из двух', async () => {
    const data1 = {
      male: 'Европеец',
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('male', data1.male)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [
      { message: "Пол должен быть 'Мужской' или 'Женский'", field: 'male' },
    ])
  })

  it('Обновление неуспешна если email длинный или короткий', async () => {
    const data1 = {
      email: generateString(50) + '@gmail.ru',
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('email', data1.email)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [
      { message: 'Email должен содержать от 5 до 50 символов', field: 'email' },
    ])
  })

  it('Обновление неуспешна если email некорректный', async () => {
    const data1 = {
      email: generateString(30),
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('email', data1.email)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [
      { message: 'ERROR неверный формат email', field: 'email' },
    ])
  })

  it('Обновление Слишком большое фото', async () => {
    const filePath = path.join(__dirname, '../img/big.png')

    const data1 = {
      photo: filePath,
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .attach('photo', data1.photo)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [
      { message: 'Размер файла превышает максимально допустимый' },
    ])
  })

  it('Обновление Вместо фото файл другого разрешения', async () => {
    const filePath = path.join(__dirname, '../img/file_not_png.txt')

    const data1 = {
      photo: filePath,
    }

    const response1 = await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .attach('photo', data1.photo)
      .expect(STATUSES_HTTP.BAD_REQUEST_400)

    await testUpdate400Profile2(response1, 1, [{ message: 'Неподдерживаемый формат файла' }])
  })

  it('Обновление УСПЕХ', async () => {
    const filePath = path.join(__dirname, '../img/parker.jpg')

    const data1 = {
      firstName: 'Питер',
      lastName: 'Паркер',
      email: 'parker2034@yandex.ru',
      male: maleEnum.man,
      photo: filePath,
    }

    await request(app)
      .put(`${RouterPaths.profile}/${profile2!.id}`)
      .set({ Authorization: `Bearer ${accessToken2}` })
      .field('firstName', data1.firstName)
      .field('lastName', data1.lastName)
      .field('email', data1.email)
      .field('male', data1.male)
      .attach('photo', data1.photo)
      .expect(STATUSES_HTTP.NO_CONTENT_204)
  })

  afterAll(async () => {
    await myDataSource.destroy()
  })
})
