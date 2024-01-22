import { type maleEnum } from '../models/profile.model'

export class registrationDTO {
  firstName: string
  lastName: string
  email: string
  password: string
  male: maleEnum
}

export class updateProfileDTO {
  firstName?: string
  lastName?: string
  male?: maleEnum
  email?: string
  photoName?: string
  passwordHash?: string
  regDateId?: string
  isSuper?: boolean
}
