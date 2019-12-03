import { killApp } from './app'

afterEach(async () => {
  // @ts-ignore
  await killApp(global.__APP__)
})
