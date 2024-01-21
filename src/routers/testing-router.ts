import { Router } from 'express'
import { asyncHandler } from '../helpers/async-wrappers'
import { container } from '../composition-root'
import { TestingController } from '../controllers/testing-controller'

const testingController = container.resolve(TestingController)
export const testingRouter = Router({})

/**
 * @swagger
 *  tags:
 *    name: Tests
 *    description: Всё, что касается тестирования
 */

/**
 * @swagger
 * /testing-clear-data:
 *   delete:
 *     summary: Очистка базы данных для прогона тестов
 *     tags: [Tests]
 *     description: Варинат не для продакшна, конечно. В проде нужна тестовая БД. Но у нас же тут не продакш :)
 *     responses:
 *       204:
 *         description: Данные зачищены
 */
testingRouter.delete('/', asyncHandler(testingController.deleteAll.bind(testingController)))
