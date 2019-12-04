import { ipcRenderer } from 'electron'

describe('renderer', () => {
  it('can use ipcRenderer', done => {
    ipcRenderer.removeAllListeners('blah')
  })
})
