import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { VChip } from 'vuetify/components'
import CustomChip from './CustomChip.vue'

describe('CustomChip.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof CustomChip>>

  beforeEach(() => {
    wrapper = mount(CustomChip)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent(VChip).exists()).toBe(true)
  })

  describe('Props', () => {
    it('renders with default props', () => {
      const chip = wrapper.findComponent(VChip)

      expect(chip.props('variant')).toBe('outlined') // isSelected: false -> outlined
      expect(chip.props('size')).toBe('default')
      expect(chip.props('density')).toBe('default')
      expect(chip.props('disabled')).toBe(false)
    })

    it('renders with text prop', () => {
      const testText = 'Test Chip Text'
      wrapper = mount(CustomChip, {
        props: { text: testText }
      })

      expect(wrapper.text()).toContain(testText)
    })

    it('renders with value prop', () => {
      const testValue = 'test-value'
      wrapper = mount(CustomChip, {
        props: { value: testValue }
      })

      const chip = wrapper.findComponent(VChip)
      expect(chip.props('value')).toBe(testValue)
    })

    it('applies color prop correctly', () => {
      const testColor = 'primary'
      wrapper = mount(CustomChip, {
        props: { color: testColor }
      })

      const chip = wrapper.findComponent(VChip)
      expect(chip.props('color')).toBe(testColor)
    })

    it('changes variant based on isSelected prop', () => {
      // Test selected state
      wrapper = mount(CustomChip, {
        props: { isSelected: true }
      })
      expect(wrapper.findComponent(VChip).props('variant')).toBe('elevated')

      // Test unselected state
      wrapper = mount(CustomChip, {
        props: { isSelected: false }
      })
      expect(wrapper.findComponent(VChip).props('variant')).toBe('outlined')
    })

    it('applies size prop correctly', () => {
      const sizes: Array<'x-small' | 'small' | 'default' | 'large' | 'x-large'> = [
        'x-small',
        'small',
        'default',
        'large',
        'x-large'
      ]

      sizes.forEach((size) => {
        wrapper = mount(CustomChip, {
          props: { size }
        })
        expect(wrapper.findComponent(VChip).props('size')).toBe(size)
      })
    })

    it('applies density prop correctly', () => {
      const densities: Array<'default' | 'comfortable' | 'compact'> = ['default', 'comfortable', 'compact']

      densities.forEach((density) => {
        wrapper = mount(CustomChip, {
          props: { density }
        })
        expect(wrapper.findComponent(VChip).props('density')).toBe(density)
      })
    })

    it('applies disabled prop correctly', () => {
      wrapper = mount(CustomChip, {
        props: { disabled: true }
      })

      const chip = wrapper.findComponent(VChip)
      expect(chip.props('disabled')).toBe(true)
    })

    it('applies avatar props correctly', () => {
      const prependAvatar = 'path/to/prepend.jpg'
      const appendAvatar = 'path/to/append.jpg'

      wrapper = mount(CustomChip, {
        props: {
          prependAvatar,
          appendAvatar
        }
      })

      const chip = wrapper.findComponent(VChip)
      expect(chip.props('prependAvatar')).toBe(prependAvatar)
      expect(chip.props('appendAvatar')).toBe(appendAvatar)
    })
  })

  describe('Computed Properties', () => {
    describe('computedStyle', () => {
      it('applies custom style when provided', () => {
        const customStyle = { fontSize: '16px', fontWeight: 'bold' }
        wrapper = mount(CustomChip, {
          props: { customStyle }
        })

        const chip = wrapper.findComponent(VChip)
        expect(chip.attributes('style')).toContain('font-size: 16px')
        expect(chip.attributes('style')).toContain('font-weight: bold')
      })

      it('applies color CSS variable when not selected and color is provided', () => {
        const color = 'primary'
        wrapper = mount(CustomChip, {
          props: {
            color,
            isSelected: false
          }
        })

        const chip = wrapper.findComponent(VChip)
        expect(chip.attributes('style')).toContain('color: var(--primary)')
      })

      it('does not apply color CSS variable when selected', () => {
        const color = 'primary'
        wrapper = mount(CustomChip, {
          props: {
            color,
            isSelected: true
          }
        })

        const chip = wrapper.findComponent(VChip)
        const style = chip.attributes('style')
        if (style) {
          expect(style).not.toContain('color: var(--primary)')
        } else {
          // If no style attribute, then color CSS variable is not applied
          expect(style).toBeUndefined()
        }
      })

      it('combines custom style with color CSS variable', () => {
        const customStyle = { fontSize: '14px' }
        const color = 'secondary'

        wrapper = mount(CustomChip, {
          props: {
            customStyle,
            color,
            isSelected: false
          }
        })

        const chip = wrapper.findComponent(VChip)
        expect(chip.attributes('style')).toContain('font-size: 14px')
        expect(chip.attributes('style')).toContain('color: var(--secondary)')
      })
    })

    describe('computedClass', () => {
      it('always includes text-body-1 class', () => {
        const chip = wrapper.findComponent(VChip)
        expect(chip.classes()).toContain('text-body-1')
      })

      it('applies string class correctly', () => {
        const customClass = 'custom-class'
        wrapper = mount(CustomChip, {
          props: { class: customClass }
        })

        const chip = wrapper.findComponent(VChip)
        expect(chip.classes()).toContain('text-body-1')
        expect(chip.classes()).toContain(customClass)
      })

      it('applies array of classes correctly', () => {
        const customClasses = ['class-1', 'class-2', 'class-3']
        wrapper = mount(CustomChip, {
          props: { class: customClasses }
        })

        const chip = wrapper.findComponent(VChip)
        expect(chip.classes()).toContain('text-body-1')
        customClasses.forEach((cls) => {
          expect(chip.classes()).toContain(cls)
        })
      })

      it('applies object classes correctly', () => {
        const customClasses = {
          'active-class': true,
          'inactive-class': false,
          'another-active': true
        }
        wrapper = mount(CustomChip, {
          props: { class: customClasses }
        })

        const chip = wrapper.findComponent(VChip)
        expect(chip.classes()).toContain('text-body-1')
        expect(chip.classes()).toContain('active-class')
        expect(chip.classes()).toContain('another-active')
        expect(chip.classes()).not.toContain('inactive-class')
      })
    })
  })

  describe('Event Handling', () => {
    it('emits click event with value when clicked and not disabled', async () => {
      const testValue = 'test-value'
      wrapper = mount(CustomChip, {
        props: {
          value: testValue,
          disabled: false
        }
      })

      await wrapper.findComponent(VChip).trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([testValue])
    })

    it('does not emit click event when disabled', async () => {
      const testValue = 'test-value'
      wrapper = mount(CustomChip, {
        props: {
          value: testValue,
          disabled: true
        }
      })

      await wrapper.findComponent(VChip).trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('emits click with undefined value when no value prop provided', async () => {
      wrapper = mount(CustomChip, {
        props: { disabled: false }
      })

      await wrapper.findComponent(VChip).trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([undefined])
    })

    it('emits click with complex object value', async () => {
      const complexValue = { id: 1, name: 'Test Object', active: true }
      wrapper = mount(CustomChip, {
        props: {
          value: complexValue,
          disabled: false
        }
      })

      await wrapper.findComponent(VChip).trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([complexValue])
    })
  })

  describe('Slots', () => {
    it('renders default slot content', () => {
      const slotContent = 'Custom Slot Content'
      wrapper = mount(CustomChip, {
        slots: {
          default: slotContent
        }
      })

      expect(wrapper.text()).toContain(slotContent)
    })

    it('renders append slot content', () => {
      const appendContent = '<span class="append-content">Append</span>'
      wrapper = mount(CustomChip, {
        slots: {
          append: appendContent
        }
      })

      expect(wrapper.find('.append-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Append')
    })

    it('prioritizes slot content over text prop', () => {
      const textProp = 'Text Prop'
      const slotContent = 'Slot Content'

      wrapper = mount(CustomChip, {
        props: { text: textProp },
        slots: {
          default: slotContent
        }
      })

      expect(wrapper.text()).toContain(slotContent)
      expect(wrapper.text()).not.toContain(textProp)
    })
  })

  describe('Attributes Inheritance', () => {
    it('passes through additional attributes via v-bind="$attrs"', () => {
      wrapper = mount(CustomChip, {
        attrs: {
          'data-testid': 'custom-chip-test',
          'aria-label': 'Custom chip label'
        }
      })

      const chip = wrapper.findComponent(VChip)
      expect(chip.attributes('data-testid')).toBe('custom-chip-test')
      expect(chip.attributes('aria-label')).toBe('Custom chip label')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty text prop', () => {
      wrapper = mount(CustomChip, {
        props: { text: '' }
      })

      expect(wrapper.text()).toBe('')
    })

    it('handles null/undefined color prop', () => {
      wrapper = mount(CustomChip, {
        props: { color: undefined }
      })

      const chip = wrapper.findComponent(VChip)
      expect(chip.props('color')).toBeUndefined()
    })

    it('handles multiple rapid clicks', async () => {
      const testValue = 'rapid-click-value'
      wrapper = mount(CustomChip, {
        props: { value: testValue }
      })

      const chip = wrapper.findComponent(VChip)

      // Trigger multiple clicks rapidly
      await chip.trigger('click')
      await chip.trigger('click')
      await chip.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')!.length).toBe(3)
      expect(wrapper.emitted('click')![0]).toEqual([testValue])
      expect(wrapper.emitted('click')![1]).toEqual([testValue])
      expect(wrapper.emitted('click')![2]).toEqual([testValue])
    })
  })

  describe('Integration Tests', () => {
    it('works correctly with all props combined', () => {
      const props = {
        value: 'integration-test',
        text: 'Integration Test',
        color: 'success',
        isSelected: true,
        size: 'large' as const,
        density: 'compact' as const,
        disabled: false,
        class: ['custom-class-1', 'custom-class-2'],
        customStyle: { fontWeight: 'bold', fontSize: '18px' },
        prependAvatar: 'prepend.jpg',
        appendAvatar: 'append.jpg'
      }

      wrapper = mount(CustomChip, { props })

      const chip = wrapper.findComponent(VChip)

      // Check all props are applied
      expect(chip.props('value')).toBe(props.value)
      expect(chip.props('color')).toBe(props.color)
      expect(chip.props('variant')).toBe('elevated') // isSelected: true
      expect(chip.props('size')).toBe(props.size)
      expect(chip.props('density')).toBe(props.density)
      expect(chip.props('disabled')).toBe(props.disabled)
      expect(chip.props('prependAvatar')).toBe(props.prependAvatar)
      expect(chip.props('appendAvatar')).toBe(props.appendAvatar)

      // Check text content
      expect(wrapper.text()).toContain(props.text)

      // Check classes
      expect(chip.classes()).toContain('text-body-1')
      expect(chip.classes()).toContain('custom-class-1')
      expect(chip.classes()).toContain('custom-class-2')

      // Check styles
      expect(chip.attributes('style')).toContain('font-weight: bold')
      expect(chip.attributes('style')).toContain('font-size: 18px')
    })
  })
})
