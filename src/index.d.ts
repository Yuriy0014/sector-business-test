import {ProfileRoleModel, type ProfileViewModel} from './models/profile.model'
// Расширяем Request чтобы в нем было свойство user

declare global {
    declare namespace Express {
        export interface Request {
            user: ProfileViewModel | ProfileRoleModel | null
            fileValidationError: string
            errorInfo: { message: string, field: string }
            fileName: string
        }
    }
}
