import BetaPage from '@/pages/beta/beta.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('BetaPage.vue', () => {
  it('renders the correct content', () => {
    const wrapper = mount(BetaPage)
    expect(wrapper.text()).toContain("Neroli's Lab open beta")
  })
})
