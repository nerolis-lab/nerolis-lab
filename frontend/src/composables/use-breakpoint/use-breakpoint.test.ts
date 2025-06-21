import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

const TestComponent = defineComponent({
  setup() {
    const { isMobile, viewportWidth, isLargeDesktop, isTinyMobile } = useBreakpoint()
    return { isMobile, viewportWidth, isLargeDesktop, isTinyMobile }
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

it('should correctly determine if the viewport is tiny mobile on mount', () => {
  window.innerWidth = 400
  const wrapper = mount(TestComponent)
  const vm = wrapper.vm as unknown as { isTinyMobile: boolean; viewportWidth: number }
  expect(vm.viewportWidth).toBe(400)
  expect(vm.isTinyMobile).toBe(true)
})

it('should correctly determine if the viewport is not tiny mobile on mount', () => {
  window.innerWidth = 600
  const wrapper = mount(TestComponent)
  const vm = wrapper.vm as unknown as { isTinyMobile: boolean; viewportWidth: number }
  expect(vm.viewportWidth).toBe(600)
  expect(vm.isTinyMobile).toBe(false)
})

it('should correctly determine tiny mobile boundary at 500px', () => {
  window.innerWidth = 499
  const wrapper = mount(TestComponent)
  const vm = wrapper.vm as unknown as { isTinyMobile: boolean; viewportWidth: number }
  expect(vm.viewportWidth).toBe(499)
  expect(vm.isTinyMobile).toBe(true)

  wrapper.unmount()

  window.innerWidth = 500
  const wrapper2 = mount(TestComponent)
  const vm2 = wrapper2.vm as unknown as { isTinyMobile: boolean; viewportWidth: number }
  expect(vm2.viewportWidth).toBe(500)
  expect(vm2.isTinyMobile).toBe(false)
})

it('should correctly update tiny mobile state on resize', async () => {
  window.innerWidth = 600
  const wrapper = mount(TestComponent)
  const vm = wrapper.vm as unknown as { isTinyMobile: boolean; viewportWidth: number }
  expect(vm.viewportWidth).toBe(600)
  expect(vm.isTinyMobile).toBe(false)

  window.innerWidth = 400
  window.dispatchEvent(new Event('resize'))
  await flushPromises()
  await nextTick()

  expect(vm.viewportWidth).toBe(400)
  expect(vm.isTinyMobile).toBe(true)

  window.innerWidth = 550
  window.dispatchEvent(new Event('resize'))
  await flushPromises()
  await nextTick()

  expect(vm.viewportWidth).toBe(550)
  expect(vm.isTinyMobile).toBe(false)
})
