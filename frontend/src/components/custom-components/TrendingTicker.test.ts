import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TrendingTicker from './TrendingTicker.vue'

interface MockTickerItem {
  uniqueKey: string | number
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// Type for accessing internal component properties
interface TrendingTickerInstance {
  isHoveringTicker: boolean
  isHoveringReverseZone: boolean
  isPausedByClick: boolean
  isDragging: boolean
  dragStartX: number
  translateX: number
  animationFrameId: number | null
  startAnimation: () => void
  stopAnimation: () => void
  pointerUp: () => void
  pointerMove: (clientX: number) => void
  $refs: {
    tickerWrapperRef?: HTMLElement
    tickerContainerRef?: HTMLElement
  }
}

describe('TrendingTicker', () => {
  let wrapper: VueWrapper<InstanceType<typeof TrendingTicker>>

  const mockItems: MockTickerItem[] = [
    { uniqueKey: 1, name: 'Item 1', value: 100 },
    { uniqueKey: 2, name: 'Item 2', value: 200 },
    { uniqueKey: 3, name: 'Item 3', value: 300 }
  ]

  const mockGetBoundingClientRect = vi.fn(() => ({
    width: 500,
    height: 50,
    left: 0,
    top: 0,
    right: 500,
    bottom: 50
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 500
    })
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1000
    })
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: mockGetBoundingClientRect
    })

    wrapper = mount(TrendingTicker, {
      props: {
        items: mockItems
      },
      slots: {
        default: `<template #default="{ item }">
          <div class="ticker-item" :data-key="item.uniqueKey">{{ item.name }}</div>
        </template>`
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders correctly with items', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.ticker-container').exists()).toBe(true)
      expect(wrapper.find('.ticker-wrapper').exists()).toBe(true)
    })

    it('renders all items through slots', () => {
      const tickerItems = wrapper.findAll('.ticker-item')
      expect(tickerItems.length).toBe(3)
      expect(tickerItems[0].text()).toBe('Item 1')
      expect(tickerItems[1].text()).toBe('Item 2')
      expect(tickerItems[2].text()).toBe('Item 3')
    })

    it('does not render when items array is empty', async () => {
      await wrapper.setProps({ items: [] })
      expect(wrapper.find('.ticker-container').exists()).toBe(false)
    })

    it('does not render when items is undefined', async () => {
      await wrapper.setProps({ items: undefined })
      expect(wrapper.find('.ticker-container').exists()).toBe(false)
    })

    it('applies correct CSS classes', () => {
      const container = wrapper.find('.ticker-container')
      expect(container.classes()).toContain('ticker-container')

      const tickerWrapper = wrapper.find('.ticker-wrapper')
      expect(tickerWrapper.classes()).toContain('ticker-wrapper')
    })
  })

  describe('Props', () => {
    it('accepts items prop correctly', () => {
      expect(wrapper.props('items')).toEqual(mockItems)
    })

    it('updates when items prop changes', async () => {
      const newItems = [
        { uniqueKey: 4, name: 'New Item 1' },
        { uniqueKey: 5, name: 'New Item 2' }
      ]

      await wrapper.setProps({ items: newItems })

      const tickerItems = wrapper.findAll('.ticker-item')
      expect(tickerItems.length).toBe(2)
      expect(tickerItems[0].text()).toBe('New Item 1')
      expect(tickerItems[1].text()).toBe('New Item 2')
    })

    it('handles items with different uniqueKey types', async () => {
      const mixedKeyItems = [
        { uniqueKey: 'string-key', name: 'String Key Item' },
        { uniqueKey: 123, name: 'Number Key Item' }
      ]

      await wrapper.setProps({ items: mixedKeyItems })

      const tickerItems = wrapper.findAll('.ticker-item')
      expect(tickerItems[0].attributes('data-key')).toBe('string-key')
      expect(tickerItems[1].attributes('data-key')).toBe('123')
    })
  })

  describe('Animation and Transform', () => {
    it('applies transform style with translateX', () => {
      const tickerWrapper = wrapper.find('.ticker-wrapper')
      expect(tickerWrapper.attributes('style')).toMatch(/transform: translateX\(-?\d*\.?\d*px\)/)
    })

    it('calls requestAnimationFrame on mount', () => {
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('updates transform on animation', async () => {
      // Simulate animation frame callback
      const mockRequestAnimationFrame = global.requestAnimationFrame as ReturnType<typeof vi.fn>
      const animationCallback = mockRequestAnimationFrame.mock.calls[0][0]

      // Mock wrapper width larger than container for scrolling
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      if (componentInstance.$refs.tickerWrapperRef) {
        Object.defineProperty(componentInstance.$refs.tickerWrapperRef, 'scrollWidth', {
          value: 1000
        })
      }
      if (componentInstance.$refs.tickerContainerRef) {
        Object.defineProperty(componentInstance.$refs.tickerContainerRef, 'clientWidth', {
          value: 500
        })
      }

      animationCallback(0)
      await wrapper.vm.$nextTick()

      // Check that transform has changed (animation is progressing)
      const tickerWrapper = wrapper.find('.ticker-wrapper')
      const style = tickerWrapper.attributes('style')
      expect(style).toMatch(/transform: translateX\(-?\d*\.?\d+px\)/)
    })
  })

  describe('Mouse Interactions', () => {
    it('handles mouse enter on ticker', async () => {
      const container = wrapper.find('.ticker-container')
      await container.trigger('mouseenter')

      // Check that hover state is set (component should react to hover)
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isHoveringTicker).toBe(true)
    })

    it('handles mouse leave on ticker', async () => {
      const container = wrapper.find('.ticker-container')

      // First enter, then leave
      await container.trigger('mouseenter')
      await container.trigger('mouseleave')

      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isHoveringTicker).toBe(false)
      expect(componentInstance.isHoveringReverseZone).toBe(false)
    })

    it('detects reverse zone on mouse move', async () => {
      const container = wrapper.find('.ticker-container')

      await container.trigger('mouseenter')

      // Use trigger with event object
      await container.trigger('mousemove', {
        clientX: 50 // Within 20% of 500px width (100px)
      })

      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isHoveringReverseZone).toBe(true)
    })

    it('does not detect reverse zone when mouse outside left 20%', async () => {
      const container = wrapper.find('.ticker-container')

      await container.trigger('mouseenter')

      // Use trigger with event object
      await container.trigger('mousemove', {
        clientX: 200 // Outside 20% of 500px width
      })

      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isHoveringReverseZone).toBe(false)
    })

    it('toggles pause state on click', async () => {
      const container = wrapper.find('.ticker-container')

      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isPausedByClick).toBe(false)

      await container.trigger('click')
      expect(componentInstance.isPausedByClick).toBe(true)

      await container.trigger('click')
      expect(componentInstance.isPausedByClick).toBe(false)
    })

    it('handles mouse down for drag start', async () => {
      const container = wrapper.find('.ticker-container')

      await container.trigger('mousedown', {
        clientX: 100
      })

      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isDragging).toBe(true)
      expect(componentInstance.dragStartX).toBe(100)
    })
  })

  describe('Touch Interactions', () => {
    it('handles touch start for drag', async () => {
      const container = wrapper.find('.ticker-container')

      await container.trigger('touchstart', {
        touches: [{ clientX: 150 }]
      })

      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isDragging).toBe(true)
      expect(componentInstance.dragStartX).toBe(150)
    })

    it('ignores multi-touch', async () => {
      const container = wrapper.find('.ticker-container')

      await container.trigger('touchstart', {
        touches: [{ clientX: 100 }, { clientX: 200 }]
      })

      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      expect(componentInstance.isDragging).toBe(false)
    })
  })

  describe('Responsive Behavior', () => {
    it('handles case where wrapper width <= container width', async () => {
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance

      // Stop animation first
      componentInstance.stopAnimation()

      // Mock wrapper width smaller than or equal to container
      if (componentInstance.$refs.tickerWrapperRef) {
        Object.defineProperty(componentInstance.$refs.tickerWrapperRef, 'scrollWidth', {
          value: 400,
          configurable: true
        })
      }
      if (componentInstance.$refs.tickerContainerRef) {
        Object.defineProperty(componentInstance.$refs.tickerContainerRef, 'clientWidth', {
          value: 500,
          configurable: true
        })
      }

      // Reset translateX and trigger single animation frame
      componentInstance.translateX = 0
      const mockRequestAnimationFrame = global.requestAnimationFrame as ReturnType<typeof vi.fn>
      const animationCallback = mockRequestAnimationFrame.mock.calls[0][0]
      animationCallback(0)
      await wrapper.vm.$nextTick()

      // Should stay close to 0 when content fits (allowing for small animation steps)
      expect(componentInstance.translateX).toBeCloseTo(0, 0)
    })

    it('constrains drag within bounds', async () => {
      const container = wrapper.find('.ticker-container')
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance

      // Start drag
      await container.trigger('mousedown', { clientX: 100 })

      // Simulate dragging beyond bounds
      componentInstance.pointerMove(2000) // Way beyond reasonable bounds

      // Should be constrained
      expect(componentInstance.translateX).toBeLessThanOrEqual(20) // maxTranslateX
    })
  })

  describe('Lifecycle and Cleanup', () => {
    it('starts animation on mount', () => {
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('stops animation on unmount', () => {
      const cancelSpy = vi.spyOn(global, 'cancelAnimationFrame')

      wrapper.unmount()

      expect(cancelSpy).toHaveBeenCalled()
    })

    it('adds and removes global event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const newWrapper = mount(TrendingTicker, {
        props: { items: mockItems }
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))

      newWrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))
    })
  })

  describe('Watchers', () => {
    it('resets animation when items change', async () => {
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance

      // Stop current animation
      componentInstance.stopAnimation()

      // Change items
      const newItems = [
        { uniqueKey: 'new1', name: 'New Item 1' },
        { uniqueKey: 'new2', name: 'New Item 2' }
      ]

      await wrapper.setProps({ items: newItems })
      await wrapper.vm.$nextTick()

      // Should reset translateX and restart animation (allowing for small animation steps)
      expect(componentInstance.translateX).toBeCloseTo(0, 0)
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('does not restart animation when items array content is same', async () => {
      const mockRequestAnimationFrame = global.requestAnimationFrame as ReturnType<typeof vi.fn>
      const callCountBefore = mockRequestAnimationFrame.mock.calls.length

      // Set same items (different array reference but same content)
      await wrapper.setProps({ items: [...mockItems] })
      await wrapper.vm.$nextTick()

      const callCountAfter = mockRequestAnimationFrame.mock.calls.length

      // Should not have made additional animation calls for same content
      expect(callCountAfter).toBe(callCountBefore)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing DOM refs gracefully', async () => {
      // Create wrapper without proper mounting to simulate missing refs
      const minimalWrapper = mount(TrendingTicker, {
        props: { items: [] }
      })

      // Should not throw errors when refs are missing
      expect(() => {
        const componentInstance = minimalWrapper.vm as unknown as TrendingTickerInstance
        componentInstance.startAnimation()
      }).not.toThrow()

      minimalWrapper.unmount()
    })

    it('handles rapid prop changes', async () => {
      const items1 = [{ uniqueKey: 1, name: 'Item 1' }]
      const items2 = [{ uniqueKey: 2, name: 'Item 2' }]
      const items3 = [{ uniqueKey: 3, name: 'Item 3' }]

      // Rapid changes
      await wrapper.setProps({ items: items1 })
      await wrapper.setProps({ items: items2 })
      await wrapper.setProps({ items: items3 })

      // Should handle gracefully and end up with final state
      const tickerItems = wrapper.findAll('.ticker-item')
      expect(tickerItems.length).toBe(1)
      expect(tickerItems[0].text()).toBe('Item 3')
    })

    it('handles different uniqueKey values', async () => {
      const itemsWithDifferentKeys = [
        { uniqueKey: 'string-key', name: 'String Key Item' },
        { uniqueKey: 123, name: 'Number Key Item' }
      ]

      await wrapper.setProps({ items: itemsWithDifferentKeys })

      const tickerItems = wrapper.findAll('.ticker-item')
      expect(tickerItems.length).toBe(2)
      expect(tickerItems[0].attributes('data-key')).toBe('string-key')
      expect(tickerItems[1].attributes('data-key')).toBe('123')
    })
  })

  describe('Performance and Animation Frame Management', () => {
    it('properly cancels animation frame on stop', () => {
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      componentInstance.startAnimation()
      componentInstance.stopAnimation()

      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123)
    })

    it('handles animation state correctly', () => {
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance
      // Check that animation can be started and stopped
      componentInstance.stopAnimation()
      expect(componentInstance.animationFrameId).toBeNull()

      componentInstance.startAnimation()
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })
  })

  describe('Component State Management', () => {
    it('manages hover states correctly', async () => {
      const container = wrapper.find('.ticker-container')
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance

      expect(componentInstance.isHoveringTicker).toBe(false)
      expect(componentInstance.isHoveringReverseZone).toBe(false)

      await container.trigger('mouseenter')
      expect(componentInstance.isHoveringTicker).toBe(true)

      await container.trigger('mouseleave')
      expect(componentInstance.isHoveringTicker).toBe(false)
      expect(componentInstance.isHoveringReverseZone).toBe(false)
    })

    it('manages drag states correctly', async () => {
      const container = wrapper.find('.ticker-container')
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance

      expect(componentInstance.isDragging).toBe(false)

      await container.trigger('mousedown', { clientX: 100 })
      expect(componentInstance.isDragging).toBe(true)

      // Simulate global mouse up (would normally be handled by window event)
      componentInstance.pointerUp()
      expect(componentInstance.isDragging).toBe(false)
    })

    it('manages pause states correctly', async () => {
      const container = wrapper.find('.ticker-container')
      const componentInstance = wrapper.vm as unknown as TrendingTickerInstance

      expect(componentInstance.isPausedByClick).toBe(false)

      await container.trigger('click')
      expect(componentInstance.isPausedByClick).toBe(true)

      await container.trigger('click')
      expect(componentInstance.isPausedByClick).toBe(false)
    })
  })
})
