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
        const error = 'ERROR_ATTEMPTING_TO_DO_THIS'
        const fm = new FrontendMessenger({ ...fmSignals, error })
        expect(fm.signals.error).to.eql(error)
      })
    })

    describe('when no error signal is provided', () => {
      it('assigns a default error signal based on the initiator signal', () => {
        const fm = new FrontendMessenger(fmSignals)
        expect(fm.signals.error).to.eql('FAILED_TO_DO_THIS')
      })
    })
  })
})
