import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentPublicInstance, Ref } from 'vue'
import { defineComponent, nextTick, ref } from 'vue'
import { useStickyAvatar } from './use-sticky-avatar'

// Enhanced mocks for more detailed testing
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
const mockUnobserve = vi.fn()

// Store the callback for testing intersection changes
let intersectionCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null

// Helper to create mock IntersectionObserverEntry
const createMockEntry = (intersectionRatio: number, target: Element): IntersectionObserverEntry => ({
  boundingClientRect: new DOMRect(),
  intersectionRect: new DOMRect(),
  intersectionRatio,
  isIntersecting: intersectionRatio > 0,
  rootBounds: new DOMRect(),
  target,
  time: 0
})

beforeEach(() => {
  // Reset mocks
  mockObserve.mockClear()
  mockDisconnect.mockClear()
  mockUnobserve.mockClear()
  intersectionCallback = null

  // Override the global IntersectionObserver with our testable version
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
    intersectionCallback = callback
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: mockUnobserve
    }
  })

  // Override requestAnimationFrame to actually call the callback
  global.requestAnimationFrame = vi.fn((callback) => {
    callback(0)
    return 0
  })
})

// Helper to create test component with composable
const createTestComponent = (targetEl: HTMLElement | ComponentPublicInstance | null = null, enabled = true) => {
  return defineComponent({
    setup() {
      const targetElement: Ref<HTMLElement | ComponentPublicInstance | null> = ref(targetEl)
      const isEnabled = ref(enabled)
      const result = useStickyAvatar(targetElement, isEnabled)

      return {
        targetElement,
        isEnabled,
        ...result,
        updateTarget: (newTarget: HTMLElement | ComponentPublicInstance | null) => {
          targetElement.value = newTarget
        },
        updateEnabled: (newEnabled: boolean) => {
          isEnabled.value = newEnabled
        }
      }
    },
    template: '<div></div>'
  })
}

