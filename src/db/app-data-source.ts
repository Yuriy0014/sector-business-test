import { DataSource } from 'typeorm'
import { injectable } from 'inversify'
import { ProfileEntity } from '../domain/entities/profile.entity'
import { SessionEntity } from '../domain/entities/session.entity'

export const myDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '231193Admin$',
  database: 'test',
  entities: [ProfileEntity, SessionEntity],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  logging: true,
  synchronize: false,
})

export async function runDb() {
  myDataSource
    .initialize()
    .then(() => {
      console.log('Успешно подключились к БД')
    })
    .catch(err => {
      console.error('В результате подключения к БД произошла ошибка:', err)
    })
}

@injectable()
export class DataSourceFactory {
  createDataSource(): DataSource {
    return myDataSource
  }
}
