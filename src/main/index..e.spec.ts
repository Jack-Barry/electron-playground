import { ipcMain } from 'electron'

describe('main', () => {
  it('can do things with ipcMain', () => {
    ipcMain.removeAllListeners('blah')
  })
})
