export class SessionUpdateFilterModel {
  'RFTokenIAT': Date
  'deviceId': string
  'userId': string
}

export type SessionIpModel = string
export type DeviceNameModel = string

export interface SessionUpdateContentModel {
  ip: string
  lastActiveDate: Date
  RFTokenIAT: Date
  deviceName: string
}
