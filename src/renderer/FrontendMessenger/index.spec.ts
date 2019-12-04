import { expect } from 'chai'
import { FrontendMessenger, IFrontendMessengerSignals } from '.'

describe(FrontendMessenger.name, () => {
  let fmSignals: IFrontendMessengerSignals

  beforeEach(() => {
    fmSignals = {
      initiate: 'DO_THIS',
      success: 'DID_THAT'
    }
  })

  describe('.constructor()', () => {
    describe('when an error signal is provided', () => {
      it('assigns the provided error signal', () => {
        const fm = new FrontendMessenger({
          ...fmSignals,
          error: 'ERROR_ATTEMPTING_TO_DO_THIS'
        })
        expect(fm.signals.error).to.eql('ERROR_ATTEMPTING_TO_DO_THIS')
      })
    })

    describe('when no error signal is provided', () => {
      it('assigns a default error signal based on the initiator signal', () => {
        const fm = new FrontendMessenger(fmSignals)
        expect(fm.signals.error).to.eql('FAILED_TO_DO_THIS')
      })
    })
  })

  describe('.initiateAction()', () => {
    xit('sends the initiate signal from ipcRenderer', () => {})
  })
})
