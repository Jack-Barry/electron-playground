import * as assert from 'assert'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe(`App`, () => {
  it('does things', () => {
    const app = mount(App)
    assert.equal(app.exists(), true)
  })
})
