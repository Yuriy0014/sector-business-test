import { Container } from 'inversify'
import { AuthController } from './controllers/auth-controller'
import { ProfileController } from './controllers/profile-controller'
import { JwtService } from './application/jwt-service'
import { ProfileRepo } from './repos/profile-repo'
import { ProfileQueryRepo } from './repos/queryRepo/profile-query-repo'
import { ProfileService } from './domain/profile-service'
import { SessionQueryRepo } from './repos/queryRepo/session-query-repo'
import { SessionRepo } from './repos/session-repo'
import { SessionService } from './domain/session-service'
import { MapProfileViewModelSQL } from './helpers/mapper-ProfileViewModel'
import { DataSourceFactory } from './db/app-data-source'
import { DataSource } from 'typeorm'
import { ProfileValidationMW } from './middlewares/profile.mw'
import {MapProfileRoleModelSQL} from "./helpers/mapper-ProfileRoleModel";

export const container = new Container()

container.bind<DataSourceFactory>(DataSourceFactory).to(DataSourceFactory)
container.bind<DataSource>(DataSource).toDynamicValue(context => {
  return context.container.get(DataSourceFactory).createDataSource()
})

container.bind(JwtService).to(JwtService)
container.bind(ProfileValidationMW).to(ProfileValidationMW)

container.bind(MapProfileViewModelSQL).to(MapProfileViewModelSQL)
container.bind(MapProfileRoleModelSQL).to(MapProfileRoleModelSQL)

container.bind(ProfileRepo).to(ProfileRepo)
container.bind(ProfileQueryRepo).to(ProfileQueryRepo)
container.bind(ProfileService).to(ProfileService)

container.bind(SessionRepo).to(SessionRepo)
container.bind(SessionQueryRepo).to(SessionQueryRepo)
container.bind(SessionService).to(SessionService)

container.bind(ProfileController).to(ProfileController)
container.bind(AuthController).to(AuthController)
