import { Router } from 'express'



export const profileRouter = Router({})

/**
 * @swagger
 * components:
 *   schemas:
 *     ProfileUpdateInputModel:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 1
 *           maxLength: 40
 *           description: Имя пользователя
 *         lastName:
 *           type: string
 *           minLength: 1
 *           maxLength: 40
 *           description: Фамилия пользователя
 *         email:
 *           type: string
 *           format: email
 *           minLength: 5
 *           maxLength: 50
 *           description: Электронная почта пользователя
 *         male:
 *           type: string
 *           enum: [Мужской, Женский]
 *           description: Пол пользователя
 *         photo:
 *           type: string
 *           format: binary
 *           description: Фотография пользователя (допустимые форматы -.jpg, .png, максимальный размер -  10MB)
 *       example:
 *         firstName: Лев
 *         lastName: Ландау
 *         email: landau@mipt.com
 *         male: Мужской
 *         photo: тут загружается фотка
 *
 *     ProfileViewModel:
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 * /profile/{profileId}:
 *   put:
 *     summary: Редактирование профиля пользователя  по id
 *     description: При редактировании можно менять всю информацию кроме ID, Пароля, Дата регистрации. Если объект не был обновлен т.к. не были переданы доступные к обновлению поля - всё равно вернем 204
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in : path
 *         name: profileId
 *         description: id of profile
 *         schema:
 *           type: uuid
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateInputModel'
 *     responses:
 *       204:
 *         description: Успех.
 *       400:
 *         description: Ошибка во входных данных
 *         content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIErrorResult'
 *       401:
 *         description: Аутентификация не пройдена
 *       403:
 *         description: Отказано в доступе. Вы можете менять только свой профиль
 *       404:
 *         description: Профиль с таким profileId не найден
 *
 */
profileRouter.put(
  '/:id',
    (req: any, res: any) => {
        res.send({});
    }
)

/**
 * @swagger
 * /profile/{profileId}:
 *   get:
 *     summary: Получение информации о профиле пользователя по id
 *     tags: [Profiles]
 *     parameters:
 *       - in : path
 *         name: profileId
 *         description: id of profile
 *         schema:
 *           type: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Успех.
 *         content:
 *            text/plain:
 *              schema:
 *                $ref: '#/components/schemas/ProfileViewModel'
 *       404:
 *         description: Профиль с таким profileId не найден
 */
profileRouter.get('/:id', (req: any, res: any) => {
    res.send({});
})
