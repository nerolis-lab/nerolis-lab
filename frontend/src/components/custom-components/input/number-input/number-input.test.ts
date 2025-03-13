import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import NumberInput from './number-input.vue'

describe('NumberInput', () => {
  let wrapper: VueWrapper<InstanceType<typeof NumberInput>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(NumberInput, {
      props: {
        modelValue: 42,
        label: 'Test Label'
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('emits update-number when value changes', async () => {
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    await input.setValue('123')
    await input.trigger('blur')

    expect(wrapper.emitted('update-number')).toBeTruthy()
    expect(wrapper.emitted('update-number')![0]).toEqual([123])
  })

  it('applies validation rules', async () => {
    const rules = [(v: number) => v > 0 || 'Must be positive']
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: -1,
        label: 'Test Label',
        rules
      }
    })

    expect(wrapper.props('rules')).toEqual(rules)
  })

  it('uses the default appendIcon when not specified', () => {
    expect(wrapper.props('appendIcon')).toBe('mdi-pencil')
  })

  it('applies custom appendIcon when provided', () => {
    const customWrapper = mount(NumberInput, {
      props: {
        modelValue: 42,
        label: 'Test Label',
        appendIcon: 'mdi-pot'
      }
    })

    expect(customWrapper.props('appendIcon')).toBe('mdi-pot')
    expect(customWrapper.vm.appendIcon).toBe('mdi-pot')
  })

  it('does not show appendIcon when showStatus is false', () => {
    const customWrapper = mount(NumberInput, {
      props: {
        modelValue: 42,
        label: 'Test Label',
        appendIcon: 'mdi-pot',
        showStatus: false
      }
    })

    expect(customWrapper.props('showStatus')).toBe(false)

    const appendInnerSlot = customWrapper.find('.v-input__append-inner')
    expect(appendInnerSlot.exists()).toBe(false)
  })

  it('has no suffix by default', () => {
    expect(wrapper.props('suffix')).toBeNull()
  })

  it('applies suffix when provided', () => {
    const customWrapper = mount(NumberInput, {
      props: {
        modelValue: 42,
        label: 'Test Label',
        suffix: 'ml'
      }
    })

    expect(customWrapper.props('suffix')).toBe('ml')
    expect(customWrapper.vm.suffix).toBe('ml')

    const textField = customWrapper.findComponent({ name: 'VTextField' })
    expect(textField.props('suffix')).toBe('ml')
  })
})
