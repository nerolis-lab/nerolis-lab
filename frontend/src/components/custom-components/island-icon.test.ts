import IslandIcon from '@/components/custom-components/island-icon.vue'
import { mount } from '@vue/test-utils'
import { berry, CYAN, GREENGRASS_EXPERT } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

describe('IslandIcon', () => {
  it('labels the anchor with just the island name by default', () => {
    const wrapper = mount(IslandIcon, { props: { island: { ...CYAN, areaBonus: 0 } } })
    expect(wrapper.find('.badge-anchor').attributes('aria-label')).toBe(CYAN.name)
    expect(wrapper.find('.custom-chip').exists()).toBe(false)
    expect(wrapper.find('.expert-chip').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows a Custom badge and a descriptive label when berries differ from default', () => {
    const wrapper = mount(IslandIcon, { props: { island: { ...CYAN, areaBonus: 0, berries: [berry.BELUE] } } })
    expect(wrapper.find('.custom-chip').exists()).toBe(true)
    expect(wrapper.find('.badge-anchor').attributes('aria-label')).toBe(`${CYAN.name} with custom berries`)
    wrapper.unmount()
  })

  it('shows an EX badge for expert islands, never a Custom badge', () => {
    const wrapper = mount(IslandIcon, { props: { island: { ...GREENGRASS_EXPERT, areaBonus: 0, berries: [] } } })
    expect(wrapper.find('.expert-chip').exists()).toBe(true)
    expect(wrapper.find('.custom-chip').exists()).toBe(false)
    expect(wrapper.find('.badge-anchor').attributes('aria-label')).toBe(GREENGRASS_EXPERT.name)
    wrapper.unmount()
  })

  it('omits the aria-label when showAriaLabel is false', () => {
    const wrapper = mount(IslandIcon, {
      props: { island: { ...CYAN, areaBonus: 0, berries: [berry.BELUE] }, showAriaLabel: false }
    })
    expect(wrapper.find('.badge-anchor').attributes('aria-label')).toBeUndefined()
    wrapper.unmount()
  })

  it('defaults to a 48px icon and accepts a custom size', () => {
    const defaultWrapper = mount(IslandIcon, { props: { island: { ...CYAN, areaBonus: 0 } } })
    expect(defaultWrapper.findComponent({ name: 'VImg' }).props('width')).toBe(48)
    defaultWrapper.unmount()

    const sizedWrapper = mount(IslandIcon, { props: { island: { ...CYAN, areaBonus: 0 }, size: 36 } })
    expect(sizedWrapper.findComponent({ name: 'VImg' }).props('width')).toBe(36)
    sizedWrapper.unmount()
  })
})
