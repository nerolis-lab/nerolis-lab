import BubbleBackground from '@/components/custom-components/backgrounds/BubbleBackground.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('BubbleBackground.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof BubbleBackground>>

  beforeEach(() => {
    wrapper = mount(BubbleBackground)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders the component with default props', () => {
    expect(wrapper.find('.bubble-background').exists()).toBe(true)
    expect(wrapper.find('.bubbles-container').exists()).toBe(true)
  })

  it('renders slot content', () => {
    wrapper = mount(BubbleBackground, {
      slots: {
        default: '<div class="slot-content">Test Content</div>'
      }
    })
    expect(wrapper.find('.slot-content').text()).toBe('Test Content')
  })

  it('uses default props correctly', () => {
    expect(wrapper.vm.baseColor).toBe('#4896FF')
    expect(wrapper.vm.bubbleCount).toBe(15)
  })

  it('uses provided props correctly', () => {
    wrapper = mount(BubbleBackground, {
      props: {
        baseColor: '#FF5733',
        bubbleCount: 25
      }
    })
    expect(wrapper.vm.baseColor).toBe('#FF5733')
    expect(wrapper.vm.bubbleCount).toBe(25)
  })

  it('renders bubbles on mount', async () => {
    await nextTick()
    expect(wrapper.findAll('.bubble')).toHaveLength(15)
  })

  it('renders custom number of bubbles', async () => {
    wrapper = mount(BubbleBackground, {
      props: {
        bubbleCount: 5
      }
    })
    await nextTick()
    expect(wrapper.findAll('.bubble')).toHaveLength(5)
  })

  it('starts animation on mount', async () => {
    await nextTick()
    expect(requestAnimationFrame).toHaveBeenCalled()
  })

  it('cleans up animation on unmount', () => {
    wrapper.unmount()
    expect(cancelAnimationFrame).toHaveBeenCalledWith(123)
  })
})
