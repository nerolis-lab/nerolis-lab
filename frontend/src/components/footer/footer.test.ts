import TheFooter from '@/components/footer/footer.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
describe('footer.vue', () => {
  it('includes discord link', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.html()).toContain('https://discord.gg/ndzTXRHWzK')
  })

  it('inlcudes feedback link', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.html()).toContain('https://feedback.nerolislab.com')
  })

  it('includes about link', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toBe('/about')
  })
})
