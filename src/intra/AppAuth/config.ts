import { NodeRequestor } from '@openid/appauth/built/node_support/node_requestor'

interface IAppEnv {
  APP_AUTH_AZURE_OPEN_ID_CONNECT_URL: string
  APP_AUTH_AZURE_CLIENT_ID: string
  APP_AUTH_AZURE_REDIRECT_URL: string
  APP_AUTH_AZURE_SCOPE: string
}

const env = (process.env as unknown) as IAppEnv

export const AppAuthConfig = {
  openIdConnectUrl: env.APP_AUTH_AZURE_OPEN_ID_CONNECT_URL,
  requestor: new NodeRequestor(),
  clientId: env.APP_AUTH_AZURE_CLIENT_ID,
  redirectUri: env.APP_AUTH_AZURE_REDIRECT_URL,
  scope: env.APP_AUTH_AZURE_SCOPE
}
