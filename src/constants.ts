import { IOAuthToolsOptions } from './main/auth/oauth/OAuthTools/types'

interface IAppEnv {
  ELECTRON_WEBPACK_APP_AUTH_AZURE_OPEN_ID_CONNECT_URI: string
  ELECTRON_WEBPACK_APP_AUTH_AZURE_TENANT_ID: string
  ELECTRON_WEBPACK_APP_AUTH_AZURE_CLIENT_ID: string
  ELECTRON_WEBPACK_APP_AUTH_AZURE_NONCE: string
}

interface IPackageJSON {
  build: {
    productName: string
  }
}

const registeredKeychainAccountNames = <const>[
  'azure_ad_access_token',
  'azure_ad_refresh_token'
]

export type RegisteredKeychainAccountName = typeof registeredKeychainAccountNames[number]

interface IAzureConfig extends IOAuthToolsOptions {
  redirectBasePath: string
  tenantId: string
}

const env = (process.env as unknown) as IAppEnv
const pkg = require('../package.json') as IPackageJSON

export const azureConfig: IAzureConfig = {
  clientId: env.ELECTRON_WEBPACK_APP_AUTH_AZURE_CLIENT_ID,
  keychainAccessTokenKey: 'azure_ad_access_token',
  keychainRefreshTokenKey: 'azure_ad_refresh_token',
  nonce: env.ELECTRON_WEBPACK_APP_AUTH_AZURE_NONCE,
  redirectBasePath: 'oauth/azure-ad',
  redirectUriPort: 8000,
  tenantId: env.ELECTRON_WEBPACK_APP_AUTH_AZURE_TENANT_ID,
  get providerBaseUri() {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0`
  },
  get redirectPathForAuthentication() {
    return `${this.redirectBasePath}/auth-code`
  }
}

export const constants = {
  appName: pkg.build.productName
}
