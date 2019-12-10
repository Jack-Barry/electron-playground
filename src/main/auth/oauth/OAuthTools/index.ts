import axios, { AxiosResponse } from 'axios'
import * as crypto from 'crypto'
import { shell, Event } from 'electron'
import * as querystring from 'querystring'
import {
  removeStoredPassword,
  getStoredPassword,
  setStoredPassword
} from '../../keychain/keytarHelpers'
import {
  IOAuthToolsOptions,
  ITokenRequestData,
  TokenRequestKeyType,
  IKeychainTokens,
  IJwt
} from './types'
import { OAuthRedirectServer } from './OAuthRedirectServer'

/**
 * A set of tools to authenticate using OAuth
 */
export class OAuthTools {
  private codeChallenge: string
  private codeVerifier: string
  private openIdAuthUrl: string = ''
  private redirectUriForAuthentication: string = ''
  private tokenRequestUrl: string = ''
  private oauthRedirectServer: OAuthRedirectServer

  /**
   * Provides authentication and logout functionality for the provider
   *   specified in `options`
   *
   * @param options Options to use when constructing the instance of
   *   `OAuthTools`
   */
  constructor(private options: IOAuthToolsOptions) {
    this.codeVerifier = OAuthTools.base64URLEncode(crypto.randomBytes(32))
    this.codeChallenge = OAuthTools.base64URLEncode(
      OAuthTools.sha256(this.codeVerifier)
    )
    this.buildRedirectUriForAuthentication()
    this.buildOpenIdAuthenticationUrl()
    this.buildTokenRequestUrl()
    this.oauthRedirectServer = new OAuthRedirectServer(options, this.getToken)
  }

  private static base64URLEncode(str: Buffer): string {
    return str
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  private static sha256(buffer: string): Buffer {
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest()
  }

  /**
   * Builds the URL that Open ID authentication requests are sent to
   */
  private buildOpenIdAuthenticationUrl(): void {
    this.openIdAuthUrl = `${this.options.providerBaseUri}/authorize?`
    this.openIdAuthUrl += `client_id=${this.options.clientId}`
    this.openIdAuthUrl += `&response_type=code+id_token`
    this.openIdAuthUrl += `&redirect_uri=${this.redirectUriForAuthentication}`
    this.openIdAuthUrl += `&response_mode=form_post`
    this.openIdAuthUrl += `&scope=openid offline_access`
    this.openIdAuthUrl += `&prompt=consent`
    this.openIdAuthUrl += `&code_challenge_method=S256`
    this.openIdAuthUrl += `&code_challenge=${this.codeChallenge}`
    this.openIdAuthUrl += `&nonce=${this.options.nonce}`
  }

  /**
   * Builds the URL that token requests are sent to
   */
  private buildTokenRequestUrl(): void {
    this.tokenRequestUrl = `${this.options.providerBaseUri}/token`
  }

  /**
   * Builds the URL that Open ID authentication redirects are sent to
   */
  private buildRedirectUriForAuthentication(): void {
    this.redirectUriForAuthentication = `http://127.0.0.1:${this.options.redirectUriPort}/${this.options.redirectPathForAuthentication}`
  }

  /**
   * Builds the form data to be sent in an OAuth token request
   *
   * @param keyType A valid `TokenRequestKeyType`
   * @param key The value to be used as the specified `keyType`
   */
  private tokenFormData(keyType: TokenRequestKeyType, key: string) {
    let data: ITokenRequestData = {
      grant_type: keyType,
      client_id: this.options.clientId,
      redirect_uri: this.redirectUriForAuthentication,
      code_verifier: this.codeVerifier
    }

    if (keyType === 'authorization_code') data.code = key
    if (keyType === 'refresh_token') data.refresh_token = key

    return querystring.stringify(data)
  }

  /**
   * Posts a token request to the token request endpoint
   *
   * @param keyType A valid `TokenRequestKeyType`
   * @param key The value to be used as the specified `keyType`
   */
  private getToken = async (
    keyType: TokenRequestKeyType,
    key: string
  ): Promise<AxiosResponse> => {
    const formData = this.tokenFormData(keyType, key)
    return axios.post(this.tokenRequestUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': formData.length
      }
    })
  }

  /**
   * Parses a JWT to provide the payload contents
   *
   * @param token A JWT to parse
   */
  private parseJwt(token: string): IJwt {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const buff = Buffer.from(base64, 'base64')
    const jsonPayload = buff.toString('ascii')
    return JSON.parse(jsonPayload)
  }

  /**
   * Retrieves the expiration time in milliseconds for a JWT
   *
   * @param token A JWT to retrieve the expiry for
   */
  private getTokenExpiry(token: string): number {
    const expiry = this.parseJwt(token).exp
    return expiry * 1000
  }

  /**
   * Gets a new token using the refresh token, then saves the new access and
   *   refresh tokens to user's keychain
   */
  private refreshAccessToken = async (refreshToken: string): Promise<void> => {
    const response = await this.getToken('refresh_token', refreshToken)
    const access = response.data.access_token
    const refresh = response.data.refresh_token
    await this.setLocalTokens({ access, refresh })
  }

  /**
   * Saves access and refresh tokens to user's keychain
   */
  private setLocalTokens = async (tokens: IKeychainTokens): Promise<void> => {
    await setStoredPassword(
      this.options.keychainAccessTokenKey,
      tokens.access || ''
    )
    await setStoredPassword(
      this.options.keychainRefreshTokenKey,
      tokens.refresh || ''
    )
  }

  /**
   * Removes access and refresh tokens from a user's keychain
   */
  private removeLocalTokens = async (): Promise<void> => {
    await removeStoredPassword(this.options.keychainAccessTokenKey)
    await removeStoredPassword(this.options.keychainRefreshTokenKey)
  }

  /**
   * Checks if the access token is expired and requests a new token if a
   *   refresh is needed
   */
  public retrieveAccessToken = async (): Promise<string | null> => {
    let accessToken = await getStoredPassword(
      this.options.keychainAccessTokenKey
    )
    const tokenExpired =
      accessToken && this.getTokenExpiry(accessToken) < Date.now()
    if (tokenExpired || !accessToken) {
      const refreshToken = await getStoredPassword(
        this.options.keychainRefreshTokenKey
      )
      if (refreshToken) await this.refreshAccessToken(refreshToken || '')
    }
    return accessToken
  }

  /**
   * Spins up a server to handle authentication redirects and initiates the
   *   authentication flow in user's default browser
   */
  public logIn = async (event: Event) => {
    const accessToken = await this.retrieveAccessToken()
    if (!accessToken) {
      this.oauthRedirectServer.handleAuthenticationRequest(
        event,
        this.setLocalTokens
      )
      shell.openExternal(this.openIdAuthUrl)
    } else {
      // @ts-ignore
      event.sender.send('LOGIN_COMPLETE')
    }
  }

  /**
   * Removes access and refresh tokens stored in the user's keychain and emits
   *   a logout signal to the renderer process
   */
  public logOut = async (event: Event) => {
    await this.removeLocalTokens()
    // @ts-ignore
    event.sender.send('LOGOUT_COMPLETE')
  }
}
