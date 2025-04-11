import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

const TestComponent = defineComponent({
  setup() {
    const { isMobile, viewportWidth, isLargeDesktop } = useBreakpoint()
    return { isMobile, viewportWidth, isLargeDesktop }
  },
  template: '<div></div>'
})

describe('useBreakpoint composable', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 800,
      configurable: true
    })

    wrapper = mount(TestComponent)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should correctly determine if the viewport is mobile on mount', () => {
    const vm = wrapper.vm as unknown as { isMobile: boolean; viewportWidth: number }
    expect(vm.viewportWidth).toBe(800)
    expect(vm.isMobile).toBe(true)
  })

  it('should correctly determine if the viewport is not mobile', async () => {
    const vm = wrapper.vm as unknown as { isMobile: boolean; viewportWidth: number }
    expect(vm.viewportWidth).toBe(800)
    expect(vm.isMobile).toBe(true)

    window.innerWidth = 1200
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    await nextTick()

    expect(vm.viewportWidth).toBe(1200)
    expect(vm.isMobile).toBe(false)
  })
})
it('should correctly determine if the viewport is large desktop on mount', () => {
  window.innerWidth = 1920
  const wrapper = mount(TestComponent)
  const vm = wrapper.vm as unknown as { isLargeDesktop: boolean; viewportWidth: number }
  expect(vm.viewportWidth).toBe(1920)
  expect(vm.isLargeDesktop).toBe(true)
})

it('should correctly determine if the viewport is not large desktop', async () => {
  window.innerWidth = 1919
  const wrapper = mount(TestComponent)
  const vm = wrapper.vm as unknown as { isLargeDesktop: boolean; viewportWidth: number }
  expect(vm.viewportWidth).toBe(1919)
  expect(vm.isLargeDesktop).toBe(false)

  window.innerWidth = 2000
  window.dispatchEvent(new Event('resize'))
  await flushPromises()
  await nextTick()

  expect(vm.viewportWidth).toBe(2000)
  expect(vm.isLargeDesktop).toBe(true)
})
