import { shell, ipcMain } from 'electron'
import * as express from 'express'
import * as querystring from 'querystring'
import axios, { AxiosResponse } from 'axios'
import { constants } from '../constants'
import * as crypto from 'crypto'
import {
  // getStoredPassword,
  setStoredPassword,
  removeStoredPassword,
  getStoredPassword
} from './keytarHelpers'
import { urlencoded } from 'body-parser'

const azureConfig = constants.auth.azure

const azureUrlPrefix = `https://${azureConfig.authHost}/${azureConfig.tenantId}/oauth2/v2.0`
const authenticationRedirectUri = `${azureConfig.redirectUriBase}/${azureConfig.authenticationRedirectUri}`
/**
 * Data to include when making an OAuth token request
 */
interface ITokenRequestData extends querystring.ParsedUrlQueryInput {
  grant_type: string
  client_id: string
  redirect_uri: string
  code_verifier: string
  code?: string
}

/**
 * Relevant data returned in the token request response
 */
interface ITokens {
  id?: string
  access?: string
  refresh?: string
  expiry?: number
}

const base64URLEncode = (str: Buffer): string =>
  str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

const sha256 = (buffer: string) =>
  crypto
    .createHash('sha256')
    .update(buffer)
    .digest()

const codeVerifier = base64URLEncode(crypto.randomBytes(32))
const codeChallenge = base64URLEncode(sha256(codeVerifier))

const buildAuthenticationUrl = (): string => {
  let authUrl: string = `${azureUrlPrefix}/authorize?`
  authUrl += `client_id=${azureConfig.clientId}`
  authUrl += `&response_type=code+id_token`
  authUrl += `&redirect_uri=${authenticationRedirectUri}`
  authUrl += `&response_mode=form_post`
  authUrl += `&scope=openid offline_access`
  authUrl += `&prompt=consent`
  authUrl += `&code_challenge_method=S256`
  authUrl += `&code_challenge=${codeChallenge}`
  authUrl += `&nonce=${azureConfig.nonce}`
  return authUrl
}

const tokenUrl: string = `${azureUrlPrefix}/token`

export const authenticateMe = () => {
  runAuthenticationServer()
  shell.openExternal(buildAuthenticationUrl())
}

export const deAuthenticateMe = async () => {
  await removeStoredPassword('azure_access_token')
  await removeStoredPassword('azure_refresh_token')
  ipcMain.emit('LOGOUT_COMPLETE')
  const currentAccessToken = await getStoredPassword('azure_access_token')
  const currentRefreshToken = await getStoredPassword('azure_refresh_token')
  console.log(
    `Current Tokens: ${JSON.stringify({
      currentAccessToken,
      currentRefreshToken
    })}`
  )
}

/**
 * Builds the form data to be sent in an OAuth token request
 *
 * @param opts Provide an authorization code _or_ a refresh token
 */
const buildTokenFormData = (opts: { code?: string; refreshToken?: string }) => {
  let data: ITokenRequestData = {
    grant_type: opts.refreshToken ? 'refresh_token' : 'authorization_code',
    client_id: azureConfig.clientId,
    redirect_uri: authenticationRedirectUri,
    code_verifier: codeVerifier
  }

  if (opts.code) data.code = opts.code

  return querystring.stringify(data)
}

/**
 * Posts a token request to the token request endpoint
 *
 * @param formData A string representing the token request specifics
 */
const getToken = async (formData: string): Promise<AxiosResponse> => {
  return axios.post(tokenUrl, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': formData.length
    }
  })
}

/**
 * Spins up an Express server to be used for OAuth redirects to manage handing
 *  off of tokens to app
 */
const runAuthenticationServer = async () => {
  const app = express()
  app.use(urlencoded({ extended: true }))
  // Can handle already logged in users here
  // let savedAccessToken = await getStoredPassword('azure_access_token')
  // let savedRefreshToken = await getStoredPassword('azure_refresh_token')

  app.post(`/${azureConfig.authenticationRedirectUri}`, async (req, res) => {
    const code = req.body.code
    let tokens: ITokens = {}
    if (code) {
      const formData = buildTokenFormData({ code })
      const tokenResponse = await getToken(formData)
      const data = tokenResponse.data
      tokens = {
        id: data.id_token,
        access: data.access_token,
        refresh: data.refresh_token,
        expiry: data.expires_in
      }
    }
    if (tokens.access)
      await setStoredPassword('azure_access_token', tokens.access)
    if (tokens.refresh)
      await setStoredPassword('azure_refresh_token', tokens.refresh)
    /**
     * Tokens are now stored locally. Here's where we can:
     * - Provide the user with a friendly message after logging in
     */
    res.write(
      `You may now close the browser window. Here are your tokens: ${JSON.stringify(
        tokens
      )}`
    )
    res.end(() => {
      app.emit('AUTH_COMPLETE')
    })
  })

  const server = app.listen(8000, () => {
    console.log('Authentication server is listening...')
  })

  app.once('AUTH_COMPLETE', () => {
    console.log('Closing authentication server now...')
    server.close()
  })
}
