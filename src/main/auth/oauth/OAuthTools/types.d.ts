import querystring from 'querystring'
import { RegisteredKeychainAccountName } from '../../../../constants'

/** Allowed token request types for OAuth2 */
type TokenRequestKeyType = 'authorization_code' | 'refresh_token'

/**
 * Data to include when making an OAuth token request
 */
export interface ITokenRequestData extends querystring.ParsedUrlQueryInput {
  /** The client ID of your registered application */
  client_id: string
  /** An access code to send with the request */
  code?: string
  /** A refresh token to send with the request */
  refresh_token?: string
  /** A value to send as the code verifier for PKCE */
  code_verifier: string
  /** The type of grant being used for the request */
  grant_type: TokenRequestKeyType
  /** Where to redirect the response to upon success */
  redirect_uri: string
}

/**
 * Tokens stored locally in keychain
 */
export interface IKeychainTokens {
  /** Access token */
  access?: string | null
  /** Refresh token */
  refresh?: string | null
}

/**
 * Relevant data returned in the token request response
 */
export interface ITokens extends IKeychainTokens {
  /** Expiration of access token in seconds */
  expiry?: number | null
  /** ID token for Open ID connect flow */
  id?: string
}

/**
 * Options for initializing an instance of OAuthTools
 */
export interface IOAuthToolsOptions {
  /** The client ID of your registered application */
  clientId: string
  /**
   * The key to identify where you would like to store access tokens in your
   * keychain
   */
  keychainAccessTokenKey: RegisteredKeychainAccountName
  /**
   * The key to identify where you would like to store refresh tokens in your
   * keychain
   */
  keychainRefreshTokenKey: RegisteredKeychainAccountName
  /**
   * A `string` to be sent with initial Open ID authentication requests
   */
  nonce: string
  /**
   * The base URI of your authentication/authorization provider. For example:
   *   `'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0'`
   */
  providerBaseUri: string
  /**
   * The path where you would like authentication redirects to be sent. For
   *   example: `'oauth/azure-ad/auth-code'`
   */
  redirectPathForAuthentication: string
  /**
   * The port you would like the local authentication redirect server to run on
   */
  redirectUriPort: number
}

interface IJwt {
  exp: number
}
