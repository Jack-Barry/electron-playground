import axios, { AxiosRequestConfig } from 'axios'
import { azureConfig } from '../../../constants'
import { OAuthTools } from './OAuthTools'
import { Event } from 'electron'

const graphUrlBase = 'https://graph.microsoft.com/v1.0'

/**
 * Instance of `OAuthTools` configured for usage with Azure AD
 */
export const azureOAuth = new OAuthTools({
  clientId: azureConfig.clientId,
  keychainAccessTokenKey: azureConfig.keychainAccessTokenKey,
  keychainRefreshTokenKey: azureConfig.keychainRefreshTokenKey,
  nonce: azureConfig.nonce,
  providerBaseUri: azureConfig.providerBaseUri,
  redirectUriPort: azureConfig.redirectUriPort,
  redirectPathForAuthentication: azureConfig.redirectPathForAuthentication
})

const graphRequest = async (
  event: Event,
  signal: string,
  path: string,
  dataTransformer: (data: any) => any = data => data,
  responseType?: 'arraybuffer'
): Promise<void> => {
  const accessToken = await azureOAuth.retrieveAccessToken()
  let requestConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
  requestConfig.responseType = responseType

  const response = await axios.get(`${graphUrlBase}/${path}`, requestConfig)
  // @ts-ignore
  event.sender.send(signal, dataTransformer(response.data))
}

const makeImgSrcFromBinary = (binary: string) => {
  const b64 = Buffer.from(binary, 'binary').toString('base64')
  return `data:image/jpeg;base64, ${b64}`
}

export const getUserData = async (event: Event): Promise<void> => {
  await graphRequest(event, 'USER_DATA_RETRIEVED', 'me')
}

export const getUserImage = async (event: Event): Promise<void> => {
  await graphRequest(
    event,
    'USER_IMAGE_RETRIEVED',
    'me/photos/120x120/$value',
    makeImgSrcFromBinary,
    'arraybuffer'
  )
}
