import {
  AuthorizationServiceConfiguration,
  AuthorizationRequest,
  AuthorizationNotifier,
  StringMap,
  TokenRequest,
  GRANT_TYPE_AUTHORIZATION_CODE,
  TokenRequestHandler,
  BaseTokenRequestHandler,
  TokenResponse,
  GRANT_TYPE_REFRESH_TOKEN
} from '@openid/appauth'
import { NodeCrypto } from '@openid/appauth/built/node_support'
import { NodeBasedHandler } from '@openid/appauth/built/node_support/node_request_handler'
import { AppAuthConfig } from './config'
import { AuthStateEmitter } from './AuthStateEmitter'

const genericRequest = {
  client_id: AppAuthConfig.clientId,
  redirect_uri: AppAuthConfig.redirectUri
}

/**
 * Utilizes AppAuth to implement authentication flow
 */
export class AuthFlow {
  private notifier: AuthorizationNotifier
  private authorizationHandler: NodeBasedHandler
  private tokenHandler: TokenRequestHandler
  private authStateEmitter: AuthStateEmitter
  private configuration?: AuthorizationServiceConfiguration
  private refreshToken?: string
  private accessTokenResponse?: TokenResponse

  constructor() {
    this.notifier = new AuthorizationNotifier()
    this.authorizationHandler = new NodeBasedHandler()
    this.tokenHandler = new BaseTokenRequestHandler(AppAuthConfig.requestor)
    this.authStateEmitter = new AuthStateEmitter()

    this.authorizationHandler.setAuthorizationNotifier(this.notifier)

    this.setAuthorizationListener()
  }

  /**
   *
   */
  async setAuthorizationListener() {
    this.notifier.setAuthorizationListener(async (req, res, err) => {
      if (res) {
        let codeVerifier: string | undefined
        if (req.internal && req.internal.code_verifier) {
          codeVerifier = req.internal.code_verifier
        }

        await this.makeRefreshTokenRequest(res.code, codeVerifier)
        await this.performWithFreshTokens()
        this.authStateEmitter.emit(AuthStateEmitter.ON_TOKEN_RESPONSE)
      }
    })
  }

  /**
   * Fetches the service configuration for the assigned Open ID Connect URL
   */
  async fetchServiceConfiguration(): Promise<void> {
    this.configuration = await AuthorizationServiceConfiguration.fetchFromIssuer(
      AppAuthConfig.openIdConnectUrl,
      AppAuthConfig.requestor
    )
  }

  /**
   * Generates and performs an AuthorizationRequest
   *
   * @param username The username to make an Authorization Request for
   */
  makeAuthorizationRequest(username?: string): void {
    if (!this.configuration) return

    const extras: StringMap = {}

    const request = new AuthorizationRequest(
      {
        ...genericRequest,
        scope: AppAuthConfig.scope,
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        state: undefined,
        extras
      },
      new NodeCrypto()
    )

    this.authorizationHandler.performAuthorizationRequest(
      this.configuration,
      request
    )
  }

  /**
   * Requests a refresh token
   */
  private async makeRefreshTokenRequest(
    code: string,
    codeVerifier?: string
  ): Promise<void> {
    if (!this.configuration) return Promise.resolve()

    const extras: StringMap = {}

    if (codeVerifier) extras.code_verifier = codeVerifier

    const request = new TokenRequest({
      ...genericRequest,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code,
      refresh_token: undefined,
      extras
    })

    const response = await this.tokenHandler.performTokenRequest(
      this.configuration,
      request
    )
    this.refreshToken = response.refreshToken
    this.accessTokenResponse = response
  }

  /**
   * Performs a request using fresh tokens
   */
  async performWithFreshTokens(): Promise<string> {
    if (!this.configuration)
      return Promise.reject('Unknown service configuration')
    if (!this.refreshToken) return Promise.resolve('Missing refreshToken')
    if (this.accessTokenResponse && this.accessTokenResponse.isValid()) {
      return Promise.resolve(this.accessTokenResponse.accessToken)
    }

    const request = new TokenRequest({
      ...genericRequest,
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      code: undefined,
      refresh_token: this.refreshToken,
      extras: undefined
    })

    const response = await this.tokenHandler.performTokenRequest(
      this.configuration,
      request
    )

    this.accessTokenResponse = response
    return response.accessToken
  }

  /**
   * Returns whether a user is logged in or not
   */
  loggedIn(): boolean {
    return !!this.accessTokenResponse && this.accessTokenResponse.isValid()
  }

  /**
   * Removes all cached token state
   */
  logOut() {
    this.accessTokenResponse = undefined
  }
}
