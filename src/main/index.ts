import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { constants } from '../constants'
import { azureOAuth, getUserData, getUserImage } from './auth/oauth/azure'

const env = process.env.ELECTRON_WEBPACK_APP_ENV
const isBuilt = process.env.ELECTRON_WEBPACK_APP_IS_BUILT || false
const isProduction = env === 'production'
const isPreview = env === 'preview'
const isTest = env === 'test'
const isDevelopment = !isProduction && !isPreview && !isTest

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null

const createMainWindow = () => {
  const window = new BrowserWindow({
    title: constants.appName,
    show: false,
    webPreferences: {
      nodeIntegration: true
      // webSecurity: false
    },
    minWidth: 1000,
    minHeight: 850,
    x: 0,
    y: 0
  })

  if (isDevelopment) {
    process.nextTick(() => {
      window.webContents.openDevTools()
    })
    window.webContents.on('devtools-opened', () => {
      window.focus()
      setImmediate(() => {
        window.focus()
      })
    })
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    let indexPath = 'index.html'
    if (!isBuilt) indexPath = `../renderer/${indexPath}`
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, indexPath),
        protocol: 'file',
        slashes: true
      })
    )
  }

  window.once('ready-to-show', () => {
    if (isProduction || isPreview || isTest) window.removeMenu()
    window.show()
  })

  window.on('closed', () => {
    mainWindow = null
  })

  return window
}

// Prevent multiple instances
const gotInstanceLock = app.requestSingleInstanceLock()

if (!gotInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDir) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close')
    mainWindow.close()
  }
})

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
  if (isDevelopment) {
    mainWindow.maximize()
  }
})

ipcMain.on('LOGIN_WITH_AZURE', azureOAuth.logIn)
ipcMain.on('GET_USER_DATA', getUserData)
ipcMain.on('GET_USER_IMAGE', getUserImage)
ipcMain.on('LOGOUT_WITH_AZURE', azureOAuth.logOut)
