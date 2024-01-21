import { type NextFunction, type Request, type Response } from 'express'

// Обертки созданы для устранения ошибки Promise returned in function argument where a void return was expected  @typescript-eslint/no-misused-promises

export function asyncMiddleware(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch(next)
  }
}

// Определение типа для функции обработчика, которая принимает те же аргументы, что и Express middleware,
// и возвращает Promise<void>, поскольку она асинхронная.
type AsyncHandlerFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>

export function asyncHandler(fn: AsyncHandlerFunction) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
