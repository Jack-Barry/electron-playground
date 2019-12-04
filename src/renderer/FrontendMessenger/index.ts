import { ipcRenderer } from 'electron'

/**
 * Signals provided to initiate an instance of a `FrontendMessenger`
 */
export interface IFrontendMessengerSignals {
  /**
   * The signal that will be sent to the backend to initiate an action
   */
  initiate: string
  /**
   * The signal that will be received from the backend if an action succeeds
   */
  success: string
  /**
   * An optional signal that will be received from the backend if an action
   *   fails
   */
  error?: string
}

/**
 * Signals provided by an instance of a `FrontendMessenger`
 */
export interface IMessengerSignals extends IFrontendMessengerSignals {
  /**
   * The signal that will be received from the backend if an action fails
   */
  error: string
}

/**
 * Instances of `FrontendMessenger` can be consumed in the `renderer` process.
 *
 * Provides signals that can be sent to and received from the `main` process in
 *   order to provide a link between the UI and the backend.
 */
export class FrontendMessenger {
  public signals: IMessengerSignals

  constructor(
    /** Signals to be associated with the `FrontendMessenger` */
    signals: IFrontendMessengerSignals
  ) {
    this.signals = {
      ...signals,
      error: signals.error || `FAILED_TO_${signals.initiate}`
    }
  }

  /**
   * Initiates the request for processing cycle
   *
   * @param args Arguments to pass along with the initiator signal string to
   *   ipcMain
   */
  send(...args: any[]): void {
    ipcRenderer.send(this.signals.initiate, args)
  }
}
