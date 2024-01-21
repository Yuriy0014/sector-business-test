import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { injectable } from 'inversify'

dotenv.config()

@injectable()
export class JwtService {
  async createJWT(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '2000s' })
  }

  async createJWTRefresh(userId: string, deviceId: string): Promise<string> {
    return jwt.sign({ userId, deviceId }, process.env.JWT_SECRET!, { expiresIn: '4000s' })
  }

  async getInfoFromRFToken(refreshToken: string) {
    try {
      const result: any = jwt.verify(refreshToken, process.env.JWT_SECRET!)
      return {
        deviceId: result.deviceId,
        iat: result.iat * 1000,
        userId: result.userId,
      }
    } catch (e) {
      return null
    }
  }
}

export const jwtService = new JwtService()
