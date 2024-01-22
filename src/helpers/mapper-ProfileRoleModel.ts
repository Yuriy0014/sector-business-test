import { injectable } from 'inversify'
import { type ProfileEntity } from '../domain/entities/profile.entity'
import { ProfileRoleModel } from '../models/profile.model'

@injectable()
export class MapProfileRoleModelSQL {
  getProfileRoleModel(profile: ProfileEntity): ProfileRoleModel {
    return {
      id: profile.id,
      isSuper: profile.isSuper,
    }
  }
}
