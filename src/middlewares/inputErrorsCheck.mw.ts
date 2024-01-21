import { type NextFunction, type Request, type Response } from 'express'
import { validationResult } from 'express-validator'
import { STATUSES_HTTP } from '../enum/http-statuses'
import { deletePhoto } from '../helpers/deleter'

export const inputValidationMw = async (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req)
  const errors = result.array({ onlyFirstError: true })

  // Проверяем, есть ли ошибки, связанные с загрузкой файлов
  if (req.errorInfo) {
    errors.push({
      msg: req.errorInfo.message,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      param: req.errorInfo.field,
    })
  }

  if (errors.length > 0) {
    // Если во время валидации были ошибки, то удаляем загруженное фото
    if (req.fileName !== undefined) {
      await deletePhoto(req.fileName)
    }

    res.status(STATUSES_HTTP.BAD_REQUEST_400).json({
      errorsMessages: errors.map(val => ({
        message: val.msg,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        field: val['path'],
      })),
    })
  } else {
    next()
  }
}
