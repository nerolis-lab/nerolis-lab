import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }

    vi.restoreAllMocks()
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

  it('generates automatic minimum value rule when min prop is provided', () => {
    const minWrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        min: 5
      }
    })

    const combinedRules = minWrapper.vm.combinedRules
    expect(combinedRules.length).toBe(1)

    expect(combinedRules[0](6)).toBe(true)
    expect(typeof combinedRules[0](4)).toBe('string')
    expect(combinedRules[0](4)).toContain('5 or more')
  })

  it('generates automatic maximum value rule when max prop is provided', () => {
    const maxWrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        max: 15
      }
    })

    const combinedRules = maxWrapper.vm.combinedRules
    expect(combinedRules.length).toBe(1)

    expect(combinedRules[0](14)).toBe(true)
    expect(typeof combinedRules[0](16)).toBe('string')
    expect(combinedRules[0](16)).toContain('15 or less')
  })

  it('combines automatic min/max rules with custom rules', () => {
    const customRule = (v: number) => v % 2 === 0 || 'Must be even'
    const combinedWrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        min: 5,
        max: 15,
        rules: [customRule]
      }
    })

    const combinedRules = combinedWrapper.vm.combinedRules
    expect(combinedRules.length).toBe(3)

    expect(combinedRules[0](6)).toBe(true) // min rule
    expect(combinedRules[1](14)).toBe(true) // max rule
    expect(combinedRules[2](8)).toBe(true) // custom rule
    expect(typeof combinedRules[2](7)).toBe('string') // custom rule failure
  })

  it('validates values according to the step prop', () => {
    const stepWrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        step: 2
      }
    })

    const stepRules = stepWrapper.vm.combinedRules
    expect(stepRules.length).toBe(1)

    expect(stepRules[0](10)).toBe(true) // 10 is divisible by 2
    expect(stepRules[0](12)).toBe(true) // 12 is divisible by 2
    expect(typeof stepRules[0](11)).toBe('string') // 11 is not divisible by 2
    expect(stepRules[0](11)).toContain('increments of 2')
  })

  it('validates step values relative to min when min is provided', () => {
    const stepMinWrapper = mount(NumberInput, {
      props: {
        modelValue: 15,
        min: 5,
        step: 5
      }
    })

    const stepRules = stepMinWrapper.vm.combinedRules

    // Valid values should be 5, 10, 15, 20, etc.
    expect(stepRules[1](5)).toBe(true) // Base value (min)
    expect(stepRules[1](10)).toBe(true) // min + step
    expect(stepRules[1](15)).toBe(true) // min + 2*step
    expect(typeof stepRules[1](7)).toBe('string') // Not a valid step
    expect(stepRules[1](7)).toContain('increments of 5 from 5')
  })

  it('does not emit update events for invalid values', async () => {
    const validationWrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        min: 5,
        max: 15
      }
    })

    const input = validationWrapper.find('input')

    await input.setValue('3') // Below min
    await input.trigger('blur')

    expect(validationWrapper.emitted('update-number')).toBeFalsy()
    expect(validationWrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('reverts to previous value after a delay when invalid value entered', async () => {
    const validationWrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        min: 5,
        max: 15
      }
    })

    const input = validationWrapper.find('input')

    await input.setValue('20') // Above max
    await input.trigger('blur')

    // Check that internalValue has the invalid value initially
    expect(validationWrapper.vm.internalValue).toBe(20)

    // Fast-forward time to trigger the revert
    vi.advanceTimersByTime(500)

    // Now internalValue should be back to the original valid value
    expect(validationWrapper.vm.internalValue).toBe(10)
  })

  it('prevents multiple revert operations from stacking', async () => {
    const validationWrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        min: 5,
        max: 15
      }
    })

    const input = validationWrapper.find('input')

    await input.setValue('20') // Above max
    await input.trigger('blur')

    // isReverting should be true
    expect(validationWrapper.vm.isReverting).toBe(true)

    // Try setting another invalid value before revert completes
    await input.setValue('3') // Below min
    await input.trigger('blur')

    // Fast-forward time
    vi.advanceTimersByTime(500)

    // internalValue should be back to the original modelValue
    expect(validationWrapper.vm.internalValue).toBe(10)
    expect(validationWrapper.vm.isReverting).toBe(false)
  })
})
