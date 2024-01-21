[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

Тестовое задание на ExpressJS


## Технологии
![Node.js Badge](https://img.shields.io/badge/Node.js-393?logo=nodedotjs&logoColor=fff&style=flat)
![Express Badge](https://img.shields.io/badge/Express-000?logo=express&logoColor=fff&style=flat)
![Static Badge](https://img.shields.io/badge/InversifyJS-blue)
![TypeScript Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat)
![JavaScript Badge](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&style=flat)

![Typeform Badge](https://img.shields.io/badge/Typeform-262627?logo=typeform&logoColor=fff&style=flat)
![MySQL Badge](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=fff&style=flat)

![ESLint Badge](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=fff&style=flat)
![Jest Badge](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=fff&style=flat)


![Swagger Badge](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=000&style=flat)

## Документация
[![Swagger Logo](https://upload.wikimedia.org/wikipedia/commons/a/ab/Swagger-logo.png)](http://expressjs.com/)


У проекта есть Swagger документация.

Доступна по пути https://swagger-test-jnd4.onrender.com/api-docs/

Или локально -
http://localhost:7050/api-docs/ 


## Функционал
Основной

* Регистрация пользователя (POST /user/register)
* Авторизация пользователя (POST /user/login)
* Редактирование пользователя (PUT /profile/[id])
* Получение пользователя (GET /profile/[id])
* Получение всех пользователей с пагинацией (GET /profiles?page=1, 10 на страницу)


Дополнительный

* Логаут пользователя (POST /user/logout)
* Получение новой JWT пары (POST /user/refresh-token)

## Выполненные требования

* У каждого пользователя должно быть ID, Имя, Фамилия, Email, Пароль, Пол (Мужской, Женский), Фото, Дата регистрации.
* При регистрации указывает только Имя, Email, Пароль.
* При редактировании можно менять всю информацию кроме ID, Пароля, Дата регистрации.
* При получение всех пользователей с пагинацией сортировать по дате регистрации.
* В базе данных хранить только название файла, все фото должны лежать в папке и раздаваться статически.
* Валидация входных параметро
* Используется ORM (TypeORM)
* Используется JWT (Access токен возвращается в body, refresh - в cookie)
* Пароль будет хранится как хеш
* Проверка фото по размеру, и формату (до 10 мб, .jpg, .png)
* Весь код не контроллерах
