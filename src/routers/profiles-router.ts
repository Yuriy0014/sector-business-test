import { Router } from 'express'
import { container } from '../composition-root'
import { ProfileController } from '../controllers/profile-controller'
import { asyncHandler } from '../helpers/async-wrappers'

const profileController = container.resolve(ProfileController)

export const profilesRouter = Router({})

/**
 * @swagger
 * components:
 *   schemas:
 *     PaginatedProfileViewModel:
 *       type: object
 *       properties:
 *         pagesCount:
 *           type: integer
 *           description: Общее количество страниц
 *         page:
 *           type: integer
 *           description: Номер текущей страницы
 *         pageSize:
 *           type: integer
 *           description: Количество элементов на странице
 *         totalCount:
 *           type: integer
 *           description: Всего элементов
 *         items:
 *           type: array
 *           items:
 *              $ref: '#/components/schemas/ProfileViewModel'
 *
 *     ProfileViewModel2:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         photoUrl:
 *           type: string
 *
 *     APIErrorResult:
 *       type: object
 *       properties:
 *         errorsMessages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FieldError'
 *
 *     FieldError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           nullable: true
 *           description: Описание ошибки
 *         field:
 *           type: string
 *           nullable: true
 *           description: Поле, вызывавшее ошибку
 *
 */

/**
 * @swagger
 *  tags:
 *    name: Profiles
 *    description: Всё, что касается профилей пользователей
 */

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Получение списка всех профилей
 *     tags: [Profiles]
 *     parameters:
 *       - in : query
 *         name: page
 *         description: Номер страницы
 *         schema:
 *           type: integer
 *         required: false
 *         default: 1
 *     responses:
 *       200:
 *         description: Успех.
 *         content:
 *            text/plain:
 *              schema:
 *                $ref: '#/components/schemas/PaginatedProfileViewModel'
 */
profilesRouter.get('/', asyncHandler(profileController.findAllProfiles.bind(profileController)))
