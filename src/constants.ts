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

export type RegisteredKeychainAccountName =
  | 'azure_access_token'
  | 'azure_refresh_token'

const env = (process.env as unknown) as IAppEnv
const pkg = require('../package.json') as IPackageJSON
const azureOauthRedirectUriPrefix: string = 'oauth/azure-ad'

export const constants = {
  appName: pkg.build.productName,
  keys: {
    azureAdAccessToken: 'azure_ad_access_token',
    azureAdRefreshToken: 'azure_ad_refresh_token'
  },
  auth: {
    azure: {
      authHost: env.ELECTRON_WEBPACK_APP_AUTH_AZURE_OPEN_ID_CONNECT_URI,
      tenantId: env.ELECTRON_WEBPACK_APP_AUTH_AZURE_TENANT_ID,
      clientId: env.ELECTRON_WEBPACK_APP_AUTH_AZURE_CLIENT_ID,
      nonce: env.ELECTRON_WEBPACK_APP_AUTH_AZURE_NONCE,
      redirectUriBase: 'http://127.0.0.1:8000',
      authenticationRedirectUri: `${azureOauthRedirectUriPrefix}/auth-code`,
      logoutRedirectUri: `${azureOauthRedirectUriPrefix}/logout`
    }
  }
}
