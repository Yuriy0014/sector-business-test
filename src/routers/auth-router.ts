import { Router } from 'express'
import { AuthController } from '../controllers/auth-controller'
import { container } from '../composition-root'
import { AuthMW } from '../middlewares/auth.mw'
import { inputValidationMw } from '../middlewares/inputErrorsCheck.mw'
import { ProfileValidationMW } from '../middlewares/profile.mw'
import { asyncHandler, asyncMiddleware } from '../helpers/async-wrappers'
import { handleAvatarImageAndUploadBody } from '../middlewares/avatar.mw'

const authController = container.resolve(AuthController)
const authMW = container.resolve(AuthMW)

export const authRouter = Router({})
const profileValidationMW = container.resolve(ProfileValidationMW)

/**
 * @swagger
 * components:
 *   schemas:
 *     ProfileRegistrationInputModel:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - male
 *         - photo
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
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           maxLength: 20
 *           description: Пароль пользователя
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
 *         password: LevBest1983
 *         male: Мужской
 *         photo: тут загружается фотка
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
 *     LoginSuccessViewModel:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *
 *     LoginInputModel:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 *  tags:
 *    name: Auth
 *    description: Всё, что касается аутентификации и авторизации
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     description: Регистрация нового пользователя с возможностью загрузки фотографии.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProfileRegistrationInputModel'
 *     responses:
 *       200:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Ошибка в данных регистрации или пользователь с таким email уже существует
 *         content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIErrorResult'
 */
authRouter.post(
  '/register',
  handleAvatarImageAndUploadBody,
  profileValidationMW.firstNameValidation,
  profileValidationMW.lastNameValidation,
  profileValidationMW.passwordValidation,
  profileValidationMW.maleValidation,
  profileValidationMW.emailValidation,
  profileValidationMW.isEmailExistValidation,
  asyncMiddleware(inputValidationMw),
  asyncHandler(authController.registerProfile.bind(authController))
)

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Пользователь логинится в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInputModel'
 *     responses:
 *       200:
 *         description: Возвращает JWT accessToken (время жизни  2000 sec) в body и JWT refreshToken в cookie (http-only, secure) (время жизни 4000 sec).
 *         content:
 *            text/plain:
 *              schema:
 *                $ref: '#/components/schemas/LoginSuccessViewModel'
 *       401:
 *         description: Неверный email или пароль
 */
authRouter.post(
  '/login',
  profileValidationMW.emailValidation,
  asyncMiddleware(inputValidationMw),
  asyncHandler(authController.login.bind(authController))
)

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Выход из системы.
 *     tags: [Auth]
 *     description: Для успешного вылогинивания в куках должен быть валидный refreshToken (который будет отозван)
 *     responses:
 *       204:
 *         description: Пользователь вылогинился
 *
 *       401:
 *         description: JWT refreshToken внутри cookie отсутствует, истёк или некорректный
 */
authRouter.post(
  '/logout',
  asyncMiddleware(authMW.verifyRefreshToken.bind(authMW)),
  asyncMiddleware(inputValidationMw),
  asyncHandler(authController.logout.bind(authController))
)

/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Получение новой пары токенов
 *     tags: [Auth]
 *     description: Генерируется новая пара токенов (refresh и access).
 *                  Для этого в куках с клиента должен быть отправлен актуальный refreshToken, который после обновления будет отозван
 *     responses:
 *       200:
 *         description: Возвращает JWT accessToken (время жизни  2000 sec) в body и JWT refreshToken в cookie (http-only, secure) (время жизни 4000 sec).
 *         content:
 *            text/plain:
 *              schema:
 *                $ref: '#/components/schemas/LoginSuccessViewModel'
 *       401:
 *         description: JWT refreshToken внутри cookie отсутствует, истёк или некорректный
 */
authRouter.post(
  '/refresh-token',
  asyncMiddleware(authMW.verifyRefreshToken.bind(authMW)),
  asyncMiddleware(inputValidationMw),
  asyncHandler(authController.updateTokens.bind(authController))
)
