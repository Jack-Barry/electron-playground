import { AxiosResponse } from 'axios'
import { urlencoded } from 'body-parser'
import { Event } from 'electron'
import * as express from 'express'
import * as path from 'path'
import {
  IOAuthToolsOptions,
  ITokens,
  TokenRequestKeyType,
  IKeychainTokens
} from '../types'

export class OAuthRedirectServer {
  constructor(
    private options: IOAuthToolsOptions,
    private getToken: (
      keyType: TokenRequestKeyType,
      key: string
    ) => Promise<AxiosResponse>
  ) {}

  /**
   * Spins up an Express server to be used for OAuth redirects to manage handing
   *  off of tokens to app
   */
  public handleAuthenticationRequest(
    event: Event,
    saveToKeychain: (tokens: IKeychainTokens) => Promise<void>
  ) {
    const app = express()
    app.use(urlencoded({ extended: true }))

    app.post(
      `/${this.options.redirectPathForAuthentication}`,
      async (req, res) => {
        const code = req.body.code
        let tokens: ITokens = {}
        if (code) {
          const tokenResponse = await this.getToken('authorization_code', code)
          const data = tokenResponse.data
          tokens = {
            access: data.access_token,
            refresh: data.refresh_token
          }
        }
        await saveToKeychain(tokens)
        const successScreen = path.resolve(__dirname, 'success.html')
        res.sendFile(successScreen, () => {
          app.emit('LOGIN_COMPLETE')
        })
      }
    )

    const server = app.listen(8000, () => {
      console.log('Authentication server is listening...')
    })

    app.once('LOGIN_COMPLETE', () => {
      console.log('Closing authentication server now...')
      server.close()
      // @ts-ignore
      event.sender.send('LOGIN_COMPLETE')
    })
  }
}
