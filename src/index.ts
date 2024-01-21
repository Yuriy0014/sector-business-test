import dotenv from 'dotenv'
import { runDb } from './db/app-data-source'
import { app } from './app-settings'

dotenv.config()

const port = process.env.PORT ?? 7050

const startApp = async () => {
  await runDb()
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

void startApp()
