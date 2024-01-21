import { Router } from 'express'

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
testingRouter.delete('/', (req: any, res: any) => {
    res.send({});
})
