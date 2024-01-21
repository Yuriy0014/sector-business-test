import { type STATUSES_HTTP } from '../enum/http-statuses'

export interface Result<T> {
  resultCode: STATUSES_HTTP
  data: T | null
  errorMessage?: string
}

export interface ErrorType {
  Error: string
}
