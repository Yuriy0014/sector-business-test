import { type DeviceNameModel, type SessionIpModel } from '../models/session.model'

export class reqSessionDTOType {
  loginIp: SessionIpModel
  refreshTokenIssuedAt: number
  deviceName: DeviceNameModel
  userId: string
  deviceId: string
}
