import { Application } from 'spectron'
import { expect } from 'chai'
const pkg = require('../../package.json')

describe('Application launch', () => {
  let app: Application

  beforeEach(() => {
    // @ts-ignore
    app = global.__APP__ as Application
  })

  it('renders the initial window', async () => {
    const windowCount = await app.client.getWindowCount()
    expect(windowCount).to.eq(1)
  })

  it('renders the expected title', async () => {
    const expectedTitle = pkg.build.productName
    const title = await app.browserWindow.getTitle()
    expect(title).to.eql(expectedTitle)
  })

  it('renders the welcome message', async () => {
    // @ts-ignore
    const text = await app.client.getText('#root')
    expect(text).to.include('Welcome')
  })
})
