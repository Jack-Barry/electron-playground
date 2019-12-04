import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe(`App`, () => {
  it('renders the root div', () => {
    const app = mount(App)
    const rootElement = app.find('#root')
    expect(rootElement).to.exist
    expect(rootElement.is('div')).to.eq(true)
  })
})
