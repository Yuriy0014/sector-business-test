import request from 'supertest'
import { type HttpStatusType, STATUSES_HTTP } from '../../enum/http-statuses'
import { RouterPaths } from '../../helpers/RouterPaths'
import { app } from '../../app-settings'
import { type registrationDTO } from '../../dto/auth.dto'

export const profileTestManager = {
  async registerProfile(
    data: registrationDTO,
    expectedStatusCode: HttpStatusType = STATUSES_HTTP.NO_CONTENT_204
  ) {
    await request(app).post(`${RouterPaths.auth}/register`).send(data).expect(expectedStatusCode)
  },
}