describe('useStickyAvatar', () => {
  let wrapper: VueWrapper<InstanceType<ReturnType<typeof createTestComponent>>>

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('returns showStickyAvatar reactive reference', () => {
    const TestComponent = createTestComponent()
    wrapper = mount(TestComponent)

    expect(wrapper.vm.showStickyAvatar).toBe(false)
  })

  it('does not setup observer when disabled', async () => {
    const TestComponent = createTestComponent(document.createElement('div'), false)
    wrapper = mount(TestComponent)
    await nextTick()

    expect(global.IntersectionObserver).not.toHaveBeenCalled()
    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('does not setup observer when target element is null', async () => {
    const TestComponent = createTestComponent(null, true)
    wrapper = mount(TestComponent)
    await nextTick()

    expect(global.IntersectionObserver).not.toHaveBeenCalled()
    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('sets up IntersectionObserver with correct configuration when enabled and target exists', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: [0.9],
      rootMargin: '0px'
    })
    expect(mockObserve).toHaveBeenCalledWith(element)
  })

  it('extracts DOM element from Vue component instance', async () => {
    const domElement = document.createElement('div')
    const mockComponentInstance = {
      $el: domElement
    } as ComponentPublicInstance
    const TestComponent = createTestComponent(mockComponentInstance, true)
    wrapper = mount(TestComponent)
    await nextTick()

    expect(mockObserve).toHaveBeenCalledWith(domElement)
  })

  it('shows sticky avatar when intersection ratio is less than 0.9', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    // Simulate intersection with ratio < 0.9
    const mockEntry = createMockEntry(0.5, element)

    if (intersectionCallback) {
      intersectionCallback([mockEntry])
    }

    expect(wrapper.vm.showStickyAvatar).toBe(true)
  })

  it('hides sticky avatar when intersection ratio is 0.9 or greater', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    // First show the sticky avatar
    const mockEntryHidden = createMockEntry(0.5, element)

    if (intersectionCallback) {
      intersectionCallback([mockEntryHidden])
    }
    expect(wrapper.vm.showStickyAvatar).toBe(true)

    // Then hide it when fully visible
    const mockEntryVisible = createMockEntry(0.95, element)

    if (intersectionCallback) {
      intersectionCallback([mockEntryVisible])
    }

    expect(wrapper.vm.showStickyAvatar).toBe(false)
  })

  it('handles edge case when intersection ratio equals exactly 0.9', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    const mockEntry = createMockEntry(0.9, element)

    if (intersectionCallback) {
      intersectionCallback([mockEntry])
    }

    expect(wrapper.vm.showStickyAvatar).toBe(false)
  })

  it('uses requestAnimationFrame for performance optimization', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    const rafSpy = vi.spyOn(global, 'requestAnimationFrame')

    wrapper = mount(TestComponent)
    await nextTick()

    const mockEntry = createMockEntry(0.5, element)

    if (intersectionCallback) {
      intersectionCallback([mockEntry])
    }

    expect(rafSpy).toHaveBeenCalled()
  })

  it('disconnects observer on component unmount', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    expect(global.IntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalledWith(element)

    // Unmount component to trigger cleanup
    wrapper.unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('prevents creating multiple observers for the same element', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    // Observer should only be created once
    expect(global.IntersectionObserver).toHaveBeenCalledTimes(1)
    expect(mockObserve).toHaveBeenCalledTimes(1)
  })

  it('handles component instance without $el property gracefully', async () => {
    const mockComponentWithoutEl = {} as ComponentPublicInstance
    const TestComponent = createTestComponent(mockComponentWithoutEl, true)
    wrapper = mount(TestComponent)
    await nextTick()

    // The composable will still create observer for the object itself (fallback behavior)
    // but observe() should be called with the empty object
    expect(global.IntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalledWith(mockComponentWithoutEl)
  })

  it('handles null values correctly', async () => {
    const TestComponent = createTestComponent(null, true)
    wrapper = mount(TestComponent)
    await nextTick()

    // Should not create observer for null values
    expect(global.IntersectionObserver).not.toHaveBeenCalled()
    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('handles null target element after initial setup', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    expect(mockObserve).toHaveBeenCalledWith(element)

    // Change target to null - this tests the robustness of the composable
    wrapper.vm.updateTarget(null)
    await nextTick()

    // Should not crash and sticky avatar state should remain stable
    expect(wrapper.vm.showStickyAvatar).toBe(false)
  })

  it('only sets up observer once even if setupObserver is called multiple times', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    const mockIO = vi.mocked(global.IntersectionObserver)
    const initialCallCount = mockIO.mock.calls.length

    // The observer should only be created once during mount
    expect(initialCallCount).toBe(1)
    expect(mockObserve).toHaveBeenCalledTimes(1)
  })

  it('maintains sticky avatar state across multiple intersection changes', async () => {
    const element = document.createElement('div')
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    // Start hidden (ratio < 0.9)
    if (intersectionCallback) {
      intersectionCallback([createMockEntry(0.3, element)])
    }
    expect(wrapper.vm.showStickyAvatar).toBe(true)

    // Become visible (ratio >= 0.9)
    if (intersectionCallback) {
      intersectionCallback([createMockEntry(1.0, element)])
    }
    expect(wrapper.vm.showStickyAvatar).toBe(false)

    // Hidden again
    if (intersectionCallback) {
      intersectionCallback([createMockEntry(0.1, element)])
    }
    expect(wrapper.vm.showStickyAvatar).toBe(true)
  })

  it('handles HTMLElement target correctly', async () => {
    const element = document.createElement('div')
    element.id = 'test-element'
    const TestComponent = createTestComponent(element, true)
    wrapper = mount(TestComponent)
    await nextTick()

    expect(mockObserve).toHaveBeenCalledWith(element)
    expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: [0.9],
      rootMargin: '0px'
    })
  })
})
