import { darkTheme } from '@/assets/theme'
import { getDiffDisplayInfo } from '@/services/utils/ui-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

describe('getDiffDisplayInfo', () => {
  // Helper function to test getDiffDisplayInfo within a Vue component context
  const testWithComponent = (diff: number | undefined) => {
    const TestComponent = defineComponent({
      setup() {
        const result = ref(getDiffDisplayInfo(diff))
        return { result }
      },
      template: '<div>{{ result }}</div>'
    })

    const wrapper = mount(TestComponent)
    return wrapper.vm.result
  }

  it('should return empty text and undefined color for undefined diff', () => {
    const result = testWithComponent(undefined)

    expect(result.text).toBe('')
    expect(result.color).toBeUndefined() // Real theme doesn't have transparent color
  })

  it('should return positive text with plus sign and success color for positive diff', () => {
    const result = testWithComponent(5)

    expect(result.text).toBe('+5')
    // Vuetify's default success color is #4CAF50 (Material Design green)
    expect(result.color).toBe('#4CAF50')
  })

  it('should return positive text with plus sign for larger positive numbers', () => {
    const result = testWithComponent(100)

    expect(result.text).toBe('+100')
    expect(result.color).toBe('#4CAF50')
  })

  it('should return negative text without extra minus sign and error color for negative diff', () => {
    const result = testWithComponent(-3)

    expect(result.text).toBe('-3')
    expect(result.color).toBe(darkTheme.colors!['error-3'])
  })

  it('should return negative text for larger negative numbers', () => {
    const result = testWithComponent(-50)

    expect(result.text).toBe('-50')
    expect(result.color).toBe(darkTheme.colors!['error-3'])
  })

  it('should return "New" text and secondary color for zero diff', () => {
    const result = testWithComponent(0)

    expect(result.text).toBe('New')
    expect(result.color).toBe(darkTheme.colors!.secondary)
  })

  it('should handle decimal numbers correctly', () => {
    const positiveDecimal = testWithComponent(2.5)
    expect(positiveDecimal.text).toBe('+2.5')
    expect(positiveDecimal.color).toBe('#4CAF50')

    const negativeDecimal = testWithComponent(-1.7)
    expect(negativeDecimal.text).toBe('-1.7')
    expect(negativeDecimal.color).toBe(darkTheme.colors!['error-3'])
  })

  it('should return correct interface structure', () => {
    const result = testWithComponent(1)

    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('color')
    expect(typeof result.text).toBe('string')
    expect(typeof result.color).toBe('string')
  })
})
