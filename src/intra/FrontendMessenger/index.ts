export interface IFrontendMessengerSignals {
  initiate: string
  success: string
  error?: string
}

export interface IMessengerSignals extends IFrontendMessengerSignals {
  error: string
}

export class FrontendMessenger {
  public signals: IMessengerSignals

  constructor(signals: IFrontendMessengerSignals) {
    this.signals = {
      ...signals,
      error: signals.error || `FAILED_TO_${signals.initiate}`
    }
  }
}
