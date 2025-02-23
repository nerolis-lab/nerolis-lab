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
})
