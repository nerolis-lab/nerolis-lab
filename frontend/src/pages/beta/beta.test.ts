import BetaPage from '@/pages/beta/beta.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('BetaPage.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof BetaPage>>

  beforeEach(() => {
    wrapper = mount(BetaPage, {
      global: {
        stubs: ['VImg']
      }
    })
  })

  it('renders the correct content', () => {
    expect(wrapper.text()).toContain("Neroli's Lab open beta")
  })
})
