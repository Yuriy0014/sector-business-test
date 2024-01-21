import 'reflect-metadata'
import express, {type NextFunction, type Request, type Response} from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {STATUSES_HTTP} from "./enum/http-statuses";

export const app = express()

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
