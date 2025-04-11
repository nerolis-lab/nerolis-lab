import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VCard, VIcon } from 'vuetify/components'
import SettingsCard from './settings-card.vue'

describe('SettingsCard', () => {
  const defaultProps = {
    title: 'Test Title',
    icon: 'mdi-test'
  }

  it('renders with required props', () => {
    const wrapper = mount(SettingsCard, {
      props: defaultProps
    })

    expect(wrapper.findComponent(VCard).exists()).toBe(true)
    expect(wrapper.findComponent(VIcon).exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Title')
  })

  it('applies correct styling', () => {
    const wrapper = mount(SettingsCard, {
      props: defaultProps
    })

    const card = wrapper.findComponent(VCard)
    expect(card.classes()).toContain('frosted-glass')
    expect(card.props('rounded')).toBe('lg')
  })

  it('displays the correct icon', () => {
    const wrapper = mount(SettingsCard, {
      props: defaultProps
    })

    const icon = wrapper.findComponent(VIcon)
    expect(icon.props('icon')).toBe('mdi-test')
    expect(icon.props('color')).toBe('strength')
  })

  it('renders slot content', () => {
    const wrapper = mount(SettingsCard, {
      props: defaultProps,
      slots: {
        default: '<div class="test-content">Slot Content</div>'
      }
    })

    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Slot Content')
  })
})
