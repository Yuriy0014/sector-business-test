export class ProfileViewModel {
  id: string
  firstName: string
  lastName: string
  email: string
  photoUrl: string
}

export enum maleEnum {
  man = 'Мужской',
  women = 'Женский',
}

export class ProfileCreateModel {
  firstName: string
  lastName: string
  male: maleEnum
  email: string
  passwordHash: string
  photoName: string
}

export class ProfileWithPaginationModel {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: ProfileViewModel[]
}

export class loginModel {
  email: string
  password: string
}

export class ProfileRoleModel {
  id: string
  isSuper: boolean
}

// Type guard
export function isProfileRoleModel(
  user: ProfileViewModel | ProfileRoleModel
): user is ProfileRoleModel {
  return (user as ProfileRoleModel).isSuper !== undefined
}
