import { injectable } from 'inversify'
import { type ProfileEntity } from '../domain/entities/profile.entity'
import { type ProfileViewModel } from '../models/profile.model'

@injectable()
export class MapProfileViewModelSQL {
  getProfileViewModel(profile: ProfileEntity): ProfileViewModel {
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      photoUrl: profile.photoName,
    }
  }
}
