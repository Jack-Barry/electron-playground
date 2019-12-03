import { Application } from 'spectron'
import * as path from 'path'
const electronPath = require('electron')
const projectRoot = path.join(__dirname, '../../..')

export const startApp = async (): Promise<Application> => {
  const app = new Application({
    // @ts-ignore
    path: electronPath,

    args: [path.join(projectRoot, 'dist/main/main.js'), projectRoot]
  })
  return app.start()
}

export const killApp = async (
  app?: Application
): Promise<Application | void> => {
  if (app && app.isRunning()) {
    return await app.stop()
  }
}
