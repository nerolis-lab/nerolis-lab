import CreditsPage from '@/pages/credits/credits-page.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('CreditsPage', () => {
  it('renders the credits heading', () => {
    const wrapper = mount(CreditsPage)
    expect(wrapper.text()).toContain('Credits')
  })

  it('renders a heading for every section', () => {
    const wrapper = mount(CreditsPage)
    for (const section of wrapper.vm.creditSections) {
      expect(wrapper.text()).toContain(section.category)
    }
  })

  it('renders every entry within each section', () => {
    const wrapper = mount(CreditsPage)
    const totalEntries = wrapper.vm.creditSections.reduce((count, section) => count + section.entries.length, 0)
    expect(wrapper.findAll('.entry')).toHaveLength(totalEntries)
  })
})
