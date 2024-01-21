// multerConfig.ts
import multer, { type FileFilterCallback, type StorageEngine } from 'multer'
import path from 'path'
import { type NextFunction, type Request, type Response } from 'express'

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, 'uploads/')
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  },
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    req.fileValidationError = 'Неподдерживаемый формат файла'
    cb(null, false)
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
})

export const handleAvatarImageAndUploadBody = (req: Request, res: Response, next: NextFunction) => {
  upload.single('photo')(req, res, err => {
    if (err instanceof multer.MulterError) {
      // Обработка ошибок Multer, например, ошибка размера файла
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.errorInfo = { message: 'Размер файла превышает максимально допустимый', field: 'photo' }
        next()
        return
      }
      req.errorInfo = { message: 'Ошибка загрузки файла', field: 'photo' }
      next()
    } else if (req.fileValidationError) {
      // Обработка ошибок валидации файла
      req.errorInfo = { message: req.fileValidationError, field: 'photo' }
      next()
    } else if (err) {
      req.errorInfo = { message: err.message, field: 'photo' }
      next()
    } else if (req.file) {
      // Если файл успешно загружен, добавляем его имя в req
      req.fileName = req.file.filename // Имя файла теперь в req.fileName
      next()
    } else {
      // Если файл не был передан, отправляем ошибку
      req.errorInfo = { message: 'Фото обязательно для загрузки', field: 'photo' }
      next()
    }
  })
}

export const handleAvatarImageAndUploadBodyOptional = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single('photo')(req, res, err => {
    if (err instanceof multer.MulterError) {
      // Обработка ошибок Multer, например, ошибка размера файла
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.errorInfo = { message: 'Размер файла превышает максимально допустимый', field: 'photo' }
        next()
        return
      }
      req.errorInfo = { message: 'Ошибка загрузки файла', field: 'photo' }
      next()
    } else if (req.fileValidationError) {
      // Обработка ошибок валидации файла
      req.errorInfo = { message: req.fileValidationError, field: 'photo' }
      next()
    } else if (err) {
      req.errorInfo = { message: err.message, field: 'photo' }
      next()
    } else if (req.file) {
      // Если файл успешно загружен, добавляем его имя в req
      req.fileName = req.file.filename // Имя файла теперь в req.fileName
      next()
    } else {
      // Если файл не был передан, не отправляем ошибку т.к. при update это не обязательное условие
      next()
    }
  })
}

export default upload
