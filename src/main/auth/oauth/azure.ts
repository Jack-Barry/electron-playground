import axios from 'axios'
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
  path: string
): Promise<void> => {
  const accessToken = await azureOAuth.retrieveAccessToken()
  const response = await axios.get(`${graphUrlBase}/${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  // @ts-ignore
  event.sender.send(signal, response.data)
}

export const getUserData = async (event: Event): Promise<void> => {
  await graphRequest(event, 'USER_DATA_RETRIEVED', 'me')
}

export const getUserImage = async (event: Event): Promise<void> => {
  const accessToken = await azureOAuth.retrieveAccessToken()
  const response = await axios.get(`${graphUrlBase}/me/photos/120x120/$value`, {
    responseType: 'arraybuffer',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  const b64 = Buffer.from(response.data, 'binary').toString('base64')
  const src = `data:image/jpeg;base64, ${b64}`
  // @ts-ignore
  event.sender.send('USER_IMAGE_RETRIEVED', src)
}
