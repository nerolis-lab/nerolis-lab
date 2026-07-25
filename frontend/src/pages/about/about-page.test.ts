import AboutPage from '@/pages/about/about-page.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('AboutPage', () => {
  it('renders the about us heading', () => {
    const wrapper = mount(AboutPage)
    expect(wrapper.text()).toContain('About Us')
  })
})
