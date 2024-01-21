import 'reflect-metadata'
import express, { type NextFunction, type Request, type Response } from 'express'
import cookieParser from 'cookie-parser'
import { RouterPaths } from './helpers/RouterPaths'
import { profileRouter } from './routers/profile-router'
import { authRouter } from './routers/auth-router'
import { profilesRouter } from './routers/profiles-router'
import { STATUSES_HTTP } from './enum/http-statuses'
import { container } from './composition-root'
import { AuthMW } from './middlewares/auth.mw'
import { asyncMiddleware } from './helpers/async-wrappers'
import { testingRouter } from './routers/testing-router'
import path from 'path'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

export const app = express()
const jsonBodyMW = express.json()
app.use(jsonBodyMW)
app.use(cookieParser())

// Настройка папки для статических файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Добавляет всем запросам где нет требуется авторизация, req.user, если все таки юзер с активным accessToken
const authMW = container.resolve(AuthMW)
app.use(asyncMiddleware(authMW.addReqUser.bind(authMW)))

app.use(RouterPaths.profile, profileRouter)
app.use(RouterPaths.auth, authRouter)
app.use(RouterPaths.profiles, profilesRouter)
app.use(RouterPaths.testing, testingRouter)

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sector-business Express API with Swagger',
      version: '1.0.0',
      description:
        'Тестовое задание для компании Сектор Бизнеса на позицию Backend-разработчик. Node js',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Юрий Логачев',
        url: 'https://t.me/Lemnigut',
        email: 'ylogachev2019@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:7050',
      },
    ],
  },
  apis: ['src/**/*.ts'],
}

const specs = swaggerJsdoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Глобальный обработчик ошибок для оберток
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  res.status(STATUSES_HTTP.SERVER_ERROR_500).json({ message: 'Что-то пошло не так' })
})
