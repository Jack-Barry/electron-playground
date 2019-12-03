import { Application } from 'spectron'
import { startApp } from './app'

beforeEach(async () => {
  const app: Application = await startApp()
  // @ts-ignore
  global.__APP__ = app
})
